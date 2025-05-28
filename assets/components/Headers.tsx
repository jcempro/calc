import '@ext/Headers.scss';
import { JSX } from 'preact';
import { IButton, Button } from '@ext/Button';

interface THeader extends JSX.HTMLAttributes<HTMLElement> {
  classPart: string,
  LeftBtbs?: IButton[];
  RightBtbs?: IButton[];
  Middle?: JSX.Element;
}

export default function Headers({
  classPart,
  LeftBtbs,
  RightBtbs,
  Middle,
  ...props
}: THeader) {
  props.className = `header-${classPart}${props.className ? ' ' + props.className : ''}`;

  return (
    <header {...props}>
      <div className="header-left">
        {LeftBtbs && LeftBtbs.length > 0 &&
          LeftBtbs.map((pp, idx) => <Button key={`left-${idx}`} {...pp} />)}

        <div className="middle">
          {Middle}
        </div>
      </div>

      <div className="header-right">
        {RightBtbs && RightBtbs?.length > 0 &&
          RightBtbs.map((pp, idx) => <Button key={`right-${idx}`} {...pp} />)}
      </div>
    </header>
  );
}
