/**
 * SectionWrapperBase — Base para HeaderZone, FooterZone e ContentWrapper.
 *
 * @description
 * sectione genérico que define uma zona estrutural da página. Controla:
 * - Layout: stack (empilhamento) ou flow (conteúdo livre).
 * - Container (max width) ou full width.
 * - Sombra, borda, padding.
 * - Escopo para classes (`escopo`).
 *
 * @structure
 * ```tsx
 * <SectionWrapperBase>
 *   {children}
 * </SectionWrapperBase>
 * ```
 *
 * @usage
 * sectiones especializados:
 * - HeaderZone
 * - FooterZone
 * - ContentWrapper
 *
 * @behavior
 * - Prioridades:
 *   1. Acessibilidade (aria-label quando aplicável)
 *   2. Consistência visual (estados :hover, :active , ..., via CSS)
 *   3. Performance (zero JS para estado/animações/transições)
 *
 * @development
 * - Gera ids únicos via `guid()`.
 * - Mantém consistência total com `ButtonX` e `MenuX`.
 * - Usa helper `resolveClassName()` para tratamento de classes.
 * - Boas práticas:
 *   • Mensagens de log/warn/error via Logger
 *   • Manutenção git-friendly (evitar breaking changes)
 *   • Comentários objetivos para mudanças complexas
 *   • Manter esta documentação no topo código com ajustes mínimos pertinentes
 *   • Comentário de uma única linha preferíveis, exceto quando para jsDoc
 *
 * @props
 * - `stack`: boolean (empilha verticalmente se true)
 * - `shadow`: boolean (aplica sombra)
 * - `container`: boolean (define largura máxima)
 * - `escopo`: string (namespace de dados e classes)
 * - `className`: classes adicionais
 * - `wrapperClass`: classes aplicadas no wrapper interno
 *
 * @dependencies
 * - Preact + Vite (core)
 * - tailwind-variants + tailwind-merge + clsx
 */

import { JSX } from 'preact';
import { twMerge } from 'tailwind-merge';
import { tv } from 'tailwind-variants';
import { guid } from '../../ts/common/generic';
import {
	HTML_TAGS,
	HtmlTag,
	resolveClassName,
} from '../../ts/common/ui';
import Logger from '../../ts/utils/logger';

/** 🚩rops do SectionWrapperBase */
export interface ISectionWrapperBase
	extends Omit<JSX.HTMLAttributes<HTMLElement>, 'className'> {
	stack?: boolean;
	shadow?: boolean;
	container?: boolean;
	escopo?: string;
	className?: string | (() => string);
	wrapperClass?: string | (() => string);
	debug?: boolean;
	as?: any;
}

/** 🎨 Variantes Visuais */
const sectionVariants = tv({
	base: 'section-jcem w-full z-30',
	variants: {
		stack: {
			true: 'flex flex-col gap-2',
			false: '',
		},
		shadow: {
			true: 'shadow-md',
			false: '',
		},
		container: {
			true: 'max-w-7xl mx-auto',
			false: '',
		},
	},
	defaultVariants: {
		stack: false,
		shadow: true,
		container: false,
	},
});

/** 🚀 sectione Base */
export function SectionWrapperBase<T extends HtmlTag>({
	as = 'section' as T,
	stack = false,
	shadow = true,
	container = false,
	escopo = 'section',
	className,
	wrapperClass,
	debug = false,
	children,
	...props
}: ISectionWrapperBase) {
	const Tag = HTML_TAGS.includes(as) ? as : 'section';
	const cid = `${Tag}-${escopo}-${guid(6)}`;

	if (debug) {
		Logger.info(`[SectionWrapperBase] Rendered → ${cid}`, {
			stack,
			shadow,
			container,
			escopo,
		});
	}

	return (
		<Tag
			{...props}
			data-section={cid}
			className={twMerge(
				sectionVariants({ stack, shadow, container }),
				`section-jcem-${escopo}`,
				resolveClassName(className),
			)}
		>
			<div
				className={twMerge(
					container ? 'px-4 sm:px-6 lg:px-8' : 'px-2 sm:px-4',
					resolveClassName(wrapperClass),
				)}
			>
				{children}
			</div>
		</Tag>
	);
}
