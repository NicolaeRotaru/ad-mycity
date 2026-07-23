---
tipo: report-giornaliero
data: 2026-07-23 11:49
fonte: AD digitale
---

# Report giornaliero — 23 luglio 2026

## La situazione in una riga

Il business resta fermo agli stessi numeri da fine giugno (0 ordini pagati, stallo ~29 giorni), ma oggi la macchina ha chiuso 3 giorni di giri interrotti, riverificato i numeri diretti dal database e scoperto due guasti tecnici che vanno sistemati: il token GitHub del VPS (blocca tutte le PR di codice) e il token GitHub di Vercel (blocca l'aggiornamento in tempo reale del Pannello online).

---

## Numeri chiave (ore 11:49 — fonte: query diretta al database Supabase del marketplace)

| KPI | Valore | Var. vs ultimo report (20/7 21:07) |
|-----|--------|---------------------------|
| **Ordini pagati (North Star)** | **0** | = (stallo dal 24/6) |
| Ordini creati nel database | 1 (annullato, €19,05 COD, 24/6) | = |
| Ordini consegnati | 0 | = |
| **Clienti (buyer)** | **4** | = |
| Negozi live | **1** (Pane Quotidiano) | = |
| Prodotti disponibili | **5** | = |
| Stallo North Star | **~698h (~29,1 giorni)** | ▲ peggiorato di 3 giorni (nessun report nel weekend) |
| Cassa incassata (Stripe) | 0 € | = |
| Runway | non calcolabile (manca `BURN_MENSILE_EUR` nel `.env`, 215 giri senza) | = |
| Carrelli abbandonati reali (PQ) | 3 (€13,90 / €10 / €7,95, giugno-luglio) | trovati oggi, materia prima futura per il recupero carrelli |

Sensori: 8/9 canali dati ok (REST marketplace, Stripe, Resend, sito, Pannello, n8n, REST memoria, PostHog). Telegram non collegato (non è un guasto, è un canale mai attivato).

---

## Fatto oggi (🟢 e 🟡 completati)

**Verifica e messa in pari della macchina:**
- Dopo 3 giorni (21-23/7) in cui solo le sentinelle automatiche giravano senza chiudere un giro pieno, oggi è stato completato un giro pieno: numeri riverificati **con query diretta al database** (non più stima), coerenti con quanto già scritto.
- Trovati **3 carrelli abbandonati reali** su Pane Quotidiano — nessuna azione nuova (sono già "in attesa" del primo ordine per partire il recupero), ma sono dati veri pronti all'uso.
- Chiusi 3 vincoli interni della macchina: la lista di controllo per Nicola era ferma da 3 giorni ed è stata rigenerata; l'obiettivo North Star nel piano squadra aveva una data ormai scaduta (27/6) ed è stato riscritto senza data fissa fino al primo ordine; un esperimento sui post-pioggia è stato chiuso come "non misurabile" perché non è mai partita la pubblicazione collegata.

**Contenuti:**
- Preparato un nuovo post pronto alla pubblicazione: carosello **"Cosa c'è di buono questa settimana"** con i 5 prodotti reali di Pane Quotidiano (prezzi letti in diretta dal catalogo, nessun numero inventato) — proposto per oggi tra le 17:00 e le 19:00.
- Playbook automatici eseguiti senza trovare nulla di nuovo da segnalare: recupero carrelli, negozi in calo (anti-churn), recensioni mancanti sulle consegne.

**Guasti scoperti (da sistemare, vedi sotto):**
- Il token GitHub usato dal VPS per aprire le PR di codice non funziona più — nessuna modifica al Pannello o al sito può oggi diventare una PR.
- Il token GitHub usato da Vercel per leggere il Pannello online non funziona più — il Pannello che vedi da fuori resta sulla versione in cache invece di mostrare i briefing e i dati nuovi in tempo reale.
- Un branch di lavoro (`fix/ollama-fallback-quota`) contiene per errore una copia locale di un file con possibili chiavi (mai arrivata su GitHub perché il push era già bloccato dal primo guasto) — va ripulita prima di essere pubblicata.

---

## Da firmare — in ordine di urgenza

### 🔴 Business (soldi e visibilità)

1. **PI26** — Invia la domanda sul portale CCIAA (fondo perduto fino a 10.000€, scade **30/7 ore 16:00** — 7 giorni residui, non risulta ancora inviata).
2. **Pubblica il carosello** "Cosa c'è di buono questa settimana" (testo e visual pronti) — oggi 17:00-19:00.
3. **Ordine di prova su Pane Quotidiano** (~10 minuti) — è l'unica cosa che sblocca la North Star da 0 a 1 ordine pagato e a cascata il recupero carrelli, il referral e le recensioni, già tutti pronti e fermi in attesa di questo.

### 🟡 Guasti tecnici da sistemare

4. **Rigenera il token GitHub del VPS** (usato per aprire le PR di codice) — finché è rotto, nessun lavoro tech può diventare una PR da approvare.
5. **Rigenera il token GitHub su Vercel** (usato dal Pannello online) — finché è rotto, il Pannello che guardi da fuori mostra dati vecchi.
6. **Ripulisci il branch `fix/ollama-fallback-quota`** sul VPS: contiene un file con possibili chiavi che non deve mai arrivare su GitHub.

### 🟡 Altri sblocchi

7. **BURN_MENSILE_EUR** nel `.env` del VPS — senza questo numero il runway di cassa resta sconosciuto (215 giri senza poterlo calcolare).
8. **Via libera a devops-sre** per controllare nei log del VPS perché i giri automatici si sono interrotti per 3 giorni senza completarsi (sola lettura, nessun rischio).
9. Restano **47 azioni aperte** in coda (post social del weekend, referral "porta un amico", welcome email, WhatsApp ai 3 negozi target PI26, ecc.) — quasi tutte in attesa dello stesso sblocco: il primo ordine pagato su Pane Quotidiano.

---

## Segnali macchina (warn aperti)

| Segnale | Stato | Impatto |
|---------|-------|---------|
| north-star | warn | stallo 29,1 giorni (soglia d'allarme: 3) |
| chiusura-loop | warn | solo 31 dei 120 quaderni dei senior sono "vivi", 89 fermi da oltre 7 giorni |
| notifica-approvazioni | warn | 73 avvisi pronti non inviati (mancano le chiavi Telegram) |
| tick-coscienza-leggero | warn | tasso di avviso sopra soglia, esperimenti ok |
| cassa-runway | warn (invariato) | runway sconosciuto, manca il burn mensile in env |

Nessuno di questi blocca il lavoro immediato. Il vero collo di bottiglia resta lo stesso da settimane: **zero ordini pagati** + **PI26 da inviare**.

---

## Lezione del giorno

Oggi la macchina ha lavorato bene su sé stessa (giro rimesso in pari, dati riverificati, due guasti tecnici trovati prima che facessero danno), ma questo non sposta la North Star di un millimetro. Le uniche tre cose che contano restano umane: **l'ordine di prova**, **l'invio di PI26**, **la pubblicazione di un post**.

---

## Domani (24 luglio)

- Prima cosa: se PI26 non è ancora partita, è la priorità assoluta (6 giorni residui dopo oggi).
- Se il carosello è uscito ieri sera, controllare i risultati (click, eventuali ordini).
- Se l'ordine di prova è stato fatto, avviare a cascata welcome email, recensione e primo dato reale al negozio.

---

## Mano email

Resend è configurato e funzionante. **Invio automatico di questo report non eseguito:** la lista degli indirizzi autorizzati (`cervello/mani-allowlist.json`) è vuota — per regola di sicurezza (AR-103) questo forza la modalità "pronto ma non inviato" anche con i permessi attivi. Per ricevere questo report via email ogni giorno: aggiungi la tua email nella lista e dimmi "ok invio report".

---

*Generato da AD digitale MyCity — 2026-07-23 11:49 (Europe/Rome)*
