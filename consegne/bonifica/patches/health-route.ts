import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/server';
import { staleCrons, type CronHeartbeat } from '@/lib/cron-health';

export const runtime = 'nodejs';
// Sempre fresh: i monitor esterni devono sapere lo stato reale, no cache.
export const dynamic = 'force-dynamic';

/**
 * Health check endpoint per uptime monitor esterni (UptimeRobot, BetterStack).
 *
 * Esperti consultati:
 * - SRE: "Health check NON deve fare query pesanti. SELECT 1 sul DB e basta.
 *   Se piu' di 1s di response time, il monitor pinga troppo spesso."
 * - Security: "Non esporre version, build hash, env. Solo status + timestamp."
 *
 * Stati possibili:
 * - 200 ok: tutto verde
 * - 503 service_unavailable: DB raggiungibile ma con problemi, env critiche
 *   mancanti, o cron fermi (scheduler morto)
 * - 500: errore non recuperabile
 *
 * NON protetto da auth: deve essere pingabile esternamente.
 */
export async function GET() {
  const startedAt = Date.now();
  const checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }> = {};

  // Check 1: Supabase DB raggiungibile (gate primario)
  try {
    const admin = getAdminSupabase();
    const t0 = Date.now();
    const { error } = await admin.from('categories').select('id').limit(1);
    checks.db = { ok: !error, latencyMs: Date.now() - t0, error: error?.message };
  } catch (e) {
    checks.db = { ok: false, error: e instanceof Error ? e.message : 'unknown' };
  }

  // Check 2: env vars critiche presenti (DB + APP)
  const requiredEnv = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_APP_URL',
  ];
  const missingEnv = requiredEnv.filter((k) => !process.env[k]);
  checks.env = { ok: missingEnv.length === 0, error: missingEnv.join(',') || undefined };

  // Check 3: env critiche dei PAGAMENTI/EMAIL/CRON — un deploy con queste mancanti
  // ha i soldi/webhook/email di fatto rotti ma prima passava 200 (falsa fiducia).
  const paymentEnv = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'RESEND_API_KEY',
    'CRON_SECRET',
  ];
  const missingPay = paymentEnv.filter((k) => !process.env[k]);
  // Mittente email: il default placeholder no-reply@example.com è rotto (Resend rifiuta).
  const from = process.env.RESEND_FROM ?? '';
  const badFrom = from === '' || /example\.com/i.test(from);
  if (badFrom) missingPay.push('RESEND_FROM(placeholder)');
  checks.payments = { ok: missingPay.length === 0, error: missingPay.join(',') || undefined };

  // Check 4: freschezza cron (dead-man switch esposto all'uptime monitor).
  // Se lo scheduler esterno è morto, i heartbeat diventano stale → 503, così un
  // monitor HTTP se ne accorge senza dipendere dal cron operational-alerts stesso.
  try {
    const admin = getAdminSupabase();
    const { data, error } = await admin
      .from('cron_heartbeats')
      .select('name,last_run_at');
    if (error) {
      checks.cron = { ok: true, error: `heartbeat check skip: ${error.message}` };
    } else {
      const stale = staleCrons((data ?? []) as CronHeartbeat[], Date.now());
      checks.cron = {
        ok: stale.length === 0,
        error: stale.length ? stale.map((s) => `${s.name}:${s.staleMin}m`).join(',') : undefined,
      };
    }
  } catch (e) {
    checks.cron = { ok: true, error: `heartbeat check error: ${e instanceof Error ? e.message : 'unknown'}` };
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  const status = allOk ? 'ok' : 'degraded';
  const httpStatus = allOk ? 200 : 503;

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      uptimeSec: process.uptime?.() ?? null,
      latencyMs: Date.now() - startedAt,
      checks,
    },
    { status: httpStatus, headers: { 'cache-control': 'no-store' } },
  );
}
