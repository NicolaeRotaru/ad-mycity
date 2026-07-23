/** Raggruppamento lavori per conversazione (stesso gruppo = stesso contenitore collassabile). */

import { userContentDaRichiesta } from "./chat-thread-merge";

export type LavoroBase = {
  id: string;
  created_at: string;
  updated_at: string;
  stato: string;
  tipo: string;
  richiesta?: string;
  risultato?: string;
  esperto?: string;
  gruppo_id?: string | null;
  tentativi?: number;
  riprova_dopo?: string | null;
};

export type GruppoLavori = {
  id: string;
  titolo: string;
  lavori: LavoroBase[];
  ultimoAt: string;
  haAttivo: boolean;
};

const MAP_KEY = "mycity_lavori_gruppi";

export function leggiMappaGruppiLocali(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(MAP_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function salvaGruppoLavoroLocale(lavoroId: string, gruppoId: string) {
  if (typeof window === "undefined" || !lavoroId || !gruppoId) return;
  try {
    const m = leggiMappaGruppiLocali();
    m[lavoroId] = gruppoId;
    localStorage.setItem(MAP_KEY, JSON.stringify(m));
  } catch {
    /* quota */
  }
}

/** Titolo breve per header gruppo / singolo lavoro. */
export function titoloLavoro(lv: LavoroBase): string {
  if (lv.tipo === "giro") return "Giro di perlustrazione";
  const richiesta = lv.richiesta || "";
  if (!richiesta.trim()) {
    if (lv.tipo === "chat") return "Messaggio chat";
    return lv.tipo || "Lavoro";
  }
  // Chat da casella: mostra il titolo della casella (es. «Esperimento: …»), non l'ultimo messaggio di Nicola.
  const casella = richiesta.match(/## Casella del Pannello:\s*(.+?)(?:\n|$)/);
  if (casella?.[1]?.trim()) return casella[1].trim().slice(0, 100);
  const nuovo = richiesta.match(/## Nuovo messaggio di Nicola\n([\s\S]*?)(?:\n\n## |\n*$)/);
  if (nuovo?.[1]?.trim()) return nuovo[1].trim().slice(0, 100);
  const prima = richiesta.split("\n").find((l) => l.trim() && !l.startsWith("#"));
  return (prima || richiesta).trim().slice(0, 100);
}

export type MsgChat = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
};

/** Ricostruisce i messaggi chat da un singolo lavoro (per riaprire conversazioni da Lavori). */
export function messaggiDaLavoro(lv: LavoroBase): MsgChat[] {
  const out: MsgChat[] = [];
  const richiesta = lv.richiesta || "";
  if (lv.tipo === "giro") {
    out.push({ id: `${lv.id}:u`, role: "user", content: "fai un giro" });
  } else if (richiesta.trim()) {
    const daRichiesta = userContentDaRichiesta(richiesta);
    if (daRichiesta.trim()) {
      out.push({ id: `${lv.id}:u`, role: "user", content: daRichiesta });
    } else {
      const prima = richiesta.split("\n").find((l) => l.trim() && !l.startsWith("#"));
      if (prima?.trim()) out.push({ id: `${lv.id}:u`, role: "user", content: prima.trim() });
    }
  }
  if (lv.stato === "annullato") {
    // Non mostrare "🚫 Messaggio annullato." — sovrascriveva la risposta già vista.
    // Se il lavoro è stato sostituito, la risposta arriva nel turno nuovo.
    // Se è stato annullato manualmente, nessuna risposta è corretta.
    return out;
  }
  // FIX (risposta duplicata/ferma al cambio chat, AR — segnalato da Nicola): un lavoro NON ancora
  // concluso ("in_attesa"/"in_corso") è SEMPRE un turno pendente, anche se ha già del testo
  // parziale (streaming in corso) — prima si guardava PRIMA se c'era testo e solo se vuoto si
  // marcava pending, quindi riaprendo la conversazione (continuaConversazione/apriChatDaGruppo)
  // mentre l'AD stava ancora scrivendo, il parziale veniva ricostruito come risposta GIÀ FINITA
  // (pending mancante): il poller in tempo reale (che invece marca correttamente pending) non
  // riusciva più a farla crescere (bolla "congelata"), e i due percorsi di ricostruzione
  // finivano per disallinearsi producendo la bolla doppia/che sparisce un istante.
  if (lv.stato === "in_attesa" || lv.stato === "in_corso") {
    out.push({ id: `${lv.id}:a`, role: "assistant", content: lv.risultato?.trim() || "", pending: true });
  } else if (lv.risultato?.trim()) {
    out.push({ id: `${lv.id}:a`, role: "assistant", content: lv.risultato.trim() });
  }
  return out;
}

/** Messaggi ordinati di tutti i lavori di un gruppo-conversazione. */
export function messaggiDaGruppo(lavori: LavoroBase[]): MsgChat[] {
  return lavori.flatMap((lv) => messaggiDaLavoro(lv));
}

function gruppoIdDi(lv: LavoroBase, mappa: Record<string, string>): string {
  return (lv.gruppo_id || mappa[lv.id] || "").trim() || lv.id;
}

function statoGruppo(lavori: LavoroBase[]): string {
  if (lavori.some((l) => l.stato === "in_corso")) return "in_corso";
  if (lavori.some((l) => l.stato === "in_attesa")) return "in_attesa";
  if (lavori.some((l) => l.stato === "errore")) return "errore";
  if (lavori.every((l) => l.stato === "annullato")) return "annullato";
  return "fatto";
}

/** Raggruppa per conversazione; ordina gruppi per ultimo movimento (il gruppo «sale» nella lista). */
export function raggruppaLavori(lavori: LavoroBase[], mappa: Record<string, string> = {}): GruppoLavori[] {
  const visibili = lavori.filter((l) => l.tipo !== "metabolizza");
  const map = new Map<string, LavoroBase[]>();

  for (const lv of visibili) {
    const gid = gruppoIdDi(lv, mappa);
    const arr = map.get(gid) || [];
    arr.push(lv);
    map.set(gid, arr);
  }

  const gruppi: GruppoLavori[] = [];
  for (const [id, items] of map) {
    const ordinati = [...items].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const ultimoAt = ordinati.reduce(
      (max, l) => Math.max(max, new Date(l.updated_at || l.created_at).getTime()),
      0
    );
    const titolo =
      ordinati.length === 1
        ? titoloLavoro(ordinati[0])
        : `Conversazione · ${ordinati.length} messaggi`;

    gruppi.push({
      id,
      titolo: titolo.slice(0, 120),
      lavori: ordinati,
      ultimoAt: new Date(ultimoAt).toISOString(),
      haAttivo: ["in_attesa", "in_corso"].includes(statoGruppo(ordinati)),
    });
  }

  return gruppi.sort((a, b) => new Date(b.ultimoAt).getTime() - new Date(a.ultimoAt).getTime());
}
