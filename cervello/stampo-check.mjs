#!/usr/bin/env node
// Guardiano dello stampo senior (dimensione vettori-installati / «Come pensa l'AD»).
//
// AR-129 · AR-287 · AR-289 — fino al 28/7 questo guardiano diceva «120/120 senior completi» e non
// poteva dire altro. Contava `existsSync` sul quaderno (e un foglio bianco esiste: 72 su 120 non
// avevano MAI una riga ESITO) e misurava i kit con un pavimento a 5.200 byte scelto 82 byte sotto il
// file più piccolo del parco — una soglia tarata sul risultato voluto, non sulla profondità.
//
// Adesso il metro legge il CONTENUTO (`cervello/stampo-metro.mjs`, puro, provato su parchi finti) e la
// soglia dello spessore è **relativa alla mediana**: se i kit migliorano, sale da sola.
//
// Il debito che il metro nuovo vede oggi è dichiarato per NOME in `cervello/stampo-baseline.json`: il
// guardiano parte verde e fallisce sul primo nome che sporca. Un cancello che nasce rosso su mezzo
// parco viene disattivato entro la settimana — e allora non protegge niente.
//
// 🟢 Sola lettura + scrittura su auto-coscienza/stampo-check.json
//
// AR-464 — VERIFICARE NON DEVE COSTARE UN DIFF. Questo guardiano riscriveva il suo stato a ogni
// esecuzione, anche quando l'unica riga diversa era `aggiornato`. Chi lo lanciava per controllare il
// proprio lavoro si ritrovava un file modificato che non era suo, e da lì impara a non lanciarlo: un
// controllo che costa un diff si smette di fare, e un controllo che si smette di fare è spento.
// `--sola-lettura` calcola e stampa il verdetto vero senza toccare né il file né il segnale.
//
// Uso:
//   node cervello/stampo-check.mjs           -> report leggibile
//   node cervello/stampo-check.mjs --json    -> output JSON (gate / sentinelle)
//   node cervello/stampo-check.mjs --sola-lettura -> guarda e non tocca niente
//
// Exit (AR-322): 0 = niente di nuovo · 1 = un difetto NUOVO rispetto al debito dichiarato · 2 = cieco.

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";
// AR-464 — la penna condivisa, che consulta il freno della memoria (`cervello/casa-memoria.mjs`).
import { scriviJsonAtomico } from "./scrivi-json.mjs";
import {
  DIFETTO,
  classificaNuovi,
  codiceUscita,
  debitoRiparato,
  difettiAgente,
  difettiKit,
  fotocopie,
  fotocopieMansionari,
  nuoviRispettoAlDebito,
  quaderniInPiuCase,
  sogliaSottile,
  statoQuaderno,
} from "./stampo-metro.mjs";
import { decidiScrittura, timbroProvenienza } from "./scrittura-misura.mjs";

const JSON_MODE = process.argv.includes("--json");
/** AR-464 — «guarda ma non toccare»: chi verifica non lascia impronte nella memoria condivisa. */
const SOLA_LETTURA = process.argv.includes("--sola-lettura");
// Le prove misurano parchi FINTI (una cartella temporanea con due agenti) per verificare che il
// guardiano sappia dire di no. In quel caso non si scrive la misura vera in auto-coscienza e non si
// stampa il segnale: un parco di prova non deve poter sporcare la fotografia che il Pannello mostra.
const PARCO_FINTO = Boolean(process.env.STAMPO_AGENTS_DIR);
const AGENTS_DIR = process.env.STAMPO_AGENTS_DIR || join(AD_ROOT, ".claude/agents");
const KIT_DIR = process.env.STAMPO_KIT_DIR || join(AD_ROOT, "MyCity-Vault/07-Agenti/kit");
const SQUADRA_DIR = process.env.STAMPO_SQUADRA_DIR || join(AD_ROOT, "memoria-squadra");
const BASELINE_PATH = process.env.STAMPO_BASELINE || join(AD_ROOT, "cervello/stampo-baseline.json");
const STATE_PATH = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/stampo-check.json");

const leggi = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);

function agenti() {
  if (!existsSync(AGENTS_DIR)) return [];
  return readdirSync(AGENTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => basename(f, ".md"))
    .sort();
}

/**
 * AR-342 — le cartelle dove un quaderno POTREBBE vivere, con i nomi che ci trova.
 *
 * La casa vera è `SQUADRA_DIR`; l'altra è quella che il 29/7 conteneva quattro copie ferme da
 * settimane. Restano entrambe nell'elenco apposta: il guardiano deve continuare a guardare anche
 * dove le copie NON devono più esserci, altrimenti si accorge del ritorno solo quando qualcuno
 * ricapita lì per caso.
 */
const CASA_ALTERNATIVA = process.env.STAMPO_SQUADRA_DIR_ALT || join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/memoria-squadra");
const CASE_POSSIBILI = [SQUADRA_DIR, CASA_ALTERNATIVA];

function caseDeiQuaderni() {
  const per = {};
  for (const dir of CASE_POSSIBILI) {
    if (!existsSync(dir)) continue;
    per[dir] = readdirSync(dir)
      .filter((f) => f.endsWith(".md") && f !== "README.md")
      .map((f) => basename(f, ".md"));
  }
  return per;
}

async function main() {
  const quando = nowPiacenza();
  const oggiIso = quando.slice(0, 10);
  const roster = agenti();

  // CIECO, non verde: se non c'è niente da misurare il guardiano non ha misurato (AR-322).
  if (!roster.length) {
    console.error("⛔ STAMPO-CHECK CIECO: nessun agente da leggere in " + AGENTS_DIR);
    process.exit(2);
  }

  let baseline = {};
  let baselineLetta = true;
  try {
    baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
  } catch {
    baselineLetta = false;
  }

  // Il parco dei kit prima di giudicare i singoli: la soglia dello spessore e la caccia alle fotocopie
  // sono misure RELATIVE — hanno senso solo guardando tutti insieme.
  const kitTesto = {};
  const kitBytes = {};
  for (const n of roster) {
    const p = join(KIT_DIR, `${n}-KIT.md`);
    if (!existsSync(p)) continue;
    kitTesto[n] = readFileSync(p, "utf8");
    kitBytes[n] = statSync(p).size;
  }
  const soglia = sogliaSottile(Object.values(kitBytes));
  const copiati = fotocopie(kitTesto);

  // AR-436 — le fotocopie anche fra MANSIONARI, non solo fra kit. La caccia era già scritta e non la
  // chiamava nessuno: `difettiAgente` non riceveva `blocchiCopiati`, quindi quel difetto non poteva
  // comparire nel rapporto nemmeno esistendo. Un modulo importato e mai chiamato somiglia moltissimo
  // a una difesa attiva — ed è la metà del fix che salta più facilmente, perché arriva quando il
  // lavoro sembra finito. Sul parco vero oggi non cambia niente (zero mansionari fotocopia): è un
  // canarino, non un debito. Guarda la sola scheda mestiere: la Carta del Dipendente è condivisa
  // apposta, e contarla come copia boccerebbe tutti e 120 per un testo che DEVE essere uguale.
  const testiAgenti = Object.fromEntries(roster.map((n) => [n, readFileSync(join(AGENTS_DIR, `${n}.md`), "utf8")]));
  const copiatiAgenti = fotocopieMansionari(testiAgenti);

  const quadro = {};
  const quaderni = { vivi: 0, vuoti: 0, fermi: 0, assenti: 0 };
  // L'ultimo esito di ognuno serve DOPO, per sapere se un quaderno fermo è fermo da sempre o se
  // qualcuno gli ha appena tolto delle righe: sono due cose diverse e finora erano lo stesso numero.
  const ultimoOggi = {};
  for (const n of roster) {
    const d = [...difettiAgente(testiAgenti[n], { blocchiCopiati: copiatiAgenti[n] || 0 })];
    d.push(...difettiKit({ testo: kitTesto[n] ?? null, bytes: kitBytes[n], soglia, blocchiCopiati: copiati[n] || 0 }));
    const s = statoQuaderno(leggi(join(SQUADRA_DIR, `${n}.md`)), { adessoIso: oggiIso });
    quaderni[s.stato === "vivo" ? "vivi" : s.stato === "vuoto" ? "vuoti" : s.stato === "fermo" ? "fermi" : "assenti"]++;
    if (s.ultimo) ultimoOggi[n] = s.ultimo;
    if (s.difetto) d.push(s.difetto);
    if (d.length) quadro[n] = d;
  }

  // AR-342 — un quaderno ha UNA casa. Il difetto entra nel quadro come tutti gli altri, quindi passa
  // dallo stesso debito dichiarato: se un giorno una seconda cartella servisse davvero, si dichiara
  // in stampo-baseline.json con il motivo, invece di comparire in silenzio.
  const doppie = quaderniInPiuCase(caseDeiQuaderni());
  for (const q of doppie) {
    (quadro[q.nome] ||= []).push(DIFETTO.QUADERNO_DUE_CASE);
  }

  const nuovi = baselineLetta ? nuoviRispettoAlDebito(quadro, baseline) : [];
  // AR-472 — un difetto che è maturato da solo (il calendario, la mediana del parco) non è una
  // regressione di chi passa di lì: si conta e si dichiara, ma non blocca. Il perché sta in
  // `classificaNuovi`, dentro stampo-metro.mjs, dove un test lo può eseguire.
  const { regressioni, invecchiati } = classificaNuovi(nuovi, { ultimoOggi, kitBytesOggi: kitBytes, baseline });
  const guariti = baselineLetta ? debitoRiparato(quadro, baseline) : [];
  const perTipo = {};
  for (const d of Object.values(quadro)) for (const x of d) perTipo[x] = (perTipo[x] || 0) + 1;

  const state = {
    _cosa_e:
      "Guardiano stampo senior: legge il CONTENUTO di mansionario, kit e quaderno di ogni agente e lo confronta col debito dichiarato in cervello/stampo-baseline.json.",
    _cosa_NON_prova:
      "Non prova che un kit sia BUONO né che un ESITO sia vero: misura spessore relativo, fotocopie, struttura e presenza di righe ESITO datate. Un kit lungo e originale può essere sbagliato, e una riga ESITO può contenere un numero inventato — quella parte la giudicano il direttore-creativo e la calibrazione, non questo controllo.",
    aggiornato: quando,
    // AR-568 (a) · AR-286 — DA DOVE viene la misura e QUANTI agenti ha davvero letto. Un parco di
    // prova con due agenti e il parco vero con centoventi producevano finora lo stesso genere di
    // documento: senza la copertura non c'era modo di accorgersi che il secondo era stato
    // sostituito dal primo.
    ...timbroProvenienza({ env: process.env, copertura: roster.length, scrittoDa: "stampo-check.mjs" }),
    totale_agenti: roster.length,
    soglia_sottile_byte: soglia,
    quaderni,
    con_difetti: Object.keys(quadro).length,
    senza_difetti: roster.length - Object.keys(quadro).length,
    per_tipo: perTipo,
    _come_si_leggono_i_nuovi:
      "AR-472 — `nuovi_rispetto_al_debito` è la somma: tutto ciò che non era nel debito dichiarato. Non è il verdetto. Il verdetto sono le `regressioni` (qualcuno ha peggiorato il suo pezzo: righe di esito sparite, kit rimpicciolito → il guardiano esce 1) separate dagli `invecchiati` (il pezzo è intatto, si è mosso il metro attorno: i 30 giorni del calendario, la mediana del parco → si contano e non bloccano). Chi conta la lista intera per decidere legge 12 difetti nuovi dove non c'è nessun autore.",
    debito_dichiarato_il: baseline.dichiarato_il || null,
    nuovi_rispetto_al_debito: nuovi,
    regressioni,
    invecchiati,
    debito_riparato_da_togliere: guariti,
    baseline_letta: baselineLetta,
  };

  const rc = codiceUscita({ cieco: baselineLetta ? 0 : 1, nuovi: regressioni.length });
  const sintesi = regressioni.length
    ? `${regressioni.length} regressioni oltre il debito dichiarato`
    : `nessuna regressione · ${invecchiati.length} invecchiati · debito noto: ${Object.keys(quadro).length}/${roster.length} agenti`;

  // AR-464 · AR-568 — la scrittura passa dalla decisione condivisa: `--sola-lettura` chiude la
  // porta, e una misura più povera presa da un altro punto d'osservazione non prende il posto di
  // una più ricca. Il segnale è una scrittura come le altre e segue la stessa porta.
  let precedente = null;
  let leggibile = true;
  // Un errore di lettura NON diventa «non c'era niente prima»: si dichiara.
  try {
    if (!PARCO_FINTO && existsSync(STATE_PATH)) precedente = JSON.parse(readFileSync(STATE_PATH, "utf8"));
  } catch {
    leggibile = false;
  }
  const scelta = decidiScrittura({ solaLettura: PARCO_FINTO || SOLA_LETTURA, misuraNuova: state, misuraVecchia: precedente, vecchiaLeggibile: leggibile });
  if (scelta.scrivi) {
    // La penna passa dal writer condiviso: `--sola-lettura` ferma chi lo digita, il freno sul dato
    // (`cervello/casa-memoria.mjs`) ferma anche chi non sa di essere stato lanciato da una prova.
    scriviJsonAtomico(STATE_PATH, state);
    await stampSegnale("stampo-check", rc === 0 ? "ok" : "warn", `${sintesi} · ${quando}`);
  }

  if (JSON_MODE) {
    console.log(JSON.stringify(state, null, 2));
  } else {
    console.log(`\n🏗️ STAMPO-CHECK — ${quando}`);
    if (!baselineLetta) {
      console.log(`   ⛔ CIECO: non ho potuto leggere il debito dichiarato (${BASELINE_PATH}) — non è un verde.`);
    } else if (regressioni.length) {
      console.log(`   ⛔ ${regressioni.length} REGRESSIONI rispetto al debito dichiarato il ${baseline.dichiarato_il}:`);
      for (const n of regressioni.slice(0, 20)) console.log(`   • @${n.nome.padEnd(24)} ${n.difetto} — ${n.perche}`);
    } else {
      console.log(`   ✅ Nessuna regressione. Debito dichiarato il ${baseline.dichiarato_il}.`);
    }
    // Gli invecchiati non bloccano, ma non si nascondono: un debito che si allarga in silenzio è
    // indistinguibile da un debito che non c'è.
    if (invecchiati.length) {
      console.log(`\n   ⏳ ${invecchiati.length} peggiorati DA SOLI (si è mosso il metro, non l'agente) — contano, non bloccano:`);
      for (const n of invecchiati.slice(0, 20)) console.log(`   • @${n.nome.padEnd(24)} ${n.difetto} — ${n.perche}`);
      console.log(`   → Rientrano solo se quei reparti chiudono il loop: node cervello/chiusura-loop.mjs --sonda`);
    }
    console.log(
      `\n   Parco: ${roster.length} agenti · soglia spessore kit ${soglia}B (40% della mediana) · ` +
        `quaderni ${quaderni.vivi} vivi, ${quaderni.vuoti} mai scritti, ${quaderni.fermi} fermi`,
    );
    if (Object.keys(perTipo).length) {
      console.log(`   Debito per tipo:`);
      for (const [k, v] of Object.entries(perTipo).sort((a, b) => b[1] - a[1])) console.log(`   • ${k}: ${v}`);
    }
    if (guariti.length) {
      console.log(`\n   🎉 Guariti (da togliere da stampo-baseline.json): ${guariti.length}`);
      for (const g of guariti.slice(0, 10)) console.log(`   • @${g.nome.padEnd(24)} ${g.difetto}`);
    }
  }

  process.exit(rc);
}

// AR-680 — il programma parte solo se qualcuno LANCIA questo file, non se qualcuno lo importa.
// Senza questa guardia, importare il modulo per leggerne una funzione ne esegue il gate (e qui il
// gate finisce con `process.exit`, quindi si porta dietro anche chi l'ha importato): è la malattia
// censita `programma-che-parte-importando`. Il difetto era ereditato; toccando il file in questo
// lotto diventa mio, e nessun tetto assolve un rosso che il lotto sta toccando adesso.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
