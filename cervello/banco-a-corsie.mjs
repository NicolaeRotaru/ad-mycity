#!/usr/bin/env node
// 🛣️ IL BANCO A CORSIE — AR-938. Le mutazioni provate in parallelo, ognuna in casa sua.
//
// IL NUMERO CHE L HA DECISO, corsa 33863510792 del 4/9: il banco ha provato **27 difese su 172** e
// ne ha dichiarate 145 fuori dal budget. L 84% delle difese di quella consegna non e' stato
// misurato. Dichiarato — che e' molto meglio di un rosso muto (AR-917, AR-918) — ma un verde che
// copre il 16% resta un verde che copre il 16%.
//
// L ARITMETICA, misurata e non stimata: 27 mutazioni in 840 s fanno ~31 s l una; 172 in fila sono
// 89 minuti, contro un tetto di 75 per l INTERO cancello. Non e' un problema di budget: e' che in
// fila non ci stanno, e nessun numero piu' grande lo cambia.
//
// LA SCELTA DI NICOLA, 4/9: a corsie parallele, ognuna in una copia separata del progetto.
// Quattro corsie da ~43 mutazioni fanno ~22 minuti invece di 89, e ci arrivano TUTTE.
//
// PERCHE' LE COPIE SEPARATE NON SONO UN DETTAGLIO. Il banco, per misurare, ROMPE un file vero e lo
// rimette a posto: e' l unico modo di chiedere «questa prova sa diventare rossa?». Due corsie nella
// stessa casa si romperebbero i file a vicenda — ed e' esattamente il difetto AR-919, che arrossa
// la suite a caso quando una prova mutante gira accanto a una che legge. Qui non c e' da
// ricordarsi di evitarlo: ogni corsia ha la sua copia, quindi il difetto non ha dove succedere.
//
// COSA NON CAMBIA, ed e' il punto: il contratto a tre esiti. 0 = tutte le difese misurate reggono ·
// 1 = almeno una prova resta VERDE col fix rotto (una difesa che non difende) · 2 = non ho potuto
// misurare tutto, e chi e' rimasto fuori e' NOMINATO uno per uno. Le corsie cambiano quanto riesco
// a misurare, mai cosa vuol dire il verdetto.
import { spawn, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
export const AD_ROOT = join(QUI, "..");

/** Quante corsie di default: quattro, come i processori del runner. Piu' corsie che processori non
 *  vanno piu' veloci — si rubano il turno a vicenda e ogni prova diventa piu' lenta. */
export const CORSIE_DI_DEFAULT = 4;

/** Il prefisso con cui nascono le case delle corsie: e' anche la firma che le fa riconoscere. */
export const PREFISSO_CASA = "corsia-";

/**
 * 🧨 SI PUO' BUTTARE VIA QUESTA CARTELLA? — la difesa nata da un danno vero, il 4/9.
 *
 * Rompendo A MANO l isolamento per vedere se la prova se ne accorgeva — cioe' facendo credere alla
 * corsia che la sua copia FOSSE il repo — la pulizia di fine corsia ha cancellato **la cartella del
 * repo**, con tutto il lavoro non ancora committato dentro. La prova diventava rossa come doveva,
 * ma il prezzo era la casa. Il commit precedente era su origin, quindi si e' persa un ora di
 * lavoro e non un mese; e questa funzione esiste perche' la prossima volta non si perda nemmeno
 * quella.
 *
 * La regola, senza scorciatoie: si cancella SOLO una cartella nata dentro il temporaneo di sistema
 * e col nome che ci diamo noi. Qualunque altra cosa — la radice del repo per prima — non si tocca,
 * si dice. Un `rm -rf` che si fida di una variabile e' un `rm -rf` che aspetta il giorno in cui
 * quella variabile e' sbagliata.
 *
 * Pura, cosi' la prova la interroga senza rischiare niente.
 */
export function siPuoButtare(via, radiceTemp = tmpdir()) {
  if (!via || typeof via !== "string") return false;
  const p = resolve(via);
  const t = resolve(radiceTemp);
  if (p === t || !p.startsWith(t + sep)) return false;
  return p.slice(t.length + 1).split(sep)[0].startsWith(PREFISSO_CASA);
}

/**
 * 🔀 COME SI DIVIDONO LE MUTAZIONI FRA LE CORSIE — a mazzo di carte, non a blocchi.
 *
 * A blocchi (le prime 43 alla corsia 1, le seconde 43 alla 2…) le mutazioni dello stesso file — e
 * quindi della stessa prova, e quindi dello stesso costo — finiscono tutte nella stessa corsia,
 * perche' nel registro stanno vicine. Una corsia si becca le sette prove da quattro minuti e le
 * altre tre finiscono in un attimo: il tempo totale e' quello della corsia sfortunata.
 *
 * A giro (una carta per giocatore) le stesse mutazioni si spargono. Non e' bilanciamento perfetto —
 * per quello servirebbe sapere prima quanto dura ogni prova, e non lo sappiamo — ma trasforma «una
 * corsia lunghissima» in «quattro corsie simili», che e' tutto quello che serve.
 */
export function dividiInCorsie(mutazioni = [], quante = CORSIE_DI_DEFAULT) {
  const n = Math.max(1, Math.min(Number(quante) || 1, mutazioni.length || 1));
  const corsie = Array.from({ length: n }, () => []);
  mutazioni.forEach((m, i) => corsie[i % n].push(m));
  return corsie.filter((c) => c.length);
}

/**
 * 🧵 RICUCIRE I VERDETTI DELLE CORSIE IN UNO SOLO.
 *
 * La regola e' la stessa del banco singolo, e va detta perche' e' l unica che conta: **il peggiore
 * vince**. Una difesa che non difende (`vacua`) rende rosso tutto, anche se le altre tre corsie
 * sono verdi — non e' una media. Un ⚪ non lo cancella un verde.
 */
export function ricuciEsiti(perCorsia = []) {
  const esiti = perCorsia.flatMap((c) => c.esiti || []);
  const vacue = esiti.filter((e) => e.verdetto === "vacua");
  const ciechi = esiti.filter((e) => e.verdetto === "cieco");
  const misurate = esiti.filter((e) => e.verdetto === "ok").length;
  return { esiti, vacue, ciechi, misurate, codice: vacue.length ? 1 : ciechi.length ? 2 : 0 };
}

/** Le mutazioni di una corsia che non e' partita, dichiarate una per una invece che perse. */
export function corsiaNonPartita(mutazioni = [], perche = "") {
  return (mutazioni || []).map((m) => ({
    ...m,
    verdetto: "cieco",
    perche: `la corsia che doveva provarla non e' partita (${perche}): questa mutazione non l'ho misurata. Rilanciala da sola con \`node cervello/non-vacuita.mjs --difetti ${m.difetto || "AR-?"}\`.`,
  }));
}

/** Il registro che vede una corsia: solo le sue mutazioni, scritto dentro la SUA copia. */
export function registroDiCorsia(originale, mutazioni) {
  return { ...originale, mutanti: mutazioni, _corsia: `${mutazioni.length} mutazioni di questa corsia (il registro intero sta nel repo vero)` };
}

/**
 * Stende sulla copia i file che il lavoro in corso ha cambiato rispetto all ultimo commit — quelli
 * modificati, quelli nuovi mai committati, e le cancellazioni. Torna `null` se e' andata, o il
 * motivo se no: una copia disallineata misura un ALTRO codice, e allora e' meglio non misurare.
 *
 * Serve perche' `git worktree` tira fuori l ultimo commit: senza questo passaggio le corsie
 * proverebbero il codice di ieri mentre tu stai riparando quello di oggi, e direbbero verde su una
 * casa che non e' la tua. Misurato: la prima corsa diceva «file assente» sul file che stavo
 * scrivendo in quel momento.
 */
export function allineaAllAlberoDiLavoro(radice, albero, esegui = spawnSync) {
  const r = esegui("git", ["status", "--porcelain", "-z", "--untracked-files=all"], { cwd: radice, encoding: "utf8" });
  if (r.status !== 0) return `git status non ha risposto (${r.status})`;
  // ⚠️ UN FILE RINOMINATO OCCUPA DUE CAMPI, non uno. Con `-z` git scrive `R. <nuovo>\0<vecchio>\0`:
  // il vecchio percorso arriva come campo a se', SENZA i due caratteri di stato davanti. Leggerlo
  // come un record normale vuol dire tagliargli i primi tre caratteri e copiare un file che non
  // esiste — e allora la corsia si dichiara cieca per un rename innocuo. Trovato riguardando questo
  // file con la lente della sicurezza, prima che succedesse.
  const campi = (r.stdout || "").split("\0").filter(Boolean);
  for (let i = 0; i < campi.length; i++) {
    const voce = campi[i];
    const stato = voce.slice(0, 2);
    const via = voce.slice(3);
    const rinominato = stato.includes("R") || stato.includes("C");
    if (rinominato && i + 1 < campi.length) {
      // Il vecchio nome nella copia non deve restare: nell albero di lavoro quel file non c e' piu'.
      try {
        rmSync(join(albero, campi[i + 1]), { force: true });
      } catch {
        /* non c era: va bene lo stesso */
      }
      i += 1;
    }
    if (!via || via.startsWith(".git/")) continue;
    const dentro = join(albero, via);
    try {
      if (stato.includes("D")) {
        rmSync(dentro, { force: true });
        continue;
      }
      mkdirSync(dirname(dentro), { recursive: true });
      copyFileSync(join(radice, via), dentro);
    } catch (e) {
      return `${via}: ${e.message}`;
    }
  }
  return null;
}

const eseguiCorsia = (comando, argomenti, opzioni) =>
  new Promise((risolvi) => {
    const p = spawn(comando, argomenti, opzioni);
    let fuori = "";
    p.stdout?.on("data", (d) => (fuori += d));
    p.stderr?.on("data", (d) => (fuori += d));
    p.on("error", (e) => risolvi({ codice: null, fuori: `${fuori}\n${e.message}` }));
    p.on("close", (codice) => risolvi({ codice, fuori }));
  });

/**
 * Una copia usa-e-getta del progetto. `git worktree` invece di una copia a mano perche' e' il modo
 * che git conosce: costa poco (condivide gli oggetti), nasce pulita, si butta con un comando.
 * `node_modules` si collega invece di copiarlo — sono gigabyte che nessuna prova modifica.
 */
async function apriCopia(radice, i) {
  const casa = mkdtempSync(join(tmpdir(), `${PREFISSO_CASA}${i}-`));
  const albero = join(casa, "repo");
  const r = await eseguiCorsia("git", ["worktree", "add", "--detach", "--quiet", albero, "HEAD"], { cwd: radice });
  if (r.codice !== 0) {
    if (siPuoButtare(casa)) rmSync(casa, { recursive: true, force: true });
    return { ok: false, perche: `git worktree non ha funzionato: ${r.fuori.trim().split("\n").pop()}` };
  }
  const disallineati = allineaAllAlberoDiLavoro(radice, albero);
  if (disallineati) {
    if (siPuoButtare(casa)) rmSync(casa, { recursive: true, force: true });
    return { ok: false, perche: `non ho potuto riportare nella copia il lavoro in corso: ${disallineati}` };
  }
  for (const dove of ["node_modules", join("pannello", "node_modules")]) {
    const sorgente = join(radice, dove);
    if (!existsSync(sorgente)) continue;
    try {
      symlinkSync(sorgente, join(albero, dove), "dir");
    } catch {
      /* c'era già, o il sistema non li fa: la corsia parte lo stesso e lo dirà lei se le manca */
    }
  }
  return { ok: true, casa, albero };
}

async function chiudiCopia(radice, copia) {
  if (!copia?.ok) return;
  // 🧨 IL FRENO. Non «cancella quello che ti hanno detto»: cancella solo se e' davvero una casa di
  // corsia. Il 4/9 questa riga, senza il freno, ha portato via la cartella del repo.
  if (!siPuoButtare(copia.casa)) {
    console.error(`⛔ non butto «${copia.casa}»: non e' una casa di corsia. Se resta lì, si toglie a mano.`);
    return;
  }
  await eseguiCorsia("git", ["worktree", "remove", "--force", copia.albero], { cwd: radice });
  rmSync(copia.casa, { recursive: true, force: true });
}

/**
 * Fa girare UNA corsia: apre la copia, ci scrive dentro il suo pezzo di registro, lancia il banco e
 * riporta i verdetti. Se qualcosa non parte, le mutazioni escono ⚪ dichiarate — mai perse.
 */
export async function giraCorsia({ radice = AD_ROOT, indice = 0, mutazioni = [], registro = {}, budget = 0 } = {}) {
  const copia = await apriCopia(radice, indice);
  if (!copia.ok) return { esiti: corsiaNonPartita(mutazioni, copia.perche), corsia: indice };
  try {
    writeFileSync(join(copia.albero, "cervello/mutanti.json"), JSON.stringify(registroDiCorsia(registro, mutazioni), null, 1));
    // ⚠️ IL PERCORSO DEL BANCO E' SCRITTO PER ESTESO, e non e' pignoleria. La macchina riconosce
    // «chi esegue chi» leggendo il codice, e una delle forme che sa leggere e' proprio una stringa
    // `"cervello/x.mjs"` dentro un array di argomenti. Passandolo da un parametro il collegamento
    // spariva dai suoi occhi: `non-vacuita.mjs` risultava eseguito solo dalle prove, cioe' un
    // cartello e non un freno, ed e' esattamente l'accusa di AR-393. Misurato: due prove rosse.
    const argomenti = [join(copia.albero, "cervello/non-vacuita.mjs"), "--json"];
    if (budget) argomenti.push("--budget", String(budget));
    // ⚠️ `MUTANTI_FILE` SI CANCELLA. Se il figlio se lo eredita legge QUEL registro invece del suo,
    // e ogni corsia rifa' tutte le mutazioni: misurato, due mutazioni su due corsie davano quattro
    // verdetti. Il registro di una corsia e' il file dentro la sua copia, e non si scavalca da fuori.
    const ambiente = { ...process.env, TMPDIR: copia.casa };
    delete ambiente.MUTANTI_FILE;
    const r = await eseguiCorsia(process.execPath, argomenti, { cwd: copia.albero, env: ambiente });
    try {
      const j = JSON.parse(r.fuori.slice(r.fuori.indexOf("{")));
      return { esiti: j.esiti || [], corsia: indice, codice: r.codice };
    } catch {
      // Il banco non ha parlato JSON: ammazzato, esploso, o partito male. Non so cosa abbia
      // misurato, quindi non ho misurato niente — e lo dico per ognuna, non in blocco.
      return { esiti: corsiaNonPartita(mutazioni, `il banco della corsia non ha risposto (uscita ${r.codice}): ${r.fuori.trim().split("\n").pop() || "nessun messaggio"}`), corsia: indice };
    }
  } finally {
    await chiudiCopia(radice, copia);
  }
}

export async function giraATutteLeCorsie({ radice = AD_ROOT, mutazioni = [], registro = {}, corsie = CORSIE_DI_DEFAULT, budget = 0 } = {}) {
  const fette = dividiInCorsie(mutazioni, corsie);
  const risultati = await Promise.all(fette.map((f, i) => giraCorsia({ radice, indice: i, mutazioni: f, registro, budget })));
  return { ...ricuciEsiti(risultati), corsie: fette.length, perCorsia: fette.map((f) => f.length) };
}

// ── da riga di comando ────────────────────────────────────────────────────────
if (process.argv[1] && process.argv[1].endsWith("banco-a-corsie.mjs")) {
  const arg = (nome, difetto) => {
    const i = process.argv.indexOf(nome);
    return i !== -1 ? process.argv[i + 1] : difetto;
  };
  // Chi ORCHESTRA puo' leggere un registro diverso (le prove ne usano uno finto); chi ESEGUE no.
  const registro = JSON.parse(readFileSync(process.env.MUTANTI_FILE || join(AD_ROOT, "cervello/mutanti.json"), "utf8"));
  const soloDifetti = arg("--difetti", "");
  const chiesti = soloDifetti ? new Set(soloDifetti.split(",").map((s) => s.trim())) : null;
  const mutazioni = (registro.mutanti || []).filter((m) => !chiesti || chiesti.has(m.difetto));
  if (!mutazioni.length) {
    console.error(`banco-a-corsie: nessuna mutazione da provare${soloDifetti ? ` per ${soloDifetti}` : ""} → non posso misurare`);
    process.exit(2);
  }
  const t0 = Date.now();
  const esito = await giraATutteLeCorsie({ mutazioni, registro, corsie: Number(arg("--corsie", CORSIE_DI_DEFAULT)), budget: Number(arg("--budget", 0)) });
  const secondi = ((Date.now() - t0) / 1000).toFixed(1);
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ ok: esito.vacue.length === 0, esiti: esito.esiti }, null, 2));
  } else {
    console.log(`🛣️ BANCO A CORSIE — ${mutazioni.length} mutazioni su ${esito.corsie} corsie (${esito.perCorsia.join(" · ")}) in ${secondi} s`);
    for (const v of esito.vacue) console.log(`  ❌ ${v.difetto} — ${v.nome}\n     ${v.perche}`);
    for (const c of esito.ciechi) console.log(`  ⚪ ${c.difetto} — ${c.nome}\n     ${c.perche}`);
    console.log(
      esito.vacue.length
        ? `❌ ${esito.vacue.length} prova/e resta VERDE col fix rotto: non difende niente.`
        : esito.misurate
          ? `✅ tutte e ${esito.misurate} le mutazioni misurate rendono rosso il loro test.`
          : `⚪ nessuna mutazione è stata misurata: non ho niente da dire su queste prove.`,
    );
    if (esito.ciechi.length) console.log(`⚪ ${esito.ciechi.length} mutazione/i non ha potuto misurare (vedi sopra).`);
  }
  process.exit(esito.codice);
}
