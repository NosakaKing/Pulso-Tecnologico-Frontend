import { useState } from "react";
import { compararTags } from "../services/api";
import PageLayout from "../components/PageLayout";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine,
} from "recharts";

// ── Tags disponibles (del top 20) ────────────────────────────
const TAGS_DISPONIBLES = [
  "python", "javascript", "java", "c#", "android",
  "php", "html", "css", "jquery", "c++",
  "reactjs", "r", "sql", "node.js", "ios",
  "mysql", "python-3.x", "swift", "angular", "arrays",
];

// ── Paleta de colores por índice ──────────────────────────────
const COLORES = [
  "#ff6b35", "#6bcb77", "#4dabf7", "#ffd166",
  "#c77dff", "#ff4d6d", "#48cae4", "#f4a261",
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

const fmt = (n, dec = 1) => (n > 0 ? "+" : "") + n.toFixed(dec);

// ── Tooltip del radar ─────────────────────────────────────────
const RadarTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      backgroundColor: "#12151f",
      border: "1px solid #2a2f3e",
      borderRadius: "10px",
      padding: "10px 14px",
      fontSize: "12px",
    }}>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────
export default function TagComparison() {
  const [seleccionados, setSeleccionados] = useState([]);
  const [data,          setData]          = useState([]);
  const [noEncontrados, setNoEncontrados] = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [vistaActiva,   setVistaActiva]   = useState("radar"); // radar | barras

  // ── Toggle tag ────────────────────────────────────────────
  const toggleTag = (tag) => {
    setSeleccionados(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : prev.length < 5
          ? [...prev, tag]
          : prev // máximo 5
    );
  };

  // ── Buscar comparación ────────────────────────────────────
  const comparar = () => {
    if (seleccionados.length < 2) return;
    setLoading(true);
    setError(null);

    compararTags(seleccionados)
      .then(res => {
        setData(res.data         || []);
        setNoEncontrados(res.tags_no_encontrados || []);
      })
      .catch(() => setError("No se pudo cargar la comparación. Intenta de nuevo."))
      .finally(() => setLoading(false));
  };

  // ── Datos normalizados para el radar (0–100) ──────────────
  const maxVolumen   = Math.max(...data.map(d => d.volumen_total), 1);
  const maxVistas    = Math.max(...data.map(d => d.view_count_promedio), 1);

  const radarData = [
    { metrica: "Volumen",     ...Object.fromEntries(data.map(d => [d.tag, +((d.volumen_total / maxVolumen) * 100).toFixed(1)])) },
    { metrica: "Share 2023",  ...Object.fromEntries(data.map(d => [d.tag, +d.share_2023.toFixed(1)])) },
    { metrica: "Crecimiento", ...Object.fromEntries(data.map(d => [d.tag, +(d.crecimiento_pct + 50).toFixed(1)])) }, // offset para valores negativos
    { metrica: "Vistas",      ...Object.fromEntries(data.map(d => [d.tag, +((d.view_count_promedio / maxVistas) * 100).toFixed(1)])) },
    { metrica: "Confianza R²",...Object.fromEntries(data.map(d => [d.tag, +(d.r2 * 100).toFixed(1)])) },
  ];

  // ── Datos para barras de crecimiento ─────────────────────
  const barrasData = data.map(d => ({
    tag:        d.tag,
    crecimiento: +d.crecimiento_pct.toFixed(1),
    share2022:  +d.share_2022.toFixed(2),
    share2023:  +d.share_2023.toFixed(2),
  }));

  return (
    <PageLayout>
      <div className="dash-section">

        {/* ── HEADER ── */}
        <div className="section-header">
          <div>
            <h2 className="section-titulo">Comparador de Tecnologías</h2>
            <p className="section-subtitulo">
              Selecciona entre 2 y 5 tecnologías para comparar su volumen,
              crecimiento, share de mercado y confiabilidad del modelo Prophet.
            </p>
          </div>

          {/* Toggle vista */}
          {data.length > 0 && (
            <div style={{ display: "flex", gap: "8px" }}>
              {["radar", "barras"].map(v => (
                <button
                  key={v}
                  onClick={() => setVistaActiva(v)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    border: "1px solid #2a2f3e",
                    backgroundColor: vistaActiva === v ? "#ff6b35" : "#1e2337",
                    color: "white",
                    fontSize: "12px",
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {v === "radar" ? "🕸 Radar" : "📊 Barras"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── SELECTOR DE TAGS ── */}
        <div className="chart-container">
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}>
            <p style={{ fontSize: "13px", color: "#8892a4" }}>
              Seleccionados: <strong style={{ color: "white" }}>{seleccionados.length}/5</strong>
            </p>
            {seleccionados.length > 0 && (
              <button
                onClick={() => { setSeleccionados([]); setData([]); setNoEncontrados([]); }}
                style={{
                  fontSize: "11px",
                  color: "#ff4444",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✕ Limpiar
              </button>
            )}
          </div>

          {/* Grid de tags */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "16px",
          }}>
            {TAGS_DISPONIBLES.map((tag, i) => {
              const idx = seleccionados.indexOf(tag);
              const activo = idx !== -1;
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    border: `1px solid ${activo ? COLORES[idx] : "#2a2f3e"}`,
                    backgroundColor: activo ? `${COLORES[idx]}22` : "#1e2337",
                    color: activo ? COLORES[idx] : "#8892a4",
                    fontSize: "12px",
                    fontWeight: activo ? "700" : "400",
                    cursor: seleccionados.length >= 5 && !activo ? "not-allowed" : "pointer",
                    opacity: seleccionados.length >= 5 && !activo ? 0.4 : 1,
                    transition: "all 0.15s ease",
                  }}
                >
                  {activo && <span style={{ marginRight: "4px" }}>✓</span>}
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Botón comparar */}
          <button
            onClick={comparar}
            disabled={seleccionados.length < 2 || loading}
            style={{
              padding: "10px 24px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: seleccionados.length >= 2 ? "#ff6b35" : "#2a2f3e",
              color: "white",
              fontSize: "13px",
              fontWeight: "700",
              cursor: seleccionados.length >= 2 ? "pointer" : "not-allowed",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Cargando..." : `⚡ Comparar ${seleccionados.length > 0 ? `(${seleccionados.length})` : ""}`}
          </button>

          {seleccionados.length < 2 && (
            <p style={{ fontSize: "11px", color: "#8892a4", marginTop: "8px" }}>
              Selecciona al menos 2 tecnologías para comparar
            </p>
          )}
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

        {/* ── TAGS NO ENCONTRADOS ── */}
        {noEncontrados.length > 0 && (
          <div style={{
            backgroundColor: "#ffd16618",
            border: "1px solid #ffd16644",
            borderRadius: "8px",
            padding: "12px 16px",
            color: "#ffd166",
            marginBottom: "16px",
            fontSize: "13px",
          }}>
            ⚠️ No encontrados: <strong>{noEncontrados.join(", ")}</strong>
          </div>
        )}

        {/* ── GRÁFICOS ── */}
        {!loading && data.length > 0 && (
          <>
            {/* RADAR */}
            {vistaActiva === "radar" && (
              <div className="chart-container">
                <h3 style={{ color: "#ff6b35", fontSize: "14px", marginBottom: "4px" }}>
                  Comparación multidimensional
                </h3>
                <p style={{ fontSize: "12px", color: "#8892a4", marginBottom: "16px" }}>
                  Valores normalizados 0–100. Crecimiento desplazado +50 para incluir valores negativos.
                </p>
                <ResponsiveContainer width="100%" height={380}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1e2337" />
                    <PolarAngleAxis
                      dataKey="metrica"
                      tick={{ fill: "#8892a4", fontSize: 12 }}
                    />
                    <Tooltip content={<RadarTooltip />} cursor={false} />
                    <Legend wrapperStyle={{ fontSize: "13px" }} />
                    {data.map((d, i) => (
                      <Radar
                        key={d.tag}
                        name={d.tag}
                        dataKey={d.tag}
                        stroke={COLORES[i]}
                        fill={COLORES[i]}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* BARRAS — crecimiento + share */}
            {vistaActiva === "barras" && (
              <div className="chart-container">
                <h3 style={{ color: "#ff6b35", fontSize: "14px", marginBottom: "16px" }}>
                  Crecimiento % y Share de mercado 2022 → 2023
                </h3>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={barrasData} margin={{ left: 10, right: 10, top: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2337" />
                    <XAxis dataKey="tag" stroke="#8892a4" tick={{ fill: "white", fontSize: 12 }} />
                    <YAxis stroke="#8892a4" fontSize={12} tickFormatter={v => `${v}%`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#12151f", border: "1px solid #2a2f3e", borderRadius: "8px" }}
                      formatter={(v, name) => [`${v}%`, name]}
                      cursor={false}
                    />
                    <Legend wrapperStyle={{ fontSize: "13px" }} />
                    <ReferenceLine y={0} stroke="#8892a4" strokeDasharray="4 4" />
                    <Bar dataKey="crecimiento" name="Crecimiento %"  fill="#ff6b35" radius={[4,4,0,0]} />
                    <Bar dataKey="share2022"   name="Share 2022 %"   fill="#4dabf7" radius={[4,4,0,0]} />
                    <Bar dataKey="share2023"   name="Share 2023 %"   fill="#6bcb77" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ── CARDS DETALLE ── */}
            <div className="chart-container" style={{ marginTop: "0" }}>
              <h3 style={{ color: "#ff6b35", fontSize: "14px", marginBottom: "16px" }}>
                Ficha comparativa
              </h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${data.length}, 1fr)`,
                gap: "12px",
              }}>
                {data.map((d, i) => {
                  const conf = confianzaR2(d.r2);
                  return (
                    <div key={d.tag} style={{
                      backgroundColor: "#1e2337",
                      borderRadius: "10px",
                      padding: "16px",
                      borderTop: `3px solid ${COLORES[i]}`,
                    }}>

                      {/* Nombre + categoría */}
                      <p style={{
                        fontSize: "11px",
                        color: colorCategoria(d.categoria_tendencia),
                        fontWeight: "700",
                        textTransform: "uppercase",
                        marginBottom: "2px",
                      }}>
                        {d.categoria_tendencia}
                      </p>
                      <p style={{
                        fontSize: "18px",
                        fontWeight: "800",
                        color: COLORES[i],
                        marginBottom: "12px",
                      }}>
                        {d.tag}
                      </p>

                      {/* Volumen total */}
                      <div style={{ marginBottom: "8px" }}>
                        <p style={{ fontSize: "10px", color: "#8892a4" }}>Volumen total</p>
                        <p style={{ fontSize: "16px", fontWeight: "700", color: "white" }}>
                          {d.volumen_total.toLocaleString()}
                        </p>
                      </div>

                      {/* Share 2022 → 2023 */}
                      <div style={{ marginBottom: "8px" }}>
                        <p style={{ fontSize: "10px", color: "#8892a4" }}>Share mercado</p>
                        <p style={{ fontSize: "13px", color: "white" }}>
                          <span style={{ color: "#4dabf7" }}>{d.share_2022.toFixed(2)}%</span>
                          {" → "}
                          <span style={{ color: "#6bcb77" }}>{d.share_2023.toFixed(2)}%</span>
                        </p>
                      </div>

                      {/* Crecimiento */}
                      <div style={{ marginBottom: "8px" }}>
                        <p style={{ fontSize: "10px", color: "#8892a4" }}>Crecimiento SO</p>
                        <p style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          color: d.crecimiento_pct > 0 ? "#6bcb77" : "#ff4444",
                        }}>
                          {fmt(d.crecimiento_pct)}%
                        </p>
                      </div>

                      {/* Pendiente mensual */}
                      <div style={{ marginBottom: "8px" }}>
                        <p style={{ fontSize: "10px", color: "#8892a4" }}>Tendencia mensual</p>
                        <p style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: d.pendiente > 0 ? "#6bcb77" : "#ff4444",
                        }}>
                          {d.pendiente > 0 ? "↑" : "↓"} {Math.abs(d.pendiente).toFixed(0)}/mes
                        </p>
                      </div>

                      {/* Vistas promedio */}
                      <div style={{ marginBottom: "8px" }}>
                        <p style={{ fontSize: "10px", color: "#8892a4" }}>Vistas/pregunta</p>
                        <p style={{ fontSize: "13px", color: "white" }}>
                          👁 {Math.round(d.view_count_promedio).toLocaleString()}
                        </p>
                      </div>

                      {/* R² */}
                      <div>
                        <p style={{ fontSize: "10px", color: "#8892a4" }}>Confianza modelo</p>
                        <p style={{ fontSize: "12px", color: conf.color, fontWeight: "600" }}>
                          ◉ {conf.label} (R² {d.r2.toFixed(2)})
                        </p>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── INSIGHT ── */}
            <div className="insight-box">
              <span className="insight-icon">💡</span>
              <p className="insight-texto">
                El <strong>Radar</strong> muestra fortalezas relativas entre tecnologías en 5 dimensiones.
                La vista <strong>Barras</strong> permite comparar directamente el crecimiento y el share de
                mercado. Un <strong>R² alto</strong> indica que Prophet predice con mayor confianza la
                trayectoria de esa tecnología.
              </p>
            </div>
          </>
        )}

      </div>
    </PageLayout>
  );
}