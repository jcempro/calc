import Logger from '../utils/logger';

/**
 * Verifica se um valor é considerado "vazio" de acordo com critérios específicos.
 *
 * @template T - Tipo genérico do valor a ser verificado
 * @param {T} v - Valor a ser verificado
 * @param {string} [false_se_tipo_diferente] - Se fornecido, retorna true quando o tipo do valor
 *                                                 não corresponde ao tipo especificado
 * @returns {boolean} Retorna true se o valor for considerado vazio, false caso contrário
 *
 * @description
 * Esta função considera os seguintes valores como vazios:
 * - undefined
 * - Strings vazias ou com apenas espaços ('')
 * - Arrays vazios ([])
 * - Objetos sem propriedades próprias ({})
 * - Map/Set vazios
 * - NaN (para números)
 * - Datas inválidas (new Date('invalid'))
 *
 * Observações importantes:
 * - null É CONSIDERADO UM VALOR VÁLIDO (não vazio), pois representa a ausência intencional de valor
 * - Objetos com protótipo diferente de Object.prototype não são considerados vazios
 * - A função é protegida contra exceções, qualquer erro durante a verificação retornará false
 * - Quando o segundo parâmetro é fornecido, a verificação de tipo tem precedência
 * usência intencional.
 * @note `null` é considerado valor válido (não vazio) por representar ausência intencional.
 * @example
 * isEmpty('') // true
 * isEmpty([]) // true
 * isEmpty({}) // true
 * isEmpty(null) // false
 * isEmpty(0) // false
 * isEmpty(NaN) // true
 */
export function isEmpty<T = any>(
	v: T,
	false_se_tipo_diferente?: string,
): boolean {
	// Apenas undefined é considerado vazio imediatamente
	if (v === undefined) return true;

	// Verificação segura contra exceções para o parâmetro de tipo
	if (false_se_tipo_diferente) {
		const isTipo = (typeStr: string): boolean => {
			try {
				const t = typeStr.trim().toLowerCase();

				// Verificação segura para tipos primitivos
				if (
					[
						'string',
						'number',
						'bigint',
						'boolean',
						'symbol',
						'function',
					].includes(t)
				) {
					return typeof v === t;
				}

				// Verificação ultra-segura para construtores
				const _constructor = (
					(typeof window !== 'undefined' ? window : globalThis) as any
				)[t];

				if (typeof _constructor === 'function') {
					return v instanceof _constructor;
				}
			} catch {
				return false;
			}
			return false;
		};

		if (!isTipo(false_se_tipo_diferente)) {
			return false;
		}
	}

	// Verificações específicas por tipo (com proteção contra exceções)
	try {
		if (typeof v === 'string') return v.trim().length === 0;
		if (typeof v === 'number') return isNaN(v);
		if (Array.isArray(v)) return v.length === 0;
		if (v instanceof Map || v instanceof Set) return v.size === 0;
		if (v instanceof Date) return isNaN(v.getTime());

		if (v !== null && typeof v === 'object') {
			const keys = Object.keys(v);
			return keys.length === 0;
		}
	} catch (e) {
		// Se qualquer verificação lançar exceção, considera não vazio
		return false;
	}

	// Valor não se enquadra em nenhum critério de vazio
	return false;
}

/**
 * Alias negado para isEmpty
 * Inverso lógico da função `isEmpty()`, com comportamento consistente.
 *
 * @template T - Tipo do valor a ser testado.
 * @param {T} v - Valor a ser avaliado.
 * @param {string} [true_vazio_se_tipo_diferente] - Quando fornecido, inverte a lógica:
 *        se o tipo não coincidir, retorna `true` (considera "vazio").
 * @returns {boolean} Retorna `true` se o valor NÃO for vazio, `false` caso contrário.
 * @see isEmpty Para critérios detalhados de avaliação.
 * @example
 * noEmpty('texto') // true
 * noEmpty('') // false
 * noEmpty(null) // true
 */
export function noEmpty<T = any>(
	v: T,
	true_vazio_se_tipo_diferente?: string,
): boolean {
	return !isEmpty(v, true_vazio_se_tipo_diferente);
}

/**
 * Avalia se um valor deve ser considerado `true` em contextos booleanos.
 * @param {any} v - Valor a ser testado.
 * @returns {boolean} Retorna `false` APENAS para:
 *         - Valores considerados "vazios" por `isEmpty()`
 *         - O booleano literal `false`
 *         - Em todos outros casos retorna `true`
 * @note Difere do JavaScript convencional:
 *       - `0`, `null` e `''` retornam `true` (não são considerados vazios)
 * @example
 * isTrue(null) // true
 * isTrue(false) // false
 * isTrue(0) // true
 * isTrue('') // false
 */
export function isTrue(v: any): boolean {
	return isEmpty(v) || v === false ? false : true;
}

/**
 * Converte valores arbitrários para booleano com fallback seguro.
 * @param {any} v - Valor a ser convertido.
 * @param {boolean} padrao - Valor padrão quando a conversão não é possível.
 * @returns {boolean} Retorna:
 *         - O próprio valor se for booleano
 *         - O valor `padrao` para qualquer outro tipo
 * @example
 * validarBoolean('texto', true) // true (padrão)
 * validarBoolean(false, true) // false
 */
export function validarBoolean(v: any, padrao: boolean): boolean {
	return typeof v === 'boolean' ? v : padrao;
}

/**
 * Verifica existência segura de propriedades em objetos/arrays.
 * @param {PropertyKey} key - Nome/símbolo/índice da propriedade.
 * @param {object} f - Objeto/array a ser inspecionado.
 * @returns {boolean} Retorna `true` se:
 *         - A propriedade existe
 *         - Não tem valor `undefined`
 *         - O objeto é válido (não primitivo)
 * @throws {Error} Registra erro via Logger se `f` não for objeto/array.
 * @example
 * HAS('length', [1,2]) // true
 * HAS('nome', null) // false + log de erro
 */
export const HAS = (key: PropertyKey, f: object): boolean =>
	typeof f !== 'object' ?
		((): boolean => {
			return !(
				Logger.error(
					`HAS: Parâmetro 'f' não é um objeto ou array; f='${f}'.`,
					{
						args: {
							key: key,
							f: f,
						},
					},
					true,
				) ?? false
			);
		})()
	:	(key in f || Object.prototype.hasOwnProperty.call(f, key)) &&
		//@ts-ignore
		f[key] !== undefined;
