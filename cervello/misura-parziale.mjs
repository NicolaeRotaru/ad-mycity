// 📏 MISURA-PARZIALE — una misura fatta su un pezzo non può essere letta come intera.
//
// La malattia, in una riga: **un voto, una pagella o un conteggio si costruisce su un sottoinsieme e
// poi viene mostrato come se fosse la misura completa.** Il numero MIGLIORA proprio quando la realtà
// peggiora, perché i pezzi peggiori sono esattamente quelli che il filtro butta fuori.
//
// I quattro punti in cui è stata misurata (29/7, su questo repo):
//
//   AR-357 — `sonda-volano.mjs` calcola il voto salute come media dei voti per dimensione, filtrando
//     `Number.isFinite(v) && v > 0`. Ma il voto per dimensione è `Math.max(0, 100 - somma pesi)` e
//     SATURA a 0: uno zero è un disastro misurato, non un dato mancante. Sui dati reali di adesso le
//     dimensioni sono 8, cinque valgono 0, la media coi soli sopravvissuti fa 23 e quella onesta 9.
//     Il filtro regala 14 punti — e ne regala di più man mano che altre dimensioni affondano.
//
//   AR-358 — `calibrazione.mjs` ricalcola `per_reparto` con un `continue` a monte dei contatori: le
//     36 righe `esito_loop` (su 42) spariscono sia da `previsioni` sia da `escluse`. Nessuno può
//     accorgersene dal report, perché la somma non torna e non c'è niente che pretenda che torni.
//
//   AR-362 — «lezioni vive» è contata in tre modi da tre script sullo stesso file: 476, 471, 381. E
//     `meta.lezioni_attive` viene scritto da DUE di loro con due significati diversi, a turno.
//
//   AR-353 — `prove-oneste.mjs` controlla 145 prove, ne misura ZERO (clone superficiale: il passato
//     non c'è) e stampa «✅ nessuna era già soddisfatta alla nascita» uscendo 0. «Non ho trovato
//     niente» e «non ho potuto guardare» producono la stessa frase e lo stesso codice d'uscita.
//
// LA CURA, e perché sta in un modulo solo. Correggere le quattro formule non basta: la quinta media
// nascerebbe già sbagliata. Qui la decisione è UNA funzione pura, e ha una forma che rende difficile
// mentire per distrazione:
//
//   ① `mediaCoperta` non torna mai un numero nudo. Torna una MISURA che si porta dietro copertura,
//      esclusi e motivo — e il cui `toString()` STAMPA la copertura. Chi interpola `${m}` mostra la
//      copertura anche se non ci ha pensato; chi vuole il numero secco deve chiedere `.valore`, che
//      è un gesto esplicito e cercabile.
//   ② `ripartisci` conta per costruzione: ogni voce finisce in esattamente una classe, quindi la
//      somma delle classi È il totale. Non esiste il `continue` che fa sparire una riga.
//   ③ `verdettoCopertura` ha TRE esiti, non due: 0 misurato e pulito · 1 violazione · 2 cieco. Un
//      bollino verde stampato senza aver misurato è la malattia stessa (contratto AR-322).
//   ④ `medieChePotanoGliZeri` è il metro: cerca nel sorgente la forma «media su una lista filtrata a
//      togliere gli zeri». Una regola senza metro è la malattia che questi lotti curano.
//
// Nessun import: si esegue in un test senza toccare disco, rete o vault. Modello: `fonte-numero.mjs`.

// ── ① La media che dichiara su cosa è stata fatta ───────────────────────────

/** Un valore è MISURATO se è un numero finito — zero compreso. Tutto il resto è assenza. */
export function misurato(v) {
  return typeof v === "number" && Number.isFinite(v);
}

/**
 * La media di una lista, con la copertura attaccata addosso.
 *
 * `valori` sono i valori GREZZI, uno per unità osservata: un numero (anche 0) = misurato,
 * `null`/`undefined`/`NaN`/stringa = non misurato. Il chiamante NON deve pre-filtrare: filtrare
 * prima è esattamente il gesto che fa sparire la copertura.
 *
 * `totale` serve quando alcune unità non compaiono nemmeno nella lista (es. 24 dimensioni attese, 8
 * presenti nel file): senza, la copertura si misurerebbe sul pezzo già ridotto — la malattia dentro
 * la cura.
 *
 * @returns {Readonly<{valore:number|null, misurati:number, totale:number, esclusi:number,
 *   copertura:number, parziale:boolean, cieco:boolean, motivo:string, etichetta:string}>}
 */
export function mediaCoperta(valori, { totale = null, unita = "voci", nome = "media" } = {}) {
  const lista = Array.isArray(valori) ? valori : [];
  const buoni = lista.filter(misurato);
  const attesi = Number.isFinite(Number(totale)) && Number(totale) > lista.length ? Number(totale) : lista.length;
  const esclusi = attesi - buoni.length;
  const copertura = attesi > 0 ? buoni.length / attesi : 0;
  const valore = buoni.length ? Math.round((buoni.reduce((s, v) => s + v, 0) / buoni.length) * 100) / 100 : null;
  const cieco = buoni.length === 0;
  const parziale = !cieco && esclusi > 0;

  const motivo = cieco
    ? `${nome}: nessuna delle ${attesi} ${unita} è stata misurata — non c'è una media da mostrare`
    : parziale
      ? `${nome}: calcolata su ${buoni.length} ${unita} su ${attesi} (${esclusi} non misurate): è una media PARZIALE`
      : `${nome}: calcolata su tutte e ${attesi} le ${unita}`;

  const etichetta = cieco
    ? `non misurata (0/${attesi} ${unita})`
    : `${valore} (su ${buoni.length}/${attesi} ${unita})`;

  return Object.freeze({
    valore,
    misurati: buoni.length,
    totale: attesi,
    esclusi,
    copertura: Math.round(copertura * 100) / 100,
    parziale,
    cieco,
    motivo,
    etichetta,
    toString() {
      return etichetta;
    },
  });
}

/**
 * Il numero secco, ma solo dopo aver detto quanto vale.
 *
 * Serve dove il valore deve finire in un campo numerico (uno snapshot storico, un JSON): torna il
 * numero E il campo di copertura che DEVE viaggiare accanto. Chi vuole scrivere solo il numero deve
 * buttare via esplicitamente il secondo campo, e allora è una scelta, non una dimenticanza.
 *
 * @returns {{valore:number|null, copertura:string, parziale:boolean, cieco:boolean}}
 */
export function perLoStorico(m) {
  if (!m || typeof m !== "object" || !("copertura" in m)) {
    throw new TypeError("perLoStorico vuole una Misura di mediaCoperta, non un numero nudo: è tutto il punto del modulo");
  }
  return {
    valore: m.valore,
    copertura: `${m.misurati}/${m.totale}`,
    parziale: Boolean(m.parziale),
    cieco: Boolean(m.cieco),
  };
}

// ── ② Il conteggio che non può perdere righe ────────────────────────────────

/**
 * Ripartisce delle voci in classi, garantendo che la somma torni SEMPRE.
 *
 * È la forma che rende impossibile AR-358: non c'è nessun `continue` che possa saltare un contatore,
 * perché il conteggio non lo fa il chiamante — lo fa questa funzione, una volta per voce. Il
 * classificatore può solo dire IN QUALE classe va una voce, mai «questa non contarla».
 *
 * Una classe restituita vuota/`null` finisce in `"non_classificate"`: anche l'errore del
 * classificatore resta visibile invece di evaporare.
 *
 * @param {any[]} voci
 * @param {(voce:any)=>string} classifica
 * @param {string[]} classi classi da mostrare a zero anche se vuote (così «0» e «non c'è» si distinguono)
 * @returns {{totale:number, conteggi:Record<string,number>, quadra:boolean, somma:number}}
 */
export function ripartisci(voci, classifica, classi = []) {
  const lista = Array.isArray(voci) ? voci : [];
  const conteggi = {};
  for (const c of classi) conteggi[String(c)] = 0;
  for (const v of lista) {
    let c;
    try {
      c = classifica(v);
    } catch {
      c = null;
    }
    const k = c == null || String(c).trim() === "" ? "non_classificate" : String(c);
    conteggi[k] = (conteggi[k] || 0) + 1;
  }
  const somma = Object.values(conteggi).reduce((s, n) => s + n, 0);
  return { totale: lista.length, conteggi, somma, quadra: somma === lista.length };
}

// ── ③ Il verdetto a tre esiti (contratto guardiani AR-322) ──────────────────

/** Sotto questa copertura un guardiano non può dire «tutto a posto»: non ha guardato abbastanza. */
export const COPERTURA_MINIMA = 0.5;

/**
 * L'esito di un guardiano che controlla N cose e riesce a misurarne solo alcune.
 *
 * Tre esiti, mai due:
 *   · `violazione` (1) — ho misurato e ho trovato qualcosa che non va. Vince sempre: una violazione
 *     vera è un fatto, anche se il resto non si è potuto guardare.
 *   · `cieco` (2) — non ho misurato niente, o troppo poco per firmare un verde.
 *   · `ok` (0) — ho misurato abbastanza e non ho trovato niente.
 *
 * `controllate` = quante cose il guardiano aveva davanti; `misurate` = su quante ha davvero potuto
 * decidere. Il caso che ha fatto danno è `controllate=145, misurate=0` → oggi stampava ✅ ed usciva 0.
 *
 * @returns {{esito:"ok"|"violazione"|"cieco", codice:0|1|2, copertura:number, motivo:string}}
 */
export function verdettoCopertura({ controllate = 0, misurate = 0, violazioni = 0, coperturaMinima = COPERTURA_MINIMA } = {}) {
  const tot = Math.max(0, Number(controllate) || 0);
  const mis = Math.max(0, Number(misurate) || 0);
  const viol = Math.max(0, Number(violazioni) || 0);
  const copertura = tot > 0 ? Math.round((mis / tot) * 100) / 100 : 0;

  if (viol > 0) {
    return { esito: "violazione", codice: 1, copertura, motivo: `${viol} violazioni su ${mis} misurate (di ${tot} controllate)` };
  }
  if (tot === 0) {
    return { esito: "cieco", codice: 2, copertura: 0, motivo: "niente da controllare: un verde su zero controlli non è un verde" };
  }
  if (mis === 0) {
    return { esito: "cieco", codice: 2, copertura, motivo: `${tot} controllate, ZERO misurate: non ho guardato niente, quindi non posso dire che va bene` };
  }
  const soglia = Number(coperturaMinima);
  if (Number.isFinite(soglia) && copertura < soglia) {
    return {
      esito: "cieco",
      codice: 2,
      copertura,
      motivo: `misurate solo ${mis} su ${tot} (${Math.round(copertura * 100)}%, minimo ${Math.round(soglia * 100)}%): il verde coprirebbe una minoranza`,
    };
  }
  return { esito: "ok", codice: 0, copertura, motivo: `${mis} su ${tot} misurate, nessuna violazione` };
}

// ── ③bis Un conteggio solo per «lezioni vive» (AR-362) ──────────────────────

/**
 * Gli usi di una lezione, qualunque forma abbia il campo.
 *
 * Il bug esatto: `tasso-lezioni.mjs` fa `lez.usi.push({quando, ref})` — `usi` è un ARRAY di oggetti —
 * mentre `apprendimento-guardiano.mjs` fa `Number(l.usi) > 0`, che su un array di oggetti dà NaN e
 * quindi è SEMPRE falso. Il guardiano che deve giudicare l'apprendimento aveva l'unica misura
 * indipendente rotta da un cambio di tipo mai propagato: misurava 0 lezioni usate mentre erano 6.
 */
export function usiDiUnaLezione(l) {
  const u = l?.usi ?? l?.applicata_in;
  if (Array.isArray(u)) return u.length;
  const n = Number(u);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Gli stati che una lezione può avere. Dichiarati qui perché la partizione sia completa per costruzione. */
export const STATI_LEZIONE = ["attiva", "principio", "in-prova", "decaduta", "senza-stato"];

/**
 * UNA definizione di «lezione viva», e la partizione completa accanto.
 *
 * Viva = **applicabile oggi**: `attiva`, `principio`, o senza stato (le vecchie righe nate prima del
 * campo). `in-prova` non ancora, `decaduta` non più. Le tre definizioni che convivevano davano 476,
 * 471 e 381 sullo stesso file — e due script scrivevano `meta.lezioni_attive` con due significati
 * diversi, a turno, quindi la Cabina mostrava l'ultimo che aveva girato.
 *
 * Torna anche `per_stato` con la somma garantita E la `lista` delle vive: chi ha bisogno degli
 * oggetti deve poterli prendere DA QUI, altrimenti si riscrive il filtro a mano — che è come sono
 * nate le tre definizioni.
 *
 * @returns {{vive:number, lista:any[], totale:number, per_stato:Record<string,number>,
 *   con_usi:number, tasso_usi:number, quadra:boolean}}
 */
export function lezioniVive(dati) {
  const tutte = Array.isArray(dati?.lezioni) ? dati.lezioni : [];
  const stato = (l) => {
    const s = String(l?.stato ?? "").trim();
    if (!s) return "senza-stato";
    return STATI_LEZIONE.includes(s) ? s : "altro";
  };
  const { conteggi, quadra } = ripartisci(tutte, stato, STATI_LEZIONE);
  const viveLista = tutte.filter((l) => ["attiva", "principio", "senza-stato"].includes(stato(l)));
  const conUsi = viveLista.filter((l) => usiDiUnaLezione(l) > 0).length;
  return {
    vive: viveLista.length,
    lista: viveLista,
    totale: tutte.length,
    per_stato: conteggi,
    con_usi: conUsi,
    tasso_usi: viveLista.length ? Math.round((conUsi / viveLista.length) * 100) / 100 : 0,
    quadra,
  };
}

// ── ④ Il metro: chi calcola una media potando gli zeri ──────────────────────

/** Toglie i commenti mantenendo il numero di righe (così la prosa che descrive il bug non lo diventa). */
export function senzaCommenti(src) {
  const senzaBlocchi = String(src ?? "").replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  return senzaBlocchi
    .split("\n")
    .map((riga) => (/^\s*(\/\/|\*|#)/.test(riga) ? "" : riga))
    .join("\n");
}

// `const NOME = …filter(…)…;` — la lista che nasce già potata.
const LISTA_FILTRATA = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([\s\S]{0,600}?);/g;
// Un predicato che butta fuori lo ZERO (non l'assenza): `> 0`, `>= 1`, `!== 0`, `Boolean(x)`, `=> x)`.
const POTA_GLI_ZERI = /[><]=?\s*0\b|>\s*0\b|>=\s*1\b|!==?\s*0\b|Boolean\s*\(/;
// La forma della media: somma / .length.
const FORMA_MEDIA = /([A-Za-z_$][\w$]*)\s*\.reduce\s*\(([\s\S]{0,120}?)\)\s*\/\s*\1\s*\.length/g;

/**
 * I punti del sorgente che calcolano una MEDIA su una lista costruita scartando gli zeri, senza
 * passare da `mediaCoperta`.
 *
 * Pura apposta: prende `[{file, testo}]` e torna le violazioni, così la prova gira su sorgenti
 * inventati — un metro provato solo su un repo già sano non dimostra di saper mordere.
 *
 * Preciso di proposito: NON basta un `.filter(x > 0)` (selezionare i primi K per punteggio è
 * legittimo), serve che quella stessa lista finisca dentro una media. È la differenza fra un
 * cancello che si tiene e uno che viene spento entro la settimana.
 *
 * @param {{file:string, testo:string}[]} files
 * @returns {{file:string, riga:number, lista:string, motivo:string}[]}
 */
export function medieChePotanoGliZeri(files = [], esenti = []) {
  const fuori = [];
  for (const { file, testo } of files) {
    const nome = String(file);
    if (nome.endsWith("misura-parziale.mjs")) continue; // il modulo che definisce la cura
    if (esenti.some((e) => nome.endsWith(e))) continue;
    const src = senzaCommenti(String(testo || ""));

    // 1) le liste nate da un filtro che pota gli zeri
    const potate = new Map();
    for (const m of src.matchAll(LISTA_FILTRATA)) {
      const [tutto, nomeLista, corpo] = m;
      if (!/\.filter\s*\(/.test(corpo)) continue;
      if (!POTA_GLI_ZERI.test(corpo)) continue;
      potate.set(nomeLista, src.slice(0, m.index + tutto.length).split("\n").length);
    }
    if (!potate.size) continue;

    // 2) le medie fatte su una di quelle liste
    for (const m of src.matchAll(FORMA_MEDIA)) {
      const lista = m[1];
      if (!potate.has(lista)) continue;
      fuori.push({
        file: nome,
        riga: src.slice(0, m.index).split("\n").length,
        lista,
        motivo: `\`${lista}\` nasce da un filtro che scarta gli zeri (riga ${potate.get(lista)}) e qui ne fa la media: una dimensione a 0 è un disastro MISURATO, buttarla fuori fa salire il voto quando la realtà peggiora. Usa mediaCoperta().`,
      });
    }
  }
  return fuori;
}

// ── ④bis Il metro: chi si reinventa «lezione viva» ──────────────────────────

/**
 * I file che leggono `apprendimento.json` e si definiscono da soli quali lezioni contano, invece di
 * chiamare `lezioniVive()`. È il freno sul DATO: senza, il quarto script nasce già con la quarta
 * definizione.
 *
 * @param {{file:string, testo:string}[]} files
 * @returns {{file:string, riga:number, motivo:string}[]}
 */
export function conteggiPrivatiDelleLezioni(files = [], esenti = []) {
  const fuori = [];
  for (const { file, testo } of files) {
    const nome = String(file);
    if (nome.endsWith("misura-parziale.mjs")) continue;
    if (esenti.some((e) => nome.endsWith(e))) continue;
    const src = senzaCommenti(String(testo || ""));
    if (!/apprendimento\.json|["']apprendimento["']/.test(src)) continue;
    if (/lezioniVive\s*\(/.test(src)) continue; // usa la porta: a norma
    for (const m of src.matchAll(/\.lezioni\s*\.filter\s*\(|\blezioni\s*\.filter\s*\(/g)) {
      fuori.push({
        file: nome,
        riga: src.slice(0, m.index).split("\n").length,
        motivo: "conta le lezioni con un filtro suo: tre definizioni davano 476/471/381 sullo stesso file. Usa lezioniVive().",
      });
    }
  }
  return fuori;
}
