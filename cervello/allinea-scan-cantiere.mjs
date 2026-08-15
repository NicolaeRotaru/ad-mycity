#!/usr/bin/env node
// Allinea la lista «Radiografia» (foto scan) al cantiere vivo dopo i fix.
// 🟢 Sola lettura del codice + aggiornamento memoria auto-coscienza.
//
// Problema: il cantiere si chiude coi merge (auto-fix), ma i findings dello scan del 7/7
// restano tutti «aperti» → il Pannello mostra 74 problemi quando ne resta 1 da fare.
//
// Cosa fa:
//   1. Per ogni finding in auto-radiografia.json, se matcha un difetto del cantiere
//      (AR-id nel titolo, titolo simile, stessa dimensione + parole chiave) → copia stato
//   2. Se il finding ha blocco `verifica` e il fix risulta nel codice → chiude come «verificato»
//   3. Aggiorna sync_scan (conteggi aperti/chiusi/in-corso) + voto live dalla sonda
//   4. Stesso schema leggero su radiografia-marketplace.json se esiste chiusi-manuali
//
// Uso:
//   node cervello/allinea-scan-cantiere.mjs
//   node cervello/allinea-scan-cantiere.mjs --json

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { scriviJsonAtomico } from "./scrivi-json.mjs";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";
// 📇 IL CONTRATTO DELLA SCHEDA, in un posto solo. Questo file chiude i findings delle radiografie:
// è il SECONDO che scrive `stato: "chiuso"` nella macchina, e finché il timbro viveva dentro
// auto-fix.mjs (irraggiungibile senza trascinarsi dietro una chiamata a git) se n'era scritto una
// versione sua — `|| ""`. Ora chiama la stessa funzione dell'altro (AR-655).
import { findingsFuoriContratto, timbraChiusura, timbroValido } from "./contratto-scheda.mjs";
// 🚧 GLI STATI DEL CANTIERE — «quanti difetti ci sono» ha UNA casa (cervello/stati-cantiere.mjs).
// Questo file scriveva il suo conto a mano su tre stati e lasciava fuori le 56 schede
// `da-riverificare`, dentro il blocco che il Pannello legge (AR-684 · AR-718).
import { contaDifetti, sommaTorna } from "./stati-cantiere.mjs";

const JSON_MODE = process.argv.includes("--json");
const VAULT = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");
const RAD = join(VAULT, "auto-radiografia.json");
const CANTIERE = join(VAULT, "cantiere-difetti.json");
const MKP = join(VAULT, "radiografia-marketplace.json");

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}
// AR-296 — la scrittura passa dal writer atomico condiviso: `writeFileSync` non è atomico, e un
// processo che muore a metà (kill del servizio, riavvio del VPS) lascia sul disco un JSON troncato che
// al giro dopo non si parsa più — «memoria bloccata da un file rotto». Questa funzione era
// copiaincollata in cinque file; ora è una sola, in cervello/scrivi-json.mjs.
function writeJson(path, data) {
  scriviJsonAtomico(path, data);
}

/**
 * I CONTI DEL CANTIERE DENTRO `sync_scan` — AR-684 · AR-718.
 *
 * Qui c'erano tre `.filter()` a mano su tre etichette (`aperto`, `in-corso`, `chiuso`): le schede
 * `da-riverificare` non cadevano in nessuna, quindi 56 difetti veri uscivano dal blocco che il
 * Pannello legge nella pagina della radiografia. Non erano risolti: la loro etichetta non era
 * prevista, ed è tutta la differenza fra un difetto chiuso e un difetto invisibile.
 *
 * È una funzione a parte, e pura, per la ragione di sempre: dentro `allineaMacchina` la decisione
 * viveva insieme alla lettura e alla scrittura di due file di memoria, quindi una prova poteva solo
 * cercarne la forma. Qui la esegue.
 */
export function cantiereNelSyncScan(difetti) {
  const c = contaDifetti(difetti);
  return {
    cantiere_totale: c.totale,
    cantiere_aperti: c.aperti,
    cantiere_in_corso: c.in_corso,
    cantiere_da_riverificare: c.da_riverificare,
    cantiere_altri: c.altri,
    cantiere_chiusi: c.chiusi,
    // «Quanto lavoro resta» è tutto ciò che non è chiuso, compresi gli stati che non so nominare.
    cantiere_da_fare: c.da_fare,
    cantiere_somma_torna: sommaTorna(c),
    cantiere_stati_ignoti: c.stati_ignoti,
  };
}

/** Normalizza per confronto titoli: minuscolo, niente emoji/punteggiatura, spazi collassati. */
function norm(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/[^a-z0-9àèéìòù\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function paroleSignificative(s) {
  const stop = new Set(["il", "la", "le", "lo", "di", "da", "in", "su", "per", "con", "non", "che", "del", "della", "dei", "una", "uno", "the", "and"]);
  return norm(s)
    .split(" ")
    .filter((w) => w.length > 3 && !stop.has(w));
}

function overlapParole(a, b) {
  const pa = new Set(paroleSignificative(a));
  const pb = new Set(paroleSignificative(b));
  if (!pa.size || !pb.size) return 0;
  let n = 0;
  for (const w of pa) if (pb.has(w)) n++;
  return n / Math.min(pa.size, pb.size);
}

function arId(testo) {
  const m = String(testo ?? "").match(/AR-\d{3}/i);
  return m ? m[0].toUpperCase() : null;
}

/** Verifica oggettiva: il fix del finding è presente nel codice? (stessa logica di auto-fix.mjs) */
function verificaFinding(f) {
  const v = f.verifica;
  if (!v || !v.file || !v.pattern) return { esito: "manuale", dettaglio: "nessuna prova automatica" };
  const p = join(AD_ROOT, v.file);
  if (!existsSync(p)) return { esito: "aperto", dettaglio: `file assente: ${v.file}` };
  let txt = "";
  try {
    txt = readFileSync(p, "utf8");
  } catch (e) {
    return { esito: "aperto", dettaglio: `illeggibile: ${e.message}` };
  }
  let re;
  try {
    re = new RegExp(v.pattern);
  } catch (e) {
    return { esito: "manuale", dettaglio: `pattern non valido: ${e.message}` };
  }
  const trovato = re.test(txt);
  const vuolePresente = v.presente !== false;
  const risolto = vuolePresente ? trovato : !trovato;
  return {
    esito: risolto ? "risolto" : "aperto",
    dettaglio: `${v.file} ${vuolePresente ? "contiene" : "NON contiene"} /${v.pattern}/ → ${trovato ? "trovato" : "assente"}`,
  };
}

/**
 * AR-655 — CHIUDERE UN FINDING PERCHÉ IL SUO DIFETTO È CHIUSO NEL CANTIERE.
 *
 * QUI C'ERA `f.chiuso_il = f.chiuso_il || d.chiuso_il || ""`.
 *
 * La stringa vuota è la malattia esatta di AR-575 su un altro registro: una chiusura senza data
 * non appartiene a nessun mese, e chi conta per mese non la vede. Il fallback sembrava innocuo
 * perché copiava la data del cantiere «quando c'era» — ma il caso in cui NON c'era è esattamente
 * quello che ha prodotto le 74 orfane. Un fallback a stringa vuota non è un valore di riserva: è
 * un buco scritto in bella copia, e passa i controlli perché il campo esiste.
 *
 * Ora la data la mette il timbro unico, che pretende l'ora e sa sempre che ora è. E si eredita
 * solo un timbro VALIDO: una data secca del cantiere («2026-08-04», 24 schede ce l'hanno) non si
 * propaga qui dentro — si prende l'adesso, che l'ora ce l'ha.
 *
 * Pura e esportata apposta: era una riga in mezzo a due cicli annidati dentro una funzione che
 * legge e riscrive due file di memoria, quindi nessun test poteva eseguirla senza far girare
 * l'allineatore intero sul vault vero.
 */
export function chiudiFindingDalCantiere(f, d, ora) {
  const ereditata = timbroValido(d?.chiuso_il) ? d.chiuso_il : null;
  timbraChiusura(f, { quando: timbroValido(f?.chiuso_il) ? f.chiuso_il : ereditata || ora });
  f.chiuso_da = "cantiere";
  f.cantiere_id = d?.id;
  return f;
}

function matchCantiere(finding, dimKey, difetti) {
  const ft = finding.titolo || "";
  const fid = arId(ft);
  if (fid) {
    const d = difetti.find((x) => x.id === fid);
    if (d) return d;
  }
  const fn = norm(ft).slice(0, 45);
  for (const d of difetti) {
    const dn = norm(d.titolo || "").slice(0, 45);
    if (fn && dn && (fn.includes(dn.slice(0, 28)) || dn.includes(fn.slice(0, 28)))) return d;
    if (overlapParole(ft, d.titolo) >= 0.55) return d;
    if (d.dimensione === dimKey && overlapParole(ft, d.titolo) >= 0.35) return d;
  }
  return null;
}

function allineaMacchina() {
  const rad = readJson(RAD, null);
  const cantiere = readJson(CANTIERE, { difetti: [] });
  if (!rad) return { ok: false, motivo: "auto-radiografia.json assente" };

  const difetti = Array.isArray(cantiere.difetti) ? cantiere.difetti : [];
  const byId = Object.fromEntries(difetti.filter((d) => d.id).map((d) => [d.id, d]));
  let aggiornati = 0;
  let chiusiVerifica = 0;
  let aperti = 0;
  let chiusi = 0;
  let inCorso = 0;
  const ora = nowPiacenza();

  for (const dim of rad.dimensioni || []) {
    for (const f of dim.findings || []) {
      const d = matchCantiere(f, dim.key, difetti);
      const prev = f.stato;
      if (d) {
        if (d.stato === "chiuso") {
          chiudiFindingDalCantiere(f, d, ora);
        } else if (d.stato === "in-corso") {
          f.stato = "in-corso";
          f.cantiere_id = d.id;
        } else if (f.stato !== "chiuso") {
          f.stato = "aperto";
        }
      } else if (f.stato !== "chiuso" && f.verifica) {
        const r = verificaFinding(f);
        if (r.esito === "risolto") {
          // Anche questa strada passa dal timbro unico: erano DUE le chiusure in questo file, e
          // ripararne una sola è l'errore già pagato (AR-172, «la porta a mano riparata e quella
          // automatica lasciata aperta»).
          timbraChiusura(f, { quando: timbroValido(f.chiuso_il) ? f.chiuso_il : ora, come: r.dettaglio });
          f.chiuso_da = "verifica-codice";
          chiusiVerifica++;
        }
      }
      if (f.stato === "chiuso") chiusi++;
      else if (f.stato === "in-corso") inCorso++;
      else aperti++;
      if (f.stato !== prev) aggiornati++;
    }
  }

  // AR-105: NON sovrascrivere voto_salute_architettura (media 12 pilastri, scala radiografia completa)
  // con il voto_provvisorio della sonda (scala cantiere). Il voto viene aggiornato SOLO dalla radiografia completa.

  // AR-360 — I FINDINGS CHE IL VOLANO NON SA INSTRADARE.
  //
  // Lo schema dei sotto-agenti (.claude/workflows/auto-radiografia.js) dichiara `genera` come enum
  // obbligatorio. Ma è uno schema D'INGRESSO: chiede a chi scrive, e nessuno rilegge il file
  // scritto. Questa è la causa di sistema che AR-360 mette a nudo — «i contratti della macchina
  // sono dichiarati all'ingresso e mai riverificati all'uscita: un file scritto male entra in
  // memoria e diventa la base del giro dopo». Misurato il 13/8: 163 findings su 286 (il 57%) non
  // hanno `genera`, e il volano li lascia cadere in silenzio. La scheda diceva 45% — cioè il
  // numero è PEGGIORATO mentre nessuno lo guardava.
  //
  // Qui non si boccia e non si riscrive niente: si CONTA, dentro il file che il Pannello legge,
  // così il silenzio diventa un numero. Il rosso duro spetta a `valida-contratti.mjs`, che è la
  // casa dei contratti di questi JSON — e non è di questa corsia (vedi `fuori_territorio`).
  const nonInstradabili = findingsFuoriContratto(rad);

  rad.sync_scan = {
    aggiornato: nowPiacenza(),
    findings_aperti: aperti,
    findings_non_instradabili: nonInstradabili.length,
    findings_non_instradabili_ids: nonInstradabili.slice(0, 40).map((f) => f.titolo),
    findings_in_corso: inCorso,
    findings_chiusi: chiusi,
    findings_tot: aperti + inCorso + chiusi,
    ...cantiereNelSyncScan(difetti),
    match_aggiornati: aggiornati,
    chiusi_verifica: chiusiVerifica,
    data_scan: rad.data || null,
    // AR-105: voto_salute_architettura aggiornato solo dalla radiografia completa, non qui
  };

  writeJson(RAD, rad);
  return {
    ok: true,
    aggiornati,
    chiusi_verifica: chiusiVerifica,
    aperti,
    in_corso: inCorso,
    chiusi,
    non_instradabili: nonInstradabili.length,
    cantiere: {
      aperti: rad.sync_scan.cantiere_aperti,
      in_corso: rad.sync_scan.cantiere_in_corso,
      da_riverificare: rad.sync_scan.cantiere_da_riverificare,
      chiusi: rad.sync_scan.cantiere_chiusi,
      da_fare: rad.sync_scan.cantiere_da_fare,
      totale: rad.sync_scan.cantiere_totale,
    },
  };
}

function allineaMarketplace() {
  const mkp = readJson(MKP, null);
  if (!mkp) return { ok: false, motivo: "radiografia-marketplace.json assente" };

  let aperti = 0;
  let chiusi = 0;
  for (const dim of mkp.dimensioni || []) {
    for (const f of dim.findings || []) {
      if (f.stato === "chiuso") chiusi++;
      else aperti++;
    }
  }

  mkp.sync_scan = {
    aggiornato: nowPiacenza(),
    findings_aperti: aperti,
    findings_chiusi: chiusi,
    findings_tot: aperti + chiusi,
    data_scan: mkp.data || null,
    nota: "Per aggiornare la lista serve un nuovo audit marketplace; i fix sul codice non la riscrivono da soli.",
  };
  writeJson(MKP, mkp);
  return { ok: true, aperti, chiusi };
}

async function main() {
  const mac = allineaMacchina();
  const mkp = allineaMarketplace();
  const ok = mac.ok;
  const sintesi = mac.ok
    ? `macchina: ${mac.aperti} aperti · ${mac.in_corso} in-corso · ${mac.chiusi} chiusi (${mac.aggiornati} aggiornati) · ${mac.non_instradabili} findings che il volano non sa instradare`
    : `macchina: ${mac.motivo}`;

  await stampSegnale("allinea-scan-cantiere", ok ? "ok" : "warn", sintesi);

  const out = { ok, quando: nowPiacenza(), macchina: mac, marketplace: mkp };
  if (JSON_MODE) console.log(JSON.stringify(out, null, 2));
  else console.log(`🔄 allinea-scan-cantiere — ${sintesi}`);
  process.exit(ok ? 0 : 1);
}

// ⚠️ Il CLI parte solo se questo file è LANCIATO, non quando un test ne importa una funzione.
// Prima di questa guardia, `import` di questo modulo faceva girare l'allineatore INTERO e
// riscriveva due file di memoria sotto i piedi di chi voleva solo provare una riga — la stessa
// forma già vista in `sonda-volano.mjs` e in `cantiere-prove.mjs`. Un modulo che non si può
// importare non si può provare, e un fix che non si può provare non è un fix.
if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main().catch(async (e) => {
    await stampSegnale("allinea-scan-cantiere", "errore", (e.message || e).toString().slice(0, 160));
    console.error("ERRORE allinea-scan-cantiere:", e.message || e);
    process.exit(1);
  });
}
