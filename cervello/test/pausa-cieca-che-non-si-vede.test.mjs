#!/usr/bin/env node
// 🛑 QUANDO L'INTERRUTTORE DI PAUSA NON RISPONDE, DEVE SAPERLO ANCHE CHI STA FUORI.
//
// IL CASO. `pausa_consenti_partenza` si ferma se non riesce a leggere lo stato della pausa, ed è la
// scelta giusta: meglio fermi che partiti mentre Nicola crede di aver messo in pausa. Ma il motivo
// finiva solo su stderr, e i tre copioni lo raccolgono con «|| exit 0». Se Supabase diventa
// irraggiungibile CON le chiavi presenti, giro, ritmo e monitoraggio si fermano tutti e tre insieme
// e fuori non arriva niente — e non PUÒ arrivare, perché la memoria si pubblica solo se le cadenze
// girano. In Cabina restano indistinguibili due cose molto diverse: «Nicola ha messo in pausa»
// (normale) e «non riesco a leggere se è in pausa» (guasto).
//
// È la stessa forma del blocco del 16/8: la macchina sa di essere ferma e non riesce a dirlo.
//
// COME SI PROVA. Non cercando `stampSegnale` nel sorgente — quello direbbe solo che la riga esiste.
// Si mette un canale FINTO al posto di quello vero (SCRIPT_DIR punta a una cartella con un
// git-github.mjs che scrive su file) e si guarda se ci arriva qualcosa: è il segnale osservato, non
// il codice letto.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const KILL = join(REPO, "cervello/kill-switch.sh");

/**
 * Esegue pausa_consenti_partenza con un canale finto e torna quello che ci è arrivato.
 *
 * @param rcLettura  rc finto della lettura dello stato: 0 = letta, ≠0 = non verificabile
 * @param corpo      corpo finto della risposta
 */
function scenaPausa(rcLettura, corpo) {
  const dir = mkdtempSync(join(tmpdir(), "pausa-cieca-"));
  try {
    const segnali = join(dir, "segnali.txt");
    // Il canale finto: stessa firma di quello vero, ma scrive su disco invece che in rete.
    writeFileSync(
      join(dir, "git-github.mjs"),
      `import { appendFileSync } from "node:fs";
export async function stampSegnale(canale, stato, messaggio) {
  appendFileSync(${JSON.stringify(segnali)}, JSON.stringify({ canale, stato, messaggio }) + "\\n");
}
`
    );
    const scena = join(dir, "scena.sh");
    writeFileSync(
      scena,
      `#!/usr/bin/env bash
SCRIPT_DIR="${dir}"
export SUPABASE_URL="https://finto" SUPABASE_SERVICE_KEY="finta"
. "${KILL}"
# Si sostituisce SOLO la mano che va in rete: la decisione resta quella vera.
pausa_stato() { printf '%s' '${corpo}'; return ${rcLettura}; }
pausa_consenti_partenza giro; echo "RC=$?"
`,
      { mode: 0o755 }
    );
    const r = spawnSync("bash", [scena], { encoding: "utf8", timeout: 30_000 });
    return {
      out: `${r.stdout || ""}${r.stderr || ""}`,
      segnali: existsSync(segnali) ? readFileSync(segnali, "utf8") : "",
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("se lo stato della pausa non si legge, il blocco esce dalla macchina", () => {
  const { out, segnali } = scenaPausa(7, "");
  assert.match(out, /RC=1/, "non verificabile resta fail-closed: non si parte");
  assert.notEqual(
    segnali,
    "",
    "fermarsi in silenzio è il difetto: tre cadenze giù insieme e in Cabina non arriva niente, perché la memoria si pubblica solo se le cadenze girano"
  );
  assert.match(segnali, /pausa-giro/, "il segnale deve dire QUALE cadenza si è fermata");
  assert.match(segnali, /non verificabile/, "e distinguere «non riesco a leggere» da «Nicola ha messo in pausa»");
});

test("una pausa VOLUTA da Nicola non è un guasto e non suona", () => {
  const { out, segnali } = scenaPausa(0, '[{"valore":"on"}]');
  assert.match(out, /RC=1/, "in pausa non si parte: questo non cambia");
  assert.equal(
    segnali,
    "",
    "gridare quando Nicola ha girato l'interruttore lui stesso insegnerebbe a ignorare il grido"
  );
});

test("via libera resta via libera", () => {
  const { out, segnali } = scenaPausa(0, '[{"valore":"off"}]');
  assert.match(out, /RC=0/, "il caso normale deve restare normale");
  assert.equal(segnali, "", "nessun rumore quando va tutto bene");
});
