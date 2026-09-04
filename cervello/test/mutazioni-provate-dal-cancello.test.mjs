// 🧨 AR-393 — LA PROVA CHE LE PROVE PROVINO, ESEGUITA DA QUALCUNO.
//
// Il difetto misurato il 29/7: `cervello/non-vacuita.mjs` — lo strumento nato dopo aver scoperto
// che una prova può essere verde **perché cieca** — non lo lanciava nessuno. In tutto il repo il
// suo nome compariva in tre posti: la skill `cantiere` (istruzioni per chi lavora), due righe di
// quaderno, e un messaggio dentro `cancello-lotto.mjs` che diceva a chi legge «rompi il fix e
// pretendi il rosso». Il cancello del lotto lanciava una decina di controlli e non lanciava lui:
// il controllo che misura se gli altri servono a qualcosa era l'unico senza esecutore.
//
// La causa radice, scritta nella scheda: era nato **dentro una skill**, cioè come procedura per chi
// lavora, non come guardiano della macchina. Ciò che vive solo in un documento dipende dalla
// memoria di chi legge.
//
// Questa prova fa due cose, e la seconda è quella che conta:
//   ① che il cancello lo ESEGUA (e sui difetti del lotto, non su trenta lotti di storia);
//   ② che lo strumento, eseguito, FUNZIONI: su una mutazione che lascia il test verde deve uscire
//      1, e il file rotto deve tornare come prima. Senza ②, «lo eseguiamo» sarebbe di nuovo una
//      forma senza sostanza — esattamente il difetto accanto (AR-394).

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { filtraPerDifetti } from "../non-vacuita.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const STRUMENTO = join(REPO, "cervello/non-vacuita.mjs");

/** Un banco finto: un «fix» da rompere, la sua prova, e il registro delle mutazioni. */
function banco({ provaVede }) {
  const dir = mkdtempSync(join(tmpdir(), "non-vacuita-"));
  const fix = join(dir, "fix.mjs");
  const prova = join(dir, "prova.mjs");
  writeFileSync(fix, 'export const SOGLIA = 3;\nexport const guardia = (n) => n <= SOGLIA;\n');
  // La prova onesta legge il comportamento; quella cieca guarda solo che il modulo esista.
  writeFileSync(
    prova,
    provaVede
      ? `import { guardia } from "${fix}";\nif (guardia(9)) { console.error("guardia rotta"); process.exit(1); }\n`
      : `import { guardia } from "${fix}";\nif (typeof guardia !== "function") process.exit(1);\n`,
  );
  const mutanti = join(dir, "mutanti.json");
  writeFileSync(
    mutanti,
    JSON.stringify({
      mutanti: [
        { lotto: 99, difetto: "AR-999", nome: "alza la soglia", file: fix, test: prova, cerca: "n <= SOGLIA", sostituisci: "true" },
      ],
    }),
  );
  return { dir, fix, mutanti, pulisci: () => rmSync(dir, { recursive: true, force: true }) };
}

const lancia = (mutanti, extra = []) =>
  spawnSync("node", [STRUMENTO, ...extra], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 120_000,
    env: { ...process.env, MUTANTI_FILE: mutanti },
  });

test("una prova cieca viene smascherata: rotto il fix, resta verde → esce 1", () => {
  const b = banco({ provaVede: false });
  try {
    const r = lancia(b.mutanti);
    assert.equal(r.status, 1, `atteso 1 (prova vacua), ricevuto ${r.status}: ${r.stdout}${r.stderr}`);
    assert.match(`${r.stdout}`, /vacua|VERDE/i);
  } finally {
    b.pulisci();
  }
});

test("una prova che guarda il comportamento passa, e il file rotto torna come prima", () => {
  const b = banco({ provaVede: true });
  try {
    const prima = readFileSync(b.fix, "utf8");
    const r = lancia(b.mutanti);
    assert.equal(r.status, 0, `atteso 0 (prova non vacua), ricevuto ${r.status}: ${r.stdout}${r.stderr}`);
    assert.equal(readFileSync(b.fix, "utf8"), prima, "il fix rotto apposta NON è stato ripristinato: lo strumento lascia macerie");
  } finally {
    b.pulisci();
  }
});

test("cieco non è verde: una mutazione che punta a un pezzo sparito esce 2", () => {
  const b = banco({ provaVede: true });
  try {
    const j = JSON.parse(readFileSync(b.mutanti, "utf8"));
    j.mutanti[0].cerca = "questo pezzo non esiste più";
    writeFileSync(b.mutanti, JSON.stringify(j));
    const r = lancia(b.mutanti);
    assert.equal(r.status, 2, `atteso 2 (non ho potuto misurare), ricevuto ${r.status}`);
  } finally {
    b.pulisci();
  }
});

test("il filtro per difetti esiste, perché il cancello ne lancia solo una parte", () => {
  const elenco = [
    { difetto: "AR-1", nome: "a" },
    { difetto: "AR-2+AR-3", nome: "b" },
    { difetto: "", nome: "c" },
  ];
  assert.deepEqual(filtraPerDifetti(elenco, ["AR-3"]).map((m) => m.nome), ["b"]);
  assert.deepEqual(filtraPerDifetti(elenco, null).length, 3, "senza filtro si guarda tutto");
  assert.deepEqual(filtraPerDifetti(elenco, ["AR-99"]).length, 0, "un difetto senza mutazioni non ne tira dentro altre");
});

test("il cancello del lotto lo ESEGUE — non lo nomina in un messaggio", () => {
  const src = readFileSync(join(REPO, "cervello/cancello-lotto.mjs"), "utf8");
  // La forma che conta è l'array di argomenti di un processo: `["cervello/non-vacuita.mjs", …]`.
  // Il messaggio che c'era prima («node cervello/non-vacuita.mjs» dentro una stringa di testo) non
  // combacia con questa, ed è precisamente la differenza fra un cartello e un freno.
  // ⟲ AGGIORNATO IL 4/9 (AR-938): fra il cancello e il banco ci sono adesso le corsie parallele,
  // quindi gli anelli da pretendere sono DUE. Pretenderne uno solo lascerebbe staccare l'altro.
  assert.match(
    src,
    /esegui\(\s*"[^"]*",\s*"node",\s*\[\s*"cervello\/banco-a-corsie\.mjs"/,
    "primo anello: il cancello deve lanciare le corsie come passo, col loro codice d'uscita dentro il verdetto",
  );
  assert.match(
    readFileSync(join(REPO, "cervello/banco-a-corsie.mjs"), "utf8"),
    /\[\s*join\([^)]*"cervello\/non-vacuita\.mjs"\)/,
    "secondo anello: ogni corsia deve lanciare il banco vero, col percorso scritto per esteso — passato da una variabile, il collegamento sparisce dagli occhi della macchina",
  );
});
