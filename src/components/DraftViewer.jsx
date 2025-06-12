import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { qaAgent } from '../agents/qaAgent';
import QaAnalysisViewer from './QaAnalysisViewer';

export default function DraftViewer({ content }) {
  const [qaAnalysis, setQaAnalysis] = useState(null);
  const [isLoadingQa, setIsLoadingQa] = useState(false);
  const contentRef = useRef(null); // Usamos useRef nuevamente

  const handleDownloadPdf = async () => {
    if (!contentRef.current) {
      alert("No hay contenido para exportar a PDF.");
      return;
    }

    const element = contentRef.current;
    const canvas = await html2canvas(element, {
      scale: 2, // Aumentar la escala para mejor calidad
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' para portrait, 'mm' para milímetros, 'a4' para tamaño A4

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const margin = 20; // Margen de 20mm en todos los lados
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = pdfHeight - (margin * 2);

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const ratio = contentWidth / imgWidth;
    let currentImgHeight = imgHeight * ratio;

    let heightLeft = currentImgHeight;
    let position = margin; // Posición inicial con margen superior

    pdf.addImage(imgData, 'PNG', margin, position, contentWidth, currentImgHeight);
    heightLeft -= contentHeight;

    while (heightLeft > -contentHeight) { // Ajuste para asegurar que se añada la última parte
      position = heightLeft - currentImgHeight + margin; // Ajuste para el margen superior en nuevas páginas
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, currentImgHeight);
      heightLeft -= contentHeight;
    }

    pdf.save('borrador-legal-final.pdf');
  };

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
      <div className="font-serif text-gray-800 no-print"> {/* Encabezado para no imprimir */}
        <div className="border-b-2 border-gray-200 pb-2 mb-6">
          <h1 className="text-2xl font-bold">Documento Legal Generado</h1>
        </div>
      </div>
      
      <div ref={contentRef} className="font-serif text-gray-800"> {/* Contenido a imprimir */}
        <div className="space-y-4">
          {content ? (
            <div className="whitespace-pre-line">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
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
        <div className="mt-6 text-center no-print"> {/* Botones para no imprimir */}
          <button
            onClick={handleQaReview}
            disabled={isLoadingQa}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-4"
          >
            {isLoadingQa ? 'Revisando...' : 'Revisar Documento (QA)'}
          </button>
          <button
            onClick={handleDownloadPdf}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Exportar PDF
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