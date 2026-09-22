// src/app/programa/viaje/[id]/page.js
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/app/components/layout/Header";
import { LoadingSpinner } from "@/app/components/common/LoadingSpinner";
import {
  getViaje,
  listViajes,
  listParadasDeViaje,
  listMotivos,
  marcarNoVisitada,
  reprogramarParada,
} from "@/app/services/programaService";
import { firestoreService } from "@/app/services/firestoreService";
import { getEmpresa } from "@/app/data/catalogoSucursales";
import { ESTADO_PARADA, ESTADO_PARADA_LABEL } from "@/app/models/programaModel";
import { fechaLocalISO } from "@/app/models/recorridoModel";
import { formatDate } from "@/app/utils/formatters";

const BADGE = {
  [ESTADO_PARADA.PENDIENTE]: "bg-gray-100 text-gray-700",
  [ESTADO_PARADA.VISITADA]: "bg-green-100 text-green-800",
  [ESTADO_PARADA.NO_VISITADA]: "bg-red-100 text-red-800",
  [ESTADO_PARADA.REPROGRAMADA]: "bg-blue-100 text-blue-800",
};

const inputCls = "w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm";

function AccionParada({ parada, tipo, motivos, viajes, onCancelar, onHecho }) {
  const [motivoId, setMotivoId] = useState("");
  const [detalle, setDetalle] = useState("");
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevoViajeId, setNuevoViajeId] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      if (tipo === "no_visitada") {
        await marcarNoVisitada(parada.id, { motivoId, detalle });
      } else {
        await reprogramarParada(parada.id, {
          nuevaFecha,
          nuevoViajeId: nuevoViajeId || null,
          motivoId,
          detalle,
        });
      }
      onHecho();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="mt-2 p-3 bg-gray-50 border rounded-md space-y-2">
      <p className="text-sm font-medium">
        {tipo === "no_visitada"
          ? "Marcar como no visitada"
          : "Reprogramar visita"}
      </p>
      <select
        value={motivoId}
        onChange={(e) => setMotivoId(e.target.value)}
        className={inputCls}
      >
        <option value="">Motivo *</option>
        {motivos.map((m) => (
          <option key={m.id} value={m.id}>
            {m.descripcion}
          </option>
        ))}
      </select>
      {tipo === "reprogramar" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="text-xs text-gray-600">
            Nueva fecha *
            <input
              type="date"
              value={nuevaFecha}
              onChange={(e) => setNuevaFecha(e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="text-xs text-gray-600">
            Mover al viaje
            <select
              value={nuevoViajeId}
              onChange={(e) => setNuevoViajeId(e.target.value)}
              className={inputCls}
            >
              <option value="">Mantener en este viaje</option>
              {viajes
                .filter((v) => v.id !== parada.viajeId)
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    Viaje {v.nro} — {formatDate(v.fechaInicio)}
                  </option>
                ))}
            </select>
          </label>
        </div>
      )}
      <input
        type="text"
        value={detalle}
        onChange={(e) => setDetalle(e.target.value)}
        placeholder="Detalle (opcional)"
        className={inputCls}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancelar}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={guardar}
          disabled={
            guardando || !motivoId || (tipo === "reprogramar" && !nuevaFecha)
          }
          className="px-3 py-1.5 text-sm bg-manzur-primary text-white rounded-md disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}

export default function ViajePage() {
  const { id } = useParams();
  const router = useRouter();
  const hoy = fechaLocalISO();
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accion, setAccion] = useState(null); // { paradaId, tipo }

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const viaje = await getViaje(id);
      if (!viaje) throw new Error("El viaje no existe");
      const [paradas, motivos, viajes, sucursales, recorridos] =
        await Promise.all([
          listParadasDeViaje(id),
          listMotivos(),
          listViajes(viaje.programaId),
          firestoreService.getSucursales(),
          firestoreService.listRecorridos({ viajePlanId: id }),
        ]);
      setDatos({ viaje, paradas, motivos, viajes, sucursales, recorridos });
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const nombreSucursal = (sucursalId) => {
    const s = datos?.sucursales.find((x) => x.id === sucursalId);
    if (!s) return sucursalId;
    return `${s.nombre} (${getEmpresa(s.empresaId)?.nombre || s.empresaId})`;
  };
  const nombreMotivo = (mid) =>
    datos?.motivos.find((m) => m.id === mid)?.descripcion || mid;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto max-w-4xl px-3 py-4 sm:p-4">
      <Header
        titulo={datos ? `VIAJE ${datos.viaje.nro}` : "VIAJE"}
        subtitulo={
          datos
            ? `${formatDate(datos.viaje.fechaInicio)}${
                datos.viaje.fechaFin !== datos.viaje.fechaInicio
                  ? ` al ${formatDate(datos.viaje.fechaFin)}`
                  : ""
              } · ${datos.viaje.tecnicos?.join(", ") || ""}${datos.viaje.camionetaDosDias ? " · 🚙 camioneta 2 días" : ""}`
            : ""
        }
      >
        <Link
          href="/programa"
          className="text-sm text-manzur-primary hover:underline"
        >
          ← Volver al programa
        </Link>
      </Header>

      {error ? (
        <p className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</p>
      ) : (
        <>
          {(() => {
            const pendientes = datos.paradas.filter(
              (p) => p.estado !== ESTADO_PARADA.VISITADA,
            );
            return pendientes.length > 0 ? (
              <button
                type="button"
                onClick={() => router.push(`/?viaje=${id}`)}
                className="w-full mb-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm"
              >
                🚙 Iniciar recorrido ({pendientes.length} sucursal
                {pendientes.length > 1 ? "es" : ""} pendiente
                {pendientes.length > 1 ? "s" : ""})
              </button>
            ) : (
              <p className="mb-6 p-3 bg-green-50 text-green-800 rounded-lg text-sm text-center">
                ✅ Todas las sucursales de este viaje están visitadas.
              </p>
            );
          })()}

          <ul className="space-y-3 mb-6">
            {datos.paradas.map((p) => {
              const atrasada =
                p.estado !== ESTADO_PARADA.VISITADA && p.fechaPlanificada < hoy;
              const abierta = accion?.paradaId === p.id;
              return (
                <li
                  key={p.id}
                  className={`p-3 bg-white border rounded-lg ${atrasada ? "border-red-300" : ""}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {nombreSucursal(p.sucursalId)}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Planificada {formatDate(p.fechaPlanificada)}
                        {p.fechaEfectiva &&
                          ` · Efectiva ${formatDate(p.fechaEfectiva)}`}
                        {` · Equipos ${p.equiposRealizados || 0}/${p.equiposPlanificados}`}
                      </p>
                      {p.motivoId && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Motivo: {nombreMotivo(p.motivoId)}
                          {p.motivoDetalle && ` — ${p.motivoDetalle}`}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${BADGE[p.estado]}`}
                    >
                      {atrasada ? "Atrasada · " : ""}
                      {ESTADO_PARADA_LABEL[p.estado]}
                    </span>
                  </div>

                  {p.estado !== ESTADO_PARADA.VISITADA && !abierta && (
                    <div className="flex gap-4 mt-2 text-sm">
                      <button
                        type="button"
                        onClick={() =>
                          setAccion({ paradaId: p.id, tipo: "no_visitada" })
                        }
                        className="text-red-600 hover:underline"
                      >
                        No visitada
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setAccion({ paradaId: p.id, tipo: "reprogramar" })
                        }
                        className="text-blue-600 hover:underline"
                      >
                        Reprogramar
                      </button>
                    </div>
                  )}

                  {abierta && (
                    <AccionParada
                      parada={p}
                      tipo={accion.tipo}
                      motivos={datos.motivos}
                      viajes={datos.viajes}
                      onCancelar={() => setAccion(null)}
                      onHecho={() => {
                        setAccion(null);
                        cargar();
                      }}
                    />
                  )}

                  {p.historial?.length > 0 && (
                    <details className="mt-2 text-xs text-gray-500">
                      <summary className="cursor-pointer">
                        Historial ({p.historial.length})
                      </summary>
                      <ul className="mt-1 space-y-0.5">
                        {p.historial.map((h, i) => (
                          <li key={i}>
                            {h.at?.slice(0, 10)} ·{" "}
                            {h.tipo === "reprogramada"
                              ? `Reprogramada de ${formatDate(h.fechaAnterior)} a ${formatDate(h.nuevaFecha)}`
                              : "No visitada"}{" "}
                            · {nombreMotivo(h.motivoId)}
                            {h.detalle && ` — ${h.detalle}`}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </li>
              );
            })}
          </ul>

          <section className="p-3 bg-white border rounded-lg">
            <h2 className="font-semibold mb-2">Recorridos de este viaje</h2>
            {datos.recorridos.length === 0 ? (
              <p className="text-sm text-gray-500">
                Todavía no se inició ningún recorrido desde este viaje.
              </p>
            ) : (
              <ul className="text-sm space-y-1">
                {datos.recorridos.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap justify-between gap-2"
                  >
                    <Link
                      href={`/?id=${r.id}`}
                      className="text-manzur-primary hover:underline"
                    >
                      {formatDate(r.fechaRecorrido)} —{" "}
                      {r.visitante || "Sin visitante"}
                    </Link>
                    <span className="text-gray-500">{r.estado}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
  