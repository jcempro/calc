import Logger from '../utils/logger';
import { RecordT, T_get_nested } from './interfaces';
import { HAS } from './logicos';

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
