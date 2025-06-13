import '@scss/main/SectionWrapper.scss';
import SectionAppWrapper from './SectionAppWrapper';
import NavIcon from '@ext/NavIcon';

export default function SectionWrapper() {
	return (
		<>
			<section className="outer-app">
				<NavIcon />

				<SectionAppWrapper />

				<NavIcon />
			</section>
		</>
	);
}
