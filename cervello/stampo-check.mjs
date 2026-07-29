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
// Uso:
//   node cervello/stampo-check.mjs           -> report leggibile
//   node cervello/stampo-check.mjs --json    -> output JSON (gate / sentinelle)
//
// Exit (AR-322): 0 = niente di nuovo · 1 = un difetto NUOVO rispetto al debito dichiarato · 2 = cieco.

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";
import {
  DIFETTO,
  codiceUscita,
  debitoRiparato,
  difettiAgente,
  difettiKit,
  fotocopie,
  nuoviRispettoAlDebito,
  quaderniInPiuCase,
  sogliaSottile,
  statoQuaderno,
} from "./stampo-metro.mjs";

const JSON_MODE = process.argv.includes("--json");
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

  const quadro = {};
  const quaderni = { vivi: 0, vuoti: 0, fermi: 0, assenti: 0 };
  for (const n of roster) {
    const d = [...difettiAgente(readFileSync(join(AGENTS_DIR, `${n}.md`), "utf8"))];
    d.push(...difettiKit({ testo: kitTesto[n] ?? null, bytes: kitBytes[n], soglia, blocchiCopiati: copiati[n] || 0 }));
    const s = statoQuaderno(leggi(join(SQUADRA_DIR, `${n}.md`)), { adessoIso: oggiIso });
    quaderni[s.stato === "vivo" ? "vivi" : s.stato === "vuoto" ? "vuoti" : s.stato === "fermo" ? "fermi" : "assenti"]++;
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
  const guariti = baselineLetta ? debitoRiparato(quadro, baseline) : [];
  const perTipo = {};
  for (const d of Object.values(quadro)) for (const x of d) perTipo[x] = (perTipo[x] || 0) + 1;

  const state = {
    _cosa_e:
      "Guardiano stampo senior: legge il CONTENUTO di mansionario, kit e quaderno di ogni agente e lo confronta col debito dichiarato in cervello/stampo-baseline.json.",
    _cosa_NON_prova:
      "Non prova che un kit sia BUONO né che un ESITO sia vero: misura spessore relativo, fotocopie, struttura e presenza di righe ESITO datate. Un kit lungo e originale può essere sbagliato, e una riga ESITO può contenere un numero inventato — quella parte la giudicano il direttore-creativo e la calibrazione, non questo controllo.",
    aggiornato: quando,
    totale_agenti: roster.length,
    soglia_sottile_byte: soglia,
    quaderni,
    con_difetti: Object.keys(quadro).length,
    senza_difetti: roster.length - Object.keys(quadro).length,
    per_tipo: perTipo,
    debito_dichiarato_il: baseline.dichiarato_il || null,
    nuovi_rispetto_al_debito: nuovi,
    debito_riparato_da_togliere: guariti,
    baseline_letta: baselineLetta,
  };

  const rc = codiceUscita({ cieco: baselineLetta ? 0 : 1, nuovi: nuovi.length });
  const sintesi = nuovi.length
    ? `${nuovi.length} difetti NUOVI oltre il debito dichiarato`
    : `nessun difetto nuovo · debito noto: ${Object.keys(quadro).length}/${roster.length} agenti`;

  if (!PARCO_FINTO) {
    mkdirSync(join(STATE_PATH, ".."), { recursive: true });
    writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + "\n", "utf8");
    await stampSegnale("stampo-check", rc === 0 ? "ok" : "warn", `${sintesi} · ${quando}`);
  }

  if (JSON_MODE) {
    console.log(JSON.stringify(state, null, 2));
  } else {
    console.log(`\n🏗️ STAMPO-CHECK — ${quando}`);
    if (!baselineLetta) {
      console.log(`   ⛔ CIECO: non ho potuto leggere il debito dichiarato (${BASELINE_PATH}) — non è un verde.`);
    } else if (nuovi.length) {
      console.log(`   ⛔ ${nuovi.length} difetti NUOVI rispetto al debito dichiarato il ${baseline.dichiarato_il}:`);
      for (const n of nuovi.slice(0, 20)) console.log(`   • @${n.nome.padEnd(24)} ${n.difetto}`);
    } else {
      console.log(`   ✅ Niente di nuovo. Debito dichiarato il ${baseline.dichiarato_il}, invariato.`);
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

await main();
