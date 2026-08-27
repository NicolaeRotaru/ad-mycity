#!/usr/bin/env node
// AR-843 — «In giro.sh 27 vincoli su 96 si scrivono il testo a mano, e nessuno ha controllato uno
// per uno se sanno dire non ho potuto misurare.»
//
// Il contratto dei guardiani ha tre risposte — 0 passato · 1 bocciato · 2 cieco — e la terza è
// quella che si perde: tradurla nel testo di dominio racconta al motore una diagnosi che nessuno ha
// fatto, e un vincolo sbagliato non viene ignorato, viene seguito. AR-842 era un caso vivo.
//
// Questo file prova il CONTATORE, non i sei blocchi che ho riparato: quelli li tiene il tetto a
// zero, che il cancello del lotto esegue a ogni consegna. La prova del contatore è su ingressi
// finti — un `giro.sh` scritto qui dentro — perché è l'unico modo di verificare che sappia dire
// SIA sì SIA no. Un contatore che non può dire di no non è un contatore.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assegnazioniAMano,
  dichiaraUscita2,
  parlaDelCieco,
  governatoDaUnRc,
  guardianoDallInvocazione,
  vincoliVivi,
  verdetto,
} from "../vincoli-senza-cieco.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: e.message }); }
};

/** Un guardiano finto: `2` se deve poter accecarsi, niente se no. */
const conUscita2 = 'if (rotto) { process.exit(2); }\nprocess.exit(violazioni ? 1 : 0);';
const senzaUscita2 = 'process.exit(violazioni ? 1 : 0);';

prova("il caso che ha rotto: un vincolo a mano su un guardiano che può accecarsi è VIVO", () => {
  const giro = `
  _x_rc=$?
  if [ "$_x_rc" -ne 0 ]; then
    X_VINCOLO="⛔ COSA GRAVE (x-check.mjs rc=$_x_rc): sta succedendo la cosa grave."
  fi`;
  const r = vincoliVivi(giro, () => conUscita2);
  assert.equal(r.vivi.length, 1, "non l'ha visto");
  assert.equal(r.vivi[0].guardiano, "x-check.mjs");
});

prova("lo stesso vincolo su un guardiano che NON può accecarsi non è un difetto", () => {
  const giro = `
  _x_rc=$?
  if [ "$_x_rc" -ne 0 ]; then
    X_VINCOLO="⛔ COSA GRAVE (x-check.mjs rc=$_x_rc): sta succedendo la cosa grave."
  fi`;
  const r = vincoliVivi(giro, () => senzaUscita2);
  assert.equal(r.vivi.length, 0, "accusa un guardiano che non può dire 2: un contatore che accusa gli innocenti si impara a ignorare");
  assert.equal(r.senzaUscita2.length, 1);
});

prova("chi passa dal contratto non viene contato: è la cura, non il difetto", () => {
  const giro = `
  _x_rc=$?
  X_VINCOLO="$(vincolo_da_rc "x-check.mjs" "$_x_rc" "⛔ COSA GRAVE (x-check.mjs)")"`;
  const r = vincoliVivi(giro, () => conUscita2);
  assert.equal(r.vivi.length, 0);
  assert.equal(assegnazioniAMano(giro).length, 0, "il contratto è stato contato come «scritto a mano»");
});

prova("due righe, una per il bocciato e una per il cieco: il guardiano è coperto", () => {
  // È la forma che usano `prove-oneste` e `gate-veri`, ed è corretta: si guarda il GUARDIANO, non
  // la singola riga, o la riga del bocciato risulterebbe scoperta per sempre.
  const giro = `
  _x_rc=$?
  if [ "$_x_rc" = 1 ]; then
    X_VINCOLO="⛔ COSA GRAVE (x-check.mjs rc=1): sta succedendo la cosa grave."
  elif [ "$_x_rc" = 2 ]; then
    X_VINCOLO="⚠️ GUARDIANO CIECO (x-check.mjs rc=2): non è riuscito a misurare."
  fi`;
  const r = vincoliVivi(giro, () => conUscita2);
  assert.equal(r.vivi.length, 0, "una riga scoperta ha coperto il guardiano intero al contrario");
  assert.equal(r.coperti.length, 1);
});

prova("un'inizializzazione con un commento accanto NON è un vincolo", () => {
  // Il conto saliva da 8 a 46 senza questo: quasi tutte le dichiarazioni in cima a giro.sh hanno un
  // commento in coda, e finivano dentro come «vincoli muti».
  const giro = `X_VINCOLO=""      # AR-999: il vincolo di X, popolato sotto`;
  assert.deepEqual(assegnazioniAMano(giro), []);
});

prova("un vincolo governato da un CONTEGGIO, non da un rc, non riguarda questo contratto", () => {
  // `CAL_VINCOLO` scatta su «zero voci strutturate» e nomina `calibrazione.mjs` solo per dire all'AI
  // quale comando chiamare. Accusarlo di non saper dire «non lo so» non vuol dire niente.
  const giro = `
  _quante="$(node -e '…')"
  if [ "$_quante" = "0" ]; then
    X_VINCOLO="⛔ SPENTO: chiama 'node cervello/x-check.mjs prevedi'."
  fi`;
  assert.deepEqual(assegnazioniAMano(giro), [], "ha contato un vincolo che nessun codice d'uscita governa");
  assert.equal(governatoDaUnRc(giro.split("\n"), 3), false);
});

prova("se il testo non nomina nessuno, il guardiano si cerca nell'INVOCAZIONE sopra", () => {
  // Quattro vincoli veri prendono il testo dall'uscita del comando. Fermarsi a «non lo so» sarebbe
  // la stessa malattia che questo file esiste per non accettare, commessa dentro la cura.
  const giro = `
  _x_out="$(node "$SCRIPT_DIR/x-check.mjs" 2>&1)"; _x_rc=$?
  if [ "$_x_rc" -ne 0 ]; then
    X_VINCOLO="$(printf '%s' "$_x_out" | head -1)"
  fi`;
  const a = assegnazioniAMano(giro);
  assert.equal(a.length, 1);
  assert.equal(a[0].guardiano, "x-check.mjs", "resta ⚪, e ⚪ non è mai un verde");
  assert.equal(guardianoDallInvocazione(giro.split("\n"), 3), "x-check.mjs");
});

prova("il rilevatore dell'uscita 2 guarda il codice, non i commenti", () => {
  assert.equal(dichiaraUscita2("process.exit(2);"), true);
  assert.equal(dichiaraUscita2("process.exit( 2 );"), true);
  assert.equal(dichiaraUscita2("process.exit(1);"), false);
  assert.equal(dichiaraUscita2(""), false);
});

prova("le parole del cieco: la parola di casa è CIECO, in maiuscolo", () => {
  assert.equal(parlaDelCieco("⚠️ GUARDIANO CIECO (x rc=2)"), true);
  assert.equal(parlaDelCieco("⛔ FRENO COSTI CIECO (AR-196)"), true, "un guardiano coperto risultava scoperto: verificato su freno-costi");
  assert.equal(parlaDelCieco("⛔ COSA GRAVE: sta succedendo la cosa grave."), false);
});

prova("il verdetto sa dire di no, di sì, e «non lo so»", () => {
  assert.equal(verdetto({ quanti: 1, tetto: 0 }).rc, 1, "sopra il tetto deve BLOCCARE");
  assert.equal(verdetto({ quanti: 0, tetto: 0 }).rc, 0);
  assert.equal(verdetto({ quanti: 0, tetto: 5 }).rc, 0, "sotto il tetto è debito dichiarato, non una violazione");
  assert.equal(verdetto({ quanti: 3, tetto: null }).rc, 2, "senza tetto è CIECO: e un cieco non è un verde — nemmeno qui dentro");
});

prova("il motivo dice il DANNO, non la regola", () => {
  const v = verdetto({ quanti: 1, tetto: 0 });
  assert.match(v.detto, /il motore la seguirebbe/, "«hai violato una regola» non fa capire perché conta");
});

prova("il contatore è MONTATO nel cancello del lotto, non solo scritto", () => {
  // La malattia di casa, e la stessa che AR-843 ha appena curato in sei posti: un cancello
  // costruito bene su una porta che nessuno usa. Il tetto è zero, quindi qui basta un vincolo nuovo
  // scritto a mano per far rosso — ma solo se qualcuno esegue il contatore.
  const gate = readFileSync(join(QUI, "..", "cancello-lotto.mjs"), "utf8");
  assert.match(
    gate,
    /passi\.push\(esegui\((?:(?!\)\);)[\s\S])*vincoli-senza-cieco\.mjs/,
    "il cancello non esegue il contatore: il tetto non ferma nessuno",
  );
});

const rotte = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "ok" : "NON ok"} — ${c.nome}${c.ok ? "" : `\n   ${c.err}`}`);
console.log(`\n${casi.length - rotte.length}/${casi.length} passate`);
if (rotte.length) process.exit(1);
