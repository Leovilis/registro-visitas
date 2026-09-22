// scripts/seed-programa.mjs
// Carga el programa 2026 (desde F-ST-02 v05), sus viajes, paradas y los
// motivos de no visita. Correr DESPUÉS de seed-sucursales.mjs.
//
//   node scripts/seed-programa.mjs --dry-run
//   node scripts/seed-programa.mjs
//
// Seguridad: si una parada ya existe NO se pisa (para no borrar avances
// cargados desde la app). Con --force se reescribe todo.

import { db } from "./firebaseAdmin.mjs";
import {
  PROGRAMA_2026,
  VIAJES_2026,
  PARADAS_2026,
} from "../src/app/data/programa2026.js";
import {
  createParada,
  totalesDesdeAportes,
  ESTADO_PARADA,
  MOTIVOS_DEFAULT,
} from "../src/app/models/programaModel.js";

const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");

const now = new Date().toISOString();
const batch = db.batch();
let escritos = 0;
let salteados = 0;

const set = (ref, data) => {
  escritos++;
  if (!dryRun) batch.set(ref, data, { merge: true });
};

// Programa
set(db.collection("programas").doc(PROGRAMA_2026.id), {
  ...PROGRAMA_2026,
  createdAt: now,
});

// Viajes
for (const v of VIAJES_2026) {
  const ref = db.collection("viajesPlan").doc(v.id);
  if (!force && (await ref.get()).exists) continue; // no pisar cambios hechos desde la app
  set(ref, { camionetaDosDias: false, ...v, programaId: PROGRAMA_2026.id });
}

// Paradas
for (const p of PARADAS_2026) {
  const ref = db.collection("paradasPlan").doc(p.id);
  if (!force && (await ref.get()).exists) {
    salteados++;
    continue;
  }
  const parada = createParada({ ...p, programaId: PROGRAMA_2026.id });
  if (p.importado) {
    parada.aportes = {
      "importado-excel": {
        equipos: p.importado.equiposRealizados ?? 0,
        fecha: p.importado.fechaEfectiva,
        visitaIds: [],
      },
    };
    Object.assign(parada, totalesDesdeAportes(parada.aportes));
    parada.estado = ESTADO_PARADA.VISITADA;
    parada.tecnicosReales = p.tecnicosPlan;
  }
  parada.createdAt = now;
  console.log(`${p.id.padEnd(48)} ${parada.estado}`);
  set(ref, parada);
}

// Motivos
MOTIVOS_DEFAULT.forEach((descripcion, orden) => {
  const id = descripcion
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  set(db.collection("motivosNoVisita").doc(id), {
    descripcion,
    orden,
    activo: true,
  });
});

if (!dryRun) await batch.commit();
console.log(
  `\n${dryRun ? "[dry-run] " : ""}${escritos} documentos escritos, ${salteados} paradas existentes salteadas.`,
);
