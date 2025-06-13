import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faHome,
	faUser,
	faCog,
	faChevronRight,
	faBars,
} from '@fortawesome/free-solid-svg-icons';
import { IButton } from './Button';
import { JSX } from 'preact/jsx-runtime';

interface INavIcon extends JSX.HTMLAttributes<HTMLElement> {
	menuId?: string;
	escopo: string;
	btbs?: IButton[];
}

export default function NavIcon({
	menuId,
	escopo,
	btbs,
	...props
}: INavIcon) {
	return (
		<div class="flex h-screen">
			{/* Checkbox invisível para controlar o estado */}
			<input type="checkbox" id="NavIcon-toggle" class="hidden" />

			{/* Botão externo (fora da NavIcon) - Toggle */}
			<label
				for="NavIcon-toggle"
				class="fixed left-4 top-4 z-50 btn btn-circle btn-ghost md:hidden"
			>
				<FontAwesomeIcon icon={faBars} class="h-5 w-5" />
			</label>

			{/* NavIcon */}
			<div class="w-20 md:w-64 bg-base-200 transition-all duration-300 h-full fixed">
				<div class="flex flex-col h-full p-4 bg-base-100 shadow-lg">
					{/* Toggle interno (opcional) */}
					<label
						for="NavIcon-toggle"
						class="btn btn-ghost btn-sm self-end mb-4 md:hidden"
					>
						<FontAwesomeIcon icon={faBars} />
					</label>

					{/* Itens do menu */}
					<ul class="menu flex-1">
						{btbs?.map((item) => <li key={item.id}></li>)}
					</ul>
				</div>
			</div>

			{/* Conteúdo principal */}
			<main class="flex-1 overflow-auto ml-20 md:ml-64 p-4">
				{/* Seu conteúdo aqui */}
			</main>
		</div>
	);
}
