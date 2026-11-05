// 🔌 Le caselle della scheda «Mercato» che leggono la MEMORIA (vault, consegne, registri) invece
// del database del sito.
//
// Perché esiste (Nicola, 2026-11-05 06:21, «Vedi che ci sono questi da collegare, come si fa?»):
// sei caselle dicevano «da collegare» anche dove il dato c'era già. Il radar dei concorrenti, per
// esempio, si leggeva nella scheda Intelligence, mentre la casella in Mercato restava spenta.
// La scritta era fissa nel catalogo (`stato: "placeholder"`), non guardava i dati.
//
// Qui sta TUTTA la logica, in funzioni pure: ogni lettore riceve l'ESITO della lettura (letto o no,
// e perché) e restituisce la risposta della casella. La rotta /api/moduli/lista fa solo I/O.
// Così il test prova anche le scelte che prima vivevano nella rotta — «quando dire nessuno»,
// «cosa fare se una fonte su tre non si legge» — e non solo i parser.
//
// La regola che il collaudo del 2026-11-05 ha fatto valere (13 difetti, verdetto «bocciato»):
// **una fonte non letta non è una fonte vuota.** La frase «nessun …» si scrive solo per ciò che
// è stato letto davvero; il resto si nomina come «non letto», col motivo.
//
// Estensione `.ts` esplicita: questo file lo esegue anche Node nei test (stessa regola di
// freschezza-intelligence.ts).

import type { RigaLista } from "./moduli.ts";
import type { LetturaJson } from "./esito-lettura.ts";
import { eAperto, problemiDelReferto, severitaDi } from "./radiografia-marketplace-conti.ts";

/** Le caselle collegate qui. Unica casa: il catalogo (moduli.ts) e la rotta la leggono entrambi. */
export const TIPI_MODULI = [
  "concorrenti", "rassegna", "sicurezza", "legale", "esperimenti", "roadmap",
  // 2026-11-05, «Fai le due cose»: le sei caselle delle schede «Negozi & clienti» e «Operazioni».
  "rider", "contatti", "lead", "catalogo", "campagne", "calendario",
] as const;
export type TipoModulo = (typeof TIPI_MODULI)[number];

export function eTipoModulo(t: string): t is TipoModulo {
  return (TIPI_MODULI as readonly string[]).includes(t);
}

/** Le dimensioni della radiografia del sito che ogni casella conta come «sue». */
export const DIMENSIONI_SICUREZZA = ["sicurezza-auth", "rls-database"];
export const DIMENSIONI_LEGALE = ["privacy-legale"];

export const MAX_DETTAGLIO = 180;

/** Una fonte della casella: di quando è il dato, e se è stata letta davvero. */
export type Fonte = { nome: string; data: string | null; giorni: number | null; letta: boolean; motivo?: string | null };

/** La risposta della rotta. `conta` = quante COSE ci sono (58 difetti), non quante righe (8). */
export type RispostaModulo = { collegato: boolean; righe: RigaLista[]; fonti: Fonte[]; conta?: number; almeno?: number; nota?: string };

/**
 * Giorni di CALENDARIO da `a` a `b` (aaaa-mm-gg), con segno: niente ore, niente fuso, quindi niente
 * cambio d'ora. Il collaudo del 5/11 l'ha visto due volte: misurando da mezzogiorno a mezzogiorno
 * con l'ora locale e arrotondando, un intervallo che scavalca il 25/10 o il 28/3 sbagliava di uno.
 */
export function giorniTra(a: string | null, b: string | null): number | null {
  const x = String(a ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  const y = String(b ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!x || !y) return null;
  const ux = Date.UTC(+x[1], +x[2] - 1, +x[3]);
  const uy = Date.UTC(+y[1], +y[2] - 1, +y[3]);
  // Una data impossibile («2026-13-01», «2026-11-31») non diventa in silenzio un'altra: null.
  const vera = (u: number, m: RegExpMatchArray) => new Date(u).toISOString().slice(0, 10) === m[0];
  if (!vera(ux, x) || !vera(uy, y)) return null;
  return Math.round((uy - ux) / 86_400_000);
}

/**
 * Nessuna riga e una fonte non letta = «non so», non «zero». Si segna la risposta come non
 * collegata, così il numero accanto al titolo è «—» (etichettaBadge) e la casella mostra la nota.
 * Nato il 2026-11-05: «Campagne» diceva «0» col registro vuoto e i messaggi del sito non letti.
 */
export function senzaZeroFalso(r: RispostaModulo): RispostaModulo {
  return !r.righe.length && r.conta == null && r.fonti.some((f) => !f.letta) ? { ...r, collegato: false } : r;
}

// ───────────────────────────── testo ─────────────────────────────

/** I file salvati da Windows hanno «\r\n»: senza questa riga, zero voci e nessuna data. */
export function righeDi(md: string | null | undefined): string[] {
  return String(md ?? "").replace(/\r\n?/g, "\n").split("\n");
}

/** Toglie il markdown che a schermo diventa rumore: link (resta il testo), grassetti, codice. */
export function testoSemplice(s: unknown): string {
  return String(s ?? "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*|__|`/g, "")
    .replace(/\\\|/g, "|")
    .replace(/\s+/g, " ")
    .trim();
}

/** Accorcia a `max` caratteri tagliando su uno spazio, con i puntini. */
export function accorcia(s: unknown, max = MAX_DETTAGLIO): string {
  const t = testoSemplice(s);
  if (t.length <= max) return t;
  const taglio = t.slice(0, max);
  const spazio = taglio.lastIndexOf(" ");
  return (spazio > max * 0.6 ? taglio.slice(0, spazio) : taglio).replace(/[\s,;:.·—-]+$/, "") + "…";
}

/** «2026-10-10» → «10/10/2026». Una data che non è in quella forma torna com'è. */
export function dataBreveIt(iso: string | null | undefined): string {
  const m = String(iso ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(iso ?? "");
}

/** La parte aaaa-mm-gg di una data del vault («2026-11-01 20:05» → «2026-11-01»). */
export function giorno(s: unknown): string | null {
  return String(s ?? "").match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? null;
}

/** Il valore di una chiave nel frontmatter `---` in cima a un markdown. */
export function frontmatter(md: string | null, chiave: string): string | null {
  const righe = righeDi(md);
  if (righe[0]?.trim() !== "---") return null;
  for (let i = 1; i < righe.length && righe[i].trim() !== "---"; i++) {
    if (righe[i].startsWith(`${chiave}:`)) return righe[i].slice(chiave.length + 1).trim() || null;
  }
  return null;
}

export function fonte(nome: string, data: string | null, oggi: string, letta = true, motivo: string | null = null): Fonte {
  // Una data nel futuro non è «fresca»: è una data sbagliata. Giorni null = data che non so leggere.
  const g = data ? giorniTra(data, oggi) : null;
  return { nome, data, giorni: g != null && g >= 0 ? g : null, letta, motivo };
}

// ───────────────────────────── 🔎 concorrenti ─────────────────────────────

/** Le celle di una riga di tabella markdown; un «\|» dentro il testo non taglia la cella. */
export function celle(riga: string): string[] {
  return riga.trim().replace(/^\|/, "").replace(/\|$/, "").split(/(?<!\\)\|/).map((c) => c.trim());
}

/** Un paragrafo-novità: «**① …**» oppure «**1. …**» in grassetto all'inizio della riga. */
const NOVITA = /^\*\*\s*(?:[\u2460-\u2473]|\d{1,2}[.)])\s*(.+?)\*\*\s*(.*)$/;
/** La stessa novità scritta come titolo: «### ① …» (il collaudo del 5/11 l'ha vista sparire senza avviso). */
const NOVITA_TITOLO = /^#{3,4}\s*(?:[\u2460-\u2473]|\d{1,2}[.)])\s*(.+?)()$/;

/**
 * Le NOVITÀ del radar: i paragrafi «**① …**» (o «**1. …**») della prima sezione «## … Novità …».
 * Sono le cose che contano (Glovo, Treatwell, Everli, CompraPiacenza il 10/10): in giallo, in cima.
 * Il paragrafo che comincia con «Nessuna novità» è il titolo della tabella sotto, non una novità.
 * Dice anche se la sezione c'è e se c'era testo che non ho saputo leggere: il formato del radar è
 * cambiato a ogni edizione, e «nessuna novità letta» non è «nessuna novità».
 */
export function leggiNovita(md: string | null): { righe: RigaLista[]; sezione: boolean; illeggibile: boolean } {
  const righe = righeDi(md);
  const i = righe.findIndex((r) => /^##\s/.test(r) && /novit/i.test(r));
  if (i < 0) return { righe: [], sezione: false, illeggibile: false };
  const out: RigaLista[] = [];
  let altroTesto = 0;
  let tabellaControlli = false; // dentro la tabella «Concorrente | Esito»: quella la legge righeTabellaConcorrenti
  for (let j = i + 1; j < righe.length && !/^##\s/.test(righe[j]); j++) {
    const m = righe[j].match(NOVITA) ?? righe[j].match(NOVITA_TITOLO);
    if (!m) {
      const t = righe[j].trim();
      if (!t) tabellaControlli = false;
      else if (t.startsWith("|")) {
        if (/^\|\s*(Concorrente|Competitor)\s*\|/i.test(t)) tabellaControlli = true;
        // Una tabella che NON è quella dei controlli può essere un elenco di novità: è testo da leggere.
        if (!tabellaControlli) altroTesto++;
      } else if (!t.startsWith("#")) altroTesto++;
      continue;
    }
    const titolo = testoSemplice(m[1]).replace(/[.:;,]$/, "");
    if (!titolo || /^nessuna novit/i.test(titolo)) continue;
    // Il dettaglio è il resto della riga; se è vuoto, la prima riga sotto (spesso un elenco).
    let resto = m[2];
    for (let k = j + 1; !resto.trim() && k < righe.length && !/^##/.test(righe[k]) && !NOVITA.test(righe[k]) && !NOVITA_TITOLO.test(righe[k]); k++) {
      resto = righe[k].replace(/^\s*-\s+/, "");
    }
    out.push({ titolo: accorcia(titolo, 140), dettaglio: resto.trim() ? accorcia(resto) : undefined, colore: "giallo", meta: "novità" });
  }
  return { righe: out, sezione: true, illeggibile: out.length === 0 && altroTesto > 0 };
}

export function novitaRadar(md: string | null): RigaLista[] {
  return leggiNovita(md).righe;
}

/**
 * Le righe della PRIMA tabella che ha «Concorrente» come prima colonna (i controlli «nessuna
 * novità»). In giallo solo un esito che non comincia con «Nessun…».
 */
export function righeTabellaConcorrenti(md: string | null): RigaLista[] {
  const righe = righeDi(md);
  const inizio = righe.findIndex((r) => /^\|\s*(Concorrente|Competitor)\s*\|/i.test(r.trim()));
  if (inizio < 0) return [];
  const out: RigaLista[] = [];
  for (let i = inizio + 1; i < righe.length; i++) {
    const r = righe[i].trim();
    if (!r.startsWith("|")) break;
    if (/^\|[\s:|-]+$/.test(r)) continue; // il separatore |---|---|
    const c = celle(r);
    const nome = testoSemplice(c[0]);
    if (!nome) continue;
    const esito = testoSemplice(c[1]);
    const novita = esito !== "" && !/^nessun/i.test(esito);
    out.push({ titolo: nome, dettaglio: esito ? accorcia(esito) : undefined, colore: novita ? "giallo" : undefined });
  }
  return out;
}

/** Prima le novità, poi la tabella dei controlli senza novità. */
export function righeConcorrenti(md: string | null): RigaLista[] {
  return [...novitaRadar(md), ...righeTabellaConcorrenti(md)];
}

/** Il radar si legge come testo intero: `null` = il file non c'è (o non si legge). */
export function rispostaConcorrenti(md: string | null, data: string | null, oggi: string): RispostaModulo {
  if (md == null) {
    return { collegato: false, righe: [], fonti: [], nota: "Il radar dei concorrenti non si legge: lo scrive l'intelligence dalla scheda Intelligence." };
  }
  const nov = leggiNovita(md);
  const righe = [...nov.righe, ...righeTabellaConcorrenti(md)];
  let nota: string | undefined;
  if (!righe.length) nota = "Il radar c'è, ma non ha né novità numerate né la tabella dei concorrenti: il testo intero è nella scheda Intelligence.";
  else if (!nov.sezione) nota = "Nel radar non trovo la sezione delle novità: qui sotto ci sono solo i controlli. Il testo intero è nella scheda Intelligence.";
  // Frase vera in tutti e due i casi: novità scritte in un'altra forma, o settimana senza novità
  // raccontata in prosa. «Non riesco a leggere» era un falso allarme nel secondo caso.
  else if (nov.illeggibile) nota = "Nella sezione delle novità non trovo un elenco numerato: se ci sono novità, sono nel testo intero (scheda Intelligence). Qui sotto ci sono i controlli.";
  // Il numero accanto al titolo conta le NOVITÀ: «13» leggeva come tredici novità, erano quattro.
  // Se le novità non le ho trovate o non le so leggere, nessun numero: «0» direbbe «zero novità».
  const conta = nov.sezione && !nov.illeggibile ? nov.righe.length : undefined;
  return { collegato: true, righe, fonti: [fonte("radar concorrenti", data, oggi)], conta, nota };
}

// ───────────────────────────── 📄 documenti ─────────────────────────────

export type Documento = { percorso: string; testo: string | null };

/** «2026-11-01-domande-commercialista.md» → «domande commercialista». */
function nomeUmano(file: string): string {
  return file.replace(/\.md$/i, "").replace(/^\d{4}-\d{2}-\d{2}-?/, "").replace(/[-_]+/g, " ").trim();
}

/**
 * Una riga per documento: il titolo è il primo «# » del file. Sotto: lo stato scritto in cima
 * (es. «BOZZA — da far validare da un legale») e il nome del file in parole, perché due contratti
 * hanno lo stesso titolo. La data è quella del nome; se il nome non ce l'ha, quella in cima.
 */
export function righeDocumenti(docs: Documento[]): RigaLista[] {
  return docs
    .map((d) => {
      const file = d.percorso.split("/").pop() || d.percorso;
      if (d.testo == null) {
        const r: RigaLista = { titolo: nomeUmano(file), dettaglio: "Non sono riuscita ad aprirlo.", meta: "non letto", colore: "giallo" };
        return { data: "", riga: r };
      }
      const h1 = righeDi(d.testo).find((r) => /^#\s+/.test(r));
      const nome = nomeUmano(file);
      const titolo = h1 ? testoSemplice(h1.replace(/^#\s+/, "")) : nome;
      const data = file.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? giorno(frontmatter(d.testo, "data")) ?? "";
      const stato = frontmatter(d.testo, "stato");
      const dettaglio = [stato ? testoSemplice(stato) : "", h1 && nome ? `documento: ${nome}` : ""].filter(Boolean).join(" · ");
      const riga: RigaLista = { titolo, dettaglio: dettaglio ? accorcia(dettaglio) : undefined, meta: data ? dataBreveIt(data) : "senza data" };
      return { data, riga };
    })
    .sort((a, b) => b.data.localeCompare(a.data))
    .map((x) => x.riga);
}

// ───────────────────────────── ⚠️ registro rischi ─────────────────────────────

export type Rischio = {
  id?: string;
  rischio?: string;
  categoria?: string;
  gravita?: string;
  stato_mitigazione?: string;
  ultima_revisione?: string;
};

function pesoGravita(g: string): number {
  if (/critic/.test(g)) return 0;
  if (g.includes("alta") && !g.includes("media")) return 0;
  if (g.includes("media")) return 1;
  return 2;
}

/** I rischi di una categoria non chiusi, i più gravi in cima: alta/critica in rosso, media in giallo. */
export function righeRischi(rischi: Rischio[] | null | undefined, categoria: string): RigaLista[] {
  return (Array.isArray(rischi) ? rischi : [])
    .filter((r) => String(r?.categoria ?? "").trim().toLowerCase() === categoria)
    .filter((r) => !/^(chius|mitigat)/i.test(String(r?.stato_mitigazione ?? "")))
    .map((r) => {
      const g = String(r.gravita ?? "").trim().toLowerCase();
      const stato = String(r.stato_mitigazione ?? "").trim().replace(/-/g, " ");
      const rev = r.ultima_revisione ? `rivisto il ${dataBreveIt(r.ultima_revisione)}` : "";
      const peso = pesoGravita(g);
      return {
        peso,
        riga: {
          titolo: testoSemplice(r.rischio) || String(r.id ?? "rischio"),
          dettaglio: [g ? `rischio ${g}` : "", stato, rev].filter(Boolean).join(" · ") || undefined,
          meta: "rischio",
          colore: peso === 0 ? "rosso" : peso === 1 ? "giallo" : undefined,
        } as RigaLista,
      };
    })
    .sort((a, b) => a.peso - b.peso)
    .map((x) => x.riga);
}

// ───────────────────────────── 🩻 difetti del sito ─────────────────────────────

export type ProblemaSito = { dimensione?: unknown; severita?: unknown; stato?: unknown; titolo?: unknown };
export type ContiDifetti = { bloccante: number; grave: number; minore: number; altre: number };

/**
 * I difetti APERTI del sito nelle dimensioni date. Bloccanti e gravi uno per uno, in rosso e in
 * giallo; i minori in una riga sola col loro numero, perché cinquanta righe di minori
 * seppellirebbero i sei che contano. Una gravità sconosciuta NON diventa «minore»: ha la sua riga.
 */
export function righeDifettiSito(
  problemi: ProblemaSito[] | null | undefined,
  dimensioni: string[],
  cosa: string,
): { serie: RigaLista[]; resto: RigaLista[]; conti: ContiDifetti } {
  const conti: ContiDifetti = { bloccante: 0, grave: 0, minore: 0, altre: 0 };
  const seri: { sev: string; p: ProblemaSito }[] = [];
  for (const p of Array.isArray(problemi) ? problemi : []) {
    if (!dimensioni.includes(String(p?.dimensione ?? "").trim())) continue;
    if (!eAperto(p as any)) continue;
    const sev = severitaDi(p as any);
    if (sev === "bloccante" || sev === "grave") {
      conti[sev]++;
      seri.push({ sev, p });
    } else if (sev === "minore") conti.minore++;
    else conti.altre++;
  }
  seri.sort((a, b) => (a.sev === b.sev ? 0 : a.sev === "bloccante" ? -1 : 1));
  const serie: RigaLista[] = seri.map(({ sev, p }) => ({
    titolo: accorcia(p.titolo, 160) || "difetto senza titolo",
    meta: sev,
    colore: sev === "bloccante" ? "rosso" : "giallo",
  }));
  const dove = "Sono nella radiografia del sito, scheda «Salute sito».";
  const resto: RigaLista[] = [];
  if (conti.minore) resto.push({ titolo: `Altri ${conti.minore} difetti minori aperti: ${cosa}`, dettaglio: dove, meta: "minori" });
  if (conti.altre) resto.push({ titolo: `${conti.altre} difetti aperti senza gravità nota: ${cosa}`, dettaglio: dove, meta: "da pesare", colore: "giallo" });
  return { serie, resto, conti };
}

/**
 * I difetti del sito di una casella, passando dal testimone contro lo «zero falso» che il Pannello
 * ha già (`problemiDelReferto`): un referto nella forma vecchia si legge lo stesso; uno incompleto
 * o illeggibile NON diventa «nessun difetto», diventa «non letto», col motivo.
 */
export function difettiDaRadiografia(
  l: LetturaJson<any>,
  dimensioni: string[],
  cosa: string,
  oggi: string,
): { ok: true; serie: RigaLista[]; resto: RigaLista[]; totale: number; fonte: Fonte } | { ok: false; fonte: Fonte } {
  const nome = "difetti del sito";
  if (!l.dati) return { ok: false, fonte: fonte(nome, null, oggi, false, l.motivo ?? "la radiografia del sito non c'è") };
  const data = giorno(l.dati?.sync_scan?.aggiornato) ?? giorno(l.dati?.data);
  const e = problemiDelReferto(l.dati);
  if (e.problemi == null) return { ok: false, fonte: fonte(nome, data, oggi, false, e.motivo ?? "la radiografia del sito non si sa contare") };
  const d = righeDifettiSito(e.problemi as ProblemaSito[], dimensioni, cosa);
  const totale = d.conti.bloccante + d.conti.grave + d.conti.minore + d.conti.altre;
  return { ok: true, serie: d.serie, resto: d.resto, totale, fonte: fonte(nome, data, oggi) };
}

// ───────────────────────────── 🛡️ controllo di sicurezza di Supabase ─────────────────────────────

/**
 * Il controllo di sicurezza di Supabase («advisors»), come la macchina lo salva in memoria
 * (`90-Memoria-AI/sicurezza-supabase.json`, scritto da `cervello/sicurezza-supabase.mjs`).
 * Nato il 2026-11-05: Nicola pensava servisse una chiave di gestione nuova; non serve, perché la
 * sessione dell'AD lo legge già e lo salva con la sua data.
 */
export type AvvisoSupabase = { nome?: string; titolo?: string; livello?: string; quanti?: number; esempi?: string[]; link?: string };

/** I nomi dei controlli di Supabase, detti in italiano. Un nome sconosciuto tiene il titolo inglese. */
export const AVVISI_SUPABASE_IT: Record<string, string> = {
  security_definer_view: "Viste che girano coi permessi di chi le ha create, non di chi le legge",
  anon_security_definer_function_executable: "Funzioni con permessi speciali che può chiamare anche chi non ha fatto l'accesso",
  authenticated_security_definer_function_executable: "Funzioni con permessi speciali che può chiamare qualunque utente con accesso",
  extension_in_public: "Un'estensione installata nello spazio pubblico del database",
  rls_enabled_no_policy: "Tabelle protette senza nessuna regola d'accesso: le legge solo il server",
  rls_disabled_in_public: "Tabelle pubbliche senza protezione delle righe",
  function_search_path_mutable: "Funzioni senza un percorso di ricerca fisso",
  auth_leaked_password_protection: "Controllo delle password rubate spento",
  policy_exists_rls_disabled: "Regole d'accesso scritte ma protezione spenta",
};

const PESO_LIVELLO: Record<string, number> = { ERROR: 0, WARN: 1, INFO: 2 };
const LIVELLO_IT: Record<string, string> = { ERROR: "errore", WARN: "avviso", INFO: "informazione" };

/** Una riga per tipo di avviso: errori in rosso, avvisi in giallo, informazioni senza colore. */
export function righeAvvisiSupabase(avvisi: AvvisoSupabase[]): RigaLista[] {
  return avvisi
    .filter((a) => a && (a.nome || a.titolo))
    .map((a) => {
      const liv = String(a.livello ?? "").toUpperCase();
      const n = Number(a.quanti) || 0;
      const nome = AVVISI_SUPABASE_IT[String(a.nome ?? "")] ?? testoSemplice(a.titolo ?? a.nome);
      const esempi = Array.isArray(a.esempi) ? a.esempi.filter(Boolean).slice(0, 4) : [];
      return {
        peso: PESO_LIVELLO[liv] ?? 3,
        riga: {
          titolo: `${nome} (${Math.max(1, n)})`,
          dettaglio: esempi.length ? accorcia(`per esempio: ${esempi.join(", ")}${n > esempi.length ? "…" : ""}`) : undefined,
          meta: LIVELLO_IT[liv] ?? (liv.toLowerCase() || "da pesare"),
          colore: liv === "ERROR" ? "rosso" : liv === "WARN" ? "giallo" : undefined,
          link: typeof a.link === "string" && /^https:\/\//.test(a.link) ? a.link : undefined,
        } as RigaLista,
        n,
      };
    })
    .sort((x, y) => x.peso - y.peso)
    .map((x) => x.riga);
}

/**
 * Il controllo di Supabase salvato: «non letto» se il file manca, è illeggibile o non ha la lista
 * `avvisi` — mai «nessun avviso». Il totale è la somma dei `quanti`.
 */
/** Oltre quanti giorni il controllo di Supabase salvato è vecchio: resta visibile ma non entra nel numero. */
export const SUPABASE_VECCHIO_GIORNI = 7;

export function avvisiDaSupabase(
  l: LetturaJson<any>,
  oggi: string,
): { ok: true; righe: RigaLista[]; totale: number; distinti: boolean; fonte: Fonte } | { ok: false; fonte: Fonte } {
  const nome = "controllo di Supabase sul database del sito";
  if (!l.dati) return { ok: false, fonte: fonte(nome, null, oggi, false, l.motivo ?? "non ancora salvato in memoria") };
  const data = giorno(l.dati.aggiornato);
  if (!Array.isArray(l.dati.avvisi)) return { ok: false, fonte: fonte(nome, data, oggi, false, "il file non ha la lista «avvisi»: non so leggerlo") };
  const avvisi = l.dati.avvisi as AvvisoSupabase[];
  // Nel totale gli ERRORI e gli AVVISI, non le «informazioni»: le 12 tabelle chiuse a tutti tranne il
  // server sono lo stato voluto (collaudo del 5/11). Un avviso elencato vale almeno 1, mai 0.
  const somma = avvisi
    .filter((a) => a && String(a.livello ?? "").toUpperCase() !== "INFO")
    .reduce((t, a) => t + Math.max(1, Number(a?.quanti) || 0), 0);
  // Gli oggetti DIVERSI, se lo script li ha potuti contare: la stessa funzione sta in due controlli
  // (chiamabile da chi non ha l'accesso E da chi ce l'ha). Il collaudo del 5/11: 62 erano 47.
  const d = l.dati.oggetti_distinti;
  const distinti = typeof d === "number" && Number.isFinite(d) && d >= 0;
  return { ok: true, righe: righeAvvisiSupabase(avvisi), totale: distinti ? d : somma, distinti, fonte: fonte(nome, data, oggi) };
}

/**
 * Sicurezza: i difetti del sito (radiografia) più, se c'è, il controllo di Supabase. Con una fonte
 * su due non letta la casella lo dice e non dà il totale: i soli difetti non sono «tutto».
 */
export function rispostaSicurezza(rad: LetturaJson<any>, oggi: string, supa?: LetturaJson<any>): RispostaModulo {
  const d = difettiDaRadiografia(rad, DIMENSIONI_SICUREZZA, "accessi e permessi", oggi);
  const s = supa ? avvisiDaSupabase(supa, oggi) : null;
  const fonti = [d.fonte, ...(s ? [s.fonte] : [])];
  if (!d.ok && (!s || !s.ok)) {
    return { collegato: false, righe: [], fonti, nota: `Non ho letto i difetti del sito: ${d.fonte.motivo}. Non vuol dire che non ce ne siano.` };
  }
  const righe = [...(d.ok ? d.serie : []), ...(s?.ok ? s.righe : []), ...(d.ok ? d.resto : [])];
  const nonLette = fonti.filter((f) => !f.letta);
  const tutteLette = nonLette.length === 0;
  // Un controllo di Supabase vecchio si vede, ma non entra nel numero (come gli eventi del calendario).
  const supaVecchio = Boolean(s?.ok && (s.fonte.giorni == null || s.fonte.giorni > SUPABASE_VECCHIO_GIORNI));
  const totSupa = s?.ok && !supaVecchio ? s.totale : 0;
  const vuote: string[] = [];
  if (d.ok && d.totale === 0) vuote.push("nessun difetto aperto di accessi e permessi nella radiografia del sito");
  if (s?.ok && s.totale === 0) vuote.push("nessun errore o avviso nel controllo di Supabase");
  const pezzi = [
    nonLette.length ? `Non letti: ${nonLette.map((f) => f.nome).join(", ")}.` : "",
    vuote.length ? `${vuote.join("; ")}.`.replace(/^n/, "N") : "",
    supaVecchio ? `Il controllo di Supabase è ${s!.fonte.giorni == null ? "di una data che non so leggere" : `di ${s!.fonte.giorni} giorni fa`}: si vede ma non entra nel numero. Si rifà con «controlla la sicurezza di Supabase».` : "",
    // Il numero somma due misure diverse: lo si dice, così «120» non sembra un conto solo.
    tutteLette && d.ok && totSupa && s?.ok
      ? s.distinti
        ? `Il numero somma ${d.totale} difetti del sito e ${totSupa} oggetti con errori o avvisi di Supabase (la stessa funzione può stare in più righe); le informazioni restano fuori.`
        : `Il numero somma ${d.totale} difetti del sito e ${totSupa} fra errori e avvisi di Supabase, e lo stesso oggetto può essere contato più volte; le informazioni restano fuori.`
      : "",
  ].filter(Boolean);
  return senzaZeroFalso({
    collegato: true,
    righe,
    fonti,
    conta: tutteLette ? (d.ok ? d.totale : 0) + totSupa : undefined,
    nota: pezzi.length ? pezzi.join(" ") : undefined,
  });
}

/**
 * Legale mette insieme tre fonti. Ognuna dice da sé se è stata letta: se manca la radiografia,
 * la casella lo scrive, e «nessun …» vale solo per le fonti lette davvero.
 */
export function rispostaLegale(
  rad: LetturaJson<any>,
  docs: Documento[],
  reg: LetturaJson<any>,
  oggi: string,
): RispostaModulo {
  const d = difettiDaRadiografia(rad, DIMENSIONI_LEGALE, "privacy e testi legali", oggi);
  const chiusi = docs.filter((x) => x.testo == null).length;
  const fDocs = !docs.length
    ? fonte("documenti legali", null, oggi, false, "nessun file trovato in consegne/legale: cartella vuota o non leggibile")
    : chiusi === docs.length
      ? fonte("documenti legali", null, oggi, false, `nessuno dei ${docs.length} documenti si è aperto`)
      : fonte("documenti legali", null, oggi, true, chiusi ? `${chiusi} ${chiusi === 1 ? "documento" : "documenti"} su ${docs.length} non ${chiusi === 1 ? "si è aperto" : "si sono aperti"}` : null);
  const listaRischi = Array.isArray(reg.dati?.rischi);
  const fReg = !reg.dati
    ? fonte("registro rischi", null, oggi, false, reg.motivo ?? "il registro rischi non c'è")
    : !listaRischi
      ? fonte("registro rischi", giorno(reg.dati?.aggiornato), oggi, false, "il registro non ha la lista «rischi»: non so leggerlo")
      : fonte("registro rischi", giorno(reg.dati?.aggiornato), oggi);
  const fonti = [d.fonte, fDocs, fReg];

  const rischi = listaRischi ? righeRischi(reg.dati.rischi, "normativo") : [];
  const righe = [...(d.ok ? d.serie : []), ...righeDocumenti(docs), ...rischi, ...(d.ok ? d.resto : [])];
  const nonLette = fonti.filter((f) => !f.letta);
  if (nonLette.length === fonti.length) {
    return { collegato: false, righe: [], fonti, nota: "Non ho letto nessuna delle tre fonti: non so dire se ci sono problemi legali." };
  }
  const vuote: string[] = [];
  if (d.ok && d.totale === 0) vuote.push("nessun difetto legale aperto sul sito");
  if (fReg.letta && rischi.length === 0) vuote.push("nessun rischio normativo aperto");
  const pezzi = [
    nonLette.length ? `Non letti: ${nonLette.map((f) => f.nome).join(", ")}.` : "",
    vuote.length ? `Fra le fonti lette: ${vuote.join("; ")}.` : "",
  ].filter(Boolean);
  return senzaZeroFalso({
    collegato: true,
    righe,
    fonti,
    // I PROBLEMI: difetti del sito + rischi normativi. I documenti (contratti, domande al
    // commercialista) sono materiale, non problemi: «81» leggeva come 81 problemi legali.
    // Senza la radiografia i soli rischi non sono il totale: nessun numero, la nota dice cosa manca.
    // Solo con TUTTE le fonti lette: un registro non letto non è «zero rischi» (collaudo del 5/11).
    conta: nonLette.length === 0 && d.ok ? d.totale + rischi.length : undefined,
    nota: pezzi.length ? pezzi.join(" ") : undefined,
  });
}

// ───────────────────────────── 🗺️ lavoro aperto ─────────────────────────────

const VOCE = /^(?:[-*]|\d{1,2}[.)])\s+(.+)$/;
const SOTTO_VOCE = /^\s+(?:[-*]|\d{1,2}[.)])\s+(.+)$/;

/**
 * Le voci di primo livello («- …», «* …» o «1. …», senza rientro) fra la riga `i` e la prossima
 * intestazione di livello ≤ `livello`. Le sotto-voci restano INTERE, in `punti`: dentro il
 * dettaglio venivano tagliate, e la prima a sparire era «Restano tue: …», cioè il lavoro di Nicola.
 * `testo` dice se fra le righe c'era altro testo: voci zero con testo = «non so leggerla».
 */
function vociFra(righe: string[], i: number, livello: number): { voci: RigaLista[]; testo: boolean } {
  const stop = new RegExp(`^#{1,${livello}}\\s`);
  const voci: { titolo: string; resto: string; punti: string[] }[] = [];
  let testo = false;
  for (let j = i + 1; j < righe.length && !stop.test(righe[j]); j++) {
    const top = righe[j].match(VOCE);
    if (top) {
      const g = top[1].match(/^\*\*(.+?)\*\*[\s:,.;—-]*(.*)$/);
      const titolo = testoSemplice(g ? g[1] : top[1]).replace(/[.:;,]$/, "");
      if (titolo) voci.push({ titolo, resto: g ? g[2] : "", punti: [] });
      continue;
    }
    const sotto = righe[j].match(SOTTO_VOCE);
    if (sotto && voci.length) {
      voci[voci.length - 1].punti.push(sotto[1]);
      continue;
    }
    if (righe[j].trim() && !righe[j].trim().startsWith("#")) testo = true;
  }
  return {
    testo,
    voci: voci.map((v) => {
      const resto = testoSemplice(v.resto).replace(/[.:;,]$/, "");
      const punti = v.punti.map((p) => accorcia(testoSemplice(p).replace(/[.;]$/, ""), 300)).filter(Boolean);
      return { titolo: accorcia(v.titolo, 140), dettaglio: resto ? accorcia(resto, 300) : undefined, ...(punti.length ? { punti } : {}) };
    }),
  };
}

/** Le voci della sezione «## …» il cui titolo contiene `chiave` (sotto-voci comprese). */
export function vociSezione(md: string | null, chiave: string): RigaLista[] {
  const righe = righeDi(md);
  const k = chiave.toLowerCase();
  const i = righe.findIndex((r) => /^##\s/.test(r) && r.toLowerCase().includes(k));
  return i < 0 ? [] : vociFra(righe, i, 2).voci;
}

/**
 * Il lavoro sul sito ANCORA DA FARE: la sotto-sezione «### Ancora da fare» della sezione del sito
 * in LAVORO-APERTO.md. Senza quella sotto-sezione la casella non sa separare il fatto dal da fare,
 * e lo dice invece di mostrare come «da costruire» cose già online.
 */
export function lavoroSitoDaFare(md: string | null): { voci: RigaLista[]; separato: boolean; testo: boolean; trovata: boolean } {
  const righe = righeDi(md);
  const i = righe.findIndex((r) => /^##\s/.test(r) && /lavoro sul sito/i.test(r));
  if (i < 0) return { voci: [], separato: false, testo: false, trovata: false };
  for (let j = i + 1; j < righe.length && !/^##\s/.test(righe[j]); j++) {
    if (/^###\s/.test(righe[j]) && /da fare/i.test(righe[j])) return { ...vociFra(righe, j, 3), separato: true, trovata: true };
  }
  return { ...vociFra(righe, i, 2), separato: false, trovata: true };
}

export function rispostaRoadmap(md: string | null, oggi: string): RispostaModulo {
  if (md == null) return { collegato: false, righe: [], fonti: [], nota: "La pagina del lavoro aperto non si legge in questo momento." };
  const { voci, separato, testo, trovata } = lavoroSitoDaFare(md);
  const fonti = [fonte("lavoro aperto", giorno(frontmatter(md, "aggiornato")), oggi)];
  // Non trovata o illeggibile = «non letta» (numero «—»), mai «nessun lavoro» né «qui sotto c'è tutto» sul vuoto.
  if (!trovata) return { collegato: false, righe: [], fonti, nota: "Non trovo la sezione del lavoro sul sito nella pagina del lavoro aperto." };
  if (!voci.length && testo) {
    return { collegato: false, righe: [], fonti, nota: "C'è del testo sul lavoro del sito, ma non riesco a leggerne le voci: guardalo nella pagina del lavoro aperto." };
  }
  return {
    collegato: true,
    righe: voci,
    fonti,
    nota: !voci.length
      ? "Nessun lavoro ancora da fare sul sito nella pagina del lavoro aperto."
      : !separato
        ? "La pagina del lavoro aperto non separa il fatto dal da fare: qui sotto c'è tutto, anche il lavoro già concluso."
        : undefined,
  };
}

// ───────────────────────────── 🧪 esperimenti ─────────────────────────────

export type Esperimento = {
  titolo?: string;
  stato?: string;
  ipotesi?: string;
  metrica?: string;
  negozio?: string;
  inizio?: string;
  fine?: string;
  esito?: string;
};

const ORDINE_STATO = ["in_corso", "pronto", "concluso"];

/** In corso prima, poi pronti, poi conclusi. Verde se l'esito è positivo, rosso se negativo. */
export function righeEsperimenti(lista: Esperimento[] | null | undefined): RigaLista[] {
  const norm = (s: unknown) => String(s ?? "").trim().toLowerCase().replace(/\s+/g, "_");
  return (Array.isArray(lista) ? lista : [])
    .map((e) => ({ ...e, titolo: e?.titolo ?? (e as { nome?: string })?.nome }))
    .filter((e) => testoSemplice(e?.titolo))
    .map((e) => {
      const esito = norm(e.esito);
      // Senza stato: se ha già un esito o una fine è concluso, non «in corso».
      const stato = norm(e.stato) || (esito || e.fine ? "concluso" : "in_corso");
      const colore: RigaLista["colore"] =
        stato === "in_corso" ? "giallo" : /^(riuscito|positivo|vinto)/.test(esito) ? "verde" : /^(fallito|negativo|perso)/.test(esito) ? "rosso" : undefined;
      const quando = e.inizio ? `dal ${dataBreveIt(e.inizio)}` : "";
      return {
        ordine: ORDINE_STATO.indexOf(stato) < 0 ? ORDINE_STATO.length : ORDINE_STATO.indexOf(stato),
        riga: {
          titolo: testoSemplice(e.titolo),
          dettaglio: accorcia([e.ipotesi, e.metrica ? `misura: ${e.metrica}` : "", e.negozio, quando, e.esito ? `esito: ${e.esito}` : ""].filter(Boolean).join(" · ")) || undefined,
          meta: stato.replace(/_/g, " "),
          colore,
        } as RigaLista,
      };
    })
    .sort((a, b) => a.ordine - b.ordine)
    .map((x) => x.riga);
}

export function rispostaEsperimenti(l: LetturaJson<any>, oggi: string): RispostaModulo {
  if (!l.dati) {
    return {
      collegato: false,
      righe: [],
      fonti: [fonte("registro esperimenti", null, oggi, false, l.motivo ?? "il registro non c'è")],
      nota: "Il registro degli esperimenti non si legge: non so dire se ce ne sono in corso.",
    };
  }
  if (!Array.isArray(l.dati.esperimenti)) {
    return {
      collegato: false,
      righe: [],
      fonti: [fonte("registro esperimenti", giorno(l.dati.aggiornato), oggi, false, "il registro non ha la lista «esperimenti»: non so leggerlo")],
      nota: "Il registro degli esperimenti ha una forma che non so leggere: non so dire se ce ne sono in corso.",
    };
  }
  const righe = righeEsperimenti(l.dati.esperimenti);
  const illeggibili = l.dati.esperimenti.length - righe.length;
  if (illeggibili && !righe.length) {
    return {
      collegato: false,
      righe: [],
      fonti: [fonte("registro esperimenti", giorno(l.dati.aggiornato), oggi, false, `${illeggibili} voci senza «titolo»: non so leggerle`)],
      nota: "Nel registro ci sono esperimenti che non so leggere: non so dire se ce ne sono in corso.",
    };
  }
  return {
    collegato: true,
    righe,
    fonti: [fonte("registro esperimenti", giorno(l.dati.aggiornato), oggi)],
    conta: righe.length,
    nota: illeggibili
      ? `${illeggibili} ${illeggibili === 1 ? "voce del registro non si legge" : "voci del registro non si leggono"} (manca il «titolo»).`
      : righe.length
        ? undefined
        : "Nessun esperimento di crescita in corso. Il registro è pronto: ogni esperimento nuovo si scrive lì.",
  };
}

// ───────────────────────────── 🗞️ notizie (RSS) ─────────────────────────────

export type Notizia = { titolo: string; fonte?: string; data?: string; link?: string };

/** Un carattere codificato fuori misura (&#99999999;) resta com'è: non butta via tutto il feed. */
function carattere(n: number, grezzo: string): string {
  return Number.isInteger(n) && n >= 0 && n <= 0x10ffff ? String.fromCodePoint(n) : grezzo;
}

function decodifica(s: string): string {
  return s
    .replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, "$1")
    .replace(/&#(\d+);/g, (g, n) => carattere(Number(n), g))
    .replace(/&#x([0-9a-f]+);/gi, (g, n) => carattere(parseInt(n, 16), g))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
}

function tag(item: string, nome: string): string {
  const m = item.match(new RegExp(`<${nome}\\b[^>]*>([\\s\\S]*?)</${nome}>`, "i"));
  return m ? decodifica(m[1].trim()) : "";
}

/** È davvero un feed? Una pagina di consenso o un captcha rispondono 200, ma in HTML. */
export function eFeedRss(testo: string | null | undefined): boolean {
  return /<rss\b|<channel\b|<feed\b/i.test(String(testo ?? ""));
}

/**
 * Le notizie di un feed RSS (Google Notizie). Il titolo di Google finisce con « - Testata»:
 * la testata la tolgo dal titolo e la tengo a parte. La data diventa aaaa-mm-gg a Roma.
 * `null` se il testo non è un feed: «non letto», non «nessuna notizia».
 */
export function notizieDaRss(xml: string | null | undefined, max = 5): Notizia[] | null {
  if (!eFeedRss(xml)) return null;
  const out: Notizia[] = [];
  for (const m of String(xml).matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    const item = m[1];
    let titolo = tag(item, "title");
    const testata = tag(item, "source");
    if (!titolo) continue;
    if (testata && titolo.endsWith(` - ${testata}`)) titolo = titolo.slice(0, -(testata.length + 3)).trim();
    const ms = Date.parse(tag(item, "pubDate"));
    const data = Number.isNaN(ms) ? undefined : new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Rome" }).format(new Date(ms));
    const link = tag(item, "link");
    out.push({ titolo, fonte: testata || undefined, data, link: /^https?:\/\//.test(link) ? link : undefined });
    if (out.length >= max) break;
  }
  return out;
}

/** Notizie → righe, senza doppioni di titolo fra le due ricerche (noi e città). */
export function righeNotizie(gruppi: { etichetta: string; notizie: Notizia[] }[]): RigaLista[] {
  const visti = new Set<string>();
  const out: RigaLista[] = [];
  for (const g of gruppi) {
    for (const n of g.notizie) {
      const chiave = n.titolo.toLowerCase();
      if (visti.has(chiave)) continue;
      visti.add(chiave);
      out.push({
        titolo: n.titolo,
        dettaglio: [g.etichetta, n.fonte].filter(Boolean).join(" · ") || undefined,
        meta: n.data ? dataBreveIt(n.data).slice(0, 5) : undefined,
        link: n.link,
      });
    }
  }
  return out;
}

/**
 * La rassegna: due ricerche in diretta. `null` = quella ricerca non ha risposto (o non ha
 * risposto con un feed). La nota si vede anche sopra un elenco pieno: «nessuno parla di noi» è
 * un dato, non un vuoto.
 */
export function rispostaRassegna(noi: Notizia[] | null, citta: Notizia[] | null, ultimoControllo: string | null, oggi: string): RispostaModulo {
  if (noi == null && citta == null) {
    const ultimo = giorno(ultimoControllo);
    return {
      collegato: false,
      righe: [],
      fonti: [fonte("Google Notizie", null, oggi, false, "non ha risposto con un feed"), ...(ultimo ? [fonte("ultimo controllo a mano della reputazione", ultimo, oggi)] : [])],
      nota: `Google Notizie non ha risposto: non so dire se ci sono notizie nuove.${ultimo ? ` L'ultimo controllo a mano della reputazione è del ${dataBreveIt(ultimo)}.` : ""}`,
    };
  }
  const righe = righeNotizie([
    { etichetta: "parla di MyCity", notizie: noi ?? [] },
    { etichetta: "commercio in città", notizie: citta ?? [] },
  ]);
  let nota: string | undefined;
  if (noi == null) nota = "La ricerca su MyCity non ha risposto: sotto ci sono solo le notizie della città.";
  else if (citta == null) nota = noi.length ? "La ricerca sulla città non ha risposto: sotto ci sono solo le notizie su MyCity." : "Nessuna notizia nomina MyCity, e la ricerca sulla città non ha risposto.";
  else if (!righe.length) nota = "Nessuna notizia trovata, né su MyCity né sul commercio in città.";
  else if (noi.length === 0) nota = "Nessuna notizia nomina MyCity: sotto ci sono quelle sul commercio in città.";
  return { collegato: true, righe, fonti: [fonte("Google Notizie, in diretta", oggi, oggi)], nota };
}
