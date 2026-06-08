// src/app/components/forms/RecorridoForm.jsx
'use client';

import { areas } from '@/app/utils/constants';
import { TimeButton } from './TimeButton';
import { VisitaForm } from './VisitaForm';
import { createEmptyVisita } from '@/app/models/recorridoModel';

export function RecorridoForm({
    recorrido,
    onUpdateRecorrido,
    onUpdateVisita,
    onAddVisita,
    onRemoveVisita
}) {
    const agregarVisita = () => {
        const nuevaVisita = createEmptyVisita(recorrido.visitas.length);
        onAddVisita(nuevaVisita);
    };

    return (
        <section className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white rounded-t-lg">
                <h2 className="text-xl font-bold text-manzur-primary">
                    📋 Datos del Recorrido
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    Complete todos los campos obligatorios (*)
                </p>
            </div>

            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Visitante */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Visitante <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={recorrido.visitante || ''}
                            onChange={e => onUpdateRecorrido('visitante', e.target.value)}
                            placeholder="Nombre y apellido completo"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-manzur-primary"
                            required
                        />
                    </div>

                    {/* Área */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Área <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={recorrido.area || ''}
                            onChange={e => onUpdateRecorrido('area', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-manzur-primary"
                            required
                        >
                            <option value="">Seleccionar área</option>
                            {areas.map(area => (
                                <option key={area} value={area}>{area}</option>
                            ))}
                        </select>
                    </div>

                    {/* Fecha del recorrido */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Fecha del recorrido <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={recorrido.fechaRecorrido || ''}
                            onChange={e => onUpdateRecorrido('fechaRecorrido', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-manzur-primary"
                            required
                        />
                    </div>

                    {/* Vehículo */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Vehículo / Kilometraje
                        </label>
                        <input
                            type="text"
                            value={recorrido.vehiculo || ''}
                            onChange={e => onUpdateRecorrido('vehiculo', e.target.value)}
                            placeholder="Ej: Ford Ranger - 12345 km"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-manzur-primary"
                        />
                    </div>
                </div>

                {/* Horario de salida */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Hora de salida de administración <span className="text-red-500">*</span>
                        </label>
                        <TimeButton
                            currentTime={recorrido.horarioSalida}
                            onSetTime={(val) => onUpdateRecorrido('horarioSalida', val)}
                        />
                    </div>
                </div>

                {/* Observaciones generales */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Observaciones generales del recorrido
                    </label>
                    <textarea
                        value={recorrido.observacionesGenerales || ''}
                        onChange={e => onUpdateRecorrido('observacionesGenerales', e.target.value)}
                        rows="2"
                        placeholder="Notas adicionales sobre el recorrido..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-manzur-primary"
                    />
                </div>

                {/* Sección de visitas */}
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-manzur-primary">
                                🏢 Visitas realizadas ({recorrido.visitas?.length || 0})
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Agregue todas las empresas visitadas durante el recorrido
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={agregarVisita}
                            className="px-4 py-2 bg-manzur-primary text-white text-sm rounded-lg hover:bg-manzur-primary-dark transition-colors font-medium shadow-sm flex items-center gap-2"
                        >
                            <span className="text-lg">+</span> Agregar visita
                        </button>
                    </div>

                    {recorrido.visitas?.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-500">No hay visitas cargadas</p>
                            <button
                                type="button"
                                onClick={agregarVisita}
                                className="mt-2 text-manzur-primary hover:text-manzur-primary-dark text-sm font-medium"
                            >
                                + Agregar primera visita
                            </button>
                        </div>
                    ) : (
                        recorrido.visitas.map((visita, index) => (
                            <VisitaForm
                                key={visita.id}
                                visita={visita}
                                index={index}
                                canRemove={recorrido.visitas.length > 1}
                                onUpdate={(field, value) => onUpdateVisita(visita.id, field, value)}
                                onRemove={() => onRemoveVisita(visita.id)}
                            />
                        ))
                    )}
                </div>

                {/* ✅ HORA DE LLEGADA - SOLO BOTÓN AHORA, SIN EDICIÓN MANUAL */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        🏁 Hora de llegada a administración <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-md">
                            {recorrido.horarioLlegada || '--:--'}
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                const now = new Date();
                                const hours = now.getHours().toString().padStart(2, '0');
                                const minutes = now.getMinutes().toString().padStart(2, '0');
                                const timeString = `${hours}:${minutes}`;
                                onUpdateRecorrido('horarioLlegada', timeString);
                            }}
                            className="px-3 py-1 bg-manzur-primary text-white rounded-md text-sm hover:bg-manzur-primary-dark transition-colors"
                        >
                            🕐 Ahora
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Presione "Ahora" para registrar la hora actual de llegada
                    </p>
                </div>
            </div>
        </section>
    );
}