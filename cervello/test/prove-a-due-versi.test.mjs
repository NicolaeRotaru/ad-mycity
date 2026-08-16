// AR-570 — una prova che sa dire solo di no è inutile quanto un grep che sa dire solo di sì.
//
// Nato dal primo lotto di conversione (AR-564, l'asticella). Convertendo le prove dei difetti aperti
// da «cerca una parola» a «esegui qualcosa», il cancello del lotto ha chiesto per ognuna un MUTANTE:
// rompi il fix e pretendi il rosso. Ma su un difetto APERTO la prova è già rossa — quindi qualunque
// mutazione «funziona», e il controllo diventa vuoto. Il motivo sta a monte, ed è la scoperta di
// questo lotto: **nessun difetto aperto aveva mai avuto una prova a comando** (zero su 220). Tutta
// la macchina delle mutazioni è nata per prove che confermano un fix, non per prove che dimostrano
// un guasto.
//
// Qui c'è il controllo che serve a quelle: la PROVA A DUE VERSI. Per ognuna delle cinque si copia il
// pezzo di repo che guarda, ci si simula sopra il fix, e si pretende che il verdetto SI RIBALTI.
// Rosso adesso (il difetto c'è) e verde col fix finto (saprebbe accorgersene). Una prova inchiodata
// su un verso solo non ha mai avuto occasione di sbagliarsi, e non vale niente.
//
// 🟢 Non tocca niente di vivo: `PROVE_DIFETTI_RADICE` punta le prove su una copia usa-e-getta.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdtempSync, mkdirSync, cpSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const PROVA = join(QUI, "..", "prove-difetti.mjs");

/** Una copia usa-e-getta dei soli file che la prova guarda. */
function copiaParziale(percorsi) {
  const radice = mkdtempSync(join(tmpdir(), "due-versi-"));
  for (const p of percorsi) {
    const sorgente = join(REPO, p);
    if (!existsSync(sorgente)) continue;
    const dest = join(radice, p);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(sorgente, dest);
  }
  return radice;
}

/** Esegue una prova puntata su una radice scelta. Ritorna il codice: 0 riparato · 1 aperto · 2 cieco. */
function eseguiProva(flag, radice) {
  const r = spawnSync("node", [PROVA, flag], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 120_000,
    env: { ...process.env, PROVE_DIFETTI_RADICE: radice },
  });
  return { codice: r.status, detto: `${r.stdout || ""}${r.stderr || ""}`.trim() };
}

/** Applica al file copiato una sostituzione, e verifica che sia davvero avvenuta. */
function simulaFix(radice, file, cerca, sostituisci) {
  const p = join(radice, file);
  const t = readFileSync(p, "utf8");
  assert.ok(t.includes(cerca), `il finto fix non si aggancia: «${cerca.slice(0, 50)}…» non è in ${file}`);
  writeFileSync(p, t.replace(cerca, sostituisci));
}

/** Il metro comune: adesso deve dire NO, col fix finto deve dire SÌ. */
function siRibalta({ flag, file, cerca, sostituisci, extra = [] }) {
  const percorsi = [file, ...extra];

  const senzaFix = copiaParziale(percorsi);
  const prima = eseguiProva(flag, senzaFix);
  assert.equal(prima.codice, 1, `${flag} doveva dire «il difetto c'è» sul codice di oggi, invece: ${prima.detto}`);

  const conFix = copiaParziale(percorsi);
  simulaFix(conFix, file, cerca, sostituisci);
  const dopo = eseguiProva(flag, conFix);
  assert.equal(dopo.codice, 0, `${flag} non si accorge del fix: resta inchiodata sul rosso. Detto: ${dopo.detto}`);
}

/**
 * Lo stesso metro, quando il fix finto non sta in un file solo.
 *
 * `siRibalta` cambia UN punto. Ci sono difetti la cui cura è per definizione distribuita — «questa
 * verità è copiata in cinque file, portala in uno» — e lì un fix su un file solo lascia il verdetto
 * rosso: la prova sembrerebbe inchiodata mentre invece ha ragione. Qui le modifiche si applicano
 * tutte insieme, che è la forma vera della cura.
 */
function simulaFixOvunque(radice, file, cerca, sostituisci) {
  const p = join(radice, file);
  const t = readFileSync(p, "utf8");
  assert.ok(t.includes(cerca), `il finto fix non si aggancia: «${cerca.slice(0, 50)}…» non è in ${file}`);
  writeFileSync(p, t.split(cerca).join(sostituisci));
}

function siRibaltaConPiuFix({ flag, file, fix }) {
  const percorsi = [...new Set([file, ...fix.map((f) => f.file)])];

  const senzaFix = copiaParziale(percorsi);
  const prima = eseguiProva(flag, senzaFix);
  assert.equal(prima.codice, 1, `${flag} doveva dire «il difetto c'è» sul codice di oggi, invece: ${prima.detto}`);

  const conFix = copiaParziale(percorsi);
  // `tutte` esiste per i difetti che stanno in N punti identici: curarne uno non è la cura, ed è
  // proprio quello il difetto. Senza, il fix finto ne sistemerebbe uno solo e la prova resterebbe
  // rossa — sembrando inchiodata mentre invece sta dicendo la verità.
  for (const f of fix) {
    if (f.tutte) simulaFixOvunque(conFix, f.file, f.cerca, f.sostituisci);
    else simulaFix(conFix, f.file, f.cerca, f.sostituisci);
  }
  const dopo = eseguiProva(flag, conFix);
  assert.equal(dopo.codice, 0, `${flag} non si accorge del fix: resta inchiodata sul rosso. Detto: ${dopo.detto}`);
}

/**
 * Lo stesso metro, per un difetto GIÀ RIPARATO nel codice vero.
 *
 * `siRibalta` parte dal rosso e applica il fix. Quando il difetto viene riparato per davvero quel
 * verso non è più percorribile — il codice di oggi è verde — e la prova comincia a fallire proprio
 * *perché* il lavoro è stato fatto. La tentazione, a quel punto, è cancellarla: ed è così che si
 * perde il rilevatore, che resta l'unica cosa capace di accorgersi se il difetto torna.
 *
 * Quindi il verso si gira: si parte dal codice riparato, si RIMETTE il difetto, e si pretende che il
 * rilevatore lo veda ancora. Ciò che si prova è identico — la prova sa dire sì E sa dire no — solo
 * letto dal lato in cui il codice si trova adesso.
 */
function siRibaltaAlContrario({ flag, file, cerca, sostituisci, extra = [] }) {
  const percorsi = [file, ...extra];

  const oggi = copiaParziale(percorsi);
  const prima = eseguiProva(flag, oggi);
  assert.equal(prima.codice, 0, `${flag} doveva dire «il difetto NON c'è» sul codice riparato di oggi, invece: ${prima.detto}`);

  const rotto = copiaParziale(percorsi);
  simulaFix(rotto, file, cerca, sostituisci); // qui «il fix» è la rottura: la mutazione al contrario
  const dopo = eseguiProva(flag, rotto);
  assert.equal(dopo.codice, 1, `${flag} NON vede più il difetto quando torna: il rilevatore è cieco. Detto: ${dopo.detto}`);
}

// ── Le cinque del primo lotto ────────────────────────────────────────────────

test("AR-366 — il battito: rossa oggi, verde se il timbro arriva solo dopo un lavoro riuscito", () => {
  siRibalta({
    flag: "--ar-366",
    file: "cervello/worker.sh",
    cerca: "battito_worker() {",
    sostituisci:
      'battito_lavoro_riuscito() {\n  [ "${1:-1}" = 0 ] || return 0\n  imposta "worker:ultimo:lavoro-riuscito=$(ts)"\n}\n\nbattito_worker() {',
  });
});

test("AR-388 — le scritture del server: RIPARATO, e la prova se ne accorge se la messa al sicuro sparisce", () => {
  // ⟲ VERSO GIRATO (lotto 44). Il difetto è stato riparato davvero: prima del `checkout -f` lo
  // script mette da parte la memoria non committata, e il rilevatore lo conferma da solo — fotografa
  // lo stato del repo nell'istante del checkout e ci trova una stash. Il verso originale (parti dal
  // rotto, applica il fix) non è più percorribile su un codice verde.
  //
  // La rottura fedele è togliere la messa al sicuro e lasciare solo lo scarico dello stage: è
  // esattamente com'era il ramo il giorno in cui il server ha perso il lavoro appena promesso.
  siRibaltaAlContrario({
    flag: "--ar-388",
    file: "cervello/vps/aggiorna-cervello.sh",
    // La rottura giusta toglie TUTTO il blocco, non solo la stash. Il primo tentativo spegneva solo
    // il `git stash push` e la prova restava cieca: c'era una seconda difesa — se non riesce a
    // mettere da parte, lo script si RIFIUTA di allineare — e l'esecuzione non arrivava mai al
    // checkout. Buona notizia sul fix (due strade, non una), ma una mutazione che non riproduce il
    // guasto non prova niente. Saltando l'intero ramo si torna esattamente al codice del giorno in
    // cui il server ha perso il lavoro appena promesso.
    cerca: 'if [ "$_azione_salvataggio" = "metti-da-parte" ]; then',
    sostituisci: 'if false; then',
  });
});

test("AR-412 — il doppio clic: rossa oggi, verde se la prenotazione esiste ed è presa prima delle mani", () => {
  siRibalta({
    flag: "--ar-412",
    file: "pannello/src/lib/mani.ts",
    cerca: "export",
    sostituisci: "export async function prenotaAzione(id: string) { return true; }\n// prenotaAzione(id) prima di eseguiAzione(id)\nexport",
    extra: ["pannello/src/app/api/azioni-pronte/route.ts"],
  });
});

// ── Il secondo lotto: i quattro verdetti buttati via + il cancello cieco ─────
//
// Tutti e cinque leggono `cervello/giro.sh` e sono nati rossi. Il finto fix è ogni volta la stessa
// mossa — prendere quello che il guardiano ha detto e portarlo al motore — perché la malattia è una
// sola in cinque punti diversi.
//
// Due sono nel frattempo stati riparati sul serio (AR-395 col lotto 40, AR-323 col lotto 41) e il
// loro caso è girato al contrario: si parte dal codice verde e si rimette il difetto. La lista qui
// sotto quindi non è più tutta rossa, ed è la direzione giusta — il giorno in cui lo saranno tutti
// e cinque al contrario vorrà dire che questa famiglia di difetti è chiusa.

test("AR-208 — il budget: rossa oggi, verde se il rc esce dalla pipe e diventa vincolo", () => {
  siRibalta({
    flag: "--ar-208",
    file: "cervello/giro.sh",
    cerca: '  node "$SCRIPT_DIR/sentinella-budget.mjs" 2>&1 | esito_righe 4 || true',
    sostituisci:
      '  _budget_out="$(node "$SCRIPT_DIR/sentinella-budget.mjs" 2>&1)"; _budget_rc=$?\n' +
      "  printf '%s\\n' \"$_budget_out\" | esito_righe 4\n" +
      '  if [ "$_budget_rc" -ne 0 ]; then\n' +
      "    BUDGET_VINCOLO=\"$(printf '%s\\n' \"$_budget_out\" | head -1)\"\n" +
      "  fi",
  });
});

test("AR-392 — il letargo: RIPARATO, e la prova se ne accorge se il verdetto torna dentro la pipe", () => {
  // ⟲ VERSO GIRATO (lotto 44), stessa ragione di AR-323 e AR-395: il difetto è stato riparato per
  // davvero. Il giro cattura l'uscita del letargo (`_letargo_out`) e la porta al motore dentro il
  // vincolo; prima finiva in una pipe, dove il codice d'uscita è quello del filtro e il verdetto si
  // perdeva. La rottura fedele è rimettere la riga com'era: un `| esito_righe 3 || true` che stampa
  // e butta via il «no» del guardiano.
  siRibaltaAlContrario({
    flag: "--ar-392",
    file: "cervello/giro.sh",
    cerca: '  _letargo_out="$(node "$SCRIPT_DIR/letargo.mjs" 2>&1)"; _letargo_rc=$?',
    sostituisci: '  node "$SCRIPT_DIR/letargo.mjs" 2>&1 | esito_righe 3 || true\n  _letargo_rc=0; _letargo_out=""',
  });
});

test("AR-323 — gli esperimenti: RIPARATO, e la prova se ne accorge se il testo torna scritto a mano", () => {
  // ⟲ VERSO GIRATO (lotto 41), per la stessa ragione di AR-395 qui sotto: il difetto è stato
  // riparato per davvero. Il giro non scrive più la frase fissa «⛔ NESSUN ESPERIMENTO APERTO» —
  // adesso cattura l'uscita del guardiano (`_esp_out`) e la infila dentro il vincolo, così due
  // problemi opposti (misurare i vecchi / aprirne uno) arrivano al motore con parole diverse.
  // Il verso originale — parti dal rotto, applica il fix — non è più percorribile: oggi è verde.
  //
  // Non si cancella il caso: si gira. La rottura fedele è rimettere la malattia nella sua forma
  // vera, cioè un testo che il GIRO scrive a mano invece di riportare quello che ha detto il
  // guardiano. La sostituzione qui sotto toglie sia `$_esp_out` sia `$_esp_rc` dal vincolo: quello
  // che resta è identico a qualunque cosa il guardiano abbia misurato — che è esattamente AR-323.
  siRibaltaAlContrario({
    flag: "--ar-323",
    file: "cervello/giro.sh",
    cerca:
      '    ESP_VINCOLO="⛔ VOLANO DEGLI ESPERIMENTI (esperimenti-check.mjs rc=$_esp_rc, AR-041/AR-106/AR-323) — quello che ha misurato il guardiano, parola per parola:\n$_esp_out',
    sostituisci: '    ESP_VINCOLO="⛔ NESSUN ESPERIMENTO APERTO: il volano non misura niente, aprine uno subito',
  });
});

test("AR-158 — la North Star: rossa oggi, verde se il vincolo riporta la misura invece dell'ordine fisso", () => {
  siRibalta({
    flag: "--ar-158",
    file: "cervello/giro.sh",
    cerca: '    NORTH_STAR_VINCOLO="⛔ NORTH STAR IN STALLO',
    sostituisci: "    NORTH_STAR_VINCOLO=\"$(printf '%s\\n' \"$_north_out\" | head -1)\" # era: ⛔ NORTH STAR IN STALLO",
  });
});

test("AR-395 — il cancello di pubblicazione: RIPARATO, e la prova se ne accorge se torna indietro", () => {
  // ⟲ VERSO GIRATO (lotto 40). Il difetto è stato riparato per davvero: la corsia J ha spostato la
  // chiamata a `gate_pubblicazione` PRIMA del commit e le ha passato il quarto argomento `1` («ho
  // del lavoro da pubblicare»), così uno stage vuoto adesso viene DETTO invece che scambiato per
  // «nessun file di codice». Il verso originale — parti dal rotto, applica il fix — non è più
  // percorribile su un codice che è verde.
  //
  // Non si cancella: si gira. Si rimette il difetto e si pretende che il rilevatore lo veda. Il
  // difetto vero non era «manca la chiamata» ma «la chiamata guarda troppo TARDI» — e il rilevatore
  // misura esattamente quello: quanti file restano nello stage nell'istante in cui il cancello
  // decide. Quindi la rottura fedele non è togliere un argomento (il rilevatore non lo guarda): è
  // rimettere un commit davanti alla chiamata, così lo stage risulta svuotato quando il cancello
  // arriva a guardarlo. È il difetto originale, riprodotto nella sua forma vera.
  siRibaltaAlContrario({
    flag: "--ar-395",
    file: "cervello/giro.sh",
    cerca: '    . "$SCRIPT_DIR/gate-pubblicazione.sh"',
    sostituisci:
      '    git commit -m "il commit che svuota lo stage (AR-395 rimesso apposta)" >/dev/null 2>&1 || true\n' +
      '    . "$SCRIPT_DIR/gate-pubblicazione.sh"',
  });
});

// ── Le due che qui non si possono ribaltare, e il perché ─────────────────────

test("AR-206 — la prova delega al guardiano dei permessi, che ha già i suoi controlli", () => {
  // Non si ribalta con una copia parziale: `permessi-check.mjs` legge i file di permesso VERI, e
  // puntarlo altrove vorrebbe dire riscrivere il guardiano. Il verso «sì» lo prova la sua batteria
  // (cervello/test/permessi-check.test.mjs). Qui si pretende almeno che il verso «no» sia vivo e
  // motivato: una prova che dice no senza dire perché è un muro, non una diagnosi.
  const r = eseguiProva("--ar-206", REPO);
  assert.equal(r.codice, 1, `AR-206 doveva dire «il difetto c'è»: ${r.detto}`);
  assert.match(r.detto, /jolly/, "il no deve dire QUALE permesso è troppo largo, non solo che qualcosa non va");
});

test("AR-365 — senza le chiavi della memoria la prova esce ⚪, e ⚪ non è né un sì né un no", () => {
  // È il caso che va difeso di più: da una sessione senza `.env` il modulo dell'allerta si spegne
  // prima di rispondere. La prova NON deve inventarsi un verdetto — deve dire che non ha misurato.
  const r = eseguiProva("--ar-365", REPO);
  assert.ok([1, 2].includes(r.codice), `atteso 1 (difetto c'è) o 2 (non misurabile), avuto ${r.codice}: ${r.detto}`);
  if (r.codice === 2) assert.match(r.detto, /non posso esercitarla|non ho potuto/, "un ⚪ deve dire PERCHÉ non ha misurato");
});

// ── I QUATTRO GRAVI NATI NEL LOTTO 44 ────────────────────────────────────────
//
// Nascono rossi: sono difetti aperti. Qui si prova che i loro rilevatori sanno dire anche di SÌ —
// altrimenti sarebbero quattro prove inchiodate su un verso solo, cioè quattro prove che non hanno
// mai avuto occasione di sbagliarsi.

test("AR-730 — la penna cruda nella porta dei sensori: rossa oggi, verde se la scrittura passa dal freno", () => {
  siRibalta({
    flag: "--ar-730",
    file: "cervello/stato-sensori.mjs",
    cerca: '  else writeFileSync(path, JSON.stringify(doc, null, 2) + "\\n", "utf8");',
    sostituisci: '  else scriviJsonAtomico(path, doc);',
  });
});

test("AR-737 — il rebase che ingoia i suoi tre esiti: rossa oggi, verde se il fallimento dell'abort viene letto", () => {
  siRibaltaConPiuFix({
    flag: "--ar-737",
    file: "cervello/vps/aggiorna-cervello.sh",
    fix: [
      {
        file: "cervello/vps/aggiorna-cervello.sh",
        cerca: "          git rebase --abort 2>/dev/null || true",
        sostituisci: '          if ! git rebase --abort 2>/dev/null; then echo "[$(ts)] ⛔ abort del rebase FALLITO: albero a metà" >&2; return 1; fi',
      },
      {
        file: "cervello/vps/aggiorna-cervello.sh",
        cerca: '      && { git "${GIT_ID[@]}" rebase FETCH_HEAD 2>/dev/null || git rebase --abort 2>/dev/null || true; }',
        sostituisci: '      && node "$REPO/cervello/esito-scrittura.mjs" rebase',
      },
    ],
  });
});

test("AR-743 — il confronto della prova copiato a mano: rossa oggi, verde se i copisti importano la casa", () => {
  siRibaltaConPiuFix({
    flag: "--ar-743",
    file: "cervello/prove-regole.mjs",
    fix: [
      {
        file: "cervello/chiusure-audit.mjs",
        cerca: 'import',
        sostituisci: 'import { patternTrovato } from "./prove-regole.mjs";\nimport',
      },
      {
        file: "cervello/allinea-scan-cantiere.mjs",
        cerca: 'import',
        sostituisci: 'import { patternTrovato } from "./prove-regole.mjs";\nimport',
      },
    ],
  });
});

test("AR-744 — gli esperimenti misurati senza che il gate parta: rossa oggi, verde se lo stato dice la verità", () => {
  siRibaltaConPiuFix({
    flag: "--ar-744",
    file: "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-miglioramento.json",
    // La cura vera è che un esperimento il cui gate non è partito NON si chiami «misurato». Si simula
    // sul dato — e su TUTTI: sono sei, e sistemarne uno lascerebbe il difetto in piedi cinque volte.
    fix: [
      {
        file: "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-miglioramento.json",
        cerca: '"stato": "misurato"',
        sostituisci: '"stato": "non_testato"',
        tutte: true,
      },
    ],
  });
});
