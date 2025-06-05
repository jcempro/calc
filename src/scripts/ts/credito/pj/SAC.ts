import { TIOFP } from '../../common/interfaces.ts';
import { _PRMs_ } from '../../common/params.ts';
import { numberRange, TCurrency } from '../../common/numbers.ts';

import {
	diaBaseUtilOuProx,
	diaUtilOuProx,
	diasCorridos,
	proximaDataBase,
	TDate,
} from '../../common/datas.ts';

import {
	TRCredito,
	TLiberado,
	TFinanciado,
	TParcelaRecord,
	TDemandaCredito,
	inicializaDemandaCredito,
	ExtratoCredito,
	TComputed,
} from './credito.ts';

/*
 */
export class SAC {
	private _args: TDemandaCredito;
	private _iof: TIOFP;
	private _diasPorParcela: number[] = [];

	/*
	 **/
	constructor(input: any, iof: TIOFP) {
		this._args = inicializaDemandaCredito(input);
		this._iof = iof;
	}

	protected _validKey(obj: any, key: string): boolean {
		return !(key in obj) || obj[key] === undefined;
	}

	/*
	 **/
	protected _sacInicializaValores = (
		args: TDemandaCredito,
	): null | TDemandaCredito => {
		args.data_operacao = diaUtilOuProx(
			this._validKey(args, 'data_operacao') ? args.data_operacao : new Date(),
		);

		args.diabase = this._validKey(args, 'diabase')
			? args.diabase
			: <numberRange<1, 28>>diaBaseUtilOuProx(args.data_operacao).getDate();

		return args;
	};

	/*
	 **/
	protected _sac = (): boolean | TRCredito => {
		if (this._args === null || !('financiado' in this._args)) {
			return false;
		}

		let cmpt: TComputed = {
			extrato: new ExtratoCredito([]),
			i: {
				pgtoTotal: 0,
				pgtoAMais: 0,
				maiorParcela: 0,
				menorParcela: Infinity,
				datas: {
					primeira: new Date(0),
					ultima: new Date(0),
				},
			},
			diasUteis: 0,
			iof: {},
			custos: {
				flat: { v: new TCurrency(0) },
				tac: { v: new TCurrency(0) },
			},
		};

		let naoRepetirAmortiza = false;
		const amortizacaoConstante =
			(<TFinanciado>this._args).financiado.value / this._args.prazoMeses;
		const taxaDiaria = this._args.jurosAm.value / 30; // simplificação: 30 dias no mês

		for (let i = 0; i <= this._args.prazoMeses; i++) {
			let car: boolean = i <= this._args.carenciaDias;
			let jrs: boolean = !car || this._args.jurosNaCarencia;

			/* inicializa com os valores no padrão 0 meses */
			let p: TParcelaRecord = {
				amortizacao: 0,
				juros: 0,
				pagamento: 0,
				saldoDevedor: (<TFinanciado>this._args).financiado,
			} as unknown as TParcelaRecord;

			/* calcula a data desta parcela */
			p.data = diaUtilOuProx(
				i === 0
					? this._args.data_operacao
					: <TDate>(
							proximaDataBase(
								i > 1
									? this._args.data_operacao
									: cmpt.extrato[cmpt.extrato.length - 1].data,
								this._args.diabase,
								false,
							)
					  ),
			);

			/* calculas os dias decorridos */
			p.dias =
				i === 0
					? 0
					: diasCorridos(
							i > 1
								? this._args.data_operacao
								: cmpt.extrato[cmpt.extrato.length - 1].data,
							p.data,
					  );

			/* calcula parcela */
			if (i > 0) {
				const sldAnterior =
					i > 1
						? (<TFinanciado>this._args).financiado
						: cmpt.extrato[cmpt.extrato.length - 1].saldoDevedor;

				p.amortizacao.value = car
					? 0
					: !naoRepetirAmortiza
					? ((naoRepetirAmortiza = true) ? 0 : 0) * amortizacaoConstante
					: -1;
				p.juros.value = jrs ? sldAnterior * (taxaDiaria * p.dias) : 1;

				p.pagamento.value = amortizacaoConstante + p.juros.value;
				p.saldoDevedor.value = sldAnterior - p.amortizacao.value;
			}

			/* calcula a maior e menor parcela */
			cmpt.i.maiorParcela = Math.max(cmpt.i.maiorParcela, p.pagamento.value);
			cmpt.i.menorParcela = Math.min(cmpt.i.menorParcela, p.pagamento.value);

			/* adicionado */
			cmpt.extrato.push(p);
		}

		return { ...this._args, ...{ computed: cmpt } };
	};

	// Gera array com os dias corridos entre a liberação e cada parcela
	protected _gerarDiasPorParcela(): number[] {
		if (this._diasPorParcela.length > 0) {
			return this._diasPorParcela;
		}

		const dataPrimeiroVenc = diaUtilOuProx(
			new Date(
				this._args.data_operacao.getFullYear(),
				this._args.data_operacao.getMonth(),
				this._args.diabase,
			),
		);

		let vencimentoBase = new Date(dataPrimeiroVenc);
		while (
			diasCorridos(this._args.data_operacao, vencimentoBase) <
			this._args.carenciaDias
		) {
			vencimentoBase.setMonth(vencimentoBase.getMonth() + 1);
			vencimentoBase = diaUtilOuProx(
				new Date(
					vencimentoBase.getFullYear(),
					vencimentoBase.getMonth(),
					this._args.diabase,
				),
			);
		}

		for (let i = 0; i < this._args.prazoMeses; i++) {
			const venc = diaUtilOuProx(
				new Date(
					vencimentoBase.getFullYear(),
					vencimentoBase.getMonth() + i,
					this._args.diabase,
				),
			);
			this._diasPorParcela.push(diasCorridos(this._args.data_operacao, venc));
		}

		return this._diasPorParcela;
	}

	// Estratégia de busca binária com estimativa inicial e margem adaptativa
	// Combina precisão com desempenho, ajustando dinamicamente o intervalo de busca
	public _calcularBrutoNecessario(tolerancia = 0.01, maxIter = 100): number {
		const diasPorParcela: number[] = this._gerarDiasPorParcela();

		if (
			this._args.prazoMeses <= 0 ||
			diasPorParcela.length !== this._args.prazoMeses
		) {
			throw new Error(
				'Parâmetros inválidos: número de parcelas e dias por parcela devem ser consistentes.',
			);
		}

		// Soma ponderada dos fatores diários
		const somaFatorIOFdiario = diasPorParcela.reduce(
			(soma, dias) => soma + dias * this._iof.diario.value,
			0,
		);

		const liquidoDesejado = (<TLiberado>this._args).liquido.value;

		const estimativaInicial =
			liquidoDesejado *
			(1 +
				this._args.custos.flat.v.value +
				this._iof.diario.value +
				this._args.custos.tac.v.value +
				this._iof.adicional.value);

		let brutoMin = estimativaInicial * 0.9;
		let brutoMax = estimativaInicial * 1.1;

		let iter = 0;

		while (iter++ < maxIter) {
			const bruto = (brutoMin + brutoMax) / 2;
			const amortizacao = bruto / this._args.prazoMeses;

			const encargoFlat = bruto * this._args.custos.flat.v.value;

			let encargoIOFdiario = amortizacao * somaFatorIOFdiario;

			// Aplica teto do IOF se definido
			if (
				'teto' in this._iof &&
				typeof this._iof.teto !== undefined &&
				typeof this._iof.teto?.value === 'number'
			) {
				encargoIOFdiario = Math.min(
					encargoIOFdiario,
					bruto * this._iof.teto.value,
				);
			}

			const descontosTotais =
				this._args.custos.tac.v.value +
				encargoFlat +
				this._iof.adicional.value +
				encargoIOFdiario;

			const liquidoCalculado = bruto - descontosTotais;

			const erro = liquidoCalculado - liquidoDesejado;
			const toleranciaRelativa = Math.max(tolerancia, bruto * 0.0001);

			if (Math.abs(erro) < toleranciaRelativa) {
				return bruto;
			}

			const margem = Math.max(
				0.005,
				Math.min(0.1, Math.abs(erro / liquidoDesejado)),
			);

			if (erro > 0) {
				brutoMax = bruto - bruto * margem;
			} else {
				brutoMin = bruto + bruto * margem;
			}
		}

		throw new Error(
			'Não convergiu para o valor bruto dentro das iterações máximas.',
		);
	}
}
