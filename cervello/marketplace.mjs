// Corsia CONFIG di "modifica il marketplace parlando": legge/scrive la configurazione del sito
// (site_settings: branding/home + tabelle coupon, categorie, ...) SENZA deploy.
// SICUREZZA: DRY-RUN di default. Prima di OGNI scrittura salva un BACKUP del valore attuale (undo facile).
// Servono: MARKETPLACE_SUPABASE_URL + MARKETPLACE_SUPABASE_WRITE_KEY (service_role) + AZIONI_LIVE=1 per scrivere.
//
// Uso:
//   node marketplace.mjs                                  -> stato
//   node marketplace.mjs leggi                            -> mostra site_settings (branding/home)
//   node marketplace.mjs branding '<json>'                -> aggiorna site_settings.branding (con backup)
//   node marketplace.mjs home '<json>'                    -> aggiorna site_settings.home_site (con backup)
//   node marketplace.mjs inserisci <tabella> '<json>'     -> es. coupons, categories
//   node marketplace.mjs aggiorna <tabella> <id> '<json>' -> aggiorna una riga (con backup)

import { mkdirSync, writeFileSync } from "node:fs";

const URL = process.env.MARKETPLACE_SUPABASE_URL;
const KEY = process.env.MARKETPLACE_SUPABASE_WRITE_KEY;
const LIVE = process.env.AZIONI_LIVE === "1";
const BACKUP_DIR = "creativi/output/marketplace-backup";

const can = () => URL && KEY;
const h = () => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" });

function stato() {
  console.log("Corsia CONFIG marketplace (modifica senza deploy):");
  console.log(`  write key:   ${can() ? "configurato" : "NON configurato (manca MARKETPLACE_SUPABASE_WRITE_KEY)"}`);
  console.log(`  modalita':   ${LIVE && can() ? "LIVE (scrive davvero)" : "DRY-RUN (non scrive nulla)"}`);
  console.log("\nLeggi sempre prima: node marketplace.mjs leggi");
}

async function leggi() {
  if (!can()) return console.log("[DRY-RUN] leggerei site_settings (id=1): branding + home_site. Configura le chiavi per vederlo.");
  const r = await fetch(`${URL}/rest/v1/site_settings?id=eq.1&select=branding,home_site`, { headers: h(), cache: "no-store" });
  console.log(r.ok ? JSON.stringify(await r.json(), null, 2) : `Errore: ${r.status} ${(await r.text()).slice(0, 200)}`);
}

function backup(nome, dato) {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const f = `${BACKUP_DIR}/${nome}.json`;
  writeFileSync(f, JSON.stringify(dato ?? null, null, 2));
  console.log(`Backup salvato: ${f} (per annullare la modifica)`);
}

async function setSettings(campo, jsonStr) {
  let val; try { val = JSON.parse(jsonStr || ""); } catch { return console.log(`JSON non valido. Uso: ${campo === "branding" ? "branding" : "home"} '<json>'`); }
  if (!LIVE || !can()) return console.log(`[DRY-RUN] aggiornerei site_settings.${campo} =\n${JSON.stringify(val, null, 2)}`);
  const cur = await (await fetch(`${URL}/rest/v1/site_settings?id=eq.1&select=${campo}`, { headers: h() })).json();
  backup(`site_settings.${campo}`, cur?.[0]?.[campo]);
  const r = await fetch(`${URL}/rest/v1/site_settings?id=eq.1`, { method: "PATCH", headers: { ...h(), Prefer: "return=minimal" }, body: JSON.stringify({ [campo]: val }) });
  console.log(r.ok ? `OK: site_settings.${campo} aggiornato (backup salvato).` : `Errore: ${r.status} ${(await r.text()).slice(0, 200)}`);
}

async function inserisci(tabella, jsonStr) {
  let val; try { val = JSON.parse(jsonStr || ""); } catch { return console.log("JSON non valido."); }
  if (!/^[a-z_]+$/.test(tabella || "")) return console.log("Tabella non valida. Es: inserisci coupons '<json>'");
  if (!LIVE || !can()) return console.log(`[DRY-RUN] inserirei in ${tabella}:\n${JSON.stringify(val, null, 2)}`);
  const r = await fetch(`${URL}/rest/v1/${tabella}`, { method: "POST", headers: { ...h(), Prefer: "return=minimal" }, body: JSON.stringify(val) });
  console.log(r.ok ? `OK: riga inserita in ${tabella}.` : `Errore: ${r.status} ${(await r.text()).slice(0, 200)}`);
}

async function aggiorna(tabella, id, jsonStr) {
  let val; try { val = JSON.parse(jsonStr || ""); } catch { return console.log("JSON non valido."); }
  if (!/^[a-z_]+$/.test(tabella || "") || !id) return console.log("Uso: aggiorna <tabella> <id> '<json>'");
  if (!LIVE || !can()) return console.log(`[DRY-RUN] aggiornerei ${tabella} id=${id}:\n${JSON.stringify(val, null, 2)}`);
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
else console.log("Comandi: (niente) | leggi | branding '<json>' | home '<json>' | inserisci <tabella> '<json>' | aggiorna <tabella> <id> '<json>'");
