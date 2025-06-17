import '@scss/main/HeaderSec.scss';
import { Header } from '@ext/Headers/Headers';
import { IButton } from '@ext/Button/Button';
import {
	faChevronRight,
	faCog,
	faHome,
} from '@fortawesome/free-solid-svg-icons';
export function HeaderSec() {
	return (
		<>
			<Header classPart="secondary" />
		</>
	);
}
