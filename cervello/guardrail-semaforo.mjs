// guardrail-semaforo.mjs — cancello 🟢🟡🔴 condiviso (esegui-azione, autopilot, worker, pannello).
// Doppio controllo: (1) classificazione colore/rischio (2) firma esplicita Nicola per 🔴 e canali sensibili.
// In LIVE senza firma → BLOCCO hard (exit 2 da CLI). In dry-run → sempre permesso (simula).

/** @typedef {'verde'|'giallo'|'rosso'|'?'} Livello */

const EMOJI = { "🟢": "verde", "🟡": "giallo", "🔴": "rosso" };

const CANALI_SENSIBILI =
  /stripe|payout|transfer|refund|rimborso|whatsapp|sms|deploy|produzione|ads|meta\s*ads|google\s*ads|contratto|firma\s+negozio/i;

const TESTO_SENSIBILE =
  /\b(payout|stripe|transfer|refund|rimborso|chargeback|iban|commissione|deploy|produzione|whatsapp|pubblica\s+su|spendi|budget\s+ads|messagg(?:io|i)\s+a\s+(?:il\s+)?negozio|email\s+a\s+[^@\s]+@)\b/i;

const DOMINI_INTERNI = /@(?:mycity|resend\.dev|example)/i;

/**
 * @param {string|undefined|null} raw
 * @returns {Livello}
 */
export function parseLivello(raw) {
  const s = String(raw || "").toLowerCase();
  if (s.includes("🔴") || s === "rosso" || s === "red") return "rosso";
  if (s.includes("🟡") || s === "giallo" || s === "yellow") return "giallo";
  if (s.includes("🟢") || s === "verde" || s === "green") return "verde";
  return "?";
}

/**
 * @param {Record<string, string|undefined>} [env]
 * @param {{ firmaNicola?: boolean, argv?: string[] }} [opts]
 */
export function hasFirmaNicola(env = process.env, opts = {}) {
  if (opts.firmaNicola === true) return true;
  const argv = opts.argv || process.argv;
  if (argv.includes("--firma-nicola")) return true;
  const v = env.NICOLA_FIRMA;
  return v === "1" || v === "on" || v === "true";
}

/**
 * @param {{ livello?: Livello|string, canale?: string, destinatario?: string, testo?: string, titolo?: string }} ctx
 * @returns {{ livello: Livello, motivi: string[] }}
 */
export function classificaRischio(ctx) {
  const motivi = [];
  let livello = parseLivello(ctx.livello);
  const blob = [ctx.titolo, ctx.testo, ctx.canale, ctx.destinatario].filter(Boolean).join(" ");

  if (livello === "?") {
    for (const [emoji, lv] of Object.entries(EMOJI)) {
      if (blob.includes(emoji)) {
        livello = /** @type {Livello} */ (lv);
        motivi.push(`emoji ${emoji}`);
        break;
      }
    }
  }

  const canale = String(ctx.canale || "");
  if (CANALI_SENSIBILI.test(canale)) {
    if (livello !== "rosso") motivi.push(`canale sensibile: ${canale}`);
    livello = "rosso";
  }
  if (TESTO_SENSIBILE.test(blob)) {
    if (livello !== "rosso") motivi.push("contenuto sensibile (soldi/messaggi/deploy)");
    livello = "rosso";
  }

  const dest = String(ctx.destinatario || "").trim();
  if (dest && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dest) && !DOMINI_INTERNI.test(dest)) {
    if (livello === "verde" || livello === "?") {
      motivi.push(`email esterna: ${dest}`);
      livello = "rosso"; // messaggio a persona reale → sempre 🔴 per il guardrail
    }
  }

  return { livello, motivi };
}

/**
 * @param {{
 *   live?: boolean,
 *   livello?: Livello|string,
 *   firmaNicola?: boolean,
 *   automatico?: boolean,
 *   canale?: string,
 *   destinatario?: string,
 *   testo?: string,
 *   titolo?: string,
 *   env?: Record<string, string|undefined>,
 *   argv?: string[],
 * }} ctx
 */
export function verificaEsecuzione(ctx) {
  const live = Boolean(ctx.live);
  const env = ctx.env || process.env;
  const firma = hasFirmaNicola(env, ctx);
  const { livello, motivi } = classificaRischio(ctx);

  if (!live) {
    return { ok: true, modalita: "dry-run", livello, firma, motivi };
  }

  if (ctx.automatico && livello !== "verde") {
    return {
      ok: false,
      bloccato: true,
      codice: "AUTO_NON_VERDE",
      livello,
      firma,
      motivi,
      motivo:
        `BLOCCATO: esecuzione automatica su azione ${livello} (solo 🟢 consentite). ` +
        "Serve approvazione manuale di Nicola.",
    };
  }

  if (livello === "rosso" && !firma) {
    return {
      ok: false,
      bloccato: true,
      codice: "ROSSO_SENZA_FIRMA",
      livello,
      firma,
      motivi,
      motivo:
        "BLOCCATO: azione 🔴 senza firma esplicita di Nicola. " +
        "Imposta NICOLA_FIRMA=1 o --firma-nicola (solo dopo Approva nel Pannello).",
    };
  }

  const canale = String(ctx.canale || "");
  const blob = [ctx.titolo, ctx.testo, canale].join(" ");
  if ((CANALI_SENSIBILI.test(canale) || TESTO_SENSIBILE.test(blob)) && !firma) {
    return {
      ok: false,
      bloccato: true,
      codice: "CANALE_SENSIBILE_SENZA_FIRMA",
      livello: "rosso",
      firma,
      motivi,
      motivo:
        "BLOCCATO: canale/contenuto sensibile (soldi, messaggi esterni, deploy) senza firma di Nicola.",
    };
  }

  return { ok: true, modalita: "live", livello, firma, motivi };
}

/** Self-test dry-run: verifica che i blocchi funzionino prima di accendere LIVE. */
export function runSelfTest() {
  const casi = [
    {
      nome: "dry-run 🔴 senza firma → permesso (simula)",
      ctx: { live: false, livello: "rosso", canale: "email", destinatario: "negozio@example.com" },
      atteso: true,
    },
    {
      nome: "LIVE 🔴 senza firma → blocco",
      ctx: { live: true, livello: "rosso", canale: "email", destinatario: "negozio@example.com" },
      atteso: false,
      codice: "ROSSO_SENZA_FIRMA",
    },
    {
      nome: "LIVE 🔴 con firma → ok",
      ctx: { live: true, livello: "rosso", firmaNicola: true, canale: "email" },
      atteso: true,
    },
    {
      nome: "LIVE payout senza firma → blocco",
      ctx: { live: true, livello: "verde", canale: "stripe-payout", testo: "transfer 50€" },
      atteso: false,
    },
    {
      nome: "autopilot 🟡 → blocco",
      ctx: { live: true, livello: "giallo", automatico: true, canale: "telegram" },
      atteso: false,
      codice: "AUTO_NON_VERDE",
    },
    {
      nome: "autopilot 🟢 → ok",
      ctx: { live: true, livello: "verde", automatico: true, canale: "telegram", testo: "report interno" },
      atteso: true,
    },
    {
      nome: "LIVE email esterna etichettata 🟢 → blocco senza firma",
      ctx: {
        live: true,
        livello: "verde",
        canale: "email",
        destinatario: "bottega@gmail.com",
        testo: "Ciao, siamo MyCity",
      },
      atteso: false,
    },
  ];

  let pass = 0;
  const errori = [];
  for (const c of casi) {
    const r = verificaEsecuzione(c.ctx);
    const ok = c.atteso ? r.ok === true : r.ok === false && (!c.codice || r.codice === c.codice);
    if (ok) pass++;
    else errori.push(`  ❌ ${c.nome}: atteso ok=${c.atteso}${c.codice ? ` codice=${c.codice}` : ""}, got ok=${r.ok} codice=${r.codice}`);
  }
  return { pass, totale: casi.length, ok: pass === casi.length, errori };
}
