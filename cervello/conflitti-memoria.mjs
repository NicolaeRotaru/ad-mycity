#!/usr/bin/env node
// conflitti-memoria.mjs — CHI RISOLVE I CONFLITTI DELLA MEMORIA, che finora non esisteva.
//
// LA STORIA (22/8 09:20). La sera prima avevamo tolto l'ostacolo che impediva al rebase del server
// di PARTIRE. Il mattino dopo il rebase parte davvero — e si ferma un passo più in là:
//
//     [09:20] ⛔ commit del server non pubblicati: NON allineo — 12 commit restano qui.
//     [09:20]    Causa: il rebase ha trovato conflitti: vanno risolti a mano
//
// «A mano» vuol dire «nessuno», perché il server non ha mani e nessuno entra lì ogni giorno. È la
// stessa malattia della sera prima, in un altro punto: **un'operazione che sa rimandarsi non ha un
// tetto**, quindi rimanda per sempre e da fuori sembra una macchina ferma. Ieri erano le messe da
// parte, oggi sono i conflitti. Dodici commit di memoria fermi, e crescono di uno a ogni giro.
//
// I conflitti però NON sono tutti uguali, ed è qui che si può fare qualcosa di onesto. Sui file di
// memoria la risposta giusta è meccanica, ed è scritta nel mansionario da mesi — l'ho applicata a
// mano tre volte in due giorni, sempre allo stesso modo:
//
//   ① REGISTRI CHE LA MACCHINA RIGENERA (`auto-coscienza/*.json`) → si prende la versione di main.
//      Sono fotografie: la prossima le riscrive comunque. Tenere la copia vecchia è solo rumore.
//   ② FILE NARRATIVI IN CODA (DECISIONI, quaderni, Sala Operativa, briefing) → si tengono ENTRAMBE
//      le parti. Sono append-only: due autori hanno scritto due cose diverse, e sono vere tutte e due.
//   ③ ARCHIVI TENUTI A ID (`apprendimento.json`) → unione per id. Nessuna voce sparisce: è la stessa
//      regola che `memoria-senza-perdite.mjs` fa rispettare in scrittura, applicata alla fusione.
//
// E TUTTO IL RESTO — codice compreso — **non si tocca**. Se fra i conflitti c'è un file che non è in
// queste tre classi, qui non si risolve niente e si lascia il campo com'è: meglio dodici commit
// fermi che una riga di codice risolta a caso da una macchina. È il confine che rende questo
// attrezzo accettabile, e la sua prova più importante è proprio quella che verifica il rifiuto.
//
// Uso: `node cervello/conflitti-memoria.mjs [--applica] [--repo P]`
// Uscita: 0 risolti tutti (o niente da fare) · 1 restano conflitti fuori perimetro · 2 non misurabile.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { percorsiDaGit } from "./percorsi-git.mjs";
// La penna condivisa, non `writeFileSync` crudo: scrive in modo atomico e passa dal freno che
// impedisce a una scrittura di cancellare le voci di un altro. Qui conta il doppio — stiamo
// fondendo memoria di due autori, ed è il momento esatto in cui una perdita passerebbe inosservata.
// Sì, è in tensione con la nota qui sotto sul tenere poche dipendenze: è uno scambio scelto, non una
// distrazione. Il freno anti-perdita vale più dei due moduli in più — e se un modulo manca, adesso
// il copione del server lo DICE invece di scambiarlo per un rifiuto.
import { scriviTestoAtomico } from "./scrivi-json.mjs";
import { specDi } from "./memoria-senza-perdite.mjs";

// La radice si calcola da dove sta QUESTO file, non chiedendola a `git-github.mjs`.
// Il primo tentativo la importava da lì, e `git-github.mjs` tira dentro mezza cartella: sul server,
// dove questo attrezzo gira proprio quando qualcosa è rotto, bastava un modulo mancante per farlo
// morire prima di partire. Misurato: `Cannot find module marketplace-repo.mjs`. Un attrezzo di
// riparazione deve avere il minor numero possibile di ragioni per non accendersi.
const AD_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** I registri che la macchina si riscrive da sola: la copia di main vince, la vecchia è rumore. */
export const RIGENERATI = /^MyCity-Vault\/90-Memoria-AI\/auto-coscienza\/.*\.json$/;

/** I file dove si scrive in fondo e non si riscrive mai: due autori, due righe, tutte e due vere. */
export const APPEND_ONLY = [
  /^MyCity-Vault\/90-Memoria-AI\/DECISIONI\.md$/,
  /^MyCity-Vault\/90-Memoria-AI\/SALA-OPERATIVA\.md$/,
  /^MyCity-Vault\/90-Memoria-AI\/Briefing\//,
  /^MyCity-Vault\/90-Memoria-AI\/Report\//,
  /^memoria-squadra\/.*\.md$/,
];

/**
 * Che tipo di conflitto è. Pura: una prova la esegue su un elenco di nomi, senza git e senza disco.
 * Il valore "fuori-perimetro" NON è un errore: è la risposta giusta per tutto ciò su cui una macchina
 * non deve decidere da sola.
 */
export function classifica(percorso) {
  const p = String(percorso || "");
  // ⚠️ L'ORDINE NON È UN DETTAGLIO, ed è costato una perdita sfiorata.
  // `apprendimento.json` VIVE dentro `auto-coscienza/`, quindi con il controllo dei rigenerati per
  // primo finiva in «prendi la versione di main» — cioè le lezioni scritte dal server cancellate in
  // silenzio, che è esattamente il danno che questo attrezzo esiste per evitare. Gli archivi tenuti
  // a id si guardano PRIMA: sono l'eccezione che sta dentro la cartella dei rigenerabili.
  // L'ha trovato la prova a vuoto, prima che il codice toccasse un repo vero.
  if (specDi(p)) return "archivio-a-id";
  if (RIGENERATI.test(p)) return "rigenerato";
  if (APPEND_ONLY.some((r) => r.test(p))) return "append-only";
  return "fuori-perimetro";
}

/**
 * Fonde due versioni di un file append-only tenendo TUTTO.
 * Non si prova a rimettere in ordine per data: righe uguali si contano una volta sola, e le righe
 * che stanno solo da una parte si aggiungono in fondo nell'ordine in cui erano. L'ordine cronologico
 * dei quaderni lo sistema chi legge; quello che qui non deve succedere è che una riga sparisca.
 */
export function fondiAppendOnly(nostro, loro) {
  const righeNostre = String(nostro ?? "").split("\n");
  const viste = new Set(righeNostre.map((r) => r.trim()).filter(Boolean));
  const aggiunte = String(loro ?? "")
    .split("\n")
    .filter((r) => r.trim() && !viste.has(r.trim()));
  if (!aggiunte.length) return String(nostro ?? "");
  const base = String(nostro ?? "").replace(/\n+$/, "");
  return `${base}\n${aggiunte.join("\n")}\n`;
}

/**
 * Unisce due archivi tenuti a id: nessuna voce sparisce, nessuna si duplica.
 * Vince la versione di chi la porta per prima; l'altra si aggiunge in fondo solo se il suo id non
 * c'è già. È la stessa promessa di `memoria-senza-perdite.mjs`, spostata dal momento della scrittura
 * al momento della fusione.
 */
export function fondiArchivioAId(nostroTesto, loroTesto, spec) {
  const nostro = JSON.parse(nostroTesto);
  const loro = JSON.parse(loroTesto);
  const a = Array.isArray(nostro?.[spec.campo]) ? nostro[spec.campo] : null;
  const b = Array.isArray(loro?.[spec.campo]) ? loro[spec.campo] : null;
  if (!a || !b) throw new Error(`archivio a id malformato: manca il campo ${spec.campo}`);
  const visti = new Set(a.map((v) => v?.[spec.chiave]).filter(Boolean));
  const mancanti = b.filter((v) => v?.[spec.chiave] && !visti.has(v[spec.chiave]));
  nostro[spec.campo] = [...a, ...mancanti];
  return { testo: `${JSON.stringify(nostro, null, 1)}\n`, riaggiunte: mancanti.length };
}

/** I file in conflitto adesso. null se git non risponde: ⚪, non «nessuno». */
export function inConflitto(radice) {
  try {
    return percorsiDaGit(["diff", "--name-only", "--diff-filter=U"], { cwd: radice });
  } catch {
    return null;
  }
}

/**
 * Il contenuto di un lato del conflitto.
 *
 * ⚠️ DURANTE UN REBASE I LATI SONO ROVESCIATI rispetto all'intuizione, e questa riga l'ho scritta
 * sbagliata al primo colpo. Chiesto a git su un repo vero invece di dedurlo:
 *
 *     stadio 2 (:2:) = MAIN, cioè il ramo su cui si sta riapplicando
 *     stadio 3 (:3:) = il commit DEL SERVER, quello che si sta rimettendo sopra
 *
 * Avevo scritto «prendi lo stadio 3» per «prendi la versione di main»: avrebbe fatto l'opposto di
 * quello che dice il suo commento. È la stessa trappola che il repo ha già pagato una volta
 * (`rebase-che-non-parte.test.mjs`: «il codice diceva teniamo la base e teneva il ramo»), e la
 * lezione è che su questa domanda si chiede a git, non a sé stessi.
 */
const STADIO_MAIN = 2;
const STADIO_SERVER = 3;

function lato(radice, stadio, percorso) {
  const r = spawnSync("git", ["show", `:${stadio}:${percorso}`], {
    cwd: radice,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return r.status === 0 && typeof r.stdout === "string" ? r.stdout : null;
}

/**
 * Il piano: cosa si farebbe, senza farlo.
 * Sta separato dall'esecuzione apposta — così `--applica` e il controllo a vuoto vedono la STESSA
 * decisione, e una prova può leggere il piano senza toccare un repo.
 */
export function piano(radice, file) {
  return file.map((f) => ({ file: f, come: classifica(f) }));
}

function risolviUno(radice, f, come) {
  if (come === "rigenerato") {
    // la versione di MAIN: è una fotografia che la macchina rifà comunque, e quella pubblicata è la
    // più recente. Lo stadio è il 2, verificato su git — vedi la nota sopra.
    const testo = lato(radice, STADIO_MAIN, f);
    if (testo === null) return false;
    scriviTestoAtomico(join(radice, f), testo);
    return true;
  }
  const daMain = lato(radice, STADIO_MAIN, f);
  const dalServer = lato(radice, STADIO_SERVER, f);
  if (daMain === null || dalServer === null) return false;
  if (come === "append-only") {
    // main prima, il server dopo: le due parti si tengono entrambe, l'ordine dice solo chi apre.
    scriviTestoAtomico(join(radice, f), fondiAppendOnly(daMain, dalServer));
    return true;
  }
  if (come === "archivio-a-id") {
    const spec = specDi(f);
    const { testo } = fondiArchivioAId(daMain, dalServer, spec);
    scriviTestoAtomico(join(radice, f), testo);
    return true;
  }
  return false;
}

export function risolvi(radice, { applica = false } = {}) {
  const file = inConflitto(radice);
  if (file === null) return { esito: "cieco", motivo: "git non ha detto quali file sono in conflitto" };
  if (!file.length) return { esito: "niente-da-fare", risolti: [], fuori: [] };

  const p = piano(radice, file);
  const fuori = p.filter((x) => x.come === "fuori-perimetro").map((x) => x.file);
  // ⛔ IL CONFINE. Basta UN file fuori perimetro e non si tocca niente, nemmeno gli altri: una
  // risoluzione a metà lascia il rebase in uno stato che nessuno ha scelto. O tutto o niente.
  if (fuori.length) return { esito: "fuori-perimetro", fuori, risolti: [] };
  if (!applica) return { esito: "risolvibile", risolti: p.map((x) => x.file), fuori: [], piano: p };

  const risolti = [];
  for (const { file: f, come } of p) {
    if (!risolviUno(radice, f, come)) return { esito: "non-riuscito", file: f, come, risolti };
    const r = spawnSync("git", ["add", "--", f], { cwd: radice, encoding: "utf8" });
    if (r.status !== 0) return { esito: "non-riuscito", file: f, come, risolti };
    risolti.push({ file: f, come });
  }
  return { esito: "risolti", risolti, fuori: [] };
}

function main() {
  const argv = process.argv.slice(2);
  const APPLICA = argv.includes("--applica");
  const i = argv.indexOf("--repo");
  const radice = i >= 0 && argv[i + 1] ? argv[i + 1] : AD_ROOT;

  const r = risolvi(radice, { applica: APPLICA });
  if (r.esito === "cieco") {
    console.error(`⚪ ${r.motivo}`);
    process.exit(2);
  }
  if (r.esito === "niente-da-fare") {
    console.log("nessun conflitto aperto");
    process.exit(0);
  }
  if (r.esito === "fuori-perimetro") {
    console.error(`⛔ conflitti fuori dal perimetro della memoria: ${r.fuori.join(", ")}`);
    console.error("   Qui non decido io: vanno guardati da una persona. Nessun file è stato toccato.");
    process.exit(1);
  }
  if (r.esito === "non-riuscito") {
    console.error(`⛔ non sono riuscita a risolvere ${r.file} (${r.come}): mi fermo senza inventare.`);
    process.exit(1);
  }
  if (r.esito === "risolvibile") {
    console.log(`risolvibili tutti e ${r.risolti.length}:`);
    for (const x of r.piano) console.log(`  · ${x.file} → ${x.come}`);
    process.exit(0);
  }
  console.log(`✅ risolti ${r.risolti.length} conflitti di memoria`);
  for (const x of r.risolti) console.log(`  · ${x.file} → ${x.come}`);
  process.exit(0);
}

if (process.argv[1] && process.argv[1].endsWith("conflitti-memoria.mjs")) main();
