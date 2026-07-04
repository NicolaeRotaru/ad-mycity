---
tipo: audit-pannello
titolo: "Radiografia del Pannello — bug UX/runtime (parziale + primi fix)"
data: 2026-07-02 14:15
autore: AD digitale (workflow audit-pannello)
stato: PARZIALE — 2 dimensioni su 8 completate (limite di sessione, reset 14:30 UTC). Le altre 6 vanno rilanciate.
colore: 🟢 analisi · 🟡 i fix nel codice (firma Nicola via PR)
---

# 🩻 Radiografia del Pannello

## Onestà sul risultato
Il workflow `audit-pannello` è stato **interrotto dal limite di sessione**: hanno completato **2 dimensioni su 8**
(navigazione + persistenza-stato), le altre 6 (freschezza-dati, coerenza-azioni, robustezza-errori,
accessibilità-mobile, performance-render, stati-async) sono da **rilanciare dopo il reset**. Il "voto 100/0 bug"
grezzo era un artefatto del crash: i risultati veri sono stati recuperati dal journal. Le 2 dimensioni fatte
coprivano però i 3 bug segnalati da Nicola.

## ✅ Corretti in questa PR (5)
| Bug | Dove | Fix |
|---|---|---|
| Tasto INDIETRO esce dal Pannello (caso a) | `page.tsx` nav solo useState | Cronologia browser: `pushState` su cambio vista + `popstate` che ripristina l'area (senza toccare URL/hash). |
| Card "Auto-analisi" → pagina bianca (anche dopo refresh) | `page.tsx` onVaiA + restore | Mappa `auto-coscienza→cervello` nel prop Plancia e nel ripristino da localStorage. |
| Risposte spariscono cambiando chat (caso b) | `page.tsx:694` rispondiInChat | Niente più loop all'indietro che sovrascriveva risposte vecchie: guarda solo l'ultimo messaggio → accoda, mai sovrascrivere turni precedenti. |
| Liste "Azioni" non si aggiornano (caso c) | `Azioni.tsx:155` fetch solo al mount | Polling 60s + refresh su focus/visibilitychange (contorno estratto in `caricaContorno`). |
| Tab Radiografia rimbalza su Auto-coscienza | `MacchinaArea.tsx:22` hash invertito | Invertito l'ordine dei rami: "radiografia" prima di "auto-". |

> ⚠️ Il fix del tasto INDIETRO è un cambio di comportamento della navigazione: **da testare sull'anteprima**
> (Back tra le aree + le card della Plancia) prima di considerarlo chiuso.

## 🟡 Trovati ma NON ancora corretti (da fare)
Alti/gravi (dalla dimensione persistenza-stato):
- **Conversazioni con id non-server non salvate su Supabase** — `store.ts:222` upsertConversazione fa solo PATCH; le chat aperte da "Lavori" o nate offline spariscono al refresh. *Fix:* PATCH con `return=representation`; se 0 righe → INSERT.
- **PWA/nuova scheda: chat resta su "sto pensando…" per sempre** — `page.tsx` pendenti in sessionStorage ma thread in localStorage; disallineamento. *Fix:* pendenti in localStorage + ricostruzione dai lavori in_attesa/in_corso al mount.
- **"Parla con questa casella" volatile** — `ParlaCasella.tsx` stato solo in useState; scambio perso cambiando scheda o col refresh. *Fix:* salvare conversazione prima dell'attesa + coda pendenti persistente.
Minori:
- Deep-link con hash ignorati all'avvio; hash "stantio" riapplicato a ogni rientro; proposte agganciate all'INDICE (verdetto sulla card sbagliata quando il briefing si rinnova); elenco Conversazioni non ricaricato; side-effect dentro updater di setState (StrictMode → doppio POST); mergeThread fonde per contenuto (perde messaggi identici / ordine).

## ⏳ Non ancora analizzato (6 dimensioni — rilanciare `audit-pannello` dopo il reset)
freschezza-dati · coerenza-azioni · robustezza-errori · accessibilità-mobile · performance-render · stati-async.

## Nota di metodo
La causa radice comune dei bug di navigazione è: **il Pannello non ha mai modellato la navigazione sull'URL**
(nato come dashboard mono-pagina con stato in useState + localStorage + hash come comandi one-shot). I fix di
questa PR sono mirati e a basso rischio; una bonifica strutturale (un vero router URL↔stato) risolverebbe alla
radice indietro + deep-link + hash-stantio insieme — proposta per un secondo giro.
