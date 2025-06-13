import { useRef, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { qaAgent } from '../agents/qaAgent';
import QaAnalysisViewer from './QaAnalysisViewer';

export default function DraftViewer({ content }) {
  const [qaAnalysis, setQaAnalysis] = useState(null);
  const [isLoadingQa, setIsLoadingQa] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [ganImage, setGanImage] = useState(null);
  const [isLoadingGan, setIsLoadingGan] = useState(false);
  const [ganError, setGanError] = useState(null);
  const contentRef = useRef(null);

  // useEffect para cargar la imagen GAN, modificado para depuración
  useEffect(() => {
    const loadGanImage = async () => {
      try {
        setIsLoadingGan(true);
        setGanError(null);
        console.log('DraftViewer: [DEBUG] Iniciando carga de imagen GAN (useEffect modificado)');
        const proxyGanUrl = 'http://localhost:3001/api/gan/generate';
        console.log(`DraftViewer: [DEBUG] Fetching GAN image from: ${proxyGanUrl}`);
        const response = await fetch(proxyGanUrl);
        console.log('DraftViewer: [DEBUG] Respuesta de fetch GAN recibida', response);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('DraftViewer: [DEBUG] Error en respuesta GAN:', response.status, errorText);
          const errorData = JSON.parse(errorText || '{}');
          throw new Error(errorData.error || `Error al cargar imagen GAN: ${response.status}`);
        }
        const blob = await response.blob();
        console.log('DraftViewer: [DEBUG] Blob de imagen GAN creado', blob);
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log('DraftViewer: [DEBUG] FileReader onloadend - Data URL:', reader.result ? reader.result.substring(0, 100) + '...' : 'null');
          setGanImage(reader.result);
        }
        reader.onerror = () => {
          console.error('DraftViewer: [DEBUG] FileReader error', reader.error);
          setGanError('Error al leer la imagen con FileReader.');
        }
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('GAN Error [DEBUG]:', error);
        setGanError(error.message);
      } finally {
        setIsLoadingGan(false);
      }
    };
    
    console.log('DraftViewer: [DEBUG] useEffect para GAN se está ejecutando. Llamando a loadGanImage() independientemente de content.');
    loadGanImage(); // Llamar siempre para depurar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Ejecutar solo una vez al montar para esta prueba
 
  const handleDownloadPdf = async () => {
    if (!contentRef.current) {
      alert("No hay contenido para exportar a PDF.");
      return;
    }

    setIsLoadingPdf(true);
    
    try {
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 4,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const margin = 20;
      const contentWidth = pdfWidth - (margin * 2);
      const contentHeight = pdfHeight - (margin * 2);

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = contentWidth / imgWidth;
      let currentImgHeight = imgHeight * ratio;

      let heightLeft = currentImgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, currentImgHeight);
      heightLeft -= contentHeight;

      while (heightLeft > -contentHeight) {
        position = heightLeft - currentImgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, contentWidth, currentImgHeight);
        heightLeft -= contentHeight;
      }

      pdf.save('borrador-legal-final.pdf');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Inténtalo de nuevo.');
    } finally {
      setIsLoadingPdf(false);
    }
  };

  const handleQaReview = async () => {
    if (!content) {
      alert("No hay documento para revisar.");
      return;
    }
    setIsLoadingQa(true);
    try {
      const analysis = await qaAgent(content);
      setQaAnalysis(analysis);
    } catch (error) {
      console.error('Error en análisis QA:', error);
      alert('Error al realizar el análisis. Inténtalo de nuevo.');
    } finally {
      setIsLoadingQa(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 mx-4 mb-4 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm">
      {/* Header moderno */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Documento Legal Generado
          </h1>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>
      </div>
      
      {/* Content area */}
      <div 
        ref={contentRef} 
        className="flex-1 bg-white dark:bg-gray-900 m-6 rounded-xl shadow-inner border border-gray-100 dark:border-gray-700 overflow-y-auto min-h-0 transition-all duration-300 hover:shadow-lg"
      >
        <div className="p-8">
          {content ? (
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({children}) => <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b-2 border-blue-200 dark:border-blue-800">{children}</h1>,
                  h2: ({children}) => <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4">{children}</h2>,
                  h3: ({children}) => <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mt-6 mb-3">{children}</h3>,
                  p: ({children}) => <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{children}</p>,
                  ul: ({children}) => <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">{children}</ol>,
                  blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 py-2 rounded-r-lg">{children}</blockquote>,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mb-6 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xl font-medium mb-2">No hay documento generado aún</p>
              <p className="text-sm opacity-75">El documento aparecerá aquí una vez generado</p>
            </div>
          )}
        </div>
      </div>

      {/* GAN Image section */}
      {content && ganImage && (
        <div className="mt-4 mx-6 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Visualización generada por IA
          </h3>
          <div className="flex justify-center">
            <img
              src={ganImage}
              alt="Visualización generada por GAN"
              className="max-w-full h-auto rounded-lg shadow-inner border border-gray-100 dark:border-gray-600"
            />
          </div>
        </div>
      )}
      {isLoadingGan && (
        <div className="mt-4 mx-6 p-4 text-center text-gray-500 dark:text-gray-400">
          Generando visualización...
        </div>
      )}
      {ganError && (
        <div className="mt-4 mx-6 p-4 text-center text-red-500 dark:text-red-400">
          Error al cargar visualización: {ganError}
        </div>
      )}

      {/* Action buttons */}
      {content && (
        <div className="px-8 py-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleQaReview}
              disabled={isLoadingQa}
              className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-200 flex items-center space-x-2 min-w-[180px]"
            >
              {isLoadingQa ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Revisando...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Revisar Documento</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleDownloadPdf}
              disabled={isLoadingPdf}
              className="group relative px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-emerald-400 disabled:to-emerald-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-200 flex items-center space-x-2 min-w-[180px]"
            >
              {isLoadingPdf ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Exportar PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* QA Analysis section */}
      {qaAnalysis && (
        <div className="mx-6 mb-6 animate-fade-in">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
            <QaAnalysisViewer analysis={qaAnalysis} />
          </div>
        </div>
      )}
    </div>
  );
}