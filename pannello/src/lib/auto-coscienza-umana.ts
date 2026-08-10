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

type BenchmarkEsempio = { cosa?: string; link?: string };
type BenchmarkMigliore = { chi?: string; livello?: string; cosa_fa?: string; esempi?: BenchmarkEsempio[] };
export type BenchmarkContesto = {
  obiettivo?: string;
  nostro?: string;
  cosa_ci_manca?: string;
  livello_attuale_L?: number;
  divario?: string;
  progresso?: { data?: string; punteggio?: number; fonte?: string; nota?: string }[];
  migliori?: BenchmarkMigliore[];
};

/** Quadro completo per ParlaCasella: tutto ciò che la scheda mostra, in italiano semplice. */
export function contestoBenchmark(b: BenchmarkContesto): string {
  const ultimo = b.progresso?.length ? b.progresso[b.progresso.length - 1] : undefined;
  const righe: string[] = [];

  if (b.livello_attuale_L != null) righe.push(`Livello attuale: L${b.livello_attuale_L}`);
  if (b.divario) righe.push(`Divario vs i migliori: ${divarioLeggibile(b.divario)}`);
  if (b.obiettivo) righe.push(`Obiettivo: ${b.obiettivo}`);
  if (b.nostro) righe.push(`Dove siamo noi: ${b.nostro}`);
  if (b.cosa_ci_manca) righe.push(`Cosa ci manca: ${b.cosa_ci_manca}`);
  if (ultimo?.punteggio != null) {
    const quando = ultimo.data ? ` (${ultimo.data})` : "";
    righe.push(`Ultimo punteggio: ${ultimo.punteggio}/100${quando}`);
  }
  if (ultimo?.nota) righe.push(ultimo.nota);

  if (b.migliori?.length) {
    const chi = b.migliori.map((m) => {
      const nome = [m.chi, m.livello && `(${m.livello})`].filter(Boolean).join(" ");
      const esempi = m.esempi?.map((e) => e.cosa).filter(Boolean).join("; ");
      const parti = [nome, m.cosa_fa, esempi && `es. ${esempi}`].filter(Boolean);
      return parti.join(" — ");
    });
    if (chi.length) righe.push(`Chi fa meglio: ${chi.join(" · ")}`);
  }

  return righe.join(" · ");
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
  // Il sito dei negozi (10/8). Il giro scrive una FRASE — «cieco da 28 giri (HTTP 503 dal 30/7…)» —
  // e in un tile largo due dita una frase esce dal riquadro: è il difetto «scritte che escono» già
  // pagato qui. Quindi il tile porta l'esito in tre parole e la frase intera resta nel file.
  // ⚪ non misurato NON è verde: il tile resta acceso di rosso, ma il testo dice che non l'ho visto,
  // non che è rotto — sono due cose diverse e Nicola le deve poter distinguere.
  if (key.includes("sito")) {
    const s = String(v ?? "").trim().toLowerCase();
    if (!s) return { label: "—", ok: false };
    if (s.startsWith("ok")) return { label: "risponde", ok: true };
    if (s.includes("cieco") || s.includes("non misurat")) return { label: "⚪ non misurato", ok: false };
    return { label: "non risponde", ok: false };
  }
  return { label: String(v ?? "—"), ok: !!v };
}
