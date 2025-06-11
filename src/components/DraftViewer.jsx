import { useState } from 'react';
import { qaAgent } from '../agents/qaAgent';
import QaAnalysisViewer from './QaAnalysisViewer';

export default function DraftViewer({ content }) {
  const [qaAnalysis, setQaAnalysis] = useState(null);
  const [isLoadingQa, setIsLoadingQa] = useState(false);

  const handleQaReview = async () => {
    if (!content) {
      alert("No hay documento para revisar.");
      return;
    }
    setIsLoadingQa(true);
    const analysis = await qaAgent(content);
    setQaAnalysis(analysis);
    setIsLoadingQa(false);
  };
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg">
      <div className="font-serif text-gray-800">
        <div className="border-b-2 border-gray-200 pb-2 mb-6">
          <h1 className="text-2xl font-bold">Documento Legal Generado</h1>
        </div>
        
        <div className="space-y-4">
          {content ? (
            <div className="whitespace-pre-line">{content}</div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No hay documento generado aún</p>
            </div>
          )}
        </div>
      </div>
      {content && (
        <div className="mt-6 text-center">
          <button
            onClick={handleQaReview}
            disabled={isLoadingQa}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isLoadingQa ? 'Revisando...' : 'Revisar Documento (QA)'}
          </button>
        </div>
      )}

      {qaAnalysis && (
        <div className="mt-8">
          <QaAnalysisViewer analysis={qaAnalysis} />
        </div>
      )}
    </div>
  );
}