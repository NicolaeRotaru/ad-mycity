import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";
import { getImpostazioni, setImpostazione } from "@/lib/store";

export const runtime = "nodejs";

// "Cose da fare per me" (checklist di Nicola).
// - Le VOCI si leggono dal vault: 90-Memoria-AI/CHECKLIST-NICOLA.md
//   (righe markdown "- [ ] 🔴 testo" / "- [x] …", con sotto-titoli "## Sezione").
// - Lo STATO della spunta si salva in Supabase (tabella impostazioni, chiave
//   "todo:<id>" = "1"/"0"): cross-device e atomico, senza commit Git sul vault.
//   L'override di Supabase, se presente, vince sul checkbox scritto nel file.

export type TodoItem = {
  id: string;
  testo: string;
  livello: "verde" | "giallo" | "rosso" | "?";
  sezione: string;
  fatto: boolean;
};

function livelloDi(t: string): TodoItem["livello"] {
  if (t.includes("🟢")) return "verde";
  if (t.includes("🟡")) return "giallo";
  if (t.includes("🔴")) return "rosso";
  return "?";
}

// id stabile e corto derivato dal testo della voce (FNV-1a → base36).
function idDi(testo: string): string {
  const s = testo.toLowerCase().replace(/\s+/g, " ").trim();
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

type VoceParsata = Omit<TodoItem, "fatto"> & { fattoMd: boolean };
function parseChecklist(md: string): VoceParsata[] {
  const out: VoceParsata[] = [];
  const pulito = md.replace(/<!--[\s\S]*?-->/g, "");
  let sezione = "";
  for (const raw of pulito.split("\n")) {
    const line = raw.trim();
    const h = line.match(/^#{1,6}\s+(.*)$/);
    if (h) {
      sezione = h[1].replace(/[#*`]/g, "").trim();
      continue;
    }
    const m = line.match(/^[-*]\s+\[([ xX])\]\s+(.+)$/);
    if (!m) continue;
    const testo = m[2].trim();
    out.push({ id: idDi(testo), testo, livello: livelloDi(testo), sezione, fattoMd: m[1].toLowerCase() === "x" });
  }
  return out;
}

export async function GET() {
  const md = await readVaultFile("90-Memoria-AI/CHECKLIST-NICOLA.md");
  if (md == null) return NextResponse.json({ collegato: false, salvataggio: false, items: [] });

  const voci = parseChecklist(md);
  // Override delle spunte salvate dal pannello (Supabase). Se la tabella manca,
  // si ripiega sui checkbox del file.
  const { tabella, valori } = await getImpostazioni();
  const items: TodoItem[] = voci.map((v) => {
    const ov = valori[`todo:${v.id}`];
    return { id: v.id, testo: v.testo, livello: v.livello, sezione: v.sezione, fatto: ov != null ? ov === "1" : v.fattoMd };
  });
  return NextResponse.json({ collegato: true, salvataggio: tabella, items });
}

// Salva (upsert) lo stato di una spunta. Body: { id: string, fatto: boolean }.
export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body non valido." }, { status: 400 });
  }
  const id = String(body?.id || "").trim();
  if (!id) return NextResponse.json({ ok: false, error: "Manca l'id." }, { status: 400 });
  const ok = await setImpostazione(`todo:${id}`, body?.fatto ? "1" : "0");
  if (!ok) return NextResponse.json({ ok: false, error: "Memoria non collegata: spunta non salvata." });
  return NextResponse.json({ ok: true });
}
