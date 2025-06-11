// src/agents/searchAgent.js
// Agente de Búsqueda/Recuperación de Información Legal

// Importaciones necesarias
// No se requiere LangChain para esta implementación directa de API
// import { LLMChain } from "langchain/chains";
// import { PromptTemplate } from "langchain/prompts";

// Cargar variables de entorno
// require('dotenv').config(); // No es necesario si ya se carga globalmente en el entry point

const SEARCH_API_KEY = process.env.REACT_APP_SEARCH_API_KEY;
const BASE_URL = 'http://localhost:3001/api/search'; // Apuntar al proxy local

// Función mejorada para extraer referencias legales
const extraerReferenciasLegales = (texto) => {
  const referencias = [];
  
  // Detectar leyes, decretos y resoluciones con formato completo
  const normas = texto.match(/(Ley|Decreto Legislativo|Decreto Supremo|Resolución)\s(N°?\s?\d+[-]?\d*[\/]?\d*)/gi) || [];
  normas.forEach(norma => {
    const [tipo, numero] = norma.split(/\s(.+)/);
    referencias.push({
      tipo: tipo.toLowerCase().includes("ley") ? "ley" : tipo.toLowerCase().includes("decreto") ? "decreto" : "resolucion",
      detalle: norma.trim(),
      referencia_completa: `${tipo.trim()} ${numero.trim()}`
    });
  });
  
  // Detectar artículos simples (Artículo 5)
  const articulosSimples = texto.match(/Art(ículo)?\.?\s\d+/gi) || [];
  articulosSimples.forEach(art => referencias.push({
    tipo: "articulo",
    detalle: art.trim()
  }));
  
  // Detectar artículos con referencia (Artículo 5 de la Ley 123)
  const articulosCompletos = texto.match(/Art(ículo)?\.?\s\d+\sde\s(Ley|D\.?L\.?|D\.?S\.?)\sN°?\s?\d+/gi) || [];
  articulosCompletos.forEach(art => referencias.push({
    tipo: "articulo_con_referencia",
    detalle: art.trim(),
    referencia_completa: art.trim()
  }));
  
  // Detectar jurisprudencia (expedientes y sentencias)
  const jurisprudencia = texto.match(/(Exp\.|Expediente|Caso|Sentencia)\sN°?\s?\d+[-]?\d*[\/]?\d*/gi) || [];
  jurisprudencia.forEach(jur => referencias.push({
    tipo: "jurisprudencia",
    detalle: jur.trim(),
    referencia_completa: jur.trim()
  }));
  
  return referencias;
};

class SearchAgent {
  constructor() {
    if (!SEARCH_API_KEY) {
      console.error("SEARCH_API_KEY no está definida en las variables de entorno.");
      throw new Error("SEARCH_API_KEY no configurada.");
    }
  }

  async run(category) {
    if (!category) {
      return {
        resultados: "No se proporcionó una consulta para la búsqueda.",
        fuentes: [],
        referencias_legales: [],
        isLoading: false,
      };
    }

    const terminosJuridicos = category; // Usar exactamente el output del classificationAgent
    const encodedConsulta = encodeURIComponent(terminosJuridicos);
    const url = `${BASE_URL}?q=${encodedConsulta}&engine=google&location=Peru&hl=es&gl=pe&count=3&category=legal`;

    try {
      const res = await fetch(url, {
        headers: {
          'X-Subscription-Token': SEARCH_API_KEY,
          'Accept': 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Error 401: API Key incorrecta o no autorizada.");
        } else if (res.status === 429) {
          throw new Error("Error 429: Límite de uso de la API superado.");
        } else {
          throw new Error(`Error HTTP: ${res.status} - ${res.statusText}`);
        }
      }

      const data = await res.json();
      const organicResults = data.organic_results;

      if (organicResults && organicResults.length > 0) {
        // Procesar y filtrar resultados por relevancia legal
        const resultadosConReferencias = organicResults.map(result => {
          const referencias = extraerReferenciasLegales(`${result.title} ${result.snippet}`);
          return {
            title: result.title,
            link: result.link,
            snippet: result.snippet,
            referencias_legales: referencias,
            relevancia_juridica: referencias.length > 0 ? "alta" : "media"
          };
        });

        // Ordenar por relevancia (primero los que tienen referencias legales)
        const resultadosOrdenados = resultadosConReferencias.sort((a, b) =>
          b.relevancia_juridica.localeCompare(a.relevancia_juridica)
        );

        // Formatear respuesta final
        return {
          resultados: resultadosOrdenados.map(res =>
            `Título: ${res.title}\nResumen: ${res.snippet}\nReferencias: ${res.referencias_legales.map(ref => ref.detalle).join(', ')}`
          ).join('\n\n---\n\n'),
          fuentes: resultadosOrdenados.map(res => ({ title: res.title, link: res.link })),
          referencias_legales: resultadosOrdenados.flatMap(res => res.referencias_legales),
          isLoading: false,
        };
      } else {
        return {
          resultados: "No se encontraron resultados relevantes para su consulta.",
          fuentes: [],
          referencias_legales: [],
          isLoading: false,
        };
      }

    } catch (error) {
      console.error("Error al ejecutar el agente de búsqueda:", error);
      return {
        resultados: `Error al ejecutar la búsqueda: ${error.message}. Por favor, inténtalo de nuevo.`,
        fuentes: [],
        referencias_legales: [],
        isLoading: false,
      };
    }
  }
}

export default SearchAgent;