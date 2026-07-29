#!/usr/bin/env node
// 🩺 SALUTE — la visita della macchina. 🟢 Sola lettura: non ripara, non pubblica, non tocca il mondo.
//
// PERCHÉ ESISTE. Gli strumenti per sapere se la macchina funziona ci sono già — 54 guardiani nel
// giro, 89 test, verifica-sensori, verifica-automazione, diagnostica-completa. Quello che mancava è
// il DIRETTORE: qualcuno che li chiami tutti insieme, dia UN verdetto, e sappia distinguere le tre
// cose che contano davvero:
//
//     ✅ funziona (l'ho provato)   ❌ è rotto (l'ho provato)   ⚪ NON L'HO POTUTO VEDERE da qui
//
// Il terzo esito è il motivo per cui questo file esiste. Lanciata da una sessione cloud senza
// chiavi, una visita ingenua scriverebbe «9 sensori rotti» — e quella bugia finirebbe nel Pannello
// di Nicola. Un controllo che non ho potuto fare non è un rosso e NON è un verde: è un buco
// dichiarato, con scritto perché (è la stessa legge di AR-035/AR-281, qui applicata a ogni organo).
//
// LE DUE CASE. Gira sul VPS (vede i servizi, i timer, la coda) e da Claude (vede il riflesso: git,
// la Cabina, la memoria). Nessuna delle due vede tutto, quindi ognuna scrive la SUA sezione in
// salute.json e legge quella dell'altra. Il referto del VPS che invecchia è, da Claude, spesso
// l'unico rosso visibile — e vale: vuol dire che il VPS ha smesso di visitarsi.
//
// Uso:
//   node cervello/salute.mjs                 -> visita rapida (default)
//   node cervello/salute.mjs --completo      -> + i controlli lenti (test, guardiani, rete)
//   node cervello/salute.mjs --vps           -> + systemd, timer, log (solo sulla macchina vera)
//   node cervello/salute.mjs --json          -> output macchina
//
// Exit: 0 = nessun rosso · 1 = almeno un rosso (o un mio controllo rotto) · 2 = ho visto troppo poco
//       per dare un verdetto (cieca — che NON è verde, stessa semantica del cancello del cantiere).

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { scriviJsonAtomico, scriviTestoAtomico } from "./scrivi-json.mjs";

const ARGS = process.argv.slice(2);
const JSON_MODE = ARGS.includes("--json");
const MODO = ARGS.includes("--vps") ? "vps" : ARGS.includes("--completo") ? "completo" : "rapido";

/** Dove sto girando. Il VPS si riconosce dalla sua casa: /opt/mycity. Mai indovinare dal resto. */
const CASA =
  ARGS.includes("--vps") || process.env.SALUTE_CASA === "vps" || existsSync("/opt/mycity/ad-mycity")
    ? "vps"
    : "claude";

const SALUTE_JSON = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/salute.json");
const CARTELLA_REFERTI = join(AD_ROOT, "consegne/salute");
const LOCK = join(AD_ROOT, ".git", "mycity-salute.lock");

// ── Le soglie, decise PRIMA ────────────────────────────────────────────────────
// Scritte qui e non dentro i controlli: un verdetto che dipende da un numero deciso al momento è un
// verdetto che cambia da sessione a sessione. Se una soglia è sbagliata si discute questa riga.
const SOGLIE = {
  refertoVpsScadutoOre: 26, // il VPS visita ogni giorno: 26h = un giro saltato, non un ritardo
  memoriaFermaOre: 12, // nessuna scrittura della macchina da 12h = qualcosa si è fermato
  lavoroInAttesaMin: 20, // preso da nessuno dopo 20 min = claim rotto / worker fermo / pausa
  lavoroInCorsoMin: 45, // «in corso» da 45 min = un worker è morto a metà lavoro
  cabinaLentaMs: 5000, // la Cabina che risponde oltre 5s è un guasto che sta nascendo
  coperturaMinima: 0.5, // sotto metà dei controlli non do un verdetto: dico che sono cieca
  storicoMax: 60, // le ultime 60 visite per casa: serve la tendenza, non l'archivio
  refertiTenuti: 30, // i referti scritti su disco: gli ultimi 30, il resto è carta
  tracceFermeOre: 8, // i processi automatici girano più volte al giorno: 8h di silenzio è un guasto
};

// Impatto sulla crescita — l'ordine con cui si legge il referto (stessa scala del cantiere).
const IMPATTO = {
  1: "blocca gli incassi",
  2: "fa mentire il Pannello a Nicola",
  3: "fa sbagliare la macchina da sola",
  4: "igiene",
};

const ts = () => nowPiacenza();
const iso = () => new Date().toISOString();

// ── Attrezzi ───────────────────────────────────────────────────────────────────

/** Esegue uno script del cervello. Se non parte NON è un verde: è un mio controllo rotto. */
function eseguiNode(file, args = [], timeoutMs = 60_000) {
  const percorso = join(AD_ROOT, "cervello", file);
  if (!existsSync(percorso)) return { partito: false, motivo: `manca cervello/${file}`, code: null, out: "", ms: 0 };
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [percorso, ...args], {
    cwd: AD_ROOT,
    encoding: "utf8",
    timeout: timeoutMs,
    maxBuffer: 16 * 1024 * 1024,
  });
  const ms = Date.now() - t0;
  if (r.error) {
    const scaduto = r.error.code === "ETIMEDOUT" || r.signal === "SIGTERM";
    return { partito: false, motivo: scaduto ? `oltre ${timeoutMs / 1000}s` : String(r.error.message), code: null, out: "", ms };
  }
  return { partito: true, code: r.status, out: `${r.stdout || ""}${r.stderr || ""}`, ms };
}

/** Una GET onesta: solo lettura, con un tetto di tempo. Mai POST, mai scritture. */
async function guarda(url, timeoutMs = 8000) {
  const t0 = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), redirect: "follow" });
    const testo = await res.text().catch(() => "");
    return { ok: true, status: res.status, ms: Date.now() - t0, testo };
  } catch (e) {
    return { ok: false, errore: e?.name === "TimeoutError" ? `nessuna risposta in ${timeoutMs / 1000}s` : String(e?.message || e), ms: Date.now() - t0 };
  }
}

/** REST della memoria (Supabase). Torna null quando l'ambiente non è configurato: null ≠ vuoto. */
async function memoriaRest(percorso) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/rest/v1/${percorso}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return { errore: `HTTP ${res.status}` };
    return { righe: await res.json() };
  } catch (e) {
    return { errore: String(e?.message || e) };
  }
}

const primaRigaUtile = (testo, quante = 2) =>
  String(testo || "")
    .split("\n")
    .map((r) => r.trim())
    .filter((r) => r && !/^[═─-]+$/.test(r))
    .slice(0, quante)
    .join(" · ")
    .slice(0, 240);

// Le scorciatoie per comporre un esito. `detto` è la frase che leggerà Nicola: si scrive a voce.
const ok = (detto, dati) => ({ esito: "ok", detto, dati });
const rotto = (detto, dati) => ({ esito: "rotto", detto, dati });
const nonVisto = (perche, dati) => ({ esito: "nonvisto", detto: perche, dati });
const guasto = (perche) => ({ esito: "guasto", detto: `il controllo non è partito: ${perche}` });

/** Un controllo che ha bisogno di chiavi: senza, è ⚪ con scritto quale chiave manca. */
function seServonoChiavi(chiavi) {
  const mancanti = chiavi.filter((k) => !process.env[k]);
  return mancanti.length ? nonVisto(`manca ${mancanti.join(" / ")} in questo ambiente`) : null;
}

/** Traduce un guardiano già esistente in un esito, senza reinterpretare i suoi codici d'uscita. */
function daGuardiano(r, { comando, rossoSe = (c) => c !== 0, dettoOk, dettoRotto, ciecoSe = () => false }) {
  if (!r.partito) return { ...guasto(r.motivo), prova: comando };
  if (ciecoSe(r.code)) return { ...nonVisto(`il controllo non ha potuto misurare: ${primaRigaUtile(r.out)}`), prova: comando, ms: r.ms };
  const esito = rossoSe(r.code)
    ? rotto(`${dettoRotto} — ${primaRigaUtile(r.out)}`, { uscita: r.code })
    : ok(dettoOk, { uscita: r.code });
  return { ...esito, prova: comando, ms: r.ms };
}

// ── Le decisioni, pure e provabili ─────────────────────────────────────────────
// Qui dentro non si legge niente e non si chiama niente: entrano dati, esce un giudizio. È la
// condizione perché un test possa ESEGUIRE la decisione invece di cercarne la forma in un file —
// e perché la prova si possa rompere apposta per vedere che diventa rossa.
// L'orario si passa da fuori (`adesso`): una decisione che legge l'orologio da sé non è provabile.

/** Il referto del VPS letto da Claude: fresco, scaduto, o mai arrivato. */
export function giudicaPonte(precedenteVps, adesso = Date.now(), soglie = SOGLIE) {
  if (!precedenteVps) return nonVisto("il VPS non ha mai pubblicato un referto: il ponte non è ancora attivo");
  const ore = precedenteVps.iso ? (adesso - Date.parse(precedenteVps.iso)) / 3_600_000 : null;
  if (ore === null || Number.isNaN(ore)) return nonVisto("il referto del VPS non ha un orario leggibile");
  if (ore > soglie.refertoVpsScadutoOre)
    return rotto(`l'ultima visita del VPS è di ${Math.round(ore)} ore fa: da lassù non si sta più controllando nessuno`, { ore });
  return ok(`il VPS si è visitato ${Math.round(ore)} ore fa`, { ore, rossiLassu: precedenteVps.rotti ?? null });
}

/**
 * Un orario scritto come lo scrive la macchina ("2026-07-29 11:42", fuso di Piacenza) → millisecondi.
 * Non basta `Date.parse`: da una sessione cloud il processo gira in UTC e quella stessa stringa
 * varrebbe due ore prima. Qui si provano gli offset di Roma e si tiene quello che, riformattato in
 * fuso Roma, ridà esattamente la stringa di partenza — così vale sia d'estate che d'inverno.
 */
export function daOraPiacenza(s) {
  if (typeof s !== "string") return NaN;
  const [giorno, ora] = s.trim().split(" ");
  if (!giorno || !ora) return NaN;
  const formato = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  for (const offset of ["+02:00", "+01:00"]) {
    const ms = Date.parse(`${giorno}T${ora}:00${offset}`);
    if (!Number.isNaN(ms) && formato.format(new Date(ms)) === `${giorno} ${ora}`) return ms;
  }
  return NaN;
}

/**
 * Le tracce dei processi automatici: da quanto la macchina non lascia un segno di essere passata.
 *
 * Serve perché il ponte da solo non basta. Il 29/7 il VPS era fermo da due giorni — dodici tick
 * mancati di fila — e da una sessione cloud la visita non se ne accorgeva: senza chiavi non vedeva
 * la coda, e il referto del VPS non era ancora nato. Questo controllo invece funziona **sempre**,
 * perché legge file che stanno nel repo. Si guarda il campo scritto DENTRO il file, mai la data del
 * filesystem: in un clone fresco tutti i file sono di oggi, e sembrerebbe tutto vivo.
 */
export function giudicaTracce(tracce, adesso = Date.now(), soglie = SOGLIE) {
  const lette = tracce.map((t) => ({ ...t, ms: daOraPiacenza(t.quando) })).filter((t) => !Number.isNaN(t.ms));
  if (!lette.length) return nonVisto("nessun file di memoria con un orario leggibile: non posso dire se la macchina gira");
  const piuFresca = lette.sort((a, b) => b.ms - a.ms)[0];
  const ore = (adesso - piuFresca.ms) / 3_600_000;
  const dati = { file: piuFresca.file, ore: Math.round(ore), quando: piuFresca.quando };
  if (ore > soglie.tracceFermeOre)
    return rotto(`nessun processo automatico lascia tracce da ${Math.round(ore)} ore (l'ultima è ${piuFresca.file}, ${piuFresca.quando})`, dati);
  return ok(`ultima traccia ${Math.round(ore)} ore fa (${piuFresca.file})`, dati);
}

/** La coda: non quanti lavori ci sono, ma da quanto sono lì. */
export function giudicaCoda(righe, adesso = Date.now(), soglie = SOGLIE) {
  const eta = (x) => (adesso - Date.parse(x.aggiornato_il || x.creato_il)) / 60_000;
  const attesaVecchi = righe.filter((x) => x.stato === "in_attesa" && eta(x) > soglie.lavoroInAttesaMin);
  const corsoBloccati = righe.filter((x) => x.stato === "in_corso" && eta(x) > soglie.lavoroInCorsoMin);
  const dati = { totali: righe.length, attesaVecchi: attesaVecchi.length, corsoBloccati: corsoBloccati.length };
  // Prima i bloccati: un lavoro «in corso» che nessuno chiude, da fuori, sembra uno che sta lavorando.
  if (corsoBloccati.length)
    return rotto(`${corsoBloccati.length} lavori sono «in corso» da oltre ${soglie.lavoroInCorsoMin} minuti: un worker è morto a metà`, dati);
  if (attesaVecchi.length)
    return rotto(`${attesaVecchi.length} lavori aspettano da oltre ${soglie.lavoroInAttesaMin} minuti e nessuno li prende`, dati);
  return ok(righe.length ? "nessun lavoro appeso in coda" : "coda vuota, niente di appeso", dati);
}

/** Il silenzio della macchina: l'ultima scrittura, qualunque essa sia. */
export function giudicaBattito(righe, adesso = Date.now(), soglie = SOGLIE) {
  const ultima = (righe || [])[0];
  if (!ultima?.updated_at) return nonVisto("nessuna traccia con un orario nella memoria");
  const ore = (adesso - Date.parse(ultima.updated_at)) / 3_600_000;
  const dati = { ultimaChiave: ultima.chiave, ore: Math.round(ore) };
  if (ore > soglie.memoriaFermaOre) return rotto(`la macchina non scrive niente da ${Math.round(ore)} ore`, dati);
  return ok(`ultima scrittura ${Math.round(ore)} ore fa (${ultima.chiave})`, dati);
}

/** La Cabina vista da fuori: risponde, risponde male, o risponde troppo tardi. */
export function giudicaCabina(r, soglie = SOGLIE) {
  if (!r.ok) return rotto(`la Cabina non risponde: ${r.errore}`);
  if (r.status >= 400) return rotto(`la Cabina risponde ${r.status}`, { status: r.status });
  // La lentezza è un guasto che sta nascendo: se aspetti che diventi un errore, l'hai scoperto tardi.
  if (r.ms > soglie.cabinaLentaMs) return rotto(`la Cabina risponde in ${(r.ms / 1000).toFixed(1)}s: troppo lenta da telefono`, { ms: r.ms });
  return ok(`risponde in ${(r.ms / 1000).toFixed(1)}s`, { ms: r.ms, status: r.status });
}

/** Il cuore della Cabina: «collegato: false» è il Pannello che dice la verità, e per Nicola è un rosso. */
export function giudicaCuore(testo) {
  let dati = null;
  try {
    dati = JSON.parse(testo);
  } catch {
    return rotto("il cuore della Cabina non risponde in JSON");
  }
  if (dati.collegato === false) return rotto("la Cabina non è collegata alla memoria: a Nicola i numeri non arrivano", { collegato: false });
  return ok(dati.ultimoBattito ? `collegata, ultimo battito ${dati.ultimoBattito}` : "collegata", { ultimoBattito: dati.ultimoBattito ?? null });
}

/** I guardiani citati dal giro che non esistono più: falliscono dentro un `|| true` e nessuno lo sa. */
export function guardianiMancanti(testoGiro, esiste) {
  const citati = [...testoGiro.matchAll(/node\s+"\$SCRIPT_DIR\/([a-z0-9-]+\.mjs)"/g)].map((m) => m[1]);
  const unici = [...new Set(citati)];
  return { unici, assenti: unici.filter((f) => !esiste(f)) };
}

/** Peggiorato da ieri: era verde, oggi è rosso. Il segnale più forte, perché isola il cambiamento. */
export function marcaRegressioni(controlliPrecedenti, risultati) {
  const primaOk = new Set((controlliPrecedenti || []).filter((c) => c.esito === "ok").map((c) => c.id));
  for (const r of risultati) r.regressione = r.esito === "rotto" && primaOk.has(r.id);
  return risultati;
}

/** Quanta parte della macchina ho davvero guardato. ⚪ e 🔧 non contano come "visto". */
export function coperturaDi(risultati) {
  if (!risultati.length) return 0;
  const misurati = risultati.filter((r) => r.esito === "ok" || r.esito === "rotto").length;
  return misurati / risultati.length;
}

/** 0 = a posto · 1 = c'è un rosso (anche mio) · 2 = ho visto troppo poco per dire che va bene. */
export function codiceUscita({ rotti, guasti, copertura }, soglie = SOGLIE) {
  if (rotti > 0 || guasti > 0) return 1;
  if (copertura < soglie.coperturaMinima) return 2;
  return 0;
}

// ── I controlli ────────────────────────────────────────────────────────────────
// Ognuno dichiara: quale organo, quanto pesa, dove può girare, e come si prova.
// `soloSu` esiste perché un controllo eseguito dove non può vedere produce rumore, non conoscenza.

const CONTROLLI = [
  // ══ WORKER — l'organo che esegue. Se si ferma lui, si ferma l'azienda.
  {
    id: "worker.ponte",
    organo: "worker",
    titolo: "Il VPS si sta ancora visitando",
    impatto: 1,
    soloSu: "claude",
    async prova({ precedenteVps }) {
      return giudicaPonte(precedenteVps);
    },
  },
  {
    id: "worker.tracce",
    organo: "worker",
    titolo: "La macchina lascia tracce di essere passata",
    impatto: 1,
    async prova() {
      // Il controllo che funziona SEMPRE, in tutte e due le case, anche senza una chiave: i processi
      // automatici scrivono nel repo, e il repo ce l'ho sotto gli occhi. Se un timer scatta ma qui
      // non arriva niente, il guasto non è il timer — è quello che ci sta dentro.
      const fonti = [
        ["auto-coscienza/sentinella-dati.json", "aggiornato"],
        ["auto-coscienza/esito-giro.json", "data"],
        ["auto-coscienza/costo-ai.json", "aggiornato"],
        ["auto-coscienza/delta-gate.json", "aggiornato"],
        ["ultimo-briefing.json", "data"],
      ];
      const tracce = [];
      for (const [rel, campo] of fonti) {
        const p = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI", rel);
        if (!existsSync(p)) continue;
        try {
          const quando = JSON.parse(readFileSync(p, "utf8"))[campo];
          if (quando) tracce.push({ file: rel.split("/").pop(), quando });
        } catch {
          /* un file illeggibile non è una traccia: semplicemente non conta */
        }
      }
      return giudicaTracce(tracce);
    },
  },
  {
    id: "worker.coda",
    organo: "worker",
    titolo: "La coda dei lavori scorre",
    impatto: 1,
    async prova() {
      const manca = seServonoChiavi(["SUPABASE_URL", "SUPABASE_SERVICE_KEY"]);
      if (manca) return manca;
      const r = await memoriaRest("lavori?select=id,stato,creato_il,aggiornato_il&order=creato_il.desc&limit=60");
      if (!r) return nonVisto("memoria non configurata");
      if (r.errore) return nonVisto(`non ho potuto leggere la coda: ${r.errore}`);
      return giudicaCoda(r.righe || []);
    },
  },
  {
    id: "worker.battito",
    organo: "worker",
    titolo: "La macchina ha scritto di recente",
    impatto: 1,
    async prova() {
      const manca = seServonoChiavi(["SUPABASE_URL", "SUPABASE_SERVICE_KEY"]);
      if (manca) return manca;
      // Non cerco una chiave col nome giusto (i nomi cambiano): guardo QUANDO la macchina ha
      // scritto l'ultima volta, qualunque cosa abbia scritto. Il silenzio è il sintomo.
      const r = await memoriaRest("impostazioni?select=chiave,updated_at&order=updated_at.desc&limit=3");
      if (!r) return nonVisto("memoria non configurata");
      if (r.errore) return nonVisto(`non ho potuto leggere la memoria: ${r.errore}`);
      return giudicaBattito(r.righe || []);
    },
  },
  {
    id: "worker.servizi",
    organo: "worker",
    titolo: "I servizi e i timer girano",
    impatto: 1,
    soloSu: "vps",
    async prova() {
      const attivo = (unita) => spawnSync("systemctl", ["is-active", unita], { encoding: "utf8" }).stdout?.trim();
      const riavvii = (unita) =>
        Number(spawnSync("systemctl", ["show", unita, "-p", "NRestarts", "--value"], { encoding: "utf8" }).stdout?.trim() || 0);
      const unita = ["mycity-worker", "mycity-worker-chat"];
      const stato = unita.map((u) => ({ u, attivo: attivo(u), riavvii: riavvii(u) }));
      if (stato.every((s) => !s.attivo)) return nonVisto("systemctl non risponde: non sono sulla macchina vera");
      const morti = stato.filter((s) => s.attivo !== "active");
      // Un servizio che riparte in continuazione è `active` ogni volta che lo guardi: il numero dei
      // riavvii dice la verità che lo stato nasconde.
      const instabili = stato.filter((s) => s.riavvii > 20);
      if (morti.length) return rotto(`non attivo: ${morti.map((s) => s.u).join(", ")}`, { stato });
      if (instabili.length) return rotto(`riparte in continuazione: ${instabili.map((s) => `${s.u} (${s.riavvii} riavvii)`).join(", ")}`, { stato });
      return ok(`${stato.length} servizi attivi e stabili`, { stato });
    },
  },
  {
    id: "worker.automazione",
    organo: "worker",
    titolo: "Token, push e allineamento git",
    impatto: 2,
    modi: ["completo", "vps"],
    async prova() {
      const manca = seServonoChiavi(["GIT_PUSH_TOKEN"]);
      if (manca) return manca;
      const r = eseguiNode("verifica-automazione.mjs", ["--json"], 90_000);
      return daGuardiano(r, {
        comando: "node cervello/verifica-automazione.mjs --json",
        dettoOk: "token, push e ramo della memoria a posto",
        dettoRotto: "l'automazione ha un controllo fallito",
      });
    },
  },

  // ══ CERVELLO — il ragionamento. Qui i guasti non fermano: fanno sbagliare.
  {
    id: "cervello.fatti",
    organo: "cervello",
    titolo: "I fatti-chiave sono coerenti ovunque",
    impatto: 2,
    async prova() {
      const r = eseguiNode("coerenza-fatti.mjs", [], 60_000);
      return daGuardiano(r, {
        comando: "node cervello/coerenza-fatti.mjs",
        dettoOk: "nessuna copia vecchia di un fatto in giro per i file vivi",
        dettoRotto: "un valore vecchio è rimasto in un file vivo (il Pannello lo mostrerebbe a Nicola)",
      });
    },
  },
  {
    id: "cervello.segreti",
    organo: "cervello",
    titolo: "Nessun segreto nel repo",
    impatto: 1,
    async prova() {
      const r = eseguiNode("scan-segreti.mjs", [], 60_000);
      return daGuardiano(r, {
        comando: "node cervello/scan-segreti.mjs",
        rossoSe: (c) => c === 1,
        ciecoSe: (c) => c === 2, // errore interno dello scanner: cieco, non pulito
        dettoOk: "nessuna chiave o segreto committato",
        dettoRotto: "trovato un segreto nel repo",
      });
    },
  },
  {
    id: "cervello.test",
    organo: "cervello",
    titolo: "I test del cervello passano",
    impatto: 3,
    modi: ["completo", "vps"],
    async prova() {
      const r = eseguiNode("test-cervello.mjs", [], 300_000);
      return daGuardiano(r, {
        comando: "node cervello/test-cervello.mjs",
        dettoOk: "tutti i test del cervello girano e passano",
        dettoRotto: "un test del cervello è rosso o non parte",
      });
    },
  },
  {
    id: "cervello.vault",
    organo: "cervello",
    titolo: "La memoria è sana",
    impatto: 2,
    async prova() {
      const r = eseguiNode("vault-sanita.mjs", ["MyCity-Vault"], 60_000);
      return daGuardiano(r, {
        comando: "node cervello/vault-sanita.mjs MyCity-Vault",
        dettoOk: "il vault è leggibile e coerente",
        dettoRotto: "il vault ha un problema di integrità",
      });
    },
  },
  {
    id: "cervello.guardiani",
    organo: "cervello",
    titolo: "I guardiani del giro esistono tutti",
    impatto: 3,
    async prova() {
      // Un guardiano invocato nel giro il cui file non esiste più fallisce dentro un `|| true`:
      // da fuori sembra un giro pulito. È il modo più silenzioso che ha la macchina di perdere una
      // difesa, quindi si controlla a ogni visita, non solo in quella completa.
      const giro = join(AD_ROOT, "cervello", "giro.sh");
      if (!existsSync(giro)) return guasto("manca cervello/giro.sh");
      const { unici, assenti } = guardianiMancanti(readFileSync(giro, "utf8"), (f) => existsSync(join(AD_ROOT, "cervello", f)));
      if (assenti.length) return rotto(`${assenti.length} guardiani del giro non esistono più: ${assenti.join(", ")}`, { assenti });
      return ok(`${unici.length} guardiani del giro presenti`, { quanti: unici.length });
    },
  },

  // ══ CABINA — quello che vede Nicola. Un guasto qui gli fa prendere decisioni sbagliate.
  {
    id: "cabina.test",
    organo: "cabina",
    titolo: "I test del Pannello passano",
    impatto: 2,
    modi: ["completo", "vps"],
    async prova() {
      const r = eseguiNode("test-pannello.mjs", [], 300_000);
      return daGuardiano(r, {
        comando: "node cervello/test-pannello.mjs",
        dettoOk: "tutti i test del Pannello girano e passano",
        dettoRotto: "un test del Pannello è rosso o non parte",
      });
    },
  },
  {
    id: "cabina.viva",
    organo: "cabina",
    titolo: "La Cabina risponde",
    impatto: 1,
    async prova() {
      const base = process.env.PANNELLO_URL || process.env.CABINA_URL;
      if (!base) return nonVisto("manca PANNELLO_URL / CABINA_URL in questo ambiente");
      return giudicaCabina(await guarda(base.replace(/\/$/, "")));
    },
  },
  {
    id: "cabina.cuore",
    organo: "cabina",
    titolo: "La Cabina è collegata alla memoria",
    impatto: 2,
    async prova() {
      const base = process.env.PANNELLO_URL || process.env.CABINA_URL;
      if (!base) return nonVisto("manca PANNELLO_URL / CABINA_URL in questo ambiente");
      const r = await guarda(`${base.replace(/\/$/, "")}/api/cuore`);
      if (!r.ok) return rotto(`il cuore della Cabina non risponde: ${r.errore}`);
      // «collegato: false» non è un guasto del Pannello: è il Pannello che dice la verità su una
      // chiave mancante. Resta un rosso perché a Nicola i numeri non arrivano — ma il fix è nelle
      // env di Vercel, non nel codice, e la card deve dirlo.
      return giudicaCuore(r.testo);
    },
  },

  // ══ SENIOR — la squadra. Qui il guasto tipico non è l'errore: è il silenzio.
  {
    id: "senior.registro",
    organo: "senior",
    titolo: "Il registro dei 120 senior torna",
    impatto: 3,
    async prova() {
      const r = eseguiNode("agent-registry-check.mjs", [], 60_000);
      return daGuardiano(r, {
        comando: "node cervello/agent-registry-check.mjs",
        dettoOk: "nessun agente orfano, il conteggio torna",
        dettoRotto: "il registro degli agenti non torna",
      });
    },
  },
  {
    id: "senior.owner",
    organo: "senior",
    titolo: "Un owner solo per ogni mandato",
    impatto: 3,
    async prova() {
      const r = eseguiNode("keyword-owner-check.mjs", [], 60_000);
      return daGuardiano(r, {
        comando: "node cervello/keyword-owner-check.mjs",
        dettoOk: "nessun mandato conteso tra due senior",
        dettoRotto: "due senior si contendono lo stesso mandato senza deferral",
      });
    },
  },
  {
    id: "senior.loop",
    organo: "senior",
    titolo: "I senior chiudono il loop",
    impatto: 3,
    async prova() {
      const file = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/chiusura-loop.json");
      if (!existsSync(file)) return rotto("la sonda dell'apprendimento non scrive più: nessuno misura atteso→reale");
      const r = eseguiNode("utilizzo-senior.mjs", ["--json"], 60_000);
      if (!r.partito) return guasto(r.motivo);
      let dati = null;
      try {
        dati = JSON.parse(r.out);
      } catch {
        /* il cruscotto non è un cancello: se non parla JSON non è un rosso della macchina */
      }
      const vivi = dati?.vivi ?? dati?.utilizzo?.vivi ?? null;
      // Deliberatamente NON è un rosso: quanti senior dormono è una decisione di Nicola, non un
      // guasto. Un controllo che grida al lupo su una scelta legittima si impara a ignorare.
      return ok(vivi !== null ? `${vivi} senior con almeno un esito registrato` : "la sonda dell'apprendimento gira", { vivi });
    },
  },

  // ══ SENSORI — gli occhi. Ciechi senza saperlo è la condizione peggiore di tutte.
  {
    id: "sensori.vista",
    organo: "sensori",
    titolo: "La macchina vede i dati veri",
    impatto: 1,
    async prova() {
      const chiaviSensori = ["MARKETPLACE_SUPABASE_URL", "SUPABASE_URL", "STRIPE_SECRET_KEY", "MARKETPLACE_SITE_URL"];
      if (!chiaviSensori.some((k) => process.env[k]))
        return nonVisto("nessuna chiave dei sensori in questo ambiente: da qui la macchina non può vedere il marketplace");
      const r = eseguiNode("verifica-sensori.mjs", [], 120_000);
      return daGuardiano(r, {
        comando: "node cervello/verifica-sensori.mjs",
        rossoSe: (c) => c === 1, // 1 = tutti ciechi, e qui le chiavi CI SONO: allora è un guasto vero
        dettoOk: "almeno un sensore dati vede il marketplace",
        dettoRotto: "tutti i sensori sono ciechi pur avendo le chiavi",
      });
    },
  },
  {
    id: "sensori.spenti",
    organo: "sensori",
    titolo: "Ogni sensore spento ha il suo perché",
    impatto: 4,
    async prova() {
      const r = eseguiNode("sensori-spenti-check.mjs", [], 60_000);
      return daGuardiano(r, {
        comando: "node cervello/sensori-spenti-check.mjs",
        rossoSe: (c) => c === 1,
        ciecoSe: (c) => c === 2,
        dettoOk: "ogni sensore spento dice perché è spento",
        dettoRotto: "un sensore è spento e nessuno sa perché (buco, non decisione)",
      });
    },
  },
];

// ── Il lock: mai due visite insieme ────────────────────────────────────────────
function prendiLock() {
  try {
    mkdirSync(LOCK); // mkdir è atomico: o è mio, o è di un altro
    return true;
  } catch {
    try {
      const eta = (Date.now() - statSync(LOCK).mtimeMs) / 60_000;
      if (eta > 30) {
        // Un lock lasciato da un processo morto ferma la macchina in modo silenzioso: dopo mezz'ora
        // non è più una visita in corso, è un cadavere.
        rmSync(LOCK, { recursive: true, force: true });
        mkdirSync(LOCK);
        return true;
      }
    } catch {
      /* se non riesco nemmeno a leggerlo, meglio non partire */
    }
    return false;
  }
}
const rilasciaLock = () => rmSync(LOCK, { recursive: true, force: true });

// ── La visita ──────────────────────────────────────────────────────────────────

function leggiPrecedente() {
  if (!existsSync(SALUTE_JSON)) return { ultime: {}, storico: [] };
  try {
    const d = JSON.parse(readFileSync(SALUTE_JSON, "utf8"));
    return { ultime: d.ultime || {}, storico: Array.isArray(d.storico) ? d.storico : [] };
  } catch {
    return { ultime: {}, storico: [] };
  }
}

/** L'autotest: prima di giudicare gli altri, guarda se i tuoi strumenti esistono. */
function autotest() {
  const richiesti = ["coerenza-fatti.mjs", "scan-segreti.mjs", "agent-registry-check.mjs", "vault-sanita.mjs", "giro.sh"];
  return richiesti.filter((f) => !existsSync(join(AD_ROOT, "cervello", f)));
}

async function visita() {
  const precedente = leggiPrecedente();
  const precedenteVps = precedente.ultime?.vps || null;
  const precedenteMia = precedente.ultime?.[CASA] || null;

  const daFare = CONTROLLI.filter((c) => {
    if (c.soloSu && c.soloSu !== CASA) return false;
    if (c.modi && !c.modi.includes(MODO)) return false;
    return true;
  });

  const risultati = [];
  for (const c of daFare) {
    let esito;
    try {
      esito = await c.prova({ precedenteVps });
    } catch (e) {
      // Un controllo che esplode è un mio guasto, non un verde e nemmeno un rosso dell'organo.
      esito = guasto(String(e?.message || e));
    }
    risultati.push({
      id: c.id,
      organo: c.organo,
      titolo: c.titolo,
      impatto: c.impatto,
      ...esito,
      quando: iso(),
    });
  }

  marcaRegressioni(precedenteMia?.controlli, risultati);

  const rotti = risultati.filter((r) => r.esito === "rotto");
  const guasti = risultati.filter((r) => r.esito === "guasto");
  const nonVisti = risultati.filter((r) => r.esito === "nonvisto");
  const buoni = risultati.filter((r) => r.esito === "ok");
  const copertura = coperturaDi(risultati);

  return { risultati, rotti, guasti, nonVisti, buoni, copertura, precedente, mancantiAutotest: autotest() };
}

// ── Il referto ─────────────────────────────────────────────────────────────────

const SEGNO = { ok: "✅", rotto: "❌", nonvisto: "⚪", guasto: "🔧" };
const ORGANI = { worker: "Worker", cervello: "Cervello", cabina: "Cabina", senior: "Senior", sensori: "Sensori" };

function referto(v) {
  const righe = [];
  righe.push("---");
  righe.push(`data: ${ts()}`);
  righe.push(`casa: ${CASA}`);
  righe.push(`modo: ${MODO}`);
  righe.push("---");
  righe.push("");
  righe.push(`# Visita della macchina — ${ts()}`);
  righe.push("");
  righe.push(
    v.rotti.length
      ? `**${v.rotti.length} rossi** su ${v.risultati.length} controlli. Copertura ${Math.round(v.copertura * 100)}% (visitata da: ${CASA}).`
      : `Nessun rosso su ${v.risultati.length} controlli. Copertura ${Math.round(v.copertura * 100)}% (visitata da: ${CASA}).`,
  );
  righe.push("");

  if (v.mancantiAutotest.length) {
    righe.push(`> 🔧 **Attenzione ai miei stessi strumenti:** mancano ${v.mancantiAutotest.join(", ")}. Il verdetto qui sotto è parziale.`);
    righe.push("");
  }

  const regressioni = v.risultati.filter((r) => r.regressione);
  if (regressioni.length) {
    righe.push("## ⚠️ Peggiorato dall'ultima visita");
    righe.push("");
    for (const r of regressioni) righe.push(`- **${r.titolo}** — ${r.detto}`);
    righe.push("");
  }

  if (v.rotti.length) {
    righe.push("## ❌ Rotto — in ordine di quanto costa");
    righe.push("");
    for (const r of [...v.rotti].sort((a, b) => a.impatto - b.impatto)) {
      righe.push(`### ${r.titolo} (${ORGANI[r.organo]} · ${IMPATTO[r.impatto]})`);
      righe.push(`${r.detto}`);
      if (r.prova) righe.push(`Prova: \`${r.prova}\``);
      righe.push("");
    }
  }

  if (v.guasti.length) {
    righe.push("## 🔧 I miei controlli che non sono partiti");
    righe.push("");
    for (const r of v.guasti) righe.push(`- **${r.titolo}** — ${r.detto}`);
    righe.push("");
  }

  righe.push("## ✅ Provato e funzionante");
  righe.push("");
  for (const r of v.buoni) righe.push(`- **${r.titolo}** — ${r.detto}${r.prova ? ` \`${r.prova}\`` : ""}`);
  righe.push("");

  if (v.nonVisti.length) {
    righe.push("## ⚪ Non l'ho potuto vedere da qui");
    righe.push("");
    righe.push("Non sono verdi e non sono rossi: sono i buchi di questa visita.");
    righe.push("");
    for (const r of v.nonVisti) righe.push(`- **${r.titolo}** — ${r.detto}`);
    righe.push("");
  }

  return righe.join("\n");
}

function scriviMemoria(v) {
  const prec = v.precedente;
  const riassunto = {
    quando: ts(),
    iso: iso(),
    casa: CASA,
    modo: MODO,
    ok: v.buoni.length,
    rotti: v.rotti.length,
    guasti: v.guasti.length,
    nonvisti: v.nonVisti.length,
    copertura: Number(v.copertura.toFixed(2)),
  };
  const doc = {
    aggiornato: ts(),
    soglie: SOGLIE,
    ultime: {
      ...prec.ultime,
      [CASA]: {
        ...riassunto,
        controlli: v.risultati.map((r) => ({
          id: r.id,
          organo: r.organo,
          titolo: r.titolo,
          impatto: r.impatto,
          esito: r.esito,
          detto: r.detto,
          prova: r.prova ?? null,
          regressione: Boolean(r.regressione),
        })),
      },
    },
    storico: [...prec.storico, riassunto].slice(-SOGLIE.storicoMax),
  };
  scriviJsonAtomico(SALUTE_JSON, doc);

  const nome = `${ts().replace(" ", "-").replace(":", "")}-${CASA}.md`;
  mkdirSync(CARTELLA_REFERTI, { recursive: true });
  const percorso = join(CARTELLA_REFERTI, nome);
  scriviTestoAtomico(percorso, referto(v));
  potaReferti();
  return percorso;
}

/** Due visite al giorno fanno settecento file l'anno. La tendenza vive nello storico di salute.json;
 *  i referti vecchi sono carta. Ne restano gli ultimi, il resto si butta. */
function potaReferti() {
  try {
    const nomi = readdirSync(CARTELLA_REFERTI)
      .filter((f) => f.endsWith(".md"))
      .sort(); // i nomi iniziano con la data: l'ordine alfabetico È l'ordine cronologico
    for (const vecchio of nomi.slice(0, Math.max(0, nomi.length - SOGLIE.refertiTenuti))) {
      rmSync(join(CARTELLA_REFERTI, vecchio), { force: true });
    }
  } catch {
    /* la potatura non è mai un motivo per far fallire una visita */
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  if (!prendiLock()) {
    if (JSON_MODE) console.log(JSON.stringify({ saltata: true, motivo: "un'altra visita è in corso" }));
    else console.log("⏭️  Un'altra visita è già in corso: non ne faccio due insieme.");
    process.exit(0);
  }
  try {
    const v = await visita();
    const percorso = scriviMemoria(v);

    if (JSON_MODE) {
      console.log(
        JSON.stringify(
          {
            casa: CASA,
            modo: MODO,
            quando: ts(),
            copertura: Number(v.copertura.toFixed(2)),
            rotti: v.rotti.length,
            guasti: v.guasti.length,
            nonvisti: v.nonVisti.length,
            regressioni: v.risultati.filter((r) => r.regressione).length,
            controlli: v.risultati,
            referto: percorso,
          },
          null,
          2,
        ),
      );
    } else if (!v.rotti.length && !v.guasti.length) {
      // Se è tutto a posto, una riga. Una macchina che parla molto quando sta bene si impara a non leggere.
      console.log(
        `🩺 Tutto a posto — ${v.buoni.length}/${v.risultati.length} controlli provati (copertura ${Math.round(v.copertura * 100)}%, da ${CASA}). ${ts()}`,
      );
      if (v.nonVisti.length) console.log(`   ⚪ non visti da qui: ${v.nonVisti.map((r) => r.titolo).join(" · ")}`);
    } else {
      console.log(`🩺 VISITA — ${ts()} · da ${CASA} · copertura ${Math.round(v.copertura * 100)}%\n`);
      for (const r of [...v.rotti, ...v.guasti].sort((a, b) => (a.impatto ?? 9) - (b.impatto ?? 9))) {
        console.log(`${SEGNO[r.esito]} ${r.titolo}${r.regressione ? " (PEGGIORATO da ieri)" : ""}`);
        console.log(`   ${r.detto}`);
        if (r.prova) console.log(`   prova: ${r.prova}`);
      }
      console.log(`\n   ✅ ${v.buoni.length} a posto · ⚪ ${v.nonVisti.length} non visti da qui`);
      console.log(`   Referto: ${percorso.replace(`${AD_ROOT}/`, "")}`);
    }

    // Cieca ≠ verde: se ho visto meno di metà, lo dico col codice d'uscita invece di far finta.
    // `exitCode` e non `exit()`: process.exit() salta il finally e lascerebbe il lock appeso —
    // cioè la visita successiva non partirebbe più. Trovato dalla prima prova vera di questo file.
    process.exitCode = codiceUscita({ rotti: v.rotti.length, guasti: v.guasti.length, copertura: v.copertura });
  } finally {
    rilasciaLock();
  }
}

// La visita parte solo se questo file è stato LANCIATO. Quando un test lo importa per provare le
// decisioni pure, non deve partire nessuna visita: un modulo che agisce al solo essere importato è
// un modulo che non si può provare.
const lanciato = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (lanciato) {
  main().catch((e) => {
    console.error(`Visita non riuscita: ${e?.message || e}`);
    rilasciaLock();
    process.exit(2); // non riuscita ≠ tutto bene
  });
}
