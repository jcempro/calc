import { render } from 'preact';
import HeaderSectionTop from './main/HeaderSectionTop';
import SectionWrapper from './main/SectionWrapper';
import Footer from './main/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../../assets/css/tailwind.css';
import '../../__generated__/fontawesome';

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
