import { createOpenRouterChatModel } from "./chat-openrouter.js";

const model = createOpenRouterChatModel({
  apiKey: process.env.REACT_APP_OPENROUTER_API_KEY, // Usa la clave de OpenRouter
  modelName: "meta-llama/llama-3-8b-instruct", // Cambia al modelo que quieras
});

export default model;