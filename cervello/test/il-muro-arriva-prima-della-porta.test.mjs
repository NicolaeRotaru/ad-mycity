#!/usr/bin/env node
// AR-839 — «Il muro fra i negozi dal lato del testo aspetta un consumatore che non esiste, e niente
// obbligherà chi lo costruirà a passarci.»
//
// I due meccanismi che tengono separati i negozi nel TESTO — il contesto isolato e le chiavi mai
// dentro il discorso — stanno in `bottega/lavoro.mjs` dal 23/8, provati, e non li chiama nessuno.
// La ragione NON è che qualcuno se li salta: i tipi di lavoro che il worker sa fare sono tutti del
// centro, e un lavoro del centro non ha nessun negozio da tenere separato. Il consumatore non c'è.
//
// Il difetto è quello che succede DOPO: il giorno che qualcuno costruisce il percorso di bottega,
// niente lo obbliga a passare da `testoPerAI`. `ARCHITETTURA-TRE-MACCHINE.md` è esplicito
// sull'ordine — «il muro non è una rifinitura da mettere dopo il pilota. È la prima cosa, o non si
// parte» — perché aggiungerlo su dati già mescolati è «il lavoro più caro e pericoloso che esista».
//
// Quindi il muro si è costruito PRIMA della porta che doveva sorvegliare, e finché la porta non c'è
// stata non ha fatto passare niente. Il 27/8 la porta è arrivata — il tipo di lavoro `bottega`,
// dietro `bottega/testo-lavoro.mjs` — e il conto scritto qui sotto è stato pagato: la prova che
// ESEGUE la porta di ogni tipo dichiarato sta in
// `il-testo-di-bottega-non-porta-l-altro-negozio.test.mjs`. Questo file resta il guardiano
// dell'ELENCO: chi non c'è non passa, e chi c'è passa solo perché c'è.
import assert from "node:assert/strict";
import { puoEseguire, TIPI_DI_BOTTEGA, CENTRO } from "../bottega/guardia-esecuzione.mjs";

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

prova("la macchina continua a lavorare: i lavori del centro passano", () => {
  for (const tipo of ["giro", "chat", "metabolizza", "esegui-azione", "analisi"]) {
    const v = puoEseguire({ negozio: CENTRO, tipo });
    assert.equal(v.si, true, `il lavoro «${tipo}» del centro è stato fermato: ${v.motivo}`);
  }
});

prova("un lavoro di un negozio di un tipo SENZA porta non passa", () => {
  const v = puoEseguire({ negozio: "forno-a", tipo: "analisi" });
  assert.equal(v.si, false, "un lavoro di bottega sarebbe finito nel percorso del centro");
  assert.match(v.motivo, /percorso di bottega/, "il motivo deve dire cosa manca, non solo che è vietato");
  assert.match(v.motivo, /forno-a/, "il motivo deve nominare il negozio");
});

prova("un lavoro che non dice di chi è non passa: «non lo so» non è «va bene per tutti»", () => {
  for (const negozio of ["", "   ", null, undefined]) {
    const v = puoEseguire({ negozio, tipo: "giro" });
    assert.equal(v.si, false, `un lavoro senza negozio (${JSON.stringify(negozio)}) è passato`);
  }
});

prova("il motivo c'è sempre, anche quando la risposta è sì", () => {
  const si = puoEseguire({ negozio: CENTRO, tipo: "giro" });
  assert.equal(typeof si.motivo, "string");
  const no = puoEseguire({ negozio: "forno-a", tipo: "giro" });
  assert.ok(no.motivo.length > 20, "un lavoro fermo senza motivo è la telefonata del lunedì mattina");
});

prova("l'elenco è la lista dei tipi CHE HANNO UNA PORTA, e chi non c'è resta fuori", () => {
  // L'elenco è nato vuoto il 26/8 — il muro prima della porta — e il 27/8 ha preso il suo primo
  // nome, `bottega`. Il conto che quel giorno era scritto qui («chi aggiunge un tipo deve, nello
  // stesso lavoro, far uscire il testo da testoPerAI e scriverne la prova») è stato pagato: la
  // prova che ESEGUE la porta di ogni tipo dichiarato sta in
  // `il-testo-di-bottega-non-porta-l-altro-negozio.test.mjs`, e passa le righe di due negozi al
  // costruttore vero. Qui resta la metà locale: l'elenco non è un lasciapassare generale.
  assert.ok(TIPI_DI_BOTTEGA.length > 0, "l'elenco è tornato vuoto: il muro non sorveglia più nessuna porta");
  for (const tipo of TIPI_DI_BOTTEGA) {
    assert.equal(puoEseguire({ negozio: "forno-a", tipo }).si, true, `il tipo dichiarato «${tipo}» non passa`);
  }
  assert.equal(
    puoEseguire({ negozio: "forno-a", tipo: "un-tipo-mai-dichiarato" }).si,
    false,
    "un tipo che nessuno ha dichiarato passa lo stesso: l'elenco non governa più il muro",
  );
});

prova("è l'elenco a governare il muro, non un nome scritto dentro la funzione", () => {
  // La prova che tiene onesto chi verrà dopo: aggiungere un tipo all'elenco è ciò che apre il muro,
  // e togliergli il nome lo richiude. Se un giorno `puoEseguire` imparasse a riconoscere «bottega»
  // da sola, senza passare dall'elenco, questo caso lo direbbe — e con lui sparirebbe l'unico punto
  // in cui la prova della porta va a cercare i tipi da collaudare.
  const finto = "bottega-prova";
  const eranoQuesti = [...TIPI_DI_BOTTEGA];
  assert.equal(puoEseguire({ negozio: "forno-a", tipo: finto }).si, false);
  TIPI_DI_BOTTEGA.push(finto);
  try {
    assert.equal(puoEseguire({ negozio: "forno-a", tipo: finto }).si, true, "l'elenco non governa il muro");
    assert.equal(puoEseguire({ negozio: "forno-a", tipo: "analisi" }).si, false, "l'elenco ha aperto tutto");
    TIPI_DI_BOTTEGA.length = 0;
    for (const t of eranoQuesti) {
      assert.equal(puoEseguire({ negozio: "forno-a", tipo: t }).si, false, `«${t}» passa anche fuori dall'elenco: il nome è cablato dentro la funzione`);
    }
  } finally {
    TIPI_DI_BOTTEGA.length = 0;
    TIPI_DI_BOTTEGA.push(...eranoQuesti);
  }
});

const rotte = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "ok" : "NON ok"} — ${c.nome}${c.ok ? "" : `\n   ${c.err}`}`);
console.log(`\n${casi.length - rotte.length}/${casi.length} passate`);
if (rotte.length) process.exit(1);
