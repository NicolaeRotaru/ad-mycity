// 🏚️ UNA PROVA CHE SPORCA LA CASA DEGLI ALTRI — AR-919.
//
// IL CASO CHE HA ROTTO, misurato il 4/9. La prova di AR-917 chiedeva al banco delle mutazioni di
// misurare le mutazioni VERE del repo. Per misurarle il banco fa l'unica cosa che può fare: ROMPE
// il file vero, lancia la prova, e lo rimette a posto. Corretto, se fosse solo in casa.
//
// Ma la suite lancia i file di prova su corsie PARALLELE, e nella corsia accanto `mutazioni-orfane`
// legge quegli stessi file per chiedersi se ogni mutazione trova ancora il suo pezzo. Se li guarda
// nell'istante in cui sono rotti, vede una mutazione scollegata e diventa rossa. Misurato
// lanciandole insieme: **un giro verde, il giro dopo rosso**, senza toccare una riga in mezzo.
//
// Un rosso che va e viene è peggio di un rosso fermo: insegna a non fidarsi del verde, e il primo
// riflesso di chi lo vede è «sarà l'infrastruttura», che è il modo in cui un difetto vero diventa
// invisibile. Le prove del banco lavorano su una FINTA da qui in avanti.
//
// COME SI DIMOSTRA, e perché non è una parola cercata in un file. Non si può provare «non capita
// mai» rilanciando finché è verde: il verde per fortuna non prova niente. Si guarda invece il
// FATTO che lo causa — mentre quella prova gira, i file veri del repo risultano modificati? — e lo
// si guarda tante volte al secondo, per tutta la durata della corsa. Col difetto rimesso questa
// prova vede sporco entro pochi decimi; con la cura non lo vede mai.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** I file tracciati che risultano modificati ADESSO, sotto `cervello/`. */
function sporco() {
  const r = spawnSync("git", ["status", "--porcelain", "--", "cervello"], { cwd: REPO, encoding: "utf8" });
  return (r.stdout || "")
    .split("\n")
    .filter((riga) => riga.startsWith(" M") || riga.startsWith("M "))
    .map((riga) => riga.slice(3));
}

/**
 * 🔎 HO DAVVERO OSSERVATO? — AR-940, e questa e' la TERZA versione di questa domanda.
 *
 * Un osservatore che dice «pulito» deve prima poter dire «ho guardato mentre succedeva». Le prime
 * due versioni erano troppo deboli e le ha trovate la macchina, non io:
 *   · la prima guardava il CRONOMETRO — ma con la finta il figlio finisce in mezzo secondo;
 *   · la seconda chiedeva «almeno un caso passato» — e dentro una corsia il registro contiene solo
 *     la fetta di quella corsia, quindi il figlio non arriva mai a toccare il file vero, i suoi
 *     casi falliscono, e l'albero risulta pulito. Pulito per il motivo sbagliato. Misurato: la
 *     mutazione di AR-919 usciva `vacua`, cioe' una difesa che non difendeva.
 *
 * La regola che regge: un figlio ROSSO non prova niente sulla pulizia. O va in fondo verde, o non
 * ho osservato — che e' ⚪, e ⚪ non e' mai un verde.
 */
export function haOsservato({ passati = 0, falliti = 0 } = {}) {
  if (!passati) return { ok: false, perche: "il figlio non ha eseguito nessun caso: non ho osservato niente, e allora «pulito» non vuol dire niente" };
  if (falliti) return { ok: false, perche: `il figlio e' andato in rosso (${falliti} casi): non ha fatto il lavoro che dovevo osservare, quindi «l'albero e' pulito» non dimostra niente` };
  return { ok: true, perche: "" };
}

test("AR-940: «pulito» vale solo se il figlio e' andato in fondo VERDE", () => {
  assert.equal(haOsservato({ passati: 4, falliti: 0 }).ok, true, "quattro casi passati e zero rossi: ho osservato davvero");
  assert.equal(haOsservato({ passati: 0, falliti: 0 }).ok, false, "zero casi = non ho guardato (era la prima versione debole)");
  const rosso = haOsservato({ passati: 2, falliti: 2 });
  assert.equal(rosso.ok, false, "IL CASO CHE HA ROTTO: due passati e due rossi non e' un'osservazione — era la seconda versione debole");
  assert.match(rosso.perche, /non dimostra niente/, "e va detto perche', non solo negato");
});

test("le prove del banco non toccano i file veri del repo mentre le altre corsie li leggono", async () => {
  const giaSporchi = new Set(sporco()); // il lavoro in corso non è colpa di nessuno
  // ⚠️ `NODE_TEST_CONTEXT` SI CANCELLA, non si svuota. Messa a stringa vuota resta SET, e allora
  // `node --test` crede di essere già dentro una corsa di prove: esce subito, con zero, senza aver
  // eseguito niente. Ci sono cascata: la prima versione di questo file passava misurando il nulla —
  // il verde che ha guardato zero, esattamente il difetto che questa casa esiste per non fare.
  const ambiente = { ...process.env };
  delete ambiente.NODE_TEST_CONTEXT;
  const figlio = spawn(process.execPath, ["--test", "--test-reporter=tap", join(REPO, "cervello/test/il-banco-che-non-diceva-chi-restava-fuori.test.mjs")], {
    cwd: REPO,
    env: ambiente,
  });
  // Un figlio che non ha misurato niente non può farmi dire «pulito»: sarebbe la stessa bugia col
  // segno cambiato. Quindi non guardo il cronometro — mezzo secondo o venti dipende da cosa c'è
  // dentro — ma il suo referto: quanti casi ha dichiarato passati.
  let referto = "";
  figlio.stdout.on("data", (d) => (referto += d));
  figlio.stderr.on("data", (d) => (referto += d));
  const visti = new Set();
  const occhio = setInterval(() => {
    for (const f of sporco()) if (!giaSporchi.has(f)) visti.add(f);
  }, 40);
  try {
    await new Promise((ok) => figlio.on("exit", ok));
  } finally {
    clearInterval(occhio);
  }
  // ⚠️ IL FIGLIO DEVE ESSERE ANDATO IN FONDO, non solo essere partito — e questa e' la seconda
  // volta che questa riga e' troppo debole. La prima versione guardava il cronometro; la seconda
  // chiedeva «almeno un caso passato». Il banco a corsie ha trovato anche quella: dentro una corsia
  // il registro contiene SOLO la fetta di quella corsia, quindi il figlio non arriva mai a toccare
  // il file vero, i suoi casi falliscono, e l'albero risulta pulito. Pulito per il motivo sbagliato,
  // cioe' un verde che ha guardato zero — misurato: la mutazione di AR-919 usciva `vacua`.
  //
  // La regola, adesso: un figlio ROSSO non prova niente sulla pulizia. O va in fondo verde, o non
  // ho osservato.
  const visto = haOsservato({
    passati: Number((referto.match(/^# pass (\d+)/m) || [])[1] || 0),
    falliti: Number((referto.match(/^# fail (\d+)/m) || [])[1] || 0),
  });
  assert.ok(visto.ok, `${visto.perche}.\n${referto.slice(-700)}`);
  assert.deepEqual(
    [...visti],
    [],
    `mentre giravano, queste prove hanno lasciato rotti dei file veri del repo: chi legge nella corsia accanto li vede così e diventa rosso a caso.\nSporcati: ${[...visti].join(", ")}`,
  );
});
