#!/usr/bin/env node
// 🧪 Le prove della VISITA (cervello/salute.mjs). 🟢 Sola lettura: nessuna visita vera parte da qui.
//
// Perché queste prove e non altre: la visita può sbagliare in due modi, e uno solo dei due fa
// rumore. Se dice «rotto» quando è tutto a posto, Nicola apre la card e se ne accorge. Se dice
// «funziona» quando non ha guardato niente, non se ne accorge nessuno — ed è il difetto che questo
// file esiste per impedire. Quindi la metà di questi test controlla che ⚪ non diventi mai ✅, e che
// la copertura dica la verità.
//
// Uso: node cervello/test/salute.test.mjs      Exit: 0 = tutte passate · 1 = almeno una rossa

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const {
  daOraPiacenza,
  giudicaTracce,
  skillNonVersionate,
  giudicaPonte,
  giudicaCoda,
  giudicaBattito,
  giudicaCabina,
  giudicaCuore,
  guardianiMancanti,
  marcaRegressioni,
  coperturaDi,
  codiceUscita,
} = await import(join(REPO, "cervello/salute.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};
const uguale = (visto, atteso, cosa) => {
  if (visto !== atteso) throw new Error(`${cosa}: atteso «${atteso}», visto «${visto}»`);
};

const ORA = Date.parse("2026-07-29T10:00:00Z");
const oreFa = (n) => new Date(ORA - n * 3_600_000).toISOString();
const minutiFa = (n) => new Date(ORA - n * 60_000).toISOString();

// ── Il ponte VPS → Claude ─────────────────────────────────────────────────────

prova("il referto del VPS di 3 ore fa è verde", () => {
  uguale(giudicaPonte({ iso: oreFa(3) }, ORA).esito, "ok", "ponte fresco");
});

prova("il caso che conta: il VPS che ha smesso di visitarsi è ROSSO, non «non visto»", () => {
  // 30 ore = un giro saltato. Se questo diventasse ⚪, da Claude nessuno saprebbe mai che il VPS è
  // morto: è esattamente il buco che il ponte esiste per chiudere.
  uguale(giudicaPonte({ iso: oreFa(30) }, ORA).esito, "rotto", "referto scaduto");
});

prova("il VPS che non ha mai pubblicato è ⚪, non rosso", () => {
  // Alla prima visita in assoluto il ponte non esiste ancora: accusare il VPS sarebbe una bugia.
  uguale(giudicaPonte(null, ORA).esito, "nonvisto", "ponte mai attivato");
});

prova("un orario illeggibile non diventa mai un verde", () => {
  uguale(giudicaPonte({ iso: "ieri sera" }, ORA).esito, "nonvisto", "orario rotto");
});

// ── Le tracce: il controllo che funziona anche senza una chiave ───────────────

prova("un orario della macchina si legge come ora di Piacenza, non come ora del processo", () => {
  // Da una sessione cloud il processo gira in UTC: letta ingenuamente, questa stringa varrebbe due
  // ore prima, e una macchina ferma da 8 ore sembrerebbe ferma da 6.
  uguale(daOraPiacenza("2026-07-29 12:00"), Date.parse("2026-07-29T12:00:00+02:00"), "estate (ora legale)");
  uguale(daOraPiacenza("2026-01-15 12:00"), Date.parse("2026-01-15T12:00:00+01:00"), "inverno (ora solare)");
  uguale(Number.isNaN(daOraPiacenza("ieri sera")), true, "testo che non è un orario");
  uguale(Number.isNaN(daOraPiacenza(null)), true, "niente");
});

prova("IL CASO VERO del 29/7: nessuna traccia da due giorni è ROSSO, anche senza chiavi", () => {
  const tracce = [
    { file: "sentinella-dati.json", quando: "2026-07-27 22:23" },
    { file: "costo-ai.json", quando: "2026-07-28 01:13" },
  ];
  const e = giudicaTracce(tracce, Date.parse("2026-07-29T11:00:00+02:00"));
  uguale(e.esito, "rotto", "macchina muta da due giorni");
  uguale(e.dati.file, "costo-ai.json", "cita la traccia più fresca, non la prima della lista");
});

prova("la traccia fresca di un'ora fa è verde", () => {
  const tracce = [{ file: "esito-giro.json", quando: "2026-07-29 10:00" }];
  uguale(giudicaTracce(tracce, Date.parse("2026-07-29T11:00:00+02:00")).esito, "ok", "macchina viva");
});

prova("nessuna traccia leggibile è ⚪, non un verde e non un'accusa", () => {
  uguale(giudicaTracce([], Date.now()).esito, "nonvisto", "niente da leggere");
  uguale(giudicaTracce([{ file: "x.json", quando: "boh" }], Date.now()).esito, "nonvisto", "orari illeggibili");
});

// ── La coda del worker ────────────────────────────────────────────────────────

prova("coda che scorre: verde", () => {
  const righe = [
    { stato: "completato", aggiornato_il: minutiFa(5) },
    { stato: "in_corso", aggiornato_il: minutiFa(3) },
    { stato: "in_attesa", creato_il: minutiFa(2) },
  ];
  uguale(giudicaCoda(righe, ORA).esito, "ok", "coda sana");
});

prova("il caso che ha rotto: un lavoro «in corso» da un'ora è un worker morto a metà", () => {
  const righe = [{ stato: "in_corso", aggiornato_il: minutiFa(60) }];
  const e = giudicaCoda(righe, ORA);
  uguale(e.esito, "rotto", "lavoro appeso");
  uguale(e.dati.corsoBloccati, 1, "quanti bloccati");
});

prova("un lavoro che nessuno prende da mezz'ora è rosso", () => {
  const righe = [{ stato: "in_attesa", creato_il: minutiFa(30) }];
  uguale(giudicaCoda(righe, ORA).esito, "rotto", "claim fermo");
});

prova("il bloccato viene prima dell'ignorato: da fuori sembra che stia lavorando", () => {
  const righe = [
    { stato: "in_attesa", creato_il: minutiFa(30) },
    { stato: "in_corso", aggiornato_il: minutiFa(90) },
  ];
  uguale(giudicaCoda(righe, ORA).detto.includes("in corso"), true, "priorità del sintomo");
});

prova("coda vuota è verde, non «non visto»: è un'informazione vera", () => {
  uguale(giudicaCoda([], ORA).esito, "ok", "coda vuota");
});

// ── Il battito ────────────────────────────────────────────────────────────────

prova("la macchina che non scrive da 20 ore è rossa", () => {
  uguale(giudicaBattito([{ chiave: "giro:ultimo", updated_at: oreFa(20) }], ORA).esito, "rotto", "silenzio");
});

prova("nessuna traccia con orario = ⚪, non verde", () => {
  uguale(giudicaBattito([{ chiave: "x" }], ORA).esito, "nonvisto", "senza orario");
  uguale(giudicaBattito([], ORA).esito, "nonvisto", "nessuna riga");
});

// ── La Cabina ─────────────────────────────────────────────────────────────────

prova("la Cabina che non risponde è rossa", () => {
  uguale(giudicaCabina({ ok: false, errore: "nessuna risposta in 8s" }).esito, "rotto", "cabina giù");
});

prova("la Cabina lenta è rossa prima di diventare un errore", () => {
  uguale(giudicaCabina({ ok: true, status: 200, ms: 9000 }).esito, "rotto", "cabina lenta");
  uguale(giudicaCabina({ ok: true, status: 200, ms: 900 }).esito, "ok", "cabina svelta");
});

prova("una Cabina viva ma scollegata dalla memoria è rossa: a Nicola i numeri non arrivano", () => {
  uguale(giudicaCuore(JSON.stringify({ collegato: false })).esito, "rotto", "scollegata");
  uguale(giudicaCuore(JSON.stringify({ collegato: true, ultimoBattito: "29/07 09:00" })).esito, "ok", "collegata");
});

prova("una risposta che non è JSON non passa per buona", () => {
  uguale(giudicaCuore("<html>errore</html>").esito, "rotto", "html invece di json");
});

// ── I guardiani del giro ──────────────────────────────────────────────────────

prova("un guardiano citato dal giro ma sparito viene trovato", () => {
  const giro = 'node "$SCRIPT_DIR/coerenza-fatti.mjs" || true\nnode "$SCRIPT_DIR/sparito.mjs" | tail -3 || true';
  const { assenti, unici } = guardianiMancanti(giro, (f) => f === "coerenza-fatti.mjs");
  uguale(unici.length, 2, "guardiani citati");
  uguale(assenti.join(","), "sparito.mjs", "guardiano sparito");
});

prova("lo stesso guardiano citato due volte si conta una volta sola", () => {
  const giro = 'node "$SCRIPT_DIR/a.mjs"\nnode "$SCRIPT_DIR/a.mjs"';
  uguale(guardianiMancanti(giro, () => true).unici.length, 1, "doppione");
});

// ── Le braccia che esistono solo su un disco ─────────────────────────────────

prova("IL CASO DEL 29/7: una skill scritta a mano che git ignora è un rosso", () => {
  // Successo davvero: `salute`, `worker` e `senior` sotto una regola di .gitignore pensata per lo
  // specchio. Commit riuscito, status pulito, PR mergiata — e su main solo il motore.
  const orfane = skillNonVersionate(["verify", "cantiere", "salute", "worker", "senior"], {
    generata: () => false,
    versionata: (n) => n === "verify" || n === "cantiere",
  });
  uguale(orfane.join(","), "salute,worker,senior", "le tre skill che non sarebbero arrivate al VPS");
});

prova("una skill dello specchio ignorata da git non è un difetto: è rigenerabile", () => {
  const orfane = skillNonVersionate(["ads", "seo"], { generata: () => true, versionata: () => false });
  uguale(orfane.length, 0, "lo specchio si ricrea da solo");
});

prova("il falso allarme del 29/7: ponytail è generata anche se non nasce da .cursor/skills", () => {
  // La prima visita dal VPS ha accusato `ponytail` di vivere fuori da git. È generata eccome, ma
  // nasce da una rule .mdc che lo specchio converte: riconosciuta per ID, non per percorso.
  const idsManifest = new Set(["grilling", "ponytail", "diagnosing-bugs"]);
  const orfane = skillNonVersionate(["ponytail", "salute"], {
    generata: (n) => idsManifest.has(n),
    versionata: (n) => n === "salute",
  });
  uguale(orfane.length, 0, "nessun allarme su una skill sana");
});

prova("tutte versionate: nessun allarme", () => {
  uguale(skillNonVersionate(["salute"], { generata: () => false, versionata: () => true }).length, 0, "a posto");
});

// ── Regressioni, copertura, verdetto ──────────────────────────────────────────

prova("era verde ieri e oggi è rosso: è una regressione", () => {
  const prima = [{ id: "a", esito: "ok" }, { id: "b", esito: "rotto" }];
  const oggi = [{ id: "a", esito: "rotto" }, { id: "b", esito: "rotto" }];
  marcaRegressioni(prima, oggi);
  uguale(oggi[0].regressione, true, "peggiorato");
  uguale(oggi[1].regressione, false, "rosso già ieri, non è un peggioramento");
});

prova("alla prima visita in assoluto nessuno è «peggiorato»", () => {
  const oggi = [{ id: "a", esito: "rotto" }];
  marcaRegressioni(undefined, oggi);
  uguale(oggi[0].regressione, false, "senza storia niente regressione");
});

prova("IL CUORE: ⚪ e 🔧 non contano come guardati", () => {
  const r = [{ esito: "ok" }, { esito: "rotto" }, { esito: "nonvisto" }, { esito: "guasto" }];
  uguale(coperturaDi(r), 0.5, "copertura onesta");
});

prova("un rosso vale 1, anche se è un mio controllo rotto", () => {
  uguale(codiceUscita({ rotti: 1, guasti: 0, copertura: 1 }), 1, "organo rotto");
  uguale(codiceUscita({ rotti: 0, guasti: 1, copertura: 1 }), 1, "controllo mio rotto");
});

prova("IL CUORE: tutto verde ma ho guardato poco → 2, mai 0", () => {
  // Questa è la riga che separa una visita onesta da un teatrino: zero rossi su tre controlli su
  // venti NON è «la macchina sta bene».
  uguale(codiceUscita({ rotti: 0, guasti: 0, copertura: 0.2 }), 2, "cieca");
  uguale(codiceUscita({ rotti: 0, guasti: 0, copertura: 0.9 }), 0, "vista buona");
});

// ── Esito ─────────────────────────────────────────────────────────────────────

const rosse = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : ` → ${c.err}`}`);
console.log(`\n${casi.length - rosse.length}/${casi.length} prove passate`);
process.exit(rosse.length ? 1 : 0);
