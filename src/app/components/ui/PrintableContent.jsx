// src/app/components/ui/PrintableContent.jsx
'use client';

export function PrintableContent({ recorrido, recorridoId }) {
    return (
        <div className="print-content" style={{ display: 'none' }}>
            <div className="p-8 bg-white" style={{ width: '100%', maxWidth: '210mm', margin: '0 auto' }}>
                {/* Encabezado */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-manzur-primary" style={{ fontSize: '24px' }}>
                        REGISTRO DE VISITAS
                    </h1>
                    <p className="text-sm text-gray-600">
                        Formulario de registro de visitas - {new Date().toLocaleDateString('es-AR')}
                    </p>
                </div>

                {/* Datos del recorrido */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold border-b pb-2 mb-3" style={{ fontSize: '18px' }}>
                        Datos del Recorrido
                    </h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', width: '30%' }}>Visitante:</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{recorrido?.visitante || '-'}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Área:</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{recorrido?.area || '-'}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Fecha del recorrido:</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{recorrido?.fechaRecorrido || '-'}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Hora de salida:</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{recorrido?.horarioSalida || '-'}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Hora de llegada:</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{recorrido?.horarioLlegada || '-'}</td>
                            </tr>
                            {recorrido?.vehiculo && (
                                <tr>
                                    <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Vehículo:</td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{recorrido.vehiculo}</td>
                                </tr>
                            )}
                            {recorrido?.observacionesGenerales && (
                                <tr>
                                    <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Observaciones generales:</td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{recorrido.observacionesGenerales}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Visitas realizadas */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold border-b pb-2 mb-3" style={{ fontSize: '18px' }}>
                        Visitas Realizadas ({recorrido?.visitas?.length || 0})
                    </h2>

                    {recorrido?.visitas?.map((visita, index) => (
                        <div key={visita.id} className="mb-4" style={{ pageBreakInside: 'avoid' }}>
                            <h3 className="font-semibold mb-2" style={{ fontSize: '16px', color: '#0669b3' }}>
                                Visita {index + 1}
                            </h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', width: '30%' }}>Empresa:</td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{visita.empresa || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Sucursal:</td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{visita.sucursal || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Provincia:</td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{visita.provincia || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Hora ingreso:</td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{visita.horarioIngreso || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Hora egreso:</td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{visita.horarioEgreso || '-'}</td>
                                    </tr>

                                    {/* Tareas */}
                                    {visita.tareas && visita.tareas.length > 0 && (
                                        <tr>
                                            <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', verticalAlign: 'top' }}>Tareas realizadas:</td>
                                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                                <ul className="list-none m-0 p-0">
                                                    {visita.tareas.map((tarea, tIndex) => (
                                                        <li key={tarea.id} className="flex items-start gap-2 mb-1">
                                                            <span>{tarea.completada ? '✅' : '⭕'}</span>
                                                            <span>{tarea.descripcion || `Tarea ${tIndex + 1}`}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                        </tr>
                                    )}

                                    {/* Firma */}
                                    {visita.firma && (
                                        <tr>
                                            <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Firma:</td>
                                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                                <img
                                                    src={visita.firma}
                                                    alt="Firma"
                                                    style={{ height: '60px', border: '1px solid #ccc' }}
                                                />
                                            </td>
                                        </tr>
                                    )}

                                    {/* Observaciones de la visita */}
                                    {visita.observaciones && (
                                        <tr>
                                            <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Observaciones:</td>
                                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{visita.observaciones}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>

                {/* Pie de página */}
                <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t">
                    <p>Documento generado el {new Date().toLocaleString('es-AR')}</p>
                    <p>ID de recorrido: {recorridoId}</p>
                </div>
            </div>
        </div>
    );
}

export default PrintableContent;