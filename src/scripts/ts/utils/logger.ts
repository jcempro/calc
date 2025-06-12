export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
	file: string;
	line: string;
	timestamp: number;
	stackTrace?: string; // Adicionando stack trace ao contexto
}

export class Logger {
	private static getCallerInfo(): LogContext {
		const error = new Error();
		const stack = error.stack?.split('\n') || [];

		// Pega a linha do chamador direto (como antes)
		const callerLine = stack[3] || '';

		// Novo: Pega até 5 níveis de stack (personalizável)
		const deepStack = stack.slice(2, 10).join('\n'); // Pega linhas 2 a 6 (excluindo "Error" e o próprio getCallerInfo)

		return {
			file:
				callerLine.match(
					/(\/|\\|@)([^\/\\]+)(\/|\\|:)([^\/\\:]+)(:\d+:\d+)/,
				)?.[0] || 'unknown',
			line: callerLine.match(/:(\d+):(\d+)/)?.[1] || '0',
			timestamp: Date.now(),
			stackTrace: deepStack, // Stack com mais profundidade
		};
	}

	static log(level: LogLevel, message: string, data?: any): string {
		const context = this.getCallerInfo(); // Pega o contexto com stack trace

		if (import.meta.env.DEV) {
			// Modo desenvolvimento - mostra informações detalhadas
			const { file, line } = this.getCallerInfo();
			const str = `[${level.toUpperCase()}] ${file}:${line} - ${message}`;
			console[level](str, { ...data, stack: context.stackTrace });

			return str;
		} else {
			// Modo produção - mensagem compacta com ID único
			const errorId = Math.random().toString(36).substring(2, 8);
			console[level](`[${errorId}] ${message}`);

			// Envia os detalhes completos para o serviço de monitoramento
			this.sendToMonitoring(errorId, {
				message,
				data: { ...data, stack: context.stackTrace },
				...this.getCallerInfo(),
			});

			return message;
		}
	}

	/*
	 * TODO: monitoramento de erros
	 */
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
