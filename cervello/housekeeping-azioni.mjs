#!/usr/bin/env node
// 🧹 housekeeping-azioni.mjs — sposta le card ✅/❌ di AZIONI-IN-ATTESA.md in archivio
//
// Uso:
//   node cervello/housekeeping-azioni.mjs            → esegue la pulizia
//   node cervello/housekeeping-azioni.mjs --dry-run  → mostra cosa farebbe, non tocca niente
//
// Quando gira: chiamato da giro.sh ogni SOGLIA_CARD_CHIUSE card accumulate.
// Non produce errori: se il file non esiste o è già pulito, esce in silenzio.

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../MyCity-Vault/90-Memoria-AI');
const FILE = path.join(VAULT, 'AZIONI-IN-ATTESA.md');
const DRY_RUN = process.argv.includes('--dry-run');
const SOGLIA_CARD_CHIUSE = 20; // sopra questa soglia il giro fa housekeeping in automatico

// Riconosce l'inizio di una card (emoji di stato)
const CARD_START = /^(### )?(🔴|🟡|🟢|🩻|✅|❌)/;
const CARD_CHIUSA = /^### (✅|❌)/;
// Card aperte senza ### (es. "🩻 R4", "🟡 Metti «nuovo»...")
const CARD_APERTA_BARE = /^(🔴|🟡|🟢|🩻)/;

let content;
try {
  content = readFileSync(FILE, 'utf8');
} catch {
  console.error('housekeeping-azioni: file non trovato, skip.');
  process.exit(0);
}

const lines = content.split('\n');

// --- Separa header dal body ---
let headerEnd = 0;
for (let i = 0; i < lines.length; i++) {
  if (CARD_START.test(lines[i])) {
    headerEnd = i;
    break;
  }
}
if (headerEnd === 0) {
  console.log('housekeeping-azioni: nessuna card trovata, skip.');
  process.exit(0);
}

const headerLines = lines.slice(0, headerEnd);
const bodyLines = lines.slice(headerEnd);

// --- Splitta in blocchi (ogni blocco = una card + il suo separatore ---) ---
// Confini: una card (### emoji) O una sezione (## …). Senza il confine `## `, l'intestazione
// dell'archivio veniva assorbita nella coda della card precedente e a ogni giro ne rinasceva
// una copia: contate il 13/8, erano 101 identiche. L'ancora `<!-- slug -->` che precede una
// card viaggia CON la card (tenuta in un buffer), non con la coda del blocco prima.
const rawBlocks = [];
let cur = [];
let ancora = []; // righe `<!-- … -->` (e vuote) in attesa della card a cui appartengono
for (const line of bodyLines) {
  if (/^<!--.*-->\s*$/.test(line)) {
    ancora.push(line);
    continue;
  }
  if (!line.trim() && ancora.length > 0) {
    ancora.push(line);
    continue;
  }
  if ((CARD_START.test(line) || /^## /.test(line)) && cur.length > 0) {
    rawBlocks.push(cur.join('\n'));
    cur = [];
  }
  if (ancora.length > 0) {
    cur.push(...ancora);
    ancora = [];
  }
  cur.push(line);
}
if (ancora.length > 0) cur.push(...ancora);
if (cur.length > 0) rawBlocks.push(cur.join('\n'));

// --- Classifica ---
const openBlocks = [];
const closedBlocks = [];

for (const raw of rawBlocks) {
  const trimmed = raw.trim();
  if (!trimmed) continue;
  // La prima riga UTILE: un blocco può aprirsi con la sua ancora `<!-- slug -->`,
  // che è un'etichetta, non il titolo.
  const firstLine = trimmed.split('\n').find((l) => l.trim() && !/^<!--.*-->\s*$/.test(l.trim())) || '';

  // L'intestazione dell'archivio non si conserva: si rigenera sotto, UNA sola.
  // (Tenere la vecchia era il meccanismo con cui le copie si accumulavano.)
  if (firstLine.startsWith('## 🗄️ Archivio')) continue;

  // Rimuovi il separatore --- finale dal testo del blocco (lo riaggiungiamo noi)
  const blockClean = trimmed.endsWith('\n---')
    ? trimmed.slice(0, -4).trimEnd()
    : trimmed.replace(/\n---$/, '').trimEnd();

  if (CARD_CHIUSA.test(firstLine)) {
    closedBlocks.push(blockClean);
  } else if (firstLine.startsWith('## ')) {
    // Le altre sezioni `##` (es. Supervisione negozi) restano al loro posto tra le aperte.
    openBlocks.push(blockClean);
  } else if (CARD_START.test(firstLine) || CARD_APERTA_BARE.test(firstLine)) {
    openBlocks.push(blockClean);
  }
}

// Con le intestazioni-archivio scartate, le card già archiviate arrivano come blocchi chiusi
// normali: il conteggio è unico, niente doppia contabilità.
const archivedAlready = 0;

// Dry-run: stampa solo il sommario
if (DRY_RUN) {
  const totalClosed = closedBlocks.length + archivedAlready;
  console.log(`DRY-RUN housekeeping-azioni:`);
  console.log(`  Card aperte:  ${openBlocks.length}`);
  console.log(`  Card chiuse (da spostare): ${closedBlocks.length}`);
  console.log(`  Già in archivio: ${archivedAlready}`);
  console.log(`  Totale archivio dopo: ${totalClosed}`);
  process.exit(0);
}

// Niente da fare?
if (closedBlocks.length === 0) {
  console.log(`housekeeping-azioni: nessuna card chiusa fuori archivio, skip (${archivedAlready} già archiviate).`);
  process.exit(0);
}

// --- Aggiorna il banner nell'header ---
const now = new Date();
const dateStr = now.toLocaleDateString('it-IT', { timeZone: 'Europe/Rome', day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').reverse().join('-');
const timeStr = now.toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' });
const newBanner = `> 🧹 **Housekeeping ${dateStr} ${timeStr}** — Automatico: **${openBlocks.length} aperte · ${closedBlocks.length + archivedAlready} chiuse in archivio**.`;

const newHeaderLines = headerLines.map(l =>
  l.startsWith('> 🧹 **Housekeeping') ? newBanner : l
);

// --- Ricostruisci la sezione archivio (tutte le card chiuse, sotto UNA intestazione) ---
const allClosedBlocks = [...closedBlocks];
const archivedSection = [
  '## 🗄️ Archivio — card chiuse',
  '',
  `> Ultima pulizia: ${dateStr} ${timeStr} · ${allClosedBlocks.length} card totali`,
  '',
  allClosedBlocks.join('\n\n---\n\n'),
].join('\n');

// --- Scrivi il file ---
const newContent = [
  newHeaderLines.join('\n').trimEnd(),
  '',
  openBlocks.join('\n\n---\n\n'),
  '',
  '---',
  '',
  archivedSection,
  '',
].join('\n');

writeFileSync(FILE, newContent, 'utf8');
console.log(`✅ housekeeping-azioni: ${openBlocks.length} aperte · ${allClosedBlocks.length} archiviate (erano ${archivedAlready} + ${closedBlocks.length} nuove).`);
