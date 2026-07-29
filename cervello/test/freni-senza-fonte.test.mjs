#!/usr/bin/env node
// AR-196 · AR-279 · AR-280 · AR-171 · AR-165 — i freni che leggono un numero senza sapere da dove viene.
//
// Cinque difetti, una malattia: **un buco si traveste da buona notizia.**
//
//   AR-196 (bloccante) — il freno sui costi confrontava `.oggi.token_totali` con la soglia. Quel campo
//     è 0 per costruzione: ogni registrazione passa con --stima e le stime stanno in un contatore a
//     parte (AR-043). Misurato il 28/7: 0 reali per SEI giorni di fila, 385.000 stimati nel solo 27/7,
//     soglia 2.000.000. Il freno confrontava 0 con 2.000.000. Non poteva scattare.
//     Tre buchi nello stesso blocco, non uno: ① il campo sbagliato · ② il `// 0` di jq che trasforma
//     «assente» in «zero speso» · ③ tutto il blocco dentro `if command -v jq`, quindi su una macchina
//     senza jq il freno non esisteva, in silenzio.
//
//   AR-279 (bloccante) — il freno sul business estraeva i giorni di stallo da una FRASE di STATO.md.
//     Misurato il 28/7 alle 01:06: leggeva «9 ore» → 0,4 giorni → sotto la soglia di 3 → **usciva 0,
//     via libera**, mentre la riga più in alto dello stesso file diceva «stallo 33 giorni».
//
//   AR-280 — `ultimo_ordine` veniva letto dalla sentinella e usato da nessuna regola: un mese senza
//     ordini non produceva nessun segnale, perché l'unica regola sugli ordini misura un CALO su una
//     media. Una media di zero non cala mai.
//
//   AR-171 — la calibrazione cercava il sensore `posthog`, che nel file si chiama `posthog_api`. Ma il
//     guasto vero era più largo: la ricerca era esatta su un campo di testo libero, quindi 41 voci
//     chiuse su 42 cadevano nel ramo «fonte umana» e facevano punteggio — comprese 36 che vengono dal
//     quaderno che la macchina scrive da sé.
//
//   AR-165 — l'esito di due guardiani finiva in `| tail -4 || true`: in una pipe conta il codice
//     d'uscita dell'ultimo comando, che è sempre 0. Il guardiano nato per scoprire i controlli spenti
//     in silenzio aveva, lui per primo, l'allarme staccato.
//
// Qui si eseguono le funzioni e i programmi VERI. Il primo caso di ogni blocco è il metro: con il
// codice vecchio era il contrario.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";
import { ESCLUSA, contaNelPunteggio } from "../previsione-verificabile.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const {
  FONTI,
  codiceUscita,
  decidiFrenoCosto,
  decidiStallo,
  gateAmmesso,
  giorniDa,
  leggiContatore,
  tokenPerGate,
} = await import(join(QUI, "..", "fonte-numero.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

const leggi = (f) => readFileSync(join(REPO, f), "utf8");

/** Esegue freno-costi.mjs su un file finto e torna {rc, out}. */
function freno(costoJson) {
  const d = mkdtempSync(join(tmpdir(), "mycity-freno-"));
  const f = join(d, "costo-ai.json");
  writeFileSync(f, JSON.stringify(costoJson));
  try {
    const out = execFileSync("node", [join(REPO, "cervello/freno-costi.mjs"), `--file=${f}`], { encoding: "utf8" });
    return { rc: 0, out };
  } catch (e) {
    return { rc: e.status ?? 1, out: `${e.stdout || ""}${e.stderr || ""}` };
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
}

// ── AR-196: il freno che confrontava zero con due milioni ────────────────────
prova("il caso che ha rotto: 385.000 stimati e 0 reali FANNO scattare il freno", () => {
  // Con la logica vecchia questo era «lascia»: leggeva token_totali=0, quindi 0 > 100.000 era falso.
  // È lo stato reale del 27/7, con la soglia abbassata per non dover fingere un milione di token.
  const { rc, out } = freno({
    soglia_giornaliera_token: 100_000,
    oggi: { data: "2026-07-27", token_totali: 0, token_stimati: 385_000 },
  });
  assert.equal(rc, 1, `il freno doveva frenare: ${out}`);
  assert.match(out, /frena/);
});

prova("sotto soglia lascia lavorare: un freno che frena sempre viene staccato", () => {
  const { rc, out } = freno({
    soglia_giornaliera_token: 2_000_000,
    oggi: { data: "2026-07-27", token_totali: 0, token_stimati: 385_000 },
  });
  assert.equal(rc, 0, out);
  assert.match(out, /lascia/);
});

prova("il caso che ha rotto: campo ASSENTE non è «zero token spesi»", () => {
  // Il `// 0` di jq faceva esattamente questo: un buco letto come una misura rassicurante.
  const { rc, out } = freno({ soglia_giornaliera_token: 100_000, oggi: { data: "2026-07-27" } });
  assert.equal(rc, 2, `l'assenza dev'essere CIECA (rc=2), non «sotto soglia»: ${out}`);
  assert.match(out, /cieco/);
});

prova("il freno cieco NON ferma la macchina: al buio si dichiara, non si blocca tutto", () => {
  // I due freni di questo lotto sono opposti apposta. Sul business, al buio si resta chiusi (non dare
  // via libera costa un giro). Sui costi, bloccare su un campo mancante fermerebbe la macchina: si
  // dichiara e basta. La regola non è «al buio blocca», è «al buio non dare la risposta comoda».
  const src = leggi("cervello/giro.sh");
  const i2 = src.indexOf("2)", src.indexOf("_freno_rc"));
  assert.ok(i2 > 0, "manca il ramo del freno cieco");
  const ramo = src.slice(i2, i2 + 900);
  assert.doesNotMatch(ramo, /RUN_AI=0/, "un campo mancante non deve spegnere il motore");
  assert.match(ramo, /COSTO_VINCOLO=/, "…ma deve lasciare un vincolo visibile (AR-322)");
});

prova("senza soglia configurata il freno è cieco, non permissivo", () => {
  const { rc } = freno({ oggi: { token_totali: 0, token_stimati: 9_999_999 } });
  assert.equal(rc, 2);
});

prova("0 misurato e campo assente sono due cose diverse, e il codice le distingue", () => {
  assert.deepEqual(leggiContatore({ x: 0 }, "x"), { valore: 0, fonte: FONTI.MISURA });
  assert.deepEqual(leggiContatore({}, "x"), { valore: null, fonte: FONTI.ASSENTE });
  assert.deepEqual(leggiContatore(null, "x"), { valore: null, fonte: FONTI.ASSENTE });
  assert.equal(tokenPerGate({ token_totali: 12, token_stimati: 900 }).valore, 900, "vince il più alto");
  assert.equal(tokenPerGate({}).fonte, FONTI.ASSENTE, "nessuno dei due contatori: assente, non zero");
});

prova("il produttore SCRIVE il numero su cui si frena, non se lo tiene per sé", () => {
  // È tutto il difetto: il fix precedente (AR-144) calcolava il massimo ma lo usava solo per stamparlo.
  // Il valore non attraversava mai il file JSON che fa da contratto fra chi misura e chi frena.
  const src = leggi("cervello/costo-ai.mjs");
  assert.match(src, /stato\.oggi\.token_per_gate = /, "il campo dev'essere scritto nel file");
  assert.match(src, /from "\.\/fonte-numero\.mjs"/, "il massimo si calcola in un posto solo");
});

prova("l'archivio di fine giornata non butta via l'unico numero che esiste", () => {
  // Trovato applicando il fix: a mezzanotte l'archivio copiava solo token_totali (zero) e scartava
  // token_stimati. Per questo lo storico a 60 giorni mostrava «0 token» ogni singolo giorno.
  const src = leggi("cervello/costo-ai.mjs");
  const i = src.indexOf("storico_giorni.unshift");
  const blocco = src.slice(i, i + 400);
  assert.match(blocco, /token_stimati/, "le stime devono entrare nello storico");
  assert.match(blocco, /token_per_gate/, "e con loro il numero su cui si frena");
});

prova("il Pannello non mostra più uno zero al posto di «non misurato»", () => {
  const route = leggi("pannello/src/app/api/costo/route.ts");
  assert.match(route, /token_per_gate/, "la route deve leggere il campo giusto");
  assert.doesNotMatch(route, /const tokenOggi = Number\(oggi\.token_totali \|\| 0\)/, "era lo zero rassicurante");
  const card = leggi("pannello/src/components/CuoreMacchina.tsx");
  assert.match(card, /non misurato/, "quando il numero manca la casella deve dirlo");
});

// ── AR-279: il freno che leggeva i giorni da una frase ───────────────────────
prova("il caso che ha rotto: zero ordini pagati = stallo, senza bisogno di nessuna frase", () => {
  // Con la logica vecchia si passava da una regex su STATO.md, che il 28/7 pescava «9 ore» → via libera.
  const e = decidiStallo({ ordiniPagati: 0, fonte: FONTI.REST, sogliaGiorni: 3 });
  assert.equal(e.gate, "chiuso");
  assert.equal(codiceUscita(e.gate), 1, "il gate deve vincolare il giro");
  assert.match(e.motivo, /nessun ordine pagato/);
});

prova("la regex sulla prosa è CANCELLATA, non solo scavalcata", () => {
  const src = leggi("cervello/north-star-check.mjs");
  assert.doesNotMatch(src, /stalloDaStato/, "la funzione che leggeva la frase non deve più esistere");
  // Cerco la regex ESEGUITA, non quella citata: il commento in testa al file riporta apposta la vecchia
  // per spiegare cosa è andato storto, e cancellare la spiegazione insieme al bug è come non averlo
  // mai avuto. (La prima versione di questo controllo bocciava il commento — un test che vieta di
  // raccontare l'errore è un test che fa dimenticare l'errore.)
  assert.doesNotMatch(src, /match\(\/stallo/, "nessuna regex sulla prosa dello stallo può girare");
  assert.match(src, /payment_status=eq\.PAID/, "il numero viene dal database");
  assert.match(src, /fonte_numero/, "e dichiara da dove viene (AR-279 ④)");
});

prova("una frase non può MAI reggere un gate, nemmeno se il numero fosse giusto", () => {
  assert.equal(gateAmmesso(FONTI.PROSA).ammesso, false);
  assert.equal(gateAmmesso(FONTI.ASSENTE).ammesso, false);
  assert.equal(gateAmmesso("").ammesso, false, "fonte non dichiarata = non ammessa");
  assert.equal(gateAmmesso(FONTI.REST).ammesso, true);
  assert.equal(gateAmmesso(FONTI.BASELINE).ammesso, true, "una tabella dichiarata è una fonte onesta");
});

prova("con ordini che si muovono il freno si apre: non è un freno che blocca sempre", () => {
  const adesso = Date.parse("2026-07-28T01:00:00Z");
  const ieri = new Date(adesso - 26 * 3600_000).toISOString();
  const e = decidiStallo({ ordiniPagati: 5, ultimoPagatoIso: ieri, adessoMs: adesso, sogliaGiorni: 3, fonte: FONTI.REST });
  assert.equal(e.gate, "aperto");
  assert.equal(e.giorni, 1);
});

prova("ordini pagati ma data illeggibile = cieco, non «va tutto bene»", () => {
  const e = decidiStallo({ ordiniPagati: 5, ultimoPagatoIso: "boh", adessoMs: Date.now(), fonte: FONTI.REST });
  assert.equal(e.gate, "cieco");
  assert.equal(codiceUscita("cieco"), 2, "contratto AR-322");
});

prova("al buio il freno del business resta CHIUSO (l'opposto di quello dei costi, apposta)", () => {
  const e = decidiStallo({ ordiniPagati: null, fonte: FONTI.ASSENTE });
  assert.notEqual(e.gate, "aperto", "al buio non si dà mai via libera sul business");
});

prova("il guardiano vero, eseguito adesso, NON dice più via libera", () => {
  // Il 28/7 alle 01:06 questo comando usciva 0 con 33 giorni di stallo reali. È il difetto vivo.
  let rc = 0;
  try {
    execFileSync("node", [join(REPO, "cervello/north-star-check.mjs"), "--gate"], { cwd: REPO, stdio: "pipe" });
  } catch (e) {
    rc = e.status ?? 1;
  }
  // --json esce con lo stesso codice del gate (1 = stallo, che è il caso vero): lo stdout va letto
  // comunque, non solo quando è tutto verde.
  let testo;
  try {
    testo = execFileSync("node", [join(REPO, "cervello/north-star-check.mjs"), "--json"], { cwd: REPO, encoding: "utf8" });
  } catch (e) {
    testo = String(e.stdout || "{}");
  }
  const j = JSON.parse(testo);
  if ((j.north_star?.ordini_pagati?.valore ?? 0) === 0) {
    assert.equal(rc, 1, "con zero ordini pagati il gate DEVE vincolare");
    assert.notEqual(j.fonte_numero, "prosa", "e non deve reggersi su una frase");
  }
});

prova("giorniDa non inventa numeri da date storte", () => {
  const t = Date.parse("2026-07-28T00:00:00Z");
  assert.equal(giorniDa("2026-07-21T00:00:00Z", t), 7);
  for (const brutta of [null, undefined, "", "domani", "33 giorni"]) assert.equal(giorniDa(brutta, t), null);
});

// ── AR-280: la regola che mancava del tutto ──────────────────────────────────
prova("il caso che ha rotto: «nessun ordine da N giorni» adesso esiste come regola", () => {
  const src = leggi("cervello/sentinella-dati.mjs");
  assert.match(src, /chiave: "nessun_ordine"/, "la regola deve esistere");
  assert.match(src, /giorniDa\(s\.ultimo_ordine/, "e usare il timestamp che veniva letto e buttato");
  assert.match(src, /from "\.\/fonte-numero\.mjs"/, "i giorni si contano in un posto solo");
});

prova("l'allarme sale a scalini invece di ripetersi a ogni giro", () => {
  // La lezione di AR-114, già pagata in questo file con 39 diagnosi identiche in 5 giorni: se la firma
  // cambia ogni volta, il dedup non scatta mai. Un allarme che si ripete identico è un silenzio.
  const src = leggi("cervello/sentinella-dati.mjs");
  const i = src.indexOf('chiave: "nessun_ordine"');
  const blocco = src.slice(i - 800, i + 700);
  assert.match(blocco, /dedupPersistente: true/);
  assert.match(blocco, /firma: `scalino-/, "la firma è lo scalino, non il numero di giorni");
  assert.doesNotMatch(blocco, /firma: `\$\{giorniSenzaOrdini\}/, "così si riaccoderebbe ogni giorno");
});

// ── AR-171: il default rovesciato ────────────────────────────────────────────
prova("il caso che ha rotto: la chiave del sensore è quella VERA del file", () => {
  const src = leggi("cervello/calibrazione.mjs");
  assert.match(src, /posthog_api/, "nel file dei sensori si chiama posthog_api, non posthog");
  const sensori = JSON.parse(leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/sensori-cecita.json"));
  const chiaviVere = Object.keys(sensori.sensori || {});
  for (const k of ["posthog_api", "stripe_api", "mcp_supabase"]) {
    assert.ok(chiaviVere.includes(k), `${k} deve esistere davvero nel file, non a memoria`);
    assert.match(src, new RegExp(k), `${k} dev'essere nella mappa`);
  }
});

prova("una fonte non riconosciuta NON fa più guadagnare autonomia", () => {
  // Era il default rovesciato: si escludeva solo ciò che si sapeva riconoscere come cieco, quindi
  // «chiusura-loop ESITO» — il quaderno che la macchina scrive da sé — faceva punteggio. 36 voci su 42.
  //
  // ⚠️ Questa prova cercava il pattern `e.sensore_stato !== "ok" && ...` DENTRO calibrazione.mjs, e il
  // 28/7 è diventata rossa quando quella decisione è stata consolidata in `previsione-verificabile.mjs`
  // — la proprietà reggeva, la prova no. È la debolezza della prova-pattern vista dall'altro lato:
  // non chiude niente di falso, ma accusa un lavoro sano e spinge a non riordinare il codice.
  // Ora si ESEGUE la regola invece di cercarla scritta.
  const sano = { stato: "azzeccata", sensore_stato: "ok", atteso: 1, baseline: 0, entro: "2099-01-01", creato: "2026-07-01", chiuso_il: "2026-07-05" };
  assert.equal(contaNelPunteggio(sano).conta, true, "una misura vista conta");
  for (const stato of ["cieco", "sconosciuto", undefined]) {
    const g = contaNelPunteggio({ ...sano, sensore_stato: stato });
    assert.equal(g.conta, false, `sensore "${stato}" non deve far guadagnare autonomia`);
    assert.ok(g.motivi.includes(ESCLUSA.SENSORE_CIECO), `motivo mancante per "${stato}"`);
  }
  assert.equal(contaNelPunteggio({ ...sano, sensore_stato: "n/d" }).conta, true, "una fonte umana dichiarata è una misura vera");
});

prova("la ricerca del sensore non è più un confronto esatto su testo libero", () => {
  const src = leggi("cervello/calibrazione.mjs");
  assert.doesNotMatch(src, /const chiavi = mappa\[fonte\];/, "un lookup esatto su un campo libero non trova mai nulla");
  assert.match(src, /SENSORI_PER_FONTE/, "serve un riconoscimento per corrispondenza");
  assert.match(src, /FONTI_UMANE/, "e l'elenco DICHIARATO delle fonti umane");
});

// ── AR-165: l'esito buttato in una pipe ──────────────────────────────────────
prova("il caso che ha rotto: la funzione guardiano() restituisce l'rc VERO", () => {
  const sh = join(REPO, "cervello/giro-esito.sh");
  const run = (cmd) => {
    try {
      execFileSync("bash", ["-c", `SCRIPT_DIR="${join(REPO, "cervello")}"; . "${sh}"; ${cmd}`], { stdio: "pipe" });
      return 0;
    } catch (e) {
      return e.status ?? 1;
    }
  };
  // Un guardiano che fallisce deve far fallire la funzione. Con `| tail || true` questo era sempre 0.
  assert.notEqual(run("guardiano non-esiste-affatto.mjs"), 0, "un guardiano che esplode non è un verde");
  assert.equal(run("guardiano spazzata-fratelli.mjs"), 0, "…e uno che passa deve passare");
});

prova("i TRE guardiani muti sono cablati come cancelli, non come righe di log", () => {
  // Erano due nel lotto 10, e tasso-lezioni è sfuggito: la prova di AR-178 era un OR
  // (`VOLANO_VINCOLO|_tasso_rc|_sonda_rc`), quindi ha fatto centro sulla metà riparata e ha chiuso il
  // difetto con l'altra metà ancora rotta — mentre tasso-lezioni usciva 1, cioè stava suonando.
  // Una prova con un OR dentro chiude un difetto quando UNO qualsiasi dei suoi pezzi è a posto.
  const src = leggi("cervello/giro.sh");
  for (const g of ["freschezza-segnali", "sonda-volano", "tasso-lezioni"]) {
    assert.match(src, new RegExp(`guardiano ${g}\\.mjs`), `${g} deve passare da guardiano()`);
    assert.doesNotMatch(src, new RegExp(`node "\\$SCRIPT_DIR/${g}\\.mjs"[^|\\n]*\\|[^|\\n]*tail`), `${g} è ancora in una pipe`);
  }
  assert.match(src, /FRESCHEZZA_VINCOLO=/);
  assert.match(src, /VOLANO_VINCOLO=/);
  assert.match(src, /TASSO_VINCOLO=/);
});

prova("ogni vincolo nuovo è nell'elenco unico E arriva al motore (AR-320)", () => {
  // Dichiarare una variabile e non metterla nell'elenco significa un cancello che si scioglie in
  // silenzio quando il motore viene saltato: è esattamente il difetto che AR-320 ha chiuso.
  const src = leggi("cervello/giro.sh");
  const elenco = src.match(/for _vnome in ([A-Z_ ]+); do/);
  assert.ok(elenco, "manca l'elenco unico dei vincoli");
  for (const v of ["COSTO", "FRESCHEZZA", "VOLANO", "FRATELLI", "TASSO"]) {
    assert.ok(elenco[1].includes(v), `${v} non è nell'elenco unico dei vincoli`);
    assert.match(src, new RegExp(`\\$\\{?${v}_VINCOLO`), `${v}_VINCOLO non arriva mai al prompt`);
  }
});

// ── la spazzata dei fratelli (la domanda di Nicola del 28/7) ─────────────────
prova("il registro delle malattie non è vuoto: un guardiano che non cerca niente non è un verde", () => {
  const reg = JSON.parse(leggi("cervello/malattie.json"));
  assert.ok(Array.isArray(reg.malattie) && reg.malattie.length >= 3);
  for (const m of reg.malattie) {
    assert.ok(m.id && m.pattern && m.perche_e_grave, `malattia incompleta: ${m.id || "?"}`);
    assert.ok(typeof m.baseline === "number", `${m.id}: senza tetto non si vede se cresce`);
    // Il metro non deve attraversare gli a-capo. In una classe di caratteri negata `[^…]` l'a-capo
    // rientra se non lo si esclude a mano: la prima versione di questo registro contava righe diverse
    // come una sola istanza e riportava 57 istanze invece di 36. Un metro sbagliato è peggio di nessun
    // metro, perché ha l'aria di una misura. Verificato incrociando con `grep`, che conta per riga.
    for (const classe of m.pattern.match(/\[\^[^\]]*\]/g) || []) {
      assert.ok(classe.includes("\\n"), `${m.id}: la classe ${classe} attraversa gli a-capo`);
    }
  }
});

prova("ogni esenzione porta scritto il PERCHÉ", () => {
  // Un'esenzione senza motivo è esattamente il silenzio che questo registro cura.
  const reg = JSON.parse(leggi("cervello/malattie.json"));
  for (const m of reg.malattie) {
    for (const e of m.esenti || []) {
      assert.ok(e.file, `${m.id}: esenzione senza file`);
      assert.ok((e.perche || "").length > 40, `${m.id}/${e.file}: esenzione senza un perché vero`);
    }
  }
});

prova("la spazzata gira davvero e sa dire di no", () => {
  const out = execFileSync("node", [join(REPO, "cervello/spazzata-fratelli.mjs"), "--json"], { cwd: REPO, encoding: "utf8" });
  const j = JSON.parse(out);
  assert.equal(j.ok, true, `la spazzata è rossa: ${JSON.stringify(j.malattie?.filter((m) => m.nuovi?.length))}`);
  // Un pattern che non trova mai niente è un guardiano finto — ma «zero istanze» ora può voler dire
  // due cose opposte: pattern morto, oppure malattia CURATA (28/7, AR-307: le 34 pipe di giro.sh sono
  // sparite tutte). Non si può più chiedere al repo di restare malato per dimostrare che il metro
  // funziona: si prova il metro su un campione, che è la domanda vera.
  for (const m of j.malattie) {
    const reg = JSON.parse(leggi("cervello/malattie.json")).malattie.find((x) => x.id === m.id);
    assert.ok(reg?.pattern, `${m.id}: malattia senza pattern`);
    assert.doesNotThrow(() => new RegExp(reg.pattern), `${m.id}: il pattern non compila — il guardiano è cieco su questa malattia`);
  }
  const pipe = j.malattie.find((m) => m.id === "esito-in-una-pipe");
  const regPipe = JSON.parse(leggi("cervello/malattie.json")).malattie.find((x) => x.id === "esito-in-una-pipe");
  assert.match('  node "$SCRIPT_DIR/guardiano.mjs" 2>&1 | tail -4', new RegExp(regPipe.pattern), "il pattern deve ancora riconoscere la malattia se torna");
  assert.equal(pipe.totale, 0, "curata il 28/7 (AR-307): se torna sopra zero, qualcuno ha rimesso una pipe che ingoia l'esito");
});

prova("la spazzata è agganciata al giro come cancello", () => {
  const src = leggi("cervello/giro.sh");
  assert.match(src, /guardiano spazzata-fratelli\.mjs/, "deve girare a ogni giro");
  assert.match(src, /FRATELLI_VINCOLO=/, "e il suo esito deve diventare un vincolo");
});

prova("ogni script toccato resta sintatticamente valido", () => {
  for (const f of ["cervello/giro.sh", "cervello/giro-esito.sh"]) {
    execFileSync("bash", ["-n", join(REPO, f)], { stdio: "pipe" });
  }
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
