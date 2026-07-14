export type OpportunitaInput = {
  titolo: string;
  motivo: string;
  impatto: string;
  sforzo: string;
};

/** Spiegazione in italiano semplice per le opportunità del briefing. */
export function descrizioneOpportunita(o: OpportunitaInput): string {
  const titolo = (o.titolo || "").toLowerCase();
  const motivo = (o.motivo || "").toLowerCase();
  const testo = `${titolo} ${motivo}`;

  if (
    testo.includes("494") ||
    testo.includes("campi catalogo") ||
    testo.includes("condition") ||
    testo.includes("unit") ||
    testo.includes("supervisione") && (testo.includes("catalogo") || testo.includes("prodott"))
  ) {
    return (
      "La macchina ha controllato le schede prodotto e ha trovato campi vuoti che i clienti vedono incompleti. " +
      "Propone di riempirli in automatico con valori sensati: «nuovo» per la condizione (252 schede) e «pezzo» " +
      "come unità di misura (242 schede) — in totale 494 campi. Non devi fare nulla a mano prodotto per prodotto. " +
      "È reversibile: se non ti convince, si annulla tutto insieme. Per approvare vai in Azioni → Da approvare: " +
      "ci sono due card separate, una per la condizione e una per l'unità."
    );
  }

  if (testo.includes("pr") && (testo.includes("tempo reale") || testo.includes("sync") || testo.includes("live"))) {
    return (
      "C'è una modifica al Pannello pronta da mergiare: dopo l'approvazione le card e la chat si aggiornano da sole " +
      "senza ricaricare la pagina. Impatto alto, un solo click in Azioni → Da approvare."
    );
  }

  if (testo.includes("venerdì piacentini") || testo.includes("primo ordine")) {
    return (
      "Il prossimo Venerdì Piacentini (17 luglio) è l'occasione per il primo ordine reale su MyCity: caldo forte, " +
      "Pane Quotidiano già online, argomento consegna fresca a domicilio. Serve preparazione marketing e logistica."
    );
  }

  if (o.motivo?.trim()) {
    return `${o.motivo.trim()} Impatto ${o.impatto}, sforzo ${o.sforzo}.`;
  }

  return "Opportunità emersa dall'ultimo giro dell'AD: sotto trovi titolo e dettaglio tecnico.";
}

/** Contesto completo per «Parla con questa casella» su un'opportunità. */
export function contestoOpportunita(o: OpportunitaInput): string {
  const parti = [
    `## Descrizione dell'opportunità\n${descrizioneOpportunita(o)}`,
    `## Dettaglio\nTitolo: ${o.titolo}\nMotivo: ${o.motivo}\nImpatto: ${o.impatto} · Sforzo: ${o.sforzo}`,
  ];
  return parti.join("\n\n");
}
