import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home             from "./pages/Home";
import Top20            from "./pages/Top20";
import SeriesTemporales from "./pages/SeriesTemporales";
import Survey    from "./pages/SurveyEvolution";
import Mercado          from "./pages/MarketIntersection";
import Clasification          from "./pages/Clasification";
import Prediccion       from "./pages/Forecasts";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<Home />}            />
        <Route path="/top20"         element={<Top20 />}           />
        <Route path="/timeseries"    element={<SeriesTemporales />}/>
        <Route path="/survey"    element={<Survey />}/>
        <Route path="/clasificacion" element={<Clasification />}   />
        <Route path="/mercado"       element={<Mercado />}         />
        <Route path="/prediccion"    element={<Prediccion />}      />
      </Routes>
    </BrowserRouter>
  );
}

export default App;