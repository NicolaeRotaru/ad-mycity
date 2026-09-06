#!/usr/bin/env node
// 🧪 AR-880 — UN CIECO CHE USCIVA VERDE, cioè la veste peggiore della malattia di AR-859.
//
// LA MALATTIA. `cervello/chiusura-loop.mjs --gate` incrocia la SALA-OPERATIVA di oggi con i
// quaderni: chi ha scritto FATTO deve avere una riga ESITO. Quando il file della Sala non c'era,
// il gate stampava «assente — niente da verificare» e usciva **0**. AR-859 era un ⚪ travestito da
// ❌ (falso allarme: rumoroso, fastidioso, ma visibile). Questo era un ⚪ travestito da ✅:
// silenzioso, e chi legge conclude che va tutto bene. Lo legge `cervello/giro.sh` (riga ~518) sul
// serio, con `vincolo_da_rc`: con lo 0 il giro non riceveva niente da un controllo che non aveva
// aperto un solo file.
//
// LA CLAUSOLA CHE SALTA SEMPRE, e qui è pinnata in tutt'e due i versi. Il file assente poteva
// essere un reperto legittimo («nessuna Sala Operativa = la squadra non si parla») e allora
// l'uscita giusta sarebbe 1, non 2. Deciso guardando CHI LEGGE: a rc=1 `giro.sh` ordina al motore
// «registra l'ESITO per ognuno dei reparti con FATTO in Sala oggi» — senza la Sala quei reparti non
// esistono, quindi sarebbe un ordine impossibile e una bugia sul contenuto (è il difetto AR-881).
// Il reperto «la squadra non si parla» ha già un altro padrone: `repartiMuti` / `righeFresche` di
// `sala-regole.mjs`, dentro la sonda.
//
// PERCHÉ QUESTI QUATTRO CASI E NON UNO. Con il solo caso ① si potrebbe «curare» facendo uscire 2
// sempre — cioè spegnere il gate, trasformando un verde bugiardo in un silenzio, che è peggio. I
// casi ③ e ④ tengono il gate vivo: con la Sala in mano il verdetto resta 0 o 1 secondo il merito.
//
// 🟢 Sola lettura del repo: tutto avviene in una copia dell'albero dentro una cartella temporanea.

import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const CERVELLO = join(QUI, "..");
const SALA_REL = "MyCity-Vault/90-Memoria-AI/SALA-OPERATIVA.md";

// Le chiavi del battito vanno tolte: `stampSegnale` con le chiavi presenti farebbe una chiamata di
// rete dentro una prova. Senza, torna `false` e basta.
const AMBIENTE = { ...process.env, SUPABASE_URL: "", SUPABASE_SERVICE_KEY: "" };

/** Oggi con l'orologio da parete di Piacenza, lo stesso metro che usa `nowPiacenza()`. */
function oggiPiacenza() {
  return new Date().toLocaleString("sv-SE", { timeZone: "Europe/Rome" }).slice(0, 10);
}

/**
 * Una copia dell'albero: `cervello/` dentro una cartella nuova, e attorno SOLO quello che il caso
 * mette. `AD_ROOT` è la cartella sopra `cervello/`, quindi quello che il gate cerca nel vault non
 * c'è per davvero — non per finta.
 *
 * @param {null|string} sala il testo della Sala. `null` = il file non esiste. `"CARTELLA"` = al suo
 *   posto c'è una cartella: il posto c'è ma non si può leggere.
 */
function albero(sala) {
  const dir = mkdtempSync(join(tmpdir(), "ar861-"));
  cpSync(CERVELLO, join(dir, "cervello"), { recursive: true });
  const path = join(dir, SALA_REL);
  if (sala === "CARTELLA") {
    mkdirSync(path, { recursive: true });
  } else if (sala !== null) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, sala, "utf8");
  }
  return dir;
}

/** Lancia il gate dentro la copia e restituisce codice d'uscita e quello che ha detto. */
function gate(dir) {
  const r = spawnSync(process.execPath, [join(dir, "cervello", "chiusura-loop.mjs"), "--gate"], {
    encoding: "utf8",
    env: AMBIENTE,
  });
  return { rc: r.status, detto: `${r.stdout || ""}${r.stderr || ""}` };
}

function conAlbero(sala, fn) {
  const dir = albero(sala);
  try {
    fn(gate(dir), dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ① IL DIFETTO. Il posto dove dovevo guardare non c'è: non ho incrociato niente.
test("SUL SERIO: senza il file della Sala il gate esce 2, non 0 — non ha aperto niente", () => {
  conAlbero(null, ({ rc, detto }) => {
    assert.equal(rc, 2, `il gate senza SALA-OPERATIVA.md deve uscire 2 (non ho potuto misurare), non ${rc}. Ha detto: ${detto.slice(0, 400)}`);
    // E deve DIRLO: un 2 muto lo legge la macchina, non Nicola.
    assert.match(detto, /non c'è|cieco/i, "esce 2 ma non dice di non aver potuto guardare");
    assert.doesNotMatch(detto, /niente da verificare/, "sta ancora raccontando il cieco come se fosse un verde");
  });
});

// ② Il posto c'è ma non si lascia leggere: un buco non è uno zero. Prima questo caso non c'era
//    proprio — `readFileSync` esplodeva e il processo usciva 1, cioè col codice del reperto.
test("SUL SERIO: la Sala c'è ma è illeggibile → 2, non un errore travestito da reperto", () => {
  conAlbero("CARTELLA", ({ rc, detto }) => {
    assert.equal(rc, 2, `Sala illeggibile: atteso 2, ottenuto ${rc}. Ha detto: ${detto.slice(0, 400)}`);
  });
});

// ③ IL ROVESCIO CHE IMPEDISCE LA CURA SBAGLIATA. La Sala c'è e nessuno ha scritto FATTO oggi:
//    ho guardato, e non deve l'ESITO nessuno. Deve restare verde, o il gate diventerebbe un
//    allarme perpetuo — e un allarme perpetuo si impara a ignorare.
test("SUL SERIO: la Sala c'è e nessuno ha scritto FATTO oggi → 0, il gate non diventa un allarme fisso", () => {
  const vecchia = `# Sala Operativa\n\n- 2020-01-02 09:00 · @vendite · FATTO · roba di cinque anni fa\n`;
  conAlbero(vecchia, ({ rc, detto }) => {
    assert.equal(rc, 0, `nessun FATTO di oggi: atteso 0, ottenuto ${rc}. Ha detto: ${detto.slice(0, 400)}`);
  });
});

// ④ IL REPERTO VERO, quello per cui il gate esiste: c'è chi ha detto FATTO oggi e non ha l'ESITO.
//    Se questo caso smettesse di uscire 1, la cura avrebbe spento il gate invece di ripararlo.
test("SUL SERIO: FATTO in Sala oggi senza ESITO nel quaderno → 1, il reperto resta un reperto", () => {
  const oggi = oggiPiacenza();
  const sala = `# Sala Operativa\n\n- ${oggi} 08:30 · @vendite · FATTO · pitch chiuso stamattina\n`;
  conAlbero(sala, ({ rc, detto }) => {
    assert.equal(rc, 1, `FATTO senza ESITO: atteso 1, ottenuto ${rc}. Ha detto: ${detto.slice(0, 400)}`);
    assert.match(detto, /vendite/, "il gate esce 1 ma non dice CHI è inadempiente");
  });
});
