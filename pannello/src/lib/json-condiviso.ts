// Una sola lettura per più richiedenti nello STESSO momento (perf home, 25/11/2026).
//
// Sulla home due riquadri (la lettera dell'AD e la scheda della macchina) chiedono insieme
// /api/memoria/auto-radiografia: 1,3 MB di JSON, scaricati e letti DUE volte a ogni apertura.
// Qui la seconda richiesta, se la prima è ancora in volo, riceve la stessa risposta invece di
// partirne un'altra. Appena la risposta arriva la richiesta esce dalla mappa: la lettura dopo
// riparte dal server, quindi nessun dato vecchio viene servito da qui.
//
// Stesso comportamento di `fetch(url, { cache: "no-store" }).then((r) => r.json())`: non guarda
// `r.ok` (come i due chiamanti di prima) e, se fallisce, fallisce per tutti quelli in attesa.
// Chi riceve il risultato lo legge e basta: è lo stesso oggetto per tutti, non va modificato.
const inVolo = new Map<string, Promise<unknown>>();

export function jsonCondiviso<T = any>(url: string): Promise<T> {
  const gia = inVolo.get(url);
  if (gia) return gia as Promise<T>;
  const p = fetch(url, { cache: "no-store" })
    .then((r) => r.json())
    .finally(() => inVolo.delete(url));
  inVolo.set(url, p);
  return p as Promise<T>;
}
