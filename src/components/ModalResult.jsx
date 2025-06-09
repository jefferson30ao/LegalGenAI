import { useEffect } from 'react';

export default function ModalResult({ category, explanation, onContinue, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-gray-800">Resultado del Análisis</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700">Categoría Legal:</h4>
              <p className="text-blue-600 font-medium">{category}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700">Explicación:</h4>
              <p className="text-gray-600">{explanation}</p>
            </div>

            <button
              onClick={onContinue}
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition"
            >
              Generar Documento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}