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
}

export default function Headers({
	classPart,
	LeftBtbs,
	RightBtbs,
	Middle,
	...props
}: IHeader) {
	props.className = `header-${classPart}${props.className ? ' ' + props.className : ''}`;

	return (
		<header {...props}>
			<div className="header-left">
				{LeftBtbs &&
					LeftBtbs.length > 0 &&
					LeftBtbs.map((pp, idx) => {
						return pp.hasOwnProperty('itens') ?
								<Menu key={`left-${idx}`} {...(pp as IMenu)} />
							:	<Button key={`left-${idx}`} {...(pp as IButton)} />;
					})}

				<div className="middle">{Middle}</div>
			</div>

			<div className="header-right">
				{RightBtbs &&
					RightBtbs?.length > 0 &&
					RightBtbs.map((pp, idx) => {
						pp.hasOwnProperty('itens') ?
							<Menu key={`left-${idx}`} {...(pp as IMenu)} />
						:	<Button key={`right-${idx}`} {...(pp as IButton)} />;
					})}
			</div>
		</header>
	);
}
