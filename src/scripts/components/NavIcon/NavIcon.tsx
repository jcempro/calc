import { Button, IButton } from '../Button/Button';
import { JSX } from 'preact';
import { guid, isTrue } from '../../ts/common/generic';
import { useRef } from 'preact/hooks';
import { tv } from 'tailwind-variants';
import { twMerge } from 'tailwind-merge';

interface INavIcon extends JSX.HTMLAttributes<HTMLElement> {
	itens: IButton[];
	escopo?: string;
	menuId?: string;
	ulClass?: string;
	wrapperClass?: string;
	opened?: boolean;
	orientation?: 'vertical' | 'horizontal';
}

const navIconVariants = tv({
	base: 'inav-jcem',
	variants: {
		orientation: {
			vertical: 'flex flex-col',
			horizontal: 'flex flex-row',
		},
		opened: {
			true: 'block',
			false: 'hidden',
		},
	},
	defaultVariants: {
		orientation: 'vertical',
	},
});

export default function NavIcon({
	menuId,
	escopo = 'global_menu',
	itens,
	ulClass,
	wrapperClass,
	opened = false,
	orientation = 'vertical',
	className,
	...props
}: INavIcon) {
	const cid = menuId ?? useRef(`menu-${guid(18)}`).current;

	// Correção para Signals
	const resolvedClassName =
		typeof className === 'function' ?
			(className as Function)()
		:	className;
	const resolvedWrapperClass =
		typeof wrapperClass === 'function' ?
			(wrapperClass as Function)()
		:	wrapperClass;
	const resolvedUlClass =
		typeof ulClass === 'function' ? (ulClass as Function)() : ulClass;

	const baseClasses = navIconVariants({
		orientation,
		opened: isTrue(opened),
	});

	return (
		<>
			{menuId && (
				<input
					type="radio"
					name={escopo}
					id={menuId}
					className={`menu-jcem-input-${escopo} acionador`}
					checked={isTrue(opened)}
				/>
			)}

			<nav
				{...props}
				className={twMerge(
					baseClasses,
					`inav-jcem-${escopo}`,
					resolvedWrapperClass,
					resolvedClassName,
				)}
				data-menu={menuId ? menuId : undefined}
				data-inav={!menuId ? cid : undefined}
			>
				<ul
					className={twMerge(
						orientation === 'vertical' ?
							'menu bg-base-100 rounded-box'
						:	'flex space-x-2',
						resolvedUlClass,
					)}
				>
					{itens.map((item, index) => (
						<li key={index}>
							<Button
								{...item}
								className={twMerge(
									'w-full text-left',
									typeof item.className === 'function' ?
										(item.className as Function)()
									:	item.className,
								)}
								onClick={(e) => {
									const radio = document.getElementById(
										cid,
									) as HTMLInputElement;
									if (radio) radio.checked = false;
									item.onClick?.(e);
								}}
							/>
						</li>
					))}
				</ul>
			</nav>
		</>
	);
}
