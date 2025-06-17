import { Button } from '@ext/Button/Button';
import {
	faHome,
	faChevronRight,
	faCog,
	faUser,
} from '@fortawesome/free-solid-svg-icons';
import '@scss/main.scss';

export function MainContent() {
	return (
		<>
			<section className="main-content">
				<main className="main-content">
					<Button
						caption="teste Meu Botão"
						icone={{ left: faHome, right: faChevronRight }}
						htmlFor="input-id"
					/>

					<Button
						caption="testv Centralizado"
						icone={{ left: faCog }}
						center={true}
					/>

					<Button
						caption="teste Adaptativo"
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
