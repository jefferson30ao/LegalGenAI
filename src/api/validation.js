import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.REACT_APP_DEEPSEEK_API_KEY || 'apiiiiiii',
  dangerouslyAllowBrowser: true,
});

export async function validateLegalText(conversation) {
  try {
    const messages = [
      {
        role: "system",
        content: `Eres un asistente legal experto. Evalúa la conversación completa para determinar si tiene suficiente detalle legal.
        Requisitos: fechas, partes involucradas, montos, descripción clara del problema.\n
        - Si la conversación tiene suficiente información, responde exactamente "suficiente".\n
        - Si falta información, responde en formato conversacional indicando qué falta.\n
        Ejemplo: "Para analizar este caso necesito saber las fechas exactas y los nombres de las partes involucradas."`
      },
      ...conversation.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ];

    const completion = await openai.chat.completions.create({
      messages,
      model: "deepseek-chat",
    });

    const response = completion.choices[0].message.content;
    console.log('Respuesta del modelo:', response);

    return {
      response,
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