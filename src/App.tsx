// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Top20 from "./pages/Top20";
// ... resto de imports

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />                    {/* ← una sola vez, arriba de todo */}
      <main className="app-main">   {/* ← padding para que no tape el navbar */}
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/top20"   element={<Top20 />} />
          {/* ... resto de rutas */}
        </Routes>
      </main>
    </BrowserRouter>
  );
}