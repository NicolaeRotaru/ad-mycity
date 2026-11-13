// 🍰 LE FETTE DELLA CI — la suite e le mutazioni divise fra più macchine, e ricucite in un verdetto.
//
// PERCHÉ ESISTE. Nicola, 13/11 02:15: «fai in modo che le CI della macchina non superino i 2/3
// minuti di controllo». Misurato sulla richiesta 944 (corsa 43340266076): il cancello del lotto
// girava in UN lavoro solo, 10 minuti; dentro, la suite del cervello da sola ne prendeva 6 (364 s)
// e le mutazioni del lotto quasi 2 (104 s). Misurata qui il 13/11 con il tempo di ogni prova:
// 465 prove in Node e 30 in bash, 409 s in tutto su 4 processori. Di quei 409, 278 sono 73 prove
// che girano UNA ALLA VOLTA perché scrivono sul dato vivo o accendono un browser: su una macchina
// sola non si possono mettere in parallelo, e nessun numero di corsie lo cambia.
//
// LA CURA: più macchine, non più corsie. Su runner separati quelle 73 prove non si pestano — ogni
// runner ha il suo disco — quindi la fila si divide fra le fette. Il conto del lavoro resta
// identico: ogni prova gira UNA volta, su UNA fetta, con le stesse regole di dentro (corsie, fila,
// conferma dei rossi). Cambia solo dove.
//
// LA REGOLA CHE NON SI TOCCA: una fetta che non consegna non è una fetta verde. Chi ricuce ricava
// da sé l'elenco di ciò che DOVEVA girare — le prove della cartella, le mutazioni del perimetro —
// e lo confronta con ciò che è arrivato. Un buco, un doppione o una fetta di un altro commit
// escono ⚪ (2), cioè bloccano come il rosso: un cancello che lascia passare ciò che non ha saputo
// misurare è la bugia che questa casa passa il tempo a curare.
//
// Funzioni pure: le prove le interrogano senza far partire niente.
// Prova: node --test cervello/test/fette-della-ci.test.mjs

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/** Il tetto delle fette: oltre, è un refuso o un attacco, non una scelta. */
export const FETTE_MASSIME = 64;

/**
 * Quante corsie ha la macchina su cui si pesano le prove libere. È il divisore del peso, NON il
 * numero di corsie con cui si girerà: deve essere una costante, perché ogni fetta deve fare LA
 * STESSA divisione — se dipendesse dai processori di chi divide, due runner diversi
 * assegnerebbero la stessa prova a due fette diverse (o a nessuna).
 */
export const CORSIE_DI_PESO = 4;

/** Una prova mai cronometrata pesa questo: il valore tipico di una prova in fila, non zero. */
export const PESO_IGNOTO_MS = 5_000;

/**
 * Legge «i/N». Torna `null` se la fetta non è chiesta, `{ i, n }` se è leggibile, `{ errore }`
 * se è chiesta e illeggibile — chiesta e non capita NON vuol dire «tutto»: è lo stesso vizio che
 * `--solo` in test-cervello.mjs rifiuta dal 28/8.
 */
export function leggiFetta(testo) {
  if (testo === undefined || testo === null) return null;
  const m = String(testo).trim().match(/^(\d+)\/(\d+)$/);
  if (!m) return { errore: `fetta «${testo}» illeggibile: la forma è i/N, per esempio 2/6` };
  const i = Number(m[1]);
  const n = Number(m[2]);
  if (n < 1 || n > FETTE_MASSIME) return { errore: `fetta «${testo}»: N deve stare fra 1 e ${FETTE_MASSIME}` };
  if (i > n) return { errore: `fetta «${testo}»: i deve stare fra 1 e ${n}` }; // GUASTO FINTO 13/11: tolto «i < 1», da togliere
  return { i, n };
}

/** Il valore di un'opzione nelle due forme di casa: `--x valore` e `--x=valore`. `undefined` = assente. */
export function valoreOpzione(argv = [], nome) {
  const attaccato = argv.find((a) => a.startsWith(`${nome}=`));
  if (attaccato) return attaccato.slice(nome.length + 1);
  const i = argv.indexOf(nome);
  if (i < 0) return undefined;
  const v = argv[i + 1];
  return v === undefined || v.startsWith("--") ? "" : v;
}

/**
 * Quanto pesa una prova sull'orologio della SUA fetta. Una prova in fila occupa la macchina da
 * sola, quindi pesa tutto il suo tempo; una libera divide la macchina con altre tre, quindi ne pesa
 * un quarto. Senza questa distinzione le 73 prove in fila finirebbero ammucchiate: pesano come le
 * libere, ma costano quattro volte tanto all'orologio.
 */
export function pesoProva({ ms = null, inFila = false } = {}) {
  const tempo = Number.isFinite(ms) && ms > 0 ? ms : PESO_IGNOTO_MS;
  return inFila ? tempo : tempo / CORSIE_DI_PESO;
}

/**
 * Divide le voci in N fette di peso simile: la più pesante va alla fetta più scarica, poi la
 * seconda, e così via (il metodo «il più lungo per primo», che sta entro un terzo dall'ottimo).
 * DETERMINISTICA: a parità di peso decide il nome, a parità di carico la fetta col numero più
 * basso. Ogni fetta rifà lo stesso conto per conto suo e deve arrivare alla stessa divisione,
 * altrimenti una prova finirebbe in due fette o in nessuna.
 *
 * @param {Array<{file: string, peso: number}>} voci
 * @returns {string[][]} N elenchi di file; ogni file sta in UNO e uno solo
 */
export function dividiInFette(voci = [], n = 1) {
  const quante = Math.max(1, Math.floor(Number(n) || 1));
  const fette = Array.from({ length: quante }, () => ({ carico: 0, file: [] }));
  const ordinate = [...voci].sort((a, b) => b.peso - a.peso || (a.file < b.file ? -1 : a.file > b.file ? 1 : 0));
  for (const v of ordinate) {
    let scelta = 0;
    for (let k = 1; k < quante; k++) if (fette[k].carico < fette[scelta].carico) scelta = k;
    fette[scelta].carico += v.peso;
    fette[scelta].file.push(v.file);
  }
  return fette.map((f) => f.file.sort());
}

/**
 * I tempi misurati di ogni prova (`cervello/tempi-prove.json`). Se il file manca o non si legge
 * torna una mappa vuota: i tempi servono solo a BILANCIARE le fette, mai a decidere cosa gira —
 * ogni prova gira comunque, al massimo su una fetta più carica.
 */
export function leggiTempi(dove) {
  try {
    const j = JSON.parse(readFileSync(dove, "utf8"));
    return new Map(Object.entries(j?.ms || {}).filter(([, v]) => Number.isFinite(v)));
  } catch {
    return new Map();
  }
}

/** I tempi da scrivere, presi da uno o più referti della suite (interi o fette). */
export function tempiDaiReferti(referti = []) {
  const ms = {};
  for (const r of referti) for (const x of [...(r?.test || []), ...(r?.bats || [])]) if (x?.file && Number.isFinite(x.ms)) ms[x.file] = x.ms;
  return Object.fromEntries(Object.entries(ms).sort(([a], [b]) => (a < b ? -1 : 1)));
}

/**
 * Legge i referti di una cartella. OGNI file della cartella è un referto: non filtro per
 * estensione, perché un file che sta lì e non si legge come JSON è una notizia (una fetta che ha
 * scritto a metà, un upload sbagliato) e va fra gli `illeggibili`, non saltato in silenzio.
 */
export function leggiReferti(cartella) {
  if (!cartella || !existsSync(cartella)) return { referti: [], illeggibili: [], assente: true };
  const referti = [];
  const illeggibili = [];
  for (const f of readdirSync(cartella).sort()) {
    const via = join(cartella, f);
    if (!statSync(via).isFile()) {
      illeggibili.push(`${f}: non è un file`);
      continue;
    }
    try {
      referti.push({ nome: f, ...JSON.parse(readFileSync(via, "utf8")) });
    } catch (e) {
      illeggibili.push(`${f}: ${e.message}`);
    }
  }
  return { referti, illeggibili, assente: false };
}

/**
 * Le fette sono tutte arrivate, dallo stesso commit e con lo stesso N? Torna l'elenco dei buchi
 * (vuoto = sono tutte qui). Non guarda il contenuto: quello lo guarda chi ricuce.
 */
export function buchiNelleFette(referti = [], { commit = null } = {}) {
  const buchi = [];
  if (!referti.length) return ["nessuna fetta ha consegnato il suo referto"];
  const enne = [...new Set(referti.map((r) => r?.fetta?.n))];
  if (enne.length !== 1 || !Number.isInteger(enne[0])) {
    buchi.push(`le fette non dichiarano lo stesso totale (${enne.join(", ")}): non so quante dovevano essere`);
    return buchi;
  }
  const n = enne[0];
  const viste = referti.map((r) => r.fetta.i);
  for (let i = 1; i <= n; i++) {
    const quante = viste.filter((x) => x === i).length;
    if (quante === 0) buchi.push(`la fetta ${i} di ${n} non ha consegnato il referto`);
    if (quante > 1) buchi.push(`la fetta ${i} di ${n} ha consegnato ${quante} referti`);
  }
  if (commit) {
    for (const r of referti) {
      if (r.commit !== commit) buchi.push(`la fetta ${r.fetta.i} viene dal commit ${r.commit || "?"}, non da ${commit}: misura un altro codice`);
    }
  }
  return buchi;
}

/**
 * Ricuce i referti della SUITE in uno solo, con la stessa forma del JSON di `test-cervello.mjs`
 * (chi legge — il cancello, `testRossi` — non deve sapere che erano fette).
 *
 * @param referti  i JSON delle fette
 * @param universo { test: string[], bats: string[] } — i file che DOVEVANO girare, ricavati da chi
 *                 ricuce e non dalle fette: se li prendessi dalle fette, una fetta sparita si
 *                 porterebbe via anche la memoria di ciò che doveva fare.
 */
export function ricuciSuite(referti = [], universo = { test: [], bats: [] }, opzioni = {}) {
  const buchi = buchiNelleFette(referti, opzioni);
  const test = referti.flatMap((r) => r.test || []).sort((a, b) => a.file.localeCompare(b.file));
  const bats = referti.flatMap((r) => r.bats || []).sort((a, b) => a.file.localeCompare(b.file));
  const conta = new Map();
  for (const x of [...test, ...bats]) conta.set(x.file, (conta.get(x.file) || 0) + 1);
  const attesi = [...(universo.test || []), ...(universo.bats || [])];
  const mancano = attesi.filter((f) => !conta.has(f));
  const doppi = [...conta].filter(([, n]) => n > 1).map(([f]) => f);
  const estranei = [...conta.keys()].filter((f) => !attesi.includes(f));
  const unisci = (campo) => referti.flatMap((r) => r[campo] || []);
  return {
    test,
    bats,
    in_fila: unisci("in_fila"),
    in_fila_perche: Object.assign({}, ...referti.map((r) => r.in_fila_perche || {})),
    illeggibili: unisci("illeggibili"),
    casi_spenti: unisci("casi_spenti"),
    canali_allargati: unisci("canali_allargati"),
    bats_binario: referti.map((r) => r.bats_binario).find(Boolean) || null,
    corsie: referti[0]?.corsie ?? null,
    fette: referti.length,
    buchi,
    mancano,
    doppi,
    estranei,
    completo: !buchi.length && !mancano.length && !doppi.length && !estranei.length,
  };
}

/**
 * L'identità di una mutazione: i campi che dicono COSA rompe e DOVE. Il verdetto del banco porta
 * con sé la mutazione intera (`{...m, verdetto, perche}`), quindi la chiave si ricava uguale da
 * entrambe le parti senza dover numerare niente.
 */
export function chiaveMutazione(m = {}) {
  return JSON.stringify([m.difetto ?? null, m.nome ?? null, m.file ?? null, m.test ?? null, m.cerca ?? null]);
}

/**
 * Divide le MUTAZIONI fra le fette: stesso metodo delle prove, e il peso di una mutazione è il
 * tempo della prova che lancia — è quella che costa, non la riga che rompe. Torna la fetta i-esima
 * (1..N), nell'ordine del registro: dentro la fetta il banco le divide ancora fra le sue corsie.
 */
export function fettaDelleMutazioni(mutazioni = [], { i = 1, n = 1 } = {}, tempi = new Map()) {
  const voci = mutazioni.map((m, k) => ({ file: String(k).padStart(6, "0"), peso: pesoProva({ ms: tempi.get(m.test), inFila: true }) }));
  const mie = new Set(dividiInFette(voci, n)[i - 1] || []);
  return mutazioni.filter((_, k) => mie.has(String(k).padStart(6, "0")));
}

/**
 * Ricuce i verdetti delle MUTAZIONI. Le attese le ricava chi ricuce, dal registro e dal perimetro:
 * ogni mutazione attesa che nessuna fetta ha misurato torna come mancante, NOMINATA — chi chiama la
 * dichiara ⚪ una per una invece di perderla.
 */
export function ricuciMutazioni(referti = [], attese = [], opzioni = {}) {
  const buchi = buchiNelleFette(referti, opzioni);
  const difetti = [...new Set(referti.map((r) => JSON.stringify(r.difetti ?? null)))];
  if (difetti.length > 1) buchi.push("le fette non hanno lavorato sullo stesso perimetro di difetti: misurano lotti diversi");
  if (opzioni.difetti && difetti.length === 1 && difetti[0] !== JSON.stringify(opzioni.difetti)) {
    buchi.push(`le fette hanno lavorato sui difetti ${difetti[0]}, il cancello si aspetta ${JSON.stringify(opzioni.difetti)}`);
  }
  const esiti = referti.flatMap((r) => r.esiti || []);
  const restanti = new Map();
  for (const m of attese) restanti.set(chiaveMutazione(m), (restanti.get(chiaveMutazione(m)) || 0) + 1);
  const doppi = [];
  const estranei = [];
  for (const e of esiti) {
    const k = chiaveMutazione(e);
    if (!restanti.has(k)) estranei.push(e);
    else if (restanti.get(k) === 0) doppi.push(e);
    else restanti.set(k, restanti.get(k) - 1);
  }
  const mancano = [];
  for (const m of attese) {
    const k = chiaveMutazione(m);
    if (restanti.get(k) > 0) {
      mancano.push(m);
      restanti.set(k, restanti.get(k) - 1);
    }
  }
  return { esiti, buchi, mancano, doppi, estranei, completo: !buchi.length && !mancano.length && !doppi.length && !estranei.length };
}
