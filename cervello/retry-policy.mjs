#!/usr/bin/env node
// 🔁 RETRY-POLICY — l'UNICA fonte di verità per decidere se un lavoro fallito va RITENTATO
//    in automatico, e QUANDO. La usano sia il worker (bash, via CLI `decidi`) sia la
//    sentinella (import), così la regola vive in un posto solo.
//
// 🟢/🔴 Principio di sicurezza (scelta di Nicola): auto-retry SOLO se è PROVATO che l'azione
//    non è partita. Un errore di QUOTA ("session limit / out of usage / rate limit") è la prova
//    che il motore AI non è nemmeno partito → 0 rischio doppio-invio → ritentabile per QUALSIASI
//    tipo, incluse le azioni reali 🔴 (esegui-azione). Un TIMEOUT o altro NON è prova (il processo
//    ha girato e potrebbe aver fatto qualcosa) → ritentabile solo per i tipi "pre-esecuzione"
//    (giro/chat/proposta/…), MAI per esegui-azione, che va lasciato al "Riprova" manuale.
//
// Uso CLI (per worker.sh):
//   RP_TIPO=proposta RP_TENTATIVI=0 RP_RISULTATO="...testo errore..." node cervello/retry-policy.mjs decidi
//   → stampa una riga JSON: {"azione":"ritenta|stop","tentativi":N,"quandoISO":"...","classe":"...","motivo":"..."}
//
// Import (per la sentinella):
//   import { decidiRitento, classificaErrore } from "./retry-policy.mjs";

// Il worker sul VPS gira con TZ=Europe/Rome; forziamola anche qui così l'orario di reset
// ("resets 9:30pm (Europe/Rome)") viene interpretato come ora-di-parete italiana anche quando
// la sentinella gira sotto un altro fuso.
process.env.TZ = process.env.TZ || "Europe/Rome";

// Quante volte insistere PRIMA di fermarsi e chiedere a Nicola.
export const MAX_TENTATIVI_QUOTA = 6; // la quota si resetta da sola: vale la pena insistere.
export const MAX_TENTATIVI_ALTRO = 3; // timeout/transitori: qualche colpo, poi fermati.

// Finestra di sessione dei motori AI (Claude Max / Cursor) = ROLLING ~5h: il reset della quota è
// SEMPRE entro poche ore, MAI a 24h. Se un orario di reset esplicito ("resets 2:30am") viene
// interpretato come DOMANI — perché l'errore è stato registrato appena DOPO quell'ora — il
// ritentativo verrebbe spinto a +24h e il lavoro resterebbe fermo tutto il giorno con la quota
// ORMAI libera (il bug osservato in Pannello: "resets 2:30am" → riprova_dopo il giorno dopo).
// Questo tetto lo impedisce: oltre la finestra, il reset è già passato → ritenta subito.
export const MAX_ATTESA_QUOTA_MIN = 360; // 6h (5h finestra + margine): oltre = reset già trascorso.
export const MAX_ATTESA_QUOTA_MS = MAX_ATTESA_QUOTA_MIN * 60 * 1000;

// Tipi che NON azionano le "mani" reali: al massimo rifanno lavoro 🟢 (o accodano bozze che
// Nicola rivede comunque). Per loro anche un timeout è sicuro da ritentare.
// AR-024: le cadenze del battito (ritmo-mattino|mezzogiorno|sera|settimana) sono pre-esecuzione —
//   scrivono solo memoria e accodano eventuali 🔴 che Nicola firma comunque → ritentabili in sicurezza.
//   Servono qui perché quando una cadenza salta per rate-limit si ri-accoda come lavoro (vedi ritmo.sh)
//   e dev'essere trattata come "sicura da rifare", non come azione reale 🔴.
// Esportata: è la fonte UNICA dei tipi "pre-esecuzione" (sicuri da rifare). La riusa anche
// sentinella-lavori.mjs per decidere quali orfani ri-accodare, così la lista non si sdoppia
// e non dimentica più le cadenze ritmo-* (era la causa dei giro/ritmo marcati "errore" a metà).
// ⚠️ 'proposta' NON è qui (radiografia 2026-07-11, difetto B3): il worker le arma le mani (ramo
// generico, AI_ALLOW_ACTIONS=1 → può chiamare esegui-azione.mjs) e sia il worker sia sentinella-lavori
// la trattano come AZIONE REALE (orfano → «riapprova»). Se la classificassimo pre-esecuzione qui, un
// timeout su una proposta la farebbe RI-ESEGUIRE in automatico → rischio doppio invio. Coerenza col
// resto: mai auto-retry, va al «Riprova» manuale di Nicola. (Se un giorno 'proposta' avrà un prompt
// SOLO-bozza senza mani, la si potrà rimettere qui.)
export const TIPI_PRE_ESECUZIONE = new Set([
  "giro", "chat", "metabolizza", "analisi", "playbook", "risposta", "rifiuta-azione",
  "ritmo-mattino", "ritmo-mezzogiorno", "ritmo-sera", "ritmo-settimana",
]);
// L'UNICO tipo che aziona davvero le mani 🔴 (email/payout via esegui-azione.mjs):
// ritenta SOLO se è provato che non è partito (errore di quota). Tutto il resto → manuale.
const TIPI_AZIONE_REALE = new Set(["esegui-azione"]);

// Riconosce la CLASSE dell'errore dal testo lasciato dal worker.
export function classificaErrore(risultato = "") {
  const t = String(risultato);
  const quota =
    /session limit|hit your (usage|session) limit|out of usage|you'?re out of usage|rate[ _-]?limit|too many requests|\b429\b|overloaded|actionrequirederror|increase (your )?limits?|insufficient_quota|quota|credit balance|billing/i.test(
      t
    );
  const timeout = /\btimeout\b|timed out|\bkilled\b|rc=124|rc=137|sigkill|sigterm/i.test(t);
  // Orario di reset esplicito nel messaggio? es. "resets 9:30pm (Europe/Rome)" → "9:30pm".
  const m = t.match(/resets?\s+([0-9]{1,2}(?::[0-9]{2})?\s*(?:am|pm)?)/i);
  return {
    classe: quota ? "quota" : timeout ? "timeout" : "altro",
    resetHint: m ? m[1].trim() : null,
  };
}

// "9:30pm" / "21:30" / "9pm" → prossimo istante (ms) in cui quell'ora capita. +2 min di margine.
function istanteDaOrario(hint, now) {
  const m = String(hint).match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ap = m[3] ? m[3].toLowerCase() : null;
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  const d = new Date(now);
  d.setHours(h, min, 0, 0);
  let ms = d.getTime();
  if (ms <= now) ms += 24 * 60 * 60 * 1000; // già passato oggi → la prossima occorrenza è domani.
  return ms + 2 * 60 * 1000;
}

// Backoff (minuti) quando non c'è un orario di reset esplicito.
function minutiBackoff(classe, tentativi) {
  const QUOTA = [15, 30, 60, 120, 240, 240];
  const ALTRO = [2, 5, 15, 30];
  const arr = classe === "quota" ? QUOTA : ALTRO;
  return arr[Math.min(Math.max(tentativi, 0), arr.length - 1)];
}

// Decide cosa fare di un lavoro fallito.
//   { tipo, tentativi, risultato, nowMs, errorAtMs } → { azione:"ritenta"|"stop", tentativi, quandoISO, classe, motivo, maxTent }
//   errorAtMs = quando l'errore è AVVENUTO (updated_at del lavoro). Serve a calcolare l'istante
//   giusto del reset quota: vedi il commento sul punto 3) qui sotto.
export function decidiRitento({ tipo, tentativi = 0, risultato = "", nowMs, errorAtMs } = {}) {
  const now = Number.isFinite(nowMs) ? nowMs : Date.now();
  // Riferimento per calcolare l'ISTANTE del reset ("resets 2:30am"): il momento in cui l'errore è
  // avvenuto, NON "adesso". Quando la sentinella rivaluta un errore DOPO che l'ora di reset è già
  // passata (es. errore prima delle 2:30, sentinella alle 2:36), usare "adesso" farebbe scattare la
  // regola "già passato oggi → la prossima è domani" e spingerebbe il ritentativo di +24h — mentre la
  // quota si è GIÀ resettata e il lavoro potrebbe ripartire subito. Ancorando al momento dell'errore,
  // l'istante calcolato cade nel passato → il worker lo riprende immediatamente.
  const refMs = Number.isFinite(errorAtMs) ? errorAtMs : now;
  const tent = Number.isFinite(+tentativi) ? +tentativi : 0;
  const { classe, resetHint } = classificaErrore(risultato);
  const preEsec = TIPI_PRE_ESECUZIONE.has(tipo);
  // Tipi sconosciuti li trattiamo come reali (prudenza: non ritentare qualcosa che non capiamo).
  const azioneReale = TIPI_AZIONE_REALE.has(tipo) || !preEsec;

  // 1) È ammesso ritentare in automatico?
  let maxTent;
  if (classe === "quota") {
    maxTent = MAX_TENTATIVI_QUOTA; // provato non-partito → ok per tutti, anche 🔴.
  } else if (preEsec) {
    maxTent = MAX_TENTATIVI_ALTRO; // pre-esecuzione → sicuro anche su timeout/altro.
  } else {
    return {
      azione: "stop",
      tentativi: tent,
      classe,
      motivo:
        azioneReale && classe === "timeout"
          ? "azione reale 🔴 interrotta a metà: potrebbe essere partita → riprova manuale"
          : "azione reale 🔴 con errore non-quota: non provo da solo → riprova manuale",
    };
  }

  // 2) Esaurito il budget di tentativi automatici?
  if (tent >= maxTent) {
    return {
      azione: "stop",
      tentativi: tent,
      classe,
      maxTent,
      motivo: `esauriti i tentativi automatici (${tent}/${maxTent}) — serve un intervento (quota/motore?)`,
    };
  }

  // 3) Quando ritentare: se il messaggio dà l'ora di reset, aspettiamo QUELLA (ancorata al momento
  //    dell'errore → vedi refMs sopra); altrimenti backoff dal momento attuale.
  const daOrarioRaw = classe === "quota" && resetHint ? istanteDaOrario(resetHint, refMs) : null;
  // La finestra di sessione è rolling (~5h): un istante di reset oltre MAX_ATTESA_QUOTA è finito
  // "domani" solo perché l'errore è avvenuto appena DOPO l'orario indicato → la quota si è già
  // liberata. In quel caso NON aspettare ~24h: ritenta col backoff breve (la macchina riprende da
  // sola non appena il limite cade), invece di lasciare il lavoro fermo tutto il giorno.
  const resetGiaPassato = daOrarioRaw != null && daOrarioRaw - refMs > MAX_ATTESA_QUOTA_MS;
  const daOrario = resetGiaPassato ? null : daOrarioRaw;
  const quandoMs = daOrario ?? now + minutiBackoff(classe, tent) * 60 * 1000;

  return {
    azione: "ritenta",
    tentativi: tent + 1,
    maxTent,
    classe,
    resetHint: resetHint || null,
    quandoISO: new Date(quandoMs).toISOString(),
    motivo:
      classe === "quota"
        ? resetGiaPassato
          ? `quota esaurita — reset (${resetHint}) già trascorso: ritento subito col backoff`
          : resetHint
            ? `quota esaurita — ritento dopo il reset (${resetHint})`
            : "quota esaurita — ritento col backoff"
        : `${classe} su lavoro sicuro — ritento col backoff`,
  };
}

// --- CLI: `decidi` legge da env (RP_TIPO/RP_TENTATIVI/RP_RISULTATO) e stampa una riga JSON ---
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain && process.argv[2] === "decidi") {
  const errAt = Date.parse(process.env.RP_ERROR_AT || "");
  const out = decidiRitento({
    tipo: process.env.RP_TIPO || "",
    tentativi: process.env.RP_TENTATIVI || "0",
    risultato: process.env.RP_RISULTATO || "",
    errorAtMs: Number.isFinite(errAt) ? errAt : undefined,
  });
  process.stdout.write(JSON.stringify(out));
  process.exit(0);
}
if (isMain && process.argv[2] === "--self-test") {
  const casi = [
    { tipo: "proposta", tentativi: 0, risultato: "You've hit your session limit · resets 9:30pm (Europe/Rome) [worker] rc=1." },
    { tipo: "esegui-azione", tentativi: 0, risultato: "out of usage. [worker] motore cursor (agent) uscito con rc=1." },
    { tipo: "esegui-azione", tentativi: 0, risultato: "[worker] TIMEOUT dopo 900s — lavoro interrotto." },
    { tipo: "giro", tentativi: 0, risultato: "[worker] TIMEOUT giro dopo 2700s." },
    { tipo: "proposta", tentativi: 6, risultato: "session limit resets 9:30pm" },
    // AR-024: cadenza del battito saltata per rate-limit → deve ritentare dopo il reset (non "stop").
    { tipo: "ritmo-sera", tentativi: 0, risultato: "You've hit your session limit · resets 9:30pm (Europe/Rome) [worker] ritmo.sh sera uscito con rc=1." },
    // Reset già passato quando si rivaluta l'errore: deve dare un istante NEL PASSATO (retry subito),
    // non a +24h. errorAt 02:10, reset 2:30am, "adesso" 02:36 → riprova_dopo ~02:32 (passato) = subito.
    {
      tipo: "esegui-azione",
      tentativi: 0,
      risultato: "You've hit your session limit · resets 2:30am (Europe/Rome) [worker] rc=1.",
      errorAtMs: new Date("2026-07-03T00:10:00Z").getTime(),
      nowMs: new Date("2026-07-03T00:36:00Z").getTime(),
    },
    // BUG del Pannello: l'errore è stato registrato APPENA DOPO il reset (02:36 > 2:30am). Senza il
    // tetto, "2:30am" finiva domani → riprova_dopo a +24h (lavoro fermo tutto il giorno). Ora deve
    // capire che il reset è già passato e ritentare col backoff breve (minuti, non un giorno).
    {
      tipo: "esegui-azione",
      tentativi: 0,
      risultato: "You've hit your session limit · resets 2:30am (Europe/Rome) [worker] motore claude (claude) uscito con rc=1.",
      errorAtMs: new Date("2026-07-03T00:36:00Z").getTime(),
      nowMs: new Date("2026-07-03T00:36:30Z").getTime(),
    },
  ];
  for (const c of casi) console.log(JSON.stringify(c), "→", JSON.stringify(decidiRitento(c)));
  process.exit(0);
}
