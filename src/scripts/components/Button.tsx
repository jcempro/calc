import { JSX } from 'preact';
import './Button.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { HAS } from '../ts/common/generic';

export interface IButton
	extends JSX.HTMLAttributes<HTMLLabelElement> {
	caption?: string;
	icone?: Partial<{
		left: IconProp;
		right: IconProp;
	}>;
	ariaLabel?: string;
	htmlFor?: string;
	escopo?: string;
	center?: boolean; // Novo parâmetro
}

export function Button({
	caption,
	icone,
	ariaLabel,
	htmlFor,
	escopo,
	center = true, // Valor padrão false
	...props
}: IButton) {
	const baseClass = `btn btn-accent w-72 flex items-center`;

	props.className = `btb-jcem-${escopo ?? 'btb'} ${baseClass} ${
		props.className ? ' ' + props.className : ''
	}`;

	const has_licon = icone && HAS('left', icone);
	const has_ricon = icone && HAS('right', icone) && !center; // Não mostra ícone direito se center=true
	const has_cap = caption && caption.trim().length > 0;

	// Classes condicionais
	props.className +=
		(has_licon ? ' btb-jcem-licon' : '') +
		(has_ricon ? ' btb-jcem-ricon' : '') +
		(has_cap ? ' btb-jcem-caption' : '') +
		(center ? ' btb-jcem-center' : '');

	// Determina o que será mostrado quando não houver espaço suficiente
	const showCompact =
		has_licon ? 'icon-only'
		: has_cap ? 'text-only'
		: 'empty';

	return (
		<label {...props} aria-label={ariaLabel} htmlFor={htmlFor}>
			{/* Ícone Esquerdo - comportamento varia conforme center e espaço */}
			{has_licon && (
				<div
					class={`
            ${(!has_cap && !has_ricon) || center ? 'mx-auto' : 'mr-2'}
            ${has_cap && !center ? 'flex-shrink-0' : ''}
            ${showCompact === 'icon-only' ? 'btb-compact-icon' : ''}
          `}
				>
					<FontAwesomeIcon
						icon={icone.left as IconProp}
						class="h-4 w-4"
					/>
				</div>
			)}

			{/* Texto - comportamento adaptativo */}
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

			{/* Ícone Direito - não aparece se center=true */}
			{has_ricon && (
				<div class="ml-auto hidden sm:flex flex-shrink-0">
					<FontAwesomeIcon
						icon={icone.right as IconProp}
						class="h-4 w-4"
					/>
				</div>
			)}
		</label>
	);
}
