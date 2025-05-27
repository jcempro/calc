import { render } from 'preact';
import '@scss/main.scss';

export function Master() {
	return (
		<>
			{/* Inputs invisíveis para controle por CSS */}
			<input type="checkbox" id="menu-toggle" hidden />
			<input type="checkbox" id="right-main-toggle" hidden />
			<input type="checkbox" id="right-sub-toggle" hidden />

			{/* Menu lateral principal (esquerda) */}
			<nav class="side-nav left">
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
			<nav class="side-nav right main">
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
			<nav class="side-nav right sub">
				<ul>
					<li>
						<a href="#">Exportar</a>
					</li>
					<li>
						<a href="#">Imprimir</a>
					</li>
				</ul>
			</nav>

			{/* Header Upper */}
			<header class="header-upper">
				<nav>
					<a href="#">Link 1</a>
					<a href="#">Link 2</a>
					<a href="#">Link 3</a>
				</nav>
			</header>

			{/* Cabeçalho principal */}
			<header class="header-primary">
				<div class="header-left">
					<label
						htmlFor="menu-toggle"
						class="menu-button"
						aria-label="Abrir menu"
					>
						<i class="fas fa-bars"></i>
					</label>
					<div class="title">Minha Página</div>
				</div>

				<div class="header-icons">
					<label
						htmlFor="right-main-toggle"
						class="menu-button"
						aria-label="Menu direito principal"
					>
						<i class="fas fa-ellipsis-v"></i>
					</label>
				</div>
			</header>

			{/* Cabeçalho secundário */}
			<header class="header-secondary">
				<label
					htmlFor="right-sub-toggle"
					class="menu-button"
					aria-label="Menu direito secundário"
				>
					<i class="fas fa-cog"></i>
				</label>
			</header>

			{/* Header Terciário */}
			<header class="header-tertiary">
				<div class="header-icons">
					<label class="icon-button">
						<i class="fas fa-user"></i>
					</label>
					<label class="icon-button">
						<i class="fas fa-cog"></i>
					</label>
				</div>
			</header>

			{/* Conteúdo principal */}
			<main class="main-content">
				<p>Conteúdo principal da página.</p>
				{[...Array(60)].map((_, i) => (
					<p key={i}>Linha de conteúdo {i + 1}</p>
				))}
			</main>

			<footer>
				<p>Rodapé simples, não fixo.</p>
			</footer>
		</>
	);
}

render(<Master />, document.getElementById('Master')!);
