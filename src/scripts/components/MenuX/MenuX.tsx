/**
 * MenuX — Componente de menu expansível baseado em ButtonX.
 *
 * @description
 * Cria um botão com capacidade de expandir um menu de ações.
 * Funciona como uma extensão de `ButtonX` integrado a `NavIcon`,
 * permitindo menus nos formatos dropdown, vertical ou horizontal.
 *
 * @structure
 * [input:radio] + [ButtonX] + [NavIcon]
 *
 * Layout geral:
 * ```
 * [MenuX]
 *  ├── [input:radio] (controle de estado invisível)
 *  ├── [ButtonX] (botão do menu)
 *  └── [NavIcon] (itens do menu)
 * ```
 *
 * @integration
 * - Compatível com qualquer `PageZone` e `NavIcon`.
 * - Opera como menu dentro de barras de navegação ou isoladamente.
 * - Sincroniza estado via input:radio (peer) e atributos data-*.
 * - Pode ser usado como dropdown, menu lateral ou barra horizontal.
 * - Se comporta 100% como um ButtonX, com recursos adicionais.
 *
 * @layout
 * - Modos de exibição:
 *   • `dropdown` → menu suspenso.
 *   • `vertical` → menu lateral.
 *   • `horizontal` → barra de ferramentas expansível.
 * - Alinhamento (menuAlign):
 *   • `left` (padrão)
 *   • `center`
 *   • `right` (apenas para dropdown)
 *
 * @behavior
 * - Prioridades:
 *   1. Acessibilidade (aria-label quando aplicável)
 *   2. Consistência visual (estados :hover, :active , ..., via CSS)
 *   3. Performance (zero JS para estado/animações/transições)
 * - Abertura e fechamento são controlados por input:hidden + label.
 * - Suporte a estado controlado externo (`checked`).
 * - Usa CSS puro para estados visuais e exibição (`peer-checked`).
 *
 * @props
 * - Herda todas as props de `ButtonX`, exceto `htmlFor`.
 * - `itens`: lista de botões (`ButtonX[]`) exibidos no menu.
 * - `menuAlign`: alinhamento do menu (`left` | `center` | `right`).
 * - `variant`: tipo de menu (`dropdown` | `vertical` | `horizontal`).
 * - `navClass`: classes adicionais aplicadas à lista (`ul`) do menu.
 * - `className`: classes do wrapper principal (`div`).
 * - `checked`: controla abertura inicial (opcional).
 *
 * @style
 * - Arquitetura CSS:
 *   • Base: DaisyUI + Tailwind Variants.
 *   • Wrapper: `menu-jcem-wrapper`.
 *   • Content: `dropdown-content` ou flexível (vertical/horizontal).
 *   • Escopo: classes `menu-jcem-wrapper-{escopo}`.
 * - Composição segura com `tailwind-merge` e `clsx`.
 * - Temas:
 *   • Segue os tokens/temas do Tailwind + DaisyUI
 * - Customização:
 *   • Classes podem ser sobrescritas
 * - Estados:
 *   • Controlados via data-attributes e pseudo-classes
 *   • Transições CSS-only
 *
 * @development
 * - Usa `guid()` para gerar IDs únicos.
 * - Warnings e validações são na maioria responsabilidade do ButtonX/NavIcon.
 * - Mantém arquitetura declarativa, sem hooks de estado manual.
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
 * @see {@link ButtonX} — Botão base do Menu.
 * @see {@link NavIcon} — Container dos itens do menu.
 */

import { useRef } from 'preact/hooks';
import { JSX } from 'preact';
import { TButtonX, ButtonX } from '../ButtonX/ButtonX';
import { NavIcon } from '../NavIcon/NavIcon';
import { guid } from '../../ts/common/generic';
import { tv, type VariantProps } from 'tailwind-variants';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import {
	getCaption,
	resolveClassName,
	TItemX,
} from '../../ts/common/ui';
import { HAS } from '../../ts/common/logicos';

export interface IMenuX
	extends Omit<TButtonX, 'htmlFor'>,
		VariantProps<typeof variants> {
	itens: TItemX[];
	checked?: boolean;
	navClass?: string | (() => string);
	menuAlign?: 'left' | 'center' | 'right';
	variant?: 'dropdown' | 'vertical' | 'horizontal';
	className?: string | (() => string);
}

const variants = tv({
	base: 'menu-jcem-wrapper relative',
	variants: {
		variant: {
			dropdown: 'dropdown',
			vertical: '',
			horizontal: '',
		},
		menuAlign: {
			left: '',
			center: 'dropdown-center',
			right: 'dropdown-end',
		},
	},
	defaultVariants: {
		variant: 'dropdown',
		menuAlign: 'left',
	},
});

const menuContentVariants = tv({
	base: 'z-[1] bg-base-100 shadow-lg rounded-box',
	variants: {
		variant: {
			dropdown: 'dropdown-content',
			vertical: 'flex flex-col',
			horizontal: 'flex flex-row',
		},
	},
});

/** 🌟 Componente MenuX */
export function MenuX({
	escopo = 'global_menu',
	itens,
	checked,
	navClass,
	menuAlign = 'left',
	variant: variant = 'dropdown',
	className,
	...props
}: IMenuX) {
	props.caption = getCaption(props.caption, props.label);
	if (HAS('label', props)) {
		delete props['label'];
	}

	const id = useRef(`menu-${guid(18)}`).current;

	/** 🎨 Classes do wrapper */
	const wrapperClass = variants({
		variant: variant,
		menuAlign,
		className: twMerge(
			`menu-jcem-wrapper-${escopo}`,
			resolveClassName(className),
		),
	});

	/** 🎨 Classes da lista do menu (NavIcon) */
	const navUlClass = twMerge(
		menuContentVariants({ variant: variant }),
		resolveClassName(navClass),
	);

	/** 🎨 Classes do wrapper da NavIcon (menu flutuante) */
	const navWrapperClass = clsx(
		'peer-checked:block hidden absolute',
		variant === 'dropdown' && 'mt-1',
		variant === 'horizontal' && 'ml-1',
	);

	if (!itens?.length) {
		console.warn(`MenuX (${escopo}) criado sem itens.`);
	}

	return (
		<div data-menu={id} className={wrapperClass}>
			<ButtonX
				{...(props as TButtonX)}
				htmlFor={id}
				escopo={escopo}
				className={twMerge(
					resolveClassName(className),
					variant === 'dropdown' && 'dropdown-toggle',
				)}
			/>

			<NavIcon
				menuId={id}
				escopo={escopo}
				behavior="menu"
				orientation={
					variant === 'horizontal' ? 'horizontal' : 'vertical'
				}
				itens={itens}
				opened={checked}
				ulClass={navUlClass}
				wrapperClass={navWrapperClass}
			/>
		</div>
	);
}
