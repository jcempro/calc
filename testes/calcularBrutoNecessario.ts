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

describe('SAC', () => {
	const calc = new SAC();

	it('calcula corretamente o valor bruto para um líquido com 10% de desconto', () => {
		const resultado = calc._calcularBrutoNecessario(1000, 0.1);
		expect(resultado).toBeCloseTo(1111.11, 2);
	});

	it('retorna o mesmo valor se a taxa de desconto for 0', () => {
		expect(calc._calcularBrutoNecessario(500, 0)).toBe(500);
	});

	it('lança erro se a taxa for 100% ou mais', () => {
		expect(() => calc._calcularBrutoNecessario(1000, 1)).toThrow();
		expect(() => calc._calcularBrutoNecessario(1000, 1.1)).toThrow();
	});

	it('lança erro se a taxa for negativa', () => {
		expect(() => calc._calcularBrutoNecessario(1000, -0.2)).toThrow();
	});
});
