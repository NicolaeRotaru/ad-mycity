#!/usr/bin/env node
// Prova l'esito del giro (AR-300 / AR-301 / AR-320) ESEGUENDO la funzione vera di
// cervello/giro-esito.sh con casi concreti — non leggendo il codice per vedere se «contiene» qualcosa.
//
// Il caso che conta è il primo: fino al 27/7 un giro con tutti i cancelli rossi usciva 0, il worker
// lo segnava «fatto» e il Pannello lo mostrava verde. Ogni numero di salute della macchina poggiava
// su quella risposta sbagliata.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const SH = join(QUI, "..", "giro-esito.sh");

/** Esegue la funzione reale in una bash pulita e restituisce il codice deciso. */
function rc({ memoriaIncoerente = 0, hadChanges = 1, pushOk = 1, aiRc = 0, gateRossi = 0, nonConsegnati = 0 }) {
  const out = execFileSync(
    "bash",
    ["-c", `. "${SH}"; esito_giro_rc ${memoriaIncoerente} ${hadChanges} ${pushOk} ${aiRc} ${gateRossi} ${nonConsegnati}`],
    { encoding: "utf8" },
  );
  return Number(out.trim());
}

function etichetta({ aiRc = 0, gateRossi = 0, pushOk = 1, stepsOk = 1 }) {
  return execFileSync("bash", ["-c", `. "${SH}"; esito_giro_etichetta ${aiRc} ${gateRossi} ${pushOk} ${stepsOk}`], {
    encoding: "utf8",
  }).trim();
}

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

// ── Il difetto storico (AR-300) ────────────────────────────────────────────────
prova("un giro con i cancelli rossi NON è un successo", () => {
  assert.equal(rc({ gateRossi: 5 }), 3, "5 vincoli attivi devono dare exit 3, non 0");
});
prova("un solo cancello rosso basta a sporcare il giro", () => {
  assert.equal(rc({ gateRossi: 1 }), 3);
});
prova("nessun cancello rosso e tutto a posto → giro pulito", () => {
  assert.equal(rc({ gateRossi: 0 }), 0);
});

// ── Vincoli mai consegnati al motore (AR-320) ─────────────────────────────────
prova("motore saltato con vincoli attivi → exit 3, non evaporano in silenzio", () => {
  assert.equal(rc({ gateRossi: 0, nonConsegnati: 1 }), 3);
});

// ── Precedenze: la memoria non pubblicata viene prima di tutto (AR-104) ────────
prova("memoria incoerente vince su qualunque altra cosa", () => {
  assert.equal(rc({ memoriaIncoerente: 1, gateRossi: 9, aiRc: 7 }), 2);
});
prova("push fallito con modifiche in ballo → exit 2", () => {
  assert.equal(rc({ hadChanges: 1, pushOk: 0 }), 2);
});

// ── Motore AI ──────────────────────────────────────────────────────────────────
prova("motore fallito e niente pubblicato → exit 1", () => {
  assert.equal(rc({ aiRc: 3, hadChanges: 0 }), 1);
});
prova("motore instabile ma memoria pubblicata e cancelli verdi → exit 0", () => {
  assert.equal(rc({ aiRc: 3, hadChanges: 1, pushOk: 1, gateRossi: 0 }), 0);
});
prova("motore instabile E cancelli rossi → resta exit 3, non 0", () => {
  assert.equal(rc({ aiRc: 3, hadChanges: 1, pushOk: 1, gateRossi: 2 }), 3);
});

// ── «Giro pieno» si guadagna (AR-301) ─────────────────────────────────────────
// Dichiararsi pieno fa saltare il motore ai giri successivi fino a 12h: un giro fallito che si
// dichiarava pieno spegneva quelli dopo. Prima girava sempre.
const pieno = ({ aiRc = 0, stepsOk = 1, gateRossi = 0 }) =>
  execFileSync("bash", ["-c", `. "${SH}"; giro_e_pieno ${aiRc} ${stepsOk} ${gateRossi}`], { encoding: "utf8" }).trim();

prova("un giro riuscito e pulito è pieno", () => {
  assert.equal(pieno({}), "1");
});
prova("un giro col motore fallito NON è pieno", () => {
  assert.equal(pieno({ aiRc: 1 }), "0", "un giro fallito non deve poter spegnere i successivi");
});
prova("un giro che ha saltato i passi 11-12 NON è pieno", () => {
  assert.equal(pieno({ stepsOk: 0 }), "0");
});
prova("un giro coi cancelli rossi NON è pieno", () => {
  assert.equal(pieno({ gateRossi: 1 }), "0");
});

// ── Etichetta leggibile (finisce in esito-giro.json e nel Pannello) ────────────
prova("etichetta: pulito solo quando lo è davvero", () => {
  assert.equal(etichetta({}), "pulito");
  assert.equal(etichetta({ gateRossi: 1 }), "vincoli-attivi");
  assert.equal(etichetta({ aiRc: 1 }), "motore-fallito");
  assert.equal(etichetta({ pushOk: 0 }), "non-pubblicato");
  assert.equal(etichetta({ stepsOk: 0 }), "passi-saltati");
});


// ─────────────────────────────────────────────────────────────────────────────
// IL CONTRATTO DEI GUARDIANI (AR-322 / AR-308 / AR-309)
// ─────────────────────────────────────────────────────────────────────────────
//
// Il difetto: `rc≠0` significava due cose diverse — «ho misurato e sei bocciato» e «non ho potuto
// misurare» — perché nessuno aveva riservato un codice al secondo caso. Un guardiano che si ROMPE
// consegnava la propria traccia d'errore al motore come se fosse la regola da rispettare: il giro
// ubbidiva a uno stack trace. E all'opposto quattro guardiani escono 0 quando l'input manca: un verde
// che non è un verde.
//
// Più AR-308: due gate diversi condividevano la stessa variabile con un `=` secco, quindi il SECONDO
// allarme cancellava il primo senza lasciare traccia.

const vincolo = (nome, rc, testo) =>
  execFileSync("bash", ["-c", `. "${SH}"; vincolo_da_rc ${JSON.stringify(nome)} ${rc} ${JSON.stringify(testo)}`], {
    encoding: "utf8",
  }).trim();
const accumula = (a, b) =>
  execFileSync("bash", ["-c", `. "${SH}"; aggiungi_vincolo ${JSON.stringify(a)} ${JSON.stringify(b)}`], {
    encoding: "utf8",
  });

prova("il caso che ha rotto: un guardiano CIECO non parla col testo di dominio", () => {
  // rc=2 = «non ho potuto misurare». Raccontarlo con «CALIBRAZIONE NON CONFORME» sarebbe una bugia
  // sul contenuto: il motore passerebbe il giro a sistemare un problema che nessuno ha misurato.
  const out = vincolo("calibrazione.mjs valida", 2, "⛔ CALIBRAZIONE NON CONFORME: mancano 3 sensori");
  assert.match(out, /GUARDIANO CIECO/);
  assert.ok(!out.includes("mancano 3 sensori"), "il testo di dominio NON deve comparire su un rc=2");
  assert.match(out, /non trattare questo messaggio come una regola di contenuto/);
});

prova("un guardiano bocciato parla col suo testo, come prima", () => {
  assert.equal(vincolo("g", 1, "⛔ COSA VERA"), "⛔ COSA VERA");
});

prova("un guardiano passato non dice niente", () => {
  assert.equal(vincolo("g", 0, "⛔ COSA VERA"), "", "un verde non deve produrre vincoli");
});

prova("anche un rc strano viene trattato come bocciato, non ignorato", () => {
  // Prudenza: un codice che non conosciamo non è un verde.
  assert.equal(vincolo("g", 7, "⛔ COSA VERA"), "⛔ COSA VERA");
});

prova("il caso che ha rotto: il secondo allarme non cancella il primo", () => {
  // AR-308: `CAL_VINCOLO="…"` alla riga 351 sovrascriveva quello della 337. Se scattavano entrambi,
  // «calibrazione spenta» spariva e Nicola vedeva un problema solo.
  const out = accumula("⛔ CALIBRAZIONE SPENTA", "⛔ CALIBRAZIONE NON CONFORME");
  assert.match(out, /CALIBRAZIONE SPENTA/);
  assert.match(out, /CALIBRAZIONE NON CONFORME/);
});

prova("l'accumulo non inventa righe vuote quando uno dei due manca", () => {
  assert.equal(accumula("", "solo il secondo"), "solo il secondo");
  assert.equal(accumula("solo il primo", ""), "solo il primo");
  assert.equal(accumula("", ""), "");
});

prova("giro.sh usa davvero il contratto nei tre punti che sbagliavano", () => {
  const src = readFileSync(join(QUI, "..", "giro.sh"), "utf8");
  // AR-308: nessuna assegnazione secca a CAL_VINCOLO dentro un ramo di allarme
  assert.doesNotMatch(src, /CAL_VINCOLO="⛔/, "assegnazione secca: il secondo allarme cancella il primo");
  assert.match(src, /aggiungi_vincolo "\$CAL_VINCOLO"/, "i vincoli di calibrazione devono accumularsi");
  // AR-322: il rc del guardiano passa dal contratto
  assert.match(src, /vincolo_da_rc "calibrazione\.mjs valida"/);
  // AR-309: stderr fuori dal vincolo + riga nel log
  assert.doesNotMatch(src, /verifica-avversariale\.mjs" --gate 2>&1/, "stderr nel vincolo = uno stack trace travestito da regola");
  assert.match(src, /printf '%s\\n' "\$_verif_out"/, "il verificatore deve lasciare una riga nel log come tutti gli altri");
});

// ── esito (deve restare l'ULTIMA cosa del file: i casi aggiunti dopo non verrebbero contati) ──
const falliti = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`  ${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n       ${c.err}`}`);
console.log(`\n${casi.length - falliti.length}/${casi.length} passati`);
process.exit(falliti.length ? 1 : 0);
