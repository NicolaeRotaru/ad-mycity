---
tipo: report-giornaliero
data: 2026-07-28 21:15
fonte: AD digitale
---

# Report giornaliero — 28 luglio 2026

## La situazione in una riga

Business **fermo esattamente come ieri e come da 34 giorni** — **0 ordini pagati**, stallo dall'unico ordine di test del 24/6, coerente con la pausa negozi fino al 24/8-1/9. Giornata quasi tutta fatta di **riconferme**: **15 passaggi di giro** (tutti richiesti in chat da Nicola), tutti con lo stesso esito — nessun numero di business è cambiato. Un solo fatto nuovo, di conferma: Nicola ha chiuso la domanda sull'ordine di test («l'ho rimandato a settembre», nessuna eccezione). L'orologio più urgente resta **PI26: scade tra ~1,8 giorni (30/7 ore 16:00)**, ancora ferma in attesa di 3 risposte da Nicola — è la cosa che rischia di più di sfuggire.

---

## Numeri chiave (ore 21:15 — verificati ora via Supabase, dati live)

| KPI | Valore | Var. vs ieri |
|-----|--------|---------------------|
| **Ordini pagati (North Star)** | **0** | = |
| Ordini creati nel database | 1 (annullato, €19,05 COD, 24/6) — dato di test, escluso dai conteggi reali | = |
| Ordini consegnati | 0 | = |
| **Clienti iscritti** | **7** (4 buyer, 1 seller, 1 rider, 1 admin) — 0 nuovi oggi | = |
| Negozi live/approvati | **1** (Pane Quotidiano) | = |
| Prodotti pubblicati | **5** | = |
| Recensioni | 0 | = |
| Carrelli abbandonati | 3 | = |
| Incasso pagato | **0 €** | = |
| Payout versati ai negozi | **0 €** | = |
| Stallo North Star | **34-35 giorni** dall'ultimo ordine (24/6) | +1 |
| Notifiche in coda non inviate | **84** (mancano le chiavi Telegram) | = |
| Cantiere difetti macchina | **162 aperti / 109 chiusi** | invariato da ieri sera (nessun lotto nuovo oggi) |
| Azioni in coda da firmare | **86** (invariata) | = |

Nessun numero di *business* è cambiato: coerente con la decisione di Nicola del 23/7, l'inserimento negozi resta rinviato al 24/8-1/9.

---

## Cosa è successo oggi

**Il giorno più "ripetitivo" delle ultime settimane: 15 passaggi di giro, tutti richiesti esplicitamente da Nicola in chat (06:20 → 20:21), tutti con lo stesso esito di partenza — business invariato.** Ogni passaggio ha riverificato dal vivo (Supabase) gli stessi numeri (1 ordine annullato, 0 pagati, 7 profili, 5 prodotti, 0 recensioni), ha ricontrollato la coerenza dei fatti (`coerenza-fatti.mjs`, sempre exit 0, 20 fatti, 0 cacce aperte) e ha applicato la strategia snella per giri ripetuti a stato invariato (niente ri-analisi delle 15 fasi, niente nuovi 🟡/🔴) invece di rigenerare ogni volta la stessa analisi da zero.

**Due cose non puramente ripetitive:**
- **10:20 — root cause chiusa su un timer della macchina.** Il contatore che misura "quanto tempo passa tra un giro pieno e l'altro" (`delta-gate.json`) era fermo dal giorno prima perché il comando che lo aggiorna non aveva il permesso per girare da solo. Sistemato a mano, il timer ha ripreso a camminare da solo.
- **15:56 — Nicola ha chiuso una domanda aperta:** l'ordine di prova su Pane Quotidiano (serviva per collaudare pagamento→fornaio→consegna) resta congelato fino a settembre insieme al resto, **nessuna eccezione**. Significa che il primo giorno di attività a settembre sarà un giorno di collaudo, non di vendita vera.

Nessun lavoro sul codice del sito oggi (l'ultimo lotto tech, l'ottavo, è di ieri sera 27/7 22:35 — PR #575 già mergiata). Nessuna azione nuova verso il marketplace: la pausa decisa da Nicola il 23/7 resta rispettata.

**Segnale della macchina da tenere d'occhio, non bloccante:** `notifica-approvazioni` in warning (84 notifiche di approvazione non inviate, mancano le chiavi Telegram — invariato da giorni); `watch-main` segnala "errore" ma verificato che **zero commit del server restano non pubblicati** — falso allarme di soglia, non un buco reale.

---

## Da firmare — in ordine di urgenza

### 🔴 Con orologio reale

1. **PI26 (bando CCIAA, fino a 10.000€ a fondo perduto)** — **scade 30/7 ore 16:00, restano ~1,8 giorni.** Servono ancora le tue 3 risposte (P.IVA/forma giuridica sì-no, spese reali documentabili sì-no e quanto, firma digitale attiva sì-no). Card `#pi26-conferma-ammissibilita` — è la cosa che rischia di più di scadere senza risposta.

### 🟡 Da decidere/mergiare

2. **Vercel Authentication sul Pannello** (30 secondi tuoi) — chiude 2 difetti insieme (AR-226, AR-112): chi ha solo il link può ancora entrare nel Pannello senza serratura.
3. **Conferma se il "piano squadra" (fratello + 2 amici non pagati, inserimento negozi da metà agosto) sostituisce la pausa fissata al 24/8-1/9** — chiesto più volte, ancora senza risposta. Card `#conferma-piano-squadra-ripresa-negozi`.
4. **Decidi cosa fare dei 162 difetti aperti nel cantiere** — a questo volume non è più una lista leggibile a colpo d'occhio; card `#radiografia-triage-cantiere` propone un criterio di priorità (impatto sulla crescita, non ordine di scoperta).
5. Il resto della coda (post social, referral, welcome email, whatsapp prospect, ~80 righe) resta **in pausa** per la decisione del 23/7 — non la ripropongo finché non riparte quella finestra (24/8-1/9).

---

## Cosa ho imparato oggi (per non ripeterlo)

- **15 richieste identiche di "fai un giro" in un giorno solo, tutte a stato invariato, sono normali quando il business è congelato per decisione esplicita di Nicola** — il rischio non è "non fare abbastanza analisi", è ripetere lo stesso lavoro 15 volte producendo rumore invece di segnale. La strategia snella (conferma invarianza + cita il playbook, niente ri-analisi da zero) ha tenuto la giornata leggibile invece che 15 briefing identici da 2.000 parole.
- **Un timer della macchina che sembra "rotto" spesso è solo un permesso mancante, non un bug logico** — vale la pena controllare prima cosa impedisce la scrittura piuttosto che riprogettare il meccanismo.

---

*Numeri confermati ora (21:15) via query dirette su Supabase (fonte di verità) — coerenti con tutti i 15 passaggi di oggi, nessuna variazione reale del business. Mano email (Resend) non risulta collegata per invio autonomo — nessuna email è stata inviata a Nicola, il report resta solo su file.*
