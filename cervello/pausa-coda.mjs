#!/usr/bin/env node
// AR-159 · AR-157 — una pausa è uno STATO, non una frase.
//
// Il 23/7 Nicola ha rimandato l'inserimento negozi. La decisione è finita a verbale così:
// «12 azioni in pausa — riprendono da sole al 24/8-1/9». Misurato oggi (28/7), quella frase è falsa
// due volte:
//
//   ① **nessuno le sveglia.** Il carattere `⏸` compare in 11 card e in 12 righe di tabella. L'unico
//      punto di questa macchina che lo legge è `guardiano-tempo.mjs:38`, e lo usa per **togliere** la
//      card dal conteggio delle firme che aspettano — con l'etichetta «in attesa di una condizione,
//      non di te». È una rassicurazione scritta nel codice: qualcuno controllerà. Non esiste quel
//      qualcuno. Una card in pausa esce dal radar e ci resta.
//
//   ② **la data è ricopiata, non collegata.** Undici card su undici hanno «24/8-1/9» dentro il
//      titolo. Il valore vero vive in `registro-fatti.json` (`ripresa.lavoro-operativo`) — e sta già
//      per cambiare: Nicola ha indicato due volte metà agosto (STATO 26/7 ~01:05 e ~01:10) e la card
//      `#conferma-piano-squadra-ripresa-negozi` aspetta ancora risposta. Il giorno in cui risponde,
//      undici titoli diventano bugie tutte insieme. È AR-102 applicato alla coda: **il fatto ha una
//      casa sola, gli altri lo citano.**
//
// La stessa forma di lotto 14 (un countdown trascritto invece che calcolato) vista da un'altra
// stanza: uno stato che vive nella prosa invece che in un campo. Lì era una scadenza esterna, qui è
// una decisione di Nicola.
//
// AR-157 è il caso che fa male: `#ordine-test-pq` — l'unico ordine che proverebbe che i soldi
// arrivano davvero al fornaio — è congelato da una pausa che esiste **proprio per finire la
// macchina**. La coda non ha un campo per distinguere «azione di business» da «azione che dimostra
// che un pezzo funziona», quindi la classificazione l'ha fatta il tema della card. Questo file dà il
// campo. **Non dà la risposta**: se un'azione di validazione resta congelata lo decide Nicola, e la
// regola qui è che gliel'abbiamo chiesto — non che abbiamo scelto per lui.
//
// Nessuna dipendenza, nessun orologio interno, nessun disco: tutto entra come argomento, così un
// test può eseguire queste decisioni su un ingresso finto invece di guardare com'è il mondo adesso.

/** Le due nature di un'azione in coda. La terza non è una classe: è l'assenza del campo. */
export const CLASSI = {
  BUSINESS: "business", // spinge il mercato: post, WhatsApp, email, referral, spesa
  VALIDAZIONE: "validazione", // dimostra che un pezzo di macchina funziona: ordine-test, payout-test
  NON_DICHIARATA: "non-dichiarata",
};

/** Di cosa parla una pausa. Serve per AR-157: una pausa di business non è competente sul tecnico. */
export const AMBITO_PER_FATTO = {
  "ripresa.lavoro-operativo": "business",
};

// ── ① La data ricopiata ──────────────────────────────────────────────────────

const MESI = {
  gennaio: 1, febbraio: 2, marzo: 3, aprile: 4, maggio: 5, giugno: 6,
  luglio: 7, agosto: 8, settembre: 9, ottobre: 10, novembre: 11, dicembre: 12,
};

/**
 * Tutte le date scritte a mano in un testo, ridotte a (giorno, mese) — la forma in cui «1/9»,
 * «1 settembre» e «2026-09-01» sono la stessa cosa. Serve per confrontarle con quelle del fatto.
 */
export function dateNelTesto(testo) {
  const s = String(testo || "");
  const trovate = [];
  for (const m of s.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) {
    trovate.push({ g: +m[3], m: +m[2], anno: +m[1], testo: m[0] });
  }
  for (const m of s.matchAll(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/g)) {
    trovate.push({ g: +m[1], m: +m[2], anno: m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : null, testo: m[0] });
  }
  const rx = new RegExp(`\\b(\\d{1,2})\\s+(${Object.keys(MESI).join("|")})\\b`, "gi");
  for (const m of s.matchAll(rx)) {
    trovate.push({ g: +m[1], m: MESI[m[2].toLowerCase()], anno: null, testo: m[0] });
  }
  return trovate;
}

/**
 * **La regola di AR-102 applicata alla coda:** una card non può contenere il VALORE del fatto da cui
 * dipende — deve citarne l'id. Torna il pezzo di testo colpevole, o null.
 *
 * Il confronto è col valore vero del fatto, non con «qualcosa che somiglia a una data»: così la card
 * `#post-meteo-pioggia-20lug` può tenersi il suo «20/7» (è la SUA data, un fatto suo) e viene
 * bocciata solo per il «24/8-1/9», che è la copia della decisione di Nicola.
 *
 * Perché conta adesso e non un giorno astratto: Nicola ha già indicato due volte una data diversa
 * (metà agosto, STATO 26/7). Quando risponde, ogni copia diventa falsa nello stesso istante.
 */
export function ricopiaDelFatto(testo, valoreFatto) {
  const suoi = dateNelTesto(valoreFatto).map((d) => `${d.g}-${d.m}`);
  if (!suoi.length) return null;
  for (const d of dateNelTesto(testo)) {
    if (suoi.includes(`${d.g}-${d.m}`)) return d.testo;
  }
  return null;
}

// ── ② La riga di pausa strutturata ───────────────────────────────────────────

/**
 * Legge la riga che rende la pausa un dato:
 *
 *   - **⏸ Pausa:** rinvio negozi · classe **business** · riprende con `ripresa.lavoro-operativo`
 *
 * Il motivo resta in italiano per Nicola; la classe e il fatto sono i due campi che il codice usa.
 * Il fatto è un **id**, mai un valore: è la differenza fra citare e ricopiare.
 *
 * Le date nel motivo non sono vietate in blocco — sarebbe una regola che punisce anche la verità: la
 * card `#post-meteo-pioggia-20lug` deve poter dire che la SUA data, il 20/7, è passata. Vietata è
 * solo la copia del valore del fatto da cui la pausa dipende (`ricopiaDelFatto`).
 */
export function leggiRigaPausa(testo) {
  const riga = String(testo || "")
    .split("\n")
    .find((l) => /\*\*⏸\s*Pausa:\*\*/.test(l));
  if (!riga) return null;
  const classe = (riga.match(/classe\s+\*\*([a-z-]+)\*\*/i) || [])[1] || CLASSI.NON_DICHIARATA;
  const fatto = (riga.match(/riprende con\s+`([^`]+)`/i) || [])[1] || null;
  const motivo = (riga.match(/\*\*⏸\s*Pausa:\*\*\s*([^·]+)/) || [])[1]?.trim() || "";
  return {
    riga,
    motivo,
    classe: Object.values(CLASSI).includes(classe) ? classe : CLASSI.NON_DICHIARATA,
    fatto,
    dataNellaRiga: dateNelTesto(riga)[0]?.testo || null,
  };
}

/**
 * Divide il file della coda nelle sue card `### …` e legge di ciascuna quello che serve qui.
 * Le righe di tabella del vecchio formato NON sono card: chi chiama deve saperlo e dirlo, non
 * ignorarle in silenzio (vedi `pausa-check.mjs`, che le conta e le dichiara fuori).
 */
export function leggiCard(testoFile) {
  const righe = String(testoFile || "").split("\n");
  const card = [];
  let corrente = null;
  // Dal 13/8 il titolo porta il NUMERO della card («#41 — …») e lo slug vive nell'ancora
  // `<!-- slug -->` subito sopra: l'id si prende da lì. Il match sul titolo resta come
  // fallback per il formato vecchio («#ordine-test-pq — …»), che le fixture usano ancora.
  let ancora = null;
  righe.forEach((l, i) => {
    const mAncora = l.match(/^<!--\s*(\S+)\s*-->\s*$/);
    if (mAncora) {
      ancora = mAncora[1];
      if (corrente) corrente.corpo.push(l);
      return;
    }
    if (/^###\s/.test(l)) {
      if (corrente) card.push(corrente);
      const nelTitolo = (l.match(/#([a-z0-9][a-z0-9-]*)/i) || [])[1] || null;
      const id = /^\d+$/.test(nelTitolo || "") ? ancora || nelTitolo : nelTitolo || ancora;
      ancora = null;
      corrente = { id, riga: i + 1, titolo: l, corpo: [] };
    } else if (/^##?\s/.test(l)) {
      // Una sezione `##`/`#` CHIUDE la card: senza questo confine l'ultima card della coda si
      // inghiottiva la sezione dopo (Supervisione, Archivio) — lo stesso difetto che faceva
      // accumulare 101 intestazioni all'housekeeping.
      if (corrente) card.push(corrente);
      corrente = null;
      ancora = null;
    } else {
      // L'ancora vale solo se resta attaccata alla card: una riga di contenuto in mezzo la spegne.
      if (l.trim() && l.trim() !== "---") ancora = null;
      if (corrente) corrente.corpo.push(l);
    }
  });
  if (corrente) card.push(corrente);
  return card.map((c) => {
    const corpo = c.corpo.join("\n");
    const pausa = leggiRigaPausa(corpo);
    return {
      id: c.id,
      riga: c.riga,
      titolo: c.titolo,
      corpo,
      // In pausa per il simbolo nel titolo **oppure** per la riga strutturata: le due strade devono
      // dare lo stesso risultato, e quando non lo danno è il guardiano a dirlo (una card marcata ⏸
      // senza riga non ha risveglio; una riga senza ⏸ non si vede a colpo d'occhio).
      inPausa: /⏸/.test(c.titolo) || pausa != null,
      marcataNelTitolo: /⏸/.test(c.titolo),
      pausa,
    };
  });
}

/**
 * Tutti i numeri di card già usati nella coda, in un posto solo.
 *
 * Una card si scrive in DUE forme, e valgono uguale: il titolo `### 🟡 #81 — …` delle card in
 * attesa, e la riga-tabella `| 81 | data | … |` di quelle archiviate. Sono la stessa cosa in due
 * momenti della vita: quando Nicola scrive «ok 81», la risposta deve essere una sola.
 */
export function numeriUsati(testoFile) {
  const testo = String(testoFile || "");
  const numeri = new Set();
  for (const m of testo.matchAll(/^###\s+\S+\s+#(\d+)\s+[—–-]\s/gmu)) numeri.add(Number(m[1]));
  for (const m of testo.matchAll(/^\|\s*(\d+)\s*\|/gm)) numeri.add(Number(m[1]));
  return numeri;
}

/**
 * Il numero per la PROSSIMA card della coda: il più alto mai usato + 1 (regola del 13/8,
 * `cervello/azioni.md`). Su una coda senza numeri parte da 1. Casa unica: la usano tutti
 * gli scrittori automatici di card (sensori-spenti-check, pausa-check), così nessuno
 * ricalcola la regola per conto suo.
 *
 * ⚠️ «Il più alto mai usato» include l'ARCHIVIO, e per un po' non è stato così. Questa funzione
 * guardava solo i titoli delle card ancora in attesa: quelle archiviate, che scendono in fondo
 * come righe di tabella, erano invisibili. Il 16/8 la coda aveva 81 come titolo più alto e 91 in
 * archivio, quindi il prossimo numero usciva 82 — un numero già speso. È successo davvero: una
 * card nata alle 07:20 ha preso il #81, che l'archivio dava già a un merge del 13/8, e «ok 81»
 * è diventata una domanda con due risposte. Archiviare una card non libera il suo numero: la
 * card è ancora lì, è solo scesa di sotto.
 */
export function prossimoNumero(testoFile) {
  const usati = numeriUsati(testoFile);
  return usati.size ? Math.max(...usati) + 1 : 1;
}

// ── ③ Dal valore del fatto al momento del risveglio ──────────────────────────

/**
 * Trasforma il valore in italiano del fatto («dopo il 24 agosto - 1 settembre 2026») nel giorno in
 * cui la pausa finisce. Due scelte dichiarate:
 *
 *  · **si prende il bordo TARDI di un intervallo.** «24 agosto - 1 settembre» finisce l'1/9, non il
 *    24/8. Svegliarsi un giorno tardi su una decisione di Nicola è un fastidio; svegliarsi un giorno
 *    presto è la macchina che gli rimette in lista roba che aveva rimandato.
 *  · **senza anno esplicito è ambigua.** «metà agosto» non è una data: non si indovina. Ambigua non
 *    è un rosso ed è l'opposto di un verde — è il buio dichiarato (AR-322), e chi chiama esce 2.
 */
export function risolviRipresa(valoreFatto) {
  const s = String(valoreFatto || "");
  if (!s.trim()) return { iso: null, ambigua: true, perche: "il fatto non ha valore" };

  const iso = s.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) return { iso: `${iso[1]}-${iso[2]}-${iso[3]}`, ambigua: false, perche: "data ISO esplicita" };

  const anno = (s.match(/\b(20\d{2})\b/) || [])[1];
  const candidate = [];
  const rx = new RegExp(`\\b(\\d{1,2})\\s+(${Object.keys(MESI).join("|")})\\b`, "gi");
  for (const m of s.matchAll(rx)) candidate.push({ g: +m[1], m: MESI[m[2].toLowerCase()] });
  for (const m of s.matchAll(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/g)) {
    candidate.push({ g: +m[1], m: +m[2], anno: m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : undefined });
  }
  if (!candidate.length) {
    return { iso: null, ambigua: true, perche: `nessun giorno esplicito in «${s.slice(0, 60)}»` };
  }
  if (!anno && !candidate.some((c) => c.anno)) {
    return { iso: null, ambigua: true, perche: `nessun anno esplicito in «${s.slice(0, 60)}»` };
  }
  const conAnno = candidate.map((c) => ({ ...c, anno: c.anno || +anno }));
  // Il bordo tardi: ordina per (anno, mese, giorno) e prendi l'ultimo.
  conAnno.sort((a, b) => a.anno - b.anno || a.m - b.m || a.g - b.g);
  const fine = conAnno[conAnno.length - 1];
  const p2 = (n) => String(n).padStart(2, "0");
  return {
    iso: `${fine.anno}-${p2(fine.m)}-${p2(fine.g)}`,
    ambigua: false,
    perche: conAnno.length > 1 ? "bordo tardi dell'intervallo" : "data unica",
  };
}

// ── ④ La decisione: questa pausa vale ancora? ────────────────────────────────

/**
 * Quattro esiti, non due:
 *   · `non-in-pausa`     — la card è viva
 *   · `attiva`           — in pausa, con una data futura: tutto regolare
 *   · `scaduta`          — il momento è passato e la card è ancora ferma → **nessuno l'ha svegliata**
 *   · `senza-risveglio`  — in pausa e non esiste un momento in cui finisce → dorme per sempre
 *
 * `senza-risveglio` è il difetto AR-159 nella sua forma pura, ed è quello che oggi vale per tutte e
 * undici le card: la data c'è, ma scritta in un titolo che nessun orologio legge.
 */
export function statoPausa({ inPausa = false, ripresaIso = null, adessoMs = 0 } = {}) {
  if (!inPausa) return "non-in-pausa";
  if (!ripresaIso) return "senza-risveglio";
  const m = String(ripresaIso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "senza-risveglio";
  // Finisce a fine giornata del giorno indicato: «dopo l'1 settembre» vuol dire che l'1 è ancora dentro.
  const fine = new Date(+m[1], +m[2] - 1, +m[3], 23, 59, 59).getTime();
  return Number(adessoMs) > fine ? "scaduta" : "attiva";
}

/**
 * AR-157 — una pausa di business non è competente su un'azione di validazione.
 *
 * Non decide di scongelare: dice che quel congelamento **non è ovvio** e va confermato da chi l'ha
 * deciso. La differenza conta: la card `#ordine-test-pq` è ferma perché Nicola ha rimandato
 * l'inserimento negozi, ma quella pausa esiste per avere il tempo di finire la macchina — e quella
 * card è il collaudo della macchina. Può darsi che Nicola la voglia ferma lo stesso (deve ordinare
 * lui, e il fornaio deve preparare). È una sua decisione, non una deduzione nostra.
 */
export function congelamentoLegittimo({ classeCard = CLASSI.NON_DICHIARATA, ambitoPausa = "sconosciuto" } = {}) {
  if (classeCard === CLASSI.NON_DICHIARATA) {
    return { legittimo: false, daChiedere: false, perche: "la card non dichiara se è business o validazione" };
  }
  if (classeCard === CLASSI.VALIDAZIONE && ambitoPausa === "business") {
    return {
      legittimo: false,
      daChiedere: true,
      perche: "è un'azione di validazione ferma per una pausa di business: la pausa esiste proprio per finire la macchina",
    };
  }
  return { legittimo: true, daChiedere: false, perche: "pausa e card parlano dello stesso ambito" };
}

export function ambitoDelFatto(fattoId) {
  return AMBITO_PER_FATTO[String(fattoId || "")] || "sconosciuto";
}

// ── ⑤ L'esito del guardiano ──────────────────────────────────────────────────

/**
 * Contratto dei guardiani (AR-322): `0` passato · `1` fallito · `2` cieco.
 * Cieco vince su fallito: se non ho potuto calcolare il risveglio, non so nemmeno se le pause sono
 * scadute — dire «rosso» sarebbe inventarsi una misura che non ho.
 */
export function codiceUscita({ cieco = 0, violazioni = 0 } = {}) {
  if (cieco > 0) return 2;
  return violazioni > 0 ? 1 : 0;
}
