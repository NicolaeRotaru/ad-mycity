#!/usr/bin/env node
// AR-430 / AR-371 — la prova del guardiano che vive fuori dalla macchina.
//
// Il caso che ha rotto, e che questo test riproduce per intero: il 27/7 alle 22:32 il VPS ha
// scritto la sua ultima traccia; alle 16:43 del 29/7 — quaranta ore dopo — nessun allarme era mai
// partito. Il primo caso qui sotto è quello, con i suoi numeri veri: se un giorno smette di
// produrre «apri», vuol dire che il blackout tornerebbe silenzioso.
//
// Perché il test sta sulla DECISIONE e non sul workflow: una regola scritta dentro un YAML non si
// può eseguire: si potrebbe solo cercarci una parola dentro, ed è esattamente il tipo di prova che
// ha lasciato vivere questi difetti per mesi.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { decidiAzione, titoloUmano } = await import(join(REPO, "cervello/battito-esterno.mjs"));
const { giudicaTracce, leggiTracce } = await import(join(REPO, "cervello/salute.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

// L'orario vero dell'ultima traccia del blackout, e il momento in cui la visita se n'è accorta.
const ULTIMA_TRACCIA = "2026-07-28 01:13";
const QUARANTA_ORE_DOPO = new Date("2026-07-29T14:43:00Z").getTime();

prova("il caso che ha rotto: quaranta ore di silenzio diventano un allarme aperto", () => {
  const esito = giudicaTracce([{ file: "costo-ai.json", quando: ULTIMA_TRACCIA }], QUARANTA_ORE_DOPO);
  assert.equal(esito.esito, "rotto", "quaranta ore di silenzio devono risultare rotte");
  const d = decidiAzione({ esito, issueAperta: null });
  assert.equal(d.azione, "apri");
  assert.match(d.titolo, /ferma da 40 ore/);
  assert.match(d.corpo, /systemctl status mycity-giro/, "il corpo porta i comandi pronti per il VPS");
});

prova("l'ora dopo NON apre una seconda issue: aggiorna quella che c'è", () => {
  // Girando ogni ora, quaranta ore di blackout facevano quaranta issue. Un allarme che si impara a
  // ignorare è peggio di nessun allarme.
  const esito = giudicaTracce([{ file: "costo-ai.json", quando: ULTIMA_TRACCIA }], QUARANTA_ORE_DOPO);
  const d = decidiAzione({ esito, issueAperta: { numero: 612 } });
  assert.equal(d.azione, "commenta");
  assert.equal(d.numero, 612);
});

prova("quando la macchina riparte, l'allarme si spegne da solo", () => {
  const esito = giudicaTracce([{ file: "esito-giro.json", quando: "2026-07-29 16:20" }], QUARANTA_ORE_DOPO);
  assert.equal(esito.esito, "ok");
  const d = decidiAzione({ esito, issueAperta: { numero: 612 } });
  assert.equal(d.azione, "chiudi", "un allarme che nessuno spegne diventa arredamento");
  assert.equal(d.numero, 612);
});

prova("se è tutto a posto e non c'è nessun allarme, sta zitta", () => {
  const esito = giudicaTracce([{ file: "esito-giro.json", quando: "2026-07-29 16:20" }], QUARANTA_ORE_DOPO);
  assert.equal(decidiAzione({ esito, issueAperta: null }).azione, "taci");
});

prova("⚪ non è mai ✅: un guardiano cieco NON spegne un allarme vero", () => {
  // È il modo più elegante di perdere un blackout: l'occhio si chiude e la stanza risulta in ordine.
  const cieco = giudicaTracce([], QUARANTA_ORE_DOPO);
  assert.equal(cieco.esito, "nonvisto");
  const d = decidiAzione({ esito: cieco, issueAperta: { numero: 612 } });
  assert.equal(d.azione, "taci");
  assert.notEqual(d.azione, "chiudi", "un controllo che non ha misurato non può dire che va bene");
  assert.equal(d.cieco, true);
});

prova("⚪ non apre nemmeno un allarme su ciò che non ha visto", () => {
  const cieco = giudicaTracce([], QUARANTA_ORE_DOPO);
  assert.equal(decidiAzione({ esito: cieco, issueAperta: null }).azione, "taci");
});

prova("otto ore di silenzio sono già un guasto, due no", () => {
  // La soglia vive in salute.mjs (tracceFermeOre: 8) e qui si verifica che il guardiano esterno usi
  // quella, non una sua copia scritta a occhio.
  const dueOre = giudicaTracce([{ file: "esito-giro.json", quando: "2026-07-29 14:20" }], QUARANTA_ORE_DOPO);
  assert.equal(decidiAzione({ esito: dueOre }).azione, "taci");
  const noveOre = giudicaTracce([{ file: "esito-giro.json", quando: "2026-07-29 07:20" }], QUARANTA_ORE_DOPO);
  assert.equal(decidiAzione({ esito: noveOre }).azione, "apri");
});

prova("il titolo si capisce a voce: niente sigle, niente path, niente ID", () => {
  const t = titoloUmano({ dati: { ore: 40 } });
  assert.doesNotMatch(t, /AR-\d+|\.mjs|\.json|cervello\/|#\d/, `titolo con codici dentro: ${t}`);
  assert.match(t, /^La macchina/);
  // Anche senza il numero di ore deve restare una frase, non un troncone.
  assert.match(titoloUmano({}), /^La macchina non sta più lasciando tracce$/);
});

prova("le tracce si leggono dall'orario DENTRO il file, mai dalla data del filesystem", () => {
  // In un clone fresco tutti i file sono di oggi: se il guardiano guardasse mtime direbbe sempre
  // «viva», ed è il modo in cui questo controllo si sarebbe rotto in silenzio su GitHub Actions,
  // che fa un checkout nuovo a ogni giro.
  const tracce = leggiTracce(REPO);
  assert.ok(tracce.length > 0, "nessuna traccia letta dal repo");
  for (const t of tracce) {
    assert.match(String(t.quando), /^\d{4}-\d{2}-\d{2}/, `orario non letto dal contenuto: ${JSON.stringify(t)}`);
  }
});

prova("resta almeno un guardiano che gira FUORI dalla macchina, e parte da solo", () => {
  // Il guardiano alla radice della malattia: non basta che il codice sia giusto, deve esistere un
  // innesco che non dipende dal VPS. Se un giorno qualcuno cancella il workflow o gli toglie lo
  // `schedule`, la macchina torna a essere sorvegliata solo da sé stessa — e questo test diventa
  // rosso invece di lasciarlo scoprire al prossimo blackout.
  const yml = readFileSync(join(REPO, ".github/workflows/battito-esterno.yml"), "utf8");
  assert.match(yml, /^\s*schedule:/m, "il battito esterno non parte da solo: senza schedule non sorveglia niente");
  assert.match(yml, /cron:\s*"[^"]+"/, "schedule senza cron");
  assert.match(yml, /node cervello\/battito-esterno\.mjs/, "il workflow non chiama il controllo");
  assert.match(yml, /issues:\s*write/, "senza il permesso sulle issue l'allarme non raggiunge nessuno");
  // E non deve dipendere da un secret: se ne servisse uno, resterebbe muto finché nessuno lo collega
  // — che è come è morto l'allarme di Telegram.
  assert.doesNotMatch(yml, /secrets\.(?!GITHUB_TOKEN)/, "il battito esterno non deve dipendere da un secret da collegare");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
