// 🎡 VOLANO-NUMERI — la definizione UNICA di «lezione applicata» e la soglia UNICA del volano.
//
// AR-149. Il numero che dice se la macchina impara davvero era calcolato da chi lo pubblicava, con
// una definizione privata, e letto da un secondo programma con una soglia diversa:
//
//   · `tasso-lezioni.mjs` decideva «applicata» dentro di sé (funzione locale) e bocciava sotto 0,3.
//   · `sonda-volano.mjs` prendeva quello stesso numero e accendeva `loop_chiude` con `tasso > 0`.
//
// Stesso dato, due metri. Con il tasso vero al 17% il primo suonava l'allarme e il secondo scriveva
// `loop_chiude: true` nel file che la Cabina mostra a Nicola. Nessuno dei due mentiva da solo: la
// bugia nasceva dall'avere due definizioni per una cosa sola. È la stessa malattia di AR-180 e di
// AR-344, e la cura è sempre quella: **la regola sta in un posto, senza dipendenze, dove un test la
// può eseguire**, e chi decide la chiama.
//
// Qui dentro non si legge nessun file: chi legge il disco sta fuori e passa i fatti già raccolti.

/** La soglia sotto la quale il volano è fermo. UN numero, UNA casa. */
export const SOGLIA_APPLICAZIONE = 0.3;

/** La finestra di freschezza di un uso, in giorni. */
export const FINESTRA_GIORNI_DEFAULT = 30;

/** Giorni trascorsi da una data (AAAA-MM-GG, con o senza ora). `Infinity` se non è una data. */
export function giorniDa(dataStr, adesso = Date.now()) {
  if (!dataStr || typeof dataStr !== "string") return Infinity;
  const m = dataStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return Infinity;
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
  if (isNaN(d.getTime())) return Infinity;
  return Math.floor((adesso - d.getTime()) / 86400000);
}

/**
 * UNA lezione è stata applicata?
 *
 * Due prove, in quest'ordine:
 *   (a) la lezione porta un `usi`/`applicata_in` con una voce dentro la finestra — è la traccia
 *       esplicita, quella che lascia `tasso-lezioni.mjs applica`;
 *   (b) il suo id compare nel testo recente della memoria (briefing, decisioni, esiti, consegne).
 *
 * Il limite di (b) è dichiarato e non nascosto: il richiamo di una lezione dentro il lavoro vero è
 * quasi sempre implicito, quindi questo numero SOTTOSTIMA. È il motivo per cui il rimedio giusto ad
 * AR-149 non è alzare il numero ma scrivere «APPLICATE: L-xxx» quando una lezione si usa davvero.
 */
export function lezioneApplicata(lez, testoRecente, { giorni = FINESTRA_GIORNI_DEFAULT, adesso = Date.now() } = {}) {
  if (!lez) return false;
  const usi = lez.usi || lez.applicata_in || [];
  if (Array.isArray(usi) && usi.length) {
    for (const u of usi) {
      const quando = typeof u === "object" ? u.data || u.quando : null;
      if (quando == null || giorniDa(quando, adesso) <= giorni) return true;
    }
  }
  if (lez.id && String(testoRecente ?? "").includes(lez.id)) return true;
  return false;
}

/** Il tasso, con i due elenchi che lo compongono. Chi mostra un tasso deve poter mostrare chi c'è dentro. */
export function tassoApplicazione(lezioniAttive = [], testoRecente = "", opzioni = {}) {
  const attive = Array.isArray(lezioniAttive) ? lezioniAttive : [];
  const applicate = attive.filter((l) => lezioneApplicata(l, testoRecente, opzioni));
  const tasso = attive.length ? Math.round((applicate.length / attive.length) * 100) / 100 : 0;
  return {
    attive: attive.length,
    applicate: applicate.length,
    applicate_ids: applicate.map((l) => l.id).filter(Boolean),
    non_applicate_ids: attive.filter((l) => !lezioneApplicata(l, testoRecente, opzioni)).map((l) => l.id).filter(Boolean),
    tasso,
  };
}

/** Il tasso è sopra la soglia? L'unica funzione che ha il diritto di confrontarlo con un numero. */
export function sopraSoglia(tasso, soglia = SOGLIA_APPLICAZIONE) {
  return Number(tasso) >= soglia;
}

/**
 * IL VERDETTO DEL VOLANO — il punto dove le due soglie diventano una.
 *
 * `chiude` è vero solo se il tasso è sopra soglia E c'è una prova di chiusura vera (un difetto
 * chiuso davvero, o una previsione/esperimento chiusi e misurati). Prima bastava `tasso > 0`: con
 * 42 giri consecutivi al 17% la Cabina ha scritto «il loop chiude» per 42 volte di fila.
 *
 * `sopra_soglia` resta esposto a parte apposta: chi legge deve poter distinguere «non chiude perché
 * manca la prova» da «non chiude perché le lezioni non si usano». Sono due guasti diversi.
 */
export function verdettoVolano({ tasso = 0, provaBusiness = false, provaArchitettura = false, soglia = SOGLIA_APPLICAZIONE } = {}) {
  const t = Number(tasso) || 0;
  const sopra = sopraSoglia(t, soglia);
  const prova = Boolean(provaBusiness || provaArchitettura);
  return {
    tasso: t,
    soglia,
    sopra_soglia: sopra,
    prova_chiusura: prova,
    chiude: sopra && prova,
    motivo: !prova
      ? "nessuna prova di chiusura: niente difetti chiusi, nessuna previsione o esperimento misurato"
      : !sopra
        ? `le lezioni non si usano: tasso ${Math.round(t * 100)}% sotto la soglia ${Math.round(soglia * 100)}%`
        : "il loop chiude: lezioni applicate sopra soglia e almeno una chiusura misurata",
  };
}

/** L'esito da riga di comando di chi misura il tasso: 0 = sopra soglia, 1 = volano fermo. */
export function esitoTasso(tasso, soglia = SOGLIA_APPLICAZIONE) {
  return sopraSoglia(tasso, soglia) ? 0 : 1;
}
