#!/usr/bin/env node
// 🧪 Le prove della PORTA DEI SENIOR (cervello/prompt-senior.mjs) e dei file-pilota che ci passano.
//
// La prova che conta è la prima: il prompt che arriva al modello contiene DAVVERO il mansionario di
// quel reparto, letto dal file vero adesso. Non «il file esiste», non «c'è la parola prompt-senior
// nel workflow»: il testo del mestiere dentro il testo del prompt. Era esattamente ciò che nessuno
// misurava — tutti i guardiani guardavano il file sul disco, nessuno il prompt (AR-434).

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  cacciaAperta,
  elencoSenior,
  esitiRecenti,
  leggiRegistroFatti,
  fattiVivi,
  leggiMansionario,
  leggiPiloti,
  percorsiAssoluti,
  percorsiSenior,
  promptSenior,
  radiceRepo,
  sembraRepoAD,
  violazioniPorta,
} from "../prompt-senior.mjs";

const RADICE = radiceRepo();
const SENIOR = elencoSenior(RADICE);

// ── ① il mansionario arriva a chi lavora (AR-434) ────────────────────────────

test("il prompt di un senior contiene il suo mansionario vero, non una frase che lo riassume", () => {
  const nome = "vendite";
  const suFile = readFileSync(join(RADICE, ".claude/agents/vendite.md"), "utf8");
  // Una riga qualunque e lunga del file vero: se domani il mansionario cambia, cambia anche la prova.
  const rigaVera = suFile.split("\n").filter((r) => r.trim().length > 80)[3];
  const p = promptSenior(nome, { radice: RADICE, focus: "portare LIVE il prossimo negozio" });
  assert.ok(p.includes(rigaVera.trim()), "il mansionario non è finito nel prompt");
  assert.ok(p.length > suFile.length, "il prompt è più corto del mansionario: qualcosa è stato tagliato");
});

test("il focus si AGGIUNGE al mansionario, non lo sostituisce", () => {
  const focus = "focus-di-prova-che-non-esiste-nel-mansionario";
  const p = promptSenior("crm-lifecycle", { radice: RADICE, focus });
  const suFile = readFileSync(join(RADICE, ".claude/agents/crm-lifecycle.md"), "utf8");
  const rigaVera = suFile.split("\n").filter((r) => r.trim().length > 80)[2];
  assert.ok(p.includes(focus), "il focus non c'è");
  assert.ok(p.includes(rigaVera.trim()), "col focus, il mansionario è sparito: è la sostituzione che curiamo");
});

test("il prompt porta anche il percorso del kit e le lezioni del quaderno", () => {
  const p = promptSenior("analista", { radice: RADICE });
  assert.ok(p.includes("MyCity-Vault/07-Agenti/kit/analista-KIT.md"), "manca il kit");
  assert.ok(p.includes("memoria-squadra/analista.md"), "manca il quaderno");
});

test("un senior senza mansionario non si mette al lavoro: la porta si ferma e lo dice", () => {
  assert.throws(
    () => promptSenior("reparto-che-non-esiste", { radice: RADICE }),
    /non ha un mansionario/,
    "un nome inventato è passato: così tornerebbe l'agente generico col cartellino"
  );
});

test("tutti e 120 i senior passano dalla porta senza rompersi", () => {
  const rotti = [];
  for (const nome of SENIOR) {
    try {
      const p = promptSenior(nome, { radice: RADICE, focus: "prova" });
      if (!p.includes(`.claude/agents/${nome}.md`)) rotti.push(`${nome}: prompt senza il suo mansionario`);
    } catch (e) {
      rotti.push(`${nome}: ${e.message}`);
    }
  }
  assert.deepEqual(rotti, [], `senior che non passano dalla porta:\n${rotti.join("\n")}`);
});

test("le ultime lezioni del quaderno sono le più recenti per data, non le prime della lista", () => {
  const finto = ["- 2026-01-02 10:00 · vecchia", "- 2026-08-01 09:00 · nuova", "- 2026-05-05 08:00 · mezza"].join("\n");
  assert.deepEqual(esitiRecenti(finto, 2).map((e) => e.data), ["2026-08-01", "2026-05-05"]);
});

// ── ② i file-pilota mettono al lavoro i senior passando di qui (AR-434) ──────

const PILOTI = leggiPiloti(join(RADICE, ".claude/workflows"));

test("ogni workflow che mette al lavoro un agente passa dalla porta", () => {
  const fuori = violazioniPorta(PILOTI, { senior: SENIOR }).filter((v) => v.regola === "porta-unica");
  assert.deepEqual(fuori, [], `file-pilota che si scrivono il senior a mano:\n${fuori.map((v) => v.file).join(", ")}`);
});

test("nessun workflow si scrive più l'identità di un senior dentro il prompt", () => {
  const fuori = violazioniPorta(PILOTI, { senior: SENIOR }).filter((v) => v.regola === "identita-scritta-a-mano");
  assert.deepEqual(fuori, [], fuori.map((v) => `${v.file} ${v.dove}`).join("\n"));
});

test("ogni senior nominato dai workflow esiste davvero e il suo prompt esce dal mansionario", () => {
  const problemi = [];
  for (const { nome, testo } of PILOTI) {
    for (const m of testo.matchAll(/senior:\s*'([a-z0-9-]+)'/g)) {
      const chi = m[1];
      if (!SENIOR.includes(chi)) {
        problemi.push(`${nome} chiama @${chi}, che non ha un mansionario`);
        continue;
      }
      const p = promptSenior(chi, { radice: RADICE, focus: "prova" });
      const suFile = readFileSync(percorsiSenior(chi, RADICE).mansionario, "utf8");
      const riga = suFile.split("\n").filter((r) => r.trim().length > 80)[1];
      if (!p.includes(riga.trim())) problemi.push(`${nome}/@${chi}: il mansionario non entra nel prompt`);
    }
  }
  assert.deepEqual(problemi, [], problemi.join("\n"));
});

test("il guardiano sa dire di NO: un pilota che si scrive il senior a mano viene preso", () => {
  const finto = [{
    nome: "finto.js",
    testo: [
      "const REPO = '/home/user/ad-mycity'",
      "await agent(`Sei il senior @vendite di MyCity. Focus: vendi.`)",
    ].join("\n"),
  }];
  const v = violazioniPorta(finto, { senior: SENIOR });
  const regole = v.map((x) => x.regola);
  assert.ok(regole.includes("porta-unica"), "il guardiano non vede il passaggio fuori porta");
  assert.ok(regole.includes("identita-scritta-a-mano"), "il guardiano non vede l'identità ricopiata");
  assert.ok(regole.includes("percorso-scritto-a-mano"), "il guardiano non vede il percorso cablato");
});

// ── ③ dove siamo: la radice del repo si risolve, non si scrive (AR-435) ─────

test("nessun file-pilota manda più i senior a un indirizzo scritto a mano", () => {
  const cablati = PILOTI.flatMap(({ nome, testo }) => percorsiAssoluti(testo).map((p) => `${nome}:${p.riga} ${p.percorso}`));
  assert.deepEqual(cablati, [], `percorsi assoluti nei file che pilotano il lavoro:\n${cablati.join("\n")}`);
});

test("la radice del repo non dipende da dove sei quando lanci il comando", () => {
  const qui = radiceRepo(process.env, process.cwd());
  const daAltrove = radiceRepo({}, "/");
  assert.equal(daAltrove, qui, "cambiando cartella di lavoro la macchina cerca la memoria altrove");
  assert.ok(sembraRepoAD(qui), "la radice trovata non contiene la squadra e il manuale");
});

test("un AD_ROOT sbagliato non acceca la porta: vince il repo vero", () => {
  const vuota = mkdtempSync(join(tmpdir(), "non-repo-"));
  const r = radiceRepo({ AD_ROOT: vuota }, process.cwd());
  assert.notEqual(r, resolve(vuota), "un indirizzo sbagliato nell'ambiente ha dirottato la lettura dei mansionari");
  assert.ok(elencoSenior(r).length >= 100, "dalla radice risolta non si vedono i senior");
});

test("AD_ROOT vale quando punta davvero a un repo: l'ambiente resta un override utile", () => {
  const finto = mkdtempSync(join(tmpdir(), "repo-finto-"));
  mkdirSync(join(finto, ".claude/agents"), { recursive: true });
  writeFileSync(join(finto, "CLAUDE.md"), "# finto");
  writeFileSync(join(finto, ".claude/agents/pippo.md"), "---\nname: pippo\n---\nCiao");
  assert.equal(radiceRepo({ AD_ROOT: finto }, process.cwd()), resolve(finto));
  assert.deepEqual(elencoSenior(finto), ["pippo"]);
});

// ── ④ le entità nel prompt vengono dal registro dei fatti, non dal codice (AR-126) ──

test("i fatti vivi arrivano dal registro e finiscono nel prompt del senior", () => {
  const fatti = fattiVivi(["negozio.faro"], RADICE);
  assert.equal(fatti.length, 1, "il fatto del negozio faro non si legge");
  const p = promptSenior("vendite", { radice: RADICE, focus: "prova", fatti });
  assert.ok(p.includes(fatti[0].valore.slice(0, 40)), "il valore vivo del faro non arriva al senior");
});

test("cambiando il registro cambia il prompt: il negozio non è scritto nel codice", () => {
  const finto = mkdtempSync(join(tmpdir(), "repo-fatti-"));
  mkdirSync(join(finto, ".claude/agents"), { recursive: true });
  mkdirSync(join(finto, "MyCity-Vault/90-Memoria-AI"), { recursive: true });
  writeFileSync(join(finto, "CLAUDE.md"), "# finto");
  writeFileSync(join(finto, ".claude/agents/vendite.md"), "---\nname: vendite\n---\nSei il venditore.");
  writeFileSync(
    join(finto, "MyCity-Vault/90-Memoria-AI/registro-fatti.json"),
    JSON.stringify({ fatti: [{ id: "negozio.faro", nome: "Negozio faro", valore: "Bottega Inventata di Prova", aggiornato: "2026-08-13" }] })
  );
  const p = promptSenior("vendite", { radice: finto, fatti: fattiVivi(["negozio.faro"], finto) });
  assert.ok(p.includes("Bottega Inventata di Prova"), "il prompt non segue il registro");
  assert.ok(!p.includes("Pane Quotidiano"), "il prompt porta un negozio che il registro non dice");
});

test("se il registro dei fatti non si legge, il senior lo SA: la mancanza entra nel prompt", () => {
  const finto = mkdtempSync(join(tmpdir(), "repo-senza-registro-"));
  mkdirSync(join(finto, ".claude/agents"), { recursive: true });
  writeFileSync(join(finto, "CLAUDE.md"), "# finto");
  writeFileSync(join(finto, ".claude/agents/vendite.md"), "---\nname: vendite\n---\nSei il venditore.");
  const r = leggiRegistroFatti(finto);
  assert.equal(r.ok, false, "un registro inesistente risulta letto");
  const p = promptSenior("vendite", { radice: finto });
  assert.ok(/NON letti/i.test(p), "il prompt tace sul fatto che i fatti-chiave non si sono letti");
});

test("un registro rotto non diventa «nessun valore superato»: il guardiano si dichiara cieco", () => {
  const finto = mkdtempSync(join(tmpdir(), "repo-registro-rotto-"));
  mkdirSync(join(finto, ".claude/agents"), { recursive: true });
  mkdirSync(join(finto, "MyCity-Vault/90-Memoria-AI"), { recursive: true });
  writeFileSync(join(finto, "CLAUDE.md"), "# finto");
  writeFileSync(join(finto, ".claude/agents/x.md"), "---\nname: x\n---\nIo.");
  writeFileSync(join(finto, "MyCity-Vault/90-Memoria-AI/registro-fatti.json"), "{ questo non è json");
  assert.equal(leggiRegistroFatti(finto).ok, false);
  assert.deepEqual(cacciaAperta(finto), []);

  const r = spawnSync(process.execPath, [join(RADICE, "cervello/prompt-senior.mjs"), "--guardiano"], {
    env: { ...process.env, AD_ROOT: finto }, encoding: "utf8",
  });
  assert.equal(r.status, 2, `atteso ⚪ cieco (uscita 2), ottenuto ${r.status}: un verde comprato`);
  assert.match(r.stdout, /NON è stata misurata/);
});

test("i workflow non nominano più negozi scartati né ordini morti", () => {
  const colpevoli = PILOTI.filter(({ testo }) => /Casa Linda|ordine zombie/i.test(testo)).map((p) => p.nome);
  assert.deepEqual(colpevoli, [], `entità superate ancora scritte nei prompt: ${colpevoli.join(", ")}`);
});

test("la caccia del registro entra anche nei file-pilota, che sono prompt eseguibili", () => {
  // Oggi nessuna caccia è aperta: la prova non deve poter passare a vuoto, quindi ne simulo una.
  const caccia = [{ id: "negozio.faro", pattern: "Casa Linda payout-ready" }];
  const pulito = violazioniPorta(PILOTI, { senior: SENIOR, caccia }).filter((v) => v.regola === "valore-superato");
  assert.deepEqual(pulito, [], "un valore già superato è ancora dentro un workflow");

  const sporco = [{ nome: "finto.js", testo: "const F = 'Casa Linda payout-ready'\nawait agent(F)" }];
  const preso = violazioniPorta(sporco, { senior: SENIOR, caccia }).filter((v) => v.regola === "valore-superato");
  assert.equal(preso.length, 1, "il guardiano non vede il valore vecchio dentro il pilota");
  assert.ok(preso[0].dove.includes("negozio.faro"), "non dice quale fatto è stato superato");
});

test("le cacce chiuse non accusano nessuno: si insegue solo ciò che è ancora aperto", () => {
  const aperte = cacciaAperta(RADICE);
  const grezzo = JSON.parse(readFileSync(join(RADICE, "MyCity-Vault/90-Memoria-AI/registro-fatti.json"), "utf8"));
  const tutte = grezzo.fatti.flatMap((f) => f.caccia || []);
  assert.ok(tutte.length > 0, "il registro non ha nessuna caccia: la funzione non sta leggendo niente");
  assert.equal(aperte.length, tutte.filter((c) => !c.chiusa).length);
});

test("i percorsi dei piloti reggono anche dove il worker gira davvero", () => {
  // Il VPS lavora in un'altra cartella: era esattamente il difetto (qui /home/user/…, là /opt/…).
  const service = readdirSync(join(RADICE, "cervello/vps")).filter((f) => f.endsWith(".service"));
  const cartelle = new Set();
  for (const s of service) {
    const m = readFileSync(join(RADICE, "cervello/vps", s), "utf8").match(/^WorkingDirectory=(.+)$/m);
    if (m) cartelle.add(m[1].trim());
  }
  assert.ok(cartelle.size > 0, "nessun service del VPS dichiara una cartella di lavoro");
  const cablati = PILOTI.flatMap(({ nome, testo }) => percorsiAssoluti(testo).map((p) => `${nome}: ${p.percorso}`));
  assert.deepEqual(cablati, [], `i piloti scrivono un percorso mentre il worker lavora in ${[...cartelle].join(", ")}`);
});

// ── ⑤ i mansionari sono la fonte di chi esiste ───────────────────────────────

test("l'elenco dei senior sono i file, non una lista tenuta a mano da qualche parte", () => {
  const suDisco = readdirSync(join(RADICE, ".claude/agents")).filter((f) => f.endsWith(".md")).length;
  assert.equal(SENIOR.length, suDisco);
  assert.ok(SENIOR.length >= 100, `solo ${SENIOR.length} senior visti: la lettura della squadra è cieca`);
});

test("leggiMansionario riporta la description, che è la porta d'ingresso del routing", () => {
  const m = leggiMansionario("seo", RADICE);
  assert.ok(m.descrizione.length > 40, "description vuota o troppo corta: il routing va a caso");
  assert.ok(m.kit.esiste, "il kit di @seo non si trova");
});
