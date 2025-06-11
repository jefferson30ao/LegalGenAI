// src/agents/draftGenerationAgent.js
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
import { createOpenRouterChatModel } from "../api/chat-openrouter.js";

const model = createOpenRouterChatModel({
  temperature: 0.7,
  modelName: "qwen/qwen3-8b", // Puedes cambiar esto a un modelo de OpenRouter si lo deseas
  apiKey: process.env.REACT_APP_OPENROUTER_API_KEY,
});

const template = `"non-thinking" Eres un abogado experto en {categoria} y debes generar un borrador de documento legal basado en la siguiente conversación del caso:

CONVERSACIÓN:
{detalles_caso}

INSTRUCCIONES:
1. Analiza toda la conversación para extraer los puntos clave
2. Identifica las partes involucradas, hechos relevantes y pretensiones
3. Estructura el documento con:
   - Título formal
   - Preámbulo con datos de las partes
   - Exposición de hechos
   - Fundamentos legales
   - Peticiones o cláusulas específicas
   - Firma y fecha

El documento debe ser profesional, claro y técnicamente preciso.`;

const prompt = new PromptTemplate({
  template: template,
  inputVariables: ["categoria", "detalles_caso"],
});

const chain = new LLMChain({ llm: model, prompt: prompt });

const generateDraft = async (categoria, detalles_caso) => {
  try {
    const response = await chain.call({
      categoria: categoria,
      detalles_caso: detalles_caso,
    });
    return response.text;
  } catch (error) {
    console.error(error);
    return "Error al generar el borrador.";
  }
};

export default generateDraft;