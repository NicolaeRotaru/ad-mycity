#!/usr/bin/env node
// AR-287 — il guardiano dava 120 su 120 anche quando il quaderno del senior era un foglio bianco.
//
// Contava `existsSync(quaderno)`, e un foglio bianco esiste. Misurato il 28/7: **72 quaderni su 120
// non hanno mai avuto una riga ESITO**, e il guardiano diceva «120/120 senior completi». Un metro
// arrivato al 100% non misura più niente: va ri-tarato o dichiarato concluso.
//
// Due trappole trovate mentre misuravo, e ci sono cascato in entrambe — sono qui come casi:
//   · la riga «Formato: … atteso→reale …» del modello contiene le stesse parole di un esito vero, e
//     ha fatto risultare pieni 70 quaderni bianchi;
//   · `chiusura-loop` scrive il più recente IN TESTA, quindi l'ultima riga del file è la più VECCHIA:
//     leggere l'ultima riga dichiara fermo un quaderno scritto un minuto fa.

import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { DIFETTO, esiti, statoQuaderno, ultimoEsito } from "../stampo-metro.mjs";

// AR-436 (lotto 49) — i quattro titoli non bastano più a fare un mansionario sano: il metro adesso
// misura anche la sostanza. Questa prova parla del QUADERNO, quindi l'agente finto dev'essere sano di
// tutto il resto, o un rosso non direbbe niente sulla regola in prova. Una costante sola invece di tre
// copie: tre copie della stessa finzione divergono, ed è la malattia che questo lotto sta curando.
const MANSIONARIO_SANO = [
  "## 🎓 SCHEDA MESTIERE — fuoriclasse del forno", "",
  "Il tuo metro è RUBRICA-LIVELLI scorecard.", "",
  "**Come pensi (modelli mentali).**",
  "- **Il pane fresco vende sé stesso**: se è caldo alle sette la fila si forma da sola in via Roma.",
  "- **Densità prima di varietà**: dieci pezzi di tre tipi battono tre pezzi di dieci tipi, sempre.",
  "- **Il cliente delle sette non è quello delle undici**: due mestieri nello stesso negozio, davvero.", "",
  "**Il tuo loop interno (NON consegni la prima bozza).**",
  "1. Genera **almeno 3 angoli diversi** per l'offerta del giorno.",
  "2. Criticali contro il TASTE-FILE-NICOLA, non contro il tuo gusto.",
  "3. Tieni 1. Domanda-ghigliottina: **«Lo comprerebbe un piacentino di 60 anni di fretta?»** → se no, rifai.", "",
  "**Galleria di riferimento.**",
  "- ✅ GOLD: «Focaccia calda dalle 7, tre pezzi a 5 euro, finita alle 9» — perché funziona: dice l'ora,",
  "  il prezzo e la scarsità vera, e chi passa capisce in tre secondi se gli conviene correre adesso.",
  "- ❌ SPAZZATURA: «Vieni a scoprire le nostre specialità artigianali» — perché muore: nessun orario,",
  "  nessun prezzo, nessuna ragione per muoversi adesso invece che domani o mai più.", "",
  "**Trappole del mestiere.** Promettere il caldo col forno spento · annunciare quantità che non hai ·",
  "sconti a pioggia che bruciano il margine · scrivere «artigianale» senza dire cosa cambia.", "",
  "**Il carburante che chiedi.** Ti servono: le **quantità sfornate per fascia oraria**, le **foto del",
  "banco delle sette**, il **prezzo di costo della farina**, l'orario vero di chiusura.", "",
  "## 🧬 Carta del Dipendente", "✅ RITUALE DI FINE — auto-verifica.",
].join("\n");


const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const OGGI = "2026-07-28";

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

const MODELLO = [
  "# 🧠 Quaderno di accessibility",
  "> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro 🟡/🔴.",
  "> Formato: AAAA-MM-GG · contesto · scorecard 6 assi · atteso→reale · #tag",
  "",
  "## Esiti",
  "- (ancora vuoto — il primo ESITO si registra con: node cervello/chiusura-loop.mjs registra …)",
].join("\n");

prova("il caso che ha rotto: un foglio bianco esiste, e non è completo", () => {
  const s = statoQuaderno(MODELLO, { adessoIso: OGGI });
  assert.equal(s.stato, "vuoto");
  assert.equal(s.difetto, DIFETTO.QUADERNO_VUOTO);
});

prova("la riga del MODELLO non è un esito, anche se contiene «atteso→reale»", () => {
  // È la trappola in cui sono cascato misurando: 70 quaderni bianchi risultavano pieni.
  assert.deepEqual(esiti(MODELLO), []);
  assert.equal(ultimoEsito(MODELLO), null);
});

prova("l'ultimo esito è la data PIÙ ALTA, non l'ultima riga del file", () => {
  // chiusura-loop scrive il più recente in testa: leggere l'ultima riga dà la più vecchia.
  const q = [
    "## Esiti",
    "- 2026-07-28 15:56 · lavoro di oggi · atteso X → reale Y",
    "- 2026-07-09 12:35 · lavoro vecchio · atteso X → reale Y",
  ].join("\n");
  assert.equal(ultimoEsito(q), "2026-07-28");
  assert.equal(statoQuaderno(q, { adessoIso: OGGI }).stato, "vivo",
    "prendendo l'ultima riga uscirebbe «fermo da 19 giorni» su un quaderno scritto stamattina");
});

prova("un quaderno con righe ma vecchie è FERMO, e resta distinto da vuoto", () => {
  const q = "## Esiti\n- 2026-01-01 09:00 · vecchio · atteso X → reale Y";
  const s = statoQuaderno(q, { adessoIso: OGGI });
  assert.equal(s.stato, "fermo");
  assert.equal(s.difetto, DIFETTO.QUADERNO_FERMO);
  assert.ok(s.giorni > 30);
});

prova("quaderno assente ≠ quaderno vuoto: sono due difetti diversi", () => {
  assert.equal(statoQuaderno(null, { adessoIso: OGGI }).difetto, DIFETTO.QUADERNO_ASSENTE);
  assert.equal(statoQuaderno("", { adessoIso: OGGI }).difetto, DIFETTO.QUADERNO_VUOTO);
});

// ── Il guardiano VERO ───────────────────────────────────────────────────────

prova("sul parco vero il guardiano dice quanti quaderni sono mai stati scritti", () => {
  const r = spawnSync("node", [join(REPO, "cervello/stampo-check.mjs"), "--json"], { cwd: REPO, encoding: "utf8" });
  const j = JSON.parse(r.stdout);
  assert.equal(j.quaderni.vivi + j.quaderni.vuoti + j.quaderni.fermi + j.quaderni.assenti, j.totale_agenti);
  assert.ok(j.quaderni.vuoti > 0,
    "al 28/7 erano 72: se diventassero 0 questa riga va aggiornata, ma non può essere 0 per svista del metro");
  assert.ok(j.per_tipo[DIFETTO.QUADERNO_VUOTO] > 0, "e il foglio bianco dev'essere un DIFETTO, non un dettaglio");
});

prova("il guardiano dichiara cosa NON prova (regola di processo di AR-287)", () => {
  const r = spawnSync("node", [join(REPO, "cervello/stampo-check.mjs"), "--json"], { cwd: REPO, encoding: "utf8" });
  const j = JSON.parse(r.stdout);
  assert.ok(j._cosa_NON_prova && j._cosa_NON_prova.length > 60,
    "un verde va letto per quello che vale: il guardiano deve dire da solo dove finisce il suo metro");
});

prova("la regola vale per OGNI guardiano, non solo per questo", () => {
  // «In più ogni guardiano dichiara nel proprio _cosa_e la riga cosa questo check NON prova.»
  // Chi emette un VERDE che qualcuno legge come verdetto — non i contatori, i registri e i digest,
  // che scrivono stato senza giudicare. Sono cinque, e sono nominati qui perché la regola non resti
  // una frase: se ne nasce un sesto, va aggiunto insieme alla sua riga.
  const GUARDIANI = ["stampo-check", "cantiere-prove", "chiusura-loop", "pagella-intelligenza", "verifica-sensori"];
  const senza = GUARDIANI.filter((g) => !/_cosa_NON_prova/.test(readFileSync(join(REPO, `cervello/${g}.mjs`), "utf8")));
  assert.deepEqual(senza, [], `guardiani che non dicono dove finisce il loro metro: ${senza.join(", ")}`);
});

prova("e la riga dice qualcosa: non è un campo riempito per far passare il controllo", () => {
  for (const g of ["stampo-check", "cantiere-prove", "chiusura-loop", "pagella-intelligenza", "verifica-sensori"]) {
    const t = readFileSync(join(REPO, `cervello/${g}.mjs`), "utf8");
    const m = t.match(/_cosa_NON_prova:\s*\n?\s*"([^"]+)"/);
    assert.ok(m && m[1].length > 80, `${g}: la riga è vuota o troppo corta per dire un limite vero`);
    assert.match(m[1], /[Nn]on prova/, `${g}: deve dire cosa NON prova, non ripetere cosa fa`);
  }
});

prova("il guardiano sa dire di NO: un quaderno vuoto non dichiarato lo fa uscire 1", () => {
  // È la prova che il metro non è tornato decorativo: si costruisce un parco finto con un agente
  // nuovo, quaderno bianco, e si pretende il rosso.
  const dir = mkdtempSync(join(tmpdir(), "mycity-stampo-"));
  try {
    for (const d of ["agents", "kit", "squadra"]) mkdirSync(join(dir, d));
    writeFileSync(join(dir, "agents/nuovo.md"), MANSIONARIO_SANO);
    writeFileSync(join(dir, "kit/nuovo-KIT.md"), `# k\n\n## E. aggancio\n${"x".repeat(30000)}\n`);
    writeFileSync(join(dir, "squadra/nuovo.md"), "## Esiti\n- (ancora vuoto)\n");
    writeFileSync(join(dir, "baseline.json"), JSON.stringify({ dichiarato_il: "2026-07-28", debito: {} }));
    const env = {
      ...process.env,
      STAMPO_AGENTS_DIR: join(dir, "agents"),
      STAMPO_KIT_DIR: join(dir, "kit"),
      STAMPO_SQUADRA_DIR: join(dir, "squadra"),
      STAMPO_BASELINE: join(dir, "baseline.json"),
    };
    const r = spawnSync("node", [join(REPO, "cervello/stampo-check.mjs")], { cwd: REPO, encoding: "utf8", env });
    assert.equal(r.status, 1, `un foglio bianco non dichiarato è un rosso:\n${r.stdout}${r.stderr}`);
    assert.match(`${r.stdout}${r.stderr}`, /quaderno_vuoto/);

    // ...e se lo stesso difetto è DICHIARATO nel debito, torna verde: è il patto che tiene il
    // cancello acceso invece di farlo disattivare la settimana dopo.
    writeFileSync(join(dir, "baseline.json"), JSON.stringify({ dichiarato_il: "2026-07-28", debito: { nuovo: ["quaderno_vuoto"] } }));
    assert.equal(spawnSync("node", [join(REPO, "cervello/stampo-check.mjs")], { cwd: REPO, encoding: "utf8", env }).status, 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

prova("senza il debito dichiarato è CIECO (2), non verde", () => {
  const dir = mkdtempSync(join(tmpdir(), "mycity-stampo-cieco-"));
  try {
    for (const d of ["agents", "kit", "squadra"]) mkdirSync(join(dir, d));
    writeFileSync(join(dir, "agents/nuovo.md"), MANSIONARIO_SANO);
    writeFileSync(join(dir, "kit/nuovo-KIT.md"), `# k\n\n## E. aggancio\n${"x".repeat(30000)}\n`);
    writeFileSync(join(dir, "squadra/nuovo.md"), "## Esiti\n- 2026-07-28 10:00 · x · atteso a → reale b\n");
    const r = spawnSync("node", [join(REPO, "cervello/stampo-check.mjs")], {
      cwd: REPO, encoding: "utf8",
      env: { ...process.env, STAMPO_AGENTS_DIR: join(dir, "agents"), STAMPO_KIT_DIR: join(dir, "kit"), STAMPO_SQUADRA_DIR: join(dir, "squadra"), STAMPO_BASELINE: join(dir, "non-esiste.json") },
    });
    assert.equal(r.status, 2, "non aver potuto leggere il metro non è un verde (AR-322)");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

prova("provare il guardiano non sporca la misura vera", () => {
  // Un parco finto non deve poter scrivere in auto-coscienza: il Pannello mostrerebbe due agenti.
  const prima = execFileSync("git", ["-C", REPO, "status", "--short", "MyCity-Vault/90-Memoria-AI/auto-coscienza/stampo-check.json"], { encoding: "utf8" });
  const dir = mkdtempSync(join(tmpdir(), "mycity-stampo-pulito-"));
  try {
    for (const d of ["agents", "kit", "squadra"]) mkdirSync(join(dir, d));
    writeFileSync(join(dir, "agents/nuovo.md"), MANSIONARIO_SANO);
    spawnSync("node", [join(REPO, "cervello/stampo-check.mjs")], {
      cwd: REPO, encoding: "utf8",
      env: { ...process.env, STAMPO_AGENTS_DIR: join(dir, "agents"), STAMPO_KIT_DIR: join(dir, "kit"), STAMPO_SQUADRA_DIR: join(dir, "squadra"), STAMPO_BASELINE: join(dir, "nb.json") },
    });
    const dopo = execFileSync("git", ["-C", REPO, "status", "--short", "MyCity-Vault/90-Memoria-AI/auto-coscienza/stampo-check.json"], { encoding: "utf8" });
    assert.equal(dopo, prima, "il parco finto ha scritto nella fotografia vera");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
