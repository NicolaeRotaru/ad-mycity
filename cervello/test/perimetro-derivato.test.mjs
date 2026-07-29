#!/usr/bin/env node
// Lotto 33 — la prova del modulo su cui poggiano dieci bloccanti.
//
// Qui NON si cerca una parola in un file: si ESEGUE `elencaFile` su un albero finto costruito a
// mano (con sottocartelle vere, perché il difetto di AR-381/AR-382 è proprio non scendere) e si
// esegue `confronta` sui casi che hanno prodotto AR-373 e AR-387.
//
// I casi 1-4 sono il difetto vero, non una parafrasi: un albero con `vps/` e `publishers/` dentro,
// esattamente la forma in cui otto mani e tre porte sono rimaste invisibili per mesi.

import assert from "node:assert/strict";
import { ammesso, confronta, derivaNomi, elencaFile, codiceUscita } from "../perimetro.mjs";

// ⚠️ Il metro deve poter FALLIRE, anche sui casi asincroni.
// La prima stesura di questo file chiamava `fn()` senza aspettarlo: un caso `async` restituiva una
// promessa, il try/catch non ne vedeva mai il rifiuto, e il caso risultava PASSATO qualunque cosa
// asserisse. Se ne è accorta la prova di non-vacuità (rompi il fix, il test deve diventare rosso):
// quattro casi restavano verdi col fix rotto. Un metro che non può dire di no è la stessa malattia
// del lotto, un piano più in basso.
const casi = [];
const daFare = [];
const prova = (nome, fn) => {
  daFare.push(async () => {
    try {
      await fn();
      casi.push({ nome, ok: true });
    } catch (e) {
      casi.push({ nome, ok: false, err: e.message });
    }
  });
};

/** Un albero finto: { "cartella": { "file.mjs": 1 } }. Le foglie sono file. */
function albero(mappa) {
  const nodo = (percorso) => {
    let cur = mappa;
    const parti = String(percorso).split("/").filter((s) => s && s !== ".");
    for (const p of parti.slice(1)) {
      // slice(1): il primo segmento è la radice finta
      cur = cur?.[p];
      if (cur == null) throw new Error(`ENOENT ${percorso}`);
    }
    return cur;
  };
  return {
    leggiCartella(dir) {
      const n = nodo(dir);
      if (typeof n !== "object") throw new Error(`ENOTDIR ${dir}`);
      return Object.entries(n).map(([name, v]) => ({ name, isDirectory: () => typeof v === "object" }));
    },
  };
}

const ALBERO = albero({
  "giro.sh": 1,
  "uscite-check.mjs": 1,
  publishers: { "_comune.mjs": 1, "telegram.mjs": 1, "email.mjs": 1 },
  vps: { "aggiorna-cervello.sh": 1, "trigger-build.sh": 1, "push-trigger.mjs": 1 },
  test: { "qualcosa.test.mjs": 1 },
  node_modules: { "cattivo.mjs": 1 },
});

// ─────────── ① il difetto vero: un livello solo non vede le sottocartelle ───────────

prova("AR-381/AR-382 — scende nelle sottocartelle: publishers/ e vps/ entrano nel perimetro", () => {
  const f = elencaFile("radice", { estensioni: [".mjs", ".sh"], escludi: ["test"] }, ALBERO);
  assert.ok(f.includes("publishers/_comune.mjs"), "manca il collo di bottiglia dei publisher");
  assert.ok(f.includes("vps/aggiorna-cervello.sh"), "manca lo script del server che pubblica su main");
  assert.ok(f.includes("vps/push-trigger.mjs"), "manca chi fa partire il deploy in produzione");
});

prova("AR-380 — il perimetro non è una sintassi: .sh e .mjs stanno insieme", () => {
  const f = elencaFile("radice", { estensioni: [".mjs", ".sh"], escludi: ["test"] }, ALBERO);
  assert.ok(f.includes("giro.sh") && f.includes("uscite-check.mjs"));
});

prova("le esclusioni valgono per SEGMENTO, non per prefisso di testo", () => {
  assert.equal(ammesso("test/x.mjs", { escludi: ["test"] }), false);
  assert.equal(ammesso("testimoni.mjs", { escludi: ["test"] }), true, "un fratello sano escluso per sbaglio");
  assert.equal(ammesso("a/node_modules/x.mjs", {}), false, "node_modules va escluso a qualunque profondità");
});

prova("⚪ non è mai ✅: una radice illeggibile torna null, non un elenco vuoto", () => {
  const rotto = { leggiCartella() { throw new Error("EACCES"); } };
  assert.equal(elencaFile("radice", { estensioni: [".mjs"] }, rotto), null);
  assert.equal(codiceUscita({ cieco: 1 }), 2, "cieco deve uscire 2, mai 0");
});

// ─────────── ② la lista scritta a mano contro la misura ───────────

prova("AR-387 — un vincolo nuovo che nessuno ha enumerato risulta MANCANTE", () => {
  const codice = `PAUSE_VINCOLO=""\nPORTE_VINCOLO=""\nFIRMA_VINCOLO=""\nSENSORI_VINCOLO=""`;
  const derivati = derivaNomi(codice, /^([A-Z0-9_]+)_VINCOLO=/m);
  const enumeratiAMano = ["SENSORI"];
  const { mancanti, ok } = confronta(enumeratiAMano, derivati);
  assert.equal(ok, false, "il giro si chiuderebbe pulito con tre allarmi non contati");
  assert.deepEqual(mancanti, ["FIRMA", "PAUSE", "PORTE"]);
});

prova("AR-373 — un atteso che nessuno manda più risulta ORFANO (l'allarme fantasma)", () => {
  const codice = `stampSegnale("sensori", "ok")\nstampSegnale('auto-fix', 'ok')`;
  const derivati = derivaNomi(codice, /stampSegnale\(\s*["'`]([^"'`]+)["'`]/);
  const { orfani } = confronta(["sensori", "auto-fix", "coerenza-fatti"], derivati);
  assert.deepEqual(orfani, ["coerenza-fatti"], "un atteso mai emesso suona per sempre e nessuno lo sa");
});

prova("un'esenzione vale solo col perché scritto: senza motivo NON copre", () => {
  const derivati = new Set(["PORTE"]);
  const vuoto = confronta([], derivati, { PORTE: "boh" });
  assert.deepEqual(vuoto.senzaMotivo, ["PORTE"]);
  assert.equal(vuoto.ok, false, "un'esenzione senza motivo è un silenzio, ed è la cosa che curiamo");
  const buono = confronta([], derivati, { PORTE: "gestito a mano dal cancello di pubblicazione, vedi AR-127" });
  assert.equal(buono.ok, true);
});

prova("derivaNomi non si ferma alla prima occorrenza (il flag globale è forzato)", () => {
  assert.equal(derivaNomi("a=1\nb=2\nc=3", /^([a-z])=/m).size, 3);
});

for (const eseguo of daFare) await eseguo();

let ko = 0;
for (const c of casi) {
  console.log(`  ${c.ok ? "ok" : "NOT ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) ko++;
}
console.log(`# pass ${casi.length - ko}\n# fail ${ko}`);
process.exit(ko ? 1 : 0);
