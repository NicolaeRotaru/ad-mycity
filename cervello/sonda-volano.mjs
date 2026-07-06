#!/usr/bin/env node
// Sonda leggera del volano di auto-coscienza — 4 invarianti deterministici.
// 🟢 Sola lettura sui dati esterni; scrive auto-radiografia.json (blocco sonda) + storico-salute.json.
//
// Risolve chiusura-volano: monitora tasso_applicazione, cadenza giro, sentinelle, loop.
// Se tasso < 0.3 per 3 giri consecutivi → flag serve_radiografia_completa.
//
// Uso:
//   node cervello/sonda-volano.mjs
//   node cervello/sonda-volano.mjs --json

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const VAULT = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");
const RAD_PATH = join(VAULT, "auto-radiografia.json");
const STORICO_PATH = join(VAULT, "storico-salute.json");
const APP_PATH = join(VAULT, "apprendimento.json");
const CECITA_PATH = join(VAULT, "sensori-cecita.json");
const BRIEF_PATH = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/ultimo-briefing.json");

function readJson(path, fallback = {}) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(path, data) {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

/** @param {string} dataStr "AAAA-MM-DD HH:MM" */
function parsePiacenza(dataStr) {
  if (!dataStr) return null;
  const m = String(dataStr).match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, h = "12", mi = "00"] = m;
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:00+02:00`);
}

function oreFa(dataStr) {
  const d = parsePiacenza(dataStr);
  if (!d || Number.isNaN(d.getTime())) return Infinity;
  return (Date.now() - d.getTime()) / 3600000;
}

function main() {
  const quando = nowPiacenza();
  const app = readJson(APP_PATH);
  const cecita = readJson(CECITA_PATH);
  const brief = readJson(BRIEF_PATH);
  const rad = readJson(RAD_PATH, {
    data: quando,
    tipo: "completa",
    voto_salute_architettura: 72,
    trend: "=",
    sintesi: "",
    dimensioni: [],
    sonda: {},
  });
  const storico = readJson(STORICO_PATH, { serie: [] });
  const cantiere = readJson(join(VAULT, "cantiere-difetti.json"));
  const calibr = readJson(join(VAULT, "calibrazione.json"));
  const autoMig = readJson(join(VAULT, "auto-miglioramento.json"));

  // AR-013: il volano non deve AUTO-CERTIFICARSI leggendo un numero che l'LLM scrive a mano.
  // "loop chiude" richiede PROVE deterministiche di chiusura, non solo tasso_applicazione > 0:
  //   (a) almeno un difetto del cantiere è passato a 'chiuso', OPPURE
  //   (b) la calibrazione ha almeno una previsione registrata (previsto-vs-reale), OPPURE
  //   (c) c'è almeno un esperimento di auto-miglioramento MISURATO.
  // AR-052: la prova di vita del loop guarda la RECENCY (finestra), non lo stock all-time.
  // AR-063: e conta solo previsioni CHIUSE con esito (apprendimento), non righe ancora aperte (intenzione).
  const finestraGg = 14; // AR-052: finestra di recency (giorni)
  const oreFinestra = finestraGg * 24;
  const tasso = Number(app.meta?.tasso_applicazione ?? 0);
  const difettiChiusi = Number(cantiere.meta?.chiusi ?? 0); // all-time, per storico/output
  const difettiCantiere = Array.isArray(cantiere.difetti) ? cantiere.difetti : [];
  const difettiChiusiRecenti = difettiCantiere.filter(
    (d) => d && d.stato === "chiuso" && oreFa(d.chiuso_il) <= oreFinestra
  ).length; // AR-052
  // AR-063: solo previsioni con esito reale (azzeccata/mancata), non la mera esistenza di righe.
  const previsioniChiuse = Array.isArray(calibr.registro)
    ? calibr.registro.filter((e) => e && (e.stato === "azzeccata" || e.stato === "mancata"))
    : [];
  const previsioniChiuseRecenti = previsioniChiuse.filter((e) => oreFa(e.chiuso_il) <= oreFinestra); // AR-052
  const calibrazionePiena = previsioniChiuseRecenti.length > 0;
  const esperimentiMisurati =
    Array.isArray(autoMig.esperimenti) &&
    autoMig.esperimenti.some(
      (e) => e && (e.stato === "misurato" || e.data_misura) && oreFa(e.data_misura || e.chiuso_il) <= oreFinestra
    ); // AR-052 + AR-063
  const provaChiusura = difettiChiusiRecenti > 0 || calibrazionePiena || esperimentiMisurati;
  const loopChiude = tasso > 0 && provaChiusura;

  const oreBrief = oreFa(brief.data);
  const oreRad = oreFa(rad.data);
  const giroACadenza = oreBrief <= 6;

  const sensori = cecita.sensori || {};
  const maxCecita = Number(cecita.meta?.max_giri_ciechi ?? 0);
  const sensoriOk = Number(cecita.meta?.sensori_ok ?? 0);
  const sentinelleScattano = maxCecita >= 3 || sensoriOk === 0;

  // ═══ Voto provvisorio 'pending-merge' + firma dello stato DECIDIBILE (fix alert-fatigue) ═══
  // Regola-radice della card: un difetto aperto può stare in 3 stati diversi, ma la sonda li
  // trattava tutti come "aperti" → il voto restava congelato e la sentinella salute_bassa
  // ri-scattava a ogni giro su una condizione già interamente in coda (alert fatigue).
  //   (a) APERTO DAVVERO      → il fix NON è ancora nel codice (verifica.presente !== true)
  //   (b) CHIUSO-IN-CODICE    → fix già committato sul ramo della memoria (main), manca solo il deploy (verifica.presente === true)
  //   (c) BLOCCANTE UMANO     → dipende SOLO da un'azione umana già in AZIONI-IN-ATTESA (verifica.tipo === "umano")
  // Fix: (1) accredita i (b) in un voto_provvisorio 'pending-merge'; (2) la firma di stato è
  // la SOLA lista dei (a) — l'unico lavoro NUOVO da decidere. (b) aspettano il merge, (c)
  // aspettano Nicola: nessuno dei due è "nuovo da decidere". Firma vuota = niente da decidere.
  const PESO_GRAVITA = { bloccante: 25, grave: 10, minore: 3 };
  const difetti = Array.isArray(cantiere.difetti) ? cantiere.difetti : [];
  const apertiDifetti = difetti.filter((d) => d && d.stato !== "chiuso");
  const isPendingMerge = (d) => d.verifica && d.verifica.presente === true; // (b)
  const isBloccanteUmano = (d) => d.verifica && d.verifica.tipo === "umano"; // (c)
  const isApertoDavvero = (d) => !isPendingMerge(d) && !isBloccanteUmano(d); // (a)
  const penalita = (arr) => arr.reduce((s, d) => s + (PESO_GRAVITA[d.gravita] || 0), 0);
  const pendingMerge = apertiDifetti.filter(isPendingMerge);
  const bloccantiUmani = apertiDifetti.filter(isBloccanteUmano);
  const apertiDavvero = apertiDifetti.filter(isApertoDavvero);
  // Scala cantiere (100 − penalità), l'unica in cui "accredito i pending-merge" e il "−25 a
  // bloccante" hanno senso. Diagnostica: NON tocca voto_salute_architettura (media dei 12 pilastri).
  const votoPieno = Math.max(0, 100 - penalita(apertiDifetti)); // pessimistico: tutto conta finché non è merge+deploy
  const votoProvvisorio = Math.max(0, 100 - penalita(apertiDavvero) - penalita(bloccantiUmani)); // accredita i (b)
  const saluteFirma = apertiDavvero.map((d) => d.id).filter(Boolean).sort().join(",");

  // Traccia giri consecutivi con tasso basso
  rad.sonda_meta = rad.sonda_meta || {};
  const prevBassi = Number(rad.sonda_meta.giri_tasso_basso || 0);
  const giriTassoBasso = tasso < 0.3 ? prevBassi + 1 : 0;
  const serveRadiografiaCompleta = giriTassoBasso >= 3 || oreRad > 240;

  let verdetto = "ok";
  if (giriTassoBasso >= 3 || oreRad > 240) verdetto = "serve-completa";
  else if (!loopChiude || !giroACadenza || maxCecita >= 3 || tasso < 0.3) verdetto = "attenzione";

  const sonda = {
    data: quando,
    loop_chiude: loopChiude,
    tasso_applicazione: tasso,
    prova_chiusura: provaChiusura,
    finestra_recency_gg: finestraGg, // AR-052
    difetti_chiusi: difettiChiusi,
    difetti_chiusi_recenti: difettiChiusiRecenti, // AR-052
    calibrazione_piena: calibrazionePiena,
    esperimenti_misurati: esperimentiMisurati,
    giro_a_cadenza: giroACadenza,
    sentinelle_scattano: sentinelleScattano,
    ore_da_ultima_completa: Math.round(oreRad),
    ore_da_ultimo_briefing: Math.round(oreBrief),
    max_giri_ciechi_sensori: maxCecita,
    giri_tasso_basso: giriTassoBasso,
    serve_radiografia_completa: serveRadiografiaCompleta,
    // Voto provvisorio 'pending-merge' + scomposizione a/b/c dei difetti (scala cantiere).
    salute_stato: "pending-merge",
    voto_provvisorio: votoProvvisorio,
    voto_pieno: votoPieno,
    pending_merge: pendingMerge.length,   // (b) chiusi-in-codice: accreditati nel provvisorio
    aperti_davvero: apertiDavvero.length, // (a) l'unico lavoro NUOVO da decidere
    bloccanti_umani: bloccantiUmani.length, // (c) già in AZIONI-IN-ATTESA
    salute_firma: saluteFirma,            // firma dello stato decidibile (ID dei (a))
    verdetto,
    nota: [
      loopChiude ? "loop chiude (con prova)" : provaChiusura ? "tasso=0 ma c'è chiusura" : "loop NON chiude: nessuna prova (0 difetti chiusi, calibrazione vuota, 0 esperimenti misurati)",
      giroACadenza ? `briefing ${Math.round(oreBrief)}h fa` : `briefing STALE (${Math.round(oreBrief)}h)`,
      maxCecita >= 3 ? `cecità sensori ${maxCecita} giri` : `sensori max cecità ${maxCecita}`,
      `salute pending-merge ${votoProvvisorio}/100 (floor ${votoPieno}): ${apertiDavvero.length} aperti-davvero · ${pendingMerge.length} in attesa merge · ${bloccantiUmani.length} bloccanti umani`,
      giriTassoBasso >= 3 ? "tasso basso 3+ giri → radiografia completa" : null,
    ]
      .filter(Boolean)
      .join(" · "),
  };

  rad.sonda = sonda;
  rad.sonda_meta = { giri_tasso_basso: giriTassoBasso, aggiornato: quando };

  writeJson(RAD_PATH, rad);

  // La SERIE storica resta sulla scala del voto completa (media dei 12 pilastri) per coerenza:
  // il voto_provvisorio (scala cantiere) viaggia come campo diagnostico a parte, non mescolato.
  const voto = Number(rad.voto_salute_architettura ?? 72);
  const difettiAperti = cantiere.meta?.aperti ?? apertiDifetti.length;
  const ultimoSnap = storico.serie?.[storico.serie.length - 1];
  const oggi = quando.slice(0, 10);
  const nuovoSnap = {
    data: oggi,
    voto_salute: voto,
    voto_provvisorio: votoProvvisorio,
    voto_pieno: votoPieno,
    firma: saluteFirma,
    difetti_aperti: difettiAperti,
    difetti_chiusi: difettiChiusi,
    pending_merge: pendingMerge.length,
    aperti_davvero: apertiDavvero.length,
    bloccanti_umani: bloccantiUmani.length,
    tipo: "sonda",
    nota: sonda.nota,
  };
  // Dedup del punto storico: nuovo snapshot solo se cambia lo stato DECIDIBILE (firma) o il voto —
  // non un punto identico a ogni giro su condizione invariata.
  if (
    !ultimoSnap ||
    ultimoSnap.data !== oggi ||
    ultimoSnap.nota !== sonda.nota ||
    (ultimoSnap.firma ?? "") !== saluteFirma ||
    ultimoSnap.voto_salute !== voto
  ) {
    storico.serie = storico.serie || [];
    storico.serie.push(nuovoSnap);
    if (storico.serie.length > 90) storico.serie = storico.serie.slice(-90);
    writeJson(STORICO_PATH, storico);
  }

  stampSegnale(
    "sonda-volano",
    verdetto === "ok" ? "ok" : "warn",
    `${verdetto} · tasso ${Math.round(tasso * 100)}% · ${quando}`
  );

  const out = { quando, sonda, serve_radiografia_completa: serveRadiografiaCompleta };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(`\n🩻 SONDA VOLANO — ${quando}\n`);
    console.log(`Loop chiude:        ${loopChiude ? "✅" : "❌"} (tasso ${Math.round(tasso * 100)}%)`);
    console.log(`Giro a cadenza:     ${giroACadenza ? "✅" : "❌"} (briefing ${Math.round(oreBrief)}h fa)`);
    console.log(`Sentinelle:         ${sentinelleScattano ? "⚠️  scattate" : "✅ quiete"}`);
    console.log(`Salute pending-merge:${votoProvvisorio}/100 (floor ${votoPieno}) — ${apertiDavvero.length} aperti-davvero · ${pendingMerge.length} in attesa merge · ${bloccantiUmani.length} bloccanti umani`);
    console.log(`Firma stato decidibile: ${saluteFirma || "(vuota → niente di nuovo da decidere)"}`);
    console.log(`Verdetto:           ${verdetto}`);
    if (serveRadiografiaCompleta) {
      console.log("\n→ Accoda 🟡 radiografia completa di sé (ritmo settimanale o su comando).");
    }
  }

  process.exit(verdetto === "ok" ? 0 : verdetto === "attenzione" ? 0 : 1);
}

main();
