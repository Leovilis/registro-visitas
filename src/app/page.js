// src/app/page.js
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // ✅ IMPORTAR
import { Header } from "@/app/components/layout/Header";
import { SaveStatus } from "@/app/components/common/SaveStatus";
import { TimelineBar } from "@/app/components/common/TimelineBar";
import { PrintButton } from "@/app/components/ui/PrintButton";
import { useVisita } from "@/app/hooks/useVisita";
import { RecorridoForm } from "@/app/components/forms/RecorridoForm";
import { PrintableContent } from "@/app/components/ui/PrintableContent";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlRecorridoId = searchParams.get("id"); // ✅ Obtener ID de la URL

  // ✅ Pasar el ID al hook
  const {
    recorrido,
    recorridoId,
    saving,
    lastSaved,
    saveError,
    updateRecorrido,
    updateVisita,
    addVisita,
    removeVisita,
    saveborrador,
    savePDFToStorage,
    newRecorrido,
  } = useVisita(urlRecorridoId); // ← Pasar el ID de la URL

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Sincronizar la URL con el ID del recorrido
  useEffect(() => {
    if (mounted && recorridoId && !urlRecorridoId) {
      // Si tenemos ID pero no está en la URL, agregarlo
      router.replace(`?id=${recorridoId}`);
    }
  }, [mounted, recorridoId, urlRecorridoId, router]);

  if (!mounted) return null;

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="screen-content">
        <Header>
          <SaveStatus
            saving={saving}
            lastSaved={lastSaved}
            saveError={saveError}
          />
          {recorridoId && (
            <span className="text-xs text-gray-400 font-mono">
              ID: {recorridoId.slice(0, 8)}…
            </span>
          )}
        </Header>

        <RecorridoForm
          recorrido={recorrido}
          onUpdateRecorrido={updateRecorrido}
          onUpdateVisita={updateVisita}
          onAddVisita={addVisita}
          onRemoveVisita={removeVisita}
        />

        <TimelineBar recorrido={recorrido} />

        <section className="mt-6 p-4 bg-white border rounded-lg">
          <PrintButton
            viaje={recorrido}
            visitaId={recorridoId}
            onNewViaje={newRecorrido}
          />
        </section>

        <button
          onClick={() => saveborrador()}
          disabled={saving}
          className="fixed bottom-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all z-50"
        >
          {saving ? "⏳ Guardando..." : "💾 Guardar borrador"}
        </button>
      </div>

      <PrintableContent recorrido={recorrido} recorridoId={recorridoId} />
    </div>
  );
}
