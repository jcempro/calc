import { validarBoolean } from '../common/generic.ts';

import { TIOF, T_get_nested } from '../common/interfaces.ts';

import { toDate, TDiaMes } from '../common/datas.ts';
import {
	validarEnum,
	validarNumero,
	TCurrency,
	TPercent,
	TNumberTypes,
} from '../common/numbers.ts';

import { registerType } from '../common/evalTypes.ts';

import { Meta, MetaTuple } from '../common/MetaTurple.ts';

import { GET } from '../common/generic.ts';

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

export type TLiberado = {
	liquido: TCurrency;
};

export type TFinanciado = {
	financiado: TCurrency;
};

export type TCreditoAlvo = TFinanciado | TLiberado | (TFinanciado & TLiberado);

export type TFlatTAC = {
	v: TNumberTypes;
	teto?: TCurrency;
};

export type TFlatTAC_full = {
	v: TNumberTypes;
	teto: TCurrency;
};

export type TCustos = {
	flat: TFlatTAC;
	tac: TFlatTAC;
};

export interface IDemandaCreditoDatas {
	data_operacao: Date;
	diabase: TDiaMes;
	prazoMeses: number;
}

export type TDemandaCredito = TCreditoAlvo &
	IDemandaCreditoDatas & {
		jurosAm: TPercent;
		carenciaDias: number;
		custos: TCustos;
		tipo: TSacPrice;
		jurosNaCarencia: boolean;
		simplesn: boolean;
		iof: TIOF;
	};

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

export function inicializaIOF(data: any): TIOF {
	const obj = typeof data === 'object' && data !== null ? data : {};
	const get = <T>(key: T_get_nested): T | undefined => GET(key, obj);

	return {
		p: {
			diario: <TNumberTypes>(
				new TPercent(validarNumero(get<number>(['p', 'diario']), 0))
			),
			adicional: <TNumberTypes>(
				new TPercent(validarNumero(get<number>(['p', 'adicional']), 0))
			),
			teto: <TNumberTypes>(
				new TPercent(validarNumero(get<number>(['p', 'teto']), 0))
			),
		},
		c: {
			diario: <TNumberTypes>(
				new TPercent(validarNumero(get<number>(['c', 'diario']), 0))
			),
			adicional: <TNumberTypes>(
				new TPercent(validarNumero(get<number>(['c', 'adicional']), 0))
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

export function inicializaDemandaCredito(data: any): TDemandaCredito {
	const obj = typeof data === 'object' && data !== null ? data : {};

	const get = <T>(key: T_get_nested): T | undefined => GET(key, obj);

	return {
		// TCreditoAlvo
		financiado: new TCurrency(get<number>('financiado'), (v) =>
			validarNumero(v, 0),
		),
		liquido: new TCurrency(validarNumero(get<number>('liquido'), 0)),

		// TDemandaCredito
		data_operacao: toDate(get<unknown>('data_operacao'), new Date()),

		diabase: validarNumero(get<number>('diabase'), 30, 1, 28) as TDiaMes,
		jurosAm: new TPercent(
			validarNumero(get<number>('jurosAm'), 0.01, 0.0, 1.0),
		),
		prazoMeses: validarNumero(get<number>('prazoMeses'), 12, 1, 460),
		carenciaDias: validarNumero(get<number>('carenciaDias'), 0, 0, 360),

		custos: {
			tac: {
				v: <TNumberTypes>new TPercent(validarNumero(get<number>('tac'), 0)),
			},
			flat: {
				v: <TNumberTypes>new TPercent(validarNumero(get<number>('flat'), 0)),
			},
		},

		iof: inicializaIOF(obj.iof),

		tipo: validarEnum(
			get<number>('tipo'),
			[TSacPrice.SAC, TSacPrice.PRICE],
			TSacPrice.SAC,
		),

		jurosNaCarencia: validarBoolean(get<unknown>('jurosNaCarencia'), false),
		simplesn: false,
	};
}
