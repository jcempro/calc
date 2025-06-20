import '@scss/main/HeaderTer.scss';
import { HeaderBar } from '@ext/HeaderBar/HeaderBar';

export function HeaderTer() {
	return (
		<>
			<HeaderBar
				classPart="tertiary"
				left={[
					{
						className: 'menu-button',
						ariaLabel: 'Menu direito secundário',
						icon: 'fas fa-user',
						caption: 'coisas',
					},
					{
						className: 'menu-button',
						ariaLabel: 'Menu direito secundário',
						icon: 'fas fa-cog',
					},
				]}
			/>
		</>
	);
}
