// src/components/TablaPreguntas.jsx
import { useEffect, useState } from "react";
import { getTopQuestions } from "../services/api";

const TECNOLOGIAS = ["python", "javascript", "java", "react", "angular"];

export default function TablaPreguntas() {
  const [tag, setTag] = useState("python");
  const [preguntas, setPreguntas] = useState([]);

  useEffect(() => {
    getTopQuestions(tag).then(res => setPreguntas(res.data));
  }, [tag]);

  return (
    <div className="card">
      <h2>⭐ Preguntas mejor valoradas</h2>

      {/* Selector de tag */}
      <select
        value={tag}
        onChange={e => setTag(e.target.value)}
        style={{ padding: "8px", marginBottom: "16px", borderRadius: "8px" }}
      >
        {TECNOLOGIAS.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {/* Tabla */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #333" }}>
            <th style={{ textAlign: "left", padding: "8px" }}>Título</th>
            <th style={{ textAlign: "center", padding: "8px" }}>Score</th>
            <th style={{ textAlign: "center", padding: "8px" }}>Link</th>
          </tr>
        </thead>
        <tbody>
          {preguntas.map(p => (
            <tr key={p.Id} style={{ borderBottom: "1px solid #222" }}>
              <td style={{ padding: "8px" }}>{p.Title}</td>
              <td style={{ textAlign: "center", padding: "8px", color: "#ffd93d" }}>
                {p.Score}
              </td>
              <td style={{ textAlign: "center", padding: "8px" }}>
                <a
                  href={`https://stackoverflow.com/questions/${p.Id}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#00d4ff" }}>
                  Ver →
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}