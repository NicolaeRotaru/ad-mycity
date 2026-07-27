// AR-330 — un difetto non deve poter nascere già chiuso (node --test, nessuna rete).
//
// Il fatto: 27/7 ore 12:14 merge della radiografia con 173 difetti; 12:15, SESSANTA SECONDI dopo, il
// commit automatico ne chiude 91 — il 53%, di cui 17 bloccanti. Che siano false si prova senza aprire
// un file: fra le 09:40 (nascita) e le 12:15 (chiusura) su main non era atterrato nessun fix.
//
// Il meccanismo: le 91 verifiche erano soddisfatte NELL'ISTANTE IN CUI IL DIFETTO NASCEVA, perché
// descrivevano il BUG invece del FIX. I due casi veri, usati qui sotto come banco di prova:
//   AR-227 → `registraFirma(n, "nicola")` presente:true  = «la riga bacata c'è»
//   AR-218 → `Escape` presente:false                      = «il tasto Esc manca»
//
// Qui si eseguono le funzioni VERE di cervello/prove-regole.mjs. I casi marcati «il caso che ha
// rotto» riproducono quei due difetti con i loro pattern reali: sono il metro che distingue una
// prova da una descrizione del sintomo.

import { test } from "node:test";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const QUI = dirname(fileURLToPath(import.meta.url));
const { nataGiaSoddisfatta, chiusuraAmmessa, provaSoddisfatta, patternTrovato, provaControllabile, istanteNascita } =
  await import(join(QUI, "..", "prove-regole.mjs"));

// ── ① la guardia della nascita ───────────────────────────────────────────────
test("il caso che ha rotto: AR-227 — il pattern descrive la riga BACATA", () => {
  // Il file alla nascita conteneva la riga sbagliata, e la prova diceva «risolto quando c'è».
  const allaNascita = 'function x(){ registraFirma(n, "nicola"); }';
  const v = { file: "cervello/consenso-azione.mjs", pattern: 'registraFirma\\(n, "nicola"\\)', presente: true };
  const r = nataGiaSoddisfatta(v, allaNascita);
  assert.equal(r.esito, "sospetta", "questa è una delle 91: doveva essere fermata alla nascita");
  assert.match(r.motivo, /GIÀ soddisfatta/);
});

test("il caso che ha rotto: AR-218 — il pattern descrive il tasto MANCANTE", () => {
  // `Escape` presente:false = «risolto quando Escape non c'è». Ma Escape non c'era già: vera subito.
  const allaNascita = "export default function Page(){ /* nessun gestore di tastiera */ }";
  const v = { file: "pannello/src/app/page.tsx", pattern: "Escape", presente: false };
  assert.equal(nataGiaSoddisfatta(v, allaNascita).esito, "sospetta");
});

test("una prova scritta bene passa: cita qualcosa che esisterà SOLO col fix", () => {
  const allaNascita = "export default function Page(){ /* nessun gestore di tastiera */ }";
  const v = { file: "pannello/src/app/page.tsx", pattern: "eTastoChiudi", presente: true };
  const r = nataGiaSoddisfatta(v, allaNascita);
  assert.equal(r.esito, "onesta", "alla nascita non c'era: quando ci sarà, testimonierà il fix");
});

test("anche il verso NEGATIVO può essere onesto, se la stringa del bug c'era davvero", () => {
  // «risolto quando questa riga sparisce» è legittimo — purché la riga alla nascita CI FOSSE.
  const allaNascita = "const x = eval(codiceUtente);";
  const v = { file: "a.mjs", pattern: "eval\\(", presente: false };
  assert.equal(nataGiaSoddisfatta(v, allaNascita).esito, "onesta");
});

test("un guardiano che non sa misurare dice «cieco», non «verde» né «bocciato»", () => {
  // AR-322: file nato dopo il difetto, storia troncata, clone superficiale. Accusare sarebbe falso;
  // assolvere sarebbe peggio — è così che un cancello diventa decorativo.
  const r = nataGiaSoddisfatta({ file: "nuovo.mjs", pattern: "x", presente: true }, null);
  assert.equal(r.esito, "cieco");
  assert.match(r.motivo, /impossibile ricostruire/);
});

test("le prove comportamentali e umane non passano di qui", () => {
  assert.equal(nataGiaSoddisfatta({ comando: "node cervello/test/x.test.mjs" }, "qualsiasi").esito, "nonApplicabile");
  assert.equal(nataGiaSoddisfatta({ tipo: "umano" }, "qualsiasi").esito, "nonApplicabile");
  assert.equal(provaControllabile({ comando: "node cervello/x.mjs" }), false);
  assert.equal(provaControllabile({ file: "a.mjs", pattern: "x" }), true);
  assert.equal(provaControllabile(undefined), false, "difetto senza prova: niente da controllare");
});

// ── ② la guardia della chiusura ──────────────────────────────────────────────
test("il caso che ha rotto: prova soddisfatta ma NESSUNA modifica al file dalla nascita", () => {
  // È la firma esatta delle 12:15: fra le 09:40 e la chiusura su main non era atterrato un fix.
  const r = chiusuraAmmessa({
    verifica: { file: "pannello/src/app/page.tsx", pattern: "Escape", presente: false },
    nato: "2026-07-27",
    fileCambiatoDallaNascita: false,
  });
  assert.equal(r.ammessa, false, "una chiusura senza una modifica non è una chiusura");
  assert.match(r.motivo, /NON è mai cambiato/);
});

test("se il file è cambiato davvero, la chiusura passa", () => {
  const r = chiusuraAmmessa({
    verifica: { file: "pannello/src/app/page.tsx", pattern: "eTastoChiudi", presente: true },
    nato: "2026-07-27",
    fileCambiatoDallaNascita: true,
  });
  assert.equal(r.ammessa, true);
});

test("le prove comportamentali non vengono bloccate dalla storia del file", () => {
  // Un guardiano che esce 0 misura il PRESENTE, e il file citato spesso non è quello toccato dal fix.
  // Bloccarle qui punirebbe l'unica forma di prova che vogliamo incoraggiare.
  const r = chiusuraAmmessa({
    verifica: { comando: "node cervello/test/memoria-json.test.mjs" },
    nato: "2026-07-27",
    fileCambiatoDallaNascita: false,
  });
  assert.equal(r.ammessa, true);
});

test("se git non risponde si lascia passare, e lo si dice", () => {
  // Scelta opposta alla ①, e voluta: questa guardia gira su OGNI chiusura. Fallire chiuso su un repo
  // con la storia troncata (i cloni dei cloud agent lo sono) bloccherebbe le chiusure per sempre.
  const r = chiusuraAmmessa({ verifica: { file: "a.mjs", pattern: "x" }, nato: "2026-07-27", fileCambiatoDallaNascita: null });
  assert.equal(r.ammessa, true);
  assert.match(r.motivo, /non leggibile|non corroborata/);
});

test("un difetto senza data di nascita non si può datare: passa", () => {
  assert.equal(chiusuraAmmessa({ verifica: { file: "a.mjs", pattern: "x" }, nato: "", fileCambiatoDallaNascita: false }).ammessa, true);
});

// ── la data: il difetto trovato NEL guardiano, prima di consegnarlo ──────────
//
// In cantiere `nato` è quasi sempre una data secca. Passata così a git, l'approxidate riempie i campi
// mancanti con quelli CORRENTI: `--before=2026-07-27` lanciato alle 18:20 significa «prima delle
// 18:20 di oggi». Effetto sulla guardia ①: per ogni difetto nato oggi la «fotografia alla nascita»
// era il file di ADESSO, coi fix già dentro — e il guardiano dichiarava tutto onesto perché non
// stava guardando il passato. Effetto sulla guardia ②: ogni file modificato oggi risultava «mai
// cambiato», e chiusure legittime venivano rifiutate.
//
// Un guardiano verde perché cieco è peggio di nessun guardiano: è la stessa famiglia del difetto che
// deve sorvegliare. Questi casi esistono perché non ricapiti, e perché la normalizzazione resti UNA
// (la seconda copia in auto-fix l'ho scritta io dopo aver corretto la prima — l'ultimo test qui sotto
// è la rete contro proprio quello).

test("il caso che ha rotto: la data secca diventa mezzanotte, non «adesso»", () => {
  assert.equal(istanteNascita("2026-07-27"), "2026-07-27T00:00:00");
});

test("l'ora scritta a mano si rispetta, i secondi si completano", () => {
  assert.equal(istanteNascita("2026-07-27 09:40"), "2026-07-27T09:40:00");
  assert.equal(istanteNascita("2026-07-27T09:40:15"), "2026-07-27T09:40:15");
  assert.equal(istanteNascita("2026-07-27 09:40:15"), "2026-07-27T09:40:15");
});

test("l'istante prodotto non ha MAI campi da indovinare", () => {
  // È l'invariante che conta: se git riceve una stringa incompleta ci mette del suo.
  for (const nato of ["2026-07-27", "2026-07-27 09:40", "2026-01-01T23:59:59", "2026-07-27 09:40 (radiografia)"]) {
    assert.match(istanteNascita(nato), /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, `incompleto per «${nato}»`);
  }
});

test("una data che non è una data non diventa un istante inventato", () => {
  for (const storto of ["", "  ", "ieri", "27/07/2026", null, undefined, 42]) {
    assert.equal(istanteNascita(storto), null, `«${storto}» non è una data ISO`);
  }
});

// ── il metro condiviso ───────────────────────────────────────────────────────
test("regex OPPURE testo letterale: il caso AR-151 continua a funzionare", () => {
  // `id=eq.$id&stato=eq.in_attesa` compilato come regex non può MAI matchare (quel `$` in mezzo
  // asserisce fine-stringa). Il confronto letterale onora l'intento «nel file ci dev'essere questo».
  const testo = 'const url = base + "?id=eq.$id&stato=eq.in_attesa";';
  assert.equal(patternTrovato("id=eq.$id&stato=eq.in_attesa", testo), true);
  assert.equal(patternTrovato("Escape|Esc", "premi Escape"), true, "e le regex vere restano regex");
  assert.equal(patternTrovato("", "qualsiasi"), false, "pattern vuoto non matcha tutto");
});

test("`presente` vale true per default, come in cantiere", () => {
  assert.equal(provaSoddisfatta({ pattern: "x" }, "abc x def"), true);
  assert.equal(provaSoddisfatta({ pattern: "x", presente: false }, "abc x def"), false);
  assert.equal(provaSoddisfatta({ pattern: "x", presente: false }, "abc def"), true);
});

// ── il metro non è divergente fra i due che lo usano ─────────────────────────
test("auto-fix e il guardiano usano LA STESSA funzione di confronto", async () => {
  // Il difetto originale nasce da prove valutate con criteri diversi in posti diversi. Se auto-fix
  // si riscrivesse il match in casa, una prova potrebbe essere «soddisfatta» per uno e no per l'altro.
  const { readFileSync } = await import("node:fs");
  const src = readFileSync(join(QUI, "..", "auto-fix.mjs"), "utf8");
  assert.match(src, /patternTrovato/, "auto-fix deve importare il confronto condiviso");
  assert.doesNotMatch(src, /new RegExp\(v\.pattern\)/, "non deve esistere una seconda copia del match");
  assert.match(src, /chiusuraAmmessa/, "la guardia ② dev'essere agganciata alla chiusura");
});

test("NESSUNO dei due passa una data grezza a git: la normalizzazione è una sola", () => {
  // Il difetto della data l'ho corretto in prove-oneste e l'ho lasciato in auto-fix — «il fix
  // applicato a una copia sola», commesso sul lotto che serve a impedirlo. Questo è il cancello.
  const { readFileSync } = require("node:fs");
  for (const f of ["auto-fix.mjs", "prove-oneste.mjs"]) {
    const src = readFileSync(join(QUI, "..", f), "utf8");
    assert.match(src, /istanteNascita/, `${f} deve normalizzare la data prima di darla a git`);
    assert.doesNotMatch(src, /--(since|before)=\$\{(nato|d\.nato)\}/, `${f}: data grezza passata a git`);
  }
});
