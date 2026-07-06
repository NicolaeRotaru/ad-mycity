import { NextResponse } from "next/server";
import {
  getLatestBriefing,
  getRecentTimes,
  getImpostazione,
  memoryConnected,
  type BriefingRecord,
  type Briefing,
} from "@/lib/store";
import { readVaultFileEsito, listVaultDir } from "@/lib/vault";
import { vaultToIso } from "@/lib/format";
import { vaultGithubInfo } from "@/lib/obsidian";
import { macchinaViva, oreDaQuando, raccogliSegnaliBattito } from "@/lib/battito";
import { marketplaceGithubInfo } from "@/lib/github";

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
  // Degrado gentile: se il briefing NON ha una sezione "Sintesi"/"TL;DR" (template diverso),
  // non restituire vuoto — mostra comunque il primo blocco di testo utile del file, così un
  // briefing scritto "fuori formato" resta LEGGIBILE nel Pannello invece di sparire.
  if (start < 0) {
    const corpo: string[] = [];
    let dentroFm = false;
    for (const l of lines) {
      const t = l.trim();
      if (t === "---") { dentroFm = !dentroFm; continue; } // salta il frontmatter
      if (dentroFm) continue;
      if (!t || /^#{1,6}\s/.test(t)) continue; // salta righe vuote e titoli
      corpo.push(l);
      if (corpo.join("\n").length > 400) break;
    }
    return corpo.join("\n").trim().slice(0, 800);
  }
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
// Restituisce anche il RAMO che ha servito il briefing letto dal vault: così la GET
// può segnalare se il dato è arrivato dal ripiego (il vecchio memoria-ad) invece che da main —
// senza appoggiarsi a stato globale del modulo obsidian.
async function briefingDalVault(): Promise<{ record: BriefingRecord | null; ramo: string | null }> {
  const esJson = await readVaultFileEsito("90-Memoria-AI/ultimo-briefing.json");
  if (esJson.stato === "ok" && esJson.testo) {
    try {
      const j = JSON.parse(esJson.testo);
      const data: Briefing = {
        situazione: String(j.situazione ?? ""),
        opportunita: Array.isArray(j.opportunita) ? j.opportunita : [],
        azioni: Array.isArray(j.azioni) ? j.azioni : [],
      };
      if (data.situazione || data.opportunita.length || data.azioni.length) {
        return { record: { created_at: String(j.data ?? ""), data }, ramo: esJson.ramo };
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
    const esMd = await readVaultFileEsito(`90-Memoria-AI/Briefing/${files[0]}`);
    if (esMd.stato === "ok" && esMd.testo) {
      const sintesi = estraiSintesi(esMd.testo);
      if (sintesi) {
        return {
          record: {
            created_at: dataFrontmatter(esMd.testo),
            data: { situazione: sintesi, opportunita: [], azioni: [] },
          },
          ramo: esMd.ramo,
        };
      }
    }
  }
  return { record: null, ramo: null };
}

function tsBriefing(b: BriefingRecord | null): number {
  if (!b?.created_at) return 0;
  return Date.parse(vaultToIso(b.created_at)) || 0;
}

/** Sceglie il briefing più fresco tra Supabase e vault GitHub (non solo il primo disponibile). */
function briefingPiuFresco(
  fromDb: BriefingRecord | null,
  fromVault: BriefingRecord | null
): { record: BriefingRecord | null; fonte: "supabase" | "vault" | null } {
  if (!fromDb && !fromVault) return { record: null, fonte: null };
  if (!fromDb) return { record: fromVault, fonte: "vault" };
  if (!fromVault) return { record: fromDb, fonte: "supabase" };
  return tsBriefing(fromVault) >= tsBriefing(fromDb)
    ? { record: fromVault, fonte: "vault" }
    : { record: fromDb, fonte: "supabase" };
}

// Cio' che la dashboard mostra: l'ultimo briefing e quanto e' "attivo".
export async function GET() {
  try {
    const vault = vaultGithubInfo();
    const codice = marketplaceGithubInfo();
    const [fromDb, vaultBrief, recent, segnali, pausa] = await Promise.all([
      getLatestBriefing(),
      briefingDalVault(),
      getRecentTimes(10),
      raccogliSegnaliBattito(),
      getImpostazione("pausa").catch(() => null),
    ]);
    const { record: ultimo, fonte: briefingFonte } = briefingPiuFresco(fromDb, vaultBrief.record);
    // Da quale ramo il vault ha SERVITO davvero il briefing: se è il ripiego (vecchio memoria-ad)
    // invece del ramo unico (main), è un campanello che qualcosa scrive ancora sul ramo vecchio
    // — reso VISIBILE nel Pannello invece che nascosto. Preso dal valore di ritorno, non da
    // stato globale del modulo (che in serverless è condiviso tra richieste e falserebbe).
    const ramoServito = vaultBrief.ramo;
    const lettura = {
      ramo: ramoServito,
      ripiego: ramoServito != null && ramoServito !== "disco" && ramoServito !== vault.ramo,
    };
    const oreWorker = oreDaQuando(segnali.worker?.quando);
    const workerVivo = oreWorker != null && oreWorker <= 0.1;
    return NextResponse.json({
      memoria: memoryConnected(),
      vaultGithub: vault.collegato,
      vaultRamo: vault.ramo,
      vaultRamoServito: lettura.ramo,
      vaultRipiego: lettura.ripiego,
      marketplaceCodice: codice.collegato,
      marketplaceRepo: codice.repo,
      marketplaceRamo: codice.ramo,
      briefingFonte,
      vivo: macchinaViva(segnali),
      workerVivo,
      workerUltimo: segnali.worker?.quando ?? null,
      adInPausa: pausa === "on",
      ultimo,
      giri: recent,
    });
  } catch (e: any) {
    return NextResponse.json({
      memoria: false,
      vivo: false,
      workerVivo: false,
      workerUltimo: null,
      adInPausa: false,
      ultimo: null,
      giri: [],
      error: e.message,
    });
  }
}
