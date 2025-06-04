import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

execSync('ts-node scripts/generate-type-metadata.ts');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
	plugins: [preact()],
	root: '.',
	build: {
		outDir: 'dist/www',
		minify: 'esbuild',
		rollupOptions: {
			input: 'src/index.html',
		},
		// Habilita renomeação/mangle agressiva de identificadores
		terserOptions: undefined, // não usamos
	},
	esbuild: {
		drop: ['console', 'debugger'], // remove console.log e debugger
		minifyIdentifiers: true, // mangle de variáveis
		minifySyntax: true, // simplificação de sintaxe
		minifyWhitespace: true, // remoção de espaços
	},
	resolve: {
		alias: {
			'@ext': path.resolve(__dirname, 'src/assets/scripts/components'),
			'@scss': path.resolve(__dirname, 'src/assets/scss'),
			'@css': path.resolve(__dirname, 'src/assets/css'),
			'@tsx': path.resolve(__dirname, 'src/assets/scripts/tsx'),
			'@ts': path.resolve(__dirname, 'src/assets/scripts/ts'),
			'@js': path.resolve(__dirname, 'src/assets/js'),
			'@s': path.resolve(__dirname, 'src/assets/s'),
		},
	},
});
