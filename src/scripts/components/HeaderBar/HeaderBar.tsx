import { JSX } from 'preact';
import { IButtonX } from '@ext/ButtonX/ButtonX';
import { IMenuX } from '@ext/MenuX/MenuX';
import { NavIcon } from '@ext/NavIcon/NavIcon';
import { TUISizes, TUIShadow } from '../../ts/common/ui.interfaces';
import clsx from 'clsx';
import { ClassNameValue, twMerge } from 'tailwind-merge';

type TNavItem = IButtonX | IMenuX;

export interface IHeader
	extends Omit<JSX.HTMLAttributes<HTMLElement>, 'size'> {
	classPart?: string;
	leftItems?: TNavItem[];
	rightItems?: TNavItem[];
	middleContent?: JSX.Element;
	title?: string;
	titleAlign?: 'left' | 'center' | 'right';
	searchComponent?: JSX.Element;
	variant?: 'normal' | 'sticky' | 'ghost' | 'bordered';
	size?: TUISizes;
	shadow?: TUIShadow;
	compact?: boolean;
	escopo?: string;
}

const sizeMap = {
	xs: 'text-xs',
	sm: 'text-sm',
	md: 'text-md',
	lg: 'text-lg',
	xl: 'text-xl',
} as const;

const shadowMap = {
	none: '',
	sm: 'shadow-sm',
	md: 'shadow-md',
	lg: 'shadow-lg',
	xl: 'shadow-xl',
	'2xl': 'shadow-2xl',
} as const;

export function HeaderBar({
	classPart = '',
	leftItems = [],
	rightItems = [],
	middleContent,
	title,
	titleAlign = 'left',
	searchComponent,
	variant = 'normal',
	size = 'sm',
	shadow = 'none',
	compact = false,
	escopo,
	className,
	...props
}: IHeader) {
	// Classes base do Header
	const headerClasses =
		`header-jcem-${escopo} ` +
		twMerge(
			clsx(
				'navbar min-h-12 w-full',
				variant !== 'normal' && `navbar-${variant}`,
				sizeMap[size],
				shadow !== 'none' && shadowMap[shadow],
				compact ? 'py-1 px-2' : 'py-2 px-4',
				classPart && `header-${classPart}`,
			),
			className as ClassNameValue,
		);

	// Configuração otimizada do NavIcon para Header
	const getNavIconConfig = (items: TNavItem[]) => ({
		itens: items.filter((i): i is IButtonX => !('items' in i)),
		orientation: 'horizontal' as const,
		ulClass: clsx(
			'items-center',
			compact ? 'gap-1' : 'gap-2',
			'sm:gap-3',
		),
		className: 'h-full',
	});

	return (
		<header {...props} className={headerClasses}>
			{/* Seção Esquerda */}
			{leftItems.length > 0 && (
				<div className="navbar-start h-full">
					<NavIcon
						{...getNavIconConfig(leftItems)}
						escopo="header-left"
						className={twMerge(
							'mr-auto',
							leftItems.some((i) => 'items' in i) && 'relative', // Para menus dropdown
						)}
					/>
				</div>
			)}

			{/* Seção Central */}
			<div
				className={clsx('navbar-center h-full', {
					'text-left': titleAlign === 'left',
					'text-center': titleAlign === 'center',
					'text-right': titleAlign === 'right',
				})}
			>
				{title ?
					<h1
						className={clsx(
							'font-semibold whitespace-nowrap',
							compact ? 'text-sm' : 'text-lg',
							'max-w-[180px] sm:max-w-md md:max-w-lg truncate',
						)}
					>
						{title}
					</h1>
				:	middleContent && (
						<div className="h-full flex items-center">
							{middleContent}
						</div>
					)
				}
			</div>

			{/* Seção Direita */}
			<div className="navbar-end h-full">
				{searchComponent && (
					<div
						className={clsx(
							'h-full flex items-center mr-2',
							compact ? 'max-w-[120px]' : 'max-w-[160px]',
							'sm:max-w-[200px]',
						)}
					>
						{searchComponent}
					</div>
				)}

				{rightItems.length > 0 && (
					<NavIcon
						{...getNavIconConfig(rightItems)}
						escopo="header-right"
						className={twMerge(
							'ml-auto',
							rightItems.some((i) => 'items' in i) && 'relative', // Para menus dropdown
						)}
					/>
				)}
			</div>
		</header>
	);
}
