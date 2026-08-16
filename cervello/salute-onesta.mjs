#!/usr/bin/env node
// 📈 SALUTE-ONESTA — «sto migliorando nel tempo?» come RISPOSTA, non come plateau (Mossa 6).
//
// IL PROBLEMA (sonda «metacognizione», 2026-07-24): la macchina ha un motore metacognitivo vero, ma
// il volano è FERMO e non si vede: su 90 snapshot di storico-salute.json il voto ONESTO (voto_pieno)
// è 0 in 84/90 — mentre il voto provvisorio/creditato (voto_salute) si muove, dando una falsa
// sensazione di progresso. E il cantiere CRESCE invece di andare a zero. Questo script mette in chiaro
// la serie ONESTA + il burn-down del cantiere: così «sto migliorando?» ha una risposta numerica.
//
// COSA FA (sola lettura): (1) la serie voto_pieno (onesto) e quante rilevazioni sono ferme a 0;
// (2) il burn-down del cantiere (difetti aperti ORA vs ~7 giorni fa, dalle date nato/chiuso_il).
//
// ── AR-684 · AR-671 — DUE BUCHI IN QUESTO CONTO, ED ERANO LO STESSO BUCO ─────────────────────────
// Il conto lo faceva questo file, a modo suo, e la parola «aperto» non aveva un padrone:
//   · **il terzo stato spariva.** Le schede `da-riverificare` (56, misurate il 14/8) non erano né
//     chiuse né contate: un buco dove le cose spariscono. Adesso il numero di ADESSO si legge dalla
//     lista con `contaDifetti`, che ha una regola sola — chiuso, oppure da fare — e la somma dei
//     rami deve fare il totale.
//   · **i difetti senza data di nascita uscivano in silenzio.** `if (nato == null) return false`:
//     né oggi né una settimana fa. Non è un arrotondamento, ed è sempre dalla parte comoda — il
//     burn-down migliorava da solo. Adesso quelli che non so collocare nel tempo si CHIAMANO, e il
//     confronto con «una settimana fa» dichiara il proprio margine invece di dare un numero secco.
// Le due definizioni vivono in `cervello/stati-cantiere.mjs`, dove un test le può eseguire.
//
// USO:
//   node cervello/salute-onesta.mjs           -> report umano
//   node cervello/salute-onesta.mjs --json     -> output macchina (serie KPI per il Pannello)
//
// Sola lettura. Uscita: 0 = ho misurato · 2 = il cantiere non si è lasciato leggere (CIECO, mai un
// verde: un errore di lettura non deve poter uscire dalla porta con la faccia di uno zero).

import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { apertiAllaData, contaDifetti } from "./stati-cantiere.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AC = join(ROOT, "MyCity-Vault", "90-Memoria-AI", "auto-coscienza");
const STORICO = join(AC, "storico-salute.json");
const CANTIERE = join(AC, "cantiere-difetti.json");

const JSON_OUT = process.argv.includes("--json");

function leggi(p) {
  try {
    return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
  } catch {
    return null;
  }
}
function giorno(iso) {
  const t = Date.parse(String(iso || "").slice(0, 10));
  return Number.isNaN(t) ? null : t;
}

// (1) SERIE ONESTA (voto_pieno)
const sj = leggi(STORICO);
const serie = sj && Array.isArray(sj.serie) ? sj.serie : Array.isArray(sj) ? sj : [];
// solo gli snapshot che HANNO un voto_pieno (le radiografie complete; gli auto-fix non lo scrivono)
const conPieno = serie.filter((s) => s && s.voto_pieno != null);
const ultimoPieno = conPieno.length ? Number(conPieno[conPieno.length - 1].voto_pieno) : null;
const ultimi = conPieno.slice(-10);
const fermiAZero = ultimi.filter((s) => Number(s.voto_pieno) === 0).length;
const primoPieno = conPieno.length ? Number(conPieno[0].voto_pieno) : null;
let trend = "n/d";
if (ultimoPieno != null && primoPieno != null) {
  trend = ultimoPieno > primoPieno ? "in salita" : ultimoPieno < primoPieno ? "in discesa" : "PIATTO";
}

// (2) BURN-DOWN CANTIERE
const cj = leggi(CANTIERE);
// ⚠️ Il cantiere illeggibile NON diventa una lista vuota. `contaDifetti` risponde `letto: false` con
// tutti i conti a `null`, e quel null viaggia fino al verdetto: qui sotto diventa uscita 2 (cieco).
const difetti = cj && Array.isArray(cj.difetti) ? cj.difetti : null;
const conto = contaDifetti(difetti);

// "ORA" ancorato all'ultima data del cantiere (niente Date.now non deterministico nel report principale)
const dateNote = (difetti || []).map((d) => giorno(d?.chiuso_il) || giorno(d?.nato)).filter((x) => x != null);
const oraMs = dateNote.length ? Math.max(...dateNote) : null;
const settimanaFaMs = oraMs != null ? oraMs - 7 * 86400000 : null;

// AR-671 — il numero di ADESSO non passa più dalle date: si conta sulla lista. Le date servono solo
// a guardare INDIETRO, ed è lì che l'incertezza esiste davvero e va detta.
const apertiOra = conto.da_fare;
const indietro = settimanaFaMs != null ? apertiAllaData(difetti, settimanaFaMs) : { conteggio: null, ignoti: null };
const apertiSettimanaFa = indietro.conteggio;
const ignotiSettimanaFa = indietro.ignoti;
const burnDown =
  apertiOra != null && apertiSettimanaFa != null ? apertiSettimanaFa - apertiOra : null; // >0 = migliora

// AR-671 / AR-753 — sono DUE domande, e per un giorno hanno litigato su un nome solo.
//
//   · «di quanto può sbagliare il confronto qui sopra?» → riguarda una settimana fa, e la risposta è
//     `ignotiSettimanaFa`: le schede che non so collocare a quella data. Una chiusa ieri senza data di
//     nascita allora era aperta, quindi conta. Oggi sono 15.
//   · «quante non so collocare ADESSO?» → riguarda oggi, e sono le non chiuse senza data. Oggi sono 2.
//
// Un campo solo per due domande ha prodotto due prove di casa che pretendevano numeri opposti: chi ne
// accontentava una rompeva l'altra, e sono state entrambe rosse a turno nello stesso giorno. La cura
// non è scegliere il numero giusto — è **smettere di far rispondere un nome solo a due domande**.
const margineOra = difetti
  ? difetti.filter(Boolean).filter((d) => String(d?.stato ?? "").trim() !== "chiuso" && giorno(d?.nato) == null).length
  : null;

const report = {
  esito: conto.letto ? "ok" : "cieco",
  voto_onesto_ultimo: ultimoPieno,
  voto_onesto_trend: trend,
  rilevazioni_con_voto_pieno: conPieno.length,
  su_totale_snapshot: serie.length,
  ultimi10_fermi_a_zero: fermiAZero,
  cantiere_letto: conto.letto,
  cantiere_motivo_cecita: conto.motivo,
  cantiere_totale: conto.totale,
  cantiere_chiusi: conto.chiusi,
  cantiere_aperti_ora: apertiOra,
  // AR-684 — il terzo stato ha un nome e un numero suoi: prima non entrava in nessun totale.
  cantiere_da_riverificare: conto.da_riverificare,
  cantiere_per_stato: conto.per_stato,
  // Gli stati che il conto non sa nominare, detti per nome. Un buco che ha un nome non è più un buco.
  cantiere_stati_ignoti: conto.stati_ignoti,
  // AR-671 — quanti non so collocare nel tempo. Un numero che non c'è è diverso da uno zero.
  cantiere_senza_data_nascita: conto.senza_data_nascita,
  cantiere_aperti_settimana_fa: apertiSettimanaFa,
  cantiere_aperti_settimana_fa_ignoti: ignotiSettimanaFa,
  burn_down_settimana: burnDown, // positivo = il cantiere cala (bene)
  // Il margine DEL CONFRONTO qui sopra: riguarda una settimana fa, come il confronto stesso.
  burn_down_margine: ignotiSettimanaFa,
  // E l'altra domanda, con un nome suo: quante non so collocare ADESSO (AR-753).
  cantiere_aperti_senza_data_nascita: margineOra,
  cantiere_meta: cj?.meta ?? null,
};

/** 0 = ho misurato · 2 = non ho potuto guardare. Il cieco non esce mai con la faccia del verde. */
const USCITA = conto.letto ? 0 : 2;

/**
 * Il referto è calcolato qui sopra e si può leggere importando il file. Quello che invece NON deve
 * partire da solo è lo STAMPARLO e l'USCIRE: un modulo che chiude il processo quando lo importi non
 * si può interrogare, e chi volesse provarlo si ritroverebbe il programma addosso. AR-445.
 */
export { report, USCITA };

function main() {

  if (JSON_OUT) {
    process.stdout.write(JSON.stringify(report, null, 2));
    process.exit(USCITA);
  }

  console.log("📈 SALUTE ONESTA (sto migliorando nel tempo?)");
  console.log(`   voto ONESTO (voto_pieno) ultimo: ${ultimoPieno ?? "n/d"}  ·  trend: ${trend}`);
  console.log(`   rilevazioni con voto_pieno: ${conPieno.length}/${serie.length}  ·  ultimi 10 fermi a 0: ${fermiAZero}`);
  console.log("");
  if (!conto.letto) {
    console.log("⚪ NON HO POTUTO CONTARE IL CANTIERE.");
    console.log(`   ${conto.motivo}`);
    console.log(`   Il file che dovrei leggere: ${CANTIERE}`);
    console.log("   Questo NON è «zero difetti»: è che non ho guardato. Esco con 2.");
    process.exit(USCITA);
  }
  console.log("🔻 Burn-down cantiere difetti:");
  console.log(`   aperti ~7 giorni fa: ${apertiSettimanaFa ?? "n/d"}  →  aperti ora: ${apertiOra ?? "n/d"}`);
  console.log(
    `   il cantiere ha ${conto.totale} schede: ${conto.chiusi} chiuse, ${conto.da_fare} da fare` +
      ` (di cui ${conto.aperti} aperte, ${conto.in_corso} in corso, ${conto.da_riverificare} da riverificare` +
      `${conto.altri ? `, ${conto.altri} in stati che non so nominare` : ""}).`,
  );
  if (burnDown != null) {
    if (burnDown > 0) console.log(`   ✅ il cantiere CALA (${burnDown} difetti chiusi netti nella settimana).`);
    else if (burnDown < 0) console.log(`   ⚠️  il cantiere CRESCE (${-burnDown} difetti aperti netti in più): non va a zero.`);
    else console.log("   ⏸️  cantiere fermo (né su né giù).");
  }
  // AR-671 — il confronto con «una settimana fa» dice quanto può sbagliare. Prima quei difetti
  // uscivano dal conto in silenzio, e il burn-down migliorava da solo.
  if (ignotiSettimanaFa) {
    console.log(
      `   ⚠️  ${ignotiSettimanaFa} difetti su ${conto.totale} non hanno una data di nascita leggibile:` +
        ` non so dove stavano una settimana fa, quindi il confronto qui sopra può sbagliare fino a ${ignotiSettimanaFa}.`,
    );
  }
  console.log("");
  if (ultimoPieno === 0 || fermiAZero >= 8) {
    console.log("⚠️  Il metro ONESTO è fermo: il voto pieno non si muove (o resta 0). Il progresso");
    console.log("   'creditato' non è progresso reale. Prossimo passo: cablare questa serie come KPI nel");
    console.log("   Pannello e sbloccare l'auto-radiografia completa (oggi la sentinella la chiede ma non parte).");
  } else {
    console.log("✅ Il metro onesto si muove.");
  }
  process.exit(USCITA);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
