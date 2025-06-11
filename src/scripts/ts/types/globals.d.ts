/// <reference types="vite/client" />
/// <reference types="@preact/preset-vite" />

export interface ImportMetaEnv {
	readonly DEV: boolean;
	readonly PROD: boolean;
	readonly MODE: 'development' | 'production' | 'test';
	readonly VITE_APP_TITLE: string;
	readonly VITE_API_URL: string;
	// declare outras variáveis aqui
}

export interface ImportMeta {
	readonly env: ImportMetaEnv;
}
