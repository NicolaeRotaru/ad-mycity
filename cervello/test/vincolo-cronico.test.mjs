#!/usr/bin/env node
// AR-687 — nel giro, un guardiano rosso da tre settimane occupava il prompt come uno rosso da un minuto.
//
// LA RADICE. AR-440 aveva costruito il modo di misurare la cronicità e l'aveva agganciato dove lo
// stato fra un giro e l'altro già esisteva: la visita di salute. Nel GIRO no: lì ogni vincolo era una
// stringa vuota o piena, senza storia. Il modulo c'era ed esponeva tutto quello che serviva
// (`quadroCronicita`, `daPortareANicola`) — mancava solo la riga che lo chiama. Un difetto che vive
// nello spazio fra due file: nessuno dei due è sbagliato, e insieme non fanno il lavoro.
//
// PERCHÉ CONTA. Un vincolo che si ripete uguale per settimane smette di essere letto: diventa lo
// sfondo del prompt. Da lì in poi la difesa è spenta di fatto, senza che nessuno l'abbia decisa — e
// il giorno che quel guardiano diventa rosso per un motivo NUOVO, nessuno se ne accorge.
//
// COSA PROVA QUESTO FILE:
//   ① la frase che arriva al motore è decisa da una funzione PURA, e dice l'età col suo metro;
//   ② un conto che non si è potuto leggere NON diventa «nessuno è cronico»: diventa «non lo so»,
//      e il giro ripete tutto — si sbaglia dalla parte che ripete di troppo, mai da quella che tace;
//   ③ la card per Nicola parte UNA volta, quando l'allarme taglia la soglia, non a ogni giro;
//   ④ **le righe VERE di `cervello/giro.sh` vengono ESEGUITE** (estratte fra i due marcatori) e il
//      testo finisce davvero dentro `$PROMPT`: è l'aggancio che mancava, e qui non è cercato con una
//      parola — è fatto girare;
//   ⑤ se `node` non parte, il prompt lo DICHIARA invece di restare muto (un errore non è una misura);
//   ⑥ il blocco non si chiama `*_VINCOLO`: se lo fosse, il conto di AR-387 conterebbe due volte gli
//      stessi rossi. Provato eseguendo la stessa derivazione `compgen` che usa il giro.
//
// NON-VACUITÀ (verificata rompendo il fix apposta): in `cervello/giro.sh`, sostituendo
// `CRONICITA_BLOCCO="$_cron_out"` con `CRONICITA_BLOCCO=""` l'aggancio muore e i casi ④ diventano
// ROSSI — è esattamente lo stato in cui il giro misurava zero perché non chiedeva niente a nessuno.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GIRI_PER_CRONICO, bloccoPerIlGiro, giroCronicita } from "../cronicita-allarmi.mjs";

const REPO = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** Una cartella usa-e-getta: nessun test di questa macchina scrive nello stato vero del repo. */
const tempo = () => mkdtempSync(join(tmpdir(), "cronicita-giro-"));

/**
 * LE RIGHE VERE DEL GIRO, non una loro copia.
 *
 * Copiare il blocco dentro il test sarebbe la malattia di questo lotto in persona: la prova
 * resterebbe verde mentre `giro.sh` cambia sotto. Qui il blocco si ESTRAE dal file vero fra due
 * marcatori e si esegue; se qualcuno lo toglie, l'estrazione fallisce e il test è rosso.
 */
function bloccoDelGiro() {
  const src = readFileSync(join(REPO, "cervello/giro.sh"), "utf8");
  const apre = ">>> AR-687 BLOCCO CRONICITA";
  const chiude = "<<< AR-687 BLOCCO CRONICITA";
  const i = src.indexOf(apre);
  const j = src.indexOf(chiude);
  assert.ok(i > 0 && j > i, "in cervello/giro.sh non trovo più il blocco AR-687 fra i suoi marcatori");
  const dentro = src.slice(src.indexOf("\n", i) + 1, src.lastIndexOf("\n", j));
  assert.match(dentro, /cronicita-allarmi\.mjs/, "il blocco estratto non chiama più il modulo");
  return dentro;
}

/** Esegue il blocco vero con un ambiente finto e restituisce il `$PROMPT` che ne esce. */
function eseguiBlocco({ attivi = [], conto = null, nodeRotto = false } = {}) {
  const dir = tempo();
  const stato = join(dir, "conto.json");
  if (conto) writeFileSync(stato, JSON.stringify(conto));
  let percorso = process.env.PATH;
  if (nodeRotto) {
    const finto = join(dir, "node");
    writeFileSync(finto, "#!/bin/sh\nexit 9\n");
    chmodSync(finto, 0o755);
    percorso = `${dir}:${process.env.PATH}`;
  }
  const script = [
    "set -uo pipefail",
    `SCRIPT_DIR=${JSON.stringify(join(REPO, "cervello"))}`,
    `VINCOLI_ATTIVI=(${attivi.map((a) => JSON.stringify(a)).join(" ")})`,
    'PROMPT="INIZIO-PROMPT"',
    bloccoDelGiro(),
    // La stessa derivazione della riga 988 del giro: quali `*_VINCOLO` esistono dopo il blocco.
    "echo '---VINCOLI---'",
    "for _v in $(compgen -v | grep -E '_VINCOLO$' | sort); do echo \"$_v\"; done",
    "echo '---PROMPT---'",
    'printf "%s" "$PROMPT"',
  ].join("\n");
  const out = execFileSync("bash", ["-c", script], {
    encoding: "utf8",
    env: { ...process.env, PATH: percorso, CRONICITA_STATO: stato },
  });
  const [, vincoli, prompt] = out.split(/---VINCOLI---\n|---PROMPT---\n/);
  return { prompt, vincoli: vincoli.split("\n").filter(Boolean) };
}

// ── ① La frase è decisa da una funzione pura, e porta l'età col suo metro ────────────────────────

prova("① niente di cronico = nessuna riga in più: un «tutto bene» ripetuto a ogni giro è il rumore che curiamo", () => {
  const q = { affidabile: true, cronici: [], daPortareANicola: [] };
  assert.equal(bloccoPerIlGiro(q), "");
});

prova("① un vincolo cronico arriva col numero E col suo metro, non con un numero secco", () => {
  const dir = tempo();
  const stato = join(dir, "c.json");
  writeFileSync(stato, JSON.stringify({ sensori: 11 }));
  const testo = bloccoPerIlGiro(giroCronicita(stato, ["sensori"]));
  assert.match(testo, /\*\*sensori\*\*/, "chi è cronico si nomina");
  assert.match(testo, /12 giri di fila/, "«12» da solo non dice se sono ore, giorni o giri");
  assert.match(testo, /nessuno l'ha risolto/);
});

prova("① un rosso di un giro solo NON entra nel blocco: sarebbe la stessa frase per due cose diverse", () => {
  const dir = tempo();
  const testo = bloccoPerIlGiro(giroCronicita(join(dir, "c.json"), ["sensori"]));
  assert.equal(testo, "", "al primo giro un vincolo è una notizia, non una condizione");
});

// ── ② Un conto non letto non diventa «nessuno è cronico» ─────────────────────────────────────────

prova("② memoria illeggibile → il blocco dice «NON SO» e ordina di ripetere tutto", () => {
  const dir = tempo();
  const stato = join(dir, "rotto.json");
  writeFileSync(stato, "{ questo non è json");
  const q = giroCronicita(stato, ["sensori"]);
  assert.equal(q.affidabile, false, "un file di stato corrotto non è un conto valido");
  const testo = bloccoPerIlGiro(q);
  assert.match(testo, /NON SO DA QUANTI GIRI/);
  assert.match(testo, /come se fosse nuovo/, "l'errore deve produrre più ripetizione, non meno");
  assert.doesNotMatch(testo, /da almeno \d+ giri di fila/, "non si elenca come cronico ciò che non si è potuto contare");
});

prova("② e il motivo del guasto viaggia col dato, invece di restare su una riga di log", () => {
  const dir = tempo();
  const stato = join(dir, "rotto.json");
  writeFileSync(stato, "[]");
  const testo = bloccoPerIlGiro(giroCronicita(stato, ["sensori"]));
  assert.match(testo, /non ha la forma attesa/);
});

// ── ③ La card per Nicola parte una volta sola ────────────────────────────────────────────────────

prova("③ appena taglia la soglia si accoda UNA card, con dove scriverla", () => {
  const dir = tempo();
  const stato = join(dir, "c.json");
  writeFileSync(stato, JSON.stringify({ sensori: GIRI_PER_CRONICO - 1 }));
  const testo = bloccoPerIlGiro(giroCronicita(stato, ["sensori"]));
  assert.match(testo, /APPENA DIVENTATI CRONICI: sensori/);
  assert.match(testo, /AZIONI-IN-ATTESA\.md/, "«portalo a Nicola» senza dire dove non è un'istruzione");
});

prova("③ al giro dopo la card NON si ripete: una card ogni giro è la stessa malattia, un piano più su", () => {
  const dir = tempo();
  const stato = join(dir, "c.json");
  writeFileSync(stato, JSON.stringify({ sensori: GIRI_PER_CRONICO + 4 }));
  const testo = bloccoPerIlGiro(giroCronicita(stato, ["sensori"]));
  assert.match(testo, /da almeno 3 giri di fila/, "resta cronico");
  assert.doesNotMatch(testo, /APPENA DIVENTATI CRONICI/);
});

prova("③ il vincolo NON viene tolto dal prompt: si toglie il silenzio sull'età, non la difesa", () => {
  // La scheda proponeva di toglierlo. Togliere «non inventare numeri» perché lo ripetiamo da tre
  // giri spegnerebbe una difesa proprio quando serve di più: il blocco si AGGIUNGE, mai sostituisce.
  const r = eseguiBlocco({ attivi: ["SENSORI"], conto: { SENSORI: 9 } });
  assert.match(r.prompt, /^INIZIO-PROMPT/, "il prompt di prima resta intero");
  assert.match(r.prompt, /10 giri di fila/, "l'età si AGGIUNGE al prompt: se non c'è, l'aggancio non ha fatto niente");
});

// ── ④ Le righe vere del giro, eseguite ───────────────────────────────────────────────────────────

prova("④ ESEGUENDO il blocco vero di giro.sh, l'età del vincolo finisce dentro $PROMPT", () => {
  const r = eseguiBlocco({ attivi: ["SENSORI", "TASSO"], conto: { SENSORI: 20, TASSO: 1 } });
  assert.match(r.prompt, /Da quanti giri dicono no/, "il titolo della sezione non è arrivato nel prompt");
  assert.match(r.prompt, /\*\*SENSORI\*\* — acceso in 21 giri di fila/);
  assert.doesNotMatch(r.prompt, /\*\*TASSO\*\*/, "TASSO è al secondo giro: non è ancora una condizione");
});

prova("④ quando non c'è niente di cronico il giro non aggiunge NESSUNA riga", () => {
  const r = eseguiBlocco({ attivi: ["SENSORI"] });
  assert.equal(r.prompt, "INIZIO-PROMPT");
});

prova("④ senza nessun vincolo acceso il blocco gira lo stesso: è così che il conto si azzera", () => {
  const r = eseguiBlocco({ attivi: [], conto: { SENSORI: 9 } });
  assert.equal(r.prompt, "INIZIO-PROMPT", "spento non è cronico");
});

// ── ⑤ Se lo strumento non parte, il prompt lo dichiara ───────────────────────────────────────────

prova("⑤ node che non parte NON diventa «nessuno è cronico»: il prompt dichiara di non sapere", () => {
  const r = eseguiBlocco({ attivi: ["SENSORI"], conto: { SENSORI: 9 }, nodeRotto: true });
  assert.match(r.prompt, /NON HO POTUTO MISURARE DA QUANTI GIRI/);
  assert.match(r.prompt, /rc=9/, "il codice del guasto va detto: senza, non si può nemmeno ripararlo");
  assert.match(r.prompt, /ripetilo per intero/);
});

// ── ⑥ Non è un vincolo in più: è l'età di quelli già contati ─────────────────────────────────────

prova("⑥ il blocco NON dichiara nessun `*_VINCOLO`: contare due volte gli stessi rossi è mentire", () => {
  const r = eseguiBlocco({ attivi: ["SENSORI"], conto: { SENSORI: 9 } });
  assert.deepEqual(r.vincoli, [], `il blocco ha creato ${r.vincoli.join(", ")}: il conto di AR-387 li conterebbe come cancelli nuovi`);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
