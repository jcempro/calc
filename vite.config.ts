import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import fs from 'fs';

// Resolve caminho para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Executa script auxiliar antes do build/dev
try {
	execSync('ts-node --esm scripts/generate-type-metadata.ts', {
		stdio: 'inherit',
	});
} catch (err) {
	console.error('[vite.config.ts] Erro ao executar generate-type-metadata.ts:', err);
}

export default defineConfig({
	plugins: [preact(), {
		name: 'generate-type-registry',
		buildStart() {
			console.log('🔄 Gerando typeRegistry.ts...');
			execSync('node ./scripts/generate-type-metadata.ts', { stdio: 'inherit' });
		}
	}],
	root: '.',
	resolve: {
		alias: {
			'@ext': path.resolve(__dirname, 'src/assets/components'),
			'@scss': path.resolve(__dirname, 'src/assets/scss'),
			'@css': path.resolve(__dirname, 'src/assets/css'),
			'@tsx': path.resolve(__dirname, 'src/scripts/tsx'),
			'@ts': path.resolve(__dirname, 'src/scripts/ts'),
			'@js': path.resolve(__dirname, 'src/assets/js'),
			'@s': path.resolve(__dirname, 'src/assets/s'),
		},
	},
	esbuild: {
		drop: ['console', 'debugger'],
		minifyIdentifiers: true,
		minifySyntax: true,
		minifyWhitespace: true,
	},
	build: {
		outDir: 'dist/www',
		minify: 'esbuild',
		rollupOptions: {
			input: 'index.html',
		},
	},
	server: {
		watch: {
			ignored: ['!**/__generated__/typeRegistry.ts'] // não ignorar este arquivo
		}
	}
});
