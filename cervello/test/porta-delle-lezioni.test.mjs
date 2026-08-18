#!/usr/bin/env node
// AR-651 — le lezioni non avevano nessun punto di scrittura nel codice: l'id si coniava a mano.
//
// LA RADICE. Cercando `lezioni.push` in tutto il repo si trovava zero risultati. Cinquecentodiciotto
// lezioni scritte e nessuno script che ne scriva una: a scriverle era l'LLM in sessione, aprendo il
// file e scegliendo il numero a occhio. Da lì i quattro doppioni di AR-580 — due lezioni diverse con
// lo stesso identificativo, e alla prima unione dei rami una delle due sparisce mentre il conteggio
// resta identico, quindi non se ne accorge nessuno.
//
// PERCHÉ IL TAPPO NON BASTAVA. Il guardiano che segnala gli id doppi arriva DOPO: trova il danno,
// non lo impedisce. Finché coniare un numero è un gesto a mano, l'errore non è un incidente — è la
// forma normale del lavoro, e si ripete ogni volta che due sessioni scrivono lo stesso giorno senza
// vedersi. La cura è togliere il gesto a mano: una porta che il numero lo chiede.
//
// COSA PROVA QUESTO FILE:
//   ① il numero si prende dal PIÙ ALTO del giorno, non da quante lezioni ci sono — è precisamente
//      l'errore che riconia un numero già usato quando una sessione ne ha saltato uno;
//   ② l'id coniato non è MAI uno già preso, nemmeno se la numerazione ha buchi o è disordinata;
//   ③ un archivio che non si legge non diventa «zero lezioni»: si esce ⚪ e non si scrive niente
//      (scrivere lì vorrebbe dire coniare `-01`, cioè il numero più sicuramente già preso);
//   ④ una lezione senza fonte, testo o regola viene rifiutata, e una correzione di Nicola senza
//      freno viene dichiarata invece di passare in silenzio;
//   ⑤ inserire un id già presente è RIFIUTATO, non sovrascritto: è AR-580 in persona;
//   ⑥ ESEGUENDO la porta due volte di fila su una copia dell'archivio VERO (518 lezioni), escono due
//      id diversi e nessuno dei due collide — ed è la prova che sostituisce il gesto a mano;
//   ⑦ la porta conserva l'indentazione del file: questo archivio ha UN solo spazio, e riscriverlo a
//      due lo riscrive tutto — quattro giorni di macchina ferma, la volta scorsa.
//
// NON-VACUITÀ (verificata rompendo il fix apposta): in `cervello/lezione-nuova.mjs`, coniando dal
// numero di lezioni invece che dal massimo del giorno (`if (Number.isFinite(n) && n > massimo)` →
// `if (false)`), i casi ① ② ⑥ diventano ROSSI — ed è esattamente il modo in cui il gesto a mano
// generava i doppioni.
//
// ⚠️ Nessun caso scrive nella memoria vera: l'archivio si copia in una cartella usa-e-getta e il
// percorso si inietta con APPRENDIMENTO_FILE.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ARCHIVIO, campiMancanti, caricaArchivio, componiLezione, coniaId, formaId, inserisci } from "../lezione-nuova.mjs";
import { giornoPiacenza } from "../ora-piacenza.mjs";

const REPO = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const PORTA = join(REPO, "cervello/lezione-nuova.mjs");
const VERO = join(REPO, ARCHIVIO);

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

const tempo = () => mkdtempSync(join(tmpdir(), "porta-lezioni-"));
const L = (id) => ({ id, data: "2026-08-14 10:00", fonte: "prova", testo: "t", regola: "r" });

/** Lancia la porta vera come la lancerebbe una sessione, su un archivio usa-e-getta. */
function lanciaPorta(file, argomenti) {
  try {
    const out = execFileSync("node", [PORTA, ...argomenti], {
      encoding: "utf8",
      env: { ...process.env, APPRENDIMENTO_FILE: file },
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { rc: 0, out: out.trim(), err: "" };
  } catch (e) {
    return { rc: e.status ?? -1, out: String(e.stdout || "").trim(), err: String(e.stderr || "").trim() };
  }
}

// ── ① e ② Il numero si chiede, non si sceglie ────────────────────────────────────────────────────

prova("① col buco nella numerazione si riparte dal PIÙ ALTO, non da quante ce ne sono", () => {
  // Il gesto a mano faceva così: «ce ne sono due, quindi la prossima è la 03». Ma la 03 esiste già.
  const lezioni = [L("L-2026-0814-01"), L("L-2026-0814-03")];
  assert.equal(coniaId(lezioni, "2026-08-14").id, "L-2026-0814-04");
});

prova("① un giorno mai usato parte da 01, e la forma è quella delle 518 che ci sono già", () => {
  assert.equal(coniaId([L("L-2026-0813-09")], "2026-08-14").id, "L-2026-0814-01");
  assert.equal(formaId("2026-08-14", 7), "L-2026-0814-07");
});

prova("② l'id coniato non è MAI uno già preso, nemmeno con la lista in disordine", () => {
  const lezioni = [L("L-2026-0814-05"), L("L-2026-0814-02"), L("L-2026-0814-11"), L("L-2026-0810-99")];
  const { id } = coniaId(lezioni, "2026-08-14");
  assert.equal(id, "L-2026-0814-12");
  assert.equal(lezioni.some((l) => l.id === id), false);
});

prova("② sull'archivio VERO l'id proposto non collide con nessuna delle lezioni scritte finora", () => {
  const a = caricaArchivio(VERO);
  assert.equal(a.letto, true, a.motivo || "l'archivio vero non si è potuto leggere");
  assert.ok(a.archivio.lezioni.length > 400, `mi aspettavo centinaia di lezioni, ne ho lette ${a.archivio.lezioni.length}`);
  const { id } = coniaId(a.archivio.lezioni, "2026-08-14");
  assert.equal(a.archivio.lezioni.some((l) => l.id === id), false, `${id} è già di un'altra lezione`);
});

// ── ③ Un archivio non letto non diventa zero ─────────────────────────────────────────────────────

prova("③ senza un elenco NON si conia: un numero al buio è il numero già preso", () => {
  assert.equal(coniaId(null, "2026-08-14").id, null);
  assert.match(coniaId(null, "2026-08-14").motivo, /al buio/);
  assert.equal(coniaId([], "non-un-giorno").id, null);
});

prova("③ la porta su un archivio illeggibile esce ⚪ (2) e NON scrive niente", () => {
  const dir = tempo();
  const file = join(dir, "rotto.json");
  writeFileSync(file, "{ questo non è json");
  const prima = readFileSync(file, "utf8");
  const r = lanciaPorta(file, ["--fonte", "prova", "--testo", "t", "--regola", "r"]);
  assert.equal(r.rc, 2, "un archivio illeggibile non è un archivio vuoto");
  assert.match(r.err, /NON ho scritto niente/);
  assert.equal(readFileSync(file, "utf8"), prima, "il file è stato toccato lo stesso");
});

// ── ④ Una lezione che non è una lezione viene rifiutata ──────────────────────────────────────────

prova("④ senza fonte, testo o regola la porta rifiuta e dice cosa manca", () => {
  assert.deepEqual(campiMancanti({ fonte: "x" }), ["testo", "regola"]);
  const r = componiLezione({ fonte: "x", testo: "  " }, []);
  assert.equal(r.ok, false);
  assert.match(r.motivo, /testo/);
});

prova("④ una correzione di Nicola senza freno viene DICHIARATA, non lasciata passare muta", () => {
  const r = componiLezione({ fonte: "correzione di Nicola", testo: "t", regola: "r" }, []);
  assert.equal(r.ok, true, "non si blocca: ci sono lezioni senza un freno scrivibile");
  assert.match(r.avvisi.join(" "), /debito dichiarato/);
  const conGate = componiLezione({ fonte: "correzione di Nicola", testo: "t", regola: "r", gate: "node cervello/test/x.test.mjs" }, []);
  assert.deepEqual(conGate.avvisi, []);
  assert.equal(conGate.lezione.gate, "node cervello/test/x.test.mjs");
});

// ── ⑤ Un id già usato si rifiuta, non si sovrascrive ─────────────────────────────────────────────

prova("⑤ inserire un id già presente è rifiutato: è AR-580 in persona", () => {
  const archivio = { lezioni: [L("L-2026-0814-01")] };
  const r = inserisci(archivio, L("L-2026-0814-01"));
  assert.equal(r.ok, false);
  assert.match(r.motivo, /già usato/);
  assert.equal(archivio.lezioni.length, 1, "l'archivio di partenza non si tocca");
});

prova("⑤ un inserimento buono non modifica l'archivio di partenza, ne restituisce uno nuovo", () => {
  const archivio = { lezioni: [L("L-2026-0814-01")] };
  const r = inserisci(archivio, L("L-2026-0814-02"));
  assert.equal(r.ok, true);
  assert.equal(r.archivio.lezioni.length, 2);
  assert.equal(archivio.lezioni.length, 1);
  assert.match(r.archivio.aggiornato, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, "ogni traccia in memoria porta anche l'ora");
});

// ── ⑥ e ⑦ La porta vera, su una copia dell'archivio vero ─────────────────────────────────────────

prova("⑥ due lezioni scritte di fila prendono due numeri diversi, e nessuno è già preso", () => {
  const dir = tempo();
  const file = join(dir, "apprendimento.json");
  copyFileSync(VERO, file);
  // Semino il buco che il gesto a mano sbagliava sempre: oggi esiste già la settima lezione del
  // giorno. Chi conta invece di guardare il massimo riparte da uno e riusa un numero già scritto.
  const dentro = JSON.parse(readFileSync(file, "utf8"));
  const oggi = giornoPiacenza();
  dentro.lezioni.push({ ...L(formaId(oggi, 7)), data: `${oggi} 09:00` });
  writeFileSync(file, JSON.stringify(dentro, null, 1) + "\n");
  const quante = dentro.lezioni.length;

  const a = lanciaPorta(file, ["--fonte", "prova", "--testo", "prima", "--regola", "r1"]);
  const b = lanciaPorta(file, ["--fonte", "prova", "--testo", "seconda", "--regola", "r2"]);
  assert.equal(a.rc, 0, a.err);
  assert.equal(b.rc, 0, b.err);
  assert.notEqual(a.out, b.out, "due lezioni scritte di fila hanno ricevuto lo STESSO numero: è il doppione di AR-580");
  assert.equal(a.out, formaId(oggi, 8), "dopo la settima del giorno viene l'ottava, non la prima");
  assert.equal(b.out, formaId(oggi, 9));

  const dopo = JSON.parse(readFileSync(file, "utf8")).lezioni;
  assert.equal(dopo.length, quante + 2, "le lezioni di prima devono esserci ancora tutte");
  const ids = dopo.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length, "c'è un id usato due volte nell'archivio");
  assert.equal(dopo.at(-1).testo, "seconda");
  assert.equal(dopo.at(-1).fonte, "prova");
});

prova("⑦ la porta conserva l'indentazione del file invece di imporne una sua", () => {
  const dir = tempo();
  const file = join(dir, "apprendimento.json");
  copyFileSync(VERO, file);
  const indentaPrima = /^\n?\{\n( +)"/.exec(readFileSync(file, "utf8"))?.[1]?.length;
  assert.ok(indentaPrima, "non ho letto l'indentazione dell'archivio vero");
  lanciaPorta(file, ["--fonte", "prova", "--testo", "t", "--regola", "r"]);
  const indentaDopo = /^\n?\{\n( +)"/.exec(readFileSync(file, "utf8"))?.[1]?.length;
  assert.equal(indentaDopo, indentaPrima, "riscrivere l'archivio con un'altra indentazione lo riscrive TUTTO: quattro giorni di macchina ferma, la volta scorsa");
});

prova("⑥ `--secco` mostra cosa scriverebbe senza toccare il file", () => {
  const dir = tempo();
  const file = join(dir, "apprendimento.json");
  copyFileSync(VERO, file);
  const prima = readFileSync(file, "utf8");
  const r = lanciaPorta(file, ["--secco", "--fonte", "prova", "--testo", "t", "--regola", "r"]);
  assert.equal(r.rc, 0, r.err);
  assert.match(r.out, /"id": "L-\d{4}-\d{4}-\d{2}"/);
  assert.equal(readFileSync(file, "utf8"), prima);
});

// ── AR-769: la lezione nasce nella forma che gli altri sanno leggere ─────────────
//
// Il caso vero (18/8, Nicola: «non è cambiato niente», con lo screenshot della Cabina): la scheda
// Apprendimento diceva «0 lezioni negli ultimi 7 giorni» mentre in archivio ce n'erano NOVE, cinque
// scritte nelle 24 ore prima. Nessuna era rotta: uscivano di qui col solo campo `data`, e ogni
// lettore cerca `nato`/`ultima_conferma`/`stato`. Una lezione che nessuno sa datare non compare da
// nessuna parte — cioè viene scritta e non arriva.
//
// Nota su come queste tre prove sono quasi finite in vacca: le avevo scritte con `test(...)` e
// appese in fondo al file, DOPO `process.exit`. Il conto diceva «# pass 1» e sembrava verde.
// Qui l'esecutore si chiama `prova` e sta a metà file: una prova va dove il file la esegue.

const ORA = new Date("2026-08-18T07:45:00");
const nuova = () => componiLezione({ fonte: "chat", testo: "t", regola: "r" }, [], ORA);

prova("una lezione nuova porta i campi che i lettori cercano, non solo quelli che il file scrive", () => {
  const r = nuova();
  assert.ok(r.ok, r.motivo || "");
  assert.ok(r.lezione.nato, "senza `nato` la Cabina non sa quando è nata");
  assert.ok(r.lezione.ultima_conferma, "senza `ultima_conferma` non entra nel conto degli ultimi 7 giorni");
  assert.equal(r.lezione.stato, "attiva", "senza `stato` finisce nel bidone «senza-stato» e non è mai attiva");
});

prova("`nato` è il giorno secco: è la forma che ha l'archivio storico", () => {
  assert.match(nuova().lezione.nato, /^\d{4}-\d{2}-\d{2}$/);
});

prova("una lezione nuova nasce VIVA: sopra la soglia di morte e sotto quella di principio", () => {
  // Il buco della prima riparazione, trovato dal guardiano `archivi-senza-tetto` sul file vero:
  // marcarla «attiva» senza confidenza la fa nascere a 0, cioe' gia' sotto la soglia di morte (0.3).
  // Una lezione che nasce morta e' peggio di una senza stato: entra nei conti e sparisce al primo giro.
  const l = nuova().lezione;
  assert.ok(Number(l.confidenza) > 0.3, "sotto 0.3 il decadimento la dichiara morta al primo passo");
  assert.ok(Number(l.confidenza) < 0.8, "da 0.8 in su verrebbe promossa a principio appena nata");
  assert.equal(Number(l.evidenze), 1, "una lezione nuova ha una evidenza sola: la volta in cui e' successo");
});

prova("il campo `data` resta: si aggiunge alla forma vecchia, non la si sostituisce", () => {
  assert.ok(nuova().lezione.data, "chi legge già `data` non deve rompersi");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);

