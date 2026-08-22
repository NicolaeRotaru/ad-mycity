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
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, statfsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GIRI_PER_CRONICO, dilloAVoce, quadroCronicita, statoAllarme } from "./cronicita-allarmi.mjs";
import { leggiEsito } from "./esito-guardiano.mjs";
import {
  COMPITI_DELLA_REVIEW,
  NON_VISTO,
  REGISTRO_FRESCHEZZA,
  STANTIO,
  etaReferto,
  timbraReferto,
  verdettoReferti,
} from "./eta-referto.mjs";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { percorsiDaGit } from "./percorsi-git.mjs";
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
  rinviiRossi: 10, // watch-main gira ogni minuto: 10 rinvii di fila non è traffico, è un inceppo
  commitNonPubblicati: 50, // un giro normale ne lascia pochi; 50 vuol dire che il push non passa più
  discoLiberoMinMB: 200, // un giro del banco crea ~32 cartelle da qualche mega: sotto 200 MB si rischia
  discoLiberoMinFrazione: 0.1, // e su un disco grande il 10% conta più dei 200 MB fissi
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

/**
 * Il MOTIVO di un guasto, preso da dove il guardiano l'ha scritto.
 *
 * IL CASO VERO, 13→14 agosto. Il referto diceva a Nicola: «Token, push e allineamento git —
 * l'automazione ha un controllo fallito — { · "esito": "errore",». Cioè il motivo era una parentesi
 * graffa. Sei guardiani della visita rispondono in JSON (`--json`), e di quel JSON si stampavano le
 * prime due righe: `{` e `"esito": "errore",` — le uniche due che non dicono niente. Il riassunto
 * vero stava tre righe sotto, nel campo `sintesi`: «1 FALLITI: token ad-mycity».
 *
 * Il danno non è estetico. Chi legge il referto deve poter AGIRE: «un controllo fallito» manda a
 * cercare quale, e per due giorni quel rosso è rimasto lì senza che nessuno sapesse cosa riparare.
 * Un verdetto che non nomina la cosa rotta costa quanto un verdetto assente.
 *
 * Pura apposta: entra il testo, esce la frase. I nomi dei campi sono quelli che i guardiani di
 * questa macchina usano già — `sintesi` è la convenzione, gli altri sono la rete.
 */
export function motivoDelGuasto(out, quante = 2) {
  const testo = String(out || "").trim();
  if (testo.startsWith("{") || testo.startsWith("[")) {
    try {
      const j = JSON.parse(testo);
      const dentro = Array.isArray(j) ? j[0] : j;
      for (const campo of ["sintesi", "motivo", "perche", "errore", "dettaglio"]) {
        const v = dentro?.[campo];
        if (typeof v === "string" && v.trim()) return v.trim().slice(0, 240);
      }
    } catch {
      // JSON troncato o non valido: meglio le prime righe che niente — ma lo dice il fallback.
    }
  }
  return primaRigaUtile(testo, quante);
}

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

/**
 * Traduce un guardiano già esistente in un esito, senza reinterpretare i suoi codici d'uscita.
 *
 * AR-667 — QUI DENTRO C'ERA LA PORTA APERTA. La riga era `rossoSe(code) ? rotto : ok`, con
 * `ciecoSe` che valeva `() => false` per chi non lo dichiarava. Bastava un controllo tarato su un
 * codice preciso — «rosso se è 1» — perché ogni ALTRO codice, il 2 compreso, cadesse nel ramo `ok` e
 * stampasse la frase rassicurante. Nel contratto di casa (AR-322) il 2 vuol dire «non ho potuto
 * misurare», che è la cosa più lontana da un verde che ci sia.
 *
 * Adesso la decisione non abita più qui: la prende `leggiEsito` in `cervello/esito-guardiano.mjs`,
 * dove una prova la può ESEGUIRE su un numero finto invece di cercarne la forma in questo file. E il
 * patto è che un chiamante possa stringere le regole ma non far sparire il cieco.
 */
export function daGuardiano(r, { comando, rossoSe, dettoOk, dettoRotto, ciecoSe }) {
  if (!r.partito) return { ...guasto(r.motivo), prova: comando };
  const v = leggiEsito(r.code, { rossoSe, ciecoSe, partito: r.partito });
  if (v.stato === "cieco")
    return { ...nonVisto(`il controllo non ha potuto misurare: ${motivoDelGuasto(r.out) || v.motivo}`), prova: comando, ms: r.ms };
  const esito =
    v.stato === "rosso"
      ? rotto(`${dettoRotto} — ${motivoDelGuasto(r.out)}`, { uscita: r.code })
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
 * I file dove i processi automatici lasciano il loro orario, e il campo che lo contiene.
 *
 * Sta qui, in un posto solo, perché lo legge anche il guardiano esterno (`battito-esterno.mjs`):
 * due elenchi copiati a mano divergono al primo file nuovo, e il guardiano finirebbe per misurare
 * una macchina diversa da quella che misura la visita.
 */
export const FONTI_TRACCE = [
  ["auto-coscienza/sentinella-dati.json", "aggiornato"],
  ["auto-coscienza/esito-giro.json", "data"],
  ["auto-coscienza/costo-ai.json", "aggiornato"],
  ["auto-coscienza/delta-gate.json", "aggiornato"],
  ["ultimo-briefing.json", "data"],
];

/**
 * Raccoglie le tracce dal disco. Il controllo che funziona SEMPRE, in tutte e due le case, anche
 * senza una chiave: i processi automatici scrivono nel repo, e il repo ce l'ho sotto gli occhi.
 * Se un timer scatta ma qui non arriva niente, il guasto non è il timer — è quello che ci sta dentro.
 */
export function leggiTracce(radice = AD_ROOT) {
  const tracce = [];
  for (const [rel, campo] of FONTI_TRACCE) {
    const p = join(radice, "MyCity-Vault/90-Memoria-AI", rel);
    if (!existsSync(p)) continue;
    try {
      const quando = JSON.parse(readFileSync(p, "utf8"))[campo];
      if (quando) tracce.push({ file: rel.split("/").pop(), quando });
    } catch {
      /* un file illeggibile non è una traccia: semplicemente non conta */
    }
  }
  return tracce;
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

/**
 * Il battito del RITMO: piano del mattino, report della sera, review della settimana.
 *
 * AR-594 — il 13/8 la sveglia delle cadenze era rossa (quattro fuori finestra, tre uscite saltando
 * dei passi) e la parola «cadenza» non compariva NEMMENO UNA VOLTA in salute.json. Cioè il referto
 * che Nicola apre per chiedere «la macchina sta bene?» rispondeva sugli altri organi e taceva
 * proprio sul battito fermo. L'esito del guardiano esisteva già: gli mancava un lettore in questo
 * referto — è la stessa forma del freno muto di AR-465, un piano più su.
 *
 * PURA: prende l'uscita del guardiano (`{partito, code, out}`) e ne fa un verdetto. La prova gliela
 * inietta, così si può provare il caso «sei cadenze rosse» senza aspettare che accada davvero.
 */
export function giudicaCadenze(r) {
  const prova = "node cervello/freschezza-cadenze.mjs";
  if (!r?.partito) return { ...guasto(r?.motivo ?? "il guardiano delle cadenze non è partito"), prova };
  let d = null;
  const i = String(r.out ?? "").indexOf("{");
  if (i >= 0) {
    try {
      d = JSON.parse(String(r.out).slice(i));
    } catch {
      /* resta null → ⚪ qui sotto: un guardiano che non risponde non è «tutto a posto» */
    }
  }
  if (r.code === 2 || d?.cieco)
    return { ...nonVisto(`non ho potuto leggere gli esiti delle cadenze: ${primaRigaUtile(r.out)}`), prova };
  if (!d || !Array.isArray(d.invecchiate))
    return { ...nonVisto("il guardiano delle cadenze non ha risposto in modo leggibile: non so dire se il ritmo gira"), prova };

  const ferme = d.invecchiate.map((x) => x.tipo);
  const saltate = (d.passiSaltati || []).map((x) => x.tipo);
  if (ferme.length || saltate.length) {
    // 2026-08-21 — QUESTA FRASE LA LEGGE NICOLA, e il metro della scrittura l'aveva bocciata.
    // Prima era un periodo solo con DUE elenchi fra parentesi incastrati dentro: «5 cadenze su 6 non
    // si alzano più (a, b, c, d, e), e 2 sono uscite saltando dei passi (f, g)». Chi legge deve
    // tenere in sospeso l'idea di partenza per tutta la prima parentesi, e quando arriva alla
    // seconda l'ha già persa. Il contenuto non cambia di una parola: cambia che ogni elenco si
    // prende la sua frase, e che i due punti sostituiscono le parentesi.
    const frasi = ["il ritmo della macchina si è fermato."];
    if (ferme.length)
      frasi.push(
        ferme.length === 1
          ? `Non si alza più 1 cadenza su ${d.totali}: ${ferme[0]}.`
          : `Non si alzano più ${ferme.length} cadenze su ${d.totali}: ${ferme.join(", ")}.`,
      );
    if (saltate.length)
      frasi.push(
        saltate.length === 1
          ? `Un'altra è uscita saltando dei passi: ${saltate[0]}.`
          : `Altre ${saltate.length} sono uscite saltando dei passi: ${saltate.join(", ")}.`,
      );
    return { ...rotto(frasi.join(" "), { ferme, saltate, totali: d.totali }), prova };
  }
  const maiViste = (d.maiViste || []).length;
  return {
    ...ok(
      maiViste
        ? `le cadenze che hanno girato sono tutte dentro la loro finestra (${maiViste} non ha ancora mai girato)`
        : `tutte le ${d.totali} cadenze si sono alzate dentro la loro finestra`,
      { totali: d.totali, maiViste },
    ),
    prova,
  };
}

/**
 * AR-215 / AR-578 / AR-581 — I FILE CHE LA CABINA MOSTRA SONO ANCORA VALIDI?
 *
 * La visita sapeva già dire se il VPS aveva smesso di visitarsi (`giudicaPonte`) e se qualcuno
 * lasciava tracce (`giudicaTracce`), ma non c'era nessuno che si chiedesse, file per file, «questo
 * che il Pannello mostra al presente, di quando è?». La freschezza era cablata come toppa per-file
 * — una per la checklist, una per gli OKR, una per l'intelligence — e ogni file nuovo nasceva
 * scoperto: le «Mosse di Nicola» sono rimaste ferme al 23 luglio per giorni senza che nulla
 * suonasse, e il referto di questo stesso checkup è rimasto indietro 45 ore mentre la memoria
 * accanto si aggiornava ogni sera.
 *
 * PURA: prende i verdetti già calcolati (uno per referto) e ne fa UN esito della visita. Il rosso
 * vince sul ⚪, e il ⚪ non diventa mai verde — un referto che non ho potuto vedere è un buco
 * dichiarato, esattamente come i controlli che non ho potuto fare.
 */
export function giudicaFreschezza(referti) {
  const v = verdettoReferti(referti);
  if (v.stato === STANTIO) {
    const elenco = v.stantii.map((r) => `${r.nome} (${r.eta_ore != null ? `${Math.round(r.eta_ore)}h` : "?"})`).join(", ");
    return rotto(`${v.stantii.length} file che la Cabina mostra sono più vecchi della loro scadenza: ${elenco}`, {
      stantii: v.stantii.map((r) => r.nome),
      nonVisti: v.nonVisti.map((r) => r.nome),
    });
  }
  if (v.stato === NON_VISTO) return nonVisto(v.perche, { nonVisti: v.nonVisti.map((r) => r.nome) });
  return ok(`${v.freschi.length} file di memoria tutti dentro la loro scadenza dichiarata`, { quanti: v.freschi.length });
}

/**
 * AR-593 — LA REVIEW DEL VENERDÌ HA LASCIATO I COMPITI?
 *
 * `ritmo.md` marca «OBBLIGATORIO ogni venerdì» quattro prodotti: benchmark, peer review,
 * calibrazione, lettera a Nicola. Il 13/8 erano fermi rispettivamente a 24 luglio, 24 luglio, 7
 * luglio e 30 luglio — tre venerdì senza compiti — e nessun contatore lo diceva, perché la
 * freschezza si misurava sull'ULTIMA RIGA DI ESITO della corsa (che ha cinque giorni e sembra sana)
 * e mai sui compiti che la corsa doveva lasciare. È la stessa malattia già curata una volta — «si
 * controlla che la sveglia sia carica, mai che qualcuno si sia alzato» — tornata un piano più su.
 *
 * Il dettaglio che la fa funzionare: l'età NON si legge in cima al file. `auto-miglioramento.json`
 * porta `aggiornato: oggi` perché glielo riscrive `sincronizza-proposte.mjs` a ogni giro, mentre il
 * benchmark dentro è di venti giorni prima. Si guarda il ramo, non la copertina.
 */
export function giudicaCompiti(referti) {
  const v = verdettoReferti(referti);
  if (v.stato === STANTIO) {
    const elenco = v.stantii.map((r) => `${r.nome} (${r.eta_ore != null ? `${Math.round(r.eta_ore / 24)} giorni` : "?"})`).join(", ");
    return rotto(`la review del venerdì non lascia più i suoi compiti: ${elenco}`, { fermi: v.stantii.map((r) => r.nome) });
  }
  if (v.stato === NON_VISTO) return nonVisto(`non ho potuto misurare i compiti della review: ${v.perche}`, { nonVisti: v.nonVisti.map((r) => r.nome) });
  return ok(`i ${v.freschi.length} compiti della review del venerdì sono tutti recenti`, { quanti: v.freschi.length });
}

/** Legge un JSON del vault. `null` quando non c'è o non si parsa: null ≠ documento vuoto. */
function leggiJsonMemoria(rel, radice = AD_ROOT) {
  const p = join(radice, "MyCity-Vault/90-Memoria-AI", rel);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

/**
 * I compiti della review letti dal disco. Un `.md` non ha campi: il suo timbro è la data scritta nel
 * titolo — e resta un timbro DENTRO il testo, non la data di modifica del file.
 */
export function leggiCompitiReview(radice = AD_ROOT, adessoMs = Date.now()) {
  return COMPITI_DELLA_REVIEW.map((c) => {
    let dato = null;
    if (c.file.endsWith(".md")) {
      const p = join(radice, "MyCity-Vault/90-Memoria-AI", c.file);
      if (existsSync(p)) {
        const testo = readFileSync(p, "utf8").slice(0, 400);
        const m = testo.match(/(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}))?/);
        if (m) dato = { data: m[2] ? `${m[1]} ${m[2]}` : m[1] };
      }
    } else {
      dato = leggiJsonMemoria(c.file, radice);
    }
    return etaReferto({ dato, scadenzaOre: c.scadenzaOre, adessoMs, nome: c.nome, dentro: c.dentro });
  });
}

/** I referti del registro unico, letti dal disco e giudicati uno per uno. */
export function leggiReferti(radice = AD_ROOT, adessoMs = Date.now()) {
  return REGISTRO_FRESCHEZZA.map((r) =>
    etaReferto({ dato: leggiJsonMemoria(r.percorso, radice), scadenzaOre: r.scadenzaOre, adessoMs, nome: r.nome }),
  );
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

/**
 * AR-470 — «il server riesce a pubblicare quello che scrive?»
 *
 * Il 30/7 a mezzogiorno l'allineamento del VPS si è inceppato e ci è rimasto 31 ore: 1716 rinvii
 * consecutivi, 1519 commit scritti e mai pubblicati. Il contatore dei rinvii ESISTEVA — watch-main lo
 * stampava a ogni giro, con tanto di «1716 CONSECUTIVI» — e l'allarme veniva perfino scritto in una
 * riga di Supabase. Solo che quella riga non la legge nessuno, e il log di sistema nemmeno. Lo stallo
 * è finito perché Nicola ha provato un comando a mano su un telefono.
 *
 * È la stessa forma del freno muto di AR-465, un piano più in alto: il verdetto c'era, mancava il
 * canale. Qui il canale è la visita — l'unico posto che si guarda quando ci si chiede «sta bene?».
 *
 * Due numeri, e il peggiore vince: da quanti giri l'allineamento rimanda, e quanti commit il server
 * si porta dietro senza averli mandati su GitHub.
 */
/**
 * Il verdetto sul battito della guardia in tempo reale (AR-498). Pura: è la decisione, e le decisioni
 * stanno dove un test le può eseguire.
 *
 * Il caso delicato è il terzo. Un battito assente da una sessione appena clonata è NORMALE — quel
 * file vive fuori da git apposta — e farne un ❌ vorrebbe dire nascere rossi a ogni clone, cioè
 * insegnare a scorrere quella riga entro tre giorni. Diventa rosso solo quando in questa copia
 * qualcuno ha già modificato dei file: allora un Edit c'è stato, e la guardia doveva parlare.
 */
export function giudicaBattitoGuardia(uscita, detto, sporchi = 0) {
  if (uscita === 0) return ok(detto, { uscita });
  if (sporchi > 0) {
    return rotto(`${sporchi} file modificati in questa copia e il sorvegliante non ha mai scattato: il canale in tempo reale è staccato`, { sporchi, uscita });
  }
  return nonVisto("il sorvegliante non ha ancora scattato in questa copia: il battito vive fuori da git, e da una sessione nuova non lo posso vedere", { uscita });
}

export function giudicaPubblicazione({ rinvii, ahead, cieco } = {}, soglie = SOGLIE) {
  if (cieco) return nonVisto(cieco);
  const n = Number(rinvii) || 0;
  const a = Number(ahead) || 0;
  const dati = { rinvii: n, commitNonPubblicati: a };
  // I rinvii prima: dicono che il meccanismo è INCEPPATO, mentre l'arretrato dice solo che è indietro.
  if (n >= soglie.rinviiRossi)
    return rotto(`l'allineamento rimanda da ${n} giri di fila: il server scrive e non pubblica più`, dati);
  if (a >= soglie.commitNonPubblicati)
    return rotto(`${a} commit scritti dal server non sono su GitHub`, dati);
  if (a > 0) return ok(`${a} commit in attesa di pubblicazione, sotto la soglia di ${soglie.commitNonPubblicati}`, dati);
  return ok("tutto quello che il server scrive arriva su GitHub", dati);
}

/**
 * Il valore di un fatto-chiave nel registro. PURA: prende il registro già letto, così la prova la
 * esegue su un registro finto invece di dipendere da com'è oggi quello vero.
 */
export function valoreFatto(registro, id) {
  const fatti = Array.isArray(registro?.fatti) ? registro.fatti : [];
  const f = fatti.find((x) => x?.id === id);
  const v = f?.valore;
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

/**
 * L'indirizzo della Cabina: l'ambiente vince, poi il registro dei fatti, poi il vecchio ponte.
 *
 * AR-438. L'URL del Pannello non è un segreto — è la pagina pubblica che Nicola apre dal telefono —
 * ma per mesi è vissuto SOLO nelle env del VPS: ogni sessione cloud rispondeva «manca PANNELLO_URL»
 * e i due controlli cabina.* restavano ⚪ per una chiave che non era mai servita. Il codice trattava
 * uguale due cose diverse: i SEGRETI (che giustamente fuori dal VPS non ci sono) e gli INDIRIZZI
 * PUBBLICI (che si possono sapere ovunque).
 *
 * DOVE VIVE IL VALORE, che è l'altra metà del difetto. I fatti-chiave hanno UNA casa sola —
 * `registro-fatti.json` (AR-102) — e questa funzione la interroga per prima. `cervello/ponte-cabina.json`
 * resta solo come rete finché il fatto `cabina.url` non è registrato lì: quando c'è, il ponte va
 * cancellato, perché due case per lo stesso valore sono il modo con cui un indirizzo vecchio
 * sopravvive in un file e la macchina mente senza accorgersene.
 *
 * L'ordine non è un dettaglio: se un giorno il Pannello cambia casa, l'ambiente del VPS lo corregge
 * subito e il registro lo corregge per tutti, senza toccare una riga di codice.
 */
export function urlCabina(env = process.env, root = AD_ROOT) {
  const pulisci = (v, fonte) => ({ url: String(v).trim().replace(/\/$/, ""), fonte });
  const daEnv = env.PANNELLO_URL || env.CABINA_URL;
  if (daEnv) return pulisci(daEnv, "ambiente");
  try {
    const registro = JSON.parse(readFileSync(join(root, "MyCity-Vault/90-Memoria-AI/registro-fatti.json"), "utf8"));
    const v = valoreFatto(registro, "cabina.url");
    if (v) return pulisci(v, "registro-fatti.json (cabina.url)");
  } catch {
    /* il registro è la casa giusta, ma se manca si prova comunque il ponte qui sotto */
  }
  try {
    const j = JSON.parse(readFileSync(join(root, "cervello/ponte-cabina.json"), "utf8"));
    if (j.pannello_url) return pulisci(j.pannello_url, "ponte-cabina.json");
  } catch {
    /* né env, né registro, né ponte: si resta ⚪, e il ⚪ dice cosa manca */
  }
  return null;
}

/** Il ⚪ dell'indirizzo mancante, detto una volta sola per tutti e due i controlli della Cabina. */
const SENZA_INDIRIZZO =
  "non so a quale indirizzo sta la Cabina: manca PANNELLO_URL / CABINA_URL nell'ambiente, manca il fatto cabina.url nel registro e manca anche cervello/ponte-cabina.json";

/**
 * La voce del PROXY non è la voce della Cabina.
 *
 * Negli ambienti cloud l'uscita di rete passa da un proxy con allowlist: un host non ammesso torna
 * come errore di trasporto (CONNECT 403) O come una risposta HTTP 403 vera con corpo «Host not in
 * allowlist» — misurato il 13/8 da questa stessa sessione. Trattarla come «la Cabina risponde 403»
 * sarebbe un ❌ falso su un servizio sano: il verdetto giusto è ⚪ «da QUESTO ambiente non si passa».
 */
export function reteChiusa(r) {
  if (!r) return false;
  if (!r.ok) return /allowlist|egress|CONNECT|ENOTFOUND|EAI_AGAIN|ECONNREFUSED|proxy/i.test(String(r.errore || ""));
  return (r.status === 403 || r.status === 407) && /allowlist|egress|proxy/i.test(String(r.testo || ""));
}

/**
 * VIVA-ma-protetta. Il 401 non è un guasto: è qualcuno che risponde «e tu chi sei?».
 *
 * AR-438, la trappola che rovesciava il guadagno. Con Vercel Authentication accesa la Cabina
 * risponde 401 a chi non ha la sessione: leggerlo come rosso trasformerebbe un servizio SANO in due
 * ❌ falsi — e un referto che grida al lupo su una cosa che funziona è peggio del ⚪ che sostituisce.
 * Chi risponde 401 è in piedi: il muro davanti alla porta è la prova che dietro c'è qualcuno.
 *
 * Il 403 vale solo con una firma esplicita nel corpo: un 403 generico è un rifiuto che va guardato,
 * non una protezione da assolvere. E il 407 non è nemmeno la Cabina: è il proxy dell'ambiente.
 */
export function protettaDaLogin(r) {
  if (!r || !r.ok) return false;
  if (r.status === 401) return true;
  return r.status === 403 && /_vercel_sso_nonce|vercel authentication|authentication required|\bsso\b/i.test(String(r.testo || ""));
}

/** La Cabina vista da fuori: risponde, risponde male, risponde troppo tardi, o risponde protetta. */
export function giudicaCabina(r, soglie = SOGLIE) {
  if (!r || !r.ok) return rotto(`la Cabina non risponde: ${r?.errore ?? "nessuna risposta"}`);
  // Il proxy che chiede le credenziali A NOI non è la Cabina che risponde male: è questo ambiente
  // che non arriva fin là. Non è un rosso e non è un verde — è un buco dichiarato.
  if (r.status === 407) return nonVisto("la rete di questo ambiente chiede un'autenticazione al proxy: non ho parlato con la Cabina", { status: r.status });
  if (protettaDaLogin(r))
    return ok(`è viva e protetta da login (${r.status}): risponde in ${(r.ms / 1000).toFixed(1)}s, ma da qui non entro`, {
      ms: r.ms,
      status: r.status,
      protetta: true,
    });
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

/**
 * Le braccia che esistono solo qui: skill native (scritte a mano) che git non sta versionando.
 *
 * Il 29/7 questa visita è stata scritta insieme alle skill `salute`, `worker` e `senior` — e le tre
 * skill sono finite sotto una regola di `.gitignore` pensata per lo specchio generato. `git add -A`
 * non le ha viste, il commit è riuscito, `git status` è rimasto pulito, la PR è stata mergiata: su
 * main è arrivato il motore senza le braccia. Nessun errore da nessuna parte — solo un file assente.
 *
 * Una skill che vive in una sola sessione non esiste: il container è effimero e il VPS non la vedrà
 * mai. Perciò è un rosso, e sta qui e non in un test perché la domanda «le mie braccia ci sono
 * ancora?» va rifatta a ogni visita, non una volta sola quando qualcuno lancia i test.
 */
export function skillNonVersionate(cartelle, { generata, versionata }) {
  return cartelle.filter((nome) => !generata(nome) && !versionata(nome));
}

/** Peggiorato da ieri: era verde, oggi è rosso. Il segnale più forte, perché isola il cambiamento. */
export function marcaRegressioni(controlliPrecedenti, risultati) {
  const primaOk = new Set((controlliPrecedenti || []).filter((c) => c.esito === "ok").map((c) => c.id));
  for (const r of risultati) r.regressione = r.esito === "rotto" && primaOk.has(r.id);
  return risultati;
}

/**
 * AR-440 — da quante visite di fila questo rosso è rosso.
 *
 * La regressione (qui sopra) trova il rosso NUOVO; questa trova quello vecchio, che è il più
 * pericoloso dei due: un allarme acceso da settimane si legge uguale a uno acceso da un minuto, e
 * quindi diventa sfondo. Il conto sopravvive fra una visita e l'altra dentro salute.json — è
 * esattamente lo «stato che manca fra un giro e l'altro» del quinto perché della scheda.
 *
 * Anche i miei controlli guasti (🔧) contano: un controllo che non parte da dieci visite è una
 * difesa spenta di fatto, e va vista come tale.
 */
export function marcaCronicita(contoPrecedente, risultati, soglia = GIRI_PER_CRONICO) {
  const accesi = risultati.filter((r) => r.esito === "rotto" || r.esito === "guasto").map((r) => r.id);
  const quadro = quadroCronicita(contoPrecedente || {}, accesi, soglia);
  for (const r of risultati) {
    const giri = quadro.conto[r.id] || 0;
    r.rossoDa = giri;
    r.cronico = statoAllarme(giri, soglia).cronico;
    // «visite», non «giri»: qui l'unità di misura è la visita, e ogni numero deve arrivare col suo
    // metro — «12» da solo non dice se sono ore, giorni o controlli.
    r.daQuanto = dilloAVoce(giri, soglia, "visite");
  }
  return quadro;
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

/**
 * Quanto spazio resta sul disco temporaneo, chiesto al sistema.
 *
 * `statfsSync` dà i blocchi disponibili all'utente (`bavail`), non quelli totalmente liberi:
 * è il numero che conta, perché è quello che un processo non-root può davvero usare.
 */
export function misuraDisco(dir = tmpdir()) {
  try {
    const f = statfsSync(dir);
    return { dir, liberi: f.bavail * f.bsize, totali: f.blocks * f.bsize, leggibile: true };
  } catch (e) {
    return { dir, leggibile: false, perche: String(e?.message || e) };
  }
}

/**
 * IL SENSORE CHE NON C'ERA — e la macchina è stata ferma quasi tre giorni per questo.
 *
 * Dal 18 al 21 agosto il Pannello non si è aggiornato. La catena, tutta verificata: `/tmp` pieno al
 * 100% → `c4-segreti.sh` non riesce più a scrivere il file con la chiave della memoria → ogni
 * chiamata autenticata fallisce → lo stato di pausa non è leggibile → il freno fail-closed ferma il
 * worker. Un disco pieno travestito da interruttore di pausa.
 *
 * In quei tre giorni la visita della salute controllava worker, cervello, Cabina, senior e sensori:
 * **il disco non lo guardava nessuno**. Il guasto più banale che esista era anche l'unico senza un
 * metro, ed è per questo che l'ha trovato Nicola con un `df` e non la macchina.
 *
 * Due soglie insieme, perché una sola sbaglia da una parte o dall'altra: 200 MB fissi (un giro del
 * banco delle prove ne chiede più o meno tanti tutti insieme) e il 10% del volume (su un disco
 * grande 200 MB liberi sono già l'orlo del burrone).
 */
export function giudicaDisco(m, soglie = SOGLIE) {
  if (!m || m.leggibile !== true) return nonVisto(`non ho potuto misurare lo spazio su ${m?.dir || "?"}: ${m?.perche || "sconosciuto"}`);
  const mb = (b) => Math.round(b / 1024 / 1024);
  const minimo = Math.max(soglie.discoLiberoMinMB * 1024 * 1024, m.totali * soglie.discoLiberoMinFrazione);
  const percento = m.totali > 0 ? Math.round((m.liberi / m.totali) * 100) : 0;
  const dati = { dir: m.dir, liberiMB: mb(m.liberi), totaliMB: mb(m.totali), percentoLibero: percento };
  if (m.liberi < minimo) {
    return rotto(
      `su ${m.dir} restano ${mb(m.liberi)} MB su ${mb(m.totali)} (${percento}%): sotto i ${mb(minimo)} MB che servono. ` +
        "È il guasto che il 20 agosto ha fermato la macchina per tre giorni. Svuota con: node cervello/spazza-temporanei.mjs",
      dati,
    );
  }
  return ok(`su ${m.dir} restano ${mb(m.liberi)} MB su ${mb(m.totali)} (${percento}%)`, dati);
}

// ── I controlli ────────────────────────────────────────────────────────────────
// Ognuno dichiara: quale organo, quanto pesa, dove può girare, e come si prova.
// `soloSu` esiste perché un controllo eseguito dove non può vedere produce rumore, non conoscenza.

// Esportata perché una prova possa ESEGUIRE i controlli con un guardiano finto invece di cercarne
// il nome dentro il sorgente: è la differenza fra provare l'effetto e provare la forma.
export const CONTROLLI = [
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
      return giudicaTracce(leggiTracce());
    },
  },
  {
    // AR-594 — la voce che mancava. Il guardiano del ritmo esisteva già e finiva solo nel prompt del
    // giro; qui entra nel referto, che è il posto dove Nicola guarda quando chiede «sta bene?».
    // `esegui` si può iniettare: senza, la prova dovrebbe aspettare che le cadenze si fermino DAVVERO.
    id: "worker.cadenze",
    organo: "worker",
    titolo: "Le cadenze si alzano davvero",
    impatto: 2,
    async prova({ esegui = eseguiNode } = {}) {
      return giudicaCadenze(esegui("freschezza-cadenze.mjs", ["--json"], 60_000));
    },
  },
  {
    // AR-215 / AR-578 / AR-581 — il registro unico di freschezza, al posto delle quattro toppe
    // per-file. Sta fra i controlli del worker perché la domanda è la sua: «la macchina sta ancora
    // riscrivendo quello che il Pannello mostra?». Un file di memoria pieno e vecchio è la forma più
    // silenziosa di bugia: non è vuoto (si vedrebbe), è pieno e di tre giorni fa.
    // `adessoMs` e `radice` si iniettano: senza, la prova dovrebbe aspettare che un file invecchi.
    id: "cervello.freschezza",
    organo: "cervello",
    titolo: "I file che la Cabina mostra sono ancora validi",
    impatto: 2,
    async prova({ radice = AD_ROOT, adessoMs = Date.now() } = {}) {
      return giudicaFreschezza(leggiReferti(radice, adessoMs));
    },
  },
  {
    // AR-593 — non «la review è partita» ma «la review ha lasciato i compiti».
    id: "cervello.riti",
    organo: "cervello",
    titolo: "La review del venerdì lascia i suoi compiti",
    impatto: 3,
    async prova({ radice = AD_ROOT, adessoMs = Date.now() } = {}) {
      return giudicaCompiti(leggiCompitiReview(radice, adessoMs));
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
    // Il metro del disco. Sta fra i controlli del worker perché la domanda è la sua: «la macchina ha
    // ancora il posto per lavorare?». Solo sul VPS: da una sessione in cloud misurerei il disco di un
    // contenitore usa-e-getta e lo racconterei come se fosse il server — un verde su una macchina che
    // non è quella di Nicola è peggio di nessun numero.
    id: "worker.disco",
    organo: "worker",
    titolo: "Il disco temporaneo ha ancora posto per lavorare",
    impatto: 1,
    soloSu: "vps",
    async prova() {
      return giudicaDisco(misuraDisco());
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
    id: "worker.pubblicazione",
    organo: "worker",
    titolo: "Quello che il server scrive arriva su GitHub",
    impatto: 2,
    soloSu: "vps",
    async prova() {
      // Il contatore lo tiene watch-main: il file c'è SOLO mentre l'allineamento sta rimandando, e
      // sparisce al primo giro riuscito. Assente = nessun rinvio in corso, che è la notizia buona.
      let rinvii = 0;
      const contatore = join(AD_ROOT, ".git", "mycity-watch-main-rinvii");
      try {
        if (existsSync(contatore)) rinvii = Number(readFileSync(contatore, "utf8").trim()) || 0;
      } catch {
        return giudicaPubblicazione({ cieco: "non ho potuto leggere il contatore dei rinvii di watch-main" });
      }
      // L'arretrato si misura contro FETCH_HEAD, che watch-main aggiorna ogni minuto: `origin/main`
      // sul server non lo muove nessuno, e usarlo darebbe un numero sempre rassicurante.
      const conta = (rif) => {
        const r = spawnSync("git", ["rev-list", "--count", `${rif}..HEAD`], { cwd: AD_ROOT, encoding: "utf8" });
        return r.status === 0 ? Number(r.stdout.trim()) : null;
      };
      const ahead = conta("FETCH_HEAD") ?? conta("origin/main");
      if (ahead === null) return giudicaPubblicazione({ cieco: "git non mi ha detto quanti commit ci sono da pubblicare" });
      return giudicaPubblicazione({ rinvii, ahead });
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
        // Il 2 dello scanner (errore interno) è cieco per contratto di casa: non serve dirlo qui.
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
      // 2026-08-21 — il tetto era 300s e la suite ne misurava 822: il controllo non partiva e
      // usciva 🔧 GUASTO, cioè «non ho potuto misurare», che manda a indagare da nessuna parte.
      // Tolte le due attese cieche sul Pannello la suite sta in 316s, misurati. 600s è il doppio
      // del tempo che serve davvero: lascia respiro a una macchina lenta e resta abbastanza stretto
      // da accorgersi di una suite che raddoppia. Il caso «una prova si pianta» adesso lo ferma il
      // tetto per-prova dentro il banco, che la uccide e la NOMINA invece di mangiarsi tutto.
      const r = eseguiNode("test-cervello.mjs", [], 600_000);
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
    id: "cervello.sorvegliante",
    organo: "cervello",
    titolo: "La guardia in tempo reale ha davvero scattato",
    impatto: 3,
    async prova() {
      // PERCHÉ QUESTO CONTROLLO ESISTE (AR-498). Il sorvegliante scrive un battito apposta per
      // rispondere a «sei vivo?» — l'unica domanda a cui il silenzio non sa rispondere da solo. Per
      // tre giorni quel battito non l'ha letto NESSUNO: `--battito` non era chiamato da nessuno
      // script, solo citato in una scheda. Cioè la cura di AR-465 (un verdetto senza lettore) era
      // stata costruita con dentro lo stesso difetto, un piano più su.
      //
      // COPERTURA DICHIARATA, e conta più del verde: qui si prova che la guardia HA GIRATO in questa
      // copia, non che abbia visto l'ultima modifica. Le modifiche fatte da un comando invece che da
      // un Edit non la svegliano affatto (l'hook è agganciato a Edit|Write|MultiEdit): quello è un
      // buco noto e dichiarato, non qualcosa che questo controllo copre.
      const prova = "node cervello/sorvegliante.mjs --battito";
      const r = eseguiNode("sorvegliante.mjs", ["--battito"], 20_000);
      if (!r.partito) return { ...guasto(r.motivo), prova };
      const st = spawnSync("git", ["status", "--porcelain"], { cwd: AD_ROOT, encoding: "utf8" });
      // Se `git` non risponde non deduco «albero pulito»: senza quella misura non posso distinguere
      // il clone nuovo dal canale staccato, e allora resta ⚪ — che è la risposta vera.
      const sporchi = st.status === 0 ? String(st.stdout || "").split("\n").filter(Boolean).length : 0;
      return { ...giudicaBattitoGuardia(r.code, primaRigaUtile(r.out), sporchi), prova, ms: r.ms };
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

  {
    // AR-474 — l'abitudine: «quando finisco, scrivo il verdetto dove è comodo per me, non dove lo
    // legge Nicola». I due cancelli la fermano in avanti; questo dice se sta davvero scomparendo.
    //
    // Sta nella VISITA e non in un comando a parte perché la visita è la cosa che Nicola chiede
    // («controlla se funziona tutto»): il numero finisce nel referto che legge, non in un file che
    // dovrebbe andare a cercare. Verificato dove atterra invece di darlo per scontato: `salute.json`
    // + `consegne/salute/AAAA-MM-GG-*.md`. Il campo `ultime` NON è renderizzato da nessuna schermata
    // della Cabina — l'ho controllato nel Pannello, non dedotto — e quel buco è AR-476, dichiarato
    // aperto invece che raccontato come coperto.
    id: "cervello.esiti",
    organo: "cervello",
    titolo: "Il lavoro consegnato dice com'è andato",
    impatto: 2,
    async prova() {
      const r = eseguiNode("conta-verdetti-muti.mjs", ["--json"], 120_000);
      if (!r.partito) return guasto(r.motivo);
      if (r.code === 2) return nonVisto(`non ho potuto contare: ${String(r.out).trim().slice(0, 140)}`);
      // `out` mescola stdout e stderr: il JSON è il primo oggetto che comincia. Se non c'è, è ⚪ —
      // un contatore che non risponde non è «zero consegne mute», è un contatore che non ha risposto.
      let d = null;
      const i = String(r.out).indexOf("{");
      if (i >= 0) {
        try {
          d = JSON.parse(String(r.out).slice(i));
        } catch {
          /* resta null → ⚪ qui sotto */
        }
      }
      if (!d || typeof d.consegne !== "number") return nonVisto("il contatore dei verdetti muti non ha risposto in modo leggibile");
      const cab = d.cabina
        ? ` · Cabina ${d.cabina.giorni_indietro} giorni indietro (STATO al ${d.cabina.stato_aggiornato})`
        : " · Cabina: data di STATO.md illeggibile";
      const testo = `${d.mute} consegne su ${d.consegne} degli ultimi ${d.finestra_giorni} giorni senza una riga di esito (${d.tasso}%)${cab}`;
      return r.code === 0 ? ok(testo, d) : rotto(`${testo} — il debito si è allargato rispetto al tetto`, d);
    },
  },

  {
    // AR-703 — IL NUMERO CON CUI SI RISPONDE A «STO MIGLIORANDO?», E CHI LO ASCOLTA.
    //
    // `salute-onesta.mjs` conta i difetti aperti adesso e quelli aperti una settimana fa: è la
    // risposta alla domanda che Nicola fa più spesso sul cantiere — «sta calando davvero?». Aveva
    // il contratto d'uscita di un guardiano e non lo lanciava NESSUN processo: il verdetto veniva
    // stampato su una console che non leggeva nessuno, e il burn-down che il Pannello mostra
    // arrivava da un'altra strada, cioè non era controllato da niente.
    //
    // Sta QUI, nella visita, e non nel cancello del lotto: il cantiere che cresce non è un motivo
    // per rifiutare una consegna (una PR che ripara un difetto non deve essere bloccata perché la
    // settimana scorsa se ne sono aperti altri) — è una notizia da dare a Nicola nel referto che
    // legge. E la visita gira due volte al giorno sul VPS, cioè più spesso di qualunque altra cosa
    // che possa leggere quel numero.
    //
    // `--gate` è la bandierina che trasforma quel comando da metro a freno: senza, esce 0 anche
    // quando il cantiere cresce, perché lo chiamano anche il Pannello e le prove per leggere i
    // numeri. `--json` serve a far arrivare qui il PERCHÉ: `motivoDelGuasto` cerca il campo
    // `sintesi`, ed è quella frase che finisce nel referto sotto il titolo di questo controllo.
    id: "cervello.burndown",
    organo: "cervello",
    titolo: "Il cantiere dei difetti sta calando",
    impatto: 2,
    async prova() {
      const r = eseguiNode("salute-onesta.mjs", ["--json", "--gate"], 60_000);
      return daGuardiano(r, {
        comando: "node cervello/salute-onesta.mjs --gate",
        dettoOk: "il cantiere dei difetti cala rispetto a una settimana fa",
        dettoRotto: "il cantiere dei difetti CRESCE invece di calare",
      });
    },
  },

  {
    // AR-513/AR-514 — l'altro contatore d'abitudine: non «ho consegnato senza dire com'è andata», ma
    // «ho scritto a Nicola senza rispondergli». Nasce dalla sua domanda del 3/8 — «come fai in modo
    // che non ti dimentichi mai di quel blocco? un misuratore, un cancello, o cosa?» — e la risposta
    // onesta è che il cancello dello Stop ferma IL MESSAGGIO di adesso e non sa dire se sto
    // migliorando o se sto solo imparando a passarlo. Quello lo dice una serie storica.
    //
    // Sta nella VISITA e NON nel cancello del lotto: la sua fonte sono le trascrizioni della chat,
    // che su un runner di CI non esistono: là uscirebbe ⚪ a ogni corsa e renderebbe il cancello
    // rosso per sempre (provato dal vivo il 3/8, PR #661). Qui invece il ⚪ è la risposta giusta —
    // «da questo ambiente non l'ho potuto vedere» — e non blocca niente.
    id: "cervello.scrittura",
    organo: "cervello",
    titolo: "Quando scrivo a Nicola, gli rispondo",
    impatto: 2,
    async prova() {
      const r = eseguiNode("conta-blocco-mancante.mjs", ["--json"], 120_000);
      if (!r.partito) return guasto(r.motivo);
      if (r.code === 2) return nonVisto(`non ho potuto contare: ${String(r.out).trim().slice(0, 140)}`);
      let d = null;
      const i = String(r.out).indexOf("{");
      if (i >= 0) {
        try {
          d = JSON.parse(String(r.out).slice(i));
        } catch {
          /* resta null → ⚪ qui sotto */
        }
      }
      if (!d || typeof d.messaggi_misurati !== "number") return nonVisto("il contatore del blocco mancante non ha risposto in modo leggibile");
      if (d.quota_peggiore === null) return nonVisto("nessun messaggio che pretendesse le quattro risposte in questa finestra");
      const testo = `«${d.blocco_peggiore}» mancato nel ${d.quota_peggiore}% dei ${d.messaggi_misurati} messaggi che lo pretendevano (ultimi ${d.finestra_giorni} giorni)`;
      return r.code === 0 ? ok(testo, d) : rotto(`${testo} — sopra il tetto del ${d.tetto?.quota_peggiore}%`, d);
    },
  },

  {
    id: "cervello.skill",
    organo: "cervello",
    titolo: "Le braccia della macchina sono versionate",
    impatto: 2,
    async prova() {
      const dir = join(AD_ROOT, ".claude/skills");
      if (!existsSync(dir)) return nonVisto("nessuna cartella .claude/skills in questo ambiente");
      const cartelle = readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
      if (!cartelle.length) return nonVisto("nessuna skill installata qui");

      // Le skill dello specchio sono copie rigenerabili del manifest: giusto che git le ignori.
      // Quelle scritte a mano no: se git le ignora, esistono solo su questo disco.
      //
      // Il riconoscimento passa dall'ID del manifest, non dal percorso del target. Prima guardavo
      // se il manifest citava `.cursor/skills/<nome>/`, e la prima visita dal VPS ha subito accusato
      // `ponytail` di vivere fuori da git: è generata eccome, ma nasce da una rule `.mdc`
      // (`.cursor/rules/ponytail-code.mdc`) che lo specchio converte in SKILL.md. Un controllo che
      // grida al lupo su una cosa sana si impara a ignorare, quindi la regola guarda l'identità
      // (l'id) invece della forma del file.
      const idsSpecchio = new Set();
      try {
        const manifest = JSON.parse(readFileSync(join(AD_ROOT, "cervello/worker-plugins.json"), "utf8"));
        for (const p of manifest.plugin || []) if (p?.id) idsSpecchio.add(p.id);
      } catch {
        /* senza manifest tratto tutte le skill come native: meglio un falso allarme che un buco */
      }
      // L'elenco dei file versionati si chiede a git UNA volta sola e dalla porta di
      // `percorsi-git.mjs` (AR-339): `ls-files` senza `-z` riscrive fra virgolette i nomi con un
      // byte non-ASCII, e in un vault italiano sono decine di file. Qui i nomi delle skill sono
      // ASCII, ma la regola è di classe — e la prima versione di questo controllo la violava,
      // chiamando git a mano una volta per cartella.
      let tracciate;
      try {
        tracciate = new Set(
          percorsiDaGit(["ls-files", "--", ".claude/skills"], { cwd: AD_ROOT })
            .map((p) => p.match(/^\.claude\/skills\/([^/]+)\//)?.[1])
            .filter(Boolean),
        );
      } catch {
        return nonVisto("git non risponde da qui: non posso dire quali skill siano versionate");
      }
      const versionata = (nome) => tracciate.has(nome);
      const orfane = skillNonVersionate(cartelle, { generata: (nome) => idsSpecchio.has(nome), versionata });
      if (orfane.length)
        return rotto(`${orfane.length} skill vivono solo su questo disco e non arriveranno mai al VPS: ${orfane.join(", ")}`, { orfane });
      return ok(`${cartelle.length} skill installate, tutte versionate o rigenerabili`, { quante: cartelle.length });
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
      const base = urlCabina();
      if (!base) return nonVisto(SENZA_INDIRIZZO);
      const r = await guarda(base.url);
      if (reteChiusa(r))
        return nonVisto(
          `la rete di QUESTO ambiente non arriva alla Cabina (${base.url}): aggiungi il host alla allowlist di rete dell'ambiente — non è la Cabina a essere giù`,
        );
      const esito = giudicaCabina(r);
      return { ...esito, detto: `${esito.detto} (indirizzo da ${base.fonte})` };
    },
  },
  {
    id: "cabina.cuore",
    organo: "cabina",
    titolo: "La Cabina è collegata alla memoria",
    impatto: 2,
    async prova() {
      const base = urlCabina();
      if (!base) return nonVisto(SENZA_INDIRIZZO);
      const r = await guarda(`${base.url}/api/cuore`);
      if (reteChiusa(r))
        return nonVisto(
          `la rete di QUESTO ambiente non arriva alla Cabina (${base.url}): aggiungi il host alla allowlist di rete dell'ambiente — non è la Cabina a essere giù`,
        );
      // AR-438 — dietro il login la risposta è una pagina di autenticazione, non il cuore. Passarla
      // a giudicaCuore darebbe «non risponde in JSON», cioè un ❌ su una Cabina sana: qui il verdetto
      // onesto è ⚪, e dice pure come toglierlo (una sessione, o l'Authentication spenta su Vercel).
      if (protettaDaLogin(r))
        return nonVisto(
          `la Cabina è viva ma protetta da login (${r.status}): da qui non posso leggere il suo cuore. Per vederlo serve una sessione Vercel o spegnere Vercel Authentication sul progetto`,
          { status: r.status },
        );
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
      // Qui c'era `rossoSe: (c) => c === 1` — «1 = tutti ciechi, e le chiavi ci sono: guasto vero».
      // Era anche la porta di AR-667: dicendo quale codice è rosso, tutti gli altri diventavano
      // verdi, e fra quelli c'era il 2, cioè «non ho potuto misurare». Adesso la regola di casa vale
      // da sola — 0 verde, 2 cieco, il resto rosso — e non serve più dichiararla qui.
      return daGuardiano(r, {
        comando: "node cervello/verifica-sensori.mjs",
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
  const cronicita = marcaCronicita(precedenteMia?.cronicita, risultati);

  const rotti = risultati.filter((r) => r.esito === "rotto");
  const guasti = risultati.filter((r) => r.esito === "guasto");
  const nonVisti = risultati.filter((r) => r.esito === "nonvisto");
  const buoni = risultati.filter((r) => r.esito === "ok");
  const copertura = coperturaDi(risultati);

  return { risultati, rotti, guasti, nonVisti, buoni, copertura, cronicita, precedente, mancantiAutotest: autotest() };
}

// ── Il referto ─────────────────────────────────────────────────────────────────

const SEGNO = { ok: "✅", rotto: "❌", nonvisto: "⚪", guasto: "🔧" };
/**
 * Spezza in righe un elenco appiccicato dopo i due punti.
 *
 * I controlli scrivono frasi come «la review non lascia i suoi compiti: Il confronto coi migliori
 * (28 giorni), La peer review fra senior (28 giorni), …»: quattro incisi in una frase sola, cioè
 * quello che il misuratore boccia perché costringe a tenere in sospeso l'idea di partenza. Il
 * contenuto è già un elenco — qui gli si dà la forma che ha.
 */
export function spezzaElenco(detto = "") {
  const i = detto.indexOf(": ");
  if (i < 0) return [detto];
  const coda = detto.slice(i + 2);
  const voci = coda.split(/,\s+(?=[A-ZÀ-Ù])/).map((v) => v.trim()).filter(Boolean);
  if (voci.length < 3) return [detto]; // due cose in fila si leggono benissimo in una riga
  // Le parentesi contano come incisi anche dentro un elenco puntato: «Il confronto coi migliori
  // (28 giorni)» resta una frase con un inciso. Con il trattino la stessa informazione si legge
  // dritta, senza aprire e chiudere niente.
  const dritta = (v) => v.replace(/\s*\(([^)]+)\)\s*$/, " — $1");
  // 2026-08-21 — e ogni voce si CHIUDE. Misurato: cinque righe puntate senza punto finale vengono
  // lette come una frase sola con cinque trattini dentro, e `si-capisce` le boccia giustamente
  // («5 incisi in una frase»). Col punto sono cinque frasi da un'idea l'una, che è quello che sono.
  const chiusa = (v) => (/[.!?:]$/.test(v) ? v : `${v}.`);
  return [`${detto.slice(0, i)}:`, "", ...voci.map((v) => `- ${chiusa(dritta(v))}`)];
}

const ORGANI = { worker: "Worker", cervello: "Cervello", cabina: "Cabina", senior: "Senior", sensori: "Sensori" };

/**
 * IL PIANO DEL REFERTO: chi si racconta, dove, e una volta sola. Pura — AR-504.
 *
 * LA MALATTIA. Il referto della visita nasceva già bocciato dal guardiano della leggibilità: dieci
 * punti difficili a visita, e nove su dieci erano la stessa cosa detta due volte. Non era colpa
 * delle frasi: era la STRUTTURA. Lo stesso controllo rotto compariva in cima («la più grave è…»),
 * di nuovo in «Cosa devi fare», di nuovo fra i peggiorati e una quarta volta nell'elenco per
 * gravità; i non-visti stavano sia nel blocco che Nicola legge sia in una sezione tecnica gemella.
 * Chi legge non impara niente di nuovo: rilegge, e smette di fidarsi anche del resto.
 *
 * PERCHÉ UNA FUNZIONE A PARTE. Quella decisione — «questo va detto qui e non altrove» — viveva
 * dentro la stampa, mescolata alle stringhe: una prova poteva solo cercare parole nel testo. Qui è
 * un dato, e `raccontiDoppi` la controlla eseguendola.
 *
 * LA REGOLA, in una riga: **ogni controllo si racconta per intero in un posto solo.** Il peggiore
 * si racconta in cima, perché è la notizia, e per questo NON torna nell'elenco per gravità. Chi è
 * già stato nominato non ricompare fra i cronici o fra i peggiorati: di lui si dice il resto dentro
 * il suo blocco.
 */
export function pianoDelReferto(v) {
  const risultati = v.risultati || [];
  const rotti = [...(v.rotti || [])].sort((a, b) => a.impatto - b.impatto);
  const peggiore = rotti[0] || null;
  const nominato = (r) => r && peggiore && r === peggiore;
  return {
    totale: risultati.length,
    copertura: Math.round((v.copertura || 0) * 100),
    quantiRotti: rotti.length,
    // Il peggiore: raccontato per intero in cima, e in nessun altro posto.
    peggiore,
    // Gli altri rossi: raccontati per intero nell'elenco per gravità.
    altriRotti: rotti.filter((r) => !nominato(r)),
    // Solo il titolo, e solo per chi non è già stato nominato: qui non si ripete il perché.
    cronici: risultati.filter((r) => r.cronico && !nominato(r)),
    peggiorati: risultati.filter((r) => r.regressione && !nominato(r)),
    // I non visti stanno in un posto solo: il blocco che Nicola legge. La sezione tecnica gemella
    // che li ripeteva è stata tolta — erano gli stessi titoli, due volte, a venti righe di distanza.
    nonVisti: v.nonVisti || [],
    guasti: v.guasti || [],
    buoni: v.buoni || [],
    mancantiAutotest: v.mancantiAutotest || [],
  };
}

/**
 * I controlli che il piano racconterebbe per intero in più di un posto. Vuoto = il referto non si
 * ripete. Pura, e serve alla prova: è il metro della regola qui sopra.
 */
export function raccontiDoppi(piano) {
  const dove = new Map();
  const segna = (r, sezione) => {
    if (!r) return;
    const chiave = r.id || r.titolo;
    dove.set(chiave, [...(dove.get(chiave) || []), sezione]);
  };
  segna(piano.peggiore, "in parole semplici");
  for (const r of piano.altriRotti) segna(r, "rotto");
  for (const r of piano.nonVisti) segna(r, "non ho verificato");
  for (const r of piano.guasti) segna(r, "non sono partiti");
  for (const r of piano.buoni) segna(r, "provato e funzionante");
  return [...dove.entries()].filter(([, sezioni]) => sezioni.length > 1).map(([chi, sezioni]) => ({ chi, sezioni }));
}

/**
 * Le quattro risposte in cima al referto, costruite dal piano.
 *
 * Non è una casella da riempire: sono le quattro domande che Nicola si fa leggendo un referto, e
 * finora doveva ricavarsele scorrendo gli elenchi. «Cosa devi fare» esce dal rosso che costa di più,
 * «Cosa non ho verificato» dai ⚪ — che è l'unico posto dove quei buchi diventano una frase invece
 * di una lista in fondo alla pagina.
 */
export function quattroRisposte(v) {
  const p = pianoDelReferto(v);
  const righe = [];
  const peggiore = p.peggiore;

  righe.push("## In parole semplici");
  righe.push("");
  righe.push(
    peggiore
      ? `Ho controllato ${p.totale} cose della macchina. ${p.quantiRotti === 1 ? "Una non va" : `${p.quantiRotti} non vanno`}, e la più grave è sul ${ORGANI[peggiore.organo]}: ${peggiore.titolo.toLowerCase()}.`
      : `Ho controllato ${p.totale} cose della macchina e non ne ho trovata nessuna rotta.`,
  );
  // Il peggiore si racconta QUI per intero — detto, età, comando — e non torna nell'elenco per
  // gravità più sotto. Prima compariva quattro volte, ed è il difetto che questa funzione chiude.
  if (peggiore) {
    righe.push(`Cioè, in concreto: ${peggiore.detto}`);
    // AR-440 — il rosso porta con sé la sua età. Senza, «da stamattina» e «da tre settimane»
    // occupano la stessa riga e si leggono allo stesso modo: cioè non si leggono.
    if (peggiore.daQuanto) righe.push(`Da quanto: ${peggiore.daQuanto}.`);
  }
  righe.push(`Non tutte le ${p.totale} le ho potute misurare davvero: ci sono riuscita per il ${p.copertura}%.`);
  righe.push(`Visita fatta da: ${CASA}.`);
  righe.push("");

  righe.push("## Cosa cambia per te");
  righe.push("");
  righe.push(
    peggiore
      ? `Finché resta così, quel pezzo della macchina non lavora. ${IMPATTO[peggiore.impatto] === "blocca gli incassi" ? "E questo è il livello che tocca i soldi." : `Il costo: ${IMPATTO[peggiore.impatto]}.`}`
      : "Niente: quello che ho potuto misurare funziona.",
  );
  if (p.guasti.length) righe.push(`In più ${p.guasti.length} dei miei controlli non sono partiti, e un controllo rotto sembra un verde.`);
  righe.push("");

  righe.push("## Cosa devi fare");
  righe.push("");
  righe.push(peggiore ? "Apri la card in coda: porta lo stesso titolo, e dentro c'è il comando pronto." : "Niente.");
  if (p.cronici.length) {
    // 2026-08-21 — QUI C'ERANO I TITOLI, ED ERANO GIÀ SCRITTI SOTTO.
    // Ogni cronico compariva col suo titolo in questa riga e poi di nuovo, identico, nella sezione
    // «Rotto — in ordine di quanto costa» venti frasi più giù. `si-capisce` lo misura come «stessa
    // idea a 24 frasi di distanza», ed è la stessa malattia che il piano del referto aveva già
    // curato altrove: un ripasso sta accanto alla frase, non dieci frasi dopo.
    // Il numero resta — è la notizia, «da quanto suonano» — e il dettaglio si legge dove sta.
    const daQuanto = Math.max(...p.cronici.map((r) => Number(r.rossoDa) || 0));
    righe.push("");
    righe.push(
      p.cronici.length === 1
        ? `Ce n'è anche un altro che suona da ${daQuanto} visite di fila: lo trovi qui sotto, in ordine di quanto costa.`
        : `Ce ne sono altri ${p.cronici.length} che suonano da un pezzo, il più vecchio da ${daQuanto} visite di fila. Li trovi qui sotto, in ordine di quanto costano.`,
    );
  }
  righe.push("");

  righe.push("## Cosa non ho verificato");
  righe.push("");
  if (p.nonVisti.length) {
    righe.push(`${p.nonVisti.length} controlli su ${p.totale} non li ho potuti fare da qui. Non sono verdi: sono buchi.`);
    righe.push("");
    // Un elenco, non un periodo: sette titoli uniti dal punto e virgola diventano una frase da 36
    // parole con sei incisi dentro — misurato, non temuto. E il perché sta qui, non in una sezione
    // gemella venti righe più sotto: quella c'era, e ripeteva questi stessi titoli.
    for (const r of p.nonVisti) righe.push(`- ${r.titolo}: ${r.detto}`);
  } else {
    righe.push("Niente: da qui ho potuto guardare tutto.");
  }
  righe.push("");
  return righe;
}

export function referto(v) {
  const p = pianoDelReferto(v);
  const righe = [];
  righe.push("---");
  righe.push(`data: ${ts()}`);
  righe.push(`casa: ${CASA}`);
  righe.push(`modo: ${MODO}`);
  righe.push("---");
  righe.push("");
  // Il referto è un testo che legge NICOLA, quindi vale la regola dei quattro blocchi come per ogni
  // altro testo lungo (AR-478 + Regola 3 di scrittura-umana.md). Prima apriva con «2 rossi su 20
  // controlli, copertura 68%»: vero, ma è il numero prima della notizia.
  righe.push(`# Visita della macchina — ${ts()}`);
  righe.push("");
  righe.push(...quattroRisposte(v));

  if (p.mancantiAutotest.length) {
    righe.push(`> 🔧 **Attenzione ai miei stessi strumenti:** mancano ${p.mancantiAutotest.join(", ")}. Il verdetto qui sotto è parziale.`);
    righe.push("");
  }

  if (p.peggiorati.length) {
    righe.push("## ⚠️ Peggiorato dall'ultima visita");
    righe.push("");
    // Solo i titoli: il perché di ognuno sta nel suo blocco, e ridirlo qui era il doppione più
    // lungo del referto.
    for (const r of p.peggiorati) righe.push(`- ${r.titolo}`);
    righe.push("");
  }

  if (p.altriRotti.length) {
    righe.push("## ❌ Rotto — in ordine di quanto costa");
    righe.push("");
    // 🔁 RAGGRUPPATI PER COSTO, e non uno per uno con la stessa riga sotto ciascuno. Prima ogni
    // rosso si portava dietro «Quanto costa: …» e «Da quanto: …» per esteso: con cinque rossi dello
    // stesso peso, Nicola leggeva la stessa frase cinque volte a distanza di paragrafi. È il difetto
    // che `si-capisce.mjs` chiama «stessa idea a N frasi di distanza», e su un referto che legge lui
    // vale come su qualunque altro testo (AR-478): il cancello del lotto l'ha bocciato, giustamente.
    // Detto una volta come intestazione del gruppo, si legge meglio E si capisce cosa hanno in comune.
    for (const impatto of [1, 2, 3, 4]) {
      const delGruppo = p.altriRotti.filter((r) => r.impatto === impatto);
      if (!delGruppo.length) continue;
      righe.push(`### ${IMPATTO[impatto]}`);
      righe.push("");
      for (const r of delGruppo) {
        // NIENTE «da quanto» qui: i rossi cronici hanno già una sezione tutta loro più sotto, e
        // ripetere «acceso in N visite di fila» sotto ognuno voleva dire scrivere la stessa frase
        // cinque volte nello stesso referto. Un ripasso sta accanto alla frase, non dieci frasi dopo.
        righe.push(`**${r.titolo}** · ${ORGANI[r.organo]}`);
        righe.push("");
        righe.push(...spezzaElenco(r.detto));
        if (r.prova) righe.push(`Prova: \`${r.prova}\``);
        righe.push("");
      }
    }
  }

  // Da qui in giù il dettaglio per chi esegue: gli elenchi organo per organo, coi messaggi che ogni
  // controllo scrive di suo. Il rosso e il peggioramento restano SOPRA — sono la notizia, non il
  // dettaglio, e spingerli qui sotto è «forma pulita, contenuto svuotato» (me l'ha detto il misuratore
  // al primo tentativo: avevo mandato tutto sotto la riga e il referto era diventato una copertina).
  righe.push("---");
  righe.push("");
  righe.push("## Dettagli tecnici");
  righe.push("");

  if (p.peggiore) {
    righe.push(`Il comando che rimette in piedi il peggiore${p.peggiore.prova ? `: \`${p.peggiore.prova}\`` : " non c'è: va trovato a mano."}`);
    righe.push("");
  }

  if (p.guasti.length) {
    righe.push("## 🔧 I miei controlli che non sono partiti");
    righe.push("");
    for (const r of p.guasti) righe.push(`- **${r.titolo}**: ${r.detto}`);
    righe.push("");
  }

  righe.push("## ✅ Provato e funzionante");
  righe.push("");
  for (const r of p.buoni) righe.push(`- **${r.titolo}**: ${r.detto}${r.prova ? ` \`${r.prova}\`` : ""}`);
  righe.push("");

  return righe.join("\n");
}

/**
 * AR-286 — LE CHIAVI CHE, SE CI SONO, FANNO VEDERE QUALCOSA.
 * Nel timbro finiscono i NOMI di quelle presenti, mai i valori: serve a sapere se chi ha scritto
 * questo referto poteva vedere, non a rimettere in giro un segreto.
 */
const CHIAVI_CHE_CONTANO = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_KEY",
  "MARKETPLACE_SUPABASE_URL",
  "MARKETPLACE_SUPABASE_KEY",
  "STRIPE_SECRET_KEY",
  "GIT_PUSH_TOKEN",
];

/**
 * AR-286 — IL DOCUMENTO DEL REFERTO, con dentro il suo timbro di provenienza.
 *
 * Prima `salute.json` diceva quando era stato scritto e quanti rossi c'erano, ma non DA DOVE:
 * un referto scritto da una sessione cloud (che i sensori non li vede affatto) e uno scritto dal
 * VPS erano indistinguibili anche a posteriori. Senza provenienza non si può fare un post-mortem,
 * e ogni sessione deve ridedurre a mano da dove sta leggendo — e può sbagliare la deduzione.
 *
 * Il timbro porta anche la SCADENZA, accanto al dato: chi legge questo file non deve più sapersela
 * da sé. È la regola ① del modulo, e vale per chiunque scriva qui dentro, non solo per la visita.
 *
 * PURA apposta: costruisce il documento e non tocca il disco, così una prova può eseguirla senza
 * far girare la visita vera sul vault di Nicola.
 */
export function documentoSalute(v, { casa = CASA, modo = MODO, quando = ts(), istante = iso(), env = process.env } = {}) {
  const prec = v.precedente;
  const riassunto = {
    quando,
    iso: istante,
    casa,
    modo,
    ok: v.buoni.length,
    rotti: v.rotti.length,
    guasti: v.guasti.length,
    nonvisti: v.nonVisti.length,
    copertura: Number(v.copertura.toFixed(2)),
  };
  const doc = {
    aggiornato: quando,
    timbro: timbraReferto({
      quando,
      scadenzaOre: SOGLIE.refertoVpsScadutoOre,
      scrittoDa: "cervello/salute.mjs",
      env,
      chiavi: CHIAVI_CHE_CONTANO,
    }),
    soglie: SOGLIE,
    ultime: {
      ...prec.ultime,
      [casa]: {
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
          rosso_da: r.rossoDa ?? 0,
          cronico: Boolean(r.cronico),
        })),
        // AR-440 — LO STATO CHE MANCAVA. Senza questo conto salvato, alla visita dopo un allarme
        // acceso da tre settimane e uno acceso adesso tornerebbero a leggersi uguali.
        cronicita: v.cronicita?.conto ?? {},
      },
    },
    storico: [...prec.storico, riassunto].slice(-SOGLIE.storicoMax),
  };
  return doc;
}

function scriviMemoria(v) {
  scriviJsonAtomico(SALUTE_JSON, documentoSalute(v));

  const nome = `${ts().replace(" ", "-").replace(":", "")}-${CASA}.md`;
  mkdirSync(CARTELLA_REFERTI, { recursive: true });
  const percorso = join(CARTELLA_REFERTI, nome);
  scriviTestoAtomico(percorso, referto(v));
  potaReferti();
  return percorso;
}

/** Due visite al giorno fanno settecento file l'anno. La tendenza vive nello storico di salute.json;
 *  i referti vecchi sono carta. Ne restano gli ultimi, il resto si butta. */
/**
 * 2026-08-21 — LA SPAZZATA CHE CANCELLA E NON LO DICE A GIT.
 *
 * `potaReferti` toglieva il file dal DISCO e basta. Ma i referti sono versionati (stanno in
 * `consegne/`, che è memoria): tolto il file, `git ls-files` continuava a elencarlo, perché elenca
 * l'indice e non il disco. Da lì in poi chiunque scorra l'elenco di git e provi ad aprire i file
 * trova una porta che non si apre — e `scan-segreti` ci si accecava sopra, uscendo 2 a ogni giro:
 * «1 file elencato da git che NON sono riuscito ad aprire… non posso dire pulito». Il controllo
 * `cervello.segreti` era ⚪ da giorni, e la causa non era un segreto né un permesso: era questa
 * cancellazione lasciata a metà, che ogni visita rinnovava cancellando il referto successivo.
 *
 * Una cancellazione è finita quando disco e indice dicono la stessa cosa. Qui si chiude: si segna
 * la rimozione nell'indice, così il commit di memoria del worker la porta fuori come qualunque
 * altra modifica. `--ignore-unmatch` rende l'operazione muta sui referti mai versionati (quelli
 * appena scritti in una sessione), e l'errore non è MAI un motivo per far fallire una visita.
 */
export function dimenticaDaGit(relativo, radice = AD_ROOT) {
  try {
    if (existsSync(join(radice, relativo))) return; // c'è ancora: non si tocca l'indice
    spawnSync("git", ["rm", "--cached", "--quiet", "--ignore-unmatch", "--", relativo], {
      cwd: radice,
      encoding: "utf8",
    });
  } catch {
    /* indice non aggiornabile (repo assente, permessi): la visita non si ferma per questo */
  }
}

function potaReferti() {
  try {
    const nomi = readdirSync(CARTELLA_REFERTI)
      .filter((f) => f.endsWith(".md"))
      .sort(); // i nomi iniziano con la data: l'ordine alfabetico È l'ordine cronologico
    for (const vecchio of nomi.slice(0, Math.max(0, nomi.length - SOGLIE.refertiTenuti))) {
      const percorso = join(CARTELLA_REFERTI, vecchio);
      rmSync(percorso, { force: true });
      dimenticaDaGit(`consegne/salute/${vecchio}`);
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
            // AR-440 — il numero che prima non esisteva: quanti di questi rossi sono lì da un pezzo.
            cronici: v.risultati.filter((r) => r.cronico).length,
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
        const eta = r.regressione ? " (PEGGIORATO da ieri)" : r.cronico ? ` (${r.daQuanto})` : "";
        console.log(`${SEGNO[r.esito]} ${r.titolo}${eta}`);
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
