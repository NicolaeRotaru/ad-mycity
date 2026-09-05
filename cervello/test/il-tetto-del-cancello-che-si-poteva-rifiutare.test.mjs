// ⏱️ IL TETTO DEL CANCELLO CHE SI POTEVA RIFIUTARE — AR-916, il debito che AR-933 aveva dichiarato.
//
// IL CASO CHE HA ROTTO, corsa 33787462384 del 3/9: il passo «prove non vacue» ha un tetto di 900
// secondi scritto accanto alla sua chiamata, e ha girato SESSANTAQUATTRO MINUTI — finché l'orologio
// di GitHub non ha ucciso il cancello intero a 75, senza verdetto. Il tetto c'era e non ha morso:
// `spawnSync` allo scadere manda SIGTERM, che si può ignorare, e node non passa a SIGKILL.
//
// Queste prove ESEGUONO: costruiscono un figlio che rifiuta SIGTERM apposta e guardano chi vince.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { esegui } from "../cancello-lotto.mjs";

// Un figlio che ignora il segnale educato e continua: è la forma su cui il difetto si vede.
const SORDO = "process.on('SIGTERM', () => {}); setInterval(() => {}, 1000);";

test("IL CASO CHE HA ROTTO: un passo che rifiuta il segnale educato viene fermato lo stesso", () => {
  // ⚠️ IL TEMPO LO TIENE CHI GUARDA, NON CHI È GUARDATO — e questa forma me l'ha imposta il banco.
  // Scritta in-processo, con la mutazione applicata questa prova non diventava ROSSA: si piantava,
  // e il banco usciva ⚪ («il test non è arrivato in fondo»). Cioè la prova che difende «il tetto
  // deve mordere» non poteva fallire, perché per fallire aveva bisogno del tetto che stava
  // provando. Adesso `esegui` gira dentro un FIGLIO, e il tetto che conta è quello del padre —
  // con SIGKILL, che nessuno può rifiutare. Senza la cura il figlio non torna, il padre lo uccide
  // a 20 s e la prova è rossa con un messaggio che dice perché.
  // ⚠️ NIENTE TUBI FRA PADRE E FIGLIO, e anche questo me l'ha imposto il banco. Con la mutazione
  // applicata il figlio non torna; il padre lo uccide, ma `spawnSync` resta comunque appeso ad
  // aspettare che i tubi di stdout si chiudano — e il nipote sordo, che è ancora vivo, non li
  // chiude. Risultato: la prova non diventava rossa, si piantava, e il banco usciva ⚪. L'esito
  // passa da un FILE: senza tubi, l'uccisione del figlio torna subito e la prova può fallire.
  const esitoIn = join(mkdtempSync(join(tmpdir(), "tetto-cancello-")), "esito.json");
  const figlio = `
    import { writeFileSync } from "node:fs";
    import { esegui } from ${JSON.stringify(new URL("../cancello-lotto.mjs", import.meta.url).href)};
    const r = esegui("un passo sordo", process.execPath, ["-e", ${JSON.stringify(SORDO)}], { timeout: 2000 });
    writeFileSync(${JSON.stringify(esitoIn)}, JSON.stringify({ codice: r.codice }));
  `;
  const iniziato = Date.now();
  spawnSync(process.execPath, ["--input-type=module", "-e", figlio], {
    stdio: "ignore",
    timeout: 20_000,
    killSignal: "SIGKILL",
  });
  const durata = Date.now() - iniziato;
  assert.ok(existsSync(esitoIn), `il passo sordo non è stato fermato: dopo ${durata} ms il tetto non aveva ancora morso, e l'esito non è mai stato scritto — è il difetto del 3/9`);
  assert.equal(JSON.parse(readFileSync(esitoIn, "utf8")).codice, 124, "un passo ucciso dall'orologio vale 124: rosso dichiarato, non verde e non cieco");
  assert.ok(durata < 20_000, `e il tetto di 2 s deve mordere molto prima del mio: ${durata} ms`);
});

test("il passo ucciso lo DICE, invece di sparire dentro un rosso muto", () => {
  // Qui il figlio è EDUCATO apposta: dorme e accetta il segnale. Quello che questo caso difende è
  // il messaggio, non il segnale — e un figlio sordo lo farebbe dipendere dalla cura del caso qui
  // sopra, cioè piantarsi invece di fallire quando quella cura non c'è. Ogni caso deve poter
  // diventare rosso da solo.
  const r = esegui("un passo lento", process.execPath, ["-e", "setInterval(() => {}, 1000);"], { timeout: 2000 });
  assert.match(r.coda.join("\n"), /non ha finito in tempo/, "chi legge deve sapere che è stato il tempo, non il contenuto");
});

test("il difetto opposto: un passo che finisce da solo NON viene ucciso, e il suo esito resta il suo", () => {
  const r = esegui("un passo veloce", process.execPath, ["-e", "process.exit(2)"], { timeout: 30_000 });
  assert.equal(r.codice, 2, "il cieco resta cieco: il tetto non deve trasformare un esito in un altro");
  assert.equal(r.cieco, true);
  assert.equal(r.fallito, false, "e un cieco non è un rosso");
});
