#!/usr/bin/env node
// QUANTI DIFETTI SI RICHIUDEREBBERO DA SOLI? — da lanciare DOPO la ricucitura e PRIMA del merge.
//
// PERCHE ESISTE. Dopo il merge gira `auto-fix.mjs verifica --applica`, che guarda la prova scritta
// sulla scheda e NON la volonta di chi ha lavorato il difetto. Un difetto che abbiamo dichiarato
// APERTO, se sulla scheda gli e rimasta una vecchia prova a pattern, puo trovarla soddisfatta (il
// codice ORA contiene quella stringa) e richiudersi da solo — smentendo cio su cui Nicola ha messo
// la firma. Il 29/7 il conteggio disse «✅ Chiusi 20» ed era verde: uno dei venti non doveva esserci.
//
// Quindi la domanda si MISURA invece di temerla, e si rimisura dopo ogni ricucitura, perche e
// proprio la ricucitura a cambiare le prove.
//
// Uscite:  0 = nessuno si richiude da solo · 1 = almeno uno si richiuderebbe · 2 = non ho potuto
//          guardare (e un cieco, non un verde).

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const CANTIERE = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");

if (!existsSync(CANTIERE)) {
  console.log("⚪ CIECO — il cantiere non e leggibile da qui: non posso dire se qualcosa si richiude da solo.");
  process.exit(2);
}

const { difetti } = JSON.parse(readFileSync(CANTIERE, "utf8"));
const aperti = difetti.filter((d) => d.stato === "aperto");

const soddisfatte = [];
let insoddisfatte = 0;
const cieche = [];

for (const d of aperti) {
  const v = d.verifica || {};
  if (!v.file || !v.pattern) continue; // le prove a comando e umane non corrono questo rischio

  let src;
  try { src = readFileSync(join(REPO, v.file), "utf8"); }
  catch { cieche.push(`${d.id}: non riesco a leggere ${v.file}`); continue; }

  let re;
  try { re = new RegExp(v.pattern); }
  catch { cieche.push(`${d.id}: il pattern non compila (${String(v.pattern).slice(0, 40)})`); continue; }

  // `presente: false` inverte l'attesa: la prova e soddisfatta quando il pattern NON c'e.
  const trovato = re.test(src);
  const soddisfatta = v.presente === false ? !trovato : trovato;

  if (soddisfatta) soddisfatte.push(`${d.id} [${d.gravita || "?"}] ${String(d.titolo || "").slice(0, 62)}`);
  else insoddisfatte++;
}

const conPattern = soddisfatte.length + insoddisfatte + cieche.length;
console.log(`RISCHIO DELLA FIRMA — ${aperti.length} difetti aperti, ${conPattern} con una prova a pattern\n`);
console.log(`  · prova GIA SODDISFATTA → si richiuderebbero da soli: ${soddisfatte.length}`);
console.log(`  · prova non soddisfatta (restano aperti):             ${insoddisfatte}`);
console.log(`  · cieche (file o pattern illeggibile):                ${cieche.length}`);

// La porzione NON letta arriva al verdetto: una cieca non si conta come «a posto».
if (cieche.length) {
  console.log(`\n⚪ ${cieche.length} che NON ho potuto valutare (il verdetto qui sotto non le copre):`);
  cieche.forEach((c) => console.log(`   · ${c}`));
}

if (soddisfatte.length) {
  console.log(`\n❌ ${soddisfatte.length} SI RICHIUDEREBBERO DA SOLI dopo il merge:`);
  soddisfatte.forEach((s) => console.log(`   · ${s}`));
  console.log("\n→ A ognuno va TOLTA la prova a pattern prima di consegnare, o si chiudera da solo");
  console.log("  smentendo cio su cui Nicola ha messo la firma. La ricucitura lo fa per i difetti");
  console.log("  che le corsie dichiarano aperti; questi sono gli ALTRI, e vanno guardati a mano.");
  process.exit(1);
}

if (cieche.length) process.exit(2);
console.log("\n✅ Nessun difetto aperto si richiude da solo: la firma di Nicola regge a quello che dice.");
