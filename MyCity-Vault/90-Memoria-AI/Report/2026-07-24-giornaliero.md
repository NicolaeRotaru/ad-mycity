---
tipo: report-giornaliero
data: 2026-07-24 21:10
fonte: AD digitale
---

# Report giornaliero — 24 luglio 2026

## La situazione in una riga

Il business resta fermo esattamente agli stessi numeri di ieri (0 ordini pagati, **stallo 30 giorni** dall'unico ordine di test del 24/6), ma oggi è stata un'altra giornata piena sul fronte tecnico: **review settimanale completa** (2 bloccanti su 3 chiusi, ma la bozza PI26 risulta NON pronta all'invio) e il **bug delle chat duplicate è tornato una 2ª volta** dopo un fix incompleto — causa vera trovata, PR #532 aperta e in attesa del tuo merge. L'orologio più urgente resta **PI26: scade tra 6 giorni (30/7 ore 16:00)** e non è ancora inviata.

---

## Numeri chiave (ore 21:07 — fonte: SQL diretto sul database Supabase del marketplace, verificato ora)

| KPI | Valore | Var. vs ieri |
|-----|--------|---------------------|
| **Ordini pagati (North Star)** | **0** | = |
| Ordini creati nel database | 1 (annullato, €19,05 COD, 24/6) | = |
| Ordini consegnati | 0 | = |
| **Clienti (buyer)** | **4** | = |
| Negozi live/approvati | **1** (Pane Quotidiano) | = |
| Prodotti a catalogo | **5** | = |
| Incasso pagato (Stripe) | **0 €** | = |
| Stallo North Star | **30 giorni** dall'ultimo ordine (24/6) | +1 |
| Prospect negozi in pipeline (`merchants_leads`) | **407** | = (in pausa, non lavorati) |
| Email in coda non ancora inviate | 12 | dato di contesto (chiave Telegram/Resend assenti) |
| Runway | non calcolabile — `BURN_MENSILE_EUR` ancora assente nel `.env` VPS (burn reale noto: **~302 €/m**) | = |

Nessun numero di business è cambiato oggi: come da decisione di Nicola (23/7), l'inserimento negozi resta rinviato al 24/8-1/9, il lavoro di oggi è stato tecnico e di controllo.

---

## Cosa è successo oggi

**Notte (00:12-00:47) — coda della sessione di ieri sul bug "deploy Vercel che sparisce".** Confermati mergiati i 2 fix bloccanti principali (PR #518 lock pausa + PR #521 pausa post-merge). Ma Nicola ha provato il Redeploy manuale e ha riportato **«mi cancella il deploy manuale»**: il fix delle 00:33 copriva solo il commit-di-log-dopo-un-proprio-merge, non qualsiasi scrittura recente su `main`. Proposta più ampia (silenzio di qualche minuto dopo OGNI scrittura su main) fatta a Nicola, non ancora applicata.

**Pomeriggio (16:20) — Review settimanale (17-24/7).** Radiografia completa: 2 bloccanti su 3 chiusi nelle ultime 24h. Il valutatore indipendente ha trovato che **la bozza della domanda PI26 (10.000€) NON è pronta all'invio**: mancano 3 verifiche di ammissibilità mai fatte (spesa minima vs burn reale, forma giuridica/P.IVA, documenti di spesa). Aggiornati i quaderni di apprendimento/auto-miglioramento e il cantiere difetti (+1: AR-154, rituale ESITO non rispettato sullo sprint Pannello 21-24/7).

**Sera (19:57-20:25) — il bug delle chat duplicate torna una 2ª volta.** PR #531 (lock anti-doppio-tap) era stata mergiata alle 19:57 come fix del doppione. Alle 20:03 Nicola manda uno screenshot: i doppioni ("Oiinn"/"Abc") ci sono ancora, DOPO il merge. Rileggendo l'architettura (non solo ri-lanciando `tsc` come prova) si è trovata la causa vera: la casella di scrittura chat è montata in **due punti contemporaneamente** (vista Assistente a pagina intera + widget flottante), ciascuna con un lock separato — bloccava un doppio tap sullo stesso bottone, non due caselle diverse che scrivono insieme. **Fix corretto: PR #532**, lock condiviso passato da `page.tsx` a entrambe le istanze, `tsc` pulito, diff verificato = solo i file del fix. **Non ancora verificato dal vivo nel browser** (sessione headless) — da provare dopo il merge aprendo Assistente + widget insieme.

---

## Da firmare — in ordine di urgenza

### 🔴 Con orologio reale

1. **PI26 (bando CCIAA, 10.000€)** — **scade 30/7 ore 16:00, mancano 6 giorni.** La review di oggi dice che la bozza NON è pronta: prima di inviarla vanno confermate 3 cose (spesa minima vs il burn reale ~302€/m, forma giuridica/P.IVA corretta, documenti di spesa da allegare). Card `#pi26-conferma-ammissibilita` in coda — è la cosa più urgente sul tavolo.

### 🟡 Tecnico

2. **Mergia PR #532** — il fix vero del doppione in chat (lock condiviso Assistente+widget). Card #237.
3. **`#auto-riscrittura-git-pr-esito`** — due piccoli fix ai guardiani della macchina (`git-pr.mjs`/`chiusura-loop.mjs`), proposti dalla review di oggi per chiudere un incidente ripetuto 3 volte.
4. **Pausa post-merge ancora insufficiente** (`#merge-pausa-post-merge-worker`) — il fix delle 00:33 non basta secondo la prova diretta di Nicola; serve decidere se allargare la pausa a ogni scrittura su main (costo: più latenza nell'aggiornamento del Pannello durante chat fitte).
5. Il resto della coda (post social, referral, welcome email, ecc.) resta **in pausa** per la decisione di Nicola del 23/7 (niente spinte commerciali prima del 24/8-1/9) — non ripropongo queste card finché non riparte quella finestra.

---

## Cosa ho imparato oggi (per non ripeterlo)

- Un bug che "torna" identico dopo un fix già mergiato non si chiude ridimostrando lo stesso tipo di verifica (`tsc` pulito): va riletta l'architettura attorno al bug (quante istanze del componente esistono, sono davvero mutuamente esclusive come il codice assume) prima di dichiararlo chiuso. Vale già per il caso di oggi (PR #531→#532) e resta scritto in `LEZIONI-CHAT.md`.
- Un fix "verificato" (tsc pulito, diff pulito) prova solo che il pezzo trovato è corretto, non che copre l'intera causa — soprattutto quando il bug si ripresenta con lo stesso tipo di screenshot del giro precedente.

---

*Numeri verificati ora via query diretta su Supabase (tabelle `orders`, `profiles`, `products`, `newsletter_subscribers`, `email_queue`). Coerenza-fatti: ✅ memoria coerente, nessuna copia vecchia nei file vivi.*
