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

  const autoSaveTimeout = useRef(null);
  const isInitialMount = useRef(true);

  // Cargar recorrido existente o crear nuevo
  useEffect(() => {
    const initRecorrido = async () => {
      setLoading(true);

      if (recorridoIdParam) {
        // Intentar cargar recorrido existente con el ID de la URL
        try {
          const data = await firestoreService.getRecorrido(recorridoIdParam);
          if (data) {
            // El ID existe, cargar los datos
            setRecorrido(data);
            setRecorridoId(recorridoIdParam);
          } else {
            // El ID no existe en Firestore, usar el mismo ID para crear nuevo
            setRecorridoId(recorridoIdParam);
            setRecorrido(createEmptyRecorrido());
          }
        } catch (error) {
          console.error("Error loading recorrido:", error);
          setSaveError("Error al cargar el recorrido");
          // Usar el ID de la URL también en caso de error
          setRecorridoId(recorridoIdParam);
          setRecorrido(createEmptyRecorrido());
        }
      } else {
        // Sin parámetro en URL, crear nuevo recorrido con ID nuevo
        const nuevoId = crypto.randomUUID();
        setRecorridoId(nuevoId);
        setRecorrido(createEmptyRecorrido());
      }

      setLoading(false);
    };

    initRecorrido();
  }, [recorridoIdParam]);

  // Guardar recorrido en Firestore
  const saveRecorrido = useCallback(
    async (force = false) => {
      if (!recorridoId) return;

      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }

      const save = async () => {
        setSaving(true);
        setSaveError(null);
        try {
          await firestoreService.saveRecorrido(recorridoId, recorrido);
          setLastSaved(new Date());
        } catch (error) {
          console.error("Error saving recorrido:", error);
          setSaveError("Error al guardar");
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

  // Actualizar campo principal del recorrido
  const updateRecorrido = useCallback((field, value) => {
    setRecorrido((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Actualizar una visita específica
  const updateVisita = useCallback((visitaId, field, value) => {
    setRecorrido((prev) => ({
      ...prev,
      visitas: prev.visitas.map((v) =>
        v.id === visitaId ? { ...v, [field]: value } : v,
      ),
    }));
  }, []);

  // Agregar nueva visita
  const addVisita = useCallback((nuevaVisita) => {
    setRecorrido((prev) => ({
      ...prev,
      visitas: [...prev.visitas, nuevaVisita],
    }));
  }, []);

  // Eliminar visita
  const removeVisita = useCallback((visitaId) => {
    setRecorrido((prev) => ({
      ...prev,
      visitas: prev.visitas
        .filter((v) => v.id !== visitaId)
        .map((v, idx) => ({ ...v, orden: idx })),
    }));
  }, []);

  // Guardar PDF en Storage y actualizar estado
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

  // Guardar borrador (guardado forzoso inmediato)
  const saveborrador = useCallback(async () => {
    await saveRecorrido(true);
  }, [saveRecorrido]);

  // Crear nuevo recorrido (reiniciar todo)
  const newRecorrido = useCallback(() => {
    setRecorrido(createEmptyRecorrido());
    const nuevoId = crypto.randomUUID();
    setRecorridoId(nuevoId);
    setLastSaved(null);
    setSaveError(null);
    // Actualizar URL sin recargar
    window.history.pushState({}, "", `?id=${nuevoId}`);
  }, []);

  // Auto-guardado cuando cambia el recorrido
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (recorridoId && !loading) {
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
    updateRecorrido,
    updateVisita,
    addVisita,
    removeVisita,
    saveborrador,
    savePDFToStorage,
    newRecorrido,
  };
}