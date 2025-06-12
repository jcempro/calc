import { teto, numberRange, isNum } from './numbers';

export type TDiaMes = numberRange<1, 28>;
export type TDate = string | number | Date;

export function isValidDateInput(value: any): boolean {
	if (value instanceof Date && !isNaN(value.getTime())) return true;
	if (typeof value === 'number') return isNum(value) && value > 0;
	if (typeof value === 'string') {
		const d = new Date(value);
		return !isNaN(d.getTime());
	}
	return false;
}

export function toDate(
	value: any,
	fallback: Date = new Date(),
): Date {
	return parseDate(value, fallback);
}

export function parseDate(
	raw: any,
	fallback: Date = new Date(),
): Date {
	if (raw instanceof Date) return raw;
	if (typeof raw === 'string' || typeof raw === 'number') {
		const parsed = isValidDateInput(raw) ? new Date(raw) : null;
		return parsed && !isNaN(parsed.getTime()) ? parsed : fallback;
	}
	return fallback;
}

/*
 */
export function proximaDataBase(
	fromDate: TDate,
	dayOfMonth: number,
	inclusive: boolean = true,
): Date {
	if (dayOfMonth < 1 || dayOfMonth > 31) {
		throw new Error('O dia do mês deve estar entre 1 e 31.');
	}

	const from: Date = parseDate(fromDate);

	const year = from.getFullYear();
	const month = from.getMonth();
	const today = from.getDate();

	// Tenta usar o mês atual primeiro
	if (
		(inclusive && today <= dayOfMonth) ||
		(!inclusive && today < dayOfMonth)
	) {
		const candidate = new Date(year, month, dayOfMonth);
		if (candidate.getMonth() === month) {
			return candidate;
		}
	}

	// Caso o dia não seja válido neste mês ou já passou, tenta o próximo mês
	const nextMonthCandidate = new Date(year, month + 1, dayOfMonth);

	// Verifica se o dia realmente existe no próximo mês
	if (nextMonthCandidate.getDate() === dayOfMonth) {
		return nextMonthCandidate;
	}

	// Se inválido (ex: 31 em fevereiro), retorna o último dia do próximo mês
	return new Date(year, month + 2, 0);
}

export function isDataValida(d: any): d is Date {
	return d instanceof Date && !isNaN(d.getTime());
}

/*
 */
export function diasCorridos(ini: TDate, fim: TDate): number {
	const dataIni = new Date(ini);
	const dataFim = new Date(fim);

	if (!isDataValida(dataIni) || !isDataValida(dataFim)) {
		throw new Error('Data inválida fornecida.');
	}

	// Ignora a hora (zera horas/minutos/segundos/milisegundos)
	dataIni.setHours(0, 0, 0, 0);
	dataFim.setHours(0, 0, 0, 0);

	const diffMs = dataFim.getTime() - dataIni.getTime();
	const dias = diffMs / (1000 * 60 * 60 * 24);

	return Math.round(dias); // ou use Math.floor() se quiser truncar para baixo
}

/*
 */
type CacheFeriados = Map<number, Set<string>>;

const feriadosCache: CacheFeriados = new Map();

function calcularPascoa(ano: number): Date {
	const a = ano % 19;
	const b = Math.floor(ano / 100);
	const c = ano % 100;
	const d = Math.floor(b / 4);
	const e = b % 4;
	const f = Math.floor((b + 8) / 25);
	const g = Math.floor((b - f + 1) / 3);
	const h = (19 * a + b - d - g + 15) % 30;
	const i = Math.floor(c / 4);
	const k = c % 4;
	const l = (32 + 2 * e + 2 * i - h - k) % 7;
	const m = Math.floor((a + 11 * h + 22 * l) / 451);
	const mes = Math.floor((h + l - 7 * m + 114) / 31);
	const dia = ((h + l - 7 * m + 114) % 31) + 1;
	return new Date(ano, mes - 1, dia);
}

function offsetData(data: Date, dias: number): Date {
	const nova = new Date(data);
	nova.setDate(nova.getDate() + dias);
	return nova;
}

function formatarData(data: Date): string {
	return data.toISOString().slice(0, 10);
}

function obterFeriadosBrasil(ano: number): Set<string> {
	if (feriadosCache.has(ano)) return feriadosCache.get(ano)!;

	const feriadosFixos = [
		`01-01`,
		`04-21`,
		`05-01`,
		`09-07`,
		`10-12`,
		`11-02`,
		`11-15`,
		`12-25`,
	];

	const pascoa = calcularPascoa(ano);
	const feriadosMoveis = [
		offsetData(pascoa, -47), // Carnaval
		offsetData(pascoa, -2), // Sexta-feira Santa
		pascoa, // Páscoa
		offsetData(pascoa, 60), // Corpus Christi
	];

	const feriados = new Set<string>();
	feriadosFixos.forEach((d) => feriados.add(`${ano}-${d}`));
	feriadosMoveis.forEach((d) => feriados.add(formatarData(d)));

	feriadosCache.set(ano, feriados);
	return feriados;
}

export function isDiaUtil(data: TDate): boolean {
	const d = toDate(data);
	const ano = d.getFullYear();
	const feriados = obterFeriadosBrasil(ano);
	const diaSemana = d.getDay();
	const dataStr = formatarData(d);
	return diaSemana !== 0 && diaSemana !== 6 && !feriados.has(dataStr);
}

export function diasUteis(inicio: TDate, fim: TDate): number {
	let ini = toDate(inicio);
	let end = toDate(fim);
	if (ini > end) [ini, end] = [end, ini];

	let count = 0;
	const atual = new Date(ini);
	while (atual <= end) {
		if (isDiaUtil(atual)) count++;
		atual.setDate(atual.getDate() + 1);
	}

	return count;
}

export function proxDiaUtil(data: TDate): Date {
	let atual = toDate(data);
	atual.setDate(atual.getDate() + 1); // não incluir o dia fornecido

	while (!isDiaUtil(atual)) {
		atual.setDate(atual.getDate() + 1);
	}

	return atual;
}

export function diaUtilOuProx(data: TDate): Date {
	return isDiaUtil(data) ? new Date(data) : proxDiaUtil(data);
}

export function diaBaseUtilOuProx(
	data: TDate,
	max: number = 28,
): Date {
	let n: number;
	let tentativas = 0;
	const MAX_TENTATIVAS = 100;
	do {
		data = diaUtilOuProx(data);
		n = teto(data.getDate(), max, 1);

		if (n != data.getDate()) {
			data = proximaDataBase(data, n, false);
		}

		// lógica atual
		if (++tentativas > MAX_TENTATIVAS) {
			throw new Error('Loop infinito detectado em diaBaseUtilOuProx');
		}
	} while (!isDiaUtil(data));

	return data;
}
