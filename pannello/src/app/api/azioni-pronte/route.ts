import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";
import { getImpostazioni, setImpostazione } from "@/lib/store";

export const runtime = "nodejs";

// "Azioni pronte" = la corsia operativa. Le mosse le prepara l'AD nel vault
// (90-Memoria-AI/AZIONI-PRONTE.md, un blocco per azione). La DECISIONE (approva/
// rifiuta) si salva in Supabase (impostazioni, chiave "azione:<id>"), come la
// checklist: cross-device, senza commit Git. MODALITÀ CODA: approvare segna lo
// stato; l'esecuzione vera arriverà quando colleghiamo le "mani" (Tappa 2).

export type AzionePronta = {
  id: string;
  titolo: string;
  reparto: string;
  livello: "verde" | "giallo" | "rosso" | "?";
  canale: string;
  perche: string;
  preparato: string;
  testo: string;
  decisione: "" | "approvata" | "rifiutata";
};

function livelloDi(s: string): AzionePronta["livello"] {
  if (s.includes("🟢")) return "verde";
  if (s.includes("🟡")) return "giallo";
  if (s.includes("🔴")) return "rosso";
  return "?";
}

type Blocco = Omit<AzionePronta, "decisione">;

function parse(md: string): Blocco[] {
  const out: Blocco[] = [];
  let cur: Blocco | null = null;
  let inTesto = false;
  for (const raw of md.split("\n")) {
    const h = raw.match(/^##\s+(\S+)\s+·\s+(.+)$/);
    if (h) {
      if (cur) out.push({ ...cur, testo: cur.testo.trim() });
      cur = { id: h[1], titolo: h[2].trim(), reparto: "", livello: "?", canale: "", perche: "", preparato: "", testo: "" };
      inTesto = false;
      continue;
    }
    if (!cur) continue;
    if (!inTesto) {
      if (raw.trim() === "testo:") {
        inTesto = true;
        continue;
      }
      const f = raw.match(/^(\w+):\s*(.*)$/);
      if (f) {
        const k = f[1].toLowerCase();
        const v = f[2].trim();
        if (k === "reparto") cur.reparto = v;
        else if (k === "livello") cur.livello = livelloDi(v);
        else if (k === "canale") cur.canale = v;
        else if (k === "perche") cur.perche = v;
        else if (k === "preparato") cur.preparato = v;
      }
    } else {
      cur.testo += (cur.testo ? "\n" : "") + raw;
    }
  }
  if (cur) out.push({ ...cur, testo: cur.testo.trim() });
  return out;
}

export async function GET() {
  const md = await readVaultFile("90-Memoria-AI/AZIONI-PRONTE.md");
  if (md == null) return NextResponse.json({ collegato: false, salvataggio: false, azioni: [] });
  const blocchi = parse(md);
  const { tabella, valori } = await getImpostazioni();
  const azioni: AzionePronta[] = blocchi.map((b) => {
    const d = valori[`azione:${b.id}`];
    return { ...b, decisione: d === "approvata" || d === "rifiutata" ? d : "" };
  });
  return NextResponse.json({ collegato: true, salvataggio: tabella, azioni });
}

// Salva la decisione. Body: { id, decisione: "approva" | "rifiuta" | "annulla" }.
export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body non valido." }, { status: 400 });
  }
  const id = String(body?.id || "").trim();
  const dec = String(body?.decisione || "").trim();
  if (!id) return NextResponse.json({ ok: false, error: "Manca l'id." }, { status: 400 });
  const valore = dec === "approva" ? "approvata" : dec === "rifiuta" ? "rifiutata" : "";
  const ok = await setImpostazione(`azione:${id}`, valore);
  if (!ok) return NextResponse.json({ ok: false, error: "Memoria non collegata: decisione non salvata." });
  return NextResponse.json({ ok: true });
}
