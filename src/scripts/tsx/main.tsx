import { render } from 'preact';
import { HeaderSectionTop } from './main/HeaderSectionTop';
import { SectionWrapper } from './main/SectionWrapper';
import { Footer } from './main/Footer';
import '../../assets/css/tailwind.css';
import '../../__generated__/fontawesome';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false;

export default function Master() {
	return (
		<>
			<HeaderSectionTop />

			<SectionWrapper />

			<Footer />
		</>
	);
}

render(<Master />, document.getElementById('Master')!);
