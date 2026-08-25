function Home() {
  return (
    <main className="home">
      <div className="home-content">
        <div className="home-text">
          <span className="badge">TECNOLOGÍA • BIG DATA</span>

          <h1>
            Convierte tus datos en
            <span> información útil</span>
          </h1>

          <p>
            Plataforma para cargar, procesar y analizar grandes cantidades
            de datos de manera sencilla, rápida y visual.
          </p>

          <button
            className="login-button"
            onClick={() => (window.location.href = "/login")}
          >
            Iniciar sesión
          </button>
        </div>

        <div className="home-image">
          <div className="data-card">
            <div className="data-header">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="chart">
              <div className="bar bar-1"></div>
              <div className="bar bar-2"></div>
              <div className="bar bar-3"></div>
              <div className="bar bar-4"></div>
              <div className="bar bar-5"></div>
            </div>

            <div className="data-lines">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
      </div>

      <section className="features">
        <div className="feature">
          <strong>01</strong>
          <h3>Carga de datos</h3>
          <p>Importa archivos y conjuntos de datos fácilmente.</p>
        </div>

        <div className="feature">
          <strong>02</strong>
          <h3>Análisis</h3>
          <p>Procesa información y encuentra patrones relevantes.</p>
        </div>

        <div className="feature">
          <strong>03</strong>
          <h3>Reportes</h3>
          <p>Obtén resultados mediante gráficos y reportes.</p>
        </div>
      </section>
    </main>
  );
}

export default Home;