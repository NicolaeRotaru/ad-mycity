#!/usr/bin/env node
// 🚪 LA MALATTIA: un permesso giustificato da una FRASE, e nessuna prova che metta la frase alla
//    prova. (AR-410 e AR-234, lotto 41 corsia 1)
//
// AR-410 — Il battito è l'unica porta tolta dalla serratura, e il motivo scritto accanto diceva che
// «si difende da sola con CRON_SECRET fail-closed». Il codice però era `if (secret && auth !== …)`:
// senza la variabile il controllo non esisteva e la porta era aperta a chiunque, in GET e in POST.
// Dietro ci sono `creaLavoro` (fa girare l'agente sul VPS) ed `eseguiAutopilota` (esegue azioni
// senza che nessuno clicchi). Il collaudo verificava che l'esenzione portasse un motivo lungo
// almeno 20 caratteri: cioè che la frase esistesse, mai che fosse vera.
//
// AR-234 — Era rimasta viva una porta (`/api/esegui`) che sparava un'azione all'automazione senza
// lasciare traccia: sostituita, non rimossa. È stata cancellata nel lotto 32. Provare che «il file
// non c'è» però non frena niente: quello che frena è che OGNI porta che muta lo stato passi dal
// cancello. Qui si esegue la serratura VERA su TUTTE le rotte vere del Pannello, una per una.
//
// Si esegue con: node cervello/test/c1-porta-aperta-per-default.test.mjs

import { registerHooks } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const SRC = join(REPO, "pannello/src");
const API = join(SRC, "app/api");

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

const { decidiAccesso, ESENTI, difesaBattito } = await import(join(REPO, "pannello/src/lib/serratura.ts"));
const { scrittureNelMetodo } = await import(join(REPO, "pannello/src/lib/rotte-scriventi.ts"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** Tutte le rotte vere sotto app/api, col loro percorso pubblico. */
function tutteLeRotte(dir = API) {
  const fuori = [];
  for (const voce of readdirSync(dir)) {
    const p = join(dir, voce);
    if (statSync(p).isDirectory()) fuori.push(...tutteLeRotte(p));
    else if (voce === "route.ts") {
      fuori.push({ file: p, percorso: "/" + relative(SRC, dirname(p)).replace(/\\/g, "/").replace(/^app\//, "") });
    }
  }
  return fuori;
}

const ROTTE = tutteLeRotte();
const METODI_CHE_MUTANO = ["POST", "PUT", "PATCH", "DELETE"];

// ── AR-410 ────────────────────────────────────────────────────────────────────
prova("AR-410: OGNI rotta esente esegue la difesa che dichiara, e senza chiave RIFIUTA", () => {
  assert.ok(ESENTI.length > 0, "se l'elenco è vuoto questa prova non prova niente");
  for (const e of ESENTI) {
    assert.equal(typeof e.difesa, "function", `l'esenzione ${e.path} porta una frase ma nessuna difesa da eseguire`);
    // La chiave NON è configurata: è il caso che il file di configurazione consegnava per default.
    const senzaChiave = e.difesa({ segreto: undefined, header: { authorization: "Bearer qualunque-cosa" } });
    assert.equal(senzaChiave.ammessa, false, `${e.path}: senza chiave configurata la porta è rimasta aperta`);
    assert.equal(senzaChiave.status, 503, `${e.path}: senza chiave la risposta giusta è «non configurato»`);
    assert.ok(senzaChiave.motivo.length > 20, `${e.path}: e deve dire a Nicola cosa manca`);
    // Chiave configurata ma token sbagliato: resta chiusa.
    const tokenSbagliato = e.difesa({ segreto: "vero-segreto", header: { authorization: "Bearer falso" } });
    assert.equal(tokenSbagliato.ammessa, false, `${e.path}: un token sbagliato non può passare`);
  }
});

prova("AR-410: uno sconosciuto senza header non entra nemmeno quando la chiave manca", () => {
  const nudo = difesaBattito({ segreto: undefined, header: {} });
  assert.equal(nudo.ammessa, false, "è il `curl` da qualunque parte del mondo: dietro c'è l'agente sul VPS");
  const conOrigineAltrui = difesaBattito({
    segreto: undefined,
    header: { "sec-fetch-site": "cross-site", origin: "https://altro.example", host: "pannello.test" },
  });
  assert.equal(conOrigineAltrui.ammessa, false, "una pagina di un altro sito non deve poter far battere il cuore");
});

prova("AR-410: il metro sa dire di SÌ — il cron col segreto giusto e il Pannello stesso passano", () => {
  assert.equal(difesaBattito({ segreto: "s3greto", header: { authorization: "Bearer s3greto" } }).ammessa, true, "il cron deve poter lavorare");
  assert.equal(
    difesaBattito({ segreto: undefined, header: { "sec-fetch-site": "same-origin" } }).ammessa,
    true,
    "il pulsante «Aggiorna ora» del Pannello deve continuare a funzionare anche in locale",
  );
});

// ── AR-234 ────────────────────────────────────────────────────────────────────
prova("AR-234: la porta senza traccia non esiste più", () => {
  assert.equal(existsSync(join(API, "esegui/route.ts")), false, "/api/esegui è tornata: era la via di esecuzione senza traccia");
  assert.equal(existsSync(join(SRC, "lib/azioni.ts")), false, "il modulo che quella porta usava è tornato");
});

prova("AR-234: NESSUNA porta che muta lo stato è raggiungibile da uno sconosciuto", () => {
  // La cura vera non è aver cancellato un file: è che una porta nuova che muta lo stato non possa
  // nascere fuori dal cancello. Qui il cancello VERO viene eseguito su tutte le rotte VERE.
  const aperte = [];
  for (const r of ROTTE) {
    const testo = readFileSync(r.file, "utf8");
    const muta = METODI_CHE_MUTANO.some((m) => scrittureNelMetodo(testo, m).length > 0);
    if (!muta) continue;
    const verdetto = decidiAccesso({
      metodo: "POST",
      percorso: r.percorso,
      header: {}, // né browser né token: uno sconosciuto con curl
      tokenAtteso: "token-macchina-configurato",
    });
    if (!verdetto.ammessa) continue;
    // Ammessa dalla serratura: allora DEVE essere un'esenzione, e la sua difesa deve rifiutare.
    const esenzione = ESENTI.find((e) => r.percorso === e.path || r.percorso.startsWith(e.path + "/"));
    if (!esenzione) {
      aperte.push(`${r.percorso} (nessuna esenzione dichiarata)`);
      continue;
    }
    if (esenzione.difesa({ segreto: undefined, header: {} }).ammessa) {
      aperte.push(`${r.percorso} (esente, e la sua difesa lascia passare)`);
    }
  }
  assert.deepEqual(aperte, [], `porte che mutano lo stato e lasciano entrare uno sconosciuto: ${aperte.join(" · ")}`);
});

prova("AR-234: il metro sa dire di SÌ — dal Pannello e col token macchina si entra", () => {
  const daBrowser = decidiAccesso({
    metodo: "POST",
    percorso: "/api/azioni-pronte",
    header: { "sec-fetch-site": "same-origin" },
    tokenAtteso: "t",
  });
  assert.equal(daBrowser.ammessa, true, "se rifiutasse anche la UI, il Pannello sarebbe inutilizzabile");
  const conToken = decidiAccesso({
    metodo: "POST",
    percorso: "/api/azioni-pronte",
    header: { authorization: "Bearer t" },
    tokenAtteso: "t",
  });
  assert.equal(conToken.ammessa, true, "e gli script con il token macchina devono poter lavorare");
});

const rossi = casi.filter((c) => !c.ok);
console.log(`TAP version 13\n1..${casi.length}`);
casi.forEach((c, i) => console.log(`${c.ok ? "ok" : "not ok"} ${i + 1} - ${c.nome}${c.ok ? "" : `\n  # ${c.err}`}`));
console.log(`# pass ${casi.length - rossi.length}`);
console.log(`# fail ${rossi.length}`);
process.exit(rossi.length ? 1 : 0);
