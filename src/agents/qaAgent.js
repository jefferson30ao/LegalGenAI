import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createOpenRouterChatModel } from '../api/chat-openrouter'; // Importar la función de creación del modelo

const qaAgent = async (draftDocument) => {
    try {
        const model = createOpenRouterChatModel({
            modelName: "mistralai/mistral-7b-instruct-v0.2",
            apiKey: process.env.REACT_APP_OPENROUTER_API_KEY,
        });

        const promptTemplate = PromptTemplate.fromTemplate(
            `Eres un revisor legal experto. Revisa el siguiente borrador de documento legal para detectar incoherencias, omisiones evidentes o lenguaje ambiguo. Proporciona un análisis detallado de los puntos débiles y sugerencias de mejora.

            Borrador del documento:
            {draftDocument}

            Análisis de revisión:`
        );

        const chain = promptTemplate.pipe(model).pipe(new StringOutputParser());

        const result = await chain.invoke({ draftDocument });
        return result;
    } catch (error) {
        console.error("Error en el Agente de Revisión (QA):", error);
        return "Error al revisar el documento.";
    }
};

export { qaAgent };