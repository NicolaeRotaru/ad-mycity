#!/usr/bin/env node
// 🧨 LA PROVA CHE LE PROVE PROVINO — rompe i fix apposta e pretende che i test diventino rossi.
//
// PERCHÉ ESISTE. Il passo ④.2 della skill `cantiere` dice: «rompi il fix riga per riga, e il test
// DEVE diventare rosso; se resta verde, la prova non prova niente». È il passo che ha pescato
// quattro difetti nel metro stesso in due giorni — e finora si faceva **a mano**, con uno script
// usa-e-getta buttato in /tmp e perso alla fine della sessione. Cioè: il controllo più prezioso del
// metodo era l'unico senza memoria.
//
// Qui le mutazioni diventano un file versionato (`cervello/mutanti.json`) e la verifica un comando.
// Chi legge la PR può rilanciarlo; chi arriva fra un mese vede quali fix erano protetti davvero.
//
// 🟡 Modifica temporaneamente i file per rompere il fix, e li RIPRISTINA sempre — anche su
// eccezione, anche su Ctrl-C. Non tocca git, non committa. Lavora sul working tree: non lanciarlo
// con modifiche non salvate che ti dispiacerebbe perdere se la macchina si spegne a metà.
//
// Uso:
//   node cervello/non-vacuita.mjs                       # tutte le mutazioni
//   node cervello/non-vacuita.mjs --lotto 29            # solo quelle di un lotto
//   node cervello/non-vacuita.mjs --difetti AR-1,AR-2   # solo quelle dei difetti indicati
//   node cervello/non-vacuita.mjs --json
//
// `--difetti` esiste per AR-393: il cancello del lotto lo esegue sui difetti che il lotto TOCCA, e
// solo su quelli. Rompere tutte le mutazioni di trenta lotti a ogni consegna costerebbe minuti e
// insegnerebbe ad aggirare il cancello — un controllo che si impara a saltare è già spento.
//
// Uscita (contratto guardiani, AR-322):
//   0 = ogni mutazione rende rosso il suo test: le prove non sono vacue
//   1 = almeno una mutazione lascia il test VERDE → quella prova non dimostra il suo fix
//   2 = non ho potuto misurare (file/mutanti assenti, pattern non trovato)

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { isAbsolute, join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const iLotto = process.argv.indexOf("--lotto");
const LOTTO = iLotto !== -1 ? String(process.argv[iLotto + 1] || "") : null;
const iDif = process.argv.indexOf("--difetti");
const DIFETTI = iDif !== -1 ? String(process.argv[iDif + 1] || "").split(/[,\s]+/).filter(Boolean) : null;

/** Gli id di difetto nominati da una mutazione: il campo `difetto` può accorparne più d'uno. */
export function difettiDellaMutazione(m) {
  return String(m?.difetto || "").match(/AR-\d+/g) || [];
}

// ─────────────────────────────────────────────────────────────────────────────
// IL RIPRISTINO D'EMERGENZA (AR-523) — `finally` non gira su un processo UCCISO.
//
// PERCHÉ ESISTE. Il 4/8 un mio comando è andato in timeout mentre questo strumento teneva applicata
// una mutazione: il SIGTERM ha saltato il `finally` qui sotto e `cervello/git-pr.mjs` è rimasto su
// disco col fix di AR-451 disfatto (`const preRebaseSha = null`). Per git era una modifica come
// un'altra, indistinguibile da una scelta; l'ha preso il sorvegliante al primo Edit successivo, con
// una voce `prova-accecata`. Senza di lui finiva dritto in un commit.
//
// La radice: uno strumento di misura che scrive nell'oggetto misurato deve saper rimettere le cose
// a posto ANCHE quando viene ammazzato. Un `finally` copre l'eccezione, non il segnale.
// ─────────────────────────────────────────────────────────────────────────────

/** Il file che sto tenendo rotto adesso, e com'era prima. Un oggetto e non una variabile nuda così
 *  il gestore del segnale legge sempre l'ultimo valore, senza catturarne una copia vecchia. */
export const IN_CORSO = { stato: null };

/**
 * Rimette a posto il file lasciato rotto. `scrivi` è iniettato: senza, questa funzione si potrebbe
 * provare solo ammazzando un processo vero — cioè non si proverebbe, ed è esattamente com'è nato il
 * difetto che cura.
 *
 * @returns {string|null} il file rimesso a posto, o `null` se non c'era niente da rimettere
 */
export function ripristina(stato, scrivi) {
  if (!stato || !stato.file) return null;
  try {
    scrivi(stato.file, stato.originale);
    return stato.file;
  } catch {
    // Non riesco nemmeno a ripristinare: non posso fare altro che dirlo (lo fa il chiamante).
    return null;
  }
}

for (const segnale of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(segnale, () => {
    const rimesso = ripristina(IN_CORSO.stato, (f, t) => writeFileSync(f, t));
    IN_CORSO.stato = null;
    if (rimesso) console.error(`\n⚠️  interrotto da ${segnale}: ho rimesso a posto ${rimesso} prima di uscire (AR-523).`);
    process.exit(130);
  });
}

/** Le mutazioni che riguardano almeno uno dei difetti chiesti. Pura: il test la interroga da sola. */
export function filtraPerDifetti(elenco = [], ids = null) {
  if (!ids || !ids.length) return elenco;
  const cercati = new Set(ids.map(String));
  return elenco.filter((m) => difettiDellaMutazione(m).some((d) => cercati.has(d)));
}

// Puntabile altrove per il test (stessa forma di sensori-spenti-check): senza, l'unico modo di
// provare questo strumento sarebbe rompere un fix vero del repo — e una prova che guarda com'è il
// mondo adesso resta verde anche a strumento rimosso.
const MUTANTI = process.env.MUTANTI_FILE || join(AD_ROOT, "cervello/mutanti.json");

// Quanto tempo do a UNA prova prima di considerarla non finita.
//
// Erano due minuti, e due minuti bastano a ogni prova che legge dei file. Non bastano a quelle che
// devono aprire il Pannello: prima che il primo caso parta, `c4-schermo-coda.test.mjs` aspetta fino
// a tre minuti che il server di sviluppo risponda. Con il tetto a due, quella prova veniva ammazzata
// a metà attesa — e da oggi un ammazzato è un ⚪, cioè un cancello rosso per un motivo che col fix
// non c'entra niente. Il tetto deve stare sopra l'attesa più lunga che una prova di casa dichiara.
const TEMPO_MAX = Number(process.env.NON_VACUITA_TIMEOUT_MS || 420_000);

/** Il file da rompere. Assoluto se la mutazione lo dà assoluto (è così che il test usa una fixture). */
const viaDi = (f) => (isAbsolute(String(f)) ? String(f) : join(AD_ROOT, String(f)));

/** Applica la mutazione al testo. Torna null se il pattern non c'è (puntatore rotto o fix cambiato). */
export function muta(testo, cerca, sostituisci) {
  if (!testo.includes(cerca)) return null;
  return testo.split(cerca).join(sostituisci);
}

/**
 * ⚪ LA CORSA SI È TIRATA INDIETRO? — AR-707.
 *
 * Un file di prova di questa casa, quando gli manca lo strumento per guardare (il browser, un
 * servizio in ascolto), NON dice «a posto»: stampa un piano vuoto dichiarato come salto e se ne va
 * con zero. Ma zero è anche il numero di chi ha guardato e non ha trovato niente da ridire. Da fuori
 * i due casi hanno lo stesso numero di uscita e vogliono dire il contrario.
 *
 * Si distinguono solo leggendo cosa la corsa ha DETTO. Due forme, quelle che `node:test` produce:
 *   · `1..0 # SKIP <perché>`                        → si è tirato indietro prima di registrare un caso
 *   · `# pass 0` + `# fail 0` + `# skipped N` (N>0)  → i casi c'erano e sono stati saltati tutti
 */
export function haDichiaratoDiNonGuardare(uscita = "") {
  if (/^\s*1\.\.0\b[^\n]*#\s*skip/im.test(String(uscita))) return true;
  const quanti = (chiave) => {
    const m = String(uscita).match(new RegExp(`^#\\s*${chiave}\\s+(\\d+)\\s*$`, "im"));
    return m ? Number(m[1]) : null;
  };
  const saltati = quanti("skipped") ?? quanti("skip");
  return quanti("pass") === 0 && quanti("fail") === 0 && saltati !== null && saltati > 0;
}

/**
 * Il verdetto su UNA mutazione: rompendo il fix, la prova se n'è accorta?
 *
 * Tre risposte, quelle di casa (AR-322) — e fino al 15/8 erano due, con le altre due travestite:
 *   ✅ ok    · il test è diventato rosso → la prova difende il suo fix
 *   ❌ vacua · il test è rimasto verde col fix rotto → quella prova non prova niente
 *   ⚪ cieco · non ho misurato: la corsa non è mai finita, oppure ha dichiarato di non poter guardare
 *
 * PERCHÉ ESISTE (il conto, misurato il 15/8). Il giudizio era `r.status !== 0`, cioè il solo numero
 * di uscita — e il numero di uscita di una corsa che non è avvenuta non significa niente. Due bugie
 * opposte uscivano dalla stessa riga:
 *
 *  ① **Un ⚪ raccontato come ❌.** In CI non c'è nessun browser, quindi `c4-schermo-coda.test.mjs`
 *     dichiara il salto ed esce 0. Il banco leggeva «zero» e scriveva «AR-613 — la prova NON
 *     dimostra il suo fix: rompendolo il test resta verde». Non era vero: quella prova diventa rossa
 *     eccome, su una macchina che il Pannello lo sa aprire. L'accusa era all'innocente, e mandava a
 *     indagare sul fix invece che sull'ambiente.
 *  ② **Un ⚪ raccontato come ✅**, che è il verso pericoloso. Un test AMMAZZATO (timeout, segnale)
 *     torna `status === null`, e `null !== 0` è vero: il banco lo contava come «è diventato rosso,
 *     la prova morde». Cioè la mutazione più lenta comprava il verde smettendo di rispondere.
 *
 * La radice è una sola e vale oltre questo file: **il codice d'uscita descrive una corsa avvenuta.
 * Prima di leggerlo bisogna sapere se la corsa c'è stata.**
 */
export function verdettoCorsa({ status, signal = null, uscita = "" } = {}) {
  if (status === null || status === undefined) {
    return {
      verdetto: "cieco",
      perche: `il test non è arrivato in fondo (${signal || "ammazzato, o mai partito"}): non ha misurato niente`,
    };
  }
  if (haDichiaratoDiNonGuardare(uscita)) {
    return {
      verdetto: "cieco",
      perche: "il test ha dichiarato di non poter guardare (gli manca lo strumento): esce zero perché si è tirato indietro, non perché col fix rotto va tutto bene",
    };
  }
  if (status !== 0) return { verdetto: "ok", perche: "" };
  return { verdetto: "vacua", perche: "il test resta VERDE col fix rotto" };
}

function main() {
  if (!existsSync(MUTANTI)) {
    console.error("non-vacuita: cervello/mutanti.json assente → non posso misurare");
    process.exit(2);
  }
  let elenco;
  try {
    elenco = JSON.parse(readFileSync(MUTANTI, "utf8")).mutanti || [];
  } catch (e) {
    console.error(`non-vacuita: mutanti.json illeggibile (${e.message}) → non posso misurare`);
    process.exit(2);
  }
  if (LOTTO) elenco = elenco.filter((m) => String(m.lotto) === LOTTO);
  elenco = filtraPerDifetti(elenco, DIFETTI);
  if (!elenco.length) {
    const quale = LOTTO ? ` per il lotto ${LOTTO}` : DIFETTI ? ` per ${DIFETTI.join(", ")}` : "";
    console.error(`non-vacuita: nessuna mutazione${quale} → non posso misurare`);
    process.exit(2);
  }

  const esiti = [];
  for (const m of elenco) {
    const file = viaDi(m.file);
    if (!existsSync(file)) {
      esiti.push({ ...m, verdetto: "cieco", perche: `file assente: ${m.file}` });
      continue;
    }
    const originale = readFileSync(file, "utf8");
    const rotto = muta(originale, m.cerca, m.sostituisci);
    if (rotto === null) {
      // Il pattern non c'è più: o il fix è stato riscritto, o questa mutazione punta al posto
      // sbagliato. In entrambi i casi non ho misurato niente — e dirlo «verde» sarebbe la bugia
      // esatta che questo strumento esiste per impedire.
      esiti.push({ ...m, verdetto: "cieco", perche: "il pezzo da rompere non esiste più: mutazione da aggiornare" });
      continue;
    }
    try {
      IN_CORSO.stato = { file, originale };
      writeFileSync(file, rotto);
      const r = spawnSync("node", [m.test], { cwd: AD_ROOT, encoding: "utf8", timeout: TEMPO_MAX });
      esiti.push({
        ...m,
        ...verdettoCorsa({ status: r.status, signal: r.signal, uscita: `${r.stdout || ""}${r.stderr || ""}` }),
      });
    } finally {
      writeFileSync(file, originale); // sempre, anche se il test esplode
      IN_CORSO.stato = null;
    }
  }

  const vacue = esiti.filter((e) => e.verdetto === "vacua");
  const ciechi = esiti.filter((e) => e.verdetto === "cieco");

  if (JSON_MODE) {
    console.log(JSON.stringify({ ok: vacue.length === 0, esiti }, null, 2));
  } else {
    console.log("🧨 LA PROVA CHE LE PROVE PROVINO\n");
    for (const e of esiti) {
      const segno = e.verdetto === "ok" ? "✅" : e.verdetto === "vacua" ? "❌" : "⚠️ ";
      // Dal 30/7 una mutazione può appartenere a un DIFETTO (rompi il fix, il test deve diventare
      // rosso) oppure a una LEZIONE (rimetti l'errore, il gate deve scattare). Senza questa riga la
      // seconda specie si stampava «undefined —», che è il modo più veloce per far sembrare rotto
      // un pezzo che funziona.
      console.log(`  ${segno} ${e.difetto || e.lezione || "(senza padrone)"} — ${e.nome}`);
      if (e.perche) console.log(`     ${e.perche}`);
    }
    console.log("");
    const misurate = esiti.length - ciechi.length;
    console.log(
      vacue.length
        ? `⛔ ${vacue.length} prova/e NON dimostra il suo fix: rompendolo il test resta verde.`
        : // «tutte e 0 le mutazioni rendono rosso il loro test» è la stessa bugia in piccolo: un ✅
          // per un conto vuoto. Se non ho misurato niente, la riga verde non ci va.
          misurate
          ? `✅ tutte e ${misurate} le mutazioni rendono rosso il loro test.`
          : `⚪ nessuna mutazione è stata misurata: non ho niente da dire su queste prove.`,
    );
    if (ciechi.length) console.log(`⚠️  ${ciechi.length} mutazione/i non ha potuto misurare (vedi sopra).`);
  }

  if (vacue.length) process.exit(1);
  if (ciechi.length) process.exit(2);
  process.exit(0);
}

if (process.argv[1] && process.argv[1].endsWith("non-vacuita.mjs")) main();
