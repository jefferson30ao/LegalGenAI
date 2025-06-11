require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch').default; // Importar la exportación por defecto de node-fetch v3+

const app = express();
const PORT = process.env.PROXY_PORT || 3001; // Puerto para el proxy

// Configuración de CORS para permitir solicitudes desde tu frontend
app.use(cors({
  origin: 'http://localhost:3000', // Asegúrate de que coincida con el origen de tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Subscription-Token'], // Permitir el encabezado de la API Key
}));

app.use(express.json()); // Para parsear cuerpos de solicitud JSON

// Endpoint del proxy para SearchAPI.io
app.get('/api/search', async (req, res) => {
  const SEARCH_API_KEY = process.env.REACT_APP_SEARCH_API_KEY;
  const SEARCH_API_BASE_URL = 'https://www.searchapi.io/api/v1/search';

  if (!SEARCH_API_KEY) {
    console.error('Proxy Error: SEARCH_API_KEY no configurada en el servidor proxy.');
    return res.status(500).json({ error: 'SEARCH_API_KEY no configurada en el servidor proxy.' });
  }

  // Construir la URL para la API externa usando los query parameters de la solicitud entrante
  const queryParams = new URLSearchParams(req.query);
  const externalUrl = `${SEARCH_API_BASE_URL}?${queryParams.toString()}`;

  console.log('Proxy: SEARCH_API_KEY (parcial):', SEARCH_API_KEY ? SEARCH_API_KEY.substring(0, 5) + '...' : 'No definida');
  console.log('Proxy: URL externa construida:', externalUrl);

  try {
    const apiRes = await fetch(externalUrl, { // Usar fetch directamente
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SEARCH_API_KEY}`, // Probar con Authorization: Bearer
        'Accept': 'application/json',
      },
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      console.error('Error de la API externa:', apiRes.status, data);
      return res.status(apiRes.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error al reenviar la solicitud al SearchAPI:', error);
    res.status(500).json({ error: 'Error interno del servidor al procesar la búsqueda.' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
  console.log(`Accede al proxy en: http://localhost:${PORT}/api/search`);
});