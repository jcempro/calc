import '@scss/main/HeaderTer.scss';
import Headers from '@ext/Headers/Headers';

export default function HeaderTer() {
	return (
		<>
			<Headers
				classPart="tertiary"
				RightBtbs={[
					{
						className: 'menu-button',
						ariaLabel: 'Menu direito secundário',
						icone: 'fas fa-user',
					},
					{
						className: 'menu-button',
						ariaLabel: 'Menu direito secundário',
						icone: 'fas fa-cog',
					},
				]}
			/>
		</>
	);
}
