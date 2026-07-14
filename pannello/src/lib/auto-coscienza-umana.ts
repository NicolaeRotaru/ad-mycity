// Linguaggio umano per Auto-coscienza: tutto il quadro, niente tagliato.
import { quadroTesto, traduciTestoCompleto, impattoCrescitaLeggibile } from "@/lib/radiografia-umana";
import { nomeReparto } from "@/lib/spiega-azione";

export { quadroTesto, traduciTestoCompleto };

const STATO_ENTITA: Record<string, string> = {
  scelta_ragionata: "scelta motivata con prove",
  da_verificare: "da confermare con te",
  confermata: "confermata nei dati",
};

const STATO_LEZIONE: Record<string, string> = {
  principio: "diventata regola fissa",
  decaduta: "non più valida",
  attiva: "attiva",
  candidata: "in prova",
};

const AUTONOMIA: Record<string, string> = {
  alta: "può agire da solo su molte cose",
  media: "propone e aspetta il tuo ok",
  bassa: "solo bozze, niente sul mondo reale",
};

const DIVARIO: Record<string, string> = {
  alto: "siamo molto indietro",
  medio: "c’è margine di miglioramento",
  basso: "siamo vicini al meglio",
};

export function statoEntita(stato?: string): string {
  if (!stato) return "";
  return STATO_ENTITA[stato] || traduciTestoCompleto(stato.replace(/_/g, " "));
}

export function statoLezione(stato?: string): string {
  if (!stato) return "";
  return STATO_LEZIONE[stato] || stato;
}

export function autonomiaLeggibile(v?: string): string {
  if (!v) return "";
  return AUTONOMIA[v.toLowerCase()] || traduciTestoCompleto(v);
}

export function divarioLeggibile(v?: string): string {
  if (!v) return "";
  return DIVARIO[v.toLowerCase()] || impattoCrescitaLeggibile(v);
}

export function repartoLeggibile(slug?: string): string {
  if (!slug) return "";
  return nomeReparto(slug) || traduciTestoCompleto(slug.replace(/-/g, " "));
}

export function saluteValore(k: string, v: unknown): { label: string; ok: boolean } {
  const key = k.toLowerCase();
  if (key.includes("supabase") || key.includes("stripe")) {
    const s = String(v ?? "");
    return { label: s === "ok" ? "ok" : traduciTestoCompleto(s) || "problema", ok: s === "ok" };
  }
  if (key.includes("dati") || key.includes("freschi")) {
    const ok = !!v;
    return { label: ok ? "sì, aggiornati" : "no, datati", ok };
  }
  if (key.includes("sensori")) {
    const n = Number(v) || 0;
    return { label: `${n} attivi`, ok: n > 0 };
  }
  return { label: String(v ?? "—"), ok: !!v };
}
