import { ChatOpenAI } from "@langchain/openai";

export function createOpenRouterChatModel({ modelName, apiKey }) {
  return new ChatOpenAI({
    modelName,
    openAIApiKey: apiKey,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "Referer": "https://tu-dominio.com", // O el valor de tu variable de entorno
        "X-Title": "NombreDeTuApp", // O el valor de tu variable de entorno
      },
    }
  });
}