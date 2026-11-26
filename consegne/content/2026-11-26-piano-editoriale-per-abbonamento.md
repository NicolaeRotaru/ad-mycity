---
tipo: consegna
data: 2026-11-26 19:20
cliente: El Tropico Latino (tropico-latino), primo esempio del modello
reparto: content-social · marketing · direttore-creativo · seo · ads-performance · crm-lifecycle · influencer-partnership · pr-stampa · analista · finanza · legale-privacy
colore: verde il modello e il piano; rosso le quantità nuove delle fasce, che aspettano la firma di Nicola
---

# Il piano editoriale per abbonamento, provato sul Tropico Latino

> **In due righe.** Per vendere i tre abbonamenti serve un piano dei contenuti già su misura del cliente: questo è lo stampo, provato sul Tropico.
> Ogni fascia contiene tutta quella sotto; per un cliente nuovo basta scrivere il suo piano del mese, e un programma lo conta e lo controlla.

## In parole semplici
Il piano editoriale dice cosa esce, dove e quando: post, reel, storie, post su Google, messaggi WhatsApp, email, eventi.
Il locale è lo stesso in tutte le fasce, con la stessa voce. Cambia quanto facciamo e su quanti canali.
Un caso vero, il ristorante di via Mazzini a dicembre. Il Base dà 8 contenuti, 4 storie e 4 post su Google. Il Business arriva a 12 contenuti e 12 storie, con video girati nel locale, TikTok, WhatsApp, risposte alle recensioni e una mossa nuova al mese. Il Premium arriva a 20 contenuti e a una storia ogni sera di apertura, cioè 26. In più ha pubblicità gestita, due creator, una storia per i giornali, le aziende vicine e un evento.
Ripeto la regola più importante con altre parole: chi passa dal Base al Business non perde niente, si aggiunge solo lavoro.
Il Tropico gira sul Premium, senza pagare, come prova. Ogni contenuto porta lo strato da cui viene: a fine dicembre vediamo cosa ha reso ogni strato e decidiamo cosa mettere in ogni fascia.

## Cosa cambia per te
- Le fasce promettono più di oggi. Il preventivo sul sito diceva 8, 12 e 20 post: le quantità nuove sono nella pagina, voce per voce.
- Il Premium si presenta come «tutti i mestieri di un'agenzia completa»: 25 mestieri al lavoro sul locale. Il Base ne ha 8, il Business 16.
- Il resoconto al cliente parla di chiamate, indicazioni, messaggi e prenotazioni, mai di like. Per contare le prenotazioni, ogni canale avrà il suo link WhatsApp con una frase diversa.
- Per un cliente nuovo si scrive il suo piano del mese in un file. Il programma controlla che i numeri siano quelli promessi, che i prezzi siano nel menu e che niente esca nel giorno di chiusura.

## Cosa devi fare
- Dimmi chi paga sul Tropico le spese vere del Premium: il budget della pubblicità, circa 150 € a dicembre, e i costi della sera delle Posadas.
- Dimmi se firmi subito le quantità per chi paga, o se aspetti la pagella della prova, lunedì 4 gennaio. Io firmerei subito.
- Fai al titolare le 9 domande della pagina: orari delle feste, menu per i gruppi, sera delle Posadas, Capodanno, numero WhatsApp giusto.
- Dimmi quanto costa una sessione di scattiDG, di sole foto e di foto e video: serve per il margine vero.

## Cosa non ho verificato
- I profili social e la scheda Google del Tropico non li ho aperti: da questa sessione quei siti non si aprono.
- Gli orari delle feste, il numero WhatsApp giusto e se il Tropico apre il 24, 25, 26 e 31 dicembre. Nel piano sono segnati «da confermare».
- Le date 2026 del mercatino di Piazza Cavalli: le fonti parlano dell'edizione precedente.
- Il costo di scattiDG. Il 30% di materie prime nei conti è una media del settore, non il dato del Tropico.
- Nessuna riga è entrata nel Calendario: il programma le prepara con lo stato «idea», ma non le scrive.

La pagina con tutto, calendario giorno per giorno compreso: vedi i dettagli tecnici qui sotto.

---

## Dettagli tecnici

### Le quantità al mese (modello 1.0, proposta)
| Voce | Base | Business | Premium |
|---|---|---|---|
| Contenuti Instagram e Facebook | 8 | 12 | 20 |
| di cui reel (girati nel locale) | 2 (0) | 4 (almeno 2) | 8 (almeno 4) |
| Storie | 4 | 12 | ogni sera di apertura (26 a dicembre) |
| Post su Google | 4 | 8 | 12 |
| Foto nuove su Google | 4 | 8 | 15 |
| Reel anche su | no | TikTok | TikTok e YouTube Shorts |
| WhatsApp alla lista | 0 | 1 | 2 |
| Lettera email | 0 | 0 | 1 |
| Mossa del mese / evento | 0 / 0 | 1 / 0 | 1 / 1 |
| Creator | 0 | 1 a trimestre | 2 |
| Pubblicità | 0 | 1 spinta | 2 campagne gestite |
| Giornali / aziende vicine | 0 / 0 | 0 / 0 | 1 a trimestre / 1 |
| Sito / altre schede | 0 / 0 | 1 / 1 | 2 / 2 |
| Mestieri al lavoro | 8 | 16 | 25 |

### I file
- Il modello delle fasce, unica casa delle quantità: `cervello/modelli/piano-editoriale-fasce.json`.
- Il piano del Tropico: `consegne/clienti/tropico-latino/piano-editoriale-2026-12.json` (65 voci; 9 già nel Calendario; nel Premium 24 aspettano un sì del titolare).
- La pagina: `consegne/clienti/tropico-latino/piano-editoriale-2026-12.html`, fatta dal modello riusabile `cervello/modelli/piano-editoriale-pagina.html`.
- Il programma: `node cervello/piano-editoriale.mjs --piano <piano> [--righe base|business|premium] [--pagina <modello> <uscita>]`.
- La prova: `node cervello/test/piano-editoriale.test.mjs` (9 casi; rossa se si toglie il controllo delle parole vietate, provato).

### Cosa cambia nel sito dopo la firma (non fatto)
Le quantità vivono oggi in tre posti: `lib/agenzia/preventivo.ts` (FASCE) nel repo mycity, `cervello/scheda-cliente.mjs` (FASCE) e il fatto `sdg.abbonamenti`. Dopo la firma si allineano tutti e tre al modello, nello stesso lavoro.

### Fonti
- Natale a Piacenza dal 21/11/2026 al 6/1/2027, programma in aggiornamento: https://visitpiacenza.it/en/events/christmas-in-piacenza/
- Santa Lucia sentita a Piacenza: https://www.quotidiano.net/magazine/santa-lucia-880b31f1
- Prezzi delle agenzie in Italia: https://www.kontentino.com/it/blog/pacchetti-social-media-piccole-imprese-prezzi/
- Frequenza dei post su Google: https://www.sendible.com/insights/google-business-profile-guide
