// src/app/utils/pdfGenerator.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate, formatTime } from "./formatters";
import { TIPO_TAREA, textoVehiculo } from "@/app/models/recorridoModel";

// Datos del formulario controlado. Agregar la columna FECHA cambia el
// formato: actualizar versión y fecha cuando Calidad apruebe la revisión.
const FORMULARIO = {
  codigo: "F-RD-04",
  version: "v.02",
  fechaRevision: "17/04/2025",
  fechaVigencia: "17/04/2025",
};

// "11/06/2026" o "11/06/2026 al 12/06/2026" según las fechas de las visitas
function rangoFechasVisitas(recorrido) {
  const fechas = [
    ...new Set((recorrido.visitas || []).map((v) => v.fecha).filter(Boolean)),
  ].sort();
  if (fechas.length === 0)
    return formatDate(recorrido.fechaRecorrido) || formatDate(new Date());
  if (fechas.length === 1) return formatDate(fechas[0]);
  return `${formatDate(fechas[0])} al ${formatDate(fechas[fechas.length - 1])}`;
}

function descripcionTarea(tarea) {
  const base = tarea.descripcion || "";
  if (
    tarea.tipo === TIPO_TAREA.MANTENIMIENTO &&
    tarea.equiposRealizados != null
  ) {
    const n = Number(tarea.equiposRealizados);
    return `${base} (${n} ${n === 1 ? "equipo" : "equipos"})`;
  }
  return base;
}

export async function generatePDF(recorrido, recorridoId) {
  // ✅ Usar formato horizontal (landscape)
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  let yPos = 20;

  // ============================================
  // ENCABEZADO NUEVO
  // ============================================

  // Cargar logo
  const logoUrl = "/logo_administracion-_01.png"; // ajustá la ruta según tu proyecto
  const logoBase64 = await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // El logo original es de 4500 px: embebido tal cual, cada PDF pesaba ~80 MB.
      // Se reduce a 600 px de ancho (sobra para 45 mm impresos).
      const escala = Math.min(1, 600 / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = logoUrl;
  });

  // Logo (izquierda) - ajustar width/height según proporción del logo
  doc.addImage(logoBase64, "PNG", 14, yPos - 6, 45, 18, undefined, "FAST");

  // Título centrado
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, "bold");
  doc.text("FORMULARIO", 148, yPos, { align: "center" });
  yPos += 6;
  doc.text("REGISTRO DE VISITAS", 148, yPos, { align: "center" });

  // Fecha vigencia (derecha)
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Fecha de vigencia: ${FORMULARIO.fechaVigencia}`, 234, yPos - 3, {
    align: "center",
  });

  // Línea separadora
  yPos += 8;
  doc.setDrawColor(200, 200, 200);
  doc.line(14, yPos, 280, yPos);
  yPos += 4;

  // Instrucción en rojo/cursiva (segunda línea del header)
  doc.setFontSize(8);
  doc.setTextColor(192, 0, 0);
  doc.setFont(undefined, "italic");
  doc.text(
    'Para completar este formulario utilice como referencia el instructivo "I-RD-01" disponible en la carpeta Calidad Genéricos/Instructivos',
    14,
    yPos + 4,
  );
  doc.setFont(undefined, "normal");
  doc.setTextColor(0, 0, 0);
  yPos += 12;

  // ============================================
  // DATOS PRINCIPALES - Distribución en columnas
  // ============================================
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const col1X = 14;
  const col2X = 150;
  let rowY = yPos;

  doc.setFont(undefined, "bold");
  doc.text("EMPRESA A LA QUE VISITA:", col1X, rowY);
  doc.setFont(undefined, "normal");
  const empresasVisitadas = [
    ...new Set(recorrido.visitas?.map((v) => v.empresa).filter(Boolean)),
  ];
  const empresasLineas = doc.splitTextToSize(
    empresasVisitadas.join(", ") || "No especificado",
    col2X - (col1X + 55) - 4,
  );
  doc.text(empresasLineas, col1X + 55, rowY);

  doc.setFont(undefined, "bold");
  doc.text("FECHA DE VISITA:", col2X, rowY);
  doc.setFont(undefined, "normal");
  doc.text(rangoFechasVisitas(recorrido), col2X + 40, rowY);
  rowY += 8 + (empresasLineas.length - 1) * 5;

  doc.setFont(undefined, "bold");
  doc.text("AREA/S:", col1X, rowY);
  doc.setFont(undefined, "normal");
  doc.text(recorrido.area || "No especificado", col1X + 30, rowY);

  doc.setFont(undefined, "bold");
  doc.text("PROVINCIA:", col2X, rowY);
  doc.setFont(undefined, "normal");
  const provinciasList =
    [
      ...new Set(recorrido.visitas?.map((v) => v.provincia).filter(Boolean)),
    ].join(", ") || "No especificado";
  doc.text(provinciasList, col2X + 28, rowY);
  rowY += 8;

  doc.setFont(undefined, "bold");
  doc.text("SUCURSAL/LOCALIDAD:", col1X, rowY);
  doc.setFont(undefined, "normal");
  const sucursalesList =
    recorrido.visitas
      ?.map((v) => v.sucursal)
      .filter(Boolean)
      .join(", ") || "No especificado";
  const sucursalesLineas = doc.splitTextToSize(
    sucursalesList,
    280 - (col1X + 45),
  );
  doc.text(sucursalesLineas, col1X + 45, rowY);
  rowY += 8 + (sucursalesLineas.length - 1) * 5;

  // ============================================
  // VEHÍCULO Y KILOMETRAJE (NUEVO CAMPO)
  // ============================================
  doc.setFont(undefined, "bold");
  doc.text("VEHÍCULO / KILOMETRAJE:", col1X, rowY);
  doc.setFont(undefined, "normal");
  doc.text(textoVehiculo(recorrido) || "No especificado", col1X + 55, rowY);
  rowY += 12;

  // ============================================
  // HORARIOS CON FECHA (salida y llegada)
  // ============================================
  doc.setFont(undefined, "bold");
  doc.text("HORARIO DE SALIDA:", col1X, rowY);
  doc.setFont(undefined, "normal");
  doc.text(formatTime(recorrido.horarioSalida), col1X + 45, rowY);
  doc.setFont(undefined, "bold");
  doc.text("FECHA SALIDA:", col1X + 85, rowY);
  doc.setFont(undefined, "normal");
  doc.text(
    formatDate(recorrido.fechaSalida) || formatDate(new Date()),
    col1X + 120,
    rowY,
  );
  rowY += 8;

  doc.setFont(undefined, "bold");
  doc.text("HORARIO DE LLEGADA:", col1X, rowY);
  doc.setFont(undefined, "normal");
  doc.text(formatTime(recorrido.horarioLlegada), col1X + 50, rowY);
  doc.setFont(undefined, "bold");
  doc.text("FECHA LLEGADA:", col1X + 85, rowY);
  doc.setFont(undefined, "normal");
  doc.text(
    formatDate(recorrido.fechaLlegada) || formatDate(new Date()),
    col1X + 120,
    rowY,
  );
  rowY += 12;

  // ============================================
  // NOMBRES DE VISITANTES
  // ============================================
  doc.setFont(undefined, "bold");
  doc.text("NOMBRE Y APELLIDO: (personas que realizan la visita)", col1X, rowY);
  rowY += 6;
  doc.setFont(undefined, "normal");

  const visitantes = recorrido.visitante
    ? recorrido.visitante.split(",").map((v) => v.trim())
    : [];
  let visitantesY = rowY;
  for (let i = 0; i < Math.min(visitantes.length, 5); i++) {
    doc.text(`${i + 1}. ${visitantes[i]}`, col1X + 5, visitantesY + i * 5);
  }
  rowY += Math.max(visitantes.length * 5, 20);

  // ============================================
  // ACTIVIDADES REALIZADAS - TABLA
  // ============================================
  doc.setFont(undefined, "bold");
  doc.text("ACTIVIDADES REALIZADAS", col1X, rowY);
  rowY += 6;

  const actividadesData = [];
  recorrido.visitas?.forEach((visita, idx) => {
    if (visita.tareas && visita.tareas.length > 0) {
      visita.tareas.forEach((tarea) => {
        if (tarea.descripcion) {
          actividadesData.push([
            visita.sucursal || `Sucursal ${idx + 1}`,
            formatDate(visita.fecha) || "--",
            visita.horarioIngreso || "--:--",
            visita.horarioEgreso || "--:--",
            descripcionTarea(tarea),
            tarea.completada ? "SI" : "NO",
          ]);
        }
      });
    } else if (visita.empresa) {
      actividadesData.push([
        visita.sucursal || `Sucursal ${idx + 1}`,
        formatDate(visita.fecha) || "--",
        visita.horarioIngreso || "--:--",
        visita.horarioEgreso || "--:--",
        visita.observaciones || `Visita a ${visita.empresa}`,
        "SI",
      ]);
    }
  });

  if (actividadesData.length === 0) {
    actividadesData.push([
      "No registrado",
      "--",
      "--:--",
      "--:--",
      "Sin actividades",
      "NO",
    ]);
  }

  autoTable(doc, {
    startY: rowY,
    head: [
      [
        "SUCURSAL",
        "FECHA",
        "INGRESO",
        "EGRESO",
        "DESCRIPCIÓN DE LA ACTIVIDAD",
        "FINALIZADA",
      ],
    ],
    body: actividadesData,
    theme: "grid",
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: 255,
      fontSize: 9,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 22 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: "auto" }, // toma el ancho que sobre (evita el aviso "could not fit page")
      5: { cellWidth: 25 },
    },
  });

  rowY = doc.lastAutoTable.finalY + 10;

  // ============================================
  // FIRMAS - UNA POR CADA SUCURSAL VISITADA
  // ============================================
  const visitasConFirma = recorrido.visitas?.filter((v) => v.empresa) || [];

  if (visitasConFirma.length === 0) {
    doc.text("No se registraron visitas", 14, rowY);
  } else {
    for (let i = 0; i < visitasConFirma.length; i++) {
      const visita = visitasConFirma[i];

      if (rowY > 180) {
        doc.addPage();
        rowY = 20;
      }

      doc.setFont(undefined, "bold");
      doc.text(
        `FIRMA DEL RESPONSABLE DE SUCURSAL ${i + 1}: ${visita.empresa} - ${visita.sucursal || ""}`,
        14,
        rowY,
      );
      rowY += 7;

      if (visita?.firma && visita.firma.startsWith("data:image")) {
        try {
          doc.addImage(visita.firma, "PNG", 30, rowY - 5, 50, 15);
        } catch (e) {
          doc.text("[Firma digital]", 30, rowY);
        }
      } else {
        doc.text("_____________________________", 30, rowY);
      }
      rowY += 15;
    }
  }

  // ============================================
  // PIE DE PÁGINA
  // ============================================
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `${FORMULARIO.codigo} ${FORMULARIO.version} - Fecha de revisión: ${FORMULARIO.fechaRevision}`,
      14,
      195,
    );
    doc.text(`Página ${i} de ${pageCount}`, 260, 195);
  }

  return doc.output("blob");
}

// Función para generar el nombre del archivo
export function generateFileName(recorrido) {
  const empresas = [
    ...new Set(recorrido.visitas?.map((v) => v.empresa).filter(Boolean)),
  ];
  const empresasStr = empresas.join("_").replace(/\s+/g, "_");
  const fecha =
    recorrido.fechaRecorrido || new Date().toISOString().split("T")[0];
  return `registro_visitas_${empresasStr}_${fecha}.pdf`;
}
