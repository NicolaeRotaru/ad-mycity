#!/usr/bin/env node
// 🧪 AR-796 · AR-810 — IL FRENO C'ERA, MA NON SULLA STRADA CHE PORTA ALL'ATTO.
//
// Due difetti, un file, e il caso di ciascuno sta scritto a parte: AR-796 nelle sezioni ①②③④,
// AR-810 dentro la ④ — perché montare il freno sulla terza strada ha voluto dire percorrerla, e
// percorrendola è esplosa. Sono lo stesso lavoro visto da due lati, non una prova sola prestata a
// due schede.
//
// ── Il difetto ────────────────────────────────────────────────────────────────────────────────
// Due cancelli sulle prove esistevano da due lotti in `cervello/prova-ammissibile.mjs`: una prova
// che poggia su un file inesistente non chiude (prova orfana), e una prova a pattern non chiude un
// difetto bloccante o ad alto impatto (prova debole su grave). Erano scritti bene e li chiamava una
// cosa sola: `cantiere-prove.mjs`, che è il REFERTO — guarda e racconta, non ferma. Il file lo
// dichiarava da sé: «QUESTO GUARDIANO NON CHIUDE NIENTE: chi chiude è auto-fix.mjs, e non passa
// ancora di qui». Chi chiude davvero, `auto-fix.mjs`, non nominava nessuna delle due funzioni —
// zero occorrenze col grep, il 23/8/2026.
//
// È la forma esatta di AR-172: la porta a mano riparata e quella automatica lasciata aperta. Un
// cancello che nessuno attraversa non è severo, è decorativo — e la sua esistenza fa credere che
// il passaggio sia sorvegliato.
//
// ── Perché una prova sulla sola funzione pura NON basterebbe ─────────────────────────────────
// `ammissibilitaProva` funzionava già, e una prova che la esamina sarebbe stata verde anche IERI,
// col difetto in piena salute. La domanda vera non è «il cancello sa giudicare?» ma «il chiuditore
// ci passa?». Perciò la parte che morde qui sotto fa girare `auto-fix.mjs` per davvero, su un
// registro finto, e guarda cosa chiude.
//
// ── Il caso che morde ─────────────────────────────────────────────────────────────────────────
// Due schede finte IDENTICHE — stessa prova a pattern, soddisfatta adesso, nessuna data di nascita
// (così la guardia AR-330 non c'entra e non può prendersi il merito del rifiuto). L'unica
// differenza è la gravità: una `bloccante`, una `minore`. La bloccante NON deve chiudersi, la
// minore SÌ. Se il freno non è sulla strada si chiudono tutt'e due; se il freno è troppo largo non
// si chiude nessuna delle due. Solo il montaggio giusto dà 1 e 1.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { verdettoChiusura } from "../chiusura-dichiarata.mjs";
import { dovePuntaLaScheda } from "../auto-fix.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

/** Una scheda finta col minimo che serve: la prova punta a un file del repo che contiene davvero
 *  quella parola, quindi il pattern COMBACIA — cioè lo stato in cui auto-fix la chiuderebbe.
 *  Il file scelto è il cancello stesso: se un giorno sparisce, questa prova diventa rossa invece di
 *  diventare vacua, che è il verso giusto in cui deve rompersi. */
function scheda(id, extra = {}) {
  return {
    id,
    stato: "aperto",
    titolo: `scheda finta ${id}`,
    dimensione: "prova",
    gravita: "bloccante",
    impatto_crescita: "medio",
    causa_radice: "costruita per la prova",
    fix_proposto: "nessuno",
    verifica: { file: "cervello/prova-ammissibile.mjs", pattern: "ammissibilitaProva", presente: true },
    ...extra,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ① LA FUNZIONE PURA — il verdetto dice di no, e dice perché
// ═══════════════════════════════════════════════════════════════════════════════════════════

test("un bloccante con prova a pattern soddisfatta NON chiude", () => {
  const v = verdettoChiusura(scheda("AR-FINTO-BLOCCANTE"), "risolto", { fileEsiste: () => true });
  assert.equal(v.chiude, false, "un bloccante non si chiude su una parola cercata in un file");
  assert.equal(v.inammissibile, true, "il rifiuto deve dichiararsi come tale, non confondersi con «la prova non dice risolto»");
  assert.match(v.motivo, /BLOCCANTE/i, "il motivo deve nominare il peso del difetto, non solo dire di no");
});

test("un difetto ad ALTO impatto di crescita con prova a pattern NON chiude", () => {
  const d = scheda("AR-FINTO-ALTO", { gravita: "medio", impatto_crescita: "alto" });
  const v = verdettoChiusura(d, "risolto", { fileEsiste: () => true });
  assert.equal(v.chiude, false, "l'impatto alto obbliga alla prova che esegue, esattamente come il bloccante");
  assert.equal(v.inammissibile, true);
});

test("lo stesso difetto, ma MINORE, si chiude: il freno non blocca tutto", () => {
  const d = scheda("AR-FINTO-MINORE", { gravita: "minore" });
  const v = verdettoChiusura(d, "risolto", { fileEsiste: () => true });
  assert.equal(v.chiude, true, "vietare la prova a pattern ovunque congelerebbe l'84% del cantiere (AR-444)");
  assert.equal(v.debole, true, "chiude, ma la chiusura resta marcata debole: ritrovabile e rileggibile");
});

test("un bloccante con una prova che ESEGUE si chiude", () => {
  const d = scheda("AR-FINTO-COMANDO", { verifica: { comando: "node cervello/tasso-chiusura.mjs" } });
  const v = verdettoChiusura(d, "risolto", { fileEsiste: () => true });
  assert.equal(v.chiude, true, "il cancello chiede una prova comportamentale, e questa lo è");
  assert.equal(v.debole, false);
});

test("la dichiarazione umana batte anche il cancello nuovo", () => {
  const d = scheda("AR-FINTO-UMANO", { chiusura: "bloccata", chiusura_motivo: "guardato e deciso" });
  const v = verdettoChiusura(d, "risolto", { fileEsiste: () => true });
  assert.equal(v.chiude, false);
  assert.equal(v.bloccata, true, "chi ha guardato viene prima del cancello: il motivo che esce deve essere il suo");
  assert.equal(v.inammissibile, false, "un difetto dichiarato aperto non è «prova non ammessa»: sono due rifiuti diversi");
});

test("senza mondo iniettato il verdetto non INVENTA una prova orfana", () => {
  // Il default di `ammissibilitaProva` è `fileEsiste: () => false`, cioè «il file non c'è»: preso
  // così com'è marcherebbe orfana ogni prova a pattern di ogni chiamante che si dimentica di
  // iniettare il disco. Un default che inventa un difetto è peggio di uno che se ne lascia
  // sfuggire uno: qui il default dice «il file c'è» e il cancello (b) semplicemente non misura.
  const v = verdettoChiusura(scheda("AR-FINTO-DEFAULT", { gravita: "minore" }), "risolto");
  assert.equal(v.chiude, true, "senza disco iniettato non si deve dedurre che il file manchi");
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ② IL PEZZO CHE MORDE — auto-fix.mjs davvero, su un registro finto
// ═══════════════════════════════════════════════════════════════════════════════════════════

test("auto-fix passa dal cancello: chiude la minore e ferma la bloccante", () => {
  const dir = mkdtempSync(join(tmpdir(), "cantiere-finto-"));
  const registro = join(dir, "cantiere-difetti.json");
  try {
    writeFileSync(
      registro,
      JSON.stringify({
        difetti: [
          scheda("AR-FINTO-A", { gravita: "bloccante" }),
          scheda("AR-FINTO-B", { gravita: "minore" }),
        ],
      }),
      "utf8",
    );

    const r = spawnSync("node", ["cervello/auto-fix.mjs", "verifica"], {
      cwd: REPO,
      encoding: "utf8",
      env: { ...process.env, CANTIERE_FILE: registro, STORICO_FILE: join(dir, "storico-salute.json") },
      timeout: 120_000,
      maxBuffer: 1024 * 1024,
    });
    const out = `${r.stdout || ""}${r.stderr || ""}`;

    assert.match(
      out,
      /⛔ prova non ammessa\s+AR-FINTO-A/,
      `auto-fix ha lasciato passare la bloccante: il cancello non è sulla strada della chiusura.\n${out}`,
    );
    assert.doesNotMatch(
      out,
      /✅ risolto[^\n]*AR-FINTO-A/,
      `AR-FINTO-A risulta chiudibile: il freno non frena.\n${out}`,
    );
    // Il controllo, ed è la metà che tiene onesta l'altra: se il freno fosse un blocco totale
    // questa riga sarebbe rossa, e «non chiude niente» passerebbe per «cancello che funziona».
    assert.match(
      out,
      /✅ risolto[^\n]*AR-FINTO-B/,
      `auto-fix non chiude più nemmeno una scheda leggera: il freno è troppo largo.\n${out}`,
    );
    assert.match(out, /→ 1 difetto\/i risultano risolti/, `chiudibili attesi: 1 (solo la minore).\n${out}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ③ L'ALTRA PORTA — `auto-fix chiudi --id=…`, quella che usa una persona di fretta
// ═══════════════════════════════════════════════════════════════════════════════════════════
//
// Trovata al secondo giro di questo stesso lotto, e vale la pena scriverlo: avevo montato il freno
// sulla porta automatica e stavo per consegnare lasciando aperta questa. È AR-172 alla lettera —
// «la porta a mano riparata e quella automatica lasciata aperta» — col verso invertito. Il freno va
// al CONFINE DELL'ATTO, cioè su OGNI strada che arriva a scrivere `stato: "chiuso"`.
//
// Qui la porta NON si sbarra: davanti c'è una persona che ha scritto l'id a mano, e un cancello
// sempre rosso viene aggirato al secondo giro (è la lezione di AR-559, scritta in quella stessa
// funzione). Si DICHIARA: la chiusura passa e resta scritto sulla scheda che il cancello non
// l'avrebbe ammessa. Quello che questa prova pretende è che la dichiarazione ci sia — un silenzio
// sarebbe indistinguibile da un controllo passato.

test("la porta A MANO chiude, ma dichiara sulla scheda che il cancello non l'ammetteva", () => {
  const dir = mkdtempSync(join(tmpdir(), "cantiere-finto-mano-"));
  const registro = join(dir, "cantiere-difetti.json");
  try {
    writeFileSync(registro, JSON.stringify({ difetti: [scheda("AR-FINTO-MANO", { gravita: "bloccante" })] }), "utf8");

    const r = spawnSync(
      "node",
      ["cervello/auto-fix.mjs", "chiudi", "--id=AR-FINTO-MANO", "--come=chiusa a mano nella prova"],
      { cwd: REPO, encoding: "utf8", env: { ...process.env, CANTIERE_FILE: registro, STORICO_FILE: join(dir, "storico-salute.json") }, timeout: 120_000, maxBuffer: 1024 * 1024 },
    );
    const out = `${r.stdout || ""}${r.stderr || ""}`;

    assert.match(
      out,
      /⛔ AR-FINTO-MANO: chiusa a mano su una prova che il cancello NON ammette/,
      `la porta a mano non nomina il cancello: chi chiude di fretta non sa che di là sarebbe stato un rifiuto.
${out}`,
    );
    const dopo = JSON.parse(readFileSync(registro, "utf8")).difetti[0];
    assert.equal(dopo.stato, "chiuso", "la porta a mano resta percorribile: un cancello sempre rosso si impara ad aggirarlo");
    assert.ok(
      typeof dopo.chiusa_su_prova_non_ammessa === "string" && dopo.chiusa_su_prova_non_ammessa.length > 10,
      "la dichiarazione deve restare SULLA SCHEDA, dove un guardiano la ritrova — non solo a schermo, dove scorre via",
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("dalla porta a mano una scheda leggera chiude in silenzio: la dichiarazione non è un timbro su tutto", () => {
  const dir = mkdtempSync(join(tmpdir(), "cantiere-finto-mano2-"));
  const registro = join(dir, "cantiere-difetti.json");
  try {
    writeFileSync(registro, JSON.stringify({ difetti: [scheda("AR-FINTO-MANO-OK", { gravita: "minore" })] }), "utf8");
    const r = spawnSync(
      "node",
      ["cervello/auto-fix.mjs", "chiudi", "--id=AR-FINTO-MANO-OK", "--come=chiusa a mano nella prova"],
      { cwd: REPO, encoding: "utf8", env: { ...process.env, CANTIERE_FILE: registro, STORICO_FILE: join(dir, "storico-salute.json") }, timeout: 120_000, maxBuffer: 1024 * 1024 },
    );
    const out = `${r.stdout || ""}${r.stderr || ""}`;
    assert.doesNotMatch(out, /NON ammette/, `una scheda leggera non deve far scattare la dichiarazione.\n${out}`);
    const dopo = JSON.parse(readFileSync(registro, "utf8")).difetti[0];
    assert.equal(dopo.chiusa_su_prova_non_ammessa, undefined, "un avviso che compare sempre non è un avviso");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ④ LA TERZA PORTA — l'allineatore, che è il SECONDO file della macchina a scrivere «chiuso»
// ═══════════════════════════════════════════════════════════════════════════════════════════
//
// `allinea-scan-cantiere.mjs` lo dichiara in cima a sé stesso. Due delle sue strade arrivano
// all'atto: una PROPAGA una decisione già presa (il finding si chiude perché la scheda del cantiere
// è chiusa — lì il cancello ha già parlato, e rigiudicare sarebbe giudicare due volte), l'altra
// DECIDE su una prova, ed è quella che va frenata.
//
// Oggi quella strada non si percorre: zero dei 208 findings aperti porta un campo `verifica`,
// misurato il 23/8. Il cancello qui non toglie niente a nessuno — che è la ragione per montarlo
// adesso invece di aspettare il giorno in cui costa.
//
// ── AR-810, trovato percorrendola ─────────────────────────────────────────────────────────────
// La strada non era dormiente: era MORTA. `verificaFinding` citava una variabile `trovato` che non
// esiste — AR-743 aveva sostituito il confronto a mano con `provaSoddisfatta` e portato via la
// variabile, lasciandone il nome dentro il `return`. Quindi ogni finding con una prova faceva
// scattare un ReferenceError, e l'errore saliva fino ad abortire l'allineamento intero. Nessuno se
// n'era accorto perché nessun finding porta una prova: la difesa era che la strada fosse deserta.
// Il caso qui sotto copre tutt'e due — se `trovato` torna, il processo muore e nessuno dei due
// findings cambia stato.

test("AR-796 · AR-810 — l'allineatore non esplode, e non chiude un finding BLOCCANTE su una prova a pattern", () => {
  const dir = mkdtempSync(join(tmpdir(), "allinea-finto-"));
  const rad = join(dir, "auto-radiografia.json");
  const cant = join(dir, "cantiere-difetti.json");
  try {
    const provaChePiglia = { file: "cervello/prova-ammissibile.mjs", pattern: "ammissibilitaProva", presente: true };
    writeFileSync(cant, JSON.stringify({ difetti: [] }), "utf8");
    writeFileSync(
      rad,
      JSON.stringify({
        dimensioni: [{
          key: "prova", nome: "Prova", findings: [
            { titolo: "finding finto bloccante", severita: "bloccante", stato: "aperto", verifica: provaChePiglia },
            { titolo: "finding finto minore", severita: "minore", stato: "aperto", verifica: provaChePiglia },
          ],
        }],
      }),
      "utf8",
    );

    const env = { ...process.env, RADIOGRAFIA_FILE: rad, CANTIERE_FILE: cant };
    delete env.SUPABASE_URL;
    delete env.SUPABASE_SERVICE_KEY;
    spawnSync("node", ["cervello/allinea-scan-cantiere.mjs", "--json"], {
      cwd: REPO, encoding: "utf8", env, timeout: 120_000, maxBuffer: 1024 * 1024,
    });

    const dopo = JSON.parse(readFileSync(rad, "utf8")).dimensioni[0].findings;
    const bloccante = dopo.find((f) => f.severita === "bloccante");
    const minore = dopo.find((f) => f.severita === "minore");

    assert.notEqual(bloccante.stato, "chiuso", "un bloccante del sito non si chiude su una parola cercata in un file");
    assert.ok(
      typeof bloccante.chiusura_rifiutata === "string" && bloccante.chiusura_rifiutata.length > 10,
      "il rifiuto deve restare scritto sul finding: un rifiuto senza traccia somiglia a «non è successo niente»",
    );
    // Il controllo: se il freno fosse un blocco totale questa riga sarebbe rossa, e «non chiude
    // niente» passerebbe per «cancello che funziona».
    assert.equal(minore.stato, "chiuso", "un finding minore continua a chiudersi: il freno non è una sbarra");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ⑤ LA DICHIARAZIONE DEVE FINIRE IN UN CONTO — o è un silenzio con un nome più bello
// ═══════════════════════════════════════════════════════════════════════════════════════════
//
// Trovato al secondo giro, chiedendo «il mio codice nuovo lo usa qualcuno?». La porta a mano scrive
// `chiusa_su_prova_non_ammessa` sulla scheda e stampa che è «ritrovabile» — ma nessuno lo leggeva,
// quindi la frase era falsa nel momento in cui la scrivevo. Vale anche per `prova_non_misurata`, di
// AR-559: dal 13/8 il messaggio prometteva «e nel conto di cantiere-prove.mjs», e quel conto non è
// mai esistito (due sole occorrenze in tutto il repo, tutt'e due dentro auto-fix).
//
// La prova qui sotto non guarda il conto sui dati veri: oggi vale zero, e uno zero sta fermo anche
// se il contatore è rotto. Guarda che il RILEVATORE veda, su schede costruite apposta.

test("il referto conta le chiusure dichiarate, e il rilevatore non è cieco", () => {
  const dir = mkdtempSync(join(tmpdir(), "cantiere-conto-"));
  const registro = join(dir, "cantiere-difetti.json");
  try {
    writeFileSync(
      registro,
      JSON.stringify({
        difetti: [
          { id: "AR-C1", stato: "chiuso", titolo: "x", chiusa_su_prova_non_ammessa: "il cancello non l'ammetteva" },
          { id: "AR-C2", stato: "chiuso", titolo: "y", prova_non_misurata: "il motore non sa eseguire quel comando" },
          { id: "AR-C3", stato: "chiuso", titolo: "z", chiusa_su_prova_non_ammessa: "  " },
          { id: "AR-C4", stato: "aperto", titolo: "w", verifica: { comando: "node cervello/tasso-chiusura.mjs" } },
        ],
      }),
      "utf8",
    );
    const referto = join(dir, "cantiere-prove.json");
    const r = spawnSync("node", ["cervello/cantiere-prove.mjs"], {
      cwd: REPO, encoding: "utf8", timeout: 180_000, maxBuffer: 4 * 1024 * 1024,
      env: { ...process.env, CANTIERE_FILE: registro, CANTIERE_PROVE_REPORT: referto },
    });
    const out = `${r.stdout || ""}${r.stderr || ""}`;
    const rep = JSON.parse(readFileSync(referto, "utf8"));
    assert.equal(rep.chiuse_su_prova_non_ammessa, 1, `una chiusura dichiarata deve entrare nel conto.\n${out}`);
    assert.equal(rep.chiuse_su_prova_non_misurata, 1, `anche quella di AR-559, che dal 13/8 non contava nessuno.\n${out}`);
    assert.deepEqual(rep.chiuse_da_rileggere, ["AR-C1", "AR-C2"], "un campo vuoto non è una dichiarazione, e una scheda pulita non ci finisce dentro");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("AR-796 — chi chiude LEGGE il verdetto, non se lo rifà a mano", () => {
  // 27/8, AR-840 — il fix c'era ed era giusto: la chiusura la decide `vc.chiude`, non una condizione
  // riscritta dal chiamante. Ma la catena viveva dentro un ciclo dentro un comando, e nessuno poteva
  // interrogarla: la mutazione che rimette il verdetto ricalcolato (`r.esito === "risolto"`)
  // lasciava tutto verde. Adesso la decisione è una funzione, e questo è il caso che la distingue.
  //
  // La differenza si vede SOLO qui: il grezzo dice «risolto», ma la funzione che sa dei cancelli
  // dice di no. Chi si rifà il verdetto a mano chiude una scheda che non doveva chiudere.
  assert.equal(
    dovePuntaLaScheda({ vc: { chiude: false, debole: true }, g: { ammessa: true } }),
    "aperta",
    "una scheda che il cancello NON fa chiudere è stata chiusa lo stesso: il verdetto è stato ricalcolato",
  );
  assert.equal(dovePuntaLaScheda({ vc: { chiude: true }, g: { ammessa: true } }), "da-chiudere", "e quando il verdetto dice sì, si chiude");
  assert.equal(dovePuntaLaScheda({ vc: { chiude: true }, g: { ammessa: false } }), "aperta", "il guardiano che non ammette la prova vale quanto il verdetto");

  // L'ordine è la regola: ciò che è dichiarato aperto vince su tutto, e «non ho misurato» viene per
  // ultimo — o un metro rotto finirebbe fra le scelte invece che fra i guasti.
  assert.equal(dovePuntaLaScheda({ vc: { bloccata: true, chiude: true }, g: { ammessa: true } }), "dichiarati-aperti");
  assert.equal(dovePuntaLaScheda({ vc: { inammissibile: true, chiude: true }, g: { ammessa: true } }), "rifiutate-dal-cancello");
  assert.equal(dovePuntaLaScheda({ vc: {}, g: {}, bloccato: true, cieca: true }), "rifiutate", "il cieco non deve mangiarsi il rifiuto");
  assert.equal(dovePuntaLaScheda({ vc: {}, g: {}, cieca: true }), "non-misurate");
});
