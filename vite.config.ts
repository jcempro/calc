import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
	plugins: [preact()],
	root: '.',
	build: {
		outDir: 'dist',
		rollupOptions: {
			input: 'public/index.html',
		},
	},
	resolve: {
		alias: {
			'@ext': path.resolve(__dirname, 'assets/components'),
			'@scss': path.resolve(__dirname, 'assets/scss'),
			'@css': path.resolve(__dirname, 'assets/css'),
			'@tsx': path.resolve(__dirname, 'assets/tsx'),
			'@ts': path.resolve(__dirname, 'assets/ts'),
			'@js': path.resolve(__dirname, 'assets/js'),
			'@s': path.resolve(__dirname, 'assets/s'),
		},
	},
});
