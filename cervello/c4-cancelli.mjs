#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════════
// c4-cancelli.mjs — LE DECISIONI CHE PRIMA VIVEVANO DENTRO GLI SCRIPT DI SHELL.
//
// LA MALATTIA (lotto 41, corsia 4). Un freno di questa macchina nasceva quasi sempre come
// *istruzione dentro uno script*: una frase passata al motore, o una condizione incollata in una
// riga di bash. Da lì tre conseguenze, sempre le stesse:
//   (a) il verdetto finisce in una pipe o in un `|| true` e sparisce;
//   (b) il freno vale su una corsia sola (il giro) e le altre — chat, cadenze, monitoraggio — passano;
//   (c) un interruttore nato per saltare la coda spegne anche i tetti, perché due condizioni diverse
//       sono state incollate nella stessa riga.
// E siccome nessun test può eseguire una riga in mezzo a milleseicento righe di `giro.sh`, un
// commento e la sua riga possono dire il contrario per settimane senza che nessuno se ne accorga.
//
// LA CURA. La decisione esce dallo script e diventa una funzione pura qui dentro; lo script la
// CHIAMA e legge il codice di uscita. Così un test la esegue davvero, e una mutazione la fa
// diventare rossa. Stessa idea di `cervello/giro-esito.sh` (funzioni pure per l'esito del giro) e di
// `cervello/esito-cadenza.mjs` (la regola «si può spegnere il motore mentre dei cancelli sono rossi?»).
//
// Difetti coperti: AR-321 · AR-323 (in giro.sh) · AR-324 · AR-423 · AR-304 · AR-306 · AR-278/AR-428.
// Nessuna dipendenza esterna, nessuna scrittura su disco: le funzioni ricevono i dati e rispondono.
// ═══════════════════════════════════════════════════════════════════════════════

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// ═══════════════════════════════════════════════════════════════════════════════
// ① AR-423 — IL TETTO DI SPESA NON SI SPEGNE CON L'INTERRUTTORE DELLA CODA
//
// In `giro.sh` la condizione del GATE-BUDGET era:
//     [ "${DELTA_GATE_FORCE:-0}" != 1 ] && [ "${BUDGET_FORCE:-0}" != 1 ]
// e due righe sopra il commento giurava il contrario («GATE-BUDGET non bypassa GIRO_FORCE: il
// delta-gate sì (throttle), la sicurezza-quota no»). Sono DUE cose diverse incollate nella stessa
// riga: `DELTA_GATE_FORCE` è documentato come sinonimo di `GIRO_FORCE` per i giri a mano/on-demand
// (salta il *risparmio*), `BUDGET_FORCE` è l'emergenza dichiarata (salta la *sicurezza sulla spesa*).
// Chi lanciava un giro dal Pannello saltava anche il tetto sui token, in silenzio.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Il tetto di spesa va consultato in questo giro?
 * @param {Record<string,string|undefined>} env
 * @returns {{consulta:boolean, interruttore:string, motivo:string, avviso:string}}
 */
export function tettoBudget(env = {}) {
  const v = (n) => String(env[n] ?? "").trim();
  if (v("RUN_AI") !== "" && v("RUN_AI") !== "1") {
    return {
      consulta: false,
      interruttore: "",
      motivo: "il motore premium non si accende in questo giro (RUN_AI≠1): non c'è spesa da frenare",
      avviso: "",
    };
  }
  if (v("BUDGET_FORCE") === "1") {
    return {
      consulta: false,
      interruttore: "BUDGET_FORCE",
      motivo: "BUDGET_FORCE=1 — il tetto sui token è stato spento A MANO (emergenza dichiarata)",
      // Clausola (b) del fix: un freno spento a mano è una decisione VISIBILE, non un silenzio.
      avviso:
        "⚠️ TETTO DI SPESA SPENTO A MANO (BUDGET_FORCE=1): questo giro può accendere il motore premium sopra la soglia giornaliera di token. È un'emergenza dichiarata, non lo stato normale — se lo vedi due volte di fila, chiedi a Nicola perché è rimasto acceso.",
    };
  }
  // DELTA_GATE_FORCE e GIRO_FORCE saltano il THROTTLE (il delta-gate), non la sicurezza sulla spesa.
  return {
    consulta: true,
    interruttore: "",
    motivo:
      v("DELTA_GATE_FORCE") === "1" || v("GIRO_FORCE") === "1"
        ? "giro forzato/on-demand: salta il delta-gate (risparmio) ma NON il tetto sui token (sicurezza)"
        : "giro normale: il tetto sui token va consultato",
    avviso: "",
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ② AR-324 — LE SOGLIE IN VIGORE SI SCRIVONO, ALTRIMENTI IL VERDE È AMBIGUO
//
// Le soglie dei cancelli si spengono o si allentano da `cervello/vps/.env`, e il registro del giro
// non le scriveva da nessuna parte: a posteriori non si può ricostruire con quali soglie è girato.
// Un verde diventa ambiguo — può voler dire «ho verificato e va bene» oppure «mi hanno alzato la
// soglia sopra il caso peggiore» — e un controllo che non si può ricostruire non è un controllo.
// ═══════════════════════════════════════════════════════════════════════════════

/** Le manopole che cambiano il verdetto di un cancello. Nome env · default · cosa governa. */
export const SOGLIE = [
  { env: "BUDGET_FORCE", def: "0", cosa: "spegne il tetto giornaliero sui token (emergenza)", pericolosa: true },
  { env: "DELTA_GATE_FORCE", def: "0", cosa: "salta il delta-gate: il giro parte anche se non è cambiato nulla" },
  { env: "GIRO_FORCE", def: "0", cosa: "come sopra (giro a mano / on-demand dal Pannello)" },
  { env: "RUN_AI", def: "1", cosa: "0 = niente motore premium in questo giro" },
  { env: "ONESTA_BLOCCA", def: "0", cosa: "1 = le violazioni di onestà bloccano il push (di norma è solo un avviso)" },
  { env: "COSTO_SOGLIA_TOKEN_GIORNO", def: "(default di costo-ai.mjs)", cosa: "quanti token al giorno prima che il freno scatti", pericolosa: true },
  { env: "DELTA_GATE_MAX_ORE", def: "12", cosa: "dopo quante ore il giro riparte comunque, anche se nulla è cambiato" },
  { env: "NORTH_STAR_GIORNI_GATE", def: "3", cosa: "giorni senza ordini pagati prima del vincolo north-star", pericolosa: true },
  { env: "CHECKLIST_MAX_GIORNI", def: "2", cosa: "dopo quanti giorni la checklist di Nicola è stantia", pericolosa: true },
  { env: "OKR_MAX_GIORNI", def: "7", cosa: "dopo quanti giorni gli OKR sono stantii", pericolosa: true },
  { env: "CHIUSURA_LOOP_GIORNI", def: "7", cosa: "giorni di stallo prima che il gate chiusura-loop scatti", pericolosa: true },
  { env: "ALLOCAZIONE_SOGLIA_MACCHINA", def: "0.7", cosa: "quota di lavoro-macchina oltre la quale l'allocazione è sbilanciata", pericolosa: true },
  { env: "GIRO_AI_TIMEOUT", def: "800", cosa: "secondi per ogni tentativo del motore" },
  { env: "GIRO_BUDGET_SEC", def: "2700", cosa: "budget-tempo totale del giro" },
  { env: "CERVELLO_THINKING_TOKENS", def: "8000", cosa: "quanto ragiona il motore prima di rispondere", pericolosa: true },
  { env: "AI_THINKING", def: "(vuoto = default)", cosa: "override per-lavoro del ragionamento (0 = spento)", pericolosa: true },
];

/**
 * Fotografia delle soglie con cui sta girando questo giro.
 * `forzaFile` = interruttori che non vivono nell'ambiente ma sul disco (la sentinella .giro-force).
 */
export function soglieInVigore(env = {}, forzaFile = []) {
  const righe = SOGLIE.map((s) => {
    const grezzo = env[s.env];
    const impostata = grezzo !== undefined && String(grezzo).trim() !== "";
    const valore = impostata ? String(grezzo).trim() : s.def;
    return {
      env: s.env,
      valore,
      def: s.def,
      cosa: s.cosa,
      pericolosa: Boolean(s.pericolosa),
      // «si discosta» = qualcuno l'ha impostata a un valore diverso dal default di fabbrica.
      discosta: impostata && valore !== s.def,
    };
  });
  const discostate = righe.filter((r) => r.discosta);
  const pericolose = discostate.filter((r) => r.pericolosa);
  const forzature = [...forzaFile];
  const riga =
    `SOGLIE IN VIGORE — ` +
    righe.map((r) => `${r.env}=${r.valore}${r.discosta ? "*" : ""}`).join(" · ") +
    (forzature.length ? ` · forzature su disco: ${forzature.join(", ")}` : "");
  return { righe, discostate, pericolose, forzature, riga };
}

/** Il testo che finisce nel briefing quando almeno una soglia non è quella di fabbrica. */
export function soglieDaDichiarare(fotografia) {
  const fuori = [...fotografia.discostate];
  if (!fuori.length && !fotografia.forzature.length) return "";
  const voci = fuori.map(
    (r) => `· ${r.env} = ${r.valore} (di fabbrica ${r.def}) — ${r.cosa}${r.pericolosa ? " ⚠️ allenta un cancello" : ""}`,
  );
  for (const f of fotografia.forzature) voci.push(`· forzatura su disco: ${f}`);
  return (
    "⚠️ SOGLIE NON DI FABBRICA IN QUESTO GIRO (AR-324): i cancelli qui sotto sono tarati diversamente " +
    "da come nascono. Un verde con la soglia alzata NON è lo stesso verde. Dichiara in coda, come " +
    "scelta 🟡 con motivo e scadenza, ogni valore che deve restare — così una soglia allentata scade " +
    "invece di restare per sempre.\n" +
    voci.join("\n")
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ③ AR-321 — UN VINCOLO SI RIMISURA DOPO, ALTRIMENTI È UN CARTELLO
//
// Il giro alza fino a una quarantina di vincoli, li scrive nel prompt e non li guarda più. Uno solo
// veniva rimisurato dopo il motore (AR-104, coerenza-fatti) e infatti è l'unico che blocca davvero
// la pubblicazione. Per tutti gli altri il motore poteva ignorarli e il giro chiudeva lo stesso: un
// vincolo che il motore non rispetta era indistinguibile, per Nicola e per il log, da un vincolo
// rispettato.
//
// Qui sta la tabella «chi rimisura cosa». Un vincolo senza comando di rimisura NON diventa verde per
// silenzio: viene dichiarato «non rimisurabile», che è un'altra cosa.
// classe "pubblicazione" = tocca ciò che il Pannello mostra a Nicola → se resta rosso NON si pubblica.
// classe "rimedio"      = il giro non è pulito (esce 3) e la card di rimedio va in coda.
// ═══════════════════════════════════════════════════════════════════════════════

export const RIVERIFICA = {
  // — quelli che toccano ciò che il Pannello mostra: restano rossi ⇒ non si pubblica —
  FATTI: { comando: ["coerenza-fatti.mjs"], classe: "pubblicazione" },
  CHECKLIST: { comando: ["freschezza-checklist.mjs", "--check"], classe: "pubblicazione" },
  OKR: { comando: ["freschezza-okr.mjs", "--check"], classe: "pubblicazione" },
  REGISTRO_SCELTE: { comando: ["registro-scelte-check.mjs"], classe: "pubblicazione" },
  PROVE: { comando: ["prove-oneste.mjs"], classe: "pubblicazione" },
  // — quelli che rendono il giro non pulito e generano una card di rimedio —
  ALLOC: { comando: ["allocazione-check.mjs"], classe: "rimedio" },
  ESP: { comando: ["esperimenti-check.mjs"], classe: "rimedio" },
  LOOP: { comando: ["chiusura-loop.mjs", "--gate"], classe: "rimedio" },
  TEST: { comando: ["test-cervello.mjs"], classe: "rimedio" },
  AGENTI: { comando: ["agent-registry-check.mjs"], classe: "rimedio" },
  KEYWORD: { comando: ["keyword-owner-check.mjs"], classe: "rimedio" },
  DEFERRAL: { comando: ["deferral-agenti.mjs"], classe: "rimedio" },
  STAMPO: { comando: ["stampo-check.mjs"], classe: "rimedio" },
  FIRMA: { comando: ["firma-check.mjs"], classe: "rimedio" },
  PORTE: { comando: ["porte-check.mjs"], classe: "rimedio" },
  PORTA_GIT: { comando: ["percorsi-git.mjs", "--check"], classe: "rimedio" },
  ROTTE_SCRIVENTI: { comando: ["rotte-scriventi-check.mjs"], classe: "rimedio" },
  USCITE: { comando: ["uscite-check.mjs"], classe: "rimedio" },
  SCADENZE: { comando: ["scadenzario-check.mjs"], classe: "rimedio" },
  PAUSE: { comando: ["pausa-check.mjs"], classe: "rimedio" },
  SENSORI_SPENTI: { comando: ["sensori-spenti-check.mjs"], classe: "rimedio" },
  FRATELLI: { comando: ["spazzata-fratelli.mjs"], classe: "rimedio" },
  GUARDIANI: { comando: ["guardiani-check.mjs"], classe: "rimedio" },
  MAPPA: { comando: ["mappa-macchina.mjs"], classe: "rimedio" },
  GATE: { comando: ["gate-veri.mjs"], classe: "rimedio" },
  FRESCHEZZA: { comando: ["freschezza-intelligence.mjs", "--check"], classe: "rimedio" },
  CADENZE: { comando: ["freschezza-cadenze.mjs"], classe: "rimedio" },
  VOLANO: { comando: ["sonda-volano.mjs"], classe: "rimedio" },
  TASSO: { comando: ["tasso-lezioni.mjs"], classe: "rimedio" },
  CHIUSURA: { comando: ["tasso-chiusura.mjs", "--gate"], classe: "rimedio" },
  CORREZIONE_NICOLA: { comando: ["correzione-nicola-gate.mjs", "--json"], classe: "rimedio" },
  APPRENDIMENTO: { comando: ["apprendimento-guardiano.mjs", "--gate"], classe: "rimedio" },
  VERIFICA: { comando: ["verifica-avversariale.mjs", "--gate"], classe: "rimedio" },
  DEBITO: { comando: ["calibrazione.mjs", "debito"], classe: "rimedio" },
  CAL: { comando: ["calibrazione.mjs", "valida"], classe: "rimedio" },
  // — quelli che NON si rimisurano, e il perché è scritto: il silenzio non vale come verde —
  SENSORI: { comando: null, perche: "misura il mondo fuori (REST del marketplace): rimisurarlo qui direbbe se la rete è tornata, non se il motore ha obbedito" },
  COSTO: { comando: null, perche: "il freno costi è cieco per un campo mancante: rieseguirlo subito dopo darebbe lo stesso cieco" },
  CI: { comando: null, perche: "dipende da GitHub: i controlli di una PR non tornano verdi nei secondi dopo il motore" },
  NORTH_STAR: { comando: null, perche: "conta i giorni dal 1° ordine pagato: nessun giro può cambiarlo entro il proprio turno" },
  SOGLIE: { comando: null, perche: "una soglia allentata resta allentata anche dopo il motore: si dichiara in coda come scelta con scadenza, non si ripara dentro il giro" },
};

/** Divide i vincoli attivi fra «rimisurabili adesso» e «no, e il perché». */
export function daRiverificare(nomi = []) {
  const rimisurabili = [];
  const nonRimisurabili = [];
  for (const nome of nomi) {
    const v = RIVERIFICA[nome];
    if (!v) {
      // Un vincolo nuovo che nessuno ha messo in tabella: si dichiara, non si dà per verde.
      nonRimisurabili.push({ nome, perche: "non è in tabella: nessuno ha dichiarato come si rimisura (aggiungilo a RIVERIFICA in cervello/c4-cancelli.mjs)" });
      continue;
    }
    if (!v.comando) nonRimisurabili.push({ nome, perche: v.perche || "dichiarato non rimisurabile" });
    else rimisurabili.push({ nome, comando: v.comando, classe: v.classe });
  }
  return { rimisurabili, nonRimisurabili };
}

/**
 * IL VERDETTO. `rimasti` = i vincoli che, rimisurati DOPO il motore, sono ancora rossi.
 * @returns {{bloccaPubblicazione:boolean, gateRossi:number, rc:0|2|3, righe:string[], motivo:string}}
 */
export function esitoRiverifica({ rimasti = [], nonRimisurabili = [], risolti = [] } = {}) {
  const pubbl = rimasti.filter((r) => (RIVERIFICA[r]?.classe ?? "rimedio") === "pubblicazione");
  const righe = [];
  if (risolti.length) righe.push(`✅ risolti dal motore in questo giro: ${risolti.join(" ")}`);
  if (rimasti.length) righe.push(`⛔ ancora attivi DOPO il motore: ${rimasti.join(" ")}`);
  if (nonRimisurabili.length) {
    righe.push(`⚪ non rimisurabili qui (non è un verde): ${nonRimisurabili.map((n) => n.nome ?? n).join(" ")}`);
  }
  if (pubbl.length) {
    return {
      bloccaPubblicazione: true,
      gateRossi: rimasti.length,
      rc: 2,
      righe,
      motivo: `${pubbl.join(", ")}: il motore ha ricevuto il vincolo e non l'ha soddisfatto, e riguarda ciò che il Pannello mostra a Nicola. Meglio memoria vecchia che memoria che mente: non si pubblica.`,
    };
  }
  if (rimasti.length) {
    return {
      bloccaPubblicazione: false,
      gateRossi: rimasti.length,
      rc: 3,
      righe,
      motivo: `${rimasti.join(", ")}: vincoli consegnati al motore e ancora attivi dopo. La memoria si pubblica, ma questo giro NON è pulito e va in coda una card di rimedio.`,
    };
  }
  return {
    bloccaPubblicazione: false,
    gateRossi: 0,
    rc: 0,
    righe,
    motivo: nonRimisurabili.length
      ? "nessun vincolo rimisurabile è rimasto rosso (restano fuori misura quelli dichiarati sopra)"
      : "tutti i vincoli alzati prima del motore sono stati risolti",
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ④ AR-304 — IGIENE PER-LAVORO: il giro non eredita le impostazioni del lavoro precedente
//
// `worker.sh` è un ciclo unico con stato globale: ogni `export` fatto dentro il ciclo sopravvive al
// lavoro che l'ha creato. Il reset di `AI_THINKING` era stato messo dentro il ramo «costruisci il
// prompt», credendo che passasse per tutti i lavori; ma giro e ritmo si escludono da quel ramo
// (skip_sync=1) e lanciano il loro script PRIMA. Risultato: una metabolizzazione (che spegne il
// ragionamento perché è lavoro di volume) lasciava AI_THINKING=0 nell'ambiente, e il giro subito
// dopo girava SENZA ragionare — a seconda di che lavoro c'era prima in coda.
// ═══════════════════════════════════════════════════════════════════════════════

export const VARIABILI_PER_LAVORO = [
  // Quanto ragiona il motore. Se resta a 0 da un lavoro di volume, il giro dopo risponde d'istinto.
  "AI_THINKING",
  // AR-838 — Di chi e' la spesa. Il worker la mette dal lavoro che ha preso; se sopravvivesse al
  // lavoro, la spesa del prossimo verrebbe addebitata al negozio di quello di prima — e un tetto
  // che ferma la corsia sbagliata e' peggio di un tetto che non c'e'.
  "AI_NEGOZIO",
  // Le mani armate. Se resta a 0 dalla chat, il lavoro dopo parte senza gli strumenti che gli servono.
  "AI_ALLOW_ACTIONS",
  // L'istruzione aggiuntiva del giro: appartiene al lavoro che l'ha chiesta, non al successivo.
  "GIRO_EXTRA_INSTRUCTION",
];

/** Quali variabili per-lavoro sono ancora sporche all'inizio di un lavoro nuovo. */
export function variabiliSporche(env = {}) {
  return VARIABILI_PER_LAVORO.filter((n) => env[n] !== undefined && String(env[n]) !== "");
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑤ AR-306 — LA PARITÀ DEL WORKER WINDOWS DIVENTA UN NUMERO
//
// `worker.ps1` è un SECONDO consumatore della coda di produzione, scritto una volta e mai più
// aggiornato: nessun claim atomico, nessuna pausa fail-closed, il tipo giro incollato invece di
// invocare giro.sh. Se gira anche una sola volta mentre il worker del VPS è vivo, un'azione
// approvata può partire due volte — e può partire mentre l'AD è in pausa.
// La cura non è ricopiare i fix (resterebbe indietro di nuovo alla prossima difesa): è che la parità
// diventi misurabile, e che il file dichiari di essere in pensione invece di sembrare equivalente.
// ═══════════════════════════════════════════════════════════════════════════════

export const DIFESE_WORKER = [
  {
    nome: "claim atomico",
    cosa: "prende il lavoro SOLO se è ancora in_attesa (la marcatura filtra su id E stato insieme), altrimenti due consumatori eseguono lo stesso lavoro",
    // Il filtro deve stare sulla PATCH che prende il lavoro, non sulla lettura della coda: il .ps1
    // legge con `stato=eq.in_attesa` ma poi marca in_corso su `id=eq.…` e basta — ed è lì il buco.
    sh: /id=eq\.[^"'\s]*&stato=eq\.in_attesa/,
    ps1: /id=eq\.[^"'\s]*&stato=eq\.in_attesa/,
  },
  {
    nome: "pausa fail-closed",
    cosa: "se non riesce a leggere il kill-switch NON parte (il .ps1 ingoia l'errore con un catch vuoto e prosegue)",
    sh: /pausa_verdetto|pausa_consenti_partenza|PAUSA_FAIL_CLOSED/,
    ps1: /pausa_verdetto|PAUSA_FAIL_CLOSED/,
  },
  {
    nome: "giro dallo script, non dal prompt",
    cosa: "il tipo «giro» invoca giro.sh (con guardiani, cancelli e push) invece di incollare giro.md nel prompt",
    sh: /giro\.sh/,
    ps1: /giro\.sh/,
  },
  {
    nome: "identità del worker",
    cosa: "marca worker_owner sul lavoro preso, così il recupero orfani non tocca i lavori vivi dell'altro worker",
    sh: /worker_owner/,
    ps1: /worker_owner/,
  },
  {
    // AR-804. La difesa vive in `worker-coda.sh`, che worker.sh sorgente: qui si cerca la CHIAMATA,
    // perche' e' quella a dire che il worker la usa davvero — ed e' esattamente la cosa che mancava
    // quando il turno era scritto, provato e chiamato da nessuno.
    nome: "turno fra i negozi",
    cosa: "prende i lavori di fondo a turno fra i negozi invece che in ordine d'arrivo: con quaranta botteghe la piu' lenta non ferma le altre",
    sh: /coda_prossima_riga/,
    ps1: /coda_prossima_riga/,
  },
  {
    nome: "recupero orfani",
    cosa: "rimette in coda gli in_corso rimasti appesi invece di lasciarli morti",
    sh: /stato=eq\.in_corso/,
    ps1: /stato=eq\.in_corso/,
  },
];

/**
 * Il .ps1 si rifiuta DAVVERO di partire senza uno sblocco esplicito?
 * Cerca la guardia vera — `if (-not $env:MYCITY_WORKER_PS1) { … exit }` — non il nome della
 * variabile: quello compare anche nel commento, e un commento non ferma niente. Se qualcuno
 * togliesse la guardia lasciando la spiegazione, il controllo deve diventare rosso lo stesso.
 */
export const PENSIONE_PS1 = /if\s*\(\s*-not\s+\$env:MYCITY_WORKER_PS1\s*\)/;

/**
 * @returns {{mancanti:{nome,cosa}[], inPensione:boolean, rc:0|1, motivo:string}}
 * rc=1 quando il .ps1 può partire (nessuna dichiarazione di pensionamento) pur essendo indietro.
 */
export function paritaWorker({ sh = "", ps1 = "" } = {}) {
  const mancanti = DIFESE_WORKER.filter((d) => d.sh.test(sh) && !d.ps1.test(ps1)).map(({ nome, cosa }) => ({ nome, cosa }));
  const inPensione = PENSIONE_PS1.test(ps1);
  if (mancanti.length && !inPensione) {
    return {
      mancanti,
      inPensione,
      rc: 1,
      motivo:
        `worker.ps1 può partire e gli mancano ${mancanti.length} difese che worker.sh ha: ` +
        mancanti.map((m) => m.nome).join(", ") +
        ". Un secondo consumatore della coda senza queste difese è un doppio-invio in attesa.",
    };
  }
  if (mancanti.length) {
    return {
      mancanti,
      inPensione,
      rc: 0,
      motivo:
        `worker.ps1 è dichiarato in pensione (si rifiuta di partire senza MYCITY_WORKER_PS1=1) e resta ` +
        `indietro di ${mancanti.length} difese: ${mancanti.map((m) => m.nome).join(", ")}. ` +
        `Chi lo riaccende sa esattamente cosa gli manca — prima non lo sapeva nessuno.`,
    };
  }
  return { mancanti, inPensione, rc: 0, motivo: "worker.ps1 ha tutte le difese elencate di worker.sh" };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑥ AR-278 + AR-428 — UN SEGRETO VIVE SOLO NELL'AMBIENTE DEL PROCESSO
//
// La regola sui segreti in questo repo era scritta in NEGATIVO, per casi già visti («non committare
// .env», «non stampare token»), e la riga di comando non era nell'elenco. Su Linux gli argomenti di
// un processo sono leggibili da chiunque giri sulla macchina (`ps`, /proc/PID/cmdline): la chiave di
// servizio con cui si scrive la memoria e si spegne la pausa, e il token di GitHub, viaggiavano lì.
//
// Qui la regola è scritta in POSITIVO — un segreto sta nell'ambiente del processo, mai in un
// argomento, mai dentro un URL — e un guardiano la misura, così copre da sé i casi futuri.
// ═══════════════════════════════════════════════════════════════════════════════

const NOME_SEGRETO = "[A-Z0-9_]*(TOKEN|KEY|SECRET|PASSWORD|PASSWD|PWD)[A-Z0-9_]*";

export const REGOLE_SEGRETI = [
  {
    id: "url-con-credenziali",
    // https://x-access-token:${GIT_PUSH_TOKEN}@github.com/...
    re: new RegExp(`https?://[^\\s"'\`]*\\$\\{?${NOME_SEGRETO}\\}?[^\\s"'\`]*@`),
    dice: "un segreto dentro un indirizzo: l'indirizzo è un argomento, e gli argomenti li legge chiunque",
  },
  {
    id: "intestazione-con-segreto",
    // -H "apikey: $SUPABASE_SERVICE_KEY"   /   --header "Authorization: Bearer $TOK"
    re: new RegExp(`(^|\\s)(-H|--header)\\s+["'][^"']*\\$\\{?${NOME_SEGRETO}\\}?`),
    dice: "un'intestazione con dentro un segreto passata come argomento a curl: usa --config (file 0600) o l'ambiente",
  },
  {
    id: "opzione-con-segreto",
    // --api-key "$CURSOR_API_KEY"  /  --password=$X  /  -u "utente:$TOK"
    re: new RegExp(`(--api-key|--password|--token|--secret|-u)[=\\s]+["']?[^"'\\s]*\\$\\{?${NOME_SEGRETO}\\}?`),
    dice: "un segreto passato come valore di un'opzione: se la CLI non ha altro canale, va dichiarato come debito col perché",
  },
];

/**
 * DEBITO DICHIARATO. Punti che oggi restano fuori dalla bonifica, con il motivo scritto.
 * Una riga qui è una decisione visibile; il guardiano fallisce su tutto il resto — così il
 * dodicesimo punto non può nascere in silenzio.
 */
export const DEBITO_SEGRETI = {
  "cervello/ritmo.sh": "fuori dal territorio della corsia 4 (lotto 41): due indirizzi git col token. Stessa cura di giro.sh, da fare nella corsia che possiede il file.",
  "cervello/monitora.sh": "fuori dal territorio della corsia 4 (lotto 41): due indirizzi git col token.",
  "cervello/kill-switch.sh": "fuori dal territorio della corsia 4 (lotto 41): le due intestazioni del kill-switch.",
  "cervello/lib-cadenza.sh": "fuori dal territorio della corsia 4 (lotto 41).",
  "cervello/motore-ai.sh": "la CLI Cursor ('agent') su VPS headless non si autentica con la sola variabile d'ambiente: --api-key è l'unico canale documentato. Debito dichiarato, non dimenticanza — si chiude quando la CLI espone un altro modo.",
  "cervello/vps/setup.sh": "script di installazione a mano, girato da Nicola una volta: fuori dal percorso automatico.",
  "cervello/vps/watch-main.sh": "fuori dal territorio della corsia 4 (lotto 41).",
  "cervello/vps/diagnostica-completa.sh": "strumento di diagnosi lanciato a mano, fuori dal percorso automatico.",
  "cervello/vps/aggiorna-cervello.sh": "script di aggiornamento a mano, fuori dal percorso automatico.",
  "cervello/vps/recupera-lavori-orfani.sh": "script di recupero lanciato a mano, fuori dal percorso automatico.",
};

/**
 * Nomi che FINISCONO per «TOKEN» ma non sono segreti: sono CONTEGGI di token consumati, che il
 * registro dei costi si passa fra script. Senza questa lista il guardiano griderebbe al lupo su
 * `costo-ai.mjs --token="$GIRO_TOKEN"` — e un guardiano che grida a vuoto è un guardiano che poi
 * nessuno legge.
 */
export const NON_SEGRETI = new Set([
  "GIRO_TOKEN",
  "RITMO_TOKEN",
  "MONITORA_TOKEN",
  "GIRO_TOKEN_STIMA",
  "MAX_THINKING_TOKENS",
  "CERVELLO_THINKING_TOKENS",
  "COSTO_SOGLIA_TOKEN_GIORNO",
]);

const RIF_VARIABILE = new RegExp(`\\$\\{?(${NOME_SEGRETO})\\}?`, "g");

/** I nomi di variabile-segreto davvero citati in una riga (esclusi i conteggi). */
export function segretiCitati(riga = "") {
  const nomi = new Set();
  for (const m of riga.matchAll(RIF_VARIABILE)) {
    const nome = m[1];
    if (!NON_SEGRETI.has(nome)) nomi.add(nome);
  }
  return [...nomi];
}

/** Trova i segreti passati come argomenti dentro un testo. Ritorna una riga per violazione. */
export function segretiNegliArgomenti(testo = "", file = "?") {
  const fuori = [];
  const righe = testo.split("\n");
  for (let i = 0; i < righe.length; i++) {
    const riga = righe[i];
    if (/^\s*#/.test(riga)) continue; // un commento non esegue niente
    const nomi = segretiCitati(riga);
    if (!nomi.length) continue;
    for (const r of REGOLE_SEGRETI) {
      if (r.re.test(riga)) {
        fuori.push({ file, riga: i + 1, regola: r.id, dice: r.dice, segreti: nomi, testo: riga.trim().slice(0, 160) });
      }
    }
  }
  return fuori;
}

/** Scandaglia gli script del cervello. `debito` = mappa file → perché (default: quella dichiarata sopra). */
export function scandagliaSegreti(radice, debito = DEBITO_SEGRETI) {
  const trovati = [];
  const esenti = [];
  const visita = (dir, rel) => {
    let voci = [];
    try {
      voci = readdirSync(dir);
    } catch {
      return;
    }
    for (const v of voci) {
      if (v === "node_modules" || v === ".git") continue;
      const p = join(dir, v);
      const r = rel ? `${rel}/${v}` : v;
      let st;
      try {
        st = statSync(p);
      } catch {
        continue;
      }
      if (st.isDirectory()) visita(p, r);
      else if (/\.(sh|ps1|bash)$/.test(v)) {
        const violazioni = segretiNegliArgomenti(readFileSync(p, "utf8"), r);
        if (!violazioni.length) continue;
        if (debito[r]) esenti.push({ file: r, quante: violazioni.length, perche: debito[r] });
        else trovati.push(...violazioni);
      }
    }
  };
  visita(join(radice, "cervello"), "cervello");
  return { trovati, esenti };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI — gli script di shell chiamano questi sottocomandi e leggono il codice di uscita.
// ═══════════════════════════════════════════════════════════════════════════════

function argFlag(argv, nome) {
  const p = argv.find((a) => a.startsWith(`--${nome}=`));
  return p === undefined ? "" : p.slice(nome.length + 3);
}

function main(argv) {
  const cmd = argv[0] || "";
  switch (cmd) {
    case "tetto-budget": {
      // exit 0 = consulta il freno · exit 10 = saltato (e il perché è stampato)
      // 0 = consulta il freno · 10 = tetto spento A MANO (BUDGET_FORCE) · 11 = niente motore da frenare
      const v = tettoBudget(process.env);
      process.stdout.write(`${v.consulta ? "consulta" : "salta"}\t${v.motivo}\n`);
      if (v.avviso) process.stdout.write(`${v.avviso}\n`);
      process.exit(v.consulta ? 0 : v.interruttore === "BUDGET_FORCE" ? 10 : 11);
      break;
    }
    case "soglie": {
      const forza = argv.slice(1).filter((a) => !a.startsWith("--"));
      const foto = soglieInVigore(process.env, forza);
      if (argv.includes("--json")) process.stdout.write(`${JSON.stringify(foto, null, 2)}\n`);
      else {
        process.stdout.write(`${foto.riga}\n`);
        const d = soglieDaDichiarare(foto);
        if (d) process.stdout.write(`${d}\n`);
      }
      // exit 0 sempre: è una fotografia, non un cancello. Il vincolo lo alza chi legge --vincolo.
      process.exit(argv.includes("--vincolo") && (foto.pericolose.length || foto.forzature.length) ? 7 : 0);
      break;
    }
    case "riverifica-elenco": {
      // Stampa una riga per vincolo: NOME<TAB>classe<TAB>comando…  |  NOME<TAB>non-rimisurabile<TAB>perché
      const { rimisurabili, nonRimisurabili } = daRiverificare(argv.slice(1).filter(Boolean));
      for (const r of rimisurabili) process.stdout.write(`${r.nome}\t${r.classe}\t${r.comando.join(" ")}\n`);
      for (const n of nonRimisurabili) process.stdout.write(`${n.nome}\tnon-rimisurabile\t${n.perche}\n`);
      process.exit(0);
      break;
    }
    case "riverifica-esito": {
      const lista = (s) => s.split(/[\s,]+/).filter(Boolean);
      const e = esitoRiverifica({
        rimasti: lista(argFlag(argv, "rimasti")),
        risolti: lista(argFlag(argv, "risolti")),
        nonRimisurabili: lista(argFlag(argv, "non-rimisurabili")).map((n) => ({ nome: n })),
      });
      for (const r of e.righe) process.stdout.write(`${r}\n`);
      process.stdout.write(`${e.motivo}\n`);
      // 0 = pulito · 2 = non pubblicare · 3 = pubblica ma il giro non è pulito
      process.exit(e.rc);
      break;
    }
    case "igiene-lavoro": {
      process.stdout.write(`${VARIABILI_PER_LAVORO.join(" ")}\n`);
      process.exit(0);
      break;
    }
    case "parita-worker": {
      const radice = argFlag(argv, "radice") || process.cwd();
      const leggi = (f) => (existsSync(join(radice, f)) ? readFileSync(join(radice, f), "utf8") : "");
      const p = paritaWorker({ sh: leggi("cervello/worker.sh"), ps1: leggi("cervello/worker.ps1") });
      process.stdout.write(`${p.rc === 0 ? "✅" : "⛔"} PARITÀ WORKER — ${p.motivo}\n`);
      for (const m of p.mancanti) process.stdout.write(`   · manca al .ps1: ${m.nome} — ${m.cosa}\n`);
      process.exit(p.rc);
      break;
    }
    case "segreti-argomenti": {
      const radice = argFlag(argv, "radice") || process.cwd();
      const { trovati, esenti } = scandagliaSegreti(radice);
      for (const e of esenti) process.stdout.write(`⚪ debito dichiarato · ${e.file} (${e.quante}) — ${e.perche}\n`);
      if (!trovati.length) {
        process.stdout.write(`✅ nessun segreto negli argomenti fuori dal debito dichiarato\n`);
        process.exit(0);
      }
      process.stdout.write(`⛔ ${trovati.length} segreti passati come ARGOMENTI (li legge chiunque con \`ps\`):\n`);
      for (const t of trovati) process.stdout.write(`   · ${t.file}:${t.riga} — ${t.dice}\n     ${t.testo}\n`);
      process.exit(1);
      break;
    }
    default:
      process.stdout.write(
        [
          "c4-cancelli.mjs — le decisioni dei cancelli, fuori dagli script di shell.",
          "",
          "  tetto-budget                 esci 0 = consulta il freno costi, 10 = saltato con BUDGET_FORCE (AR-423)",
          "  soglie [--json] [--vincolo]  fotografia delle soglie con cui gira questo giro (AR-324)",
          "  riverifica-elenco NOMI…      chi rimisura quale vincolo dopo il motore (AR-321)",
          "  riverifica-esito --rimasti=… --risolti=… --non-rimisurabili=…   0 pulito · 2 non pubblicare · 3 non pulito",
          "  igiene-lavoro                le variabili che ogni lavoro deve azzerare (AR-304)",
          "  parita-worker [--radice=…]   cosa manca al worker Windows rispetto a quello vivo (AR-306)",
          "  segreti-argomenti [--radice=…]  segreti passati come argomenti di comando (AR-278/AR-428)",
        ].join("\n") + "\n",
      );
      process.exit(0);
  }
}

if (process.argv[1] && process.argv[1].endsWith("c4-cancelli.mjs")) main(process.argv.slice(2));
