#!/usr/bin/env node
// AR-199 — la memoria ha un contratto sul CONTENUTO e nessuno sul COSTO.
//
// Misurato il 28/7 sera, e i numeri sono peggiorati rispetto a come il difetto li aveva scritti:
//
//   STATO.md            466.594 byte   (il difetto diceva 437.764)
//   AZIONI-IN-ATTESA.md 311.250 byte   (303.680)
//   SALA-OPERATIVA.md   269.129 byte   (257.871)
//   DECISIONI.md        508.955 byte   (461.188)
//
// Cresce perché ogni giro e ogni chat appendono, e nessuno toglie. Due conseguenze misurate:
//
//   · **il giro** ha l'ordine di leggere e aggiornare STATO, AZIONI-IN-ATTESA e SALA-OPERATIVA
//     (cervello/giro.md:85, :116, :129): oltre un mega di testo prima di cominciare a ragionare;
//   · **la Cabina** manda a Nicola il corpo INTERO di STATO.md a ogni caricamento della scheda
//     (pannello/src/app/api/memoria/stato/route.ts). È lo stesso difetto dei lotti 20 e 22, su un
//     terzo file: byte spediti che nessuno guarda.
//
// E `housekeeping-azioni.mjs`, che dovrebbe alleggerire la coda, **sposta le card chiuse in fondo
// allo stesso file**: 253.414 byte su 311.250 — l'81% — stanno sotto l'intestazione «archivio» e
// viaggiano lo stesso. Spostare non è togliere.
//
// ── La garanzia, che viene prima di tutto ───────────────────────────────────
// Questo modulo NON cancella niente. Divide un file in due — quello che resta vivo e quello che va
// in `Storico/` — e `integro()` verifica che ogni riga dell'originale sia finita esattamente in uno
// dei due. Una riga persa qui è memoria persa per sempre, quindi la prova non è un dettaglio: è la
// condizione perché questo codice possa girare.
//
// Nessuna dipendenza e nessun I/O: si esegue su testo passato da fuori.

/** Quante note recenti restano nel file vivo, per file. Il resto è consultabile in Storico/. */
export const NOTE_TENUTE = {
  "STATO.md": 12,
};

/** Quante voci recenti restano nel log della squadra. */
export const VOCI_TENUTE = { "SALA-OPERATIVA.md": 300 };

/** Divide il frontmatter YAML dal corpo. Il frontmatter resta SEMPRE nel file vivo. */
export function separaFrontmatter(testo = "") {
  const m = String(testo || "").match(/^(---\n[\s\S]*?\n---\n)([\s\S]*)$/);
  return m ? { testa: m[1], corpo: m[2] } : { testa: "", corpo: String(testo || "") };
}

/**
 * Le note di STATO/SALA: blocchi che iniziano con «> » e proseguono finché la riga successiva
 * continua la citazione. Tutto il resto (i 7 numeri, il Gap, le sezioni) NON è una nota e resta vivo.
 */
/**
 * Una nota COMINCIA quando la riga citata porta il suo cappello — un'emoji e una data in grassetto,
 * come le scrive il giro: «> 🔧 **28/7 16:45 — …**». Le righe citate successive la CONTINUANO.
 *
 * Senza questa distinzione due note attaccate, senza riga vuota in mezzo, diventavano una nota sola:
 * sul file vero funzionava per caso (quasi tutte hanno una riga vuota intorno) e su tre note di
 * prova teneva tutto. Un divisore che conta 557 dove ce ne sono 560 non sbaglia di tre: sbaglia
 * regola, e prima o poi tiene vivo un pezzo di storia o ne archivia uno che serviva.
 */
const APRE_NOTA = /^>\s*\S{0,4}\s*\*\*/;

export function dividiInNote(corpo = "") {
  const righe = String(corpo || "").split("\n");
  const pezzi = [];
  let corrente = null;
  for (const r of righe) {
    const eNota = /^>\s/.test(r);
    if (eNota) {
      if (corrente?.nota && !APRE_NOTA.test(r)) corrente.righe.push(r);
      else {
        if (corrente) pezzi.push(corrente);
        corrente = { nota: true, righe: [r] };
      }
    } else {
      if (corrente?.nota) {
        pezzi.push(corrente);
        corrente = null;
      }
      if (!corrente) corrente = { nota: false, righe: [] };
      corrente.righe.push(r);
    }
  }
  if (corrente) pezzi.push(corrente);
  return pezzi;
}

/**
 * Divide uno snapshot (STATO, SALA) in vivo + storico: restano le `tieni` note più recenti — cioè
 * le PRIME, perché in questi file il nuovo si scrive in cima — e tutto ciò che non è una nota.
 */
export function splittaSnapshot(testo = "", { tieni = 12 } = {}) {
  const { testa, corpo } = separaFrontmatter(testo);
  const pezzi = dividiInNote(corpo);
  let viste = 0;
  const vivo = [];
  const storico = [];
  for (const p of pezzi) {
    if (!p.nota) { vivo.push(p); continue; }
    viste += 1;
    (viste <= tieni ? vivo : storico).push(p);
  }
  const rendi = (arr) => arr.map((p) => p.righe.join("\n")).join("\n");
  return { testa, vivo: rendi(vivo), storico: rendi(storico), noteTotali: viste, noteTenute: Math.min(viste, tieni) };
}

/**
 * SALA-OPERATIVA non è fatta di note come STATO: è un **log append-only**, una riga per messaggio
 * («AAAA-MM-GG HH:MM · @reparto · TIPO · testo»), e il nuovo si aggiunge IN FONDO. Quindi qui le
 * righe recenti sono le ultime, non le prime — il contrario di STATO.
 *
 * L'ho scoperto misurando: il divisore delle note su SALA dava «0% in meno», perché di blocchi «> »
 * ce n'è uno solo, l'istruzione in cima. Un metro che non guarda la forma del file misura zero e
 * sembra dire «qui va tutto bene».
 */
export function splittaLog(testo = "", { tieni = 300 } = {}) {
  const { testa, corpo } = separaFrontmatter(testo);
  const righe = corpo.split("\n");
  // L'intestazione = tutto fino all'ultima riga non-voce prima del primo blocco di voci datate.
  const eVoce = (r) => /^[-*]?\s*`?\d{4}-\d{2}-\d{2}\s/.test(r);
  const prima = righe.findIndex(eVoce);
  if (prima < 0) return { testa, vivo: corpo, storico: "", vociTotali: 0, vociTenute: 0 };
  const intestazione = righe.slice(0, prima);
  const voci = righe.slice(prima);
  const indici = voci.map((r, i) => (eVoce(r) ? i : -1)).filter((i) => i >= 0);
  if (indici.length <= tieni) {
    return { testa, vivo: corpo, storico: "", vociTotali: indici.length, vociTenute: indici.length };
  }
  const taglio = indici[indici.length - tieni];
  return {
    testa,
    vivo: [...intestazione, ...voci.slice(taglio)].join("\n"),
    storico: voci.slice(0, taglio).join("\n"),
    vociTotali: indici.length,
    vociTenute: tieni,
  };
}

/** L'intestazione con cui `housekeeping-azioni` marca l'archivio dentro AZIONI-IN-ATTESA.md. */
const RE_ARCHIVIO = /^#+\s*.*[Aa]rchivio.*$/m;

/**
 * Divide la coda: sopra l'intestazione «archivio» resta vivo, da lì in giù va in Storico/.
 * Se l'intestazione non c'è, non si tocca niente — meglio un file grosso che un file mutilato.
 */
export function splittaCoda(testo = "") {
  const t = String(testo || "");
  const m = t.match(RE_ARCHIVIO);
  if (!m || m.index == null) return { testa: "", vivo: t, storico: "", trovato: false };
  return { testa: "", vivo: t.slice(0, m.index), storico: t.slice(m.index), trovato: true };
}

/**
 * LA GARANZIA. Ogni riga non vuota dell'originale deve stare in `vivo` oppure in `storico`, e in uno
 * solo dei due. Torna l'elenco delle righe perse e di quelle duplicate: entrambe le liste devono
 * essere vuote perché lo spostamento sia lecito.
 *
 * Si confrontano MULTINSIEMI di righe, non stringhe intere: fra vivo e storico si aggiungono
 * intestazioni, e una riga può ripetersi legittimamente nel file (i separatori `---`).
 */
export function integro(originale = "", vivo = "", storico = "") {
  const conta = (s) => {
    const m = new Map();
    for (const r of String(s || "").split("\n")) {
      const k = r.trim();
      if (!k) continue;
      m.set(k, (m.get(k) || 0) + 1);
    }
    return m;
  };
  const a = conta(originale);
  const b = conta(vivo);
  const c = conta(storico);
  const perse = [];
  const duplicate = [];
  for (const [riga, n] of a) {
    const dopo = (b.get(riga) || 0) + (c.get(riga) || 0);
    if (dopo < n) perse.push({ riga: riga.slice(0, 80), prima: n, dopo });
    else if (dopo > n) duplicate.push({ riga: riga.slice(0, 80), prima: n, dopo });
  }
  return { ok: perse.length === 0 && duplicate.length === 0, perse, duplicate };
}

/** Il nome del file di storico per un mese: `Storico/STATO-2026-07.md`. */
export function nomeStorico(nomeFile, meseIso) {
  return `Storico/${String(nomeFile).replace(/\.md$/, "")}-${meseIso}.md`;
}
