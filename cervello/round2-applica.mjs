#!/usr/bin/env node
// 🔧 APPLICA IL ROUND 2 del programma intelligenza (2026-07-25). Idempotente: rieseguibile senza danno.
//
// Perché esiste come script invece che come diff: la sessione cloud che ha prodotto il round 2 non ha
// il permesso di `git push`, e i due file da modificare (cantiere-difetti.json 141KB, giro.sh 56KB)
// sono troppo grossi per passare dall'API GitHub senza rischiare una trascrizione corrotta — e un
// cantiere corrotto è peggio di un fix non consegnato. Questo script porta la stessa modifica, in
// poche righe, applicandola sul posto e verificandola.
//
// Cosa fa, in due mosse:
//   ① REGISTRO — chiude AR-144 e AR-117 (stesso freno budget-token, provato funzionante end-to-end)
//      e apre AR-155 per il residuo onesto (il gate protegge con le STIME, non col consumo reale).
//      Rimette anche le prove automatiche sul file GIUSTO: puntavano a giro.sh, il fix è in costo-ai.mjs.
//   ② GIRO — aggancia i due guardiani nuovi (cantiere-prove, pagella-intelligenza) a cervello/giro.sh,
//      INFORMATIVI (|| true), non come vincolo hard: oggi cantiere-prove fallirebbe subito (bloccanti
//      non verificabili) e bloccherebbe ogni giro invece di migliorarlo.
//
// Uso:
//   node cervello/round2-applica.mjs --dry   -> dice cosa farebbe, non tocca nulla
//   node cervello/round2-applica.mjs         -> applica (e ristampa lo stato)

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";

const DRY = process.argv.includes("--dry");
const ORA = "2026-07-25 01:15";

const CANTIERE = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");
const GIRO = join(AD_ROOT, "cervello/giro.sh");

const PROVA_FRENO = { file: "cervello/costo-ai.mjs", pattern: "tokenPerGate", presente: true };

const BLOCCO_GIRO = `  # Round 2 programma intelligenza (2026-07-25). Due misure, per ora INFORMATIVE (|| true):
  #  · cantiere-prove: quanti difetti nessun guardiano può chiudere (il caso AR-144/AR-117 — fix
  #    mergiato e provato, ma il cantiere lo contava ancora aperto perché la prova puntava altrove).
  #  · pagella-intelligenza: i 5 numeri di "quando la macchina è pronta", con lo storico del movimento.
  # NON sono vincoli hard: oggi cantiere-prove fallirebbe subito (bloccanti non verificabili) e
  # bloccherebbe ogni giro invece di migliorarlo. Si promuove a cancello quando bloccanti_ciechi = 0.
  echo "[$(ts)] Guardiano prove del cantiere (difetti che nessuno può chiudere)..."
  node "$SCRIPT_DIR/cantiere-prove.mjs" 2>&1 | tail -4 || true
  echo "[$(ts)] Pagella dell'intelligenza (quanto manca a 'pronta')..."
  node "$SCRIPT_DIR/pagella-intelligenza.mjs" 2>&1 | tail -8 || true
`;
const ANCORA_GIRO = `  echo "[$(ts)] Guardiano allocazione sforzo (AR-006: pesante solo su entità confermata)..."`;

const fatto = [];
const saltato = [];

// ─────────────── ① registro ───────────────
if (!existsSync(CANTIERE)) {
  console.error(`❌ cantiere non trovato: ${CANTIERE}`);
  process.exit(1);
}
const cant = JSON.parse(readFileSync(CANTIERE, "utf8"));
const trova = (id) => cant.difetti.find((d) => d.id === id);

if (trova("AR-155")) {
  saltato.push("registro: AR-155 già presente (round 2 già applicato)");
} else {
  const a = trova("AR-144");
  const b = trova("AR-117");
  if (!a || !b) {
    console.error("❌ AR-144 o AR-117 non trovati nel cantiere: non applico nulla (registro inatteso).");
    process.exit(1);
  }
  a.stato = "chiuso";
  a.chiuso_il = ORA;
  a.chiuso_come =
    "Fix mergiato in main (PR #519, cervello/costo-ai.mjs): il gate ora usa max(token_totali, token_stimati). PROVATO end-to-end il 25/7: con 275.000 stimati e soglia 100.000 stampa SOGLIA SUPERATA; con 50.000 non scatta. Il contatore delle stime è vivo (275.000 registrati il 24/7).";
  a.verifica = { ...PROVA_FRENO };

  b.stato = "chiuso";
  b.chiuso_il = ORA;
  b.chiuso_come =
    "DUPLICATO di AR-144 per la parte bloccante (stesso freno, stessa causa, stesso file costo-ai.mjs): chiuso dallo stesso fix, provato end-to-end. La sua prova puntava al file SBAGLIATO (cercava token_stimati in giro.sh, il fix è in costo-ai.mjs) — per questo non si è mai chiuso da solo. Il residuo NON bloccante (conteggio token reale da motore-ai.sh + test bats) resta tracciato in AR-155.";
  b.verifica = { ...PROVA_FRENO };

  cant.difetti.push({
    id: "AR-155",
    titolo:
      "Il gate budget-token protegge con le STIME, non con il consumo reale: manca la cattura usage da motore-ai.sh e il test automatico",
    dimensione: "freni-sicurezza",
    gravita: "grave",
    impatto_crescita: "medio",
    causa_radice:
      "PR #519 ha reso vivo il gate usando max(token_totali, token_stimati), ma token_totali resta sempre 0 perché nessuno registra il consumo reale: le stime hanno un margine di errore non misurato. Residuo dei punti (a) e (c) di AR-117.",
    fix_proposto:
      "🟡 (a) catturare usage reale dagli eventi result dello stream-json in un punto unico (motore-ai.sh) e registrarlo senza --stima; (c) test bats con un costo-ai.json fittizio oltre soglia che verifichi RUN_AI=0.",
    colore: "🟡",
    stato: "aperto",
    nato: ORA,
    origine: "round 2 programma intelligenza (2026-07-25): residuo scorporato da AR-117 alla sua chiusura",
    verifica: { file: "cervello/motore-ai.sh", pattern: "token_reali|usage", presente: true },
  });
  cant.aggiornato = ORA;
  if (!DRY) writeFileSync(CANTIERE, `${JSON.stringify(cant, null, 2)}\n`, "utf8");
  fatto.push("registro: AR-144 e AR-117 chiusi (con prova), AR-155 aperto per il residuo");
}

// ─────────────── ② giro ───────────────
if (!existsSync(GIRO)) {
  saltato.push(`giro: ${GIRO} non trovato`);
} else {
  const giro = readFileSync(GIRO, "utf8");
  if (giro.includes("cantiere-prove.mjs")) {
    saltato.push("giro: guardiani già agganciati");
  } else if (!giro.includes(ANCORA_GIRO)) {
    saltato.push("giro: punto di innesto non trovato (giro.sh cambiato) — aggancio a mano necessario");
  } else {
    const nuovo = giro.replace(ANCORA_GIRO, `${BLOCCO_GIRO}${ANCORA_GIRO}`);
    if (!DRY) writeFileSync(GIRO, nuovo, "utf8");
    fatto.push("giro: cantiere-prove + pagella-intelligenza agganciati (informativi)");
  }
}

// ─────────────── esito ───────────────
console.log(`\n🔧 ROUND 2 — ${DRY ? "PROVA A SECCO (niente scritto)" : "applicato"}\n`);
for (const f of fatto) console.log(`   ✅ ${f}`);
for (const s of saltato) console.log(`   ⏭️  ${s}`);
const bloccanti = cant.difetti.filter((d) => d.gravita === "bloccante" && d.stato !== "chiuso");
console.log(`\n   Bloccanti aperti: ${bloccanti.length} (${bloccanti.map((d) => d.id).join(", ")})`);
console.log(
  fatto.length
    ? "\n   Ora rimisura:  node cervello/pagella-intelligenza.mjs --gate\n"
    : "\n   Nulla da fare: era già applicato.\n",
);
process.exit(0);
