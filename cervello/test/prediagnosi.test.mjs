#!/usr/bin/env node
// 🔎 PRE-DIAGNOSI — la prova del comando che raccoglie le ricette prima di riparare il sito.
//
// LE MALATTIE CHE QUESTO COMANDO NON DEVE AVERE, e perché costerebbero care:
//   ① una falla di sicurezza riservata che finisce nel deposito pubblico: la memoria e il sito sono
//      repository PUBBLICI, e una falla aperta descritta lì è un manuale per chi la vuole sfruttare;
//   ② un difetto vero chiuso per sbaglio: basta che chi scrive la ricetta dica «già risolto» e il
//      difetto esce dal lavoro. Serve anche la voce del revisore che aveva il mandato di smentirlo;
//   ③ due squadre sullo stesso file: è quello che fa nascere i conflitti alla ricucitura;
//   ④ il verde su zero: un journal vuoto, di un altro registro o di un altro formato non deve
//      diventare «tutto fatto», e una cartella dentro un repository non deve nascere nemmeno vuota.
//
// COSA PROVA, eseguendo il comando vero su un registro e su journal costruiti a mano:
//   ① si pubblica solo con la revisione della riservatezza completa (due lenti tornate, testo riletto,
//      impronta di oggi), con ogni campo segnalato giudicato, e senza che un'oscuratura di prima torni
//      in chiaro; «nessuno» non vale se ci sono falle; la corsia riservata mancante si riprende dalla
//      cartella o ferma tutto; una scheda riservata col titolo ritoccato resta riservata
//   ①bis l'elenco del riservato oscura il campo segnato; un'oscuratura scritta male o senza
//      bersaglio esce 2 e non scrive niente di pubblico
//   ② una chiusura vuole due voci d'accordo; voci in disaccordo, o una voce sola, vanno riviste
//   ③ due pacchetti sullo stesso file non stanno nella stessa ondata; una citazione larga va da sola;
//      il conto del piano e le ore tornano
//   ④ journal vuoti, di altri registri, fascicoli mancanti, cartelle dentro un repository: uscita 2
//   ⑤ nessun difetto aperto si perde, e i revisori persi sono detti senza falsi allarmi
//   ⑥ se le schede cambiano posizione nel registro, ogni ricetta segue la chiave del suo difetto
//
// NON-VACUITÀ: le mutazioni stanno in cervello/mutanti.json (lotto «prediagnosi»), e ognuna rende
// rosso questo file. Si rilanciano con `node cervello/non-vacuita.mjs --lotto prediagnosi`.
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, copyFileSync, rmSync, existsSync, symlinkSync } from "fs";
import { spawnSync } from "child_process";
import { tmpdir } from "os";
import path from "path";
import { fileURLToPath } from "url";
import { campiConNomi, candidatiRiservati, contoDelPiano, elencoRiservato, frasiCopiate, impronta, listaFile, nonGiudicate, oscura, OSCURATO, oscuratiPrima, pianoDelleOndate, risultatiDalJournal, territoriDaPreparare, territorio, testiDellaCorsiaRiservata, tornatiInChiaro, verdettoDelleVoci, verdettoFinale } from "../prediagnosi.mjs";
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
const ultimoPubblico = () => (pubblici().length ? JSON.parse(readFileSync(path.join(AUDIT, pubblici().sort().at(-1)), "utf8")) : null);
const svuotaAudit = () => {
  for (const f of readdirSync(AUDIT)) rmSync(path.join(AUDIT, f), { recursive: true, force: true });
};
const SEGRETO = "LA-FALLA-STA-NELLA-REGOLA-XYZ-E-SI-SFRUTTA-COSI";
// Una frase lunga della corsia riservata: se una ricetta pubblica la ricopia, il comando deve fermarsi.
const FRASE = "chiunque abbia un account può chiamare la funzione vecchia e annullare un ordine già pagato senza rimborso";
const NOME = "cancel_order_vecchia";
const PRIVATA = { dimensione: "rls-database", titolo: "Falla di sicurezza R1 da chiudere (regole d'accesso al database): i dettagli restano fuori", severita: "bloccante", file: "(nel referto privato)", stato: "aperto", fonte_radiografia: "id R1 · si ripara: migrazione-database" };
// La fonte come la scrive la radiografia vera: «id R<n>» lo porta OGNI difetto, non solo le falle.
const problemi = [
  { dimensione: "pagamenti-stripe", titolo: "Rimborso doppio dopo un guasto", severita: "grave", file: "lib/a.ts:1", stato: "aperto", fonte_radiografia: "radiografia 2026-10-11 · corsie: pagamenti · id R5 · si ripara: codice" },
  { dimensione: "pagamenti-stripe", titolo: "Il negozio non viene pagato", severita: "grave", file: "lib/a.ts:9", stato: "aperto" },
  { dimensione: "frontend-ux", titolo: "Pagina che dice vuoto quando la lettura cade", severita: "minore", file: "app/b.tsx:3", stato: "aperto" },
  { dimensione: "frontend-ux", titolo: "Testo sbagliato sulla consegna", severita: "minore", file: "app/c.tsx:3", stato: "aperto" },
  PRIVATA,
  { dimensione: "qa-flussi", titolo: "Senza ricetta", severita: "grave", file: "lib/d.ts:1", stato: "aperto" },
  { dimensione: "qa-flussi", titolo: "Già chiuso da prima", severita: "grave", file: "lib/e.ts:1", stato: "chiuso" },
];
writeFileSync(path.join(RADICE, "MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json"), JSON.stringify({ problemi }));

const ricetta = (idx, extra = {}) => ({ idx, ancora_vero: "si", evidenza: "x:1", causa_radice: "c", chi_ripara: "codice", ricetta: "r", file_toccati: ["lib/a.ts"], prova_rossa: "p", raggio: "r", rischio_nascita: "basso", alternativa_semplice: "", dipende_da: "", decisione_per_nicola: "", tocca_soldi_o_dati: true, stima: "M", spento_al_lancio: false, ...extra });
const falla = { titolo: SEGRETO, gravita: "bloccante", dove: `${SEGRETO} supabase/migrations/090_vecchia.sql ${NOME}`, come_si_sfrutta: FRASE, ricetta: "x", prova_rossa: "x", chi_ripara: "migrazione", probabile_id: "R1", certezza: "alta" };
const journal = [
  { type: "launched" },
  { label: "ricette:soldi", result: { territorio: "soldi", ricette: [ricetta(0, { raggio: `tocca anche ${NOME}, la funzione dei rimborsi` }), ricetta(1, { ancora_vero: "no", file_toccati: ["lib/a.ts:40", "lib/z.ts"] })], cause_comuni: [], ordine: "", conflitti: "", semplificazioni: "" } },
  // la lente A smentisce il «no» della ricetta su 1: non si chiude
  { label: "lente-A:soldi", result: { verdetti: [{ idx: 0, verdetto: "confermata", ancora_vero_corretto: "si", motivo: "", correzioni_ricetta: "", prova_corretta: "" }, { idx: 1, verdetto: "da_correggere", ancora_vero_corretto: "si", motivo: "la riga c'è ancora", correzioni_ricetta: "", prova_corretta: "" }] } },
  { label: "lente-B:soldi", result: { rischi: [{ idx: 0, nascite_previste: "", prove_aggiuntive: "", rischio_rivisto: "basso", semplificare_invece: false, perche: "" }], interazioni_fra_territori: "lib/a.ts lo tocca anche il territorio dei contanti" } },
  { label: "minori:ux", result: { territorio: "ux", ricette: [
    { idx: 2, ancora_vero: "no", evidenza: "app/b.tsx:3 legge l'errore", chi_ripara: "codice", ricetta: "", file_toccati: ["app/b.tsx"], prova: "", stima: "S", spento_al_lancio: false, causa_comune: "k" },
    { idx: 3, ancora_vero: "no", evidenza: "app/c.tsx:3", chi_ripara: "codice", ricetta: "", file_toccati: ["app/c.tsx"], prova: "", stima: "S", spento_al_lancio: false, causa_comune: "k" },
  ], cause_comuni: "" } },
  // il revisore conferma il 2 e smentisce il 3
  { label: "chiusi:ux", result: { verdetti: [{ idx: 2, gia_chiuso_confermato: true, motivo: "ok" }, { idx: 3, gia_chiuso_confermato: false, motivo: "c'è ancora" }] } },
  { label: "privata:regole", result: { area: "regole", falle: [falla], controllato_e_pulito: [], note: "" } },
  { label: "privata-v:regole", result: { verdetti: [{ titolo: SEGRETO, reale: true, gravita_rivista: "bloccante", motivo: "confermata" }], mancate: `una falla nuova: ${SEGRETO}-BIS si apre con la rotta segreta-della-chat` } },
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
const scriviJournal = (dir, nome, voci, extra = []) => {
  const f = path.join(dir, nome);
  writeFileSync(f, [comeJournal(voci, nome.replace(/\W/g, "")), ...extra].join("\n"));
  return f;
};
const esegui = (...a) => spawnSync(process.execPath, [COMANDO, ...a], { encoding: "utf8", cwd: RADICE });
const leggiJson = (f) => JSON.parse(readFileSync(f, "utf8"));
const uscita = (r) => `uscita ${r.status} ${(r.stderr || "").trim().slice(0, 160)}`;

// La revisione della riservatezza come la scrive il workflow: due lenti, ognuna con quanto ha
// riletto e l'impronta dei suoi materiali.
const materiali = (dir) => leggiJson(path.join(dir, "da-controllare-riservato.json"));
const revisione = (dir, nome, { lenti = ["istruzioni", "nomi"], da_oscurare = [], giudicati_pubblici = [], controllati = 3, improntaData, perse = [] } = {}) => {
  const imp = improntaData ?? materiali(dir).impronta;
  return scriviJournal(dir, nome, [
    ...lenti.map((l, i) => ({ label: `riservato:${l}`, result: { da_oscurare: i === 0 ? da_oscurare : [], giudicati_pubblici: i === 0 ? giudicati_pubblici : [], controllati, impronta: imp, note: "" } })),
    ...perse.map((l) => ({ label: `riservato:${l}` })),
  ]);
};
// Una seconda lente A sul difetto 0, rilanciata in un altro giro.
const LENTE_ALTRA = { label: "lente-A:soldi", result: { verdetti: [{ idx: 0, verdetto: "da_correggere", ancora_vero_corretto: "si", motivo: "manca un caso", correzioni_ricetta: "aggiungi il caso", prova_corretta: "" }] } };
// La rilettura giusta del banco: il campo che nomina la funzione della falla si oscura.
const OSCURA_0 = [{ idx: 0, campi: ["ricetta.raggio"], perche: "nomina la funzione della falla" }];

try {
  // ── preparazione: fascicoli e territori ─────────────────────────────────────────────────────
  const LAVORO = nuova("lavoro");
  const rp = esegui("prepara", "--cartella", LAVORO);
  const terr = existsSync(path.join(LAVORO, "territori.json")) ? leggiJson(path.join(LAVORO, "territori.json")) : {};
  const fascicolo3 = existsSync(path.join(LAVORO, "difetti/3.json")) ? leggiJson(path.join(LAVORO, "difetti/3.json")) : {};
  dico(rp.status === 0 && fascicolo3._chiave === chiaveProblema(problemi[3]) && !existsSync(path.join(LAVORO, "difetti/6.json")), "«prepara» scrive un fascicolo per ogni aperto, con la sua chiave", uscita(rp));
  const nelPubblico = [...(terr.seri || []), ...(terr.minori || [])].flatMap((t) => t.indici);
  dico(!nelPubblico.includes(4) && (terr.privati || []).some((p) => p.idx === 4), "① la falla riservata sta fra i privati, mai fra seri e minori");
  dico(new Set([...(terr.seri || []), ...(terr.minori || [])].map((t) => t.territorio)).size === (terr.seri || []).length + (terr.minori || []).length, "①bis seri e minori non hanno territori con lo stesso nome");
  const ritoccata = territoriDaPreparare([{ ...PRIVATA, titolo: "R1 · falla di sicurezza da chiudere", _idx: 9 }]);
  dico(ritoccata.privati.length === 1 && !ritoccata.seri.length && !ritoccata.minori.length, "① una scheda riservata col titolo ritoccato resta riservata (file e fonte la segnano)");
  dico(territoriDaPreparare([{ ...problemi[0], _idx: 0 }]).seri.length === 1, "① un difetto pubblico con la fonte «id R5» resta pubblico: quel numero lo ha ogni difetto");
  const REG_RITOCCATO = path.join(nuova("ritoccato"), "registro.json");
  writeFileSync(REG_RITOCCATO, JSON.stringify({ problemi: problemi.map((p, i) => (i === 4 ? { ...p, titolo: "R1 · falla di sicurezza da chiudere" } : p)) }));
  const rr0 = esegui("prepara", "--cartella", nuova("prepara-ritoccato"), "--registro", REG_RITOCCATO);
  dico(rr0.status === 2 && /segni/.test(rr0.stderr), "① segni discordi su una scheda riservata fermano «prepara»", uscita(rr0));

  // in più: un risultato orfano (nessuna etichetta da nessuna parte) e un revisore partito e mai tornato
  const LENTI_ALTRA = scriviJournal(LAVORO, "lente-altra.jsonl", [LENTE_ALTRA]);
  const FILE_JOURNAL = scriviJournal(LAVORO, "journal.jsonl", [...journal, { label: "lente-B:ux" }], [JSON.stringify({ type: "result", key: "orfano", agentId: "orfano", result: { ricette: [{ idx: 5, ancora_vero: "no" }] } })]);

  // ── ① senza la riservatezza non si pubblica ─────────────────────────────────────────────────
  const r0 = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, "--scrivi");
  dico(r0.status === 2 && pubblici().length === 0 && !existsSync(path.join(LAVORO, "ricettario-completo.json")), "① --scrivi senza --riservato esce 2 e non scrive niente, né pubblico né completo", uscita(r0));
  dico(/--scrivi vuole --riservato/.test(r0.stderr), "① e dice perché: manca il passaggio della riservatezza");
  const rN = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, "--scrivi", "--riservato", "nessuno");
  dico(rN.status === 2 && pubblici().length === 0, "① «--riservato nessuno» con una falla aperta esce 2", uscita(rN));

  // ── la raccolta senza pubblicare ────────────────────────────────────────────────────────────
  const r = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL);
  dico(r.status === 0, "raccogli senza --scrivi esce 0 e scrive solo il ricettario completo", uscita(r));
  const comp = leggiJson(path.join(LAVORO, "ricettario-completo.json"));
  dico(JSON.stringify(comp).includes(SEGRETO) && pubblici().length === 0, "① il riservato sta nel completo, nella cartella fuori dal repo, e niente è pubblico");
  const esito = Object.fromEntries(comp.difetti.map((d) => [d.idx, d.esito ?? (d.riservato ? "riservato" : "")]));
  dico(esito[0] === "da_riparare", "② il difetto confermato dalla lente resta da riparare", `esito ${esito[0]}`);
  dico(esito[1] === "da_rivedere", "② «già risolto» smentito dalla lente A va rivisto, non chiuso né mandato a una squadra con una ricetta vuota", `esito ${esito[1]}`);
  dico(esito[2] === "gia_risolto", "② «già risolto» confermato dal revisore esce", `esito ${esito[2]}`);
  dico(esito[3] === "da_rivedere", "② «già risolto» smentito dal revisore dei minori va rivisto", `esito ${esito[3]}`);
  dico(esito[4] === "riservato" && !JSON.stringify(comp.difetti.find((d) => d.idx === 4)).includes(SEGRETO), "② la falla riservata compare fra i difetti solo col titolo pubblico", `esito ${esito[4]}`);
  dico(esito[5] === "senza_ricetta", "⑤ un difetto senza ricetta ha l'esito «senza_ricetta» — e il risultato senza etichetta non gliene inventa una", `esito ${esito[5]}`);
  dico(/1 risultati senza etichetta/.test(r.stdout), "⑤ il risultato senza etichetta è contato e detto, non ingoiato");
  dico(/1 revisori partiti e mai tornati: lente-B:ux/.test(r.stdout) && comp.sintesi.revisori_partiti_e_mai_tornati === 1, "⑤ il revisore partito e mai tornato è detto per nome e contato");
  dico(comp.difetti.length === 6 && !("6" in esito), "⑤ tutti e 6 gli aperti hanno un esito, il chiuso no", `voci ${comp.difetti.length}`);
  dico(comp.territori.find((t) => t.territorio === "soldi")?.interazioni_fra_territori?.includes("contanti"), "le interazioni fra territori della lente B restano nel ricettario");

  // ── il comando «riservato»: i materiali dei revisori ────────────────────────────────────────
  const rr = esegui("riservato", "--cartella", LAVORO);
  const mat = existsSync(path.join(LAVORO, "da-controllare-riservato.json")) ? materiali(LAVORO) : {};
  const percorsi = (mat.da_giudicare || []).map((x) => x.percorso);
  dico(rr.status === 0 && percorsi.includes("difetto 0.ricetta.raggio") && !percorsi.some((p) => p.startsWith("difetto 2")), "① «riservato» mette fra i campi da giudicare quello che nomina la funzione della falla, e solo quello", `${uscita(rr)} · ${percorsi.join(",")}`);
  dico(typeof mat.impronta === "string" && mat.impronta === impronta(comp), "① i materiali portano l'impronta del testo riletto");
  const privatoElenco = existsSync(path.join(LAVORO, "PRIVATO-elenco.json")) ? readFileSync(path.join(LAVORO, "PRIVATO-elenco.json"), "utf8") : "";
  dico(privatoElenco.includes(SEGRETO) && privatoElenco.includes("segreta-della-chat"), "① l'elenco per i revisori porta anche le falle mancate dai verificatori");
  const comuni = candidatiRiservati({ privata: [{ result: { falle: [{ dove: "order_id lib/a.ts" }] } }], difetti: Array.from({ length: 12 }, (_, i) => ({ idx: i, ricetta: { raggio: "usa order_id in lib/a.ts" } })), territori: [] });
  dico(comuni.difetti.length === 0, "① un nome comune a tanti difetti (order_id) non va fra i nomi rari", `segnalati ${comuni.difetti.length}`);

  // ── ① la revisione deve essere completa e fatta su QUESTO testo ─────────────────────────────
  for (const [opzioni, cosa] of [
    [{ lenti: ["istruzioni"] }, "una lente sola tornata"],
    [{ lenti: ["istruzioni"], perse: ["nomi"] }, "una lente partita e mai tornata"],
    [{ controllati: 0 }, "revisori che dicono di aver riletto zero campi"],
    [{ improntaData: "0".repeat(64) }, "una revisione fatta su un altro testo"],
    [{ da_oscurare: [] }, "un campo segnalato che nessuno ha giudicato"],
  ]) {
    const j = revisione(LAVORO, `rev-${cosa.replace(/\W/g, "")}.jsonl`, { da_oscurare: OSCURA_0, ...opzioni });
    svuotaAudit();
    const rx = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, "--scrivi", "--riservato", j);
    const motivoGiusto = (!opzioni.perse || /mai tornati: riservato:nomi/.test(rx.stderr)) && (opzioni.controllati !== 0 || /zero campi/.test(rx.stderr));
    dico(rx.status === 2 && pubblici().length === 0 && motivoGiusto, `① ${cosa}: esce 2 e non pubblica, e dice perché`, uscita(rx));
  }
  const J_BUONA = revisione(LAVORO, "rev-buona.jsonl", { da_oscurare: OSCURA_0 });
  svuotaAudit();
  const r1 = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, "--scrivi", "--riservato", J_BUONA);
  dico(r1.status === 0 && pubblici().length === 1, "① con la revisione completa si pubblica", uscita(r1));
  const pub1 = pubblici().length ? readFileSync(path.join(AUDIT, pubblici()[0]), "utf8") : "";
  dico(pub1.length > 0 && !pub1.includes(SEGRETO) && !pub1.includes("annullare un ordine già pagato") && !pub1.includes(NOME) && !pub1.includes("segreta-della-chat"), "① nel ricettario pubblico non c'è niente della corsia riservata");
  const voce0 = JSON.parse(pub1 || "{}").difetti?.find((x) => x.idx === 0);
  dico(voce0?.ricetta?.raggio === OSCURATO && voce0?.ricetta?.ricetta === "r", "①bis il campo segnato esce oscurato, gli altri restano");
  dico(leggiJson(path.join(LAVORO, "ricettario-completo.json")).difetti.find((x) => x.idx === 0).ricetta.raggio.includes(NOME), "①bis il ricettario completo, fuori dal repo, resta intero");

  // ── ① la memoria delle oscurature: il ricettario pubblico di prima resta in AUDIT ──────────
  // Il 24/10 tre campi erano stati oscurati a mano, oltre a quelli dei revisori: un secondo giro di
  // riservatezza non li rivedeva, e con i passi naturali tornavano in chiaro.
  const A_MANO = path.join(LAVORO, "a-mano.json");
  writeFileSync(A_MANO, JSON.stringify([{ idx: 1, campi: ["ricetta.raggio"], perche: "oscurato a mano dopo la rilettura" }]));
  svuotaAudit();
  const rm0 = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, "--scrivi", "--riservato", J_BUONA, "--riservato", A_MANO);
  dico(rm0.status === 0 && ultimoPubblico()?.difetti.find((x) => x.idx === 1)?.ricetta?.raggio === OSCURATO, "① l'elenco a mano si unisce alla revisione: --riservato si ripete", uscita(rm0));
  const rm = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, "--scrivi", "--riservato", J_BUONA);
  dico(rm.status === 0 && /1 campi oscurati in un ricettario pubblico di prima restano oscurati/.test(rm.stdout) && ultimoPubblico()?.difetti.find((x) => x.idx === 1)?.ricetta?.raggio === OSCURATO, "① una seconda pubblicazione senza l'elenco di prima non rimette in chiaro il campo: lo rioscura da sola, e lo dice", uscita(rm));
  esegui("riservato", "--cartella", LAVORO);
  dico((materiali(LAVORO).oscurati_prima || []).includes("difetto 1.ricetta.raggio"), "① i materiali dei revisori dicono quali campi erano oscurati prima");
  // un ricettario pubblico più vecchio ancora, con un altro campo oscurato: valgono tutti, non solo l'ultimo
  // e lo tiene in una sottocartella: la memoria non deve dipendere da dove oggi li scrive «raccogli»
  mkdirSync(path.join(AUDIT, "archivio"), { recursive: true });
  writeFileSync(path.join(AUDIT, "archivio", "2026-01-01-0000-ricettario-sito.json"), JSON.stringify({ difetti: [{ idx: 3, chiave: chiaveProblema(problemi[3]), ricetta: { evidenza: OSCURATO } }], territori: [] }));
  const rpiu = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, "--scrivi", "--riservato", J_BUONA);
  dico(rpiu.status === 0 && ultimoPubblico()?.difetti.find((x) => x.idx === 3)?.ricetta?.evidenza === OSCURATO && ultimoPubblico()?.difetti.find((x) => x.idx === 1)?.ricetta?.raggio === OSCURATO, "① la memoria legge tutti i ricettari pubblici di prima, non solo l'ultimo, anche dentro una sottocartella", uscita(rpiu));
  writeFileSync(path.join(AUDIT, "zz-rotto-ricettario-sito.json"), "{ rotto");
  const rrotto = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, "--scrivi", "--riservato", J_BUONA);
  dico(rrotto.status === 2, "① un ricettario pubblico di prima illeggibile ferma: senza, non so cosa era oscurato", uscita(rrotto));
  rmSync(path.join(AUDIT, "zz-rotto-ricettario-sito.json"));
  // un elenco del mattino nomina un difetto che il registro ha chiuso nel frattempo
  writeFileSync(A_MANO, JSON.stringify([{ idx: 6, campi: ["ricetta.raggio"], perche: "difetto chiuso dopo la rilettura" }]));
  const rdec = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, "--scrivi", "--riservato", J_BUONA, "--riservato", A_MANO);
  dico(rdec.status === 0 && /1 voci degli elenchi parlano di difetti che il registro ha chiuso/.test(rdec.stdout), "① una voce su un difetto chiuso nel frattempo non ferma la ripubblicazione: si conta e si dice", uscita(rdec));
  writeFileSync(A_MANO, JSON.stringify([{ idx: 99, campi: ["ricetta.raggio"], perche: "un idx che non esiste" }]));
  dico(esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, "--scrivi", "--riservato", J_BUONA, "--riservato", A_MANO).status === 2, "① una voce su un difetto che non c'è mai stato resta un bersaglio mancato: esce 2");
  const J_GIUDICA = revisione(LAVORO, "rev-giudica.jsonl", { da_oscurare: OSCURA_0, giudicati_pubblici: [{ idx: 1, campi: ["ricetta.raggio"], perche: "riletto: non dice niente della falla" }] });
  const rm2 = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, "--scrivi", "--riservato", J_GIUDICA);
  dico(rm2.status === 0 && ultimoPubblico()?.difetti.find((x) => x.idx === 1)?.ricetta?.raggio === "r", "① un giudizio «già pubblico» scritto dal revisore lo rimette in chiaro, apposta", uscita(rm2));

  // ── ① la corsia riservata non si spegne per omissione ──────────────────────────────────────
  const soloPubblici = journal.filter((v) => !String(v.label || "").startsWith("privata"));
  const J_PUBBLICI = scriviJournal(LAVORO, "pubblici.jsonl", soloPubblici);
  svuotaAudit();
  const rp1 = esegui("raccogli", "--cartella", LAVORO, J_PUBBLICI, "--scrivi", "--riservato", J_BUONA);
  dico(rp1.status === 0 && /ripresi dal ricettario completo/.test(rp1.stdout), "① senza il journal della corsia riservata, la corsia si riprende dalla cartella e i controlli girano", uscita(rp1));
  dico(JSON.stringify(leggiJson(path.join(LAVORO, "ricettario-completo.json")).privata).includes(SEGRETO), "① e il ricettario completo non perde la corsia");
  const VUOTA = nuova("senza-corsia");
  esegui("prepara", "--cartella", VUOTA);
  svuotaAudit();
  const rp2 = esegui("raccogli", "--cartella", VUOTA, J_PUBBLICI, "--scrivi", "--riservato", J_BUONA);
  dico(rp2.status === 2 && pubblici().length === 0 && /non c'è la loro corsia/.test(rp2.stderr), "① senza la corsia, né fra i journal né nella cartella, con falle aperte: esce 2 e dice perché", uscita(rp2));
  const MEZZA = scriviJournal(LAVORO, "mezza.jsonl", [...soloPubblici, journal.find((v) => v.label === "privata:regole")]);
  svuotaAudit();
  const rp3 = esegui("raccogli", "--cartella", LAVORO, MEZZA, "--scrivi", "--riservato", J_BUONA);
  dico(rp3.status === 0 && /manca una parte della corsia riservata/.test(rp3.stdout) && leggiJson(path.join(LAVORO, "ricettario-completo.json")).privata.length === 2, "① con una parte sola della corsia fra i journal, l'altra si riprende dalla cartella e il completo non la perde", uscita(rp3));

  // ── ① l'impronta: un territorio rifatto dopo la rilettura ───────────────────────────────────
  const J_RIFATTO = scriviJournal(LAVORO, "rifatto.jsonl", [{ label: "ricette:qa", result: { territorio: "qa", ricette: [ricetta(5)], cause_comuni: [] } }]);
  svuotaAudit();
  const ri = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, J_RIFATTO, "--scrivi", "--riservato", J_BUONA);
  dico(ri.status === 2 && pubblici().length === 0 && /testo diverso/.test(ri.stderr), "① un territorio rifatto dopo la rilettura cambia l'impronta: esce 2", uscita(ri));
  dico(impronta(comp) === impronta({ ...comp, territori: [...comp.territori].reverse(), difetti: [...comp.difetti].reverse() }), "① l'impronta non dipende dall'ordine dei journal");
  dico(impronta(comp) !== impronta({ ...comp, privata: [...comp.privata, { label: "privata:nuova", result: { falle: [{ titolo: "una falla trovata dopo la rilettura" }] } }] }), "① una falla trovata dopo la rilettura cambia l'impronta: i revisori non l'avevano vista");
  const conAltra = JSON.parse(JSON.stringify(comp));
  conAltra.difetti[0].lente_a_altre = [{ motivo: "una voce in più" }];
  dico(impronta(comp) !== impronta(conAltra), "① anche una voce doppia in più cambia l'impronta");
  const rOrdine1 = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, LENTI_ALTRA);
  const v1 = leggiJson(path.join(LAVORO, "ricettario-completo.json")).difetti.find((x) => x.idx === 0);
  const rOrdine2 = esegui("raccogli", "--cartella", LAVORO, LENTI_ALTRA, FILE_JOURNAL);
  const v2 = leggiJson(path.join(LAVORO, "ricettario-completo.json")).difetti.find((x) => x.idx === 0);
  dico(rOrdine1.status === 0 && rOrdine2.status === 0 && JSON.stringify(v1.lente_a) === JSON.stringify(v2.lente_a) && JSON.stringify(v1.lente_a_altre) === JSON.stringify(v2.lente_a_altre), "① le voci doppie stanno nello stesso posto in qualunque ordine si passino i journal");
  esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL);

  // ── ① le frasi copiate e i nomi solo riservati ─────────────────────────────────────────────
  const COPIA = nuova("copia");
  esegui("prepara", "--cartella", COPIA);
  const J_COPIA = scriviJournal(COPIA, "copia.jsonl", [{ label: "ricette:qa", result: { territorio: "qa", ricette: [ricetta(5, { raggio: `attenzione: ${FRASE}, va chiuso prima` })], cause_comuni: [] } }]);
  esegui("raccogli", "--cartella", COPIA, FILE_JOURNAL, J_COPIA);
  esegui("riservato", "--cartella", COPIA);
  const matC = materiali(COPIA);
  dico((matC.da_giudicare || []).some((x) => x.percorso === "difetto 5.ricetta.raggio" && /frase lunga/.test(x.perche_segnalato)), "① «riservato» manda ai revisori il campo con la frase in comune");
  svuotaAudit();
  const r7 = esegui("raccogli", "--cartella", COPIA, FILE_JOURNAL, J_COPIA, "--scrivi", "--riservato", revisione(COPIA, "r7.jsonl", { da_oscurare: OSCURA_0 }));
  dico(r7.status === 2 && pubblici().length === 0, "① una frase della falla ricopiata in una ricetta pubblica, non giudicata, esce 2", uscita(r7));
  dico(/difetto 5\.ricetta\.raggio/.test(r7.stderr) && !r7.stderr.includes("annullare un ordine"), "① e dice DOVE sta la copia senza ripetere la frase");
  const r8 = esegui("raccogli", "--cartella", COPIA, FILE_JOURNAL, J_COPIA, "--scrivi", "--riservato", revisione(COPIA, "r8.jsonl", { da_oscurare: [...OSCURA_0, { idx: 5, campi: ["ricetta.raggio"], perche: "frase della falla" }] }));
  dico(r8.status === 0, "① oscurata la copia, si pubblica", uscita(r8));
  svuotaAudit();
  const r11 = esegui("raccogli", "--cartella", COPIA, FILE_JOURNAL, J_COPIA, "--scrivi", "--riservato", revisione(COPIA, "r11.jsonl", { da_oscurare: OSCURA_0, giudicati_pubblici: [{ idx: 5, campi: ["ricetta.raggio"], perche: "il difetto pubblico lo dice già" }] }));
  const voce5 = ultimoPubblico()?.difetti.find((x) => x.idx === 5);
  dico(r11.status === 0 && voce5?.ricetta?.raggio?.includes("attenzione") && /1 giudicati pubblici/.test(r11.stdout), "① una frase giudicata già pubblica dal revisore si pubblica intera, e il giudizio è detto", uscita(r11));
  svuotaAudit();
  const vecchia = revisione(COPIA, "vecchia.jsonl", { improntaData: "1".repeat(64), giudicati_pubblici: [{ idx: 5, campi: ["ricetta.raggio"], perche: "giudicato su un altro testo" }] });
  const rvec = esegui("raccogli", "--cartella", COPIA, FILE_JOURNAL, J_COPIA, "--scrivi", "--riservato", revisione(COPIA, "nuova.jsonl", { da_oscurare: OSCURA_0 }), "--riservato", vecchia);
  dico(rvec.status === 2 && pubblici().length === 0 && /ignorati/.test(rvec.stdout), "① un «già pubblico» di una rilettura fatta su un altro testo non zittisce gli allarmi di oggi", uscita(rvec));
  writeFileSync(path.join(COPIA, "a-mano.json"), JSON.stringify([{ idx: 5, campi: ["ricetta.raggio"], pubblico: true, perche: "scritto a mano" }]));
  const rman = esegui("raccogli", "--cartella", COPIA, FILE_JOURNAL, J_COPIA, "--scrivi", "--riservato", revisione(COPIA, "nuova2.jsonl", { da_oscurare: OSCURA_0 }), "--riservato", path.join(COPIA, "a-mano.json"));
  dico(rman.status === 2 && pubblici().length === 0, "① un «già pubblico» scritto in un elenco senza impronta non apre niente", uscita(rman));
  svuotaAudit();
  const r12 = esegui("raccogli", "--cartella", COPIA, FILE_JOURNAL, J_COPIA, "--scrivi", "--riservato", revisione(COPIA, "r12.jsonl", { da_oscurare: OSCURA_0, giudicati_pubblici: [{ idx: 5, campi: ["ricetta.non_esiste"], perche: "x" }] }));
  dico(r12.status === 2 && pubblici().length === 0, "① un giudizio su un campo che non c'è non vale: esce 2", uscita(r12));
  svuotaAudit();
  const r13 = esegui("raccogli", "--cartella", COPIA, FILE_JOURNAL, J_COPIA, "--scrivi", "--riservato", revisione(COPIA, "r13.jsonl", { da_oscurare: OSCURA_0, giudicati_pubblici: [{ idx: 5, campi: ["ricetta.ricetta"], perche: "un altro campo" }] }));
  dico(r13.status === 2 && pubblici().length === 0, "① un giudizio su un ALTRO campo non copre la copia: esce 2", uscita(r13));
  dico(frasiCopiate({ difetti: [{ idx: 1, ricetta: { raggio: FRASE } }] }, [FRASE], [`nel registro pubblico: ${FRASE}.`]).length === 0, "① una frase che è già in un testo pubblico non conta come copia");
  dico(frasiCopiate({ difetti: [{ idx: 1, ricetta: { raggio: "Chiunque abbia un account può CHIAMARE la funzione vecchia e annullare" } }] }, [FRASE]).length === 1, "① la copia si riconosce anche con maiuscole e punteggiatura diverse");
  dico(frasiCopiate({ difetti: [{ idx: 1, ricetta: { raggio: "un account può chiamare la funzione" } }] }, [FRASE]).length === 0, "① sei parole in comune non sono una copia");
  dico(frasiCopiate({ difetti: [{ idx: 1, lente_b: { nascite_previste: FRASE }, lente_a_altre: [{ motivo: FRASE }] }], territori: [{ territorio: "t", modo: "seri", conflitti: FRASE }] }, [FRASE]).join() === "difetto 1.lente_b.nascite_previste,difetto 1.lente_a_altre.0.motivo,territorio seri:t.conflitti", "① la copia si cerca in tutte le voci, anche doppie, e nei territori");
  dico(campiConNomi({ difetti: [{ idx: 3, chiuso: { motivo: `vedi ${NOME}` } }] }, [NOME]).join() === "difetto 3.chiuso.motivo", "① un nome che sta solo nelle falle si trova anche nella verifica dei chiusi");
  const tutta = testiDellaCorsiaRiservata([{ result: { falle: [{ dove: "uno uno" }], verdetti: [{ motivo: "due due" }], mancate: "tre tre", note: "quattro quattro" } }]);
  dico(["uno uno", "due due", "tre tre", "quattro quattro"].every((t) => tutta.includes(t)), "① la rete confronta tutta la corsia riservata: falle, verifiche, falle mancate e note");
  dico(JSON.stringify(oscuratiPrima([{ difetti: [], territori: [{ territorio: "t", modo: "seri", cause_comuni: OSCURATO }] }])) === JSON.stringify([{ territorio: "t", modo: "seri", campo: "cause_comuni" }]), "① la memoria delle oscurature tiene anche i campi dei territori");
  dico(tornatiInChiaro({ difetti: [{ idx: 7, chiave: "k", ricetta: { raggio: "in chiaro" } }] }, [{ chiave: "k", campo: "ricetta.raggio" }], ["difetto 7.ricetta"]).length === 1, "① un «già pubblico» sul campo che contiene non riapre quello oscurato dentro");
  dico(nonGiudicate(["territorio seri:soldi.cause_comuni.0.perche", "difetto 3.ricetta.raggio"], ["territorio seri:soldi.cause_comuni", "difetto 3.ricetta.raggio"]).join() === "territorio seri:soldi.cause_comuni.0.perche", "① un giudizio «già pubblico» vale per il percorso esatto, non per quello che c'è dentro");

  // ── ① una ricetta pubblica su una falla riservata ───────────────────────────────────────────
  const INTRUSO = nuova("intruso");
  esegui("prepara", "--cartella", INTRUSO);
  const J_INTRUSO = scriviJournal(INTRUSO, "intruso.jsonl", [{ label: "ricette:intruso", result: { territorio: "intruso", ricette: [ricetta(0), ricetta(4, { raggio: SEGRETO })], cause_comuni: [] } }]);
  const r9 = esegui("raccogli", "--cartella", INTRUSO, J_INTRUSO);
  dico(r9.status === 2 && !existsSync(path.join(INTRUSO, "ricettario-completo.json")), "① una ricetta pubblica su una falla riservata esce 2 prima di scrivere", uscita(r9));
  dico(/intruso/.test(r9.stderr) && !r9.stderr.includes(SEGRETO), "① e nomina solo il territorio, non il testo");

  // ── ①bis l'elenco del riservato scritto male ────────────────────────────────────────────────
  const ELENCO = path.join(LAVORO, "riservato.json");
  for (const [elenco, cosa] of [
    [[{ idx: 1, campi: ["ricetta.non_esiste"] }], "un campo che non c'è"],
    [[{ idx: 1, campo: "ricetta.raggio" }], "«campo» al singolare"],
    [[{ idx: 1, campi: [] }], "«campi» vuoto"],
    [[{ idx: 1, territorio: "soldi", campi: ["cause_comuni"] }], "idx e territorio insieme"],
    [{ idx: 1, campi: ["ricetta.raggio"] }, "una voce sola invece di una lista"],
  ]) {
    writeFileSync(ELENCO, JSON.stringify(elenco));
    svuotaAudit();
    const rx = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, "--scrivi", "--riservato", J_BUONA, "--riservato", ELENCO);
    dico(rx.status === 2 && pubblici().length === 0, `①bis ${cosa} nell'elenco esce 2 e non scrive niente di pubblico`, uscita(rx));
  }
  writeFileSync(ELENCO, "{ non è json");
  const rj = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, "--scrivi", "--riservato", J_BUONA, "--riservato", ELENCO);
  dico(rj.status === 2 && !rj.stderr.includes("non è json"), "①bis un elenco illeggibile esce 2 senza ripeterne il contenuto", uscita(rj));
  const J_ALTRO = scriviJournal(LAVORO, "altro.jsonl", [{ label: "lente-A:soldi", result: { verdetti: [] } }]);
  const r6 = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, "--scrivi", "--riservato", J_BUONA, "--riservato", J_ALTRO);
  dico(r6.status === 2, "①bis un journal che non porta i revisori della riservatezza non vale come elenco, anche accanto a uno buono", uscita(r6));
  dico(oscura({ difetti: [] }, [{ idx: 99, campi: ["ricetta.x"] }]).mancati.length === 1, "①bis un difetto che non c'è è un mancato, non un successo");
  const omonimi = { territori: [{ territorio: "ux", modo: "seri", cause_comuni: "a" }, { territorio: "ux", modo: "minori", cause_comuni: "b" }] };
  dico(oscura(omonimi, [{ territorio: "ux", campi: ["cause_comuni"] }]).ricettario.territori.every((t) => t.cause_comuni === OSCURATO), "①bis un territorio col nome ripetuto si oscura in tutte e due le copie");
  dico(oscura(omonimi, [{ territorio: "ux", campi: ["cause_comuni"], pubblico: true }]).mancati.length === 1, "①bis ma un giudizio «già pubblico» senza il «modo» su un nome ripetuto è un mancato");
  const soloMinori = oscura(omonimi, [{ territorio: "ux", modo: "minori", campi: ["cause_comuni"] }]);
  dico(soloMinori.ricettario.territori[0].cause_comuni === "a" && soloMinori.ricettario.territori[1].cause_comuni === OSCURATO, "①bis col «modo» si oscura solo la copia indicata");
  dico(oscura({ difetti: [{ idx: 1, ricetta: { raggio: "r" } }] }, elencoRiservato(JSON.stringify([{ idx: 1, territorio: "soldi", campi: ["ricetta.raggio"] }]))).mancati.length === 1, "①bis due bersagli scritti davvero restano un errore");
  dico(elencoRiservato(JSON.stringify([{ da_oscurare: [{ idx: 2, territorio: "", campi: ["y"] }] }]))[0].territorio === undefined, "①bis un campo lasciato vuoto dal revisore è un campo non scritto");
  const conteso = oscura({ difetti: [{ idx: 1, ricetta: { raggio: "r" } }] }, [{ idx: 1, campi: ["ricetta.raggio"], pubblico: true }, { idx: 1, campi: ["ricetta.raggio"] }]);
  dico(conteso.ricettario.difetti[0].ricetta.raggio === OSCURATO && conteso.contesi.length === 1, "① se un revisore oscura e l'altro dice «già pubblico», vince l'oscuratura e il disaccordo si conta");
  dico(tornatiInChiaro({ difetti: [{ idx: 7, chiave: "k", ricetta: { raggio: "in chiaro" } }] }, [{ chiave: "k", campo: "ricetta.raggio" }], []).join() === "difetto 7.ricetta.raggio", "① un campo oscurato prima, per chiave del difetto, è segnato se torna in chiaro");
  dico(tornatiInChiaro({ difetti: [{ idx: 7, chiave: "k", lente_a: { motivo: "a" }, lente_a_altre: [{ motivo: "b" }] }] }, [{ chiave: "k", campo: "lente_a_altre.0.motivo" }], []).sort().join() === "difetto 7.lente_a.motivo,difetto 7.lente_a_altre.0.motivo", "① la memoria su una voce doppia guarda tutte le voci di quel tipo, in qualunque posto siano oggi");
  dico(tornatiInChiaro({ territori: [{ territorio: "soldi", modo: "seri", cause_comuni: [{ nome: "x" }] }] }, [{ territorio: "soldi", modo: "seri", campo: "cause_comuni" }], []).join() === "territorio seri:soldi.cause_comuni", "① un campo oscurato per intero che oggi è una lista torna fra quelli da rioscurare");
  dico(tornatiInChiaro({ territori: [{ territorio: "minori-ux", modo: "minori", descrizione: "in chiaro" }] }, [{ territorio: "ux", modo: "minori", campo: "descrizione" }], []).join() === "territorio minori:minori-ux.descrizione", "① la memoria ritrova un territorio dei minori anche col prefisso nuovo «minori-»");
  dico(oscura({ difetti: [] }, [{ idx: 6, campi: ["x"] }], { decaduta: (i) => i === 6 }).decadute.join() === "6" && oscura({ difetti: [] }, [{ idx: 6, campi: ["x"] }], { decaduta: (i) => i === 6 }).mancati.length === 0, "① una voce su un difetto chiuso è decaduta, non mancata");
  dico(oscura({ difetti: [{ idx: 1, ricetta: { raggio: "r" } }] }, [{ idx: 1, campi: ["ricetta.raggio"], pubblico: true }, { idx: 1, campi: ["ricetta.raggio"], pubblico: true }]).lasciati.length === 1, "① due lenti che giudicano lo stesso campo contano un campo solo");

  // ── ② due voci, e l'ordine dei journal non decide ───────────────────────────────────────────
  dico(verdettoFinale({ ricetta: { ancora_vero: "no" } }) === "da_rivedere", "② la ricetta da sola che dice «già chiuso» non chiude: va rivista");
  dico(verdettoFinale({ ricetta: { ancora_vero: "no" }, lenteA: { verdetto: "gia_chiuso_confermato", ancora_vero_corretto: "no" } }) === "gia_risolto", "② ricetta e lente A d'accordo sul «già chiuso»: esce");
  dico(verdettoFinale({ ricetta: { ancora_vero: "no" }, lenteA: { verdetto: "gia_chiuso_confermato", ancora_vero_corretto: "si" } }) === "da_rivedere", "② una lente che dice «già chiuso» e «c'è ancora» insieme non chiude");
  dico(verdettoFinale({ ricetta: { ancora_vero: "si" }, lenteA: { verdetto: "gia_chiuso_confermato", ancora_vero_corretto: "no" } }) === "da_rivedere", "② la lente dice «già chiuso», la ricetta «ancora vero»: da rivedere");
  dico(verdettoFinale({ ricetta: { ancora_vero: "si" }, lenteA: { verdetto: "non_reale", ancora_vero_corretto: "no" } }) === "da_rivedere", "② un difetto che la lente dice non reale va rivisto");
  dico(verdettoFinale({ ricetta: { ancora_vero: "no" }, chiuso: { gia_chiuso_confermato: "true" } }) === "da_rivedere", "② un «true» scritto come testo non vale come conferma");
  const chiusura = { ricette: [{ ancora_vero: "no" }], lentiA: [{ verdetto: "gia_chiuso_confermato", ancora_vero_corretto: "no" }] };
  const smentita = { verdetto: "da_correggere", ancora_vero_corretto: "si" };
  dico(verdettoDelleVoci({ ...chiusura, lentiA: [...chiusura.lentiA, smentita] }).esito === "da_rivedere" && verdettoDelleVoci({ ...chiusura, lentiA: [smentita, ...chiusura.lentiA] }).esito === "da_rivedere", "② una seconda lente che smentisce la chiusura la manda da rivedere, in qualunque ordine");
  dico(verdettoDelleVoci({ ricette: [{ ancora_vero: "si" }], lentiA: [{ verdetto: "confermata", ancora_vero_corretto: "si" }, smentita] }).esito === "da_riparare", "② due lenti che danno lo stesso esito non fermano il difetto");
  const LENTI2 = scriviJournal(LAVORO, "lenti2.jsonl", [{ label: "lente-A:soldi", result: { verdetti: [{ idx: 0, verdetto: "da_correggere", ancora_vero_corretto: "si", motivo: "manca un caso", correzioni_ricetta: "aggiungi il caso", prova_corretta: "" }] } }]);
  const rd = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, LENTI2);
  const d0 = leggiJson(path.join(LAVORO, "ricettario-completo.json")).difetti.find((x) => x.idx === 0);
  dico(rd.status === 0 && d0.lente_a_altre?.length === 1 && /voci doppie/.test(rd.stdout), "② la seconda lente sullo stesso difetto resta nel ricettario e si conta, non sovrascrive", uscita(rd));
  const rd2 = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, FILE_JOURNAL);
  dico(rd2.status === 0 && !/voci doppie/.test(rd2.stdout), "② lo stesso journal passato due volte non fa voci doppie", uscita(rd2));
  const RILANCIO = scriviJournal(LAVORO, "rilancio.jsonl", [{ label: "lente-B:ux", result: { rischi: [], interazioni_fra_territori: "" } }]);
  const rl = esegui("raccogli", "--cartella", LAVORO, FILE_JOURNAL, RILANCIO);
  dico(rl.status === 0 && !/mai tornati/.test(rl.stdout), "⑤ un revisore perso in un giro e tornato in un altro non è un falso allarme", uscita(rl));

  // ── ④ journal di un altro registro, fascicoli mancanti ──────────────────────────────────────
  const ALTRO = nuova("altro-registro");
  esegui("prepara", "--cartella", ALTRO);
  const J_ALTRO_REG = scriviJournal(ALTRO, "vecchio.jsonl", [{ label: "ricette:vecchio", result: { territorio: "vecchio", ricette: [ricetta(40), ricetta(41)], cause_comuni: [] } }]);
  const r10 = esegui("raccogli", "--cartella", ALTRO, J_ALTRO_REG);
  dico(r10.status === 2 && !existsSync(path.join(ALTRO, "ricettario-completo.json")), "④ un journal di un altro registro esce 2 e non scrive niente", uscita(r10));
  const SOLO_LENTI = scriviJournal(ALTRO, "solo-lenti.jsonl", [{ label: "lente-A:soldi", result: { verdetti: [{ idx: 0, verdetto: "confermata", ancora_vero_corretto: "si", motivo: "", correzioni_ricetta: "", prova_corretta: "" }] } }]);
  const rsl = esegui("raccogli", "--cartella", ALTRO, SOLO_LENTI);
  dico(rsl.status === 2 && /nessun difetto aperto ha una ricetta/.test(rsl.stderr) && !existsSync(path.join(ALTRO, "ricettario-completo.json")), "④ journal con le sole verifiche e nessuna ricetta: esce 2, non un ricettario vuoto", uscita(rsl));
  const SENZA = nuova("senza-fascicoli");
  const rf = esegui("raccogli", "--cartella", SENZA, FILE_JOURNAL);
  dico(rf.status === 2 && /fascicolo/.test(rf.stderr) && !existsSync(path.join(SENZA, "ricettario-completo.json")), "④ senza i fascicoli di «prepara» non si raccoglie: una ricetta potrebbe finire sul difetto accanto", uscita(rf));

  // ── ⑤ il journal letto com'è davvero ────────────────────────────────────────────────────────
  const prima = risultatiDalJournal([
    JSON.stringify({ type: "result", agentId: "x1", result: { ok: 1 } }),
    JSON.stringify({ type: "started", agentId: "x1", label: "ricette:dopo" }),
    JSON.stringify({ type: "started", agentId: "x2", label: "lente-A:perso" }),
    "{riga a metà",
  ].join("\n"));
  dico(prima.length === 1 && prima[0].label === "ricette:dopo", "⑤ un risultato scritto prima della sua riga «started» ritrova l'etichetta");
  dico(prima.persi.join() === "lente-A:perso" && prima.illeggibili === 1, "⑤ il revisore mai tornato e la riga a metà sono contati");

  // ── ③ i pacchetti e le ondate ───────────────────────────────────────────────────────────────
  const d = (idx, file, stima = "M") => ({ idx, severita: "grave", ricetta: { file_toccati: file, stima }, lente_b: null });
  const esiste = (f) => !f.startsWith("nuovo/");
  const piano = pianoDelleOndate([
    d(10, ["lib/a.ts:3", "lib/condiviso.ts"]),
    d(11, ["./lib/a.ts (riga 4, la funzione paga)"]),
    d(12, ["/home/user/mycity/lib/b.ts:9-12", "lib/condiviso.ts"]),
    d(13, ["app/altro.tsx"]),
    d(14, ["tests/unit/nuova-prova.test.ts", "migrations/164_migrazione.sql"]),
    d(15, ["tests/unit/nuova-prova.test.ts", "app/terzo.tsx"]),
    d(16, ["nuovo/idoneita.ts"]),
    d(17, ["nuovo/idoneita.ts", "app/quarto.tsx"]),
  ], { esiste });
  const onda = (i) => piano.ondate.findIndex((w) => w.some((p) => p.difetti.includes(i)));
  const pacco = (i) => piano.ondate.flat().find((p) => p.difetti.includes(i));
  dico(pacco(10) === pacco(11), "③ due ricette sullo stesso file caldo stanno nello stesso pacchetto (anche scritto in tre modi)");
  dico(pacco(12) !== pacco(10) && onda(12) !== onda(10), "③ due pacchetti che condividono un file esistente finiscono in ondate diverse", `ondate ${onda(10)} e ${onda(12)}`);
  dico(!piano.liberi.includes(16) && (pacco(16) === pacco(17) || onda(16) !== onda(17)), "③ due ricette che creano lo stesso file nuovo non vanno a due squadre nella stessa ondata");
  dico(onda(15) === onda(10) || onda(15) === onda(12), "③ una prova nuova in comune non è un conflitto: non apre un'ondata in più", `ondate ${piano.ondate.length}`);
  dico(piano.liberi.includes(14) && piano.liberi_perche["solo prove e migrazioni"] === 1, "③ una ricetta che tocca solo prove e migrazioni è fuori dai pacchetti, contata col suo perché", JSON.stringify(piano.liberi_perche));
  dico(territorio({ file_toccati: ["tests/x.test.ts", "lib/a.ts:1", "lib/a.ts", "lib/b.spec.ts"] }).join() === "lib/a.ts", "③ il territorio toglie le prove e i doppioni");
  dico(territorio({ file_toccati: ["/srv/sito/lib/a.ts:3"] }, () => true, "/srv/sito").join() === "lib/a.ts", "③ il percorso intero si riporta a quello del sito, con la radice data");
  dico(territorio({ file_toccati: OSCURATO }).length === 0, "③ una lista di file oscurata non fa cadere il piano");
  dico(listaFile({ file_toccati: ["lib/a.ts", OSCURATO] }).join() === "lib/a.ts", "③ una voce oscurata dentro la lista dei file non è un file");
  const tuttiPacchi = piano.ondate.flat();
  dico(piano.ore_di_squadra === tuttiPacchi.reduce((s, p) => s + p.ore, 0) + piano.ore_dei_liberi && piano.ore_dei_liberi === 1.5, "③ le ore di squadra contano anche i difetti senza un file", `${piano.ore_di_squadra} · liberi ${piano.ore_dei_liberi}`);
  dico(piano.ore_in_fila === piano.ore_per_ondata.reduce((s, x) => s + x, 0) && piano.ore_per_ondata.every((x, i) => x === Math.max(...piano.ondate[i].map((p) => p.ore))), "③ le ore in fila sono la somma della squadra più lenta di ogni ondata");
  const largo = pianoDelleOndate([d(20, ["app/"]), d(21, ["app/x.tsx"]), d(22, ["components/**/*.tsx"])], { eCartella: (f) => f === "app" || f === "app/" });
  const sola = (i) => largo.ondate.find((w) => w.some((p) => p.difetti.includes(i)));
  dico(sola(20)?.length === 1 && sola(22)?.length === 1 && !largo.liberi.includes(22), "③ una ricetta che cita una cartella o un modello con l'asterisco va da sola in un'ondata, mai fra i liberi");

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
  dico(o1.status === 2 && /Il conto torna: 5 su 5/.test(o1.stdout), "③ un piano con un difetto serio senza ricetta esce 2, dopo aver detto il conto", uscita(o1));
  const o2 = esegui("ondate", "--ricettario", RIC, "--parziale", "--scrivi");
  const scritto = existsSync(path.join(PIANO, "ricettario-ondate.json")) ? leggiJson(path.join(PIANO, "ricettario-ondate.json")) : null;
  dico(o2.status === 0 && scritto?.fuori_dal_piano?.senza_ricetta?.join() === "1" && scritto?.corsie?.nicola?.join() === "4", "③ con --parziale il piano si scrive, e porta chi resta fuori", uscita(o2));
  writeFileSync(RIC, JSON.stringify({ difetti: [...difettiPiano, { idx: 9, severita: "grave", esito: "boh", ricetta: { chi_ripara: "codice", file_toccati: ["lib/q.ts"] } }] }));
  dico(esegui("ondate", "--ricettario", RIC, "--parziale").status === 2, "③ un esito sconosciuto nel ricettario fa uscire 2: il conto non torna");
  writeFileSync(RIC, JSON.stringify({ difetti: [...difettiPiano, { idx: 8, severita: "minore", esito: "da_riparare", ricetta: { chi_ripara: "codice", file_toccati: OSCURATO, stima: "S" } }] }));
  dico(esegui("ondate", "--ricettario", RIC, "--parziale").status === 0, "③ una ricetta con la lista dei file oscurata non fa cadere «ondate»");
  writeFileSync(RIC, JSON.stringify({ difetti: difettiPiano }));
  const REPO_FINTO = nuova("repo-sito");
  writeFileSync(path.join(REPO_FINTO, "package.json"), "{}");
  dico(esegui("ondate", "--ricettario", RIC, "--parziale", "--repo", REPO_FINTO).status === 2, "③ un --repo dove non esiste nessuno dei file citati esce 2: non è la cartella del sito");
  mkdirSync(path.join(REPO_FINTO, "lib"));
  writeFileSync(path.join(REPO_FINTO, "lib/a.ts"), "");
  dico(esegui("ondate", "--ricettario", RIC, "--parziale", "--repo", REPO_FINTO).status === 0, "③ con i file al loro posto lo stesso --repo va");
  dico(esegui("ondate", "--ricettario", RIC, "--parziale", "--repo", PIANO).status === 2, "③ un --repo senza package.json esce 2");

  // ── ⑥ le schede si spostano nel registro fra «prepara» e «raccogli» ─────────────────────────
  // un'altra sessione inserisce una scheda in testa: tutto scala di uno; e la 3 cambia titolo
  const spostati = [{ dimensione: "deploy-sre", titolo: "Scheda nuova in testa", severita: "minore", file: "x.yml", stato: "aperto" }, ...problemi.map((p, i) => (i === 3 ? { ...p, titolo: "Titolo riscritto da una squadra" } : p))];
  const REG2 = path.join(nuova("registro-spostato"), "registro.json");
  writeFileSync(REG2, JSON.stringify({ problemi: spostati }));
  const r4 = esegui("raccogli", "--cartella", LAVORO, "--registro", REG2, FILE_JOURNAL);
  const comp2 = existsSync(path.join(LAVORO, "ricettario-completo.json")) ? leggiJson(path.join(LAVORO, "ricettario-completo.json")) : { difetti: [] };
  const di = (titolo) => comp2.difetti.find((x) => x.titolo === titolo);
  dico(r4.status === 0 && di("Il negozio non viene pagato")?.idx === 2 && di("Il negozio non viene pagato")?.ricetta?.territorio === "soldi" && di("Pagina che dice vuoto quando la lettura cade")?.ricetta?.territorio === "ux", "⑥ una scheda spostata riceve la SUA ricetta, non quella del vicino", uscita(r4));
  dico(!di("Scheda nuova in testa")?.ricetta, "⑥ la scheda nuova arrivata in testa non eredita la ricetta di nessuno");
  dico(/riagganciati per chiave/.test(r4.stdout) && /non ritrovano il loro difetto/.test(r4.stdout), "⑥ lo spostamento e la ricetta senza difetto sono detti, non ingoiati");
  // un fascicolo scritto da un «prepara» vecchio, senza la chiave: la chiave si ricava dal suo contenuto
  const VECCHI = nuova("fascicoli-vecchi");
  mkdirSync(path.join(VECCHI, "difetti"));
  problemi.forEach((p, i) => p.stato === "aperto" && writeFileSync(path.join(VECCHI, "difetti", `${i}.json`), JSON.stringify({ ...p, _idx: i })));
  const r5 = esegui("raccogli", "--cartella", VECCHI, "--registro", REG2, FILE_JOURNAL);
  const comp3 = existsSync(path.join(VECCHI, "ricettario-completo.json")) ? leggiJson(path.join(VECCHI, "ricettario-completo.json")) : { difetti: [] };
  dico(r5.status === 0 && comp3.difetti.find((x) => x.titolo === "Il negozio non viene pagato")?.ricetta?.territorio === "soldi", "⑥ anche coi fascicoli senza chiave la ricetta segue il suo difetto", uscita(r5));

  // ── ④ il verde su zero, e le cartelle dentro un repository ──────────────────────────────────
  const vuoto = path.join(LAVORO, "vuoto.jsonl");
  writeFileSync(vuoto, JSON.stringify({ type: "launched" }) + "\n");
  dico(esegui("raccogli", "--cartella", LAVORO, vuoto).status === 2, "④ un journal senza risultati esce 2, non verde");
  dico(esegui("raccogli", "--cartella", LAVORO).status === 2, "④ raccogli senza journal esce 2");
  dico(esegui("raccogli", "--cartella", LAVORO, path.join(LAVORO, "non-esiste.jsonl")).status === 2, "④ un journal che non esiste esce 2");
  dico(esegui("raccogli", FILE_JOURNAL).status === 2, "④ raccogli senza --cartella esce 2");
  dico(esegui("raccogli", "--cartella", LAVORO, "--cartella", VUOTA, FILE_JOURNAL).status === 2, "④ un argomento ripetuto che non si può ripetere esce 2");
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
    dico(rc.status === 2 && !existsSync(nascerebbe), `④ ${cosa} esce 2 e non nasce nemmeno vuota`, uscita(rc));
  }
  dico(esegui("ondate").status === 2, "④ ondate senza ricettario esce 2");
  dico(esegui("ondate", "--ricettario", path.join(LAVORO, "ricettario-completo.json"), "--parziale").status === 2, "④ ondate rifiuta il ricettario completo, quello con la corsia riservata");
  writeFileSync(path.join(VECCHI, "ricettario-completo.json"), `${SEGRETO} non è json`);
  const rrc = esegui("riservato", "--cartella", VECCHI);
  dico(rrc.status === 2 && !rrc.stderr.includes(SEGRETO.slice(0, 8)), "④ «riservato» su un ricettario completo rovinato esce 2 senza ripeterne nemmeno un pezzo del testo", uscita(rrc));
  dico(esegui("prepara", "--boh").status === 2, "④ un argomento sconosciuto esce 2");
  dico(esegui("ripara").status === 2, "④ un comando sconosciuto esce 2");
} finally {
  for (const d of cartelle) rmSync(d, { recursive: true, force: true });
}
console.log(rossi ? `\n❌ ${rossi} controlli rossi` : "\n✅ pre-diagnosi: tutti i controlli verdi");
process.exit(rossi ? 1 : 0);
