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
    const noti = Array.isArray(m.file_noti) ? new Set([...m.file_noti, ...(m.esenti || []).map((e) => e.file)]) : null;
    const fileNuovi = noti ? trovati.filter((t) => !noti.has(t.file)) : [];
    const cresciuta = totale > baseline;
    // Il tetto è un CRICCHETTO: scende e basta. Senza questo controllo il guardiano si zittisce
    // alzando un numero — trovato il 28/7 provando a rompere apposta questo stesso strumento: portare
    // la baseline da 36 a 999 lo lasciava verde. Un tetto più alto del conteggio vero non è prudenza,
    // è margine regalato a sé stessi. Se hai curato qualcosa, il tetto DEVE scendere con te.
    const tettoGonfiato = baseline > totale;
    if (fileNuovi.length || cresciuta || tettoGonfiato) nuoviTot += fileNuovi.length || 1;
    rapporto.push({
      id: m.id,
      nome: m.nome,
      totale,
      baseline,
      andamento: totale - baseline,
      cresciuta,
      tetto_gonfiato: tettoGonfiato,
      file_toccati: trovati.length,
      nuovi: fileNuovi.map((n) => `${n.file} (${n.istanze})`),
      esenti: (m.esenti || []).length,
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
      console.log(`     ${r.totale} istanze in ${r.file_toccati} file (partenza ${r.baseline}, ${segno} ${freccia})`);
      if (r.cresciuta) console.log(`     ❌ CRESCIUTA: ${r.totale} istanze contro le ${r.baseline} di partenza.`);
      if (r.tetto_gonfiato)
        console.log(`     ❌ TETTO GONFIATO: dichiara ${r.baseline} ma ne restano ${r.totale}. Abbassalo a ${r.totale}: il tetto scende, non si alza.`);
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

main();
