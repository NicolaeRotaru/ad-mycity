#!/usr/bin/env node
// AR-624 · AR-625 — le due porte laterali che rimettevano in coda un'azione reale già partita.
//
// Il danno, per capire cosa protegge questo file: un'azione reale interrotta a metà può avere già
// mandato la sua email o fatto il suo payout senza essere ancora marcata «fatta». Rimetterla in coda
// significa mandarla due volte, a un negozio o a un cliente veri, senza che Nicola l'abbia
// rifirmata. Il worker lo sapeva e non lo faceva. Il bottone del Pannello e lo script del VPS sì.
//
// LA RAGIONE PER CUI ESISTEVA IL BUCO, che è la regola generale del cantiere: il freno stava dentro
// il COMANDO principale invece che sul DATO. Ogni canale nuovo che scrive nello stesso posto eredita
// zero cancelli, perché non c'è niente da ereditare.
//
// Questo test fa due mestieri:
//   ① la STESSA tabella di casi passa dalla decisione TypeScript e da quella bash, e i verdetti
//      devono coincidere: due copie che non possono divergere in silenzio;
//   ② le due porte devono CHIAMARLA davvero — un modulo importato e mai usato somiglia moltissimo
//      a una difesa attiva.

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { decidiRecupero, etaMinuti, SOGLIA_VIVO_MIN } =
  await import(join(REPO, "pannello/src/lib/recupero-lavoro.ts"));

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};
const leggi = (p) => readFileSync(join(REPO, p), "utf8");

/** La decisione bash, chiamata come la chiama lo script del VPS. */
const decisioneBash = (tipo, owner, eta) =>
  execFileSync("bash", ["-c",
    `. "${join(REPO, "cervello/lib-recupero.sh")}"; _recupero_decisione "$1" "$2" "$3"`,
    "_", String(tipo), String(owner), String(eta)], { encoding: "utf8" }).trim();

// La tabella. Ogni riga è uno scenario vero, non una combinazione astratta.
const ADESSO = Date.parse("2026-08-13T21:00:00Z");
const minutiFa = (m) => new Date(ADESSO - m * 60000).toISOString();
const TABELLA = [
  { nome: "azione reale interrotta, appena successo", lavoro: { tipo: "esegui-azione", worker_owner: "", updated_at: minutiFa(1) }, atteso: "riapprova" },
  { nome: "azione reale interrotta e vecchia di giorni", lavoro: { tipo: "esegui-azione", worker_owner: "", updated_at: minutiFa(4000) }, atteso: "riapprova" },
  { nome: "proposta interrotta con un worker che la teneva", lavoro: { tipo: "proposta", worker_owner: "all:vps:1", updated_at: minutiFa(2) }, atteso: "riapprova" },
  { nome: "giro VIVO: un worker lo sta eseguendo adesso", lavoro: { tipo: "giro", worker_owner: "all:vps:1", updated_at: minutiFa(2) }, atteso: "lascia" },
  { nome: "chat VIVA di un altro worker", lavoro: { tipo: "chat", worker_owner: "chat:vps:9", updated_at: minutiFa(30) }, atteso: "lascia" },
  { nome: "giro abbandonato: owner c'è ma è fermo oltre la soglia", lavoro: { tipo: "giro", worker_owner: "all:vps:1", updated_at: minutiFa(90) }, atteso: "riaccoda" },
  { nome: "metabolizza senza nessun proprietario", lavoro: { tipo: "metabolizza", worker_owner: "", updated_at: minutiFa(1) }, atteso: "riaccoda" },
  { nome: "lavoro senza data: non resta bloccato per sempre", lavoro: { tipo: "giro", worker_owner: "all:vps:1", updated_at: null }, atteso: "riaccoda" },
];

// ─────────────────── ① la stessa regola, due linguaggi, stessi verdetti ───────────────────

for (const c of TABELLA) {
  prova(`${c.nome} → ${c.atteso}`, () => {
    const ts = decidiRecupero(c.lavoro, { adesso: ADESSO });
    assert.equal(ts.azione, c.atteso, `TypeScript: ${ts.azione} (${ts.perche})`);
    assert.ok(ts.perche && ts.perche.length > 10, "un verdetto senza perché non si può contestare");
    const eta = Math.round(etaMinuti(c.lavoro.updated_at, ADESSO) === Infinity ? 99999
      : etaMinuti(c.lavoro.updated_at, ADESSO));
    assert.equal(decisioneBash(c.lavoro.tipo, c.lavoro.worker_owner, eta), c.atteso,
      "la copia bash ha deciso diversamente dalla TypeScript: le due porte sono divergenti");
  });
}

prova("nessuna azione reale è riaccodabile, per nessuna età e nessun proprietario", () => {
  // La regola che vale sempre, provata su tutto lo spazio invece che su un esempio.
  for (const tipo of ["esegui-azione", "proposta"]) {
    for (const eta of [0, 1, 59, 60, 61, 99999]) {
      for (const owner of ["", "all:vps:1"]) {
        const ts = decidiRecupero({ tipo, worker_owner: owner, updated_at: new Date(ADESSO - eta * 60000).toISOString() }, { adesso: ADESSO });
        assert.equal(ts.azione, "riapprova", `${tipo} a ${eta} min con owner="${owner}" è tornato riaccodabile`);
        assert.equal(decisioneBash(tipo, owner, eta), "riapprova", `bash: ${tipo} a ${eta} min`);
      }
    }
  }
});

prova("la soglia del «vivo» è la stessa nei due linguaggi", () => {
  // Un minuto prima e uno dopo: se una delle due copie sposta la soglia, qui si vede.
  const sopra = { tipo: "giro", worker_owner: "all:vps:1", updated_at: minutiFa(SOGLIA_VIVO_MIN + 1) };
  const sotto = { tipo: "giro", worker_owner: "all:vps:1", updated_at: minutiFa(SOGLIA_VIVO_MIN - 1) };
  assert.equal(decidiRecupero(sotto, { adesso: ADESSO }).azione, "lascia");
  assert.equal(decidiRecupero(sopra, { adesso: ADESSO }).azione, "riaccoda");
  assert.equal(decisioneBash("giro", "all:vps:1", SOGLIA_VIVO_MIN - 1), "lascia");
  assert.equal(decisioneBash("giro", "all:vps:1", SOGLIA_VIVO_MIN + 1), "riaccoda");
});

// ─────────────────── ② le due porte la chiamano davvero ───────────────────

prova("AR-624: il bottone del Pannello passa dalla decisione condivisa e non tocca le azioni reali", () => {
  const route = leggi("pannello/src/app/api/lavori/recupera/route.ts");
  assert.match(route, /from "@\/lib\/recupero-lavoro"/, "la route non importa più la decisione condivisa");
  assert.match(route, /decidiRecupero\(row, \{ adesso \}\)/, "la route non chiama la decisione: il freno è scollegato");
  assert.match(route, /azione === "riapprova"/, "manca il ramo che salta le azioni reali");
  assert.match(route, /azione === "lascia"/, "manca il ramo che lascia stare i lavori vivi");
  // Il select deve portare i dati su cui la decisione poggia, o deciderebbe su campi vuoti.
  assert.match(route, /select=\$\{select\}/, "il select non è più parametrico");
  assert.match(route, /id,tipo,updated_at,worker_owner/, "il select non chiede più owner e data: la decisione sarebbe cieca");
  // E ciò che non tocca lo DICE: un bottone che salta due azioni in silenzio insegna ad aggirarlo.
  assert.match(route, /da_riapprovare/, "la risposta non dice quante azioni ha lasciato stare");
});

prova("AR-624: lo script del VPS passa dalla stessa decisione", () => {
  const sh = leggi("cervello/vps/recupera-lavori-orfani.sh");
  assert.match(sh, /lib-recupero\.sh/, "lo script non carica più la libreria condivisa");
  assert.match(sh, /_recupero_decisione "\$tipo" "\$owner" "\$eta"/, "lo script non chiama la decisione");
  assert.match(sh, /riapprova\)/, "manca il ramo che salta le azioni reali");
  assert.doesNotMatch(sh, /jq -c '\.\[\]' \| while read -r row do?/, "è tornato il ciclo cieco su ogni in_corso");
  // La prova che conta: nel corpo del ciclo la PATCH sta SOLO nel ramo di default.
  const dopoCase = sh.slice(sh.indexOf("case \"$(_recupero_decisione"));
  const ramoRiapprova = dopoCase.slice(dopoCase.indexOf("riapprova)"), dopoCase.indexOf("lascia)"));
  assert.doesNotMatch(ramoRiapprova, /-X PATCH/, "il ramo «riapprova» scrive lo stesso sul database");
});

prova("AR-625: la decisione orfani del worker guarda host e pid, non la sola corsia", () => {
  // Il caso della scheda, riprodotto: un gemello VIVO della mia stessa corsia, a zero minuti.
  // Fino al 13/8 questa riga stampava «procedi» e chiudeva in errore un'azione reale in esecuzione.
  const fn = `${estrai("_gemello_vivo")}\n${estrai("_orfano_decisione")}\n`;
  const chiedi = (...args) =>
    execFileSync("bash", ["-c", `${fn}\n_orfano_decisione "$@"`, "_", ...args.map(String)], { encoding: "utf8" }).trim();

  assert.equal(chiedi(1, "all:vps:111", "all:vps:222", 0, 4, 60, 1), "lascia",
    "un gemello VIVO della mia corsia viene ancora recuperato a zero minuti");
  // Il caso che conta davvero, e che la prima stesura di questa prova non aveva: a zero minuti la
  // grazia per età salva il lavoro comunque, quindi il verde non dimostrava che il pid fosse
  // guardato. L'ha trovato la mutazione, rompendo il ramo del pid e lasciando il test verde. Qui
  // l'età è OLTRE la grazia: se non comanda il pid, questo diventa «procedi».
  assert.equal(chiedi(1, "all:vps:111", "all:vps:222", 30, 4, 60, 1), "lascia",
    "un gemello vivo da mezz'ora viene recuperato: il verdetto del pid non conta niente");
  assert.equal(chiedi(1, "all:vps:111", "all:vps:222", 0, 4, 60, 0), "procedi",
    "col pid morto è un orfano vero: va recuperato subito, o la coda si blocca");
  assert.equal(chiedi(1, "all", "all", 1, 4, 60), "lascia", "senza host:pid deve valere la grazia per età");
  assert.equal(chiedi(1, "all", "all", 10, 4, 60), "procedi", "oltre la grazia si procede");
  assert.equal(chiedi(1, "all", "chat", 5, 4, 60), "lascia", "un'altra corsia recente si lascia stare");
  assert.equal(chiedi(1, "all", "chat", 90, 4, 60), "procedi", "un'altra corsia antica: quel worker è morto");

  // E il verdetto del pid deve essere VERO, non una costante: il pid di questo processo esiste.
  const vivo = (owner, mio) =>
    execFileSync("bash", ["-c", `${fn}\n_gemello_vivo "$1" "$2"`, "_", owner, mio], { encoding: "utf8" }).trim();
  assert.equal(vivo(`all:${host()}:${process.pid}`, `all:${host()}:999999`), "1", "un pid vivo deve risultare vivo");
  assert.equal(vivo(`all:${host()}:2147480000`, `all:${host()}:${process.pid}`), "0", "un pid inesistente deve risultare morto");
  assert.equal(vivo("all:altra-macchina:1", `all:${host()}:${process.pid}`), "", "da un altro host non si inventa un verdetto");
});

prova("AR-659: le cinque copie della lista «azione reale» dicono tutte la stessa cosa", () => {
  // Trovato nel secondo giro di questo lotto, e in parte l'ho aggiunto io: «quali tipi sono azioni
  // reali» vive in CINQUE posti con QUATTRO nomi diversi (TIPI_AZIONE, TIPI_PROTETTI,
  // TIPI_AZIONE_REALE, più due `case` in bash). Unificarli è un lavoro suo — è registrato come
  // AR-659 — ma finché sono cinque, almeno non possono divergere in silenzio: qui si leggono tutti
  // e si pretende lo stesso contenuto. Se qualcuno aggiunge un sesto tipo di azione reale in un
  // posto solo, questa riga diventa rossa prima che quel tipo torni riaccodabile da una porta.
  const atteso = ["esegui-azione", "proposta"];
  const copie = {
    "pannello/src/lib/recupero-lavoro.ts": /TIPI_AZIONE_REALE = \[([^\]]+)\]/,
    "cervello/sentinella-lavori.mjs": /const TIPI_AZIONE = \[([^\]]+)\]/,
    "cervello/pulisci-coda.mjs": /const TIPI_PROTETTI = \[([^\]]+)\]/,
  };
  for (const [file, re] of Object.entries(copie)) {
    const m = leggi(file).match(re);
    assert.ok(m, `${file}: la lista dei tipi di azione reale non si trova più`);
    const tipi = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]).sort();
    assert.deepEqual(tipi, atteso, `${file} elenca ${tipi.join(", ")} invece di ${atteso.join(", ")}`);
  }
  // Le due copie in bash, che sono `case` e non array.
  for (const file of ["cervello/lib-recupero.sh", "cervello/worker.sh"]) {
    assert.match(leggi(file), /case " esegui-azione proposta " in/,
      `${file}: il filtro sui tipi di azione reale è cambiato o sparito`);
  }
  // `retry-policy.mjs` ha lo stesso NOME con un contenuto diverso, ed è voluto: lì la domanda è
  // «quale tipo aziona davvero le mani», non «quale non si riaccoda». Pinzata perché quella
  // differenza resti una scelta e non diventi una svista.
  assert.match(leggi("cervello/retry-policy.mjs"), /TIPI_AZIONE_REALE = new Set\(\["esegui-azione"\]\)/,
    "retry-policy: la lista con lo stesso nome e contenuto diverso è cambiata — è voluta, ma va vista");
});

prova("AR-625: il worker passa l'owner intero e il verdetto del pid alla decisione", () => {
  const w = leggi("cervello/worker.sh");
  assert.match(w, /_orfano_decisione "\$\{HAS_OWNER_COL:-0\}" "\$owner" "\$WORKER_ID"/,
    "il worker passa ancora la sola corsia: il fix è nel modulo ma non arriva al punto malato");
  assert.match(w, /_gemello_vivo "\$owner" "\$WORKER_ID"/, "_gemello_vivo non viene mai chiamato: è codice morto");
});

function estrai(nome) {
  const w = leggi("cervello/worker.sh");
  const dentro = w.match(new RegExp(`^${nome}\\(\\) \\{[\\s\\S]*?^\\}`, "m"));
  assert.ok(dentro, `${nome}() non esiste più in worker.sh`);
  return dentro[0];
}
function host() {
  return execFileSync("hostname", { encoding: "utf8" }).trim();
}

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
