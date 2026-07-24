#!/usr/bin/env node
// 🎓 PAGELLA DELL'INTELLIGENZA — i 5 numeri che dicono se la macchina è PRONTA per il business.
// 🟢 Sola lettura sulle fonti; scrive solo il proprio report (auto-coscienza/pagella-intelligenza.json).
//
// Problema: "quando è pronta?" non era definito da nessuna parte. Senza una soglia dichiarata,
// "analisi su analisi" non finisce mai per costruzione: la macchina trova difetti (93 trovati, 62 chiusi)
// più in fretta di quanto li chiuda, e ogni radiografia in più alza il numero dei difetti CONOSCIUTI,
// non l'intelligenza. In più i 5 numeri che contano vivono sparsi in 4 file diversi: nessuno li guarda
// insieme, quindi la macchina può dirsi "43/100" e continuare a lavorare come se niente fosse.
//
// Fix: UNA pagella sola, con soglie dichiarate PRIMA (non negoziabili a posteriori) e un gate di
// REGRESSIONE. La regola del ciclo: ogni giro chiude un difetto e poi RIMISURA. Se il numero non si è
// mosso, il fix era finto — il gate lo dice invece di lasciarlo passare come "fatto".
//
// Le 5 voci (fonte verificabile, mai auto-dichiarata):
//   1. lezioni     — applica davvero le lezioni che scrive?   fonte: cervello/tasso-lezioni.mjs --json
//   2. calibrazione— sa prevedere le conseguenze delle mosse?  fonte: auto-coscienza/calibrazione.json
//   3. freni       — i freni di sicurezza funzionano?          fonte: auto-coscienza/cantiere-difetti.json
//   4. quaderni    — i senior imparano o sono decorativi?      fonte: auto-coscienza/chiusura-loop.json
//   5. salute      — il voto che si dà da sola                 fonte: auto-coscienza/storico-salute.json
//
// Uso:
//   node cervello/pagella-intelligenza.mjs           -> misura, stampa e SCRIVE il report (+ storico)
//   node cervello/pagella-intelligenza.mjs --dry     -> misura e stampa, NON scrive (per le prove)
//   node cervello/pagella-intelligenza.mjs --json    -> output JSON (per il giro / la Cabina)
//   node cervello/pagella-intelligenza.mjs --gate    -> exit 1 se una voce è PEGGIORATA dall'ultima misura
//
// Env: PAGELLA_SOGLIE_JSON = path a un file con soglie alternative (default: quelle qui sotto, decise
//      con Nicola il 2026-07-24). Le soglie si cambiano con una firma, non dentro un altro lavoro.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const DRY = process.argv.includes("--dry");
const JSON_MODE = process.argv.includes("--json");
const GATE = process.argv.includes("--gate");

const AC = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");
const OUT_PATH = join(AC, "pagella-intelligenza.json");

/** Soglie di "PRONTA" — decise con Nicola il 2026-07-24. Cambiarle è una decisione 🟡, non un dettaglio. */
const SOGLIE_DEFAULT = {
  lezioni_tasso_min: 0.7, // applica ≥70% delle lezioni che scrive
  calibrazione_reparti_min: 5, // ≥5 reparti sanno prevedere (AD incluso)
  calibrazione_richiede_ad: true, // e l'AD dev'essere tra questi
  freni_bloccanti_max: 0, // zero freni di sicurezza rotti
  quaderni_vivi_quota_min: 0.6, // ≥60% dei quaderni vivi (72 su 120)
  salute_min: 80, // voto salute ≥80/100
};

function readJson(path, fallback = null) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function caricaSoglie() {
  const p = process.env.PAGELLA_SOGLIE_JSON;
  if (!p) return { ...SOGLIE_DEFAULT };
  return { ...SOGLIE_DEFAULT, ...(readJson(p, {}) || {}) };
}

/** Percentuale leggibile (0.18 -> "18%"). */
function pct(n) {
  return `${Math.round((Number(n) || 0) * 100)}%`;
}

// ─────────────────────────── le 5 misure ───────────────────────────

/** 1. Applica davvero le lezioni che scrive? Delega al calcolatore esistente (AR-051), in sola lettura. */
function misuraLezioni(soglie) {
  const r = spawnSync(process.execPath, [join(AD_ROOT, "cervello/tasso-lezioni.mjs"), "--json", "--dry"], {
    encoding: "utf8",
    timeout: 120000,
  });
  let dati = null;
  if (r.stdout) {
    try {
      dati = JSON.parse(r.stdout);
    } catch {
      dati = null;
    }
  }
  if (!dati || dati.ok === false) {
    return {
      id: "lezioni",
      titolo: "Applica le lezioni che scrive",
      valore: null,
      etichetta: "non misurabile",
      soglia: pct(soglie.lezioni_tasso_min),
      ok: false,
      cieco: true,
      fonte: "cervello/tasso-lezioni.mjs",
      come_si_alza: "rendere le lezioni dei blocchi automatici, non promemoria da ricordarsi (AR-149)",
    };
  }
  const tasso = Number(dati.tasso_applicazione) || 0;
  return {
    id: "lezioni",
    titolo: "Applica le lezioni che scrive",
    valore: tasso,
    etichetta: `${pct(tasso)} (${dati.lezioni_applicate}/${dati.lezioni_attive})`,
    soglia: pct(soglie.lezioni_tasso_min),
    ok: tasso >= soglie.lezioni_tasso_min,
    cieco: false,
    fonte: "cervello/tasso-lezioni.mjs",
    come_si_alza: "rendere le lezioni dei blocchi automatici, non promemoria da ricordarsi (AR-149)",
  };
}

/** 2. Sa prevedere le conseguenze delle proprie mosse? Un reparto conta se ha autonomia oltre "bassa". */
function misuraCalibrazione(soglie) {
  const cal = readJson(join(AC, "calibrazione.json"));
  if (!cal || !Array.isArray(cal.per_reparto)) {
    return {
      id: "calibrazione",
      titolo: "Sa prevedere le conseguenze delle sue mosse",
      valore: null,
      etichetta: "non misurabile",
      soglia: `≥${soglie.calibrazione_reparti_min} reparti`,
      ok: false,
      cieco: true,
      fonte: "auto-coscienza/calibrazione.json",
      come_si_alza: "obbligo di scrivere «mi aspetto X» prima di ogni mossa, poi confronto col reale",
    };
  }
  const affidabili = cal.per_reparto.filter((r) => r.autonomia && r.autonomia !== "bassa");
  const nomi = affidabili.map((r) => r.reparto);
  const adOk = nomi.some((n) => String(n).toLowerCase().includes("@ad"));
  const ok =
    affidabili.length >= soglie.calibrazione_reparti_min && (!soglie.calibrazione_richiede_ad || adOk);
  return {
    id: "calibrazione",
    titolo: "Sa prevedere le conseguenze delle sue mosse",
    valore: affidabili.length,
    etichetta: `${affidabili.length} reparti su ${cal.per_reparto.length}${adOk ? " (AD incluso)" : " (AD escluso)"}`,
    soglia: `≥${soglie.calibrazione_reparti_min} reparti${soglie.calibrazione_richiede_ad ? ", AD incluso" : ""}`,
    ok,
    cieco: false,
    fonte: "auto-coscienza/calibrazione.json",
    come_si_alza: "obbligo di scrivere «mi aspetto X» prima di ogni mossa, poi confronto col reale",
  };
}

/** 3. I freni di sicurezza funzionano? Conta i bloccanti NON chiusi nel cantiere. */
function misuraFreni(soglie) {
  const cant = readJson(join(AC, "cantiere-difetti.json"));
  if (!cant || !Array.isArray(cant.difetti)) {
    return {
      id: "freni",
      titolo: "Freni di sicurezza rotti",
      valore: null,
      etichetta: "non misurabile",
      soglia: `${soglie.freni_bloccanti_max}`,
      ok: false,
      cieco: true,
      fonte: "auto-coscienza/cantiere-difetti.json",
      come_si_alza: "chiudere i bloccanti aperti: i fix sono già scritti, aspettano il merge di Nicola",
    };
  }
  const aperti = cant.difetti.filter((d) => d.gravita === "bloccante" && d.stato !== "chiuso");
  return {
    id: "freni",
    titolo: "Freni di sicurezza rotti",
    valore: aperti.length,
    etichetta: `${aperti.length} bloccanti aperti`,
    soglia: `${soglie.freni_bloccanti_max}`,
    ok: aperti.length <= soglie.freni_bloccanti_max,
    cieco: false,
    inverso: true, // qui più basso = meglio
    dettaglio: aperti.map((d) => d.id),
    fonte: "auto-coscienza/cantiere-difetti.json",
    come_si_alza: "chiudere i bloccanti aperti: i fix sono già scritti, aspettano il merge di Nicola",
  };
}

/** 4. I senior imparano davvero, o i quaderni sono decorativi? */
function misuraQuaderni(soglie) {
  const cl = readJson(join(AC, "chiusura-loop.json"));
  if (!cl || typeof cl.totale !== "number" || typeof cl.vivi !== "number") {
    return {
      id: "quaderni",
      titolo: "Quaderni vivi (i senior imparano)",
      valore: null,
      etichetta: "non misurabile",
      soglia: pct(soglie.quaderni_vivi_quota_min),
      ok: false,
      cieco: true,
      fonte: "auto-coscienza/chiusura-loop.json",
      come_si_alza: "gate: non si chiude un lavoro 🟡/🔴 senza la riga ESITO nel quaderno (AR-154)",
    };
  }
  const quota = cl.totale > 0 ? cl.vivi / cl.totale : 0;
  return {
    id: "quaderni",
    titolo: "Quaderni vivi (i senior imparano)",
    valore: quota,
    etichetta: `${cl.vivi} su ${cl.totale} (${pct(quota)})`,
    soglia: `${pct(soglie.quaderni_vivi_quota_min)} (${Math.ceil(cl.totale * soglie.quaderni_vivi_quota_min)} su ${cl.totale})`,
    ok: quota >= soglie.quaderni_vivi_quota_min,
    cieco: false,
    fonte: "auto-coscienza/chiusura-loop.json",
    come_si_alza: "gate: non si chiude un lavoro 🟡/🔴 senza la riga ESITO nel quaderno (AR-154)",
  };
}

/** 5. Il voto che la macchina si dà da sola (ultimo della serie storica). */
function misuraSalute(soglie) {
  const st = readJson(join(AC, "storico-salute.json"));
  const serie = st && Array.isArray(st.serie) ? st.serie : null;
  if (!serie || serie.length === 0) {
    return {
      id: "salute",
      titolo: "Voto salute che si dà da sola",
      valore: null,
      etichetta: "non misurabile",
      soglia: `≥${soglie.salute_min}/100`,
      ok: false,
      cieco: true,
      fonte: "auto-coscienza/storico-salute.json",
      come_si_alza: "sale da solo quando salgono le altre 4 voci — non si tocca a mano",
    };
  }
  const ultimo = serie[serie.length - 1];
  const voto = Number(ultimo.voto_salute) || 0;
  return {
    id: "salute",
    titolo: "Voto salute che si dà da sola",
    valore: voto,
    etichetta: `${voto}/100 (misurato ${ultimo.data || "?"})`,
    soglia: `≥${soglie.salute_min}/100`,
    ok: voto >= soglie.salute_min,
    cieco: false,
    fonte: "auto-coscienza/storico-salute.json",
    come_si_alza: "sale da solo quando salgono le altre 4 voci — non si tocca a mano",
  };
}

// ─────────────────────────── confronto con la misura precedente ───────────────────────────

const EPSILON = 1e-9;

/**
 * Il gate anti-illusione: confronta ogni voce con l'ultima misura e dice se è
 * MIGLIORATA / FERMA / PEGGIORATA. Una voce "ferma" dopo un fix dichiarato = il fix era finto.
 */
function confronta(voci, precedente) {
  const prec = precedente && Array.isArray(precedente.voci) ? precedente.voci : [];
  const mappa = new Map(prec.map((v) => [v.id, v]));
  let peggiorate = 0;
  let migliorate = 0;
  for (const v of voci) {
    const p = mappa.get(v.id);
    if (!p || p.valore === null || v.valore === null) {
      v.movimento = "prima misura";
      continue;
    }
    const delta = Number(v.valore) - Number(p.valore);
    // Tolleranza anti-rumore: le quote sono frazioni (31/120), e due calcoli identici possono
    // differire di ~1e-17 per virgola mobile. Senza EPSILON quel rumore si traveste da
    // "migliorata" — cioè un fix finto passerebbe per vero, proprio ciò che questa pagella impedisce.
    const fermo = Math.abs(delta) < EPSILON;
    const meglio = !fermo && (v.inverso ? delta < 0 : delta > 0);
    const peggio = !fermo && (v.inverso ? delta > 0 : delta < 0);
    v.precedente = p.valore;
    if (fermo) v.movimento = "ferma";
    else if (meglio) {
      v.movimento = "migliorata";
      migliorate++;
    } else if (peggio) {
      v.movimento = "peggiorata";
      peggiorate++;
    }
  }
  return { peggiorate, migliorate };
}

// ─────────────────────────── esecuzione ───────────────────────────

const soglie = caricaSoglie();
const precedente = readJson(OUT_PATH);

const voci = [
  misuraLezioni(soglie),
  misuraCalibrazione(soglie),
  misuraFreni(soglie),
  misuraQuaderni(soglie),
  misuraSalute(soglie),
];

const { peggiorate, migliorate } = confronta(voci, precedente);
const superate = voci.filter((v) => v.ok).length;
const cieche = voci.filter((v) => v.cieco).length;
const pronta = superate === voci.length;

const report = {
  _cosa_e:
    "🎓 PAGELLA DELL'INTELLIGENZA — i 5 numeri che dicono se la macchina è PRONTA a gestire il business. Soglie decise con Nicola il 2026-07-24: cambiarle è una decisione 🟡, non un dettaglio dentro un altro lavoro. La regola del ciclo: ogni giro chiude un difetto e poi RIMISURA — se il numero non si è mosso, il fix era finto. Scritta da cervello/pagella-intelligenza.mjs.",
  aggiornato: nowPiacenza(),
  pronta,
  voci_superate: superate,
  voci_totali: voci.length,
  voci_cieche: cieche,
  migliorate,
  peggiorate,
  soglie,
  voci,
};

if (!DRY) {
  const serie = precedente && Array.isArray(precedente.serie) ? precedente.serie : [];
  serie.push({
    data: report.aggiornato,
    voci_superate: superate,
    pronta,
    valori: Object.fromEntries(voci.map((v) => [v.id, v.valore])),
  });
  report.serie = serie.slice(-200);
  writeFileSync(OUT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
} else if (precedente && Array.isArray(precedente.serie)) {
  report.serie = precedente.serie;
}

if (JSON_MODE) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`\n🎓 PAGELLA DELL'INTELLIGENZA — ${report.aggiornato}\n`);
  for (const v of voci) {
    const segno = v.cieco ? "⬜" : v.ok ? "✅" : "❌";
    // Niente frecce ↑/↓: su una voce "inversa" (meno bloccanti = meglio) una freccia in su
    // accanto a "8 bloccanti" si legge come un peggioramento. Diciamo la parola.
    const mov =
      v.movimento === "migliorata"
        ? "  (meglio)"
        : v.movimento === "peggiorata"
          ? "  (PEGGIO)"
          : v.movimento === "ferma"
            ? "  (ferma)"
            : "";
    console.log(`${segno} ${v.titolo}`);
    console.log(`   oggi: ${v.etichetta}${mov}   →  pronta a: ${v.soglia}`);
    if (!v.ok && v.come_si_alza) console.log(`   come si alza: ${v.come_si_alza}`);
    console.log("");
  }
  console.log(`   Voci a posto: ${superate}/${voci.length}${cieche ? ` · cieche: ${cieche}` : ""}`);
  if (migliorate || peggiorate) {
    console.log(`   Dall'ultima misura: ${migliorate} migliorate · ${peggiorate} peggiorate`);
  }
  console.log(
    pronta
      ? "\n✅ PRONTA — tutte le soglie superate. Si può tornare sul business."
      : `\n⏳ NON ancora pronta — mancano ${voci.length - superate} voci su ${voci.length}.`,
  );
  if (!DRY) console.log(`   report: ${OUT_PATH.replace(`${AD_ROOT}/`, "")}\n`);
}

await stampSegnale(
  "pagella-intelligenza",
  pronta ? "ok" : peggiorate > 0 ? "attenzione" : "info",
  `${superate}/${voci.length} voci a posto · ${migliorate} migliorate · ${peggiorate} peggiorate`,
).catch(() => {});

if (GATE && peggiorate > 0) {
  console.error(
    `\n❌ GATE: ${peggiorate} voce/i PEGGIORATA/E dall'ultima misura — il lavoro appena fatto ha tolto, non aggiunto.`,
  );
  process.exit(1);
}
process.exit(0);
