#!/usr/bin/env node
// AR-051 — CALCOLATORE DEL TASSO DI APPLICAZIONE DELLE LEZIONI (rende VIVO il volano di apprendimento).
// 🟡 Scrive SOLO nel blocco `meta` di apprendimento.json (memoria dell'AD). Firma Nicola per cablarlo nel giro.
//
// Problema (AR-051): `tasso_applicazione` in apprendimento.json era scritto a mano (0.5), non calcolato:
// la metrica che dovrebbe smascherare un loop morto era auto-dichiarata dal loop stesso → la sua escalation
// (sentinella "volano fermo < 0.3") era codice morto. Nessuno legava lezione → mossa reale.
//
// Fix: una forcing-function DETERMINISTICA (come chiusura-loop.mjs per i quaderni). Una lezione è "applicata"
// se è stata USATA negli ultimi N giri, provato da UNO di questi due segnali verificabili:
//   (a) la lezione ha un campo `usi`/`applicata_in` (array di id-decisione/id-briefing) con una voce fresca;
//   (b) il suo `id` compare in un Briefing recente o in DECISIONI.md (traccia reale d'uso).
//   tasso_applicazione = lezioni-attive-applicate / lezioni-attive  →  tasso>0 diventa una PROVA, non un'opinione.
//
// Uso:
//   node cervello/tasso-lezioni.mjs            -> calcola e RISCRIVE meta.tasso_applicazione (default)
//   node cervello/tasso-lezioni.mjs --dry      -> calcola e stampa, NON scrive
//   node cervello/tasso-lezioni.mjs --json     -> output JSON (per giro / sonda auto-coscienza)
//
// Env: TASSO_LEZIONI_GIORNI (default 30) = finestra "ultimi N giri" per considerare un uso ancora fresco.

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const DRY = process.argv.includes("--dry");
const JSON_MODE = process.argv.includes("--json");
const GIORNI = Number(process.env.TASSO_LEZIONI_GIORNI || 30);

const VAULT = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI");
const APPR_PATH = join(VAULT, "auto-coscienza/apprendimento.json");
const BRIEFING_DIR = join(VAULT, "Briefing");
const DECISIONI_PATH = join(VAULT, "DECISIONI.md");

function readJson(path, fallback = null) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function toDate(s) {
  if (!s || typeof s !== "string") return null;
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

function giorniFa(dateStr) {
  const d = toDate(dateStr);
  if (!d) return Infinity;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

// Testo recente (Briefing degli ultimi N giorni + DECISIONI.md) dove cercare l'id-lezione come prova d'uso.
function testoRecente() {
  let blob = "";
  if (existsSync(DECISIONI_PATH)) blob += readFileSync(DECISIONI_PATH, "utf8");
  if (existsSync(BRIEFING_DIR)) {
    for (const f of readdirSync(BRIEFING_DIR)) {
      if (!f.endsWith(".md")) continue;
      // il nome file è AAAA-MM-GG.md → filtra per freschezza quando possibile
      if (giorniFa(f) > GIORNI) continue;
      try {
        blob += readFileSync(join(BRIEFING_DIR, f), "utf8");
      } catch {
        /* ignora */
      }
    }
  }
  return blob;
}

function lezioneApplicata(lez, blob) {
  // (a) campo esplicito usi / applicata_in con una voce fresca
  const usi = lez.usi || lez.applicata_in || [];
  if (Array.isArray(usi) && usi.length) {
    for (const u of usi) {
      const quando = typeof u === "object" ? u.data || u.quando : null;
      if (quando == null || giorniFa(quando) <= GIORNI) return true;
    }
  }
  // (b) l'id compare in un briefing recente / nelle decisioni
  if (lez.id && blob.includes(lez.id)) return true;
  return false;
}

function main() {
  const appr = readJson(APPR_PATH);
  if (!appr || !Array.isArray(appr.lezioni)) {
    const msg = `apprendimento.json non leggibile o senza lezioni: ${APPR_PATH}`;
    if (JSON_MODE) console.log(JSON.stringify({ ok: false, errore: msg }));
    else console.error("❌ " + msg);
    process.exit(2);
  }

  const attive = appr.lezioni.filter((l) => l.stato !== "decaduta");
  const blob = testoRecente();
  const applicate = attive.filter((l) => lezioneApplicata(l, blob));
  const tasso_applicazione = attive.length
    ? Math.round((applicate.length / attive.length) * 100) / 100
    : 0;

  const meta = {
    ...(appr.meta || {}),
    lezioni_attive: attive.length,
    promosse_a_principio: Array.isArray(appr.principi) ? appr.principi.length : (appr.meta?.promosse_a_principio ?? 0),
    decadute: appr.lezioni.filter((l) => l.stato === "decaduta").length,
    tasso_applicazione,
    tasso_calcolato_il: nowPiacenza(),
    tasso_finestra_giorni: GIORNI,
  };

  const report = {
    ok: true,
    lezioni_attive: attive.length,
    lezioni_applicate: applicate.length,
    tasso_applicazione,
    applicate_ids: applicate.map((l) => l.id),
    non_applicate_ids: attive.filter((l) => !lezioneApplicata(l, blob)).map((l) => l.id),
    volano: tasso_applicazione >= 0.3 ? "🟢 aperto" : "🔴 fermo (< 0.3 → escalation)",
    scritto: !DRY,
  };

  if (!DRY) {
    appr.meta = meta;
    writeFileSync(APPR_PATH, JSON.stringify(appr, null, 2) + "\n", "utf8");
  }

  if (JSON_MODE) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`📈 tasso_applicazione = ${tasso_applicazione} (${applicate.length}/${attive.length} lezioni attive usate negli ultimi ${GIORNI}gg)`);
    console.log(`   volano: ${report.volano}`);
    if (report.non_applicate_ids.length) console.log(`   lezioni MAI applicate: ${report.non_applicate_ids.join(", ")}`);
    console.log(DRY ? "   (--dry: meta NON riscritto)" : `   meta.tasso_applicazione riscritto in ${APPR_PATH}`);
  }

  // Exit 1 = volano fermo (fa da gate/sentinella nel giro). 0 = sano.
  process.exit(tasso_applicazione < 0.3 ? 1 : 0);
}

main();
