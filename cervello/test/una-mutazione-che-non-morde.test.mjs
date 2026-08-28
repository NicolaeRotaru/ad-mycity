#!/usr/bin/env node
// 🦷 IL SECONDO METRO: NON «SI PUO' LANCIARE» MA «MORDE» — AR-864.
//
// IL DIFETTO. `cervello/mutazioni-senza-esecutore.mjs` conta le voci che il banco non saprebbe
// LANCIARE, e sono 0 su 939. Ma una voce puo' essere perfettamente lanciabile e difendere NIENTE: la
// mutazione gira, il fix e' rotto, e la prova resta verde lo stesso. «Difetto chiuso» in questa casa
// vuol dire «la prova diventa rossa se il fix si rompe»: se una mutazione non morde, quella chiusura
// e' una promessa che nessuno ha verificato. Quel debito non aveva nessun sensore.
//
// COSA PROVA QUESTO FILE, e sono due cose diverse:
//   · il GIUDIZIO (`verdettoMorso`, funzione pura) — e soprattutto che un CAMPIONE senza scoperte
//     non e' un verde: guardare 25 voci su 939 e stampare ✅ e' il «verde muto» del catalogo;
//   · lo STRUMENTO INTERO, su un registro finto di due voci costruito qui: una che morde e una che
//     non morde. Se lo strumento non distinguesse le due, direbbe «tutto a posto» sul debito vero.
//
// Comando:  node cervello/test/una-mutazione-che-non-morde.test.mjs

import { test as prova } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { scegliCampione, verdettoMorso } from "../mutazioni-senza-esecutore.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const STRUMENTO = join(REPO, "cervello/mutazioni-senza-esecutore.mjs");

// ── il giudizio ───────────────────────────────────────────────────────────────────────────────
prova("① un campione senza scoperte NON e' un verde", () => {
  const v = verdettoMorso({ provate: 25, nonMordono: 0, totale: 939, tetto: null });
  assert.equal(v.esito, "campione", `un campione del 2,7% e' uscito «${v.esito}»`);
  assert.match(v.motivo, /non e' un verde/);
});

prova("② una voce che non morde e' una scoperta, anche in un campione", () => {
  assert.equal(verdettoMorso({ provate: 25, nonMordono: 1, totale: 939, tetto: null }).esito, "scoperta");
  assert.equal(verdettoMorso({ provate: 25, nonMordono: 3, totale: 939, tetto: 10 }).esito, "scoperta");
});

prova("③ senza tetto, un censimento completo con voci che non mordono resta una scoperta", () => {
  // Il caso che avevo sbagliato alla prima stesura: completo + nessun tetto cadeva in «debito» e
  // usciva 0. Cioe' lo strumento avrebbe stampato un verde sopra il debito che esiste per misurare.
  const v = verdettoMorso({ provate: 2, nonMordono: 1, totale: 2, tetto: null });
  assert.equal(v.esito, "scoperta");
});

prova("④ il tetto scende e non risale: sopra il tetto e' violazione, sotto e' debito da abbassare", () => {
  assert.equal(verdettoMorso({ provate: 939, nonMordono: 40, totale: 939, tetto: 30 }).esito, "violazione");
  assert.equal(verdettoMorso({ provate: 939, nonMordono: 20, totale: 939, tetto: 30 }).esito, "debito");
  assert.equal(verdettoMorso({ provate: 939, nonMordono: 30, totale: 939, tetto: 30 }).esito, "debito");
});

prova("⑤ zero provate e' ⚪, non ✅", () => {
  assert.equal(verdettoMorso({ provate: 0, nonMordono: 0, totale: 939, tetto: 0 }).esito, "cieco");
});

prova("⑥ una saltata tiene il censimento incompleto: chi non ha guardato tutto non dice «tutto a posto»", () => {
  assert.equal(verdettoMorso({ provate: 2, nonMordono: 0, saltate: 1, totale: 3, tetto: 0 }).esito, "campione");
  assert.equal(verdettoMorso({ provate: 3, nonMordono: 0, nonMisurate: 0, saltate: 0, totale: 3, tetto: 0 }).esito, "pulito");
  // Il conto «provate === totale» da solo copriva gia' il caso qui sopra, quindi togliere la
  // clausola sulle saltate non faceva rosso. Questo caso le separa: e' il contratto della funzione
  // pura — una saltata non e' mai un censimento completo — anche su un'accoppiata di numeri che
  // dalla riga di comando oggi non si puo' produrre.
  assert.equal(verdettoMorso({ provate: 3, nonMordono: 0, nonMisurate: 0, saltate: 1, totale: 3, tetto: 0 }).esito, "campione");
});

prova("⑦ il campione si sceglie a fette, e --tutte le prende tutte", () => {
  const finti = Array.from({ length: 10 }, (_, i) => ({ difetto: `AR-${i}` }));
  assert.deepEqual(scegliCampione(finti, { da: 2, quante: 3 }).map((m) => m.difetto), ["AR-2", "AR-3", "AR-4"]);
  assert.equal(scegliCampione(finti, { tutte: true }).length, 10);
  assert.deepEqual(scegliCampione(finti, { difetti: ["AR-7"] }).map((m) => m.difetto), ["AR-7"]);
});

// ── lo strumento intero, su un registro finto ─────────────────────────────────────────────────
prova("⑧ MONTATO: su due voci — una che morde e una che no — lo strumento le distingue", () => {
  const casa = mkdtempSync(join(tmpdir(), "morde-"));
  const sorvegliato = join(casa, "sorvegliato.mjs");
  const provaFile = join(casa, "prova.mjs");

  writeFileSync(
    sorvegliato,
    ["export function somma() {", "  return 2;", "}", "export const NON_GUARDATO = 1;", ""].join("\n"),
  );
  // La prova guarda `somma()` e NON guarda `NON_GUARDATO`. E' la differenza fra una difesa e una
  // promessa, ed e' tutta la domanda di AR-864.
  writeFileSync(
    provaFile,
    [
      'import assert from "node:assert/strict";',
      `import { somma } from "${sorvegliato}";`,
      "assert.equal(somma(), 2);",
      "",
    ].join("\n"),
  );

  const registro = join(casa, "mutanti.json");
  writeFileSync(
    registro,
    JSON.stringify({
      mutanti: [
        { lotto: 0, difetto: "AR-MORDE", nome: "questa difende davvero", file: sorvegliato, cerca: "return 2", sostituisci: "return 3", test: provaFile },
        { lotto: 0, difetto: "AR-FINTA", nome: "questa gira e non difende niente", file: sorvegliato, cerca: "NON_GUARDATO = 1", sostituisci: "NON_GUARDATO = 9", test: provaFile },
      ],
    }),
  );

  const r = spawnSync(process.execPath, [STRUMENTO, "--mordono", "--tutte", "--json"], {
    cwd: REPO,
    encoding: "utf8",
    env: { ...process.env, MUTANTI_FILE: registro, TETTI_FILE: join(casa, "tetti-che-non-esistono.json") },
    timeout: 300000,
  });
  const testo = String(r.stdout || "");
  const esito = JSON.parse(testo.slice(testo.indexOf("{")));

  assert.equal(esito.provate, 2, `non le ha provate tutte e due:\n${testo}\n${r.stderr}`);
  assert.equal(esito.mordono, 1, `la voce che morde non e' stata riconosciuta:\n${testo}`);
  assert.equal(esito.non_mordono, 1, `la voce che NON morde e' passata per buona: e' il difetto intero:\n${testo}`);
  assert.deepEqual(esito.elenco_non_mordono.map((e) => e.difetto), ["AR-FINTA"]);
  assert.equal(r.status, 1, "ha trovato una voce che non morde e non l'ha detto con l'uscita");
});

prova("⑩ MONTATO: un file in lavorazione NON si tocca — il banco ci scriverebbe sopra", () => {
  // Il banco rompe il file vero e poi lo rimette a posto com'era quando l'ha letto. Se un'altra
  // corsia scrive in quel file nel frattempo, il «rimette a posto» le cancella il lavoro. Questa e'
  // la difesa, ed e' l'unica di questo strumento che tocca il lavoro di qualcun altro.
  const casa = mkdtempSync(join(tmpdir(), "morde-"));
  const sorvegliato = join(casa, "sorvegliato.mjs");
  const provaFile = join(casa, "prova.mjs");
  writeFileSync(sorvegliato, ["export function somma() {", "  return 2;", "}", ""].join("\n"));
  writeFileSync(provaFile, ['import assert from "node:assert/strict";', `import { somma } from "${sorvegliato}";`, "assert.equal(somma(), 2);", ""].join("\n"));
  const registro = join(casa, "mutanti.json");
  writeFileSync(
    registro,
    JSON.stringify({
      mutanti: [
        { difetto: "AR-INTOCCABILE", nome: "punta a un file che qualcuno sta modificando", file: sorvegliato, cerca: "return 2", sostituisci: "return 3", test: provaFile },
      ],
    }),
  );

  const r = spawnSync(process.execPath, [STRUMENTO, "--mordono", "--tutte", "--json"], {
    cwd: REPO,
    encoding: "utf8",
    env: { ...process.env, MUTANTI_FILE: registro, TETTI_FILE: join(casa, "niente.json"), MORDONO_IN_LAVORAZIONE: sorvegliato },
    timeout: 300000,
  });
  const testo = String(r.stdout || "");
  const esito = JSON.parse(testo.slice(testo.indexOf("{")));
  assert.equal(esito.saltate, 1, `ha mutato un file che qualcun altro sta modificando:\n${testo}`);
  assert.equal(esito.provate, 0);
  assert.equal(r.status, 2, "una corsa che non ha guardato niente non e' un verde e non e' un rosso");

  // E il file dev'essere rimasto esattamente com'era: nessuno l'ha aperto.
  assert.match(readFileSync(sorvegliato, "utf8"), /return 2;/);
});

prova("⑨ il conto veloce di sempre resta veloce: senza --mordono non esegue nessuna mutazione", () => {
  const inizio = Date.now();
  const r = spawnSync(process.execPath, [STRUMENTO, "--json"], { cwd: REPO, encoding: "utf8", timeout: 120000 });
  const durata = Date.now() - inizio;
  assert.notEqual(r.status, null, "il conto veloce non e' arrivato in fondo");
  assert.ok(durata < 30000, `il conto che il cancello esegue a ogni giro ci ha messo ${durata}ms: un cancello lento si impara a saltarlo`);
});
