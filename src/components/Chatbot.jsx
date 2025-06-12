import { useState, useRef, useEffect } from 'react';

export default function Chatbot({ onSubmit, onValidationComplete, conversation, onSendMessage }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100); // Pequeño retardo para asegurar que el DOM se ha actualizado
    return () => clearTimeout(timer);
  }, [conversation]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setError('');
    adjustTextareaHeight();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      setError('Por favor ingrese un caso legal');
      return;
    }

    setIsLoading(true);
    setIsTyping(true);
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
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      if (response.toLowerCase().includes('suficiente')) {
        onValidationComplete();
      }
    } catch (err) {
      setError('Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
              Asistente Legal IA
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isTyping ? 'Escribiendo...' : 'En línea'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-60">
        <div className="max-w-4xl mx-auto space-y-6">
          {conversation.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2m-3-6V0a2 2 0 012-2h4a2 2 0 012 2v2m-6 4h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                ¡Bienvenido al Asistente Legal!
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Describe tu caso legal para comenzar. Haré preguntas para entender mejor tu situación.
              </p>
            </div>
          ) : (
            conversation.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-green-400 to-blue-500 ml-3' 
                      : 'bg-gradient-to-r from-purple-400 to-pink-500 mr-3'
                  }`}>
                    {msg.role === 'user' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className="flex flex-col">
                    <div className={`px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm border ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-300/30 rounded-br-md'
                        : 'bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 border-gray-200/50 dark:border-gray-700/50 rounded-bl-md'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium ${
                          msg.role === 'user' 
                            ? 'text-blue-100' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {msg.role === 'user' ? 'Tú' : 'Asistente Legal'}
                        </span>
                        <span className={`text-xs ${
                          msg.role === 'user' 
                            ? 'text-blue-200' 
                            : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {formatTime(new Date())}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-start space-x-3 max-w-[85%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl rounded-bl-md px-6 py-4 shadow-lg backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 p-4 z-10">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full px-6 py-4 pr-20 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-all duration-200 hover:shadow-xl"
              rows={1}
              placeholder="Escribe tu mensaje aquí... (Shift + Enter para nueva línea)"
              style={{ minHeight: '56px', maxHeight: '120px' }}
              disabled={isLoading}
            />
            
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 bottom-2 w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center group"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2 animate-shake">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}
          
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Presiona Enter para enviar • Shift + Enter para nueva línea
            </p>
          </div>
        </form>
      </div>

    </div>
  );
}