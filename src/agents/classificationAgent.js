// src/agents/classificationAgent.js
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
import { createOpenRouterChatModel } from "../api/chat-openrouter.js";

const classificationAgent = async (caseDescription) => {
  try {
    const model = createOpenRouterChatModel({
      modelName: "meta-llama/llama-3-8b-instruct", // Puedes cambiar esto a un modelo de OpenRouter si lo deseas
      apiKey: process.env.REACT_APP_OPENROUTER_API_KEY,
    });


    const promptTemplate = PromptTemplate.fromTemplate(
      `Dado la siguiente descripción del caso:
      {caseDescription}

      Por favor, categoriza este caso en una de las siguientes categorías legales:
      "Contrato de arrendamiento", "Despido laboral", "Reclamación de herencia", "Accidente de tráfico", "Incumplimiento de contrato", "Otro".

      Devuelve solo la categoría legal, sin explicaciones adicionales.
      Formato de salida:
      Categoría: [categoría legal]`
    );

    const chain = new LLMChain({ llm: model, prompt: promptTemplate });

    const result = await chain.call({ caseDescription });

    const category = result.text.replace("Categoría: ", "").trim();

    return { category, error: null };
  } catch (error) {
    console.error("Error al clasificar el caso:", error);
    return { category: null, error: error.message };
  }
};

export default classificationAgent;