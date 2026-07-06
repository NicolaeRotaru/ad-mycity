// 🧮 UNA SOLA VERITÀ per i numeri "derivati": cassa/runway e unit-economics/break-even.
// Prima queste formule erano COPIATE in più route (/api/metriche, /api/metriche/cassa,
// /api/metriche/unit): bastava cambiarne una perché due schermate mostrassero numeri
// diversi (il "un'area dice una cosa, l'altra un'altra"). Ora c'è un solo punto: se la
// formula cambia, cambia ovunque insieme.

const r2 = (n: number) => Math.round(n * 100) / 100;

export type Runway = {
  collegato: boolean;
  cassa_attuale: number;
  burn_lordo: number;
  ricavo_commissioni_30g: number;
  burn_netto: number;
  runway_mesi: number | null;
  sostenibile: boolean;
};

/**
 * Cassa / burn / runway a partire da: cassa disponibile, costi fissi mensili (burn
 * lordo) e ricavo commissioni degli ultimi 30 giorni. Il ricavo va passato da UNA
 * sola fonte (getMargineReale), così i due endpoint non possono divergere.
 */
export function calcolaRunway(cassa: number, burnLordo: number, ricavo30: number): Runway {
  const burnNetto = burnLordo - ricavo30; // quanto bruciamo davvero al mese, al netto dei ricavi
  return {
    collegato: cassa > 0 || burnLordo > 0 || ricavo30 > 0,
    cassa_attuale: r2(cassa),
    burn_lordo: r2(burnLordo),
    ricavo_commissioni_30g: r2(ricavo30),
    burn_netto: r2(burnNetto),
    // runway "infinito" (null) se il burn netto è ≤0: siamo già sostenibili.
    runway_mesi: burnNetto > 0 && cassa > 0 ? Math.round((cassa / burnNetto) * 10) / 10 : null,
    sostenibile: burnNetto <= 0 && (burnLordo > 0 || ricavo30 > 0),
  };
}

export type UnitEconomics = {
  margine_per_ordine: number;
  cm_per_ordine: number;
  break_even_ordini_mese: number | null;
};

/**
 * Margine per ordine e break-even mensile, dal margine di CONTRIBUZIONE:
 * commissione sullo scontrino + fee di consegna incassata − costo reale di consegna.
 * Il break-even usa il CM non arrotondato (come le route originali).
 */
export function calcolaUnitEconomics(opts: {
  scontrino: number;
  commissione: number;
  costoFisso: number;
  feeCliente: number;
  costoConsegna: number;
}): UnitEconomics {
  const { scontrino, commissione, costoFisso, feeCliente, costoConsegna } = opts;
  const marginePerOrdine = (scontrino * commissione) / 100; // solo commissione (lordo logistica)
  const cmPerOrdine = marginePerOrdine + feeCliente - costoConsegna; // contribuzione reale
  return {
    margine_per_ordine: r2(marginePerOrdine),
    cm_per_ordine: r2(cmPerOrdine),
    break_even_ordini_mese: costoFisso > 0 && cmPerOrdine > 0 ? Math.ceil(costoFisso / cmPerOrdine) : null,
  };
}
