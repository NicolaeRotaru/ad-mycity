#!/usr/bin/env node
// IL COPIONE CHE SPARISCE SOTTO I PIEDI DI CHI LO STA ESEGUENDO.
//
// LA STORIA (22/8, 11:57). Sul server la riparazione dei conflitti era arrivata: il file
// `aggiorna-cervello.sh` la conteneva, `conflitti-memoria.mjs` era lì accanto. E non è stata
// eseguita. Nessun errore, nessun avviso: il copione ha stampato le prime righe e si è fermato,
// uscendo con successo. Da fuori sembrava che la riparazione non funzionasse.
//
// LA CAUSA, chiesta a bash e non dedotta. Bash NON carica il copione in memoria: lo legge un pezzo
// alla volta, tenendo la posizione nel file. Più sotto, `aggiorna-cervello.sh` mette da parte i file
// sporchi per far partire il rebase — e fra quelli c'era **sé stesso**, insieme al risolutore. La
// messa da parte ripristina la versione vecchia, che è più corta; bash torna a leggere alla vecchia
// posizione, trova la fine del file, e chiude. **Uscita 0.**
//
// È il modo peggiore in cui una cosa può rompersi: un pezzo di programma che non viene eseguito e
// non lo dice a nessuno. Un errore si vede; questo no.
//
// COSA PROVA QUESTO FILE:
//   ① il comportamento di bash, su un copione vero: si accorcia da solo → esegue solo l'inizio.
//      Se un giorno bash cambiasse idea, la prima prova lo direbbe prima del server.
//   ② che `aggiorna-cervello.sh` lavori su una COPIA di sé, che è la cura.
//   ③ che la cura funzioni davvero: lo stesso copione, protetto, arriva in fondo anche se il file
//      originale gli viene accorciato sotto.
//
// 🟢 Sola lettura sul repo dell'AD: tutto avviene in /tmp.

import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** Un copione che, a metà, riscrive sé stesso con una versione più corta. */
function copioneCheSiAccorcia(dir, { protetto }) {
  const f = join(dir, "prova.sh");
  const guardia = protetto
    ? `if [ -z "\${DA_COPIA:-}" ]; then
  copia="$(mktemp -t prova.XXXXXX.sh)"
  cp -- "\${BASH_SOURCE[0]}" "$copia"
  DA_COPIA=1 bash "$copia"
  rc=$?
  rm -f -- "$copia"
  exit $rc
fi
`
    : "";
  writeFileSync(
    f,
    `#!/usr/bin/env bash
${guardia}echo INIZIO
cat > "${f}" <<'ALTRO'
#!/usr/bin/env bash
echo corta
ALTRO
echo META
echo FINE
`,
  );
  return f;
}

const esegui = (f) => {
  const r = spawnSync("bash", [f], { encoding: "utf8" });
  return { uscita: `${r.stdout || ""}`.trim().split("\n").filter(Boolean), rc: r.status };
};

// ── ① IL COMPORTAMENTO DI BASH, che è la premessa di tutto ───────────────────
prova("un copione che si accorcia da solo si ferma a metà, e ESCE 0", () => {
  const dir = mkdtempSync(join(tmpdir(), "copione-sparisce-"));
  try {
    const { uscita, rc } = esegui(copioneCheSiAccorcia(dir, { protetto: false }));
    assert.deepEqual(uscita, ["INIZIO"], `atteso solo INIZIO, arrivato: ${JSON.stringify(uscita)}`);
    assert.equal(rc, 0, "la parte peggiore: esce 0, quindi da fuori sembra andata bene");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── ② e ③ LA CURA ───────────────────────────────────────────────────────────
prova("lavorando su una copia di sé, lo stesso copione arriva in fondo", () => {
  const dir = mkdtempSync(join(tmpdir(), "copione-protetto-"));
  try {
    const { uscita, rc } = esegui(copioneCheSiAccorcia(dir, { protetto: true }));
    assert.deepEqual(uscita, ["INIZIO", "META", "FINE"], `si è fermato lo stesso: ${JSON.stringify(uscita)}`);
    assert.equal(rc, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("aggiorna-cervello.sh si esegue da una copia di sé", () => {
  const testo = readFileSync(join(REPO, "cervello/vps/aggiorna-cervello.sh"), "utf8");
  // Non si cerca una parola: si cerca la MECCANICA — la copia, il marcatore che evita il ciclo, e il
  // fatto che la copia venga eseguita. Una frase in un commento non protegge niente.
  assert.match(testo, /AGGIORNA_DA_COPIA/, "manca il marcatore: senza, la ri-esecuzione va in ciclo infinito");
  assert.match(testo, /mktemp[^\n]*aggiorna-cervello/, "manca la copia temporanea");
  assert.match(
    testo,
    /AGGIORNA_DA_COPIA=1\s+bash\s+"\$_copia"/,
    "il copione non esegue la propria copia: la protezione è dichiarata e non fatta",
  );
});

prova("il copione mette da parte anche sé stesso: ecco perché la copia serve", () => {
  // La messa da parte prende i TRACCIATI sporchi, senza elenco di file — regola giusta (AR-347).
  // La conseguenza è che può prendere anche i copioni, e infatti il 22/8 li ha presi. Questa prova
  // tiene insieme le due cose: finché la messa da parte è generale, la copia NON è opzionale.
  const testo = readFileSync(join(REPO, "cervello/allineamento-esito.sh"), "utf8");
  assert.match(
    testo,
    /paths_da_mettere_da_parte/,
    "è sparita la messa da parte generale: se ora è a elenco, questa prova va riscritta con la ragione nuova",
  );
  const conflitto = "?? cervello/vps/aggiorna-cervello.sh\n M cervello/vps/aggiorna-cervello.sh";
  const r = spawnSync(
    "bash",
    ["-c", `. "${join(REPO, "cervello/allineamento-esito.sh")}"; paths_da_mettere_da_parte "$1" "$2"`, "_", conflitto, ""],
    { encoding: "utf8" },
  );
  assert.match(
    r.stdout || "",
    /aggiorna-cervello\.sh/,
    "la messa da parte NON prenderebbe il copione: allora la storia del 22/8 non si spiega più, e va ricontrollata",
  );
});

let falliti = 0;
for (const c of casi) {
  console.log(c.ok ? `  ✓ ${c.nome}` : `  ✗ ${c.nome}\n      ${c.err}`);
  if (!c.ok) falliti++;
}
console.log(`\n${casi.length - falliti}/${casi.length} passate`);
process.exit(falliti ? 1 : 0);
