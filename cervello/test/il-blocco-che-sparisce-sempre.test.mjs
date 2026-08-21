#!/usr/bin/env node
// «COSA NON HO VERIFICATO» — il blocco che sparisce sempre, e il freno che non c'era da quel lato.
//
// LA STORIA. Le risposte lunghe a Nicola aprono con quattro blocchi: «In parole semplici · Cosa
// cambia per te · Cosa devi fare · Cosa non ho verificato». L'ultimo è quello che gli dice di quanto
// fidarsi — cosa NON è stato provato. È anche quello che sparisce: misurato l'11/8, mancava nel
// 100% dei 26 messaggi usciti dal server, mentre gli altri tre c'erano sempre.
//
// Il freno esisteva già, ma da un lato solo: il cancello dello Stop misura i messaggi della CHAT
// prima che partano. Il worker sul server non ci passa — è la malattia che il registro chiama
// «porta-laterale-senza-i-freni-della-principale». E `conta-blocco-mancante.mjs` misura il PASSATO:
// dice quanti messaggi erano fatti male DOPO che sono partiti. Il controllo `cervello.scrittura`
// stava rosso all'80% proprio per questo.
//
// COSA PROVA QUESTO FILE, eseguendo:
//   ① su un testo lungo a cui manca «Cosa non ho verificato», la domanda risponde col nome del
//      blocco mancante — è il caso vero dei 26 messaggi;
//   ② su un testo lungo completo non accusa nessuno;
//   ③ su un testo CORTO non pretende niente: i blocchi lì pesano più di quello che reggono
//      (AR-530), e un freno che suona sempre viene aggirato al secondo giro;
//   ④ la risposta è la STESSA che dà il cancello della chat — non un secondo misuratore che
//      diverge al primo ritocco;
//   ⑤ la porta da bash che usa il worker torna gli stessi nomi ed esce SEMPRE 0: un rosso lì
//      farebbe buttare via la risposta già scritta per Nicola.
//
// COSA NON PROVA, e va detto: le righe di `worker.sh` che appendono l'avviso. Sono bash, si provano
// con `bats`, e su questa macchina `bats` non è installato — le 29 prove in bash sono ⚪ per tutti.
// Qui è provata la DECISIONE (quali blocchi mancano, e quando si pretendono), che è la parte dove
// il difetto viveva; il pezzo bash è tre righe che chiamano questa porta e incollano una frase.

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const SI_CAPISCE = join(REPO, "cervello/si-capisce.mjs");
const { blocchiMancanti, misura } = await import(join(REPO, "cervello/si-capisce.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** Un messaggio lungo come quelli veri, con i blocchi che gli passo e basta. */
const messaggioLungo = (blocchi) =>
  [
    ...blocchi.map((b) => `${b}: una frase vera che risponde a questa domanda con parole semplici.`),
    ...Array.from(
      { length: 24 },
      (_, i) => `Riga di contenuto numero ${i + 1}: qui si spiega una cosa concreta, con un numero vero accanto.`,
    ),
  ].join("\n\n");

const TUTTI = ["In parole semplici", "Cosa cambia per te", "Cosa devi fare", "Cosa non ho verificato"];

// ── ① Il caso vero dei 26 messaggi ──────────────────────────────────────────

prova("su un testo lungo senza «Cosa non ho verificato», il buco viene NOMINATO", () => {
  const { mancanti } = blocchiMancanti(messaggioLungo(TUTTI.slice(0, 3)));
  assert.deepEqual(
    mancanti,
    ["Cosa non ho verificato"],
    "è il blocco che sparisce nel 100% dei messaggi del server: se non lo nomina, il freno non serve",
  );
});

prova("e se ne mancano due, li dice tutti e due", () => {
  const { mancanti } = blocchiMancanti(messaggioLungo(TUTTI.slice(0, 2)));
  assert.deepEqual(mancanti, ["Cosa devi fare", "Cosa non ho verificato"]);
});

// ── ② e ③ Non è un allarme generico ─────────────────────────────────────────

prova("un testo lungo con tutte e quattro le risposte non accusa nessuno", () => {
  assert.deepEqual(blocchiMancanti(messaggioLungo(TUTTI)).mancanti, []);
});

prova("su una risposta CORTA non si pretende niente", () => {
  assert.deepEqual(
    blocchiMancanti("Fatto: ho riavviato il worker, adesso gira.").mancanti,
    [],
    "quattro titoli sopra una riga sono impalcatura che pesa più di quello che regge (AR-530)",
  );
});

prova("e un testo vuoto non è un testo fatto male", () => {
  assert.deepEqual(blocchiMancanti("").mancanti, []);
  assert.deepEqual(blocchiMancanti(null).mancanti, []);
  assert.equal(blocchiMancanti("").misurato, true, "un testo vuoto l'ho guardato eccome");
});

// ── ④ Una testa sola, non due che divergono ────────────────────────────────

prova("la risposta è la stessa che dà il misuratore del cancello della chat", () => {
  const testo = messaggioLungo(TUTTI.slice(0, 3));
  const dalCancello = misura(testo)
    .problemi.filter((p) => p.tipo === "manca-una-risposta")
    .map((p) => p.trovato);
  assert.deepEqual(
    blocchiMancanti(testo).mancanti,
    dalCancello,
    "due misuratori della stessa cosa divergono al primo ritocco: qui la testa deve essere una sola",
  );
});

// ── ⑤ La porta che usa il worker ───────────────────────────────────────────

prova("la porta da bash torna gli stessi nomi, e distingue «misurato» da «non ho potuto»", () => {
  const dir = mkdtempSync(join(tmpdir(), "mycity-blocchi-"));
  try {
    const f = join(dir, "risposta.md");
    writeFileSync(f, messaggioLungo(TUTTI.slice(0, 3)));
    const r = spawnSync("node", [SI_CAPISCE, "--blocchi", f], { encoding: "utf8", cwd: REPO });
    assert.equal(
      r.status,
      0,
      "0 = misurato. Un rosso qui farebbe buttare via la risposta già scritta per Nicola: il freno è la visibilità, non il blocco",
    );
    assert.deepEqual(r.stdout.split("\n").filter(Boolean), ["Cosa non ho verificato"]);

    // ⑥ «non ho potuto misurare» NON è «va bene»: ha un codice suo, o sarebbe un verde regalato
    const vuoto = spawnSync("node", [SI_CAPISCE, "--blocchi", join(dir, "non-c-e.md")], { encoding: "utf8", cwd: REPO });
    assert.equal(vuoto.status, 2, "un file che non c'è non l'ho misurato: dire 0 sarebbe un verde uscito dal nulla");
    assert.equal(vuoto.stdout.trim(), "");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("e il worker chiama davvero quella porta", () => {
  const worker = spawnSync("bash", ["-n", join(REPO, "cervello/worker.sh")], { encoding: "utf8" });
  assert.equal(worker.status, 0, `worker.sh non è sintatticamente sano: ${worker.stderr}`);
  const src = spawnSync("grep", ["-c", "si-capisce.mjs\" --blocchi", join(REPO, "cervello/worker.sh")], {
    encoding: "utf8",
  });
  assert.ok(Number(src.stdout.trim()) > 0, "il freno non è agganciato al worker: resta un file che nessuno esegue");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
