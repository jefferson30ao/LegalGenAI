import { useState } from 'react';

export default function Chatbot({ onSubmit, onValidationComplete, conversation, onSendMessage }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      setError('Por favor ingrese un caso legal');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const userMessage = { role: 'user', content: input };
      const newConversation = [...conversation, userMessage];

      const response = await onSubmit(newConversation);
      const aiMessage = { role: 'assistant', content: response };

      const updatedConversation = [...newConversation, aiMessage];
      onSendMessage(updatedConversation);
      console.log('Conversación actualizada:', updatedConversation);
      setInput('');

      if (response.toLowerCase().includes('suficiente')) {
        onValidationComplete();
      }
    } catch (err) {
      setError('Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full"> {/* Eliminado max-w-3xl mx-auto bg-surface-dark rounded-lg shadow-lg */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background-dark pb-24"> {/* Añadido pb-24 */}
        {conversation.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col mb-4 last:mb-0 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`p-3 max-w-[85%] ${msg.role === 'user' ? 'bg-accent-blue text-white rounded-xl rounded-br-sm' : 'bg-surface-dark text-text-primary-dark rounded-xl rounded-bl-sm'}`}>
              <p className="font-medium text-xs mb-1 text-text-secondary-dark">
                {msg.role === 'user' ? 'Tú' : 'Asistente Legal'}
              </p>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            <p className="text-xs text-text-secondary-dark mt-1">
              {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 p-4 bg-surface-dark shadow-chat-input z-10"> {/* Añadido fixed bottom-0 left-0 right-0 z-10 */}
        <div className="max-w-3xl mx-auto"> {/* Contenedor para centrar el input */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-3 border border-border-dark rounded-lg bg-background-dark text-text-primary-dark focus:ring-2 focus:ring-accent-blue focus:border-accent-blue placeholder-text-secondary-dark resize-none"
            rows={3}
            placeholder="Escribe tu mensaje aquí..."
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className={`mt-4 w-full px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200 ${isLoading ? 'bg-accent-blue bg-opacity-50 cursor-not-allowed' : 'bg-accent-blue hover:bg-blue-500'}`}
          >
            {isLoading ? 'Procesando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
}