import { useState, useEffect } from "react";
import { getCruce } from "../services/api";
import PageLayout from "../components/PageLayout";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, ReferenceLine
} from "recharts";

const ORDENES = [
  { value: "demand_gap",  label: "Brecha de demanda" },
  { value: "crecimiento", label: "Crecimiento SO"    },
  { value: "used",        label: "% Uso actual"      },
  { value: "wanted",      label: "% Deseado"         },
];

export default function MarketIntersection() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [orden,   setOrden]   = useState("demand_gap");

  useEffect(() => {
    setLoading(true);
    getCruce(orden)
      .then(res => {
        setData((res.data || []).map(d => ({
          tag:        d.tag,
          usado:      +(d.used_pct   * 100).toFixed(1),
          deseado:    +(d.wanted_pct * 100).toFixed(1),
          brecha:     +(d.demand_gap * 100).toFixed(1),
          categoria:  d.categoria_tendencia,
        })));
      })
      .finally(() => setLoading(false));
  }, [orden]);

  return (
    <PageLayout>
      <div className="dash-section">

        <div className="section-header">
          <div>
            <h2 className="section-titulo">Cruce de Mercado</h2>
            <p className="section-subtitulo">
              Triangulación de Stack Overflow × Developer Survey.
              Las barras agrupadas muestran el porcentaje de desarrolladores
              que <strong>usan</strong> vs los que <strong>quieren aprender</strong>
              cada tecnología. La brecha entre ambas revela la demanda real del mercado.
            </p>
          </div>

          <div className="filtro-grupo">
            <label className="filtro-label">Ordenar por</label>
            <select
              className="filtro-select"
              value={orden}
              onChange={e => setOrden(e.target.value)}
            >
              {ORDENES.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* GRÁFICO BARRAS AGRUPADAS */}
        <div className="chart-container">
          {loading ? (
            <div className="estado-card"><div className="spinner" /></div>
          ) : (
            <ResponsiveContainer width="100%" height={420}>
              <BarChart
                data={data}
                margin={{ left: 10, right: 10, top: 10, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2337" />
                <XAxis
                  dataKey="tag"
                  stroke="#8892a4"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fill: "white" }}
                />
                <YAxis
                  stroke="#8892a4"
                  fontSize={12}
                  tickFormatter={v => `${v}%`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#12151f", border: "1px solid #2a2f3e", borderRadius: "8px" }}
                  formatter={(v, name) => [`${v}%`, name]}
                />
                <Legend wrapperStyle={{ paddingTop: "8px", fontSize: "13px" }} />
                <ReferenceLine y={0} stroke="#8892a4" strokeDasharray="4 4" />
                <Bar dataKey="usado"   fill="#ff6b35" name="Usado actualmente" radius={[4,4,0,0]} />
                <Bar dataKey="deseado" fill="#6bcb77" name="Quiere aprender"   radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* TABLA BRECHA */}
        <div className="chart-container" style={{ marginTop: "0" }}>
          <h3 style={{ color: "#ff6b35", fontSize: "14px", marginBottom: "16px" }}>
            Brecha de Demanda (Wanted − Used)
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
            {data.map((d, i) => (
              <div key={i} style={{
                backgroundColor: "#1e2337",
                borderRadius: "8px",
                padding: "12px",
                textAlign: "center",
                border: `1px solid ${d.brecha > 0 ? "#6bcb77" : "#ff4444"}22`
              }}>
                <p style={{ fontSize: "12px", color: "#8892a4", marginBottom: "4px" }}>{d.tag}</p>
                <p style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  color: d.brecha > 0 ? "#6bcb77" : "#ff4444"
                }}>
                  {d.brecha > 0 ? "+" : ""}{d.brecha}%
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="insight-box">
          <span className="insight-icon">🎯</span>
          <p className="insight-texto">
            <strong>Brecha positiva</strong> (verde) = más devs quieren aprenderla
            que los que ya la usan → tecnología con alta demanda laboral.{" "}
            <strong>Brecha negativa</strong> (rojo) = mercado saturado o en declive
            de interés formativo.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}