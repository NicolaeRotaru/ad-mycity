#!/usr/bin/env node
// AR-233 · AR-256 · AR-262 · AR-247 · AR-254 — quando il Pannello non riesce a leggere, non deve dire
// che va tutto bene.
//
// È la gemella lato Cabina della malattia del lotto 10. Là un buco si travestiva da zero dentro un
// freno; qui si traveste da buona notizia dentro una schermata — che è peggio, perché la schermata la
// legge Nicola e ci decide sopra.
//
//   AR-233 — la home stampa «Niente da firmare. 👍» anche quando la coda NON è stata letta. La catena
//     ha tre appiattimenti in fila: `readVaultFile` torna `string | null` e quel null vale sia «il file
//     non c'è» sia «GitHub è giù / token morto»; `tutteLeAzioni` lo trasforma in `[]`; la Plancia ha un
//     `.catch(() => {})` sulla fetch. E la route calcolava `collegato` dal CONTEGGIO delle card. Nella
//     coda ci sono card 🔴 con scadenza: è la bugia più cara che questo Pannello possa raccontare.
//
//   AR-256 — se il cantiere arriva malformato, un `.filter()` lancia DENTRO il `.then()`, `setLinks`
//     non viene mai chiamato e dalla home spariscono in silenzio i tre collegamenti alla salute.
//
//   AR-262 — l'interruttore delle Stelle Polari torna indietro da solo: `.catch(() => {})` sulla POST,
//     `res.ok` mai controllato (una 500 arriva col suo corpo e non fa scattare il catch), poi si
//     ricarica dal server che riallinea. Nicola vede il gesto annullarsi senza una parola.
//
//   AR-247 (bloccante) + AR-254 — un fix solo: mancava il confine fra «file di memoria della macchina»
//     e «risposta per il telefono». La route rimandava l'oggetto intero, 1.034.394 byte, ogni 30
//     secondi. Le stesse cifre spiegano AR-254: oltre il tetto di lettura di 1 MiB arriva `null` e la
//     scheda Apprendimento resta vuota PER SEMPRE.
//
// Qui si eseguono le funzioni VERE. Le decisioni stanno in pannello/src/lib/esito-lettura.ts apposta:
// dentro un componente React non si possono interrogare senza montare mezzo browser.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const leggi = (f) => readFileSync(join(REPO, f), "utf8");

// ⚠️ Il metro deve poter FALLIRE anche sui casi asincroni — e qui non poteva.
// Due casi sono scritti `async` (la risposta 500 e la coppia letto/assente), ma questa funzione
// chiamava `fn()` senza aspettarlo: la promessa tornava indietro, il try/catch non ne vedeva mai il
// rifiuto, e i due casi risultavano PASSATI qualunque cosa asserissero. Provato mutando il primo dei
// due con un `assert.equal(1, 2)`: restava «# pass 19 · # fail 0», uscita 0. Il rifiuto rimasto in
// coda usciva poi come uscita 1 con «# fail 0» in fondo — un rosso che il conteggio smentiva.
// Ora i casi si accodano e si aspettano uno per uno, come in perimetro-applicato.test.mjs.
const casi = [];
const daFare = [];
const prova = (nome, fn) => {
  daFare.push(async () => {
    try {
      await fn();
      casi.push({ nome, ok: true });
    } catch (e) {
      casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
    }
  });
};

// node --experimental-strip-types importa il .ts senza build (il modulo non ha dipendenze apposta).
const M = await import(join(REPO, "pannello/src/lib/esito-lettura.ts"));
const S = await import(join(REPO, "pannello/src/lib/risposta-snella.ts"));

// ── la decisione al centro di tutto ──────────────────────────────────────────
prova("il caso che ha rotto: «vuoto» e «cieco» NON possono dare la stessa frase", () => {
  const vuoto = M.testoQuandoVuoto(M.assente(), { vuoto: "Niente da firmare. 👍", cieco: "Non lo so" });
  const cieco = M.testoQuandoVuoto(M.cieco("GitHub giù"), { vuoto: "Niente da firmare. 👍", cieco: "Non lo so" });
  assert.notEqual(vuoto.testo, cieco.testo, "due situazioni diverse, due frasi diverse");
  assert.equal(vuoto.rassicurante, true, "ho letto e non c'era niente: rassicurare è corretto");
  assert.equal(cieco.rassicurante, false, "non ho letto: rassicurare è una bugia");
});

prova("tre stati, non due: «assente» è un dato, «cieco» è l'assenza di un dato", () => {
  assert.equal(M.haDato(M.letto([1, 2])), true);
  assert.equal(M.haDato(M.assente()), false);
  assert.equal(M.haDato(M.cieco("boh")), false);
  assert.equal(M.assente().stato, "assente");
  assert.equal(M.cieco("x").stato, "cieco");
});

prova("il semaforo al buio è grigio: non verde (bugia) e non rosso (allarme inventato)", () => {
  assert.equal(M.semaforoDaLettura(M.letto(1), "verde"), "verde");
  assert.equal(M.semaforoDaLettura(M.cieco("giù"), "verde"), "grigio");
  assert.equal(M.semaforoDaLettura(M.assente(), "verde"), "grigio");
});

prova("una lista malformata non fa saltare la schermata (AR-256)", () => {
  assert.deepEqual(M.listaSicura([1, null, 2, undefined]), [1, 2], "le righe nulle sono la causa n.2 di eccezione");
  for (const brutto of [null, undefined, {}, "stringa", 42]) assert.deepEqual(M.listaSicura(brutto), []);
});

// ── AR-262: res.ok non veniva mai controllato ────────────────────────────────
prova("il caso che ha rotto: una risposta 500 NON è un successo", async () => {
  // Una 500 arriva col suo corpo JSON: non lancia, quindi il `.catch(() => {})` non scattava mai e il
  // salvataggio passava per riuscito.
  const cinquecento = { ok: false, status: 500, json: async () => ({ errore: "boom" }) };
  const l = await M.daRisposta(cinquecento, (c) => c);
  assert.equal(l.stato, "cieco");
  assert.match(l.motivo, /500/);
});

prova("una risposta buona è «letto», una vuota è «assente»", async () => {
  const ok = { ok: true, status: 200, json: async () => ({ dato: [1] }) };
  assert.equal((await M.daRisposta(ok, (c) => c.dato)).stato, "letto");
  const vuota = { ok: true, status: 200, json: async () => ({}) };
  assert.equal((await M.daRisposta(vuota, (c) => c.dato ?? null)).stato, "assente");
  assert.equal((await M.daRisposta(null, (c) => c)).stato, "cieco", "nessuna risposta = cieco");
});

// ── il cablaggio: AR-233 ─────────────────────────────────────────────────────
prova("il caso che ha rotto: la coda dice SE è stata letta, non solo quante card ha", () => {
  const src = leggi("pannello/src/lib/azioni-pronte.ts");
  assert.match(src, /readVaultFileEsito/, "gli stati esistevano già: nessuno li propagava");
  assert.match(src, /codaLeggibile/);
  assert.doesNotMatch(src, /const md = await readVaultFile\("90-Memoria-AI\/AZIONI-IN-ATTESA\.md"\)/, "era l'appiattimento a null");
});

prova("«collegato» non si deduce più dal CONTEGGIO delle card", () => {
  const src = leggi("pannello/src/app/api/azioni-pronte/route.ts");
  assert.doesNotMatch(src, /collegato: blocchi\.length > 0/, "coda vuota e coda mai letta erano indistinguibili");
  assert.match(src, /collegato: codaLeggibile/);
  assert.match(src, /coda_leggibile/, "il Pannello dev'essere in grado di distinguerle");
});

prova("la home non stampa più il pollice in su su una coda che non ha letto", () => {
  const src = leggi("pannello/src/components/aree/Plancia.tsx");
  assert.match(src, /codaCieca/, "serve lo stato che distingue i due casi");
  // Il messaggio rassicurante dev'essere dentro il ramo «ho letto davvero».
  // lastIndexOf, non indexOf: la prima occorrenza è dentro il commento che spiega il difetto.
  const i = src.lastIndexOf("Niente da firmare");
  const intorno = src.slice(Math.max(0, i - 400), i);
  assert.match(intorno, /codaCieca \?/, "il pollice in su deve stare nel ramo «coda letta»");
  assert.ok(src.includes("codaCieca ? ("), "il messaggio rassicurante dev'essere dietro un bivio, non incondizionato");
  assert.doesNotMatch(src, /fetch\("\/api\/azioni-pronte"[^\n]*\n?[^\n]*\.catch\(\(\) => \{\}\)/, "l'errore non si ingoia più");
});

// ── il cablaggio: AR-256 ─────────────────────────────────────────────────────
prova("il caso che ha rotto: i tre collegamenti alla salute non spariscono mai", () => {
  const src = leggi("pannello/src/components/MacchinaHomeCard.tsx");
  assert.match(src, /LINK_BASE/, "serve un ripiego che tenga le tre porte aperte");
  assert.match(src, /\}\)\.catch\(\(\) => \{[\s\S]{0,400}setLinks\(LINK_BASE\)/, "la catena dev'essere chiusa da un catch che RIPRISTINA");
  assert.match(src, /dato non leggibile/, "e deve dire che il dato non c'è, invece di mostrare un numero finto");
  // LINK_BASE fuori dal componente: dentro, `carica` (useCallback con deps vuote) ne catturerebbe
  // una copia diversa a ogni render — un bug sottile che il linter segnala e nessuno legge.
  const iBase = src.indexOf("const LINK_BASE");
  const iComp = src.indexOf("export default function MacchinaHomeCard");
  assert.ok(iBase > 0 && iBase < iComp, "LINK_BASE deve stare a livello di modulo");
});

// ── il cablaggio: AR-262 ─────────────────────────────────────────────────────
prova("il caso che ha rotto: l'interruttore dice PERCHÉ non ha salvato", () => {
  const src = leggi("pannello/src/components/StellePolari.tsx");
  assert.match(src, /if \(!res\.ok\) throw/, "una 500 non fa scattare il catch da sola");
  assert.match(src, /setErrore/, "il motivo dev'essere mostrato accanto alla stella");
  assert.match(src, /disabled=\{salvando === s\.id\}/, "e niente doppio invio mentre salva");
  assert.doesNotMatch(src, /body: JSON\.stringify\(\{ id: s\.id[^}]*\}\),\s*\}\)\.catch\(\(\) => \{\}\)/, "il catch vuoto sulla POST");
});

// ── AR-247 / AR-254: la risposta per il telefono ─────────────────────────────
prova("il caso che ha rotto: la risposta non è più il file intero", () => {
  const src = leggi("pannello/src/app/api/memoria/auto-coscienza/route.ts");
  assert.doesNotMatch(src, /apprendimento, miglioramento, calibrazione, registro \}\);/, "era l'inoltro dell'oggetto intero");
  assert.match(src, /apprendimento: apprendimentoSnello\(apprendimento\)/);
});

prova("il caso che ha rotto: la funzione VERA, sul file VERO, sta sotto il tetto di lettura", () => {
  // Non un pattern nel codice: si esegue `apprendimentoSnello` su apprendimento.json com'è adesso.
  // 1.034.394 byte è il peso reale il 28/7; il tetto di lettura è 1.048.576 (1 MiB). Il file ci stava
  // dentro per il rotto della cuffia e cresce a ogni giro: AR-254 era questione di giorni.
  const j = JSON.parse(leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json"));
  const intero = Buffer.byteLength(JSON.stringify(j));
  const snello = Buffer.byteLength(JSON.stringify(S.apprendimentoSnello(j)));
  // Che il file di partenza sia QUELLO VERO si riconosce dal contenuto, non dal peso (4/8).
  //
  // Prima la guardia era `intero > 900_000`, e come metro aveva due difetti opposti: un finto pieno
  // di riempimento da 900 KB passava, e il file vero DIMAGRITO veniva bocciato. È successo: la
  // potatura dei principi in copia (86 su 87 ripetevano il testo della loro lezione) ha portato
  // l'archivio da 1.049.294 a 947.517 byte, e questa riga ha chiamato «finto» il file vero il giorno
  // in cui è stato riparato. Un metro che punisce il miglioramento si impara ad aggirarlo.
  assert.ok(
    Array.isArray(j.lezioni) && j.lezioni.length > 100 && Array.isArray(j.preferenze_nicola) && j.preferenze_nicola.length > 50,
    `il file di partenza dev'essere quello vero, non un finto: ${j.lezioni?.length} lezioni, ${j.preferenze_nicola?.length} preferenze`,
  );
  assert.ok(intero > 300_000, `e dev'essere l'archivio pieno, non un troncone: ${intero} byte`);
  assert.ok(snello < intero / 3, `la risposta dev'essere molto più piccola del file: ${snello} vs ${intero}`);
  assert.ok(snello < 1_048_576, "e stare sotto il tetto di lettura di 1 MiB con margine");
});

prova("si tagliano TUTTE le liste, non solo le lezioni — verificato contando", () => {
  // Misurato: preferenze_nicola pesa 173 KB su 379 voci, principi 115 KB su 86. Tagliare solo le
  // lezioni avrebbe spostato il problema — è «il fix applicato a una copia sola», in versione dati.
  // La prima versione di questa prova controllava che nel codice ci fosse la costante MAX_PREFERENZE:
  // alzandola a 99999 restava verde. Controllava la forma, non l'effetto.
  const j = JSON.parse(leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json"));
  const s = S.apprendimentoSnello(j);
  assert.ok(s.lezioni.length <= 60, `lezioni non tagliate: ${s.lezioni.length}`);
  assert.ok(s.principi.length <= 40, `principi non tagliati: ${s.principi.length}`);
  assert.ok(s.preferenze_nicola.length <= 40, `preferenze non tagliate: ${s.preferenze_nicola.length}`);
  assert.ok(j.preferenze_nicola.length > 40, "il file vero deve avere più preferenze del tetto, altrimenti non provo niente");
});

prova("il troncamento si DICHIARA: una lista tagliata in silenzio è la stessa bugia", () => {
  const j = JSON.parse(leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json"));
  const s = S.apprendimentoSnello(j);
  assert.equal(s.troncato.lezioni.totali, j.lezioni.filter(Boolean).length, "il totale vero dev'essere dichiarato");
  assert.equal(s.troncato.lezioni.troncate, true, "la schermata deve poter dire «mostro 60 di 476»");
  assert.equal(s.troncato.preferenze_nicola.totali, j.preferenze_nicola.filter(Boolean).length);
});

prova("dati storti non fanno saltare la risposta", () => {
  assert.deepEqual(S.apprendimentoSnello(null), null);
  const vuoto = S.apprendimentoSnello({});
  assert.deepEqual(vuoto.lezioni, []);
  assert.equal(vuoto.troncato.lezioni.totali, 0);
  const storto = S.apprendimentoSnello({ lezioni: "non una lista", principi: null });
  assert.deepEqual(storto.lezioni, [], "una lista che non è una lista non deve lanciare");
});

prova("il tetto NON è una finestra temporale: l'archivio ha 30 giorni in tutto", () => {
  // La prima versione tagliava «gli ultimi 30 giorni». Misurato sul file vero: 472 lezioni su 476 sono
  // nate negli ultimi 30 giorni — la finestra non tagliava NIENTE. Una finestra su un volume
  // illimitato non è un limite.
  const src = leggi("pannello/src/lib/risposta-snella.ts");
  assert.doesNotMatch(src, /GIORNI_LEZIONI/, "la finestra temporale è stata tolta, non affiancata");
  assert.match(src, /slice\(-max\)/, "il tetto è sul conteggio");
});

prova("la logica sta dove un test la può ESEGUIRE, non dentro la route", () => {
  // È la regola che questo cantiere applica da dieci lotti, e che AR-247 aveva violato: incastrata in
  // `route.ts` insieme a `next/server`, si poteva solo guardare, non far girare.
  const route = leggi("pannello/src/app/api/memoria/auto-coscienza/route.ts");
  assert.match(route, /from "@\/lib\/risposta-snella"/, "la route deve IMPORTARE la decisione");
  assert.doesNotMatch(route, /export function apprendimentoSnello/, "e non contenerla");
});

// ── la malattia non deve allargarsi ──────────────────────────────────────────
prova("la spazzata dei fratelli è verde e il tetto è sceso", () => {
  const out = execFileSync("node", [join(REPO, "cervello/spazzata-fratelli.mjs"), "--json"], { cwd: REPO, encoding: "utf8" });
  const j = JSON.parse(out);
  assert.equal(j.ok, true, "una malattia si è allargata mentre curavo questa");
  const ing = j.malattie.find((m) => m.id === "errore-ingoiato");
  assert.ok(ing.baseline <= 80, `il tetto degli errori ingoiati non può salire: è ${ing.baseline}`);
});

for (const eseguo of daFare) await eseguo();

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
