// src/app/components/forms/TimeButton.jsx
'use client';

// Campo de hora + botón "Ahora" en una sola línea.
// - El input type="time" abre el selector nativo del celular (reemplaza "Editar").
// - text-base (16 px) evita que iOS haga zoom al tocar el campo.
// - onAhora (opcional) permite que el padre haga algo más, p.ej. guardar la fecha.

import { horaLocal } from '@/app/models/recorridoModel';

export function TimeButton({ currentTime, onSetTime, onAhora, id, disabled = false }) {
    const marcarAhora = () => (onAhora ? onAhora() : onSetTime(horaLocal()));

    return (
        <div className="flex items-stretch gap-2 w-full">
            <input
                id={id}
                type="time"
                value={currentTime || ''}
                onChange={(e) => onSetTime(e.target.value)}
                disabled={disabled}
                className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-base font-mono focus:outline-none focus:ring-2 focus:ring-manzur-primary disabled:bg-gray-100"
            />
            <button
                type="button"
                onClick={marcarAhora}
                disabled={disabled}
                className="shrink-0 px-3 py-2 bg-manzur-primary text-white rounded-md text-sm font-medium hover:bg-manzur-primary-dark active:scale-95 transition disabled:opacity-50"
            >
                🕐 Ahora
            </button>
        </div>
    );
}

export default TimeButton;