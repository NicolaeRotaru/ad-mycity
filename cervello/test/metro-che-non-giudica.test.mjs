#!/usr/bin/env node
// 🕯️ QUANDO IL METRO NON PUÒ GIUDICARE — e la mail NON deve partire lo stesso.
//
// Due difetti con la stessa forma: il controllo d'onestà smette di dare un verdetto, e chi sta
// sopra non se ne accorge. Il verso del danno non è «passa una bugia»: è «nessuno sa cosa è
// successo», che sul canale clienti è peggio, perché la reazione naturale — riprovare — è
// esattamente la cosa da non fare.
//
// · AR-870 — L'ESPRESSIONE CHE MACINA. `RE_RIFERIMENTO_CODICE` non era ancorata: su un blocco lungo
//   senza spazi poteva partire da OGNI carattere e, per ognuno, risalire all'indietro cercando il
//   punto dell'estensione. Costo misurato PRIMA del fix, sulla stessa macchina:
//       10.000 caratteri →    81 ms
//       20.000 caratteri →   281 ms
//       40.000 caratteri → 1.160 ms
//       80.000 caratteri → 4.319 ms      (il quadruplo dei caratteri, ~53 volte il tempo)
//   Dopo il lookbehind: 80.000 caratteri → 1 ms. E oltre il tetto il metro non macina affatto:
//   DICHIARA di non aver guardato (⚪), che non è un verde e non è un rosso.
//
// · AR-871 — L'ECCEZIONE CHE NON PRENDE NESSUNO. Il metro lo chiama `mani.ts`, dentro `eseguiAzione`,
//   che gira dentro il campo `atto:` di `attoUnaVoltaSola` — e lì `p.atto()` era chiamato senza
//   try/catch (verificato sul codice vero, non sulla scheda: nessuna delle due route che chiamano
//   ne aveva uno). Un'eccezione usciva come 500 generico, con la firma di Nicola ancora addosso
//   all'azione e nessuno in grado di dire se la mail fosse partita.
//
// 🟢 Sola lettura. Un solo processo figlio, per provare il codice d'uscita del comando vero.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { registerHooks } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const SRC = join(REPO, "pannello/src");

// Il Pannello scrive gli import senza estensione e con l'alias `@/`: Node da solo non li risolve.
// È lo stesso aggancio che usa già `c1-lettura-cieca-non-e-zero.test.mjs` — copiato di proposito e
// non estratto in un aiutante condiviso, perché una prova che dipende da un altro file di prova si
// rompe per ragioni che non c'entrano col difetto che sorveglia.
registerHooks({
  resolve(spec, ctx, next) {
    if (spec.startsWith("@/")) {
      const base = join(SRC, spec.slice(2));
      for (const e of [".ts", ".tsx", "/index.ts", ""]) {
        if (existsSync(base + e)) return { url: pathToFileURL(base + e).href, shortCircuit: true };
      }
    }
    try {
      return next(spec, ctx);
    } catch (errore) {
      if (errore?.code !== "ERR_MODULE_NOT_FOUND" && errore?.code !== "ERR_UNSUPPORTED_DIR_IMPORT") throw errore;
      for (const x of spec.startsWith(".") ? [".ts", ".tsx", "/index.ts"] : [".js", ".mjs"]) {
        try {
          return next(spec + x, ctx);
        } catch {
          /* provo il prossimo */
        }
      }
      throw errore;
    }
  },
});

const cervello = await import(join(REPO, "cervello", "onesta-check.mjs"));
const pannello = await import(join(REPO, "pannello", "src", "lib", "onesta-check.ts"));
const atto = await import(join(REPO, "pannello", "src", "lib", "cancello-atto.ts"));

// ─────────────────────────────────────────────────────────────────────────────
// AR-870 — il costo, e il ⚪ oltre il tetto
// ─────────────────────────────────────────────────────────────────────────────

// Il budget è largo apposta: quello che deve restare impossibile è il ritorno del comportamento al
// quadrato (4,3 secondi su questo stesso testo), non un decimo di secondo in più su una macchina
// lenta. Fra 1 millisecondo misurato e 1.000 di budget ci sono tre ordini di grandezza di margine.
const BUDGET_MS = 1000;

test("AR-870: 80.000 caratteri senza spazi non piantano il canale", () => {
  const blocco = "a".repeat(80000);
  for (const [chi, giudica] of [
    ["cervello", () => cervello.giudica("email", blocco, "lettera")],
    ["Pannello", () => pannello.giudicaLettera("email", blocco)],
  ]) {
    const t0 = performance.now();
    giudica();
    const ms = performance.now() - t0;
    assert.ok(
      ms < BUDGET_MS,
      `${chi}: 80.000 caratteri hanno richiesto ${ms.toFixed(0)} ms (budget ${BUDGET_MS}). ` +
        "È tornato il costo al quadrato: l'espressione dei riferimenti a codice non è più ancorata.",
    );
  }
});

test("AR-870: oltre il tetto il metro DICHIARA di non aver guardato, e i due mondi lo dicono uguale", () => {
  const enorme = "a".repeat(cervello.LIMITE_TESTO + 1);
  const c = cervello.giudica("email", enorme, "lettera");
  const p = pannello.giudicaLettera("email", enorme);
  assert.equal(c.violazioni.length, 1, "un testo oltre il tetto deve produrre esattamente il rilievo ⚪");
  assert.equal(c.violazioni[0].tipo, cervello.TIPO_NON_GIUDICABILE);
  assert.deepEqual(p.violazioni, c.violazioni, "il ⚪ deve essere identico nei due mondi: è il caso limite, quello dove le due case si staccano per prime");
  // E ⚪ BLOCCA sul canale clienti: `mani.ts` decide su `violazioni.length`, quindi la mail non parte.
  assert.ok(pannello.esaminaOnesta("email", enorme).violazioni.length > 0, "un testo che nessuno ha giudicato non può partire verso un cliente");
  // Sotto il tetto invece si giudica davvero: il tetto non deve diventare la scusa per non guardare.
  assert.equal(cervello.giudica("email", "Ciao! Il tuo ordine è pronto in bottega.", "lettera").violazioni.length, 0);
});

test("AR-870: il tetto non deve spegnere la memoria vera — due canali, due misure", () => {
  // ⚠️ LEZIONE PAGATA IL 28/8, mezz'ora dopo aver messo il tetto. Con un tetto solo a 100.000 il
  // primo file vero che ci è finito sotto è STATO.md (103.604 caratteri quel giorno): il cancello
  // del giro avrebbe cominciato a dichiarare ⚪ sulla memoria di tutti i giorni, cioè a smettere di
  // guardare proprio dove guardava. È la scorciatoia n.15 del catalogo, «nasce rosso».
  const lungo = "Il totale della spesa è 24,80 €. ".repeat(5000); // ~165.000 caratteri
  assert.ok(lungo.length > cervello.LIMITE_TESTO, "il testo di prova deve superare il tetto del canale clienti");
  assert.equal(
    cervello.giudica("MyCity-Vault/90-Memoria-AI/STATO.md", lungo).natura !== "non-giudicabile",
    true,
    "un file di memoria di 165.000 caratteri si giudica: è martedì, non un caso patologico",
  );
  assert.equal(
    cervello.giudica("email", lungo, "lettera").violazioni[0].tipo,
    cervello.TIPO_NON_GIUDICABILE,
    "una mail di 165.000 caratteri non è una mail: lì il tetto deve scattare",
  );
  assert.ok(
    cervello.limitePer("contenuto") > 103604,
    "il tetto della memoria deve stare sopra i file veri del vault (STATO.md pesava 103.604 caratteri il 28/8)",
  );
  // E il file vero, se questo clone ce l'ha: la prova migliore resta quella sul dato di casa.
  const stato = join(REPO, "MyCity-Vault", "90-Memoria-AI", "STATO.md");
  if (existsSync(stato)) {
    const g = cervello.giudica("MyCity-Vault/90-Memoria-AI/STATO.md", readFileSync(stato, "utf8"));
    assert.notEqual(g.natura, "non-giudicabile", "STATO.md deve restare giudicabile: se diventa ⚪ il giro smette di guardare la memoria");
  }
});

test("AR-870: il comando esce 2 — non ho potuto guardare non è né verde né rosso", () => {
  const enorme = "a".repeat(cervello.LIMITE_TESTO + 1);
  let uscita = 0;
  try {
    execFileSync(process.execPath, [join(REPO, "cervello", "onesta-check.mjs"), "--stdin", "--lettera"], { input: enorme, encoding: "utf8" });
  } catch (e) {
    uscita = e.status;
  }
  assert.equal(uscita, 2, "il testo oltre il tetto deve uscire 2 (non ho potuto guardare), non 0 (onesto) e non 1 (bocciato)");
});

// ─────────────────────────────────────────────────────────────────────────────
// AR-871 — l'eccezione diventa un verdetto
// ─────────────────────────────────────────────────────────────────────────────

/** Un testo che esplode appena qualcuno prova a leggerlo: è il modo onesto di rompere il metro. */
const testoCheEsplode = () => ({
  toString() {
    throw new Error("questo testo non si lascia leggere");
  },
});

test("AR-871: se il metro esplode, la porta di mani.ts dà un BLOCCO col motivo — non un'eccezione", () => {
  // Prima: il giudizio lancia davvero. Se un giorno smettesse, questa prova non proverebbe più
  // niente, e il catch qui sotto diventerebbe decorativo senza che nessuno se ne accorga.
  assert.throws(() => pannello.giudicaLettera("email", testoCheEsplode()), /non si lascia leggere/);
  // Dopo: la porta non lancia, e dà un verdetto che FERMA.
  const esito = pannello.esaminaOnesta("email", testoCheEsplode());
  assert.equal(esito.violazioni.length, 1, "il metro in avaria deve produrre un rilievo, non un silenzio");
  assert.equal(esito.violazioni[0].tipo, pannello.TIPO_METRO_IN_AVARIA);
  assert.match(esito.violazioni[0].regola, /NON parte/, "il verdetto deve dire chiaro che la mail non parte");
  assert.match(esito.violazioni[0].esempi.join(" "), /non si lascia leggere/, "il motivo vero dell'avaria deve arrivare a chi legge");
});

test("AR-871: l'atto che esplode diventa un verdetto che dice di NON riprovare", async () => {
  let attiTentati = 0;
  const esito = await atto.attoUnaVoltaSola({
    prenota: async () => "mia",
    atto: async () => {
      attiTentati++;
      throw new Error("Resend non risponde");
    },
    registra: async () => [{ nome: "stato", ok: true }],
  });
  assert.equal(attiTentati, 1, "l'atto va tentato una volta sola");
  assert.equal(esito.eseguito, false);
  assert.equal(esito.motivo, "atto-esploso");
  assert.equal(esito.mondoForseToccato, true, "l'atto è esploso a metà: non sappiamo se il mondo è stato toccato");
  assert.match(esito.messaggio, /NON riprovare/, "dopo un atto che può essere partito, «riprova» è il consiglio peggiore possibile");
  assert.match(esito.messaggio, /Resend non risponde/, "il motivo vero deve arrivare a Nicola");
});

test("AR-871: se esplode la PRENOTAZIONE l'atto non parte affatto", async () => {
  let attiTentati = 0;
  const esito = await atto.attoUnaVoltaSola({
    prenota: async () => {
      throw new Error("memoria giù");
    },
    atto: async () => {
      attiTentati++;
      return "fatto";
    },
    registra: async () => [],
  });
  assert.equal(attiTentati, 0, "senza il posto preso, il mondo non si tocca: fail-closed");
  assert.equal(esito.eseguito, false);
  assert.equal(esito.motivo, "prenotazione-incerta", "una prenotazione esplosa è «non lo so», e non lo so è un no");
});

test("AR-871: se esplode la REGISTRAZIONE l'atto resta fatto, e il messaggio lo dice", async () => {
  const esito = await atto.attoUnaVoltaSola({
    prenota: async () => "mia",
    atto: async () => "inviata",
    registra: async () => {
      throw new Error("Supabase non risponde");
    },
  });
  assert.equal(esito.eseguito, true, "il mondo È stato toccato: dire il contrario sarebbe una bugia");
  assert.equal(esito.registrato, false);
  assert.match(esito.messaggio, /NON riprovare/);
  assert.match(esito.messaggio, /Supabase non risponde/);
});
