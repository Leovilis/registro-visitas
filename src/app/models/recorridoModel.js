// src/app/models/recorridoModel.js
//
// Cambios respecto de la versión anterior (todos compatibles hacia atrás):
//  - visita: sucursalId, depositoId, fecha, paradaPlanId
//  - tarea:  tipo, equiposRealizados
//  - recorrido: viajePlanId
// Los campos de texto empresa / sucursal / provincia se siguen llenando
// (desnormalizados), así el formulario y el PDF actuales no se rompen.

import {
  resolverSucursalLegacy,
  getSucursal,
} from "@/app/data/catalogoSucursales";

export const ESTADO = {
  BORRADOR: "borrador",
  FINALIZADO: "finalizado",
};

export const TIPO_TAREA = {
  MANTENIMIENTO: "mantenimiento",
  INVENTARIO: "inventario",
  OTRA: "otra",
};

export const TIPO_TAREA_LABEL = {
  mantenimiento: "Mantenimiento preventivo",
  inventario: "Inventario",
  otra: "Otra",
};

// Esta versión de la app es solo para Sistemas
export const AREA_APP = "SISTEMAS";

// Vehículos habilitados. Los textos son EXACTAMENTE los del F-RD-05
// (check list de camionetas), para que el dato cruce sin traducciones.
export const VEHICULOS = [
  "Amarok - AB 862 EW",
  "Amarok - PKE 986",
  "Hilux -MVH 749",
  "Ranger NPM 806",
];

/** "Amarok (PKE986) - 12345 km" para el PDF y los listados. */
export const textoVehiculo = (r) =>
  [r?.vehiculo, r?.kilometraje ? `${r.kilometraje} km` : ""]
    .filter(Boolean)
    .join(" - ");

/**
 * Fecha local "YYYY-MM-DD". No usar toISOString(): devuelve la fecha en UTC
 * y en Argentina (UTC-3) después de las 21 h marca el día siguiente.
 */
export const fechaLocalISO = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const horaLocal = (d = new Date()) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

export const DESCRIPCION_MANTENIMIENTO =
  "MANTENIMIENTO Y CHEQUEO DE PERIFERICOS";

// ------------------------------------------------------------
// Creadores
// ------------------------------------------------------------

export const createEmptyTarea = (tipo = TIPO_TAREA.OTRA) => ({
  id: crypto.randomUUID(),
  descripcion: "",
  completada: false,
  tipo,
  equiposRealizados: null, // solo aplica a tipo "mantenimiento"
});

export const createEmptyVisita = (orden, fecha = "") => ({
  id: crypto.randomUUID(),
  orden,
  // Referencia al catálogo
  empresaId: "",
  sucursalId: "",
  depositoId: null,
  // Texto desnormalizado (lo usan el form y el PDF)
  empresa: "",
  sucursal: "",
  provincia: "",
  // Fecha efectiva de ESTA sucursal (un recorrido puede durar varios días)
  fecha,
  horarioIngreso: "",
  horarioEgreso: "",
  firma: "",
  tareas: [createEmptyTarea()],
  observaciones: "",
  // Vínculo con el programa F-ST-02
  paradaPlanId: null,
});

export const createEmptyRecorrido = () => {
  const hoy = fechaLocalISO();
  return {
    id: null,
    visitante: "",
    area: AREA_APP,
    fechaRecorrido: hoy,
    fechaSalida: "", // se completan con el botón "Ahora"
    fechaLlegada: "",
    horarioSalida: "",
    horarioLlegada: "",
    vehiculo: "",
    kilometraje: "",
    checklist: { salidaAt: null, entregaAt: null }, // F-RD-05 abierto desde la app
    observacionesGenerales: "",
    estado: ESTADO.BORRADOR,
    pdfUrl: null,
    viajePlanId: null,
    visitas: [createEmptyVisita(0, hoy)],
    createdAt: null,
    updatedAt: null,
  };
};

// ------------------------------------------------------------
// Tareas
// ------------------------------------------------------------

export const addTareaToVisita = (visita, tipo) => ({
  ...visita,
  tareas: [...visita.tareas, createEmptyTarea(tipo)],
});

export const removeTareaFromVisita = (visita, tareaId) => ({
  ...visita,
  tareas: visita.tareas.filter((t) => t.id !== tareaId),
});

export const updateTareaInVisita = (visita, tareaId, updates) => ({
  ...visita,
  tareas: visita.tareas.map((t) => {
    if (t.id !== tareaId) return t;
    const next = { ...t, ...updates };
    if (next.tipo !== TIPO_TAREA.MANTENIMIENTO) next.equiposRealizados = null;
    return next;
  }),
});

// ------------------------------------------------------------
// Visitas
// ------------------------------------------------------------

export const addVisitaToRecorrido = (recorrido) => {
  const ultima = recorrido.visitas[recorrido.visitas.length - 1];
  const fecha = ultima?.fecha || recorrido.fechaRecorrido || "";
  return {
    ...recorrido,
    visitas: [
      ...recorrido.visitas,
      createEmptyVisita(recorrido.visitas.length, fecha),
    ],
  };
};

export const removeVisitaFromRecorrido = (recorrido, visitaId) => ({
  ...recorrido,
  visitas: recorrido.visitas
    .filter((v) => v.id !== visitaId)
    .map((v, idx) => ({ ...v, orden: idx })),
});

/**
 * Asigna una sucursal del catálogo a la visita y completa los campos de texto.
 * @param sucursal  documento de la colección `sucursales`
 * @param empresaNombre  p.ej. "Badie SA"
 * @param depositoId  obligatorio si la sucursal tiene depósitos (p.ej. Sleiman Huacalera)
 */
export const seleccionarSucursal = (
  visita,
  sucursal,
  empresaNombre,
  depositoId = null,
) => {
  const dep = sucursal?.depositos?.find((d) => d.id === depositoId) || null;
  return {
    ...visita,
    empresaId: sucursal?.empresaId || visita.empresaId || "",
    sucursalId: sucursal?.id || "",
    depositoId: dep ? dep.id : null,
    empresa: empresaNombre || "",
    sucursal: sucursal
      ? dep
        ? `${sucursal.nombre} - ${dep.nombre}`
        : sucursal.nombre
      : "",
    provincia: sucursal?.provincia || visita.provincia || "",
  };
};

export const visitaRequiereDeposito = (visita, sucursal) =>
  Boolean(sucursal?.depositos?.length) && !visita.depositoId;

/** Suma de equipos mantenidos en la visita (tareas tipo mantenimiento). */
export const getEquiposRealizados = (visita) =>
  (visita.tareas || [])
    .filter((t) => t.tipo === TIPO_TAREA.MANTENIMIENTO && t.completada)
    .reduce((acc, t) => acc + (Number(t.equiposRealizados) || 0), 0);

// ------------------------------------------------------------
// Consultas sobre el recorrido
// ------------------------------------------------------------

export const getEmpresasVisitadas = (recorrido) => {
  if (!recorrido.visitas) return [];
  return [...new Set(recorrido.visitas.map((v) => v.empresa).filter(Boolean))];
};

export const getSucursalesVisitadas = (recorrido) => {
  if (!recorrido.visitas) return [];
  return [...new Set(recorrido.visitas.map((v) => v.sucursal).filter(Boolean))];
};

// ------------------------------------------------------------
// Compatibilidad con recorridos guardados antes de este cambio
// ------------------------------------------------------------

export const inferirTipoTarea = (descripcion = "") => {
  const d = descripcion.toUpperCase();
  if (d.includes("MANTENIMIENTO")) return TIPO_TAREA.MANTENIMIENTO;
  if (d.includes("INVENTARIO")) return TIPO_TAREA.INVENTARIO;
  return TIPO_TAREA.OTRA;
};

/**
 * Completa con valores por defecto los campos nuevos de un recorrido viejo.
 * Si una visita no tiene sucursalId, intenta resolverla por el texto
 * empresa/sucursal (nombres de constants.js). No reescribe los textos:
 * el PDF histórico sigue mostrando lo que se firmó.
 */
export const normalizarRecorrido = (data) => ({
  ...data,
  fechaSalida: data.fechaSalida || data.fechaRecorrido || "",
  fechaLlegada: data.fechaLlegada || data.fechaRecorrido || "",
  viajePlanId: data.viajePlanId ?? null,
  checklist: data.checklist ?? { salidaAt: null, entregaAt: null },
  visitas: (data.visitas || []).map((v) => {
    let sucursalId = v.sucursalId || "";
    let depositoId = v.depositoId ?? null;
    if (!sucursalId && v.empresa && v.sucursal) {
      const r = resolverSucursalLegacy(v.empresa, v.sucursal);
      if (r) ({ sucursalId, depositoId } = r);
    }
    const empresaId = v.empresaId || getSucursal(sucursalId)?.empresaId || "";
    return {
      ...v,
      empresaId,
      sucursalId,
      depositoId,
      fecha: v.fecha || data.fechaRecorrido || "",
      paradaPlanId: v.paradaPlanId ?? null,
      tareas: (v.tareas || []).map((t) => ({
        ...t,
        tipo: t.tipo ?? inferirTipoTarea(t.descripcion),
        equiposRealizados: t.equiposRealizados ?? null,
      })),
    };
  }),
});

// ------------------------------------------------------------
// Precarga desde el programa F-ST-02
// ------------------------------------------------------------

const sumarDias = (iso, dias) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return fechaLocalISO(d);
};

const diasEntreISO = (a, b) =>
  Math.round(
    (new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / 86400000,
  );

/**
 * Arma un recorrido nuevo a partir de un viaje planificado.
 *  - Una visita por parada no visitada (dos si la sucursal tiene depósitos).
 *  - Cada visita trae su paradaPlanId y la tarea de mantenimiento cargada.
 *  - Las fechas respetan la estructura del viaje: si una parada estaba
 *    planificada un día después de la primera pendiente, queda en hoy + 1.
 *  - visitante queda vacío: va nombre y apellido completo (sale en el PDF).
 */
export const crearRecorridoDesdeViaje = (
  viaje,
  paradas,
  sucursales,
  getEmpresaFn,
  hoy = fechaLocalISO(),
) => {
  const base = createEmptyRecorrido();
  const pendientes = paradas
    .filter((p) => p.estado !== "visitada")
    .sort((a, b) =>
      (a.fechaPlanificada || "").localeCompare(b.fechaPlanificada || ""),
    );

  const inicio = pendientes[0]?.fechaPlanificada || viaje.fechaInicio;
  const visitas = [];
  for (const p of pendientes) {
    const suc = sucursales.find((s) => s.id === p.sucursalId);
    if (!suc) continue;
    // Días relativos a la primera parada pendiente (no al inicio del viaje:
    // si ya se hizo el primer día, lo que queda arranca hoy)
    const offset =
      inicio && p.fechaPlanificada
        ? Math.max(0, diasEntreISO(inicio, p.fechaPlanificada))
        : 0;
    const fecha = sumarDias(hoy, offset);
    const empresaNombre = getEmpresaFn(suc.empresaId)?.nombre || "";
    const depositos = suc.depositos?.length
      ? suc.depositos.map((d) => d.id)
      : [null];

    for (const depositoId of depositos) {
      const tarea = {
        ...createEmptyTarea(TIPO_TAREA.MANTENIMIENTO),
        descripcion: DESCRIPCION_MANTENIMIENTO,
      };
      const v = seleccionarSucursal(
        createEmptyVisita(visitas.length, fecha),
        suc,
        empresaNombre,
        depositoId,
      );
      visitas.push({ ...v, paradaPlanId: p.id, tareas: [tarea] });
    }
  }

  return {
    ...base,
    fechaRecorrido: hoy,
    viajePlanId: viaje.id,
    visitas: visitas.length ? visitas : base.visitas,
  };
};

/**
 * ¿El recorrido tiene algo cargado por el usuario? Un recorrido recién
 * creado (vacío) no se guarda: así abrir la pantalla no deja borradores
 * vacíos en Firestore.
 */
export const tieneContenido = (r) =>
  Boolean(
    r?.viajePlanId ||
    r?.visitante?.trim() ||
    r?.horarioSalida ||
    r?.vehiculo?.trim() ||
    r?.observacionesGenerales?.trim() ||
    (r?.visitas || []).some(
      (v) =>
        v.sucursalId ||
        v.empresa ||
        v.firma ||
        v.horarioIngreso ||
        (v.tareas || []).some((t) => t.descripcion?.trim()),
    ),
  );
