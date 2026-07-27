"use client";

import { useEffect } from "react";

/**
 * AR-251 — se una sola scheda va in errore, non deve sparire tutta la Cabina.
 *
 * Il difetto: in tutto il Pannello non esisteva alcun error boundary. Un errore a runtime in un
 * singolo componente — una data non valida, un `.map` su qualcosa che non è un array, un JSON di
 * memoria con un campo del tipo sbagliato — portava via l'intera pagina e lasciava lo schermo bianco.
 * Nicola perdeva la Cabina per un difetto che riguardava una casella sola, e senza sapere quale.
 *
 * Next.js cerca questo file da solo: basta che esista. Nessuna riga esistente è stata toccata.
 *
 * La regola che segue: dire cosa è successo, offrire la via d'uscita, e non pretendere che l'utente
 * capisca lo stack. Il dettaglio tecnico c'è, ma sta sotto e non spaventa.
 */
export default function ErroreCabina({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // In console resta tutto, per quando serve capire davvero.
    console.error("[Cabina] errore non gestito:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <div className="text-2xl">😕</div>
        <h2 className="text-lg font-semibold">Questa parte della Cabina non è riuscita a caricarsi</h2>
        <p className="text-sm opacity-80">
          Il resto del Pannello funziona. Puoi riprovare: se l&apos;errore era passeggero, riparte da sola.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={reset}
            className="rounded-xl px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 transition"
          >
            Riprova
          </button>
          <a
            href="/"
            className="rounded-xl px-4 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 transition"
          >
            Torna alla Cabina
          </a>
        </div>

        <details className="pt-2">
          <summary className="text-xs opacity-60 cursor-pointer select-none">Dettaglio tecnico</summary>
          <pre className="mt-2 text-[11px] opacity-70 whitespace-pre-wrap break-words">
            {error?.message || "errore senza messaggio"}
            {error?.digest ? `\n\ndigest: ${error.digest}` : ""}
          </pre>
        </details>
      </div>
    </div>
  );
}
