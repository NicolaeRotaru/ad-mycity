---
tipo: consegna
reparto: AD con marketplace-payments e finanza; verifica di contabilita
data: 2026-10-29 23:45
colore: 🟢
titolo: Come girano i soldi con Stripe, quanto costano le commissioni e quanto resta a MyCity per ogni ordine
---

# Come girano i soldi, quanto costano e quanto resta a MyCity

> **In due righe.** Al lancio, con i contanti, Stripe non costa niente: il costo è il tuo bonifico al negozio. Con la carta i soldi passano prima da MyCity e poi vanno al negozio, e le commissioni di Stripe le paga MyCity, all'incasso e al versamento in banca.

## In parole semplici

Mi hai chiesto tre cose: come girano i soldi con Stripe, quanto si paga di commissioni, e dove la macchina tiene i costi.

**Con i contanti, cioè al lancio.** Il cliente dà i soldi al fattorino, cioè a te. Tu fai il bonifico al negozio dopo la consegna. Stripe non c'entra e non costa niente. Il costo è il bonifico della tua banca: su molti conti online è gratis, su altri costa circa 1 euro. Non so quanto costa sul tuo.

**Con la carta, quando si accende.** I soldi non vanno direttamente al negozio. Il percorso è questo:
- Il cliente paga una volta sola per tutto il carrello, sul conto Stripe di MyCity.
- Un'ora dopo la consegna il sito gira il 90% della merce al conto Stripe del negozio.
- Nello stesso momento gira al fattorino il suo compenso.
- Qualche giorno dopo Stripe versa dal conto del negozio al suo IBAN.

**Le commissioni le paga MyCity, in due momenti.** Il negozio riceve sempre il suo 90% pieno.
- All'incasso: circa 1,5% più 0,25 euro, una volta sola per carrello, con una carta europea normale.
- Al versamento in banca del negozio e del fattorino: circa 0,25% più 0,10 euro per versamento, e circa 2 euro al mese per ogni conto che quel mese riceve soldi.
- Il giro interno da MyCity al conto Stripe del negozio, per quanto risulta, è gratis.

Esempio: Maria compra 15 euro di pane da Pane Quotidiano e paga 18 euro con la carta. Al forno vanno 13,50 euro e al fattorino 3. A Stripe vanno circa 0,52 euro all'incasso e circa 0,24 euro per i due versamenti in banca. A MyCity restano circa 0,74 euro, prima dell'IVA e dei 2 euro al mese per conto.

## Cosa cambia per te

- **Margine:** ogni ordine lascia a MyCity meno di un euro. Su un carrello di un negozio sopra i 10 euro, la consegna entra e riesce tutta al fattorino: a MyCity resta il 10% della merce, meno i costi.
- **Costi fissi:** circa 300 euro al mese, solo per i servizi informatici. Con il commercialista e i contributi INPS, quando apri la partita IVA, la stima sale a circa 620-780 euro al mese. Queste ultime cifre sono da confermare col commercialista.
- **Pareggio:** per pagare i 300 euro servono circa 220 ordini al mese con i contanti, o circa 360 con la carta. Il conto usa uno scontrino medio di 14 euro in un negozio solo. I bonifici si fanno una volta a settimana.
- **Dove stanno:** oggi le cifre dei costi stanno in cinque posti diversi, e si contraddicono. Propongo una casa sola, qui sotto.

## Cosa devi fare

- **Guardare tre ricevute:** Claude, Vercel e Supabase. Il prezzo di Claude Max 20x sul sito di Anthropic è 200 dollari al mese più IVA, circa 218 euro. Se ricordi 260 o 280 euro, forse ti sei abbonato dall'app dell'iPhone, dove costa di più. La ricevuta lo dice. Se è così, abbonarti dal sito costerebbe meno.
- **Guardare quanto costa un bonifico sul tuo conto.** È il costo vero di ogni ordine in contanti.
- **Dirmi se va bene la casa unica dei costi.** È una modifica della macchina, quindi è gialla: serve la tua firma.

## Cosa non ho verificato

- **Le tariffe di Stripe sono stime.** Da questa sessione stripe.com non si apre: le cifre vengono dalle sintesi della ricerca e da siti che le riportano. Si confermano dal tuo pannello Stripe, o con la chiave di sola lettura di cui ti ho scritto.
- **Vercel l'ho letto davvero.** Il piano costa 20 dollari al mese, e i consumi di inizio ottobre sono stati quasi zero. L'IVA non compare in quei dati.
- **Supabase:** ho letto che il piano è il Pro, con due progetti. Non ho letto la fattura, né la grandezza dei due database.
- **Il server Hetzner e il dominio** sono le cifre che mi avevi detto a luglio: 20 euro al mese e 20 euro l'anno.
- **L'IVA** cambia molto il conto. Se la partita IVA è ordinaria, su un ordine da 15 euro l'IVA sulla consegna e sulla commissione è circa 0,81 euro, e il margine va sotto zero. Lo decide il commercialista.

---

## Il conto per ordine

Cifre in euro, con la fascia oraria. Lettura A: niente IVA da versare sulle vendite. Stripe con le tariffe stimate sopra. Il bonifico coi contanti è messo a 1 euro, come ipotesi.

| Carrello | Pagamento | Paga il cliente | Al negozio | Al fattorino | Stripe | Bonifico | Resta a MyCity |
|---|---|---|---|---|---|---|---|
| 1 negozio, 15 € | contanti | 18,00 | 13,50 | 3,00 | 0,00 | 1,00 | 0,50 |
| 1 negozio, 15 € | carta | 18,00 | 13,50 | 3,00 | 0,76 | 0,00 | 0,74 |
| 1 negozio, 8 € | contanti | 12,00 | 7,20 | 3,00 | 0,00 | 1,00 | 0,80 |
| 1 negozio, 8 € | carta | 12,00 | 7,20 | 3,00 | 0,66 | 0,00 | 1,14 |
| 2 negozi, 15 € + 12 € | contanti | 31,00 | 24,30 | 4,00 | 0,00 | 2,00 | 0,70 |
| 2 negozi, 15 € + 12 € | carta | 31,00 | 24,30 | 4,00 | 1,09 | 0,00 | 1,61 |
| 3 negozi, 5 € + 6 € + 7 € | contanti | 26,00 | 16,20 | 5,00 | 0,00 | 3,00 | 1,80 |
| 3 negozi, 5 € + 6 € + 7 € | carta | 26,00 | 16,20 | 5,00 | 1,09 | 0,00 | 3,71 |

Con la veloce MyCity prende 1 euro in più, tranne quando è compresa. Al lancio il fattorino sei tu, quindi i 3 euro del fattorino restano in tasca a te.

## I costi fissi al mese

| Voce | Euro al mese, IVA compresa | Come lo so |
|---|---|---|
| Claude Max 20x | circa 218 (200 $ + IVA) | prezzo ufficiale di Anthropic; la ricevuta non l'ho vista |
| Vercel Pro | circa 22 (20 $ + IVA) | letto dalla fatturazione di Vercel: 20 $ di piano, consumi quasi zero |
| Supabase Pro, 2 progetti | circa 38 (35 $ + IVA) | piano Pro letto; prezzo dal listino |
| Server Hetzner | 20 | detto da te il 20/7 |
| Dominio | circa 1,70 (20 € l'anno) | detto da te il 20/7 |
| Resend, Upstash, Sentry, PostHog, GitHub | 0 | piani gratuiti, oggi bastano |
| **Totale** | **circa 300** | il registro dice 302, ma voce per voce è diverso |

Da aggiungere quando arrivano:
- il commercialista, circa 800-1.200 euro l'anno, stima della Bacheca senza preventivo;
- i contributi INPS con la partita IVA, da chiedere al commercialista;
- la polizza della consegna, col preventivo del broker.

## Dove vivono i conti oggi

Il sito non tiene i costi dell'azienda: lì c'è solo il conto di ogni ordine, nel codice della cassa. La macchina li tiene in cinque posti, e nessuno legge gli altri:

| Posto | Cosa dice | Quanto è vecchio |
|---|---|---|
| Registro dei fatti, voce dei costi fissi | 302 € al mese | 22 agosto |
| Bacheca della Cabina | la lista più completa dei costi | luglio; dice ancora il fattorino a 3-5 € |
| Pagina «Finanza & Unit Economics» | il margine per ordine | luglio; scrive il 12% e un conto sbagliato |
| Sensore della cassa | i mesi di cassa | fermo dal 1° settembre, senza dati |
| Programma del bilancio | quanto rende ogni ordine | scrive il 12% a mano |

**La proposta.** Una casa sola, nel registro dei fatti, con una voce per ogni costo. Ogni voce dice l'importo, l'IVA, la valuta, ogni quanto si paga, se è verificato o stimato, la fonte e la data. Il totale lo somma un programma. La Cabina, il sensore della cassa e le pagine di finanza leggono da lì e non copiano. Ogni mese un resoconto in un file suo. È una modifica della macchina: 🟡, con la tua firma.

## Tre cose trovate per strada

- **Un rischio grave, da sistemare prima di accendere la carta.** Gli ordini in contanti che paghi a mano restano «da pagare» nel sito. Il giorno che si accende Stripe, il giro dei bonifici li pagherebbe una seconda volta. Esempio: dieci ordini di novembre già pagati, e a dicembre il forno riceve di nuovo i suoi 135 euro. Serve un modo per segnare «pagato con bonifico». È nel registro del sito.
- **Il contratto in bozza con Pane Quotidiano dice ancora 12%.** Il sito trattiene il 10%. Va riscritto prima di farlo firmare.
- **Il sito non produce nessun documento fiscale:** né lo scontrino della consegna, né la fattura della commissione al negozio. È una domanda per il commercialista.

---

## Dettagli tecnici

- Controllo `wf_90ac7bed-c22`: 4 lettori in parallelo (flusso dei soldi e tariffe con `marketplace-payments`; costi fissi e dove vivono i conti con `finanza`), il conto con `finanza`, lo scettico con `contabilita`. Lo scettico ha corretto 12 punti, già riportati sopra; i più importanti: il pareggio col bonifico settimanale (217 ordini coi contanti, circa 363 con la carta, invece di 749 e 467 col caso peggiore) e i costi fissi che contano solo i servizi informatici.
- Script del conto: `/tmp/claude-0/-home-user/f50634e3-5da1-52ae-85ef-aeb23d45e4ef/scratchpad/costi/conto.mjs` (scratch, non nel deposito): prova sugli 8 esempi della regola, quadratura al centesimo.
- Flusso nel codice (`/home/user/mycity-ondate/base-14`): addebito sulla piattaforma `lib/stripe/client.ts:255-283`; conti Express `client.ts:333`; trasferimenti con `source_transaction` `lib/stripe/payout.ts:237-264` e `:417-430`; giro ogni 15 minuti `vercel.json:23`; attesa di un'ora `lib/stripe/tempi-bonifico.ts:24`.
- Vercel: `list_billing_charges` dal 30/9 al 7/10, «Subscription Licenses» 4,67 $ a settimana (20 $ al mese), consumi fatturati 0,001 $.
- Supabase: `get_organization` → piano `pro`; `list_projects` → `Mycity` (eu-west-3) e `ad-mycity` (eu-central-2), tutti e due ACTIVE_HEALTHY.
- Voci nuove nel registro del sito: 1810 (il doppio pagamento dei contanti, grave), 1811 (la pagina Guadagni promette il bonifico in un'ora), 1812 (il permesso card_payments chiesto ai negozi).
- Stripe bloccato dalla rete della sessione: stripe.com e docs.stripe.com rispondono ENOTFOUND o 403.
