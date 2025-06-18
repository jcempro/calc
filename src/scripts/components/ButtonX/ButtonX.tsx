import { JSX } from 'preact';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	IconProp,
	IconName,
	IconPrefix,
} from '@fortawesome/fontawesome-svg-core';
import { tv, type VariantProps } from 'tailwind-variants';
import { noEmpty } from '../../ts/common/generic';
import { twMerge } from 'tailwind-merge';

// 1. Tipos originais mantidos
export type TBTBIcon = {
	left?: IconProp;
	right?: IconProp;
};

// 2. Variantes - Adaptação mínima
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
});

// 3. Interface mantida idêntica
export interface IButtonX
	extends JSX.HTMLAttributes<HTMLLabelElement>,
		VariantProps<typeof buttonVariants> {
	caption?: string;
	icone?: string | IconProp | TBTBIcon;
	ariaLabel?: string;
	htmlFor?: string;
	escopo?: string;
}

// 4. Componente principal - Correção do erro
export function ButtonX({
	caption,
	icone,
	ariaLabel,
	htmlFor,
	escopo,
	center = true,
	compact = false,
	size = 'md',
	className,
	...props
}: IButtonX) {
	// Tamanho dos ícones
	const iconSizeClass = {
		xs: 'h-3 w-3',
		sm: 'h-3.5 w-3.5',
		md: 'h-4 w-4',
		lg: 'h-5 w-5',
	}[size];

	// Normalização de ícones
	const normalizeIcon = (
		icone: string | IconProp | TBTBIcon | undefined,
	): TBTBIcon => {
		if (!icone) return {};
		if (typeof icone === 'object' && 'left' in icone) {
			return {
				left: icone.left ? ensureIconProp(icone.left) : undefined,
				right: icone.right ? ensureIconProp(icone.right) : undefined,
			};
		}
		if (noEmpty(icone, 'string')) {
			const [prefix, iconName] = `${icone}`.split(' ') as [
				IconPrefix,
				string,
			];
			return {
				left: [prefix, iconName.replace('fa-', '') as IconName],
			};
		}
		return { left: ensureIconProp(icone) };
	};

	function ensureIconProp(icon: any): IconProp {
		if (!icon) {
			console.warn('Ícone inválido fornecido');
			return ['fas', 'question-circle'];
		}
		return icon;
	}

	const icon = normalizeIcon(icone);
	const has_licon = !!icon.left;
	const has_ricon = !!icon.right && (has_licon || !!caption);
	const has_cap = !!caption?.trim();
	const shouldCenter =
		center ||
		(!has_licon && !has_ricon) ||
		(has_licon && !has_cap && !has_ricon);

	// Correção principal: Removido .className desnecessário
	const baseClasses = buttonVariants({
		size,
		compact,
		center: shouldCenter,
		hasLeftIcon: has_licon,
		hasRightIcon: has_ricon,
		hasCaption: has_cap,
	});

	// Tratamento seguro para className (incluindo Signals)
	const resolvedClass = twMerge(
		baseClasses, // Já é uma string
		`btb-jcem-${escopo ?? 'btb'}`,
		typeof className === 'function' ?
			(className as Function)()
		:	className,
	);

	return (
		<label
			{...props}
			aria-label={ariaLabel}
			htmlFor={htmlFor}
			className={resolvedClass}
		>
			{/* Renderização de ícones e texto mantida igual */}
			{has_licon && (
				<div
					class={`
          ${shouldCenter ? 'mx-auto' : 'mr-2'}
          ${has_cap && !shouldCenter ? 'flex-shrink-0' : ''}
        `}
				>
					<FontAwesomeIcon icon={icon.left!} class={iconSizeClass} />
				</div>
			)}

			{has_cap && (
				<span
					class={`
          ${shouldCenter ? 'text-center' : 'text-left'}
          ${has_ricon ? 'hidden xs:inline' : ''}
          truncate
        `}
				>
					{caption}
				</span>
			)}

			{has_ricon && (
				<div class="ml-auto hidden sm:flex flex-shrink-0">
					<FontAwesomeIcon icon={icon.right!} class={iconSizeClass} />
				</div>
			)}
		</label>
	);
}
