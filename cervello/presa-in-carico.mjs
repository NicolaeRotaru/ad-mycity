#!/usr/bin/env node
// 🔔 PRESA-IN-CARICO — un allarme che non si può chiudere smette di essere un allarme.
//
// ─────────────────────────────────────────────────────────────────────────────
// LA MALATTIA (AR-285, e la sua gemella AR-191)
// ─────────────────────────────────────────────────────────────────────────────
// La sentinella della cassa suona da DUECENTOCINQUANTASEI giri. Ogni giro rifà la stessa diagnosi,
// accoda la stessa card, chiede la stessa cosa a Nicola — e Nicola l'ha già letta duecento volte.
// Il quinto perché della scheda: «la macchina sa rilevare un blocco ma non sa CHIUDERE
// l'escalation — non ha il concetto di richiesta pendente a un umano, quindi ripete la diagnosi al
// posto di custodire la domanda.»
//
// L'altra faccia della stessa moneta è AR-191: le cose da firmare invecchiano in coda e nessuno le
// risollecita. La macchina misura ciò che PRODUCE (card accodate) e non ciò che CONCLUDE (card
// firmate). Un allarme che urla sempre e una firma che non arriva mai sono lo stesso buco: manca
// lo stato «questa domanda è già stata fatta, e ha una scadenza».
//
// ─────────────────────────────────────────────────────────────────────────────
// LA CURA, E IL SUO PALETTO
// ─────────────────────────────────────────────────────────────────────────────
// La cura NON è un tasto «silenzia». Un allarme spento senza data è una lampadina svitata: nessuno
// se ne ricorda più, e il giorno in cui la condizione diventa grave non lo sa nessuno.
//
// La cura è: si può PRENDERE IN CARICO, **ma solo con una scadenza dichiarata**. Passata quella
// data l'allarme torna a suonare da solo, e torna più in alto di prima — l'escalation è per
// ANZIANITÀ, non per ripetizione. Una presa in carico senza data non vale: è un'esenzione scritta
// male, ed è esattamente la cosa che stiamo curando.
//
// Tutto qui dentro è PURO: nessun disco, nessuna rete, e l'istante arriva da fuori — così un test
// può far passare tre settimane in un millisecondo invece di aspettarle.
// 🟢 Sola lettura. Nessun effetto all'import.

/** Gli stati possibili di un allarme. Chi non è qui dentro non esiste. */
export const STATO_ALLARME = {
  SPENTO: "spento",
  NUOVO: "nuovo",
  CRONICO: "cronico",
  IN_CARICO: "in-carico",
  SCADUTA: "presa-in-carico-scaduta",
};

/** Da quanti giri consecutivi un allarme smette di essere una notizia e diventa un rumore. */
export const GIRI_PER_CRONICO = 5;

/**
 * La FIRMA DELLA CAUSA — AR-285, quarta clausola.
 *
 * Il dedup usava una firma che conteneva il CONTATORE DEI GIRI: «sensore-cassa cieco da 256 giri».
 * A ogni giro il numero cambia, quindi la firma cambia, quindi il dedup non aggancia MAI e la card
 * si duplica all'infinito. La firma deve descrivere la CAUSA, non quante volte l'abbiamo vista.
 *
 * @param {{sensore:string, causa:string}} p
 * @returns {string}
 */
export function firmaCausa({ sensore = "", causa = "" } = {}) {
  const pulisci = (s) =>
    String(s ?? "")
      .toLowerCase()
      // Via i numeri: sono contatori, date e importi — cioè tutto ciò che cambia mentre la causa resta.
      .replace(/\d+/g, "#")
      .replace(/\s+/g, " ")
      .trim();
  return `${pulisci(sensore)}|${pulisci(causa)}`;
}

/** Millisecondi da una data `AAAA-MM-GG` o `AAAA-MM-GG HH:MM`. NaN se non si legge. */
export function msDaData(s) {
  const t = String(s ?? "").trim();
  if (!t) return NaN;
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) return NaN;
  return Date.UTC(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 0, m[5] ? +m[5] : 0);
}

const GIORNO_MS = 86_400_000;

/**
 * IL VERDETTO su un allarme — suona o no, e perché.
 *
 * @param {object} p
 * @param {boolean} p.acceso            La condizione è ancora vera adesso?
 * @param {number}  p.giriConsecutivi   Da quanti giri di fila è accesa.
 * @param {object|null} p.presaInCarico {da, motivo, fino} — `fino` è OBBLIGATORIA.
 * @param {number}  p.adessoMs
 * @param {string}  p.firma             La firma della CAUSA (vedi firmaCausa).
 * @returns {{stato:string, suona:boolean, priorita:number, giorni_in_attesa:number|null,
 *            giorni_alla_scadenza:number|null, firma:string, motivo:string}}
 */
export function verdettoAllarme({ acceso = false, giriConsecutivi = 0, presaInCarico = null, adessoMs = Date.now(), firma = "" } = {}) {
  // ① Un allarme risolto azzera tutto. Se si riaccende è nuovo di nuovo, e va riguardato.
  if (!acceso) {
    return {
      stato: STATO_ALLARME.SPENTO,
      suona: false,
      priorita: 0,
      giorni_in_attesa: null,
      giorni_alla_scadenza: null,
      firma,
      motivo: "la condizione non è più vera: l'allarme è spento e la presa in carico decade con lui",
    };
  }

  const fino = presaInCarico ? msDaData(presaInCarico.fino) : NaN;
  const da = presaInCarico ? msDaData(presaInCarico.da) : NaN;

  // ② IL PALETTO: una presa in carico senza scadenza leggibile NON vale. Sarebbe un interruttore
  //    per far tacere un problema, cioè il modo più veloce per non accorgersene mai più.
  if (presaInCarico && !Number.isFinite(fino)) {
    return {
      stato: giriConsecutivi >= GIRI_PER_CRONICO ? STATO_ALLARME.CRONICO : STATO_ALLARME.NUOVO,
      suona: true,
      priorita: prioritaDa(giriConsecutivi, 0),
      giorni_in_attesa: null,
      giorni_alla_scadenza: null,
      firma,
      motivo: "la presa in carico non porta una scadenza leggibile: non è una presa in carico, è un interruttore — quindi l'allarme resta acceso",
    };
  }

  // ③ Presa in carico VALIDA e non scaduta: una sola card ferma, con la data della prima richiesta.
  if (presaInCarico && Number.isFinite(fino) && adessoMs <= fino) {
    const inAttesa = Number.isFinite(da) ? Math.floor((adessoMs - da) / GIORNO_MS) : null;
    return {
      stato: STATO_ALLARME.IN_CARICO,
      suona: false,
      priorita: 0,
      giorni_in_attesa: inAttesa,
      giorni_alla_scadenza: Math.ceil((fino - adessoMs) / GIORNO_MS),
      firma,
      motivo: `preso in carico${presaInCarico.motivo ? ` (${presaInCarico.motivo})` : ""} fino al ${presaInCarico.fino}: la domanda è già stata fatta, non la si rifà ogni giro`,
    };
  }

  // ④ Scaduta: torna a suonare, e torna PIÙ IN ALTO. L'escalation è per anzianità, non per
  //    ripetizione — così una domanda vecchia sale in cima invece di duplicarsi.
  if (presaInCarico && Number.isFinite(fino)) {
    const giorniOltre = Math.floor((adessoMs - fino) / GIORNO_MS);
    return {
      stato: STATO_ALLARME.SCADUTA,
      suona: true,
      priorita: prioritaDa(giriConsecutivi, giorniOltre),
      giorni_in_attesa: Number.isFinite(da) ? Math.floor((adessoMs - da) / GIORNO_MS) : null,
      giorni_alla_scadenza: -giorniOltre,
      firma,
      motivo: `la presa in carico è scaduta il ${presaInCarico.fino} (${giorniOltre} giorni fa) e la condizione è ancora vera: torna a suonare, più in alto di prima`,
    };
  }

  // ⑤ Nessuna presa in carico: suona. Cronico dopo N giri — così «acceso da un minuto» e «acceso da
  //    settimane» smettono di leggersi uguali.
  const cronico = giriConsecutivi >= GIRI_PER_CRONICO;
  return {
    stato: cronico ? STATO_ALLARME.CRONICO : STATO_ALLARME.NUOVO,
    suona: true,
    priorita: prioritaDa(giriConsecutivi, 0),
    firma,
    giorni_in_attesa: null,
    giorni_alla_scadenza: null,
    motivo: cronico
      ? `acceso da ${giriConsecutivi} giri senza che nessuno l'abbia preso in carico: o si prende in carico con una scadenza, o si ripara`
      : `acceso da ${giriConsecutivi} giri`,
  };
}

function prioritaDa(giri, giorniOltreScadenza) {
  const g = Number(giri) || 0;
  const o = Number(giorniOltreScadenza) || 0;
  return Math.min(100, Math.round(g / 5) + o * 3 + (o > 0 ? 10 : 0));
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-191 — L'INVECCHIAMENTO DELLA CODA DA FIRMARE
// ─────────────────────────────────────────────────────────────────────────────
// «Una proposta perfetta che nessuno ricorda vale zero.» L'anti-spam (una notifica sola per card)
// è diventato anti-memoria: la card squilla una volta e poi tace per sempre, anche dopo due
// settimane. Qui si decide CHI va risollecitato, quando, e con quanta urgenza.

/** Dopo quante ore una card in attesa va risollecitata, per colore. */
export const ORE_RISOLLECITO = { "🔴": 48, "🟡": 120 };
/** Oltre questa attesa la card non si risollecita più: sale di grado. */
export const ORE_ESCALATION = 168; // sette giorni

/**
 * Quali card vanno risollecitate adesso, e lo stato di salute della coda.
 *
 * @param {Array<{id:string, titolo?:string, colore:string, data?:string, ultimo_sollecito?:string}>} azioni
 * @param {number} adessoMs
 */
export function invecchiamentoCoda(azioni, adessoMs = Date.now()) {
  const righe = [];
  for (const a of azioni || []) {
    const nata = msDaData(a?.data);
    if (!Number.isFinite(nata)) {
      // Una card senza data non si può far invecchiare. Non è un verde: è un buco, e va detto.
      righe.push({ id: a?.id, titolo: a?.titolo || "", colore: a?.colore || "", ore_attesa: null, da_risollecitare: false, escalation: false, motivo: "senza data di accodamento: non posso dire da quanto aspetta" });
      continue;
    }
    const oreAttesa = Math.floor((adessoMs - nata) / 3_600_000);
    const soglia = ORE_RISOLLECITO[a?.colore] ?? ORE_RISOLLECITO["🟡"];
    const ultimo = msDaData(a?.ultimo_sollecito);
    const oreDaUltimo = Number.isFinite(ultimo) ? Math.floor((adessoMs - ultimo) / 3_600_000) : null;
    // Il risollecito si ripete: è l'anti-spam che era diventato anti-memoria. Ma non più spesso
    // della soglia del suo colore.
    const daRisollecitare = oreAttesa >= soglia && (oreDaUltimo === null || oreDaUltimo >= soglia);
    righe.push({
      id: a?.id,
      titolo: a?.titolo || "",
      colore: a?.colore || "",
      ore_attesa: oreAttesa,
      da_risollecitare: daRisollecitare,
      escalation: oreAttesa >= ORE_ESCALATION,
      motivo: daRisollecitare
        ? `ferma da ${oreAttesa} ore, soglia ${soglia} per il ${a?.colore || "colore"}`
        : `ferma da ${oreAttesa} ore, sotto la soglia di ${soglia}`,
    });
  }

  const conOre = righe.filter((r) => r.ore_attesa !== null).map((r) => r.ore_attesa).sort((x, y) => x - y);
  return {
    righe,
    da_risollecitare: righe.filter((r) => r.da_risollecitare),
    in_escalation: righe.filter((r) => r.escalation),
    senza_data: righe.filter((r) => r.ore_attesa === null).length,
    // Il numero di salute della coda che AR-191 chiede: quanto ci mette una firma ad arrivare.
    ore_attesa_mediana: conOre.length ? conOre[Math.floor(conOre.length / 2)] : null,
    ore_attesa_massima: conOre.length ? conOre[conOre.length - 1] : null,
    in_coda: righe.length,
  };
}
