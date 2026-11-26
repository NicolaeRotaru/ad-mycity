# Scheda del cliente — il sito del venditore

Il venditore incolla il link di Google Maps dell'attività in cui sta per entrare, preme **Analizza** e legge
la **scheda del cliente**: la stessa forma della scheda che scrive `cervello/scheda-cliente.mjs`
(skill `scheda-da-foto`), solo per lui, mai per il titolare. La proposta per il titolare non sta qui:
va nel preventivo.

## Come fa a essere veloce

| Tempo | Chi | Cosa |
|---|---|---|
| 1-4 secondi | il programma (questo sito) | legge il link (solo l'indirizzo, mai la pagina di Google), chiede a OpenStreetMap indirizzo e concorrenti vicini, prova gli indirizzi probabili del sito (`ladolcedispensa.it`…), apre il sito e prende i profili social che collega, aggiunge le obiezioni e gli avvisi fissi |
| circa 40 secondi | l'AD col piano Max | cerca social, recensioni e giornali, sceglie l'abbonamento con le tabelle firmate, scrive gancio, punti, domande e obiezioni. Passa da n8n: flusso `14 · Scheda per il venditore` → `90 · Chiedi all'AD`. **Nessuna API di IA a pagamento** |

Prova vera del 26/11/2026 (La Dolce Dispensa): l'AD ha risposto in 37 secondi.

La risposta dell'AD passa sempre da `lib/scheda.ts → pulisci`: si scarta ogni frase con «nessuna
percentuale» (il 10% resta), ogni offerta con gioco o tabacco, ogni dato senza una fonte https; e quello che
il programma ha visto con i suoi occhi (il sito, i profili collegati) vale più degli estratti della ricerca.

## Gli account dei venditori

Ogni venditore entra con **la sua email e la sua password** (Nicola, 26/11/2026). Per iscriversi serve il
**codice d'invito** che dà Nicola: senza, chiunque potrebbe iscriversi e consumare le corse dell'AD.

- La password non si salva mai: si salva l'impronta scrypt, e a n8n arriva solo quella.
- Gli account stanno nella tabella n8n «Venditori della scheda» (flusso `14c`). Ogni scheda porta l'email di
  chi l'ha fatta, e ognuno vede e riapre solo le sue («Le tue ultime schede»).
- Otto password sbagliate di fila bloccano l'account per 15 minuti.
- **Sospendere un venditore:** nella tabella metti lo stato a `sospeso` (non entra e non fa partire l'AD).
- **Password dimenticata:** stato `reset`, poi il venditore si iscrive di nuovo con la stessa email e il codice.
- La sessione dura 30 giorni, in un cookie firmato con una chiave ricavata da `N8N_SCHEDA_SEGRETO`.

## Variabili su Vercel

| Nome | Cosa | Obbligatoria |
|---|---|---|
| `N8N_SCHEDA_SEGRETO` | il segreto fra il sito e n8n: n8n ne conosce solo l'impronta sha256. Senza, nessuno entra | sì |
| `CODICE_INVITO` | il codice che Nicola dà ai venditori per iscriversi (almeno 6 caratteri). Senza, nessuno si iscrive | sì |
| `N8N_SCHEDA_URL` | di serie `https://n8n-shdy.sliplane.app/webhook` | no |

Per cambiare il segreto: un valore nuovo su Vercel e la sua impronta nei flussi 14, 14b e 14c
(`N8N/flussi/14-scheda-venditore/costruisci.mjs --impronta …`). Cambiarlo fa uscire tutti i venditori.

## Prove

```bash
npm install
npm test        # account, link, paletti sulla risposta dell'AD, rete, misura del sito, mappa libera, abbonamenti, contratto con n8n
npx next build
```

`test/fasce.test.mjs` diventa rossa se i prezzi qui e quelli del registro dei fatti si separano.
`test/contratto-n8n.test.mjs` fa passare il corpo vero del sito dal nodo vero del flusso 14 (repo N8N accanto):
diventa rossa se il sito e n8n smettono di capirsi, come è successo il 26/11.

## Quanto costa

Ogni scheda è una corsa della routine «Chiedi all'AD»: il tetto è 40 al giorno e 25 all'ora, insieme agli
altri flussi. Lo stesso negozio lo stesso giorno torna dalla memoria, senza una corsa nuova.
OpenStreetMap: © OpenStreetMap contributors, licenza ODbL.
