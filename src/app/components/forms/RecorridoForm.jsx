// src/app/components/forms/RecorridoForm.jsx
'use client';

import { TimeButton } from './TimeButton';
import { VisitaForm } from './VisitaForm';
import { createEmptyVisita, AREA_APP, VEHICULOS, fechaLocalISO, horaLocal } from '@/app/models/recorridoModel';

const labelCls = 'block text-sm font-semibold text-gray-700 mb-1';
const inputCls =
    'w-full px-3 py-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-manzur-primary';

// Bloque hora + fecha (salida y llegada). "Ahora" completa las dos;
// si se carga la hora a mano y no hay fecha, se toma la de hoy.
function HoraYFecha({ titulo, idHora, idFecha, hora, fecha, onCambiar }) {
    return (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className={labelCls}>
                {titulo} <span className="text-red-500">*</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div id={idHora}>
                    <span className="block text-xs text-gray-500 mb-1">Hora</span>
                    <TimeButton
                        currentTime={hora}
                        onSetTime={(val) => onCambiar({ hora: val, fecha: fecha || fechaLocalISO() })}
                        onAhora={() => onCambiar({ hora: horaLocal(), fecha: fechaLocalISO() })}
                    />
                </div>
                <label className="block">
                    <span className="block text-xs text-gray-500 mb-1">Fecha</span>
                    <input
                        id={idFecha}
                        type="date"
                        value={fecha || ''}
                        onChange={(e) => onCambiar({ hora, fecha: e.target.value })}
                        className={inputCls}
                    />
                </label>
            </div>
        </div>
    );
}

export function RecorridoForm({
    recorrido,
    onUpdateRecorrido,
    onUpdateVisita,
    onAddVisita,
    onRemoveVisita,
}) {
    const agregarVisita = () => {
        onAddVisita(createEmptyVisita(recorrido.visitas.length));
    };

    return (
        <section className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-3 py-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white rounded-t-lg">
                <h2 className="text-lg sm:text-xl font-bold text-manzur-primary">📋 Datos del recorrido</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Complete todos los campos obligatorios (*)</p>
            </div>

            <div className="p-3 sm:p-4 space-y-4">
                {/* Datos generales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="sm:col-span-2">
                        <label htmlFor="visitante" className={labelCls}>
                            Visitante/s <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="visitante"
                            type="text"
                            value={recorrido.visitante || ''}
                            onChange={(e) => onUpdateRecorrido('visitante', e.target.value)}
                            placeholder="Nombre y apellido, separados por coma"
                            autoComplete="off"
                            className={inputCls}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="fechaRecorrido" className={labelCls}>
                            Fecha del recorrido <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="fechaRecorrido"
                            type="date"
                            value={recorrido.fechaRecorrido || ''}
                            onChange={(e) => onUpdateRecorrido('fechaRecorrido', e.target.value)}
                            className={inputCls}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="vehiculo" className={labelCls}>
                            Vehículo <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            <select
                                id="vehiculo"
                                value={recorrido.vehiculo || ''}
                                onChange={(e) => onUpdateRecorrido('vehiculo', e.target.value)}
                                className={`${inputCls} flex-1 min-w-0 bg-white`}
                                required
                            >
                                <option value="">Seleccionar</option>
                                {VEHICULOS.map((v) => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                                {/* Recorridos viejos con texto libre: se muestra para no perderlo */}
                                {recorrido.vehiculo && !VEHICULOS.includes(recorrido.vehiculo) && (
                                    <option value={recorrido.vehiculo}>{recorrido.vehiculo} (cargado antes)</option>
                                )}
                            </select>
                            <input
                                id="kilometraje"
                                type="number"
                                inputMode="numeric"
                                min="0"
                                value={recorrido.kilometraje || ''}
                                onChange={(e) => onUpdateRecorrido('kilometraje', e.target.value)}
                                placeholder="Km"
                                aria-label="Kilometraje"
                                className={`${inputCls} w-28`}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2">
                        <span className="font-semibold">Área:</span>
                        <span id="area" className="px-2 py-0.5 bg-gray-100 rounded">{recorrido.area || AREA_APP}</span>
                    </div>
                </div>

                {/* Salida */}
                <HoraYFecha
                    titulo="🚙 Salida de administración"
                    idHora="horarioSalida"
                    idFecha="fechaSalida"
                    hora={recorrido.horarioSalida}
                    fecha={recorrido.fechaSalida}
                    onCambiar={({ hora, fecha }) => {
                        onUpdateRecorrido('horarioSalida', hora);
                        onUpdateRecorrido('fechaSalida', fecha);
                    }}
                />

                {/* Observaciones generales */}
                <div>
                    <label htmlFor="observacionesGenerales" className={labelCls}>
                        Observaciones generales
                    </label>
                    <textarea
                        id="observacionesGenerales"
                        value={recorrido.observacionesGenerales || ''}
                        onChange={(e) => onUpdateRecorrido('observacionesGenerales', e.target.value)}
                        rows="2"
                        placeholder="Notas sobre el recorrido..."
                        className={inputCls}
                    />
                </div>

                {/* Visitas */}
                <div>
                    <div className="mb-3">
                        <h3 className="text-base sm:text-lg font-semibold text-manzur-primary">
                            🏢 Visitas ({recorrido.visitas?.length || 0})
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Una visita por sucursal (o por depósito, si corresponde)
                        </p>
                    </div>

                    {recorrido.visitas?.length === 0 ? (
                        <div className="text-center py-8 mb-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-500">No hay visitas cargadas</p>
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
                                area={recorrido.area || AREA_APP}
                                fechaMin={recorrido.fechaSalida || undefined}
                                fechaMax={recorrido.fechaLlegada || undefined}
                            />
                        ))
                    )}

                    {/* Al final de la lista: después de completar una visita queda a mano */}
                    <button
                        type="button"
                        onClick={agregarVisita}
                        className="w-full py-3 border-2 border-dashed border-manzur-primary text-manzur-primary rounded-lg font-medium hover:bg-blue-50 active:scale-[0.99] transition"
                    >
                        + Agregar visita
                    </button>
                </div>

                {/* Llegada */}
                <HoraYFecha
                    titulo="🏁 Llegada a administración"
                    idHora="horarioLlegada"
                    idFecha="fechaLlegada"
                    hora={recorrido.horarioLlegada}
                    fecha={recorrido.fechaLlegada}
                    onCambiar={({ hora, fecha }) => {
                        onUpdateRecorrido('horarioLlegada', hora);
                        onUpdateRecorrido('fechaLlegada', fecha);
                    }}
                />
            </div>
        </section>
    );
}