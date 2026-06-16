// src/app/components/common/SaveStatus.jsx
'use client';

export function SaveStatus({ saving, lastSaved, saveError }) {
    if (saving) {
        return <span className="text-yellow-600 text-sm">⏳ Guardando...</span>;
    }
    if (saveError) {
        return (
            <div className="text-red-600 text-sm max-w-md">
                ❌ {saveError}
            </div>
        );
    }
    if (lastSaved) {
        return (
            <span className="text-green-600 text-sm">
                ✅ Guardado: {lastSaved.toLocaleTimeString()}
            </span>
        );
    }
    return <span className="text-gray-400 text-sm">Sin cambios</span>;
}