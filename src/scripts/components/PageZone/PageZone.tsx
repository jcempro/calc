/**
 * PageZone — Contêiner principal para seções, páginas e módulos.
 *
 * @description
 * Estrutura visual que delimita uma zona da página, como seções,
 * páginas inteiras, módulos, cards de conteúdo ou agrupadores.
 * Segue o padrão de escopo, variantes e comportamento dos demais
 * componentes da arquitetura (HeaderBar, NavIcon, MenuX e ButtonX).
 *
 * @structure
 * Layout geral:
 *
 * ````
 * [PageZone]
 * ├── (HeaderZone)  // Pelo menos um destes ↓ deve existir (AnyComponent* ou HeaderBar*)
 * │     ├── (AnyComponent*) // stack
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
 * ├── EnclosureContent
 * │   ├── (NavIcon)  // left
 * │   │     └── [ButtonX+]
 * │   ├── ContentWrapper   [obrigatório]
 * │   │    └── (PageZone) ^ [AnyComponent+]  // XOR
 * │   └── (NavIcon) // right
 * │         └── [ButtonX+]
 * └── (FooterZone)
 *       └── [AnyComponent+]  //#2
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
 * - //#1: ButtonX/MenuX não podem aparecer sequencialmente fora de NavIcon
 * - //#2: Componentes empilhados verticalmente
 * - //#3: empilhados horizontalmente - ocupam,juntos, toda a área horizontal
 * * ````
 *
 * - Em designer:
 *
 * ````
 * +----------------------------------+
 * | [PageZone]                       |          |
 * | ╔══════════════════════════════╗ |
 * | ║ [HeaderZone]                 ║ |
 * | ║ • [AnyComponent*] (V)        ║ |
 * | ║ • [HeaderBar*]:              ║ |
 * | ║   > [LftZ][MidZ][RgtZ]       ║ |
 * | ║   >> [ButonX*]/[MenuX*]...   ║ |
 * | ╚══════════════════════════════╝ |
 * | ╔══════════════════════════════╗ |
 * | ║ [EnclosureContent]           ║ |
 * | ║┌─────┐ +────────────+ ┌─────┐║ |
 * | ║│[NAV]│ |[ContentWr] │ │[NAV]│║ |
 * | ║│ •BX │ | •(PageZ)^  │ │ •BX │║ |
 * | ║│ •BX │ | •[AnyComp+]│ │ •BX │║ |
 * | ║└─────┘ +────────────+ └─────┘║ |
 * | ╚══════════════════════════════╝ |
 * | ╔══════════════════════════════╗ |
 * | ║ [FooterZone]                 ║ |
 * | ║ • [AnyComponent+] (V)        ║ |
 * | ╚══════════════════════════════╝ |
 * +----------------------------------+
 * ````
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
 * @behavior
 * - Prioridades:
 *   1. Acessibilidade (aria-label quando aplicável)
 *   2. Consistência visual (estados :hover, :active , ..., via CSS)
 *   3. Performance (zero JS para estado/animações/transições)
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
import { JSX, toChildArray, VNode } from 'preact';
import { tv, type VariantProps } from 'tailwind-variants';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { resolveClassName } from '../../ts/common/ui';
import './PageZone.scss';
//import { ContentWrapper } from '../ContentWrapper/ContentWrapper';
import { HeaderZone } from '../HeaderZone/HeaderZone';
import { Button, INavIcon, Menu, NavIcon } from '../NavIcon/NavIcon';
import { FooterZone } from '../FooterZone/FooterZone';
import { EnclosureContent } from '@ext/EnclosureContent/EnclosureContent';
import { ContentWrapper } from '@ext/ContentWrapper/ContentWrapper';
import { HAS } from '../../ts/common/logicos';

/** 🔗 Props */
export interface IPageZone
	extends Omit<JSX.HTMLAttributes<HTMLElement>, 'size'>,
		VariantProps<typeof PageZoneVariants> {
	escopo?: string;
	classPart?: string;
	left?: INavIcon;
	right?: INavIcon;
}

/** 🎨 Variantes */
const PageZoneVariants = tv({
	base: 'PageZone-jcem relative w-full',
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

/** 🧠 Type Guard */
const isType = (node: VNode, cmp: any) => node?.type === cmp;

/** 🚀 PageZone */
export function PageZone({
	escopo = 'pagezone',
	classPart = '',
	className,
	variant = 'normal',
	size = 'md',
	shadow = 'none',
	compact = false,
	children,
	left,
	right,
	...props
}: IPageZone) {
	/** 🔍 Processamento dos filhos */
	const childs = toChildArray(children).filter(Boolean) as VNode[];

	/** 🚥 Validar e extrair na ordem */
	let idx = 0;

	// Header (opcional, se presente deve ser primeiro)
	const header =
		isType(childs[idx], HeaderZone) ? childs[idx++] : null;

	// Nav Left (opcional, se presente deve ser segundo)
	const cleft =
		'flex-shrink-0 h-full' + HAS('className', left ? left : {}) ?
			left?.className
		:	'';
	if (left) delete left.className;
	const navLeft =
		!left ? false : (
			<NavIcon as="aside" className={cleft} {...left} />
		);

	// ContentWrapper (obrigatório)
	if (!isType(childs[idx], ContentWrapper)) {
		console.error(
			`[PageZone] Esperado <ContentWrapper> na posição ${idx + 1}.`,
		);
		throw new Error(
			`[PageZone] Conteúdo principal deve estar dentro de <ContentWrapper>.`,
		);
	}
	const content = childs[idx++];

	// Nav Right (opcional)
	const cright =
		'flex-shrink-0 h-full' + HAS('className', right ? right : {}) ?
			right?.className
		:	'';
	if (right) delete right.className;
	const navRight =
		!right ? false : (
			<NavIcon as="aside" className={cright} {...right} />
		);

	// Footer (opcional, se presente deve ser o último)
	const footer =
		isType(childs[idx], FooterZone) ? childs[idx++] : null;

	// 🚫 Sobras inválidas
	if (idx < childs.length) {
		console.error(
			`[PageZone] Componentes inesperados após posição ${idx}. Verifique a ordem: Header → NavLeft → ContentWrapper → NavRight → Footer.`,
		);
		throw new Error(`[PageZone] Ordem dos filhos inválida.`);
	}

	/** ⚠️ Avisos úteis */
	if (!header) {
		console.warn(
			`[PageZone] HeaderZone não fornecido. Página sem cabeçalho.`,
		);
	}
	if (!footer) {
		console.warn(
			`[PageZone] FooterZone não fornecido. Página sem rodapé.`,
		);
	}
	if (navLeft && !navRight) {
		console.warn(
			`[PageZone] Apenas NavIcon à esquerda. Considere adicionar um à direita.`,
		);
	}
	if (navRight && !navLeft) {
		console.warn(
			`[PageZone] Apenas NavIcon à direita. Considere adicionar um à esquerda.`,
		);
	}

	/** 🎨 Classes finais */
	const finalClass = twMerge(
		PageZoneVariants({ variant, size, shadow, compact }),
		clsx(
			`PageZone-jcem-${escopo}`,
			classPart && `PageZone-${classPart}`,
		),
		resolveClassName(className),
	);

	/** 🚧 Renderização */
	return (
		<section
			{...props}
			className={twMerge(
				finalClass,
				'flex flex-col min-h-dvh', // 🚩 Garante altura mínima da janela
			)}
		>
			{/* Header */}
			{header}

			{/* Body */}
			<EnclosureContent navLeft={navLeft} navRight={navRight}>
				{content}
			</EnclosureContent>

			{/* Footer */}
			{footer}
		</section>
	);
}
