#!/usr/bin/env node
// 🧬 AR-704 — «UNA PAROLA CON DUE PADRONI» HA UN NOME, QUINDI LA SPAZZATA PUÒ CERCARNE I FRATELLI.
//
// IL DIFETTO. In `cervello/malattie.json` c'erano 21 forme di difetto censite e **nessuna** diceva
// «la stessa parola è definita in due posti diversi». Senza il nome, `spazzata-fratelli.mjs` non può
// cercare le altre istanze di quella forma: ogni copia nuova va trovata a mano, cioè per caso. È
// letteralmente la ragione per cui una corsia intera del lotto 42 è esistita — nove difetti che
// erano la stessa cosa nove volte, trovati uno per uno da una radiografia invece che da un metro.
//
// COSA PROVA QUESTO FILE, e in che ordine:
//   ① la voce esiste nel registro vero, con la partenza e il perché scritti (se manca, ROSSO qui:
//      è la forcing-function che impedisce di dichiarare censita una malattia che non c'è);
//   ② il pattern, ESEGUITO sul codice vero, trova tutte e sei le dichiarazioni a mano della lista
//      degli «atti veri» — non una regex commentata dentro un test, ma il conteggio che poi fa il
//      guardiano (`istanzeNelTesto`, la stessa funzione che usa la spazzata);
//   ③ la SESTA COPIA fa diventare rosso il guardiano: su un albero finto con una copia in più la
//      spazzata esce ≠ 0. È la prova che il censimento frena, non che è scritto bene.
//   ④ e la partenza dichiarata è quella MISURATA oggi, non un numero inventato: se qualcuno la
//      gonfiasse per far passare un giro, questo diventa rosso.
//
// 🟢 Sola lettura sul repo vero. L'unico posto in cui scrive è una cartella temporanea sua, che
//    cancella alla fine: la memoria non si sporca per misurare (AR-444).
//
// NON-VACUITÀ (eseguita davvero): togliendo `case " esegui-azione proposta " in` da
// `cervello/lib-recupero.sh` il caso ② diventa rosso («lib-recupero.sh non dichiara più…»), e
// alzando la `baseline` della voce a 6 diventa rosso ④.

import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { istanzeNelTesto, pesaEsenzioni } from "../spazzata-fratelli.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const leggi = (r) => readFileSync(join(REPO, r), "utf8");

const ID = "una-parola-con-due-padroni";

// Il registro si legge dove lo legge la spazzata. La variabile esiste per la STESSA ragione per cui
// esiste in `spazzata-fratelli.mjs` (AR-334): poter provare lo strumento su un registro candidato
// senza scrivere in quello vero, che è condiviso. In esercizio resta il default, cioè il file vero.
const REGISTRO = process.env.SPAZZATA_REGISTRO || join(REPO, "cervello/malattie.json");

/** I sei punti che oggi scrivono a mano la lista degli «atti veri»: cinque copie + la casa. */
const PUNTI = [
  "cervello/atti-veri.mjs", // ← la casa (dichiarata esente nel registro)
  "cervello/sentinella-lavori.mjs",
  "cervello/pulisci-coda.mjs",
  "cervello/worker.sh",
  "cervello/lib-recupero.sh",
  "pannello/src/lib/recupero-lavoro.ts",
];

const casi = [];
function prova(nome, fn) {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
}

function voce() {
  const reg = JSON.parse(readFileSync(REGISTRO, "utf8"));
  return (reg.malattie || []).find((m) => m && m.id === ID);
}

// ═══ ① la malattia è censita davvero ═════════════════════════════════════════════════════════════

prova("① la malattia «una parola con due padroni» esiste in cervello/malattie.json", () => {
  const m = voce();
  assert.ok(
    m,
    `AR-704: nessuna voce «${ID}» nel registro. Finché non c'è, la spazzata non può cercare i fratelli ` +
      "di questa forma di difetto e ogni copia nuova va trovata a mano."
  );
  assert.ok(String(m.pattern || "").length > 10, "una malattia senza pattern non cerca niente");
  assert.ok(String(m.perche_e_grave || "").length > 80, "il perché va scritto: un censimento muto non insegna niente");
  assert.ok(Number.isInteger(m.baseline), "la partenza deve essere un numero misurato, non assente");
  assert.ok(String(m.nota_onesta || "").length > 80, "va dichiarato cosa il pattern NON può vedere");
});

// ═══ ② il pattern trova le sei dichiarazioni sul CODICE VERO ═════════════════════════════════════

prova("② il pattern, eseguito sul codice vero, trova tutte e sei le dichiarazioni a mano", () => {
  const m = voce();
  assert.ok(m, "voce assente: vedi ①");
  for (const f of PUNTI) {
    const n = istanzeNelTesto(m, leggi(f), f);
    assert.ok(n >= 1, `${f} non dichiara più la lista degli atti veri (o il pattern non ci arriva più)`);
  }
});

prova("② e NON prende la lista omonima di retry-policy, che è un'altra domanda", () => {
  const m = voce();
  assert.ok(m, "voce assente: vedi ①");
  // `TIPI_AZIONE_REALE = new Set(["esegui-azione"])` ha lo stesso NOME e un contenuto diverso, ed è
  // voluto: lì si chiede «quale tipo aziona davvero le mani». Contarlo come copia farebbe salire il
  // numero mentre si cura, cioè punirebbe la distinzione giusta.
  assert.equal(istanzeNelTesto(m, leggi("cervello/retry-policy.mjs"), "cervello/retry-policy.mjs"), 0,
    "retry-policy viene contata come copia: il metro non distingue più le due domande");
});

// ═══ ③ LA SESTA COPIA DEVE DIVENTARE ROSSA ═══════════════════════════════════════════════════════

/** Costruisce un albero finto con `quante` dichiarazioni a mano e ci lancia la spazzata vera. */
function spazzataSuAlberoFinto(quante, baseline) {
  const dir = mkdtempSync(join(tmpdir(), "due-padroni-"));
  try {
    mkdirSync(join(dir, "cervello"), { recursive: true });
    for (let i = 0; i < quante; i++) {
      writeFileSync(join(dir, "cervello", `copia-${i}.mjs`), `const TIPI_AZIONE = ["proposta", "esegui-azione"];\n`);
    }
    const m = { ...voce(), baseline, esenti: [], dove: ["cervello"] };
    // `file_noti` fuori: sull'albero finto i nomi sono inventati, e un elenco di file noti vuoto
    // farebbe fallire per «file nuovo» invece che per il conteggio, cioè per il motivo sbagliato.
    delete m.file_noti;
    const registro = join(dir, "malattie.json");
    writeFileSync(registro, JSON.stringify({ malattie: [m] }));
    try {
      execFileSync("node", [join(REPO, "cervello/spazzata-fratelli.mjs")], {
        env: { ...process.env, SPAZZATA_REPO: dir, SPAZZATA_REGISTRO: registro },
        encoding: "utf8",
      });
      return 0;
    } catch (e) {
      return e.status ?? -1;
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

prova("③ una copia in più della lista già censita fa diventare ROSSO il guardiano", () => {
  assert.equal(spazzataSuAlberoFinto(5, 5), 0, "con le copie dichiarate il guardiano deve essere verde");
  assert.notEqual(spazzataSuAlberoFinto(6, 5), 0,
    "la sesta copia passa: il censimento è scritto ma non frena, cioè non serve a niente");
});

// ═══ ④ la partenza è quella MISURATA, non una comoda ═════════════════════════════════════════════

prova("④ la partenza dichiarata è quella misurata oggi sul repo vero, esenti comprese", () => {
  const m = voce();
  assert.ok(m, "voce assente: vedi ①");
  const perFile = new Map();
  let lordo = 0;
  for (const f of PUNTI) {
    const n = istanzeNelTesto(m, leggi(f), f);
    if (n) perFile.set(f, n);
    lordo += n;
  }
  const { valide, orfane } = pesaEsenzioni(m.esenti || [], perFile);
  assert.deepEqual(orfane, [], "un'esenzione che non copre più niente è un residuo che nasconde il prossimo caso vero");
  const netto = Math.max(0, lordo - valide.length);
  assert.equal(m.baseline, netto,
    `la partenza dice ${m.baseline} ma sul codice vero ce ne sono ${netto} (${lordo} lorde − ${valide.length} esenti)`);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
