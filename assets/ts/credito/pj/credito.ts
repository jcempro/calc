import {
	numberRange,
	validarNumero,
	validarEnum,
	toDate,
	validarBoolean,
	TPercent,
	TCurrency,
	TDiaMes,
} from '../../common.ts';

export enum TSacPrice {
	SAC = 1,
	PRICE = 2,
}

export type TParcelaDemo = {
	amortizacao: TCurrency;
	juros: TPercent;
	pagamento: TCurrency;
	saldoDevedor: TCurrency;
	data: Date;
	dias: number;
};

export type TExtratoCredito = TParcelaDemo[];

export type TLiberado = {
	liquido: TCurrency;
};

export type TFinanciado = {
	financiado: TCurrency;
};

export type TCreditoAlvo = TFinanciado | TLiberado | (TFinanciado & TLiberado);

export type TDemandaCredito = TCreditoAlvo & {
	data_operacao: Date;
	diabase: TDiaMes;
	jurosAm: TPercent;
	prazoMeses: number;
	carenciaDias: number;
	tac: TPercent;
	flat: TPercent;
	tipo: TSacPrice;
	jurosNaCarencia: boolean;
};

export type TRCredito = TDemandaCredito & {
	info: {
		datas: {
			primeira: Date;
			ultima: Date;
		};
		diasUteis: number;
		iofFixo: number;
		iofDiario: number;
	};
	repo: {
		pgtoTotal: number;
		pgtoAMais: number;
		maiorParcela: number;
		menorParcela: number;
		extrato: TExtratoCredito;
	};
};

export function inicializaDemandaCredito(data?: any): TDemandaCredito {
	const obj = typeof data === 'object' && data !== null ? data : {};

	const get = <T>(key: string): T | undefined =>
		Object.prototype.hasOwnProperty.call(obj, key)
			? (obj[key] as T)
			: undefined;

	return {
		// TCreditoAlvo
		financiado: new TCurrency(get<number>('financiado'), (v)=>validarNumero(v, 0)),
		liquido: new TCurrency(validarNumero(get<number>('liquido'), 0)),

		// TDemandaCredito
		data_operacao: toDate(get<unknown>('data_operacao'), new Date()),

		diabase: validarNumero(get<number>('diabase'), 30, 1, 28) as TDiaMes,
		jurosAm: new TPercent(
			validarNumero(get<number>('jurosAm'), 0.01, 0.0, 1.0),
		),
		prazoMeses: validarNumero(get<number>('prazoMeses'), 12, 1, 460),
		carenciaDias: validarNumero(get<number>('carenciaDias'), 0, 0, 360),

		tac: new TPercent(validarNumero(get<number>('tac'), 0)),
		flat: new TPercent(validarNumero(get<number>('flat'), 0)),

		tipo: validarEnum(
			get<number>('tipo'),
			[TSacPrice.SAC, TSacPrice.PRICE],
			TSacPrice.SAC,
		),

		jurosNaCarencia: validarBoolean(get<unknown>('jurosNaCarencia'), false),
	};
}
