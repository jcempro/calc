import { TypeHintNested, deserialize as parseValue } from './evalTypes';

export type Meta<T> = [keyof T, TypeHintNested][];

/**
 * Representa uma tupla com metadados de tipo e acesso seguro aos valores
 */
export class MetaTupleBase<T extends Record<string, any>> {
	private data: T;
	private meta: Meta<T>;

	constructor(value: Partial<T> | any[], meta: Meta<T>) {
		this.meta = meta;

		// Se for array, converte para objeto com base na meta
		this.data = Array.isArray(value)
			? meta.reduce((acc, [key, type], i) => {
				acc[key] = parseValue(type, value[i]);
				return acc;
			}, {} as T)
			: (value as T);
	}

	/** Acesso ao campo pelo nome */
	get<K extends keyof T>(key: K): T[K] {
		return this.data[key];
	}

	/** Exporta para JSON em array */
	toJSON(): any[] {
		return this.meta.map(([key]) => this.data[key]);
	}

	/** Serializa a tupla para string JSON */
	toString(): string {
		return JSON.stringify(this.toJSON());
	}

	/** Retorna o objeto plano com os dados */
	toObject(): T {
		return { ...this.data };
	}

	/** Reconstrói uma tupla a partir de JSON */
	static fromJSON<U extends Record<string, any>>(json: {
		'@meta': Meta<U>;
		value: any[];
	}): MetaTupleBase<U> {
		return new MetaTupleBase<U>(json.value, json['@meta']);
	}
}

/**
 * Conjunto de tuplas com metadados compartilhados
 */
export class MetaTuple<T extends Record<string, any>> {
	private meta: Meta<T>;
	private entries: MetaTupleBase<T>[] = [];

	constructor(meta: Meta<T>, data?: (Partial<T> | any[])[]) {
		this.meta = meta;

		if (data) {
			data.forEach((item) => this.push(item));
		}
	}

	/** Número de elementos */
	get length(): number {
		return this.entries.length;
	}

	/** Iterável via for...of */
	[Symbol.iterator](): Iterator<MetaTupleBase<T>> {
		return this.entries[Symbol.iterator]();
	}

	/** Acesso por índice */
	get(index: number): MetaTupleBase<T> | undefined {
		return this.entries[index];
	}

	/** Adiciona uma nova entrada */
	push(item: Partial<T> | any[]) {
		this.entries.push(new MetaTupleBase<T>(item, this.meta));
	}

	/** Remove e retorna o último item */
	pop(): MetaTupleBase<T> | undefined {
		return this.entries.pop();
	}

	/** Retorna o último item sem remover */
	top(): MetaTupleBase<T> | undefined {
		return this.entries.at(-1);
	}

	/** Remove o item de um índice específico */
	deleteAt(index: number): boolean {
		if (index >= 0 && index < this.entries.length) {
			this.entries.splice(index, 1);
			return true;
		}
		return false;
	}

	/** Remove todos os itens que satisfaçam a condição */
	deleteBy(predicate: (item: T, index: number) => boolean): number {
		const originalLength = this.entries.length;
		this.entries = this.entries.filter(
			(entry, i) => !predicate(entry.toObject(), i),
		);
		return originalLength - this.entries.length;
	}

	/** Serializa todas as tuplas para JSON */
	toJSON(): { '@meta': Meta<T>; values: any[][] } {
		return {
			'@meta': this.meta,
			values: this.entries.map((entry) => entry.toJSON()), // << CORRETO
		};
	}

	/** Serializa para string JSON */
	toString(): string {
		return JSON.stringify(this.toJSON());
	}

	/** Reconstrói um conjunto de tuplas a partir de JSON */
	static fromJSON<U extends Record<string, any>>(json: {
		'@meta': Meta<U>;
		values: any[][];
	}): MetaTuple<U> {
		const instance = new MetaTuple<U>(json['@meta']);
		json.values.forEach((v) => instance.push(v));
		return instance;
	}

	/** Retorna todos os objetos planos */
	getAll(): T[] {
		return this.entries.map((entry) => entry.toObject());
	}

	/** Acesso direto às instâncias de MetaTupleBase */
	getTuples(): MetaTupleBase<T>[] {
		return this.entries;
	}

	/** Funções estilo array */
	map<U>(callback: (value: MetaTupleBase<T>, index: number) => U): U[] {
		return this.entries.map(callback);
	}

	filter(
		predicate: (value: MetaTupleBase<T>, index: number) => boolean,
	): MetaTupleBase<T>[] {
		return this.entries.filter(predicate);
	}

	find(
		predicate: (value: MetaTupleBase<T>, index: number) => boolean,
	): MetaTupleBase<T> | undefined {
		return this.entries.find(predicate);
	}

	forEach(callback: (value: MetaTupleBase<T>, index: number) => void): void {
		this.entries.forEach(callback);
	}
}
