import { JSX } from 'preact';
import './Button.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { HAS, isTrue } from '../../ts/common/generic';
import { TOBJ } from '../../ts/common/interfaces';
import { tv, VariantProps } from 'tailwind-variants';

// Definindo as variantes com tailwind-variants
const buttonVariants = tv({
	base: 'btn btn-accent flex items-center',
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

type ButtonVariants = VariantProps<typeof buttonVariants>;

export type TBTBIcon = {
	left?: IconProp;
	right?: IconProp;
};

export interface IButton
	extends JSX.HTMLAttributes<HTMLLabelElement>,
		ButtonVariants {
	caption?: string;
	icone?: string | Partial<TBTBIcon>;
	ariaLabel?: string;
	htmlFor?: string;
	escopo?: string;
}

export function Button({
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
}: IButton) {
	const icon: TBTBIcon =
		typeof icone === `string` && icone.trim().length > 0 ?
			({ left: icone.trim() } as TOBJ)
		: !icone ? {}
		: (icone as TBTBIcon);

	const has_licon = icone && HAS('left', icon);
	const has_ricon = icone && HAS('right', icon) && !center;
	const has_cap = caption && caption.trim().length > 0;

	// Determina o que será mostrado quando não houver espaço suficiente
	const showCompact =
		has_licon ? 'icon-only'
		: has_cap ? 'text-only'
		: 'empty';

	// Tamanho dos ícones baseado no tamanho do botão
	const iconSizeClass =
		size === 'xs' ? 'h-3 w-3'
		: size === 'sm' ? 'h-3.5 w-3.5'
		: size === 'lg' ? 'h-5 w-5'
		: 'h-4 w-4';

	return (
		<label
			{...props}
			aria-label={ariaLabel}
			htmlFor={htmlFor}
			className={buttonVariants({
				size,
				compact,
				center,
				hasLeftIcon: isTrue(has_licon),
				hasRightIcon: isTrue(has_ricon),
				hasCaption: isTrue(has_cap),
				className: `btb-jcem-${escopo ?? 'btb'} ${className || ''}`,
			})}
		>
			{/* Ícone Esquerdo */}
			{has_licon && (
				<div
					class={`
            ${(!has_cap && !has_ricon) || center ? 'mx-auto' : 'mr-2'}
            ${has_cap && !center ? 'flex-shrink-0' : ''}
            ${showCompact === 'icon-only' ? 'btb-compact-icon' : ''}
          `}
				>
					<FontAwesomeIcon
						icon={icon.left as IconProp}
						class={iconSizeClass}
					/>
				</div>
			)}

			{/* Texto */}
			{has_cap && (
				<span
					class={`
            ${center ? 'text-center mx-auto' : 'text-left'}
            ${has_ricon ? 'hidden xs:inline' : ''}
            ${has_licon && !center ? 'ml-2' : ''}
            truncate
            ${showCompact === 'text-only' ? 'btb-compact-text' : ''}
          `}
				>
					{caption}
				</span>
			)}

			{/* Ícone Direito */}
			{has_ricon && (
				<div class="ml-auto hidden sm:flex flex-shrink-0">
					<FontAwesomeIcon
						icon={icon.right as IconProp}
						class={iconSizeClass}
					/>
				</div>
			)}
		</label>
	);
}
