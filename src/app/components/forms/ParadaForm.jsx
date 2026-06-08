'use client';

import { useState, useEffect } from 'react';
import { empresas, sucursalesPorEmpresa, provincias } from '@/app/utils/constants';
import { TimeButton } from './TimeButton';

export function ParadaForm({ parada, index, canRemove, onUpdate, onRemove }) {
    const [selectedEmpresa, setSelectedEmpresa] = useState(parada.empresa || '');
    const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);

    useEffect(() => {
        if (selectedEmpresa) {
            const sucursales = sucursalesPorEmpresa[selectedEmpresa] || [];
            setSucursalesDisponibles(sucursales);
        } else {
            setSucursalesDisponibles([]);
        }
    }, [selectedEmpresa]);

    const handleEmpresaChange = (e) => {
        const empresa = e.target.value;
        setSelectedEmpresa(empresa);
        onUpdate('empresa', empresa);
        // Resetear sucursal cuando cambia la empresa
        onUpdate('sucursal', '');
        onUpdate('provincia', '');
    };

    const handleSucursalChange = (e) => {
        const sucursal = e.target.value;
        onUpdate('sucursal', sucursal);
        // Auto-detectar provincia basada en sucursal (opcional)
        // Puedes implementar lógica para asignar provincia automáticamente
    };

    return (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-manzur-primary">
                    Parada {index + 1}
                </h3>
                {canRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
                        aria-label="Eliminar parada"
                    >
                        🗑️ Eliminar
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
                        value={parada.empresa || ''}
                        onChange={handleEmpresaChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-manzur-primary focus:border-transparent"
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
                        value={parada.sucursal || ''}
                        onChange={handleSucursalChange}
                        disabled={!selectedEmpresa}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-manzur-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required
                    >
                        <option value="">Seleccionar sucursal</option>
                        {sucursalesDisponibles.map(suc => (
                            <option key={suc} value={suc}>{suc}</option>
                        ))}
                    </select>
                    {!selectedEmpresa && (
                        <p className="text-xs text-gray-500 mt-1">Primero seleccione una empresa</p>
                    )}
                </div>

                {/* Provincia */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provincia <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={parada.provincia || ''}
                        onChange={e => onUpdate('provincia', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-manzur-primary focus:border-transparent"
                        required
                    >
                        <option value="">Seleccionar provincia</option>
                        {provincias.map(prov => (
                            <option key={prov} value={prov}>{prov}</option>
                        ))}
                    </select>
                </div>

                {/* Motivo de visita */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motivo de visita
                    </label>
                    <input
                        type="text"
                        value={parada.motivo || ''}
                        onChange={e => onUpdate('motivo', e.target.value)}
                        placeholder="Ej: Auditoría, Capacitación, Control"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-manzur-primary focus:border-transparent"
                    />
                </div>

                {/* Hora de ingreso */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de ingreso <span className="text-red-500">*</span>
                    </label>
                    <TimeButton
                        currentTime={parada.ingreso}
                        onSetTime={(val) => onUpdate('ingreso', val)}
                        placeholder="HH:MM"
                    />
                </div>

                {/* Hora de egreso */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de egreso <span className="text-red-500">*</span>
                    </label>
                    <TimeButton
                        currentTime={parada.egreso}
                        onSetTime={(val) => onUpdate('egreso', val)}
                        placeholder="HH:MM"
                    />
                </div>

                {/* Observaciones */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observaciones
                    </label>
                    <textarea
                        value={parada.observaciones || ''}
                        onChange={e => onUpdate('observaciones', e.target.value)}
                        rows="2"
                        placeholder="Notas adicionales sobre la visita..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-manzur-primary focus:border-transparent"
                    />
                </div>
            </div>
        </div>
    );
}