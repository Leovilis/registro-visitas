// src/app/utils/exportarFST02.js
// Genera el F-ST-02 (Programa de mantenimiento preventivo) en Excel a partir
// del programa cargado en la app, sobre la plantilla oficial
// (public/plantillas/F-ST-02_plantilla.xlsx: encabezado, logo y estilos del v05).
//
// Requiere: npm install exceljs

import {
  mesDeFecha,
  mesesDelPrograma,
  ESTADO_PARADA,
  COLOR_DOS_DIAS,
} from "@/app/models/programaModel";

const FILA_ENCABEZADO = 10;
const FILA_PROTOTIPO = 11; // primera fila de datos (tiene los estilos)
const COL = {
  id: 1,
  sucursal: 2,
  empresa: 3,
  equipos: 4,
  mes: 5,
  fecha: 6,
  tecnicos: 7,
  realizados: 8,
  pct: 9,
  visitado: 10,
  obs: 11,
};

// Fecha ISO → Date en UTC (si no, Excel puede mostrar el día anterior)
const aFechaExcel = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const ddmmyyyy = (iso) => (iso ? iso.split("-").reverse().join("/") : "");

const textoObservacion = (p, nombreMotivo) => {
  const partes = [];
  if (p.estado === ESTADO_PARADA.NO_VISITADA) partes.push("No visitada");
  const repro = [...(p.historial || [])]
    .reverse()
    .find((h) => h.tipo === "reprogramada");
  if (p.estado === ESTADO_PARADA.REPROGRAMADA && repro) {
    partes.push(`Reprogramada (antes ${ddmmyyyy(repro.fechaAnterior)})`);
  }
  if (p.motivoId && p.estado !== ESTADO_PARADA.VISITADA)
    partes.push(nombreMotivo(p.motivoId));
  if (p.motivoDetalle && p.estado !== ESTADO_PARADA.VISITADA)
    partes.push(p.motivoDetalle);
  return partes.join(" · ");
};

/**
 * Función pura: recibe ExcelJS y la plantilla, devuelve el buffer del .xlsx.
 * @param data { programa, viajes, paradas, sucursales, empresas, motivos }
 */
export async function generarFST02(ExcelJS, plantillaBuffer, data) {
  const { programa, viajes, paradas, sucursales, empresas, motivos } = data;
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(plantillaBuffer);
  const ws = wb.worksheets[0];
  ws.name = String(programa.anio);

  const nroViaje = (viajeId) => viajes.find((v) => v.id === viajeId)?.nro ?? "";
  const dosDias = (viajeId) =>
    Boolean(viajes.find((v) => v.id === viajeId)?.camionetaDosDias);
  const suc = (id) => sucursales.find((s) => s.id === id);
  const empresa = (id) => empresas.find((e) => e.id === id)?.nombre || id;
  const nombreMotivo = (id) =>
    motivos.find((m) => m.id === id)?.descripcion || id;

  const filas = paradas
    .filter((p) => !p.anulada)
    .sort(
      (a, b) =>
        (nroViaje(a.viajeId) || 999) - (nroViaje(b.viajeId) || 999) ||
        (a.fechaPlanificada || "").localeCompare(b.fechaPlanificada || ""),
    );

  // Encabezado
  ws.getCell("H1").value = `N° VERSION: ${programa.version || ""}`;
  ws.getCell("H2").value =
    `Fecha de vigencia: ${ddmmyyyy(programa.fechaVigencia)}`;
  ws.getCell("B7").value = mesesDelPrograma(filas);
  ws.getCell("B8").value = programa.referencia || "";

  // Filas: la 11 es el prototipo con estilos; se duplica hacia abajo
  const n = Math.max(filas.length, 1);
  if (n > 1) ws.duplicateRow(FILA_PROTOTIPO, n - 1, true);
  const ultima = FILA_PROTOTIPO + n - 1;
  const filaAcum = ultima + 1;

  filas.forEach((p, i) => {
    const r = FILA_PROTOTIPO + i;
    const row = ws.getRow(r);
    const s = suc(p.sucursalId);
    const visitada = p.estado === ESTADO_PARADA.VISITADA;
    const tecnicos =
      (visitada && p.tecnicosReales?.length
        ? p.tecnicosReales
        : p.tecnicosPlan) || [];

    const celdaId = row.getCell(COL.id);
    celdaId.value = nroViaje(p.viajeId);
    // Copia del estilo: las filas duplicadas comparten el objeto de estilo
    celdaId.style = {
      ...celdaId.style,
      fill: dosDias(p.viajeId)
        ? {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: COLOR_DOS_DIAS },
          }
        : { type: "pattern", pattern: "none" },
    };
    row.getCell(COL.sucursal).value = s?.nombre || p.sucursalId;
    row.getCell(COL.empresa).value = s ? empresa(s.empresaId) : "";
    row.getCell(COL.equipos).value = p.equiposPlanificados ?? 0;
    row.getCell(COL.mes).value = mesDeFecha(p.fechaPlanificada);
    row.getCell(COL.fecha).value = aFechaExcel(p.fechaPlanificada);
    row.getCell(COL.fecha).numFmt = "dd/mm/yyyy";
    row.getCell(COL.tecnicos).value = tecnicos.join(" - ");
    row.getCell(COL.realizados).value = visitada
      ? (p.equiposRealizados ?? 0)
      : null;
    row.getCell(COL.pct).value = {
      formula: `IF(OR(H${r}="",D${r}=0),"",H${r}/D${r})`,
      result:
        visitada && p.equiposPlanificados
          ? (p.equiposRealizados ?? 0) / p.equiposPlanificados
          : "",
    };
    row.getCell(COL.visitado).value = visitada
      ? aFechaExcel(p.fechaEfectiva)
      : null;
    row.getCell(COL.obs).value = textoObservacion(p, nombreMotivo) || null;
    row.commit();
  });

  // Acumulado (mismas fórmulas que el v05)
  const totalPlan = filas.reduce((a, p) => a + (p.equiposPlanificados || 0), 0);
  const totalReal = filas.reduce(
    (a, p) =>
      a + (p.estado === ESTADO_PARADA.VISITADA ? p.equiposRealizados || 0 : 0),
    0,
  );
  const visitadas = filas.filter(
    (p) => p.estado === ESTADO_PARADA.VISITADA && p.fechaEfectiva,
  ).length;
  const acum = ws.getRow(filaAcum);
  acum.getCell(COL.realizados).value = "Acumulado";
  acum.getCell(COL.pct).value = {
    formula: `IFERROR(SUM(H${FILA_PROTOTIPO}:H${ultima})/SUM(D${FILA_PROTOTIPO}:D${ultima}),0)`,
    result: totalPlan ? totalReal / totalPlan : 0,
  };
  acum.getCell(COL.visitado).value = {
    formula: `COUNT(J${FILA_PROTOTIPO}:J${ultima})/ROWS(J${FILA_PROTOTIPO}:J${ultima})`,
    result: filas.length ? visitadas / filas.length : 0,
  };
  acum.commit();

  ws.autoFilter = `A${FILA_ENCABEZADO}:K${FILA_ENCABEZADO}`;
  // Impresión: horizontal, todo el ancho en una hoja
  ws.pageSetup = {
    ...ws.pageSetup,
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };
  return wb.xlsx.writeBuffer();
}

/** Uso en el navegador: arma el archivo y lo descarga. */
export async function descargarFST02(data) {
  const ExcelJS = (await import("exceljs")).default;
  const resp = await fetch("/plantillas/F-ST-02_plantilla.xlsx");
  if (!resp.ok) throw new Error("No se encontró la plantilla del F-ST-02");
  const buffer = await generarFST02(ExcelJS, await resp.arrayBuffer(), data);

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `F-ST-02_Programa_de_mantenimiento_preventivo_v_${data.programa.version || ""}_${data.programa.anio}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
