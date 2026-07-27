"use client";

import { useEffect, useRef } from "react";
import { cimaDellaPila, conStrato, senzaStrato, stratoDaChiudere, voceDaTimbrare, type Strato } from "@/lib/strati";

/**
 * AR-222 / AR-242 / AR-243 — la mano che applica le regole di `lib/strati.ts` al browser.
 *
 * Qui c'è solo il collegamento: la pila viva, i due ascoltatori (indietro e Escape) e la registrazione
 * di ogni strato. Le DECISIONI stanno in `strati.ts`, senza import, dove un test le può eseguire —
 * questo file, che tocca `window`, non sarebbe eseguibile fuori da un browser.
 *
 * Un solo ascoltatore per tutta la Cabina, non uno per strato: con cinque `popstate` registrati da
 * cinque componenti l'ordine di chiusura dipenderebbe dall'ordine di montaggio, che è esattamente il
 * tipo di dipendenza invisibile da cui nascono i bug che «tornano».
 */

let pila: Strato[] = [];
let ascoltatoriAttivi = false;

/** Chiude lo strato in cima. Torna true se ha chiuso qualcosa (serve a decidere se fermarsi lì). */
export function chiudiStratoInCima(): boolean {
  const cima = cimaDellaPila(pila);
  if (!cima) return false;
  cima.chiudi();
  return true;
}

/** Chi è in cima adesso — per i gestori centrali che devono decidere se toccare l'area sotto. */
export function stratoInCimaAdesso(): Strato | null {
  return cimaDellaPila(pila);
}

function attivaAscoltatori() {
  if (ascoltatoriAttivi || typeof window === "undefined") return;
  ascoltatoriAttivi = true;

  // ① IL GESTO INDIETRO. Sul telefono è il tasto «chiudi» universale: se non chiude lo strato,
  // cambia l'area sotto e ti ritrovi altrove con il pannello ancora aperto sopra.
  window.addEventListener("popstate", (e) => {
    const cima = cimaDellaPila(pila);
    const daChiudere = stratoDaChiudere((e as PopStateEvent).state, cima);
    if (daChiudere) daChiudere.chiudi();
  });

  // ② ESCAPE. Uno per volta, dal più in cima: il primo Esc chiude il documento, il secondo la
  // cartella, il terzo il menù. È l'ordine che si aspetta chiunque abbia usato un browser.
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" && e.key !== "Esc") return;
    if (chiudiStratoInCima()) e.preventDefault();
  });
}

/**
 * Rende uno strato navigabile: si chiude col gesto indietro e con Esc, senza che chi lo apre debba
 * ricordarsene.
 *
 * @param nome   identificatore stabile dello strato (finisce nella voce di cronologia)
 * @param aperto se è aperto adesso
 * @param chiudi come si chiude — deve essere idempotente (può arrivare due volte)
 */
export function useStrato(nome: string, aperto: boolean, chiudi: () => void) {
  // Ref sempre fresco: la pila conserva la funzione, e se conservasse quella del primo render
  // chiuderebbe usando stato vecchio. Stesso motivo dei ref già usati in page.tsx per apriChat.
  const chiudiRef = useRef(chiudi);
  chiudiRef.current = chiudi;

  useEffect(() => {
    attivaAscoltatori();
    if (!aperto) {
      pila = senzaStrato(pila, nome);
      return;
    }
    pila = conStrato(pila, { nome, chiudi: () => chiudiRef.current() });
    try {
      const voce = voceDaTimbrare(window.history.state, nome);
      if (voce) window.history.pushState(voce, "", window.location.pathname + window.location.search);
    } catch {}
    return () => {
      pila = senzaStrato(pila, nome);
    };
  }, [nome, aperto]);
}
