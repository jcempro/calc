import '@scss/main/SectionWrapper.scss';
import { SectionAppWrapper } from './SectionAppWrapper';
import { NavIcon } from '@ext/NavIcon/NavIcon';

export function SectionWrapper() {
	return (
		<>
			<section className="outer-app">
				<NavIcon itens={[]} />

				<SectionAppWrapper />

				<NavIcon itens={[]} />
			</section>
		</>
	);
}
