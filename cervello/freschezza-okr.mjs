#!/usr/bin/env node
// freschezza-okr.mjs — guardiano di freschezza OKR-Squadra.md (AR-115).
// Target con data scaduta, documento stantio o riferimenti faro obsoleti ⇒ vincolo HARD al giro.
//
// Uso: node cervello/freschezza-okr.mjs
// Exit: 0 = OKR allineato alla fase corrente · 1 = stantio/scaduto → stringa vincolo su stdout

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const OKR = join(AD_ROOT, "MyCity-Vault/05-Soldi-Rischi/OKR-Squadra.md");
const REGISTRO = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/registro-fatti.json");
const MAX_GIORNI = Number(process.env.OKR_MAX_GIORNI || 7);

/** Riferimenti faro superati — generici «faro» ok, nomi prospect/demo no. */
const FARO_OBSOLETI = ["Garetti", "Casa Linda", "demo Casa Linda"];

function leggiAggiornato(contenuto) {
  const m = contenuto.match(/^aggiornato:\s*(.+)$/m);
  return m ? m[1].trim() : null;
}

function giorniDa(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return Infinity;
  return (Date.now() - d.getTime()) / 86400000;
}

function oggiRoma() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t) => Number(parts.find((p) => p.type === t)?.value);
  return { y: get("year"), m: get("month"), d: get("day") };
}

/** dd/mm (opz. «sab» prima) → Date a mezzanotte Europe/Rome; anno = corrente se già passato. */
function parseDataBreve(testo, ref = oggiRoma()) {
  const m = testo.match(/(?:entro\s+)?(?:lun|mar|mer|gio|ven|sab|dom)?\s*(\d{1,2})\/(\d{1,2})/i);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;
  return new Date(Date.UTC(ref.y, month - 1, day));
}

function targetScaduti(contenuto) {
  const ref = oggiRoma();
  const oggi = new Date(Date.UTC(ref.y, ref.m - 1, ref.d));
  const scaduti = [];
  for (const line of contenuto.split("\n")) {
    if (!line.includes("|") || !/\d{1,2}\/\d{1,2}/.test(line)) continue;
    const cells = line.split("|").map((c) => c.trim());
    const target = cells.find((c) => /\d{1,2}\/\d{1,2}/.test(c));
    if (!target) continue;
    const data = parseDataBreve(target, ref);
    if (data && data < oggi) scaduti.push(target.replace(/\s+/g, " ").slice(0, 72));
  }
  return [...new Set(scaduti)];
}

function faroObsoleti(contenuto) {
  const lower = contenuto.toLowerCase();
  return FARO_OBSOLETI.filter((nome) => lower.includes(nome.toLowerCase()));
}

function vincolo(problemi) {
  const elenco = problemi.slice(0, 4).join(" · ");
  return (
    `⛔ AR-115: OKR-SQUADRA NON ALLINEATO (${elenco}). ` +
    `VINCOLO: in questo giro riscrivi MyCity-Vault/05-Soldi-Rischi/OKR-Squadra.md per la fase attuale ` +
    `(0→1, faro Pane Quotidiano, North Star = 1° ordine pagato/consegnato): aggiorna ogni target con data futura o metrica senza scadenza passata, ` +
    `allinea la riga AD e la fase in testa, poi aggiorna il campo 'aggiornato:' nel frontmatter.`
  );
}

async function main() {
  const quando = nowPiacenza();

  if (!existsSync(OKR)) {
    const msg = vincolo(["file assente"]);
    console.log(msg);
    await stampSegnale("freschezza-okr", "errore", `OKR assente · ${quando}`);
    process.exit(1);
  }

  const contenuto = readFileSync(OKR, "utf8");
  const problemi = [];

  const aggiornato = leggiAggiornato(contenuto);
  const giorni = aggiornato ? giorniDa(aggiornato) : Infinity;
  if (giorni > MAX_GIORNI) {
    const eta = isFinite(giorni) ? `${Math.floor(giorni)}g` : "data sconosciuta";
    problemi.push(`aggiornato ${eta} fa (max ${MAX_GIORNI}g)`);
  }

  const scaduti = targetScaduti(contenuto);
  if (scaduti.length) problemi.push(`${scaduti.length} target scaduti (es. «${scaduti[0]}»)`);

  const obsoleti = faroObsoleti(contenuto);
  if (obsoleti.length) problemi.push(`faro obsoleto: ${obsoleti.join(", ")}`);

  if (problemi.length) {
    console.log(vincolo(problemi));
    await stampSegnale("freschezza-okr", "warn", `${problemi.join(" · ")} · ${quando}`);
    process.exit(1);
  }

  console.log(
    `✅ OKR-Squadra.md allineato (aggiornato: ${aggiornato ?? "n/d"}, ${Math.round(giorni * 10) / 10}g fa).`
  );
  await stampSegnale("freschezza-okr", "ok", `fresco · ${quando}`);
  process.exit(0);
}

main().catch(async (e) => {
  await stampSegnale("freschezza-okr", "errore", `crash: ${(e.message || e).toString().slice(0, 160)}`);
  console.error("ERRORE freschezza-okr:", e.message || e);
  process.exit(1);
});
