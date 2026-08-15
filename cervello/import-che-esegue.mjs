#!/usr/bin/env node
// 🚪 IMPORTARE UN MODULO NON DEVE ESEGUIRLO — il guardiano di AR-445.
//
// 🟢 Sola lettura: legge i sorgenti di `cervello/` e conta. Non importa niente e non scrive niente
//    (importare per misurare sarebbe cadere nel difetto mentre lo si misura).
//
// IL DIFETTO CHE CHIUDE. Gli script del cervello sono insieme LIBRERIA (esportano funzioni) e
// PROGRAMMA (all'ultima riga chiamano `main()`, o scrivono, o escono). Senza la guardia
// dell'entrypoint — `import.meta.url === pathToFileURL(process.argv[1]).href` — chi importa il
// modulo per provarne UNA funzione fa girare il programma intero. È successo davvero:
// `sonda-volano.mjs` ha riscritto auto-radiografia.json e storico-salute.json (~3100 righe) durante
// il lotto 35, e `cantiere-prove.mjs` ha riscritto il proprio referto durante il 36. Tutt'e due oggi
// la guardia ce l'hanno: la scheda li nomina, il codice li ha già curati. La CLASSE no.
//
// L'effetto secondario è peggiore del primo, ed è il motivo per cui questo guardiano vale più della
// somma dei suoi rossi: siccome importare costa caro, si smette di scrivere test che importano — e
// la logica resta non provata proprio dove servirebbe. Un difetto che si difende togliendo la voglia
// di andarlo a guardare.
//
// LA CAUSA DI SISTEMA: la guardia è una CONVENZIONE che ognuno applica se se la ricorda. Nessun
// guardiano la pretendeva. Adesso sì, con un tetto che scende e non risale — la stessa forma con cui
// questa casa cura le altre malattie, e la stessa regola del cancello (`tetto-guardiano.mjs`): il
// debito ereditato si conta, ciò che il lotto tocca ADESSO è blocco duro.
//
// ⚠️ CIÒ CHE NON PUÒ VEDERE, detto qui e non nascosto. Legge il TESTO e cerca le righe di programma
// in colonna zero: `main()`, `await main()`, `main().catch(…)`, una scrittura o un `process.exit`
// fuori da ogni funzione. Un modulo che agisce in modo più contorto — dentro un `const x = faiTutto()`,
// o da un import a catena — gli sfugge. È una misura per DIFETTO: il numero vero è ≥ quello che
// stampa, mai ≤. Quando dice «cinquantasette», cinquantasette ci sono di sicuro; se dicesse «zero»
// non avrebbe dimostrato che non ce ne siano.
//
// Uso:
//   node cervello/import-che-esegue.mjs           # verdetto + elenco
//   node cervello/import-che-esegue.mjs --json    # per gli script
//   node cervello/import-che-esegue.mjs --elenco  # solo i nomi, uno per riga
//
// Uscita (contratto guardiani, AR-322):
//   0 = sotto il tetto, e niente di nuovo da questo lotto
//   1 = il debito si è allargato, oppure un modulo che il lotto tocca è malato
//   2 = non ho potuto misurare → cieco, non «verde»

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { AD_ROOT } from "./git-github.mjs";
import { elencaFile } from "./perimetro.mjs";
import { perimetroDichiarato, verdettoConTetto } from "./tetto-guardiano.mjs";
import { percorsiDaGit } from "./percorsi-git.mjs";

const JSON_MODE = process.argv.includes("--json");
const ELENCO = process.argv.includes("--elenco");
const CARTELLA = "cervello";
const TETTI = join(AD_ROOT, "cervello/tetti-lotto.json");

/**
 * Il perimetro NON si scrive a mano: lo deriva `elencaFile` dal disco vero, ricorsivamente.
 *
 * La prima versione di questo file aveva una regex sui percorsi, e la mano me l'ha fermata citando
 * la malattia giusta — `perimetro-dedotto-non-misurato`, il difetto del lotto 33: dieci bloccanti,
 * una radice sola. Aveva ragione due volte di fila. Un recinto scritto guardando i casi di oggi
 * nasce verde e resta verde, perché fuori dal recinto non cerca niente e un verde non fa domande.
 *
 * Le due esclusioni sono DICHIARATE, col perché — che è l'uscita legittima: un'esenzione si discute,
 * un'omissione no perché nessuno la vede.
 */
export const ESCLUSI = {
  test: "i file di cervello/test/ SONO programmi: devono eseguire al caricamento, è il loro mestiere",
  vps: "script di sistema (shell e unit systemd), non moduli che qualcuno possa importare",
};

/**
 * IL TETTO ALLA NASCITA, misurato il 13/8/2026 su questo repo: 116 moduli malati su 270.
 *
 * IL NUMERO CHE HO SBAGLIATO, e vale la pena tenerlo scritto. La prima misura diceva 60 su 192,
 * perché guardavo `cervello/*.mjs` al primo livello — il recinto scritto a mano che la mano mi ha
 * fermato due volte. Derivando il perimetro dal disco, con `elencaFile` ricorsivo, sono comparse le
 * sottocartelle: `capacita/` da sola porta quindici programmi che chiamano `main()` al caricamento.
 * Cioè il recinto scritto non nascondeva un caso, ne nascondeva quasi la metà — ed è esattamente la
 * forma con cui un guardiano nasce verde e resta verde.
 *
 * Sta qui e non in `tetti-lotto.json` per una ragione dichiarata: quel file è di un'altra corsia
 * mentre scrivo, e un numero conteso non vuol dire niente. Se un giorno ci finisce (chiave
 * `import_che_esegue`) vince quello — `leggiTetto` lo legge — e questa costante resta a ricordare
 * dov'era il debito la prima volta che qualcuno l'ha misurato per davvero.
 *
 * SCENDE E NON RISALE. Alzarlo è il modo in cui una malattia si dichiara guarita restando viva.
 */
export const TETTO_ALLA_NASCITA = 116;

/** Il modulo dichiara di essere un programma solo quando lo si lancia? */
export function haGuardia(sorgente = "") {
  return /import\.meta\.url\s*===|process\.argv\[1\]\s*&&|require\.main\s*===/.test(String(sorgente));
}

/**
 * Le righe che ESEGUONO al solo caricamento: colonna zero, cioè fuori da ogni funzione.
 *
 * Il rientro è il segnale: una riga in colonna zero dentro un file di moduli è codice che parte
 * appena `import` risolve. Dentro una funzione sarebbe rientrata.
 */
export function righeCheAgiscono(sorgente = "") {
  const fuori = [];
  for (const r of String(sorgente).split("\n")) {
    if (/^(await\s+)?(writeFileSync|appendFileSync|mkdirSync|rmSync|writeFile|process\.exit|main\(\))/.test(r)) {
      fuori.push(r.trim().slice(0, 90));
    }
  }
  return fuori;
}

/** I moduli che eseguono al caricamento senza dire di essere programmi. */
export function moduliMalati(moduli = []) {
  const fuori = [];
  for (const m of moduli) {
    if (!m || typeof m.sorgente !== "string") continue;
    if (haGuardia(m.sorgente)) continue;
    const righe = righeCheAgiscono(m.sorgente);
    if (righe.length) fuori.push({ nome: m.nome, righe });
  }
  return fuori.sort((a, b) => a.nome.localeCompare(b.nome));
}

/**
 * Quali dei moduli MISURATI compaiono fra i file che git dice cambiati — il perimetro del blocco duro.
 *
 * Anche qui niente recinto scritto: si confronta con la lista che ho appena letto sul disco, non con
 * una sua descrizione. Pura: riceve gli elenchi che git ha già dato, così la prova può metterla in
 * ogni forma senza costruire un repo.
 */
export function malatiToccati(malati = [], fileCambiati = null, moduliMisurati = [], dichiarato = null) {
  if (fileCambiati === null) return null; // git muto → non attribuisco, e non assolvo
  // AR-678 — su un tronco condiviso da più corsie, git risponde a «cosa è cambiato nell'albero», non
  // a «cosa ho toccato io»: senza una dichiarazione ogni lotto si vede attribuito il lavoro di tutti.
  // Con `LOTTO_PERIMETRO` il perimetro è quello dichiarato; senza, resta la sovrastima di git — che
  // blocca di più, mai di meno, ed è il verso giusto in cui sbagliare.
  const solo = dichiarato ? new Set(dichiarato) : null;
  const misurati = new Set(moduliMisurati);
  const cambiati = new Set();
  for (const f of fileCambiati) {
    const p = String(f || "").trim();
    if (!p) continue;
    if (solo && !solo.has(p)) continue;
    const rel = p.startsWith(`${CARTELLA}/`) ? p.slice(CARTELLA.length + 1) : p;
    if (misurati.has(rel)) cambiati.add(rel);
  }
  return malati.map((m) => m.nome).filter((n) => cambiati.has(n));
}

function leggiTetto() {
  try {
    const t = JSON.parse(readFileSync(TETTI, "utf8"));
    if (Number.isInteger(t.import_che_esegue)) return t.import_che_esegue;
  } catch {
    /* il file non c'è o non si legge: vale la costante, che è comunque un numero fermo */
  }
  return TETTO_ALLA_NASCITA;
}

/**
 * I file che questo lotto ha cambiato, secondo git; `null` se git non ha saputo rispondere.
 *
 * ⚠️ L'ELENCO DI PERCORSI SI CHIEDE ALLA PORTA, non a git a mano. Qui c'era uno `spawnSync` scritto
 * in casa che faceva `stdout.split("\n")`: senza il `-z` che mette `percorsiDaGit`, un nome con un
 * byte non-ASCII torna citato e in ottali — e nel vault italiano sono 26 file. Un file MIO letto col
 * nome sbagliato non corrisponde a nessun modulo misurato, quindi risulta non-mio: il blocco duro
 * smette di riconoscerlo, in silenzio. È la malattia censita `git-letto-senza-tetto`, e la cura non
 * è allineare i chiamanti uno per uno: è che l'esecutore sia uno solo.
 */
function fileCambiati() {
  const g = (args) => {
    try {
      return percorsiDaGit(args, { cwd: AD_ROOT });
    } catch {
      return null; // git non ha risposto → non attribuisco, e chi chiama non assolve
    }
  };
  const cambiati = g(["diff", "--name-only", "HEAD"]);
  const nuovi = g(["ls-files", "--others", "--exclude-standard"]);
  if (cambiati === null || nuovi === null) return null;
  return [...cambiati, ...nuovi];
}

function main() {
  const radice = join(AD_ROOT, CARTELLA);
  const relativi = elencaFile(radice, { estensioni: [".mjs"], escludi: Object.keys(ESCLUSI) });
  if (relativi === null) {
    console.error(`⚪ non ho potuto leggere ${CARTELLA}: cieco, non verde`);
    process.exit(2);
  }
  const moduli = [];
  const illeggibili = [];
  for (const nome of relativi) {
    try {
      moduli.push({ nome, sorgente: readFileSync(join(radice, nome), "utf8") });
    } catch (e) {
      illeggibili.push(`${nome}: ${e.message}`);
    }
  }
  if (!moduli.length) {
    console.error("⚪ nessun modulo leggibile → cieco, non verde");
    process.exit(2);
  }

  const malati = moduliMalati(moduli);
  const tetto = leggiTetto();
  const miei = malatiToccati(
    malati,
    fileCambiati(),
    moduli.map((m) => m.nome),
    perimetroDichiarato(process.env.LOTTO_PERIMETRO),
  );

  if (ELENCO) {
    for (const m of malati) console.log(m.nome);
    process.exit(malati.length > tetto ? 1 : 0);
  }

  // La stessa regola del cancello del lotto (AR-437): il tetto è del CANCELLO, non della misura, e
  // un guardiano nuovo ci si aggancia invece di reinventarsela. Questa riga è la prova che quella
  // cura non era un caso singolo ma una classe.
  const v = verdettoConTetto({ codice: malati.length ? 1 : 0, quanti: malati.length, tetto, delLotto: miei });

  if (JSON_MODE) {
    console.log(
      // `su` non è un ornamento: è il DENOMINATORE, cioè quanti moduli ho davvero guardato. Senza,
      // un recinto che ne nasconde metà stampa lo stesso un numero credibile — «116 malati» va bene
      // su 270 e va bene su 140, e la differenza è tutto. La prova lo confronta con la sua misura.
      JSON.stringify({ ok: v.esito !== "violazione", esito: v, quanti: malati.length, su: moduli.length, tetto, malati, illeggibili, esclusi: ESCLUSI }, null, 2),
    );
    process.exit(v.esito === "violazione" ? 1 : 0);
  }

  console.log(`🚪 IMPORTARE NON DEVE ESEGUIRE — ${malati.length} moduli su ${moduli.length} (tetto ${tetto})\n`);
  for (const m of illeggibili) console.log(`  ⚠️  non leggibile: ${m}`);
  for (const m of malati.slice(0, 15)) console.log(`  · ${m.nome} → ${m.righe[0]}`);
  if (malati.length > 15) console.log(`  · …e altri ${malati.length - 15}`);
  console.log("");
  if (v.esito === "violazione") {
    console.log(`❌ ${v.motivo}`);
    console.log("   La cura è una riga sola in fondo al file, e non cambia niente di come gira:");
    console.log("   if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();");
    process.exit(1);
  }
  console.log(`✅ ${v.motivo || "nessun modulo esegue al caricamento senza dirlo"}`);
  console.log(`   ⚠️ misura per DIFETTO: le forme più contorte non le vedo — «${malati.length}» è un minimo, non un totale.`);
  process.exit(0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
