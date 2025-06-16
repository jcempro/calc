import { render } from 'preact';
import HeaderSectionTop from './main/HeaderSectionTop';
import SectionWrapper from './main/SectionWrapper';
import Footer from './main/Footer';
import '../../assets/css/tailwind.css';

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
