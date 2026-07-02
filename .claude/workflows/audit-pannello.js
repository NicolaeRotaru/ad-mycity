export const meta = {
  name: 'audit-pannello',
  description: 'Radiografia del PANNELLO (l\'app Next.js in pannello/): trova da sola i bug UX/runtime — navigazione/indietro, stato perso cambiando chat, liste stale, stati async, errori — ognuno verificato avversarialmente e col fix pronto da firmare',
  phases: [
    { title: 'Audit', detail: 'un revisore per dimensione: sola lettura su pannello/src' },
    { title: 'Verifica', detail: 'verifica avversariale: tieni solo i bug reali' },
  ],
}

// Schema dei bug del Pannello (allineato al cantiere-difetti/auto-radiografia: causa_radice + fix 🟡).
const FINDINGS = {
  type: 'object',
  properties: {
    dimensione: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          titolo: { type: 'string' },
          dove: { type: 'string', description: 'file:riga in pannello/src' },
          severita: { type: 'string', enum: ['bloccante', 'grave', 'minore'] },
          descrizione: { type: 'string', description: 'il sintomo per l\'utente (cosa vede/subisce Nicola)' },
          causa_radice: { type: 'string', description: 'la causa nel codice (5 perché), non il sintomo' },
          fix: { type: 'string', description: 'il fix concreto nel codice (file + cosa cambiare) — resta 🟡 da firmare' },
          impatto_crescita: { type: 'string', enum: ['alto', 'medio', 'basso'] },
        },
        required: ['titolo', 'dove', 'severita', 'descrizione', 'causa_radice', 'fix', 'impatto_crescita'],
      },
    },
  },
  required: ['dimensione', 'findings'],
}

// Il Pannello vive in QUESTO repo (l'AD), cartella pannello/. Sola lettura.
const REPO = '/home/user/ad-mycity'
const APP = `${REPO}/pannello/src`

const DIMS = [
  { key: 'navigazione-routing', focus: 'navigazione e cronologia: il tasto INDIETRO del browser porta altrove invece che alla vista precedente; cambio area/tab (lib/nav.ts vaiArea, useSearchParams, history.pushState/replaceState) che non aggiorna l\'URL o rompe back/forward; deep-link che non ripristina lo stato; router.push vs history. Cerca dove lo stato di navigazione vive solo in useState e non nell\'URL.' },
  { key: 'stato-persistenza', focus: 'perdita di stato: le RISPOSTE del worker/chat SPARISCONO cambiando conversazione o tab; stato tenuto in useState locale che si azzera al re-render/smontaggio invece che in memoria server (conversazioni) o storage; race tra fetch e cambio-chat che scrive la risposta nel contenitore sbagliato; messaggi non ricaricati quando torni su una chat.' },
  { key: 'freschezza-dati', focus: 'dati stale: liste (lavori, azioni "cose da fare", proposte) che NON si aggiornano in tempo reale; manca polling/refetch o revalidazione dopo un\'azione (approva/riprova/ignora); uso di cache invece di cache:no-store; elementi già fatti/spuntati che restano nella lista; nessun refresh dopo mutazione.' },
  { key: 'stati-async', focus: 'stati di caricamento/vuoto/errore: fetch senza gestione errore, spinner infiniti, nessun feedback dopo un clic, bottoni non disabilitati durante l\'invio (doppio clic → doppia azione), optimistic update che non fa rollback in caso di errore.' },
  { key: 'coerenza-azioni', focus: 'i flussi azione (api/approva, /riprova, /proposta, /decisione-ordine): idempotenza (doppia approvazione = due lavori?), la card riflette lo stato reale dopo l\'azione, dedup delle proposte già decise, gestione del caso "memoria non collegata".' },
  { key: 'robustezza-errori', focus: 'robustezza runtime: accessi a proprietà possibilmente null/undefined, JSON.parse senza try, date invalide (new Date su valore mancante → NaN), array .map su possibile undefined, chiavi React mancanti/duplicate, useEffect con dipendenze sbagliate che rifà fetch all\'infinito o mai.' },
  { key: 'accessibilita-mobile', focus: 'mobile/PWA/a11y: target touch troppo piccoli, gesture "indietro" su mobile, focus/tastiera, contrasto, testo che va fuori, safe-area, elementi non raggiungibili; il Pannello è usato da telefono.' },
  { key: 'performance-render', focus: 'performance percepita: re-render inutili, useMemo/useCallback con dipendenze sbagliate (es. dep [lavori] che legge window), liste lunghe senza virtualizzazione, refetch a cascata, componenti pesanti montati sempre.' },
]

phase('Audit')
const reviewed = await pipeline(
  DIMS,
  (d) => agent(
    `Sei il senior frontend più esperto del Pannello di Controllo dell'AD MyCity. Dimensione: "${d.focus}".
Analizza in SOLA LETTURA l'app Next.js in \`${APP}\` (usa Read/Grep/Glob; è React 18 + Next App Router + Tailwind, memoria via Supabase REST in lib/store.ts). ⛔ NON modificare nulla.
Cerca i BUG REALI della tua dimensione con precisione millimetrica. Per ognuno:
- titolo · dove (file:riga in pannello/src) · severità (bloccante/grave/minore) · descrizione = il SINTOMO per Nicola (cosa vede/subisce) · CAUSA RADICE nel codice (i 5 perché) · FIX concreto (quale file, cosa cambiare) · impatto_crescita.
Casi noti da Nicola da confermare/localizzare nel codice: (a) il tasto INDIETRO porta altrove; (b) le RISPOSTE del worker spariscono cambiando chat; (c) le liste non si aggiornano (cose già fatte restano). Se li trovi, indicane il file:riga e il fix.
SOLO bug che vedi davvero nei file, niente teoria. Se non trovi nulla, lista vuota.`,
    { label: `audit:${d.key}`, phase: 'Audit', schema: FINDINGS }
  ),
  (rev, d) => agent(
    `Sei un VERIFICATORE avversariale e scettico del Pannello. Ecco i bug segnalati per "${d.key}":
${JSON.stringify(rev?.findings || [], null, 2)}
Per CIASCUNO, controllalo nei file reali in \`${APP}\` (sola lettura) e TIENI SOLO quelli VERI: scarta i falsi positivi e ciò che non riesci a confermare col codice. Correggi severità/causa_radice/dove se sbagliati. In caso di dubbio, scarta.
Restituisci {dimensione:"${d.key}", findings:[...solo quelli confermati...]}.`,
    { label: `verifica:${d.key}`, phase: 'Verifica', schema: FINDINGS }
  )
)

// Sintesi nella forma del contratto (findings per dimensione + meta), pronta per il report + cantiere.
const PESO = { bloccante: 25, grave: 10, minore: 3 }
const dims = reviewed.filter(Boolean)
let totale = 0
const dimensioni = dims.map((d) => {
  const fs = d.findings || []
  const giu = fs.reduce((s, f) => s + (PESO[f.severita] || 0), 0)
  totale += giu
  const stato = fs.some((f) => f.severita === 'bloccante') ? 'critico' : fs.some((f) => f.severita === 'grave') ? 'attenzione' : 'ok'
  return { key: d.dimensione, voto: Math.max(0, 100 - giu), stato, findings: fs }
})
const tutti = dimensioni.flatMap((d) => d.findings)

return {
  voto_salute_pannello: Math.max(0, 100 - totale),
  dimensioni,
  totale_bug: tutti.length,
  bloccanti: tutti.filter((f) => f.severita === 'bloccante').length,
  gravi: tutti.filter((f) => f.severita === 'grave').length,
  top: tutti.sort((a, b) => (PESO[b.severita] || 0) - (PESO[a.severita] || 0)).slice(0, 12),
}
