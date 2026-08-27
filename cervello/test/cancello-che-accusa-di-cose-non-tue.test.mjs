#!/usr/bin/env node
// IL CANCELLO CHE TI ACCUSA DI RIGHE SCRITTE DA UN ALTRO.
//
// LA STORIA (22/8). Il cricchetto della leggibilità (AR-478) misura se un testo che Nicola leggerà
// esce peggiore di come è entrato. Giusto. Ma il testo si misura TAGLIATO a un tetto di caratteri, e
// il file che Nicola legge di più — `AZIONI-IN-ATTESA.md`, 250.809 caratteri — quel tetto lo
// superava di 50.000.
//
// Su un file tagliato le due versioni confrontate coprono PORZIONI DIVERSE. Basta aggiungere un
// paragrafo in cima perché un pezzo che prima stava fuori dalla finestra ci entri, e i suoi problemi
// risultino «aggiunti da te».
//
// È successo, due volte di fila: «+3 punti difficili», poi «+2». **Nessuno dei nove punti stava nel
// mio testo** — erano alle righe 1, 1428 e 1445, dentro carte scritte giorni prima. Misurato sul
// file INTERO il delta era ZERO. Due giri di riscrittura spesi a limare un testo che non era il
// problema, mentre la vera causa restava intatta.
//
// È la malattia già scritta in `cancello-stop.mjs` per un altro caso, alla lettera: *«un cancello
// che accusa di cose non tue è la definizione operativa del rosso che si impara ad aggirare»*.
//
// LA CURA, in due pezzi:
//   ① il tetto sale abbastanza da contenere i file veri — e ATTENZIONE: alzarlo rende il cancello
//      più SEVERO, non più permissivo, perché guarda più testo (misurato: 229 punti a 200.000,
//      311 a 400.000). Non è una tolleranza, è un campo visivo.
//   ② se un testo resta comunque tagliato, il verdetto è ⚪ e non ❌: non ho letto tutto, e un
//      giudizio su una parte non è un giudizio sul tutto.
//
// 🟢 Sola lettura: si costruiscono testi finti in memoria, non si tocca niente.

import { misura, parolePeggioNoteAGlossario } from "../si-capisce.mjs";
import { testiIlleggibili, TETTO_TESTO } from "../cancello-stop.mjs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const CODA = join(REPO, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** Un paragrafo scritto male, che il metro riconosce come difficile. */
const paragrafoDifficile = (n) =>
  `\n\n## Sezione ${n}\n\nQuesta frase molto lunga esiste apposta per essere difficile da leggere e ` +
  `contiene — con due incisi dentro — un ragionamento che si allunga oltre ogni misura ragionevole ` +
  `costringendo chi legge a tornare indietro almeno una volta per capire dove fosse cominciata.\n`;

/** Un paragrafo pulito: frasi corte, una idea per frase. */
const paragrafoPulito = (n) => `\n\n## Parte ${n}\n\nQuesta riga è corta. Si capisce subito. Non ha incisi.\n`;

// ── ① IL DIFETTO: il taglio fa entrare in scena righe di un altro ────────────
prova("un file oltre il tetto NON accusa chi scrive di problemi che stanno nella coda", () => {
  const g = parolePeggioNoteAGlossario(REPO);

  // Un file che supera il tetto: pulito all'inizio, difficile in fondo.
  const testa = paragrafoPulito(0).repeat(40);
  const coda = paragrafoDifficile(1).repeat(30);
  const riempi = "\nRiga innocua di riempimento che non crea problemi.\n".repeat(
    Math.ceil(TETTO_TESTO / 52),
  );
  const suMain = testa + riempi + coda;
  // La mia aggiunta: un paragrafo PULITO in cima. Non peggiora niente — ma sposta la finestra,
  // e senza la cura si porta dentro la coda difficile facendola sembrare colpa mia.
  const mio = paragrafoPulito(99) + suMain;

  assert.ok(mio.length > TETTO_TESTO, "il finto non supera il tetto: la prova non misura il caso");

  const fuori = testiIlleggibili(
    [{
      file: "MyCity-Vault/90-Memoria-AI/FINTO.md",
      contenuto: mio.slice(0, TETTO_TESTO),
      contenutoPrima: null,
      contenutoSuMain: suMain.slice(0, TETTO_TESTO),
      troncato: true,
    }],
    g,
  );

  // Non si pretende che `testiIlleggibili` taccia: quello che NON deve succedere è che il verdetto
  // finale sia un ❌ attribuito a chi scrive. Il pezzo che decide è marcato `troncato`.
  for (const t of fuori) {
    assert.equal(t.troncato, true, "un testo tagliato non è marcato come tale: il verdetto non può sapere di esserlo");
  }
});

// ── ② IL FILE VERO OGGI SFORA, E ALLORA DEV'ESSERE ⚪ ─────────────────────────
//
// Qui c'è un debito dichiarato, e va detto invece di nasconderlo dietro un verde.
// `AZIONI-IN-ATTESA.md` supera il tetto: quindi il cricchetto della leggibilità su quel file NON
// protegge più niente — esce ⚪. È una perdita vera, sul file che Nicola legge di più.
//
// La cura è accorciarlo archiviando le carte chiuse, e NON l'ho fatta di mia iniziativa: ci ho
// provato dentro questo stesso lavoro e ho fatto danni. Spostando le 23 carte ✅ ho portato via
// anche carte che altri guardiani cercano ancora nella coda viva (`ordine-test-pq`,
// `prevenzione-a-monte`, `quanto-chiudo-e-il-mio-voto`), e due prove sono diventate rosse.
// «Chiusa» non vuol dire «archiviabile». Rimettendole indietro il file tornava sopra il tetto lo
// stesso: 213.640 caratteri. Quindi l'archiviazione va progettata, non improvvisata a fine turno su
// una coda che Nicola usa per decidere — ed è una proposta in coda, non un fatto compiuto.
//
// Questa prova NON pretende che il file sia corto. Pretende che, finché è lungo, la protezione
// degradi in modo onesto: marcato tagliato → verdetto ⚪, mai un'accusa.
prova("finché la coda sfora il tetto, viene marcata tagliata (così il verdetto è ⚪ e non un'accusa)", () => {
  if (!existsSync(CODA)) return; // repo parziale: non si finge una misura
  const testo = readFileSync(CODA, "utf8");
  if (testo.length < TETTO_TESTO) return; // il giorno che sarà corta, questa prova non serve più
  const g = parolePeggioNoteAGlossario(REPO);
  const fuori = testiIlleggibili(
    [{
      file: "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md",
      contenuto: testo.slice(0, TETTO_TESTO),
      contenutoPrima: null,
      contenutoSuMain: "",              // peggiorativo per costruzione: forza il caso da esaminare
      troncato: testo.length >= TETTO_TESTO,
    }],
    g,
  );
  assert.ok(fuori.length > 0, "il caso costruito non produce nessun verdetto: la prova non misura niente");
  assert.equal(
    fuori[0].troncato, true,
    `la coda fa ${testo.length} caratteri contro un tetto di ${TETTO_TESTO}, ma non risulta tagliata: ` +
      `il verdetto tornerebbe a essere un'accusa su un testo letto a metà`,
  );
});

// ── ③ ALZARE IL TETTO È PIÙ SEVERO, NON PIÙ PERMISSIVO ───────────────────────
// Questa prova esiste per rispondere una volta per tutte al sospetto giusto del sorvegliante
// («la soglia si è alzata: il metro si è spostato»). Qui si dimostra la DIREZIONE: più campo visivo
// = più problemi visti. Se un giorno questa prova diventasse rossa, vorrebbe dire che alzare il
// tetto nasconde qualcosa — e allora il sospetto sarebbe fondato e andrebbe indagato.
prova("guardare più testo trova PIÙ problemi, non meno (la soglia è un campo visivo)", () => {
  const g = parolePeggioNoteAGlossario(REPO);
  const testo = paragrafoPulito(0).repeat(10) + paragrafoDifficile(1).repeat(10);
  const stretto = misura(testo.slice(0, Math.floor(testo.length / 2)), { noteAGlossario: g }).problemi.length;
  const largo = misura(testo, { noteAGlossario: g }).problemi.length;
  assert.ok(
    largo >= stretto,
    `guardando tutto il testo trovo ${largo} problemi e guardandone metà ${stretto}: ` +
      `alzare il tetto starebbe NASCONDENDO qualcosa, e allora il sospetto sul numero cresciuto è fondato`,
  );
});

// ── ③bis LA STESSA PROTEZIONE, SU UN TESTO COSTRUITO ─────────────────────────
//
// ⚠️ 27/8 · AR-857 — IL CASO QUI SOPRA SI È SPENTO DA SOLO, e per una buona ragione: la coda è
// stata accorciata (le carte chiuse sono andate in archivio) e adesso fa 184.688 caratteri contro
// un tetto di 200.000. Quindi `if (testo.length < TETTO_TESTO) return;` esce subito, e la
// protezione — «finché è tagliato, marcalo tagliato» — non la esercita più nessuno. Misurato: la
// mutazione che toglie il marchio lascia il file di prova tutto verde.
//
// È la forma ① del catalogo: il ramo che l'ambiente non prende mai. Con una torsione che vale la
// pena scrivere: qui il ramo si è chiuso perché qualcosa è MIGLIORATO. Una difesa che vive solo
// finché il problema c'è sparisce insieme al problema, ed è lo stesso giorno in cui smette di
// servire e quello in cui nessuno se ne accorge.
//
// La cura è quella di casa: il testo lo costruisco io, invece di sperare che il mondo sia lungo.

prova("AR-857: un testo oltre il tetto viene marcato tagliato, coda vera lunga o corta che sia", () => {
  const g = parolePeggioNoteAGlossario(REPO);
  const lungo = "Il cancello ha fermato il lavoro e il guardiano ha visto tutto. ".repeat(4000);
  assert.ok(lungo.length >= TETTO_TESTO, `il testo costruito non supera il tetto: ${lungo.length} < ${TETTO_TESTO}`);
  const fuori = testiIlleggibili(
    [{
      file: "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md",
      contenuto: lungo.slice(0, TETTO_TESTO),
      contenutoPrima: null,
      contenutoSuMain: "",
      troncato: lungo.length >= TETTO_TESTO,
    }],
    g,
  );
  assert.ok(fuori.length > 0, "il caso costruito non produce nessun verdetto: la prova non misura niente");
  assert.equal(fuori[0].troncato, true, "un testo tagliato non è marcato come tale: il verdetto non può sapere di esserlo");
});

prova("AR-857: e sotto il tetto NON si marca tagliato — o sarebbe un ⚪ per sempre", () => {
  // Il verso opposto. Se tutto risultasse tagliato, il cancello direbbe «non ho potuto misurare»
  // su ogni testo, che è il modo più silenzioso di spegnere un controllo.
  const g = parolePeggioNoteAGlossario(REPO);
  const corto = "Il cancello ha fermato il lavoro.\n".repeat(10);
  const fuori = testiIlleggibili(
    [{
      file: "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md",
      contenuto: corto,
      contenutoPrima: null,
      contenutoSuMain: "",
      troncato: corto.length >= TETTO_TESTO,
    }],
    g,
  );
  if (fuori.length) assert.equal(fuori[0].troncato, false, "un testo corto risulta tagliato: il ⚪ diventerebbe eterno");
});

// ── ④ IL VERDETTO SU UN TESTO TAGLIATO NON È UN'ACCUSA ───────────────────────
prova("il codice del verdetto manda i testi tagliati fra le incerte, non fra le accuse", () => {
  const sorgente = readFileSync(join(REPO, "cervello/cancello-stop.mjs"), "utf8");
  const i = sorgente.indexOf("for (const t of illeggibili)");
  assert.ok(i > 0, "non trovo più il punto che scrive il verdetto: prova da riscrivere sul codice nuovo");
  const blocco = sorgente.slice(i, i + 2600);
  // Si cerca la MECCANICA — il ramo che devia i tagliati prima dell'accusa — non una parola.
  assert.match(
    blocco,
    /if\s*\(t\.troncato\)[\s\S]{0,900}?incerte\.push[\s\S]{0,900}?continue;/,
    "un testo tagliato finisce ancora nell'accusa ❌: il cancello può di nuovo incolpare di righe altrui",
  );
});

let falliti = 0;
for (const c of casi) {
  console.log(c.ok ? `  ✓ ${c.nome}` : `  ✗ ${c.nome}\n      ${c.err}`);
  if (!c.ok) falliti++;
}
console.log(`\n${casi.length - falliti}/${casi.length} passate`);
process.exit(falliti ? 1 : 0);
