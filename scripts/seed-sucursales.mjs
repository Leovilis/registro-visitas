// scripts/seed-sucursales.mjs
// Carga el catálogo de sucursales en Firestore (colección `sucursales`).
//
// Uso (desde la raíz del proyecto, Node 22+):
//   Simulación:  node scripts/seed-sucursales.mjs --dry-run
//   Real:        node scripts/seed-sucursales.mjs
//
// La cuenta de servicio se descarga en Firebase Console > Configuración del
// proyecto > Cuentas de servicio. NO la subas al repo (agregala a .gitignore).
//
// Es idempotente: usa merge, así que se puede correr de nuevo sin duplicar.
// Ojo: si después editás `equipos` a mano en Firestore, volver a correrlo
// pisa ese valor con el del catálogo.

import { db } from "./firebaseAdmin.mjs";
import { EMPRESAS, SUCURSALES } from "../src/app/data/catalogoSucursales.js";

const dryRun = process.argv.includes("--dry-run");

const empresaNombre = Object.fromEntries(EMPRESAS.map((e) => [e.id, e.nombre]));
const batch = db.batch();

for (const s of SUCURSALES) {
  const data = { ...s, empresaNombre: empresaNombre[s.empresaId] };
  console.log(`${dryRun ? "[dry-run] " : ""}${s.id}  →  ${data.empresaNombre} / ${s.nombre}`);
  if (!dryRun) batch.set(db.collection("sucursales").doc(s.id), data, { merge: true });
}

if (!dryRun) {
  await batch.commit();
  console.log(`\nListo: ${SUCURSALES.length} sucursales cargadas.`);
} else {
  console.log(`\n${SUCURSALES.length} sucursales (no se escribió nada).`);
}
