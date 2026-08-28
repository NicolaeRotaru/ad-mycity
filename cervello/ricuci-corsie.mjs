#!/usr/bin/env node
// Ricuce i frammenti delle corsie parallele nei registri condivisi del cantiere.
//
// PERCHÉ ESISTE: quattro corsie che scrivono insieme in cantiere-difetti.json, mutanti.json,
// malattie.json e tetti-lotto.json è AR-331 moltiplicato per quattro. Le corsie consegnano un
// frammento JSON a testa; questo comando li applica, uno alla volta, dall'AD.
//
// COSA APPLICA e COSA NO (regola ⑧ del mansionario del cantiere):
//  · `verifica` → sempre {tipo:"comando", comando} — mai {file,pattern,presente}
//  · `nota_fix` → sempre
//  · `stato`    → MAI. Le chiusure le applica auto-fix.mjs DOPO il merge.
//  · un difetto dichiarato APERTO si vede TOGLIERE una `verifica` a pattern, altrimenti
//    auto-fix lo richiude da solo dopo il merge smentendo chi ha lavorato (AR-444).
//
// Uso:  node cervello/ricuci-corsie.mjs <cartella-frammenti> --lotto 43 [--scrivi]
// Senza --scrivi stampa soltanto cosa farebbe (prova a vuoto).

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// AR-530: l'indentazione di un file di memoria non la sceglie chi scrive, la CONSERVA lo scrittore
// di casa. Riscrivendo `mutanti.json` e `malattie.json` con due spazi dove il disco ne aveva uno,
// il diff diventa il file intero e la pubblicazione si blocca — successo qui, in questo lotto,
// mentre si curava il difetto gemello.
import { scriviJsonAtomico } from "./scrivi-json.mjs";
// AR-877: il parser che decide se una riga di prova si puo' eseguire. Qui serve PRIMA di scrivere,
// non dopo: e' il cancello all'ingresso del registro.
import { comeSiEsegue } from "./esecuzione-prova.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const CANTIERE = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");
const MUTANTI = join(REPO, "cervello/mutanti.json");
const MALATTIE = join(REPO, "cervello/malattie.json");

const leggi = (p) => JSON.parse(readFileSync(p, "utf8"));
const scrivi = (p, v) => scriviJsonAtomico(p, v);

/**
 * Decide cosa fare della `verifica` di una scheda, dato l'esito dichiarato dalla corsia.
 * Funzione PURA: è la decisione che questo comando prende, ed è qui perché un test la possa
 * eseguire senza toccare i registri veri.
 *
 * @returns {{azione:"scrivi"|"togli"|"lascia", verifica?:object, perche:string}}
 */
export function decidiVerifica(esito, verificaComando, verificaAttuale) {
  const eraPattern =
    verificaAttuale != null &&
    typeof verificaAttuale === "object" &&
    verificaAttuale.tipo !== "comando" &&
    verificaAttuale.tipo !== "umano" &&
    ("pattern" in verificaAttuale || "file" in verificaAttuale);

  if (esito === "chiuso") {
    if (!verificaComando) {
      return { azione: "lascia", perche: "chiuso senza comando di prova: non lo tocco, lo dichiaro" };
    }
    return {
      azione: "scrivi",
      verifica: { tipo: "comando", comando: verificaComando },
      perche: "chiuso con prova comportamentale",
    };
  }

  if (esito === "gia-curato" && verificaComando) {
    return {
      azione: "scrivi",
      verifica: { tipo: "comando", comando: verificaComando },
      perche: "già curato: la prova comportamentale che lo dimostra",
    };
  }

  // APERTO. Qui è dove il lotto 43 ha sbagliato, e il conto lo ha detto: «Chiusi 61» quando ne
  // avevo dichiarati 49. Due difetti che avevo scritto APERTI — AR-693 e AR-684 — si sono chiusi
  // da soli dopo il merge, e la mia prima versione di questa funzione li aveva lasciati passare
  // perché guardava solo le prove a PATTERN.
  //
  // La radice: non è il TIPO di prova a richiudere un difetto, è il fatto che la prova PASSI.
  // Una prova a comando che oggi esce 0 chiude la scheda esattamente come un pattern che si
  // trova — e su un difetto dichiarato aperto è peggio, perché sembra più seria. Togliere la
  // prova non basta e non è nemmeno giusto: la prova serve, è il difetto a non essere chiuso.
  //
  // La casa ha già il freno giusto e non lo stavo usando: `chiusura: "bloccata"`, che auto-fix
  // rispetta («NON chiusi perché dichiarati aperti da un umano... si sbloccano solo con un'altra
  // decisione umana»). Quindi: la prova resta, e accanto ci va il blocco col perché.
  const blocco = {
    azione: "blocca",
    verifica: verificaComando ? { tipo: "comando", comando: verificaComando } : undefined,
    perche: "dichiarato APERTO: la prova resta, ma la chiusura si blocca (una prova che passa richiude da sola — AR-444)",
  };
  if (eraPattern) {
    // Una prova a pattern in più non si merita di sopravvivere: non frena, non legge, non decide.
    return { ...blocco, verifica: undefined, togliVerifica: true };
  }
  return blocco;
}

/**
 * Estrae la voce di malattia vera da una proposta di corsia. Funzione PURA.
 *
 * Le corsie consegnano in due forme, ed è giusto così: chi ha provato la voce su una copia del
 * registro ci mette accanto COME l'ha provata (`descrizione`), e quella nota non deve finire dentro
 * `malattie.json` — dove finirebbe a sporcare il registro di prosa che non serve alla spazzata.
 * Chi non ha nulla da raccontare consegna la voce piatta.
 */
export function voceDiMalattia(proposta) {
  if (proposta && typeof proposta === "object" && proposta.voce && typeof proposta.voce === "object") {
    return proposta.voce;
  }
  const { descrizione, nota_onesta, ...voce } = proposta || {};
  return voce;
}

/** I campi senza cui la spazzata non può cercare i fratelli di una malattia. */
const CAMPI_MALATTIA = ["id", "nome", "pattern", "dove", "estensioni", "baseline"];

/**
 * Controlla che una voce di malattia rispetti il contratto di `cervello/malattie.json`, e traduce
 * il nome che le corsie usano a voce (`partenza`) in quello che il registro usa davvero
 * (`baseline`). Funzione PURA.
 *
 * PERCHÉ ESISTE: le tre corsie hanno consegnato la stessa cosa in tre forme diverse, e due non
 * avevano né `id` né `dove`. Scrivere una voce così nel registro non dà errore: dà una malattia che
 * la spazzata non sa cercare — cioè un censimento che sembra fatto e non guarda niente. È
 * esattamente il «cieco venduto per verde» che questo lotto cura altrove, e non ha senso curarlo
 * ovunque tranne che nello strumento che ricuce.
 *
 * @returns {{ok:true, voce:object} | {ok:false, mancanti:string[], voce:object}}
 */
export function normalizzaMalattia(grezza) {
  const voce = { ...grezza };
  if (voce.baseline === undefined && voce.partenza !== undefined) voce.baseline = voce.partenza;
  delete voce.partenza;
  const mancanti = CAMPI_MALATTIA.filter((c) => voce[c] === undefined);
  return mancanti.length ? { ok: false, mancanti, voce } : { ok: true, voce };
}

/**
 * Da un comando di prova ricava il FILE della prova. Funzione PURA.
 *
 * PERCHÉ ESISTE: la prima versione faceva `comando.replace(/^node\s+/, "").split(/\s/)[0]`, e su
 * `node --test cervello/test/x.test.mjs` tornava `--test`. Otto mutazioni di questo lotto sono
 * finite nel registro puntando a un file chiamato `--test`, che non esiste: una mutazione così non
 * è una difesa debole, è una difesa che non può girare — e il banco la dichiara cieca invece di
 * rossa. È la malattia del lotto («il cieco venduto per verde») entrata dallo strumento che ricuce.
 * La cura: si prende il primo pezzo che non è `node` e non è un'opzione.
 */
export function testDaComando(comando) {
  if (!comando) return undefined;
  const pezzi = String(comando).trim().split(/\s+/);
  // Il primo pezzo che e' un FILE — cioe' che ha una barra dentro. Cercare «il primo che non e'
  // un'opzione» su `npx bats cervello/test/x.bats` tornava «bats», e su `npx tsx --test x.mts`
  // tornava «tsx»: un campo `test` che nomina il PROGRAMMA invece della prova. Il banco poi lancia
  // `node bats`, che non esiste, esce ≠ 0 — e ≠ 0 e' il segnale con cui riconosce «diventata rossa».
  const file = pezzi.find((p) => p !== "node" && !p.startsWith("-") && p.includes("/"));
  if (file) return file;
  return pezzi.find((p) => p !== "node" && !p.startsWith("-"));
}

/** I caratteri che un percorso di questa casa usa davvero. Lista BIANCA: misurata sul registro il
 *  28/8, tutte e 939 le voci vive ci stanno dentro, campo `file` e campo `test`. */
const PERCORSO_DI_CASA = /^[A-Za-z0-9._/-]+$/;

/**
 * 🔒 IL CANCELLO ALL'INGRESSO DEL REGISTRO DELLE MUTAZIONI — AR-877. Funzione PURA.
 *
 * PERCHE' ESISTE. Curando AR-840 la macchina ha imparato a ESEGUIRE una stringa presa da
 * `cervello/mutanti.json`. Quella stringa non la scrive una persona: la compone questo file, a
 * partire da un frammento consegnato da una CORSIA — cioe' da un modello. Curando AR-867 e' nato il
 * parser che decide se una riga si puo' eseguire, ma sta a VALLE: al momento di lanciare. Quindi una
 * riga ostile entrava nel registro senza che nessuno la guardasse, e da li' in poi viveva come dato —
 * riletta da ogni strumento, in un file di 939 voci che nessuno rilegge riga per riga.
 *
 * Il cancello a monte fa la stessa cosa che questo file gia' fa con le malattie a contratto
 * incompleto poco piu' sotto: se la voce non regge, NON si scrive e si dice perche'.
 *
 * ⚠️ LA SCHEDA DICEVA `comeSiEsegue(t, {soloDentroIlRepo:true})`. Sul codice vero quell'opzione NON
 * VIENE LETTA DA NESSUNO (ne' in `comeSiEsegue` ne' in `spezzaComando`): il severo lo fa
 * `radiciAmmesse`, che di suo e' vuoto. Scriverla avrebbe dato un ancoraggio finto — la forma giusta
 * sopra un controllo che non cambia niente. Qui si chiama SENZA opzioni, che e' il modo davvero
 * stretto, e l'opzione morta e' segnalata come difetto nuovo.
 *
 * Tre cose si guardano, e sono tre perche' tre sono i campi che poi qualcuno usa per agire:
 *   · `file`     — `non-vacuita` lo APRE e ci SCRIVE dentro (writeFileSync). Un `../..` qui e' una
 *                  scrittura fuori dal repo, ed e' il campo piu' pericoloso dei tre.
 *   · `cerca`    — senza, `muta()` non ha niente da cercare e la mutazione nasce cieca.
 *   · `test`     — e' cio' che viene ESEGUITO. Deve passare dal parser, in modalita' stretta, e
 *                  deve nominare un file del repo: «npx» e «bats» passerebbero come percorsi.
 *
 * @returns {{ok:true, test:string} | {ok:false, perche:string}}
 */
export function vagliaMutante(mutante, verificaComando) {
  const m = mutante || {};

  const file = typeof m.file === "string" ? m.file.trim() : "";
  if (!file) return { ok: false, perche: "«file» assente: non si sa cosa rompere" };
  if (file.startsWith("/") || file.includes("..") || !PERCORSO_DI_CASA.test(file)) {
    return { ok: false, perche: `«file» non e' un percorso di casa: «${file}» (il banco lo apre e ci scrive dentro)` };
  }

  if (typeof m.cerca !== "string" || m.cerca === "") {
    return { ok: false, perche: "«cerca» assente o vuoto: una mutazione che non trova niente da rompere nasce cieca" };
  }
  if (m.sostituisci !== undefined && typeof m.sostituisci !== "string") {
    return { ok: false, perche: "«sostituisci» dev'essere testo (anche vuoto, per cancellare una riga)" };
  }

  const comando = typeof verificaComando === "string" ? verificaComando.trim() : "";
  if (!comando) return { ok: false, perche: "nessun comando di prova: la mutazione non avrebbe niente da rendere rosso" };
  const riga = comeSiEsegue(comando);
  if (!riga.ok) return { ok: false, perche: `il comando di verifica non e' eseguibile: ${riga.perche}` };

  const test = testDaComando(comando);
  if (!test) return { ok: false, perche: `il comando di verifica non nomina nessun file: «${comando}»` };
  const piano = comeSiEsegue(test);
  if (!piano.ok) return { ok: false, perche: `il campo «test» non e' eseguibile: ${piano.perche}` };
  if (!piano.percorsi.length || !piano.percorsi.every((p) => p.includes("/"))) {
    return { ok: false, perche: `«${test}» non nomina un file del repo: sarebbe una prova che nessuno puo' lanciare` };
  }
  return { ok: true, test };
}

function main() {
  const args = process.argv.slice(2);
  const cartella = args.find((a) => !a.startsWith("--"));
  const lotto = Number(args[args.indexOf("--lotto") + 1] || 0);
  const scriviDavvero = args.includes("--scrivi");
  if (!cartella || !lotto) {
    console.error("uso: node cervello/ricuci-corsie.mjs <cartella-frammenti> --lotto <n> [--scrivi]");
    process.exit(2);
  }

  const frammenti = readdirSync(cartella)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({ nome: f, dati: leggi(join(cartella, f)) }));

  const cantiere = leggi(CANTIERE);
  const mutanti = leggi(MUTANTI);
  const malattie = leggi(MALATTIE);

  const log = [];
  let nChiusi = 0, nAperti = 0, nMut = 0, nMal = 0, nMalScartate = 0, nIgnoti = 0, nMutScartate = 0;

  for (const { nome, dati } of frammenti) {
    for (const d of dati.difetti || []) {
      const scheda = cantiere.difetti.find((x) => x.id === d.id);
      if (!scheda) { log.push(`⚠️  ${d.id} — scheda non trovata (${nome})`); nIgnoti++; continue; }

      const scelta = decidiVerifica(d.esito, d.verifica_comando, scheda.verifica);
      if (scelta.azione === "scrivi") scheda.verifica = scelta.verifica;
      else if (scelta.azione === "togli") delete scheda.verifica;
      else if (scelta.azione === "blocca") {
        if (scelta.togliVerifica) delete scheda.verifica;
        else if (scelta.verifica) scheda.verifica = scelta.verifica;
        scheda.chiusura = "bloccata";
        scheda.chiusura_motivo =
          d.perche_aperto ||
          "dichiarato aperto da chi ha lavorato il difetto: la prova passa, il difetto no";
      }
      // Un difetto che TORNA chiuso non deve portarsi dietro il blocco del giro prima.
      if (d.esito === "chiuso" && scheda.chiusura === "bloccata") {
        delete scheda.chiusura;
        delete scheda.chiusura_motivo;
      }

      if (d.nota_fix) scheda.nota_fix = d.nota_fix;
      if (d.esito === "aperto" && d.perche_aperto) {
        scheda.nota_fix = `${scheda.nota_fix || ""}\nRESTA APERTO: ${d.perche_aperto}`.trim();
      }
      // Lo `stato` NON si tocca: lo applica auto-fix dopo il merge.
      if (d.esito === "chiuso") nChiusi++; else nAperti++;
      log.push(`   ${d.id} [${d.esito}] verifica:${scelta.azione} — ${scelta.perche}`);

      if (d.mutante && d.esito === "chiuso") {
        // 🔒 AR-877 — IL CANCELLO STA QUI, PRIMA DELLA SCRITTURA. Il controllo che c'era stava a
        // valle, al momento di eseguire: cioe' la riga entrava comunque nel registro e ci restava.
        const vaglio = vagliaMutante(d.mutante, d.verifica_comando);
        if (!vaglio.ok) {
          nMutScartate++;
          log.push(`   ⚠️  mutazione di ${d.id} NON scritta — ${vaglio.perche}`);
        } else {
          mutanti.mutanti.push({
            lotto,
            difetto: d.id,
            nome: d.mutante.nome || `${d.id} — il cuore del fix`,
            file: d.mutante.file,
            cerca: d.mutante.cerca,
            sostituisci: d.mutante.sostituisci,
            test: vaglio.test,
          });
          nMut++;
        }
      }
    }
    for (const proposta of dati.malattie_da_censire || []) {
      // Le corsie consegnano la voce in due forme: annidata sotto `voce` (con accanto la nota di
      // come l'hanno provata) oppure piatta. Prendo la voce vera, non l'involucro.
      const esito = normalizzaMalattia(voceDiMalattia(proposta));
      const m = esito.voce;
      const lista = Array.isArray(malattie) ? malattie : malattie.malattie;
      // `undefined === undefined` è vero: due voci SENZA nome si riconoscevano a vicenda come «già
      // censita» e sparivano in silenzio. Un confronto che non ha guardato niente non deve produrre
      // un «sì». Trovato in questo stesso lotto, nello strumento che ricuce.
      const gemella = (x, campo) => m[campo] !== undefined && x[campo] === m[campo];
      if (lista.some((x) => gemella(x, "id") || gemella(x, "nome"))) {
        log.push(`   malattia «${m.id || m.nome}» già censita`);
        continue;
      }
      if (!esito.ok) {
        // Una voce senza questi campi non è una malattia censita a metà: è una malattia che la
        // spazzata non cercherà mai, con l'aria di essere stata censita. Non la scrivo.
        nMalScartate++;
        log.push(`   ⚠️  malattia «${m.id || m.nome || "senza nome"}» NON censita — le mancano: ${esito.mancanti.join(", ")}`);
        continue;
      }
      lista.push(m);
      nMal++;
      log.push(`   malattia censita: ${m.id} (baseline ${m.baseline})`);
    }
  }

  console.log(log.join("\n"));
  console.log(`\n${frammenti.length} frammenti · ${nChiusi} chiusi · ${nAperti} non-chiusi · ${nMut} mutazioni · ${nMal} malattie${nMutScartate ? ` · ${nMutScartate} mutazioni SCARTATE (il parser non le accetta)` : ""}${nMalScartate ? ` · ${nMalScartate} malattie SCARTATE (contratto incompleto)` : ""}${nIgnoti ? ` · ${nIgnoti} schede ignote` : ""}`);

  if (!scriviDavvero) { console.log("\n(prova a vuoto: rilancia con --scrivi per applicare)"); return; }
  mutanti.aggiornato = new Date().toISOString();
  scrivi(CANTIERE, cantiere);
  scrivi(MUTANTI, mutanti);
  scrivi(MALATTIE, malattie);
  console.log("\n✅ registri aggiornati");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
