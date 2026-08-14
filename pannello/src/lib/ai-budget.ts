import { getImpostazione, getImpostazioni, setImpostazione } from "@/lib/store";
import { lettureCieche } from "@/lib/cancello-atto";

// 🛡️ Guardia di budget AI — "mai sorprese" anche sui soldi.
// Tetto mensile (default 50€) + conteggio speso nel mese + STOP automatico.
// Tutto in €0 finché non si collega l'API: serve a tenere la spesa sotto controllo
// quando la parte "pensante" (a pagamento) verrà accesa.
//
// AR-383 — IL CIECO CHE TORNAVA UNA MISURA.
// `getBudget()` leggeva le impostazioni con `.catch(() => ({ valori: {} }))`. Con la memoria giù la
// mappa tornava vuota, quindi `speso` = 0, `restante` = tetto pieno, `stop` = false e `puoSpendere()`
// — l'unico freno prima della chiamata a api.anthropic.com — diceva sempre di sì. Proprio nel momento
// in cui la macchina non sa quanto ha speso, si autorizzava a spendere tutto.
// Il flag per distinguere i due casi c'era già: `getImpostazioni()` torna `{tabella:false, valori:{}}`
// quando la REST non risponde, e questo file lo buttava via destrutturando solo `valori`.
//
// La cura, in due pezzi:
//   ① un terzo stato `cieco` («non lo so», diverso da «zero») che rende `puoSpendere()` fail-closed;
//   ② la registrazione della spesa guarda il proprio esito e, se fallisce, MARCA IL MESE come non
//      attendibile — che a sua volta acceca la guardia. Prima l'errore veniva ingoiato e quella
//      spesa spariva per sempre dal conto.
const TETTO_DEFAULT = 50; // €/mese

function meseCorrente(): string {
  // "AAAA-MM" in fuso Europe/Rome
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit" }).format(new Date());
}

/** La chiave che dice «il conto di questo mese ha un buco»: una spesa avvenuta e mai registrata. */
export function chiaveContoRotto(mese: string = meseCorrente()): string {
  return `ai_budget:perso:${mese}`;
}

export type Budget = {
  tetto: number;
  speso: number;
  restante: number;
  mese: string;
  stop: boolean;
  /** true = non so quanto ho speso. NON è «zero speso»: è «non lo so», e vale come stop. */
  cieco: boolean;
  /** Perché sono cieco, in parole per Nicola (vuoto se ci vedo). */
  motivoCieco: string;
};

export async function getBudget(): Promise<Budget> {
  const mese = meseCorrente();
  // `tabella` è la differenza fra «ho letto e non c'era niente» e «non ho potuto leggere».
  const letto = await getImpostazioni().catch(() => ({ tabella: false, valori: {} as Record<string, string> }));
  const { tabella, valori } = letto;
  const tetto = Number(valori["ai_budget:tetto"] ?? TETTO_DEFAULT) || TETTO_DEFAULT;
  const speso = Number(valori[`ai_budget:speso:${mese}`] ?? 0) || 0;
  const restante = Math.max(0, tetto - speso);
  const contoRotto = valori[chiaveContoRotto(mese)] === "1";
  const cieco = !tabella || contoRotto;
  return {
    tetto,
    speso: Math.round(speso * 100) / 100,
    restante: Math.round(restante * 100) / 100,
    mese,
    stop: speso >= tetto,
    cieco,
    motivoCieco: !tabella
      ? "la memoria non risponde: non so quanto ho speso questo mese"
      : contoRotto
        ? "una spesa è avvenuta ma non sono riuscito a registrarla: il conto del mese non è attendibile"
        : "",
  };
}

// Si può spendere una stima senza sforare? (la macchina chiede SEMPRE prima di usare l'AI a pagamento)
export async function puoSpendere(stimaEuro = 0): Promise<boolean> {
  const b = await getBudget();
  // AR-383 — fail-closed come già fanno la pausa e il consenso: se non so quanto ho speso, non spendo.
  // La domanda («queste letture sono vive?») è la stessa di ogni altro atto del Pannello, quindi è la
  // stessa funzione: cancello-atto.ts. Un errore non è uno zero.
  if (lettureCieche([{ nome: "il conto della spesa AI del mese", vivo: !b.cieco }]).length > 0) return false;
  return !b.stop && b.restante >= stimaEuro;
}

/**
 * Registra una spesa AI realmente avvenuta (in €), accumulata sul mese.
 *
 * Torna `false` se la spesa NON è finita nel conto. In quel caso marca il mese come non attendibile:
 * da lì in poi `getBudget()` è cieco e `puoSpendere()` dice di no, finché qualcuno non rimette a
 * posto il numero. Un euro speso e non contato è peggio di un euro non speso: falsa tutte le
 * decisioni successive, in silenzio.
 */
export async function aggiungiSpesa(euro: number): Promise<boolean> {
  if (!euro || euro <= 0) return true;
  const mese = meseCorrente();
  const k = `ai_budget:speso:${mese}`;
  const cur = Number((await getImpostazione(k)) ?? 0) || 0;
  const ok = await setImpostazione(k, String(Math.round((cur + euro) * 1000) / 1000));
  if (!ok) {
    // La chiamata AI è già stata pagata: qui non si può «riprovare», si può solo dichiarare il buco.
    // Se anche QUESTA scrittura non passa, la memoria è giù del tutto — e allora `getBudget()` è già
    // cieco per conto suo (`tabella:false`), quindi la guardia resta chiusa lo stesso. È l'unico
    // punto della corsia in cui un esito non produce un ramo nuovo, e il motivo è che i due rami
    // portano allo stesso posto.
    const marchiato = await setImpostazione(chiaveContoRotto(mese), "1");
    void marchiato;
    return false;
  }
  return true;
}

/** Torna false se il tetto non è stato salvato: chi lo cambia deve sapere se ha attecchito. */
export async function setTetto(euro: number): Promise<boolean> {
  return setImpostazione("ai_budget:tetto", String(Math.max(0, Math.round(euro))));
}
