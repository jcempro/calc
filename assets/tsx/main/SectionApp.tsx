import '@scss/main/SectionApp.scss';
import SectionAppMain from './SectionAppMain'
import NavIcon from '@ext/NavIcon'

export default function SectionPage() {
  return (
    <>
      <section className='app'>
        <NavIcon classPart='left-app'
          btbs={[
            {
              htmlFor: "menu-toggle",
              className: "menu-button",
              ariaLabel: "Abrir menu",
              icone: "fas fa-bars"
            }
          ]}
        />
        <NavIcon classPart='right-app' />
        <SectionAppMain />
      </section>
    </>
  );
}