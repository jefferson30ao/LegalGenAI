import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
import { createOpenRouterChatModel } from "../api/chat-openrouter.js";

const explanatoryPrompt = PromptTemplate.fromTemplate(
  `Eres un experto legal que genera explicaciones formales y transparentes.
  Basándote en la categoría legal proporcionada y los resultados de la búsqueda,
  construye una justificación clara y formal, indicando referencias legales.

  Categoría Legal: {category}
  Resultados de la Búsqueda: {searchResults}

  Instrucciones:
  1. Utiliza referencias legales (artículos, leyes, jurisprudencia) para respaldar la explicación.
  2. Formatea la respuesta de manera profesional y estructurada.
  3. Sé conciso y preciso en la explicación.
  4. Evita lenguaje ambiguo o jerga innecesaria.

  Explicación:
  `
);

const llm = createOpenRouterChatModel({
  temperature: 0.7,
  modelName: "meta-llama/llama-3-8b-instruct", // Puedes cambiar esto a un modelo de OpenRouter si lo deseas
  apiKey: process.env.REACT_APP_OPENROUTER_API_KEY,
});


const chain = new LLMChain({ llm: llm, prompt: explanatoryPrompt });

export const generateExplanation = async (category, searchResults) => {
  try {
    const response = await chain.call({
      category: category,
      searchResults: searchResults,
    });
    return { explanation: response.text, error: null, isLoading: false };
  } catch (error) {
    console.error("Error al generar la explicación:", error);
    return { explanation: null, error: error.message, isLoading: false };
  }
};