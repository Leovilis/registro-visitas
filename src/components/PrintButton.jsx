import { useRef, useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const PrintButton = ({ formData }) => {
  const componentRef = useRef();
  const [isGenerating, setIsGenerating] = useState(false);

  // Función para imprimir - CORREGIDA
  const handlePrint = () => {
    setIsGenerating(true);
    
    try {
      const printContent = componentRef.current;
      
      if (!printContent) {
        console.error('No se encontró el contenido para imprimir');
        setIsGenerating(false);
        return;
      }

      // HACER VISIBLE EL CONTENIDO TEMPORALMENTE
      const originalStyles = {
        position: printContent.style.position,
        left: printContent.style.left,
        visibility: printContent.style.visibility,
        zIndex: printContent.style.zIndex
      };

      // Hacer visible para captura
      printContent.style.position = 'static';
      printContent.style.left = 'auto';
      printContent.style.visibility = 'visible';
      printContent.style.zIndex = '9999';

      // Esperar un momento para que se renderice
      setTimeout(() => {
        const printStyles = `
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              color: black !important;
              background-color: white !important;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: black !important;
              background: white !important;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
            }
            th, td {
              border: 1px solid black !important;
              padding: 8px;
              text-align: left;
              background-color: white !important;
              color: black !important;
            }
            th {
              font-weight: bold;
            }
            h1, h2, h3, h4 {
              color: black !important;
              margin-bottom: 10px;
            }
            p {
              color: black !important;
              margin-bottom: 5px;
            }
            img {
              max-width: 100%;
              height: auto;
              filter: grayscale(100%);
            }
            @media print {
              body { 
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important;
              }
            }
          </style>
        `;

        const fullHTML = `
          <!DOCTYPE html>
          <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Registro de Visitas</title>
              ${printStyles}
            </head>
            <body>
              ${printContent.innerHTML}
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    setTimeout(function() {
                      window.close();
                    }, 100);
                  }, 1000);
                }
              </script>
            </body>
          </html>
        `;

        // Crear blob y abrir ventana
        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
        
        if (printWindow) {
          printWindow.document.write(fullHTML);
          printWindow.document.close();
        } else {
          // Método alternativo con iframe
          const iframe = document.createElement('iframe');
          iframe.style.position = 'absolute';
          iframe.style.left = '-9999px';
          iframe.style.width = '210mm';
          iframe.style.height = '297mm';
          
          document.body.appendChild(iframe);
          
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          iframeDoc.open();
          iframeDoc.write(fullHTML);
          iframeDoc.close();
          
          setTimeout(() => {
            iframe.contentWindow.print();
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 1000);
          }, 1000);
        }

        // Restaurar estilos originales
        setTimeout(() => {
          printContent.style.position = originalStyles.position;
          printContent.style.left = originalStyles.left;
          printContent.style.visibility = originalStyles.visibility;
          printContent.style.zIndex = originalStyles.zIndex;
          
          URL.revokeObjectURL(url);
          setIsGenerating(false);
        }, 2000);

      }, 100);

    } catch (error) {
      console.error('Error al imprimir:', error);
      alert('Error al imprimir. Por favor, inténtelo de nuevo.');
      setIsGenerating(false);
    }
  };

  // Función para verificar si hay contenido suficiente para múltiples páginas
  const hasMultiplePageContent = () => {
    // Verificar si hay actividades detalladas
    const hasActividades = formData.actividades && formData.actividades.length > 0;
    
    // Verificar si hay documentos entregados
    const hasDocEntregados = formData.documentacion?.entregados && 
      formData.documentacion.entregados.some(doc => doc.nombre);
    
    // Verificar si hay documentos recibidos
    const hasDocRecibidos = formData.documentacion?.recibidos && 
      formData.documentacion.recibidos.some(doc => doc.nombre);
    
    // Verificar si hay firmas
    const hasFirmas = formData.sucursal1?.firma || formData.sucursal2?.firma || 
      formData.documentacion?.firma;
    
    // Contar visitantes
    const visitantesCount = formData.visitantes ? 
      formData.visitantes.filter(v => v.trim() !== '').length : 0;
    
    // Si hay muchas actividades, documentos o visitantes, probablemente necesite más de una página
    return hasActividades && formData.actividades.length > 3 || 
           hasDocEntregados || hasDocRecibidos || 
           visitantesCount > 4 || hasFirmas;
  };

  // Función para detectar páginas vacías en canvas - MEJORADA
  const isPageEmpty = (canvas, startY, height) => {
    const ctx = canvas.getContext('2d');
    
    // Asegurar que los valores estén dentro de los límites del canvas
    const actualStartY = Math.max(0, Math.floor(startY));
    const actualHeight = Math.min(Math.floor(height), canvas.height - actualStartY);
    
    if (actualHeight <= 0) return true;
    
    try {
      const imageData = ctx.getImageData(0, actualStartY, canvas.width, actualHeight);
      const pixels = imageData.data;
      
      // Muestrear píxeles para mejor rendimiento (cada 4 píxeles)
      for (let i = 0; i < pixels.length; i += 16) { // Saltar 4 píxeles (4 * 4 = 16)
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        
        // Si encuentra un píxel que no sea blanco y tenga opacidad, la página no está vacía
        if (a > 128 && (r < 250 || g < 250 || b < 250)) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.warn('Error al verificar página vacía:', error);
      return false; // En caso de error, asumir que no está vacía
    }
  };

  // Función para crear contenido HTML visible para PDF
  const createPrintableContent = () => {
    return `
      <div style="width: 794px; background: white; color: black; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; padding: 20px;">
        <!-- Encabezado -->
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="font-size: 18px; font-weight: bold; margin: 0 0 10px 0; color: black;">
            REGISTRO DE VISITAS
          </h1>
          <p style="font-size: 10px; margin: 0; color: black;">
            Para completar este formulario utilice como referencia el instructivo
            "I-RD-01" disponible en la carpeta Calidad Genéricos/Instructivos
          </p>
        </div>

        <!-- Información básica -->
        <div style="margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
            <tbody>
              <tr>
                <td style="border: 1px solid black; padding: 8px; font-weight: bold; width: 30%; background-color: white; color: black;">
                  EMPRESA A LA QUE VISITA:
                </td>
                <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">
                  ${formData.empresa || ''}
                </td>
                <td style="border: 1px solid black; padding: 8px; font-weight: bold; width: 20%; background-color: white; color: black;">
                  FECHA DE VISITA:
                </td>
                <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">
                  ${formData.fechaVisita || ''}
                </td>
              </tr>
              <tr>
                <td style="border: 1px solid black; padding: 8px; font-weight: bold; background-color: white; color: black;">
                  AREA/S (que realizan la visita):
                </td>
                <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">
                  ${formData.area || ''}
                </td>
                <td style="border: 1px solid black; padding: 8px; font-weight: bold; background-color: white; color: black;">
                  Sucursal o Localidad:
                </td>
                <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">
                  ${formData.sucursal || ''}
                </td>
              </tr>
              <tr>
                <td style="border: 1px solid black; padding: 8px; font-weight: bold; background-color: white; color: black;">
                  Provincia:
                </td>
                <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">
                  ${formData.provincia || ''}
                </td>
                <td style="border: 1px solid black; padding: 8px; font-weight: bold; background-color: white; color: black;">
                  HORARIO DE SALIDA DE ADMINISTRACIÓN:
                </td>
                <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">
                  ${formData.horarioSaludo || ''}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Visitantes -->
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: black;">
            NOMBRE Y APELLIDO: (personas que realizan la visita)
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              ${formData.visitantes ? formData.visitantes.filter(v => v.trim() !== '').map((visitante, index) => `
                <tr>
                  <td style="border: 1px solid black; padding: 8px; width: 20%; font-weight: bold; background-color: white; color: black;">
                    Visitante ${index + 1}:
                  </td>
                  <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">
                    ${visitante}
                  </td>
                </tr>
              `).join('') : ''}
            </tbody>
          </table>
        </div>

        <!-- Actividades realizadas -->
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: black;">
            ACTIVIDADES REALIZADAS
          </h3>
          
          <!-- Sucursal 1 -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
            <thead>
              <tr>
                <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
                  HORARIO DE INGRESO A LA SUCURSAL 1
                </th>
                <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
                  HORARIO DE EGRESO DE LA SUCURSAL 1
                </th>
                <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
                  FIRMA Y ACLARACIÓN DEL RESPONSABLE DE SUCURSAL 1
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid black; padding: 8px; text-align: center; background-color: white; color: black;">
                  ${formData.sucursal1?.ingreso || ''}
                </td>
                <td style="border: 1px solid black; padding: 8px; text-align: center; background-color: white; color: black;">
                  ${formData.sucursal1?.egreso || ''}
                </td>
                <td style="border: 1px solid black; padding: 8px; text-align: center; height: 60px; background-color: white; color: black;">
                  ${formData.sucursal1?.firma ? `<img src="${formData.sucursal1.firma}" style="max-width: 100%; max-height: 50px; filter: grayscale(100%);">` : ''}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Sucursal 2 -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
            <thead>
              <tr>
                <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
                  HORARIO DE INGRESO A LA SUCURSAL 2
                </th>
                <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
                  HORARIO DE EGRESO DE LA SUCURSAL 2
                </th>
                <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
                  FIRMA Y ACLARACIÓN DEL RESPONSABLE DE SUCURSAL 2
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid black; padding: 8px; text-align: center; background-color: white; color: black;">
                  ${formData.sucursal2?.ingreso || ''}
                </td>
                <td style="border: 1px solid black; padding: 8px; text-align: center; background-color: white; color: black;">
                  ${formData.sucursal2?.egreso || ''}
                </td>
                <td style="border: 1px solid black; padding: 8px; text-align: center; height: 60px; background-color: white; color: black;">
                  ${formData.sucursal2?.firma ? `<img src="${formData.sucursal2.firma}" style="max-width: 100%; max-height: 50px; filter: grayscale(100%);">` : ''}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Actividades detalladas -->
          ${formData.actividades && formData.actividades.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
              <thead>
                <tr>
                  <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">HS. INICIO</th>
                  <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">HS. FINALIZACIÓN</th>
                  <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">ÁREA/SECTOR DE LA SUCURSAL</th>
                  <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">DESCRIPCIÓN DE LA ACTIVIDAD</th>
                  <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">¿ACTIVIDAD FINALIZADA? (S/NO)</th>
                </tr>
              </thead>
              <tbody>
                ${formData.actividades.map(actividad => `
                  <tr>
                    <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">${actividad.inicio || ''}</td>
                    <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">${actividad.fin || ''}</td>
                    <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">${actividad.areaSector || ''}</td>
                    <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">${actividad.descripcion || ''}</td>
                    <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">${actividad.finalizada || ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}
        </div>

        <!-- Documentación -->
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: black;">
            DOCUMENTACIÓN
          </h3>
          
          <!-- Firma del responsable -->
          <div style="margin-bottom: 15px;">
            <p style="font-size: 12px; font-weight: bold; margin-bottom: 5px; color: black;">
              FIRMA Y ACLARACIÓN DE LA PERSONA RESPONSABLE DE LA DOCUMENTACIÓN (Manual Administraciones):
            </p>
            <div style="border: 1px solid black; padding: 10px; height: 60px; text-align: center; background-color: white;">
              ${formData.documentacion?.firma ? `<img src="${formData.documentacion.firma}" style="max-width: 100%; max-height: 50px; filter: grayscale(100%);">` : ''}
            </div>
          </div>

          <!-- Documentos entregados -->
          ${formData.documentacion?.entregados && formData.documentacion.entregados.some(doc => doc.nombre) ? `
            <div style="margin-bottom: 15px;">
              <h4 style="font-size: 12px; font-weight: bold; margin-bottom: 5px; color: black;">
                Documentos ENTREGADOS
              </h4>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
                      ESCRIBA EL NOMBRE DEL DOCUMENTO QUE USTED ENTREGA
                    </th>
                    <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
                      FIRMA Y ACLARACIÓN de quien recibió la documentación
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${formData.documentacion.entregados.filter(doc => doc.nombre).map(doc => `
                    <tr>
                      <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">${doc.nombre}</td>
                      <td style="border: 1px solid black; padding: 8px; text-align: center; height: 50px; background-color: white; color: black;">
                        ${doc.firmaRecibio ? `<img src="${doc.firmaRecibio}" style="max-width: 100%; max-height: 40px; filter: grayscale(100%);">` : ''}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          <!-- Documentos recibidos -->
          ${formData.documentacion?.recibidos && formData.documentacion.recibidos.some(doc => doc.nombre) ? `
            <div style="margin-bottom: 15px;">
              <h4 style="font-size: 12px; font-weight: bold; margin-bottom: 5px; color: black;">
                Documentos RECIBIDOS
              </h4>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
                      ESCRIBA EL NOMBRE DEL DOCUMENTO QUE USTED RECIBE
                    </th>
                    <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
                      FIRMA Y ACLARACIÓN de quien recibió la documentación
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${formData.documentacion.recibidos.filter(doc => doc.nombre).map(doc => `
                    <tr>
                      <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">${doc.nombre}</td>
                      <td style="border: 1px solid black; padding: 8px; text-align: center; height: 50px; background-color: white; color: black;">
                        ${doc.firmaRecibio ? `<img src="${doc.firmaRecibio}" style="max-width: 100%; max-height: 40px; filter: grayscale(100%);">` : ''}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
        </div>

        <!-- Horario de llegada -->
        <div style="margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              <tr>
                <td style="border: 1px solid black; padding: 8px; font-weight: bold; width: 40%; background-color: white; color: black;">
                  HORARIO DE LLEGADA A LA ADMINISTRACIÓN:
                </td>
                <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">
                  ${formData.horarioLlegada || ''}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  // Función para generar PDF - SIMPLIFICADA y FUNCIONAL
  const handleSavePDF = async () => {
    setIsGenerating(true);
    try {
      // Crear contenedor temporal completamente visible
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.top = '0';
      tempContainer.style.left = '0';
      tempContainer.style.zIndex = '9999';
      tempContainer.style.background = 'white';
      tempContainer.innerHTML = createPrintableContent();
      
      document.body.appendChild(tempContainer);

      // Esperar a que las imágenes se carguen
      const images = tempContainer.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = resolve;
            img.onerror = resolve;
          }
        });
      }));

      // Esperar un poco más para asegurar el renderizado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Capturar con html2canvas
      const canvas = await html2canvas(tempContainer, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: tempContainer.offsetHeight
      });

      // Limpiar contenedor temporal
      document.body.removeChild(tempContainer);

      // Crear PDF simple y directo
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png', 0.9);
      
      // Calcular dimensiones para A4
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Si cabe en una página
      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        // Múltiples páginas
        const pageHeight = pdfHeight;
        const totalPages = Math.ceil(imgHeight / pageHeight);
        
        for (let page = 0; page < totalPages; page++) {
          if (page > 0) pdf.addPage();
          
          const yOffset = -(page * pageHeight);
          pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);
        }
      }

      const fileName = `registro_visitas_${formData.empresa || 'sin_empresa'}_${formData.fechaVisita || 'sin_fecha'}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Inténtelo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        * {
          color: black !important;
        }
        
        button {
          color: white !important;
        }
        
        button:disabled {
          color: #9CA3AF !important;
        }
        
        .bg-blue-500, .bg-blue-600, .bg-green-500, .bg-green-600 {
          color: white !important;
        }

        /* Estilos para firmas táctiles */
        canvas {
          touch-action: none;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={handlePrint}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          style={{ color: 'white' }}
        >
          {isGenerating ? 'Imprimiendo...' : 'Imprimir'}
        </button>
        
        <button
          onClick={handleSavePDF}
          disabled={isGenerating}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
          style={{ color: 'white' }}
        >
          {isGenerating ? 'Generando PDF...' : 'Guardar PDF'}
        </button>
      </div>

      {/* Contenedor para imprimir - MOSTRAR CUANDO SE NECESITE */}
      <div 
        ref={componentRef} 
        className="print-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '210mm',
          backgroundColor: 'white',
          color: 'black',
          padding: '20px',
          fontSize: '12px',
          lineHeight: '1.4',
          visibility: 'hidden'
        }}
      >
        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0', color: 'black' }}>
            REGISTRO DE VISITAS
          </h1>
          <p style={{ fontSize: '10px', margin: '0', color: 'black' }}>
            Para completar este formulario utilice como referencia el instructivo
            "I-RD-01" disponible en la carpeta Calidad Genéricos/Instructivos
          </p>
        </div>

        {/* Información básica */}
        <div style={{ marginBottom: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', width: '30%', backgroundColor: 'white', color: 'black' }}>
                  EMPRESA A LA QUE VISITA:
                </td>
                <td style={{ border: '1px solid black', padding: '8px', backgroundColor: 'white', color: 'black' }}>
                  {formData.empresa || ''}
                </td>
                <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', width: '20%', backgroundColor: 'white', color: 'black' }}>
                  FECHA DE VISITA:
                </td>
                <td style={{ border: '1px solid black', padding: '8px', backgroundColor: 'white', color: 'black' }}>
                  {formData.fechaVisita || ''}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: 'white', color: 'black' }}>
                  AREA/S (que realizan la visita):
                </td>
                <td style={{ border: '1px solid black', padding: '8px', backgroundColor: 'white', color: 'black' }}>
                  {formData.area || ''}
                </td>
                <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: 'white', color: 'black' }}>
                  Sucursal o Localidad:
                </td>
                <td style={{ border: '1px solid black', padding: '8px', backgroundColor: 'white', color: 'black' }}>
                  {formData.sucursal || ''}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: 'white', color: 'black' }}>
                  Provincia:
                </td>
                <td style={{ border: '1px solid black', padding: '8px', backgroundColor: 'white', color: 'black' }}>
                  {formData.provincia || ''}
                </td>
                <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: 'white', color: 'black' }}>
                  HORARIO DE SALIDA DE ADMINISTRACIÓN:
                </td>
                <td style={{ border: '1px solid black', padding: '8px', backgroundColor: 'white', color: 'black' }}>
                  {formData.horarioSaludo || ''}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Visitantes */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: 'black' }}>
            NOMBRE Y APELLIDO: (personas que realizan la visita)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {formData.visitantes && formData.visitantes.filter(v => v.trim() !== '').map((visitante, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid black', padding: '8px', width: '20%', fontWeight: 'bold', backgroundColor: 'white', color: 'black' }}>
                    Visitante {index + 1}:
                  </td>
                  <td style={{ border: '1px solid black', padding: '8px', backgroundColor: 'white', color: 'black' }}>
                    {visitante}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Horarios de sucursales */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: 'black' }}>
            ACTIVIDADES REALIZADAS
          </h3>
          
          {/* Sucursal 1 */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: 'white', color: 'black' }}>
                <th style={{ border: '1px solid black', padding: '8px', fontSize: '10px', backgroundColor: 'white', color: 'black' }}>
                  HORARIO DE INGRESO A LA SUCURSAL 1
                </th>
                <th style={{ border: '1px solid black', padding: '8px', fontSize: '10px', backgroundColor: 'white', color: 'black' }}>
                  HORARIO DE EGRESO DE LA SUCURSAL 1
                </th>
                <th style={{ border: '1px solid black', padding: '8px', fontSize: '10px', backgroundColor: 'white', color: 'black' }}>
                  FIRMA Y ACLARACIÓN DEL RESPONSABLE DE SUCURSAL 1
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center', backgroundColor: 'white', color: 'black' }}>
                  {formData.sucursal1?.ingreso || ''}
                </td>
                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center', backgroundColor: 'white', color: 'black' }}>
                  {formData.sucursal1?.egreso || ''}
                </td>
                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center', height: '60px', backgroundColor: 'white', color: 'black' }}>
                  {formData.sucursal1?.firma && (
                    <img 
                      src={formData.sucursal1.firma} 
                      alt="Firma Sucursal 1" 
                      style={{ maxWidth: '100%', maxHeight: '50px', filter: 'grayscale(100%)' }}
                    />
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Sucursal 2 */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: 'white', color: 'black' }}>
                <th style={{ border: '1px solid black', padding: '8px', fontSize: '10px', backgroundColor: 'white', color: 'black' }}>
                  HORARIO DE INGRESO A LA SUCURSAL 2
                </th>
                <th style={{ border: '1px solid black', padding: '8px', fontSize: '10px', backgroundColor: 'white', color: 'black' }}>
                  HORARIO DE EGRESO DE LA SUCURSAL 2
                </th>
                <th style={{ border: '1px solid black', padding: '8px', fontSize: '10px', backgroundColor: 'white', color: 'black' }}>
                  FIRMA Y ACLARACIÓN DEL RESPONSABLE DE SUCURSAL 2
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center', backgroundColor: 'white', color: 'black' }}>
                  {formData.sucursal2?.ingreso || ''}
                </td>
                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center', backgroundColor: 'white', color: 'black' }}>
                  {formData.sucursal2?.egreso || ''}
                </td>
                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center', height: '60px', backgroundColor: 'white', color: 'black' }}>
                  {formData.sucursal2?.firma && (
                    <img 
                      src={formData.sucursal2.firma} 
                      alt="Firma Sucursal 2" 
                      style={{ maxWidth: '100%', maxHeight: '50px', filter: 'grayscale(100%)' }}
                    />
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Actividades detalladas */}
          {formData.actividades && formData.actividades.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: 'white', color: 'black' }}>
                  <th style={{ border: '1px solid black', padding: '8px', fontSize: '10px', backgroundColor: 'white', color: 'black' }}>HS. INICIO</th>
                  <th style={{ border: '1px solid black', padding: '8px', fontSize: '10px', backgroundColor: 'white', color: 'black' }}>HS. FINALIZACIÓN</th>
                  <th style={{ border: '1px solid black', padding: '8px', fontSize: '10px', backgroundColor: 'white', color: 'black' }}>ÁREA/SECTOR DE LA SUCURSAL</th>
                  <th style={{ border: '1px solid black', padding: '8px', fontSize: '10px', backgroundColor: 'white', color: 'black' }}>DESCRIPCIÓN DE LA ACTIVIDAD</th>
                  <th style={{ border: '1px solid black', padding: '8px', fontSize: '10px', backgroundColor: 'white', color: 'black' }}>¿ACTIVIDAD FINALIZADA? (S/NO)</th>
                </tr>
              </thead>
              <tbody>
                {formData.actividades.map((actividad, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid black', padding: '8px', backgroundColor: 'white', color: 'black' }}>{actividad.inicio || ''}</td>
                    <td style={{ border: '1px solid black', padding: '8px', backgroundColor: 'white', color: 'black' }}>{actividad.fin || ''}</td>
                    <td style={{ border: '1px solid black', padding: '8px', backgroundColor: 'white', color: 'black' }}>{actividad.areaSector || ''}</td>
                    <td style={{ border: '1px solid black', padding: '8px', backgroundColor: 'white', color: 'black' }}>{actividad.descripcion || ''}</td>
                    <td style={{ border: '1px solid black', padding: '8px', backgroundColor: 'white', color: 'black' }}>{actividad.finalizada || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Documentación */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: 'black' }}>
            DOCUMENTACIÓN
          </h3>
          
          {/* Firma del responsable */}
          <div style={{ marginBottom: '15px' }}>
            <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: 'black' }}>
              FIRMA Y ACLARACIÓN DE LA PERSONA RESPONSABLE DE LA DOCUMENTACIÓN (Manual Administraciones):
            </p>
            <div style={{ border: '1px solid black', padding: '10px', height: '60px', textAlign: 'center', backgroundColor: 'white' }}>
              {formData.documentacion?.firma && (
                <img 
                  src={formData.documentacion.firma} 
                  alt="Firma Responsable" 
                  style={{ maxWidth: '100%', maxHeight: '50px', filter: 'grayscale(100%)' }}
                />
              )}
            </div>
          </div>

          {/* Documentos entregados */}
          {formData.documentacion?.entregados && formData.documentacion.entregados.some(doc => doc.nombre) && (
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: 'black' }}>
                Documentos ENTREGADOS
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'white', color: 'black' }}>
                    <th style={{ border: '1px solid black', padding: '8px', fontSize: '10px', backgroundColor: 'white', color: 'black' }}>
                      ESCRIBA EL NOMBRE DEL DOCUMENTO QUE USTED ENTREGA
                    </th>
                    <th style={{ border: '1px solid black', padding: '8px', fontSize: '10px', backgroundColor: 'white', color: 'black' }}>
                      FIRMA Y ACLARACIÓN de quien recibió la documentación
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.documentacion.entregados.filter(doc => doc.nombre).map((doc, index) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid black', padding: '8px', backgroundColor: 'white', color: 'black' }}>{doc.nombre}</td>
                      <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center', height: '50px', backgroundColor: 'white', color: 'black' }}>
                        {doc.firmaRecibio && (
                          <img 
                            src={doc.firmaRecibio} 
                            alt={`Firma recibido ${index}`} 
                            style={{ maxWidth: '100%', maxHeight: '40px', filter: 'grayscale(100%)' }}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Documentos recibidos */}
          {formData.documentacion?.recibidos && formData.documentacion.recibidos.some(doc => doc.nombre) && (
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: 'black' }}>
                Documentos RECIBIDOS
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'white', color: 'black' }}>
                    <th style={{ border: '1px solid black', padding: '8px', fontSize: '10px', backgroundColor: 'white', color: 'black' }}>
                      ESCRIBA EL NOMBRE DEL DOCUMENTO QUE USTED RECIBE
                    </th>
                    <th style={{ border: '1px solid black', padding: '8px', fontSize: '10px', backgroundColor: 'white', color: 'black' }}>
                      FIRMA Y ACLARACIÓN de quien recibió la documentación
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.documentacion.recibidos.filter(doc => doc.nombre).map((doc, index) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid black', padding: '8px', backgroundColor: 'white', color: 'black' }}>{doc.nombre}</td>
                      <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center', height: '50px', backgroundColor: 'white', color: 'black' }}>
                        {doc.firmaRecibio && (
                          <img 
                            src={doc.firmaRecibio} 
                            alt={`Firma recibido ${index}`} 
                            style={{ maxWidth: '100%', maxHeight: '40px', filter: 'grayscale(100%)' }}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Horario de llegada */}
        <div style={{ marginBottom: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', width: '40%', backgroundColor: 'white', color: 'black' }}>
                  HORARIO DE LLEGADA A LA ADMINISTRACIÓN:
                </td>
                <td style={{ border: '1px solid black', padding: '8px', backgroundColor: 'white', color: 'black' }}>
                  {formData.horarioLlegada || ''}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default PrintButton;