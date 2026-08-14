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

// Marcatori di fonte strutturati (no parole generiche da sole — AR-075 guardrail).
const RE_FONTE = /(fonte\s*:|\(fonte|\[dati\]|\[fonte|supabase|stripe|posthog|registro-fatti|registro-realt|\{fonte:)/i;

// ─────────────────────────────────────────────────────────────────────────────
// AR-433 — UN CANCELLO CHE SUONA SU TUTTO È UN CANCELLO SPENTO
// ─────────────────────────────────────────────────────────────────────────────
// La regola «ogni numero deve avere una fonte» cerca un marcatore di fonte entro 60 caratteri da
// OGNI numero. In un report tecnico i numeri sono quasi tutti RIFERIMENTI: `giro.sh:664` è un
// indirizzo, `AR-365` è una sigla, e nessuno dei due è un numero di business orfano — SONO la
// fonte. Risultato: la radiografia usciva rossa sempre, veniva pubblicata lo stesso, e chi scrive
// ha imparato a scavalcare il cancello. Una volta imparato, lo scavalca anche quando ha ragione.
//
// Due mosse, come da scheda: ① i pattern che SONO una fonte escono dal conto dei numeri;
// ② il verdetto cambia per TIPO di documento — un audit non è un contenuto che esce verso i
// clienti, e va misurato con le regole dei claim, non con quella dei numeri di business.
export const RE_RIFERIMENTO_CODICE = /[\w./-]+\.(?:mjs|sh|ts|tsx|js|jsx|json|md|ps1|bats|py):\d+(?:-\d+)?/g;
export const RE_SIGLA_DIFETTO = /\bAR-\d+\b/g;
export const RE_SIGLA_LEZIONE = /\bL-\d{4}-\d+(?:-\d+)?\b/g;
export const RE_CODICE_INLINE = /`[^`\n]*`/g;
export const RE_BLOCCO_CODICE = /```[\s\S]*?```/g;

/**
 * Toglie dal testo i pezzi che SONO una fonte, sostituendoli con spazi della stessa lunghezza:
 * così gli indici restano quelli del testo originale e il contesto dei numeri veri non si sposta.
 * (Cancellarli e basta incollerebbe due frasi lontane, creando falsi «numero senza fonte».)
 */
export function mascheraRiferimenti(testo) {
  let t = String(testo ?? "");
  for (const re of [RE_BLOCCO_CODICE, RE_CODICE_INLINE, RE_RIFERIMENTO_CODICE, RE_SIGLA_DIFETTO, RE_SIGLA_LEZIONE]) {
    t = t.replace(re, (m) => " ".repeat(m.length));
  }
  return t;
}

/**
 * Che documento è. Un audit/radiografia è lavoro interno di diagnosi: si misura sull'onestà dei
 * claim (segnaposto, affermazioni gonfiate), non sulla regola dei numeri di business — che è nata
 * per i testi che escono verso i clienti.
 */
export function tipoDocumento(nome) {
  const n = String(nome ?? "").replace(/\\/g, "/");
  if (/consegne\/audit\//i.test(n)) return "audit";
  if (/90-Memoria-AI\/RADIOGRAFIA[^/]*\.md$/i.test(n)) return "audit";
  if (/radiografia[^/]*\.md$/i.test(n)) return "audit";
  return "contenuto";
}

/** Quali regole valgono per quel tipo. Una sola casa, così il verdetto non si sdoppia. */
export function regolePer(tipo) {
  return {
    segnaposto: true,
    claim: true,
    numeri: tipo !== "audit",
    perche_numeri:
      tipo === "audit"
        ? "documento di diagnosi interna: i numeri sono riferimenti a codice e sigle di difetto, non claim di business"
        : "testo che può uscire verso l'esterno: ogni numero deve portare la sua fonte",
  };
}

function esamina(nome, testo, tipoForzato = null) {
  const violazioni = [];
  const tipo = tipoForzato || tipoDocumento(nome);
  const regole = regolePer(tipo);

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
  // AR-433: si guarda il testo MASCHERATO — i riferimenti a codice, le sigle e il codice fra apici
  // non sono numeri orfani, sono la fonte. E su un documento di audit la regola non si applica.
  const testoNumeri = regole.numeri ? mascheraRiferimenti(testo) : "";
  RE_NUMERO.lastIndex = 0;
  let mm;
  const orfani = new Set();
  while (regole.numeri && (mm = RE_NUMERO.exec(testoNumeri)) !== null) {
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

  return { file: nome, tipo, regole_applicate: regole, violazioni };
}

async function leggiStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  const risultati = [];

  // AR-433: da stdin il nome non c'è, quindi il tipo lo si dichiara con --audit (o --contenuto).
  const tipoForzato = args.includes("--audit") ? "audit" : args.includes("--contenuto") ? "contenuto" : null;
  if (testoFlag != null) risultati.push(esamina("(--testo)", testoFlag, tipoForzato));
  if (STDIN) risultati.push(esamina("(stdin)", await leggiStdin(), tipoForzato));
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
      const comeMisurato = r.tipo === "audit" ? " [audit: regole dei claim, non quella dei numeri di business]" : "";
      if (!r.violazioni.length) {
        console.log(`✅ ${r.file}: onesto (nessun segnaposto, nessun numero senza fonte)${comeMisurato}`);
        continue;
      }
      console.log(`❌ ${r.file}: ${r.violazioni.length} violazione/i${comeMisurato}`);
      for (const v of r.violazioni) {
        console.log(`   [${v.tipo}] ${v.regola}${v.esempi.length ? " → " + v.esempi.join(" · ") : ""}`);
      }
    }
    console.log(ok ? "\n🟢 Testo pubblicabile." : `\n🔴 ${totali} problema/i: NON pubblicare finché non risolvi (segnaposto/[ESEMPIO]/numeri senza fonte).`);
  }

  process.exit(ok ? 0 : 1);
}

// Main-guard: eseguito come comando parte; IMPORTATO da un test no. Senza questa riga il solo
// `import` di questo file faceva partire il programma e usciva con 2 («nessun input»), quindi le
// funzioni pure qui dentro non erano provabili — ed è una delle ragioni per cui AR-433 è vissuto
// tanto a lungo: la regola sbagliata non aveva un test che potesse contraddirla.
if (process.argv[1] && process.argv[1].endsWith("onesta-check.mjs")) main();
