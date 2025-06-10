import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import openrouterModel from './openrouter';

export async function validateLegalText(conversation) {
  try {
    const systemMessage = `Eres un asistente legal experto. Evalúa la conversación completa para determinar si tiene suficiente detalle legal.
        Requisitos: fechas, partes involucradas, montos, descripción clara del problema.
        - Si la conversación tiene suficiente información, responde exactamente "suficiente".
        - Si falta información, responde en formato conversacional indicando qué falta.
        Ejemplo: "Para analizar este caso necesito saber las fechas exactas y los nombres de las partes involucradas."`;

    const messages = conversation.map(msg => {
      if (msg.role === 'user') {
        return new HumanMessage(msg.content);
      } else {
        return new AIMessage(msg.content);
      }
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemMessage],
      ["placeholder", "{chat_history}"],
      ["human", "{input}"],
    ]);

    const chain = RunnableSequence.from([
      {
        input: (input) => input.input,
        chat_history: (input) => input.chat_history,
      },
      prompt,
      openrouterModel,
      new StringOutputParser(),
    ]);

    const response = await chain.invoke({
      input: messages[messages.length - 1].content, // Last message is the current input
      chat_history: messages.slice(0, -1), // All but the last message is chat history
    });

    console.log('Respuesta del modelo (cadena):', response);

    return {
      response: response,
      isValid: response.trim().toLowerCase() === "suficiente",
      category: "N/A",
      explanation: response,
      suggestions: []
    };
  } catch (error) {
    console.error('Error al validar texto legal:', error);
    throw error;
  }
}

export async function generateLegalDocument(text, category) {
  // This function is not used in the validation process, so we can leave it as is
  return { document: "Documento generado" };
}