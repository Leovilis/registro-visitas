// src/app/components/layout/Header.jsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
    { href: '/', label: '📝 Registro' },
    { href: '/recorridos', label: '📂 Recorridos' },
    { href: '/programa', label: '📅 Programa' },
];

export function Header({
    children,
    titulo = 'REGISTRO DE VISITAS',
    subtitulo = 'Para completar este formulario utilice el instructivo "I-RD-01"',
}) {
    const pathname = usePathname();
    const activo = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

    return (
        <div className="mb-4 sm:mb-6">
            {/* En mobile la barra se desliza horizontalmente en vez de partirse en dos renglones */}
            <nav className="flex gap-1 mb-3 sm:mb-4 border-b border-gray-200 overflow-x-auto whitespace-nowrap -mx-3 px-3 sm:mx-0 sm:px-0">
                {LINKS.map((l) => (
                    <Link
                        key={l.href}
                        href={l.href}
                        className={`shrink-0 px-3 py-2 text-sm rounded-t-md -mb-px border-b-2 transition-colors ${activo(l.href)
                                ? 'border-manzur-primary text-manzur-primary font-semibold'
                                : 'border-transparent text-gray-500 hover:text-gray-800'
                            }`}
                    >
                        {l.label}
                    </Link>
                ))}
                <span className="hidden sm:inline ml-auto self-center text-xs text-gray-400 px-2">Sistemas</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div className="min-w-0">
                    <h1 className="text-lg sm:text-2xl font-bold leading-tight">{titulo}</h1>
                    {subtitulo && <p className="text-xs text-gray-500 mt-0.5">{subtitulo}</p>}
                </div>
                {children && (
                    <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-1">{children}</div>
                )}
            </div>
        </div>
    );
}