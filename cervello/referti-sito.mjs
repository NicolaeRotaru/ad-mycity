// 🏪 I REFERTI DEL SITO — quali audit del marketplace entrano nella casa dei difetti, e come.
//
// ─────────────────────────────────────────────────────────────────────────────
// LA MALATTIA CHE QUESTO FILE CURA: «un referto che nessuno legge diventa uno zero»
// ─────────────────────────────────────────────────────────────────────────────
// Il 22/8/2026, alle 19:40, la Cabina diceva **0 problemi aperti sul sito**. Negli stessi minuti in
// `consegne/design/2026-08-22-radiografia-design-raw.json` c'erano **208 problemi verificati** — 2
// bloccanti, 86 gravi, 120 minori — e due dei bloccanti impedivano a QUALUNQUE negoziante di
// caricare la foto di copertina della sua vetrina.
//
// Nessuno mentiva. `radiografia-marketplace-digest.mjs` sceglieva i referti per **un suffisso solo**
// (`-radiografia-marketplace-raw.json`) in **una cartella sola** (`consegne/audit`). La radiografia
// del design scrive un altro suffisso in un'altra cartella, quindi il digest non la vedeva; e non
// vederla non e' un errore, e' uno zero. Cercato in tutto il repo il 22/8: **nessuno** leggeva quel
// file — ne' il digest, ne' i conti, ne' il Pannello, ne' il cantiere.
//
// LE DUE REGOLE CHE RENDONO LO ZERO IMPOSSIBILE, e sono il cuore di questo modulo:
//   ① **le fonti sono un elenco dichiarato, non un suffisso scritto dentro a un `filter`.** Un
//      referto grezzo che sta in `consegne/` e non corrisponde a nessuna fonte non viene ignorato:
//      finisce in `fonti_non_lette`, e i conti si rifiutano di dare un numero finche' resta li'.
//      Cioe' la prossima famiglia di audit che nasce fara' diventare la Cabina ⚪, non verde.
//   ② **la casa ha memoria.** Il digest ricostruiva l'elenco da zero e riscriveva `stato: "aperto"`
//      su tutto: rilanciarlo il 22/8 riportava ad «aperti» i 199 problemi riparati quel giorno
//      (misurato, non dedotto). Qui i problemi si fondono con quelli gia' in casa per CHIAVE, e lo
//      stato scritto dalle riparazioni sopravvive al rifacimento del referto.
//
// 🟢 Modulo PURO: nessun file, nessuna rete, nessun orologio. Il disco lo tocca chi lo chiama, e gli
// passa gli elenchi — cosi' una prova puo' ESEGUIRE queste decisioni sui referti veri.

// ═══════════════════════════════════════════════════════════════════════════
// ① LE FONTI — l'elenco dichiarato degli audit che parlano del sito
// ═══════════════════════════════════════════════════════════════════════════

/** I nomi leggibili delle 13 dimensioni della radiografia profonda del sito. */
export const REPARTI_MARKETPLACE = Object.freeze({
  architettura: "Architettura",
  "sicurezza-auth": "Sicurezza e accessi",
  "rls-database": "Permessi sul database",
  "pagamenti-stripe": "Pagamenti",
  "privacy-legale": "Privacy e legale",
  performance: "Velocita'",
  "frontend-ux": "Interfaccia",
  accessibilita: "Accessibilita'",
  "qa-flussi": "Flussi critici",
  "api-backend": "API",
  "ai-endpoints": "Endpoint AI",
  "dati-analytics": "Dati e analitica",
  "deploy-sre": "Rilascio e affidabilita'",
});

/** I nomi leggibili delle 11 dimensioni della radiografia del design. */
export const REPARTI_DESIGN = Object.freeze({
  "layout-responsive": "Layout e schermi",
  "coerenza-brand": "Coerenza del marchio",
  tipografia: "Tipografia",
  "accessibilita-visiva": "Accessibilita' visiva",
  "stati-ui": "Stati dell'interfaccia",
  "immagini-media": "Immagini e media",
  "mobile-pwa": "Mobile e app",
  "flussi-conversione": "Flussi di conversione",
  microcopy: "Microcopy",
  "navigazione-gerarchia": "Navigazione",
  "performance-percepita": "Velocita' percepita",
});

/**
 * Le famiglie di audit che descrivono il SITO. Ogni voce dice dove guardare, come si chiama il file
 * e con che nomi leggibili tradurre le sue dimensioni.
 *
 * Aggiungere una famiglia qui e' l'unico modo di farla entrare nel conto — ed e' anche l'unico modo
 * di far smettere di lampeggiare `fonti_non_lette`. Le due cose sono legate apposta: finche' una
 * famiglia non e' dichiarata, la Cabina non deve poter dire un numero.
 */
export const FONTI_SITO = Object.freeze([
  Object.freeze({
    id: "marketplace",
    nome: "Radiografia del sito",
    cartella: "consegne/audit",
    suffisso: "-radiografia-marketplace-raw.json",
    reparti: REPARTI_MARKETPLACE,
    reportDi: (data) => `consegne/audit/${data}-radiografia.md`,
  }),
  Object.freeze({
    id: "design",
    nome: "Radiografia del design",
    cartella: "consegne/design",
    suffisso: "-radiografia-design-raw.json",
    reparti: REPARTI_DESIGN,
    reportDi: (data) => `consegne/design/${data}-radiografia-design.md`,
  }),
]);

/** Le cartelle dove si va a guardare. Derivate dalle fonti: un elenco solo da tenere aggiornato. */
export const CARTELLE_REFERTI = Object.freeze([...new Set(FONTI_SITO.map((f) => f.cartella))]);

/**
 * Cosa conta come «referto grezzo di un audit» anche quando non so di che famiglia e'.
 *
 * Serve a distinguere i due silenzi: un `.md` o un `.json` qualsiasi in `consegne/` non e' un
 * referto e non deve far lampeggiare niente; un `*-raw.json` che nessuna fonte riconosce SI', ed e'
 * esattamente il caso del 22/8 — un audit intero fatto, salvato, e mai letto da nessuno.
 */
export const CODA_REFERTO_GREZZO = "-raw.json";

/**
 * I referti grezzi che stanno nelle stesse cartelle ma NON parlano del sito.
 *
 * Un'esenzione senza il perche' scritto e' un silenzio, ed e' la cosa che stiamo curando: qui ogni
 * voce dice in quale altra casa vive quel referto. Senza questo elenco il guardiano dei referti non
 * letti suonerebbe per sempre su un file che non deve leggere — e un allarme che si impara a
 * ignorare e' peggio di nessun allarme.
 */
export const REFERTI_DI_ALTRI = Object.freeze([
  Object.freeze({
    suffisso: "-auto-radiografia-raw.json",
    casa: "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-radiografia.json + cantiere-difetti.json",
    perche:
      "e' la radiografia della MACCHINA, non del sito: i suoi difetti vivono nel cantiere di auto-coscienza (AR-xxx), " +
      "non fra i problemi del marketplace",
  }),
]);

/** Questo referto e' di un'altra casa? Torna l'esenzione (col perche'), o `null`. */
export function referoDiAltri(nome) {
  return REFERTI_DI_ALTRI.find((e) => String(nome ?? "").endsWith(e.suffisso)) ?? null;
}

/** La fonte di un file, dal suo nome. `null` se e' un referto grezzo che non so a chi appartiene. */
export function fonteDiFile(nome) {
  return FONTI_SITO.find((f) => String(nome ?? "").endsWith(f.suffisso)) ?? null;
}

/** La data scritta in testa al nome del file (AAAA-MM-GG). `null` se non c'e'. */
export function dataDiFile(nome) {
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(String(nome ?? ""));
  return m ? m[1] : null;
}

/**
 * I referti grezzi trovati, ognuno con la sua fonte (o senza).
 *
 * @param elenchi [{cartella, nomi: string[]}] — cosa c'e' su disco, letto da chi mi chiama
 */
export function refertiDaElenco(elenchi) {
  const out = [];
  for (const { cartella, nomi } of elenchi ?? []) {
    for (const nome of nomi ?? []) {
      if (!String(nome).endsWith(CODA_REFERTO_GREZZO)) continue;
      const fonte = fonteDiFile(nome);
      const altrui = fonte ? null : referoDiAltri(nome);
      out.push({
        file: `${cartella}/${nome}`,
        cartella,
        nome,
        data: dataDiFile(nome),
        fonte_id: fonte?.id ?? null,
        di_altri: altrui ? altrui.casa : null,
      });
    }
  }
  // Il nome inizia con la data, quindi l'ordine alfabetico e' cronologico.
  return out.sort((a, b) => (a.nome < b.nome ? -1 : a.nome > b.nome ? 1 : 0));
}

/** L'ultimo referto di ogni fonte riconosciuta, per id. Le fonti senza referti non compaiono. */
export function ultimiPerFonte(referti) {
  const per = new Map();
  for (const r of referti ?? []) {
    if (!r?.fonte_id) continue;
    per.set(r.fonte_id, r); // l'elenco e' cronologico: l'ultimo scritto vince
  }
  return per;
}

/**
 * I referti che nessuna fonte sa leggere — la lista che impedisce alla Cabina di dire uno zero.
 * Ognuno porta il PERCHE', perche' «non letto» senza il motivo si legge come «non importante».
 */
export function refertiNonLetti(referti) {
  return (referti ?? [])
    // Gli estranei dichiarati non contano: hanno gia' la loro casa, scritta in REFERTI_DI_ALTRI.
    .filter((r) => r && !r.fonte_id && !r.di_altri)
    .map((r) => ({
      file: r.file,
      perche:
        "e' un referto grezzo di un audit che non corrisponde a nessuna fonte dichiarata in " +
        "cervello/referti-sito.mjs: i suoi problemi non entrano nel conto del sito, e un non-letto non e' uno zero",
    }));
}

// ═══════════════════════════════════════════════════════════════════════════
// ② I PROBLEMI — le due forme con cui i workflow scrivono, normalizzate in una
// ═══════════════════════════════════════════════════════════════════════════

/**
 * I problemi grezzi di un referto, da qualunque forma arrivi.
 *
 * · workflow `radiografia`  → `{ result: [{dimensione, findings: []}] }`
 * · workflow `audit-design` → `{ problemi: [...] }` piatto, piu' `dimensioni[]` coi doppioni
 *
 * Torna `null` — non `[]` — quando non riconosce nessuna delle due: e' la stessa legge dei conti,
 * una forma che non so leggere non e' una lista vuota.
 */
export function grezziDaRaw(raw) {
  if (Array.isArray(raw?.problemi) && raw.problemi.filter(Boolean).length) {
    return raw.problemi.filter(Boolean);
  }
  const daResult = [];
  const dimensioni = Array.isArray(raw?.result) ? raw.result : Array.isArray(raw?.dimensioni) ? raw.dimensioni : null;
  if (dimensioni) {
    for (const d of dimensioni) {
      if (!Array.isArray(d?.findings)) continue;
      for (const f of d.findings) if (f) daResult.push({ ...f, dimensione: f.dimensione ?? d.dimensione ?? d.chiave ?? null });
    }
  }
  return daResult.length ? daResult : null;
}

/**
 * I problemi di un referto nella forma VIVA della casa: un elenco unico, ogni voce con la sua
 * dimensione, il suo reparto leggibile e la fonte da cui viene.
 *
 * `fonte` sulla voce non e' decorazione: e' cio' che permette di rifare UNA sola famiglia senza
 * toccare le altre, e a Nicola di sapere se un difetto viene dall'audit del codice o da quello del
 * design senza aprire due pagine.
 */
export function problemiDaRaw(raw, fonte) {
  const grezzi = grezziDaRaw(raw);
  if (grezzi == null) return null;
  return grezzi.map((f) => {
    const chiave = String(f.dimensione ?? "").trim() || "senza-nome";
    return {
      dimensione: chiave,
      reparto: fonte?.reparti?.[chiave] || chiave,
      titolo: f.titolo || "",
      severita: f.severita || "minore",
      // I due workflow chiamano il punto del codice in due modi. Uno solo arriva alla scheda.
      file: f.file || f.dove || "",
      descrizione: f.descrizione || "",
      impatto: f.impatto || "",
      fix: f.fix || "",
      fonte: fonte?.id ?? null,
      stato: "aperto",
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// ③ LA MEMORIA DELLA CASA — rifare il referto non cancella le riparazioni
// ═══════════════════════════════════════════════════════════════════════════

/**
 * L'identita' di un problema fra due versioni del referto: dimensione + titolo, normalizzati.
 *
 * Non l'indice (l'ordine cambia a ogni radiografia), non il file (il fix lo sposta), non la
 * descrizione (viene riscritta a ogni verifica). Misurato il 22/8 sui referti veri: 199 + 208
 * problemi, **407 chiavi tutte diverse**, zero collisioni anche fra le due famiglie.
 */
export function chiaveProblema(p) {
  const norm = (v) => String(v ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  return `${norm(p?.dimensione)}|${norm(p?.titolo)}`;
}

/** I campi che appartengono alla RIPARAZIONE, non al referto: sono quelli che devono sopravvivere. */
export const CAMPI_DELLA_RIPARAZIONE = Object.freeze([
  "stato",
  "nota_riparazione",
  "chiuso_il",
  "chiuso_da",
  "riaperto_il",
  "riaperto_da",
]);

/**
 * Fonde i problemi appena letti dai referti con quelli GIA' in casa.
 *
 * Il referto e' la verita' sul PROBLEMA (titolo, gravita', descrizione, dove): quella si riscrive.
 * La casa e' la verita' sul LAVORO fatto sopra (stato, note, chi e quando l'ha chiuso): quella si
 * conserva. Prima di questa funzione il digest riscriveva `stato: "aperto"` su tutto — cioe' un
 * comando di manutenzione, quello che il messaggio d'errore del Pannello suggerisce di lanciare,
 * cancellava in silenzio 199 riparazioni.
 *
 * I problemi che stanno in casa e non stanno piu' in nessun referto NON si buttano: restano, con
 * `fuori_dal_referto: true`. Sparire e' l'altro modo di far calare un numero senza aver riparato
 * niente.
 */
export function fondiConLaCasa(nuovi, vecchi) {
  const perChiave = new Map();
  for (const v of vecchi ?? []) if (v) perChiave.set(chiaveProblema(v), v);

  const fusi = [];
  const usate = new Set();
  let conservati = 0;

  for (const n of nuovi ?? []) {
    const k = chiaveProblema(n);
    const vecchio = perChiave.get(k);
    if (!vecchio) {
      fusi.push(n);
      continue;
    }
    usate.add(k);
    const voce = { ...n };
    for (const campo of CAMPI_DELLA_RIPARAZIONE) {
      if (vecchio[campo] != null) voce[campo] = vecchio[campo];
    }
    if (voce.stato !== n.stato) conservati += 1;
    fusi.push(voce);
  }

  const orfani = [];
  for (const [k, v] of perChiave) {
    if (usate.has(k)) continue;
    orfani.push({ ...v, fuori_dal_referto: true });
  }

  return { problemi: [...fusi, ...orfani], conservati, orfani: orfani.length };
}

/** I contatori di una famiglia di problemi, nella forma che la scheda del Pannello disegna. */
export function dimensioniDaProblemi(problemi, fonte) {
  const ordine = [];
  const per = new Map();
  for (const p of problemi ?? []) {
    const k = String(p?.dimensione ?? "").trim() || "senza-nome";
    if (!per.has(k)) {
      per.set(k, { chiave: k, nome: fonte?.reparti?.[k] || k, fonte: fonte?.id ?? null, totale: 0, bloccanti: 0, gravi: 0, minori: 0 });
      ordine.push(k);
    }
    const v = per.get(k);
    v.totale += 1;
    if (p.severita === "bloccante") v.bloccanti += 1;
    else if (p.severita === "grave") v.gravi += 1;
    else if (p.severita === "minore") v.minori += 1;
  }
  return ordine.map((k) => per.get(k));
}
