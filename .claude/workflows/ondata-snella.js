// 🌊 ONDATA SNELLA — ripara UN'ondata del sito col metodo snello (CLAUDE.md, paragrafo 🪙).
//
// PERCHE' ESISTE. L'ondata del 28/10 con `ondata-sito.js`: 54 subagenti e 118 milioni di token riletti, 27
// subagenti su 36 nei collaudi (consegne/audit/2026-10-30-metodo-snello.md). Il costo era il controllo:
// uno o due collaudi PER PACCHETTO, ricollaudi, un riesame da quattro revisori, poi una radiografia del
// perimetro e un vaglio fuori dal workflow. Qui le stesse domande si fanno una volta per ondata, e la piu'
// meccanica la fa la macchina:
//   ① ogni squadra lancia `cervello/prova-rimessa.mjs`: la prova deve cadere senza la correzione. Zero agenti.
//      Una squadra che non passa la macchina rifa' UNA volta; poi il pacchetto non regge.
//   ② UN collaudo per tutta l'ondata, non per pacchetto: la lente A (sa diventare rosso? rilancia la prova
//      rimessa e cerca la variante scomoda) e, se l'ondata tocca soldi, dati o permessi, la lente B (nasce
//      rotto? legge il delta). Senza rischio una lente sola porta tutte e due le domande. La lente B vale
//      anche come radiografia del perimetro: restituisce la copertura per dimensione, e l'AD la registra.
//   ③ UN giro di correzione, solo dei pacchetti bocciati o con un grave nato; poi ricollauda SOLO la lente
//      che ha bocciato. Se non basta, il pacchetto non regge e il workflow chiede a Nicola.
//   ④ i difetti vecchi visti strada facendo, e i minori nati, vanno nel registro: non tornano alle squadre.
//   ⑤ tetto di 12 subagenti (args.max_agenti). I posti del collaudo sono tenuti da parte dall'inizio; se
//      squadre + collaudi non ci stanno, il workflow non parte e dice di dividere l'ondata.
// La regola del verdetto (boccia_per: sito, difetto_rimesso, motivo_aperto; «variante» non boccia) e' la
// stessa di `ondata-sito.js` (AR-1027, firmata il 28/10): si boccia per il SITO, non per la prova.
//
// COSA ARRIVA DA FUORI (qui dentro il disco non si legge):
//   args.schede          l'uscita di `node cervello/schede-pacchetto.mjs --piano <piano> --ondata <N> --json`
//   args.repo            la radice della copia del sito (i worktree nascono accanto, in <repo>-ondate/)
//   args.radice_ad       la radice dell'AD, da cui si lanciano prova-sito e prova-rimessa
//   args.base            il commit del sito da cui partono tutte le squadre
//   args.tipo_costruisce chi scrive o muta (default «tech»): squadre, correzioni, lente A
//   args.tipo_controlla  chi solo legge (default «qa»): la lente B
//   args.max_agenti      il tetto (default 12)
// Ricucitura dei rami, `npm run verify` (una volta per ondata), la registrazione della copertura e del
// registro, il conto dei token e la richiesta di unione restano all'AD; l'unione e' di Nicola.

export const meta = {
  name: "ondata-snella",
  description: "Ripara UN'ondata del sito col metodo snello: una squadra per pacchetto con la prova della macchina, un collaudo per tutta l'ondata, un giro di correzione al massimo, tetto 12 subagenti",
  whenToUse: "Dopo schede-pacchetto.mjs --json. args = {schede, repo, radice_ad, base, tipo_costruisce?, tipo_controlla?, max_agenti?}. Ricucitura, npm run verify, registro e richiesta di unione restano all'AD; l'unione e' di Nicola.",
  phases: [
    { title: "Squadre", detail: "una per pacchetto, nel suo worktree; la prova deve cadere senza la correzione" },
    { title: "Collaudo", detail: "uno per ondata; due lenti solo se tocca soldi, dati o permessi" },
    { title: "Correzione", detail: "un giro solo, poi ricollauda la lente che ha bocciato e si ferma" },
  ],
}

// ── gli args ───────────────────────────────────────────────────────────────────────────────────
const A = args || {}
if (A.tipo !== undefined || A.tipo_controllo !== undefined) throw new Error("args.tipo e args.tipo_controllo non esistono: passa args.tipo_costruisce (chi scrive o muta, default tech) e args.tipo_controlla (chi solo legge, default qa)")
const COMANDO_SCHEDE = "node cervello/schede-pacchetto.mjs --piano <piano dei pacchetti> --ondata <N> --json"
let SCHEDE = A.schede
if (typeof SCHEDE === "string") { try { SCHEDE = JSON.parse(SCHEDE) } catch (e) { SCHEDE = null } }
if (!SCHEDE || !Array.isArray(SCHEDE.pacchetti)) throw new Error("mancano le schede in args.schede: lancia " + COMANDO_SCHEDE + " e passa la sua uscita cosi' com'e'")
for (const k of ["repo", "radice_ad", "base"]) if (!A[k]) throw new Error("serve args." + k)

const senzaBarra = (s) => String(s).replace(/\/+$/, "")
const REPO = senzaBarra(A.repo)
const AD = senzaBarra(A.radice_ad)
const BASE = String(A.base)
const ONDATA = SCHEDE.ondata
const MAX = Number(A.max_agenti) > 0 ? Number(A.max_agenti) : 12
const TIPO_COSTRUISCE = A.tipo_costruisce || "tech"
const TIPO_CONTROLLA = A.tipo_controlla || "qa"
const LPF = SCHEDE.lenti_per_file || {}

// Il tempo delle prove: 480 secondi dentro gli attrezzi < «timeout 540» < 600 secondi dello strumento Bash.
const SECONDI = 540
const TEMPO = "nella chiamata dello strumento Bash dichiara timeout: 600000 (senza, lo strumento la ferma a 120 secondi, prima del verdetto)"
const LANCIA_PROVA = "timeout " + SECONDI + " node " + AD + "/cervello/prova-sito.mjs"
const LANCIA_RIMESSA = "timeout " + SECONDI + " node " + AD + "/cervello/prova-rimessa.mjs"
const SOBRIO = (n) => "SOBRIETA' (vincolante): rispondi SOLO con lo schema, niente prosa fuori. Al massimo " + n + " chiamate di strumento. Ogni Bash con \"timeout 120\", tranne le due prove qui sopra. Leggi solo i file che ti servono e a pezzi (grep -n, poi sed -n), mai un file intero sopra 30 KB. Mai npm install, mai npm ci, mai la suite intera, mai git push."

const PAC = SCHEDE.pacchetti.filter((p) => p && Array.isArray(p.difetti) && p.difetti.length)
if (!PAC.length) throw new Error("ondata " + ONDATA + ": nessun pacchetto con difetti aperti. Rilancia " + COMANDO_SCHEDE)
for (const p of PAC) { if (!Array.isArray(p.file)) p.file = []; if (!p.rischio) p.rischio = "nessuno" }
const RISCHIO = PAC.some((p) => p.rischio !== "nessuno")
const LENTI = RISCHIO ? 2 : 1
if (PAC.length + LENTI > MAX) throw new Error("ondata " + ONDATA + ": " + PAC.length + " squadre + " + LENTI + " collaudi superano il tetto di " + MAX + " subagenti. Dividi l'ondata in due (meno pacchetti per ondata), non alzare il tetto.")

// ── il contatore: i posti del collaudo sono tenuti da parte finche' il collaudo non parte ─────────
let usati = 0
let riserva = LENTI
const saltati = []
function chiama(prompt, o, dallaRiserva) {
  const liberi = MAX - usati - (dallaRiserva ? 0 : riserva)
  if (liberi <= 0) { saltati.push(o.label); return Promise.resolve(null) }
  usati++
  if (dallaRiserva && riserva > 0) riserva--
  return agent(prompt, { label: o.label, phase: o.phase, schema: o.schema, agentType: o.tipo }).catch(() => null)
}

// ── i pezzi ────────────────────────────────────────────────────────────────────────────────────
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)
const ramoDi = (p) => "fix/ondata-" + ONDATA + "-" + slug(p.chiave)
const wtDi = (p) => REPO + "-ondate/o" + ONDATA + "-" + slug(p.chiave)
const pesante = (d) => !!d && (d.gravita === "grave" || d.gravita === "bloccante")
const unione = (a, b) => [...new Set([...(a || []), ...(b || [])])]
const relativo = (x, wt) => String(x).replace(wt + "/", "").replace(REPO + "/", "")
const COMANDO = /\b(npx|npm|node|vitest|prova-sito|prova-rimessa)\b/
const CAUSE = ["nessuno", "sito", "difetto_rimesso", "motivo_aperto", "variante"]
const CAUSE_CHE_BOCCIANO = ["sito", "difetto_rimesso", "motivo_aperto"]
const MACCHINA_OK = ["regge", "rosso_strutturale", "rosso_sconosciuto"]

const DIFETTO = { type: "object", required: ["titolo", "gravita", "dove", "nato_dal_lotto"], properties: {
  titolo: { type: "string", maxLength: 140 }, gravita: { type: "string", enum: ["bloccante", "grave", "minore"] },
  dove: { type: "string", maxLength: 200 }, prova: { type: "string", maxLength: 300 }, nato_dal_lotto: { type: "boolean" },
  pacchetto: { type: "string" } } }
const S_FRAMMENTO = { type: "object", required: ["ramo", "commit", "chiusi", "file_toccati", "prove", "prova_uscita", "rimessa"], properties: {
  ramo: { type: "string" }, worktree: { type: "string" }, commit: { type: "string" },
  chiusi: { type: "array", items: { type: "string" } },
  parziali: { type: "array", maxItems: 12, items: { type: "object", properties: { chiave: { type: "string" }, perche: { type: "string", maxLength: 200 } } } },
  file_toccati: { type: "array", items: { type: "string" } }, prove: { type: "array", items: { type: "string" } },
  prova_uscita: { type: "integer" }, prova: { type: "string", maxLength: 200 },
  rimessa: { type: "object", required: ["esito", "uscita", "file"], properties: { esito: { type: "string" }, uscita: { type: "integer" }, file: { type: "array", items: { type: "string" } } } },
  vecchi: { type: "array", maxItems: 8, items: DIFETTO }, nota: { type: "string", maxLength: 300 } } }
const S_COLLAUDO = { type: "object", required: ["pacchetti", "difetti"], properties: {
  pacchetti: { type: "array", items: { type: "object", required: ["chiave", "regge", "boccia_per"], properties: {
    chiave: { type: "string" }, regge: { type: "boolean" }, boccia_per: { type: "string", enum: CAUSE }, perche: { type: "string", maxLength: 300 } } } },
  difetti: { type: "array", maxItems: 12, items: DIFETTO },
  copertura: { type: "array", items: { type: "object", required: ["dimensione", "file", "trovati"], properties: {
    dimensione: { type: "string" }, file: { type: "array", items: { type: "string" } }, trovati: { type: "integer" } } } } } }

function schede(p) {
  return p.difetti.map((d) => "- " + d.chiave + " (" + d.gravita + ")" + ((d.file || d.dove || d.descrizione) ? ": " + [d.file || d.dove, d.descrizione].filter(Boolean).map((x) => String(x).slice(0, 240)).join(" — ") : "")).join("\n")
}
const normalizza = (f, p) => (f ? { ...f, worktree: f.worktree || wtDi(p), file_toccati: unione([], (f.file_toccati || []).map((x) => relativo(x, f.worktree || wtDi(p)))), prove: unione([], (f.prove || []).map((x) => relativo(x, f.worktree || wtDi(p)))) } : f)
const soloSito = (f) => (f.file_toccati || []).filter((x) => !(f.prove || []).includes(x) && !/^tests\//.test(x))
const nonProvati = (f) => (f.rimessa && f.rimessa.file && f.rimessa.file.length ? soloSito(f).filter((x) => !f.rimessa.file.includes(x)) : [])

// La macchina prima dell'agente: un frammento passa se ha un commit, la prova del sito e' verde (0) e la
// prova rimessa non dice «non morde». Un rosso solo di struttura passa: lo decide il collaudo.
function percheNoMacchina(f) {
  if (!f) return "la squadra non ha consegnato"
  if (!f.commit) return "nessun commit sul ramo"
  if (!(f.chiusi || []).length) return "nessun difetto chiuso"
  if (f.prova_uscita !== 0) return "la prova del sito non e' verde (uscita " + f.prova_uscita + ")"
  if (!f.rimessa || !MACCHINA_OK.includes(f.rimessa.esito)) return "la prova rimessa dice «" + ((f.rimessa && f.rimessa.esito) || "niente") + "»: la prova non cade senza la correzione"
  return ""
}

function squadra(p, compito, etichetta, fase) {
  const wt = wtDi(p)
  const ramo = ramoDi(p)
  return chiama(
    "Squadra del pacchetto «" + p.chiave + "» dell'ondata " + ONDATA + " del sito (rischio: " + p.rischio + "). Lavori SOLO nel tuo worktree " + wt + ", sul ramo " + ramo + ".\n" +
    "1. Il worktree: se non c'e' gia', git -C " + REPO + " worktree add " + wt + " " + BASE + " -b " + ramo + " (se il ramo esiste gia': git -C " + REPO + " worktree add " + wt + " " + ramo + ").\n" +
    "2. Le dipendenze si COLLEGANO, non si installano: [ -e " + wt + "/node_modules ] || ln -s " + REPO + "/node_modules " + wt + "/node_modules. Aggiungi solo per nome i file che tocchi, mai git add -A.\n" +
    "3. " + compito + "\n" +
    "Per ogni difetto: prima una prova in tests/unit/ che diventa ROSSA col difetto, poi il fix, poi la stessa prova VERDE. La prova del sito si lancia cosi': " + LANCIA_PROVA + " --repo " + wt + " --file <i file che hai toccato E la prova che hai scritto, separati da virgola>, e " + TEMPO + ". Esce 0 solo se una prova e' girata davvero; 2 vuol dire NON provato.\n" +
    "4. Committa la correzione e le prove: un commit sul ramo, con un messaggio che spiega il perche'. Niente push, niente merge. Il commit viene PRIMA della prova della macchina, cosi' niente si perde se viene fermata. Dopo il commit il worktree dev'essere pulito (git status vuoto, a parte il collegamento node_modules): quello che fa parte della correzione si committa, il resto si toglie.\n" +
    "5. La prova della macchina: " + LANCIA_RIMESSA + " --repo " + wt + " --base " + BASE + " --file <i file del sito che hai corretto, MAI le prove> --prove <le prove che hai scritto>, e " + TEMPO + ". «regge» (uscita 0): la prova cade senza la correzione, ed e' quello che serve. «non_morde» (1): la prova resta verde senza la correzione, quindi non prova il fix: rifalla finche' morde. «rosso_strutturale» (3): cade solo perche' manca un nome nuovo; se puoi, scrivi la prova sul codice che c'era gia' alla base, altrimenti spiegalo in nota. Un file che da solo non fa cadere la prova e' elencato per nome: o gli serve una prova sua, o non porta la correzione (toglilo da --file e dillo in nota). 2 = non provato (leggi il motivo), 4 = un file non e' tornato com'era (fermati e scrivilo in nota), 124 = tempo della shell finito. Se rifai le prove, un altro commit.\n" +
    "Territorio: " + (p.file.join(", ") || "dichiara i file che tocchi") + ", piu' le prove nuove in tests/unit/. Fuori non scrivere: se il fix vero sta fuori, mettilo in parziali col perche'. I difetti che c'erano gia' sulla base e che vedi lavorando NON li ripari: mettili in vecchi.\n" +
    "Nel frammento: chiusi = le chiavi dei difetti chiusi, scritte esattamente come arrivano; file_toccati e prove = percorsi relativi alla radice del sito; prova_uscita e prova = uscita e ultima riga di prova-sito; rimessa = esito, uscita e i file passati in --file a prova-rimessa.\n" +
    SOBRIO(Math.min(60, 20 + 6 * p.difetti.length)),
    { label: etichetta + ":" + slug(p.chiave), phase: fase, schema: S_FRAMMENTO, tipo: TIPO_COSTRUISCE })
    .then((f) => normalizza(f, p))
}

// ── ① le squadre, con un solo rifacimento se la macchina dice no ───────────────────────────────
phase("Squadre")
const lavori = (await pipeline(PAC, async (p) => {
  let f = await squadra(p, "I difetti da chiudere, con la loro scheda:\n" + schede(p), "squadra", "Squadre")
  let no = percheNoMacchina(f)
  if (no) {
    log("pacchetto " + p.chiave + ": " + no + " → un rifacimento")
    const g = await squadra(p, "Rifacimento. Il primo giro non ha passato la macchina: " + no + ". Riparti dal ramo com'e', chiudi questi difetti:\n" + schede(p), "rifai", "Squadre")
    if (g) { f = g; no = percheNoMacchina(g) }
  }
  return { p, f, no }
})).map((e, i) => e || { p: PAC[i], f: null, no: "la squadra e' caduta" })

const esito = new Map() // chiave -> { stato, motivo }
for (const e of lavori) if (e.no) esito.set(e.p.chiave, { stato: "non_regge", motivo: e.no })
const registro = []
for (const e of lavori) for (const d of ((e.f && e.f.vecchi) || [])) registro.push({ ...d, pacchetto: e.p.chiave, fonte: "squadra" })

// ── ② il collaudo: uno per ondata ──────────────────────────────────────────────────────────────
const LENTE_A = "Lente A, sa diventare rosso? Lavori SOLO in worktree tuoi: quello della squadra lo legge la lente B nello stesso momento, e la prova della macchina riscrive i file. Per OGNI pacchetto: 0) un worktree pulito dal commit della squadra (se c'e' gia', da un giro prima, si rifa'): git -C " + REPO + " worktree remove --force <worktree>-collaudo 2>/dev/null; git -C " + REPO + " worktree add <worktree>-collaudo <commit> --detach, poi [ -e <worktree>-collaudo/node_modules ] || ln -s " + REPO + "/node_modules <worktree>-collaudo/node_modules. 1) Rilancia TU la prova della macchina nel tuo worktree: " + LANCIA_RIMESSA + " --repo <worktree>-collaudo --base " + BASE + " --file <file corretti> --prove <prove>, e " + TEMPO + ". «non_morde», «non_verde» o «instabile» → regge:false, boccia_per «difetto_rimesso» («sito» se le prove sono rosse sul codice di oggi). «rosso_strutturale» o «rosso_sconosciuto» → la macchina non decide: nel tuo worktree rimetti il difetto COM'E' SCRITTO nella scheda con una mutazione minima, lancia le prove della squadra con la prova del sito: devono diventare rosse. 2) Per i gravi e i bloccanti chiusi cerca UNA variante scomoda, come dice COME DECIDI. Alla fine rimetti tutto a posto e togli il tuo worktree (git -C " + REPO + " worktree remove --force <worktree>-collaudo)."
const LENTE_B = "Lente B, nasce rotto? Per ogni ramo leggi il delta (git -C <worktree> diff " + BASE + "..HEAD -- <file toccati>), cerca gli altri chiamanti dei simboli cambiati (grep nel worktree), immagina la produzione senza le migrazioni nuove applicate, e lancia la prova del sito sui file toccati. Questo vale anche come radiografia del perimetro: in copertura, per ogni dimensione qui sotto, i file che hai guardato e quanti difetti hai trovato (anche 0)."
function comeDecidi(muta) {
  return "COME DECIDI (il motore legge boccia_per). Si boccia per il sito, non per la prova.\n" +
    "- regge:false, boccia_per «sito»: un comando rosso sul codice di oggi del ramo, senza mutarlo, mostra il sito che sbaglia in quello che il pacchetto dichiara chiuso o che il suo delta cambia. Il comando va in perche.\n" +
    (muta
      ? "- regge:false, boccia_per «difetto_rimesso»: un difetto dichiarato chiuso, rimesso com'e' scritto nella scheda, lascia verdi le prove della squadra.\n" +
        "- Una variante scomoda si prova prima sul codice di oggi, SENZA mutarlo: rossa li' vuol dire «sito». Verde li' vuol dire che il sito fa giusto: se la tua mutazione lascia verdi le prove, e' un buco nelle prove, va in difetti come minore col comando che lo uccide, e non boccia (boccia_per «variante», col comando in perche).\n"
      : "- Tu non muti. Un caso che le prove non coprono, su un codice che oggi fa giusto, e' un buco nelle prove: minore, e non boccia. Se il codice di oggi sbaglia per chi usa il sito, o non sai dire se fa giusto: regge:false, boccia_per «sito»; se non puoi provarlo leggendo, mettilo anche in difetti come grave col comando che lo farebbe diventare rosso.\n") +
    "- Un motivo di una bocciatura precedente che non e' chiuso: regge:false, boccia_per «motivo_aperto».\n" +
    "- Niente di questo: regge:true, boccia_per «nessuno».\n" +
    "In difetti: nato_dal_lotto:true solo se non c'e' sul commit " + BASE + "; quello che c'era gia' va con false e finisce nel registro. Grave o bloccante solo se il sito si comporta male. pacchetto = la chiave del pacchetto a cui appartiene, esattamente come scritta qui sotto.\n"
}
function elenco(lista) {
  return lista.map((e) => "- «" + e.p.chiave + "» (rischio " + e.p.rischio + ") · worktree " + e.f.worktree + " · ramo " + e.f.ramo + " · commit " + e.f.commit +
    " · file corretti " + ((e.f.rimessa.file && e.f.rimessa.file.length ? e.f.rimessa.file : soloSito(e.f)).join(",") || "nessuno") + (nonProvati(e.f).length ? " · toccati ma NON provati dalla macchina (guardali tu) " + nonProvati(e.f).join(",") : "") + " · prove " + ((e.f.prove || []).join(",") || "nessuna") +
    " · macchina «" + e.f.rimessa.esito + "»\n  chiusi: " + e.f.chiusi.map((k) => { const d = e.p.difetti.find((x) => x.chiave === k); return k + (d && (d.descrizione || d.dove) ? " [" + String(d.descrizione || d.dove).slice(0, 200) + "]" : "") }).join(" · ") +
    (e.motivi ? "\n  motivi della bocciatura di prima: " + e.motivi : "")).join("\n")
}
const dimensioni = (lista) => { const m = {}; for (const e of lista) for (const x of unione(e.p.file, e.f.file_toccati)) { const l = LPF[x] || e.p.lente || "?"; (m[l] = m[l] || []).push(x) } return Object.entries(m).map(([l, fs]) => l + ": " + fs.join(", ")).join("\n") }

function collaudo(lista, lenti, giro) {
  const muta = lenti.includes("A")
  const testa = "Collaudo dell'ondata " + ONDATA + " del sito" + (giro ? " (ricollaudo dopo la correzione)" : "") + ", lente " + lenti.join("+") + ", su TUTTI i pacchetti qui sotto, in un solo lavoro. Non hai scritto tu questo codice: il tuo mandato e' trovare dove non regge.\n"
  const compiti = (lenti.includes("A") ? LENTE_A + "\n" : "") + (lenti.includes("B") ? LENTE_B + "\nDimensioni:\n" + dimensioni(lista) + "\n" : "")
  const tipo = muta ? TIPO_COSTRUISCE : TIPO_CONTROLLA
  return chiama(testa + compiti + comeDecidi(muta) + "Pacchetti:\n" + elenco(lista) + "\nUn verdetto per ogni pacchetto in pacchetti, con la chiave esatta.\n" + SOBRIO(Math.min(80, 25 + 12 * lista.length)),
    { label: "collaudo-" + lenti.join("") + (giro ? "-bis" : "") + ":ondata-" + ONDATA, phase: giro ? "Correzione" : "Collaudo", schema: S_COLLAUDO, tipo }, true)
    .then((v) => ({ v, lenti, muta }))
}

// Legge i verdetti: chi boccia, chi ha un grave nato, cosa va nel registro, la copertura.
function leggi(esiti, lista) {
  const bocciati = new Map() // chiave -> { lenti:Set, motivi:[] }
  const copertura = []
  const segna = (k, lente, motivo) => { const b = bocciati.get(k) || { lenti: new Set(), motivi: [] }; b.lenti.add(lente); b.motivi.push(motivo); bocciati.set(k, b) }
  for (const { v, lenti, muta } of esiti) {
    const lente = lenti.join("")
    if (!v) { for (const e of lista) segna(e.p.chiave, lente, "il collaudo " + lente + " non e' avvenuto (caduto o senza posto): non e' un regge"); continue }
    for (const e of lista) {
      const x = (v.pacchetti || []).find((y) => y.chiave === e.p.chiave)
      if (!x) { segna(e.p.chiave, lente, "il collaudo " + lente + " non ha dato un verdetto su questo pacchetto"); continue }
      const variante = muta && x.boccia_per === "variante" && COMANDO.test(String(x.perche || ""))
      if (variante) { registro.push({ titolo: "buco nelle prove (variante): " + String(x.perche || "").slice(0, 120), gravita: "minore", dove: e.p.chiave, nato_dal_lotto: true, prova: x.perche, pacchetto: e.p.chiave, fonte: "collaudo " + lente }); continue }
      if (x.regge === false || CAUSE_CHE_BOCCIANO.includes(x.boccia_per)) segna(e.p.chiave, lente, x.boccia_per + ": " + String(x.perche || "senza perche'").slice(0, 280))
    }
    for (const d of (v.difetti || [])) {
      const e = lista.find((y) => y.p.chiave === d.pacchetto)
      if (d.nato_dal_lotto && pesante(d)) {
        if (e) segna(e.p.chiave, lente, "grave nato: " + d.titolo + (d.prova ? " (prova: " + String(d.prova).slice(0, 160) + ")" : ""))
        else for (const y of lista) segna(y.p.chiave, lente, "grave nato senza pacchetto riconoscibile («" + (d.pacchetto || "?") + "»): " + d.titolo)
      } else registro.push({ ...d, fonte: "collaudo " + lente })
    }
    for (const c of (v.copertura || [])) copertura.push({ ...c, lente })
  }
  return { bocciati, copertura }
}

phase("Collaudo")
let buoni = lavori.filter((e) => !e.no)
let copertura = []
let daCorreggere = new Map()
if (buoni.length) {
  const piani = RISCHIO ? [["A"], ["B"]] : [["A", "B"]]
  const esiti = await parallel(piani.map((l) => () => collaudo(buoni, l, false)))
  const r = leggi(esiti.map((x, i) => x || { v: null, lenti: piani[i], muta: piani[i].includes("A") }), buoni)
  copertura = r.copertura
  daCorreggere = r.bocciati
}

// ── ③ un giro di correzione, poi ricollauda solo la lente che ha bocciato ───────────────────────
phase("Correzione")
const daFare = buoni.filter((e) => daCorreggere.has(e.p.chiave))
if (daFare.length) {
  const lentiBis = [...new Set(daFare.flatMap((e) => [...daCorreggere.get(e.p.chiave).lenti]))]
  riserva = lentiBis.length // i posti del ricollaudo, tenuti da parte come quelli del primo
  const corretti = (await pipeline(daFare, async (e) => {
    const motivi = daCorreggere.get(e.p.chiave).motivi.join(" | ")
    const g = await squadra(e.p, "Correzione dopo il collaudo. Il ramo c'e' gia': riparti da li'. Chiudi QUESTI motivi, uno per uno, con una prova che li fa diventare rossi prima del fix: " + motivi + "\nI difetti del pacchetto, per riferimento:\n" + schede(e.p), "correggi", "Correzione")
    const no = percheNoMacchina(g)
    if (no) { esito.set(e.p.chiave, { stato: "non_regge", motivo: "correzione: " + no + " · motivi: " + motivi }); return null }
    return { p: e.p, f: g, motivi }
  })).filter(Boolean)
  for (const e of daFare) if (!corretti.find((c) => c.p.chiave === e.p.chiave) && !esito.has(e.p.chiave)) esito.set(e.p.chiave, { stato: "non_regge", motivo: "correzione non fatta (tetto o squadra caduta) · motivi: " + daCorreggere.get(e.p.chiave).motivi.join(" | ") })
  if (corretti.length) {
    const piani = lentiBis.map((l) => ({ lenti: l.split(""), lista: corretti.filter((c) => daCorreggere.get(c.p.chiave).lenti.has(l)) })).filter((x) => x.lista.length)
    const esitiBis = await parallel(piani.map((x) => () => collaudo(x.lista.map((c) => ({ ...c, motivi: c.motivi })), x.lenti, true)))
    const bocciatiBis = new Map()
    piani.forEach((x, i) => {
      const rb = leggi([esitiBis[i] || { v: null, lenti: x.lenti, muta: x.lenti.includes("A") }], x.lista)
      copertura = copertura.concat(rb.copertura)
      for (const [k, b] of rb.bocciati) bocciatiBis.set(k, (bocciatiBis.get(k) || []).concat(b.motivi))
    })
    for (const c of corretti) {
      if (bocciatiBis.has(c.p.chiave)) esito.set(c.p.chiave, { stato: "non_regge", motivo: "dopo un giro di correzione: " + bocciatiBis.get(c.p.chiave).join(" | ") })
      const i = buoni.findIndex((e) => e.p.chiave === c.p.chiave)
      if (i >= 0) buoni[i] = { ...buoni[i], f: c.f }
    }
  }
}

// ── il risultato per l'AD ──────────────────────────────────────────────────────────────────────
const RUN = (typeof workflow === "object" && workflow && (workflow.runId || workflow.id)) || "<runId>"
const pacchetti = lavori.map((e) => {
  const b = buoni.find((x) => x.p.chiave === e.p.chiave)
  const f = (b && b.f) || e.f
  const x = esito.get(e.p.chiave)
  return { chiave: e.p.chiave, ramo: (f && f.ramo) || ramoDi(e.p), worktree: (f && f.worktree) || wtDi(e.p), commit: (f && f.commit) || "",
    esito: x ? "non_regge" : "regge", motivo: x ? x.motivo : "", chiusi: (f && f.chiusi) || [], parziali: (f && f.parziali) || [] }
})
const nonReggono = pacchetti.filter((p) => p.esito === "non_regge")
if (saltati.length) log("saltati per il tetto di " + MAX + ": " + saltati.join(", "))
return {
  ondata: ONDATA, base: BASE, tetto: MAX, agenti_usati: usati, saltati_per_tetto: saltati,
  pacchetti, registro, copertura,
  chiedi_a_nicola: nonReggono.length > 0,
  motivo: nonReggono.length ? nonReggono.length + " pacchetti su " + pacchetti.length + " non reggono dopo un giro di correzione: decide Nicola (regola ①: al massimo due ondate per funzione)" : "",
  prossimi_passi: [
    "ricuci i rami che reggono sopra " + BASE + " e lancia npm run verify UNA volta",
    "registra la copertura: node cervello/radiografia-in-corsa.mjs registra --repo " + REPO + " --dimensione <dimensione> --toccati --trovati <n>, per ogni riga di copertura",
    "scrivi il registro nel registro del sito (vecchi e minori nati: diventano schede delle ondate dopo)",
    "il conto: node cervello/conto-token.mjs --workflow " + RUN + " (va nel referto)",
  ],
}
