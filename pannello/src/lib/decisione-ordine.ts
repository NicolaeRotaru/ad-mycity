// Retrocompatibilità — usa scelta-ab.ts (tipo generico scelta_ab).

export {
  LEGACY_ORDINE_ID as ORDINE_ZOMBIE_ID,
  LEGACY_ORDINE_CHIAVE as IMPOSTAZIONE_CHIAVE,
  type SceltaAB as SceltaOrdineAB,
  type DecisioneSceltaSalvata as DecisioneOrdineSalvata,
  isPropostaSceltaAB as isPropostaDecisioneOrdineAB,
  normalizzaPropostaSceltaAB,
  etichettaScelta,
} from "@/lib/scelta-ab";

import { normalizzaPropostaSceltaAB, etichettaScelta, type SceltaAB } from "@/lib/scelta-ab";

/** @deprecated Usa etichettaScelta(config, scelta) */
export function etichettaSceltaOrdine(scelta: SceltaAB): string {
  const c = normalizzaPropostaSceltaAB({ tipo: "decisione_ordine_ab" });
  return etichettaScelta(c, scelta);
}
