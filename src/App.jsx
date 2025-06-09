import { useState } from 'react';
import Chatbot from './components/Chatbot';
import ModalResult from './components/ModalResult';
import DraftViewer from './components/DraftViewer';
import { validateLegalText, generateLegalDocument } from './api/validation';

export default function App() {
  const [step, setStep] = useState('input'); // 'input' | 'result' | 'document'
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [document, setDocument] = useState('');
  const [conversation, setConversation] = useState([]);

  const handleSubmit = async (conversation) => {
    try {
      setIsLoading(true);
      setError('');

      const validationResult = await validateLegalText(conversation);
      const aiMessage = { role: 'assistant', content: validationResult.response };
      const updatedConversation = [...conversation, aiMessage];
      setConversation(updatedConversation);

      // Solo avanzar si es respuesta "suficiente"
      if (validationResult.isValid) {
        const lastUserMessage = conversation
          .filter(msg => msg.role === 'user')
          .pop()?.content || '';

        setInputText(lastUserMessage);
        setResult(validationResult);
        setStep('result');
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
    try {
      setIsLoading(true);
      const { content } = await generateLegalDocument(inputText, result.category);
      setDocument(content);
      setStep('document');
    } catch (err) {
      setError('Error al generar el documento. Por favor intente nuevamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input');
    setInputText('');
    setResult(null);
    setDocument('');
    setError('');
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
            {step === 'input' && (
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
                explanation={result.explanation}
                onContinue={handleGenerateDocument}
                onClose={handleReset}
              />
            )}

            {step === 'document' && <DraftViewer content={document} />}
          </>
        )}
      </div>
    </div>
  );
}