import { useState, useEffect } from "react";
import { getForecasts } from "../services/api";
import PageLayout from "../components/PageLayout";
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from "recharts";

const TAGS = [
  "python",
  "javascript", 
  "java",
  "php",
  "c#",
  "html",
  "jquery",
  "css",
  "c++",
  "mysql",
  "sql",
  "swift",
  "r",
  "node.js",
  "reactjs",
  "angular",
];

const COLORES = {
  "python":     "#ff6b35",
  "javascript": "#ffd93d",
  "java":       "#6bcb77",
  "php":        "#8892be",
  "c#":         "#e05c2a",
  "html":       "#e34f26",
  "jquery":     "#0769ad",
  "css":        "#264de4",
  "c++":        "#00599c",
  "mysql":      "#4479a1",
  "sql":        "#a78bfa",
  "swift":      "#f05138",
  "r":          "#276dc3",
  "node.js":    "#68a063",
  "reactjs":    "#00d4ff",
  "angular":    "#ff4444",
};

export default function Forecasts() {
  const [tag,     setTag]     = useState("python");
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getForecasts([tag])
      .then(res => {
        console.log("Respuesta API forecasts:", res);
        const serie = res.series?.[0]?.data || [];
        console.log("Serie data:", serie);
        setData(serie.map(d => ({
          ds:          d.ds,
          prediccion:  Math.round(d.yhat),
          banda:       [Math.round(d.yhat_lower), Math.round(d.yhat_upper)],
          yhat_lower:  Math.round(d.yhat_lower),
          yhat_upper:  Math.round(d.yhat_upper),
        })));
      })
      .finally(() => setLoading(false));
  }, [tag]);

  const color = COLORES[tag] || "#ff6b35";

  return (
    <PageLayout>
      <div className="dash-section">

        <div className="section-header">
          <div>
            <h2 className="section-titulo">Forecasts — Predicción 2024–2027</h2>
            <p className="section-subtitulo">
              Proyección del volumen de preguntas usando el modelo{" "}
              <strong>Prophet</strong> de Meta. La banda sombreada representa
              el intervalo de confianza (yhat_lower / yhat_upper) —
              cuanto más ancha, mayor incertidumbre en la predicción.
            </p>
          </div>

          <div className="filtro-grupo">
            <label className="filtro-label">Tecnología</label>
            <select
              className="filtro-select"
              value={tag}
              onChange={e => setTag(e.target.value)}
            >
              {TAGS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="chart-container">
          {loading ? (
            <div className="estado-card"><div className="spinner" /></div>
          ) : (
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart data={data}>
                <defs>
                  <linearGradient id="bandaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2337" />
                <XAxis
                  dataKey="ds"
                  stroke="#8892a4"
                  fontSize={11}
                  interval={5}
                />
                <YAxis
                  stroke="#8892a4"
                  fontSize={11}
                  tickFormatter={v => `${(v/1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#12151f", border: "1px solid #2a2f3e", borderRadius: "8px" }}
                  formatter={(v, name) => [`${v?.toLocaleString()}`, name]}
                />
                {/* Banda de confianza */}
                <Area
                  dataKey="yhat_upper"
                  stroke="none"
                  fill="url(#bandaGrad)"
                  name="Límite superior"
                />
                <Area
                  dataKey="yhat_lower"
                  stroke="none"
                  fill="#0a0e1a"
                  name="Límite inferior"
                />
                {/* Línea de predicción */}
                <Line
                  type="monotone"
                  dataKey="prediccion"
                  stroke={color}
                  strokeWidth={2.5}
                  dot={false}
                  name="Predicción"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="insight-box">
          <span className="insight-icon">🔮</span>
          <p className="insight-texto">
            El modelo <strong>Prophet</strong> captura estacionalidad y tendencia.
            Una banda de confianza angosta indica alta predictibilidad.
            Usa este forecast para anticipar qué tecnologías seguirán
            dominando el mercado en los próximos años.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}