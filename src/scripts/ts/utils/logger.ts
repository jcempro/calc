import { Exception } from 'sass';
import { TOBJ } from '../common/interfaces';
import { __DEV__ } from '../types/env';

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
			const str = `[${level.toUpperCase()}] ${file}:${line} - ${message}`;
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
