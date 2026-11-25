---
data: 2026-11-24 22:00
da: sessione «Ora del Gusto» (session_01R8112LZXxKxP66eMCZRgmr) → sua 2.0
---
# Passaggio: Ora del Gusto e servizi di MyCity con SDG

## In parole semplici
Questo foglio serve alla sessione nuova per riprendere il lavoro su Ora del Gusto senza rileggere la chat.
Il lavoro sul sito è tutto pubblicato: abbonamenti, modalità demo, menu «Servizi» e la pagina dell'abbonamento.
Per esempio, Ora del Gusto esiste già sul sito: non è ancora approvata, non si vede in vetrina e ha il suo link col codice.
Resta da unire la mycity#316, e restano quattro cose che può fare solo Nicola.

## Cosa cambia per te
Niente di nuovo sul sito vero finché Nicola non unisce la #316.
Le migrazioni dalla 703 alla 710 sono già sul database vero dal 24/11 alle 20:49.

## Cosa devi fare
Riparti da «In corso» qui sotto.
Prima di scrivere memoria su ad-mycity, leggi la riga «Memoria» nei dettagli tecnici.

## Cosa non ho verificato
Non ho visto dal vivo la pagina del preventivo col codice e la dashboard nuova.
Non ho provato un pagamento vero su Stripe.

---

## Dettagli tecnici

### Stato di adesso (24/11 21:20)
- Nel sito vero (main) c'è tutto. main era a 0311a90f.
  - mycity #309: abbonamenti e pagamento Stripe.
  - mycity #312: SDG nel marketplace, Ora del Gusto col link col codice, scheda da n8n.
  - mycity #313: modalità demo e prodotti prima dell'approvazione.
  - mycity #314: Servizi in alto nel menu, pagina /seller/abbonamento, riquadro in dashboard.
- Migrazioni 703→710 applicate in produzione il 24/11 alle 20:49. Le ha applicate l'AD su «Fai tu le migrazioni», col lavoro «Migrazioni a mano» (esecuzione 45471204952, tutti verdi).
- Verificato in sola lettura dopo le migrazioni:
  - Ora del Gusto (id 0de1905e-7000-4000-8000-000000000001) esiste, non approvata, fuori vetrina, con 1 link col codice;
  - SDG Agenzia è approvata, con 3 prodotti;
  - Pane Quotidiano resta visibile.
- Memoria: il ramo claude/stoic-goldberg-7abf66 è dentro la PR unica ad-mycity#994 (ramo ccr-d7a54140-hak4ez). Prima di scrivere: git fetch, poi merge di origin/ccr-d7a54140-hak4ez. Mai force-push. Dopo l'unione della #994 si riparte da main.

### Le decisioni di Nicola
Fonte: i fatti `sdg.abbonamenti` e `negozi.modalita-demo`, e la bacheca delle sessioni.
- Tre abbonamenti al mese: Base 300 €, Business 500 €, Premium 999 €. Sono servizi di MyCity realizzati da SDG Agenzia, che è il partner.
- Solo canone, nessun vincolo, 30 giorni di preavviso, primo mese a metà prezzo.
- Modalità demo: chi non ha pagato un abbonamento ai servizi non si vede sul marketplace. Vale solo per i negozi nuovi: Pane Quotidiano resta visibile.
- Il negozio in verifica può già preparare i prodotti.
- Nell'area negozio non si dice «preventivo» ma «Abbonamento».
- I servizi del menu sono quattro: Foto e video, Sito web, Gestione social, Abbonamento. La gestione social comprende Google Maps. In arrivo c'è «Analisi del business».
- La bozza del sito con l'IA la scrive l'AD, in un giro sul piano Max. Mai API pagate. Il sito non chiama mai il piano Max.
- L'analisi del business: Base una volta all'avvio, Business ogni mese, Premium ogni settimana più un incontro. Solo fonti gratuite.

### In corso
- mycity#316: Analisi del business e porta per la bozza del sito scritta dall'AD. Sessione session_01R8112NW9NV7N6jACcLJvG7. CI verde alle 21:40, da unire.
- Dopo l'unione della #316 servono tre cose:
  - la migrazione 711 sul database vero (l'AD la applica se Nicola dice «fai tu»);
  - il segreto AD_BOZZA_SITO_SEGRETO su Vercel;
  - facoltativa, la chiave PAGESPEED_API_KEY.
- Il formato della bozza è nella PR:
  - POST /api/agenzia/bozza-sito con l'intestazione x-mycity-segreto;
  - 4 sezioni (chi_siamo, cosa_offriamo, dove_siamo, contatti), ognuna fra 20 e 1200 caratteri, mai prezzi;
  - GET dà i negozi che aspettano, al massimo 25.
- Da costruire: lo script dell'AD in ad-mycity che legge il GET, scrive le bozze col piano Max e fa il POST.
- Sessione «n8n workflow per MyCity» (session_01R8112LTnRkPxboA6MyC4yC): scheda cliente e analisi. Porta lei a Nicola la decisione sul credito dell'API di Claude.

### Cosa resta a Nicola
1. Supabase Auth → Redirect URLs: permettere /seller/abbonamento.
2. Vercel: il segreto N8N_SCHEDA_CLIENTE_SEGRETO (il valore lo dà la sessione n8n) e il dominio per n8n.
3. Admin → «Preventivi col link»: mandare il link di Ora del Gusto solo al titolare. All'accettazione controllare l'email. Non approvare senza IBAN e documenti.
4. Tre decisioni:
   - il credito dell'API di Claude per n8n;
   - il nuovo prezzo della vetrina MyCity («MyCity cambia»);
   - le correzioni all'anteprima «esperienza» della vetrina.

### Debiti aperti
- Il resoconto mensile promesso nel preventivo: va costruito prima della fine del primo mese di un cliente.
- Residui del collaudo:
  - l'abbonamento Stripe resta «incomplete»: il riquadro invita a scegliere, ma la cassa rifiuta;
  - la scritta «Negozio attivo» compare anche in demo.
- Non verificato dal vivo: la pagina /preventivo/<codice>, la dashboard nuova, un pagamento vero su Stripe.

### Lezioni della giornata
- Prima di consegnare codice del sito: `next build`. Un route.ts non può esportare costanti.
- PR in pila: non arrivano in main da sole. Aprire su main, o ribasare dopo ogni unione.
- Quando una richiesta tocca MyCity e SDG insieme, chiedere subito di chi è ogni pezzo.
