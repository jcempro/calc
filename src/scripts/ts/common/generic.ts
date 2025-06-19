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
 * Extensão da interface RegExpMatchArray com suporte a grupos nomeados,
 * especialmente útil para extrair valores específicos de regex.
 * @property {Object} groups - Objeto contendo os grupos capturados.
 * @property {string} groups.value - Valor principal capturado pelo grupo nomeado.
 * @example
 * const regex = /(?<value>\d+)/;
 * const match = 'ID: 123'.match(regex) as MatchWithGroups;
 * console.log(match.groups.value); // '123'
 */
export interface MatchWithGroups extends RegExpMatchArray {
	groups: {
		value: string;
	};
}

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

/**
 * Obtém valores de propriedades (simples ou aninhadas) com fallback completo.
 * @template T - Tipo esperado do valor retornado.
 * @param {T_get_nested} key - Chave única ou array para navegação aninhada.
 * @param {Record<string, any>} from - Objeto base para busca.
 * @param {(x: PropertyKey) => void} [inexist] - Callback opcional para propriedades ausentes.
 * @returns {T | undefined} Retorna:
 *         - O valor encontrado na cadeia de propriedades
 *         - `undefined` se qualquer nível não existir
 *         - Executa callback `inexist` para cada nível faltante
 * @example
 * GET(['endereco', 'rua'], usuario) // Retorna rua ou undefined
 */
export const GET = <T>(
	key: T_get_nested,
	from: Record<string, any>,
	inexist?: (x: PropertyKey) => void,
): T | undefined => {
	const unk = (k: string): any => {
		if (inexist) inexist(k);
		return undefined;
	};

	if (typeof key === 'string') {
		return HAS(key, from) ? (from[key] as T) : unk(key);
	}

	if (Array.isArray(key)) {
		return key.reduce((f, k) => {
			if (f && typeof f === 'object' && HAS(k, f)) {
				return f[k];
			}
			return unk(k);
		}, from) as T;
	}

	return undefined;
};

/**
 * Classe especializada que encapsula um objeto como string dinâmica,
 * mantendo acesso direto às propriedades originais.
 * @template T - Tipo do objeto encapsulado.
 * @extends String
 * @description
 * Combina funcionalidades de objeto e string:
 * - Conversão automática para representação string formatada
 * - Acesso direto às propriedades via dot notation
 * - Métodos para manipulação segura
 * @example
 * const ps = new PropertyStr({ nome: 'Maria', idade: 30 });
 * console.log(ps.nome); // 'Maria'
 * console.log(String(ps)); // 'nome=Maria|idade=30'
 */
export class PropertyStr<
	T extends Record<PropertyKey, any>,
> extends String {
	private _data: T;

	constructor(data: T) {
		super(PropertyStr.stringify(data)); // valor base da string
		this._data = { ...data };
		this._defineProperties();
	}

	private static stringify(data: Record<string, any>): string {
		return Object.entries(data)
			.map(
				([k, v]) =>
					`${k}=${v instanceof Date ? v.toISOString() : String(v)}`,
			)
			.join('|');
	}

	private _defineProperties(): void {
		for (const key of Object.keys(this._data)) {
			Object.defineProperty(this, key, {
				get: () => this.get(key),
				set: (value) => this.set(key, value),
				enumerable: true,
				configurable: true,
			});
		}
	}

	get<K extends keyof T>(key: K): T[K] {
		return this._data[key];
	}

	set<K extends keyof T>(key: K, value: T[K]): this {
		this._data[key] = value;
		this._updateStringValue();
		return this;
	}

	delete(key: keyof T): boolean {
		const result = delete this._data[key];
		if (result) {
			delete (this as any)[key];
			this._updateStringValue();
		}
		return result;
	}

	private _updateStringValue(): void {
		const strValue = PropertyStr.stringify(this._data);
		Object.setPrototypeOf(this, new String(strValue));
	}

	toString(): string {
		return PropertyStr.stringify(this._data);
	}

	toJSON(): T {
		return { ...this._data };
	}

	keys(): Array<keyof T> {
		return Object.keys(this._data) as Array<keyof T>;
	}

	values(): Array<T[keyof T]> {
		return Object.values(this._data);
	}

	entries(): Array<[keyof T, T[keyof T]]> {
		return Object.entries(this._data) as Array<[keyof T, T[keyof T]]>;
	}

	[Symbol.toPrimitive](hint: string) {
		return this.toString();
	}
}

/**
 * Obtém propriedades com tratamento completo de erros e fallback.
 * @template T - Tipo esperado do valor retornado.
 * @param {PropertyKey} key - Nome da propriedade.
 * @param {RecordT<any>} from - Objeto contendo a propriedade.
 * @param {T} fallback - Valor padrão caso a propriedade não exista.
 * @param {() => {}} [fail] - Callback executado em caso de falha.
 * @returns {T} Retorna:
 *         - O valor da propriedade se existir
 *         - O `fallback` se fornecido
 *         - Resultado de `fail()` em caso de erro sem fallback
 * @throws {Error} Registra erro via Logger se a propriedade não existir
 *         e nenhum fallback for fornecido.
 * @example
 * getProp('nome', usuario, 'Anônimo');
 */
export function getProp<T>(
	key: PropertyKey,
	from: RecordT<any>,
	fallback: T,
	fail?: () => {},
): T {
	return (
		typeof from === `object` && HAS(key, from) ? from[key]
		: fallback !== undefined ? fallback
		: ((): T => {
				if (fail) {
					return <T>fail();
				} else {
					return <T>Logger.error(
						`getProp: não foi possível definir o 'name' com o parametros ${key as string}.`,
						{
							args: {
								key: key,
								from: from,
								fallback: fallback,
							},
							linha: __FILE_LINE__,
						},
						true,
					);
				}
			})()
	);
}

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
