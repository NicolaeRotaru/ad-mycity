// AR-839 — «Il muro fra i negozi dal lato del testo aspetta un consumatore che non esiste, e niente
// obbligherà chi lo costruirà a passarci.»
//
// Il muro (`bottega/guardia-esecuzione.mjs`) è stato costruito il 26/8 con l'elenco dei tipi VUOTO:
// prima della porta, apposta. Qui la porta arriva — il tipo di lavoro `bottega` — e con lei il
// conto da pagare che quel file aveva scritto: «aggiungere un tipo qui è ciò che apre il muro. Chi
// lo fa deve, nello stesso lavoro, far uscire il testo da `testoPerAI` — e scriverne la prova».
//
// QUESTA È QUELLA PROVA, e non guarda nessun sorgente: RITAGLIA dal `worker.sh` vero i due tratti
// che contano — il muro all'esecuzione e il ramo che compone il testo di bottega — e li ESEGUE.
// Un test che cercasse `testoPerAI` dentro worker.sh resterebbe verde anche il giorno che qualcuno
// ci mette accanto un prompt scritto a mano: è esattamente il modo in cui AR-839 è nato, due
// meccanismi giusti e provati che non chiamava nessuno.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { ok, titolo, finisci, sandbox, tratto, eseguiBash, RADICE } from "./c4-banco.mjs";
import { TIPI_DI_BOTTEGA, CENTRO } from "../bottega/guardia-esecuzione.mjs";

const CERVELLO = join(RADICE, "cervello");

/** I due negozi del banco. Il secondo non deve MAI comparire in niente che esca dal primo. */
const MIO = "forno-a";
const ALTRO = "fiorista-b";
const SEGNO_MIO = "PANE-DI-ANNA";
const SEGNO_ALTRO = "ROSE-DI-BRUNO";

const righeDiDue = [
  { negozio_id: MIO, cliente: "Anna", nota: SEGNO_MIO },
  { negozio_id: ALTRO, cliente: "Bruno", nota: SEGNO_ALTRO },
  { cliente: "senza padrone", nota: "RIGA-ORFANA" },
];

/**
 * Il preludio comune: le finte che servono al tratto vero per girare fuori dal worker.
 * `_dead_letter` lascia un sigillo invece di scrivere sul database — così si vede SE il lavoro è
 * stato fermato, non solo se il testo è uscito.
 */
function preludio(dove) {
  return (
    `SCRIPT_DIR=${JSON.stringify(CERVELLO)}\n` +
    `. "$SCRIPT_DIR/worker-bottega.sh"\n` +
    `_dead_letter() { printf '%s' "$2" > ${JSON.stringify(join(dove, "dead-letter.txt"))}; }\n` +
    // Le due sorgenti di contesto INTERNO della macchina, con un marchio addosso. Il percorso del
    // centro le usa (è giusto: lavora per la macchina). Il percorso di bottega NON deve: un
    // impiegato che lavora per un fornaio non ha nessuna ragione di vedere la memoria dell'AD, i
    // suoi difetti aperti o le sue chiavi. Se un giorno qualcuno le aggiunge «per aiutare», il
    // marchio compare nel prompt e questa prova diventa rossa.
    `contesto_macchina_chat() { printf '%s' "MEMORIA-INTERNA-DELLA-MACCHINA"; }\n` +
    `plugin_prompt_for_tipo() { printf '%s' "FRAMMENTO-INTERNO-DEI-PLUGIN"; }\n` +
    `prepara_allegati_chat() { printf '%s' "ALLEGATI-DELLA-CHAT"; }\n` +
    `richiesta="il mandato grezzo dalla coda"\n` +
    `id="L1"\n`
  );
}

/** Esegue il RAMO VERO di worker.sh che compone il testo di un lavoro di bottega. */
function ramoDiBottega(dove, riga, { tipo = "bottega" } = {}) {
  return eseguiBash({
    dove,
    preludio: preludio(dove) + `riga=${JSON.stringify(JSON.stringify(riga))}\ntipo=${JSON.stringify(tipo)}\nfor _un_giro in 1; do\nif false; then :\n`,
    blocco: tratto("cervello/worker.sh", 'elif [ "$tipo" = "bottega" ]; then', "  else"),
    coda: "fi\ndone\n",
    leggi: ["prompt", "BOTTEGA_MOTIVO", "BOTTEGA_TESTO"],
  });
}

/** Esegue il MURO VERO di worker.sh, quello che sta subito dopo la presa del lavoro. */
function muroDelWorker(dove, { negozio, tipo, env = {} } = {}) {
  return eseguiBash({
    dove,
    preludio: preludio(dove) + `AI_NEGOZIO=${JSON.stringify(negozio)}\ntipo=${JSON.stringify(tipo)}\nfor _un_giro in 1; do\n`,
    blocco: tratto("cervello/worker.sh", '_muro_rc=0; bottega_muro "$AI_NEGOZIO" "$tipo"', "  skip_sync=0"),
    coda: `printf 'ARRIVATO' > ${JSON.stringify(join(dove, "arrivato-in-fondo"))}\ndone\n`,
    leggi: ["_muro_rc", "BOTTEGA_MOTIVO"],
    env,
  });
}

const leggi = (dove, nome) => {
  const r = spawnSync("cat", [join(dove, nome)], { encoding: "utf8" });
  return r.status === 0 ? r.stdout : "";
};

// ───────────────────────────────────────────────────────────────────────────────

titolo("(a) le righe di DUE negozi entrano, esce il testo di UNO solo — nel worker vero");
{
  const dove = sandbox("bottega-a");
  const r = ramoDiBottega(dove, [{ id: "L1", tipo: "bottega", negozio_id: MIO, richiesta: "prepara la risposta ad Anna", righe: righeDiDue }]);
  if (r.cieco) ok(false, "il ramo di bottega di worker.sh si esegue", r.cieco);
  else {
    ok(r.vars.prompt.includes(SEGNO_MIO), "nel testo c'è il dato del negozio del lavoro", r.vars.prompt.slice(0, 400));
    ok(!r.vars.prompt.includes(SEGNO_ALTRO), "il dato dell'ALTRO negozio non c'è", r.vars.prompt);
    ok(!r.vars.prompt.includes(ALTRO), "il NOME dell'altro negozio non c'è nemmeno", r.vars.prompt);
    ok(!r.vars.prompt.includes("RIGA-ORFANA"), "la riga che non dice di chi è viene scartata: «non lo so» non è «va bene per tutti»", r.vars.prompt);
    ok(/scartate/.test(r.log), "lo scarto NON è silenzioso: finisce nel log del worker", r.log);
    ok(r.vars.prompt.includes("MANDATO"), "il testo è quello di `testoPerAI`, non un prompt scritto a mano qui accanto", r.vars.prompt.slice(0, 300));
  }
}

titolo("l'impiegato di un negozio non vede dentro la macchina");
{
  const dove = sandbox("bottega-chiuso");
  const r = ramoDiBottega(dove, [{ id: "L1", tipo: "bottega", negozio_id: MIO, richiesta: "prepara la risposta ad Anna" }]);
  if (r.cieco) ok(false, "il ramo di bottega si esegue", r.cieco);
  else {
    ok(r.vars.prompt.length > 0, "il testo esce", r.vars.BOTTEGA_MOTIVO);
    ok(!r.vars.prompt.includes("MEMORIA-INTERNA-DELLA-MACCHINA"), "la memoria dell'AD non entra nel testo di un negozio", r.vars.prompt);
    ok(!r.vars.prompt.includes("FRAMMENTO-INTERNO-DEI-PLUGIN"), "e nemmeno i frammenti interni dei plugin", r.vars.prompt);
    ok(!r.vars.prompt.includes("ALLEGATI-DELLA-CHAT"), "e nemmeno gli allegati della chat di Nicola", r.vars.prompt);
    ok(
      r.vars.prompt.includes("non fai azioni sul mondo reale") || r.vars.prompt.includes("Non fai azioni sul mondo reale"),
      "e il testo gli dice, dentro, che non manda niente da solo: prepara e consegna",
      r.vars.prompt.slice(0, 600),
    );
  }
}
{
  // Le MANI. Un lavoro di bottega sta sul lato senza lista EXTRA, come la chat: non tocca il repo,
  // non apre PR, non manda niente. È un tratto vero di worker.sh, eseguito.
  for (const [tipo, atteso] of [["bottega", "0"], ["chat", "0"], ["analisi", "1"]]) {
    const dove = sandbox(`mani-${tipo}`);
    const r = eseguiBash({
      dove,
      preludio: `tipo=${JSON.stringify(tipo)}\n`,
      blocco: tratto("cervello/worker.sh", 'case "$tipo" in chat|bottega)', "# 💸 PENSIERO MIRATO"),
      leggi: ["AI_ALLOW_ACTIONS"],
    });
    if (r.cieco) ok(false, `le mani di «${tipo}» si leggono`, r.cieco);
    else ok(r.vars.AI_ALLOW_ACTIONS === atteso, `le mani di «${tipo}»: AI_ALLOW_ACTIONS=${atteso}`, `è ${r.vars.AI_ALLOW_ACTIONS}`);
  }
}

titolo("(b) una chiave del negozio non finisce mai nel testo che parte");
{
  const dove = sandbox("bottega-b1");
  const r = ramoDiBottega(dove, [
    { id: "L1", tipo: "bottega", negozio_id: MIO, richiesta: "rispondi ad Anna", cassaforte: { token_whatsapp: "WA-SEGRETO-123456789" } },
  ]);
  if (r.cieco) ok(false, "il ramo di bottega si esegue col negozio che ha una cassaforte", r.cieco);
  else {
    ok(r.vars.prompt.length > 0, "il lavoro parte: una cassaforte piena non blocca un testo pulito", r.vars.BOTTEGA_MOTIVO);
    ok(!r.vars.prompt.includes("WA-SEGRETO-123456789"), "la chiave non è nel testo — non c'è una strada che ce la porti", r.vars.prompt);
  }
}
{
  const dove = sandbox("bottega-b2");
  // Il caso vero: il negoziante incolla la sua chiave dentro un messaggio. Il materiale DEVE entrare
  // (è il lavoro), quindi la porta stretta non basta: serve l'ultima riga di difesa.
  const r = ramoDiBottega(dove, [
    {
      id: "L1",
      tipo: "bottega",
      negozio_id: MIO,
      richiesta: "rispondi",
      materiale: ["ciao, il mio token è WA-SEGRETO-123456789, usalo tu"],
      cassaforte: { token_whatsapp: "WA-SEGRETO-123456789" },
    },
  ]);
  if (r.cieco) ok(false, "il ramo di bottega si esegue col segreto incollato nel materiale", r.cieco);
  else {
    ok(!r.vars.prompt.includes("WA-SEGRETO-123456789"), "il testo con la chiave dentro NON parte", r.vars.prompt);
    ok(r.vars.prompt === "", "e non parte a metà ripulito: non parte proprio", r.vars.prompt);
    ok(leggi(dove, "dead-letter.txt").length > 0, "il lavoro viene fermato con scritto perché, non lasciato in coda", "nessun dead-letter");
    ok(!leggi(dove, "dead-letter.txt").includes("WA-SEGRETO-123456789"), "il motivo dà il NOME della chiave, mai il valore: chi stampa il segreto per dire che è esposto ha appena fatto il danno che denunciava", leggi(dove, "dead-letter.txt"));
  }
}

titolo("il muro all'esecuzione: chi passa, chi no, e chi passa dichiarando di essere cieco");
{
  const dove = sandbox("muro-negozio");
  const r = muroDelWorker(dove, { negozio: MIO, tipo: "analisi" });
  if (r.cieco) ok(false, "il muro di worker.sh si esegue", r.cieco);
  else {
    ok(r.vars._muro_rc === "1", "un lavoro di un negozio di un tipo che non sappiamo trattare è FERMO", r.log);
    ok(leggi(dove, "arrivato-in-fondo") === "", "e il worker non prosegue: il lavoro non arriva nemmeno al tetto di spesa", "è arrivato in fondo");
    ok(leggi(dove, "dead-letter.txt").includes("negozio"), "col perché scritto a Nicola", leggi(dove, "dead-letter.txt"));
  }
}
{
  const dove = sandbox("muro-centro");
  const r = muroDelWorker(dove, { negozio: CENTRO, tipo: "giro" });
  if (r.cieco) ok(false, "il muro si esegue su un lavoro del centro", r.cieco);
  else {
    ok(r.vars._muro_rc === "0", "la macchina continua a lavorare: i lavori del centro passano", r.log);
    ok(leggi(dove, "arrivato-in-fondo") === "ARRIVATO", "e proseguono davvero", r.log);
  }
}
{
  const dove = sandbox("muro-bottega");
  const r = muroDelWorker(dove, { negozio: MIO, tipo: "bottega" });
  if (r.cieco) ok(false, "il muro si esegue su un lavoro di bottega", r.cieco);
  else ok(r.vars._muro_rc === "0" && leggi(dove, "arrivato-in-fondo") === "ARRIVATO", "il tipo che ha la sua porta passa: il muro non è un divieto, è un elenco", r.log);
}
{
  // Node che non risponde. È l'unico caso in cui il muro non può chiedere, e il verso conta:
  // per il centro si passa DICENDOLO (⚪ non è verde), per un negozio no.
  const dove = sandbox("muro-cieco");
  writeFileSync(join(dove, "node"), "#!/usr/bin/env bash\nexit 127\n", { mode: 0o755 });
  const env = { PATH: `${dove}:${process.env.PATH}` };
  const centro = muroDelWorker(dove, { negozio: CENTRO, tipo: "giro", env });
  const negozio = muroDelWorker(dove, { negozio: MIO, tipo: "bottega", env });
  if (centro.cieco || negozio.cieco) ok(false, "il muro si esegue con node rotto", centro.cieco || negozio.cieco);
  else {
    ok(centro.vars._muro_rc === "2", "col centro il muro dichiara di essere cieco invece di fingere un verde", centro.log);
    ok(/non è un verde|non e' un verde/.test(centro.log), "e lo scrive nel log", centro.log);
    ok(negozio.vars._muro_rc === "1", "con un negozio «non lo so» vale «no»: è il caso per cui il muro esiste", negozio.log);
  }
}

titolo("il conto che il muro aveva scritto: ogni tipo nell'elenco ha davvero la sua porta");
{
  // Il caso che tiene onesto chi verrà dopo. NON cerca una parola: per OGNI tipo dichiarato manda al
  // costruttore le righe di due negozi e guarda il testo che esce. Un tipo aggiunto all'elenco senza
  // il suo percorso isolato fa diventare rosso QUESTO caso, non un commento.
  ok(TIPI_DI_BOTTEGA.length > 0, "c'è almeno un tipo di bottega: il muro ha una porta da sorvegliare");
  for (const tipo of TIPI_DI_BOTTEGA) {
    const dove = sandbox(`porta-${tipo}`);
    const r = ramoDiBottega(dove, [{ id: "L1", tipo, negozio_id: MIO, richiesta: "un mandato qualunque", righe: righeDiDue }], { tipo });
    if (r.cieco) {
      ok(false, `il tipo «${tipo}» ha un percorso che si esegue`, r.cieco);
      continue;
    }
    ok(
      r.vars.prompt.includes(SEGNO_MIO) && !r.vars.prompt.includes(SEGNO_ALTRO),
      `il tipo «${tipo}» tiene il suo negozio separato dagli altri`,
      r.vars.prompt.slice(0, 400) || `nessun testo — motivo: ${r.vars.BOTTEGA_MOTIVO}`,
    );
  }
}

titolo("le due copie del nome del centro non si allontanano");
{
  // `worker-bottega.sh` ha una copia di `CENTRO` per l'unico caso in cui non può chiedere al
  // modulo: node che non parte. Una copia che si allontana dall'originale è una bugia — quindi si
  // confrontano ESEGUENDOLE tutte e due, non leggendole.
  const dove = sandbox("centro-copia");
  const r = eseguiBash({
    dove,
    preludio: `SCRIPT_DIR=${JSON.stringify(CERVELLO)}\n. "$SCRIPT_DIR/worker-bottega.sh"\n`,
    blocco: `:`,
    leggi: ["BOTTEGA_CENTRO"],
  });
  if (r.cieco) ok(false, "worker-bottega.sh si sorgente", r.cieco);
  else ok(r.vars.BOTTEGA_CENTRO === CENTRO, `la copia del nome del centro nella shell («${r.vars.BOTTEGA_CENTRO}») è la stessa del modulo («${CENTRO}»)`);
}

titolo("AR-841 — se il sistema non da' un file temporaneo, il lavoro parte lo stesso");
{
  // Trovato dalla lente «cadenza-esecuzione» sul perimetro di questo lotto, non da una radiografia
  // di domani. `bottega_prompt` apre un file per lo stderr del costruttore: con `mktemp` muto la
  // variabile restava vuota, e `2>""` non e' un redirect — e' un errore. Sotto `pipefail` il lavoro
  // di una bottega sarebbe morto per un motivo che non c'entra niente con la bottega.
  const dove = sandbox("bottega-senza-mktemp");
  writeFileSync(join(dove, "mktemp"), "#!/usr/bin/env bash\nexit 1\n", { mode: 0o755 });
  const r = eseguiBash({
    dove,
    preludio: preludio(dove) + `riga=${JSON.stringify(JSON.stringify([{ id: "L1", tipo: "bottega", negozio_id: MIO, richiesta: "rispondi ad Anna", righe: righeDiDue }]))}\ntipo="bottega"\nfor _un_giro in 1; do\nif false; then :\n`,
    blocco: tratto("cervello/worker.sh", 'elif [ "$tipo" = "bottega" ]; then', "  else"),
    coda: "fi\ndone\n",
    leggi: ["prompt", "BOTTEGA_MOTIVO"],
    env: { PATH: `${dove}:${process.env.PATH}` },
  });
  if (r.cieco) ok(false, "il ramo di bottega si esegue senza mktemp", r.cieco);
  else {
    ok(r.vars.prompt.includes(SEGNO_MIO), "il testo esce anche senza mktemp", r.vars.BOTTEGA_MOTIVO || r.log);
    ok(!r.vars.prompt.includes(SEGNO_ALTRO), "e resta separato: il ripiego non allarga niente", r.vars.prompt);
  }
}

titolo("un ingresso storto non diventa un testo storto");
{
  const dove = sandbox("bottega-storto");
  const r = ramoDiBottega(dove, "non-e-json");
  if (r.cieco) ok(false, "il ramo si esegue su una riga illeggibile", r.cieco);
  else {
    ok(r.vars.prompt === "", "una riga illeggibile non produce nessun testo", r.vars.prompt);
    ok(leggi(dove, "dead-letter.txt").length > 0, "e il lavoro viene fermato, non lasciato passare", "nessun dead-letter");
  }
}

assert.ok(true);
finisci("il testo di bottega non porta l'altro negozio (AR-839)");
