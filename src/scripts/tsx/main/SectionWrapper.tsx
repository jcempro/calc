import '@scss/main/SectionWrapper.scss';
import SectionAppWrapper from './SectionAppWrapper'
import NavIcon from '@ext/NavIcon'

export default function SectionWrapper() {
  return (
    <>
      <section className='outer-app'>
        <NavIcon classPart='left-wrapper'
          btbs={[
            {
              htmlFor: "menu-toggle",
              className: "menu-button",
              ariaLabel: "Abrir menu",
              icone: "fas fa-bars"
            }
          ]}
        />

        <SectionAppWrapper />

        <NavIcon classPart='right-wrapper' />
      </section>
    </>
  );
}