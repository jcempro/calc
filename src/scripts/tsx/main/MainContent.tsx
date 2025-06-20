import { ButtonX } from '@ext/ButtonX/ButtonX';
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
					<ButtonX
						caption="teste Meu Botão"
						icon={{ left: faHome, right: faChevronRight }}
						htmlFor="input-id"
					/>

					<ButtonX
						caption="testv Centralizado"
						icon={{ left: faCog }}
						center={true}
					/>

					<ButtonX
						caption="teste Adaptativo"
						icon={{ left: faUser }}
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
