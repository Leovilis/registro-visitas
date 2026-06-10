// src/app/models/recorridoModel.js

export const ESTADO = {
  BORRADOR: "borrador",
  FINALIZADO: "finalizado",
};

// Crear una nueva tarea vacía
export const createEmptyTarea = () => ({
  id: crypto.randomUUID(),
  descripcion: "",
  completada: false,
});

// Crear una nueva visita a empresa
export const createEmptyVisita = (orden) => ({
  id: crypto.randomUUID(),
  orden,
  empresa: "",
  sucursal: "",
  provincia: "",
  horarioIngreso: "",
  horarioEgreso: "",
  firma: "",
  tareas: [createEmptyTarea()],
  observaciones: "",
});

// Crear un nuevo recorrido vacío
export const createEmptyRecorrido = () => ({
  id: null,
  visitante: "",
  area: "",
  fechaRecorrido: new Date().toISOString().split("T")[0],
  horarioSalida: "",
  horarioLlegada: "",
  vehiculo: "",
  observacionesGenerales: "",
  estado: ESTADO.BORRADOR,
  pdfUrl: null,
  visitas: [createEmptyVisita(0)],
  createdAt: null,
  updatedAt: null,
});

// Helpers para tareas
export const addTareaToVisita = (visita) => ({
  ...visita,
  tareas: [...visita.tareas, createEmptyTarea()],
});

export const removeTareaFromVisita = (visita, tareaId) => ({
  ...visita,
  tareas: visita.tareas.filter((t) => t.id !== tareaId),
});

export const updateTareaInVisita = (visita, tareaId, updates) => ({
  ...visita,
  tareas: visita.tareas.map((t) =>
    t.id === tareaId ? { ...t, ...updates } : t,
  ),
});

// Helpers para visitas
export const addVisitaToRecorrido = (recorrido) => ({
  ...recorrido,
  visitas: [...recorrido.visitas, createEmptyVisita(recorrido.visitas.length)],
});

export const removeVisitaFromRecorrido = (recorrido, visitaId) => ({
  ...recorrido,
  visitas: recorrido.visitas
    .filter((v) => v.id !== visitaId)
    .map((v, idx) => ({ ...v, orden: idx })),
});

// Obtener empresas únicas visitadas
export const getEmpresasVisitadas = (recorrido) => {
  if (!recorrido.visitas) return [];
  return [...new Set(recorrido.visitas.map((v) => v.empresa).filter(Boolean))];
};

// Obtener sucursales únicas visitadas
export const getSucursalesVisitadas = (recorrido) => {
  if (!recorrido.visitas) return [];
  return [...new Set(recorrido.visitas.map((v) => v.sucursal).filter(Boolean))];
};
