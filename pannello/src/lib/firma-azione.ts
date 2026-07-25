import { setImpostazione } from "@/lib/store";

// AR-110 — IL CONTRATTO DI FIRMA fra le due metà della macchina.
//
// Il Pannello (dove Nicola clicca) e il cervello (che esegue) non condividevano nessuna nozione
// verificabile di "firmata". La firma finiva in Supabase come `azione:<id>` = stato, ma quello
// stato lo scrive anche l'autopilota quando decide da solo sulle 🟢: l'esecutore CLI non poteva
// distinguere «l'ha voluto Nicola» da «l'ha deciso la macchina», quindi non si fidava di nessuno
// dei due e ogni invio firmato degradava a DRY-RUN. Il percorso firma→esecuzione non chiudeva.
//
// Il contratto, in una riga: chi ha deciso è un dato scritto, non un sottinteso.
//   chiave  `azione:<id stabile>:firma`
//   valore  "nicola AAAA-MM-GG HH:MM"  → clic umano di Nicola: APRE il cancello lato cervello
//           "auto AAAA-MM-GG HH:MM"    → decisione dell'autopilota: traccia, NON consenso
//           ""                          → nessuna decisione (rifiuto/annullamento la riazzera)
// Chi legge: cervello/consenso-azione.mjs::firmaPannello, che accetta solo "nicola".
// L'id è quello STABILE derivato dal contenuto (idSezione in lib/azioni-attesa.ts), lo stesso che
// consenso-azione.mjs ricalcola dalla coda: così le due metà parlano della stessa casella.

/** Timestamp della firma nel formato del vault: "AAAA-MM-GG HH:MM", fuso di Piacenza. */
export function oraFirma(d: Date = new Date()): string {
  const parti = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const p = (t: string) => parti.find((x) => x.type === t)?.value || "";
  // en-CA con hour12:false può rendere la mezzanotte come "24": riportala a "00".
  const ora = p("hour") === "24" ? "00" : p("hour");
  return `${p("year")}-${p("month")}-${p("day")} ${ora}:${p("minute")}`;
}

/** Chi ha deciso: Nicola di persona, o l'autopilota per conto suo. */
export type Firmatario = "nicola" | "auto";

/**
 * Registra CHI ha deciso un'azione. Da chiamare su ogni decisione che avvia un'azione.
 * Ritorna false se la memoria non è collegata (il chiamante decide se è bloccante).
 */
export async function registraFirma(id: string, chi: Firmatario, quando: Date = new Date()): Promise<boolean> {
  return setImpostazione(`azione:${id}:firma`, `${chi} ${oraFirma(quando)}`);
}

/**
 * Cancella la firma: l'azione torna non decisa (rifiuto o annullamento).
 * Senza questo, un'azione rifiutata dopo essere stata approvata resterebbe "firmata" per sempre
 * e potrebbe autorizzare un invio reale dalla CLI.
 */
export async function revocaFirma(id: string): Promise<boolean> {
  return setImpostazione(`azione:${id}:firma`, "");
}
