---
tipo: report-giornaliero
data: 2026-07-23 21:10
fonte: AD digitale
---

# Report giornaliero — 23 luglio 2026 (aggiornamento sera — sostituisce la versione delle 17:10)

## La situazione in una riga

Il business resta fermo agli stessi numeri da fine giugno (0 ordini pagati, stallo 29 giorni), ma oggi è stata una giornata pesante sul fronte tecnico: **2 PR mergiate** che chiudono 3 bug reali della chat del Pannello (risposta doppia, chat doppia su "Nuova chat", worker sovrapposto), e **Nicola ha preso 2 decisioni strategiche** — rimandare l'inserimento dei negozi al 24 agosto-1° settembre (per concentrarsi prima su Pannello/AD/worker/marketplace) e sospendere i costi discrezionali fino a 5.000 €/mese di utile netto. Resta un solo vero orologio che corre: **PI26, scade tra 7 giorni (30/7)**.

---

## Numeri chiave (ore 21:07 — fonte: SQL diretto sul database Supabase del marketplace, verificato ora)

| KPI | Valore | Var. vs oggi 17:06 |
|-----|--------|---------------------|
| **Ordini pagati (North Star)** | **0** | = (stallo dal 24/6) |
| Ordini creati nel database | 1 (annullato, €19,05 COD, 24/6) | = |
| Ordini consegnati | 0 | = |
| **Clienti (buyer)** | **4** | = |
| Negozi live/approvati | **1** (Pane Quotidiano) | = |
| Prodotti a catalogo | **5** | = |
| Incasso pagato (Stripe) | **0 €** | = |
| Stallo North Star | **~29 giorni** dall'ultimo ordine (24/6) | = |
| Prospect negozi in pipeline (`merchants_leads`) | **407** | dato di contesto, non lavorato oggi (rinvio negozi) |
| Runway | non calcolabile — `BURN_MENSILE_EUR` ancora assente nel `.env` VPS (burn reale noto: **~302 €/m**, confermato da Nicola) | = |

Nessun numero di business è cambiato oggi: il lavoro di oggi è stato quasi interamente tecnico/decisionale, non commerciale (per scelta, vedi sotto).

---

## Cosa è successo oggi (giornata intera)

**Mattina — sbloccati 2 guasti tecnici vecchi di settimane.** Token GitHub del VPS e di Vercel rigenerati e verificati da Nicola: la macchina torna ad aprire PR e il Pannello online torna ad aggiornarsi (card #219, #221 chiuse).

**Pomeriggio (~18:30-19:00) — 3 bug chat segnalati da Nicola.** Risposta doppia (cambio chat mentre l'AD sta ancora rispondendo), scroll che salta, menu che non si chiude col click fuori. L'agente frontend-dev delegato in background si è bloccato 2 volte senza completare — l'AD ha smesso di aspettarlo e ha scritto la patch da sé (dedup in `lavori-gruppo.ts`/`page.tsx`, verificato con `tsc`+test). **PR #514** aperta (scroll lasciato intatto di proposito: già 6 tentativi falliti in passato).

**Sera (20:00-20:52) — trovate e chiuse 2 varianti nuove dello stesso problema.**
- **PR #516** (mergiata): il dedup della PR #514 copriva solo bolle adiacenti, non tutta la conversazione — esteso a tutto l'array.
- **PR #517** (mergiata): 2 bug distinti — "Nuova chat" apriva 2 chat invece di una, e il pannello worker si sovrapponeva alla chat invece di restare finestra a sé.

**Decisioni di Nicola (registrate in `registro-fatti.json`, guardiano coerenza pulito):**
1. **Inserimento negozi rimandato al 24 agosto - 1° settembre 2026** (sostituisce la data 13/7, mai confermata). Fino ad allora: niente check-in/spinte commerciali su negozi, priorità = perfezionare Pannello/AD/worker/marketplace.
2. **Costi discrezionali sospesi fino a ~5.000 €/mese di utile netto**: PEC, commercialista, notaio, consulente del lavoro, RC, app store restano fermi finché non serve un obbligo esterno. Referral alzato 10€→15€, punti fedeltà 1%→2% (margine su abuso/cannibalizzazione).

**Coda ripulita di conseguenza:** 12 azioni negozi/marketing marcate "⏸ in pausa" nella coda (post social, referral, WhatsApp anchor, welcome email) — non cancellate, solo in attesa della finestra di ripartenza. Le azioni tecniche restano attive.

---

## Da firmare — in ordine di urgenza

### 🔴 Con orologio reale

1. **PI26 (bando CCIAA)** — Invia la domanda sul portale CCIAA (fondo perduto fino a 10.000€). **Scade 30/7 ore 16:00 — 7 giorni residui**, non risulta ancora inviata. È l'unica cosa nella coda con una vera scadenza esterna, non è in pausa (il rinvio negozi non tocca i bandi).

### 🟡 Tecnico — coerente con la priorità "stabilizza Pannello/AD/worker" decisa oggi

2. **BURN_MENSILE_EUR** nel `.env` del VPS — valore già confermato da Nicola (~302 €/m), manca solo scriverlo per sbloccare il calcolo del runway.
3. PR aperte in coda da mergiare: **cadenza housekeeping coda**, **PR chat cross-device (finestra 24h)**, **blocco auto-ricarica vecchia chat**, **ricalcolo punteggio auto-coscienza il venerdì** — nessuna urgente, ma sono lavoro tecnico già pronto, in linea con la priorità di oggi.
4. **75 avvisi macchina non inviati** (manca la chiave Telegram) — non bloccante, ma il numero cresce ogni giorno che passa senza collegare il canale.

### ⏸ In pausa (non toccare fino al 24/8-1/9)

Carosello social, referral "porta un amico", comunicato stampa PI26 alle testate, WhatsApp ai 3 negozi target, welcome email, ordine di prova su Pane Quotidiano — tutte pronte, restano ferme per scelta di Nicola.

---

## Segnali macchina (warn aperti)

| Segnale | Stato | Impatto |
|---------|-------|---------|
| north-star | warn | stallo 29,1 giorni (soglia d'allarme: 3) — atteso, i negozi sono in pausa |
| notifica-approvazioni | warn | 75 avvisi pronti non inviati (mancano le chiavi Telegram) |
| tick-coscienza-leggero | warn | tasso di avviso sopra soglia, esperimenti ok |
| freschezza-segnali | warn | 8 guardiani senza battito fresco (max 60min): manca sensori, manca allinea-scan-canvas |
| cassa-runway | warn (invariato) | runway sconosciuto, manca solo scrivere il burn mensile in env |

Nessuno di questi blocca il lavoro. Il collo di bottiglia commerciale (0 ordini pagati) è oggi una scelta consapevole di Nicola, non un blocco da risolvere.

---

## Lezione del giorno

Due lezioni operative, entrambe confermate da un tentativo reale in giornata, non da un'ipotesi:
1. **Un agente delegato in background che si blocca 2 volte va sostituito con lavoro diretto, non rilanciato una terza volta alla cieca.** Ha funzionato oggi sui bug chat: l'AD ha letto il codice da sé, verificato con `tsc`+test, aperto le PR. Resta un rischio aperto non ancora corretto: l'agente in background lavorava senza isolamento (stessa copia file della sessione principale) — andata bene per caso.
2. **Il tool `Workflow` (orchestrazione multi-agente) non si può usare in questa sessione headless** — si blocca su un gate di conferma non disponibile qui, verificato con un tentativo reale. L'alternativa (più chiamate `Agent` in parallelo, poi sintesi) resta il metodo valido.

---

## Domani (24 luglio)

- **Priorità assoluta: PI26**, se non ancora inviata (6 giorni residui dopo oggi).
- Verificare che le PR #516/#517 mergiate oggi non abbiano introdotto regressioni (controllo rapido della chat dal vivo).
- Continuare la linea "stabilità tecnica prima del business" decisa oggi: prossimo candidato naturale è chiudere le PR tecniche già pronte in coda (housekeeping, cross-device, auto-ricarica).
- Non toccare check-in/marketing sui negozi fino al 24/8-1/9 (decisione di oggi).

---

## Mano email

Resend è configurato (sensore verde), ma **l'invio automatico di questo report non è avvenuto**: la allowlist dei destinatari (`cervello/mani-allowlist.json` → campo `email`) è ancora vuota — per la regola di sicurezza AR-103 questo blocca l'invio anche con i permessi attivi (fail-closed voluto, non un guasto). Per riceverlo via email ogni giorno: aggiungi la tua email nella allowlist e dimmi "ok invio report".

---

*Generato da AD digitale MyCity — 2026-07-23 21:10 (Europe/Rome)*
