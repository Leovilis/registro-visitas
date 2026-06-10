// src/app/components/layout/Footer.jsx
export function Footer() {
    return (
        <footer className="text-center py-4 text-gray-500 text-sm border-t mt-8">
            © {new Date().getFullYear()} - Sistema de Registro de Visitas
        </footer>
    );
}