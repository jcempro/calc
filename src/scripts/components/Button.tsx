import { JSX } from 'preact';
import './Button.scss';

export interface IButton extends JSX.HTMLAttributes<HTMLLabelElement> {
	htmlFor?: string;
	caption?: string;
	ariaLabel?: string;
	icone: string;
	escopo?: string;
}

export function Button({ icone, caption, escopo, ...props }: IButton) {
	props.className = `btb-${escopo ?? `btb`} ${
		props.className ? ' ' + props.className : ''
	}`;
	return (
		<label {...props}>
			{icone && <i className={icone}></i>}
			{caption && <span>{caption}</span>}
		</label>
	);
}
