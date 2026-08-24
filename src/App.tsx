import './App.css'

function App() {
  return (
    <main className="project-start">
      <section className="welcome-card" aria-labelledby="page-title">
        <div className="brand-mark" aria-hidden="true">CS</div>
        <p className="eyebrow">Project foundation</p>
        <h1 id="page-title">Client Scorecard Assessment</h1>
        <p className="welcome-message">
          The React and TypeScript foundation is ready. Next, we will define the
          assessment categories and questions in one easy-to-edit location.
        </p>

        <div className="project-details" aria-label="Project setup details">
          <article><span>Interface</span><strong>React</strong></article>
          <article><span>Code safety</span><strong>TypeScript</strong></article>
          <article><span>Development</span><strong>Vite</strong></article>
        </div>

        <div className="next-step">
          <span className="step-number">02</span>
          <div>
            <strong>Next: Assessment data structure</strong>
            <p>Define configurable categories and five questions per category.</p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
