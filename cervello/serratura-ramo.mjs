#!/usr/bin/env node
// 🔒 LA SERRATURA DEL RAMO: c'è, non c'è, o c'è per finta? — card #177.
//
// PERCHÉ ESISTE. La card #177 chiede a Nicola una scelta fra tre strade, e dichiara una cosa che
// non sapeva: «l'impostazione com'è messa adesso non l'ho potuta leggere, GitHub non me la fa
// vedere da qui». Il 7/9 ho riprovato da un'altra porta, ed era vero solo a metà.
//
//   · la porta vecchia (branch protection) → 403, chiusa davvero, su tutti e due i repo;
//   · la porta nuova (rulesets)            → 200, si legge benissimo.
//
// E da quella porta è saltato fuori qualcosa che nessuno sapeva. Sul repo del SITO esiste già una
// regola di ramo che si chiama «Main», creata il 26/5/2026 e mai più toccata. È rotta in tre modi
// insieme, e ognuno da solo basterebbe a renderla inutile:
//
//   ① è SPENTA          (enforcement: "disabled");
//   ② non punta a niente (conditions.ref_name.include è una lista vuota: zero rami protetti);
//   ③ pretende un controllo che NON ESISTE: chiede il contesto «Main», mentre i controlli veri
//      del sito si chiamano «Lint + Typecheck + Build», «Unit tests», e così via.
//
// Il ③ è il più insidioso, perché è quello che morde nel verso sbagliato: se un giorno qualcuno
// accendesse quella regola così com'è, GitHub aspetterebbe per sempre un controllo che non arriva
// mai — e il pulsante «unisci» resterebbe bloccato su ogni PR, senza che nessuno capisca perché.
//
// Sul repo della MACCHINA di regole di ramo non ce n'è nessuna.
//
// COSA FA. Legge, e dice in parole quale delle tre situazioni c'è: chiusa · aperta · finta. I nomi
// dei controlli da pretendere non se li inventa: li legge dalle corse vere sull'ultimo commit di
// main, perché un contesto scritto a mano e sbagliato è esattamente il modo in cui questa cosa si
// rompe.
//
// Uso:
//   node cervello/serratura-ramo.mjs                  # com'è messa, su tutti e due i repo
//   node cervello/serratura-ramo.mjs --json
//   node cervello/serratura-ramo.mjs --istruzioni     # i passi esatti per accendere la B o la C
//   node cervello/serratura-ramo.mjs --pretende chiusa  # rosso se la serratura non c'è (dopo la scelta)
//
// Uscita (contratto guardiani, AR-322): 0 = come atteso · 1 = non come atteso (solo con --pretende)
// · 2 = NON HO POTUTO MISURARE. Il 2 non è un verde.
//
// 🟢 Sola lettura. Accendere la serratura NON lo fa questo comando e non lo faccio io: è la scelta
//    che la card #177 tiene in mano a Nicola, e da qui il permesso di scrivere non ce l'ho comunque.

import { spawnSync } from "node:child_process";

const CHIAVE = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";

export const REPO = {
  sito: "NicolaeRotaru/mycity",
  macchina: "NicolaeRotaru/ad-mycity",
};

// Perché curl e non fetch, e perché la chiave sullo standard input e non fra gli argomenti: stesse
// due ragioni misurate in entrate-senza-cancello.mjs (il proxy, e `ps` che legge gli argomenti).
export function argomentiCurl(url) {
  return ["-sS", "-o", "-", "-w", "\n%{http_code}", "--connect-timeout", "10", "--max-time", "20", "-K", "-", url];
}
export function configCurl(chiave = CHIAVE) {
  return `header = "Authorization: Bearer ${chiave}"\nheader = "Accept: application/vnd.github+json"\n`;
}

/** Chiede a GitHub. Torna { http, corpo } — il 403 NON è un errore qui: è un dato da riportare. */
function chiedi(url) {
  const r = spawnSync("curl", argomentiCurl(url), { encoding: "utf8", input: configCurl(), maxBuffer: 32 * 1024 * 1024 });
  const testo = r.stdout || "";
  const taglio = testo.lastIndexOf("\n");
  const http = Number(testo.slice(taglio + 1).trim()) || 0;
  let corpo = null;
  try {
    corpo = JSON.parse(testo.slice(0, taglio));
  } catch {
    corpo = null;
  }
  return { http, corpo };
}

/**
 * I nomi VERI dei controlli di un repo, letti dalle corse vere.
 *
 * Non è pignoleria: un contesto richiesto che non combacia con nessun controllo reale non rende il
 * ramo più sicuro, lo blocca per sempre. I nomi vanno letti, mai scritti a memoria.
 *
 * E vanno letti da PIÙ DI UN POSTO. Ci sono cascato scrivendo questo file: la prima stesura leggeva
 * solo l'ultimo commit di main, e sulla macchina tornava UN nome solo. Mancava proprio «prove,
 * guardiani e typecheck» — cioè il cancello di cui parla tutta la card #177 — perché quello gira
 * sulle pull request e non sui push. Un elenco costruito così avrebbe fatto pretendere a Nicola il
 * controllo sbagliato: il difetto esatto che questo comando serve a evitare.
 */
export function nomiControlli(...gruppi) {
  const tutti = gruppi.flat().map((c) => c?.name).filter(Boolean);
  return [...new Set(tutti)].sort();
}

/**
 * Il verdetto su una casa. PURA: la provano su dati finti, senza rete e senza chiave.
 *
 * Tre stati, e la differenza fra il secondo e il terzo è tutto il punto della card #177:
 *   · `chiusa` — c'è una regola accesa, che punta a un ramo, e i controlli che pretende esistono;
 *   · `aperta` — non c'è nessuna regola: il cancello parla e chi unisce decide se ascoltarlo;
 *   · `finta`  — la regola c'è, ma è spenta, o non punta a niente, o pretende un fantasma. Da fuori
 *                sembra protetto. Non lo è. È il caso peggiore, perché smette di far domande.
 */
export function esamina({ rulesets = [], controlliVeri = [], entrateSenzaVerde = null } = {}) {
  const motivi = [];
  const diRamo = rulesets.filter(
    (r) => r?.target === "branch" && (r.rules || []).some((x) => x?.type === "required_status_checks"),
  );

  if (diRamo.length === 0) {
    motivi.push("nessuna regola di ramo pretende un controllo: chi unisce decide da solo.");
    if (entrateSenzaVerde) motivi.push(`e infatti ${entrateSenzaVerde} lavori sono entrati su main senza un verde.`);
    return { stato: "aperta", motivi, regole: [] };
  }

  const regole = diRamo.map((r) => {
    const guasti = [];
    if (r.enforcement !== "active") guasti.push("è spenta");
    const punta = r.conditions?.ref_name?.include || [];
    if (punta.length === 0) guasti.push("non punta a nessun ramo");
    const chiesti = (r.rules.find((x) => x.type === "required_status_checks")?.parameters?.required_status_checks || [])
      .map((c) => c.context)
      .filter(Boolean);
    const fantasmi = controlliVeri.length ? chiesti.filter((c) => !controlliVeri.includes(c)) : [];
    if (fantasmi.length) guasti.push(`pretende ${fantasmi.length === 1 ? "un controllo che non esiste" : "controlli che non esistono"}: ${fantasmi.join(", ")}`);
    if (chiesti.length === 0) guasti.push("non pretende nessun controllo");
    return { nome: r.name, id: r.id, chiesti, fantasmi, guasti, sana: guasti.length === 0 };
  });

  if (regole.some((r) => r.sana)) {
    motivi.push(`la regola «${regole.find((r) => r.sana).nome}» è accesa e pretende controlli che esistono.`);
    return { stato: "chiusa", motivi, regole };
  }

  for (const r of regole) motivi.push(`la regola «${r.nome}» ${r.guasti.join(", ")}.`);
  motivi.push("da fuori sembra protetto, e non lo è: è la forma peggiore, perché smette di far domande.");
  if (entrateSenzaVerde) motivi.push(`e infatti ${entrateSenzaVerde} lavori sono entrati su main senza un verde.`);
  return { stato: "finta", motivi, regole };
}

/**
 * Quante regole guardare in faccia, e quante restano fuori — AR-949.
 *
 * Il tetto non è prudenza generica. Questo comando lo esegue `giro.sh`, e `guardiano()` non mette
 * nessun limite di tempo: una richiesta per regola, a 20 secondi l'una, vuol dire che un repo con
 * cinquanta regole terrebbe fermo il battito della macchina per venti minuti. Oggi le regole sono
 * zero e una, quindi il tetto non morde: c'è perché il giorno che qualcuno ne crea trenta, questo
 * strumento non diventi il motivo per cui il giro non finisce più.
 *
 * Ed è PURA e conta cosa resta fuori, apposta: sui due repo veri di regole ce n'è una sola, quindi
 * il caso oltre il tetto non lo si può ricreare con GitHub — servirebbe scrivere sulle impostazioni,
 * cioè proprio la cosa che qui non si fa. Con la funzione pura il caso si prova offline, e
 * `nonGuardate` diventa un numero che il referto DEVE dire: un elenco tagliato raccontato come
 * intero è la bugia che questa macchina passa il tempo a togliersi di dosso.
 */
export const TETTO_REGOLE = 10;
export function regoleDaGuardare(elenco = [], tetto = TETTO_REGOLE) {
  return { guardate: elenco.slice(0, tetto), nonGuardate: Math.max(0, elenco.length - tetto) };
}

const ETICHETTA = {
  chiusa: "🔒 CHIUSA — un lavoro con la prova rossa non entra",
  aperta: "🔓 APERTA — il controllo parla, ma non ferma nessuno",
  finta: "🩹 FINTA — la regola c'è, ma non protegge niente",
};

function istruzioni(casa, repo, controlli) {
  const tre = controlli.filter((c) =>
    /^(Lint \+ Typecheck \+ Build|Unit tests|Controlli database|prove, guardiani|suite del cervello)/.test(c),
  );
  return `
──────────────────────────────────────────────────────────────────────
  ${casa.toUpperCase()} — ${repo}

  Apri:  https://github.com/${repo}/settings/rules
  ${casa === "sito" ? "Dentro c'è già una regola che si chiama «Main». Aprila: non ne serve una nuova." : "Non c'è nessuna regola. Premi «New branch ruleset»."}

  1. Nome:            la serratura di main
  2. Enforcement:     Active            ← è questo che accende tutto
  3. Target branches: Add target → Include default branch
  4. Spunta:          Require status checks to pass
     e aggiungi ESATTAMENTE questi, copiati:
${tre.map((c) => `        · ${c}`).join("\n") || "        (nessun controllo leggibile: non inventarne)"}
  5. Per la STRADA B (tu puoi ancora scavalcare):
        Bypass list → Add bypass → Repository admin → Always
     Per la STRADA C (nessuno scavalca): lascia la Bypass list vuota.
  6. Save changes.

  ⚠️  Se vedi un controllo di nome «Main» già nell'elenco, TOGLILO: non esiste
      nessun controllo che si chiami così, e lasciarlo blocca ogni unione per sempre.`;
}

function main() {
  const argv = process.argv.slice(2);
  const json = argv.includes("--json");
  const vuoleIstruzioni = argv.includes("--istruzioni");
  // `--pretende` senza il valore, o con un valore che non è uno dei tre stati, NON deve passare in
  // silenzio. Trovato riguardando con la lente «cosa succede se»: la prima stesura, davanti a
  // `--pretende chuisa` scritto storto, saltava il confronto e usciva 0. Un guardiano cablato nel
  // giro con un refuso avrebbe detto verde per sempre, senza mai controllare niente — che è
  // esattamente il difetto della card #177 spostato dentro lo strumento che serve a misurarlo.
  const iP = argv.indexOf("--pretende");
  const pretende = iP !== -1 ? argv[iP + 1] : null;
  if (iP !== -1 && !ETICHETTA[pretende]) {
    console.error(`✗ «--pretende ${pretende ?? ""}» non dice niente: gli stati sono ${Object.keys(ETICHETTA).join(", ")}.`);
    process.exit(2);
  }

  if (!CHIAVE) {
    console.error("⚪ nessuna chiave GitHub (GITHUB_TOKEN o GH_TOKEN): non posso guardare, e non fingo di averlo fatto.");
    process.exit(2);
  }

  const referto = {};
  for (const [casa, repo] of Object.entries(REPO)) {
    const rs = chiedi(`https://api.github.com/repos/${repo}/rulesets`);
    const vecchia = chiedi(`https://api.github.com/repos/${repo}/branches/main/protection`);
    if (rs.http !== 200 || !Array.isArray(rs.corpo)) {
      console.error(`⚪ non ho potuto leggere le regole di ${repo} (http ${rs.http}): senza quelle qualunque verdetto sarebbe inventato.`);
      process.exit(2);
    }
    // Le regole arrivano in elenco senza il dettaglio: il dettaglio si chiede una per una, e il
    // tetto su quante chiederne sta in `regoleDaGuardare` (AR-949), col perché scritto lì.
    const { guardate, nonGuardate } = regoleDaGuardare(rs.corpo);
    const intere = guardate.map((r) => {
      const d = chiedi(`https://api.github.com/repos/${repo}/rulesets/${r.id}`);
      return d.http === 200 && d.corpo ? d.corpo : r;
    });
    // Due sorgenti apposta: la testa di main (i controlli che girano sui push) e la testa
    // dell'ultima PR unita (quelli che girano solo sulle pull request). Una sola non basta —
    // vedi il commento su nomiControlli.
    const testa = chiedi(`https://api.github.com/repos/${repo}/commits/main`);
    const perPr = chiedi(`https://api.github.com/repos/${repo}/pulls?state=closed&base=main&sort=updated&direction=desc&per_page=20`);
    const shaPr = (perPr.corpo || []).filter((p) => p?.merged_at).map((p) => p.head?.sha).filter(Boolean).slice(0, 3);
    const teste = [testa.corpo?.sha, ...shaPr].filter(Boolean);
    const gruppi = teste.map((s) => chiedi(`https://api.github.com/repos/${repo}/commits/${s}/check-runs?per_page=100`).corpo?.check_runs || []);
    const controlli = nomiControlli(...gruppi);
    referto[casa] = {
      repo,
      ...esamina({ rulesets: intere, controlliVeri: controlli }),
      controlliVeri: controlli,
      // Un elenco tagliato va DETTO. Un verdetto dato su una parte, raccontato come se fosse sul
      // tutto, è la bugia che questa macchina passa il tempo a togliersi di dosso.
      nonGuardate,
      // La porta vecchia resta chiusa in faccia (403). Va DETTO, non nascosto: il verdetto qui sopra
      // guarda solo le regole nuove. Quello che lo regge lo stesso è il comportamento — i lavori
      // entrati con la prova rossa, che con una serratura vera non sarebbero potuti entrare.
      portaVecchia: vecchia.http === 200 ? "leggibile" : `non leggibile da qui (http ${vecchia.http})`,
    };
  }

  if (json) {
    console.log(JSON.stringify(referto, null, 2));
  } else {
    console.log("🔒 LA SERRATURA DEL RAMO — com'è messa adesso\n");
    for (const [casa, r] of Object.entries(referto)) {
      console.log(`   ${casa.toUpperCase().padEnd(9)} ${r.repo}`);
      console.log(`   ${" ".repeat(9)} ${ETICHETTA[r.stato]}`);
      for (const m of r.motivi) console.log(`   ${" ".repeat(9)} · ${m}`);
      console.log(`   ${" ".repeat(9)} (regole vecchie: ${r.portaVecchia})`);
      console.log(`   ${" ".repeat(9)} controlli veri: ${r.controlliVeri.length}`);
      if (r.nonGuardate) console.log(`   ${" ".repeat(9)} ⚪ ${r.nonGuardate} regole NON guardate (oltre il tetto): il verdetto non le copre`);
      console.log("");
    }
    if (vuoleIstruzioni) {
      console.log("COME ACCENDERLA — la B e la C sono lo stesso modulo, cambia solo il punto 5.");
      for (const [casa, r] of Object.entries(referto)) console.log(istruzioni(casa, r.repo, r.controlliVeri));
    } else {
      console.log("   I passi esatti per accenderla:  node cervello/serratura-ramo.mjs --istruzioni");
    }
  }

  if (pretende) {
    const fuori = Object.entries(referto).filter(([, r]) => r.stato !== pretende);
    if (fuori.length) {
      console.error(`\n❌ atteso «${pretende}», ma ${fuori.map(([c, r]) => `${c} è «${r.stato}»`).join(" e ")}.`);
      process.exit(1);
    }
  }
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
