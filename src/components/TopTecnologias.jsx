import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getTopTags } from "../services/api";

export default function TopTecnologias() {
    const [data, setData] = useState([]);

    useEffect(() => {
        getTopTags(20).then(res => setData(res.data));
    }, []);

    return (
        <div className="card">
            <h2>🏆 Top 20 Tecnologías</h2>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data}>
                    <XAxis dataKey="tag" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#00d4ff" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}