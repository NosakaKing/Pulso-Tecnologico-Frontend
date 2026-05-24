import { useState } from "react";
import { predecirTag } from "../services/api";
import PageLayout from "../components/PageLayout";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";

// ── Tags disponibles para predicción ─────────────────────────
const TAGS_PREDICCION = [
  "python", "javascript", "java", "reactjs",
  "angular", "vue.js", "mysql", "postgresql", "mongodb",
];

// ── Opciones de períodos ──────────────────────────────────────
const PERIODOS = [
  { value: 12, label: "12 meses" },
  { value: 24, label: "24 meses" },
  { value: 36, label: "36 meses" },
];

// ── Color por tag ─────────────────────────────────────────────
const TAG_COLORES = {
  python:     "#4dabf7",
  javascript: "#ffd166",
  java:       "#ff6b35",
  reactjs:    "#6bcb77",
  angular:    "#ff4d6d",
  "vue.js":   "#c77dff",
  mysql:      "#48cae4",
  postgresql: "#f4a261",
  mongodb:    "#6bcb77",
};

// ── Tooltip personalizado ─────────────────────────────────────
const PredTooltip = ({ active, payload, label, lastDate }) => {
  if (!active || !payload?.length) return null;
  const esFuturo = label > lastDate;
  const d = payload[0]?.payload;
  return (
    <div style={{
      backgroundColor: "#12151f",
      border: `1px solid ${esFuturo ? "#ff6b3566" : "#2a2f3e"}`,
      borderRadius: "10px",
      padding: "12px 16px",
      fontSize: "12px",
      minWidth: "180px",
    }}>
      <p style={{
        color: esFuturo ? "#ff6b35" : "#8892a4",
        fontWeight: "700",
        marginBottom: "8px",
        fontSize: "13px",
      }}>
        {label} {esFuturo ? "Predicción" : "Histórico"}
      </p>
      {d?.yhat !== undefined && (
        <p style={{ color: "white", margin: "2px 0" }}>
          Predicción: <strong>{Math.round(d.yhat).toLocaleString()}</strong>
        </p>
      )}
      {d?.yhat_upper !== undefined && (
        <p style={{ color: "#8892a4", margin: "2px 0", fontSize: "11px" }}>
          Límite sup: {Math.round(d.yhat_upper).toLocaleString()}
        </p>
      )}
      {d?.yhat_lower !== undefined && (
        <p style={{ color: "#8892a4", margin: "2px 0", fontSize: "11px" }}>
          Límite inf: {Math.round(d.yhat_lower).toLocaleString()}
        </p>
      )}
      {d?.yhat_upper !== undefined && d?.yhat_lower !== undefined && (
        <p style={{ color: "#ffd166", marginTop: "6px", fontSize: "11px" }}>
          Rango: ±{Math.round((d.yhat_upper - d.yhat_lower) / 2).toLocaleString()}
        </p>
      )}
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────
export default function Prediction() {
  const [tag,      setTag]      = useState("python");
  const [periods,  setPeriods]  = useState(12);
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const color = TAG_COLORES[tag] || "#ff6b35";

  // ── Ejecutar predicción ──────────────────────────────────
  const predecir = () => {
    setLoading(true);
    setError(null);
    setResult(null);

    predecirTag(tag, periods)
      .then(res => setResult(res))
      .catch(() => setError("No se pudo generar la predicción. Intenta de nuevo."))
      .finally(() => setLoading(false));
  };

  // ── Métricas resumen ──────────────────────────────────────
  const primerMes   = result?.data?.[0];
  const ultimoMes   = result?.data?.[result.data.length - 1];
  const tendencia   = primerMes && ultimoMes
    ? ((ultimoMes.yhat - primerMes.yhat) / Math.abs(primerMes.yhat)) * 100
    : null;
  const incertidumbrePromedio = result?.data
    ? result.data.reduce((acc, d) => acc + (d.yhat_upper - d.yhat_lower), 0) / result.data.length
    : null;

  return (
    <PageLayout>
      <div className="dash-section">

        {/* ── HEADER ── */}
        <div className="section-header">
          <div>
            <h2 className="section-titulo">Predicción Prophet</h2>
            <p className="section-subtitulo">
              Proyección futura entrenada con el histórico real de Stack Overflow.
              La banda sombreada representa el intervalo de confianza del modelo.
            </p>
          </div>
        </div>

        {/* ── CONTROLES ── */}
        <div className="chart-container">
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>

            {/* Tag */}
            <div className="filtro-grupo">
              <label className="filtro-label">Tecnología</label>
              <select
                className="filtro-select"
                value={tag}
                onChange={e => { setTag(e.target.value); setResult(null); }}
              >
                {TAGS_PREDICCION.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Períodos */}
            <div className="filtro-grupo">
              <label className="filtro-label">Horizonte</label>
              <select
                className="filtro-select"
                value={periods}
                onChange={e => { setPeriods(+e.target.value); setResult(null); }}
              >
                {PERIODOS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Botón */}
            <button
              onClick={predecir}
              disabled={loading}
              style={{
                padding: "10px 28px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: color,
                color: "white",
                fontSize: "13px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {loading ? "Entrenando modelo..." : "Predecir"}
            </button>
          </div>
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div style={{
            backgroundColor: "#ff444418",
            border: "1px solid #ff444466",
            borderRadius: "8px",
            padding: "14px 16px",
            color: "#ff6b6b",
            marginBottom: "16px",
            fontSize: "14px",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── LOADING ── */}
        {loading && (
          <div className="chart-container" style={{ textAlign: "center", padding: "60px" }}>
            <div className="spinner" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "#8892a4", fontSize: "13px" }}>
              Entrenando Prophet con el histórico de <strong style={{ color }}>{tag}</strong>...
            </p>
          </div>
        )}

        {/* ── RESULTADO ── */}
        {!loading && result && (
          <>
            {/* MÉTRICAS RESUMEN */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              marginBottom: "0",
            }}>
              {/* Tag */}
              <div style={{
                backgroundColor: "#1e2337",
                borderRadius: "10px",
                padding: "16px",
                borderTop: `3px solid ${color}`,
                textAlign: "center",
              }}>
                <p style={{ fontSize: "11px", color: "#8892a4", marginBottom: "4px" }}>Tecnología</p>
                <p style={{ fontSize: "22px", fontWeight: "800", color }}>{result.tag}</p>
              </div>

              {/* Horizonte */}
              <div style={{
                backgroundColor: "#1e2337",
                borderRadius: "10px",
                padding: "16px",
                borderTop: "3px solid #4dabf7",
                textAlign: "center",
              }}>
                <p style={{ fontSize: "11px", color: "#8892a4", marginBottom: "4px" }}>Horizonte</p>
                <p style={{ fontSize: "22px", fontWeight: "800", color: "#4dabf7" }}>
                  {result.periods} meses
                </p>
              </div>

              {/* Tendencia proyectada */}
              <div style={{
                backgroundColor: "#1e2337",
                borderRadius: "10px",
                padding: "16px",
                borderTop: `3px solid ${tendencia > 0 ? "#6bcb77" : "#ff4444"}`,
                textAlign: "center",
              }}>
                <p style={{ fontSize: "11px", color: "#8892a4", marginBottom: "4px" }}>
                  Tendencia proyectada
                </p>
                <p style={{
                  fontSize: "22px",
                  fontWeight: "800",
                  color: tendencia > 0 ? "#6bcb77" : "#ff4444",
                }}>
                  {tendencia > 0 ? "+" : ""}{tendencia?.toFixed(1)}%
                </p>
              </div>

              {/* Incertidumbre */}
              <div style={{
                backgroundColor: "#1e2337",
                borderRadius: "10px",
                padding: "16px",
                borderTop: "3px solid #ffd166",
                textAlign: "center",
              }}>
                <p style={{ fontSize: "11px", color: "#8892a4", marginBottom: "4px" }}>
                  Incertidumbre prom.
                </p>
                <p style={{ fontSize: "22px", fontWeight: "800", color: "#ffd166" }}>
                  ±{Math.round(incertidumbrePromedio / 2).toLocaleString()}
                </p>
              </div>
            </div>

            {/* GRÁFICO ÁREA CON BANDA DE CONFIANZA */}
            <div className="chart-container">
              <h3 style={{ color: "#ff6b35", fontSize: "14px", marginBottom: "4px" }}>
                Proyección de preguntas mensuales — {result.tag}
              </h3>
              <p style={{ fontSize: "12px", color: "#8892a4", marginBottom: "16px" }}>
                Último dato histórico: <strong style={{ color: "white" }}>
                  {result.last_historical_date}
                </strong>. La línea punteada separa histórico de predicción.
              </p>

              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  data={result.data}
                  margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
                >
                  <defs>
                    {/* Gradiente banda de confianza */}
                    <linearGradient id="gradBanda" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                    </linearGradient>
                    {/* Gradiente línea principal */}
                    <linearGradient id="gradLinea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2337" />
                  <XAxis
                    dataKey="ds"
                    stroke="#8892a4"
                    fontSize={11}
                    tick={{ fill: "#8892a4" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#8892a4"
                    fontSize={11}
                    tickFormatter={v => v.toLocaleString()}
                  />
                  <Tooltip content={
                    <PredTooltip lastDate={result.last_historical_date} />
                  } />

                  {/* Línea vertical — separación histórico/futuro */}
                  <ReferenceLine
                    x={result.data[0]?.ds}
                    stroke="#ff6b35"
                    strokeDasharray="6 3"
                    strokeWidth={1.5}
                    label={{
                      value: "▶ Inicio predicción",
                      fill: "#ff6b35",
                      fontSize: 11,
                      position: "insideTopRight",
                    }}
                  />

                  {/* Banda superior (yhat_upper) */}
                  <Area
                    type="monotone"
                    dataKey="yhat_upper"
                    stroke="none"
                    fill="url(#gradBanda)"
                    name="Límite superior"
                    legendType="none"
                  />

                  {/* Banda inferior (yhat_lower) */}
                  <Area
                    type="monotone"
                    dataKey="yhat_lower"
                    stroke="none"
                    fill="white"
                    fillOpacity={1}
                    name="Límite inferior"
                    legendType="none"
                    // Esto "borra" el área inferior para que solo quede la banda
                    style={{ mixBlendMode: "destination-out" }}
                  />

                  {/* Línea principal — predicción */}
                  <Area
                    type="monotone"
                    dataKey="yhat"
                    stroke={color}
                    strokeWidth={2.5}
                    fill="url(#gradLinea)"
                    dot={false}
                    activeDot={{ r: 5, fill: color }}
                    name="Predicción"
                  />

                  <Legend
                    wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                    formatter={(value) =>
                      value === "Predicción"
                        ? `${value} (${result.tag})`
                        : value
                    }
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* TABLA DE DATOS */}
            <div className="chart-container" style={{ marginTop: "0" }}>
              <h3 style={{ color: "#ff6b35", fontSize: "14px", marginBottom: "16px" }}>
                Datos de predicción mes a mes
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #2a2f3e" }}>
                      {["Mes", "Predicción", "Límite inf.", "Límite sup.", "Rango ±"].map(h => (
                        <th key={h} style={{
                          padding: "8px 12px",
                          textAlign: h === "Mes" ? "left" : "right",
                          color: "#8892a4",
                          fontWeight: "600",
                          fontSize: "12px",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((d, i) => {
                      const rango = Math.round((d.yhat_upper - d.yhat_lower) / 2);
                      const esUltimo = i === result.data.length - 1;
                      return (
                        <tr key={d.ds} style={{
                          borderBottom: esUltimo ? "none" : "1px solid #1e2337",
                          backgroundColor: i % 2 === 0 ? "transparent" : "#1e233733",
                        }}>
                          <td style={{ padding: "8px 12px", color: color, fontWeight: "600" }}>
                            {d.ds}
                          </td>
                          <td style={{ padding: "8px 12px", textAlign: "right", color: "white", fontWeight: "700" }}>
                            {Math.round(d.yhat).toLocaleString()}
                          </td>
                          <td style={{ padding: "8px 12px", textAlign: "right", color: "#8892a4" }}>
                            {Math.round(d.yhat_lower).toLocaleString()}
                          </td>
                          <td style={{ padding: "8px 12px", textAlign: "right", color: "#8892a4" }}>
                            {Math.round(d.yhat_upper).toLocaleString()}
                          </td>
                          <td style={{
                            padding: "8px 12px",
                            textAlign: "right",
                            color: rango > 1500 ? "#ff4444" : rango > 800 ? "#ffd166" : "#6bcb77",
                            fontWeight: "600",
                          }}>
                            ±{rango.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* INSIGHT */}
            <div className="insight-box">
              <span className="insight-icon">🔮</span>
              <p className="insight-texto">
                La <strong>banda sombreada</strong> representa el intervalo de confianza de Prophet:
                cuanto más ancha, mayor incertidumbre en esa proyección. Un rango{" "}
                <strong style={{ color: "#6bcb77" }}>verde</strong> indica alta precisión,{" "}
                <strong style={{ color: "#ffd166" }}>amarillo</strong> media, y{" "}
                <strong style={{ color: "#ff4444" }}>rojo</strong> baja confianza.
                La línea naranja punteada separa el histórico de la predicción.
              </p>
            </div>
          </>
        )}

      </div>
    </PageLayout>
  );
}