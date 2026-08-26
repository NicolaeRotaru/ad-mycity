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
// Quindi il muro si costruisce ORA, prima della porta che dovrà sorvegliare, e finché la porta non
// c'è non fa passare niente.
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

prova("un lavoro di bottega NON passa finché il suo percorso non esiste", () => {
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

prova("l'elenco dei tipi di bottega è VUOTO, e finché lo è il muro non fa passare nessun negozio", () => {
  // Non è un buco: è il muro che aspetta la porta. Se un giorno qualcuno aggiunge un tipo qui senza
  // costruire il percorso isolato, questo caso resta verde ma quello sotto diventa rosso.
  assert.deepEqual(TIPI_DI_BOTTEGA, [], "qualcuno ha dichiarato un tipo di bottega");
});

prova("se un tipo entra nell'elenco, il muro lo lascia passare — e allora il percorso DEVE esistere", () => {
  // La prova che tiene onesto chi verrà dopo: aggiungere un tipo qui è ciò che apre il muro. Chi lo
  // fa deve, nello stesso lavoro, far uscire il testo da `testoPerAI` — e scriverne la prova.
  const finto = "bottega-prova";
  const primaEra = puoEseguire({ negozio: "forno-a", tipo: finto });
  assert.equal(primaEra.si, false);
  TIPI_DI_BOTTEGA.push(finto);
  try {
    assert.equal(puoEseguire({ negozio: "forno-a", tipo: finto }).si, true, "l'elenco non governa il muro");
    assert.equal(puoEseguire({ negozio: "forno-a", tipo: "analisi" }).si, false, "l'elenco ha aperto tutto");
  } finally {
    TIPI_DI_BOTTEGA.length = 0;
  }
});

const rotte = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "ok" : "NON ok"} — ${c.nome}${c.ok ? "" : `\n   ${c.err}`}`);
console.log(`\n${casi.length - rotte.length}/${casi.length} passate`);
if (rotte.length) process.exit(1);
