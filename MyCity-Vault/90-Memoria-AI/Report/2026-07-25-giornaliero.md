---
tipo: report-giornaliero
data: 2026-07-25 21:15
fonte: AD digitale
---

# Report giornaliero — 25 luglio 2026

## La situazione in una riga

Il business resta fermo esattamente agli stessi numeri di ieri (**0 ordini pagati**, stallo **31 giorni** dall'unico ordine di test del 24/6), ma oggi è la giornata in cui il **bug delle chat duplicate** — segnalato per la 6ª volta, dopo due fix precedenti (#531/#532) che coprivano solo metà del problema — è stato finalmente chiuso alla radice: non era un doppio-tap, ma una corsa (race condition) nella creazione della chat sul server. Il fix vero è pronto (**PR #556**), in attesa della tua firma. Oltre a questo, giornata fitta di piccole rifiniture al Pannello (9 PR aperte o mergiate sul Cantiere/menu). L'orologio più urgente resta **PI26: scade tra 5 giorni (30/7 ore 16:00)**, ancora ferma in attesa delle 3 conferme di ammissibilità.

---

## Numeri chiave (ore 21:15 — fonte: query dirette su Supabase, tabelle `orders`/`profiles`/`stripe_event_log`, verificate ora)

| KPI | Valore | Var. vs ieri |
|-----|--------|---------------------|
| **Ordini pagati (North Star)** | **0** | = |
| Ordini creati nel database | 1 (annullato, €19,05 COD, 24/6) — dato di test, escluso dai conteggi reali | = |
| Ordini consegnati | 0 | = |
| **Clienti iscritti** | **7** (4 buyer, 1 seller, 1 rider, 1 admin) | = |
| Negozi live/approvati | **1** (Pane Quotidiano) | = |
| Incasso pagato (Stripe) | **0 €** — Stripe Connect non ancora attivo per Pane Quotidiano (`charges_enabled=false`) | = |
| Payout versati ai negozi | **0 €** | = |
| Stallo North Star | **31 giorni** dall'ultimo ordine (24/6) | +1 |
| Sensore PostHog | non configurato (scelta esplicita di Nicola, non un guasto) | = |
| Notifiche in coda non inviate | **82** (mancano le chiavi Telegram) | dato di contesto |

Nessun numero di business è cambiato oggi: coerente con la decisione di Nicola del 23/7, l'inserimento negozi resta rinviato al 24/8-1/9; il lavoro di oggi è stato tutto tecnico, sul Pannello e sull'AD stessa.

---

## Cosa è successo oggi

**Sera (~20:14-20:24) — trovata la causa VERA dei doppioni in chat, 6ª segnalazione sul tema.** Nicola ha rimandato lo screenshot dei doppioni (coppie di messaggi con lo stesso timestamp esatto), stavolta DOPO che i due fix precedenti (#531 lock anti-doppio-tap, #532 lock condiviso Assistente+widget) erano già mergiati. Rileggendo l'architettura si è trovato che il vero bug non è mai stato il doppio-tap: quando parte una chat nuova, il primo messaggio fa una scrittura di creazione sul server; se un secondo invio arriva prima che quella scrittura torni indietro, anche lui pensa "nessuna chat ancora" e ne crea una seconda — due righe reali. In più, la mini-chat del video-live/schermo condiviso mandava messaggi senza NESSUN blocco, un punto mai censito prima. **Fix (PR #556):** il blocco ora vive sull'operazione di creazione stessa (chi arriva mentre è in corso aspetta quella, indipendentemente da quale pulsante l'ha avviata) — protegge anche punti non ancora scoperti. `tsc --noEmit` pulito, non verificato dal vivo nel browser (sessione headless, come sempre in questa modalità).

**Giornata — 9 fix consecutivi al Pannello, tutti piccoli, su richiesta diretta di Nicola in chat:** ordinamento dei difetti chiusi per data più recente (#550, MERGIATA), aggiunta della data di chiusura accanto a ogni difetto (#551), le card dei difetti aperti nel Cantiere trasformate in un accordion chiuso di default invece di un muro di testo (#552), "Salute onesta" e "Utilizzo senior" spostate solo nel tab Andamento (#553), la voce "Worker" nel menu che apriva erroneamente una scheda nuova del browser riportata a restare nella pagina (#554), lo script di pulizia che non lascia più file di scarto nel repo (#555). Più due chiusure di difetti tecnici interni: AR-123 (visto succedere e spento) e AR-156 (i 5 test del Pannello girano tutti).

**Segnali della macchina — 3 avvisi in warning, non bloccanti:** `notifica-approvazioni` (82 notifiche non inviate per chiavi Telegram mancanti — nota, non nuova), `tick-coscienza-leggero` e `freschezza-segnali` (8 guardiani senza battito recente).

---

## Da firmare — in ordine di urgenza

### 🔴 Con orologio reale

1. **PI26 (bando CCIAA, 10.000€)** — **scade 30/7 ore 16:00, mancano 5 giorni.** Restano da confermare le 3 cose di ammissibilità (spesa minima vs burn reale ~302€/m, forma giuridica/P.IVA, documenti di spesa) prima di poter inviare. Card `#pi26-conferma-ammissibilita`, ancora la cosa più urgente sul tavolo.

### 🟡 Tecnico

2. **Mergia PR #556** — il fix vero (e definitivo, per come è costruito) dei doppioni in chat: lock sulla creazione, non sui punti di invio. Card #246.
3. **6 PR minori aperte sul Pannello, tutte con `tsc` pulito, non ancora provate dal vivo nel browser:** #551 (data chiusura difetti), #552 (accordion difetti aperti), #553 (Salute onesta/Utilizzo senior in Andamento), #554 (Worker resta in-page), più le card collegate #549 e i fix guardiani proposti dalla review di ieri (`#auto-riscrittura-git-pr-esito`).
4. **`#merge-pausa-post-merge-worker`** — il fix "aspetta 3 minuti dopo un merge" è live ma non basta secondo la prova diretta di Nicola; resta da decidere se allargare la pausa a ogni scrittura su main.
5. Il resto della coda (post social, referral, welcome email, whatsapp prospect, ecc.) resta **in pausa** per la decisione di Nicola del 23/7 (niente spinte commerciali prima del 24/8-1/9) — non la ripropongo finché non riparte quella finestra.

---

## Cosa ho imparato oggi (per non ripeterlo)

- Un fix che chiude un "doppio-tap" locale (lock a livello di bottone/istanza UI) non chiude la classe di bug se la vera causa è una corsa asincrona nella CREAZIONE della risorsa lato server: per bug "duplicato creato due volte" il fix va cercato al confine della creazione (la chiamata che scrive la riga), non moltiplicando i lock sui punti di ingresso — e va fatto un grep di TUTTE le chiamate alla funzione di invio prima di dichiarare coperte "tutte le superfici" (oggi ne è saltata fuori una nuova, la mini-chat video-live, mai censita nei due fix precedenti).

---

*Numeri verificati ora via query dirette su Supabase (tabelle `orders`, `profiles`, `stripe_event_log`). Mano email (Resend) non risulta collegata per invio autonomo — nessuna email è stata inviata a Nicola, il report resta solo su file. Coerenza-fatti: ✅ memoria coerente, nessuna copia vecchia nei file vivi.*
