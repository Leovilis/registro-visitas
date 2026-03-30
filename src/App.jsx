// import { useState, useEffect } from 'react';
// import SignaturePad from './components/SignaturePad';
// import TimeButton from './components/TimeButton';
// import PrintButton from './components/PrintButton';
// import { empresas, sucursalesPorEmpresa, areas, provincias } from './data';

// function App() {
//   const [formData, setFormData] = useState({
//     empresa: '',
//     fechaVisita: new Date().toISOString().split('T')[0],
//     area: '',
//     sucursal: '',
//     provincia: '',
//     horarioSaludo: '',
//     visitantes: ['', '', '', '', '', ''],
//     sucursal1: {
//       ingreso: '',
//       egreso: '',
//       firma: '',
//     },
//     sucursal2: {
//       ingreso: '',
//       egreso: '',
//       firma: '',
//     },
//     actividades: [
//       {
//         inicio: '',
//         fin: '',
//         areaSector: '',
//         descripcion: '',
//         finalizada: '',
//       },
//     ],
//     documentacion: {
//       firma: '',
//       entregados: [{ nombre: '', firmaRecibio: '' }],
//       recibidos: [{ nombre: '', firmaRecibio: '' }],
//     },
//     horarioLlegada: '',
//   });

//   const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);
//   const [showSignaturePad, setShowSignaturePad] = useState({
//     show: false,
//     field: '',
//   });

//   useEffect(() => {
//     if (formData.empresa) {
//       setSucursalesDisponibles(sucursalesPorEmpresa[formData.empresa] || []);
//       setFormData(prev => ({ ...prev, sucursal: '' }));
//     } else {
//       setSucursalesDisponibles([]);
//     }
//   }, [formData.empresa]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleVisitanteChange = (index, value) => {
//     const newVisitantes = [...formData.visitantes];
//     newVisitantes[index] = value;
//     setFormData(prev => ({ ...prev, visitantes: newVisitantes }));
//   };

//   const handleActividadChange = (index, field, value) => {
//     const newActividades = [...formData.actividades];
//     newActividades[index][field] = value;
//     setFormData(prev => ({ ...prev, actividades: newActividades }));
//   };

//   const addActividad = () => {
//     setFormData(prev => ({
//       ...prev,
//       actividades: [
//         ...prev.actividades,
//         {
//           inicio: '',
//           fin: '',
//           areaSector: '',
//           descripcion: '',
//           finalizada: '',
//         },
//       ],
//     }));
//   };

//   const handleDocumentoChange = (tipo, index, field, value) => {
//     const newDocs = { ...formData.documentacion };
//     newDocs[tipo][index][field] = value;
//     setFormData(prev => ({ ...prev, documentacion: newDocs }));
//   };

//   const addDocumento = (tipo) => {
//     const newDocs = { ...formData.documentacion };
//     newDocs[tipo].push({ nombre: '', firmaRecibio: '' });
//     setFormData(prev => ({ ...prev, documentacion: newDocs }));
//   };

//   const handleSucursalChange = (sucursalNum, field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [`sucursal${sucursalNum}`]: {
//         ...prev[`sucursal${sucursalNum}`],
//         [field]: value,
//       },
//     }));
//   };

//   const handleSaveSignature = (signature) => {
//     if (showSignaturePad.field.includes('sucursal')) {
//       const sucursalNum = showSignaturePad.field.split('-')[1];
//       handleSucursalChange(sucursalNum, 'firma', signature);
//     } else if (showSignaturePad.field.includes('entregado') || showSignaturePad.field.includes('recibido')) {
//       const parts = showSignaturePad.field.split('-');
//       const tipo = parts[0];
//       const index = parseInt(parts[1]);
//       const field = parts[2];

//       const newDocs = { ...formData.documentacion };
//       if (tipo === 'entregado') {
//         newDocs.entregados[index][field] = signature;
//       } else if (tipo === 'recibido') {
//         newDocs.recibidos[index][field] = signature;
//       }
//       setFormData(prev => ({ ...prev, documentacion: newDocs }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         documentacion: {
//           ...prev.documentacion,
//           firma: signature,
//         },
//       }));
//     }
//     setShowSignaturePad({ show: false, field: '' });
//   };

//   const handleSetTime = (field, time) => {
//     if (field.includes('sucursal')) {
//       const parts = field.split('-');
//       const sucursalNum = parts[1];
//       const fieldName = parts[2];
//       handleSucursalChange(sucursalNum, fieldName, time);
//     } else if (field.includes('actividad')) {
//       const parts = field.split('-');
//       const index = parseInt(parts[1]);
//       const fieldName = parts[2];
//       handleActividadChange(index, fieldName, time);
//     } else {
//       setFormData(prev => ({ ...prev, [field]: time }));
//     }
//   };

//   // Función para limpiar el formulario
//   const handleClearForm = () => {
//     if (window.confirm('¿Estás seguro de que quieres limpiar el formulario? Se perderán todos los datos.')) {
//       setFormData({
//         empresa: '',
//         fechaVisita: new Date().toISOString().split('T')[0],
//         area: '',
//         sucursal: '',
//         provincia: '',
//         horarioSaludo: '',
//         visitantes: ['', '', '', '', '', ''],
//         sucursal1: {
//           ingreso: '',
//           egreso: '',
//           firma: '',
//         },
//         sucursal2: {
//           ingreso: '',
//           egreso: '',
//           firma: '',
//         },
//         actividades: [
//           {
//             inicio: '',
//             fin: '',
//             areaSector: '',
//             descripcion: '',
//             finalizada: '',
//           },
//         ],
//         documentacion: {
//           firma: '',
//           entregados: [{ nombre: '', firmaRecibio: '' }],
//           recibidos: [{ nombre: '', firmaRecibio: '' }],
//         },
//         horarioLlegada: '',
//       });
//       alert('Formulario limpiado correctamente');
//     }
//   };

//   // Función para crear nueva planilla
//   const handleNewForm = () => {
//     window.open(window.location.href, '_blank');
//   };

//   return (
//     <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
//       <h1 className="text-2xl font-bold text-gray-800 mb-4">REGISTRO DE VISITA</h1>
//       <p className="text-sm text-gray-600 mb-6">
//         Para completar este formulario utilice como referencia el instructivo "I-RD-01" disponible en la carpeta Calidad Genéricos/Instructivos
//       </p>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//         <div className="space-y-2">
//           <label className="block text-sm font-medium text-gray-700">EMPRESA A LA QUE VISITA:</label>
//           <select
//             name="empresa"
//             value={formData.empresa}
//             onChange={handleChange}
//             className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
//           >
//             <option value="" >Seleccione una empresa</option>
//             {empresas.map(empresa => (
//               <option key={empresa} value={empresa}>{empresa}</option>
//             ))}
//           </select>
//         </div>

//         <div className="space-y-2">
//           <label className="block text-sm font-medium text-gray-700">FECHA DE VISITA:</label>
//           <input
//             type="date"
//             name="fechaVisita"
//             value={formData.fechaVisita}
//             onChange={handleChange}
//             disabled
//             className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
//           />
//         </div>

//         <div className="space-y-2">
//           <label className="block text-sm font-medium text-gray-700">AREA/S (que realizan la visita):</label>
//           <select
//             name="area"
//             value={formData.area}
//             onChange={handleChange}
//             className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//           >
//             <option value="">Seleccione un área</option>
//             {areas.map(area => (
//               <option key={area} value={area}>{area}</option>
//             ))}
//           </select>
//         </div>

//         <div className="space-y-2">
//           <label className="block text-sm font-medium text-gray-700">Sucursal o Localidad:</label>
//           <select
//             name="sucursal"
//             value={formData.sucursal}
//             onChange={handleChange}
//             disabled={!formData.empresa}
//             className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
//           >
//             <option value="">Seleccione una sucursal</option>
//             {sucursalesDisponibles.map(sucursal => (
//               <option key={sucursal} value={sucursal}>{sucursal}</option>
//             ))}
//           </select>
//         </div>

//         <div className="space-y-2">
//           <label className="block text-sm font-medium text-gray-700">Provincia:</label>
//           <select
//             name="provincia"
//             value={formData.provincia}
//             onChange={handleChange}
//             className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//           >
//             <option value="">Seleccione una provincia</option>
//             {provincias.map(provincia => (
//               <option key={provincia} value={provincia}>{provincia}</option>
//             ))}
//           </select>
//         </div>

//         <div className="space-y-2">
//           <label className="block text-sm font-medium text-gray-700">HORARIO DE SALUDA DE ADMINISTRACIÓN:</label>
//           <input
//             type="text"
//             name="horarioSaludo"
//             value={formData.horarioSaludo}
//             onChange={handleChange}
//             className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//           />
//         </div>
//       </div>

//       <div className="mb-6">
//         <label className="block text-sm font-medium text-gray-700 mb-2">NOMBRE Y APELLIDO: (personas que realizan la visita)</label>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//           {formData.visitantes.map((visitante, index) => (
//             <input
//               key={index}
//               type="text"
//               value={visitante}
//               onChange={(e) => handleVisitanteChange(index, e.target.value)}
//               placeholder={`Visitante ${index + 1}`}
//               className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//             />
//           ))}
//         </div>
//       </div>

//       <h2 className="text-xl font-semibold text-gray-800 mb-4">ACTIVIDADES REALIZADAS</h2>

//       <div className="overflow-x-auto mb-6">
//         <table className="min-w-full divide-y divide-gray-200 border border-gray-200 mb-4">
//           <thead className="bg-gray-50">
//             <tr>
//               <th colSpan="2" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">HORARIO DE INGRESO A LA SUCURSAL 1:</th>
//               <th colSpan="2" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">HORARIO DE EGRESO DE LA SUCURSAL 1:</th>
//               <th colSpan="2" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">FIRMA Y ACLARACIÓN DEL RESPONSABLE DE SUCURSAL 1:</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             <tr>
//               <td colSpan="2" className="px-4 py-2 border border-gray-200">
//                 <TimeButton
//                   field="sucursal-1-ingreso"
//                   onSetTime={handleSetTime}
//                   currentTime={formData.sucursal1.ingreso}
//                 />
//               </td>
//               <td colSpan="2" className="px-4 py-2 border border-gray-200">
//                 <TimeButton
//                   field="sucursal-1-egreso"
//                   onSetTime={handleSetTime}
//                   currentTime={formData.sucursal1.egreso}
//                 />
//               </td>
//               <td colSpan="2" className="px-4 py-2 border border-gray-200">
//                 {formData.sucursal1.firma ? (
//                   <img src={formData.sucursal1.firma} alt="Firma" className="max-w-full h-16 mx-auto" />
//                 ) : (
//                   <button
//                     type="button"
//                     onClick={() => setShowSignaturePad({ show: true, field: 'sucursal-1' })}
//                     className="w-full py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
//                   >
//                     Firmar
//                   </button>
//                 )}
//               </td>
//             </tr>
//           </tbody>
//         </table>

//         <table className="min-w-full divide-y divide-gray-200 border border-gray-200 mb-4">
//           <thead className="bg-gray-50">
//             <tr>
//               <th colSpan="2" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">HORARIO OF INGRESO A LA SUCURSAL 2:</th>
//               <th colSpan="2" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">HORARIO OF EGRESO DE LA SUCURSAL 2:</th>
//               <th colSpan="2" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">FIRMA Y ACLARACIÓN DEL RESPONSABLE DE SUCURSAL 2:</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             <tr>
//               <td colSpan="2" className="px-4 py-2 border border-gray-200">
//                 <TimeButton
//                   field="sucursal-2-ingreso"
//                   onSetTime={handleSetTime}
//                   currentTime={formData.sucursal2.ingreso}
//                 />
//               </td>
//               <td colSpan="2" className="px-4 py-2 border border-gray-200">
//                 <TimeButton
//                   field="sucursal-2-egreso"
//                   onSetTime={handleSetTime}
//                   currentTime={formData.sucursal2.egreso}
//                 />
//               </td>
//               <td colSpan="2" className="px-4 py-2 border border-gray-200">
//                 {formData.sucursal2.firma ? (
//                   <img src={formData.sucursal2.firma} alt="Firma" className="max-w-full h-16 mx-auto" />
//                 ) : (
//                   <button
//                     type="button"
//                     onClick={() => setShowSignaturePad({ show: true, field: 'sucursal-2' })}
//                     className="w-full py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
//                   >
//                     Firmar
//                   </button>
//                 )}
//               </td>
//             </tr>
//           </tbody>
//         </table>

//         <table className="min-w-full divide-y divide-gray-200 border border-gray-200 mb-4">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">HS. INICIO</th>
//               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">HS. FINALIZACION</th>
//               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">AREA/SECTOR DE LA SUCURSAL</th>
//               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">DESCRIPCIÓN DE LA ACTIVIDAD</th>
//               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">¿ACTIVIDAD FINALIZADA? (S)/NO)</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {formData.actividades.map((actividad, index) => (
//               <tr key={index}>
//                 <td className="px-4 py-2 border border-gray-200">
//                   <TimeButton
//                     field={`actividad-${index}-inicio`}
//                     onSetTime={handleSetTime}
//                     currentTime={actividad.inicio}
//                   />
//                 </td>
//                 <td className="px-4 py-2 border border-gray-200">
//                   <TimeButton
//                     field={`actividad-${index}-fin`}
//                     onSetTime={handleSetTime}
//                     currentTime={actividad.fin}
//                   />
//                 </td>
//                 <td className="px-4 py-2 border border-gray-200">
//                   <input
//                     type="text"
//                     value={actividad.areaSector}
//                     onChange={(e) => handleActividadChange(index, 'areaSector', e.target.value)}
//                     className="w-full p-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </td>
//                 <td className="px-4 py-2 border border-gray-200">
//                   <input
//                     type="text"
//                     value={actividad.descripcion}
//                     onChange={(e) => handleActividadChange(index, 'descripcion', e.target.value)}
//                     className="w-full p-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </td>
//                 <td className="px-4 py-2 border border-gray-200">
//                   <select
//                     value={actividad.finalizada}
//                     onChange={(e) => handleActividadChange(index, 'finalizada', e.target.value)}
//                     className="w-full p-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
//                   >
//                     <option value="">-</option>
//                     <option value="SI">SI</option>
//                     <option value="NO">NO</option>
//                   </select>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <button
//           type="button"
//           onClick={addActividad}
//           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
//         >
//           + Agregar Actividad
//         </button>
//       </div>

//       <h2 className="text-xl font-semibold text-gray-800 mb-4">DOCUMENTACIÓN</h2>

//       <div className="mb-6">
//         <label className="block text-sm font-medium text-gray-700 mb-2">FIRMA Y ACLARACIÓN DE LA PERSONA RESPONSABLE DE LA DOCUMENTACIÓN (Manual Administraciones):</label>
//         <div className="border border-gray-300 rounded p-4 flex justify-center items-center h-24">
//           {formData.documentacion.firma ? (
//             <img src={formData.documentacion.firma} alt="Firma" className="max-w-full h-20" />
//           ) : (
//             <button
//               type="button"
//               onClick={() => setShowSignaturePad({ show: true, field: 'documentacion-firma' })}
//               className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//             >
//               Firmar
//             </button>
//           )}
//         </div>
//       </div>

//       <div className="mb-6">
//         <h3 className="text-lg font-medium text-gray-700 mb-2">Documentos ENTREGADOS</h3>
//         <table className="min-w-full divide-y divide-gray-200 border border-gray-200 mb-4">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">ESCRIBA EL NOMBRE DEL DOCUMENTO QUE USTED ENTREGA</th>
//               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">FIRMA Y ACLARACIÓN de quien recibió la documentación</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {formData.documentacion.entregados.map((doc, index) => (
//               <tr key={`entregado-${index}`}>
//                 <td className="px-4 py-2 border border-gray-200">
//                   <input
//                     type="text"
//                     value={doc.nombre}
//                     onChange={(e) => handleDocumentoChange('entregados', index, 'nombre', e.target.value)}
//                     className="w-full p-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </td>
//                 <td className="px-4 py-2 border border-gray-200">
//                   {doc.firmaRecibio ? (
//                     <img src={doc.firmaRecibio} alt="Firma" className="max-w-full h-16 mx-auto" />
//                   ) : (
//                     <button
//                       type="button"
//                       onClick={() => setShowSignaturePad({ show: true, field: `entregado-${index}-firmaRecibio` })}
//                       className="w-full py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
//                     >
//                       Firmar
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <button
//           type="button"
//           onClick={() => addDocumento('entregados')}
//           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
//         >
//           + Agregar Documento Entregado
//         </button>
//       </div>

//       <div className="mb-6">
//         <h3 className="text-lg font-medium text-gray-700 mb-2">Documentos RECIBIDOS</h3>
//         <table className="min-w-full divide-y divide-gray-200 border border-gray-200 mb-4">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">ESCRIBA EL NOMBRE DEL DOCUMENTO QUE USTED RECIBE</th>
//               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">FIRMA Y ACLARACIÓN de quien recibió la documentación</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {formData.documentacion.recibidos.map((doc, index) => (
//               <tr key={`recibido-${index}`}>
//                 <td className="px-4 py-2 border border-gray-200">
//                   <input
//                     type="text"
//                     value={doc.nombre}
//                     onChange={(e) => handleDocumentoChange('recibidos', index, 'nombre', e.target.value)}
//                     className="w-full p-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </td>
//                 <td className="px-4 py-2 border border-gray-200">
//                   {doc.firmaRecibio ? (
//                     <img src={doc.firmaRecibio} alt="Firma" className="max-w-full h-16 mx-auto" />
//                   ) : (
//                     <button
//                       type="button"
//                       onClick={() => setShowSignaturePad({ show: true, field: `recibido-${index}-firmaRecibio` })}
//                       className="w-full py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
//                     >
//                       Firmar
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <button
//           type="button"
//           onClick={() => addDocumento('recibidos')}
//           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
//         >
//           + Agregar Documento Recibido
//         </button>
//       </div>

//       <div className="mb-6">
//         <label className="block text-sm font-medium text-gray-700 mb-2">HORARIO DE LLEGADA A LA ADMINISTRACIÓN</label>
//         <TimeButton
//           field="horarioLlegada"
//           onSetTime={handleSetTime}
//           currentTime={formData.horarioLlegada}
//         />
//       </div>

//       <div className="flex flex-col sm:flex-row gap-4 mb-6">
//         <PrintButton
//           formData={formData}
//           onClearForm={handleClearForm}
//           onNewForm={handleNewForm}
//         />
//         <button
//           type="button"
//           onClick={() => {
//             const dataStr = JSON.stringify(formData);
//             const dataBlob = new Blob([dataStr], { type: 'application/json' });
//             const dataUrl = URL.createObjectURL(dataBlob);
//             const link = document.createElement('a');
//             link.href = dataUrl;
//             link.download = `registro_visitas_${formData.empresa || 'sin_empresa'}_${formData.fechaVisita || 'sin_fecha'}.json`;
//             link.click();
//             URL.revokeObjectURL(dataUrl);
//           }}
//           className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//         >
//           Guardar en dispositivo
//         </button>
//       </div>

//       {showSignaturePad.show && (
//         <SignaturePad
//           onSave={handleSaveSignature}
//           onCancel={() => setShowSignaturePad({ show: false, field: '' })}
//         />
//       )}
//     </div>
//   );
// }

// export default App;
import { useState, useEffect, useRef, useCallback } from 'react';
import SignaturePad from './components/SignaturePad';
import TimeButton from './components/TimeButton';
import PrintButton from './components/PrintButton';
import { empresas, sucursalesPorEmpresa, areas, provincias } from './data';
import {
  getDefaultFormData,
  saveFormToLocalStorage,
  loadFormFromLocalStorage,
  clearLocalStorageBackup,
  hasSignificantData,
  getFormStats,
  handleDataRecovery,
  AUTO_SAVE_CONFIG
} from './utils';

function App() {
  const [formData, setFormData] = useState(getDefaultFormData());
  const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);
  const [showSignaturePad, setShowSignaturePad] = useState({
    show: false,
    field: '',
  });
  const [isFormSaved, setIsFormSaved] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const autoSaveInterval = useRef(null);
  const isRestoringRef = useRef(false);

  const [showToast, setShowToast] = useState({ show: false, message: '', type: '' });
  const toastTimeout = useRef(null);

  // Función para mostrar notificaciones
  const showNotification = (message, type = 'success') => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setShowToast({ show: true, message, type });
    toastTimeout.current = setTimeout(() => {
      setShowToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Función para guardar manualmente
  const handleManualSave = () => {
    try {
      saveFormToLocalStorage(formData);
      setLastSaveTime(new Date());
      showNotification('✅ Datos guardados correctamente', 'success');
      console.log('Guardado manual realizado');
    } catch (error) {
      console.error('Error al guardar manualmente:', error);
      showNotification('❌ Error al guardar los datos', 'error');
    }
  };

  // Inicializar y recuperar datos guardados
  useEffect(() => {
    const restored = handleDataRecovery(setFormData);
    if (restored) {
      setIsFormSaved(false);
    }

    // Configurar el guardado automático cada 30 segundos
    autoSaveInterval.current = setInterval(() => {
      if (hasSignificantData(formData) && !isFormSaved) {
        saveFormToLocalStorage(formData);
        setLastSaveTime(new Date());
        console.log('Auto-save realizado');
      }
    }, AUTO_SAVE_CONFIG.INTERVAL_MS);

    return () => {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }
    };
  }, []);

  // Guardar automáticamente cuando cambian los datos (debounced)
  useEffect(() => {
    if (!isRestoringRef.current && hasSignificantData(formData) && !isFormSaved) {
      const timer = setTimeout(() => {
        saveFormToLocalStorage(formData);
        setLastSaveTime(new Date());
      }, 2000); // Esperar 2 segundos después del último cambio

      return () => clearTimeout(timer);
    }
  }, [formData, isFormSaved]);

  // Detectar navegación hacia atrás (pageshow event)
  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) {
        // Página cargada desde bfcache (botón atrás/adelante)
        const savedData = loadFormFromLocalStorage();
        if (savedData && hasSignificantData(savedData)) {
          const { savedAt, ...dataToRestore } = savedData;
          isRestoringRef.current = true;
          setFormData(dataToRestore);
          setTimeout(() => {
            isRestoringRef.current = false;
          }, 100);
          console.log('Datos restaurados desde navegación atrás');
        }
      }
    };

    // Prevenir cierre/recarga con datos sin guardar
    const handleBeforeUnload = (e) => {
      if (hasSignificantData(formData) && !isFormSaved) {
        e.preventDefault();
        e.returnValue = 'Tienes datos sin guardar. ¿Estás seguro de que quieres salir?';
        return e.returnValue;
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData, isFormSaved]);

  // Actualizar sucursales cuando cambia la empresa
  useEffect(() => {
    if (formData.empresa) {
      setSucursalesDisponibles(sucursalesPorEmpresa[formData.empresa] || []);
    } else {
      setSucursalesDisponibles([]);
    }
  }, [formData.empresa]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsFormSaved(false);
  };

  const handleVisitanteChange = (index, value) => {
    const newVisitantes = [...formData.visitantes];
    newVisitantes[index] = value;
    setFormData(prev => ({ ...prev, visitantes: newVisitantes }));
    setIsFormSaved(false);
  };

  const handleActividadChange = (index, field, value) => {
    const newActividades = [...formData.actividades];
    newActividades[index][field] = value;
    setFormData(prev => ({ ...prev, actividades: newActividades }));
    setIsFormSaved(false);
  };

  const addActividad = () => {
    setFormData(prev => ({
      ...prev,
      actividades: [
        ...prev.actividades,
        {
          inicio: '',
          fin: '',
          areaSector: '',
          descripcion: '',
          finalizada: '',
        },
      ],
    }));
    setIsFormSaved(false);
  };

  const handleDocumentoChange = (tipo, index, field, value) => {
    const newDocs = { ...formData.documentacion };
    newDocs[tipo][index][field] = value;
    setFormData(prev => ({ ...prev, documentacion: newDocs }));
    setIsFormSaved(false);
  };

  const addDocumento = (tipo) => {
    const newDocs = { ...formData.documentacion };
    newDocs[tipo].push({ nombre: '', firmaRecibio: '' });
    setFormData(prev => ({ ...prev, documentacion: newDocs }));
    setIsFormSaved(false);
  };

  const handleSucursalChange = (sucursalNum, field, value) => {
    setFormData(prev => ({
      ...prev,
      [`sucursal${sucursalNum}`]: {
        ...prev[`sucursal${sucursalNum}`],
        [field]: value,
      },
    }));
    setIsFormSaved(false);
  };

  const handleSaveSignature = (signature) => {
    if (showSignaturePad.field.includes('sucursal')) {
      const sucursalNum = showSignaturePad.field.split('-')[1];
      handleSucursalChange(sucursalNum, 'firma', signature);
    } else if (showSignaturePad.field.includes('entregado') || showSignaturePad.field.includes('recibido')) {
      const parts = showSignaturePad.field.split('-');
      const tipo = parts[0];
      const index = parseInt(parts[1]);
      const field = parts[2];

      const newDocs = { ...formData.documentacion };
      if (tipo === 'entregado') {
        newDocs.entregados[index][field] = signature;
      } else if (tipo === 'recibido') {
        newDocs.recibidos[index][field] = signature;
      }
      setFormData(prev => ({ ...prev, documentacion: newDocs }));
    } else {
      setFormData(prev => ({
        ...prev,
        documentacion: {
          ...prev.documentacion,
          firma: signature,
        },
      }));
    }
    setShowSignaturePad({ show: false, field: '' });
    setIsFormSaved(false);
  };

  const handleSetTime = (field, time) => {
    if (field.includes('sucursal')) {
      const parts = field.split('-');
      const sucursalNum = parts[1];
      const fieldName = parts[2];
      handleSucursalChange(sucursalNum, fieldName, time);
    } else if (field.includes('actividad')) {
      const parts = field.split('-');
      const index = parseInt(parts[1]);
      const fieldName = parts[2];
      handleActividadChange(index, fieldName, time);
    } else {
      setFormData(prev => ({ ...prev, [field]: time }));
    }
    setIsFormSaved(false);
  };

  // Función para limpiar el formulario y el backup
  const handleClearForm = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar el formulario? Se perderán todos los datos.')) {
      setFormData(getDefaultFormData());
      clearLocalStorageBackup();
      setIsFormSaved(false);
      alert('Formulario limpiado correctamente');
    }
  };

  // Función para crear nueva planilla
  const handleNewForm = () => {
    window.open(window.location.href, '_blank');
  };

  // Callback cuando se guarda el formulario (desde PrintButton)
  const handleFormSaved = () => {
    setIsFormSaved(true);
    clearLocalStorageBackup(); // Limpiar backup después de guardar exitosamente
    console.log('Formulario marcado como guardado');
  };

  // Obtener estadísticas para debugging (opcional)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const stats = getFormStats(formData);
      console.log('Form Stats:', stats);
    }
  }, [formData]);

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* BOTÓN DE PRUEBA ROJO - DEBE APARECER */}
      <button
        onClick={() => alert('TEST')}
        style={{
          position: 'fixed',
          top: '100px',
          left: '20px',
          zIndex: 99999,
          background: 'red',
          color: 'white',
          padding: '15px 30px',
          borderRadius: '10px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}
      >
        🔴 BOTÓN ROJO DE PRUEBA
      </button>
      {/* Indicador de estado de guardado */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-800">REGISTRO DE VISITA</h1>
        <div className="flex items-center gap-2 text-sm">
          {!isFormSaved && hasSignificantData(formData) && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
              ✏️ Datos no guardados
            </span>
          )}
          {lastSaveTime && (
            <span className="text-gray-500 text-xs">
              Último guardado: {new Date(lastSaveTime).toLocaleTimeString('es-AR')}
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Para completar este formulario utilice como referencia el instructivo "I-RD-01" disponible en la carpeta Calidad Genéricos/Instructivos
      </p>

      {/* Grid responsive para campos básicos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">EMPRESA A LA QUE VISITA:</label>
          <select
            name="empresa"
            value={formData.empresa}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          >
            <option value="">Seleccione una empresa</option>
            {empresas.map(empresa => (
              <option key={empresa} value={empresa}>{empresa}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">FECHA DE VISITA:</label>
          <input
            type="date"
            name="fechaVisita"
            value={formData.fechaVisita}
            onChange={handleChange}
            disabled
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">AREA/S (que realizan la visita):</label>
          <select
            name="area"
            value={formData.area}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccione un área</option>
            {areas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Sucursal o Localidad:</label>
          <select
            name="sucursal"
            value={formData.sucursal}
            onChange={handleChange}
            disabled={!formData.empresa}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">Seleccione una sucursal</option>
            {sucursalesDisponibles.map(sucursal => (
              <option key={sucursal} value={sucursal}>{sucursal}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Provincia:</label>
          <select
            name="provincia"
            value={formData.provincia}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccione una provincia</option>
            {provincias.map(provincia => (
              <option key={provincia} value={provincia}>{provincia}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">HORARIO DE SALIDA DE ADMINISTRACIÓN:</label>
          <TimeButton
            field="horarioSaludo"
            onSetTime={handleSetTime}
            currentTime={formData.horarioSaludo}
          />
        </div>
      </div>

      {/* Visitantes - responsive */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">NOMBRE Y APELLIDO: (personas que realizan la visita)</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {formData.visitantes.map((visitante, index) => (
            <input
              key={index}
              type="text"
              value={visitante}
              onChange={(e) => handleVisitanteChange(index, e.target.value)}
              placeholder={`Visitante ${index + 1}`}
              className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          ))}
        </div>
      </div>

      {/* Actividades realizadas - versión responsive con cards en móvil */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">ACTIVIDADES REALIZADAS</h2>

      {/* Sucursal 1 - responsive */}
      <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-white">
        <h3 className="font-medium text-gray-700 mb-3">Sucursal 1</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">HORARIO DE INGRESO</label>
            <TimeButton
              field="sucursal-1-ingreso"
              onSetTime={handleSetTime}
              currentTime={formData.sucursal1.ingreso}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">HORARIO DE EGRESO</label>
            <TimeButton
              field="sucursal-1-egreso"
              onSetTime={handleSetTime}
              currentTime={formData.sucursal1.egreso}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">FIRMA DEL RESPONSABLE</label>
            {formData.sucursal1.firma ? (
              <img src={formData.sucursal1.firma} alt="Firma" className="max-w-full h-16 border rounded" />
            ) : (
              <button
                type="button"
                onClick={() => setShowSignaturePad({ show: true, field: 'sucursal-1' })}
                className="w-full py-2 px-3 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Firmar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sucursal 2 - responsive */}
      <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-white">
        <h3 className="font-medium text-gray-700 mb-3">Sucursal 2</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">HORARIO DE INGRESO</label>
            <TimeButton
              field="sucursal-2-ingreso"
              onSetTime={handleSetTime}
              currentTime={formData.sucursal2.ingreso}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">HORARIO DE EGRESO</label>
            <TimeButton
              field="sucursal-2-egreso"
              onSetTime={handleSetTime}
              currentTime={formData.sucursal2.egreso}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">FIRMA DEL RESPONSABLE</label>
            {formData.sucursal2.firma ? (
              <img src={formData.sucursal2.firma} alt="Firma" className="max-w-full h-16 border rounded" />
            ) : (
              <button
                type="button"
                onClick={() => setShowSignaturePad({ show: true, field: 'sucursal-2' })}
                className="w-full py-2 px-3 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Firmar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Actividades - responsive con cards en móvil */}
      <div className="space-y-4 mb-6">
        {formData.actividades.map((actividad, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
            <h4 className="font-medium text-gray-700 mb-3">Actividad {index + 1}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">HS. INICIO</label>
                <TimeButton
                  field={`actividad-${index}-inicio`}
                  onSetTime={handleSetTime}
                  currentTime={actividad.inicio}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">HS. FINALIZACIÓN</label>
                <TimeButton
                  field={`actividad-${index}-fin`}
                  onSetTime={handleSetTime}
                  currentTime={actividad.fin}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">AREA/SECTOR</label>
                <input
                  type="text"
                  value={actividad.areaSector}
                  onChange={(e) => handleActividadChange(index, 'areaSector', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Área o sector"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">DESCRIPCIÓN</label>
                <input
                  type="text"
                  value={actividad.descripcion}
                  onChange={(e) => handleActividadChange(index, 'descripcion', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Descripción de la actividad"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">¿FINALIZADA?</label>
                <select
                  value={actividad.finalizada}
                  onChange={(e) => handleActividadChange(index, 'finalizada', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">-</option>
                  <option value="SI">SI</option>
                  <option value="NO">NO</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addActividad}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          + Agregar Actividad
        </button>
      </div>

      {/* Documentación - responsive */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">DOCUMENTACIÓN</h2>

      <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-white">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          FIRMA Y ACLARACIÓN DE LA PERSONA RESPONSABLE DE LA DOCUMENTACIÓN:
        </label>
        <div className="flex justify-center items-center min-h-[80px] border border-dashed border-gray-300 rounded p-4">
          {formData.documentacion.firma ? (
            <img src={formData.documentacion.firma} alt="Firma" className="max-w-full h-20" />
          ) : (
            <button
              type="button"
              onClick={() => setShowSignaturePad({ show: true, field: 'documentacion-firma' })}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Firmar
            </button>
          )}
        </div>
      </div>

      {/* Documentos Entregados - responsive */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Documentos ENTREGADOS</h3>
        <div className="space-y-3">
          {formData.documentacion.entregados.map((doc, index) => (
            <div key={`entregado-${index}`} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">NOMBRE DEL DOCUMENTO</label>
                  <input
                    type="text"
                    value={doc.nombre}
                    onChange={(e) => handleDocumentoChange('entregados', index, 'nombre', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Nombre del documento"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">FIRMA DE QUIEN RECIBE</label>
                  {doc.firmaRecibio ? (
                    <img src={doc.firmaRecibio} alt="Firma" className="max-w-full h-16 border rounded" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowSignaturePad({ show: true, field: `entregado-${index}-firmaRecibio` })}
                      className="w-full py-2 px-3 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Firmar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addDocumento('entregados')}
          className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          + Agregar Documento Entregado
        </button>
      </div>

      {/* Documentos Recibidos - responsive */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Documentos RECIBIDOS</h3>
        <div className="space-y-3">
          {formData.documentacion.recibidos.map((doc, index) => (
            <div key={`recibido-${index}`} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">NOMBRE DEL DOCUMENTO</label>
                  <input
                    type="text"
                    value={doc.nombre}
                    onChange={(e) => handleDocumentoChange('recibidos', index, 'nombre', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Nombre del documento"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">FIRMA DE QUIEN RECIBE</label>
                  {doc.firmaRecibio ? (
                    <img src={doc.firmaRecibio} alt="Firma" className="max-w-full h-16 border rounded" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowSignaturePad({ show: true, field: `recibido-${index}-firmaRecibio` })}
                      className="w-full py-2 px-3 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Firmar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addDocumento('recibidos')}
          className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          + Agregar Documento Recibido
        </button>
      </div>

      <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-white">
        <label className="block text-sm font-medium text-gray-700 mb-2">HORARIO DE LLEGADA A LA ADMINISTRACIÓN</label>
        <TimeButton
          field="horarioLlegada"
          onSetTime={handleSetTime}
          currentTime={formData.horarioLlegada}
        />
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <PrintButton
          formData={formData}
          onClearForm={handleClearForm}
          onNewForm={handleNewForm}
          onFormSaved={handleFormSaved}
        />
        <button
          type="button"
          onClick={() => {
            const dataStr = JSON.stringify(formData);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const dataUrl = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `registro_visitas_${formData.empresa || 'sin_empresa'}_${formData.fechaVisita || 'sin_fecha'}.json`;
            link.click();
            URL.revokeObjectURL(dataUrl);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Guardar en dispositivo
        </button>
      </div>

      {showSignaturePad.show && (
        <SignaturePad
          onSave={handleSaveSignature}
          onCancel={() => setShowSignaturePad({ show: false, field: '' })}
        />
      )}
      {/* Botón sticky con estilo inline */}
      <button
        onClick={handleManualSave}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #0669b3 0%, #368aca 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: '600',
          fontSize: '14px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(6, 105, 179, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        title="Guardar borrador manualmente"
      >
        <span>💾</span>
        <span>Guardar Borrador</span>
      </button>

      {/* Toast notification */}
      {showToast.show && (
        <div className={`toast-notification ${showToast.type}`}>
          {showToast.message}
        </div>
      )}
    </div>
  );
}

export default App;