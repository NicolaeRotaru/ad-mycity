import { NextResponse } from "next/server";
import {
  getLatestBriefing,
  getRecentTimes,
  memoryConnected,
  type BriefingRecord,
  type Briefing,
} from "@/lib/store";
import { readVaultFile, listVaultDir } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Estrae il campo "data:" dal frontmatter (può contenere data E ora).
function dataFrontmatter(md: string): string {
  const fm = md.match(/^---\s*\n([\s\S]*?)\n---/);
  const blocco = fm ? fm[1] : md.slice(0, 400);
  const m = blocco.match(/^\s*data:\s*(.+?)\s*$/m);
  return m ? m[1].trim() : "";
}

// Estrae il testo della sezione "## 1. Sintesi" (o, in mancanza, del TL;DR) dal briefing.
function estraiSintesi(md: string): string {
  const lines = md.split("\n");
  let start = lines.findIndex((l) => /^#{1,3}\s*\d*\.?\s*Sintesi\b/i.test(l));
  if (start < 0) start = lines.findIndex((l) => /TL;?DR/i.test(l));
  if (start < 0) return "";
  const out: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#{1,3}\s/.test(lines[i]) || /^---\s*$/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join("\n").trim().slice(0, 800);
}

// Fallback quando Supabase non ha il briefing (es. memoria giù): ripiega sul vault.
// 1) il digest strutturato che il giro scrive in ultimo-briefing.json;
// 2) in mancanza, la Sintesi estratta dall'ultimo Briefing/AAAA-MM-GG.md.
async function briefingDalVault(): Promise<BriefingRecord | null> {
  const raw = await readVaultFile("90-Memoria-AI/ultimo-briefing.json");
  if (raw) {
    try {
      const j = JSON.parse(raw);
      const data: Briefing = {
        situazione: String(j.situazione ?? ""),
        opportunita: Array.isArray(j.opportunita) ? j.opportunita : [],
        azioni: Array.isArray(j.azioni) ? j.azioni : [],
      };
      if (data.situazione || data.opportunita.length || data.azioni.length) {
        return { created_at: String(j.data ?? ""), data };
      }
    } catch {
      /* JSON rotto: passo al fallback markdown */
    }
  }
  const files = (await listVaultDir("90-Memoria-AI/Briefing"))
    .filter((f) => !f.startsWith("_"))
    .sort()
    .reverse();
  if (files.length) {
    const md = await readVaultFile(`90-Memoria-AI/Briefing/${files[0]}`);
    if (md) {
      const sintesi = estraiSintesi(md);
      if (sintesi) {
        return {
          created_at: dataFrontmatter(md),
          data: { situazione: sintesi, opportunita: [], azioni: [] },
        };
      }
    }
  }
  return null;
}

// Cio' che la dashboard mostra: l'ultimo briefing e quanto e' "attivo".
export async function GET() {
  try {
    const [latest, recent] = await Promise.all([
      getLatestBriefing(),
      getRecentTimes(10),
    ]);
    const ultimo = latest ?? (await briefingDalVault());
    return NextResponse.json({
      memoria: memoryConnected(),
      vivo: memoryConnected() || ultimo != null,
      ultimo,
      giri: recent,
    });
  } catch (e: any) {
    return NextResponse.json({ memoria: false, vivo: false, ultimo: null, giri: [], error: e.message });
  }
}
