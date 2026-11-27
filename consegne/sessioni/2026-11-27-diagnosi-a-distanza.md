---
data: 2026-11-27 01:40
da: AD (session_01R8112Mc8k7RTxo6DHqsxJN) → sessione «Diagnosi a distanza»
---
# Passaggio: la diagnosi gratuita, per iscrivere le attività senza andarci

## In parole semplici
Nicola vuole che un'attività si iscriva a MyCity senza che lui ci vada di persona.
La strada scelta il 27/11 alle 01:40 è una pagina pubblica: la «diagnosi gratuita».
Il titolare scrive il nome della sua attività e in circa un minuto vede cosa ha, cosa gli manca e quanto costa.
Per esempio: «La Dolce Dispensa, via Bianchi 27: 12 prodotti senza foto, ultimo post tre mesi fa».
Poi preme «Mi interessa», si iscrive dal telefono, e Nicola lo chiama.

## Cosa cambia per te
Costruisci tu la pagina, in un ramo di NicolaeRotaru/mycity, con la PR. La unisce Nicola.

## Cosa devi fare
Prima le scelte, poi il codice: porta a Nicola le domande aperte qui sotto, poi costruisci.

## Cosa non ho verificato
Non ho provato lo strumento degli agenti dal vivo: gli manca `N8N_SCHEDA_SEGRETO` su Vercel.
Non so quante lettere servono per un'iscrizione: non abbiamo misure nostre.

---

## Dettagli tecnici

### Le scelte di Nicola (27/11 01:40)
- Il percorso, tutto a distanza: richiamo → diagnosi → «Mi interessa» → `/sell` già compilato → preventivo accettato dal link → documenti e IBAN in dashboard → telefonata o videochiamata di 15 minuti → pagamento.
- Pagamento: **contanti al primo servizio**, ritirati da chi va comunque sul posto (per esempio scattiDG per le foto). Fatto `sdg.pagamento`.
- Il richiamo: **lettera con QR** e **pubblicità su Facebook e Instagram**. Partono solo con la firma di Nicola, perché spendono soldi e arrivano a persone vere. Qui serve solo che la pagina li sappia ricevere.
- Lavoro in una sessione separata: questa.

### Cosa costruire (proposta dell'AD, da confermare con Nicola dove c'è ❓)
1. Pagina pubblica, per esempio `/diagnosi`: un campo «nome dell'attività o link di Google Maps».
2. Motore: riusa `lib/agenti/*`, cioè `risolviLink`, `cercaOsm`, `misuraSito`/`indovinaSito`, `primaScheda`, `avviaLavoro` (flussi n8n 14/14b, «Chiedi all'AD»). Rotta di partenza: `app/api/agente/analizza/route.ts`, oggi protetta da `conAgente` (20 l'ora per agente).
3. Al titolare va **solo la parte per il cliente**: punti forti, cosa manca col numero vero, abbonamenti coi prezzi del listino (`agenzia.listino`). Mai le note interne del venditore (obiezioni, domande, potenziale).
4. «Mi interessa» apre `/sell` con nome, indirizzo e tipo già scritti. Niente account creati dalla pagina della diagnosi (lezione del collaudo del 26/11 22:15 sul link d'invito).
5. Codice nel link del QR (per esempio `/diagnosi?c=…`): ogni lettera ha il suo codice, così si conta lettera → visita → «Mi interessa» → iscrizione. È la misura del primo risultato.
6. Protezione: la parte dell'AD consuma il piano Max di Nicola. Tetto per indirizzo IP e tetto al giorno; risultato tenuto per attività (niente seconda analisi della stessa); sopra il tetto, solo la prima parte veloce.
7. Testo sul pagamento: «si paga in contanti al primo servizio». L'interruttore del pagamento online resta spento (`lib/agenzia/pagamento-servizi.ts`).

### Domande aperte per Nicola (❓)
- La diagnosi si vede subito, o arriva per email a chi la chiede? Con l'email si sa chi l'ha chiesta e si ha il suo consenso a essere ricontattato.
- Chi compra solo social o sito non ha un servizio sul posto: chi ritira i contanti?
- Accordo scritto con scattiDG su chi tiene i contanti e chi dà la ricevuta. Tocca soldi e contratti: si prepara, la firma è di Nicola.

### Regole che valgono qui
- 🟡 codice in un ramo + PR su main di mycity; mai unire, mai deploy. Migrazioni solo col pulsante «Migrazioni a mano» e la firma di Nicola.
- `npm run verify` verde; collaudo indipendente (chi costruisce non collauda); il form dei contatti passa dal reparto legale-privacy (informativa + consenso).
- Niente messaggi WhatsApp o email a freddo ai negozi: rompe il paletto «WhatsApp mai spam» e serve il consenso.
- Non toccare il lavoro aperto «chi paga in contanti non esce dalla demo»: lo tiene un'altra sessione dell'AD (`LAVORO-APERTO.md`, voce del 26/11 16:25).
- Scrivi a Nicola come dice `cervello/scrittura-umana.md` in ad-mycity: «Il punto adesso», poi «Cosa non ho verificato», codici solo sotto «Dettagli tecnici».
- Memoria: a fine lavoro aggiorna questa pagina e la voce in `LAVORO-APERTO.md` di ad-mycity, con PR su main.
