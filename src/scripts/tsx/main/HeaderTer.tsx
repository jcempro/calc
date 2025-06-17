import '@scss/main/HeaderTer.scss';
import { Header } from '@ext/Headers/Headers';

export function HeaderTer() {
	return (
		<>
			<Header
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
