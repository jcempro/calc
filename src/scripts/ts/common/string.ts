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
