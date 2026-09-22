// src/app/utils/formatters.js
//
// formatDate: las fechas "YYYY-MM-DD" se formatean como texto, sin pasar por
// Date. new Date("2026-09-03") es medianoche UTC y en Argentina (UTC-3) se
// mostraba como el día anterior (afectaba pantallas y PDF).

const dos = (n) => String(n).padStart(2, "0");

// Formato de fecha DD-MM-YYYY
export const formatDate = (fecha) => {
  if (!fecha) return "";
  if (typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}/.test(fecha)) {
    const [y, m, d] = fecha.slice(0, 10).split("-");
    return `${d}-${m}-${y}`;
  }
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (isNaN(d)) return String(fecha);
  return `${dos(d.getDate())}-${dos(d.getMonth() + 1)}-${d.getFullYear()}`;
};

// Formato de hora a HH:MM
export const formatTime = (time) => {
  if (!time) return "--:--";
  if (typeof time === "string") {
    const m = time.match(/^(\d{1,2}):(\d{2})/);
    return m ? `${dos(m[1])}:${m[2]}` : time;
  }
  const d = time instanceof Date ? time : new Date(time);
  if (isNaN(d)) return "--:--";
  return `${dos(d.getHours())}:${dos(d.getMinutes())}`;
};

// Fecha y hora: DD-MM-YYYY HH:MM (para timestamps ISO como updatedAt)
export const formatDateTime = (valor) => {
  if (!valor) return "";
  const d = valor instanceof Date ? valor : new Date(valor);
  if (isNaN(d)) return String(valor);
  return `${formatDate(d)} ${formatTime(d)}`;
};