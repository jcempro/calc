import { __DEV__ } from '../types/globals';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
	file: string;
	line: string;
	timestamp: number;
}

export class Logger {
	private static getCallerInfo(): LogContext {
		const stack = new Error().stack?.split('\n') || [];
		const callerLine = stack[3] || '';

		return {
			file:
				callerLine.match(
					/(\/|\\|@)([^\/\\]+)(\/|\\|:)([^\/\\:]+)(:\d+:\d+)/,
				)?.[0] || 'unknown',
			line: callerLine.match(/:(\d+):(\d+)/)?.[1] || '0',
			timestamp: Date.now(),
		};
	}

	static log(level: LogLevel, message: string, data?: any): string {
		if (__DEV__) {
			// Modo desenvolvimento - mostra informações detalhadas
			const { file, line } = this.getCallerInfo();
			const str = `[${level.toUpperCase()}] ${file}:${line} - ${message}`;
			console[level](str, data || '');

			return str;
		} else {
			// Modo produção - mensagem compacta com ID único
			const errorId = Math.random().toString(36).substring(2, 8);
			console[level](`[${errorId}] ${message}`);

			// Envia os detalhes completos para o serviço de monitoramento
			this.sendToMonitoring(errorId, {
				message,
				data,
				...this.getCallerInfo(),
			});

			return message;
		}
	}

	private static sendToMonitoring(id: string, payload: any) {
		// Implemente o envio serviço de monitoramento (Sentry, LogRocket, etc.)
		// Exemplo:
		// fetch('/api/log', { method: 'POST', body: JSON.stringify({ id, ...payload }) });
	}

	static debug(message: string, data?: any): string {
		return this.log('debug', message, data);
	}

	static info(message: string, data?: any): string {
		return this.log('info', message, data);
	}

	static warn(message: string, data?: any): string {
		return this.log('warn', message, data);
	}

	static error(message: string | Error, data?: any): string {
		if (message instanceof Error) {
			return this.log('error', message.message, {
				...data,
				stack: message.stack,
			});
		} else {
			return this.log('error', message, data);
		}
	}
}

export default Logger;
