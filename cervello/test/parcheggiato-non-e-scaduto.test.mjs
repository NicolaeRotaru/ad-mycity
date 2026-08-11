// ⏸️ CHI ASPETTA IL SUO RITENTATIVO NON È UN LAVORO ABBANDONATO.
//
// IL SINTOMO, detto da Nicola l'11/8 con la Cabina in mano: «nella coda lavori ci sono un sacco di
// lavori mai partiti da 6 giorni». Non erano mai partiti: erano partiti, falliti una volta, e la
// retry-policy li aveva PARCHEGGIATI con un `riprova_dopo` nel futuro — 6 ore di passo quando il
// motore AI ha esaurito il limite settimanale, fino a 4 ore sulla quota normale.
//
// LA CAUSA RADICE: due regole della stessa coda che si mordevano. Chi PRENDE i lavori rispettava il
// parcheggio (`or=(riprova_dopo.is.null,riprova_dopo.lte.now)`), chi li SCARTA no: contava l'attesa
// da `created_at` e ignorava del tutto `riprova_dopo`. Siccome ogni attesa della retry-policy supera
// i 120 minuti di soglia del giro, un giro fallito una volta era condannato: veniva chiuso in errore
// PRIMA dell'ora del proprio ritentativo, sempre, per costruzione.
//
// LE DUE PROVE DALLA CODA VERA (memoria, 11/8): il giro nato alle 11:00 aveva il ritentativo fissato
// alle 19:20 ed è stato chiuso alle 15:12 · il giro nato alle 00:31 lo aveva alle 13:09 ed è stato
// chiuso alle 09:03. Sono esattamente le card «Da riapprovare» che Nicola vedeva accumularsi.
//
// PERCHÉ QUESTA PROVA GIRA IN BASH E NON È UN GREP. Un grep su `riprova_dopo` direbbe solo che la
// parola compare nel file. Qui si ESEGUE la funzione vera del worker con una coda finta e si guarda
// CHI viene ucciso: se qualcuno rimette l'attesa a partire dalla nascita del lavoro, il primo caso
// torna rosso. Regge a una riscrittura della funzione, che è il punto di una prova.
//
// PERCHÉ È UN `.test.mjs` E NON UN `.bats`. I file `.bats` di questa cartella non li lancia nessun
// processo ricorrente: né `test-cervello.mjs` (filtra `.test.mjs`), né la CI, né il giro. Una prova
// che non guarda nessuno non è un freno. Questa entra nella suite che gira davvero.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const WORKER = join(REPO, "cervello", "worker.sh");

/**
 * Fa girare `scarta_lavori_scaduti` (la funzione VERA, estratta da worker.sh) su una coda finta.
 * `curl` è sostituito da uno stub: la GET degli in_attesa rende i lavori passati qui, e ogni PATCH
 * — cioè ogni lavoro che il worker sta chiudendo in errore — finisce in un log che poi leggiamo.
 * Rende l'elenco degli id che sono stati chiusi.
 */
function chiusiDaGuardiano(lavori) {
  const script = `
    set -u
    TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
    CAP="$TMP/patch.log"; : > "$CAP"
    cat > "$TMP/coda.json" <<'CODA'
${JSON.stringify(lavori)}
CODA
    cat > "$TMP/curl" <<STUB
#!/usr/bin/env bash
args="\\$*"
if [[ "\\$args" == *"-X PATCH"* ]]; then
  for a in "\\$@"; do case "\\$a" in *id=eq.*) printf '%s\\n' "\\$a" | sed 's/.*id=eq\\.//' >> "$CAP";; esac; done
  exit 0
fi
if [[ "\\$args" == *"stato=eq.in_attesa"* ]]; then cat "$TMP/coda.json"; exit 0; fi
echo '[]'
STUB
    chmod +x "$TMP/curl"
    PATH="$TMP:$PATH"

    export SUPABASE_URL="http://stub"; AUTH=(-H "x: y")
    SOGLIA_GIRO_MIN=120
    SOGLIA_ABBANDONO_MIN=2880
    ts() { echo TS; }

    # Le funzioni VERE dal worker. _eta_min è inclusa apposta: il segno negativo su un istante
    # futuro è parte della regola che stiamo provando, non un dettaglio da imitare in un finto.
    eval "$(awk '/^_eta_min\\(\\) \\{/,/^\\}/' "${WORKER}")"
    eval "$(awk '/^_dead_letter\\(\\) \\{/,/^\\}/' "${WORKER}")"
    eval "$(awk '/^scarta_lavori_scaduti\\(\\) \\{/,/^\\}/' "${WORKER}")"

    scarta_lavori_scaduti 2>/dev/null
    cat "$CAP"
  `;
  const r = spawnSync("bash", ["-c", script], { cwd: REPO, encoding: "utf8", timeout: 60_000 });
  assert.equal(r.status, 0, `lo scenario non è partito: ${r.stderr || r.stdout}`);
  return String(r.stdout).split("\n").map((s) => s.trim()).filter(Boolean);
}

const oreFa = (n) => new Date(Date.now() - n * 3600_000).toISOString();
const oreTra = (n) => new Date(Date.now() + n * 3600_000).toISOString();

test("un giro che aspetta il suo ritentativo NON viene chiuso in errore", () => {
  const chiusi = chiusiDaGuardiano([
    { id: "giro-parcheggiato", tipo: "giro", created_at: oreFa(6), riprova_dopo: oreTra(4) },
  ]);
  assert.deepEqual(
    chiusi,
    [],
    "REGRESSIONE: ucciso un giro che stava aspettando il proprio ritentativo → in Cabina ricompare come «lavoro mai partito, da riapprovare»"
  );
});

test("un giro prendibile da 5 ore oltre la soglia viene chiuso (il guardiano funziona ancora)", () => {
  const chiusi = chiusiDaGuardiano([
    { id: "giro-prendibile-da-5h", tipo: "giro", created_at: oreFa(6), riprova_dopo: oreFa(5) },
  ]);
  assert.deepEqual(chiusi, ["giro-prendibile-da-5h"], "il guardiano non chiude più i lavori davvero fermi");
});

test("un giro vecchio senza ritentativo resta trattato come prima", () => {
  const chiusi = chiusiDaGuardiano([
    { id: "giro-senza-ritentativo", tipo: "giro", created_at: oreFa(6), riprova_dopo: null },
  ]);
  assert.deepEqual(chiusi, ["giro-senza-ritentativo"], "regressione sul caso base (nessun riprova_dopo)");
});

test("il parcheggiato si salva ma i vicini scaduti muoiono lo stesso (la coda non si intasa)", () => {
  const chiusi = chiusiDaGuardiano([
    { id: "giro-parcheggiato", tipo: "giro", created_at: oreFa(6), riprova_dopo: oreTra(4) },
    { id: "giro-vecchio", tipo: "giro", created_at: oreFa(6), riprova_dopo: null },
  ]);
  assert.deepEqual(chiusi, ["giro-vecchio"], "il salvataggio del parcheggiato non deve bloccare la pulizia della coda");
});
