#!/usr/bin/env node
// 👁️ SORVEGLIANTE — la revisione che gira MENTRE lavoro, non alla fine.
//
// PERCHÉ ESISTE (Nicola, 30/7): «ogni volta che ti chiedo di ricontrollare il lavoro fatto trovi
// problemi che tu stesso hai creato risolvendo i difetti, e trovi anche cose che non avevi guardato.
// Sembra che non hai un'auto-revisione mentre stai lavorando, e un quadro ampio di quello che stai
// facendo.» Ha ragione, e la prova è nell'architettura: prima di questo file la revisione esisteva
// solo in DUE momenti, entrambi tardi —
//
//   · al commit  → .githooks/pre-commit: sintassi, perimetro di main, segreti. Nient'altro.
//   · a fine lotto → cancello-lotto.mjs: prove, guardiani, typecheck.
//   · a fine giro  → auto-analisi.md: entità, numeri, semaforo (il CONTENUTO, non il codice).
//
// Mentre scrivo una modifica: **nessuno**. E la riga che salta è quasi sempre l'ultima, cioè quella
// che arriva quando il lavoro sembra già finito (come-riparo.md ⑥) — esattamente il momento in cui
// un controllo di fine corsa è meno capace di trovarla, perché a quel punto sono di parte.
//
// COSA GUARDA. Solo il DELTA: le righe che ho AGGIUNTO adesso. Non il debito storico — quello ha già
// i suoi tetti in malattie.json e tetti-lotto.json. È una scelta di taratura, non pigrizia: un
// cancello che parte rosso su mezzo repo viene disattivato entro la settimana (stampo-metro.mjs), uno
// che parte verde si accorge del primo che sporca. Guardando solo le righe nuove **parte verde per
// costruzione**, e il primo che sporca sono io.
//
//   ① malattia-nuova   — una riga che aggiungo ADESSO è una nuova istanza di una malattia già
//                        censita in malattie.json. Il registro è quello, non una copia: due liste
//                        della stessa conoscenza divergono sempre.
//   ② prova-accecata   — ho modificato un file su cui poggia una mutazione di mutanti.json, e il
//                        pezzo che quella mutazione cerca non c'è più. Cioè: un fix vecchio è appena
//                        rimasto senza prova, in silenzio. Nessuno lo controlla oggi (non-vacuita.mjs
//                        gira sui difetti del lotto in corso, non su quelli che il diff sfiora).
//   ③ gate-orfano      — dichiaro un `gate:` che punta a un test inesistente. «Non fatto» diventa
//                        indistinguibile da «puntatore rotto» — e il conto dei freni sale senza che
//                        la difesa esista. Se la nota nomina una PR aperta è `gate-in-attesa`: giallo,
//                        non verde (un'attesa senza scadenza è un'esenzione travestita, AR-338).
//   ④ perimetro-letterale — aggiungo a un guardiano un elenco di file scritto a mano. È la malattia
//                        di AR-347 alla lettera: «FILE_PILOTA è un elenco letterale, e chi lo ha
//                        scritto ha elencato i file dove aveva appena visto il difetto». È il modo
//                        preciso in cui un difetto si chiude riparando l'istanza e lasciando la classe.
//   ⑤ raggio           — chi ALTRO importa i file che ho toccato. Non è un errore: è il quadro ampio
//                        che manca. AR-338, AR-344 e AR-415 hanno tutti la stessa forma — ho cambiato
//                        un lettore condiviso e il significato è cambiato per tutti gli altri.
//
// COSA NON FA. Non giudica se il fix è giusto, non legge il cantiere, non sostituisce il cancello del
// lotto. Cinque misure meccaniche su un diff: dove passa un «forse» qui, la risposta è tacere.
//
// COPERTURA DICHIARATA (⑤ è una euristica, e va detto): il raggio si calcola cercando gli `import`/
// `require`/`from` che nominano il file toccato, più le citazioni del suo percorso in .sh/.json. NON
// segue le chiamate indirette, i nomi costruiti a runtime, né i riferimenti nei .md. Un raggio vuoto
// significa «non ne ho trovati», mai «non ce ne sono».
//
// IL CANALE (AR-465, 30/7 — la riparazione più importante di questo file). Per un giorno intero
// questa guardia ha girato a ogni mia modifica e ha parlato a NESSUNO. La riga in settings.json c'era,
// il codice era giusto, le prove verdi — e il verdetto finiva in un log di debug che non leggo. Un
// hook `PostToolUse` che esce con 0 e stampa testo semplice non arriva al modello: la documentazione
// lo dice a lettere, e io ho chiuso AR-455 senza andarla a leggere. Il risultato è la malattia che
// questa stessa macchina sa nominare — una misura che non può dire di no — costruita il mattino e
// consegnata il pomeriggio. Il canale che arriva davvero è UNO: stdout deve essere JSON con
// `hookSpecificOutput.additionalContext`, e allora il verdetto compare accanto al risultato dello
// strumento. Da qui la forma `--hook`: JSON o niente.
//
// E il silenzio? Se taccio quando è pulito (giusto: un avvisatore che parla sempre viene spento entro
// la settimana, L-2026-0730-533), «zitto perché non c'è niente» e «zitto perché sono morto» tornano
// indistinguibili — di nuovo la stessa malattia, un giro più in là. Per questo la forma hook lascia un
// BATTITO: un file ignorato da git (`_tmp_*`, così verificare non sporca l'albero — AR-464) con l'ora
// dell'ultimo scatto. `--battito` lo legge e risponde alla sola domanda che conta: hai girato o no?
//
// Uso:
//   node cervello/sorvegliante.mjs              # diff del working tree + staged vs HEAD
//   node cervello/sorvegliante.mjs --hook       # per l'hook: JSON che arriva al modello, SEMPRE exit 0
//   node cervello/sorvegliante.mjs --battito    # «il canale è vivo?» — quando ha girato l'ultima volta
//   node cervello/sorvegliante.mjs --staged     # solo lo staged (è la forma che usa il pre-commit)
//   node cervello/sorvegliante.mjs --json
//
// Uscita (contratto guardiani, AR-322):
//   0 = nessuna voce grave sul mio delta
//   1 = almeno una voce grave: l'ho introdotta io, adesso
//   2 = non ho potuto misurare (git assente, registri illeggibili) — «cieco» NON è verde
//
// 🟢 Sola lettura sul repo: non tocca git, non modifica file versionati. L'UNICA scrittura è il
//    battito in `--hook`, fuori da git (vedi sopra): senza, il canale non è verificabile.

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { senzaCommenti } from "./spazzata-fratelli.mjs";
import { percorsiDaGit } from "./percorsi-git.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);

// Questi file NOMINANO le malattie per mestiere: il registro, la guardia stessa, le sue prove e le
// mutazioni. Contare le loro citazioni come istanze è lo stesso errore che spazzata-fratelli ha già
// pagato nel lotto 11 — scambiare una MENZIONE per una CHIAMATA, e punire chi documenta.
//
// ⚠️ L'esenzione vale SOLO per il controllo ① (i pattern delle malattie), non per gli altri quattro.
// La prima versione la applicava al file intero, e il primo lavoro su cui l'ho provata — la
// costruzione di questa guardia stessa — è uscito «0 file toccati nel delta»: avevo scritto tre file
// e la guardia era cieca su tutti e tre. Un'esenzione presa per una classe di controllo e allargata a
// tutte è la stessa forma di AR-338 («zittire una malattia senza curarla»), e qui l'avrei pagata
// proprio dove serviva di più: nessun raggio, nessuna prova accecata, nessun gate orfano sul codice
// dei guardiani — cioè sui file che ne rompono di più quando cambiano.
export const SALTA_MALATTIE = [
  "cervello/sorvegliante.mjs",
  "cervello/spazzata-fratelli.mjs",
  "cervello/malattie.json",
  "cervello/mutanti.json",
  "cervello/test/",
];

const esenteDaMalattie = (file) => SALTA_MALATTIE.some((s) => file === s || file.startsWith(s));

// Un file di prova è un libro di ESEMPI: contiene finti gate, finti elenchi, finte malattie, perché il
// suo mestiere è provare che la guardia li riconosce. Leggerli come dichiarazioni vere è la terza
// comparsa della stessa forma in un'ora — «menzione ≠ chiamata» — e stavolta l'ha trovata la guardia
// su sé stessa: girata sul lavoro che la costruiva, si è accusata di due gate orfani che sono le
// fixture dei suoi test. Vale per i controlli che leggono DICHIARAZIONI (①③④); il raggio e la prova
// accecata restano accesi, perché quelli misurano effetti, non intenzioni.
export const FIXTURE = ["cervello/test/"];
const eFixture = (file) => FIXTURE.some((s) => file.startsWith(s));

// ─────────────────────────────────────────────────────────────────────────────
// IL CUORE — funzione pura. Nessun I/O, nessun git: così una prova la esegue su un diff finto invece
// che su com'è il repo adesso (skill cantiere ③: la logica che decide deve stare dove un test la può
// ESEGUIRE, altrimenti la prova controlla la forma del codice invece dell'effetto).
// ─────────────────────────────────────────────────────────────────────────────

/** Quanto lontano dalla riga del `gate:` accetto di trovare la sua `gate_nota`. Un intorno, non tutto
 *  il file: in un JSON di lezioni le chiavi di una stessa voce stanno adiacenti, e allargare
 *  significherebbe far scusare un gate orfano dalla nota di un'altra lezione. */
export const VICINANZA_NOTA = 6;

/** Il minimo di letterali che trasforma un elenco in un perimetro dedotto. Uno è una costante; due
 *  sono già una lista scelta a mano, ed è a due che AR-347 è nato. */
export const LETTERALI_MIN = 2;

/**
 * @param {object} ing
 * @param {Array<{file:string, aggiunte:Array<{n:number,testo:string}>, contenuto?:string|null}>} ing.toccati
 * @param {Array<object>} ing.malattie   registro malattie.json (campo `malattie`)
 * @param {Array<object>} ing.mutanti    registro mutanti.json (campo `mutanti`)
 * @param {Map<string,string[]>} ing.importatori  file toccato → chi lo nomina
 * @param {(p:string)=>boolean} ing.esiste        esiste questo percorso nel repo?
 * @returns {{voci:Array<object>, cieco:boolean, motivi:string[]}}
 */
export function sorveglia({
  toccati = [],
  malattie = [],
  mutanti = [],
  importatori = new Map(),
  esiste = () => true,
} = {}) {
  const voci = [];
  const motivi = [];

  // Un registro vuoto non è un repo sano: è una guardia che non cerca niente. Lo dico, non lo taccio.
  if (!malattie.length) motivi.push("registro malattie vuoto: non so quali forme di difetto cercare");
  if (!mutanti.length) motivi.push("registro mutanti vuoto: non posso sapere se ho accecato una prova");

  for (const t of toccati) {
    const file = t.file;
    const aggiunte = t.aggiunte || [];

    // ① malattia-nuova — le malattie censite, cercate solo sulle righe che aggiungo io.
    for (const m of esenteDaMalattie(file) ? [] : malattie) {
      if (!m.pattern) continue;
      if (Array.isArray(m.estensioni) && m.estensioni.length && !m.estensioni.some((e) => file.endsWith(e))) continue;
      let re;
      try {
        re = new RegExp(m.pattern);
      } catch {
        motivi.push(`malattia ${m.id}: pattern non compilabile, non l'ho potuta cercare`);
        continue;
      }
      for (const r of aggiunte) {
        // Il commento che spiega una malattia non è la malattia: stessa regola di spazzata-fratelli,
        // stessa funzione — non una seconda copia che col tempo divergerebbe.
        const pulita = senzaCommenti(r.testo, file);
        if (!pulita.trim()) continue;
        if (re.test(pulita)) {
          voci.push({
            classe: "malattia-nuova",
            gravita: "grave",
            file,
            riga: r.n,
            cosa: `riga nuova con la malattia «${m.id}»: ${m.nome || ""}`.trim(),
            perche: m.perche_e_grave || "forma di difetto già censita: qui si sta allargando",
            domanda: `questa riga la sto aggiungendo io adesso — la curo, o la dichiaro esente col PERCHÉ in cervello/malattie.json?`,
          });
        }
      }
    }

    // ② prova-accecata — ho toccato un file su cui poggia una mutazione, e il suo appiglio è sparito.
    const suQuestoFile = mutanti.filter((mu) => mu.file === file);
    if (suQuestoFile.length) {
      if (typeof t.contenuto !== "string") {
        motivi.push(`${file}: ha ${suQuestoFile.length} mutazione/i ma non ho il contenuto dopo la modifica — non ho potuto controllare se le ho accecate`);
      } else {
        for (const mu of suQuestoFile) {
          if (!mu.cerca) continue;
          if (!t.contenuto.includes(mu.cerca)) {
            voci.push({
              classe: "prova-accecata",
              gravita: "grave",
              file,
              riga: null,
              cosa: `la mutazione di ${mu.difetto || "?"} («${mu.nome || ""}») non trova più il suo pezzo in questo file`,
              perche: "quel fix era protetto da una prova che sapeva diventare rossa. Adesso la prova non ha più niente da rompere: il fix resta, la difesa no — e nessuno se ne accorgerà, perché il test continua a passare.",
              domanda: `ho spostato quel pezzo (allora aggiorna \`cerca\` in cervello/mutanti.json) o l'ho rimosso (allora ho appena disfatto ${mu.difetto || "un fix"})?`,
            });
          }
        }
      }
    }

    // ③ gate-orfano — un freno dichiarato che non può scattare.
    for (const r of eFixture(file) ? [] : aggiunte) {
      const g = /"gate"\s*:\s*"([^"]+)"/.exec(r.testo);
      if (!g) continue;
      const cmd = g[1];
      const percorso = (cmd.match(/[\w./-]+\.(?:m?js|sh|cjs)/) || [])[0];
      if (!percorso) {
        voci.push({
          classe: "gate-orfano",
          gravita: "grave",
          file,
          riga: r.n,
          cosa: `gate «${cmd}» non nomina nessun file: non si può nemmeno controllare che esista`,
          perche: "un freno che nessuno può puntare non è un freno: è una riga che fa salire il conteggio.",
          domanda: "quale comando, con quale file, fallisce se questa lezione viene violata?",
        });
        continue;
      }
      if (esiste(percorso)) continue;
      // Terza strada dichiarata: il test può stare in una PR non ancora mergiata. È uno stato vero e
      // frequente, e chiamarlo «orfano» insegna a ignorare il guardiano (è il falso rosso che ho
      // trovato io stesso il 30/7 su L-2026-0730-530). Ma resta GIALLO e vuole il numero della PR:
      // un'attesa senza riferimento è un'esenzione travestita, ed è la porta di AR-338.
      const intorno = aggiunte.filter((x) => Math.abs(x.n - r.n) <= VICINANZA_NOTA);
      const pr = intorno.map((x) => /PR\s*#(\d+)/.exec(x.testo)).find(Boolean);
      voci.push(
        pr
          ? {
              classe: "gate-in-attesa",
              gravita: "media",
              file,
              riga: r.n,
              cosa: `gate «${percorso}» non esiste ancora su questo ramo, dichiarato in attesa della PR #${pr[1]}`,
              perche: "è uno stato legittimo, ma finché quella PR non è mergiata il freno NON frena: conta come debito, non come difesa.",
              domanda: `la PR #${pr[1]} è ancora aperta? se è stata chiusa senza merge, questo gate è orfano e la lezione è senza freno.`,
            }
          : {
              classe: "gate-orfano",
              gravita: "grave",
              file,
              riga: r.n,
              cosa: `gate «${percorso}» non esiste`,
              perche: "«non fatto» diventa indistinguibile da «puntatore rotto», e il conto dei freni sale senza che la difesa esista.",
              domanda: "scrivo il test adesso, o togliergli il campo `gate` e dichiarare il debito?",
            }
      );
    }

    // ④ perimetro-letterale — un elenco di file scritto a mano dentro un guardiano.
    if (/^cervello\/[^/]+\.mjs$/.test(file) && !eFixture(file)) {
      for (const r of aggiunte) {
        if (!/^\s*(?:const|let|var)\s+[A-Z][A-Z0-9_]*\s*=\s*\[/.test(r.testo)) continue;
        // I letterali possono stare sulla stessa riga o sulle righe aggiunte subito sotto.
        const blocco = [r, ...aggiunte.filter((x) => x.n > r.n && x.n <= r.n + 8)]
          .map((x) => x.testo)
          .join("\n");
        const chiuso = blocco.slice(0, blocco.indexOf("]") + 1 || undefined);
        const letterali = chiuso.match(/["'][^"'\n]*\.(?:md|m?js|ts|tsx|json|sh)["']/g) || [];
        if (letterali.length >= LETTERALI_MIN) {
          voci.push({
            classe: "perimetro-letterale",
            gravita: "media",
            file,
            riga: r.n,
            cosa: `elenco di ${letterali.length} file scritto a mano in un guardiano: ${letterali.slice(0, 4).join(", ")}${letterali.length > 4 ? "…" : ""}`,
            perche: "è AR-347 alla lettera: un perimetro dedotto dagli esempi che avevo sotto gli occhi. Il guardiano dirà verde sui file che ho elencato e resterà cieco su tutti gli altri — cioè il difetto si chiuderà lasciando viva la classe.",
            domanda: "questo elenco l'ho MISURATO (scansione + esenzioni motivate) o l'ho dedotto dai punti dove avevo appena visto il difetto?",
          });
        }
      }
    }

    // ⑤ raggio — il quadro ampio: chi altro poggia su ciò che ho toccato.
    const dip = importatori.get(file) || [];
    if (dip.length) {
      voci.push({
        classe: "raggio",
        gravita: "informativa",
        file,
        riga: null,
        cosa: `${dip.length} altri file nominano questo: ${dip.slice(0, 6).join(", ")}${dip.length > 6 ? ` (+${dip.length - 6})` : ""}`,
        perche: "AR-338, AR-344 e AR-415 hanno la stessa forma: ho cambiato un lettore condiviso e il significato è cambiato per tutti gli altri, senza che nessuno lo elencasse.",
        domanda: `per ognuno di questi: il cambiamento che ho fatto vale ancora, o cambia il significato di quello che leggono?`,
      });
    }
  }

  return { voci, cieco: motivi.length > 0, motivi };
}

/** Le voci che fanno rosso. `raggio` non è un errore (è il quadro), `media` è un avviso che si legge. */
export function gravi(voci = []) {
  return voci.filter((v) => v.gravita === "grave");
}

// ─────────────────────────────────────────────────────────────────────────────
// IL CANALE — pure anche queste, e per lo stesso motivo del cuore: il modo in cui il verdetto ESCE è
// stato il difetto, non il verdetto. Una prova deve poter eseguire la busta e provare a romperla,
// altrimenti controlla che il codice «sembri giusto» — che è esattamente com'è passato inosservato.
// ─────────────────────────────────────────────────────────────────────────────

/** Il battito vive fuori da git: verificare non deve costare un diff (AR-464). */
export const BATTITO = "cervello/_tmp_sorvegliante-battito.json";

/**
 * La busta che ARRIVA al modello. Un hook PostToolUse che stampa testo semplice finisce nel log di
 * debug; solo `hookSpecificOutput.additionalContext` viene messo accanto al risultato dello strumento.
 * Torna la stringa da stampare, o `null` quando non c'è niente da dire (tacere è la scelta giusta:
 * un avvisatore che parla a ogni modifica viene spento entro la settimana — il battito copre il resto).
 */
export function bustaPerIlModello(voci = [], nToccati = 0) {
  const rossi = gravi(voci);
  const righe = [];
  for (const v of rossi.slice(0, 4)) {
    righe.push(`❌ ${v.classe} · ${v.file}${v.riga ? ":" + v.riga : ""} → ${v.cosa}\n   ↳ ${v.domanda}`);
  }
  for (const v of voci.filter((v) => v.gravita === "media").slice(0, 2)) {
    righe.push(`⚠️  ${v.classe} · ${v.file}${v.riga ? ":" + v.riga : ""} → ${v.cosa}`);
  }
  const raggi = voci.filter((v) => v.classe === "raggio");
  if (raggi.length) {
    righe.push(`🔭 raggio: ${raggi.map((r) => `${r.file} → ${(r.cosa.match(/^(\d+)/) || [, "?"])[1]} dipendenti`).join(" · ")}`);
  }
  if (rossi.length > 4) righe.push(`   …e altre ${rossi.length - 4} voci gravi: node cervello/sorvegliante.mjs`);
  if (!righe.length) return null;
  const testo = [`👁️ SORVEGLIANTE — ${nToccati} file toccati da questa modifica`, ...righe].join("\n");
  return JSON.stringify({
    hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: testo },
  });
}

/**
 * «Il canale è vivo?» — l'unica domanda a cui il silenzio non sa rispondere da solo.
 * Mai girato = 2, perché cieco non è verde: vale per la guardia esattamente come per il resto.
 */
/**
 * Un file APPENA CREATO non compare in `git diff HEAD`: git non lo conosce ancora. Per un giorno la
 * guardia ha quindi avuto un buco esattamente dove una malattia nuova entra più facilmente — il file
 * scritto da zero. Qui il file intero vale come «righe che sto aggiungendo adesso», perché è vero:
 * l'ho scritto tutto io, in questo momento. (Scoperto collaudando AR-465: l'esca funzionava solo dopo
 * un `git add`, e il perché mi è sembrato un dettaglio finché non ho guardato cosa implicava.)
 */
export function righeDiFileNuovo(contenuto = "") {
  // Un file binario non ha «righe che ho scritto»: leggerlo come testo produce solo rumore.
  if (contenuto.includes("\0")) return null;
  return contenuto.split("\n").map((testo, i) => ({ n: i + 1, testo })).filter((r) => r.testo.trim() !== "");
}

export function verdettoBattito(battito, adesso = 0) {
  const t = battito && battito.quando ? Date.parse(battito.quando) : NaN;
  if (!Number.isFinite(t)) {
    return {
      vivo: false,
      uscita: 2,
      testo: "⚪ il sorvegliante non ha mai scattato da hook qui: non so se il canale è vivo, e non saperlo non è un verde.",
    };
  }
  const min = Math.max(0, Math.round((adesso - t) / 60000));
  return {
    vivo: true,
    uscita: 0,
    testo: `✅ ultimo scatto ${min} min fa (${battito.quando}) — ${battito.file_toccati ?? "?"} file guardati, ${battito.voci ?? "?"} voci, ${battito.gravi ?? "?"} gravi.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LO STRATO I/O — git, registri, filesystem. Sottile per scelta: tutto ciò che DECIDE sta sopra.
// ─────────────────────────────────────────────────────────────────────────────

function git(args) {
  return execFileSync("git", args, { cwd: REPO, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

/** Legge il diff unificato e ne estrae, per ogni file, le righe AGGIUNTE col loro numero vero. */
export function leggiDiff(testo) {
  const perFile = new Map();
  let file = null;
  let riga = 0;
  for (const l of testo.split("\n")) {
    if (l.startsWith("+++ ")) {
      const p = l.slice(4).trim();
      file = p === "/dev/null" ? null : p.replace(/^b\//, "");
      if (file && !perFile.has(file)) perFile.set(file, []);
      continue;
    }
    if (l.startsWith("@@")) {
      // @@ -vecchio,n +nuovo,n @@ → il numero di riga del NUOVO file, che è quello che mi serve.
      const m = /\+(\d+)/.exec(l);
      riga = m ? Number(m[1]) : 0;
      continue;
    }
    if (!file) continue;
    if (l.startsWith("+") && !l.startsWith("+++")) {
      perFile.get(file).push({ n: riga, testo: l.slice(1) });
      riga++;
    } else if (!l.startsWith("-") && !l.startsWith("\\")) {
      riga++;
    }
  }
  return perFile;
}

/** Chi nomina questo file. Euristica dichiarata in testa: import/require/from + citazioni di percorso. */
function cercaImportatori(fileRel) {
  const nome = basename(fileRel);
  if (!nome) return [];
  const fuori = [];
  const cerca = (dir) => {
    let voci;
    try {
      voci = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const v of voci) {
      if (v.name === "node_modules" || v.name === ".git" || v.name === ".next") continue;
      const p = join(dir, v.name);
      if (v.isDirectory()) {
        cerca(p);
        continue;
      }
      if (!/\.(m?js|cjs|ts|tsx|sh|json)$/.test(v.name)) continue;
      const rel = relative(REPO, p);
      if (rel === fileRel) continue;
      let testo;
      try {
        if (statSync(p).size > 2 * 1024 * 1024) continue;
        testo = readFileSync(p, "utf8");
      } catch {
        continue;
      }
      // Il nome del file dentro un import/require, o il suo percorso citato in uno script/JSON.
      if (
        new RegExp(`(?:from|import|require)\\s*\\(?\\s*["'][^"'\\n]*${nome.replace(/\./g, "\\.")}["']`).test(testo) ||
        testo.includes(fileRel)
      ) {
        fuori.push(rel);
      }
    }
  };
  cerca(REPO);
  return fuori.sort();
}

function leggiRegistro(nome, campo) {
  const p = join(QUI, nome);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"))[campo] || [];
  } catch {
    return null;
  }
}

function main() {
  const argv = process.argv.slice(2);
  const hook = argv.includes("--hook");
  const soloStaged = argv.includes("--staged");
  const json = argv.includes("--json");

  // «Hai girato o no?» — prima di tutto il resto, perché è la domanda che si fa quando si sospetta
  // che la guardia sia morta, e in quel momento il diff non c'entra niente.
  if (argv.includes("--battito")) {
    let letto = null;
    try {
      letto = JSON.parse(readFileSync(join(REPO, BATTITO), "utf8"));
    } catch {
      letto = null;
    }
    const v = verdettoBattito(letto, Date.now());
    console.log(v.testo);
    process.exit(v.uscita);
  }

  let diff;
  try {
    // `-U0`: solo le righe cambiate, niente contesto — il contesto NON è mio, e contarlo
    // trasformerebbe il codice di qualcun altro in una mia colpa.
    diff = soloStaged ? git(["diff", "--cached", "-U0"]) : git(["diff", "HEAD", "-U0"]);
  } catch (e) {
    // Nessun HEAD (repo appena nato) o git assente: cieco, e cieco non è verde.
    if (hook) {
      console.log("👁️ sorvegliante: cieco (git non leggibile) — nessun controllo sul delta");
      process.exit(0);
    }
    console.error(`👁️ SORVEGLIANTE CIECO — non ho potuto leggere il diff: ${e.message.split("\n")[0]}`);
    process.exit(2);
  }

  const perFile = leggiDiff(diff);

  // I file NUOVI, che il diff non conosce. `--staged` no: lì il perimetro è per definizione ciò che è
  // stato messo in staging, e allargarlo direbbe al pre-commit di bocciare per righe che non sta
  // committando. Il tetto sui byte non è pigrizia: un dump o un export finito nella cartella per
  // sbaglio farebbe leggere megabyte a ogni Edit, e una guardia lenta viene spenta come una rumorosa.
  if (!soloStaged) {
    // Dalla PORTA, non da git a mano (AR-339): con un nome accentato — 26 file solo in questo vault —
    // git restituisce il percorso citato con gli ottali, `readFileSync` fallisce e il file finirebbe
    // saltato in silenzio. Cioè: la guardia direbbe di aver guardato un file che non ha aperto. L'ha
    // trovato il guardiano che quella regola la fa rispettare, prima che uscisse.
    let nuovi = [];
    try {
      nuovi = percorsiDaGit(["ls-files", "--others", "--exclude-standard"], { cwd: REPO });
    } catch {
      nuovi = [];
    }
    for (const f of nuovi) {
      if (perFile.has(f)) continue;
      const abs = join(REPO, f);
      try {
        if (statSync(abs).size > 512 * 1024) continue;
        const righe = righeDiFileNuovo(readFileSync(abs, "utf8"));
        if (righe && righe.length) perFile.set(f, righe);
      } catch {
        // Illeggibile o sparito tra il `ls-files` e la lettura: non è una colpa, è un file che non c'è.
      }
    }
  }

  const malattie = leggiRegistro("malattie.json", "malattie");
  const mutanti = leggiRegistro("mutanti.json", "mutanti");

  const toccati = [];
  const importatori = new Map();
  for (const [file, aggiunte] of perFile) {
    const abs = join(REPO, file);
    let contenuto = null;
    try {
      contenuto = existsSync(abs) ? readFileSync(abs, "utf8") : null;
    } catch {
      contenuto = null;
    }
    toccati.push({ file, aggiunte, contenuto });
    // Il raggio costa una scansione per file: la faccio solo sul codice condiviso, non sui .md e non
    // sui dati del vault (lì «chi mi cita» non è una dipendenza che si rompe).
    if (/\.(m?js|cjs|ts|tsx)$/.test(file)) importatori.set(file, cercaImportatori(file));
  }

  const esito = sorveglia({
    toccati,
    malattie: malattie || [],
    mutanti: mutanti || [],
    importatori,
    esiste: (p) => existsSync(join(REPO, p)),
  });
  if (malattie === null) esito.motivi.push("cervello/malattie.json illeggibile");
  if (mutanti === null) esito.motivi.push("cervello/mutanti.json illeggibile");
  const rossi = gravi(esito.voci);

  if (json) {
    console.log(JSON.stringify({ ...esito, gravi: rossi.length, file_toccati: toccati.length }, null, 2));
    process.exit(rossi.length ? 1 : esito.cieco ? 2 : 0);
  }

  // ── Forma corta: entra nel mio contesto a OGNI modifica, quindi deve stare in poche righe o
  //    diventa rumore che imparo a scorrere. Solo i rossi, i gialli in una riga, il raggio contato.
  if (hook) {
    // Il battito PRIMA della busta, e sempre — anche a mani vuote. È la prova che ho girato, e serve
    // soprattutto quando non ho niente da dire: è lì che il silenzio si confonde con la morte.
    try {
      writeFileSync(
        join(REPO, BATTITO),
        JSON.stringify({ quando: new Date().toISOString(), file_toccati: toccati.length, voci: esito.voci.length, gravi: rossi.length }),
      );
    } catch {
      // Un battito che non si scrive non deve fermare la modifica in corso: resta il verdetto, che è
      // la parte che conta. `--battito` dirà «mai scattato», ed è la risposta onesta.
    }
    // stdout in forma hook è SOLO la busta JSON: qualsiasi altra riga la rende illeggibile a chi la
    // deve interpretare, e il verdetto tornerebbe a sparire nel log — cioè il difetto di partenza.
    const busta = bustaPerIlModello(esito.voci, toccati.length);
    if (busta) console.log(busta);
    // Avvisa, non blocca: un freno che ferma un Edit a metà lavoro viene spento in un giorno, e un
    // controllo spento è peggio di nessun controllo (insegna che il verde non vuol dire niente).
    // Il freno che BLOCCA sta al commit, dove fermarsi non costa il lavoro in corso.
    process.exit(0);
  }

  console.log(`\n👁️ SORVEGLIANTE — ${toccati.length} file toccati nel delta\n`);
  if (!toccati.length) {
    console.log("   nessuna modifica da guardare.");
    process.exit(0);
  }
  const ordine = { grave: 0, media: 1, informativa: 2 };
  for (const v of [...esito.voci].sort((a, b) => ordine[a.gravita] - ordine[b.gravita])) {
    const seg = v.gravita === "grave" ? "❌" : v.gravita === "media" ? "⚠️ " : "🔭";
    console.log(`${seg} ${v.classe} — ${v.file}${v.riga ? ":" + v.riga : ""}`);
    console.log(`   ${v.cosa}`);
    console.log(`   perché: ${v.perche}`);
    console.log(`   → ${v.domanda}\n`);
  }
  if (esito.motivi.length) {
    console.log("⚪ non ho potuto misurare:");
    for (const m of esito.motivi) console.log(`   · ${m}`);
    console.log("");
  }
  if (rossi.length) {
    console.log(`❌ ${rossi.length} voce/i grave/i introdotte da me in questo delta.`);
    process.exit(1);
  }
  if (esito.cieco) {
    console.log("⚪ nessuna voce grave, ma la misura è incompleta: cieco non è verde.");
    process.exit(2);
  }
  console.log("✅ nessuna voce grave sul delta.");
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
