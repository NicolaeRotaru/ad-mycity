import { getImpostazioni, setImpostazione } from "@/lib/store";

// ⭐ Le Stelle Polari dell'azienda. Una principale (sempre accesa) + due faro
// che Nicola accende/spegne quando vuole. Lo stato si salva in impostazioni.
export type Stella = {
  id: string;
  emoji: string;
  nome: string;
  descrizione: string;
  principale: boolean;
  attiva: boolean;
};

const CATALOGO: Omit<Stella, "attiva">[] = [
  {
    id: "ordini",
    emoji: "⭐",
    nome: "Ordini consegnati / settimana",
    descrizione: "Il valore vero creato: ordini qualificati consegnati ogni settimana. La stella principale.",
    principale: true,
  },
  {
    id: "clienti",
    emoji: "👥",
    nome: "Nuovi clienti che comprano / settimana",
    descrizione: "L'imbuto dell'acquisizione: iscritti → navigano → comprano, coi tassi di conversione.",
    principale: false,
  },
  {
    id: "influenza",
    emoji: "🏙️",
    nome: "Indice Influenza Piacenza",
    descrizione: "Notorietà locale: negozi aderenti + reach social + menzioni stampa + ricerche del nome + quartieri coperti.",
    principale: false,
  },
];

export async function getStelle(): Promise<Stella[]> {
  const { valori } = await getImpostazioni().catch(() => ({ valori: {} as Record<string, string> }));
  return CATALOGO.map((s) => ({
    ...s,
    // la principale è sempre attiva; le altre default OFF, accendibili
    attiva: s.principale ? true : (valori[`stella:${s.id}`] ?? "off") === "on",
  }));
}

export async function setStella(id: string, attiva: boolean): Promise<{ ok: boolean; motivo?: string }> {
  const s = CATALOGO.find((x) => x.id === id);
  if (!s) return { ok: false, motivo: "Stella sconosciuta" };
  if (s.principale) return { ok: false, motivo: "La stella principale resta sempre accesa" };
  await setImpostazione(`stella:${id}`, attiva ? "on" : "off");
  return { ok: true };
}
