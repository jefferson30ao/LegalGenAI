import React from 'react';

export default function QaAnalysisViewer({ analysis }) {
  if (!analysis) {
    return null;
  }

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-inner mt-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Análisis de Revisión (QA)</h2>
      <div className="whitespace-pre-line text-gray-700">
        {analysis}
      </div>
    </div>
  );
}