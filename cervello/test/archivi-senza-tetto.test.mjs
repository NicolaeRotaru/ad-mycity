#!/usr/bin/env node
// AR-182 · AR-254 — gli archivi senza tetto, e i tetti nell'unità sbagliata.
//
// Una malattia sola: **nessun archivio della macchina ha un tetto, e dove un tetto c'è, è nell'unità
// sbagliata.** O l'archivio si rompe (AR-254), o butta via la cosa sbagliata (AR-182).
//
//   AR-182 — il decadimento delle lezioni era per ESECUZIONE, non per giorno. Lo script è nato come
//     passo di un ciclo settimanale ed è finito in un giro che gira 9 volte al giorno: «−0,15 ogni
//     tanto» è diventato «−1,35 al giorno», e nessuno se n'è accorto perché il codice non era
//     cambiato — era cambiata la frequenza sotto i piedi.
//     Misurato il 28/7, il giorno in cui sarebbe partita: DECAY_DAYS=28 e la lezione più vecchia
//     aveva esattamente 28 giorni. 2 lezioni oltre soglia quel giorno, 17 entro il giorno dopo, 38
//     entro tre giorni; confidenza mediana 0,86 → 4 esecuzioni per scendere sotto 0,3 = **10,7 ore**.
//
//   AR-254 — apprendimento.json misurava 1.111.673 caratteri contro un tetto di lettura di 1.000.000:
//     troncato a metà stringa, JSON.parse falliva, e la scheda Apprendimento restava vuota per sempre.
//     Due scoperte facendo il fix: (a) il tetto era arbitrariamente 48.576 byte SOTTO il vincolo vero
//     di GitHub (1 MiB), cioè aggiungeva un modo di rompersi che non esisteva; (b) la stessa logica di
//     troncamento vive in DUE copie in obsidian.ts, e curarne una sola sarebbe la malattia stessa.
//
// Qui si eseguono le funzioni VERE.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const leggi = (f) => readFileSync(join(REPO, f), "utf8");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

const T = await import(join(REPO, "cervello/tetti-archivio.mjs"));
const P = await import(join(REPO, "cervello/pota-apprendimento.mjs"));
const E = await import(join(REPO, "pannello/src/lib/esito-lettura.ts"));

const GIORNO = 86_400_000;
const fa = (g) => new Date(Date.now() - g * GIORNO).toISOString();

// ── AR-182: il tempo si misura in tempo ──────────────────────────────────────
prova("il caso che ha rotto: nove esecuzioni nello stesso giorno danno UN passo, non nove", () => {
  // Con la logica vecchia una lezione a 0,86 moriva in 4 esecuzioni, cioè in 10,7 ore.
  const ultimaConferma = fa(30);
  let passi = 0;
  let ultimoPasso = null;
  for (let i = 0; i < 9; i++) {
    const r = T.passoDovuto({ ultimaConferma, ultimoPasso });
    if (r.decade) {
      passi++;
      ultimoPasso = new Date().toISOString();
    }
  }
  assert.equal(passi, 1, `nove giri in un giorno devono dare UN passo, non ${passi}`);
});

prova("dopo sette giorni il passo si può ridare: il decadimento non si ferma, rallenta", () => {
  // Un decadimento che non decade mai è un archivio che non invecchia — l'altro estremo.
  const r = T.passoDovuto({ ultimaConferma: fa(30), ultimoPasso: fa(8) });
  assert.equal(r.decade, true, r.motivo);
  const no = T.passoDovuto({ ultimaConferma: fa(30), ultimoPasso: fa(3) });
  assert.equal(no.decade, false, "tre giorni dopo l'ultimo passo è troppo presto");
});

prova("sotto la soglia non si decade affatto", () => {
  assert.equal(T.passoDovuto({ ultimaConferma: fa(10) }).decade, false);
  assert.equal(T.passoDovuto({ ultimaConferma: fa(27.9) }).decade, false, "27,9 giorni: ancora dentro");
});

prova("una data illeggibile vale «vecchissima», non «nuova»", () => {
  // Il verso conta: se una data storta valesse «appena confermata», una lezione con il campo rotto
  // non morirebbe mai — e l'archivio crescerebbe di nascosto.
  assert.equal(T.giorniDa("boh"), Infinity);
  assert.equal(T.passoDovuto({ ultimaConferma: null }).decade, true);
});

prova("un'estinzione a blocchi ha un tetto per giro", () => {
  const t = T.tettoDecadutePerGiro(38, 5);
  assert.equal(t.ammesse, 5);
  assert.equal(t.rimandate, 33, "le eccedenti restano attive e riprovano al prossimo giro");
});

prova("il cablaggio: senza `decaduto_step_il` il passo tornerebbe a essere per esecuzione", () => {
  const src = leggi("cervello/cristallizza-apprendimento.mjs");
  assert.match(src, /passoDovuto\(\{/, "deve usare la regola condivisa");
  assert.match(src, /l\.decaduto_step_il = ora/, "senza segnare QUANDO, il passo si ripete a ogni giro");
  assert.match(src, /DECAY_OGNI_GG/);
  assert.doesNotMatch(src, /if \(giorniDa\(l\.ultima_conferma \|\| l\.nato\) > DECAY_DAYS\) \{\n\s*l\.confidenza/, "la logica vecchia, per esecuzione");
});

prova("sul file VERO: nessuna lezione morirebbe oggi", () => {
  // È la misura che conta: il 28/7 due lezioni avevano superato i 28 giorni e sarebbero morte in
  // mezza giornata. Con la regola nuova, in nove esecuzioni ne muore zero.
  const j = JSON.parse(leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json"));
  const attive = (j.lezioni || []).filter((l) => l && l.stato === "attiva");
  assert.ok(attive.length > 100, "il file vero deve avere lezioni, altrimenti non provo niente");
  let morte = 0;
  for (const l of attive) {
    let passi = 0;
    let ultimo = l.decaduto_step_il || null;
    for (let i = 0; i < 9; i++) {
      if (T.passoDovuto({ ultimaConferma: l.ultima_conferma || l.nato, ultimoPasso: ultimo }).decade) {
        passi++;
        ultimo = new Date().toISOString();
      }
    }
    if ((Number(l.confidenza) || 0) - 0.15 * passi < 0.3) morte++;
  }
  assert.equal(morte, 0, `${morte} lezioni morirebbero comunque in una giornata`);
});

// ── AR-254: un file strutturato non si tronca MAI ────────────────────────────
prova("il caso che ha rotto: un .json oltre il tetto NON viene troncato", () => {
  const v = E.comeServire({ percorso: "a/b/apprendimento.json", lunghezza: 1_111_673, tetto: 1_000_000 });
  assert.equal(v.azione, "troppo-grande", "troncare un JSON non lo degrada: lo distrugge");
  assert.match(v.motivo, /non si tronca/);
});

prova("un .md invece si può troncare: si perde la coda, il resto si legge", () => {
  assert.equal(E.comeServire({ percorso: "x/STATO.md", lunghezza: 2_000_000, tetto: 1_000_000 }).azione, "tronca");
});

prova("entro il tetto si serve intero, qualunque sia il tipo", () => {
  for (const p of ["x.json", "x.md"]) {
    assert.equal(E.comeServire({ percorso: p, lunghezza: 500, tetto: 1_000_000 }).azione, "intero");
  }
});

prova("il cablaggio: ENTRAMBE le copie del troncamento passano dalla stessa regola", () => {
  // Il difetto che questo cantiere insegue da dodici lotti è «il fix applicato a una copia sola».
  // In obsidian.ts la logica di lettura esiste due volte: leggiNota e readNote.
  //
  // AGGIORNATO con AR-449. Prima si contavano DUE chiamate a `comeServire`, una per copia: era il
  // modo di dire «nessuna delle due si è persa per strada». Ora le due copie non ripetono più
  // niente — attraversano `testoDaContents`, che chiama la regola una volta sola per tutti. La
  // condizione «due chiamate» diventava rossa proprio quando la duplicazione spariva davvero, cioè
  // premiava la malattia e puniva la cura. Qui si misura l'invariante vero: nessuna delle due
  // strade legge per conto proprio.
  const src = leggi("pannello/src/lib/obsidian.ts");
  const viaComune = (src.match(/testoDaContents\(/g) || []).length;
  assert.ok(viaComune >= 3, `definizione + due chiamate: attese >= 3 occorrenze di testoDaContents, trovate ${viaComune}`);
  // Nessuno dei DUE lettori decodifica per conto proprio: se lo facesse, tornerebbe ad avere una
  // strada tutta sua — ed è così che una delle due copie resta indietro. (Altrove nel file la
  // decodifica esiste per usi diversi — allegati, scritture — e non riguarda questa regola.)
  for (const nome of ["leggiNota", "readNote"]) {
    const i = src.indexOf(`export async function ${nome}(`);
    assert.ok(i > 0, `${nome} deve esistere`);
    const corpo = src.slice(i, src.indexOf("\n}\n", i));
    assert.doesNotMatch(corpo, /Buffer\.from\(/, `${nome} non deve decodificare da sé: passa da testoDaContents`);
    assert.match(corpo, /testoDaContents\(/, `${nome} deve attraversare la via comune`);
  }
  assert.doesNotMatch(src, /const MAX = 1_000_000;/, "il tetto locale ricopiato");
  // Il tetto non è più il limite di GitHub: da quando esiste la seconda strada (Blobs API) quel
  // limite non ci ferma, e tenere il tetto lì avrebbe rifiutato in casa i file appena scaricati.
  // Resta però un vincolo: dev'essere ALMENO il limite inline, mai sotto.
  const tetto = Function(`"use strict";return (${src.match(/const MAX_LETTURA = ([^;]+);/)[1]})`)();
  assert.ok(tetto >= 1_048_576, `il tetto (${tetto}) non può stare SOTTO il limite inline di GitHub`);
});

prova("«troppo-grande» è uno stato dichiarato, e pesa più di «assente»", () => {
  const src = leggi("pannello/src/lib/obsidian.ts");
  assert.match(src, /"troppo-grande"/, "serve lo stato");
  assert.match(src, /"troppo-grande": 2/, "un file che c'è ed è troppo grosso non è «assente»");
  // Sopra 1 MiB la Contents API torna content vuoto MA con size: leggerlo come «assente» sarebbe
  // dire che un file da 1,1 MB non esiste.
  //
  // AGGIORNATO con AR-449: la condizione non si cerca più come STRINGA nel sorgente — si ESEGUE la
  // decisione. Il 30/7 quella riga c'era, riconosceva il caso, e il Pannello ha mostrato lo stesso
  // «Nessun difetto aperto 👍» per dodici ore: riconoscere non basta se non porta da nessuna parte.
  // Adesso la prova chiede il comportamento: davanti a content vuoto + size, si prende la seconda
  // strada; e se manca pure quella, si DICHIARA troppo-grande. Mai «assente».
  const scelta = E.comeLeggere({ content: "", size: 1_081_370, sha: "abc" });
  assert.equal(scelta.via, "blob", "content vuoto + size valorizzato: il file c'è, va preso dall'altra strada");
  const senzaVia = E.comeLeggere({ content: "", size: 1_081_370, sha: "" });
  assert.equal(senzaVia.via, "troppo-grande", "e se non c'è seconda strada lo si dichiara, non lo si spaccia per assente");
});

prova("la Cabina DICE perché la scheda è vuota, invece di restare vuota", () => {
  const route = leggi("pannello/src/app/api/memoria/auto-coscienza/route.ts");
  assert.match(route, /apprendimento_non_leggibile/, "il motivo dev'essere nella risposta");
  assert.match(route, /leggiJsonConMotivo/);
  const ui = leggi("pannello/src/components/AutoCoscienza.tsx");
  assert.match(ui, /Archivio non leggibile/, "e va mostrato a video");
});

// ── il potatore: si pota il morto, non il vivo ───────────────────────────────
prova("il caso che ha rotto: sul file VERO l'archivio adesso rientra nel tetto", () => {
  const t = leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");
  assert.ok(t.length <= 1_048_576, `${t.length} caratteri: ancora sopra il tetto di lettura`);
  JSON.parse(t); // deve restare JSON valido: è tutto il difetto
});

prova("le lezioni VIVE non si potano mai, nemmeno per far entrare il file", () => {
  const finto = {
    _nota_servizio_1: "x".repeat(5000),
    _gate_2: "y".repeat(5000),
    _cosa_e: "questo si tiene: spiega il file",
    lezioni: [
      { id: "a", stato: "attiva", testo: "viva" },
      { id: "b", stato: "decaduta", testo: "morta" },
      { id: "c", stato: "principio", testo: "promossa" },
    ],
  };
  const p = P.pianoPotatura(finto, 1_000_000);
  assert.equal(p.lezioni_vive, 2, "attiva e principio restano");
  assert.equal(p.lezioni_decadute, 1);
  assert.deepEqual(
    p.nuovo.lezioni.map((l) => l.id),
    ["a", "c"],
    "solo la decaduta esce",
  );
  assert.equal(p.chiavi_servizio, 2, "_cosa_e si tiene: è la spiegazione del file, non rumore");
  assert.ok(p.nuovo._cosa_e, "…e infatti resta");
});

prova("il potatore dice di NO quando non basta, invece di potare il vivo", () => {
  const grosso = { lezioni: Array.from({ length: 50 }, (_, i) => ({ id: `x${i}`, stato: "attiva", testo: "z".repeat(1000) })) };
  const p = P.pianoPotatura(grosso, 1000);
  assert.equal(p.entra, false);
  assert.ok(p.residuo > 0, "deve dire di quanto sfora");
  assert.equal(p.lezioni_vive, 50, "e non deve aver toccato niente di vivo");
});

prova("il potatore gira davvero e non scrive niente senza --applica", () => {
  const prima = leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");
  execFileSync("node", [join(REPO, "cervello/pota-apprendimento.mjs"), "--json"], { cwd: REPO, encoding: "utf8" });
  assert.equal(leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json"), prima, "una lettura non deve scrivere");
});

prova("ciò che è stato tolto resta consultabile: la potatura non è una sparizione", () => {
  const st = JSON.parse(leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento-potato.json"));
  assert.ok(Array.isArray(st.potature) && st.potature.length > 0, "serve lo storico di cosa è stato tolto");
  const ultima = st.potature[0];
  assert.ok(ultima.byte_prima > ultima.byte_dopo, "e deve dire quanto ha recuperato");
  assert.ok(ultima.quando, "con la data");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
