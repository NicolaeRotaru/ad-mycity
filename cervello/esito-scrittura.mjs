#!/usr/bin/env node
// esito-scrittura.mjs — LA TESTA CHE DICE «CHI HA SCRITTO DAVVERO» (worker · cadenze · pubblicazione).
//
// ─────────────────────────────────────────────────────────────────────────────
// LA MALATTIA CHE QUESTO FILE CURA
// ─────────────────────────────────────────────────────────────────────────────
// `cervello/malattie.json` la chiama «esito-di-scrittura-buttato»: una scrittura parte (una PATCH,
// un push, una riga in coda), il VALORE che torna non lo guarda nessuno, e il passo dopo dichiara
// successo. `await` — o, qui nel bash, il semplice fatto che il comando sia finito — sembra una
// conferma. Non lo è: è solo la fine dell'attesa.
//
// Nel Pannello la radice è già installata (`pannello/src/lib/esito-scrittura.ts`). Dalla parte del
// server la stessa malattia vive in quattro punti, tutti misurati sul codice vero:
//
//   AR-389  ritmo.sh stampa «Ritmo mattino completato.» FUORI dal ramo che se lo è guadagnato: la
//           riga esce anche col motore mai acceso (delta-gate) e dopo tre tentativi falliti.
//   AR-397  worker.sh scrive l'esito del lavoro con UNA sola PATCH: se quella va storta, l'azione
//           eseguita torna «da riapprovare» e il doppio invio lo causa la regola che doveva evitarlo.
//   AR-399  worker.sh chiama sync_vault, cattura l'rc e reagisce SOLO a rc=1: con rc=2 (rimandata) e
//           rc=3 (token assente) il lavoro si chiude «fatto» sapendo che la memoria non è mai uscita.
//   AR-396  gate-pubblicazione.sh ingoia l'esito del rebase (`|| git rebase --abort || true`) e
//           arriva al push con l'albero a metà: pubblica un avanzamento parziale come fosse sano.
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ LE DECISIONI STANNO QUI E NON NEGLI SCRIPT
// ─────────────────────────────────────────────────────────────────────────────
// Perché una decisione dentro un `.sh` di mille righe non si può eseguire in una prova: si può solo
// GUARDARE. E una prova che guarda misura la forma, non l'effetto — è esattamente il motivo per cui
// questi quattro difetti sono sopravvissuti a più radiografie. Qui le regole sono funzioni pure:
// nessun file, nessuna rete, nessun git, nessuna variabile d'ambiente. Un test le interroga con casi
// finti e vede la risposta vera.
//
// 🟢 Modulo PURO. L'unico I/O è la CLI in fondo, che è il modo in cui i copioni bash chiedono.
// L'unico import è l'orologio di casa (`ora-piacenza.mjs`), puro a sua volta: l'ora di Piacenza si
// chiede al fuso in un posto solo, non si ricostruisce qui.

import { msDaTimbro } from "./ora-piacenza.mjs";

// ─────────────────────────────────────────────────────────────────────────────
// ① AR-389 — L'ANNUNCIO CHE NON È STATO GUADAGNATO
// ─────────────────────────────────────────────────────────────────────────────
// «Il piano del mattino dice sempre di essere andato bene, anche quando il motore non è mai partito.»
// La causa di sistema, ⑤ della scheda: giro, ritmo e monitoraggio sono copie della stessa procedura e
// ogni cura viene applicata alla copia in cui il sintomo è stato visto (giro.sh curato da AR-300, la
// copia accanto no). Finché la frase la decide un `echo` dentro lo script, la terza copia rinasce.
//
// Regola: la frase di successo esce SOLO dal ramo che se l'è guadagnata — motore acceso E finito
// bene E nessun vincolo attivo. In tutti gli altri casi si dice cosa è successo davvero, e si dice
// su stderr, che è il canale di chi non ha niente da festeggiare.
export function annuncioCadenza({
  titolo = "Cadenza",
  aiRc = 0,
  motoreAcceso = true,
  tentativi = 1,
  riaccodata = false,
  vincoliAttivi = 0,
  misurato = true,
} = {}) {
  const rc = Number(aiRc) || 0;
  const gate = Math.max(0, Number(vincoliAttivi) || 0);
  const n = Math.max(1, Number(tentativi) || 1);
  const acceso = !(motoreAcceso === false || motoreAcceso === 0 || motoreAcceso === "0");
  const riacc = riaccodata === true || riaccodata === 1 || riaccodata === "1";

  // Non ho potuto nemmeno misurare com'è andata: non è un verde. È la stessa regola di
  // `cadenza_esito` quando il modulo non risponde (⚪ non è mai ✅).
  if (misurato === false || misurato === 0 || misurato === "0") {
    return { completato: false, motivo: "non-misurato", frase: `${titolo}: esito NON misurato — non lo chiamo un successo.` };
  }
  if (!acceso) {
    return {
      completato: false,
      motivo: "motore-saltato",
      frase: `${titolo}: parte AI SALTATA dal delta-gate — nessuna cadenza prodotta (la memoria resta all'ultimo blocco).`,
    };
  }
  if (rc !== 0) {
    return {
      completato: false,
      motivo: riacc ? "motore-fallito-riaccodata" : "motore-fallito",
      frase:
        `${titolo}: il motore ha fallito dopo ${n} tentativ${n === 1 ? "o" : "i"} (rc=${rc})` +
        (riacc ? " — cadenza ri-accodata, riparte da sola." : " — nessuna cadenza prodotta."),
    };
  }
  if (gate > 0) {
    return {
      completato: false,
      motivo: "vincoli-attivi",
      frase: `${titolo} finita CON ${gate} vincoli ancora attivi: non è una cadenza pulita.`,
    };
  }
  return { completato: true, motivo: "pulito", frase: `${titolo} completato.` };
}

// L'ultima clausola di AR-389, quella che salta sempre: «e non uscire 0 quando la cadenza non è
// stata prodotta». Il caso peggiore verificato dalla scheda è proprio questo: con la parte AI spenta
// dal delta-gate e nessuna modifica al vault, `esitoCadenza` risponde 0 — successo pieno per un
// piano del mattino che non esiste. Qui il codice d'uscita eredita la verità dell'annuncio: se la
// cadenza non se l'è guadagnata, non può uscire 0. 3 è il codice che il contratto delle cadenze
// riserva a «concluso ma NON è un successo» (l'ha già il giro per i vincoli attivi).
export function codiceUscitaCadenza({ codice = 0, annuncioOk = true } = {}) {
  const c = Number(codice);
  if (!Number.isFinite(c)) return 2; // non misurato: non è un verde
  if (c !== 0) return c; // 1/2/3 dicono già la verità: non li tocco
  const ok = !(annuncioOk === false || annuncioOk === 0 || annuncioOk === "0");
  return ok ? 0 : 3;
}

// ─────────────────────────────────────────────────────────────────────────────
// ② AR-399 — I QUATTRO ESITI DI sync_vault, DI CUI SE NE LEGGEVA UNO
// ─────────────────────────────────────────────────────────────────────────────
// `sync_vault` ha quattro uscite: 0 pubblicata · 1 push fallito o cancello che dice no · 2 rimandata
// (lucchetto, ramo ≠ main, cooldown Vercel) · 3 token git assente. Il chiamante catturava l'rc e
// reagiva solo a `rc = 1`, e solo per `esegui-azione`. Con 2 e 3 il lavoro si chiude «fatto» pur
// sapendo che la memoria non è uscita: sul Pannello un'azione già eseguita resta «da approvare».
//
// Qui l'rc diventa TRE cose insieme: lo stato del lavoro, la riga che Nicola legge, e — la parte che
// mancava del tutto — il fatto che una pubblicazione resta PENDENTE e qualcuno la deve riprendere.
export function esitoSync({ rcSync = 0, tipo = "" } = {}) {
  const rc = Number(rcSync);
  const azione = String(tipo) === "esegui-azione";
  if (rc === 0) return { stato: "", nota: "", pendente: false, motivo: "memoria pubblicata" };

  if (rc === 1) {
    // Comportamento storico conservato: solo qui un'azione reale diventa «errore» (il Pannello
    // mostra Riprova). Cambiarlo sarebbe un altro difetto — quello del doppio invio.
    return {
      stato: azione ? "errore" : "",
      nota: azione
        ? "[worker] Azione eseguita ma push memoria fallito — la riga AZIONI potrebbe non essere visibile nel Pannello."
        : "[worker] Memoria NON pubblicata (push fallito o cancello rosso): il commit è locale, la ripubblicazione è in coda.",
      pendente: true,
      motivo: "push fallito o cancello rosso",
    };
  }
  if (rc === 2) {
    return {
      stato: "",
      nota: "[worker] Pubblicazione della memoria RIMANDATA (lucchetto occupato, ramo ≠ main o cooldown deploy): il commit è locale, la riprendo da solo.",
      pendente: true,
      motivo: "rimandata",
    };
  }
  if (rc === 3) {
    // Token assente: la memoria non uscirà finché qualcuno non collega la chiave. Non lo trasformo
    // in «errore» per un esegui-azione (sarebbe l'invito a riapprovare un'azione già partita), ma
    // NON può più passare per un successo silenzioso.
    return {
      stato: "",
      nota: "[worker] Memoria NON pubblicata: manca la chiave git sul server (GIT_PUSH_TOKEN/GIT_REPO). Quello che ho scritto resta sul server e il Pannello non lo vede.",
      pendente: true,
      motivo: "token git assente",
    };
  }
  return {
    stato: "",
    nota: `[worker] Pubblicazione della memoria con esito sconosciuto (rc=${rc}): la tratto come NON pubblicata.`,
    pendente: true,
    motivo: `rc sconosciuto (${rc})`,
  };
}

// Il marcatore di pubblicazione pendente: quando riprovare, e da quando è troppo.
// «un passo interno rimandato non diventa mai un elemento di coda con la sua ora di ripresa» (⑤).
export function ripresaPubblicazione({ marcatore = null, adessoMs = 0, cooldownSec = 300, allarmeOre = 6 } = {}) {
  if (!marcatore || !marcatore.quando) return { riprova: false, allarme: false, motivo: "nessuna pubblicazione pendente" };
  // AR-666 — il ramo stringa faceva `Date.parse(timbro.replace(" ", "T"))`: senza fuso scritto,
  // lo standard dice ora LOCALE del processo. Sul VPS in UTC il marcatore risultava di una o due
  // ore più giovane del vero, e da qui esce l'allarme «la memoria non esce da troppo»: un allarme
  // che si sveglia in ritardo è un allarme che non c'è nelle ore in cui serviva.
  const t = typeof marcatore.quando === "number" ? marcatore.quando : msDaTimbro(marcatore.quando);
  if (!Number.isFinite(t)) {
    // Marcatore illeggibile: meglio riprovare una volta di troppo che tenersi la memoria in casa.
    return { riprova: true, allarme: false, motivo: "marcatore illeggibile — riprovo comunque" };
  }
  const sec = (Number(adessoMs) - t) / 1000;
  const ore = Math.round((sec / 3600) * 10) / 10;
  const allarme = sec / 3600 >= Math.max(0, Number(allarmeOre) || 0);
  if (sec < Math.max(0, Number(cooldownSec) || 0)) {
    return { riprova: false, allarme, ore, motivo: `pendente da ${Math.round(sec)}s — aspetto il cooldown` };
  }
  return { riprova: true, allarme, ore, motivo: `pendente da ${ore}h (rc=${marcatore.rc ?? "?"})` };
}

// ─────────────────────────────────────────────────────────────────────────────
// ③ AR-397 — LA REGISTRAZIONE È PARTE DELL'EFFETTO
// ─────────────────────────────────────────────────────────────────────────────
// «Dove c'è un effetto irreversibile, la REGISTRAZIONE va resa durevole almeno quanto lui.» Oggi era
// il passo meno protetto della catena: tutto il resto ritenta (fetch, push, motore, claim, ri-accodo),
// l'unica cosa che dice cosa è successo davvero no. Il costo è il doppio invio: l'esito si perde, il
// lavoro resta `in_corso`, la sentinella lo chiude «potrebbe essere già partita → riapprova».
export const ESITO_TENTATIVI = 4;

/** Attesa crescente fra un tentativo e l'altro (secondi): 2, 4, 8… con tetto. */
export function attesaRitentativo({ tentativo = 1, baseSec = 2, capSec = 30 } = {}) {
  const t = Math.max(1, Math.floor(Number(tentativo) || 1));
  const base = Math.max(1, Math.floor(Number(baseSec) || 2));
  const cap = Math.max(base, Math.floor(Number(capSec) || 30));
  return Math.min(cap, base * 2 ** (t - 1));
}

/**
 * AR-631 — LA PATCH CHE RIESCE SENZA TOCCARE NIENTE.
 *
 * La stessa malattia di questo file, un piano più sotto: la PATCH che chiude un lavoro filtra su
 * `stato=eq.in_corso` e giudicava il successo SOLO dal codice d'uscita di curl. PostgREST risponde
 * 2xx anche quando il filtro non trova NESSUNA riga — un `[]` è una risposta perfettamente riuscita.
 *
 * Il caso vero, e non è teorico: la sentinella chiude il lavoro in «errore» credendo che l'azione non
 * sia partita, mentre invece sta ancora girando. Quando il worker finisce e scrive l'esito, il filtro
 * `stato=eq.in_corso` non trova più niente, la risposta è 2xx, la funzione ritorna 0, il ricovero
 * viene SCARTATO e sul log compare «esito scritto». L'esito di un'azione già eseguita sparisce, la
 * card resta «riapprova», Nicola riapprova, e parte due volte. È esattamente lo scenario che il
 * ricovero era nato per impedire — mancava solo di guardare cosa tornava.
 *
 * Serve `Prefer: return=representation` sulla chiamata: senza, il corpo è vuoto per contratto e
 * questa funzione non può distinguere «zero righe» da «non me l'hanno detto» — e nel dubbio dice di no,
 * perché dichiarare scritto ciò che non si è visto è la malattia stessa.
 *
 * `riprovabile` separa i due modi di fallire, e la differenza è tempo vero: una richiesta che non è
 * arrivata può arrivare al tentativo dopo, mentre «zero righe toccate» è definitivo — lo stato di
 * quel lavoro l'ha già cambiato qualcun altro e non tornerà `in_corso` da solo. Ritentare quel caso
 * quattro volte significa quattordici secondi di attese per arrivare allo stesso ricovero.
 *
 * @param {{rcCurl?:number, corpo?:string}} p rc di curl e corpo grezzo della risposta
 * @returns {{confermata:boolean, righe:number, riprovabile:boolean, motivo:string}}
 */
export function patchConfermata({ rcCurl = 0, corpo = "" } = {}) {
  const rc = Number(rcCurl) || 0;
  if (rc !== 0) {
    return { confermata: false, righe: 0, riprovabile: true, motivo: `curl uscito con rc=${rc}: la richiesta non è arrivata` };
  }
  const testo = String(corpo == null ? "" : corpo).trim();
  if (!testo) {
    return {
      confermata: false, righe: 0, riprovabile: true,
      motivo: "risposta vuota: senza Prefer return=representation non so quante righe ho toccato",
    };
  }
  let dati;
  try { dati = JSON.parse(testo); } catch {
    return { confermata: false, righe: 0, riprovabile: true, motivo: "risposta non leggibile: non posso dire di aver scritto" };
  }
  const righe = Array.isArray(dati) ? dati.length : dati && typeof dati === "object" ? 1 : 0;
  if (righe === 0) {
    return {
      confermata: false,
      righe: 0,
      riprovabile: false,
      motivo: "la PATCH è riuscita ma non ha toccato nessuna riga: qualcun altro ha già cambiato lo stato di questo lavoro",
    };
  }
  return { confermata: true, righe, riprovabile: false, motivo: `${righe} riga/e aggiornata/e` };
}

/**
 * L'esito è stato ricoverato su disco: quando il worker lo ritrova, che ne fa?
 * `statoAttuale` è quello che il database dice ADESSO di quel lavoro.
 *   scrivi  = la riga è ancora nostra (in_corso) o è stata chiusa in errore dalla sentinella
 *             credendo che l'azione non fosse partita: è ESATTAMENTE il caso che il ricovero esiste
 *             per riparare.
 *   scarta  = qualcuno ha già scritto un esito buono: il ricovero non serve più.
 *   attendi = non ho potuto leggere lo stato. Non butto niente: un file di ricovero perso è di nuovo
 *             la malattia di partenza.
 */
export function decidiRipubblicazione({ statoAttuale = "", statoRicoverato = "" } = {}) {
  const a = String(statoAttuale || "").trim();
  if (!a) return { azione: "attendi", motivo: "stato attuale non leggibile — tengo il ricovero" };
  if (a === "in_corso") return { azione: "scrivi", motivo: "il lavoro è ancora in corso: l'esito è il nostro" };
  if (a === "errore") {
    return {
      azione: "scrivi",
      motivo: `chiuso in errore senza il nostro esito (${statoRicoverato || "?"}): lo riscrivo, è il caso del doppio invio`,
    };
  }
  if (a === "fatto" || a === "annullato" || a === "sostituito" || a === "in_attesa") {
    return { azione: "scarta", motivo: `il lavoro è già «${a}»: nessun esito da recuperare` };
  }
  return { azione: "attendi", motivo: `stato «${a}» non previsto — non butto il ricovero` };
}

// ─────────────────────────────────────────────────────────────────────────────
// ④ AR-396 — IL REBASE CHE FALLISCE E IL PUSH CHE PARTE LO STESSO
// ─────────────────────────────────────────────────────────────────────────────
// `git rebase FETCH_HEAD || git rebase --abort || true`: se anche l'abort fallisce, l'errore è
// ingoiato e si arriva al `git push` con l'albero a metà rebase — HEAD staccato su un avanzamento
// PARZIALE che dal remoto risulta fast-forward. Il push riesce, e su main finisce metà lavoro:
// la peggiore delle bugie, perché è verde da tutte le parti.
//
// Tre esiti espliciti, come chiede la scheda. `abortito` resta pubblicabile di proposito: l'albero è
// tornato dov'era, e un push non-fast-forward lo rifiuta il remoto — è il comportamento storico e
// non fa danno. `sporco` no: lì si smette.
export function decidiRebase({ rcRebase = 0, rcAbort = null, rebaseInCorso = false } = {}) {
  const rc = Number(rcRebase) || 0;
  const inCorso = rebaseInCorso === true || rebaseInCorso === 1 || rebaseInCorso === "1";
  if (rc === 0 && !inCorso) return { stato: "riuscito", puoiPushare: true, motivo: "rebase riuscito" };
  if (rc === 0 && inCorso) {
    return { stato: "sporco", puoiPushare: false, motivo: "rebase «riuscito» ma la cartella di rebase è ancora lì: non mi fido" };
  }
  const ab = rcAbort === null || rcAbort === undefined || rcAbort === "" ? null : Number(rcAbort);
  if (ab === 0 && !inCorso) {
    return { stato: "abortito", puoiPushare: true, motivo: "rebase in conflitto, abort riuscito: l'albero è tornato indietro" };
  }
  return {
    stato: "sporco",
    puoiPushare: false,
    motivo: `rebase fallito (rc=${rc}) e albero non ripulito (abort rc=${ab ?? "?"}${inCorso ? ", rebase ancora in corso" : ""}): NON pubblico un avanzamento parziale`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI — è così che i copioni bash chiedono, invece di decidere
// ─────────────────────────────────────────────────────────────────────────────
//   node cervello/esito-scrittura.mjs annuncio --titolo="Ritmo mattino" --ai-rc=0 --motore=1 …
//        → stampa la frase su stdout; esce 0 se è un successo GUADAGNATO, 10 altrimenti.
//   node cervello/esito-scrittura.mjs sync --rc=2 --tipo=esegui-azione        → JSON
//   node cervello/esito-scrittura.mjs ripresa --quando=<epoch_ms> --rc=2 …    → JSON, esce 10 se non è ora
//   node cervello/esito-scrittura.mjs attesa --tentativo=2                    → secondi
//   node cervello/esito-scrittura.mjs ripubblica --stato=errore --ricoverato=fatto → JSON
//   node cervello/esito-scrittura.mjs rebase --rc=1 --rc-abort=1 --in-corso=1 → JSON, esce 10 se NON si pubblica
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const arg = (nome, def = "") => {
    const t = process.argv.find((a) => a.startsWith(`--${nome}=`));
    return t ? t.slice(nome.length + 3) : def;
  };
  const cmd = process.argv[2] || "";
  const vero = (v) => v === "1" || v === "true";
  if (cmd === "annuncio") {
    const r = annuncioCadenza({
      titolo: arg("titolo", "Cadenza"),
      aiRc: Number(arg("ai-rc", "0")),
      motoreAcceso: vero(arg("motore", "1")),
      tentativi: Number(arg("tentativi", "1")),
      riaccodata: vero(arg("riaccodata", "0")),
      vincoliAttivi: Number(arg("vincoli", "0")),
      misurato: vero(arg("misurato", "1")),
    });
    process.stdout.write(r.frase + "\n");
    process.exit(r.completato ? 0 : 10);
  } else if (cmd === "uscita") {
    process.stdout.write(
      String(codiceUscitaCadenza({ codice: Number(arg("codice", "0")), annuncioOk: vero(arg("annuncio-ok", "1")) })) + "\n",
    );
  } else if (cmd === "sync") {
    process.stdout.write(JSON.stringify(esitoSync({ rcSync: Number(arg("rc", "0")), tipo: arg("tipo", "") })) + "\n");
  } else if (cmd === "ripresa") {
    const quando = arg("quando", "");
    const r = ripresaPubblicazione({
      marcatore: quando ? { quando: /^\d+$/.test(quando) ? Number(quando) : quando, rc: arg("rc", "?") } : null,
      adessoMs: Number(arg("adesso", String(Date.now()))),
      cooldownSec: Number(arg("cooldown", "300")),
      allarmeOre: Number(arg("allarme-ore", "6")),
    });
    process.stdout.write(JSON.stringify(r) + "\n");
    process.exit(r.riprova ? 0 : 10);
  } else if (cmd === "attesa") {
    process.stdout.write(String(attesaRitentativo({ tentativo: Number(arg("tentativo", "1")) })) + "\n");
  } else if (cmd === "patch-confermata") {
    // Il corpo arriva da una VARIABILE D'AMBIENTE, non da un argomento: una risposta REST può
    // contenere qualunque cosa, e passarla sulla riga di comando la esporrebbe alla shell — la
    // stessa porta di AR-638, un piano più in là. Stessa forma che `esito_ricovera` usa già.
    const r = patchConfermata({ rcCurl: Number(arg("rc", "0")), corpo: process.env.PATCH_CORPO || "" });
    process.stdout.write(JSON.stringify(r) + "\n");
    process.exit(r.confermata ? 0 : 10);
  } else if (cmd === "ripubblica") {
    const r = decidiRipubblicazione({ statoAttuale: arg("stato", ""), statoRicoverato: arg("ricoverato", "") });
    process.stdout.write(JSON.stringify(r) + "\n");
    process.exit(r.azione === "scrivi" ? 0 : r.azione === "scarta" ? 11 : 12);
  } else if (cmd === "rebase") {
    const r = decidiRebase({
      rcRebase: Number(arg("rc", "0")),
      rcAbort: arg("rc-abort", ""),
      rebaseInCorso: vero(arg("in-corso", "0")),
    });
    process.stdout.write(JSON.stringify(r) + "\n");
    process.exit(r.puoiPushare ? 0 : 10);
  } else {
    process.stderr.write("Uso: esito-scrittura.mjs {annuncio|sync|ripresa|attesa|ripubblica|rebase} [--opzioni]\n");
    process.exit(64);
  }
}
