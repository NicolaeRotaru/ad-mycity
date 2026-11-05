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
import { giorniFra } from "./freschezza-intelligence.ts";

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

/** Una fonte della casella: di quando è il dato, e se è stata letta davvero. */
export type Fonte = { nome: string; data: string | null; giorni: number | null; letta: boolean; motivo?: string | null };

/** La risposta della rotta. `conta` = quante COSE ci sono (58 difetti), non quante righe (8). */
export type RispostaModulo = { collegato: boolean; righe: RigaLista[]; fonti: Fonte[]; conta?: number; nota?: string };

// ───────────────────────────── testo ─────────────────────────────

/** I file salvati da Windows hanno «\r\n»: senza questa riga, zero voci e nessuna data. */
function righeDi(md: string | null | undefined): string[] {
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

function fonte(nome: string, data: string | null, oggi: string, letta = true, motivo: string | null = null): Fonte {
  return { nome, data, giorni: data ? giorniFra(data, oggi) : null, letta, motivo };
}

// ───────────────────────────── 🔎 concorrenti ─────────────────────────────

/** Le celle di una riga di tabella markdown; un «\|» dentro il testo non taglia la cella. */
function celle(riga: string): string[] {
  return riga.trim().replace(/^\|/, "").replace(/\|$/, "").split(/(?<!\\)\|/).map((c) => c.trim());
}

/**
 * Le NOVITÀ del radar: i paragrafi «**① …**» della prima sezione «## … Novità …». Sono le cose che
 * contano (Glovo, Treatwell, Everli, CompraPiacenza il 10/10): in giallo, in cima. Il paragrafo che
 * comincia con «Nessuna novità» è il titolo della tabella sotto, non una novità.
 */
export function novitaRadar(md: string | null): RigaLista[] {
  const righe = righeDi(md);
  const i = righe.findIndex((r) => /^##\s/.test(r) && /novit/i.test(r));
  if (i < 0) return [];
  const out: RigaLista[] = [];
  for (let j = i + 1; j < righe.length && !/^##\s/.test(righe[j]); j++) {
    const m = righe[j].match(/^\*\*\s*([①-⑳])\s*(.+?)\*\*\s*(.*)$/);
    if (!m) continue;
    const titolo = testoSemplice(m[2]).replace(/[.:;,]$/, "");
    if (!titolo || /^nessuna novit/i.test(titolo)) continue;
    // Il dettaglio è il resto della riga; se è vuoto, la prima riga sotto (spesso un elenco).
    let resto = m[3];
    for (let k = j + 1; !resto.trim() && k < righe.length && !/^(##|\*\*\s*[①-⑳])/.test(righe[k]); k++) {
      resto = righe[k].replace(/^\s*-\s+/, "");
    }
    out.push({ titolo: accorcia(titolo, 140), dettaglio: resto.trim() ? accorcia(resto) : undefined, colore: "giallo", meta: "novità" });
  }
  return out;
}

/**
 * Le righe della PRIMA tabella che ha «Concorrente» come prima colonna (i controlli «nessuna
 * novità»). In giallo solo un esito che non comincia con «Nessun…».
 */
export function righeTabellaConcorrenti(md: string | null): RigaLista[] {
  const righe = righeDi(md);
  const inizio = righe.findIndex((r) => /^\|\s*Concorrente\s*\|/i.test(r.trim()));
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
  const righe = righeConcorrenti(md);
  return {
    collegato: true,
    righe,
    fonti: [fonte("radar concorrenti", data, oggi)],
    nota: righe.length ? undefined : "Il radar c'è, ma non ha né novità numerate né la tabella dei concorrenti: il testo intero è nella scheda Intelligence.",
  };
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

export function rispostaSicurezza(rad: LetturaJson<any>, oggi: string): RispostaModulo {
  const d = difettiDaRadiografia(rad, DIMENSIONI_SICUREZZA, "accessi e permessi", oggi);
  if (!d.ok) return { collegato: false, righe: [], fonti: [d.fonte], nota: `Non ho letto i difetti del sito: ${d.fonte.motivo}. Non vuol dire che non ce ne siano.` };
  const righe = [...d.serie, ...d.resto];
  return {
    collegato: true,
    righe,
    fonti: [d.fonte],
    conta: d.totale,
    nota: righe.length ? undefined : "Nessun difetto aperto di accessi e permessi nella radiografia del sito.",
  };
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
  const fDocs = docs.length
    ? fonte("documenti legali", null, oggi)
    : fonte("documenti legali", null, oggi, false, "nessun file trovato in consegne/legale: cartella vuota o non leggibile");
  const fReg = reg.dati
    ? fonte("registro rischi", giorno(reg.dati?.aggiornato), oggi)
    : fonte("registro rischi", null, oggi, false, reg.motivo ?? "il registro rischi non c'è");
  const fonti = [d.fonte, fDocs, fReg];

  const rischi = reg.dati ? righeRischi(reg.dati.rischi, "normativo") : [];
  const righe = [...(d.ok ? d.serie : []), ...righeDocumenti(docs), ...rischi, ...(d.ok ? d.resto : [])];
  const nonLette = fonti.filter((f) => !f.letta);
  if (nonLette.length === fonti.length) {
    return { collegato: false, righe: [], fonti, nota: "Non ho letto nessuna delle tre fonti: non so dire se ci sono problemi legali." };
  }
  const vuote: string[] = [];
  if (d.ok && d.totale === 0) vuote.push("nessun difetto legale aperto sul sito");
  if (reg.dati && rischi.length === 0) vuote.push("nessun rischio normativo aperto");
  const pezzi = [
    nonLette.length ? `Non letti: ${nonLette.map((f) => f.nome).join(", ")}.` : "",
    vuote.length ? `Fra le fonti lette: ${vuote.join("; ")}.` : "",
  ].filter(Boolean);
  return {
    collegato: true,
    righe,
    fonti,
    conta: (d.ok ? d.totale : 0) + docs.length + rischi.length,
    nota: pezzi.length ? pezzi.join(" ") : undefined,
  };
}

// ───────────────────────────── 🗺️ lavoro aperto ─────────────────────────────

/**
 * Le voci di primo livello («- …») fra la riga `i` e la prossima intestazione di livello ≤ `livello`.
 * Le sotto-voci («  - …») non si perdono: entrano nel dettaglio della voce madre.
 */
function vociFra(righe: string[], i: number, livello: number): RigaLista[] {
  const stop = new RegExp(`^#{1,${livello}}\\s`);
  const voci: { titolo: string; parti: string[] }[] = [];
  for (let j = i + 1; j < righe.length && !stop.test(righe[j]); j++) {
    const top = righe[j].match(/^-\s+(.+)$/);
    if (top) {
      const g = top[1].match(/^\*\*(.+?)\*\*[\s:,.;—-]*(.*)$/);
      const titolo = testoSemplice(g ? g[1] : top[1]).replace(/[.:;,]$/, "");
      if (titolo) voci.push({ titolo, parti: g && g[2].trim() ? [g[2]] : [] });
      continue;
    }
    const sotto = righe[j].match(/^\s+-\s+(.+)$/);
    if (sotto && voci.length) voci[voci.length - 1].parti.push(sotto[1]);
  }
  return voci.map((v) => ({
    titolo: accorcia(v.titolo, 140),
    dettaglio: v.parti.length ? accorcia(v.parti.map((p) => testoSemplice(p).replace(/[.;]$/, "")).join(" · "), 260) : undefined,
  }));
}

/** Le voci della sezione «## …» il cui titolo contiene `chiave` (sotto-voci comprese). */
export function vociSezione(md: string | null, chiave: string): RigaLista[] {
  const righe = righeDi(md);
  const k = chiave.toLowerCase();
  const i = righe.findIndex((r) => /^##\s/.test(r) && r.toLowerCase().includes(k));
  return i < 0 ? [] : vociFra(righe, i, 2);
}

/**
 * Il lavoro sul sito ANCORA DA FARE: la sotto-sezione «### Ancora da fare» della sezione del sito
 * in LAVORO-APERTO.md. Senza quella sotto-sezione la casella non sa separare il fatto dal da fare,
 * e lo dice invece di mostrare come «da costruire» cose già online.
 */
export function lavoroSitoDaFare(md: string | null): { voci: RigaLista[]; separato: boolean } {
  const righe = righeDi(md);
  const i = righe.findIndex((r) => /^##\s/.test(r) && /lavoro sul sito/i.test(r));
  if (i < 0) return { voci: [], separato: false };
  for (let j = i + 1; j < righe.length && !/^##\s/.test(righe[j]); j++) {
    if (/^###\s/.test(righe[j]) && /da fare/i.test(righe[j])) return { voci: vociFra(righe, j, 3), separato: true };
  }
  return { voci: vociFra(righe, i, 2), separato: false };
}

export function rispostaRoadmap(md: string | null, oggi: string): RispostaModulo {
  if (md == null) return { collegato: false, righe: [], fonti: [], nota: "La pagina del lavoro aperto non si legge in questo momento." };
  const { voci, separato } = lavoroSitoDaFare(md);
  return {
    collegato: true,
    righe: voci,
    fonti: [fonte("lavoro aperto", giorno(frontmatter(md, "aggiornato")), oggi)],
    nota: !separato
      ? "La pagina del lavoro aperto non separa il fatto dal da fare: qui sotto c'è tutto, anche il lavoro già concluso."
      : voci.length
        ? undefined
        : "Nessun lavoro ancora da fare sul sito nella pagina del lavoro aperto.",
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
  const righe = righeEsperimenti(l.dati.esperimenti);
  return {
    collegato: true,
    righe,
    fonti: [fonte("registro esperimenti", giorno(l.dati.aggiornato), oggi)],
    conta: righe.length,
    nota: righe.length ? undefined : "Nessun esperimento di crescita in corso. Il registro è pronto: ogni esperimento nuovo si scrive lì.",
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
