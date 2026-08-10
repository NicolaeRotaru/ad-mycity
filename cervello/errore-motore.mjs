#!/usr/bin/env node
// 🪧 ERRORE-MOTORE — il PONTE che mancava fra il VPS e chi guarda da fuori.
//
// Il difetto che chiude (osservato 2026-08-10). Quando il motore AI muore, l'unico posto dove
// finisce il perché è il journal di systemd, che vive SOLO sul VPS. Da una sessione cloud, dal
// telefono di Nicola o dal Pannello quel testo non esiste: si vede che la cadenza è fallita
// (`esito-cadenze.json` dice «motore-fallito», ai_rc 1) e basta. Undici giorni di Intelligence
// ferma senza che nessuno potesse dire PERCHÉ, perché la frase «You've reached your weekly limit»
// era stampata su un canale che non attraversa la rete.
//
// La regola: un guasto che non lascia traccia FUORI dalla macchina dov'è successo è un guasto muto,
// e un guasto muto costa quanto il guasto più il tempo per scoprirlo. Qui le ultime righe del
// motore vengono ripulite dai segreti e scritte in memoria, che è già pubblicata su main a ogni
// cadenza — quindi arrivano dove arrivano tutti gli altri fatti.
//
// Uso:
//   node cervello/errore-motore.mjs registra --cadenza=monitora --rc=1 [--testo-file=/tmp/out]
//   ... | node cervello/errore-motore.mjs registra --cadenza=giro --rc=124      (testo da stdin)
//   node cervello/errore-motore.mjs ultimo [--json]      -> l'ultimo guasto, in parole
//   node cervello/errore-motore.mjs --check              -> exit 1 se il motore risulta fermo ORA
//
// Dove scrive: MyCity-Vault/90-Memoria-AI/auto-coscienza/motore-errori.json (anello di 20 voci).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { classificaErrore, decidiRitento } from "./retry-policy.mjs";

export const FILE_ERRORI = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/motore-errori.json");
const MAX_VOCI = 20;
const MAX_RIGHE = 15; // quante righe di coda tenere: bastano a capire, non tanto da diventare un log.

// 🔒 REDAZIONE — questo testo finisce su GitHub. Un token nel messaggio d'errore diventerebbe un
// token pubblico. La lista è volutamente larga: meglio cancellare una riga innocua che pubblicarne
// una che scotta. Ordine: prima gli URL con credenziali dentro, poi le chiavi nude.
const MASCHERE = [
  [/https:\/\/[^@\s/]+:[^@\s/]+@/gi, "https://***:***@"],
  [/\b(gh[pousr]_[A-Za-z0-9]{10,})/g, "ghX_***"],
  [/\b(sk-[A-Za-z0-9_-]{10,})/g, "sk-***"],
  [/\b(sk_live_[A-Za-z0-9]{6,}|sk_test_[A-Za-z0-9]{6,})/g, "sk_***"],
  [/\bey[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, "jwt.***"],
  [/\b(x-access-token|apikey|api[_-]?key|authorization|bearer|token|secret|password)\b\s*[:=]\s*\S+/gi, "$1=***"],
  [/\bsbp_[A-Za-z0-9]{10,}/g, "sbp_***"],
];

/** Toglie dal testo tutto ciò che somiglia a una credenziale. Pura: provata dai test. */
export function ripulisci(testo = "") {
  let t = String(testo);
  for (const [re, con] of MASCHERE) t = t.replace(re, con);
  return t;
}

/** Ultime N righe non vuote, ripulite. Pura. */
export function codaPulita(testo = "", righe = MAX_RIGHE) {
  return ripulisci(testo)
    .split(/\r?\n/)
    .map((r) => r.trimEnd())
    .filter((r) => r.trim() !== "")
    .slice(-righe);
}

/**
 * Traduce il guasto in una frase che Nicola può leggere senza decifrare niente.
 * Pura: dipende solo dalla classe e dai dati già estratti.
 */
export function spiegazioneUmana({ classe, resetDataISO, quandoRitentoISO } = {}) {
  const quando = resetDataISO || quandoRitentoISO;
  const q = quando ? new Date(quando).toLocaleString("it-IT", { timeZone: "Europe/Rome", dateStyle: "short", timeStyle: "short" }) : null;
  switch (classe) {
    case "quota_settimanale":
      return q
        ? `Claude ha finito il pacchetto settimanale. Si libera il ${q} e la macchina riparte da sola.`
        : "Claude ha finito il pacchetto settimanale. Il messaggio non dice quando si libera: la macchina ricontrolla ogni 6 ore.";
    case "quota":
      return q
        ? `Claude ha finito il pacchetto di questa sessione. Si libera verso le ${q} e la macchina riparte da sola.`
        : "Claude ha finito il pacchetto di questa sessione. Si libera entro poche ore e la macchina riparte da sola.";
    case "auth":
      return "Il collegamento con Claude è scaduto. Questo NON si aggiusta da solo: sul server va rifatto il login con collega-claude.sh.";
    case "timeout":
      return "Il lavoro ci ha messo troppo ed è stato interrotto. Di solito è un intoppo passeggero: riparte al prossimo giro.";
    default:
      return "Il motore si è fermato per un motivo che non rientra nei casi noti. Serve leggere le righe qui sotto.";
  }
}

/** Legge l'anello (o un anello vuoto se il file non c'è / è illeggibile). */
export function leggi(path = FILE_ERRORI) {
  if (!existsSync(path)) return { aggiornato: null, voci: [] };
  try {
    const j = JSON.parse(readFileSync(path, "utf8"));
    return { aggiornato: j.aggiornato || null, voci: Array.isArray(j.voci) ? j.voci : [] };
  } catch {
    return { aggiornato: null, voci: [] };
  }
}

/**
 * Registra un guasto del motore. Ritorna la voce scritta.
 * Non scrive MAI da un ambiente che non ha visto il guasto: chi chiama è per definizione la
 * macchina dov'è successo (le cadenze), quindi non serve la guardia di stato-sensori — ma serve
 * che una cadenza ANDATA BENE non lasci una voce, altrimenti l'anello mente al contrario.
 */
export function registra({ cadenza, rc = 1, testo = "", nowMs = Date.now(), path = FILE_ERRORI } = {}) {
  const { classe, resetHint, resetData } = classificaErrore(testo);
  const decisione = decidiRitento({ tipo: String(cadenza || ""), tentativi: 0, risultato: testo, nowMs });
  const voce = {
    quando: nowPiacenza(),
    cadenza: String(cadenza || "?"),
    rc: Number(rc) || 0,
    classe,
    reset_dichiarato: resetHint || null,
    reset_data: resetData ? new Date(resetData).toISOString() : null,
    ritento_previsto: decisione.azione === "ritenta" ? decisione.quandoISO : null,
    riparte_da_sola: decisione.azione === "ritenta",
    spiegazione: spiegazioneUmana({
      classe,
      resetDataISO: resetData ? new Date(resetData).toISOString() : null,
      quandoRitentoISO: decisione.azione === "ritenta" ? decisione.quandoISO : null,
    }),
    righe: codaPulita(testo),
  };
  const anello = leggi(path);
  const voci = [voce, ...anello.voci].slice(0, MAX_VOCI);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    JSON.stringify(
      {
        _cosa_e:
          "Ultimi guasti del motore AI, con le righe vere ripulite dai segreti. Esiste perché il journal di systemd vive solo sul VPS: senza questo file, da fuori si vede CHE una cadenza è fallita ma mai PERCHÉ.",
        aggiornato: nowPiacenza(),
        voci,
      },
      null,
      2
    ) + "\n",
    "utf8"
  );
  return voce;
}

// ─────────────────────────────── CLI ───────────────────────────────
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const arg = (nome, def = "") => {
    const t = process.argv.find((a) => a.startsWith(`--${nome}=`));
    return t ? t.slice(nome.length + 3) : def;
  };
  const cmd = process.argv[2];

  if (cmd === "registra") {
    let testo = "";
    const daFile = arg("testo-file");
    if (daFile && existsSync(daFile)) testo = readFileSync(daFile, "utf8");
    else if (!process.stdin.isTTY) testo = readFileSync(0, "utf8");
    const voce = registra({ cadenza: arg("cadenza", "?"), rc: arg("rc", "1"), testo });
    console.log(`[${voce.quando}] Guasto motore registrato (${voce.cadenza}, classe ${voce.classe}) → ${FILE_ERRORI}`);
    console.log(`   ${voce.spiegazione}`);
    process.exit(0);
  }

  const { voci } = leggi();
  const ultimo = voci[0] || null;

  if (cmd === "--check") {
    // Esce 1 se l'ultimo guasto è ancora "aperto" (ritento nel futuro): serve al giro come gate.
    if (!ultimo) process.exit(0);
    const aperto = ultimo.ritento_previsto && Date.parse(ultimo.ritento_previsto) > Date.now();
    if (aperto) {
      console.error(`⛔ Motore AI fermo dal ${ultimo.quando} (${ultimo.classe}). ${ultimo.spiegazione}`);
      process.exit(1);
    }
    console.log(`✅ Nessun guasto del motore aperto (ultimo: ${ultimo.quando}, ${ultimo.classe}).`);
    process.exit(0);
  }

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(ultimo, null, 2));
    process.exit(0);
  }
  if (!ultimo) {
    console.log("Nessun guasto del motore registrato.");
    process.exit(0);
  }
  console.log(`🪧 Ultimo guasto del motore — ${ultimo.quando} · cadenza ${ultimo.cadenza} · rc ${ultimo.rc}`);
  console.log(`   ${ultimo.spiegazione}`);
  if (ultimo.ritento_previsto) console.log(`   Ritento previsto: ${ultimo.ritento_previsto}`);
  console.log("");
  for (const r of ultimo.righe) console.log(`   │ ${r}`);
}
