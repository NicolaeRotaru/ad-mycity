#!/usr/bin/env node
// AR-688 — il ponte verso la Cabina diventa una SECONDA CASA dello stesso indirizzo, e nessuno se ne accorge.
//
// LA STORIA, in tre righe. `cervello/ponte-cabina.json` è nato perché la visita, fuori dal VPS, non
// sapeva dove fosse la Cabina (AR-438). Con lo stesso lavoro quell'indirizzo ha ricevuto una casa
// vera: il registro dei fatti, chiave `cabina.url`, che `urlCabina` interroga PRIMA del ponte. Dal
// giorno in cui quel fatto viene registrato, il ponte non è più una rete: è una copia — ed è
// esattamente la forma in cui un valore vecchio sopravvive in un file mentre la macchina crede di
// averlo aggiornato (AR-102).
//
// COSA HO MISURATO OGGI, prima di scrivere: nel registro ci sono 37 fatti e **nessuno** si chiama
// `cabina.url`. Quindi oggi il ponte è ancora l'unica risposta per una sessione cloud, e cancellarlo
// adesso — come chiedeva la scheda — non chiuderebbe il difetto: spegnerebbe due controlli della
// visita. La scheda diceva il vero sul PERCHÉ e sbagliava il QUANDO.
//
// PERCHÉ ALLORA QUESTO FILE. Il difetto vero non è il file di troppo: è che **il giorno in cui il
// fatto arriva, nessuno lo saprà**. Una nota nel cantiere non lo dice a nessuno; questa prova sì.
// Da qui in avanti la doppia casa non può nascere in silenzio: chi registra `cabina.url` trova
// subito un rosso che gli dice cosa cancellare. E l'altra direzione è chiusa a chiave allo stesso
// modo: chi cancella il ponte prima del tempo trova un rosso uguale e contrario.
//
// COSA PROVA QUESTO FILE:
//   ① quando il fatto c'è, il ponte è già scavalcato: non è una rete, è peso morto (provato
//      eseguendo `urlCabina` su una radice finta con dentro tutti e due);
//   ② sul repo VERO: fatto presente ⇒ il ponte NON deve esistere. È la trappola.
//   ③ sul repo VERO: fatto assente ⇒ il ponte DEVE esistere, e deve rispondere davvero;
//   ④ finché vive, il ponte porta un indirizzo vero, non una stringa vuota che sembra una risposta.
//
// NON-VACUITÀ (verificata rompendo il fix apposta): togliendo da `urlCabina` la lettura del registro
// il caso ① diventa ROSSO, perché il ponte torna a rispondere anche quando la casa vera c'è — che è
// il difetto in persona. Verificata anche l'altra metà: creando a mano il fatto `cabina.url` in una
// copia del registro, il caso ② diventa ROSSO col messaggio che dice cosa cancellare.

import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { urlCabina } from "../salute.mjs";

const REPO = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
// I due percorsi VERI. Si possono spostare da fuori solo per una ragione: far vedere che la trappola
// scatta davvero, senza scrivere nel registro dei fatti — che è memoria condivisa e non si tocca per
// provare una cosa. Senza quelle due variabili (cioè sempre, quando gira la suite) si guarda il vero.
const PONTE = process.env.PONTE_TEST_PONTE || join(REPO, "cervello/ponte-cabina.json");
const REGISTRO = process.env.PONTE_TEST_REGISTRO || join(REPO, "MyCity-Vault/90-Memoria-AI/registro-fatti.json");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** Il fatto è nel registro? Se il registro non si legge, NON si risponde «no»: si dichiara. */
function fattoCabina() {
  let testo;
  try {
    testo = readFileSync(REGISTRO, "utf8");
  } catch (e) {
    return { letto: false, presente: null, motivo: `non ho potuto leggere il registro dei fatti: ${e?.code || e?.message}` };
  }
  let j;
  try {
    j = JSON.parse(testo);
  } catch (e) {
    return { letto: false, presente: null, motivo: `il registro dei fatti non è JSON valido: ${e?.message}` };
  }
  const fatti = j?.fatti ?? j;
  const chiavi = Array.isArray(fatti) ? fatti.map((f) => f?.id) : Object.keys(fatti || {});
  return { letto: true, presente: chiavi.includes("cabina.url"), motivo: null };
}

/** Una radice finta: nessun caso di questo file scrive nel repo vero. */
function radiceFinta({ fatto = null, ponte = null } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "ponte-cabina-"));
  mkdirSync(join(dir, "MyCity-Vault/90-Memoria-AI"), { recursive: true });
  mkdirSync(join(dir, "cervello"), { recursive: true });
  // Stessa forma del registro vero: una LISTA di fatti con `id` e `valore` (non una mappa).
  const fatti = fatto ? [{ id: "cabina.url", valore: fatto }] : [];
  writeFileSync(join(dir, "MyCity-Vault/90-Memoria-AI/registro-fatti.json"), JSON.stringify({ fatti }));
  if (ponte) writeFileSync(join(dir, "cervello/ponte-cabina.json"), JSON.stringify({ pannello_url: ponte }));
  return dir;
}

// ── ① Quando il fatto c'è, il ponte è già scavalcato ─────────────────────────────────────────────

prova("① col fatto nel registro il ponte non risponde più: da lì in poi è una copia, non una rete", () => {
  const dir = radiceFinta({ fatto: "https://vera.example", ponte: "https://vecchia.example" });
  const r = urlCabina({}, dir);
  assert.ok(r, "con il fatto registrato l'indirizzo si deve trovare");
  assert.equal(r.url, "https://vera.example", "se rispondesse il ponte, la Cabina verrebbe cercata all'indirizzo vecchio");
  assert.match(r.fonte, /registro-fatti/);
});

prova("① senza il fatto, il ponte è l'unica risposta di una sessione cloud — e risponde", () => {
  const dir = radiceFinta({ ponte: "https://ad-mycity.vercel.app/" });
  const r = urlCabina({}, dir);
  assert.equal(r?.url, "https://ad-mycity.vercel.app", "la barra finale si toglie: due scritture dello stesso indirizzo sono due indirizzi");
  assert.equal(r.fonte, "ponte-cabina.json");
});

// ── ② e ③ LA TRAPPOLA, sul repo vero ─────────────────────────────────────────────────────────────

prova("② se il fatto cabina.url è nel registro, il ponte NON deve più esistere", () => {
  const f = fattoCabina();
  assert.equal(f.letto, true, f.motivo || "il registro dei fatti non si è potuto leggere: senza, questa trappola non misura niente");
  if (!f.presente) return; // oggi è così: il ponte è legittimo, e il caso ③ lo pretende
  assert.equal(
    existsSync(PONTE),
    false,
    "il fatto cabina.url è nel registro E cervello/ponte-cabina.json esiste ancora: sono due case per lo stesso indirizzo. " +
      "Cancella cervello/ponte-cabina.json e togli il terzo ramo da urlCabina in cervello/salute.mjs (con il caso che lo copre in cervello/test/cabina-indirizzo.test.mjs)."
  );
});

prova("③ finché il fatto NON c'è, cancellare il ponte non è una pulizia: è spegnere la visita", () => {
  const f = fattoCabina();
  assert.equal(f.letto, true, f.motivo || "registro non letto");
  if (f.presente) return; // allora comanda il caso ②
  assert.equal(
    existsSync(PONTE),
    true,
    "manca sia il fatto cabina.url nel registro sia cervello/ponte-cabina.json: da una sessione cloud la macchina " +
      "non sa più a quale indirizzo sta la Cabina, e due controlli della visita tornano ⚪."
  );
});

// ── ④ Un indirizzo vero, non una stringa che sembra una risposta ─────────────────────────────────

prova("④ finché vive, il ponte porta un indirizzo vero — un campo vuoto sarebbe un ⚪ travestito da ✅", () => {
  if (!existsSync(PONTE)) return; // già cancellato: comanda il caso ②
  const j = JSON.parse(readFileSync(PONTE, "utf8"));
  assert.match(String(j.pannello_url || ""), /^https:\/\/[^\s/]+/, "l'indirizzo della Cabina deve essere un https vero");
  assert.ok(String(j.verificato || "").length > 10, "un indirizzo senza la data in cui è stato verificato invecchia in silenzio");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
