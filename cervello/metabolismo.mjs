#!/usr/bin/env node
// Capacità #30 — IL METABOLISMO. Misura quanto CONSUMA la macchina (token/durata AI per tipo di
// lavoro e per modello) leggendo il consumo reale in auto-coscienza/costo-ai.json, e dice se il
// budget del giorno è largo o sotto pressione. È l'organo che trasforma la quota da vincolo a leva:
// mostra dove va la spesa così si può affamare ciò che costa senza rendere.
//
// 🟢 Sola lettura: legge costo-ai.json (scritto dai giri), NON scrive, NON tocca il mondo.
// Onestà: il token per-run non è sempre misurato (spesso null) → sommo ciò che c'è e uso anche la
// DURATA come proxy, dichiarando la copertura. Nessun numero inventato.
//
// Uso:  node cervello/metabolismo.mjs [--json]
// Exit: 0 = sotto la soglia giornaliera · 1 = soglia superata (o file assente)

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { cardFirmate, coperturaMisura, resa } from "./conto-motore.mjs";

const JSON_MODE = process.argv.includes("--json");
const FILE = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/costo-ai.json");
const CODA = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md");
const FATTI = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/registro-fatti.json");
const FINESTRA_RESA_GIORNI = Number(process.env.RESA_FINESTRA_GIORNI || 30);

// ─────────────────────────────────────────────────────────────────────────────
// AR-202 — IL COSTO DELL'ABBONAMENTO, CON LA SUA FONTE
// ─────────────────────────────────────────────────────────────────────────────
// Nessun numero orfano: la cifra viene dal registro dei fatti (l'unica casa aggiornata, AR-102),
// dal fatto `finanza.costi_infrastruttura` che Nicola ha confermato il 21/7 — «Claude 200». Se
// quel fatto non si legge, la resa resta CIECA: meglio dichiararlo che inventare un denominatore.
function costoAiMensile() {
  const forzato = Number(process.env.MACCHINA_AI_EUR_MESE);
  if (Number.isFinite(forzato) && forzato > 0) return { eur: forzato, fonte: "env MACCHINA_AI_EUR_MESE" };
  try {
    const reg = JSON.parse(readFileSync(FATTI, "utf8"));
    const f = (reg.fatti || []).find((x) => x.id === "finanza.costi_infrastruttura");
    const m = String(f?.valore || "").match(/Claude\s+(\d+)/i);
    if (m) return { eur: Number(m[1]), fonte: `registro-fatti: finanza.costi_infrastruttura (${f.fonte || "senza fonte dichiarata"})` };
  } catch {
    /* registro illeggibile: sotto diventa un cieco dichiarato */
  }
  return { eur: null, fonte: null };
}

function aggrega(voci, chiave) {
  const map = {};
  for (const v of voci) {
    const k = v[chiave] || "?";
    map[k] = map[k] || { runs: 0, token: 0, durata_sec: 0 };
    map[k].runs++;
    map[k].token += v.token || 0;
    map[k].durata_sec += v.durata_sec || 0;
  }
  return Object.entries(map)
    .map(([k, v]) => ({ voce: k, ...v }))
    .sort((a, b) => b.durata_sec - a.durata_sec);
}

function main() {
  const quando = nowPiacenza();
  if (!existsSync(FILE)) {
    const out = { ok: false, quando, errore: "costo-ai.json non trovato" };
    console.log(JSON_MODE ? JSON.stringify(out) : "❌ costo-ai.json non trovato");
    process.exit(2); // AR-859 — 2 = NON HO POTUTO MISURARE. Uscire 1 qui direbbe «ho guardato
    // e ho trovato un problema», che e' falso: senza costo-ai.json non ho guardato niente.
  }
  const j = JSON.parse(readFileSync(FILE, "utf8"));
  const oggi = j.oggi || { voci: [], runs: 0, token_totali: 0, durata_sec_totale: 0 };
  const voci = oggi.voci || [];
  const soglia = j.soglia_giornaliera_token || 0;

  const perTipo = aggrega(voci, "tipo");
  const perModello = aggrega(voci, "modello");
  const conToken = voci.filter((v) => typeof v.token === "number").length;
  const coperturaToken = voci.length ? Math.round((conToken / voci.length) * 100) : 0;
  const topConsumo = perTipo[0] || null;
  // AR-196: si misura sul campo che frena (max reali/stimati), non su `token_totali` — che resta 0
  // finché ogni registrazione passa con --stima, e faceva leggere «0 token» a chi guarda il Pannello.
  const tokGate = typeof oggi.token_per_gate === "number" ? oggi.token_per_gate : null;
  const pctSoglia = soglia && tokGate != null ? +((tokGate / soglia) * 100).toFixed(3) : null;
  const sopraSoglia = soglia && tokGate != null ? tokGate > soglia : false;
  // Il numero che si STAMPA è lo stesso su cui si frena, così la frazione torna. Se è tutto stimato
  // lo si dice qui invece di far leggere uno zero che non è uno zero.
  const tokenMostrati = tokGate != null ? tokGate : oggi.token_totali;
  const notaStima = tokGate != null && oggi.token_totali === 0 ? " (stimati)" : "";

  // ── AR-203 — quanto di questo conto è MISURATO e quanto è il pavimento ────────────────────────
  // «245.000 token oggi» non significa niente se sono quattro pavimenti e due cronometri. Qui il
  // conto dichiara la propria qualità, e le STIME GEMELLE (due corsie diverse con lo stesso identico
  // numero) vengono nominate una per una: è il sintomo del pavimento, reso visibile.
  const misura = coperturaMisura(voci);

  // ── AR-202 — il valore, contato ───────────────────────────────────────────────────────────────
  // Il risultato di un giro non è un'opinione: è una card che Nicola ha firmato, con la data della
  // chiusura, scritta in chiaro nella coda da mesi. Mancava solo qualcuno che la contasse.
  const costo = costoAiMensile();
  let firmate = [];
  try {
    firmate = cardFirmate(readFileSync(CODA, "utf8"));
  } catch {
    firmate = [];
  }
  const laResa = resa({
    risultati: firmate,
    oggi: quando.slice(0, 10),
    finestraGiorni: FINESTRA_RESA_GIORNI,
    burnMensileEur: costo.eur,
    runs: oggi.runs,
  });

  const out = {
    ok: !sopraSoglia,
    quando,
    fonte: "auto-coscienza/costo-ai.json (consumo reale dei giri)",
    qualita_misura: misura, // AR-203
    resa: { ...laResa, costo_mensile_eur: costo.eur, fonte_costo: costo.fonte }, // AR-202
    oggi: {
      data: oggi.data,
      runs: oggi.runs,
      token_totali: oggi.token_totali,
      token_per_gate: tokGate, // AR-196: il numero su cui si frena (max reali/stimati); null = non misurato
      durata_sec_totale: oggi.durata_sec_totale,
      soglia_token: soglia,
      pct_soglia: pctSoglia,
      copertura_token_pct: coperturaToken,
    },
    per_organo: perTipo,
    per_modello: perModello,
    top_consumo: topConsumo,
    sopra_soglia: sopraSoglia,
    storico_giorni: j.storico_giorni || [],
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
    process.exit(out.ok ? 0 : 1);
  }

  console.log(`🪙 Il Metabolismo — ${quando}   (consumo reale della macchina)\n`);
  // AR-572 — la percentuale e il suo numeratore devono venire dallo STESSO campo. AR-196 aveva
  // spostato il CALCOLO sul campo che frena (`token_per_gate`) ma lasciato la STAMPA su
  // `token_totali`, che resta 0 finché tutto è stimato: usciva «0/2000000 token = 27.5%», una
  // frazione impossibile stampata a Nicola. Una riga che si contraddice da sola insegna a non
  // fidarsi di tutte le altre.
  console.log(`   Oggi (${oggi.data}): ${oggi.runs} run · ${tokenMostrati} token${notaStima} · ${oggi.durata_sec_totale}s`);
  if (pctSoglia != null) console.log(`   Budget giornaliero: ${tokenMostrati}/${soglia} token = ${pctSoglia}% della soglia`);
  // AR-203: questa riga diceva «copertura misura 100%» contando i run che hanno UN NUMERO — non
  // quelli il cui numero è una misura. Con tutte le voci a `--stima` faceva 100% ed era falso.
  console.log(`   Run con un numero accanto: ${coperturaToken}% (gli altri hanno solo la durata)\n`);
  // AR-203 — la qualità del conto, detta prima dei numeri che ci poggiano sopra.
  console.log(`   Di questi run: ${misura.misurati} col numero VERO della CLI · ${misura.stimati} stimati · ${misura.al_pavimento} fermi al pavimento (${50000} token secchi)`);
  if (misura.gemelle.length) {
    console.log(`   ⚠️  ${misura.gemelle.length} numero/i identico/i su corsie DIVERSE — quel numero non sta misurando il lavoro, sta misurando il pavimento:`);
    for (const g of misura.gemelle.slice(0, 4)) console.log(`      • ${g.token} token uguali per: ${g.tipi.join(", ")} (${g.quante} run)${g.e_il_pavimento ? " ← è esattamente il pavimento" : ""}`);
  }
  // AR-202 — e finalmente il denominatore: quanto rende.
  console.log(`\n   💶 Resa (ultimi ${laResa.finestra_giorni} giorni): ${laResa.motivo}`);
  if (costo.fonte) console.log(`      fonte del costo: ${costo.fonte}`);
  console.log("");
  console.log(`   Consumo per organo (tipo di lavoro), dal più pesante:`);
  for (const t of perTipo) console.log(`     • ${t.voce.padEnd(18)} ${t.runs} run · ${t.token} token · ${t.durata_sec}s`);
  console.log(`   Consumo per modello:`);
  for (const m of perModello) console.log(`     • ${m.voce.padEnd(18)} ${m.runs} run · ${m.token} token · ${m.durata_sec}s`);
  console.log("");
  if (sopraSoglia) console.log(`   🔴 SOPRA SOGLIA: taglia il volume (mai verità e sicurezza).`);
  else console.log(`   ✅ Budget largo oggi (${pctSoglia}% della soglia): margine per lavorare.`);
  if (topConsumo) console.log(`   👉 L'organo più costoso oggi: "${topConsumo.voce}" (${topConsumo.durata_sec}s su ${oggi.durata_sec_totale}s).`);
  process.exit(out.ok ? 0 : 1);
}

main();
