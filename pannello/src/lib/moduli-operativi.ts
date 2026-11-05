// 🔌 Le sei caselle delle schede «Negozi & clienti» e «Operazioni» che dicevano «da collegare».
//
// Perché esiste (Nicola, 2026-11-05 09:44, «Fai le due cose»): dopo le sei caselle del Mercato
// restavano Rider & flotta, Contatti & relazioni, Lead & pipeline negozi, Catalogo & prodotti,
// Campagne, Calendario & eventi. Il dato c'era quasi sempre: tre nel database del sito (rider,
// prodotti, negozi da contattare), tre in memoria (mappa dei giornali, eventi, scadenze).
//
// Stessa regola delle caselle del Mercato (moduli-memoria.ts), che il collaudo del 5/11 ha fatto
// valere tre volte: **una fonte non letta non è una fonte vuota**. Il database del sito risponde con
// un esito (`ok`): se non risponde, la casella dice «non letto», mai «nessun rider».
//
// Il primo collaudo di queste sei (5/11, due lenti) ha bocciato: lo scadenzario era la copia morta
// del vault, la tabella degli eventi era quella del meteo, ogni rider era giallo per un HACCP che
// sul sito è facoltativo, i numeri sommavano cose diverse. Le correzioni hanno ognuna la sua prova.
//
// Solo funzioni pure: la rotta /api/moduli/lista legge, queste decidono. Le prova
// moduli-operativi.test.mts. Estensione `.ts` esplicita perché le esegue anche Node nei test.

import type { RigaLista } from "./moduli.ts";
import type { LetturaJson } from "./esito-lettura.ts";
import type { Fonte, RispostaModulo } from "./moduli-memoria.ts";
import { accorcia, celle, dataBreveIt, fonte, giorniTra, giorno, righeDi, senzaZeroFalso, testoSemplice } from "./moduli-memoria.ts";
import { giornoRoma } from "./format.ts";

/** L'esito di una lettura dal database del sito: collegato? ha risposto? e le righe. */
export type EsitoSito = { collegato: boolean; ok: boolean; rows: any[] };

/** Quante righe chiede la rotta al massimo: se le arrivano tutte, la casella dice che sono «almeno». */
export const LIMITE_RIGHE = 1000;

function fonteSito(nome: string, e: EsitoSito, oggi: string): Fonte {
  if (!e.collegato) return fonte(nome, null, oggi, false, "il database del sito non è collegato a questo Pannello");
  if (!e.ok) return fonte(nome, null, oggi, false, "il database del sito non ha risposto");
  return fonte(nome, oggi, oggi);
}

function euro(v: unknown): string {
  const n = Number(v);
  return Number.isFinite(n) ? `€ ${n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "";
}

/** Una frase con la maiuscola: «nessuna campagna…» → «Nessuna campagna…». */
export function frase(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** Le fonti non lette, dette in una frase: «Non letti: x, y.» */
function fraseNonLette(fonti: Fonte[]): string {
  const n = fonti.filter((f) => !f.letta);
  return n.length ? `Non letti: ${n.map((f) => f.nome).join(", ")}.` : "";
}

/**
 * Il giorno a Piacenza. Le date del sito con l'ora sono in UTC («2026-11-04T23:30:00+00:00» è il 5/11
 * a Piacenza): tagliare la stringa dava il giorno prima. Una data senza ora resta com'è.
 */
export function giornoLocale(s: unknown): string | null {
  const t = String(s ?? "");
  if (/^\d{4}-\d{2}-\d{2}T/.test(t)) {
    const ms = Date.parse(t);
    return Number.isNaN(ms) ? giorno(t) : giornoRoma(new Date(ms));
  }
  return giorno(t);
}

/**
 * Quanti giorni mancano a `data` (negativo se è passata), in giorni di CALENDARIO (giorniTra): il
 * cambio d'ora del 25/10 e del 28/3 non sposta più il conto di uno.
 */
export function giorniA(oggi: string, data: string): number | null {
  return giorniTra(oggi, data);
}

/** «1 giorno», «3 giorni». */
function giorni(n: number): string {
  return `${n} ${n === 1 ? "giorno" : "giorni"}`;
}

// ───────────────────────────── 🚴 rider & flotta ─────────────────────────────

/** I documenti del rider: campo, nome, femminile?, obbligatorio? (sul sito l'HACCP è «se food»). */
const DOCUMENTI_RIDER: [string, string, boolean, boolean][] = [
  ["rider_license_expires_on", "patente", true, true],
  ["rider_insurance_expires_on", "assicurazione", true, true],
  ["rider_haccp_expires_on", "attestato HACCP", false, false],
];

const MEZZO_IT: Record<string, string> = {
  bike: "bici", bicycle: "bici", ebike: "bici elettrica", e_bike: "bici elettrica", cargo_bike: "cargo-bike",
  scooter: "scooter", motorbike: "moto", moto: "moto", car: "auto", auto: "auto", foot: "a piedi", walk: "a piedi",
};
/** Lo stato della richiesta del rider: testo, e se va guardato (giallo) o no (respinto, sospeso). */
const RICHIESTA_IT: Record<string, [string, boolean]> = {
  pending: ["da approvare", true], submitted: ["da approvare", true], in_review: ["da approvare", true],
  rejected: ["respinto", false], suspended: ["sospeso", false], banned: ["bloccato", false],
};

function mezzo(v: unknown): string {
  const k = String(v ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return k ? MEZZO_IT[k] ?? k.replace(/_/g, " ") : "";
}

/**
 * Un rider per riga. In cima chi ha un documento scaduto (rosso), poi chi ce l'ha in scadenza entro
 * 30 giorni, gli manca patente o assicurazione, o aspetta l'approvazione (giallo). I respinti e i
 * sospesi in fondo, senza colore: non c'è niente da approvare.
 */
export function righeRider(rows: any[], oggi: string): RigaLista[] {
  return rows
    .map((r) => {
      const note: string[] = [];
      let peso = 3;
      const approvato = Boolean(r?.is_approved);
      for (const [campo, nome, femminile, obbligatorio] of DOCUMENTI_RIDER) {
        const scad = giorno(r?.[campo]);
        if (!scad) {
          if (approvato && obbligatorio) {
            note.push(`${nome}: manca`);
            peso = Math.min(peso, 1);
          }
          continue;
        }
        const mancano = giorniA(oggi, scad);
        if (mancano == null) continue;
        if (mancano < 0) {
          note.push(`${nome} ${femminile ? "scaduta" : "scaduto"} il ${dataBreveIt(scad)}`);
          // Un documento facoltativo (l'HACCP, «se food») scaduto è da guardare, non un rosso.
          peso = obbligatorio ? 0 : Math.min(peso, 1);
        } else if (mancano <= 30) {
          note.push(`${nome} scade il ${dataBreveIt(scad)}`);
          peso = Math.min(peso, 1);
        }
      }
      const statoRichiesta = String(r?.approval_status ?? "").trim().toLowerCase();
      const [richiesta, daGuardare] = RICHIESTA_IT[statoRichiesta] ?? ["da approvare", true];
      if (!approvato) peso = daGuardare ? Math.min(peso, 2) : 4;
      const stato = approvato ? (r?.rider_is_online ? "online" : "approvato") : richiesta;
      const iscritto = giornoLocale(r?.created_at);
      const dettaglio = [r?.rider_vehicle_type ? `mezzo: ${mezzo(r.rider_vehicle_type)}` : "", ...note, iscritto ? `iscritto il ${dataBreveIt(iscritto)}` : ""].filter(Boolean);
      return {
        peso,
        riga: {
          titolo: testoSemplice(r?.full_name) || "Rider senza nome",
          dettaglio: dettaglio.length ? accorcia(dettaglio.join(" · ")) : undefined,
          meta: stato,
          colore: peso === 0 ? "rosso" : peso <= 2 ? "giallo" : approvato && r?.rider_is_online ? "verde" : undefined,
        } as RigaLista,
      };
    })
    .sort((a, b) => a.peso - b.peso)
    .map((x) => x.riga);
}

export function rispostaRider(e: EsitoSito, oggi: string): RispostaModulo {
  const f = fonteSito("rider sul sito", e, oggi);
  if (!f.letta) return { collegato: false, righe: [], fonti: [f], nota: `Non ho letto i rider: ${f.motivo}. Non vuol dire che non ce ne siano.` };
  const righe = righeRider(e.rows, oggi);
  const pieno = e.rows.length >= LIMITE_RIGHE;
  return {
    collegato: true,
    righe,
    fonti: [f],
    conta: pieno ? undefined : e.rows.length,
    almeno: pieno ? e.rows.length : undefined,
    nota: !righe.length ? "Nessun rider iscritto sul sito." : pieno ? `Mostro i primi ${LIMITE_RIGHE} rider: potrebbero essercene altri.` : undefined,
  };
}

// ───────────────────────────── 📦 catalogo & prodotti ─────────────────────────────

/** Lo stato del prodotto sul sito, in italiano. «sold_out» e «out_of_stock» contano come esauriti. */
const STATO_PRODOTTO_IT: Record<string, string> = {
  available: "in vendita", draft: "bozza", pending: "in attesa di approvazione", pending_approval: "in attesa di approvazione", sold: "esaurito",
  archived: "archiviato", hidden: "nascosto", inactive: "nascosto", rejected: "respinto",
};
// «sold» è quello che scrive il tasto «Esaurito» del negoziante (mycity: app/seller/products/page.tsx,
// lib/products/schema.ts SELLER_STATUSES): il collaudo del 5/11 l'ha visto passare per «in vendita».
const ESAURITO = new Set(["sold", "sold_out", "out_of_stock"]);

/** Un prodotto per riga: in cima gli esauriti e quelli senza foto (giallo), poi gli altri per nome. */
export function righeCatalogo(rows: any[]): RigaLista[] {
  return rows
    .map((p) => {
      const stock = p?.stock == null ? null : Number(p.stock);
      const stato = String(p?.status ?? "").trim().toLowerCase();
      const esaurito = (stock != null && Number.isFinite(stock) && stock <= 0) || ESAURITO.has(stato);
      const senzaFoto = !Array.isArray(p?.images) || p.images.length === 0;
      // Sul sito si vede solo lo stato «available» (mycity migrations/129): uno stato vuoto non è in vendita.
      const inVendita = stato === "available";
      const statoIt = STATO_PRODOTTO_IT[stato] ?? (stato.replace(/_/g, " ") || "stato non indicato");
      const meta = esaurito ? "esaurito" : senzaFoto ? "senza foto" : statoIt;
      const dettaglio = [
        euro(p?.price),
        // Sul sito scorte vuote = illimitate (mycity lib/products/schema.ts). Segnato «esaurito» dal
        // negoziante: i pezzi in magazzino non contano, sarebbe una contraddizione a schermo.
        ESAURITO.has(stato) ? "segnato esaurito dal negozio" : stock == null || !Number.isFinite(stock) ? "scorte illimitate" : `${stock} ${stock === 1 ? "pezzo" : "pezzi"}`,
        esaurito && senzaFoto ? "senza foto" : "",
        !inVendita && !ESAURITO.has(stato) && meta !== statoIt ? statoIt : "",
      ].filter(Boolean);
      return {
        peso: esaurito ? 0 : senzaFoto ? 1 : !inVendita ? 2 : 3,
        nome: testoSemplice(p?.name) || "Prodotto senza nome",
        riga: { titolo: testoSemplice(p?.name) || "Prodotto senza nome", dettaglio: dettaglio.join(" · ") || undefined, meta, colore: esaurito || senzaFoto ? "giallo" : undefined } as RigaLista,
      };
    })
    .sort((a, b) => a.peso - b.peso || a.nome.localeCompare(b.nome, "it"))
    .map((x) => x.riga);
}

export function rispostaCatalogo(e: EsitoSito, oggi: string): RispostaModulo {
  const f = fonteSito("prodotti sul sito", e, oggi);
  if (!f.letta) return { collegato: false, righe: [], fonti: [f], nota: `Non ho letto i prodotti: ${f.motivo}. Non vuol dire che il catalogo sia vuoto.` };
  const righe = righeCatalogo(e.rows);
  const pieno = e.rows.length >= LIMITE_RIGHE;
  // Il numero: i prodotti IN VETRINA (stato «available» o vuoto), non le bozze o quelli in attesa.
  const inVetrina = e.rows.filter((p) => String(p?.status ?? "").trim().toLowerCase() === "available").length;
  const esauriti = righe.filter((r) => r.meta === "esaurito").length;
  let nota: string | undefined;
  if (!righe.length) nota = "Nessun prodotto sul sito.";
  else if (pieno) nota = `Mostro i primi ${LIMITE_RIGHE} prodotti: potrebbero essercene altri.`;
  else if (!esauriti) nota = "Nessun prodotto esaurito.";
  return { collegato: true, righe, fonti: [f], conta: pieno ? undefined : inVetrina, almeno: pieno ? inVetrina : undefined, nota };
}

// ───────────────────────────── 🎯 lead & pipeline negozi ─────────────────────────────

const STATO_LEAD_IT: Record<string, string> = {
  to_contact: "da contattare", contacted: "contattato", replied: "ha risposto", interested: "interessato",
  meeting: "appuntamento", won: "firmato", signed: "firmato", lost: "perso", rejected: "ha detto no",
};
const STATO_REALTA_IT: Record<string, string> = { confermato: "sul sito", scelta_ragionata: "scelto, da contattare", da_verificare: "da verificare" };
const PAROLE_VUOTE = new Set(["piacenza", "srl", "snc", "sas", "spa", "di", "del", "della", "dei", "la", "il", "lo", "e", "dal", "da"]);

/** Il nome di un negozio ridotto all'osso, per non contarlo due volte fra le due fonti. */
export function nomeNegozio(s: unknown): string {
  return testoSemplice(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // «Pâtisserie» → «patisserie»: l'accento non spezza la parola
    // «S.R.L.» e «S. R. L.» → «srl»: i punti fra lettere singole si tolgono prima di spezzare. Le
    // parentesi restano: «Macelleria (Via Scalabrini 16a)» non deve ridursi a «macelleria».
    .replace(/\b([a-z])\.\s?(?=[a-z]\b)/g, "$1")
    // «dal 1961» è la data di fondazione, non il nome: «Bar 2000» invece il suo numero lo tiene.
    .replace(/\bdal\s+(18|19|20)\d\d\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((w) => w && !PAROLE_VUOTE.has(w))
    .join(" ") || testoSemplice(s).toLowerCase(); // un nome fatto solo di parole vuote resta com'è
}

/**
 * Due fonti. ① I negozi che la macchina segue (registro della realtà): uno per riga, il confermato
 * in verde. ② I negozi trovati dal sito (merchants_leads): una riga per stato col conto, poi i
 * migliori dieci per punteggio. Il numero accanto al titolo conta i negozi DIVERSI fra le due
 * (stesso nome ridotto all'osso = stesso negozio), solo se tutte e due le fonti sono lette.
 */
export function rispostaLead(reg: LetturaJson<any>, leads: EsitoSito, oggi: string): RispostaModulo {
  const listaReg = Array.isArray(reg.dati?.entita);
  const fReg = !reg.dati
    ? fonte("negozi seguiti dalla macchina", null, oggi, false, reg.motivo ?? "il registro della realtà non c'è")
    : !listaReg
      ? fonte("negozi seguiti dalla macchina", giorno(reg.dati?.aggiornato), oggi, false, "il registro non ha la lista «entita»: non so leggerlo")
      : fonte("negozi seguiti dalla macchina", giorno(reg.dati?.aggiornato), oggi);
  const fLead = fonteSito("negozi trovati dal sito", leads, oggi);
  const fonti = [fReg, fLead];
  if (!fReg.letta && !fLead.letta) return { collegato: false, righe: [], fonti, nota: "Non ho letto né i negozi seguiti né quelli trovati dal sito." };

  const ordineReg: Record<string, number> = { confermato: 0, scelta_ragionata: 1, da_verificare: 2 };
  const seguiti = (listaReg ? (reg.dati.entita as any[]) : [])
    .filter((x) => String(x?.tipo ?? "") === "negozio" && String(x?.stato ?? "") !== "scartato")
    .sort((a, b) => (ordineReg[a.stato] ?? 3) - (ordineReg[b.stato] ?? 3) || (Number(b.confidenza) || 0) - (Number(a.confidenza) || 0));
  const righeSeguiti: RigaLista[] = seguiti.map((x) => ({
    titolo: testoSemplice(x.nome) || "Negozio senza nome",
    dettaglio: Number.isFinite(Number(x.confidenza)) ? `fiducia ${Math.round(Number(x.confidenza) * 100)}%` : undefined,
    meta: STATO_REALTA_IT[String(x.stato)] ?? String(x.stato ?? ""),
    colore: x.stato === "confermato" ? "verde" : undefined,
  }));

  const righeLead: RigaLista[] = [];
  if (fLead.letta) {
    const perStato = new Map<string, number>();
    for (const l of leads.rows) {
      const k = String(l?.outreach_status ?? "").trim() || "senza stato";
      perStato.set(k, (perStato.get(k) ?? 0) + 1);
    }
    for (const [k, n] of [...perStato.entries()].sort((a, b) => b[1] - a[1])) {
      righeLead.push({ titolo: `${n} ${n === 1 ? "negozio trovato" : "negozi trovati"} dal sito: ${STATO_LEAD_IT[k] ?? k}`, meta: "dal sito" });
    }
    const migliori = [...leads.rows].sort((a, b) => (Number(b?.score) || 0) - (Number(a?.score) || 0)).slice(0, 10);
    for (const l of migliori) {
      const voto = Number(l?.rating);
      righeLead.push({
        titolo: testoSemplice(l?.name) || "Negozio senza nome",
        dettaglio: [testoSemplice(l?.category), Number.isFinite(voto) && voto > 0 ? `${voto.toLocaleString("it-IT")} su Google (${Number(l?.reviews_count) || 0} recensioni)` : ""].filter(Boolean).join(" · ") || undefined,
        meta: STATO_LEAD_IT[String(l?.outreach_status ?? "")] ?? (String(l?.outreach_status ?? "") || "senza stato"),
      });
    }
  }
  const nomi = new Set<string>([...seguiti.map((x) => nomeNegozio(x.nome)), ...(fLead.letta ? leads.rows.map((l) => nomeNegozio(l?.name)) : [])].filter(Boolean));
  const righe = [...righeSeguiti, ...righeLead];
  const pieno = fLead.letta && leads.rows.length >= LIMITE_RIGHE;
  const pezzi = [fraseNonLette(fonti), pieno ? `Dal sito leggo i primi ${LIMITE_RIGHE} negozi: potrebbero essercene altri.` : "", !righe.length ? "Nessun negozio in trattativa." : ""].filter(Boolean);
  return senzaZeroFalso({
    collegato: true,
    righe,
    fonti,
    conta: fReg.letta && fLead.letta && !pieno ? nomi.size : undefined,
    almeno: fReg.letta && fLead.letta && pieno ? nomi.size : undefined,
    nota: pezzi.join(" ") || undefined,
  });
}

// ───────────────────────────── 📣 campagne ─────────────────────────────

export type Campagna = { titolo?: string; canale?: string; stato?: string; inizio?: string; fine?: string; obiettivo?: string; risultato?: string };
const ORDINE_CAMPAGNA: Record<string, number> = { in_corso: 0, pronta: 1, conclusa: 2, non_indicato: 3 };

/**
 * Lo stato di una campagna: quello scritto, ma una campagna «in corso» la cui fine è passata è
 * conclusa; senza stato lo si deduce dalle date, e se non si può si dice «non indicato».
 */
function statoCampagna(c: Campagna, oggi: string): string {
  const scritto = String(c.stato ?? "").trim().toLowerCase().replace(/\s+/g, "_");
  const fine = giornoLocale(c.fine);
  const inizio = giornoLocale(c.inizio);
  if (fine && fine < oggi && (scritto === "" || scritto === "in_corso")) return "conclusa";
  if (scritto) return scritto;
  if (inizio && inizio > oggi) return "pronta";
  if (inizio) return "in_corso";
  return "non_indicato";
}

/**
 * Due fonti. ① Il registro delle campagne (memoria). ② I messaggi mandati dal sito ai negozi da
 * contattare (outreach_events): se ce ne sono, una riga col conto di inviati, aperti e risposte.
 * Il numero accanto al titolo conta SOLO le campagne: la riga dei messaggi è un riassunto.
 */
export function rispostaCampagne(reg: LetturaJson<any>, invii: EsitoSito, oggi: string): RispostaModulo {
  const lista = Array.isArray(reg.dati?.campagne);
  const fReg = !reg.dati
    ? fonte("registro delle campagne", null, oggi, false, reg.motivo ?? "il registro non c'è")
    : !lista
      ? fonte("registro delle campagne", giorno(reg.dati?.aggiornato), oggi, false, "il registro non ha la lista «campagne»: non so leggerlo")
      : fonte("registro delle campagne", giorno(reg.dati?.aggiornato), oggi);
  const fInv = fonteSito("messaggi ai negozi dal sito", invii, oggi);
  const fonti = [fReg, fInv];
  if (!fReg.letta && !fInv.letta) return { collegato: false, righe: [], fonti, nota: "Non ho letto né il registro delle campagne né i messaggi ai negozi." };

  const campagne = (lista ? (reg.dati.campagne as Campagna[]) : []).filter((c) => testoSemplice(c?.titolo));
  const righe: RigaLista[] = campagne
    .map((c) => {
      const stato = statoCampagna(c, oggi);
      const inizio = giornoLocale(c.inizio);
      const fine = giornoLocale(c.fine);
      return {
        o: ORDINE_CAMPAGNA[stato] ?? 3,
        r: {
          titolo: testoSemplice(c.titolo),
          dettaglio: accorcia([c.canale, c.obiettivo, inizio ? `dal ${dataBreveIt(inizio)}` : "", fine ? `al ${dataBreveIt(fine)}` : "", c.risultato ? `risultato: ${c.risultato}` : ""].filter(Boolean).join(" · ")) || undefined,
          meta: stato.replace(/_/g, " "),
          colore: stato === "in_corso" ? "giallo" : undefined,
        } as RigaLista,
      };
    })
    .sort((a, b) => a.o - b.o)
    .map((x) => x.r);

  const pieno = fInv.letta && invii.rows.length >= LIMITE_RIGHE;
  if (fInv.letta && invii.rows.length) {
    const n = invii.rows.length;
    const aperti = invii.rows.filter((x) => x?.opened_at).length;
    const risposte = invii.rows.filter((x) => x?.replied_at).length;
    const rimbalzati = invii.rows.filter((x) => x?.bounced).length;
    const ultimo = invii.rows.map((x) => giornoLocale(x?.sent_at)).filter(Boolean).sort().pop();
    righe.push({
      titolo: `Messaggi ai negozi da contattare: ${pieno ? "almeno " : ""}${n} ${n === 1 ? "inviato" : "inviati"}`,
      dettaglio: [
        ultimo ? `ultimo il ${dataBreveIt(ultimo)}` : "",
        `${aperti} ${aperti === 1 ? "aperto" : "aperti"}`,
        `${risposte} ${risposte === 1 ? "risposta" : "risposte"}`,
        rimbalzati ? `${rimbalzati} ${rimbalzati === 1 ? "tornato indietro" : "tornati indietro"}` : "",
      ].filter(Boolean).join(" · "),
      meta: "dal sito",
    });
  }
  const vuote: string[] = [];
  if (fReg.letta && !campagne.length) vuote.push("nessuna campagna nel registro");
  if (fInv.letta && !invii.rows.length) vuote.push("nessun messaggio inviato ai negozi da contattare");
  const pezzi = [
    fraseNonLette(fonti),
    vuote.length ? frase(`${vuote.join("; ")}.`) : "",
    pieno ? `Dei messaggi leggo gli ultimi ${LIMITE_RIGHE}: aperti e risposte contano solo quelli.` : "",
    // «0» accanto al titolo sopra la riga dei messaggi si leggerebbe «nessuna attività».
    fReg.letta && !campagne.length && fInv.letta && invii.rows.length ? "Il numero conta solo le campagne del registro: i messaggi ai negozi sono un riassunto a parte." : "",
  ].filter(Boolean).join(" ");
  return senzaZeroFalso({
    collegato: true,
    righe,
    fonti,
    conta: fReg.letta && fInv.letta ? campagne.length : undefined,
    nota: pezzi || undefined,
  });
}

// ───────────────────────────── 📅 calendario & eventi ─────────────────────────────

/** Le righe della prima tabella la cui intestazione comincia con `colonna` (es. «Periodo»). */
export function righeTabella(md: string | null, colonna: string): string[][] {
  const righe = righeDi(md);
  const i = righe.findIndex((r) => new RegExp(`^\\|\\s*${colonna}\\s*\\|`, "i").test(r.trim()));
  if (i < 0) return [];
  const out: string[][] = [];
  for (let j = i + 1; j < righe.length; j++) {
    const r = righe[j].trim();
    if (!r.startsWith("|")) break;
    if (/^\|[\s:|-]+$/.test(r)) continue;
    out.push(celle(r));
  }
  return out;
}

/** Tutte le tabelle markdown prima della riga che comincia con `fine` (es. «## Controlli precedenti»). */
export function tabelle(md: string | null, fine: RegExp = /^##\s+controlli precedenti/i): { intestazione: string[]; righe: string[][] }[] {
  const righe = righeDi(md);
  const out: { intestazione: string[]; righe: string[][] }[] = [];
  for (let i = 0; i < righe.length && !fine.test(righe[i]); i++) {
    const t = righe[i].trim();
    if (!t.startsWith("|") || /^\|[\s:|-]+$/.test(t)) continue;
    const tab = { intestazione: celle(t).map((c) => testoSemplice(c).toLowerCase()), righe: [] as string[][] };
    let j = i + 1;
    for (; j < righe.length && righe[j].trim().startsWith("|"); j++) {
      const r = righe[j].trim();
      if (!/^\|[\s:|-]+$/.test(r)) tab.righe.push(celle(r));
    }
    out.push(tab);
    i = j - 1;
  }
  return out;
}

/**
 * Gli eventi e il meteo dal controllo dell'intelligence, riconosciuti dalle COLONNE e non dalla prima
 * parola: il formato è cambiato a ogni edizione («Evento | Date | Rilevanza» ad agosto, «Data |
 * Evento | Dove | Peso per MyCity» a ottobre; il meteo «Data | Previsione» o «Periodo | Cosa dicono
 * le fonti | Fiducia»). Prima gli eventi, poi il meteo con la fiducia detta per esteso.
 */
export function eventiEMeteo(md: string | null): { eventi: RigaLista[]; meteo: RigaLista[] } {
  const eventi: RigaLista[] = [];
  const meteo: RigaLista[] = [];
  for (const t of tabelle(md)) {
    const col = (re: RegExp) => t.intestazione.findIndex((h) => re.test(h));
    const cEvento = col(/^evento/);
    const cQuando = col(/^(data|date|periodo|quando)/);
    const cMeteo = col(/^(previsione|cosa dicono|condizione)/);
    if (cEvento >= 0) {
      const cDove = col(/^dove/);
      const cPeso = col(/^(peso|rilevanza|impatto)/);
      for (const r of t.righe) {
        const cosa = testoSemplice(r[cEvento]);
        if (!cosa) continue;
        const dove = cDove >= 0 ? testoSemplice(r[cDove]) : "";
        eventi.push({
          titolo: accorcia(cosa, 140),
          dettaglio: [cQuando >= 0 ? testoSemplice(r[cQuando]) : "", dove && dove !== "—" ? dove : "", cPeso >= 0 && testoSemplice(r[cPeso]) ? `per MyCity: ${testoSemplice(r[cPeso])}` : ""].filter(Boolean).join(" · ") || undefined,
          meta: "evento",
        });
      }
    } else if (cMeteo >= 0 && cQuando >= 0) {
      const cFiducia = col(/^fiducia/);
      for (const r of t.righe) {
        const quando = testoSemplice(r[cQuando]);
        if (!quando) continue;
        const fid = cFiducia >= 0 ? testoSemplice(r[cFiducia]) : "";
        meteo.push({
          titolo: `Meteo: ${accorcia(quando, 60)}`,
          dettaglio: accorcia([testoSemplice(r[cMeteo]), fid && fid !== "—" ? `fiducia: ${fid}` : ""].filter(Boolean).join(" · ")) || undefined,
          meta: "meteo",
        });
      }
    }
  }
  return { eventi, meteo };
}

/** Oltre quanti giorni il controllo degli eventi è vecchio: le date sotto possono essere passate. */
export const EVENTI_VECCHI_GIORNI = 7;

/** Una scadenza: quando, e la frase «passata da 4 giorni» / «fra 10 giorni». */
function quandoScade(mancano: number | null): string {
  if (mancano == null) return "data illeggibile";
  if (mancano < 0) return `passata da ${giorni(-mancano)}`;
  return mancano === 0 ? "è oggi" : `fra ${giorni(mancano)}`;
}

/**
 * Due fonti. ① Le scadenze aperte dello scadenzario VIVO (`cervello/scadenzario.json`: le aperte
 * stanno in «scadenze» col campo «scade», le chiuse in «chiuse»; si legge anche la forma vecchia con
 * «scadenza» e «stato»): in cima, rosse se passate, gialle se dentro la loro finestra d'allarme.
 * ② Gli eventi e il meteo dell'intelligence. Se quel controllo è vecchio, le sue righe non entrano
 * nel numero accanto al titolo e la casella lo dice.
 */
export function rispostaCalendario(eventiMd: string | null, eventiData: string | null, scad: LetturaJson<any>, oggi: string): RispostaModulo {
  const { eventi, meteo } = eventiMd == null ? { eventi: [], meteo: [] } : eventiEMeteo(eventiMd);
  const fEv = eventiMd == null
    ? fonte("eventi e meteo dell'intelligence", null, oggi, false, "il controllo degli eventi non si legge")
    : !eventi.length && !meteo.length
      ? fonte("eventi e meteo dell'intelligence", eventiData, oggi, false, "non trovo la tabella degli eventi né quella del meteo: il testo intero è nella scheda Intelligence")
      : fonte("eventi e meteo dell'intelligence", eventiData, oggi);
  const lista = Array.isArray(scad.dati?.scadenze);
  const fSc = !scad.dati
    ? fonte("scadenzario", null, oggi, false, scad.motivo ?? "lo scadenzario non c'è")
    : !lista
      ? fonte("scadenzario", giorno(scad.dati?.aggiornato), oggi, false, "lo scadenzario non ha la lista «scadenze»: non so leggerlo")
      : fonte("scadenzario", giorno(scad.dati?.aggiornato), oggi);
  const fonti = [fSc, fEv];
  if (!fEv.letta && !fSc.letta) return { collegato: false, righe: [], fonti, nota: "Non ho letto né le scadenze né gli eventi." };

  const aperte = (lista ? (scad.dati.scadenze as any[]) : [])
    .filter((x) => !/^(chius|fatt|archiv|annull)/i.test(String(x?.stato ?? "")))
    .map((x) => {
      const quando = giornoLocale(x?.scade ?? x?.scadenza);
      const mancano = quando ? giorniA(oggi, quando) : null;
      const finestra = Number(x?.finestra_allarme_giorni) || 7;
      const dettaglio = [x?.importo ? testoSemplice(x.importo) : "", quandoScade(mancano), x?.chi ? `chi: ${testoSemplice(x.chi)}` : ""].filter(Boolean).join(" · ");
      return {
        quando: quando ?? "9999-99-99",
        riga: {
          titolo: testoSemplice(x?.titolo) || "Scadenza senza titolo",
          dettaglio: accorcia(dettaglio) || undefined,
          meta: quando ? dataBreveIt(quando) : "senza data",
          colore: mancano == null ? "giallo" : mancano < 0 ? "rosso" : mancano <= finestra ? "giallo" : undefined,
        } as RigaLista,
      };
    })
    .sort((a, b) => a.quando.localeCompare(b.quando))
    .map((x) => x.riga);

  // Una data che non si legge vale come vecchia: nel dubbio le righe restano fuori dal numero.
  const vecchio = fEv.letta && (fEv.giorni == null || fEv.giorni > EVENTI_VECCHI_GIORNI);
  const intel = [...eventi, ...meteo].map((r) => (vecchio ? { ...r, meta: `${r.meta} · ${fEv.data ? `controllo del ${dataBreveIt(fEv.data).slice(0, 5)}` : "controllo senza data"}` } : r));
  const pezzi = [
    fraseNonLette(fonti),
    fSc.letta && !aperte.length ? "Nessuna scadenza aperta nello scadenzario." : "",
    vecchio ? `Il controllo degli eventi è ${fEv.giorni == null ? "di una data che non so leggere" : `di ${fEv.giorni} giorni fa`}: le date qui sotto possono essere già passate, e non entrano nel numero. Si rifà dalla scheda Intelligence.` : "",
  ].filter(Boolean);
  return senzaZeroFalso({
    collegato: true,
    righe: [...aperte, ...intel],
    fonti,
    // Il numero: le scadenze aperte, più eventi e meteo solo se il controllo è fresco.
    conta: fSc.letta && fEv.letta ? aperte.length + (vecchio ? 0 : intel.length) : undefined,
    nota: pezzi.join(" ") || undefined,
  });
}

// ───────────────────────────── 📇 contatti & relazioni ─────────────────────────────

/**
 * La mappa dei giornali di Piacenza (consegne/pr-stampa/…-lista-giornalisti.md): una riga per
 * testata — ogni sezione «## N. Nome» che ha una tabella «Campo | Valore». Nel dettaglio il
 * telefono e la prima email; «NON verificato» nel titolo diventa giallo.
 */
export function righeMappaMedia(md: string | null): RigaLista[] {
  const righe = righeDi(md);
  const out: RigaLista[] = [];
  for (let i = 0; i < righe.length; i++) {
    const h = righe[i].match(/^##\s+(?:\d+[.)]\s*)?(.+)$/);
    if (!h) continue;
    const campi = new Map<string, string>();
    for (let j = i + 1; j < righe.length && !/^##\s/.test(righe[j]); j++) {
      const r = righe[j].trim();
      if (!r.startsWith("|") || /^\|[\s:|-]+$/.test(r)) continue;
      const c = celle(r);
      if (c.length >= 2 && !/^campo$/i.test(c[0])) campi.set(testoSemplice(c[0]).toLowerCase(), testoSemplice(c[1]));
    }
    const nonVerificato = /non verificat/i.test(h[1]);
    // Una testata segnata «NON verificato» resta in rubrica anche senza la sua tabella, in giallo.
    if (!campi.size && !nonVerificato) continue;
    const titolo = testoSemplice(h[1]).replace(/\s+—\s+.*$/, "");
    const email = [...campi.entries()].find(([k, v]) => k.startsWith("email") && /@/.test(v))?.[1];
    out.push({
      titolo: accorcia(titolo, 100),
      dettaglio: [campi.get("telefono"), email].filter(Boolean).join(" · ") || undefined,
      meta: nonVerificato ? "da verificare" : "stampa",
      colore: nonVerificato ? "giallo" : undefined,
    });
  }
  return out;
}

export function rispostaContatti(mediaMd: string | null, mediaData: string | null, oggi: string): RispostaModulo {
  if (mediaMd == null) {
    return { collegato: false, righe: [], fonti: [fonte("mappa dei giornali", null, oggi, false, "il file non si legge")], nota: "Non ho letto la mappa dei giornali." };
  }
  const righe = righeMappaMedia(mediaMd);
  const f = righe.length ? fonte("mappa dei giornali", mediaData, oggi) : fonte("mappa dei giornali", mediaData, oggi, false, "non trovo le testate nel formato atteso");
  return {
    collegato: righe.length > 0,
    righe,
    fonti: [f],
    conta: righe.length || undefined,
    nota: righe.length
      ? "Per ora la rubrica ha solo i giornali: enti, creator e fornitori non sono ancora in memoria."
      : "Non riesco a leggere le testate dalla mappa dei giornali.",
  };
}
