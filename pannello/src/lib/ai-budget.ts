import { getImpostazione, getImpostazioni, setImpostazione } from "@/lib/store";

// 🛡️ Guardia di budget AI — "mai sorprese" anche sui soldi.
// Tetto mensile (default 50€) + conteggio speso nel mese + STOP automatico.
// Tutto in €0 finché non si collega l'API: serve a tenere la spesa sotto controllo
// quando la parte "pensante" (a pagamento) verrà accesa.
const TETTO_DEFAULT = 50; // €/mese

function meseCorrente(): string {
  // "AAAA-MM" in fuso Europe/Rome
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit" }).format(new Date());
}

export type Budget = { tetto: number; speso: number; restante: number; mese: string; stop: boolean };

export async function getBudget(): Promise<Budget> {
  const mese = meseCorrente();
  const { valori } = await getImpostazioni().catch(() => ({ valori: {} as Record<string, string> }));
  const tetto = Number(valori["ai_budget:tetto"] ?? TETTO_DEFAULT) || TETTO_DEFAULT;
  const speso = Number(valori[`ai_budget:speso:${mese}`] ?? 0) || 0;
  const restante = Math.max(0, tetto - speso);
  return {
    tetto,
    speso: Math.round(speso * 100) / 100,
    restante: Math.round(restante * 100) / 100,
    mese,
    stop: speso >= tetto,
  };
}

// Si può spendere una stima senza sforare? (la macchina chiede SEMPRE prima di usare l'AI a pagamento)
export async function puoSpendere(stimaEuro = 0): Promise<boolean> {
  const b = await getBudget();
  return !b.stop && b.restante >= stimaEuro;
}

// Registra una spesa AI realmente avvenuta (in €), accumulata sul mese.
export async function aggiungiSpesa(euro: number): Promise<void> {
  if (!euro || euro <= 0) return;
  const k = `ai_budget:speso:${meseCorrente()}`;
  const cur = Number((await getImpostazione(k)) ?? 0) || 0;
  await setImpostazione(k, String(Math.round((cur + euro) * 1000) / 1000));
}

export async function setTetto(euro: number): Promise<void> {
  await setImpostazione("ai_budget:tetto", String(Math.max(0, Math.round(euro))));
}
