// scripts/firebaseAdmin.mjs
// Conexión a Firestore para los scripts de carga.
// Busca la cuenta de servicio en este orden:
//   1. La ruta de la variable GOOGLE_APPLICATION_CREDENTIALS (si está definida)
//   2. service-account.json en la raíz del proyecto
// El projectId se toma del mismo archivo, así no depende del entorno.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ruta = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  : path.join(raiz, "service-account.json");

if (!fs.existsSync(ruta)) {
  console.error(`\n❌ No se encontró la cuenta de servicio en:\n   ${ruta}\n`);
  console.error("Descargala en Firebase Console > Configuración del proyecto > Cuentas de servicio >");
  console.error('"Generar nueva clave privada", y guardala como service-account.json en la raíz del proyecto.\n');
  process.exit(1);
}

let cuenta;
try {
  cuenta = JSON.parse(fs.readFileSync(ruta, "utf8"));
} catch (e) {
  console.error(`\n❌ El archivo ${ruta} no es un JSON válido: ${e.message}\n`);
  process.exit(1);
}

initializeApp({ credential: cert(cuenta), projectId: cuenta.project_id });
console.log(`🔑 Proyecto Firebase: ${cuenta.project_id}\n`);

export const db = getFirestore();
