// 🧪 MODALITÀ DEMO — far vedere la macchina "viva" anche senza chiavi.
// Scopo: testare il pannello (numeri, cuore che batte, volano, azioni) con dati
// di ESEMPIO, chiaramente etichettati. Regola d'oro / onestà: in demo NIENTE di
// reale viene inviato e ogni numero è marchiato `demo:true` + banner visibile.
//
// Si attiva con un cookie `mycity_demo=on` (impostato da /api/demo). Le funzioni
// server che leggono i dati controllano `demoAttivo()` e, se acceso, restituiscono
// questi valori finti invece di chiamare il database reale.

import { cookies } from "next/headers";
import type { Metriche } from "@/lib/marketplace-db";

export const COOKIE_DEMO = "mycity_demo";

/** True se la modalità demo è accesa (cookie). Robusto: false fuori da una richiesta. */
export async function demoAttivo(): Promise<boolean> {
  try {
    const c = await cookies();
    return c.get(COOKIE_DEMO)?.value === "on";
  } catch {
    return false;
  }
}

/**
 * Metriche di ESEMPIO coerenti tra loro (una piccola storia di Piacenza):
 * 14 negozi, ~328 clienti, ordini e incassi credibili. `demo:true` le marchia
 * ovunque così non si confondono mai con i dati reali.
 */
export function metricheDemo(): Metriche {
  return {
    connected: true,
    demo: true,
    marketplace_collegato: true,
    traffico_collegato: true,
    // --- Ordini ---
    ordini_oggi: 12,
    ordini_7g: 81,
    ordini_30g: 318,
    // --- Incasso / GMV ---
    incasso_oggi: 384.5,
    incasso_7g: 2487,
    incasso_30g: 9920,
    // --- Scontrino ---
    scontrino_medio: 31.2,
    scontrino_oggi: 32.04,
    scontrino_7g: 30.7,
    scontrino_30g: 31.2,
    // --- Clienti ---
    nuovi_clienti_oggi: 4,
    nuovi_clienti_7g: 31,
    nuovi_clienti_30g: 121,
    clienti: 328,
    clienti_attivi_oggi: 12,
    clienti_attivi_7g: 96,
    clienti_attivi_30g: 188,
    clienti_dormienti: 47,
    // --- Carrelli ---
    carrelli: 7,
    carrelli_oggi: 2,
    carrelli_7g: 14,
    carrelli_30g: 58,
    carrelli_recuperati_oggi: 1,
    carrelli_recuperati_7g: 5,
    carrelli_recuperati_30g: 19,
    // --- Negozi ---
    negozi: 14,
    nuovi_negozi_oggi: 1,
    nuovi_negozi_7g: 2,
    nuovi_negozi_30g: 6,
    // --- Consegne / Operations ---
    consegne_in_corso: 5,
    consegne_oggi: 9,
    consegne_7g: 74,
    consegne_30g: 295,
    tempo_consegna_min: 34,
    problemi: 2,
    annullati_oggi: 0,
    annullati_7g: 3,
    annullati_30g: 9,
    // --- Qualità / recensioni ---
    recensione_media: 4.6,
    recensioni_totali: 143,
    // --- Traffico (come se PostHog fosse collegato) ---
    visite_7g: 1860,
    conversione: 4.4,
  };
}

export type CuoreDemo = {
  collegato: boolean;
  demo: boolean;
  ultimoBattito: string | null;
  eseguiteUltimo: number;
  autopilota: boolean;
  pensiero: string | null;
  budget: { tetto: number; speso: number; restante: number; mese: string; stop: boolean } | null;
  ai: boolean;
  maniEmail: boolean;
  maniLive: boolean;
};

/**
 * Stato del cuore in demo: batte (12 min fa), autopilota ON, 3 azioni sicure
 * eseguite, un pensiero del giorno di esempio. Spesa AI €0 (la demo non usa l'AbI).
 */
export function cuoreDemo(): CuoreDemo {
  const mese = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit" })
    .format(new Date())
    .slice(0, 7);
  return {
    collegato: true,
    demo: true,
    ultimoBattito: new Date(Date.now() - 12 * 60000).toISOString(),
    eseguiteUltimo: 3,
    autopilota: true,
    pensiero:
      "🧪 (esempio) Oggi 12 ordini, +4 clienti nuovi. 7 carrelli fermi: il playbook recupero-carrelli ne ha ripresi 1. Mossa a maggior ritorno: spingere i 2 negozi entrati questa settimana con un post dedicato. Tutto pronto, in attesa di firma dove serve.",
    budget: { tetto: 50, speso: 0, restante: 50, mese, stop: false },
    ai: false,
    maniEmail: false,
    maniLive: false,
  };
}
