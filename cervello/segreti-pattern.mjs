// segreti-pattern.mjs — regex condivise tra scan-segreti (blocco) e redattore-segreti (prevenzione).
// I placeholder tipici (xxxx, REDATTO, INSERISCI, …) NON matchano.

export const REGOLE_SEGRETI = [
  { nome: "GitHub fine-grained PAT", re: /github_pat_11[A-Za-z0-9_]{20,}/g, sostituto: "github_pat_11…[REDATTO]" },
  { nome: "GitHub classic/OAuth token", re: /gh[pousr]_[A-Za-z0-9]{36,}/g, sostituto: "ghp_…[REDATTO]" },
  { nome: "Supabase management token (sbp_)", re: /sbp_[A-Za-z0-9]{20,}/g, sostituto: "sbp_…[REDATTO]" },
  { nome: "Stripe secret/live key", re: /sk_live_[A-Za-z0-9]{20,}/g, sostituto: "sk_live_…[REDATTO]" },
  { nome: "Stripe restricted key", re: /rk_live_[A-Za-z0-9]{20,}/g, sostituto: "rk_live_…[REDATTO]" },
  {
    nome: "Supabase/JWT service_role",
    re: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g,
    sostituto: "eyJ…[REDATTO]",
  },
  { nome: "Google API key", re: /AIza[0-9A-Za-z_-]{35}/g, sostituto: "AIza…[REDATTO]" },
  { nome: "OpenAI key", re: /sk-[A-Za-z0-9]{32,}/g, sostituto: "sk-…[REDATTO]" },
  { nome: "Slack token", re: /xox[baprs]-[A-Za-z0-9-]{10,}/g, sostituto: "xoxb-…[REDATTO]" },
  { nome: "AWS access key id", re: /AKIA[0-9A-Z]{16}/g, sostituto: "AKIA…[REDATTO]" },
  {
    nome: "Chiave privata PEM",
    re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
    sostituto: "[CHIAVE-PRIVATA-REDATTA]",
  },
  { nome: "Resend API key", re: /(?:^|[^A-Za-z0-9_])re_[A-Za-z0-9_]{16,}/g, sostituto: "re_…[REDATTO]" },
  { nome: "n8n API key", re: /n8n_api_[A-Za-z0-9]{20,}/g, sostituto: "n8n_api_…[REDATTO]" },
];

/** Redige un segreto per report: primi 7 + ultimi 3 caratteri. */
export function campioneRedatto(s) {
  if (s.length <= 12) return s.slice(0, 3) + "…";
  return `${s.slice(0, 7)}…${s.slice(-3)} [${s.length} char]`;
}

/** Sostituisce ogni match con il placeholder della regola. */
export function redigiTesto(testo) {
  let out = testo;
  for (const regola of REGOLE_SEGRETI) {
    regola.re.lastIndex = 0;
    out = out.replace(regola.re, regola.sostituto);
  }
  return out;
}
