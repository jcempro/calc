import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fg from 'fast-glob';
import { writeFileSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 👇 Caminhos sempre relativos à raiz do projeto
const tsDir = resolve(__dirname, '../src/scripts/ts');
const tsxDir = resolve(__dirname, '../src/scripts/tsx');
const outputFile = resolve(__dirname, '../dist/importmap.json');

// 👇 Diagnóstico
console.log('[genImportMap] Buscando arquivos...');
console.log('tsDir:', tsDir);
console.log('tsxDir:', tsxDir);

const tsFiles = await fg('**/*.ts', { cwd: tsDir });
const tsxFiles = await fg('**/*.tsx', { cwd: tsxDir });

console.log(
	`Encontrados: ${tsFiles.length} .ts e ${tsxFiles.length} .tsx`,
);

const importMap = {
	imports: Object.fromEntries([
		...tsFiles.map((f) => [
			`/ts/${f.replace(/\.ts$/, '')}`,
			`/src/scripts/ts/${f}`,
		]),
		...tsxFiles.map((f) => [
			`/tsx/${f.replace(/\.tsx$/, '')}`,
			`/src/scrtips/tsx/${f}`,
		]),
	]),
};

// Garante que pasta existe
mkdirSync(resolve(__dirname, '../dist'), { recursive: true });

writeFileSync(outputFile, JSON.stringify(importMap, null, 2));

console.log(
	`[genImportMap] Import map gerado com sucesso em: ${outputFile}`,
);
