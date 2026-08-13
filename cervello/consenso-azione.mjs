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

// Sovrascrivibile SOLO per provare il cancello su una coda finta (stessa ragione di
// SENSORI_CECITA_FILE, AR-284: una coda illeggibile va DIMOSTRATA facendola accadere, e non si può
// farla accadere sul file vero). Non allarga i permessi di nessuno: l'autorità che apre il cancello
// resta la firma di Nicola registrata in Supabase, che da questo file non passa.
const CODA = process.env.AZIONI_CODA_FILE || fileURLToPath(new URL("../MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md", import.meta.url));
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
    } else if (!data && /(?:accodat|refresh)/i.test(p) && DATA_RE.test(p)) {
      // «⏳ accodata …»: data di nascita in un pezzo etichettato (mirror 1:1 del Pannello —
      // se questa riga divergesse, l'id calcolato qui non troverebbe più la firma del Pannello).
      data = (p.match(DATA_RE) || [""])[0];
      resto.push(p);
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
  titolo = titolo.replace(/^[🟢🟡🔴⚠️✅❌️]+\s*/u, "").trim();
  // Il numero fisso della card («#41 — …»): letto senza toglierlo dal titolo (mirror del Pannello).
  const mNum = titolo.match(/^#(\d+)\s*[—–-]\s/);
  return { data, reparto, titolo, cartellino: mNum ? mNum[1] : "" };
}

// ─────────────────────────────────────────────────────────────────────────────
// Lettura + parsing della coda in blocchi ## / ###.
// AR-443 — «CODA VUOTA» E «CODA ILLEGGIBILE» NON SONO LA STESSA COSA.
//
// Prima qui c'era `catch { return "" }`: qualunque motivo per cui il file non si legge — non c'è,
// permessi, è una cartella, disco pieno — diventava una coda vuota. Da lì il cancello concludeva
// «AZIONE_ID non trovato in AZIONI-IN-ATTESA.md → invio bloccato». La DIREZIONE era giusta (niente
// parte, fail-closed), ma la MOTIVAZIONE era falsa: mandava chi indaga a cercare una card che magari
// c'è, invece che a guardare perché il file non si legge. Un cancello che sbaglia il motivo insegna
// a diffidare del motivo — e il giorno in cui il motivo è vero non lo crede più nessuno.
//
// Adesso: stringa = ho letto (anche se dentro non c'è niente) · null = NON ho potuto leggere.

/** @returns {{md: string|null, perche: string}} `md: null` = non letta, e `perche` dice perché. */
export function leggiCodaConMotivo() {
  try {
    return { md: fs.readFileSync(CODA, "utf8"), perche: "" };
  } catch (e) {
    return { md: null, perche: `${e.code || "errore"} su ${CODA}` };
  }
}

/** Il testo della coda, o `null` se non si è potuta leggere. */
export function leggiCoda() {
  return leggiCodaConMotivo().md;
}

/**
 * Perché questa azione non si trova — la decisione, pura, che prima era annegata nel cancello.
 *
 * Tre esiti e non due, come il contratto dei codici d'uscita (AR-322): l'ho trovata · l'ho cercata
 * e non c'è · non ho potuto cercarla. Il terzo è quello che mancava, ed è il solo in cui il posto
 * dove guardare non è la coda ma il file.
 *
 * @param {string|null} md il testo della coda, o `null` se illeggibile.
 * @param {string} azioneId
 * @param {string} perche il motivo tecnico dell'illeggibilità, da mostrare a chi indaga.
 * @returns {{blocco: object|null, leggibile: boolean, motivo: string}}
 */
export function cercaInCoda(md, azioneId, perche = "") {
  const id = String(azioneId || "").trim();
  if (md === null || md === undefined) {
    return {
      blocco: null,
      leggibile: false,
      motivo: `coda delle azioni NON leggibile (${perche || "motivo ignoto"}) → invio bloccato. Non sto dicendo che l'azione "${id}" non ci sia: sto dicendo che AZIONI-IN-ATTESA.md non si è potuto aprire — guarda il file, non la card.`,
    };
  }
  const blocco = trovaAzione(md, id);
  if (!blocco) {
    return { blocco: null, leggibile: true, motivo: `AZIONE_ID "${id}" non trovato in AZIONI-IN-ATTESA.md → invio bloccato` };
  }
  return { blocco, leggibile: true, motivo: "" };
}

export function blocchiCoda(md) {
  const righe = (md || "").split("\n");
  const out = [];
  let cur = null;
  const chiudi = () => {
    if (!cur) return;
    const blocco = cur.heading + "\n" + cur.corpo.join("\n");
    const { data, reparto, titolo, cartellino } = parseHeading(cur.heading);
    const id = idSezione(data, reparto, titolo);
    out.push({ heading: cur.heading, blocco, id, code: codiceAzione(id), cartellino });
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

  // Le righe-tabella sono card del formato vecchio, e sono ancora VIVE nella coda (22 il 13/8):
  // senza questo pezzo «ok 20» non le trovava, e il numero mostrato dal Pannello non apriva
  // nessuna casella. La prima colonna è il numero, la quarta il titolo — stesse celle che legge
  // `parseTabella` nel Pannello.
  for (const r of righe) {
    const m = r.match(/^\|\s*(\d+)\s*\|/);
    if (!m) continue;
    const celle = r.split("|").slice(1, -1).map((c) => c.trim());
    if (celle.length < 8) continue;
    const id = idSezione(celle[1], celle[2], celle[3]);
    out.push({ heading: r, blocco: r, id, code: codiceAzione(id), cartellino: m[1] });
  }
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

// Trova il blocco dell'azione dato un AZIONE_ID. Si accettano SOLO identificatori stabili:
//  1) id stabile "S<hash>" identico;
//  2) codice casella "#A42" (identico a quello del Pannello);
//  3) il numero fisso della card ("41" / "#41"), confrontato col CAMPO cartellino parsato
//     dall'intestazione — mai cercato come testo dentro il titolo.
// Ritorna il blocco o null. Fail-closed: nessun match → null → invio bloccato.
//
// AR-271 — QUI C'ERA UN TERZO TENTATIVO, ED È STATO TOLTO.
// Il fallback cercava il numero come "parola intera" dentro il TITOLO del blocco. Sembra innocuo,
// ma il titolo contiene anche gli orari: provato sulla coda vera, l'id «40» agganciava un blocco del
// 26 giugno solo perché il titolo conteneva «23:40» — e quel blocco risultava già firmato. Cioè: una
// firma data per un'azione poteva autorizzarne un'altra, scelta da una coincidenza tipografica.
// Un identificatore che combacia per caso non è un identificatore. Il numero fisso di oggi NON è
// quel fallback che ritorna: è un campo dichiarato nell'intestazione («#41 — …»), parsato una volta
// e confrontato per uguaglianza esatta. Un «40» che vive dentro un orario del titolo non ha mai
// la forma `#40 — ` in testa all'intestazione, quindi non può combaciare per caso.
export function trovaAzione(md, azioneId) {
  const blocchi = blocchiCoda(md);
  const raw = String(azioneId || "").trim();
  if (!raw) return null;
  const nc = normCode(raw);
  const num = /^#?\d+$/.test(raw) ? raw.replace(/^#/, "") : "";

  for (const b of blocchi) {
    if (raw === b.id) return b;
    if (nc === normCode(b.code)) return b;
    if (num && b.cartellino && num === b.cartellino) return b;
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
// AR-110 — LA FIRMA VIVE DOVE NICOLA LA METTE, E L'ESECUTORE LA LEGGE DA LÌ.
//
// Il difetto: quando Nicola preme «Approva» sul Pannello, la firma finisce in Supabase
// (impostazioni → azione:<id>). Il cancello qui sopra invece cercava un marcatore dentro
// AZIONI-IN-ATTESA.md, che NESSUNO scriveva. Risultato: o l'azione firmata degradava a DRY-RUN,
// o il worker — per farla funzionare — scriveva lui il marcatore nel file che poi il cancello
// verifica. Cioè: l'esecutore firmava se stesso. Due verità mai riconciliate.
//
// Il contratto, ora esplicito e in UNA sola direzione:
//   · chi firma:  il Pannello, e SOLO su un clic umano di Nicola;
//   · dove:       Supabase, chiave `azione:<id stabile>:firma`, valore "nicola AAAA-MM-GG HH:MM";
//   · chi legge:  l'esecutore (qui), che non può scriverla come prova di se stesso.
// L'autopilota del Pannello, che decide da solo sulle 🟢, scrive "auto …": esiste per lasciare
// traccia, ma NON vale come consenso — altrimenti bastava accendere l'autopilota per autorizzare
// un invio reale dalla CLI. Solo "nicola" apre il cancello.
//
// Fail-closed: memoria scollegata, rete giù, chiave assente o firma di chiunque altro → non
// firmata. Questa via si AGGIUNGE al marcatore nel file, non lo sostituisce.

const FIRMA_UMANA_RE = /^\s*nicola\b/i;

export async function firmaPannello(idAzione) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const id = String(idAzione || "").trim();
  if (!id) return { firmata: false, motivo: "id azione mancante" };
  if (!url || !key) return { firmata: false, motivo: "memoria non collegata (SUPABASE_URL/KEY assenti)" };
  const chiave = `azione:${id}:firma`;
  try {
    const r = await fetch(
      `${url}/rest/v1/impostazioni?select=valore&chiave=eq.${encodeURIComponent(chiave)}&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (!r.ok) return { firmata: false, motivo: `firma non verificabile (HTTP ${r.status})` };
    const j = await r.json();
    const valore = Array.isArray(j) && j[0] ? String(j[0].valore || "") : "";
    if (!valore) return { firmata: false, motivo: "nessuna firma dal Pannello" };
    if (!FIRMA_UMANA_RE.test(valore)) {
      return { firmata: false, motivo: `firma "${valore}" non è di Nicola (decisione automatica) → non vale come consenso` };
    }
    return { firmata: true, motivo: `firmata dal Pannello (${valore.trim()})` };
  } catch (e) {
    return { firmata: false, motivo: `firma non verificabile (${e.message})` };
  }
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
  // AR-443: la ricerca torna TRE esiti, non due — trovata · cercata e assente · non cercabile.
  // Resta fail-closed in tutti e tre (niente parte), ma il motivo che arriva a chi legge è quello
  // vero: nel terzo caso il posto dove guardare è il file, non la card.
  const { md, perche } = leggiCodaConMotivo();
  const ricerca = cercaInCoda(md, id, perche);
  const blk = ricerca.blocco;
  if (!blk) {
    return { live: false, motivo: ricerca.motivo };
  }
  // AR-205 — LA FIRMA È UNA SOLA, E NON LA SCRIVE CHI ESEGUE.
  //
  // Prima qui c'erano DUE strade: il marcatore nel file OPPURE la firma del Pannello — e il file
  // veniva controllato per primo, quindi bastava che ci fosse per non guardare mai la firma vera.
  // Il problema è che il marcatore nel file lo scrive la macchina stessa: la parola «APPROVATA», una
  // riga «Stato: approvato», una casella «[x] 🟡» finiscono in AZIONI-IN-ATTESA.md durante il normale
  // lavoro dei senior. Misurato sulla coda reale: 7 blocchi già «APPROVATA» e 14 caselle spuntate.
  // Cioè chi esegue poteva scriversi da solo il permesso di eseguire.
  //
  // Ora l'autorità è una sola: la firma registrata dal Pannello quando NICOLA clicca (Supabase,
  // `azione:<id>:firma` = "nicola …"). L'autopilota scrive "auto …" e NON apre il cancello.
  // Il testo nel file resta documentazione leggibile, non un permesso — `approvata()` continua a
  // esistere e a riconoscerlo, ma il suo verdetto non autorizza più niente.
  //
  // Fail-closed: memoria scollegata, rete giù o chiave assente ⇒ non firmata ⇒ invio bloccato. È più
  // restrittivo di prima ed è voluto: un'azione che tocca il mondo reale non parte «nel dubbio».
  const f = await firmaPannello(blk.id);
  if (!f.firmata) {
    const nota = approvata(blk.blocco)
      ? ` (in coda c'è un marcatore di approvazione, ma dal 27/7 il testo nel file NON vale come firma: lo può scrivere la macchina stessa — serve il clic di Nicola sul Pannello)`
      : "";
    return {
      live: false,
      motivo: `azione "${id}" presente ma NON firmata da Nicola dal Pannello (${f.motivo})${nota} → invio bloccato`,
    };
  }
  const dove = `casella ${blk.code} ${f.motivo}`;

  // 3) Destinatario in allowlist (DRY-RUN forzato finché non sbloccato).
  const a = destinatarioAmmesso(canale, destinatario);
  if (!a.ok) return { live: false, motivo: a.motivo };

  return { live: true, motivo: `consenso OK (${dove}, destinatario sbloccato, pausa off)` };
}
