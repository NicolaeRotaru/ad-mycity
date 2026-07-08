// Corsia CONFIG di "modifica il marketplace parlando": legge/scrive la configurazione del sito
// (site_settings: branding/home + tabelle coupon, categorie, ...) SENZA deploy.
// SICUREZZA: DRY-RUN di default. Prima di OGNI scrittura salva un BACKUP VERSIONATO del valore attuale
// (mai sovrascritto: una seconda modifica sulla stessa riga non cancella l'undo) + un manifest di batch.
// Undo: `annulla <tabella> <id>` (una riga) · `annulla-batch <batch>` (tutto il lotto).
// Servono: MARKETPLACE_SUPABASE_URL + MARKETPLACE_SUPABASE_WRITE_KEY (service_role) + AZIONI_LIVE=1 per scrivere.
// AR-103: e in più il cancello di consenso per-azione (cervello/consenso-azione.mjs): la scrittura reale
// parte solo se PAUSA off + AZIONE_ID firmato in AZIONI-IN-ATTESA.md + tabella sbloccata in mani-allowlist.json.
//
// Uso:
//   node marketplace.mjs                                  -> stato
//   node marketplace.mjs leggi                            -> mostra site_settings (branding/home)
//   node marketplace.mjs branding '<json>'                -> aggiorna site_settings.branding (con backup)
//   node marketplace.mjs home '<json>'                    -> aggiorna site_settings.home_site (con backup)
//   node marketplace.mjs inserisci <tabella> '<json>'     -> es. coupons, categories
//   node marketplace.mjs aggiorna <tabella> <id> '<json>' -> aggiorna una riga (con backup)

import { mkdirSync, writeFileSync, readdirSync, readFileSync, appendFileSync, existsSync } from "node:fs";
import { consensoInvio } from "./consenso-azione.mjs";

const URL = process.env.MARKETPLACE_SUPABASE_URL;
const KEY = process.env.MARKETPLACE_SUPABASE_WRITE_KEY;
const LIVE = process.env.AZIONI_LIVE === "1" || process.env.AZIONI_LIVE === "on";
// AR-103: la scrittura reale sul DB è agganciata alla casella firmata (env AZIONE_ID) e alla
// allowlist delle tabelle sbloccate. Fail-closed: senza consenso → resta DRY-RUN.
const AZIONE_ID = process.env.AZIONE_ID || "(non collegata a AZIONI-IN-ATTESA)";
async function scritturaAutorizzata(tabella) {
  if (!LIVE || !can()) return { live: false, motivo: "DRY-RUN (AZIONI_LIVE off o chiavi assenti)" };
  return consensoInvio({ azioneId: AZIONE_ID, canale: "marketplace", destinatario: tabella });
}
// Path ASSOLUTO rispetto alla radice del repo (non alla cwd): il backup va sempre nello stesso posto.
const BACKUP_DIR = new URL("../creativi/output/marketplace-backup", import.meta.url).pathname;

const can = () => URL && KEY;
const h = () => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" });

function stato() {
  console.log("Corsia CONFIG marketplace (modifica senza deploy):");
  console.log(`  write key:   ${can() ? "configurato" : "NON configurato (manca MARKETPLACE_SUPABASE_WRITE_KEY)"}`);
  console.log(`  modalita':   ${LIVE && can() ? "LIVE (scrive solo cio' che e' firmato)" : "DRY-RUN (non scrive nulla)"}`);
  console.log(`  cancello:    AR-103 consenso per-azione (PAUSA + AZIONE_ID firmato + tabella in mani-allowlist.json)`);
  console.log("\nLeggi sempre prima: node marketplace.mjs leggi");
}

async function leggi() {
  if (!can()) return console.log("[DRY-RUN] leggerei site_settings (id=1): branding + home_site. Configura le chiavi per vederlo.");
  const r = await fetch(`${URL}/rest/v1/site_settings?id=eq.1&select=branding,home_site`, { headers: h(), cache: "no-store" });
  console.log(r.ok ? JSON.stringify(await r.json(), null, 2) : `Errore: ${r.status} ${(await r.text()).slice(0, 200)}`);
}

// Backup VERSIONATO (pre-mortem: mai sovrascrivere l'undo). Ogni scrittura crea un file NUOVO
// con timestamp: una seconda modifica sulla stessa riga NON cancella il backup precedente, così
// si può sempre tornare al valore ORIGINALE. In più ogni riga viene registrata in un MANIFEST
// append-only del batch (BATCH_ID o data del giorno) → rollback di un intero lotto con `annulla-batch`.
function tsFile() {
  return new Date().toISOString().replace(/[:.]/g, "-"); // 2026-07-08T22-33-05-123Z, sicuro come nome file
}
function backup(nome, dato) {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const ts = tsFile();
  const f = `${BACKUP_DIR}/${nome}.${ts}.json`;
  writeFileSync(f, JSON.stringify({ nome, ts, valore: dato ?? null }, null, 2), { flag: "wx" });
  const batch = (process.env.BATCH_ID || ts.slice(0, 10)).replace(/[^a-z0-9_-]/gi, "_");
  appendFileSync(`${BACKUP_DIR}/manifest-${batch}.jsonl`, JSON.stringify({ nome, ts, file: `${nome}.${ts}.json` }) + "\n");
  console.log(`Backup salvato: ${f} (versionato, mai sovrascritto — batch: ${batch})`);
}

// Trova il backup PIÙ VECCHIO di una riga = il valore ORIGINALE pre-prima-modifica (per annullare
// del tutto una serie di autofill). I file sono ordinabili per nome perché il timestamp è ISO.
function backupOriginale(nome) {
  if (!existsSync(BACKUP_DIR)) return null;
  const files = readdirSync(BACKUP_DIR).filter((x) => x.startsWith(`${nome}.`) && x.endsWith(".json")).sort();
  return files.length ? `${BACKUP_DIR}/${files[0]}` : null;
}

async function applicaRipristino(tabella, id, orig, sorgente) {
  if (!LIVE || !can()) return console.log(`[DRY-RUN] ripristinerei ${tabella} id=${id} a:\n${JSON.stringify(orig, null, 2)}\n  (backup: ${sorgente}) — rilancia con AZIONI_LIVE=1 per applicare.`);
  const r = await fetch(`${URL}/rest/v1/${tabella}?id=eq.${id}`, { method: "PATCH", headers: { ...h(), Prefer: "return=minimal" }, body: JSON.stringify(orig ?? {}) });
  console.log(r.ok ? `OK: ${tabella} id=${id} ripristinato (${sorgente}).` : `Errore: ${r.status} ${(await r.text()).slice(0, 200)}`);
}

async function ripristinaRiga(tabella, id) {
  const f = backupOriginale(`${tabella}.${id}`);
  if (!f) return console.log(`Nessun backup per ${tabella} id=${id}: niente da annullare.`);
  await applicaRipristino(tabella, id, JSON.parse(readFileSync(f, "utf8")).valore, f);
}

async function ripristinaBatch(batch) {
  const b = String(batch || "").replace(/[^a-z0-9_-]/gi, "_");
  const mf = `${BACKUP_DIR}/manifest-${b}.jsonl`;
  if (!existsSync(mf)) return console.log(`Manifest non trovato: ${mf}. Batch disponibili:\n  ${(existsSync(BACKUP_DIR) ? readdirSync(BACKUP_DIR).filter((x) => x.startsWith("manifest-")) : []).join("\n  ") || "(nessuno)"}`);
  const righe = readFileSync(mf, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
  // Prima occorrenza per (tabella.id) = backup scritto PRIMA della prima modifica del batch = valore a inizio batch.
  const perRiga = new Map();
  for (const r of righe) if (!perRiga.has(r.nome)) perRiga.set(r.nome, r);
  console.log(`Batch ${b}: ${perRiga.size} righe da riportare al valore di inizio batch.`);
  for (const [nome, r] of perRiga) {
    const [tabella, id] = nome.split(/\.(.+)/); // split sul PRIMO punto (id può contenere punti)
    const f = `${BACKUP_DIR}/${r.file}`;
    if (!existsSync(f)) { console.log(`  ⚠️ backup mancante per ${nome} (${r.file}) — salto.`); continue; }
    await applicaRipristino(tabella, id, JSON.parse(readFileSync(f, "utf8")).valore, f);
  }
}

async function setSettings(campo, jsonStr) {
  let val; try { val = JSON.parse(jsonStr || ""); } catch { return console.log(`JSON non valido. Uso: ${campo === "branding" ? "branding" : "home"} '<json>'`); }
  const g = await scritturaAutorizzata("site_settings");
  if (!g.live) return console.log(`[DRY-RUN] aggiornerei site_settings.${campo} =\n${JSON.stringify(val, null, 2)}${LIVE && can() ? `\n  (bloccato: ${g.motivo})` : ""}`);
  const cur = await (await fetch(`${URL}/rest/v1/site_settings?id=eq.1&select=${campo}`, { headers: h() })).json();
  backup(`site_settings.${campo}`, cur?.[0]?.[campo]);
  const r = await fetch(`${URL}/rest/v1/site_settings?id=eq.1`, { method: "PATCH", headers: { ...h(), Prefer: "return=minimal" }, body: JSON.stringify({ [campo]: val }) });
  console.log(r.ok ? `OK: site_settings.${campo} aggiornato (backup salvato).` : `Errore: ${r.status} ${(await r.text()).slice(0, 200)}`);
}

async function inserisci(tabella, jsonStr) {
  let val; try { val = JSON.parse(jsonStr || ""); } catch { return console.log("JSON non valido."); }
  if (!/^[a-z_]+$/.test(tabella || "")) return console.log("Tabella non valida. Es: inserisci coupons '<json>'");
  const g = await scritturaAutorizzata(tabella);
  if (!g.live) return console.log(`[DRY-RUN] inserirei in ${tabella}:\n${JSON.stringify(val, null, 2)}${LIVE && can() ? `\n  (bloccato: ${g.motivo})` : ""}`);
  const r = await fetch(`${URL}/rest/v1/${tabella}`, { method: "POST", headers: { ...h(), Prefer: "return=minimal" }, body: JSON.stringify(val) });
  console.log(r.ok ? `OK: riga inserita in ${tabella}.` : `Errore: ${r.status} ${(await r.text()).slice(0, 200)}`);
}

async function aggiorna(tabella, id, jsonStr) {
  let val; try { val = JSON.parse(jsonStr || ""); } catch { return console.log("JSON non valido."); }
  if (!/^[a-z_]+$/.test(tabella || "") || !id) return console.log("Uso: aggiorna <tabella> <id> '<json>'");
  const g = await scritturaAutorizzata(tabella);
  if (!g.live) return console.log(`[DRY-RUN] aggiornerei ${tabella} id=${id}:\n${JSON.stringify(val, null, 2)}${LIVE && can() ? `\n  (bloccato: ${g.motivo})` : ""}`);
  const cur = await (await fetch(`${URL}/rest/v1/${tabella}?id=eq.${id}`, { headers: h() })).json();
  backup(`${tabella}.${id}`, cur?.[0]);
  const r = await fetch(`${URL}/rest/v1/${tabella}?id=eq.${id}`, { method: "PATCH", headers: { ...h(), Prefer: "return=minimal" }, body: JSON.stringify(val) });
  console.log(r.ok ? `OK: ${tabella} id=${id} aggiornato (backup salvato).` : `Errore: ${r.status} ${(await r.text()).slice(0, 200)}`);
}

const [cmd, ...rest] = process.argv.slice(2);
if (!cmd) stato();
else if (cmd === "leggi") await leggi();
else if (cmd === "branding") await setSettings("branding", rest[0]);
else if (cmd === "home") await setSettings("home_site", rest[0]);
else if (cmd === "inserisci") await inserisci(rest[0], rest[1]);
else if (cmd === "aggiorna") await aggiorna(rest[0], rest[1], rest[2]);
else if (cmd === "annulla") await ripristinaRiga(rest[0], rest[1]);
else if (cmd === "annulla-batch") await ripristinaBatch(rest[0]);
else console.log("Comandi: (niente) | leggi | branding '<json>' | home '<json>' | inserisci <tabella> '<json>' | aggiorna <tabella> <id> '<json>' | annulla <tabella> <id> | annulla-batch <batch>");
