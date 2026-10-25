#!/usr/bin/env node
// AR-186 — l'organigramma dei 120 vive in due posti che potevano divergere in silenzio.
//
// La riga-roster dell'organigramma (fino al 25/10/2026 stava nel manuale dell'AD, adesso in
// ORGANIGRAMMA.md) è la mappa che legge Nicola; il campo `description` del mansionario è il contratto
// che legge il router. Un rimando presente in uno solo dei due manda il lavoro a un
// senior che non lo rivendica — o lo tiene a uno che l'aveva ceduto.
//
// **La parte che conta non è «allinea due liste», è che il numero diventa ricalcolabile.** La scheda
// diceva «oggi: 14 agenti», e quel numero non era riproducibile: nel repo non c'era niente che lo
// producesse. Il primo metro che ho scritto ne trovava 2 — e sbagliava due volte:
//   · cercava `→ **nome**`, mentre la forma vera è quasi sempre `(→ motivo = **nome**)`;
//   · contava come rimando anche `lo **script** → **ai-video** monta`, che è prosa dentro la frase.
// Corretto il metro: **13**, e il tredicesimo (`qa`) usciva solo abbassando il minimo del nome a due
// lettere. Un numero su una scheda non è un fatto: è l'uscita di un metro, e se il metro non sta nel
// repo nessuno può accorgersi che la realtà si è mossa.
//
// Non-vacuità, verificata a mano su due rotture indipendenti:
//   ① logica — facendo guardare a `rimandiDi` tutta la riga invece che i soli blocchi con la freccia:
//      la prosa torna a contare come rimando e la prova fallisce.
//   ② innesto — togliendo la lettura della baseline dal guardiano (verdetto sul totale invece che
//      per nome): un agente allineato che ne rimpiazza uno nuovo non si vede più, e la prova fallisce.

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import {
  debitoRiparato,
  driftDeferral,
  nuoviRispettoAlDebito,
  rimandiDi,
  ORGANIGRAMMA,
  rosterDaOrganigramma,
} from "../deferral-agenti.mjs";
import { pesoManuale, rimandiAlVecchioRoster, rosterNelManuale, TETTO_MANUALE_BYTE } from "../agent-registry-check.mjs";
import { readdirSync } from "node:fs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const GUARDIANO = join(REPO, "cervello/deferral-agenti.mjs");
const REGISTRO = join(REPO, "cervello/agent-registry-check.mjs");
const NOMI = readdirSync(join(REPO, ".claude/agents")).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3));

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

// ── Il metro: le due forme vere, e la prosa che non è un rimando ────────────

prova("riconosce la forma con l'uguale, che è quella che il repo usa di più", () => {
  assert.deepEqual([...rimandiDi("- 🛡️ **trust-safety** — moderazione (→ contestazione Stripe = **dispute**).")], ["dispute"]);
});

prova("riconosce più rimandi nello stesso blocco", () => {
  const r = rimandiDi("(→ produzione grafica = **ai-designer**; QA tecnico brand = **qa-designer**)");
  assert.deepEqual([...r].sort(), ["ai-designer", "qa-designer"]);
});

prova("una freccia FUORI dalle parentesi è prosa, non una cessione di mandato", () => {
  // Il caso vero: «content-social scrive lo script → ai-video monta il video». Contarlo faceva
  // risultare ai-video come agente che rimanda a se stesso — un difetto inventato dal metro.
  assert.deepEqual([...rimandiDi("content-social scrive lo **script** → **ai-video** monta il video")], []);
});

prova("i nomi di due lettere esistono: qa non è un caso limite, è un senior", () => {
  const roster = rosterDaOrganigramma("- ✅ **qa** — verifica end-to-end (→ automazione = **sdet**).");
  assert.ok(roster.has("qa"), "qa deve entrare nel roster");
  assert.deepEqual([...roster.get("qa")], ["sdet"]);
});

prova("un agente non rimanda a se stesso", () => {
  const roster = rosterDaOrganigramma("- 🎬 **ai-video** — lo **script** → **ai-video** monta (→ calendario = **content-social**).");
  assert.deepEqual([...roster.get("ai-video")].sort(), ["content-social"]);
});

// ── Il confronto, in tutte e due le direzioni ───────────────────────────────

prova("dice CHI diverge e da che parte, non solo quanti", () => {
  const roster = new Map([["a", new Set(["x"])], ["b", new Set()]]);
  const schede = new Map([["a", new Set()], ["b", new Set(["y"])]]);
  assert.deepEqual(driftDeferral(roster, schede), [
    { nome: "a", solo_roster: ["x"], solo_scheda: [] },
    { nome: "b", solo_roster: [], solo_scheda: ["y"] },
  ]);
});

prova("un agente presente in un solo elenco è divergente a sua volta", () => {
  const soloRoster = driftDeferral(new Map([["a", new Set()]]), new Map());
  const soloScheda = driftDeferral(new Map(), new Map([["a", new Set()]]));
  assert.match(soloRoster[0].motivo, /senza mansionario/);
  assert.match(soloScheda[0].motivo, /roster dell'organigramma non lo nomina/);
});

prova("due elenchi identici non producono nessun rumore", () => {
  const m = () => new Map([["a", new Set(["x"])], ["b", new Set(["y", "z"])]]);
  assert.deepEqual(driftDeferral(m(), m()), []);
});

// ── Il debito si giudica per NOME, mai per conteggio ────────────────────────

prova("uno allineato e uno nuovo è un PEGGIORAMENTO, anche se il totale non cambia", () => {
  // Il caso che il conteggio non vede: erano [a, b], adesso sono [a, c]. Totale identico, ma `c` è
  // un disallineamento che nessuno ha dichiarato.
  const baseline = { agenti: { a: {}, b: {} } };
  const ora = [{ nome: "a" }, { nome: "c" }];
  assert.deepEqual(nuoviRispettoAlDebito(ora, baseline).map((d) => d.nome), ["c"]);
  assert.deepEqual(debitoRiparato(ora, baseline), ["b"]);
});

prova("il debito noto non fa rumore, e quello riparato si vede", () => {
  const baseline = { agenti: { a: {}, b: {} } };
  assert.deepEqual(nuoviRispettoAlDebito([{ nome: "a" }, { nome: "b" }], baseline), []);
  assert.deepEqual(debitoRiparato([], baseline), ["a", "b"]);
});

// ── L'innesto: il guardiano vero su un parco finto ──────────────────────────

/**
 * Un organigramma finto: ORGANIGRAMMA.md, i mansionari, e il debito dichiarato.
 * Prende una LISTA di agenti perché il caso più insidioso — «uno allineato e uno nuovo, totale
 * identico» — non si può esprimere con un agente solo, e senza quel caso la prova resta verde anche
 * se il guardiano torna a giudicare sul conteggio. (Verificato: la prima versione di questo file
 * aveva esattamente quel buco.)
 */
function parco({ agenti: lista, debito = {} }) {
  const dir = mkdtempSync(join(tmpdir(), "mycity-deferral-"));
  try {
    const agenti = join(dir, "agents");
    mkdirSync(agenti, { recursive: true });
    const righe = [];
    for (const a of lista) {
      righe.push(`- 🔧 **${a.nome}** — mandato${a.roster ? ` (→ roba = **${a.roster}**)` : ""}.`);
      writeFileSync(
        join(agenti, `${a.nome}.md`),
        `---\nname: ${a.nome}\ndescription: Usa per roba${a.scheda ? ` (→ roba = **${a.scheda}**)` : ""}\ntools: All tools\n---\n`,
      );
    }
    writeFileSync(join(dir, "ORGANIGRAMMA.md"), `${righe.join("\n")}\n`);
    const bl = join(dir, "baseline.json");
    writeFileSync(bl, JSON.stringify({ dichiarato_il: "2026-07-29", agenti: debito }));
    const r = spawnSync("node", [GUARDIANO, "--json"], {
      encoding: "utf8",
      env: { ...process.env, DEFERRAL_ORGANIGRAMMA: join(dir, "ORGANIGRAMMA.md"), DEFERRAL_AGENTS_DIR: agenti, DEFERRAL_BASELINE: bl },
    });
    let json = null;
    try { json = JSON.parse(r.stdout); } catch { /* lo guarda il caso */ }
    return { rc: r.status, out: `${r.stdout}${r.stderr}`, json };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

prova("il guardiano BOCCIA un disallineamento che non era dichiarato", () => {
  const r = parco({ agenti: [{ nome: "alfa", roster: "seo" }] });
  assert.equal(r.rc, 1, `atteso rosso:\n${r.out}`);
  assert.deepEqual(r.json.nuovi_rispetto_al_debito.map((d) => d.nome), ["alfa"]);
});

prova("e resta VERDE sullo stesso disallineamento se è dichiarato con la data", () => {
  const r = parco({ agenti: [{ nome: "alfa", roster: "seo" }], debito: { alfa: { solo_roster: ["seo"] } } });
  assert.equal(r.rc, 0, `atteso verde:\n${r.out}`);
  assert.equal(r.json.divergenti, 1, "il disallineamento c'è ancora: è dichiarato, non sparito");
});

prova("un debito che si è allineato viene detto, così la lista si accorcia", () => {
  const r = parco({ agenti: [{ nome: "alfa", roster: "seo", scheda: "seo" }], debito: { alfa: {} } });
  assert.equal(r.rc, 0);
  assert.deepEqual(r.json.debito_riparato_da_togliere, ["alfa"]);
});

prova("IL CASO CHE IL CONTEGGIO NON VEDE: uno allineato, uno nuovo, totale identico", () => {
  // Il debito dichiara alfa e beta. Adesso alfa è a posto e diverge gamma: i divergenti restano
  // due, ma uno non l'ha dichiarato nessuno. Un guardiano che confronta i totali passa liscio —
  // ed è la rottura che questa prova esiste per pescare, perché la prima versione la lasciava
  // passare (il caso c'era solo sulla funzione pura, non sul guardiano vero).
  // I nomi dei bersagli sono di due lettere e non di una: il metro pretende almeno due caratteri
  // perché `qa` esiste e `x` no. Scriverli di una lettera rendeva il fixture irreale e il caso muto.
  const r = parco({
    agenti: [
      { nome: "alfa", roster: "qa", scheda: "qa" },
      { nome: "beta", roster: "seo" },
      { nome: "gamma", roster: "cro" },
    ],
    debito: { alfa: {}, beta: {} },
  });
  assert.equal(r.json.divergenti, 2, "il totale è identico al debito: è proprio questo il tranello");
  assert.deepEqual(r.json.nuovi_rispetto_al_debito.map((d) => d.nome), ["gamma"]);
  assert.deepEqual(r.json.debito_riparato_da_togliere, ["alfa"]);
  assert.equal(r.rc, 1, `atteso rosso: gamma non è dichiarato\n${r.out}`);
});

prova("senza il debito dichiarato il guardiano è CIECO, non verde", () => {
  const dir = mkdtempSync(join(tmpdir(), "mycity-deferral-"));
  try {
    const agenti = join(dir, "agents");
    mkdirSync(agenti, { recursive: true });
    writeFileSync(join(dir, "ORGANIGRAMMA.md"), "- 🔧 **alfa** — mandato.\n");
    writeFileSync(join(agenti, "alfa.md"), "---\nname: alfa\ndescription: Usa per roba\ntools: All tools\n---\n");
    const r = spawnSync("node", [GUARDIANO], {
      encoding: "utf8",
      env: { ...process.env, DEFERRAL_ORGANIGRAMMA: join(dir, "ORGANIGRAMMA.md"), DEFERRAL_AGENTS_DIR: agenti, DEFERRAL_BASELINE: join(dir, "non-esiste.json") },
    });
    assert.equal(r.status, 2, `atteso cieco (rc=2), avuto ${r.status}`);
    assert.match(`${r.stdout}${r.stderr}`, /CIECO/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── Il repo VERO ────────────────────────────────────────────────────────────

// Il 25/10/2026 il roster è uscito da CLAUDE.md, che ogni agente rilegge a ogni turno (ne era il 56%),
// ed è andato in ORGANIGRAMMA.md. Due cose devono restare vere insieme: la casa nuova porta tutte le
// righe, e il manuale non ne riporta nessuna — altrimenti il peso torna e nasce una seconda copia.
prova("sul repo vero: il roster sta nell'organigramma e non più nel manuale dell'AD", () => {
  const nelManuale = rosterDaOrganigramma(readFileSync(join(REPO, "CLAUDE.md"), "utf8"));
  assert.deepEqual([...nelManuale.keys()], [], "righe di roster tornate in CLAUDE.md");
  const casa = rosterDaOrganigramma(readFileSync(join(REPO, ORGANIGRAMMA), "utf8"));
  assert.ok(casa.has("vendite") && casa.has("investor-relations"), "l'organigramma ha perso la testa o la coda del roster");
});

prova("il registro accusa per nome la riga di roster tornata nel manuale, e solo quella", () => {
  const manuale = [
    "# Manuale dell'AD",
    "- 🤝 **vendite** — SOLO prospecting (→ trattativa = **onboarding-negozi**).",
    "- **\"fai un giro\"** → giro: leggi i dati reali.",
    "- 🔴 **Le figure professionali** istruiscono e preparano.",
  ].join("\n");
  assert.deepEqual(rosterNelManuale(manuale), ["vendite"]);
  assert.deepEqual(rosterNelManuale(readFileSync(join(REPO, "CLAUDE.md"), "utf8")), []);
  assert.deepEqual(rosterNelManuale(readFileSync(join(REPO, "CLAUDE.md"), "utf8"), NOMI), [], "un senior vero è tornato in elenco nel manuale");
});

// IL CASO CHE HA BOCCIATO LA PRIMA VERSIONE. Il freno riconosceva solo il trattino lungo: il collaudo
// ha reincollato tutto il roster col trattino corto e il freno è rimasto a zero con 41 KB in più nel
// manuale. Qui il roster vero viene rimesso nel manuale vero in ogni forma che lo aggirava.
prova("il roster reincollato nel manuale si vede in QUALUNQUE forma, non solo col trattino lungo", () => {
  const manuale = readFileSync(join(REPO, "CLAUDE.md"), "utf8");
  const roster = readFileSync(join(REPO, ORGANIGRAMMA), "utf8");
  const forme = {
    "trattino corto": (t) => t.replaceAll("** — ", "** – "),
    "trattino semplice": (t) => t.replaceAll("** — ", "** - "),
    "dentro una citazione": (t) => t.split("\n").map((r) => `> ${r}`).join("\n"),
    "in tabella": (t) => t.split("\n").map((r) => r.replace(/^- (?:(\S+) )?\*\*([a-z0-9-]+)\*\* — /, "| $1 | **$2** | ")).join("\n"),
    "senza grassetto": (t) => t.replace(/\*\*([a-z0-9-]+)\*\* — /g, "$1 – "),
    "elenco numerato": (t) => t.replace(/^- /gm, "1. "),
    // il secondo collaudo: la stessa riga con un'altra VESTE sul nome
    "tra apici inversi": (t) => t.replace(/\*\*([a-z0-9-]+)\*\* — /g, "`$1` — "),
    "come link": (t) => t.replace(/\*\*([a-z0-9-]+)\*\* — /g, "[**$1**](../../.claude/agents/$1.md) — "),
    "con la chiocciola": (t) => t.replace(/\*\*([a-z0-9-]+)\*\* — /g, "@$1 — "),
    "in corsivo": (t) => t.replace(/\*\*([a-z0-9-]+)\*\* — /g, "*$1* — "),
    "come titolo": (t) => t.replace(/^- (?:\S+ )?\*\*([a-z0-9-]+)\*\* — /gm, "### $1 — "),
    "in tabella con gli apici": (t) => t.split("\n").map((r) => r.replace(/^- (?:(\S+) )?\*\*([a-z0-9-]+)\*\* — /, "| $1 | `$2` | ")).join("\n"),
  };
  for (const [forma, cambia] of Object.entries(forme)) {
    const reincollato = `${manuale}\n${cambia(roster)}`;
    assert.equal(rosterNelManuale(reincollato, NOMI).length, NOMI.length, `${forma}: il freno non vede tutti i ${NOMI.length} senior`);
    assert.equal(pesoManuale(reincollato).oltre, true, `${forma}: la bilancia non scatta`);
  }
});

// Il caso «per abitudine»: non il roster intero (lo ferma la bilancia) ma UNA riga, con la veste
// che il primo riconoscitore non leggeva. La bilancia qui non scatta: tocca al riconoscitore.
prova("un senior solo, rimesso nel manuale con un'altra veste sul nome, si vede lo stesso", () => {
  const manuale = readFileSync(join(REPO, "CLAUDE.md"), "utf8");
  const righe = [
    "- 🤝 `vendite` — prospecting nuovi negozi",
    "- [**vendite**](.claude/agents/vendite.md) — prospecting",
    "- @vendite — prospecting",
    "- *vendite* — prospecting",
    "### vendite — prospecting",
    "| 🤝 | `vendite` | prospecting |",
    // il terzo collaudo: i due punti DENTRO il grassetto, che è lo stile degli elenchi di CLAUDE.md
    "- 🤝 **vendite:** SOLO prospecting nuovi negozi",
    "- **vendite:** prospecting",
  ];
  for (const r of righe) {
    assert.equal(pesoManuale(`${manuale}\n${r}`).oltre, false, "premessa: una riga sola non sfonda la bilancia");
    assert.deepEqual(rosterNelManuale(`${manuale}\n${r}`, NOMI), ["vendite"], `non vede: ${r}`);
  }
  // e la veste che non si richiude, o che continua in un percorso, resta codice: niente accusa a vuoto
  for (const r of ["- `cervello/vendite.mjs` legge i dati", "- `vendite.md` è il mansionario", "- @vendite/x", "- `vendite** x", "- `vendite:3000` è una porta"]) {
    assert.deepEqual(rosterNelManuale(r, NOMI), [], `accusa a vuoto: ${r}`);
  }
});

prova("la prosa che nomina un senior NON è un roster: il freno non accusa a vuoto", () => {
  const prosa = [
    "- **Le \"mani\"** per agire: le collega il senior **builder-automazioni**.",
    "> il **tech** analizza il codice del sito",
    "  **qa** sul lavoro indipendente, **riuso** della memoria.",
    "- **\"fai un giro\"** → giro: leggi i dati reali.",
  ].join("\n");
  assert.deepEqual(rosterNelManuale(prosa, ["builder-automazioni", "tech", "qa"]), []);
});

prova("la bilancia vede anche il roster scritto in prosa, che nessun riconoscitore di righe vede", () => {
  const manuale = readFileSync(join(REPO, "CLAUDE.md"), "utf8");
  assert.equal(pesoManuale(manuale).oltre, false, `il manuale vero pesa ${pesoManuale(manuale).byte} byte, oltre ${TETTO_MANUALE_BYTE}`);
  const roster = readFileSync(join(REPO, ORGANIGRAMMA), "utf8").replace(/\n/g, " ");
  assert.deepEqual(rosterNelManuale(`${manuale}\nI senior sono questi: ${roster}`, NOMI), [], "premessa della prova: in prosa le righe non si vedono");
  assert.equal(pesoManuale(`${manuale}\nI senior sono questi: ${roster}`).oltre, true);
});

// ── Le istruzioni che mandano ancora a cercare il roster nel manuale ───────

prova("trova le istruzioni vecchie nelle sei righe vere del 25/10, e lascia stare storia e omonimi", () => {
  const testi = {
    "w.js": "{ key: 'coerenza-agenti', focus: 'agenti orfani mai richiamati da CLAUDE.md/COMANDI.md.' }",
    "s.md": "| Drift registro agenti | drift > 0 | AD | riallinea CLAUDE.md/AGENTI.md/COMANDI ai file reali | 🟡 |",
    "k.md": "Cosa cerchi: agenti citati in `CLAUDE.md` che non hanno un file",
    "a.md": "doppioni di mandato, agenti orfani mai\nrichiamati da CLAUDE.md/COMANDI.md, responsabilità in conflitto.",
    "g.sh": "# il roster di CLAUDE.md e le schede dei senior",
    // il sesto, trovato dal collaudo nel vincolo di deferral-agenti in giro.sh
    "v.sh": "\"⛔ RIMANDI FRA SENIOR DIVERGENTI: un agente rimanda a qualcuno in CLAUDE.md ma non nella sua scheda\"",
    // storia e omonimi: nessuno di questi dice dove cercare gli agenti oggi
    "storia.md": "Il roster dei senior stava in CLAUDE.md/AGENTI.md; adesso sta in ORGANIGRAMMA.md.",
    "controlli.md": "i controlli chiave (oggi solo abbozzati in AGENTI.md/CLAUDE.md)",
    "vettori.md": "> senior ottimi producono un'azienda\n> incoerente. Richiamato da `CLAUDE.md`.",
    "workflow.mjs": "WORKFLOW ORFANI (nessun comando in COMANDI.md/CLAUDE.md li evoca)",
    "cervello/agent-registry-check.mjs": "agenti orfani mai richiamati da CLAUDE.md/COMANDI.md",
  };
  const trovati = rimandiAlVecchioRoster(testi).map((r) => `${r.file}:${r.riga}`);
  assert.deepEqual(trovati, ["w.js:1", "s.md:1", "k.md:1", "a.md:2", "g.sh:1", "v.sh:1"]);
});

/**
 * Il guardiano del registro VERO su un repo finto (una cartella git con due senior). Serve a vedere
 * il rosso arrivare fino al codice d'uscita: una funzione giusta che il guardiano non somma è un
 * freno staccato, e solo l'innesto lo dice.
 */
function registroFinto({ claude = "# Manuale\n", sentinelle = "", extra = {} } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "mycity-registro-"));
  try {
    const scrivi = (rel, t) => { mkdirSync(join(dir, dirname(rel)), { recursive: true }); writeFileSync(join(dir, rel), t); };
    for (const [n, d] of [["alfa", "Usa per vendere ai negozi"], ["beta", "Usa per proteggere i dati"]]) {
      scrivi(`.claude/agents/${n}.md`, `---\nname: ${n}\ndescription: ${d}\ntools: Read\n---\nCorpo.\n`);
    }
    scrivi(ORGANIGRAMMA, "- 🧪 **alfa** — vende.\n- 🔒 **beta** — protegge.\n");
    scrivi("MyCity-Vault/07-Agenti/AGENTI.md", "Mappa dei 2 senior: alfa, beta.\n");
    scrivi("MyCity-Vault/05-Soldi-Rischi/OKR-Squadra.md", "| alfa | ordini | 1 |\n| beta | incidenti | 0 |\n");
    scrivi("COMANDI.md", "# Comandi\n");
    scrivi("CLAUDE.md", claude);
    scrivi("cervello/sentinelle.md", sentinelle || "| Sentinella | soglia | chi | rimedio |\n");
    for (const [rel, t] of Object.entries(extra)) scrivi(rel, t);
    spawnSync("git", ["init", "-q"], { cwd: dir });
    spawnSync("git", ["add", "-A"], { cwd: dir });
    const r = spawnSync("node", [REGISTRO, "--json"], {
      encoding: "utf8",
      env: { ...process.env, AGENT_REGISTRY_ROOT: dir, SUPABASE_URL: "", SUPABASE_SERVICE_KEY: "" },
    });
    let json = null;
    try { json = JSON.parse(r.stdout); } catch { /* lo guarda il caso */ }
    return { rc: r.status, out: `${r.stdout}${r.stderr}`.slice(0, 1500), json };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

prova("innesto: il registro vero è VERDE su un repo finto pulito", () => {
  const r = registroFinto();
  assert.equal(r.json?.drift_totale, 0, `atteso drift 0:\n${r.out}`);
  assert.equal(r.rc, 0);
});

prova("innesto: una sentinella che manda a riallineare il manuale fa diventare ROSSO il registro", () => {
  const r = registroFinto({ sentinelle: "| Drift registro agenti | drift > 0 | AD | riallinea CLAUDE.md/AGENTI.md/COMANDI ai file reali | 🟡 |\n" });
  assert.deepEqual(r.json?.rimandi_al_vecchio_roster?.righe?.map((x) => x.file), ["cervello/sentinelle.md"], r.out);
  assert.equal(r.rc, 1, "l'istruzione vecchia è trovata ma non arriva al codice d'uscita");
});

// Il sesto rimando stava in uno script di shell, fuori dal perimetro dei conteggi: il registro lo
// legge anche lì, perché i vincoli di giro.sh finiscono nel prompt del motore.
prova("innesto: un vincolo di shell che manda i rimandi in CLAUDE.md fa diventare ROSSO il registro", () => {
  const vincolo = "DEFERRAL_VINCOLO=\"⛔ RIMANDI FRA SENIOR DIVERGENTI: un agente rimanda a qualcuno in CLAUDE.md ma non nella sua scheda\"\n";
  const r = registroFinto({ extra: { "cervello/giro.sh": vincolo } });
  assert.deepEqual(r.json?.rimandi_al_vecchio_roster?.righe?.map((x) => x.file), ["cervello/giro.sh"], r.out);
  assert.equal(r.rc, 1, "il vincolo vecchio nello script è trovato ma non arriva al codice d'uscita");
  const pulito = registroFinto({ extra: { "cervello/giro.sh": vincolo.replace("in CLAUDE.md", "in ORGANIGRAMMA.md") } });
  assert.equal(pulito.rc, 0, `riscritto verso l'organigramma deve tornare verde:\n${pulito.out}`);
});

prova("innesto: il roster reincollato col trattino corto fa diventare ROSSO il registro", () => {
  const r = registroFinto({ claude: "# Manuale\n- 🧪 **alfa** – vende.\n- 🔒 **beta** – protegge.\n" });
  assert.deepEqual(r.json?.roster_nel_manuale, ["alfa", "beta"], r.out);
  assert.equal(r.rc, 1);
});

prova("innesto: un manuale oltre il tetto in byte fa diventare ROSSO il registro, in qualunque forma", () => {
  const r = registroFinto({ claude: `# Manuale\n${"prosa che pesa ".repeat(Math.ceil(TETTO_MANUALE_BYTE / 15) + 10)}\n` });
  assert.equal(r.json?.peso_manuale?.oltre, true, r.out);
  assert.equal(r.rc, 1);
});

prova("se l'organigramma non c'è il guardiano è CIECO, non verde", () => {
  const dir = mkdtempSync(join(tmpdir(), "mycity-deferral-"));
  try {
    const agenti = join(dir, "agents");
    mkdirSync(agenti, { recursive: true });
    writeFileSync(join(agenti, "alfa.md"), "---\nname: alfa\ndescription: Usa per roba\ntools: All tools\n---\n");
    const r = spawnSync("node", [GUARDIANO], {
      encoding: "utf8",
      env: { ...process.env, DEFERRAL_ORGANIGRAMMA: join(dir, "ORGANIGRAMMA.md"), DEFERRAL_AGENTS_DIR: agenti },
    });
    assert.equal(r.status, 2, `atteso cieco (rc=2), avuto ${r.status}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("sul repo vero: 120 nel roster, 120 mansionari, e nessuna divergenza non dichiarata", () => {
  const r = spawnSync("node", [GUARDIANO, "--json"], { cwd: REPO, encoding: "utf8" });
  const j = JSON.parse(r.stdout);
  assert.equal(j.roster, 120, `roster ${j.roster}: se scende, una riga ha cambiato forma e il metro non la vede più`);
  assert.equal(j.schede, 120);
  assert.deepEqual(j.nuovi_rispetto_al_debito, [], "disallineamenti nuovi, non dichiarati");
  assert.equal(r.status, 0, `atteso verde:\n${r.stdout}${r.stderr}`);
});

prova("il guardiano è appeso al giro, non lasciato in un file che nessuno esegue", () => {
  // La malattia che questo cantiere cura da trenta lotti: una regola giusta che nessuno invoca.
  const giro = readFileSync(join(REPO, "cervello/giro.sh"), "utf8");
  assert.match(giro, /guardiano deferral-agenti\.mjs/, "il giro non esegue il guardiano");
  assert.match(giro, /\$DEFERRAL_VINCOLO/, "l'esito non arriva al motore come vincolo");
});

prova("e il numero è ricalcolabile con UN comando: è questo che mancava", () => {
  const r = spawnSync("node", [GUARDIANO, "--conta"], { cwd: REPO, encoding: "utf8" });
  const n = Number(r.stdout.trim());
  assert.ok(Number.isInteger(n), `--conta deve stampare un numero, ha stampato: ${JSON.stringify(r.stdout)}`);
  assert.ok(n >= 0 && n <= 120);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
