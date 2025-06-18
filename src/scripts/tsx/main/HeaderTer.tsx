import '@scss/main/HeaderTer.scss';
import { HeaderBar } from '@ext/HeaderBar/HeaderBar';

export function HeaderTer() {
	return (
		<>
			<HeaderBar
				classPart="tertiary"
				leftItems={[
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
