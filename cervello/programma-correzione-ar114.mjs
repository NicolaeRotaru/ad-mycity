#!/usr/bin/env node
// 🔧 CORREGGE IL PROGRAMMA dopo la chiusura di AR-114 (freni 4 → 3). Idempotente e auto-verificante.
//
// Perché esiste. PROGRAMMA-INTELLIGENZA.md è nato alle 03:31 del 25/7 con «4 bloccanti aperti».
// Alle 03:52 una sessione parallela ha chiuso AR-114 con una prova che fa centro DAVVERO
// (allocazione-check.mjs adesso classifica ogni file in {business, macchina}: 349 macchina · 113
// business · 41 non classificati → quota macchina 76%). Il programma è nato vecchio di 21 minuti.
// Un numero superato dentro un file VIVO è esattamente ciò che il programma stesso condanna
// (AR-102): il Pannello lo mostrerebbe a Nicola come se fosse vero.
//
// Perché uno script e non un diff: la sessione cloud non ha il permesso di `git push` (AR-142) e
// rimandare 48KB attraverso l'API GitHub significa riscrivere a mano un file che esiste già —
// una trascrizione in più, un rischio di corruzione in più. Stesso schema di round2-applica.mjs.
//
// ⚠️ Non è un cerca-e-sostituisci cieco: prima di toccare il file RIMISURA il cantiere. Se i numeri
// non sono più quelli (la realtà si muove in fretta qui), si ferma e dice di rimisurare invece di
// scrivere una seconda bugia sopra la prima.
//
// Uso (sul VPS, in /opt/mycity/ad-mycity):
//   node cervello/programma-correzione-ar114.mjs --dry   -> dice cosa farebbe, non scrive
//   node cervello/programma-correzione-ar114.mjs         -> scrive

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";

const DRY = process.argv.includes("--dry");
const V = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI");
const DOC = join(V, "PROGRAMMA-INTELLIGENZA.md");
const CANTIERE = join(V, "auto-coscienza/cantiere-difetti.json");

if (!existsSync(DOC)) {
  console.error("❌ PROGRAMMA-INTELLIGENZA.md non trovato: sei nella cartella giusta?");
  process.exit(2);
}

// ── ① rimisura: i numeri che sto per scrivere sono ancora veri? ─────────────
const cant = JSON.parse(readFileSync(CANTIERE, "utf8"));
const aperti = cant.difetti.filter((d) => d.stato !== "chiuso");
const bloccanti = aperti.filter((d) => d.gravita === "bloccante");
const gravi = aperti.filter((d) => d.gravita === "grave");
const chiusi = cant.difetti.length - aperti.length;
const ar114 = cant.difetti.find((d) => d.id === "AR-114");

const ATTESO = { bloccanti: 3, aperti: 26, gravi: 23, chiusi: 68, ids: "AR-123, AR-142, AR-151" };
const idsOra = bloccanti.map((d) => d.id).join(", ");
const combacia =
  bloccanti.length === ATTESO.bloccanti &&
  aperti.length === ATTESO.aperti &&
  gravi.length === ATTESO.gravi &&
  chiusi === ATTESO.chiusi &&
  idsOra === ATTESO.ids &&
  ar114?.stato === "chiuso";

console.log(`\n🔧 CORREZIONE PROGRAMMA — ${DRY ? "PROVA A SECCO" : "scrittura"}\n`);
console.log(`   misura ora: ${bloccanti.length} bloccanti (${idsOra || "nessuno"}) · ${aperti.length} aperti · ${chiusi} chiusi · AR-114 ${ar114?.stato}`);

if (!combacia) {
  console.log(`   atteso:     ${ATTESO.bloccanti} bloccanti (${ATTESO.ids}) · ${ATTESO.aperti} aperti · ${ATTESO.chiusi} chiusi · AR-114 chiuso`);
  console.log(`\n   ⛔ La realtà si è mossa ancora: NON tocco il documento.`);
  console.log(`      Rimisura e riscrivi i numeri a mano, oppure aggiorna ATTESO in questo script.`);
  console.log(`      node cervello/pagella-intelligenza.mjs --gate\n`);
  process.exit(1);
}
console.log(`   ✅ i numeri combaciano: procedo\n`);

// ── ② le correzioni, una per una (idempotenti: se il nuovo testo c'è già, salta) ──
const NOTA_AR114 = `> **AR-114 è stato chiuso alle 03:52 del 25/7, mentre questo programma veniva scritto** — da una
> sessione parallela, con una prova che fa centro **davvero** (non un falso positivo come AR-155:
> \`allocazione-check.mjs\` adesso classifica ogni file toccato in {business, macchina} e produce
> numeri veri). Prima misura, ultimi 7 giorni: **349 file macchina · 113 business · 41 non
> classificati → quota macchina 76%**, sopra la soglia del 70%. Il cancello che fallirebbe il giro
> è **spento per decisione tua** (fase tecnica fino al 24/8-1/9, letta dal registro dei fatti); si
> riaccende con \`ALLOCAZIONE_GATE_MACCHINA=1\` quando la fase finisce. Il sensore che mancava adesso
> c'è, e dice 76%: **il numero che dà ragione a C10 e C11**.`;

const SOSTITUZIONI = [
  [
    "frontmatter: timbro di aggiornamento",
    "data: 2026-07-25 03:31\nprogramma:",
    "data: 2026-07-25 03:31\naggiornato: 2026-07-25 04:10 (AR-114 chiuso alle 03:52: freni 4 → 3, numeri del cantiere rimisurati)\nprogramma:",
  ],
  [
    "frontmatter: data della misura",
    "misura: cervello/pagella-intelligenza.mjs (0 voci su 5 il 2026-07-25 03:02)",
    "misura: cervello/pagella-intelligenza.mjs (0 voci su 5 il 2026-07-25 04:10)",
  ],
  [
    "tabella d'apertura: freni 4 → 3",
    "| freni di sicurezza rotti | **4** (AR-114, AR-123, AR-142, AR-151) | 0 | 8 → 6 → 4 ✅ |",
    "| freni di sicurezza rotti | **3** (AR-123, AR-142, AR-151) | 0 | 8 → 6 → 4 → 3 ✅ |",
  ],
  [
    "numeri del cantiere e delle prove",
    "- **cantiere:** 27 difetti aperti (4 bloccanti · 23 gravi), 67 chiusi.\n- **prove:** **25 dei 27 aperti non sono chiudibili da nessun guardiano** (14 senza prova\n  automatica, 11 con prova che non fa centro da 9 giorni).",
    "- **cantiere:** 26 difetti aperti (3 bloccanti · 23 gravi), 68 chiusi.\n- **prove:** **24 dei 26 aperti non sono chiudibili da nessun guardiano** (14 senza prova\n  automatica, 10 con prova che non fa centro da 9 giorni).",
  ],
  [
    "C1: il titolo non dice più «quattro»",
    "## C1 · I quattro freni rotti",
    "## C1 · I freni rotti",
  ],
  [
    "C1: 4 → 3 bloccanti",
    "**Il problema.** Restano **4 difetti bloccanti aperti**: AR-114, AR-123, AR-142, AR-151.",
    "**Il problema.** Restano **3 difetti bloccanti aperti**: AR-123, AR-142, AR-151.",
  ],
  [
    "C1: AR-114 esce dalla tabella, entra la nota con il 76%",
    "| **AR-114** — nessun sensore misura quanto sforzo va sulla macchina e quanto sul business | l'allocazione del tempo | la macchina può passare **un mese intero su sé stessa** mentre tutti i guardiani dichiarano «allocazione sana» — è successo: 107 merge sul Pannello in 7 giorni, 0 ordini |\n| **AR-151** — chiusure vecchie verificate contro il file sbagliato | l'attendibilità dei «67 difetti chiusi» |",
    "| **AR-151** — chiusure vecchie verificate contro il file sbagliato | l'attendibilità dei «68 difetti chiusi» |",
  ],
  [
    "C1: la nota su AR-114 dopo la tabella",
    "\n\n**Nota onesta sul conteggio:**",
    `\n\n${NOTA_AR114}\n\n**Nota onesta sul conteggio:**`,
  ],
  [
    "C1: output del comando",
    "Oggi stampa `4 bloccanti aperti: AR-114, AR-123, AR-142, AR-151`.",
    "Oggi stampa `3 bloccanti aperti: AR-123, AR-142, AR-151`.",
  ],
  [
    "C1: dipendenze",
    "**Dipende da.** AR-114 e AR-151 dipendono da **C2** (senza una prova valida non si chiudono, si\ndichiarano).",
    "**Dipende da.** AR-151 dipende da **C2** (senza una prova valida non si chiude, si\ndichiara).",
  ],
  [
    "C1: peso",
    "verifica conferma che è già risolto, medio se no. AR-114 medio (sensore nuovo). AR-151 medio",
    "verifica conferma che è già risolto, medio se no. AR-151 medio",
  ],
  [
    "C2: output del comando",
    'Oggi stampa `non chiudibili: 25 su 27 — {"umana":14,"auto-sospetta":11,"auto-attesa":2}`.',
    'Oggi stampa `non chiudibili: 24 su 26 — {"umana":14,"auto-sospetta":10,"auto-attesa":2}`.',
  ],
  [
    "C10: AR-114 ora chiuso, col numero",
    "Ed è parente stretto di AR-114 (C1), che dice la stessa\ncosa dall'altro lato.",
    "Ed è parente stretto di AR-114 (C1), chiuso il 25/7\nalle 03:52, che dice la stessa cosa dall'altro lato con un numero: **76% dello sforzo sulla\nmacchina** negli ultimi 7 giorni.",
  ],
  [
    "tabella dei round: R5 senza AR-114",
    "| **R5 — «i freni»** | **C1** (AR-142 e AR-123 subito; AR-114 e AR-151 dopo R4) |",
    "| **R5 — «i freni»** | **C1** (AR-142 e AR-123 subito; AR-151 dopo R4) |",
  ],
];

let testo = readFileSync(DOC, "utf8");
const fatto = [];
const saltato = [];
const mancanti = [];

for (const [nome, vecchio, nuovo] of SOSTITUZIONI) {
  if (testo.includes(nuovo)) {
    saltato.push(nome);
  } else if (testo.includes(vecchio)) {
    testo = testo.replace(vecchio, nuovo);
    fatto.push(nome);
  } else {
    mancanti.push(nome);
  }
}

for (const x of fatto) console.log(`   ✅ ${x}`);
for (const x of saltato) console.log(`   ⏭️  ${x} (già corretto)`);
for (const x of mancanti) console.log(`   ⚠️  ${x}: testo di partenza non trovato — controlla a mano`);

if (mancanti.length) {
  console.log(`\n   ⛔ ${mancanti.length} correzioni non applicabili: il documento non è quello che mi aspettavo.`);
  console.log(`      Non scrivo niente: meglio un file vecchio che un file mezzo corretto.\n`);
  process.exit(1);
}

if (!fatto.length) {
  console.log("\n   Nulla da fare: il documento è già aggiornato.\n");
  process.exit(0);
}

if (!DRY) writeFileSync(DOC, testo, "utf8");
console.log(
  `\n   ${DRY ? "(prova a secco: non ho scritto)" : "Documento aggiornato."}\n` +
    `   Riverifica:  node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync('MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json','utf8'));const b=d.difetti.filter(x=>x.gravita==='bloccante'&&x.stato!=='chiuso');console.log(b.length+' bloccanti aperti: '+b.map(x=>x.id).join(', '))"\n`
);
process.exit(0);
