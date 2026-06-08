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
  visitante: "",
  area: "",
  fechaRecorrido: new Date().toISOString().split("T")[0],
  horarioSalida: "",
  horarioLlegada: "",
  estado: ESTADO.BORRADOR,
  pdfUrl: null,
  visitas: [createEmptyVisita(0)],
  createdAt: null,
  updatedAt: null,
});

// Helpers
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
