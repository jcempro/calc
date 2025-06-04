import '@ext/NavIcon';
import { JSX } from 'preact';
import { IButton, Button } from '@ext/Button';

interface INavIcon extends JSX.HTMLAttributes<HTMLElement> {
  classPart: string,
  btbs?: IButton[];
}

export default function NavIcon({ classPart, btbs, ...props }: INavIcon) {
  props.className = `inav-${classPart}${props.className ? ' ' + props.className : ''}`;
  return (
    <>
      <nav {...props}>
        <ul>
          {btbs && btbs.length > 0 &&
            btbs.map((pp, idx) => <li key={`left-${idx}`}><Button {...pp} /></li>)}
        </ul>
      </nav>
    </>
  );
}