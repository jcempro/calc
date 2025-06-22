import '@scss/main/SectionWrapper.scss';
import { SectionAppWrapper } from './SectionAppWrapper';
import { NavIcon } from '@ext/NavIcon/NavIcon';
import { PageZone } from '@ext/PageZone/PageZone';

export function SectionWrapper() {
	return (
		<PageZone className="outer-app">
			<NavIcon itens={[]} />

			<SectionAppWrapper />

			<NavIcon itens={[]} />
		</PageZone>
	);
}
