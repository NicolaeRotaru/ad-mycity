// lib-sensori-verdetto.mjs — Le DECISIONI di verifica-sensori in forma pura e testabile.
//
// La malattia che questo modulo cura: «i sensori raccontano il falso» — un verdetto che esce
// verde senza aver misurato niente di vero. Le regole che decidono l'esito vivevano dentro il
// main() di verifica-sensori.mjs (un programma-che-parte-importando): nessun test poteva
// eseguirle senza fare rete. Qui sono funzioni pure: dati dentro, verdetto fuori.
//
// AR-587 — il verdetto distingue «misurato e ok» da «non ho potuto misurare niente»:
//   un check che non dipende dall'ambiente (dipende_da_env: false, es. il guardiano esterno che
//   legge un file nel repo) NON può da solo far uscire l'esito "ok". Se nessun sensore
//   d'ambiente (chiavi/rete) è stato misurato, l'esito è "non_misurato" — cecità dichiarata.
// AR-590 — un sensore spento per DECISIONE del proprietario (es. POSTHOG_OFF=1, o una riga
//   'decisione' in sensori-motivi.json) va scritto come spento, non ripristinato al vecchio "ok".
// AR-591 — nel riassunto gli spenti non stanno nel denominatore dei rotti: si contano a parte.

/**
 * Il verdetto sui sensori, a partire dai check già eseguiti.
 *
 * Ogni check: { nome, ok, configurato?, dipende_da_env?, spento?, dettaglio? }.
 *  - configurato === false  → sensore senza chiave/URL: spento, non misurato.
 *  - dipende_da_env === false → il check non legge chiavi (guarda un file nel repo): il suo
 *    verde è vero ma NON è una misura dell'ambiente, quindi non vota per l'esito "ok".
 *
 * @returns {{esito: "ok"|"cieco"|"non_misurato", tuttiCiechi: boolean, totali: number,
 *           configurati: number, non_configurati: number, misurati_ambiente: number,
 *           ok_ambiente: number, ok_configurati: number}}
 */
export function verdettoSensori(checks) {
  const configurati = checks.filter((c) => c.configurato !== false);
  const okConfigurati = configurati.filter((c) => c.ok);
  // AR-587: il voto vero è sui sensori d'AMBIENTE misurati (chiavi presenti E il check le usa).
  const misuratiAmbiente = configurati.filter((c) => c.dipende_da_env !== false);
  const okAmbiente = misuratiAmbiente.filter((c) => c.ok);
  const esito = misuratiAmbiente.length === 0 ? "non_misurato" : okAmbiente.length === 0 ? "cieco" : "ok";
  return {
    esito,
    tuttiCiechi: esito !== "ok",
    totali: checks.length,
    configurati: configurati.length,
    non_configurati: checks.length - configurati.length,
    misurati_ambiente: misuratiAmbiente.length,
    ok_ambiente: okAmbiente.length,
    ok_configurati: okConfigurati.length,
  };
}

/**
 * La riga di sintesi che finisce nel segnale e nel report.
 * AR-591: il denominatore sono i CONFIGURATI (i sensori che potevano essere misurati), non tutti
 * i check: gli spenti si dichiarano a parte («· 2 spenti»), non si contano come rotti.
 */
export function sintesiSensori(v, maxCecita) {
  const spenti = v.non_configurati > 0 ? ` · ${v.non_configurati} spenti` : "";
  if (v.esito === "non_misurato") {
    return `NON MISURATO: 0 sensori d'ambiente misurabili da questa sessione (${v.non_configurati} senza chiave o spenti)`;
  }
  if (v.esito === "cieco") return `TUTTI CIECHI · max ${maxCecita} giri consecutivi${spenti}`;
  return `${v.ok_configurati}/${v.configurati} ok${spenti} · max cecità ${maxCecita} giri`;
}

/**
 * Le istruzioni per il giro. AR-587: non affermano MAI cose non misurate — il vecchio testo
 * «Stripe ok ma Supabase REST cieco» usciva anche quando Stripe non era stato misurato affatto.
 */
export function istruzioniGiro(esito, restOk) {
  if (esito === "non_misurato") {
    return "NESSUN sensore d'ambiente misurato da questa sessione (niente chiavi): lo stato reale dei sensori NON è visibile da qui. Non affermare nulla sulla loro salute e NON scrivere numeri nuovi: usa la baseline di STATO + sezione Gap.";
  }
  if (esito === "cieco") {
    return "Tutti i sensori REST ciechi: NON inventare numeri. Usa baseline STATO + sezione Gap. Passaggio minimo se nulla è cambiato fuori.";
  }
  if (restOk) {
    return "Supabase REST ok: usa questi dati per i 7 numeri anche se MCP Supabase è cieco. Segnala nei Gap solo ciò che REST non copre.";
  }
  return "Almeno un sensore d'ambiente risponde ma Supabase REST NON è leggibile: i numeri ordini/clienti restano ciechi — limita l'analisi ordini e verifica MARKETPLACE_SUPABASE_* sul VPS.";
}

/**
 * AR-590 — un sensore è «spento per DECISIONE» (non «non misurabile da qui») quando:
 *  - il check stesso lo dichiara (spento: true, es. POSTHOG_OFF=1 — la decisione di Nicola 5/7), o
 *  - cervello/sensori-motivi.json registra motivo "decisione" per quel sensore.
 * Per questi lo stato scritto resta "non_configurato": NON si ripristina il vecchio "ok" con la
 * protezione anti-calpestamento (AR-573), che è pensata per i sensori che da qui non si vedono,
 * non per quelli spenti apposta.
 */
export function eSpentoPerDecisione(check, motivi) {
  if (check?.spento === true) return true;
  return motivi?.motivi?.[check?.nome]?.motivo === "decisione";
}
