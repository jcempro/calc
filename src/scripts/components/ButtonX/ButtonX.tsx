/**
 * ButtonX - Botão genérico, responsivo e customizável.
 *
 * @example
 * <ButtonX
 *   caption="Confirmar"
 *   icon={{ left: 'fas save', right: 'fas check' }}
 *   size="md"
 * />
 *
 * @structure
 * - Estrutura dinâmica: [leftIcon]? [caption]? [rightIcon]?
 *
 * Layout geral:
 * ```
 * [ButtonX]
 *  ├── [leftIcon] (Icone esquerdo - Principal)
 *  ├── [caption] (Texto do botão)
 *  └── [rightIcon] (Icone direito)
 * ```
 *
 * - RightIcon só é renderizado quando:
 *   • Existe caption **OU**
 *   • Existe leftIcon + configuração explícita
 *   • Caption pode ser o atributo caption XOR label
 * - Alinhamento automático baseado no conteúdo:
 *   • Conteúdo centralizado quando apenas leftIcon presente
 *   • RightIcon sempre alinhado à extremidade direita
 *   • LeftIcon + caption: alinhamento configurável (esquerda/centro) padrão left
 *
 * @integration
 * - Compatibilidade total com NavIcon (modos horizontal/vertical):
 *   • Responde automaticamente a estados pai (expandido/retraído)
 *   • Capaz de ajustar largura conforme contexto do container
 *   • design system usando input:radio + label, quando pertinente
 *
 * @layout
 * - Modos operacionais:
 *   • `inline`: Largura conforme conteúdo (w-auto)
 *   • `full`: Largura uniforme entre siblings (baseada no maior elemento)
 *
 * - Responsividade intrínseca (xs, sm, md, lg)
 * - Tratamento de overflow:
 *   • Caption usa truncate
 *   • Ícones mantêm proporção fixa
 *
 * @responsive
 * - xs: 320px+
 * - sm: 480px+
 * - md: 768px+
 * - lg: 1024px+
 *
 * @behavior
 * - Prioridades:
 *   1. Acessibilidade (aria-label obrigatório sem caption)
 *   2. Consistência visual (estados :hover, :active via CSS)
 *   3. Performance (zero JS para estado/animações/transições)
 * - Tratamento de ícones:
 *   • Aceita FontAwesome como string ("fas icon-name") ou IconProp
 *   • Normalização automática de formatos e icones
 *   • Fallback para ícone padrão em erros
 *
 * @style
 * - Arquitetura CSS:
 *   • Base: DaisyUI
 *   • Variações: Tailwind Variants
 *   • Combinação segura: Tailwind Merge
 * - Temas:
 *   • Segue os tokens/temas do Tailwind + DaisyUI
 * - Customização:
 *   • Classes podem ser sobrescritas
 *   • Conflitos de estilos e redundancias são resolvidos e geram warnings
 * - Estados:
 *   • Controlados via data-attributes e pseudo-classes
 *   • Transições CSS-only
 * - Font: fontawesome, incluindo brands, regular e solids; tranpilação: apenas o realmente usado;
 *
 * @development
 * - Boas práticas:
 *   • Mensagens de log/warn/error via Logger
 *   • Manutenção git-friendly (evitar breaking changes)
 *   • Comentários objetivos para mudanças complexas
 *   • Manter esta documentação no topo código com ajustes mínimos pertinentes
 *   • Comentário de uma única linha preferíveis, exceto quando para jsDoc
 *   • Font: fontawesome, incluindo brands, regular e solids; tranpilação: apenas o realmente usado;
 *
 * @dependencies
 *   • Preact + Vite (core)
 *   • @fortawesome/react-fontawesome (ícones)
 *   • tailwind-merge + tailwind-variants (estilos) + clsx
 *   • DaisyUI
 *
 * @see {@link NavIcon} Para uso em barras de ferramentas
 */

import { JSX } from 'preact';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	IconProp,
	IconName,
	IconPrefix,
} from '@fortawesome/fontawesome-svg-core';
import { tv, type VariantProps } from 'tailwind-variants';
import { twMerge } from 'tailwind-merge';
import Logger from '../../ts/utils/logger';
import {
	getCaption,
	resolveClassName,
	TCaption,
} from '../../ts/common/ui';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { noEmpty } from '../../ts/common/logicos';

/** Tipagem para ícones lado esquerdo e direito */
export type TBTBIcon = {
	left?: IconProp;
	right?: IconProp;
};

/** Variantes visuais usando Tailwind Variants */
const buttonVariants = tv({
	base: [
		'btn',
		'btn-accent',
		'cursor-pointer',
		'shadow-none hover:shadow-none',
		'rounded-lg',
		'btb-jcem',
	],
	variants: {
		size: {
			xs: 'btn-xs w-72',
			sm: 'btn-sm w-72',
			md: 'btn-md w-72',
			lg: 'btn-lg w-72',
		},
		compact: {
			true: 'w-auto',
		},
		center: {
			true: 'btb-jcem-center',
		},
		hasLeftIcon: {
			true: 'btb-jcem-licon',
		},
		hasRightIcon: {
			true: 'btb-jcem-ricon',
		},
		hasCaption: {
			true: 'btb-jcem-caption',
		},
	},
	defaultVariants: {
		size: 'md',
		center: true,
	},
	compoundVariants: [
		{
			hasLeftIcon: true,
			hasCaption: false,
			hasRightIcon: false,
			center: true,
			class: 'mx-auto',
		},
		{
			hasLeftIcon: true,
			hasCaption: true,
			center: false,
			class: 'mr-2 flex-shrink-0',
		},
		{
			hasRightIcon: true,
			class: 'ml-auto hidden sm:flex flex-shrink-0',
		},
		{
			hasCaption: true,
			hasRightIcon: true,
			class: 'hidden xs:inline',
		},
	],
});

/** Props do ButtonX */
export type TButtonX = Omit<
	JSX.HTMLAttributes<HTMLLabelElement>,
	'className'
> &
	VariantProps<typeof buttonVariants> & {
		icon?: string | IconProp | TBTBIcon;
		ariaLabel?: string;
		htmlFor?: string;
		escopo?: string;
		className?: string | (() => string) | undefined;
	} & TCaption;

/** Componente principal ButtonX */
export function ButtonX({
	caption,
	label,
	icon,
	ariaLabel,
	htmlFor,
	escopo,
	center = true,
	compact = false,
	size = 'md',
	className,
	...props
}: TButtonX) {
	caption = getCaption(caption, label);

	/** Tamanho de ícone por variante de tamanho */
	const iconSizeClass = {
		xs: 'h-3 w-3',
		sm: 'h-3.5 w-3.5',
		md: 'h-4 w-4',
		lg: 'h-5 w-5',
	}[size];

	/** Normalização de qualquer formato de entrada de ícone */
	const normalizeIcon = (
		icon: string | IconProp | TBTBIcon | undefined,
	): TBTBIcon => {
		if (!icon) return {};

		// 🟩 Caso seja objeto com left/right
		if (
			typeof icon === 'object' &&
			('left' in icon || 'right' in icon)
		) {
			return {
				left: icon.left ? ensureIconProp(icon.left) : undefined,
				right: icon.right ? ensureIconProp(icon.right) : undefined,
			};
		}

		return { left: ensureIconProp(icon, icon) };
	};

	/** Garantia de IconProp válido */
	function ensureIconProp(x: any, def?: any): IconProp {
		def = typeof def !== undefined ? def : ['fas', 'question-circle'];

		if (!x) {
			Logger.warn('Ícone inválido fornecido.');
			return def;
		}

		if (noEmpty(x, 'string')) {
			const [prefix = 'fas', ...rest] = `${x}`.trim().split(/\s+/);
			const iconName = rest.join('-').replace(/^fa-/, '');
			if (iconName) {
				return [prefix as IconPrefix, iconName as IconName];
			}
		}

		Logger.warn(`Ícone string inválido: "${x}"`);
		return def;
	}

	const icn = normalizeIcon(icon);
	const has_licon = !!icn.left;
	const has_ricon = !!icn.right && (has_licon || !!caption);
	const has_cap = !!caption?.trim();

	/** Lógica para centralização automática */
	const shouldCenter =
		center ||
		(!has_licon && !has_ricon) ||
		(has_licon && !has_cap && !has_ricon);

	/** Validação de acessibilidade */
	if (!ariaLabel && !has_cap) {
		Logger.warn(
			'[ButtonX] — Falta ariaLabel: é obrigatório quando caption está ausente.',
		);
	}

	/** Classes finais */
	const baseClasses = buttonVariants({
		size,
		compact,
		center: shouldCenter,
		hasLeftIcon: has_licon,
		hasRightIcon: has_ricon,
		hasCaption: has_cap,
	});

	const resolvedClass = twMerge(
		baseClasses,
		`btb-jcem-${escopo ?? 'btb'}`,
		resolveClassName(className),
	);

	return (
		<label
			{...props}
			aria-label={ariaLabel}
			htmlFor={htmlFor}
			className={resolvedClass}
		>
			{/* Left Icon */}
			{has_licon && (
				<div>
					<FontAwesomeIcon icon={icn.left!} class={iconSizeClass} />
				</div>
			)}

			{/* Caption */}
			{has_cap && <span class="truncate">{caption}</span>}

			{/* Right Icon */}
			{has_ricon && (
				<div>
					<FontAwesomeIcon icon={icn.right!} class={iconSizeClass} />
				</div>
			)}
		</label>
	);
}
