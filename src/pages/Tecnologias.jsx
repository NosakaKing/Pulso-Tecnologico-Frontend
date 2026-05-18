import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "../components/Sidebar";
import "../styles/Tecnologias.css";
import "../App.css";

const TECNOLOGIAS = [
  { label: "Python",      color: "#ff6b35", categoria: "Backend"  },
  { label: "JavaScript",  color: "#ffd93d", categoria: "Frontend" },
  { label: "Java",        color: "#6bcb77", categoria: "Backend"  },
  { label: "Reactjs",       color: "#00d4ff", categoria: "Frontend" },
  { label: "Angular",     color: "#ff4444", categoria: "Frontend" },
  { label: "Mysql",         color: "#a78bfa", categoria: "Database" },
  { label: "PHP",         color: "#8892be", categoria: "Backend"  },
  { label: "Swift",       color: "#f05138", categoria: "Mobile"   },
  { label: "R",           color: "#276dc3", categoria: "Data"     },
  { label: "C#",          color: "#e05c2a", categoria: "Systems"  },
  { label: "C++",         color: "#00599c", categoria: "Systems"  },
  { label: "HTML",        color: "#e34f26", categoria: "Frontend" }
];

const CATEGORIAS = ["Todas", "Frontend", "Backend", "Database", "Mobile", "Systems", "Data"];

export default function Tecnologias() {  
  const navigate = useNavigate();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [filtro,    setFiltro]    = useState("Todas");
  const [busqueda,  setBusqueda]  = useState("");

  const tecFiltradas = TECNOLOGIAS.filter(t => {
    const matchCategoria = filtro === "Todas" || t.categoria === filtro;
    const matchBusqueda  = t.label.toLowerCase().includes(busqueda.toLowerCase());
    return matchCategoria && matchBusqueda;
  });

  // ← Solo navegar con state, sin onSelectTag
  const handleSelect = (tec) => {
    navigate("/dashboard", {
      state: { tag: tec.label.toLowerCase() }
    });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        abierto={sidebarAbierto}
        onClose={() => setSidebarAbierto(false)}
      />

      <div className="main-content">
        <div className="top-header">
          <button
            className="btn-hamburguesa"
            onClick={() => setSidebarAbierto(!sidebarAbierto)}
          >
            <Menu size={24} />
          </button>
          PULSO TECNOLÓGICO — STACK OVERFLOW
        </div>

        <div className="tec-page">
          <div className="tec-header">
            <div>
              <h1 className="tec-titulo">Tecnologías</h1>
              <p className="tec-subtitulo">
                Selecciona una tecnología para ver su análisis completo de
                tendencias, series de tiempo y métricas del mercado laboral.
              </p>
            </div>
            <input
              className="tec-buscador"
              placeholder="Buscar tecnología..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>

          <div className="tec-filtros">
            {CATEGORIAS.map(cat => (
              <button
                key={cat}
                className={`tec-filtro-btn ${filtro === cat ? "activo" : ""}`}
                onClick={() => setFiltro(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="tec-grid">
            {tecFiltradas.map((tec, i) => (
              <div
                key={i}
                className="tec-card"
                onClick={() => handleSelect(tec)}
                style={{ "--tec-color": tec.color }}
              >
                <div className="tec-card-dot" style={{ backgroundColor: tec.color }} />
                <span className="tec-card-label">{tec.label}</span>
                <span className="tec-card-categoria">{tec.categoria}</span>
              </div>
            ))}
          </div>

          {tecFiltradas.length === 0 && (
            <div className="tec-empty">
              <p>No se encontraron tecnologías para "{busqueda}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}