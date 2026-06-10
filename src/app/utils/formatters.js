// src/app/utils/formatters.js

// Formato de fecha a dd-MM-yyyy
export const formatDate = (dateString) => {
  if (!dateString) return "";

  // Si ya viene en formato dd-MM-yyyy, devolverlo
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) return dateString;

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return dateString;
  }
};

// Formato de hora a HH:MM
export const formatTime = (time) => {
  if (!time) return "--:--";
  // Si ya tiene formato HH:MM, devolverlo
  if (/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time)) return time;
  return time;
};

// Formato de fecha y hora
export const formatDateTime = (dateString, timeString) => {
  const date = formatDate(dateString);
  const time = formatTime(timeString);
  if (date && time) return `${date} ${time}`;
  return date || time || "";
};
