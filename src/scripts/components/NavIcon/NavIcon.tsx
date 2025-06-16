import { Button, IButton } from '../Button/Button';
import { JSX } from 'preact';
import { guid, isTrue } from '../../ts/common/generic';
import { useRef } from 'preact/hooks';

interface INavIcon extends JSX.HTMLAttributes<HTMLElement> {
	itens: IButton[];
	escopo?: string;
	menuId?: string;
	ulClass?: string;
	wrapperClass?: string;
	opened?: boolean;
}

export default function NavIcon({
	menuId,
	escopo,
	itens,
	ulClass,
	wrapperClass,
	opened,
	...props
}: INavIcon) {
	const cid = menuId ?? useRef(`menu-${guid(18)}`).current;
	escopo = escopo ?? 'global_menu';

	// Mantendo sua atribuição original de classes
	props.className = `inav-jcem-${escopo} ${props.className ?? ''} ${wrapperClass ?? ''}`;

	// Mantendo seus data attributes originais
	props = {
		...props,
		...(menuId ? { 'data-menu': menuId } : { 'data-inav': cid }),
	};

	return (
		<>
			{/* Input radio - mantendo sua implementação original */}
			{menuId && (
				<input
					type="radio"
					name={escopo}
					id={menuId}
					className={`menu-jcem-input-${escopo} acionador`}
					checked={isTrue(opened)}
				/>
			)}

			{/* Nav mantendo estrutura original */}
			<nav {...props}>
				<ul className={ulClass ?? ''}>
					{itens.map((item, index) => (
						<li key={index}>
							<Button
								{...item}
								className={`w-full text-left ${item.className || ''}`}
								onClick={(e) => {
									// Mantendo sua lógica original de fechar menu
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
