import '@scss/main/SectionAppWrapper.scss';
import MainContent from './MainContent'
import NavIcon from '@ext/NavIcon'
import HeaderTer from './HeaderTer'

export default function SectionAppWrapper() {
  return (
    <>
      <section className='app-wrapper'>
        {/* Header Terciário */}
        <HeaderTer />

        <section className='app-main'>
          <NavIcon escopo='left-app' />

          {/* Conteúdo principal */}
          <MainContent />

          <NavIcon escopo='right-app' />
        </section>
      </section>
    </>
  );
}