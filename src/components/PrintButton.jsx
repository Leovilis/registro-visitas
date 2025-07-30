import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const PrintButton = ({ formData }) => {
  const componentRef = useRef();
  const [isGenerating, setIsGenerating] = useState(false);

  // Función para imprimir
  const handlePrint = () => {
    setIsGenerating(true);
    
    // Crear una nueva ventana para imprimir
    const printWindow = window.open('', '_blank');
    const printContent = componentRef.current;
    
    if (printContent && printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Registro de Visitas</title>
            <style>
              @page {
                size: A4;
                margin: 10mm;
              }
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: Arial, sans-serif;
                font-size: 12px;
                line-height: 1.4;
                color: black;
                background: white;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 10px;
              }
              th, td {
                border: 1px solid black;
                padding: 8px;
                text-align: left;
                background-color: white;
                color: black;
              }
              th {
                font-weight: bold;
              }
              h1, h2, h3, h4 {
                color: black;
                margin-bottom: 10px;
              }
              p {
                color: black;
                margin-bottom: 5px;
              }
              img {
                max-width: 100%;
                height: auto;
                filter: grayscale(100%);
              }
              @media print {
                body { 
                  -webkit-print-color-adjust: exact; 
                  print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Esperar a que cargue y luego imprimir
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setIsGenerating(false);
      }, 500);
    } else {
      setIsGenerating(false);
    }
  };

  // Función para generar PDF
  const handleSavePDF = async () => {
    setIsGenerating(true);
    try {
      const element = componentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`registro_visitas_${formData.empresa || 'sin_empresa'}_${formData.fechaVisita || 'sin_fecha'}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF');
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
      `}</style>
      
      <div className="flex gap-2">
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

      {/* Contenedor para imprimir con todo el contenido */}
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
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
            REGISTRO DE VISITAS
          </h1>
          <p style={{ fontSize: '10px', margin: '0' }}>
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
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
            NOMBRE Y APELLIDO: (personas que realizan la visita)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {formData.visitantes.filter(v => v.trim() !== '').map((visitante, index) => (
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
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
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
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
            DOCUMENTACIÓN
          </h3>
          
          {/* Firma del responsable */}
          <div style={{ marginBottom: '15px' }}>
            <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>
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
              <h4 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>
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
              <h4 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>
                Documentos RECIBIDOS
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9f9f9' }}>
                    <th style={{ border: '1px solid #ddd', padding: '8px', fontSize: '10px' }}>
                      ESCRIBA EL NOMBRE DEL DOCUMENTO QUE USTED RECIBE
                    </th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', fontSize: '10px' }}>
                      FIRMA Y ACLARACIÓN de quien recibió la documentación
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.documentacion.recibidos.filter(doc => doc.nombre).map((doc, index) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{doc.nombre}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', height: '50px' }}>
                        {doc.firmaRecibio && (
                          <img 
                            src={doc.firmaRecibio} 
                            alt={`Firma recibido ${index}`} 
                            style={{ maxWidth: '100%', maxHeight: '40px' }}
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