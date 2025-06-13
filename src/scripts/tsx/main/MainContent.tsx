import { Button } from '@ext/Button';
import {
	faHome,
	faChevronRight,
	faCog,
	faUser,
} from '@fortawesome/free-solid-svg-icons';
import '@scss/main.scss';

export default function MainContent() {
	return (
		<>
			<section className="main-content">
				<main className="main-content">
					<Button
						caption="Meu Botão"
						icone={{ left: faHome, right: faChevronRight }}
						htmlFor="input-id"
					/>

					<Button
						caption="Centralizado"
						icone={{ left: faCog }}
						center={true}
					/>

					<Button
						caption="Adaptativo"
						icone={{ left: faUser }}
						className="w-auto max-w-[200px]"
					/>
					<p>Conteúdo principal da página.</p>
					{[...Array(60)].map((_, i) => (
						<p key={i}>Linha de conteúdo {i + 1}</p>
					))}
				</main>

				{/* Conteúdo principal */}
			</section>
		</>
	);
}
