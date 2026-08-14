// 🚦 IL CANCELLO DELL'ATTO — tre domande prima di toccare il mondo, e una dopo.
//
// LA MALATTIA (lotto 41, corsia 1). Sette difetti del Pannello, una forma sola: si esegue una
// scrittura o un controllo, non si guarda com'è andata, e si procede come se fosse andata bene.
// `await` non è una conferma: è solo la fine dell'attesa. Un errore ingoiato diventa una misura
// rassicurante — uno zero, un verde, un `ok:true`.
//   · AR-383 — il tetto di spesa AI legge le impostazioni con `.catch(() => ({valori:{}}))`: se la
//              memoria è giù, «speso» diventa 0 e la guardia conclude che c'è tutto il budget.
//              Un cieco che torna una misura.
//   · AR-384 — Nicola annulla un lavoro, la revoca della firma fallisce in silenzio, l'azione resta
//              firmata e può ancora partire dal worker.
//   · AR-385 — l'autopilota esegue la mano PRIMA di segnarselo, e gli esiti dei salvataggi non si
//              leggono: se la scrittura fallisce, al battito dopo rifà tutto.
//   · AR-412 — due dita sullo stesso «Approva» mandano due volte la cosa vera: il posto non è preso
//              da nessuno prima dell'atto.
//   · AR-413 — con la memoria giù il Pannello manda comunque l'azione e poi dice «riprova»:
//              riprovare la manda una seconda volta.
//
// LA REGOLA, in tre righe. Prima di un atto verso il mondo reale:
//   (a) IL CLAIM È MIO      — il posto l'ho preso io, con una scrittura che fallisce se c'era già.
//   (b) LE LETTURE SONO VIVE — un errore di lettura NON è uno zero: se non ho potuto leggere, non agisco.
//   (c) L'ESITO È CONFERMATO — ogni scrittura dichiara com'è andata, e chi ha già toccato il mondo
//                              lo dice a Nicola con parole diverse («non riprovare»).
//
// Perché sta qui e non dentro le route: dentro una `route.ts` insieme a `next/server` la regola non
// è eseguibile da una prova — si può solo rileggere, ed è esattamente così che questi sette difetti
// sono sopravvissuti a due radiografie. Qui la prova chiama la funzione VERA.
//
// 🟢 Modulo puro: nessun import di next/server, nessun fetch, nessun accesso al disco. Gli effetti
// (prenotare, agire, registrare) si passano come funzioni — così una prova li può contare.
// Prove: cervello/test/c1-atto-una-volta-sola.test.mjs · cervello/test/c1-lettura-cieca-non-e-zero.test.mjs

import { esitoScritture, type Salvataggio } from "./esito-scrittura";

export type { Salvataggio };

// ─────────────────────────────────────────────────────────────────────────────
// ① Le letture: un errore non è uno zero (AR-383, AR-413)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Una lettura da cui dipende una decisione.
 *
 * `vivo: false` NON vuol dire «vale zero»: vuol dire «non lo so». È la distinzione che mancava a
 * `getBudget()`, che pure aveva sotto mano il flag `tabella` di `getImpostazioni()` e lo buttava via
 * destrutturando solo `valori`.
 */
export type Lettura = { nome: string; vivo: boolean };

/** I nomi delle letture cieche. Vuoto = mi posso fidare di quello che ho letto. */
export function lettureCieche(letture: Lettura[] | undefined): string[] {
  return (letture || []).filter((l) => !l.vivo).map((l) => l.nome);
}

// ─────────────────────────────────────────────────────────────────────────────
// ② Il posto: preso, già di un altro, o non lo so (AR-412, AR-385)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * L'esito di una prenotazione.
 *   · "mia"        — il posto l'ho preso io: sono l'unico che può procedere.
 *   · "gia-presa"  — c'era già: qualcun altro sta facendo (o ha fatto) questo atto.
 *   · "incerta"    — non so se l'ho preso: la memoria non ha risposto, o ha risposto male.
 *
 * «incerta» è un terzo stato apposta. Trattarlo come «gia-presa» sarebbe comodo ma bugiardo nei
 * messaggi; trattarlo come «mia» è il difetto. In entrambi i casi l'atto NON parte: fail-closed.
 */
export type Prenotazione = "mia" | "gia-presa" | "incerta";

/**
 * La risposta di una scrittura CONDIZIONATA (un insert che fallisce se la riga c'è già), tradotta
 * in prenotazione.
 *
 * 2xx = la riga l'ho creata io, il posto è mio · 409 = conflitto sulla chiave unica, c'era già ·
 * qualunque altra cosa (500, rete caduta, nessuna risposta) = non lo so, e non lo so è un no.
 */
export function prenotazioneDaRisposta(res: { ok?: boolean; status?: number } | null | undefined): Prenotazione {
  if (!res) return "incerta";
  if (res.status === 409) return "gia-presa";
  if (typeof res.status === "number" && res.status >= 200 && res.status < 300) return "mia";
  if (res.status === undefined && res.ok === true) return "mia";
  return "incerta";
}

/**
 * Una prenotazione lasciata lì da un processo morto a metà è scaduta?
 *
 * Serve la rete di sicurezza: senza, un timeout di Vercel a metà atto bloccherebbe QUELL'AZIONE PER
 * SEMPRE — e un lucchetto che non si apre più è peggio del doppione che doveva evitare (stessa
 * lezione di `AttiInVolo` in atto-unico.ts). Un valore illeggibile NON è scaduto: nel dubbio il
 * posto resta di chi ce l'ha.
 */
export function prenotazioneScaduta(valore: string | null | undefined, ttlMs: number, ora: number = Date.now()): boolean {
  const t = Date.parse(String(valore || "").trim().split("|").pop() || "");
  if (!Number.isFinite(t)) return false;
  return ora - t >= ttlMs;
}

// ─────────────────────────────────────────────────────────────────────────────
// ③ Il cancello: la decisione, pura (AR-412, AR-413, AR-383)
// ─────────────────────────────────────────────────────────────────────────────

export type MotivoStop = "cieco" | "gia-in-corso" | "prenotazione-incerta";

export type VerdettoAtto =
  | { procedi: true }
  | { procedi: false; motivo: MotivoStop; status: number; messaggio: string };

/**
 * Si può procedere con l'atto?
 *
 * L'ordine conta: prima le letture (se sono cieche non ha senso nemmeno prenotare), poi il posto.
 * Il valore di ritorno porta già lo status HTTP giusto, così nessuna route lo reinventa: 503 quando
 * il problema è nostro e passerà, 409 quando l'atto è di qualcun altro.
 */
export function cancelloAtto(p: { letture?: Lettura[]; prenotazione: Prenotazione }): VerdettoAtto {
  const cieche = lettureCieche(p.letture);
  if (cieche.length > 0) {
    return {
      procedi: false,
      motivo: "cieco",
      status: 503,
      messaggio: `Non procedo: non riesco a leggere ${cieche.join(", ")}. Un errore di lettura non è uno zero — mi fermo prima di toccare il mondo reale. Riprova quando la memoria risponde.`,
    };
  }
  if (p.prenotazione === "gia-presa") {
    return {
      procedi: false,
      motivo: "gia-in-corso",
      status: 409,
      messaggio: "Questa azione è già stata presa in carico: non la mando una seconda volta.",
    };
  }
  if (p.prenotazione === "incerta") {
    return {
      procedi: false,
      motivo: "prenotazione-incerta",
      status: 503,
      messaggio:
        "Non sono riuscito a prendere il posto per questa azione e non so se l'ha preso qualcun altro: mi fermo. Riprova fra un minuto.",
    };
  }
  return { procedi: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// ④ La chiusura: dire com'è andata, con le parole giuste (AR-413c, AR-384)
// ─────────────────────────────────────────────────────────────────────────────

export type Chiusura = { ok: boolean; fallite: string[]; status: number; messaggio: string };

/**
 * L'esito delle scritture che chiudono un atto.
 *
 * La differenza che vale: se il mondo è GIÀ stato toccato, «riprova» è il consiglio peggiore
 * possibile — riprovare manda l'azione una seconda volta (è letteralmente AR-413). Il messaggio
 * cambia di conseguenza, e lo decide questa funzione, non chi scrive la route di turno.
 */
export function chiusuraAtto(p: { scritture: Salvataggio[]; attoEseguito: boolean }): Chiusura {
  const e = esitoScritture(p.scritture);
  if (e.ok) return { ok: true, fallite: [], status: 200, messaggio: "" };
  return {
    ok: false,
    fallite: e.fallite,
    status: 503,
    messaggio: p.attoEseguito
      ? `⚠️ L'azione è PARTITA davvero, ma non sono riuscito a registrarla (${e.fallite.join(", ")}). NON riprovare: riprovando la mandi una seconda volta. Controlla il canale e segna a mano com'è andata.`
      : e.errore,
  };
}

/**
 * Prima la scrittura di sicurezza, poi le altre — e se la prima non conferma, le altre non partono.
 *
 * È la cura di AR-384 messa dove vale per chiunque: quando Nicola annulla, togliere la firma è la
 * scrittura che PROTEGGE, e rimettere l'azione «da approvare» è quella che si vede. Se si esegue la
 * seconda senza aver confermato la prima, la card torna disponibile mentre la firma è ancora viva —
 * cioè il Pannello dice a Nicola che ha annullato, e il worker può ancora inviare.
 *
 * `poi` è una funzione e non un array apposta: così, quando la sicurezza fallisce, le scritture
 * successive non vengono nemmeno tentate — e una prova può contarlo.
 */
export async function scrivereInOrdine(p: {
  sicurezza: { nome: string; esegui: () => Promise<boolean> };
  poi: () => Promise<Salvataggio[]>;
  attoEseguito?: boolean;
}): Promise<Chiusura & { bloccataSullaSicurezza: boolean }> {
  const okSicurezza = await p.sicurezza.esegui();
  if (!okSicurezza) {
    const c = chiusuraAtto({ scritture: [{ nome: p.sicurezza.nome, ok: false }], attoEseguito: !!p.attoEseguito });
    return { ...c, bloccataSullaSicurezza: true };
  }
  const c = chiusuraAtto({ scritture: await p.poi(), attoEseguito: !!p.attoEseguito });
  return { ...c, bloccataSullaSicurezza: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// ⑤ L'atto intero, nell'ordine giusto (AR-412, AR-385, AR-413)
// ─────────────────────────────────────────────────────────────────────────────

export type EsitoAtto<T> =
  | { eseguito: true; risultato: T; registrato: boolean; status: number; messaggio: string }
  | { eseguito: false; motivo: MotivoStop; status: number; messaggio: string };

/**
 * Esegue un atto verso il mondo reale UNA VOLTA SOLA, nell'ordine che non si può invertire:
 *
 *   letture vive?  →  prendo il posto  →  ATTO  →  registro  →  dico com'è andata
 *
 * L'ordine sta QUI DENTRO e non nella route: il difetto di AR-385 non era il cancello mancante, era
 * la sequenza (atto prima, segnaposto dopo). Una guardia che si basa su un fatto che può non essere
 * mai stato scritto non guarda niente. Scritto come funzione, l'ordine non si può sbagliare nel
 * punto d'uso — e se qualcuno lo aggira, si vede nel diff.
 *
 * `prenota` deve essere una scrittura CONDIZIONATA (un insert che fallisce se la riga c'è già): un
 * upsert incondizionato come `setImpostazione` non sa dire «questo posto è già preso», e con due
 * processi diversi — su Vercel il cron, il pulsante e il componente sono tre processi — nessun
 * lucchetto in memoria può vederli tutti.
 */
export async function attoUnaVoltaSola<T>(p: {
  letture?: Lettura[];
  prenota: () => Promise<Prenotazione>;
  atto: () => Promise<T>;
  registra: (risultato: T) => Promise<Salvataggio[]>;
}): Promise<EsitoAtto<T>> {
  // (b) le letture PRIMA: se sono cieche non ha senso nemmeno prendere il posto.
  const cieche = lettureCieche(p.letture);
  if (cieche.length > 0) {
    const v = cancelloAtto({ letture: p.letture, prenotazione: "mia" });
    if (!v.procedi) return { eseguito: false, motivo: v.motivo, status: v.status, messaggio: v.messaggio };
  }

  // (a) il posto, PRIMA dell'atto.
  const posto = await p.prenota();
  const verdetto = cancelloAtto({ prenotazione: posto });
  if (!verdetto.procedi) {
    return { eseguito: false, motivo: verdetto.motivo, status: verdetto.status, messaggio: verdetto.messaggio };
  }

  // Da qui in poi il mondo è toccato: qualunque cosa vada storta, «riprova» non è più un consiglio.
  const risultato = await p.atto();

  // (c) l'esito di ogni scrittura, confermato.
  const chiusura = chiusuraAtto({ scritture: await p.registra(risultato), attoEseguito: true });
  return {
    eseguito: true,
    risultato,
    registrato: chiusura.ok,
    status: chiusura.status,
    messaggio: chiusura.messaggio,
  };
}
