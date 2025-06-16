import { JSX } from 'preact';
import { IButton, Button } from '@ext/Button/Button';
import { IMenu, Menu } from '@ext/Menu/Menu';
import { TUISizes, TUIShadow } from '../../ts/common/ui.interfaces';

export type TItem = IButton | IMenu;

export interface IHeader extends JSX.HTMLAttributes<HTMLElement> {
	classPart?: string;
	LeftBtbs?: TItem[];
	RightBtbs?: TItem[];
	Middle?: JSX.Element;
	title?: string;
	titleAlign?: 'left' | 'center' | 'right';
	SearchComponent?: JSX.Element;
	variant?: 'normal' | 'sticky' | 'ghost' | 'bordered';
	size?: TUISizes;
	shadow?: TUIShadow;
	compact?: boolean;
}

export default function Headers({
	classPart = '',
	LeftBtbs,
	RightBtbs,
	Middle,
	title,
	titleAlign = 'left',
	SearchComponent,
	variant = 'normal',
	size = 'sm',
	shadow = 'none',
	compact = false,
	...props
}: IHeader) {
	// Classes base atualizadas com alinhamento vertical consistente
	const headerClasses = [
		'navbar',
		'min-h-[1.2rem]', // Altura mínima consistente (ajuste conforme necessário)
		'w-full',
		'items-stretch', // Faz os filhos preencherem a altura total
		variant !== 'normal' && `navbar-${variant}`,
		`text-${size}`,
		shadow !== 'none' && `shadow-${shadow}`,
		compact ? 'py-1' : 'py-2',
		classPart ? `header-${classPart}` : '',
		props.className || '',
	]
		.filter(Boolean)
		.join(' ');

	// Classes compartilhadas para as seções
	const sectionClasses = 'flex items-center h-full';

	return (
		<header {...props} className={headerClasses}>
			{/* Seção Esquerda */}
			<div className={`navbar-start ${sectionClasses}`}>
				{LeftBtbs?.map((item, idx) =>
					item.hasOwnProperty('itens') ?
						<Menu
							key={`left-${idx}`}
							{...(item as IMenu)}
							compact={compact}
							className="h-full flex items-center" // Garante alinhamento
						/>
					:	<Button
							key={`left-${idx}`}
							{...(item as IButton)}
							size={compact ? 'xs' : size}
							className="flex items-center h-full" // Garante alinhamento
						/>,
				)}
			</div>

			{/* Seção Central */}
			<div
				className={`navbar-center ${sectionClasses} justify-${titleAlign}`}
			>
				{title ?
					<h1
						className={`
              font-semibold 
              ${compact ? 'text-sm' : `text-${size}`}
              whitespace-nowrap
              flex items-center // Garante alinhamento do texto
            `}
					>
						{title}
					</h1>
				:	<div className="flex items-center h-full">{Middle}</div>}
			</div>

			{/* Seção Direita */}
			<div className={`navbar-end ${sectionClasses} gap-1 sm:gap-2`}>
				{SearchComponent && (
					<div
						className={`
              form-control 
              flex items-center // Garante alinhamento
              ${compact ? 'max-w-[180px]' : 'max-w-xs'}
              sm:${compact ? 'max-w-[200px]' : 'max-w-md'}
              h-full // Preenche a altura
            `}
					>
						{SearchComponent}
					</div>
				)}

				{RightBtbs?.map((item, idx) =>
					item.hasOwnProperty('itens') ?
						<Menu
							key={`right-${idx}`}
							{...(item as IMenu)}
							compact={compact}
							className="h-full flex items-center" // Garante alinhamento
						/>
					:	<Button
							key={`right-${idx}`}
							{...(item as IButton)}
							size={compact ? 'xs' : size}
							className="flex items-center h-full" // Garante alinhamento
						/>,
				)}
			</div>
		</header>
	);
}
