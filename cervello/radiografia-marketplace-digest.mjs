#!/usr/bin/env node
// 🏪 DIGEST RADIOGRAFIA DEL SITO — mette in UNA casa i difetti che gli audit trovano sul marketplace.
//
// I workflow lasciano il grezzo in `consegne/`: `radiografia` (13 dimensioni sul codice) in
// consegne/audit/, `audit-design` (11 dimensioni su cio' che si vede) in consegne/design/. Il
// Pannello pero' legge il VAULT: questo script prende l'ULTIMO referto di OGNI famiglia dichiarata
// in cervello/referti-sito.mjs e scrive la casa canonica in
// MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json.
//
// ── LE DUE COSE CHE QUESTO SCRIPT SBAGLIAVA, e che oggi non puo' piu' sbagliare ────────────────
// ① **Leggeva una famiglia sola.** Il filtro era un suffisso scritto qui dentro
//    (`-radiografia-marketplace-raw.json`) su una cartella sola. Il 22/8/2026 la radiografia del
//    design aveva trovato 208 problemi veri — 2 bloccanti che impedivano a ogni negoziante di
//    caricare la copertina della vetrina — e la Cabina diceva **0 problemi aperti sul sito**, perche'
//    nessuno leggeva quel file. Oggi le fonti sono un elenco dichiarato, e un referto grezzo che non
//    corrisponde a nessuna finisce in `fonti_non_lette`: i conti si rifiutano di dare un numero
//    finche' resta li'. La prossima famiglia che nasce fara' diventare la Cabina ⚪, non verde.
// ② **Ricostruiva l'elenco da zero**, riscrivendo `stato: "aperto"` su tutto. Rilanciarlo il 22/8
//    riportava ad aperti i 199 problemi riparati quel giorno (provato, non dedotto: e' il caso ③ di
//    cervello/test/il-referto-che-nessuno-legge.test.mjs). Oggi i problemi si fondono per chiave con
//    quelli gia' in casa, e il lavoro delle riparazioni sopravvive al rifacimento del referto.
//
// Uso: node cervello/radiografia-marketplace-digest.mjs   (🟢 legge i grezzi, scrive la memoria AI)
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import {
  CARTELLE_REFERTI,
  FONTI_SITO,
  refertiDaElenco,
  refertiNonLetti,
  ultimiPerFonte,
  problemiDaRaw,
  fondiConLaCasa,
  dimensioniDaProblemi,
} from "./referti-sito.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json");

/**
 * Scrive la casa canonica dei difetti del sito. È una FUNZIONE, non il corpo del file, perché
 * importare un modulo non deve eseguirne il programma: chi lo importa per riusare una decisione si
 * ritroverebbe il file riscritto sotto i piedi (malattia `programma-che-parte-importando`).
 */
export function scriviDigest() {

  // 1) Cosa c'e' su disco. Le cartelle vengono dalle fonti: non c'e' un secondo elenco da tenere allineato.
  const elenchi = CARTELLE_REFERTI.map((cartella) => {
    const dir = path.join(ROOT, cartella);
    return { cartella, nomi: existsSync(dir) ? readdirSync(dir) : [] };
  });
  const referti = refertiDaElenco(elenchi);
  const ultimi = ultimiPerFonte(referti);
  const nonLetti = refertiNonLetti(referti);

  if (ultimi.size === 0) {
    console.error(
      "Nessun referto grezzo riconosciuto in " + CARTELLE_REFERTI.join(", ") +
      " — lancia prima il workflow `radiografia` o `audit-design`.",
    );
    process.exit(1);
  }

  // 2) La casa com'e' adesso: serve PRIMA di scrivere, per conservare il lavoro delle riparazioni.
  let casaVecchia = null;
  if (existsSync(OUT)) {
    try {
      casaVecchia = JSON.parse(readFileSync(OUT, "utf-8"));
    } catch {
      // Casa illeggibile: si riparte dal referto, ma non in silenzio — chi lancia deve saperlo, perche'
      // e' esattamente il momento in cui gli stati delle riparazioni si perdono.
      console.error("⚠️  La casa esistente non e' leggibile: gli stati delle riparazioni NON si possono conservare.");
    }
  }

  // 3) Ogni famiglia porta i suoi problemi. Un referto di forma sconosciuta NON diventa una lista
  //    vuota: si dichiara non letto, come se non l'avessimo trovato.
  const conta = (elenco, sev) => elenco.filter((f) => f.severita === sev).length;
  const problemiNuovi = [];
  const dimensioni = [];
  const fonti = [];

  for (const fonte of FONTI_SITO) {
    const referto = ultimi.get(fonte.id);
    if (!referto) continue;
    let raw;
    try {
      raw = JSON.parse(readFileSync(path.join(ROOT, referto.file), "utf-8"));
    } catch (e) {
      nonLetti.push({ file: referto.file, perche: `il referto non si apre (${e.message}): i suoi problemi non sono nel conto` });
      continue;
    }
    const problemi = problemiDaRaw(raw, fonte);
    if (problemi == null) {
      nonLetti.push({
        file: referto.file,
        perche: "il referto non ha ne' `problemi[]` ne' `result[].findings`: la sua forma e' cambiata e questo digest non la sa leggere",
      });
      continue;
    }
    problemiNuovi.push(...problemi);
    dimensioni.push(...dimensioniDaProblemi(problemi, fonte));
    const reportRel = fonte.reportDi(referto.data);
    fonti.push({
      id: fonte.id,
      nome: fonte.nome,
      raw: referto.file,
      data: referto.data,
      report: existsSync(path.join(ROOT, reportRel)) ? reportRel : null,
      findings: problemi.length,
      agenti: Number(raw.agentCount) || null,
    });
  }

  // 4) La fusione con la casa: il referto e' la verita' sul problema, la casa quella sul lavoro fatto.
  const { problemi, conservati, orfani } = fondiConLaCasa(problemiNuovi, casaVecchia?.problemi);

  const meta = {
    findings: problemi.length,
    bloccanti: conta(problemi, "bloccante"),
    gravi: conta(problemi, "grave"),
    minori: conta(problemi, "minore"),
    agenti: fonti.reduce((s, f) => s + (f.agenti || 0), 0) || null,
  };

  // La data della casa e' quella del referto piu' recente fra le famiglie lette.
  const data = fonti.map((f) => f.data).filter(Boolean).sort().pop() ?? null;

  // 4-bis) Il confronto con la visita precedente, letto dalla casa che sto per sostituire.
  let confrontoPrecedente = null;
  if (casaVecchia?.data && casaVecchia.data !== data && casaVecchia?.meta?.findings) {
    confrontoPrecedente = {
      data: casaVecchia.data,
      findings: casaVecchia.meta.findings,
      bloccanti: casaVecchia.meta.bloccanti ?? null,
      gravi: casaVecchia.meta.gravi ?? null,
      minori: casaVecchia.meta.minori ?? null,
    };
  }

  // 5) La sintesi: se auto-radiografia.json ha gia' il riassunto di QUESTO stesso audit, riusala.
  let sintesi = "";
  const AUTORAD = path.join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-radiografia.json");
  if (existsSync(AUTORAD)) {
    try {
      const sm = JSON.parse(readFileSync(AUTORAD, "utf-8"))?.salute_marketplace;
      if (sm?.sintesi && String(sm?.fonte || "").includes(data)) sintesi = sm.sintesi;
    } catch { /* auto-radiografia illeggibile: la sintesi resta vuota, mai inventata */ }
  }
  if (!sintesi && casaVecchia?.sintesi) sintesi = casaVecchia.sintesi;

  const principale = fonti.find((f) => f.id === "marketplace") ?? fonti[0];

  const digest = {
    _cosa_e:
      "Casa canonica dei difetti del SITO: l'ultimo referto di ogni audit dichiarato in cervello/referti-sito.mjs " +
      "(radiografia del codice + radiografia del design), fuso in un elenco unico. L'elenco vivo sta in `problemi[]`: " +
      "i lotti di riparazione ci scrivono dentro lo stato, e rifare il digest NON lo cancella. `dimensioni[]` porta i " +
      "contatori, `fonti[]` dice da quali referti viene, `fonti_non_lette[]` quali audit esistono ma nessuno sa leggere " +
      "— e finche' quell'elenco non e' vuoto i conti restano ⚪ invece di dire uno zero. " +
      "Generato da cervello/radiografia-marketplace-digest.mjs. Il Pannello lo legge in Macchina → Radiografia marketplace.",
    data,
    fonte_raw: principale?.raw ?? null,
    report: principale?.report ?? null,
    fonti,
    fonti_non_lette: nonLetti,
    sintesi,
    meta,
    confronto_precedente: confrontoPrecedente,
    dimensioni,
    problemi,
  };

  // Cio' che ha scritto un ALTRO strumento in questa casa non si butta rifacendo il digest: il giro ci
  // lascia `sync_scan` (l'ora dell'ultimo riallineamento, che il Pannello mostra). Riscrivere il file
  // senza riportarlo indietro sarebbe la stessa malattia degli stati delle riparazioni, un piano sopra.
  if (casaVecchia?.sync_scan != null) digest.sync_scan = casaVecchia.sync_scan;

  writeFileSync(OUT, JSON.stringify(digest, null, 2) + "\n");
  console.log(
    `radiografia-marketplace.json scritto: ${data} · ${fonti.length} fonti (${fonti.map((f) => `${f.id}:${f.findings}`).join(", ")}) · ` +
    `${dimensioni.length} dimensioni · ${meta.findings} problemi ` +
    `(${meta.bloccanti} bloccanti · ${meta.gravi} gravi · ${meta.minori} minori)` +
    `${conservati ? ` · ${conservati} stati di riparazione conservati` : ""}` +
    `${orfani ? ` · ${orfani} fuori dal referto tenuti in casa` : ""}` +
    `${nonLetti.length ? ` · ⚠️ ${nonLetti.length} referti NON letti` : ""}`,
  );

}

// Si esegue solo quando lo lanci: `node cervello/radiografia-marketplace-digest.mjs`.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) scriviDigest();
