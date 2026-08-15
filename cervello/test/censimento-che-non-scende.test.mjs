#!/usr/bin/env node
// 🗺️ AR-700 — il censimento contava i moduli del cervello SOLO al primo livello.
//
// LA RADICE: la funzione che elenca i file leggeva una cartella sola e non scendeva nelle
// sottocartelle. Misurato il 14/8 sul repo vero: **229 moduli contati, 308 veri** — `capacita/`,
// `vps/`, `publishers/`, `content-factory/` e `riparazioni/` non venivano guardati affatto.
//
// PERCHÉ È SOPRAVVISSUTO TANTO: è l'altra metà di AR-677. Quel difetto è stato curato dove il conto
// serviva a un CANCELLO — e lì un numero sbagliato ferma il lavoro, quindi si vede. Qui il conto
// serve a RACCONTARE la macchina a Nicola in bacheca, e **un numero più piccolo del vero non allarma
// nessuno**: la mappa dichiarava un terzo di macchina in meno e nessuno aveva motivo di dubitarne.
// Cioè la metà che lui legge è rimasta sbagliata.
//
// LA CURA: una porta sola. Il censimento non ha più la sua funzione — passa da `elencaFile` di
// `cervello/perimetro.mjs`, la stessa che AR-677 ha già sistemato. Due funzioni che elencano gli
// stessi file in due modi sono due risposte diverse alla stessa domanda, e vince quella comoda.
//
// COSA PROVA QUESTO FILE (su un albero finto, senza toccare il repo vero):
//   ① un modulo dentro una sottocartella FA SALIRE il totale — è la prova che chiede la scheda
//   ② `test/` resta fuori: ha già il suo numero nella stessa riga, contarlo lo direbbe due volte
//   ③ sul repo vero il conto è identico a una camminata indipendente fatta qui dal test
//   ④ una radice illeggibile dà `null`, non `0`: «non ho guardato» non è «non c'è niente»
//
// NON-VACUITÀ (verificata rompendo il fix apposta): in `cervello/censimento-macchina.mjs`,
// rimettendo `sottoAlbero` a leggere un livello solo (`fileCon(p("cervello"), ".mjs")`), i casi
// ① e ③ diventano ROSSI — ed è esattamente il numero che la bacheca mostrava a Nicola.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PARTI, creaOcchi, misura } from "../censimento-macchina.mjs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** Un albero finto, tutto suo. Il repo vero non si tocca: un test che sporca la memoria si smette di lanciare. */
function conAlberoFinto(file, fn) {
  const radice = mkdtempSync(join(tmpdir(), "censimento-"));
  try {
    for (const [rel, testo] of Object.entries(file)) {
      const pieno = join(radice, rel);
      mkdirSync(dirname(pieno), { recursive: true });
      writeFileSync(pieno, testo);
    }
    fn(radice);
  } finally {
    rmSync(radice, { recursive: true, force: true });
  }
}

// ── ① la prova che chiede la scheda: un modulo in una sottocartella fa salire il totale ──────────

prova("① un modulo dentro una sottocartella entra nel conto", () => {
  const base = { "cervello/uno.mjs": "//", "cervello/due.sh": "#" };
  conAlberoFinto(base, (r1) => {
    const prima = misura(r1, creaOcchi()).immunitario.script;
    assert.equal(prima, 2, "al primo livello ce ne sono due");
    conAlberoFinto({ ...base, "cervello/capacita/tre.mjs": "//" }, (r2) => {
      const dopo = misura(r2, creaOcchi()).immunitario.script;
      assert.equal(dopo, 3, "il modulo nella sottocartella deve far salire il totale: prima non lo faceva");
    });
  });
});

prova("① il conto dichiara anche quanti stanno sotto: il numero che mancava, per nome", () => {
  conAlberoFinto(
    { "cervello/uno.mjs": "//", "cervello/vps/due.sh": "#", "cervello/publishers/tre.mjs": "//" },
    (r) => {
      const m = misura(r, creaOcchi()).immunitario;
      assert.equal(m.script, 3);
      assert.equal(m.scriptSottocartelle, 2, "due dei tre vivono sotto, e si dice");
    },
  );
});

// ── ② quello che resta fuori, e il perché ────────────────────────────────────────────────────────

prova("② i test restano fuori dal conto degli script: hanno già il loro numero", () => {
  conAlberoFinto(
    { "cervello/uno.mjs": "//", "cervello/test/x.test.mjs": "//", "cervello/test/y.bats": "#" },
    (r) => {
      const m = misura(r, creaOcchi()).immunitario;
      assert.equal(m.script, 1, "contare anche cervello/test/ direbbe due volte la stessa cosa");
      assert.equal(m.test, 1, "…che infatti è già contata qui");
      assert.equal(m.testBash, 1);
    },
  );
});

prova("② solo `.mjs` e `.sh`: un JSON o un markdown non è un modulo", () => {
  conAlberoFinto(
    { "cervello/uno.mjs": "//", "cervello/dati.json": "{}", "cervello/note.md": "#", "cervello/vps/due.sh": "#" },
    (r) => assert.equal(misura(r, creaOcchi()).immunitario.script, 2),
  );
});

// ── ③ il repo vero: il conto regge a una camminata indipendente ──────────────────────────────────

/** Cammina il cervello per conto suo, senza chiedere niente al modulo che sto provando. */
function camminataIndipendente(dir, radice = dir) {
  let n = 0;
  for (const v of readdirSync(dir, { withFileTypes: true })) {
    if (v.isDirectory()) {
      if (v.name === "test" && dir === radice) continue;
      if (v.name === "node_modules" || v.name === ".git") continue;
      n += camminataIndipendente(join(dir, v.name), radice);
      continue;
    }
    if (/\.(mjs|sh)$/.test(v.name)) n++;
  }
  return n;
}

prova("③ sul repo VERO il conto è quello di una camminata indipendente, non quello di un livello", () => {
  const m = misura(REPO, creaOcchi()).immunitario;
  const atteso = camminataIndipendente(join(REPO, "cervello"));
  assert.equal(m.script, atteso, "il censimento e una camminata onesta devono dare lo stesso numero");
  const primoLivello = readdirSync(join(REPO, "cervello")).filter((f) => /\.(mjs|sh)$/.test(f)).length;
  assert.ok(
    m.script > primoLivello,
    `il conto deve essere PIÙ ALTO del primo livello (${primoLivello}): se è uguale, non sta scendendo`,
  );
  assert.ok(m.scriptSottocartelle > 0, "e i moduli nelle sottocartelle esistono davvero");
});

prova("③ la riga che Nicola legge in bacheca porta il numero vero", () => {
  const m = misura(REPO, creaOcchi());
  const riga = PARTI.find((p) => p.n === 5).taglia(m);
  assert.match(riga, new RegExp(`^${m.immunitario.script} script`), "la taglia del sistema immunitario parte dal conto vero");
  assert.match(riga, /nelle sottocartelle/, "e dice quanti stavano nascosti");
});

// ── ④ non aver guardato non è aver visto zero ────────────────────────────────────────────────────

prova("④ una radice illeggibile dà `null`, non `0`, e il guasto arriva al verdetto", () => {
  const occhi = creaOcchi();
  const m = misura(join(REPO, "cartella-che-non-esiste-mai"), occhi);
  assert.equal(m.immunitario.script, null, "uno zero qui sarebbe «la macchina non ha script»: una bugia");
  assert.ok(occhi.guasti.length > 0, "il motivo per cui non ho contato deve viaggiare col dato");
  const riga = PARTI.find((p) => p.n === 5).taglia(m);
  assert.match(riga, /non sono riuscito a contare/, "e a Nicola si dice a parole, non con uno 0");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
