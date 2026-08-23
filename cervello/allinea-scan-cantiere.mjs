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
// 🏪 I CONTI DEL SITO — «quanti difetti ha il marketplace» ha UNA casa
// (cervello/radiografia-marketplace-conti.mjs), che sa leggere le due forme del referto e che NON
// risponde zero quando non ha potuto leggere. Qui sotto c'era la terza definizione della parola.
import { contoMarketplace } from "./radiografia-marketplace-conti.mjs";
import { provaSoddisfatta } from "./prove-regole.mjs";
// ⛔ AR-796 — LA TERZA STRADA CHE ARRIVA ALL'ATTO. Il freno è stato montato su tutt'e due le porte
// di auto-fix.mjs; questo file è il SECONDO che scrive `stato: "chiuso"` (lo dice da sé in cima), e
// una delle sue due chiusure decide su una prova. Lasciarla fuori sarebbe AR-172 per la terza
// volta nello stesso lotto. Misurato il 23/8: oggi ZERO dei 208 findings aperti porta un campo
// `verifica`, quindi quella strada non si percorre mai e il cancello qui non toglie niente a
// nessuno — è il momento giusto per montarlo, non quello sbagliato.
import { ammissibilitaProva } from "./prova-ammissibile.mjs";

const JSON_MODE = process.argv.includes("--json");
const VAULT = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");
// AR-796 — i due registri si possono puntare altrove, con la stessa chiave che usano già
// `salute-onesta.mjs` e `auto-fix.mjs` (`CANTIERE_FILE`). Serve alla prova del cancello su QUESTA
// strada: la lezione del lotto 51 è che un freno si prova facendo girare chi agisce, non la
// funzione che sa giudicare — e chi agisce qui legge da percorsi fissi. Fuori dai test nessuno le
// usa e i percorsi restano quelli di sempre.
const RAD = process.env.RADIOGRAFIA_FILE || join(VAULT, "auto-radiografia.json");
const CANTIERE = process.env.CANTIERE_FILE || join(VAULT, "cantiere-difetti.json");
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
  // AR-743 — IL CONFRONTO LO DECIDE LA CASA, non questo file.
  //
  // Qui c'era una copia a mano di «la prova combacia?». Erano quattro copie della stessa
  // decisione — la casa più tre — e le tre non ereditavano niente di quello che la casa aveva
  // imparato:
  //
  //   · AR-151, il testo letterale: un pattern scritto come testo, con un dollaro in mezzo,
  //     compilato come regex non può mai combaciare (quel simbolo asserisce fine-stringa) mentre
  //     il fix nel codice c'è davvero. La casa prova la regex E il letterale.
  //   · AR-355, il commento: due difetti del worker risultavano chiusi perché la prova citava una
  //     frase che nel file esisteva — dentro un commento scritto da chi aveva fatto il fix. C'era
  //     la descrizione della cura, non la cura. La casa cerca solo dove il computer esegue.
  //
  // Ogni difesa aggiunta là proteggeva la metà dei chiamanti. È la malattia censita «una parola
  // con due padroni», dentro il metro che giudica tutte le altre.
  const risolto = provaSoddisfatta(v, txt);
  const vuolePresente = v.presente !== false;
  return {
    esito: risolto ? "risolto" : "aperto",
    // AR-798 — qui c'era `${trovato ? …}`, e `trovato` non esisteva: AR-743 aveva sostituito il
    // confronto scritto a mano con `provaSoddisfatta` e portato via la variabile, lasciandone il
    // nome dentro la frase. Non era un refuso cosmetico: la riga sta nel `return`, quindi OGNI
    // finding con una prova faceva esplodere `verificaFinding` con un ReferenceError, e l'errore
    // saliva fino ad abortire l'allineamento intero. La strada era morta, non dormiente. Nessuno
    // se n'era accorto perché nessun finding porta un campo `verifica` — cioè la difesa era il
    // fatto che quel ramo non si percorresse mai.
    dettaglio: `${v.file} ${vuolePresente ? "contiene" : "NON contiene"} /${v.pattern}/ → ${risolto ? "combacia" : "non combacia"}`,
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
  // AR-796 — le chiusure che il cancello delle prove ha fermato. Contate a parte e pubblicate: un
  // rifiuto che non esce in nessun numero è un silenzio, e un silenzio somiglia a «non è successo
  // niente». Oggi vale zero perché nessun finding porta una prova, e se domani sale vuol dire che
  // qualcuno ha dato una prova a grep a un bloccante del sito.
  let rifiutatiDalCancello = 0;
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
        // ⛔ AR-796 — il cancello delle prove, PRIMA del timbro. Un finding `bloccante` (la gravità
        // dei findings si chiama `severita`, e il contratto legge tutt'e due i nomi) non si chiude
        // su una parola cercata in un file: sono i difetti del sito che fermano un ordine, e sono
        // esattamente quelli su cui una prova a grep mente meglio.
        const amm = ammissibilitaProva(f, { fileEsiste: (x) => existsSync(join(AD_ROOT, x)) });
        if (r.esito === "risolto" && !amm.ammessa) {
          f.chiusura_rifiutata = amm.motivo;
          rifiutatiDalCancello++;
        } else if (r.esito === "risolto") {
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
    chiusure_rifiutate_dal_cancello: rifiutatiDalCancello,
    data_scan: rad.data || null,
    // AR-105: voto_salute_architettura aggiornato solo dalla radiografia completa, non qui
  };

  writeJson(RAD, rad);
  return {
    ok: true,
    aggiornati,
    chiusi_verifica: chiusiVerifica,
    chiusure_rifiutate_dal_cancello: rifiutatiDalCancello,
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

/**
 * IL CONTO DEL SITO DENTRO `sync_scan` — il blocco che la Cabina legge nella «Salute sito».
 *
 * Qui c'erano due `if` scritti a mano che cercavano `f.stato === "chiuso"` dentro
 * `dimensioni[].findings`. Il 18/8/2026 il referto ha cambiato forma — i problemi sono passati in un
 * elenco unico (`problemi[]`) e gli stati da `chiuso` a `riparato`/`gia_riparato_prima` — e da quel
 * giorno questa funzione cercava in un posto vuoto. Cercare dove non c'è niente non dà errore: dà
 * ZERO. Al primo giro avrebbe scritto `findings_aperti: 0`, e siccome la rotta del Pannello fa
 * `sync_scan.findings_aperti ?? meta.findings` — dove `0` non è nullish e vince su 245 — la Cabina
 * sarebbe passata da «245, rosso» a «0, verde» senza che nessuno avesse riparato niente.
 *
 * Ora la regola sta in `cervello/radiografia-marketplace-conti.mjs`, sa leggere ENTRAMBE le forme, e
 * soprattutto **non risponde zero quando non ha letto**: se il referto dichiara N problemi e la
 * lista non si trova, i conti restano `null` col motivo, e il giro lo dice.
 */
/**
 * IL BLOCCO `sync_scan` DEL SITO, come funzione PURA — così una prova lo può ESEGUIRE.
 *
 * È lo stesso motivo di `cantiereNelSyncScan` qui sopra: finché la decisione viveva incastrata fra
 * la lettura e la scrittura di un file di memoria, una prova poteva solo cercarne la FORMA nel
 * sorgente — e una ricerca di parole non fallisce nel modo in cui fallisce la realtà. Infatti non
 * ha fallito: il conto ha smesso di funzionare il 18/8 e nessun guardiano se n'è accorto.
 */
export function syncScanMarketplace(digest, quando) {
  const c = contoMarketplace(digest);
  return {
    aggiornato: quando,
    // `letto` viaggia col numero: chi lo legge sa se lo zero è un fatto o un buco.
    letto: c.letto,
    motivo: c.motivo,
    forma: c.forma,
    findings_aperti: c.aperti,
    findings_chiusi: c.chiusi,
    findings_tot: c.totale,
    aperti_per_severita: c.aperti_per_severita,
    dichiarati_dal_referto: c.dichiarati,
    divergenza_dal_dichiarato: c.divergenza_dal_dichiarato,
    data_scan: digest?.data || null,
    nota: "Per trovare difetti NUOVI serve un nuovo audit marketplace; i fix sul codice non riaprono da soli la lista. Gli aperti qui sono quelli del referto in archivio, aggiornati dai lotti di riparazione.",
  };
}

function allineaMarketplace() {
  const mkp = readJson(MKP, null);
  if (!mkp) return { ok: false, motivo: "radiografia-marketplace.json assente" };

  const sync = syncScanMarketplace(mkp, nowPiacenza());
  mkp.sync_scan = sync;
  writeJson(MKP, mkp);
  return {
    ok: sync.letto,
    aperti: sync.findings_aperti,
    chiusi: sync.findings_chiusi,
    totale: sync.findings_tot,
    motivo: sync.motivo,
    forma: sync.forma,
  };
}

async function main() {
  const mac = allineaMacchina();
  const mkp = allineaMarketplace();
  // Il sito entra nel verdetto. Prima usciva solo dalla porta di servizio del `--json`: quando il
  // suo conto si è rotto (18/8, cambio di forma del referto) il giro ha continuato a dire «ok» per
  // un mese, perché nessuno gli chiedeva niente. Un contatore che non può far scattare un giallo
  // è un contatore che nessuno guarda.
  const ok = mac.ok && mkp.ok;
  const sintesiMac = mac.ok
    ? `macchina: ${mac.aperti} aperti · ${mac.in_corso} in-corso · ${mac.chiusi} chiusi (${mac.aggiornati} aggiornati) · ${mac.non_instradabili} findings che il volano non sa instradare`
    : `macchina: ${mac.motivo}`;
  const sintesiMkp = mkp.ok
    ? `sito: ${mkp.aperti} aperti su ${mkp.totale} del referto`
    : `sito: ${mkp.motivo}`;
  const sintesi = `${sintesiMac} · ${sintesiMkp}`;

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
