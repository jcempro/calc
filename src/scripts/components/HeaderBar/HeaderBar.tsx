/**
 * HeaderBar — Cabeçalho flexível, responsivo e componível.
 *
 * @description
 * Componente de cabeçalho (geralmente em forma de barra horizontal) que organiza conteúdos em três seções horizontais:
 * - Esquerda (`navbar-start`)
 * - Centro (`navbar-center`)
 * - Direita (`navbar-end`)
 *
 * @structure
 * Layout geral:
 * ```
 * │     └── (HeaderBar*)  //^2
 * │           ├── [LeftZone] //^3
 * │           │     ├── (breadcrumbs*) //^2
 * │           │     ├── (AnyComponents*) //^2
 * │           │     └── (ButtonX+/MenuX+)  //^1
 * │           ├── [MiddleZone] //^3
 * │           │     ├── (breadcrumbs*) //^2
 * │           │     ├── (AnyComponents*) //^2
 * │           │     └── (ButtonX+/MenuX+)  //^1
 * │           └── [RightZone] //^3
 * │                 ├── (breadcrumbs*) //^2
 * │                 ├── (AnyComponents*) //^2
 * │                 └── (ButtonX+/MenuX+)  //^1
 *
 * Legenda:
 * - (A): componente não obrigatório
 * - [A]: exatamente 1 elemento do tipo A
 * - [A+]: 1+ elementos (obrigatório)
 * - [A*]: 0+ elementos (opcional)
 * - [A/B] ou [A] / [B]: OR (pode ter A, B ou ambos)
 * - [A^B] ou [A] ^ [B]: XOR (apenas A ou apenas B)
 * - [AnyComponent]: qualquer componente válido
 * - [breadcrumbs]: readcrumb navigation, que é um elemento de interface do usuário em sites e aplicativos.
 * - //^1: ButtonX/MenuX não podem aparecer sequencialmente fora de NavIcon
 * - //^2: Componentes empilhados verticalmente
 * - //^3: empilhados horizontalmente - ocupam,juntos, toda a área horizontal
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
 * - Suporte a botões (`ButtonX`), menus (`MenuX`) e barras (`NavIcon`).
 * - Cada seções pode receber qualquer tipo de componente, inclusive puro HTML*
 *
 * @behavior
 * - Prioridades:
 *   1. Acessibilidade (aria-label quando aplicável)
 *   2. Consistência visual (estados :hover, :active , ..., via CSS)
 *   3. Performance (zero JS para estado/animações/transições)
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
 * - `variant`, `size`, `shadow`, `compact`: estilização
 * - `escopo`: namespace de classes/data-attributes
 * - `classPart`: string para personalização de classe
 * - `className`: classes adicionais
 *
 * @development
 * - Mantém consistência total com `NavIcon`, `ButtonX` e `MenuX`.
 * - Quando seção receber apenas ButtonX/MenuX ou recebe outros tipos, porẽm com vários ButtonX/MenuX sequencias: encapsula ButtonX/MenuX seguidos
 *
 * - Usa helper `resolveClassName()` para tratamento de classes.
 * - Boas práticas:
 *   • Mensagens de log/warn/error via Logger
 *   • Manutenção git-friendly (evitar breaking changes)
 *   • Comentários objetivos para mudanças complexas
 *   • Manter esta documentação no topo código com ajustes mínimos pertinentes
 *   • Comentário de uma única linha preferíveis, exceto quando para jsDoc
 *   • Alteração de comentários devem ser feitos apenas quando realmente necessários
 *   • Estrutura sequêncial', tais com ordme de include, devem ser mantidas - iguais exceto quando impossĩvel
 *   • Mantem tratamento com funções/helper jã existentes
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
import { TButtonX } from '../ButtonX/ButtonX';
import { IMenuX } from '../MenuX/MenuX';
import { INavIcon, NavIcon } from '../NavIcon/NavIcon';
import {
	TUISizes,
	TUIShadow,
	resolveClassName,
	TItemX,
} from '../../ts/common/ui';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 🔧 Tipagem dos itens aceitos */
export type TBarItem = TButtonX | IMenuX | INavIcon;

/** Props do HeaderBar */
export interface IHeader
	extends Omit<JSX.HTMLAttributes<HTMLElement>, 'size'> {
	classPart?: string;
	left?: (TBarItem | JSX.Element)[];
	center?: (TBarItem | JSX.Element)[];
	right?: (TBarItem | JSX.Element)[];
	searchComponent?: JSX.Element;
	titleAlign?: 'left' | 'center' | 'right';
	variant?: 'normal' | 'sticky' | 'ghost' | 'bordered';
	size?: TUISizes;
	shadow?: TUIShadow;
	compact?: boolean;
	escopo?: string;
}

/** 🔧 Mapeamento de tamanhos → Tailwind */
const sizeMap = {
	xs: 'text-xs',
	sm: 'text-sm',
	md: 'text-md',
	lg: 'text-lg',
	xl: 'text-xl',
} as const;

/** 🔧 Mapeamento de sombras → Tailwind */
const shadowMap = {
	none: '',
	sm: 'shadow-sm',
	md: 'shadow-md',
	lg: 'shadow-lg',
	xl: 'shadow-xl',
	'2xl': 'shadow-2xl',
} as const;

/** 🔥 Agrupa sequências de TItemX em NavIcon */
function groupItems(
	items: (TBarItem | JSX.Element)[],
	compact: boolean,
	escopo: string,
	zone: string,
) {
	const result: JSX.Element[] = [];
	let buffer: TItemX[] = [];

	const flushBuffer = () => {
		if (buffer.length > 0) {
			result.push(
				<NavIcon
					itens={buffer}
					orientation="horizontal"
					ulClass={clsx(
						'items-center',
						compact ? 'gap-1' : 'gap-2',
						'sm:gap-3',
					)}
					className="h-full"
					escopo={`header-${zone}`}
				/>,
			);
			buffer = [];
		}
	};

	for (const item of items) {
		const isNavItem = 'onClick' in item || 'itens' in item;
		if (isNavItem) {
			buffer.push(item as TItemX);
		} else {
			flushBuffer();
			result.push(item as JSX.Element);
		}
	}
	flushBuffer();
	return result;
}

/** 🔧 Renderização de cada zona */
function renderZone(
	items: (TBarItem | JSX.Element)[] | undefined,
	zone: 'start' | 'center' | 'end',
	compact: boolean,
	escopo: string,
	extra?: JSX.Element,
) {
	if ((!items || items.length === 0) && !extra) return null;

	return (
		<div className={`navbar-${zone} h-full`}>
			{items && groupItems(items, compact, escopo, zone)}
			{extra}
		</div>
	);
}

/** 🚀 Componente principal HeaderBar */
export function HeaderBar({
	classPart = '',
	left = [],
	center = [],
	right = [],
	searchComponent,
	titleAlign = 'left',
	variant = 'normal',
	size = 'sm',
	shadow = 'none',
	compact = false,
	escopo = 'header',
	className,
	...props
}: IHeader) {
	/** 🎨 Classes do Header */
	const headerClasses = twMerge(
		clsx(
			'navbar min-h-12 w-full',
			variant !== 'normal' && `navbar-${variant}`,
			sizeMap[size],
			shadowMap[shadow],
			compact ? 'py-1 px-2' : 'py-2 px-4',
			`header-jcem-${escopo}`,
			classPart && `header-${classPart}`,
		),
		resolveClassName(className),
	);

	/** 🔍 Componente de busca */
	const searchBox = searchComponent && (
		<div
			className={clsx(
				'h-full flex items-center mr-2',
				compact ? 'max-w-[120px]' : 'max-w-[160px]',
				'sm:max-w-[200px]',
			)}
		>
			{searchComponent}
		</div>
	);

	/** 🚀 Renderização */
	return (
		<header {...props} className={headerClasses}>
			{renderZone(left, 'start', compact, escopo)}
			{renderZone(center, 'center', compact, escopo)}
			{renderZone(right, 'end', compact, escopo, searchBox)}
		</header>
	);
}
