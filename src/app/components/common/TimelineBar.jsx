// src/app/components/common/TimelineBar.jsx
'use client';

export function TimelineBar({ recorrido }) {
    const visitas = recorrido.visitas || [];

    const steps = [
        { label: 'Salida', time: recorrido.horarioSalida },
        ...visitas.flatMap((v, i) => [
            { label: `↓ Ingreso ${v.empresa || `Visita ${i + 1}`}`, time: v.horarioIngreso },
            { label: `↑ Egreso ${v.empresa || `Visita ${i + 1}`}`, time: v.horarioEgreso },
        ]),
        { label: 'Llegada', time: recorrido.horarioLlegada },
    ];

    const toMin = (t) => {
        if (!t) return null;
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };

    return (
        <div className="flex flex-wrap gap-1 items-center text-xs mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            {steps.map((s, i) => {
                const prevMin = i > 0 ? toMin(steps[i - 1].time) : null;
                const currMin = toMin(s.time);
                const isInvalid = prevMin !== null && currMin !== null && currMin < prevMin;

                return (
                    <span key={i} className="flex items-center gap-1">
                        {i > 0 && <span className="text-gray-300">→</span>}
                        <span className={`px-2 py-0.5 rounded font-medium ${s.time
                                ? isInvalid
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                            {s.label}: {s.time || '--:--'}
                            {isInvalid && ' ⚠'}
                        </span>
                    </span>
                );
            })}
        </div>
    );
}