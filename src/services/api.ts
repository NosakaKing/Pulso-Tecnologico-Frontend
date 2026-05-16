const BASE_URL = "http://localhost:8000";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error ${res.status}: ${url}`);
  return res.json();
};

// TOP 20
export const getTop20 = (startYear = null, endYear = null, categoria = null) => {
  const params = new URLSearchParams();
  if (startYear) params.append("start_year", startYear);
  if (endYear)   params.append("end_year",   endYear);
  if (categoria) params.append("categoria", categoria)
  return fetcher(`${BASE_URL}/top20?${params}`);
};

// TIMESERIES — múltiples tags
export const getTimeseries = (tags = []) => {
  const query = tags.map(t => `tags=${encodeURIComponent(t)}`).join("&");
  return fetcher(`${BASE_URL}/tags/timeseries?${query}`);
};

// CLASIFICACIÓN — un tag
export const getClasificacion = (tag: string) =>
  fetcher(`${BASE_URL}/classification/${tag}`);

// CLASIFICACIÓN — comparar varios tags
export const compararTags = (tags = []) => {
  const query = tags.map(t => `tags=${encodeURIComponent(t)}`).join("&");
  return fetcher(`${BASE_URL}/classification/comparar?${query}`);
};

// FORECAST
export const getForecasts = (tags = []) => {
  const query = tags.map(t => `tags=${encodeURIComponent(t)}`).join("&");
  return fetcher(`${BASE_URL}/forecasts?${query}`);
};

// CRUCE MERCADO
export const getCruce = (orden = null, categoria = null) => {
  const params = new URLSearchParams();
  if (orden)     params.append("orden",     orden);
  if (categoria) params.append("categoria", categoria);
  return fetcher(`${BASE_URL}/cruce?${params}`);
};

export const getRecomendaciones = () =>
  fetcher(`${BASE_URL}/cruce/recomendaciones`);

// PREGUNTAS
export const getTopQuestions = (tag: string) =>
  fetcher(`${BASE_URL}/questions/${tag}/top`);

// SURVEY
export const getSurveyEvolucion = (tag: string) =>
  fetcher(`${BASE_URL}/survey/${tag}/evolucion`);

export const getSurveyTodos = (startYear = null, endYear = null) => {
  const params = new URLSearchParams();
  if (startYear) params.append("start_year", startYear);
  if (endYear)   params.append("end_year",   endYear);
  return fetcher(`${BASE_URL}/survey/evolucion?${params}`);
};