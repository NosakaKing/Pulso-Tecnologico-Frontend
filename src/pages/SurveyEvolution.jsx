import { useState, useEffect } from "react";
import { getSurveyEvolucion } from "../services/api";
import PageLayout from "../components/PageLayout";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, ReferenceLine
} from "recharts";

const TAGS = ["python", "javascript", "java", "typescript", "rust", "go"];

export default function SurveyEvolucion() {
  const [tag,     setTag]     = useState("python");
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getSurveyEvolucion(tag)
      .then(res => setData(res.data || []))
      .finally(() => setLoading(false));
  }, [tag]);

  return (
    <PageLayout>
      <div className="dash-section">

        <div className="section-header">
          <div>
            <h2 className="section-titulo">Encuesta — Practica vs Principiantes</h2>
            <p className="section-subtitulo">
              Evolución histórica del porcentaje de desarrolladores que
              <strong> usan</strong> vs los que <strong>quieren aprender </strong>
              cada tecnología (Stack Overflow Developer Survey 2017–2024).
              Cuando la línea "Quiere aprender" supera a "Usado actualmente" indica alta atracción laboral.
            </p>
          </div>

          {/* Selector de tag */}
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

        {/* GRÁFICO */}
        <div className="chart-container">
          {loading ? (
            <div className="estado-card">
              <div className="spinner" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2337" />
                <XAxis dataKey="year" stroke="#8892a4" fontSize={12} />
                <YAxis
                  stroke="#8892a4"
                  fontSize={12}
                  tickFormatter={v => `${(v * 100).toFixed(0)}%`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#12151f", border: "1px solid #2a2f3e", borderRadius: "8px" }}
                  formatter={(v, name) => [`${(v * 100).toFixed(1)}%`, name]}
                />
                <Legend wrapperStyle={{ paddingTop: "16px", fontSize: "13px" }} />
                <Line
                  type="monotone"
                  dataKey="used_pct"
                  stroke="#ff6b35"
                  strokeWidth={2.5}
                  dot={{ fill: "#ff6b35", r: 4 }}
                  name="Usado actualmente"
                />
                <Line
                  type="monotone"
                  dataKey="wanted_pct"
                  stroke="#6bcb77"
                  strokeWidth={2.5}
                  strokeDasharray="6 3"
                  dot={{ fill: "#6bcb77", r: 4 }}
                  name="Quiere aprender"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="insight-box">
          <span className="insight-icon">💡</span>
          <p className="insight-texto">
            <strong>Brecha positiva</strong> (verde sobre naranja) = más devs quieren
            aprenderlo que los que ya lo usan → alta atracción laboral.{" "}
            <strong>Brecha negativa</strong> = tecnología saturada o en declive de interés.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}