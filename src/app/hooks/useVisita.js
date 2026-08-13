// src/app/hooks/useVisita.js
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { firestoreService } from "@/app/services/firestoreService";
import { storageService } from "@/app/services/storageService";
import {
  createEmptyRecorrido,
  createEmptyVisita,
  ESTADO,
} from "@/app/models/recorridoModel";

export function useVisita(recorridoIdParam = null) {
  const [recorrido, setRecorrido] = useState(createEmptyRecorrido());
  const [recorridoId, setRecorridoId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const autoSaveTimeout = useRef(null);
  const isInitialMount = useRef(true);

  // ============================================
  // Cargar recorrido existente o crear nuevo
  // ============================================
  useEffect(() => {
    const initRecorrido = async () => {
      setLoading(true);
      console.log("🔵 initRecorrido - Iniciando...");
      console.log("🔵 recorridoIdParam:", recorridoIdParam);

      if (recorridoIdParam) {
        // ✅ CASO 1: Hay ID en la URL → USAR ESE ID SIEMPRE
        console.log("🔵 Usando ID de URL:", recorridoIdParam);
        setRecorridoId(recorridoIdParam); // <-- NUNCA cambiar este ID
        
        try {
          const data = await firestoreService.getRecorrido(recorridoIdParam);
          console.log("🔵 Datos recibidos:", data);
          if (data) {
            console.log("🔵 Datos cargados correctamente");
            setRecorrido(data);
          } else {
            console.log("🟡 No existe en Firestore, creando NUEVO con el MISMO ID:", recorridoIdParam);
            setRecorrido(createEmptyRecorrido());
            // ✅ NO generar nuevo ID, usar el mismo
          }
        } catch (error) {
          console.error("🔴 Error loading recorrido:", error);
          setSaveError("Error al cargar el recorrido: " + error.message);
          // ✅ NO generar nuevo ID, usar el mismo
          setRecorrido(createEmptyRecorrido());
        }
      } else {
        // ✅ CASO 2: Sin ID en URL → CREAR NUEVO ID
        const nuevoId = crypto.randomUUID();
        console.log("🆕 Nuevo recorrido creado con ID:", nuevoId);
        setRecorridoId(nuevoId);
        setRecorrido(createEmptyRecorrido());
        // ✅ Actualizar la URL con el nuevo ID
        window.history.replaceState({}, "", `?id=${nuevoId}`);
      }

      setLoading(false);
      console.log("🔵 initRecorrido - Finalizado, ID actual:", recorridoIdParam || 'nuevo');
    };

    initRecorrido();
  }, [recorridoIdParam]); // ✅ Solo se ejecuta cuando cambia el parámetro de la URL

  // ============================================
  // Guardar recorrido (SIN validación - puede estar incompleto)
  // ============================================
  const saveRecorrido = useCallback(
    async (force = false) => {
      console.log("🟢 saveRecorrido llamado, force:", force);
      console.log("🟢 recorridoId:", recorridoId);
      console.log("🟢 recorrido:", recorrido);
      
      if (!recorridoId) {
        console.log("🔴 No hay recorridoId");
        return;
      }

      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }

      const save = async () => {
        setSaving(true);
        setSaveError(null);
        console.log("🟡 Intentando guardar en Firestore...");
        try {
          await firestoreService.saveRecorrido(recorridoId, recorrido);
          setLastSaved(new Date());
          console.log("✅ Guardado exitoso en Firestore");
        } catch (error) {
          console.error("❌ Error saving recorrido:", error);
          setSaveError("Error al guardar en Firestore: " + error.message);
        } finally {
          setSaving(false);
        }
      };

      if (force) {
        await save();
      } else {
        autoSaveTimeout.current = setTimeout(save, 5000);
      }
    },
    [recorridoId, recorrido],
  );

  // ============================================
  // VALIDACIÓN PARA PDF
  // ============================================
  const validarParaPDF = useCallback(() => {
    const errores = [];

    console.log("🔍 Validando campos para PDF...");

    // 1. Validar campos del recorrido
    if (!recorrido.visitante || recorrido.visitante.trim() === "") {
      errores.push({ field: 'visitante', label: 'Visitante' });
    }
    if (!recorrido.area || recorrido.area.trim() === "") {
      errores.push({ field: 'area', label: 'Área' });
    }
    if (!recorrido.fechaRecorrido) {
      errores.push({ field: 'fechaRecorrido', label: 'Fecha del recorrido' });
    }
    if (!recorrido.horarioSalida || recorrido.horarioSalida.trim() === "") {
      errores.push({ field: 'horarioSalida', label: 'Hora de salida de administración' });
    }
    if (!recorrido.fechaSalida || recorrido.fechaSalida.trim() === "") {
      errores.push({ field: 'fechaSalida', label: 'Fecha de salida de administración' });
    }
    if (!recorrido.horarioLlegada || recorrido.horarioLlegada.trim() === "") {
      errores.push({ field: 'horarioLlegada', label: 'Hora de llegada a administración' });
    }
    if (!recorrido.fechaLlegada || recorrido.fechaLlegada.trim() === "") {
      errores.push({ field: 'fechaLlegada', label: 'Fecha de llegada a administración' });
    }

    // 2. Validar cada visita
    if (!recorrido.visitas || recorrido.visitas.length === 0) {
      errores.push({ field: 'visitas', label: 'Visitas (agregar al menos una)' });
    } else {
      recorrido.visitas.forEach((visita, index) => {
        const num = index + 1;
        if (!visita.empresa || visita.empresa.trim() === "") {
          errores.push({ field: `visita_${index}_empresa`, label: `Visita ${num}: Empresa` });
        }
        if (!visita.sucursal || visita.sucursal.trim() === "") {
          errores.push({ field: `visita_${index}_sucursal`, label: `Visita ${num}: Sucursal` });
        }
        if (!visita.provincia || visita.provincia.trim() === "") {
          errores.push({ field: `visita_${index}_provincia`, label: `Visita ${num}: Provincia` });
        }
        if (!visita.horarioIngreso || visita.horarioIngreso.trim() === "") {
          errores.push({ field: `visita_${index}_horarioIngreso`, label: `Visita ${num}: Hora de ingreso` });
        }
        if (!visita.horarioEgreso || visita.horarioEgreso.trim() === "") {
          errores.push({ field: `visita_${index}_horarioEgreso`, label: `Visita ${num}: Hora de egreso` });
        }
        if (!visita.firma || visita.firma.trim() === "") {
          errores.push({ field: `visita_${index}_firma`, label: `Visita ${num}: Firma del responsable` });
        }
      });
    }

    if (errores.length > 0) {
      console.log("📝 Errores encontrados:", errores);
    } else {
      console.log("✅ Validación exitosa - todos los campos completos");
    }

    return errores;
  }, [recorrido]);

  // ============================================
  // FUNCIÓN PARA ENFOCAR UN CAMPO
  // ============================================
  const enfocarCampo = useCallback((fieldId) => {
    console.log("🔍 Buscando campo:", fieldId);
    
    let elemento = document.getElementById(fieldId);
    
    if (!elemento) {
      elemento = document.querySelector(`[data-field="${fieldId}"]`);
    }
    
    if (!elemento && fieldId.startsWith('visita_')) {
      const parts = fieldId.split('_');
      const index = parseInt(parts[1]);
      const campo = parts.slice(2).join('_');
      
      const visitaContainer = document.querySelector(`[data-visita-index="${index}"]`);
      if (visitaContainer) {
        elemento = visitaContainer.querySelector(`[data-field="${campo}"]`) ||
                   visitaContainer.querySelector(`#${campo}_${index}`) ||
                   visitaContainer.querySelector(`[id*="${campo}"]`);
        
        if (!elemento) {
          elemento = visitaContainer;
        }
      }
    }

    if (fieldId === 'visitas') {
      const botonAgregar = document.querySelector('button[class*="Agregar visita"]') ||
                          document.querySelector('button:has(.text-lg)');
      if (botonAgregar) {
        elemento = botonAgregar;
      }
    }

    if (elemento) {
      console.log("✅ Campo encontrado, enfocando...");
      
      elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      setTimeout(() => {
        if (elemento.tagName === 'INPUT' || elemento.tagName === 'SELECT' || elemento.tagName === 'TEXTAREA') {
          elemento.focus({ preventScroll: true });
        }
        
        elemento.classList.add('border-red-500', 'ring-2', 'ring-red-200');
        
        const parent = elemento.closest('div') || elemento.parentElement;
        let errorMsg = parent.querySelector('.campo-requerido');
        if (!errorMsg && parent) {
          errorMsg = document.createElement('span');
          errorMsg.className = 'campo-requerido text-red-500 text-xs font-medium ml-1';
          errorMsg.textContent = '⚠️ Campo requerido';
          parent.appendChild(errorMsg);
        }
        
        const timeoutId = setTimeout(() => {
          elemento.classList.remove('border-red-500', 'ring-2', 'ring-red-200');
          const msg = parent?.querySelector('.campo-requerido');
          if (msg) msg.remove();
        }, 3000);
        
        const cleanup = () => {
          clearTimeout(timeoutId);
          elemento.classList.remove('border-red-500', 'ring-2', 'ring-red-200');
          const msg = parent?.querySelector('.campo-requerido');
          if (msg) msg.remove();
          elemento.removeEventListener('input', cleanup);
          elemento.removeEventListener('change', cleanup);
          elemento.removeEventListener('click', cleanup);
        };
        
        elemento.addEventListener('input', cleanup);
        elemento.addEventListener('change', cleanup);
        elemento.addEventListener('click', cleanup);
        
      }, 300);
      
      return true;
    } else {
      console.warn("⚠️ Campo no encontrado:", fieldId);
      return false;
    }
  }, []);

  // ============================================
  // FUNCIÓN DE VALIDACIÓN CON ENFOQUE
  // ============================================
  const validarYGenerarPDF = useCallback(async () => {
    const errores = validarParaPDF();
    
    if (errores.length > 0) {
      setSaveError(`❌ Hay ${errores.length} campo(s) obligatorio(s) por completar`);
      setToastMessage({
        message: `Hay ${errores.length} campo(s) obligatorio(s) por completar`,
        type: 'error'
      });
      
      if (errores.length > 0) {
        setTimeout(() => {
          enfocarCampo(errores[0].field);
        }, 500);
      }
      
      console.error("❌ Errores de validación para PDF:", errores);
      return { success: false, errores };
    }
    
    console.log("✅ Validación exitosa para PDF");
    setSaveError(null);
    setToastMessage(null);
    return { success: true, errores: [] };
  }, [validarParaPDF, enfocarCampo]);

  // ============================================
  // FUNCIONES PARA MANEJAR TOAST
  // ============================================
  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  // ============================================
  // Resto de funciones
  // ============================================
  const updateRecorrido = useCallback((field, value) => {
    setRecorrido((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateVisita = useCallback((visitaId, field, value) => {
    setRecorrido((prev) => ({
      ...prev,
      visitas: prev.visitas.map((v) =>
        v.id === visitaId ? { ...v, [field]: value } : v,
      ),
    }));
  }, []);

  const addVisita = useCallback((nuevaVisita) => {
    setRecorrido((prev) => ({
      ...prev,
      visitas: [...prev.visitas, nuevaVisita],
    }));
  }, []);

  const removeVisita = useCallback((visitaId) => {
    setRecorrido((prev) => ({
      ...prev,
      visitas: prev.visitas
        .filter((v) => v.id !== visitaId)
        .map((v, idx) => ({ ...v, orden: idx })),
    }));
  }, []);

  const savePDFToStorage = useCallback(
    async (pdfBlob) => {
      try {
        const { url } = await storageService.uploadPDF(recorridoId, pdfBlob);
        await firestoreService.updateEstado(
          recorridoId,
          ESTADO.FINALIZADO,
          url,
        );
        updateRecorrido("estado", ESTADO.FINALIZADO);
        updateRecorrido("pdfUrl", url);
        return url;
      } catch (error) {
        console.error("Error uploading PDF:", error);
        throw error;
      }
    },
    [recorridoId, updateRecorrido],
  );

  const saveborrador = useCallback(async () => {
    console.log("💾 Guardando borrador...");
    await saveRecorrido(true);
  }, [saveRecorrido]);

  const newRecorrido = useCallback(() => {
    console.log("🆕 Creando nuevo recorrido...");
    const nuevoId = crypto.randomUUID();
    console.log("🆕 Nuevo ID generado:", nuevoId);
    
    setRecorrido(createEmptyRecorrido());
    setRecorridoId(nuevoId);
    setLastSaved(null);
    setSaveError(null);
    setToastMessage(null);
    
    window.history.pushState({}, "", `?id=${nuevoId}`);
    console.log("🆕 URL actualizada con nuevo ID:", window.location.href);
  }, []);

  // Auto-guardado cuando cambia el recorrido
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (recorridoId && !loading) {
      console.log("🔄 Auto-guardado activado por cambio en recorrido");
      saveRecorrido();
    }
  }, [recorrido, saveRecorrido, recorridoId, loading]);

  return {
    recorrido,
    recorridoId,
    saving,
    lastSaved,
    saveError,
    loading,
    toastMessage,
    updateRecorrido,
    updateVisita,
    addVisita,
    removeVisita,
    saveborrador,
    savePDFToStorage,
    newRecorrido,
    validarYGenerarPDF,
    clearToast,
  };
}