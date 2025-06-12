import { render } from 'preact';
import HeaderSectionTop from './main/HeaderSectionTop';
import SectionWrapper from './main/SectionWrapper';
import Footer from './main/Footer';
import '../../assets/css/tailwind.css'; // 👈 Importação do CSS

export default function Master() {
	return (
		<>
			{/* Inputs invisíveis para controle por CSS */}
			<input type="checkbox" id="menu-toggle" hidden />
			<input type="checkbox" id="right-main-toggle" hidden />
			<input type="checkbox" id="right-sub-toggle" hidden />

			{/* Menu lateral principal (esquerda) */}
			<nav className="side-nav left">
				<ul>
					<li>
						<a href="#">Início</a>
					</li>
					<li>
						<a href="#">Projetos</a>
					</li>
					<li>
						<a href="#">Configurações</a>
					</li>
					<li>
						<a href="#">Sair</a>
					</li>
				</ul>
			</nav>

			{/* Menu lateral principal (direita) */}
			<nav className="side-nav right main">
				<ul>
					<li>
						<a href="#">Perfil</a>
					</li>
					<li>
						<a href="#">Notificações</a>
					</li>
				</ul>
			</nav>

			{/* Menu lateral secundário (direita inferior) */}
			<nav className="side-nav right sub">
				<ul>
					<li>
						<a href="#">Exportar</a>
					</li>
					<li>
						<a href="#">Imprimir</a>
					</li>
				</ul>
			</nav>

			<HeaderSectionTop />

			<SectionWrapper />

			<Footer />
		</>
	);
}

render(<Master />, document.getElementById('Master')!);
