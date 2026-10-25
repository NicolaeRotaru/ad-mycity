// 🌊 ONDATA DEL SITO — ripara UN'ondata del piano dei pacchetti con pochi agenti, e si ferma da sola.
//
// PERCHE' ESISTE. L'ondata 1 del piano del 15/10 l'ha orchestrata l'AD a mano: piu' di 600 lanci di
// lavoratori in tre giorni, sette riesami, e a ogni riesame 15-27 difetti nati, quasi tutti minori
// (referto consegne/audit/2026-10-16-prima-ondata-sito.md). Il conto ricostruito: circa 762 lanci, di
// cui 513 di verificatori, il 67%. (Sono lanci, non senior: i senior restano quelli di .claude/agents.) Il protocollo non convergeva perche' ogni minore nato tornava a una squadra,
// ogni squadra tornava al collaudo con tutte e due le lenti, e ogni giro apriva un riesame nuovo.
//
// IL PROTOCOLLO CHE CONVERGE (le cinque regole, ognuna contro un pezzo di quel conto):
//   ① i minori nati e i difetti che c'erano gia' NON tornano alle squadre: vanno nel registro che il
//      workflow restituisce, e l'AD li scrive nel registro del sito (diventano schede delle ondate dopo);
//   ② due lenti di collaudo solo dove il pacchetto tocca soldi, dati o permessi; altrove una sola, che
//      porta tutte e due le domande. Dopo una bocciatura si ricollauda SOLO con la lente che ha bocciato;
//   ③ UN solo riesame, sul delta dell'ondata (git diff base..HEAD dei file toccati), raggruppato per
//      lente, al massimo quattro revisori;
//   ④ la verifica a due voci — un verificatore che prova a smontare — solo sui gravi e bloccanti nati;
//   ⑤ si correggono solo i gravi nati, al massimo due giri; poi il workflow si ferma e restituisce
//      chiedi_a_nicola:true col motivo. La risposta di Nicola del 17/10 all'ondata 1 e' stata «Semplifica».
// Freni: un contatore di agenti con tetto (args.max_agenti, 45 di default) e, quando il motore da' un
// budget, budget.remaining() con una riserva. Una parte del tetto e' TOLTA alle squadre e ai collaudi
// finche' il riesame non parte: e' la rete di sicurezza di tutta l'ondata, e non deve essere il passo
// che salta per primo. Un riesame che non avviene — revisore caduto, saltato, o che boccia senza dire
// cosa — non diventa mai un «regge»: ferma i suoi pacchetti e chiede a Nicola. Lo stesso vale per un
// grave nato confermato di cui non si sa il pacchetto («payout.ts:40» senza cartella, o un file che
// nessuna squadra del gruppo dichiara): si fermano TUTTI i pacchetti che quel revisore ha guardato,
// perche' un ramo con un grave aperto sui soldi non si ricuce per caso. Per la stessa ragione un grave
// nato si chiude solo se la squadra lo mette fra i chiusi E il collaudo dopo regge, in tutti e due i
// posti dove nasce: nel collaudo (lo ripara il rifacimento) e nel riesame (lo ripara la correzione).
// Nei parziali o taciuto resta aperto, ferma il suo ramo, esce in gravi_aperti e accende chiedi_a_nicola.
//
// STIMA, NON MISURA: da 24 a 41 lanci per ondata (5 squadre, 6-8 collaudi, qualche rifacimento, fino a 4
// revisori, i verificatori dei gravi nati, due giri di correzione al massimo). Il conto vero si legge a
// fine run con cervello/conto-token.mjs, ed e' la riga che il risultato chiede di lanciare.
//
// COSA ARRIVA DA FUORI (qui dentro il disco non si legge e niente si importa):
//   args.schede     l'uscita di `node cervello/schede-pacchetto.mjs --piano <piano> --ondata <N> --json`
//   args.repo       la radice della copia del sito (i worktree nascono accanto, in <repo>-ondate/)
//   args.radice_ad  la radice dell'AD, da cui le squadre lanciano cervello/prova-sito.mjs
//   args.base       il commit del sito da cui partono tutte le squadre
//   args.tipo_costruisce  chi SCRIVE o MUTA (default «tech»): squadre, rifacimenti, correzioni, la lente
//                         A del collaudo, la lente unica dei pacchetti non a rischio (porta anche la A), e
//                         il verificatore dei gravi nati, che deve far diventare rossa una prova
//   args.tipo_controlla   chi SOLO LEGGE (default «qa»): la lente B «nasce rotto?» sui pacchetti a rischio
//                         e i revisori del riesame, che leggono un diff
//   Il tipo segue i PERMESSI del mestiere, non il nome del passo: il mansionario di qa (sezione «Dove
//   lavori») tiene il codice del sito in sola lettura e git fuori dalle sue mani, quindi un qa che
//   obbedisce non puo' ricreare un difetto con una mutazione in un worktree. «Chi ha costruito non
//   collauda» resta vero comunque: ogni collaudo e' un lavoratore nuovo, non la squadra che ha scritto.
//   I default sono senior che esistono: un tipo che non c'e' fa cadere ogni lavoratore e l'ondata esce
//   «ferma». Quando nascera' il tipo snello «squadra-sito» si passa tipo_costruisce:"squadra-sito".
//   I vecchi args.tipo e args.tipo_controllo fermano il workflow con un errore che dice i nomi nuovi:
//   ignorarli in silenzio avrebbe mandato il tipo sbagliato senza che nessuno se ne accorgesse.
//   args.max_agenti, args.riserva   i freni
// La ricucitura dei rami, `npm run verify` (una volta per ondata, non per squadra) e la richiesta di
// unione restano all'AD; l'unione e' di Nicola.

export const meta = {
  name: "ondata-sito",
  description: "Ripara UN'ondata del piano dei pacchetti del sito con pochi agenti: una squadra per pacchetto nel suo worktree, collaudo proporzionato al rischio, un solo riesame sul delta, al massimo due giri di correzione dei gravi nati, poi si ferma e chiede",
  whenToUse: "Dopo pacchetti-lotto.mjs --sito --gravi --scrivi e schede-pacchetto.mjs --json. args = {schede, repo, radice_ad, base, tipo_costruisce?, tipo_controlla?, max_agenti?, riserva?}. Ricucitura dei rami, npm run verify e richiesta di unione restano all'AD; l'unione e' di Nicola.",
  phases: [
    { title: "Squadre", detail: "una per pacchetto, nel suo worktree, con prove mute e mirate" },
    { title: "Collaudo", detail: "due lenti su soldi/dati/permessi, una altrove; si ricollauda solo con la lente che ha bocciato" },
    { title: "Riesame", detail: "uno solo sul delta dell'ondata, al massimo quattro revisori; due voci solo sui gravi nati" },
    { title: "Correzione", detail: "solo i gravi nati, al massimo due giri, poi si ferma e chiede a Nicola" },
  ],
}

// ── chi lavora: chi SCRIVE o MUTA, e chi SOLO LEGGE (il perche' e' qui sopra, in «COSA ARRIVA DA FUORI»)
const TIPO_COSTRUISCE = (args && args.tipo_costruisce) || "tech"
const TIPO_CONTROLLA = (args && args.tipo_controlla) || "qa"

// ── gli args ───────────────────────────────────────────────────────────────────────────────────
const A = args || {}
if (A.tipo !== undefined || A.tipo_controllo !== undefined) throw new Error("args.tipo e args.tipo_controllo non esistono piu': passa args.tipo_costruisce (chi scrive o muta, default tech) e args.tipo_controlla (chi solo legge, default qa)")
const COMANDO_SCHEDE = "node cervello/schede-pacchetto.mjs --piano <piano dei pacchetti> --ondata <N> --json"
let SCHEDE = A.schede
if (typeof SCHEDE === "string") {
  try { SCHEDE = JSON.parse(SCHEDE) } catch (e) { SCHEDE = null }
}
// Niente stadio che le estrae: un agente che ricopia schede e' il lavoro meccanico che costava un
// turno da 91.000 gettoni. Se mancano, non si indovina: si dice quale comando le prepara.
if (!SCHEDE || !Array.isArray(SCHEDE.pacchetti)) throw new Error("mancano le schede in args.schede: lancia " + COMANDO_SCHEDE + " e passa la sua uscita cosi' com'e'")
if (!A.repo) throw new Error("serve args.repo: la radice della copia del sito da cui nascono i worktree delle squadre")
if (!A.radice_ad) throw new Error("serve args.radice_ad: la radice dell'AD, da cui le squadre lanciano cervello/prova-sito.mjs")
if (!A.base) throw new Error("serve args.base: il commit del sito da cui partono tutte le squadre (git -C <repo> rev-parse HEAD)")

const senzaBarra = (s) => String(s).replace(/\/+$/, "")
const REPO = senzaBarra(A.repo)
const AD = senzaBarra(A.radice_ad)
const BASE = String(A.base)
const ONDATA = SCHEDE.ondata
const MAX_AGENTI = Number(A.max_agenti) > 0 ? Number(A.max_agenti) : 45 // ondata 1: piu' di 600
const MAX_RIFACIMENTI = 2 // per pacchetto, dentro il collaudo
const MAX_GIRI = 2 // di correzione dei gravi nati, dopo il riesame
const MAX_REVISORI = 4
const LPF = SCHEDE.lenti_per_file || {} // file -> lente, calcolato da schede-pacchetto con la mappa vera
const PROVA = "node " + AD + "/cervello/prova-sito.mjs"
// Il tempo della prova: tre numeri che si tengono. Il tetto unico di prova-sito (480 secondi, tutti i
// passi insieme) < il timeout della shell (540) < il tetto dello strumento Bash (600 secondi al massimo,
// 120 se la chiamata non lo dichiara). Prima erano 840 e «timeout 900»: lo strumento uccideva la prova
// a 600 secondi, o a 120 col suo default, prima del verdetto.
const SECONDI_PROVA = 540
const BASH_MS_PROVA = 600000
const LANCIA_PROVA = "timeout " + SECONDI_PROVA + " " + PROVA
const TEMPO_PROVA = "nella chiamata dello strumento Bash dichiara timeout: " + BASH_MS_PROVA + " (senza, lo strumento la ferma a 120 secondi, prima del verdetto)"
const BASE_WT = REPO + "-ondate/o" + ONDATA

const PAC = SCHEDE.pacchetti.filter((p) => p && Array.isArray(p.difetti) && p.difetti.length)
const senzaLavoro = SCHEDE.pacchetti.filter((p) => !p || !Array.isArray(p.difetti) || !p.difetti.length).map((p) => (p && p.chiave) || "?")
if (!PAC.length) throw new Error("ondata " + ONDATA + ": nessun pacchetto con difetti aperti. Rilancia " + COMANDO_SCHEDE)
for (const p of PAC) {
  if (!Array.isArray(p.file)) p.file = []
  if (!p.rischio) p.rischio = "nessuno"
}
const RISERVA_RIESAME = Math.min(MAX_REVISORI, PAC.length)

// ── i freni ────────────────────────────────────────────────────────────────────────────────────
const HA_BUDGET = typeof budget !== "undefined" && budget && budget.total
const RISERVA = A.riserva !== undefined && Number(A.riserva) >= 0 ? Number(A.riserva) : HA_BUDGET ? Math.round(budget.total * 0.1) : 0
let usati = 0
const saltati = []
const caduti = []
// La riserva si toglie dal tetto, non si controlla a parole: con i pacchetti in parallelo, un «c'e'
// posto per me piu' la riserva?» chiesto da ognuno non conta i ricollaudi che gli altri hanno gia' in
// corso. Il collaudo del 25/10 l'ha misurato: tetto 45, cinque pacchetti a rischio bocciati due volte,
// e in 2 lanci su 3 il riesame partiva con 0 revisori su 4. Si azzera quando il riesame comincia.
let riservaRiesame = RISERVA_RIESAME
const resta = (n) => usati + (n || 1) <= MAX_AGENTI - riservaRiesame && (!HA_BUDGET || budget.remaining() > RISERVA)

// L'UNICA porta verso un lavoratore: conta, frena, e dichiara il tipo su ogni chiamata (la regola
// porta-unica di cervello/prompt-senior.mjs). Un lavoratore che cade torna null e finisce in «caduti».
// `tipo` lo sceglie chi chiama, fra i due di testa: un tipo dimenticato e' un errore del workflow, e
// si ferma qui invece di partire come senior generico.
function chiama(prompt, opzioni) {
  const { tipo, ...opts } = opzioni
  if (tipo !== TIPO_COSTRUISCE && tipo !== TIPO_CONTROLLA) throw new Error(opts.label + ": chiama() senza tipo_costruisce ne' tipo_controlla")
  if (!resta(1)) {
    saltati.push(opts.label)
    const quanto = HA_BUDGET ? ", budget restante " + budget.remaining() : ""
    log("tetto raggiunto (" + usati + "/" + MAX_AGENTI + " agenti" + quanto + "): " + opts.label + " non parte")
    return Promise.resolve(null)
  }
  usati++
  return Promise.resolve()
    .then(() => agent(prompt, { ...opts, agentType: tipo }))
    .catch((e) => {
      caduti.push(opts.label)
      log(opts.label + " e' caduto: " + String((e && e.message) || e).slice(0, 200))
      return null
    })
}

// ── piccoli attrezzi ───────────────────────────────────────────────────────────────────────────
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)
const fileDi = (d) => String((d && d.dove) || "").split(/[\s:(]/)[0]
const chiaveD = (d) => fileDi(d) + "|" + String((d && d.titolo) || "").toLowerCase().slice(0, 60)
const pesante = (d) => !!d && (d.gravita === "grave" || d.gravita === "bloccante")
const unione = (a, b) => [...new Set([...(a || []), ...(b || [])])]
const perLavoro = ({ wts, pacchetto, dichiarato, ...d }) => d // gruppo, padrone e stato del grave sono conti del workflow, non della squadra
const wtDi =(p) => BASE_WT + "-" + slug(p.chiave)
const ramoDi = (p) => "fix/ondata-" + ONDATA + "-" + slug(p.chiave)
const wtDiE = (e) => (e.f && e.f.worktree) || wtDi(e.p)
// Un percorso riportato alla radice del sito. La squadra lavora in un worktree e puo' dichiarare
// «/srv/sito-ondate/o2-x/lib/stripe/payout.ts»: senza questo, il territorio, la lente del riesame e
// il padrone di un grave nato confrontavano stringhe diverse dello stesso file.
function relativo(x, wt) {
  const s = String(x).replace(/\\/g, "/").replace(/^(\.\/)+/, "")
  for (const r of [wt, REPO]) if (r && s.startsWith(senzaBarra(r) + "/")) return s.slice(senzaBarra(r).length + 1)
  if (s.startsWith(BASE_WT + "-")) { const i = s.indexOf("/", BASE_WT.length + 1); if (i > 0) return s.slice(i + 1) }
  return s // un assoluto che non so ricondurre resta com'e': fuori territorio, e il collaudo lo guarda per primo
}
const normalizza = (f, p) => (f ? { ...f, file_toccati: unione([], (f.file_toccati || []).map((x) => relativo(x, f.worktree || wtDi(p)))) } : f)
// «dove» cita il file x? Uguale, o uno che finisce con l'altro su un confine di cartella: il revisore
// scrive «payout.ts:40» o il percorso assoluto del worktree, la squadra «lib/stripe/payout.ts».
function citaIlFile(dove, x) {
  const testo = String(dove || "").replace(/\\/g, "/")
  if (x.includes("/") && testo.includes(x)) return true
  return testo.split(/[\s,;()«»"'`]+/).map((t) => t.replace(/:[\d\s,–-]*$/, "").replace(/[.:]+$/, "")).filter(Boolean)
    .some((t) => t === x || t.endsWith("/" + x) || x.endsWith("/" + t))
}
const fuoriTerritorio = (p, f) => ((f && f.file_toccati) || []).filter((x) => !p.file.includes(x) && !/^tests\//.test(x))
const aRischio = (p, f) => p.rischio !== "nessuno" || fuoriTerritorio(p, f).length > 0
// Il frammento piu' recente comanda sui difetti che nomina. Un parziale dichiarato nel rifacimento
// riapre una chiave che la squadra aveva chiuso prima: tenere l'unione dei chiusi faceva uscire
// «regge» un grave del piano che la squadra stessa aveva appena detto di non riuscire a chiudere
// (collaudo del 25/10). E una chiave messa insieme fra i chiusi e fra i parziali conta aperta.
function unisci(f, g) {
  const riaperti = new Set((g.parziali || []).map((x) => x.chiave))
  const chiusi = unione(f.chiusi, g.chiusi).filter((k) => !riaperti.has(k))
  return { ...f, ...g, chiusi, file_toccati: unione(f.file_toccati, g.file_toccati), parziali: (g.parziali || f.parziali || []).filter((x) => !chiusi.includes(x.chiave)) }
}

// Il registro: minori nati e difetti che c'erano gia'. Non si riparano in questa ondata, ma restano visibili.
const registro = []
function smista(difetti, pacchetto, fonte) {
  const daCorreggere = []
  for (const d of difetti || []) {
    if (pesante(d) && d.nato_dal_lotto) daCorreggere.push(d)
    else registro.push({ ...d, pacchetto, fonte })
  }
  return daCorreggere
}

const SOBRIO = (strumenti) => "SOBRIETA' (vincolante): rispondi SOLO con lo schema, niente prosa fuori. Al massimo " + strumenti + " chiamate di strumento. Ogni Bash con \"timeout 120\", tranne la prova del sito: \"" + LANCIA_PROVA + " ...\", e " + TEMPO_PROVA + ". Leggi solo i file che ti servono e a pezzi (grep -n, poi sed -n), mai un file intero sopra 30 KB. Mai npm install, mai npm ci, mai la suite intera, mai git push."

// ── gli schemi: corti, perche' ogni byte del frammento rientra nel contesto di chi lo legge ──────
const S_FRAMMENTO = { type: "object", required: ["ramo", "worktree", "commit", "chiusi", "file_toccati"], properties: {
  ramo: { type: "string" }, worktree: { type: "string" }, commit: { type: "string" },
  chiusi: { type: "array", items: { type: "string" } },
  parziali: { type: "array", maxItems: 12, items: { type: "object", properties: { chiave: { type: "string" }, perche: { type: "string", maxLength: 200 } } } },
  file_toccati: { type: "array", items: { type: "string" } },
  prova: { type: "string", maxLength: 200 }, nota: { type: "string", maxLength: 300 } } }
const DIFETTO = { type: "object", required: ["titolo", "gravita", "dove", "nato_dal_lotto"], properties: {
  titolo: { type: "string", maxLength: 140 }, gravita: { type: "string", enum: ["bloccante", "grave", "minore"] },
  dove: { type: "string", maxLength: 200 }, prova: { type: "string", maxLength: 300 }, nato_dal_lotto: { type: "boolean" } } }
const S_VERDETTO = { type: "object", required: ["regge", "difetti"], properties: {
  regge: { type: "boolean" }, perche: { type: "string", maxLength: 300 }, difetti: { type: "array", maxItems: 8, items: DIFETTO } } }
const S_REALE = { type: "object", required: ["reale"], properties: { reale: { type: "boolean" }, perche: { type: "string", maxLength: 200 } } }

// ── la squadra ─────────────────────────────────────────────────────────────────────────────────
function squadra(p, compito, opz) {
  const o = opz || {}
  const wt = wtDi(p)
  const ramo = ramoDi(p)
  const strumenti = Math.min(60, 20 + 6 * p.difetti.length)
  return chiama(
    "Squadra del pacchetto «" + p.chiave + "» dell'ondata " + ONDATA + " del sito (rischio: " + p.rischio + "). Lavori SOLO nel tuo worktree " + wt + ", sul ramo " + ramo + ".\n" +
    "1. Il worktree: se non c'e' gia', git -C " + REPO + " worktree add " + wt + " " + BASE + " -b " + ramo + " (se il ramo esiste gia': git -C " + REPO + " worktree add " + wt + " " + ramo + ").\n" +
    "2. Le dipendenze si COLLEGANO, non si installano: [ -e " + wt + "/node_modules ] || ln -s " + REPO + "/node_modules " + wt + "/node_modules. Il .gitignore del sito ignora la cartella, non il link: aggiungi solo per nome i file che tocchi, mai git add -A.\n" +
    "3. " + compito + "\n" +
    "Per ogni difetto: prima una prova che diventa ROSSA col difetto, poi il fix, poi la stessa prova VERDE. Le prove si lanciano cosi', e solo cosi': " + LANCIA_PROVA + " --repo " + wt + " --file <i file che hai toccato E la prova che hai scritto in tests/unit/, separati da virgola>, e " + TEMPO_PROVA + ". Esce 0 solo se una prova e' girata davvero; 2 vuol dire NON provato (un .sql, .yml o .sh non lo importa nessuna prova: senza il file di prova in --file non gira niente), e non e' un verde. Stampa al massimo 30 righe; il dettaglio e' nel log che indica.\n" +
    "Territorio: " + (p.file.join(", ") || "dichiara i file che tocchi") + ", piu' le prove nuove in tests/unit/. Fuori non scrivere: se il fix vero sta fuori, mettilo in parziali col perche'.\n" +
    "Un commit sul ramo, con un messaggio che spiega il perche'. Niente push, niente merge: la ricucitura e' dell'AD.\n" +
    "Nel frammento: chiusi = le chiavi dei difetti chiusi con prova rossa-poi-verde, scritte esattamente come arrivano; quello che non chiudi va in parziali col perche'; file_toccati = percorsi relativi alla radice del sito (lib/x.ts, non " + wt + "/lib/x.ts); prova = l'ultima riga di prova-sito.\n" +
    SOBRIO(strumenti),
    { label: (o.etichetta || "squadra") + ":" + slug(p.chiave), phase: o.fase || "Squadre", schema: S_FRAMMENTO, tipo: TIPO_COSTRUISCE })
    .then((f) => normalizza(f, p))
}

// ── il collaudo: le lenti dosate sul rischio ───────────────────────────────────────────────────
const LENTE_A = "Lente A, sa diventare rosso? Per ogni difetto dichiarato chiuso ricrea il difetto nella variante scomoda (una mutazione scelta da te, non quella ovvia) e verifica che la prova della squadra diventi ROSSA; poi rimetti a posto."
const LENTE_B = "Lente B, nasce rotto? Leggi il delta, cerca gli altri chiamanti dei simboli cambiati (grep nel worktree), immagina la produzione senza le migrazioni nuove applicate, e lancia la prova del sito sui file toccati."
// `muta`: la lente ricrea il difetto in un worktree suo, quindi scrive (git e file) e la fa chi costruisce.
// La B da sola legge e lancia prove: la fa chi controlla, e il suo prompt non nomina mutazioni ne' worktree.
const lentiPer = (p, f) => (aRischio(p, f)
  ? [{ nome: "A", testo: LENTE_A, muta: true }, { nome: "B", testo: LENTE_B, muta: false }]
  : [{ nome: "AB", testo: LENTE_A + "\n" + LENTE_B, muta: true }])

// `verifica`: quello che il ricollaudo deve ricontrollare. Il ricollaudo e' un lavoratore nuovo, e la
// lente A guarda solo i «chiusi dichiarati»: se il prompt non nomina i motivi della bocciatura e i gravi
// nati che la squadra dice di aver chiuso, regge senza averli cercati.
function daRiverificare(v) {
  if (!v) return ""
  let t = ""
  if (v.motivi && v.motivi.length) t += "La volta prima il collaudo ha bocciato per: " + v.motivi.join(" · ") + ". Controlla per prima cosa che non sia piu' vero.\n"
  if (v.gravi && v.gravi.length) t += "Gravi nati che la squadra dichiara chiusi: rilancia la prova di ognuno. Se e' ancora rossa, rimettilo in difetti con lo stesso titolo e lo stesso dove, nato_dal_lotto:true, e regge:false.\n" +
    JSON.stringify(v.gravi.map((d) => ({ titolo: d.titolo, gravita: d.gravita, dove: d.dove, prova: d.prova }))) + "\n"
  return t
}

function collaudo(p, f, lenti, da, verifica) {
  const wt = f.worktree || wtDi(p)
  const fuori = fuoriTerritorio(p, f)
  const avviso = fuori.length ? "\nLa squadra ha scritto FUORI dal suo territorio: " + fuori.join(", ") + ". Guardali per primi." : ""
  const ricontrolla = daRiverificare(verifica)
  return parallel(lenti.map((L) => () => {
    const mutanti = wt + "-mutanti-" + L.nome.toLowerCase()
    return chiama(
      "Collaudo del pacchetto «" + p.chiave + "» dell'ondata " + ONDATA + " del sito (rischio: " + p.rischio + "). Non l'hai costruito tu: il mandato e' smontarlo.\n" +
      "Worktree " + wt + ", commit " + f.commit + ". Il delta da guardare: git -C " + wt + " diff " + da + "..HEAD -- " + (f.file_toccati || []).join(" ") + "\n" +
      L.testo + "\n" +
      (L.muta
        ? "Le mutazioni NON si fanno in " + wt + ": un'altra lente puo' starci leggendo. git -C " + REPO + " worktree add --detach " + mutanti + " " + f.commit + ", collega " + REPO + "/node_modules con ln -s, muta e prova li', e alla fine git -C " + REPO + " worktree remove --force " + mutanti + ".\n" +
          "Prova del sito: " + LANCIA_PROVA + " --repo <worktree> --file <file separati da virgola>.\n"
        : "Sola lettura: non scrivi file e usi git solo per leggere (diff, log, show). Prova del sito: " + LANCIA_PROVA + " --repo " + wt + " --file <file separati da virgola>.\n") +
      "Chiusi dichiarati: " + ((f.chiusi || []).join(" · ") || "nessuno") + "." + avviso + "\n" + ricontrolla +
      "regge:false solo con una prova che gira e diventa rossa (scrivila in perche). Per ogni difetto che trovi: nato_dal_lotto:true solo se l'ha introdotto questo delta; grave o bloccante solo se sai scrivere il comando che diventa rosso, altrimenti minore.\n" +
      SOBRIO(30),
      { label: "collaudo" + L.nome + ":" + slug(p.chiave), phase: "Collaudo", schema: S_VERDETTO, tipo: L.muta ? TIPO_COSTRUISCE : TIPO_CONTROLLA })
  }))
}

// ── 1-2. SQUADRE + COLLAUDO in pipeline: nessuna barriera fra pacchetti ─────────────────────────
log("Ondata " + ONDATA + ": " + PAC.length + " pacchetti, " + PAC.reduce((a, p) => a + p.difetti.length, 0) + " difetti, " + PAC.filter((p) => p.rischio !== "nessuno").length + " a rischio · tetto " + MAX_AGENTI + " agenti · scrive " + TIPO_COSTRUISCE + ", legge e basta " + TIPO_CONTROLLA)
if (senzaLavoro.length) log("Senza difetti aperti, saltati: " + senzaLavoro.join(", "))
phase("Squadre")
const esiti = await pipeline(PAC,
  (p) => squadra(p, "I difetti del pacchetto (e' tutta la scheda che ti serve, non aprire la radiografia):\n" + JSON.stringify(p.difetti)),
  async (f0, p) => {
    if (!f0) return { p, stato: "fermo: la squadra non ha consegnato (tetto o errore)" }
    let f = f0
    let lenti = lentiPer(p, f)
    let verifica = null
    // I gravi e bloccanti nati in QUESTO collaudo, per chiave. La regola e' la stessa della correzione
    // dopo il riesame: un grave esce dal conto solo se la squadra lo mette fra i chiusi E dopo un
    // collaudo regge. Prima passava al rifacimento come testo senza chiave, la squadra lo metteva nei
    // parziali (o lo taceva), il ricollaudo non sapeva di cercarlo e reggeva: il ramo dei soldi usciva
    // «regge» col grave sparito. Un pacchetto che si ferma porta i suoi con se', in gravi_aperti.
    const pendenti = new Map()
    const esce = (stato, extra) => ({ p, f, stato, ...extra, gravi: [...pendenti.values()].map((d) => ({ ...d,
      perche: d.perche || (d.dichiarato ? "la squadra lo dichiara chiuso, ma nessun collaudo ha retto dopo (" + stato + ")" : stato) })) })
    for (let giro = 0; ; giro++) {
      const voti = await collaudo(p, f, lenti, BASE, verifica)
      if (voti.some((v) => !v)) return esce("fermo: collaudo non eseguito (tetto o errore)")
      const rossi = []
      const bocciano = []
      voti.forEach((v, i) => {
        const nati = smista(v.difetti, p.chiave, "collaudo " + lenti[i].nome).map((d) => ({ ...d, chiave: "nato|" + chiaveD(d), pacchetto: p.chiave }))
        if (v.regge && !nati.length) return
        bocciano.push(lenti[i])
        if (!v.regge) rossi.push(v.perche || "la lente " + lenti[i].nome + " ha detto regge:false senza perche'")
        for (const d of nati) pendenti.set(d.chiave, d) // due lenti, stesso grave: una chiave sola
      })
      if (!bocciano.length) return { p, f, stato: "regge", rifacimenti: giro }
      const gravi = [...pendenti.values()].filter((d) => !d.dichiarato)
      const motivi = rossi.concat(gravi.map((d) => d.titolo + " @ " + d.dove + (d.prova ? " (prova: " + d.prova + ")" : ""))).slice(0, 8)
      if (giro >= MAX_RIFACIMENTI) return esce("fermo: bocciato " + (giro + 1) + " volte dal collaudo", { motivi })
      // Un rifacimento parte solo se c'e' posto anche per il suo ricollaudo. Il posto del riesame non
      // si conta qui: e' gia' tolto dal tetto (riservaRiesame), quindi nessun pacchetto glielo ruba.
      if (!resta(1 + bocciano.length)) return esce("fermo: tetto vicino, il riesame ha la precedenza sul rifacimento", { motivi })
      const rifatto = await squadra(p, "Il collaudo ti ha bocciato. Nello stesso worktree correggi SOLO questo." +
        (rossi.length ? "\n- " + rossi.slice(0, 8).join("\n- ") : "") +
        (gravi.length ? "\nGravi NATI dal tuo diff, trovati dal collaudo con la loro prova rossa. Metti le loro chiavi in chiusi solo con la prova rossa-poi-verde; se il fix sta fuori dal tuo territorio, mettile in parziali col perche': il pacchetto si ferma e lo si dice a Nicola.\n" + JSON.stringify(gravi.map(perLavoro)) : ""),
        { fase: "Collaudo", etichetta: "rifacimento" + (giro + 1) })
      if (!rifatto) return esce("fermo: la squadra non ha consegnato il rifacimento")
      f = unisci(f, rifatto)
      // Il confronto si fa sul frammento del rifacimento, non su quello unito: e' lui che dice cosa ha chiuso ora.
      const chiusiOra = new Set(rifatto.chiusi || [])
      for (const d of gravi) {
        if (chiusiOra.has(d.chiave)) { pendenti.set(d.chiave, { ...d, dichiarato: true }); continue }
        const parz = (rifatto.parziali || []).find((x) => x && x.chiave === d.chiave)
        pendenti.set(d.chiave, { ...d, perche: "il rifacimento " + (giro + 1) + " non l'ha chiuso: " + (parz ? String(parz.perche || "parziale, senza perche'") : "non e' fra i chiusi che ha dichiarato") })
      }
      const nonChiusi = [...pendenti.values()].filter((d) => !d.dichiarato).length
      if (nonChiusi) return esce("fermo: " + nonChiusi + " gravi nati nel collaudo non chiusi dal rifacimento " + (giro + 1), { motivi })
      verifica = { motivi: rossi.slice(0, 8), gravi: [...pendenti.values()] }
      lenti = bocciano // si ricollauda solo con la lente che ha bocciato, e le si dice cosa ricontrollare
    }
  })

// ── 3. UN SOLO RIESAME sul delta dell'ondata ───────────────────────────────────────────────────
// Qui la barriera e' giusta: per raggruppare per lente e togliere i doppioni serve tutto il delta.
phase("Riesame")
riservaRiesame = 0 // le squadre e i collaudi sono finiti: il posto tenuto da parte adesso si usa
const tutti = esiti.filter(Boolean)
const ok = tutti.filter((e) => e.stato === "regge")
const fermi = tutti.filter((e) => e.stato !== "regge")
const gruppi = new Map()
for (const e of ok) {
  const wt = wtDiE(e)
  for (const file of e.f.file_toccati || []) {
    const lente = LPF[file] || e.p.lente || "qa-flussi"
    if (!gruppi.has(lente)) gruppi.set(lente, new Map())
    const perWt = gruppi.get(lente)
    if (!perWt.has(wt)) perWt.set(wt, [])
    perWt.get(wt).push(file)
  }
}
let G = [...gruppi.entries()]
  .map(([lente, perWt]) => ({ lente, voci: [...perWt.entries()], n: [...perWt.values()].reduce((a, x) => a + x.length, 0) }))
  .sort((a, b) => b.n - a.n)
if (G.length > MAX_REVISORI) {
  const coda = G.slice(MAX_REVISORI - 1)
  G = G.slice(0, MAX_REVISORI - 1).concat([{ lente: coda.map((g) => g.lente).join(" + "), voci: coda.flatMap((g) => g.voci), n: coda.reduce((a, g) => a + g.n, 0) }])
  log("Riesame: " + coda.length + " lenti fuse in un solo revisore (" + G[G.length - 1].lente + "), dichiarato e non nascosto")
}
const risposte = await parallel(G.map((g) => () => chiama(
  "Riesame UNICO dell'ondata " + ONDATA + " del sito, con la lente «" + g.lente + "» della radiografia del sito. Guarda SOLO il delta dell'ondata, cioe' l'uscita di questi comandi:\n" +
  g.voci.map(([wt, file]) => "git -C " + wt + " diff " + BASE + "..HEAD -- " + file.join(" ")).join("\n") + "\n" +
  "Sola lettura: non scrivi file e usi git solo per leggere.\n" +
  "nato_dal_lotto:true solo se il difetto l'ha introdotto questo delta; quello che c'era gia' va con false (finisce nel registro, non si ripara adesso). Grave o bloccante solo con un comando che diventa rosso, scritto in prova; senza, e' minore. regge:false se c'e' almeno un grave nato, e quel grave va in difetti.\n" +
  SOBRIO(30),
  { label: "riesame:" + slug(g.lente), phase: "Riesame", schema: S_VERDETTO, tipo: TIPO_CONTROLLA })))
// Un riesame che non c'e' stato NON e' un riesame pulito. Due modi di mancarlo: il revisore non ha
// risposto (caduto o saltato dal tetto), oppure ha detto regge:false senza nominare il grave nato —
// un rosso senza bersaglio, che non si sa a quale squadra mandare. In tutti e due i pacchetti di
// quella lente si fermano e Nicola lo sa: prima il primo caso usciva con chiedi_a_nicola:false.
const scoperti = []
const trovati = []
risposte.forEach((r, i) => {
  const g = G[i]
  const wts = g.voci.map(([wt]) => wt)
  if (!r) { scoperti.push({ lente: g.lente, wts, perche: "il revisore non ha risposto" }); return }
  const difetti = r.difetti || []
  trovati.push(...difetti.map((d) => ({ ...d, wts }))) // il gruppo che l'ha visto: serve se il padrone non si trova
  if (r.regge === false && !difetti.some((d) => pesante(d) && d.nato_dal_lotto)) {
    scoperti.push({ lente: g.lente, wts, perche: "ha bocciato senza nominare il difetto: " + String(r.perche || "nessun perche'").slice(0, 200) })
  }
})
for (const s of scoperti) {
  for (const e of ok) if (s.wts.includes(wtDiE(e))) e.stato = "fermo: riesame della lente " + s.lente + " non concluso (" + s.perche + ")"
}
// Lo stesso difetto visto da due revisori e' UNO, e porta con se' i rami di tutti e due i gruppi.
const perChiave = new Map()
for (const d of trovati) {
  const gia = perChiave.get(chiaveD(d))
  if (gia) gia.wts = unione(gia.wts, d.wts)
  else perChiave.set(chiaveD(d), { ...d })
}
const unici = [...perChiave.values()]
const candidati = smista(unici, null, "riesame").map((d) => ({ ...d, chiave: "nato|" + chiaveD(d) }))
// Il pacchetto di un difetto, cercato SOLO fra i rami del gruppo che l'ha visto. Prima bastava che
// «dove» contenesse il percorso intero: «payout.ts:40» non trovava nessuno, e il pacchetto dei soldi
// restava «regge» con un grave confermato aperto. Ambiguo o vuoto → null: il chiamante ferma il gruppo.
function padrone(d) {
  const gruppo = d.wts ? ok.filter((e) => d.wts.includes(wtDiE(e))) : ok
  const chi = gruppo.filter((e) => (e.f.file_toccati || []).some((x) => citaIlFile(d.dove, x)))
  if (chi.length === 1) return chi[0]
  return !chi.length && gruppo.length === 1 ? gruppo[0] : null
}
// Un grave nato nel collaudo di una correzione sa gia' di chi e' (d.pacchetto): non si ricerca dal testo.
const padroneDi = (d) => (d.pacchetto ? ok.find((e) => e.p.chiave === d.pacchetto) : padrone(d))

// La seconda voce: un verificatore per difetto, e solo sui gravi nati. Rosso sul ramo e verde (o
// assente) sulla base e' il modo in cui un nato si distingue da uno che c'era gia'.
const smontati = []
const veri = (await parallel(candidati.map((d) => () => {
  const e = padrone(d)
  return chiama(
    "Due voci: un revisore dice che questo difetto e' NATO dall'ondata " + ONDATA + " del sito. Il tuo mandato e' smontarlo.\n" + JSON.stringify(perLavoro(d)) + "\n" +
    "Worktree in cui vive: " + (e ? wtDiE(e) : "trovalo dal file in dove, fra " + ((d.wts && d.wts.join(", ")) || BASE_WT + "-*")) + ". reale:true solo se la sua prova gira e diventa rossa su quel ramo, e passa (o non esiste) sul commit " + BASE + ". Nel dubbio, false.\n" +
    "La base NON si prova in quel worktree (e' il ramo di una squadra): git -C " + REPO + " worktree add --detach " + BASE_WT + "-base-" + slug(d.titolo) + " " + BASE + ", collega " + REPO + "/node_modules con ln -s, prova li' con " + LANCIA_PROVA + ", e alla fine git -C " + REPO + " worktree remove --force quella cartella.\n" +
    SOBRIO(15),
    { label: "verifica:" + slug(d.titolo), phase: "Riesame", schema: S_REALE, tipo: TIPO_COSTRUISCE })
    .then((v) => {
      if (!v) return { ...d, non_verificato: true } // nessuna seconda voce: si tiene, per prudenza, e si dice
      if (v.reale) return d
      smontati.push({ titolo: d.titolo, dove: d.dove, perche: v.perche || "" })
      return null
    })
}))).filter(Boolean)
log("Riesame: " + unici.length + " difetti, " + candidati.length + " gravi nati, " + veri.length + " confermati, " + smontati.length + " smontati, " + registro.length + " nel registro")

// ── 4. CORREZIONE: solo i gravi nati, al massimo MAX_GIRI ──────────────────────────────────────
// Il collaudo della correzione guarda il SUO delta (commit di prima..HEAD): fa da riesame di quel pezzo.
phase("Correzione")
let aperti = veri
let giro = 0
while (aperti.length && giro < MAX_GIRI) {
  if (!resta(2)) {
    log("tetto: la correzione non parte")
    break
  }
  const per = new Map()
  const restano = []
  for (const d of aperti) {
    const e = padroneDi(d)
    if (!e) { restano.push({ ...d, perche: "non so di quale pacchetto e': il file in «dove» non e' fra i file toccati del gruppo del revisore" }); continue }
    if (!per.has(e)) per.set(e, [])
    per.get(e).push({ ...d, pacchetto: e.p.chiave })
  }
  if (!per.size) { aperti = restano; break } // niente da dare a una squadra: un giro vuoto non si conta
  giro++
  const rifatti = await pipeline([...per.entries()],
    ([e, ds]) => squadra(e.p, "Correzione " + giro + " di " + MAX_GIRI + ": difetti NATI dal tuo diff, confermati da un verificatore. Correggi SOLO questi, e metti le loro chiavi in chiusi:\n" + JSON.stringify(ds.map(perLavoro)),
      { fase: "Correzione", etichetta: "correzione" + giro }).then((f) => ({ prima: e.f.commit, f })),
    (r, [e, ds]) => (r && r.f
      ? collaudo(e.p, r.f, lentiPer(e.p, r.f), r.prima, { gravi: ds.filter((d) => (r.f.chiusi || []).includes(d.chiave)) }).then((vs) => ({ e, ds, f: r.f, vs }))
      : { e, ds, f: null, vs: [null] }))
  aperti = restano
  for (const r of rifatti) {
    if (!r || !r.f || r.vs.some((v) => !v)) {
      aperti.push(...((r && r.ds) || []).map((d) => ({ ...d, perche: "correzione non consegnata o non collaudata" })))
      continue
    }
    r.e.f = unisci(r.e.f, r.f)
    // Un grave mandato alla correzione e' chiuso SOLO se la squadra lo mette fra i chiusi E il collaudo
    // regge. Nei parziali (e' quello che il prompt le chiede quando non ci riesce) o taciuto, resta
    // aperto: il collaudo guarda il delta della correzione, che puo' reggere senza aver toccato il grave.
    // Prima qui non si confrontava niente, e il pacchetto dei soldi usciva «regge» col grave sparito.
    const chiusiOra = new Set(r.f.chiusi || [])
    for (const d of r.ds) {
      if (chiusiOra.has(d.chiave)) continue
      const parz = (r.f.parziali || []).find((x) => x && x.chiave === d.chiave)
      aperti.push({ ...d, perche: "la correzione " + giro + " non l'ha chiuso: " + (parz ? String(parz.perche || "parziale, senza perche'") : "non e' fra i chiusi che ha dichiarato") })
    }
    for (const v of r.vs) {
      const nati = smista(v.difetti, r.e.p.chiave, "collaudo correzione " + giro).map((d) => ({ ...d, chiave: "nato|" + chiaveD(d), pacchetto: r.e.p.chiave }))
      aperti.push(...nati)
      // Un regge:false che ha gia' nominato il suo grave e' QUEL grave, non un secondo: costruirne
      // un altro dal «perche» raddoppiava il conto (titoli diversi, il filtro dei doppioni non li vede).
      if (!v.regge && !nati.length) {
        const titolo = v.perche || "il collaudo della correzione ha bocciato"
        aperti.push({ titolo, dove: (r.e.f.file_toccati || [])[0] || r.e.p.chiave, gravita: "grave", nato_dal_lotto: true, chiave: "nato|" + slug(r.e.p.chiave) + "|" + slug(titolo), pacchetto: r.e.p.chiave })
      }
    }
  }
  // Due lenti che vedono lo stesso grave sono UN grave: senza questo filtro il giro dopo lo
  // correggerebbe due volte, e il conto dei gravi aperti per Nicola raddoppierebbe.
  const giaAperti = new Set()
  aperti = aperti.filter((d) => !giaAperti.has(chiaveD(d)) && giaAperti.add(chiaveD(d)))
}

// Un pacchetto con un grave nato ancora aperto sul suo ramo non «regge»: l'AD non lo ricuce. Se il
// padrone non si sa, il grave e' su uno dei rami che il suo revisore ha guardato: si fermano tutti.
for (const d of aperti) {
  const e = padroneDi(d)
  if (e) {
    if (e.stato === "regge") e.stato = "fermo: grave nato ancora aperto sul ramo"
    continue
  }
  d.fermati = ok.filter((x) => !d.wts || d.wts.includes(wtDiE(x))).map((x) => x.p.chiave)
  for (const x of ok) {
    if (x.stato === "regge" && d.fermati.includes(x.p.chiave)) x.stato = "fermo: grave nato senza padrone nel gruppo del suo revisore («" + String(d.titolo).slice(0, 80) + "»)"
  }
}

// ── il risultato: compatto, perche' rientra nel contesto dell'AD che lo ricuce ─────────────────
const pacchetti = tutti.map((e) => {
  const f = e.f || {}
  const proprie = new Set(e.p.difetti.map((d) => d.chiave))
  const chiusi = (f.chiusi || []).filter((k) => proprie.has(k))
  const dichiarate = new Set([...chiusi, ...(f.parziali || []).map((x) => x.chiave)])
  const mute = [...proprie].filter((k) => !dichiarate.has(k)).map((k) => ({ chiave: k, perche: "la squadra non l'ha dichiarato ne' chiuso ne' parziale" }))
  // Una chiave che il piano non ha non chiude niente nel registro: si mostra, non si conta.
  const sconosciute = (f.chiusi || []).filter((k) => !proprie.has(k) && !String(k).startsWith("nato|"))
  const voce = { pacchetto: e.p.chiave, rischio: e.p.rischio, stato: e.stato, ramo: f.ramo || null, worktree: f.worktree || null, commit: f.commit || null, chiusi, parziali: (f.parziali || []).filter((x) => proprie.has(x.chiave)).concat(mute) }
  if (sconosciute.length) voce.chiavi_sconosciute = sconosciute
  if (e.motivi) voce.motivi = e.motivi
  return voce
})
const giaVisti = new Set()
const registroUnico = registro
  .filter((d) => !giaVisti.has(chiaveD(d)) && giaVisti.add(chiaveD(d)))
  .map((d) => ({ titolo: d.titolo, gravita: d.gravita, dove: d.dove, prova: d.prova, nato_dal_lotto: !!d.nato_dal_lotto, pacchetto: d.pacchetto, fonte: d.fonte }))

// I gravi nati nel collaudo che il loro pacchetto si porta dietro fermandosi (il ramo e' gia' fermo:
// qui servono perche' Nicola li veda, e perche' chiedi_a_nicola non dipenda solo dal conto dei fermi).
const graviCollaudo = tutti.flatMap((e) => e.gravi || [])
const perche = []
if (graviCollaudo.length) perche.push(graviCollaudo.length + " gravi nati nel collaudo ancora aperti (" + unione([], graviCollaudo.map((d) => d.pacchetto)).join(", ") + "): il loro ramo e' fermo")
if (aperti.length) perche.push(aperti.length + " gravi nati ancora aperti dopo " + giro + " giri di correzione: semplificare il fix o rinviare il pacchetto?")
if (fermi.length) perche.push(fermi.length + " pacchetti su " + tutti.length + " fermi prima del riesame (" + fermi.map((e) => e.p.chiave).join(", ") + ")")
if (scoperti.length) perche.push("riesame non concluso su " + scoperti.length + " lenti (" + scoperti.map((s) => s.lente + ": " + s.perche).join("; ").slice(0, 400) + "): quei pacchetti non hanno avuto la rete")
if (saltati.length) perche.push("tetto raggiunto: " + saltati.length + " passi non partiti (" + saltati.slice(0, 6).join(", ") + ")")
if (perche.length) log("Mi fermo e chiedo a Nicola: " + perche.join(" · "))

const RUN = (typeof workflow === "object" && workflow && (workflow.runId || workflow.id)) || "<runId>"
return {
  ondata: ONDATA,
  piano: SCHEDE.piano || null,
  base: BASE,
  agenti: { usati, tetto: MAX_AGENTI, saltati, caduti },
  pacchetti,
  fermi: fermi.map((e) => ({ pacchetto: e.p.chiave, stato: e.stato, motivi: e.motivi || [] })),
  gravi_aperti: graviCollaudo.map((d) => ({ titolo: d.titolo, dove: d.dove, gravita: d.gravita, pacchetto: d.pacchetto, fermati: [d.pacchetto], perche: d.perche || null, non_verificato: false }))
    .concat(aperti.map((d) => ({ titolo: d.titolo, dove: d.dove, gravita: d.gravita, pacchetto: (padroneDi(d) || { p: {} }).p.chiave || null, fermati: d.fermati, perche: d.perche || null, non_verificato: !!d.non_verificato }))),
  riesame_non_concluso: scoperti.map((s) => ({ lente: s.lente, perche: s.perche })),
  registro: registroUnico, // minori e preesistenti: lo scrive l'AD nel registro del sito
  smontati,
  chiedi_a_nicola: perche.length > 0,
  motivo: perche.length ? perche.join(" · ") : null,
  poi: [
    "Ricuci i rami dei pacchetti che reggono e lancia npm run verify UNA volta nel repo del sito",
    "node cervello/radiografia-in-corsa.mjs --repo <sito>",
    "Misura il run: node cervello/conto-token.mjs --workflow " + RUN,
  ],
}
