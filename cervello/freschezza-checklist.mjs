#!/usr/bin/env node
// freschezza-checklist.mjs — guardiano di freschezza CHECKLIST-NICOLA.md (AR-030).
// Se la checklist ha più di MAX_GIORNI di anzianità, emette un VINCOLO hard per il motore:
// il giro non deve chiudersi senza rigenerarla dalle voci ⏳ di AZIONI-IN-ATTESA.
//
// Uso: node cervello/freschezza-checklist.mjs
// Exit: 0 = checklist fresca · 1 = stantia → vincolo passato come stringa su stdout

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const CHECKLIST = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/CHECKLIST-NICOLA.md");
const MAX_GIORNI = Number(process.env.CHECKLIST_MAX_GIORNI || 2);

function leggiAggiornato(contenuto) {
  const m = contenuto.match(/^aggiornato:\s*(.+)$/m);
  return m ? m[1].trim() : null;
}

function giorniDa(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return Infinity;
  return (Date.now() - d.getTime()) / 86400000;
}

const ora = nowPiacenza();

if (!existsSync(CHECKLIST)) {
  console.log("⛔ AR-030: CHECKLIST-NICOLA.md non esiste — creala in questo giro dalle voci ⏳ di AZIONI-IN-ATTESA.md.");
  process.exit(1);
}

const contenuto = readFileSync(CHECKLIST, "utf8");
const aggiornato = leggiAggiornato(contenuto);
const giorni = aggiornato ? giorniDa(aggiornato) : Infinity;

if (giorni > MAX_GIORNI) {
  const eta = isFinite(giorni) ? `${Math.floor(giorni)}g` : "data sconosciuta";
  console.log(
    `⛔ AR-030: CHECKLIST-NICOLA.md STANTIA (${eta} fa, max ${MAX_GIORNI}g). ` +
    `VINCOLO: in questo giro rigenera CHECKLIST-NICOLA.md dalle voci ⏳ di AZIONI-IN-ATTESA.md ` +
    `(lista vuote/firme/materiali che servono a Nicola). Aggiorna il campo 'aggiornato:' nel frontmatter.`
  );
  process.exit(1);
}

console.log(`✅ CHECKLIST-NICOLA.md fresca (aggiornata: ${aggiornato ?? "n/d"}, ${Math.round(giorni * 10) / 10}g fa).`);
process.exit(0);
