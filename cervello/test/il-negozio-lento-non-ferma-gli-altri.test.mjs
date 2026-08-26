#!/usr/bin/env node
// AR-804 — «Il worker prende i lavori in ordine d'arrivo: con quaranta negozi il più lento li ferma tutti.»
//
// È la prova numero 3 delle sette del collaudo finale della BOTTEGA: *un negozio che va in loop non
// rallenta gli altri*.
//
// Il turno era già scritto e provato (`corsie.mjs`, 23/8) e non lo chiamava nessuno: il worker vero
// prendeva `order=created_at.asc&limit=1`. Una prova sulla funzione pura sarebbe rimasta verde
// esattamente come lo era prima — la funzione andava bene, era la porta a non esserci.
//
// Quindi questa prova ESEGUE la presa vera (`cervello/worker-coda.sh`, quella che `worker.sh`
// sorgente) dentro un bash con un `curl` finto, e guarda QUALE LAVORO ESCE. Un grep non
// distinguerebbe un turno da un FIFO con sopra il commento giusto.
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";
import { scegli, corsieDallaCoda, impostazioniDaRighe, statoCorsiaBottega, CENTRO } from "../bottega/scelta-worker.mjs";

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

/**
 * Il banco: un `curl` finto che risponde in base a COSA gli si chiede, e tiene il registro delle
 * chiamate. Così si può controllare non solo il lavoro scelto, ma anche che la richiesta FIFO non
 * sia stata fatta affatto.
 */
function banco({ chat = [], coda = [], inCorso = [], impostazioni = [], finestraRotta = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "coda-worker-"));
  mkdirSync(join(dir, "bin"), { recursive: true });
  const log = join(dir, "curl.log");
  const codaFile = join(dir, "coda.json");
  writeFileSync(codaFile, JSON.stringify(coda));
  const j = (x) => JSON.stringify(x).replace(/'/g, "'\\''");
  // Il curl finto parla il protocollo VERO in due passi: prima «quali negozi hanno lavori», poi
  // «il piu' vecchio di QUESTO negozio». L'ordine dei casi conta: la richiesta per negozio porta
  // dentro anche `stato=eq.in_attesa` e `limit=1`, quindi va riconosciuta per prima.
  writeFileSync(
    join(dir, "bin/curl"),
    `#!/usr/bin/env bash
url=""
for a in "$@"; do case "$a" in http*) url="$a";; esac; done
echo "$url" >> '${log}'
case "$url" in
  *tipo=eq.chat*)        printf '%s' '${j(chat)}';;
  *stato=eq.in_corso*)   printf '%s' '${j(inCorso)}';;
  *impostazioni*)        printf '%s' '${j(impostazioni)}';;
  *negozio_id=eq.*)
    n="\${url##*negozio_id=eq.}"; n="\${n%%&*}"
    jq -c --arg n "$n" '[.[]|select(.negozio_id==$n)][0:1]' '${codaFile}';;
  *select=negozio_id*)   ${finestraRotta ? `printf '%s' 'NON-JSON'` : `jq -c '[.[]|{negozio_id}]' '${codaFile}'`};;
  *stato=eq.in_attesa*)  jq -c '.[0:1]' '${codaFile}';;
  *)                     printf '%s' '[]';;
esac
exit 0
`,
    { mode: 0o755 },
  );
  chmodSync(join(dir, "bin/curl"), 0o755);
  return { dir, log };
}

/** Esegue la presa vera e torna { riga, id, stderr, chiamate }. */
function prendi({ lane = "", giri = 1, ...conf } = {}) {
  const { dir, log } = banco(conf);
  const copione = `
set -uo pipefail
SCRIPT_DIR='${CERVELLO}'
SUPABASE_URL='https://finto.invalid'
AUTH=(-H 'apikey: finta')
WORKER_LANE='${lane}'
_rtry=''
ts() { echo '00:00'; }
. "$SCRIPT_DIR/worker-coda.sh"
for i in $(seq 1 ${giri}); do
  coda_prossima_riga
  echo "SCELTO:$(printf '%s' "$CODA_RIGA" | jq -r '.[0].id // ""')"
done
echo "RIPIEGATA:$CODA_RIPIEGATA"
`;
  const fuori = execFileSync("bash", ["-c", copione], {
    encoding: "utf8",
    env: { ...process.env, PATH: `${join(dir, "bin")}:${process.env.PATH}` },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const scelti = [...fuori.matchAll(/^SCELTO:(.*)$/gm)].map((m) => m[1]);
  return {
    scelti,
    id: scelti[0] ?? "",
    ripiegata: /^RIPIEGATA:1$/m.test(fuori),
    chiamate: existsSync(log) ? readFileSync(log, "utf8").split("\n").filter(Boolean) : [],
  };
}

const conTetto = (id) => ({ chiave: `bottega:negozio:${id}`, valore: JSON.stringify({ tetto: 50 }) });

// ─────────────────────────────────────────────────────────────────────────────
// ① IL DIFETTO: il vecchio in testa non deve fermare chi sta dietro
// ─────────────────────────────────────────────────────────────────────────────
prova("il lavoro di un altro negozio parte anche se il primo della coda è più vecchio", () => {
  // forno-a ha accodato prima E ha già la sua quota occupata: in ordine d'arrivo uscirebbe `a1`.
  const coda = [
    { id: "a1", tipo: "analisi", negozio_id: "forno-a", created_at: "2026-08-26T08:00:00Z" },
    { id: "a2", tipo: "analisi", negozio_id: "forno-a", created_at: "2026-08-26T08:01:00Z" },
    { id: "b1", tipo: "analisi", negozio_id: "enoteca-b", created_at: "2026-08-26T09:00:00Z" },
  ];
  const r = prendi({
    coda,
    inCorso: [{ negozio_id: "forno-a" }],
    impostazioni: [conTetto("forno-a"), conTetto("enoteca-b")],
  });
  assert.equal(r.id, "b1", "doveva partire il lavoro dell'altro negozio, non il più vecchio");
  assert.notEqual(r.id, "a1", "è tornato l'ordine d'arrivo: il turno non è collegato");
  assert.equal(r.ripiegata, false, "non doveva ripiegare sull'ordine d'arrivo");
});

prova("trenta lavori di un negozio non spostano il turno dell'altro", () => {
  const coda = [
    ...Array.from({ length: 30 }, (_, i) => ({ id: `a${i}`, negozio_id: "forno-a" })),
    { id: "b1", negozio_id: "enoteca-b" },
  ];
  // Nessuno in corso: il primo giro tocca a forno-a, il secondo DEVE toccare a enoteca-b.
  const r = prendi({ coda, impostazioni: [conTetto("forno-a"), conTetto("enoteca-b")], giri: 2 });
  assert.equal(r.scelti[0], "a0");
  assert.equal(r.scelti[1], "b1", "al secondo giro doveva toccare all'altro negozio: il turno non gira");
});

prova("duecento lavori di un negozio non nascondono il lavoro appena accodato da un altro", () => {
  // LA BOCCIATURA DEL PERIMETRO. La prima versione leggeva una FINESTRA delle 200 righe piu'
  // vecchie e da quella deduceva le corsie: un negozio con 200 lavori in attesa la riempiva tutta,
  // e il lavoro di un altro negozio diventava INVISIBILE — «tutte le corsie sono ferme» con la coda
  // piena. Cioe' la fame che questo file esiste per togliere, rimessa dentro dal tetto.
  const coda = [
    ...Array.from({ length: 200 }, (_, i) => ({ id: `a${i}`, negozio_id: "forno-a" })),
    { id: "b1", negozio_id: "enoteca-b" },
  ];
  const r = prendi({
    coda,
    inCorso: [{ negozio_id: "forno-a" }],
    impostazioni: [conTetto("forno-a"), conTetto("enoteca-b")],
  });
  assert.equal(r.id, "b1", "il lavoro dell'altro negozio e' rimasto fuori dalla finestra: la fame e' tornata");
});

// ─────────────────────────────────────────────────────────────────────────────
// ② LA MACCHINA DI OGGI DEVE CONTINUARE A LAVORARE
// ─────────────────────────────────────────────────────────────────────────────
prova("con la sola coda del centro e nessun tetto dichiarato il lavoro parte lo stesso", () => {
  // Tutte e 3.281 le righe di oggi sono del centro e nessuno gli ha dichiarato un tetto. Se questa
  // diventa rossa, la macchina intera si ferma al primo giro: è il caso che ha bocciato la prima
  // versione di questo collegamento.
  const r = prendi({ coda: [{ id: "c1", negozio_id: CENTRO }, { id: "c2", negozio_id: CENTRO }] });
  assert.equal(r.id, "c1");
  assert.equal(r.ripiegata, false);
});

prova("una bottega vera senza tetto dichiarato NON lavora", () => {
  const r = prendi({ coda: [{ id: "x1", negozio_id: "forno-a" }] });
  assert.equal(r.id, "", "un negozio senza tetto ha speso quanto voleva");
});

// ─────────────────────────────────────────────────────────────────────────────
// ③ QUELLO CHE C'ERA PRIMA E NON DEVE ROMPERSI
// ─────────────────────────────────────────────────────────────────────────────
prova("la chat passa davanti a un lavoro di fondo più vecchio", () => {
  const r = prendi({
    chat: [{ id: "chat1", tipo: "chat", negozio_id: CENTRO }],
    coda: [{ id: "vecchio", negozio_id: CENTRO }],
  });
  assert.equal(r.id, "chat1", "Nicola aspetta in diretta: la chat passa sempre davanti");
});

prova("il worker solo-chat non si prende i lavori di fondo", () => {
  const r = prendi({ lane: "chat", coda: [{ id: "c1", negozio_id: CENTRO }] });
  assert.equal(r.id, "", "la corsia chat ha preso un lavoro che non è una chat");
  assert.ok(
    !r.chiamate.some((u) => u.includes("stato=eq.in_attesa") && !u.includes("tipo=eq.chat")),
    "la corsia chat ha comunque chiesto la coda di fondo",
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// ④ IL RIPIEGO SI VEDE
// ─────────────────────────────────────────────────────────────────────────────
prova("se la coda a corsie non è leggibile si ripiega sull'ordine d'arrivo, e lo dice", () => {
  const r = prendi({ coda: [{ id: "a1", negozio_id: "forno-a" }], finestraRotta: true });
  assert.equal(r.id, "a1", "il ripiego deve comunque far lavorare la macchina");
  assert.equal(r.ripiegata, true, "ha ripiegato in silenzio: un ripiego muto è peggio del difetto");
});

// ─────────────────────────────────────────────────────────────────────────────
// ⑤ IL GIUDIZIO PURO (le parti che il bash non può mostrare)
// ─────────────────────────────────────────────────────────────────────────────
prova("le corsie escono nell'ordine di arrivo, non in ordine alfabetico", () => {
  const c = corsieDallaCoda([{ negozio_id: "zeta" }, { negozio_id: "alfa" }, { negozio_id: "zeta" }]);
  assert.deepEqual(c.map((x) => x.negozioId), ["zeta", "alfa"]);
});

prova("un'impostazione illeggibile non diventa «nessun limite»", () => {
  const imp = impostazioniDaRighe([{ chiave: "bottega:negozio:forno-a", valore: "{rotto" }]);
  assert.deepEqual(imp["forno-a"], { illeggibile: true });
  const r = scegli({ coda: [{ id: "a1", negozio_id: "forno-a" }], impostazioni: imp });
  assert.equal(r.id, "", "un valore illeggibile ha aperto la corsia invece di chiuderla");
});

prova("il centro è esente SOLO dal tetto mancante, non dagli altri freni", () => {
  const quotaPiena = statoCorsiaBottega({ negozioId: CENTRO, quota: 1 }, { inCorso: 1 });
  assert.equal(quotaPiena.puoLavorare, false, "il centro ha scavalcato la quota");
  const guasto = statoCorsiaBottega({ negozioId: CENTRO, interruttore: "spento" }, { inCorso: 0 });
  assert.equal(guasto.puoLavorare, false, "l'interruttore non ha spento il centro");
  const tettoFinito = statoCorsiaBottega({ negozioId: CENTRO, tetto: 10, speso: 10 }, { inCorso: 0 });
  assert.equal(tettoFinito.puoLavorare, false, "un tetto dichiarato e finito non ha fermato il centro");
  const senzaTetto = statoCorsiaBottega({ negozioId: CENTRO }, { inCorso: 0 });
  assert.equal(senzaTetto.puoLavorare, true, "il centro si è fermato per un tetto che non è suo");
});

prova("quando non parte niente il motivo c'è sempre", () => {
  const r = scegli({ coda: [{ id: "a1", negozio_id: "forno-a" }] });
  assert.ok(r.motivo.includes("tetto"), `motivo muto: ${r.motivo}`);
  const vuota = scegli({ coda: [] });
  assert.equal(vuota.motivo, "la coda è vuota");
});

// ─────────────────────────────────────────────────────────────────────────────
const rotte = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "ok" : "NON ok"} — ${c.nome}${c.ok ? "" : `\n   ${c.err}`}`);
console.log(`\n${casi.length - rotte.length}/${casi.length} passate`);
if (rotte.length) process.exit(1);
