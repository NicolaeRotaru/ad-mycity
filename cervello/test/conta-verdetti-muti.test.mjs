#!/usr/bin/env node
// 🧪 Le prove del CONTATORE DEI VERDETTI MUTI (cervello/conta-verdetti-muti.mjs) — AR-474.
//
// Su storie finte e non sul repo: un caso che misurasse com'è `main` oggi diventerebbe rosso o verde
// per il lavoro di qualcun altro, e fra un mese nessuno saprebbe se il rosso è un bug o una giornata
// storta. La storia vera la guarda il contatore quando gira; qui si difende la regola.

import { test } from "node:test";
import assert from "node:assert/strict";
import { ESCLUDI_MEMORIA, conta, cabinaFerma, verdetto, leggiStoria, tettiDaScrivere, misura, AUTORE_WORKER, CERCA_ESITO_IN_GIT, fileVietatiAllaMacchina } from "../conta-verdetti-muti.mjs";
import { CARTELLE_MEMORIA } from "../cancello-stop.mjs";
import { RIGA_ESITO } from "../cancello-stop.mjs";

const RIGA_VERA =
  "- 2026-08-01 23:26 · Guardiano degli hook · 13 prove · atteso un refuso di maiuscola → reale il JSON invalido scaricava tutti gli hook · #guardiani";

// ── Cos'è una consegna: lo decide git, non un confronto di stringhe ──────────

test("LA PORTA (AR-339): il confine e' un pathspec, non percorsi letti a mano", () => {
  // La prima stesura chiedeva `git log --name-only` e confrontava i prefissi. Con un nome accentato
  // git cita il percorso in ottali fra virgolette: non comincia piu' per "MyCity-Vault/", e un
  // commit di sola memoria diventava una consegna muta. Il guardiano della porta l'ha preso.
  assert.equal(ESCLUDI_MEMORIA.length, CARTELLE_MEMORIA.length, "una esclusione per ogni cartella di memoria, derivata e non ricopiata");
  assert.ok(ESCLUDI_MEMORIA.includes(":(exclude)MyCity-Vault"), "senza la barra finale: e' la forma che vuole git");
  assert.ok(ESCLUDI_MEMORIA.includes(":(exclude)memoria-squadra"));
  assert.ok(!ESCLUDI_MEMORIA.some((e) => e.endsWith("/")), "una barra in coda farebbe combaciare niente");
});

// ── Il conto ──────────────────────────────────────────────────────────────────

test("IL CASO VERO: una consegna senza riga di esito viene contata muta", () => {
  const storia = [{ hash: "aaa", autore: "NicolaeRotaru", quando: "2026-08-01 14:56", titolo: "un lavoro" }];
  const c = conta(storia, new Set());
  assert.equal(c.consegne, 1);
  assert.equal(c.mute, 1);
  assert.equal(c.tasso, 100);
  assert.equal(c.ultime_mute[0].titolo, "un lavoro");
});

test("una consegna il cui commit ha aggiunto l'esito non e' muta", () => {
  const storia = [{ hash: "bbb", autore: "NicolaeRotaru", quando: "2026-08-01 14:56", titolo: "x" }];
  assert.equal(conta(storia, new Set(["bbb"])).mute, 0);
});

test("IL DENOMINATORE: la manutenzione del worker e' esclusa, e l'esclusione si DICHIARA", () => {
  // Senza questo il numero era 644 con 367 commit del worker dentro: un 94% che non misurava il
  // comportamento di nessuno. Un taglio silenzioso, invece, si legge come «ho guardato tutto».
  const storia = [
    { hash: "a", autore: "NicolaeRotaru", quando: "2026-08-01 10:00", titolo: "consegna vera" },
    { hash: "b", autore: "AD MyCity VPS", quando: "2026-08-01 10:01", titolo: "recupero: scritture pendenti" },
    { hash: "c", autore: "AD MyCity (VPS)", quando: "2026-08-01 10:02", titolo: "Merge branch 'main' of …" },
  ];
  const c = conta(storia, new Set());
  assert.equal(c.consegne, 1, "una sola e' una consegna di qualcuno");
  assert.equal(c.esclusi_worker, 2);
  assert.equal(c.mute, 1);
});

test("le due forme con cui il worker firma vengono riconosciute entrambe", () => {
  for (const a of ["AD MyCity VPS", "AD MyCity (VPS)", "AD MyCity"]) assert.ok(AUTORE_WORKER.test(a), `${a} e' il worker`);
  assert.ok(!AUTORE_WORKER.test("NicolaeRotaru"), "e Nicola no");
  assert.ok(!AUTORE_WORKER.test("Claude"), "e nemmeno Claude: quando consegno io, conta");
});

// ── La coerenza fra le due scritture della stessa regola ──────────────────────

test("IL RISCHIO DI DIVERGENZA: il criterio per git e quello per il freno dicono la stessa cosa", () => {
  // Due scritture della stessa regola sono due regole che prima o poi divergono. Qui la divergenza
  // diventa un test rosso invece di un contatore che misura una cosa diversa dal freno.
  const perGit = new RegExp(CERCA_ESITO_IN_GIT);
  assert.ok(RIGA_ESITO.test(RIGA_VERA), "il freno accetta la riga canonica");
  assert.ok(perGit.test(RIGA_VERA), "e la ricerca di git la trova");
  const mutilata = "- 2026-08-01 23:26 · Guardiano degli hook · 13 prove · #guardiani";
  assert.ok(!RIGA_ESITO.test(mutilata), "il freno rifiuta la riga senza calibrazione");
  assert.ok(!perGit.test(mutilata), "e git non la trova: stesso verdetto");
});

// ── La Cabina ferma ───────────────────────────────────────────────────────────

test("IL SECONDO CANALE: la Cabina piu' vecchia dell'ultima consegna viene misurata", () => {
  const c = cabinaFerma("2026-07-30 11:09", "2026-08-02 16:41");
  assert.equal(c.giorni_indietro, 3, "ho continuato a lavorare e la schermata che legge Nicola dice ancora ieri");
});

test("se nessuno lavora la Cabina ferma NON e' un difetto", () => {
  assert.equal(cabinaFerma("2026-08-02 10:00", "2026-08-02 09:00").giorni_indietro, 0, "e' la forbice che conta, non l'eta'");
});

test("una data illeggibile non diventa uno zero rassicurante", () => {
  assert.equal(cabinaFerma("boh", "2026-08-02 16:41"), null, "cieco non e' verde");
  assert.equal(cabinaFerma(null, "2026-08-02 16:41"), null);
});

// ── Il tetto ──────────────────────────────────────────────────────────────────

test("il tetto SCENDE e non risale: piu' mute di ieri = rosso", () => {
  const v = verdetto({ conto: { mute: 254 }, cabina: null, tetti: { consegne_mute: 253, cabina_ferma_giorni: 3 } });
  assert.equal(v.rotto, true);
  assert.match(v.righe[0], /si è allargato/);
});

test("meno mute di ieri non e' rosso: e' un invito ad abbassare il tetto", () => {
  const v = verdetto({ conto: { mute: 100 }, cabina: null, tetti: { consegne_mute: 253, cabina_ferma_giorni: 3 } });
  assert.equal(v.rotto, false);
  assert.match(v.righe[0], /--aggiorna-tetto/);
});

test("anche la Cabina ha il suo tetto, e sfondarlo e' rosso", () => {
  const tetti = { consegne_mute: 253, cabina_ferma_giorni: 3 };
  assert.equal(verdetto({ conto: { mute: 253 }, cabina: { giorni_indietro: 3 }, tetti }).rotto, false);
  const v = verdetto({ conto: { mute: 253 }, cabina: { giorni_indietro: 4, stato_aggiornato: "x", ultima_consegna: "y" }, tetti });
  assert.equal(v.rotto, true);
  assert.match(v.righe[0], /Cabina è ferma/);
});

test("il tetto puo' solo SCENDERE: --aggiorna-tetto non lo alza mai", () => {
  const conto = { mute: 300 };
  const cabina = { giorni_indietro: 9 };
  const tetti = { consegne_mute: 238, cabina_ferma_giorni: 0 };
  // Debito cresciuto E la mano sul comando che aggiorna: il tetto resta dov'era. Alzarlo sarebbe
  // spostare il metro invece di curare la malattia — la cosa che questo contatore esiste per vedere.
  assert.deepEqual(tettiDaScrivere({ conto, cabina, tetti, aggiorna: true }), { consegne_mute: 238, cabina_ferma_giorni: 0 });
  // Senza il comando i tetti non si toccano nemmeno quando il debito scende.
  assert.deepEqual(tettiDaScrivere({ conto: { mute: 10 }, cabina: { giorni_indietro: 0 }, tetti, aggiorna: false }), tetti);
  // Primo giro, nessun referto: si nasce sul debito che c'è. Un tetto che parte a zero parte rosso,
  // e un guardiano che parte rosso viene spento entro il giorno.
  assert.deepEqual(tettiDaScrivere({ conto: { mute: 42 }, cabina: { giorni_indietro: 2 }, tetti: null, aggiorna: false }), {
    consegne_mute: 42,
    cabina_ferma_giorni: 2,
  });
});

test("IL CASO TROVATO USANDOLO: dopo --aggiorna-tetto la schermata non si contraddice", () => {
  // Il difetto vero, visto dal vivo il 3/8: `verdetto` girava sul tetto VECCHIO mentre la riga sopra
  // stampava quello NUOVO, e la stessa schermata diceva «tetto: 238» e sotto «abbassa il tetto a 238».
  const conto = { mute: 238, tasso: 90 };
  const cabina = { giorni_indietro: 0 };
  const vecchi = { consegne_mute: 253, cabina_ferma_giorni: 3 };
  // `misura` esce con la coppia già coerente: il numero stampato e la frase stampata vengono da lì,
  // e non c'è più un montaggio in `main()` che possa disallinearli.
  const m = misura({ conto, cabina, tetti: vecchi, aggiorna: true });
  assert.equal(m.tetti.consegne_mute, 238);
  assert.equal(m.verdetto.rotto, false);
  assert.equal(m.verdetto.righe.length, 0, "col tetto già abbassato non resta niente da chiedere: sarebbe una frase falsa accanto a un numero vero");
});

test("senza --aggiorna-tetto la coppia resta quella di ieri: l'invito ad abbassare deve restare visibile", () => {
  // Il rovescio del caso sopra: se `misura` girasse SEMPRE sui tetti nuovi, il debito sceso
  // diventerebbe invisibile e il tetto non lo abbasserebbe più nessuno.
  const m = misura({ conto: { mute: 238 }, cabina: { giorni_indietro: 0 }, tetti: { consegne_mute: 253, cabina_ferma_giorni: 3 }, aggiorna: false });
  assert.equal(m.tetti.consegne_mute, 253);
  assert.match(m.verdetto.righe[0], /--aggiorna-tetto/);
});

// ── La lettura della storia ───────────────────────────────────────────────────

test("la storia si legge coi campi giusti, autore compreso", () => {
  const grezzo = "@@COMMIT@@aaa1112ff|NicolaeRotaru|2026-08-01 14:56|Un titolo";
  const s = leggiStoria(grezzo);
  assert.equal(s.length, 1);
  assert.equal(s[0].autore, "NicolaeRotaru");
  assert.equal(s[0].quando, "2026-08-01 14:56");
  assert.equal(s[0].titolo, "Un titolo");
});

test("un titolo che contiene una barra verticale non rompe la lettura", () => {
  const s = leggiStoria("@@COMMIT@@aaa1112ff|Claude|2026-08-01 14:56|fix: a|b|c");
  assert.equal(s[0].titolo, "fix: a|b|c", "il titolo e' l'ultimo campo: prende tutto il resto");
});

// ── Il lavoro di Nicola non è debito mio (4/8) ───────────────────────────────

test("i file che la macchina non può scrivere si derivano dai divieti, non si elencano a mano", () => {
  // Il caso vero: il 4/8 Nicola ha agganciato gli hook modificando .claude/settings.json dalla pagina
  // di GitHub, cinque volte. Il contatore le ha lette come cinque consegne senza esito, il tetto si è
  // rotto, e da lì il cancello del lotto era rosso su OGNI PR aperta — per il lavoro di Nicola.
  const vietati = fileVietatiAllaMacchina({
    permissions: {
      deny: ["Write(./.claude/settings.json)", "Edit(./.claude/settings.json)", "Write(**/.env)", "Bash(gh:*)", "Read(**/.env.*)"],
    },
  });
  assert.deepEqual(vietati, [".claude/settings.json"]);
});

test("un glob non entra nell'elenco: descrive più file di quelli che ho verificato", () => {
  assert.deepEqual(fileVietatiAllaMacchina({ permissions: { deny: ["Write(**/.env)", "Edit(pannello/*.ts)"] } }), []);
});

test("senza registro dei divieti non escludo niente (sbaglio contando di più, non di meno)", () => {
  assert.deepEqual(fileVietatiAllaMacchina({}), []);
  assert.deepEqual(fileVietatiAllaMacchina(), []);
});
