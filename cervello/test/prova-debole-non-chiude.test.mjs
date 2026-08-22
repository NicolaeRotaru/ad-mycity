#!/usr/bin/env node
// 🧪 AR-354 · AR-684 — DUE METRI CHE NON POTEVANO FALLIRE, DENTRO IL METRO CHE GIUDICA GLI ALTRI.
//
// ── AR-354 · «il difetto che pesa di più, coperto dalla prova più debole» ─────────────────────
// Misurato il 22/8/2026 sul cantiere vero (777 schede, 112 da fare): 27 schede da fare sono
// `bloccante` o a impatto di crescita `alto`, e 19 di quelle 27 non hanno una prova che ESEGUE
// niente — 8 cercano una parola dentro un file, 10 dichiarano una verifica umana, 1 non ha proprio
// il campo `verifica`. Nessun cancello rifiutava quella forma: la regola («meglio ancora,
// sostituiscila con una prova comportamentale») viveva scritta nel TESTO dei vincoli del giro, e
// una regola che vive in un messaggio si obbedisce solo quando c'è tempo.
//
// IL CASO CHE MORDE, e non è teorico — l'ha prodotto questo lotto stesso: la scheda AR-354 porta
// come prova `{file: "cervello/cantiere-prove.mjs", pattern: "provaComportamentaleObbligatoria"}`.
// Bastava che qualcuno scrivesse quella parola nel file — cioè quello che fa chiunque ripari il
// difetto, o chiunque ne parli in un commento — perché la prova diventasse verde e `auto-fix.mjs`
// chiudesse la scheda. Una parola cercata in un file non può fallire nel modo in cui fallisce la
// realtà: è per questo che gli errori li trovava Nicola e non la macchina.
//
// ── AR-684 · «un totale che salta uno stato» ──────────────────────────────────────────────────
// Il terzo stato del cantiere si chiama `da-riverificare`: oggi 10 schede su 777 (665 chiuse, 102
// `aperto`, 10 `da-riverificare`). Il conto scritto DENTRO il registro è stato riparato altrove e
// oggi torna. Il referto del guardiano delle prove no: contava con un filtro scritto a mano
// (`d.stato !== "chiuso"`) e pubblicava il risultato sotto il nome `difetti_aperti`, cioè **112
// chiamati «aperti»** mentre il registro accanto ne dichiarava 102 con lo stesso nome. Due numeri
// con lo stesso nome in due file, diversi di esattamente uno stato.
//
// Il difetto vero non è il numero, è che nessuno se ne poteva accorgere: un referto senza totale e
// senza denominatore non può sbilanciarsi, quindi non può neanche denunciare uno stato saltato.
//
// ── COSA PROVA QUESTO FILE, e cosa no ────────────────────────────────────────────────────────
// I casi costruiti sono quelli che MORDONO: mettono sotto `classifica()` una scheda pesante la cui
// prova a pattern COMBACIA ADESSO — cioè lo stato in cui `auto-fix` la chiuderebbe — e pretendono
// il rifiuto. Sul cantiere vero, oggi, nessuna scheda pesante è in quello stato, quindi una prova
// scritta solo sui dati reali resterebbe verde col fix disfatto: sarebbe vacua, che è la malattia
// di questa corsia. I casi reali servono all'altra metà — che la regola governi schede vere e che
// il bilancio torni sul registro intero.
//
// NON prova che `auto-fix.mjs` rispetti questi cancelli: quel file non passa da
// `prova-ammissibile.mjs`, ed è scritto nel referto (`chiuderebbe_lo_stesso`) invece che sperato.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

// L'import NON deve far girare il guardiano (AR-582): se un giorno tornasse a eseguire al
// caricamento, questa riga riscriverebbe il referto vero sotto i piedi di chi lancia il test.
const { classifica, bloccantiCiechi } = await import(join(REPO, "cervello", "cantiere-prove.mjs"));
const {
  CLASSE_DEBOLE_SU_GRAVE,
  CLASSE_IMPOSSIBILE,
  ammissibilitaProva,
  bilancioDelReferto,
  provaCheEsegue,
  provaComportamentaleObbligatoria,
} = await import(join(REPO, "cervello", "prova-ammissibile.mjs"));
const { contaDifetti, sommaTorna } = await import(join(REPO, "cervello", "stati-cantiere.mjs"));

/**
 * Una prova a pattern che COMBACIA DAVVERO adesso: il file esiste e contiene la parola. È lo stato
 * in cui il guardiano diceva «auto-ok — auto-fix lo chiuderà», cioè il difetto stava per chiudersi.
 * Se questa smettesse di combaciare, i casi qui sotto diventerebbero vacui senza dirlo: c'è un
 * controllo apposta più in basso.
 */
const PATTERN_CHE_COMBACIA = { file: "cervello/prova-ammissibile.mjs", pattern: "provaComportamentaleObbligatoria", presente: true };

/** Una prova a comando che il motore sa eseguire, e che punta a un file che esiste: questo. */
const COMANDO_VERO = { comando: "node cervello/test/prova-debole-non-chiude.test.mjs" };

const scheda = (extra) => ({ id: "AR-000", titolo: "scheda finta", nato: "2026-07-01 09:00", ...extra });

// ═════════════════════ il presupposto dei casi costruiti ═════════════════════

test("presupposto: la prova a pattern usata qui sotto COMBACIA davvero (altrimenti i casi sono vacui)", () => {
  const leggera = classifica(scheda({ gravita: "medio", verifica: PATTERN_CHE_COMBACIA }));
  assert.equal(leggera.classe, "auto-ok", "se non combacia più, i casi che seguono non provano niente: cambia il pattern");
  assert.equal(leggera.auto_chiudibile, true, "ed è proprio lo stato in cui auto-fix chiude la scheda");
});

// ═════════════════════ AR-354 ① — la prova debole su un difetto pesante ═════════════════════

test("AR-354: un BLOCCANTE con una prova a pattern che combacia ORA non è chiudibile", () => {
  const v = classifica(scheda({ gravita: "bloccante", impatto_crescita: "medio", verifica: PATTERN_CHE_COMBACIA }));
  assert.equal(v.auto_chiudibile, false, "senza il cancello era `auto-ok`: il bloccante si chiudeva perché una parola stava in un file");
  assert.equal(v.classe, CLASSE_DEBOLE_SU_GRAVE);
  assert.equal(v.prova_debole_su_grave, true, "la marca dev'esserci: è quella che rende il debito contabile");
  assert.match(v.perche, /BLOCCANTE/);
});

test("AR-354: anche l'impatto di crescita ALTO obbliga alla prova che esegue — non solo il bloccante", () => {
  const v = classifica(scheda({ gravita: "grave", impatto_crescita: "alto", verifica: PATTERN_CHE_COMBACIA }));
  assert.equal(v.auto_chiudibile, false, "è la clausola che salta sempre: la scheda ne nomina DUE, e la seconda è quella dimenticata");
  assert.equal(v.classe, CLASSE_DEBOLE_SU_GRAVE);
  assert.match(v.perche, /ALTO/);
});

test("AR-354: un bloccante SENZA `verifica`, o con una verifica umana, resta non chiudibile e viene marcato", () => {
  const senza = classifica(scheda({ gravita: "bloccante", impatto_crescita: "alto" }));
  assert.equal(senza.auto_chiudibile, false);
  assert.equal(senza.prova_debole_su_grave, true, "«nessuna prova» non è «{comando: …}»: la clausola vale anche qui");
  const umana = classifica(scheda({ gravita: "bloccante", verifica: { tipo: "umano" } }));
  assert.equal(umana.auto_chiudibile, false);
  assert.equal(umana.prova_debole_su_grave, true);
});

test("AR-354: la FORMA giusta non basta — un comando che il motore non sa eseguire non è una prova", () => {
  const v = classifica(scheda({ gravita: "bloccante", verifica: { comando: "rm -rf /" } }));
  assert.equal(v.auto_chiudibile, false, "è il codice 2 del contratto: non ho potuto misurare, che non è un verde");
  assert.equal(provaCheEsegue({ comando: "rm -rf /" }), false);
  assert.equal(provaCheEsegue(COMANDO_VERO), true);
});

test("AR-354: il cancello NON è un giro di vite generico — sui minori e sui medi la prova a pattern resta ammessa", () => {
  for (const g of ["minore", "medio", "basso"]) {
    const v = classifica(scheda({ gravita: g, verifica: PATTERN_CHE_COMBACIA }));
    assert.equal(v.auto_chiudibile, true, `su «${g}» il pattern resta ammesso: un cancello che nessuno può attraversare si impara ad aggirare`);
    assert.equal(v.classe, "auto-ok");
  }
});

test("AR-354: la via d'uscita esiste — con un comando vero il bloccante torna chiudibile e il conto può scendere", () => {
  const v = classifica(scheda({ gravita: "bloccante", impatto_crescita: "alto", verifica: COMANDO_VERO }));
  assert.equal(v.auto_chiudibile, true, "un numero che non può scendere non è un debito: è un muro");
  assert.equal(v.classe, "auto-comando");
  assert.deepEqual(bloccantiCiechi([v]), [], "e sparisce dal conto dei bloccanti ciechi");
});

test("AR-354: la regola sta in una funzione PURA, che un test può eseguire senza far girare il guardiano", () => {
  assert.equal(provaComportamentaleObbligatoria({ gravita: "bloccante" }).obbligatoria, true);
  assert.equal(provaComportamentaleObbligatoria({ severita: "bloccante" }).obbligatoria, true, "il nome nuovo del campo si legge dalla porta unica");
  assert.equal(provaComportamentaleObbligatoria({ impatto_crescita: "alto" }).obbligatoria, true);
  assert.equal(provaComportamentaleObbligatoria({ gravita: "grave", impatto_crescita: "medio" }).obbligatoria, false);
  // Nel registro vero `impatto_crescita` porta anche 40 frasi di prosa: un confronto largo le
  // tirerebbe dentro tutte, e il cancello diventerebbe un muro.
  assert.equal(
    provaComportamentaleObbligatoria({ gravita: "grave", impatto_crescita: "indiretto: è debito della macchina, non una leva sul primo ordine" }).obbligatoria,
    false,
  );
});

// ═════════════════════ AR-354 ② — la prova impossibile ═════════════════════

test("AR-354: una prova a pattern su un file che NON esiste è `prova_impossibile`, non «fix in attesa»", () => {
  for (const presente of [true, false]) {
    const v = classifica(scheda({ gravita: "grave", verifica: { file: "cervello/mai-esistito-354.mjs", pattern: "x", presente } }));
    assert.equal(v.prova_impossibile, true, `marca mancante con presente:${presente}`);
    assert.equal(v.senza_controllo, true, "il conto in cui deve finire è «difetti SENZA controllo»");
    assert.equal(v.auto_chiudibile, false);
    assert.equal(v.classe, CLASSE_IMPOSSIBILE, "il nome storico resta: due prove vive lo pretendono");
    assert.notEqual(v.classe, "auto-attesa", "«in attesa» promette una chiusura che nessuno potrà mai fare");
  }
});

test("AR-354: il puntatore rotto viene detto PRIMA della debolezza — è un fatto sul mondo, non un giudizio sul peso", () => {
  const v = classifica(scheda({ gravita: "bloccante", impatto_crescita: "alto", verifica: { file: "cervello/mai-esistito-354.mjs", pattern: "x" } }));
  assert.equal(v.prova_impossibile, true, "valgono tutt'e due i cancelli: chi legge deve sapere prima che il file non c'è");
  assert.equal(v.auto_chiudibile, false);
});

test("AR-354: il verdetto puro torna sempre la stessa forma, anche quando va tutto bene", () => {
  const ok = ammissibilitaProva({ gravita: "bloccante", verifica: COMANDO_VERO }, { fileEsiste: () => true });
  assert.equal(ok.ammessa, true);
  assert.equal(ok.marca, null, "un verdetto che a volte è un booleano e a volte un oggetto è come si perde per strada il motivo");
  const no = ammissibilitaProva({ gravita: "bloccante", verifica: { file: "x.mjs", pattern: "y" } }, { fileEsiste: () => true });
  assert.equal(no.ammessa, false);
  assert.equal(no.marca, "prova_debole_su_grave");
});

// ═════════════════════ AR-684 — nessuna scheda fuori dai totali ═════════════════════

test("AR-684: il bilancio è ROSSO quando un intero stato resta fuori dal conto", () => {
  const difetti = [
    ...Array.from({ length: 5 }, (_, i) => ({ id: `C${i}`, stato: "chiuso" })),
    ...Array.from({ length: 3 }, (_, i) => ({ id: `A${i}`, stato: "aperto" })),
    ...Array.from({ length: 2 }, (_, i) => ({ id: `R${i}`, stato: "da-riverificare" })),
  ];
  const conto = contaDifetti(difetti);
  assert.equal(conto.da_riverificare, 2, "il terzo stato dev'esserci, o il caso non riproduce niente");

  // Il filtro sbagliato: solo `aperto`. È quello che c'era, ed è quello che faceva sparire il terzo stato.
  const soloAperti = bilancioDelReferto(conto, difetti.filter((d) => d.stato === "aperto").length);
  assert.equal(soloAperti.torna, false);
  assert.equal(soloAperti.fuori, 2, "due schede non entrano in nessun totale");
  assert.match(soloAperti.motivo, /non entrano in nessun totale/);
  assert.match(soloAperti.motivo, /da-riverificare/, "il motivo deve dire DOVE guardare, non solo che il conto non torna");

  // Il filtro giusto: tutto ciò che non è chiuso.
  const tutto = bilancioDelReferto(conto, difetti.filter((d) => d.stato !== "chiuso").length);
  assert.equal(tutto.torna, true);
  assert.equal(tutto.fuori, 0);
});

test("AR-684: uno stato nuovo di zecca non sparisce — finisce in `altri` e la somma continua a tornare", () => {
  const conto = contaDifetti([{ id: "X", stato: "in-esilio" }, { id: "Y", stato: "chiuso" }]);
  assert.equal(conto.altri, 1);
  assert.equal(bilancioDelReferto(conto, 1).torna, true, "la difesa che rende la malattia impossibile da ripetere");
  assert.equal(bilancioDelReferto(conto, 0).torna, false, "e se qualcuno lo dimenticasse, il bilancio lo direbbe");
});

test("AR-684: su un conto NON letto il bilancio dice «non lo so», non «va bene» e nemmeno «rotto»", () => {
  const b = bilancioDelReferto(contaDifetti("non è una lista"), 0);
  assert.equal(b.torna, null, "un non-bilanciato non è un bilanciato, e non è una violazione");
  assert.match(b.motivo, /non ho potuto/);
});

// ═════════════════════ il punto che CHIAMA, sul registro vero ═════════════════════

test("sul cantiere VERO: il referto bilancia, e nessun difetto pesante è dichiarato «auto-fix lo chiuderà»", () => {
  const r = spawnSync(process.execPath, [join(REPO, "cervello", "cantiere-prove.mjs"), "--dry", "--json"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 180_000,
    // canale largo: il referto vero pesa oltre 160 KB e qui si legge da `spawnSync`, non da una
    // pipe di shell — il troncamento a 64 KB ha già il suo test (AR-685), questo misura altro.
    maxBuffer: 128 * 1024 * 1024,
  });
  assert.equal(r.status, 0, `il guardiano senza flag esce 0: ${r.stderr}`);
  const j = JSON.parse(r.stdout);

  // ── AR-684 ──
  assert.equal(j.bilancio.torna, true, j.bilancio.motivo);
  assert.equal(j.conto.chiusi + j.voci.length, j.conto.totale, "chiuse + classificate deve fare il totale delle schede");
  assert.equal(sommaTorna(j.conto), true, "e la somma dei rami del conto deve tornare da sé");
  assert.ok(j.conto.da_riverificare > 0, "se il terzo stato sparisse dal registro questa prova diventerebbe vacua: oggi sono 10");
  assert.equal(j.difetti_da_fare, j.conto.da_fare);
  assert.ok(
    j.conto.da_fare > j.conto.aperti,
    "il referto deve contare PIÙ delle sole schede etichettate `aperto`: è esattamente lo stato che spariva",
  );

  // ── AR-354 ──
  assert.ok(Array.isArray(j.prove_impossibili), "senza questa chiave i difetti senza controllo tornano invisibili");
  assert.equal(j.difetti_senza_controllo, j.prove_impossibili.length);
  assert.ok(Array.isArray(j.prove_da_alzare));
  const pesanti = j.voci.filter((v) => v.prova_obbligatoria === true);
  assert.ok(pesanti.length > 0, "la regola deve governare schede VERE, o è un cancello su una strada che non passa nessuno");
  const chiudibiliPerSbaglio = pesanti.filter((v) => v.prova_esegue !== true && v.auto_chiudibile === true);
  assert.deepEqual(chiudibiliPerSbaglio.map((v) => v.id), [], "un difetto pesante senza prova che esegue non può essere auto-chiudibile");
  const autoOkPesanti = pesanti.filter((v) => v.classe === "auto-ok");
  assert.deepEqual(
    autoOkPesanti.map((v) => v.id),
    [],
    "«auto-ok» vuol dire «auto-fix lo chiuderà»: su un bloccante o su un impatto ALTO senza prova che esegue è la chiusura falsa in arrivo",
  );
});
