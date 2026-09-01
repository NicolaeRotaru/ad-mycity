#!/usr/bin/env node
// 🔒 AR-897 — DUE BUCHI NELLE «TASCHE VUOTE»: uno che comanda il figlio, uno che fa esplodere il tempo
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

test("AR-897 · NODE_OPTIONS non arriva al figlio: comanda node prima che la prova parta", () => {
  const p = ambientePulito({ PATH: "/usr/bin", NODE_OPTIONS: "--require /tmp/mio.cjs" });
  assert.equal("NODE_OPTIONS" in p, false, "il figlio riceve --require e lo esegue prima della prova ammessa");
  assert.equal(p.PATH, "/usr/bin", "il resto dell'ambiente non si tocca");
});

test("AR-897 · e nemmeno i suoi fratelli che comandano lo stesso", () => {
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

test("AR-897 · le credenziali dentro un URL si riconoscono ancora, tutte e quattro le forme", () => {
  for (const v of [
    "postgres://utente:password@host/db",
    "redis://:pw@host:6379",
    "mysql://root:s3gr3t0@127.0.0.1:3306/x",
    "amqps://u:p@rabbit",
  ]) {
    assert.equal("X" in ambientePulito({ X: v }), false, `una credenziale è sfuggita: ${v}`);
  }
});

test("AR-897 · …e gli URL puliti passano ancora: la cura non è diventata un divieto di URL", () => {
  for (const v of [
    "https://xyz.supabase.co",
    "postgres://host/db",
    "https://github.com/utente/repo",
    "http://localhost:3000/percorso",
  ]) {
    assert.equal(ambientePulito({ X: v }).X, v, `un URL pulito è stato tolto a torto: ${v}`);
  }
});

test("AR-897 · il tempo non quadruplica quando il valore raddoppia", () => {
  const quanto = (n) => {
    const v = `postgres://${"a:".repeat(n)}`;
    const t = process.hrtime.bigint();
    ambientePulito({ X: v });
    return Number(process.hrtime.bigint() - t) / 1e6;
  };
  quanto(1000); // un giro a vuoto: la prima chiamata paga la compilazione
  const piccolo = Math.max(quanto(20_000), 0.05);
  const grande = quanto(40_000);
  // Quadratico = ×4. Lineare = ×2. Il tetto a 3 lascia respiro al rumore di misura e boccia lo
  // stesso la forma quadratica, che a 80 KB valeva 4,2 secondi per UNA variabile.
  assert.ok(grande / piccolo < 3,
    `raddoppiando l'ingresso il tempo è cresciuto ×${(grande / piccolo).toFixed(1)} (${piccolo.toFixed(2)}ms → ${grande.toFixed(2)}ms): è tornato quadratico`);
});

test("AR-897 · un valore enorme non decide quanto dura una corsa", () => {
  const t = process.hrtime.bigint();
  ambientePulito({ X: `postgres://${"a:".repeat(200_000)}` });
  const ms = Number(process.hrtime.bigint() - t) / 1e6;
  assert.ok(ms < 500, `un valore da 400 KB ha preso ${ms.toFixed(0)} ms, e questo giro si ripete una volta per mutazione`);
});

test("AR-897 · i due pezzi non si sovrappongono più: nessun punto di taglio da provare", () => {
  // Il caso sul tempo qui sopra passa dall'ambiente intero, e lì il rumore di misura è alto.
  // Questo guarda l'espressione da sola, dove la crescita si legge pulita.
  const quanto = (n) => {
    const v = `postgres://${"a:".repeat(n)}`;
    const t = process.hrtime.bigint();
    CHIAVE_DENTRO_UN_URL.test(v);
    return Number(process.hrtime.bigint() - t) / 1e6;
  };
  quanto(2000);
  const piccolo = Math.max(quanto(20_000), 0.02);
  const grande = quanto(40_000);
  assert.ok(grande / piccolo < 3,
    `raddoppiando l'ingresso l'espressione è cresciuta ×${(grande / piccolo).toFixed(1)}: i due pezzi si sovrappongono di nuovo`);
});
