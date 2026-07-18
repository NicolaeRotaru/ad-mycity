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
const rawBlocks = [];
let cur = [];
for (const line of bodyLines) {
  if (CARD_START.test(line) && cur.length > 0) {
    rawBlocks.push(cur.join('\n'));
    cur = [];
  }
  cur.push(line);
}
if (cur.length > 0) rawBlocks.push(cur.join('\n'));

// --- Classifica ---
const openBlocks = [];
const closedBlocks = [];
// Sezione archivio già presente (non va rielaborata)
let archivoSection = null;

for (const raw of rawBlocks) {
  const trimmed = raw.trim();
  if (!trimmed) continue;
  const firstLine = trimmed.split('\n')[0];

  // Se è l'intestazione dell'archivio esistente, conservala separatamente
  if (firstLine.startsWith('## 🗄️ Archivio')) {
    archivoSection = trimmed;
    continue;
  }

  // Rimuovi il separatore --- finale dal testo del blocco (lo riaggiungiamo noi)
  const blockClean = trimmed.endsWith('\n---')
    ? trimmed.slice(0, -4).trimEnd()
    : trimmed.replace(/\n---$/, '').trimEnd();

  if (CARD_CHIUSA.test(firstLine)) {
    closedBlocks.push(blockClean);
  } else if (CARD_START.test(firstLine) || CARD_APERTA_BARE.test(firstLine)) {
    openBlocks.push(blockClean);
  }
}

// Conta quante card chiuse erano già in archivio (se esiste)
const archivedAlready = archivoSection
  ? (archivoSection.match(/^### (✅|❌)/gm) || []).length
  : 0;

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

// --- Ricostruisci le sezioni archivio (vecchie + nuove card chiuse) ---
const archivedCards = archivoSection
  ? archivoSection
      .split(/\n(?=### (✅|❌))/)
      .map(b => b.trim())
      .filter(b => b.match(/^### (✅|❌)/))
  : [];

const allClosedBlocks = [...closedBlocks, ...archivedCards];
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
