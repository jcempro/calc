import '@scss/main/HeaderSec.scss';

export default function HeaderSec() {
  return (
    <>
      <header className="header-secondary">
        <label
          htmlFor="right-sub-toggle"
          className="menu-button"
          aria-label="Menu direito secundário"
        >
          <i className="fas fa-cog"></i>
        </label>
      </header>
    </>
  );
}