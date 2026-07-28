// Card 🔴 «decisione ordine»: bottoni A/B espliciti (non Approva/Ignora generico).

export const ORDINE_ZOMBIE_ID = "58094956-4b9b-49b4-9299-7a5c645d7cb3";
export const IMPOSTAZIONE_CHIAVE = "decisione:ordine-zombie-58094956";

export type SceltaOrdineAB = "A" | "B";

export type DecisioneOrdineSalvata = {
  scelta: SceltaOrdineAB;
  at: string;
  ordineId: string;
  titolo?: string;
  /**
   * L'id del lavoro accodato al cervello, `null` se l'accodamento è FALLITO (AR-231).
   *
   * Serve a distinguere «ho deciso e il cervello è partito» da «ho deciso e basta»: senza questo
   * campo la decisione sull'ordine da 19,05 € risultava presa anche quando il lavoro non era mai
   * nato, e il dedup impediva di riprovare. `undefined` = decisione salvata prima di questo campo
   * (storica): si tratta come «lavoro partito», per non riaprire card già chiuse davvero.
   */
  lavoro?: string | null;
};

export function isPropostaDecisioneOrdineAB(p: { titolo?: string; tipo?: string }): boolean {
  if (p.tipo === "decisione_ordine_ab") return true;
  const t = (p.titolo || "").toLowerCase();
  return /decisione ordine/.test(t) && (/a accetta/.test(t) || /a\/b/.test(t) || /zombie/.test(t));
}

export function etichettaSceltaOrdine(scelta: SceltaOrdineAB): string {
  return scelta === "A"
    ? "A — Accetta e organizza consegna (WhatsApp buyer + dashboard negozio)"
    : "B — Annulla con messaggio al buyer (slot scaduto, nessun addebito)";
}
