#!/usr/bin/env node
// 🧾 LA MALATTIA: un controllo di sola lettura peggiora il dato che dovrebbe solo guardare.
//
// AR-573, l'unico bloccante della radiografia dell'11/8. Successo davvero, quella notte alle
// 02:30: `verifica-sensori.mjs` lanciato da una sessione cloud — dove le chiavi non ci sono —
// ha riscritto `sensori-cecita.json`, il file che alimenta la Cabina. Dieci sensori a posto su
// dodici sono diventati tre, con la data fresca: sembrava che qualcuno li avesse appena
// controllati e li avesse trovati staccati. Non erano staccati. Era chi guardava a non poterli
// vedere.
//
// La protezione ESISTEVA già (AR-035/AR-281): si scrive solo se «l'ambiente è configurato».
// Non si chiudeva mai per due motivi, e questo file li tiene fermi tutti e due:
//   ① il voto era `checks.some(c => c.configurato !== false)` su TUTTI i controlli, e il
//      guardiano esterno — che legge un file nel repo, non una chiave — risponde sempre
//      «configurato». Da solo apriva la porta per tutti gli altri.
//   ② la porta era sul FILE INTERO: bastava una chiave qualsiasi presente per riscrivere a
//      «non configurato» anche i sensori che quella esecuzione non aveva potuto misurare.
//
// La prova non guarda il codice: ESEGUE il comando a chiavi spente su una copia del file vero
// e pretende che la copia non cambi di un byte.

import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const VERIFICA = join(REPO, "cervello/verifica-sensori.mjs");
const VERO = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/sensori-cecita.json");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** Le chiavi che questo comando legge. Spegnerle tutte = la sessione cloud di quella notte. */
const CHIAVI = [
  "MARKETPLACE_SUPABASE_URL", "MARKETPLACE_SUPABASE_KEY", "MARKETPLACE_SUPABASE_ANON_KEY",
  "STRIPE_SECRET_KEY", "POSTHOG_API_KEY", "RESEND_API_KEY", "MARKETPLACE_SITE_URL",
  "SUPABASE_URL", "SUPABASE_SERVICE_KEY", "SUPABASE_SERVICE_ROLE_KEY", "PANNELLO_URL",
  "CABINA_URL", "TELEGRAM_BOT_TOKEN", "N8N_WEBHOOK_URL", "N8N_HEALTH_URL",
];

/** Lancia la verifica con le chiavi spente, puntandola a una copia usa-e-getta. */
function lanciaSenzaChiavi(copia) {
  const env = { ...process.env, SENSORI_CECITA_FILE: copia };
  // Stringa vuota, non `delete`: `git-github.mjs` carica `cervello/vps/.env` all'import e imposta
  // SOLO le chiavi assenti dall'ambiente (`if (!(k in process.env))`). Su una macchina che ha quel
  // file (il VPS, e qualunque checkout locale con le chiavi vere) `delete` fa sparire la chiave dal
  // figlio un istante prima che quel caricamento la ripopoli dal file — il comando gira CON le
  // chiavi mentre il test crede di averle spente. Una stringa vuota resta «presente» per quel
  // controllo ma è falsy per ogni `if (process.env.X)`: spegne per davvero, anche col .env acceso.
  for (const k of CHIAVI) env[k] = "";
  try {
    return execFileSync("node", [VERIFICA], { env, encoding: "utf8", timeout: 240000, stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    // esce ≠ 0 quando i sensori sono spenti: è previsto, quello che conta è il file
    return String(e.stdout || "") + String(e.stderr || "");
  }
}

// ── Il caso che ha rotto ──────────────────────────────────────────────────────
prova("il comando lanciato senza chiavi NON tocca il file dei sensori", () => {
  const dir = mkdtempSync(join(tmpdir(), "sensori-"));
  const copia = join(dir, "sensori-cecita.json");
  copyFileSync(VERO, copia);
  const prima = readFileSync(copia, "utf8");

  lanciaSenzaChiavi(copia);

  const dopo = readFileSync(copia, "utf8");
  assert.equal(dopo, prima, "il file è cambiato: un comando che doveva solo guardare ha riscritto lo stato del VPS");
});

prova("e non lo tocca nemmeno quando lo stato di partenza dice che erano tutti a posto", () => {
  // Il caso peggiore: il VPS aveva appena misurato tutto ok. È lo stato che si perde di più.
  const dir = mkdtempSync(join(tmpdir(), "sensori-ok-"));
  const copia = join(dir, "sensori-cecita.json");
  const tuttiOk = {
    _cosa_e: "copia di prova",
    aggiornato: "2026-08-10 14:20",
    sensori: {
      supabase_rest: { stato: "ok", giri_ciechi: 0, canale: "REST marketplace", dettaglio: "orders CONTATI via REST: 1 righe visibili", ultimo_ok: "2026-08-10 14:20", ultimo_errore: "", ultimo_conteggio: 1 },
      stripe_api: { stato: "ok", giri_ciechi: 0, canale: "Stripe API", dettaglio: "balance API ok", ultimo_ok: "2026-08-10 14:20", ultimo_errore: "" },
    },
    meta: { giri_totali: 10 },
  };
  writeFileSync(copia, JSON.stringify(tuttiOk, null, 2) + "\n");
  const prima = readFileSync(copia, "utf8");

  lanciaSenzaChiavi(copia);

  const dopo = readFileSync(copia, "utf8");
  assert.equal(dopo, prima, "lo stato «tutto ok» misurato dal VPS è stato sovrascritto da chi non aveva le chiavi");
});

// ── Il motivo per cui non si chiudeva: il voto ────────────────────────────────
prova("il voto che apre la porta esclude chi non dipende dall'ambiente", () => {
  const src = readFileSync(VERIFICA, "utf8");
  // Il controllo del guardiano esterno legge un file nel repo, non una chiave: deve essere
  // marcato, e il voto deve filtrare sul marchio. Se qualcuno rimette il `some` su tutti i
  // controlli, il difetto torna — e il primo caso di questo file diventa rosso.
  assert.ok(/dipende_da_env:\s*false/.test(src), "il controllo che non legge chiavi non è più marcato");
  assert.ok(
    /filter\(\s*\(c\)\s*=>\s*c\.dipende_da_env\s*!==\s*false\s*\)/.test(src),
    "il voto non filtra più i controlli che non dipendono dall'ambiente"
  );
});

prova("un sensore non misurato conserva il valore di chi l'aveva misurato davvero", () => {
  const src = readFileSync(VERIFICA, "utf8");
  assert.ok(/non_misurato_qui/.test(src), "manca la marcatura del sensore lasciato intatto");
  assert.ok(
    /const esistente = structuredClone\(cecita\)/.test(src),
    "senza la copia di com'era prima, il valore vecchio non è più recuperabile a fine giro"
  );
});

// ── La prova che la prova non sia vacua ──────────────────────────────────────
prova("il metro sa dire di SÌ: con una chiave presente il file si scrive", () => {
  const dir = mkdtempSync(join(tmpdir(), "sensori-si-"));
  const copia = join(dir, "sensori-cecita.json");
  copyFileSync(VERO, copia);
  const prima = readFileSync(copia, "utf8");

  const env = { ...process.env, SENSORI_CECITA_FILE: copia };
  for (const k of CHIAVI) delete env[k];
  // Una chiave finta ma presente: l'ambiente ora è "di questo dominio", la porta deve aprirsi.
  env.MARKETPLACE_SUPABASE_URL = "https://esempio-non-esiste.supabase.co";
  env.MARKETPLACE_SUPABASE_KEY = "chiave-finta-per-la-prova";
  try {
    execFileSync("node", [VERIFICA], { env, encoding: "utf8", timeout: 240000, stdio: ["ignore", "pipe", "pipe"] });
  } catch { /* l'esito rosso è previsto: la chiave è finta */ }

  const dopo = readFileSync(copia, "utf8");
  assert.notEqual(dopo, prima, "con una chiave del dominio presente il file DEVE aggiornarsi, o la porta è murata");
});

// ── AR-749: quando la misura NON può entrare al posto dell'altra, deve entrare ACCANTO ──────────
//
// Il verdetto di `scrittura-misura.mjs` ha tre risposte, non due: sì, no, e «no ma la metto accanto».
// Il testo del motivo lo diceva alla lettera — «la metto accanto, non al posto» — e nessuno la
// metteva accanto: il chiamante guardava solo `scrivi`. Da una macchina con meno chiavi del server
// il quadro dei sensori non entrava da nessuna parte.
//
// ⚠️ Questo caso NON guarda il file vero. Ci ho provato, e la prova passava per la strada sbagliata:
// oggi quel file è scritto da «cloud», la corsa di prova è anch'essa «cloud», e con la stessa
// provenienza il verdetto è «scrivi», non «affianca» — il ramo che voglio provare non veniva
// nemmeno percorso. Una prova che dipende da come è il mondo stamattina non prova la cura.
// Qui la misura di partenza è costruita a mano: scritta dal server, con più copertura.
prova("la misura che non può sostituire quella del server finisce ACCANTO, non per terra", () => {
  const dir = mkdtempSync(join(tmpdir(), "sensori-accanto-"));
  const copia = join(dir, "sensori-cecita.json");
  const delServer = {
    origine: "vps",
    copertura: 18,
    scritto_da: "verifica-sensori.mjs",
    sensori: { mcp_supabase: { stato: "ok" }, sito_uptime: { stato: "ok" } },
    meta: {},
  };
  writeFileSync(copia, `${JSON.stringify(delServer, null, 2)}\n`);

  const env = { ...process.env, SENSORI_CECITA_FILE: copia, MYCITY_ORIGINE: "cloud" };
  for (const k of CHIAVI) env[k] = "";
  env.MARKETPLACE_SUPABASE_URL = "https://esempio-non-esiste.supabase.co";
  env.MARKETPLACE_SUPABASE_KEY = "chiave-finta-per-la-prova";
  try {
    execFileSync("node", [VERIFICA], { env, encoding: "utf8", timeout: 240000, stdio: ["ignore", "pipe", "pipe"] });
  } catch { /* l'esito rosso è previsto: la chiave è finta */ }

  const dopo = JSON.parse(readFileSync(copia, "utf8"));
  assert.equal(dopo.origine, "vps", "il quadro autorevole non si tocca: resta quello del server");
  assert.equal(dopo.copertura, 18, "e la sua copertura nemmeno");
  assert.ok(dopo.misure_affiancate, "la misura rifiutata deve essere finita ACCANTO, non per terra");
  assert.ok(dopo.misure_affiancate.cloud, "e sotto il nome di chi l'ha presa");
  assert.ok(
    Number(dopo.misure_affiancate.cloud.copertura) < 18,
    "accanto ci va la misura povera, con la sua copertura dichiarata",
  );
});

const rossi = casi.filter((c) => !c.ok);
console.log(`TAP version 13\n1..${casi.length}`);
casi.forEach((c, i) => console.log(`${c.ok ? "ok" : "not ok"} ${i + 1} - ${c.nome}${c.ok ? "" : `\n  # ${c.err}`}`));
console.log(`# pass ${casi.length - rossi.length}`);
console.log(`# fail ${rossi.length}`);
process.exit(rossi.length ? 1 : 0);
