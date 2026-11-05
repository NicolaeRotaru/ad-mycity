// 🔌 Le caselle della scheda «Mercato» che leggono la MEMORIA (vault, consegne, registri) invece
// del database del sito.
//
// Perché esiste (Nicola, 2026-11-05 06:21, «Vedi che ci sono questi da collegare, come si fa?»):
// sei caselle dicevano «da collegare» anche dove il dato c'era già. Il radar dei concorrenti, per
// esempio, si leggeva nella scheda Intelligence, mentre la casella in Mercato restava spenta.
// La scritta era fissa nel catalogo (`stato: "placeholder"`), non guardava i dati.
//
// Qui stanno SOLO funzioni pure: ogni fonte entra come testo o JSON ed esce come righe della
// casella. La rotta /api/moduli/lista legge le fonti e chiama queste funzioni; il test le prova
// senza rete e senza GitHub (pannello/src/lib/moduli-memoria.test.mts).
//
// Estensione `.ts` esplicita: questo file lo esegue anche Node nei test (stessa regola di
// freschezza-intelligence.ts).

import type { RigaLista } from "./moduli.ts";
import { eAperto, severitaDi } from "./radiografia-marketplace-conti.ts";

/** Le caselle collegate qui. Unica casa: il catalogo (moduli.ts) e la rotta la leggono entrambi. */
export const TIPI_MODULI = ["concorrenti", "rassegna", "sicurezza", "legale", "esperimenti", "roadmap"] as const;
export type TipoModulo = (typeof TIPI_MODULI)[number];

export function eTipoModulo(t: string): t is TipoModulo {
  return (TIPI_MODULI as readonly string[]).includes(t);
}

/** Le dimensioni della radiografia del sito che ogni casella conta come «sue». */
export const DIMENSIONI_SICUREZZA = ["sicurezza-auth", "rls-database"];
export const DIMENSIONI_LEGALE = ["privacy-legale"];

export const MAX_DETTAGLIO = 180;

// ───────────────────────────── testo ─────────────────────────────

/** Toglie il markdown che a schermo diventa rumore: link (resta il testo), grassetti, codice. */
export function testoSemplice(s: unknown): string {
  return String(s ?? "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*|__|`/g, "")
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

/** Il valore di una chiave nel frontmatter `---` in cima a un markdown. */
export function frontmatter(md: string | null, chiave: string): string | null {
  const m = String(md ?? "").match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const riga = m[1].split("\n").find((r) => r.startsWith(`${chiave}:`));
  return riga ? riga.slice(chiave.length + 1).trim() || null : null;
}

// ───────────────────────────── 🔎 concorrenti ─────────────────────────────

/**
 * Le righe della PRIMA tabella che ha «Concorrente» come prima colonna (radar-concorrenti.md).
 * In giallo solo chi ha una novità: un esito che comincia con «Nessun…» resta senza colore.
 */
export function righeConcorrenti(md: string | null): RigaLista[] {
  const righe = String(md ?? "").split("\n");
  const inizio = righe.findIndex((r) => /^\|\s*Concorrente\s*\|/i.test(r.trim()));
  if (inizio < 0) return [];
  const out: RigaLista[] = [];
  for (let i = inizio + 1; i < righe.length; i++) {
    const r = righe[i].trim();
    if (!r.startsWith("|")) break;
    if (/^\|[\s:|-]+$/.test(r)) continue; // il separatore |---|---|
    const celle = r.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
    const nome = testoSemplice(celle[0]);
    if (!nome) continue;
    const esito = testoSemplice(celle[1]);
    const novita = esito !== "" && !/^nessun/i.test(esito);
    out.push({ titolo: nome, dettaglio: esito ? accorcia(esito) : undefined, colore: novita ? "giallo" : undefined });
  }
  return out;
}

// ───────────────────────────── 📄 documenti ─────────────────────────────

export type Documento = { percorso: string; testo: string | null };

/** «2026-11-01-domande-commercialista.md» → «domande commercialista». */
function nomeUmano(file: string): string {
  return file.replace(/\.md$/i, "").replace(/^\d{4}-\d{2}-\d{2}-?/, "").replace(/[-_]+/g, " ").trim();
}

/**
 * Una riga per documento: il titolo è il primo «# » del file, sotto c'è il nome del file in
 * parole (due contratti hanno lo stesso titolo: senza il nome non si distinguono), e la data è
 * quella scritta nel nome. I più recenti in cima; quelli senza data in fondo.
 */
export function righeDocumenti(docs: Documento[]): RigaLista[] {
  return docs
    .map((d) => {
      const file = d.percorso.split("/").pop() || d.percorso;
      const h1 = String(d.testo ?? "").split("\n").find((r) => /^#\s+/.test(r));
      const nome = nomeUmano(file);
      const titolo = h1 ? testoSemplice(h1.replace(/^#\s+/, "")) : nome;
      const data = file.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? "";
      const riga: RigaLista = {
        titolo,
        dettaglio: h1 && nome ? `documento: ${nome}` : undefined,
        meta: data ? dataBreveIt(data) : "senza data",
      };
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
  if (g.includes("alta") && !g.includes("media")) return 0;
  if (g.includes("media")) return 1;
  return 2;
}

/** I rischi di una categoria non chiusi, i più gravi in cima: alta in rosso, media in giallo. */
export function righeRischi(rischi: Rischio[] | null | undefined, categoria: string): RigaLista[] {
  return (Array.isArray(rischi) ? rischi : [])
    .filter((r) => String(r?.categoria ?? "").trim().toLowerCase() === categoria)
    .filter((r) => !/^(chius|mitigat)/i.test(String(r?.stato_mitigazione ?? "")))
    .map((r) => {
      const g = String(r.gravita ?? "").trim().toLowerCase();
      const stato = String(r.stato_mitigazione ?? "").trim().replace(/-/g, " ");
      const rev = r.ultima_revisione ? `rivisto il ${dataBreveIt(r.ultima_revisione)}` : "";
      return {
        peso: pesoGravita(g),
        riga: {
          titolo: testoSemplice(r.rischio) || String(r.id ?? "rischio"),
          dettaglio: [g ? `rischio ${g}` : "", stato, rev].filter(Boolean).join(" · ") || undefined,
          meta: "rischio",
          colore: pesoGravita(g) === 0 ? "rosso" : pesoGravita(g) === 1 ? "giallo" : undefined,
        } as RigaLista,
      };
    })
    .sort((a, b) => a.peso - b.peso)
    .map((x) => x.riga);
}

// ───────────────────────────── 🩻 difetti del sito ─────────────────────────────

export type ProblemaSito = { dimensione?: string; severita?: string; stato?: string; titolo?: string };
export type ContiDifetti = { bloccante: number; grave: number; minore: number; altre: number };

/**
 * I difetti APERTI del sito (radiografia-marketplace.json) nelle dimensioni date. Bloccanti e
 * gravi uno per uno, in rosso e in giallo; i minori in una riga sola col loro numero, perché
 * cinquanta righe di minori seppellirebbero i sei che contano.
 */
export function righeDifettiSito(
  problemi: ProblemaSito[] | null | undefined,
  dimensioni: string[],
  cosa: string,
): { serie: RigaLista[]; minori: RigaLista | null; conti: ContiDifetti } {
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
  const resto = conti.minore + conti.altre;
  const minori: RigaLista | null = resto
    ? { titolo: `Altri ${resto} difetti minori aperti: ${cosa}`, dettaglio: "Sono nella radiografia del sito, scheda Cervello.", meta: "minori" }
    : null;
  return { serie, minori, conti };
}

// ───────────────────────────── 🗺️ lavoro aperto ─────────────────────────────

/**
 * Le voci di primo livello («- …», senza rientro) della sezione «## …» il cui titolo contiene
 * `chiave`. Il grassetto iniziale diventa il titolo, il resto il dettaglio.
 */
export function vociSezione(md: string | null, chiave: string): RigaLista[] {
  const righe = String(md ?? "").split("\n");
  const k = chiave.toLowerCase();
  const i = righe.findIndex((r) => /^##\s/.test(r) && r.toLowerCase().includes(k));
  if (i < 0) return [];
  const out: RigaLista[] = [];
  for (let j = i + 1; j < righe.length && !/^##\s/.test(righe[j]); j++) {
    const m = righe[j].match(/^-\s+(.+)$/);
    if (!m) continue;
    const g = m[1].match(/^\*\*(.+?)\*\*[\s:,.;—-]*(.*)$/);
    const titolo = testoSemplice(g ? g[1] : m[1]).replace(/[.:;,]$/, "");
    const resto = g ? g[2] : "";
    if (!titolo) continue;
    out.push({ titolo: accorcia(titolo, 140), dettaglio: resto ? accorcia(resto) : undefined });
  }
  return out;
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
    .filter((e) => testoSemplice(e?.titolo))
    .map((e) => {
      const stato = norm(e.stato) || "in_corso";
      const esito = norm(e.esito);
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

// ───────────────────────────── 🗞️ notizie (RSS) ─────────────────────────────

export type Notizia = { titolo: string; fonte?: string; data?: string; link?: string };

function decodifica(s: string): string {
  return s
    .replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, "$1")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
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

/**
 * Le notizie di un feed RSS (Google Notizie). Il titolo di Google finisce con « - Testata»:
 * la testata la tolgo dal titolo e la tengo a parte. La data diventa aaaa-mm-gg a Roma.
 */
export function notizieDaRss(xml: string | null | undefined, max = 5): Notizia[] {
  const out: Notizia[] = [];
  for (const m of String(xml ?? "").matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    const item = m[1];
    let titolo = tag(item, "title");
    const fonte = tag(item, "source");
    if (!titolo) continue;
    if (fonte && titolo.endsWith(` - ${fonte}`)) titolo = titolo.slice(0, -(fonte.length + 3)).trim();
    const ms = Date.parse(tag(item, "pubDate"));
    const data = Number.isNaN(ms) ? undefined : new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Rome" }).format(new Date(ms));
    const link = tag(item, "link");
    out.push({ titolo, fonte: fonte || undefined, data, link: /^https?:\/\//.test(link) ? link : undefined });
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
