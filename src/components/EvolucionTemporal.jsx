import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getTimeseries } from "../services/api";

const TECNOLOGIAS = ["python", "javascript", "java", "react", "angular"];
const COLORES = ["#00d4ff", "#ff6b6b", "#ffd93d", "#6bcb77", "#ff9f43"];

export default function EvolucionTemporal() {
  const [seleccionadas, setSeleccionadas] = useState(["python", "javascript"]);
  const [data, setData] = useState([]);

  useEffect(() => {
    // Obtener datos de todas las tecnologías seleccionadas
    Promise.all(seleccionadas.map(tag => getTimeseries(tag)))
      .then(responses => {
        // Combinar todos los datos en un solo array
        const combinado = {};
        responses.forEach((res, i) => {
          res.data.forEach(punto => {
            if (!combinado[punto.date]) combinado[punto.date] = { date: punto.date };
            combinado[punto.date][seleccionadas[i]] = punto.count;
          });
        });
        setData(Object.values(combinado).sort((a, b) => a.date.localeCompare(b.date)));
      });
  }, [seleccionadas]);

  const toggleTecnologia = (tag) => {
    setSeleccionadas(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="card">
      <h2>📈 Evolución Temporal</h2>

      {/* Selector de tecnologías */}
      <div className="selector">
        {TECNOLOGIAS.map((tag, i) => (
          <button
            key={tag}
            onClick={() => toggleTecnologia(tag)}
            style={{
              backgroundColor: seleccionadas.includes(tag) ? COLORES[i] : "#333",
              color: "white",
              margin: "4px",
              padding: "6px 14px",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer"
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {seleccionadas.map((tag, i) => (
            <Line
              key={tag}
              type="monotone"
              dataKey={tag}
              stroke={COLORES[i]}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}