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

## Variabili su Vercel

| Nome | Cosa | Obbligatoria |
|---|---|---|
| `CODICE_ACCESSO` | il codice che Nicola dà ai venditori (almeno 6 caratteri). Senza, il sito resta chiuso | sì |
| `N8N_SCHEDA_SEGRETO` | il segreto fra il sito e n8n: n8n ne conosce solo l'impronta sha256. Senza, il sito dà solo la prima scheda | sì |
| `N8N_SCHEDA_URL` | di serie `https://n8n-shdy.sliplane.app/webhook` | no |

Per cambiare il segreto: un valore nuovo su Vercel e la sua impronta nei flussi 14 e 14b
(`N8N/flussi/14-scheda-venditore/costruisci.mjs --impronta …`).

## Prove

```bash
npm install
npm test        # link, pulizia della risposta dell'AD, misura del sito, mappa libera, abbonamenti uguali al registro
npx next build
```

`test/fasce.test.mjs` diventa rossa se i prezzi qui e quelli del registro dei fatti si separano.

## Quanto costa

Ogni scheda è una corsa della routine «Chiedi all'AD»: il tetto è 40 al giorno e 25 all'ora, insieme agli
altri flussi. Lo stesso negozio lo stesso giorno torna dalla memoria, senza una corsa nuova.
OpenStreetMap: © OpenStreetMap contributors, licenza ODbL.
