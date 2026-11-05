---
data: 2026-11-05 18:30
tipo: referto
fonte: AD digitale, undicesima sessione (sorveglianza, unione e collaudo)
richiesta: «apri 10 sessioni e risolvi almeno 600 difetti minori del marketplace» e «tutte le pr poi dovranno essere racchiuse in una sola» (Nicola, 5/11)
---

# Dieci sessioni sui difetti minori del sito: 844 riparati, circa 690 reggono per intero

> **In due righe.** Le dieci sessioni hanno lavorato due ore sui difetti piccoli del sito e ne hanno riparati 858.
> Dopo il mio controllo ne restano 844, e un collaudo a campione dice che circa 8 su 10 reggono fino in fondo: sopra i 600 che hai chiesto.

## In parole semplici

Mi hai chiesto dieci sessioni che riparassero almeno 600 difetti minori del sito, e questa sessione a controllare.

**Come ho diviso il lavoro.** I minori aperti erano 1.294. Ne ho lasciati fuori 49: 40 sono falle di sicurezza con i dettagli in un documento privato, 8 non sono codice, 1 non dice dove sta. Gli altri 1.245 li ho divisi in dieci gruppi di file che non si toccano: soldi, ordini, email, database, amministrazione, pannello del negozio, cassa, legale, vetrina, accessi. Ogni sessione aveva fra 118 e 132 schede, e l'ordine di ripararne almeno 60 davvero, ognuna con una prova.

**Come le ho sorvegliate.** Una guardia guardava i rami delle sessioni ogni 3 minuti e controllava ogni spinta nuova: in tutto le sessioni hanno fatto 156 commit. La guardia mi ha fermato su quattro cose:
- **File temporanei delle prove** finiti nei commit di tre sessioni.
- **File di altre sessioni toccati**, soprattutto da S01 e S02. Le ho richiamate a restare nei loro file.
- **Una prova del database spostata.** Sembrava cancellata, invece era resa più forte.
- **Falsi allarmi su chiavi di Stripe.** Erano esempi scritti nelle prove.

A metà strada ho tolto il codice nuovo da ogni ramo e guardato se le prove diventavano rosse: su 110 prove nuove, 107 sì; le altre 3 avevano un motivo giusto.

**Come le ho unite.** Ho messo i dieci rami in uno solo. Dove due sessioni avevano cambiato lo stesso file ho ricucito a mano 16 file, uno due volte, tenendo tutte e due le correzioni. Poi otto prove erano verdi su ogni ramo e rosse sul ramo unito: una sessione controllava un testo che un'altra aveva migliorato. Le ho accordate.

**Come le ho collaudate.** Quattro collaudatori che non hanno costruito niente hanno preso 80 riparazioni a campione, pesando di più soldi, permessi e database, col compito di romperle. Risultato: 64 reggevano fino in fondo, 14 solo in parte o per niente, 2 rompevano un'altra cosa. Due le ho corrette io, con una prova ciascuna. La prima era una rottura nel registro dell'amministratore. La seconda era l'esito di un reclamo, che poteva arrivare a un estraneo. Le altre 14 le ho rimesse fra gli aperti, con la nota di cosa manca. E hanno trovato un errore che bloccava: un aggiornamento del database, il 230, non si applicava. L'ho corretto e provato su un database vero.

## Cosa cambia per te

| | Quanti |
|---|---:|
| Schede date alle sessioni | 1.245 |
| Dichiarate riparate dalle sessioni | 858 |
| **Riparate nel registro, dopo il collaudo** | **844** |
| Di queste, che reggono per intero (stima dal campione: 8 su 10) | circa 690 |
| Già a posto prima di oggi | 41 |
| Riparate solo in parte (restano aperte, con la nota) | 105 |
| Ferme su una tua scelta | 67 |
| Non sono codice (lavori a mano) | 20 |
| Non fatte, ognuna col suo perché | 168 |
| Difetti nuovi visti strada facendo, registrati | 50 |

**I minori aperti scendono da 1.294 a 459**, contando i 50 nuovi.

Per gruppo, le riparate nel registro:

| Sessione | Riparate | Su schede |
|---|---:|---:|
| S01 soldi, carta e guadagni | 58 | 121 |
| S02 ordini e fattorino | 95 | 132 |
| S03 lavori automatici, email e messa online | 84 | 132 |
| S04 database, prove e pagine secondarie | 96 | 122 |
| S05 amministrazione e segnalazioni | 95 | 118 |
| S06 pannello del negozio e catalogo | 90 | 119 |
| S07 carrello, cassa e consegna | 78 | 122 |
| S08 legale, privacy e account | 86 | 122 |
| S09 vetrina, prodotto e home | 76 | 127 |
| S10 accessi, AI e parti comuni | 86 | 130 |

Un esempio di quello che cambia: un cliente che ritira in negozio adesso vede il suo codice di ritiro appena il forno accetta l'ordine, e il forno non gli chiede più il codice sbagliato. Prima si vedeva solo più avanti. Il ritiro è acceso dal lancio, quindi questa conta subito.

Cosa NON cambia: prezzi, commissione del 10%, costi di consegna, compensi del fattorino. Un collaudatore ha controllato apposta che le costanti dei soldi siano identiche a prima.

## Cosa devi fare

- **Guardare e unire la richiesta unica** sul sito. Tre punti da guardare con attenzione:
   - **I testi legali.** Termini, privacy e cookie hanno correzioni puntuali, e dalle tre pagine è sparito il riquadro «Avviso legale». La versione della privacy resta privacy-2.0: alzarla vuol dire richiedere il consenso, e lo decidi tu.
   - **La messa online.** La fila dei rilasci ora sta sul lavoro che pubblica, non su tutto il file, e le librerie si installano senza la password del database. Dopo l'unione, il primo rilascio va guardato: deve andare online come sempre.
   - **L'informativa privacy.** Il negozio ora compare fra i fornitori di MyCity, e non lo è. È una correzione rimasta a metà: va rivista con chi ti segue sulla privacy.
- **Applicare a mano sei aggiornamenti del database**, in quest'ordine: 200, 205, 215, 230, 231, 245. Li ho provati tutti su un database vuoto: si applicano, e una seconda volta non fanno danni. Prima della 191, se non l'hai ancora applicata, c'è un comando da lanciare: è nella scheda 3 del registro.
- **Rispondere alle 67 domande**, quando hai tempo: sono in `domande-per-nicola.md`, per gruppo. Nessuna ferma il lancio.

## Cosa non ho verificato

- **Il campione è di 80 su 858.** Il «circa 690» è una stima: 8 su 10 del campione reggevano, e il campione pesava di più le parti delicate. Sulle altre 778 ho solo i referti delle sessioni e le loro prove.
- **Niente è andato online.** Nessun rilascio, nessuna scrittura sul database vero, nessuna prova su Stripe o sulla posta veri.
- **Il comportamento di GitHub sulla fila dei rilasci** l'ho letto nel codice e nella documentazione, non provato su GitHub.
- **I testi legali** li ho fatti controllare per coerenza col codice, non per correttezza giuridica.
- **Il costo.** Ho misurato due sessioni: 54 e 52 dollari. Le dieci insieme sono quindi intorno ai 500 dollari, più questa. Il limite settimanale dell'account è passato in «attenzione».

---

## Dettagli tecnici

- **Ramo unico:** `claude/youthful-gates-blkxmk` del sito (base `main` @ 21212f9). Rami delle sessioni: `claude/youthful-gates-blkxmk-m01…m10`.
- **Controlli sul ramo completo:** VERIFY
- **File ricuciti all'unione:** DailyCheckIn, faq, seller/analytics, seller/customers, seller/help/domande, cron/expire-stale-orders (due volte), email/templates, ordini/annulla, home/HeroStoreCard, admin/orders/cancel, orders/cod, returns/decide, rider/earnings, ordini/veloce-non-confermata, seller/products/ai-batch, providers/QueryProvider. Più: `lib/rider/consegne-del-fattorino.ts` legge `total_price` (serve al riepilogo dei contanti di S01, scheda 263); le campanelle di admin/cancel e dispute/resolve passano da `scriviCampanella`.
- **Correzioni dell'AD dopo il collaudo:** scheda 190 (l'esito del reclamo va al `seller_id` dell'ordine, non al `against_id` scritto dal cliente; prova rossa senza correzione); scheda 1814 (registro: «sistema o account cancellato» per `actor_id` nullo); migrazione 230 (avanzo di copia in cima, errore di sintassi).
- **Database:** Postgres 16 locale, `tests/sql/harness/apply.sh` = 177 migrazioni applicate, 0 fallite; `run.sh` verde (cartella `tests/sql/rls` 01-50); 200, 205, 215, 230, 231, 245 rieseguite due volte senza errori.
- **Collaudo:** `collaudo/collaudo-A…D.json` (verdetto, motivo, file:riga per 80 schede). Rimaste aperte dopo il collaudo: 48, 58, 2067, 1570, 1734, 2525, 795, 406, 687, 2007, 2058, 506, 2261, 1604.
- **Referti delle sessioni:** `referti/referto-S01…S10.json`. Diario della sorveglianza: `diario-della-sorveglianza.txt`. Conto del registro: `conto-registro.json`.
- **Registro:** `MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json` — 844 voci a `riparato` (con `riparato_da` = ramo e «da unire su main»), 41 a `gia_riparato_prima`, 50 voci nuove (`giro: dieci-sessioni-5-11`). Le falle di sicurezza nuove sono scritte solo per area e gravità.
- **Fuori da questo lavoro:** i 40 minori col referto privato e i seri della prima ondata.
