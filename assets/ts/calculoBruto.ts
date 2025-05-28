// Simulador completo em TypeScript para calcular valor bruto a partir de valor líquido desejado
// Considera TAC, FLAT, IOF fixo e IOF diário (com carência e dia útil ajustado)

import {
  diasCorridos,
  diaUtilOuProx
} from './common.ts';

// Gera array com os dias corridos entre a liberação e cada parcela
export function gerarDiasPorParcela(
  dataLiberacao: Date,
  diaVencimento: number,
  numParcelas: number,
  carenciaDias: number = 0
): number[] {
  const dias: number[] = [];

  const dataPrimeiroVenc = diaUtilOuProx(
    new Date(dataLiberacao.getFullYear(), dataLiberacao.getMonth(), diaVencimento)
  );

  let vencimentoBase = new Date(dataPrimeiroVenc);
  while (diasCorridos(dataLiberacao, vencimentoBase) < carenciaDias) {
    vencimentoBase.setMonth(vencimentoBase.getMonth() + 1);
    vencimentoBase = diaUtilOuProx(
      new Date(vencimentoBase.getFullYear(), vencimentoBase.getMonth(), diaVencimento)
    );
  }

  for (let i = 0; i < numParcelas; i++) {
    const venc = diaUtilOuProx(
      new Date(vencimentoBase.getFullYear(), vencimentoBase.getMonth() + i, diaVencimento)
    );
    dias.push(diasCorridos(dataLiberacao, venc));
  }

  return dias;
}

// Cálculo do valor bruto aproximado
export function calcularValorBruto(
  cDesejado: number,
  parcelas: number,
  diasPorParcela: number[],
  taxaTAC: number,
  taxaFlat: number,
  tolerancia = 0.01,
  maxIter = 50
): number {
  const alqFixo = 0.0038;
  const alqDiaria = 0.000082;

  let bMin = cDesejado;
  let bMax = cDesejado * 1.5;

  for (let i = 0; i < maxIter; i++) {
    const b = (bMin + bMax) / 2;
    const tac = taxaTAC;
    const flat = b * taxaFlat;
    const iofFixo = b * alqFixo;

    const amortizacao = b / parcelas;
    let iofDiario = 0;
    for (let j = 0; j < parcelas; j++) {
      iofDiario += amortizacao * diasPorParcela[j] * alqDiaria;
    }
    if (iofDiario > b * 0.03) iofDiario = b * 0.03;

    const totalDescontos = tac + flat + iofFixo + iofDiario;
    const liquido = b - totalDescontos;

    if (Math.abs(liquido - cDesejado) < tolerancia) return b;

    if (liquido > cDesejado) bMax = b;
    else bMin = b;
  }

  return (bMin + bMax) / 2;
}

// Exemplo de uso:
// const dias = gerarDiasPorParcela(new Date('2025-06-10'), 5, 12, 90);
// const bruto = calcularValorBruto(100000, 12, dias, 2000, 0.02);
// console.log("Bruto necessário:", bruto);
