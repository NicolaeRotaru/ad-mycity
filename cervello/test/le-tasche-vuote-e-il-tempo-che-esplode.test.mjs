#!/usr/bin/env node
// 🔒 AR-921 — DUE BUCHI NELLE «TASCHE VUOTE»: uno che comanda il figlio, uno che fa esplodere il tempo
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE
// ─────────────────────────────────────────────────────────────────────────────
// `ambientePulito()` esiste perché «se un comando ostile arriva fin qui, deve trovare le tasche
// vuote». Il collaudo di sicurezza del 31/8 ha misurato che non lo erano, in due modi diversi.
//
// ① NODE_OPTIONS non contiene nessuna delle parole della lista nera, e node le opzioni le legge
//    ANCHE dall'ambiente: `NODE_OPTIONS=--require /tmp/mio.cjs` esegue quel file PRIMA della prova
//    ammessa, scavalcando in un colpo tutta la lista bianca di `esecuzione-prova.mjs`.
//    Peso onesto: chi scrive NODE_OPTIONS nel processo padre ha già l'esecuzione — è difesa in
//    profondità che mancava, non un varco nuovo. Ma il commento del file la prometteva.
//
// ② Il controllo per VALORE aveva due pezzi che si sovrapponevano (`[^/@\s]*:` e `[^/@\s]+@`), e su
//    un valore pieno di due punti senza chiocciola il motore provava ogni punto di taglio. MISURATO,
//    non ragionato: 4,9 ms a 2 KB · 257 ms a 20 KB · 1,0 s a 40 KB · 4,2 s a 80 KB — il tempo
//    QUADRUPLICA quando l'ingresso raddoppia. E `ambientePulito()` è un parametro di default di
//    `eseguiProva`, quindi si rivaluta a ogni mutazione: 970 volte per corsa. Il banco non finisce,
//    e un banco che non finisce lascia il cancello cieco.
//
// ⚠️ COSA GUARDA QUESTO FILE e cosa no. Il caso sul tempo NON fissa un numero di millisecondi —
// cambia col computer, e una prova così diventa rossa per il motivo sbagliato. Guarda la FORMA
// della crescita: raddoppiando l'ingresso il tempo non deve quadruplicare. È l'invariante, il
// millisecondo è un dettaglio della macchina.

import test from "node:test";
import assert from "node:assert/strict";
import { ambientePulito, CHIAVE_DENTRO_UN_URL } from "../non-vacuita.mjs";

test("AR-921 · NODE_OPTIONS non arriva al figlio: comanda node prima che la prova parta", () => {
  const p = ambientePulito({ PATH: "/usr/bin", NODE_OPTIONS: "--require /tmp/mio.cjs" });
  assert.equal("NODE_OPTIONS" in p, false, "il figlio riceve --require e lo esegue prima della prova ammessa");
  assert.equal(p.PATH, "/usr/bin", "il resto dell'ambiente non si tocca");
});

test("AR-921 · e nemmeno i suoi fratelli che comandano lo stesso", () => {
  const p = ambientePulito({
    PATH: "/usr/bin",
    NODE_EXTRA_CA_CERTS: "/tmp/finto.pem",
    BASH_ENV: "/tmp/mio.sh",
    LD_PRELOAD: "/tmp/mio.so",
    npm_config_registry: "http://registro.di.qualcun.altro",
  });
  for (const k of ["NODE_EXTRA_CA_CERTS", "BASH_ENV", "LD_PRELOAD", "npm_config_registry"]) {
    assert.equal(k in p, false, `${k} arriva ancora al figlio`);
  }
});

test("AR-921 · le credenziali dentro un URL si riconoscono ancora, tutte e quattro le forme", () => {
  for (const v of [
    "postgres://utente:password@host/db",
    "redis://:pw@host:6379",
    "mysql://root:s3gr3t0@127.0.0.1:3306/x",
    "amqps://u:p@rabbit",
  ]) {
    assert.equal("X" in ambientePulito({ X: v }), false, `una credenziale è sfuggita: ${v}`);
  }
});

test("AR-921 · …e gli URL puliti passano ancora: la cura non è diventata un divieto di URL", () => {
  for (const v of [
    "https://xyz.supabase.co",
    "postgres://host/db",
    "https://github.com/utente/repo",
    "http://localhost:3000/percorso",
  ]) {
    assert.equal(ambientePulito({ X: v }).X, v, `un URL pulito è stato tolto a torto: ${v}`);
  }
});

// ⚠️ COME MISURO IL TEMPO, e perché NON con un rapporto. La prima stesura confrontava la crescita
// — «raddoppiando l'ingresso il tempo non deve quadruplicare» — ed è diventata rossa alla prima
// corsa dentro la suite intera: ×14,5 su un'espressione che è lineare, solo perché la macchina era
// occupata. Un rapporto fra due misure da frazioni di millisecondo è rumore, non un invariante:
// esattamente la malattia AR-787 che il commento in cima a questo file dice di evitare, scritta da
// me dieci righe più sotto.
//
// La misura vera dice che un rapporto non serve. Su un valore da 100 KB (MISURATO su questa
// macchina): espressione curata 0,40 ms · espressione rotta 2847 ms. Sono settemila volte. Un
// tetto ASSOLUTO a mezzo secondo sta milleduecento volte sopra il costo vero — nessun carico lo
// raggiunge — e cinque volte sotto quello rotto: la mutazione lo sfonda comunque.
//
// Un invariante robusto non è quello più stretto: è quello con il margine più largo da tutt'e due
// le parti.

const CENTOMILA = `postgres://${"a:".repeat(50_000)}`;
const TETTO_MS = 500;

test("AR-921 · un valore da 100 KB non blocca il banco: tetto assoluto, non un rapporto fra rumori", () => {
  const t = process.hrtime.bigint();
  CHIAVE_DENTRO_UN_URL.test(CENTOMILA);
  const ms = Number(process.hrtime.bigint() - t) / 1e6;
  assert.ok(ms < TETTO_MS,
    `l'espressione ha preso ${ms.toFixed(0)} ms su 100 KB (curata: meno di un millesimo del tetto). ` +
    "I due pezzi si sovrappongono di nuovo: il motore prova ogni punto di taglio.");
});

test("AR-921 · e lo stesso vale passando dall'ambiente, che è come ci si arriva davvero", () => {
  // `ambientePulito()` è un parametro di DEFAULT di `eseguiProva`: si rivaluta a ogni mutazione,
  // 970 volte per corsa. Un valore lento qui non costa un secondo, costa ore.
  const t = process.hrtime.bigint();
  ambientePulito({ PATH: "/usr/bin", X: CENTOMILA });
  const ms = Number(process.hrtime.bigint() - t) / 1e6;
  assert.ok(ms < TETTO_MS, `il filtro dei segreti ha preso ${ms.toFixed(0)} ms su una sola variabile`);
});
