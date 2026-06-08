export function Header({ children }) {
    return (
        <div className="flex justify-between items-start mb-6 flex-wrap gap-2">
            <div>
                <h1 className="text-2xl font-bold mb-1">REGISTRO DE VISITAS</h1>
                <p className="text-xs text-gray-500">
                    Para completar este formulario utilice el instructivo "I-RD-01"
                </p>
            </div>
            <div className="flex flex-col items-end gap-1">
                {children}
            </div>
        </div>
    );
}