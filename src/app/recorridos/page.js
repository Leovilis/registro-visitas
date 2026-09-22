// src/app/recorridos/page.js
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/app/components/layout/Header";
import { LoadingSpinner } from "@/app/components/common/LoadingSpinner";
import { firestoreService } from "@/app/services/firestoreService";
import {
  ESTADO,
  tieneContenido,
  textoVehiculo,
} from "@/app/models/recorridoModel";
import { eliminarRecorrido } from "@/app/services/programaService";
import { formatDate } from "@/app/utils/formatters";

const BADGE = {
  [ESTADO.BORRADOR]: "bg-yellow-100 text-yellow-800",
  [ESTADO.FINALIZADO]: "bg-green-100 text-green-800",
};

export default function RecorridosPage() {
  const [recorridos, setRecorridos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estado, setEstado] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRecorridos(
        await firestoreService.listRecorridos({
          estado: estado || undefined,
          desde: desde || undefined,
          hasta: hasta || undefined,
        }),
      );
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [estado, desde, hasta]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Borradores y finalizados. Al eliminar un finalizado se revierte su aporte al programa.
  const eliminar = async (r) => {
    const detalle =
      r.estado === ESTADO.FINALIZADO
        ? `¿Eliminar el recorrido FINALIZADO del ${formatDate(r.fechaRecorrido)}?\n\nLas sucursales que marcó como visitadas vuelven a pendiente en el programa (salvo que otro recorrido las respalde). No se puede deshacer.`
        : tieneContenido(r)
          ? `¿Eliminar el borrador del ${formatDate(r.fechaRecorrido)}? Tiene datos cargados y no se puede deshacer.`
          : "¿Eliminar este borrador vacío?";
    if (!confirm(detalle)) return;
    try {
      await eliminarRecorrido(r.id);
      setRecorridos((prev) => prev.filter((x) => x.id !== r.id));
    } catch (e) {
      alert("No se pudo eliminar: " + e.message);
    }
  };

  const vacios = recorridos.filter(
    (r) => r.estado === ESTADO.BORRADOR && !tieneContenido(r),
  );
  const eliminarVacios = async () => {
    if (!confirm(`¿Eliminar ${vacios.length} borrador(es) vacío(s)?`)) return;
    try {
      await Promise.all(
        vacios.map((r) => firestoreService.deleteRecorrido(r.id)),
      );
      const ids = new Set(vacios.map((r) => r.id));
      setRecorridos((prev) => prev.filter((x) => !ids.has(x.id)));
    } catch (e) {
      alert("No se pudieron eliminar todos: " + e.message);
      cargar();
    }
  };

  const inputCls =
    "w-full px-2 py-2 border border-gray-300 rounded-md text-base sm:text-sm";

  return (
    <div className="container mx-auto max-w-4xl px-3 py-4 sm:p-4">
      <Header
        titulo="RECORRIDOS"
        subtitulo="Recorridos registrados por Sistemas"
      />

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-end gap-2 sm:gap-3 mb-4 p-3 bg-white border rounded-lg">
        <label className="text-sm col-span-2 sm:col-span-1">
          <span className="block text-gray-600 mb-1">Estado</span>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className={inputCls}
          >
            <option value="">Todos</option>
            <option value={ESTADO.BORRADOR}>Borrador</option>
            <option value={ESTADO.FINALIZADO}>Finalizado</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-gray-600 mb-1">Desde</span>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="text-sm">
          <span className="block text-gray-600 mb-1">Hasta</span>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className={inputCls}
          />
        </label>
        {vacios.length > 0 && (
          <button
            type="button"
            onClick={eliminarVacios}
            className="col-span-2 sm:col-span-1 sm:ml-auto px-3 py-2 text-sm text-red-600 border border-red-200 hover:bg-red-50 rounded-lg"
          >
            🗑️ Eliminar {vacios.length} borrador(es) vacío(s)
          </button>
        )}
        <Link
          href="/"
          className="col-span-2 sm:col-span-1 sm:ml-auto text-center px-4 py-2 bg-manzur-primary text-white text-sm rounded-lg hover:bg-manzur-primary-dark"
        >
          + Nuevo recorrido
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
          Error al cargar: {error}
        </p>
      ) : recorridos.length === 0 ? (
        <p className="p-8 text-center text-gray-500 bg-white border border-dashed rounded-lg">
          No hay recorridos con esos filtros.
        </p>
      ) : (
        <ul className="space-y-2">
          {recorridos.map((r) => {
            const vinculadas = r.visitas.filter((v) => v.paradaPlanId).length;
            return (
              <li
                key={r.id}
                className="p-3 bg-white border rounded-lg hover:shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={`/?id=${r.id}`}
                    className="font-semibold text-manzur-primary hover:underline"
                  >
                    {formatDate(r.fechaRecorrido)} —{" "}
                    {r.visitante || "Sin visitante"}
                  </Link>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${BADGE[r.estado] || "bg-gray-100"}`}
                  >
                    {r.estado}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {r.visitas
                    .map((v) =>
                      [v.empresa, v.sucursal].filter(Boolean).join(" - "),
                    )
                    .filter(Boolean)
                    .join(" · ") || "Sin visitas cargadas"}
                </p>
                <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-500">
                  {r.vehiculo && <span>🚙 {textoVehiculo(r)}</span>}
                  {vinculadas > 0 && (
                    <span>📅 {vinculadas} visita(s) en el programa</span>
                  )}
                  <Link
                    href={`/?id=${r.id}`}
                    className="text-manzur-primary hover:underline"
                  >
                    ✏️ Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => eliminar(r)}
                    className="text-red-600 hover:underline"
                  >
                    🗑️ Eliminar
                  </button>
                  {r.pdfUrl && (
                    <a
                      href={r.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-manzur-primary hover:underline"
                    >
                      📄 PDF
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
