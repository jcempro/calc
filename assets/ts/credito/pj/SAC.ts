import { numberRange } from '../../common/numbers.ts';

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
} from './credito.ts';

/*
 */
export abstract class SAC {
	private args: TDemandaCredito;

	/*
	 **/
	constructor(input: any) {
		this.args = inicializaDemandaCredito(input);
	}

	protected validKey(obj: any, key: string): boolean {
		return !(key in obj) || obj[key] === undefined;
	}

	/*
	 **/
	protected _sacInicializaValores = (
		args: TDemandaCredito,
	): null | TDemandaCredito => {
		args.data_operacao = diaUtilOuProx(
			this.validKey(args, 'data_operacao') ? args.data_operacao : new Date(),
		);

		args.diabase = this.validKey(args, 'diabase')
			? args.diabase
			: <numberRange<1, 28>>diaBaseUtilOuProx(args.data_operacao).getDate();

		return args;
	};

	/*
	 **/
	protected _sac = (): boolean | TRCredito => {
		if (this.args === null || !('financiado' in this.args)) {
			return false;
		}

		let r: TRCredito = this.args as TRCredito;

		r.repo = {
			extrato: new ExtratoCredito([]),
			pgtoTotal: 0,
			pgtoAMais: 0,
			maiorParcela: 0,
			menorParcela: Infinity,
		};

		for (let i = 0; i <= r.prazoMeses; i++) {
			let car: boolean = i <= r.carenciaDias;
			let jrs: boolean = !car || r.jurosNaCarencia;

			/* inicializa com os valores no padrão 0 meses */
			let p: TParcelaRecord = {
				amortizacao: 0,
				juros: 0,
				pagamento: 0,
				saldoDevedor: (<TFinanciado>r).financiado,
			} as unknown as TParcelaRecord;

			/* calcula a data desta parcela */
			p.data = diaUtilOuProx(
				i === 0
					? r.data_operacao
					: <TDate>(
							proximaDataBase(
								i > 1
									? r.data_operacao
									: r.repo.extrato[r.repo.extrato.length - 1].data,
								r.diabase,
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
								? r.data_operacao
								: r.repo.extrato[r.repo.extrato.length - 1].data,
							p.data,
					  );

			/* calcula parcela */
			if (i > 0) {
				p.amortizacao.value = car ? 0 : -1;
				p.juros.value = !jrs ? 0 : 1;
				p.pagamento.value = p.amortizacao.value + p.juros.value;
				p.saldoDevedor.value =
					(i > 1
						? (<TFinanciado>r).financiado
						: r.repo.extrato[r.repo.extrato.length - 1].saldoDevedor) -
					p.pagamento.value;
			}

			/* calcula a maior e menor parcela */
			r.repo.maiorParcela = Math.max(r.repo.maiorParcela, p.pagamento.value);
			r.repo.menorParcela = Math.min(r.repo.menorParcela, p.pagamento.value);

			/* adicionado */
			r.repo.extrato.push(p);
		}

		return r;
	};

	// Gera array com os dias corridos entre a liberação e cada parcela
	protected gerarDiasPorParcela(): number[] {
		const dias: number[] = [];

		const dataPrimeiroVenc = diaUtilOuProx(
			new Date(
				this.args.data_operacao.getFullYear(),
				this.args.data_operacao.getMonth(),
				this.args.diabase,
			),
		);

		let vencimentoBase = new Date(dataPrimeiroVenc);
		while (
			diasCorridos(this.args.data_operacao, vencimentoBase) <
			this.args.carenciaDias
		) {
			vencimentoBase.setMonth(vencimentoBase.getMonth() + 1);
			vencimentoBase = diaUtilOuProx(
				new Date(
					vencimentoBase.getFullYear(),
					vencimentoBase.getMonth(),
					this.args.diabase,
				),
			);
		}

		for (let i = 0; i < this.args.prazoMeses; i++) {
			const venc = diaUtilOuProx(
				new Date(
					vencimentoBase.getFullYear(),
					vencimentoBase.getMonth() + i,
					this.args.diabase,
				),
			);
			dias.push(diasCorridos(this.args.data_operacao, venc));
		}

		return dias;
	}

	// Estratégia de busca binária com estimativa inicial e margem adaptativa
	// Combina precisão com desempenho, ajustando dinamicamente o intervalo de busca
	protected calcularBrutoNecessario(
		iofFixo: number,
		alqDiaria: number,
		tolerancia = 0.01,
		maxIter = 100,
	): number {
		let diasPorParcela: number[] = this.gerarDiasPorParcela();

		if (
			this.args.prazoMeses <= 0 ||
			diasPorParcela.length !== this.args.prazoMeses
		) {
			throw new Error(
				'Parâmetros inválidos: número de parcelas e dias por parcela devem ser consistentes.',
			);
		}

		// Soma ponderada de dias para o cálculo do IOF diário
		const somaFatorIOFdiario = diasPorParcela.reduce(
			(soma, dias) => soma + dias * alqDiaria,
			0,
		);

		// Estimativa inicial baseada nos principais encargos (máximo legal de IOF: 3%)
		const estimativaInicial =
			(<TLiberado>this.args).liquido.value *
			(1 + (this.args.flat.value + 0.03) + this.args.tac.value + iofFixo);

		// Define o intervalo inicial da busca com ±10% de margem sobre a estimativa
		let brutoMin = estimativaInicial * 0.9;
		let brutoMax = estimativaInicial * 1.1;
		let iter = 0;

		while (iter++ < maxIter) {
			const bruto = (brutoMin + brutoMax) / 2; // ponto médio
			const amortizacao = bruto / this.args.prazoMeses;

			// Cálculo de encargos com limites legais
			const encargoFlat = bruto * this.args.flat.value;
			let encargoIOFdiario = amortizacao * somaFatorIOFdiario;
			encargoIOFdiario = Math.min(encargoIOFdiario, bruto * 0.03);

			const descontosTotais =
				this.args.tac.value + encargoFlat + iofFixo + encargoIOFdiario;
			const liquidoCalculado = bruto - descontosTotais;

			const erro = liquidoCalculado - (<TLiberado>this.args).liquido.value;
			const toleranciaRelativa = Math.max(tolerancia, bruto * 0.0001);

			if (Math.abs(erro) < toleranciaRelativa) {
				return bruto; // convergência atingida
			}

			// Margem adaptativa proporcional ao erro relativo (entre 0,5% e 10%)
			const margem = Math.max(
				0.005,
				Math.min(0.1, Math.abs(erro / (<TLiberado>this.args).liquido.value)),
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
