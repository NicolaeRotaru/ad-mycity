/**
 * Il numero di una card resta speso anche quando la card cambia FILE.
 *
 * Dal 23/8 (AR-807) le card chiuse non scendono più in fondo alla coda: la pulizia le porta in
 * `Archivio/AZIONI-archivio.md`. AR-751 e AR-779 avevano insegnato a `prossimoNumero` che un numero
 * archiviato resta speso — ma l'archivio, allora, stava nello stesso file. Spostato di casa,
 * nessuno dei tre scrittori automatici di card lo guardava più.
 *
 * Esempio vero, 25/10: il «ok 130» ha archiviato 62 card, fra cui la #211, la più alta di tutte.
 * La coda si fermava a #210 e il prossimo numero usciva 211: un numero già di un'altra card. «ok
 * 211» sarebbe tornata una domanda con due risposte, la stessa malattia del 16/8.
 *
 * Qui si ricrea il guasto in miniatura, si prova che chi legge l'archivio lo distingue dall'archivio
 * che non c'è e da quello che non si legge, e si fanno girare DAVVERO i due guardiani che scrivono
 * card da soli, in una cartella finta con il suo archivio accanto.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { numeriUsati, prossimoNumero } from "../pausa-coda.mjs";
import { ARCHIVIO, CODA, archivioDi, testoArchivioDi } from "../coda-e-archivio.mjs";
import { rigaDaAccodare } from "../git-pr.mjs";

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

function cartellaFinta() {
  const dir = mkdtempSync(join(tmpdir(), "mycity-archivio-"));
  const coda = join(dir, "AZIONI-IN-ATTESA.md");
  return { dir, coda, archivio: archivioDi(coda), pulisci: () => rmSync(dir, { recursive: true, force: true }) };
}

test("① il caso che ha rotto: archiviata la card più alta, il prossimo numero non torna indietro", () => {
  assert.equal(prossimoNumero(CODA_FERMA_A_210, ARCHIVIO_FINO_A_211), 212, "l'archivio arriva a 211: il primo libero è 212");
  const usati = numeriUsati(CODA_FERMA_A_210, ARCHIVIO_FINO_A_211);
  assert.deepEqual([...usati].sort((a, b) => a - b), [130, 209, 210, 211]);
});

test("② l'archivio sta accanto alla sua coda, ed è lo stesso posto dove la pulizia lo scrive", () => {
  assert.equal(archivioDi("/x/y/AZIONI-IN-ATTESA.md"), "/x/y/Archivio/AZIONI-archivio.md");
  assert.equal(ARCHIVIO, archivioDi(CODA));
  assert.ok(existsSync(ARCHIVIO), "l'archivio vero non c'è dove lo cerco: chi sceglie i numeri tornerebbe cieco");
  const pulizia = readFileSync(join(REPO, "cervello/housekeeping-azioni.mjs"), "utf8");
  assert.match(pulizia, /path\.join\(VAULT, 'Archivio', 'AZIONI-archivio\.md'\)/, "la pulizia ha cambiato casa all'archivio senza dirlo a chi sceglie i numeri");
});

test("③ un archivio che non c'è vale vuoto; uno che c'è e non si legge ferma tutto", () => {
  const f = cartellaFinta();
  try {
    assert.equal(testoArchivioDi(f.coda), "", "una coda appena nata non ha numeri spesi in archivio");
    mkdirSync(dirname(f.archivio), { recursive: true });
    writeFileSync(f.archivio, ARCHIVIO_FINO_A_211);
    assert.equal(testoArchivioDi(f.coda), ARCHIVIO_FINO_A_211);
    rmSync(f.archivio);
    mkdirSync(f.archivio); // al posto del file c'è una cartella: esiste, ma non si legge
    assert.throws(() => testoArchivioDi(f.coda), "un archivio illeggibile non è un archivio vuoto");
  } finally {
    f.pulisci();
  }
});

test("④ la card di merge di una PR prende un numero che l'archivio non ha già speso", () => {
  const { num, row } = rigaDaAccodare(CODA_FERMA_A_210, {
    prUrl: "https://example.invalid/pr/1",
    prNumber: 1,
    base: "main",
    repoLabel: "ad-mycity",
    when: "2026-10-25 13:00",
    archivio: ARCHIVIO_FINO_A_211,
  });
  assert.equal(num, 212);
  assert.match(row, /^\| 212 \|/);
});

test("⑤ il guardiano dei sensori spenti scrive la sua card col numero dopo l'archivio", () => {
  const f = cartellaFinta();
  try {
    writeFileSync(f.coda, CODA_FERMA_A_210);
    mkdirSync(dirname(f.archivio), { recursive: true });
    writeFileSync(f.archivio, ARCHIVIO_FINO_A_211);
    const cecita = join(f.dir, "cecita.json");
    const motivi = join(f.dir, "motivi.json");
    writeFileSync(cecita, JSON.stringify({ sensori: { sito_uptime: { stato: "non_configurato" } } }));
    writeFileSync(motivi, JSON.stringify({ motivi: { sito_uptime: { motivo: "inerzia" } } }));
    try {
      execFileSync("node", [join(REPO, "cervello/sensori-spenti-check.mjs"), "--accoda"], {
        cwd: REPO,
        encoding: "utf8",
        env: { ...process.env, SENSORI_CECITA_FILE: cecita, SENSORI_MOTIVI_FILE: motivi, SENSORI_CODA_FILE: f.coda },
      });
    } catch {
      // esce ≠0 finché lo spento non dice perché: qui conta la card che ha scritto
    }
    const dopo = readFileSync(f.coda, "utf8");
    assert.match(dopo, /^### 🟡 #212 — Dimmi se questi occhi/m, "la card nuova doveva prendere il 212: il 211 è dell'archivio");
    assert.doesNotMatch(dopo, /^### \S+ #211 /m);
  } finally {
    f.pulisci();
  }
});

test("⑥ il guardiano delle pause scrive la card del risveglio col numero dopo l'archivio", () => {
  const f = cartellaFinta();
  try {
    writeFileSync(f.coda, [
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
    ].join("\n"));
    mkdirSync(dirname(f.archivio), { recursive: true });
    writeFileSync(f.archivio, ARCHIVIO_FINO_A_211);
    const registro = join(f.dir, "fatti.json");
    writeFileSync(registro, JSON.stringify({ fatti: [{ id: "fatto.finto", valore: "dopo il 10 luglio 2026" }] }));
    execFileSync("node", [join(REPO, "cervello/pausa-check.mjs"), "--risveglia", "--adesso", "2026-07-20T08:00"], {
      cwd: REPO,
      encoding: "utf8",
      env: { ...process.env, PAUSA_CODA_FILE: f.coda, PAUSA_REGISTRO_FILE: registro },
    });
    const dopo = readFileSync(f.coda, "utf8");
    assert.match(dopo, /^### 🟡 #212 — La pausa sui negozi è finita/m, "la card del risveglio doveva prendere il 212: il 211 è dell'archivio");
  } finally {
    f.pulisci();
  }
});
