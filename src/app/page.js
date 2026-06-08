// app/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegistroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    fecha: new Date().toISOString().split("T")[0],
  });
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      data.append("nombre", formData.nombre);
      data.append("email", formData.email);
      data.append("telefono", formData.telefono);
      data.append("fecha", formData.fecha);
      if (archivo) {
        data.append("archivo", archivo);
      }

      const res = await fetch("/api/visitas", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        // Resetear formulario
        setFormData({
          nombre: "",
          email: "",
          telefono: "",
          fecha: new Date().toISOString().split("T")[0],
        });
        setArchivo(null);
        // Resetear input file
        const fileInput = document.getElementById("archivo");
        if (fileInput) fileInput.value = "";

        alert("✅ Visita registrada correctamente");
        router.push("/visitas");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Error al registrar la visita");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Registro de Visitas
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nombre *</label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input
            type="tel"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            value={formData.telefono}
            onChange={(e) =>
              setFormData({ ...formData, telefono: e.target.value })
            }
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Fecha de visita
          </label>
          <input
            type="date"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            value={formData.fecha}
            onChange={(e) =>
              setFormData({ ...formData, fecha: e.target.value })
            }
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            Adjuntar archivo (opcional)
          </label>
          <input
            id="archivo"
            type="file"
            accept="image/*,application/pdf"
            className="w-full p-2 border rounded"
            onChange={(e) => setArchivo(e.target.files[0])}
          />
          <p className="text-xs text-gray-500 mt-1">
            Formatos: imágenes (JPG, PNG, GIF) o PDF. Máximo 5MB
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400 transition"
        >
          {loading ? "Registrando..." : "Registrar Visita"}
        </button>
      </form>
    </div>
  );
}
