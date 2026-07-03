#!/usr/bin/env node
// AR-075 — GUARDIANO MACHINE-CHECKABLE DELL'ONESTÀ nel percorso di pubblicazione (ONESTA-RULES strumentato).
// 🟡 Sola lettura sui file/testo che gli passi. Esce ≠0 se trova violazioni → blocca accodamento/pubblicazione.
//
// Problema (AR-075): il valore fondante del brand (la VERITÀ) era affidato a una checklist umana
// (ONESTA-RULES.md), non a una forcing-function deterministica agganciata al percorso di pubblicazione.
// Il cancello di serietà 🔬 era descritto ma non strumentato per l'onestà: un testo con segnaposto non
// risolti o un numero senza fonte poteva finire in AZIONI-IN-ATTESA / consegne/content e uscire.
//
// Fix: questo pezzo scansiona il testo IN USCITA e blocca (exit≠0) se trova:
//   - segnaposto non risolti: [ ... ], [ESEMPIO], [NOME], {{...}}, XXX, TODO, «…»
//   - numeri "spia" senza tag-fonte vicino: "già 500 famiglie", "3.000 clienti", "N negozi"
//     → un numero è OK solo se ha una fonte esplicita accanto (es. "fonte: Supabase", "(fonte …)", "[dati]")
//   - parole-spia di claim gonfiati non verificati: "già N", "centinaia di", "migliaia di"
//
// Uso:
//   node cervello/onesta-check.mjs <file1> [file2 …]     -> scansiona i file
//   echo "testo…" | node cervello/onesta-check.mjs --stdin
//   node cervello/onesta-check.mjs --testo "già 500 famiglie su MyCity"
//   ... aggiungi --json per output machine-readable
//
// Exit: 0 = testo onesto/pubblicabile · 1 = violazioni (blocca) · 2 = errore d'uso.

import { existsSync, readFileSync } from "node:fs";
import process from "node:process";

const args = process.argv.slice(2);
const JSON_MODE = args.includes("--json");
const STDIN = args.includes("--stdin");
const testoFlag = args.includes("--testo") ? args[args.indexOf("--testo") + 1] : null;
const files = args.filter((a) => !a.startsWith("--") && a !== testoFlag);

// --- Regole (ogni regola: nome, regex, come spiegarla) ---
// Segnaposto non risolti.
const RE_SEGNAPOSTO = [
  { nome: "segnaposto [ESEMPIO]", re: /\[ESEMPIO\]/gi },
  { nome: "segnaposto [ ... ]", re: /\[[^\]\n]{2,40}\]/g }, // [NOME], [DATA], [X]… (esclude riferimenti tipo [[wikilink]] gestiti sotto)
  { nome: "segnaposto {{ ... }}", re: /\{\{[^}\n]+\}\}/g },
  { nome: "segnaposto XXX/TODO/TBD", re: /\b(XXX|TODO|TBD|PLACEHOLDER|LOREM)\b/gi },
  { nome: "segnaposto «…»", re: /«\s*…\s*»|<\s*inserire[^>]*>/gi },
];

// Parole-spia di claim gonfiati.
const RE_SPIA = [
  { nome: "claim 'già N'", re: /\bgià\s+\d[\d.\s]*/gi },
  { nome: "claim vago 'centinaia/migliaia di'", re: /\b(centinaia|migliaia|decine)\s+di\b/gi },
];

// Un numero significativo (≥2 cifre, o cifra + unità/soggetto). Consideriamo "numero da fondare"
// una cifra ≥ 2 come "500", "3.000", "12 negozi", percentuali, euro.
const RE_NUMERO = /\b\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?\s?(?:€|euro|%|negozi|famiglie|clienti|ordini|utenti|iscritti|follower)?\b/gi;

// Marcatori di fonte accettati (se un numero ne ha uno entro ~60 caratteri → è fondato).
const RE_FONTE = /(fonte\s*:|\(fonte|\[dati\]|\[fonte|supabase|stripe|posthog|baseline|dati reali|da OKR|registro-realt)/i;

function esamina(nome, testo) {
  const violazioni = [];

  // Rimuovi i wikilink [[...]] dal controllo segnaposto (sono link interni legittimi, non placeholder).
  const senzaWikilink = testo.replace(/\[\[[^\]]+\]\]/g, "");

  for (const { nome: rn, re } of RE_SEGNAPOSTO) {
    re.lastIndex = 0;
    const m = senzaWikilink.match(re);
    if (m) violazioni.push({ tipo: "segnaposto", regola: rn, esempi: [...new Set(m)].slice(0, 3) });
  }
  for (const { nome: rn, re } of RE_SPIA) {
    re.lastIndex = 0;
    const m = testo.match(re);
    if (m) violazioni.push({ tipo: "claim-non-verificato", regola: rn, esempi: [...new Set(m)].slice(0, 3) });
  }

  // Numeri senza fonte: per ogni numero significativo, controlla se c'è un marcatore di fonte vicino.
  RE_NUMERO.lastIndex = 0;
  let mm;
  const orfani = new Set();
  while ((mm = RE_NUMERO.exec(testo)) !== null) {
    const raw = mm[0].trim();
    // ignora numeri "innocui": anni (1900-2099), numeri singola cifra senza unità, orari
    const soloNum = raw.replace(/[^\d]/g, "");
    if (!soloNum) continue;
    if (/^(19|20)\d{2}$/.test(soloNum) && !/[€%]|euro|negozi|famiglie|clienti|ordini/i.test(raw)) continue;
    if (soloNum.length < 2 && !/[€%]/.test(raw)) continue;
    const ctx = testo.slice(Math.max(0, mm.index - 60), mm.index + raw.length + 60);
    if (!RE_FONTE.test(ctx)) orfani.add(raw);
  }
  if (orfani.size) {
    violazioni.push({ tipo: "numero-senza-fonte", regola: "ogni numero deve avere una fonte", esempi: [...orfani].slice(0, 5) });
  }

  return { file: nome, violazioni };
}

async function leggiStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  const risultati = [];

  if (testoFlag != null) risultati.push(esamina("(--testo)", testoFlag));
  if (STDIN) risultati.push(esamina("(stdin)", await leggiStdin()));
  for (const f of files) {
    if (!existsSync(f)) {
      risultati.push({ file: f, violazioni: [{ tipo: "errore", regola: "file inesistente", esempi: [] }] });
      continue;
    }
    risultati.push(esamina(f, readFileSync(f, "utf8")));
  }

  if (!risultati.length) {
    if (JSON_MODE) console.log(JSON.stringify({ ok: false, errore: "nessun input: passa file, --stdin o --testo" }));
    else console.error("Uso: node cervello/onesta-check.mjs <file…> | --stdin | --testo \"…\"");
    process.exit(2);
  }

  const totali = risultati.reduce((n, r) => n + r.violazioni.length, 0);
  const ok = totali === 0;

  if (JSON_MODE) {
    console.log(JSON.stringify({ ok, violazioni_totali: totali, risultati }, null, 2));
  } else {
    for (const r of risultati) {
      if (!r.violazioni.length) {
        console.log(`✅ ${r.file}: onesto (nessun segnaposto, nessun numero senza fonte)`);
        continue;
      }
      console.log(`❌ ${r.file}: ${r.violazioni.length} violazione/i`);
      for (const v of r.violazioni) {
        console.log(`   [${v.tipo}] ${v.regola}${v.esempi.length ? " → " + v.esempi.join(" · ") : ""}`);
      }
    }
    console.log(ok ? "\n🟢 Testo pubblicabile." : `\n🔴 ${totali} problema/i: NON pubblicare finché non risolvi (segnaposto/[ESEMPIO]/numeri senza fonte).`);
  }

  process.exit(ok ? 0 : 1);
}

main();
