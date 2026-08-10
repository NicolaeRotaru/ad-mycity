// 📆 Quanto è vecchio il testo che la card «Intelligence & opportunità» sta mostrando.
//
// Perché esiste (Nicola, 2026-08-10): la scheda mostrava un testo del 20 luglio come se fosse di
// oggi. La data viveva solo DENTRO il markdown, e solo se chi l'aveva scritta se l'era ricordata.
// Undici giorni di monitoraggio morto senza che la schermata potesse dirlo.
//
// Gemello di cervello/freschezza-intelligence.mjs. Sono due perché vivono in due runtime diversi
// (Node del cervello, Next del Pannello) e questo repo non ha un pacchetto condiviso — ma la
// REGOLA che conta, la soglia, non è duplicata: si deriva da cervello/radar-fonti.json, che
// entrambi leggono. Se le cadenze cambiano lì, cambiano in tutti e due i posti insieme.

export const SOGLIA_GIORNALIERA = 2;
export const SOGLIA_SETTIMANALE = 8;

export type StatoFreschezza = "fresca" | "scaduta" | "mai-scritta" | "senza-data";

export type Freschezza = {
  stato: StatoFreschezza;
  giorni: number | null;
  data: string | null;
  scaduta: boolean;
  soglia: number;
  frase: string;
};

const MESI_IT = [
  "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
  "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
];

/** La prima data nei primi 600 caratteri: ISO (2026-07-20) o italiana (20 luglio 2026). */
export function dataDaIntestazione(testo: string): string | null {
  const testa = String(testo || "").slice(0, 600);
  const iso = testa.match(/(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const it = testa.match(new RegExp(`\\b(\\d{1,2})\\s+(${MESI_IT.join("|")})\\s+(\\d{4})`, "i"));
  if (it) {
    const mese = String(MESI_IT.indexOf(it[2].toLowerCase()) + 1).padStart(2, "0");
    return `${it[3]}-${mese}-${String(it[1]).padStart(2, "0")}`;
  }
  return null;
}

export function giorniFra(isoVecchia: string | null, isoOggi: string): number | null {
  if (!isoVecchia) return null;
  const a = Date.parse(`${isoVecchia}T12:00:00+02:00`);
  const b = Date.parse(`${isoOggi}T12:00:00+02:00`);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.floor((b - a) / 86_400_000);
}

/**
 * Deriva la soglia di una scheda dalle cadenze delle sue fonti nel radar.
 * Almeno una fonte giornaliera → 2 giorni (uno di cadenza, uno di margine). Solo settimanali → 8.
 * Senza radar leggibile si ripiega su 8: la soglia larga non fa gridare al lupo per un file di
 * configurazione mancante — il buco lo racconta il guardiano lato cervello, non un falso rosso qui.
 */
export function sogliaPerScheda(radar: unknown, scriveIn: string): number {
  const fonti = (radar as { fonti?: { scrive_in?: string; cadenza?: string }[] })?.fonti;
  if (!Array.isArray(fonti)) return SOGLIA_SETTIMANALE;
  const mie = fonti.filter((f) => f?.scrive_in === scriveIn);
  if (mie.length === 0) return SOGLIA_SETTIMANALE;
  return mie.some((f) => f?.cadenza === "giornaliera") ? SOGLIA_GIORNALIERA : SOGLIA_SETTIMANALE;
}

/**
 * Il giudizio. Pura: `oggi` entra come parametro così i test non dipendono dal calendario.
 * ⚪ "senza-data" NON è scaduta e non è fresca: è «non ho potuto misurare», e va mostrato così
 *    invece di essere arrotondato a uno dei due — un ⚪ spacciato per ✅ è il difetto di partenza.
 */
export function freschezza(testo: string | null, soglia: number, oggi: string): Freschezza {
  if (testo == null || testo.trim() === "") {
    return { stato: "mai-scritta", giorni: null, data: null, scaduta: true, soglia, frase: "mai generata" };
  }
  const data = dataDaIntestazione(testo);
  if (!data) {
    return { stato: "senza-data", giorni: null, data: null, scaduta: false, soglia, frase: "senza data in cima" };
  }
  const giorni = giorniFra(data, oggi);
  const scaduta = giorni != null && giorni > soglia;
  const frase =
    giorni == null ? "data illeggibile" : giorni <= 0 ? "aggiornata oggi" : giorni === 1 ? "aggiornata ieri" : `aggiornata ${giorni} giorni fa`;
  return { stato: scaduta ? "scaduta" : "fresca", giorni, data, scaduta, soglia, frase };
}

/** La data di oggi a Piacenza in formato aaaa-mm-gg. */
export function oggiPiacenza(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Rome" }).format(now);
}
