// src/agents/draftGenerationAgent.js
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
import { createOpenRouterChatModel } from "../api/chat-openrouter.js";

const model = createOpenRouterChatModel({
  temperature: 0.7,
  modelName: "qwen/qwen3-8b", // Puedes cambiar esto a un modelo de OpenRouter si lo deseas
  apiKey: process.env.REACT_APP_OPENROUTER_API_KEY,
});

const template = `"non-thinking" Eres un abogado experto en {categoria} y debes generar un borrador de documento legal basado en los siguientes detalles del caso:

{detalles_caso}

Estructura el documento de manera formal, con títulos, secciones y cláusulas apropiadas para un documento legal de este tipo.`;

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