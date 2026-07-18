#!/usr/bin/env node
// 🧹 housekeeping-azioni.mjs — sposta le card ✅/❌ di AZIONI-IN-ATTESA.md in archivio
//
// Uso:
//   node cervello/housekeeping-azioni.mjs            → esegue la pulizia
//   node cervello/housekeeping-azioni.mjs --dry-run  → mostra cosa farebbe, non tocca niente
//
// Cadenza: chiamato da giro.sh ogni giro. Skip automatico se la coda è già pulita.

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../MyCity-Vault/90-Memoria-AI');
const FILE = path.join(VAULT, 'AZIONI-IN-ATTESA.md');
const DRY_RUN = process.argv.includes('--dry-run');

const CARD_START = /^(### )?(🔴|🟡|🟢|🩻|✅|❌)/;
const CARD_CHIUSA = /^### (✅|❌)/;

let content;
try {
  content = readFileSync(FILE, 'utf8');
} catch {
  process.exit(0);
}

const lines = content.split('\n');

// Trova dove finisce l'header (prima riga card)
let headerEnd = 0;
for (let i = 0; i < lines.length; i++) {
  if (CARD_START.test(lines[i])) { headerEnd = i; break; }
}
if (headerEnd === 0) process.exit(0);

const headerLines = lines.slice(0, headerEnd);
const bodyLines = lines.slice(headerEnd);

// Splitta in blocchi per card
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

// Classifica blocchi
const openBlocks = [];
const closedBlocks = [];
let existingArchive = null;

for (const raw of rawBlocks) {
  const trimmed = raw.trim();
  if (!trimmed) continue;
  const firstLine = trimmed.split('\n')[0];

  if (firstLine.startsWith('## 🗄️ Archivio')) {
    existingArchive = trimmed;
    continue;
  }

  // Rimuovi --- finale dal blocco
  const clean = trimmed.replace(/\n---\s*$/, '').trimEnd();

  if (CARD_CHIUSA.test(firstLine)) {
    closedBlocks.push(clean);
  } else if (CARD_START.test(firstLine)) {
    openBlocks.push(clean);
  }
}

if (DRY_RUN) {
  const archivedAlready = existingArchive
    ? (existingArchive.match(/^### (✅|❌)/gm) || []).length : 0;
  console.log('DRY-RUN: ' + openBlocks.length + ' aperte · ' + closedBlocks.length + ' da archiviare · ' + archivedAlready + ' gia in archivio');
  process.exit(0);
}

if (closedBlocks.length === 0) {
  console.log('housekeeping-azioni: coda gia pulita, skip.');
  process.exit(0);
}

// Data/ora
const now = new Date();
const pad = n => String(n).padStart(2, '0');
const dateStr = now.getFullYear() + '-' + pad(now.getMonth()+1) + '-' + pad(now.getDate());
const timeStr = pad(now.getHours()) + ':' + pad(now.getMinutes());

// Card gia in archivio
const archivedCards = existingArchive
  ? existingArchive
      .split(/\n(?=### (✅|❌))/)
      .map(b => b.trim())
      .filter(b => /^### (✅|❌)/.test(b))
  : [];

const allClosed = [...closedBlocks, ...archivedCards];
const total = allClosed.length;

// Aggiorna banner header
const banner = '> 🧹 **Housekeeping ' + dateStr + ' ' + timeStr + '** — Automatico: **' + openBlocks.length + ' aperte · ' + total + ' chiuse in archivio**.';
const newHeader = headerLines
  .map(l => l.startsWith('> 🧹 **Housekeeping') ? banner : l)
  .join('\n');

const archiveSection = [
  '## 🗄️ Archivio — card chiuse',
  '',
  '> Ultima pulizia: ' + dateStr + ' ' + timeStr + ' · ' + total + ' card totali',
  '',
  allClosed.join('\n\n---\n\n'),
].join('\n');

const newContent = [
  newHeader.trimEnd(),
  '',
  openBlocks.join('\n\n---\n\n'),
  '',
  '---',
  '',
  archiveSection,
  '',
].join('\n');

writeFileSync(FILE, newContent, 'utf8');
console.log('housekeeping-azioni: ' + openBlocks.length + ' aperte · ' + total + ' archiviate (' + closedBlocks.length + ' nuove).');
