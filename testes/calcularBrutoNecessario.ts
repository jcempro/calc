import { describe, it, expect } from 'vitest';
import {
	TRCredito,
	TLiberado,
	TFinanciado,
	TParcelaRecord,
	TDemandaCredito,
	inicializaDemandaCredito,
	ExtratoCredito,
	TComputed,
} from '../src/scripts/ts/credito/credito';

import { SAC } from '../src/scripts/ts/credito/SAC'; // ajuste o caminho

/*
 * TODO: Teste de SAC
 */

describe('teste de SAC', () => {
	const calc = new SAC({
		liquido: 100000,
		data_operacao: new Date(),
		diabase: 10,
		prazoMeses: 36,
		jurosAm: 2.35,
		carenciaDias: 30,
		custos: TCustos,
		tipo: TSacPrice,
		jurosNaCarencia: boolean,
		simplesn: boolean,
		iof: TIOF,
	});

	it('deve simular corretamente um empréstimo', () => {
		const valor = 1000; // Valor do empréstimo
		const prazo = 12; // Prazo de 12 meses
		const resultado = simularEmprestimo(valor, prazo)[0];

		// Valores esperados, baseados em cálculos fictícios
		const esperadoAmortizacao = valor / prazo; // 1000 / 12 = 83.33
		const esperadoJuros = valor * 0.05; // 1000 * 0.05 = 50
		const esperadoPagamento = esperadoAmortizacao + esperadoJuros; // 83.33 + 50 = 133.33
		const esperadoSaldodevedor = valor - esperadoAmortizacao; // 1000 - 83.33 = 916.67
		const esperadoIOF = valor * 0.0038; // 1000 * 0.0038 = 3.8

		// Margem de erro de 0.01 (1 centavo)
		const margemErro = 0.01;

		// Verificações usando toBeCloseTo, para permitir uma margem de erro
		expect(resultado[0]).toBeCloseTo(esperadoAmortizacao, 2); // Amortização
		expect(resultado[1]).toBeCloseTo(esperadoJuros, 2); // Juros
		expect(resultado[2]).toBeCloseTo(esperadoPagamento, 2); // Pagamento
		expect(resultado[3]).toBeCloseTo(esperadoSaldodevedor, 2); // Saldo devedor
		expect(resultado[6]).toBeCloseTo(esperadoIOF, 2); // IOF

		// Verificação se a data é válida (não importa o valor exato da data, só garantimos que é uma instância Date)
		expect(resultado[4] instanceof Date).toBe(true);

		// Verificação do número de dias (o prazo deve ser igual ao número de meses)
		expect(resultado[5]).toBe(prazo);
	});
});

describe('Simulação de Empréstimo - Diferentes Cenários', () => {
	const cenarios = [
		{ valor: 1000, prazo: 12 },
		{ valor: 5000, prazo: 24 },
		{ valor: 10000, prazo: 36 },
	];

	cenarios.forEach(({ valor, prazo }) => {
		it(`deve simular corretamente para valor ${valor} e prazo ${prazo}`, () => {
			const resultado = simularEmprestimo(valor, prazo)[0];

			// Cálculos esperados baseados em fórmulas simples (ajuste conforme necessário para seu caso)
			const esperadoAmortizacao = valor / prazo;
			const esperadoJuros = valor * 0.05;
			const esperadoPagamento = esperadoAmortizacao + esperadoJuros;
			const esperadoSaldodevedor = valor - esperadoAmortizacao;
			const esperadoIOF = valor * 0.0038;

			const margemErro = 0.01; // Margem de erro de 1 centavo

			// Comparações usando toBeCloseTo para checar que os valores são próximos
			expect(resultado[0]).toBeCloseTo(esperadoAmortizacao, 2);
			expect(resultado[1]).toBeCloseTo(esperadoJuros, 2);
			expect(resultado[2]).toBeCloseTo(esperadoPagamento, 2);
			expect(resultado[3]).toBeCloseTo(esperadoSaldodevedor, 2);
			expect(resultado[6]).toBeCloseTo(esperadoIOF, 2);
			expect(resultado[5]).toBe(prazo); // Verificando o prazo (número de dias)
		});
	});
});
