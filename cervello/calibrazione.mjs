#!/usr/bin/env node
// 🎯 CALIBRAZIONE — il motore che CHIUDE l'anello sulla realtà (upgrade U3).
// 🟢 Sola lettura sul mondo esterno: scrive solo auto-coscienza/calibrazione.json nel vault.
//
// Trasforma il "faccio→propongo" in "prevedo→agisco→misuro→imparo": ogni mossa importante
// registra un EFFETTO PREVISTO (metrica, valore atteso, entro quando); quando l'esito è noto,
// si confronta col REALE e il reparto guadagna/perde autonomia. È ciò che rende la macchina
// capace di imparare dai RISULTATI, non solo dai propri prompt (tasso_applicazione reale).
//
// Uso:
//   node cervello/calibrazione.mjs prevedi --reparto=@growth --azione="win-back 4 carrelli" \
//        --metrica=ordini --atteso=1 --entro=2026-07-09 [--nota="..."] [--id=...]
//   node cervello/calibrazione.mjs esito   --id=<id> --reale=2 --fonte="Supabase MCP" [--nota="..."]
//   node cervello/calibrazione.mjs scadute            # marca 'scaduta' le previsioni oltre 'entro' senza esito
//   node cervello/calibrazione.mjs report [--json]    # tabella per-reparto + previsioni aperte
//
// Regola "azzeccata": |reale - atteso| / max(|atteso|,1) <= tolleranza (default 0.25).
// Autonomia: punteggio >= 0.7 alta · >= 0.4 media · altrimenti bassa (min 3 previsioni chiuse).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const VAULT = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");
const PATH = join(VAULT, "calibrazione.json");
const CECITA_PATH = join(VAULT, "sensori-cecita.json"); // AR-061
const REGISTRO_REALTA_PATH = join(VAULT, "registro-realta.json"); // AR-062
const TOLLERANZA_DEFAULT = 0.25;
const MIN_PER_AUTONOMIA = 3;
// AR-065: campione minimo per concedere autonomia "alta" (3 esiti sono troppo pochi per fidarsi).
const MIN_CAMPIONE_ALTA = 8;

// AR-065: lower-bound di Wilson (one-sided, z≈1.2816 → confidenza 90%) sulla proporzione di azzeccate.
// Penalizza i campioni minuscoli: con pochi esiti l'intervallo di confidenza è largo e il lower_bound
// crolla, così "ha azzeccato spesso" non basta — serve che sia SOLIDO. Evita l'autonomia "alta" al buio.
function wilsonLowerBound(azzeccate, previsioni, z = 1.2816) {
  if (previsioni <= 0) return 0;
  const p = azzeccate / previsioni;
  const z2 = z * z;
  const denom = 1 + z2 / previsioni;
  const centro = p + z2 / (2 * previsioni);
  const margine = z * Math.sqrt((p * (1 - p) + z2 / (4 * previsioni)) / previsioni);
  return Math.max(0, (centro - margine) / denom);
}

function arg(name, def = undefined) {
  const pref = `--${name}=`;
  const a = process.argv.find((x) => x.startsWith(pref));
  return a ? a.slice(pref.length) : def;
}

function readJsonSafe(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

// AR-062: fonti ammesse per un esito misurato ("nessun numero senza fonte").
function fontiAmmesse() {
  const reg = readJsonSafe(REGISTRO_REALTA_PATH, {});
  const f = reg?.numeri_da_non_inventare?.fonti_ammesse;
  return Array.isArray(f) && f.length
    ? f
    : ["Supabase MCP", "Stripe MCP", "PostHog", "documento firmato", "conferma di Nicola", "chiusura-loop ESITO"];
}

// AR-061: stato di cecità dei sensori-dati + quota ciechi (>=2/3 → misura del 'reale' inaffidabile).
function statoSensori() {
  const cec = readJsonSafe(CECITA_PATH, {});
  const sensori = cec?.sensori || {};
  const chiavi = Object.keys(sensori);
  const tot = Number(cec?.meta?.sensori_totali ?? chiavi.length) || 0;
  let ciechi = 0;
  for (const k of chiavi) if (sensori[k]?.stato === "cieco") ciechi += 1;
  return { sensori, ciechi, tot, quotaCiechiAlta: tot > 0 && ciechi / tot >= 2 / 3 };
}

// AR-061: mappa la fonte di un esito al sensore automatico corrispondente e ne legge lo stato.
function sensoreStatoPerFonte(fonte) {
  const { sensori } = statoSensori();
  const mappa = {
    "Supabase MCP": ["mcp_supabase", "supabase_rest"],
    "Stripe MCP": ["stripe_api"],
    PostHog: ["posthog"],
  };
  const chiavi = mappa[fonte];
  if (!chiavi) return "n/d"; // fonti umane (documento firmato, conferma di Nicola): non da sensore automatico
  if (chiavi.some((k) => sensori[k]?.stato === "ok")) return "ok";
  if (chiavi.some((k) => sensori[k])) return "cieco";
  return "sconosciuto";
}

function readCalibrazione() {
  const base = {
    _cosa_e:
      "🎯 CALIBRAZIONE — confronto previsto-vs-reale per reparto. Chi azzecca guadagna autonomia. La riempie cervello/calibrazione.mjs (upgrade U3, anello chiuso). Schema in cervello/auto-coscienza.md.",
    aggiornato: nowPiacenza(),
    per_reparto: [],
    registro: [],
  };
  if (!existsSync(PATH)) return base;
  try {
    const j = JSON.parse(readFileSync(PATH, "utf8"));
    j.per_reparto = Array.isArray(j.per_reparto) ? j.per_reparto : [];
    j.registro = Array.isArray(j.registro) ? j.registro : [];
    j._cosa_e = base._cosa_e;
    return j;
  } catch {
    return base;
  }
}

// AR-044: previsioni status-quo (es. «N numeri invariati») non gonfiano l'autonomia.
const RE_PREVISIONE_BANALE = /invariati|status[- ]quo|numeri fermi|nessun camb/i;

function isPrevisioneBanale(entry, reale) {
  if (entry.banale === true) return true;
  const testo = `${entry.azione || ""} ${entry.metrica || ""} ${entry.nota || ""}`;
  if (entry.atteso === 0 && reale === 0) return true;
  if (RE_PREVISIONE_BANALE.test(testo) && entry.atteso === reale) return true;
  return false;
}

function aggiornaNota(data) {
  const chiuse = data.registro.filter((e) => e.stato === "azzeccata" || e.stato === "mancata").length;
  const aperte = data.registro.filter((e) => e.stato === "aperta").length;
  const banali = data.registro.filter((e) => e.banale && (e.stato === "azzeccata" || e.stato === "mancata")).length;
  if (chiuse === 0 && aperte === 0) {
    data._nota = "Nessuna previsione strutturata ancora — usa calibrazione.mjs prevedi/esito.";
  } else {
    data._nota = `${chiuse} chiuse · ${aperte} aperte${banali ? ` · ${banali} banali (escluse dall'autonomia)` : ""} — registro gestito da calibrazione.mjs.`;
  }
}

const STATI_VALIDI = new Set(["aperta", "scaduta", "azzeccata", "mancata"]);

// AR-040: il registro attivo accetta SOLO voci strutturate (id + stato valido). Le voci prosa vanno in registro_legacy.
function assertRegistroStrutturato(data) {
  const legacy = (data.registro || []).filter((e) => !e.id || !STATI_VALIDI.has(e.stato));
  if (legacy.length) {
    console.error(
      `❌ AR-040: ${legacy.length} voce/i legacy nel registro attivo — esegui archivia-legacy, non scrivere a mano nel JSON.`
    );
    process.exit(1);
  }
}

function write(data) {
  assertRegistroStrutturato(data);
  data.aggiornato = nowPiacenza();
  aggiornaNota(data);
  mkdirSync(dirname(PATH), { recursive: true });
  writeFileSync(PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function normReparto(r) {
  if (!r) return "";
  return r.startsWith("@") ? r : `@${r}`;
}

// Ricalcola gli aggregati per_reparto dal registro (unica fonte di verità).
function ricalcolaReparti(data) {
  const { quotaCiechiAlta } = statoSensori(); // AR-061
  const perRep = new Map();
  for (const e of data.registro) {
    if (!e.reparto) continue;
    const cur = perRep.get(e.reparto) || { reparto: e.reparto, previsioni: 0, azzeccate: 0 };
    if (e.stato === "azzeccata" || e.stato === "mancata") {
      // AR-061: un esito misurato con sensore-fonte cieco NON conta nel punteggio (autonomia non si guadagna al buio).
      if (e.sensore_stato === "cieco") {
        perRep.set(e.reparto, cur);
        continue;
      }
      // AR-044: previsioni banali (status-quo) non contano per l'autonomia.
      if (e.banale === true) {
        perRep.set(e.reparto, cur);
        continue;
      }
      cur.previsioni += 1;
      if (e.stato === "azzeccata") cur.azzeccate += 1;
    }
    perRep.set(e.reparto, cur);
  }
  data.per_reparto = [...perRep.values()].map((r) => {
    const punteggio = r.previsioni > 0 ? Number((r.azzeccate / r.previsioni).toFixed(2)) : 0;
    // AR-065: usa il lower-bound di Wilson (intervallo di confidenza 90%) invece della proporzione grezza:
    // con campione minuscolo il lower_bound è basso → niente autonomia "alta" su 3 esiti fortunati.
    const lowerBound = Number(wilsonLowerBound(r.azzeccate, r.previsioni).toFixed(2));
    let autonomia = "bassa";
    if (r.previsioni >= MIN_PER_AUTONOMIA) {
      // AR-065: soglie sul lower_bound; "alta" richiede anche un campione_minimo (MIN_CAMPIONE_ALTA),
      // sotto il quale il tetto resta "media" per penalità sul campione piccolo.
      if (lowerBound >= 0.7 && r.previsioni >= MIN_CAMPIONE_ALTA) autonomia = "alta";
      else if (lowerBound >= 0.4) autonomia = "media";
      else autonomia = "bassa";
    }
    // AR-061: con >=2/3 sensori ciechi il 'reale' è poco misurabile → cappa l'autonomia a 'media'.
    if (quotaCiechiAlta && autonomia === "alta") autonomia = "media";
    return { reparto: r.reparto, previsioni: r.previsioni, azzeccate: r.azzeccate, punteggio, lower_bound: lowerBound, autonomia }; // AR-065: lower_bound = confidenza (Wilson 90%)
  });
  data.per_reparto.sort((a, b) => b.punteggio - a.punteggio);
}

function nuovoId(reparto) {
  const stamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  return `CAL-${stamp}-${reparto.replace(/[^a-z0-9]/gi, "").slice(0, 6) || "gen"}`;
}

function cmdPrevedi(data) {
  const reparto = normReparto(arg("reparto"));
  const azione = arg("azione");
  const metrica = arg("metrica");
  const attesoRaw = arg("atteso");
  const entro = arg("entro", "");
  const nota = arg("nota", "");
  if (!reparto || !azione || !metrica || attesoRaw == null) {
    console.error(
      "❌ Servono almeno: --reparto --azione --metrica --atteso. Es:\n" +
        '   node cervello/calibrazione.mjs prevedi --reparto=@crm --azione="win-back" --metrica=ordini --atteso=1 --entro=2026-07-09'
    );
    process.exit(2);
  }
  const atteso = Number(attesoRaw);
  if (Number.isNaN(atteso)) {
    console.error(`❌ --atteso deve essere un numero (ricevuto: ${attesoRaw}).`);
    process.exit(2);
  }
  const id = arg("id") || nuovoId(reparto);
  if (data.registro.some((e) => e.id === id)) {
    console.error(`❌ id già esistente: ${id}`);
    process.exit(2);
  }
  const entry = {
    id,
    reparto,
    azione,
    metrica,
    atteso,
    reale: null,
    entro,
    tolleranza: Number(arg("tolleranza", TOLLERANZA_DEFAULT)),
    stato: "aperta",
    scarto_pct: null,
    nota,
    creato: nowPiacenza(),
    chiuso_il: "",
  };
  data.registro.push(entry);
  ricalcolaReparti(data);
  write(data);
  console.log(`✅ Previsione registrata [${id}] ${reparto}: ${metrica} atteso ${atteso}${entro ? ` entro ${entro}` : ""}.`);
  console.log(`   Quando conosci l'esito:  node cervello/calibrazione.mjs esito --id=${id} --reale=<numero>`);
}

function valuta(atteso, reale, tolleranza) {
  const scarto = Math.abs(reale - atteso) / Math.max(Math.abs(atteso), 1);
  return { azzeccata: scarto <= tolleranza, scarto_pct: Number((scarto * 100).toFixed(1)) };
}

function cmdEsito(data) {
  const id = arg("id");
  const realeRaw = arg("reale");
  if (!id || realeRaw == null) {
    console.error("❌ Servono --id e --reale. Es: node cervello/calibrazione.mjs esito --id=CAL-... --reale=2");
    process.exit(2);
  }
  const e = data.registro.find((x) => x.id === id);
  if (!e) {
    console.error(`❌ Previsione non trovata: ${id}`);
    process.exit(2);
  }
  const reale = Number(realeRaw);
  if (Number.isNaN(reale)) {
    console.error(`❌ --reale deve essere un numero (ricevuto: ${realeRaw}).`);
    process.exit(2);
  }
  // AR-062: nessun esito senza fonte ammessa (chi conia autonomia non può auto-alimentarsi).
  const fonte = arg("fonte");
  const ammesse = fontiAmmesse();
  if (!fonte || !ammesse.includes(fonte)) {
    console.error(
      `❌ Serve --fonte tra le ammesse (nessun numero senza fonte): ${ammesse.join(" | ")}.\n` +
        `   Es: node cervello/calibrazione.mjs esito --id=${id} --reale=${realeRaw} --fonte="Supabase MCP"`
    );
    process.exit(2);
  }
  let { azzeccata, scarto_pct } = valuta(e.atteso, reale, e.tolleranza || TOLLERANZA_DEFAULT);
  const sensoreStato = sensoreStatoPerFonte(fonte);
  // AR-061: sensore-fonte cieco → non si può chiudere "azzeccata" (over-confidence al buio).
  if (sensoreStato === "cieco" && azzeccata) {
    console.error(
      `❌ AR-061: sensore-fonte cieco per "${fonte}" — non si può confermare al buio.\n` +
        `   Usa --fonte="conferma di Nicola" se c'è verifica umana, oppure chiudi come mancata (--causa=dato).`
    );
    process.exit(2);
  }
  // PZ-011 (piano "chiudi i loop" — diario del perché): una previsione MANCATA non si chiude senza la
  // causa. Sbagliare è ammesso; sbagliare senza capire PERCHÉ no: è la differenza tra calibrarsi e capirsi.
  //   --causa=modello  → il ragionamento era sbagliato (previsione mal costruita)
  //   --causa=dato     → il dato di partenza era sporco/mancante (sensore, definizione KPI)
  //   --causa=mondo    → è successo qualcosa di esterno/imprevedibile (evento, meteo, decisione umana)
  const CAUSE = ["modello", "dato", "mondo"];
  const causa = arg("causa");
  if (!azzeccata) {
    if (!causa || !CAUSE.includes(causa)) {
      console.error(
        `❌ Previsione MANCATA (atteso ${e.atteso}, reale ${reale}): serve --causa=${CAUSE.join("|")} (+ --causa-nota="1 riga sul perché").\n` +
          `   Es: node cervello/calibrazione.mjs esito --id=${id} --reale=${realeRaw} --fonte="${arg("fonte") || "…"}" --causa=dato --causa-nota="il sensore era cieco quel giorno"`
      );
      process.exit(2);
    }
    e.causa = causa;
    const causaNota = arg("causa-nota");
    if (causaNota) e.causa_nota = causaNota;
  }
  e.reale = reale;
  e.scarto_pct = scarto_pct;
  e.stato = azzeccata ? "azzeccata" : "mancata";
  e.fonte = fonte; // AR-062: provenienza dell'esito (mostrata nel Pannello accanto al reale)
  e.sensore_stato = sensoreStato; // AR-061: stato del sensore-fonte al momento della misura
  e.banale = isPrevisioneBanale(e, reale); // AR-044: status-quo non gonfia l'autonomia
  e.chiuso_il = nowPiacenza();
  const notaEsito = arg("nota");
  if (notaEsito) e.nota = e.nota ? `${e.nota} · esito: ${notaEsito}` : notaEsito;
  ricalcolaReparti(data);
  write(data);
  const rep = data.per_reparto.find((r) => r.reparto === e.reparto);
  console.log(
    `${azzeccata ? "🎯 AZZECCATA" : "❌ MANCATA"} [${id}] ${e.reparto}: atteso ${e.atteso}, reale ${reale} (scarto ${scarto_pct}%).`
  );
  if (rep) console.log(`   ${e.reparto}: ${rep.azzeccate}/${rep.previsioni} azzeccate · punteggio ${rep.punteggio} · autonomia ${rep.autonomia}.`);
  console.log("   → Lezione: registra in apprendimento.json cosa ha funzionato/no (fonte: calibrazione).");
}

function cmdScadute(data) {
  const oggi = nowPiacenza().slice(0, 10);
  let n = 0;
  for (const e of data.registro) {
    if (e.stato === "aperta" && e.entro && e.entro < oggi) {
      e.stato = "scaduta";
      e.chiuso_il = nowPiacenza();
      n += 1;
    }
  }
  ricalcolaReparti(data);
  write(data);
  console.log(`⏱️  ${n} previsioni marcate 'scaduta' (oltre 'entro' senza esito). Le scadute NON contano nel punteggio: chiedono un esito o una lezione.`);
}

// PZ-013 (piano "chiudi i loop") — SEMAFORO DINAMICO, lato proposta. Il semaforo 🟢🟡🔴 era statico;
// la calibrazione già misura chi azzecca (Wilson ≥0.7 su ≥8 esiti = autonomia "alta" GUADAGNATA).
// Questo comando trasforma quella prova in una PROPOSTA 🟡 in AZIONI-IN-ATTESA: "promuovi i 🟡 di
// routine di @reparto a 🟢". MAI auto-applicata (ogni auto-modifica è 🟡, firma Nicola); dedup in
// calibrazione.json (promozioni_proposte) così ogni reparto viene proposto UNA volta finché lo stato regge.
function cmdPromozioni(data) {
  const accoda = process.argv.includes("--accoda");
  const CODA = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md");
  ricalcolaReparti(data);
  data.promozioni_proposte = data.promozioni_proposte || {};

  const candidati = data.per_reparto.filter(
    (r) => r.autonomia === "alta" && !data.promozioni_proposte[r.reparto]
  );
  // Un reparto che perde l'autonomia "alta" esce dal registro proposte: se la riguadagna, si ripropone.
  for (const rep of Object.keys(data.promozioni_proposte)) {
    const r = data.per_reparto.find((x) => x.reparto === rep);
    if (!r || r.autonomia !== "alta") delete data.promozioni_proposte[rep];
  }

  if (!candidati.length) {
    write(data);
    console.log("🚦 Semaforo dinamico: nessun reparto NUOVO con autonomia 'alta' guadagnata — nessuna proposta.");
    return;
  }

  for (const r of candidati) {
    const quando = nowPiacenza();
    const blocco =
      `\n## 🟡 Dai più autonomia a ${r.reparto}: se lo ha dimostrato coi numeri, i suoi lavori di routine partono da soli\n` +
      `- **Data:** ${quando}\n` +
      `- **Prova (calibrazione):** ${r.azzeccate}/${r.previsioni} previsioni azzeccate · punteggio ${r.punteggio} · confidenza Wilson ${r.lower_bound} (≥0.7 su ≥${MIN_CAMPIONE_ALTA} esiti reali = autonomia GUADAGNATA, non a simpatia).\n` +
      `- **Cosa cambia:** le azioni 🟡 di ROUTINE di ${r.reparto} (bozze, aggiornamenti interni, contenuti non pubblici) passano a 🟢 "fai e annota". I 🔴 (soldi, clienti reali, pubblicazioni) restano 🔴 con la tua firma, sempre.\n` +
      `- **Se va bene:** meno card in coda per te, il reparto lavora più veloce; al primo esito MANCATO l'autonomia riscende da sola (la calibrazione continua a misurare).\n` +
      `- **Come:** rispondi "ok promozione ${r.reparto}" — l'AD aggiorna il mansionario del senior (auto-modifica 🟡). {origine:mossa:promozione-${r.reparto.replace(/^@/, "")}}\n` +
      `- **Stato:** in attesa\n`;
    if (accoda) {
      if (!existsSync(CODA)) {
        mkdirSync(dirname(CODA), { recursive: true });
        writeFileSync(CODA, "# ⏳ AZIONI IN ATTESA (firma di Nicola)\n");
      }
      const testo = readFileSync(CODA, "utf8");
      // Anti-doppione anche cross-run: se un blocco per questo reparto è già in coda, non riaccodare.
      if (!testo.includes(`Dai più autonomia a ${r.reparto}`)) {
        writeFileSync(CODA, testo.trimEnd() + "\n" + blocco, "utf8");
      }
      data.promozioni_proposte[r.reparto] = quando;
      console.log(`🚦 ${r.reparto}: autonomia ALTA guadagnata (${r.azzeccate}/${r.previsioni}, Wilson ${r.lower_bound}) → proposta 🟡 accodata per la firma.`);
    } else {
      console.log(`🚦 ${r.reparto}: candidato alla promozione (${r.azzeccate}/${r.previsioni}, Wilson ${r.lower_bound}). Con --accoda la proposta va in AZIONI-IN-ATTESA.`);
    }
  }
  write(data);
}

function cmdReport(data) {
  ricalcolaReparti(data);
  write(data);
  const aperte = data.registro.filter((e) => e.stato === "aperta");
  const scadute = data.registro.filter((e) => e.stato === "scaduta");
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ per_reparto: data.per_reparto, aperte, scadute }, null, 2));
    return;
  }
  console.log(`\n🎯 CALIBRAZIONE — ${data.aggiornato}\n`);
  if (data.per_reparto.length === 0) {
    console.log("Nessuna previsione chiusa ancora. Registra la prima: node cervello/calibrazione.mjs prevedi ...");
  } else {
    console.log("Reparto              Azzecc/Prev  Punteggio  Autonomia");
    for (const r of data.per_reparto) {
      console.log(`${r.reparto.padEnd(20)} ${String(`${r.azzeccate}/${r.previsioni}`).padEnd(12)} ${String(r.punteggio).padEnd(10)} ${r.autonomia}`);
    }
  }
  console.log(`\nPrevisioni aperte: ${aperte.length}${scadute.length ? ` · scadute senza esito: ${scadute.length}` : ""}`);
  for (const e of aperte) {
    console.log(`  · [${e.id}] ${e.reparto}: ${e.metrica} atteso ${e.atteso}${e.entro ? ` entro ${e.entro}` : ""} — ${e.azione}`);
  }
}

// AR-040: sposta le voci scritte a mano (formato prosa senza id/stato) in registro_legacy,
// così il registro principale contiene SOLO voci strutturate leggibili dal motore.
function cmdArchiviaLegacy(data) {
  const legacy = data.registro.filter((e) => !e.id || !STATI_VALIDI.has(e.stato));
  const strutturate = data.registro.filter((e) => e.id && STATI_VALIDI.has(e.stato));
  if (legacy.length === 0) {
    console.log("✅ Nessuna voce legacy: il registro è già in formato strutturato.");
    return;
  }
  data.registro_legacy = [...(data.registro_legacy || []), ...legacy];
  data.registro = strutturate;
  ricalcolaReparti(data);
  write(data);
  console.log(`📦 AR-040: archiviate ${legacy.length} voci legacy in registro_legacy. Registro: ${strutturate.length} voci strutturate.`);
}

// Ponte chiusura-loop → calibrazione: un ESITO nel quaderno diventa anche un punto-dato strutturato.
function parseNumeroLoop(s) {
  const m = String(s ?? "").match(/-?\d+(?:[.,]\d+)?/);
  if (!m) return null;
  const n = Number(m[0].replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function cmdDaLoop(data) {
  const reparto = normReparto(arg("reparto"));
  const azione = arg("azione") || "esito-loop";
  const attesoRaw = arg("atteso");
  const realeRaw = arg("reale");
  if (!reparto || attesoRaw == null || realeRaw == null) {
    console.error(
      "❌ da-loop serve --reparto --azione --atteso --reale. Es:\n" +
        '   node cervello/calibrazione.mjs da-loop --reparto=@vendite --azione="pitch" --atteso=1 --reale=1'
    );
    process.exit(2);
  }
  const atteso = parseNumeroLoop(attesoRaw);
  const reale = parseNumeroLoop(realeRaw);
  if (atteso == null || reale == null) {
    console.log("⏭️  da-loop: atteso/reale non numerici — salto calibrazione (solo quaderno).");
    return;
  }
  const id = nuovoId(reparto);
  const fonte = "chiusura-loop ESITO";
  const { azzeccata, scarto_pct } = valuta(atteso, reale, TOLLERANZA_DEFAULT);
  const quando = nowPiacenza();
  data.registro.push({
    id,
    reparto,
    azione,
    metrica: "esito_loop",
    atteso,
    reale,
    entro: quando.slice(0, 10),
    tolleranza: TOLLERANZA_DEFAULT,
    stato: azzeccata ? "azzeccata" : "mancata",
    scarto_pct,
    fonte,
    sensore_stato: sensoreStatoPerFonte(fonte),
    banale: isPrevisioneBanale({ azione, metrica: "esito_loop", atteso, nota: "" }, reale),
    nota: "Ponte chiusura-loop.mjs registra → calibrazione.mjs da-loop",
    creato: quando,
    chiuso_il: quando,
  });
  ricalcolaReparti(data);
  write(data);
  console.log(`🔗 da-loop [${id}] ${reparto}: atteso ${atteso} → reale ${reale} (${azzeccata ? "azzeccata" : "mancata"})`);
}

// AR-040/AR-041: apre automaticamente UNA previsione baseline @AD se il registro è vuoto.
// Legge i dati correnti dai sensori (sensori-cecita.json) per costruire la metrica.
// Usato in giro.sh PRIMA del motore, così il motore può poi chiamare `esito` al giro dopo.
function cmdAutoprevedi(data) {
  const strutturate = data.registro.filter((e) => e.id && (e.stato === "aperta" || e.stato === "scaduta" || e.stato === "azzeccata" || e.stato === "mancata"));
  if (strutturate.length > 0) {
    const aperte = strutturate.filter((e) => e.stato === "aperta");
    console.log(`✅ autoprevedi: ${strutturate.length} voci strutturate (${aperte.length} aperte) — nessuna nuova previsione baseline aperta.`);
    return;
  }
  // Registro vuoto: apri la prima previsione baseline @AD ordini.
  const domani = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const reparto = "@AD";
  const id = nuovoId(reparto);
  const entry = {
    id,
    reparto,
    azione: "giro-routine-settimanale",
    metrica: "ordini_totali",
    atteso: 1,
    reale: null,
    entro: domani,
    tolleranza: TOLLERANZA_DEFAULT,
    stato: "aperta",
    scarto_pct: null,
    nota: "AR-040/autoprevedi: prima previsione baseline. Al giro della misurazione chiama: calibrazione.mjs esito --id=" + id + " --reale=<n> --fonte=\"Supabase MCP\"",
    creato: nowPiacenza(),
    chiuso_il: "",
  };
  data.registro.push(entry);
  ricalcolaReparti(data);
  write(data);
  console.log(`✅ AR-040/autoprevedi: prima previsione strutturata aperta [${id}] @AD: ordini_totali atteso 1 entro ${domani}.`);
  console.log(`   Al giro dopo: node cervello/calibrazione.mjs esito --id=${id} --reale=<n> --fonte="Supabase MCP"`);
}

// AR-061: backfill sensore_stato mancante sulle voci chiuse (es. create prima del ponte da-loop).
function cmdRipara(data) {
  let n = 0;
  for (const e of data.registro) {
    if ((e.stato === "azzeccata" || e.stato === "mancata") && !e.sensore_stato && e.fonte) {
      e.sensore_stato = sensoreStatoPerFonte(e.fonte);
      n += 1;
    }
  }
  if (n > 0) {
    ricalcolaReparti(data);
    write(data);
    console.log(`🔧 ripara: backfill sensore_stato su ${n} voce/i chiuse.`);
    return;
  }
  console.log("✅ ripara: niente da backfill.");
}

// AR-061/AR-044: guardiano registro — niente esito chiuso senza fonte+sensore_stato, niente voci legacy attive.
function cmdValida(data) {
  const problemi = [];
  for (const e of data.registro) {
    if (!e.id || !STATI_VALIDI.has(e.stato)) {
      problemi.push(`voce legacy attiva (${e.reparto || "?"}): esegui archivia-legacy`);
      continue;
    }
    if (e.stato === "azzeccata" || e.stato === "mancata") {
      if (!e.fonte) problemi.push(`${e.id}: chiusa senza fonte`);
      if (!e.sensore_stato) problemi.push(`${e.id}: chiusa senza sensore_stato`);
      // AR-061: azzeccata con sensore cieco = over-confidence (come il "confermato" prosa al buio).
      if (e.stato === "azzeccata" && e.sensore_stato === "cieco") {
        problemi.push(`${e.id}: azzeccata con sensore-fonte cieco — ricalibra o usa fonte umana`);
      }
    }
  }
  if (problemi.length) {
    console.error(`❌ valida calibrazione: ${problemi.join(" · ")}`);
    process.exit(1);
  }
  console.log("✅ valida: registro conforme (fonte+sensore_stato su chiuse, nessuna voce legacy attiva).");
}

async function main() {
  const cmd = process.argv[2];
  const data = readCalibrazione();
  switch (cmd) {
    case "prevedi":
      cmdPrevedi(data);
      break;
    case "esito":
      cmdEsito(data);
      break;
    case "scadute":
      cmdScadute(data);
      break;
    case "promozioni":
      cmdPromozioni(data);
      break;
    case "archivia-legacy":
      cmdArchiviaLegacy(data);
      break;
    case "autoprevedi":
      cmdAutoprevedi(data);
      break;
    case "valida":
      cmdValida(data);
      break;
    case "ripara":
      cmdRipara(data);
      break;
    case "da-loop":
      cmdDaLoop(data);
      break;
    case "report":
    case undefined:
      cmdReport(data);
      break;
    default:
      console.error(`Comando sconosciuto: ${cmd}. Usa: prevedi | esito | scadute | promozioni | archivia-legacy | autoprevedi | valida | ripara | da-loop | report`);
      process.exit(2);
  }
  const chiuse = data.registro.filter((e) => e.stato === "azzeccata" || e.stato === "mancata").length;
  const azz = data.registro.filter((e) => e.stato === "azzeccata").length;
  await stampSegnale(
    "calibrazione",
    "ok",
    `${azz}/${chiuse} azzeccate · ${data.registro.filter((e) => e.stato === "aperta").length} aperte · ${nowPiacenza()}`
  );
}

main().catch(async (e) => {
  console.error("ERRORE calibrazione:", e.message || e);
  await stampSegnale("calibrazione", "errore", `crash: ${(e.message || e).toString().slice(0, 180)}`);
  process.exit(1);
});
