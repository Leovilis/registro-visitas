// src/app/components/ui/PrintButton.jsx
'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export function PrintButton({ viaje, visitaId, onSavePDF, onNewViaje, onClearViaje }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showNotification = (message, isError = false) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      // Clonar el contenido a imprimir
      const printContent = document.querySelector('.print-content');
      if (!printContent) {
        throw new Error('No se encontró contenido para imprimir');
      }

      const originalDisplay = printContent.style.display;
      printContent.style.display = 'block';

      // Generar canvas con html2canvas
      const canvas = await html2canvas(printContent, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      printContent.style.display = originalDisplay;

      // Crear PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.height;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.height;
      }

      // Guardar PDF como blob
      const pdfBlob = pdf.output('blob');

      // Subir a Firebase Storage si hay callback
      if (onSavePDF) {
        await onSavePDF(pdfBlob);
        showNotification('PDF guardado correctamente');
      } else {
        // Descargar localmente
        pdf.save(`visita_${visitaId || 'nueva'}.pdf`);
        showNotification('PDF descargado');
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      showNotification('Error al generar el PDF', true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewViaje = () => {
    if (onNewViaje) {
      onNewViaje();
    }
    showNotification('Nuevo viaje iniciado');
  };

  return (
    <>
      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={generatePDF}
          disabled={isGenerating}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <span className="animate-spin">⏳</span>
              Generando PDF...
            </>
          ) : (
            <>
              📄 Generar PDF
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleNewViaje}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          ➕ Nuevo viaje
        </button>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-20 right-4 z-50 animate-slide-in">
          <div className={`px-4 py-3 rounded-lg shadow-lg text-white ${toastMessage.includes('Error') ? 'bg-red-500' : 'bg-green-500'
            }`}>
            {toastMessage}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

// También exportamos como default
export default PrintButton;