import {
	Project,
	SyntaxKind,
	InterfaceDeclaration,
	TypeAliasDeclaration,
	Node,
	Type,
} from 'ts-morph';
import { findUp } from 'find-up';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '../src/scripts/ts');
const OUTPUT_PATH = path.resolve(
	__dirname,
	'../src/__generated__/typeRegistry.ts',
);

const SRC_CORINGA = path.posix.join(
	SRC_DIR.replace(/\\/g, '/'),
	'**/*.ts?(x)',
);

async function run() {
	const TSCONFIG_PATH = await findUp('tsconfig.json', {
		cwd: __dirname,
	});
	const project = new Project({ tsConfigFilePath: TSCONFIG_PATH });
	project.addSourceFilesAtPaths(SRC_CORINGA);
	const sourceFiles = project.getSourceFiles(SRC_CORINGA);

	console.log(
		`\n📦 SRC_DIR: ${SRC_DIR}\n📄 TSConfig: ${TSCONFIG_PATH}\n📝 Gerando: ${OUTPUT_PATH}\n`,
	);

	const checker = project.getTypeChecker();

	const importLines: string[] = [
		`import { registerType } from '../scripts/ts/common/evalTypes';`,
	];
	const importMap = new Map<string, Set<string>>();
	const typeMap = new Map<
		string,
		{ names: string[]; definitions: string[] }
	>();

	function serializeTypeHint(type: Type, depth = 0): string {
		if (type.isString()) return `'string'`;
		if (type.isNumber()) return `'number'`;
		if (type.isBoolean()) return `'boolean'`;
		if (type.isEnumLiteral()) return `'number'`;
		if (type.getSymbol()?.getName() === 'Date') return `'Date'`;
		if (type.isArray()) {
			const elementType = type.getArrayElementType();
			return `[${elementType ? serializeTypeHint(elementType, depth + 1) : `'any'`}]`;
		}
		if (type.isTuple()) {
			const elements = type
				.getTupleElements()
				.map((t) => serializeTypeHint(t, depth + 1));
			return `[${elements.join(', ')}]`;
		}
		const symbol = type.getSymbol();
		const name = symbol?.getName();

		if (name && name !== '__type') {
			const decl = symbol?.getDeclarations()?.[0];
			if (!decl) return `'any'`;
			const filePath = decl.getSourceFile().getFilePath();
			if (!filePath.startsWith(SRC_DIR)) return `'any'`;

			const rel = path
				.relative(path.dirname(OUTPUT_PATH), filePath)
				.replace(/\\/g, '/')
				.replace(/\.ts$/, '');
			if (!importMap.has(rel)) importMap.set(rel, new Set());
			importMap.get(rel)!.add(name);
			return `'${name}'`;
		}

		if (type.isAnonymous()) {
			const props = type.getProperties();
			const entries = props.map((prop) => {
				const valueDecl = prop.getValueDeclaration();
				if (!valueDecl) return '';
				const propType = prop.getTypeAtLocation(valueDecl);
				return `${prop.getName()}: ${serializeTypeHint(propType, depth + 1)}`;
			});
			return `{ ${entries.filter(Boolean).join(', ')} }`;
		}

		return `'any'`;
	}

	function extractFieldTypes(
		node: InterfaceDeclaration | TypeAliasDeclaration,
	): string {
		const type = node.getType();
		const props = type.getProperties();
		const lines: string[] = [];

		for (const prop of props) {
			const valueDecl = prop.getValueDeclaration();
			if (!valueDecl) continue;
			const propType = prop.getTypeAtLocation(valueDecl);
			const serialized = serializeTypeHint(propType);

			if (!/^[$A-Z_][0-9A-Z_$]*$/i.test(prop.getName())) continue;
			if (propType.getCallSignatures().length > 0) continue;
			if (propType.getConstructSignatures().length > 0) continue;
			if (prop.getName() === 'prototype') continue;

			lines.push(`  ${prop.getName()}: ${serialized},`);
		}

		return `{\n${lines.join('\n')}\n}`;
	}

	function addToTypeMap(
		name: string,
		fields: string,
		isRuntimeValue: boolean,
	) {
		if (fields.trim().match(/\{[\s]*\}/g)) return;

		const key = fields;
		if (!typeMap.has(key)) {
			typeMap.set(key, { names: [], definitions: [] });
		}
		const entry = typeMap.get(key)!;
		entry.names.push(name);
		if (isRuntimeValue) entry.definitions.push(name);
	}

	for (const file of sourceFiles) {
		for (const node of file.getStatements()) {
			let decl:
				| InterfaceDeclaration
				| TypeAliasDeclaration
				| undefined;

			if (Node.isInterfaceDeclaration(node)) decl = node;
			else if (Node.isTypeAliasDeclaration(node)) decl = node;
			else continue;

			if (!decl.isExported()) continue;

			const name = decl.getName();
			const fields = extractFieldTypes(decl);
			const symbol = decl.getSymbol();
			const isRuntimeValue = symbol
				?.getDeclarations()
				?.some((d) =>
					[
						SyntaxKind.VariableDeclaration,
						SyntaxKind.ClassDeclaration,
						SyntaxKind.FunctionDeclaration,
					].includes(d.getKind()),
				);

			addToTypeMap(name, fields, isRuntimeValue ?? false);

			const filePath = file.getFilePath();
			const rel = path
				.relative(path.dirname(OUTPUT_PATH), filePath)
				.replace(/\\/g, '/')
				.replace(/\.ts$/, '');
			if (!importMap.has(rel)) importMap.set(rel, new Set());
			importMap.get(rel)!.add(name);
		}
	}

	for (const [rel, names] of importMap.entries()) {
		const sorted = Array.from(names).sort().join(', ');
		importLines.push(
			`import { ${sorted} } from '${rel.startsWith('.') ? rel : './' + rel}';`,
		);
	}

	const registerLines: string[] = [];
	for (const [
		fieldTypes,
		{ names, definitions },
	] of typeMap.entries()) {
		const namesStr = `[${names.map((n) => `"${n}"`).join(', ')}]`;
		const defStr =
			definitions.length ?
				`definition: [${definitions.join(', ')}], `
			:	'';
		registerLines.push(
			`registerType({ name: ${namesStr}, ${defStr}fieldTypes: ${fieldTypes} });`,
		);
	}

	fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
	fs.writeFileSync(
		OUTPUT_PATH,
		[...importLines.sort(), '', ...registerLines.sort(), ''].join(
			'\n',
		),
		'utf8',
	);

	console.log(
		`✅ Tipos registrados com sucesso: ${registerLines.length}`,
	);
	console.log(`📄 Arquivo gerado: ${OUTPUT_PATH}`);
}

await run();

// Executa diretamente ou entra em modo watch
if (process.argv.includes('--watch')) {
	console.log('👀 types: Assistindo alterações em arquivos TS...');
	const watcher = chokidar.watch(SRC_CORINGA, {
		ignoreInitial: true,
		ignored: ['**/node_modules/**', '**/__generated__/**'],
	});
	watcher.on('all', async (event, path) => {
		console.log(`🔁 Alteração detectada: ${event} → ${path}`);
		await run();
	});
}
