import 'reflect-metadata';
import { registerType } from './evalTypes';

export interface INumberType extends Number {
	value: number;
	toFixed(fractionDigits?: number): string;
	toExponential(fractionDigits?: number): string;
	toPrecision(precision?: number): string;
	toLocaleString(
		locales?: string | string[],
		options?: Intl.NumberFormatOptions,
	): string;
	toString(): string;
	valueOf(): number;
}

export interface IPercent extends INumberType {}
export interface Icurrency extends INumberType {}

export type TIOFP = {
	diario: IPercent;
	adicional: IPercent;
	teto?: IPercent;
};

export type TIOFC = {
	diario: Icurrency;
	adicional: Icurrency;
};

export type TIOF = {
	p: TIOFP;
	c?: TIOFC;
};

export type T_get_nested = string | string[];

// usando um alias de tipo e mapped type — a maneira mais flexível
export type RecordT<T> = Record<PropertyKey, T>;
export type TOBJ = RecordT<any>;
