/** Raggruppamento lavori per conversazione (stesso gruppo = stesso contenitore collassabile). */

import { userContentDaRichiesta } from "./chat-thread-merge";
import { nomeLavoro } from "./nome-lavoro";

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
  /**
   * Il NOME già calcolato (da /api/lavori/nomi). Il poll della lista non porta `richiesta` — è
   * troppo pesante: 9,8 KB di media a riga sulle chat — quindi il nome lo calcola il server sulle
   * righe che servono e lo attacca qui. Se manca, `titoloLavoro` se lo ricava da sé.
   */
  titolo?: string;
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

// ── I NOMI GIÀ CHIESTI ──────────────────────────────────────────────────────────────────────
// Il nome di un lavoro non cambia mai: la richiesta è scritta una volta, alla nascita della riga.
// Quindi si chiede al server UNA volta sola e poi si tiene qui: senza questa memoria, ogni volta
// che il Pannello si riapre ricomincerebbe a rileggere richieste da 9,8 KB per riscoprire nomi
// che sapeva già.
const NOMI_KEY = "mycity_lavori_nomi";
const NOMI_MAX = 800;

export function leggiNomiLavoriLocali(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(NOMI_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function salvaNomiLavoriLocali(nomi: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    const voci = Object.entries(nomi);
    // Oltre il tetto si buttano i più vecchi (le chiavi restano in ordine di inserimento):
    // la lista guarda l'archivio recente, i nomi di sei mesi fa si possono richiedere di nuovo.
    const daSalvare = voci.length > NOMI_MAX ? Object.fromEntries(voci.slice(voci.length - NOMI_MAX)) : nomi;
    localStorage.setItem(NOMI_KEY, JSON.stringify(daSalvare));
  } catch {
    /* quota */
  }
}

/**
 * Titolo breve per header gruppo / singolo lavoro.
 *
 * Prima qui, quando la richiesta non era stata caricata, si ripiegava su `lv.tipo`: ecco perché
 * nella lista comparivano quattro caselle chiamate «analisi» e «playbook» (Nicola, 12/8). Ora il
 * nome è uno solo e lo fa `nomeLavoro`: quello già calcolato dal server se c'è, altrimenti
 * ricavato dalla richiesta, altrimenti l'etichetta italiana della specie.
 */
export function titoloLavoro(lv: LavoroBase): string {
  if (lv.titolo?.trim()) return lv.titolo.trim();
  return nomeLavoro(lv);
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
    // Anche una conversazione a più messaggi ha il suo nome: quello del messaggio che l'ha
    // aperta. «Conversazione · 3 messaggi» diceva solo quante volte si era parlato, non di cosa —
    // e quante volte lo dice già il cartellino accanto («3 messaggi · stessa chat»).
    const titolo = titoloLavoro(ordinati[0]);

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
