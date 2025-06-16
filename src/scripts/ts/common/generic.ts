import { Logger } from '../utils/logger.ts';
import { RecordT, T_get_nested, TOBJ } from './interfaces.ts';

export type TupleFromObjectOrdered<
	T,
	Keys extends readonly (keyof T)[],
> = {
	[I in keyof Keys]: Keys[I] extends keyof T ? T[Keys[I]] : never;
};

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
 *
 */
export function noEmpty<T = any>(
	v: T,
	true_vazio_se_tipo_diferente?: string,
): boolean {
	return !isEmpty(v, true_vazio_se_tipo_diferente);
}

export function isTrue(v: any): boolean {
	return isEmpty(v) || v === false ? false : true;
}

export function validarBoolean(v: any, padrao: boolean): boolean {
	return typeof v === 'boolean' ? v : padrao;
}

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

export function guid(size: number = 18) {
	return `i${Math.random()
		.toString(size * 2)
		.slice(2, size)}`;
}
