/**
 * NavIcon — Barra de Navegação, Menu ou Toolbar.
 *
 * @description
 * Contêiner de botões (`ButtonX`) e menus (`MenuX`), utilizado para construir barras
 * de navegação verticais, horizontais, toolbars ou menus suspensos.
 * É um componente fundamental na composição de `PageZone` e `HeaderBar`.
 *
 * @structure
 * Layout geral:
 * ```
 * [NavIcon]
 *  ├── [input:radio]? (opcional, controle de estado se menuId estiver presente)
 *  └── [div.wrapper]
 *       └── [ul]
 *            ├── [ButtonX | MenuX]*
 * ```
 *
 * @integration
 * - Compatível com:
 *   • `PageZone`
 *   • `HeaderBar`
 *   • `MenuX`
 *   • `FootZone`
 * - Pode funcionar como:
 *   • Toolbar
 *   • Menu suspenso
 *   • Menu lateral
 *   • Barra horizontal
 *
 * @layout
 * - Orientação:
 *   • `vertical` (padrão)
 *   • `horizontal`
 * - Comportamento (`behavior`):
 *   • `toolbar` (default)
 *   • `menu` (menu flutuante, dropdown)
 *   • `header` (integrado ao HeaderBar)
 * - Classes:
 *   • Wrapper: `inav-jcem-{escopo}`
 *   • Itens (ul): flexível, configurável via `ulClass`
 * - Responsivo e adaptável ao contexto.
 * - Largura/altura conforme do modo (horizontal/vertical):
 *   • full: `100%` do espaço disponível.
 *   • fixa: definida arbitratiamente (mas responsiva).
 *   • minima: ajusta ao conteúdo.
 * - Overflow: Nunca usa scrollbar → cria submenus ou colapsa.
 *
 * @behavior
 * - Prioridades:
 *   1. Acessibilidade (aria-label quando aplicável)
 *   2. Consistência visual (estados :hover, :active , ..., via CSS)
 *   3. Performance (zero JS para estado/animações/transições)
 * - Suporte a controle de abertura/fechamento por `input:radio`.
 * - Abertura baseada em `menuId` + `checked`.
 * - Suporte a controle externo (`opened`).
 * - Sincroniza estado via `data-*` e `peer-checked`.
 * - Permite nesting ilimitado com `MenuX`.
 *
 * @props
 * - `itens`: array de `ButtonX` ou `MenuX`.
 * - `escopo`: string (define o namespace dos dados e classes).
 * - `menuId`: string (id opcional para controle por input:radio).
 * - `opened`: boolean (força estado aberto/fechado).
 * - `orientation`: 'vertical' | 'horizontal'.
 * - `behavior`: 'toolbar' | 'menu' | 'header'.
 * - `ulClass`: classes aplicadas ao ul (lista dos itens).
 * - `wrapperClass`: classes aplicadas ao wrapper principal.
 * - `className`: classes adicionais ao wrapper principal.
 *
 * @style
 * - Arquitetura CSS:
 *   • DaisyUI + Tailwind Variants + Tailwind Merge + clsx
 *   • Wrapper: `inav-jcem-wrapper`.
 *   • Escopo: classes `inav-jcem-wrapper-{escopo}`.
 * - Composição segura com `tailwind-merge` e `clsx`
 * - Customização:
 *   • Classes podem ser sobrescritas
 * - Estados:
 *   • Controlados via data-attributes e pseudo-classes
 *   • Transições CSS-only
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
 * @dependencies
 * - Preact + Vite (core)
 * - ButtonX (botão principal)
 * - NavIcon (container dos itens)
 * - tailwind-variants + tailwind-merge + clsx
 *
 * @see {@link ButtonX}
 * @see {@link MenuX}
 */

import { ButtonX, TButtonX } from '../ButtonX/ButtonX';
import { JSX } from 'preact';
import { guid } from '../../ts/common/generic';
import { useRef } from 'preact/hooks';
import { tv } from 'tailwind-variants';
import { twMerge } from 'tailwind-merge';
import { IMenuX, MenuX } from '@ext/MenuX/MenuX';
import {
	HTML_TAGS,
	HtmlTag,
	resolveClassName,
	TItemX,
} from '../../ts/common/ui';
import { isTrue } from '../../ts/common/logicos';

/** Type guard para diferenciar MenuX */
function isMenu(
	item: TItemX,
): item is Extract<TItemX, { kind: 'menu' }> {
	return item.kind === 'menu' || 'itens' in item;
}

export const Button = (props: Omit<TButtonX, 'kind'>): TItemX =>
	({
		...props,
		kind: 'button',
	}) as TItemX;

export const Menu = (props: Omit<IMenuX, 'kind'>): TItemX =>
	({
		...props,
		kind: 'menu',
	}) as TItemX;

/** Props do NavIcon */
export interface INavIcon
	extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'className'> {
	itens: TItemX[];
	escopo?: string;
	menuId?: string;
	ulClass?: string | (() => string);
	wrapperClass?: string | (() => string);
	opened?: boolean;
	orientation?: 'vertical' | 'horizontal';
	behavior?: 'toolbar' | 'menu' | 'header';
	className?: string | (() => string);
	as?: any;
}

/** Variantes visuais */
const navIconVariants = tv({
	base: 'inav-jcem transition-all duration-200',
	variants: {
		behavior: {
			toolbar: 'bg-base-100 rounded-lg p-1',
			menu: 'absolute z-50',
			header: 'flex items-center',
		},
		orientation: {
			vertical: 'flex flex-col',
			horizontal: 'flex flex-row',
		},
		opened: {
			true: 'opacity-100 visible',
			false: 'opacity-0 invisible absolute',
		},
	},
	defaultVariants: {
		behavior: 'toolbar',
		orientation: 'vertical',
		opened: true,
	},
});

/** 🔥 Componente NavIcon */
export function NavIcon<T extends HtmlTag>({
	as = `div`,
	menuId,
	escopo = 'global_menu',
	itens,
	ulClass,
	wrapperClass,
	opened = true,
	orientation = 'vertical',
	behavior = 'toolbar',
	className,
	...props
}: INavIcon) {
	const Tag = HTML_TAGS.includes(as) ? as : 'section';
	const cid = useRef(menuId ?? `inav-${guid(18)}`).current;

	/** 🔨 Renderiza cada item */
	const renderItem = (item: TItemX, idx: number) => {
		const commonProps = {
			key: `${cid}-item-${idx}`,
			className: twMerge(
				'w-full text-left',
				resolveClassName(item.className),
			),
		};

		const content =
			isMenu(item) ?
				<MenuX
					{...commonProps}
					{...item}
					variant={
						orientation === 'horizontal' ? 'horizontal' : 'dropdown'
					}
				/>
			:	<ButtonX {...commonProps} {...item} />;

		/** 🔗 Sempre encapsular em <li> */
		return <li key={`${cid}-li-${idx}`}>{content}</li>;
	};

	return (
		<>
			{/* Controle de estado via input */}
			{menuId && (
				<input
					type="radio"
					name={escopo}
					id={cid}
					className="hidden peer"
					checked={isTrue(opened)}
				/>
			)}

			{/* Wrapper */}
			<Tag
				{...(menuId ? { 'data-menu': cid } : { 'data-inav': cid })}
				{...props}
				className={twMerge(
					navIconVariants({
						behavior,
						orientation,
						opened: isTrue(opened),
					}),
					`inav-jcem-${escopo}`,
					resolveClassName(wrapperClass),
					resolveClassName(className),
				)}
				data-navicon={cid}
			>
				{/* Lista dos itens */}
				<ul
					className={twMerge(
						behavior === 'menu' ?
							'menu bg-base-100 p-2 rounded-box'
						:	'flex',
						orientation === 'horizontal' ?
							'gap-2 items-center'
						:	'gap-1',
						resolveClassName(ulClass),
					)}
				>
					{itens.map(renderItem)}
				</ul>
			</Tag>
		</>
	);
}
