// scripts/importar-recorridos.mjs
// Importa los recorridos 2026 transcriptos de los PDF (scripts/data/recorridos-historicos-2026.json)
// como recorridos FINALIZADOS y los vincula al programa F-ST-02.
//
//   node scripts/importar-recorridos.mjs --dry-run   ← solo muestra qué haría
//   node scripts/importar-recorridos.mjs
//
// - Si ya existe en Firestore un recorrido de la misma fecha con alguna de las
//   mismas sucursales (p.ej. los cargados con la app vieja), lo COMPLETA con
//   los datos del PDF en lugar de crear un duplicado.
// - En cada parada del programa, el aporte "importado-excel" se REEMPLAZA por el
//   del recorrido (no se suman equipos dos veces).
// - Los equipos realizados salen del F-ST-02 (los PDF no los informan). Si la
//   parada no tenía dato en el Excel, se usan los equipos planificados.
// - Es idempotente: se puede correr más de una vez.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./firebaseAdmin.mjs";
import { resolverSucursalLegacy, getSucursal, getEmpresa } from "../src/app/data/catalogoSucursales.js";
import { totalesDesdeAportes, ESTADO_PARADA } from "../src/app/models/programaModel.js";

// ------------------------------------------------------------
// ⚠️ CONFIRMAR: en el PDF del 03/09 dice "SALTA". La app vieja no tenía
// Salta Boutique ni Salta Pulmón, así que puede ser cualquiera de las tres.
// El F-ST-02 registra Salta Boutique visitada en ese viaje.
// Opciones: "badie__salta-boutique" | "badie__salta" | "badie__salta-pulmon"
// ------------------------------------------------------------
const FORZAR = {
  "2026-09-03|SALTA": { sucursalId: "badie__salta-boutique", depositoId: null },
};

const dryRun = process.argv.includes("--dry-run");
const aqui = path.dirname(fileURLToPath(import.meta.url));
const { recorridos } = JSON.parse(
  fs.readFileSync(path.join(aqui, "data", "recorridos-historicos-2026.json"), "utf8"),
);

const ahora = new Date().toISOString();
const uid = () => crypto.randomUUID();
const norm = (s = "") => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

const tipoTarea = (d = "") =>
  norm(d).includes("MANTENIMIENTO") ? "mantenimiento" : norm(d).includes("INVENTARIO") ? "inventario" : "otra";

async function buscarExistente(fecha, sucursalIds) {
  const snap = await db.collection("recorridos").where("fechaRecorrido", "==", fecha).get();
  let mejor = null;
  let mejorCoincidencias = 0;
  for (const d of snap.docs) {
    const data = d.data();
    const ids = (data.visitas || []).map((v) => {
      if (v.sucursalId) return v.sucursalId;
      return resolverSucursalLegacy(v.empresa, v.sucursal)?.sucursalId;
    });
    const coincidencias = sucursalIds.filter((id) => ids.includes(id)).length;
    if (coincidencias > mejorCoincidencias) {
      mejor = { id: d.id, data };
      mejorCoincidencias = coincidencias;
    }
  }
  return mejor;
}

let errores = 0;
const resumen = [];

for (const r of recorridos) {
  console.log(`\n📄 ${r.archivo}  (${r.origen})`);

  // 1) Resolver sucursales y paradas
  const visitas = [];
  for (const [i, v] of r.visitas.entries()) {
    const res =
      FORZAR[`${r.fechaRecorrido}|${norm(v.sucursal)}`] || resolverSucursalLegacy(v.empresa, v.sucursal);
    const suc = res && getSucursal(res.sucursalId);
    if (!suc) {
      console.log(`   ❌ No se pudo identificar ${v.empresa} / ${v.sucursal}`);
      errores++;
      continue;
    }
    const paradaId = `2026__${suc.id}__1`;
    const paradaSnap = await db.collection("paradasPlan").doc(paradaId).get();
    const parada = paradaSnap.exists ? paradaSnap.data() : null;

    // Del F-ST-02; si ya se importó antes, lo que quedó registrado; si no, los planificados
    const equipos =
      parada?.aportes?.["importado-excel"]?.equipos ??
      (parada?.equiposRealizados || parada?.equiposPlanificados || suc.equipos || 0);
    const origenEquipos = parada?.aportes?.["importado-excel"]
      ? "F-ST-02"
      : parada?.equiposRealizados
        ? "ya registrado"
        : "planificados";

    const visitaId = uid();
    visitas.push({
      id: visitaId,
      orden: i,
      empresaId: suc.empresaId,
      sucursalId: suc.id,
      depositoId: res.depositoId ?? null,
      empresa: getEmpresa(suc.empresaId)?.nombre || v.empresa,
      sucursal: suc.nombre,
      provincia: suc.provincia || "",
      fecha: v.fecha,
      horarioIngreso: v.ingreso,
      horarioEgreso: v.egreso,
      firma: v.firma || "",
      tareas: v.tareas.map((t) => {
        const tipo = tipoTarea(t.descripcion);
        return {
          id: uid(),
          descripcion: t.descripcion,
          completada: t.completada,
          tipo,
          equiposRealizados: tipo === "mantenimiento" ? equipos : null,
        };
      }),
      observaciones: "",
      paradaPlanId: parada ? paradaId : null,
      _parada: parada,
      _equipos: equipos,
    });

    console.log(
      `   ${v.fecha}  ${(getEmpresa(suc.empresaId)?.nombre + " / " + suc.nombre).padEnd(40)} ` +
        (parada
          ? `→ parada ${paradaId} · ${equipos} equipos (${origenEquipos})`
          : "→ ⚠️ sin parada en el programa"),
    );
  }

  // 2) ¿Ya existe en Firestore?
  const sucursalIds = visitas.map((v) => v.sucursalId);
  const existente = await buscarExistente(r.fechaRecorrido, sucursalIds);
  const recorridoId = existente?.id || uid();
  console.log(
    existente
      ? `   ↺ Completa el recorrido existente ${recorridoId} (estaba en "${existente.data.estado}")`
      : `   ＋ Crea recorrido nuevo ${recorridoId}`,
  );

  // Viaje del programa: el de la mayoría de las paradas
  const conteo = {};
  visitas.forEach((v) => v._parada && (conteo[v._parada.viajeId] = (conteo[v._parada.viajeId] || 0) + 1));
  const viajePlanId = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const recorrido = {
    id: recorridoId,
    visitante: r.visitante,
    area: "SISTEMAS",
    fechaRecorrido: r.fechaRecorrido,
    fechaSalida: r.fechaSalida,
    fechaLlegada: r.fechaLlegada,
    horarioSalida: r.horarioSalida,
    horarioLlegada: r.horarioLlegada,
    vehiculo: r.vehiculo,
    observacionesGenerales: existente?.data?.observacionesGenerales || "",
    estado: "finalizado",
    pdfUrl: existente?.data?.pdfUrl || null,
    viajePlanId,
    visitas: visitas.map(({ _parada, _equipos, ...v }) => v),
    importadoDePdf: r.archivo,
    createdAt: existente?.data?.createdAt || ahora,
    updatedAt: ahora,
    finalizadoAt: existente?.data?.finalizadoAt || ahora,
  };

  resumen.push({ archivo: r.archivo, recorridoId, visitas: visitas.length, existente: Boolean(existente) });
  if (dryRun) continue;

  // 3) Escribir recorrido + aportes al programa
  const batch = db.batch();
  batch.set(db.collection("recorridos").doc(recorridoId), recorrido); // reemplaza el contenido completo

  const tecnicos = r.visitante.split(",").map((s) => s.trim()).filter(Boolean);
  const porParada = {};
  for (const v of visitas) {
    if (!v._parada) continue;
    porParada[v.paradaPlanId] ??= { parada: v._parada, equipos: 0, fechas: [], visitaIds: [] };
    porParada[v.paradaPlanId].equipos += v._equipos;
    porParada[v.paradaPlanId].fechas.push(v.fecha);
    porParada[v.paradaPlanId].visitaIds.push(v.id);
  }
  for (const [paradaId, g] of Object.entries(porParada)) {
    const { "importado-excel": _excel, ...otros } = g.parada.aportes || {};
    const aportes = {
      ...otros,
      [recorridoId]: { equipos: g.equipos, fecha: g.fechas.sort()[0], visitaIds: g.visitaIds },
    };
    batch.update(db.collection("paradasPlan").doc(paradaId), {
      aportes,
      ...totalesDesdeAportes(aportes),
      estado: ESTADO_PARADA.VISITADA,
      motivoId: null,
      motivoDetalle: "",
      tecnicosReales: tecnicos,
      recorridoIds: FieldValue.arrayUnion(recorridoId),
      updatedAt: ahora,
    });
  }
  await batch.commit();
  console.log("   ✅ Guardado");
}

console.log(
  `\n${dryRun ? "[dry-run] " : ""}${resumen.length} recorridos · ` +
    `${resumen.filter((x) => x.existente).length} existentes completados · ` +
    `${resumen.filter((x) => !x.existente).length} nuevos · ${errores} errores`,
);
if (dryRun) console.log("No se escribió nada. Si está todo bien, corré sin --dry-run.");
