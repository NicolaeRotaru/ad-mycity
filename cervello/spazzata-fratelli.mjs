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
import { spawnSync } from "node:child_process";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
// Le due radici sono sovrascrivibili SOLO per poter provare questo strumento su un albero finto
// (AR-334: la via documentata delle esenzioni non funzionava, e non c'era modo di dimostrarlo senza
// sporcare il repo vero). In esercizio restano i default.
const REPO = process.env.SPAZZATA_REPO || join(QUI, "..");
const REGISTRO = process.env.SPAZZATA_REGISTRO || join(QUI, "malattie.json");
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
// Esportata (30/7) perché `cervello/sorvegliante.mjs` deve applicare la STESSA regola sulle righe di
// un diff: due copie della conoscenza «cos'è un commento» divergerebbero, e la prima divergenza
// sarebbe un guardiano che conta le spiegazioni come malattie mentre l'altro no.
export function senzaCommenti(testo, file = "") {
  // Il taglio di fine riga vale SOLO per JS/TS. In shell `//` non è un commento: è l'operatore
  // «altrimenti» di jq — proprio quello di `.oggi.token_per_gate // "assente"`. Applicandolo anche lì
  // il conteggio di `buco-letto-come-zero` è crollato a 0: un metro che conta in MENO è brutto quanto
  // uno che conta in più, e questo avrebbe dichiarato curata una malattia ancora viva.
  const js = /\.(m?js|ts|tsx|jsx)$/.test(file);
  // In un .md il `#` apre un TITOLO, non un commento (AR-500). Azzerandolo qui, ogni regola di casa
  // che vive nei titoli — «il titolo di un'azione non si scrive in sigle» — non poteva scattare mai:
  // la riga arrivava al pattern già vuota. Trovato dalle prove il 3/8, mentre censivo quella regola;
  // rileggendo la funzione sembrava giusta, perché per il codice lo è.
  const prosa = /\.(md|markdown)$/.test(file);
  return testo
    .split("\n")
    .map((r) => {
      const t = r.trimStart();
      if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*") || (!prosa && t.startsWith("#"))) return "";
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

/**
 * Le due decisioni che il conteggio prende su OGNI file, tirate fuori dall'I/O perché una prova le
 * possa ESEGUIRE (AR-500). Non è pulizia: la prima stesura di queste prove controllava la semantica
 * delle espressioni regolari scritta dentro il test — cioè descriveva il fix invece di eseguirlo, e
 * rompendo il codice restava verde. L'ha trovato `non-vacuita.mjs`, non io.
 */

/** Questo file rientra nel perimetro dichiarato dalla malattia? */
export function nelPerimetro(malattia, rel) {
  if (!Array.isArray(malattia.percorsi) || !malattia.percorsi.length) return true;
  return malattia.percorsi.some((p) => rel.startsWith(p));
}

/** Quante istanze in questo testo. `gm` perché `^` deve valere per RIGA: è la stessa semantica che
 *  usa il sorvegliante, e i due lettori del registro non possono contare due cose diverse. */
export function istanzeNelTesto(malattia, testo, rel = "") {
  const re = new RegExp(malattia.pattern, "gm");
  return (senzaCommenti(testo, rel).match(re) || []).length;
}

/** Le istanze vive di una malattia, file per file. */
function cerca(malattia) {
  const radici = (malattia.dove || ["cervello", "pannello/src"]).map((d) => join(REPO, d));
  const est = malattia.estensioni || [".mjs", ".js", ".ts", ".tsx", ".sh"];
  const trovati = [];
  for (const radice of radici) {
    if (!existsSync(radice)) continue;
    const elenco = statSync(radice).isDirectory() ? filesSotto(radice, est) : [radice];
    for (const f of elenco) {
      const rel = relative(REPO, f);
      if (SALTA_SEMPRE.some((x) => rel.startsWith(x) || rel === x)) continue;
      if ((malattia.escludi_file || []).some((x) => rel.includes(x))) continue;
      if (!nelPerimetro(malattia, rel)) continue;
      let grezzo;
      try {
        grezzo = readFileSync(f, "utf8");
      } catch {
        continue;
      }
      const n = istanzeNelTesto(malattia, grezzo, rel);
      if (n > 0) trovati.push({ file: rel, istanze: n });
    }
  }
  return trovati.sort((a, b) => b.istanze - a.istanze);
}

/** Quanti caratteri deve avere un motivo per essere un motivo. Stessa soglia di `porte-check`. */
export const MOTIVO_MIN = 10;

/**
 * AR-338 — separa le esenzioni che valgono da quelle che non valgono, e dice perché.
 *
 * Due condizioni, tutte e due necessarie:
 *   · un PERCHÉ scritto per esteso — «boh» è un'esenzione senza motivo con un'etichetta sopra;
 *   · un posto dove valere: il file deve avere ancora almeno un'istanza, e ogni esenzione ne copre
 *     UNA. La quarta esenzione su un file con tre istanze non copre niente: è un residuo.
 *
 * Torna anche il motivo dello scarto, perché un guardiano che dice solo «no» costringe a indovinare.
 */
export function pesaEsenzioni(esenti = [], perFile = new Map()) {
  const valide = [];
  const orfane = [];
  const usate = new Map();
  for (const e of esenti) {
    const motivo = String(e?.perche || "").trim();
    if (!e?.file) { orfane.push({ ...e, _scarto: "senza file" }); continue; }
    if (motivo.length <= MOTIVO_MIN) { orfane.push({ ...e, _scarto: "il motivo è troppo corto per essere un motivo" }); continue; }
    const istanze = perFile.get(e.file) || 0;
    if (istanze === 0) { orfane.push({ ...e, _scarto: "nessuna istanza in questo file: l'hai curata, toglila" }); continue; }
    const gia = usate.get(e.file) || 0;
    if (gia >= istanze) { orfane.push({ ...e, _scarto: `più esenzioni (${gia + 1}) che istanze (${istanze}) in questo file` }); continue; }
    usate.set(e.file, gia + 1);
    valide.push(e);
  }
  return { valide, orfane };
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-375 — UN CALO NON È UNA GUARIGIONE FINCHÉ QUALCUNO NON LO DIMOSTRA
//
// La storia, ed è la ragione per cui queste righe esistono. La malattia «l'esito di un guardiano
// finisce in una pipe» risultava a ZERO istanze da fine luglio. Non perché fosse stata curata: il
// consumatore era stato RINOMINATO, il pattern cercava il nome vecchio, e da quel giorno non trovava
// più niente. Chi ha visto il numero scendere l'ha letto come conferma del proprio lavoro. Nel
// frattempo il registro stesso ammetteva, in un altro campo, che trentacinque istanze erano ancora lì.
//
// I cinque perché finiscono su questo: il metro descrive la SINTASSI di ieri invece del COMPORTAMENTO
// da vietare, e **un calo non viene mai controprovato**. Tre domande, e nessuna era mai stata fatta:
//   ① il registro si contraddice? (dice «N istanze restano» mentre il conteggio è zero)
//   ② il calo è spiegato col METRO invece che con una cura? («il pattern non le prende più»)
//   ③ chi dichiara una controprova, la mantiene? (il pattern trova ancora il suo esempio noto)
//
// La via d'uscita legittima c'è ed è dichiarata: se un conteggio è zero perché il pattern non arriva
// lì, si NOMINA ciò che regge il contratto al suo posto — un test, un guardiano, una controprova. È
// la differenza fra un limite dichiarato e una guarigione inventata.
// ─────────────────────────────────────────────────────────────────────────────

/** Le parole con cui un registro spiega un calo col METRO invece che con una cura. */
export const SPIEGA_COL_METRO = /rinominat|cambiato nome|si chiama ora|non usa (?:più|piu)|il pattern non|non le prende|il consumatore/i;

/** Ciò che può reggere il contratto al posto del conteggio: un test, un guardiano, una controprova. */
export const REGGE_AL_POSTO = /cervello\/test\/[\w./-]+|node cervello\/[\w./-]+\.mjs|controprova/i;

/** Quante istanze il registro stesso dichiara ancora vive, a parole («35 istanze restano»). */
export function istanzeDichiarate(nota = "") {
  const m = /(\d+)\s+istanz\w*\s+(?:restano|rimangono|sono rimaste|vive)/i.exec(String(nota || ""));
  return m ? Number(m[1]) : null;
}

/**
 * Il calo va controprovato? Torna il motivo, oppure `null` se il numero si può credere.
 * Pura: entrano la voce del registro e il conteggio di oggi, esce un giudizio.
 */
export function caloNonProvato(malattia = {}, totale = 0) {
  const nb = String(malattia.nota_baseline || "");
  const no = String(malattia.nota_onesta || "");

  // ③ Una controprova dichiarata è una promessa: il pattern DEVE trovarla. Se non la trova, il metro
  //    non guarda più dove aveva detto — ed è il caso peggiore, perché il registro sembra in regola.
  if (malattia.controprova) {
    if (istanzeNelTesto(malattia, String(malattia.controprova), "controprova.txt") === 0) {
      return {
        tipo: "controprova-che-non-scatta",
        motivo: `la controprova dichiarata non fa scattare il pattern: il metro non guarda più dove aveva promesso`,
      };
    }
    return null; // promessa mantenuta: il numero si può credere
  }

  // ① Il registro si contraddice da solo: a parole dice che ne restano, a numero dice ZERO.
  //    Solo lo zero, non un calo qualsiasi: un conteggio che scende da 22 a 8 è gente che ha curato,
  //    e la nota è la fotografia del giorno in cui è stata scritta. Sparire del tutto è un'altra cosa.
  const restano = istanzeDichiarate(no) ?? istanzeDichiarate(nb);
  if (totale === 0 && restano !== null && restano > 0) {
    return {
      tipo: "registro-si-contraddice",
      motivo: `il registro dichiara ${restano} istanze ancora vive e il conteggio ne trova ${totale}: uno dei due è falso, e finché non si sa quale il numero non vale`,
    };
  }

  // ② Un conteggio a zero spiegato col metro, senza nominare niente che regga il contratto al posto suo.
  if (totale === 0 && SPIEGA_COL_METRO.test(nb) && !REGGE_AL_POSTO.test(nb)) {
    return {
      tipo: "calo-spiegato-col-metro",
      motivo: "la nota spiega lo zero con un rinominamento o con un pattern che non arriva più lì, non con una cura: è un metro che ha smesso di guardare, non una malattia guarita",
    };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-723 — UNA PROMESSA NON SI RITIRA IN SILENZIO.
//
// `caloNonProvato` controlla la controprova solo se la voce ne dichiara una. Cambiarne il testo fa
// scattare il rosso — è provato. TOGLIERE il campo, invece, lascia tutto verde: il codice cade nel
// ramo successivo e nessuno nota che una promessa è stata ritirata. Cioè la difesa più forte del
// registro è quella che si disinstalla nel modo più facile. Stessa cosa, in peggio, se sparisce la
// voce intera: sparisce la malattia e sparisce chi la cercava.
//
// La cura è quella che il sorvegliante usa già per le difese rimosse: confrontare la voce di oggi
// con quella dell'ultimo commit. L'unica via d'uscita legittima è dichiarata e costa: la partenza
// (`baseline`) deve SALIRE. Chi ritira la controprova sta dicendo «questo numero non lo so più
// controprovare» — e allora non può contemporaneamente vantare un conteggio più basso di prima.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Le promesse ritirate fra il registro di ieri e quello di oggi. Pura: entrano due elenchi di
 * malattie, esce l'elenco di ciò che è stato disarmato senza dirlo.
 */
export function promesseRitirate(prima = [], oggi = []) {
  const perId = new Map((Array.isArray(oggi) ? oggi : []).map((m) => [String(m?.id ?? ""), m]));
  const fuori = [];
  for (const p of Array.isArray(prima) ? prima : []) {
    const id = String(p?.id ?? "");
    if (!id) continue;
    const o = perId.get(id);
    if (!o) {
      fuori.push({
        id,
        tipo: "malattia-sparita",
        motivo: `la voce «${id}» c'era nell'ultimo commit e adesso non c'è più: sparita la voce, sparisce anche chi cercava quella forma di difetto`,
      });
      continue;
    }
    if (!String(p.controprova ?? "").trim()) continue; // non aveva promesso niente
    if (String(o.controprova ?? "").trim()) continue; // la promessa c'è ancora
    const ieri = Number(p.baseline);
    const adesso = Number(o.baseline);
    if (Number.isFinite(ieri) && Number.isFinite(adesso) && adesso > ieri) continue; // ritiro dichiarato: non vanta una cura
    fuori.push({
      id,
      tipo: "controprova-ritirata",
      motivo: `la controprova di «${id}» è sparita dal registro e la partenza non è salita (${Number.isFinite(ieri) ? ieri : "?"} → ${Number.isFinite(adesso) ? adesso : "?"}): il conteggio resta, la prova che il metro guardi ancora dove aveva promesso no`,
    });
  }
  return fuori;
}

/**
 * Il registro com'era all'ultimo commit. Torna `{malattie, motivo}`: se non l'ho potuto leggere lo
 * DICO — un confronto che non si è potuto fare non è «nessuna promessa ritirata».
 */
function registroDellUltimoCommit() {
  const via = process.env.SPAZZATA_PRIMA;
  if (via) {
    try {
      return { malattie: JSON.parse(readFileSync(via, "utf8")).malattie || [], motivo: null };
    } catch (e) {
      return { malattie: null, motivo: `non ho potuto leggere il registro di confronto ${via} (${e.message})` };
    }
  }
  if (REGISTRO !== join(QUI, "malattie.json")) {
    return { malattie: null, motivo: "il registro è puntato altrove (SPAZZATA_REGISTRO): non posso confrontarlo con l'ultimo commit" };
  }
  const r = spawnSync("git", ["show", `HEAD:${relative(join(QUI, ".."), REGISTRO)}`], { cwd: join(QUI, ".."), encoding: "utf8" });
  if (r.status !== 0) {
    return { malattie: null, motivo: `git non mi ha dato il registro dell'ultimo commit (${(r.stderr || "").split("\n")[0] || "uscita " + r.status}): non so se una promessa è stata ritirata` };
  }
  try {
    return { malattie: JSON.parse(r.stdout).malattie || [], motivo: null };
  } catch (e) {
    return { malattie: null, motivo: `il registro dell'ultimo commit non è JSON leggibile (${e.message}): non so se una promessa è stata ritirata` };
  }
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

    // AR-334 — LE ESENZIONI DEVONO CONTARE DAVVERO. Il registro promette («_come_si_usa») che
    // un'istanza lasciata apposta si dichiara in `esenti` col perché scritto. Ma le voci di `esenti`
    // finivano solo dentro `file_noti`, cioè servivano a non segnalare un FILE nuovo: dal conteggio
    // non venivano MAI sottratte. Chi seguiva la documentazione alla lettera — dichiarare l'istanza
    // legittima e ri-lanciare — restava rosso, e l'unica via d'uscita che funzionava era alzare il
    // tetto: esattamente il gesto che il cricchetto esiste per impedire. Trovato il 28/7 usando lo
    // strumento come dice la sua stessa documentazione.
    //
    // Ora: ogni esenzione vale UNA istanza, e si sottrae dal totale confrontato col tetto. Ma solo
    // se corrisponde a un'istanza REALE: un'esenzione che non trova più niente è un residuo, e un
    // residuo nasconde il prossimo caso vero — quindi viene segnalato invece che ignorato.
    //
    // AR-338 — due buchi in questa stessa regola, trovati provandola su un albero finto poche ore
    // dopo averla scritta:
    //   · `perche: "boh"` passava. Il registro dice «un'esenzione senza motivo è un silenzio» e
    //     `porte-check` pretende già più di dieci caratteri per la stessa ragione: qui la regola
    //     c'era e il metro no.
    //   · tre esenzioni su un file con UNA sola istanza sottraevano tre. `Math.max(0, …)` teneva il
    //     conto a zero e nascondeva il resto: bastava impilare esenzioni per zittire un file intero.
    // Adesso un'esenzione vale una istanza VERA di quel file, e le eccedenti diventano orfane.
    const esenti = Array.isArray(m.esenti) ? m.esenti : [];
    const perFile = new Map(trovati.map((t) => [t.file, t.istanze]));
    const { valide: esentiValide, orfane: esentiOrfane } = pesaEsenzioni(esenti, perFile);
    const totaleNetto = Math.max(0, totale - esentiValide.length);
    const cresciuta = totaleNetto > baseline;
    // Il tetto è un CRICCHETTO: scende e basta. Senza questo controllo il guardiano si zittisce
    // alzando un numero — trovato il 28/7 provando a rompere apposta questo stesso strumento: portare
    // la baseline da 36 a 999 lo lasciava verde. Un tetto più alto del conteggio vero non è prudenza,
    // è margine regalato a sé stessi. Se hai curato qualcosa, il tetto DEVE scendere con te.
    const tettoGonfiato = baseline > totaleNetto;
    // AR-375 — e prima di credere al numero, si controlla che il numero sia credibile.
    const calo = caloNonProvato(m, totaleNetto);
    if (fileNuovi.length || cresciuta || tettoGonfiato || esentiOrfane.length || calo) {
      nuoviTot += fileNuovi.length || esentiOrfane.length || 1;
    }
    rapporto.push({
      calo_non_provato: calo,
      id: m.id,
      nome: m.nome,
      totale: totaleNetto,          // AR-334: al netto delle esenzioni dichiarate e verificate
      totale_lordo: totale,
      baseline,
      andamento: totaleNetto - baseline,
      cresciuta,
      tetto_gonfiato: tettoGonfiato,
      file_toccati: trovati.length,
      nuovi: fileNuovi.map((n) => `${n.file} (${n.istanze})`),
      esenti: esentiValide.length,
      esenti_orfane: esentiOrfane.map((e) => `${e.file || "?"}: ${e.quale || "senza «quale»"} — ${e._scarto || "non corrisponde a niente"}`),
    });
  }

  // AR-723 — chi ha promesso una controprova non può ritirarla in silenzio.
  const prima = registroDellUltimoCommit();
  const ritirate = prima.malattie ? promesseRitirate(prima.malattie, malattie) : [];
  nuoviTot += ritirate.length;

  const out = {
    ok: nuoviTot === 0,
    nuovi_totali: nuoviTot,
    promesse_ritirate: ritirate,
    non_ho_guardato: prima.motivo ? [prima.motivo] : [],
    malattie: rapporto,
  };

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
      const netto = r.esenti ? ` [${r.totale_lordo} trovate − ${r.esenti} esenti dichiarate]` : "";
      console.log(`     ${r.totale} istanze in ${r.file_toccati} file (partenza ${r.baseline}, ${segno} ${freccia})${netto}`);
      if (r.esenti_orfane.length) {
        console.log(`     ❌ ${r.esenti_orfane.length} ESENZIONE/I che non corrisponde più a niente (residuo che nasconde il prossimo caso vero):`);
        for (const e of r.esenti_orfane) console.log(`        · ${e}`);
      }
      if (r.calo_non_provato) {
        console.log(`     ❌ CALO NON PROVATO (${r.calo_non_provato.tipo}): ${r.calo_non_provato.motivo}`);
        console.log(`        → riscrivi il pattern sul COMPORTAMENTO da vietare e rimetti la partenza sul numero vero,`);
        console.log(`          oppure dichiara nel registro la «controprova»: un testo che il pattern DEVE trovare.`);
      }
      if (r.cresciuta) console.log(`     ❌ CRESCIUTA: ${r.totale} istanze contro le ${r.baseline} di partenza.`);
      if (r.tetto_gonfiato)
        console.log(`     ❌ TETTO GONFIATO: dichiara ${r.baseline} ma ne restano ${r.totale}. Abbassalo a ${r.totale}: il tetto scende, non si alza.`);
      if (r.nuovi.length) {
        console.log(`     ❌ ${r.nuovi.length} FRATELLO/I NUOVO/I, mai curato né dichiarato:`);
        for (const n of r.nuovi.slice(0, 8)) console.log(`        · ${n}`);
      }
      console.log();
    }
    if (ritirate.length) {
      console.log(`  ❌ ${ritirate.length} PROMESSA/E RITIRATA/E IN SILENZIO dall'ultimo commit (AR-723):`);
      for (const r of ritirate) console.log(`     · ${r.motivo}`);
      console.log(`     → rimetti il campo, oppure alza la partenza di quella malattia: chi non sa più controprovare un numero non può vantarlo.\n`);
    }
    if (prima.motivo) console.log(`  ⚪ non ho guardato: ${prima.motivo}\n`);
    console.log(
      nuoviTot === 0
        ? "✅ nessun fratello nuovo: la malattia non si è allargata."
        : `❌ ${nuoviTot} punti nuovi con la stessa malattia. Curali, o dichiarali esenti con il PERCHÉ in cervello/malattie.json.`
    );
  }

  // Cieco non è verde: se non ho potuto confrontare col commit di ieri, esco 2 invece di 0.
  process.exit(nuoviTot !== 0 ? 1 : prima.motivo ? 2 : 0);
}

// Importare questo file NON deve far partire la scansione: la prova di AR-338 importa `pesaEsenzioni`
// per eseguirla su ingressi finti, e senza questa guardia si ritrovava il rapporto del repo vero
// stampato in mezzo ai propri casi. Un modulo che agisce al solo essere importato e un effetto
// collaterale nascosto — la stessa famiglia dei difetti che questi lotti curano.
if (import.meta.url === `file://${process.argv[1]}`) main();
