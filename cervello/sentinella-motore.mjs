#!/usr/bin/env node
// 🕯️ SENTINELLA MOTORE — l'unica che veglia mentre la macchina è spenta.
//
// Il buco che chiude (Nicola, 2026-08-10): «il server si è fermato perché Claude ha raggiunto il
// limite settimanale e siccome non poteva fare più niente si è fermato». Esatto — e nessuno stava
// a guardare quando il limite si sarebbe liberato. I timer continuavano a partire ogni giorno,
// trovavano lo stesso muro, e morivano. Undici giorni.
//
// Come funziona, e perché è LEGGERA:
//   ① a ogni tick (3 min, timer già esistente) legge SOLO due file di memoria: zero rete, zero AI;
//   ② se non c'è un guasto aperto, esce subito — costo zero, che è il caso del 99% dei tick;
//   ③ se il guasto è aperto ma il reset non è ancora arrivato, esce — non si bussa a una porta che
//      si sa chiusa;
//   ④ passato il reset (e non più di una volta ogni QUARANTENA_MIN) fa UNA domanda minima al motore:
//      un prompt di due caratteri. È l'unico modo onesto di sapere se il limite è caduto — il conto
//      alla rovescia dichiarato dal messaggio è una promessa, non un fatto;
//   ⑤ se il motore risponde, riaccende la macchina: ri-accoda le cadenze perse e scrive in memoria
//      che è tornata. Se non risponde, aggiorna il guasto con la nuova attesa e tace.
//
// 🟢 Colore: verde. Non tocca il mondo esterno, non manda niente a nessuno, non esegue azioni 🔴:
//    accoda lavori di cadenza, cioè esattamente ciò che i timer avrebbero fatto da soli.
//
// Uso:  node cervello/sentinella-motore.mjs [--json] [--forza-sonda]
// Env:  SUPABASE_URL + SUPABASE_SERVICE_KEY (memoria) per ri-accodare · TZ=Europe/Rome

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { leggi as leggiErrori, FILE_ERRORI } from "./errore-motore.mjs";

process.env.TZ = process.env.TZ || "Europe/Rome";

const JSON_MODE = process.argv.includes("--json");
const FORZA = process.argv.includes("--forza-sonda");
const STATO = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/motore-sonda.json");
const ESITI = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/esito-cadenze.json");

// Non più di una sonda ogni 15 minuti: bussare più spesso non fa cadere il limite prima, e ogni
// sonda è comunque una chiamata al motore. È il freno che tiene «leggera» una cosa che gira ogni 3 min.
const QUARANTENA_MIN = 15;
const SONDA_TIMEOUT_SEC = 60;

// Le cadenze da far ripartire quando il motore torna, con la finestra oltre la quale ha ancora senso
// rifarle. Il piano del mattino recuperato alle 23:00 non serve a nessuno; il monitoraggio sì.
const CADENZE_DA_RIPRENDERE = [
  { tipo: "monitora", descrizione: "il monitoraggio web (Intelligence)", validaOre: 48 },
  { tipo: "giro", descrizione: "il giro di perlustrazione", validaOre: 12 },
];

const leggiJson = (p, def) => {
  if (!existsSync(p)) return def;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return def;
  }
};

/**
 * Decide cosa fare a questo tick. PURA: nessun I/O, così i test possono spingere l'orologio avanti
 * senza aspettare davvero. Ritorna { azione, motivo, ... }.
 *   azione: "riposo" | "sonda"
 */
export function decidiSonda({ ultimoGuasto, ultimaSonda, nowMs = Date.now(), forza = false } = {}) {
  if (forza) return { azione: "sonda", motivo: "sonda forzata da riga di comando" };
  if (!ultimoGuasto) return { azione: "riposo", motivo: "nessun guasto del motore registrato" };

  // Un guasto che non ha un ritentativo previsto è già stato chiuso o non è ritentabile (auth):
  // svegliarsi non serve, serve una mano umana — e quella la chiede l'errore stesso.
  if (!ultimoGuasto.ritento_previsto) {
    return { azione: "riposo", motivo: `guasto ${ultimoGuasto.classe}: non riparte da solo, serve un intervento` };
  }
  const reset = Date.parse(ultimoGuasto.ritento_previsto);
  if (Number.isFinite(reset) && reset > nowMs) {
    const minuti = Math.round((reset - nowMs) / 60000);
    return { azione: "riposo", motivo: `il limite si libera fra ${minuti} min: non busso a una porta chiusa` };
  }
  if (ultimaSonda) {
    const da = Date.parse(ultimaSonda);
    if (Number.isFinite(da) && nowMs - da < QUARANTENA_MIN * 60 * 1000) {
      return { azione: "riposo", motivo: `sonda già fatta da meno di ${QUARANTENA_MIN} min` };
    }
  }
  return { azione: "sonda", motivo: "il reset dichiarato è passato: provo se il motore risponde" };
}

/**
 * Quali cadenze vale ancora la pena recuperare, dato quando sono uscite l'ultima volta. PURA.
 * Una cadenza uscita da poco non si recupera: sarebbe lavoro doppio, non recupero.
 */
export function cadenzeDaRiprendere(esiti = {}, nowMs = Date.now(), elenco = CADENZE_DA_RIPRENDERE) {
  const out = [];
  for (const c of elenco) {
    const riga = esiti?.cadenze?.[c.tipo];
    if (!riga) continue;
    const buona = riga.esito === "ok" || riga.esito === "riuscita";
    const quando = Date.parse(String(riga.quando || "").replace(" ", "T") + ":00");
    const eta = Number.isFinite(quando) ? (nowMs - quando) / 3600000 : 999;
    if (!buona && eta <= c.validaOre) out.push({ ...c, oreFa: Math.round(eta) });
  }
  return out;
}

/** Bussa al motore con la domanda più piccola possibile. Ritorna { vivo, uscita }. */
function sonda() {
  const motore = process.env.CERVELLO_MOTORE === "cursor" ? "agent" : "claude";
  try {
    const out = execFileSync(motore, ["-p", "ok"], {
      encoding: "utf8",
      timeout: SONDA_TIMEOUT_SEC * 1000,
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { vivo: true, uscita: String(out).slice(0, 400) };
  } catch (e) {
    const testo = `${e.stdout || ""}${e.stderr || ""}${e.message || ""}`;
    return { vivo: false, uscita: testo.slice(0, 2000) };
  }
}

/** Rimette in coda una cadenza. Ritorna true se accodata. */
function accoda({ tipo, descrizione }) {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_KEY?.trim();
  if (!url || !key) return false;
  const H = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  try {
    // Idempotenza: se è già in attesa non ne servono due.
    const gia = execFileSync("curl", [
      "-fsS", `${url}/rest/v1/lavori?stato=eq.in_attesa&tipo=eq.${tipo}&select=id&limit=1`,
      "-H", `apikey: ${key}`, "-H", `Authorization: Bearer ${key}`,
    ], { encoding: "utf8", timeout: 20000 });
    if (JSON.parse(gia || "[]").length > 0) return false;
  } catch {
    /* se non riesco a controllare, meglio non accodare alla cieca */
    return false;
  }
  const body = JSON.stringify({
    stato: "in_attesa",
    tipo,
    richiesta: `Recupero automatico di «${descrizione}»: il motore AI era in limite ed è appena tornato disponibile. Riesegui e pubblica la memoria sul ramo unico main.`,
    esperto: "cadenza",
  });
  try {
    execFileSync("curl", [
      "-fsS", "-X", "POST", `${url}/rest/v1/lavori`,
      ...Object.entries(H).flatMap(([k, v]) => ["-H", `${k}: ${v}`]),
      "-d", body,
    ], { encoding: "utf8", timeout: 20000 });
    return true;
  } catch {
    return false;
  }
}

function scriviStato(doc) {
  writeFileSync(
    STATO,
    JSON.stringify(
      {
        _cosa_e:
          "Stato della veglia sul motore AI. Quando il motore è in limite, questa è l'unica cosa che resta sveglia: controlla se il limite è caduto e rimette in moto le cadenze perse.",
        ...doc,
      },
      null,
      2
    ) + "\n",
    "utf8"
  );
}

// ─────────────────────────────── main ───────────────────────────────
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const precedente = leggiJson(STATO, {});
  const { voci } = leggiErrori(FILE_ERRORI);
  const ultimoGuasto = voci[0] || null;
  const now = Date.now();

  const decisione = decidiSonda({ ultimoGuasto, ultimaSonda: precedente.ultima_sonda, nowMs: now, forza: FORZA });

  if (decisione.azione === "riposo") {
    const esito = { quando: nowPiacenza(), stato: "riposo", motivo: decisione.motivo, ultima_sonda: precedente.ultima_sonda || null };
    if (JSON_MODE) console.log(JSON.stringify(esito, null, 2));
    else console.log(`💤 ${decisione.motivo}`);
    process.exit(0);
  }

  const s = sonda();
  const base = { quando: nowPiacenza(), ultima_sonda: new Date(now).toISOString(), motore_vivo: s.vivo };

  if (!s.vivo) {
    // Ancora chiuso. Registriamo il guasto aggiornato (così il ritento_previsto si sposta in avanti
    // con l'informazione FRESCA del messaggio, invece di restare ancorato a quello di giorni fa).
    try {
      execFileSync("node", [join(AD_ROOT, "cervello/errore-motore.mjs"), "registra", "--cadenza=sonda", "--rc=1"], {
        input: s.uscita,
        encoding: "utf8",
        timeout: 30000,
      });
    } catch {
      /* la sonda non deve morire perché non è riuscita a scrivere: lo dice sotto */
    }
    scriviStato({ ...base, stato: "ancora-in-limite", motivo: decisione.motivo });
    const msg = "🚧 Il motore è ancora in limite. Riprovo fra un po'.";
    if (JSON_MODE) console.log(JSON.stringify({ ...base, stato: "ancora-in-limite" }, null, 2));
    else console.log(msg);
    process.exit(0);
  }

  // 🎉 Il motore è tornato. Rimettiamo in moto quello che si è perso.
  const esiti = leggiJson(ESITI, {});
  const daRiprendere = cadenzeDaRiprendere(esiti, now);
  const riaccese = [];
  for (const c of daRiprendere) if (accoda(c)) riaccese.push(c.tipo);

  scriviStato({
    ...base,
    stato: "tornato",
    cadenze_riaccodate: riaccese,
    cadenze_valutate: daRiprendere.map((c) => `${c.tipo} (${c.oreFa}h fa)`),
  });

  const frase = riaccese.length
    ? `✅ Il motore è tornato. Ho rimesso in coda: ${riaccese.join(", ")}.`
    : "✅ Il motore è tornato. Nessuna cadenza da recuperare (o memoria non collegata per accodare).";
  if (JSON_MODE) console.log(JSON.stringify({ ...base, stato: "tornato", riaccese }, null, 2));
  else console.log(frase);
  process.exit(0);
}
