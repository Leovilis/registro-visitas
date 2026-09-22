// src/app/services/programaService.js
import { db } from "@/app/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  runTransaction,
  arrayUnion,
} from "firebase/firestore";
import {
  ESTADO_PARADA,
  TECNICOS_DEFAULT,
  totalesDesdeAportes,
  createParada,
  idViaje,
  idParada,
  sumarAnio,
} from "@/app/models/programaModel";
import { TIPO_TAREA, getEquiposRealizados } from "@/app/models/recorridoModel";

const PROGRAMAS = "programas";
const VIAJES = "viajesPlan";
const PARADAS = "paradasPlan";
const MOTIVOS = "motivosNoVisita";

const ahora = () => new Date().toISOString();
const porId = (snap) => snap.docs.map((d) => ({ ...d.data(), id: d.id }));

// ------------------------------------------------------------
// Lectura
// ------------------------------------------------------------

export const getPrograma = async (programaId) => {
  const snap = await getDoc(doc(db, PROGRAMAS, String(programaId)));
  return snap.exists() ? { ...snap.data(), id: snap.id } : null;
};

export const listViajes = async (programaId) =>
  porId(
    await getDocs(
      query(
        collection(db, VIAJES),
        where("programaId", "==", String(programaId)),
      ),
    ),
  ).sort((a, b) => a.nro - b.nro);

const ordenarPorFecha = (a, b) =>
  (a.fechaPlanificada || "").localeCompare(b.fechaPlanificada || "");

export const listParadas = async (
  programaId,
  { incluirAnuladas = false } = {},
) =>
  porId(
    await getDocs(
      query(
        collection(db, PARADAS),
        where("programaId", "==", String(programaId)),
      ),
    ),
  )
    .filter((p) => incluirAnuladas || !p.anulada)
    .sort(ordenarPorFecha);

export const getViaje = async (viajeId) => {
  const snap = await getDoc(doc(db, VIAJES, viajeId));
  return snap.exists() ? { ...snap.data(), id: snap.id } : null;
};

export const listParadasDeViaje = async (
  viajeId,
  { incluirAnuladas = false } = {},
) =>
  porId(
    await getDocs(
      query(collection(db, PARADAS), where("viajeId", "==", viajeId)),
    ),
  )
    .filter((p) => incluirAnuladas || !p.anulada)
    .sort(ordenarPorFecha);

export const listMotivos = async () =>
  porId(await getDocs(collection(db, MOTIVOS)))
    .filter((m) => m.activo !== false)
    .sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99));

// ------------------------------------------------------------
// Acciones sobre paradas
// ------------------------------------------------------------

export const marcarNoVisitada = async (
  paradaId,
  { motivoId, detalle = "" },
) => {
  if (!motivoId) throw new Error("El motivo es obligatorio");
  await updateDoc(doc(db, PARADAS, paradaId), {
    estado: ESTADO_PARADA.NO_VISITADA,
    motivoId,
    motivoDetalle: detalle,
    updatedAt: ahora(),
    historial: arrayUnion({
      tipo: "no_visitada",
      motivoId,
      detalle,
      at: ahora(),
    }),
  });
};

/** Mueve la parada a otra fecha y opcionalmente a otro viaje. Exige motivo. */
export const reprogramarParada = async (
  paradaId,
  { nuevaFecha, nuevoViajeId, motivoId, detalle = "" },
) => {
  if (!nuevaFecha) throw new Error("La nueva fecha es obligatoria");
  if (!motivoId) throw new Error("El motivo es obligatorio");
  const ref = doc(db, PARADAS, paradaId);
  let viajeAnterior = null;
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("La parada no existe");
    const p = snap.data();
    viajeAnterior = p.viajeId;
    tx.update(ref, {
      estado: ESTADO_PARADA.REPROGRAMADA,
      fechaPlanificada: nuevaFecha,
      ...(nuevoViajeId ? { viajeId: nuevoViajeId } : {}),
      motivoId,
      motivoDetalle: detalle,
      updatedAt: ahora(),
      historial: arrayUnion({
        tipo: "reprogramada",
        fechaAnterior: p.fechaPlanificada,
        viajeAnterior: p.viajeId,
        nuevaFecha,
        motivoId,
        detalle,
        at: ahora(),
      }),
    });
  });
  await recalcularFechasViaje(viajeAnterior);
  if (nuevoViajeId && nuevoViajeId !== viajeAnterior)
    await recalcularFechasViaje(nuevoViajeId);
};

// ------------------------------------------------------------
// Vínculo recorrido → programa
// ------------------------------------------------------------

const tieneMantenimientoFinalizado = (visita) =>
  (visita.tareas || []).some(
    (t) => t.tipo === TIPO_TAREA.MANTENIMIENTO && t.completada,
  );

/**
 * Busca la parada del programa para una sucursal cuando la visita no trae
 * paradaPlanId (visita no iniciada desde el programa, p.ej. Salta Boutique).
 * Prioridad: 1) no visitada todavía  2) visitada pero incompleta (Sleiman:
 * el segundo depósito completa la misma parada). Si no hay, es una visita
 * extra fuera del programa y no se vincula.
 */
const buscarParadaAbierta = async (sucursalId, anio) => {
  const snap = await getDocs(
    query(
      collection(db, PARADAS),
      where("programaId", "==", String(anio)),
      where("sucursalId", "==", sucursalId),
    ),
  );
  const paradas = porId(snap).filter((p) => !p.anulada);
  return (
    paradas.find((p) => p.estado !== ESTADO_PARADA.VISITADA) ||
    paradas.find(
      (p) => (p.equiposRealizados || 0) < (p.equiposPlanificados || 0),
    ) ||
    null
  );
};

/**
 * Aplica un recorrido finalizado al programa.
 * Solo cuentan las visitas con una tarea de mantenimiento finalizada.
 * Es idempotente: cada recorrido guarda su aporte con su propia clave.
 *
 * @returns {{ asignaciones: Record<visitaId, paradaId>, resumen: Array, sinParada: Array }}
 */
export const aplicarRecorridoAlPrograma = async (recorridoId, recorrido) => {
  const tecnicos = (recorrido.visitante || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // 1) Resolver la parada de cada visita
  const asignaciones = {};
  const sinParada = [];
  for (const v of recorrido.visitas || []) {
    if (!v.sucursalId || !tieneMantenimientoFinalizado(v)) continue;
    let paradaId = v.paradaPlanId;
    if (!paradaId) {
      const anio = (v.fecha || recorrido.fechaRecorrido || "").slice(0, 4);
      const p = anio ? await buscarParadaAbierta(v.sucursalId, anio) : null;
      paradaId = p?.id || null;
    }
    if (paradaId) asignaciones[v.id] = paradaId;
    else sinParada.push({ visitaId: v.id, sucursal: v.sucursal });
  }

  // 2) Agrupar por parada (dos depósitos → una parada)
  const grupos = {};
  for (const v of recorrido.visitas || []) {
    const paradaId = asignaciones[v.id];
    if (!paradaId) continue;
    grupos[paradaId] ??= { equipos: 0, fechas: [], visitaIds: [] };
    grupos[paradaId].equipos += getEquiposRealizados(v);
    if (v.fecha) grupos[paradaId].fechas.push(v.fecha);
    grupos[paradaId].visitaIds.push(v.id);
  }

  // 3) Escribir el aporte en cada parada
  const resumen = [];
  for (const [paradaId, g] of Object.entries(grupos)) {
    const ref = doc(db, PARADAS, paradaId);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) return;
      const p = snap.data();
      const aportes = {
        ...(p.aportes || {}),
        [recorridoId]: {
          equipos: g.equipos,
          fecha: g.fechas.sort()[0] || recorrido.fechaRecorrido || null,
          visitaIds: g.visitaIds,
        },
      };
      const totales = totalesDesdeAportes(aportes);
      tx.update(ref, {
        aportes,
        ...totales,
        estado: ESTADO_PARADA.VISITADA,
        motivoId: null,
        motivoDetalle: "",
        tecnicosReales: tecnicos,
        recorridoIds: arrayUnion(recorridoId),
        updatedAt: ahora(),
      });
      resumen.push({
        paradaId,
        equiposRealizados: totales.equiposRealizados,
        equiposPlanificados: p.equiposPlanificados,
      });
    });
  }

  return { asignaciones, resumen, sinParada };
};

// ------------------------------------------------------------
// Edición del plan
// ------------------------------------------------------------

/** El inicio y fin del viaje se derivan de sus paradas activas. */
export const recalcularFechasViaje = async (viajeId) => {
  if (!viajeId) return;
  const paradas = await listParadasDeViaje(viajeId);
  if (paradas.length === 0) return; // sin paradas: se conserva la fecha cargada a mano
  const fechas = paradas
    .map((p) => p.fechaPlanificada)
    .filter(Boolean)
    .sort();
  await updateDoc(doc(db, VIAJES, viajeId), {
    fechaInicio: fechas[0],
    fechaFin: fechas[fechas.length - 1],
    updatedAt: ahora(),
  });
};

/**
 * Crea el programa de un año. Con `copiarDe` replica los viajes y paradas
 * activas de ese año, un año después, todas pendientes y con los equipos
 * actuales del catálogo.
 */
export const crearPrograma = async ({
  anio,
  version = "01",
  fechaVigencia = "",
  referencia = "",
  tecnicos = TECNICOS_DEFAULT,
  copiarDe = null,
  sucursales = [],
}) => {
  const id = String(anio);
  if (await getPrograma(id)) throw new Error(`Ya existe el programa ${anio}`);

  const batch = writeBatch(db);
  batch.set(doc(db, PROGRAMAS, id), {
    id,
    anio: Number(anio),
    formulario: "F-ST-02",
    version,
    fechaVigencia,
    referencia,
    tecnicos,
    createdAt: ahora(),
  });

  let copiados = { viajes: 0, paradas: 0 };
  if (copiarDe) {
    const [viajes, paradas] = await Promise.all([
      listViajes(copiarDe),
      listParadas(copiarDe),
    ]);
    const salto = Number(anio) - Number(copiarDe);
    for (const v of viajes) {
      const nuevoViajeId = idViaje(anio, v.nro);
      batch.set(doc(db, VIAJES, nuevoViajeId), {
        id: nuevoViajeId,
        programaId: id,
        nro: v.nro,
        fechaInicio: sumarAnio(v.fechaInicio, salto),
        fechaFin: sumarAnio(v.fechaFin, salto),
        tecnicos: v.tecnicos || [],
        createdAt: ahora(),
      });
      copiados.viajes++;
      for (const p of paradas.filter((x) => x.viajeId === v.id)) {
        const suc = sucursales.find((s) => s.id === p.sucursalId);
        if (suc && suc.activa === false) continue;
        const nueva = createParada({
          id: idParada(anio, p.sucursalId),
          programaId: id,
          viajeId: nuevoViajeId,
          sucursalId: p.sucursalId,
          fechaPlanificada: sumarAnio(p.fechaPlanificada, salto),
          tecnicosPlan: p.tecnicosPlan || v.tecnicos || [],
          equiposPlanificados: suc?.equipos ?? p.equiposPlanificados,
        });
        batch.set(doc(db, PARADAS, nueva.id), { ...nueva, createdAt: ahora() });
        copiados.paradas++;
      }
    }
  }

  await batch.commit(); // máx. 500 operaciones: sobra para un programa anual
  return copiados;
};

export const actualizarPrograma = async (programaId, campos) => {
  await updateDoc(doc(db, PROGRAMAS, String(programaId)), {
    ...campos,
    updatedAt: ahora(),
  });
};

export const crearViaje = async (
  programaId,
  { fechaInicio, tecnicos = [] },
) => {
  const viajes = await listViajes(programaId);
  const nro = viajes.reduce((max, v) => Math.max(max, v.nro), 0) + 1;
  const id = idViaje(programaId, nro);
  await setDoc(doc(db, VIAJES, id), {
    id,
    programaId: String(programaId),
    nro,
    fechaInicio,
    fechaFin: fechaInicio,
    tecnicos,
    createdAt: ahora(),
  });
  return id;
};

export const actualizarViaje = async (viajeId, campos) => {
  await updateDoc(doc(db, VIAJES, viajeId), { ...campos, updatedAt: ahora() });
};

/** Solo se puede eliminar un viaje sin paradas activas (moverlas o anularlas antes). */
export const eliminarViaje = async (viajeId) => {
  const paradas = await listParadasDeViaje(viajeId);
  if (paradas.length > 0) {
    throw new Error(
      "El viaje tiene sucursales. Movelas a otro viaje o anulalas antes de eliminarlo.",
    );
  }
  await deleteDoc(doc(db, VIAJES, viajeId));
};

export const agregarParada = async (
  viaje,
  { sucursalId, fechaPlanificada, equiposPlanificados, tecnicosPlan },
) => {
  if (!sucursalId || !fechaPlanificada)
    throw new Error("Sucursal y fecha son obligatorias");

  const existentes = porId(
    await getDocs(
      query(
        collection(db, PARADAS),
        where("programaId", "==", viaje.programaId),
        where("sucursalId", "==", sucursalId),
      ),
    ),
  );
  if (existentes.some((p) => !p.anulada)) {
    throw new Error("Esa sucursal ya está en el programa de este año.");
  }

  const parada = createParada({
    id: idParada(viaje.programaId, sucursalId, existentes.length + 1),
    programaId: viaje.programaId,
    viajeId: viaje.id,
    sucursalId,
    fechaPlanificada,
    tecnicosPlan: tecnicosPlan?.length ? tecnicosPlan : viaje.tecnicos || [],
    equiposPlanificados: Number(equiposPlanificados) || 0,
  });
  await setDoc(doc(db, PARADAS, parada.id), { ...parada, createdAt: ahora() });
  await recalcularFechasViaje(viaje.id);
  return parada.id;
};

export const actualizarParada = async (
  paradaId,
  { fechaPlanificada, equiposPlanificados, tecnicosPlan },
) => {
  const ref = doc(db, PARADAS, paradaId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("La parada no existe");
  const p = snap.data();

  const cambios = { updatedAt: ahora() };
  if (fechaPlanificada !== undefined)
    cambios.fechaPlanificada = fechaPlanificada;
  if (equiposPlanificados !== undefined)
    cambios.equiposPlanificados = Number(equiposPlanificados) || 0;
  if (tecnicosPlan !== undefined) cambios.tecnicosPlan = tecnicosPlan;
  if (fechaPlanificada && fechaPlanificada !== p.fechaPlanificada) {
    cambios.historial = arrayUnion({
      tipo: "editada",
      fechaAnterior: p.fechaPlanificada,
      nuevaFecha: fechaPlanificada,
      at: ahora(),
    });
  }
  await updateDoc(ref, cambios);
  await recalcularFechasViaje(p.viajeId);
};

/** Saca la sucursal del programa sin borrar el registro. No se puede con una ya visitada. */
export const anularParada = async (paradaId, detalle = "") => {
  const ref = doc(db, PARADAS, paradaId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("La parada no existe");
  const p = snap.data();
  if (p.estado === ESTADO_PARADA.VISITADA) {
    throw new Error("No se puede anular una sucursal ya visitada.");
  }
  await updateDoc(ref, {
    anulada: true,
    updatedAt: ahora(),
    historial: arrayUnion({ tipo: "anulada", detalle, at: ahora() }),
  });
  await recalcularFechasViaje(p.viajeId);
};
