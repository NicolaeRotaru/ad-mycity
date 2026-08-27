#!/usr/bin/env node
// 🧪 AR-847 — «STATO.md supera il campo visivo ogni pochi giorni, e ad accorgersene è sempre il
// cancello a lavoro finito.»
//
// Il controllo che tiene leggibili i testi legge fino a 200.000 caratteri e poi taglia: sopra quella
// soglia, su quel file, smette di proteggere. STATO.md cresce di una voce a ogni lotto. La cadenza è
// misurata: 22/8 a 345.000 caratteri, 27/8 a 200.864. Cinque giorni. E ogni spostamento era a mano.
//
// Queste prove ESEGUONO lo strumento su file costruiti apposta. La domanda che contano davvero è
// una sola, ed è quella che rende sicuro uno spostamento automatico su un file di memoria:
// **nessuna voce si perde**. Si contano prima e dopo, sui DUE file.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BERSAGLIO, SEZIONE, SOGLIA, spaccaStato, vociDaSpostare } from "../housekeeping-stato.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const STRUMENTO = join(QUI, "..", "housekeeping-stato.mjs");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: e.message }); }
};

const TESTA = [
  "---", "tipo: stato", "aggiornato: 2026-08-27 15:00", "---", "",
  "## I numeri chiave, come li ho misurati l'ultima volta", "",
  "**Sta in cima apposta.** Prima era in fondo, dentro una voce di agosto, e archiviando le voci",
  "vecchie sarebbe sparita — portandosi dietro il numero che tre controlli usano.", "",
  "| Numero | Oggi | Note |", "|---|---|---|", "| Ordini pagati | **0** | North Star |", "",
];
const voce = (n, peso = 1) => [
  `> 🔧 **${String(n).padStart(2, "0")}/8 10:00 — Lotto ${n}. Titolo della voce numero ${n}.**`,
  ">",
  `> ${"contenuto ".repeat(60 * peso)}`,
  "",
];
const fileFinto = (quante, peso = 1) => [...TESTA, SEZIONE, "", ...Array.from({ length: quante }, (_, i) => voce(quante - i, peso)).flat()].join("\n");

const conta = (t) => (t.match(/^>\s*\p{Extended_Pictographic}️?\s*\*\*\d/gmu) || []).length;

// ─────────────── Il taglio riconosce le voci, e la testa non si tocca ───────────────

prova("le voci si contano una per una, e la testa resta fuori", () => {
  const p = spaccaStato(fileFinto(6));
  assert.equal(p.leggibile, true, p.motivo || "");
  assert.equal(p.voci.length, 6);
  assert.ok(p.testa.join("\n").includes("I numeri chiave"), "i numeri chiave devono stare nella testa: archiviarli è il difetto che il file stesso avverte");
  assert.ok(p.testa.join("\n").startsWith("---\ntipo: stato"), "il frontmatter non è nella testa");
});

prova("un file di forma sconosciuta non si tocca: ⚪, non un taglio a caso", () => {
  const p = spaccaStato("# Un file qualunque\n\nsenza sezione e senza voci.\n");
  assert.equal(p.leggibile, false);
  assert.match(p.motivo, /non riconosco la forma/);
  assert.deepEqual(p.voci, []);
});

prova("una sezione senza voci riconoscibili non si tocca", () => {
  const p = spaccaStato([...TESTA, SEZIONE, "", "solo prosa, nessuna voce.", ""].join("\n"));
  assert.equal(p.leggibile, false);
});

// ─────────────── La decisione: quante, e quando nessuna ───────────────

prova("sotto la soglia non si sposta NIENTE", () => {
  const d = vociDaSpostare(spaccaStato(fileFinto(3)));
  assert.equal(d.quante, 0, `su un file corto ha deciso di spostare ${d.quante} voci`);
  assert.match(d.perche, /sotto la soglia/);
});

prova("sopra la soglia si sposta quanto basta a tornare sotto il bersaglio", () => {
  const p = spaccaStato(fileFinto(400));
  const intero = [...p.testa, ...p.voci.flat()].join("\n").length;
  assert.ok(intero > SOGLIA, `il file costruito non supera la soglia: ${intero} < ${SOGLIA}`);
  const d = vociDaSpostare(p);
  assert.ok(d.quante > 0, "sopra la soglia non sposta niente");
  assert.ok(d.dimensione <= BERSAGLIO * 1.1, `dopo lo spostamento resta a ${d.dimensione}, lontano dal bersaglio ${BERSAGLIO}`);
});

prova("AR-847: si lascia SEMPRE almeno una voce, anche se una sola sfora da sola", () => {
  // Un file di stato senza nessun passaggio recente non è pulito: è un file che ha perso il suo
  // contenuto, e il rimando all'archivio non lo sostituisce.
  const enorme = [...TESTA, SEZIONE, "", ...voce(1, 400)].join("\n");
  const p = spaccaStato(enorme);
  assert.equal(p.voci.length, 1);
  assert.equal(vociDaSpostare(p).quante, 0, "ha svuotato il file: resta senza nessun passaggio");
});

// ─────────────── LA PROVA CHE CONTA: nessuna voce si perde ───────────────

prova("IL CASO CHE HA GENERATO TUTTO: lo strumento gira e NESSUNA voce si perde", () => {
  const dir = mkdtempSync(join(tmpdir(), "stato-hk-"));
  const vivo = join(dir, "STATO.md");
  const arch = join(dir, "Archivio", "STATO-archivio.md");
  const partenza = fileFinto(400);
  writeFileSync(vivo, partenza);
  const prima = conta(partenza);
  assert.ok(prima >= 400, `il file di partenza ha ${prima} voci`);

  const r = spawnSync(process.execPath, [STRUMENTO, "--json"], { encoding: "utf8", env: { ...process.env, STATO_FILE: vivo, STATO_ARCHIVIO: arch } });
  assert.equal(r.status, 0, `lo strumento è uscito ${r.status}: ${r.stderr || r.stdout}`);

  const dopoVivo = readFileSync(vivo, "utf8");
  assert.ok(existsSync(arch), "l'archivio non è stato scritto");
  const dopo = conta(dopoVivo) + conta(readFileSync(arch, "utf8"));
  assert.equal(dopo, prima, `voci prima ${prima}, dopo ${dopo}: lo spostamento ne ha perse ${prima - dopo}`);
  assert.ok(dopoVivo.length < SOGLIA, `il file resta sopra la soglia: ${dopoVivo.length}`);
  assert.ok(dopoVivo.includes("I numeri chiave"), "i numeri chiave sono spariti dal file vivo");
  assert.match(dopoVivo, /📦 \*\*Le voci piu/, "manca il rimando all'archivio: chi legge non sa dove sono finite");
  rmSync(dir, { recursive: true, force: true });
});

prova("AR-847: e le voci spostate sono le PIÙ VECCHIE, non le prime che capitano", () => {
  const dir = mkdtempSync(join(tmpdir(), "stato-hk-eta-"));
  const vivo = join(dir, "STATO.md");
  const arch = join(dir, "Archivio", "STATO-archivio.md");
  writeFileSync(vivo, fileFinto(400));
  spawnSync(process.execPath, [STRUMENTO], { encoding: "utf8", env: { ...process.env, STATO_FILE: vivo, STATO_ARCHIVIO: arch } });
  const restano = readFileSync(vivo, "utf8");
  const archiviate = readFileSync(arch, "utf8");
  assert.ok(restano.includes("Lotto 400."), "la voce più recente non è più nel file vivo");
  assert.ok(archiviate.includes("Lotto 1."), "la voce più vecchia non è finita in archivio");
  assert.ok(!restano.includes("Lotto 1."), "la voce più vecchia è rimasta nel vivo");
  rmSync(dir, { recursive: true, force: true });
});

prova("AR-847: due passate di fila non spostano due volte, e non perdono niente", () => {
  // Un attrezzo che gira a ogni giro deve essere innocuo quando non serve.
  const dir = mkdtempSync(join(tmpdir(), "stato-hk-due-"));
  const vivo = join(dir, "STATO.md");
  const arch = join(dir, "Archivio", "STATO-archivio.md");
  writeFileSync(vivo, fileFinto(400));
  const prima = conta(readFileSync(vivo, "utf8"));
  const amb = { ...process.env, STATO_FILE: vivo, STATO_ARCHIVIO: arch };
  spawnSync(process.execPath, [STRUMENTO], { encoding: "utf8", env: amb });
  const dopoUna = readFileSync(vivo, "utf8");
  const r2 = spawnSync(process.execPath, [STRUMENTO, "--json"], { encoding: "utf8", env: amb });
  assert.match(r2.stdout, /"spostate": 0/, `la seconda passata ha spostato ancora: ${r2.stdout.slice(0, 200)}`);
  assert.equal(readFileSync(vivo, "utf8"), dopoUna, "la seconda passata ha cambiato il file pur non spostando niente");
  assert.equal(conta(readFileSync(vivo, "utf8")) + conta(readFileSync(arch, "utf8")), prima, "fra le due passate si è persa una voce");
  rmSync(dir, { recursive: true, force: true });
});

prova("AR-847: --dry-run non tocca niente", () => {
  const dir = mkdtempSync(join(tmpdir(), "stato-hk-secco-"));
  const vivo = join(dir, "STATO.md");
  const arch = join(dir, "Archivio", "STATO-archivio.md");
  const partenza = fileFinto(400);
  writeFileSync(vivo, partenza);
  const r = spawnSync(process.execPath, [STRUMENTO, "--dry-run"], { encoding: "utf8", env: { ...process.env, STATO_FILE: vivo, STATO_ARCHIVIO: arch } });
  assert.match(r.stdout, /sposterei \d+ voci/);
  assert.equal(readFileSync(vivo, "utf8"), partenza, "la prova a secco ha scritto sul file");
  assert.equal(existsSync(arch), false, "la prova a secco ha creato l'archivio");
  rmSync(dir, { recursive: true, force: true });
});

prova("AR-847: l'archivio si scrive PRIMA del vivo — se muore in mezzo, duplica invece di perdere", () => {
  // Lente della sicurezza sul perimetro. Questo strumento scrive da solo su un file di memoria: la
  // domanda non e' «funziona», e' «come si rompe». Scrivendo prima il vivo, un processo ucciso fra
  // le due scritture farebbe SPARIRE le voci; scrivendo prima l'archivio le duplica, e un doppione
  // si toglie mentre una perdita no.
  const src = readFileSync(join(QUI, "..", "housekeeping-stato.mjs"), "utf8")
    .split("\n")
    .filter((r) => !r.trimStart().startsWith("//"))
    .join("\n");
  // 27/8: le due scritture sono passate alla penna condivisa (scriviTestoAtomico) per rientrare sotto
  // il tetto degli scrittori crudi del vault. L'ancora si sposta col codice — e questo caso ha fatto
  // il suo mestiere: invece di passare, ha detto CIECO. Un ⚪ non e' mai un verde.
  const iA = src.indexOf("scriviTestoAtomico(\n    ARCHIVIO");
  const iV = src.indexOf("scriviTestoAtomico(VIVO");
  assert.ok(iA > 0 && iV > 0, "CIECO: non trovo le due scritture, questo caso non controlla niente");
  assert.ok(iA < iV, "il file vivo si scrive prima dell'archivio: una morte in mezzo perde le voci invece di duplicarle");
});

prova("AR-847: lo strumento e' MONTATO nel giro — o e' un attrezzo che non usa nessuno", () => {
  // La malattia di casa: un cancello costruito bene su una porta che nessuno apre. Uno strumento
  // che sposta da solo serve solo se qualcuno lo lancia da solo. Le righe commentate si scartano
  // prima di cercare: una riga commentata contiene ancora, lettera per lettera, cio' che si cerca.
  const viva = readFileSync(join(QUI, "..", "giro.sh"), "utf8")
    .split("\n")
    .filter((r) => !r.trimStart().startsWith("#"))
    .join("\n");
  assert.match(viva, /node "\$SCRIPT_DIR\/housekeeping-stato\.mjs"/, "il giro non lancia lo spostamento: resta un attrezzo da usare a mano, che e' il difetto");
  // E l'esito NON deve finire in una pipe: li' il codice d'uscita che conta e' quello dell'ultimo
  // comando, sempre 0. L'uscita 2 di questo attrezzo vuol dire «non riconosco la forma del file»,
  // cioe' il ⚪ che non deve poter passare per un verde. Il guardiano delle malattie mi ha fermato
  // proprio su questa riga: avevo copiato la forma sbagliata dall'attrezzo gemello.
  assert.ok(
    !/housekeeping-stato\.mjs"?\s*2>&1\s*\|/.test(viva),
    "l'esito dello spostamento finisce in una pipe: se il file cambia forma, il giro non se ne accorge",
  );
  assert.match(viva, /_hks_rc.*-eq 2/, "nessuno guarda l'uscita 2: la cecita' dello spostamento passerebbe in silenzio");
});

prova("AR-847: SUL FILE VERO, la forma si riconosce ancora", () => {
  // Scade da sola il giorno che qualcuno cambia la struttura di STATO.md senza dirlo a questo
  // strumento — che è il momento in cui lo spostamento automatico diventa pericoloso.
  const p = spaccaStato(readFileSync(join(QUI, "..", "..", "MyCity-Vault/90-Memoria-AI/STATO.md"), "utf8"));
  assert.equal(p.leggibile, true, p.motivo || "");
  assert.ok(p.voci.length > 10, `sul file vero riconosco solo ${p.voci.length} voci: il taglio non sta funzionando`);
  assert.ok(p.testa.join("\n").includes("I numeri chiave"), "i numeri chiave del file vero non finiscono nella testa: verrebbero archiviati");
});

const rotte = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "ok" : "NON ok"} — ${c.nome}${c.ok ? "" : `\n   ${c.err}`}`);
console.log(`\n${casi.length - rotte.length}/${casi.length} passate`);
if (rotte.length) process.exit(1);
