// Lettura statistiche dal sito via PostHog (visite, visitatori) per le metriche
// "Visite sito" e "Conversione". Best-effort: se non collegato, torna connected:false.

const HOST = process.env.POSTHOG_HOST; // es. https://eu.posthog.com oppure https://us.posthog.com
const PROJECT = process.env.POSTHOG_PROJECT_ID;
const KEY = process.env.POSTHOG_API_KEY; // Personal API key (lettura)

export function posthogConnected(): boolean {
  return Boolean(HOST && PROJECT && KEY);
}

/** Diagnosi senza segreti: cosa manca o è sbagliato nelle env Vercel. */
export function posthogDiagnosiDettaglio(apiErrore?: string): string {
  const host = HOST?.trim() || "";
  const project = PROJECT?.trim() || "";
  const key = KEY?.trim() || "";
  if (!host) return "manca POSTHOG_HOST su Vercel (https://us.posthog.com per account US)";
  if (!project) return "manca POSTHOG_PROJECT_ID su Vercel (495230 per il tuo progetto US)";
  if (!key) return "manca POSTHOG_API_KEY su Vercel (chiave personale che inizia con phx_)";
  if (key.startsWith("phc_")) return "POSTHOG_API_KEY è phc_ (solo tracking): serve phx_ (personale, lettura)";
  if (host.includes("eu.posthog")) return "POSTHOG_HOST è EU ma l'account è US — usa https://us.posthog.com";
  if (apiErrore) return `env presenti ma PostHog risponde errore: ${apiErrore.slice(0, 80)}`;
  return "non collegato: controlla env Vercel Production + redeploy";
}

async function hogql(query: string): Promise<number> {
  const r = await fetch(`${HOST}/api/projects/${PROJECT}/query/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
    cache: "no-store",
  });
  const d: any = await r.json();
  if (!r.ok) throw new Error(d.detail || `PostHog ${r.status}`);
  return Number(d.results?.[0]?.[0]) || 0;
}

export async function getPostHog(): Promise<{
  connected: boolean;
  visite_7g?: number;
  visitatori_7g?: number;
  apiErrore?: string;
}> {
  if (!posthogConnected()) return { connected: false };
  try {
    const visite = await hogql(
      "select count() from events where event = '$pageview' and timestamp >= now() - interval 7 day"
    );
    const visitatori = await hogql(
      "select count(distinct person_id) from events where event = '$pageview' and timestamp >= now() - interval 7 day"
    );
    return { connected: true, visite_7g: visite, visitatori_7g: visitatori };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { connected: false, apiErrore: msg };
  }
}
