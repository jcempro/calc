import { MatchWithGroups } from './generic';

// WARNING: Não use com valores > 100 para evitar erros de recursão no TS
export type Enumerate<
	N extends number,
	Acc extends number[] = [],
> = Acc['length'] extends N
	? Acc[number]
	: Enumerate<N, [...Acc, Acc['length']]>;

export type numberRange<F extends number, T extends number> = Exclude<
	Enumerate<T>,
	Enumerate<F>
>;

export type TValidarNumero = (
	valor: any,
	padrao: number,
	min?: number,
	max?: number,
) => number;

export function validarNumero(
	valor: any,
	padrao: number,
	min?: number,
	max?: number,
): number {
	const num = Number(valor);
	if (!isNum(num)) return padrao;
	if (min !== undefined && num < min) return padrao;
	if (max !== undefined && num > max) return padrao;
	return num;
}

export function validarEnum<T>(valor: any, valoresValidos: T[], padrao: T): T {
	return valoresValidos.includes(valor) ? valor : padrao;
}

export type TValidarNumeroCLBack = (valor: any) => number;

export type TRange100 = numberRange<0, 100>;

export function isNum(v: any): boolean {
	return typeof v === 'number' && Number.isFinite(v);
}

export function teto(
	valor: number,
	max: number,
	def: undefined | number = undefined,
): number {
	return valor > max ? (def === undefined ? max : def) : valor;
}

export function piso(valor: number, min: number): number {
	return valor < min ? min : valor;
}

export function tetoPiso(valor: number, min: number, max: number): number {
	return teto(piso(valor, min), max);
}

export abstract class TNumberTypes {
	private _value: number = 0;
	protected __decimais = 0;

	protected markpos = '';
	protected markpre = '';

	constructor(
		input: number | string | undefined,
		valida?: TValidarNumeroCLBack,
	) {
		if (input === undefined && !valida) {
			throw `'${this.constructor.name}': input é invalido e validador não foi fornecido, '${input}'.`;
		}

		/* processa a entrada, e converte se for o caso */
		this.value =
			(input === undefined || input === null) && valida
				? valida(input)
				: <number>input;

		/* valida a entrada */
		this.value = valida ? valida(this.value) : this.value;
	}

	toString(): string {
		return `${this.markpre}${this._value.toFixed(this.__decimais)}${
			this.markpos
		}`;
	}

	protected s(regex: string): string {
		return regex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	protected getRegex(): RegExp {
		return new RegExp(
			'^' +
				(this.markpre ? `(${this.s(this.markpre)})` : '') +
				`(?<value>[\\d]+([,\\.][\\d]{0,${this.__decimais}})?)` +
				(this.markpos ? `(${this.s(this.markpos)})` : '') +
				'$',
			'd',
		);
	}

	public get value(): number {
		return this._value;
	}

	public set value(v: number | string) {
		const n: string = this.constructor.name;

		if (isNum(v)) {
			this._value = parseFloat((<number>v).toFixed(this.__decimais));
		} else if (typeof v === 'string') {
			const m: RegExpMatchArray | null = `${v}`.match(this.getRegex());

			if (
				!m ||
				typeof m !== 'object' ||
				!('groups' in m) ||
				typeof m.groups === 'undefined' ||
				!('value' in (<MatchWithGroups>m).groups)
			) {
				throw `'${n}': valor não é válido, '${v}'.`;
			}

			this._value = parseFloat(
				(<MatchWithGroups>m).groups['value'].trim().replaceAll(/,/, '.'),
			);
		} else {
			throw `'${n}': valor não é válido, '${v}'.`;
		}
	}
}

export class TPercent extends TNumberTypes {
	protected __decimais = 2;
	protected markpos = ' %';
	protected markpre = '';
}

export class TCurrency extends TNumberTypes {
	protected __decimais = 2;
	protected markpos = '';
	protected markpre = 'R$ ';
}
