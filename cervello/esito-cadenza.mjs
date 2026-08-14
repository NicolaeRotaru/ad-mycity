#!/usr/bin/env node
// esito-cadenza.mjs — LA TESTA CONDIVISA DELLE TRE CADENZE (giro · ritmo · monitora).
//
// ─────────────────────────────────────────────────────────────────────────────
// LA MALATTIA CHE QUESTO FILE CURA
// ─────────────────────────────────────────────────────────────────────────────
// Cinque difetti diversi, scritti da radiografie diverse in settimane diverse, arrivano tutti alla
// stessa causa di sistema — e la dicono quasi con le stesse parole:
//
//   AR-162 ⑤ «giro.sh e ritmo.sh sono due copie divergenti dello stesso motore di cadenza: non
//             esiste un unico "esegui-cadenza-con-budget" che entrambe chiamino, quindi ogni
//             lezione imparata va ri-applicata a mano su due file e prima o poi uno resta indietro.»
//   AR-201 ⑤ «le politiche condivise (ritentativo, timeout, misura, modello) vivono duplicate
//             per-script invece che in motore-ai.sh — ogni lezione raggiunge un posto solo.»
//   AR-305 ③ «i tre script condividono motore-ai.sh per COSTRUIRE il comando ma non per ESEGUIRLO:
//             ognuno ha il suo giro di retry, il suo timeout, il suo trattamento dell'errore.»
//   AR-163 ③ «non esiste una lista delle "cadenze AI" su cui verificare che una protezione sia
//             stata applicata a tutte: si patcha il file che ha dato il sintomo.»
//   AR-313 ⑤ «"non pubblicato" non è modellato come esito osservabile — ogni copione decide da sé
//             se e come dirlo, e chi non lo dice risulta sano.»
//
// La prova che la macchina aveva già visto la malattia senza curarla sta scritta in
// `cervello/gate-pubblicazione.sh`: una tabella dei cinque pubblicatori, con la riga «il cancello
// esiste in UN pubblicatore su cinque». Quella volta è stato unificato UN asse (il cancello di
// pubblicazione). Gli altri — timeout, ritentativi, lucchetto, esito — sono rimasti tre copie.
//
// Perciò la cura non è aggiungere il pezzo mancante a `monitora.sh`: è togliere a ogni script il
// diritto di decidere da solo. Qui stanno le DECISIONI; gli script si limitano a chiederle.
//
// 🟢 Modulo PURO: nessun file, nessuna rete, nessun git, nessuna variabile d'ambiente letta dalle
// funzioni. È l'unico modo perché un test le esegua davvero invece di cercare un pattern nel codice.
//
// AR-647 — la sesta copia della stessa malattia, trovata dopo: le due funzioni che misurano il
// tempo (`giaFattaDiRecente`, `cadenzeStantie`) leggevano il timbro con
// `Date.parse(quando.replace(" ","T"))`. Una data senza fuso, per lo standard, è ora LOCALE DEL
// PROCESSO: sul portatile di casa (Europe/Rome) tornava l'istante giusto, sul VPS (UTC) tornava
// un'ora avanti d'inverno e due d'estate — e sempre nella direzione che fa sembrare la cadenza più
// FRESCA di quanto sia. Il fuso ora lo dà `msDaTimbro`, in un file suo: il timbro si scrive e si
// rilegge con lo stesso orologio.

import { msDaTimbro } from "./ora-piacenza.mjs";

// ─────────────────────────────────────────────────────────────────────────────
// LE TRE CADENZE — l'elenco che AR-163 dice che non esiste
// ─────────────────────────────────────────────────────────────────────────────
// Ogni protezione nuova va applicata a TUTTE le voci qui sotto. Averlo scritto in un posto solo è
// metà della cura: l'altra metà è che le funzioni di questo file non chiedono «quale script sei».
//
// `oreMax`  = oltre quante ore di silenzio la cadenza è «non si è più alzata» (AR-164).
// `gapMin`  = sotto quante ore un nuovo lancio è un RILANCIO A VUOTO e va rifiutato (AR-145).
//             Il giro ha gapMin 0 apposta: gira ogni due ore, è il suo mestiere. Le cadenze umane
//             no — il Piano del mattino è uno al giorno, e sette in cento minuti erano il difetto.
export const CADENZE = Object.freeze({
  giro: { script: "cervello/giro.sh", budgetEnv: "WORKER_TIMEOUT_GIRO", oreMax: 26, gapMin: 0 },
  "ritmo-mattino": { script: "cervello/ritmo.sh mattino", budgetEnv: "RITMO_BUDGET_SEC", oreMax: 30, gapMin: 10 },
  "ritmo-mezzogiorno": { script: "cervello/ritmo.sh mezzogiorno", budgetEnv: "RITMO_BUDGET_SEC", oreMax: 30, gapMin: 10 },
  "ritmo-sera": { script: "cervello/ritmo.sh sera", budgetEnv: "RITMO_BUDGET_SEC", oreMax: 30, gapMin: 10 },
  "ritmo-settimana": { script: "cervello/ritmo.sh settimana", budgetEnv: "RITMO_BUDGET_SEC", oreMax: 192, gapMin: 120 },
  monitora: { script: "cervello/monitora.sh", budgetEnv: "MONITORA_BUDGET_SEC", oreMax: 30, gapMin: 10 },
});

// ─────────────────────────────────────────────────────────────────────────────
// ①bis L'HO GIÀ FATTA POCO FA? — AR-145
// ─────────────────────────────────────────────────────────────────────────────
// «Piano del mattino/Report della sera si autorilanciano a raffica (7x in ~100 min).» Il lucchetto
// d'esecuzione NON basta e va detto chiaramente: impedisce a due cadenze di girare INSIEME, non a
// una di rigirare mezz'ora dopo che la prima è finita. Sette rilanci in cento minuti possono essere
// perfettamente in fila — e in fila lo erano.
//
// Serve la seconda domanda, quella che la scheda chiede davvero: «esiste già un blocco di oggi?».
// Adesso c'è di che rispondere, perché ogni cadenza lascia la sua riga con l'ora.
//
// Solo un esito RIUSCITO conta: se il Piano del mattino è fallito alle 6:00, alle 7:00 deve poter
// riprovare. Rifiutare un rilancio dopo un fallimento sarebbe trasformare la cura in un blocco.
export function giaFattaDiRecente({ stato = {}, tipo = "", adessoMs = 0, cadenze = CADENZE } = {}) {
  const def = cadenze[tipo];
  const gap = Number(def?.gapMin) || 0;
  if (gap <= 0) return { gia: false, motivo: "questa cadenza non ha una distanza minima" };
  const voce = stato?.cadenze?.[tipo];
  if (!voce?.quando) return { gia: false, motivo: "mai registrata" };
  if (Number(voce.codice) !== 0) return { gia: false, motivo: `l'ultima è finita male (${voce.esito}) — si può riprovare` };
  // AR-647: il timbro è ora di Piacenza, non ora del server. Su un VPS in UTC il vecchio
  // `Date.parse` lo faceva sembrare più recente, e la distanza minima fra due lanci si accorciava.
  const t = msDaTimbro(voce.quando);
  if (!Number.isFinite(t)) return { gia: false, motivo: "data illeggibile" };
  const ore = (Number(adessoMs) - t) / 3_600_000;
  if (ore >= 0 && ore < gap) {
    return { gia: true, ore: Math.round(ore * 10) / 10, gap, motivo: `già completata ${Math.round(ore * 10) / 10}h fa (minimo ${gap}h)` };
  }
  return { gia: false, ore: Math.round(ore * 10) / 10, motivo: "abbastanza tempo è passato" };
}

// ─────────────────────────────────────────────────────────────────────────────
// ① IL TIMEOUT PER TENTATIVO — AR-162
// ─────────────────────────────────────────────────────────────────────────────
// Il difetto: `RITMO_AI_TIMEOUT` vale 2700s ed è il timeout di UN tentativo, mentre 2700s è anche
// tutto il budget che l'invocatore concede al processo. Quindi il primo tentativo da solo consuma
// l'intero budget e chi sta fuori uccide il processo prima che il secondo parta: il ciclo
// `for _attempt in 1 2 3` è una decorazione. Peggio — chi uccide da fuori porta via anche il
// recupero della cadenza, perché `accoda_recupero_cadenza` sta DOPO il ciclo.
//
// La cura non è abbassare 2700 a occhio (è così che è nato il difetto): è DERIVARE il timeout dal
// budget, in modo che l'aritmetica non possa più essere sbagliata a mano.
//
// L'invariante, l'unica cosa che conta: tentativi×timeout + pause ≤ budget.
export const TENTATIVI_DEFAULT = 3;
export const PAUSA_DEFAULT_SEC = 30;
export const TIMEOUT_CAP_SEC = 800; // cap prudente dichiarato in AR-058/AR-162
export const TIMEOUT_MIN_SEC = 60; // sotto questa soglia un tentativo non fa in tempo a nulla

export function timeoutPerTentativo({
  budgetSec = 2700,
  tentativi = TENTATIVI_DEFAULT,
  pausaSec = PAUSA_DEFAULT_SEC,
  cap = TIMEOUT_CAP_SEC,
} = {}) {
  const b = Number(budgetSec) > 0 ? Math.floor(Number(budgetSec)) : 2700;
  const n = Math.max(1, Math.floor(Number(tentativi) || TENTATIVI_DEFAULT));
  const p = Math.max(0, Math.floor(Number(pausaSec) ?? PAUSA_DEFAULT_SEC));
  const pause = (n - 1) * p;
  // Il budget va speso tutto dai tentativi MENO le pause fra l'uno e l'altro.
  const grezzo = Math.floor((b - pause) / n);
  const conCap = Math.min(grezzo, Math.max(1, Math.floor(Number(cap) || TIMEOUT_CAP_SEC)));
  // Budget minuscolo: meglio un tentativo solo che tre tentativi che non fanno in tempo a partire.
  if (conCap < TIMEOUT_MIN_SEC) return Math.max(1, Math.min(b, TIMEOUT_MIN_SEC, grezzo > 0 ? grezzo : b));
  return conCap;
}

/** Verifica esplicita dell'invariante — la usa il test, e chiunque dubiti del numero. */
export function budgetRispettato({ budgetSec, tentativi = TENTATIVI_DEFAULT, pausaSec = PAUSA_DEFAULT_SEC } = {}) {
  const t = timeoutPerTentativo({ budgetSec, tentativi, pausaSec });
  const n = Math.max(1, Math.floor(Number(tentativi) || TENTATIVI_DEFAULT));
  const p = Math.max(0, Math.floor(Number(pausaSec) ?? PAUSA_DEFAULT_SEC));
  return t * n + (n - 1) * p <= Math.floor(Number(budgetSec));
}

// ─────────────────────────────────────────────────────────────────────────────
// ② L'ESITO — AR-163 · AR-313 · AR-166 · AR-302
// ─────────────────────────────────────────────────────────────────────────────
// Il difetto, in tre forme della stessa cosa:
//   · monitora.sh stampa «Monitoraggio completato.» qualunque cosa sia successa e non ha nessun
//     `exit`, quindi esce sempre 0: il motore fallito e il monitoraggio riuscito sono la stessa
//     riga per systemd (AR-163);
//   · lo stesso script chiude il blocco di pubblicazione con `) 9>"$LOCK" || true`: se la memoria
//     non è arrivata su GitHub, nessuno lo sa (AR-313);
//   · il giro registra i passi saltati solo su stderr — «il registro tecnico del server» — e chiude
//     dicendo che è andato tutto bene (AR-166);
//   · i vincoli raccolti sono variabili di un processo che sta per uscire: se il motore viene
//     saltato, quindici allarmi appena accesi non li legge nessuno (AR-302).
//
// Il contratto è UNO SOLO, ed è già quello che `cervello/giro-esito.sh` applica al giro:
//   0 = pulito · 1 = motore fallito e niente memoria nuova · 2 = memoria non pubblicata
//   3 = concluso ma con vincoli ancora attivi (non è un successo)
//
// Qui il contratto smette di essere «quello del giro» e diventa quello delle cadenze. Il test
// `esito-cadenza.test.mjs` verifica la PARITÀ con `esito_giro_rc` su tutta la tabella di verità:
// se un giorno le due teste divergono, diventa rosso. È la difesa contro il ritorno della malattia
// — non «ho copiato bene», ma «non possono più rispondere in modo diverso».
export function esitoCadenza({
  aiRc = 0,
  hadChanges = false,
  pushOk = true,
  passiOk = true,
  vincoliAttivi = 0,
  vincoliNonConsegnati = false,
  memoriaIncoerente = false,
  motoreEseguito = true,
} = {}) {
  const ai = Number(aiRc) || 0;
  const gate = Math.max(0, Number(vincoliAttivi) || 0);
  const cambi = hadChanges === true || hadChanges === 1 || hadChanges === "1";
  const push = !(pushOk === false || pushOk === 0 || pushOk === "0");
  const passi = !(passiOk === false || passiOk === 0 || passiOk === "0");
  const incoerente = memoriaIncoerente === true || memoriaIncoerente === 1 || memoriaIncoerente === "1";
  const nonConsegnati = vincoliNonConsegnati === true || vincoliNonConsegnati === 1 || vincoliNonConsegnati === "1";
  const motore = !(motoreEseguito === false || motoreEseguito === 0 || motoreEseguito === "0");

  // ⭕ Il giro a vuoto (11/8) e l'ordine dell'etichetta: la regola vera sta in `esito_giro_rc` e
  // `esito_giro_etichetta` di cervello/giro-esito.sh, e questa è la sua gemella. Le due DEVONO dare
  // la stessa risposta su tutta la tabella di verità — è quello che prova esito-cadenza.test.mjs.
  // Ordine dell'etichetta, dal fatto più grave: motore rotto → memoria non uscita → giro a vuoto →
  // controlli rossi → passi saltati → pulito.
  const etichetta = ai !== 0
    ? "motore-fallito"
    : !push
      ? "non-pubblicato"
      : motore && !cambi
        ? "giro-a-vuoto"
        : gate > 0
          ? "vincoli-attivi"
          : !passi
            ? "passi-saltati"
            : "pulito";

  let codice;
  // AR-104: la memoria bloccata dal cancello ha la precedenza — non è un successo silenzioso
  // nemmeno quando non siamo arrivati al commit.
  if (incoerente) codice = 2;
  else if (cambi && !push) codice = 2;
  else if (ai !== 0) {
    // Motore instabile ma memoria comunque pubblicata: non si perde niente, però se i cancelli
    // sono rossi vale la regola di sotto — non è un giro pulito.
    if (cambi && push) codice = gate > 0 ? 3 : 0;
    else codice = 1;
  } else if (motore && !cambi) codice = 4;
  else if (gate > 0) codice = 3;
  else if (nonConsegnati) codice = 3;
  else codice = 0;

  return { codice, esito: etichetta, pulito: codice === 0 && etichetta === "pulito" };
}

// ─────────────────────────────────────────────────────────────────────────────
// ②bis IL MOTORE SI PUÒ SALTARE? — AR-302
// ─────────────────────────────────────────────────────────────────────────────
// «Quando il giro decide di risparmiare, i quindici allarmi appena raccolti non li legge nessuno.»
// I vincoli sono variabili di un processo che sta per uscire, e il delta-gate — nato per un problema
// di COSTO — non sa niente della salute interna: taglia il motore guardando solo il mondo esterno.
//
// La regola è di due righe e non ha mai avuto un test, perché viveva dentro `giro.sh` in mezzo a
// milleduecento righe che nessuno può eseguire senza far girare un giro intero. Qui si può
// interrogare con casi finti — ed è l'unica differenza fra una regola e una speranza.
export function motoreSaltabile({ vincoliAttivi = 0, motivoSalto = "delta" } = {}) {
  const gate = Math.max(0, Number(vincoliAttivi) || 0);
  // Un vincolo attivo È per definizione «qualcosa è cambiato»: il delta-gate non può dichiarare che
  // non c'è niente da fare mentre dei cancelli sono rossi. Riaccendere il motore è il lavoro che
  // vale la pena pagare.
  if (gate > 0 && motivoSalto !== "budget") {
    return { saltabile: false, vincoliNonConsegnati: false, motivo: `${gate} vincoli attivi: il motore non si salta` };
  }
  // Il tetto-token è l'unica ragione che vince sui vincoli — sotto budget si taglia il VOLUME, non
  // la sicurezza. Ma allora i vincoli restano NON CONSEGNATI, e va detto: non evaporano in silenzio.
  if (gate > 0) {
    return { saltabile: true, vincoliNonConsegnati: true, motivo: `saltato per budget con ${gate} vincoli non consegnati` };
  }
  return { saltabile: true, vincoliNonConsegnati: false, motivo: "nessun vincolo attivo" };
}

// ─────────────────────────────────────────────────────────────────────────────
// ③ LA CADENZA CHE SMETTE DI USCIRE — AR-164
// ─────────────────────────────────────────────────────────────────────────────
// «Si controlla che la sveglia sia carica, mai che qualcuno si sia alzato»: i guardiani guardano i
// timer systemd (lo STRUMENTO) e nessuno guarda il prodotto (il RISULTATO). Un timer attivo che
// lancia uno script che esce subito è verde da entrambe le parti e non produce niente.
//
// Ora ogni cadenza lascia il proprio esito con l'ora. Questa funzione lo legge e dice chi non si è
// più alzato. È pura: prende lo stato e l'istante, non il disco e non l'orologio.
export function cadenzeStantie({ stato = {}, adessoMs = 0, cadenze = CADENZE } = {}) {
  const ora = Number(adessoMs) || 0;
  const stantie = [];
  for (const [tipo, def] of Object.entries(cadenze)) {
    const voce = (stato && stato.cadenze && stato.cadenze[tipo]) || null;
    const oreMax = Number(def.oreMax) || 30;
    if (!voce || !voce.quando) {
      stantie.push({ tipo, oreMax, ore: null, motivo: "mai registrata" });
      continue;
    }
    // AR-647: stessa cura di sopra. Qui l'errore andava sempre nel verso peggiore — una cadenza
    // ferma da 31 ore su un VPS in UTC d'estate ne dichiarava 29, sotto la soglia di 30: il
    // guardiano nato per accorgersi di chi non si alza più taceva proprio sul primo caso vero.
    const t = msDaTimbro(voce.quando);
    if (!Number.isFinite(t)) {
      stantie.push({ tipo, oreMax, ore: null, motivo: `data illeggibile (${voce.quando})` });
      continue;
    }
    const ore = (ora - t) / 3_600_000;
    if (ore > oreMax) {
      stantie.push({ tipo, oreMax, ore: Math.round(ore * 10) / 10, motivo: `ultima uscita ${Math.round(ore)}h fa` });
    }
  }
  return stantie;
}

// ─────────────────────────────────────────────────────────────────────────────
// ④ RITENTARE O NO — AR-201
// ─────────────────────────────────────────────────────────────────────────────
// Il difetto: `ritmo.sh` ritenta tre volte con `sleep 30` fisso senza chiedere niente a nessuno,
// mentre `retry-policy.mjs` esiste dal giorno di AR-092 ed è la fonte unica di «si ritenta?». Il
// ciclo del ritmo è la copia PRE-lezione di quello del giro: la lezione è arrivata a un posto solo.
//
// Qui non si riscrive la policy (sarebbe la terza copia): si decide solo se ha senso INTERROGARLA.
// Un timeout è già gestito dal timeout; un errore vuoto non è classificabile; un rc 0 non si ritenta.
export function vaChiestaLaPolicy({ aiRc = 0, tentativo = 1, tentativiMax = TENTATIVI_DEFAULT } = {}) {
  const rc = Number(aiRc) || 0;
  if (rc === 0) return false; // riuscito: non si ritenta
  if (Number(tentativo) >= Number(tentativiMax)) return false; // era l'ultimo: niente da decidere
  return true;
}

/** Traduce la risposta della retry-policy in «ritento adesso?» — default prudente: NO. */
export function ritentaSecondoPolicy(decisioneJson) {
  let d = decisioneJson;
  if (typeof d === "string") {
    try {
      d = JSON.parse(d);
    } catch {
      return { ritenta: false, motivo: "risposta della retry-policy illeggibile" };
    }
  }
  if (!d || typeof d !== "object") return { ritenta: false, motivo: "nessuna risposta dalla retry-policy" };
  if (d.azione !== "ritenta") return { ritenta: false, motivo: d.motivo || `azione=${d.azione ?? "?"}` };
  return { ritenta: true, motivo: d.motivo || "policy: ritenta", classe: d.classe, quandoISO: d.quandoISO };
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI — è così che i tre script bash chiedono, invece di decidere
// ─────────────────────────────────────────────────────────────────────────────
//   node cervello/esito-cadenza.mjs timeout --budget=2700 [--tentativi=3] [--pausa=30]
//   node cervello/esito-cadenza.mjs esito --ai-rc=1 --cambi=1 --push-ok=0 [--vincoli=2] [--passi-ok=0]
//   node cervello/esito-cadenza.mjs ritenta --ai-rc=1 --tentativo=1 --policy='{"azione":"ritenta"}'
// L'unico I/O del file, e sta nella CLI — le funzioni sopra restano pure.
import { readFileSync } from "node:fs";

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const arg = (nome, def = "") => {
    const t = process.argv.find((a) => a.startsWith(`--${nome}=`));
    return t ? t.slice(nome.length + 3) : def;
  };
  const cmd = process.argv[2] || "";
  if (cmd === "timeout") {
    process.stdout.write(
      String(
        timeoutPerTentativo({
          budgetSec: Number(arg("budget", "2700")),
          tentativi: Number(arg("tentativi", String(TENTATIVI_DEFAULT))),
          pausaSec: Number(arg("pausa", String(PAUSA_DEFAULT_SEC))),
        }),
      ) + "\n",
    );
  } else if (cmd === "esito") {
    const r = esitoCadenza({
      aiRc: Number(arg("ai-rc", "0")),
      hadChanges: arg("cambi", "0") === "1",
      pushOk: arg("push-ok", "1") === "1",
      passiOk: arg("passi-ok", "1") === "1",
      vincoliAttivi: Number(arg("vincoli", "0")),
      vincoliNonConsegnati: arg("non-consegnati", "0") === "1",
      memoriaIncoerente: arg("memoria-incoerente", "0") === "1",
    });
    // stdout = solo i dati che il chiamante cattura (una riga JSON), mai chiacchiere.
    process.stdout.write(JSON.stringify(r) + "\n");
  } else if (cmd === "gia-fatta") {
    // Esce 10 se la cadenza è già stata fatta di recente (codice scelto per non confondersi con
    // 0/1/2, che significano già altro in tutta la macchina).
    const statoPath = arg("stato", "MyCity-Vault/90-Memoria-AI/auto-coscienza/esito-cadenze.json");
    let stato = {};
    try {
      stato = JSON.parse(readFileSync(statoPath, "utf8"));
    } catch {
      /* niente file = niente storia = si può fare */
    }
    const r = giaFattaDiRecente({ stato, tipo: arg("tipo", ""), adessoMs: Date.now() });
    process.stdout.write(JSON.stringify(r) + "\n");
    process.exit(r.gia ? 10 : 0);
  } else if (cmd === "saltabile") {
    const r = motoreSaltabile({
      vincoliAttivi: Number(arg("vincoli", "0")),
      motivoSalto: arg("motivo", "delta"),
    });
    process.stdout.write(JSON.stringify(r) + "\n");
  } else if (cmd === "ritenta") {
    const chiedi = vaChiestaLaPolicy({
      aiRc: Number(arg("ai-rc", "0")),
      tentativo: Number(arg("tentativo", "1")),
      tentativiMax: Number(arg("tentativi", String(TENTATIVI_DEFAULT))),
    });
    const r = chiedi ? ritentaSecondoPolicy(arg("policy", "")) : { ritenta: false, motivo: "nessuna domanda da fare" };
    process.stdout.write(JSON.stringify({ chiedi, ...r }) + "\n");
  } else {
    process.stderr.write("Uso: esito-cadenza.mjs {timeout|esito|ritenta} [--opzioni]\n");
    process.exit(64);
  }
}
