import { NextResponse } from "next/server";
import { memoryConnected, getImpostazione } from "@/lib/store";
import { marketplaceDbConnected } from "@/lib/marketplace-db";
import { getPostHog } from "@/lib/posthog";
import { getBudget } from "@/lib/ai-budget";
import { readVaultFile } from "@/lib/vault";
import { vaultGithubInfo } from "@/lib/obsidian";

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

  // 1) Vault GitHub: da QUI il Pannello legge briefing/STATO/AZIONI (ramo memoria-ad).
  //    Non serve merge su main: OBSIDIAN_BRANCH deve combaciare col GIT_BRANCH del giro.
  const vault = vaultGithubInfo();
  checks.push({
    nome: "Vault GitHub (Pannello)",
    stato: vault.collegato ? "verde" : "rosso",
    dettaglio: vault.collegato
      ? `legge ramo «${vault.ramo}» in tempo reale — merge su main NON necessario`
      : "manca OBSIDIAN_* su Vercel: briefing e STATO non compaiono (anche se il giro gira)",
  });

  // 2) Memoria Supabase (coda lavori, briefings digest, impostazioni).
  const mem = memoryConnected();
  checks.push({ nome: "Memoria Supabase", stato: mem ? "verde" : "rosso", dettaglio: mem ? "coda lavori e impostazioni attive" : "manca SUPABASE_URL + SERVICE_KEY: chat/giri non si accodano" });

  // 3) DB marketplace (i numeri reali).
  const db = marketplaceDbConnected();
  checks.push({ nome: "Dati marketplace", stato: db ? "verde" : "giallo", dettaglio: db ? "ordini/clienti leggibili" : "manca MARKETPLACE_SUPABASE_*: numeri non disponibili" });

  // 4) Traffico (PostHog).
  const ph = await getPostHog().catch(() => ({ connected: false }) as any);
  checks.push({ nome: "Traffico (PostHog)", stato: ph?.connected ? "verde" : "giallo", dettaglio: ph?.connected ? "visite tracciate" : "non collegato: niente funnel/conversione" });

  // 5) Ultimo briefing: fresco se < 24h.
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

  // 6) Ultimo battito del cuore (cron/worker).
  const battito = await getImpostazione("cuore:ultimo").catch(() => null);
  const oreBatt = oreDa(battito);
  checks.push({
    nome: "Battito (cron)",
    stato: oreBatt == null ? "giallo" : oreBatt <= 26 ? "verde" : oreBatt <= 72 ? "giallo" : "rosso",
    dettaglio: oreBatt == null ? "nessun battito registrato: il cron non ha ancora girato" : `ultimo ${eta(oreBatt)}`,
  });

  // 6b) Worker VPS (coda chat/lavori): senza di lui i messaggi restano «in attesa» per sempre.
  const worker = await getImpostazione("worker:ultimo").catch(() => null);
  const oreWorker = oreDa(worker);
  checks.push({
    nome: "Worker chat (VPS)",
    stato: oreWorker == null ? "rosso" : oreWorker <= 0.1 ? "verde" : oreWorker <= 1 ? "giallo" : "rosso",
    dettaglio:
      oreWorker == null
        ? "mai partito: avvia systemctl start mycity-worker sul VPS"
        : oreWorker <= 0.1
          ? `vivo · battito ${eta(oreWorker)}`
          : `spento da ${eta(oreWorker)} — i lavori in coda non partono`,
  });

  // 6c) Ultimo push memoria-ad su GitHub (il Pannello legge quel ramo, non main).
  const ultimoPush = await getImpostazione("memoria-ad:ultimo_push").catch(() => null);
  const orePush = oreDa(ultimoPush);
  checks.push({
    nome: "Push memoria-ad (GitHub)",
    stato: orePush == null ? "giallo" : orePush <= 6 ? "verde" : orePush <= 48 ? "giallo" : "rosso",
    dettaglio:
      orePush == null
        ? "nessun push registrato: verifica GIT_PUSH_TOKEN sul VPS"
        : `ultimo push ${eta(orePush)} — merge su main NON necessario per il Pannello`,
  });

  // 7) Autopilota (informativo).
  const auto = (await getImpostazione("autopilota").catch(() => null)) === "on";
  checks.push({ nome: "Autopilota", stato: auto ? "verde" : "giallo", dettaglio: auto ? "le azioni 🟢 partono da sole" : "spento: le 🟢 restano in coda" });

  // 8) Budget AI: giallo oltre l'80%, rosso a saturazione.
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
