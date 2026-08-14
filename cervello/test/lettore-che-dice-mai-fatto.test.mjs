#!/usr/bin/env node
// 📕 AR-415 — «NON L'HO POTUTO LEGGERE» ARRIVAVA A NICOLA COME «NON È MAI STATO FATTO».
//
// `readVaultFile` tornava `string | null`. Quel `null` era il funerale di tre notizie diverse:
//   · il file non c'è                → è un fatto: lancia il giro
//   · GitHub è giù / il token è morto → è un guasto: sistema le chiavi
//   · l'archivio ha passato il muro   → è un guasto: il lavoro c'è, non passa dal tubo
// A valle diventavano tutte la stessa frase: «Nessuna radiografia nel vault», «Ancora nessuno
// storico», «Nessun fatto-chiave registrato ancora». Tre inviti a rifare un lavoro che poteva essere
// già stato fatto.
//
// La riparazione precedente (AR-254) aveva inventato lo stato `troppo-grande`, ma aggiungendo una
// funzione NUOVA accanto a quella malata (`readVaultFileEsito`) invece di curarla. Misurato prima di
// questo lotto: **26 rotte chiamavano `readVaultFile`, 4 la versione con l'esito** — e ogni rotta si
// era scritta il SUO `leggiJson` privato con il suo elenco di motivi. È il punto ⑤ della scheda: si
// ripara alla profondità del sintomo osservato, e il resto del sistema continua a inciampare nella
// stessa pietra.
//
// Qui si prova la DECISIONE — cosa dico davanti a un esito di lettura — che è pura e si esegue senza
// rete e senza disco. E si verifica che le rotte ci passino DAVVERO: un lettore curato che nessuno
// chiama è la trappola di AR-461.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { motivoLettura, daEsitoJson, messaggioSenzaDato } = await import(join(REPO, "pannello/src/lib/esito-lettura.ts"));
const { coerenzaSenzaVerdetto, tonoBadge, statoCoerenza } = await import(join(REPO, "pannello/src/lib/badge-coerenza.ts"));
const leggi = (f) => readFileSync(join(REPO, f), "utf8");

// ── LA DECISIONE: «troppo grande» deve nominare la sua dimensione ───────────────────────────────

test("il caso della scheda: un archivio oltre il muro dice QUANTO pesa, non «non è mai stato fatto»", () => {
  // Il dettaglio è quello vero che scrive obsidian.ts quando la Contents API rifiuta un file inline.
  const m = motivoLettura({
    stato: "troppo-grande",
    dettaglio: "2.400.000 byte: oltre il tetto inline di GitHub (1.048.576) e senza sha non c'è seconda strada",
  });
  assert.match(m, /troppo grande/i, "deve dire che il problema è la dimensione");
  assert.match(m, /2\.400\.000/, "e deve dire QUANTO: un numero si verifica, un aggettivo no");
  assert.doesNotMatch(m, /mai stat|non è ancora|nessun/i, "non deve suonare come «il lavoro non è stato fatto»");
});

test("«assente» e «ok» non hanno niente da spiegare: sono gli unici due silenzi legittimi", () => {
  assert.equal(motivoLettura({ stato: "ok", testo: "{}" }), null);
  assert.equal(motivoLettura({ stato: "assente" }), null, "guardato e non c'era è un fatto vero, non un buco");
});

test("gli altri guasti hanno una frase loro, distinguibile", () => {
  assert.match(motivoLettura({ stato: "auth" }), /rifiutato l'accesso/i);
  assert.match(motivoLettura({ stato: "github-giu" }), /non raggiungibile/i);
});

test("uno stato mai visto NON tace: il default è «non so perché», mai il silenzio", () => {
  // È la regola di questa corsia applicata alla lettura invece che all'esito: se tacesse, a valle
  // tornerebbe il pollice in su. Il giorno che obsidian.ts inventerà un quinto stato, si vede.
  for (const ignoto of ["quota-finita", "boh", "", undefined, null]) {
    const m = motivoLettura({ stato: ignoto });
    assert.ok(m, `«${String(ignoto)}» non è riconosciuto: deve comunque produrre una frase`);
    assert.match(m, /non so perché/i);
  }
  assert.ok(motivoLettura(null), "nemmeno un esito nullo può passare per «tutto a posto»");
});

// ── DAL TESTO AL DATO: tre uscite, non due ──────────────────────────────────────────────────────

test("daEsitoJson separa i tre casi che prima erano tutti `null`", () => {
  const ok = daEsitoJson({ stato: "ok", testo: '{"a":1}' });
  assert.deepEqual(ok, { dati: { a: 1 }, letto: true, motivo: null });

  const vuoto = daEsitoJson({ stato: "assente" });
  assert.deepEqual(vuoto, { dati: null, letto: true, motivo: null }, "guardato e non c'era: LETTO, con dato nullo");

  const grosso = daEsitoJson({ stato: "troppo-grande", dettaglio: "1.081.370 byte" });
  assert.equal(grosso.letto, false, "non letto: sul contenuto non si può dire niente");
  assert.match(grosso.motivo, /1\.081\.370/);
});

test("un JSON rotto sta coi NON LETTI, non con gli assenti", () => {
  // È il modo esatto in cui apprendimento.json è sparito: troncato a metà stringa, JSON.parse
  // fallisce, il chiamante riceve null, e «non sono riuscito a leggere» diventa «non c'è niente».
  const r = daEsitoJson({ stato: "ok", testo: '{"a":1' });
  assert.equal(r.letto, false, "un file che c'è e non si sa leggere NON è un file che manca");
  assert.match(r.motivo, /illeggibile|JSON non valido/i);
});

test("il messaggio a schermo cambia davvero: «lancia il giro» solo se ho guardato", () => {
  const invito = "Nessuna radiografia del marketplace nel vault. Lancia «radiografia».";

  const guardato = messaggioSenzaDato(daEsitoJson({ stato: "assente" }), invito);
  assert.equal(guardato.messaggio, invito, "se ho guardato e non c'era, l'invito a farlo è giusto");
  assert.equal(guardato.letto, true);

  const cieco = messaggioSenzaDato(daEsitoJson({ stato: "troppo-grande", dettaglio: "2.400.000 byte" }), invito);
  assert.notEqual(cieco.messaggio, invito, "se non ho potuto leggere, l'invito è una bugia");
  assert.match(cieco.messaggio, /non so dirti se il lavoro è stato fatto/i);
  assert.match(cieco.messaggio, /2\.400\.000/, "e il perché arriva fino a schermo, con la sua misura");
  assert.equal(cieco.letto, false);
});

// ── AR-646, secondo giro: un badge che sparisce è un badge verde ────────────────────────────────

test("il verdetto di coerenza illeggibile diventa ⚪ «sconosciuto», non un badge che sparisce", () => {
  // Prima la rotta faceva `cf ? {…} : null`, e `null` voleva dire insieme «il guardiano non ha
  // ancora girato» e «il suo verdetto non l'ho potuto leggere». Nel secondo caso il badge non veniva
  // disegnato affatto — e una scheda senza badge si legge come «nessun problema».
  const nonLetto = coerenzaSenzaVerdetto({ letto: false, motivo: "archivio troppo grande per essere letto" });
  assert.equal(nonLetto.esito, "sconosciuto");
  assert.equal(tonoBadge(statoCoerenza(nonLetto.esito)), "cieco", "⚪, mai verde e mai assente");
  assert.match(nonLetto.motivo, /troppo grande/);

  assert.equal(coerenzaSenzaVerdetto({ letto: true }), null, "guardato e non c'era: il guardiano non ha ancora girato");
});

// ── LA CURA È SULLA FUNZIONE MALATA, NON ACCANTO ────────────────────────────────────────────────

/** Toglie i commenti: un difetto NOMINATO in una spiegazione non è il difetto. */
function soloCodice(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((r) => !/^\s*(\/\/|\*)/.test(r))
    .join("\n");
}

test("readVaultFile non ha più una strada sua: passa dall'esito tipizzato", () => {
  const src = leggi("pannello/src/lib/vault.ts");
  const codice = soloCodice(src);
  assert.doesNotMatch(codice, /ERR_PREFIXES/, "il riconoscimento degli errori per prefisso di stringa dev'essere sparito");
  assert.doesNotMatch(codice, /function isErr/, "e con lui la funzione che lo faceva");
  assert.doesNotMatch(codice, /readNote/, "readNote appiattisce i guasti in stringhe: qui non deve più entrare");
  assert.match(
    src,
    /export async function readVaultFile\([^)]*\)[^{]*\{\s*const e = await readVaultFileEsito/,
    "readVaultFile deve DELEGARE a readVaultFileEsito: una strada sola, non due",
  );
  assert.match(src, /export async function leggiJsonVault/, "e il lettore JSON condiviso deve esistere qui");
});

test("le rotte che dicevano «non è mai stato fatto» sono cablate al lettore curato", () => {
  const rotte = [
    "pannello/src/app/api/memoria/radiografia-marketplace/route.ts",
    "pannello/src/app/api/memoria/salute-onesta/route.ts",
    "pannello/src/app/api/memoria/fatti/route.ts",
  ];
  for (const r of rotte) {
    const src = leggi(r);
    assert.match(src, /leggiJsonVault/, `${r} deve leggere col lettore condiviso`);
    assert.match(src, /messaggioSenzaDato/, `${r} deve far dipendere il messaggio dall'esito, non dal solo dato`);
    assert.doesNotMatch(
      src,
      /const raw = await readVaultFile\([^)]*\);\s*if \(raw == null\) return null;/,
      `${r} non deve avere più il suo leggiJson privato che schiaccia il motivo`,
    );
  }
});

test("nessuna rotta della memoria si tiene una lista di motivi tutta sua", () => {
  // La duplicazione ERA il difetto: quattro copie, e chi ne aggiornava una lasciava indietro le altre.
  for (const r of [
    "pannello/src/app/api/memoria/auto-radiografia/route.ts",
    "pannello/src/app/api/memoria/auto-coscienza/route.ts",
  ]) {
    const src = leggi(r);
    assert.doesNotMatch(src, /function dettaglioEsito/, `${r}: la frase la decide esito-lettura.ts, non la rotta`);
    assert.match(src, /leggiJsonVault/, `${r} deve passare dal lettore condiviso`);
  }
});

test("il lettore curato è quello che usano DAVVERO le rotte, e il numero può solo salire", () => {
  // I due conti, misurati e non stimati.
  //
  //   · La CURA sta in `readVaultFile`, che ora attraversa `readVaultFileEsito`: vale per tutte e 17
  //     le rotte della memoria insieme, senza toccarne nessuna. Dentro il lettore il motivo non si
  //     perde più.
  //   · Portarlo A SCHERMO è un'altra cosa, e va fatta rotta per rotta. Prima di questo lotto lo
  //     facevano in 2 (auto-coscienza, auto-radiografia); adesso 5. Le altre 12 continuano a ricevere
  //     `string | null`, che va benissimo dove non scrivono «non è mai stato fatto» — ma è debito
  //     dichiarato, non lavoro finito.
  //
  // Questo numero è un cricchetto: può salire, non scendere. Se scende, qualcuno ha rifatto la
  // strada corta e la bugia è tornata.
  const PAVIMENTO = 5;
  const rotte = [];
  const cammina = (d) => {
    for (const v of readdirSync(d)) {
      const p = join(d, v);
      if (statSync(p).isDirectory()) cammina(p);
      else if (v === "route.ts") rotte.push(p);
    }
  };
  cammina(join(REPO, "pannello/src/app/api/memoria"));
  const conEsito = rotte.filter((p) => /leggiJsonVault|readVaultFileEsito/.test(readFileSync(p, "utf8")));
  assert.ok(
    conEsito.length >= PAVIMENTO,
    `le rotte della memoria che portano il motivo a schermo erano 2, ora devono essere almeno ${PAVIMENTO} ` +
      `(trovate ${conEsito.length} su ${rotte.length})`,
  );
});
