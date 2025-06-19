import { tv, VariantProps } from 'tailwind-variants';

export type TUISizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TUIShadow = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export const resolveClassName = (cls?: string | (() => string)) =>
	typeof cls === 'function' ? cls() : cls || '';
