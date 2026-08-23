#!/usr/bin/env node
// AR-789 + AR-790 — «non lo so» usciva dalla bocca del cancello travestito da «no».
//
// `provaComportamentaleObbligatoria` decide se un difetto può chiudersi con una parola cercata in un
// file o se pretende una prova che esegue. Leggeva due campi con un uguale esatto:
//
//     const perImpatto = String(d?.impatto_crescita ?? "").trim() === "alto";
//
// Un campo assente non corrisponde. Un campo scritto in prosa non corrisponde. Entrambi cadevano nel
// ramo «no», cioè prendevano il permesso di chiudersi con una prova debole. Misurato sul registro
// vero il 22/8: **40 schede vive su 109** — il 37% del cantiere — uscivano da lì.
//
// E il commento sopra quella riga lo diceva: «un confronto largo le tirerebbe dentro tutte». Chi
// l'ha scritta sapeva del problema e ha scelto il ramo stretto. Il punto è che nessuno dei due rami
// era giusto: la risposta non è né sì né no, è «questa scheda non la posso giudicare».
//
// COSA NON SI FA. Delle 60 schede in prosa, 37 aprono con una categoria vera e si leggono. Le altre
// 23 descrivono l'impatto a parole («blocca ogni cadenza insieme»): dedurne una categoria sarebbe
// scrivere un valore che nessuno ha dichiarato. Restano non giudicabili, e si vedono.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const CERVELLO = join(QUI, "..");
const REPO = join(CERVELLO, "..");

const C = await import(join(CERVELLO, "contratto-scheda.mjs"));
const P = await import(join(CERVELLO, "prova-ammissibile.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

const registro = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"), "utf8"));
const vive = registro.difetti.filter((d) => d.stato !== "chiuso");

// ─────────────── il terzo esito esiste, ed è diverso dal «no» ───────────────

prova("AR-789: un campo che non c'è dà «non lo so», non «no»", () => {
  const v = P.provaComportamentaleObbligatoria({ impatto_crescita: "medio" });
  assert.equal(v.indecidibile, true, "senza gravità il cancello non può decidere");
  assert.equal(v.obbligatoria, false, "e non deve nemmeno inventarsi un obbligo");
});

prova("AR-789: una prosa senza categoria in testa NON viene indovinata", () => {
  const v = P.provaComportamentaleObbligatoria({ gravita: "grave", impatto_crescita: "blocca ogni cadenza insieme, e il Pannello continua a dire che va bene" });
  assert.equal(v.indecidibile, true, "descrivere l'impatto a parole non è dichiararlo");
  assert.match(v.perche, /non si deduce/);
});

prova("AR-789: una scheda dichiarata per intero resta decidibile, in tutti e due i versi", () => {
  const pesante = P.provaComportamentaleObbligatoria({ gravita: "bloccante", impatto_crescita: "medio" });
  assert.equal(pesante.obbligatoria, true);
  assert.equal(pesante.indecidibile, false);
  const leggera = P.provaComportamentaleObbligatoria({ gravita: "minore", impatto_crescita: "basso" });
  assert.equal(leggera.obbligatoria, false);
  assert.equal(leggera.indecidibile, false, "un «no» vero non deve diventare un «non lo so»");
});

// ─────────────── si LEGGE ciò che è dichiarato, senza inventare ───────────────

prova("AR-789: la categoria in testa alla prosa si legge, il resto è spiegazione", () => {
  const i = C.impattoDi({ impatto_crescita: "indiretto: è debito della macchina che si ripara da sola" });
  assert.equal(i.valore, "indiretto");
  assert.equal(i.dichiarato, true);
  assert.ok(i.prosa.length > 0, "la spiegazione non si butta: si mette da parte");
});

prova("AR-790: gli alias storici della gravità si leggono, e non sono deduzioni", () => {
  assert.equal(C.gravitaNormalizzata({ gravita: "alta" }).valore, "grave");
  assert.equal(C.gravitaNormalizzata({ gravita: "critica" }).valore, "bloccante");
  // un valore mai visto NON diventa «minore» per comodità: resta non dichiarato
  const ignoto = C.gravitaNormalizzata({ gravita: "urgentissima" });
  assert.equal(ignoto.valore, null);
  assert.equal(ignoto.dichiarato, false);
  assert.match(ignoto.perche, /fuori contratto/);
});

// ─────────────── sul registro vero, e il numero deve SCENDERE ───────────────

prova("AR-789: leggere ciò che è dichiarato recupera schede che prima erano cieche", () => {
  const cieche = C.schedeNonGiudicabili(vive);
  assert.ok(cieche.length < 40, `attese meno di 40 schede cieche (erano 40 col confronto esatto), trovate ${cieche.length}`);
  // e il recupero deve venire dalla LETTURA, non da un valore inventato: ogni scheda recuperata
  // deve portare davvero la categoria nel proprio testo
  const recuperate = vive.filter((d) => C.impattoDi(d).dichiarato && String(d.impatto_crescita ?? "").length > 20);
  for (const d of recuperate) {
    assert.match(String(d.impatto_crescita).toLowerCase(), /^(alto|medio|basso|indiretto)\s*[:,–—-]/, `${d.id}: recuperata senza che la categoria sia scritta`);
  }
});

prova("AR-789: il referto DICHIARA quante schede non si possono giudicare", () => {
  // Il modulo giusto e il referto muto sono la stessa malattia di ieri: un freno che nessuno legge.
  const sorgente = readFileSync(join(CERVELLO, "cantiere-prove.mjs"), "utf8");
  assert.match(sorgente, /schede_non_giudicabili/, "il conto deve uscire nel referto");
  assert.match(sorgente, /non_giudicabile/, "e la colonna deve essere calcolata per scheda");
  const referto = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-prove.json"), "utf8"));
  assert.equal(typeof referto.schede_non_giudicabili, "number", "il campo sta nel referto SEMPRE, anche a zero");
  assert.equal(typeof referto.schede_campi_illeggibili, "number", "e anche il suo fratello: sono due domande diverse");
});

prova("AR-789: «il cancello non sa decidere» e «il campo non si legge» sono DUE numeri, non uno", () => {
  // 23/8 — questo caso è nato da un errore mio, e l'ha rivelato una scheda arrivata da un altro
  // lavoro. Il test di ieri pretendeva che il conto del referto fosse UGUALE a `schedeNonGiudicabili`.
  // Non lo è, e non deve esserlo: sono due domande diverse che io avevo chiamato con lo stesso nome —
  // cioè la malattia `una-parola-con-due-padroni`, dentro il lotto che stava curando la sua sorella.
  //
  //   · il CANCELLO non sa decidere → la scheda non è bloccante E l'impatto non si legge;
  //   · il CAMPO non si legge → basta che uno dei due campi sia illeggibile, cancello a parte.
  //
  // Un bloccante con l'impatto scritto male sta nel secondo e non nel primo: il cancello decide
  // benissimo, perché la gravità gli basta. Il caso vero era AR-795 («diretto: …», e «diretto» non è
  // una delle quattro categorie). Se i due numeri coincidessero, quel caso sparirebbe dal conto.
  const referto = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-prove.json"), "utf8"));
  const illeggibili = C.schedeNonGiudicabili(vive);
  assert.equal(referto.schede_campi_illeggibili, illeggibili.length, "il conto della qualità del dato dev'essere quello vero");
  assert.ok(
    referto.schede_non_giudicabili <= referto.schede_campi_illeggibili,
    `il cancello non può essere in dubbio su più schede di quante ne abbiano i campi rotti: ${referto.schede_non_giudicabili} > ${referto.schede_campi_illeggibili}`,
  );
  // e la differenza dev'essere spiegabile UNA PER UNA, non un residuo che nessuno guarda
  const spiegate = illeggibili.filter((d) => !P.provaComportamentaleObbligatoria(d).indecidibile);
  assert.equal(
    referto.schede_campi_illeggibili - referto.schede_non_giudicabili,
    spiegate.length,
    "ogni scheda nella differenza dev'essere una che il cancello decide sulla sola gravità",
  );
  for (const d of spiegate) {
    assert.equal(C.gravitaNormalizzata(d).valore, "bloccante", `${d.id}: sta nella differenza ma non è un bloccante — allora il conto non torna per un altro motivo`);
  }
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
