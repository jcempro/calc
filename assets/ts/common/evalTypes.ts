export type TTypeRegistry = Record<string, new (...args: any[]) => any>;

// Registro global de tipos para desserialização
const typeRegistry: TTypeRegistry = {};

/**
 * Registra uma classe customizada para uso posterior durante a desserialização
 * @param name Nome do tipo
 * @param cls Construtor da classe
 */
export function registerType(name: string, cls: new (...args: any[]) => any) {
	typeRegistry[name] = cls;
}

// Tipos auxiliares
export type TypeHint = string;

/**
 * Converte um valor de acordo com o tipo informado
 */
export function parseValue(type: TypeHint, value: any): any {
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
			const ClassRef = typeRegistry[type];
			if (ClassRef) return new ClassRef(value);
			throw new Error(`Tipo não registrado: ${type}`);
	}
}
