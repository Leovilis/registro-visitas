// // utils.js - Funciones auxiliares para guardado automático

// /**
//  * Guarda el formulario en localStorage como respaldo
//  * @param {Object} formData - Datos del formulario
//  */
// export const saveFormToLocalStorage = (formData) => {
//   try {
//     const timestamp = new Date().toISOString();
//     const savedData = {
//       ...formData,
//       savedAt: timestamp
//     };
//     localStorage.setItem('registro_visitas_backup', JSON.stringify(savedData));
//     console.log('Formulario guardado automáticamente en localStorage');
//   } catch (error) {
//     console.warn('No se pudo guardar respaldo en localStorage:', error);
//   }
// };

// /**
//  * Recupera el formulario desde localStorage
//  * @returns {Object|null} - Datos del formulario guardado o null si no hay datos
//  */
// export const loadFormFromLocalStorage = () => {
//   try {
//     const saved = localStorage.getItem('registro_visitas_backup');
//     if (saved) {
//       const data = JSON.parse(saved);
//       return data;
//     }
//   } catch (error) {
//     console.warn('No se pudo recuperar respaldo desde localStorage:', error);
//   }
//   return null;
// };

// /**
//  * Limpia el respaldo del localStorage
//  */
// export const clearLocalStorageBackup = () => {
//   try {
//     localStorage.removeItem('registro_visitas_backup');
//     console.log('Respaldo de localStorage eliminado');
//   } catch (error) {
//     console.warn('No se pudo limpiar respaldo de localStorage:', error);
//   }
// };

// /**
//  * Verifica si hay datos significativos en el formulario
//  * @param {Object} formData - Datos del formulario
//  * @returns {boolean} - true si hay datos significativos
//  */
// export const hasSignificantData = (formData) => {
//   return (
//     formData.empresa ||
//     formData.area ||
//     formData.sucursal ||
//     formData.provincia ||
//     formData.horarioSaludo ||
//     formData.visitante ||
//     formData.sucursal1.ingreso ||
//     formData.sucursal1.egreso ||
//     formData.sucursal1.firma ||
//     formData.sucursal2.ingreso ||
//     formData.sucursal2.egreso ||
//     formData.sucursal2.firma ||
//     formData.actividades.some(act => 
//       act.descripcion || act.finalizada
//     ) ||
//     formData.documentacion.firma ||
//     formData.documentacion.entregados.some(doc => doc.nombre || doc.firmaRecibio) ||
//     formData.documentacion.recibidos.some(doc => doc.nombre || doc.firmaRecibio) ||
//     formData.horarioLlegada
//   );
// };

// /**
//  * Calcula el tiempo transcurrido desde que se guardó un respaldo
//  * @param {string} savedAt - Timestamp del guardado
//  * @returns {number} - Horas transcurridas
//  */
// export const getHoursSinceSaved = (savedAt) => {
//   const savedTime = new Date(savedAt);
//   const now = new Date();
//   return (now - savedTime) / (1000 * 60 * 60);
// };

// /**
//  * Formatea la fecha y hora para mostrar al usuario
//  * @param {string} timestamp - Timestamp ISO
//  * @returns {string} - Fecha y hora formateada
//  */
// export const formatDateTime = (timestamp) => {
//   const date = new Date(timestamp);
//   return date.toLocaleString('es-ES', {
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit',
//     hour: '2-digit',
//     minute: '2-digit'
//   });
// };

// /**
//  * Hook personalizado para manejar la prevención de navegación
//  * @param {boolean} hasUnsavedChanges - Si hay cambios sin guardar
//  * @param {boolean} isFormSaved - Si el formulario fue guardado
//  * @returns {Object} - Funciones para manejar la navegación
//  */
// export const useNavigationWarning = (hasUnsavedChanges, isFormSaved) => {
//   const setupNavigationWarning = () => {
//     const handleBeforeUnload = (e) => {
//       if (hasUnsavedChanges && !isFormSaved) {
//         e.preventDefault();
//         e.returnValue = '¿Estás seguro de que quieres salir? Se perderán todos los datos no guardados.';
//         return e.returnValue;
//       }
//     };

//     const handlePopState = (e) => {
//       if (hasUnsavedChanges && !isFormSaved) {
//         const confirmLeave = window.confirm('¿Estás seguro de que quieres salir? Se perderán todos los datos no guardados.');
//         if (!confirmLeave) {
//           window.history.pushState(null, '', window.location.href);
//         }
//       }
//     };

//     window.addEventListener('beforeunload', handleBeforeUnload);
//     window.addEventListener('popstate', handlePopState);
    
//     if (hasUnsavedChanges && !isFormSaved) {
//       window.history.pushState(null, '', window.location.href);
//     }

//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//       window.removeEventListener('popstate', handlePopState);
//     };
//   };

//   return { setupNavigationWarning };
// };

// /**
//  * Configuración del guardado automático
//  */
// export const AUTO_SAVE_CONFIG = {
//   INTERVAL_MS: 30000, // 30 segundos
//   MAX_AGE_HOURS: 24, // 24 horas
//   STORAGE_KEY: 'registro_visitas_backup'
// };

// /**
//  * Maneja la recuperación de datos guardados automáticamente
//  * @param {Function} setFormData - Función para establecer los datos del formulario
//  * @returns {boolean} - true si se recuperaron datos
//  */
// export const handleDataRecovery = (setFormData) => {
//   const savedData = loadFormFromLocalStorage();
  
//   if (savedData && savedData.savedAt) {
//     const hoursDiff = getHoursSinceSaved(savedData.savedAt);
    
//     if (hoursDiff < AUTO_SAVE_CONFIG.MAX_AGE_HOURS) {
//       const formattedTime = formatDateTime(savedData.savedAt);
//       const restore = window.confirm(
//         `Se encontró un formulario guardado automáticamente el ${formattedTime}. ¿Quieres recuperarlo?`
//       );
      
//       if (restore) {
//         const { savedAt, ...dataToRestore } = savedData;
//         setFormData(dataToRestore);
//         return true;
//       }
//     } else {
//       // Limpiar datos muy antiguos
//       clearLocalStorageBackup();
//     }
//   }
  
//   return false;
// };

// /**
//  * Configuración por defecto del formulario
//  */
// export const getDefaultFormData = () => ({
//   empresa: "",
//   fechaVisita: new Date().toISOString().split("T")[0],
//   area: "",
//   sucursal: "",
//   provincia: "",
//   horarioSaludo: "",
//   visitante: "",
//   sucursal1: {
//     ingreso: "",
//     egreso: "",
//     firma: "",
//   },
//   sucursal2: {
//     ingreso: "",
//     egreso: "",
//     firma: "",
//   },
//   actividades: [
//     {
//       descripcion: "",
//       finalizada: "",
//     },
//   ],
//   documentacion: {
//     firma: "",
//     entregados: [{ nombre: "", firmaRecibio: "" }],
//     recibidos: [{ nombre: "", firmaRecibio: "" }],
//   },
//   horarioLlegada: "",
// });

// /**
//  * Valida si los datos del formulario están completos para guardar
//  * @param {Object} formData - Datos del formulario
//  * @returns {Object} - Resultado de la validación con errores
//  */
// export const validateFormData = (formData) => {
//   const errors = {};

//   // Validar campos básicos
//   if (!formData.empresa) errors.empresa = "Empresa es requerida";
//   if (!formData.area) errors.area = "Área es requerida";
//   if (!formData.sucursal) errors.sucursal = "Sucursal es requerida";
//   if (!formData.provincia) errors.provincia = "Provincia es requerida";
//   if (!formData.horarioSaludo) errors.horarioSaludo = "Horario de salida es requerido";
//   if (!formData.horarioLlegada) errors.horarioLlegada = "Horario de llegada es requerido";

//   // Validar visitante
//   const hasVisitante = formData.visitante;
//   if (!hasVisitante) errors.visitante = "Al menos un visitante es requerido";

//   // Validar sucursales
//   const sucursal1Completa = formData.sucursal1.ingreso && formData.sucursal1.egreso && formData.sucursal1.firma;
//   const sucursal2Completa = formData.sucursal2.ingreso && formData.sucursal2.egreso && formData.sucursal2.firma;
  
//   if (!sucursal1Completa && !sucursal2Completa) {
//     errors.sucursales = "Al menos una sucursal debe estar completa con horarios y firma";
//   }

//   // Validar actividades
//   formData.actividades.forEach((actividad, index) => {
//     const hasActivityData = actividad.descripcion || actividad.finalizada;
    
//     if (hasActivityData) {
//       if (!actividad.descripcion) errors[`actividad${index}Descripcion`] = "Descripción es requerida";
//       if (!actividad.finalizada) errors[`actividad${index}Finalizada`] = "Indicación de finalización es requerida";
//     }
//   });

//   return {
//     isValid: Object.keys(errors).length === 0,
//     errors
//   };
// };

// /**
//  * Genera estadísticas del formulario para debugging
//  * @param {Object} formData - Datos del formulario
//  * @returns {Object} - Estadísticas del formulario
//  */
// export const getFormStats = (formData) => {
//   const stats = {
//     fieldsCompleted: 0,
//     totalFields: 6, // campos básicos
//     // visitanteCount: formData.visitante.filter(v => v.trim() !== '').length,
//     actividadesCount: formData.actividades.filter(act => 
//       act.descripcion || act.finalizada
//     ).length,
//     documentosEntregados: formData.documentacion.entregados.filter(doc => doc.nombre).length,
//     documentosRecibidos: formData.documentacion.recibidos.filter(doc => doc.nombre).length,
//     sucursalesCompletas: 0
//   };

//   // Contar campos básicos completados
//   if (formData.empresa) stats.fieldsCompleted++;
//   if (formData.area) stats.fieldsCompleted++;
//   if (formData.sucursal) stats.fieldsCompleted++;
//   if (formData.provincia) stats.fieldsCompleted++;
//   if (formData.horarioSaludo) stats.fieldsCompleted++;
//   if (formData.horarioLlegada) stats.fieldsCompleted++;

//   // Contar sucursales completas
//   if (formData.sucursal1.ingreso && formData.sucursal1.egreso && formData.sucursal1.firma) {
//     stats.sucursalesCompletas++;
//   }
//   if (formData.sucursal2.ingreso && formData.sucursal2.egreso && formData.sucursal2.firma) {
//     stats.sucursalesCompletas++;
//   }

//   stats.completionPercentage = (stats.fieldsCompleted / stats.totalFields) * 100;
//   stats.hasSignatures = !!(formData.documentacion.firma || 
//                           formData.sucursal1.firma || 
//                           formData.sucursal2.firma);

//   return stats;
// };
// utils.js - Funciones auxiliares para guardado automático

/**
 * Guarda el formulario en localStorage como respaldo
 * @param {Object} formData - Datos del formulario
 */
// utils.js - Funciones auxiliares con soporte Safari

/**
 * Detecta si localStorage está disponible y funcional
 */
const isLocalStorageAvailable = () => {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Fallback storage usando cookies (funciona en Safari modo privado)
 */
const cookieStorage = {
  setItem: (key, value) => {
    try {
      const expires = new Date();
      expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000));
      const encodedValue = encodeURIComponent(value);
      document.cookie = `${key}=${encodedValue};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
      return true;
    } catch (e) {
      console.error('Error guardando en cookies:', e);
      return false;
    }
  },

  getItem: (key) => {
    try {
      const name = key + "=";
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookies = decodedCookie.split(';');
      
      for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(name) === 0) {
          return decodeURIComponent(cookie.substring(name.length));
        }
      }
      return null;
    } catch (e) {
      console.error('Error leyendo cookies:', e);
      return null;
    }
  },

  removeItem: (key) => {
    try {
      document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
      return true;
    } catch (e) {
      console.error('Error eliminando cookie:', e);
      return false;
    }
  }
};

/**
 * Detecta si sessionStorage está disponible
 */
const isSessionStorageAvailable = () => {
  try {
    const testKey = '__sessionStorage_test__';
    sessionStorage.setItem(testKey, 'test');
    sessionStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Storage unificado con fallback automático
 */
class SafariCompatibleStorage {
  constructor() {
    this.storageType = this._detectStorageType();
    console.log('Tipo de almacenamiento detectado:', this.storageType);
  }

  _detectStorageType() {
    if (isLocalStorageAvailable()) {
      return 'localStorage';
    } else if (isSessionStorageAvailable()) {
      console.warn('localStorage no disponible, usando sessionStorage');
      return 'sessionStorage';
    } else {
      console.warn('localStorage y sessionStorage no disponibles, usando cookies');
      return 'cookie';
    }
  }

  _getStorage() {
    switch (this.storageType) {
      case 'localStorage':
        return localStorage;
      case 'sessionStorage':
        return sessionStorage;
      case 'cookie':
        return cookieStorage;
      default:
        return cookieStorage;
    }
  }

  setItem(key, value) {
    try {
      const storage = this._getStorage();
      storage.setItem(key, value);
      return true;
    } catch (e) {
      console.error('Error guardando datos:', e);
      
      if (this.storageType === 'localStorage' && isSessionStorageAvailable()) {
        this.storageType = 'sessionStorage';
        return this.setItem(key, value);
      } else if (this.storageType !== 'cookie') {
        this.storageType = 'cookie';
        return this.setItem(key, value);
      }
      
      return false;
    }
  }

  getItem(key) {
    try {
      const storage = this._getStorage();
      return storage.getItem(key);
    } catch (e) {
      console.error('Error leyendo datos:', e);
      return null;
    }
  }

  removeItem(key) {
    try {
      const storage = this._getStorage();
      storage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Error eliminando datos:', e);
      return false;
    }
  }
}

// Instancia global del storage compatible
const safariStorage = new SafariCompatibleStorage();

/**
 * Configuración del guardado automático
 */
export const AUTO_SAVE_CONFIG = {
  INTERVAL_MS: 30000, // 30 segundos
  MAX_AGE_HOURS: 24, // 24 horas
  STORAGE_KEY: 'registro_visitas_backup'
};

/**
 * Guarda el formulario en storage como respaldo (compatible con Safari)
 * @param {Object} formData - Datos del formulario
 */
export const saveFormToLocalStorage = (formData) => {
  try {
    const timestamp = new Date().toISOString();
    const savedData = {
      ...formData,
      savedAt: timestamp
    };
    const success = safariStorage.setItem(
      AUTO_SAVE_CONFIG.STORAGE_KEY, 
      JSON.stringify(savedData)
    );
    
    if (success) {
      console.log('Formulario guardado automáticamente');
    } else {
      console.warn('No se pudieron guardar los datos');
    }
    
    return success;
  } catch (error) {
    console.error('Error guardando en storage:', error);
    return false;
  }
};

/**
 * Recupera el formulario desde storage (compatible con Safari)
 * @returns {Object|null} - Datos del formulario guardado o null si no hay datos
 */
export const loadFormFromLocalStorage = () => {
  try {
    const saved = safariStorage.getItem(AUTO_SAVE_CONFIG.STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      return data;
    }
  } catch (error) {
    console.warn('No se pudo recuperar respaldo desde storage:', error);
  }
  return null;
};

/**
 * Limpia el respaldo del storage (compatible con Safari)
 */
export const clearLocalStorageBackup = () => {
  try {
    safariStorage.removeItem(AUTO_SAVE_CONFIG.STORAGE_KEY);
    console.log('Respaldo eliminado correctamente');
    return true;
  } catch (error) {
    console.warn('No se pudo limpiar respaldo de storage:', error);
    return false;
  }
};

/**
 * Verifica si hay datos significativos en el formulario
 * @param {Object} formData - Datos del formulario
 * @returns {boolean} - true si hay datos significativos
 */
export const hasSignificantData = (formData) => {
  if (!formData) return false;
  
  return (
    formData.empresa ||
    formData.area ||
    formData.sucursal ||
    formData.provincia ||
    formData.horarioSaludo ||
    formData.visitante ||
    formData.sucursal1?.ingreso ||
    formData.sucursal1?.egreso ||
    formData.sucursal1?.firma ||
    formData.sucursal2?.ingreso ||
    formData.sucursal2?.egreso ||
    formData.sucursal2?.firma ||
    formData.actividades?.some(act => 
      act.descripcion || act.finalizada
    ) ||
    formData.documentacion?.firma ||
    formData.documentacion?.entregados?.some(doc => doc.nombre || doc.firmaRecibio) ||
    formData.documentacion?.recibidos?.some(doc => doc.nombre || doc.firmaRecibio) ||
    formData.horarioLlegada
  );
};

/**
 * Calcula el tiempo transcurrido desde que se guardó un respaldo
 * @param {string} savedAt - Timestamp del guardado
 * @returns {number} - Horas transcurridas
 */
export const getHoursSinceSaved = (savedAt) => {
  const savedTime = new Date(savedAt);
  const now = new Date();
  return (now - savedTime) / (1000 * 60 * 60);
};

/**
 * Formatea la fecha y hora para mostrar al usuario
 * @param {string} timestamp - Timestamp ISO
 * @returns {string} - Fecha y hora formateada
 */
export const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Maneja la recuperación de datos guardados automáticamente
 * @param {Function} setFormData - Función para establecer los datos del formulario
 * @returns {boolean} - true si se recuperaron datos
 */
export const handleDataRecovery = (setFormData) => {
  try {
    const savedData = loadFormFromLocalStorage();
    
    if (savedData && savedData.savedAt && hasSignificantData(savedData)) {
      const hoursDiff = getHoursSinceSaved(savedData.savedAt);
      
      if (hoursDiff < AUTO_SAVE_CONFIG.MAX_AGE_HOURS) {
        const formattedTime = formatDateTime(savedData.savedAt);
        const restore = window.confirm(
          `Se encontró un formulario guardado automáticamente el ${formattedTime}. ¿Quieres recuperarlo?`
        );
        
        if (restore) {
          const { savedAt, ...dataToRestore } = savedData;
          setFormData(dataToRestore);
          console.log('Datos recuperados correctamente');
          return true;
        } else {
          clearLocalStorageBackup();
        }
      } else {
        // Limpiar datos muy antiguos
        clearLocalStorageBackup();
      }
    }
  } catch (error) {
    console.error('Error en recuperación de datos:', error);
  }
  
  return false;
};

/**
 * Configuración por defecto del formulario - Actividades simplificadas
 */
export const getDefaultFormData = () => ({
  empresa: "",
  fechaVisita: new Date().toISOString().split("T")[0],
  area: "",
  sucursal: "",
  provincia: "",
  horarioSaludo: "",
  visitante: "",
  sucursal1: {
    ingreso: "",
    egreso: "",
    firma: "",
  },
  sucursal2: {
    ingreso: "",
    egreso: "",
    firma: "",
  },
  actividades: [
    {
      descripcion: "",
      finalizada: "",
    },
  ],
  documentacion: {
    firma: "",
    entregados: [{ nombre: "", firmaRecibio: "" }],
    recibidos: [{ nombre: "", firmaRecibio: "" }],
  },
  horarioLlegada: "",
});

/**
 * Valida si los datos del formulario están completos para guardar
 * @param {Object} formData - Datos del formulario
 * @returns {Object} - Resultado de la validación con errores
 */
export const validateFormData = (formData) => {
  const errors = {};

  // Validar campos básicos
  if (!formData.empresa) errors.empresa = "Empresa es requerida";
  if (!formData.area) errors.area = "Área es requerida";
  if (!formData.sucursal) errors.sucursal = "Sucursal es requerida";
  if (!formData.provincia) errors.provincia = "Provincia es requerida";
  if (!formData.horarioSaludo) errors.horarioSaludo = "Horario de salida es requerido";
  if (!formData.horarioLlegada) errors.horarioLlegada = "Horario de llegada es requerido";

  // Validar visitante
  const hasVisitante = formData.visitante && formData.visitante.trim();
  if (!hasVisitante) errors.visitante = "Nombre del visitante es requerido";

  // Validar sucursales - al menos una debe estar completa
  const sucursal1Completa = formData.sucursal1.ingreso && formData.sucursal1.egreso && formData.sucursal1.firma;
  const sucursal2Completa = formData.sucursal2.ingreso && formData.sucursal2.egreso && formData.sucursal2.firma;
  
  if (!sucursal1Completa && !sucursal2Completa) {
    errors.sucursales = "Al menos una sucursal debe estar completa con horarios y firma";
  }

  // Validar campos individuales de sucursal 1 si tiene algún dato
  if (formData.sucursal1.ingreso || formData.sucursal1.egreso || formData.sucursal1.firma) {
    if (!formData.sucursal1.ingreso) errors.sucursal1Ingreso = "Horario de ingreso requerido";
    if (!formData.sucursal1.egreso) errors.sucursal1Egreso = "Horario de egreso requerido";
    if (!formData.sucursal1.firma) errors.sucursal1Firma = "Firma del responsable requerida";
  }

  // Validar campos individuales de sucursal 2 si tiene algún dato
  if (formData.sucursal2.ingreso || formData.sucursal2.egreso || formData.sucursal2.firma) {
    if (!formData.sucursal2.ingreso) errors.sucursal2Ingreso = "Horario de ingreso requerido";
    if (!formData.sucursal2.egreso) errors.sucursal2Egreso = "Horario de egreso requerido";
    if (!formData.sucursal2.firma) errors.sucursal2Firma = "Firma del responsable requerida";
  }

  // Validar actividades simplificadas - solo descripción y finalizada
  formData.actividades.forEach((actividad, index) => {
    const hasDescription = actividad.descripcion && actividad.descripcion.trim();
    const hasStatus = actividad.finalizada && actividad.finalizada.trim();
    
    // Si tiene descripción, debe tener estado de finalización y viceversa
    if (hasDescription && !hasStatus) {
      errors[`actividad${index}Finalizada`] = "Debe indicar si la actividad está finalizada";
    }
    if (hasStatus && !hasDescription) {
      errors[`actividad${index}Descripcion`] = "Debe describir la actividad";
    }
  });

  // Validar documentación - si hay documentos, debe haber firma del responsable
  const tieneDocumentos = 
    formData.documentacion.entregados.some(doc => doc.nombre && doc.nombre.trim()) ||
    formData.documentacion.recibidos.some(doc => doc.nombre && doc.nombre.trim());
    
  if (tieneDocumentos && !formData.documentacion.firma) {
    errors.documentacionFirma = "Firma del responsable de documentación requerida";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Genera estadísticas del formulario para debugging
 * @param {Object} formData - Datos del formulario
 * @returns {Object} - Estadísticas del formulario
 */
export const getFormStats = (formData) => {
  const stats = {
    fieldsCompleted: 0,
    totalFields: 7,
    visitanteCompleto: !!(formData.visitante && formData.visitante.trim()),
    actividadesCount: formData.actividades.filter(act => 
      (act.descripcion && act.descripcion.trim()) && 
      (act.finalizada && act.finalizada.trim())
    ).length,
    documentosEntregados: formData.documentacion.entregados.filter(doc => doc.nombre && doc.nombre.trim()).length,
    documentosRecibidos: formData.documentacion.recibidos.filter(doc => doc.nombre && doc.nombre.trim()).length,
    sucursalesCompletas: 0,
    storageType: safariStorage.storageType // Información del tipo de storage usado
  };

  // Contar campos básicos completados
  if (formData.empresa) stats.fieldsCompleted++;
  if (formData.area) stats.fieldsCompleted++;
  if (formData.sucursal) stats.fieldsCompleted++;
  if (formData.provincia) stats.fieldsCompleted++;
  if (formData.horarioSaludo) stats.fieldsCompleted++;
  if (formData.horarioLlegada) stats.fieldsCompleted++;
  if (stats.visitanteCompleto) stats.fieldsCompleted++;

  // Contar sucursales completas
  if (formData.sucursal1.ingreso && formData.sucursal1.egreso && formData.sucursal1.firma) {
    stats.sucursalesCompletas++;
  }
  if (formData.sucursal2.ingreso && formData.sucursal2.egreso && formData.sucursal2.firma) {
    stats.sucursalesCompletas++;
  }

  stats.completionPercentage = Math.round((stats.fieldsCompleted / stats.totalFields) * 100);
  stats.hasSignatures = !!(formData.documentacion.firma || 
                          formData.sucursal1.firma || 
                          formData.sucursal2.firma);

  stats.actividadesTotal = formData.actividades.length;
  stats.actividadesConDatos = formData.actividades.filter(act => 
    act.descripcion || act.finalizada
  ).length;

  return stats;
};

// Exportar la instancia de storage por si se necesita acceso directo
export { safariStorage };