#!/usr/bin/env node
// 🧹 SPAZZATA DEI FRATELLI — «l'hai risolto, o hai curato una copia sola?»
//
// Nasce da una domanda di Nicola (28/7): «assicurati che non solo hai risolto quel problema, ma che
// l'hai migliorato». Un test che passa dimostra UNA cosa: che quel punto adesso funziona. Non dimostra
// che la stessa malattia non sia viva due porte più in là — ed è l'errore che ho ripetuto di più:
//
//   · lotto 1 — corretta la data grezza passata a git in `prove-oneste.mjs`, lasciata in `auto-fix.mjs`.
//     Proprio nel lotto che nasceva per impedire le chiusure false.
//   · lotto 3 — cinque script pubblicavano, uno solo aveva il cancello.
//   · lotto 4 — cinque copie della stessa `writeJson` non atomica.
//   · lotto 10 — il freno costi aveva TRE buchi nello stesso blocco, non uno.
//
// Un difetto non è chiuso quando quel punto guarisce: è chiuso quando la MALATTIA smette di potersi
// ripresentare. Questo guardiano tiene il conto delle istanze di ogni malattia nota e **fallisce se ne
// compare una nuova** in un posto che nessuno ha né curato né dichiarato esente.
//
// Parte VERDE per costruzione: la linea di partenza è il numero misurato oggi. Un cancello che nasce
// rosso su venti file viene disattivato entro la settimana; uno che nasce verde becca il primo che
// sporca. Il numero cala solo quando qualcuno cura davvero — e il calo si vede.
//
// 🟢 Sola lettura: non scrive niente, non tocca il vault, non fa rete.
//
// Uso:
//   node cervello/spazzata-fratelli.mjs            -> rapporto per malattia
//   node cervello/spazzata-fratelli.mjs --json     -> JSON
//   node cervello/spazzata-fratelli.mjs --aggiorna -> ristampa il registro con i conteggi di oggi
//
// Exit (contratto AR-322): 0 = nessun fratello nuovo · 1 = fratello nuovo trovato · 2 = cieco

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..");
const REGISTRO = join(QUI, "malattie.json");
const JSON_MODE = process.argv.includes("--json");
const AGGIORNA = process.argv.includes("--aggiorna");

const SALTA = new Set(["node_modules", ".git", ".next", "dist", "build", "creativi", "coverage"]);

// I test CITANO i pattern che vietano — è il loro mestiere. Contarli come istanze della malattia fa
// crescere il numero proprio quando qualcuno scrive la prova che la impedisce: il contrario di quello
// che serve.
const SALTA_SEMPRE = ["cervello/test/", "cervello/malattie.json", "cervello/spazzata-fratelli.mjs"];

/**
 * Toglie i commenti prima di contare. Un pattern citato in un commento («era `catch(() => {})`») NON è
 * un'istanza della malattia: è la spiegazione di come l'abbiamo curata. Contarlo significa punire chi
 * documenta, e far crescere il numero mentre la malattia cala.
 *
 * Trovato il 28/7 misurando il lotto 11: la malattia risultava salita da 80 a 84 mentre in realtà ne
 * avevo appena tolte due — i «quattro in più» erano i miei commenti e le asserzioni del test. È lo
 * stesso errore che questo cantiere ha già pagato nel lotto 3: scambiare una MENZIONE per una CHIAMATA.
 */
function senzaCommenti(testo, file = "") {
  // Il taglio di fine riga vale SOLO per JS/TS. In shell `//` non è un commento: è l'operatore
  // «altrimenti» di jq — proprio quello di `.oggi.token_per_gate // "assente"`. Applicandolo anche lì
  // il conteggio di `buco-letto-come-zero` è crollato a 0: un metro che conta in MENO è brutto quanto
  // uno che conta in più, e questo avrebbe dichiarato curata una malattia ancora viva.
  const js = /\.(m?js|ts|tsx|jsx)$/.test(file);
  return testo
    .split("\n")
    .map((r) => {
      const t = r.trimStart();
      if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*") || t.startsWith("#")) return "";
      if (!js) return r;
      const i = r.indexOf(" // ");
      return i >= 0 ? r.slice(0, i) : r;
    })
    .join("\n");
}

function filesSotto(dir, estensioni) {
  const out = [];
  let voci;
  try {
    voci = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const v of voci) {
    if (SALTA.has(v.name)) continue;
    const p = join(dir, v.name);
    if (v.isDirectory()) out.push(...filesSotto(p, estensioni));
    else if (estensioni.some((e) => v.name.endsWith(e))) out.push(p);
  }
  return out;
}

/** Le istanze vive di una malattia, file per file. */
function cerca(malattia) {
  const radici = (malattia.dove || ["cervello", "pannello/src"]).map((d) => join(REPO, d));
  const est = malattia.estensioni || [".mjs", ".js", ".ts", ".tsx", ".sh"];
  const re = new RegExp(malattia.pattern, "g");
  const trovati = [];
  for (const radice of radici) {
    if (!existsSync(radice)) continue;
    const elenco = statSync(radice).isDirectory() ? filesSotto(radice, est) : [radice];
    for (const f of elenco) {
      const rel = relative(REPO, f);
      if (SALTA_SEMPRE.some((x) => rel.startsWith(x) || rel === x)) continue;
      if ((malattia.escludi_file || []).some((x) => rel.includes(x))) continue;
      let testo;
      try {
        testo = senzaCommenti(readFileSync(f, "utf8"), rel);
      } catch {
        continue;
      }
      const n = (testo.match(re) || []).length;
      if (n > 0) trovati.push({ file: rel, istanze: n });
    }
  }
  return trovati.sort((a, b) => b.istanze - a.istanze);
}

/**
 * AR-334 — LE ESENZIONI CONTANO DAVVERO.
 *
 * `malattie.json` dice, in `_come_si_usa`: «Se una istanza resta apposta, mettila in `esenti` con il
 * PERCHÉ scritto». Ma il codice usava quelle voci **solo** per l'elenco dei file noti: non le
 * sottraeva mai dal conteggio. Chi seguiva la documentazione restava rosso, e l'unica uscita era
 * alzare il tetto — cioè il gesto che questo guardiano esiste per impedire.
 *
 * Trovato il 28/7 usando lo strumento come dice la sua stessa documentazione, e misurando è venuto
 * fuori di peggio: `buco-letto-come-zero` aveva **2 esenzioni per 1 istanza**, e una delle due
 * scusava `soglia_giornaliera_token // 0`, che in `giro.sh` non esiste più. Un'esenzione slegata
 * dalla realtà non è un permesso: è un residuo che nasconde il prossimo caso vero.
 *
 * Le due regole, tutte e due necessarie:
 *   · un'esenzione vale solo se ha un PERCHÉ scritto (come in porte-check: due parole non bastano);
 *   · un'esenzione vale solo se nel suo file c'è ancora almeno un'istanza — altrimenti è orfana, e
 *     l'orfana FALLISCE, perché toglierla è il lavoro, non ignorarla.
 * E si scala al massimo quante istanze quel file ha davvero: due esenzioni su un'istanza sola non
 * possono portare il conto sotto zero.
 */
export function pesaEsenzioni(esenti = [], trovati = []) {
  const perFile = new Map(trovati.map((t) => [t.file, t.istanze]));
  const valide = [];
  const orfane = [];
  const senzaMotivo = [];
  const usate = new Map();
  for (const e of esenti) {
    const motivo = String(e?.perche || "").trim();
    if (motivo.length <= 10) { senzaMotivo.push(e); continue; }
    const disponibili = perFile.get(e?.file) || 0;
    if (disponibili === 0) { orfane.push(e); continue; }
    const gia = usate.get(e.file) || 0;
    if (gia >= disponibili) { orfane.push({ ...e, _motivo: "più esenzioni che istanze in questo file" }); continue; }
    usate.set(e.file, gia + 1);
    valide.push(e);
  }
  return { valide: valide.length, orfane, senzaMotivo };
}

/**
 * Il verdetto di una malattia. `scoperte` è quello che si confronta col tetto: il totale MENO le
 * esenzioni valide. Un'esenzione orfana o senza motivo non abbassa niente e anzi fa fallire.
 */
export function verdettoMalattia({ totale = 0, baseline = 0, trovati = [], esenti = [], fileNoti = null } = {}) {
  const e = pesaEsenzioni(esenti, trovati);
  const scoperte = Math.max(0, totale - e.valide);
  const noti = Array.isArray(fileNoti) ? new Set([...fileNoti, ...esenti.map((x) => x?.file)]) : null;
  const fileNuovi = noti ? trovati.filter((t) => !noti.has(t.file)) : [];
  return {
    scoperte,
    esenti_valide: e.valide,
    orfane: e.orfane,
    senza_motivo: e.senzaMotivo,
    cresciuta: scoperte > baseline,
    // Il tetto è un CRICCHETTO: scende e basta. Si confronta con le SCOPERTE, non col totale grezzo,
    // altrimenti dichiarare un'esenzione legittima renderebbe il tetto «gonfiato» per sempre.
    tetto_gonfiato: baseline > scoperte,
    file_nuovi: fileNuovi,
    guasta: Boolean(fileNuovi.length) || scoperte > baseline || baseline > scoperte || e.orfane.length > 0 || e.senzaMotivo.length > 0,
  };
}

function main() {
  if (!existsSync(REGISTRO)) {
    console.error(`⚠️  SPAZZATA CIECA: manca ${relative(REPO, REGISTRO)} — non so quali malattie cercare.`);
    process.exit(2);
  }
  let reg;
  try {
    reg = JSON.parse(readFileSync(REGISTRO, "utf8"));
  } catch (e) {
    console.error(`⚠️  SPAZZATA CIECA: ${relative(REPO, REGISTRO)} non è JSON valido (${e.message}).`);
    process.exit(2);
  }

  const malattie = Array.isArray(reg.malattie) ? reg.malattie : [];
  if (malattie.length === 0) {
    console.error("⚠️  SPAZZATA CIECA: registro senza malattie — un guardiano che non cerca niente non è un verde.");
    process.exit(2);
  }

  const rapporto = [];
  let nuoviTot = 0;
  for (const m of malattie) {
    const trovati = cerca(m);
    const totale = trovati.reduce((s, t) => s + t.istanze, 0);
    const baseline = Number(m.baseline ?? totale);
    // Due modi in cui una malattia si allarga, e vanno colti tutti e due:
    //   · un FILE NUOVO si ammala (superficie più larga)
    //   · un file già noto ne accumula altre istanze (totale oltre la linea di partenza)
    // Il secondo non si vede guardando solo i file: giro.sh aveva 36 istanze della stessa malattia, e
    // curarne 2 lasciandolo nell'elenco dei «curati» l'avrebbe fatto sembrare a posto.
    // `file_noti` è facoltativo: su una malattia larga (decine di file) elencarli tutti gonfia il
    // registro senza aggiungere verità. Lì basta il tetto sul totale. Dove la superficie è piccola,
    // dichiararla fa scattare l'allarme anche a parità di conteggio, se la malattia MIGRA.
    // AR-334 — il verdetto sta in una funzione che una prova può ESEGUIRE, e le esenzioni dichiarate
    // vengono davvero sottratte. Prima erano solo decorazione: la via scritta nella documentazione
    // non funzionava, e chi la seguiva restava rosso.
    const v = verdettoMalattia({ totale, baseline, trovati, esenti: m.esenti || [], fileNoti: m.file_noti });
    const fileNuovi = v.file_nuovi;
    const cresciuta = v.cresciuta;
    // Il tetto è un CRICCHETTO: scende e basta. Senza questo controllo il guardiano si zittisce
    // alzando un numero — trovato il 28/7 provando a rompere apposta questo stesso strumento: portare
    // la baseline da 36 a 999 lo lasciava verde. Un tetto più alto del conteggio vero non è prudenza,
    // è margine regalato a sé stessi. Se hai curato qualcosa, il tetto DEVE scendere con te.
    const tettoGonfiato = v.tetto_gonfiato;
    if (v.guasta) nuoviTot += fileNuovi.length || 1;
    rapporto.push({
      id: m.id,
      nome: m.nome,
      totale,
      baseline,
      // L'andamento si misura sulle SCOPERTE: con le esenzioni sottratte, dire «peggiorata» guardando
      // il totale grezzo farebbe litigare il rapporto col verdetto — e chi legge crede al rapporto.
      andamento: v.scoperte - baseline,
      cresciuta,
      tetto_gonfiato: tettoGonfiato,
      file_toccati: trovati.length,
      nuovi: fileNuovi.map((n) => `${n.file} (${n.istanze})`),
      esenti: (m.esenti || []).length,
      esenti_valide: v.esenti_valide,
      scoperte: v.scoperte,
      orfane: v.orfane.map((o) => `${o.file}: ${o._motivo || "nessuna istanza in questo file — toglila"}`),
      senza_motivo: v.senza_motivo.map((o) => o.file),
    });
  }

  const out = { ok: nuoviTot === 0, nuovi_totali: nuoviTot, malattie: rapporto };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
  } else if (AGGIORNA) {
    console.log("Conteggi di oggi (da riportare nel campo `baseline` di cervello/malattie.json):");
    for (const r of rapporto) console.log(`  ${r.id}: ${r.totale}`);
  } else {
    console.log("🧹 SPAZZATA DEI FRATELLI — la stessa malattia, cercata dappertutto\n");
    for (const r of rapporto) {
      const segno = r.andamento === 0 ? "=" : r.andamento > 0 ? `+${r.andamento}` : `${r.andamento}`;
      const freccia = r.andamento < 0 ? "📉 curata" : r.andamento > 0 ? "📈 PEGGIORATA" : "invariata";
      console.log(`  ${r.id} — ${r.nome}`);
      const dettEs = r.esenti_valide ? ` · ${r.esenti_valide} esenti dichiarate → ${r.scoperte} scoperte` : "";
      console.log(`     ${r.totale} istanze in ${r.file_toccati} file (partenza ${r.baseline}, ${segno} ${freccia})${dettEs}`);
      if (r.cresciuta) console.log(`     ❌ CRESCIUTA: ${r.scoperte} istanze scoperte contro le ${r.baseline} di partenza.`);
      for (const o of r.orfane || []) {
        console.log(`     ❌ ESENZIONE ORFANA: ${o}`);
        console.log(`        Un'esenzione slegata dalla realtà non è un permesso: è un residuo che nasconde il prossimo caso vero.`);
      }
      for (const o of r.senza_motivo || []) console.log(`     ❌ ESENZIONE SENZA MOTIVO: ${o} — due parole non sono un perché.`);
      if (r.tetto_gonfiato)
        console.log(`     ❌ TETTO GONFIATO: dichiara ${r.baseline} ma ne restano ${r.scoperte} scoperte. Abbassalo a ${r.scoperte}: il tetto scende, non si alza.`);
      if (r.nuovi.length) {
        console.log(`     ❌ ${r.nuovi.length} FRATELLO/I NUOVO/I, mai curato né dichiarato:`);
        for (const n of r.nuovi.slice(0, 8)) console.log(`        · ${n}`);
      }
      console.log();
    }
    console.log(
      nuoviTot === 0
        ? "✅ nessun fratello nuovo: la malattia non si è allargata."
        : `❌ ${nuoviTot} punti nuovi con la stessa malattia. Curali, o dichiarali esenti con il PERCHÉ in cervello/malattie.json.`
    );
  }

  process.exit(nuoviTot === 0 ? 0 : 1);
}

// Importare questo file NON deve far partire la scansione: la prova di AR-334 importa le funzioni
// pure per eseguirle su ingressi finti, e senza questa guardia si ritrovava il rapporto del repo vero
// stampato in mezzo ai propri casi. Un modulo che agisce al solo essere importato è un effetto
// collaterale nascosto — la stessa famiglia dei difetti che questi lotti curano.
if (import.meta.url === `file://${process.argv[1]}`) main();
