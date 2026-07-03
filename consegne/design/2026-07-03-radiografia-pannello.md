---
tipo: audit-pannello
titolo: "🩻 Radiografia del PANNELLO — profonda (7 dimensioni, workflow audit-pannello)"
data: 2026-07-03 14:07
autore: AD digitale (workflow audit-pannello, 16/16 agenti, 0 errori)
stato: "COMPLETO — 30 bug (1 bloccante · 11 gravi · 18 minori), ognuno passato dalla verifica avversariale."
colore: 🟢 analisi · 🟡 i fix nel codice (firma Nicola)
---

# 🩻 Radiografia del Pannello — 3 luglio 2026

Girata sul codice attuale (dopo i fix di navigazione già mergiati). 7 dimensioni × (revisore + verificatore avversariale). **30 bug confermati**. Radice comune di metà dei bug di navigazione: **manca un vero router URL↔stato** (due canali di cronologia incompatibili — `pushState({vista})` senza URL e `location.hash` — che si ingoiano il tasto INDIETRO).

## 🔴 BLOCCANTE — il più urgente (tocca azioni reali 🔴)

**1. «Annulla» azzera lo stato di un'azione GIÀ ESEGUITA → ri-approvando parte una SECONDA volta.**
`api/azioni-pronte/route.ts:45-52` (branch annulla) + guardia idempotenza `:60-69` · UI `Azioni.tsx:751-752` · invio reale `mani.ts:74,101`.
Nicola approva (merge PR / email): parte davvero. La card mostra «annulla» **anche sulle azioni già eseguite**. Cliccando «annulla» torna «da firmare»; ri-approvando l'azione REALE **riparte** → doppio merge / doppia email, nessun avviso.
*Radice:* il branch «annulla» scrive `azione:{id}=''` **incondizionatamente** (anche su stato `fatta/coda`) e la guardia si fida solo di quello.
*Fix (🟡):* consentire «annulla» solo se stato è `''`/`rifiutata`; se eseguito → **409 «già eseguita, non annullabile»**; nascondere «annulla» sulle azioni `fatta/simulata/coda`. In più chiave `azione:{id}:eseguita=1` che «annulla» non tocca.

## 🟠 GRAVI (11)

### Navigazione (il tasto INDIETRO)
2. **INDIETRO fa clic a vuoto e poi esce dal Pannello** (`page.tsx:1225-1242` + scrittori hash Memoria/Azioni/Lavori/Storico/Macchina/AutoCoscienza). Due canali di cronologia scollegati: le schede usano `location.hash` (state=null), le aree `pushState({vista})`. Il back atterra su voci-fantasma e non fa nulla. *Fix:* unificare su `pushState({vista, sub})` e leggere sub nel popstate centrale.
3. **Un clic dalla Plancia crea DUE voci di cronologia** → INDIETRO va premuto due volte (`Plancia.tsx:84-87,115,146`): fa `location.hash` **e** `onVaiA`→`setVista`→pushState. *Fix:* usare solo il canale `vaiArea(vista, anchor, sub)`.
4. **INDIETRO dopo le schede dell'Assistente = clic morto** (`page.tsx:1650` + `1220-1223` + `1226-1239`): l'hash stale non viene mai azzerato nel pushState della vista. *Fix:* passare l'URL senza hash (`location.pathname+search`) o gestire le schede con `pushState({vista,sub})`.

### Stato & dati
5. **La risposta del box «Parla con questa casella» sparisce** cambiando sezione e non torna più (`ParlaCasella.tsx:14,3,19-40`): `msgs` in `useState` locale, **nessun `useEffect` di reload**; al rimontaggio riparte da `[]`. La risposta è salvata in Conversazioni ma il box non la rilegge. *Fix:* `useEffect` di montaggio che ricarica la conversazione per titolo/convId, o stato sollevato in un context. **(impatto ALTO)**
6. **Le decisioni sulle azioni-TABELLA sono agganciate al NUMERO di riga** (posizionale), non al contenuto (`azioni-attesa.ts:120,124` · `azioni-pronte.ts:33`). Dopo un giro che rinumera la coda, un'azione nuova eredita lo stato «già fatta/rifiutata» di una vecchia (e il guard `giaFatta` ne blocca l'approvazione). Il fix a hash-di-contenuto (`idSezione`) è stato messo **solo** ai blocchi-sezione, mai al parser tabella. *Fix:* `idSezione(data,reparto,titolo)` anche per le righe-tabella + cleanup chiavi `azione:*` orfane. **(impatto ALTO — è il «cose già fatte che restano»)**
7. **L'auto-refresh a 60s / focus cancella approvazioni e spunte non salvate** (`Azioni.tsx:182-193,148,161,232-243,337-345`): con memoria non collegata, `setAzioni`/`setTodo` sovrascrivono lo stato ottimistico. Le proposte sono protette da un merge locale, azioni e todo **no**. *Fix:* Set locale di id decisi/spuntati riapplicato dentro `setAzioni/setTodo`. **(impatto ALTO)**
8. **Approva/Rifiuta: update ottimistico senza rollback né errore** (`Azioni.tsx:232-243`, catch vuoto). Se la POST fallisce, la card resta «In coda» all'infinito: Nicola crede di aver messo in coda un'azione 🔴 mai registrata. *Fix:* salvare stato precedente e ripristinarlo nel catch con «⚠️ Non riuscito».

### Mobile (il Pannello si usa da telefono)
9. **Su telefono sparisce lo stato del Worker/AD** (Worker ON/pausa/spento) (`page.tsx:1450,1452` `hidden sm:inline-flex`): sotto 640px resta solo logo+tema. *Fix:* pallino di stato sempre visibile su mobile.
10. **Pulsanti Invia e Microfono della chat troppo bassi** (~20-26px, `page.tsx:1788,1805,1816`, `items-end` + solo padding orizzontale). *Fix:* `min-h-[44px]` o `items-stretch`.

### Performance
11. **Doppio polling simultaneo di `/api/lavori`** a ogni risposta in chat (`page.tsx:988-1007` + `1408-1432`): `attendiRisposta` ridondante col poller unico → 2 fetch/s + doppio re-render sul percorso più caldo. *Fix:* rimuovere `attendiRisposta`, lasciare il poller unico.

## 🔸 MINORI (18, sintesi per area)
- **Navigazione:** hash stale che sporca l'URL al cambio area (URL/deep-link sbagliati); la vista non è nell'URL (deep-link non ripristina l'area, la scheda interna non torna al default); chiavi React a indice `key={i}` nella lista messaggi (bolle che si scambiano il contenuto).
- **Stato:** `convId` del box in `useState` → ogni riapertura crea una conversazione nuova (doppioni in Conversazioni).
- **Azioni:** guardia idempotenza non atomica (TOCTOU) + nessun busy-lock sul click Approva/Rifiuta; «Riprova» resta in errore dopo refresh e il 409 non è mostrato (2 findings); «Ignora» proposta senza memoria collegata finge successo e rispunta al refresh; refresh a 60s che può cancellare la decisione ottimistica mentre la POST è in volo.
- **Stati async:** «Genera report» e «Aggiorna analisi» Intelligence senza disable durante l'invio → doppio clic = doppia accodatura; Controllo AD (Pausa/Budget) senza `catch` → fallimento silenzioso sullo stop dell'AD; bozza «Parla» svuotata prima dell'invio e persa in errore.
- **Performance:** `setLavori` con array sempre nuovo → re-render globale ogni 2-8s; `useMemo` con dip `[lavori]` che legge `localStorage`; listener globale `mycity:vai` smontato/rimontato a ogni tick (manca `lavoriRef`).
- **Mobile:** `.nav-tab` sotto i 44px (`globals.css:156`).

## 📋 Sequenza consigliata (i fix restano 🟡, firma tua)
1. **Batch A — sicurezza azioni reali (bloccante):** #1 «Annulla», poi #6 id-tabella-stabile, poi idempotenza atomica + busy-lock. *Toccano soldi/merge: prima di tutto.*
2. **Batch B — navigazione:** unificare il router URL↔stato (chiude #2, #3, #4 e 3 minori insieme).
3. **Batch C — persistenza:** #5 ParlaCasella reload, #7 merge azioni/todo.
4. **Batch D — mobile/perf:** #9, #10, #11 + minori.

> Nota: il bloccante #1 e i gravi #6/#7 sono la stessa famiglia («lo stato mostrato non riflette lo stato reale dopo un'azione»): il fix id-stabile + guardia idempotente li chiude in blocco.
