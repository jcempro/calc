import '@scss/main/HeaderSec.scss';
import { HeaderBar } from '@ext/HeaderBar/HeaderBar';
import { TButtonX } from '@ext/ButtonX/ButtonX';
import {
	faChevronRight,
	faCog,
	faHome,
} from '@fortawesome/free-solid-svg-icons';
export function HeaderSec() {
	return (
		<>
			<HeaderBar classPart="secondary" />
		</>
	);
}
