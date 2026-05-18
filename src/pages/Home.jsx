import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, BarChart2, Globe,
  ArrowRight, Star
} from "lucide-react";
import { getTop20 } from "../services/api";
import "../styles/Home.css";
import Navbar from "../components/Navbar";



const caracteristicas = [
  {
    icon: <TrendingUp size={32} />,
    titulo: "Tendencias en el tiempo",
    descripcion: "Analiza cómo evolucionan las tecnologías mes a mes desde 2015 hasta 2024 usando datos reales de Stack Overflow.",
    color: "#ff6b35",
  },
  {
    icon: <BarChart2 size={32} />,
    titulo: "Comparación de tecnologías",
    descripcion: "Compara lenguajes, frameworks y bases de datos en el mismo eje temporal para identificar tendencias.",
    color: "#ffd93d",
  },
  {
    icon: <Star size={32} />,
    titulo: "Preguntas mejor valoradas",
    descripcion: "Accede a las preguntas con mayor score de cada tecnología con enlace directo a Stack Overflow.",
    color: "#6bcb77",
  },
  {
    icon: <Globe size={32} />,
    titulo: "Cruce de mercado",
    descripcion: "Cruzamos datos de Stack Overflow con encuestas de desarrolladores para identificar tecnologías con alta demanda real.",
    color: "#00d4ff",
  },
];

const COLORES = ["#00d4ff", "#ff6b35", "#a78bfa", "#6bcb77", "#ffd93d"];

export default function Home() {
  const navigate = useNavigate();
  const [top5, setTop5] = useState([]);
  useEffect(() => {
    getTop20()
      .then(res => setTop5((res.data || []).slice(0, 5)))
      .catch(() => setTop5([]));
  }, []);

  const maxCount = top5.length > 0
    ? Math.max(...top5.map(t => t.count))
    : 1;

  return (
    
    <div className="home-page">
      <Navbar />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <TrendingUp size={14} />
            Stack Overflow · 2015 – 2024
          </div>

          <h1 className="hero-title">
            Pulso <span className="hero-highlight">Tecnológico</span>
          </h1>

          <p className="hero-subtitle">
            Descubre qué tecnologías están dominando el mundo del desarrollo de software.
            Analizamos años de actividad de Stack Overflow para mostrarte
            tendencias reales, no opiniones.
          </p>

          <div className="hero-buttons">
            <button
              className="btn-primary"
              onClick={() => navigate("/dashboard")}
            >
              Ver Dashboard
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* ── TOP 5 VISUAL ── */}
        <div className="hero-visual">
          <div className="visual-card">
            <p className="visual-title">Top 5 Tecnologías · 2015–2024</p>

            {top5.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="visual-bar-row">
                  <span className="visual-bar-label skeleton-text" />
                  <div className="visual-bar-bg">
                    <div className="visual-bar-fill skeleton-bar" />
                  </div>
                </div>
              ))
            ) : (
              top5.map((tec, i) => (
                <div key={i} className="visual-bar-row">
                  <span className="visual-bar-label">{tec.tag}</span>
                  <div className="visual-bar-bg">
                    <div
                      className="visual-bar-fill"
                      style={{
                        width: `${(tec.count / maxCount) * 100}%`,
                        backgroundColor: COLORES[i],
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  </div>
                  <span className="visual-bar-pct">
                    {(tec.count / 1000).toFixed(0)}K
                  </span>
                </div>
              ))
            )}

            <p className="visual-footer">
              Ver ranking completo →{" "}
              <span
                style={{ color: "#00d4ff", cursor: "pointer" }}
                onClick={() => navigate("/top20")}
              >
                Top 20
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ── QUÉ ES ── */}
      <section className="about-section">
        <div className="section-tag">¿Qué es?</div>
        <h2 className="section-title">
          El termómetro real de la industria del software
        </h2>
        <p className="section-desc">
          Stack Overflow es la comunidad de programación más grande del mundo.
          Los picos de preguntas sobre una tecnología indican creciente adopción;
          el declive sostenido señala obsolescencia.
        </p>
        <p className="section-desc">
          <strong>Pulso Tecnológico</strong> analiza el dataset público de Stack Overflow
          para construir un indicador objetivo de la evolución tecnológica,
          cruzado con la encuesta anual de desarrolladores (2017–2024).
        </p>
      </section>

      {/* ── CARACTERÍSTICAS ── */}
      <section className="features-section">
        <div className="section-tag">Funcionalidades</div>
        <h2 className="section-title">Todo lo que puedes analizar</h2>

        <div className="features-grid">
          {caracteristicas.map((f, i) => (
            <div key={i} className="feature-card-home">
              <div
                className="feature-icon-home"
                style={{ color: f.color, backgroundColor: `${f.color}18` }}
              >
                {f.icon}
              </div>
              <h3 className="feature-titulo">{f.titulo}</h3>
              <p className="feature-desc">{f.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <h2 className="cta-title">¿Listo para explorar las tendencias?</h2>
        <p className="cta-desc">
          Accede al dashboard interactivo y descubre qué tecnologías están
          dominando el mercado de software.
        </p>
        <button className="btn-primary" onClick={() => navigate("/dashboard")}>
          Ir al Dashboard
          <ArrowRight size={18} />
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <p>
          Datos:{" "}
          <a
            href="https://www.kaggle.com/datasets/stackoverflow/stacksample"
            target="_blank"
            rel="noreferrer"
          >
            StackSample — Kaggle
          </a>
        </p>
        <p>Desarrollado por el equipo de Pulso Tecnológico · UNIANDES 2025</p>
      </footer>

    </div>
  );
}