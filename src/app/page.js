// src/app/page.js
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/app/components/layout/Header";
import { SaveStatus } from "@/app/components/common/SaveStatus";
import { Toast } from "@/app/components/common/Toast";
import { TimelineBar } from "@/app/components/common/TimelineBar";
import { PrintButton } from "@/app/components/ui/PrintButton";
import { useVisita } from "@/app/hooks/useVisita";
import { RecorridoForm } from "@/app/components/forms/RecorridoForm";
import { PrintableContent } from "@/app/components/ui/PrintableContent";
import { LoadingSpinner } from "@/app/components/common/LoadingSpinner";

// Componente interno que usa useSearchParams
function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlRecorridoId = searchParams.get("id");
  const urlViajeId = searchParams.get("viaje"); // desde "Iniciar recorrido" del programa

  const {
    recorrido,
    recorridoId,
    saving,
    lastSaved,
    saveError,
    toastMessage,
    updateRecorrido,
    updateVisita,
    addVisita,
    removeVisita,
    saveborrador,
    savePDFToStorage,
    eliminarRecorridoActual,
    newRecorrido,
    validarYGenerarPDF,
    clearToast,
  } = useVisita(urlRecorridoId, urlViajeId);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Sincronizar la URL con el ID del recorrido
  useEffect(() => {
    if (mounted && recorridoId && !urlRecorridoId) {
      console.log("🔄 Sincronizando URL con ID:", recorridoId);
      router.replace(`?id=${recorridoId}`);
    }
  }, [mounted, recorridoId, urlRecorridoId, router]);

  if (!mounted) return null;

  return (
    <div className="container mx-auto max-w-4xl px-3 py-4 pb-24 sm:p-4 sm:pb-24">
      {/* Toast de notificación */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={clearToast}
          duration={5000}
        />
      )}

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

        {recorrido.estado === "finalizado" && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
            <p className="font-semibold">Recorrido finalizado</p>
            <p className="mt-1">
              Podés corregirlo: los cambios se guardan solos y el programa
              F-ST-02 se actualiza (si quitás una visita o destildás el
              mantenimiento, esa sucursal vuelve a pendiente). Para tener el PDF
              corregido, tocá &quot;Guardar cambios y regenerar PDF&quot;.
            </p>
          </div>
        )}

        <RecorridoForm
          recorrido={recorrido}
          onUpdateRecorrido={updateRecorrido}
          onUpdateVisita={updateVisita}
          onAddVisita={addVisita}
          onRemoveVisita={removeVisita}
        />

        <TimelineBar recorrido={recorrido} />

        <section className="mt-6 p-4 bg-white border rounded-lg space-y-3">
          <PrintButton
            viaje={recorrido}
            visitaId={recorridoId}
            onNewViaje={newRecorrido}
            onValidarPDF={validarYGenerarPDF}
            onFinalizar={savePDFToStorage}
          />
          <button
            type="button"
            onClick={async () => {
              const aviso =
                recorrido.estado === "finalizado"
                  ? "¿Eliminar este recorrido FINALIZADO?\n\nLas sucursales que marcó como visitadas vuelven a pendiente en el programa (salvo que otro recorrido las respalde). No se puede deshacer."
                  : "¿Eliminar este borrador? No se puede deshacer.";
              if (!confirm(aviso)) return;
              try {
                await eliminarRecorridoActual();
                router.push("/recorridos");
              } catch (e) {
                alert("No se pudo eliminar: " + e.message);
              }
            }}
            className="w-full py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
          >
            🗑️ Eliminar recorrido
          </button>
        </section>

        <button
          onClick={() => {
            console.log("💾 Click en Guardar borrador");
            saveborrador();
          }}
          disabled={saving}
          className="fixed bottom-4 right-4 w-14 h-14 sm:w-auto sm:h-auto sm:px-4 sm:py-2 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all z-50"
          aria-label="Guardar borrador"
          title="Guardar borrador"
        >
          {/* En mobile solo el ícono: el texto tapaba los campos (igual hay auto-guardado) */}
          <span className="text-xl sm:text-base">{saving ? "⏳" : "💾"}</span>
          <span className="hidden sm:inline">
            {saving ? "Guardando..." : "Guardar borrador"}
          </span>
        </button>
      </div>

      <PrintableContent recorrido={recorrido} recorridoId={recorridoId} />
    </div>
  );
}

// Componente principal con Suspense
export default function Home() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HomeContent />
    </Suspense>
  );
}
