/**
 * pagezoneZone — Contêiner principal para seções, páginas e módulos.
 *
 * @description
 * Estrutura visual que delimita uma zona da página, como seções,
 * páginas inteiras, módulos, cards de conteúdo ou agrupadores.
 * Segue o padrão de escopo, variantes e comportamento dos demais
 * componentes da arquitetura (HeaderBar, NavIcon, MenuX e ButtonX).
 *
 * @structure
 * Layout geral:
 * ```
 * [pagezoneZone]
 * ├── Conteúdo arbitrário (JSX.Element[])
 * ```
 *
 * @integration
 * - Totalmente integrado com:
 *   • HeaderBar
 *   • NavIcon
 *   • MenuX
 *   • ButtonX
 * - Componível com qualquer outro componente.
 * - Pode ser usado como página inteira, seção ou card.
 *
 * @layout
 * - Variante visual (`variant`):
 *   • normal | border | shadow | glass | ghost
 * - Tamanho (`size`):
 *   • xs | sm | md | lg | xl
 * - Sombra (`shadow`):
 *   • none | sm | md | lg | xl | 2xl
 * - Compactação (`compact`):
 *   • padding reduzido
 * - Escopo (`escopo`):
 *   • Gera classes específicas como `pagezone-jcem-{escopo}`
 * - Responsivo e adaptável.
 * - Ocupa 100% do espaço pai, com controle de padding, borda e sombra.
 *
 * @style
 * - Arquitetura CSS:
 *   • DaisyUI + Tailwind Variants + Tailwind Merge + clsx
 *   • Wrapper: `pagezone-jcem-`.
 *   • Escopo: classes `pagezone-jcem-{escopo}`.
 * - Composição segura com `tailwind-merge` e `clsx`
 * - Customização:
 *   • Classes podem ser sobrescritas
 * - Estados:
 *   • Controlados via data-attributes e pseudo-classes
 *   • Transições CSS-only
 *
 * @props
 * - Herda `JSX.HTMLAttributes<HTMLElement>`
 * - `variant`: normal | border | shadow | glass | ghost
 * - `size`: xs | sm | md | lg | xl
 * - `shadow`: none | sm | md | lg | xl | 2xl
 * - `compact`: boolean
 * - `escopo`: string (namespace para classes e data attributes)
 * - `classPart`: string extra para composição de classe
 * - `className`: string, função ou signal
 *
 * @development
 * - Mantém consistência total com HeaderBar, NavIcon, ButtonX e MenuX.
 * - Usa helper `resolveClassName()` para tratamento de classes.
 * - Boas práticas:
 *   • Mensagens de log/warn/error via Logger
 *   • Manutenção git-friendly (evitar breaking changes)
 *   • Comentários objetivos para mudanças complexas
 *   • Manter esta documentação no topo código com ajustes mínimos pertinentes
 *   • Comentário de uma única linha preferíveis, exceto quando para jsDoc
 *
 * @dependencies
 * - ButtonX
 * - MenuX
 * - NavIcon
 * - HaederBar
 * - Preact + Vite (core)
 * - ButtonX (botão principal)
 * - NavIcon (container dos itens)
 * - tailwind-variants + tailwind-merge + clsx
 *
 * @see {@link HeaderBar}
 * @see {@link NavIcon}
 * @see {@link MenuX}
 * @see {@link ButtonX}
 */

import { JSX } from 'preact';
import { tv, type VariantProps } from 'tailwind-variants';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { resolveClassName } from '../../ts/common/ui';
import './PageZone.scss';

/** 🔖 Definição dos variants para pagezoneZone */
const pagezoneZoneVariants = tv({
	base: 'pagezonezone-jcem relative w-full',
	variants: {
		variant: {
			normal: '',
			border: 'border border-base-300 rounded-box',
			shadow: 'shadow-md rounded-box',
			glass:
				'bg-base-100 bg-opacity-50 backdrop-blur-md border border-base-300 rounded-box',
			ghost: 'bg-transparent',
		},
		size: {
			xs: 'text-xs',
			sm: 'text-sm',
			md: 'text-base',
			lg: 'text-lg',
			xl: 'text-xl',
		},
		shadow: {
			none: '',
			sm: 'shadow-sm',
			md: 'shadow-md',
			lg: 'shadow-lg',
			xl: 'shadow-xl',
			'2xl': 'shadow-2xl',
		},
		compact: {
			true: 'p-2 sm:p-3',
			false: 'p-4 sm:p-6',
		},
	},
	defaultVariants: {
		variant: 'normal',
		size: 'md',
		shadow: 'none',
		compact: false,
	},
});

/** 🔗 Props do componente pagezoneZone */
export interface IpagezoneZone
	extends Omit<JSX.HTMLAttributes<HTMLElement>, 'size'>,
		VariantProps<typeof pagezoneZoneVariants> {
	escopo?: string;
	classPart?: string;
}

/** 🌟 Componente pagezoneZone */
export function PageZone({
	escopo = 'pagezone',
	classPart = '',
	className,
	variant = 'normal',
	size = 'md',
	shadow = 'none',
	compact = false,
	...props
}: IpagezoneZone) {
	/** 🎨 Classes finais */
	const finalClass = twMerge(
		pagezoneZoneVariants({ variant, size, shadow, compact }),
		clsx(
			`pagezonezone-jcem-${escopo}`,
			classPart && `pagezonezone-${classPart}`,
		),
		resolveClassName(className),
	);

	return (
		<section {...props} className={finalClass}>
			{props.children}
		</section>
	);
}
