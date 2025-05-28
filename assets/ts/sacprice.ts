import {
	isDiaUtil,
	teto,
	tetoPiso,
	diaBaseUtilOuProx,
	diaUtilOuProx,
	diasCorridos,
	proximaDataBase,
	numberRange,
} from './common.ts';

export enum TSacPrice {
	SAC = 1,
	PRICE = 2,
}

export type TParcelaDemo = {
	capital: number;
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
	carencia: numberRange<0, 24>;
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

/*
 */
export abstract class credito {
	private args: null | TDemandaCredito;

	/*
	 **/
	constructor(args: TDemandaCredito) {
		this.args = this._sacInicializaValores(args);
	}

	protected validKey(obj: any, key: string): Boolean {
		return !(key in obj) || typeof obj.data_operacao != undefined;
	}

	/*
	 **/
	protected _sacInicializaValores = (
		args: TDemandaCredito,
	): null | TDemandaCredito => {
		args.data_operacao = diaUtilOuProx(
			this.validKey(args, 'data_operacao') ? args.data_operacao : new Date(),
		);

		args.data_operacao = diaUtilOuProx(args.data_operacao);

		args.diabase = this.validKey(args, 'diabase')
			? args.diabase
			: <numberRange<1, 28>>diaBaseUtilOuProx(args.data_operacao).getDate();

		return args;
	};

	/*
	 **/
	protected _sac = (): Boolean | TRCredito => {
		if (this.args === null || !('financiado' in this.args)) {
			return false;
		}

		let r: TRCredito = this.args as TRCredito;

		for (let i = 0; i <= r.prazo; i++) {
			let car: Boolean = i <= r.carencia;
			let jrs: Boolean = !car || r.jurosNaCarencia;

			/* inicializa com os valores no padrão 0 meses */
			let p: TParcelaDemo = <TParcelaDemo>{
				capital: 0,
				juros: 0,
				pagamento: 0,
				saldoDevedor: (<TFinanciado>r).financiado,
			};

			/* calcula a data desta parcela */
			p.data =
				i === 0
					? r.data_operacao
					: proximaDataBase(
							i > 1
								? r.data_operacao
								: r.repo.extrato[r.repo.extrato.length - 1].data,
							r.diabase,
							false,
					  );

			/* calculas os dias decorridos */
			p.dias =
				i === 0
					? 0
					: diasCorridos(
							i > 1
								? r.data_operacao
								: r.repo.extrato[r.repo.extrato.length - 1].data,
							p.data,
					  );

			/* calcula parcela */
			if (i > 0) {
				p.capital = car ? 0 : 1;
				p.juros = !jrs ? 0 : 1;
				p.pagamento = p.capital + p.juros;
				p.saldoDevedor =
					(i > 1
						? (<TFinanciado>r).financiado
						: r.repo.extrato[r.repo.extrato.length - 1].saldoDevedor) -
					p.pagamento;
			}

			/* calcula a maior e menor parcela */
			r.repo.maiorParcela = Math.max(r.repo.maiorParcela, p.pagamento);
			r.repo.menorParcela = Math.min(r.repo.menorParcela, p.pagamento);

			/* adicionado */
			r.repo.extrato.push(p);
		}

		return r;
	};
}
