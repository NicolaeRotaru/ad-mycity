#!/usr/bin/env node
// 🔧 AUTO-FIX — la pipeline che CHIUDE i difetti del cantiere (upgrade U17).
// 🟢 Sola lettura del codice + aggiornamento della memoria auto-coscienza (cantiere + storico).
//    ⚠️ Governo: MODIFICARE il codice per risolvere un difetto resta 🟡 (firma Nicola, via PR).
//    Questo script NON tocca codice: verifica se un fix è GIÀ presente e, in tal caso, chiude il
//    difetto onestamente (bookkeeping 🟢). Per i difetti ancora aperti stampa la proposta 🟡 da firmare.
//
// Perché esiste: il volano diagnosticava difetti ma ne chiudeva 0 (chiuso-volano). Senza chiusura,
// l'auto-radiografia è un bel cruscotto, non un sistema che si ripara. Questo chiude il ciclo.
//
// Ogni difetto in cantiere-difetti.json può avere una prova oggettiva di risoluzione:
//   "verifica": { "file": "cervello/x.mjs", "pattern": "regex", "presente": true }
//   presente:true  → il difetto è risolto QUANDO il pattern è presente nel file (fix installato)
//   presente:false → il difetto è risolto QUANDO il pattern è ASSENTE (es. path Windows rimosso)
//   "verifica": { "comando": "node cervello/guardiano.mjs" }
//                  → il difetto è risolto QUANDO quel guardiano esce 0 (condizioni strutturali)
//
// Uso:
//   node cervello/auto-fix.mjs verifica              # report: quali difetti risultano risolti nel codice
//   node cervello/auto-fix.mjs verifica --applica    # chiude nel cantiere quelli verificati + aggiorna storico
//   node cervello/auto-fix.mjs chiudi --id=AR-002 --come="..."   # chiusura manuale con evidenza
//   node cervello/auto-fix.mjs report                # stato del cantiere (aperti/in-corso/chiusi)

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";
import { chiusuraAmmessa, istanteNascita, patternTrovato } from "./prove-regole.mjs";

const VAULT = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");
const CANTIERE = join(VAULT, "cantiere-difetti.json");
const STORICO = join(VAULT, "storico-salute.json");
const RAD = join(VAULT, "auto-radiografia.json");

function arg(name, def = undefined) {
  const pref = `--${name}=`;
  const a = process.argv.find((x) => x.startsWith(pref));
  return a ? a.slice(pref.length) : def;
}
function has(flag) {
  return process.argv.includes(`--${flag}`);
}

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}
function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function ricalcolaMeta(cantiere) {
  const d = cantiere.difetti || [];
  cantiere.meta = {
    aperti: d.filter((x) => x.stato === "aperto").length,
    in_corso: d.filter((x) => x.stato === "in-corso").length,
    chiusi: d.filter((x) => x.stato === "chiuso").length,
  };
}

/**
 * Prova di tipo COMANDO: il difetto è risolto quando un guardiano esce 0.
 *
 * Perché esiste (round 4, 2026-07-25). AR-142 («permessi di sessione più larghi del dovuto») non è
 * esprimibile come file+pattern: la stessa stringa `git push` compare sia fra i permessi CONCESSI
 * sia fra i DIVIETI, e una regex sul testo grezzo non sa distinguerli — un file configurato BENE
 * matcherebbe come uno configurato male. Provato: la prima versione della prova falliva proprio così.
 * E i divieti MANCANTI non sono esprimibili affatto: non si può cercare l'assenza di una regola in
 * un elenco che non la contiene.
 *
 * Il guardiano invece lo sa fare, perché legge la struttura. Quindi la prova diventa: «gira il
 * guardiano e guarda l'esito». Non è auto-firma — il guardiano legge un file che la macchina non
 * può scrivere (settings.json le è negato in Edit/Write) e non può farsi passare da solo.
 *
 * Vale per tutta la classe di difetti che oggi sono marcati «verifica umana» solo perché la loro
 * condizione è strutturale invece che testuale: era il male che il round 2 aveva smascherato.
 *
 * Sicurezza: si eseguono SOLO comandi `node <script>` dentro cervello/, senza shell, con un timeout.
 * Un difetto non deve poter far girare qualcosa di arbitrario per dichiararsi risolto.
 */
export function eseguiProvaComando(comando, run = spawnSync) {
  const c = String(comando || "").trim();
  const m = /^node\s+(cervello\/[\w./-]+\.mjs)((?:\s+--[\w-]+)*)$/.exec(c);
  if (!m) return { esito: "manuale", dettaglio: `comando non ammesso: "${c}" (solo: node cervello/<script>.mjs [--flag])` };
  const argomenti = m[2] ? m[2].trim().split(/\s+/) : [];
  const r = run(process.execPath, [join(AD_ROOT, m[1]), ...argomenti], {
    cwd: AD_ROOT,
    encoding: "utf8",
    timeout: 120000,
  });
  if (r.error) return { esito: "aperto", dettaglio: `${c} non eseguibile: ${r.error.message}` };
  return {
    esito: r.status === 0 ? "risolto" : "aperto",
    dettaglio: `${c} → exit ${r.status}${r.status === 0 ? " (guardiano soddisfatto)" : " (il guardiano segnala ancora violazioni)"}`,
  };
}

/**
 * Il file citato dalla prova è cambiato fra la nascita del difetto e adesso? (AR-330, guardia ②)
 * `null` = git non ha saputo rispondere (storia troncata, clone superficiale) → chi decide lascerà
 * passare dicendolo, invece di bloccare per sempre ogni chiusura su un repo senza storia.
 */
function fileCambiatoDa(file, nato) {
  // ⚠️ L'istante DEVE essere completo. Con una data secca («2026-07-27») l'approxidate di git riempie
  // l'ora mancante con quella CORRENTE: `--since=2026-07-27` lanciato alle 18:40 significa «dalle
  // 18:40 di oggi», non «da mezzanotte». Effetto: ogni file modificato oggi risultava «mai cambiato»
  // e la guardia bloccava chiusure legittime. Stesso inciampo di prove-oneste, e la seconda copia
  // l'ho scritta io dopo aver corretto la prima — motivo per cui la normalizzazione ora è UNA
  // funzione condivisa (istanteNascita) e non due date passate a mano.
  const istante = istanteNascita(nato);
  if (!file || !istante) return null;
  const r = spawnSync("git", ["log", "--oneline", `--since=${istante}`, "--", file], {
    cwd: AD_ROOT,
    encoding: "utf8",
    timeout: 20000,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.error || r.status !== 0) return null;
  return String(r.stdout || "").trim().length > 0;
}

// Verifica oggettiva: il fix è presente nel codice?
function verificaFix(dif) {
  const v = dif.verifica;
  if (v && v.comando) return eseguiProvaComando(v.comando);
  if (!v || !v.file || !v.pattern) return { esito: "manuale", dettaglio: "nessuna prova automatica: verifica umana" };
  const p = join(AD_ROOT, v.file);
  if (!existsSync(p)) return { esito: "aperto", dettaglio: `file assente: ${v.file}` };
  let txt = "";
  try {
    txt = readFileSync(p, "utf8");
  } catch (e) {
    return { esito: "aperto", dettaglio: `illeggibile: ${e.message}` };
  }
  // Il confronto (regex OPPURE letterale, per il caso AR-151) vive in prove-regole.mjs: da AR-330 lo
  // usano in due — questo, per chiudere, e prove-oneste, per controllare com'era la prova alla
  // nascita. Due copie divergerebbero, e una prova valutata con due metri diversi non è un metro.
  const trovato = patternTrovato(v.pattern, txt);
  const vuolePresente = v.presente !== false; // default: presente=true
  const risolto = vuolePresente ? trovato : !trovato;
  return {
    esito: risolto ? "risolto" : "aperto",
    dettaglio: `${v.file} ${vuolePresente ? "contiene" : "NON contiene"} /${v.pattern}/ → ${trovato ? "trovato" : "assente"}`,
  };
}

/**
 * Quale voto salute va scritto nello storico quando si chiude un difetto.
 * Pura (nessun I/O) apposta: è la regola che ha fatto danno, e va potuta provare da sola.
 *   · la radiografia offre una misura vera (numero > 0) → si usa quella;
 *   · altrimenti → si RIPORTA l'ultimo voto noto dello storico, marcandolo come non ri-misurato.
 * Non ritorna mai 0 per "non lo so": chiudere un difetto non deve poter abbassare il voto.
 */
export function votoSaluteDaRegistrare(rad = {}, serie = []) {
  const votoRad = Number(rad?.voto_salute_architettura);
  if (Number.isFinite(votoRad) && votoRad > 0) return { voto: votoRad, misurato: true };
  const ultimoNoto = [...(serie || [])].reverse().find((v) => Number(v?.voto_salute) > 0);
  return { voto: Number(ultimoNoto?.voto_salute) || 0, misurato: false };
}

function bumpSalute(chiusiOra, note) {
  if (chiusiOra <= 0) return;
  // AR-096: il voto NON si auto-gonfia più qui (era +2 fisso a ogni chiusura, solo in salita, scritto
  // dal processo che ha interesse a farlo salire). Il voto_salute_architettura resta un output della
  // radiografia completa (che vede aperti/gravità/nuovi difetti): auto-fix lo LEGGE come-è, non lo tocca,
  // e si limita ad aggiornare il conteggio dei difetti chiusi nello storico.
  //
  // Round 3 (2026-07-25) — AR-096 aveva chiuso solo la salita. Restava aperta la DISCESA, che è peggio:
  // auto-fix leggeva `voto_salute_architettura` da auto-radiografia.json e oggi quel campo vale 0
  // (è la salute "pending-merge", con floor 0, non il voto architettura che lo storico traccia a 43).
  // Risultato: OGNI chiusura di difetto appendeva allo storico un voto 0, e la pagella —  che legge
  // l'ultima riga — vedeva il voto salute crollare da 43 a 0. Cioè: chiudere un freno di sicurezza
  // FACEVA PEGGIORARE il voto della macchina, punendo esattamente il comportamento che vogliamo.
  // Ora: se la radiografia non offre una misura utilizzabile (assente, non numerica o 0), il voto NON
  // si inventa e non si azzera — si RIPORTA l'ultimo noto, dicendo che non è stato ri-misurato.
  // Il voto si muove solo quando qualcuno lo misura davvero.
  const rad = readJson(RAD, {});
  const cantiere = readJson(CANTIERE, { meta: {} });
  const storico = readJson(STORICO, { serie: [] });
  storico.serie = storico.serie || [];

  const { voto, misurato } = votoSaluteDaRegistrare(rad, storico.serie);

  storico.serie.push({
    data: nowPiacenza().slice(0, 10),
    voto_salute: voto,
    voto_riportato: !misurato, // true = non ri-misurato qui, ereditato dall'ultima misura vera
    difetti_aperti: cantiere.meta?.aperti ?? 0,
    difetti_chiusi: chiusiOra,
    tipo: "auto-fix",
    nota: misurato
      ? note
      : `${note} · voto salute NON ri-misurato (la radiografia non offre un voto utilizzabile): riportato ${voto} dall'ultima misura vera.`,
  });
  if (storico.serie.length > 90) storico.serie = storico.serie.slice(-90);
  writeJson(STORICO, storico);
  console.log(
    misurato
      ? `📈 ${chiusiOra} difetti chiusi · voto salute (dalla radiografia, non gonfiato): ${voto}.`
      : `📈 ${chiusiOra} difetti chiusi · voto salute non ri-misurato qui: riportato ${voto} (chiudere un difetto non abbassa il voto).`
  );
}

async function cmdVerifica(cantiere) {
  const applica = has("applica");
  const aperti = (cantiere.difetti || []).filter((d) => d.stato !== "chiuso");
  console.log(`\n🔧 AUTO-FIX — verifica cantiere (${aperti.length} non chiusi) — ${nowPiacenza()}\n`);
  const daChiudere = [];
  const rifiutate = [];
  for (const d of aperti) {
    const r = verificaFix(d);
    // ② LA GUARDIA DELLA CHIUSURA (AR-330): una prova soddisfatta non basta. Se fra la nascita del
    // difetto e adesso il file che la prova cita non è MAI cambiato, non c'è niente che possa averlo
    // risolto — e quella è la firma esatta delle 91 chiusure false del 27/7, dove fra le 09:40 e le
    // 12:15 su main non era atterrato un solo fix. Regola in prove-regole.mjs, fatti raccolti qui.
    const g = r.esito === "risolto"
      ? chiusuraAmmessa({ verifica: d.verifica, nato: d.nato, fileCambiatoDallaNascita: fileCambiatoDa(d.verifica?.file, d.nato) })
      : { ammessa: true };
    const bloccato = r.esito === "risolto" && !g.ammessa;
    const icona = bloccato ? "🛑 rifiutata" : r.esito === "risolto" ? "✅ risolto" : r.esito === "manuale" ? "🖐️  manuale" : "⏳ aperto";
    console.log(`${icona}  ${d.id} — ${d.titolo}`);
    console.log(`        ${bloccato ? g.motivo : r.dettaglio}`);
    if (r.esito === "risolto" && g.ammessa) daChiudere.push({ d, come: r.dettaglio });
    else if (bloccato) rifiutate.push({ d, motivo: g.motivo });
  }
  if (rifiutate.length) {
    console.log(
      `\n🛑 ${rifiutate.length} chiusura/e RIFIUTATE dalla guardia AR-330: la prova risulta soddisfatta ma il file citato non è mai cambiato dalla nascita del difetto. Non è una riparazione — è una prova che descrive il bug. Riscrivila (meglio: {"comando":"node cervello/test/<nome>.test.mjs"}).`,
    );
  }
  if (!applica) {
    if (daChiudere.length) {
      console.log(`\n→ ${daChiudere.length} difetto/i risultano risolti nel codice. Chiudili: node cervello/auto-fix.mjs verifica --applica`);
    } else {
      console.log("\nNessun difetto auto-verificabile risulta risolto ora.");
    }
    // Difetti ancora aperti = proposte 🟡 da firmare
    const ancora = aperti.filter((d) => !daChiudere.some((x) => x.d.id === d.id));
    if (ancora.length) {
      console.log(`\n🟡 Ancora da risolvere (proposta di fix da firmare):`);
      for (const d of ancora) console.log(`  · ${d.id} [${d.impatto_crescita}] ${d.titolo} → ${d.fix_proposto}`);
    }
    return;
  }
  for (const { d, come } of daChiudere) {
    d.stato = "chiuso";
    d.chiuso_il = nowPiacenza();
    d.chiuso_come = come;
  }
  ricalcolaMeta(cantiere);
  cantiere.aggiornato = nowPiacenza();
  writeJson(CANTIERE, cantiere);
  bumpSalute(daChiudere.length, `Auto-fix: chiusi ${daChiudere.map((x) => x.d.id).join(", ")} (verificati nel codice).`);
  console.log(`\n✅ Chiusi ${daChiudere.length}. Cantiere ora: ${cantiere.meta.aperti} aperti · ${cantiere.meta.in_corso} in-corso · ${cantiere.meta.chiusi} chiusi.`);
}

function cmdChiudi(cantiere) {
  const id = arg("id");
  const come = arg("come", "chiusura manuale");
  if (!id) {
    console.error("❌ Serve --id. Es: node cervello/auto-fix.mjs chiudi --id=AR-002 --come=\"...\"");
    process.exit(2);
  }
  const d = (cantiere.difetti || []).find((x) => x.id === id);
  if (!d) {
    console.error(`❌ Difetto non trovato: ${id}`);
    process.exit(2);
  }
  d.stato = "chiuso";
  d.chiuso_il = nowPiacenza();
  d.chiuso_come = come;
  ricalcolaMeta(cantiere);
  cantiere.aggiornato = nowPiacenza();
  writeJson(CANTIERE, cantiere);
  bumpSalute(1, `Auto-fix: chiuso ${id} — ${come}`);
  console.log(`✅ Chiuso ${id}. Cantiere: ${cantiere.meta.aperti} aperti · ${cantiere.meta.chiusi} chiusi.`);
}

function cmdReport(cantiere) {
  ricalcolaMeta(cantiere);
  console.log(`\n🚧 CANTIERE DIFETTI — ${cantiere.aggiornato || nowPiacenza()}`);
  console.log(`   ${cantiere.meta.aperti} aperti · ${cantiere.meta.in_corso} in-corso · ${cantiere.meta.chiusi} chiusi\n`);
  for (const d of cantiere.difetti || []) {
    const ic = d.stato === "chiuso" ? "✅" : d.stato === "in-corso" ? "🔧" : "⏳";
    console.log(`${ic} ${d.id} [${d.impatto_crescita || "?"}] ${d.titolo}`);
    if (d.stato === "chiuso" && d.chiuso_come) console.log(`      chiuso ${d.chiuso_il}: ${d.chiuso_come}`);
  }
}

async function main() {
  const cmd = process.argv[2] || "report";
  const cantiere = readJson(CANTIERE, { aggiornato: nowPiacenza(), difetti: [], meta: {} });
  switch (cmd) {
    case "verifica":
      await cmdVerifica(cantiere);
      break;
    case "chiudi":
      cmdChiudi(cantiere);
      break;
    case "report":
      cmdReport(cantiere);
      break;
    default:
      console.error(`Comando sconosciuto: ${cmd}. Usa: verifica [--applica] | chiudi --id= | report`);
      process.exit(2);
  }
  await stampSegnale("auto-fix", "ok", `${cantiere.meta?.chiusi ?? 0} chiusi · ${cantiere.meta?.aperti ?? 0} aperti · ${nowPiacenza()}`);
}

// Il CLI parte solo se questo file è LANCIATO, non quando un test ne importa
// votoSaluteDaRegistrare (importarlo non deve far girare una verifica del cantiere né scrivere segnali).
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(async (e) => {
    console.error("ERRORE auto-fix:", e.message || e);
    await stampSegnale("auto-fix", "errore", `crash: ${(e.message || e).toString().slice(0, 180)}`);
    process.exit(1);
  });
}
