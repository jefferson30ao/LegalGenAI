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
    <div className="max-w-2xl mx-auto p-4 bg-gray-50 rounded-lg shadow">
      <div className="mb-4 space-y-4 min-h-[400px] overflow-y-auto p-4 border-2 border-gray-200 rounded-lg bg-white shadow-inner">
        {conversation.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col mb-4 last:mb-0 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`p-3 rounded-lg max-w-[85%] ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              <p className="font-medium text-xs mb-1 text-gray-500">
                {msg.role === 'user' ? 'Tú' : 'Asistente Legal'}
              </p>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder="Escribe tu mensaje aquí..."
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg text-white font-medium ${isLoading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isLoading ? 'Procesando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}