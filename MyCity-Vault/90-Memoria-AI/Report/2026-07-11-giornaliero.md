---
tipo: report-giornaliero
data: 2026-07-11 22:29
fonte: AD digitale
---

# 📋 Report giornaliero — sabato 11 luglio 2026

> Generato alle 22:29 · fonte: STATO 18:00 + DECISIONI 11/7 + baseline REST (giro 08:30) + MCP live 7/7 00:29

---

## 📊 I numeri del giorno

| Indicatore | Valore | Nota |
|---|---|---|
| North Star (ordini consegnati reali) | **0** | invariato dal 24/6 |
| Stallo 1° ordine | **~443 ore** (≈ 18,5 giorni) | +24h vs ieri |
| Negozi reali attivi | **1** (Pane Quotidiano) | payout OFF |
| Negozi con payout attivo | **0** | payout-test sandbox da fare |
| Ordini creati | **1** (annullato) | #16 COD €19,05 del 24/6 — ANNULLATO |
| Ordini pagati / consegnati | **0** / **0** | il 1° ordine reale va creato ex-novo |
| Clienti buyer | **4** (0 nuovi in 7gg) | 23 profili totali |
| Prodotti disponibili PQ | **5** | status=available |
| Lead negozi nel DB | **407** (tutti to_contact) | shortlist 27 food con tel pronta |

> Fonte: baseline REST giro 08:30 + conferma MCP live 7/7 00:29 · MCP execute_sql non autorizzato in sessione → 0 numeri inventati.

---

## 🔧 Cosa è stato fatto oggi

### Pannello — 4 PR aperte o risolte

| PR | Cosa fa | Stato |
|---|---|---|
| #276 | Grafica "In coda" migliorata (3 livelli distinti: attivo/chat/storico) | ⏳ IN ATTESA merge Nicola |
| #274 | Chat con memoria sessioni precedenti (ultime 4 conversazioni iniettate) | ⏳ IN ATTESA merge — conflitto risolto |
| #270 | Fix caselle AutoCoscienza che mostravano "Errore: undefined" | ⏳ IN ATTESA merge Nicola |
| #269 | Area messaggi chat accorciata (h-36 → h-24) | ⏳ IN ATTESA merge Nicola |

### Diagnosi e risoluzioni

- **Causa radice chat che si perdono:** tabella `conversazioni` NON esiste nel DB Memoria — il Pannello ricade in browser-only a ogni ricarica indipendentemente dalle env var.
- **Allegati Pannello:** Nicola ha aggiunto `SUPABASE_URL` e `SUPABASE_SERVICE_KEY` su Vercel (15:55). Manca solo il Redeploy manuale.
- **Dossier 6 botteghe aggiornato:** rimosso riferimento al bando ER (CHIUSO 23/6), pitch sostituito con "retail −6,6% presenze Q2 + caldo estivo toglie clienti dalla strada".
- **Commit trigger Pannello pronto:** commit `4d37c741` su main locale (tocca pannello/.build-trigger) → manca solo il push per forzare il build Vercel.

### Logistica 13/7 — decisione critica

Nicola ha 1000€ vincolati a bollette/utenze/cibo → **avvio 13/7 BLOCCATO per mancanza bici elettrica** (~500€). Proposte attive:
1. ④ Deliveroo/JustEat 2 settimane (bici normale) → 300-500€ netti
2. ⑤ Vendere su Subito.it → 200-300€ in 3-7gg
3. ⑥ Noleggio mensile bici elettrica (40-70€/mese, parte subito)
4. ⑦ Accordo con PQ: loro il mezzo, MyCity la piattaforma, si dividono i primi incassi

**Decisione di Nicola: non ancora presa.** Data avvio INDEFINITA. Target 1° ordine = VEN 17/7 (invariato, dipende dalla soluzione logistica).

---

## ✅ Da firmare — priorità del fine settimana

### 🔴 Critici (senza questi il Pannello non funziona bene)

| # | Azione | Tempo stimato | Colore |
|---|---|---|---|
| #crea-tabella-conversazioni | Crea tabella `conversazioni` nel DB Memoria — le chat si perdono senza | 3 min su Supabase SQL Editor | 🔴 |
| #allegati-vercel-env | Redeploy manuale su Vercel (tab Deployments → Redeploy) dopo le 2 var già aggiunte | 1 min | 🔴 |

### 🟡 Merge PR (codice già scritto e verificato)

| # | PR | Cosa cambia per te |
|---|---|---|
| #pr-276-grafica-chat-coda | PR #276 | Capisci a colpo d'occhio cosa è lavoro attivo vs storico nella chat |
| #pr-274-memoria-chat | PR #274 | L'AD risponde autonomamente senza chiederti "l'hai già fatto?" |
| #pr-270-errori-undefined | PR #270 | Le caselle AutoCoscienza mostrano il testo vero degli errori |
| #pr-269-chat-height | PR #269 | La chat delle caselle è più compatta come hai chiesto |
| #sblocca-pannello | Push trigger build | Il Pannello su Vercel mostra tutte le modifiche degli ultimi giorni |

### 🟡 Coda storica (dalla settimana scorsa)

- **#pr-274-memoria-chat** — vedi sopra
- **#recensioni-trigger** — messaggio "grazie + recensione" automatico dopo ogni consegna (gated 1° ordine reale)
- **#checkin-pane-quotidiano** — dossier stampabile per la visita del 13/7 (se confermata)
- **#pr-5bloccanti** — PR #212 fix sicurezza: manca PAT con scope mycity (🟡 — serve creare PAT su GitHub)

---

## 🎯 Priorità per domani (domenica 12/7)

1. **Decidere la strada logistica** (opzione ④/⑤/⑥/⑦) → sblocca tutto il resto
2. **Creare tabella `conversazioni`** — 3 minuti, sblocca la memoria delle chat
3. **Redeploy Vercel** — 1 minuto, sblocca gli allegati
4. **Merge PR #274 + #276** — il Pannello diventa più chiaro e la chat diventa più autonoma
5. **Confermare visita PQ lunedì 13/7** o posticipare in base alla logistica

---

## 🧠 Segnali automazione da monitorare

| Segnale | Stato | Cosa fare |
|---|---|---|
| notifica-approvazioni | ⚠️ 33 notifiche NON inviate (chiavi Telegram mancanti) | Collegare Telegram quando disponibile |
| taste-file | ⚠️ 0 verdetti reali — LOG VUOTO | Avviare sessioni di valutazione contenuti |
| chiusura-loop | ⚠️ 12/43 quaderni vivi, 2 vuoti, 31 fermi >7gg | Revisione a fine settimana |
| chiusura-loop-gate | ⚠️ 5 reparti FATTO oggi, 2 senza ESITO | Aggiornare quaderni operazioni/marketing |

---

## 📌 Contesto — dove siamo nell'arco narrativo

MyCity è **tecnicamente pronta** (piattaforma LIVE, Sprint 1 sicurezza mergiato, Pannello operativo). Il collo di bottiglia è **puramente operativo**: il 1° ordine consegnato non è ancora avvenuto (18,5 giorni di stallo). La priorità assoluta è risolvere la logistica (bici), visitare le 6 botteghe food di persona e chiudere il 1° ordine reale entro VEN 17/7.

L'AD è pronto a supportare qualsiasi decisione logistica con materiali stampabili, pitch, dossier e coordinamento.

---

*La "mano" email (Resend) non è attiva — il report è disponibile solo nel Pannello e nel vault.*
