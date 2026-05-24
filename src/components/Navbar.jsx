// components/Navbar.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import "../styles/NavBar.css";
 

const LINKS = [
  { label: "Inicio",           path: "/"               },
  { label: "Top 20",           path: "/top20"          },
  { label: "Series Temporales",path: "/timeseries"     },
  { label: "Encuestas",    path: "/survey"  },
  { label: "Clasificación",    path: "/clasificacion"  },
  { label: "Mercado",          path: "/mercado"        },
  { label: "Predicción",       path: "/prediccion"     },
];

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo" onClick={() => navigate("/")}>
        <TrendingUp size={20} color="#00d4ff" />
        <span>Pulso <strong>Tecnológico</strong></span>
      </div>

      {/* Links */}
      <div className="navbar-links">
        {LINKS.map(link => (
          <button
            key={link.path}
            className={`navbar-link ${location.pathname === link.path ? "active" : ""}`}
            onClick={() => navigate(link.path)}
          >
            {link.label}
          </button>
        ))}
      </div>
    </nav>
  );
}