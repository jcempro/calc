/// <reference types="vitest/client" />
/// <reference types="@preact/preset-vite" />

// Extensão para ImportMeta.env
interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: 'development' | 'production' | 'test';
  // Adicione outras variáveis de ambiente VITE_* aqui se necessário
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Variáveis globais customizadas
declare const __DEV__: boolean;
declare const __FILE_LINE__: {
  readonly file: string;
  readonly line: string;
};