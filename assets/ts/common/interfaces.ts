import 'reflect-metadata';
import { registerType } from './evalTypes'

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
};

export interface IPercent extends INumberType { };
export interface Icurrency extends INumberType { };

export type TIOF = {
  diario: IPercent;
  adicional: IPercent;
  teto: IPercent;
};