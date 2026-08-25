#!/usr/bin/env node
// AR-444 — un difetto dichiarato aperto da un umano NON deve richiudersi da solo.
//
// Il caso vero: AR-396, lotto 35 del 29/7. Dichiarato aperto nel corpo della PR #621, nel messaggio
// di commit e nella nota_fix. Sulla scheda era rimasta la prova a PATTERN della radiografia; il
// lotto aveva riparato il codice, quindi il pattern si trovava e auto-fix l'ha chiuso lo stesso.
//
// Questo test esegue la logica vera su quello scenario esatto. Non cerca stringhe in un file.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { readFileSync } from "node:fs";

const REPO = join(import.meta.dirname, "..", "..");
const M = await import(join(REPO, "cervello/chiusura-dichiarata.mjs"));

// La scheda com'era davvero il 29/7: prova a pattern, soddisfatta dal codice riparato.
const AR396 = {
  id: "AR-396",
  stato: "aperto",
  verifica: { file: "cervello/gate-pubblicazione.sh", pattern: "ramo_ammesso[\\s\\S]*?git push", presente: true },
};

test("il caso che ha rotto: prova soddisfatta MA dichiarato aperto → non si chiude", () => {
  const senzaDichiarazione = M.verdettoChiusura(AR396, "risolto");
  assert.equal(senzaDichiarazione.chiude, true, "senza dichiarazione la prova chiude: e' cosi' che AR-396 si e' richiuso");

  const conDichiarazione = M.verdettoChiusura(
    { ...AR396, chiusura: "bloccata", chiusura_motivo: "la prova non discrimina le due posizioni del controllo" },
    "risolto",
  );
  assert.equal(conDichiarazione.chiude, false, "la dichiarazione umana DEVE battere la prova soddisfatta");
  assert.equal(conDichiarazione.bloccata, true);
  assert.match(conDichiarazione.motivo, /dichiarato aperto da un umano/);
  assert.match(conDichiarazione.motivo, /non discrimina/, "il motivo scritto dall'umano deve arrivare fino a chi legge");
});

test("il blocco vale anche senza motivo scritto, ma lo denuncia", () => {
  const v = M.chiusuraBloccata({ chiusura: "bloccata" });
  assert.equal(v.bloccata, true, "un blocco senza motivo vale lo stesso: la sicurezza non dipende dalla prosa");
  assert.equal(v.motivo_mancante, true, "...ma il motivo mancante si dichiara, invece di passare in silenzio");
});

test("il caso normale non cambia: senza dichiarazione, una prova soddisfatta chiude", () => {
  const forte = { id: "X", verifica: { comando: "node cervello/test/x.test.mjs" } };
  const v = M.verdettoChiusura(forte, "risolto");
  assert.equal(v.chiude, true);
  assert.equal(v.debole, false, "una prova che si esegue non e' debole");
});

test("una chiusura per PATTERN si dichiara DEBOLE invece di passare per buona", () => {
  const v = M.verdettoChiusura(AR396, "risolto");
  assert.equal(v.debole, true, "un pattern non frena, non legge, non decide: la chiusura va marcata");
  assert.match(v.motivo, /da rileggere/);
});

test("una prova non soddisfatta non chiude, dichiarazione o meno", () => {
  for (const esito of ["aperto", "manuale"]) {
    assert.equal(M.verdettoChiusura(AR396, esito).chiude, false, `esito ${esito} non deve chiudere`);
  }
});

test("le forme di prova si distinguono per quello che FANNO, non per come si chiamano", () => {
  assert.equal(M.formaProva({ comando: "node x.mjs" }), "comando");
  assert.equal(M.formaProva({ file: "a", pattern: "b" }), "pattern");
  assert.equal(M.formaProva(undefined), "nessuna");
  assert.equal(M.provaDebole({ comando: "node x.mjs" }), false);
  assert.equal(M.provaDebole({ file: "a", pattern: "b" }), true);
});

test("il tetto delle prove deboli scende e non risale", () => {
  assert.equal(M.verdettoTetto(120, 127).codice, 0, "scendere e' sempre ammesso");
  assert.equal(M.verdettoTetto(120, 127).tettoNuovo, 120, "il tetto nuovo e' quello di oggi");
  assert.equal(M.verdettoTetto(130, 127).codice, 1, "crescere e' una violazione");
  assert.equal(M.verdettoTetto(127, 127).tettoNuovo, 127, "stabile non abbassa nulla");
  assert.equal(M.verdettoTetto(5, undefined).codice, 2, "tetto non dichiarato = cieco, non verde");
});

// Il collegamento: non basta che il modulo sia giusto, deve essere CHIAMATO dal punto malato.
// (E' l'errore gia' pagato: riparare la porta a mano e lasciare aperta quella automatica.)
//
// ⚠️ 23/8, lotto 51 — QUESTA E' UNA PROVA A PAROLE, e va detto. Cerca una chiamata dentro un testo:
// non puo' fallire nel modo in cui fallisce la realta'. L'ha dimostrato AR-796, che e' vissuto due
// lotti proprio qui accanto — `auto-fix` chiamava `verdettoChiusura` (quindi questa riga era verde)
// e poi ne buttava via il campo `chiude` rifacendo la decisione a mano, cioe' la porta era aperta
// lo stesso. La prova che MORDE su quel punto adesso c'e' e fa girare il chiuditore vero:
// cervello/test/il-freno-non-era-sulla-strada.test.mjs. Questa resta per la sola cosa che quella
// non guarda — l'ORDINE fra il verdetto e l'accodamento — e cerca il nome della chiamata senza gli
// argomenti, perche' quelli cambiano quando al verdetto si aggiunge un cancello.
test("auto-fix chiama davvero il verdetto, e PRIMA di mettere in coda la chiusura", () => {
  const src = readFileSync(join(REPO, "cervello/auto-fix.mjs"), "utf8");
  assert.match(src, /import \{[^}]*verdettoChiusura[^}]*\} from "\.\/chiusura-dichiarata\.mjs"/);
  const usoVerdetto = src.indexOf("verdettoChiusura(d, r.esito");
  const usoCoda = src.indexOf("daChiudere.push(");
  assert.ok(usoVerdetto > 0, "auto-fix deve chiamare verdettoChiusura");
  assert.ok(usoCoda > usoVerdetto, "il verdetto va calcolato PRIMA di accodare la chiusura, non dopo");
});

// LA PORTA A MANO. L'errore gia' pagato (AR-172) e' riparare il comando automatico e lasciare
// aperto quello manuale. Provato il 30/7: prima del fix, `auto-fix chiudi --id=AR-396` chiudeva un
// difetto dichiarato aperto senza dire niente. Il freno va al CONFINE DELL'ATTO, cioe' su OGNI
// strada che arriva a scrivere `stato: "chiuso"`, non solo su quella che si e' guardata per prima.
test("anche la chiusura A MANO passa dalla dichiarazione, non solo `verifica --applica`", () => {
  const src = readFileSync(join(REPO, "cervello/auto-fix.mjs"), "utf8");
  const manuale = src.slice(src.indexOf('const come = arg("come"'));
  const guardia = manuale.indexOf("chiusuraBloccata(d)");
  // AR-575: la scrittura di `stato: "chiuso"` ora passa dal timbro unico timbraChiusura(...)
  // (stato + data con l'ora in un punto solo): il confine dell'atto e' la chiamata al timbro.
  const scrittura = manuale.indexOf("timbraChiusura(d");
  assert.ok(guardia > 0, "la porta a mano non consulta la dichiarazione: e' la porta lasciata aperta");
  assert.ok(scrittura > guardia, "la guardia deve stare PRIMA della scrittura, non dopo");
});

test("le due porte usano la STESSA funzione, non due copie che divergeranno", () => {
  const src = readFileSync(join(REPO, "cervello/auto-fix.mjs"), "utf8");
  assert.match(src, /import \{[^}]*chiusuraBloccata[^}]*\} from "\.\/chiusura-dichiarata\.mjs"/);
  assert.match(src, /import \{[^}]*verdettoChiusura[^}]*\} from "\.\/chiusura-dichiarata\.mjs"/);
});

// La prova sui DATI VERI: le schede dichiarate aperte nel cantiere reale non devono poter chiudere.
test("sui dati veri: ogni scheda con chiusura bloccata resta aperta anche con la prova soddisfatta", () => {
  const cantiere = JSON.parse(
    readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"), "utf8"),
  );
  const bloccate = cantiere.difetti.filter((d) => d.chiusura === "bloccata");
  assert.ok(bloccate.length > 0, "il cantiere deve portare almeno una dichiarazione umana, o questa difesa non e' in uso");
  for (const d of bloccate) {
    assert.equal(M.verdettoChiusura(d, "risolto").chiude, false, `${d.id} deve restare aperto`);
    assert.equal(d.stato, "aperto", `${d.id} e' dichiarato bloccato ma risulta gia' chiuso`);
    assert.ok((d.chiusura_motivo || "").trim().length > 10, `${d.id} deve dire PERCHE' resta aperto`);
  }
});
