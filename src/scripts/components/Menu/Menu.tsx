import './Menu.scss';
import { IButton, Button } from '../Button/Button';
import { useRef } from 'preact/hooks';
import { JSX } from 'preact';
import { guid } from '../../ts/common/generic';
import NavIcon from '../NavIcon/NavIcon';

export interface IMenu extends Omit<IButton, 'htmlFor'> {
	itens: IButton[];
	checked?: boolean;
	navclass?: string;
	menuAlign?: 'left' | 'center' | 'right';
	menuVariant?: 'dropdown' | 'vertical' | 'horizontal';
}

export function Menu({
	escopo,
	itens,
	checked,
	navclass = '',
	menuAlign = 'left',
	menuVariant = 'dropdown',
	...props
}: IMenu) {
	const id = useRef(`menu-${guid(18)}`);
	escopo = escopo ?? 'global_menu';

	// Classes DaisyUI mantendo sua lógica original
	const getMenuClasses = () => {
		let base = 'menu ';

		if (menuVariant === 'dropdown') {
			base +=
				'dropdown-content z-[1] bg-base-100 shadow-lg rounded-box ';
			base +=
				menuAlign === 'right' ? 'dropdown-end '
				: menuAlign === 'center' ? 'dropdown-center '
				: '';
		} else if (menuVariant === 'vertical') {
			base += 'vertical bg-base-100 shadow-lg rounded-box ';
		} else {
			base += 'horizontal bg-base-100 shadow-lg rounded-box ';
		}

		return base + navclass;
	};

	return (
		<div
			data-menu={id.current}
			className={`menu-jcem-wrapper-${escopo} relative ${props.className ?? ''}`}
		>
			{/* Botão que ativa o dropdown - mantendo sua implementação */}
			<Button
				{...props}
				htmlFor={id.current}
				escopo={escopo}
				className={`${props.className || ''}`}
			/>

			{/* NavIcon com todas as props originais */}
			<NavIcon
				menuId={id.current}
				escopo={escopo}
				ulClass={getMenuClasses()}
				wrapperClass="peer-checked:block hidden absolute"
				itens={itens}
			/>
		</div>
	);
}
