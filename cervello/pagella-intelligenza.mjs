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
//   1. lezioni     — chiude alla radice ciò che Nicola corregge?  fonte: cervello/tasso-regole.mjs --json
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

/**
 * Legge il JSON che uno script figlio ha stampato, anche se prima ha stampato altro.
 *
 * PERCHÉ (misurato il 25/7). Prima era `JSON.parse(stdout)` secco: bastava UNA riga di rumore
 * sullo stdout del figlio — un avviso di Node, un `console.log` dimenticato da qualcuno mesi dopo —
 * perché il parse fallisse, la voce tornasse `null` e la pagella la mostrasse «non misurabile».
 * Rossa e cieca, senza dire perché: il guasto peggiore, quello che si traveste da misura.
 * Provato: `console.log("(node) attenzione…")` prima del JSON accecava la voce 1.
 *
 * Qui si prende l'ultimo oggetto JSON ben formato dell'output, che è quello che il figlio stampa
 * per ultimo. Se non c'è NIENTE di valido resta `null` — cieco davvero, e allora è giusto dirlo.
 */
export function estraiJson(stdout) {
  const testo = String(stdout || "").trim();
  if (!testo) return null;
  try {
    return JSON.parse(testo);
  } catch {
    /* c'è del rumore: lo cerco riga per riga qui sotto */
  }
  // Dall'ultima riga che apre un oggetto, all'indietro: il JSON "buono" è l'ultimo stampato.
  const righe = testo.split("\n");
  for (let i = righe.length - 1; i >= 0; i--) {
    if (!righe[i].startsWith("{")) continue;
    try {
      return JSON.parse(righe.slice(i).join("\n"));
    } catch {
      /* non era quello: continuo a salire */
    }
  }
  return null;
}

// ───────────────────────── le 5 misure ─────────────────────────

/**
 * 1. Chiude alla radice ciò che Nicola corregge?
 *
 * CAMBIATA IL 25/7 (firma: merge di Nicola). Prima chiedeva «applica le lezioni che scrive» e
 * delegava a `tasso-lezioni.mjs`, che però misura una cosa diversa da quella che dichiara: là una
 * lezione conta come applicata se la sua SIGLA compare in un documento recente
 * (`blob.includes(lez.id)`). Non se ha cambiato un comportamento: se qualcuno l'ha citata. Per
 * arrivare al 70% servivano 331 sigle citate in un mese — undici al giorno. Cancelleria.
 *
 * Le alternative sono state MISURATE prima di scegliere, non ragionate: allineare le finestre dà
 * 17% (irrilevante: 469 lezioni su 473 sono nate in 30 giorni); deduplicare non dà niente (473
 * testi, 473 distinti). La domanda giusta la macchina se la stampa già addosso a ogni avvio di
 * sessione: «ripetuto 32× in 18 lezioni e mai reso un gate».
 *
 * La misura nuova è PIÙ SEVERA: 12% dove la vecchia diceva 18%. Era la condizione per proporla.
 * Il vecchio numero resta visibile qui sotto come `tasso_citazioni`, così il confronto è possibile
 * e nessuno deve fidarsi sulla parola.
 */
function misuraLezioni(soglie) {
  const leggi = (script, args) => {
    const r = spawnSync(process.execPath, [join(AD_ROOT, script), ...args], { encoding: "utf8", timeout: 120000 });
    return estraiJson(r.stdout);
  };
  const dati = leggi("cervello/tasso-regole.mjs", ["--json"]);
  // Informativo: il numero che la voce mostrava fino al 25/7. Se non si legge, pazienza — non è
  // lui a decidere l'esito.
  const vecchio = leggi("cervello/tasso-lezioni.mjs", ["--json", "--dry"]);
  const citazioni = vecchio && vecchio.ok !== false ? Number(vecchio.tasso_applicazione) || 0 : null;

  const base = {
    id: "lezioni",
    // Nome del METRO, non della voce: quando cambia, il confronto con la misura precedente si
    // ferma invece di gridare «peggiorata» (vedi confronta()). Il vecchio metro era
    // "citazioni-id-lezione@1"; questo è un'altra domanda, e lo dice.
    metrica: "correzioni-nicola-diventate-regola@1",
    titolo: "Chiude alla radice ciò che Nicola corregge",
    soglia: pct(soglie.lezioni_tasso_min),
    fonte: "cervello/tasso-regole.mjs",
    come_si_alza:
      "prendere una correzione di Nicola e chiuderla alla radice (principio + gate automatico): " +
      "scrivere altre lezioni non aiuta, finiscono nel denominatore",
    tasso_citazioni: citazioni,
  };
  if (!dati || dati.ok === false) {
    return { ...base, valore: null, etichetta: "non misurabile", ok: false, cieco: true };
  }
  if (dati.senza_dati) {
    // Nessuna lezione affatto: non è silenzio, è il tubo rotto. Va detto come guasto.
    return { ...base, valore: null, etichetta: "apprendimento.json vuoto: misura cieca", ok: false, cieco: true };
  }
  if (!dati.misurabile) {
    // CORREZIONE (25/7, dopo il ri-audit): prima questo caso era `ok: false`, cioè la voce restava
    // ROSSA proprio quando Nicola non aveva più avuto niente da correggere in 30 giorni. Una
    // metrica che punisce il successo è peggio di una che non misura: zero correzioni è
    // l'obiettivo di tutta la voce, non un buco nei dati.
    return { ...base, valore: 1, etichetta: `nessuna correzione in ${dati.finestra_giorni || 30} giorni`, ok: true, cieco: false };
  }
  const tasso = Number(dati.tasso) || 0;
  return {
    ...base,
    valore: tasso,
    etichetta: `${pct(tasso)} (${dati.diventate_regola}/${dati.correzioni} correzioni)`,
    ok: tasso >= soglie.lezioni_tasso_min,
    cieco: false,
    // I due numeri che dicono la verità più del voto qui sopra, misurati il 25/7 rispondendo a
    // «l'hai risolto del tutto?». NON decidono l'esito — quale domanda debba fare questa voce, e
    // con che soglia, è una firma di Nicola, non una cosa da cambiare dentro un altro lavoro.
    // Stanno qui perché un numero scomodo nascosto è peggio di un numero scomodo scritto.
    //   · ricadute  = quante correzioni cadono su un tema già corretto ≥3 volte. Non dipende da
    //                 nessun campo che la macchina si autoassegna: scende solo se smette davvero.
    //   · gate      = quante correzioni sono legate a un controllo che può FALLIRE. Oggi zero:
    //                 «promossa a principio» significa iniettata nel prompt, non impedita.
    ricadute: dati.ricadute || null,
    gate: dati.gate || null,
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
  const base = {
    id: "calibrazione",
    titolo: "Sa prevedere le conseguenze delle sue mosse",
    metrica: "reparti-con-autonomia-guadagnata@1",
    soglia: `≥${soglie.calibrazione_reparti_min} reparti${soglie.calibrazione_richiede_ad ? ", AD incluso" : ""}`,
    fonte: "auto-coscienza/calibrazione.json",
    come_si_alza: "obbligo di scrivere «mi aspetto X» prima di ogni mossa, poi confronto col reale",
    debito: debitoCalibrazione(cal),
  };

  // CORREZIONE (25/7). Prima qui usciva sempre «0 reparti su 14», che si legge come «hanno provato
  // tutti e sbagliano tutti». Falso: al 25/7 le previsioni CHIUSE erano zero — nessuno aveva mai
  // confrontato una previsione col reale. Dire «va male» dove non c'è misura è lo stesso difetto
  // che la voce 1 aveva con «zero correzioni». Un buco nei dati non è una bocciatura: è un buco,
  // e va chiamato col suo nome perché la mossa da fare è diversa (misurare, non migliorare).
  const chiuse = cal.per_reparto.reduce((n, r) => n + (Number(r.previsioni) || 0), 0);
  if (chiuse === 0) {
    return {
      ...base,
      valore: null,
      etichetta: "nessuna previsione mai confrontata col reale",
      ok: false,
      cieco: true,
    };
  }

  const ok =
    affidabili.length >= soglie.calibrazione_reparti_min && (!soglie.calibrazione_richiede_ad || adOk);
  return {
    ...base,
    valore: affidabili.length,
    etichetta: `${affidabili.length} reparti su ${cal.per_reparto.length} (${chiuse} previsioni misurate)${adOk ? " · AD incluso" : " · AD escluso"}`,
    ok,
    cieco: false,
  };
}

/**
 * Quante previsioni la macchina deve ancora confrontare col reale.
 *
 * Sta sotto la voce 2 per lo stesso motivo per cui `ricadute` e `gate` stanno sotto la voce 1: è il
 * numero che spiega PERCHÉ la voce non si muove. Finché il debito non scende la voce resta cieca,
 * e nessun lavoro sulla «capacità di prevedere» può cambiarla — manca il confronto, non la bravura.
 */
function debitoCalibrazione(cal) {
  const reg = Array.isArray(cal.registro) ? cal.registro : [];
  const oggi = nowPiacenza().slice(0, 10);
  const dovute = reg.filter((e) => e.stato === "aperta" && e.entro && e.entro < oggi).length;
  const scadute = reg.filter((e) => e.stato === "scaduta" && e.reale == null).length;
  return dovute + scadute ? { dovute, scadute, totale: dovute + scadute } : null;
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

// ───────────────────────── confronto con la misura precedente ─────────────────────────

const EPSILON = 1e-9;

/**
 * Il gate anti-illusione: confronta ogni voce con l'ultima misura e dice se è
 * MIGLIORATA / FERMA / PEGGIORATA. Una voce "ferma" dopo un fix dichiarato = il fix era finto.
 */
export function confronta(voci, precedente) {
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
    // Se il METRO è cambiato, i due numeri non sono confrontabili: 12% con la domanda nuova non è
    // «peggio» di 18% con quella vecchia, è un'altra cosa. Senza questo guardo, il giorno in cui si
    // corregge una misura sbagliata il gate griderebbe «PEGGIORATA» — un falso allarme che punisce
    // chi sistema lo strumento. (Vale anche al contrario: una misura resa più comoda non deve
    // potersi spacciare per «MIGLIORATA».) Lo storico riparte da qui, dichiarandolo.
    if ((p.metrica || null) !== (v.metrica || null)) {
      v.movimento = "misura cambiata";
      v.precedente = p.valore;
      v.precedente_metrica = p.metrica || null;
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

// ───────────────────────── esecuzione ─────────────────────────

// Il corpo vive dentro main(): senza, importare questo file per PROVARE confronta() farebbe
// partire l'intera pagella e riscrivere il report. Un modulo che non si può importare non si
// può nemmeno testare — ed è il guardo anti-abuso di confronta() che va provato più di tutto.
async function main() {
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
              : v.movimento === "misura cambiata"
                ? "  (metro nuovo: non confrontabile col numero di ieri)"
                : "";
      console.log(`${segno} ${v.titolo}`);
      console.log(`   oggi: ${v.etichetta}${mov}   →  pronta a: ${v.soglia}`);
      // I due numeri scomodi sotto la voce 1: non decidono l'esito, ma non si nascondono.
      if (v.ricadute && v.ricadute.correzioni) {
        console.log(
          `   ricadute su un tema già corretto ≥3 volte: ${v.ricadute.su_tema_cronico}/${v.ricadute.correzioni} = ${pct(v.ricadute.quota)}`,
        );
      }
      if (v.gate && v.gate.correzioni) {
        console.log(
          `   correzioni legate a un gate che può fallire: ${v.gate.con_gate}/${v.gate.correzioni} = ${pct(v.gate.quota)}`,
        );
      }
      // Sotto la voce 2: il debito spiega perché non si muove — manca il confronto, non la bravura.
      if (v.debito) {
        console.log(
          `   previsioni mai confrontate col reale: ${v.debito.totale} (${v.debito.dovute} da misurare · ${v.debito.scadute} scadute nel silenzio)`,
        );
        console.log(`   il conto per nome:  node cervello/calibrazione.mjs debito`);
      }
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
    process.exitCode = 1;
    return;
  }
  // `exitCode` e non `exit()`: su una pipe `process.exit()` chiude prima che Node abbia svuotato lo
  // stdout e taglia l'output a 65536 byte esatti (riproduttore nel commento di tasso-regole.mjs).
  // Qui non è teoria: in `--json` questo report porta la `serie` storica, che cresce a ogni giro
  // fino al tetto di 200 voci ≈ 34 KB — metà del buffer. Il codice di uscita resta identico.
  process.exitCode = 0;
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
