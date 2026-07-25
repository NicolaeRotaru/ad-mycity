#!/usr/bin/env node
// 🔌 AGGANCIA I TEST AL GIRO. Applica a `cervello/giro.sh` le tre modifiche del 25/7.
// 🟡 Tocca il ciclo principale della macchina — per questo esiste come script invece che come
//    diff ritrascritto: `giro.sh` è di 914 righe e passarlo attraverso l'API di GitHub significa
//    ribatterlo a mano tutto. Una svista lì dentro ferma la macchina. Qui invece si cambiano tre
//    punti precisi, e se un punto non si trova lo script si ferma senza scrivere niente.
//
// COSA CHIUDE. Il 25/7, controllando il guardiano dei test del Pannello appena costruito, è
// saltato fuori che quel guardiano non gira da nessuna parte: né nel giro, né in CI. E con lui
// nemmeno i test di `cervello/test/`. Esistono solo quando una persona li digita a mano. Cioè: la
// rete costruita per scoprire i test che nessuno esegue era finita nella stessa condizione.
//
// LE TRE MODIFICHE:
//   ① dichiara `TEST_VINCOLO=""` accanto agli altri vincoli;
//   ② dopo la pagella, esegue `test-cervello.mjs` come VINCOLO HARD e `test-pannello.mjs` come
//      informativo (il perché della differenza è scritto nel blocco stesso);
//   ③ inietta il vincolo nel prompt del motore, come già fanno gli altri guardiani.
//
// È IDEMPOTENTE: se le modifiche ci sono già, non fa niente ed esce 0. Si può rilanciare.
//
// Uso (dal VPS, dentro /opt/mycity/ad-mycity):
//   node cervello/round6-giro.mjs            -> mostra cosa cambierebbe, NON scrive
//   node cervello/round6-giro.mjs --applica  -> scrive giro.sh (dopo aver verificato `bash -n`)

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { AD_ROOT } from "./git-github.mjs";

const APPLICA = process.argv.includes("--applica");
const GIRO = join(AD_ROOT, "cervello/giro.sh");

const BLOCCO_TEST = `
  # ─── I TEST GIRANO A OGNI GIRO (25/7) ─────────────────────────────────────────────────
  # Il difetto, trovato controllando il guardiano che avevo appena costruito: i 92 test di
  # \`cervello/test/\` e i 18 del Pannello NON li lanciava nessuno. Non il giro, non una CI — solo
  # una persona che li digitava a mano. Avevo costruito \`test-pannello.mjs\` proprio per scoprire
  # i test che nessuno esegue, e l'avevo lasciato nella stessa condizione. Una rete che nessuno
  # tende non è una rete.
  #
  # CERVELLO = VINCOLO HARD. Sono test puri di Node su moduli .mjs: niente rete, niente DB, niente
  # compilatore. Se diventano rossi sono rossi davvero, e il giro deve saperlo prima di decidere
  # qualsiasi cosa — non dopo. ~2 secondi.
  echo "[$(ts)] Test del cervello (92 asserzioni: la rete c'è o non c'è)..."
  _testc_out="$(node "$SCRIPT_DIR/test-cervello.mjs" 2>&1)"; _testc_rc=$?
  printf '%s\\n' "$_testc_out" | tail -6
  if [ "$_testc_rc" -ne 0 ]; then
    TEST_VINCOLO="⛔ TEST DEL CERVELLO ROSSI (test-cervello.mjs rc=$_testc_rc): uno o più file di test non passano o non partono. NON dichiarare 'fatto' e non aprire PR finché non tornano verdi: rimettili a posto PRIMA di ogni altro lavoro, poi rilancia 'node cervello/test-cervello.mjs'. Un test rosso ignorato è il difetto che ha generato tutti gli altri."
    echo "[$(ts)] ⚠️  Test del cervello ROSSI (rc=$_testc_rc) → passo un vincolo hard al motore." >&2
  fi
  # PANNELLO = INFORMATIVO, e il motivo è onesto: girano solo col type-stripping di Node (≥22.18),
  # e da qui non posso verificare quale Node esegue davvero il giro sul VPS. Consegnare un vincolo
  # hard che non ho potuto provare sulla macchina bersaglio è l'errore che ho già fatto. Si promuove
  # a cancello il giorno che lo si vede verde nel log del VPS.
  echo "[$(ts)] Test del Pannello (informativo finché non provato sul VPS)..."
  node "$SCRIPT_DIR/test-pannello.mjs" 2>&1 | tail -4 || true
`;

const BLOCCO_PROMPT = `if [ -n "\${TEST_VINCOLO:-}" ]; then
  # 25/7: i test del cervello girano a ogni giro e il loro rosso arriva al motore come regola hard.
  # Prima non li lanciava nessuno: esistevano solo quando una persona li digitava a mano.
  PROMPT="$PROMPT

## Vincolo test del cervello (HARD — dal guardiano test-cervello prima di te)
$TEST_VINCOLO"
fi
`;

/** Le tre modifiche, ognuna con la sua ancora. Pure: il test le prova senza toccare il disco. */
export const MODIFICHE = [
  {
    nome: "① dichiarazione TEST_VINCOLO",
    gia: 'TEST_VINCOLO=""',
    ancora: 'LOOP_VINCOLO=""       # PZ-008: vincolo del gate chiusura-loop (FATTO in Sala senza ESITO nel quaderno)',
    dopo: (a) => `${a}\nTEST_VINCOLO=""       # 25/7: test del cervello rossi o ineseguibili (prima non li lanciava nessuno)`,
  },
  {
    nome: "② esecuzione dei test nel giro",
    gia: "test-cervello.mjs",
    ancora:
      '  node "$SCRIPT_DIR/pagella-intelligenza.mjs" 2>&1 | tail -8 || true\n  echo "[$(ts)] Guardiano allocazione sforzo',
    dopo: (a) =>
      a.replace(
        '\n  echo "[$(ts)] Guardiano allocazione sforzo',
        `\n${BLOCCO_TEST}\n  echo "[$(ts)] Guardiano allocazione sforzo`,
      ),
  },
  {
    nome: "③ vincolo iniettato nel prompt del motore",
    gia: "## Vincolo test del cervello",
    ancora: `## Vincolo chiusura-loop (HARD — dal gate chiusura-loop prima di te)
$LOOP_VINCOLO"
fi
`,
    dopo: (a) => `${a}${BLOCCO_PROMPT}`,
  },
];

/** Applica le modifiche mancanti. Restituisce il testo nuovo e cosa ha fatto. Pura. */
export function applica(testo, modifiche = MODIFICHE) {
  const esiti = [];
  let out = testo;
  for (const m of modifiche) {
    if (out.includes(m.gia)) {
      esiti.push({ nome: m.nome, esito: "già presente" });
      continue;
    }
    const quante = out.split(m.ancora).length - 1;
    if (quante !== 1) {
      // Zero = il file non è quello che mi aspetto. Più di uno = non so DOVE mettere la modifica.
      // In entrambi i casi mi fermo: meglio non fare niente che scrivere nel punto sbagliato.
      esiti.push({ nome: m.nome, esito: quante === 0 ? "ANCORA NON TROVATA" : `ANCORA AMBIGUA (${quante} volte)` });
      return { out: testo, esiti, ok: false };
    }
    out = out.replace(m.ancora, m.dopo(m.ancora));
    esiti.push({ nome: m.nome, esito: "applicata" });
  }
  return { out, esiti, ok: true };
}

function main() {
  const originale = readFileSync(GIRO, "utf8");
  const { out, esiti, ok } = applica(originale);

  console.log(`\n🔌 AGGANCIO DEI TEST AL GIRO — cervello/giro.sh\n`);
  for (const e of esiti) console.log(`  ${e.esito === "applicata" ? "✅" : e.esito === "già presente" ? "•" : "❌"} ${e.nome}: ${e.esito}`);

  if (!ok) {
    console.error(`\n❌ Fermato: giro.sh non è nella forma attesa. NON ho scritto niente.`);
    console.error(`   Probabile causa: il file è cambiato da quando questo script è stato scritto.`);
    process.exitCode = 1;
    return;
  }
  if (out === originale) {
    console.log(`\n• Niente da fare: le tre modifiche ci sono già.`);
    return;
  }
  if (!APPLICA) {
    console.log(`\n⏸  Anteprima soltanto (+${out.split("\n").length - originale.split("\n").length} righe).`);
    console.log(`   Per scrivere davvero:  node cervello/round6-giro.mjs --applica`);
    return;
  }

  // Cintura di sicurezza: si scrive solo se il risultato è bash VALIDO. Un giro.sh con un errore
  // di sintassi non parte più, e la macchina si ferma davvero — non «degrada», si ferma.
  const tmp = `${GIRO}.round6-prova`;
  writeFileSync(tmp, out, "utf8");
  const check = spawnSync("bash", ["-n", tmp], { encoding: "utf8" });
  if (check.status !== 0) {
    console.error(`\n❌ Il risultato NON è bash valido — non lo scrivo. Provalo con: bash -n ${tmp}`);
    console.error(check.stderr || "");
    process.exitCode = 1;
    return;
  }
  writeFileSync(`${GIRO}.prima-del-round6`, originale, "utf8");
  writeFileSync(GIRO, out, "utf8");
  spawnSync("rm", ["-f", tmp]);
  console.log(`\n✅ Fatto. Copia di sicurezza: cervello/giro.sh.prima-del-round6`);
  console.log(`   Verifica:  bash -n cervello/giro.sh && node cervello/test-cervello.mjs`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
