import { IPercent, TIOFP } from '../common/interfaces.ts';
import { _PRMs_ } from '../common/params.ts';
import { numberRange, TCurrency, TPercent } from '../common/numbers.ts';
import { HAS } from '../common/generic.ts';

import {
	diaBaseUtilOuProx,
	diaUtilOuProx,
	diasCorridos,
	proximaDataBase,
	TDate,
} from '../common/datas.ts';

import {
	TRCredito,
	TLiberado,
	TFinanciado,
	TParcelaRecord,
	TDemandaCredito,
	inicializaDemandaCredito,
	ExtratoCredito,
	TComputed,
	inicializaIOF,
} from './credito.ts';

/*
 */
export class SAC {
	private _demanda: TDemandaCredito;
	private _iof: TIOFP;
	private _diasPorParcela: [Date, number][] = [];

	/*
	 **/
	constructor(input: any, iof: TIOFP) {
		this._demanda = inicializaDemandaCredito(input);
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

	private _simularDescontos(bruto: number, diasPorParcela: number[]): number {
		const amortizacao = bruto / this._demanda.prazoMeses;
		const encargoFlat = bruto * this._demanda.custos.flat.v.value;

		let encargoIOFdiario =
			amortizacao *
			diasPorParcela.reduce(
				(soma, dias) => soma + dias * this._iof.diario.value,
				0,
			);

		if ('teto' in this._iof && typeof this._iof.teto?.value === 'number') {
			encargoIOFdiario = Math.min(
				encargoIOFdiario,
				bruto * this._iof.teto.value,
			);
		}

		const descontosTotais =
			this._demanda.custos.tac.v.value +
			encargoFlat +
			this._iof.adicional.value +
			encargoIOFdiario;

		return bruto - descontosTotais;
	}

	/*
	 **/
	protected static _sac = (
		demanda: TDemandaCredito,
		naoRepetirAmortiza = true,
	): boolean | TRCredito => {
		if (demanda === null || !('financiado' in demanda)) {
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
			iof: inicializaIOF({
				p: {
					adicional: demanda.iof.p.adicional,
					diario: demanda.iof.p.diario,
					teto: <IPercent>demanda.iof.p.teto
						? <IPercent>demanda.iof.p.teto
						: new TPercent(0),
				},
			}),
			custos: {
				flat: { v: new TCurrency(0) },
				tac: { v: new TCurrency(0) },
			},
		};

		const amortizacaoConstante =
			(<TFinanciado>demanda).financiado.value / demanda.prazoMeses;
		const taxaDiaria = demanda.jurosAm.value / 30; // simplificação: 30 dias no mês

		for (let i = 0; i <= demanda.prazoMeses; i++) {
			let car: boolean = i <= demanda.carenciaDias;
			let jrs: boolean = !car || demanda.jurosNaCarencia;

			/* inicializa com os valores no padrão 0 meses */
			let p: TParcelaRecord = {
				amortizacao: 0,
				juros: 0,
				pagamento: 0,
				saldoDevedor: (<TFinanciado>demanda).financiado,
			} as unknown as TParcelaRecord;

			/* calcula a data desta parcela */
			p.data = diaUtilOuProx(
				i === 0
					? demanda.data_operacao
					: <TDate>(
							proximaDataBase(
								i > 1
									? demanda.data_operacao
									: cmpt.extrato[cmpt.extrato.length - 1].data,
								demanda.diabase,
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
								? demanda.data_operacao
								: cmpt.extrato[cmpt.extrato.length - 1].data,
							p.data,
					  );

			/* calcula parcela */
			if (i > 0) {
				const sldAnterior =
					i > 1
						? (<TFinanciado>demanda).financiado
						: cmpt.extrato[cmpt.extrato.length - 1].saldoDevedor;

				p.amortizacao.value = car
					? 0
					: (naoRepetirAmortiza = true)
					? -1 // indica que o valor é o mesmo da parcela 1, evitando redundancia
					: amortizacaoConstante;
				p.juros.value = jrs ? sldAnterior * (taxaDiaria * p.dias) : 0;

				p.pagamento.value = amortizacaoConstante + p.juros.value;
				p.saldoDevedor.value = sldAnterior - p.amortizacao.value;
			}

			/* soma o total de valores pagos */
			cmpt.i.pgtoTotal += p.pagamento.value;

			/* calcula a maior e menor parcela */
			cmpt.i.maiorParcela = Math.max(cmpt.i.maiorParcela, p.pagamento.value);
			cmpt.i.menorParcela = Math.min(cmpt.i.menorParcela, p.pagamento.value);

			const teto: number =
				HAS('p', cmpt.iof) &&
				//@ts-ignore
				HAS('teto', cmpt.iof.p) &&
				typeof cmpt.iof.p?.teto !== undefined &&
				typeof cmpt.iof.p?.teto?.value === 'number'
					? cmpt.iof.p.teto?.value * (<TFinanciado>demanda).financiado.value
					: -1;

			/*
			 * calcula o IOF diária, sobre o saldo devedor de cada dia
			 * limitado ao teto máximo de IOF na operação (adiciona+diário)
			 * se existir
			 */
			let saldoDevedor_diario: number = p.saldoDevedor.value;
			p.iof.value = 0;
			for (
				i = 1;
				i <= p.dias &&
				teto > 0 &&
				cmpt.iof.c &&
				cmpt.iof.c?.diario.value + p.iof.value + cmpt.iof.c?.adicional.value <
					teto;
				i++
			) {
				saldoDevedor_diario *= demanda.jurosAm.value / 30; // calcula o saldo devedor com base na taxa de juros diária
				p.iof.value += saldoDevedor_diario * <number>cmpt.iof.p?.diario.value;
			}

			/* adicionado */
			cmpt.extrato.push(p);
		}

		return { ...demanda, ...{ computed: cmpt } };
	};

	protected _gerarDiasPorParcela(): [Date, number][] {
		if (!this._diasPorParcela || this._diasPorParcela.length === 0) {
			this._diasPorParcela = (
				this.constructor as typeof SAC
			).__gerarDiasPorParcela(this._demanda);
		}

		return this._diasPorParcela;
	}

	protected static __gerarDiasPorParcela(
		demanda: TDemandaCredito,
	): [Date, number][] {
		const dataOperacao = demanda.data_operacao;

		const dataPrimeiroVenc = diaUtilOuProx(
			new Date(
				dataOperacao.getFullYear(),
				dataOperacao.getMonth(),
				demanda.diabase,
			),
		);

		let vencimentoBase = new Date(dataPrimeiroVenc);
		while (diasCorridos(dataOperacao, vencimentoBase) < demanda.carenciaDias) {
			vencimentoBase.setMonth(vencimentoBase.getMonth() + 1);
			vencimentoBase = diaUtilOuProx(
				new Date(
					vencimentoBase.getFullYear(),
					vencimentoBase.getMonth(),
					demanda.diabase,
				),
			);
		}

		const diasPorParcela: [Date, number][] = [];

		// Primeiro item: [data_operacao, 0]
		diasPorParcela.push([dataOperacao, 0]);

		// Demais parcelas
		for (let i = 0; i < demanda.prazoMeses; i++) {
			const venc = diaUtilOuProx(
				new Date(
					vencimentoBase.getFullYear(),
					vencimentoBase.getMonth() + i,
					demanda.diabase,
				),
			);
			diasPorParcela.push([venc, diasCorridos(dataOperacao, venc)]);
		}

		return diasPorParcela;
	}

	// Estratégia de busca binária com estimativa inicial e margem adaptativa
	// Combina precisão com desempenho, ajustando dinamicamente o intervalo de busca
	public _calcularBrutoNecessario(tolerancia = 0.01, maxIter = 100): number {
		const diasPorParcela: number[] = this._gerarDiasPorParcela();

		if (
			demanda.prazoMeses <= 0 ||
			diasPorParcela.length !== demanda.prazoMeses
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

		const liquidoDesejado = (<TLiberado>this._demanda).liquido.value;

		const estimativaInicial =
			liquidoDesejado *
			(1 +
				this._demanda.custos.flat.v.value +
				this._iof.diario.value +
				this._demanda.custos.tac.v.value +
				this._iof.adicional.value);

		let brutoMin = estimativaInicial * 0.9;
		let brutoMax = estimativaInicial * 1.1;

		let iter = 0;

		while (iter++ < maxIter) {
			const bruto = (brutoMin + brutoMax) / 2;
			const amortizacao = bruto / this._demanda.prazoMeses;

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

			const liquidoCalculado = this._simularDescontos(bruto, diasPorParcela);

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
