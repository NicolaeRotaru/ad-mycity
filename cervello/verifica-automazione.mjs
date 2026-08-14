#!/usr/bin/env node
// Verifica end-to-end dell'automazione PR/merge/VPS — il "checkup del mattino".
// 🟢 Sola lettura: NON apre PR, NON mergea, NON modifica nulla.
//
// Controlla: token GitHub (entrambi i repo), permessi push, clone marketplace,
// ramo VPS, timer watch-main, worker, segnali automazione:* su Supabase, AZIONI_LIVE.
//
// Uso:
//   node cervello/verifica-automazione.mjs            -> report leggibile
//   node cervello/verifica-automazione.mjs --json     -> output JSON (per il worker/sentinelle)
//
// Exit code (AR-370): 0 = tutto ok · 1 = almeno un controllo FALLITO · 2 = ci sono controlli che NON
// HO POTUTO ESEGUIRE qui (systemd assente, chiavi assenti): il verde non copre quella parte.
// Scrive l'esito complessivo in impostazioni (chiave automazione:verifica) se Supabase è configurato.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AD_ROOT,
  githubRequest,
  nowPiacenza,
  resolveRepoConfig,
  stampSegnale,
} from "./git-github.mjs";
import { resolveMarketplaceRepo } from "./marketplace-repo.mjs";
import { verdettoCopertura, segnaleDa, CIECO, ROTTO } from "./misura-o-cieco.mjs";
import { oreDaTimbroDiReferto } from "./eta-referto.mjs";

const JSON_MODE = process.argv.includes("--json");
const LIVE = process.env.AZIONI_LIVE === "1" || process.env.AZIONI_LIVE === "on";
const VPS_TIMERS_DIR = join(AD_ROOT, "cervello/vps");
/** Timer che devono essere attivi sul VPS — se spenti → fail (non solo warn). */
const TIMER_CRITICI = new Set([
  "mycity-watch-main.timer",
  "mycity-giro.timer",
  "mycity-sentinella-dati.timer",
  "mycity-verifica.timer",
  "mycity-monitora.timer",
  "mycity-sentinella.timer",
  // AR-164 (a): i quattro timer del ritmo erano fuori dai critici — un timer del Piano del mattino
  // spento risultava un semplice «warn». È la metà infrastrutturale del difetto; l'altra metà (il
  // PRODOTTO della cadenza, non la sveglia) la guarda cervello/freschezza-cadenze.mjs.
  "mycity-ritmo-mattino.timer",
  "mycity-ritmo-mezzogiorno.timer",
  "mycity-ritmo-sera.timer",
  "mycity-ritmo-settimana.timer",
]);
const BATTITO_OCCHI_MAX_MIN = Number(process.env.VERIFICA_BATTITO_OCCHI_MIN || 10);
/** Sono sul server, cioè nel posto dove queste cose DEVONO esserci? Fuori di lì, «manca» vuol dire «non l ho potuto guardare». */
const SUL_VPS = existsSync("/opt/mycity/ad-mycity");

// AR-370 — «NON ESEGUIBILE QUI» NON È UN AVVISO: È UN BUCO.
//
// Fuori dal VPS non c'è systemd, quindi i controlli sui timer venivano saltati e registrati come
// `warn` — un esito di MERITO, che dice «l'ho guardato e non mi piace del tutto». Il verdetto finale
// contava solo i `fail`, quindi un giro lanciato dal cloud usciva 0: verde pieno su una macchina di
// cui non aveva guardato né i timer né il worker. La cura non è promuovere il warn a errore (sarebbe
// un rosso falso): è il TERZO esito, quello che esiste già nel contratto dei guardiani di casa.
/** @type {{nome: string, esito: 'ok'|'warn'|'fail'|'cieco', dettaglio: string}[]} */
const checks = [];

function add(nome, esito, dettaglio) {
  checks.push({ nome, esito, dettaglio });
}

function sh(cmd, args, cwd) {
  try {
    return execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch {
    return null;
  }
}

/**
 * Minuti trascorsi da un timbro di Piacenza "AAAA-MM-GG HH:MM". `null` se non si legge — perché
 * «non l'ho potuto leggere» e «zero minuti fa» sono opposti.
 *
 * L'offset era scritto a mano (`+02:00`): giusto d'estate, falso di un'ora tutto l'inverno — la
 * malattia censita `ora-legale-scolpita`. Da novembre a marzo questo controllo diceva che il battito
 * degli occhi era 60 minuti più vecchio del vero e faceva scattare un ❌ su una macchina sana: un
 * rosso falso si impara a ignorare esattamente come un verde falso. Adesso il conto passa
 * dall'orologio di casa, che sa da solo quando scatta il cambio d'ora.
 */
function etaMinutiPiacenza(valore) {
  const ore = oreDaTimbroDiReferto(valore, Date.now());
  return ore === null ? null : Math.round(ore * 60);
}

async function checkRepoToken(key) {
  let cfg;
  try {
    cfg = resolveRepoConfig(key);
  } catch (e) {
    // Il clone assente è già coperto dal check dedicato: qui non è un problema di token.
    // E fuori dal VPS la configurazione dei token semplicemente non c'è: è cecità, non guasto.
    const cloneAssente = /Clone marketplace assente/i.test(e.message || "");
    const misurabile = SUL_VPS && !cloneAssente;
    add(`token ${key}`, misurabile ? "fail" : "cieco", misurabile ? e.message : `${e.message} — non misurabile da qui, si prova dal VPS`);
    return null;
  }
  if (!cfg.token) {
    // Un token che manca è un guasto SOLO dove doveva esserci. Da una sessione cloud il .env del
    // VPS non esiste: chiamarlo ❌ è un rosso falso, e un rosso falso si impara a ignorare come un
    // verde falso — con la differenza che consuma anche l attenzione di Nicola.
    add(`token ${key}`, SUL_VPS && key !== "mycity" ? "fail" : "cieco", SUL_VPS ? "token assente nel .env del server" : "token assente qui: non ho potuto provare l accesso (si prova dal VPS)");
    return cfg;
  }
  try {
    const repo = await githubRequest(cfg.token, `/repos/${cfg.owner}/${cfg.repo}`);
    const push = repo.permissions?.push === true;
    const prCount = await githubRequest(
      cfg.token,
      `/repos/${cfg.owner}/${cfg.repo}/pulls?state=open&per_page=1`
    );
    add(
      `token ${key}`,
      push ? "ok" : "fail",
      push
        ? `accesso ok, permesso push ✓, PR leggibili (${Array.isArray(prCount) ? "✓" : "?"})`
        : "il token NON ha permesso di push — serve Contents + Pull requests: Read and write"
    );
  } catch (e) {
    add(`token ${key}`, "fail", `GitHub: ${e.message}`);
  }
  return cfg;
}

async function main() {
  // 1) Token + permessi sui due repo
  const adCfg = await checkRepoToken("ad-mycity");
  await checkRepoToken("mycity");

  // 2) Clone marketplace presente
  const mktPath = resolveMarketplaceRepo();
  if (existsSync(join(mktPath, ".git"))) {
    const head = sh("git", ["log", "-1", "--format=%h %cd", "--date=short"], mktPath);
    add("clone marketplace", "ok", `${mktPath} (${head || "?"})`);
  } else {
    add("clone marketplace", "warn", `assente in ${mktPath} — node cervello/collega-marketplace.mjs`);
  }

  // 3) Ramo del repo AD (RAMO UNICO Fase 2: sul VPS deve essere main; altrove è informativo)
  const branch = sh("git", ["rev-parse", "--abbrev-ref", "HEAD"], AD_ROOT);
  const onVps = SUL_VPS;
  if (branch === "main") {
    add("ramo repo AD", "ok", "main (ramo unico) ✓");
  } else if (branch === "memoria-ad") {
    add("ramo repo AD", "fail", "sei sul VECCHIO ramo 'memoria-ad' — Fase 2 = ramo unico 'main': metti GIT_BRANCH=main nel .env e rilancia aggiorna-cervello.sh (deriva ramo!)");
  } else if (onVps && AD_ROOT.startsWith("/opt/mycity")) {
    add("ramo repo AD", "fail", `sei su '${branch}' — sul VPS deve essere main (deriva ramo!)`);
  } else {
    add("ramo repo AD", "warn", `'${branch}' (non-VPS: ok se sei in sviluppo)`);
  }

  // 4) Timer watch-main + worker (solo dove c'è systemd)
  //
  // AR-370, la stessa malattia dall'altro lato. «Il binario systemctl esiste» non vuol dire «questa
  // macchina è governata da systemd»: in un contenitore il binario c'è, nessuna unità è caricata, e
  // ogni `is-active` torna vuoto — che qui veniva letto come «timer ASSENTE», cioè dodici ❌ falsi
  // sparati da un posto che non poteva misurare niente. Misurato il 13/8 da una sessione cloud.
  // La domanda giusta è quella canonica: il sistema è stato avviato con systemd? → /run/systemd/system.
  const hasSystemd = sh("sh", ["-c", "command -v systemctl"]) !== null && existsSync("/run/systemd/system");
  if (hasSystemd) {
    const timer = sh("systemctl", ["is-active", "mycity-watch-main.timer"]);
    add(
      "timer watch-main",
      timer === "active" ? "ok" : "fail",
      timer === "active" ? "attivo ✓" : `stato: ${timer || "assente"} — systemctl enable --now mycity-watch-main.timer`
    );
    const worker = sh("systemctl", ["is-active", "mycity-worker"]);
    add(
      "worker",
      worker === "active" ? "ok" : "fail",
      worker === "active" ? "attivo ✓" : `stato: ${worker || "assente"}`
    );
    // AR-056: il battito 2h (giro) è la cadenza più critica — vigila che il timer sia vivo.
    const giroTimer = sh("systemctl", ["is-active", "mycity-giro.timer"]);
    add(
      "timer giro (battito 2h)",
      giroTimer === "active" ? "ok" : "fail",
      giroTimer === "active" ? "attivo ✓" : `stato: ${giroTimer || "assente"} — systemctl enable --now mycity-giro.timer`
    );
    // Timer attesi da cervello/vps/*.timer (AR salute-sensori: vigila anche occhi/monitora/sentinella).
    if (existsSync(VPS_TIMERS_DIR)) {
      const timers = readdirSync(VPS_TIMERS_DIR)
        .filter((f) => f.startsWith("mycity-") && f.endsWith(".timer"))
        .sort();
      for (const unit of timers) {
        if (["mycity-watch-main.timer", "mycity-giro.timer"].includes(unit)) continue;
        const stato = sh("systemctl", ["is-active", unit]);
        const critico = TIMER_CRITICI.has(unit);
        add(
          `timer ${unit.replace(".timer", "")}`,
          stato === "active" ? "ok" : critico ? "fail" : "warn",
          stato === "active" ? "attivo ✓" : `stato: ${stato || "assente"}`
        );
      }
    }
  } else {
    // AR-056
    add("timer watch-main", "cieco", "systemd assente (non-VPS): non ho potuto guardare i timer del server");
    add("timer giro (battito 2h)", "cieco", "systemd assente (non-VPS): non ho potuto guardare mycity-giro.timer");
    // Il worker spariva del tutto dall'elenco: un controllo che non c'è è più invisibile di uno rosso.
    add("worker", "cieco", "systemd assente (non-VPS): non ho potuto guardare se il worker gira");
  }

  // 4-bis) AR-167 — IL FUSO DELLE UNITÀ, controllato a occhi aperti e non a memoria.
  // Due timer partivano con l'orologio del server (UTC su Hetzner) mentre il commento accanto
  // prometteva l'ora di Piacenza: il piano del mattino usciva un'ora prima o dopo di quando doveva.
  // La correzione, all'epoca, fu applicata solo ai file in cui il sintomo si vedeva. Qui diventa un
  // controllo di CLASSE: si legge la cartella, non i tre file che ci ricordiamo. Funziona anche fuori
  // dal VPS — sono file versionati, non stato di systemd.
  if (existsSync(VPS_TIMERS_DIR)) {
    const senzaFuso = [];
    const serviceSenzaTz = [];
    for (const f of readdirSync(VPS_TIMERS_DIR).filter((x) => x.startsWith("mycity-") && x.endsWith(".timer")).sort()) {
      const testo = readFileSync(join(VPS_TIMERS_DIR, f), "utf8");
      for (const riga of testo.split("\n")) {
        if (!riga.trim().startsWith("OnCalendar=")) continue;
        // Un OnCalendar puramente relativo (OnBootSec/monotonico) non ha fuso da dichiarare.
        if (!/\d{2}:\d{2}/.test(riga)) continue;
        if (!/(Europe\/Rome|UTC)\s*$/.test(riga.trim())) senzaFuso.push(`${f}: ${riga.trim()}`);
      }
      const service = f.replace(/\.timer$/, ".service");
      const ps = join(VPS_TIMERS_DIR, service);
      if (existsSync(ps) && !/Environment=TZ=/.test(readFileSync(ps, "utf8"))) serviceSenzaTz.push(service);
    }
    const guasti = [...senzaFuso, ...serviceSenzaTz.map((s) => `${s}: manca Environment=TZ=`)];
    add(
      "fuso orario delle unità systemd",
      guasti.length ? "fail" : "ok",
      guasti.length
        ? `${guasti.length} unità con l'orologio del server invece di Piacenza — ${guasti.slice(0, 4).join(" · ")}`
        : "ogni OnCalendar dichiara il fuso e ogni .service ha TZ ✓"
    );
  }

  // 5) Segnali recenti su Supabase (battiti dell'automazione)
  const sbUrl = process.env.SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  if (sbUrl && sbKey) {
    const sbHeaders = { apikey: sbKey, Authorization: `Bearer ${sbKey}` };
    try {
      const battitoRes = await fetch(
        `${sbUrl}/rest/v1/impostazioni?chiave=eq.sentinella-dati:ultimo&select=valore&limit=1`,
        { headers: sbHeaders }
      );
      const battitoRows = battitoRes.ok ? await battitoRes.json() : [];
      const battitoVal = battitoRows?.[0]?.valore;
      const etaMin = etaMinutiPiacenza(battitoVal);
      if (etaMin == null) {
        add("battito occhi (sentinella-dati:ultimo)", "warn", "nessun battito registrato ancora");
      } else if (etaMin > BATTITO_OCCHI_MAX_MIN) {
        add(
          "battito occhi (sentinella-dati:ultimo)",
          "fail",
          `fermo da ${etaMin} min (ultimo: ${battitoVal}) — mycity-sentinella-dati.timer spento?`
        );
      } else {
        add("battito occhi (sentinella-dati:ultimo)", "ok", `fresco (${etaMin} min fa · ${battitoVal})`);
      }
    } catch (e) {
      add("battito occhi (sentinella-dati:ultimo)", "cieco", `non leggibile: ${e.message}`);
    }

    try {
      const res = await fetch(
        `${sbUrl}/rest/v1/impostazioni?chiave=like.automazione:*&select=chiave,valore,updated_at`,
        { headers: sbHeaders }
      );
      const rows = res.ok ? await res.json() : [];
      if (!Array.isArray(rows) || rows.length === 0) {
        add("segnali automazione", "warn", "nessun segnale ancora (normale al primo avvio)");
      } else {
        for (const r of rows) {
          const nome = r.chiave.replace("automazione:", "");
          // Non leggere il proprio segnale precedente: evita loop «errore → errore» (AR salute-sensori).
          if (nome === "verifica") continue;
          const errore = String(r.valore || "").startsWith("errore");
          add(
            `segnale ${nome}`,
            errore ? "fail" : "ok",
            `${r.valore} (${(r.updated_at || "").slice(0, 16).replace("T", " ")})`
          );
        }
      }
    } catch (e) {
      add("segnali automazione", "cieco", `Supabase non raggiungibile: ${e.message}`);
    }
  } else {
    add("segnali automazione", "cieco", "SUPABASE_URL/SERVICE_KEY assenti: non ho potuto leggere nessun segnale");
  }

  // 6) Gate di sicurezza
  add(
    "gate AZIONI_LIVE",
    "ok",
    LIVE
      ? "LIVE (1) — i merge approvati partono davvero"
      : "dry-run (0) — merge simulati finché non metti AZIONI_LIVE=1"
  );

  // Esito complessivo — AR-370: il verdetto passa dal metro della copertura, non solo dai rossi.
  const fails = checks.filter((c) => c.esito === "fail");
  const warns = checks.filter((c) => c.esito === "warn");
  const nonEseguiti = checks.filter((c) => c.esito === "cieco");
  const v = verdettoCopertura({
    misurati: checks.length - nonEseguiti.length,
    daMisurare: checks.length,
    violazioni: fails.length,
    nonMisurati: nonEseguiti.map((c) => `${c.nome}: ${c.dettaglio}`),
  });
  const esito = v.esito === ROTTO ? "errore" : v.esito === CIECO ? "cieco" : warns.length > 0 ? "warn" : "ok";
  const sintesi =
    fails.length > 0
      ? `${fails.length} FALLITI: ${fails.map((f) => f.nome).join(", ")}`
      : nonEseguiti.length > 0
        ? `${nonEseguiti.length} controlli su ${checks.length} non li ho potuti eseguire: ${nonEseguiti.map((c) => c.nome).join(", ")}`
        : warns.length > 0
          ? `ok con ${warns.length} avvisi`
          : "tutto verde";

  // Il segnale che arriva al Pannello porta il terzo stato: fino a oggi «non ho guardato» ci
  // arrivava come «ok», ed è la riga che Nicola legge per sapere se la macchina è viva.
  await stampSegnale("verifica", segnaleDa(esito, { errore: "errore", cieco: "cieco", warn: "warn", ok: "ok" }), `${sintesi} · ${nowPiacenza()}`);

  if (JSON_MODE) {
    console.log(
      JSON.stringify(
        { esito, sintesi, quando: nowPiacenza(), controlli_non_eseguiti: nonEseguiti.map((c) => ({ nome: c.nome, perche: c.dettaglio })), checks },
        null,
        2,
      ),
    );
  } else {
    console.log(`\n🔎 VERIFICA AUTOMAZIONE — ${nowPiacenza()} (Europe/Rome)\n`);
    const ICO = { ok: "✅", warn: "⚠️ ", fail: "❌", cieco: "⚪" };
    for (const c of checks) {
      console.log(`${ICO[c.esito] || "⚪"} ${c.nome.padEnd(22)} ${c.dettaglio}`);
    }
    console.log(`\nESITO: ${esito === "ok" ? "✅ tutto verde" : esito === "cieco" ? "⚪ " + sintesi : esito === "warn" ? "⚠️  " + sintesi : "❌ " + sintesi}`);
    if (fails.length > 0) {
      console.log("\nLa macchina NON è pienamente operativa: correggi i ❌ sopra.");
    }
    if (nonEseguiti.length > 0) {
      console.log("\nIl verde qui sopra NON copre i ⚪: quei controlli vanno rifatti da dove si possono eseguire (il VPS).");
    }
  }

  process.exit(v.codice);
}

// Il programma parte SOLO se qualcuno lancia questo file. Qui pesa più che altrove: `main()` scrive
// un segnale, quindi importare il modulo per provarne una funzione lasciava una traccia nella
// memoria vera. Un modulo che si esegue all'import non è provabile senza sporcare.
const lanciatoDaRigaDiComando = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (lanciatoDaRigaDiComando) {
  main().catch(async (e) => {
    console.error("ERRORE verifica:", e.message || e);
    await stampSegnale("verifica", "errore", `crash: ${(e.message || e).toString().slice(0, 200)}`);
    process.exit(1);
  });
}
