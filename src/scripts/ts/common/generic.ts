import type env from '../types/env.d.ts';
import { __FILE_LINE__ } from '../types/env.d';
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

export function validarBoolean(valor: any, padrao: boolean): boolean {
	return typeof valor === 'boolean' ? valor : padrao;
}

export const HAS = (key: PropertyKey, f: object): boolean =>
	(key in f || Object.prototype.hasOwnProperty.call(f, key)) &&
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
