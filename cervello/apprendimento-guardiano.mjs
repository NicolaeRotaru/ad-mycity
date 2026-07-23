#!/usr/bin/env node
// 🧠 APPRENDIMENTO-GUARDIANO — il guardiano che misura se la macchina IMPARA DAVVERO o solo ACCUMULA.
//
// IL PROBLEMA CHE RISOLVE (richiesta di Nicola: «fa ancora tanti errori che devo continuare a
// ripeterli»). La macchina CATTURA benissimo le lezioni (centinaia in apprendimento.json) ma non le
// CRISTALLIZZA né le fa rispettare: il tasso di applicazione resta basso, quasi nessuna lezione
// diventa `principio`, e lo stesso errore torna. Questo guardiano rende quel fallimento un NUMERO
// che il giro non può ignorare — stesso schema di allocazione-check / coerenza-fatti: se la salute
// dell'apprendimento è sotto soglia, esce con rc≠0 e giro.sh passa un VINCOLO HARD al motore
// («cristallizza questi errori ricorrenti ADESSO, non loggare la lezione n+1»).
//
// COSA MISURA (sola lettura di apprendimento.json):
//   1) SALUTE dell'archivio: tasso_applicazione, arretrato di cristallizzazione (lezioni mature mai
//      promosse a principio), decadimento fermo (archivio-cimitero), gonfiore (troppe lezioni vive).
//   2) ERRORI RICORRENTI non cristallizzati: raggruppa le lezioni per firma (tag) e trova le aree
//      dove lo stesso tipo di errore è tornato molte volte SENZA mai diventare un principio/gate —
//      dando priorità a quelle nate dalle CORREZIONI di Nicola (`caso_studio_nicola`).
//
// USO:
//   node cervello/apprendimento-guardiano.mjs            -> report umano + exit code (0 sano, 1 malato)
//   node cervello/apprendimento-guardiano.mjs --gate     -> come sopra, pensato per il giro (rc≠0 = vincolo)
//   node cervello/apprendimento-guardiano.mjs --memoria   -> blocco compatto «errori che si ripetono» (per l'iniezione)
//   node cervello/apprendimento-guardiano.mjs --json      -> JSON macchina
//
// Non scrive NULLA. In --memoria non fallisce mai (exit 0): serve solo a portare i segnali nel contesto.

import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const APPR = join(ROOT, "MyCity-Vault", "90-Memoria-AI", "auto-coscienza", "apprendimento.json");

const args = process.argv.slice(2);
const MODE_MEMORIA = args.includes("--memoria");
const MODE_JSON = args.includes("--json");

// --- soglie di salute (tarate sui dati reali di luglio 2026: 470 lezioni, 3 principi, applic. 0.17) ---
const SOGLIE = {
  tassoApplicazioneMin: 0.3, // sotto = le lezioni non cambiano le decisioni
  arretratoCristallizzazioneMax: 20, // lezioni mature (conf≥0.8 & evidenze≥3) mai promosse a principio
  totaleLezioniMax: 400, // sopra = archivio-cimitero, va potato
  confPrincipio: 0.8,
  evidenzePrincipio: 3,
  // un cluster (per tag) conta come «errore ricorrente non cristallizzato» se:
  clusterMinLezioni: 3, // è tornato in almeno 3 lezioni distinte…
  clusterMinEvidenze: 4, // …oppure ha accumulato almeno 4 evidenze totali
};

// tag che sono ETICHETTE DI PROCESSO, non firme d'errore: non identificano un tipo di bug, li escludiamo
// come chiave di cluster (comparirebbero in cima solo perché generici).
const TAG_GENERICI = new Set([
  "caso-studio", "correzione", "nicola", "processo", "ad", "memoria", "apprendimento",
  "lezione", "generale", "varie", "note",
]);

export function leggiAppr() {
  try {
    if (!existsSync(APPR)) return null;
    return JSON.parse(readFileSync(APPR, "utf8"));
  } catch {
    return null;
  }
}

// Carica e analizza in un colpo — usato sia dalla CLI sotto sia da contesto-lezioni.mjs (import).
// Non lancia mai: se il file manca/è rotto torna null.
export function caricaEAnalizza() {
  const d = leggiAppr();
  return d ? analizza(d) : null;
}

function tronca(s, n) {
  const t = String(s || "").replace(/\s+/g, " ").replace(/\*\*/g, "").trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

export function analizza(dati) {
  const tutte = Array.isArray(dati?.lezioni) ? dati.lezioni : [];
  // «vive» = attive o principio (le decadute/in-prova non contano per la salute operativa)
  const vive = tutte.filter((l) => l && (l.stato === "attiva" || l.stato === "principio" || !l.stato));
  const principi = tutte.filter((l) => l && l.stato === "principio");
  const meta = dati?.meta || {};

  // tasso di applicazione: dal meta se presente, altrimenti stimato dalle lezioni con usi>0
  let tasso = Number(meta.tasso_applicazione);
  if (!Number.isFinite(tasso)) {
    const conUsi = vive.filter((l) => Number(l.usi) > 0).length;
    tasso = vive.length ? conUsi / vive.length : 0;
  }

  // arretrato di cristallizzazione: lezioni MATURE (conf & evidenze da principio) ma ancora NON principio
  const mature = vive.filter(
    (l) =>
      Number(l.confidenza) >= SOGLIE.confPrincipio &&
      Number(l.evidenze) >= SOGLIE.evidenzePrincipio &&
      l.stato !== "principio",
  );

  const decadute = Number(meta.decadute ?? tutte.filter((l) => l?.stato === "decaduta").length) || 0;

  // --- clustering per firma d'errore ---
  // Escludiamo (a) le etichette-processo note e (b) i tag TROPPO frequenti (>18% delle lezioni):
  // quelli sono CATEGORIE (es. «pannello», «tech»), non firme di un tipo d'errore specifico.
  const freq = new Map();
  for (const l of vive) for (const t of Array.isArray(l.tag) ? l.tag : []) freq.set(t, (freq.get(t) || 0) + 1);
  const sogliaCategoria = Math.max(30, Math.round(vive.length * 0.18));
  const escluso = (t) => !t || TAG_GENERICI.has(String(t).toLowerCase()) || (freq.get(t) || 0) > sogliaCategoria;

  const perTag = new Map();
  for (const l of vive) {
    for (const t of Array.isArray(l.tag) ? l.tag : []) {
      if (escluso(t)) continue;
      if (!perTag.has(t)) perTag.set(t, []);
      perTag.get(t).push(l);
    }
  }
  const clusters = [...perTag.entries()]
    .map(([tag, ls]) => ({
      tag,
      lezioni: ls.length,
      evidenze: ls.reduce((a, l) => a + (Number(l.evidenze) || 0), 0),
      daNicola: ls.filter((l) => l.caso_studio_nicola).length,
      cristallizzato: ls.some((l) => l.stato === "principio"),
      esempio: tronca(ls.slice().sort((a, b) => (Number(b.evidenze) || 0) - (Number(a.evidenze) || 0))[0]?.testo, 150),
    }))
    .filter((c) => !c.cristallizzato && (c.lezioni >= SOGLIE.clusterMinLezioni || c.evidenze >= SOGLIE.clusterMinEvidenze))
    // «dolore» = quante volte è tornato, con peso doppio alle correzioni di Nicola
    .sort((a, b) => b.evidenze + b.lezioni + b.daNicola - (a.evidenze + a.lezioni + a.daNicola));

  // --- verdetti di salute ---
  const problemi = [];
  if (tasso < SOGLIE.tassoApplicazioneMin)
    problemi.push(
      `tasso di applicazione ${(tasso * 100).toFixed(0)}% < ${SOGLIE.tassoApplicazioneMin * 100}% — le lezioni NON cambiano le decisioni (sono note, non comportamento).`,
    );
  if (mature.length > SOGLIE.arretratoCristallizzazioneMax)
    problemi.push(
      `${mature.length} lezioni MATURE (conf≥${SOGLIE.confPrincipio} & evidenze≥${SOGLIE.evidenzePrincipio}) mai promosse a principio — la cristallizzazione è ferma (solo ${principi.length} principi su ${vive.length} lezioni).`,
    );
  if (vive.length > SOGLIE.totaleLezioniMax && decadute === 0)
    problemi.push(
      `${vive.length} lezioni vive e 0 decadute — il decadimento non gira: l'archivio è un cimitero, non una memoria viva. Va potato.`,
    );
  const ricorrentiGravi = clusters.filter((c) => c.evidenze >= 8 || c.daNicola >= 5);
  if (ricorrentiGravi.length) {
    const peggiori = ricorrentiGravi
      .slice(0, 3)
      .map((c) => `«${c.tag}» (${c.lezioni} lezioni, ${c.evidenze} ripetizioni, ${c.daNicola} da Nicola)`)
      .join("; ");
    problemi.push(
      `errori che si RIPETONO senza mai diventare un gate — i 3 peggiori: ${peggiori}. Ognuno va cristallizzato alla radice, non riloggato.`,
    );
  }

  return { tutte, vive, principi, tasso, mature, decadute, clusters, problemi, sano: problemi.length === 0 };
}

// ---------------------------------------------------------------------------
// CLI: gira solo se lanciato direttamente (`node apprendimento-guardiano.mjs`), non quando importato.
const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (!isMain) {
  // importato da un altro modulo (es. contesto-lezioni.mjs): esporta le funzioni e basta, niente CLI.
} else {
const dati = leggiAppr();

if (!dati) {
  if (MODE_JSON) process.stdout.write(JSON.stringify({ esito: "assente" }));
  else if (!MODE_MEMORIA) console.log("apprendimento.json assente o illeggibile — niente da controllare.");
  process.exit(0); // fail-safe: mai rompere un giro per un file mancante
}

const r = analizza(dati);

// --- modalità MEMORIA: blocco compatto da iniettare nel contesto (mai fallisce) ---
if (MODE_MEMORIA) {
  const top = r.clusters.slice(0, 5);
  if (top.length) {
    const righe = top.map(
      (c) => `- ${c.tag}: ${c.lezioni} lezioni, ${c.evidenze} ripetizioni${c.daNicola ? `, ${c.daNicola} da correzioni di Nicola` : ""} — mai cristallizzato in un gate.`,
    );
    process.stdout.write(
      "⛔ ERRORI CHE SI RIPETONO (cristallizzali in un principio/gate — NON loggare l'ennesima lezione uguale):\n" +
        righe.join("\n") +
        "\n",
    );
  }
  process.exit(0);
}

// --- modalità JSON ---
if (MODE_JSON) {
  process.stdout.write(
    JSON.stringify(
      {
        esito: r.sano ? "sano" : "malato",
        tasso_applicazione: r.tasso,
        lezioni_vive: r.vive.length,
        principi: r.principi.length,
        arretrato_cristallizzazione: r.mature.length,
        decadute: r.decadute,
        problemi: r.problemi,
        errori_ricorrenti: r.clusters.slice(0, 10),
      },
      null,
      2,
    ),
  );
  process.exit(r.sano ? 0 : 1);
}

// --- modalità REPORT umano (default / --gate) ---
console.log("🧠 SALUTE DELL'APPRENDIMENTO");
console.log(`   lezioni vive: ${r.vive.length} · principi: ${r.principi.length} · decadute: ${r.decadute}`);
console.log(`   tasso di applicazione: ${(r.tasso * 100).toFixed(0)}%`);
console.log(`   arretrato di cristallizzazione (mature mai promosse): ${r.mature.length}`);
console.log("");
if (r.clusters.length) {
  console.log("🔁 ERRORI CHE SI RIPETONO (per firma, non ancora cristallizzati in un principio/gate):");
  for (const c of r.clusters.slice(0, 10)) {
    console.log(
      `   ${c.tag.padEnd(18)} lezioni:${String(c.lezioni).padStart(3)}  ripetizioni:${String(c.evidenze).padStart(3)}  da-Nicola:${c.daNicola}`,
    );
  }
  console.log("");
}
if (r.sano) {
  console.log("✅ Apprendimento sano.");
  process.exit(0);
} else {
  console.log("❌ APPRENDIMENTO MALATO — la macchina accumula ma non impara:");
  for (const p of r.problemi) console.log(`   • ${p}`);
  console.log("");
  console.log("→ Azione: promuovi a `principio` le lezioni mature con più evidenze (cambia il mansionario/");
  console.log("  sentinella), e per ogni area ricorrente qui sopra crea un GATE che blocca l'errore alla radice.");
  process.exit(1);
}
} // fine blocco isMain
