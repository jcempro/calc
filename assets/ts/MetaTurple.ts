export type TypeHint = string;

export type Meta<T> = [keyof T, TypeHint][];
export type TypeRegistry = Record<string, new (...args: any[]) => any>;

export class MetaTupleBase<T extends Record<string, any>> {
	private data: T;
	private meta: Meta<T>;
	private static registry: TypeRegistry = {};

	constructor(value: Partial<T> | any[], meta: Meta<T>) {
		this.meta = meta;

		if (Array.isArray(value)) {
			this.data = {} as T;
			meta.forEach(([key, type], i) => {
				(this.data as any)[key] = MetaTupleBase.parseValue(type, value[i]);
			});
		} else {
			this.data = value as T;
		}
	}

	/** Acesso via propriedade */
	get<K extends keyof T>(key: K): T[K] {
		return this.data[key];
	}

	/** Converte para JSON com meta + tupla */
	toJSON(): { '@meta': Meta<T>; value: any[] } {
		const value = this.meta.map(([key]) => this.data[key]);
		return {
			'@meta': this.meta,
			value,
		};
	}

	/** Exporta como string JSON */
	toString(): string {
		return JSON.stringify(this.toJSON());
	}

	/** Objeto plano */
	toObject(): T {
		return { ...this.data };
	}

	/** Constrói a partir de um JSON contendo @meta e value */
	static fromJSON<U extends Record<string, any>>(json: {
		'@meta': Meta<U>;
		value: any[];
	}): MetaTupleBase<U> {
		return new MetaTupleBase<U>(json.value, json['@meta']);
	}

	/** Adiciona classe personalizada ao registro */
	static registerType(name: string, cls: new (...args: any[]) => any) {
		this.registry[name] = cls;
	}

	/** Interpreta um valor baseado no tipo declarado */
	private static parseValue(type: TypeHint, value: any): any {
		switch (type) {
			case 'number':
				return Number(value);
			case 'string':
				return String(value);
			case 'boolean':
				return Boolean(value);
			case 'Date':
				return new Date(value);
			case 'object':
				return typeof value === 'object' ? value : {};
			default:
				const ClassRef = this.registry[type];
				if (ClassRef) return new ClassRef(value);
				throw new Error(`Tipo não registrado: ${type}`);
		}
	}
}

export class MetaTuple<T extends Record<string, any>> {
	private meta: Meta<T>;
	private entries: MetaTupleBase<T>[];

	constructor(meta: Meta<T>, data?: (Partial<T> | any[])[]) {
		this.meta = meta;
		this.entries = [];

		if (data) {
			for (const item of data) {
				this.push(item);
			}
		}
	}

	push(item: Partial<T> | any[]) {
		this.entries.push(new MetaTupleBase<T>(item, this.meta));
	}

	toJSON(): { '@meta': Meta<T>; values: any[][] } {
		return {
			'@meta': this.meta,
			values: this.entries.map((e) => e.toJSON().value),
		};
	}

	toString(): string {
		return JSON.stringify(this.toJSON());
	}

	static fromJSON<U extends Record<string, any>>(json: {
		'@meta': Meta<U>;
		values: any[][];
	}): MetaTuple<U> {
		const arr = new MetaTuple<U>(json['@meta']);
		for (const v of json.values) {
			arr.push(v);
		}
		return arr;
	}

	getAll(): T[] {
		return this.entries.map((e) => e.toObject());
	}

	getTuples(): MetaTupleBase<T>[] {
		return this.entries;
	}
}
