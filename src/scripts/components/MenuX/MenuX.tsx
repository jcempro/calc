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
 *   1. Acessibilidade (aria-label quando aplicável
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
 * - `menuVariant`: tipo de menu (`dropdown` | `vertical` | `horizontal`).
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

import { IButtonX, ButtonX } from '../ButtonX/ButtonX';
import { useRef } from 'preact/hooks';
import { JSX } from 'preact';
import { guid } from '../../ts/common/generic';
import { NavIcon } from '../NavIcon/NavIcon';
import { tv } from 'tailwind-variants';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx'; // Importação adicionada aqui

export interface IMenuX extends Omit<IButtonX, 'htmlFor'> {
	itens: IButtonX[];
	checked?: boolean;
	navClass?: string;
	menuAlign?: 'left' | 'center' | 'right';
	menuVariant?: 'dropdown' | 'vertical' | 'horizontal';
	className?: string | JSX.SignalLike<string | undefined>;
}

const menuVariants = tv({
	base: 'menu-jcem-wrapper relative',
	variants: {
		variant: {
			dropdown: 'dropdown',
			vertical: '',
			horizontal: '',
		},
		align: {
			left: '',
			center: 'dropdown-center',
			right: 'dropdown-end',
		},
	},
	defaultVariants: {
		variant: 'dropdown',
		align: 'left',
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

export function MenuX({
	escopo = 'global_menu',
	itens,
	checked,
	navClass = '',
	menuAlign = 'left',
	menuVariant = 'dropdown',
	className,
	...props
}: IMenuX) {
	const id = useRef(`menu-${guid(18)}`).current;

	const resolveClass = (cls: unknown) =>
		typeof cls === 'function' ? cls() : cls;

	return (
		<div
			data-menu={id}
			className={menuVariants({
				variant: menuVariant,
				align: menuAlign,
				className: twMerge(
					`menu-jcem-wrapper-${escopo}`,
					resolveClass(className),
				),
			})}
		>
			<ButtonX
				{...props}
				htmlFor={id}
				escopo={escopo}
				className={twMerge(
					resolveClass(props.class),
					menuVariant === 'dropdown' && 'dropdown-toggle',
				)}
			/>

			<NavIcon
				menuId={id}
				escopo={escopo}
				behavior="menu"
				orientation={
					menuVariant === 'horizontal' ? 'horizontal' : 'vertical'
				}
				ulClass={twMerge(
					menuContentVariants({ variant: menuVariant }),
					resolveClass(navClass),
				)}
				wrapperClass={clsx(
					// Corrigido para usar clsx
					'peer-checked:block hidden absolute',
					menuVariant === 'dropdown' && 'mt-1',
					menuVariant === 'horizontal' && 'ml-1',
				)}
				itens={itens}
				opened={checked}
			/>
		</div>
	);
}
