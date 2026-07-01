/** Raggruppamento lavori per conversazione (stesso gruppo = stesso contenitore collassabile). */

export type LavoroBase = {
  id: string;
  created_at: string;
  updated_at: string;
  stato: string;
  tipo: string;
  richiesta: string;
  risultato?: string;
  esperto?: string;
  gruppo_id?: string | null;
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
  const nuovo = lv.richiesta.match(/## Nuovo messaggio di Nicola\n([\s\S]*?)(?:\n\n## |\n*$)/);
  if (nuovo?.[1]?.trim()) return nuovo[1].trim().slice(0, 100);
  const prima = lv.richiesta.split("\n").find((l) => l.trim() && !l.startsWith("#"));
  return (prima || lv.richiesta).trim().slice(0, 100);
}

export type MsgChat = {
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
};

/** Ricostruisce i messaggi chat da un singolo lavoro (per riaprire conversazioni da Lavori). */
export function messaggiDaLavoro(lv: LavoroBase): MsgChat[] {
  const out: MsgChat[] = [];
  if (lv.tipo === "giro") {
    out.push({ role: "user", content: "fai un giro" });
  } else {
    const nuovo = lv.richiesta.match(/## Nuovo messaggio di Nicola\n([\s\S]*?)(?:\n\n## |\n*$)/);
    if (nuovo?.[1]?.trim()) {
      out.push({ role: "user", content: nuovo[1].trim() });
    } else {
      const prima = lv.richiesta.split("\n").find((l) => l.trim() && !l.startsWith("#"));
      if (prima?.trim()) out.push({ role: "user", content: prima.trim() });
    }
  }
  if (lv.risultato?.trim()) {
    out.push({ role: "assistant", content: lv.risultato.trim() });
  } else if (lv.stato === "in_attesa" || lv.stato === "in_corso") {
    out.push({ role: "assistant", content: "", pending: true });
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
