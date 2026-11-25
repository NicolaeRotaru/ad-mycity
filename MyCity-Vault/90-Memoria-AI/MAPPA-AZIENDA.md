---
data: 2026-11-25 13:15
generata_da: cervello/mappa-azienda.mjs
---

# La mappa dell'azienda

**In breve.** n8n ha 28 flussi vivi, e 13 sono accesi. Nel marketplace ci sono 4 venditori. Nella macchina, 154 file di codice su 939 non li fa partire nessuno.

> Rifatta da un programma il 2026-11-25 13:15, a 0 token: `node cervello/mappa-azienda.mjs`. Non si corregge a mano.
> È la pagina che l'AD legge per prima: invece di esplorare quattro repository e n8n, legge questa.

## In parole semplici

Qui c'è tutto quello che l'azienda ha oggi: le sue parti, dove gira ogni cosa, i flussi di n8n, i negozi, le persone e il codice della macchina.
Ogni numero lo conta il programma da solo. Quello che da qui non si può misurare è scritto come «non misurato», mai come zero.
Un esempio. Per sapere se il flusso «08 Post dalle foto» è acceso, prima l'AD apriva n8n e leggeva il flusso. Adesso legge la sua riga nella tabella dei flussi, qui sotto.

## Cosa cambia per te

L'AD non deve più esplorare tutto a ogni sessione: legge questa pagina, e spende meno token. Tu trovi in un posto solo cosa c'è e cosa è acceso.

## Cosa devi fare

Niente. Se vedi un errore, dillo all'AD: si corregge il programma, non la pagina.

## Cosa non ho verificato

Per capire chi fa partire un file, il programma cerca il suo nome negli altri file. Un file nominato solo in un commento sembra vivo.
La tabella «Dove gira ogni cosa» l'ha letta l'AD a mano, il 25/11.

## Le parti dell'azienda

| Parte | Cos'è | Dove sta scritto |
| --- | --- | --- |
| **MyCity** | il marketplace dei negozi di Piacenza: catalogo, ordini, consegna | registro-fatti, `strategia.cliente-core` |
| **SDG Agenzia** | l'agenzia di Nicola: web, marketing, foto e video. Vende gli abbonamenti Base, Business e Premium | registro-fatti, `sdg.abbonamenti` |
| **scattiDG** | azienda partner: solo foto e video | registro-fatti, `agenzia.nome` |
| **L'organizzazione dell'AD** | l'AD, i 120 senior, la memoria e n8n come mani: fa girare MyCity e SDG. Il nome nuovo è da scegliere | DECISIONI 24/11 21:23 |

Com'è fatta dentro la macchina dell'AD (le sue 9 parti): `MAPPA-MACCHINA.md`.

## Dove gira ogni cosa

| Cosa | Dove gira | Nome lì | Repository | Note |
| --- | --- | --- | --- | --- |
| Marketplace MyCity | Vercel | mycity | mycity | il database è Supabase «Mycity», a Parigi; l'AD lo legge e basta |
| Pannello di Controllo | Vercel | ad-mycity | ad-mycity, cartella pannello/ | due lavori a orario: battito alle 9:00, report alle 19:07 |
| Palestra | Vercel | mycity-palestra | mycity | la copia di prova del marketplace |
| Sito SDG | nessuno | — | SDG | non risulta pubblicato |
| n8n | Sliplane | n8n-shdy.sliplane.app | N8N, per i flussi fatti da programma | le mani e l'orologio dell'azienda |
| Memoria dell'AD | Supabase e il repository | ad-mycity | ad-mycity | qui vive anche la coda dei lavori del vecchio server |
| Server del worker | spento per sempre | — | ad-mycity, cartella cervello/vps/ | spento dal 21/11; Nicola ha deciso il 24/11 di non riaccenderlo |

| Repository | Cos'è | Ultimo commit | File |
| --- | --- | --- | --- |
| ad-mycity | la macchina dell'AD: memoria, senior, programmi, Pannello | 2026-11-25 | 4199 |
| mycity | il marketplace MyCity (sito, dashboard dei negozi, API) | 2026-11-24 | 3591 |
| SDG | il sito dell'agenzia SDG | 2026-11-23 | 41 |
| N8N | i sorgenti e le prove dei flussi n8n costruiti da programma (repository pubblico) | 2026-11-25 | 65 |

## I flussi di n8n

47 flussi: 28 vivi, 19 archiviati. Accesi: 13. Nodi nei flussi vivi: 1570.
Accesi con almeno un nodo che chiama l'API di Claude: 7 (01 · Pubblica contenuti (Instagram + Facebook), 04 · Scrivi i testi (AI), 08 Post dalle foto, 12 · Nuovo cliente (automatico), 16 · Nuovo cliente da MyCity, 18 · Analisi di un'attività, Chiedi all'AD). Un nodo presente non vuol dire che venga chiamato: dipende dai bivi.

| Flusso | Acceso | Nodi | Nodi Claude | Ultima corsa |
| --- | --- | --- | --- | --- |
| 00 · Attiva cliente | no | 20 | — | errore, 2026-11-15 |
| 01 · Pubblica contenuti (Instagram + Facebook) | sì | 98 | 1 | mai, o non salvata |
| 01b · Pubblica sulla seconda coppia | no | 113 | — | mai, o non salvata |
| 02 · Gestione commenti Instagram e Facebook | no | 52 | 1 | mai, o non salvata |
| 03 · Piano del mese (potenziato) | no | 33 | 1 | mai, o non salvata |
| 04 · Scrivi i testi (AI) | sì | 57 | 1 | riuscita, 2026-11-21 |
| 05 · Nuovo contenuto (modulo) | sì | 35 | — | riuscita, 2026-11-23 |
| 06 Storie del giorno | no | 204 | 3 | riuscita, 2026-11-22 |
| 07 Reel dalle clip | no | 171 | 2 | riuscita, 2026-11-22 |
| 08 Post dalle foto | sì | 123 | 2 | riuscita, 2026-11-25 |
| 09 · Impara dai numeri | sì | 27 | — | riuscita, 2026-11-21 |
| 10 · Revisore | no | 36 | — | riuscita, 2026-11-21 |
| 12 · Nuovo cliente (automatico) | sì | 96 | 3 | mai, o non salvata |
| 13 · Foto pronte | no | 31 | — | riuscita, 2026-11-21 |
| 14 · Smista materiale | no | 32 | — | mai, o non salvata |
| 15 · Approva le storie | no | 48 | — | mai, o non salvata |
| 16 · Montatore | no | 155 | 5 | mai, o non salvata |
| 16 · Nuovo cliente da MyCity | sì | 106 | 3 | mai, o non salvata |
| 17 · Analisi del marketplace | no | 21 | 1 | riuscita, 2026-11-25 |
| 18 · Analisi di un'attività | sì | 21 | 1 | riuscita, 2026-11-25 |
| 19 · Bozze dei 3 abbonamenti | sì | 12 | — | riuscita, 2026-11-25 |
| 19 · Consegna la scheda scritta dall'AD | no | 2 | — | riuscita, 2026-11-25 |
| 20 · Iscrivi il cliente in MyCity | sì | 4 | — | mai, o non salvata |
| 99 · Avvisi errori | sì | 11 | — | riuscita, 2026-11-20 |
| Chiedi all'AD | sì | 10 | 1 | riuscita, 2026-11-25 |
| MyCity · 11 Foto prodotto | no | 29 | 2 | mai, o non salvata |
| Prepara foglio (una tantum) | no | 19 | — | riuscita, 2026-11-23 |
| PROVA · padre di Chiedi all'AD (da togliere) | sì | 4 | — | riuscita, 2026-11-25 |

## I negozi e gli imprenditori

Fonte: file negozi.json (estratto in sola lettura). Venditori registrati: 4, di cui 1 di sistema.

| Negozio | Approvazione | In vetrina | Prodotti | Dal |
| --- | --- | --- | --- | --- |
| Pane Quotidiano | approvato | sì | 5 | 2026-06-15 |
| SDG Agenzia · di sistema | approvato | sì | 3 | 2026-11-24 |
| Ora del Gusto | non chiesta | no | 0 | 2026-11-24 |
| _senza nome_ (6d057b3c) | in attesa | no | 0 | 2026-11-24 |

**Clienti dell'agenzia SDG:** stanno nella scheda Clienti, un foglio Google che usano i flussi di n8n. Da qui non si legge: non misurato.

## Le persone

| Chi | Cosa fa | Cosa gli prepara l'AD |
| --- | --- | --- |
| Nicola | il titolare: dà la rotta e firma soldi, rilasci e messaggi a persone vere. Al lancio consegna lui, in bici, fino a 10 km | le decisioni pronte da firmare, nel Pannello |
| Fotografo e videomaker | scattiDG, partner per foto e video | elenco degli scatti, appuntamento col negozio, materiale da montare |
| Fattorino | al lancio è Nicola (registro-fatti, `consegna.promessa`) | il giro delle consegne |
| Commercialista | conferma IVA, bilancio e adempimenti | i documenti del mese in ordine. Il nome non è in memoria |

## I soldi

- Al lancio i clienti pagano solo in contanti, alla consegna. Fonte: `pagamenti.al-lancio`.
- Stripe non è collegato ai sensori dell'AD.
- L'agenzia vende tre abbonamenti al mese: Base a 300 euro, Business a 500 euro e Premium a 999 euro. Fonte: `sdg.abbonamenti`.
- Il marketplace prende il 10% sugli ordini che porta lui. Fonte: `pricing.commissione`.
- Per l'IA non si paga nessuna API: quel lavoro lo fa l'AD col piano Max. Fonte: `ad.uso-e-crediti`.

## Il codice della macchina: chi lo fa partire

Il programma parte dagli ingressi veri e segue chi nomina chi. Gli ingressi sono di tre tipi.
Da fuori: GitHub e il Pannello. A mano: i manuali, le skill e i senior. Solo server: il server del worker.
Un file che nessuno nomina è orfano. In `cervello/` ci sono 939 file di programma, con 200.479 righe.

Le prove stanno nella riga del codice che provano: una prova di un file orfano è orfana anche lei.

| Chi lo fa partire | Programmi | Righe | Prove | Righe delle prove |
| --- | --- | --- | --- | --- |
| Da fuori (GitHub, Pannello, hook) | 320 | 98.178 | 452 | 80.783 |
| A mano (manuali, skill, senior) | 5 | 1646 | 5 | 1951 |
| Solo il server, spento per sempre | 2 | 190 | 1 | 226 |
| Nessuno: orfano | 88 | 7950 | 66 | 9555 |

Gli orfani più grandi, primi candidati da togliere dopo un controllo uno per uno:

- `cervello/permessi-elenco.mjs`: 533 righe, ultima modifica 2026-11-06
- `cervello/mappa-azienda.mjs`: 420 righe, ultima modifica 2026-11-25
- `cervello/round6-applica.mjs`: 356 righe, ultima modifica 2026-11-06
- `cervello/ricuci-corsie.mjs`: 334 righe, ultima modifica 2026-11-06
- `cervello/sintomo.mjs`: 331 righe, ultima modifica 2026-11-06
- `cervello/rapporto-radiografia.mjs`: 274 righe, ultima modifica 2026-11-06
- `cervello/foto-pagine-vere.mjs`: 271 righe, ultima modifica 2026-11-06
- `cervello/contratto-workflow.mjs`: 226 righe, ultima modifica 2026-11-06
- `cervello/ancora-rotti.mjs`: 219 righe, ultima modifica 2026-11-06
- `cervello/spazzata-frase.mjs`: 199 righe, ultima modifica 2026-11-06
- `cervello/content-factory/render-ricetta-cover.mjs`: 191 righe, ultima modifica 2026-11-06
- `cervello/programma-correzione-ar114.mjs`: 187 righe, ultima modifica 2026-11-06
- `cervello/workflow-partono.mjs`: 185 righe, ultima modifica 2026-11-06
- `cervello/porte-pannello.mjs`: 168 righe, ultima modifica 2026-11-06
- `cervello/genera-capacita.mjs`: 158 righe, ultima modifica 2026-11-06

I pezzi più grandi che vivono solo col server:

- `cervello/vps/riconcilia-memoria.sh`: 165 righe, ultima modifica 2026-11-06
- `cervello/vps/test-giro-prompt.sh`: 25 righe, ultima modifica 2026-11-06

_Il collegamento è una ricerca di nomi: un file nominato solo in un commento risulta vivo. Per questo gli orfani sono sicuri, i vivi no. Prima di togliere un file, una prova che gira._

## Il peso fisso di ogni sessione

Ogni sessione dell'AD rilegge le stesse cose prima di fare qualsiasi lavoro. Stima: circa 4 byte per token.

| Cosa | Byte | Token, circa |
| --- | --- | --- |
| Regole per tutti (CLAUDE.md) | 17.465 | 4366 |
| Le descrizioni dei 120 senior, nella lista degli agenti | 61.974 | 15.494 |
| Manuale dell'AD, una volta per sessione | 23.847 | 5962 |
| Memoria: DECISIONI.md (7518 righe), se si legge intera | 1.227.948 | 306.987 |
| Memoria: LAVORO-APERTO.md (232 righe), se si legge intera | 49.517 | 12.379 |
| Memoria: STATO.md (1748 righe), se si legge intera | 177.748 | 44.437 |
| Memoria: registro-fatti.json (1813 righe), se si legge intera | 136.069 | 34.017 |
| Memoria: BACHECA-SESSIONI.md (201 righe), se si legge intera | 52.303 | 13.076 |
| Memoria: AZIONI-IN-ATTESA.md (1972 righe), se si legge intera | 154.498 | 38.625 |

## Cosa non è misurato

- Le visite e la velocità dei siti: servono le chiavi di Vercel, che il programma non ha.
- Gli incassi veri: Stripe non è collegato.
