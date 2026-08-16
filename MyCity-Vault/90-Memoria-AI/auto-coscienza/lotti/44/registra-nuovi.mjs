#!/usr/bin/env node
// 🆕 I DIFETTI TROVATI RIPARANDO — dai frammenti delle corsie al cantiere, con un id ciascuno.
//
// Perché è l'AD a farlo: l'id si conia UNA volta sola. Il 30/7 due sessioni aperte insieme hanno
// preso lo stesso numero libero e sono nati due AR-444 diversi — git non se ne accorge (righe
// diverse dello stesso array) e da lì in poi le prove condivise non sanno più di quale difetto
// parlano. Quindi: il numero più alto si legge da `origin/main` aggiornato, mai dalla copia in mano.
//
// ⚠️ La lettura da git NON passa per lo stdout del processo. `cantiere-difetti.json` pesa 1,79 MB
// oggi: un `execFileSync` che raccoglie l'uscita in memoria eredita il tetto di 1 MB di Node e muore
// con ENOBUFS — cioè si rompe PROPRIO adesso, e si romperebbe peggio quando il file cresce. È la
// malattia «git-letto-senza-tetto», e il guardiano me l'ha fermata mentre stavo per riscriverla.
// Qui l'uscita va dritta su un file e il file si legge dopo: nessun tetto da indovinare.
//
// Uso:  node MyCity-Vault/90-Memoria-AI/auto-coscienza/lotti/44/registra-nuovi.mjs [--scrivi]

import { readFileSync, writeFileSync, readdirSync, openSync, closeSync, mkdtempSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { timbroOra } from "../../../../../cervello/ora-piacenza.mjs";

const ROOT = dirname(dirname(dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))));
const CANTIERE = join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");
const DENTRO_GIT = "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json";
const SCRIVI = process.argv.includes("--scrivi");
const LOTTO = 44;

const testo = readFileSync(CANTIERE, "utf8");
const indent = (testo.match(/^\{\r?\n(\s+)"/) || [, "  "])[1].length;
const cantiere = JSON.parse(testo);

/** Il cantiere di `origin/main`, letto su file e non in memoria. */
function cantiereRemoto() {
  const dir = mkdtempSync(join(tmpdir(), "cantiere-remoto-"));
  const dove = join(dir, "cantiere.json");
  const fd = openSync(dove, "w");
  try {
    const r = spawnSync("git", ["show", `origin/main:${DENTRO_GIT}`], { cwd: ROOT, stdio: ["ignore", fd, "pipe"] });
    closeSync(fd);
    if (r.status !== 0) throw new Error(String(r.stderr || "").split("\n")[0] || `uscita ${r.status}`);
    return JSON.parse(readFileSync(dove, "utf8"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const numeri = (lista) => lista.map((d) => parseInt(String(d.id).replace("AR-", ""), 10)).filter(Number.isFinite);

let maxRemoto = 0;
try {
  maxRemoto = Math.max(...numeri(cantiereRemoto().difetti));
} catch (e) {
  console.error(`⛔ non ho potuto leggere il cantiere di origin/main (${e.message}): non conio id alla cieca.`);
  process.exit(2);
}
const maxLocale = Math.max(...numeri(cantiere.difetti));
let prossimo = Math.max(maxRemoto, maxLocale) + 1;
console.log(`numero più alto: ${maxRemoto} su origin/main · ${maxLocale} qui → si parte da AR-${prossimo}`);

const nuovi = [];
for (const f of readdirSync(join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/lotti/44")).filter((x) => /^corsia-\d+\.json$/.test(x)).sort()) {
  const d = JSON.parse(readFileSync(join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/lotti/44", f), "utf8"));
  for (const x of d.difetti_nuovi || []) nuovi.push({ corsia: d.corsia, ...x });
}

const adesso = timbroOra();
const aggiunti = nuovi.map((x) => ({
  id: `AR-${prossimo++}`,
  stato: "aperto",
  dimensione: "trovato-riparando",
  gravita: x.gravita || "minore",
  titolo: x.titolo,
  causa_radice: x.causa_radice || "",
  fix_proposto: x.fix_proposto || "",
  impatto_crescita:
    x.impatto_crescita ||
    "indiretto: è debito della macchina che si ripara da sola, non una leva diretta sul primo ordine pagato",
  nato: adesso,
  nato_come: "scoperta",
  nato_da: `lotto ${LOTTO}, corsia ${x.corsia}: trovato mentre si riparava un altro difetto`,
  lotto_scoperta: LOTTO,
  dove: x.dove || "",
  // Niente `verifica`: la prova la scrive chi lo ripara. Metterne una a pattern adesso vorrebbe dire
  // farlo richiudere da solo al primo giro, cioè timbrare un fix che nessuno ha fatto (AR-444).
}));

console.log(`\n🆕 ${aggiunti.length} difetti nuovi da registrare:`);
for (const a of aggiunti) console.log(`   ${a.id} [${a.gravita}] ${a.titolo.slice(0, 90)}`);

if (SCRIVI) {
  cantiere.difetti.push(...aggiunti);
  writeFileSync(CANTIERE, JSON.stringify(cantiere, null, indent) + "\n");
  console.log(`\n💾 scritti nel cantiere (indentazione ${indent} conservata).`);
} else {
  console.log("\n(prova a vuoto — rilancia con --scrivi)");
}
