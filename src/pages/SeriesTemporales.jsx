import { useState, useEffect } from "react";
import { getTimeseries } from "../services/api";
import PageLayout from "../components/PageLayout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const TAGS_DISPONIBLES = [
  { label: "Python", color: "#306998" },
  { label: "JavaScript", color: "#f7e01d" },
  { label: "Java", color: "#e21e1f" },
  { label: "ReactJs", color: "#51c3e1" },
  { label: "Angular", color: "#b62f31" },
  { label: "Vue.Js", color: "#43b983" },
  { label: "Postgresql", color: "#326790" },
  { label: "MySQL", color: "#f19516" },
  { label: "Mongodb", color: "#11aa50" },
];

export default function SeriesTemporales() {
  const [seleccionados, setSeleccionados] = useState(["python", "javascript"]);
  const [seriesData, setSeriesData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!seleccionados.length) return;
    setLoading(true);
    getTimeseries(seleccionados)
      .then((res) => {
        const mapa = {};
        res.series?.forEach(({ tag, data }) => {
          data.forEach(({ year_month, count, ma3 }) => {
            if (!mapa[year_month]) mapa[year_month] = { year_month };
            mapa[year_month][tag] = count;
            mapa[year_month][`${tag}_ma3`] = ma3;
          });
        });
        setSeriesData(
          Object.values(mapa).sort((a, b) =>
            a.year_month.localeCompare(b.year_month),
          ),
        );
      })
      .finally(() => setLoading(false));
  }, [seleccionados]);

  const toggleTag = (tag) => {
    setSeleccionados((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const getColor = (tag) =>
    TAGS_DISPONIBLES.find((t) => t.label.toLowerCase() === tag)?.color ||
    "#ff6b35";

  return (
    <PageLayout>
      <div className="dash-section">
        <div className="section-header">
          <div>
            <h2 className="section-titulo">Series de Tiempo</h2>
            <p className="section-subtitulo">
              Evolución mensual del número de preguntas por tecnología
              (2015–2024). Selecciona una o varias tecnologías para comparar su
              trayectoria. La línea muestra la media móvil de 3 meses para
              suavizar picos.
            </p>
          </div>
        </div>

        {/* SELECTOR MÚLTIPLE */}
        <div className="tags-selector">
          {TAGS_DISPONIBLES.map((tec) => {
            const tag = tec.label.toLowerCase();
            const activo = seleccionados.includes(tag);
            return (
              <button
                key={tag}
                className={`tag-btn ${activo ? "activo" : ""}`}
                style={
                  activo
                    ? {
                        backgroundColor: tec.color,
                        borderColor: tec.color,
                        color: "white",
                      }
                    : {}
                }
                onClick={() => toggleTag(tag)}
              >
                {tec.label}
              </button>
            );
          })}
        </div>

        {/* GRÁFICO */}
        <div className="chart-container">
          {loading ? (
            <div className="estado-card">
              <div className="spinner" />
              <p>Cargando series...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={seriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2337" />
                <XAxis
                  dataKey="year_month"
                  stroke="#8892a4"
                  fontSize={11}
                  interval={11}
                  tickFormatter={(v) => v?.slice(0, 4)}
                />
                <YAxis
                  stroke="#8892a4"
                  fontSize={11}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#12151f",
                    border: "1px solid #2a2f3e",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#8892a4" }}
                  formatter={(value) => [
                    Math.round(value).toLocaleString(),
                    "Preguntas (MA3)",
                  ]}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "16px", fontSize: "13px" }}
                />
                {seleccionados.map((tag) => (
                  <Line
                    key={tag}
                    type="monotone"
                    dataKey={`${tag}_ma3`}
                    stroke={getColor(tag)}
                    strokeWidth={2.5}
                    dot={false}
                    name={tag}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="insight-box">
          <span className="insight-icon">📈</span>
          <p className="insight-texto">
            Se muestra la <strong>media móvil de 3 meses (MA3)</strong> para
            suavizar variaciones estacionales y revelar la tendencia real. Un
            cruce de líneas indica un cambio en la popularidad relativa entre
            tecnologías.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
