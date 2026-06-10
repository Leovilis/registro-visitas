// src/app/manifest.js
export default function manifest() {
  return {
    name: "Registro de Visitas - Manzur",
    short_name: "Visitas",
    description:
      "Sistema de registro de visitas a empresas para Manzur Administraciones",
    start_url: "/",
    display: "standalone",
    theme_color: "#2563eb",
    background_color: "#ffffff",
    lang: "es",
    scope: "/",
    orientation: "portrait",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
