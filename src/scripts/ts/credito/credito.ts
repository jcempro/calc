import { HAS, validarBoolean } from '../common/generic.ts';

import {
	ParcialKeys,
	TIOF,
	TIOFP,
	TOBJ,
	TTeto,
	TTeto_full,
	T_get_nested,
} from '../common/interfaces.ts';

import { toDate, TDiaMes } from '../common/datas.ts';
import {
	validarEnum,
	validarNumero,
	TCurrency,
	TPercent,
	TNumberTypes,
	ENumberIs,
} from '../common/numbers.ts';

import { registerType } from '../common/evalTypes.ts';

import { Meta, MetaTuple } from '../common/MetaTurple.ts';

import { GET } from '../common/generic.ts';
import { Logger } from '../utils/logger.ts';
import { __FILE_LINE__ } from '../types/env';

//MetaTuple
registerType('TCurrency', TCurrency);
registerType('TPercent', TPercent);

export enum TSacPrice {
	SAC = 1,
	PRICE = 2,
}

export type TParcelaRecord = {
	amortizacao: TCurrency;
	juros: TPercent;
	pagamento: TCurrency;
	saldoDevedor: TCurrency;
	data: Date;
	dias: number;
	iof: TCurrency;
};

export class ExtratoCredito extends MetaTuple<TParcelaRecord> {
	public static _TParcelaRecordMeta: Meta<TParcelaRecord> = [
		['amortizacao', 'TCurrency'],
		['juros', 'TPercent'],
		['pagamento', 'TCurrency'],
		['saldoDevedor', 'TCurrency'],
		['data', 'Date'],
		['dias', 'number'],
		['iof', 'TCurrency'],
	];
	constructor(data?: (Partial<TParcelaRecord> | any[])[]) {
		super(ExtratoCredito._TParcelaRecordMeta, data);
	}
}

export type TCreditoAlvo = {
	financiado?: TCurrency;
	liquido?: TCurrency;
};

export type TFlatTAC = TTeto & {
	v: TNumberTypes;
};

export type TFlatTAC_full = TTeto_full & {
	v: TNumberTypes;
	teto: TCurrency;
};

export type TCustos = {
	flat: TFlatTAC;
	tac: TFlatTAC;
};

export type TDemandaCreditoDatas = {
	data_operacao: Date;
	diabase: TDiaMes;
	prazoMeses: number;
};

export type TDemandaCredito = TDemandaCreditoDatas &
	TCreditoAlvo & {
		jurosAm: TPercent;
		carenciaDias: number;
		custos: TCustos;
		tipo: TSacPrice;
		jurosNaCarencia: boolean;
		simplesn: boolean;
		iof: TIOF;
	};

export type TDemandaCreditoMinimo = ParcialKeys<
	Required<TDemandaCredito>,
	'data_operacao' | 'diabase' | 'financiado' | 'liquido'
>;

export type TDemandaCreditoAceitavel = ParcialKeys<
	TDemandaCredito,
	'data_operacao' | 'diabase' | 'liquido' | 'financiado'
>;

export type TComputed = {
	diasUteis: number;
	iof: Partial<TIOF>;
	custos: TCustos;
	i: {
		datas: {
			primeira: Date;
			ultima: Date;
		};
		pgtoTotal: number;
		pgtoAMais: number;
		maiorParcela: number;
		menorParcela: number;
	};
	extrato: ExtratoCredito;
};

export type TRCredito = TDemandaCredito & {
	computed: TComputed;
};

export type TcreditoDefault = {
	iof: {
		pf: TIOFP;
		pj: TIOFP;
	};
};

export abstract class credito {
	protected static _default: TcreditoDefault;

	static def(input?: TcreditoDefault): TcreditoDefault {
		if (input) {
			credito._default = input;
		}

		if (!credito._default) {
			Logger.error(
				`credito.default ainda não foi inicializado.`,
				{
					_defaut: credito._default,
					line: __FILE_LINE__,
				},
				true,
			);
		}

		return credito._default;
	}

	public static inicializaIOF(
		data: any,
		tipo: 'pf' | 'pj' = 'pj',
	): TIOF {
		const obj = typeof data === 'object' && data !== null ? data : {};
		const get = <T>(key: T_get_nested): T | undefined =>
			GET(key, obj);

		return {
			p: {
				diario: <TNumberTypes>(
					new TPercent(
						validarNumero(
							get<number>(['p', 'diario']),
							credito.def().iof[tipo].diario.value,
						),
					)
				),
				adicional: <TNumberTypes>(
					new TPercent(
						validarNumero(
							get<number>(['p', 'adicional']),
							credito.def().iof[tipo].adicional.value,
						),
					)
				),
				teto: <TNumberTypes>(
					new TPercent(
						validarNumero(
							get<number>(['p', 'teto']),
							credito.def().iof[tipo].teto?.value ?? 0,
						),
					)
				),
			},
			c: {
				diario: <TNumberTypes>(
					new TPercent(validarNumero(get<number>(['c', 'diario']), 0))
				),
				adicional: <TNumberTypes>(
					new TPercent(
						validarNumero(get<number>(['c', 'adicional']), 0),
					)
				),
			},
		};
	}

	/**
	 * Inicializa uma instância do tipo `TDemandaCredito` com validações e valores padrão,
	 * a partir de um objeto de entrada genérico (`any`). Os campos são validados conforme
	 * os tipos esperados e, quando ausentes ou inválidos, valores padrão são aplicados.
	 *
	 * A função serve como uma etapa de sanitização e preparação de dados para processos
	 * de simulação ou cálculo de crédito.
	 *
	 * @param {any} data - Objeto contendo os dados brutos para inicialização do crédito.
	 * Pode conter as seguintes propriedades:
	 *   - `financiado` {number} Valor total financiado (obrigatório)
	 *   - `liquido` {number} Valor líquido a ser recebido (obrigatório)
	 *   - `data_operacao` {string|Date} Data da operação (opcional, padrão: `new Date()`)
	 *   - `diabase` {number} Número de dias por mês para base de cálculo (opcional, padrão: 30)
	 *   - `jurosAm` {number} Taxa de juros ao mês como percentual (opcional, padrão: 0.01)
	 *   - `prazoMeses` {number} Número de meses do financiamento (opcional, padrão: 12)
	 *   - `carenciaDias` {number} Dias de carência até o primeiro pagamento (opcional, padrão: 0)
	 *   - `tac` {number} Custo TAC em percentual (opcional, padrão: 0)
	 *   - `flat` {number} Custo flat em percentual (opcional, padrão: 0)
	 *   - `tipo` {number} Tipo de sistema de amortização: 1 (SAC) ou 2 (PRICE). (opcional, padrão: 1)
	 *   - `jurosNaCarencia` {boolean} Se os juros devem ser aplicados durante a carência (opcional, padrão: `false`)
	 *
	 * @returns {TDemandaCredito} Um objeto tipado com dados validados e prontos para uso.
	 *
	 */

	public static inicializaDemandaCredito(
		data: TDemandaCreditoMinimo,
		tipo: 'pf' | 'pj' = 'pj',
		emit_error: boolean = true,
	): TDemandaCredito {
		const obj: TOBJ =
			typeof data === 'object' && data !== null ? data : {};

		const get = <T>(
			key: T_get_nested,
			gera_erro: boolean = true,
		): T | undefined =>
			GET(
				key,
				obj,
				emit_error && gera_erro ?
					(k: PropertyKey) => {
						Logger.error(
							`inicializaDemandaCredito: Propriedade obrigatória '${key}' inexistente, esperado TDemandaCredito.`,
							{
								ags: {
									data: data,
									tipo: tipo,
									emit_error: emit_error,
								},
								line: __FILE_LINE__,
							},
							true,
						);
					}
				:	undefined,
			);

		const getDef = (k: PropertyKey, def: number = 0): any => {
			let rr = get<number>(k as string, false);

			rr = rr !== undefined ? validarNumero(rr, def) : def;
			return rr;
		};

		const dt_op: Date = toDate(
			get<unknown>('data_operacao', false),
			new Date(),
		);

		return {
			...((): TCreditoAlvo => {
				let financiado = getDef('financiado', 0);
				let liquido = getDef('liquido', 0);

				if (!financiado && !liquido) {
					Logger.error(
						`inicializaDemandaCredito: propriedade 'financiado' ou 'liquido' devm existir em TDemandaCredito.`,
						{
							ags: {
								data: data,
								tipo: tipo,
								emit_error: emit_error,
							},
							line: __FILE_LINE__,
						},
						true,
					);
				}

				let r: TOBJ = {};
				if (financiado) {
					r['financiado'] = new TCurrency(financiado);
				}

				if (liquido) {
					r['liquido'] = new TCurrency(liquido);
				}

				return <TCreditoAlvo>r;
			})(),
			// TDemandaCredito
			data_operacao: dt_op,

			diabase: validarNumero(
				get<number>('diabase', false),
				30,
				1,
				dt_op.getDate(),
			) as TDiaMes,
			jurosAm: new TPercent(
				validarNumero(get<number>('jurosAm'), 0.01, 0.0, 1.0),
			),
			prazoMeses: validarNumero(
				get<number>('prazoMeses'),
				12,
				1,
				460,
			),
			carenciaDias: validarNumero(
				get<number>('carenciaDias'),
				0,
				0,
				360,
			),

			custos: {
				tac: {
					v: <TNumberTypes>(
						new TPercent(validarNumero(get<number>('tac'), 0))
					),
				},
				flat: {
					v: <TNumberTypes>(
						new TPercent(validarNumero(get<number>('flat'), 0))
					),
				},
			},

			iof: credito.inicializaIOF(obj.iof),

			tipo: validarEnum(
				get<number>('tipo'),
				[TSacPrice.SAC, TSacPrice.PRICE],
				TSacPrice.SAC,
			),

			jurosNaCarencia: validarBoolean(
				get<unknown>('jurosNaCarencia'),
				false,
			),
			simplesn: false,
		};
	}

	public static limitTeto<T extends number | TCurrency = TCurrency>(
		bruto: T,
		source: TFlatTAC | TIOFP,
		acumulado: number,
		atingiuCall?: (limite: number) => void,
	): T {
		const b: number = typeof bruto === `number` ? bruto : bruto.value;
		let r = acumulado;

		if (HAS(`teto`, source)) {
			const t: TNumberTypes = (<TFlatTAC_full>source).teto;
			if (t.tipo === ENumberIs.currency && r > t.value) {
				r = t.value;
			} else if (t.tipo === ENumberIs.percentual && r > t.value * b) {
				r = t.value * b;

				if (atingiuCall) {
					atingiuCall(b);
				}
			}
		}

		if (typeof bruto === `number`) {
			return <T>r;
		}

		return <T>new TCurrency(r);
	}

	public static calcFlatTacIof<
		T extends number | TCurrency = TCurrency,
	>(
		bruto: T,
		source: TFlatTAC | TIOFP,
		caller: string,
		tipo: `TAC` | `FLAT` | `IOF`,
	): T {
		const valor: TNumberTypes =
			HAS('v', source) ?
				(<TFlatTAC>source).v
			:	((<TIOFP>source).adicional as TNumberTypes);

		const b: number = typeof bruto === `number` ? bruto : bruto.value;

		let r: number =
			valor.tipo === ENumberIs.currency ? valor.value
			: valor.tipo === ENumberIs.percentual ? valor.value * b
			: ((): number => {
					throw `${caller}->calcFlatTAC: ${tipo} não é percentual nem moeda.`;
				})();

		return credito.limitTeto<T>(bruto, source, r);
	}
}
