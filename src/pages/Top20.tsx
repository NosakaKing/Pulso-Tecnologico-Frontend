import { useState, useEffect } from "react";
import { getTop20 } from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid
} from "recharts";

// ── Tipos ──────────────────────────────────────────────────────────────────
interface Top20Item {
  tag: string;
  count: number;
  categoria: string;
  porcentaje: number;
}

// ── Constantes ─────────────────────────────────────────────────────────────
const COLORES_CATEGORIA: Record<string, string> = {
  "lenguaje":      "#00d4ff",
  "framework":     "#ff6b35",
  "base de datos": "#a78bfa",
  "otros":         "#6bcb77",
};

const CATEGORIAS = ["todas", "lenguaje", "framework", "base de datos", "otros"];
const AÑOS_DESDE = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
const AÑOS_HASTA = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

// ── Tooltip ────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d: Top20Item = payload[0].payload;
    return (
      <div style={{
        backgroundColor: "#12151f",
        border: "1px solid #2a2f3e",
        borderRadius: "8px",
        padding: "12px 16px",
        fontSize: "13px",
      }}>
        <p style={{ color: "white", fontWeight: "bold", marginBottom: "4px" }}>
          {d.tag}
        </p>
        <p style={{ color: "#ff6b35" }}>
          {d.count?.toLocaleString()} preguntas
        </p>
        <p style={{ color: "#a78bfa", fontSize: "12px" }}>
          {d.porcentaje}% del total filtrado
        </p>
        <p style={{ color: "#8892a4", fontSize: "11px" }}>
          Categoría: {d.categoria}
        </p>
      </div>
    );
  }
  return null;
};

// ── Componente ─────────────────────────────────────────────────────────────
export default function Top20() {
  const [data,      setData]      = useState<Top20Item[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [startYear, setStartYear] = useState(2015);
  const [endYear,   setEndYear]   = useState(2024);
  const [categoria, setCategoria] = useState("todas");

  useEffect(() => {
    if (startYear > endYear) return;
    setLoading(true);
    getTop20(
      startYear,
      endYear,
      categoria === "todas" ? undefined : categoria
    )
      .then(res => setData(res.data || []))
      .finally(() => setLoading(false));
  }, [startYear, endYear, categoria]);

  return (
    <div className="page">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="page-header-texto">
          <h2 className="page-titulo">Top 20 Tecnologías</h2>
          <p className="page-subtitulo">
            Ranking de las tecnologías más preguntadas en Stack Overflow.
            Filtra por rango de años y categoría para explorar tendencias específicas.
          </p>
        </div>

        {/* ── FILTROS ──────────────────────────────────────────────────── */}
        <div className="filtros">

          <div className="filtro-grupo">
            <label className="filtro-label">Desde</label>
            <select
              className="filtro-select"
              value={startYear}
              onChange={e => setStartYear(Number(e.target.value))}
            >
              {AÑOS_DESDE.map(y => (
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
              {AÑOS_HASTA.filter(y => y >= startYear).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label className="filtro-label">Categoría</label>
            <select
              className="filtro-select"
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
            >
              {CATEGORIAS.map(c => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* ── LEYENDA ────────────────────────────────────────────────────── */}
      <div className="leyenda">
        {Object.entries(COLORES_CATEGORIA).map(([cat, color]) => (
          <div key={cat} className="leyenda-item">
            <span className="leyenda-dot" style={{ backgroundColor: color }} />
            <span className="leyenda-label">{cat}</span>
          </div>
        ))}
      </div>

      {/* ── GRÁFICO ────────────────────────────────────────────────────── */}
      <div className="chart-container">
        {loading ? (
          <div className="estado-card">
            <div className="spinner" />
            <p>Cargando Top 20...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="estado-card">
            <p>No hay datos para el filtro seleccionado.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={700}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 20, right: 60, top: 10, bottom: 10 }}
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
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {data.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={COLORES_CATEGORIA[entry.categoria?.toLowerCase()] || "#ff9735"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── INSIGHT ────────────────────────────────────────────────────── */}
      <div className="insight-box">
        <span className="insight-icon">💡</span>
        <p className="insight-texto">
          {categoria === "todas"
            ? "Mostrando todas las categorías. Usa el filtro para enfocarte en lenguajes, frameworks o bases de datos."
            : `Mostrando solo tecnologías de tipo "${categoria}" entre ${startYear} y ${endYear}.`
          }
          {" "}El volumen de preguntas refleja la adopción real en la industria.
        </p>
      </div>

    </div>
  );
}