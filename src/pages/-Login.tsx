import { useRef, useState, useMemo } from "react";
import Papa from "papaparse";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../Dashboard.css";

type RowData = Record<string, unknown>;

export default function Dashboard() {
  const [active, setActive] = useState<"inicio" | "numpy" | "reportes">("inicio");
  const [data, setData] = useState<RowData[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado para el Bloque 3 de NumPy (Broadcasting)
  const [scalarValue, setScalarValue] = useState<number>(10);
  const [vectorOperation, setVectorOperation] = useState<"multiply" | "add" | "divide">("multiply");

  /* COLUMNAS DERIVADAS */
  const columns = useMemo(() => {
    return [...new Set(data.flatMap(Object.keys))];
  }, [data]);

  const numericColumns = useMemo(() => {
    return columns.filter((column) => {
      const values = data
        .map((row) => row[column])
        .filter(
          (value) =>
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
        );
      return (
        values.length > 0 &&
        values.every((value) => !isNaN(Number(value)))
      );
    });
  }, [data, columns]);

  const getNumericValues = (column: string) =>
    data
      .map((row) => Number(row[column]))
      .filter((value) => !isNaN(value));

  /* ESTADÍSTICAS NUMPY AUTO-CALCULADAS */
  const currentStats = useMemo(() => {
    if (!selectedColumn) return null;
    const values = getNumericValues(selectedColumn);
    if (!values.length) return null;

    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / count;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const variance = values.reduce((t, v) => t + Math.pow(v - mean, 2), 0) / count;
    const std = Math.sqrt(variance);

    return { count, sum, mean, max, min, variance, std };
  }, [selectedColumn, data]);

  /* VECTORES TRANSFORMADOS (BROADCASTING) */
  const transformedVector = useMemo(() => {
    if (!selectedColumn) return [];
    const values = getNumericValues(selectedColumn);
    return values.map((val) => {
      switch (vectorOperation) {
        case "add": return val + scalarValue;
        case "multiply": return val * scalarValue;
        case "divide": return scalarValue !== 0 ? val / scalarValue : 0;
        default: return val;
      }
    }).slice(0, 5); // Mostramos solo los primeros 5 como muestra
  }, [selectedColumn, data, scalarValue, vectorOperation]);

  /* IMPORTACIÓN Y LIMPIEZA */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setFileName(file.name);

    Papa.parse<RowData>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
        setLoading(false);

        const cols = [...new Set(results.data.flatMap(Object.keys))];
        const nums = cols.filter((column) => {
          const values = results.data
            .map((row) => row[column])
            .filter(
              (val) => val !== null && val !== undefined && String(val).trim() !== ""
            );
          return values.length > 0 && values.every((v) => !isNaN(Number(v)));
        });

        if (nums.length) setSelectedColumn(nums[0]);
      },
      error: () => {
        alert("Error al leer el archivo CSV.");
        setLoading(false);
      },
    });
  };

  const clearData = () => {
    if (!data.length) return;
    const cleaned = data.filter((row) =>
      columns.every((col) => row[col] != null && String(row[col]).trim() !== "")
    );
    const removed = data.length - cleaned.length;
    setData(cleaned);
    if (!cleaned.length) setSelectedColumn("");
    alert(
      removed
        ? `Limpieza completada.\n\nFilas eliminadas: ${removed}\nFilas restantes: ${cleaned.length}`
        : "No se encontraron filas con campos vacíos."
    );
  };

  /* DATOS GRÁFICOS */
  const chartData = useMemo(() => {
    if (!selectedColumn) return [];
    return getNumericValues(selectedColumn).map((value, index) => ({
      registro: index + 1,
      valor: value,
    }));
  }, [selectedColumn, data]);

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo">DataStudio</div>
        <div className="sidebar-buttons">
          <button
            className={`sidebar-button ${active === "inicio" ? "active" : ""}`}
            onClick={() => setActive("inicio")}
          >
            📋 Pandas (Datos)
          </button>
          <button
            className={`sidebar-button ${active === "numpy" ? "active" : ""}`}
            onClick={() => setActive("numpy")}
          >
            🧮 Operaciones NumPy
          </button>
          <button
            className={`sidebar-button ${active === "reportes" ? "active" : ""}`}
            onClick={() => {
              if (!data.length) return alert("Importa un CSV primero.");
              setActive("reportes");
            }}
          >
            📊 Reportes
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="header">
          <h1>
            {active === "inicio" ? "Gestión de Datos (Pandas)"
              : active === "numpy" ? "Análisis Vectorial (NumPy)"
              : "Dashboard Estadístico"}
          </h1>
        </div>

        <div className="content-card">
          {/* VISTA 1: PANDAS */}
          {active === "inicio" && (
            <>
              <div className="content-card-header">
                <div className="content-title">
                  <h2>Dataset Principal</h2>
                </div>
                <div className="actions">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden-input"
                    onChange={handleFileChange}
                  />
                  <button className="import-button" onClick={() => fileInputRef.current?.click()}>
                    ↑ Importar CSV
                  </button>
                  {data.length > 0 && (
                    <button className="clear-button" onClick={clearData}>🧹 Limpiar datos</button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="loading">Procesando...</div>
              ) : !data.length ? (
                <div className="empty-state">
                  <h3>No hay datos</h3>
                  <p>Sube un CSV para iniciar el análisis.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        {columns.map((col) => <th key={col}>{col}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          {columns.map((col) => (
                            <td key={col}>{row[col] != null ? String(row[col]) : ""}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* VISTA 2: NUMPY - PROFESIONAL */}
          {active === "numpy" && (
            <div className="numpy-dashboard">
              {!data.length ? (
                <div className="empty-state">
                  <h3>Requiere datos</h3>
                  <p>Importa un archivo CSV en la sección de Pandas.</p>
                </div>
              ) : (
                <div className="numpy-blocks-grid">
                  
                  {/* BLOQUE 1: Selección y Propiedades del Vector */}
                  <div className="numpy-block">
                    <h3>1. Selección de Vector (Array)</h3>
                    <div className="numpy-field">
                      <label>Eje Y (Columna Numérica)</label>
                      <select
                        value={selectedColumn}
                        onChange={(e) => setSelectedColumn(e.target.value)}
                        className="full-width-select"
                      >
                        {numericColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    {currentStats && (
                      <div className="vector-info">
                        <p><strong>Forma (Shape):</strong> ({currentStats.count}, 1)</p>
                        <p><strong>Tipo de dato (Dtype):</strong> float64</p>
                      </div>
                    )}
                  </div>

                  {/* BLOQUE 2: Métricas Descriptivas */}
                  <div className="numpy-block block-span-2">
                    <h3>2. Métricas Descriptivas Automáticas</h3>
                    {currentStats ? (
                      <div className="stats-grid">
                        <div className="stat-box">
                          <span className="stat-label">Media (np.mean)</span>
                          <span className="stat-value">{currentStats.mean.toFixed(2)}</span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-label">Desv. Est (np.std)</span>
                          <span className="stat-value">{currentStats.std.toFixed(2)}</span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-label">Varianza (np.var)</span>
                          <span className="stat-value">{currentStats.variance.toFixed(2)}</span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-label">Mínimo (np.min)</span>
                          <span className="stat-value">{currentStats.min.toFixed(2)}</span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-label">Máximo (np.max)</span>
                          <span className="stat-value">{currentStats.max.toFixed(2)}</span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-label">Suma (np.sum)</span>
                          <span className="stat-value">{currentStats.sum.toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <p>Selecciona una columna válida.</p>
                    )}
                  </div>

                  {/* BLOQUE 3: Broadcasting (Transformación Vectorial) */}
                  <div className="numpy-block block-span-full">
                    <h3>3. Transformación Vectorial (Broadcasting)</h3>
                    <p className="help-text">Aplica operaciones matemáticas elementales a todo el arreglo simultáneamente.</p>
                    
                    <div className="broadcasting-controls">
                      <select 
                        value={vectorOperation} 
                        onChange={(e) => setVectorOperation(e.target.value as any)}
                      >
                        <option value="multiply">Multiplicar (*)</option>
                        <option value="add">Sumar (+)</option>
                        <option value="divide">Dividir (/)</option>
                      </select>
                      <span> por un escalar: </span>
                      <input 
                        type="number" 
                        value={scalarValue} 
                        onChange={(e) => setScalarValue(Number(e.target.value))} 
                        className="scalar-input"
                      />
                    </div>

                    <div className="array-preview">
                      <strong>Muestra del nuevo Array (Top 5):</strong>
                      <div className="array-values">
                        [{transformedVector.map(v => v.toFixed(2)).join(", ")} ...]
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* VISTA 3: REPORTES */}
          {active === "reportes" && (
            <div className="report-section">
              <div className="report-header">
                <h2>Gráficos Generales</h2>
              </div>
              <div className="charts-grid">
                <div className="chart-card">
                  <h3>Distribución de {selectedColumn} (Barras)</h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="registro" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="valor" fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-card">
                  <h3>Tendencia de {selectedColumn} (Línea)</h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="registro" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}