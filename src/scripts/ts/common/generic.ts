import { T_get_nested } from './interfaces.ts';

export type TupleFromObjectOrdered<T, Keys extends readonly (keyof T)[]> = {
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

export const HAS = (key: string, f: object): boolean =>
	Object.prototype.hasOwnProperty.call(f, key) || key in f;

export const GET = <T>(
	key: T_get_nested,
	from: Record<string, any>,
): T | undefined => {
	if (typeof key === 'string') {
		return HAS(key, from) ? (from[key] as T) : undefined;
	}

	if (Array.isArray(key)) {
		return key.reduce((f, k) => {
			if (f && typeof f === 'object' && HAS(k, f)) {
				return f[k];
			}
			return undefined;
		}, from) as T;
	}

	return undefined;
};
