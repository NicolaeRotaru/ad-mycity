#!/usr/bin/env node
// 🏪 IL REFERTO CHE NESSUNO LEGGE — la prova che un audit fatto e mai letto non diventa uno zero.
//
// LA MALATTIA: «il contatore che guarda in una cartella sola e risponde zero». Il 22/8/2026 alle
// 19:40 la Cabina diceva **0 problemi aperti sul sito**. Nella stessa ora, in
// consegne/design/2026-08-22-radiografia-design-raw.json, c'erano **208 problemi verificati** — 2
// bloccanti che impedivano a QUALUNQUE negoziante di caricare la foto di copertina della vetrina.
// Il digest sceglieva i referti con un suffisso scritto dentro a un `filter`, su una cartella sola:
// la radiografia del design non gli arrivava, e non arrivare non e' un errore — e' uno zero.
//
// LA SECONDA META' DELLA MALATTIA, trovata provando a curare la prima: il digest ricostruiva la casa
// da zero, scrivendo `stato: "aperto"` su tutto. Rilanciarlo il 22/8 — cioe' eseguire il comando che
// il messaggio d'errore del Pannello suggerisce — riportava ad aperti i 199 problemi riparati quel
// giorno. Misurato eseguendolo, non dedotto leggendo.
//
// COSA PROVA QUESTO FILE, eseguendo le decisioni sui referti VERI:
//   ① la radiografia del design e' una fonte riconosciuta, e i suoi problemi entrano nella casa
//   ② la logica VECCHIA, eseguita qui sulle cartelle vere, NON la trova — il difetto e' riprodotto
//   ③ rifare la casa CONSERVA gli stati delle riparazioni; la logica vecchia li azzerava
//   ④ un referto grezzo che nessuna fonte riconosce blocca il conto: ⚪ col nome del file, mai 0
//   ⑤ un referto dichiarato di un'altra casa NON fa suonare l'allarme (niente falsi positivi)
//   ⑥ un problema sparito dal referto resta in casa segnato, invece di far calare il numero da solo
//   ⑦ il gemello TypeScript del Pannello si ferma sullo stesso ⚪, con lo stesso motivo
//
// I DUE DIFETTI CHE QUESTO FILE CHIUDE, e quali casi li misurano:
//   · AR-792 — il referto del design che nessuno legge, e il conto che risponde zero → casi ① ② ④ ⑤ ⑦
//   · AR-793 — rifare la casa cancellava le riparazioni già fatte → casi ③ ⑥
//
// NON-VACUITÀ (eseguita): i casi ② e ③ eseguono la logica di PRIMA del fix sugli stessi dati veri e
// pretendono che sbagli. Se un giorno smettessero di sbagliare, la prova te lo direbbe diventando
// rossa. Nessun numero di oggi e' inchiodato dentro un'asserzione: si confrontano fra loro le due
// logiche sugli stessi file, cosi' la prova non scade quando i difetti vengono riparati.
//   Rimettendo il filtro a una cartella sola in `refertiDaElenco`/`FONTI_SITO` diventano rossi ① ②;
//   togliendo `fondiConLaCasa` dal digest diventa rosso ③; togliendo il ramo `fonti_non_lette` dai
//   conti diventano rossi ④ ⑦; togliendo `REFERTI_DI_ALTRI` diventa rosso ⑤.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  CARTELLE_REFERTI,
  FONTI_SITO,
  REFERTI_DI_ALTRI,
  chiaveProblema,
  fondiConLaCasa,
  fonteDiFile,
  problemiDaRaw,
  refertiDaElenco,
  refertiNonLetti,
  ultimiPerFonte,
} from "../referti-sito.mjs";
import { contoMarketplace, eChiuso } from "../radiografia-marketplace-conti.mjs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CASA = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json");

// Il gemello TypeScript si importa diretto (Node ≥22.18). In cima e non dentro un caso: un `await`
// dentro un test girerebbe dopo il conteggio e un `1 = 2` stamperebbe «pass» (AR-694).
const pannello = await import(join(REPO, "pannello/src/lib/radiografia-marketplace-conti.ts"));

/** Cosa c'è davvero su disco, nelle cartelle che le fonti dichiarano. */
function elenchiVeri() {
  return CARTELLE_REFERTI.map((cartella) => {
    const dir = join(REPO, cartella);
    return { cartella, nomi: existsSync(dir) ? readdirSync(dir) : [] };
  });
}
const REFERTI_VERI = refertiDaElenco(elenchiVeri());
const CASA_VERA = JSON.parse(readFileSync(CASA, "utf8"));

/** La selezione ESATTA che stava nel digest prima del fix. Tenuta qui per riprodurre il difetto. */
function selezioneVecchia(elenchi) {
  const audit = elenchi.find((e) => e.cartella === "consegne/audit")?.nomi ?? [];
  const raws = audit.filter((n) => n.endsWith("-radiografia-marketplace-raw.json")).sort();
  return raws.length ? [`consegne/audit/${raws[raws.length - 1]}`] : [];
}

/** La normalizzazione ESATTA di prima: ogni problema nasce «aperto», la casa non si guarda. */
function fusioneVecchia(nuovi) {
  return nuovi.map((p) => ({ ...p, stato: "aperto" }));
}

const referto = (extra = {}) => ({ meta: { findings: 3 }, problemi: [], dimensioni: [], ...extra });

test("① la radiografia del design è una fonte riconosciuta, e i suoi problemi entrano nella casa", () => {
  const design = FONTI_SITO.find((f) => f.id === "design");
  assert.ok(design, "la famiglia «design» non è più dichiarata fra le fonti del sito");

  const ultimo = ultimiPerFonte(REFERTI_VERI).get("design");
  assert.ok(ultimo, `nessun referto del design trovato in ${design.cartella}`);
  assert.equal(fonteDiFile(ultimo.nome)?.id, "design");

  const raw = JSON.parse(readFileSync(join(REPO, ultimo.file), "utf8"));
  const problemi = problemiDaRaw(raw, design);
  assert.ok(Array.isArray(problemi) && problemi.length > 0, "il referto del design non produce nessun problema");

  // Il referto dichiara quanti ne ha trovati: il conto estratto deve tornare con quel testimone.
  if (Number.isFinite(raw?.totale)) assert.equal(problemi.length, raw.totale);

  // E devono essere ARRIVATI in casa: è il punto in cui il 22/8 si perdevano tutti.
  const inCasa = new Set((CASA_VERA.problemi ?? []).map(chiaveProblema));
  const mancanti = problemi.filter((p) => !inCasa.has(chiaveProblema(p)));
  assert.equal(
    mancanti.length,
    0,
    `${mancanti.length} problemi del design non sono nella casa dei difetti del sito (es. «${mancanti[0]?.titolo ?? ""}»)`,
  );
});

test("② la logica vecchia, sulle cartelle vere, non vede la radiografia del design — difetto riprodotto", () => {
  const elenchi = elenchiVeri();
  const vecchia = selezioneVecchia(elenchi);
  const nuova = [...ultimiPerFonte(refertiDaElenco(elenchi)).values()].map((r) => r.file);

  const designNuova = nuova.filter((f) => f.includes("design"));
  assert.ok(designNuova.length > 0, "la selezione nuova non prende più il referto del design");
  for (const f of designNuova) {
    assert.ok(
      !vecchia.includes(f),
      "la selezione vecchia adesso trova il referto del design: la prova non misura più il difetto",
    );
  }
  assert.ok(nuova.length > vecchia.length, "la selezione nuova non legge più referti della vecchia");
});

test("③ rifare la casa conserva gli stati delle riparazioni; la logica vecchia li azzerava", () => {
  // Sui dati VERI: nessuno stato di chiusura può sparire rifacendo il referto.
  const chiusiPrima = (CASA_VERA.problemi ?? []).filter(eChiuso).map(chiaveProblema);
  assert.ok(chiusiPrima.length > 0, "in casa non c'è nessuna riparazione: il caso non misurerebbe niente");

  const nuovi = [];
  for (const fonte of FONTI_SITO) {
    const ultimo = ultimiPerFonte(REFERTI_VERI).get(fonte.id);
    if (!ultimo) continue;
    const p = problemiDaRaw(JSON.parse(readFileSync(join(REPO, ultimo.file), "utf8")), fonte);
    if (p) nuovi.push(...p);
  }

  const rifatta = fondiConLaCasa(nuovi, CASA_VERA.problemi);
  const chiusiDopo = new Set(rifatta.problemi.filter(eChiuso).map(chiaveProblema));
  const persi = chiusiPrima.filter((k) => !chiusiDopo.has(k));
  assert.equal(persi.length, 0, `${persi.length} riparazioni cancellate dal rifacimento della casa`);

  // E la logica vecchia, eseguita qui sugli stessi dati, le cancella: il difetto è riprodotto.
  const allaVecchia = new Set(fusioneVecchia(nuovi).filter(eChiuso).map(chiaveProblema));
  const persiPrima = chiusiPrima.filter((k) => !allaVecchia.has(k));
  assert.ok(
    persiPrima.length > 0,
    "la logica vecchia non cancella più nessuna riparazione: la prova non misura più il difetto",
  );
});

test("④ un referto che nessuna fonte riconosce blocca il conto: ⚪ col nome del file, mai zero", () => {
  const finti = refertiDaElenco([
    { cartella: "consegne/audit", nomi: ["2026-09-01-radiografia-sicurezza-raw.json"] },
  ]);
  const nonLetti = refertiNonLetti(finti);
  assert.equal(nonLetti.length, 1);
  assert.match(nonLetti[0].file, /radiografia-sicurezza-raw\.json$/);
  assert.ok(nonLetti[0].perche, "un «non letto» senza il perché si legge come «non importante»");

  // La casa che dichiara di non aver letto tutto NON produce un numero: né 0, né un parziale.
  const conto = contoMarketplace(referto({ problemi: [{ stato: "chiuso" }], fonti_non_lette: nonLetti }));
  assert.equal(conto.letto, false);
  assert.equal(conto.aperti, null, "un conto parziale presentato come totale è la bugia da impedire");
  assert.equal(conto.forma, "incompleto");
  assert.match(conto.motivo, /radiografia-sicurezza-raw\.json/);

  // Controprova: senza referti non letti, la stessa casa un numero lo dà.
  const sano = contoMarketplace(referto({ problemi: [{ stato: "chiuso" }], fonti_non_lette: [] }));
  assert.equal(sano.letto, true);
  assert.equal(sano.aperti, 0);
});

test("⑤ un referto dichiarato di un'altra casa non fa suonare l'allarme", () => {
  assert.ok(REFERTI_DI_ALTRI.length > 0, "nessuna esenzione dichiarata: l'allarme suonerebbe per sempre");
  for (const e of REFERTI_DI_ALTRI) {
    assert.ok(e.casa && e.perche, "un'esenzione senza il perché scritto è un silenzio");
    const finti = refertiDaElenco([{ cartella: "consegne/audit", nomi: [`2026-09-01${e.suffisso}`] }]);
    assert.equal(refertiNonLetti(finti).length, 0, `l'esenzione ${e.suffisso} non è rispettata`);
  }
  // E sui referti VERI l'allarme è muto: se suona, o manca una fonte o manca un'esenzione.
  assert.deepEqual(
    refertiNonLetti(REFERTI_VERI).map((r) => r.file),
    [],
    "c'è un audit del sito che nessuno legge: dichiaralo in FONTI_SITO o in REFERTI_DI_ALTRI",
  );
});

test("⑥ un problema sparito dal referto resta in casa segnato, non fa calare il numero da solo", () => {
  const vecchi = [
    { dimensione: "qa-flussi", titolo: "uno", stato: "chiuso" },
    { dimensione: "qa-flussi", titolo: "due", stato: "aperto" },
  ];
  const nuovi = [{ dimensione: "qa-flussi", titolo: "uno", stato: "aperto" }];
  const { problemi, orfani } = fondiConLaCasa(nuovi, vecchi);

  assert.equal(orfani, 1);
  assert.equal(problemi.length, 2, "il problema sparito dal referto è stato buttato via");
  const sparito = problemi.find((p) => p.titolo === "due");
  assert.equal(sparito.fuori_dal_referto, true);
  assert.equal(sparito.stato, "aperto", "sparire non è essere riparati");
  // E lo stato del problema ancora presente è stato conservato, non riscritto ad «aperto».
  assert.equal(problemi.find((p) => p.titolo === "uno").stato, "chiuso");
});

test("⑦ il gemello TypeScript si ferma sullo stesso ⚪, con lo stesso motivo", () => {
  const casa = referto({ problemi: [{ stato: "aperto" }], fonti_non_lette: [{ file: "consegne/design/x-raw.json" }] });
  const mio = contoMarketplace(casa);
  const suo = pannello.contoMarketplace(casa);
  for (const campo of ["letto", "forma", "aperti", "chiusi", "totale", "motivo"]) {
    assert.deepEqual(suo[campo], mio[campo], `il campo ${campo} diverge fra cervello e Pannello`);
  }
  assert.equal(suo.letto, false);
});
