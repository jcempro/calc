import './Menu.scss';
import { IButton, Button } from "./Button";
import NavIcon from "./NavIcon";
import { useRef } from 'preact/hooks';

export interface IMenu extends IButton {
  classPart: string;
  itens: IButton[];
}

export function Menu({
  classPart,
  itens,
  ...props
}: IMenu) {
  const id = useRef(`id_${Math.random().toString(36).slice(2, 10)}`);
  props.className = `menu-${props.className ? ' ' + props.className : ''}`;

  return (
    <div className={props.className}>
      <input type='checkbox' id={id.current} />

      <Button
        htmlFor={id.current}
        {...props}
      />

      <NavIcon classPart={classPart} btbs={itens} />
    </div>
  );
}
