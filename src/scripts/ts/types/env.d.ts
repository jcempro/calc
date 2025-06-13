/// <reference types="vitest/client" />
/// <reference types="@preact/preset-vite" />

// Extensão para ImportMeta.env
export interface ImportMetaEnv {
	readonly DEV: boolean;
	readonly PROD: boolean;
	readonly MODE: 'development' | 'production' | 'test';
	// Adicione outras variáveis de ambiente VITE_* aqui se necessário
}

export interface ImportMeta {
	readonly env: ImportMetaEnv;
}

// Variáveis globais customizadas
export declare const __DEV__: boolean;
export declare const __FILE_LINE__: {
	readonly file: string;
	readonly line: string;
};
