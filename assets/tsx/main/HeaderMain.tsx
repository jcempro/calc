import '@scss/main.scss';
import HeaderBTB from '@ext/Button'

export default function HeaderMain() {
  return (
    <>
      <header className="header-primary">
        <div className="left-part">
          <HeaderBTB
            htmlFor="menu-toggle"
            className="menu-button"
            aria-label="Abrir menu"
            icone="fas fa-bars"
          />                    
          <div className="title">Minha Página</div>
        </div>

        <div className="right-icons">
          <HeaderBTB
            htmlFor="right-main-toggle"
            className="menu-button"
            aria-label="Menu direito"
            icone="fad fa-ellipsis-v"
          />
        </div>
      </header>
    </>
  );
}