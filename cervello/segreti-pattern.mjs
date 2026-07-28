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
  // ── AR-275 — le chiavi che fanno funzionare IL CERVELLO, che finora non avevano una regola.
  // Le prime undici regole nascono da un incidente su un token GitHub e coprono i provider "da
  // manuale"; le chiavi con cui la macchina pensa (Anthropic), legge il marketplace (Supabase nuovo
  // formato), parla a Nicola (Telegram) e misura (PostHog) erano scoperte. La regola "OpenAI key"
  // sembrava coprire Anthropic e invece no: `sk-ant-api03-…` si ferma al primo trattino.
  {
    nome: "Anthropic API key / OAuth",
    re: /sk-ant-(?:api|oat|admin)[0-9]{0,2}-[A-Za-z0-9_-]{40,}/g,
    sostituto: "sk-ant-…[REDATTO]",
  },
  { nome: "Supabase secret key (sb_secret_)", re: /sb_secret_[A-Za-z0-9_-]{20,}/g, sostituto: "sb_secret_…[REDATTO]" },
  { nome: "Stripe test secret key", re: /sk_test_[A-Za-z0-9]{20,}/g, sostituto: "sk_test_…[REDATTO]" },
  { nome: "Stripe webhook secret", re: /whsec_[A-Za-z0-9]{20,}/g, sostituto: "whsec_…[REDATTO]" },
  { nome: "PostHog personal API key", re: /phx_[A-Za-z0-9]{32,}/g, sostituto: "phx_…[REDATTO]" },
  { nome: "Telegram bot token", re: /\b[0-9]{8,12}:AA[A-Za-z0-9_-]{30,}/g, sostituto: "…:AA…[REDATTO]" },
  { nome: "Cursor API key", re: /\bkey_[a-f0-9]{40,}/g, sostituto: "key_…[REDATTO]" },
];

/**
 * AR-275 — IL LEGAME TRA LE DUE LISTE. Il difetto non erano le regole mancanti: era che l'elenco
 * delle regole e l'elenco delle chiavi che la macchina usa davvero non si guardavano in faccia.
 * Qui la famiglia di chiave dichiara la regola che deve coprirla, e `provaRegole()` verifica che
 * ① ogni famiglia abbia una regola e ② quella regola scatti davvero su un campione.
 *
 * ⚠️ I campioni sono COSTRUITI A RUNTIME, mai scritti per intero nel sorgente: un campione letterale
 * con la forma di una chiave vera farebbe scattare lo scanner su QUESTO file e bloccherebbe la
 * pubblicazione della memoria (è già successo il 25/7, AR-270). Nessun valore reale, mai.
 */
const rip = (c, n) => new Array(n + 1).join(c);
export const CHIAVI_CERVELLO = [
  { env: "ANTHROPIC_API_KEY", regola: "Anthropic API key / OAuth", campione: () => `sk-ant-api03-${rip("a", 60)}` },
  { env: "CLAUDE_CODE_OAUTH_TOKEN", regola: "Anthropic API key / OAuth", campione: () => `sk-ant-oat01-${rip("b", 60)}` },
  { env: "CURSOR_API_KEY", regola: "Cursor API key", campione: () => `key_${rip("c", 48)}` },
  { env: "GIT_PUSH_TOKEN", regola: "GitHub classic/OAuth token", campione: () => `ghp_${rip("d", 40)}` },
  { env: "GIT_TOKEN", regola: "GitHub fine-grained PAT", campione: () => `github_pat_11${rip("E", 30)}` },
  { env: "MARKETPLACE_GIT_TOKEN", regola: "GitHub classic/OAuth token", campione: () => `gho_${rip("f", 40)}` },
  { env: "SUPABASE_SERVICE_KEY", regola: "Supabase secret key (sb_secret_)", campione: () => `sb_secret_${rip("g", 30)}` },
  { env: "MARKETPLACE_SUPABASE_KEY", regola: "Supabase secret key (sb_secret_)", campione: () => `sb_secret_${rip("h", 30)}` },
  { env: "MARKETPLACE_SUPABASE_WRITE_KEY", regola: "Supabase/JWT service_role", campione: () => `eyJ${rip("i", 20)}.${rip("j", 30)}.${rip("k", 30)}` },
  { env: "STRIPE_SECRET_KEY", regola: "Stripe test secret key", campione: () => `sk_test_${rip("l", 30)}` },
  { env: "POSTHOG_PERSONAL_API_KEY", regola: "PostHog personal API key", campione: () => `phx_${rip("m", 40)}` },
  { env: "TELEGRAM_BOT_TOKEN", regola: "Telegram bot token", campione: () => `123456789:AA${rip("n", 33)}` },
  { env: "RESEND_API_KEY", regola: "Resend API key", campione: () => ` re_${rip("o", 20)}` },
];

/**
 * Prova viva delle difese: ogni famiglia di chiave in uso ha una regola, e ogni regola SCATTA su un
 * campione finto. Una regola scritta e mai provata non è una difesa — è una riga di codice.
 * @returns {{ok: boolean, falliti: {env: string, regola: string, motivo: string}[], provate: number}}
 */
export function provaRegole() {
  const falliti = [];
  const nomi = new Set(REGOLE_SEGRETI.map((r) => r.nome));
  for (const c of CHIAVI_CERVELLO) {
    if (!nomi.has(c.regola)) {
      falliti.push({ env: c.env, regola: c.regola, motivo: "nessuna regola con questo nome" });
      continue;
    }
    const regola = REGOLE_SEGRETI.find((r) => r.nome === c.regola);
    regola.re.lastIndex = 0;
    if (!regola.re.test(c.campione())) {
      falliti.push({ env: c.env, regola: c.regola, motivo: "la regola NON scatta sul campione" });
    }
    regola.re.lastIndex = 0;
  }
  return { ok: falliti.length === 0, falliti, provate: CHIAVI_CERVELLO.length };
}

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
