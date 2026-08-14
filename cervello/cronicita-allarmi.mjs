// cronicita-allarmi.mjs — da quanto suona questo allarme? Nato per AR-440.
//
// IL DIFETTO, in una riga: un allarme acceso da settimane e uno acceso da un minuto si leggono
// uguale, quindi il primo diventa sfondo e nessuno lo vede più.
//
// I cinque perché, dalla scheda: ① nessun controllo distingue «rosso nuovo» da «rosso cronico»;
// ② perché ogni vincolo è una stringa vuota o piena, senza storia; ③ perché niente tiene stato fra
// un giro e l'altro; ④ perché finché un allarme suona ogni tanto la cosa non si vede — si vede solo
// quando ne suona uno per settimane, e a quel punto è già diventato sfondo; ⑤ RADICE: un guardiano
// perennemente rosso costa quanto uno spento, e la macchina non aveva NESSUN modo di misurare la
// cronicità. Questo file è quel modo.
//
// PERCHÉ CONTA PIÙ DI QUANTO SEMBRI. Un cancello che suona sempre viene aggirato al secondo giro, e
// da lì in poi smette di fermare anche i rossi veri: il costo non è il rumore, è la difesa che si
// spegne da sola senza che nessuno l'abbia decisa.
//
// TUTTO PURO: entrano il conto di prima e i nomi accesi adesso, esce il conto nuovo. Nessun disco,
// nessun orologio interno, nessuna rete — così una prova può far scorrere venti giri in un
// millisecondo invece di aspettare venti giorni per vedere cosa succede.
//
// ── AR-687 — LA METÀ CHE MANCAVA: il GIRO ────────────────────────────────────────────────────────
// AR-440 è stato chiuso dove lo stato fra un giro e l'altro già esisteva (la visita di salute). Nel
// giro invece ogni vincolo era una stringa vuota o piena, senza storia: **un guardiano rosso da tre
// settimane occupava il prompt esattamente come uno rosso da un minuto.** Il modulo c'era già ed
// esponeva quello che serve — mancava l'aggancio. Sta in fondo a questo file, come riga di comando
// (`cronicita-allarmi.mjs giro --attivi=…`), perché il chiamante è `cervello/giro.sh` e la shell non
// può importare un modulo. Il disco lo tocca SOLO la riga di comando; il giudizio resta puro.

import { existsSync, readFileSync, writeFileSync } from "node:fs";

/** Oltre questi giri di fila lo stesso allarme non è più una notizia: è una condizione. */
export const GIRI_PER_CRONICO = 3;

/**
 * Aggiorna il conto dei giri consecutivi per ogni allarme acceso.
 *
 * @param {Record<string, number>} prima  quante volte di fila era acceso ognuno, al giro scorso
 * @param {string[]} accesiOra            chi è acceso adesso (id del controllo o del vincolo)
 * @returns {Record<string, number>}      il conto nuovo. Chi si è spento SPARISCE: un allarme
 *                                        risolto e poi riacceso è nuovo di nuovo, e va riguardato.
 */
export function aggiornaConto(prima = {}, accesiOra = []) {
  const dopo = {};
  for (const id of accesiOra) {
    const n = Number(prima?.[id]);
    dopo[id] = (Number.isFinite(n) && n > 0 ? n : 0) + 1;
  }
  return dopo;
}

/**
 * Il giudizio su un singolo allarme, dato il numero di giri consecutivi in cui è acceso.
 *
 * Tre stati e non due, perché sono tre cose diverse da fare: il NUOVO si guarda adesso, il RIPETUTO
 * si sta guardando, il CRONICO non lo sta guardando nessuno — e quello va tolto dal rumore di fondo
 * e messo davanti a Nicola come una domanda, non ripetuto una quarta volta uguale.
 */
export function statoAllarme(giri, soglia = GIRI_PER_CRONICO) {
  const n = Number(giri) || 0;
  if (n <= 0) return { stato: "spento", cronico: false, giri: 0 };
  if (n === 1) return { stato: "nuovo", cronico: false, giri: n };
  if (n < soglia) return { stato: "ripetuto", cronico: false, giri: n };
  return { stato: "cronico", cronico: true, giri: n };
}

/**
 * La frase che va davanti agli occhi. Un numero secco («3») non dice niente a chi legge di fretta:
 * quello che cambia il comportamento è «dice no da 3 giri e nessuno l'ha risolto».
 *
 * L'unità si passa da fuori — «giri» per il giro, «visite» per la visita di salute — perché ogni
 * numero deve arrivare col suo metro: «12» da solo non dice se sono ore, giorni o controlli.
 */
export function dilloAVoce(giri, soglia = GIRI_PER_CRONICO, unita = "giri") {
  const s = statoAllarme(giri, soglia);
  if (s.stato === "spento") return "";
  if (s.stato === "nuovo") return `acceso adesso, non c'era ${unita === "visite" ? "alla visita scorsa" : "al giro scorso"}`;
  if (s.stato === "ripetuto") return `acceso in ${s.giri} ${unita} di fila`;
  return `acceso in ${s.giri} ${unita} di fila e nessuno l'ha risolto`;
}

/**
 * Il quadro completo, per chi deve decidere cosa mostrare e cosa smettere di ripetere.
 *
 * `daPortareANicola` è la parte che vale: sono gli allarmi appena diventati cronici — quelli che
 * hanno appena tagliato la soglia. Si segnalano UNA volta, quando cambiano stato, perché una card
 * ripetuta a ogni giro è esattamente la malattia che questo file cura, spostata di un piano.
 */
export function quadroCronicita(prima = {}, accesiOra = [], soglia = GIRI_PER_CRONICO) {
  const dopo = aggiornaConto(prima, accesiOra);
  const nuovi = [];
  const cronici = [];
  const daPortareANicola = [];
  for (const [id, giri] of Object.entries(dopo)) {
    const s = statoAllarme(giri, soglia);
    if (s.stato === "nuovo") nuovi.push(id);
    if (s.cronico) {
      cronici.push({ id, giri, detto: dilloAVoce(giri, soglia) });
      if (!statoAllarme(prima?.[id], soglia).cronico) daPortareANicola.push({ id, giri });
    }
  }
  const spenti = Object.keys(prima || {}).filter((id) => !(id in dopo));
  return { conto: dopo, nuovi, cronici, spenti, daPortareANicola };
}

// ═══════════════════════════════════════════════════════════════════════════
// L'AGGANCIO AL GIRO (AR-687) — l'unico pezzo che tocca il disco
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Dove vive il conto fra un giro e l'altro: dentro `.git/`, come già fanno il lucchetto e il
 * ricovero degli esiti. Non è memoria da difendere — è lo stato di una macchina, e non va committato.
 * Si può spostare da fuori (`CRONICITA_STATO`) così una prova non scrive mai nel repo vero.
 */
export function fileStatoGiro(repo = ".", env = {}) {
  return env.CRONICITA_STATO || `${repo}/.git/mycity-cronicita-giro.json`;
}

/**
 * IL CONTO DI PRIMA, con l'esito della lettura attaccato.
 *
 * ⚠️ Qui `catch { return {} }` sarebbe la malattia «una fonte letta a metà produce un verdetto
 * intero»: un file di stato corrotto diventerebbe «nessun allarme è mai stato cronico», cioè la
 * risposta più comoda possibile. Le due assenze sono diverse e vanno separate:
 *   · il file NON C'È → è il primo giro, ed è un fatto: memoria vuota, lettura riuscita
 *   · il file C'È ma non si legge → non lo so, e il giro non deve fidarsi di questo conto
 */
export function leggiConto(percorso, io = {}) {
  const esiste = io.esiste || existsSync;
  const leggiTesto = io.leggiTesto || ((p) => readFileSync(p, "utf8"));
  if (!esiste(percorso)) return { conto: {}, letto: true, motivo: "primo giro: il conto non c'era ancora" };
  try {
    const j = JSON.parse(leggiTesto(percorso));
    if (!j || typeof j !== "object" || Array.isArray(j)) {
      return { conto: {}, letto: false, motivo: `il conto in ${percorso} non ha la forma attesa` };
    }
    return { conto: j, letto: true, motivo: null };
  } catch (e) {
    return { conto: {}, letto: false, motivo: `non sono riuscito a leggere ${percorso}: ${e?.code || e?.message || e}` };
  }
}

/**
 * UN GIRO DI CRONICITÀ, dal conto vecchio a quello nuovo.
 *
 * `io` arriva da fuori: senza, tocca il disco; con, una prova fa scorrere venti giri in memoria.
 * Il giudizio non è qui — è in `quadroCronicita`, che resta puro.
 *
 * `affidabile` è il campo che conta: è `false` quando il conto di prima non si è potuto leggere o
 * quello nuovo non si è potuto salvare. In quel caso il giro NON deve togliere niente dal prompt —
 * nascondere un rosso perché «tanto è vecchio» quando non si sa nemmeno se sia vecchio è il modo
 * peggiore di sbagliare, e va sbagliato dalla parte che ripete di troppo.
 */
export function giroCronicita(percorso, accesiOra = [], io = {}, soglia = GIRI_PER_CRONICO) {
  // Il salvataggio torna un ESITO, non un booleano nudo: il motivo del guasto deve arrivare fino a
  // chi decide. Un `catch → false` qui butterebbe via proprio la frase che spiega perché il conto
  // del prossimo giro ripartirà da zero.
  const scrivi = io.scrivi || ((p, dati) => {
    let esito = { ok: true, motivo: null };
    try {
      writeFileSync(p, JSON.stringify(dati, null, 2));
    } catch (e) {
      esito = { ok: false, motivo: `non sono riuscito a salvare il conto in ${p}: ${e?.code || e?.message || e}` };
    }
    return esito;
  });
  const prima = io.leggiConto ? io.leggiConto(percorso) : leggiConto(percorso, io);
  const q = quadroCronicita(prima.conto, accesiOra, soglia);
  const salvato = scrivi(percorso, q.conto);
  const motivi = [prima.motivo, salvato?.motivo].filter(Boolean);
  return {
    ...q,
    memoria_letta: prima.letto,
    memoria_salvata: salvato?.ok !== false,
    motivo: motivi.length ? motivi.join(" · ") : null,
    affidabile: prima.letto === true && salvato?.ok === true,
  };
}

/**
 * Le righe che `giro.sh` legge. Formato piatto apposta: la shell non ha un lettore di JSON, e
 * passare da `jq` vorrebbe dire dipendere da un programma che sul VPS può non esserci.
 *
 *   AFFIDABILE=si|no       → «no» = il conto non regge, e il giro non toglie NIENTE dal prompt
 *   CRONICI=a b            → dicono no da almeno 3 giri: ripeterli è già stato inutile tre volte
 *   NUOVI_CRONICI=a        → hanno appena tagliato la soglia: si portano a Nicola UNA volta sola
 *   DETTO|a|frase          → la frase da mettere davanti agli occhi, col suo metro
 *   MOTIVO=…               → perché il conto non è affidabile, quando non lo è
 */
/**
 * IL TESTO CHE ARRIVA AL MOTORE DEL GIRO (AR-687) — puro, così un test lo può leggere parola per parola.
 *
 * Sta qui e non dentro `giro.sh` per la ragione di sempre: una decisione scritta in bash si può
 * provare solo cercandone la forma in un file, e una ricerca di parole non fallisce nel modo in cui
 * fallisce la realtà. Qui entra il quadro ed esce la frase; la shell la incolla e basta.
 *
 * Tre uscite, e la differenza fra loro è tutto il difetto:
 *   · **non affidabile** → il conto fra un giro e l'altro non regge. Non si dice «nessuno è cronico»:
 *     si dice che non lo so. Sbagliare qui vuol dire nascondere un rosso vecchio credendo di saperlo
 *     vecchio, ed è il modo peggiore di sbagliare, quindi si sbaglia ripetendo di troppo.
 *   · **niente di cronico** → stringa vuota: nessuna riga in più nel prompt. Un blocco che compare a
 *     ogni giro per dire «tutto bene» è rumore, e il rumore è la malattia che questo file cura.
 *   · **qualcosa di cronico** → l'elenco con la sua età, e per chi ha appena tagliato la soglia
 *     l'obbligo di portarlo a Nicola UNA volta. Il vincolo NON si toglie dal prompt: la scheda lo
 *     proponeva, ma togliere «non inventare numeri» perché lo ripetiamo da tre giri spegnerebbe una
 *     difesa proprio quando è più necessaria. Si toglie il silenzio sull'età, non il vincolo.
 */
export function bloccoPerIlGiro(q, soglia = GIRI_PER_CRONICO) {
  if (!q || q.affidabile === false) {
    const perche = q?.motivo ? ` (${q.motivo})` : "";
    return (
      `⚠️ NON SO DA QUANTI GIRI questi controlli dicono no: il conto che tiene la storia fra un giro ` +
      `e l'altro non regge${perche}. Tratta OGNI vincolo qui sopra come se fosse nuovo e ripetilo per ` +
      `intero. Non saltarne nessuno perché «tanto è vecchio»: in questo giro non so se sia vecchio.`
    );
  }
  const cronici = Array.isArray(q.cronici) ? q.cronici : [];
  if (cronici.length === 0) return "";
  const righe = [
    `Questi controlli dicono no da almeno ${soglia} giri di fila. Ripeterli uguale è già stato inutile ` +
      `${soglia} volte: in QUESTO giro o li ripari, o scrivi a Nicola perché non si possono riparare.`,
    "",
    ...cronici.map((c) => `- **${c.id}** — ${c.detto}`),
  ];
  const nuovi = Array.isArray(q.daPortareANicola) ? q.daPortareANicola : [];
  if (nuovi.length > 0) {
    righe.push(
      "",
      `⛔ APPENA DIVENTATI CRONICI: ${nuovi.map((c) => c.id).join(", ")}. Prima di chiudere questo giro ` +
        `accoda in MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md UNA card per ognuno — «questo ` +
        `controllo dice no da ${soglia} giri e nessuno l'ha risolto», con cosa cambia e cosa serve da ` +
        `Nicola. Una volta sola, adesso: dal prossimo giro non si ripete.`
    );
  }
  return righe.join("\n");
}

export function righePerLaShell(q) {
  const righe = [
    `AFFIDABILE=${q.affidabile === false ? "no" : "si"}`,
    `CRONICI=${q.affidabile === false ? "" : q.cronici.map((c) => c.id).join(" ")}`,
    `NUOVI_CRONICI=${q.affidabile === false ? "" : q.daPortareANicola.map((c) => c.id).join(" ")}`,
  ];
  if (q.affidabile !== false) for (const c of q.cronici) righe.push(`DETTO|${c.id}|${c.detto}`);
  if (q.motivo) righe.push(`MOTIVO=${String(q.motivo).replace(/\n/g, " ")}`);
  return righe;
}

if (process.argv[1] && process.argv[1].endsWith("cronicita-allarmi.mjs")) {
  const arg = (nome) => {
    const v = process.argv.find((a) => a.startsWith(`--${nome}=`));
    return v ? v.slice(nome.length + 3) : "";
  };
  const attivi = arg("attivi").split(/[\s,]+/).filter(Boolean);
  const percorso = arg("stato") || fileStatoGiro(process.env.REPO || ".", process.env);
  const q = giroCronicita(percorso, attivi);
  if (process.argv.includes("--json")) console.log(JSON.stringify(q, null, 2));
  // `--blocco` è la porta che usa `cervello/giro.sh`: stampa il testo già pronto per il prompt.
  // Può stampare NIENTE, e vuol dire «non c'è niente di cronico». Se il comando non parte affatto
  // esce con un codice ≠ 0, e la shell distingue le due cose: vuoto-perché-tutto-bene ≠ non-misurato.
  else if (process.argv.includes("--blocco")) {
    const t = bloccoPerIlGiro(q);
    if (t) console.log(t);
  } else for (const r of righePerLaShell(q)) console.log(r);
}
