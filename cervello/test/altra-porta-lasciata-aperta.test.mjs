// 🚪🚪 LA PROVA DI «PORTE GEMELLE» — l'altra porta dello stesso atto, e la differenza fra NOMINARE
// una guardia e CHIAMARLA.
//
// IL CASO VERO CHE RICOSTRUISCE (R1). Il 23/8/2026 l'atto «chiudere un difetto» si compiva da tre
// punti — auto-fix.mjs, allinea-scan-cantiere.mjs, round2-applica.mjs — e ZERO passavano dalla
// guardia `ammissibilitaProva`. La macchina lo sapeva e l'aveva scritto in un commento
// (cantiere-prove.mjs:228) invece che in un numero: un commento non ferma niente. È AR-796, ed è la
// stessa forma di AR-558 (curato un punto, lasciate aperte tre altre porte sullo stesso file di
// memoria) e di AR-172 (riparata la porta a mano, lasciata aperta quella automatica).
//
// PERCHÉ SU UN ALBERO FINTO E MAI SUL REPO VERO: un test che dipende dal repo vero diventa rosso il
// giorno in cui qualcuno aggiunge legittimamente un file, e un rosso che non è colpa di nessuno si
// impara a ignorare. È la via che AR-334 ha già dovuto aprire per `spazzata-fratelli`.
//
// Casi: quelli che sanno essere VERDI (senza, il primo lotto lo aggirerebbe), quelli che sanno essere
// ROSSI — ognuno è uno dei modi veri di aggirarlo — e quelli che sanno dire ⚪ (che non è né l'uno né
// l'altro: se quel ramo scivolasse a 0, in CI, dove `pannello/` può mancare, il freno sarebbe verde
// per costruzione — la malattia che stiamo curando, spostata dentro il suo guardiano).
//
// 🔧 I CASI N1…N5 SONO NATI DALLA PRIMA BOCCIATURA, uno per ogni buco trovato:
//   N1  una riga che non ripara niente (`export const stato = "chiuso";`) spegneva l'accusa, e il
//       file spariva perfino dall'elenco delle porte: da rosso a VERDE senza riparare niente.
//   N1b la stessa cosa riscrivendo una riesportazione (`export const timbraChiusura = …`).
//   N2  il freno sapeva dire «tutto a posto» dopo aver guardato ZERO cose.
//   N3  una sola cartella illeggibile buttava via l'atto intero: il rosso già PROVATO nell'altra
//       cartella spariva dietro un ⚪.
//   N4  la casa dell'atto si indovinava da una forma di testo; adesso si dichiara e si VERIFICA.
//   N5  …e la cecità di una cartella non deve produrre il rosso falso opposto.
//
// 🔧 I CASI N6…N10 SONO NATI DALLA SECONDA BOCCIATURA, quella vera: IL FRENO GUARDAVA UNA PAROLA,
// NON UN COMPORTAMENTO. Un file «passava dalla guardia» se da qualche parte dentro c'era SCRITTA la
// parola. Misurato su una copia del repo: tre righe innocue portavano il conto da «1 scoperta» a
// «0 scoperta» e l'uscita da 1 a 0.
//   N6  nominare la guardia non è chiamarla — cinque modi di nominarla, e restano tutti rossi.
//   N7  …e la riga innocua non spegne nemmeno il rosso di una porta NUOVA, scritta in un ALTRO file.
//   N8  il tetto non crolla per una riga di testo: `--aggiorna-tetti` non lo abbassa.
//   N9  e non lo abbassa nemmeno da mezza misura: con una cartella cieca si rifiuta di scendere.
//   N10 una guardia senza `funzione` è ⚪, non un rosso inventato su tutti.
//   N11 il lettore di codice non si mangia il codice vero: l'apostrofo di «l'ordine» dentro del
//       testo JSX non spegne la chiamata che viene dopo.
//
// 🕳️ COSA QUESTA PROVA NON COPRE PIÙ, e va detto: il controllo «ogni scheda grave chiusa deve
// dichiarare quale atto ha riparato» è stato TOLTO dal freno (nessun programma della macchina scrive
// quel campo: sarebbe stato un rosso a mano su ogni lotto futuro, cioè una tassa). Quindi qui non c'è
// nessun caso che lo provi, e il registro degli atti non cresce da solo. Il perché sta in cima a
// cervello/porte-gemelle.mjs.
//
// La prova che questa prova non è vacua sta in cervello/mutanti.json: si rompono i rami «porta
// scoperta», «la guardia si nomina invece di chiamarsi», «casa indovinata», «pavimento del verde»,
// «il cieco si mangia il rosso» e «il tetto scende da mezza misura», e questi casi DEVONO diventare
// rossi.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
const MOTORE = join(QUI, "..", "porte-gemelle.mjs");

const CASA = "export function guardiaFinta(d) {\n  return { ok: Boolean(d) };\n}\n";
const ATTO_COMPIUTO = "export function fai(d) {\n  chiudiTutto(d);\n}\n";
const PERCHE_BUONO = "questa porta non chiude niente davvero: e una proiezione per lo schermo";
const DOMANI = "2099-12-31";
// Il fatto che chiude un'esenzione a scadenza: senza, una data si può solo riscrivere.
const QUANDO_BUONO = "quando la copia per lo schermo smette di ricopiare lo stato delle schede gia chiuse";
// Il perché di un'esenzione che non scadrà mai: dice perché NESSUN lavoro futuro cambia la risposta.
const PER_SEMPRE_BUONO = "non e un lavoro rimandato: questo programma ricopia soltanto un giudizio gia dato, e farglielo ridare vorrebbe dire giudicare due volte la stessa prova";
// Le funzioni pure si interrogano direttamente. Importare il motore non fa partire niente — è la
// guardia dell'entrypoint (AR-445), ed è uno dei casi di questa stessa prova.
const MODULO = await import(MOTORE);
const IERI = "2020-01-01";

/** Un albero finto nuovo per ogni caso: i casi non si sporcano fra loro. */
function albero({ atti, extra = {} } = {}) {
  const tmp = mkdtempSync(join(tmpdir(), "porte-gemelle-"));
  mkdirSync(join(tmp, "finto"), { recursive: true });
  writeFileSync(join(tmp, "finto", "casa.mjs"), CASA);
  writeFileSync(
    join(tmp, "finto", "porta-buona.mjs"),
    'import { guardiaFinta } from "./casa.mjs";\nexport function fai(d) {\n  if (!guardiaFinta(d).ok) return;\n  chiudiTutto(d);\n}\n',
  );
  writeFileSync(join(tmp, "finto", "porta-esente.mjs"), ATTO_COMPIUTO);
  for (const [nome, testo] of Object.entries(extra)) writeFileSync(join(tmp, "finto", nome), testo);
  writeFileSync(join(tmp, "atti-finti.json"), JSON.stringify(atti, null, 2));
  return tmp;
}

function gira(tmp, ...argomenti) {
  return spawnSync("node", [MOTORE, ...argomenti], {
    encoding: "utf8",
    env: { ...process.env, PORTE_GEMELLE_REPO: tmp, PORTE_GEMELLE_REGISTRO: join(tmp, "atti-finti.json") },
  });
}

function tetto(tmp) {
  return JSON.parse(readFileSync(join(tmp, "atti-finti.json"), "utf8")).atti[0].tetto_porte;
}

/** Il registro finto: una voce, la guardia in `finto/casa.mjs`, una sola esenzione dichiarata. */
function registro({ esenti, dove = ["finto"], tetto, tettoPerSempre, casa, rilevatore = "chiudiTutto\\s*\\(", guardia } = {}) {
  const atto = {
    id: "atto-finto",
    atto: "chiudere tutto",
    guardia: guardia ?? { file: "finto/casa.mjs", funzione: "guardiaFinta" },
    rilevatore,
    dove,
    estensioni: [".mjs"],
    esenti: esenti ?? [{ file: "finto/porta-esente.mjs", perche: PERCHE_BUONO, fino_al: DOMANI, si_toglie_quando: QUANDO_BUONO }],
  };
  if (Number.isInteger(tetto)) atto.tetto_porte = tetto;
  if (Number.isInteger(tettoPerSempre)) atto.tetto_strutturali = tettoPerSempre;
  if (casa) atto.casa = casa;
  return { acceso_il: "2026-08-23 13:01", max_porte: 8, atti: [atto] };
}

function con(tmp, f) {
  try {
    return f();
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

// ─── SA ESSERE VERDE ─────────────────────────────────────────────────────────

test("V1 · base: una porta chiama la guardia, una è dichiarata → verde (se non fosse mai verde, il primo lotto lo aggirerebbe)", () => {
  const tmp = albero({ atti: registro() });
  con(tmp, () => {
    const r = gira(tmp);
    assert.equal(r.status, 0, `atteso verde, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /1 chiama\/no la guardia/, "il rapporto deve dire quante porte la CHIAMANO davvero");
    assert.match(r.stdout, /1 dichiarata/, "e quante sono debito dichiarato");
  });
});

test("V2 · il verde vero non è solo teorico: chi la chiama passa, e passa anche chi la importa con un altro nome e chiama quello (accusarlo sarebbe un rosso falso)", () => {
  const tmp = albero({
    atti: registro(),
    extra: {
      "porta-alias.mjs":
        'import { guardiaFinta as controlla } from "./casa.mjs";\nexport function fai(d) {\n  if (!controlla(d).ok) return;\n  chiudiTutto(d);\n}\n',
    },
  });
  con(tmp, () => {
    const r = gira(tmp);
    assert.equal(r.status, 0, `atteso verde, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /2 chiama\/no la guardia/, "sono due le porte che la chiamano: quella diretta e quella con l'alias");
    assert.match(r.stdout, /porta-alias\.mjs:\d+ · chiama controlla\(\)/, "e il rapporto deve dire COME ci passa");
  });
});

// ─── SA ESSERE ROSSO ─────────────────────────────────────────────────────────

test("R1 · il caso AR-796 ricostruito: una porta di servizio che compie l'atto e non chiama la guardia → rosso, COL NOME", () => {
  const tmp = albero({ atti: registro(), extra: { "porta-di-servizio.mjs": ATTO_COMPIUTO } });
  con(tmp, () => {
    const r = gira(tmp);
    assert.equal(r.status, 1, `atteso rosso, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    // Assertito sull'ACCUSA e non sulla semplice comparsa del nome: il rapporto elenca ogni porta,
    // quindi cercare «porta-di-servizio.mjs» da solo passerebbe anche se quella porta risultasse a
    // posto — sarebbe una prova che misura il tema invece della cura. Un rosso che non dice QUALE
    // porta è scoperta è un rosso che nessuno sa chiudere.
    assert.match(
      r.stdout,
      /\[porta-scoperta\] finto\/porta-di-servizio\.mjs:\d+/,
      "il rosso deve accusare per nome e riga la porta scoperta",
    );
  });
});

test("R2 · esenzione morta: il file esente sparisce e l'esenzione resta → rosso (un residuo nasconde il prossimo caso vero)", () => {
  const tmp = albero({ atti: registro() });
  con(tmp, () => {
    rmSync(join(tmp, "finto", "porta-esente.mjs"));
    const r = gira(tmp);
    assert.equal(r.status, 1, `atteso rosso, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /esenzione-morta/);
  });
});

test("R3 · esenzione scaduta, o senza un perché: → rosso (un'attesa senza scadenza è un'esenzione travestita, AR-338)", () => {
  const scaduta = albero({ atti: registro({ esenti: [{ file: "finto/porta-esente.mjs", perche: PERCHE_BUONO, fino_al: IERI, si_toglie_quando: QUANDO_BUONO }] }) });
  con(scaduta, () => {
    const r = gira(scaduta);
    assert.equal(r.status, 1, `scaduta: atteso rosso, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /scaduta il 2020-01-01/);
  });
  const muta = albero({ atti: registro({ esenti: [{ file: "finto/porta-esente.mjs", perche: "boh, si vedrà", fino_al: DOMANI, si_toglie_quando: QUANDO_BUONO }] }) });
  con(muta, () => {
    const r = gira(muta);
    assert.equal(r.status, 1, `perché corto: atteso rosso, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /caratteri \(ne servono 30\)/);
  });
});

test("R4 · la valvola non diventa una scusa: 12 porte scoperte senza tetto → rosso con le DUE uscite; col tetto 12 → verde; la tredicesima → rosso", () => {
  const dodici = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`porta-${String(i).padStart(2, "0")}.mjs`, ATTO_COMPIUTO]));

  const senzaTetto = albero({ atti: registro(), extra: dodici });
  con(senzaTetto, () => {
    const r = gira(senzaTetto);
    assert.equal(r.status, 1, `senza tetto: atteso rosso, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /troppe-porte-senza-tetto/);
    assert.match(r.stdout, /tetto_porte/, "il rosso deve indicare l'uscita ①");
    assert.match(r.stdout, /guardiano dedicato/, "e anche l'uscita ②: un rosso senza uscita è un cancello che qualcuno spegnerà");
  });

  const colTetto = albero({ atti: registro({ tetto: 12 }), extra: dodici });
  con(colTetto, () => {
    const r = gira(colTetto);
    assert.equal(r.status, 0, `col tetto: atteso verde, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /tetto 12/);
  });

  const tredicesima = albero({ atti: registro({ tetto: 12 }), extra: { ...dodici, "porta-12.mjs": ATTO_COMPIUTO } });
  con(tredicesima, () => {
    const r = gira(tredicesima);
    assert.equal(r.status, 1, `tredicesima: atteso rosso, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /sopra-il-tetto/);
  });
});

// ─── SA DIRE ⚪, E ⚪ NON È VERDE ─────────────────────────────────────────────

test("C1 · una cartella dichiarata che non esiste → uscita 2, «non ho potuto misurare» (in CI `pannello/` può mancare: se questo ramo scivolasse a 0, il freno sarebbe verde per costruzione)", () => {
  const tmp = albero({ atti: registro({ dove: ["cartella-che-non-esiste"] }) });
  con(tmp, () => {
    const r = gira(tmp);
    assert.equal(r.status, 2, `atteso cieco, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /non ho potuto misurare/);
    assert.doesNotMatch(r.stdout, /✅ \d+ porta\/e esaminata/, "un cieco non deve MAI stampare la frase rassicurante");
  });
});

// ─── 🔧 I CASI NATI DALLA PRIMA BOCCIATURA ───────────────────────────────────

/** La casa vera dell'atto finto: DEFINISCE `chiudiTutto` e non lo importa da nessuno. */
const CASA_ATTO = 'export function chiudiTutto(d) {\n  d.stato = "chiuso";\n}\n';
/** Il rilevatore del caso vero: una chiamata OPPURE una scrittura di stato. È da qui che uscivano
 *  `stato` e `chiuso` e finivano per assolvere chiunque li esportasse. */
const RILEVATORE_VERO = 'chiudiTutto\\s*\\(|\\bstato\\s*[:=]\\s*"chiuso"';

test("N1 · la riga che non ripara niente NON spegne l'accusa: `export const stato = \"chiuso\";` in fondo alla porta scoperta → resta rossa, col nome", () => {
  const tmp = albero({
    atti: registro({ rilevatore: RILEVATORE_VERO, casa: "finto/casa-atto.mjs" }),
    extra: {
      "casa-atto.mjs": CASA_ATTO,
      // Identica alla porta scoperta di R1, più UNA riga che non cambia una virgola di quello che fa.
      // Prima bastava questa riga: il freno passava da 1 a 0 e il file spariva dall'elenco.
      "porta-di-servizio.mjs": `${ATTO_COMPIUTO}\nexport const stato = "chiuso";\n`,
    },
  });
  con(tmp, () => {
    const r = gira(tmp);
    assert.equal(r.status, 1, `atteso rosso, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(
      r.stdout,
      /\[porta-scoperta\] finto\/porta-di-servizio\.mjs:\d+/,
      "la riga innocua non deve né assolvere la porta né farla sparire dall'elenco",
    );
    assert.match(r.stdout, /1 scoperta\/e/, "e il conto delle scoperte non deve scendere a 0");
  });
});

test("N1b · e non la spegne nemmeno riscrivendo una riesportazione: chi IMPORTA il primitivo non diventa la casa dell'atto, comunque scriva la riga", () => {
  const tmp = albero({
    atti: registro({ rilevatore: RILEVATORE_VERO, casa: "finto/casa-atto.mjs" }),
    extra: {
      "casa-atto.mjs": CASA_ATTO,
      "porta-di-servizio.mjs":
        'import { chiudiTutto as _c } from "./casa-atto.mjs";\nexport const chiudiTutto = _c;\nexport function fai(d) {\n  chiudiTutto(d);\n}\n',
    },
  });
  con(tmp, () => {
    const r = gira(tmp);
    assert.equal(r.status, 1, `atteso rosso, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /\[porta-scoperta\] finto\/porta-di-servizio\.mjs:\d+/);
  });
});

test("N2 · il verde ha un pavimento: zero porte esaminate → ⚪ (2), mai 0 — né col registro senza atti, né col rilevatore che non trova più niente", () => {
  const senzaAtti = albero({ atti: { acceso_il: "2026-08-23 13:01", max_porte: 8, atti: [] } });
  con(senzaAtti, () => {
    const r = gira(senzaAtti);
    assert.equal(r.status, 2, `registro senza atti: atteso cieco, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /non ho misurato niente/);
    assert.doesNotMatch(r.stdout, /✅ \d+ porta\/e esaminata/, "non deve MAI stampare la frase di verde su zero misure");
  });

  // Il giorno in cui la funzione viene rinominata il rilevatore non trova più niente. Prima usciva
  // ✅ con «0 passa/no · 0 dichiarata/e · 0 scoperta/e». Le esenti sono quelle vere: il rosso di
  // rimbalzo («esenzione morta») era una rete accidentale, non una regola — qui dev'essere ⚪.
  const rilevatoreCieco = albero({ atti: registro({ rilevatore: "nomeCheNonEsisteDaNessunaParte\\s*\\(" }) });
  con(rilevatoreCieco, () => {
    const r = gira(rilevatoreCieco);
    assert.equal(r.status, 2, `rilevatore a vuoto: atteso cieco, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /NESSUNA porta/, "e deve dire il perché: o l'atto non si compie più, o il rilevatore è rotto");
    assert.doesNotMatch(r.stdout, /✅ \d+ porta\/e esaminata/);
  });
});

test("N3 · una cartella su due non si legge: il rosso PROVATO nell'altra resta rosso — e quando rosso non ce n'è, l'uscita è ⚪, mai 0", () => {
  const conRosso = albero({ atti: registro({ dove: ["finto", "cartella-assente"] }), extra: { "porta-di-servizio.mjs": ATTO_COMPIUTO } });
  con(conRosso, () => {
    const r = gira(conRosso);
    assert.equal(r.status, 1, `atteso rosso, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /\[porta-scoperta\] finto\/porta-di-servizio\.mjs:\d+/, "il cieco non deve mangiarsi il rosso già provato");
    assert.match(r.stdout, /MISURATO SOLO IN PARTE/, "e la cartella persa va dichiarata accanto");
  });

  const senzaRosso = albero({ atti: registro({ dove: ["finto", "cartella-assente"] }) });
  con(senzaRosso, () => {
    const r = gira(senzaRosso);
    assert.equal(r.status, 2, `atteso cieco, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.doesNotMatch(r.stdout, /✅ \d+ porta\/e esaminata/, "aver guardato metà perimetro non è un verde");
  });
});

test("N4 · la casa dell'atto si DICHIARA e si verifica: dichiararne una che il primitivo se lo importa → rosso, non uno scarto silenzioso", () => {
  const tmp = albero({
    atti: registro({ rilevatore: RILEVATORE_VERO, casa: "finto/bugiardo.mjs" }),
    extra: {
      "casa-atto.mjs": CASA_ATTO,
      "bugiardo.mjs": 'import { chiudiTutto } from "./casa-atto.mjs";\nexport function fai(d) {\n  chiudiTutto(d);\n}\n',
    },
  });
  con(tmp, () => {
    const r = gira(tmp);
    assert.equal(r.status, 1, `atteso rosso, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /casa-non-verificata/, "una casa che non scrive l'atto è una porta travestita da casa");
  });
});

test("N5 · un'esenzione che abita la cartella illeggibile NON è morta: è non misurabile (un rosso falso spegne un cancello quanto un verde falso)", () => {
  const tmp = albero({
    atti: registro({
      dove: ["finto", "cartella-assente"],
      esenti: [
        { file: "finto/porta-esente.mjs", perche: PERCHE_BUONO, fino_al: DOMANI, si_toglie_quando: QUANDO_BUONO },
        { file: "cartella-assente/porta-lontana.mjs", perche: PERCHE_BUONO, fino_al: DOMANI, si_toglie_quando: QUANDO_BUONO },
      ],
    }),
  });
  con(tmp, () => {
    const r = gira(tmp);
    assert.equal(r.status, 2, `atteso cieco, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.doesNotMatch(r.stdout, /esenzione-morta/, "non l'ho potuta leggere: non posso dichiararla un residuo");
  });
});

// ─── 🔧 I CASI NATI DALLA SECONDA BOCCIATURA: NOMINARE NON È CHIAMARE ────────

/** Le cinque righe innocue misurate sul repo vero. Nessuna ripara niente, e prima ognuna da sola
 *  portava il conto da «1 scoperta» a «0 scoperta» e l'uscita da 1 a 0. La seconda non è un
 *  dispetto: è il messaggio d'errore che scriverebbe chiunque spieghi perché una prova è stata
 *  rifiutata. La terza è un import rimasto dopo un refactoring. */
const RIGHE_CHE_SOLO_NOMINANO = {
  "una stringa esportata": 'export const NOTA = "guardiaFinta";\n',
  "un messaggio d'errore che nomina la guardia": 'export function spiega() {\n  throw new Error("prova non ammissibile: vedi guardiaFinta in casa.mjs");\n}\n',
  "un import rinominato e mai usato": 'import { guardiaFinta as _g } from "./casa.mjs";\n',
  "un commento che mostra la chiamata": "// per capire perche: guardiaFinta(d) sta in casa.mjs\n",
  "un template su piu righe": "export const AIUTO = `\n  la prova passa da\n  guardiaFinta(d)\n  prima di chiudere\n`;\n",
};

test("N6 · NOMINARE la guardia non è CHIAMARLA: cinque righe innocue in fondo alla porta scoperta, e resta rossa tutte e cinque le volte", () => {
  for (const [come, riga] of Object.entries(RIGHE_CHE_SOLO_NOMINANO)) {
    const tmp = albero({ atti: registro(), extra: { "porta-di-servizio.mjs": `${ATTO_COMPIUTO}\n${riga}` } });
    con(tmp, () => {
      const r = gira(tmp);
      assert.equal(r.status, 1, `${come}: atteso rosso, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
      assert.match(
        r.stdout,
        /\[porta-scoperta\] finto\/porta-di-servizio\.mjs:\d+/,
        `${come}: la porta deve restare accusata per nome`,
      );
      assert.match(r.stdout, /1 scoperta\/e/, `${come}: il conto delle scoperte non deve scendere a 0`);
      // La porta che la guardia la CHIAMA davvero (`porta-buona.mjs`) resta una sola: la riga
      // innocua non deve aggiungere un secondo passante, né mettere il ✅ accanto all'accusata.
      assert.match(r.stdout, /1 chiama\/no la guardia/, `${come}: nominare la guardia non deve creare un passante in più`);
      assert.doesNotMatch(
        r.stdout,
        /✅ finto\/porta-di-servizio\.mjs/,
        `${come}: la porta accusata non deve prendersi la spunta verde`,
      );
    });
  }
});

test("N7 · la riga innocua non spegne nemmeno una porta NUOVA: sotto un tetto di 1, la seconda porta fa rosso anche se un ALTRO file nomina la guardia", () => {
  const tmp = albero({
    atti: registro({ tetto: 1, esenti: [] }),
    extra: {
      // La porta che il tetto copre già, più quella NUOVA: due scoperte contro un tetto di 1.
      "porta-nuova.mjs": ATTO_COMPIUTO,
      // Il file che nomina la guardia non c'entra niente con la porta nuova: prima bastava questo
      // per rimettere il conto sotto il tetto e lasciare la porta nuova aperta col ✅ accanto.
      "porta-che-nomina.mjs": `${ATTO_COMPIUTO}\nexport const NOTA = "guardiaFinta";\n`,
    },
  });
  con(tmp, () => {
    const r = gira(tmp);
    assert.equal(r.status, 1, `atteso rosso, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /sopra-il-tetto/, "una porta in più del tetto deve fare rosso subito");
    assert.match(r.stdout, /finto\/porta-nuova\.mjs:\d+/, "e il rosso deve nominare la porta nuova");
    assert.match(r.stdout, /3 scoperta\/e/, "tre scoperte: la esente non dichiarata, la nuova, e quella che si limita a nominare la guardia");
  });
});

test("N8 · il tetto non crolla per una riga di testo: con la riga che nomina la guardia, `--aggiorna-tetti` non lo abbassa (prima scendeva a 0, e non risale mai più)", () => {
  const pulito = albero({ atti: registro({ tetto: 1, esenti: [] }), extra: {} });
  con(pulito, () => {
    // La misura di partenza: `porta-esente.mjs` senza esenzione è l'unica scoperta → tetto 1, verde.
    const r = gira(pulito, "--aggiorna-tetti");
    assert.equal(r.status, 0, `partenza: atteso verde, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.equal(tetto(pulito), 1, "senza cure il tetto resta quello che è");
  });

  const conLaRiga = albero({
    atti: registro({ tetto: 1, esenti: [] }),
    extra: {},
  });
  con(conLaRiga, () => {
    writeFileSync(join(conLaRiga, "finto", "porta-esente.mjs"), `${ATTO_COMPIUTO}\nexport const NOTA = "guardiaFinta";\n`);
    const r = gira(conLaRiga, "--aggiorna-tetti");
    assert.equal(r.status, 0, `con la riga: atteso verde sotto il tetto, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.equal(tetto(conLaRiga), 1, "una riga che nomina la guardia NON abbassa il tetto: AR-796 non si chiude per iscritto");
    assert.match(r.stdout, /tetti abbassati: 0/);
  });
});

test("N9 · il tetto non scende nemmeno da mezza misura: con una cartella cieca `--aggiorna-tetti` si rifiuta, e l'uscita è ⚪", () => {
  const tmp = albero({ atti: registro({ dove: ["finto", "cartella-assente"], tetto: 9 }) });
  con(tmp, () => {
    const r = gira(tmp, "--aggiorna-tetti");
    assert.equal(r.status, 2, `atteso cieco, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.equal(tetto(tmp), 9, "il tetto non si abbassa da una misura parziale: sarebbe un debito cancellato senza pagarlo");
    assert.match(r.stdout, /non abbasso nessun tetto/, "e deve dire perché non l'ha fatto");
  });
});

test("N10 · una guardia senza `funzione` è ⚪, non un rosso inventato su tutti (senza un nome da cercare, «nessuno ci passa» sarebbe una bugia)", () => {
  const tmp = albero({ atti: registro({ guardia: { file: "finto/casa.mjs" } }) });
  con(tmp, () => {
    const r = gira(tmp);
    assert.equal(r.status, 2, `atteso cieco, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /non dichiara la `funzione`/);
    assert.doesNotMatch(r.stdout, /porta-scoperta/, "senza il nome della guardia non si accusa nessuno");
  });
});

// ─── IL LETTORE DI CODICE, PROVATO DA SOLO ───────────────────────────────────

test("N11 · il lettore non si mangia il codice vero: l'apostrofo di «l'ordine» dentro del testo JSX non spegne la chiamata che viene dopo", async () => {
  const M = await import(MOTORE);
  const jsx = "export function Riga() {\n  return <p>l'ordine è pronto</p>;\n}\nexport function fai(d) {\n  guardiaFinta(d);\n}\n";
  assert.equal(M.chiamaLaGuardia(jsx, "guardiaFinta").chiama, true, "un apostrofo nel testo non è una stringa aperta");

  // …e nel verso opposto: dentro una stringa, un template o un commento la chiamata NON conta.
  assert.equal(M.chiamaLaGuardia('const s = "guardiaFinta(d)";', "guardiaFinta").chiama, false);
  assert.equal(M.chiamaLaGuardia("const s = `\n  guardiaFinta(d)\n`;", "guardiaFinta").chiama, false);
  assert.equal(M.chiamaLaGuardia("// guardiaFinta(d)\n/* guardiaFinta(d) */", "guardiaFinta").chiama, false);
  assert.equal(M.chiamaLaGuardia('import { guardiaFinta as g } from "./casa.mjs";', "guardiaFinta").chiama, false, "un import mai usato non è una chiamata");
  assert.equal(M.chiamaLaGuardia('import { guardiaFinta as g } from "./casa.mjs";\ng(d);', "guardiaFinta").chiama, true, "…ma se poi lo chiami, ci passi davvero");
  // Il codice dentro un'interpolazione È codice: spegnerlo sarebbe un rosso falso.
  assert.equal(M.chiamaLaGuardia("const s = `esito: ${guardiaFinta(d).ok}`;", "guardiaFinta").chiama, true);
  // Un letterale di espressione regolare che CONTIENE la chiamata non è una chiamata…
  assert.equal(M.chiamaLaGuardia("const r = /guardiaFinta\\(/;\nfai(d);", "guardiaFinta").chiama, false);
  // …e nemmeno una stringa spezzata su due righe con la barra di continuazione.
  assert.equal(M.chiamaLaGuardia('const N = "vedi \\\n  guardiaFinta(d) qui";', "guardiaFinta").chiama, false);
  // Nel verso opposto, i tre modi in cui il lettore poteva mangiarsi il codice vero e accusare per
  // sbaglio: due apostrofi nel testo, un tag JSX che si chiude, una divisione scambiata per regex.
  assert.equal(M.chiamaLaGuardia("<p>l ordine dell utente</p>;\nguardiaFinta(d);", "guardiaFinta").chiama, true);
  assert.equal(M.chiamaLaGuardia('return <div className="x">ciao</div>;\nguardiaFinta(d);', "guardiaFinta").chiama, true);
  assert.equal(M.chiamaLaGuardia("const q = a / b; guardiaFinta(d);", "guardiaFinta").chiama, true);
  // Il lettore non deve perdere righe per strada: se ne mangia una, sposta ogni numero di riga.
  const campione = "const a = /['\"]/;\nconst b = `uno\ndue`;\n/* tre\nquattro */\nconst c = 1;\n";
  assert.equal((M.soloCodice(campione).match(/\n/g) || []).length, (campione.match(/\n/g) || []).length);
});

// ─── LA GUARDIA DELL'ENTRYPOINT ──────────────────────────────────────────────

test("importare il motore non fa partire niente (AR-445, AR-680)", async () => {
  const M = await import(MOTORE);
  assert.equal(typeof M.porteDiUnAtto, "function");
  assert.equal(typeof M.verdettoAtto, "function");
  assert.equal(typeof M.esenzioniMorte, "function");
  assert.equal(typeof M.verdettoCasa, "function");
  assert.equal(typeof M.primitiviDelRilevatore, "function");
  assert.equal(typeof M.chiamaLaGuardia, "function");
  assert.equal(typeof M.soloCodice, "function");
  assert.deepEqual(
    M.primitiviDelRilevatore('timbraChiusura\\s*\\(|\\bstato\\s*[:=]\\s*"chiuso"'),
    ["timbraChiusura"],
    "dal rilevatore si prendono SOLO i nomi chiamati: `stato` e `chiuso` non sono primitivi dell'atto",
  );
});

// ─── LE DUE CURE DEL 23/8 SERA ───────────────────────────────────────────────
//
// C1 e C2… nascono da due misure, non da due opinioni. La prima: il censimento dei guardiani non
// riconosceva questo file come guardiano, perché leggeva solo le prime 80 righe e il contratto
// d'uscita stava alla 135 — quindi il verde che il freno prendeva sul controllo «costruito e mai
// messo di guardia» era comprato dall'essere illeggibile. La seconda: le tre esenzioni del registro
// scadevano tutte il 15 ottobre 2026, e il 16 il freno usciva 1 senza che nessuno avesse toccato una
// riga di codice — mentre due di quelle tre, quel giorno, non avevano niente da riparare.

test("C1 · il contratto d'uscita sta dove il censimento dei guardiani lo può leggere: `eGuardiano` dice SÌ su questo file", async () => {
  const { eGuardiano, RIGHE_INTESTAZIONE } = await import(join(QUI, "..", "guardia-viva.mjs"));
  const testo = readFileSync(MOTORE, "utf8");
  // Si interroga il censimento VERO, non una copia della sua regola scritta qui: se domani quella
  // finestra cambia, questo caso lo scopre invece di continuare a dire di sì su una regola morta.
  assert.equal(
    eGuardiano(testo),
    true,
    "il censimento dei guardiani non riconosce porte-gemelle.mjs: finché non lo vede, «costruito e mai messo di guardia» esce verde su di lui perché è illeggibile, non perché sia a posto",
  );
  const riga = testo.split("\n").findIndex((r) => /^\/\/.*\b(?:Exit|EXIT|Uscita|USCITA)\b\s*[:(]/.test(r)) + 1;
  assert.ok(riga > 0, "il contratto d'uscita non c'è proprio");
  assert.ok(
    riga <= RIGHE_INTESTAZIONE,
    `il contratto d'uscita è alla riga ${riga}, oltre le prime ${RIGHE_INTESTAZIONE} che il censimento legge: da lì in giù, per lui, è codice`,
  );
});

test("C2 · un'esenzione STRUTTURALE non ha data e il tempo non la uccide: verde oggi, verde nel 2030 — e il rapporto dice PER SEMPRE", () => {
  const tmp = albero({
    atti: registro({
      tettoPerSempre: 1,
      esenti: [{ file: "finto/porta-esente.mjs", perche: PERCHE_BUONO, natura: "strutturale", perche_per_sempre: PER_SEMPRE_BUONO }],
    }),
  });
  con(tmp, () => {
    const r = gira(tmp);
    assert.equal(r.status, 0, `atteso verde, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /porta-esente\.mjs:\d+ · dichiarata PER SEMPRE/, "il rapporto deve dire che quella porta è spenta per sempre, non nasconderla nel verde");
    assert.match(r.stdout, /spenta\/e PER SEMPRE/, "e il verde finale deve portare il numero: un verde muto sul per-sempre è la spunta sopra una malattia viva");
    // La prova che la miccia è tolta davvero: la stessa esenzione, letta con l'orologio spostato di
    // quattro anni, non muore. Prima moriva il 16 ottobre 2026 e non c'era niente da riparare.
    const atto = JSON.parse(readFileSync(join(tmp, "atti-finti.json"), "utf8")).atti[0];
    const porte = [{ file: "finto/porta-esente.mjs", stato: "dichiarata" }];
    for (const giorno of ["2026-10-16", "2030-01-01"]) {
      assert.deepEqual(MODULO.esenzioniMorte(atto, porte, new Date(giorno)), [], `il ${giorno} l'esenzione strutturale non deve morire: non c'è niente da riparare quel giorno`);
    }
  });
});

test("C3 · la scorciatoia che capita da sola: rietichettare «strutturale» una scadenza per non riscriverla → rosso, perché il per-sempre ha un tetto", () => {
  const tmp = albero({
    atti: registro({
      tettoPerSempre: 1,
      esenti: [
        { file: "finto/porta-esente.mjs", perche: PERCHE_BUONO, natura: "strutturale", perche_per_sempre: PER_SEMPRE_BUONO },
        { file: "finto/porta-due.mjs", perche: PERCHE_BUONO, natura: "strutturale", perche_per_sempre: PER_SEMPRE_BUONO },
      ],
    }),
    extra: { "porta-due.mjs": ATTO_COMPIUTO },
  });
  con(tmp, () => {
    const r = gira(tmp);
    assert.equal(r.status, 1, `atteso rosso, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /\[sopra-il-tetto-per-sempre\].*2 esenzioni per sempre contro un tetto di 1/, "senza il tetto, «strutturale» sarebbe la parola con cui si spegne qualunque porta");
  });
});

test("C4 · il per-sempre costa più della proroga: senza tetto, con una data, o con un `perche_per_sempre` che non c'è → rosso ogni volta", () => {
  const strutturale = (extra = {}) => ({
    file: "finto/porta-esente.mjs",
    perche: PERCHE_BUONO,
    natura: "strutturale",
    perche_per_sempre: PER_SEMPRE_BUONO,
    ...extra,
  });

  const senzaTetto = albero({ atti: registro({ esenti: [strutturale()] }) });
  con(senzaTetto, () => {
    const r = gira(senzaTetto);
    assert.equal(r.status, 1, `senza tetto: atteso rosso, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /\[per-sempre-senza-tetto\]/);
    assert.match(r.stdout, /"tetto_strutturali": 1/, "il rosso deve dire il numero da scrivere: un rosso senza uscita è un cancello che qualcuno spegnerà");
  });

  const conData = albero({ atti: registro({ tettoPerSempre: 1, esenti: [strutturale({ fino_al: DOMANI })] }) });
  con(conData, () => {
    const r = gira(conData);
    assert.equal(r.status, 1, `con data: atteso rosso, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /o scade o è per sempre/, "una strutturale con una data è la miccia rimessa dentro la cura");
  });

  const mutaPerSempre = albero({ atti: registro({ tettoPerSempre: 1, esenti: [strutturale({ perche_per_sempre: "è così" })] }) });
  con(mutaPerSempre, () => {
    const r = gira(mutaPerSempre);
    assert.equal(r.status, 1, `perché corto: atteso rosso, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /perche_per_sempre` di \d+ caratteri \(ne servono 30\)/);
  });
});

test("C5 · una data che non dice cosa la chiude è la tassa di ottobre, e una natura inventata non è una dichiarazione → rosso", () => {
  const senzaQuando = albero({ atti: registro({ esenti: [{ file: "finto/porta-esente.mjs", perche: PERCHE_BUONO, fino_al: DOMANI }] }) });
  con(senzaQuando, () => {
    const r = gira(senzaQuando);
    assert.equal(r.status, 1, `senza si_toglie_quando: atteso rosso, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /non dice `si_toglie_quando`/, "una scadenza senza il fatto che la chiude, il giorno che arriva, si può solo riscrivere");
  });

  const inventata = albero({
    atti: registro({ esenti: [{ file: "finto/porta-esente.mjs", perche: PERCHE_BUONO, natura: "definitiva", fino_al: DOMANI, si_toglie_quando: QUANDO_BUONO }] }),
  });
  con(inventata, () => {
    const r = gira(inventata);
    assert.equal(r.status, 1, `natura inventata: atteso rosso, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /natura «definitiva» sconosciuta/, "trattare un refuso come «temporanea» vorrebbe dire accettarlo in silenzio");
  });

  // E il verso opposto, quello che tiene onesto il default: chi non scrive `natura` è TEMPORANEA, e
  // quindi la sua data scade. Se il default cadesse dall'altra parte, la strada più facile — non
  // scrivere niente — sarebbe anche quella che spegne una porta per l'eternità.
  assert.equal(MODULO.naturaDi({}), "temporanea");
  assert.equal(MODULO.naturaDi({ natura: "strutturale" }), "strutturale");
  assert.equal(MODULO.naturaDi({ natura: "per sempre" }), "");
});

test("C6 · il per-sempre non è immortale: se quella porta comincia a chiamare la guardia, o sparisce, l'esenzione strutturale muore lo stesso giorno", () => {
  const esenti = [{ file: "finto/porta-esente.mjs", perche: PERCHE_BUONO, natura: "strutturale", perche_per_sempre: PER_SEMPRE_BUONO }];

  const curata = albero({ atti: registro({ tettoPerSempre: 1, esenti }) });
  con(curata, () => {
    writeFileSync(
      join(curata, "finto", "porta-esente.mjs"),
      'import { guardiaFinta } from "./casa.mjs";\nexport function fai(d) {\n  if (!guardiaFinta(d).ok) return;\n  chiudiTutto(d);\n}\n',
    );
    const r = gira(curata);
    assert.equal(r.status, 1, `curata: atteso rosso, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /adesso chiama davvero la guardia/, "una scusa rimasta in piedi dopo che il buco è chiuso insegna che le scuse non scadono mai");
  });

  const sparita = albero({ atti: registro({ tettoPerSempre: 1, esenti }) });
  con(sparita, () => {
    rmSync(join(sparita, "finto", "porta-esente.mjs"));
    const r = gira(sparita);
    assert.equal(r.status, 1, `sparita: atteso rosso, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /nessuna porta qui/, "il per-sempre vale sulla porta che c'è, non su un ricordo");
  });
});
