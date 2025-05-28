import '@scss/main/SectionAppMain.scss';
import Footer from './Footer'
import MainContent from './MainContent'

export default function SectionAppMain() {
  return (
    <>
      <section className='app-main'>        
        {/* Conteúdo principal */}
        <MainContent />

        <Footer />
      </section>
    </>
  );
}