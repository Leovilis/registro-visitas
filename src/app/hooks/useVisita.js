// src/app/hooks/useVisita.js
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { firestoreService } from "@/app/services/firestoreService";
import { storageService } from "@/app/services/storageService";
import {
  createEmptyRecorrido,
  createEmptyVisita,
  ESTADO,
  TIPO_TAREA,
} from "@/app/models/recorridoModel";
import { getSucursal } from "@/app/data/catalogoSucursales";
import { aplicarRecorridoAlPrograma, getViaje, listParadasDeViaje } from "@/app/services/programaService";
import { getEmpresa } from "@/app/data/catalogoSucursales";
import { crearRecorridoDesdeViaje, tieneContenido } from "@/app/models/recorridoModel";

export function useVisita(recorridoIdParam = null, viajeParam = null) {
  const [recorrido, setRecorrido] = useState(createEmptyRecorrido());
  const [recorridoId, setRecorridoId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const autoSaveTimeout = useRef(null);
  const isInitialMount = useRef(true);
  // ID creado en esta sesión: cuando page.js lo pone en la URL, el efecto
  // vuelve a correr; sin esto se recargaba desde Firestore (todavía vacío)
  // y se perdía el recorrido precargado.
  const idCreadoLocalmente = useRef(null);

  // ============================================
  // Cargar recorrido existente o crear nuevo
  // ============================================
  useEffect(() => {
    const initRecorrido = async () => {
      setLoading(true);
      console.log("🔵 initRecorrido - Iniciando...");
      console.log("🔵 recorridoIdParam:", recorridoIdParam);

      if (recorridoIdParam && recorridoIdParam === idCreadoLocalmente.current) {
        // ✅ CASO 0: es el recorrido que acabamos de crear → no recargar
        setLoading(false);
        return;
      }

      if (recorridoIdParam) {
        // ✅ CASO 1: Hay ID en la URL → USAR ESE ID SIEMPRE
        setRecorridoId(recorridoIdParam);
        try {
          const data = await firestoreService.getRecorrido(recorridoIdParam);
          setRecorrido(data || createEmptyRecorrido());
        } catch (error) {
          console.error("🔴 Error loading recorrido:", error);
          setSaveError("Error al cargar el recorrido: " + error.message);
          setRecorrido(createEmptyRecorrido());
        }
      } else {
        // ✅ CASO 2: Sin ID en URL → CREAR NUEVO (precargado si viene ?viaje=)
        const nuevoId = crypto.randomUUID();
        let nuevo = createEmptyRecorrido();

        if (viajeParam) {
          try {
            const [viaje, paradas, sucursales] = await Promise.all([
              getViaje(viajeParam),
              listParadasDeViaje(viajeParam),
              firestoreService.getSucursales(),
            ]);
            if (viaje) {
              nuevo = crearRecorridoDesdeViaje(viaje, paradas, sucursales, getEmpresa);
              setToastMessage({
                message: `Recorrido precargado desde el viaje ${viaje.nro} (${nuevo.visitas.length} visitas)`,
                type: "success",
              });
            }
          } catch (error) {
            console.error("🔴 Error precargando viaje:", error);
            setSaveError("No se pudo precargar el viaje: " + error.message);
          }
        }

        idCreadoLocalmente.current = nuevoId;
        setRecorridoId(nuevoId);
        setRecorrido(nuevo);
        window.history.replaceState({}, "", `?id=${nuevoId}`);

        // Guardar enseguida si vino precargado, para no depender del auto-guardado
        if (viajeParam && nuevo.viajePlanId) {
          firestoreService.saveRecorrido(nuevoId, nuevo).catch((e) =>
            console.error("🔴 Error guardando precarga:", e),
          );
        }
      }

      setLoading(false);
      console.log("🔵 initRecorrido - Finalizado, ID actual:", recorridoIdParam || 'nuevo');
    };

    initRecorrido();
  }, [recorridoIdParam, viajeParam]); // ✅ Solo cuando cambian los parámetros de la URL

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
        const sucursalCat = getSucursal(visita.sucursalId);
        if (visita.sucursal && !visita.sucursalId) {
          errores.push({ field: `visita_${index}_sucursal`, label: `Visita ${num}: Sucursal (volver a elegirla de la lista)` });
        }
        if (sucursalCat?.depositos?.length && !visita.depositoId) {
          errores.push({ field: `visita_${index}_deposito`, label: `Visita ${num}: Depósito` });
        }
        if (!visita.fecha) {
          errores.push({ field: `visita_${index}_fecha`, label: `Visita ${num}: Fecha de la visita` });
        } else if (
          (recorrido.fechaSalida && visita.fecha < recorrido.fechaSalida) ||
          (recorrido.fechaLlegada && visita.fecha > recorrido.fechaLlegada)
        ) {
          errores.push({ field: `visita_${index}_fecha`, label: `Visita ${num}: Fecha fuera del rango salida/llegada` });
        }
        (visita.tareas || []).forEach((t) => {
          if (t.tipo === TIPO_TAREA.MANTENIMIENTO && t.completada &&
              (t.equiposRealizados === null || t.equiposRealizados === undefined || t.equiposRealizados === "")) {
            errores.push({ field: `visita_${index}_equipos_${t.id}`, label: `Visita ${num}: Equipos realizados` });
          }
        });
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

  // Acepta (visitaId, campo, valor) o (visitaId, { campo: valor, ... })
  const updateVisita = useCallback((visitaId, field, value) => {
    const cambios = typeof field === "object" && field !== null ? field : { [field]: value };
    setRecorrido((prev) => ({
      ...prev,
      visitas: prev.visitas.map((v) =>
        v.id === visitaId ? { ...v, ...cambios } : v,
      ),
    }));
  }, []);

  // La nueva visita hereda la fecha de la anterior (o la de salida)
  const addVisita = useCallback((nuevaVisita) => {
    setRecorrido((prev) => {
      const base = nuevaVisita || createEmptyVisita(prev.visitas.length);
      const ultima = prev.visitas[prev.visitas.length - 1];
      const fecha = base.fecha || ultima?.fecha || prev.fechaSalida || prev.fechaRecorrido || "";
      return {
        ...prev,
        visitas: [...prev.visitas, { ...base, fecha }],
      };
    });
  }, []);

  const removeVisita = useCallback((visitaId) => {
    setRecorrido((prev) => ({
      ...prev,
      visitas: prev.visitas
        .filter((v) => v.id !== visitaId)
        .map((v, idx) => ({ ...v, orden: idx })),
    }));
  }, []);

  /**
   * Finaliza el recorrido: intenta subir el PDF, lo aplica al programa F-ST-02
   * y guarda todo en una sola escritura.
   *
   * La subida a Storage es opcional: si falla o tarda más de 20 s, el
   * recorrido se finaliza igual (pdfUrl queda null). El PDF se puede
   * regenerar en cualquier momento porque todos los datos, firmas incluidas,
   * están en Firestore. Sin esto, el SDK de Storage reintenta hasta 10 minutos
   * y el botón parece colgado.
   */
  const savePDFToStorage = useCallback(
    async (pdfBlob) => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);

      let url = recorrido.pdfUrl || null;
      let avisoStorage = null;
      try {
        const subida = storageService.uploadPDF(recorridoId, pdfBlob);
        const limite = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("tiempo de espera agotado")), 20000),
        );
        ({ url } = await Promise.race([subida, limite]));
      } catch (error) {
        console.warn("⚠️ No se pudo subir el PDF a Storage:", error);
        avisoStorage = error.message;
      }

      const programa = await aplicarRecorridoAlPrograma(recorridoId, recorrido);

      const finalizado = {
        ...recorrido,
        estado: ESTADO.FINALIZADO,
        pdfUrl: url,
        finalizadoAt: new Date().toISOString(),
        visitas: recorrido.visitas.map((v) =>
          programa.asignaciones[v.id] ? { ...v, paradaPlanId: programa.asignaciones[v.id] } : v,
        ),
      };
      await firestoreService.saveRecorrido(recorridoId, finalizado);
      setRecorrido(finalizado);
      setLastSaved(new Date());

      return { url, programa, avisoStorage };
    },
    [recorridoId, recorrido],
  );

  const saveborrador = useCallback(async () => {
    console.log("💾 Guardando borrador...");
    await saveRecorrido(true);
  }, [saveRecorrido]);

  const newRecorrido = useCallback(() => {
    console.log("🆕 Creando nuevo recorrido...");
    const nuevoId = crypto.randomUUID();
    idCreadoLocalmente.current = nuevoId;
    
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
    // No guardar recorridos vacíos (antes cada vez que se abría la pantalla
    // quedaba un borrador vacío en Firestore)
    if (recorridoId && !loading && tieneContenido(recorrido)) {
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