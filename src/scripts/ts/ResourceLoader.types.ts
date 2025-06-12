/**
 * Evento disparado após tentativa de carregar recurso externo.
 */
export interface LoadEvent {
	url: string;
	success: boolean;
	error?: Error;
	durationMs?: number;
}

/** Callback para eventos de carregamento */
export type Listener = (event: LoadEvent) => void;

/** Opções para carregamento de recurso */
export interface LoadOptions {
	timeoutMs?: number; // Tempo máximo para carregar (ms)
	retries?: number; // Número de tentativas em caso de erro
	condition?: () => boolean; // Condição para carregar recurso
}
