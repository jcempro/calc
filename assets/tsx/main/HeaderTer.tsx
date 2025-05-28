import '@scss/main/HeaderTer.scss';

export default function HeaderTer() {
  return (
    <>
      <header className="header-tertiary">
        <div className="header-icons">
          <label className="icon-button">
            <i className="fas fa-user"></i>
          </label>
          <label className="icon-button">
            <i className="fas fa-cog"></i>
          </label>
        </div>
      </header>
    </>
  );
}