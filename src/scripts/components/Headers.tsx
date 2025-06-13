import '@ext/Headers.scss';
import { JSX } from 'preact';
import { IButton, Button } from '@ext/Button';
import { IMenu, Menu } from '@ext/Menu';

export type TItem = IButton | IMenu;

export interface IHeader extends JSX.HTMLAttributes<HTMLElement> {
	classPart: string;
	LeftBtbs?: TItem[];
	RightBtbs?: TItem[];
	Middle?: JSX.Element;
	title?: string;
	titleAlign?: 'left' | 'center';
	SearchComponent?: JSX.Element;
}

export default function Headers({
	classPart,
	LeftBtbs,
	RightBtbs,
	Middle,
	title,
	titleAlign = 'left',
	SearchComponent,
	...props
}: IHeader) {
	props.className = `header-${classPart}${props.className ? ' ' + props.className : ''}`;

	return (
		<header {...props} class={`header-container ${props.className}`}>
			{/* Seção Esquerda - Ícones/Botões */}
			<div class="header-section header-left">
				{LeftBtbs?.map((item, idx) =>
					item.hasOwnProperty('itens') ?
						<Menu key={`left-${idx}`} {...(item as IMenu)} />
					:	<Button key={`left-${idx}`} {...(item as IButton)} />,
				)}
			</div>

			{/* Seção Central - Título ou conteúdo personalizado */}
			<div class={`header-middle header-title-${titleAlign}`}>
				{title ?
					<h1 class="header-title">{title}</h1>
				:	Middle}
			</div>

			{/* Seção Direita - Campo de busca + Ícones/Botões */}
			<div class="header-section header-right">
				{SearchComponent && (
					<div class="header-search">{SearchComponent}</div>
				)}

				{RightBtbs?.map((item, idx) =>
					item.hasOwnProperty('itens') ?
						<Menu key={`right-${idx}`} {...(item as IMenu)} />
					:	<Button key={`right-${idx}`} {...(item as IButton)} />,
				)}
			</div>
		</header>
	);
}
