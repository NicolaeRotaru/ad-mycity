import { captureError } from '@/lib/analytics/sentry';

/**
 * Logger wrapper — strutturato, integrato con Sentry.
 *
 * Esperti consultati:
 * - SRE: "console.* è la BASELINE affidabile in prod: Render conserva stdout/stderr.
 *   Sentry è un DI PIÙ (alerting), non l'unica destinazione — se manca il DSN,
 *   i log NON devono sparire."
 * - Security Engineer: "Mai PII raw in log. Sanitize input prima."
 *
 * Uso:
 *   logger.info('Order placed', { orderId, total });
 *   logger.warn('Slow query', { duration });
 *   logger.error(err, { context: 'checkout-submit', userId });
 *
 * Invariante (bonifica WS-DEPLOY): info/warn/error emettono SEMPRE una riga su
 * stdout/stderr (anche in produzione); warn+error vanno ANCHE a Sentry se il DSN
 * è configurato. Nessun fallimento su percorso-soldi resta invisibile.
 */

type LogContext = Record<string, unknown> | unknown;

// 🟡-10: chiavi che non devono MAI finire in log/Sentry in chiaro.
const PII_KEYS = /^(email|password|pass|token|authorization|auth|cookie|phone|tel|iban|card|card_number|cvv|secret|api_?key|access_token|refresh_token|ssn|fiscal_?code|vat)$/i;

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value == null) return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = PII_KEYS.test(k) ? '[redacted]' : redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

function toCtx(ctx: unknown): Record<string, unknown> | undefined {
  if (ctx === undefined || ctx === null) return undefined;
  let obj: Record<string, unknown>;
  if (typeof ctx === 'string') obj = { detail: ctx };
  else if (typeof ctx === 'object') obj = ctx as Record<string, unknown>;
  else obj = { value: ctx };
  return redact(obj) as Record<string, unknown>;
}

/**
 * Cattura server-side affidabile per gli errori di API/cron/webhook.
 *
 * Usa il SDK @sentry/nextjs già inizializzato da sentry.server.config.ts (via
 * instrumentation), con rilevamento DSN COERENTE col server (NEXT_PUBLIC_SENTRY_DSN
 * *o* SENTRY_DSN). Non passa dal wrapper `'use client'` (lib/analytics/sentry):
 * così un errore notturno del cron release-payouts o del webhook Stripe non viene
 * perso silenziosamente solo perché in prod è configurato SENTRY_DSN e non quello
 * pubblico. (Invariante: "si misura" — i fallimenti di soldi/consegna sono visibili.)
 */
async function captureServerError(err: unknown, ctx?: Record<string, unknown>): Promise<void> {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
  if (!dsn) return;
  const Sentry = await import('@sentry/nextjs').catch(() => null);
  Sentry?.captureException(err, ctx ? { extra: ctx } : undefined);
}

/**
 * Invia i WARN a Sentry come messaggio di livello 'warning' (breadcrumb/alert),
 * quando il DSN è configurato. La baseline resta comunque console.warn su stderr.
 */
async function captureServerMessage(msg: string, ctx?: Record<string, unknown>): Promise<void> {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
  if (!dsn) return;
  const Sentry = await import('@sentry/nextjs').catch(() => null);
  Sentry?.captureMessage(msg, ctx ? { level: 'warning', extra: ctx } : { level: 'warning' });
}

// Emette una riga di log strutturata (JSON) con contesto redatto (🟡-10).
function line(level: string, msg: string, ctx?: LogContext): string {
  return JSON.stringify({ level, msg, ts: new Date().toISOString(), ...(toCtx(ctx) ?? {}) });
}

export const logger = {
  // Baseline SEMPRE su stdout (anche in prod: Render li conserva).
  info: (msg: string, ctx?: LogContext) => {
    console.log(line('info', msg, ctx));
  },

  // Baseline SEMPRE su stderr + Sentry (se DSN) sul server. Prima in prod era muto.
  warn: (msg: string, ctx?: LogContext) => {
    console.warn(line('warn', msg, ctx));
    if (typeof window === 'undefined') {
      void captureServerMessage(msg, toCtx(ctx));
    }
  },

  error: (err: unknown, ctx?: LogContext) => {
    // Baseline SEMPRE su stderr (prima in prod era muto senza Sentry).
    console.error(line('error', err instanceof Error ? err.message : String(err), ctx));
    const c = toCtx(ctx);
    if (typeof window === 'undefined') {
      // Server (API/cron/webhook): cattura diretta sul SDK server già init'd.
      void captureServerError(err, c);
    } else {
      // Client: wrapper lazy esistente (init Sentry browser al primo errore).
      void captureError(err, c);
    }
  },
};
