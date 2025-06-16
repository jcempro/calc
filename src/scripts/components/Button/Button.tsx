import { JSX } from 'preact';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	IconProp,
	IconName,
	IconPrefix,
} from '@fortawesome/fontawesome-svg-core';
import { tv, VariantProps } from 'tailwind-variants';

// 1. Tipos e Constantes
export type TBTBIcon = {
	left?: IconProp;
	right?: IconProp;
};

export interface IButton
	extends JSX.HTMLAttributes<HTMLLabelElement>,
		ButtonVariants {
	caption?: string;
	icone?: string | IconProp | TBTBIcon;
	ariaLabel?: string;
	htmlFor?: string;
	escopo?: string;
}

// 2. Componente Principal
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
	// 3. Tamanho dos ícones responsivo
	const iconSizeClass = {
		xs: 'h-3 w-3',
		sm: 'h-3.5 w-3.5',
		md: 'h-4 w-4',
		lg: 'h-5 w-5',
	}[size];

	// 4. Normalização segura de ícones (sem carregar tudo)
	const normalizeIcon = (
		icone: string | IconProp | TBTBIcon | undefined,
	): TBTBIcon => {
		if (!icone) return {};

		// Caso 1: Já está no formato TBTBIcon
		if (typeof icone === 'object' && 'left' in icone) {
			return {
				left: icone.left ? ensureIconProp(icone.left) : undefined,
				right: icone.right ? ensureIconProp(icone.right) : undefined,
			};
		}

		// Caso 2: String (formato "fas fa-ellipsis-v")
		if (typeof icone === 'string') {
			const [prefix, iconName] = icone.split(' ') as [
				IconPrefix,
				string,
			];
			return {
				left: [prefix, iconName.replace('fa-', '') as IconName],
			};
		}

		// Caso 3: IconProp direto (IconDefinition, [IconPrefix, IconName], etc.)
		return {
			left: ensureIconProp(icone),
		};
	};

	// 3. Função helper para garantir IconProp válido
	function ensureIconProp(icon: any): IconProp {
		if (!icon) {
			console.warn('Ícone inválido fornecido');
			return ['fas', 'question-circle']; // Fallback seguro
		}
		return icon;
	}

	const icon = normalizeIcon(icone);
	const has_licon = !!icon.left;
	const has_ricon = !!icon.right && (has_licon || !!caption);
	const has_cap = !!caption?.trim();

	// 5. Lógica de layout responsivo
	const shouldCenter =
		center ||
		(!has_licon && !has_ricon) ||
		(has_licon && !has_cap && !has_ricon);

	// 6. Renderização
	return (
		<label
			{...props}
			aria-label={ariaLabel}
			htmlFor={htmlFor}
			className={buttonVariants({
				size,
				compact,
				center: shouldCenter,
				hasLeftIcon: has_licon || undefined,
				hasRightIcon: has_ricon || undefined,
				hasCaption: has_cap || undefined,
				className: `btb-jcem-${escopo ?? 'btb'} ${className || ''}`,
			})}
		>
			{/* Ícone Esquerdo */}
			{has_licon && (
				<div
					class={`
          ${shouldCenter ? 'mx-auto' : 'mr-2'}
          ${has_cap && !shouldCenter ? 'flex-shrink-0' : ''}
        `}
				>
					<FontAwesomeIcon
						icon={icon.left!}
						className={iconSizeClass}
					/>
				</div>
			)}

			{/* Texto */}
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

			{/* Ícone Direito */}
			{has_ricon && (
				<div class="ml-auto hidden sm:flex flex-shrink-0">
					<FontAwesomeIcon
						icon={icon.right!}
						className={iconSizeClass}
					/>
				</div>
			)}
		</label>
	);
}

// 7. Variantes do Tailwind (mantido igual)
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
