#!/usr/bin/env node
// 🔒 AR-867 — UNA PROVA NON È UNA PORTA PER ESEGUIRE ALTRO
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE
// ─────────────────────────────────────────────────────────────────────────────
// Curando AR-840 la macchina ha imparato a eseguire una PROVA descritta da una stringa. Quella
// stringa vive in `cervello/mutanti.json`: 934 voci, e il campo `test` non lo scrive una persona —
// lo compone `cervello/ricuci-corsie.mjs` a partire da ciò che una corsia (cioè un modello) ha
// consegnato. Da lì a `non-vacuita.mjs` che lo esegue non c'è nessun umano in mezzo.
//
// La prima difesa era un filtro dei metacaratteri di shell. È fatta bene, e para un colpo che
// nessuno tira: la shell non viene mai usata. Chi esegue è `node`, e di `node` non filtrava nessuno
// gli argomenti. La radiografia di sicurezza del 28/8 ha misurato queste righe, e passavano tutte:
//
//   node --require=/tmp/pwn.cjs cervello/x.mjs    ← esegue un file qualunque, zero metacaratteri
//   node --import=file:///tmp/pwn.mjs cervello/x.mjs
//   node -e <codice>
//   npx --yes @chiunque/pacchetto                 ← scarica ed esegue dalla rete
//
// ─────────────────────────────────────────────────────────────────────────────
// E LA PARTE CHE FA PIÙ MALE: la prova che c'era prima era VERDE
// ─────────────────────────────────────────────────────────────────────────────
// In `una-prova-lanciata-nel-modo-sbagliato.test.mjs` c'è un blocco intitolato «SICUREZZA: non si
// esce dal repo, né da percorso né da argomento». Chiama `comeSiEsegue(t)` SENZA opzioni, cioè in
// modo stretto — che non è il modo in cui l'esecutore gira. L'esecutore chiamava con
// `soloDentroIlRepo: false`, e quel percorso non lo guardava nessuno.
//
// Un test intitolato «SICUREZZA» che verifica una modalità mai usata in produzione non è un test
// mancante: è peggio, è la ragione per cui nessuno andrà a cercare il problema. È la stessa malattia
// che questo lotto sta curando — un metro che si dà buono da solo — comparsa DENTRO la cura.
//
// Perciò qui si prova SEMPRE la modalità vera: quella con cui `eseguiProva` chiama davvero.

import test from "node:test";
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { comeSiEsegue } from "../esecuzione-prova.mjs";
import { ambientePulito } from "../non-vacuita.mjs";
import { AD_ROOT } from "../git-github.mjs";

/** ⚠️ LA MODALITÀ VERA: identica alla riga di `eseguiProva` in non-vacuita.mjs. Se un giorno quella
 *  riga cambia e questa no, i casi qui sotto tornano a misurare un percorso che nessuno percorre —
 *  ed è esattamente com'è nato il buco. */
const COME_ESEGUE_DAVVERO = { soloDentroIlRepo: false, radiciAmmesse: [AD_ROOT, tmpdir()] };
const piano = (t) => comeSiEsegue(t, COME_ESEGUE_DAVVERO);

// ─────────────────────────────────────────────────────────────────────────────
// ① LE SETTE RIGHE CHE PRIMA PASSAVANO. Sono la prova che diventa rossa se qualcuno
//    riapre una delle tre porte.
// ─────────────────────────────────────────────────────────────────────────────

const DEVONO_ESSERE_RIFIUTATE = [
  ["opzione che carica un file arbitrario (-r)", "node -r /tmp/pwn.js cervello/test/x.test.mjs"],
  ["idem, in forma lunga con =", "node --require=/tmp/pwn.cjs cervello/test/x.test.mjs"],
  ["idem, come modulo ES", "node --import=file:///tmp/pwn.mjs cervello/test/x.test.mjs"],
  ["codice arbitrario inline (-e)", "node -e process.exit cervello/test/x.test.mjs"],
  ["codice arbitrario inline (--eval=)", "node --eval=process.exit cervello/test/x.test.mjs"],
  ["npx che scarica un pacchetto qualunque", "npx --yes @evil/pwn"],
  ["npx con un pacchetto con scope, che somiglia a un percorso", "npx @scope/pkg"],
  // ⚠️ QUESTE DUE RIGHE LE HA CHIESTE LA PROVA DI NON-VACUITÀ, e senza di loro il test mentiva.
  // Rompendo le difese una per una, due mutazioni su quattro lasciavano il test VERDE: la
  // restrizione su npx e il rifiuto dei nomi con scope si coprivano a vicenda sullo stesso caso
  // («npx --yes @evil/pwn» lo fermano tutte e due), quindi togliendone una l'altra teneva e il
  // rosso non arrivava. Due difese senza un caso che le separi sono una difesa sola più una
  // decorazione, e nessuno se ne accorge finché non si toglie quella che lavorava davvero.
  ["npx con un pacchetto NON in lista (solo la lista dei runner lo ferma)", "npx cowsay cervello/test/x.test.mjs"],
  ["un nome con scope passato a node (solo il rifiuto degli @ lo ferma)", "node @scope/pkg cervello/test/x.test.mjs"],
];

test("AR-867: le sette righe che aprivano una porta adesso NON sono eseguibili", () => {
  for (const [etichetta, riga] of DEVONO_ESSERE_RIFIUTATE) {
    const p = piano(riga);
    assert.equal(
      p.ok,
      false,
      `«${etichetta}» deve essere rifiutata nella modalità che ESEGUE davvero, non solo in quella stretta.\n  riga: ${riga}\n  verdetto: ${JSON.stringify(p)}`,
    );
    assert.ok(p.perche && p.perche.length > 0, `«${etichetta}»: un rifiuto senza motivo scritto non si può leggere`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ② E il metro deve restare capace di dire di SÌ. Un filtro che rifiuta tutto è
//    un filtro spento, e spegnerebbe il banco intero.
// ─────────────────────────────────────────────────────────────────────────────

test("AR-867: le prove vere di questa casa continuano a essere eseguibili", () => {
  const DEVONO_PASSARE = [
    ["un percorso semplice", "cervello/test/due-metri-una-regola.test.mjs"],
    ["una riga di comando di casa", "node cervello/permessi-check.mjs"],
    ["un file .bats", "cervello/test/cancello-nell-istante-giusto.bats"],
    ["npx bats, che è un runner ammesso", "npx bats cervello/test/cancello-nell-istante-giusto.bats"],
    ["npx tsx col flag --test", "npx tsx --test pannello/src/lib/data-lezione.test.mts"],
    ["due passi in sequenza con &&", "node cervello/permessi-check.mjs && node cervello/peso-contesto.mjs"],
  ];
  for (const [etichetta, riga] of DEVONO_PASSARE) {
    const p = piano(riga);
    assert.equal(p.ok, true, `«${etichetta}» è una prova legittima e deve restare eseguibile: ${p.perche}`);
  }
});

test("AR-867: la fixture in /tmp resta eseguibile — è la ragione per cui le radici esistono", () => {
  // Le prove del banco stesso si costruiscono una fixture in una cartella temporanea e le passano un
  // percorso assoluto. Se questo caso diventa rosso, il banco non si può più provare — ed è il
  // motivo per cui la cura NON poteva essere «vietare i percorsi assoluti».
  const dentroTmp = join(tmpdir(), "banco-finto", "prova.test.mjs");
  assert.equal(piano(dentroTmp).ok, true, "una fixture sotto la cartella temporanea deve poter girare");
  // Ma solo /tmp e il repo, non tutto il disco.
  assert.equal(piano("/etc/passwd").ok, false, "un percorso fuori dalle radici dichiarate non si esegue");
  assert.equal(piano("/usr/bin/qualcosa.mjs").ok, false, "idem");
  // E non ci si arriva risalendo: una radice si dichiara, non si raggiunge con «..».
  assert.equal(piano(join(tmpdir(), "..", "etc", "passwd")).ok, false, "«..» non deve poter uscire da una radice ammessa");
});

// ─────────────────────────────────────────────────────────────────────────────
// ③ L'AMBIENTE. È il moltiplicatore: se un comando ostile arriva fin qui, deve
//    trovare le tasche vuote.
// ─────────────────────────────────────────────────────────────────────────────

test("AR-867: una prova non riceve nessuna chiave dall'ambiente", () => {
  const finto = {
    PATH: "/usr/bin",
    HOME: "/home/user",
    STRIPE_SECRET_KEY: "sk_live_NONDEVEPASSARE",
    SUPABASE_SERVICE_KEY: "service_NONDEVEPASSARE",
    MARKETPLACE_SUPABASE_WRITE_KEY: "w_NONDEVEPASSARE",
    RESEND_API_KEY: "re_NONDEVEPASSARE",
    TELEGRAM_BOT_TOKEN: "tg_NONDEVEPASSARE",
    GITHUB_TOKEN: "gh_NONDEVEPASSARE",
    GIT_PUSH_TOKEN: "gp_NONDEVEPASSARE",
    DB_PASSWORD: "pw_NONDEVEPASSARE",
    AUTH_SECRET: "au_NONDEVEPASSARE",
  };
  const pulito = ambientePulito(finto);

  // Quello che serve per far girare un test resta.
  assert.equal(pulito.PATH, "/usr/bin", "senza PATH non parte niente");
  assert.equal(pulito.HOME, "/home/user");

  // Tutto il resto sparisce, e lo si controlla sui VALORI e non solo sui nomi: un filtro che
  // rinomina invece di togliere passerebbe un controllo fatto sulle chiavi.
  const valori = Object.values(pulito).join(" ");
  assert.ok(!valori.includes("NONDEVEPASSARE"), `una chiave è passata: ${JSON.stringify(pulito)}`);
  for (const nome of ["STRIPE_SECRET_KEY", "SUPABASE_SERVICE_KEY", "RESEND_API_KEY", "GITHUB_TOKEN", "DB_PASSWORD", "AUTH_SECRET"]) {
    assert.equal(pulito[nome], undefined, `${nome} non deve arrivare a una prova`);
  }
});

test("AR-867: e il filtro dell'ambiente non è spento — se passasse tutto sarebbe inutile", () => {
  // La prova di non-vacuità del filtro stesso: deve TOGLIERE qualcosa, o non sta facendo niente.
  const prima = { PATH: "/usr/bin", UNA_CHIAVE_SECRET: "x" };
  const dopo = ambientePulito(prima);
  assert.ok(Object.keys(dopo).length < Object.keys(prima).length, "il filtro non ha tolto niente: è spento");
});

// ─────────────────────────────────────────────────────────────────────────────
// 🔒 SECONDO GIRO — 30/8/2026, dal collaudo di sicurezza indipendente
// ─────────────────────────────────────────────────────────────────────────────
// La difesa qui sopra ha chiuso `--require`, `--import`, `-e` e `npx <chiunque>`. Il collaudatore
// — che non aveva scritto una riga di questo file — ha fatto girare codice suo COME ROOT passando
// da due opzioni che la lista bianca ammetteva:
//
//   node --test --test-reporter=/tmp/fuori/mio.mjs cervello/test/x.test.mjs
//   node --experimental-loader /tmp/mio.mjs cervello/test/x.test.mjs
//
// Tutt'e due prendono uno SPECIFICATORE DI MODULO e lo eseguono, esattamente come `--import` che
// era vietato dodici righe più sopra. E siccome cominciano per «-», il loro valore saltava tutti i
// controlli sui percorsi: poteva stare ovunque sul disco.
//
// LA LEZIONE, ed è quella che vale oltre questo file: una lista bianca elenca FORME di stringa, ma
// il pericolo sta negli EFFETTI. Quando si scrive «ammetto --experimental-*» si sta ammettendo una
// FAMIGLIA di cui non si conoscono i membri futuri — che è la stessa malattia della lista nera, con
// il segno cambiato. Un flag si ammette per nome, mai per famiglia.
//
// Perché la prova di prima era verde: guardava solo le quattro righe già note. Nessun caso provava
// un'opzione che carica un modulo, quindi la difesa nuova non aveva niente da dimostrare.

test("AR-885: un reporter che è un percorso non è un reporter, è un modulo da eseguire", () => {
  // La riga esatta con cui il collaudo ha eseguito codice come root.
  const rce = piano("node --test --test-reporter=/tmp/pwn/mio.mjs cervello/test/allarme-cronico.test.mjs");
  assert.equal(rce.ok, false, "la riga con cui il collaudo ha eseguito codice come root passa ancora");
  // Anche relativo, anche dentro il repo: un modulo caricato è un modulo caricato.
  assert.equal(piano("node --test --test-reporter=./pwn.mjs cervello/test/allarme-cronico.test.mjs").ok, false);
  assert.equal(piano("node --test --test-reporter=file:///tmp/pwn.mjs cervello/test/allarme-cronico.test.mjs").ok, false);
  // …ma i reporter VERI di node restano ammessi: una difesa che vieta tutto è una difesa spenta,
  // e questo è il caso che distingue «ho chiuso il buco» da «ho chiuso l'opzione».
  assert.equal(piano("node --test-reporter=tap --test cervello/test/allarme-cronico.test.mjs").ok, true,
    "i reporter interni di node devono restare ammessi, o la cura è un divieto");
});

test("AR-885: --experimental-* era una famiglia, e delle famiglie non si conoscono i membri futuri", () => {
  assert.equal(piano("node --experimental-loader /tmp/pwn.mjs cervello/test/allarme-cronico.test.mjs").ok, false);
  assert.equal(piano("node --experimental-loader=file:///tmp/pwn.mjs cervello/test/allarme-cronico.test.mjs").ok, false);
  // Il nome inventato è il punto: se domani node aggiunge --experimental-qualunque-cosa che esegue
  // codice, la lista bianca di prima l'avrebbe ammesso il giorno stesso, senza che nessuno lo sapesse.
  assert.equal(piano("node --experimental-non-esiste-ancora cervello/test/allarme-cronico.test.mjs").ok, false,
    "un flag sperimentale che nessuno ha mai visto non può essere ammesso in anticipo");
});

test("AR-885: il valore attaccato a un'opzione passa dagli stessi controlli di un percorso scritto da solo", () => {
  // Difesa in profondità: anche se un giorno la lista bianca tornasse ad ammettere un valore libero,
  // un valore che NOMINA UN FILE deve stare in casa ed essere pulito. Il test usa un'opzione che è
  // ammessa apposta (--test-name-pattern accetta testo libero) per provare lo strato di sotto.
  assert.equal(piano("node --test-name-pattern=/etc/passwd cervello/test/allarme-cronico.test.mjs").ok, false,
    "un valore che esce dal repo passa ancora");
  assert.equal(piano("node --test-name-pattern=../../fuori/x.mjs cervello/test/allarme-cronico.test.mjs").ok, false,
    "un valore che risale con .. passa ancora");
  assert.equal(piano("node --test-name-pattern=file:///tmp/x.mjs cervello/test/allarme-cronico.test.mjs").ok, false,
    "un file: URL passa ancora");
  // …e un testo che NON nomina nessun file resta ammesso: il controllo guarda i valori che
  // somigliano a un modulo, non tutti i valori.
  assert.equal(piano("node --test-name-pattern=AR-885 cervello/test/allarme-cronico.test.mjs").ok, true,
    "un testo normale non deve essere bloccato: il filtro guarda i moduli, non le parole");
});

test("AR-885: e nessuna delle 958 voci vere di mutanti.json viene respinta dalla stretta", async () => {
  // La legge del collaudatore che ha trovato più difetti: una difesa nuova va misurata sul lavoro
  // NORMALE, non solo sull'attacco. Una lista bianca troppo stretta è un cancello che suona su
  // tutto, cioè un cancello spento — il difetto opposto, e più difficile da vedere.
  const { readFileSync } = await import("node:fs");
  const registro = JSON.parse(readFileSync(join(AD_ROOT, "cervello/mutanti.json"), "utf8"));
  const conTest = registro.mutanti.filter((v) => v.test);
  assert.ok(conTest.length > 100, `il registro è troppo magro per dire qualcosa: ${conTest.length} voci`);
  const respinte = conTest.filter((v) => !piano(String(v.test)).ok);
  assert.deepEqual(respinte.map((v) => `${v.difetto}: ${v.test}`), [],
    "la stretta ha respinto voci vere: il cancello suona sul lavoro normale");
});

test("AR-885: una credenziale dentro un URL non si vede dal nome, e non deve arrivare alla prova", () => {
  // Il secondo reperto del collaudo. `ambientePulito` toglieva per NOME, e sul VPS passavano al
  // figlio DATABASE_URL, SUPABASE_DB_URL e REDIS_URI — che la password ce l'hanno nel VALORE.
  const finto = {
    DATABASE_URL: "postgres://utente:NONDEVEPASSARE@host/db",
    SUPABASE_DB_URL: "postgresql://postgres:NONDEVEPASSARE@db.x.supabase.co:5432/postgres",
    REDIS_URI: "redis://:NONDEVEPASSARE@127.0.0.1:6379",
    SENTRY_DSN: "https://NONDEVEPASSARE@o1.ingest.sentry.io/1",
    MARKETPLACE_SUPABASE_URL: "https://xyz.supabase.co",
    PATH: "/usr/bin",
  };
  const pulito = ambientePulito(finto);
  assert.ok(!Object.values(pulito).join(" ").includes("NONDEVEPASSARE"),
    `una credenziale è arrivata alla prova: ${JSON.stringify(pulito)}`);
  // …e un URL PUBBLICO resta: se il filtro togliesse ogni URL sarebbe di nuovo un divieto, non una
  // cura, e le prove che hanno bisogno dell'indirizzo del marketplace smetterebbero di girare.
  assert.equal(pulito.MARKETPLACE_SUPABASE_URL, "https://xyz.supabase.co",
    "un URL senza credenziali dentro non è un segreto: toglierlo è rompere le prove per niente");
  assert.equal(pulito.PATH, "/usr/bin");
});
