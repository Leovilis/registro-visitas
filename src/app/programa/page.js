// src/app/programa/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/app/components/layout/Header";
import { LoadingSpinner } from "@/app/components/common/LoadingSpinner";
import {
  listViajes,
  listParadas,
  listMotivos,
  getPrograma,
} from "@/app/services/programaService";
import { firestoreService } from "@/app/services/firestoreService";
import { getEmpresa, EMPRESAS } from "@/app/data/catalogoSucursales";
import { descargarFST02 } from "@/app/utils/exportarFST02";
import {
  ESTADO_PARADA,
  ESTADO_PARADA_LABEL,
  calcularIndicadores,
} from "@/app/models/programaModel";
import { fechaLocalISO } from "@/app/models/recorridoModel";
import { formatDate } from "@/app/utils/formatters";

const BADGE = {
  [ESTADO_PARADA.PENDIENTE]: "bg-gray-100 text-gray-700",
  [ESTADO_PARADA.VISITADA]: "bg-green-100 text-green-800",
  [ESTADO_PARADA.NO_VISITADA]: "bg-red-100 text-red-800",
  [ESTADO_PARADA.REPROGRAMADA]: "bg-blue-100 text-blue-800",
};

const pct = (x) =>
  x == null
    ? "—"
    : `${(x * 100).toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`;

function Kpi({ titulo, valor, detalle, alerta }) {
  return (
    <div
      className={`p-3 bg-white border rounded-lg ${alerta ? "border-red-300" : ""}`}
    >
      <p className="text-xs text-gray-500">{titulo}</p>
      <p
        className={`text-xl sm:text-2xl font-bold ${alerta ? "text-red-600" : "text-manzur-primary"}`}
      >
        {valor}
      </p>
      {detalle && <p className="text-xs text-gray-500 mt-1">{detalle}</p>}
    </div>
  );
}

export default function ProgramaPage() {
  const hoy = fechaLocalISO();
  const [anio, setAnio] = useState(Number(hoy.slice(0, 4)));
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportando, setExportando] = useState(false);

  const exportar = async () => {
    setExportando(true);
    try {
      await descargarFST02({ ...datos, empresas: EMPRESAS });
    } catch (e) {
      console.error(e);
      alert("No se pudo generar el Excel: " + e.message);
    } finally {
      setExportando(false);
    }
  };

  useEffect(() => {
    let activo = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [programa, viajes, paradas, motivos, sucursales] =
          await Promise.all([
            getPrograma(anio),
            listViajes(anio),
            listParadas(anio),
            listMotivos(),
            firestoreService.getSucursales(),
          ]);
        if (activo)
          setDatos({ programa, viajes, paradas, motivos, sucursales });
      } catch (e) {
        console.error(e);
        if (activo) setError(e.message);
      } finally {
        if (activo) setLoading(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [anio]);

  const ind = useMemo(
    () => (datos ? calcularIndicadores(datos.paradas, hoy) : null),
    [datos, hoy],
  );

  const nombreSucursal = (sucursalId) => {
    const s = datos?.sucursales.find((x) => x.id === sucursalId);
    if (!s) return sucursalId;
    return `${s.nombre} (${getEmpresa(s.empresaId)?.nombre || s.empresaId})`;
  };
  const nombreMotivo = (id) =>
    datos?.motivos.find((m) => m.id === id)?.descripcion || id;

  return (
    <div className="container mx-auto max-w-4xl px-3 py-4 sm:p-4">
      <Header titulo="PROGRAMA DE MANTENIMIENTO PREVENTIVO" subtitulo="F-ST-02">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/programa/editar?anio=${anio}`}
            className="text-sm text-manzur-primary hover:underline"
          >
            ✏️ Editar plan
          </Link>
          {datos?.programa && (
            <button
              type="button"
              onClick={exportar}
              disabled={exportando}
              className="text-sm text-manzur-primary hover:underline disabled:opacity-50"
            >
              {exportando ? "Generando..." : "⬇️ Exportar F-ST-02"}
            </button>
          )}
          <select
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="px-2 py-1 border rounded-md text-sm"
          >
            {[anio - 1, anio, anio + 1].map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </Header>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
          Error al cargar: {error}
        </p>
      ) : !datos.programa ? (
        <p className="p-8 text-center text-gray-500 bg-white border border-dashed rounded-lg">
          No hay programa cargado para {anio}.{" "}
          <Link
            href={`/programa/editar?anio=${anio}`}
            className="text-manzur-primary hover:underline"
          >
            Crearlo
          </Link>
        </p>
      ) : (
        <>
          {/* Indicadores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Kpi
              titulo="Avance anual (equipos)"
              valor={pct(ind.avanceEquipos)}
              detalle={`${ind.equiposRealizados} de ${ind.equiposPlanificados} equipos`}
            />
            <Kpi
              titulo="Avance anual (sucursales)"
              valor={pct(ind.avanceSucursales)}
              detalle={`${ind.paradasVisitadas} de ${ind.totalParadas} sucursales`}
            />
            <Kpi
              titulo="Cumplimiento a la fecha"
              valor={pct(ind.cumplimientoSucursales)}
              detalle={`Equipos: ${pct(ind.cumplimientoEquipos)} · ${ind.paradasVencidas} vencidas`}
              alerta={
                ind.cumplimientoSucursales != null &&
                ind.cumplimientoSucursales < 1
              }
            />
            <Kpi
              titulo="Desvío promedio"
              valor={
                ind.desvioPromedioDias == null
                  ? "—"
                  : `${ind.desvioPromedioDias > 0 ? "+" : ""}${ind.desvioPromedioDias.toFixed(1)} d`
              }
              detalle="Fecha efectiva vs. planificada"
            />
          </div>

          {/* Atrasadas */}
          {ind.atrasadas.length > 0 && (
            <section className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <h2 className="font-semibold text-red-800 mb-2">
                ⚠️ Atrasadas ({ind.atrasadas.length})
              </h2>
              <ul className="text-sm space-y-1">
                {ind.atrasadas.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap justify-between gap-2"
                  >
                    <Link
                      href={`/programa/viaje/${p.viajeId}`}
                      className="hover:underline"
                    >
                      {nombreSucursal(p.sucursalId)}
                    </Link>
                    <span className="text-red-700">
                      planificada {formatDate(p.fechaPlanificada)}
                      {p.motivoId
                        ? ` · ${nombreMotivo(p.motivoId)}`
                        : " · sin motivo cargado"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Viajes */}
          <section className="space-y-3">
            {datos.viajes.map((v) => {
              const paradas = datos.paradas.filter((p) => p.viajeId === v.id);
              const plan = paradas.reduce(
                (a, p) => a + (p.equiposPlanificados || 0),
                0,
              );
              const real = paradas.reduce(
                (a, p) => a + (p.equiposRealizados || 0),
                0,
              );
              return (
                <details
                  key={v.id}
                  className="bg-white border rounded-lg"
                  open={v.fechaFin >= hoy}
                >
                  <summary className="p-3 cursor-pointer flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-semibold">Viaje {v.nro}</span>
                    <span className="text-sm text-gray-600">
                      {formatDate(v.fechaInicio)}
                      {v.fechaFin !== v.fechaInicio &&
                        ` al ${formatDate(v.fechaFin)}`}
                    </span>
                    <span className="text-sm text-gray-600">
                      👥 {v.tecnicos?.join(", ")}
                    </span>
                    <span className="ml-auto text-sm font-medium">
                      {real}/{plan} equipos
                    </span>
                    <Link
                      href={`/programa/viaje/${v.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm text-manzur-primary hover:underline"
                    >
                      Abrir →
                    </Link>
                  </summary>
                  {/* Mobile: tarjetas */}
                  <ul className="sm:hidden border-t divide-y">
                    {paradas.map((p) => (
                      <li key={p.id} className="p-3 text-sm">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-medium">
                            {nombreSucursal(p.sucursalId)}
                          </span>
                          <span
                            className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${BADGE[p.estado]}`}
                          >
                            {ESTADO_PARADA_LABEL[p.estado]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Plan {formatDate(p.fechaPlanificada)}
                          {p.fechaEfectiva &&
                            ` · Real ${formatDate(p.fechaEfectiva)}`}
                          {` · ${p.equiposRealizados || 0}/${p.equiposPlanificados} equipos`}
                        </p>
                        {p.motivoId && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {nombreMotivo(p.motivoId)}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>

                  {/* Escritorio: tabla */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm border-t">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="text-left p-2">Sucursal</th>
                          <th className="text-left p-2">Planificada</th>
                          <th className="text-left p-2">Efectiva</th>
                          <th className="text-right p-2">Equipos</th>
                          <th className="text-left p-2">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paradas.map((p) => (
                          <tr key={p.id} className="border-t align-top">
                            <td className="p-2">
                              {nombreSucursal(p.sucursalId)}
                            </td>
                            <td className="p-2">
                              {formatDate(p.fechaPlanificada)}
                            </td>
                            <td className="p-2">
                              {p.fechaEfectiva
                                ? formatDate(p.fechaEfectiva)
                                : "—"}
                            </td>
                            <td className="p-2 text-right">
                              {p.equiposRealizados || 0}/{p.equiposPlanificados}
                            </td>
                            <td className="p-2">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${BADGE[p.estado]}`}
                              >
                                {ESTADO_PARADA_LABEL[p.estado]}
                              </span>
                              {p.motivoId && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {nombreMotivo(p.motivoId)}
                                </p>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}
