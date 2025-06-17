import '@scss/main/HeaderSectionTop.scss';
import { HeaderMain } from './HeaderMain';
import { HeaderUpper } from './HeaderUpper';
import { HeaderSec } from './HeaderSec';

export function HeaderSectionTop() {
	return (
		<>
			<section className="header-top">
				{/* Header Upper */}
				<HeaderUpper />

				{/* Cabeçalho principal */}
				<HeaderMain />

				{/* Cabeçalho Secundário */}
				<HeaderSec />
			</section>
		</>
	);
}
