import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { transformWithEsbuild } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Resolve caminho para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para executar o script de geração de tipos
const runTypeGeneration = (env = 'development') => {
	try {
		execSync('tsx ./scripts/generate-type-metadata.ts', {
			stdio: 'inherit',
			env: {
				...process.env,
				NODE_ENV: env,
			},
		});
	} catch (err) {
		console.error('❌ Erro ao gerar metadata:', err);
		if (env === 'development') process.exit(1);
		throw err; // Propaga o erro no buildStart
	}
};

// Executa durante a configuração (apenas em dev)
if (process.env.NODE_ENV !== 'production') {
	runTypeGeneration('development');
}

export default defineConfig(({ mode }) => ({
	plugins: [
		preact(),
		viteSingleFile(),
		{
			name: 'fontawesome-watcher',
			configureServer(server) {
				server.watcher.on('change', (path) => {
					if (path.endsWith('.tsx')) {
						execSync('npm run fa:gen', { stdio: 'inherit' });
					}
				});
			},
		},
		{
			name: 'generate-type-registry',
			buildStart() {
				if (mode === 'production') {
					runTypeGeneration('production');
				}
			},
			handleHotUpdate({ file }) {
				if (file.includes('generate-type-metadata.ts')) {
					runTypeGeneration('development');
				}
			},
		},
		{
			name: 'file-line-transform',
			enforce: 'pre',
			async transform(code, id) {
				if (!/node_modules/.test(id) && /\.(tsx?|jsx?)$/.test(id)) {
					const originalFile = JSON.stringify(id);

					// Expressão regular melhorada para capturar linha/coluna
					const lineReplacement =
						mode === 'production' ?
							'"{ file: \\"production\\", line: \\"0\\" }"'
						:	`{ 
            file: ${originalFile}, 
            line: ((new Error().stack || '').split('\\n')[1]
              ?.match(/:\\d+:\\d+/)?.[0]
              ?.replace(/[^\\d]/g, '') || '0'
          }`;

					const transformedCode = code.replace(
						/__FILE_LINE__/g,
						lineReplacement,
					);

					if (mode === 'production') {
						return transformWithEsbuild(transformedCode, id, {
							loader: 'ts',
							minify: true,
							keepNames: true,
						});
					}

					return {
						code: transformedCode,
						map: null,
					};
				}
			},
		},
	],
	build: {
		outDir: 'dist/www',
		minify: 'esbuild',
		sourcemap: true,
		rollupOptions: {
			input: 'src/index.html',
			output: {
				compact: true,
				// Garante que __FILE_LINE__ seja removido em produção
				banner: `const __FILE_LINE__ = { file: 'prod', line: '0' };`,
			},
		},
		// Habilita renomeação/mangle agressiva de identificadores
		terserOptions: undefined, // não usamos
		emptyOutDir: true,
	},
	esbuild: {
		drop: mode === 'production' ? ['console', 'debugger'] : [],
		minifyIdentifiers: mode === 'production',
		minifySyntax: mode === 'production',
		minifyWhitespace: mode === 'production',
	},
	define: {
		__DEV__: mode !== 'production',
	},
	server: {
		watch: {
			ignored: ['!**/__generated__/typeRegistry.ts'],
		},
	},
	resolve: {
		alias: {
			'@ext': path.resolve(__dirname, 'src/scripts/components'),
			'@scss': path.resolve(__dirname, 'src/scss'),
			'@css': path.resolve(__dirname, 'src/assets/css'),
			'@tsx': path.resolve(__dirname, 'src/scripts/tsx'),
			'@ts': path.resolve(__dirname, 'src/scripts/ts'),
			'@js': path.resolve(__dirname, 'src/assets/js'),
			'@s': path.resolve(__dirname, 'src/assets/s'),
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './test/.setup.ts',
		include: ['test/**/*.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
		},
		deps: {
			inline: ['@preact/preset-vite'],
		},
		env: {
			NODE_ENV: 'test',
		},
	},
}));
