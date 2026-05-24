import { useState, useEffect } from "react";
import { getCruce } from "../services/api";
import PageLayout from "../components/PageLayout";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, ReferenceLine
} from "recharts";

// ── Ordenamiento ──────────────────────────────────────────────
const ORDENES = [
  { value: "demand_gap",  label: "Brecha de demanda" },
  { value: "crecimiento", label: "Crecimiento SO"    },
  { value: "used",        label: "% Uso actual"      },
  { value: "wanted",      label: "% Deseado"         },
  { value: "views",       label: "Vistas promedio"   },
];

// ── Categorías ────────────────────────────────────────────────
const CATEGORIAS = [
  { value: "",           label: "Todas"         },
  { value: "en auge",    label: "🚀 En Auge"    },
  { value: "madurando",  label: "📊 Madurando"  },
  { value: "en declive", label: "📉 En Declive" },
];

// ── Helpers ───────────────────────────────────────────────────
const colorCategoria = (cat = "") => {
  const c = cat.toLowerCase();
  if (c.includes("auge"))    return "#6bcb77";
  if (c.includes("declive")) return "#ff4444";
  return "#ffd166";
};

const confianzaR2 = (r2) => {
  if (r2 >= 0.7) return { label: "Alta",  color: "#6bcb77" };
  if (r2 >= 0.4) return { label: "Media", color: "#ffd166" };
  return           { label: "Baja",  color: "#ff4444" };
};

// ── Tooltip personalizado ─────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{
      backgroundColor: "#12151f",
      border: "1px solid #2a2f3e",
      borderRadius: "10px",
      padding: "12px 16px",
      fontSize: "13px",
      minWidth: "200px",
    }}>
      <p style={{ color: "white", fontWeight: "700", marginBottom: "8px", fontSize: "14px" }}>
        {label}
      </p>

      {/* Usado / Deseado */}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill, margin: "2px 0" }}>
          {p.name}: <strong>{p.value}%</strong>
        </p>
      ))}

      {/* Brecha */}
      {d?.brecha !== undefined && (
        <p style={{
          marginTop: "6px",
          paddingTop: "6px",
          borderTop: "1px solid #2a2f3e",
          color: d.brecha > 0 ? "#6bcb77" : "#ff4444",
          fontWeight: "700",
        }}>
          Brecha: {d.brecha > 0 ? "+" : ""}{d.brecha}%
        </p>
      )}

      {/* Crecimiento SO */}
      {d?.crecimiento !== undefined && (
        <p style={{ color: d.crecimiento > 0 ? "#6bcb77" : "#ff4444", fontSize: "12px" }}>
          Crec. SO: {d.crecimiento > 0 ? "+" : ""}{d.crecimiento}%
        </p>
      )}

      {/* Pendiente */}
      {d?.pendiente !== undefined && (
        <p style={{ color: d.pendiente > 0 ? "#6bcb77" : "#ff4444", fontSize: "12px" }}>
          Tendencia: {d.pendiente > 0 ? "↑" : "↓"} {Math.abs(d.pendiente).toFixed(0)} preguntas/mes
        </p>
      )}

      {/* Vistas */}
      {d?.vistas !== undefined && (
        <p style={{ color: "#8892a4", fontSize: "12px" }}>
          👁 {d.vistas.toLocaleString()} vistas/pregunta
        </p>
      )}

      {/* R² */}
      {d?.r2 !== undefined && (
        <p style={{ color: confianzaR2(d.r2).color, fontSize: "11px", marginTop: "4px" }}>
          ◉ Confianza modelo: {confianzaR2(d.r2).label} (R² {d.r2.toFixed(2)})
        </p>
      )}
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────
export default function MarketIntersection() {
  const [data,      setData]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [orden,     setOrden]     = useState("demand_gap");
  const [categoria, setCategoria] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);

    getCruce(orden, categoria)
      .then(res => {
        setData(
          (res.data || []).map(d => ({
            tag:          d.tag,
            usado:        +(d.used_pct         * 100).toFixed(1),
            deseado:      +(d.wanted_pct       * 100).toFixed(1),
            brecha:       +(d.demand_gap       * 100).toFixed(1),
            crecimiento:  +(d.crecimiento_pct       ).toFixed(1),
            vistas:       Math.round(d.view_count_promedio),
            categoria:    d.categoria_tendencia,
            pendiente:    +d.pendiente.toFixed(1),
            r2:           +d.r2.toFixed(4),
            nRespondents: d.n_respondents,
          }))
        );
      })
      .catch(() => setError("No se pudieron cargar los datos. Intenta de nuevo."))
      .finally(() => setLoading(false));
  }, [orden, categoria]);

  return (
    <PageLayout>
      <div className="dash-section">

        {/* ── HEADER ── */}
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

          {/* ── FILTROS ── */}
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
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

            <div className="filtro-grupo">
              <label className="filtro-label">Categoría</label>
              <select
                className="filtro-select"
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
              >
                {CATEGORIAS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
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

        {/* ── GRÁFICO BARRAS AGRUPADAS ── */}
        <div className="chart-container">
          {loading ? (
            <div className="estado-card"><div className="spinner" /></div>
          ) : data.length === 0 ? (
            <div className="estado-card" style={{ color: "#8892a4", textAlign: "center", padding: "40px" }}>
              <p style={{ fontSize: "32px", marginBottom: "8px" }}>📭</p>
              <p>No hay tecnologías para esta categoría</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={data} margin={{ left: 10, right: 10, top: 10, bottom: 60 }}>
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
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Legend wrapperStyle={{ paddingTop: "8px", fontSize: "13px" }} />
                <ReferenceLine y={0} stroke="#8892a4" strokeDasharray="4 4" />
                <Bar dataKey="usado"   fill="#ff6b35" name="Usado actualmente" radius={[4,4,0,0]} />
                <Bar dataKey="deseado" fill="#6bcb77" name="Quiere aprender"   radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── CARDS CON TODOS LOS CAMPOS ── */}
        {!loading && data.length > 0 && (
          <div className="chart-container" style={{ marginTop: "0" }}>
            <h3 style={{ color: "#ff6b35", fontSize: "14px", marginBottom: "16px" }}>
              Detalle por Tecnología
            </h3>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
              gap: "10px",
            }}>
              {data.map((d, i) => {
                const conf = confianzaR2(d.r2);
                return (
                  <div key={i} style={{
                    backgroundColor: "#1e2337",
                    borderRadius: "8px",
                    padding: "14px 12px",
                    textAlign: "center",
                    border: `1px solid ${colorCategoria(d.categoria)}33`,
                  }}>

                    {/* Categoría */}
                    <p style={{
                      fontSize: "10px",
                      color: colorCategoria(d.categoria),
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "4px",
                    }}>
                      {d.categoria}
                    </p>

                    {/* Nombre */}
                    <p style={{ fontSize: "14px", color: "white", fontWeight: "700", marginBottom: "8px" }}>
                      {d.tag}
                    </p>

                    {/* Brecha */}
                    <p style={{
                      fontSize: "22px",
                      fontWeight: "800",
                      color: d.brecha > 0 ? "#6bcb77" : "#ff4444",
                      marginBottom: "2px",
                    }}>
                      {d.brecha > 0 ? "+" : ""}{d.brecha}%
                    </p>
                    <p style={{ fontSize: "10px", color: "#8892a4", marginBottom: "8px" }}>
                      brecha demanda
                    </p>

                    <hr style={{ border: "none", borderTop: "1px solid #2a2f3e", margin: "8px 0" }} />

                    {/* Crecimiento SO */}
                    <p style={{ fontSize: "11px", color: "#8892a4", marginBottom: "2px" }}>Crec. Stack Overflow</p>
                    <p style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: d.crecimiento > 0 ? "#6bcb77" : "#ff4444",
                      marginBottom: "6px",
                    }}>
                      {d.crecimiento > 0 ? "+" : ""}{d.crecimiento}%
                    </p>

                    {/* Pendiente — velocidad real */}
                    <p style={{ fontSize: "11px", color: "#8892a4", marginBottom: "2px" }}>Tendencia mensual</p>
                    <p style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: d.pendiente > 0 ? "#6bcb77" : "#ff4444",
                      marginBottom: "6px",
                    }}>
                      {d.pendiente > 0 ? "↑" : "↓"} {Math.abs(d.pendiente).toFixed(0)}/mes
                    </p>

                    {/* Vistas promedio */}
                    <p style={{ fontSize: "11px", color: "#8892a4" }}>
                      👁 {d.vistas.toLocaleString()} vistas/pregunta
                    </p>

                    <hr style={{ border: "none", borderTop: "1px solid #2a2f3e", margin: "8px 0" }} />

                    {/* R² — confiabilidad del modelo */}
                    <p style={{ fontSize: "10px", color: conf.color, fontWeight: "600" }}>
                      ◉ Modelo: {conf.label} (R² {d.r2.toFixed(2)})
                    </p>

                  </div>
                );
              })}
            </div>

            {/* Nota de encuestados — solo una vez al pie */}
            {data[0]?.nRespondents && (
              <p style={{
                fontSize: "11px",
                color: "#8892a4",
                textAlign: "right",
                marginTop: "12px",
              }}>
                * Datos de uso/aprendizaje basados en{" "}
                <strong style={{ color: "#fff" }}>
                  {data[0].nRespondents.toLocaleString()}
                </strong>{" "}
                respuestas del Stack Overflow Developer Survey
              </p>
            )}
          </div>
        )}

        {/* ── INSIGHT ── */}
        <div className="insight-box">
          <span className="insight-icon">🎯</span>
          <p className="insight-texto">
            <strong>Brecha positiva</strong> (verde) = más devs quieren aprenderla
            que los que ya la usan → tecnología con alta demanda laboral.{" "}
            <strong>Brecha negativa</strong> (rojo) = mercado saturado o en declive.{" "}
            El indicador <strong>R²</strong> muestra qué tan confiable es la predicción
            del modelo Prophet para esa tecnología.
          </p>
        </div>

      </div>
    </PageLayout>
  );
}