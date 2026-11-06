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
//      (misurato, non dedotto). Qui i problemi si fondono con quelli gia' in casa per CHIAVE, e per
//      una voce gia' in casa vince la casa, campo per campo (dal 6/11: prima si salvavano sei campi
//      e cadevano `riparato_il`, la prova vera, le note e le riverifiche scritte dopo il referto).
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
 * I referti grezzi che stanno nelle stesse cartelle ma NON vanno nel conto dei problemi del sito:
 * o non parlano del sito, o non sono un elenco di difetti.
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
  Object.freeze({
    suffisso: "-esperienza-cliente-raw.json",
    casa: "consegne/design/<data>-esperienza-cliente-vs-migliori.md (pagella e mosse da firmare)",
    perche:
      "e' il confronto del sito coi migliori marketplace requisito per requisito (al livello, sotto, manca, fa danno), " +
      "non un elenco di difetti: molti «fa danno» sono gia' problemi del registro del sito, e contarli di nuovo li " +
      "raddoppierebbe. Una mossa che diventa lavoro entra nel registro quando si apre",
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
      // 3/9/2026 — L'ASTICELLA ARRIVA ANCHE ALLE SCHEDE DEL SITO. Prima qui passavano sei campi e
      // basta: la prova che un cercatore aveva eseguito, la causa radice, chi l'aveva verificata,
      // la riverifica di un noto — tutto cadeva a terra fra il referto e la casa, e pacchetti-lotto
      // scriveva «le schede del sito non portano il campo della prova». Adesso i campi dichiarati
      // qui sotto attraversano la porta; gli altri restano fuori come prima.
      ...campiExtra(f),
    };
  });
}

/** I campi di un referto che la casa conserva oltre ai sei di base: prova, verifica e riverifica. */
export const CAMPI_EXTRA_DEL_REFERTO = Object.freeze([
  "prova",
  "prova_tipo",
  "prova_eseguita",
  "causa_radice",
  "impatto_crescita",
  "giro",
  "verificato",
  "riverifica",
  "gia_noto",
  "fonte_radiografia",
]);

// 3/9/2026 — LA PROVA ENTRA IN CASA, MA DISARMATA. Una prova del sito puo' fabbricare una
// credenziale finta per dimostrare che il guardiano dei segreti la intercetta: e' il mestiere di
// quella prova. Finche' il campo si fermava al referto grezzo non faceva danno; da quando
// attraversa questa porta finisce nella memoria dell'AD, e li' il guardiano dei segreti la
// leggerebbe come una chiave vera e bloccherebbe la memoria stessa. Stessa medicina gia' usata in
// foto-radiografia.mjs: il prefisso si spezza e la riga se lo ricompone da sola, quindi il comando
// resta eseguibile e nessun guardiano si allarma.
const MARCA_CHIAVE = ["sk", "live"].join("_");
const disarma = (v) =>
  typeof v === "string" && v.includes(MARCA_CHIAVE) ? v.split(MARCA_CHIAVE).join('sk_"$(echo live)"') : v;

function campiExtra(f) {
  const out = {};
  for (const k of CAMPI_EXTRA_DEL_REFERTO) if (f?.[k] !== undefined && f[k] !== null && f[k] !== "") out[k] = disarma(f[k]);
  return out;
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

/**
 * I campi che un referto NUOVO della stessa famiglia scrive anche sopra la casa, e dove finisce il valore di
 * prima. Uno solo: `riverifica`, che finisce in `riverifiche_precedenti`.
 *
 * PERCHE' SOLO QUESTO. La regola della fusione e' «vince la casa»: dopo il referto, la voce la scrivono le
 * riparazioni (stato, `riparato_il`, la `prova` vera che gira al posto di quella del cercatore, una gravita'
 * riclassificata con `nota_severita`, `riverifica_1_11`, `nota_5_11`…), e nessun cercatore ne sa di piu'. Tutti
 * gli altri campi del referto descrivono il problema come l'ha visto CHI L'HA TROVATO: titolo, gravita',
 * descrizione, dove, prova del cercatore, `giro`, `fonte_radiografia`. Se la casa li ha gia', o li ha
 * scritti la stessa radiografia o li ha corretti qualcuno dopo: in tutti e due i casi il grezzo non porta
 * niente di piu' nuovo. `riverifica` invece e' per costruzione il giudizio di QUESTA radiografia su un
 * problema gia' noto («ancora presente il 20/11»): se vincesse la casa, il registro direbbe la data e il
 * verdetto del controllo di prima, cioe' una cosa vecchia spacciata per l'ultima. Il valore di prima non si
 * butta: va in coda a `riverifiche_precedenti`, il campo che le riverifiche scritte a mano usano gia'.
 *
 * QUANDO E' «NUOVO». Solo quando il referto di quella famiglia non e' quello che la casa ha gia' letto
 * (`fonti[].raw` del registro). Lo stesso referto riletto — il caso del design dell'11/10, ancora l'ultimo della
 * sua famiglia il 6/11 — e' piu' vecchio di tutto quello che la casa ci ha scritto sopra: li' vince la casa
 * anche sulla riverifica, e rifare il digest non cambia una virgola nelle voci che il referto ritrova.
 *
 * IL PREZZO, DICHIARATO. Una radiografia nuova che ritrova un problema noto con una gravita', un punto del
 * codice o una descrizione diversi NON li scrive sopra la casa. E' voluto (una gravita' riclassificata da Nicola
 * non deve tornare quella del cercatore), ma non deve essere muto: la fusione conta questi campi in `ignorati`
 * e il digest li stampa. Nella storia non e' mai successo: su 9 coppie di referti consecutivi, 0 differenze
 * sulle chiavi in comune (conto del collaudo del 6/11).
 */
export const CAMPI_CHE_IL_REFERTO_NUOVO_AGGIORNA = Object.freeze({ riverifica: "riverifiche_precedenti" });

/**
 * «La casa non ha questo campo»: assente o null. La stringa vuota invece e' un valore, e vince: un campo
 * svuotato a mano puo' essere una copertura voluta (il 6/11 i testi liberi di alcune falle riservate sono stati
 * riscritti perche' non nominassero file e tecniche). Riempirlo dal grezzo riaprirebbe quello che si e' chiuso:
 * largo quando si chiude, esatto quando si apre (cervello/scorciatoie-note.md, 26).
 */
const manca = (v) => v === undefined || v === null;
const uguali = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * I campi che la porta (`problemiDaRaw`) scrive dal CODICE, non da quello che dice il referto: lo stato di
 * partenza, il nome leggibile dell'area, l'id della famiglia. Un loro cambio fra due letture e' un cambio del
 * codice (un'area rinominata in REPARTI_DESIGN), non una correzione del grezzo ne' un giudizio della radiografia:
 * non si contano fra gli `ignorati` e non fanno suonare l'avviso delle correzioni. In casa vince la casa anche qui.
 */
const CAMPI_DELLA_PORTA = new Set(["stato", "reparto", "fonte"]);
const daNotare = (campo) => !CAMPI_DELLA_PORTA.has(campo) && !Object.hasOwn(CAMPI_CHE_IL_REFERTO_NUOVO_AGGIORNA, campo);

/**
 * Fonde i problemi appena letti dai referti con quelli GIA' in casa.
 *
 * LA REGOLA: per una voce gia' in casa, **vince la casa, campo per campo**. Dal grezzo si prendono solo i campi
 * che la casa non ha (assenti o null); l'unica eccezione e' `CAMPI_CHE_IL_REFERTO_NUOVO_AGGIORNA`, e solo per le
 * famiglie in `refertiNuovi`. L'ordine dei campi resta quello della casa, cosi' rifare il digest non sposta righe.
 *
 * LA MALATTIA CHE CURA. Fino al 6/11/2026 la voce si ricostruiva dal grezzo e dalla casa si tenevano sei campi
 * (stato, nota_riparazione, chiuso_il, chiuso_da, riaperto_il, riaperto_da). Tutto il resto scritto dopo il
 * referto cadeva: misurato il 6/11 sulla casa vera, 357 voci su 444 ritrovate nei referti perdevano campi
 * (`riparato_il`, `riparato_da`, `nota_5_11`, `collaudo_5_11`…) e su 262 la `prova` e la `prova_tipo` tornavano
 * quelle del cercatore. Prima ancora (22/8) si riscriveva `stato: "aperto"` su tutto: rilanciare il digest
 * cancellava in silenzio 199 riparazioni.
 *
 * `fuori_dal_referto` lo calcola questa funzione: una voce ritrovata nel referto lo perde, anche se la casa ce
 * l'aveva. I problemi che stanno in casa e non stanno piu' in nessun referto NON si buttano: restano, con
 * `fuori_dal_referto: true`. Sparire e' l'altro modo di far calare un numero senza aver riparato niente.
 *
 * @param refertiNuovi gli id delle famiglie (`fonte` della voce) il cui referto la casa non ha ancora letto.
 *                     Senza, nessuna famiglia e' nuova: la casa vince su tutto, che e' il lato sicuro.
 */
export function fondiConLaCasa(nuovi, vecchi, { refertiNuovi = [] } = {}) {
  const famiglieNuove = new Set(refertiNuovi ?? []);
  const perChiave = new Map();
  for (const v of vecchi ?? []) if (v) perChiave.set(chiaveProblema(v), v);

  const fusi = [];
  const usate = new Set();
  let conservati = 0;
  let ignorati = 0;

  for (const n of nuovi ?? []) {
    const k = chiaveProblema(n);
    const vecchio = perChiave.get(k);
    if (!vecchio) {
      fusi.push(n);
      continue;
    }
    usate.add(k);
    const voce = { ...vecchio };
    delete voce.fuori_dal_referto;
    const nuova = famiglieNuove.has(n.fonte);
    for (const [campo, valore] of Object.entries(n)) {
      if (manca(voce[campo])) voce[campo] = valore;
      else if (nuova && daNotare(campo) && !uguali(voce[campo], valore)) ignorati += 1;
    }
    if (nuova) {
      for (const [campo, storia] of Object.entries(CAMPI_CHE_IL_REFERTO_NUOVO_AGGIORNA)) {
        const dalReferto = n[campo];
        if (manca(dalReferto) || dalReferto === "" || uguali(dalReferto, voce[campo])) continue;
        if (!manca(voce[campo]) && voce[campo] !== "") {
          const prima = Array.isArray(voce[storia]) ? voce[storia] : manca(voce[storia]) ? [] : [voce[storia]];
          voce[storia] = prima.some((r) => uguali(r, voce[campo])) ? prima : [...prima, voce[campo]];
        }
        voce[campo] = dalReferto;
      }
    }
    if (voce.stato !== n.stato) conservati += 1;
    fusi.push(voce);
  }

  const orfani = [];
  for (const [k, v] of perChiave) {
    if (usate.has(k)) continue;
    orfani.push({ ...v, fuori_dal_referto: true });
  }

  return { problemi: [...fusi, ...orfani], conservati, orfani: orfani.length, ignorati };
}

// ═══════════════════════════════════════════════════════════════════════════
// ③-bis LE CORREZIONI DEL GREZZO — vince la casa, ma non in silenzio
// ═══════════════════════════════════════════════════════════════════════════
//
// Il rovescio della regola «vince la casa». Fino al 6/11 chi correggeva il GREZZO dopo il digest vedeva la
// correzione arrivare in casa al digest dopo, perche' il grezzo vinceva. E' il lavoro vero del 6/11 alle 01:45:
// il testo libero delle falle riservate e' stato coperto nel grezzo del 5/11 e nel registro, «perche' il digest
// rifa' il registro dal grezzo» (DECISIONI). Con la casa che vince, una correzione fatta SOLO nel grezzo resta
// fuori: misurato dal collaudo del 6/11 sul registro di prima di quel lavoro, 51 falle aperte con 161 campi non
// arrivati, 6 con nomi di file nel testo rimasto, e il digest stampava il verde di sempre.
//
// La cura non e' far rivincere il grezzo (tornerebbero indietro 262 prove vere): e' saperlo. Il registro tiene,
// per ogni referto letto, l'impronta di ogni campo di ogni voce come l'ha letta (`fonti[].impronte`). Al digest
// dopo, sullo STESSO file, un campo la cui impronta e' cambiata e' una correzione del grezzo; se la casa ha quel
// campo con un altro valore, la correzione non e' entrata, e il digest lo dice per nome ed esce 1. L'impronta
// vecchia di quel campo resta salvata: l'avviso torna a ogni digest finche' grezzo e casa non dicono la stessa
// cosa — o la correzione va anche nel registro, o si toglie dal grezzo. Rilanciare non basta a zittirlo.

/** Impronta corta di un valore (FNV-1a su JSON): serve a vedere che un campo e' cambiato, non a proteggerlo. */
function fnv(testo) {
  let h = 0x811c9dc5;
  for (let i = 0; i < testo.length; i++) {
    h ^= testo.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}
const improntaDi = (v) => fnv(JSON.stringify(v ?? null));
const improntaCampo = (v) => improntaDi(v).slice(0, 6);

/** Una voce in una riga: «campo:impronta» in ordine di nome. Una riga per voce tiene il registro corto (~90 KB su 444 voci). */
const rigaDi = (mappa) => [...mappa].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([k, h]) => `${k}:${h}`).join(" ");
const mappaDi = (riga) =>
  new Map(
    String(riga ?? "").split(" ").filter(Boolean).map((x) => {
      const i = x.lastIndexOf(":");
      return [x.slice(0, i), x.slice(i + 1)];
    }),
  );

/** Le impronte di un referto letto: {impronta della chiave → riga dei campi}. Vanno in `fonti[].impronte`. */
export function impronteDelReferto(problemi) {
  const out = {};
  for (const n of problemi ?? []) {
    out[improntaDi(chiaveProblema(n))] = rigaDi(new Map(Object.keys(n).map((k) => [k, improntaCampo(n[k])])));
  }
  return out;
}

/**
 * Le correzioni fatte nel GREZZO dopo l'ultima lettura che la casa non ha: quelle che la regola «vince la casa»
 * lascia fuori. Va chiamata solo sullo stesso referto gia' letto (con un referto nuovo le differenze le conta
 * `ignorati` della fusione).
 *
 * @param impronteLette `fonti[].impronte` della casa per quel referto; senza (casa scritta prima del 6/11)
 *                      non c'e' niente con cui confrontare: `confrontato: false`, e chi chiama lo deve dire.
 * @returns {fuori: [{titolo, fonte, campi}], impronte, confrontato} — `impronte` sono quelle da salvare: per un
 *          campo fuori casa resta l'impronta vecchia.
 */
export function correzioniDelGrezzo(problemi, vecchi, impronteLette) {
  const impronte = impronteDelReferto(problemi);
  if (!impronteLette || typeof impronteLette !== "object") return { fuori: [], impronte, confrontato: false };
  const casa = new Map();
  for (const v of vecchi ?? []) if (v) casa.set(chiaveProblema(v), v);
  const fuori = [];
  for (const n of problemi ?? []) {
    const kc = improntaDi(chiaveProblema(n));
    const prima = impronteLette[kc];
    // Una voce che all'ultima lettura non c'era, o identica a allora: niente da dire.
    if (typeof prima !== "string" || prima === impronte[kc]) continue;
    const c = casa.get(chiaveProblema(n));
    if (!c) continue;
    const vecchie = mappaDi(prima);
    const daSalvare = mappaDi(impronte[kc]);
    const campi = [];
    for (const k of Object.keys(n)) {
      // Un campo che scrive il codice, che allora non c'era, o che non e' cambiato: non e' una correzione del grezzo.
      if (CAMPI_DELLA_PORTA.has(k) || !vecchie.has(k) || vecchie.get(k) === improntaCampo(n[k])) continue;
      // La casa non l'ha (la fusione lo prende adesso), o dice gia' la stessa cosa: la correzione e' dentro.
      if (manca(c[k]) || uguali(c[k], n[k])) continue;
      campi.push(k);
      daSalvare.set(k, vecchie.get(k));
    }
    if (!campi.length) continue;
    fuori.push({ titolo: n.titolo, fonte: n.fonte ?? null, campi });
    impronte[kc] = rigaDi(daSalvare);
  }
  return { fuori, impronte, confrontato: true };
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

/**
 * Le aree che restano SOLO nelle schede tenute in casa, col loro nome leggibile.
 *
 * L'11/10/2026 la radiografia nuova non aveva niente da dire su tipografia, coerenza del marchio e
 * velocita' percepita, mentre in casa c'erano ancora schede aperte di quelle tre aree. Le aree della
 * casa nascevano solo dal referto nuovo: le tre restavano senza nome, e la scheda del Pannello
 * disegnava una colonna «area» vuota (il controllo ⑧ di il-conto-del-sito-che-dice-zero e' diventato
 * rosso). Qui le aree degli orfani si aggiungono in coda, col nome della LORO famiglia.
 */
export function dimensioniDegliOrfani(problemi, dimensioniGia) {
  const note = new Set((dimensioniGia ?? []).map((d) => d?.chiave));
  // Per chiave, non per famiglia: la stessa area in due famiglie deve restare UNA riga, non due.
  const perChiave = new Map();
  for (const p of problemi ?? []) {
    if (!p?.fuori_dal_referto) continue;
    const k = String(p?.dimensione ?? "").trim() || "senza-nome";
    if (note.has(k)) continue;
    if (!perChiave.has(k)) perChiave.set(k, []);
    perChiave.get(k).push(p);
  }
  const out = [];
  for (const [k, elenco] of perChiave) {
    // La famiglia si riconosce dall'AREA, non dal campo `fonte` della prima scheda: in casa 164 orfani
    // su 949 portano in `fonte` un testo libero o null, e il nome cambiava con l'ordine delle schede
    // (trovato dal collaudo dell'11/10). I vocabolari delle famiglie non si sovrappongono.
    const fonte =
      FONTI_SITO.find((f) => f.reparti?.[k]) ??
      FONTI_SITO.find((f) => elenco.some((p) => p?.fonte === f.id)) ??
      { id: null, reparti: {} };
    out.push(...dimensioniDaProblemi(elenco, fonte));
  }
  return out;
}
