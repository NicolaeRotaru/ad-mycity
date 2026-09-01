#!/usr/bin/env node
// 🚦 LA MALATTIA: l'esito di una scrittura non si guarda, e l'atto parte prima che qualcuno abbia
//    preso il posto. (lotto 41, corsia 1)
//
// Qui NON si legge il codice: si esegue. Le rotte vere del Pannello e l'autopilota vero girano
// contro un finto Supabase che rispetta il vincolo di chiave unica della tabella `impostazioni`
// (pannello/sql/memoria-schema.sql: `chiave text not null unique`), e le "mani" finte CONTANO
// quante volte il mondo viene toccato. È il conteggio che fa il test: se l'azione parte due volte,
// il numero è 2 e la prova diventa rossa.
//
// Copre, con un caso dedicato ciascuno:
//   AR-412 [BLOCCANTE] · due «Approva» insieme sulla stessa azione devono mandarla UNA volta sola
//   AR-413 · con la memoria giù l'azione NON deve partire, e se è già partita il messaggio deve
//            dire «non riprovare» invece di «riprova» (riprovare la manda una seconda volta)
//   AR-385 · l'autopilota che non riesce a registrare l'esito non deve rifare tutto al battito dopo
//   AR-384 · una scrittura di sicurezza fallita ferma quelle che la seguono, invece di essere ignorata
//
// Si esegue con: node cervello/test/c1-atto-una-volta-sola.test.mjs

import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const SRC = join(REPO, "pannello/src");

// ─────────────────────────────────────────────────────────────────────────────
// Il caricatore: insegna a Node le due regole che il bundler di Next già applica
// (l'alias `@/` e le estensioni sottintese) e sostituisce DUE moduli con finti.
// I finti sono moduli `data:` scritti qui dentro: niente file di appoggio da
// dimenticare in giro, e si vede a occhio nudo cosa fanno.
// ─────────────────────────────────────────────────────────────────────────────

const MANI_FINTE = `data:text/javascript,${encodeURIComponent(`
  export async function eseguiAzione(a) {
    globalThis.__c1_mani.push(a.titolo);
    await new Promise((r) => setTimeout(r, 5)); // il mondo non risponde all'istante
    // AR-887: il caso in cui l'atto esplode DOPO aver toccato il mondo. E' il caso vero — Resend
    // che chiude la connessione dopo aver accettato, la rete che cade a meta — e il difetto sta
    // tutto qui: da fuori non si distingue da «non e' partita».
    if (globalThis.__c1_esplodi) throw new Error("la rete e' caduta dopo aver mandato");
    return { stato: "fatta", dettaglio: "inviata (finta)" };
  }
  export function isCanaleGithub() { return false; }
`)}`;

const CODA_FINTA = `data:text/javascript,${encodeURIComponent(`
  export async function tutteLeAzioni() { return globalThis.__c1_coda; }
  export async function tutteLeAzioniConEsito() {
    return { azioni: globalThis.__c1_coda, codaLeggibile: true, motivoCoda: "" };
  }
  export function statoDa(raw) {
    if (raw === "approvata") return "coda";
    return ["rifiutata", "fatta", "simulata", "coda"].includes(raw) ? raw : "";
  }
`)}`;

// AR-901 — la PR risulta GIÀ mergiata: è il ramo che chiude l'azione senza toccare il mondo, ed è
// lì che il registro veniva scritto prima di guardare se lo stato era stato salvato.
const GITHUB_FINTO = `data:text/javascript,${encodeURIComponent(`
  export function isCanaleGithub(c) { return c === "github"; }
  export function estraiMergePr() { return { pr: 999, owner: "x", repo: "y" }; }
  export async function prGiaMergiata() { return globalThis.__c1_prMergiata === true; }
  export async function chiudiAzioniMergeCompletate(a) { return a; }
`)}`;

const FINTI = {
  "@/lib/mani": MANI_FINTE,
  "@/lib/azioni-pronte": CODA_FINTA,
  "@/lib/github-pr-merge": GITHUB_FINTO,
};

registerHooks({
  resolve(spec, ctx, next) {
    if (FINTI[spec]) return { url: FINTI[spec], shortCircuit: true };
    if (spec.startsWith("@/")) {
      const base = join(SRC, spec.slice(2));
      for (const e of [".ts", ".tsx", "/index.ts", ""]) {
        if (existsSync(base + e)) return { url: pathToFileURL(base + e).href, shortCircuit: true };
      }
    }
    try {
      return next(spec, ctx);
    } catch (errore) {
      const code = errore?.code;
      if (code !== "ERR_MODULE_NOT_FOUND" && code !== "ERR_UNSUPPORTED_DIR_IMPORT") throw errore;
      const codini = spec.startsWith(".") ? [".ts", ".tsx", "/index.ts"] : [".js", ".mjs"];
      for (const x of codini) {
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

// L'ambiente si imposta PRIMA di importare: store.ts legge URL e chiave al caricamento.
process.env.SUPABASE_URL = "https://finto.supabase.test";
process.env.SUPABASE_SERVICE_KEY = "chiave-finta";
process.env.AZIONI_LIVE = "";

// ─────────────────────────────────────────────────────────────────────────────
// Il finto Supabase: una Map e il vincolo di chiave unica. È l'unico pezzo che
// conta davvero — senza il vincolo, questa prova non proverebbe niente.
// ─────────────────────────────────────────────────────────────────────────────

function finoSupabase() {
  const righe = new Map(); // chiave → valore
  const stato = { giu: false, scrittureRotte: new Set(), letta: 0, scritta: 0 };

  const risposta = (status, corpo) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => corpo,
    text: async () => JSON.stringify(corpo),
  });

  async function handler(url, opts = {}) {
    const u = String(url);
    const metodo = String(opts.method || "GET").toUpperCase();
    await new Promise((r) => setTimeout(r, 1)); // la rete costa: qui nasce l'interleaving vero

    if (!u.includes("/rest/v1/impostazioni")) return risposta(200, []); // briefings, lavori, ecc.
    if (stato.giu) return risposta(500, { message: "memoria giù" });

    const qs = u.split("?")[1] || "";
    const par = new URLSearchParams(qs);
    const chiaveDi = (v) => decodeURIComponent(String(v || "").replace(/^eq\./, ""));

    if (metodo === "GET") {
      stato.letta++;
      const filtro = par.get("chiave");
      if (filtro) {
        const k = chiaveDi(filtro);
        return risposta(200, righe.has(k) ? [{ chiave: k, valore: righe.get(k) }] : []);
      }
      return risposta(200, [...righe].map(([chiave, valore]) => ({ chiave, valore })));
    }

    if (metodo === "POST") {
      const corpo = JSON.parse(String(opts.body || "{}"));
      if (stato.scrittureRotte.has(corpo.chiave)) return risposta(500, { message: "scrittura rotta apposta" });
      const upsert = par.get("on_conflict") === "chiave";
      // ⬇️ IL CUORE: senza `on_conflict` la riga esistente fa scattare il vincolo unico → 409.
      if (!upsert && righe.has(corpo.chiave)) return risposta(409, { code: "23505" });
      righe.set(corpo.chiave, corpo.valore);
      stato.scritta++;
      return risposta(201, null);
    }

    if (metodo === "PATCH") {
      const k = chiaveDi(par.get("chiave"));
      const atteso = par.has("valore") ? chiaveDi(par.get("valore")) : null;
      const corpo = JSON.parse(String(opts.body || "{}"));
      if (!righe.has(k)) return risposta(200, []);
      if (atteso !== null && righe.get(k) !== atteso) return risposta(200, []);
      righe.set(k, corpo.valore);
      return risposta(200, [{ chiave: k, valore: corpo.valore }]);
    }

    if (metodo === "DELETE") {
      righe.delete(chiaveDi(par.get("chiave")));
      return risposta(200, null);
    }
    return risposta(405, null);
  }

  return { handler, righe, stato };
}

const casi = [];
const prova = async (nome, fn) => {
  try {
    await fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

const AZIONE_VERDE = {
  id: "az-1",
  cartellino: "41",
  titolo: "Scrivi la nota del giro nel quaderno",
  reparto: "analista",
  livello: "verde",
  canale: "memoria",
  destinatario: "",
  perche: "traccia interna",
  preparato: "2026-08-14 09:00",
  testo: "Nota interna nel quaderno del reparto.",
  fonte: "vault",
  cambia: "",
  seguito: "",
  origine: "",
};

const rotta = await import(join(REPO, "pannello/src/app/api/azioni-pronte/route.ts"));
const { eseguiAutopilota } = await import(join(REPO, "pannello/src/lib/autopilota.ts"));
const { scrivereInOrdine } = await import(join(REPO, "pannello/src/lib/cancello-atto.ts"));

function richiestaApprova(id) {
  return new Request("https://pannello.test/api/azioni-pronte", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, decisione: "approva" }),
  });
}

// ── AR-412 ────────────────────────────────────────────────────────────────────
await prova("AR-412: due «Approva» insieme sulla stessa azione la mandano UNA volta sola", async () => {
  const sb = finoSupabase();
  globalThis.fetch = sb.handler;
  globalThis.__c1_mani = [];
  globalThis.__c1_coda = [AZIONE_VERDE];

  // Due dita sullo stesso pulsante: due richieste vere, in parallelo, sulla stessa azione.
  const [a, b] = await Promise.all([rotta.POST(richiestaApprova("az-1")), rotta.POST(richiestaApprova("az-1"))]);
  const corpi = [await a.json(), await b.json()];

  assert.equal(
    globalThis.__c1_mani.length,
    1,
    `le mani si sono mosse ${globalThis.__c1_mani.length} volte: l'azione vera è partita più di una volta`,
  );
  const riusciti = corpi.filter((c) => c.ok === true);
  assert.equal(riusciti.length, 1, "una sola delle due richieste può dichiararsi riuscita");
  const respinta = corpi.find((c) => c.ok === false);
  assert.equal(respinta?.giaInCorso, true, "l'altra deve dire che il posto era già preso, non un errore generico");
});

await prova("AR-412: la seconda approvazione a distanza di tempo non riparte (posto sigillato)", async () => {
  const sb = finoSupabase();
  globalThis.fetch = sb.handler;
  globalThis.__c1_mani = [];
  globalThis.__c1_coda = [AZIONE_VERDE];

  await (await rotta.POST(richiestaApprova("az-1"))).json();
  const secondo = await (await rotta.POST(richiestaApprova("az-1"))).json();
  assert.equal(globalThis.__c1_mani.length, 1, "ri-approvare dopo un refresh non deve rimandare l'azione");
  assert.equal(secondo.giaFatta, true, "la seconda risposta dice che era già fatta");
});

// ── AR-413 ────────────────────────────────────────────────────────────────────
await prova("AR-413: con la memoria giù l'azione NON parte (fail-closed prima dell'atto)", async () => {
  const sb = finoSupabase();
  sb.stato.giu = true; // la REST risponde 500 a tutto: getImpostazioni torna {tabella:false}
  globalThis.fetch = sb.handler;
  globalThis.__c1_mani = [];
  globalThis.__c1_coda = [AZIONE_VERDE];

  const res = await rotta.POST(richiestaApprova("az-1"));
  const corpo = await res.json();
  assert.equal(globalThis.__c1_mani.length, 0, "senza memoria l'azione vera non deve partire: qui è partita");
  assert.equal(corpo.ok, false, "e la risposta non può dirsi riuscita");
  assert.equal(res.status, 503, "503: è un problema nostro e passerà, non una richiesta sbagliata");
});

await prova("AR-413: se l'azione è GIÀ partita il messaggio dice di NON riprovare", async () => {
  const sb = finoSupabase();
  globalThis.fetch = sb.handler;
  globalThis.__c1_mani = [];
  globalThis.__c1_coda = [AZIONE_VERDE];
  // La lettura funziona, il posto si prende, l'atto avviene — ma la scrittura dello STATO no.
  sb.stato.scrittureRotte.add("azione:az-1");

  const res = await rotta.POST(richiestaApprova("az-1"));
  const corpo = await res.json();
  assert.equal(globalThis.__c1_mani.length, 1, "l'atto è avvenuto: è il presupposto di questo caso");
  assert.equal(corpo.ok, false, "una registrazione fallita non è un successo");
  assert.equal(corpo.nonRiprovare, true, "il client deve sapere che riprovare significa rimandare l'azione");
  assert.ok(
    /NON riprovare/i.test(String(corpo.error || "")),
    `il messaggio per Nicola deve dire di non riprovare, invece dice: «${corpo.error}»`,
  );
  assert.ok(!/^Non salvato/.test(String(corpo.error || "")), "il vecchio «— riprova.» è il consiglio sbagliato qui");
});

// ── AR-385 ────────────────────────────────────────────────────────────────────
await prova("AR-385: l'autopilota che non riesce a registrare l'esito NON rifà tutto al battito dopo", async () => {
  const sb = finoSupabase();
  globalThis.fetch = sb.handler;
  globalThis.__c1_mani = [];
  globalThis.__c1_coda = [AZIONE_VERDE];
  sb.righe.set("autopilota", "on");
  // La scrittura dello stato fallisce: è esattamente il caso che faceva riesplodere l'azione.
  sb.stato.scrittureRotte.add("azione:az-1");

  const primo = await eseguiAutopilota();
  assert.equal(globalThis.__c1_mani.length, 1, "al primo battito l'azione parte una volta");
  assert.ok(primo.fermato, "il giro deve fermarsi e dire perché, non tirare dritto in silenzio");

  const secondo = await eseguiAutopilota();
  assert.equal(
    globalThis.__c1_mani.length,
    1,
    `al secondo battito le mani si sono mosse ${globalThis.__c1_mani.length} volte: l'azione è ripartita`,
  );
  assert.equal(secondo.eseguite, 0, "il secondo battito non esegue niente di nuovo");
});

await prova("AR-385/AR-412: due giri di autopilota insieme non eseguono due volte", async () => {
  const sb = finoSupabase();
  globalThis.fetch = sb.handler;
  globalThis.__c1_mani = [];
  globalThis.__c1_coda = [AZIONE_VERDE];
  sb.righe.set("autopilota", "on");

  // Il cron e il componente della pagina partono insieme: su Vercel sono processi diversi.
  const [x, y] = await Promise.all([eseguiAutopilota(), eseguiAutopilota()]);
  assert.equal(globalThis.__c1_mani.length, 1, "l'azione va eseguita una volta sola, non una per innesco");
  assert.equal([x, y].filter((r) => r.gia_in_corso).length, 1, "uno dei due giri deve fermarsi sulla porta");
});

await prova("AR-385: senza memoria l'autopilota non tratta «non lo so» come «nessuna azione decisa»", async () => {
  const sb = finoSupabase();
  globalThis.fetch = sb.handler;
  globalThis.__c1_mani = [];
  globalThis.__c1_coda = [AZIONE_VERDE];
  sb.righe.set("autopilota", "on");
  const vero = sb.handler;
  // L'interruttore si legge, poi la REST cade: `valori` torna vuoto e OGNI azione sembra non decisa.
  let letture = 0;
  globalThis.fetch = async (u, o) => {
    if (String(u).includes("select=chiave,valore") && ++letture >= 1) return { ok: false, status: 500, json: async () => ({}) };
    return vero(u, o);
  };
  const esito = await eseguiAutopilota();
  assert.equal(globalThis.__c1_mani.length, 0, "al buio non si esegue niente");
  assert.equal(esito.cieco, true, "e si dichiara di essere ciechi, invece di dire «zero da fare»");
});

// ── AR-384 ────────────────────────────────────────────────────────────────────
await prova("AR-384: se la scrittura di sicurezza non conferma, le successive non partono nemmeno", async () => {
  let seguite = 0;
  const esito = await scrivereInOrdine({
    sicurezza: { nome: "revoca della firma", esegui: async () => false },
    poi: async () => {
      seguite++;
      return [{ nome: "stato", ok: true }];
    },
  });
  assert.equal(seguite, 0, "la revoca è fallita: rimettere la card «da approvare» qui è il danno");
  assert.equal(esito.bloccataSullaSicurezza, true, "e chi chiama deve poterlo dire a Nicola");
  assert.equal(esito.ok, false);
  assert.ok(esito.messaggio.includes("revoca della firma"), "il messaggio nomina il pezzo che non è passato");
});

await prova("AR-384: se la sicurezza conferma, il resto prosegue davvero (il metro sa dire di sì)", async () => {
  let seguite = 0;
  const esito = await scrivereInOrdine({
    sicurezza: { nome: "revoca della firma", esegui: async () => true },
    poi: async () => {
      seguite++;
      return [{ nome: "stato", ok: true }, { nome: "nota", ok: true }];
    },
  });
  assert.equal(seguite, 1, "con la sicurezza a posto le altre scritture devono partire");
  assert.equal(esito.ok, true);
  assert.equal(esito.bloccataSullaSicurezza, false);
});

// ── AR-887 ────────────────────────────────────────────────────────────────────
// Il difetto: il ramo «non eseguito» della rotta toglieva la firma per TUTTI i motivi. Era giusto
// per i tre che c'erano prima («non ho toccato il mondo»), sbagliato per il quarto, nato il 30/8:
// `atto-esploso` vuol dire «non SO se l'ho toccato». Togliere la firma rimette la card in «da
// approvare», e Nicola che la riapprova manda la mail una seconda volta — a un cliente vero. Il
// messaggio dell'azione, nel frattempo, gli diceva «NON riprovare».
await prova("AR-887: se l'atto esplode a meta, la firma NON si toglie — o Nicola la rimanda", async () => {
  const sb = finoSupabase();
  globalThis.fetch = sb.handler;
  globalThis.__c1_mani = [];
  globalThis.__c1_coda = [AZIONE_VERDE];
  globalThis.__c1_esplodi = true;
  try {
    const r = await rotta.POST(richiestaApprova("az-1"));
    const corpo = await r.json();
    assert.equal(corpo.ok, false, "un atto esploso non e' un successo");
    assert.equal(corpo.motivo, "atto-esploso", "il motivo deve arrivare fino a chi legge");
    // IL CUORE: la firma deve essere ancora addosso all'azione.
    const firma = sb.righe.get("azione:az-1:firma");
    assert.ok(firma && firma !== "",
      "la firma e' stata tolta: la card torna in «da approvare» e la prossima approvazione rimanda la mail");
    // ...e va detto che e' una SCELTA, non un guasto: due cose diverse vanno lette diverse.
    assert.equal(corpo.firmaTenutaApposta, true, "non basta tenere la firma: va detto che e' apposta");
    assert.match(String(corpo.error), /NON riprovare|apposta/,
      "il messaggio deve dire di non riprovare e perche la firma e' rimasta");
  } finally {
    globalThis.__c1_esplodi = false;
  }
});

await prova("AR-887: ...ma sugli altri tre motivi la firma si toglie ancora — la cura non e' un divieto", async () => {
  // Senza questo caso il fix sarebbe «non togliere mai la firma», che ricostruirebbe AR-110:
  // un'azione mai partita resterebbe firmata e la CLI potrebbe raccoglierla.
  const sb = finoSupabase();
  globalThis.fetch = sb.handler;
  globalThis.__c1_mani = [];
  globalThis.__c1_coda = [AZIONE_VERDE];
  globalThis.__c1_esplodi = false;
  const [a, b] = await Promise.all([rotta.POST(richiestaApprova("az-1")), rotta.POST(richiestaApprova("az-1"))]);
  const corpi = [await a.json(), await b.json()];
  const respinta = corpi.find((c) => c.ok === false);
  assert.equal(respinta?.motivo, "gia-in-corso");
  assert.notEqual(respinta?.firmaTenutaApposta, true,
    "su «posto gia preso» la firma non va tenuta: quel tentativo non ha toccato niente");
});


await prova("AR-901: la PR era già mergiata ma lo stato non si salva → il registro NON deve dire «fatta»", async () => {
  // Il ramo «PR già mergiata» chiude l'azione senza toccare il mondo. Se le due scritture di stato
  // falliscono, l'azione NON è chiusa da nessuna parte — ma il registro veniva scritto lo stesso,
  // PRIMA di guardare l'esito. Nicola avrebbe letto «fatta» nella cronologia mentre la card gli
  // tornava in «da decidere»: due verità diverse sullo stesso fatto, e quella scritta è la sbagliata.
  // Il ramo del RIFIUTO ha già l'ordine giusto da AR-230; questo era rimasto indietro.
  const sb = finoSupabase();
  globalThis.fetch = sb.handler;
  globalThis.__c1_mani = [];
  globalThis.__c1_prMergiata = true;
  globalThis.__c1_coda = [{ ...AZIONE_VERDE, id: "az-gh", canale: "github" }];
  sb.stato.scrittureRotte.add("azione:az-gh");

  const r = await rotta.POST(richiestaApprova("az-gh"));
  const corpo = await r.json();
  assert.equal(corpo.ok, false, "le scritture erano rotte: la rotta non può dichiarare che è andata");

  const registro = sb.righe.get("azioni_log");
  const voci = registro ? JSON.parse(registro) : [];
  assert.equal(
    voci.some((v) => v.id === "az-gh"),
    false,
    "il registro dice «fatta» per un'azione il cui stato non è stato salvato: la cronologia mente a Nicola",
  );
  globalThis.__c1_prMergiata = false;
});

const rossi = casi.filter((c) => !c.ok);
console.log(`TAP version 13\n1..${casi.length}`);
casi.forEach((c, i) => console.log(`${c.ok ? "ok" : "not ok"} ${i + 1} - ${c.nome}${c.ok ? "" : `\n  # ${c.err}`}`));
console.log(`# pass ${casi.length - rossi.length}`);
console.log(`# fail ${rossi.length}`);
process.exit(rossi.length ? 1 : 0);
