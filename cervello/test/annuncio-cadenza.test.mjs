#!/usr/bin/env node
// AR-389 — «Il piano del mattino dice sempre di essere andato bene, anche quando il motore non è
// mai partito.»
//
// Cosa prova, e perché così:
//   ① la TESTA (`annuncioCadenza` in cervello/esito-scrittura.mjs) su tutti i rami — motore saltato
//      dal delta-gate, motore fallito, ri-accodamento, vincoli attivi, successo vero;
//   ② la MANO (`cadenza_annuncio` in cervello/lib-cadenza.sh) ESEGUITA davvero in bash: la frase
//      esce sul canale giusto (stdout solo se il successo è stato guadagnato) e il codice di ritorno
//      lo dice al chiamante;
//   ③ la SPAZZATA DEI FRATELLI: nessuna delle tre cadenze (giro · ritmo · monitora) può tornare a
//      stampare un annuncio di successo INCONDIZIONATO. È la clausola ⑤ della scheda — «le quattro
//      cadenze, il monitoraggio e il giro sono copie della stessa procedura, e ogni cura viene
//      applicata alla copia in cui il sintomo è stato visto».
//
// Perché non basta leggere ritmo.sh: la riga incriminata ESISTEVA e diceva «completato». Solo
// eseguendo si vede se quella frase esce quando non se l'è guadagnata.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";
import { annuncioCadenza, codiceUscitaCadenza } from "../esito-scrittura.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const CERVELLO = join(QUI, "..");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

/** Esegue `cadenza_annuncio` per davvero, tenendo separati stdout e stderr. */
function annuncioBashCompleto(args) {
  // stdout e stderr separati: è il cuore della prova (una frase di fallimento su stdout sarebbe
  // letta come successo da chi guarda il log del servizio).
  const script = `set -uo pipefail
SCRIPT_DIR="${CERVELLO}"
ts() { echo "ORA"; }
. "${CERVELLO}/lib-cadenza.sh"
cadenza_annuncio ${args} > /tmp/_ann_out.$$ 2> /tmp/_ann_err.$$
echo "RC=$?"
echo "--OUT--"; cat /tmp/_ann_out.$$
echo "--ERR--"; cat /tmp/_ann_err.$$
rm -f /tmp/_ann_out.$$ /tmp/_ann_err.$$`;
  const t = execFileSync("bash", ["-c", script], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const rc = Number(/RC=(\d+)/.exec(t)?.[1] ?? -1);
  const out = t.split("--OUT--")[1]?.split("--ERR--")[0]?.trim() ?? "";
  const err = t.split("--ERR--")[1]?.trim() ?? "";
  return { rc, out, err };
}

// ── ① la testa ───────────────────────────────────────────────────────────────
prova("AR-389: col motore MAI acceso (delta-gate) non si dice «completato»", () => {
  const r = annuncioCadenza({ titolo: "Ritmo mattino", aiRc: 0, motoreAcceso: false });
  assert.equal(r.completato, false, "il delta-gate spegne il motore: non c'è nessun piano del mattino");
  assert.doesNotMatch(r.frase, /completato/i, `frase bugiarda: «${r.frase}»`);
  assert.match(r.frase, /SALTATA/i);
});

prova("AR-389: dopo tre tentativi falliti non si dice «completato»", () => {
  const r = annuncioCadenza({ titolo: "Ritmo mattino", aiRc: 1, tentativi: 3 });
  assert.equal(r.completato, false);
  assert.match(r.frase, /3 tentativi/);
  assert.doesNotMatch(r.frase, /completato/i);
});

prova("AR-389: la cadenza ri-accodata per rate-limit lo dice, e non è un successo", () => {
  const r = annuncioCadenza({ titolo: "Ritmo sera", aiRc: 2, tentativi: 3, riaccodata: true });
  assert.equal(r.completato, false);
  assert.match(r.frase, /ri-accodata/);
});

prova("AR-389: con vincoli ancora attivi non è una cadenza pulita", () => {
  const r = annuncioCadenza({ titolo: "Giro", aiRc: 0, vincoliAttivi: 2 });
  assert.equal(r.completato, false);
  assert.match(r.frase, /2 vincoli/);
});

prova("AR-389: il successo VERO resta un successo (il fix non spegne la frase buona)", () => {
  const r = annuncioCadenza({ titolo: "Ritmo mattino", aiRc: 0, motoreAcceso: true, vincoliAttivi: 0 });
  assert.equal(r.completato, true);
  assert.equal(r.frase, "Ritmo mattino completato.");
});

prova("AR-389: «non ho potuto misurare» non è un verde", () => {
  const r = annuncioCadenza({ titolo: "Ritmo mattino", misurato: false });
  assert.equal(r.completato, false);
});

// ── ② la mano, eseguita in bash ──────────────────────────────────────────────
prova("AR-389 (runtime): il fallimento NON esce su stdout e il rc lo dice", () => {
  const r = annuncioBashCompleto(`"Ritmo mattino" 0 0 1 0 0`); // ai_rc=0 ma motore spento
  assert.equal(r.rc, 1, "cadenza_annuncio deve tornare 1 quando non c'è niente da festeggiare");
  assert.equal(r.out, "", `una frase di fallimento su stdout: «${r.out}»`);
  assert.match(r.err, /SALTATA/);
});

prova("AR-389 (runtime): il successo guadagnato esce su stdout con rc 0", () => {
  const r = annuncioBashCompleto(`"Ritmo mattino" 0 1 1 0 0`);
  assert.equal(r.rc, 0);
  assert.match(r.out, /Ritmo mattino completato\./);
  assert.equal(r.err, "");
});

prova("AR-389 (runtime): se la testa non risponde, la mano NON inventa un successo", () => {
  // SCRIPT_DIR che non contiene esito-scrittura.mjs → node fallisce → deve uscire da stderr, rc≠0.
  const script = `set -uo pipefail
SCRIPT_DIR="/nonesiste-$$"
ts() { echo "ORA"; }
. "${CERVELLO}/lib-cadenza.sh"
cadenza_annuncio "Ritmo mattino" 0 1 1 0 0 > /tmp/_ann2_out.$$ 2>/dev/null
echo "RC=$?"
echo "--OUT--"; cat /tmp/_ann2_out.$$; rm -f /tmp/_ann2_out.$$`;
  const t = execFileSync("bash", ["-c", script], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  assert.match(t, /RC=1/, "senza misura non si dichiara completato");
  assert.doesNotMatch(t.split("--OUT--")[1] || "", /completato\./);
});

// ── ②bis l'ULTIMA clausola: non uscire 0 se la cadenza non è stata prodotta ──
prova("AR-389: col motore saltato il codice d'uscita NON può essere 0", () => {
  assert.equal(codiceUscitaCadenza({ codice: 0, annuncioOk: false }), 3, "era il caso peggiore della scheda");
  assert.equal(codiceUscitaCadenza({ codice: 0, annuncioOk: true }), 0, "il successo vero resta 0");
  assert.equal(codiceUscitaCadenza({ codice: 2, annuncioOk: false }), 2, "1/2/3 dicono già la verità");
  assert.equal(codiceUscitaCadenza({ codice: NaN }), 2, "non misurato non è un verde");
});

prova("AR-389 (runtime): la mano collega annuncio e codice d'uscita", () => {
  const script = `set -uo pipefail
SCRIPT_DIR="${CERVELLO}"
ts() { echo "ORA"; }
. "${CERVELLO}/lib-cadenza.sh"
cadenza_annuncio "Ritmo mezzogiorno" 0 0 1 0 0 >/dev/null 2>&1
echo "SALTATO=$(cadenza_uscita 0)"
cadenza_annuncio "Ritmo mattino" 0 1 1 0 0 >/dev/null 2>&1
echo "PULITO=$(cadenza_uscita 0)"`;
  const t = execFileSync("bash", ["-c", script], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  assert.match(t, /SALTATO=3/, "una cadenza mai prodotta non può uscire 0");
  assert.match(t, /PULITO=0/, "e una cadenza vera deve restare verde");
});

prova("AR-389: ritmo.sh esce dal codice deciso, non da quello grezzo", () => {
  const src = readFileSync(join(CERVELLO, "ritmo.sh"), "utf8");
  assert.match(src, /exit "\$\(cadenza_uscita /, "l'exit deve passare dalla testa che conosce l'annuncio");
});

// ── ③ la spazzata dei fratelli ───────────────────────────────────────────────
// La malattia «annuncio di successo fuori dal ramo che lo ha guadagnato»: una frase di successo
// stampata a colonna zero (cioè fuori da ogni `if`) in uno dei tre copioni di cadenza.
prova("AR-389 (fratelli): nessuna cadenza stampa un successo INCONDIZIONATO", () => {
  const colpevoli = [];
  for (const f of ["giro.sh", "ritmo.sh", "monitora.sh"]) {
    const righe = readFileSync(join(CERVELLO, f), "utf8").split("\n");
    righe.forEach((r, i) => {
      if (/^echo\s+.*(completat[oa]|riuscit[oa]|✅)/i.test(r) && !/cadenza_annuncio/.test(r)) {
        colpevoli.push(`${f}:${i + 1} → ${r.trim()}`);
      }
    });
  }
  assert.deepEqual(
    colpevoli,
    [],
    `annuncio di successo fuori dal ramo che lo ha guadagnato:\n  ${colpevoli.join("\n  ")}`,
  );
});

prova("AR-389 (fratelli): ritmo.sh chiede la frase alla testa comune", () => {
  const src = readFileSync(join(CERVELLO, "ritmo.sh"), "utf8");
  assert.match(src, /cadenza_annuncio "Ritmo \$RITMO_TIPO"/, "ritmo.sh deve passare dalla mano comune");
});

// ── esito ────────────────────────────────────────────────────────────────────
const rotti = casi.filter((c) => !c.ok);
for (const c of casi) process.stdout.write(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n     ${c.err}`}\n`);
process.stdout.write(`\n${casi.length - rotti.length}/${casi.length} passati\n`);
process.exit(rotti.length ? 1 : 0);
