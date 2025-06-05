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
import glob from 'fast-glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '../src/scripts/ts');
const TSCONFIG_PATH = await findUp('tsconfig.json', { cwd: __dirname });
const OUTPUT_PATH = path.resolve(__dirname, '../src/__generated__/typeRegistry.ts');

const SRC_CORINGA = path.posix.join(SRC_DIR.replace(/\\/g, '/'), '**/*.ts?(x)');
const project = new Project({ tsConfigFilePath: TSCONFIG_PATH });
project.addSourceFilesAtPaths(SRC_CORINGA);
const sourceFiles = project.getSourceFiles(SRC_CORINGA);

console.log(`\r\n`, SRC_DIR, `\r\n`, TSCONFIG_PATH, `\r\n`, OUTPUT_PATH, `\r\n`, SRC_CORINGA, `\r\n`);

const checker = project.getTypeChecker();

const importLines: string[] = [`import { registerType } from '../scripts/ts/common/evalTypes';`];
const registerLines: string[] = [];

const importMap = new Map<string, Set<string>>(); // arquivo => Set<nomes>

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
    const elements = type.getTupleElements().map(t => serializeTypeHint(t, depth + 1));
    return `[${elements.join(', ')}]`;
  }

  const symbol = type.getSymbol();
  const name = symbol?.getName();

  if (name && name !== '__type') {
    const decl = symbol?.getDeclarations()?.[0];
    if (!decl) return `'any'`; // símbolo sem declaração rastreável    
    const filePath = decl.getSourceFile().getFilePath();

    // Ignora tipos definidos fora do SRC_DIR (ex: node_modules, lib.es5.d.ts, etc.)
    if (!filePath.startsWith(SRC_DIR)) {
      return `'any'`; // ou: return `'${name}'` apenas se quiser preservar o nome, mas evitar o import
    }

    const rel = path.relative(path.dirname(OUTPUT_PATH), filePath).replace(/\\/g, '/').replace(/\.ts$/, '');
    if (!importMap.has(rel)) importMap.set(rel, new Set());
    importMap.get(rel)!.add(name);
    return `'${name}'`;
  }

  if (type.isAnonymous()) {
    const props = type.getProperties();
    const entries = props.map(prop => {
      const valueDecl = prop.getValueDeclaration();
      if (!valueDecl) return '';
      const propType = prop.getTypeAtLocation(valueDecl);
      return `${prop.getName()}: ${serializeTypeHint(propType, depth + 1)}`;
    });
    return `{ ${entries.join(', ')} }`;
  }

  return `'any'`;
}

function extractFieldTypes(node: InterfaceDeclaration | TypeAliasDeclaration): string {
  const type = node.getType();
  const props = type.getProperties();
  const lines: string[] = [];

  for (const prop of props) {
    const valueDecl = prop.getValueDeclaration();
    if (!valueDecl) continue;
    const propType = prop.getTypeAtLocation(valueDecl);
    const serialized = serializeTypeHint(propType);

    // 1. Ignora propriedades inválidas (como "__@iterator @78")
    if (!/^[$A-Z_][0-9A-Z_$]*$/i.test(prop.getName())) continue;

    // 2. Ignora métodos (propriedades que são funções)
    if (propType.getCallSignatures().length > 0) {
      continue;
    }

    // 3. Ignora classes (tipo declarado como class ou com construct signature)
    if (propType.getConstructSignatures().length > 0) {
      continue;
    }

    // 4. (Opcional) ignora símbolos com nome 'prototype'
    if (prop.getName() === 'prototype') {
      continue;
    }

    lines.push(`  ${prop.getName()}: ${serialized},`);
  }

  return `{\n${lines.join('\n')}\n}`;
}

for (const file of sourceFiles) {
  for (const node of file.getStatements()) {
    if (
      (
        Node.isInterfaceDeclaration(node) ||
        Node.isTypeAliasDeclaration(node)
      ) &&
      node.isExported() &&
      !Node.isClassDeclaration(node)
    ) {
      if (!node.isExported()) continue;
      const name = node.getName();

      const fields = extractFieldTypes(node);
      const symbol = node.getSymbol();
      const isRuntimeValue = symbol?.getDeclarations()?.some(d => d.isKind(SyntaxKind.VariableDeclaration) || d.isKind(SyntaxKind.ClassDeclaration) || d.isKind(SyntaxKind.FunctionDeclaration));
      registerLines.push(`registerType({name: "${name}", ${isRuntimeValue ? `definition:${name},` : ''} fieldTypes:${fields}});`);


      // Adiciona import
      const filePath = file.getFilePath();
      const rel = path.relative(path.dirname(OUTPUT_PATH), filePath).replace(/\\/g, '/').replace(/\.ts$/, '');
      if (!importMap.has(rel)) importMap.set(rel, new Set());
      importMap.get(rel)!.add(name);
    }
  }
}

// Gera linhas de import
for (const [rel, names] of importMap.entries()) {
  const sorted = Array.from(names).sort().join(', ');
  importLines.push(`import { ${sorted} } from '${rel.startsWith('.') ? rel : './' + rel}';`);
}

// Escreve o arquivo final
fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(
  OUTPUT_PATH,
  [...importLines.sort(), '', ...registerLines.sort(), ''].join('\n'),
  'utf8'
);

console.log(`✅ Tipos registrados com sucesso: ${registerLines.length}`);
console.log(`📄 Arquivo gerado: ${OUTPUT_PATH}`);
