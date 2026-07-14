// Spiegazione in italiano semplice per ogni tipo di avviso della macchina.
// Usata in Azioni › Avvisi (scheda gialla) e nel contesto «Parla con questa casella».

export function descrizioneAvviso(testo: string): string {
  const t = (testo || "").toLowerCase();

  if (
    t.includes("memoria incoerente") ||
    t.includes("vault sporco") ||
    t.includes("giro non pubblicato")
  ) {
    return (
      "In un file di memoria è rimasto un dato vecchio che non coincide più con quello giusto, " +
      "oppure un file è corrotto. Il guardiano ha bloccato il giro così non ti arrivano numeri " +
      "o date sbagliate nel Pannello. La memoria di quel giro resta solo sul server finché non si sistema. " +
      "Se l'avviso è di giorni fa e la memoria ora è a posto, è storico: resta in lista finché non lo marchiamo risolto."
    );
  }

  if (t.includes("segreto") || t.includes("scan-segreti")) {
    return (
      "Il controllo anti-segreti ha trovato qualcosa che non deve finire in memoria pubblicata. " +
      "Il giro non è stato pubblicato finché non si rimuove."
    );
  }

  if (t.includes("onesta") || t.includes("onestà")) {
    return (
      "Il controllo onestà ha bloccato il giro: c'era un numero o un claim senza fonte verificabile. " +
      "Meglio un giro fermato che un dato inventato in Cabina."
    );
  }

  return "Avviso della macchina: sotto trovi il testo tecnico con data e dettaglio.";
}

/** Contesto completo per «Parla con questa casella» su un avviso. */
export function contestoAvviso(av: { testo: string; at?: string }): string {
  const parti = [
    `## Descrizione dell'avviso\n${descrizioneAvviso(av.testo)}`,
    `## Testo tecnico\n${av.testo}`,
    av.at && `Quando: ${av.at}`,
  ].filter(Boolean);
  return parti.join("\n\n");
}
