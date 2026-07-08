// AR-103 — Cancello di CONSENSO PER-AZIONE (fail-closed) per le mani reali dell'AD.
//
// Problema (pre-mortem auto-radiografia): AZIONI_LIVE=1 è un UNICO switch globale. Appena
// Nicola lo mette a 1 per provare una chiave, OGNI chiamata di esegui-azione.mjs / marketplace.mjs
// in quell'ambiente invia DAVVERO — comprese quelle generate dall'AI in un giro o dal worker.
// Il cancello 🟢🟡🔴 era solo una CONVENZIONE (accoda→firma), non imposta dal codice.
//
// Difesa (firmata da Nicola, 🟡): prima di inviare in LIVE l'esecutore DEVE
//   1) ri-controllare la PAUSA dal Pannello (kill-switch), fail-closed;
//   2) rileggere AZIONI-IN-ATTESA.md e rifiutare se l'AZIONE_ID non esiste o non è APPROVATO;
//   3) verificare il destinatario contro una allowlist (tutto in DRY-RUN forzato finché non sbloccato).
// Così "LIVE" non significa più "tutto parte", ma "parte solo ciò che Nicola ha firmato riga per riga".
//
// Import puri (nessun effetto): usato da esegui-azione.mjs e marketplace.mjs.

import fs from "node:fs";
import { fileURLToPath } from "node:url";

const CODA = fileURLToPath(new URL("../MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md", import.meta.url));
const ALLOWLIST = fileURLToPath(new URL("./mani-allowlist.json", import.meta.url));

// ─────────────────────────────────────────────────────────────────────────────
// Codici casella — MIRROR 1:1 di pannello/src/lib/azioni-attesa.ts (idSezione + codiceAzione +
// parseHeading). Tenuti identici così il codice #A42 che l'esecutore calcola combacia con quello
// che Nicola vede sul Pannello. Anti-drift: cervello/test/consenso-azione.bats pinza gli output.
const DATA_RE = /\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2})?/;

export function idSezione(data, reparto, titolo) {
  const s = `${data}|${reparto}|${titolo}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return "S" + (h >>> 0).toString(36);
}

export function codiceAzione(id) {
  let h = 0;
  const s = id || "";
  for (let i = 0; i < s.length; i++) h = (Math.imul(131, h) + s.charCodeAt(i)) | 0;
  const u = h >>> 0;
  const lettera = String.fromCharCode(65 + (u % 26)); // A-Z
  const numero = Math.floor(u / 26) % 100; // 00-99
  return `#${lettera}${String(numero).padStart(2, "0")}`;
}

function parseHeading(heading) {
  const h = heading.replace(/^#{2,3}\s+/, "").trim();
  const parti = h.split("·").map((p) => p.trim());
  let data = "";
  let reparto = "";
  const resto = [];
  for (const p of parti) {
    if (!data && DATA_RE.test(p) && /^\d{4}-\d{2}-\d{2}/.test(p)) {
      data = (p.match(DATA_RE) || [""])[0];
    } else if (!reparto && p.startsWith("@")) {
      reparto = p.replace(/^@/, "");
    } else {
      resto.push(p);
    }
  }
  let titolo = resto.join(" · ").trim();
  if (!reparto) {
    const m = titolo.match(/@([a-z0-9-]+)/i) || titolo.match(/\(@?([a-z]+-[a-z]+)\)/);
    if (m) reparto = m[1];
  }
  titolo = titolo.replace(/^[🟢🟡🔴]\s*/, "").trim();
  return { data, reparto, titolo };
}

// ─────────────────────────────────────────────────────────────────────────────
// Lettura + parsing della coda in blocchi ## / ###.
export function leggiCoda() {
  try {
    return fs.readFileSync(CODA, "utf8");
  } catch {
    return "";
  }
}

export function blocchiCoda(md) {
  const righe = (md || "").split("\n");
  const out = [];
  let cur = null;
  const chiudi = () => {
    if (!cur) return;
    const blocco = cur.heading + "\n" + cur.corpo.join("\n");
    const { data, reparto, titolo } = parseHeading(cur.heading);
    const id = idSezione(data, reparto, titolo);
    out.push({ heading: cur.heading, blocco, id, code: codiceAzione(id) });
    cur = null;
  };
  for (const r of righe) {
    if (/^#{2,3}\s+/.test(r)) {
      chiudi();
      cur = { heading: r, corpo: [] };
    } else if (cur) {
      cur.corpo.push(r);
    }
  }
  chiudi();
  return out;
}

// Normalizza un id/codice per il confronto: "#A42" | "a42" | " A42 " → "A42".
function normCode(s) {
  return String(s || "").trim().replace(/^#/, "").toUpperCase();
}

// Escape per costruire una regex letterale (fallback su id umani tipo "#38", "R2", "A18").
function escapeRe(s) {
  return String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Trova il blocco dell'azione dato un AZIONE_ID. Ordine di match:
//  1) id stabile "S<hash>" identico;
//  2) codice casella "#A42" (identico a quello del Pannello);
//  3) fallback: token letterale nel HEADING (es. "#38", "A18", "R2") come parola intera.
// Ritorna il blocco o null. Fail-closed: nessun match → null → invio bloccato.
export function trovaAzione(md, azioneId) {
  const blocchi = blocchiCoda(md);
  const raw = String(azioneId || "").trim();
  if (!raw) return null;
  const nc = normCode(raw);

  // 1) id stabile o codice calcolato
  for (const b of blocchi) {
    if (raw === b.id) return b;
    if (nc === normCode(b.code)) return b;
  }
  // 2) fallback: token letterale nell'heading (id umani non-hash)
  const tok = new RegExp(`(^|[^\\w#])#?${escapeRe(nc)}(?![\\w])`, "i");
  for (const b of blocchi) {
    if (tok.test(b.heading)) return b;
  }
  return null;
}

// Un blocco è APPROVATO se porta un segnale ESPLICITO di firma di Nicola. Fail-closed:
// "in attesa di firma" da solo NON basta; serve un marcatore di approvazione.
//  a) token macchina  {approvato:...} / {ok:...} / {firmato:...}
//  b) parola APPROVATA/APPROVATO (word boundary → non matcha l'infinito "approvare")
//  c) riga-campo  Stato:/Approvazione:/Approvato da: che contiene "approvat"
//  d) checkbox spuntata  [x] 🟡/🔴
export function approvata(blocco) {
  const b = String(blocco || "");
  if (/\{\s*(?:approvat[oa]|ok|firmato)\s*[:#]/i.test(b)) return true;
  if (/\bAPPROVAT[AO]\b/.test(b)) return true;
  if (/^[\s>*\-]*\*{0,2}(?:stato|approvazione|approvato da)\*{0,2}\s*:.*approvat/im.test(b)) return true;
  if (/\[[xX]\]\s*[🔴🟡]/.test(b)) return true;
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAUSA kill-switch dentro l'esecutore (non solo giro.sh) — FAIL-CLOSED come AR-100.
export async function pausaAttiva() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    return { bloccante: true, motivo: "PAUSA non verificabile (SUPABASE_URL/KEY assenti) → fail-closed" };
  }
  try {
    const r = await fetch(`${url}/rest/v1/impostazioni?select=valore&chiave=eq.pausa&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!r.ok) return { bloccante: true, motivo: `PAUSA non verificabile (HTTP ${r.status}) → fail-closed` };
    const j = await r.json();
    const on = Array.isArray(j) && j[0] && String(j[0].valore) === "on";
    if (on) return { bloccante: true, motivo: "AD in PAUSA (kill-switch dal Pannello) → invio bloccato" };
    return { bloccante: false, motivo: "pausa off" };
  } catch (e) {
    return { bloccante: true, motivo: `PAUSA non verificabile (${e.message}) → fail-closed` };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Allowlist destinatari — tutto in DRY-RUN forzato finché Nicola non sblocca esplicitamente.
function leggiAllowlist() {
  try {
    return JSON.parse(fs.readFileSync(ALLOWLIST, "utf8"));
  } catch {
    return {};
  }
}

export function destinatarioAmmesso(canale, dest) {
  const al = leggiAllowlist();
  const inList = (arr, v) =>
    Array.isArray(arr) && arr.map((x) => String(x).toLowerCase()).includes(String(v || "").toLowerCase());
  switch (canale) {
    case "telegram":
      // Canale-proprietario: la chat è quella dell'env (solo Nicola). L'allarme all'owner non è
      // il pericolo del pre-mortem (email/notifica al CLIENTE sbagliato) → ammesso se configurato.
      return dest ? { ok: true } : { ok: false, motivo: "Telegram: TELEGRAM_CHAT_ID assente" };
    case "email":
      return inList(al.email, dest)
        ? { ok: true }
        : { ok: false, motivo: `email "${dest}" non in allowlist — aggiungila a mani-allowlist.json → "email"` };
    case "notifica":
      return inList(al.notifica_user, dest)
        ? { ok: true }
        : { ok: false, motivo: `utente "${dest}" non in allowlist — aggiungilo a mani-allowlist.json → "notifica_user"` };
    case "n8n":
      return al.n8n === true
        ? { ok: true }
        : { ok: false, motivo: 'canale n8n non sbloccato — imposta mani-allowlist.json → "n8n": true' };
    case "github":
      return al.github === true
        ? { ok: true }
        : { ok: false, motivo: 'merge PR non sbloccato — imposta mani-allowlist.json → "github": true' };
    case "marketplace":
      return inList(al.marketplace_tables, dest)
        ? { ok: true }
        : { ok: false, motivo: `tabella "${dest}" non sbloccata — aggiungila a mani-allowlist.json → "marketplace_tables"` };
    default:
      return { ok: false, motivo: `canale "${canale}" sconosciuto → bloccato` };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Cancello unico usato dagli esecutori. Ritorna { live, motivo }.
//  live=true  → l'invio reale è autorizzato (pausa off + azione firmata + destinatario sbloccato).
//  live=false → NON inviare: degrada a DRY-RUN, stampando `motivo`.
export async function consensoInvio({ azioneId, canale, destinatario }) {
  // 1) PAUSA (kill-switch) — fail-closed.
  const p = await pausaAttiva();
  if (p.bloccante) return { live: false, motivo: p.motivo };

  // 2) AZIONE_ID valido + APPROVATO in coda.
  const id = String(azioneId || "").trim();
  if (!id || /non collegat|non impostat|^\(/.test(id)) {
    return { live: false, motivo: "nessun AZIONE_ID: l'invio non è agganciato a una casella firmata (AZIONE_ID mancante)" };
  }
  const md = leggiCoda();
  const blk = trovaAzione(md, id);
  if (!blk) {
    return { live: false, motivo: `AZIONE_ID "${id}" non trovato in AZIONI-IN-ATTESA.md → invio bloccato` };
  }
  if (!approvata(blk.blocco)) {
    return { live: false, motivo: `azione "${id}" presente ma NON marcata APPROVATA da Nicola → invio bloccato` };
  }

  // 3) Destinatario in allowlist (DRY-RUN forzato finché non sbloccato).
  const a = destinatarioAmmesso(canale, destinatario);
  if (!a.ok) return { live: false, motivo: a.motivo };

  return { live: true, motivo: `consenso OK (casella ${blk.code} firmata, destinatario sbloccato, pausa off)` };
}
