#!/usr/bin/env node
// AR-449 — IL FILE CHE CRESCE E SPARISCE DALLA CABINA.
//
// Il caso vero, con la data: il 2026-07-30 alle 02:03 `cantiere-difetti.json` ha superato
// 1.048.576 byte — il tetto oltre il quale la Contents API di GitHub NON serve il contenuto inline:
// torna `content` vuoto con `size` e `sha` valorizzati. Da quel momento, per dodici ore, la scheda
// Radiografia ha mostrato «0 aperti · 0 chiusi · Nessun difetto aperto 👍» mentre nel cantiere
// c'erano 162 difetti aperti.
//
// Il caso era GIÀ riconosciuto nel codice (AR-254, stato `troppo-grande`): mancava la via d'uscita.
// Sapere di non sapere, senza poterci fare niente, resta un buco.
//
// Qui si prova la DECISIONE, che è la parte che sbagliava: cosa fare davanti a un payload della
// Contents API. È pura, quindi si esegue davvero, senza rete e senza finzioni.
//   inline → il contenuto c'è
//   blob   → il contenuto non c'è ma il file sì: c'è una seconda strada, e va presa
//   assente → il file non c'è davvero
//   troppo-grande → il file c'è ed è fuori portata: si DICHIARA, non si spaccia per assente
//
// Il punto che questa prova difende è uno solo: «grande» non deve mai diventare «assente», perché
// «assente» a valle diventa lista vuota, e lista vuota a video diventa un pollice in su.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { comeLeggere, comeServire } = await import(join(REPO, "pannello/src/lib/esito-lettura.ts"));

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

// ── La decisione ────────────────────────────────────────────────────────────

prova("contenuto presente → si legge inline, nessuna seconda strada", () => {
  const s = comeLeggere({ content: "eyJhIjoxfQ==", size: 7 });
  assert.equal(s.via, "inline");
});

prova("IL CASO DEL 30/7: contenuto vuoto ma size 1.081.370 → si chiede il blob, NON è assente", () => {
  const s = comeLeggere({ content: "", size: 1081370, sha: "abc123" });
  assert.equal(s.via, "blob", "un file da 1,08 MB esiste: dichiararlo assente è la bugia che ha causato il 👍");
  assert.equal(s.sha, "abc123", "la seconda strada usa lo sha che la Contents API ci ha appena dato");
});

prova("file che non c'è davvero (size 0) → assente, e resta un'informazione vera", () => {
  assert.equal(comeLeggere({ content: "", size: 0 }).via, "assente");
  assert.equal(comeLeggere({}).via, "assente");
});

prova("grande ma senza sha → «troppo-grande» dichiarato, mai «assente»", () => {
  const s = comeLeggere({ content: "", size: 2_000_000, sha: "" });
  assert.equal(s.via, "troppo-grande");
  assert.match(String(s.motivo), /2\.000\.000/, "deve dire QUANTO pesa: un numero si verifica, un aggettivo no");
});

// ── Il tetto di casa non deve rimbalzare ciò che siamo riusciti a scaricare ──

prova("un file da 1,08 MB passa il nostro tetto interno dopo essere arrivato dal blob", () => {
  // La trappola da evitare: aprire la seconda strada e lasciare il tetto interno a 1 MiB avrebbe
  // fatto rimbalzare in casa proprio i file appena scaricati.
  const sorgente = readFileSync(join(REPO, "pannello/src/lib/obsidian.ts"), "utf-8");
  const m = sorgente.match(/const MAX_LETTURA = ([^;]+);/);
  assert.ok(m, "MAX_LETTURA deve esistere in obsidian.ts");
  const tetto = Function(`"use strict";return (${m[1]})`)();
  assert.ok(tetto > 1_081_370, `il tetto interno (${tetto}) deve stare sopra il file che oggi ci serve leggere`);
  assert.equal(comeServire({ percorso: "cantiere-difetti.json", lunghezza: 1_081_370, tetto }).azione, "intero");
});

prova("un JSON davvero enorme non si tronca: si dichiara", () => {
  // Un JSON tagliato è illeggibile, e l'illeggibile a valle torna a essere «non c'è niente».
  const v = comeServire({ percorso: "gigante.json", lunghezza: 99 * 1_048_576, tetto: 8 * 1_048_576 });
  assert.equal(v.azione, "troppo-grande");
});

// ── L'I/O è cablato davvero (la decisione da sola non basta) ─────────────────

prova("obsidian.ts usa la decisione e ha la seconda strada verso la Blobs API", () => {
  const s = readFileSync(join(REPO, "pannello/src/lib/obsidian.ts"), "utf-8");
  assert.match(s, /comeLeggere\(\{/, "la decisione dev'essere quella condivisa, non una copia locale");
  assert.match(s, /git\/blobs\//, "senza la chiamata ai blob la decisione «blob» non porta da nessuna parte");
  // Le due copie storiche (leggiNota e readNote) devono passare dalla stessa funzione: è la malattia
  // che AR-254 avvisava di non ripetere («il fix applicato a una copia sola»).
  const usi = s.match(/testoDaContents\(/g) || [];
  assert.ok(usi.length >= 3, `entrambi i lettori devono attraversare testoDaContents (trovati ${usi.length} usi)`);
});

prova("la rotta della radiografia non trasforma più «non letto» in zero", () => {
  const s = readFileSync(join(REPO, "pannello/src/app/api/memoria/auto-radiografia/route.ts"), "utf-8");
  assert.match(s, /cantiere_letto/, "l'esito della lettura deve viaggiare col dato");
  assert.match(s, /cantiereLetto \? .*length : null|cantiereLetto/, "i conteggi devono poter essere null");
  assert.match(s, /non_letti/, "chi non è stato letto va detto, non taciuto");
});

prova("la scheda mostra «non ho potuto leggere» invece del pollice in su", () => {
  const s = readFileSync(join(REPO, "pannello/src/components/cervello/RadiografiaDiSe.tsx"), "utf-8");
  assert.match(s, /Non ho potuto leggere il cantiere|cantiereLetto === false/, "serve il ramo grigio");
  // ⚠️ Il pollice in su si cerca per FORMA, non per frase esatta. La prima versione di questo caso
  // cercava la stringa «Nessun difetto aperto. 👍» e nel lotto 44 è diventata rossa senza che il
  // comportamento cambiasse: il conto era passato da «aperti» a «da fare» (i tre stati vivi invece
  // di uno) e la scritta era stata rinominata di conseguenza. La cura giusta era proprio quella, e
  // la prova puniva chi l'aveva fatta. Una prova agganciata alle parole misura il testo; qui serve
  // misurare l'ORDINE dei due rami, che è la cosa che il difetto rompeva.
  // ⚠️ Il ramo grigio si cerca dal SUO TESTO, non dalla variabile. La prima versione confrontava
  // `indexOf("cantiereLetto === false")` col pollice in su, ma quella stringa compare già a inizio
  // file dentro il calcolo di `daFare`: l'indice era sempre piccolo e il confronto sempre vero.
  // Cioè un caso che non poteva fallire — scoperto spostando il pollice in su davanti al ramo
  // grigio e vedendo il verde restare. Qui si guarda la scritta che AR-449 ha messo a video.
  // E si guarda DENTRO la scheda del cantiere, non nell'intero file: la frase del ramo grigio
  // compare anche prima, in un'altra scheda, e un confronto sull'intero file era vero comunque.
  // Due versioni di questo caso di fila non potevano fallire — l'ho visto solo spostando davvero
  // il pollice in su davanti al ramo grigio e trovando ancora verde.
  const inizioScheda = s.indexOf("{/* === CANTIERE === */}");
  assert.ok(inizioScheda !== -1, "senza l'inizio della scheda non so dove guardare");
  const scheda = s.slice(inizioScheda);
  const grigio = scheda.indexOf("Non ho potuto leggere il cantiere");
  const pollice = scheda.match(/Nessun difetto [^.]*\. 👍/);
  const i1 = pollice ? scheda.indexOf(pollice[0]) : -1;
  assert.ok(i1 !== -1, "il pollice in su deve esistere: senza, questo caso non sta misurando niente");
  assert.ok(grigio !== -1, "serve la scritta del ramo grigio dentro la scheda del cantiere");
  assert.ok(grigio < i1, "il ramo «non letto» deve venire PRIMA del pollice in su");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
