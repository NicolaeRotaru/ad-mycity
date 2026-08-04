// 📏 CHI SCEGLIE L'INDENTAZIONE INVECE DI LEGGERLA — il guardiano della malattia di AR-522.
//
// AR-522 ha curato UN punto: `tasso-lezioni.mjs` non riscrive più `apprendimento.json` a due spazi.
// Ma la malattia non era in `tasso-lezioni`: era nel fatto che l'indentazione la sceglie chi SCRIVE
// invece del file che ESISTE. E infatti la porta automatica era rimasta aperta —
// `tick-auto-coscienza-leggero.mjs`, che gira da solo dentro il giro, riscriveva lo stesso file con
// gli stessi due spazi. Quattro giorni e diciassette ore di macchina ferma sarebbero tornati al primo
// giro utile, e nessuno li avrebbe collegati alla scheda dichiarata chiusa.
//
// È l'errore già pagato del cantiere (AR-172): riparare la porta a mano e lasciare aperta quella
// automatica è il modo più sicuro di far tornare il difetto da solo. La cura non è aggiungere il
// freno anche lì — è metterlo sul DATO, dove vale per chiunque scriva: `scriviJsonAtomico` legge
// l'indentazione dal file. Questo modulo è la guardia che accorge chi quel freno lo scavalca.
//
// COSA MISURA. Per ogni `writeFileSync(BERSAGLIO, JSON.stringify(…, null, N))` in un sorgente:
// risolve il BERSAGLIO in un file vero, legge l'indentazione che quel file ha SUL DISCO, e la
// confronta con N. Se non coincidono, quella riga è la prossima istanza del guasto.
//
// L'ONESTÀ DEL METRO. Un bersaglio che non si riesce a risolvere in un file esistente NON è un
// verde: torna in `nonMisurate`, che è il ⚪ dichiarato. Un guardiano che chiama «a posto» ciò che
// non ha guardato è la malattia che il cantiere sta curando da trenta lotti.
//
// Nessun import: tutte le funzioni sono pure e prendono il testo, così un test le esegue davvero
// invece di cercare un pattern in un file.

/**
 * Il primo argomento di una chiamata, contando le parentesi.
 *
 * Serve perché `join(REPO, TETTO)` contiene una virgola: tagliare alla prima virgola darebbe
 * `join(REPO` e il bersaglio sarebbe irriconoscibile. `da` è l'indice della parentesi aperta.
 * Torna `null` se le parentesi non si chiudono — un sorgente troncato non deve fingere una risposta.
 */
export function primoArgomento(testo, da) {
  let livello = 0;
  for (let i = da; i < testo.length; i++) {
    const c = testo[i];
    if (c === "(" || c === "[" || c === "{") livello++;
    else if (c === ")" || c === "]" || c === "}") {
      livello--;
      if (livello === 0) return testo.slice(da + 1, i).trim(); // chiamata a un argomento solo
    } else if (c === "," && livello === 1) return testo.slice(da + 1, i).trim();
  }
  return null;
}

/**
 * Il testo della chiamata, dalla parentesi aperta alla SUA chiusa.
 *
 * Esiste per un falso positivo vero, trovato mentre costruivo questo metro: cercare
 * `JSON.stringify(…, null, N)` in una finestra di caratteri dopo `writeFileSync(` pescava la
 * `stringify` di una chiamata DIVERSA più in basso, e accusava un file innocente. Un guardiano che
 * accusa l'innocente viene disattivato al secondo giro, e allora non guarda più nemmeno i colpevoli.
 * Il confine della chiamata si conta, non si stima.
 */
export function corpoChiamata(testo, da) {
  let livello = 0;
  for (let i = da; i < testo.length; i++) {
    const c = testo[i];
    if (c === "(" || c === "[" || c === "{") livello++;
    else if (c === ")" || c === "]" || c === "}") {
      livello--;
      if (livello === 0) return testo.slice(da, i + 1);
    }
  }
  return null; // parentesi non chiuse: non si inventa un confine
}

/**
 * I `const NOME = …` di livello modulo che contengono pezzi di percorso.
 *
 * Tiene i letterali di stringa nell'ordine in cui appaiono: `join(AD_ROOT, "cervello", "x.json")`
 * diventa `["cervello", "x.json"]`. La radice (AD_ROOT, REPO, QUI…) si butta apposta: non sappiamo
 * quale cartella sia, e non ci serve — il percorso lo risolviamo per coda, non per testa.
 */
export function costantiDiPercorso(sorgente) {
  const mappa = new Map();
  // Il nome NON si limita alle MAIUSCOLE: `const path = '…/apprendimento.json'` è minuscolo, ed è
  // una delle quattro porte che scrivevano il file che ha fermato la macchina. Una convenzione di
  // scrittura non è un confine di sicurezza — dedurre il perimetro dal nome è l'errore di AR-347.
  const re = /^\s*(?:export\s+)?const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*([^;\n]+)/gm;
  let m;
  while ((m = re.exec(sorgente))) {
    const [, nome, valore] = m;
    const pezzi = [...valore.matchAll(/["'`]([^"'`\n]*\.(?:json|jsonl))["'`]|["'`]([^"'`\n{}$]+)["'`]/g)]
      .map((x) => x[1] ?? x[2])
      .filter((s) => s && !s.includes(" ") && s !== "utf8");
    // Si tengono anche le costanti che indicano solo una CARTELLA (`const SKILL_DIR = …`): il file
    // spesso nasce dall'unione cartella + letterale nella chiamata, e scartarle perdeva un'istanza
    // vera. Il filtro sul `.json` sta a valle, in `percorsoDelBersaglio`, dove c'è il percorso intero.
    if (pezzi.length) mappa.set(nome, pezzi.join("/").replace(/\/+/g, "/"));
  }
  return mappa;
}

/**
 * Il percorso che un'espressione-bersaglio indica, per quel che se ne può sapere leggendola.
 *
 * `APPR_PATH` → il valore della costante. `join(REPO, TETTO)` → si espande TETTO. Una stringa dentro
 * l'espressione vale per sé. Torna `null` quando non resta niente di riconoscibile: è il caso del
 * parametro di funzione (`writeJson(path, dati)`), e va dichiarato non misurato, non assolto.
 */
export function percorsoDelBersaglio(espressione, costanti, profondita = 0) {
  if (!espressione || profondita > 3) return null;
  const pezzi = [];
  for (const t of espressione.matchAll(/["'`]([^"'`\n{}$]+)["'`]|\b([A-Za-z_$][A-Za-z0-9_$]*)\b/g)) {
    if (t[1]) pezzi.push(t[1]);
    else if (t[2] && costanti.has(t[2])) {
      const dentro = costanti.get(t[2]);
      if (dentro) pezzi.push(dentro);
    }
  }
  const p = pezzi.join("/").replace(/\/+/g, "/");
  return /\.(json|jsonl)$/.test(p) ? p : null;
}

/**
 * Le scritture che si portano dietro un'indentazione decisa a mano.
 *
 * Solo `JSON.stringify(…, null, N)` con N numero: `JSON.stringify(dati)` (compatto, una riga sola)
 * non ha un'indentazione da sbagliare, e chi passa una variabile la sta già leggendo da qualche parte.
 */
export function scrittureConIndentazioneFissa(sorgente) {
  const costanti = costantiDiPercorso(sorgente);
  const fuori = [];
  const re = /\bwriteFileSync\s*\(/g;
  let m;
  while ((m = re.exec(sorgente))) {
    const apertura = m.index + m[0].length - 1;
    const corpo = corpoChiamata(sorgente, apertura);
    if (!corpo) continue;
    const bersaglio = primoArgomento(corpo, 0);
    if (!bersaglio) continue;
    // Dentro QUESTA chiamata soltanto. La virgola finale è ammessa: chi formatta il codice la mette.
    const ind = /\bJSON\.stringify\([\s\S]*,\s*null,\s*(\d+)\s*,?\s*\)/.exec(corpo);
    if (!ind) continue;
    fuori.push({
      bersaglio,
      percorso: percorsoDelBersaglio(bersaglio, costanti),
      indent: Number(ind[1]),
      riga: sorgente.slice(0, m.index).split("\n").length,
    });
  }
  return fuori;
}

/**
 * Il verdetto: quali scritture imporrebbero al file un'indentazione diversa da quella che ha.
 *
 * `indentazioneReale(percorso)` torna il numero di spazi del file sul disco, oppure `null` se quel
 * file non l'ha trovato. Iniettata apposta: così il giudizio è puro e il test lo esegue su casi
 * costruiti, mentre il guardiano gli passa il disco vero.
 */
export function verdetto(scritture, indentazioneReale) {
  const fuori = [];
  const nonMisurate = [];
  for (const s of scritture) {
    const reale = s.percorso ? indentazioneReale(s.percorso) : null;
    if (reale == null) nonMisurate.push(s);
    else if (reale !== s.indent) fuori.push({ ...s, reale });
  }
  return { fuori, nonMisurate };
}
