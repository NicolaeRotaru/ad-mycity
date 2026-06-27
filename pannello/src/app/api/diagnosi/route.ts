import { NextResponse } from "next/server";
import { memoryConnected, getImpostazione } from "@/lib/store";
import { marketplaceDbConnected } from "@/lib/marketplace-db";
import { getPostHog } from "@/lib/posthog";
import { getBudget } from "@/lib/ai-budget";
import { readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🩺 SELF-DIAGNOSI DELLA MACCHINA (Ondata 0.5): l'autonomia sta DAVVERO girando?
// Un'autonomia spenta in silenzio e il rischio n.1. Qui controlliamo i segni vitali:
// memoria, DB, traffico, freschezza dell'ultimo briefing e dell'ultimo battito,
// autopilota, budget AI. €0: legge solo impostazioni e il vault.
type Stato = "verde" | "giallo" | "rosso";
type Check = { nome: string; stato: Stato; dettaglio: string };

// Ore trascorse da una data ("AAAA-MM-GG HH:MM" o ISO). null se non parsabile.
function oreDa(s: string | null | undefined): number | null {
  if (!s) return null;
  const iso = s.includes("T") ? s : s.trim().replace(" ", "T");
  const t = new Date(iso).getTime();
  if (isNaN(t)) return null;
  return (Date.now() - t) / 3600000;
}
function eta(ore: number | null): string {
  if (ore == null) return "mai";
  if (ore < 1) return `${Math.round(ore * 60)} min fa`;
  if (ore < 48) return `${Math.round(ore)} h fa`;
  return `${Math.round(ore / 24)} giorni fa`;
}

export async function GET() {
  const checks: Check[] = [];

  // 1) Memoria collegata (senza, i giri non si salvano).
  const mem = memoryConnected();
  checks.push({ nome: "Memoria collegata", stato: mem ? "verde" : "rosso", dettaglio: mem ? "il vault risponde" : "manca SUPABASE_URL + SERVICE_KEY: i giri non si salvano" });

  // 2) DB marketplace (i numeri reali).
  const db = marketplaceDbConnected();
  checks.push({ nome: "Dati marketplace", stato: db ? "verde" : "giallo", dettaglio: db ? "ordini/clienti leggibili" : "manca MARKETPLACE_SUPABASE_*: numeri non disponibili" });

  // 3) Traffico (PostHog).
  const ph = await getPostHog().catch(() => ({ connected: false }) as any);
  checks.push({ nome: "Traffico (PostHog)", stato: ph?.connected ? "verde" : "giallo", dettaglio: ph?.connected ? "visite tracciate" : "non collegato: niente funnel/conversione" });

  // 4) Ultimo briefing: fresco se < 24h.
  let dataBriefing: string | null = null;
  const raw = await readVaultFile("90-Memoria-AI/ultimo-briefing.json").catch(() => null);
  if (raw) {
    try {
      dataBriefing = JSON.parse(raw)?.data ?? null;
    } catch {
      /* json rotto: lo segnaliamo come assente */
    }
  }
  const oreBrief = oreDa(dataBriefing);
  checks.push({
    nome: "Ultimo giro (briefing)",
    stato: oreBrief == null ? "rosso" : oreBrief <= 24 ? "verde" : oreBrief <= 72 ? "giallo" : "rosso",
    dettaglio: oreBrief == null ? "nessun briefing salvato: lancia un giro" : `aggiornato ${eta(oreBrief)}`,
  });

  // 5) Ultimo battito del cuore (cron/worker).
  const battito = await getImpostazione("cuore:ultimo").catch(() => null);
  const oreBatt = oreDa(battito);
  checks.push({
    nome: "Battito (cron)",
    stato: oreBatt == null ? "giallo" : oreBatt <= 26 ? "verde" : oreBatt <= 72 ? "giallo" : "rosso",
    dettaglio: oreBatt == null ? "nessun battito registrato: il cron non ha ancora girato" : `ultimo ${eta(oreBatt)}`,
  });

  // 6) Autopilota (informativo).
  const auto = (await getImpostazione("autopilota").catch(() => null)) === "on";
  checks.push({ nome: "Autopilota", stato: auto ? "verde" : "giallo", dettaglio: auto ? "le azioni 🟢 partono da sole" : "spento: le 🟢 restano in coda" });

  // 7) Budget AI: giallo oltre l'80%, rosso a saturazione.
  const budget = await getBudget().catch(() => null);
  if (budget) {
    const quota = budget.tetto > 0 ? budget.speso / budget.tetto : 0;
    checks.push({
      nome: "Budget AI",
      stato: quota >= 1 ? "rosso" : quota >= 0.8 ? "giallo" : "verde",
      dettaglio: `speso €${budget.speso} / €${budget.tetto}`,
    });
  }

  // Salute complessiva = il check peggiore.
  const peggiore: Stato = checks.some((c) => c.stato === "rosso") ? "rosso" : checks.some((c) => c.stato === "giallo") ? "giallo" : "verde";
  return NextResponse.json({ salute: peggiore, checks });
}
