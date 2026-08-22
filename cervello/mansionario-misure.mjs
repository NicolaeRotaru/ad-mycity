// AR-436 — il metro dei mansionari contava quattro titoli che il template garantiva.
//
// IL DIFETTO, misurato il 2026-08-22 sui 120 file veri di `.claude/agents/`: `difettiAgente` cercava
// quattro parole — «SCHEDA MESTIERE», «RUBRICA-LIVELLI», «scorecard», «RITUALE DI FINE» — e le trovava
// **120 volte su 120**, perché sono i quattro titoli che il template di rollout incollava per
// costruzione. Non era un metro severo o indulgente: era un metro **incapace di dire di no**. E gli
// ingredienti che il [[STAMPO-SENIOR-PRO]] chiede davvero — modelli mentali, loop interno, galleria,
// trappole, carburante — nessuno li contava: anche quelli sono presenti come TITOLO in 120 file su 120.
//
// COSA MISURA QUESTO FILE: la sostanza dentro quei titoli, non la loro presenza.
//   · modelli mentali → almeno 3 voci di elenco (l'elenco, non il titolo);
//   · loop interno    → quante varianti dichiara di generare, e la domanda-ghigliottina;
//   · galleria        → almeno un GOLD e almeno una SPAZZATURA, ciascuno ANNOTATO col perché;
//   · trappole        → almeno 3 anti-pattern;
//   · carburante      → un elenco di dati/foto/chiavi, non una frase di cortesia.
//
// COSA NON PROVA, e va scritto qui perché è la causa di sistema di AR-436 (nessun guardiano portava
// con sé l'elenco di ciò che NON prova): non prova che un modello mentale sia GIUSTO, che l'esempio
// GOLD sia davvero oro, che il carburante elencato serva a qualcosa. Misura che l'ingrediente c'è e
// ha una consistenza minima. Il giudizio sul contenuto resta a un lettore — @prompt-engineer, Nicola.
//
// QUANTI NE BOCCIA OGGI (misurato il 2026-08-22 sul parco vero, 120 mansionari):
//   loop senza un numero di varianti ..... 82   il loop c'è, ma è un «loop di RIGORE» (verifica,
//                                               riconcilia, attacca la tua bozza) e non dichiara mai
//                                               quante alternative genera: @analista, @finanza,
//                                               @notaio, @accessibility, @chief-of-staff e altri 77.
//   galleria col GOLD non annotato .......  4   @consulente-bancario, @fundraising-equity,
//                                               @mediatore-creditizio, @rating-centrale-rischi —
//                                               l'esempio c'è, nessuno scrive perché è oro. È lo
//                                               STESSO cluster banche che AR-289 aveva già pescato
//                                               sui kit: tre misure indipendenti, gli stessi file.
//   modelli mentali sotto le 3 voci ......  1   @personalization: i sette modelli ci sono, ma in un
//                                               blocco di prosa invece che in elenco.
//   trappole sotto le 3 ..................  0
//   carburante sotto le 3 voci ...........  0
//   mansionari fotocopia .................  0
//   → passano TUTTE le misure: 38 su 120. Col metro vecchio ne passavano 120 su 120.
// Tre di queste misure (trappole, carburante, fotocopie) oggi non bocciano nessuno: sono canarini per
// il futuro, non discriminanti di oggi, e dirlo è parte del metro. Non ho alzato la soglia per farle
// «pescare» qualcuno: tarare una soglia sul risultato voluto è il difetto che AR-129 ha già pagato.
//
// Nessuna dipendenza e nessun I/O: si esegue su testo passato da fuori, così una prova può misurare
// un mansionario finto invece di com'è il repo adesso.

/** I difetti di SOSTANZA di un mansionario. `stampo-metro.mjs` li unisce a `DIFETTO`. */
export const DIFETTO_SOSTANZA = {
  MODELLI_POVERI: "modelli_mentali_poveri",
  LOOP_SENZA_VARIANTI: "loop_senza_varianti",
  GALLERIA_SENZA_PERCHE: "galleria_senza_perche",
  TRAPPOLE_SCARSE: "trappole_scarse",
  CARBURANTE_GENERICO: "carburante_generico",
  MANSIONARIO_FOTOCOPIA: "mansionario_fotocopia",
};

/** Lo stampo chiede «3-5 modelli mentali»: sotto 3 non è un repertorio, è un esempio. */
export const MIN_VOCI_MODELLI = 3;
/** Lo stampo elenca 4 anti-pattern nel template; 3 è il minimo che resta un elenco. */
export const MIN_TRAPPOLE = 3;
/** «Elenca ESATTAMENTE quali dati/foto/chiavi servono»: sotto 3 voci è una frase, non un elenco. */
export const MIN_VOCI_CARBURANTE = 3;
/** Il loop dello stampo è «genera N varianti → tieni 1»: con una sola non si sceglie niente. */
export const MIN_VARIANTI = 2;
/** Una voce di elenco più corta di così è un segnaposto, non un contenuto. */
export const MIN_CHAR_VOCE = 30;
/** Un esempio di galleria più corto di così non è un esempio: è un'etichetta. */
export const MIN_CHAR_ESEMPIO = 60;
/** Sotto questa soglia un commento non spiega niente: «→ ok» non è un perché. */
export const MIN_CHAR_PERCHE = 25;

// ── Come si taglia un mansionario in sezioni ────────────────────────────────
// I titoli veri di una scheda mestiere sono di due forme: un'intestazione markdown (`## 🎓 SCHEDA
// MESTIERE`) oppure un grassetto a inizio paragrafo che finisce con la sua punteggiatura
// (`**Il carburante che chiedi (alza il tetto).**`).
//
// LA REGOLA CHE HO DOVUTO AGGIUNGERE, e perché: un grassetto a inizio RIGA non basta. Dentro
// @ai-video il passo «3. **Uccidi i 2 deboli, tieni 1.** 4. Raffina…» va a capo proprio sul
// grassetto, e la prima stesura di questo file ci tagliava la sezione — accusando @ai-video di non
// avere la domanda-ghigliottina che invece ha, due righe sotto. Un titolo apre un PARAGRAFO: quindi
// il grassetto conta come titolo solo se la riga prima è vuota. Con quella riga sola le accuse false
// misurate sul parco vero sono passate da 3 a 0.
const TITOLO = /^(?:#{1,6}\s+(.+?)\s*$|\*\*(.{1,160}?[.:!?)])\*\*)/;

/**
 * Il testo spezzato in `{titolo, corpo}`, nell'ordine in cui compare.
 * @param {string} testo
 * @returns {{titolo: string, corpo: string}[]}
 */
export function sezioniDi(testo = "") {
  const righe = String(testo || "").split("\n");
  const fuori = [];
  let corrente = null;
  for (let i = 0; i < righe.length; i++) {
    const riga = righe[i];
    const m = riga.match(TITOLO);
    const intestazioneMarkdown = m && m[1] != null;
    const inizioParagrafo = i === 0 || !righe[i - 1].trim();
    if (m && (intestazioneMarkdown || inizioParagrafo)) {
      if (corrente) fuori.push(corrente);
      const resto = riga.slice(m[0].length);
      corrente = { titolo: (m[1] || m[2] || "").trim(), righe: resto.trim() ? [resto] : [] };
    } else if (corrente) {
      corrente.righe.push(riga);
    }
  }
  if (corrente) fuori.push(corrente);
  return fuori.map((s) => ({ titolo: s.titolo, corpo: s.righe.join("\n") }));
}

/** La prima sezione il cui titolo contiene `re`. Assente = `{titolo:"", corpo:"", trovata:false}`. */
export function sezione(testo = "", re) {
  const elenco = Array.isArray(testo) ? testo : sezioniDi(testo);
  const s = elenco.find((x) => re.test(x.titolo));
  return s ? { ...s, trovata: true } : { titolo: "", corpo: "", trovata: false };
}

/**
 * Le voci di un elenco dentro un corpo di sezione. Un elenco si scrive in tre modi nel parco vero —
 * col trattino, coi «·», o a virgole dentro una frase — e QUALE dei tre valga dipende dalla sezione,
 * quindi lo dice chi chiama:
 *
 *   · `["elenco"]`                        gli esempi della galleria: sono oggetti da guardare uno per
 *     uno, e spezzarli a virgole non li conta, li sbriciola (errore commesso qui il 22/8: 107
 *     gallerie accusate su 120, tutte a torto).
 *   · `["elenco","puntini"]` (default)    modelli mentali e trappole: un repertorio si scrive in
 *     elenco, e la virgola dentro un paragrafo non lo è — se no basta scrivere prosa lunga.
 *   · `["elenco","puntini","virgole"]`    il carburante: nel parco vero è quasi sempre una frase che
 *     ELENCA («log di autenticazione, storico dei cambi IBAN, capacità MFA reale, feed credenziali»),
 *     e pretendere il trattino misurerebbe la formattazione invece della sostanza.
 *
 * Fra le forme ammesse vince quella che vede più voci.
 * @returns {{voci: string[], forma: "elenco"|"puntini"|"virgole"|"nessuna"}}
 */
export function vociDiElenco(corpo = "", { minChar = MIN_CHAR_VOCE, forme = ["elenco", "puntini"] } = {}) {
  const testo = String(corpo || "");
  const elenco = [];
  for (const riga of testo.split("\n")) {
    const m = riga.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*\S)/);
    if (m) elenco.push(m[1].replace(/\s+/g, " ").trim());
    // una riga rientrata che segue una voce è la continuazione di quella voce, non una voce nuova
    else if (elenco.length && /^\s{2,}\S/.test(riga)) elenco[elenco.length - 1] += " " + riga.trim();
  }
  const spezza = (sep) =>
    testo
      .split(sep)
      .map((x) => x.replace(/\s+/g, " ").trim())
      .filter((x) => x.length >= minChar);
  const tutte = {
    elenco: { voci: elenco.filter((v) => v.length >= minChar), forma: "elenco" },
    puntini: { voci: spezza(/[·;]/), forma: "puntini" },
    virgole: { voci: spezza(/[,·;\n]/), forma: "virgole" },
  };
  const letture = forme.map((f) => tutte[f]).filter(Boolean);
  if (!letture.length) return { voci: [], forma: "nessuna" };
  const migliore = letture.reduce((a, b) => (b.voci.length > a.voci.length ? b : a));
  return migliore.voci.length ? migliore : { voci: [], forma: "nessuna" };
}

// ── Il loop interno ─────────────────────────────────────────────────────────
// Il template dice: «Genera <N> varianti/angoli diversi → criticale → tieni 1 → raffina». Il numero
// è la parte che non si può fingere: senza un N dichiarato non c'è niente da scegliere, e il senior
// consegna la prima bozza — che è il difetto che lo stampo esisteva per curare.
//
// I VERBI SONO POCHI E IL NUMERO DEVE PORTARSI DIETRO UN PLURALE, e per una ragione misurata: con
// «scrivi» nell'elenco e il numero da solo, il loop di @analista — «Scrivi la query e guarda i dati
// grezzi (10 righe a campione…)» — risultava «genera 10 varianti». Il metro trovava un numero e ci
// leggeva un'intenzione: è il difetto di AR-436 riscritto con altre parole.
const VARIANTI_DOPO_IL_VERBO =
  /(?:genera|produci|abbozza|proponi|butta gi[uù])\b[^.\n]{0,60}?\b(?:almeno\s+)?(\d+|due|tre|quattro|cinque)\b[^.\n]{0,40}?\b(?:divers[ei]|alternativ[ei]|angoli|varianti|opzioni|version[ei]|bozze|ipotesi|proposte|approcci|idee|concept)\b/i;
const VARIANTI_PRIMA_DEL_NOME =
  /\b(?:almeno\s+)?(\d+|due|tre|quattro|cinque)\s*(?:[-–]\s*\d+\s*)?\**\s*(?:varianti|angoli|versioni|bozze|opzioni|ipotesi|alternative|proposte|scenari|raggruppamenti|idee|concept|tentativi|formulazioni)/i;
const A_NUMERO = { due: 2, tre: 3, quattro: 4, cinque: 5 };

/** Quante varianti il loop dichiara di generare, e la frase da cui l'ho letto. `null` = nessuna. */
export function numeroVarianti(corpo = "") {
  for (const re of [VARIANTI_PRIMA_DEL_NOME, VARIANTI_DOPO_IL_VERBO]) {
    const m = String(corpo || "").match(re);
    if (!m) continue;
    const n = Number.isFinite(Number(m[1])) ? Number(m[1]) : A_NUMERO[String(m[1]).toLowerCase()];
    if (Number.isFinite(n)) return { n, frase: m[0].replace(/\s+/g, " ").trim() };
  }
  return null;
}

/**
 * La domanda-ghigliottina: la parola E un punto interrogativo. La parola da sola sta in 120 file su
 * 120 — è un titolo del template; una ghigliottina che non è una domanda non taglia niente.
 */
export function domandaGhigliottina(corpo = "") {
  const t = String(corpo || "");
  return /ghigliottina/i.test(t) && /\?/.test(t);
}

// ── La galleria ─────────────────────────────────────────────────────────────
// Lo stampo chiede esempi «ciascuno col PERCHÉ»: è il perché che insegna, l'esempio da solo è un
// aneddoto. Il perché si scrive in tre modi nel parco vero — la parola «perché», una coda dopo un
// trattino lungo o una freccia, o il commento fuori dalla citazione — e valgono tutti e tre.
const MARCATORE_PERCHE = new RegExp(`(?:—|–|--|→|->)\\s*\\S[\\s\\S]{${MIN_CHAR_PERCHE},}`);

/** Una voce di galleria è annotata se porta con sé un giudizio, non solo l'esempio. */
export function annotata(voce = "") {
  const v = String(voce || "");
  if (/perch[eé]/i.test(v)) return true;
  if (MARCATORE_PERCHE.test(v)) return true;
  // L'esempio citato e il commento sono due cose: se l'esempio è fra virgolette, il giudizio deve
  // stare FUORI dalla citazione. Se non c'è citazione, la voce è già commento e prosa insieme.
  const fuoriCitazione = v
    .replace(/\*?["“«][\s\S]*?["”»]\*?/g, " ")
    .replace(/^\s*(?:[-*•]\s*)?(?:✅|❌|🟢|🔴)?\s*(?:GOLD|SPAZZATURA)\s*:?/i, " ")
    .replace(/\s+/g, " ")
    .trim();
  return fuoriCitazione.length >= MIN_CHAR_ESEMPIO;
}

/** Gli esempi della galleria divisi in oro e spazzatura, ognuno con la sua annotazione o senza. */
export function esempiGalleria(corpo = "") {
  const voci = vociDiElenco(corpo, { minChar: 1, forme: ["elenco"] }).voci;
  const prendi = (re) =>
    voci
      .filter((v) => re.test(v))
      .map((v) => ({ testo: v, lungo: v.length >= MIN_CHAR_ESEMPIO, annotata: annotata(v) }));
  return { gold: prendi(/\bGOLD\b|✅/i), spazzatura: prendi(/\bSPAZZATURA\b|❌/i) };
}

// ── La parte che deve essere UNICA ──────────────────────────────────────────
// La Carta del Dipendente, il doer mode, il «come collabori» e il «come scrivi a Nicola» sono
// identici su tutti e 120 per progetto: sono il sistema operativo condiviso. Misurare le fotocopie
// sul file intero dichiara fotocopia 120 mansionari su 120 (misurato) — cioè l'altra faccia dello
// stesso difetto: un metro che boccia tutti non distingue più niente di un metro che promuove tutti.
// La parte che lo stampo dice di riempire «con la materia del singolo mestiere, mai copiata a
// fotocopia» è la SCHEDA MESTIERE: la caccia si fa lì.
const INIZIO_MESTIERE = /^#{1,6}\s.*SCHEDA MESTIERE/im;
const FINE_MESTIERE = /^#{1,6}\s.*(?:Carta del Dipendente|Come AGISCI|Come COLLABORI|Come scrivi a Nicola)/im;

/** La sola parte di mestiere di un mansionario (scheda + dimensioni + vettori), senza l'OS condiviso. */
export function parteDiMestiere(testo = "") {
  const t = String(testo || "");
  const i = t.search(INIZIO_MESTIERE);
  const testa = i >= 0 ? t.slice(i) : t;
  const m = testa.match(FINE_MESTIERE);
  return m ? testa.slice(0, m.index) : testa;
}

/**
 * Le cinque misure di sostanza, ognuna con il suo verdetto e il PERCHÉ in italiano — il rapporto
 * deve poter dire cosa manca, non solo che qualcosa manca.
 */
export function misureMansionario(testo = "") {
  const sez = sezioniDi(testo);
  const modelliSez = sezione(sez, /modelli mentali/i);
  const loopSez = sezione(sez, /loop interno/i);
  const galleriaSez = sezione(sez, /galleria/i);
  const trappoleSez = sezione(sez, /trappole/i);
  const carburanteSez = sezione(sez, /carburante/i);

  const modelli = vociDiElenco(modelliSez.corpo);
  const trappole = vociDiElenco(trappoleSez.corpo, { minChar: 15 });
  const carburante = vociDiElenco(carburanteSez.corpo, { minChar: 12, forme: ["elenco", "puntini", "virgole"] });
  const varianti = numeroVarianti(loopSez.corpo);
  const ghigliottina = domandaGhigliottina(loopSez.corpo);
  const galleria = esempiGalleria(galleriaSez.corpo);
  const goldOk = galleria.gold.some((g) => g.lungo && g.annotata);
  const spazzaturaOk = galleria.spazzatura.some((g) => g.lungo && g.annotata);

  const manca = (s, cosa) => (s.trovata ? "" : `la sezione «${cosa}» non c'è`);
  return {
    modelli: {
      ok: modelli.voci.length >= MIN_VOCI_MODELLI,
      voci: modelli.voci.length,
      perche:
        manca(modelliSez, "modelli mentali") ||
        (modelli.voci.length >= MIN_VOCI_MODELLI
          ? `${modelli.voci.length} modelli elencati`
          : `${modelli.voci.length} voci contate su ${MIN_VOCI_MODELLI}` +
            (modelliSez.corpo.length >= 200 ? " — la sezione è lunga ma non è un elenco" : "")),
    },
    loop: {
      ok: Boolean(varianti && varianti.n >= MIN_VARIANTI && ghigliottina),
      varianti: varianti ? varianti.n : 0,
      ghigliottina,
      perche:
        manca(loopSez, "loop interno") ||
        [
          varianti && varianti.n >= MIN_VARIANTI
            ? `genera ${varianti.n} varianti («${varianti.frase}»)`
            : "non dichiara quante varianti genera: senza un numero non c'è niente da scegliere",
          ghigliottina ? "con domanda-ghigliottina" : "senza una domanda-ghigliottina vera (la parola c'è, il punto interrogativo no)",
        ].join(" · "),
    },
    galleria: {
      ok: goldOk && spazzaturaOk,
      gold: galleria.gold.length,
      spazzatura: galleria.spazzatura.length,
      perche:
        manca(galleriaSez, "galleria") ||
        [
          goldOk ? "un GOLD annotato" : galleria.gold.length ? "il GOLD c'è ma nessuno spiega perché è oro" : "nessun esempio GOLD",
          spazzaturaOk
            ? "una SPAZZATURA annotata"
            : galleria.spazzatura.length
              ? "la SPAZZATURA c'è ma nessuno spiega perché muore"
              : "nessun esempio SPAZZATURA",
        ].join(" · "),
    },
    trappole: {
      ok: trappole.voci.length >= MIN_TRAPPOLE,
      voci: trappole.voci.length,
      perche:
        manca(trappoleSez, "trappole del mestiere") ||
        `${trappole.voci.length} trappole su ${MIN_TRAPPOLE} richieste`,
    },
    carburante: {
      ok: carburante.voci.length >= MIN_VOCI_CARBURANTE,
      voci: carburante.voci.length,
      perche:
        manca(carburanteSez, "carburante") ||
        (carburante.voci.length >= MIN_VOCI_CARBURANTE
          ? `${carburante.voci.length} voci di carburante elencate`
          : `${carburante.voci.length} voci su ${MIN_VOCI_CARBURANTE}: è una frase, non un elenco di dati/foto/chiavi`),
    },
  };
}

/**
 * I difetti di sostanza di UN mansionario. `blocchiCopiati` arriva da fuori come per i kit: la
 * fotocopia è una misura relativa al parco e un file solo non può vederla.
 * @param {string} testo
 * @param {{blocchiCopiati?: number}} [opzioni]
 * @returns {string[]}
 */
export function difettiSostanza(testo = "", { blocchiCopiati = 0 } = {}) {
  const m = misureMansionario(testo);
  const d = [];
  if (!m.modelli.ok) d.push(DIFETTO_SOSTANZA.MODELLI_POVERI);
  if (!m.loop.ok) d.push(DIFETTO_SOSTANZA.LOOP_SENZA_VARIANTI);
  if (!m.galleria.ok) d.push(DIFETTO_SOSTANZA.GALLERIA_SENZA_PERCHE);
  if (!m.trappole.ok) d.push(DIFETTO_SOSTANZA.TRAPPOLE_SCARSE);
  if (!m.carburante.ok) d.push(DIFETTO_SOSTANZA.CARBURANTE_GENERICO);
  if (blocchiCopiati > 0) d.push(DIFETTO_SOSTANZA.MANSIONARIO_FOTOCOPIA);
  return d;
}
