#!/usr/bin/env node
// 📅 GUARDIANO DELLE SCADENZE — AR-147 / AR-214.
//
// Fa due cose che nessuno faceva:
//
//   ① CALCOLA quanto manca, invece di leggere una frase. L'agente `scadenzario` esiste da sempre e
//      non aveva mai prodotto un artefatto-dati: le scadenze esterne vivevano come racconto dentro i
//      Report, e un racconto non suona quando è ora (AR-147).
//
//   ② TROVA i countdown trascritti a mano che hanno smesso di essere veri. Misurato il 28/7 alle
//      05:59: due schede della stessa pagina dicevano «mancano 3 giorni» per PI26 mentre ne mancavano
//      2,4 — e non divergevano fra loro, CONCORDAVANO. Due fonti che dicono lo stesso numero
//      sembrano una conferma; erano solo due copie della stessa frase invecchiata (AR-214).
//
// La posta non è architetturale: PI26 sono 10.000€ a fondo perduto, sportello a esaurimento, e dopo
// l'invio non si corregge. Leggere «3 giorni» quando ne restano 2 è la differenza fra arrivare e no.
//
// 🟢 Sola lettura: non scrive niente, non tocca il vault, non fa rete.
//
// Uso:
//   node cervello/scadenzario-check.mjs           -> rapporto
//   node cervello/scadenzario-check.mjs --json    -> JSON
//
// Exit (contratto AR-322): 0 = niente di imminente · 1 = scadenza entro 72h o countdown stantio · 2 = cieco

import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { codiceUscita, countdownNelTesto, countdownStantio, livelloScadenza, quantoManca, testoCountdown } from "./scadenze-regole.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..");
const REGISTRO = join(QUI, "scadenzario.json");
const JSON_MODE = process.argv.includes("--json");

// I file VIVI che Nicola legge e in cui un countdown trascritto fa danno. La storia (Briefing,
// DECISIONI, Report, SALA) è esente per la stessa ragione di AR-102: non si riscrive, ed è datata.
// L'elenco si può puntare altrove con SCADENZARIO_FILE_VIVI (percorsi separati da «:»). Serve al
// test: senza, l'unico modo di provare il rilevatore sarebbe sporcare i file veri di Nicola — e una
// prova che controlla solo lo stato attuale resta verde anche se il rilevatore viene spento.
const FILE_VIVI = (process.env.SCADENZARIO_FILE_VIVI || [
  "MyCity-Vault/90-Memoria-AI/CHECKLIST-NICOLA.md",
  "MyCity-Vault/90-Memoria-AI/intenzioni-nicola.json",
  "MyCity-Vault/90-Memoria-AI/STATO.md",
  "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md",
].join(":")).split(":").filter(Boolean);

function leggi(rel) {
  try {
    // Percorso assoluto ammesso: serve a SCADENZARIO_FILE_VIVI, che il test punta su una fixture.
    return readFileSync(isAbsolute(rel) ? rel : join(REPO, rel), "utf8");
  } catch {
    return null;
  }
}

function main() {
  if (!existsSync(REGISTRO)) {
    console.error("⚠️  GUARDIANO CIECO: manca cervello/scadenzario.json — non so quali scadenze sorvegliare.");
    process.exit(2);
  }
  let reg;
  try {
    reg = JSON.parse(readFileSync(REGISTRO, "utf8"));
  } catch (e) {
    console.error(`⚠️  GUARDIANO CIECO: scadenzario.json non è JSON valido (${e.message}).`);
    process.exit(2);
  }
  const aperte = Array.isArray(reg.scadenze) ? reg.scadenze : [];
  if (aperte.length === 0) {
    // Nessuna scadenza aperta è uno stato legittimo — ma va detto, non sottinteso.
    if (JSON_MODE) console.log(JSON.stringify({ ok: true, scadenze: [], stantii: [], nota: "nessuna scadenza aperta" }, null, 2));
    else console.log("📅 SCADENZE — nessuna scadenza aperta nel registro.");
    process.exit(0);
  }

  const adesso = Date.now();
  const righe = aperte.map((s) => {
    const m = quantoManca(s.scade, adesso);
    const { testo, livello } = testoCountdown(s.scade, adesso);
    return { id: s.id, titolo: s.titolo, scade: s.scade, colore: s.colore || "🟡", chi: s.chi || "", testo, livello, ore: m?.ore ?? null };
  });

  // ② I countdown trascritti nei file vivi che hanno smesso di essere veri.
  const stantii = [];
  for (const f of FILE_VIVI) {
    const testo = leggi(f);
    if (!testo) continue;
    for (const s of aperte) {
      // Cerco le frasi «mancano N giorni» nelle righe che parlano di QUESTA scadenza.
      for (const riga of testo.split("\n")) {
        if (!new RegExp(s.id, "i").test(riga) && !new RegExp((s.titolo || "").slice(0, 12), "i").test(riga)) continue;
        for (const c of countdownNelTesto(riga)) {
          const v = countdownStantio({ scritto: c.giorni, scadenzaIso: s.scade, adessoMs: adesso });
          if (v.stantio) stantii.push({ file: f, scadenza: s.id, frase: c.frase, motivo: v.motivo });
        }
      }
    }
  }

  const peggiore = righe.reduce((acc, r) => {
    const ord = { scaduta: 4, "ultime-ore": 3, imminente: 2, "questa-settimana": 1, lontana: 0, sconosciuto: 5 };
    return (ord[r.livello] ?? 0) > (ord[acc] ?? 0) ? r.livello : acc;
  }, "lontana");
  const rc = stantii.length > 0 ? 1 : codiceUscita(peggiore);

  const out = { ok: rc === 0, adesso: new Date(adesso).toISOString(), scadenze: righe, stantii, livello_peggiore: peggiore };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log("📅 SCADENZE — calcolate adesso, non trascritte\n");
    for (const r of righe) {
      const icona = r.livello === "scaduta" ? "⛔" : r.livello === "ultime-ore" ? "🔴" : r.livello === "imminente" ? "🟠" : "🟢";
      console.log(`   ${icona} ${r.colore} ${r.titolo}`);
      console.log(`      ${r.testo}  ·  scade ${r.scade}  ·  tocca a ${r.chi || "?"}`);
    }
    if (stantii.length) {
      console.log(`\n   ❌ ${stantii.length} COUNTDOWN TRASCRITTO/I CHE NON È PIÙ VERO:`);
      for (const s of stantii) console.log(`      · ${s.file} → «${s.frase}» — ${s.motivo}`);
      console.log("      Erano veri quando sono stati scritti. Un countdown si CALCOLA, non si ricopia.");
    }
    if (rc === 0) console.log("\n   ✅ niente di imminente, e nessun countdown stantio nei file vivi.");
  }

  process.exit(rc);
}

main();
