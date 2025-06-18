import '@scss/main.scss';
import '@scss/main/HeaderMain.scss';
import { HeaderBar } from '@ext/HeaderBar/HeaderBar';
import {
	faEllipsisV,
	faMapPin,
} from '@fortawesome/free-solid-svg-icons';
import { TNavItem } from '@ext/NavIcon/NavIcon';

export function HeaderMain() {
	const bleft: TNavItem[] = [
		{ icone: { left: faEllipsisV }, caption: `teste` },
		{
			icone: { left: faMapPin },
			caption: `menu`,
			itens: [
				{
					icone: { left: faEllipsisV },
					caption: `teste3`,
				},
				{
					icone: { left: faEllipsisV },
					caption: `test4`,
				},
				{
					icone: { left: faEllipsisV },
					caption: `test5`,
				},
			],
		},
	];

	return (
		<>
			<HeaderBar leftItems={bleft} />
		</>
	);
}
