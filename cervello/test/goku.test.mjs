#!/usr/bin/env node
// 🐉 GOKU — la prova dell'orologio e della catena dei risvegli (cervello/goku.mjs).
//
// COSA PROVA, con l'ora finta e i file in una cartella temporanea (scorciatoia 35: mai i file veri):
//   ① il turno da 60 minuti con un giro ogni 10: giro 1 subito, risveglio fra 10, avviso alle -10,
//      chiusura alla scadenza — le ore attese sono scritte a mano, non ricalcolate col codice (scorciatoia 34);
//   ② un promemoria doppio, vecchio, di un altro turno o arrivato dopo «basta» NON fa un giro;
//   ③ la proroga sposta la scadenza e il promemoria già in volo diventa un giro normale;
//   ④ se il file di stato sparisce, il promemoria basta a ripartire, e lo dice;
//   ⑤ il diario non ripete la stessa cosa, e il resoconto ha i quattro blocchi con le targhe in fondo;
//   ⑥ la finestra non scorre: resta un'ora prima dell'inizio anche dopo due ore.
//
// NON-VACUITÀ (provata rompendo il codice apposta): togliendo in `decidiGiro` il controllo
// `Number(giro) !== stato.giro_atteso`, il caso ② diventa rosso; togliendo `stato.avvisato` dalla
// condizione dell'avviso, il caso ① ter diventa rosso (l'avviso tornerebbe a ogni giro). Rimettendo
// `Math.ceil` al posto di `Math.floor` nel risveglio diventa rosso ① quater; riportando la tolleranza
// dell'avviso a mezzo minuto diventa rosso ① quinquies. Provate tutte e quattro il 24/11.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const GOKU = join(QUI, "..", "goku.mjs");
const casi = [];
const prova = (nome, fn) => {
  const cartella = mkdtempSync(join(tmpdir(), "goku-"));
  const corri = (ora, ...args) => {
    try {
      return execFileSync(process.execPath, [GOKU, ...args], {
        encoding: "utf8",
        env: {
          ...process.env,
          GOKU_ORA: ora,
          GOKU_STATO: join(cartella, "stato.json"),
          GOKU_RESOCONTI: join(cartella, "resoconti"),
        },
      });
    } catch (e) {
      return (e.stdout || "") + (e.stderr || "");
    }
  };
  const stato = () => JSON.parse(readFileSync(join(cartella, "stato.json"), "utf8"));
  try {
    fn({ corri, stato, cartella });
    casi.push({ nome, ok: true });
  } catch (err) {
    casi.push({ nome, ok: false, err: err.message.split("\n").slice(0, 6).join("\n      ") });
  } finally {
    rmSync(cartella, { recursive: true, force: true });
  }
};
const valore = (testo, chiave) => (testo.match(new RegExp(`^${chiave}: (.*)$`, "m")) || [])[1];
const turnoDi = (testo) => (testo.match(/turno (\d{8}-\d{6})/) || [])[1];

// 22:25 a Piacenza il 24/11/2026 = 21:25 UTC (ora solare, +01:00).
const T0 = "2026-11-24T21:25:00Z";

prova("① un turno intero: giro 1 subito, risvegli ogni 10 minuti, avviso alle 23:15, chiusura alle 23:25", ({ corri, stato }) => {
  const a = corri(T0, "inizia", "--sessione", "session_prova");
  assert.equal(valore(a, "titolo"), "Goku · fino alle 23:25");
  assert.equal(valore(a, "fase"), "giro");
  assert.match(a, /send_later delay_minutes=10 \(verso le 22:35\)/);
  assert.match(a, /finestra: sessioni con updated_at ≥ 2026-11-24T20:25:00\.000Z \(cioè dalle 21:25\)/);
  const t = turnoDi(a);
  assert.equal(t, "20261124-222500");
  assert.match(a, new RegExp(`giro --turno ${t} --giro 2 `));

  // Giri 2-5 alle 22:35, 22:45, 22:55, 23:05: fase giro, sempre fra 10 minuti.
  const ore = ["21:35", "21:45", "21:55", "22:05"];
  ore.forEach((o, i) => {
    const g = corri(`2026-11-24T${o}:00Z`, "giro", "--turno", t, "--giro", String(i + 2));
    assert.equal(valore(g, "fase"), "giro", `giro ${i + 2}`);
  });
  // Giro 6 alle 23:15: è l'avviso, col testo del push, e il risveglio dopo è la scadenza.
  const av = corri("2026-11-24T22:15:00Z", "giro", "--turno", t, "--giro", "6");
  assert.equal(valore(av, "fase"), "avviso");
  assert.equal(valore(av, "push"), "Goku scade alle 23:25, tra 10 minuti. Scrivi «goku ancora» per un'altra ora.");
  assert.match(av, /send_later delay_minutes=10 \(verso le 23:25\)/);
  // Giro 7, arrivato un minuto in ritardo: è la fine, senza nessun promemoria nuovo.
  const fi = corri("2026-11-24T22:26:00Z", "giro", "--turno", t, "--giro", "7");
  assert.equal(valore(fi, "fase"), "fine");
  assert.doesNotMatch(fi, /send_later delay/);
  const ch = corri("2026-11-24T22:26:30Z", "fine");
  assert.match(ch, /diario è vuoto/);
  assert.equal(stato().giri, 7);
  assert.equal(stato().finito, true);
});

prova("① bis: con un giro ogni 15 minuti l'avviso non si salta — il risveglio cade proprio alle 23:15", ({ corri }) => {
  const a = corri(T0, "inizia", "--ogni", "15");
  const t = turnoDi(a);
  const g = (o, n) => corri(`2026-11-24T${o}:00Z`, "giro", "--turno", t, "--giro", String(n));
  assert.match(a, /delay_minutes=15 \(verso le 22:40\)/);
  assert.match(g("21:40", 2), /delay_minutes=15 \(verso le 22:55\)/);
  const terzo = g("21:55", 3);
  assert.match(terzo, /delay_minutes=15 \(verso le 23:10\)/);
  const quarto = g("22:10", 4);
  assert.equal(valore(quarto, "fase"), "giro");
  assert.match(quarto, /delay_minutes=5 \(verso le 23:15\)/, "il risveglio va accorciato fino all'avviso");
  assert.equal(valore(g("22:15", 5), "fase"), "avviso");
});

prova("① ter: con un giro ogni 5 minuti l'avviso arriva una volta sola, non a ogni giro degli ultimi 10 minuti", ({ corri }) => {
  const t = turnoDi(corri(T0, "inizia", "--ogni", "5"));
  const fasi = [];
  for (let n = 2, m = 30; m <= 85; n++, m += 5) {
    const o = new Date(Date.parse(T0) + (m - 25) * 60_000).toISOString();
    fasi.push(valore(corri(o, "giro", "--turno", t, "--giro", String(n)), "fase"));
  }
  // 22:30 … 23:10 giro (9 volte), 23:15 avviso, 23:20 giro, 23:25 fine.
  assert.deepEqual(fasi, [...Array(9).fill("giro"), "avviso", "giro", "fine"]);
});

prova("① quater: un promemoria in ritardo o in anticipo di un minuto non fa saltare l'avviso", ({ corri }) => {
  const t = turnoDi(corri(T0, "inizia"));
  const g = (o, n) => corri(o, "giro", "--turno", t, "--giro", String(n));
  for (const [o, n] of [["21:35", 2], ["21:45", 3], ["21:55", 4]]) g(`2026-11-24T${o}:00Z`, n);
  // Giro 5 arrivato 45 secondi tardi: l'avviso è alle 23:15, cioè fra 9 minuti e 15 secondi → si chiede 9, per difetto.
  const g5 = g("2026-11-24T22:05:45Z", 5);
  assert.match(g5, /send_later delay_minutes=9 /);
  // La chiamata parte 45 secondi dopo e lo strumento arrotonda al minuto dopo: arriva alle 23:16:00. È l'avviso.
  assert.equal(valore(g("2026-11-24T22:16:00Z", 6), "fase"), "avviso");
});

prova("① quinquies: un promemoria arrivato un minuto prima dell'avviso è già l'avviso", ({ corri }) => {
  const t = turnoDi(corri(T0, "inizia"));
  const g = (o, n) => corri(o, "giro", "--turno", t, "--giro", String(n));
  for (const [o, n] of [["21:35", 2], ["21:45", 3], ["21:55", 4], ["22:05", 5]]) g(`2026-11-24T${o}:00Z`, n);
  assert.equal(valore(g("2026-11-24T22:14:05Z", 6), "fase"), "avviso");
});

prova("② promemoria doppio, vecchio, di un altro turno, o dopo «basta»: nessun giro", ({ corri, stato }) => {
  const t = turnoDi(corri(T0, "inizia"));
  assert.equal(valore(corri("2026-11-24T21:35:00Z", "giro", "--turno", t, "--giro", "2"), "fase"), "giro");
  const doppio = corri("2026-11-24T21:35:30Z", "giro", "--turno", t, "--giro", "2");
  assert.equal(valore(doppio, "fase"), "ignora");
  assert.match(doppio, /aspettavo il giro 3, è arrivato il 2/);
  const altro = corri("2026-11-24T21:36:00Z", "giro", "--turno", "20261124-200000", "--giro", "3");
  assert.equal(valore(altro, "fase"), "ignora");
  assert.equal(stato().giri, 2, "i promemoria ignorati non contano come giri");
  corri("2026-11-24T21:40:00Z", "basta");
  const dopo = corri("2026-11-24T21:45:00Z", "giro", "--turno", t, "--giro", "3");
  assert.equal(valore(dopo, "fase"), "ignora");
  assert.match(dopo, /ha fermato Goku alle 22:40/);
  // Un secondo «inizia» mentre un turno è vivo non parte da solo.
  const t2 = turnoDi(corri("2026-11-24T21:50:00Z", "inizia"));
  assert.notEqual(t2, t, "dopo «basta» si può ripartire");
  assert.match(corri("2026-11-24T21:51:00Z", "inizia"), /C'è già un turno vivo/);
});

prova("③ la proroga sposta la scadenza: il promemoria delle 23:25 diventa un giro normale", ({ corri, stato }) => {
  const t = turnoDi(corri(T0, "inizia"));
  for (const [o, n] of [["21:35", 2], ["21:45", 3], ["21:55", 4], ["22:05", 5]])
    corri(`2026-11-24T${o}:00Z`, "giro", "--turno", t, "--giro", String(n));
  assert.equal(valore(corri("2026-11-24T22:15:00Z", "giro", "--turno", t, "--giro", "6"), "fase"), "avviso");
  const p = corri("2026-11-24T22:18:00Z", "proroga");
  assert.equal(valore(p, "titolo"), "Goku · fino alle 00:25");
  assert.match(p, /non programmarne un altro/);
  const g7 = corri("2026-11-24T22:25:00Z", "giro", "--turno", t, "--giro", "7");
  assert.equal(valore(g7, "fase"), "giro");
  assert.match(g7, /avviso: alle 00:15/);
  assert.equal(stato().proroghe, 1);
  // Proroga dopo la chiusura: il turno riparte e stampa il promemoria da programmare.
  corri("2026-11-24T22:30:00Z", "fine");
  const r = corri("2026-11-24T22:31:00Z", "proroga", "--minuti", "30");
  assert.match(r, /la catena riparte da qui/);
  assert.match(r, /send_later delay_minutes=10/);
  assert.equal(valore(r, "titolo"), "Goku · fino alle 00:01");
});

prova("④ file di stato sparito: il promemoria basta a ripartire, e lo dice", ({ corri, cartella }) => {
  const a = corri(T0, "inizia");
  const t = turnoDi(a);
  const comando = a.match(/Esegui: node cervello\/goku\.mjs (giro .*?) —/)[1].split(" ");
  rmSync(join(cartella, "stato.json"));
  const g = corri("2026-11-24T21:35:00Z", ...comando);
  assert.equal(valore(g, "fase"), "giro");
  assert.match(g, /stato ricostruito dal promemoria/);
  assert.match(g, new RegExp(`--turno ${t} --giro 3 `));
  assert.ok(existsSync(join(cartella, "stato.json")));
});

prova("⑤ il diario non ripete, e il resoconto ha i quattro blocchi con le targhe sotto «Dettagli tecnici»", ({ corri, cartella }) => {
  corri(T0, "inizia", "--sessione", "session_01ABC");
  corri("2026-11-24T21:30:00Z", "nota", "Sistema radiografia", "aspetta un clic", "detto a Nicola", "tocca-a-te");
  const bis = corri("2026-11-24T21:40:00Z", "nota", "Sistema radiografia", "Aspetta un clic", "ricordato a Nicola", "tocca-a-te");
  assert.match(bis, /vista 2 volte/);
  corri("2026-11-24T21:41:00Z", "nota", "R11", "turno fallito per sovraccarico", "mandato «riprendi»", "risolto");
  assert.match(corri("2026-11-24T21:42:00Z", "nota", "R11", "x", "y", "boh"), /esito «boh» sconosciuto/);
  const ch = corri("2026-11-24T22:25:00Z", "fine");
  assert.match(ch, /push: Goku ha finito \(22:25-23:25\): 1 giri, 2 problemi, 1 sistemati, 1 aspettano te\. Scrivi «goku ancora» per ripartire\./);
  const file = readdirSync(join(cartella, "resoconti"));
  assert.deepEqual(file, ["2026-11-24-2225.md"]);
  const md = readFileSync(join(cartella, "resoconti", file[0]), "utf8");
  for (const b of ["## In parole semplici", "## Cosa cambia per te", "## Cosa devi fare", "## Cosa non ho verificato"])
    assert.ok(md.includes(b), `manca ${b}`);
  assert.match(md, /^data: 2026-11-24 23:25$/m);
  const [sopra, sotto] = md.split("**Dettagli tecnici**");
  assert.doesNotMatch(sopra.split("---\n").slice(2).join("---\n"), /session_|cervello\//, "targhe sopra i dettagli");
  assert.match(sotto, /session_01ABC/);
  assert.match(md, /\*\*Sistema radiografia\*\*: aspetta un clic\. Ho fatto: ricordato a Nicola\./);
  assert.equal((md.match(/\| Sistema radiografia \|/g) || []).length, 1, "una riga sola per la stessa cosa");
  assert.equal((md.match(/aspetta un clic/g) || []).length, 1, "ogni voce compare una volta sola nel testo");
  assert.match(md, /Sistemati da me:\n- \*\*R11\*\*: turno fallito per sovraccarico\. Ho fatto: mandato «riprendi»\./);
  assert.match(md, /Ho trovato 2 problemi: 1 sistemato da me, 1 aspetta te\./);
  assert.match(md, /Ti resta una cosa da fare/);
});

prova("⑥ la finestra non scorre: dopo una proroga resta un'ora prima dell'inizio", ({ corri }) => {
  const t = turnoDi(corri(T0, "inizia"));
  corri("2026-11-24T22:00:00Z", "proroga");
  const g = corri("2026-11-24T22:30:00Z", "giro", "--manuale");
  assert.equal(valore(g, "fase"), "giro");
  assert.match(g, /updated_at ≥ 2026-11-24T20:25:00\.000Z/);
  assert.match(g, /giro chiesto a mano/);
  assert.doesNotMatch(g, /send_later delay/);
  // Il giro a mano non consuma il numero del promemoria in volo.
  assert.equal(valore(corri("2026-11-24T22:31:00Z", "giro", "--turno", t, "--giro", "2"), "fase"), "giro");
});

prova("⑦ le seguite: al giro 1 si scorre tutto l'elenco, dopo basta la prima pagina più le seguite; senza stato si torna a scorrere tutto", ({ corri, cartella }) => {
  const a = corri(T0, "inizia");
  const t = turnoDi(a);
  assert.match(a, /pagina dopo pagina finché c'è has_more/);
  assert.match(corri("2026-11-24T21:26:00Z", "segui", "session_A", "Montatore video", "session_B", "Ora del Gusto"), /seguite \(2\)/);
  assert.match(corri("2026-11-24T21:27:00Z", "segui", "session_A", "Montatore video AI"), /seguite \(2\): Montatore video AI · Ora del Gusto/);
  assert.match(corri("2026-11-24T21:27:00Z", "segui", "session_C"), /Uso: segui/);
  const g2 = corri("2026-11-24T21:35:00Z", "giro", "--turno", t, "--giro", "2");
  assert.match(g2, /seguite \(2\): Montatore video AI = session_A · Ora del Gusto = session_B/);
  assert.match(g2, /solo la prima pagina/);
  assert.match(corri("2026-11-24T21:36:00Z", "lascia", "session_B"), /seguite \(1\): Montatore video AI$/m);
  // «guarda adesso» rifà la scansione intera.
  assert.match(corri("2026-11-24T21:37:00Z", "giro", "--manuale"), /pagina dopo pagina/);
  // Stato perso: si ricostruisce e si torna a scorrere tutto, perché le seguite sono perse.
  const comando = g2.match(/Esegui: node cervello\/goku\.mjs (giro .*?) —/)[1].split(" ");
  rmSync(join(cartella, "stato.json"));
  const g3 = corri("2026-11-24T21:45:00Z", ...comando);
  assert.match(g3, /le seguite di prima sono persi/);
  assert.match(g3, /pagina dopo pagina/);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
