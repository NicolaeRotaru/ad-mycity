#!/usr/bin/env node
// AR-438 — la visita si dichiarava cieca sulla Cabina per un indirizzo che la macchina conosce già.
//
// LA STORIA. `salute.mjs` pretendeva PANNELLO_URL o CABINA_URL dall'ambiente. Nelle sessioni cloud
// quelle env non esistono (vivono nel .env del VPS), quindi due controlli su sedici uscivano ⚪ e la
// copertura dichiarata dalla visita era più bassa del vero. Ma quell'indirizzo NON è un segreto: è
// la pagina pubblica che Nicola apre dal telefono. Il codice trattava uguale due cose diverse — i
// segreti, che fuori dal VPS giustamente mancano, e gli indirizzi pubblici, che si possono sapere
// ovunque.
//
// LA TRAPPOLA CHE ROVESCIAVA IL GUADAGNO, ed è metà del valore di questa prova: con Vercel
// Authentication accesa la Cabina risponde **401**. Leggerlo come rosso vorrebbe dire scambiare due
// ⚪ onesti con due ❌ falsi su un servizio sano — un peggioramento travestito da fix. 401 vuol dire
// VIVA-ma-protetta: c'è qualcuno dietro quel muro, ed è la prova che è in piedi.
//
// COSA PROVA QUESTO FILE, eseguendo le decisioni (nessuna chiamata di rete: le risposte si iniettano):
//   ① l'indirizzo si trova senza env, e la casa dei fatti (registro-fatti.json → cabina.url) vince
//      sul vecchio ponte committato, mentre l'ambiente vince su tutti;
//   ② giudicaCabina su 200 / 401 / 500 / timeout — e in più il 403 del login e il 407 del proxy;
//   ③ il cuore, dietro il login, è ⚪ e non ❌: una pagina di autenticazione non è «non risponde
//      in JSON».
//
// NON-VACUITÀ (verificata rompendo il fix apposta):
//   · togliendo il ramo del 401 in `giudicaCabina` (`if (protettaDaLogin(r))` → `if (false)`)
//     il caso 401 torna «la Cabina risponde 401» e i casi ② e ③ diventano ROSSI.
//   · togliendo la lettura del registro dei fatti in `urlCabina`, il caso ① diventa ROSSO.

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { giudicaCabina, protettaDaLogin, urlCabina, valoreFatto } from "../salute.mjs";

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** Una radice finta con dentro solo i file che questa prova vuole far trovare a `urlCabina`. */
function radiceFinta({ fatto, ponte }) {
  const dir = mkdtempSync(join(tmpdir(), "mycity-cabina-"));
  if (fatto !== undefined) {
    mkdirSync(join(dir, "MyCity-Vault/90-Memoria-AI"), { recursive: true });
    writeFileSync(
      join(dir, "MyCity-Vault/90-Memoria-AI/registro-fatti.json"),
      JSON.stringify({ fatti: [{ id: "cabina.url", nome: "Indirizzo della Cabina", valore: fatto }] }),
    );
  }
  if (ponte !== undefined) {
    mkdirSync(join(dir, "cervello"), { recursive: true });
    writeFileSync(join(dir, "cervello/ponte-cabina.json"), JSON.stringify({ pannello_url: ponte }));
  }
  return dir;
}

const conRadice = (opts, fn) => {
  const dir = radiceFinta(opts);
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

// ── ① L'indirizzo: dove vive, e chi vince ───────────────────────────────────

prova("senza env, l'indirizzo esce dal registro dei fatti: niente più ⚪ per una chiave mai servita", () => {
  conRadice({ fatto: "https://esempio-cabina.test" }, (dir) => {
    const r = urlCabina({}, dir);
    assert.ok(r, "senza env la visita deve comunque sapere dov'è la Cabina");
    assert.equal(r.url, "https://esempio-cabina.test");
    assert.match(r.fonte, /registro-fatti/, "la casa dei fatti-chiave è una sola (AR-102)");
  });
});

prova("il registro dei fatti vince sul vecchio ponte committato", () => {
  conRadice({ fatto: "https://dal-registro.test", ponte: "https://dal-ponte.test" }, (dir) => {
    assert.equal(urlCabina({}, dir).url, "https://dal-registro.test");
  });
});

prova("finché il fatto non c'è, il ponte regge: il fix non spegne quello che funzionava", () => {
  conRadice({ ponte: "https://dal-ponte.test" }, (dir) => {
    const r = urlCabina({}, dir);
    assert.equal(r.url, "https://dal-ponte.test");
    assert.equal(r.fonte, "ponte-cabina.json");
  });
});

prova("l'ambiente vince sempre: se il Pannello cambia casa, il VPS si corregge da solo", () => {
  conRadice({ fatto: "https://dal-registro.test", ponte: "https://dal-ponte.test" }, (dir) => {
    assert.equal(urlCabina({ PANNELLO_URL: "https://da-env.test/" }, dir).fonte, "ambiente");
    assert.equal(urlCabina({ PANNELLO_URL: "https://da-env.test/" }, dir).url, "https://da-env.test", "la barra finale si toglie");
    assert.equal(urlCabina({ CABINA_URL: "https://altra-env.test" }, dir).url, "https://altra-env.test");
  });
});

prova("senza niente si resta ⚪, che è la risposta vera: nessun indirizzo inventato", () => {
  conRadice({}, (dir) => assert.equal(urlCabina({}, dir), null));
});

prova("un registro senza quel fatto non finge di averlo", () => {
  assert.equal(valoreFatto({ fatti: [{ id: "altro.fatto", valore: "x" }] }, "cabina.url"), null);
  assert.equal(valoreFatto({ fatti: [{ id: "cabina.url", valore: "   " }] }, "cabina.url"), null, "una stringa vuota non è un indirizzo");
  assert.equal(valoreFatto(null, "cabina.url"), null);
  assert.equal(valoreFatto({ fatti: [{ id: "cabina.url", valore: " https://x.test " }] }, "cabina.url"), "https://x.test");
});

// ── ② Il verdetto sulla Cabina: 200 / 401 / 500 / timeout ───────────────────

prova("200 veloce ⇒ ✅", () => {
  const e = giudicaCabina({ ok: true, status: 200, ms: 300, testo: "<html>" });
  assert.equal(e.esito, "ok");
});

prova("⬇️ IL CASO CHE ROVESCEREBBE IL GUADAGNO: 401 ⇒ ✅ viva-ma-protetta, non ❌", () => {
  const e = giudicaCabina({ ok: true, status: 401, ms: 250, testo: "Authentication Required" });
  assert.equal(e.esito, "ok", "401 vuol dire «e tu chi sei?»: risponde, quindi è viva");
  assert.equal(e.dati.protetta, true);
  assert.match(e.detto, /protetta/i, "e va detto a chiare lettere, altrimenti sembra un verde qualunque");
});

prova("500 ⇒ ❌: il muro protetto non deve diventare un permesso per tutti gli errori", () => {
  const e = giudicaCabina({ ok: true, status: 500, ms: 200, testo: "boom" });
  assert.equal(e.esito, "rotto");
  assert.match(e.detto, /500/);
});

prova("timeout ⇒ ❌ con scritto perché", () => {
  const e = giudicaCabina({ ok: false, errore: "nessuna risposta in 8s", ms: 8000 });
  assert.equal(e.esito, "rotto");
  assert.match(e.detto, /non risponde/);
});

prova("lenta ma viva ⇒ ❌: un guasto che sta nascendo si dice prima che diventi un errore", () => {
  const e = giudicaCabina({ ok: true, status: 200, ms: 9000, testo: "" });
  assert.equal(e.esito, "rotto");
  assert.match(e.detto, /lenta/);
});

prova("403 col login di Vercel ⇒ ✅ protetta; 403 nudo ⇒ ❌", () => {
  assert.equal(giudicaCabina({ ok: true, status: 403, ms: 200, testo: "set-cookie _vercel_sso_nonce=..." }).esito, "ok");
  assert.equal(giudicaCabina({ ok: true, status: 403, ms: 200, testo: "vietato" }).esito, "rotto");
});

prova("407 ⇒ ⚪: quello è il proxy di questo ambiente, non la Cabina", () => {
  const e = giudicaCabina({ ok: true, status: 407, ms: 100, testo: "Proxy Authentication Required" });
  assert.equal(e.esito, "nonvisto", "un ⚪ onesto, perché con la Cabina non ci ho proprio parlato");
});

prova("protettaDaLogin non si accende su una risposta sana né su un errore di rete", () => {
  assert.equal(protettaDaLogin({ ok: true, status: 200, testo: "" }), false);
  assert.equal(protettaDaLogin({ ok: false, errore: "timeout" }), false);
  assert.equal(protettaDaLogin(null), false);
});

// ── ③ Il cuore dietro il login, eseguendo il controllo VERO ─────────────────
// Un caso asincrono si aspetta, altrimenti il conto finale esce prima del verdetto e il verde è
// vuoto — un test che non ha misurato niente è peggio di un test che manca.

/** Esegue un controllo della visita con una risposta di rete iniettata: niente esce da qui. */
async function conRisposta(idControllo, risposta) {
  const { CONTROLLI } = await import("../salute.mjs");
  const c = CONTROLLI.find((x) => x.id === idControllo);
  assert.ok(c, `il controllo ${idControllo} deve esistere`);
  const vero = globalThis.fetch;
  globalThis.fetch = async () => risposta();
  try {
    return await c.prova({});
  } finally {
    globalThis.fetch = vero;
  }
}

const provaAsync = async (nome, fn) => {
  try {
    await fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

await provaAsync("⬇️ il cuore dietro il login è ⚪, non ❌ «non risponde in JSON»", async () => {
  const e = await conRisposta("cabina.cuore", () => new Response("<html>login</html>", { status: 401 }));
  assert.equal(e.esito, "nonvisto", `atteso ⚪, avuto ${e.esito}: «${e.detto}»`);
  assert.match(e.detto, /protetta/i);
});

await provaAsync("e se il cuore risponde davvero, resta un ✅ vero", async () => {
  const e = await conRisposta(
    "cabina.cuore",
    () => new Response(JSON.stringify({ collegato: true, ultimoBattito: "2026-08-13 18:00" }), { status: 200 }),
  );
  assert.equal(e.esito, "ok", `atteso ✅, avuto ${e.esito}: «${e.detto}»`);
});

await provaAsync("«collegato: false» resta ❌: a Nicola i numeri non arrivano", async () => {
  const e = await conRisposta("cabina.cuore", () => new Response(JSON.stringify({ collegato: false }), { status: 200 }));
  assert.equal(e.esito, "rotto");
});

await provaAsync("la Cabina protetta, vista da fuori, è un ✅ che dice pure da dove arriva l'indirizzo", async () => {
  const e = await conRisposta("cabina.viva", () => new Response("Authentication Required", { status: 401 }));
  assert.equal(e.esito, "ok", `atteso ✅, avuto ${e.esito}: «${e.detto}»`);
  assert.match(e.detto, /indirizzo da/, "il referto deve dire da dove ha preso l'indirizzo");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
