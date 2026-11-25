#!/usr/bin/env node
// 🐉 GOKU — la prova dell'orologio e della catena dei risvegli (cervello/goku.mjs).
//
// REGOLA DI QUESTA PROVA (collaudo del 24/11, difetto 2): ogni giro si gioca RIGIOCANDO la riga
// «messaggio:» che il programma ha appena stampato, cioè il promemoria vero, nella forma lunga che arriva
// davvero alla sessione. La prima versione scriveva a mano la forma corta `giro --turno T --giro N`, e tre
// mutazioni di goku.mjs restavano verdi (scorciatoia 38 del catalogo).
//
// COSA PROVA, con l'ora finta e i file in una cartella temporanea (scorciatoia 35: mai i file veri):
//   ① il turno da 60 minuti: giro subito, risvegli ogni 10, avviso alle -10, fine alla scadenza, anche coi
//      promemoria in ritardo o in anticipo; le ore attese sono scritte a mano (scorciatoia 34);
//   ② un promemoria doppio, di un altro turno o arrivato dopo «basta» NON fa un giro;
//   ③ la proroga, prima della scadenza, dopo il giro di fine e dopo la chiusura;
//   ④ il file di stato sparito: senza il titolo della sessione non si ricostruisce; col titolo, un turno
//      fermato resta fermato, una proroga resta, un avviso già dato non torna;
//   ⑤ il diario e il resoconto; ⑥ la finestra fissa; ⑦ le seguite; ⑧ il titolo letto a fine anno e d'estate.
//
// NON-VACUITÀ (provata rompendo il codice apposta, il 24/11): togliendo il controllo del numero di giro → ②;
// togliendo `stato.avvisato` dall'avviso → ① ter; `Math.ceil` al posto di `Math.floor` → ① quater;
// tolleranza dell'avviso a mezzo minuto → ① quinquies; togliendo `Math.min(bersaglio, scad)` → ① sexies;
// togliendo `finito: false` dalla proroga → ③ ter; ricostruendo sempre lo stato (`if (!stato || opz.scadenza)`)
// → ②; togliendo il controllo del titolo «finito» → ④ bis; togliendo `ultima_fase === "fine"` dalla proroga → ③ bis.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { leggiTitolo } from "../goku.mjs";

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
  /** Il promemoria vero: la riga «messaggio:» dell'uscita, tale e quale. */
  const promemoria = (uscita) => {
    const m = uscita.match(/^messaggio: .*?Esegui: node cervello\/goku\.mjs (giro .*?) — /m);
    assert.ok(m, `nessun promemoria nell'uscita:\n${uscita}`);
    return m[1].split(" ");
  };
  const rigioca = (ora, uscita, ...extra) => corri(ora, ...promemoria(uscita), ...extra);
  const stato = () => JSON.parse(readFileSync(join(cartella, "stato.json"), "utf8"));
  try {
    fn({ corri, rigioca, promemoria, stato, cartella });
    casi.push({ nome, ok: true });
  } catch (err) {
    casi.push({ nome, ok: false, err: err.message.split("\n").slice(0, 8).join("\n      ") });
  } finally {
    rmSync(cartella, { recursive: true, force: true });
  }
};
const valore = (testo, chiave) => (testo.match(new RegExp(`^${chiave}: (.*)$`, "m")) || [])[1];
const fase = (testo) => valore(testo, "fase");
const turnoDi = (testo) => (testo.match(/turno (\d{8}-\d{6})/) || [])[1];
/** «22:35» del 24/11 a Piacenza (ora solare, +01:00) → ISO UTC; «00:25» è già il 25/11. Anche coi secondi. */
const pc = (hm) => {
  const [h, m, s = "00"] = hm.split(":");
  const utc = (Number(h) + 23) % 24;
  return `2026-11-24T${String(utc).padStart(2, "0")}:${m}:${s}Z`;
};
const T0 = pc("22:25");

prova("① un turno intero coi promemoria veri: giro ogni 10 minuti, avviso alle 23:15, fine alle 23:25", ({ corri, rigioca, stato }) => {
  let u = corri(T0, "inizia", "--sessione", "session_prova");
  assert.equal(valore(u, "titolo"), "Goku · fino alle 23:25 (24/11)");
  assert.equal(fase(u), "giro");
  assert.match(u, /send_later delay_minutes=10 \(verso le 22:35\)/);
  assert.match(u, /finestra: sessioni con updated_at ≥ 2026-11-24T20:25:00\.000Z \(cioè dalle 21:25\)/);
  assert.equal(turnoDi(u), "20261124-222500");
  assert.match(u, /--giro 2 .*--avviso 10 —/);
  for (const o of ["22:35", "22:45", "22:55", "23:05"]) {
    u = rigioca(pc(o), u);
    assert.equal(fase(u), "giro", o);
  }
  u = rigioca(pc("23:15"), u);
  assert.equal(fase(u), "avviso");
  assert.equal(valore(u, "push"), "Goku scade alle 23:25, tra 10 minuti. Scrivi «goku ancora» per un'altra ora.");
  assert.match(u, /send_later delay_minutes=10 \(verso le 23:25\)/);
  assert.match(u, /--avviso 10 --avvisato 1 —/, "il promemoria dopo l'avviso porta l'avviso già dato");
  u = rigioca(pc("23:26"), u);
  assert.equal(fase(u), "fine");
  assert.doesNotMatch(u, /send_later delay/);
  const ch = corri(pc("23:26:30"), "fine");
  assert.match(ch, /diario è vuoto/);
  assert.equal(valore(ch, "titolo"), "Goku · finito alle 23:26 (24/11)");
  assert.equal(stato().giri, 7);
});

prova("① bis: con un giro ogni 9 minuti il risveglio si accorcia fino all'avviso; oltre 10 minuti non si va", ({ corri, rigioca }) => {
  let u = corri(T0, "inizia", "--ogni", "9");
  for (const o of ["22:34", "22:43", "22:52", "23:01"]) u = rigioca(pc(o), u);
  u = rigioca(pc("23:10"), u);
  assert.equal(fase(u), "giro");
  assert.match(u, /delay_minutes=5 \(verso le 23:15\)/);
  assert.equal(fase(rigioca(pc("23:15"), u)), "avviso");
  assert.match(corri(pc("23:30"), "inizia", "--ogni", "60", "--forza"), /delay_minutes=10 /);
});

prova("① ter: con un giro ogni 5 minuti l'avviso arriva una volta sola", ({ corri, rigioca }) => {
  let u = corri(T0, "inizia", "--ogni", "5");
  const fasi = [];
  for (let m = 30; m <= 85; m += 5) {
    u = rigioca(new Date(Date.parse(T0) + (m - 25) * 60_000).toISOString(), u);
    fasi.push(fase(u));
    if (fase(u) === "fine") break;
  }
  // 22:30 … 23:10 giro (9 volte), 23:15 avviso, 23:20 giro, 23:25 fine.
  assert.deepEqual(fasi, [...Array(9).fill("giro"), "avviso", "giro", "fine"]);
});

prova("① quater: un promemoria in ritardo non fa saltare l'avviso", ({ corri, rigioca }) => {
  let u = corri(T0, "inizia");
  for (const o of ["22:35", "22:45", "22:55"]) u = rigioca(pc(o), u);
  // Giro 5 arrivato 45 secondi tardi: l'avviso è fra 9 minuti e 15 secondi → si chiede 9, per difetto.
  u = rigioca(pc("23:05:45"), u);
  assert.match(u, /send_later delay_minutes=9 /);
  // La chiamata parte 45 secondi dopo e lo strumento arrotonda al minuto dopo: arriva alle 23:16:00.
  assert.equal(fase(rigioca(pc("23:16"), u)), "avviso");
});

prova("① quinquies: un promemoria arrivato un minuto prima dell'avviso è già l'avviso", ({ corri, rigioca }) => {
  let u = corri(T0, "inizia");
  for (const o of ["22:35", "22:45", "22:55", "23:05"]) u = rigioca(pc(o), u);
  assert.equal(fase(rigioca(pc("23:14:05"), u)), "avviso");
});

prova("① sexies: un avviso arrivato tardi programma la fine alla scadenza, non dieci minuti dopo", ({ corri, rigioca }) => {
  let u = corri(T0, "inizia");
  for (const o of ["22:35", "22:45", "22:55", "23:05"]) u = rigioca(pc(o), u);
  u = rigioca(pc("23:17"), u);
  assert.equal(fase(u), "avviso");
  assert.match(u, /send_later delay_minutes=8 \(verso le 23:25\)/);
});

prova("① septies: un turno non dura meno di 15 minuti", ({ corri }) => {
  assert.equal(valore(corri(T0, "inizia", "--minuti", "10"), "titolo"), "Goku · fino alle 22:40 (24/11)");
});

prova("② promemoria doppio, di un altro turno, o dopo «basta»: nessun giro", ({ corri, rigioca, promemoria, stato }) => {
  const u1 = corri(T0, "inizia");
  const t = turnoDi(u1);
  const u2 = rigioca(pc("22:35"), u1);
  assert.equal(fase(u2), "giro");
  const doppio = rigioca(pc("22:35:30"), u1);
  assert.equal(fase(doppio), "ignora");
  assert.match(doppio, /aspettavo il giro 3, è arrivato il 2/);
  const altro = corri(pc("22:36"), ...promemoria(u2).map((x) => (x === t ? "20261124-200000" : x)));
  assert.equal(fase(altro), "ignora");
  assert.equal(stato().giri, 2, "i promemoria ignorati non contano come giri");
  corri(pc("22:40"), "basta");
  const dopo = rigioca(pc("22:45"), u2);
  assert.equal(fase(dopo), "ignora", "il promemoria vero, in forma lunga, non resuscita un turno fermato");
  assert.match(dopo, /ha fermato Goku alle 22:40/);
  const t2 = turnoDi(corri(pc("22:50"), "inizia"));
  assert.notEqual(t2, t, "dopo «basta» si può ripartire");
  assert.match(corri(pc("22:51"), "inizia"), /C'è già un turno vivo/);
});

prova("③ la proroga prima della scadenza: il promemoria delle 23:25 diventa un giro normale", ({ corri, rigioca, stato }) => {
  let u = corri(T0, "inizia");
  for (const o of ["22:35", "22:45", "22:55", "23:05"]) u = rigioca(pc(o), u);
  u = rigioca(pc("23:15"), u);
  assert.equal(fase(u), "avviso");
  const p = corri(pc("23:18"), "proroga");
  assert.equal(valore(p, "titolo"), "Goku · fino alle 00:25 (25/11)");
  assert.match(p, /non programmarne un altro/);
  const g = rigioca(pc("23:25"), u);
  assert.equal(fase(g), "giro");
  assert.match(g, /avviso: alle 00:15/);
  assert.equal(stato().proroghe, 1);
});

prova("③ bis: la proroga dopo il giro di fine, prima di «fine», riapre la catena", ({ corri, rigioca }) => {
  let u = corri(T0, "inizia");
  for (const o of ["22:35", "22:45", "22:55", "23:05", "23:15"]) u = rigioca(pc(o), u);
  // Il giro di fine arriva nell'ultimo minuto (23:24:10) e la proroga prima della scadenza (23:24:30): lì
  // l'unico segno che nessun promemoria è più in volo è la fase dell'ultimo giro.
  assert.equal(fase(rigioca(pc("23:24:10"), u)), "fine");
  const p = corri(pc("23:24:30"), "proroga");
  assert.match(p, /la catena riparte da qui/);
  assert.equal(fase(rigioca(pc("23:35"), p)), "giro");
});

prova("③ ter: la proroga dopo la chiusura riapre, e il promemoria stampato fa davvero un giro", ({ corri, rigioca }) => {
  corri(T0, "inizia");
  corri(pc("23:30"), "fine");
  const r = corri(pc("23:31"), "proroga", "--minuti", "30");
  assert.match(r, /la catena riparte da qui/);
  assert.equal(valore(r, "titolo"), "Goku · fino alle 00:01 (25/11)");
  assert.equal(fase(rigioca(pc("23:41"), r)), "giro");
  assert.match(corri(pc("23:42"), "basta"), /fermato/);
  assert.match(corri(pc("23:43"), "proroga"), /Goku è stato fermato/);
});

prova("④ stato sparito: senza il titolo non si ricostruisce; col titolo sì, e lo dice", ({ corri, rigioca, cartella }) => {
  const u = corri(T0, "inizia");
  rmSync(join(cartella, "stato.json"));
  const senza = rigioca(pc("22:35"), u);
  assert.equal(fase(senza), "titolo");
  assert.doesNotMatch(senza, /send_later delay/);
  assert.ok(!existsSync(join(cartella, "stato.json")), "senza titolo non si scrive niente");
  const g = rigioca(pc("22:35"), u, "--titolo", "Goku · fino alle 23:25 (24/11)");
  assert.equal(fase(g), "giro");
  assert.match(g, /stato ricostruito dal promemoria e dal titolo/);
  assert.match(g, /pagina dopo pagina/);
  const g3 = rigioca(pc("22:45"), g);
  assert.equal(fase(g3), "giro");
  assert.doesNotMatch(g3, /stato ricostruito/, "l'avviso di ricostruzione vale un giro solo");
});

prova("④ bis: dopo «basta» e un riavvio, il promemoria vecchio NON resuscita il turno", ({ corri, rigioca, cartella }) => {
  const u = corri(T0, "inizia");
  const b = corri(pc("22:30"), "basta");
  assert.equal(valore(b, "titolo"), "Goku · finito alle 22:30 (24/11)");
  rmSync(join(cartella, "stato.json"));
  const g = rigioca(pc("22:35"), u, "--titolo", "Goku · finito alle 22:30 (24/11)");
  assert.equal(fase(g), "ignora");
  assert.match(g, /il titolo della sessione dice che il turno è finito/);
  // Anche senza ripetere il titolo, un altro promemoria vecchio resta ignorato.
  assert.equal(fase(rigioca(pc("22:36"), u)), "ignora");
});

prova("④ ter: una proroga sopravvive al riavvio, perché il titolo vince sul promemoria", ({ corri, rigioca, cartella }) => {
  let u = corri(T0, "inizia");
  for (const o of ["22:35", "22:45", "22:55", "23:05", "23:15"]) u = rigioca(pc(o), u);
  corri(pc("23:18"), "proroga");
  rmSync(join(cartella, "stato.json"));
  const g = rigioca(pc("23:25"), u, "--titolo", "Goku · fino alle 00:25 (25/11)");
  assert.equal(fase(g), "giro", "con la scadenza vecchia del promemoria sarebbe stata la fine");
  assert.match(g, /scade: 00:25/);
  assert.match(g, /avviso: alle 00:15/, "una proroga rimette l'avviso");
});

prova("④ quater: un avviso già dato non torna dopo il riavvio", ({ corri, rigioca, cartella }) => {
  let u = corri(T0, "inizia", "--ogni", "5");
  for (let m = 30; m <= 75; m += 5) u = rigioca(new Date(Date.parse(T0) + (m - 25) * 60_000).toISOString(), u);
  assert.equal(fase(u), "avviso");
  rmSync(join(cartella, "stato.json"));
  const g = rigioca(pc("23:20"), u, "--titolo", "Goku · fino alle 23:25 (24/11)");
  assert.equal(fase(g), "giro");
  assert.doesNotMatch(g, /^push:/m);
});

prova("⑤ il diario non ripete, e il resoconto ha i quattro blocchi con le targhe sotto «Dettagli tecnici»", ({ corri, cartella }) => {
  corri(T0, "inizia", "--sessione", "session_01ABC");
  corri(pc("22:30"), "nota", "Sistema radiografia", "aspetta un clic", "detto a Nicola", "tocca-a-te");
  const bis = corri(pc("22:40"), "nota", "Sistema radiografia", "Aspetta un clic", "ricordato a Nicola", "tocca-a-te");
  assert.match(bis, /vista 2 volte/);
  corri(pc("22:41"), "nota", "R11", "turno fallito per sovraccarico", "mandato «riprendi»", "risolto");
  assert.match(corri(pc("22:42"), "nota", "R11", "x", "y", "boh"), /esito «boh» sconosciuto/);
  const ch = corri(pc("23:25"), "fine");
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

prova("⑥ la finestra non scorre: dopo una proroga resta un'ora prima dell'inizio", ({ corri, rigioca }) => {
  const u = corri(T0, "inizia");
  corri(pc("23:00"), "proroga");
  const g = corri(pc("23:30"), "giro", "--manuale");
  assert.equal(fase(g), "giro");
  assert.match(g, /updated_at ≥ 2026-11-24T20:25:00\.000Z/);
  assert.match(g, /giro chiesto a mano/);
  assert.doesNotMatch(g, /send_later delay/);
  // Il giro a mano non consuma il numero del promemoria in volo.
  assert.equal(fase(rigioca(pc("23:31"), u)), "giro");
});

prova("⑦ le seguite: al giro 1 si scorre tutto, dopo la prima pagina più le seguite", ({ corri, rigioca }) => {
  const u = corri(T0, "inizia");
  assert.match(u, /pagina dopo pagina finché c'è has_more/);
  assert.match(corri(pc("22:26"), "segui", "session_A", "Montatore video", "session_B", "Ora del Gusto"), /seguite \(2\)/);
  assert.match(corri(pc("22:27"), "segui", "session_A", "Montatore video AI"), /seguite \(2\): Montatore video AI · Ora del Gusto/);
  assert.match(corri(pc("22:27"), "segui", "session_C"), /Uso: segui/);
  const g2 = rigioca(pc("22:35"), u);
  assert.match(g2, /seguite \(2\): Montatore video AI = session_A · Ora del Gusto = session_B/);
  assert.match(g2, /solo la prima pagina/);
  assert.match(corri(pc("22:36"), "lascia", "session_B"), /seguite \(1\): Montatore video AI$/m);
  assert.match(corri(pc("22:37"), "giro", "--manuale"), /pagina dopo pagina/, "«guarda adesso» rifà la scansione intera");
});

prova("⑧ il titolo si legge giusto a cavallo d'anno e con l'ora legale", () => {
  const capodanno = leggiTitolo("Goku · fino alle 00:30 (01/01)", "2026-12-31T22:00:00Z");
  assert.equal(capodanno.scadenza.toISOString(), "2026-12-31T23:30:00.000Z");
  const estate = leggiTitolo("Goku · fino alle 10:00 (15/07)", "2026-07-15T07:00:00Z");
  assert.equal(estate.scadenza.toISOString(), "2026-07-15T08:00:00.000Z");
  assert.deepEqual(leggiTitolo("Goku · finito alle 23:40 (24/11)", "2026-11-24T22:40:00Z"), { finito: true });
  assert.equal(leggiTitolo("Supervisore sessioni attive", "2026-11-24T22:40:00Z"), null);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
