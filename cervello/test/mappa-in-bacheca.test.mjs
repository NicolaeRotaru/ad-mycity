#!/usr/bin/env node
// La mappa della macchina in bacheca — Nicola, 29/7: «aggiungi la descrizione delle 9 parti dentro
// la bacheca … e vorrei che questa sezione venga aggiornata ogni volta che c'è una cosa nuova
// dentro la macchina».
//
// Cosa può andare storto qui, in ordine di quanto farebbe danno:
//
//   ① **la macchina cresce e la mappa non se ne accorge.** È il rischio peggiore perché non rompe
//      niente: nasce una mano nuova — cioè un modo in più di toccare il mondo reale — e la mappa
//      continua a mostrarne cinque. Nicola legge una macchina che non esiste più. Il conteggio da
//      solo non basta: «6 mani» senza la riga che dice cosa fa la sesta è un numero, non una mappa.
//   ② **la mappa promette un pezzo che non c'è.** Il gemello del primo: una skill viene tolta e la
//      sua riga resta. Peggio di un buco, perché sembra completa.
//   ③ **il blocco vive in cima alla bacheca.** La bacheca ordina per data. Questo blocco parla di
//      una cosa che si muove di continuo (basta una riga in più in un file), quindi se la data
//      corresse a ogni ritocco starebbe sempre sopra il registro dei fatti e produrrebbe un commit
//      a ogni giro che non dice niente.
//   ④ **il parser legge il codice a metà.** Non è teoria: scrivendo questo censimento la union
//      `VistaNav` veniva letta fino al `;`, e l'ULTIMA voce — che ha il suo `// legacy` a destra del
//      punto e virgola — risultava un'area viva. Tre scorciatoie diventavano due, e il numero di
//      stanze della Cabina saliva di uno senza che nessuno avesse costruito niente.
//
// I casi qui sotto rompono il fix apposta, uno per volta, per accertarsi che diventino rossi.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import {
  DESCRIZIONI,
  PARTI,
  TITOLO_BACHECA,
  areeDaNav,
  bloccoBacheca,
  censimento,
  codiceUscita,
  creaOcchi,
  firmaStruttura,
  maniDaPublishers,
  motiviDiCecita,
  sensoriDaVerifica,
} from "../censimento-macchina.mjs";
import { dataDelBlocco, fotoStruttura, quandoDatare, stessaStruttura } from "../mappa-macchina.mjs";
import { aggiornaBacheca } from "../guardiani-check.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

const cens = censimento(REPO);

// ─── ① una cosa nuova nella macchina non può passare in silenzio ─────────────

prova("una mano nuova senza spiegazione rende rossa la mappa", () => {
  const finto = {
    ...cens,
    inventari: { ...cens.inventari, mani: [...cens.inventari.mani, "whatsapp"] },
  };
  // Il censimento vero non lo posso falsificare senza toccare il disco: rifaccio il confronto che fa.
  const mancanti = finto.inventari.mani.filter((n) => !DESCRIZIONI.mani[n]);
  assert.deepEqual(mancanti, ["whatsapp"], "la mano nuova deve risultare senza parole");
  assert.equal(codiceUscita({ ...finto, mancanti, fantasmi: [] }), 1, "senza spiegazione la mappa è rossa");
});

prova("oggi ogni pezzo misurabile ha la sua riga (nessun buco aperto)", () => {
  assert.deepEqual(cens.mancanti, [], `pezzi senza spiegazione: ${cens.mancanti.join(", ")}`);
  assert.equal(codiceUscita(cens), 0);
});

// ─── ② la mappa non promette pezzi che non ci sono ───────────────────────────

prova("una spiegazione rimasta per una skill tolta rende rossa la mappa", () => {
  const nomi = cens.inventari.skill.filter((s) => s !== cens.inventari.skill[0]);
  const fantasmi = Object.keys(DESCRIZIONI.skill).filter((n) => !nomi.includes(n));
  assert.ok(fantasmi.length >= 1, "tolta una skill, la sua riga deve risultare orfana");
  assert.equal(codiceUscita({ mancanti: [], fantasmi }), 1);
});

prova("oggi non c'è nessuna spiegazione orfana", () => {
  assert.deepEqual(cens.fantasmi, [], `spiegazioni senza pezzo: ${cens.fantasmi.join(", ")}`);
});

// ─── ③ la data si muove solo per le cose nuove, non per i conteggi ───────────

prova("cambia un conteggio ma non la struttura → la data NON si muove", () => {
  assert.equal(
    quandoDatare(firmaStruttura(cens), fotoStruttura(cens, "2026-07-29 08:00"), "2026-07-29 08:00", "2026-07-29 23:59"),
    "2026-07-29 08:00",
    "un file in più non è una cosa nuova: il blocco non deve risalire in cima"
  );
});

prova("compare un pezzo nuovo → la data si muove", () => {
  const ieri = fotoStruttura(cens, "2026-07-29 08:00");
  const oggi = firmaStruttura({ ...cens, inventari: { ...cens.inventari, skill: [...cens.inventari.skill, "nuova"] } });
  assert.equal(quandoDatare(oggi, ieri, "2026-07-29 08:00", "2026-07-29 23:59"), "2026-07-29 23:59");
});

prova("il blocco non c'è ancora → si data adesso", () => {
  assert.equal(
    quandoDatare(firmaStruttura(cens), fotoStruttura(cens, "2026-07-01 08:00"), null, "2026-07-29 23:59"),
    "2026-07-29 23:59"
  );
});

prova("la data buona è quella che si VEDE in bacheca, non quella tenuta a parte", () => {
  const doc = `# 📌 Bacheca\n\n${bloccoBacheca(cens, "2026-07-28 09:15")}\n`;
  assert.equal(dataDelBlocco(doc, TITOLO_BACHECA), "2026-07-28 09:15");
  assert.equal(dataDelBlocco("# 📌 Bacheca\n\nnessun blocco\n", TITOLO_BACHECA), null);
  // Il JSON dice una data, la bacheca un'altra: vince la bacheca (è quella che Nicola legge).
  const disallineato = fotoStruttura(cens, "2026-07-01 00:00");
  assert.equal(
    quandoDatare(firmaStruttura(cens), disallineato, "2026-07-28 09:15", "2026-07-29 23:59"),
    "2026-07-28 09:15"
  );
});

prova("la firma ignora le righe di codice e sente i pezzi", () => {
  const soloRighe = { ...cens, misure: { ...cens.misure, pannello: { ...cens.misure.pannello, righe: 999999 } } };
  assert.deepEqual(firmaStruttura(soloRighe), firmaStruttura(cens), "le righe non sono struttura");
  const pezzoNuovo = { ...cens, inventari: { ...cens.inventari, skill: [...cens.inventari.skill, "nuova"] } };
  assert.notDeepEqual(firmaStruttura(pezzoNuovo), firmaStruttura(cens), "una skill in più è struttura");
});

prova("la struttura su disco non tiene una copia di sé stessa accanto", () => {
  const foto = fotoStruttura(cens, "2026-07-29 22:00");
  const testo = JSON.stringify(foto);
  assert.equal(testo.includes("\\\""), false, "niente struttura stringata dentro la struttura");
  assert.ok(stessaStruttura(firmaStruttura(cens), foto), "la data non fa parte dell'identità");
  assert.equal(stessaStruttura(firmaStruttura(cens), { ...foto, mani: [] }), false, "un pezzo in meno sì");
});

// ─── ⑤ una fonte che non si riesce a leggere non è uno zero ──────────────────

prova("una cartella illeggibile diventa CECITÀ, non «zero pezzi»", () => {
  const occhi = creaOcchi();
  const finto = censimento("/percorso/che-non-esiste-davvero", occhi);
  assert.ok(occhi.guasti.length > 0, "i guasti di lettura devono restare scritti");
  assert.ok(motiviDiCecita(finto).length > 0, "un censimento a vuoto è cieco, non verde");
  assert.equal(finto.inventari.mani.length, 0, "…e infatti non ha contato niente");
});

prova("sul repo vero non c'è nessun guasto di lettura", () => {
  assert.deepEqual(cens.guasti, [], `guasti: ${cens.guasti.join(" · ")}`);
  assert.deepEqual(motiviDiCecita(cens), []);
});

// ─── ④ il codice va letto tutto, non fino al primo punto e virgola ───────────

prova("l'ultima area della union porta il suo `// legacy` a destra del `;`", () => {
  const finto = [
    "export type VistaNav =",
    '  | "plancia"',
    '  | "storico"; // legacy → memoria/storico-*',
  ].join("\n");
  const r = areeDaNav(finto);
  assert.deepEqual(r.tutte, ["plancia", "storico"]);
  assert.deepEqual(r.legacy, ["storico"], "fermarsi al `;` faceva sembrare viva una scorciatoia");
});

prova("le aree si leggono davvero da nav.ts, non da un elenco a mano", () => {
  const nav = readFileSync(join(REPO, "pannello/src/lib/nav.ts"), "utf8");
  const r = areeDaNav(nav);
  assert.ok(r.tutte.includes("plancia") && r.tutte.includes("azioni"), "le aree vere devono comparire");
  assert.equal(r.legacy.length, 3, "oggi le scorciatoie vecchie sono tre");
  assert.deepEqual(r.tutte, cens.inventari.aree, "il censimento deve usare la stessa lettura");
});

prova("sensori e mani si leggono dal codice, non da una lista", () => {
  assert.ok(sensoriDaVerifica('nome: "supabase_rest"').includes("supabase_rest"));
  assert.deepEqual(maniDaPublishers(["index.mjs", "_comune.mjs", "email.mjs"]), ["email"], "indice e modulo comune non sono mani");
});

// ─── il testo che finisce sotto gli occhi di Nicola ──────────────────────────

prova("in bacheca finiscono tutte e nove le parti, con i pezzi di ognuna", () => {
  const md = bloccoBacheca(cens, "2026-07-29 22:00");
  assert.equal(PARTI.length, 9, "le parti sono nove");
  for (const p of PARTI) assert.ok(md.includes(`### ${p.n}. ${p.emoji} ${p.titolo}`), `manca la parte ${p.n}`);
  for (const a of cens.inventari.aree) assert.ok(md.includes(`\`${a}\``), `l'area ${a} manca dalla tabella`);
  for (const s of cens.inventari.sensori) assert.ok(md.includes(`\`${s}\``), `il sensore ${s} manca dalla tabella`);
  for (const s of cens.inventari.servizi) assert.ok(md.includes(`\`${s}\``), `il servizio ${s} manca dalla tabella`);
  assert.ok(!/undefined|NaN/.test(md), "nessun buco nel markdown");
  assert.ok(md.startsWith(`## ${TITOLO_BACHECA} · 2026-07-29 22:00`), "il titolo è la chiave con cui il blocco si ritrova");
});

prova("la mappa dichiara cosa NON dice (non si fa scambiare per una diagnosi)", () => {
  const md = bloccoBacheca(cens, "2026-07-29 22:00");
  assert.match(md, /non se funziona/, "deve essere scritto che questa mappa non dice se i pezzi funzionano");
});

prova("il blocco si sostituisce, non si duplica", () => {
  const doc = `# 📌 Bacheca\n\n${bloccoBacheca(cens, "2026-07-29 08:00")}\n\n---\n\n## 🛡️ Altro avviso · 2026-07-28 10:00\n\ncorpo\n`;
  const dopo = aggiornaBacheca(doc, bloccoBacheca(cens, "2026-07-29 08:00"), { titolo: TITOLO_BACHECA });
  assert.equal(dopo.cambiato, false, "stesso contenuto → nessuna riscrittura");
  const conteggio = (t) => t.split("\n").filter((r) => r.startsWith(`## ${TITOLO_BACHECA} ·`)).length;
  assert.equal(conteggio(dopo.testo), 1, "un blocco solo");
  const cambiato = aggiornaBacheca(doc, bloccoBacheca({ ...cens, mancanti: ["mani/whatsapp"] }, "2026-07-29 09:00"), { titolo: TITOLO_BACHECA });
  assert.equal(cambiato.cambiato, true);
  assert.equal(conteggio(cambiato.testo), 1, "resta un blocco solo anche dopo la sostituzione");
  assert.ok(cambiato.testo.includes("## 🛡️ Altro avviso · 2026-07-28 10:00"), "gli altri avvisi non si toccano");
});

prova("un pezzo senza spiegazione si VEDE nel testo, non sparisce", () => {
  const md = bloccoBacheca({ ...cens, mancanti: ["mani/whatsapp"] }, "2026-07-29 22:00");
  assert.match(md, /1 pezzi nuovi senza spiegazione/, "il buco va dichiarato a Nicola, non nascosto");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
