import {
  Code2,
  TrendingUp,
  GitCompare,
  BarChart2,
  LineChart,
  Activity,
  Settings,
  MessageCircle,
  ExternalLink,
  X
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";

const footerItems = [
  {
    label: "Settings",
    icon: Settings,
    href: "/",
  },
  {
    label: "Support",
    icon: MessageCircle,
    href: "/",
  },
  {
    label: "Stack Overflow",
    icon: ExternalLink,
    href: "https://stackoverflow.com",
  },
];

const navItems = [
  {
    label: "Tecnologías",
    icon: Code2,
    path: "/tecnologias",
  },
  {
    label: "Top 20",
    icon: BarChart2,
    path: "/top20",
  },
  {
    label: "Series",
    icon: TrendingUp,
    path: "/series",
  },
  {
    label: "Survey",
    icon: LineChart,
    path: "/survey",
  },
  {
    label: "Forecasts",
    icon: Activity,
    path: "/forecasts",
  },
  {
    label: "Cruce",
    icon: GitCompare,
    path: "/cruce",
  },
];

export default function Sidebar({ abierto, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {abierto && (
        <div className="overlay" onClick={onClose}></div>
      )}

      <aside className={`sidebar ${abierto ? "abierto" : "cerrado"}`}>

        {/* HEADER */}
        <div className="sidebar-header">

          <div className="sidebar-brand">

            <div className="brand-icon">
              F
            </div>

            <div className="brand-text">
              <span className="brand-name">
                Pulso Tech
              </span>

              <span className="brand-subtitle">
                Stack Overflow
              </span>
            </div>

          </div>

          <button
            className="btn-close-sidebar"
            onClick={onClose}
          >
            <X size={16} />
          </button>

        </div>

        {/* MENU */}
        <div className="nav-section-title">
          MENU
        </div>

        {/* NAV */}
        <nav className="sidebar-nav">

          {navItems.map((item) => {
            const Icon = item.icon;
            const activo =
              location.pathname === item.path;

            return (
              <div
                key={item.path}
                className={`sidebar-item ${
                  activo ? "active" : ""
                }`}
                onClick={() =>
                  handleNav(item.path)
                }
              >
                <div className="sidebar-item-icon">
                  <Icon size={18} />
                </div>

                <span className="sidebar-label">
                  {item.label}
                </span>
              </div>
            );
          })}

        </nav>

        {/* FOOTER */}
        <div className="sidebar-footer">

          {footerItems.map((item, i) => {
            const Icon = item.icon;

            return (
              <a
                key={i}
                href={item.href}
                className="sidebar-item"
                target={
                  item.href?.startsWith("http")
                    ? "_blank"
                    : undefined
                }
                rel="noreferrer"
              >
                <div className="sidebar-item-icon">
                  <Icon size={18} />
                </div>

                <span className="sidebar-label">
                  {item.label}
                </span>
              </a>
            );
          })}

        </div>

      </aside>
    </>
  );
}