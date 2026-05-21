import { useState, useEffect } from "react";
import { getTop20 } from "../services/api";
import PageLayout from "../components/PageLayout";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid
} from "recharts";

const COLORES_CATEGORIA = {
  "lenguaje": "#00d4ff",   // Celeste
  "framework": "#ff6b35",   // Naranja
  "base de datos": "#a78bfa",   // Morado
  "otros": "#6bcb77",   // Verde
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        backgroundColor: "#12151f",
        border: "1px solid #2a2f3e",
        borderRadius: "8px",
        padding: "12px 16px",
        fontSize: "13px"
      }}>
        <p style={{ color: "white", fontWeight: "bold", marginBottom: "4px" }}>
          {d.tag}
        </p>
        {/*colores de preguntas*/}
        <p style={{ color: "#c25b36ff" }}>
          {d.count?.toLocaleString()} preguntas
        </p>
        <p style={{ color: "#8892a4", fontSize: "11px" }}>
          Categoría: {d.categoria}
        </p>
      </div>
    );
  }
  return null;
};

export default function Top20() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startYear, setStartYear] = useState(2015);
  const [endYear, setEndYear] = useState(2024);

  useEffect(() => {
    setLoading(true);
    getTop20(startYear, endYear)
      .then(res => setData(res.data || []))
      .finally(() => setLoading(false));
  }, [startYear, endYear]);

  return (
    <PageLayout>
      <div style={{ padding: "32px 40px" }}>
        <div className="dash-section">
          {/* HEADER */}
          <div className="section-header">
            <div>
              <h2 className="section-titulo">Top 20 Tecnologías</h2>
              <p className="section-subtitulo">
                Ranking de las tecnologías más preguntadas en Stack Overflow.
                El tamaño de la barra representa el volumen total de preguntas
                en el período seleccionado.
              </p>
            </div>

            {/* Filtro de años */}
            <div className="filtro-años">
              <div className="filtro-grupo">
                <label className="filtro-label">Desde</label>
                <select
                  className="filtro-select"
                  value={startYear}
                  onChange={e => setStartYear(Number(e.target.value))}
                >
                  {[2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="filtro-grupo">
                <label className="filtro-label">Hasta</label>
                <select
                  className="filtro-select"
                  value={endYear}
                  onChange={e => setEndYear(Number(e.target.value))}
                >
                  {[2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* LEYENDA CATEGORÍAS */}
          <div className="leyenda-categorias">
            {Object.entries(COLORES_CATEGORIA).map(([cat, color]) => (
              <div key={cat} className="leyenda-item">
                <span className="leyenda-dot" style={{ backgroundColor: color }} />
                <span className="leyenda-label">{cat}</span>
              </div>
            ))}
          </div>

          {/* GRÁFICO */}
          <div className="chart-container">
            {loading ? (
              <div className="estado-card">
                <div className="spinner" />
                <p>Cargando Top 20...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={700}>
                <BarChart
                  data={data}
                  layout="vertical"
                  margin={{ left: 20, right: 40, top: 10, bottom: 10 }}
                  barSize={20}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2337" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#8892a4"
                    fontSize={12}
                    tickFormatter={v => `${(v / 1000).toFixed(0)}K`}
                  />
                  <YAxis
                    type="category"
                    dataKey="tag"
                    stroke="#8892a4"
                    fontSize={13}
                    width={100}
                    tick={{ fill: "white" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {/*grados en las barras*/}
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {data.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={COLORES_CATEGORIA[entry.categoria?.toLowerCase()] || "#ff9735ff"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* INSIGHT */}
          <div className="insight-box">
            <span className="insight-icon">💡</span>
            <p className="insight-texto">
              Las barras están coloreadas por categoría tecnológica.
              El volumen de preguntas refleja la adopción real en la industria —
              más preguntas significa más desarrolladores usando esa tecnología.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}