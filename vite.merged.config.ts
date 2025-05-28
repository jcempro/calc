// vite.bundle.config.ts
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';

export default defineConfig({
  plugins: [
    preact(),
    viteSingleFile(),
  ],
  build: {
    outDir: 'dist/merged',
    rollupOptions: {
      input: 'index.html',
    },
    emptyOutDir: true,
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
