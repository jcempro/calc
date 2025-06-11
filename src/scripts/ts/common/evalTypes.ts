// Tipos utilitários

import { getProp, HAS } from './generic';
import { RecordT } from './interfaces';

/**
 * Representa um construtor de classe.
 */
export type Constructor<T = any> = new (...args: any[]) => T;

/**
 * Tipo primitivo ou classe instanciável.
 */
export type TypeHint = Constructor | PropertyKey;

/**
 * Pode ser um tipo simples, um array homogêneo (ex: ['Pessoa']) ou uma tupla (ex: ['string', 'number']).
 */
export type TypeHintNested =
	| TypeHint
	| [TypeHint]
	| TypeHint[]
	| { [key: string | number | symbol]: TypeHintNested };

/**
 * Define o tipo de cada campo de uma classe registrada.
 */
export type TFieldType = Record<string, TypeHintNested>;

/**
 * Definição de tipo registrada, incluindo seu nome e seus campos (opcional).
 */
export type TTypeDefs = {
	name: TypeHint;
	detalhe?: TFieldType;
};

// Registro global de tipos
const _typeRegistry = new Map<string, TTypeDefs>();

/**
 * Registra um tipo para futura desserialização.
 *
 * Pode ser:
 * - uma classe com campos aninhados
 * - um tipo nominal ou primitivo com nome simbólico
 *
 * @param name Nome identificador do tipo (usado como chave no registro)
 * @param definition Construtor da classe ou tipo primitivo (ex: 'string', Date, Pessoa)
 * @param fieldTypes (opcional) Mapeamento dos campos da estrutura
 *
 * @example
 * class Pessoa {
 *   nome!: string;
 *   idade!: number;
 * }
 *
 * registerType('Pessoa', Pessoa, {
 *   nome: 'string',
 *   idade: 'number'
 * });
 */
type RegisterTypeArgs =
	| {
			name: string | string[];
			tipo: TypeHint | TypeHint[];
			fieldTypes?: TFieldType | TFieldType[];
	  }
	| {
			name: string | string[];
			fieldTypes: TFieldType | TFieldType[];
	  };

export function registerType(
	name_args: string | RegisterTypeArgs,
	tipo?: TypeHint | TypeHint[],
	fieldTypes?: TFieldType | TFieldType[],
): void {
	if (
		(typeof name_args !== `string` && typeof name_args !== `object`) ||
		(typeof name_args === `object` &&
			!('tipo' in name_args) &&
			!('fieldTypes' in name_args))
	) {
		throw new Error(`Parâmetros inválidos para registerType`);
	}

	const _names: string[] = (() => {
		const n = getProp<string | string[]>(
			'name',
			<RecordT<any>>name_args,
			<string | string[]>name_args,
		);
		return Array.isArray(n) ? n : [n];
	})();

	const _tipo: TypeHint[] = (() => {
		const t = getProp<TypeHint | TypeHint[]>(
			'tipo',
			<RecordT<any>>name_args,
			<TypeHint | TypeHint[]>tipo,
		);
		return Array.isArray(t) ? t : [t];
	})();

	const _fieldTypes: TFieldType[] = (() => {
		const t = getProp<TFieldType | TFieldType[]>(
			'fieldTypes',
			<RecordT<any>>name_args,
			<TFieldType | TFieldType[]>fieldTypes,
		);
		return Array.isArray(t) ? t : [t];
	})();

	const total = Math.max(_names.length, _tipo.length, _fieldTypes.length);

	for (let k = 0; k < total; k++) {
		const name = _names[k] ?? _names[0];
		const tipoDef = _tipo[k] ?? _tipo[0];
		const fieldDef = _fieldTypes[k] ?? _fieldTypes[0];

		const def: TTypeDefs = {
			name: tipoDef,
			...(fieldDef ? { detalhe: fieldDef } : {}),
		};

		_typeRegistry.set(name, def);
	}
}

/**
 * Converte tipos primitivos de forma segura.
 * @param type Tipo a ser convertido ('string', 'number', etc.)
 * @param value Valor bruto
 */
function convertPrimitive(type: TypeHint | TypeHint[], value: any): any {
	if (Array.isArray(type)) {
		return value; // Tuplas ou arrays já são tratados antes
	}

	switch (type) {
		case 'string':
			return String(value);
		case 'number':
			return Number(value);
		case 'boolean':
			return (
				`${value}`.trim().toLocaleLowerCase() === 'true' ||
				value === true ||
				value === 1
			);
		case 'Date':
			return new Date(value);
		case 'object':
			return typeof value === 'object' ? { ...value } : {};
		default:
			return value;
	}
}

/**
 * Busca no registro o tipo correspondente a um construtor de classe.
 * @param type Classe
 * @returns Definição registrada (se houver)
 */
function findDefinitionByConstructor(type: Constructor): TTypeDefs | undefined {
	for (const [, def] of _typeRegistry.entries()) {
		if (def.name === type) return def;
	}
	return undefined;
}

/**
 * Desserializa qualquer estrutura JSON em instâncias do tipo fornecido.
 * Suporta tipos primitivos, arrays, tuplas, objetos aninhados e classes.
 *
 * @param type Tipo esperado do objeto resultante (string, class ou array/tupla de tipos)
 * @param data Valor bruto a ser desserializado
 * @returns Objeto do tipo esperado
 *
 * @example
 * // Classe com registro
 * class Pessoa { nome!: string; idade!: number; }
 * registerType('Pessoa', Pessoa, { nome: 'string', idade: 'number' });
 * const obj = deserialize<Pessoa>('Pessoa', { nome: 'Ana', idade: '30' });
 *
 * @example
 * // Tupla
 * const coords = deserialize<[number, number]>(['number', 'number'], [12.3, 45.6]);
 */
export function deserialize<T>(type: TypeHintNested, data: any): T {
	if (data === null || typeof data !== 'object') {
		return convertPrimitive(<TypeHint>type, data) as any;
	}

	// Array ou tupla
	if (Array.isArray(data)) {
		if (Array.isArray(type)) {
			// Tupla heterogênea (ex: ['string', 'number'])
			const isTuple =
				type.length > 1 ||
				(typeof type[0] !== 'string' && typeof type[0] !== 'function');

			if (isTuple) {
				return data.map((item, index) => {
					const itemType = type[index] ?? type[type.length - 1]; // fallback no último tipo
					return deserialize(itemType, item);
				}) as any;
			}

			// Array homogêneo (ex: ['Pessoa'])
			return data.map((item) => deserialize(type[0], item)) as any;
		}

		throw new Error('Tipo array ou tupla não especificado corretamente.');
	}

	// Instância de classe
	if (typeof type === 'function') {
		const def = findDefinitionByConstructor(type);
		const instance = new type();

		const fields = def?.detalhe || {};
		for (const [key, value] of Object.entries(data)) {
			const fieldType = fields[key];
			if (fieldType) {
				instance[key] = deserialize(fieldType, value);
			} else {
				instance[key] = value;
			}
		}

		return instance;
	}

	// 🔍 Registro por nome (string)
	if (typeof type === 'string') {
		const def = _typeRegistry.get(type);
		if (def?.name) {
			return deserialize(def.name, data);
		}
		return convertPrimitive(type, data) as any;
	}

	return data as T;
}
