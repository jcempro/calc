import { Logger } from '../utils/logger.ts';
import { RecordT, T_get_nested, TOBJ } from './interfaces.ts';

/**
 * Constrói um tipo tupla a partir das propriedades de um objeto,
 * preservando a ordem específica das chaves.
 * @template T - Tipo do objeto de origem que será convertido para tupla.
 * @template Keys - Array de chaves (em ordem) que definirá a estrutura da tupla.
 * @returns {TupleFromObjectOrdered<T, Keys>} Tupla com tipos correspondentes
 * às propriedades do objeto na ordem especificada.
 * @example
 * const obj = { nome: 'João', idade: 30 };
 * type Tupla = TupleFromObjectOrdered<typeof obj, ['idade', 'nome']>;
 * // Resultado: [number, string]
 */
export type TupleFromObjectOrdered<
	T,
	Keys extends readonly (keyof T)[],
> = {
	[I in keyof Keys]: Keys[I] extends keyof T ? T[Keys[I]] : never;
};

/**
 * Gera identificadores únicos pseudo-aleatórios (GUID).
 * @param {number} [size=18] - Tamanho desejado do GUID (sem incluir o prefixo 'i').
 * @returns {string} String no formato `i` + caracteres alfanuméricos aleatórios.
 * @note Não é um GUID real (RFC 4122), mas adequado para IDs internos.
 * @example
 * guid(10); // 'i7H9a2K5b3'
 */
export function guid(size: number = 18) {
	return `i${Math.random()
		.toString(size * 2)
		.slice(2, size)}`;
}
