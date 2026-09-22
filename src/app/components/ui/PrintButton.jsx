// src/app/components/ui/PrintButton.jsx
'use client';

// Antes solo descargaba el PDF: nunca lo subía ni finalizaba el recorrido.
// Ahora: valida → genera → descarga → sube + finaliza + actualiza el programa.
// Si falla la subida a Storage, el recorrido se finaliza igual (el PDF se
// puede regenerar). Si falla Firestore (sin señal), sigue en borrador.

import { useState } from 'react';
import { generatePDF, generateFileName } from '@/app/utils/pdfGenerator';

export function PrintButton({ viaje, visitaId, onNewViaje, onValidarPDF, onFinalizar }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);

    try {
      if (onValidarPDF) {
        const resultado = await onValidarPDF();
        if (!resultado.success) return;
      }

      const pdfBlob = await generatePDF(viaje, visitaId);
      const fileName = generateFileName(viaje);

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

      let mensaje = `✅ PDF generado: ${fileName}`;

      if (onFinalizar) {
        try {
          const { programa, avisoStorage } = await onFinalizar(pdfBlob);
          mensaje += '\n✅ Recorrido finalizado y guardado.';
          if (avisoStorage) {
            mensaje += '\n⚠️ El PDF no se subió a la nube (' + avisoStorage + '). Quedó descargado y se puede regenerar desde el recorrido.';
          }
          if (programa?.resumen?.length) {
            mensaje += `\n📋 Programa F-ST-02: ${programa.resumen.length} sucursal(es) actualizada(s).`;
          }
          if (programa?.sinMantenimiento?.length) {
            mensaje += `\n⚠️ No cuentan en el programa porque el mantenimiento no está tildado como finalizado: ${programa.sinMantenimiento
              .map((s) => s.sucursal)
              .join(', ')}.`;
          }
          if (programa?.sinParada?.length) {
            mensaje += `\n⚠️ Sin parada en el programa: ${programa.sinParada
              .map((s) => s.sucursal)
              .join(', ')} (visita fuera de lo planificado).`;
          }
        } catch (error) {
          console.error('Error al finalizar:', error);
          alert(
            `${mensaje}\n\n⚠️ No se pudo subir ni finalizar el recorrido (${error.message}).\n` +
            'El PDF quedó descargado. El recorrido sigue en borrador: volvé a tocar el botón cuando tengas conexión.',
          );
          return; // no ofrecer recorrido nuevo: hay que reintentar este
        }
      }

      alert(mensaje);

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

  const finalizado = viaje?.estado === 'finalizado';

  return (
    <div className="space-y-2">
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
        ) : finalizado ? (
          <>📄 Guardar cambios y regenerar PDF</>
        ) : (
          <>📄 Finalizar y descargar PDF</>
        )}
      </button>
      {finalizado && viaje?.pdfUrl && (
        <a
          href={viaje.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-sm text-manzur-primary hover:underline"
        >
          Ver PDF guardado
        </a>
      )}
    </div>
  );
}