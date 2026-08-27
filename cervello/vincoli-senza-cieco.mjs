#!/usr/bin/env node
// 🚦 I VINCOLI CHE NON SANNO DIRE «NON HO POTUTO MISURARE» — AR-843.
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE
// ─────────────────────────────────────────────────────────────────────────────
// Il contratto dei guardiani ha tre risposte: 0 passato · 1 bocciato · **2 cieco**. La terza è la
// più importante e la più facile da perdere: «non ho potuto misurare» NON è «sei bocciato», e
// tradurla nel testo di dominio significa raccontare al motore una diagnosi che nessuno ha fatto.
// Un vincolo sbagliato non viene ignorato: viene seguito.
//
// In casa la funzione che lo rispetta esiste da AR-322 (`vincolo_da_rc` in `giro-esito.sh`). Ma
// `giro.sh` è cresciuto per stratificazione, e 21 blocchi si compongono il testo a mano — scritti
// prima della cura, o dopo senza saperlo. AR-842 era uno di quelli, ed era VIVO: il guardiano
// dell'allocazione esce 2 sulla storia git troncata, e il motore si sentiva dire che un negozio non
// confermato stava accumulando asset pesanti. Nessuno aveva guardato.
//
// ─────────────────────────────────────────────────────────────────────────────
// COSA CONTA, E COSA **NON** CONTA
// ─────────────────────────────────────────────────────────────────────────────
// Conta un caso VIVO quando tutte e tre le cose sono vere insieme:
//   ① il vincolo si compone a mano (non passa da `vincolo_da_rc`);
//   ② il guardiano che nomina dichiara un'uscita 2 nel suo sorgente;
//   ③ nessuna riga di QUEL guardiano, in `giro.sh`, scrive a mano il caso del cieco.
//
// Non conta — e va detto, perché è il limite di questo strumento:
//   · un blocco che nomina il guardiano solo in un commento e non nel testo del vincolo: non lo vedo;
//   · un `process.exit(2)` che il comando lanciato dal giro non può RAGGIUNGERE (un sotto-comando
//     diverso, per dire). Qui conto la dichiarazione, non la raggiungibilità: sovrastimo, e lo dico.
//     Sovrastimare è il verso giusto per un contatore che deve scendere.
//
// 🟢 Sola lettura: legge `giro.sh` e i sorgenti dei guardiani. Non scrive niente.
//
// Prova: node cervello/test/un-vincolo-che-non-sa-dire-non-lo-so.test.mjs

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = join(QUI, "..");

/**
 * Le parole con cui, in `giro.sh`, un blocco dice a mano «il guardiano non ha potuto misurare».
 *
 * `CIECO` in maiuscolo è la parola di casa per questo caso, e compare nel testo del vincolo — non in
 * un commento — proprio perché è quello che il motore deve leggere.
 */
export const SEGNI_DEL_CIECO = [/\bCIECO\b/, /non ha potuto misurare/i, /non è riuscito a misurare/i, /non so quanto/i];

/**
 * Il blocco confronta un codice d'uscita col 2? È il segno STRUTTURALE del ramo del cieco, e vale
 * più delle parole: un `case` con un ramo `2)` o un `[ "$rc" = 2 ]` è una biforcazione vera.
 */
export const RAMO_DEL_DUE = [/^\s*2\)/, /-eq\s+2\b/, /=\s*"?2"?\s*\]/, /"\$\{?[A-Za-z_]+_rc\}?"\s*=\s*"?2/];

/** Questo testo di vincolo parla del caso «non ho misurato»? */
export function parlaDelCieco(testo) {
  const t = String(testo ?? "");
  return SEGNI_DEL_CIECO.some((r) => r.test(t));
}

/**
 * Il guardiano che governa questo vincolo, cercato nell'INVOCAZIONE sopra e non nel testo.
 *
 * Quattro vincoli non nominano nessuno nel loro testo perché lo prendono dall'uscita del comando
 * (`X_VINCOLO="$(printf … | head -1)"`). Fermarsi lì li lasciava ⚪, «non lo so» — che è
 * esattamente la risposta che questo file esiste per non accettare da nessuno, e accettarla da sé
 * sarebbe la stessa malattia commessa dentro la cura.
 */
export function guardianoDallInvocazione(righe, indice, finestra = 14) {
  const da = Math.max(0, indice - finestra);
  for (let i = indice - 1; i >= da; i--) {
    const m = /node\s+"?\$\{?SCRIPT_DIR\}?\/([a-z0-9][a-z0-9-]*\.mjs)/.exec(righe[i]);
    if (m) return m[1];
  }
  return null;
}

/**
 * Questo vincolo è governato dal codice d'uscita di un guardiano?
 *
 * Non tutti lo sono, e la differenza conta: `CAL_VINCOLO` scatta su un CONTEGGIO («zero voci
 * strutturate»), non su un rc. Nomina `calibrazione.mjs` nel testo solo perché dice all'AI quale
 * comando chiamare — e senza questo controllo il contatore lo accusava di non sapere dire «non lo
 * so», che per lui non vuol dire niente. Un contatore che accusa gli innocenti si impara a
 * ignorare, ed è il modo in cui muore un freno.
 *
 * Il segno: nelle righe sopra qualcuno ha raccolto un `$?` in una variabile.
 */
export function governatoDaUnRc(righe, indice, finestra = 14) {
  const da = Math.max(0, indice - finestra);
  for (let i = da; i < indice; i++) {
    if (/[A-Za-z_]+_rc=\$\?/.test(righe[i])) return true;
  }
  return false;
}

/**
 * Attorno a questa riga c'è una biforcazione sul 2?
 *
 * Il vicinato è una finestra, non una struttura: bash non si parsa con una regex, e fingere di
 * farlo sarebbe peggio. Quindi questo è un INDIZIO, dichiarato tale — vedi la nota sui limiti in
 * cima al file. Sbaglia nei due versi, e per questo il numero è un tetto che scende, non una verità.
 */
export function ramoDelDueVicino(righe, indice, finestra = 12) {
  const da = Math.max(0, indice - finestra);
  const a = Math.min(righe.length, indice + finestra + 1);
  for (let i = da; i < a; i++) {
    const r = righe[i];
    if (/^\s*#/.test(r)) continue;   // un commento che nomina il 2 non biforca niente
    if (RAMO_DEL_DUE.some((x) => x.test(r))) return true;
  }
  return false;
}

/**
 * Le assegnazioni di vincolo scritte a mano dentro uno script di shell.
 *
 * Torna una voce per riga: il numero, il nome della variabile, il guardiano nominato nel testo (o
 * `null`), e se quella riga parla del cieco.
 */
export function assegnazioniAMano(sorgente) {
  const fuori = [];
  const righe = String(sorgente ?? "").split("\n");
  righe.forEach((riga, i) => {
    const m = /^\s*([A-Z_]+_VINCOLO)="(.*)$/.exec(riga);
    if (!m) return;
    const [, nome, resto] = m;
    if (riga.includes("vincolo_da_rc")) return;   // passa dal contratto: a posto
    // `X_VINCOLO=""` — anche con un commento in coda — è un'inizializzazione, non un vincolo. Senza
    // questa riga il conto saliva da 8 a 46: quasi tutte le dichiarazioni in cima al file hanno un
    // commento accanto, e finivano dentro il conto come vincoli muti.
    if (/^"\s*(#.*)?$/.test(resto)) return;
    // Governato da un conteggio e non da un rc: il contratto dei guardiani non lo riguarda.
    if (!governatoDaUnRc(righe, i)) return;
    const g = /([a-z0-9][a-z0-9-]*\.mjs)/.exec(resto);
    fuori.push({
      riga: i + 1,
      nome,
      guardiano: g ? g[1] : guardianoDallInvocazione(righe, i),
      cieco: parlaDelCieco(resto) || ramoDelDueVicino(righe, i),
    });
  });
  return fuori;
}

/** Questo guardiano dichiara un'uscita 2 nel suo sorgente? */
export function dichiaraUscita2(sorgente) {
  return /process\.exit\(\s*2\s*\)/.test(String(sorgente ?? ""));
}

/**
 * IL VERDETTO. Raggruppa per guardiano: se ANCHE UNA SOLA riga di quel guardiano scrive a mano il
 * caso del cieco, il guardiano è coperto — è la forma che usano `prove-oneste` e `gate-veri`, due
 * righe vicine, una per il bocciato e una per il cieco, ed è corretta.
 *
 * `leggiGuardiano` riceve il nome del file e torna il sorgente, oppure `null` se non esiste.
 */
export function vincoliVivi(sorgenteGiro, leggiGuardiano) {
  const perGuardiano = new Map();
  for (const a of assegnazioniAMano(sorgenteGiro)) {
    if (!a.guardiano) continue;   // non nomina nessuno: non so giudicarlo, e lo dico a parte
    const v = perGuardiano.get(a.guardiano) ?? { righe: [], cieco: false };
    v.righe.push(a.riga);
    v.cieco = v.cieco || a.cieco;
    perGuardiano.set(a.guardiano, v);
  }
  const vivi = [];
  const coperti = [];
  const senzaUscita2 = [];
  const nonTrovati = [];
  for (const [g, v] of perGuardiano) {
    const src = leggiGuardiano(g);
    if (src === null || src === undefined) { nonTrovati.push({ guardiano: g, ...v }); continue; }
    if (!dichiaraUscita2(src)) { senzaUscita2.push({ guardiano: g, ...v }); continue; }
    if (v.cieco) { coperti.push({ guardiano: g, ...v }); continue; }
    vivi.push({ guardiano: g, ...v });
  }
  const muti = assegnazioniAMano(sorgenteGiro).filter((a) => !a.guardiano);
  return { vivi, coperti, senzaUscita2, nonTrovati, muti };
}

/** 0 sotto il tetto · 1 sopra · 2 se il tetto non si è potuto leggere (cieco: non è un verde). */
export function verdetto({ quanti = 0, tetto = null } = {}) {
  if (tetto === null || tetto === undefined || Number.isNaN(Number(tetto))) {
    return { rc: 2, detto: `non ho potuto leggere il tetto: ${quanti} vincoli non sanno dire «non lo so», ma non so se è peggio di ieri` };
  }
  if (quanti > Number(tetto)) {
    return {
      rc: 1,
      detto:
        `vincoli che non sanno dire «non ho potuto misurare» saliti da ${tetto} a ${quanti}: un guardiano cieco ` +
        `racconterebbe al motore una diagnosi che nessuno ha fatto, e il motore la seguirebbe (AR-843)`,
    };
  }
  return { rc: 0, detto: `${quanti} vincoli non sanno dire «non lo so» (tetto ${tetto}): debito dichiarato, non allargato` };
}

// ─────────────────────────── il CLI ───────────────────────────

if (process.argv[1] && process.argv[1].endsWith("vincoli-senza-cieco.mjs")) {
  const fileGiro = process.env.GIRO_FILE || join(RADICE, "cervello/giro.sh");
  const fileTetti = process.env.TETTI_FILE || join(RADICE, "cervello/tetti-lotto.json");

  if (!existsSync(fileGiro)) {
    console.error(`⚠️  non trovo ${fileGiro}: non posso contare niente — questo NON è un verde.`);
    process.exit(2);
  }
  const giro = readFileSync(fileGiro, "utf8");
  const leggi = (g) => {
    const p = join(RADICE, "cervello", g);
    return existsSync(p) ? readFileSync(p, "utf8") : null;
  };
  const r = vincoliVivi(giro, leggi);

  let tetto = null;
  try {
    const t = JSON.parse(readFileSync(fileTetti, "utf8"));
    tetto = Object.hasOwn(t, "vincoli_senza_cieco") ? Number(t.vincoli_senza_cieco) : null;
  } catch {
    tetto = null;
  }
  const v = verdetto({ quanti: r.vivi.length, tetto });

  console.log("🚦 VINCOLI CHE NON SANNO DIRE «NON HO POTUTO MISURARE» — AR-843\n");
  for (const x of r.vivi) console.log(`  🔴 ${x.guardiano} (righe ${x.righe.join(", ")}) — dichiara un'uscita 2 e il vincolo non la prevede`);
  if (r.coperti.length) console.log(`\n  🟢 ${r.coperti.length} guardiani scrivono a mano anche il caso del cieco: ${r.coperti.map((x) => x.guardiano).join(", ")}`);
  if (r.senzaUscita2.length) console.log(`  🟢 ${r.senzaUscita2.length} non dichiarano nessuna uscita 2`);
  if (r.muti.length) console.log(`  ⚪ ${r.muti.length} vincoli non nominano nessun guardiano nel testo: non li so giudicare (${r.muti.map((m) => m.nome).join(", ")})`);
  console.log(`\n${v.rc === 0 ? "✅" : v.rc === 1 ? "⛔" : "⚠️"} ${v.detto}`);
  if (v.rc === 1) {
    console.log("\n   Si ripara facendo passare il blocco da `vincolo_da_rc` (cervello/giro-esito.sh), che sul 2");
    console.log("   dice «ripara lo strumento, non fidarti del verde che non c'è» invece del testo di dominio.");
    console.log("   Chi ne cura uno abbassi il tetto: scende e non risale.");
  }
  process.exit(v.rc);
}
