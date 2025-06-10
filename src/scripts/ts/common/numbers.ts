import { HAS, MatchWithGroups } from './generic';

import { INumberType } from './interfaces';

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

export enum ENumberIs {
	percentual = 1,
	currency = 2,
	generic = 3,
}

export abstract class TNumberTypes implements INumberType {
	private _value: number = 0;
	protected __decimais = 0;

	protected _markpos = '';
	protected _markpre = '';

	abstract _tipo: ENumberIs;

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

	/**
	 * Retorna uma string formatada de acordo com a localidade e opções fornecidas.
	 * Útil para formatações como moeda, porcentagem ou estilo decimal internacionalizado.
	 * @param locales Código(s) de localidade (ex: 'pt-BR', 'en-US')
	 * @param options Opções de formatação numérica (estilo, moeda, casas decimais, etc.)
	 */
	toLocaleString(
		locales?: string | string[],
		options?: Intl.NumberFormatOptions,
	): string {
		return this._value.toLocaleString(locales, options);
	}

	/**
	 * Retorna a representação em ponto fixo.
	 */
	toFixed(fractionDigits?: number): string {
		return this._value.toFixed(fractionDigits ?? this.__decimais);
	}

	/**
	 * Retorna a representação exponencial do valor.
	 */
	toExponential(fractionDigits?: number): string {
		return this._value.toExponential(fractionDigits);
	}

	/**
	 * Retorna o valor com precisão significativa.
	 */
	toPrecision(precision?: number): string {
		return this._value.toPrecision(precision);
	}

	/**
	 * Retorna o valor numérico primitivo da instância.
	 */
	valueOf(): number {
		return this._value;
	}

	toString(): string {
		return `${this._markpre}${this._value.toFixed(this.__decimais)}${this._markpos
			}`;
	}

	protected s(regex: string): string {
		return regex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	protected getRegex(): RegExp {
		return new RegExp(
			'^' +
			(this._markpre ? `(?<pre>${this.s(this._markpre)})` : '') +
			`(?<value>[\\d]+([,\\.][\\d]{0,${this.__decimais}})?)` +
			(this._markpos ? `(?<pos>${this.s(this._markpos)})` : '') +
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

			this._markpre = this._markpre.length > 0
				? this._markpre
				: HAS('pre', (<MatchWithGroups>m).groups)
					//@ts-ignore
					? (<MatchWithGroups>m).groups['pre'].trim()
					: '';

			this._markpos = this._markpos.length > 0
				? this._markpos
				: HAS('pos', (<MatchWithGroups>m).groups)
					//@ts-ignore
					? (<MatchWithGroups>m).groups['pos'].trim()
					: '';

			const mark: string = `${this._markpre},${this._markpre}`;

			this._tipo = this._tipo
				? this._tipo
				: (mark.match(/[\%]/))
					? ENumberIs.percentual
					: (mark.match(/[\$]/))
						? ENumberIs.currency
						: ENumberIs.generic;

			this._value = parseFloat(
				(<MatchWithGroups>m).groups['value'].trim().replace(/,/g, '.'),
			);
		} else {
			throw `'${n}': valor não é válido, '${v}'.`;
		}
	}
}

export class TPercent extends TNumberTypes {
	protected __decimais = 2;
	protected _markpos = '%';
	protected _markpre = '';
	_tipo = ENumberIs.percentual;
}

export class TCurrency extends TNumberTypes {
	protected __decimais = 2;
	protected _markpos = '';
	protected _markpre = '$ ';
	_tipo = ENumberIs.currency;
}
