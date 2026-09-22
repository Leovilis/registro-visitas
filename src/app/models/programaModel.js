// src/app/models/programaModel.js
// Programa de mantenimiento preventivo (F-ST-02).
//
// Colecciones:
//   programas/{anio}          { anio, formulario, version, referencia }
//   viajesPlan/{id}           { programaId, nro, fechaInicio, fechaFin, tecnicos[] }
//   paradasPlan/{id}          una sucursal dentro de un viaje (ver createParada)
//   motivosNoVisita/{id}      { descripcion, activo, orden }

export const ESTADO_PARADA = {
  PENDIENTE: "pendiente",
  VISITADA: "visitada",
  NO_VISITADA: "no_visitada",
  REPROGRAMADA: "reprogramada",
};

export const ESTADO_PARADA_LABEL = {
  pendiente: "Pendiente",
  visitada: "Visitada",
  no_visitada: "No visitada",
  reprogramada: "Reprogramada",
};

export const MOTIVOS_DEFAULT = [
  "Condiciones climáticas / ruta cortada",
  "Vehículo no disponible",
  "Técnico no disponible",
  "Sucursal cerrada o sin responsable",
  "Urgencia en casa central",
  "Reprogramado a pedido de la sucursal",
  "Otro",
];

/**
 * Una parada = una sucursal del programa.
 * `aportes` guarda lo que suma cada recorrido, con clave recorridoId.
 * Así re-finalizar un recorrido no duplica equipos, y Sleiman Huacalera
 * puede completarse con dos depósitos visitados en recorridos distintos.
 */
export const createParada = ({
  id,
  programaId,
  viajeId,
  sucursalId,
  fechaPlanificada,
  tecnicosPlan = [],
  equiposPlanificados = 0,
}) => ({
  id,
  programaId,
  viajeId,
  sucursalId,
  fechaPlanificada,
  tecnicosPlan,
  equiposPlanificados,
  estado: ESTADO_PARADA.PENDIENTE,
  fechaEfectiva: null,
  equiposRealizados: 0,
  aportes: {}, // { [recorridoId | "importado-excel"]: { equipos, fecha, visitaIds[] } }
  recorridoIds: [],
  motivoId: null,
  motivoDetalle: "",
  historial: [], // [{ tipo, fecha, detalle, motivoId, at }]
  anulada: false, // las paradas no se borran: se anulan (queda el registro)
});

/** Recalcula totales a partir de los aportes. */
export const totalesDesdeAportes = (aportes = {}) => {
  const lista = Object.values(aportes);
  if (lista.length === 0) return { equiposRealizados: 0, fechaEfectiva: null };
  return {
    equiposRealizados: lista.reduce(
      (acc, a) => acc + (Number(a.equipos) || 0),
      0,
    ),
    fechaEfectiva:
      lista
        .map((a) => a.fecha)
        .filter(Boolean)
        .sort()[0] || null,
  };
};

const diasEntre = (a, b) =>
  Math.round(
    (new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / 86400000,
  );

/**
 * Indicadores del programa.
 *  - avance*: contra todo el año (igual que el "Acumulado" del Excel)
 *  - cumplimiento*: solo paradas cuya fecha planificada ya pasó
 */
export const calcularIndicadores = (todas, hoy) => {
  const paradas = todas.filter((p) => !p.anulada);
  const sum = (arr, f) => arr.reduce((acc, x) => acc + (Number(f(x)) || 0), 0);
  const visitada = (p) => p.estado === ESTADO_PARADA.VISITADA;
  const pct = (a, b) => (b > 0 ? a / b : null);

  const vencidas = paradas.filter(
    (p) => p.fechaPlanificada && p.fechaPlanificada <= hoy,
  );
  const visitadas = paradas.filter(visitada);
  const conDesvio = visitadas.filter(
    (p) => p.fechaEfectiva && p.fechaPlanificada,
  );

  const motivos = {};
  paradas
    .filter((p) => p.motivoId)
    .forEach((p) => {
      motivos[p.motivoId] = (motivos[p.motivoId] || 0) + 1;
    });

  return {
    totalParadas: paradas.length,
    paradasVisitadas: visitadas.length,
    equiposPlanificados: sum(paradas, (p) => p.equiposPlanificados),
    equiposRealizados: sum(paradas, (p) => p.equiposRealizados),
    avanceEquipos: pct(
      sum(paradas, (p) => p.equiposRealizados),
      sum(paradas, (p) => p.equiposPlanificados),
    ),
    avanceSucursales: pct(visitadas.length, paradas.length),
    paradasVencidas: vencidas.length,
    cumplimientoSucursales: pct(
      vencidas.filter(visitada).length,
      vencidas.length,
    ),
    cumplimientoEquipos: pct(
      sum(vencidas, (p) => p.equiposRealizados),
      sum(vencidas, (p) => p.equiposPlanificados),
    ),
    atrasadas: paradas.filter(
      (p) => !visitada(p) && p.fechaPlanificada && p.fechaPlanificada < hoy,
    ),
    desvioPromedioDias: conDesvio.length
      ? sum(conDesvio, (p) => diasEntre(p.fechaPlanificada, p.fechaEfectiva)) /
        conDesvio.length
      : null,
    motivos, // { motivoId: cantidad }
  };
};

// ------------------------------------------------------------
// Edición del plan
// ------------------------------------------------------------

export const TECNICOS_DEFAULT = ["Leo", "Mauro", "Facu"];

export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const mesDeFecha = (iso) =>
  iso ? MESES[Number(iso.slice(5, 7)) - 1] : "";

/** "Mayo, Junio, Agosto" a partir de las fechas planificadas. */
export const mesesDelPrograma = (paradas) =>
  [
    ...new Set(
      paradas
        .filter((p) => !p.anulada && p.fechaPlanificada)
        .map((p) => Number(p.fechaPlanificada.slice(5, 7))),
    ),
  ]
    .sort((a, b) => a - b)
    .map((m) => MESES[m - 1])
    .join(", ");

export const idViaje = (anio, nro) =>
  `${anio}__v${String(nro).padStart(2, "0")}`;
export const idParada = (anio, sucursalId, n = 1) =>
  `${anio}__${sucursalId}__${n}`;

/** Mueve una fecha ISO un año (29/02 → 28/02). */
export const sumarAnio = (iso, anios = 1) => {
  if (!iso) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  const ny = y + anios;
  const ultimoDia = new Date(ny, m, 0).getDate();
  return `${ny}-${String(m).padStart(2, "0")}-${String(Math.min(d, ultimoDia)).padStart(2, "0")}`;
};

export const paradasActivas = (paradas) => paradas.filter((p) => !p.anulada);
