// src/app/programa/editar/page.js
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Header } from "@/app/components/layout/Header";
import { LoadingSpinner } from "@/app/components/common/LoadingSpinner";
import {
  getPrograma,
  listViajes,
  listParadas,
  crearPrograma,
  actualizarPrograma,
  crearViaje,
  actualizarViaje,
  eliminarViaje,
  agregarParada,
  actualizarParada,
  anularParada,
} from "@/app/services/programaService";
import { firestoreService } from "@/app/services/firestoreService";
import { EMPRESAS, getEmpresa } from "@/app/data/catalogoSucursales";
import {
  ESTADO_PARADA,
  ESTADO_PARADA_LABEL,
  TECNICOS_DEFAULT,
} from "@/app/models/programaModel";
import { fechaLocalISO } from "@/app/models/recorridoModel";
import { formatDate } from "@/app/utils/formatters";

const inputCls = "px-2 py-1.5 border border-gray-300 rounded-md text-sm";
const btnPrimario =
  "px-3 py-1.5 text-sm bg-manzur-primary text-white rounded-md disabled:opacity-50";

const nombreSuc = (s) =>
  s ? `${s.nombre} (${getEmpresa(s.empresaId)?.nombre || s.empresaId})` : "";

// Chips para elegir técnicos
function SelectorTecnicos({ opciones, value, onChange }) {
  const toggle = (t) =>
    onChange(value.includes(t) ? value.filter((x) => x !== t) : [...value, t]);
  return (
    <div className="flex flex-wrap gap-1">
      {opciones.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => toggle(t)}
          className={`px-2 py-0.5 text-xs rounded-full border ${
            value.includes(t)
              ? "bg-manzur-primary text-white border-manzur-primary"
              : "bg-white text-gray-600"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// ------------------------------------------------------------
// Crear programa
// ------------------------------------------------------------
function CrearPrograma({ anio, sucursales, onCreado }) {
  const [version, setVersion] = useState("01");
  const [fechaVigencia, setFechaVigencia] = useState("");
  const [referencia, setReferencia] = useState("");
  const [copiar, setCopiar] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const crear = async () => {
    setGuardando(true);
    setError(null);
    try {
      const anterior = copiar && (await getPrograma(anio - 1));
      const r = await crearPrograma({
        anio,
        version,
        fechaVigencia,
        referencia,
        tecnicos: anterior?.tecnicos || TECNICOS_DEFAULT,
        copiarDe: anterior ? anio - 1 : null,
        sucursales,
      });
      alert(
        anterior
          ? `Programa ${anio} creado: se copiaron ${r.viajes} viajes y ${r.paradas} sucursales de ${anio - 1}. Revisá las fechas.`
          : `Programa ${anio} creado vacío.`,
      );
      onCreado();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="p-4 bg-white border rounded-lg space-y-3">
      <h2 className="font-semibold">No hay programa para {anio}. Crearlo:</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="text-sm">
          <span className="block text-gray-600 mb-1">Versión</span>
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className={`${inputCls} w-full`}
          />
        </label>
        <label className="text-sm">
          <span className="block text-gray-600 mb-1">Fecha de vigencia</span>
          <input
            type="date"
            value={fechaVigencia}
            onChange={(e) => setFechaVigencia(e.target.value)}
            className={`${inputCls} w-full`}
          />
        </label>
        <label className="text-sm">
          <span className="block text-gray-600 mb-1">Referencia</span>
          <input
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            className={`${inputCls} w-full`}
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={copiar}
          onChange={(e) => setCopiar(e.target.checked)}
        />
        Copiar viajes y sucursales de {anio - 1} (mismas fechas, un año después,
        todo pendiente)
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={crear}
        disabled={guardando}
        className={btnPrimario}
      >
        {guardando ? "Creando..." : `Crear programa ${anio}`}
      </button>
    </section>
  );
}

// ------------------------------------------------------------
// Fila editable de una parada
// ------------------------------------------------------------
function FilaParada({ parada, sucursal, tecnicos, onCambio }) {
  const [fecha, setFecha] = useState(parada.fechaPlanificada || "");
  const [equipos, setEquipos] = useState(parada.equiposPlanificados ?? 0);
  const [tec, setTec] = useState(parada.tecnicosPlan || []);
  const [guardando, setGuardando] = useState(false);
  const visitada = parada.estado === ESTADO_PARADA.VISITADA;
  const cambiado =
    fecha !== parada.fechaPlanificada ||
    Number(equipos) !== parada.equiposPlanificados ||
    tec.join() !== (parada.tecnicosPlan || []).join();

  const guardar = async () => {
    setGuardando(true);
    try {
      await actualizarParada(parada.id, {
        fechaPlanificada: fecha,
        equiposPlanificados: equipos,
        tecnicosPlan: tec,
      });
      onCambio();
    } catch (e) {
      alert(e.message);
    } finally {
      setGuardando(false);
    }
  };

  const anular = async () => {
    const detalle = prompt(
      `¿Sacar ${sucursal?.nombre || "la sucursal"} del programa? Indicá el motivo:`,
    );
    if (detalle === null) return;
    try {
      await anularParada(parada.id, detalle);
      onCambio();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <li className="py-2 border-t first:border-t-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex-1 min-w-[180px] text-sm font-medium">
          {nombreSuc(sucursal) || parada.sucursalId}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
          {ESTADO_PARADA_LABEL[parada.estado]}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          disabled={visitada}
          className={inputCls}
        />
        <label className="text-xs text-gray-600 flex items-center gap-1">
          Equipos
          <input
            type="number"
            min="0"
            value={equipos}
            onChange={(e) => setEquipos(e.target.value)}
            className={`${inputCls} w-16`}
          />
        </label>
        <SelectorTecnicos opciones={tecnicos} value={tec} onChange={setTec} />
        <div className="ml-auto flex gap-2">
          {cambiado && (
            <button
              type="button"
              onClick={guardar}
              disabled={guardando}
              className={btnPrimario}
            >
              {guardando ? "..." : "Guardar"}
            </button>
          )}
          {!visitada && (
            <button
              type="button"
              onClick={anular}
              className="text-xs text-red-600 hover:underline"
            >
              Quitar
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

// ------------------------------------------------------------
// Agregar sucursal a un viaje
// ------------------------------------------------------------
function AgregarSucursal({ viaje, disponibles, onCambio }) {
  const [empresaId, setEmpresaId] = useState("");
  const [sucursalId, setSucursalId] = useState("");
  const [fecha, setFecha] = useState(viaje.fechaInicio || "");
  const [equipos, setEquipos] = useState("");
  const [guardando, setGuardando] = useState(false);

  const opciones = disponibles.filter(
    (s) => !empresaId || s.empresaId === empresaId,
  );
  const elegir = (id) => {
    setSucursalId(id);
    const s = disponibles.find((x) => x.id === id);
    setEquipos(s?.equipos ?? "");
  };

  const agregar = async () => {
    setGuardando(true);
    try {
      await agregarParada(viaje, {
        sucursalId,
        fechaPlanificada: fecha,
        equiposPlanificados: equipos,
      });
      setSucursalId("");
      setEquipos("");
      onCambio();
    } catch (e) {
      alert(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-dashed">
      <select
        value={empresaId}
        onChange={(e) => {
          setEmpresaId(e.target.value);
          setSucursalId("");
        }}
        className={inputCls}
      >
        <option value="">Todas las empresas</option>
        {EMPRESAS.map((e) => (
          <option key={e.id} value={e.id}>
            {e.nombre}
          </option>
        ))}
      </select>
      <select
        value={sucursalId}
        onChange={(e) => elegir(e.target.value)}
        className={inputCls}
      >
        <option value="">+ Sucursal…</option>
        {opciones.map((s) => (
          <option key={s.id} value={s.id}>
            {nombreSuc(s)}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        className={inputCls}
      />
      <input
        type="number"
        min="0"
        placeholder="Equipos"
        value={equipos}
        onChange={(e) => setEquipos(e.target.value)}
        className={`${inputCls} w-20`}
      />
      <button
        type="button"
        onClick={agregar}
        disabled={!sucursalId || !fecha || guardando}
        className={btnPrimario}
      >
        Agregar
      </button>
    </div>
  );
}

// ------------------------------------------------------------
// Página
// ------------------------------------------------------------
function EditorPrograma() {
  const searchParams = useSearchParams();
  const hoy = fechaLocalISO();
  const [anio, setAnio] = useState(
    Number(searchParams.get("anio")) || Number(hoy.slice(0, 4)),
  );
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [nuevoViaje, setNuevoViaje] = useState({
    fechaInicio: "",
    tecnicos: [],
  });

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [programa, viajes, paradas, sucursales] = await Promise.all([
        getPrograma(anio),
        listViajes(anio),
        listParadas(anio),
        firestoreService.getSucursales(),
      ]);
      setDatos({ programa, viajes, paradas, sucursales });
      setMeta(
        programa
          ? {
              version: programa.version || "",
              fechaVigencia: programa.fechaVigencia || "",
              referencia: programa.referencia || "",
              tecnicos: (programa.tecnicos || TECNICOS_DEFAULT).join(", "),
            }
          : null,
      );
    } catch (e) {
      alert("Error al cargar: " + e.message);
    } finally {
      setLoading(false);
    }
  }, [anio]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const tecnicos = useMemo(
    () => datos?.programa?.tecnicos || TECNICOS_DEFAULT,
    [datos],
  );

  // Sucursales con equipos que todavía no están en el programa
  const disponibles = useMemo(() => {
    if (!datos) return [];
    const usadas = new Set(datos.paradas.map((p) => p.sucursalId));
    return datos.sucursales.filter(
      (s) => s.activa !== false && !usadas.has(s.id),
    );
  }, [datos]);
  const faltantes = disponibles.filter((s) => s.equipos);

  const guardarMeta = async () => {
    try {
      await actualizarPrograma(anio, {
        version: meta.version,
        fechaVigencia: meta.fechaVigencia,
        referencia: meta.referencia,
        tecnicos: meta.tecnicos
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      cargar();
    } catch (e) {
      alert(e.message);
    }
  };

  const agregarViaje = async () => {
    try {
      await crearViaje(anio, nuevoViaje);
      setNuevoViaje({ fechaInicio: "", tecnicos: [] });
      cargar();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-3 py-4 sm:p-4">
      <Header
        titulo="EDITAR PROGRAMA"
        subtitulo="F-ST-02 — Programa de mantenimiento preventivo"
      >
        <div className="flex items-center gap-3">
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
          <Link
            href="/programa"
            className="text-sm text-manzur-primary hover:underline"
          >
            ← Tablero
          </Link>
        </div>
      </Header>

      {loading ? (
        <LoadingSpinner />
      ) : !datos.programa ? (
        <CrearPrograma
          anio={anio}
          sucursales={datos.sucursales}
          onCreado={cargar}
        />
      ) : (
        <div className="space-y-4">
          {/* Datos del documento */}
          <section className="p-4 bg-white border rounded-lg">
            <h2 className="font-semibold mb-3">Datos del documento</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="block text-gray-600 mb-1">N° de versión</span>
                <input
                  value={meta.version}
                  onChange={(e) =>
                    setMeta({ ...meta, version: e.target.value })
                  }
                  className={`${inputCls} w-full`}
                />
              </label>
              <label className="text-sm">
                <span className="block text-gray-600 mb-1">
                  Fecha de vigencia
                </span>
                <input
                  type="date"
                  value={meta.fechaVigencia}
                  onChange={(e) =>
                    setMeta({ ...meta, fechaVigencia: e.target.value })
                  }
                  className={`${inputCls} w-full`}
                />
              </label>
              <label className="text-sm">
                <span className="block text-gray-600 mb-1">Referencia</span>
                <input
                  value={meta.referencia}
                  onChange={(e) =>
                    setMeta({ ...meta, referencia: e.target.value })
                  }
                  className={`${inputCls} w-full`}
                />
              </label>
              <label className="text-sm">
                <span className="block text-gray-600 mb-1">
                  Técnicos (separados por coma)
                </span>
                <input
                  value={meta.tecnicos}
                  onChange={(e) =>
                    setMeta({ ...meta, tecnicos: e.target.value })
                  }
                  className={`${inputCls} w-full`}
                />
              </label>
            </div>
            <button
              type="button"
              onClick={guardarMeta}
              className={`${btnPrimario} mt-3`}
            >
              Guardar datos
            </button>
          </section>

          {faltantes.length > 0 && (
            <section className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <p className="font-medium text-yellow-900">
                Sucursales con equipos que no están en el programa:
              </p>
              <p className="text-yellow-800 mt-1">
                {faltantes.map(nombreSuc).join(" · ")}
              </p>
            </section>
          )}

          {/* Viajes */}
          {datos.viajes.map((v) => {
            const paradas = datos.paradas.filter((p) => p.viajeId === v.id);
            return (
              <section key={v.id} className="p-4 bg-white border rounded-lg">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="font-semibold">Viaje {v.nro}</h3>
                  <span className="text-sm text-gray-600">
                    {formatDate(v.fechaInicio)}
                    {v.fechaFin &&
                      v.fechaFin !== v.fechaInicio &&
                      ` al ${formatDate(v.fechaFin)}`}
                  </span>
                  <SelectorTecnicos
                    opciones={tecnicos}
                    value={v.tecnicos || []}
                    onChange={async (t) => {
                      await actualizarViaje(v.id, { tecnicos: t });
                      cargar();
                    }}
                  />
                  {paradas.length === 0 && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm(`¿Eliminar el viaje ${v.nro}?`)) return;
                        try {
                          await eliminarViaje(v.id);
                          cargar();
                        } catch (e) {
                          alert(e.message);
                        }
                      }}
                      className="ml-auto text-xs text-red-600 hover:underline"
                    >
                      Eliminar viaje
                    </button>
                  )}
                </div>
                <ul>
                  {paradas.map((p) => (
                    <FilaParada
                      key={`${p.id}-${p.updatedAt || ""}`}
                      parada={p}
                      sucursal={datos.sucursales.find(
                        (s) => s.id === p.sucursalId,
                      )}
                      tecnicos={tecnicos}
                      onCambio={cargar}
                    />
                  ))}
                </ul>
                <AgregarSucursal
                  viaje={v}
                  disponibles={disponibles}
                  onCambio={cargar}
                />
              </section>
            );
          })}

          {/* Nuevo viaje */}
          <section className="p-4 bg-white border border-dashed rounded-lg">
            <h3 className="font-semibold mb-2">Nuevo viaje</h3>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="date"
                value={nuevoViaje.fechaInicio}
                onChange={(e) =>
                  setNuevoViaje({ ...nuevoViaje, fechaInicio: e.target.value })
                }
                className={inputCls}
              />
              <SelectorTecnicos
                opciones={tecnicos}
                value={nuevoViaje.tecnicos}
                onChange={(t) => setNuevoViaje({ ...nuevoViaje, tecnicos: t })}
              />
              <button
                type="button"
                onClick={agregarViaje}
                disabled={!nuevoViaje.fechaInicio}
                className={btnPrimario}
              >
                Crear viaje {(datos.viajes.at(-1)?.nro || 0) + 1}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function EditarProgramaPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EditorPrograma />
    </Suspense>
  );
}
