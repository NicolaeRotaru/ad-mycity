// AR-609 / AR-610 — un indirizzo del Pannello deve atterrare in un posto, sempre.
//
// Due difetti, una radice: l'INDIRIZZO non instradava niente. La Cabina è una pagina sola e l'area
// veniva scelta solo da ciò che era rimasto in memoria del browser (`mycity_vista`).
//   · AR-609 — un vecchio link col cancelletto (`/#auto-coscienza`, che gira ancora in lettere e
//     note) apriva l'ultima area visitata e il cancelletto moriva in silenzio. Funzionava per caso:
//     solo se eri già sulla scheda giusta, cioè quando non serviva.
//   · AR-610 — un percorso plausibile ma inesistente (`/azioni`: sono i nomi delle aree, viene
//     naturale digitarli) cadeva sul 404 inglese di Next, senza una parola in italiano e senza un
//     solo link per rientrare.
//
// Qui si eseguono le funzioni vere di nav.ts. La regola che conta: `viePerTornare` non torna MAI un
// elenco vuoto — «nessuna via d'uscita» era il difetto.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync, readFileSync } from "node:fs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { destinazioneDaHash, destinazioneDaPercorso, viePerTornare, linkDiDestinazione, AREE_NOTE } = await import(
  join(REPO, "pannello/src/lib/nav.ts")
);

// ── AR-609: il cancelletto ───────────────────────────────────────────────────
test("il caso storico: /#auto-coscienza porta all'auto-coscienza, non all'ultima area visitata", () => {
  const d = destinazioneDaHash("#auto-coscienza");
  assert.equal(d?.vista, "auto-coscienza");
  assert.equal(d?.sub, "analisi", "il link vecchio puntava alla card dell'auto-analisi");
});

test("il cancelletto porta anche a una scheda precisa", () => {
  assert.deepEqual(destinazioneDaHash("#azioni/approvare"), { vista: "azioni", sub: "approvare" });
});

test("un cancelletto qualunque non muove niente (l'area salvata resta quella che era)", () => {
  for (const h of ["", "#", null, undefined, "#riga-42", "#pippo/pluto"]) {
    assert.equal(destinazioneDaHash(h), null, `hash: ${JSON.stringify(h)}`);
  }
});

test("tutte le aree del menù sono raggiungibili da un indirizzo", () => {
  // Se una resta fuori, il link che qualcuno salverà su quella non funzionerà — ed è esattamente il
  // modo in cui è nato AR-609: una destinazione conosciuta da un componente solo.
  for (const area of Object.keys(AREE_NOTE)) {
    assert.equal(destinazioneDaHash(`#${area}`)?.vista, area, `l'area «${area}» non è raggiungibile`);
  }
});

test("maiuscole e barre di troppo non rompono il link", () => {
  assert.equal(destinazioneDaHash("#Azioni")?.vista, "azioni");
  assert.equal(destinazioneDaPercorso("/Lavori/")?.vista, "lavori");
});

// ── AR-610: l'indirizzo che non esiste ───────────────────────────────────────
test("c'è SEMPRE una via per tornare alla Cabina", () => {
  for (const p of ["/azioni", "/pippo", "/", "", null, undefined, "/a/b/c"]) {
    const vie = viePerTornare(p);
    assert.ok(vie.length >= 1, `nessuna via d'uscita da ${JSON.stringify(p)}`);
    assert.ok(
      vie.some((v) => v.href === "/"),
      `da ${JSON.stringify(p)} manca il ritorno alla Cabina`,
    );
    for (const v of vie) assert.ok(v.testo && v.testo.trim().length > 0, "una via senza scritta non è una via");
  }
});

test("se il percorso lascia intendere un'area, la prima via porta lì", () => {
  const vie = viePerTornare("/azioni");
  assert.equal(vie[0].href, "/#azioni");
  assert.match(vie[0].testo, /Azioni/, "e lo dice con il nome che Nicola legge nel menù");
  assert.equal(vie.length, 2, "l'area indovinata più la Cabina");
});

test("percorso incomprensibile: una via sola, la Cabina", () => {
  assert.deepEqual(viePerTornare("/quello-che-vuoi"), [{ testo: "Torna alla Cabina", href: "/" }]);
});

test("una destinazione si scrive come indirizzo", () => {
  assert.equal(linkDiDestinazione({ vista: "azioni", sub: "approvare" }), "/#azioni/approvare");
  assert.equal(linkDiDestinazione({ vista: "numeri" }), "/#numeri");
  assert.equal(linkDiDestinazione(null), "/");
});

// ── il cablaggio: la decisione dev'essere COLLEGATA ──────────────────────────
test("all'avvio il Pannello guarda l'indirizzo, non solo la memoria del browser", () => {
  const page = readFileSync(join(REPO, "pannello/src/app/page.tsx"), "utf8");
  assert.match(page, /destinazioneDaHash\(/, "page.tsx deve leggere l'indirizzo al primo caricamento");
});

test("la pagina dell'indirizzo sbagliato esiste, è in italiano e ha le sue uscite", () => {
  const f = join(REPO, "pannello/src/app/not-found.tsx");
  assert.ok(existsSync(f), "senza not-found.tsx Next mostra il suo 404 inglese, senza uscite");
  const testo = readFileSync(f, "utf8");
  assert.match(testo, /viePerTornare\(/, "le uscite devono venire dalla funzione provata, non scritte a mano");
  // Si guarda ciò che Nicola LEGGE: i commenti citano apposta il vecchio messaggio inglese.
  const aVideo = testo.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  assert.doesNotMatch(aVideo, /could not be found|Page not found/i, "niente inglese davanti a Nicola");
  assert.match(aVideo, /Cabina/, "e una frase in italiano che dice dove si è finiti");
});
