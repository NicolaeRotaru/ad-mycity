// Spiegazione in italiano semplice per ogni tipo di avviso della macchina.
// Usata in Azioni › Avvisi (scheda gialla) e nel contesto «Parla con questa casella».

export function descrizioneAvviso(testo: string): string {
  const t = (testo || "").toLowerCase();

  if (
    t.includes("memoria incoerente") ||
    t.includes("vault sporco") ||
    t.includes("giro non pubblicato")
  ) {
    return "Il giro non è stato pubblicato perché uno dei file di memoria conteneva un dato sbagliato o corrotto. La macchina si è fermata da sola per non mostrarti numeri o date errate nel Pannello. Il prossimo giro sistemerà tutto in automatico. Se l'avviso ha già qualche ora e il Pannello ora mostra dati freschi, il problema si è risolto da solo.";
  }

  if (t.includes("segreto") || t.includes("scan-segreti")) {
    return "La macchina ha trovato una chiave o una password nei file di memoria che stava per pubblicare. Ha bloccato tutto per sicurezza. Non ti arriva nessun segreto online finché non si rimuove il dato sensibile.";
  }

  if (t.includes("onesta") || t.includes("onestà")) {
    return "Il giro conteneva un numero o un'affermazione senza fonte verificabile. La macchina ha preferito non pubblicarlo piuttosto che mostrarti un dato inventato nel Pannello.";
  }

  if (t.includes("telegram") && (t.includes("non inviat") || t.includes("chiav"))) {
    return "Le notifiche che avrebbero dovuto arrivare su Telegram non sono partite perché le chiavi di collegamento non sono ancora attive. I messaggi restano qui nella casella e non si perdono.";
  }

  if (t.includes("guardian") || t.includes("battito") || t.includes("freschezza")) {
    return "Uno o più controlli automatici non hanno dato segnale nelle ultime ore. La macchina funziona, ma alcuni sensori di sicurezza sono silenziosi più del solito.";
  }

  if (t.includes("worker") && (t.includes("ferm") || t.includes("mort") || t.includes("riavvi"))) {
    return "Il motore automatico si è fermato e ha bisogno di essere riavviato. Finché è fermo, i giri automatici non partono.";
  }

  if (t.includes("node") && t.includes("non disponibil")) {
    return "Un componente tecnico necessario per i controlli di sicurezza non era disponibile. Il giro è stato bloccato per prudenza.";
  }

  // Fallback: descrizione generica se non rientra in nessun caso noto.
  return "La macchina ha segnalato qualcosa che vale la pena controllare. Il dettaglio tecnico è visibile espandendo la sezione qui sotto.";
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
