// src/app/data/checklistCamionetas.js
// ============================================================
// F-RD-05 "Check list de camionetas" (Microsoft Forms)
//
// Se completa dos veces por viaje: a la salida y a la entrega. La app no lo
// reemplaza: le pasa los datos que ya tiene, con el "vínculo para rellenar
// previamente" que genera Forms.
//
// Los códigos de CAMPOS salen del vínculo de relleno previo del formulario.
// Si algún día se edita el formulario (se agrega o borra una pregunta), hay
// que volver a generarlo y actualizar estos códigos.
//
// Forms espera cada valor en un formato distinto según el tipo de pregunta:
//   texto/número → tal cual          ("CONDUCTOR_X", 999999)
//   opción/fecha → entre comillas    ("Visita a sucursal", "2030-01-01")
//   varias opciones → lista dentro de comillas   ("[\"Sistemas\"]")
// ============================================================

export const FORM_URL =
  "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=0fnICfieFUO2nYNgYkxfimJ6Z2hkGd5Er3-dLsoxa-NUMThJTVgxV1ZYWEExRVg3M0lQODBRQU5BTi4u";

// tipo: "texto" | "opcion" | "opciones" | "fecha"
export const CAMPOS = {
  momento: { id: "r0de21e9ef7144268bac9105a4578318f", tipo: "opcion" }, // 1. Salida o entrega
  fecha: { id: "r0f1812c29388469bbce8ba4235206fea", tipo: "fecha" }, // 2. Fecha
  areas: { id: "rcd0a2ea65364454391c0ecd384fd4bf2", tipo: "opciones" }, // 3. Áreas que viajan
  conductor: { id: "rdb504d716b1c4c52a909f6fdb81f9307", tipo: "texto" }, // 4. Conductor
  pasajeros: { id: "r05998d3cdd034a92b49cd59ba0f8cfaf", tipo: "texto" }, // 5. Pasajeros
  destinos: { id: "r7a081243d46c47e5869973ea7b58c4e2", tipo: "texto" }, // 5. Destino/s
  tipoViaje: { id: "redc73801cb9c4c999ee2ba1f79368fee", tipo: "opcion" }, // 6. Tipo de viaje
  camioneta: { id: "rf29fc13e557b4af3b91a55ec9b9060c4", tipo: "opcion" }, // 7. Camioneta
  kilometraje: { id: "r69194e9f00b14ceca65171245a0df3a6", tipo: "texto" }, // 8. Kilometraje actual
  responsable: { id: "rb7ae21e8b06343a69fdcf7135019bcd5", tipo: "texto" }, // 15. Responsable
};

// Los textos de las opciones tienen que coincidir carácter por carácter con
// los del formulario, emojis incluidos (\u00A0 es un espacio duro final).
export const OPCIONES = {
  salida:
    "Salida del veh\u00EDculo desde la administraci\u00F3n \u{1F697} \u27A1\uFE0F\u00A0",
  entrega:
    "Entrega del veh\u00EDculo en la administraci\u00F3n \u{1F697} \u2B05\uFE0F\u00A0",
  area: "Sistemas",
  tipoViaje: "Visita a sucursal",
};

const nombres = (visitante = "") =>
  visitante
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

// El primero de "Visitante/s" es el conductor; el resto, pasajeros
const primerNombre = (visitante) => nombres(visitante)[0] || "";
const resto = (visitante) => nombres(visitante).slice(1).join(", ");

const destinosDe = (recorrido) =>
  [
    ...new Set(
      (recorrido.visitas || []).map((v) => v.sucursal).filter(Boolean),
    ),
  ].join(", ");

const codificar = (valor, tipo) => {
  if (tipo === "opciones")
    return encodeURIComponent(JSON.stringify(JSON.stringify([valor])));
  if (tipo === "opcion" || tipo === "fecha")
    return encodeURIComponent(JSON.stringify(valor));
  return encodeURIComponent(valor);
};

/**
 * Enlace del F-RD-05 con los datos del recorrido ya cargados.
 * @param {"salida"|"entrega"} momento
 */
export const urlChecklist = (recorrido, momento) => {
  const valores = {
    momento: momento === "salida" ? OPCIONES.salida : OPCIONES.entrega,
    fecha:
      (momento === "salida"
        ? recorrido.fechaSalida
        : recorrido.fechaLlegada
      )?.slice(0, 10) || "",
    areas: OPCIONES.area,
    conductor: primerNombre(recorrido.visitante),
    pasajeros: resto(recorrido.visitante),
    destinos: destinosDe(recorrido),
    tipoViaje: OPCIONES.tipoViaje,
    // A la entrega el kilometraje es otro: se carga en el momento
    kilometraje:
      momento === "salida" ? String(recorrido.kilometraje || "") : "",
    responsable: recorrido.visitante || "",
  };

  const params = Object.entries(CAMPOS)
    .filter(([clave]) => valores[clave])
    .map(([clave, { id, tipo }]) => `${id}=${codificar(valores[clave], tipo)}`);

  return params.length ? `${FORM_URL}&${params.join("&")}` : FORM_URL;
};
