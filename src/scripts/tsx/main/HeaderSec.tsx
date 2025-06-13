import '@scss/main/HeaderSec.scss';
import Headers from '@ext/Headers';
import { IButton } from '@ext/Button';
import {
	faChevronRight,
	faCog,
	faHome,
} from '@fortawesome/free-solid-svg-icons';
export default function HeaderSec() {
	return (
		<>
			<Headers classPart="secondary" />
		</>
	);
}
