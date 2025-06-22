import '@scss/main.scss';
import '@scss/main/HeaderMain.scss';
import { HeaderBar } from '@ext/HeaderBar/HeaderBar';
import {
	faEllipsisV,
	faMapPin,
} from '@fortawesome/free-solid-svg-icons';
import { TNavItem } from '@ext/NavIcon/NavIcon';

export function HeaderMain() {
	return (
		<HeaderBar
			title="Dashboard"
			titleAlign="center"
			variant="sticky"
			size="md"
			shadow="lg"
			escopo="app"
			left={[
				{
					className: 'text-base-content',
					icon: 'fas home',
					caption: 'Home',
					onClick: () => console.log('Home'),
				},
				{
					icon: 'settings',
					caption: 'Configurações',
					onClick: () => console.log('Configurações'),
				},
			]}
			right={[
				{
					icon: 'user',
					caption: 'Perfil',
					itens: [
						{
							icon: 'user',
							caption: 'Minha Conta',
							onClick: () => console.log('Minha Conta'),
						},
						{
							icon: 'log-out',
							caption: 'Sair',
							onClick: () => console.log('Sair'),
						},
					],
				},
			]}
		/>
	);
}
