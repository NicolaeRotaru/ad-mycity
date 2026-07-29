#!/usr/bin/env node
// AR-199 — la memoria ha un contratto sul CONTENUTO e nessuno sul COSTO.
//
// Misurato il 28/7 sera, e i numeri sono PEGGIORI di come il difetto li aveva scritti (437 KB → 479):
// i quattro file vivi pesano **1.068.042 byte**. Due conseguenze, entrambe verificate nel codice e
// non dedotte:
//
//   · il giro ha l'ordine di leggere e aggiornare STATO, AZIONI-IN-ATTESA e SALA-OPERATIVA
//     (`cervello/giro.md` righe 85, 116, 129) — oltre un mega prima di cominciare a ragionare;
//   · la Cabina manda il corpo INTERO di STATO.md al browser a ogni caricamento della scheda
//     (`pannello/src/app/api/memoria/stato/route.ts`) — lo stesso difetto dei lotti 20 e 22.
//
// E `housekeeping-azioni.mjs`, che dovrebbe alleggerire la coda, spostava le card chiuse **in fondo
// allo stesso file**: l'81% del peso stava sotto l'intestazione «archivio» e viaggiava lo stesso.
//
// La prova centrale non è la riduzione: è che **niente si perda**. Una riga persa qui è memoria persa
// per sempre, e nessun risparmio la ripaga.

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { integro, splittaCoda, splittaLog, splittaSnapshot } from "../archivio-memoria.mjs";
import { codiceUscita, sforamenti } from "../peso-contesto.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const MEM = join(REPO, "MyCity-Vault/90-Memoria-AI");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

// ── LA GARANZIA ─────────────────────────────────────────────────────────────

prova("il caso che conta: potando NON si perde una riga, su tutti e tre i file veri", () => {
  const casi3 = [
    ["STATO.md", (t) => { const s = splittaSnapshot(t, { tieni: 12 }); return [s.testa + s.vivo, s.storico]; }],
    ["SALA-OPERATIVA.md", (t) => { const s = splittaLog(t, { tieni: 300 }); return [s.testa + s.vivo, s.storico]; }],
    ["AZIONI-IN-ATTESA.md", (t) => { const s = splittaCoda(t); return [s.vivo, s.storico]; }],
  ];
  for (const [file, dividi] of casi3) {
    const t = readFileSync(join(MEM, file), "utf8");
    const [vivo, storico] = dividi(t);
    const g = integro(t, vivo, storico);
    assert.ok(g.ok, `${file}: ${g.perse.length} righe perse, ${g.duplicate.length} duplicate — es. ${JSON.stringify(g.perse[0] || g.duplicate[0])}`);
  }
});

prova("e la garanzia sa dire di NO: se una riga sparisce, integro() la vede", () => {
  // Senza questo, «integro» potrebbe tornare true sempre e non proverebbe niente.
  const originale = "riga uno\nriga due\nriga tre";
  assert.equal(integro(originale, "riga uno", "riga tre").ok, false, "«riga due» è sparita e nessuno se n'è accorto");
  assert.equal(integro(originale, "riga uno\nriga due", "riga tre").ok, true);
  assert.equal(integro(originale, "riga uno\nriga due\nriga tre", "riga tre").ok, false, "duplicare è un altro modo di sbagliare");
});

prova("le righe vuote non contano, ma quelle ripetute sì", () => {
  assert.equal(integro("a\n\n\nb", "a", "b").ok, true, "gli a-capo si possono aggiungere e togliere");
  assert.equal(integro("---\n---", "---", "").ok, false, "due separatori sono due: se ne resta uno, uno è perso");
});

// ── I TRE TAGLI, su input finti ─────────────────────────────────────────────

prova("snapshot: restano le note più RECENTI, che qui sono le prime", () => {
  const t = "---\nk: v\n---\n> 🔧 **nota nuova** …\n> 🔧 **nota media** …\n> 🔧 **nota vecchia** …\n\n## I 7 numeri\nordini: 0\n";
  const s = splittaSnapshot(t, { tieni: 2 });
  assert.match(s.vivo, /nota nuova/);
  assert.match(s.vivo, /nota media/);
  assert.doesNotMatch(s.vivo, /nota vecchia/);
  assert.match(s.storico, /nota vecchia/);
  assert.match(s.vivo, /I 7 numeri/, "quello che NON è una nota resta sempre vivo: è il cruscotto");
  assert.equal(s.testa, "---\nk: v\n---\n", "il frontmatter non si sposta mai");
});

prova("log: restano le voci più recenti, che qui sono le ULTIME (il contrario)", () => {
  // La forma del file decide il taglio. Applicare la regola di STATO a SALA dava «0% in meno», e un
  // metro che non guarda la forma misura zero e sembra dire «qui va tutto bene».
  const t = "# Sala\nistruzioni\n- 2026-01-01 10:00 · @a · FATTO · vecchia\n- 2026-02-01 10:00 · @b · FATTO · media\n- 2026-03-01 10:00 · @c · FATTO · nuova\n";
  const s = splittaLog(t, { tieni: 2 });
  assert.match(s.vivo, /nuova/);
  assert.match(s.vivo, /media/);
  assert.doesNotMatch(s.vivo, /vecchia/);
  assert.match(s.vivo, /istruzioni/, "l'intestazione resta: dice alla squadra come si scrive");
  assert.equal(integro(t, s.testa + s.vivo, s.storico).ok, true);
});

prova("coda: si taglia all'intestazione «archivio», e senza quella non si tocca niente", () => {
  const t = "# Coda\n| 1 | aperta |\n## 📦 Archivio\n| 2 | chiusa |\n";
  const s = splittaCoda(t);
  assert.equal(s.trovato, true);
  assert.match(s.vivo, /aperta/);
  assert.doesNotMatch(s.vivo, /chiusa/);
  const senza = splittaCoda("# Coda\n| 1 | aperta |\n");
  assert.equal(senza.trovato, false);
  assert.equal(senza.storico, "", "meglio un file grosso che un file mutilato");
});

prova("un file già snello non produce storico: la potatura non inventa lavoro", () => {
  const s = splittaSnapshot("> unica nota\n", { tieni: 12 });
  assert.equal(s.storico, "");
});

// ── IL GUARDIANO ────────────────────────────────────────────────────────────

prova("il tetto è per file, e un file senza tetto è già un difetto", () => {
  assert.deepEqual(sforamenti({ "a.md": 100 }, { "a.md": 200 }), []);
  const fuori = sforamenti({ "a.md": 300 }, { "a.md": 200 });
  assert.equal(fuori.length, 1);
  assert.match(fuori[0].motivo, /100 byte sopra il tetto/);
  const senza = sforamenti({ "b.md": 10 }, {});
  assert.equal(senza.length, 1, "un file che entra nel contesto senza un massimo è la curva silenziosa");
});

prova("contratto del guardiano: 0 · 1 · 2, e il cieco vince", () => {
  assert.equal(codiceUscita({ fuori: 0 }), 0);
  assert.equal(codiceUscita({ fuori: 2 }), 1);
  assert.equal(codiceUscita({ cieco: 1, fuori: 0 }), 2);
});

prova("sul repo vero il guardiano è ROSSO, ed è la verità", () => {
  // Qui la regola «un cancello deve nascere verde» NON si applica, e vale la pena dire perché: i
  // tetti non sono il peso di oggi, sono l'OBIETTIVO dopo la potatura. Finché la potatura non è
  // stata applicata su `main`, questo guardiano deve gridare — è la misura del lavoro che manca, non
  // un allarme da tarare. Per questo nel giro entra come INFORMATIVO, con scritto a quale condizione
  // diventa un cancello.
  const r = spawnSync("node", [join(REPO, "cervello/peso-contesto.mjs"), "--json"], { cwd: REPO, encoding: "utf8" });
  const j = JSON.parse(r.stdout);
  for (const f of ["MyCity-Vault/90-Memoria-AI/STATO.md", "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md", "MyCity-Vault/90-Memoria-AI/SALA-OPERATIVA.md"]) {
    assert.ok(Number.isFinite(j.tetti[f]), `${f} deve avere un tetto dichiarato`);
  }
  if (r.status === 1) {
    assert.ok(j.fuori.length > 0, "se esce 1 deve dire QUALI file, altrimenti non è una misura");
    return; // stato atteso finché la potatura non è passata
  }
  // Dopo la potatura: verde, e i TRE file potabili devono essere davvero scesi.
  // Il totale NON è il metro giusto — ci sta dentro DECISIONI.md (mezzo mega), che è append-only ed
  // esente dalla potatura: sommarlo faceva fallire questa prova su una potatura riuscita. Metro
  // sbagliato, non fix sbagliato.
  assert.equal(r.status, 0, `né rosso né verde: ${r.status}\n${r.stdout}${r.stderr}`);
  const potabili = ["STATO.md", "SALA-OPERATIVA.md", "AZIONI-IN-ATTESA.md"]
    .map((f) => j.misure[`MyCity-Vault/90-Memoria-AI/${f}`] || 0)
    .reduce((a, b) => a + b, 0);
  assert.ok(potabili < 400000, `potatura applicata ma i tre file potabili pesano ancora ${potabili}`);
});

prova("il guardiano sa dire di no: un file cresciuto oltre il tetto lo fa uscire 1", () => {
  const dir = mkdtempSync(join(tmpdir(), "mycity-peso-"));
  try {
    mkdirSync(join(dir, "m"), { recursive: true });
    writeFileSync(join(dir, "m/grosso.md"), "x".repeat(500));
    writeFileSync(join(dir, "tetti.json"), JSON.stringify({ tetti: { "m/grosso.md": 100 } }));
    const env = { ...process.env, PESO_REPO: dir, PESO_TETTI: join(dir, "tetti.json") };
    const r = spawnSync("node", [join(REPO, "cervello/peso-contesto.mjs")], { cwd: REPO, encoding: "utf8", env });
    assert.equal(r.status, 1);
    assert.match(`${r.stdout}${r.stderr}`, /grosso\.md/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

prova("tetti illeggibili = CIECO (2), non verde", () => {
  const r = spawnSync("node", [join(REPO, "cervello/peso-contesto.mjs")], {
    cwd: REPO, encoding: "utf8",
    env: { ...process.env, PESO_TETTI: join(REPO, "cervello/non-esiste.json") },
  });
  assert.equal(r.status, 2, "non aver potuto misurare non è un verde (AR-322)");
});

// ── LA POTATURA, eseguita davvero su una memoria finta ──────────────────────

prova("la potatura scrive lo storico e alleggerisce il vivo — su una memoria finta", () => {
  const dir = mkdtempSync(join(tmpdir(), "mycity-pota-"));
  try {
    const mem = join(dir, "MyCity-Vault/90-Memoria-AI");
    mkdirSync(mem, { recursive: true });
    const note = Array.from({ length: 40 }, (_, i) => `> 🔧 **nota numero ${i}** riga\n> continuazione della ${i}`).join("\n");
    writeFileSync(join(mem, "STATO.md"), `---\nk: v\n---\n${note}\n\n## I 7 numeri\nordini: 0\n`);
    writeFileSync(join(mem, "SALA-OPERATIVA.md"), "# Sala\n" + Array.from({ length: 500 }, (_, i) => `- 2026-01-01 10:00 · @a · FATTO · voce ${i}`).join("\n") + "\n");
    writeFileSync(join(mem, "AZIONI-IN-ATTESA.md"), "# Coda\n| 1 | aperta |\n## 📦 Archivio\n| 2 | chiusa |\n");

    const env = { ...process.env, POTA_REPO: dir, POTA_MESE: "2026-07" };
    const secco = spawnSync("node", [join(REPO, "cervello/pota-memoria.mjs")], { cwd: REPO, encoding: "utf8", env });
    assert.equal(secco.status, 0);
    assert.equal(readFileSync(join(mem, "STATO.md"), "utf8").includes("nota numero 39"), true,
      "a secco NON deve toccare niente");

    const vero = spawnSync("node", [join(REPO, "cervello/pota-memoria.mjs"), "--applica"], { cwd: REPO, encoding: "utf8", env });
    assert.equal(vero.status, 0, `${vero.stdout}${vero.stderr}`);

    const statoDopo = readFileSync(join(mem, "STATO.md"), "utf8");
    const storicoStato = readFileSync(join(mem, "Storico/STATO-2026-07.md"), "utf8");
    assert.match(statoDopo, /nota numero 0/, "le più recenti restano");
    assert.doesNotMatch(statoDopo, /nota numero 39/, "le vecchie escono");
    assert.match(storicoStato, /nota numero 39/, "e si ritrovano nello storico");
    assert.match(statoDopo, /I 7 numeri/, "il cruscotto non si tocca");
    assert.match(storicoStato, /Niente è stato cancellato/, "lo storico dice cos'è e da dove viene");

    // La garanzia, di nuovo, sul risultato VERO dello strumento e non sulla funzione pura.
    // Si toglie il frontmatter dello storico: quelle righe sono metadati NUOVI del file d'archivio,
    // non contenuto spostato — e i suoi due «---» si confonderebbero con quelli dell'originale,
    // facendo gridare al duplicato. (Ci sono cascato: il primo giro di questa prova accusava una
    // perdita che non c'era.)
    const originale = `---\nk: v\n---\n${note}\n\n## I 7 numeri\nordini: 0\n`;
    const soloStoria = storicoStato.replace(/^---\n[\s\S]*?\n---\n/, "");
    const g = integro(originale, statoDopo, soloStoria);
    assert.ok(g.ok, `potatura vera: ${g.perse.length} righe perse, ${g.duplicate.length} duplicate — ${JSON.stringify(g.perse[0] || g.duplicate[0])}`);

    const codaDopo = readFileSync(join(mem, "AZIONI-IN-ATTESA.md"), "utf8");
    assert.doesNotMatch(codaDopo, /chiusa/);
    assert.match(readFileSync(join(mem, "Storico/AZIONI-IN-ATTESA-2026-07.md"), "utf8"), /chiusa/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

prova("se la potatura perdesse righe, non scrive: la condizione viene prima del risparmio", () => {
  // Si verifica leggendo il codice, perché il caso «integro() dice no» non si può fabbricare senza
  // rompere apposta il divisore: qui conta che il controllo ci sia e stia PRIMA della scrittura.
  const src = readFileSync(join(REPO, "cervello/pota-memoria.mjs"), "utf8");
  const iCheck = src.indexOf("integro(originale, vivo, storico)");
  const iScrittura = src.indexOf("writeFileSync(path, vivo");
  assert.ok(iCheck > 0 && iCheck < iScrittura, "il controllo dev'essere prima della scrittura del file vivo");
  assert.match(src, /if \(!g\.ok\) \{[\s\S]{0,200}continue;/, "e quando dice no, si salta il file invece di scriverlo");
});

// ── Il metro, che è la cosa che sbaglio più spesso ──────────────────────────

prova("un metro solo: byte, non caratteri", () => {
  // I due strumenti dicevano numeri diversi sullo stesso file (466.594 vs 479.575): `length` conta
  // unità UTF-16, e questa memoria è piena di accenti ed emoji. Due «quanto pesa» diversi si
  // contraddicono davanti a chi legge.
  const src = readFileSync(join(REPO, "cervello/pota-memoria.mjs"), "utf8");
  assert.match(src, /Buffer\.byteLength/, "la potatura deve misurare in byte");
  assert.doesNotMatch(src, /originale\.length|vivo\.length/, "nessuna misura in caratteri rimasta");
  const conAccenti = "però è così";
  assert.notEqual(conAccenti.length, Buffer.byteLength(conAccenti, "utf8"), "il caso che rende i due metri diversi");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
