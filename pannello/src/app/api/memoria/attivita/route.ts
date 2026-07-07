import { NextResponse } from "next/server";
import { readVaultFile, listVaultDir, codaTesto } from "@/lib/vault";
import { vaultGithubInfo } from "@/lib/obsidian";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Estrae il campo "data:" dal frontmatter (può contenere data E ora,
// es. "2026-06-26 01:48"). Vuoto se assente. Cerca solo nel blocco --- iniziale.
function dataFrontmatter(md: string): string {
  const fm = md.match(/^---\s*\n([\s\S]*?)\n---/);
  const blocco = fm ? fm[1] : md.slice(0, 400);
  const m = blocco.match(/^\s*data:\s*(.+?)\s*$/m);
  return m ? m[1].trim() : "";
}

// Attività & briefing: ultimo giro + Sala Operativa + Decisioni.
export async function GET() {
  // Ultimo briefing (file con data più recente, esclusi i _README).
  const files = (await listVaultDir("90-Memoria-AI/Briefing"))
    .filter((f) => !f.startsWith("_"))
    .sort()
    .reverse();
  // Le 3 letture sono indipendenti → in PARALLELO (prima erano 3 await in fila = 3 round-trip
  // GitHub sequenziali). Il briefing è l'ultimo file per nome; sala e decisioni sono file fissi.
  const [briefingTesto, sala, decisioni] = await Promise.all([
    files.length ? readVaultFile(`90-Memoria-AI/Briefing/${files[0]}`) : Promise.resolve(null),
    readVaultFile("90-Memoria-AI/SALA-OPERATIVA.md"),
    readVaultFile("90-Memoria-AI/DECISIONI.md"),
  ]);
  let briefing: { nome: string; data: string; testo: string } | null = null;
  if (files.length && briefingTesto) {
    briefing = { nome: files[0].replace(/\.md$/, ""), data: dataFrontmatter(briefingTesto), testo: briefingTesto };
  }

  const vault = vaultGithubInfo();
  return NextResponse.json({
    collegato: vault.collegato && (briefing != null || sala != null || decisioni != null),
    vaultGithub: vault.collegato,
    ramo: vault.ramo,
    repo: vault.repo,
    briefing,
    salaOperativa: sala ? codaTesto(sala) : "",
    decisioni: decisioni ? codaTesto(decisioni) : "",
  });
}
