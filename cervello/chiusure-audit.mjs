#!/usr/bin/env node
// 🔍 AUDIT DELLE CHIUSURE (AR-151). 🟢 Sola lettura: legge il cantiere e il codice, non scrive nulla.
//
// Il difetto: AR-008 fu chiuso il 2/7 verificandolo contro l'artefatto SBAGLIATO (CLAUDE.md, che è
// prosa descrittiva, invece del file dell'agente, che è il contratto vero). Lo stesso identico
// problema è poi riemerso come AR-130. La causa-radice dichiarata non è quel singolo errore:
// «il cantiere non ha un passo di audit delle chiusure passate quando lo standard di verifica migliora».
//
// Cioè: una chiusura, una volta fatta, non viene mai più guardata. Se la prova era debole, o se il
// codice è poi cambiato e il fix è stato rimosso, il difetto risulta chiuso per sempre — e il conteggio
// «67 chiusi» diventa un numero che si crede sulla parola.
//
// Questo è quel passo. Ri-esegue la prova di OGNI difetto chiuso e segnala tre cose diverse:
//   · REGREDITO   — la prova NON scatta più: il fix c'era e non c'è più (o non c'è mai stato).
//   · SENZA PROVA — chiuso senza `verifica` automatica: nessuno potrà mai ricontrollarlo.
//   · DEBOLE      — la prova punta a un file di PROSA (CLAUDE.md, *.md di documentazione) invece che
//                   all'artefatto che fa la cosa. È esattamente l'errore di AR-008.
//
// Uso:
//   node cervello/chiusure-audit.mjs           -> report
//   node cervello/chiusure-audit.mjs --json    -> JSON
//   node cervello/chiusure-audit.mjs --gate    -> exit 1 se esiste almeno un REGREDITO
// Exit: 0 = nessuna regressione · 1 con --gate se una chiusura è regredita

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { provaSoddisfatta } from "./prove-regole.mjs";

const JSON_MODE = process.argv.includes("--json");
const GATE = process.argv.includes("--gate");
const CANTIERE = "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json";

// File di PROSA: descrivono, non fanno. Una prova che punta qui verifica che qualcuno abbia SCRITTO
// la regola, non che la regola sia APPLICATA. È la trappola in cui è caduto AR-008.
const PROSA = [/^CLAUDE\.md$/i, /^COMANDI\.md$/i, /^README/i, /\/README/i, /MyCity-Vault\/.*\.md$/i, /^consegne\/.*\.md$/i];

/** Una prova è "debole" se punta a un file che descrive invece di un file che esegue. */
export function provaDebole(file) {
  const f = String(file || "");
  if (!f) return false;
  return PROSA.some((re) => re.test(f));
}

/** Ri-esegue la prova di un difetto. Ritorna "ok" | "regredito" | "senza-prova" | "file-assente". */
export function riverifica(dif, leggiFile) {
  const v = dif && dif.verifica;
  // Prova a COMANDO (round 4): la condizione è strutturale e la sa valutare solo un guardiano.
  // L'audit non li ri-esegue — far girare 67 guardiani a ogni controllo costerebbe minuti — ma li
  // conta a parte invece di scambiarli per "senza prova": una prova a comando È verificabile,
  // semplicemente non qui. Chi la ri-esegue è auto-fix, a ogni giro.
  if (v && v.comando) return "comando";
  if (!v || !v.file || !v.pattern) return "senza-prova";
  const txt = leggiFile(v.file);
  if (txt == null) return "file-assente";
  // Stessa regola di auto-fix.mjs: regex OPPURE testo letterale (vedi AR-037, la prova con il `$`
  // in mezzo che come regex non può mai matchare mentre il fix nel codice c'è).
  // AR-743 — IL CONFRONTO LO DECIDE LA CASA, non questo file.
  //
  // Qui c'era una copia a mano di «la prova combacia?». Erano quattro copie della stessa
  // decisione — la casa più tre — e le tre non ereditavano niente di quello che la casa aveva
  // imparato:
  //
  //   · AR-151, il testo letterale: un pattern scritto come testo, con un dollaro in mezzo,
  //     compilato come regex non può mai combaciare (quel simbolo asserisce fine-stringa) mentre
  //     il fix nel codice c'è davvero. La casa prova la regex E il letterale.
  //   · AR-355, il commento: due difetti del worker risultavano chiusi perché la prova citava una
  //     frase che nel file esisteva — dentro un commento scritto da chi aveva fatto il fix. C'era
  //     la descrizione della cura, non la cura. La casa cerca solo dove il computer esegue.
  //
  // Ogni difesa aggiunta là proteggeva la metà dei chiamanti. È la malattia censita «una parola
  // con due padroni», dentro il metro che giudica tutte le altre.
  return provaSoddisfatta(v, txt) ? "ok" : "regredito";
}

function leggiFileRepo(rel) {
  const p = join(AD_ROOT, rel);
  if (!existsSync(p)) return null;
  try {
    return readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

function main() {
  const quando = nowPiacenza();
  const p = join(AD_ROOT, CANTIERE);
  if (!existsSync(p)) {
    console.error(`⚪ cantiere non trovato: ${CANTIERE} — non ho potuto controllare nessuna chiusura`);
    // AR-859 — 2 = NON HO POTUTO MISURARE, non «ho trovato chiusure sbagliate».
    process.exit(2);
  }
  const cant = JSON.parse(readFileSync(p, "utf8"));
  const chiusi = (cant.difetti || []).filter((d) => d.stato === "chiuso");

  const regrediti = [], senzaProva = [], deboli = [], fileAssente = [], aComando = [];
  for (const d of chiusi) {
    const esito = riverifica(d, leggiFileRepo);
    const riga = { id: d.id, titolo: (d.titolo || "").slice(0, 90), file: d.verifica?.file || null, chiuso_il: d.chiuso_il || "" };
    if (esito === "regredito") regrediti.push(riga);
    else if (esito === "senza-prova") senzaProva.push(riga);
    else if (esito === "file-assente") fileAssente.push(riga);
    else if (esito === "comando") aComando.push(riga);
    if (d.verifica?.file && provaDebole(d.verifica.file)) deboli.push(riga);
  }

  if (JSON_MODE) {
    console.log(JSON.stringify({ quando, chiusi: chiusi.length, regrediti, senza_prova: senzaProva, prova_debole: deboli, file_assente: fileAssente, a_comando: aComando }, null, 2));
    process.exit(GATE && regrediti.length ? 1 : 0);
  }

  console.log(`\n🔍 AUDIT DELLE CHIUSURE — ${quando}\n`);
  console.log(`  difetti chiusi ricontrollati: ${chiusi.length}`);
  console.log(`  ❌ regrediti (il fix non c'è più):   ${regrediti.length}`);
  console.log(`  🖐️  chiusi senza prova automatica:    ${senzaProva.length}`);
  console.log(`  ⚠️  prova debole (punta alla prosa):  ${deboli.length}`);
  console.log(`  ❔ file della prova sparito:          ${fileAssente.length}`);
  if (aComando.length) console.log(`  ⚙️  prova a comando (la ri-esegue auto-fix): ${aComando.length}`);

  const mostra = (titolo, arr, n = 8) => {
    if (!arr.length) return;
    console.log(`\n${titolo}`);
    for (const r of arr.slice(0, n)) console.log(`  · ${r.id} — ${r.titolo}${r.file ? `  [${r.file}]` : ""}`);
    if (arr.length > n) console.log(`  … e altri ${arr.length - n}`);
  };
  mostra("❌ REGREDITI — erano chiusi, il fix ora non risulta più presente:", regrediti);
  mostra("⚠️  PROVA DEBOLE — verificati contro un file che DESCRIVE, non che FA (l'errore di AR-008):", deboli);
  mostra("🖐️  SENZA PROVA — nessun guardiano potrà mai ricontrollarli:", senzaProva);

  if (!regrediti.length) console.log(`\n✅ Nessuna chiusura regredita: i fix dichiarati chiusi risultano ancora nel codice.`);
  else console.log(`\n→ Riapri i regrediti: erano contati come risolti ma il codice dice il contrario.`);

  process.exit(GATE && regrediti.length ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
