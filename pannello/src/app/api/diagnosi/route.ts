import { NextResponse } from "next/server";
import { memoryConnected, getImpostazione } from "@/lib/store";
import { marketplaceDbConnected } from "@/lib/marketplace-db";
import { getPostHog } from "@/lib/posthog";
import { getBudget } from "@/lib/ai-budget";
import { vaultGithubInfo, testVaultGithub } from "@/lib/obsidian";
import { marketplaceGithubInfo, testMarketplaceGithub } from "@/lib/github";
import { etaOre, oreDaQuando, raccogliSegnaliBattito } from "@/lib/battito";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🩺 SELF-DIAGNOSI DELLA MACCHINA (Ondata 0.5): l'autonomia sta DAVVERO girando?
// Un'autonomia spenta in silenzio e il rischio n.1. Qui controlliamo i segni vitali:
// memoria, DB, traffico, freschezza dell'ultimo briefing e dell'ultimo battito,
// autopilota, budget AI. €0: legge solo impostazioni e il vault.
type Stato = "verde" | "giallo" | "rosso";
type Check = { nome: string; stato: Stato; dettaglio: string };

export async function GET() {
  const checks: Check[] = [];
  const segnali = await raccogliSegnaliBattito();

  // 1) Vault GitHub: da QUI il Pannello legge briefing/STATO/AZIONI (ramo memoria-ad).
  //    Non basta "env presenti": facciamo un test REALE (GET /repos + /git/ref/heads/BRANCH)
  //    così un token scaduto o un ramo inesistente diventano ROSSO invece di un falso verde.
  const vault = vaultGithubInfo();
  const vaultTest = vault.collegato ? await testVaultGithub() : null;
  checks.push({
    nome: "Vault GitHub (Pannello)",
    stato: !vault.collegato ? "rosso" : vaultTest?.ok ? "verde" : "rosso",
    dettaglio: !vault.collegato
      ? "manca OBSIDIAN_* su Vercel: briefing e STATO non compaiono (anche se il giro gira)"
      : vaultTest?.ok
        ? `${vaultTest.dettaglio} — legge in tempo reale, merge su main NON necessario`
        : `accesso KO: ${vaultTest?.dettaglio ?? "token o ramo non validi"} — briefing/STATO non compaiono`,
  });

  // 2) Memoria Supabase (coda lavori, briefings digest, impostazioni).
  const mem = memoryConnected();
  checks.push({ nome: "Memoria Supabase", stato: mem ? "verde" : "rosso", dettaglio: mem ? "coda lavori e impostazioni attive" : "manca SUPABASE_URL + SERVICE_KEY: chat/giri non si accodano" });

  // 3) DB marketplace (i numeri reali).
  const db = marketplaceDbConnected();
  checks.push({ nome: "Dati marketplace", stato: db ? "verde" : "giallo", dettaglio: db ? "ordini/clienti leggibili" : "manca MARKETPLACE_SUPABASE_*: numeri non disponibili" });

  // 3b) Codice marketplace via GitHub (analisi/audit del sito mycity).
  const mktGh = marketplaceGithubInfo();
  const mktTest = mktGh.collegato ? await testMarketplaceGithub() : null;
  checks.push({
    nome: "Codice marketplace (GitHub)",
    stato: !mktGh.collegato ? "giallo" : mktTest?.ok ? "verde" : "rosso",
    dettaglio: mktTest?.dettaglio ?? "manca GITHUB_TOKEN + GITHUB_OWNER + GITHUB_REPO: radiografia/audit codice non disponibile",
  });

  // 4) Traffico (PostHog).
  const ph = await getPostHog().catch(() => ({ connected: false }) as any);
  checks.push({ nome: "Traffico (PostHog)", stato: ph?.connected ? "verde" : "giallo", dettaglio: ph?.connected ? "visite tracciate" : "non collegato: niente funnel/conversione" });

  // 5) Ultimo briefing: fresco se < 24h (fuso Piacenza corretto).
  const dataBriefing = segnali.ultimoGiro?.quando ?? null;
  const oreBrief = oreDaQuando(dataBriefing);
  checks.push({
    nome: "Ultimo giro (briefing)",
    stato: oreBrief == null ? "rosso" : oreBrief <= 24 ? "verde" : oreBrief <= 72 ? "giallo" : "rosso",
    dettaglio: oreBrief == null ? "nessun briefing salvato: lancia un giro" : `aggiornato ${etaOre(oreBrief)}`,
  });

  // 6) Autopilota Vercel (cron giornaliero — NON è l'ultimo giro AD sul VPS).
  const oreBatt = oreDaQuando(segnali.autopilotaCron?.quando);
  checks.push({
    nome: "Autopilota (cron Vercel)",
    stato: oreBatt == null ? "giallo" : oreBatt <= 26 ? "verde" : oreBatt <= 72 ? "giallo" : "rosso",
    dettaglio:
      oreBatt == null
        ? "nessun battito autopilota: cron /api/heartbeat non ha ancora girato"
        : `ultimo ${etaOre(oreBatt)}${segnali.ultimoGiro ? " — il giro AD è separato (riga sopra)" : ""}`,
  });

  // 6b) Worker VPS (coda chat/lavori): senza di lui i messaggi restano «in attesa» per sempre.
  const oreWorker = oreDaQuando(segnali.worker?.quando);
  checks.push({
    nome: "Worker chat (VPS)",
    stato: oreWorker == null ? "rosso" : oreWorker <= 0.1 ? "verde" : oreWorker <= 1 ? "giallo" : "rosso",
    dettaglio:
      oreWorker == null
        ? "mai partito: avvia systemctl start mycity-worker sul VPS"
        : oreWorker <= 0.1
          ? `vivo · battito ${etaOre(oreWorker)}`
          : `spento da ${etaOre(oreWorker)} — i lavori in coda non partono`,
  });

  // 6c) Ultimo push memoria-ad su GitHub (il Pannello legge quel ramo, non main).
  const orePush = oreDaQuando(segnali.pushMemoria?.quando);
  checks.push({
    nome: "Push memoria-ad (GitHub)",
    stato: orePush == null ? "giallo" : orePush <= 6 ? "verde" : orePush <= 48 ? "giallo" : "rosso",
    dettaglio:
      orePush == null
        ? "nessun push registrato: sul VPS esegui aggiorna-cervello.sh e verifica GIT_PUSH_TOKEN"
        : `ultimo push ${etaOre(orePush)} — merge su main NON necessario per il Pannello`,
  });

  // 6d) Pipeline worker sul VPS: legacy = TL;DR in chat ma memoria-ad ferma.
  const pipeline = await getImpostazione("worker:pipeline").catch(() => null);
  const codiceRev = await getImpostazione("worker:codice_rev").catch(() => null);
  const legacy = pipeline === "legacy-agent-direct";
  checks.push({
    nome: "Pipeline giro (VPS)",
    stato: !pipeline ? "giallo" : legacy ? "rosso" : "verde",
    dettaglio: !pipeline
      ? "sconosciuta: riavvia il worker (aggiorna-cervello.sh)"
      : legacy
        ? "VECCHIA — esegui sudo bash cervello/vps/aggiorna-cervello.sh sul VPS"
        : `attiva (${pipeline}${codiceRev ? ` · rev ${codiceRev}` : ""})`,
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
