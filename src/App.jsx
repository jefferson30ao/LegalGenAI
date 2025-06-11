import { useState } from 'react';
import Chatbot from './components/Chatbot';
import ModalResult from './components/ModalResult';
import DraftViewer from './components/DraftViewer';
import { validateLegalText, generateLegalDocument } from './api/validation';
import openrouterModel from './api/openrouter';
import classificationAgent from './agents/classificationAgent';
import SearchAgent from './agents/searchAgent'; // Importar el agente de búsqueda
import { generateExplanation } from './agents/explanatoryAgent';
import generateDraft from './agents/draftGenerationAgent'; // Importar el agente de generación de borrador

export default function App() {
  const [step, setStep] = useState('input'); // 'input' | 'result' | 'draft'
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [conversation, setConversation] = useState([]);
  const [draft, setDraft] = useState(''); // Estado para almacenar el borrador generado

  // Instanciar el SearchAgent
  const searchAgent = new SearchAgent();

  const handleSubmit = async (conversation) => {
    try {
      setIsLoading(true);
      setError('');

      const validationResult = await validateLegalText(conversation);
      console.log('Validation Result:', validationResult); // Añadido para depuración
      const aiMessage = { role: 'assistant', content: validationResult.response };
      const updatedConversation = [...conversation, aiMessage];
      setConversation(updatedConversation);

      // Solo avanzar si es respuesta "suficiente"
      if (validationResult.isValid) {
        const lastUserMessage = conversation
          .filter(msg => msg.role === 'user')
          .pop()?.content || '';

        setInputText(lastUserMessage);

        // Llamar al agente de clasificación
        const classificationResult = await classificationAgent(lastUserMessage);

        // Llamar al agente de búsqueda usando la categoría clasificada
        const searchResults = await searchAgent.run(classificationResult.category);

        // Llamar al agente explicativo, pasando los resultados de la búsqueda
        const explanationResult = await generateExplanation(classificationResult.category, searchResults.resultados);

        // Actualizar el estado con la categoría legal y los resultados de búsqueda
        setResult({
          ...validationResult,
          category: classificationResult.category,
          searchResults: searchResults.resultados, // Guardar los resultados de búsqueda
          searchSources: searchResults.fuentes, // Guardar las fuentes de búsqueda
        });

        setExplanation(explanationResult.explanation);
        // setStep('result'); // Eliminado para mantener el Chatbot visible
      }

      return validationResult.response;
    } catch (err) {
      setError('Error al validar el texto. Por favor intente nuevamente.');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidationComplete = () => {
    setStep('result');
  };

  const handleGenerateDocument = async () => {
    console.log('handleGenerateDocument se ha ejecutado.');
    try {
      setIsLoading(true);
      // Llamar al agente de generación de borrador
      const draftResult = await generateDraft(result.category, inputText);
      setDraft(draftResult);
      setStep('draft'); // Cambiar el estado a 'draft'
    } catch (err) {
      setError('Error al generar el borrador. Por favor intente nuevamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input');
    setInputText('');
    setResult(null);
    setError('');
    setDraft(''); // Limpiar el estado del borrador
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Asistente Legal AI</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {step !== 'document' && step !== 'draft' && ( // Mostrar el Chatbot solo si no estamos en 'document' o 'draft'
              <Chatbot
                onSubmit={handleSubmit}
                onValidationComplete={handleValidationComplete}
                conversation={conversation}
                onSendMessage={setConversation}
              />
            )}
            
            {step === 'result' && result && (
              <ModalResult
                category={result.category}
                explanation={explanation}
                onClose={handleReset}
                onContinue={handleGenerateDocument}
              />
            )}

            {step === 'draft' && <DraftViewer content={draft} />} {/* Mostrar el componente DraftViewer con el borrador */}
          </>
        )}
      </div>
    </div>
  );
}