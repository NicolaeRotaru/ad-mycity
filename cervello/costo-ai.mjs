#!/usr/bin/env node
// costo-ai.mjs — registra il CONSUMO della macchina (token/durata per run) e tiene un totale giornaliero.
// 🟢 Sola lettura verso l'esterno. Scrive solo costo-ai.json nel vault.
//
// Risolve AR-020: la macchina era cieca sul proprio costo. Invocato a fine giro/ritmo, accumula il consumo
// e lascia un battito + segnale così una sentinella allerta al superamento della soglia giornaliera.
//
// Uso:
//   node cervello/costo-ai.mjs --tipo=giro --durata-sec=123 [--token=45000] [--modello=claude-opus]
//   node cervello/costo-ai.mjs --json     -> stato attuale senza aggiungere nulla
//
// Exit: 0 sempre (1 solo su errore interno).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const OUT_PATH = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/costo-ai.json");
const SOGLIA_DEFAULT = 2_000_000;

function getFlag(name) {
  const pref = `--${name}=`;
  const arg = process.argv.find((a) => a.startsWith(pref));
  return arg ? arg.slice(pref.length).trim() : null;
}

function vuoto() {
  return {
    _cosa_e:
      "🪙 COSTO AI — consumo della macchina (token/durata per run) e totale giornaliero (AR-020). Lo aggiorna cervello/costo-ai.mjs a fine giro/ritmo; una sentinella allerta oltre la soglia. Non misura soldi veri, misura lo sforzo.",
    aggiornato: nowPiacenza(),
    soglia_giornaliera_token: Number(process.env.COSTO_SOGLIA_TOKEN_GIORNO || SOGLIA_DEFAULT),
    oggi: { data: "", runs: 0, token_totali: 0, durata_sec_totale: 0, voci: [] },
    storico_giorni: [],
  };
}

function leggi() {
  if (!existsSync(OUT_PATH)) return vuoto();
  try {
    const j = JSON.parse(readFileSync(OUT_PATH, "utf8"));
    j.oggi = j.oggi || { data: "", runs: 0, token_totali: 0, durata_sec_totale: 0, voci: [] };
    j.storico_giorni = j.storico_giorni || [];
    return j;
  } catch {
    return vuoto();
  }
}

function main() {
  const quando = nowPiacenza();
  const oggiData = quando.slice(0, 10);
  const stato = leggi();
  stato.soglia_giornaliera_token = Number(process.env.COSTO_SOGLIA_TOKEN_GIORNO || stato.soglia_giornaliera_token || SOGLIA_DEFAULT);

  // Cambio giorno: archivia il vecchio "oggi" e resetta.
  if (stato.oggi.data && stato.oggi.data !== oggiData) {
    stato.storico_giorni.unshift({
      data: stato.oggi.data,
      runs: stato.oggi.runs,
      token_totali: stato.oggi.token_totali,
      durata_sec_totale: stato.oggi.durata_sec_totale,
    });
    if (stato.storico_giorni.length > 60) stato.storico_giorni = stato.storico_giorni.slice(0, 60);
    stato.oggi = { data: oggiData, runs: 0, token_totali: 0, durata_sec_totale: 0, voci: [] };
  }
  if (!stato.oggi.data) stato.oggi.data = oggiData;

  const tipo = getFlag("tipo");
  if (tipo && !JSON_MODE) {
    const durata = Number(getFlag("durata-sec") || 0) || 0;
    const tokRaw = getFlag("token");
    const token = tokRaw != null && !Number.isNaN(Number(tokRaw)) ? Number(tokRaw) : null;
    const modello = getFlag("modello");
    stato.oggi.voci.push({ quando, tipo, durata_sec: durata, token, modello: modello || null });
    stato.oggi.runs += 1;
    stato.oggi.durata_sec_totale += durata;
    if (token != null) stato.oggi.token_totali += token;
  }

  stato.aggiornato = quando;
  const superata = stato.oggi.token_totali > stato.soglia_giornaliera_token;

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(stato, null, 2) + "\n", "utf8");

  stampSegnale(
    "costo-ai",
    superata ? "warn" : "ok",
    `token oggi ${stato.oggi.token_totali} / soglia ${stato.soglia_giornaliera_token} · ${quando}`
  ).catch(() => {});

  if (JSON_MODE) {
    console.log(JSON.stringify(stato, null, 2));
  } else {
    console.log(`\n🪙 COSTO AI — ${oggiData}\n`);
    console.log(`Runs oggi:    ${stato.oggi.runs}`);
    console.log(`Token oggi:   ${stato.oggi.token_totali} / soglia ${stato.soglia_giornaliera_token}${superata ? "  ⚠️  SOGLIA SUPERATA" : ""}`);
    console.log(`Durata oggi:  ${stato.oggi.durata_sec_totale}s`);
    console.log(`\nScritto: ${OUT_PATH}`);
  }

  process.exit(0);
}

try {
  main();
} catch (e) {
  console.error("ERRORE costo-ai:", e.message || e);
  process.exit(1);
}
