#!/usr/bin/env node
// AR-149 + AR-150 — il volano si dava un voto con due metri, e contava come prova un test mai fatto.
//
// AR-149. «Il loop chiude» e «le lezioni non si applicano» sono due frasi sullo STESSO numero, e
// arrivavano da due soglie diverse: `sonda-volano.mjs` accendeva `loop_chiude` con `tasso > 0`,
// `tasso-lezioni.mjs` bocciava sotto 0,3. Col tasso vero al 17% il primo scriveva verde nella Cabina
// per 42 giri di fila mentre il secondo suonava l'allarme. E la definizione di «lezione applicata»
// viveva dentro il programma che quel numero lo pubblica: nessun test la eseguiva.
//
// AR-150. `stato: "misurato"` è una parola che il motore si scrive da solo. EXP-004 la portava, e la
// sua stessa nota diceva «MANCATA (non testata): il gate non è mai stato pubblicato». A valle quel
// «misurato» valeva come PROVA che la macchina impara.
//
// Qui si eseguono le funzioni VERE di volano-numeri.mjs e esperimenti-regole.mjs, e sul registro
// vero degli esperimenti, non su un finto comodo.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const CERVELLO = join(QUI, "..");
const REPO = join(CERVELLO, "..");

const V = await import(join(CERVELLO, "volano-numeri.mjs"));
const E = await import(join(CERVELLO, "esperimenti-regole.mjs"));
const T = await import(join(CERVELLO, "tasso-lezioni.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ─────────────────────────── AR-149 · una soglia sola ───────────────────────────

prova("AR-149: il caso vero — tasso 17% con un difetto chiuso NON è «il loop chiude»", () => {
  const v = V.verdettoVolano({ tasso: 0.17, provaArchitettura: true });
  assert.equal(v.chiude, false, "col vecchio metro (tasso > 0) qui usciva true, ed è finito in Cabina 42 volte");
  assert.equal(v.sopra_soglia, false);
  assert.match(v.motivo, /lezioni non si usano/);
});

prova("AR-149: chi legge deve poter distinguere i due modi di non chiudere", () => {
  // Lezioni usate ma nessuna chiusura misurata: il guasto è la mancanza di prove.
  const senzaProva = V.verdettoVolano({ tasso: 0.9 });
  assert.equal(senzaProva.chiude, false);
  assert.equal(senzaProva.sopra_soglia, true);
  assert.match(senzaProva.motivo, /nessuna prova di chiusura/);
  // Prove ma lezioni non usate: il guasto è l'altro. Due guasti, due frasi.
  const senzaLezioni = V.verdettoVolano({ tasso: 0.1, provaBusiness: true });
  assert.equal(senzaLezioni.sopra_soglia, false);
  assert.notEqual(senzaProva.motivo, senzaLezioni.motivo);
});

prova("AR-149: la soglia del comando e quella della sonda sono LA STESSA, su tutta la scala", () => {
  // Il cuore del difetto: due programmi che leggono lo stesso numero non possono dare due verdetti.
  // `esitoTasso` è ciò che decide l'uscita di tasso-lezioni.mjs; `verdettoVolano().sopra_soglia` è
  // ciò che decide `loop_chiude` nella sonda. Se divergono anche su un solo punto, il cancello suona.
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const comandoDiceOk = T.esitoTasso(t) === 0;
    const sondaDiceSopra = V.verdettoVolano({ tasso: t, provaArchitettura: true }).sopra_soglia;
    assert.equal(comandoDiceOk, sondaDiceSopra, `divergono sul tasso ${t}`);
    // E il verdetto pieno non può MAI dire «chiude» mentre il tasso è sotto soglia.
    const v = V.verdettoVolano({ tasso: t, provaBusiness: true, provaArchitettura: true });
    assert.ok(!(v.chiude && !v.sopra_soglia), `«chiude» sotto soglia al tasso ${t}`);
  }
});

prova("AR-149: nessuno dei due programmi porta più una soglia scritta a mano", () => {
  // Guardia di struttura, sopra a quella di comportamento: se il numero torna a comparire dentro un
  // `if`, fra un mese le soglie saranno di nuovo due e la prova qui sopra continuerà a passare.
  for (const f of ["sonda-volano.mjs", "tasso-lezioni.mjs"]) {
    const testo = readFileSync(join(CERVELLO, f), "utf8");
    const righeCodice = testo
      .split("\n")
      .filter((r) => !/^\s*(\/\/|\*|\/\*)/.test(r));
    const colpevoli = righeCodice.filter((r) => /[<>]=?\s*0\.3\b|0\.3\s*[<>]=?/.test(r));
    assert.equal(colpevoli.length, 0, `${f} confronta ancora con 0.3 a mano: ${colpevoli[0]}`);
  }
});

prova("AR-149: «lezione applicata» è una definizione che si ESEGUE, non una funzione privata", () => {
  const adesso = Date.parse("2026-08-15T00:00:00");
  // (a) un uso fresco vale
  assert.equal(
    V.lezioneApplicata({ id: "L-1", usi: [{ quando: "2026-08-10", ref: "x" }] }, "", { adesso }),
    true,
  );
  // (b) un uso vecchio oltre la finestra non vale, e l'id non compare da nessuna parte
  assert.equal(
    V.lezioneApplicata({ id: "L-2", usi: [{ quando: "2026-05-01", ref: "x" }] }, "nessun riferimento", { adesso }),
    false,
  );
  // (c) l'id citato nel testo recente vale
  assert.equal(V.lezioneApplicata({ id: "L-3" }, "…APPLICATE: L-3 nel briefing…", { adesso }), true);
  // (d) una lezione senza usi e mai citata non vale
  assert.equal(V.lezioneApplicata({ id: "L-4" }, "testo che parla d'altro", { adesso }), false);
  // È la stessa funzione che `tasso-lezioni.mjs` usa per pubblicare il numero: una casa sola.
  assert.equal(T.lezioneApplicata, V.lezioneApplicata);
});

prova("AR-149: il tasso porta con sé chi c'è dentro e chi no", () => {
  const adesso = Date.parse("2026-08-15T00:00:00");
  const m = V.tassoApplicazione(
    [{ id: "L-1", usi: [{ quando: "2026-08-14" }] }, { id: "L-2" }, { id: "L-3" }],
    "",
    { adesso },
  );
  assert.equal(m.tasso, 0.33);
  assert.deepEqual(m.applicate_ids, ["L-1"]);
  assert.deepEqual(m.non_applicate_ids, ["L-2", "L-3"]);
});

// ─────────────────── AR-150 · un test mai fatto non è una misura ───────────────────

prova("AR-150: un esperimento che dice «misurato» mentre la sua nota lo smentisce non vale come apprendimento", () => {
  // 22/8 (AR-744) — questo caso PRETENDEVA che EXP-004 fosse ancora `misurato` sul disco: cioè che il
  // difetto fosse ancora lì. Era una prova che poteva restare verde solo finché la macchina era
  // malata, e infatti è diventata rossa nel momento in cui il registro è stato corretto. Una prova
  // scritta sulla PRESENZA del difetto si mette di traverso alla sua cura.
  //
  // Adesso misura la CAPACITÀ di riconoscerlo, su EXP-004 vero se porta ancora la contraddizione e
  // altrimenti su un caso costruito con le sue stesse parole. Quello che non cambia è la domanda:
  // un gate mai partito può valere come prova che la macchina impara? No.
  const reg = JSON.parse(
    readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-miglioramento.json"), "utf8"),
  );
  const vero = (reg.esperimenti || []).find((e) => e.id === "EXP-004");
  assert.ok(vero, "EXP-004 deve esistere nel registro vero");
  assert.match(
    E.raccontoEsperimento(vero),
    E.RE_GATE_MAI_PARTITO,
    "EXP-004 resta il caso-scuola: la sua nota deve continuare a dire che il gate non è mai partito",
  );
  // la stessa scheda, con l'etichetta di prima rimessa sopra: è così che il difetto si presenterebbe
  const comeEra = { ...vero, stato: "misurato" };
  assert.equal(E.statoEffettivo(comeEra), "non-testato");
  assert.equal(
    E.esperimentoProvaApprendimento(comeEra),
    false,
    "un esperimento mai eseguito non può valere come prova che la macchina impara",
  );
  // e il registro vero non deve più portare quella contraddizione
  assert.equal(E.statoEffettivo(vero), vero.stato, "sul disco l'etichetta di EXP-004 non deve più essere smentita");
});

prova("AR-150: i non-testati sono contati a parte, non nascosti dentro i misurati", () => {
  // 22/8 (AR-744) — anche qui il caso pretendeva `misurati veri < dichiarati`, cioè che sul disco
  // ci fosse ancora almeno una bugia da smascherare. Corretto il registro i due numeri coincidono, ed
  // è il risultato GIUSTO: il conto ora è onesto in partenza. La misura che conta non è «quanti
  // stiamo smascherando oggi», è «il conto sa tenerli separati».
  const reg = JSON.parse(
    readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-miglioramento.json"), "utf8"),
  );
  const conto = E.contaEsperimenti(reg.esperimenti);
  assert.ok(conto.non_testati > 0, "il registro contiene esperimenti mai testati: se sono zero, il rilevatore è cieco");
  assert.equal(
    conto.misurati + conto.non_testati + conto.chiusi,
    (reg.esperimenti || []).filter((e) => ["misurato", "chiuso", "non-testato"].includes(String(e.stato).trim())).length,
    "il conto deve quadrare: nessun esperimento finito può sparire dai totali",
  );
  // e la separazione deve reggere anche quando la bugia rientra: due misurati, uno dei quali mai corso
  const misto = E.contaEsperimenti([
    { id: "A", stato: "misurato", nota: "gate partito, 12 aperture su 40" },
    { id: "B", stato: "misurato", nota: "MANCATA (non testata): il gate non è mai stato pubblicato" },
  ]);
  assert.equal(misto.misurati, 1, "solo quello davvero corso conta come misurato");
  assert.equal(misto.non_testati, 1, "l'altro va contato a parte, non sommato ai misurati");
  assert.equal(misto.resa, 0.5, "la resa deve dire che metà di ciò che si dichiarava finito non è mai partito");
});

prova("AR-150: un esperimento davvero misurato continua a valere", () => {
  const vero = {
    id: "EXP-X",
    stato: "misurato",
    atteso: 3,
    reale: 5,
    nota: "Il post è uscito il 20/7 e ha portato 5 iscritti in 24h. Ipotesi confermata.",
  };
  assert.equal(E.statoEffettivo(vero), "misurato");
  assert.equal(E.esperimentoProvaApprendimento(vero), true);
  // e uno aperto resta aperto: non c'è niente da smentire in una promessa non ancora scaduta
  assert.equal(E.statoEffettivo({ id: "EXP-Y", stato: "aperto", nota: "gate mai partito" }), "aperto");
});

prova("AR-150: la sonda del volano non conta più i «misurati» a occhi chiusi", () => {
  // La regola sta nel modulo puro, ma serve che il punto malato la CHIAMI: un modulo importato e mai
  // usato somiglia moltissimo a una difesa attiva.
  const sonda = readFileSync(join(CERVELLO, "sonda-volano.mjs"), "utf8");
  assert.match(sonda, /esperimentoProvaApprendimento/, "sonda-volano deve chiamare la regola, non rifarla");
  const chiamate = (sonda.match(/esperimentoProvaApprendimento/g) || []).length;
  assert.ok(chiamate >= 2, "una sola occorrenza è solo l'import: la difesa sarebbe morta");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
