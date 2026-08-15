#!/usr/bin/env node
// Agenda deterministica per @intelligence — cosa controllare oggi, senza AI.
// Legge radar-fonti.json + date dei file Intelligence + fonti-salute.json
// e scrive cervello/intelligence-agenda.json (consumato da giro/monitora/worker).
//
// Uso:
//   node cervello/intelligence-agenda.mjs
//   node cervello/intelligence-agenda.mjs --json

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { msDaTimbro } from "./ora-piacenza.mjs";

const JSON_MODE = process.argv.includes("--json");
const RADAR = join(AD_ROOT, "cervello/radar-fonti.json");
const FONTI_SALUTE = join(AD_ROOT, "cervello/fonti-salute.json");
const OUT = join(AD_ROOT, "cervello/intelligence-agenda.json");
const INTEL_DIR = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/Intelligence");

const FILE_MAP = {
  "radar-concorrenti": "radar-concorrenti.md",
  "eventi-picchi": "eventi-picchi.md",
  "buchi-mercato": "buchi-mercato.md",
  "leve-uscita": "leve-uscita.md",
  reputazione: "reputazione.md",
};

function parseIsoFromText(text) {
  const m = text.match(/(\d{4}-\d{2}-\d{2})(?:\s+\d{2}:\d{2})?/);
  return m ? m[1] : null;
}

/**
 * Da quanti giorni una scheda non viene aggiornata, contati da mezzogiorno a mezzogiorno.
 *
 * Le due date avevano `+02:00` scritto a mano: l'ora legale, vera cinque mesi su dodici. Quando
 * l'intervallo scavalca il cambio d'ora le due sponde hanno offset diversi, il cablato ne perde uno
 * e `Math.floor` regala un giorno intero. Sopra questo numero sta `dovutaOggi`, cioè la decisione di
 * mandare o no una fonte a controllare: un giorno in più fa partire lavoro che non serviva.
 */
export function giorniDa(iso, oggiIso = nowPiacenza().slice(0, 10)) {
  if (!iso) return 999;
  const t = msDaTimbro(`${iso} 12:00`);
  const oggi = msDaTimbro(`${oggiIso} 12:00`);
  if (!Number.isFinite(t) || !Number.isFinite(oggi)) return 999;
  return Math.floor((oggi - t) / 86400000);
}

function ultimoAggiornamento(scriveIn) {
  const rel = FILE_MAP[scriveIn];
  if (!rel) return { iso: null, giorni: 999 };
  const path = join(INTEL_DIR, rel);
  if (!existsSync(path)) return { iso: null, giorni: 999 };
  const head = readFileSync(path, "utf8").slice(0, 600);
  const iso = parseIsoFromText(head);
  return { iso, giorni: giorniDa(iso) };
}

function fonteViva(id, salute) {
  const f = (salute.fonti || []).find((x) => x.id === id);
  if (!f) return true;
  return f.viva !== false && !f.morta;
}

function dovutaOggi(fonte, salute) {
  if (!fonteViva(fonte.id, salute)) return { dovuta: false, motivo: "fonte_morta" };
  const { giorni } = ultimoAggiornamento(fonte.scrive_in || "");
  if (fonte.cadenza === "giornaliera") return { dovuta: true, motivo: "giornaliera" };
  if (fonte.cadenza === "settimanale") {
    return giorni >= 7
      ? { dovuta: true, motivo: `settimanale_stale_${giorni}g` }
      : { dovuta: false, motivo: `settimanale_ok_${giorni}g` };
  }
  return { dovuta: false, motivo: "cadenza_sconosciuta" };
}

function main() {
  const quando = nowPiacenza();
  if (!existsSync(RADAR)) {
    const err = { ok: false, quando, errore: "radar-fonti.json assente" };
    console.log(JSON_MODE ? JSON.stringify(err) : "❌ radar-fonti.json assente");
    process.exit(1);
  }

  const radar = JSON.parse(readFileSync(RADAR, "utf8"));
  const salute = existsSync(FONTI_SALUTE)
    ? JSON.parse(readFileSync(FONTI_SALUTE, "utf8"))
    : { fonti: [] };

  const agenda = [];
  for (const f of radar.fonti || []) {
    const { dovuta, motivo } = dovutaOggi(f, salute);
    if (dovuta) {
      agenda.push({
        id: f.id,
        nome: f.nome,
        peso: f.peso,
        cadenza: f.cadenza,
        scrive_in: f.scrive_in,
        senior: f.senior,
        cosa_cercare: f.cosa_cercare,
        url: f.url,
        url_websearch: f.url_websearch || null,
        skip_check: !!f.skip_check,
        motivo,
      });
    }
  }

  agenda.sort((a, b) => (b.peso || 0) - (a.peso || 0));

  const stale = Object.entries(FILE_MAP)
    .map(([k, file]) => {
      const { iso, giorni } = ultimoAggiornamento(k);
      return { file: k, path: file, ultimo: iso, giorni };
    })
    .filter((x) => x.giorni >= 2);

  const out = {
    ok: true,
    quando,
    fonti_dovute: agenda.length,
    fonti_totali: (radar.fonti || []).length,
    agenda,
    stale,
    prossimo_passo:
      agenda.length > 0
        ? "Esegui monitora.md sulle fonti in agenda (WebSearch se 403)"
        : "Nessuna fonte dovuta oggi oltre al check già fatto",
  };

  writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`);

  if (JSON_MODE) {
    console.log(JSON.stringify(out));
  } else {
    console.log(
      `✅ intelligence-agenda: ${agenda.length} fonti dovute oggi (su ${out.fonti_totali}) — ${quando}`,
    );
    if (agenda.length) {
      console.log(
        `   top: ${agenda
          .slice(0, 4)
          .map((x) => x.id)
          .join(", ")}`,
      );
    }
    if (stale.length) {
      console.log(`   stale: ${stale.map((x) => `${x.file}(${x.giorni}g)`).join(", ")}`);
    }
  }

  process.exit(0);
}

// Gira solo se lanciato direttamente. Prima `main()` partiva anche su import: chi voleva PROVARE
// `giorniDa` si ritrovava l'agenda riscritta su disco e un `process.exit(0)` a metà test. È la
// stessa trappola già annotata in sonda-volano.mjs — una decisione che non si può provare senza
// sporcare la memoria non viene provata, ed è per questo che l'ora scritta a mano è rimasta qui.
if (import.meta.url === `file://${process.argv[1]}`) main();
