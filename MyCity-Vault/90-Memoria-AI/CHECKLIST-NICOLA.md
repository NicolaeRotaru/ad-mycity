---
tipo: checklist-personale
destinatario: Nicola
fonte: AD digitale (rigenerata da AZIONI-IN-ATTESA + STATO · AR-030)
aggiornato: 2026-07-27 06:20
---

# ✅ Cose che devo fare io (Nicola)

> Solo ciò che richiede **te**: firme, merge, materiali, decisioni umane.
> Rigenerata dal giro 26/7 06:23, ricontrollata 27/7 06:20 (2 numeri corretti: countdown PI26, stallo North Star). Business ancora
> **invariato**: 1 ordine totale (annullato, 24/6), 0 pagati, verificato ora via query diretta.

---

## 🔴 URGENTE — 2 decisioni con l'orologio che corre

- [ ] 🔴 **Rispondi alle 3 domande sul bando PI26 (10.000€, scadenza 30/7 ore 16:00 — countdown vivo: node cervello/scadenzario-check.mjs)** — un valutatore indipendente ha bocciato la bozza attuale come «da sistemare»: ① abbiamo Partita IVA/entità giuridica registrata? ② abbiamo spese reali documentabili (fatture/preventivi) che coprano la soglia minima richiesta (5.000€ dal 1° maggio — il nostro burn da maggio è solo ~850€, molto sotto)? ③ abbiamo firma digitale attiva? Sportello a esaurimento: se la domanda risulta inammissibile dopo l'invio non si può correggere.
  → Card: `#pi26-conferma-ammissibilita`

- [ ] 🟡 **Conferma se il piano squadra (fratello + 2 amici non pagati) con nuova data metà agosto sostituisce la pausa negozi decisa il 23/7 (24/8-1/9)** — l'hai descritto in chat 26/7 ~01:10 («si parte appena riparo la bici e stampo i volantini») ma è una data diversa da quella già registrata come ufficiale. Senza il tuo ok non riscrivo il fatto in memoria.
  → Card: `#conferma-piano-squadra-ripresa-negozi`

---

## 🟡 MERGE PR in attesa (solo click "Approva" — nessun rischio per il sito)

- [ ] 🔴 Mergia PR #556 — causa vera dei doppioni "Nuova chat" (race di creazione, chiude alla radice un bug segnalato 6 volte)
- [ ] 🔴 Mergia PR #553
- [ ] 🔴 Mergia PR #552
- [ ] 🔴 Mergia PR #551
  → Righe #243–#246 in [[AZIONI-IN-ATTESA]]. Se qualcuna risulta già mergiata quando la apri, è normale: fai comunque un giro di verifica, la coda non si auto-pulisce sui merge fatti da GitHub direttamente.

> ⚠️ Ci sono anche ~11 righe di merge PR più vecchie (13–20/7, #126–#212) rimaste "in attesa" nella coda: quasi certamente già mergiate nella realtà (il codice è andato molto avanti da allora) ma mai segnate FATTO. Non serve che tu le riguardi una per una: è un lavoro di pulizia interno (housekeeping) che metto in coda per il prossimo giro tech, non una tua decisione.

---

## 🟡 ENV & INFRA (sblocchi macchina, 5 minuti ciascuno)

- [ ] 🟡 **Aggiungi `BURN_MENSILE_EUR=302` in `cervello/vps/.env`** → restart worker. Sblocca il calcolo del runway (fermo a "sconosciuto" da 248 giri — cassa Stripe letta, manca solo questo numero).
  → Card: `#burn-mensile-env`

- [ ] 🟡 **Accendi Telegram sul VPS** — `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` in `cervello/vps/.env` → restart worker → workflow n8n n.31 e n.41 in Active.
  → Card: `#accendi-intelligence-sveglia`

---

## 🟡 MATERIALI MANCANTI (procura — la macchina non li inventa)

- [ ] 🟡 **Logo e città Pane Quotidiano** — supervisione negozi segnala il gap (report `consegne/supervisione/2026-07-26-supervisione.md`): serve foto/logo reale e la città per completare la scheda negozio.

- [ ] 🟡 **Tazzina espresso PQ** — scegli candidato + prezzo vendita (Excelsa ~€31 set 6 vs Ginori ~€55).
  → Card: `#inserisci-tazzina-pq`

---

## ⏸️ IN PAUSA (rinvio negozi 24/8-1/9 — non richiedono azione ora)

**Ordine di prova su Pane Quotidiano** (`#ordine-test-pq`, unico sblocco diretto del North Star 0→1, ~10 min quando riparte) · post social PQ (domenica/lunedì/pioggia) · comunicato stampa PI26 · referral "porta un amico" · mail Hub Urbano
Comune+Unione Commercianti: tutti pronti in coda ma volutamente fermi finché non riparte l'inserimento negozi
(o finché non confermi la nuova data di metà agosto, vedi urgente sopra). Nessuna azione richiesta ora.

---

> ✅ Fatto nel giro 27/7 06:20: misurato l'esperimento EXP-002 (WhatsApp anchor, mancata — gate mai partito) ·
> corretto un bug di cristallizzazione nell'apprendimento (principio "mobile" ora anche a livello di codice,
> non solo scritto a parole) · ricontrollati i countdown PI26/North Star (erano rimasti a "4 giorni"/"32 giorni").
> ✅ Fatto nel giro 26/7 06:23: chiuso 1 debito di misura in calibrazione (previsione ordini_totali 10/7,
> confermata azzeccata via Supabase MCP live) · esteso il fix "pulisci tag generici" (card #240) a
> workflow/correzione-nicola · promossa a principio la regola "non riproporre Workflow in sessione headless".
> ✅ Fatto 20/7: demo eliminati (1 PQ · 5 prodotti) · PostHog verde VPS+Pannello · coerenza-fatti pricing bonificata.
> ✅ Fatto 23/7 (giro 11:20): OKR-Squadra target scaduto riscritto in gate · checklist rigenerata (AR-030).
