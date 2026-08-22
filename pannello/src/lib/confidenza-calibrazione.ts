// 📊 QUANTO CI SI PUÒ FIDARE DI QUEL PUNTEGGIO — la barra della Cabina dice la confidenza, non la fortuna.
//
// IL DIFETTO (AR-131). Il lower-bound di Wilson viene calcolato e salvato in `calibrazione.json` dal
// 3 luglio, e la Cabina non lo ha mai mostrato: disegnava la barra su `punteggio`, la proporzione
// grezza. Su un reparto con tre esiti azzeccati su tre quella barra è VERDE PIENA (1.00) mentre la
// confidenza reale è 0.38 — cioè Nicola vedeva il massimo della fiducia proprio dove ce n'era meno.
// Over-confidence nella riga che serve a decidere quanta autonomia lasciare alla macchina.
//
// Perché la decisione sta qui e non dentro il componente: una regola scritta dentro il JSX non la
// può eseguire nessuna prova, e questa famiglia di difetti è nata proprio da giudizi che nessuno
// poteva far girare. Il componente disegna; qui si decide cosa disegnare.

export type RigaCalibrazione = {
  reparto?: string;
  previsioni?: number;
  azzeccate?: number;
  punteggio?: number;
  lower_bound?: number;
  autonomia?: string;
};

export type BarraConfidenza = {
  /** Il numero su cui disegnare la barra: la confidenza, mai la proporzione grezza. */
  valore: number | null;
  /** Il testo accanto alla barra. Dice ENTRAMBI i numeri quando divergono, o si tace. */
  etichetta: string;
  /** true quando non c'è abbastanza materiale per dire niente: ⚪ non è uno zero. */
  cieco: boolean;
  /** true quando grezzo e confidenza raccontano due storie diverse: è il caso da mostrare. */
  divergente: boolean;
};

/** Sotto questa distanza i due numeri dicono la stessa cosa e non vale la pena occupare spazio. */
const SOGLIA_DIVERGENZA = 0.15;

export function barraConfidenza(r: RigaCalibrazione | null | undefined): BarraConfidenza {
  const previsioni = Number(r?.previsioni);
  const grezzo = Number(r?.punteggio);
  const conf = Number(r?.lower_bound);

  // Nessuna previsione chiusa: non c'è niente da misurare. Zero direbbe «ha sbagliato tutto», che è
  // un'altra cosa — la stessa distinzione fra ⚪ e ❌ che vale in tutto il resto della macchina.
  if (!Number.isFinite(previsioni) || previsioni <= 0) {
    return { valore: null, etichetta: "nessuna previsione chiusa", cieco: true, divergente: false };
  }

  // Il lower-bound manca (una riga scritta prima che esistesse): si dice, non si inventa e non si
  // ripiega in silenzio sul grezzo — ripiegare in silenzio È il difetto.
  if (!Number.isFinite(conf)) {
    return {
      valore: Number.isFinite(grezzo) ? grezzo : null,
      etichetta: "confidenza non calcolata su questa riga",
      cieco: true,
      divergente: false,
    };
  }

  const divergente = Number.isFinite(grezzo) && grezzo - conf >= SOGLIA_DIVERGENZA;
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  return {
    valore: conf,
    etichetta: divergente
      ? `confidenza ${pct(conf)} · grezzo ${pct(grezzo)} su ${previsioni}`
      : `confidenza ${pct(conf)} su ${previsioni} previsioni`,
    cieco: false,
    divergente,
  };
}
