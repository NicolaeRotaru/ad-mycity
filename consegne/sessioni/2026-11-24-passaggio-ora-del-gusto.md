---
data: 2026-11-24 22:00
da: sessione «Ora del Gusto» (session_01R8112LZXxKxP66eMCZRgmr) → sua 2.0
---
# Passaggio: Ora del Gusto e servizi di MyCity con SDG

## Stato di adesso (24/11 21:20)
- Nel sito vero (main) c'è tutto: mycity #309 (abbonamenti e pagamento Stripe), #312 (SDG nel marketplace, Ora del Gusto col link col codice, scheda da n8n), #313 (modalità demo e prodotti prima dell'approvazione), #314 (Servizi in alto nel menu, pagina /seller/abbonamento, riquadro in dashboard). main era a 0311a90f.
- Migrazioni 703→710 APPLICATE in produzione il 24/11 alle 20:49, dall'AD su «Fai tu le migrazioni» (lavoro «Migrazioni a mano», esecuzione 45471204952, tutti verdi). Verificato in sola lettura: Ora del Gusto (id 0de1905e-7000-4000-8000-000000000001) esiste, non approvata, fuori vetrina, 1 link col codice; SDG Agenzia approvata, 3 prodotti; Pane Quotidiano visibile.
- Memoria: il ramo claude/stoic-goldberg-7abf66 è dentro la PR unica ad-mycity#994 (ramo ccr-d7a54140-hak4ez). Prima di scrivere: git fetch + merge di origin/ccr-d7a54140-hak4ez, mai force-push; dopo l'unione della #994 si riparte da main.

## Le decisioni di Nicola (fonte: fatti `sdg.abbonamenti`, `negozi.modalita-demo`, bacheca sessioni)
- Tre abbonamenti Base 300 / Business 500 / Premium 999 €/mese: servizi di MyCity realizzati da SDG Agenzia (partner). Solo canone. Nessun vincolo, 30 giorni di preavviso, primo mese a metà.
- Modalità demo: chi non ha pagato un abbonamento ai servizi non si vede sul marketplace. Solo per i nuovi: Pane Quotidiano resta visibile. Il negozio in verifica può preparare i prodotti.
- Nell'area negozio non si dice «preventivo» ma «Abbonamento». Servizi: Foto e video, Sito web, Gestione social (con Google Maps), Abbonamento; in arrivo «Analisi del business».
- Bozza del sito con l'IA: la scrive l'AD in un giro sul piano Max. Mai API pagate, mai il sito che chiama il piano Max. Analisi: Base all'avvio, Business ogni mese, Premium ogni settimana + incontro. Solo fonti gratuite.

## In corso
- mycity#316 (Analisi del business + porta per la bozza del sito dall'AD), sessione session_01R8112NW9NV7N6jACcLJvG7: CI verde alle 21:40, da unire. Dopo: migrazione 711 (l'AD la applica se Nicola dice «fai tu»), segreto AD_BOZZA_SITO_SEGRETO su Vercel, PAGESPEED_API_KEY facoltativa. Formato della bozza nella PR: POST /api/agenzia/bozza-sito con x-mycity-segreto, 4 sezioni (chi_siamo, cosa_offriamo, dove_siamo, contatti) 20-1200 caratteri, mai prezzi; GET dà i negozi che aspettano (max 25). Da costruire: lo script dell'AD in ad-mycity che legge il GET, scrive le bozze col piano Max e fa il POST.
- Sessione «n8n workflow per MyCity» (session_01R8112LTnRkPxboA6MyC4yC): scheda cliente e analisi; porta lei a Nicola la decisione sul credito dell'API di Claude.

## Cosa resta a Nicola
1. Supabase Auth → Redirect URLs: permettere /seller/abbonamento.
2. Vercel: N8N_SCHEDA_CLIENTE_SEGRETO (valore dalla sessione n8n) e il dominio per n8n.
3. Admin → «Preventivi col link»: mandare il link di Ora del Gusto solo al titolare; all'accettazione controllare l'email, non approvare senza IBAN e documenti.
4. Decidere: credito API Claude per n8n; nuovo prezzo della vetrina MyCity («MyCity cambia»); correzioni all'anteprima della vetrina «esperienza».

## Debiti aperti
- Resoconto mensile promesso nel preventivo: da costruire prima della fine del primo mese di un cliente.
- Residui del collaudo: abbonamento Stripe «incomplete» (il riquadro invita a scegliere ma la cassa rifiuta); scritta «Negozio attivo» anche in demo.
- Non verificato dal vivo: pagina /preventivo/<codice>, dashboard nuova, un pagamento vero su Stripe.

## Lezioni della giornata
- Prima di consegnare codice del sito: `next build` (un route.ts non può esportare costanti).
- PR in pila: non arrivano in main da sole. Aprire su main o ribasare dopo ogni unione.
- Quando una richiesta tocca MyCity e SDG insieme, chiedere subito di chi è ogni pezzo.
