// import { useRef, useState } from 'react';
// import { jsPDF } from 'jspdf';
// import html2canvas from 'html2canvas';

// const PrintButton = ({ formData, onClearForm, onNewForm }) => {
//   const componentRef = useRef();
//   const [isGenerating, setIsGenerating] = useState(false);

//   // Función para crear el contenido imprimible
//   const createPrintableContent = () => {
//     return `
//       <div style="width: 794px; background: white; color: black; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; padding: 20px;">
//         <!-- Encabezado -->
//         <div style="text-align: center; margin-bottom: 20px;">
//           <h1 style="font-size: 18px; font-weight: bold; margin: 0 0 10px 0; color: black;">
//             REGISTRO DE VISITAS
//           </h1>
//           <p style="font-size: 10px; margin: 0; color: black;">
//             Para completar este formulario utilice como referencia el instructivo
//             "I-RD-01" disponible en la carpeta Calidad Genéricos/Instructivos
//           </p>
//         </div>

//         <!-- Información básica -->
//         <div style="margin-bottom: 20px;">
//           <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
//             <tbody>
//               <tr>
//                 <td style="border: 1px solid black; padding: 8px; font-weight: bold; width: 30%; background-color: white; color: black;">
//                   EMPRESA A LA QUE VISITA:
//                 </td>
//                 <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">
//                   ${formData.empresa || ''}
//                 </td>
//                 <td style="border: 1px solid black; padding: 8px; font-weight: bold; width: 20%; background-color: white; color: black;">
//                   FECHA DE VISITA:
//                 </td>
//                 <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">
//                   ${formData.fechaVisita || ''}
//                 </td>
//               </tr>
//               <tr>
//                 <td style="border: 1px solid black; padding: 8px; font-weight: bold; background-color: white; color: black;">
//                   AREA/S (que realizan la visita):
//                 </td>
//                 <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">
//                   ${formData.area || ''}
//                 </td>
//                 <td style="border: 1px solid black; padding: 8px; font-weight: bold; background-color: white; color: black;">
//                   Sucursal o Localidad:
//                 </td>
//                 <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">
//                   ${formData.sucursal || ''}
//                 </td>
//               </tr>
//               <tr>
//                 <td style="border: 1px solid black; padding: 8px; font-weight: bold; background-color: white; color: black;">
//                   Provincia:
//                 </td>
//                 <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">
//                   ${formData.provincia || ''}
//                 </td>
//                 <td style="border: 1px solid black; padding: 8px; font-weight: bold; background-color: white; color: black;">
//                   HORARIO DE SALIDA DE ADMINISTRACIÓN:
//                 </td>
//                 <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">
//                   ${formData.horarioSaludo || ''}
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         <!-- Visitantes -->
//         <div style="margin-bottom: 20px;">
//           <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: black;">
//             NOMBRE Y APELLIDO: (personas que realizan la visita)
//           </h3>
//           <table style="width: 100%; border-collapse: collapse;">
//             <tbody>
//               ${formData.visitantes ? formData.visitantes.filter(v => v.trim() !== '').map((visitante, index) => `
//                 <tr>
//                   <td style="border: 1px solid black; padding: 8px; width: 20%; font-weight: bold; background-color: white; color: black;">
//                     Visitante ${index + 1}:
//                   </td>
//                   <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">
//                     ${visitante}
//                   </td>
//                 </tr>
//               `).join('') : ''}
//             </tbody>
//           </table>
//         </div>

//         <!-- Actividades realizadas -->
//         <div style="margin-bottom: 20px;">
//           <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: black;">
//             ACTIVIDADES REALIZADAS
//           </h3>
          
//           <!-- Sucursal 1 -->
//           <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
//             <thead>
//               <tr>
//                 <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
//                   HORARIO DE INGRESO A LA SUCURSAL 1
//                 </th>
//                 <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
//                   HORARIO DE EGRESO DE LA SUCURSAL 1
//                 </th>
//                 <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
//                   FIRMA Y ACLARACIÓN DEL RESPONSABLE DE SUCURSAL 1
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td style="border: 1px solid black; padding: 8px; text-align: center; background-color: white; color: black;">
//                   ${formData.sucursal1?.ingreso || ''}
//                 </td>
//                 <td style="border: 1px solid black; padding: '8px'; text-align: center; background-color: white; color: black;">
//                   ${formData.sucursal1?.egreso || ''}
//                 </td>
//                 <td style="border: 1px solid black; padding: 8px; text-align: center; height: 60px; background-color: white; color: black;">
//                   ${formData.sucursal1?.firma ? `<img src="${formData.sucursal1.firma}" style="max-width: 100%; max-height: 50px; filter: grayscale(100%);">` : ''}
//                 </td>
//               </tr>
//             </tbody>
//           </table>

//           <!-- Sucursal 2 -->
//           <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
//             <thead>
//               <tr>
//                 <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
//                   HORARIO DE INGRESO A LA SUCURSAL 2
//                 </th>
//                 <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
//                   HORARIO OF EGRESO DE LA SUCURSAL 2
//                 </th>
//                 <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
//                   FIRMA Y ACLARACIÓN DEL RESPONSABLE DE SUCURSAL 2
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td style="border: 1px solid black; padding: 8px; text-align: center; background-color: white; color: black;">
//                   ${formData.sucursal2?.ingreso || ''}
//                 </td>
//                 <td style="border: 1px solid black; padding: 8px; text-align: center; background-color: white; color: black;">
//                   ${formData.sucursal2?.egreso || ''}
//                 </td>
//                 <td style="border: 1px solid black; padding: 8px; text-align: center; height: 60px; background-color: white; color: black;">
//                   ${formData.sucursal2?.firma ? `<img src="${formData.sucursal2.firma}" style="max-width: 100%; max-height: 50px; filter: grayscale(100%);">` : ''}
//                 </td>
//               </tr>
//             </tbody>
//           </table>

//           <!-- Actividades detalladas -->
//           ${formData.actividades && formData.actividades.length > 0 ? `
//             <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
//               <thead>
//                 <tr>
//                   <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">HS. INICIO</th>
//                   <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">HS. FINALIZACIÓN</th>
//                   <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">ÁREA/SECTOR DE LA SUCURSAL</th>
//                   <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">DESCRIPCIÓN DE LA ACTIVIDAD</th>
//                   <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">¿ACTIVIDAD FINALIZADA? (S/NO)</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${formData.actividades.map(actividad => `
//                   <tr>
//                     <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">${actividad.inicio || ''}</td>
//                     <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">${actividad.fin || ''}</td>
//                     <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">${actividad.areaSector || ''}</td>
//                     <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">${actividad.descripcion || ''}</td>
//                     <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">${actividad.finalizada || ''}</td>
//                   </tr>
//                 `).join('')}
//               </tbody>
//             </table>
//           ` : ''}
//         </div>

//         <!-- Documentación -->
//         <div style="margin-bottom: 20px;">
//           <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: black;">
//             DOCUMENTACIÓN
//           </h3>
          
//           <!-- Firma del responsable -->
//           <div style="margin-bottom: 15px;">
//             <p style="font-size: 12px; font-weight: bold; margin-bottom: 5px; color: black;">
//               FIRMA Y ACLARACIÓN DE LA PERSONA RESPONSABLE DE LA DOCUMENTACIÓN (Manual Administraciones):
//             </p>
//             <div style="border: 1px solid black; padding: 10px; height: 60px; text-align: center; background-color: white;">
//               ${formData.documentacion?.firma ? `<img src="${formData.documentacion.firma}" style="max-width: 100%; max-height: 50px; filter: grayscale(100%);">` : ''}
//             </div>
//           </div>

//           <!-- Documentos entregados -->
//           ${formData.documentacion?.entregados && formData.documentacion.entregados.some(doc => doc.nombre) ? `
//             <div style="margin-bottom: 15px;">
//               <h4 style="font-size: 12px; font-weight: bold; margin-bottom: 5px; color: black;">
//                 Documentos ENTREGADOS
//               </h4>
//               <table style="width: 100%; border-collapse: collapse;">
//                 <thead>
//                   <tr>
//                     <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
//                       ESCRIBA EL NOMBRE DEL DOCUMENTO QUE USTED ENTREGA
//                     </th>
//                     <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
//                       FIRMA Y ACLARACIÓN de quien recibió la documentación
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   ${formData.documentacion.entregados.filter(doc => doc.nombre).map(doc => `
//                     <tr>
//                       <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">${doc.nombre}</td>
//                       <td style="border: 1px solid black; padding: 8px; text-align: center; height: 50px; background-color: white; color: black;">
//                         ${doc.firmaRecibio ? `<img src="${doc.firmaRecibio}" style="max-width: 100%; max-height: 40px; filter: grayscale(100%);">` : ''}
//                       </td>
//                     </tr>
//                   `).join('')}
//                 </tbody>
//               </table>
//             </div>
//           ` : ''}

//           <!-- Documentos recibidos -->
//           ${formData.documentacion?.recibidos && formData.documentacion.recibidos.some(doc => doc.nombre) ? `
//             <div style="margin-bottom: 15px;">
//               <h4 style="font-size: 12px; font-weight: bold; margin-bottom: 5px; color: black;">
//                 Documentos RECIBIDOS
//               </h4>
//               <table style="width: 100%; border-collapse: collapse;">
//                 <thead>
//                   <tr>
//                     <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
//                       ESCRIBA EL NOMBRE DEL DOCUMENTO QUE USTED RECIBE
//                     </th>
//                     <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
//                       FIRMA Y ACLARACIÓN de quien recibió la documentación
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   ${formData.documentacion.recibidos.filter(doc => doc.nombre).map(doc => `
//                     <tr>
//                       <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">${doc.nombre}</td>
//                       <td style="border: 1px solid black; padding: 8px; text-align: center; height: 50px; background-color: white; color: black;">
//                         ${doc.firmaRecibio ? `<img src="${doc.firmaRecibio}" style="max-width: 100%; max-height: 40px; filter: grayscale(100%);">` : ''}
//                       </td>
//                     </tr>
//                   `).join('')}
//                 </tbody>
//               </table>
//             </div>
//           ` : ''}
//         </div>

//         <!-- Horario de llegada -->
//         <div style="margin-bottom: 20px;">
//           <table style="width: 100%; border-collapse: collapse;">
//             <tbody>
//               <tr>
//                 <td style="border: 1px solid black; padding: 8px; font-weight: bold; width: 40%; background-color: white; color: black;">
//                   HORARIO DE LLEGADA A LA ADMINISTRACIÓN:
//                 </td>
//                 <td style="border: 1px solid black; padding: 8px; background-color: white; color: black;">
//                   ${formData.horarioLlegada || ''}
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>
//     `;
//   };

//   // Función para imprimir
//   const handlePrint = () => {
//     setIsGenerating(true);
    
//     try {
//       const printContent = createPrintableContent();
      
//       const printStyles = `
//         <style>
//           @page { 
//             size: A4; 
//             margin: 10mm; 
//           }
//           * { 
//             margin: 0; 
//             padding: 0; 
//             box-sizing: border-box; 
//             color: black !important; 
//             background-color: white !important; 
//           }
//           body { 
//             font-family: Arial, sans-serif; 
//             font-size: 12px; 
//             line-height: 1.4; 
//             color: black !important; 
//             background: white !important; 
//           }
//           table { 
//             width: 100%; 
//             border-collapse: collapse; 
//             margin-bottom: 10px; 
//           }
//           th, td { 
//             border: 1px solid black !important; 
//             padding: 8px; 
//             text-align: left; 
//             background-color: white !important; 
//             color: black !important; 
//           }
//           th { 
//             font-weight: bold; 
//           }
//           h1, h2, h3, h4 { 
//             color: black !important; 
//             margin-bottom: 10px; 
//           }
//           p { 
//             color: black !important; 
//             margin-bottom: 5px; 
//           }
//           img { 
//             max-width: 100%; 
//             height: auto; 
//             filter: grayscale(100%); 
//           }
//           @media print { 
//             body { 
//               -webkit-print-color-adjust: exact !important; 
//               print-color-adjust: exact !important;
//             } 
//           }
//         </style>
//       `;

//       const fullHTML = `
//         <!DOCTYPE html>
//         <html lang="es">
//           <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>Registro de Visitas</title>
//             ${printStyles}
//           </head>
//           <body>
//             ${printContent}
//             <script>
//               window.onload = function() {
//                 setTimeout(function() {
//                   window.print();
//                   setTimeout(function() {
//                     window.close();
//                   }, 100);
//                 }, 1000);
//               }
//             </script>
//           </body>
//         </html>
//       `;

//       const blob = new Blob([fullHTML], { type: 'text/html' });
//       const url = URL.createObjectURL(blob);
      
//       const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
      
//       if (printWindow) {
//         printWindow.document.write(fullHTML);
//         printWindow.document.close();
//       } else {
//         const iframe = document.createElement('iframe');
//         iframe.style.position = 'absolute';
//         iframe.style.left = '-9999px';
//         iframe.style.width = '210mm';
//         iframe.style.height = '297mm';
        
//         document.body.appendChild(iframe);
        
//         const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
//         iframeDoc.open();
//         iframeDoc.write(fullHTML);
//         iframeDoc.close();
        
//         setTimeout(() => {
//           iframe.contentWindow.print();
//           setTimeout(() => {
//             document.body.removeChild(iframe);
//           }, 1000);
//         }, 1000);
//       }

//       setTimeout(() => {
//         URL.revokeObjectURL(url);
//         setIsGenerating(false);
//       }, 2000);

//     } catch (error) {
//       console.error('Error al imprimir:', error);
//       alert('Error al imprimir. Por favor, inténtelo de nuevo.');
//       setIsGenerating(false);
//     }
//   };

//   // Función para generar PDF
//   const handleSavePDF = async () => {
//     setIsGenerating(true);
//     try {
//       const tempContainer = document.createElement('div');
//       tempContainer.style.position = 'absolute';
//       tempContainer.style.top = '0';
//       tempContainer.style.left = '0';
//       tempContainer.style.zIndex = '9999';
//       tempContainer.style.background = 'white';
//       tempContainer.innerHTML = createPrintableContent();
      
//       document.body.appendChild(tempContainer);

//       // Esperar a que todas las imágenes se carguen
//       const images = tempContainer.querySelectorAll('img');
//       if (images.length > 0) {
//         const imageLoadPromises = Array.from(images).map(img => {
//           // Si la imagen ya está cargada, no esperar
//           if (img.complete && img.naturalHeight !== 0) {
//             return Promise.resolve();
//           }
          
//           return new Promise((resolve, reject) => {
//             img.onload = resolve;
//             img.onerror = resolve; // Resolvemos incluso en error para no bloquear
//             // Timeout para evitar esperas infinitas
//             setTimeout(resolve, 2000);
//           });
//         });
        
//         await Promise.all(imageLoadPromises);
//       }

//       await new Promise(resolve => setTimeout(resolve, 500));

//       const canvas = await html2canvas(tempContainer, {
//         scale: 2, // Aumentamos la escala para mejor calidad
//         useCORS: true,
//         allowTaint: false, // Cambiamos a false para evitar problemas
//         logging: false,
//         backgroundColor: '#ffffff',
//         width: 794,
//         height: tempContainer.scrollHeight,
//         onclone: (clonedDoc) => {
//           // Asegurar que todos los estilos se apliquen correctamente
//           const allElements = clonedDoc.querySelectorAll('*');
//           allElements.forEach(el => {
//             el.style.boxSizing = 'border-box';
//             el.style.color = 'black';
//             el.style.backgroundColor = 'white';
//           });
//         }
//       });

//       document.body.removeChild(tempContainer);

//       const pdf = new jsPDF({
//         orientation: 'portrait',
//         unit: 'mm',
//         format: 'a4'
//       });

//       const imgData = canvas.toDataURL('image/jpeg', 0.9);
      
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = pdf.internal.pageSize.getHeight();
//       const imgWidth = pdfWidth;
//       const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
//       // Añadir la imagen al PDF
//       pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      
//       // Guardar el PDF
//       const fileName = `registro_visitas_${formData.empresa || 'sin_empresa'}_${formData.fechaVisita || 'sin_fecha'}.pdf`;
//       pdf.save(fileName);
      
//       // Limpiar formulario después de guardar el PDF
//       if (onClearForm) {
//         onClearForm();
//       }
      
//     } catch (error) {
//       console.warn('Advertencia al generar PDF (puede que se haya generado igualmente):', error);
//       // No mostramos alerta para evitar confusión si el PDF se generó correctamente
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   return (
//     <div className="flex justify-center md:justify-start flex-wrap gap-4 mb-6">
//       <button
//         onClick={handlePrint}
//         disabled={isGenerating}
//         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
//       >
//         {isGenerating ? 'Imprimiendo...' : 'Imprimir'}
//       </button>
      
//       <button
//         onClick={handleSavePDF}
//         disabled={isGenerating}
//         className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
//       >
//         {isGenerating ? 'Generando PDF...' : 'Guardar PDF'}
//       </button>

//       <button
//         onClick={onNewForm}
//         className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
//       >
//         Nueva Planilla
//       </button>

//       <button
//         onClick={onClearForm}
//         className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
//       >
//         Limpiar Formulario
//       </button>
//     </div>
//   );
// };

// export default PrintButton;
import { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const PrintButton = ({ formData, onClearForm, onNewForm, onValidate, errors }) => {
  const componentRef = useRef();
  const [isGenerating, setIsGenerating] = useState(false);

  // Función para crear el contenido imprimible
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
                <td style="border: 1px solid black; padding: '8px'; text-align: center; background-color: white; color: black;">
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
                  HORARIO OF INGRESO A LA SUCURSAL 2
                </th>
                <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
                  HORARIO OF EGRESO DE LA SUCURSAL 2
                </th>
                <th style="border: 1px solid black; padding: 8px; font-size: 10px; background-color: white; color: black;">
                  FIRMA Y ACLARACIÓN DEL RESPONSABLE OF SUCURSAL 2
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

  // Función para imprimir
  const handlePrint = () => {
    setIsGenerating(true);
    
    try {
      const printContent = createPrintableContent();
      
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
            ${printContent}
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

      const blob = new Blob([fullHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
      
      if (printWindow) {
        printWindow.document.write(fullHTML);
        printWindow.document.close();
      } else {
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

      setTimeout(() => {
        URL.revokeObjectURL(url);
        setIsGenerating(false);
      }, 2000);

    } catch (error) {
      console.error('Error al imprimir:', error);
      alert('Error al imprimir. Por favor, inténtelo de nuevo.');
      setIsGenerating(false);
    }
  };

  // Función para generar PDF
  const handleSavePDF = async () => {
    setIsGenerating(true);
    try {
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.top = '0';
      tempContainer.style.left = '0';
      tempContainer.style.zIndex = '9999';
      tempContainer.style.background = 'white';
      tempContainer.innerHTML = createPrintableContent();
      
      document.body.appendChild(tempContainer);

      // Esperar a que todas las imágenes se carguen
      const images = tempContainer.querySelectorAll('img');
      if (images.length > 0) {
        const imageLoadPromises = Array.from(images).map(img => {
          // Si la imagen ya está cargada, no esperar
          if (img.complete && img.naturalHeight !== 0) {
            return Promise.resolve();
          }
          
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = resolve; // Resolvemos incluso en error para no bloquear
            // Timeout para evitar esperas infinitas
            setTimeout(resolve, 2000);
          });
        });
        
        await Promise.all(imageLoadPromises);
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(tempContainer, {
        scale: 2, // Aumentamos la escala para mejor calidad
        useCORS: true,
        allowTaint: false, // Cambiamos a false para evitar problemas
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: tempContainer.scrollHeight,
        onclone: (clonedDoc) => {
          // Asegurar que todos los estilos se apliquen correctamente
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach(el => {
            el.style.boxSizing = 'border-box';
            el.style.color = 'black';
            el.style.backgroundColor = 'white';
          });
        }
      });

      document.body.removeChild(tempContainer);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Añadir la imagen al PDF
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      
      // Guardar el PDF
      const fileName = `registro_visitas_${formData.empresa || 'sin_empresa'}_${formData.fechaVisita || 'sin_fecha'}.pdf`;
      pdf.save(fileName);
      
      // Limpiar formulario después de guardar el PDF
      if (onClearForm) {
        onClearForm();
      }
      
    } catch (error) {
      console.warn('Advertencia al generar PDF (puede que se haya generado igualmente):', error);
      // No mostramos alerta para evitar confusión si el PDF se generó correctamente
    } finally {
      setIsGenerating(false);
    }
  };

  // Función para manejar la impresión con validación
  const handlePrintWithValidation = () => {
    if (onValidate && !onValidate()) {
      // Si hay errores, no imprimir
      return false;
    }
    handlePrint();
    return true;
  };

  // Función para manejar el guardado de PDF con validación
  const handleSavePDFWithValidation = async () => {
    if (onValidate && !onValidate()) {
      // Si hay errores, no guardar
      return false;
    }
    await handleSavePDF();
    return true;
  };

  return (
    <div className="flex justify-center md:justify-start flex-wrap gap-4 mb-6">
      <button
        onClick={handlePrintWithValidation}
        disabled={isGenerating}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
      >
        {isGenerating ? 'Imprimiendo...' : 'Imprimir'}
      </button>
      
      <button
        onClick={handleSavePDFWithValidation}
        disabled={isGenerating}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
      >
        {isGenerating ? 'Generando PDF...' : 'Guardar PDF'}
      </button>

      <button
        onClick={onNewForm}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
      >
        Nueva Planilla
      </button>

      <button
        onClick={onClearForm}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
      >
        Limpiar Formulario
      </button>
    </div>
  );
};

export default PrintButton;