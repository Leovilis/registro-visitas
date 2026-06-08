// src/app/components/common/SaveStatus.jsx
'use client';

export function SaveStatus({ saving, lastSaved, saveError }) {
    if (saveError) {
        return (
            <span className="text-xs text-red-600 font-medium">
                ⚠ {saveError}
            </span>
        );
    }

    if (saving) {
        return (
            <span className="text-xs text-gray-500 animate-pulse">
                💾 Guardando...
            </span>
        );
    }

    if (lastSaved) {
        return (
            <span className="text-xs text-green-600">
                ✓ Guardado {lastSaved.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </span>
        );
    }

    return <span className="text-xs text-gray-400">Sin cambios</span>;
}

export default SaveStatus;