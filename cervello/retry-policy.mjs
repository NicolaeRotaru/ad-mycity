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

// AR-294 — la lettura del canale dichiarato sta in `finestra-misura.mjs` (modulo puro): «da quale
// fetta di testo mi è concesso ricavare questo segnale» è la stessa domanda che lì si fa sul tempo
// e sul perimetro.
import { segnaleDichiarato } from "./finestra-misura.mjs";

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

// ⛔ IL LIMITE SETTIMANALE È UN ALTRO ANIMALE (2026-08-10, sintomo osservato).
// Tutto il ragionamento qui sopra è tarato sulla finestra ROLLING di ~5h: reset «sempre entro poche
// ore, MAI a 24h». Vero per la sessione, falso per il limite SETTIMANALE dei piani Claude — quello
// si libera fra GIORNI. Con la sola classe "quota" succedeva questo: backoff da minuti, sei tentativi
// bruciati in poche ore, poi stop definitivo. Nessuno ripartiva più, e le cadenze restavano ferme
// finché non se ne accorgeva Nicola (11 giorni sul monitoraggio: Intelligence ferma dal 30/7 al 10/8).
// Il tetto sotto vale SOLO per questa classe: aspettare giorni qui è la risposta giusta, non un bug.
export const MAX_ATTESA_QUOTA_SETTIMANALE_MIN = 8 * 24 * 60; // 8 giorni: copre una settimana + margine.
export const MAX_ATTESA_QUOTA_SETTIMANALE_MS = MAX_ATTESA_QUOTA_SETTIMANALE_MIN * 60 * 1000;
// Quando il messaggio non dice QUANDO si libera, non ha senso ricontrollare ogni 15 minuti per
// giorni: si guarda ogni 6h. È il passo del "ricontrollo leggero", non una rinuncia.
export const BACKOFF_QUOTA_SETTIMANALE_MIN = 360;
export const MAX_TENTATIVI_QUOTA_SETTIMANALE = 40; // 40 × 6h ≈ 10 giorni di pazienza prima di arrendersi.

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
// 10/8: 'monitora' mancava, e da oggi arriva davvero in coda — la veglia sul motore ri-accoda il
//   monitoraggio saltato. Senza dichiararlo qui finiva fra i tipi SCONOSCIUTI, che per prudenza si
//   trattano come azioni reali 🔴: un monitoraggio orfano veniva marcato «errore, riapprova» come se
//   avesse mandato un'email, e un suo timeout non si ritentava. È la stessa dimenticanza che AR-024
//   aveva già pagato sui ritmo-*. Il monitoraggio legge il web e scrive memoria: nessuna mano sul mondo.
export const TIPI_PRE_ESECUZIONE = new Set([
  "giro", "chat", "metabolizza", "analisi", "playbook", "risposta", "rifiuta-azione", "monitora",
  "ritmo-mattino", "ritmo-mezzogiorno", "ritmo-sera", "ritmo-settimana",
]);
// L'UNICO tipo che aziona davvero le mani 🔴 (email/payout via esegui-azione.mjs):
// ritenta SOLO se è provato che non è partito (errore di quota). Tutto il resto → manuale.
const TIPI_AZIONE_REALE = new Set(["esegui-azione"]);

// ─────────────────────────────────────────────────────────────────────────────
// AR-294 — UN ERRORE SI CLASSIFICA DAL SEGNALE, NON DALLA PROSA
// ─────────────────────────────────────────────────────────────────────────────
// Il worker salva in UN campo solo tutto l'output del processo: la relazione italiana dell'AD e il
// messaggio d'errore del motore finiscono nello stesso posto. La classificazione cercava la PAROLA
// `quota` dentro quel testo — così una relazione che parlava di «quota di mercato» convinceva la
// macchina di aver sbattuto contro il limite del motore, e partivano sei ritentativi con attese di
// ore. Finché il canale della diagnosi è lo stesso del contenuto, ogni parola scritta dall'AD può
// cambiare il comportamento della macchina: è la stessa famiglia di rischio di un'istruzione
// nascosta in un testo.
//
// Due mosse, nell'ordine:
//   ① si legge PRIMA il canale dichiarato — una riga `[classe] quota` che lo script emette apposta.
//      Un segnale che la macchina produce per sé non può essere imitato per sbaglio da una frase.
//   ② se quella riga non c'è si ripiega sulla prosa, ma con un vocabolario STRETTO: sono sparite la
//      parola `quota` nuda e ogni forma che possa comparire in un discorso di business. Restano le
//      forme inequivocabili del motore e le due frasi che la macchina stessa scrive in italiano
//      («limite di quota», «quota esaurita»), che nessuna relazione di mercato produce.
/** Le classi che il canale dichiarato può nominare. Un valore fuori elenco non è una dichiarazione. */
export const CLASSI_ERRORE = new Set(["auth", "quota", "quota_settimanale", "timeout", "altro"]);

export function classificaErrore(risultato = "") {
  const t = String(risultato);

  // ① Il canale dichiarato dallo script: `[classe] quota` (l'ultima riga marcata vince).
  const dichiarata = segnaleDichiarato(t, "classe");
  const classeDichiarata = dichiarata.dichiarato ? dichiarata.valore.trim().toLowerCase() : null;
  if (classeDichiarata && CLASSI_ERRORE.has(classeDichiarata)) {
    const mD = t.match(/resets?\s+([0-9]{1,2}(?::[0-9]{2})?\s*(?:am|pm)?)/i);
    return {
      classe: classeDichiarata,
      resetHint: mD ? mD[1].trim() : null,
      resetData: classeDichiarata === "quota" || classeDichiarata === "quota_settimanale" ? dataDaTesto(t) : null,
      fonte_classe: "dichiarata", // AR-294: da una riga emessa apposta, non da una frase
    };
  }

  // ② Ripiego sulla prosa, con il vocabolario stretto.
  const quota =
    /session limit|hit your (usage|session) limit|out of usage|you'?re out of usage|rate[ _-]?limit|too many requests|\b429\b|overloaded|actionrequirederror|increase (your )?limits?|insufficient_quota|quota exceeded|exceeded your quota|limite di quota|limite quota|quota esaurita|credit balance|billing/i.test(
      t
    );
  // 🪪 AUTH (fix parity 2026-07-16): credenziali del motore scadute/mancanti — Claude («Invalid API
  // key», «Please run /login», token OAuth scaduto) o Cursor («Not logged in»). Un ritentativo NON
  // può ripararle: senza questa classe l'errore finiva in "altro" e bruciava tentativi a vuoto,
  // mentre il vero fix è umano (collega-claude.sh / collega-cursor.sh). Va valutata PRIMA della
  // quota ma il vocabolario non si sovrappone; pattern stretti per non scattare su testi normali.
  const auth =
    /invalid api key|please run \/login|not logged in|not authenticated|authentication[_ ]error|oauth token (has )?(expired|revoked)|token (expired|revoked)|401 unauthorized/i.test(
      t
    );
  const timeout = /\btimeout\b|timed out|\bkilled\b|rc=124|rc=137|sigkill|sigterm/i.test(t);
  // ⛔ Limite SETTIMANALE (non la finestra rolling di 5h): si libera fra giorni, non fra ore.
  // Va valutato PRIMA della quota generica perché è un sottoinsieme di essa e vuole tempi diversi.
  const settimanale = /weekly limit|limite settimanale|weekly (usage )?(quota|cap)|limit.{0,20}\bthis week\b|\bper week\b/i.test(t);
  // Orario di reset esplicito nel messaggio? es. "resets 9:30pm (Europe/Rome)" → "9:30pm".
  const m = t.match(/resets?\s+([0-9]{1,2}(?::[0-9]{2})?\s*(?:am|pm)?)/i);
  return {
    classe: auth ? "auth" : settimanale ? "quota_settimanale" : quota ? "quota" : timeout ? "timeout" : "altro",
    resetHint: m ? m[1].trim() : null,
    resetData: quota || settimanale ? dataDaTesto(t) : null,
    fonte_classe: "prosa", // AR-294: letta dal testo — è il ripiego, non il canale
  };
}

// 📅 Data di reset scritta per esteso — è la forma che usa il limite settimanale, dove l'ora da sola
// non basta ("resets Aug 14 at 9am", "resets on 2026-08-14", "resets in 3 days"). La regex vecchia
// leggeva solo l'orario: su un messaggio settimanale tornava null e il calcolo ripiegava sul backoff
// da minuti, cioè trattava un'attesa di giorni come un intoppo di quarti d'ora.
// Ritorna ms assoluti, oppure null se il testo non dice quando.
const MESI_EN = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
export function dataDaTesto(testo = "", nowMs = Date.now()) {
  const t = String(testo);

  // a) "resets in 3 days" / "try again in 2 days"
  const rel = t.match(/\bin\s+(\d{1,2})\s*(day|days|giorni|giorno)\b/i);
  if (rel) return nowMs + parseInt(rel[1], 10) * 24 * 60 * 60 * 1000;

  // b) ISO: "resets on 2026-08-14" (eventuale ora attaccata)
  const iso = t.match(/\b(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{1,2}):(\d{2}))?/);
  if (iso) {
    const d = new Date(nowMs);
    d.setFullYear(+iso[1], +iso[2] - 1, +iso[3]);
    d.setHours(iso[4] ? +iso[4] : 9, iso[5] ? +iso[5] : 0, 0, 0);
    if (Number.isFinite(d.getTime())) return d.getTime();
  }

  // c) Mese inglese abbreviato: "resets Aug 14 at 9am" / "resets 14 Aug"
  const mese = t.match(
    new RegExp(`\\b(${MESI_EN.join("|")})[a-z]*\\.?\\s+(\\d{1,2})\\b|\\b(\\d{1,2})\\s+(${MESI_EN.join("|")})[a-z]*\\b`, "i")
  );
  if (mese) {
    const nome = (mese[1] || mese[4] || "").toLowerCase().slice(0, 3);
    const giorno = parseInt(mese[2] || mese[3], 10);
    const idx = MESI_EN.indexOf(nome);
    if (idx >= 0 && giorno >= 1 && giorno <= 31) {
      const ora = t.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
      let h = ora ? parseInt(ora[1], 10) : 9;
      const min = ora && ora[2] ? parseInt(ora[2], 10) : 0;
      const ap = ora && ora[3] ? ora[3].toLowerCase() : null;
      if (ap === "pm" && h < 12) h += 12;
      if (ap === "am" && h === 12) h = 0;
      const d = new Date(nowMs);
      d.setMonth(idx, giorno);
      d.setHours(h, min, 0, 0);
      // Data già passata di parecchio → è dell'anno prossimo (reset a cavallo di dicembre).
      if (d.getTime() < nowMs - 30 * 24 * 60 * 60 * 1000) d.setFullYear(d.getFullYear() + 1);
      return d.getTime();
    }
  }
  return null;
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
  // Settimanale: passo fisso lungo. Un backoff crescente qui non serve a niente — non è un intoppo
  // che «magari passa», è un muro con una data. Si ricontrolla ogni 6h finché non cade.
  if (classe === "quota_settimanale") return BACKOFF_QUOTA_SETTIMANALE_MIN;
  const arr = classe === "quota" ? QUOTA : ALTRO;
  return arr[Math.min(Math.max(tentativi, 0), arr.length - 1)];
}

// Vero per ogni classe che significa «il motore non è nemmeno partito» → ritentabile in sicurezza
// anche sulle azioni reali 🔴 (zero rischio doppio-invio). Le due quote stanno insieme QUI e non
// sparse in sei `if`: aggiungerne una terza domani deve toccare una riga sola.
export function eQuota(classe) {
  return classe === "quota" || classe === "quota_settimanale";
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
  const { classe, resetHint, resetData } = classificaErrore(risultato);
  const preEsec = TIPI_PRE_ESECUZIONE.has(tipo);
  // Tipi sconosciuti li trattiamo come reali (prudenza: non ritentare qualcosa che non capiamo).
  const azioneReale = TIPI_AZIONE_REALE.has(tipo) || !preEsec;

  // 1) È ammesso ritentare in automatico?
  // 1a) Credenziali motore scadute/mancanti: NESSUN ritentativo può ripararle — stop subito con
  //     il rimedio umano, invece di bruciare tentativi (e ore) su un errore deterministico.
  if (classe === "auth") {
    return {
      azione: "stop",
      tentativi: tent,
      classe,
      motivo:
        "credenziali del motore AI scadute o mancanti — ritentare non serve: sul VPS esegui collega-claude.sh (motore Claude) o collega-cursor.sh (motore Cursor), poi «Riprova» dal Pannello",
    };
  }
  let maxTent;
  if (classe === "quota_settimanale") {
    maxTent = MAX_TENTATIVI_QUOTA_SETTIMANALE; // giorni di attesa: i tentativi vanno contati in giorni.
  } else if (classe === "quota") {
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
  // 3bis) Settimanale: la data vince sull'orario. «resets Aug 14 at 9am» è un istante preciso a
  //    giorni di distanza; il tetto delle 6h qui NON si applica (è la regola della finestra rolling,
  //    e applicarla qui era esattamente il modo di trasformare un muro di giorni in un backoff di
  //    minuti). Si aspetta la data vera; senza data, si ricontrolla ogni 6h.
  if (classe === "quota_settimanale") {
    const tetto = refMs + MAX_ATTESA_QUOTA_SETTIMANALE_MS;
    const dataValida = resetData != null && resetData > now && resetData <= tetto ? resetData + 2 * 60 * 1000 : null;
    const quandoMsW = dataValida ?? now + BACKOFF_QUOTA_SETTIMANALE_MIN * 60 * 1000;
    return {
      azione: "ritenta",
      tentativi: tent + 1,
      maxTent,
      classe,
      resetHint: resetHint || null,
      resetDataISO: resetData != null ? new Date(resetData).toISOString() : null,
      quandoISO: new Date(quandoMsW).toISOString(),
      motivo: dataValida
        ? `limite settimanale del motore AI — ritento dopo il reset dichiarato (${new Date(dataValida).toLocaleString("it-IT", { timeZone: "Europe/Rome" })})`
        : "limite settimanale del motore AI — il messaggio non dice quando si libera: ricontrollo ogni 6h",
    };
  }

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
    // 🪪 AUTH: credenziali scadute → stop SUBITO (nessun tentativo bruciato), rimedio collega-*.sh.
    { tipo: "chat", tentativi: 0, risultato: "Invalid API key · Please run /login [worker] motore claude (claude) uscito con rc=1." },
    { tipo: "giro", tentativi: 0, risultato: "Not logged in [worker] motore cursor (agent) uscito con rc=1." },
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

/**
 * AR-292 — quante volte la macchina può rimettersi in coda da sola lo stesso lavoro orfano.
 *
 * Il difetto: la sentinella vede un lavoro «in_corso da troppo», crede che il worker sia morto e lo
 * rimette in attesa — con un PATCH che scrive `{stato:"in_attesa"}` e NIENT'ALTRO. Nessun contatore.
 * Un lavoro pesante che va davvero in timeout (un giro, una radiografia) torna quindi in coda ogni
 * tre minuti, per sempre: riparte, scade, viene recuperato, riparte. Brucia token e non finisce mai,
 * e nessuno se ne accorge perché ogni singolo recupero sembra ragionevole.
 *
 * Due è sufficiente: se un lavoro non è riuscito nemmeno al terzo tentativo, il problema non è che il
 * worker è morto — è il lavoro, e va guardato da una persona.
 *
 * Il contatore vive nel DATABASE (`tentativi`), non in un marcatore dentro il testo del risultato:
 * il campo sopravvive ai riavvii, il testo si tronca a 1200 caratteri ed è già pieno d'altro. È
 * l'errore da non ripetere.
 */
export const MAX_RIACCODI_ORFANO = 2;

/**
 * Cosa fare di un lavoro rimasto orfano. Pura: nessun I/O, così un test la esegue davvero.
 *
 * @param sicuro  true se il tipo è ripetibile senza toccare il mondo reale (giro, chat, metabolizza).
 *                Un'azione reale interrotta a metà NON si riesegue mai da sola: torna a Nicola.
 * @param tentativi quante volte è già stato recuperato (dal DB).
 * @param esitoRicoverato true se l'esito di questo lavoro è su disco, in attesa di ripubblicazione
 *                (AR-397). È la differenza fra «orfano con esito ASSENTE» e «orfano con esito
 *                RICOVERATO»: nel secondo caso il lavoro è finito davvero e sappiamo com'è andato —
 *                chiuderlo in errore con «riapprova» sarebbe la causa del doppio invio, non la cura.
 */
export function decidiOrfano({ sicuro = false, tentativi = 0, max = MAX_RIACCODI_ORFANO, esitoRicoverato = false } = {}) {
  const t = Number.isFinite(+tentativi) ? +tentativi : 0;
  if (esitoRicoverato === true || esitoRicoverato === 1 || esitoRicoverato === "1") {
    return {
      azione: "attendi",
      tentativi: t,
      motivo:
        "l'esito di questo lavoro è RICOVERATO su disco (il database non lo aveva accettato): lo ripubblica il worker — non lo chiudo in errore, sarebbe l'invito a rieseguire un'azione già partita",
    };
  }
  if (!sicuro) {
    return {
      azione: "ferma",
      tentativi: t,
      motivo: "azione reale interrotta a metà — non la rieseguo da sola: riapprova per rieseguirla",
    };
  }
  if (t >= max) {
    return {
      azione: "ferma",
      tentativi: t,
      motivo: `recuperato già ${t} volte senza riuscire (tetto ${max}) — non è il worker a essere morto, è questo lavoro: guardalo tu`,
    };
  }
  return { azione: "riaccoda", tentativi: t + 1, motivo: `recupero ${t + 1} di ${max}` };
}
