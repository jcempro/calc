import { guid, isEmpty } from './generic';

export type TUISizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TUIShadow = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

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
