// src/app/components/forms/VisitaForm.jsx
'use client';

// Cambios:
//  - Empresa y sucursal salen del catálogo (Firestore `sucursales`, con
//    fallback local). Se guardan los IDs y los textos (para el PDF).
//  - Selector de depósito cuando la sucursal lo requiere (Sleiman Huacalera).
//  - Provincia automática según la sucursal.
//  - Fecha propia de la visita (recorridos de varios días).
//  - Tareas con tipo; las de mantenimiento piden cantidad de equipos.
//  - data-visita-index va en la tarjeta completa, para que la validación
//    encuentre cualquier campo de la visita.
//
// onUpdate acepta (campo, valor) como antes, o un objeto con varios campos.

import { useState, useEffect, useMemo } from 'react';
import { provincias } from '@/app/utils/constants';
import { EMPRESAS, SUCURSALES, getEmpresa } from '@/app/data/catalogoSucursales';
import { firestoreService } from '@/app/services/firestoreService';
import {
    TIPO_TAREA,
    TIPO_TAREA_LABEL,
    DESCRIPCION_MANTENIMIENTO,
    createEmptyTarea,
    seleccionarSucursal,
} from '@/app/models/recorridoModel';
import { TimeButton } from './TimeButton';
import SignaturePad from '../ui/SignaturePad';

// text-base (16 px): en iOS los campos más chicos hacen zoom al tocarlos
const inputCls =
    'w-full px-3 py-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-manzur-primary disabled:bg-gray-100';

export function VisitaForm({
    visita,
    index,
    canRemove,
    onUpdate,
    onRemove,
    area,          // opcional: si se pasa y no es SISTEMAS, se oculta el tipo de tarea
    fechaMin,      // opcional: fecha de salida del recorrido
    fechaMax,      // opcional: fecha de llegada del recorrido
}) {
    const [catalogo, setCatalogo] = useState(SUCURSALES);
    const [mostrarFirma, setMostrarFirma] = useState(false);
    const mostrarTipo = !area || area === 'SISTEMAS';

    // Catálogo: arranca con el local (funciona sin señal) y se actualiza desde Firestore
    useEffect(() => {
        let activo = true;
        firestoreService.getSucursales().then((lista) => {
            if (activo && lista?.length) setCatalogo(lista);
        });
        return () => { activo = false; };
    }, []);

    const sucursalesDisponibles = useMemo(
        () => catalogo.filter((s) => s.empresaId === visita.empresaId),
        [catalogo, visita.empresaId],
    );
    const sucursalActual = catalogo.find((s) => s.id === visita.sucursalId) || null;
    const depositos = sucursalActual?.depositos || [];

    // ------------------------------------------------------------
    // Empresa / sucursal / depósito
    // ------------------------------------------------------------
    const handleEmpresaChange = (e) => {
        const empresaId = e.target.value;
        onUpdate({
            empresaId,
            empresa: getEmpresa(empresaId)?.nombre || '',
            sucursalId: '',
            sucursal: '',
            depositoId: null,
            provincia: '',
        });
    };

    const handleSucursalChange = (e) => {
        const suc = catalogo.find((s) => s.id === e.target.value) || null;
        const empresaNombre = getEmpresa(visita.empresaId)?.nombre || visita.empresa;
        const actualizada = seleccionarSucursal(visita, suc, empresaNombre, null);
        onUpdate({
            empresaId: actualizada.empresaId,
            empresa: actualizada.empresa,
            sucursalId: actualizada.sucursalId,
            sucursal: actualizada.sucursal,
            depositoId: null,
            provincia: actualizada.provincia,
        });
    };

    const handleDepositoChange = (e) => {
        const depositoId = e.target.value || null;
        const actualizada = seleccionarSucursal(visita, sucursalActual, visita.empresa, depositoId);
        onUpdate({ depositoId: actualizada.depositoId, sucursal: actualizada.sucursal });
    };

    // ------------------------------------------------------------
    // Tareas
    // ------------------------------------------------------------
    const tareas = visita.tareas || [];

    const agregarTarea = (tipo = TIPO_TAREA.OTRA) => {
        const nueva = createEmptyTarea(tipo);
        if (tipo === TIPO_TAREA.MANTENIMIENTO) nueva.descripcion = DESCRIPCION_MANTENIMIENTO;
        onUpdate('tareas', [...tareas, nueva]);
    };

    const actualizarTarea = (tareaId, cambios) => {
        onUpdate(
            'tareas',
            tareas.map((t) => {
                if (t.id !== tareaId) return t;
                const next = { ...t, ...cambios };
                if (next.tipo !== TIPO_TAREA.MANTENIMIENTO) next.equiposRealizados = null;
                // Cargar equipos realizados implica que el mantenimiento se hizo
                if (
                    next.tipo === TIPO_TAREA.MANTENIMIENTO &&
                    'equiposRealizados' in cambios &&
                    Number(cambios.equiposRealizados) > 0
                ) {
                    next.completada = true;
                }
                return next;
            }),
        );
    };

    const eliminarTarea = (tareaId) => {
        onUpdate('tareas', tareas.filter((t) => t.id !== tareaId));
    };

    const yaTieneMantenimiento = tareas.some((t) => t.tipo === TIPO_TAREA.MANTENIMIENTO);

    // ------------------------------------------------------------
    // Render
    // ------------------------------------------------------------
    return (
        <div
            data-visita-index={index}
            className="mb-4 p-3 sm:p-4 border border-gray-200 rounded-lg bg-gray-50"
        >
            {/* Encabezado */}
            <div className="flex justify-between items-start gap-2 mb-3">
                <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-manzur-primary">
                        Visita {index + 1}
                    </h3>
                    {visita.sucursal && (
                        <p className="text-xs text-gray-500 truncate">
                            {visita.empresa} · {visita.sucursal}
                        </p>
                    )}
                </div>
                {canRemove && (
                    <button
                        type="button"
                        onClick={() => confirm(`¿Eliminar la visita ${index + 1}?`) && onRemove()}
                        className="shrink-0 text-red-600 text-sm px-2 py-1 rounded hover:bg-red-50"
                        aria-label={`Eliminar visita ${index + 1}`}
                    >
                        🗑️ Eliminar
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {/* Empresa */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Empresa <span className="text-red-500">*</span>
                    </label>
                    <select
                        id={`visita_${index}_empresa`}
                        data-field="empresa"
                        value={visita.empresaId || ''}
                        onChange={handleEmpresaChange}
                        className={inputCls}
                        required
                    >
                        <option value="">Seleccionar empresa</option>
                        {EMPRESAS.map((emp) => (
                            <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                        ))}
                    </select>
                </div>

                {/* Sucursal */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sucursal <span className="text-red-500">*</span>
                    </label>
                    <select
                        id={`visita_${index}_sucursal`}
                        data-field="sucursal"
                        value={visita.sucursalId || ''}
                        onChange={handleSucursalChange}
                        disabled={!visita.empresaId}
                        className={inputCls}
                        required
                    >
                        <option value="">Seleccionar sucursal</option>
                        {sucursalesDisponibles.map((suc) => (
                            <option key={suc.id} value={suc.id}>{suc.nombre}</option>
                        ))}
                    </select>
                    {!visita.empresaId && (
                        <p className="text-xs text-gray-500 mt-1">Primero seleccione una empresa</p>
                    )}
                </div>

                {/* Depósito (solo si la sucursal tiene) */}
                {depositos.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Depósito <span className="text-red-500">*</span>
                        </label>
                        <select
                            id={`visita_${index}_deposito`}
                            data-field="deposito"
                            value={visita.depositoId || ''}
                            onChange={handleDepositoChange}
                            className={inputCls}
                            required
                        >
                            <option value="">Seleccionar depósito</option>
                            {depositos.map((d) => (
                                <option key={d.id} value={d.id}>{d.nombre}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Cada depósito se carga como una visita aparte, con su propia firma.
                        </p>
                    </div>
                )}

                {/* Provincia: automática; editable solo si la sucursal no la tiene cargada */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provincia <span className="text-red-500">*</span>
                    </label>
                    <select
                        id={`visita_${index}_provincia`}
                        data-field="provincia"
                        value={visita.provincia || ''}
                        onChange={(e) => onUpdate('provincia', e.target.value)}
                        disabled={Boolean(sucursalActual?.provincia)}
                        className={inputCls}
                        required
                    >
                        <option value="">Seleccionar provincia</option>
                        {provincias.map((prov) => (
                            <option key={prov} value={prov}>{prov}</option>
                        ))}
                    </select>
                </div>

                {/* Fecha de la visita */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de la visita <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        id={`visita_${index}_fecha`}
                        data-field="fecha"
                        value={visita.fecha || ''}
                        min={fechaMin || undefined}
                        max={fechaMax || undefined}
                        onChange={(e) => onUpdate('fecha', e.target.value)}
                        className={inputCls}
                        required
                    />
                </div>

                {/* Horarios */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div id={`visita_${index}_horarioIngreso`}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hora de ingreso <span className="text-red-500">*</span>
                        </label>
                        <TimeButton
                            currentTime={visita.horarioIngreso}
                            onSetTime={(val) => onUpdate('horarioIngreso', val)}
                        />
                    </div>
                    <div id={`visita_${index}_horarioEgreso`}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hora de egreso <span className="text-red-500">*</span>
                        </label>
                        <TimeButton
                            currentTime={visita.horarioEgreso}
                            onSetTime={(val) => onUpdate('horarioEgreso', val)}
                        />
                    </div>
                </div>

                {/* Firma */}
                <div className="md:col-span-2" id={`visita_${index}_firma`}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        ✍️ Firma del responsable
                        {visita.sucursal && (
                            <span className="font-normal text-gray-500"> — {visita.sucursal}</span>
                        )}
                    </label>
                    {visita.firma ? (
                        <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                            <img src={visita.firma} alt="Firma" className="h-16 border rounded bg-white" />
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
                            className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-white border-2 border-dashed border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 text-sm"
                        >
                            ✍️ Agregar firma
                        </button>
                    )}
                </div>

                {/* Tareas */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        ✅ Tareas realizadas
                    </label>
                    <div className="space-y-2">
                        {tareas.length === 0 ? (
                            <p className="text-gray-400 text-sm italic">No hay tareas cargadas</p>
                        ) : (
                            tareas.map((tarea) => {
                                const esMant = tarea.tipo === TIPO_TAREA.MANTENIMIENTO;
                                return (
                                    <div key={tarea.id} className="p-2 bg-white rounded border space-y-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(tarea.completada)}
                                                onChange={(e) => actualizarTarea(tarea.id, { completada: e.target.checked })}
                                                className="w-5 h-5 text-green-600 rounded"
                                                title="Finalizada"
                                            />
                                            <input
                                                type="text"
                                                value={tarea.descripcion}
                                                onChange={(e) => actualizarTarea(tarea.id, { descripcion: e.target.value })}
                                                placeholder="Describir tarea realizada..."
                                                className="flex-1 min-w-0 px-2 py-1.5 border rounded text-base focus:outline-none focus:ring-1 focus:ring-manzur-primary"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => eliminarTarea(tarea.id)}
                                                className="text-red-500 hover:text-red-700 text-sm px-2"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        {mostrarTipo && (
                                            <div className="flex flex-wrap items-center gap-3 pl-7">
                                                <select
                                                    value={tarea.tipo || TIPO_TAREA.OTRA}
                                                    onChange={(e) => actualizarTarea(tarea.id, { tipo: e.target.value })}
                                                    className="px-2 py-1.5 border rounded text-base sm:text-sm"
                                                >
                                                    {Object.values(TIPO_TAREA).map((t) => (
                                                        <option key={t} value={t}>{TIPO_TAREA_LABEL[t]}</option>
                                                    ))}
                                                </select>

                                                {esMant && (
                                                    <label
                                                        className="flex items-center gap-2 text-sm text-gray-700"
                                                        id={`visita_${index}_equipos_${tarea.id}`}
                                                    >
                                                        Equipos realizados
                                                        <input
                                                            type="number"
                                                            inputMode="numeric"
                                                            min="0"
                                                            max={sucursalActual?.equipos ?? undefined}
                                                            value={tarea.equiposRealizados ?? ''}
                                                            onChange={(e) =>
                                                                actualizarTarea(tarea.id, {
                                                                    equiposRealizados:
                                                                        e.target.value === '' ? null : Number(e.target.value),
                                                                })
                                                            }
                                                            className="w-20 px-2 py-1.5 border rounded text-base"
                                                        />
                                                        {sucursalActual?.equipos != null && (
                                                            <span className="text-gray-500">
                                                                de {sucursalActual.equipos}
                                                                {depositos.length > 0 && ' (total sucursal)'}
                                                            </span>
                                                        )}
                                                    </label>
                                                )}
                                            </div>
                                        )}

                                        {esMant && !tarea.completada && (
                                            <p className="pl-7 text-xs text-amber-700">
                                                ⚠️ Sin tildar como finalizada, esta visita no cuenta en el programa F-ST-02.
                                            </p>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Botones para agregar tareas: debajo de la lista, a lo ancho en mobile */}
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        {mostrarTipo && !yaTieneMantenimiento && (
                            <button
                                type="button"
                                onClick={() => agregarTarea(TIPO_TAREA.MANTENIMIENTO)}
                                className="flex-1 py-2 text-sm border border-manzur-primary text-manzur-primary rounded-md hover:bg-blue-50"
                            >
                                + Mantenimiento preventivo
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => agregarTarea()}
                            className="flex-1 py-2 text-sm border border-green-600 text-green-700 rounded-md hover:bg-green-50"
                        >
                            + Otra tarea
                        </button>
                    </div>
                </div>

                {/* Observaciones */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        📝 Observaciones
                    </label>
                    <textarea
                        value={visita.observaciones || ''}
                        onChange={(e) => onUpdate('observaciones', e.target.value)}
                        rows="2"
                        placeholder="Notas adicionales sobre esta visita..."
                        className={inputCls}
                    />
                </div>
            </div>

            {mostrarFirma && (
                <SignaturePad
                    onSave={(firmaDataUrl) => {
                        onUpdate('firma', firmaDataUrl);
                        setMostrarFirma(false);
                    }}
                    onCancel={() => setMostrarFirma(false)}
                />
            )}
        </div>
    );
}