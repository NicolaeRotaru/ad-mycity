#!/usr/bin/env node
// AR-635 · AR-636 · AR-637 · AR-638 — la prova che un workflow non può più nascere senza i suoi limiti.
//
// Perché il test sta sul MODULO e non su un `grep` nel file: cercare «timeout-minutes» dentro un
// YAML dice che quella parola c'è da qualche parte, non che il job ce l'abbia. Il 13/8 il battito
// esterno era l'unico job senza tetto di tempo in un file che parlava di tetti di tempo nei commenti:
// un grep sarebbe stato verde. Qui la decisione la esegue una funzione, e la funzione legge i job.
//
// Due metà, e servono entrambe:
//   ① i workflow VERI del repo non violano niente — è la guarigione dei quattro punti;
//   ② ognuna delle cinque regole diventa rossa su un caso rotto costruito apposta — è la prova che
//      il verde di sopra non è il verde di un controllo scollegato.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { violazioni, leggiWorkflow, jobsDi, blocchiRun, eUnCommit } =
  await import(join(REPO, "cervello/contratto-workflow.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

const yml = (f) => readFileSync(join(REPO, ".github/workflows", f), "utf8");
const regole = (v) => [...new Set(v.map((x) => x.regola))].sort();

// ─────────────────────────── ① i workflow veri ───────────────────────────

prova("i workflow veri del repo rispettano tutto il contratto", () => {
  const fuori = violazioni(leggiWorkflow());
  assert.deepEqual(fuori, [],
    `violazioni rimaste:\n${fuori.map((v) => `  ${v.file} ${v.regola} (${v.dove})`).join("\n")}`);
});

prova("AR-635: il battito esterno ha un tetto di tempo, e non il default da sei ore", () => {
  // Il caso vero: `cancel-in-progress: false` + nessun tetto = una corsa appesa tiene in coda i
  // controlli orari dopo di lei. Sei ore in cui il guardiano dei blackout è lui stesso cieco.
  const job = jobsDi(yml("battito-esterno.yml")).find((j) => j.nome === "battito");
  assert.ok(job, "il job `battito` non esiste più: il guardiano esterno è sparito");
  const tetto = job.corpo.match(/^\s*timeout-minutes:\s*(\d+)/m);
  assert.ok(tetto, "il job battito non ha timeout-minutes");
  assert.ok(Number(tetto[1]) <= 30, `tetto di ${tetto[1]} minuti: troppo per un controllo orario`);
});

prova("AR-636: il deploy del Pannello dichiara permessi, tetto e scadenza sulla chiamata", () => {
  const t = yml("deploy-pannello.yml");
  assert.match(t, /^permissions:/m, "nessun blocco permissions: il token eredita il default del repo");
  assert.match(t, /^\s*timeout-minutes:\s*\d+/m, "il job deploy non ha tetto di tempo");
  assert.match(t, /^concurrency:/m, "senza gruppo di concorrenza due push ravvicinati bruciano due deploy");
  const curl = t.split("\n").filter((r) => /\bcurl\b/.test(r) && !/^\s*#/.test(r));
  assert.ok(curl.length > 0, "la curl al Deploy Hook è sparita: il deploy non parte più");
  for (const r of curl) assert.match(r, /--max-time|--connect-timeout/, `curl senza scadenza: ${r.trim()}`);
});

prova("AR-637: nessuna azione esterna è agganciata a un'etichetta spostabile", () => {
  const usi = [];
  for (const { nome, testo } of leggiWorkflow()) {
    for (const riga of testo.split("\n")) {
      const m = riga.match(/^\s*(?:-\s+)?uses:\s*['"]?([^'"\s#]+)/);
      if (m && !m[1].startsWith("./")) usi.push({ nome, rif: m[1] });
    }
  }
  assert.ok(usi.length >= 6, `solo ${usi.length} azioni esterne trovate: il controllo sta guardando il posto sbagliato`);
  for (const u of usi) {
    const ref = u.rif.split("@")[1];
    assert.ok(eUnCommit(ref), `${u.nome}: ${u.rif} punta a un'etichetta, non a un commit`);
  }
});

prova("AR-638: nessun output di step entra dentro un blocco run:", () => {
  // La forma giusta è `env: NOME: ${{ ... }}` e poi "$NOME" nello script: `env:` non è uno script,
  // quindi il valore non viene mai interpretato dalla shell.
  for (const { nome, testo } of leggiWorkflow()) {
    for (const b of blocchiRun(testo)) {
      const trovate = b.corpo.match(/\$\{\{[^}]*\}\}/g) || [];
      assert.deepEqual(trovate, [], `${nome} riga ~${b.riga}: ${trovate.join(", ")} dentro run:`);
    }
  }
  // E la controparte: il battito DEVE passare titolo e numero da env, o il fix è stato tolto.
  const t = yml("battito-esterno.yml");
  assert.match(t, /TITOLO:\s*\$\{\{\s*steps\.controllo\.outputs\.titolo\s*\}\}/,
    "il titolo non passa più da env: è tornato dentro lo script");
  assert.match(t, /gh issue create --title "\$TITOLO"/, "gh non legge più il titolo dalla variabile");
});

// ────────────────── ② ogni regola diventa rossa su un caso rotto ──────────────────
// Senza questa metà il verde di sopra non prova niente: un controllo scollegato stampa verde uguale.

const ROTTO = {
  "tetto-di-tempo": `name: x\npermissions:\n  contents: read\njobs:\n  a:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo ciao\n`,
  "permessi-dichiarati": `name: x\njobs:\n  a:\n    runs-on: ubuntu-latest\n    timeout-minutes: 5\n    steps:\n      - run: echo ciao\n`,
  "azione-agganciata-al-commit": `name: x\npermissions:\n  contents: read\njobs:\n  a:\n    runs-on: ubuntu-latest\n    timeout-minutes: 5\n    steps:\n      - uses: actions/checkout@v4\n`,
  "dato-non-fidato-nel-terminale": `name: x\npermissions:\n  contents: read\njobs:\n  a:\n    runs-on: ubuntu-latest\n    timeout-minutes: 5\n    steps:\n      - run: |\n          echo "\${{ github.event.issue.title }}"\n`,
  "scadenza-sulla-chiamata": `name: x\npermissions:\n  contents: read\njobs:\n  a:\n    runs-on: ubuntu-latest\n    timeout-minutes: 5\n    steps:\n      - run: |\n          curl -sS -X POST "$HOOK"\n`,
};

for (const [regola, testo] of Object.entries(ROTTO)) {
  prova(`la regola «${regola}» diventa rossa quando manca davvero`, () => {
    const v = violazioni([{ nome: "finto.yml", testo }]);
    assert.ok(v.some((x) => x.regola === regola),
      `il caso rotto per ${regola} è passato: regole viste = ${regole(v).join(", ") || "nessuna"}`);
  });
}

prova("un workflow completo non accusa nessuna regola (niente falsi allarmi)", () => {
  // Il contrario del blocco sopra: un controllo che accusa sempre è un controllo che si impara a
  // ignorare, e questo è il caso minimo che deve passare pulito.
  const sano = `name: x\npermissions:\n  contents: read\njobs:\n  a:\n    runs-on: ubuntu-latest\n    timeout-minutes: 5\n    steps:\n      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4\n      - name: chiama\n        env:\n          T: \${{ steps.x.outputs.t }}\n        run: |\n          curl -sS --max-time 30 "$U"\n          echo "$T"\n`;
  assert.deepEqual(violazioni([{ nome: "sano.yml", testo: sano }]), []);
});

prova("l'espressione dentro env: NON viene accusata, quella dentro run: sì", () => {
  // È la distinzione su cui poggia tutto il fix di AR-638: se il modulo non la sapesse fare,
  // l'unica riparazione possibile sarebbe togliere il valore, cioè rompere il workflow.
  const base = (dove) => `name: x\npermissions:\n  contents: read\njobs:\n  a:\n    runs-on: ubuntu-latest\n    timeout-minutes: 5\n    steps:\n      - ${dove}\n`;
  const inEnv = base(`name: s\n        env:\n          T: \${{ steps.x.outputs.t }}\n        run: |\n          echo "$T"`);
  const inRun = base(`name: s\n        run: |\n          echo "\${{ steps.x.outputs.t }}"`);
  assert.deepEqual(violazioni([{ nome: "env.yml", testo: inEnv }]), [], "env: non è uno script, non va accusato");
  assert.equal(violazioni([{ nome: "run.yml", testo: inRun }]).length, 1, "run: con espressione dentro va accusato");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
