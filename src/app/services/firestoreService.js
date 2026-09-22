// src/app/services/firestoreService.js
//
// Correcciones:
//  - Todo trabaja sobre `recorridos` (antes updateEstado/listVisitas iban a
//    la colección vieja `visitas`: por eso los recorridos quedaban en borrador).
//  - saveRecorrido guarda `id` y `createdAt` (quedaban en null).
//  - listRecorridos: el parámetro `limit` pisaba la función de Firestore;
//    ahora filtra por área (SISTEMAS por defecto) sin índices compuestos.
//  - Nuevo: lectura del catálogo `sucursales`.
//  - Las funciones viejas (saveVisita, getVisita, listVisitas, updateEstado,
//    deleteVisita) se mantienen como alias para no romper imports existentes.

import { db } from "@/app/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  ESTADO,
  AREA_APP,
  normalizarRecorrido,
} from "@/app/models/recorridoModel";
import { SUCURSALES, EMPRESAS } from "@/app/data/catalogoSucursales";

const RECORRIDOS = "recorridos";
const SUCURSALES_COL = "sucursales";

// Se mantienen las fechas como string ISO para no mezclar tipos con los
// documentos existentes (mezclar string y Timestamp rompe los orderBy).
const ahora = () => new Date().toISOString();

// ------------------------------------------------------------
// Recorridos
// ------------------------------------------------------------

export const saveRecorrido = async (recorridoId, recorridoData) => {
  try {
    const ref = doc(db, RECORRIDOS, recorridoId);
    const snap = await getDoc(ref);
    const now = ahora();
    const createdAt = snap.exists() ? snap.data().createdAt || now : now;

    await setDoc(
      ref,
      { ...recorridoData, id: recorridoId, createdAt, updatedAt: now },
      { merge: true },
    );
    return { success: true };
  } catch (error) {
    console.error("Error en saveRecorrido:", error);
    throw error;
  }
};

export const getRecorrido = async (recorridoId) => {
  try {
    const snap = await getDoc(doc(db, RECORRIDOS, recorridoId));
    return snap.exists()
      ? normalizarRecorrido({ ...snap.data(), id: snap.id })
      : null;
  } catch (error) {
    console.error("Error en getRecorrido:", error);
    throw error;
  }
};

/**
 * Solo filtros de igualdad en Firestore (no requieren índices compuestos);
 * el rango de fechas y el orden se resuelven en el cliente. Para el volumen
 * de recorridos de un área alcanza y sobra.
 */
export const listRecorridos = async ({
  area = AREA_APP,
  estado,
  viajePlanId,
  desde, // "YYYY-MM-DD"
  hasta,
  max = 100,
} = {}) => {
  const constraints = [];
  if (area) constraints.push(where("area", "==", area));
  if (estado) constraints.push(where("estado", "==", estado));
  if (viajePlanId) constraints.push(where("viajePlanId", "==", viajePlanId));

  const snap = await getDocs(query(collection(db, RECORRIDOS), ...constraints));
  return snap.docs
    .map((d) => normalizarRecorrido({ ...d.data(), id: d.id }))
    .filter(
      (r) =>
        (!desde || r.fechaRecorrido >= desde) &&
        (!hasta || r.fechaRecorrido <= hasta),
    )
    .sort((x, y) =>
      (y.fechaRecorrido || "").localeCompare(x.fechaRecorrido || ""),
    )
    .slice(0, max);
};

export const updateEstadoRecorrido = async (
  recorridoId,
  estado,
  pdfUrl = null,
) => {
  const data = { estado, updatedAt: ahora() };
  if (estado === ESTADO.FINALIZADO) data.finalizadoAt = ahora();
  if (pdfUrl) data.pdfUrl = pdfUrl;
  await updateDoc(doc(db, RECORRIDOS, recorridoId), data);
};

export const finalizarRecorrido = (recorridoId, pdfUrl = null) =>
  updateEstadoRecorrido(recorridoId, ESTADO.FINALIZADO, pdfUrl);

export const deleteRecorrido = async (recorridoId) => {
  await deleteDoc(doc(db, RECORRIDOS, recorridoId));
};

// ------------------------------------------------------------
// Catálogo de sucursales
// ------------------------------------------------------------

let cacheSucursales = null;

/** Sucursales activas desde Firestore; si falla (sin señal), usa el catálogo local. */
export const getSucursales = async ({ forceRefresh = false } = {}) => {
  if (cacheSucursales && !forceRefresh) return cacheSucursales;
  try {
    const snap = await getDocs(
      query(collection(db, SUCURSALES_COL), where("activa", "==", true)),
    );
    const lista = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
    cacheSucursales = lista.length ? lista : SUCURSALES;
  } catch (error) {
    console.warn("Sucursales desde catálogo local:", error.message);
    cacheSucursales = SUCURSALES;
  }
  cacheSucursales = [...cacheSucursales].sort(
    (a, b) =>
      a.empresaId.localeCompare(b.empresaId) ||
      a.nombre.localeCompare(b.nombre),
  );
  return cacheSucursales;
};

export const getSucursalesByEmpresa = async (empresaId) =>
  (await getSucursales()).filter((s) => s.empresaId === empresaId);

export const getEmpresas = () => EMPRESAS;

// ------------------------------------------------------------
// Export agrupado (misma forma que antes + funciones nuevas)
// ------------------------------------------------------------

export const firestoreService = {
  saveRecorrido,
  getRecorrido,
  listRecorridos,
  updateEstadoRecorrido,
  finalizarRecorrido,
  deleteRecorrido,
  getSucursales,
  getSucursalesByEmpresa,
  getEmpresas,

  // --- Alias de compatibilidad (deprecados) ---
  // Ahora apuntan a `recorridos`. Buscar usos y reemplazarlos:
  //   grep -rnE "saveVisita|getVisita|listVisitas|updateEstado\(|deleteVisita" src
  saveVisita: async (id, data) => {
    await saveRecorrido(id, data);
    return id;
  },
  getVisita: getRecorrido,
  listVisitas: ({
    visitante,
    estado,
    fechaInicio,
    fechaFin,
    limit: max = 100,
  } = {}) =>
    listRecorridos({ estado, desde: fechaInicio, hasta: fechaFin, max }).then(
      (r) => (visitante ? r.filter((x) => x.visitante === visitante) : r),
    ),
  updateEstado: updateEstadoRecorrido,
  deleteVisita: deleteRecorrido,
};
