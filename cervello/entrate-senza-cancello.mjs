#!/usr/bin/env node
// 🚪 CHI È ENTRATO SU MAIN SENZA CHE IL CANCELLO L'ABBIA VISTO — AR-825.
//
// PERCHÉ ESISTE. Il 26/8 sono andato a cercare un difetto che credevo di sapere: «il cancello non
// scatta sulle pull request aperte via API». L'ho misurato, e la misura mi ha dato torto — 140 PR su
// 141 il cancello le aveva viste eccome. Il difetto non c'era.
//
// Nello stesso conto però ne è saltato fuori un altro, che non stavo cercando: di quelle 141, DIECI
// sono entrate su main senza un verde. Nove col cancello ROSSO sulla testa, una senza che il cancello
// l'avesse mai vista. Il 7%.
//
// LA RADICE, e non è nel cancello: il cancello funziona: legge, esegue e dice sì o no. Ma quel «no»
// non chiude niente. Su GitHub un controllo ferma un merge SOLO se è dichiarato obbligatorio sul
// ramo, e questo non lo è. Cioè è la stessa malattia di sempre in questa casa — un cancello
// costruito bene e montato su una porta che non ha la serratura — e stavolta è capitata al cancello
// che le altre le trova tutte.
//
// COSA NON FA. Non chiude niente nemmeno lui, e non è una svista: la serratura è una scelta che
// costa. Se il controllo diventa obbligatorio e main è rosso per conto suo, nessuno può più unire
// nemmeno la correzione che lo rimetterebbe verde — il repo si incastra. Quella scelta è di Nicola.
// Questo comando serve a fargliela fare su un numero invece che su una sensazione, e a fare in modo
// che il numero non cresca in silenzio se decide di lasciare le cose come stanno.
//
// Uso:
//   node cervello/entrate-senza-cancello.mjs            # il conto e l'elenco
//   node cervello/entrate-senza-cancello.mjs --json
//   node cervello/entrate-senza-cancello.mjs --tetto 10 # rosso se sono più di 10
//
// Uscita (contratto guardiani, AR-322): 0 = sotto il tetto · 1 = il tetto è stato superato
// · 2 = NON HO POTUTO MISURARE (nessuna chiave, o GitHub non risponde). Il 2 non è un verde.
//
// 🟢 Sola lettura: interroga GitHub e non scrive niente, né su GitHub né qui.

import { spawnSync } from "node:child_process";

const REPO = process.env.ENTRATE_REPO || "NicolaeRotaru/ad-mycity";
const CANCELLO = "cancello-lotto.yml";
const CHIAVE = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";

// Perché `curl` e non il `fetch` di node: in questa casa l'uscita verso internet passa da un proxy
// dichiarato in HTTPS_PROXY, e il fetch di node non lo guarda — torna 401 come se la chiave fosse
// sbagliata. Ci sono cascato scrivendo questo file: il primo errore diceva «401», cioè accusava la
// chiave, e la chiave era giusta. Un messaggio d'errore che punta al posto sbagliato costa più del
// guasto. `curl` il proxy lo legge da sé.
/**
 * Gli argomenti con cui parte curl — e la chiave NON è fra questi, apposta.
 *
 * Trovato riguardando questo file con la lente «cosa succede se». La prima stesura passava la chiave
 * come `-H "Authorization: Bearer ..."` sulla riga di comando. Sembra innocuo perché non c'è nessuna
 * shell di mezzo, e infatti non è un problema di iniezione: è che **gli argomenti di un processo li
 * legge chiunque**, con un `ps` o aprendo /proc. Sul VPS, dove questo comando gira davvero e non è
 * l'unica cosa in esecuzione, quella è la chiave di GitHub regalata a chi passa.
 *
 * La chiave scende quindi nella configurazione che curl legge da dentro (`-K -`), che viaggia sullo
 * standard input e non compare da nessuna parte.
 */
export function argomentiCurl(url) {
  // I due tetti di tempo non sono prudenza generica: sono la conseguenza di dove gira questo comando.
  // L'ho montato dentro `giro.sh`, e `guardiano()` in giro-esito.sh esegue senza nessun tetto — quindi
  // una richiesta che non torna più tiene fermo il battito della macchina, non solo questo controllo.
  // Trovato riguardando il perimetro, non provandolo: il caso non l'ho ricreato con GitHub lento.
  // Peggio possibile adesso: 10 chiamate × 15s = 150s, e poi ⚪ dichiarato.
  return ["-sS", "--fail-with-body", "--connect-timeout", "10", "--max-time", "15", "-K", "-", url];
}

/** La configurazione che porta la chiave, letta da curl sullo standard input. */
export function configCurl(chiave = CHIAVE) {
  return `header = "Authorization: Bearer ${chiave}"\nheader = "Accept: application/vnd.github+json"\n`;
}

function chiedi(percorso) {
  const url = `https://api.github.com/repos/${REPO}${percorso}`;
  const r = spawnSync("curl", argomentiCurl(url), {
    encoding: "utf8",
    input: configCurl(),
    maxBuffer: 128 * 1024 * 1024,
  });
  if (r.status !== 0) throw new Error(`GitHub non ha risposto su ${percorso}: ${(r.stderr || "").trim().split("\n")[0]}`);
  return JSON.parse(r.stdout);
}

/** Le teste che il cancello ha misurato, e con quale esito. Pura: la provano su dati finti. */
export function testeMisurate(corse = []) {
  const per = new Map();
  for (const c of corse) {
    if (!per.has(c.head_sha)) per.set(c.head_sha, []);
    per.get(c.head_sha).push(c.conclusion);
  }
  return per;
}

/**
 * Le PR entrate su main senza un verde del cancello sulla loro testa.
 *
 * Due modi di entrare senza verde, e vanno tenuti distinti perché raccontano guasti diversi:
 *  - `mai_misurata`: nessuna corsa su quella testa — il cancello non l'ha proprio vista;
 *  - `rossa`: il cancello l'ha vista, ha detto no, e il merge è avvenuto lo stesso.
 * Il secondo è il più grave: vuol dire che il verdetto c'era, ed è stato scavalcato.
 */
export function entrateSenzaVerde(pr = [], corse = [], da = "") {
  const misurate = testeMisurate(corse);
  const fuori = [];
  for (const p of pr) {
    if (!p.merged_at) continue;
    if (da && p.merged_at < da) continue;
    const esiti = misurate.get(p.head?.sha);
    if (!esiti) {
      fuori.push({ numero: p.number, sha: p.head?.sha, unita: p.merged_at, come: "mai_misurata", esiti: [] });
    } else if (!esiti.includes("success")) {
      fuori.push({ numero: p.number, sha: p.head?.sha, unita: p.merged_at, come: "rossa", esiti });
    }
  }
  return fuori.sort((a, b) => a.unita.localeCompare(b.unita));
}

/** La finestra misurabile finisce dove finisce lo storico delle corse: prima non SO, non «va bene». */
export function inizioFinestra(corse = []) {
  const date = corse.map((c) => c.created_at).filter(Boolean).sort();
  return date[0] || "";
}

function tutte(percorso, chiave, pagine = 5) {
  const out = [];
  for (let p = 1; p <= pagine; p++) {
    const d = chiedi(`${percorso}${percorso.includes("?") ? "&" : "?"}per_page=100&page=${p}`);
    const lotto = chiave ? d[chiave] || [] : d;
    out.push(...lotto);
    if (lotto.length < 100) break;
  }
  return out;
}

function main() {
  const argv = process.argv.slice(2);
  const json = argv.includes("--json");
  const i = argv.indexOf("--tetto");
  const tetto = i !== -1 ? Number(argv[i + 1]) : null;

  if (!CHIAVE) {
    console.error("⚪ nessuna chiave GitHub (GITHUB_TOKEN o GH_TOKEN): non posso misurare, e non fingo di averlo fatto.");
    console.error("   Non è un guasto — è uno strumento non collegato qui. Sul VPS e in CI la chiave c'è.");
    process.exit(2);
  }

  let corse, pr;
  try {
    corse = tutte(`/actions/workflows/${CANCELLO}/runs`, "workflow_runs");
    pr = tutte("/pulls?state=closed&base=main&sort=updated&direction=desc", null);
  } catch (e) {
    console.error(`⚪ non ho potuto leggere GitHub (${e.message}): senza quei due elenchi qualunque numero sarebbe inventato.`);
    process.exit(2);
  }

  const da = inizioFinestra(corse);
  const unite = pr.filter((p) => p.merged_at && p.merged_at >= da);
  const fuori = entrateSenzaVerde(pr, corse, da);
  const rosse = fuori.filter((f) => f.come === "rossa");
  const mai = fuori.filter((f) => f.come === "mai_misurata");

  if (json) {
    console.log(JSON.stringify({ da, unite: unite.length, fuori, rosse: rosse.length, mai: mai.length }, null, 2));
  } else {
    console.log(`🚪 PR ENTRATE SU MAIN SENZA UN VERDE DEL CANCELLO — finestra dal ${da.slice(0, 10)}\n`);
    console.log(`   Unite su main nella finestra:  ${unite.length}`);
    console.log(`   Entrate senza un verde:        ${fuori.length}  (${((fuori.length / (unite.length || 1)) * 100).toFixed(1)}%)`);
    console.log(`     · il cancello ha detto no, e sono entrate lo stesso:  ${rosse.length}`);
    console.log(`     · il cancello non le ha mai viste:                    ${mai.length}\n`);
    for (const f of fuori) console.log(`   #${String(f.numero).padEnd(5)} ${f.unita.slice(0, 16)}  ${f.come.padEnd(13)} ${String(f.sha).slice(0, 10)}`);
    console.log(`\n   Perché succede: su GitHub un controllo ferma un merge solo se è dichiarato obbligatorio`);
    console.log(`   sul ramo main. Questo non lo è: parla, e chi unisce decide se ascoltarlo.`);
  }

  if (tetto !== null && fuori.length > tetto) {
    console.error(`\n❌ erano ${tetto}, adesso sono ${fuori.length}: il numero è cresciuto.`);
    process.exit(1);
  }
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
