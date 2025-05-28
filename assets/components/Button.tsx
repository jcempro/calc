import { JSX } from 'preact';
import './Button.scss';

interface Button extends JSX.HTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
  caption?: string;
  icone: string;
}

export default function Button({ icone, caption, ...props }: Button) {
  props.className = `btb${props.className ? ' ' + props.className : ''}`;
  return (
    <label {...props}>
      {icone && <i className={icone}></i>}
      {caption && <span>{caption}</span>}
    </label>
  );
}
