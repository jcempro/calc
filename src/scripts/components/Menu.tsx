import './Menu.scss';
import { IButton, Button } from './Button';
import NavIcon from './NavIcon';
import { useRef, useEffect } from 'preact/hooks';

export interface IMenu extends IButton {
	classPart: string;
	itens: IButton[];
	checked?: boolean;
}

export function Menu({
	escopo: string,
	itens,
	escopo,
	checked,
	...props
}: IMenu) {
	const id = useRef(`menu-${Math.random().toString(36).slice(2, 18)}`);

	// Contador para sincronização automática
	const menuIndex = useRef(
		document.querySelectorAll(
			`input.menu_component[name="${escopo || 'global_menu'}"]`,
		).length + 1,
	);

	escopo = escopo ?? 'global_menu';
	/*
	useEffect(() => {
		if (document.getElementById(id.current)) return;

		// Contar quantos menus existem com o mesmo escopo
		const inputs = document.querySelectorAll(
			`input.menu_component[name="${escopo || 'global_menu'}"]`,
		);

		const el = document.createElement('input');
		el.type = 'radio';
		el.id = id.current;
		el.name = escopo;
		el.className = 'menu_component acionador';
		el.dataset.menu = `${menuIndex.current}`; // ao indice

		if (checked) el.checked = true;

		// Inserir no início do body para garantir ordem
		document.body.insertAdjacentElement('afterbegin', el);

		return () => {
			if (document.body.contains(el)) {
				document.body.removeChild(el);
			}
		};
	}, [escopo, checked]);
*/
	props.className = props.className?.toString().match(/menu_component/i)
		? props.className
		: `${props.className} menu_component`;

	return (
		<div className={`menu-wrapper-${escopo} ${props.className || ''}`}>
			<input
				type="radio"
				name={escopo}
				id={id.current}
				className="menu_component acionador"
			/>
			<Button htmlFor={id.current} escopo={escopo} {...props} />
			<NavIcon
				menuId={menuIndex.current}
				escopo={escopo ?? 'global_menu'}
				btbs={itens}
			/>
		</div>
	);
}
