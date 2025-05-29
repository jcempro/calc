import { numberRange } from '../../common.ts';

export enum TSacPrice {
	SAC = 1,
	PRICE = 2,
}

export type TParcelaDemo = {
	amortizacao: number;
	juros: number;
	pagamento: number;
	saldoDevedor: number;
	data: Date;
	dias: number;
};

export type TExtratoCredito = TParcelaDemo[];

export type TLiberado = {
	liquido: number;
};

export type TFinanciado = {
	financiado: number;
};

export type TCreditoAlvo = TFinanciado | TLiberado | (TFinanciado & TLiberado);

export type TDemandaCredito = TCreditoAlvo & {
	data_operacao: Date;
	diabase: numberRange<1, 28>;
	juros: numberRange<0.0, 1.0>;
	prazo: numberRange<1, 460>;
	carencia: numberRange<0, 360>;
	tac: number;
	flat: number;
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
