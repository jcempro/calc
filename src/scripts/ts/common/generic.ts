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
