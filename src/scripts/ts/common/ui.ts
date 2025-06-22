import { TButtonX } from '@ext/ButtonX/ButtonX';
import { IMenuX } from '@ext/MenuX/MenuX';
import { guid } from './generic';
import { isEmpty, noEmpty } from './logicos';

export type TUISizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TUIShadow = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type TCaption =
	| { caption: string; label?: never } // 'caption' é obrigatório, 'label' é inexistente
	| { caption?: never; label: string } // 'label' é obrigatório, 'caption' é inexistente
	| { caption?: never; label?: never }; // nenhum

export function getCaption(
	i1: string | undefined,
	i2: string | undefined,
): string {
	return [i1, i2].filter((v) => noEmpty(v)).join('');
}

export function isSignal(
	value: unknown,
): value is { value: unknown } {
	return !!value && typeof value === 'object' && 'value' in value;
}

export function resolveClassName(value: unknown): string | undefined {
	if (typeof value === 'string') return value;
	if (typeof value === 'function') return value();
	if (!!value && typeof value === 'object' && 'value' in value) {
		return (value as { value: unknown }).value as string;
	}
	return undefined;
}

export function getEscopo(escopo: string | undefined): string {
	return isEmpty(escopo) ? `${guid(4)}` : (<string>escopo)?.trim();
}

/** Tipo de itens aceitos: ButtonX ou MenuX */
export type TItemX =
	| (TButtonX & { kind: 'button' })
	| (IMenuX & { kind: 'menu' });

export const HTML_TAGS = [
	'section',
	'header',
	'footer',
	'div',
	'main',
	'article',
	'aside',
] as const;
export type HtmlTag = (typeof HTML_TAGS)[number];
