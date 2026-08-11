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
function rc({
  memoriaIncoerente = 0,
  hadChanges = 1,
  pushOk = 1,
  aiRc = 0,
  gateRossi = 0,
  nonConsegnati = 0,
  motoreEseguito = 1,
}) {
  const out = execFileSync(
    "bash",
    [
      "-c",
      `. "${SH}"; esito_giro_rc ${memoriaIncoerente} ${hadChanges} ${pushOk} ${aiRc} ${gateRossi} ${nonConsegnati} ${motoreEseguito}`,
    ],
    { encoding: "utf8" },
  );
  return Number(out.trim());
}

function etichetta({ aiRc = 0, gateRossi = 0, pushOk = 1, stepsOk = 1, hadChanges = 1, motoreEseguito = 1 }) {
  return execFileSync(
    "bash",
    ["-c", `. "${SH}"; esito_giro_etichetta ${aiRc} ${gateRossi} ${pushOk} ${stepsOk} ${hadChanges} ${motoreEseguito}`],
    { encoding: "utf8" },
  ).trim();
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

// ── Il giro a vuoto (11/8) ────────────────────────────────────────────────────
// Il sintomo che l'ha fatto vedere: il registro delle cadenze diceva «giro fermo da 31 ore» mentre
// le impostazioni dicevano che il giro era uscito quel pomeriggio. Erano vere entrambe — girava e
// non scriveva — e l'esito lo chiamava «pulito». È il buco peggiore possibile qui dentro: non
// racconta un guasto, racconta un successo mentre la macchina sta ferma.
prova("il caso che ha rotto: motore acceso, zero file scritti → NON è un giro pulito", () => {
  assert.equal(
    rc({ aiRc: 0, hadChanges: 0, gateRossi: 0, motoreEseguito: 1 }),
    4,
    "un giro che non scrive niente non può uscire 0: il worker lo segnerebbe «fatto» e la Cabina lo mostrerebbe verde",
  );
});
prova("giro a vuoto: la notizia è il vuoto, non i cancelli rossi", () => {
  // Se il motore non ha scritto, i cancelli rossi sono la CONSEGUENZA (nessuno li ha consumati).
  // Dire «vincoli attivi» manderebbe a sistemare i controlli mentre il giro non è proprio successo.
  assert.equal(rc({ aiRc: 0, hadChanges: 0, gateRossi: 9, motoreEseguito: 1 }), 4);
});
prova("il motore SPENTO apposta dal delta-gate resta un esito legittimo", () => {
  // AR-019: quando non è cambiato niente il motore si spegne di proposito. Lì zero scritture è la
  // risposta giusta, non un difetto — altrimenti il fix trasformerebbe un risparmio in un errore fisso.
  assert.equal(rc({ aiRc: 0, hadChanges: 0, gateRossi: 0, motoreEseguito: 0 }), 0);
});
prova("motore spento con vincoli non consegnati resta exit 3", () => {
  assert.equal(rc({ hadChanges: 0, motoreEseguito: 0, nonConsegnati: 1 }), 3);
});
prova("un giro che scrive davvero non viene scambiato per vuoto", () => {
  assert.equal(rc({ aiRc: 0, hadChanges: 1, gateRossi: 0, motoreEseguito: 1 }), 0);
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

prova("il caso che ha rotto: «memoria non uscita» non si nasconde dietro «vincoli attivi»", () => {
  // È l'etichetta che Nicola legge in Cabina. Con i cancelli rossi copriva il fatto più grave, e
  // chi leggeva andava a sistemare i controlli mentre il problema era che non si pubblicava più.
  assert.equal(etichetta({ pushOk: 0, gateRossi: 9 }), "non-pubblicato");
});
prova("etichetta: il giro a vuoto ha un nome suo", () => {
  assert.equal(etichetta({ hadChanges: 0, motoreEseguito: 1 }), "giro-a-vuoto");
  assert.equal(etichetta({ hadChanges: 0, motoreEseguito: 1, gateRossi: 9 }), "giro-a-vuoto");
  // motore spento apposta: nessuna scrittura attesa, l'etichetta non deve accusare nessuno
  assert.equal(etichetta({ hadChanges: 0, motoreEseguito: 0 }), "pulito");
});
prova("giro.sh scrive il verbale con l'etichetta della funzione, non con una copia sua", () => {
  // Nel file esito-giro.json viveva una SECONDA copia della regola, scritta in JS. Le due si erano
  // già allontanate: la copia diceva «vincoli-attivi» dove la funzione dice «non-pubblicato».
  const src = readFileSync(join(QUI, "..", "giro.sh"), "utf8");
  assert.match(src, /ESITO="\$\(esito_giro_etichetta /, "il verbale deve chiamare la funzione unica");
  assert.doesNotMatch(
    src,
    /const esito = \(ai!==0\)/,
    "seconda copia della regola in JS: due copie non restano d'accordo, e nessuno se ne accorge",
  );
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
