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

// Endpoint del proxy para la GAN
app.get('/api/gan/generate', async (req, res) => {
  const GAN_URL = 'http://localhost:8000/generate';

  try {
    console.log(`Proxy GAN: Realizando fetch a ${GAN_URL}`);
    const apiRes = await fetch(GAN_URL);
    console.log(`Proxy GAN: Respuesta recibida de ${GAN_URL}. Status: ${apiRes.status}`);
    console.log('Proxy GAN: Cabeceras de respuesta de la GAN:', JSON.stringify(Object.fromEntries(apiRes.headers.entries()), null, 2));

    if (!apiRes.ok) {
      const errorBody = await apiRes.text();
      console.error(`Error de la GAN (${GAN_URL}):`, apiRes.status, errorBody);
      return res.status(apiRes.status).json({ error: `Error al generar imagen GAN desde ${GAN_URL}`, details: errorBody });
    }

    const imageBuffer = await apiRes.buffer();
    console.log(`Proxy GAN: Buffer de imagen obtenido, tamaño: ${imageBuffer.length}. Estableciendo Content-Type a image/png.`);
    res.set('Content-Type', 'image/png');
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error al conectar con la GAN:', error);
    res.status(500).json({ error: 'Error interno del servidor al conectar con la GAN' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
  console.log(`Endpoints disponibles:`);
  console.log(`- Búsqueda: http://localhost:${PORT}/api/search`);
  console.log(`- GAN: http://localhost:${PORT}/api/gan/generate`);
});