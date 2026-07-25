#!/usr/bin/env node
// 🔌 LE MODIFICHE CHE NON PASSANO DALL'API. Un comando solo, dopo il merge della PR #549.
// 🟡 Tocca due file grossi: il ciclo principale della macchina e una schermata del Pannello.
//
// PERCHÉ ESISTE. Il lavoro arriva a Nicola attraverso l'API di GitHub, e l'API vuole il file
// INTERO: per cambiare tre righe di un file da 914 devo ribatterlo tutto a mano. Su `giro.sh`
// (il ciclo principale) e su `AutoCoscienza.tsx` (972 righe) una svista di trascrizione non è un
// dettaglio — la prima ferma la macchina, la seconda rompe la build del Pannello.
//
// Qui invece si cambiano SOLO i punti precisi, e se un punto non si trova (o si trova due volte)
// lo script si ferma senza scrivere niente. Meglio nessuna modifica che una nel posto sbagliato.
//
// COSA APPLICA:
//
//   ① giro.sh — I TEST GIRANO A OGNI GIRO.
//      Il difetto, trovato controllando il guardiano appena costruito: i 101 test del cervello e i
//      18 del Pannello non li lanciava nessuno. Non il giro, non una CI — solo una persona che li
//      digitava. Avevo costruito `test-pannello.mjs` proprio per scoprire i test che nessuno
//      esegue, e l'avevo lasciato nella stessa condizione. Tre modifiche: dichiara il vincolo,
//      esegue i due guardiani, e passa il rosso al motore come regola hard.
//
//   ② AutoCoscienza.tsx — L'ETICHETTA DICE QUELLO CHE IL NUMERO MISURA.
//      Due parole. Il Pannello mostra `tasso_applicazione` — la metrica delle CITAZIONI, quella
//      che la PR #549 sostituisce — sotto le scritte «% applicazione» e «Tasso applic.». Il numero
//      resta (serve per confrontare col passato), ma l'etichetta smette di promettere una cosa
//      che quel numero non misura: diventa «% citate» e «Lezioni citate».
//
// È IDEMPOTENTE: se le modifiche ci sono già non fa niente ed esce 0. Si può rilanciare.
//
// Uso (dal VPS, dentro /opt/mycity/ad-mycity, dopo il merge):
//   node cervello/round6-applica.mjs            -> mostra cosa cambierebbe, NON scrive
//   node cervello/round6-applica.mjs --applica  -> scrive (dopo aver verificato la sintassi)

import { existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { AD_ROOT } from "./git-github.mjs";

const APPLICA = process.argv.includes("--applica");

const BLOCCO_TEST = `
  # ─── I TEST GIRANO A OGNI GIRO (25/7) ─────────────────────────────────────────────────
  # Il difetto, trovato controllando il guardiano che avevo appena costruito: i test di
  # \`cervello/test/\` e quelli del Pannello NON li lanciava nessuno. Non il giro, non una CI — solo
  # una persona che li digitava a mano. Avevo costruito \`test-pannello.mjs\` proprio per scoprire
  # i test che nessuno esegue, e l'avevo lasciato nella stessa condizione. Una rete che nessuno
  # tende non è una rete.
  #
  # CERVELLO = VINCOLO HARD. Sono test puri di Node su moduli .mjs: niente rete, niente DB, niente
  # compilatore. Se diventano rossi sono rossi davvero, e il giro deve saperlo prima di decidere
  # qualsiasi cosa — non dopo. ~2 secondi.
  echo "[$(ts)] Test del cervello (la rete c'è o non c'è)..."
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

/**
 * I due file e le loro modifiche. `gia` = come si riconosce che è già applicata (idempotenza),
 * `ancora` = il testo esistente su cui agganciarsi, `dopo` = come diventa.
 * `verifica` = comando che DEVE passare sul risultato prima di scriverlo su disco.
 */
export const PIANO = [
  {
    file: "cervello/giro.sh",
    perche: "i test girano a ogni giro (prima non li lanciava nessuno)",
    verifica: ["bash", "-n"],
    modifiche: [
      {
        nome: "① dichiarazione TEST_VINCOLO",
        gia: 'TEST_VINCOLO=""',
        ancora:
          'LOOP_VINCOLO=""       # PZ-008: vincolo del gate chiusura-loop (FATTO in Sala senza ESITO nel quaderno)',
        dopo: (a) =>
          `${a}\nTEST_VINCOLO=""       # 25/7: test del cervello rossi o ineseguibili (prima non li lanciava nessuno)`,
      },
      {
        nome: "② esecuzione dei due guardiani nel giro",
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
        nome: "③ il rosso arriva al motore come vincolo hard",
        gia: "## Vincolo test del cervello",
        ancora: `## Vincolo chiusura-loop (HARD — dal gate chiusura-loop prima di te)
$LOOP_VINCOLO"
fi
`,
        dopo: (a) => `${a}${BLOCCO_PROMPT}`,
      },
    ],
  },
  {
    file: "pannello/src/components/AutoCoscienza.tsx",
    perche: "l'etichetta dice quello che il numero misura davvero (citazioni, non applicazione)",
    // Niente `tsc` qui: cambiano due stringhe dentro un template literal, e far girare il
    // compilatore vorrebbe dire pretendere node_modules sul VPS. La rete vera è che le due ancore
    // devono esistere esattamente una volta ciascuna: se il file cambia forma, non si tocca.
    verifica: null,
    modifiche: [
      {
        nome: "① il sottotitolo dice «citate»",
        gia: "}% citate`",
        ancora: "}% applicazione`",
        dopo: () => "}% citate`",
      },
      {
        nome: "② la casella dice «Lezioni citate»",
        gia: '{ l: "Lezioni citate"',
        ancora: '{ l: "Tasso applic."',
        dopo: () => '{ l: "Lezioni citate"',
      },
    ],
  },
];

/** Applica le modifiche mancanti a un testo. Pura: il test la prova senza toccare il disco. */
export function applica(testo, modifiche) {
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

function lavora(voce) {
  const path = join(AD_ROOT, voce.file);
  console.log(`\n📄 ${voce.file}`);
  console.log(`   ${voce.perche}`);
  if (!existsSync(path)) {
    console.error(`   ❌ file non trovato — salto (nessuna scrittura).`);
    return false;
  }
  const originale = readFileSync(path, "utf8");
  const { out, esiti, ok } = applica(originale, voce.modifiche);
  for (const e of esiti) {
    const icona = e.esito === "applicata" ? "✅" : e.esito === "già presente" ? "•" : "❌";
    console.log(`   ${icona} ${e.nome}: ${e.esito}`);
  }
  if (!ok) {
    console.error(`   ❌ Fermato: il file non è nella forma attesa. NON ho scritto niente.`);
    console.error(`      Probabile causa: è cambiato da quando questo script è stato scritto.`);
    return false;
  }
  if (out === originale) return true;
  if (!APPLICA) {
    console.log(`   ⏸  anteprima soltanto (+${out.split("\n").length - originale.split("\n").length} righe)`);
    return true;
  }

  // Cintura di sicurezza: si scrive solo se il risultato passa il suo controllo di sintassi.
  // Un giro.sh con un errore di sintassi non parte più, e la macchina non «degrada»: si ferma.
  if (voce.verifica) {
    const tmp = `${path}.round6-prova`;
    writeFileSync(tmp, out, "utf8");
    const check = spawnSync(voce.verifica[0], [...voce.verifica.slice(1), tmp], { encoding: "utf8" });
    unlinkSync(tmp);
    if (check.status !== 0) {
      console.error(`   ❌ il risultato non passa \`${voce.verifica.join(" ")}\` — non lo scrivo.`);
      console.error(check.stderr || "");
      return false;
    }
  }
  writeFileSync(`${path}.prima-del-round6`, originale, "utf8");
  writeFileSync(path, out, "utf8");
  console.log(`   ✅ scritto (copia di sicurezza: ${voce.file}.prima-del-round6)`);
  return true;
}

function main() {
  console.log(`\n🔌 LE MODIFICHE CHE NON PASSANO DALL'API`);
  let tutto = true;
  for (const voce of PIANO) tutto = lavora(voce) && tutto;

  if (!tutto) {
    console.error(`\n❌ Almeno un file non era nella forma attesa. Guarda sopra quale.`);
    process.exitCode = 1;
    return;
  }
  console.log(
    APPLICA
      ? `\n✅ Fatto. Verifica:  bash -n cervello/giro.sh && node cervello/test-cervello.mjs`
      : `\n⏸  Solo anteprima. Per scrivere davvero:  node cervello/round6-applica.mjs --applica`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) main();
