import { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import "./dashboard.css";

type RowData = Record<string, string>;

function Dashboard() {
  const [active, setActive] = useState("procesar");
  const [data, setData] = useState<RowData[]>([]);
  const [fileName, setFileName] = useState("");
  const [filesLoaded, setFilesLoaded] = useState(0);

  const [processing, setProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [processMessage, setProcessMessage] = useState("");
  const [processObjective, setProcessObjective] =
    useState("Analizar información empresarial");

  const [message, setMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const processTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ================= COLUMNAS ================= */

  const columns = useMemo(() => {
    const uniqueColumns = new Set<string>();

    data.forEach((row) => {
      Object.keys(row).forEach((column) => {
        uniqueColumns.add(column);
      });
    });

    return Array.from(uniqueColumns);
  }, [data]);

  /* ================= ESTADÍSTICAS ================= */

  const estadisticas = useMemo(() => {
    const vacios = data.reduce(
      (total, row) =>
        total +
        columns.filter(
          (column) =>
            !row[column] ||
            row[column].trim() === ""
        ).length,
      0
    );

    const numericos = columns.filter((column) => {
      const valores = data
        .map((row) => row[column])
        .filter((value) => value?.trim() !== "");

      if (!valores.length) return false;

      return (
        valores.filter(
          (value) => !isNaN(Number(value))
        ).length /
          valores.length >=
        0.7
      );
    });

    return {
      registros: data.length,
      columnas: columns.length,
      vacios,
      numericas: numericos.length,
    };
  }, [data, columns]);

  /* ================= CARGAR CSV ================= */

  const cargarCSV = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    setMessage("");
    setFileName(
      files.length === 1
        ? files[0].name
        : `${files.length} archivos CSV`
    );

    let archivosProcesados = 0;
    let registrosNuevos: RowData[] = [];

    files.forEach((file) => {
      Papa.parse<RowData>(file, {
        header: true,
        skipEmptyLines: true,

        complete: (results) => {
          const rows = results.data.filter((row) =>
            Object.values(row).some(
              (value) => value?.trim() !== ""
            )
          );

          registrosNuevos = [
            ...registrosNuevos,
            ...rows,
          ];

          archivosProcesados++;

          if (archivosProcesados === files.length) {
            setData((actual) => [
              ...actual,
              ...registrosNuevos,
            ]);

            setFilesLoaded(
              (actual) =>
                actual + files.length
            );

            setMessage(
              `Se agregaron ${registrosNuevos.length} registros al conjunto de datos.`
            );

            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }
        },

        error: () => {
          setMessage(
            `No se pudo procesar el archivo ${file.name}.`
          );
        },
      });
    });
  };

  /* ================= LIMPIAR DATOS ================= */

  const limpiarDatos = () => {
    if (!data.length) {
      setMessage(
        "No existen datos para limpiar."
      );

      return;
    }

    const columnasLimpias = columns.filter(
      (column) =>
        data.every(
          (row) =>
            row[column] !== undefined &&
            row[column] !== null &&
            row[column].trim() !== ""
        )
    );

    const columnasEliminadas =
      columns.length -
      columnasLimpias.length;

    const datosLimpios = data.map((row) => {
      const nuevoRegistro: RowData = {};

      columnasLimpias.forEach((column) => {
        nuevoRegistro[column] =
          row[column] || "";
      });

      return nuevoRegistro;
    });

    setData(datosLimpios);

    setMessage(
      columnasEliminadas > 0
        ? `Se eliminaron ${columnasEliminadas} columnas con campos vacíos.`
        : "No se encontraron columnas con campos vacíos."
    );
  };

  /* ================= PROCESAMIENTO ================= */

  const procesarDatos = () => {
    if (!data.length) {
      setMessage(
        "Primero debes cargar uno o varios archivos CSV."
      );

      return;
    }

    if (processing) return;

    setProcessing(true);
    setProcessProgress(0);
    setProcessMessage("Iniciando procesamiento...");

    let progress = 0;

    processTimer.current = setInterval(() => {
      progress += 5;

      setProcessProgress(progress);

      if (progress < 20) {
        setProcessMessage(
          "Preparando conjunto de datos..."
        );
      } else if (progress < 40) {
        setProcessMessage(
          "Validando registros..."
        );
      } else if (progress < 60) {
        setProcessMessage(
          "Analizando variables..."
        );
      } else if (progress < 80) {
        setProcessMessage(
          "Procesando información..."
        );
      } else if (progress < 100) {
        setProcessMessage(
          "Generando resultados..."
        );
      } else {
        if (processTimer.current) {
          clearInterval(processTimer.current);
          processTimer.current = null;
        }

        setProcessMessage(
          "Proceso completado correctamente."
        );

        setProcessing(false);

        setMessage(
          `Procesamiento completado sobre ${data.length} registros.`
        );
      }
    }, 120);
  };

  /* ================= DETENER ================= */

  const detenerProceso = () => {
    if (processTimer.current) {
      clearInterval(processTimer.current);
      processTimer.current = null;
    }

    setProcessing(false);
    setProcessMessage("Proceso detenido.");
  };

  return (
    <div className="dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="sidebar-logo">

          <div className="sidebar-icon">
            BD
          </div>

          <div>
            <strong>
              <span>Big</span>Data
            </strong>

            <small>
              Data Analytics
            </small>
          </div>

        </div>

        <div className="sidebar-menu">

          <p className="menu-title">
            PROCESAMIENTO
          </p>

          <button
            className={
              active === "procesar"
                ? "menu-button active"
                : "menu-button"
            }
            onClick={() => {
              setActive("procesar");
              setMessage("");
            }}
          >
            <span>📊</span>
            Procesar datos
          </button>

          <button
            className={
              active === "limpiar"
                ? "menu-button active"
                : "menu-button"
            }
            onClick={() => {
              setActive("limpiar");
              setMessage("");
            }}
          >
            <span>🧹</span>
            Limpiar datos
          </button>

          <p className="menu-title">
            SISTEMA
          </p>

          <button className="menu-button">
            <span>📈</span>
            Reportes
          </button>

          <button className="menu-button">
            <span>⚙️</span>
            Configuración
          </button>

        </div>

        <div className="sidebar-user">

          <div className="user-avatar">
            U
          </div>

          <div>
            <strong>
              Usuario
            </strong>

            <small>
              Administrador
            </small>
          </div>

        </div>

      </aside>

      {/* ================= CONTENIDO ================= */}

      <main className="dashboard-content">

        <header className="dashboard-header">

          <div>

            <span className="header-label">
              PLATAFORMA DE DATOS
            </span>

            <h1>
              {active === "procesar"
                ? "Procesar datos"
                : "Limpiar datos"}
            </h1>

            <p>
              Construye y analiza un conjunto
              de datos empresarial.
            </p>

          </div>

          <div className="header-status">

            <span></span>

            Sistema activo

          </div>

        </header>

        {/* ================= ESTADÍSTICAS ================= */}

        <section className="stats">

          <div className="stat-card">

            <span>
              REGISTROS
            </span>

            <strong>
              {estadisticas.registros}
            </strong>

          </div>

          <div className="stat-card">

            <span>
              VARIABLES
            </span>

            <strong>
              {estadisticas.columnas}
            </strong>

          </div>

          <div className="stat-card">

            <span>
              VALORES VACÍOS
            </span>

            <strong>
              {estadisticas.vacios}
            </strong>

          </div>

          <div className="stat-card">

            <span>
              ARCHIVOS
            </span>

            <strong className="file-stat">
              {filesLoaded || "—"}
            </strong>

          </div>

        </section>

        {/* ================= MENSAJE ================= */}

        {message && (
          <div className="dashboard-message">
            {message}
          </div>
        )}

        {/* ================= PROCESAR ================= */}

        {active === "procesar" && (

          <>

            <section className="upload-section">

              <div className="section-header">

                <div>

                  <h2>
                    Construir conjunto de datos
                  </h2>

                  <p>
                    Agrega uno o varios archivos CSV.
                    Cada nuevo archivo se incorporará
                    debajo de los registros existentes.
                  </p>

                </div>

                <button
                  className="upload-button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >
                  + Agregar CSV
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  multiple
                  hidden
                  onChange={cargarCSV}
                />

              </div>

              <div className="dataset-info">

                <div>
                  <strong>
                    Dataset empresarial
                  </strong>

                  <span>
                    {filesLoaded} archivos ·{" "}
                    {data.length} registros
                  </span>
                </div>

                <div className="dataset-status">
                  ● Dataset activo
                </div>

              </div>

            </section>

            {/* ================= OBJETIVO ================= */}

            <section className="objective-section">

              <div>

                <span className="objective-label">
                  OBJETIVO DEL PROCESAMIENTO
                </span>

                <h2>
                  ¿Qué deseas obtener?
                </h2>

                <p>
                  Define el objetivo que utilizarás
                  para analizar el conjunto de datos.
                </p>

              </div>

              <select
                value={processObjective}
                onChange={(e) =>
                  setProcessObjective(
                    e.target.value
                  )
                }
              >

                <option>
                  Analizar información empresarial
                </option>

                <option>
                  Analizar ventas
                </option>

                <option>
                  Analizar clientes
                </option>

                <option>
                  Analizar productos
                </option>

                <option>
                  Analizar rendimiento
                </option>

              </select>

            </section>

            {/* ================= PROCESAMIENTO EN TIEMPO REAL ================= */}

            <section className="realtime-section">

              <div className="realtime-header">

                <div>

                  <span>
                    PROCESAMIENTO EN TIEMPO REAL
                  </span>

                  <h2>
                    Estado del análisis
                  </h2>

                </div>

                <strong>
                  {processProgress}%
                </strong>

              </div>

              <div className="realtime-progress">

                <div
                  style={{
                    width: `${processProgress}%`,
                  }}
                />

              </div>

              <div className="realtime-body">

                <div className="mini-chart">

                  <div
                    className="mini-bar"
                    style={{
                      height:
                        `${Math.max(
                          15,
                          processProgress * 0.8
                        )}%`,
                    }}
                  />

                  <div
                    className="mini-bar"
                    style={{
                      height:
                        `${Math.max(
                          20,
                          processProgress * 0.65
                        )}%`,
                    }}
                  />

                  <div
                    className="mini-bar"
                    style={{
                      height:
                        `${Math.max(
                          25,
                          processProgress * 0.9
                        )}%`,
                    }}
                  />

                  <div
                    className="mini-bar"
                    style={{
                      height:
                        `${Math.max(
                          20,
                          processProgress * 0.72
                        )}%`,
                    }}
                  />

                  <div
                    className="mini-bar"
                    style={{
                      height:
                        `${Math.max(
                          15,
                          processProgress
                        )}%`,
                    }}
                  />

                  <div
                    className="mini-bar"
                    style={{
                      height:
                        `${Math.max(
                          20,
                          processProgress * 0.85
                        )}%`,
                    }}
                  />

                </div>

                <div className="process-status">

                  <span>
                    Estado
                  </span>

                  <strong>
                    {processMessage ||
                      "Esperando procesamiento"}
                  </strong>

                  <small>
                    Objetivo:
                    {" "}
                    {processObjective}
                  </small>

                  {processing && (

                    <button
                      className="stop-button"
                      onClick={detenerProceso}
                    >
                      Detener proceso
                    </button>

                  )}

                </div>

              </div>

            </section>

            {/* ================= TABLA ================= */}

            <section className="data-section">

              <div className="section-header">

                <div>

                  <h2>
                    Dataset consolidado
                  </h2>

                  <p>
                    Todos los CSV cargados se
                    integran en este conjunto.
                  </p>

                </div>

                {data.length > 0 && (

                  <span className="record-count">
                    {data.length} registros
                  </span>

                )}

              </div>

              <div className="table-container">

                {data.length === 0 ? (

                  <div className="empty-state">

                    <div>
                      📂
                    </div>

                    <h3>
                      Dataset vacío
                    </h3>

                    <p>
                      Agrega uno o varios archivos
                      CSV para comenzar.
                    </p>

                  </div>

                ) : (

                  <table>

                    <thead>

                      <tr>

                        {columns.map((column) => (

                          <th key={column}>
                            {column}
                          </th>

                        ))}

                      </tr>

                    </thead>

                    <tbody>

                      {data
                        .slice(0, 100)
                        .map((row, index) => (

                          <tr key={index}>

                            {columns.map((column) => (

                              <td key={column}>
                                {row[column] || "—"}
                              </td>

                            ))}

                          </tr>

                        ))}

                    </tbody>

                  </table>

                )}

              </div>

              {data.length > 100 && (

                <div className="table-footer">
                  Mostrando los primeros 100
                  registros de {data.length}.
                </div>

              )}

              <div className="process-actions">

                <button
                  className="process-button"
                  onClick={procesarDatos}
                  disabled={
                    processing ||
                    !data.length
                  }
                >
                  {processing
                    ? "Procesando..."
                    : "▶ Procesar datos"}
                </button>

              </div>

            </section>

          </>

        )}

        {/* ================= LIMPIEZA ================= */}

        {active === "limpiar" && (

          <section className="processing-section">

            <div className="processing-header">

              <div>

                <span>
                  LIMPIEZA DE DATOS
                </span>

                <h2>
                  Preparación de información
                </h2>

                <p>
                  Elimina columnas que contengan
                  al menos un campo vacío.
                </p>

              </div>

              <button
                className="clean-button"
                onClick={limpiarDatos}
                disabled={!data.length}
              >
                🧹 Limpiar datos
              </button>

            </div>

            <div className="processing-grid">

              <div className="process-card">

                <span>
                  REGISTROS
                </span>

                <strong>
                  {data.length}
                </strong>

                <small>
                  registros disponibles
                </small>

              </div>

              <div className="process-card">

                <span>
                  VARIABLES
                </span>

                <strong>
                  {columns.length}
                </strong>

                <small>
                  columnas disponibles
                </small>

              </div>

              <div className="process-card">

                <span>
                  CAMPOS VACÍOS
                </span>

                <strong>
                  {estadisticas.vacios}
                </strong>

                <small>
                  campos detectados
                </small>

              </div>

            </div>

            <div className="data-section">

              <div className="section-header">

                <div>

                  <h2>
                    Datos actuales
                  </h2>

                  <p>
                    Columnas que serán utilizadas
                    para el análisis.
                  </p>

                </div>

              </div>

              <div className="table-container">

                {data.length === 0 ? (

                  <div className="empty-state">

                    <div>
                      📂
                    </div>

                    <h3>
                      No existen datos
                    </h3>

                    <p>
                      Carga un CSV desde Procesar datos.
                    </p>

                  </div>

                ) : (

                  <table>

                    <thead>

                      <tr>

                        {columns.map((column) => (

                          <th key={column}>
                            {column}
                          </th>

                        ))}

                      </tr>

                    </thead>

                    <tbody>

                      {data
                        .slice(0, 100)
                        .map((row, index) => (

                          <tr key={index}>

                            {columns.map((column) => (

                              <td key={column}>
                                {row[column] || "—"}
                              </td>

                            ))}

                          </tr>

                        ))}

                    </tbody>

                  </table>

                )}

              </div>

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default Dashboard;