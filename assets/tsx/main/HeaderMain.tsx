import '@scss/main.scss';
import '@scss/main/HeaderMain.scss';
import Headers from '@ext/Headers';

export default function HeaderMain() {
  return (
    <>
      <Headers
        classPart="primary"

        LeftBtbs={[
          {
            htmlFor: "menu-toggle",
            className: "menu-button",
            ariaLabel: "Abrir menu",
            icone: "fas fa-bars"
          }
        ]}

        RightBtbs={[
          {
            htmlFor: "right-main-toggle",
            className: "menu-button",
            ariaLabel: "Menu direito",
            icone: "fas fa-ellipsis-v"
          }
        ]}
      />
    </>
  );
}
