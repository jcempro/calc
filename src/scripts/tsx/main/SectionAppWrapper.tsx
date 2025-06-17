import '@scss/main/SectionAppWrapper.scss';
import { MainContent } from './MainContent';
import { NavIcon } from '@ext/NavIcon/NavIcon';
import { HeaderTer } from './HeaderTer';

export function SectionAppWrapper() {
	return (
		<>
			<section className="app-wrapper">
				{/* Header Terciário */}
				<HeaderTer />

				<section className="app-main">
					<NavIcon itens={[]} escopo="left-app" />

					{/* Conteúdo principal */}
					<MainContent />

					<NavIcon itens={[]} escopo="right-app" />
				</section>
			</section>
		</>
	);
}
