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
  const [recorridoId, setRecorridoId] = useState(
    recorridoIdParam || crypto.randomUUID(),
  );
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [loading, setLoading] = useState(!!recorridoIdParam);

  const autoSaveTimeout = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (recorridoIdParam) {
      loadRecorrido(recorridoIdParam);
    }
  }, [recorridoIdParam]);

  const loadRecorrido = async (id) => {
    setLoading(true);
    try {
      const data = await firestoreService.getRecorrido(id);
      if (data) {
        setRecorrido(data);
        setRecorridoId(id);
      }
    } catch (error) {
      console.error("Error loading recorrido:", error);
      setSaveError("Error al cargar el recorrido");
    } finally {
      setLoading(false);
    }
  };

  const saveRecorrido = useCallback(
    async (force = false) => {
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
    await saveRecorrido(true);
  }, [saveRecorrido]);

  const newRecorrido = useCallback(() => {
    setRecorrido(createEmptyRecorrido());
    setRecorridoId(crypto.randomUUID());
    setLastSaved(null);
    setSaveError(null);
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    saveRecorrido();
  }, [recorrido, saveRecorrido]);

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
