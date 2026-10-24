#!/usr/bin/env node
// 🔎 PRE-DIAGNOSI — la prova del comando che raccoglie le ricette prima di riparare il sito.
//
// LE MALATTIE CHE QUESTO COMANDO NON DEVE AVERE, e perché costerebbero care:
//   ① una falla di sicurezza riservata che finisce nel deposito pubblico: la memoria e il sito sono
//      repository PUBBLICI, e una falla aperta descritta lì è un manuale per chi la vuole sfruttare;
//   ② un difetto vero chiuso per sbaglio: basta che chi scrive la ricetta dica «già risolto» e il
//      difetto esce dal lavoro. Serve anche la voce del revisore che aveva il mandato di smentirlo;
//   ③ due squadre sullo stesso file: è quello che fa nascere i conflitti alla ricucitura. Due
//      pacchetti che toccano lo stesso file esistente non devono stare nella stessa ondata;
//   ④ il verde su zero: un journal vuoto, di un altro registro o di un altro formato non deve
//      diventare «tutto fatto», e una cartella dentro un repository non deve nascere nemmeno vuota.
//
// COSA PROVA, eseguendo il comando vero su un registro e su journal costruiti a mano:
//   ① --scrivi senza --riservato si ferma; con --riservato il testo riservato non compare nel
//      ricettario pubblico ma resta in quello completo; le frasi copiate da una falla fermano tutto;
//      una ricetta pubblica scritta su una falla riservata ferma tutto, senza ripeterne il testo
//   ①bis l'elenco del riservato oscura il campo segnato, da file, da oggetto o dal journal dei
//      revisori; un'oscuratura scritta male o senza bersaglio esce 2 e non scrive niente di pubblico;
//      un territorio col nome ripetuto fra seri e minori si oscura in tutte e due le copie
//   ② «già risolto» detto da una voce sola resta da riparare; detto da due esce; due voci in
//      disaccordo vanno riviste
//   ③ due pacchetti che toccano lo stesso file esistente non stanno nella stessa ondata, e il conto
//      del piano torna difetto per difetto
//   ④ un journal senza risultati, o di un altro registro, esce 2; una cartella dentro un repository
//      (anche un worktree, anche passando da un collegamento simbolico) esce 2 e non nasce
//   ⑤ nessun difetto aperto si perde: ognuno ha un esito; i risultati senza etichetta e i revisori
//      partiti e mai tornati sono detti, non ingoiati
//   ⑥ se le schede cambiano posizione nel registro, ogni ricetta segue la chiave del suo difetto
//
// NON-VACUITÀ: le mutazioni stanno in cervello/mutanti.json (difetto «pre-diagnosi del sito»), e
// ognuna rende rosso questo file. Si rilanciano con `node cervello/non-vacuita.mjs --lotto prediagnosi`.
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, copyFileSync, rmSync, existsSync, symlinkSync } from "fs";
import { spawnSync } from "child_process";
import { tmpdir } from "os";
import path from "path";
import { fileURLToPath } from "url";
import { candidatiRiservati, contoDelPiano, elencoRiservato, frasiCopiate, nonGiudicate, oscura, OSCURATO, pianoDelleOndate, risultatiDalJournal, territorio, verdettoFinale } from "../prediagnosi.mjs";
import { chiaveProblema } from "../referti-sito.mjs";

const QUI = path.dirname(fileURLToPath(import.meta.url));
const CERVELLO = path.join(QUI, "..");
let rossi = 0;
const dico = (ok, cosa, dettaglio = "") => {
  console.log(`${ok ? "✅" : "❌"} ${cosa}${dettaglio ? ` — ${dettaglio}` : ""}`);
  if (!ok) rossi++;
};
const cartelle = [];
const nuova = (nome) => {
  const d = mkdtempSync(path.join(tmpdir(), `prediagnosi-${nome}-`));
  cartelle.push(d);
  return d;
};

// ── il banco: una radice finta col comando vero, fuori da ogni repository ─────────────────────
const RADICE = nuova("radice");
mkdirSync(path.join(RADICE, "cervello"), { recursive: true });
mkdirSync(path.join(RADICE, "consegne/audit"), { recursive: true });
mkdirSync(path.join(RADICE, "MyCity-Vault/90-Memoria-AI/auto-coscienza"), { recursive: true });
for (const f of ["prediagnosi.mjs", "referti-sito.mjs", "scrivi-json.mjs", "casa-memoria.mjs", "scrittura-misura.mjs", "memoria-senza-perdite.mjs"]) {
  try {
    copyFileSync(path.join(CERVELLO, f), path.join(RADICE, "cervello", f));
  } catch {
    // un modulo che non c'è più non è un errore qui: se il comando lo importa, l'esecuzione lo dirà
  }
}
const COMANDO = path.join(RADICE, "cervello/prediagnosi.mjs");
const AUDIT = path.join(RADICE, "consegne/audit");
const pubblici = () => readdirSync(AUDIT).filter((f) => f.endsWith("ricettario-sito.json"));
const svuotaAudit = () => {
  for (const f of readdirSync(AUDIT)) rmSync(path.join(AUDIT, f));
};
const SEGRETO = "LA-FALLA-STA-NELLA-REGOLA-XYZ-E-SI-SFRUTTA-COSI";
// Una frase lunga della corsia riservata: se una ricetta pubblica la ricopia, il comando deve fermarsi.
const FRASE = "chiunque abbia un account può chiamare la funzione vecchia e annullare un ordine già pagato senza rimborso";
const problemi = [
  { dimensione: "pagamenti-stripe", titolo: "Rimborso doppio dopo un guasto", severita: "grave", file: "lib/a.ts:1", stato: "aperto" },
  { dimensione: "pagamenti-stripe", titolo: "Il negozio non viene pagato", severita: "grave", file: "lib/a.ts:9", stato: "aperto" },
  { dimensione: "frontend-ux", titolo: "Pagina che dice vuoto quando la lettura cade", severita: "minore", file: "app/b.tsx:3", stato: "aperto" },
  { dimensione: "frontend-ux", titolo: "Testo sbagliato sulla consegna", severita: "minore", file: "app/c.tsx:3", stato: "aperto" },
  { dimensione: "rls-database", titolo: "Falla di sicurezza R1 da chiudere (regole d'accesso al database): i dettagli restano fuori", severita: "bloccante", file: "(nel referto privato)", stato: "aperto", fonte_radiografia: "id R1 · si ripara: migrazione-database" },
  { dimensione: "qa-flussi", titolo: "Senza ricetta", severita: "grave", file: "lib/d.ts:1", stato: "aperto" },
  { dimensione: "qa-flussi", titolo: "Già chiuso da prima", severita: "grave", file: "lib/e.ts:1", stato: "chiuso" },
];
writeFileSync(path.join(RADICE, "MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json"), JSON.stringify({ problemi }));

const ricetta = (idx, extra = {}) => ({ idx, ancora_vero: "si", evidenza: "x:1", causa_radice: "c", chi_ripara: "codice", ricetta: "r", file_toccati: ["lib/a.ts"], prova_rossa: "p", raggio: "r", rischio_nascita: "basso", alternativa_semplice: "", dipende_da: "", decisione_per_nicola: "", tocca_soldi_o_dati: true, stima: "M", spento_al_lancio: false, ...extra });
const falla = { titolo: SEGRETO, gravita: "bloccante", dove: `${SEGRETO} supabase/migrations/090_vecchia.sql cancel_order_vecchia`, come_si_sfrutta: FRASE, ricetta: "x", prova_rossa: "x", chi_ripara: "migrazione", probabile_id: "R1", certezza: "alta" };
const journal = [
  { type: "launched" },
  { label: "ricette:soldi", result: { territorio: "soldi", ricette: [ricetta(0, { raggio: "tocca anche cancel_order_vecchia, la funzione dei rimborsi" }), ricetta(1, { ancora_vero: "no", file_toccati: ["lib/a.ts:40", "lib/z.ts"] })], cause_comuni: [], ordine: "", conflitti: "", semplificazioni: "" } },
  // la lente A smentisce il «no» della ricetta su 1: deve restare da riparare
  { label: "lente-A:soldi", result: { verdetti: [{ idx: 0, verdetto: "confermata", ancora_vero_corretto: "si", motivo: "", correzioni_ricetta: "", prova_corretta: "" }, { idx: 1, verdetto: "da_correggere", ancora_vero_corretto: "si", motivo: "la riga c'è ancora", correzioni_ricetta: "", prova_corretta: "" }] } },
  { label: "minori:ux", result: { territorio: "ux", ricette: [
    { idx: 2, ancora_vero: "no", evidenza: "app/b.tsx:3 legge l'errore", chi_ripara: "codice", ricetta: "", file_toccati: ["app/b.tsx"], prova: "", stima: "S", spento_al_lancio: false, causa_comune: "k" },
    { idx: 3, ancora_vero: "no", evidenza: "app/c.tsx:3", chi_ripara: "codice", ricetta: "", file_toccati: ["app/c.tsx"], prova: "", stima: "S", spento_al_lancio: false, causa_comune: "k" },
  ], cause_comuni: "" } },
  // il revisore conferma il 2 e smentisce il 3
  { label: "chiusi:ux", result: { verdetti: [{ idx: 2, gia_chiuso_confermato: true, motivo: "ok" }, { idx: 3, gia_chiuso_confermato: false, motivo: "c'è ancora" }] } },
  { label: "privata:regole", result: { area: "regole", falle: [falla], controllato_e_pulito: [], note: "" } },
];
// Il formato vero del journal: l'etichetta sta sulla riga «started», il risultato su una riga
// «result» che porta solo agentId. Il banco li scrive così, non nella forma comoda.
const comeJournal = (voci, prefisso = "a") => {
  const righe = [];
  voci.forEach((r, i) => {
    if (!r.label) return righe.push(JSON.stringify(r));
    righe.push(JSON.stringify({ type: "started", key: `${prefisso}k${i}`, agentId: `${prefisso}${i}`, label: r.label, phase: "x" }));
    if (r.result) righe.push(JSON.stringify({ type: "result", key: `${prefisso}k${i}`, agentId: `${prefisso}${i}`, result: r.result }));
  });
  return righe.join("\n");
};
const LAVORO = nuova("lavoro");
const scriviJournal = (dir, nome, voci, extra = []) => {
  const f = path.join(dir, nome);
  writeFileSync(f, [comeJournal(voci, nome.replace(/\W/g, "")), ...extra].join("\n"));
  return f;
};
// in più: un risultato orfano (nessuna etichetta da nessuna parte) e un revisore partito e mai tornato
const FILE_JOURNAL = scriviJournal(LAVORO, "journal.jsonl", [...journal, { label: "lente-B:soldi" }], [JSON.stringify({ type: "result", key: "orfano", agentId: "orfano", result: { ricette: [{ idx: 5, ancora_vero: "no" }] } })]);
const esegui = (...a) => spawnSync(process.execPath, [COMANDO, ...a], { encoding: "utf8", cwd: RADICE });
const leggiJson = (f) => JSON.parse(readFileSync(f, "utf8"));

try {
  // ① senza la riservatezza non si pubblica
  const r0 = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, "--scrivi");
  dico(r0.status === 2 && pubblici().length === 0 && !existsSync(path.join(LAVORO, "ricettario-completo.json")), "① --scrivi senza --riservato esce 2 e non scrive niente, né pubblico né completo", `uscita ${r0.status}`);
  dico(/--scrivi vuole --riservato/.test(r0.stderr), "① e dice perché: manca il passaggio della riservatezza", r0.stderr.trim().slice(0, 120));

  // ① con la riservatezza dichiarata il riservato non esce
  const r = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, "--scrivi", "--riservato", "nessuno");
  dico(r.status === 0, "raccogli su un journal buono, con --riservato nessuno, esce 0", `uscita ${r.status} ${r.stderr.trim()}`);
  dico(pubblici().length === 1, "con --scrivi nasce un ricettario pubblico", `trovati ${pubblici().length}`);
  const pubblico = pubblici().length ? readFileSync(path.join(AUDIT, pubblici()[0]), "utf8") : "";
  dico(pubblico.length > 0 && !pubblico.includes(SEGRETO) && !pubblico.includes("annullare un ordine già pagato"), "① il testo della falla riservata NON è nel ricettario pubblico");
  const completo = existsSync(path.join(LAVORO, "ricettario-completo.json")) ? readFileSync(path.join(LAVORO, "ricettario-completo.json"), "utf8") : "";
  dico(completo.includes(SEGRETO), "① ma è nel ricettario completo, nella cartella fuori dal repo");
  dico(/frasi della corsia riservata nel testo pubblico: 0 campi/.test(r.stdout), "① il confronto delle frasi copiate è stato fatto, e lo dice");

  // ② due voci per chiudere, ⑤ nessuno si perde
  const ric = JSON.parse(pubblico || "{}");
  const esito = Object.fromEntries((ric.difetti || []).map((d) => [d.idx, d.esito ?? (d.riservato ? "riservato" : "")]));
  dico(esito[1] === "da_riparare", "② «già risolto» smentito dalla lente A resta da riparare", `esito ${esito[1]}`);
  dico(esito[2] === "gia_risolto", "② «già risolto» confermato dal revisore esce", `esito ${esito[2]}`);
  dico(esito[3] === "da_riparare", "② «già risolto» smentito dal revisore dei minori resta da riparare", `esito ${esito[3]}`);
  dico(esito[4] === "riservato", "② la falla riservata compare solo come riservata, col titolo pubblico", `esito ${esito[4]}`);
  dico(esito[5] === "senza_ricetta", "⑤ un difetto senza ricetta ha l'esito «senza_ricetta», non sparisce — e un risultato senza etichetta non gliene inventa una", `esito ${esito[5]}`);
  dico(/1 risultati senza etichetta/.test(r.stdout), "⑤ il risultato senza etichetta è contato e detto, non ingoiato", r.stdout.split("\n").find((l) => l.includes("etichetta")) || "nessuna riga");
  dico(/1 revisori partiti e mai tornati: lente-B:soldi/.test(r.stdout) && ric.sintesi?.revisori_partiti_e_mai_tornati === 1, "⑤ il revisore partito e mai tornato è detto per nome e contato", r.stdout.split("\n").find((l) => l.includes("mai tornati")) || "nessuna riga");
  dico((ric.difetti || []).length === 6 && !("6" in esito), "⑤ tutti e 6 gli aperti hanno un esito, il chiuso no", `voci ${(ric.difetti || []).length}`);
  dico(verdettoFinale({ ricetta: { ancora_vero: "no" } }) === "da_riparare", "② la ricetta da sola, senza nessun revisore, non chiude");
  dico(verdettoFinale({ ricetta: { ancora_vero: "no" }, lenteA: { verdetto: "gia_chiuso_confermato", ancora_vero_corretto: "no" } }) === "gia_risolto", "② ricetta e lente A d'accordo sul «già chiuso»: esce");
  dico(verdettoFinale({ ricetta: { ancora_vero: "si" }, lenteA: { verdetto: "gia_chiuso_confermato", ancora_vero_corretto: "no" } }) === "da_rivedere", "② la lente dice «già chiuso», la ricetta «ancora vero»: da rivedere, non chiuso");
  dico(verdettoFinale({ ricetta: { ancora_vero: "si" }, lenteA: { verdetto: "non_reale", ancora_vero_corretto: "no" } }) === "da_rivedere", "② un difetto che la lente dice non reale va rivisto, non chiuso");
  dico(verdettoFinale({ ricetta: { ancora_vero: "no" }, chiuso: { gia_chiuso_confermato: "true" } }) === "da_riparare", "② un «true» scritto come testo non vale come conferma");

  // il comando «riservato» prepara i materiali dei revisori della riservatezza
  const rr = esegui("riservato", "--cartella", LAVORO);
  const daControllare = existsSync(path.join(LAVORO, "da-controllare-riservato.json")) ? leggiJson(path.join(LAVORO, "da-controllare-riservato.json")) : { difetti: [] };
  const idxDaControllare = daControllare.difetti.map((d) => d.idx);
  dico(rr.status === 0 && idxDaControllare.includes(0) && !idxDaControllare.includes(2), "① «riservato» segnala ai revisori il difetto pubblico che nomina una funzione della falla, e solo quello", `uscita ${rr.status} · idx ${idxDaControllare.join(",")}`);
  dico(existsSync(path.join(LAVORO, "PRIVATO-elenco.json")) && readFileSync(path.join(LAVORO, "PRIVATO-elenco.json"), "utf8").includes(SEGRETO), "① l'elenco delle falle per i revisori nasce nella cartella fuori dal repo");
  const comuni = candidatiRiservati({ privata: [{ result: { falle: [{ dove: "order_id lib/a.ts" }] } }], difetti: Array.from({ length: 12 }, (_, i) => ({ idx: i, ricetta: { raggio: "usa order_id in lib/a.ts" } })), territori: [] });
  dico(comuni.difetti.length === 0, "① un nome comune a tanti difetti (order_id) non segnala niente", `segnalati ${comuni.difetti.length}`);

  // ①bis l'elenco del riservato: il campo segnato esce oscurato, gli altri restano
  const ELENCO = path.join(LAVORO, "riservato.json");
  writeFileSync(ELENCO, JSON.stringify([{ idx: 1, campi: ["ricetta.raggio"], perche: "nomina la falla" }]));
  svuotaAudit();
  const r2 = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, "--scrivi", "--riservato", ELENCO);
  const voce1 = pubblici().length ? leggiJson(path.join(AUDIT, pubblici()[0])).difetti.find((x) => x.idx === 1) : null;
  dico(r2.status === 0 && voce1 && voce1.ricetta.raggio === OSCURATO && voce1.ricetta.ricetta === "r", "①bis il campo segnato esce oscurato, gli altri restano", `uscita ${r2.status}`);
  dico(leggiJson(path.join(LAVORO, "ricettario-completo.json")).difetti.find((x) => x.idx === 1).ricetta.raggio === "r", "①bis il ricettario completo, fuori dal repo, resta intero");

  // ①bis l'elenco può arrivare dal journal dei revisori della riservatezza
  // il revisore lascia «territorio» vuoto accanto all'idx, come fanno le risposte strutturate
  const J_RIS = scriviJournal(LAVORO, "riservatezza.jsonl", [{ label: "riservato:istruzioni", result: { da_oscurare: [{ idx: 0, territorio: "", campi: ["ricetta.raggio"], perche: "nomina la funzione della falla" }] } }]);
  svuotaAudit();
  const r5 = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, "--scrivi", "--riservato", J_RIS);
  const voce0 = pubblici().length ? leggiJson(path.join(AUDIT, pubblici()[0])).difetti.find((x) => x.idx === 0) : null;
  dico(r5.status === 0 && voce0?.ricetta?.raggio === OSCURATO && !JSON.stringify(voce0).includes("cancel_order_vecchia"), "①bis dal journal del modo «riservatezza» l'oscuratura arriva al ricettario pubblico", `uscita ${r5.status}`);
  const J_ALTRO = scriviJournal(LAVORO, "altro.jsonl", [{ label: "lente-A:soldi", result: { verdetti: [] } }]);
  svuotaAudit();
  const r6 = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, "--scrivi", "--riservato", J_ALTRO);
  dico(r6.status === 2 && pubblici().length === 0, "①bis un journal che non porta i revisori della riservatezza non vale come elenco: esce 2", `uscita ${r6.status}`);

  // ①bis un'oscuratura scritta male o senza bersaglio non è avvenuta
  for (const [elenco, cosa] of [
    [[{ idx: 1, campi: ["ricetta.non_esiste"] }], "un campo che non c'è"],
    [[{ idx: 1, campo: "ricetta.raggio" }], "«campo» al singolare"],
    [[{ idx: 1, campi: [] }], "«campi» vuoto"],
    [[{ idx: 1, territorio: "soldi", campi: ["cause_comuni"] }], "idx e territorio insieme"],
    [{ idx: 1, campi: ["ricetta.raggio"] }, "una voce sola invece di una lista"],
  ]) {
    writeFileSync(ELENCO, JSON.stringify(elenco));
    svuotaAudit();
    const rx = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, "--scrivi", "--riservato", ELENCO);
    dico(rx.status === 2 && pubblici().length === 0, `①bis ${cosa} nell'elenco esce 2 e non scrive niente di pubblico`, `uscita ${rx.status}`);
  }
  dico(oscura({ difetti: [] }, [{ idx: 99, campi: ["ricetta.x"] }]).mancati.length === 1, "①bis un difetto che non c'è è un mancato, non un successo");
  const omonimi = oscura({ territori: [{ territorio: "ux", modo: "seri", cause_comuni: "a" }, { territorio: "ux", modo: "minori", cause_comuni: "b" }] }, [{ territorio: "ux", campi: ["cause_comuni"] }]);
  dico(omonimi.mancati.length === 0 && omonimi.ricettario.territori.every((t) => t.cause_comuni === OSCURATO), "①bis un territorio col nome ripetuto fra seri e minori si oscura in tutte e due le copie");
  const soloMinori = oscura({ territori: [{ territorio: "ux", modo: "seri", cause_comuni: "a" }, { territorio: "ux", modo: "minori", cause_comuni: "b" }] }, [{ territorio: "ux", modo: "minori", campi: ["cause_comuni"] }]);
  dico(soloMinori.ricettario.territori[0].cause_comuni === "a" && soloMinori.ricettario.territori[1].cause_comuni === OSCURATO, "①bis col «modo» si oscura solo la copia indicata");
  dico(oscura({ difetti: [{ idx: 1, ricetta: { raggio: "r" } }] }, elencoRiservato(JSON.stringify([{ idx: 1, territorio: "soldi", campi: ["ricetta.raggio"] }]))).mancati.length === 1, "①bis due bersagli scritti davvero restano un errore");
  dico(JSON.stringify(elencoRiservato(JSON.stringify({ da_oscurare: [{ idx: 1, campi: ["x"] }] }))) === JSON.stringify([{ idx: 1, campi: ["x"] }]) && elencoRiservato(JSON.stringify([{ da_oscurare: [{ idx: 2, campi: ["y"] }] }]))[0].idx === 2, "①bis l'elenco si legge anche dall'uscita di un revisore, sola o in lista");

  // ① le frasi copiate: una ricetta pubblica che ripete una falla riservata ferma tutto
  const COPIA = nuova("copia");
  const J_COPIA = scriviJournal(COPIA, "copia.jsonl", [{ label: "ricette:qa", result: { territorio: "qa", ricette: [ricetta(5, { raggio: `attenzione: ${FRASE}, va chiuso prima` })], cause_comuni: [] } }]);
  const r7 = esegui("raccogli", "--cartella", COPIA, FILE_JOURNAL, J_COPIA, "--scrivi", "--riservato", "nessuno");
  dico(r7.status === 2 && pubblici().length === 0, "① una frase della falla ricopiata in una ricetta pubblica esce 2 e non pubblica", `uscita ${r7.status}`);
  dico(/difetto 5\.ricetta\.raggio/.test(r7.stderr + r7.stdout) && !(r7.stderr + r7.stdout).includes("annullare un ordine"), "① e dice DOVE sta la copia senza ripetere la frase");
  // la frase in comune finisce nei materiali dei revisori, campo per campo
  esegui("raccogli", "--cartella", COPIA, FILE_JOURNAL, J_COPIA);
  const rr2 = esegui("riservato", "--cartella", COPIA);
  const mat = existsSync(path.join(COPIA, "da-controllare-riservato.json")) ? leggiJson(path.join(COPIA, "da-controllare-riservato.json")) : {};
  dico(rr2.status === 0 && (mat.frasi_in_comune || []).includes("difetto 5.ricetta.raggio") && /frase in comune/.test(mat.difetti?.find((x) => x.idx === 5)?.perche_segnalato || ""), "① «riservato» manda ai revisori il campo con la frase in comune", `uscita ${rr2.status}`);
  writeFileSync(path.join(COPIA, "elenco.json"), JSON.stringify([{ idx: 5, campi: ["ricetta.raggio"] }]));
  svuotaAudit();
  const r8 = esegui("raccogli", "--cartella", COPIA, FILE_JOURNAL, J_COPIA, "--scrivi", "--riservato", path.join(COPIA, "elenco.json"));
  dico(r8.status === 0, "① oscurata la copia, si pubblica", `uscita ${r8.status} ${r8.stderr.trim()}`);
  // il revisore la giudica già pubblica: si pubblica intera, e il giudizio è contato
  writeFileSync(path.join(COPIA, "elenco.json"), JSON.stringify({ da_oscurare: [], giudicati_pubblici: [{ idx: 5, campi: ["ricetta.raggio"], perche: "il difetto pubblico lo dice già" }] }));
  svuotaAudit();
  const r11 = esegui("raccogli", "--cartella", COPIA, FILE_JOURNAL, J_COPIA, "--scrivi", "--riservato", path.join(COPIA, "elenco.json"));
  const voce5 = pubblici().length ? leggiJson(path.join(AUDIT, pubblici()[0])).difetti.find((x) => x.idx === 5) : null;
  dico(r11.status === 0 && voce5?.ricetta?.raggio?.includes("attenzione") && /1 giudicati pubblici/.test(r11.stdout), "① una frase in comune giudicata pubblica dal revisore si pubblica intera, e il giudizio è detto", `uscita ${r11.status}`);
  writeFileSync(path.join(COPIA, "elenco.json"), JSON.stringify({ giudicati_pubblici: [{ idx: 5, campi: ["ricetta.non_esiste"], perche: "x" }] }));
  svuotaAudit();
  dico(esegui("raccogli", "--cartella", COPIA, FILE_JOURNAL, J_COPIA, "--scrivi", "--riservato", path.join(COPIA, "elenco.json")).status === 2 && pubblici().length === 0, "① un giudizio su un campo che non c'è non vale: esce 2");
  writeFileSync(path.join(COPIA, "elenco.json"), JSON.stringify({ giudicati_pubblici: [{ idx: 0, campi: ["ricetta.raggio"], perche: "un altro campo" }] }));
  svuotaAudit();
  dico(esegui("raccogli", "--cartella", COPIA, FILE_JOURNAL, J_COPIA, "--scrivi", "--riservato", path.join(COPIA, "elenco.json")).status === 2 && pubblici().length === 0, "① un giudizio su un ALTRO campo non copre la copia: esce 2");
  dico(frasiCopiate({ difetti: [{ idx: 1, ricetta: { raggio: FRASE } }] }, [FRASE], [`nel registro pubblico: ${FRASE}.`]).length === 0, "① una frase che è già in un testo pubblico non conta come copia");
  dico(nonGiudicate(["territorio seri:soldi.cause_comuni.0.perche", "difetto 3.ricetta.raggio"], ["territorio seri:soldi.cause_comuni"]).join() === "difetto 3.ricetta.raggio", "① un giudizio su un campo copre quello che c'è dentro, e niente altro");
  dico(frasiCopiate({ difetti: [{ idx: 1, ricetta: { raggio: "Chiunque abbia un account può CHIAMARE la funzione vecchia e annullare" } }] }, [FRASE]).length === 1, "① la copia si riconosce anche con maiuscole e punteggiatura diverse");
  dico(frasiCopiate({ difetti: [{ idx: 1, ricetta: { raggio: "un account può chiamare la funzione" } }] }, [FRASE]).length === 0, "① sei parole in comune non sono una copia");

  // ① una ricetta pubblica scritta su una falla riservata
  const INTRUSO = nuova("intruso");
  svuotaAudit();
  const J_INTRUSO = scriviJournal(INTRUSO, "intruso.jsonl", [{ label: "ricette:intruso", result: { territorio: "intruso", ricette: [ricetta(0), ricetta(4, { raggio: SEGRETO })], cause_comuni: [] } }]);
  const r9 = esegui("raccogli", "--cartella", INTRUSO, J_INTRUSO, "--scrivi", "--riservato", "nessuno");
  dico(r9.status === 2 && pubblici().length === 0 && !existsSync(path.join(INTRUSO, "ricettario-completo.json")), "① una ricetta pubblica su una falla riservata esce 2 prima di scrivere", `uscita ${r9.status}`);
  dico(/intruso/.test(r9.stderr) && !r9.stderr.includes(SEGRETO), "① e nomina solo il territorio, non il testo");

  // ④ un journal di un altro registro non diventa un verde
  const ALTRO = nuova("altro-registro");
  const J_ALTRO_REG = scriviJournal(ALTRO, "vecchio.jsonl", [{ label: "ricette:vecchio", result: { territorio: "vecchio", ricette: [ricetta(40), ricetta(41)], cause_comuni: [] } }]);
  const r10 = esegui("raccogli", "--cartella", ALTRO, J_ALTRO_REG, "--scrivi", "--riservato", "nessuno");
  dico(r10.status === 2 && pubblici().length === 0 && !existsSync(path.join(ALTRO, "ricettario-completo.json")), "④ un journal di un altro registro esce 2 e non scrive niente", `uscita ${r10.status}`);

  // ⑤ il journal letto com'è davvero
  const prima = risultatiDalJournal([
    JSON.stringify({ type: "result", agentId: "x1", result: { ok: 1 } }),
    JSON.stringify({ type: "started", agentId: "x1", label: "ricette:dopo" }),
    JSON.stringify({ type: "started", agentId: "x2", label: "lente-A:perso" }),
    "{riga a metà",
  ].join("\n"));
  dico(prima.length === 1 && prima[0].label === "ricette:dopo", "⑤ un risultato scritto prima della sua riga «started» ritrova l'etichetta");
  dico(prima.persi.join() === "lente-A:perso" && prima.illeggibili === 1, "⑤ il revisore mai tornato e la riga a metà sono contati");

  // ③ due pacchetti che toccano lo stesso file esistente non stanno nella stessa ondata
  const d = (idx, file, stima = "M") => ({ idx, severita: "grave", ricetta: { file_toccati: file, stima }, lente_b: null });
  const esiste = (f) => !f.startsWith("nuovo/");
  const piano = pianoDelleOndate([
    d(10, ["lib/a.ts:3", "lib/condiviso.ts"]),
    d(11, ["./lib/a.ts (riga 4, la funzione paga)"]),
    d(12, ["/home/user/mycity/lib/b.ts:9-12", "lib/condiviso.ts"]),
    d(13, ["app/altro.tsx"]),
    d(14, ["tests/unit/nuova-prova.test.ts", "nuovo/164_migrazione.sql"]),
    d(15, ["tests/unit/nuova-prova.test.ts", "app/terzo.tsx"]),
  ], { esiste });
  const onda = (i) => piano.ondate.findIndex((w) => w.some((p) => p.difetti.includes(i)));
  const pacco = (i) => piano.ondate.flat().find((p) => p.difetti.includes(i));
  dico(pacco(10) === pacco(11), "③ due ricette sullo stesso file caldo stanno nello stesso pacchetto (anche scritto in tre modi)");
  dico(pacco(12) !== pacco(10) && onda(12) !== onda(10), "③ due pacchetti che condividono un file esistente finiscono in ondate diverse", `ondate ${onda(10)} e ${onda(12)}`);
  dico(onda(15) === onda(10) || onda(15) === onda(12) || piano.ondate.length <= 2, "③ una prova nuova in comune non è un conflitto: non apre un'ondata in più", `ondate ${piano.ondate.length}`);
  dico(piano.liberi.includes(14), "③ una ricetta che tocca solo prove e migrazioni nuove è fuori dai pacchetti, contata", `liberi ${piano.liberi.join(",")}`);
  dico(territorio({ file_toccati: ["tests/x.test.ts", "lib/a.ts:1", "lib/a.ts"] }).join() === "lib/a.ts", "③ il territorio toglie le prove e i doppioni");
  dico(territorio({ file_toccati: ["/srv/sito/lib/a.ts:3"] }, () => true, "/srv/sito").join() === "lib/a.ts", "③ il percorso intero si riporta a quello del sito, con la radice data");
  dico(piano.ore_di_squadra === 7.5 && piano.ore_in_fila === Math.max(...piano.ondate[0].map((p) => p.ore)) + (piano.ondate[1] ? Math.max(...piano.ondate[1].map((p) => p.ore)) : 0), "③ le ore in fila sono la somma della squadra più lenta di ogni ondata", `${piano.ore_di_squadra} · ${piano.ore_in_fila}`);

  // ③ il conto del piano e il comando «ondate»
  const PIANO = nuova("piano");
  const difettiPiano = [
    { idx: 0, severita: "grave", esito: "da_riparare", ricetta: { chi_ripara: "codice", file_toccati: ["lib/a.ts"], stima: "M" } },
    { idx: 1, severita: "grave", esito: "senza_ricetta", ricetta: null },
    { idx: 2, severita: "minore", esito: "gia_risolto", ricetta: { chi_ripara: "codice", file_toccati: ["app/b.tsx"], stima: "S" } },
    { idx: 3, severita: "bloccante", riservato: true },
    { idx: 4, severita: "minore", esito: "da_riparare", ricetta: { chi_ripara: "nicola", file_toccati: [], stima: "S" } },
  ];
  const RIC = path.join(PIANO, "ricettario.json");
  writeFileSync(RIC, JSON.stringify({ difetti: difettiPiano }));
  const conto = contoDelPiano(difettiPiano, [difettiPiano[0]], { nicola: [4] });
  dico(conto.torna && conto.seriScoperti.join() === "1", "③ il conto del piano torna difetto per difetto, e i seri scoperti sono detti", JSON.stringify(conto.fuori));
  dico(!contoDelPiano([...difettiPiano, { idx: 9, severita: "grave", esito: "boh" }], [difettiPiano[0]], { nicola: [4] }).torna, "③ un difetto con un esito che nessuno conosce fa saltare il conto");
  const o1 = esegui("ondate", "--ricettario", RIC);
  dico(o1.status === 2 && /Il conto torna: 5 su 5/.test(o1.stdout), "③ un piano con un difetto serio senza ricetta esce 2, dopo aver detto il conto", `uscita ${o1.status}`);
  const o2 = esegui("ondate", "--ricettario", RIC, "--parziale", "--scrivi");
  const scritto = existsSync(path.join(PIANO, "ricettario-ondate.json")) ? leggiJson(path.join(PIANO, "ricettario-ondate.json")) : null;
  dico(o2.status === 0 && scritto?.fuori_dal_piano?.senza_ricetta?.join() === "1" && scritto?.corsie?.nicola?.join() === "4", "③ con --parziale il piano si scrive, e porta chi resta fuori", `uscita ${o2.status}`);
  writeFileSync(RIC, JSON.stringify({ difetti: [...difettiPiano, { idx: 9, severita: "grave", esito: "boh", ricetta: { chi_ripara: "codice", file_toccati: ["lib/q.ts"] } }] }));
  dico(esegui("ondate", "--ricettario", RIC, "--parziale").status === 2, "③ un esito sconosciuto nel ricettario fa uscire 2: il conto non torna");
  writeFileSync(RIC, JSON.stringify({ difetti: difettiPiano }));
  const REPO_FINTO = nuova("repo-sito");
  writeFileSync(path.join(REPO_FINTO, "package.json"), "{}");
  dico(esegui("ondate", "--ricettario", RIC, "--parziale", "--repo", REPO_FINTO).status === 2, "③ un --repo dove non esiste nessuno dei file citati esce 2: non è la cartella del sito");
  mkdirSync(path.join(REPO_FINTO, "lib"));
  writeFileSync(path.join(REPO_FINTO, "lib/a.ts"), "");
  dico(esegui("ondate", "--ricettario", RIC, "--parziale", "--repo", REPO_FINTO).status === 0, "③ con i file al loro posto lo stesso --repo va");
  dico(esegui("ondate", "--ricettario", RIC, "--parziale", "--repo", PIANO).status === 2, "③ un --repo senza package.json esce 2");

  // ⑥ le schede si spostano nel registro fra «prepara» e «raccogli»: la ricetta segue la CHIAVE
  const SPOSTA = nuova("sposta");
  const rp = esegui("prepara", "--cartella", SPOSTA);
  const fascicolo = existsSync(path.join(SPOSTA, "difetti/3.json")) ? leggiJson(path.join(SPOSTA, "difetti/3.json")) : {};
  dico(rp.status === 0 && fascicolo._chiave === chiaveProblema(problemi[3]) && !existsSync(path.join(SPOSTA, "difetti/6.json")), "⑥ «prepara» scrive un fascicolo per ogni aperto, con la sua chiave", `uscita ${rp.status}`);
  // un'altra sessione inserisce una scheda in testa: tutto scala di uno; e la 3 cambia titolo
  const spostati = [{ dimensione: "deploy-sre", titolo: "Scheda nuova in testa", severita: "minore", file: "x.yml", stato: "aperto" }, ...problemi.map((p, i) => (i === 3 ? { ...p, titolo: "Titolo riscritto da una squadra" } : p))];
  const REG2 = path.join(SPOSTA, "registro.json");
  writeFileSync(REG2, JSON.stringify({ problemi: spostati }));
  const r4 = esegui("raccogli", "--cartella", SPOSTA, "--registro", REG2, FILE_JOURNAL);
  const comp = existsSync(path.join(SPOSTA, "ricettario-completo.json")) ? leggiJson(path.join(SPOSTA, "ricettario-completo.json")) : { difetti: [] };
  const di = (titolo) => comp.difetti.find((x) => x.titolo === titolo);
  dico(r4.status === 0 && di("Il negozio non viene pagato")?.idx === 2 && di("Il negozio non viene pagato")?.ricetta?.territorio === "soldi" && di("Pagina che dice vuoto quando la lettura cade")?.ricetta?.territorio === "ux", "⑥ una scheda spostata riceve la SUA ricetta, non quella del vicino", `uscita ${r4.status}`);
  dico(!di("Scheda nuova in testa")?.ricetta, "⑥ la scheda nuova arrivata in testa non eredita la ricetta di nessuno");
  dico(/riagganciati per chiave/.test(r4.stdout) && /non ritrovano il loro difetto/.test(r4.stdout), "⑥ lo spostamento e la ricetta senza difetto sono detti, non ingoiati", r4.stdout.split("\n").filter((l) => /chiave|ritrovano/.test(l)).join(" | "));

  // ④ il verde su zero, e le cartelle dentro un repository
  const vuoto = path.join(LAVORO, "vuoto.jsonl");
  writeFileSync(vuoto, JSON.stringify({ type: "launched" }) + "\n");
  dico(esegui("raccogli", "--cartella", LAVORO, vuoto).status === 2, "④ un journal senza risultati esce 2, non verde");
  dico(esegui("raccogli", "--cartella", LAVORO).status === 2, "④ raccogli senza journal esce 2");
  dico(esegui("raccogli", "--cartella", LAVORO, path.join(LAVORO, "non-esiste.jsonl")).status === 2, "④ un journal che non esiste esce 2");
  dico(esegui("raccogli", FILE_JOURNAL).status === 2, "④ raccogli senza --cartella esce 2");
  const REPO = nuova("repo");
  mkdirSync(path.join(REPO, ".git"));
  const WORKTREE = nuova("worktree");
  writeFileSync(path.join(WORKTREE, ".git"), "gitdir: /altrove/.git/worktrees/x\n");
  // il collegamento punta a una SOTTOCARTELLA del repository: risalendo dal collegamento non si
  // incontra mai il .git, lo si trova solo seguendo il percorso vero
  mkdirSync(path.join(REPO, "sotto"));
  const LINK = path.join(nuova("collegamento"), "porta-nel-repo");
  symlinkSync(path.join(REPO, "sotto"), LINK);
  for (const [dir, nascerebbe, cosa] of [
    [path.join(REPO, "dentro/piu/giu"), path.join(REPO, "dentro"), "una cartella dentro un repository"],
    [path.join(WORKTREE, "dentro"), path.join(WORKTREE, "dentro"), "una cartella dentro un worktree (.git è un file)"],
    [path.join(LINK, "dentro"), path.join(REPO, "sotto/dentro"), "un collegamento simbolico che porta dentro un repository"],
  ]) {
    const rc = esegui("prepara", "--cartella", dir);
    dico(rc.status === 2 && !existsSync(nascerebbe), `④ ${cosa} esce 2 e non nasce nemmeno vuota`, `uscita ${rc.status}`);
  }
  dico(esegui("ondate").status === 2, "④ ondate senza ricettario esce 2");
  dico(esegui("prepara", "--boh").status === 2, "④ un argomento sconosciuto esce 2");
  dico(esegui("ripara").status === 2, "④ un comando sconosciuto esce 2");
} finally {
  for (const d of cartelle) rmSync(d, { recursive: true, force: true });
}
console.log(rossi ? `\n❌ ${rossi} controlli rossi` : "\n✅ pre-diagnosi: tutti i controlli verdi");
process.exit(rossi ? 1 : 0);
