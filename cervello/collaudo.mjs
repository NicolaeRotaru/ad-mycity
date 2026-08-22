#!/usr/bin/env node
// 🔎 COLLAUDO — il ricontrollo del lavoro FINITO, prima che il mio «fatto» arrivi a Nicola.
//
// PERCHÉ ESISTE (Nicola, 4/8): «ogni volta che finisci un lavoro e ti chiedo di ricontrollare,
// trovi sempre cose che non hai fatto o problemi che non hai visto. Ho bisogno che il sorvegliante,
// o chi è incaricato, ricontrolli il lavoro fatto, lo analizzi più e più volte e lo completi al
// 100% — così non devo dirtelo io, tantissime volte di fila.»
//
// Aveva ragione, e la prova è nell'architettura. La revisione esisteva in tre momenti, e nessuno è
// quello in cui il suo «ricontrolla» trova le cose:
//   · mentre lavoro     → sorvegliante.mjs: guarda il DELTA dell'ultima modifica, mai il lavoro intero.
//   · quando dico fatto → cancello-stop.mjs: guarda cosa sto LASCIANDO INDIETRO (esiti, allarmi,
//     testi difficili) — non rilegge il lavoro.
//   · in CI             → cancello-lotto.mjs: prove e guardiani, quando la PR è già scritta.
//
// Il «ricontrolla» che Nicola fa a mano — rileggere TUTTO il lavoro finito e confrontarlo con la
// richiesta — non lo faceva nessuna guardia. E funziona proprio perché arriva a lavoro finito: il
// pezzo MAI scritto non compare in nessun diff incrementale, lo vede solo uno sguardo fresco sul
// tutto. Per questo qui il ricontrollo non è un consiglio: è un cancello.
//
// COME FUNZIONA. Al momento dello «fatto» (hook Stop), se in questo turno c'è del lavoro:
//   ① la prima volta il cancello NON mi lascia chiudere: mi obbliga al giro di collaudo — rileggere
//      la richiesta, rileggere il diff intero file per file, eseguire le prove — e mi consegna il
//      verdetto del sorvegliante calcolato sull'INTERO perimetro del lavoro, non sull'ultima modifica.
//   ② se il giro di collaudo non cambia niente, il lavoro è confermato: si chiude, e la stessa
//      impronta non viene più richiesta (un freno che richiede all'infinito la stessa cosa viene
//      spento in una settimana).
//   ③ se il giro TROVA e corregge, l'impronta del lavoro cambia: al prossimo «fatto» il collaudo
//      riparte da capo, sul lavoro nuovo, dallo STESSO punto di partenza (il perimetro resta quello
//      del primo giro, memorizzato nel registro — senza, le correzioni committate sparirebbero dal
//      diff e il secondo giro guarderebbe il nulla). È il «più e più volte» chiesto da Nicola: si
//      ripete finché un giro esce a mani vuote — mai due volte sullo stesso stato.
//
// L'IMPRONTA. Il lavoro è «lo stesso» quando niente si è mosso: il commit in testa, il contenuto
// delle modifiche non committate, i file nuovi (nome, dimensione, ora). Una qualunque di queste
// cose cambia → l'impronta cambia → il collaudo torna dovuto.
//
// TARATURE DICHIARATE, cioè i motivi per cui questa guardia può sopravvivere:
//   · vale SOLO dentro l'hook Stop: fuori (CI, comando a mano) non c'è nessun modello a cui chiedere
//     il ricontrollo, e un cancello rosso per costruzione in CI si impara a ignorare in tre giorni.
//   · rispetta la valvola anti-cappio dello Stop: se il turno è già stato fermato una volta, non
//     riferma — il lavoro cambiato si ricollauda al turno dopo, non in un cappio adesso.
//   · un turno senza lavoro (solo letture, solo chat) passa senza una parola.
//
// COSA NON FA, e va detto: non sa se il lavoro è GIUSTO nel merito — quello lo dicono le prove con
// un fallimento vero, e alla fine Nicola. Questa guardia obbliga il ricontrollo e porta i fatti
// misurabili; la rilettura vera la fa il modello, che è l'unico a conoscere la richiesta del turno.
//
// Uso:
//   node cervello/collaudo.mjs             # stato: un collaudo è dovuto o no, e perché (sola lettura)
//   node cervello/collaudo.mjs --registro  # l'ultimo registro scritto
// Exit: 0 = niente di dovuto (o già collaudato) · 1 = un collaudo è dovuto · 2 = non ho potuto misurare
//
// 🟢 Sola lettura sul repo. L'UNICA scrittura è il registro in `cervello/_tmp_collaudo.json`, fuori
//    da git — come il battito del sorvegliante e l'ancora dello Stop, per lo stesso motivo:
//    verificare non deve costare un diff (AR-464).

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { verdettoDelDelta } from "./sorvegliante.mjs";
import { percorsiDaGit } from "./percorsi-git.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);

/** Il registro vive fuori da git, come il battito del sorvegliante e per lo stesso motivo. */
export const REGISTRO_COLLAUDO = "cervello/_tmp_collaudo.json";

// ─────────────────────────────────────────────────────────────────────────────
// IL CUORE — funzioni pure. Nessun I/O, nessun git: una prova le esegue su stati finti, e il
// mutante può renderla rossa (skill cantiere ③: la logica che decide sta dove un test la ESEGUE).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * L'impronta del lavoro: cambia se qualunque cosa del lavoro si muove.
 *
 * `testa` = il commit in testa (copre tutto il lavoro committato) · `diff` = il contenuto delle
 * modifiche non committate (i NOMI non bastano: correggere una riga in un file già modificato non
 * cambia l'elenco dei nomi, e l'impronta direbbe «uguale» su un lavoro diverso) · `nuovi` = i file
 * che git non conosce ancora, con dimensione e ora (il contenuto costerebbe una lettura per file a
 * ogni chiusura; dimensione+ora cambiano a ogni salvataggio, ed è quello che serve).
 */
export function improntaLavoro({ testa = "", diff = "", nuovi = [] } = {}) {
  const h = createHash("sha256");
  h.update(String(testa));
  h.update("\n");
  h.update(String(diff));
  h.update("\n");
  for (const f of nuovi) h.update(`${f.file}·${f.dim}·${f.quando}\n`);
  return h.digest("hex").slice(0, 16);
}

/**
 * La decisione: cosa fa il collaudo a questo «fatto».
 *
 * Quattro esiti, e il perché di ognuno:
 *   `chiedi`   — c'è lavoro non ancora collaudato: il cancello ferma e obbliga il giro di collaudo.
 *   `promuovi` — il giro di collaudo appena fatto non ha cambiato niente (stessa impronta al
 *                secondo stop): il lavoro è confermato, si scrive «pulito» e non si richiede più.
 *   `rimanda`  — il giro di collaudo ha CAMBIATO il lavoro, ma il turno è già stato fermato una
 *                volta: non si incappia adesso — il registro resta «chiesto» e il prossimo «fatto»
 *                ricomincia da capo sul lavoro nuovo.
 *   `niente`   — nessun lavoro, o lavoro già collaudato pulito e mai più toccato.
 *
 * `pendente` è la ragione per cui `lavoro` da solo non basta: se il giro di collaudo committa le
 * correzioni e l'ancora dello Stop si sposta, il diff del turno dopo è vuoto — ma il registro
 * «chiesto» ricorda che quel lavoro non è mai uscito pulito, e il ricontrollo resta dovuto.
 */
export function verdettoCollaudo({ lavoro = false, impronta = "", registro = null, giaBloccato = false, headUgualeABase = false } = {}) {
  // HEAD già pubblicato (origin/main) = niente di non pubblicato da ricollaudare — qualunque cosa
  // dica un registro rimasto «chiesto» sul disco da una sessione precedente. Quel registro esiste
  // per portare il collaudo attraverso più «fatto» dello STESSO turno (la scheda ①②③ qui sopra); non
  // è fatto per sopravvivere al turno che l'ha scritto. Senza questo bypass, un `registro.da` vecchio
  // resta antenato di ogni HEAD futuro per sempre (è storia vera), `baseDelCollaudo` lo ripesca ogni
  // volta, e il collaudo torna dovuto su lavoro che nessuna sessione ha mai aperto — il gemello
  // esatto del ciclo che `scegliPerimetro` risolve in cancello-stop.mjs, sull'altra metà del sistema.
  if (headUgualeABase) return { azione: "niente" };
  const pendente = registro?.esito === "chiesto";
  if (!lavoro && !pendente) return { azione: "niente" };
  const stessa = Boolean(registro) && registro.impronta === impronta;
  if (stessa && registro.esito === "pulito") return { azione: "niente" };
  if (giaBloccato) {
    if (stessa && pendente) return { azione: "promuovi", giro: registro.giro || 1 };
    return { azione: "rimanda" };
  }
  return { azione: "chiedi", giro: pendente ? (registro.giro || 0) + 1 : 1 };
}

/**
 * Le istruzioni del giro di collaudo: il testo che il cancello dello Stop mi mette davanti.
 *
 * Aprono con ❌ per due motivi che non sono estetica: nel verdetto dello Stop una riga ❌ blocca la
 * chiusura, e tiene ferma l'ancora del turno — così il perimetro non scivola sotto i piedi del
 * giro di collaudo. I quattro passi sono il «ricontrolla» di Nicola trascritto: la richiesta prima
 * del diff, il diff vero prima della memoria, le prove prima dei ricordi.
 */
export function righeCollaudo({ giro = 1, nFile = 0, da = null, voci = [] } = {}) {
  const comando = `git diff ${da || "HEAD"}`;
  const righe = [
    `❌ COLLAUDO DEL LAVORO FINITO — giro ${giro}, ${nFile} file toccati: prima di dire «fatto», questo lavoro va ricontrollato TUTTO (AR-532)` +
      `\n   → ① rileggi la RICHIESTA di Nicola di questo turno e fai l'elenco di OGNI cosa chiesta: per ognuna scrivi FATTA (e dove si vede), MANCANTE (falla adesso) o NON FATTA APPOSTA (col perché).` +
      `\n   → ② rileggi il lavoro INTERO, file per file, dal diff vero — non a memoria: \`${comando}\` e \`git status --short\`.` +
      `\n   → ③ esegui le prove che toccano i file cambiati e guarda i RISULTATI, non i ricordi.` +
      `\n   → ④ l'asticella: hai considerato almeno un'altra strada? dichiara quale e perché hai scelto questa — se non ne esiste nemmeno una, ti sei fermato alla prima cosa che funziona.` +
      `\n   → ⑤ sistemato ciò che trovi, chiudi dichiarando cosa hai verificato e cosa NON hai potuto verificare.` +
      `\n   → se correggi qualcosa l'impronta del lavoro cambia e il collaudo riparte al prossimo «fatto»: si ripete finché un giro esce a mani vuote.`,
  ];
  const rosse = voci.filter((v) => v.gravita === "grave").slice(0, 5);
  const gialle = voci.filter((v) => v.gravita === "media").slice(0, 3);
  if (rosse.length || gialle.length) {
    righe.push(
      `❌ e il giro del sorvegliante sull'INTERO lavoro (non solo l'ultima modifica) trova già questo:` +
        [...rosse, ...gialle]
          .map((v) => `\n   → ${v.gravita === "grave" ? "❌" : "⚠️"} ${v.classe} · ${v.file}${v.riga ? ":" + v.riga : ""} — ${v.cosa}`)
          .join(""),
    );
  }
  return righe;
}

// ─────────────────────────────────────────────────────────────────────────────
// LO STRATO I/O — git, registro, il giro completo del sorvegliante. Sottile: decide il cuore.
// ─────────────────────────────────────────────────────────────────────────────

const git = (args) =>
  execFileSync("git", args, { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });

/**
 * Lo stato del lavoro rispetto a un punto di partenza. `null` = git non risponde: cieco, non verde.
 */
export function statoDelLavoro(da = null) {
  let testa;
  let nonCommittato;
  try {
    testa = git(["rev-parse", "HEAD"]).trim();
    nonCommittato = git(["diff", "HEAD"]);
  } catch {
    return null;
  }
  let nomi = [];
  try {
    nomi = percorsiDaGit(["diff", da || "HEAD", "--name-only"], { cwd: REPO });
  } catch {
    // Il punto di partenza può non esistere più (rebase): il lavoro lo raccontano comunque il
    // diff non committato e i file nuovi — un perimetro più stretto dichiarato, non un errore.
    nomi = [];
  }
  let nuovi = [];
  try {
    nuovi = percorsiDaGit(["ls-files", "--others", "--exclude-standard"], { cwd: REPO }).map((f) => {
      try {
        const s = statSync(join(REPO, f));
        return { file: f, dim: s.size, quando: Math.round(s.mtimeMs) };
      } catch {
        return { file: f, dim: 0, quando: 0 };
      }
    });
  } catch {
    nuovi = [];
  }
  const lavoro = nomi.length > 0 || nuovi.length > 0;
  return { lavoro, impronta: improntaLavoro({ testa, diff: nonCommittato, nuovi }), nFile: nomi.length + nuovi.length };
}

function leggiRegistro() {
  try {
    return JSON.parse(readFileSync(join(REPO, REGISTRO_COLLAUDO), "utf8"));
  } catch {
    return null; // mai collaudato qui, o registro illeggibile: si riparte da capo, che è l'esito onesto
  }
}

function scriviRegistro(voce) {
  try {
    writeFileSync(join(REPO, REGISTRO_COLLAUDO), JSON.stringify({ ...voce, quando: new Date().toISOString() }));
  } catch {
    // Un registro che non si scrive non ferma la chiusura: al prossimo giro il collaudo verrà
    // richiesto di nuovo — un ricontrollo in più, mai uno in meno.
  }
}

/**
 * Il punto di partenza del giro: quello memorizzato al primo giro, finché è ancora un antenato.
 *
 * E quando l'ancora del turno NON c'è (prima chiusura di una sessione, container fresco), il ramo
 * intero non è «questo lavoro»: provato sul campo alla prima esecuzione — 211 file di sessioni
 * passate presentati come lavoro da ricollaudare, cioè l'accusa su lavoro non tuo che questa casa
 * ha già pagato con AR-507. Lì il punto di partenza si FISSA su HEAD adesso: copre il lavoro non
 * committato di questo turno, e — memorizzato nel registro — tiene nel diff dei giri successivi le
 * correzioni che il giro di collaudo committa. Limite dichiarato: ciò che un turno senza ancora ha
 * committato PRIMA del suo primo «fatto» resta fuori dal primo giro.
 */
function baseDelCollaudo(registro, da, turno, headUgualeABase = false) {
  if (headUgualeABase) {
    try {
      return git(["rev-parse", "HEAD"]).trim();
    } catch {
      return da;
    }
  }
  const memorizzata = registro?.esito === "chiesto" ? registro.da : null;
  if (memorizzata) {
    try {
      git(["merge-base", "--is-ancestor", memorizzata, "HEAD"]);
      return memorizzata;
    } catch {
      // rebase o reset: il punto memorizzato non racconta più questo ramo — si sceglie di nuovo
    }
  }
  if (turno && da) return da;
  try {
    return git(["rev-parse", "HEAD"]).trim();
  } catch {
    return da;
  }
}

/**
 * L'ingresso che usa il cancello dello Stop. Torna righe (bloccano), note (si leggono) e ciechi
 * (⚪, «non ho potuto misurare»), già nelle tre forme che il verdetto dello Stop conosce.
 */
export function collaudoAlloStop({ da = null, turno = false, giaBloccato = false, headUgualeABase = false } = {}) {
  const registro = leggiRegistro();
  const base = baseDelCollaudo(registro, da, turno, headUgualeABase);
  const stato = statoDelLavoro(base);
  if (!stato) {
    return { righe: [], note: [], ciechi: ["il collaudo non ha potuto leggere git: non so se il lavoro finito sia stato ricontrollato."] };
  }
  const v = verdettoCollaudo({ lavoro: stato.lavoro, impronta: stato.impronta, registro, giaBloccato, headUgualeABase });
  // Pulisce il registro poisoned (AR-vedi commento sopra in verdettoCollaudo): senza, il prossimo
  // turno che trova il ramo davvero sporco leggerebbe ancora un `registro.da` vecchio di giorni.
  if (v.azione === "niente" && headUgualeABase && registro) {
    scriviRegistro({ impronta: stato.impronta, esito: "pulito", giro: registro.giro || 0 });
  }
  if (v.azione === "promuovi") {
    scriviRegistro({ impronta: stato.impronta, esito: "pulito", giro: v.giro });
    return { righe: [], note: [`collaudo superato al giro ${v.giro}: lavoro ricontrollato per intero, niente da cambiare — confermato.`], ciechi: [] };
  }
  if (v.azione === "rimanda") {
    return { righe: [], note: ["il giro di collaudo ha cambiato il lavoro: al prossimo «fatto» il ricontrollo riparte sull'impronta nuova."], ciechi: [] };
  }
  if (v.azione !== "chiedi") return { righe: [], note: [], ciechi: [] };
  let voci = [];
  try {
    // `senzaRaggio`: qui servono solo le voci gravi/medie — il raggio è un quadro informativo che
    // nelle istruzioni non entra, e la sua scansione dell'intero repo a ogni «fatto» è costo puro.
    voci = verdettoDelDelta({ da: base, senzaRaggio: true }).esito.voci;
  } catch {
    voci = []; // il giro meccanico non è riuscito: restano i passi del ricontrollo, che sono la parte che conta
  }
  scriviRegistro({ impronta: stato.impronta, esito: "chiesto", giro: v.giro, da: base });
  return { righe: righeCollaudo({ giro: v.giro, nFile: stato.nFile, da: base, voci }), note: [], ciechi: [] };
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("--registro")) {
    const r = leggiRegistro();
    console.log(r ? JSON.stringify(r, null, 2) : "⚪ nessun registro: qui non è mai stato chiesto un collaudo.");
    process.exit(0);
  }
  const registro = leggiRegistro();
  const stato = statoDelLavoro(baseDelCollaudo(registro, null, false));
  if (!stato) {
    console.error("⚪ non ho potuto leggere git: non so se ci sia lavoro da collaudare.");
    process.exit(2);
  }
  const v = verdettoCollaudo({ lavoro: stato.lavoro, impronta: stato.impronta, registro, giaBloccato: false });
  if (v.azione === "chiedi") {
    console.log(`🔎 un collaudo è dovuto (giro ${v.giro}, ${stato.nFile} file): al prossimo «fatto» il cancello dello Stop lo chiederà.`);
    process.exit(1);
  }
  console.log(
    registro?.esito === "pulito" && registro.impronta === stato.impronta
      ? `✅ lavoro già collaudato pulito (giro ${registro.giro || 1}) e mai più toccato.`
      : "✅ nessun lavoro da collaudare.",
  );
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
