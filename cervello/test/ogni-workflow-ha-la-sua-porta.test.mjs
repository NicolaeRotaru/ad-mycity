#!/usr/bin/env node
// 🚪 AR-682 — OGNI WORKFLOW DEVE AVERE UNA PORTA, E LA PORTA DEVE PORTARE DA QUALCHE PARTE.
//
// IL DIFETTO. `.claude/workflows/radiografia-totale.js` esisteva sul disco e nessuna frase, in
// nessuno dei due registri (`COMANDI.md`, `CLAUDE.md`), lo evocava: una capacità che c'è e che
// nessuno può chiedere. Uno su sei. Non è un dettaglio d'ordine — è il modo in cui una macchina
// smette di sapere cosa sa fare: il file resta, invecchia, e il giorno che serve nessuno si ricorda
// che c'era. Il guardiano `cervello/guardiano-capacita.mjs` lo segnalava come drift 2.
//
// COSA MISURA QUESTO FILE. Esegue il guardiano VERO (`cervello/guardiano-capacita.mjs --json`) sul
// repo vero e pretende: nessun workflow orfano, `radiografia-totale` fra quelli con la porta, nessun
// comando che punti a un workflow inesistente, e il guardiano che guarda TUTTI i file del disco (un
// guardiano che ne guarda tre su sei è verde per cecità).
//
// ⚠️ CIÒ CHE QUESTO FILE NON PUÒ VEDERE, detto qui e non nascosto. «La porta si apre davvero» non è
// misurabile da Node: i sei workflow sono scritti in un dialetto del motore di Claude Code — `import`
// e `export` da modulo INSIEME a un `return` di primo livello — che nessun caricatore di Node accetta
// (`import()` risponde «Illegal return statement» su tutti e sei, non su uno). Quindi qui si prova che
// la porta ESISTE, non che si apre; la seconda metà è registrata come difetto nuovo perché una
// sintassi che nessuno può compilare si scopre rotta solo quando Nicola lancia il comando.
//
// 🟢 Sola lettura: esegue il guardiano vero e non tocca niente.
//
// NON-VACUITÀ (eseguita davvero): togliendo da `COMANDI.md` la riga che evoca «radiografia totale»
// i casi ① diventano rossi con l'elenco dei workflow senza porta.

import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WF_DIR = join(REPO, ".claude/workflows");

const casi = [];
async function prova(nome, fn) {
  try {
    await fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
}

/** Il verdetto del guardiano vero, letto dal suo JSON. Cieco (2) NON è verde: si dichiara. */
function verdettoDelGuardiano() {
  const args = [join(REPO, "cervello/guardiano-capacita.mjs"), "--json"];
  try {
    return { code: 0, j: JSON.parse(execFileSync("node", args, { encoding: "utf8" })) };
  } catch (e) {
    const testo = `${e.stdout || ""}`;
    let j = null;
    try {
      j = JSON.parse(testo);
    } catch {
      /* niente JSON: resta null e il caso lo dichiara */
    }
    return { code: e.status ?? -1, j, grezzo: testo + (e.stderr || "") };
  }
}

const workflowSulDisco = readdirSync(WF_DIR)
  .filter((f) => f.endsWith(".js"))
  .map((f) => f.replace(/\.js$/, ""))
  .sort();

// ═══ ① nessun workflow senza porta, e radiografia-totale nominata ═══════════════════════════════

await prova("① nessun workflow sul disco resta senza un comando che lo evochi", async () => {
  const { j, grezzo } = verdettoDelGuardiano();
  assert.ok(j, `il guardiano non ha risposto in JSON: ${String(grezzo).slice(0, 200)}`);
  assert.notEqual(j.verdetto?.stato, "cieco", `il guardiano è cieco (${j.verdetto?.motivo}): ⚪ non è ✅`);
  assert.deepEqual(j.workflow_orfani, [], "questi workflow esistono e nessuna porta ci porta");
  assert.equal(j.n_workflow, workflowSulDisco.length, "il guardiano non sta guardando tutti i workflow del disco");
});

await prova("① in particolare «radiografia-totale», che era l'uno su sei senza porta", async () => {
  const { j } = verdettoDelGuardiano();
  assert.ok(j, "il guardiano non ha risposto in JSON");
  assert.ok(workflowSulDisco.includes("radiografia-totale"), "il workflow non c'è più: se è stato tolto, togli anche questo caso");
  assert.ok(
    !(j.workflow_orfani || []).includes("radiografia-totale"),
    "radiografia-totale è di nuovo senza comando: AR-682 è tornato"
  );
});

await prova("① nessun comando punta a un workflow che non esiste", async () => {
  const { j } = verdettoDelGuardiano();
  assert.ok(j, "il guardiano non ha risposto in JSON");
  assert.deepEqual(j.comandi_rotti, [], "i registri promettono workflow che sul disco non ci sono");
});

// ═══ ② e il limite dichiarato: nessuno dei sei è caricabile da Node ══════════════════════════════

await prova("② dichiarato: i workflow non sono compilabili da qui, e vale per TUTTI e sei", async () => {
  // Questo caso non chiede una cura: fissa il LIMITE, così nessuno può leggere il verde di ① come
  // «i workflow funzionano». Se un giorno diventassero caricabili, questo diventa rosso e il limite
  // va tolto — che è l'unico modo in cui un limite dichiarato non diventa una scusa permanente.
  const esiti = [];
  for (const nome of workflowSulDisco) {
    try {
      await import(pathToFileURL(join(WF_DIR, `${nome}.js`)).href);
      esiti.push({ nome, caricato: true });
    } catch (e) {
      esiti.push({ nome, caricato: false, perche: e.message });
    }
  }
  const caricati = esiti.filter((e) => e.caricato).map((e) => e.nome);
  assert.deepEqual(caricati, [],
    `${caricati.join(", ")} adesso si carica da Node: il dialetto è cambiato, togli questo limite e prova davvero l'avvio`);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
