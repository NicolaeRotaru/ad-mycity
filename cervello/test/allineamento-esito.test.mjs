#!/usr/bin/env node
// AR-311 / AR-312 / AR-316 — l'allineamento del server non deve dire «fatto» quando non ha fatto niente.
//
// Tre difetti, una radice. Il copione che porta il codice nuovo sul VPS aveva tre modi di mentire:
//
//   AR-311 (bloccante) — se il push dei commit pendenti falliva, stampava un ✗ e TIRAVA DRITTO fino
//     al `checkout -f`, che quei commit li butta. Il lavoro del server spariva per un errore di rete.
//     Un avviso su stderr non è una difesa: è un necrologio.
//   AR-312 — se il fetch falliva, l'allineamento diventava un no-op silenzioso ma il copione usciva 0
//     e watch-main SEGNAVA LO SHA COME VISTO: da lì in poi non ci riprovava più. Il server restava
//     indietro per sempre, dicendo che andava tutto bene.
//   AR-316 — un rinvio è normale (una chat sta lavorando su un ramo). Sei di fila per mezz'ora no:
//     è un worktree bloccato, e nessuno se ne accorge perché ogni singolo rinvio è verde.
//
// La regola che li unisce: **se un passo dell'allineamento non è riuscito, lo SHA non si segna.**
// Segnarlo significa «ho visto questa versione e l'ho applicata». Dirlo senza averlo fatto è la bugia
// che rende il server invisibilmente vecchio.
//
// Qui si eseguono le funzioni VERE di cervello/allineamento-esito.sh.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const SH = join(QUI, "..", "allineamento-esito.sh");
const REPO = join(QUI, "..", "..");
const sh = (cmd) => execFileSync("bash", ["-c", `. "${SH}"; ${cmd}`], { encoding: "utf8" }).trim();

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ── AR-311: il caso in cui proseguire DISTRUGGE del lavoro ───────────────────
prova("il caso che ha rotto: se i commit del server non sono pubblicati, NON si allinea", () => {
  // Il `checkout -f` più avanti li butterebbe. È l'unico dei tre esiti in cui tirare dritto
  // distrugge qualcosa invece di lasciare solo il server indietro.
  assert.equal(sh("esito_allineamento 0 1 0"), "5");
  assert.match(sh("motivo_allineamento 5"), /checkout -f li cancellerebbe/);
});

prova("il push pendenti si valuta PER PRIMO, prima di ogni altra cosa", () => {
  // Anche con un fetch rotto E una chat che lavora, se ci sono commit non pubblicati la risposta
  // dev'essere 5: gli altri due casi sono recuperabili, questo no.
  assert.equal(sh("esito_allineamento 0 0 1"), "5");
});

// ── AR-312: il no-op che si dichiara riuscito ────────────────────────────────
prova("il caso che ha rotto: fetch fallito = non ho scaricato niente, quindi non ho allineato", () => {
  assert.equal(sh("esito_allineamento 1 0 0"), "4");
  assert.match(sh("motivo_allineamento 4"), /non ho scaricato niente/);
});

prova("il lavoro vivo su un ramo resta un rinvio normale, non un errore", () => {
  assert.equal(sh("esito_allineamento 1 1 1"), "3");
  assert.match(sh("motivo_allineamento 3"), /sta lavorando su un ramo/);
});

prova("quando è andato tutto bene, dice 0", () => {
  assert.equal(sh("esito_allineamento 1 1 0"), "0");
});

// ── HEAD staccato (12/8): i file aggiornati, la posizione no ─────────────────
// Il quarto caso della stessa regola, nel passo che nessuno aveva coperto. Il comando che riporta
// HEAD sul ramo finiva con `|| true`: se falliva, il copione aggiornava i FILE da main e dichiarava
// «✓ Allineamento completato», mentre HEAD restava staccato su un commit vecchio.
// Costo reale: due giorni di macchina ferma. La memoria non è uscita per 31 ore (la pubblicazione
// si rifiuta se non sei sul ramo) e due fix già mergiati non sono mai stati caricati dal worker.
prova("il caso che ha rotto: file aggiornati ma HEAD staccato NON è un allineamento", () => {
  assert.equal(
    sh("esito_allineamento 1 1 0 0"),
    "6",
    "aggiornare i file senza spostare la posizione veniva raccontato come riuscito",
  );
  assert.match(sh("motivo_allineamento 6"), /STACCATO/);
  assert.match(sh("motivo_allineamento 6"), /la memoria non si pubblica/);
});

prova("HEAD staccato non fa segnare lo SHA: il server deve riprovare, non rassegnarsi", () => {
  // Segnare lo SHA significa «ho visto questa versione e l'ho applicata»: da quel momento
  // watch-main non ci riprova più, ed è così che il server è rimasto indietro senza dirlo.
  assert.notEqual(sh("watch_azione 6 0"), "segna");
});

prova("chi chiama con tre soli argomenti si comporta come prima", () => {
  // Il quarto argomento è nuovo: se manca, si assume che HEAD sia a posto — altrimenti ogni
  // chiamante non aggiornato comincerebbe a fallire per una domanda che non gli è stata fatta.
  assert.equal(sh("esito_allineamento 1 1 0"), "0");
  assert.equal(sh("esito_allineamento 1 1 1"), "3");
});

prova("il copione dell'allineamento controlla DAVVERO la posizione prima di dire «completato»", () => {
  const src = readFileSync(join(QUI, "..", "vps", "aggiorna-cervello.sh"), "utf8");
  assert.match(src, /_head_ora="\$\(git rev-parse --abbrev-ref HEAD/, "manca il controllo della posizione");
  assert.match(src, /esito_allineamento 1 1 0 0/, "il controllo non porta all'esito «HEAD staccato»");
});

// ── la regola: lo SHA si segna SOLO su un allineamento riuscito ──────────────
prova("il caso che ha rotto: nessun esito diverso da 0 può far segnare lo SHA", () => {
  // Segnare lo SHA significa «ho applicato questa versione». Con rc=4 il server non ha scaricato
  // nulla, con rc=5 non ha allineato apposta: in entrambi i casi segnarlo lo rende invisibilmente
  // vecchio, perché da quel momento non ci riprova più.
  for (const rc of [3, 4, 5]) {
    assert.notEqual(sh(`watch_azione ${rc} 0`), "segna", `rc=${rc} non deve far segnare lo SHA`);
  }
  assert.equal(sh("watch_azione 0 0"), "segna");
});

// ── AR-316: il verde ripetuto all'infinito ───────────────────────────────────
prova("il caso che ha rotto: sei rinvii di fila diventano un allarme, non l'ennesimo verde", () => {
  // Un verde ripetuto all'infinito è indistinguibile da un sistema fermo.
  assert.equal(sh("watch_azione 3 5"), "rimanda", "cinque rinvii: ancora plausibile");
  assert.equal(sh("watch_azione 3 6"), "allarme", "sei ≈ mezz'ora: è un worktree bloccato");
  assert.equal(sh("watch_azione 3 20"), "allarme");
});

prova("il tetto si può alzare, ma non sparire", () => {
  assert.equal(sh("watch_azione 3 6 10"), "rimanda");
  assert.equal(sh("watch_azione 3 10 10"), "allarme");
});

prova("un allineamento riuscito azzera il conto, anche dopo molti rinvii", () => {
  assert.equal(sh("watch_azione 0 99"), "segna", "il rc=0 vince sempre sul contatore");
});

// ── il cablaggio ─────────────────────────────────────────────────────────────
prova("aggiorna-cervello ESCE invece di tirare dritto sui tre casi", () => {
  const src = readFileSync(join(REPO, "cervello/vps/aggiorna-cervello.sh"), "utf8");
  assert.doesNotMatch(src, /\[ "\$_ok_pre" = 1 \] \|\| echo/, "AR-311: un echo non è una difesa, il checkout -f butta i commit");
  // Il difetto NON era «ogni fetch silenziato» — dentro i cicli di riprova `fetch && rebase` va
  // benissimo, il retry è la difesa. Era il fetch seguito da un `checkout -f` CIECO: se il fetch
  // fallisce, FETCH_HEAD resta quello di prima e il ramo viene "allineato" a se stesso, in silenzio.
  assert.doesNotMatch(
    src,
    /git fetch[^\n]*\\\n\s*&& git checkout -f -B/,
    "AR-312: un checkout -f dietro un fetch fallito allinea il ramo a se stesso e dichiara riuscito",
  );
  const uscite = (src.match(/exit "\$_rc_all"/g) || []).length;
  assert.ok(uscite >= 3, `i tre casi devono uscire con un codice, non proseguire (trovate ${uscite})`);
  assert.match(src, /allineamento-esito\.sh/, "le decisioni vengono dal file condiviso");
});

prova("watch-main non segna lo SHA quando l'allineamento non è riuscito", () => {
  const src = readFileSync(join(REPO, "cervello/vps/watch-main.sh"), "utf8");
  assert.match(src, /watch_azione "\$_agg_rc" "\$_rinvii"/, "deve chiedere alla regola condivisa");
  assert.match(src, /RINVII_FILE/, "AR-316: il contatore dei rinvii consecutivi");
  assert.match(src, /rm -f "\$RINVII_FILE"/, "un allineamento riuscito deve azzerare il conto");
  // Il ramo che scrive lo SHA dev'essere raggiungibile SOLO dopo il blocco degli esiti ≠0.
  const iBlocco = src.indexOf('if [ "$_agg_rc" -ne 0 ]');
  const iSha = src.indexOf('echo "$REMOTE_SHA" > "$SHA_FILE"', iBlocco);
  assert.ok(iBlocco > 0 && iSha > iBlocco, "lo SHA si scrive dopo il controllo, non prima");
});

// ─────────────────────────────────────────────────────────────────────────────
// AR-467 · AR-468 · AR-469 — lo stallo del 31/7. Il server ha scritto 1519 commit in 31 ore senza
// pubblicarne uno solo, e nessuna di queste tre decisioni esisteva: il copione tirava dritto.
// ─────────────────────────────────────────────────────────────────────────────

prova("AR-467: con un arretrato non pubblicato NON si fa un altro commit di recupero", () => {
  // È il cuore del ciclo che si autopeggiora: ogni commit in più allontana il ramo, rende il rebase
  // successivo più difficile e prepara il fallimento del giro dopo. 1519 volte di fila.
  assert.equal(sh('deve_committare_recupero 1'), "no");
  assert.equal(sh('deve_committare_recupero 1519'), "no");
});

prova("AR-467: senza arretrato il recupero si fa — il freno non deve spegnere il lavoro normale", () => {
  assert.equal(sh('deve_committare_recupero 0'), "si");
  assert.equal(sh('deve_committare_recupero'), "si", "senza argomento vale zero, non «blocca tutto»");
});

prova("AR-469: una modifica TRACCIATA va messa da parte, altrimenti il rebase non parte", () => {
  assert.equal(sh(`serve_mettere_da_parte ' M cervello/fonti-salute.json'`), "si");
  assert.equal(sh(`serve_mettere_da_parte 'M  file.json'`), "si", "anche già in staging blocca il rebase");
});

prova("AR-469: i file NON tracciati non si toccano — non bloccano il rebase e potrebbero non essere miei", () => {
  assert.equal(sh(`serve_mettere_da_parte '?? .scratch-agent-list.txt'`), "no");
  assert.equal(sh(`serve_mettere_da_parte ''`), "no", "albero pulito: niente da mettere da parte");
});

prova("AR-468: il messaggio nomina la causa VERA quando il rebase non parte", () => {
  const detto = sh(`motivo_push_fallito 'error: cannot rebase: You have unstaged changes.'`);
  assert.match(detto, /non messe in staging/, "deve dire cosa è successo davvero");
  assert.doesNotMatch(detto, /TOKEN|rete/i, "e NON deve mandare a caccia del token: era sano");
});

prova("AR-468: conflitti e push rifiutato sono due cause diverse, e si dicono diverse", () => {
  assert.match(sh(`motivo_push_fallito 'CONFLICT (content): Merge conflict in x.json'`), /conflitti/);
  // Rebase riuscito (uscita vuota) ma push rifiutato: qui sì che ha senso guardare token/rete.
  assert.match(sh(`motivo_push_fallito ''`), /token|rete/i);
});

// 2026-08-16 — sei ore e mezza di macchina ferma con la causa già calcolata e mai uscita di casa.
// Dal Pannello si leggeva «commit del server non pubblicati»: vero, e inutile. «Il rebase ha trovato
// conflitti» e «GitHub ha rifiutato il push» hanno due cure diverse, e chi guarda da fuori non poteva
// sapere quale delle due stesse succedendo senza entrare nel server.
prova("la riga che esce dalla macchina porta la causa specifica, non solo che è fermo", () => {
  const detto = sh(`frase_segnale_allineamento 5 62 'il rebase ha trovato conflitti: vanno risolti a mano'`);
  assert.match(detto, /conflitti/, "la causa vera deve arrivare fuori dal server, non restare nel journal");
  assert.match(detto, /62 giri/, "e con essa da quanto dura, altrimenti non si sa se è un inciampo o un blocco");
});

prova("senza causa nota la riga resta onesta invece di inventarne una", () => {
  const detto = sh(`frase_segnale_allineamento 5 3 ''`);
  assert.match(detto, /commit del server non pubblicati/, "resta il motivo generico");
  assert.doesNotMatch(detto, /causa:/, "e NON si attacca un «causa:» vuoto: indovinare è peggio che tacere (AR-468)");
});

prova("ogni script toccato resta sintatticamente valido", () => {
  // Sono i copioni che portano il codice nuovo sul server: se si rompono, il VPS smette di
  // aggiornarsi e nessuno se ne accorge subito.
  for (const f of ["cervello/vps/aggiorna-cervello.sh", "cervello/vps/watch-main.sh", "cervello/allineamento-esito.sh"]) {
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
