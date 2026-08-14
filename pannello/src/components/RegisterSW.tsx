"use client";

import { useEffect, useState } from "react";
import { decidiRicaricaPagina, lavoroInCorso } from "@/lib/casella-ricarica";

// Registra il service worker così il Pannello è installabile come app (PWA).
//
// AR-408 — la pagina non si ricarica più sotto le dita di Nicola.
// Prima: `controllerchange` → `window.location.reload()`, sempre. Ma quell'evento scatta anche alla
// PRIMA visita — la pagina non è controllata da nessuno, il worker si registra, si prende il
// controllo e l'evento parte: ricarica completa garantita, con tutte le richieste rifatte da capo.
// E scatta di nuovo a ogni pubblicazione di una versione nuova, su ogni Pannello aperto, in
// qualunque momento — anche a metà di un messaggio.
//
// La decisione sta in `lib/casella-ricarica.ts` perché qui dentro non si può interrogare: un test
// dovrebbe montare mezzo browser. Questo file tiene solo il collegamento con `navigator`.
export default function RegisterSW() {
  const [aggiornamentoInAttesa, setAggiornamentoInAttesa] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    // Si guarda PRIMA della registrazione: dopo, il controller c'è comunque e la domanda
    // «era già controllata?» non ha più risposta.
    const controllerPrima = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.register("/sw.js").catch((e: unknown) => {
      // Registrazione fallita = niente installazione come app e niente cache offline. Non si mostra
      // niente a Nicola (non è un dato che sta guardando) ma non si ingoia: resta scritto in console,
      // altrimenti «il Pannello non si installa» diventa un mistero senza traccia.
      console.warn("[RegisterSW] service worker non registrato:", (e as Error)?.message || e);
    });

    let ricaricato = false;
    const onChange = () => {
      if (ricaricato) return;
      const d = decidiRicaricaPagina({ controllerPrima, lavoroInCorso: lavoroInCorso() });
      if (d.azione === "niente") return;
      if (d.azione === "rimanda") {
        setAggiornamentoInAttesa(true);
        return;
      }
      ricaricato = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onChange);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onChange);
  }, []);

  if (!aggiornamentoInAttesa) return null;

  // La ricarica rimandata: c'è una versione nuova, ma c'era anche un messaggio a metà. Decide Nicola.
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] min-h-[44px] px-4 py-2 rounded-xl bg-brand text-white text-[13px] font-medium shadow-xl"
    >
      Nuova versione pronta — tocca per aggiornare
    </button>
  );
}
