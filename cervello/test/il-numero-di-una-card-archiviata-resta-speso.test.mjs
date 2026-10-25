/**
 * Il numero di una card resta speso anche quando la card cambia FILE.
 *
 * Dal 23/8 (AR-807) le card chiuse non scendono più in fondo alla coda: la pulizia le porta in
 * `Archivio/AZIONI-archivio.md`. AR-751 e AR-779 avevano insegnato a `prossimoNumero` che un numero
 * archiviato resta speso — ma l'archivio, allora, stava nello stesso file. Spostato di casa,
 * nessuno degli scrittori di card lo guardava più.
 *
 * Esempio vero, 25/10: il «ok 130» ha archiviato 62 card, fra cui la #211, la più alta di tutte.
 * La coda si fermava a #210 e il prossimo numero usciva 211: un numero già di un'altra card. «ok
 * 211» sarebbe tornata una domanda con due risposte, la stessa malattia del 16/8.
 *
 * Qui si ricrea il guasto in miniatura e si fanno girare DAVVERO, in una cartella finta con il suo
 * archivio accanto: la card di merge di git-pr, i due guardiani che scrivono card da soli, il
 * comando che dà il numero a chi scrive a mano, e la pulizia che crea l'archivio. Il collaudo del
 * 25/10 ha bocciato la prima versione perché la strada vera della card di merge e l'AD che scrive a
 * mano non li provava nessuno.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { numeriUsati, prossimoNumero } from "../pausa-coda.mjs";
import { ARCHIVIO, archivioDi, testoArchivioDi } from "../coda-e-archivio.mjs";
import { accodaAzione, rigaDaAccodare } from "../git-pr.mjs";
import { prossimaCard } from "../prossima-card.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

// La forma esatta del 25/10, in miniatura: la coda si ferma a 210, l'archivio arriva a 211.
const CODA_FERMA_A_210 = [
  "# Azioni in attesa",
  "",
  "### 🟡 #209 — Una card ancora in attesa · ⏳ accodata 2026-10-20 09:00",
  "",
  "### 🟡 #210 — Un'altra card in attesa · ⏳ accodata 2026-10-21 10:00",
  "",
  "---",
  "",
  "> 🗄️ Le card chiuse stanno in [[AZIONI-archivio]]. Adesso sono 2.",
  "",
].join("\n");
const ARCHIVIO_FINO_A_211 = [
  "# Archivio delle azioni",
  "",
  "### ✅ #211 — Cancellare il vecchio commit dalla cronologia · ⏳ accodata 2026-10-24 18:00",
  "",
  "| # | Quando | Chi | Cosa | Colore |",
  "| --- | --- | --- | --- | --- |",
  "| 130 | 2026-09-02 10:00 | @tech | Una card già fatta | 🟡 |",
  "",
].join("\n");

/**
 * Una cartella finta con la coda e, se chiesto, l'archivio accanto (o una cartella al suo posto).
 * Il percorso dell'archivio è scritto qui PER ESTESO, non chiesto ad `archivioDi`: se la funzione
 * sbagliasse cartella, una prova che costruisce il finto con la stessa funzione sbaglierebbe insieme.
 */
function cartellaFinta({ coda = CODA_FERMA_A_210, archivio = ARCHIVIO_FINO_A_211, archivioIlleggibile = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "mycity-archivio-"));
  const fCoda = join(dir, "AZIONI-IN-ATTESA.md");
  const fArch = join(dir, "Archivio", "AZIONI-archivio.md");
  writeFileSync(fCoda, coda);
  mkdirSync(dirname(fArch), { recursive: true });
  if (archivioIlleggibile) mkdirSync(fArch); // esiste, ma non è un file: non si legge
  else if (archivio !== null) writeFileSync(fArch, archivio);
  return { dir, coda: fCoda, archivio: fArch, pulisci: () => rmSync(dir, { recursive: true, force: true }) };
}

const impronta = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

test("① il caso che ha rotto: archiviata la card più alta, il prossimo numero non torna indietro", () => {
  assert.equal(prossimoNumero(CODA_FERMA_A_210, ARCHIVIO_FINO_A_211), 212, "l'archivio arriva a 211: il primo libero è 212");
  const usati = numeriUsati(CODA_FERMA_A_210, ARCHIVIO_FINO_A_211);
  assert.deepEqual([...usati].sort((a, b) => a - b), [130, 209, 210, 211]);
});

test("② l'archivio sta in Archivio/ accanto alla sua coda, e l'archivio vero c'è davvero", () => {
  assert.equal(archivioDi("/x/y/AZIONI-IN-ATTESA.md"), "/x/y/Archivio/AZIONI-archivio.md");
  assert.equal(ARCHIVIO, join(REPO, "MyCity-Vault/90-Memoria-AI/Archivio/AZIONI-archivio.md"));
  assert.ok(existsSync(ARCHIVIO), "l'archivio vero non c'è dove lo cerco: chi sceglie i numeri tornerebbe cieco");
});

const CODA_CON_UNA_CHIUSA = [
  "# ⏳ AZIONI IN ATTESA", "",
  "### 🟡 #210 — resta aperta · ⏳ accodata 2026-10-21 10:00", "", "testo", "", "---", "",
  "### ✅ #211 — già fatta · ⏳ accodata 2026-10-24 18:00", "", "testo della chiusa", "",
].join("\n");

/**
 * La pulizia ricava il vault dalla cartella in cui sta il suo file: lanciata dal repo, anche rotta
 * può scrivere nell'archivio VERO — è successo, il 25/10, a una versione di questa stessa prova sotto
 * mutazione. Quindi gira da una COPIA, con un vault finto: qualunque cosa sbagli, sbaglia lì.
 */
function pulisciInUnaCopia(ambiente = {}) {
  const radice = mkdtempSync(join(tmpdir(), "mycity-pulizia-"));
  mkdirSync(join(radice, "cervello"));
  for (const f of ["housekeeping-azioni.mjs", "coda-e-archivio.mjs", "git-github.mjs", "marketplace-repo.mjs"]) {
    copyFileSync(join(REPO, "cervello", f), join(radice, "cervello", f));
  }
  const vault = join(radice, "MyCity-Vault", "90-Memoria-AI");
  mkdirSync(vault, { recursive: true });
  const env = { ...process.env, ...ambiente(radice) };
  delete env.CODA_ARCHIVIO;
  if (!ambiente(radice).CODA_FILE) delete env.CODA_FILE;
  return { radice, vault, gira: () => execFileSync("node", [join(radice, "cervello/housekeeping-azioni.mjs")], { cwd: radice, encoding: "utf8", env }) };
}

test("③ la pulizia mette l'archivio ACCANTO alla sua coda, e lì lo cerca chi sceglie i numeri", () => {
  const primaDelVero = impronta(ARCHIVIO);
  // (a) i valori di partenza: la coda del vault, l'archivio in Archivio/ accanto.
  const a = pulisciInUnaCopia(() => ({}));
  // (b) solo la coda spostata altrove: l'archivio la segue, il vault resta com'è.
  const b = pulisciInUnaCopia((r) => ({ CODA_FILE: join(r, "altrove", "AZIONI-IN-ATTESA.md") }));
  try {
    writeFileSync(join(a.vault, "AZIONI-IN-ATTESA.md"), CODA_CON_UNA_CHIUSA);
    a.gira();
    const archA = join(a.vault, "Archivio", "AZIONI-archivio.md");
    assert.match(readFileSync(archA, "utf8"), /### ✅ #211/, "la pulizia non ha messo l'archivio in Archivio/ accanto alla coda");

    const codaB = join(b.radice, "altrove", "AZIONI-IN-ATTESA.md");
    mkdirSync(dirname(codaB), { recursive: true });
    writeFileSync(codaB, CODA_CON_UNA_CHIUSA);
    b.gira();
    const archB = join(b.radice, "altrove", "Archivio", "AZIONI-archivio.md");
    assert.match(readFileSync(archB, "utf8"), /### ✅ #211/, "con la coda spostata, l'archivio non l'ha seguita");
    assert.ok(!existsSync(join(b.vault, "Archivio", "AZIONI-archivio.md")), "la pulizia di una coda spostata ha scritto nell'archivio del vault");
    assert.equal(prossimaCard(codaB), 212, "chi sceglie il numero non trova l'archivio dove la pulizia l'ha scritto");
  } finally {
    rmSync(a.radice, { recursive: true, force: true });
    rmSync(b.radice, { recursive: true, force: true });
  }
  assert.equal(impronta(ARCHIVIO), primaDelVero, "una prova ha scritto nell'archivio vero");
});

test("③bis un archivio che non c'è vale vuoto; uno che c'è e non si legge ferma tutto", () => {
  const f = cartellaFinta({ archivio: null });
  try {
    assert.equal(testoArchivioDi(f.coda), "", "una coda appena nata non ha numeri spesi in archivio");
    writeFileSync(f.archivio, ARCHIVIO_FINO_A_211);
    assert.equal(testoArchivioDi(f.coda), ARCHIVIO_FINO_A_211);
    rmSync(f.archivio);
    mkdirSync(f.archivio);
    assert.throws(() => testoArchivioDi(f.coda), "un archivio illeggibile non è un archivio vuoto");
  } finally {
    f.pulisci();
  }
});

test("④ la card di merge, scritta per davvero da accodaAzione, prende il numero dopo il SUO archivio", () => {
  // L'archivio finto arriva a 950, un numero che quello vero non ha: se accodaAzione leggesse
  // l'archivio del vault invece di quello accanto alla coda ricevuta, qui uscirebbe un altro numero.
  const f = cartellaFinta({ archivio: "### ✅ #950 — Una card archiviata · ⏳ accodata 2026-10-24 18:00\n" });
  try {
    accodaAzione({
      prUrl: "https://example.invalid/pr/1",
      prNumber: 1,
      cfg: { key: "ad-mycity" },
      base: "main",
      branch: "ramo-di-prova",
      title: "prova",
      dryRun: false,
      percorsoCoda: f.coda,
    });
    const dopo = readFileSync(f.coda, "utf8");
    assert.match(dopo, /^\| 951 \| .*Merge PR #1 ad-mycity/m, "la card di merge doveva prendere il 951: il 950 è del suo archivio");
  } finally {
    f.pulisci();
  }
});

test("⑤ chi chiede il numero della card di merge senza dare l'archivio si ferma, non sbaglia in silenzio", () => {
  const opzioni = { prUrl: "u", prNumber: 1, base: "main", repoLabel: "ad-mycity", when: "2026-10-25 13:00" };
  assert.throws(() => rigaDaAccodare(CODA_FERMA_A_210, opzioni), /archivio/);
  assert.equal(rigaDaAccodare(CODA_FERMA_A_210, { ...opzioni, archivio: ARCHIVIO_FINO_A_211 }).num, 212);
  assert.equal(rigaDaAccodare(CODA_FERMA_A_210, { ...opzioni, archivio: "" }).num, 211, "senza archivio dichiarato vuoto, vale la coda");
});

test("⑥ chi scrive a mano ha un comando che gli dà il numero giusto, e cieco se non legge", () => {
  const f = cartellaFinta();
  try {
    const ok = spawnSync("node", [join(REPO, "cervello/prossima-card.mjs"), "--coda", f.coda], { encoding: "utf8" });
    assert.equal(ok.status, 0, ok.stderr);
    assert.equal(ok.stdout.trim(), "212");
    rmSync(f.archivio);
    mkdirSync(f.archivio);
    const cieco = spawnSync("node", [join(REPO, "cervello/prossima-card.mjs"), "--coda", f.coda], { encoding: "utf8" });
    assert.equal(cieco.status, 2, "con l'archivio illeggibile il comando deve dirsi cieco (2)");
    assert.equal(cieco.stdout.trim(), "", "e non deve stampare nessun numero");
  } finally {
    f.pulisci();
  }
});

function sensoriSpenti(f) {
  const cecita = join(f.dir, "cecita.json");
  const motivi = join(f.dir, "motivi.json");
  writeFileSync(cecita, JSON.stringify({ sensori: { sito_uptime: { stato: "non_configurato" } } }));
  writeFileSync(motivi, JSON.stringify({ motivi: { sito_uptime: { motivo: "inerzia" } } }));
  return spawnSync("node", [join(REPO, "cervello/sensori-spenti-check.mjs"), "--accoda"], {
    cwd: REPO,
    encoding: "utf8",
    env: { ...process.env, SENSORI_CECITA_FILE: cecita, SENSORI_MOTIVI_FILE: motivi, SENSORI_CODA_FILE: f.coda },
  });
}

test("⑦ il guardiano dei sensori spenti scrive la sua card col numero dopo l'archivio", () => {
  const f = cartellaFinta();
  try {
    sensoriSpenti(f);
    const dopo = readFileSync(f.coda, "utf8");
    assert.match(dopo, /^### 🟡 #212 — Dimmi se questi occhi/m, "la card nuova doveva prendere il 212: il 211 è dell'archivio");
    assert.doesNotMatch(dopo, /^### \S+ #211 /m);
  } finally {
    f.pulisci();
  }
});

const CODA_IN_PAUSA = [
  "# coda finta",
  "",
  "### 🟡 #210 — Fai la cosa · ⏳ accodata 2026-07-01 09:00 · ⏸ in pausa (rinvio finto)",
  "",
  "- **⏸ Pausa:** rinvio finto · classe **business** · riprende con `fatto.finto`",
  "",
  "**Contesto:** niente di vero.",
  "",
  "---",
  "",
].join("\n");

function risveglio(f) {
  const registro = join(f.dir, "fatti.json");
  writeFileSync(registro, JSON.stringify({ fatti: [{ id: "fatto.finto", valore: "dopo il 10 luglio 2026" }] }));
  return spawnSync("node", [join(REPO, "cervello/pausa-check.mjs"), "--risveglia", "--adesso", "2026-07-20T08:00"], {
    cwd: REPO,
    encoding: "utf8",
    env: { ...process.env, PAUSA_CODA_FILE: f.coda, PAUSA_REGISTRO_FILE: registro },
  });
}

test("⑧ il guardiano delle pause scrive la card del risveglio col numero dopo l'archivio", () => {
  const f = cartellaFinta({ coda: CODA_IN_PAUSA });
  try {
    const r = risveglio(f);
    assert.equal(r.status, 0, r.stderr);
    assert.match(readFileSync(f.coda, "utf8"), /^### 🟡 #212 — La pausa sui negozi è finita/m, "la card del risveglio doveva prendere il 212: il 211 è dell'archivio");
  } finally {
    f.pulisci();
  }
});

test("⑨ con l'archivio illeggibile i due guardiani escono ciechi (2) e non toccano la coda", () => {
  for (const [nome, coda, gira] of [["sensori spenti", CODA_FERMA_A_210, sensoriSpenti], ["pause", CODA_IN_PAUSA, risveglio]]) {
    const f = cartellaFinta({ coda, archivioIlleggibile: true });
    try {
      const r = gira(f);
      assert.equal(r.status, 2, `${nome}: un archivio illeggibile è cieco, non «difetto trovato» (uscita ${r.status})`);
      assert.match(`${r.stdout}${r.stderr}`, /CIECO/);
      assert.equal(readFileSync(f.coda, "utf8"), coda, `${nome}: la coda è stata toccata pur senza sapere quali numeri sono spesi`);
    } finally {
      f.pulisci();
    }
  }
});

// ── Il freno al momento della scrittura (mano-fermata) ───────────────────────────────────────
// Il numero nel contesto è una fotografia, e le card oggi le scrivono anche le sessioni
// interattive, che quella riga non la ricevono. Il freno vero sta un passo prima della scrittura:
// qualunque porta, un numero già speso non entra in coda.

test("⑩ la regola: un numero NUOVO già speso si ferma; riscrivere una card che c'è passa", async () => {
  const { numeriGiaSpesi } = await import("../mano-fermata.mjs");
  const coda = "### 🟡 #210 — a · ⏳ accodata 2026-10-21 10:00\n";
  const arch = "### ✅ #211 — b · ⏳ accodata 2026-10-24 18:00\n";
  const card = (n) => `### 🟡 #${n} — nuova · ⏳ accodata 2026-10-25 14:00\n`;
  const edit = (nuovo, vecchio = "x") => ({ old_string: vecchio, new_string: nuovo });
  assert.deepEqual(numeriGiaSpesi({ toolInput: edit(card(211)), testoCoda: coda, testoArchivio: arch }), [211], "il 211 è dell'archivio");
  assert.deepEqual(numeriGiaSpesi({ toolInput: edit(card(212)), testoCoda: coda, testoArchivio: arch }), []);
  assert.deepEqual(numeriGiaSpesi({ toolInput: edit("### ✅ #210 — a", "### 🟡 #210 — a"), testoCoda: coda, testoArchivio: arch }), [], "segnare fatta una card che c'è non è una card nuova");
  const dopoIlMerge = coda + "| 212 | 2026-10-25 14:00 | @tech | Merge PR #999 ad-mycity → main | 🔴 |\n";
  assert.deepEqual(numeriGiaSpesi({ toolInput: edit(card(212)), testoCoda: dopoIlMerge, testoArchivio: arch }), [212], "la card di merge ha appena preso il 212");
  assert.deepEqual(numeriGiaSpesi({ toolInput: { content: coda + card(212) }, testoCoda: coda, testoArchivio: arch }), []);
  assert.deepEqual(numeriGiaSpesi({ toolInput: { content: coda + card(211) }, testoCoda: coda, testoArchivio: arch }), [211]);
  assert.deepEqual(numeriGiaSpesi({ toolInput: { content: coda + card(213) + card(213) }, testoCoda: coda, testoArchivio: arch }), [213], "lo stesso numero due volte nello stesso testo");
});

function manoFermata(evento) {
  return spawnSync("node", [join(REPO, "cervello/mano-fermata.mjs"), "--hook"], { cwd: REPO, encoding: "utf8", input: JSON.stringify(evento) });
}

test("⑪ l'hook vero, sulla coda vera: rifiuta il numero più alto dell'archivio, lascia passare quello libero", () => {
  // Sola lettura sulla coda e sull'archivio veri; il registro dell'hook è un file _tmp_ escluso da git.
  const coda = join(REPO, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md");
  const archivio = testoArchivioDi(coda);
  const alto = Math.max(...numeriUsati(archivio));
  const libero = prossimaCard(coda);
  const scrivi = (n) => ({ tool_name: "Edit", tool_input: { file_path: coda, old_string: "segnaposto", new_string: `### 🟡 #${n} — prova · ⏳ accodata 2026-10-25 14:00\n` } });
  const no = manoFermata(scrivi(alto));
  assert.equal(no.status, 0);
  const busta = JSON.parse(no.stdout || "{}");
  assert.equal(busta.hookSpecificOutput?.permissionDecision, "deny", `il #${alto} è dell'archivio: la scrittura doveva fermarsi`);
  assert.match(busta.hookSpecificOutput.permissionDecisionReason, new RegExp(`#${libero}\\b`), "il rifiuto deve dire il numero libero");
  const si = manoFermata(scrivi(libero));
  assert.equal(si.status, 0);
  assert.equal(si.stdout.trim(), "", `il #${libero} è libero: la scrittura doveva passare`);
  const altrove = manoFermata({ tool_name: "Edit", tool_input: { file_path: join(REPO, "cervello/azioni.md"), old_string: "x", new_string: `### 🟡 #${alto} — un esempio · ⏳ accodata 2026-10-25 14:00\n` } });
  assert.equal(altrove.stdout.trim(), "", "fuori dalla coda il freno sui numeri non si applica");
});

test("⑫ un codice lungo in una tabella non diventa un numero di card", () => {
  const coda = "### 🟡 #210 — a · ⏳ accodata 2026-10-21 10:00\n| 1234567890123456789012 | 12 € |\n";
  assert.equal(prossimoNumero(coda), 211, "un numero di 22 cifre diventava 1.2e+21 e il prossimo numero restava uguale all'infinito");
});

test("⑬ git-pr --accoda con l'archivio illeggibile si ferma cieco PRIMA di toccare git o GitHub", () => {
  const f = cartellaFinta({ archivioIlleggibile: true });
  try {
    const r = spawnSync("node", [join(REPO, "cervello/git-pr.mjs"), "--repo", "ad-mycity", "--accoda", "--dry-run"], {
      cwd: REPO,
      encoding: "utf8",
      timeout: 30_000,
      env: { ...process.env, GIT_PR_CODA_FILE: f.coda },
    });
    assert.equal(r.status, 2, `doveva uscire cieco (2), è uscito ${r.status}: ${r.stderr}`);
    assert.match(r.stderr, /CIECO/);
    assert.doesNotMatch(`${r.stdout}${r.stderr}`, /DRY-RUN/, "è andato avanti verso git e GitHub senza sapere quale numero dare alla card");
  } finally {
    f.pulisci();
  }
});

test("⑭ lanciati passando da un collegamento simbolico, i due programmi partono davvero", () => {
  // giro.sh li chiama da SCRIPT_DIR, il percorso logico: se il repo sta dietro un collegamento,
  // confrontare solo gli URL li lasciava muti, uscita 0 e nessuna riga.
  const dir = mkdtempSync(join(tmpdir(), "mycity-collegamento-"));
  try {
    const link = join(dir, "repo");
    symlinkSync(REPO, link);
    const pausa = spawnSync("node", [join(link, "cervello/pausa-check.mjs"), "--json"], { cwd: dir, encoding: "utf8" });
    assert.match(pausa.stdout, /"card_in_pausa"/, `pausa-check è rimasto muto (uscita ${pausa.status})`);
    const numero = spawnSync("node", [join(link, "cervello/prossima-card.mjs")], { cwd: dir, encoding: "utf8" });
    assert.match(numero.stdout.trim(), /^\d+$/, `prossima-card non ha stampato il numero (uscita ${numero.status})`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
