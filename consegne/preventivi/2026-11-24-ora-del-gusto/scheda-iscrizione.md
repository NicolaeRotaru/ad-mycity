---
data: 2026-11-24 02:20
negozio: Ora del Gusto
stato: dati da raccogliere — NON ancora nel database del sito
---
# Iscrizione di Ora del Gusto su MyCity

## In parole semplici
Ora del Gusto è una pasticceria-bar e sarà il primo negozio col listino nuovo a tre abbonamenti. Per metterlo sul sito servono i dati qui sotto. Appena li hai, l'iscrizione si fa in circa 20 minuti.

## Cosa cambia per te
Finché questi campi sono vuoti il negozio non può stare sul sito: sarebbe una vetrina senza titolare, senza indirizzo e senza modo di ricevere i soldi. Per esempio: senza l'IBAN, il lunedì non possiamo fargli il bonifico dei contanti incassati per lui.

## Cosa devi fare
Alla visita fai compilare i campi segnati ❗. Poi dai il via alla card «Iscrivi Ora del Gusto sul sito» nel Pannello.

## Cosa non ho verificato
Su internet Ora del Gusto non compare: indirizzo, titolare e categoria esatta li so solo da te. Non ho scritto niente nel database del sito, perché lì scrivo solo con la tua firma.

## I dati da raccogliere
| Campo | Valore | Serve per |
|---|---|---|
| ❗ Ragione sociale e nome del negozio | Ora del Gusto | vetrina, fattura |
| ❗ Titolare (nome e cognome) | | contratto, verifica identità |
| ❗ Partita IVA | | fattura, contratto |
| ❗ Indirizzo del negozio | | consegne entro 10 km, mappa |
| ❗ Telefono WhatsApp del negozio | | anteprime da approvare, «Contatta il negozio» |
| ❗ Email del titolare | | accesso al sito e avvisi d'ordine |
| ❗ IBAN | | bonifico del lunedì dei contanti |
| Orari di apertura e giorno di chiusura | | fasce di consegna mostrate al cliente |
| Categoria sul sito | Pasticceria · Bar | ricerca e vetrina |
| Primi prodotti (foto + prezzo + allergeni confermati dal titolare) | | catalogo iniziale |
| PEC o codice destinatario | | fattura elettronica |

## Come si iscrive, al via di Nicola
1. Nicola crea l'account venditore con l'email del titolare (registrazione venditore dal sito).
2. L'AD prepara la vetrina e le prime schede dalle foto; prezzi e allergeni li conferma il titolare.
3. Lo staff approva il negozio dal pannello admin del sito (oggi l'approvazione la può dare solo lo staff).
4. Avvio del collegamento per i pagamenti con carta, quando la carta è accesa.

## Dettagli tecnici
- Preventivo: è di SDG Agenzia, non di MyCity (Nicola, 24/11 03:30): `preventivo.html` e `preventivo-sdg-ora-del-gusto.pdf` qui accanto. Su MyCity il negozio si iscrive e basta.
- Prezzi: `registro-fatti.json` → `sdg.abbonamenti` (SDG); MyCity resta `pricing.abbonamento`.
