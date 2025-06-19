/**
 * HeaderBar — Cabeçalho flexível, responsivo e componível.
 *
 * @description
 * Componente de cabeçalho (geralmente em forma de barra horizontal) que organiza conteúdos em três seções horizontais:
 * - Esquerda (`navbar-start`)
 * - Centro (`navbar-center`)
 * - Direita (`navbar-end`)
 *
 * Suporte a botões (`ButtonX`), menus (`MenuX`) e barras (`NavIcon`).
 * Permite também inserir um campo de busca e título ou conteúdo central.
 *
 * @structure
 * Layout geral:
 * ```
 * [HeaderBar]
 *  ├── [navbar-start]  → leftItems
 *  ├── [navbar-center] → title | middleContent
 *  └── [navbar-end]    → rightItems + searchComponent
 * ```
 *
 * @integration
 * - Totalmente integrado com:
 *   • ButtonX
 *   • MenuX
 *   • NavIcon
 *   • PageZone
 * - Pode ser usado como cabeçalho de páginas, módulos, dashboards, apps.
 * - Opcionalmente, via parâmetro, pode fixar-se (empilhado) ao topo (styck) na mesma ordem de renderização.
 *
 * @layout
 * - Variante visual (`variant`):
 *   • normal | sticky | ghost | bordered
 * - Tamanho (`size`):
 *   • xs | sm | md | lg | xl
 * - Sombra (`shadow`):
 *   • none | sm | md | lg | xl | 2xl
 * - Compactação (`compact`):
 *   • padding e gaps reduzidos
 * - Alinhamento do título (`titleAlign`):
 *   • left | center | right
 * - Classes:
 *   • Wrapper: `header-jcem-{escopo}`
 * - Responsivo e adaptável ao contexto.
 * - Overflow: Nunca usa scrollbar → cria submenus ou colapsa.
 * - Largura: 100% do espaço disponivel
 *
 * @style
 * - Arquitetura CSS:
 *   • DaisyUI + Tailwind Variants + Tailwind Merge + clsx
 *   • Wrapper: `header-jcem-`.
 *   • Escopo: classes `header-jcem-{escopo}`.
 * - Composição segura com `tailwind-merge` e `clsx`
 * - Customização:
 *   • Classes podem ser sobrescritas
 * - Estados:
 *   • Controlados via data-attributes e pseudo-classes
 *   • Transições CSS-only
 *
 * @props
 * - `leftItems`: itens à esquerda (ButtonX | MenuX | NavIcon[])
 * - `rightItems`: itens à direita (ButtonX | MenuX | NavIcon[])
 * - `middleContent`: conteúdo customizado no centro (JSX.Element)
 * - `title`: texto do título central
 * - `searchComponent`: JSX.Element de busca na direita
 * - `variant`, `size`, `shadow`, `compact`: estilização
 * - `escopo`: namespace de classes/data-attributes
 * - `classPart`: string para personalização de classe
 * - `className`: classes adicionais
 *
 * @development
 * - Mantém consistência total com `NavIcon`, `ButtonX` e `MenuX`.
 * - Usa helper `resolveClassName()` para tratamento de classes.
 * - Boas práticas:
 *   • Mensagens de log/warn/error via Logger
 *   • Manutenção git-friendly (evitar breaking changes)
 *   • Comentários objetivos para mudanças complexas
 *   • Manter esta documentação no topo código com ajustes mínimos pertinentes
 *   • Comentário de uma única linha preferíveis, exceto quando para jsDoc
 *
 * @style
 * - Arquitetura CSS:
 *   • DaisyUI + Tailwind Variants + Tailwind Merge + clsx
 * - Segue a convenção `header-jcem-{escopo}`
 *
 * @dependencies
 * - ButtonX
 * - MenuX
 * - NavIcon
 * - Preact + Vite (core)
 * - ButtonX (botão principal)
 * - NavIcon (container dos itens)
 * - tailwind-variants + tailwind-merge + clsx
 *
 * @see {@link ButtonX}
 * @see {@link MenuX}
 * @see {@link NavIcon}
 */

import { JSX } from 'preact';
import { IButtonX } from '@ext/ButtonX/ButtonX';
import { IMenuX } from '@ext/MenuX/MenuX';
import { INavIcon, NavIcon } from '@ext/NavIcon/NavIcon';
import { TUISizes, TUIShadow } from '../../ts/common/ui';
import clsx from 'clsx';
import { ClassNameValue, twMerge } from 'tailwind-merge';

type TBarItem = IButtonX | IMenuX | INavIcon;

export interface IHeader
	extends Omit<JSX.HTMLAttributes<HTMLElement>, 'size'> {
	classPart?: string;
	leftItems?: TBarItem[];
	rightItems?: TBarItem[];
	middleContent?: JSX.Element;
	title?: string;
	titleAlign?: 'left' | 'center' | 'right';
	searchComponent?: JSX.Element;
	variant?: 'normal' | 'sticky' | 'ghost' | 'bordered';
	size?: TUISizes;
	shadow?: TUIShadow;
	compact?: boolean;
	escopo?: string;
}

const sizeMap = {
	xs: 'text-xs',
	sm: 'text-sm',
	md: 'text-md',
	lg: 'text-lg',
	xl: 'text-xl',
} as const;

const shadowMap = {
	none: '',
	sm: 'shadow-sm',
	md: 'shadow-md',
	lg: 'shadow-lg',
	xl: 'shadow-xl',
	'2xl': 'shadow-2xl',
} as const;

export function HeaderBar({
	classPart = '',
	leftItems = [],
	rightItems = [],
	middleContent,
	title,
	titleAlign = 'left',
	searchComponent,
	variant = 'normal',
	size = 'sm',
	shadow = 'none',
	compact = false,
	escopo,
	className,
	...props
}: IHeader) {
	// Classes base do Header
	const headerClasses =
		`header-jcem-${escopo} ` +
		twMerge(
			clsx(
				'navbar min-h-12 w-full',
				variant !== 'normal' && `navbar-${variant}`,
				sizeMap[size],
				shadow !== 'none' && shadowMap[shadow],
				compact ? 'py-1 px-2' : 'py-2 px-4',
				classPart && `header-${classPart}`,
			),
			className as ClassNameValue,
		);

	// Configuração otimizada do NavIcon para Header
	const getNavIconConfig = (items: TBarItem[]) => ({
		itens: items.filter((i): i is IButtonX => !('items' in i)),
		orientation: 'horizontal' as const,
		ulClass: clsx(
			'items-center',
			compact ? 'gap-1' : 'gap-2',
			'sm:gap-3',
		),
		className: 'h-full',
	});

	return (
		<header {...props} className={headerClasses}>
			{/* Seção Esquerda */}
			{leftItems.length > 0 && (
				<div className="navbar-start h-full">
					<NavIcon
						{...getNavIconConfig(leftItems)}
						escopo="header-left"
						className={twMerge(
							'mr-auto',
							leftItems.some((i) => 'items' in i) && 'relative', // Para menus dropdown
						)}
					/>
				</div>
			)}

			{/* Seção Central */}
			<div
				className={clsx('navbar-center h-full flex-1', {
					'text-left': titleAlign === 'left',
					'text-center': titleAlign === 'center',
					'text-right': titleAlign === 'right',
				})}
			>
				{title ?
					<h1
						className={clsx(
							'font-semibold whitespace-nowrap',
							compact ? 'text-sm' : 'text-lg',
							'max-w-[180px] sm:max-w-md md:max-w-lg truncate',
						)}
					>
						{title}
					</h1>
				:	middleContent && (
						<div className="h-full flex items-center">
							{middleContent}
						</div>
					)
				}
			</div>

			{/* Seção Direita */}
			<div className="navbar-end h-full">
				{searchComponent && (
					<div
						className={clsx(
							'h-full flex items-center mr-2',
							compact ? 'max-w-[120px]' : 'max-w-[160px]',
							'sm:max-w-[200px]',
						)}
					>
						{searchComponent}
					</div>
				)}

				{rightItems.length > 0 && (
					<NavIcon
						{...getNavIconConfig(rightItems)}
						escopo="header-right"
						className={twMerge(
							'ml-auto',
							rightItems.some((i) => 'items' in i) && 'relative', // Para menus dropdown
						)}
					/>
				)}
			</div>
		</header>
	);
}
