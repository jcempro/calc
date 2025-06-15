import { Exception } from 'sass';
import { TOBJ } from '../common/interfaces';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
	file: string;
	line: string;
	timestamp: number;
	stackTrace?: string[]; // Adicionando stack trace ao contexto
}

export class Logger {
	private static getCallerInfo(): LogContext {
		Error.stackTraceLimit = 36;
		const error = new Error();
		const stack =
			error.stack
				?.split('\n')
				.filter((item) => !item.includes(`node_modules`)) || [];

		// Pega a linha do chamador direto
		const callerLine = stack[4].trim() || '';

		// Novo: Pega até 5 níveis de stack
		const deepStack = stack
			.slice(4, 16)
			.join('\n')
			.replace(/((file|https?|ftps?):\/\/[^\/]+|[ ]{2,50})/gi, ``); // Pega linhas 2 a 6 (excluindo "Error" e o próprio getCallerInfo)

		return {
			file:
				callerLine
					.match(
						/(\/|\\|@)([^\/\\]+)(\/|\\|:)([^\/\\:]+)(:\d+:\d+)/,
					)?.[0]
					.replace(/:[\d]+:?/, ``) || 'unknown',
			line: callerLine.match(/:(\d+):(\d+)/)?.[1] || '0',
			timestamp: Date.now(),
			stackTrace: deepStack.trim().split(`\n`), // Stack com mais profundidade
		};
	}

	static log(
		level: LogLevel,
		message: string,
		data?: any,
	): [string, TOBJ, LogContext] {
		const context = this.getCallerInfo(); // Pega o contexto com stack trace
		const dados = {
			message: message,
			data: data,
			stackTrace: context.stackTrace,
		};

		if (__DEV__) {
			// Modo desenvolvimento - mostra informações detalhadas
			const { file, line } = context;
			const str = `[${level.toUpperCase()}] ${message} - ${file}:${line}`;
			console[level](str, dados);

			return [str, data, context];
		} else {
			// Modo produção - mensagem compacta com ID único
			const errorId = Math.random().toString(36).substring(2, 8);
			console[level](`[${errorId}] ${message}`);

			// Envia os detalhes completos para o serviço de monitoramento
			this.sendToMonitoring(errorId, dados);

			return [message, data, context];
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
		return this.log('debug', message, data)[0];
	}

	static info(message: string, data?: any): string {
		return this.log('info', message, data)[0];
	}

	static warn(message: string, data?: any): string {
		return this.log('warn', message, data)[0];
	}

	static error(
		message: string | Error,
		data?: any,
		throws: boolean = false,
	): [string, TOBJ, LogContext] {
		const e: [string, TOBJ, LogContext] =
			message instanceof Error ?
				this.log('error', message.message, {
					...data,
					stackOriginal: message.stack,
				})
			:	this.log('error', message, data);

		if (throws)
			throw message instanceof Error ? message : new Error(message);

		return e;
	}
}

export default Logger;
