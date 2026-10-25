// Le schede di un'ondata, preparate a zero agenti (node --test).
//
// Cosa si prova, e perche' ognuna di queste cose: una scheda mancante che diventa un pacchetto piu'
// corto con uscita 0 farebbe chiudere a una squadra un pacchetto incompleto; una scheda che sfonda il
// tetto riporta nel contesto delle squadre la storia da 11 KB che questo script esiste per togliere;
// un rischio sbagliato toglie la seconda lente proprio ai pacchetti che toccano i soldi. Piano e
// registro sono finti, in una cartella temporanea; la mappa delle lenti e' quella vera.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chiaveProblema } from "../referti-sito.mjs";
import {
  TETTO_SCHEDA, schedaCompatta, tagliaTesto, rischioDi, dimensioniSconosciute, fileDelPacchetto,
  lentiPerFile, preparaOndata, leggiArgomenti, RISCHIO_DELLE_DIMENSIONI, soloCoordinate, rischioDalNome,
  rischioDalTesto, fileCitati, percorsoDelSito, rischioDeiSegreti, fileDelRilascio,
} from "../schede-pacchetto.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(QUI, "..", "schede-pacchetto.mjs");
const MAPPA = JSON.parse(readFileSync(join(QUI, "..", "dimensioni-radiografia.json"), "utf8"));
const byte = (o) => Buffer.byteLength(JSON.stringify(o), "utf8");

const scheda = (dimensione, titolo, extra = {}) => ({
  dimensione, titolo, severita: "grave", stato: "aperto", file: "lib/stripe/payout.ts:771",
  descrizione: "corta", impatto: "medio", fix: "fai cosi'", reparto: "x",
  nota_riparazione: "STORIA ".repeat(500), riverifica: "storia", riaperto_da: "storia", giro: "g1",
  ...extra,
});

function sabbiera() {
  const dir = mkdtempSync(join(tmpdir(), "schede-pacchetto-"));
  const A = scheda("pagamenti-stripe", "Il rimborso doppio rimette la merce a scaffale due volte");
  // «Avanti» e non «Paga»: dal 25/10 il testo della scheda accende il rischio, e «paga» e' soldi.
  const B = scheda("frontend-ux", "Il pulsante «Avanti» sparisce su telefono", { file: "components/cart/Pay.tsx:12", descrizione: "è “lunga” 🛒\n\"x\" ".repeat(900) });
  const C = scheda("deploy-sre", "La copia del database muore per le foto", { file: ".github/workflows/backup-db.yml:40", stato: "chiuso" });
  const D = scheda("rls-database", "La policy lascia leggere gli ordini altrui", { file: "migrations/120_x.sql:5" });
  // L'ondata 3 porta i casi scomodi del registro vero: una scheda «riparato» (18 nel registro il
  // 25/10), due schede con la stessa chiave di cui la PRIMA e' chiusa, e una scheda che ha la causa
  // radice e solo `impatto_crescita` (il ripiego che riguarda 229 schede).
  const E = scheda("api-backend", "Il riparato non torna in squadra", { file: "lib/ordini/annulla.ts:10", stato: "riparato" });
  const F1 = scheda("api-backend", "La stessa chiave due volte", { file: "lib/ordini/annulla.ts:20", stato: "chiuso", descrizione: "quella chiusa" });
  const F2 = scheda("api-backend", "La stessa chiave due volte", { file: "lib/ordini/annulla.ts:20", descrizione: "quella aperta" });
  const G = scheda("architettura", "Il cookie di sessione vive troppo", {
    file: "lib/auth/cookie-di-sessione.ts:5", impatto: undefined, impatto_crescita: "chi ruba il cookie resta dentro",
    causa_radice: "la scadenza la decide il client",
  });
  const registro = { problemi: [A, B, C, D, E, F1, F2, G] };
  const piano = {
    registro: "sito",
    ondate: [
      [{ chiave: "lib/stripe/payout.ts", difetti: [{ chiave: chiaveProblema(A) }] }],
      [
        { chiave: "components/cart/Pay.tsx", difetti: [{ chiave: chiaveProblema(B) }] },
        { chiave: ".github/workflows/backup-db.yml", difetti: [{ chiave: chiaveProblema(C) }] },
        { chiave: "migrations/120_x.sql (parte 1 di 2)", difetti: [{ chiave: chiaveProblema(D) }] },
      ],
      [
        { chiave: "lib/ordini/annulla.ts", difetti: [{ chiave: chiaveProblema(E) }, { chiave: chiaveProblema(F1) }] },
        { chiave: "lib/auth/cookie-di-sessione.ts", difetti: [{ chiave: chiaveProblema(G) }] },
      ],
    ],
  };
  const filePiano = join(dir, "piano.json");
  const fileRegistro = join(dir, "registro.json");
  writeFileSync(filePiano, JSON.stringify(piano));
  writeFileSync(fileRegistro, JSON.stringify(registro));
  return { dir, filePiano, fileRegistro, piano, registro, A, B, C, D, E, F2, G };
}

const lancia = (...argomenti) => spawnSync(process.execPath, [SCRIPT, ...argomenti], { encoding: "utf8" });

test("le schede si ritrovano con chiaveProblema, senza storia, e l'args e' quello che il workflow legge", () => {
  const s = sabbiera();
  try {
    const r = lancia("--piano", s.filePiano, "--registro", s.fileRegistro, "--ondata", "1", "--json");
    assert.equal(r.status, 0, r.stderr);
    const a = JSON.parse(r.stdout);
    assert.deepEqual(Object.keys(a).sort(), ["lenti_per_file", "ondata", "pacchetti", "piano"]);
    assert.equal(a.ondata, 1);
    const [p] = a.pacchetti;
    assert.equal(p.chiave, "lib/stripe/payout.ts");
    assert.deepEqual(p.file, ["lib/stripe/payout.ts"]);
    assert.equal(p.rischio, "soldi");
    assert.equal(p.difetti[0].chiave, chiaveProblema(s.A), "la chiave di chiusura non e' quella di casa");
    for (const storia of ["nota_riparazione", "riverifica", "riaperto_da", "giro", "reparto", "stato"]) {
      assert.equal(p.difetti[0][storia], undefined, `${storia} e' storia: alla squadra non serve`);
    }
    assert.equal(p.difetti[0].dove, "lib/stripe/payout.ts:771");
    assert.equal(a.lenti_per_file["lib/stripe/payout.ts"], "pagamenti-stripe");
  } finally {
    rmSync(s.dir, { recursive: true, force: true });
  }
});

test("una scheda che non si ritrova: uscita 2, elencata, e nessun JSON spacciato per completo", () => {
  const s = sabbiera();
  try {
    s.piano.ondate[1][0].difetti.push({ chiave: "frontend-ux|una scheda che il registro non ha" });
    writeFileSync(s.filePiano, JSON.stringify(s.piano));
    const r = lancia("--piano", s.filePiano, "--registro", s.fileRegistro, "--ondata", "2", "--json");
    assert.equal(r.status, 2);
    assert.equal(r.stdout.trim(), "", "con una scheda mancante non deve uscire nessun args");
    assert.match(r.stderr, /una scheda che il registro non ha/);
    assert.match(r.stderr, /components\/cart\/Pay\.tsx/, "deve dire di quale pacchetto e'");
  } finally {
    rmSync(s.dir, { recursive: true, force: true });
  }
});

test("il piano o l'ondata che non esistono escono 2, e cosi' un argomento storto", () => {
  const s = sabbiera();
  try {
    assert.equal(lancia("--piano", join(s.dir, "nessuno.json"), "--ondata", "1").status, 2);
    assert.equal(lancia("--piano", s.filePiano, "--registro", s.fileRegistro, "--ondata", "4").status, 2);
    assert.equal(lancia("--piano", s.filePiano, "--registro", s.fileRegistro, "--ondata", "0").status, 2);
    assert.equal(lancia("--piano", s.filePiano, "--ondata", "1", "-json").status, 2);
    assert.match(leggiArgomenti(["--piano", "x", "--ondata", "abc"]).errore, /intero/);
    writeFileSync(s.filePiano, JSON.stringify({ ...s.piano, registro: "macchina" }));
    assert.equal(lancia("--piano", s.filePiano, "--registro", s.fileRegistro, "--ondata", "1").status, 2, "un piano della macchina non e' del sito");
  } finally {
    rmSync(s.dir, { recursive: true, force: true });
  }
});

test("il tetto in byte regge anche su accenti, emoji, virgolette e a capo; le schede corte restano intere", () => {
  const s = sabbiera();
  const lunga = schedaCompatta(s.B);
  assert.ok(byte(lunga) <= TETTO_SCHEDA, `la scheda pesa ${byte(lunga)} byte, oltre il tetto di ${TETTO_SCHEDA}`);
  assert.equal(lunga.tagliato, true);
  assert.equal(lunga.titolo, s.B.titolo, "il titolo e' corto: non va sacrificato per la descrizione");
  assert.equal(lunga.dimensione, "frontend-ux");
  assert.ok(lunga.descrizione.endsWith("…") && lunga.descrizione.length > 200, "la descrizione deve restare, tagliata, non sparire");
  const corta = schedaCompatta(s.A);
  assert.equal(corta.tagliato, undefined);
  assert.equal(corta.descrizione, "corta");
  for (const t of [400, 700, 1000, 2000]) assert.ok(byte(schedaCompatta(s.B, t)) <= t, `tetto ${t} sfondato`);
  // Il taglio non spezza un'emoji a meta': il testo tagliato deve restare UTF-8 valido.
  const t = tagliaTesto("🛒".repeat(50), 20);
  assert.ok(Buffer.byteLength(JSON.stringify(t)) - 2 <= 20);
  assert.equal(Buffer.from(t, "utf8").toString("utf8"), t);
});

test("il rischio viene dalla mappa delle lenti: soldi prima di dati prima di permessi", () => {
  assert.equal(rischioDi({ file: ["lib/stripe/payout.ts"] }, MAPPA).rischio, "soldi");
  assert.equal(rischioDi({ file: ["app/checkout/page.tsx"] }, MAPPA).rischio, "soldi", "il checkout ha la lente dei pagamenti fra le consigliate");
  assert.equal(rischioDi({ file: ["migrations/120_x.sql"] }, MAPPA).rischio, "dati");
  assert.equal(rischioDi({ file: ["app/api/auth/callback/route.ts"] }, MAPPA).rischio, "permessi");
  assert.equal(rischioDi({ file: ["components/cart/Pay.tsx"], dimensioni: ["frontend-ux"] }, MAPPA).rischio, "nessuno");
  assert.equal(rischioDi({ dimensioni: ["sicurezza-auth", "pagamenti-stripe"] }, MAPPA).rischio, "soldi");
  assert.equal(rischioDi({ file: ["migrations/1.sql", "app/api/admin/x/route.ts"] }, MAPPA).rischio, "dati");
  assert.equal(rischioDi({ file: ["tests/unit/x.test.ts"] }, MAPPA).rischio, "nessuno", "fuori perimetro non e' un rischio");
  assert.ok(rischioDi({ file: ["lib/stripe/payout.ts"] }, MAPPA).perche[0].includes("lib/stripe/payout.ts"), "il perche' deve nominare il file");
});

test("la tabella del rischio e' viva: ogni sua dimensione esiste nella mappa vera, e una rinominata si vede", () => {
  assert.deepEqual(dimensioniSconosciute(MAPPA), []);
  const rinominata = structuredClone(MAPPA);
  rinominata.case.marketplace.dimensioni = rinominata.case.marketplace.dimensioni.filter((d) => d !== "pagamenti-stripe");
  assert.deepEqual(dimensioniSconosciute(rinominata), ["pagamenti-stripe"]);
  const s = sabbiera();
  try {
    const e = preparaOndata({ piano: s.piano, registro: s.registro, mappa: rinominata, ondata: 1 });
    assert.equal(e.ok, false, "con la mappa cambiata non si prepara un'ondata che direbbe «nessuno» ai pagamenti");
  } finally {
    rmSync(s.dir, { recursive: true, force: true });
  }
  assert.ok(Object.keys(RISCHIO_DELLE_DIMENSIONI).length >= 3);
});

test("le schede gia' chiuse non vanno alle squadre: escono in gia_chiusi; il territorio toglie la «parte»", () => {
  const s = sabbiera();
  try {
    const e = preparaOndata({ piano: s.piano, registro: s.registro, mappa: MAPPA, ondata: 2, nomePiano: "p.json" });
    assert.equal(e.ok, true, e.motivo);
    const backup = e.args.pacchetti.find((p) => p.chiave.includes("backup-db"));
    assert.deepEqual(backup.difetti, []);
    assert.deepEqual(backup.gia_chiusi, [{ chiave: chiaveProblema(s.C), stato: "chiuso" }]);
    assert.equal(e.conti.gia_chiusi, 1);
    assert.equal(e.conti.schede, 2);
    const mig = e.args.pacchetti.find((p) => p.chiave.startsWith("migrations/"));
    assert.deepEqual(mig.file, ["migrations/120_x.sql"]);
    assert.equal(mig.rischio, "dati");
    assert.equal(e.args.pacchetti.find((p) => p.chiave.startsWith("components/")).rischio, "nessuno");
    assert.equal(lentiPerFile(["components/cart/Pay.tsx", "tests/unit/a.test.ts"], MAPPA)["components/cart/Pay.tsx"], "frontend-ux");
    assert.equal(lentiPerFile(["tests/unit/a.test.ts"], MAPPA)["tests/unit/a.test.ts"], undefined);
  } finally {
    rmSync(s.dir, { recursive: true, force: true });
  }
});

test("i casi scomodi del registro: riparato fuori, chiave doppia presa aperta, causa radice e ripiego copiati, lenti di tutti i pacchetti", () => {
  const s = sabbiera();
  try {
    const e = preparaOndata({ piano: s.piano, registro: s.registro, mappa: MAPPA, ondata: 3 });
    assert.equal(e.ok, true, e.motivo);
    const [annulla, cookie] = e.args.pacchetti;
    assert.deepEqual(annulla.gia_chiusi, [{ chiave: chiaveProblema(s.E), stato: "riparato" }], "una scheda «riparato» non e' aperta: non va a una squadra");
    assert.deepEqual(annulla.difetti.map((d) => d.descrizione), ["quella aperta"], "con due schede e la stessa chiave, la squadra riceve quella aperta");
    const [g] = cookie.difetti;
    assert.equal(g.causa_radice, s.G.causa_radice);
    assert.equal(g.impatto, s.G.impatto_crescita, "senza «impatto» si ripiega su «impatto_crescita»");
    assert.deepEqual(Object.keys(e.args.lenti_per_file).sort(), ["lib/auth/cookie-di-sessione.ts", "lib/ordini/annulla.ts"], "le lenti di TUTTI i pacchetti, non dell'ultimo");
    assert.equal(annulla.rischio, "soldi");
    assert.equal(cookie.rischio, "permessi");
  } finally {
    rmSync(s.dir, { recursive: true, force: true });
  }
});

test("il rischio dai nomi copre i file del piano vero che la mappa chiama «architettura»", () => {
  // I sei casi che il collaudo del 25/10 ha trovato a «nessuno» sul piano del 15/10, piu' due di controllo.
  const casi = {
    "lib/auth/cookie-di-sessione.ts": "permessi",
    "lib/admin/esporta-utenti.ts": "dati",
    "app/admin/payouts/page.tsx": "soldi",
    "lib/cron-cancellazioni.ts": "dati",
    "scripts/backup-db.sh": "dati",
    ".github/workflows/backup-db.yml": "dati",
    "lib/ordini/annulla.ts": "soldi",
    "app/admin/orders/page.tsx": "soldi",
    "lib/analytics/posthog.tsx": "dati",
    "lib/utils/format.ts": "nessuno",
    "app/page.tsx": "nessuno",
  };
  for (const [f, atteso] of Object.entries(casi)) assert.equal(rischioDi({ file: [f] }, MAPPA).rischio, atteso, f);
  assert.equal(rischioDi({ file: ["tests/e2e/12-la-cassa.spec.ts"] }, MAPPA).rischio, "nessuno", "il nome non accende un file fuori perimetro");
  assert.equal(rischioDalNome("components/rider/CashConfirmDialog.tsx")?.pezzo, "cash", "le maiuscole di CamelCase dividono i pezzi");
  assert.equal(rischioDalNome("components/Border.tsx"), null, "una radice vale all'inizio di un pezzo, non in mezzo");
});

test("«dove» non perde le righe: se non ci sta, cadono le spiegazioni e restano tutte le coordinate", () => {
  const s = sabbiera();
  const dove = Array.from({ length: 9 }, (_, i) => `app/rider/orders/[id]/page.tsx:${200 + i * 10}-${205 + i * 10} (${"spiegazione lunga ".repeat(6)})`).join(" · ") + " · lib/x.ts:7";
  const c = schedaCompatta({ ...s.A, file: dove, descrizione: "d".repeat(3000) });
  assert.ok(byte(c) <= TETTO_SCHEDA);
  assert.ok(!c.dove.endsWith("…"), `«dove» tagliato: ${c.dove}`);
  for (const coordinata of soloCoordinate(dove).split(" · ")) assert.ok(c.dove.includes(coordinata), `persa ${coordinata}`);
  assert.ok(c.dove.includes("lib/x.ts:7"), "anche l'ultimo file tiene il suo numero di riga");
  assert.equal(schedaCompatta({ ...s.A, descrizione: "d".repeat(3000) }).dove, s.A.file, "un «dove» corto resta intero");
});

test("il territorio si conta come lo conta pacchetti-lotto: la stessa espressione dei file", () => {
  // Se pacchetti-lotto cambia il modo di riconoscere un file, le ondate si dividono su un insieme e
  // le squadre lavorano su un altro: la disgiunzione misurata non sarebbe piu' quella vera.
  const sorgente = (f) => readFileSync(join(QUI, "..", f), "utf8").match(/const RE_FILE = (.+);/)?.[1];
  const loro = sorgente("pacchetti-lotto.mjs");
  assert.ok(loro, "pacchetti-lotto.mjs non ha piu' RE_FILE: la prova e' cieca, non verde");
  assert.equal(sorgente("schede-pacchetto.mjs"), loro);
  assert.deepEqual(fileDelPacchetto("(nessun file citato)", [{ file: "page.tsx e app/a/page.tsx:3" }]), ["app/a/page.tsx"]);
});

test("il rischio dal testo della scheda: un fix sui prezzi non esce «nessuno» perche' il file ha un nome neutro", () => {
  // I tre casi veri del piano del 15/10 che il collaudo del 25/10 ha trovato ancora a «nessuno».
  const aiPatch = { file: ["lib/products/aiPatch.ts"], dimensioni: ["ai-endpoints"],
    testi: ["Il negoziante chiede in chat di cambiare un prezzo, la chat risponde «Modifiche salvate» e il prezzo resta quello vecchio"] };
  assert.equal(rischioDi({ ...aiPatch, testi: [] }, MAPPA).rischio, "nessuno", "senza il testo il file e' neutro: e' il caso da coprire");
  const r = rischioDi(aiPatch, MAPPA);
  assert.equal(r.rischio, "soldi");
  assert.match(r.perche[0], /scheda «Il negoziante.*» → «prezzo»/, "il perche' nomina la scheda e la parola");
  assert.equal(rischioDi({ file: ["tests/e2e/12-la-cassa.spec.ts"], testi: ["Falsa sicurezza proprio sul flusso che fa entrare i soldi"] }, MAPPA).rischio, "soldi");
  assert.equal(rischioDi({ file: ["lib/ai/tettoSpesa.ts"] }, MAPPA).rischio, "soldi", "il tetto di spesa AI e' soldi gia' dal nome");
  assert.equal(rischioDalTesto("«Traduci» sul catalogo intero lo cancella per tutti")?.rischio, "dati");
  // Le radici del testo sono strette: la prosa di tutti i giorni non accende niente.
  for (const neutro of ["Chi ha gia' un account non trova dove entrare: il costo e' fiducia e accessi persi",
    "La gente ha tempo di ordinare la domenica", "Pagine vuote danneggiano il posizionamento", "Succede spesso di sera"]) {
    assert.equal(rischioDalTesto(neutro), null, neutro);
  }
});

test("l'ordine del rischio: con soldi e dati insieme vince soldi, anche nei nomi", () => {
  assert.equal(rischioDi({ dimensioni: ["rls-database", "pagamenti-stripe"] }, MAPPA).rischio, "soldi");
  assert.equal(rischioDi({ file: ["migrations/1.sql", "lib/stripe/payout.ts"] }, MAPPA).rischio, "soldi");
  assert.equal(rischioDalNome("lib/backup/stripe-export.ts")?.rischio, "soldi");
  assert.equal(rischioDalTesto("cancella il backup e rimborsa due volte")?.rischio, "soldi");
});

test("i percorsi assoluti del registro: quelli del sito tornano relativi, quelli del disco restano fuori", () => {
  assert.equal(percorsoDelSito("/home/user/mycity/lib/stripe/payout.ts"), "lib/stripe/payout.ts");
  assert.equal(percorsoDelSito("/home/user/ad-mycity/marketplace/.github/workflows/ci.yml"), ".github/workflows/ci.yml");
  assert.equal(percorsoDelSito("/home/user/mycity/app/marketplace/page.tsx"), "app/marketplace/page.tsx", "la PRIMA radice del sito, non l'ultima");
  assert.equal(percorsoDelSito("/home/user/ad-mycity/consegne/salute/2026-10-10-chiavi-vercel.md"), null, "un file dell'AD non e' del sito");
  assert.equal(percorsoDelSito("/app/checkout/page.tsx"), "app/checkout/page.tsx", "la barra davanti a un percorso del sito");
  assert.equal(percorsoDelSito("marketplace/lib/x.ts"), "lib/x.ts");
  assert.equal(percorsoDelSito("./lib/x.ts"), "lib/x.ts");
  assert.deepEqual(fileCitati("vedi /home/user/ad-mycity/consegne/x.md, /home/user/mycity/lib/a.ts:3, /home/user/ad-mycity/marketplace/lib/b.ts, marketplace/lib/c.ts e ./lib/d.ts"),
    ["lib/a.ts", "lib/b.ts", "lib/c.ts", "lib/d.ts"]);
  assert.ok(!fileCitati("/route.ts e /page.tsx").length, "un nome nudo con la barra resta un nome nudo");
});

test("--tetto sotto il minimo e' un refuso: esce con errore, non taglia le schede a niente", () => {
  const base = ["--piano", "p.json", "--ondata", "1"];
  assert.match(leggiArgomenti([...base, "--tetto", "100"]).errore || "", /--tetto vuole un intero da \d+ byte/);
  assert.equal(leggiArgomenti([...base, "--tetto", "2000"]).tetto, 2000);
});

test("il testo della scheda arriva al rischio anche passando dal piano, non solo chiamando rischioDi", () => {
  const prezzo = scheda("ai-endpoints", "La chat dice «salvato» e il prezzo resta quello vecchio", { file: "lib/products/aiPatch.ts:35" });
  const piano = { registro: "sito", ondate: [[{ chiave: "lib/products/aiPatch.ts", difetti: [{ chiave: chiaveProblema(prezzo) }] }]] };
  const e = preparaOndata({ piano, registro: { problemi: [prezzo] }, mappa: MAPPA, ondata: 1 });
  assert.ok(e.ok, e.motivo);
  assert.equal(e.args.pacchetti[0].rischio, "soldi");
});

test("AR-1021 — segreti, accessi fra negozi, firme dei webhook e file del rilascio non escono «nessuno»", () => {
  // Il riesame del 25/10: questi pacchetti finivano con un collaudatore solo. La frase del revisore
  // per prima, poi le forme in cui la stessa cosa si scrive nel registro.
  assert.equal(rischioDi({ testi: ["la chiave service-role finisce nel bundle del browser"] }, MAPPA).rischio, "permessi");
  const permessi = [
    "La rotta usa SUPABASE_SERVICE_ROLE_KEY anche dal browser",
    "Il componente crea il client con serviceRole",
    "la chiave dell'AI arriva al client",
    "Il segreto dei lavori periodici si confronta lettera per lettera",
    "il token di accesso resta valido dopo l'uscita",
    "La firma dei webhook di Resend non si controlla mai",
    "Un webhook non firmato viene accettato lo stesso",
    "Il negoziante legge gli ordini altrui",
    "si vedono i dati di un altro negozio",
    "Senza CRON_SECRET il giro parte per chiunque",
  ];
  for (const t of permessi) assert.equal(rischioDeiSegreti(t)?.rischio, "permessi", t);
  // «dati» dove con quei poteri si SCRIVE.
  assert.equal(rischioDeiSegreti("il copilot modifica i prodotti di un altro negozio")?.rischio, "dati");
  assert.equal(rischioDeiSegreti("la rotta scrive le recensioni con la chiave di servizio")?.rischio, "dati");
  // Le frasi sono strette: la prosa di tutti i giorni e i nomi tecnici innocui restano neutri.
  for (const neutro of ["Il nome del token inganna: le etichette maiuscole respirano in quattro modi",
    "Il bundle della vetrina pesa 400 KB", "La parola chiave della ricerca non trova il pane",
    "in attesa di firma di Nicola", "Le recensioni degli altri clienti non compaiono", "La voce CART_UPDATED_AT_KEY del carrello",
    "Il cliente se ne va a un altro negozio"]) {
    assert.equal(rischioDeiSegreti(neutro), null, neutro);
  }
  // Il caso vero dell'ondata 8: titolo e impatto non nominano la chiave, la descrizione si'.
  const aiClient = { file: ["lib/ai/client.ts", "app/api/ai/description/route.ts"], dimensioni: ["ai-endpoints"],
    testi: ["In produzione tutti i pulsanti di intelligenza artificiale rispondono «servizio non configurato»"] };
  assert.equal(rischioDi(aiClient, MAPPA).rischio, "nessuno", "senza la descrizione il caso non si vede: e' quello da coprire");
  assert.equal(rischioDi({ ...aiClient, dettagli: ["In produzione la chiave ANTHROPIC_API_KEY non c'e'"] }, MAPPA).rischio, "permessi");
  // I file del rilascio: fra i file del pacchetto e, per quelli nudi nella radice, nel «dove» grezzo.
  assert.equal(rischioDi({ file: [".github/workflows/ci.yml"] }, MAPPA).rischio, "permessi");
  assert.equal(rischioDi({ dove: ["vercel.json:12 (le intestazioni)"] }, MAPPA).rischio, "permessi");
  assert.deepEqual(fileDelRilascio("vercel.json · /home/user/ad-mycity/.github/workflows/giro.yml · scripts/x.sh"), ["vercel.json"],
    "un workflow dell'AD non e' un file del rilascio del sito");
  assert.equal(rischioDi({ file: ["lib/webhooks/resend.ts"] }, MAPPA).rischio, "permessi", "il nome «webhook» accende il file");
  assert.equal(rischioDi({ file: ["lib/queries/keys.ts"] }, MAPPA).rischio, "nessuno", "le chiavi delle query non sono segreti");
});

test("AR-1021 — il segreto nella descrizione arriva al rischio anche passando dal piano", () => {
  const ai = scheda("ai-endpoints", "Tutti i pulsanti AI rispondono «servizio non configurato»", {
    file: "lib/ai/client.ts:108-130", impatto: "il negozio prova l'AI e fallisce", descrizione: "In produzione la chiave ANTHROPIC_API_KEY non c'e'",
  });
  const rilascio = scheda("deploy-sre", "Le intestazioni del rilascio non si applicano", { file: "vercel.json:3", impatto: "nessun effetto visibile", descrizione: "corta" });
  const piano = { registro: "sito", ondate: [[
    { chiave: "lib/ai/client.ts", difetti: [{ chiave: chiaveProblema(ai) }] },
    { chiave: "vercel.json", difetti: [{ chiave: chiaveProblema(rilascio) }] },
  ]] };
  const e = preparaOndata({ piano, registro: { problemi: [ai, rilascio] }, mappa: MAPPA, ondata: 1 });
  assert.ok(e.ok, e.motivo);
  assert.deepEqual(e.args.pacchetti.map((p) => p.rischio), ["permessi", "permessi"]);
  assert.match(e.args.pacchetti[1].perche_rischio[0], /vercel\.json → file del rilascio/);
});
