import '@scss/main/HeaderSec.scss';
import Headers from '@ext/Headers';

export default function HeaderSec() {
	return (
		<>
			<Headers
				classPart="secondary"
				RightBtbs={[
					{
						htmlFor: 'right-sub-toggle',
						className: 'menu-button',
						ariaLabel: 'Menu direito secundário',
						icone: 'fas fa-cog',
					},
				]}
			/>
		</>
	);
}
