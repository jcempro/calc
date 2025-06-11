import { IPercent, TIOF_full, TIOFP } from '../common/interfaces.ts';
import { _PRMs_ } from '../common/params.ts';
import { ENumberIs, numberRange, TCurrency, TNumberTypes, TPercent } from '../common/numbers.ts';
import { HAS, PropertyStr } from '../common/generic.ts';

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
	//	DemandaCreditoDatas,
	IDemandaCreditoDatas,
	TFlatTAC_full,
	calcFlatTacIof,
} from './credito.ts';

type TDiasCount = {
	lista: [Date, number][];
	total: number;
};
type AsString<T> = T extends string ? T : string;

export class DiasCountCacheRecordkey extends PropertyStr<IDemandaCreditoDatas> { }
export type TDiasCountCacheRecord = Record<
	AsString<DiasCountCacheRecordkey>,
	TDiasCount
>;

/*
 */
export class SAC {
	private _demanda: TDemandaCredito;
	private _iof: TIOFP;
	private _diasPorParcela: TDiasCount = { lista: [], total: 0 };
	private static _cache__diasPorParcela: TDiasCountCacheRecord = {};

	/*
	 **/
	constructor(input: any, iof: TIOFP) {
		this._demanda = inicializaDemandaCredito(input);
		this._iof = iof;
	}

	protected _has(obj: any, key: string): boolean {
		return HAS(key, obj);
	}

	/*
	 **/
	protected _sacInicializaValores = (
		args: TDemandaCredito,
	): null | TDemandaCredito => {
		args.data_operacao = diaUtilOuProx(
			this._has(args, 'data_operacao') ? args.data_operacao : new Date(),
		);

		args.diabase = this._has(args, 'diabase')
			? args.diabase
			: <numberRange<1, 28>>diaBaseUtilOuProx(args.data_operacao).getDate();

		return args;
	};

	public _sac = (
		naoRepetirAmortiza = true,
	): boolean | TRCredito => {
		if (
			!HAS(`financiado`, this._demanda) &&
			!HAS(`liquido`, this._demanda)) {
			throw new Error(`SAC:__sac: É necessário informar 'liquido' ou 'financiado'.`);
		}

		return HAS(`financiado`, this._demanda)
			? (this.constructor as typeof SAC).__sac(this._demanda, naoRepetirAmortiza)
			: HAS(`liquido`, this._demanda)
				? this._decobreBrutoNecessarioECalcula(naoRepetirAmortiza)
				: false;
	}

	/*
	 **/
	protected static __sac = (
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
					teto: <TPercent>demanda.iof.p.teto
						? <TPercent>demanda.iof.p.teto
						: new TPercent(0),
				}
			}),
			custos: {
				flat: { v: new TCurrency(0) },
				tac: { v: new TCurrency(0) },
			},
		};

		const amortizacaoConstante =
			(<TFinanciado>demanda).financiado.value / demanda.prazoMeses;
		const jurosDiario = demanda.jurosAm.value / 30; // simplificação: 30 dias no mês

		const datas = this.__gerarDiasPorParcela(demanda);

		for (let j = 0; j < datas.lista.length; j++) {
			let car: boolean = j <= demanda.carenciaDias;
			let jrs: boolean = !car || demanda.jurosNaCarencia;

			/* inicializa com os valores no padrão 0 meses */
			let p: TParcelaRecord = {
				amortizacao: 0,
				juros: 0,
				pagamento: 0,
				saldoDevedor: (<TFinanciado>demanda).financiado,
			} as unknown as TParcelaRecord;

			/* calcula a data desta parcela */
			p.data = datas.lista[j][0];

			/* calculas os dias decorridos */
			p.dias = datas.lista[j][1];

			/* calcula parcela */
			if (j > 0) {
				const sldAnterior =
					j === 1
						? (<TFinanciado>demanda).financiado
						: cmpt.extrato[cmpt.extrato.length - 1].saldoDevedor;

				p.amortizacao.value = car
					? 0
					: naoRepetirAmortiza
						? -1 // indica que o valor é o mesmo da parcela 1, evitando replicação do mesmo valor
						: amortizacaoConstante;
				p.juros.value = jrs ? sldAnterior * (jurosDiario * p.dias) : 0;

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
					HAS('teto', <TIOFP>cmpt.iof.p) &&
					typeof cmpt.iof.p?.teto !== 'undefined' &&
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
				let d = 1;
				d <= p.dias &&
				teto > 0 &&
				cmpt.iof.c &&
				cmpt.iof.c?.diario.value + p.iof.value + cmpt.iof.c?.adicional.value <
				teto;
				d++
			) {
				saldoDevedor_diario *= (jurosDiario + 1); // calcula o saldo devedor com base na taxa de juros diária
				p.iof.value += saldoDevedor_diario * <number>cmpt.iof.p?.diario.value;
			}

			(<TIOF_full>cmpt.iof).c.diario.value += p.iof.value;

			/* adicionado */
			cmpt.extrato.push(p);
		}

		/* aqui calculamos a tac */
		cmpt.custos.tac.v = calcFlatTacIof(
			demanda.financiado,
			demanda.custos.tac,
			`SAC::__sac`,
			`TAC`
		);

		/* aqui calculamos a flat */
		cmpt.custos.flat.v = calcFlatTacIof(
			demanda.financiado,
			demanda.custos.flat,
			`SAC::__sac`,
			`FLAT`
		);

		/* aqui calculamos a IOF */
		(<TIOF_full>cmpt.iof).c.adicional = calcFlatTacIof(
			demanda.financiado as TCurrency,
			demanda.iof.p,
			`SAC::__sac`,
			`IOF`
		);

		/* aqui calculamos o valor líquido */
		(<TLiberado>demanda).liquido.value =
			demanda.financiado.value
			- (<TIOF_full>cmpt.iof).c.diario.value
			- (<TIOF_full>cmpt.iof).c.adicional.value
			- cmpt.custos.flat.v.value
			- cmpt.custos.tac.v.value
			;

		return { ...demanda, ...{ computed: cmpt } };
	};

	protected _gerarDiasPorParcela(): TDiasCount {
		if (
			!this._diasPorParcela ||
			!this._diasPorParcela.lista ||
			this._diasPorParcela.lista.length === 0
		) {
			this._diasPorParcela = (
				this.constructor as typeof SAC
			).__gerarDiasPorParcela(this._demanda);
		}

		return this._diasPorParcela;
	}

	protected static __gerarDiasPorParcela(demanda: TDemandaCredito): TDiasCount {
		const cache_key: string = (<String>(
			new DiasCountCacheRecordkey(<IDemandaCreditoDatas>demanda)
		)) as string;

		if (!HAS(<string>cache_key, SAC._cache__diasPorParcela)) {
			const dataOperacao = demanda.data_operacao;
			let total_dias = 0;

			const dataPrimeiroVenc = diaUtilOuProx(
				new Date(
					dataOperacao.getFullYear(),
					dataOperacao.getMonth(),
					demanda.diabase,
				),
			);

			let vencimentoBase = new Date(dataPrimeiroVenc);
			while (
				diasCorridos(dataOperacao, vencimentoBase) < demanda.carenciaDias
			) {
				vencimentoBase.setMonth(vencimentoBase.getMonth() + 1);
				vencimentoBase = diaUtilOuProx(
					new Date(
						vencimentoBase.getFullYear(),
						vencimentoBase.getMonth(),
						demanda.diabase,
					),
				);
			}

			const diasPorParcela: TDiasCount = {
				lista: [],
				total: 0,
			};

			// Primeiro item: [data_operacao, 0]
			diasPorParcela.lista.push([dataOperacao, 0]);

			// Demais parcelas
			for (let i = 0; i < demanda.prazoMeses; i++) {
				const venc = diaUtilOuProx(
					new Date(
						vencimentoBase.getFullYear(),
						vencimentoBase.getMonth() + i,
						demanda.diabase,
					),
				);
				const dias = diasCorridos(dataOperacao, venc);
				diasPorParcela.lista.push([venc, dias]);
				diasPorParcela.total += dias;
			}

			this._cache__diasPorParcela[cache_key] = diasPorParcela;
		}

		return this._cache__diasPorParcela[cache_key];
	}

	// Estratégia de busca binária com estimativa inicial e margem adaptativa
	// Combina precisão com desempenho, ajustando dinamicamente o intervalo de busca
	public _decobreBrutoNecessarioECalcula(naoRepetirAmortiza = true, tolerancia = 0.01, maxIter = 100): boolean | TRCredito {
		return (this.constructor as typeof SAC).__decobreBrutoNecessarioECalcula(
			this._demanda,
			naoRepetirAmortiza,
			tolerancia,
			maxIter,
		);
	}

	// Estratégia de busca binária com estimativa inicial e margem adaptativa
	// Combina precisão com desempenho, ajustando dinamicamente o intervalo de busca
	public static __decobreBrutoNecessarioECalcula(
		demanda: TDemandaCredito,
		naoRepetirAmortiza = true,
		tolerancia = 0.01,
		maxIter = 100,
	): boolean | TRCredito {
		const diasPorParcela: TDiasCount = SAC.__gerarDiasPorParcela(demanda);

		if (
			demanda.prazoMeses <= 0 ||
			diasPorParcela.lista.length !== demanda.prazoMeses
		) {
			throw new Error(
				'Parâmetros inválidos: número de parcelas e dias por parcela devem ser consistentes.',
			);
		}

		// Soma ponderada dos fatores diários
		const somaFatorIOFdiario =
			((demanda.iof.p.diario.value + 1) ^ diasPorParcela.total) - 1;

		const liquidoDesejado = (<TLiberado>demanda).liquido.value;

		const estimativaInicial =
			liquidoDesejado *
			(1 +
				demanda.custos.flat.v.value +
				demanda.iof.p.diario.value +
				demanda.custos.tac.v.value +
				demanda.iof.p.adicional.value);

		let brutoMin = estimativaInicial * 0.9;
		let brutoMax = estimativaInicial * 1.1;

		let iter = 0;

		while (iter++ < maxIter) {
			const bruto = (brutoMin + brutoMax) / 2;
			const amortizacao = bruto / demanda.prazoMeses;

			let encargoIOFdiario = amortizacao * somaFatorIOFdiario;

			// Aplica teto do IOF se definido
			if (
				'teto' in demanda.iof &&
				typeof demanda.iof.p.teto !== 'undefined' &&
				typeof demanda.iof.p.teto?.value === 'number'
			) {
				encargoIOFdiario = Math.min(
					encargoIOFdiario,
					bruto * demanda.iof.p.teto.value,
				);
			}

			const clc: boolean | TRCredito = (this.constructor as typeof SAC).__sac(demanda, naoRepetirAmortiza);

			if (!clc) throw new Error('Falha em executar calculo');

			const liquidoCalculado: number = (<TLiberado>clc).liquido.value;

			const erro = liquidoCalculado - liquidoDesejado;
			const toleranciaRelativa = Math.max(tolerancia, bruto * 0.0001);

			if (Math.abs(erro) < toleranciaRelativa) {
				return clc;
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
