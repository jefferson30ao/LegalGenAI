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
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-out">
      <div className="bg-surface-dark rounded-xl shadow-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto transform scale-95 opacity-0 animate-scale-in">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-text-primary-dark">Resultado del Análisis</h3>
            <button
              onClick={onClose}
              className="text-text-secondary-dark hover:text-text-primary-dark transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <h4 className="font-semibold text-text-secondary-dark">Categoría Legal:</h4>
              <p className="text-accent-blue font-semibold text-lg mt-1">{category}</p>
            </div>

            <div>
              <h4 className="font-semibold text-text-secondary-dark">Explicación:</h4>
              <p className="text-text-primary-dark mt-1 border border-accent-purple p-3 rounded-md">{explanation}</p>
            </div>

            <button
              onClick={onContinue}
              className="mt-6 w-full bg-accent-purple hover:bg-purple-500 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium"
            >
              Generar Documento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}