// AR-296 / AR-292 — ogni processo presume di essere solo (node --test, nessuna rete).
//
// Due difetti diversi, una radice: la macchina è scritta come se ci fosse un solo processo alla volta.
//
//  · AR-296 — misurato il 27/7: in `cervello/` ci sono 111 `writeFileSync` e ZERO `renameSync`, e la
//    funzione `writeJson` è copiaincollata in almeno cinque file. `writeFileSync` non è atomico: se il
//    processo muore mentre scrive (kill del servizio, riavvio del VPS) sul disco resta un JSON
//    troncato, e al giro dopo quel registro è morto — «memoria bloccata da un file rotto».
//
//  · AR-292 — la sentinella vede un lavoro «in_corso da troppo», crede che il worker sia morto e lo
//    rimette in attesa con un PATCH che scrive `{stato:"in_attesa"}` e nient'altro. Nessun contatore:
//    un lavoro pesante che va davvero in timeout torna in coda ogni tre minuti, per sempre. Ogni
//    singolo recupero sembra ragionevole, ed è per questo che nessuno se n'era accorto.
//
// Qui si eseguono le funzioni VERE. Il caso di AR-296 non si accontenta di «il file c'è»: prova che
// durante la scrittura il file finale NON è mai in uno stato intermedio.

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const QUI = dirname(fileURLToPath(import.meta.url));
const { scriviJsonAtomico, scriviTestoAtomico, nomeTemporaneo, testoJson, indentEsistente } = await import(join(QUI, "..", "scrivi-json.mjs"));
const { decidiOrfano, MAX_RIACCODI_ORFANO } = await import(join(QUI, "..", "retry-policy.mjs"));

const conCartella = (fn) => {
  const d = mkdtempSync(join(tmpdir(), "mycity-test-"));
  try {
    return fn(d);
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
};

// ── AR-296: la scrittura che non lascia file a metà ──────────────────────────
test("il caso che ha rotto: il file finale viene SOSTITUITO, non riscritto sul posto", () =>
  conCartella((d) => {
    // È qui che si distingue davvero l'atomicità, e la prima versione di questo test non lo faceva:
    // controllava la FORMA (il temporaneo ha un nome diverso, sta nella stessa cartella) e restava
    // verde anche rimettendo il `writeFileSync` diretto sul file finale. Provato rompendo il fix.
    //
    // Il discriminante osservabile è l'inode: `writeFileSync` su un percorso esistente TRONCA e
    // riscrive lo stesso inode — e in quella finestra un lettore vede un JSON a metà. `renameSync`
    // mette al suo posto un inode NUOVO, già completo: il kernel non mostra mai lo stato intermedio.
    const f = join(d, "registro.json");
    scriviJsonAtomico(f, { versione: 1 });
    const prima = statSync(f).ino;
    scriviJsonAtomico(f, { versione: 2 });
    const dopo = statSync(f).ino;
    assert.notEqual(dopo, prima, "stesso inode = il file è stato troncato e riscritto sul posto: NON è atomico");
    assert.deepEqual(JSON.parse(readFileSync(f, "utf8")), { versione: 2 });
  }));

test("il temporaneo sta nella STESSA cartella del file finale", () =>
  conCartella((d) => {
    // Fra filesystem diversi il rename diventa una copia, e la copia può interrompersi come qualsiasi
    // altra scrittura: il rimedio si annullerebbe da solo. Per questo non si usa /tmp.
    const f = join(d, "r.json");
    const tmp = nomeTemporaneo(f);
    assert.notEqual(tmp, f);
    assert.equal(dirname(tmp), dirname(f));
  }));

test("una seconda scrittura sostituisce, non appende né corrompe", () =>
  conCartella((d) => {
    const f = join(d, "r.json");
    scriviJsonAtomico(f, { n: 1 });
    scriviJsonAtomico(f, { n: 2 });
    assert.deepEqual(JSON.parse(readFileSync(f, "utf8")), { n: 2 });
  }));

test("non resta nessun temporaneo in giro dopo una scrittura riuscita", () =>
  conCartella((d) => {
    scriviJsonAtomico(join(d, "r.json"), { a: 1 });
    assert.deepEqual(readdirSync(d), ["r.json"], "un .tmp dimenticato finirebbe in un git add e nel repo");
  }));

test("scrive anche dentro una cartella che non esiste ancora", () =>
  conCartella((d) => {
    const f = join(d, "a", "b", "r.json");
    scriviJsonAtomico(f, { ok: true });
    assert.ok(existsSync(f));
  }));

test("se il rename fallisce, l'errore risale e il temporaneo non resta", () =>
  conCartella((d) => {
    // Percorso finale occupato da una CARTELLA: il rename non può riuscire.
    const f = join(d, "occupato");
    scriviJsonAtomico(join(f, "dentro.json"), { x: 1 }); // crea `occupato/` come cartella
    assert.throws(() => scriviJsonAtomico(f, { y: 2 }), "meglio un'eccezione visibile di un file muto");
    assert.ok(!existsSync(nomeTemporaneo(f)), "il temporaneo va rimosso anche quando le cose vanno male");
  }));

test("due processi diversi non si contendono lo stesso temporaneo", () => {
  // Il rimedio non deve introdurre la corsa che doveva togliere.
  assert.notEqual(nomeTemporaneo("/x/r.json", 111), nomeTemporaneo("/x/r.json", 222));
});

test("il formato resta identico a prima: diff leggibili, a-capo finale", () => {
  assert.equal(testoJson({ a: 1 }), '{\n  "a": 1\n}\n');
});

test("vale anche per il testo, non solo per il JSON", () =>
  conCartella((d) => {
    const f = join(d, "lettera.md");
    writeFileSync(f, "vecchia");
    scriviTestoAtomico(f, "# Nuova\n");
    assert.equal(readFileSync(f, "utf8"), "# Nuova\n");
  }));

test("i cinque writeJson copiaincollati ora passano tutti da qui", async () => {
  // Era la stessa funzione scritta cinque volte, e nessuna delle cinque era sicura. Se una torna a
  // scrivere per conto suo, il bug riappare dal file che nessuno ha guardato.
  const nudi = [];
  for (const f of ["auto-fix.mjs", "chiusura-loop.mjs", "delta-gate.mjs", "sentinella-dati.mjs", "allinea-scan-cantiere.mjs"]) {
    const src = readFileSync(join(QUI, "..", f), "utf8");
    if (!/scriviJsonAtomico/.test(src)) nudi.push(f);
    assert.doesNotMatch(src, /function writeJson\([^)]*\)\s*\{\s*mkdirSync[\s\S]{0,80}writeFileSync/, `${f}: scrive ancora per conto suo`);
  }
  assert.deepEqual(nudi, [], "questi scrivono la memoria senza il writer atomico");
});

// ── AR-292: il recupero contato ──────────────────────────────────────────────
test("il caso che ha rotto: un lavoro non si recupera all'infinito", () => {
  // Senza tetto: riparte, scade, viene recuperato, riparte — ogni tre minuti, bruciando token.
  const d = decidiOrfano({ sicuro: true, tentativi: MAX_RIACCODI_ORFANO });
  assert.equal(d.azione, "ferma");
  assert.match(d.motivo, /non è il worker a essere morto, è questo lavoro/);
});

test("il primo e il secondo recupero passano: un worker riavviato capita davvero", () => {
  assert.equal(decidiOrfano({ sicuro: true, tentativi: 0 }).azione, "riaccoda");
  assert.equal(decidiOrfano({ sicuro: true, tentativi: 1 }).azione, "riaccoda");
});

test("il contatore SALE, altrimenti il tetto non si raggiunge mai", () => {
  // È il cuore del difetto: il PATCH scriveva solo lo stato, quindi `tentativi` restava a 0 per sempre
  // e il tetto — anche se ci fosse stato — non sarebbe mai scattato.
  assert.equal(decidiOrfano({ sicuro: true, tentativi: 0 }).tentativi, 1);
  assert.equal(decidiOrfano({ sicuro: true, tentativi: 1 }).tentativi, 2);
});

test("un'azione REALE interrotta non si riesegue mai da sola, nemmeno al primo giro", () => {
  // Un'email o un payout a metà non si ripetono in automatico: tornano a Nicola. Vale a tentativi 0.
  const d = decidiOrfano({ sicuro: false, tentativi: 0 });
  assert.equal(d.azione, "ferma");
  assert.match(d.motivo, /riapprova/);
});

test("dati storti non fanno ripartire niente per sbaglio", () => {
  assert.equal(decidiOrfano({ sicuro: true, tentativi: "3" }).azione, "ferma", "stringa numerica: conta come numero");
  assert.equal(decidiOrfano({ sicuro: true, tentativi: null }).azione, "riaccoda", "null = mai recuperato");
  assert.equal(decidiOrfano({}).azione, "ferma", "senza `sicuro` esplicito si sta fermi");
});

test("la sentinella legge e scrive davvero il contatore", async () => {
  // Il fix ha due metà: la decisione (qui sopra) e il fatto che il PATCH la applichi. Senza
  // `tentativi` nella query il contatore non si potrebbe nemmeno leggere — e il tetto sarebbe finto.
  const src = readFileSync(join(QUI, "..", "sentinella-lavori.mjs"), "utf8");
  assert.match(src, /decidiOrfano/, "la sentinella deve usare la decisione condivisa");
  assert.match(src, /select=id,tipo,updated_at,created_at,tentativi/, "senza `tentativi` nel select il contatore è cieco");
  assert.match(src, /stato: "in_attesa", tentativi: d\.tentativi/, "il PATCH deve scrivere anche il contatore");
});

// ── AR-512: la forma del file che c'è già vince sulla mia ──────────────────────
//
// Il rischio che questo chiude, misurato il 4/8: dal 3/8 il pre-commit rifiuta un JSON riscritto con
// un'indentazione diversa. Il worker sul server committa da solo e NON salta gli hook (git-pr.mjs
// fa `git commit` e su errore esce 1): un solo script che riscrivesse un registro con la forma
// sbagliata avrebbe fermato la pubblicazione della memoria. Bloccare un commit automatico non ripara
// niente — sposta il guasto un piano più in là.

test("la scrittura atomica conserva l'indentazione del file che trova", () =>
  conCartella((d) => {
    const f = join(d, "registro.json");
    writeFileSync(f, JSON.stringify({ voci: [{ id: "A" }] }, null, 1) + "\n"); // il file di casa: UNO spazio
    scriviJsonAtomico(f, { voci: [{ id: "A" }, { id: "B" }] });
    const dopo = readFileSync(f, "utf8");
    assert.equal(dopo.split("\n")[1].match(/^ +/)[0].length, 1, "un solo spazio, come il file di prima");
    assert.deepEqual(JSON.parse(dopo).voci.length, 2, "e il contenuto nuovo c'è");
  }));

test("un file NUOVO nasce a due spazi: è la forma di casa", () =>
  conCartella((d) => {
    const f = join(d, "nuovo.json");
    scriviJsonAtomico(f, { a: { b: 1 } });
    assert.equal(readFileSync(f, "utf8").split("\n")[1].match(/^ +/)[0].length, 2);
  }));

test("l'indentazione si LEGGE dal file, non si suppone", () =>
  conCartella((d) => {
    const f = join(d, "tab.json");
    writeFileSync(f, '{\n\t"a": 1\n}\n');
    assert.equal(indentEsistente(f), "\t", "un file a tabulazioni resta a tabulazioni");
    assert.equal(indentEsistente(join(d, "mai-esistito.json")), null, "un file che non c'è non ha una forma da conservare");
    writeFileSync(f, '{"tuttoSuUnaRiga": 1}\n');
    assert.equal(indentEsistente(f), null, "e nemmeno un file senza a-capo");
  }));
