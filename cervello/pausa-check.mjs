#!/usr/bin/env node
// ⏸ GUARDIANO DELLE PAUSE — AR-159 / AR-157.
//
// Il 23/7 Nicola ha rimandato l'inserimento negozi e dodici azioni sono andate in pausa. A verbale
// (DECISIONI, STATO 23/7 18:05) è scritto che «riprendono da sole al 24/8-1/9». Misurato il 28/7:
//
//   · il carattere `⏸` è letto da UN solo punto in tutta la macchina — `guardiano-tempo.mjs:38` — e
//     serve a **togliere** la card dal conteggio delle firme che aspettano, con l'etichetta «in
//     attesa di una condizione, non di te». Nessun altro lo guarda. Non esiste nessuna condizione
//     che venga controllata: la card esce dal radar e ci resta;
//   · 11 card su 11 hanno la data ricopiata nel titolo invece dell'id del fatto. E il fatto sta per
//     cambiare: Nicola ha indicato metà agosto due volte (STATO 26/7 ~01:05 e ~01:10) e la card
//     `#conferma-piano-squadra-ripresa-negozi` aspetta ancora risposta.
//
// Questo guardiano fa le due cose che mancavano: **confronta la pausa con l'orologio** e **pretende
// che la data sia citata, non copiata**. Più una terza, che è AR-157: se un'azione di *validazione*
// (l'ordine di prova che dimostra che i soldi arrivano al fornaio) è ferma per una pausa di
// *business*, non decide lui — pretende che la domanda sia stata fatta a Nicola.
//
// 🟢 Sola lettura di default. Con `--risveglia` scrive nella coda (file dell'AD), mai nel mondo.
//
// Uso:
//   node cervello/pausa-check.mjs                  -> rapporto
//   node cervello/pausa-check.mjs --json           -> JSON
//   node cervello/pausa-check.mjs --risveglia      -> toglie il ⏸ alle pause scadute e lo dice
//   node cervello/pausa-check.mjs --adesso 2026-09-05T08:00   -> orologio finto (solo per i test)
//
// Exit (contratto AR-322): 0 = pause sane · 1 = violazione · 2 = cieco (non ho potuto calcolare)

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CLASSI,
  ambitoDelFatto,
  codiceUscita,
  congelamentoLegittimo,
  leggiCard,
  prossimoNumero,
  ricopiaDelFatto,
  risolviRipresa,
  statoPausa,
} from "./pausa-coda.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..");
const JSON_MODE = process.argv.includes("--json");
const RISVEGLIA = process.argv.includes("--risveglia");

// Puntabili altrove per il test: senza, l'unico modo di provare il risveglio sarebbe aspettare
// settembre — e una prova che guarda solo com'è il mondo adesso resta verde anche a fix rimosso
// (lezione del lotto 14, pagata due volte).
const CODA = process.env.PAUSA_CODA_FILE || "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md";
const REGISTRO = process.env.PAUSA_REGISTRO_FILE || "MyCity-Vault/90-Memoria-AI/registro-fatti.json";

/** Marcatore che una card di validazione congelata è già stata sottoposta a Nicola (AR-157). */
const MARCA_DOMANDA = "congelamento-da-confermare:";

function percorso(p) {
  return isAbsolute(p) ? p : join(REPO, p);
}

function adesso() {
  const i = process.argv.indexOf("--adesso");
  if (i > 0 && process.argv[i + 1]) {
    const d = new Date(process.argv[i + 1]);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

function main() {
  const now = adesso();
  const nowMs = now.getTime();

  if (!existsSync(percorso(CODA))) {
    console.error(`⚠️  GUARDIANO CIECO: manca ${CODA} — non so quali pause sorvegliare.`);
    process.exit(2);
  }
  if (!existsSync(percorso(REGISTRO))) {
    console.error(`⚠️  GUARDIANO CIECO: manca ${REGISTRO} — senza il registro non so quando finiscono le pause.`);
    process.exit(2);
  }

  const testoCoda = readFileSync(percorso(CODA), "utf8");
  let fatti = [];
  try {
    fatti = JSON.parse(readFileSync(percorso(REGISTRO), "utf8")).fatti || [];
  } catch (e) {
    console.error(`⚠️  GUARDIANO CIECO: registro dei fatti illeggibile (${e.message}).`);
    process.exit(2);
  }
  const fattoPerId = new Map(fatti.map((f) => [f.id, f]));

  const card = leggiCard(testoCoda);
  const inPausa = card.filter((c) => c.inPausa);

  // Le righe del vecchio formato a tabella hanno anche loro un ⏸, ma è un'altra cosa: sono «armate»
  // dietro una CONDIZIONE (≥3 negozi evadibili, mani Stripe collegate), non dietro una data. Un
  // orologio non le può svegliare. Restano fuori da questo controllo — e lo diciamo, perché un
  // limite taciuto si legge come «coperto tutto».
  const righeTabella = testoCoda.split("\n").filter((l) => l.trimStart().startsWith("|") && /⏸/.test(l)).length;

  const violazioni = [];
  const ciechi = [];
  const daRisvegliare = [];
  const dettaglio = [];

  for (const c of inPausa) {
    const fattoId = c.pausa?.fatto || null;

    // ① Il campo esiste? Senza il legame al fatto non c'è nessun momento in cui la pausa finisce:
    //    è la forma pura di AR-159, la card che dorme per sempre.
    if (!fattoId) {
      violazioni.push({
        card: c.id,
        riga: c.riga,
        tipo: "senza-risveglio",
        dettaglio: "in pausa senza riga «⏸ Pausa: … riprende con `<fatto>`»: nessun orologio la sveglierà",
      });
      dettaglio.push({ card: c.id, stato: "senza-risveglio" });
      continue;
    }

    const fatto = fattoPerId.get(fattoId);
    if (!fatto) {
      ciechi.push({ card: c.id, perche: `il fatto «${fattoId}» non esiste nel registro` });
      dettaglio.push({ card: c.id, stato: "cieco" });
      continue;
    }

    const ripresa = risolviRipresa(fatto.valore);
    if (ripresa.ambigua) {
      ciechi.push({ card: c.id, perche: `«${fattoId}» non dice un giorno calcolabile: ${ripresa.perche}` });
      dettaglio.push({ card: c.id, stato: "cieco" });
      continue;
    }

    // ② La data è citata o ricopiata? (AR-102 applicato alla coda.)
    const copia = ricopiaDelFatto(`${c.titolo}\n${c.corpo}`, fatto.valore);
    if (copia) {
      violazioni.push({
        card: c.id,
        riga: c.riga,
        tipo: "valore-ricopiato",
        dettaglio: `contiene «${copia}», che è il valore di ${fattoId}: va citato l'id, non copiata la data`,
      });
    }

    // ③ Il momento è passato e la card è ancora ferma?
    const stato = statoPausa({ inPausa: true, ripresaIso: ripresa.iso, adessoMs: nowMs });
    if (stato === "scaduta") {
      daRisvegliare.push({ card: c.id, riga: c.riga, fine: ripresa.iso });
      violazioni.push({
        card: c.id,
        riga: c.riga,
        tipo: "pausa-scaduta",
        dettaglio: `la pausa è finita il ${ripresa.iso} e la card è ancora ferma: nessuno l'ha svegliata`,
      });
    }

    // ④ AR-157 — una pausa di business che congela un'azione di validazione.
    const giudizio = congelamentoLegittimo({
      classeCard: c.pausa.classe,
      ambitoPausa: ambitoDelFatto(fattoId),
    });
    if (!giudizio.legittimo) {
      // Due modi di essere a posto, e servono entrambi: la domanda è in coda (prima che Nicola
      // risponda) **oppure** la sua risposta è scritta nella riga di pausa (dopo). Senza il secondo,
      // il giorno che Nicola risponde e la card della domanda viene archiviata il guardiano
      // tornerebbe rosso su una cosa ormai decisa — e un guardiano che suona dopo che hai risposto è
      // un guardiano che verrà spento.
      const chiesto = testoCoda.includes(`${MARCA_DOMANDA} ${c.id}`);
      const confermato = /congelamento confermato da Nicola/i.test(c.pausa.riga || "");
      if (giudizio.daChiedere && !chiesto && !confermato) {
        violazioni.push({
          card: c.id,
          riga: c.riga,
          tipo: "congelamento-non-chiesto",
          dettaglio: `${giudizio.perche} — e a Nicola non è stato chiesto: manca una card con «${MARCA_DOMANDA} ${c.id}»`,
        });
      } else if (!giudizio.daChiedere) {
        violazioni.push({ card: c.id, riga: c.riga, tipo: "classe-mancante", dettaglio: giudizio.perche });
      }
    }

    dettaglio.push({ card: c.id, stato, classe: c.pausa.classe, fine: ripresa.iso, fatto: fattoId });
  }

  const rapporto = {
    ok: violazioni.length === 0 && ciechi.length === 0,
    quando: now.toISOString().slice(0, 16).replace("T", " "),
    fonte: `${CODA} + ${REGISTRO} (nessuna data indovinata: tutte risolte dal registro)`,
    card_in_pausa: inPausa.length,
    righe_tabella_escluse: righeTabella,
    perche_escluse: "sono armate dietro una CONDIZIONE (≥N negozi, mani collegate), non dietro una data: un orologio non le sveglia",
    violazioni,
    ciechi,
    da_risvegliare: daRisvegliare,
    dettaglio,
  };

  if (RISVEGLIA) {
    rapporto.risvegliate = risveglia(testoCoda, daRisvegliare);
    // Le violazioni erano state contate PRIMA di svegliare. Tenerle nel conto farebbe passare al
    // motore un vincolo su una cosa appena sistemata: il guardiano si lamenterebbe del proprio fix.
    const fatte = new Set(rapporto.risvegliate);
    for (let i = violazioni.length - 1; i >= 0; i--) {
      if (violazioni[i].tipo === "pausa-scaduta" && fatte.has(violazioni[i].card)) violazioni.splice(i, 1);
    }
    rapporto.ok = violazioni.length === 0 && ciechi.length === 0;
  }

  const rc = codiceUscita({ cieco: ciechi.length, violazioni: violazioni.length });

  if (JSON_MODE) {
    console.log(JSON.stringify(rapporto, null, 2));
    process.exit(rc);
  }

  console.log(`⏸  Guardiano delle pause — ${rapporto.quando}`);
  console.log(`   Card in pausa: ${inPausa.length} · righe di tabella fuori controllo: ${righeTabella} (${rapporto.perche_escluse})\n`);
  for (const d of dettaglio) {
    const eti = { attiva: "⏸ ferma", scaduta: "⏰ SCADUTA", "senza-risveglio": "🕳️  senza risveglio", cieco: "❔ cieco" }[d.stato] || d.stato;
    console.log(`   ${eti.padEnd(20)} #${d.card}${d.fine ? ` → fino al ${d.fine}` : ""}${d.classe ? ` · ${d.classe}` : ""}`);
  }
  if (violazioni.length) {
    console.log(`\n   🔴 ${violazioni.length} violazioni:`);
    for (const v of violazioni) console.log(`      · [${v.tipo}] #${v.card} (riga ${v.riga}) — ${v.dettaglio}`);
  }
  if (ciechi.length) {
    console.log(`\n   ❔ ${ciechi.length} pause non calcolabili:`);
    for (const c of ciechi) console.log(`      · #${c.card} — ${c.perche}`);
  }
  if (rapporto.risvegliate?.length) {
    console.log(`\n   ⏰ Risvegliate ${rapporto.risvegliate.length} card e accodata la card che lo dice a Nicola.`);
  }
  if (rc === 0) console.log("\n   ✅ Ogni pausa ha un momento in cui finisce, citato e non copiato.");
  process.exit(rc);
}

/**
 * AR-159 (b) — il risveglio vero, non un promemoria. Toglie il ⏸ alle card la cui pausa è finita e
 * accoda UNA card che lo dice, invece di rimettere in lista N cose senza spiegare perché.
 *
 * Il fix_proposto di AR-159 lo dice chiaro: «non chiudere questo punto scrivendo un promemoria — un
 * promemoria a mano è esattamente il meccanismo che qui ha già fallito».
 */
function risveglia(testoCoda, daRisvegliare) {
  if (!daRisvegliare.length) return [];
  const righe = testoCoda.split("\n");
  for (const r of daRisvegliare) {
    const i = r.riga - 1;
    if (righe[i] == null) continue;
    righe[i] = righe[i].replace(/\s*·\s*⏸[^·\n]*/g, "").replace(/⏸\s*/g, "");
    // La riga strutturata resta come storia, ma dice che la pausa è finita: così un secondo giro non
    // la ritratta come attiva e non la risveglia due volte.
    for (let j = i + 1; j < righe.length && !/^###\s/.test(righe[j]); j++) {
      if (/\*\*⏸\s*Pausa:\*\*/.test(righe[j])) {
        righe[j] = righe[j].replace(/\*\*⏸\s*Pausa:\*\*/, "**▶️ Pausa finita:**");
        break;
      }
    }
  }
  const elenco = daRisvegliare.map((r) => `\`#${r.card}\``).join(", ");
  const adesso = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Rome" }).slice(0, 16);
  const card = [
    "",
    `<!-- pausa-scaduta-risveglio -->`,
    "",
    `### 🟡 #${prossimoNumero(righe.join("\n"))} — La pausa sui negozi è finita: ${daRisvegliare.length} azioni sono tornate vive · ⏳ accodata ${adesso}`,
    "",
    `**Cosa cambia:** il giorno che avevi indicato è passato, quindi le azioni che avevi messo da parte sono di nuovo in lista: ${elenco}. Non sono partite: sono solo tornate visibili, e aspettano il tuo via come prima.`,
    "",
    `**Se va bene:** le guardi una per una e dici quali far partire davvero. Se nel frattempo hai cambiato idea sulla data, basta che me lo dici: la sposto nel registro e tutte le pause si spostano insieme.`,
    "",
    "---",
    "",
  ].join("\n");
  const testo = righe.join("\n");
  const punto = testo.indexOf("\n### ");
  const nuovo = punto < 0 ? `${testo}\n${card}` : `${testo.slice(0, punto)}\n${card}${testo.slice(punto)}`;
  writeFileSync(percorso(CODA), nuovo);
  return daRisvegliare.map((r) => r.card);
}

main();
