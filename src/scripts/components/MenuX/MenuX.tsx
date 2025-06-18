import { IButtonX, ButtonX } from '../ButtonX/ButtonX';
import { useRef } from 'preact/hooks';
import { JSX } from 'preact';
import { guid } from '../../ts/common/generic';
import { NavIcon } from '../NavIcon/NavIcon';
import { tv } from 'tailwind-variants';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx'; // Importação adicionada aqui

export interface IMenuX extends Omit<IButtonX, 'htmlFor'> {
	itens: IButtonX[];
	checked?: boolean;
	navClass?: string;
	menuAlign?: 'left' | 'center' | 'right';
	menuVariant?: 'dropdown' | 'vertical' | 'horizontal';
	className?: string | JSX.SignalLike<string | undefined>;
}

const menuVariants = tv({
	base: 'menu-jcem-wrapper relative',
	variants: {
		variant: {
			dropdown: 'dropdown',
			vertical: '',
			horizontal: '',
		},
		align: {
			left: '',
			center: 'dropdown-center',
			right: 'dropdown-end',
		},
	},
	defaultVariants: {
		variant: 'dropdown',
		align: 'left',
	},
});

const menuContentVariants = tv({
	base: 'z-[1] bg-base-100 shadow-lg rounded-box',
	variants: {
		variant: {
			dropdown: 'dropdown-content',
			vertical: 'flex flex-col',
			horizontal: 'flex flex-row',
		},
	},
});

export function MenuX({
	escopo = 'global_menu',
	itens,
	checked,
	navClass = '',
	menuAlign = 'left',
	menuVariant = 'dropdown',
	className,
	...props
}: IMenuX) {
	const id = useRef(`menu-${guid(18)}`).current;

	const resolveClass = (cls: unknown) =>
		typeof cls === 'function' ? cls() : cls;

	return (
		<div
			data-menu={id}
			className={menuVariants({
				variant: menuVariant,
				align: menuAlign,
				className: twMerge(
					`menu-jcem-wrapper-${escopo}`,
					resolveClass(className),
				),
			})}
		>
			<ButtonX
				{...props}
				htmlFor={id}
				escopo={escopo}
				className={twMerge(
					resolveClass(props.class),
					menuVariant === 'dropdown' && 'dropdown-toggle',
				)}
			/>

			<NavIcon
				menuId={id}
				escopo={escopo}
				behavior="menu"
				orientation={
					menuVariant === 'horizontal' ? 'horizontal' : 'vertical'
				}
				ulClass={twMerge(
					menuContentVariants({ variant: menuVariant }),
					resolveClass(navClass),
				)}
				wrapperClass={clsx(
					// Corrigido para usar clsx
					'peer-checked:block hidden absolute',
					menuVariant === 'dropdown' && 'mt-1',
					menuVariant === 'horizontal' && 'ml-1',
				)}
				itens={itens}
				opened={checked}
			/>
		</div>
	);
}
