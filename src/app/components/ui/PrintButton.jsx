// src/app/components/ui/PrintButton.jsx
'use client';

import { useState } from 'react';
import { generatePDF, generateFileName } from '@/app/utils/pdfGenerator';

export function PrintButton({ viaje, visitaId, onNewViaje }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);

    try {
      // Generar el PDF
      const pdfBlob = await generatePDF(viaje, visitaId);

      // Generar nombre del archivo según el formato requerido
      const fileName = generateFileName(viaje);

      // Crear URL para descargar
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();

      // Limpiar
      URL.revokeObjectURL(url);

      alert(`✅ PDF generado correctamente: ${fileName}`);

      if (onNewViaje && confirm('¿Desea comenzar un nuevo recorrido?')) {
        onNewViaje();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al generar el PDF: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownloadPDF}
      disabled={isGenerating}
      className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm flex items-center justify-center gap-2"
    >
      {isGenerating ? (
        <>
          <span className="animate-spin">⏳</span>
          Generando PDF...
        </>
      ) : (
        <>
          📄 Descargar PDF
        </>
      )}
    </button>
  );
}