import { ButtonX, IButtonX } from '../ButtonX/ButtonX';
import { JSX } from 'preact';
import { guid, isTrue } from '../../ts/common/generic';
import { useRef } from 'preact/hooks';
import { tv } from 'tailwind-variants';
import { twMerge } from 'tailwind-merge';
import { IMenuX, MenuX } from '@ext/MenuX/MenuX';

export type TNavItem = IButtonX | IMenuX;

function isMenu(item: TNavItem): item is IMenuX {
	return 'itens' in item; // Note o 'itens' aqui
}

export interface INavIcon extends JSX.HTMLAttributes<HTMLDivElement> {
	itens: IButtonX[];
	escopo?: string;
	menuId?: string;
	ulClass?: string;
	wrapperClass?: string;
	opened?: boolean;
	orientation?: 'vertical' | 'horizontal';
	behavior?: 'toolbar' | 'menu' | 'header';
}

const navIconVariants = tv({
	base: 'inav-jcem transition-all duration-200',
	variants: {
		behavior: {
			toolbar: 'bg-base-100 rounded-lg p-1',
			menu: 'absolute z-50',
			header: 'flex items-center',
		},
		orientation: {
			vertical: 'flex flex-col',
			horizontal: 'flex flex-row',
		},
		opened: {
			true: 'opacity-100 visible',
			false: 'opacity-0 invisible absolute',
		},
	},
	defaultVariants: {
		behavior: 'toolbar',
		orientation: 'vertical',
		opened: true,
	},
});

export function NavIcon({
	menuId,
	escopo = 'global_menu',
	itens,
	ulClass,
	wrapperClass,
	opened = false,
	orientation = 'vertical',
	behavior = 'toolbar',
	className,
	...props
}: INavIcon) {
	const cid = useRef(menuId ?? `inav-${guid(18)}`).current;

	const resolveClass = (cls: unknown) =>
		typeof cls === 'function' ? cls() : cls;

	const renderItem = (item: TNavItem, idx: number) => {
		const commonProps = {
			key: `${cid}-item-${idx}`,
			className: twMerge(
				'w-full text-left',
				resolveClass(item.className),
			),
		};

		if (isMenu(item)) {
			return (
				<MenuX
					{...commonProps}
					{...item}
					menuVariant={
						orientation === 'horizontal' ? 'horizontal' : 'dropdown'
					}
					itens={item.itens} // Passando a prop correta 'itens'
				/>
			);
		}

		return <ButtonX {...commonProps} {...item} />;
	};

	return (
		<>
			{menuId && (
				<input
					type="checkbox"
					name={escopo}
					id={cid}
					className="hidden peer"
					checked={isTrue(opened)}
				/>
			)}

			<div
				{...(menuId ? { 'data-menu': cid } : { 'data-inav': cid })}
				{...props}
				className={twMerge(
					navIconVariants({
						behavior,
						orientation,
						opened: isTrue(opened),
					}),
					`inav-jcem-${escopo}`,
					resolveClass(wrapperClass),
					resolveClass(className),
				)}
				data-navicon={cid}
			>
				<ul
					className={twMerge(
						behavior === 'menu' ?
							'menu bg-base-100 p-2 rounded-box'
						:	'flex',
						orientation === 'horizontal' ?
							'gap-2 items-center'
						:	'gap-1',
						resolveClass(ulClass),
					)}
				>
					{itens.map(renderItem)}
				</ul>
			</div>
		</>
	);
}
