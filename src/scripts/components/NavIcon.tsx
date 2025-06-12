import '@ext/NavIcon';
import { JSX } from 'preact';
import { IButton, Button } from '@ext/Button';

interface INavIcon extends JSX.HTMLAttributes<HTMLElement> {
	menuId: number;
	escopo: string;
	btbs?: IButton[];
}

export default function NavIcon({ menuId, escopo, btbs, ...props }: INavIcon) {
	props.className = `inav-${escopo}${
		props.className ? ' ' + props.className : ''
	}`;
	return (
		<>
			<nav {...props} data-menu={menuId}>
				<ul>
					{btbs &&
						btbs.length > 0 &&
						btbs.map((pp, idx) => (
							<li key={`left-${idx}`}>
								<Button {...pp} escopo={escopo} />
							</li>
						))}
				</ul>
			</nav>
		</>
	);
}
