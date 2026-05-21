import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { TrendingUp, TrendingDown, ArrowUpRight, Hash } from "lucide-react";
import {
  Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, ComposedChart
} from "recharts";
import "../App.css";
import "../styles/Dashboard.css";
import PageLayout from "../components/PageLayout";
import {
  getTimeseries, getClasificacion,
  getForecasts, getTopQuestions
} from "../services/api";

const COLORES_TAG = {
  python: "#ff6b35",
  javascript: "#ffd93d",
  java: "#6bcb77",
  reactjs: "#00d4ff",
  typescript: "#c8a84b",
  "c#": "#e05c2a",
  angular: "#ff4444",
  "c++": "#00599c",
  vue: "#42b883",
  sql: "#7461aa",
  mysql: "#aa619e",
  swift: "#1a9bfa",
  r: "#ff4444",
  php: "#8892be",
  html: "#23ad58",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        backgroundColor: "#12151f",
        border: "1px solid #2a2f3e",
        borderRadius: "8px",
        padding: "10px 14px",
        fontSize: "13px"
      }}>
        <p style={{ color: "#8892a4", marginBottom: "6px" }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontWeight: "bold" }}>
            {p.name}: {p.value?.toLocaleString()} preguntas
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const location = useLocation();

  const [tagActivo, setTagActivo] = useState(location.state?.tag || "python");
  const [seriesData, setSeriesData] = useState([]);
  const [clasificacion, setClasificacion] = useState(null);
  const [forecasts, setForecasts] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const color = COLORES_TAG[tagActivo] || "#ff6b35";

  useEffect(() => {
    if (location.state?.tag) setTagActivo(location.state.tag);
  }, [location.state?.tag]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      getTimeseries([tagActivo]),
      getClasificacion(tagActivo),
      getForecasts([tagActivo]),
      getTopQuestions(tagActivo),
    ])
      .then(([series, clasif, forecast, questions]) => {
        const mapa = {};
        series.series?.forEach(({ tag, data }) => {
          data.forEach(({ year_month, count, ma3 }) => {
            if (!mapa[year_month]) mapa[year_month] = { year_month };
            mapa[year_month][tag] = count;
            mapa[year_month][`${tag}_ma3`] = ma3;
          });
        });
        setSeriesData(
          Object.values(mapa).sort((a, b) =>
            a.year_month.localeCompare(b.year_month)
          )
        );
        setClasificacion(clasif);
        setForecasts(forecast.series || []);
        setPreguntas(questions.data || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));

  }, [tagActivo]);

  const datosConForecast = () => {
    const historico = seriesData.map(d => ({ ...d, tipo: "historico" }));
    const fc = forecasts[0]?.data?.map(d => ({
      year_month: d.ds,
      [tagActivo]: Math.round(d.yhat),
      [`${tagActivo}_upper`]: Math.round(d.yhat_upper),
      [`${tagActivo}_lower`]: Math.round(d.yhat_lower),
      tipo: "forecast"
    })) || [];
    return [...historico, ...fc];
  };

  return (
    <PageLayout>
      <div className="dash-section">

        {/* ── LOADING / ERROR ── */}
        {loading && (
          <div className="estado-card">
            <div className="spinner" />
            <p>Cargando datos...</p>
          </div>
        )}

        {error && (
          <div className="estado-card estado-error">
            <p>⚠️ No se pudo conectar con la API</p>
            <p style={{ fontSize: "12px", color: "#8892a4" }}>{error}</p>
            <p style={{ fontSize: "12px", color: "#8892a4" }}>
              Asegúrate de que la API está corriendo en localhost:8000
            </p>
          </div>
        )}

        {!loading && !error && clasificacion && (
          <>
            {/* ── KPIs ── */}
            <div className="tech-hero-card" style={{ borderColor: color }}>
              <div className="tech-hero-left">
                <div className="tech-tag" style={{ backgroundColor: color }}>
                  {tagActivo.toUpperCase()}
                </div>
                <div className="tech-trend">
                  {clasificacion.crecimiento_pct > 0
                    ? <TrendingUp size={16} color="#6bcb77" />
                    : <TrendingDown size={16} color="#ff4444" />
                  }
                  <span style={{
                    color: clasificacion.crecimiento_pct > 0 ? "#6bcb77" : "#ff4444"
                  }}>
                    {clasificacion.crecimiento_pct > 0 ? "+" : ""}
                    {clasificacion.crecimiento_pct?.toFixed(1)}% crecimiento anual
                  </span>
                  <span className="categoria-badge" style={{ borderColor: color, color }}>
                    {clasificacion.categoria_tendencia}
                  </span>
                </div>
              </div>

              <div className="tech-hero-stats">
                <div className="tech-stat">
                  <p className="tech-stat-label">Volumen total</p>
                  <p className="tech-stat-value" style={{ color }}>
                    {(clasificacion.volumen_total / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="tech-stat">
                  <p className="tech-stat-label">Pendiente β₁</p>
                  <p className="tech-stat-value">
                    {clasificacion.pendiente?.toFixed(1)}
                  </p>
                </div>
                <div className="tech-stat">
                  <p className="tech-stat-label">R² modelo</p>
                  <p className="tech-stat-value">
                    {(clasificacion.r2 * 100)?.toFixed(0)}%
                  </p>
                </div>
                <div className="tech-stat">
                  <p className="tech-stat-label">Views promedio</p>
                  <p className="tech-stat-value">
                    {(clasificacion.view_count_promedio / 1000)?.toFixed(1)}K
                  </p>
                </div>
              </div>
            </div>

            {/* ── EXPLICACIÓN MÉTRICAS ── */}
            <div className="metricas-explicacion">
              <div className="metrica-exp-item">
                <span className="metrica-exp-titulo">¿Qué es β₁?</span>
                <span className="metrica-exp-desc">
                  Pendiente de la regresión lineal.
                  {clasificacion.pendiente > 0
                    ? " Positivo = crece en preguntas por mes."
                    : " Negativo = decrece en preguntas por mes."
                  }
                </span>
              </div>
              <div className="metrica-exp-item">
                <span className="metrica-exp-titulo">¿Qué es R²?</span>
                <span className="metrica-exp-desc">
                  Confiabilidad del modelo. {(clasificacion.r2 * 100).toFixed(0)}% significa que
                  {clasificacion.r2 > 0.7
                    ? " la tendencia es muy predecible."
                    : " hay variabilidad en la tendencia."
                  }
                </span>
              </div>
            </div>

            {/* ── SERIES DE TIEMPO ── */}
            <div className="section-header">
              <div>
                <h2 className="section-titulo">Series de tiempo — Evolución mensual</h2>
                <p className="section-subtitulo">
                  Número de preguntas por mes en Stack Overflow (2015–2024).
                  La zona sombreada es la predicción del modelo Prophet.
                </p>
              </div>
              <div className="tags-selector">
                {Object.keys(COLORES_TAG).map(tag => (
                  <button
                    key={tag}
                    className={`tag-btn ${tagActivo === tag ? "activo" : ""}`}
                    style={tagActivo === tag ? {
                      backgroundColor: COLORES_TAG[tag],
                      borderColor: COLORES_TAG[tag]
                    } : {}}
                    onClick={() => setTagActivo(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={datosConForecast()}>
                  <defs>
                    <linearGradient id={`grad-${tagActivo}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORES_TAG[tagActivo]} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={COLORES_TAG[tagActivo]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2337" />
                  <XAxis
                    dataKey="year_month"
                    stroke="#8892a4"
                    fontSize={11}
                    tickFormatter={v => v?.slice(0, 7)}
                    interval={11}
                  />
                  <YAxis stroke="#8892a4" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    x={seriesData[seriesData.length - 1]?.year_month}
                    stroke="#8892a4"
                    strokeDasharray="4 4"
                    label={{ value: "Hoy", fill: "#8892a4", fontSize: 11 }}
                  />
                  <Area
                    type="monotone"
                    dataKey={tagActivo}
                    stroke={COLORES_TAG[tagActivo]}
                    strokeWidth={3}
                    fill={`url(#grad-${tagActivo})`}
                    dot={false}
                    name={tagActivo}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="insight-box">
              <span className="insight-icon">📈</span>
              <p className="insight-texto">
                <strong style={{ color }}>
                  {tagActivo.charAt(0).toUpperCase() + tagActivo.slice(1)}
                </strong> tiene una pendiente β₁ de <strong style={{ color }}>
                  {clasificacion.pendiente?.toFixed(2)}
                </strong> preguntas/mes con un R² de <strong style={{ color }}>
                  {(clasificacion.r2 * 100).toFixed(0)}%
                </strong> —{" "}
                {clasificacion.r2 > 0.7
                  ? "la tendencia es estadísticamente confiable."
                  : "hay variabilidad en los datos."
                }
              </p>
            </div>

            {/* ── PREGUNTAS TOP ── */}
            {preguntas.length > 0 && (
              <>
                <div className="section-header">
                  <div>
                    <h2 className="section-titulo">Preguntas mejor valoradas</h2>
                    <p className="section-subtitulo">
                      Las preguntas con mayor Score sobre{" "}
                      <strong style={{ color }}>{tagActivo}</strong>.
                      Un Score alto indica que muchos usuarios encontraron útil la respuesta.
                    </p>
                  </div>
                </div>

                <div className="chart-container">
                  <table className="preguntas-tabla">
                    <thead>
                      <tr>
                        <th>Score</th>
                        <th>Vistas</th>
                        <th>Respuestas</th>
                        <th>Enlace</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preguntas.slice(0, 8).map((p, i) => (
                        <tr key={i}>
                          <td>
                            <span className="score-badge" style={{ backgroundColor: color }}>
                              {p.score?.toLocaleString()}
                            </span>
                          </td>
                          <td style={{ color: "#8892a4" }}>
                            {(p.view_count / 1000).toFixed(0)}K
                          </td>
                          <td style={{ color: "#8892a4" }}>{p.answer_count}</td>
                          <td>
                            <a href={p.url} target="_blank" rel="noreferrer" className="so-link">
                              Ver <ArrowUpRight size={12} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── LINK STACK OVERFLOW ── */}
            <div className="stackoverflow-card">
              <div className="so-left">
                <Hash size={20} color="#00d4ff" />
                <div>
                  <p className="so-titulo">Explorar en Stack Overflow</p>
                  <p className="so-desc">
                    Ver todas las preguntas sobre <strong>{tagActivo}</strong>
                  </p>
                </div>
              </div>
              <a
                href={`https://stackoverflow.com/questions/tagged/${tagActivo}`}
                target="_blank"
                rel="noreferrer"
                className="so-btn"
              >
                Ver preguntas <ArrowUpRight size={16} />
              </a>
            </div>
          </>
        )}
      </div>
    </PageLayout >
  );
}