import '@scss/main.scss';
import '@scss/main/HeaderMain.scss';
import Headers, { TItem } from '@ext/Headers/Headers';
import {
	faEllipsisV,
	faMapPin,
	faTeletype,
} from '@fortawesome/free-solid-svg-icons';

export default function HeaderMain() {
	const btbs: TItem[] = [
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
			<Headers LeftBtbs={btbs} />
		</>
	);
}
