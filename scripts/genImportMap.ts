import { writeFileSync, mkdirSync } from 'node:fs';
import FastGlob from 'fast-glob';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirName = dirname(__filename);

const tsDir = resolve(__dirName, '../src/ts');
const tsxDir = resolve(__dirName, '../src/tsx');
const outputFile = resolve(__dirName, '../dist/importmap.json');

(async () => {
	const tsFiles = await FastGlob('**/*.ts', { cwd: tsDir });
	const tsxFiles = await FastGlob('**/*.tsx', { cwd: tsxDir });

	const imports: Record<string, string> = {};

	// .ts files
	for (const file of tsFiles) {
		const moduleName = './' + file.replace(/\\/g, '/').replace(/\.ts$/, '');
		const outputPath =
			'src/ts/' + file.replace(/\\/g, '/').replace(/\.ts$/, '.js');
		imports[moduleName] = outputPath;
	}

	// .tsx files
	for (const file of tsxFiles) {
		const moduleName = './' + file.replace(/\\/g, '/').replace(/\.tsx$/, '');
		const outputPath =
			'src/tsx/' + file.replace(/\\/g, '/').replace(/\.tsx$/, '.js');
		imports[moduleName] = outputPath;
	}

	const importMap = { imports };

	mkdirSync(dirname(outputFile), { recursive: true });
	writeFileSync(outputFile, JSON.stringify(importMap, null, 2), 'utf-8');

	console.log('✅ dist/importmap.json gerado com sucesso!');
})();
