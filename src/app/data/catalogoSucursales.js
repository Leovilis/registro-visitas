// src/app/data/catalogoSucursales.js
// ============================================================
// Catálogo único de empresas y sucursales.
// Nombres oficiales: F-ST-02 v05 (Programa de mantenimiento preventivo).
//
// Se usa para:
//   1. Sembrar la colección `sucursales` de Firestore (scripts/seed-sucursales.mjs)
//   2. Fallback offline si Firestore no responde
//   3. Traducir los nombres viejos de constants.js (recorridos históricos)
//
// `equipos`: cantidad según F-ST-02. null = sucursal sin equipos en el programa
//            (se mantiene porque otras áreas la visitan).
// `depositos`: puntos que requieren firma por separado dentro de la misma
//              sucursal. El programa cuenta la sucursal como una sola parada;
//              el registro de visitas carga una visita por depósito.
// ============================================================

export const EMPRESAS = [
  { id: "badie", nombre: "Badie SA", codigoLegacy: "BADIE" },
  {
    id: "don-pedro",
    nombre: "Distribuidora Don Pedro SRL",
    codigoLegacy: "DON PEDRO",
  },
  { id: "el-bayeh", nombre: "El Bayeh SA", codigoLegacy: "EL BAYEH" },
  {
    id: "manantial-del-silencio",
    nombre: "Manantial del Silencio SA",
    codigoLegacy: "EL SILENCIO",
  },
  { id: "sleiman", nombre: "Sleiman SA", codigoLegacy: "SLEIMAN" },
  { id: "suria", nombre: "Suria SA", codigoLegacy: "SURIA" },
];

const suc = (empresaId, slug, nombre, provincia, equipos, depositos = []) => ({
  id: `${empresaId}__${slug}`,
  empresaId,
  nombre,
  provincia,
  equipos,
  depositos,
  activa: true,
});

export const SUCURSALES = [
  // ---- Badie SA ----
  suc("badie", "administracion", "ADMINISTRACIÓN", null, 15), // TODO: confirmar provincia
  suc("badie", "cafayate", "CAFAYATE", "SALTA", 2),
  suc("badie", "guemes", "GUEMES", "SALTA", 1),
  suc("badie", "humahuaca", "HUMAHUACA", "JUJUY", 1),
  suc("badie", "joaquin-gonzalez", "JOAQUIN GONZALEZ", "SALTA", 2),
  suc("badie", "la-quiaca", "LA QUIACA", "JUJUY", 1),
  suc("badie", "libertador", "LIBERTADOR", "JUJUY", 2),
  suc("badie", "metan", "METAN", "SALTA", 3),
  suc("badie", "oran", "ORAN", "SALTA", 3),
  suc("badie", "perico", "PERICO", "JUJUY", 3),
  suc("badie", "salta", "SALTA", "SALTA", 10),
  suc("badie", "salta-pulmon", "SALTA PULMON", "SALTA", 1),
  suc("badie", "salta-boutique", "SALTA BOUTIQUE", "SALTA", 1),
  suc("badie", "san-pedro", "SAN PEDRO", "JUJUY", 3),
  suc("badie", "tartagal", "TARTAGAL", "SALTA", 3),
  suc("badie", "tilcara", "TILCARA", "JUJUY", 1),

  // ---- Distribuidora Don Pedro SRL ----
  suc(
    "don-pedro",
    "san-salvador-de-jujuy",
    "SAN SALVADOR DE JUJUY",
    "JUJUY",
    6,
  ),
  suc("don-pedro", "la-quiaca", "LA QUIACA", "JUJUY", null), // no está en F-ST-02

  // ---- El Bayeh SA ----
  suc("el-bayeh", "huacalera", "HUACALERA", "JUJUY", 1),
  suc("el-bayeh", "maimara", "MAIMARA", "JUJUY", null), // no está en F-ST-02

  // ---- Manantial del Silencio SA ----
  suc("manantial-del-silencio", "purmamarca", "PURMAMARCA", "JUJUY", 6),

  // ---- Sleiman SA ----
  suc("sleiman", "huacalera", "HUACALERA", "JUJUY", 2, [
    { id: "planta", nombre: "PLANTA" },
    { id: "tambo", nombre: "TAMBO" },
  ]),

  // ---- Suria SA ----
  suc("suria", "humahuaca", "HUMAHUACA", "JUJUY", 1),
  suc("suria", "la-quiaca", "LA QUIACA", "JUJUY", 3),
  suc("suria", "maimara", "MAIMARA", "JUJUY", 2),
  suc(
    "suria",
    "maimara-administracion",
    "MAIMARA - ADMINISTRACIÓN",
    "JUJUY",
    3,
  ),
  suc("suria", "san-salvador-de-jujuy", "SAN SALVADOR DE JUJUY", "JUJUY", 5),
];

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

export const normalizarTexto = (s = "") =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();

export const getEmpresa = (empresaId) =>
  EMPRESAS.find((e) => e.id === empresaId) || null;

export const getSucursal = (sucursalId) =>
  SUCURSALES.find((s) => s.id === sucursalId) || null;

/** "HUACALERA - PLANTA" o "TARTAGAL". Es lo que se imprime en el PDF. */
export const etiquetaSucursal = (sucursal, depositoId = null) => {
  if (!sucursal) return "";
  const dep = sucursal.depositos?.find((d) => d.id === depositoId);
  return dep ? `${sucursal.nombre} - ${dep.nombre}` : sucursal.nombre;
};

// Nombres de constants.js que no coinciden con el catálogo (claves normalizadas).
const ALIAS_LEGACY = {
  "BADIE|MAIMARA": { sucursalId: "badie__tilcara", depositoId: null },
  "DON PEDRO|JUJUY": {
    sucursalId: "don-pedro__san-salvador-de-jujuy",
    depositoId: null,
  },
  "SURIA|JUJUY": {
    sucursalId: "suria__san-salvador-de-jujuy",
    depositoId: null,
  },
  "SLEIMAN|HUA PLANTA": {
    sucursalId: "sleiman__huacalera",
    depositoId: "planta",
  },
  "SLEIMAN|HUA TAMBO": {
    sucursalId: "sleiman__huacalera",
    depositoId: "tambo",
  },
};

/**
 * Traduce empresa/sucursal en texto (recorridos viejos) a { sucursalId, depositoId }.
 * Devuelve null si no encuentra coincidencia (queda para revisión manual).
 */
export const resolverSucursalLegacy = (empresaTexto, sucursalTexto) => {
  const e = normalizarTexto(empresaTexto);
  const s = normalizarTexto(sucursalTexto);

  const alias = ALIAS_LEGACY[`${e}|${s}`];
  if (alias) return alias;

  const empresa = EMPRESAS.find(
    (x) =>
      normalizarTexto(x.codigoLegacy) === e || normalizarTexto(x.nombre) === e,
  );
  if (!empresa) return null;

  const sucursal = SUCURSALES.find(
    (x) => x.empresaId === empresa.id && normalizarTexto(x.nombre) === s,
  );
  return sucursal ? { sucursalId: sucursal.id, depositoId: null } : null;
};
