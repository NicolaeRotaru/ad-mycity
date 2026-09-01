#!/usr/bin/env node
// 🧪 UNO STRUMENTO CHE MANCA NON È UN CODICE ROTTO — nemmeno quando a mancarlo è un processo figlio.
//
// AR-437 — «il cancello che decide se un lotto si può consegnare è rosso per costruzione».
//
// IL CASO CHE HA ROTTO, misurato il 2026-08-22 su `main` pulito, in una sessione appena aperta:
// `node cervello/cancello-lotto.mjs` usciva «⛔ NON SI CONSEGNA» — «test-del-cervello: 2 rosso/i
// contro un tetto di 0» — su `c2-schermo` e `c4-schermo-coda`. Nessuna delle due era rotta:
// `npm install --prefix pannello` e passavano entrambe, sei casi su sei. Erano CIECHE.
//
// Perché la stessa cecità usciva bianca da due porte e rossa dalla terza:
//   · il typecheck del cancello chiedeva già «l'ambiente è pronto?» → ⚪
//   · il banco riconosceva lo strumento mancante quando rompeva un `import` → ⚪
//   · le prove che guidano il Pannello fanno partire `npm run dev` in un PROCESSO FIGLIO: lì
//     `next: not found` è testo dentro un log, e nessuno dei due freni lo vedeva → ❌
//
// Il freno stava dentro i comandi invece che sul dato, quindi il terzo canale non ereditava niente.
// Adesso la risposta è una sola, in `cervello/ambiente-prova.mjs`, e la leggono tutti e tre.
//
// ⚠️ COSA QUESTA PROVA NON DEVE PERMETTERE: che ⚪ diventi una scusa. Un fallimento vero resta
// ROSSO — c'è un caso apposta qui sotto, ed è quello che tiene onesto tutto il resto.

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

const { ambientePannello, possoGuidareIlPannello, rigaSalto, cecitaDaAmbiente } = await import(
  join(REPO, "cervello/ambiente-prova.mjs")
);
const { verdetto } = await import(join(REPO, "cervello/test-cervello.mjs"));
const { haDichiaratoDiNonGuardare } = await import(join(REPO, "cervello/non-vacuita.mjs"));
const { avviaPannello } = await import(join(REPO, "cervello/test/aiuto-pannello.mjs"));

// ── ① Il caso che ha rotto: il banco leggeva ROSSO una cecità del processo figlio ────────────────

test("AR-437 · «next: not found» dal processo figlio è ⚪, non ❌", () => {
  // Il TAP vero che usciva da c2-schermo su `main` pulito, ridotto all'osso.
  const tap = [
    "TAP version 13",
    "not ok 1 - AR-225 · su un telefono da 375 punti nessun numero resta fuori dallo schermo",
    "  error: |-",
    "    il Pannello non risponde su http://127.0.0.1:3939: non posso guardare.",
    "       «npm run dev» è uscito subito (codice 127)",
    "         sh: 1: next: not found",
    "# pass 0",
    "# fail 1",
  ].join("\n");

  const v = verdetto(1, tap);
  assert.equal(v.esito, "non-eseguito", "prima usciva «rosso» e bloccava il cancello di tutti");
  assert.match(v.motivo, /non è installato su questa macchina/);
  assert.match(v.motivo, /npm ci --prefix pannello/, "un ⚪ senza rimedio è un vicolo cieco");
});

test("AR-437 · un fallimento VERO resta rosso: ⚪ non è una scusa", () => {
  const tap = [
    "TAP version 13",
    "not ok 1 - il totale mostrato non è quello calcolato",
    "  error: 'Expected values to be strictly equal: 41 !== 43'",
    "# pass 0",
    "# fail 1",
  ].join("\n");
  const v = verdetto(1, tap);
  assert.equal(v.esito, "rosso", "senza questo caso la rete della cecità comprerebbe il verde");
});

test("AR-437 · la rete è STRETTA: «not found» generico non compra il bianco", () => {
  assert.equal(cecitaDaAmbiente("Error: user not found").cieco, false);
  assert.equal(cecitaDaAmbiente("404 not found").cieco, false);
  assert.equal(cecitaDaAmbiente("sh: 1: next: not found").cieco, true);
});

// ── ② Il freno sta sul DATO: chi accende il Pannello passa da lì, chiunque sia ────────────────────

test("AR-437 · avviaPannello RIFIUTA di partire senza pannello/node_modules, e lo dice", async () => {
  // Nessun `npm run dev` viene lanciato: è il punto. Prima si accendeva un processo destinato a
  // morire, si aspettavano tre minuti e si usciva rossi. Il rifiuto porta `ambienteNonPronto`, che
  // è il segno con cui chi chiama distingue ⚪ da ❌.
  await assert.rejects(
    () =>
      avviaPannello({
        radice: REPO,
        porta: 39399, // porta libera: se il freno non scatta, questa chiamata parte davvero e si vede
        urlBase: "http://127.0.0.1:39399",
        msTetto: 1000,
        esisteInPannello: () => false, // «sessione appena aperta»
      }),
    (e) => {
      assert.equal(e.ambienteNonPronto, true, "senza questo segno il chiamante non sa che è una cecità");
      assert.equal(e.caso, "assente");
      assert.match(e.message, /npm ci --prefix pannello/);
      return true;
    },
  );
});

// ── ③ Una domanda sola per DUE strumenti, non due porte con due colori ───────────────────────────

test("AR-437 · senza browser e senza Pannello installabile: due cecità, un solo colore", () => {
  const senzaBrowser = possoGuidareIlPannello({ esisteInPannello: () => true, playwright: false });
  assert.equal(senzaBrowser.puoi, false);
  assert.equal(senzaBrowser.caso, "senza-browser");

  // È il caso che PRIMA finiva rosso: il browser c'è, il Pannello non si accende.
  const senzaPannello = possoGuidareIlPannello({ esisteInPannello: () => false, playwright: true });
  assert.equal(senzaPannello.puoi, false);
  assert.equal(senzaPannello.caso, "assente", "va distinto dal browser: il rimedio è un altro comando");
  assert.match(senzaPannello.comando, /npm ci --prefix pannello/);

  // node_modules a metà è la trappola peggiore: sembra pronto e non lo è.
  const meta = possoGuidareIlPannello({ esisteInPannello: (f) => f === "node_modules", playwright: true });
  assert.equal(meta.puoi, false);
  assert.equal(meta.caso, "incompleto");

  assert.deepEqual(possoGuidareIlPannello({ esisteInPannello: () => true, playwright: true }), { puoi: true });
});

test("AR-437 · la riga di salto nomina i difetti che restano non verificati", () => {
  const r = rigaSalto({ motivo: "nessun Playwright", comando: "npx playwright install chromium", difetti: ["AR-613", "AR-614"] });
  // Il banco riconosce il salto SOLO in questa forma: se cambia, un ⚪ torna a contare come verde.
  assert.match(r, /^1\.\.0 # SKIP /, "è la forma che cervello/test-cervello.mjs sa leggere");
  assert.match(r, /AR-613, AR-614/, "un salto che non dice cosa resta scoperto non serve a niente");
  assert.match(r, /npx playwright install chromium/);

  // …e il banco la legge davvero: la forma e il lettore non possono divergere.
  const letto = verdetto(0, `TAP version 13\n${r}\n`);
  assert.equal(letto.esito, "non-eseguito");
});

// ── ④ Una parola, un padrone: la definizione non ha una seconda copia ────────────────────────────

test("AR-437 · il cancello e le prove leggono LA STESSA risposta, non due copie", async () => {
  const cancello = await import(join(REPO, "cervello/cancello-lotto.mjs"));
  assert.equal(
    cancello.ambientePannello,
    ambientePannello,
    "dev'essere lo stesso identico oggetto-funzione: due copie divergono in silenzio",
  );
  assert.ok(existsSync(join(REPO, "cervello/ambiente-prova.mjs")), "la casa unica esiste");
});

// ── ⑤ IL SALTO CHE COMPRAVA IL VERDE — trovato riparando, il 22/8 ────────────────────────────────
//
// La prova dichiara `1..0 # SKIP …` prima che `node:test` registri un caso. Ma il banco la lancia
// con `--test-reporter=tap`: quella riga è stdout del figlio, e il reporter la ripubblica
// COMMENTATA e col cancelletto protetto — `# 1..0 \# SKIP …` — poi chiude con `ok 1 - <file>` e
// esce ZERO. Il lettore cercava solo la forma cruda, quindi leggeva «✅ passato».
//
// Misurato togliendo `pannello/node_modules`: «✅ 2 file su 2 girano e passano» per due prove che
// avevano appena detto di non aver guardato niente. Peggio del rosso di partenza — un rosso è
// rumoroso, questo era muto.

test("AR-781 · il salto MASCHERATO dal reporter resta ⚪ (prima comprava il verde)", () => {
  // Il TAP vero, copiato dall'uscita del banco.
  const tap = [
    "TAP version 13",
    "# TAP version 13",
    "# 1..0 \\# SKIP non posso accendere il Pannello: AR-225, AR-417, AR-244 NON sono stati verificati qui",
    "# Subtest: cervello/test/c2-schermo.test.mjs",
    "ok 1 - cervello/test/c2-schermo.test.mjs",
    "1..1",
    "# pass 1",
    "# fail 0",
  ].join("\n");

  const v = verdetto(0, tap);
  assert.equal(v.esito, "non-eseguito", "uscita ZERO + «ok 1»: senza questo caso il salto compra il verde");
  assert.match(v.motivo, /AR-225, AR-417, AR-244/, "il motivo dev'essere QUELLO scritto dalla prova, non un generico");
});

test("AR-781 · la forma cruda continua a valere: le due letture non si escludono", () => {
  const v = verdetto(0, "TAP version 13\n1..0 # SKIP nessun browser qui: AR-613 non verificato\n");
  assert.equal(v.esito, "non-eseguito");
  assert.match(v.motivo, /AR-613/);
});

test("AR-781 · un «1..0» che NON è un salto non diventa ⚪ per sbaglio", () => {
  // Un file senza casi e senza dichiarazione non ha detto «non ho potuto»: ha detto «non c'è niente».
  // Resta ⚪ come prima (è la vecchia regola, e va bene) ma senza un motivo inventato.
  const v = verdetto(0, "TAP version 13\n1..0\n");
  assert.equal(v.esito, "non-eseguito");
  assert.match(v.motivo, /non aver potuto girare/);
});

// ── ⑥ IL FRATELLO — lo stesso salto, un secondo lettore, la stessa cecità ─────────────────────────
//
// Trovato con la spazzata: `non-vacuita.mjs` leggeva anche lui `1..0 # SKIP`, con una copia della
// regola che pure lei non conosceva la forma mascherata. Due copie di un freno non sono un freno.
// La cura non è stata aggiungerla anche lì: la lettura è stata SPOSTATA sul dato, in
// `cervello/ambiente-prova.mjs`, dove vale per chiunque legga — compreso un terzo lettore di domani.

test("AR-781 · banco e banco delle mutazioni leggono il salto ALLO STESSO MODO", () => {
  const mascherato = [
    "TAP version 13",
    "# TAP version 13",
    "# 1..0 \\# SKIP nessun browser qui: AR-613 non verificato",
    "ok 1 - cervello/test/c4-schermo-coda.test.mjs",
    "1..1",
    "# pass 1",
    "# fail 0",
  ].join("\n");

  assert.equal(verdetto(0, mascherato).esito, "non-eseguito", "il banco lo vede");
  assert.equal(haDichiaratoDiNonGuardare(mascherato), true, "e il banco delle mutazioni pure: prima no");
});

test("AR-781 · e su una corsa VERA che non ha saltato niente, nessuno dei due si tira indietro", () => {
  const vero = "TAP version 13\nok 1 - un caso vero\n1..1\n# pass 1\n# fail 0\n";
  assert.equal(verdetto(0, vero).esito, "ok");
  assert.equal(haDichiaratoDiNonGuardare(vero), false, "senza questo, ogni mutazione diventerebbe ⚪");
});

test("AR-781 · la lettura del salto ha UNA casa sola", () => {
  const s = readFileSync(join(REPO, "cervello/non-vacuita.mjs"), "utf8");
  assert.match(s, /leggiSalto/, "non-vacuita deve CHIEDERE, non avere la sua copia");
  assert.doesNotMatch(s, /1\\\.\\\.0\\b\[\^\\n\]\*#/, "la vecchia copia della regex non deve tornare");
});
