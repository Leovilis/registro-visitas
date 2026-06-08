// src/app/components/forms/VisitForm.jsx
'use client';

import { useState } from 'react';
import { empresas, sucursalesPorEmpresa, provincias } from '@/app/utils/constants';
import { TimeButton } from './TimeButton';
import SignaturePad from '../ui/SignaturePad';  // ✅ Importación corregida
import {
    addTareaToVisita,
    removeTareaFromVisita,
    updateTareaInVisita
} from '@/app/models/recorridoModel';

export function VisitaForm({
    visita,
    index,
    canRemove,
    onUpdate,
    onRemove
}) {
    const [selectedEmpresa, setSelectedEmpresa] = useState(visita.empresa || '');
    const [mostrarFirma, setMostrarFirma] = useState(false);
    const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);

    const handleEmpresaChange = (e) => {
        const empresa = e.target.value;
        setSelectedEmpresa(empresa);
        onUpdate('empresa', empresa);
        onUpdate('sucursal', '');
        onUpdate('provincia', '');

        const sucursales = sucursalesPorEmpresa[empresa] || [];
        setSucursalesDisponibles(sucursales);
    };

    const handleFirmaGuardada = (firmaDataUrl) => {
        onUpdate('firma', firmaDataUrl);
        setMostrarFirma(false);
    };

    // Manejo de tareas
    const agregarTarea = () => {
        const nuevasTareas = [...visita.tareas, { id: crypto.randomUUID(), descripcion: '', completada: false }];
        onUpdate('tareas', nuevasTareas);
    };

    const actualizarTarea = (tareaId, campo, valor) => {
        const tareasActualizadas = visita.tareas.map(tarea =>
            tarea.id === tareaId ? { ...tarea, [campo]: valor } : tarea
        );
        onUpdate('tareas', tareasActualizadas);
    };

    const eliminarTarea = (tareaId) => {
        const tareasActualizadas = visita.tareas.filter(tarea => tarea.id !== tareaId);
        onUpdate('tareas', tareasActualizadas);
    };

    return (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 hover:shadow-md transition-shadow">
            {/* Encabezado de la visita */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-manzur-primary">
                    🏢 Visita {index + 1}
                </h3>
                {canRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                        🗑️ Eliminar visita
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Empresa */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Empresa <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={visita.empresa || ''}
                        onChange={handleEmpresaChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-manzur-primary"
                        required
                    >
                        <option value="">Seleccionar empresa</option>
                        {empresas.map(emp => (
                            <option key={emp} value={emp}>{emp}</option>
                        ))}
                    </select>
                </div>

                {/* Sucursal */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sucursal <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={visita.sucursal || ''}
                        onChange={e => onUpdate('sucursal', e.target.value)}
                        disabled={!selectedEmpresa}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-manzur-primary disabled:bg-gray-100"
                        required
                    >
                        <option value="">Seleccionar sucursal</option>
                        {sucursalesDisponibles.map(suc => (
                            <option key={suc} value={suc}>{suc}</option>
                        ))}
                    </select>
                </div>

                {/* Provincia */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provincia <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={visita.provincia || ''}
                        onChange={e => onUpdate('provincia', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-manzur-primary"
                        required
                    >
                        <option value="">Seleccionar provincia</option>
                        {provincias.map(prov => (
                            <option key={prov} value={prov}>{prov}</option>
                        ))}
                    </select>
                </div>

                {/* Horario ingreso */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de ingreso <span className="text-red-500">*</span>
                    </label>
                    <TimeButton
                        currentTime={visita.horarioIngreso}
                        onSetTime={(val) => onUpdate('horarioIngreso', val)}
                    />
                </div>

                {/* Horario egreso */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de egreso <span className="text-red-500">*</span>
                    </label>
                    <TimeButton
                        currentTime={visita.horarioEgreso}
                        onSetTime={(val) => onUpdate('horarioEgreso', val)}
                    />
                </div>

                {/* FIRMA de la visita */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        ✍️ Firma del responsable en la visita
                    </label>

                    {visita.firma ? (
                        <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                            <img
                                src={visita.firma}
                                alt="Firma"
                                className="h-16 border rounded bg-white"
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setMostrarFirma(true)}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    ✏️ Re-firmar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onUpdate('firma', '')}
                                    className="text-sm text-red-600 hover:text-red-800"
                                >
                                    🗑️ Eliminar firma
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setMostrarFirma(true)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                        >
                            ✍️ Agregar firma
                        </button>
                    )}
                </div>

                {/* TAREAS de la visita */}
                <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                            ✅ Tareas realizadas
                        </label>
                        <button
                            type="button"
                            onClick={agregarTarea}
                            className="text-sm text-green-600 hover:text-green-800"
                        >
                            + Agregar tarea
                        </button>
                    </div>

                    <div className="space-y-2">
                        {visita.tareas?.map((tarea) => (
                            <div key={tarea.id} className="flex items-center gap-2 p-2 bg-white rounded border">
                                <input
                                    type="checkbox"
                                    checked={tarea.completada}
                                    onChange={(e) => actualizarTarea(tarea.id, 'completada', e.target.checked)}
                                    className="w-5 h-5 text-green-600 rounded"
                                />
                                <input
                                    type="text"
                                    value={tarea.descripcion}
                                    onChange={(e) => actualizarTarea(tarea.id, 'descripcion', e.target.value)}
                                    placeholder="Describir tarea realizada..."
                                    className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-manzur-primary"
                                />
                                <button
                                    type="button"
                                    onClick={() => eliminarTarea(tarea.id)}
                                    className="text-red-500 hover:text-red-700 text-sm px-2"
                                    disabled={visita.tareas.length === 1}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Observaciones */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        📝 Observaciones de la visita
                    </label>
                    <textarea
                        value={visita.observaciones || ''}
                        onChange={e => onUpdate('observaciones', e.target.value)}
                        rows="2"
                        placeholder="Notas adicionales sobre esta visita..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-manzur-primary"
                    />
                </div>
            </div>

            {/* Modal de firma */}
            {mostrarFirma && (
                <SignaturePad
                    onSave={handleFirmaGuardada}
                    onCancel={() => setMostrarFirma(false)}
                />
            )}
        </div>
    );
}