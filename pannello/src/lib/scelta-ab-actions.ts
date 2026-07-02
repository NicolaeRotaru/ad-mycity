import {
  chiaveScelta,
  etichettaScelta,
  normalizzaPropostaSceltaAB,
  parseDecisioneSalvata,
  LEGACY_ORDINE_CHIAVE,
  LEGACY_ORDINE_ID,
  type DecisioneSceltaSalvata,
  type PropostaSceltaAB,
  type SceltaAB,
} from "@/lib/scelta-ab";
import { creaLavoro, getImpostazione, memoryConnected, setImpostazione } from "@/lib/store";

export type RegistraSceltaInput = PropostaSceltaAB & {
  scelta: SceltaAB;
  id?: string;
};

export type RegistraSceltaResult =
  | { ok: true; decisione: DecisioneSceltaSalvata; giaRegistrata?: boolean }
  | { ok: false; error: string; status: number };

function istruzioniDefault(scelta: SceltaAB, titolo: string, motivo: string): string {
  return (
    `Proposta: ${titolo}\nMotivo: ${motivo}\n\n` +
    `Agisci ORA:\n` +
    `1) Append in MyCity-Vault/90-Memoria-AI/DECISIONI.md (colore da proposta, fonte Nicola Pannello A/B).\n` +
    `2) Se la scelta ${scelta} implica azione 🔴 sul mondo reale → accoda in AZIONI-IN-ATTESA.md.\n` +
    `3) Aggiorna STATO + SALA-OPERATIVA.\n` +
    `4) Al prossimo giro NON rigenerare questa proposta (decisione già presa).`
  );
}

export async function leggiDecisioneScelta(id: string): Promise<DecisioneSceltaSalvata | null> {
  let raw = await getImpostazione(chiaveScelta(id));
  if (!raw && id === LEGACY_ORDINE_ID) raw = await getImpostazione(LEGACY_ORDINE_CHIAVE);
  return parseDecisioneSalvata(raw, id);
}

export async function registraSceltaAB(body: RegistraSceltaInput): Promise<RegistraSceltaResult> {
  const scelta = body.scelta;
  if (scelta !== "A" && scelta !== "B") {
    return { ok: false, error: 'Serve scelta "A" o "B".', status: 400 };
  }

  const config = normalizzaPropostaSceltaAB({
    titolo: body.titolo,
    motivo: body.motivo,
    tipo: body.tipo,
    scelta_id: body.id || body.scelta_id,
    opzione_a: body.opzione_a,
    opzione_b: body.opzione_b,
    contesto: body.contesto,
    istruzioni: body.istruzioni,
  });
  const id = config.id;

  if (!memoryConnected()) {
    return { ok: false, error: "Memoria non collegata: la decisione non si può salvare.", status: 503 };
  }

  const esistente = await leggiDecisioneScelta(id);
  if (esistente) {
    return { ok: true, giaRegistrata: true, decisione: esistente };
  }

  const at = new Date().toISOString();
  const decisione: DecisioneSceltaSalvata = {
    scelta,
    at,
    id,
    titolo: String(body.titolo || "").trim() || undefined,
    opzione_a: config.opzione_a,
    opzione_b: config.opzione_b,
  };
  const saved = await setImpostazione(chiaveScelta(id), JSON.stringify(decisione));
  if (!saved) {
    return { ok: false, error: "Salvataggio fallito.", status: 500 };
  }

  const etichetta = etichettaScelta(config, decisione.scelta);
  const motivo = String(body.motivo || "").trim();
  const titolo = String(body.titolo || "").trim() || id;
  const istruzioni =
    String(body.istruzioni || config.istruzioni || "").trim() || istruzioniDefault(decisione.scelta, titolo, motivo);

  await creaLavoro(
    `Nicola ha DECISO (scelta A/B) dal Pannello.\n` +
      `**${decisione.scelta}** — ${etichetta}\n` +
      `Proposta: ${titolo}\n` +
      (motivo ? `Motivo: ${motivo}\n` : "") +
      `ID scelta: \`${id}\`\n\n` +
      `${istruzioni}`,
    "decisione"
  );

  return { ok: true, decisione };
}
