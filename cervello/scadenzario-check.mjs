#!/usr/bin/env node
// AR-147 — SCADENZARIO: countdown reale sulle scadenze esterne (bandi, fiscali, contrattuali,
// assicurative). Prima di questo script le scadenze vivevano solo come promemoria scritti a mano
// nei Report/Briefing: nessun dato sorvegliato, nessun allarme automatico se qualcuno se ne
// dimenticava. Questo pezzo legge MyCity-Vault/05-Soldi-Rischi/scadenzario.json, calcola i giorni
// residui per ogni scadenza "aperta" e, quando entra nella sua finestra di allarme, accoda UNA
// SOLA VOLTA una card 🔴 in AZIONI-IN-ATTESA (dedup su marcatore — niente spam a ogni giro, stessa
// lezione del 23/7 sulle sentinelle duplicate).
//
// Uso:
//   node cervello/scadenzario-check.mjs                 -> report + accoda (se serve, una sola volta)
//   node cervello/scadenzario-check.mjs --dry            -> report, NON accoda
//   node cervello/scadenzario-check.mjs --json           -> output JSON (per giro / Pannello)
//   node cervello/scadenzario-check.mjs --file <path>    -> usa un altro file scadenzario
//
// Exit: 0 = nessuna scadenza in allarme (o nessuna scadenza) · 1 = almeno una scadenza in finestra
// di allarme e non chiusa (segnale per il giro, MAI un blocco hard — è un promemoria, non un cancello).

import { existsSync, readFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const JSON_MODE = args.includes("--json");
const fileArg = args.includes("--file") ? args[args.indexOf("--file") + 1] : null;

const SCADENZARIO_PATH = fileArg || join(AD_ROOT, "MyCity-Vault/05-Soldi-Rischi/scadenzario.json");
const CODA_PATH = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md");

function readJson(path, fallback = null) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function giorniResidui(scadenzaStr) {
  const scad = new Date(scadenzaStr.replace(" ", "T"));
  if (Number.isNaN(scad.getTime())) return null;
  const ora = new Date();
  const msResidui = scad.getTime() - ora.getTime();
  return msResidui / (1000 * 60 * 60 * 24);
}

function marcatore(id) {
  return `<!-- scadenzario:${id} -->`;
}

function main() {
  const cfg = readJson(SCADENZARIO_PATH);
  const scadenze = cfg && Array.isArray(cfg.scadenze) ? cfg.scadenze : [];
  const codaEsistente = existsSync(CODA_PATH) ? readFileSync(CODA_PATH, "utf8") : "";

  const righe = scadenze
    .filter((s) => s.stato !== "chiusa")
    .map((s) => {
      const giorni = giorniResidui(s.scadenza);
      const finestra = Number(s.finestra_allarme_giorni) || 7;
      const inAllarme = giorni != null && giorni <= finestra;
      const scaduta = giorni != null && giorni < 0;
      const giaAccodata = codaEsistente.includes(marcatore(s.id));
      return { ...s, giorni_residui: giorni != null ? Math.round(giorni * 10) / 10 : null, in_allarme: inAllarme, scaduta, gia_accodata: giaAccodata };
    });

  const daAccodare = righe.filter((r) => r.in_allarme && !r.gia_accodata);

  if (!DRY && daAccodare.length && existsSync(CODA_PATH)) {
    const ts = nowPiacenza();
    let blocco = "";
    for (const r of daAccodare) {
      blocco +=
        `\n${marcatore(r.id)}\n` +
        `## 🔴 SCADENZA — ${r.titolo} (${ts})\n` +
        `- Scade: **${r.scadenza}** · Giorni residui: **${r.giorni_residui}**` +
        (r.importo ? ` · In palio: ${r.importo}` : "") +
        `\n- Cosa cambia: se non si agisce entro la scadenza, l'opportunità/obbligo è perso.\n` +
        `- Se va bene: Nicola conferma l'azione collegata${r.azione_collegata ? ` (${r.azione_collegata})` : ""} o dice di lasciarla scadere.\n` +
        `- Fonte: ${r.fonte || "n/d"}\n`;
    }
    appendFileSync(CODA_PATH, blocco, "utf8");
  }

  const report = {
    ok: daAccodare.length === 0,
    fonte_dati: SCADENZARIO_PATH,
    scadenze: righe,
    da_accodare: daAccodare.map((r) => r.id),
    accodato: !DRY && daAccodare.length > 0,
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`📅 Scadenzario — ${righe.length} scadenza/e aperta/e sorvegliata/e`);
    if (!righe.length) {
      console.log(`   (nessuna scadenza in ${SCADENZARIO_PATH}: aggiungi voci per attivare il countdown)`);
    }
    for (const r of righe) {
      const stato = r.scaduta ? "🔴 SCADUTA" : r.in_allarme ? "🟡 in allarme" : "🟢 ok";
      console.log(`   ${stato} ${r.titolo}: ${r.giorni_residui} giorni residui (scade ${r.scadenza})`);
    }
    if (daAccodare.length) {
      console.log(`\n🔴 ${daAccodare.length} scadenza/e nuova/e in allarme: ${DRY ? "(dry: non accodato)" : "accodata/e in AZIONI-IN-ATTESA 🔴"}.`);
    } else {
      console.log(`\n🟢 Nessuna nuova scadenza da segnalare.`);
    }
  }

  process.exit(daAccodare.length ? 1 : 0);
}

main();
