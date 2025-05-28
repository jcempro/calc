import '@scss/main.scss';
import HeaderTer from './HeaderTer'

export default function MainContent() {
  return (
    <>
      <section className="main-content">
        {/* Header Terciário */}
        <HeaderTer />

        <main className="main-content">
          <p>Conteúdo principal da página.</p>
          {[...Array(60)].map((_, i) => (
            <p key={i}>Linha de conteúdo {i + 1}</p>
          ))}
        </main>

        {/* Conteúdo principal */}        
      </section>
    </>
  );
}