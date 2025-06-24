import { render } from 'preact';
import { HeaderSectionTop } from './main/HeaderSectionTop';
import { SectionWrapper } from './main/SectionWrapper';
import { Footer } from './main/Footer';
import { PageZone } from '../components/PageZone/PageZone';
import '../../assets/css/tailwind.css';
import '../../__generated__/fontawesome';
import { FooterZone } from '@ext/FooterZone/FooterZone';
import { HeaderBar } from '@ext/HeaderBar/HeaderBar';
import { HeaderZone } from '@ext/HeaderZone/HeaderZone';
import { Button, Menu, NavIcon } from '@ext/NavIcon/NavIcon';
import { ContentWrapper } from '@ext/ContentWrapper/ContentWrapper';

export default function Master() {
	return (
		<PageZone
			variant="border"
			shadow="lg"
			compact
			left={{
				itens: [
					{ label: 'Home', icon: 'house', kind: 'button' },
					{
						kind: 'menu',
						label: 'Mais',
						icon: 'bars',
						itens: [
							{ label: 'Perfil', icon: 'user', kind: 'button' },
							{ label: 'Sair', icon: 'power', kind: 'button' },
						],
					},
				],
			}}
			right={{
				itens: [
					{ label: 'Home', icon: 'house', kind: 'button' },
					{
						kind: 'menu',
						label: 'Mais',
						icon: 'bars',
						itens: [
							{ label: 'Perfil', icon: 'user', kind: 'button' },
							{ label: 'Sair', icon: 'power', kind: 'button' },
						],
					},
				],
			}}
		>
			{/* HeaderZone: primeiro filho */}
			<HeaderZone>
				<HeaderBar />
			</HeaderZone>

			{/* ContentWrapper: terceiro filho obrigatório */}
			<ContentWrapper>
				<section>
					<h1>Dashboard</h1>
					<p>Conteúdo principal da aplicação.</p>
				</section>
			</ContentWrapper>

			{/* FooterZone: último filho */}
			<FooterZone>
				<p>Rodapé © 2025</p>
			</FooterZone>
		</PageZone>
	);
}

render(<Master />, document.getElementById('Master')!);
