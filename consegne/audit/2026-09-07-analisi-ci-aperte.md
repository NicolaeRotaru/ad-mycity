---
tipo: audit
data: 2026-09-07 16:35
argomento: tutti i controlli automatici aperti, sui due repository
---

# Il sito non ha mai avuto una copia di sicurezza, e sette lavori sono fermi da settimane

**In due righe.** Il database del sito non ha nessuna copia di sicurezza: il lavoro che
doveva farla ha fallito ventuno volte su ventuno. Ho riparato il guasto tecnico e ripulito
le sette richieste ferme; quello che resta sono cinque chiavi, e le può mettere solo Nicola.

## In parole semplici

Un passo indietro, prima del merito. I controlli automatici sono programmi che girano da
soli, a ogni modifica e ogni notte. Provano se qualcosa si è rotto, e lo dicono prima che
se ne accorga un cliente. Qui ho guardato tutti quelli accesi, sui due progetti: la
macchina che ti scrive, e il sito dove comprano le persone.

Ho trovato due cose molto diverse.

La prima. Sette lavori aspettano il tuo via libera sulla macchina, e tutti e sette hanno
il semaforo rosso. Ma il rosso è vecchio. È stato misurato fra il 15 agosto e il 2
settembre, e da allora la macchina è stata riparata. Ho rifatto girare qui le prove che
allora fallivano, una per una: **oggi sono tutte verdi**. Nessuno le ha più lanciate,
quindi il rosso è rimasto lì a spaventare.

La seconda è seria, e non è vecchia. Sul sito ci sono tre lavori automatici che
falliscono ogni giorno.

- **La copia notturna del database non è mai riuscita.** Ventuno tentativi su ventuno
  falliti, dal 19 agosto a stamattina. Non esiste nessuna copia dei dati dei negozi e
  degli ordini.
- **Il controllo delle migrazioni non è mai partito.** Diciotto tentativi su diciotto
  falliti, dal 21 agosto.
- **Il rilascio controllato del sito è fermo dal primo settembre.** Il sito si pubblica
  lo stesso a ogni unione. Ma nessuno va poi a vedere se risponde.

Tutti e tre falliscono per la stessa ragione di fondo: mancano delle chiavi che solo tu
puoi mettere.

Un esempio concreto. Il 7 settembre alle 07:19 è partita la copia notturna del database
del sito. Ha installato il programma che fa la copia, e si è fermata venti secondi dopo.
Quel programma era di una versione più vecchia del database, e il guardiano l'ha
bloccato. Dietro c'era comunque un secondo muro: la chiave del database non c'è.

## Cosa cambia per te

Se domani il database del sito si rompe, oggi non c'è niente da cui ripartire. È il
punto più grave di tutta questa analisi. Dentro ci sono i negozi, i prodotti, gli ordini
e i clienti.

Le sette richieste ferme sono sistemate. Cinque le ho chiuse, con dentro la spiegazione:
chiedevano cose già successe, o numeri già cambiati. Delle altre due ho portato qui il
pezzo che serviva ancora, e le chiudo appena questa è unita.

## Cosa devi fare

Restano cinque chiavi, e te le chiedono già due card che stanno in coda da settimane: la
**#134** per la copia del database, la **#161** per il rilascio del sito. Le ho aggiornate
tutte e due con quello che ho misurato oggi, invece di aprirne una terza.

Il resto l'ho fatto: il guasto della copia notturna è riparato, e le richieste ferme sono
sistemate una per una. Restano da unire due richieste, questa e la 251 sul sito.

## Cosa non ho verificato

- **Non ho provato a far girare la copia notturna.** Non ho le chiavi e non le voglio.
  Che la riga della versione sia davvero la causa l'ho dedotto dal registro del
  tentativo. È la spiegazione più solida, ma la prova vera è farla girare dopo il fix.
- **Non ho rilanciato i controlli dei sette lavori fermi.** Ho rifatto girare qui le
  prove che allora erano rosse, una per una, e sono verdi. Il controllo completo però
  chiede un programma che apre le pagine web, e qui quel programma non c'è.
- **Non ho toccato niente sul sito.** Nessuna chiave, nessun rilascio, nessuna
  pubblicazione.
- **Non so se il sito risponde adesso.** Da questa sessione non riesco a bussargli.

---

## Cosa ho riparato


| Riparazione | Dove | La prova che tiene |
|---|---|---|
| L'ancora della mutazione AR-850 non contiene più il numero delle card archiviate | `cervello/mutanti.json` | `node cervello/non-vacuita.mjs --difetti AR-850` → tutte e due le mutazioni rendono rosso il loro test |
| `WebSearch` censito fra le ESENZIONI (era la richiesta 842) | `cervello/mappa-copertura.mjs` | il cancello dello Stop non lo segnala più come strumento non sorvegliato |
| Il report supervisione negozi si legge a voce (era la richiesta 841) | `cervello/supervisione-negozi.mjs` | `node cervello/si-capisce.mjs` sul testo generato |
| Il percorso di `pg_dump`: la copia notturna prendeva la versione 16 al posto della 17 | `mycity`, [#251](https://github.com/NicolaeRotaru/mycity/pull/251) | prova nuova che diventa rossa se la riga sparisce o si sposta; verificata nei due sensi |

E le richieste ferme, una per una:

| # | Cosa ne ho fatto |
|---|---|
| [#735](https://github.com/NicolaeRotaru/ad-mycity/pull/735) | chiusa: le due prove sono verdi su `main`, e le 65 skill che descriveva non esistono più |
| [#741](https://github.com/NicolaeRotaru/ad-mycity/pull/741) | chiusa: fotografia dei sensori del 16/8, più vecchia di quella su `main` |
| [#860](https://github.com/NicolaeRotaru/ad-mycity/pull/860) | chiusa: il difetto che aveva visto è riparato alla radice qui dentro |
| [#864](https://github.com/NicolaeRotaru/ad-mycity/pull/864) | chiusa: fotografia del 2/9, in conflitto, e la riscrive il prossimo giro |
| [#865](https://github.com/NicolaeRotaru/ad-mycity/pull/865) | chiusa: il numero che correggeva è già cambiato di nuovo |
| [#842](https://github.com/NicolaeRotaru/ad-mycity/pull/842) | il suo codice è qui dentro. La chiudo quando questa è unita |
| [#841](https://github.com/NicolaeRotaru/ad-mycity/pull/841) | il suo testo è qui dentro. La chiudo quando questa è unita |


---

## 🔧 Dettagli tecnici

### Il quadro, in due righe per progetto

| Progetto | Controlli attivi | Ramo principale | Aperti in rosso |
|---|---|---|---|
| `ad-mycity` (la macchina) | 4 | verde (7/9 08:13) | 7 richieste di unione su 7 |
| `mycity` (il sito) | 4 | verde (7/9 06:42) | 3 lavori automatici su 4 |

### Dove si incollano le chiavi

Repository `mycity` → Settings → Secrets and variables → Actions → New repository secret.
I nomi esatti: `SUPABASE_DB_URL` (Supabase → Project Settings → Database → Connection
string), `BACKUP_PASSPHRASE`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

### I tre lavori rotti del sito

| Lavoro | Corse | Verde l'ultima volta | Causa misurata |
|---|---|---|---|
| `backup-db.yml` | 21 | **mai** | `pg_dump` 16.15 contro un server 17 → il guardiano ferma tutto. Dietro c'è anche `SUPABASE_DB_URL` vuoto |
| `deriva-migrazioni-produzione.yml` | 18 | **mai** | `SUPABASE_DB_URL` vuoto (letto nel log: `DB:` senza valore) |
| `deploy-dopo-ci.yml` | 28 | 28/8 (corsa 22) | mancano `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` |

Sul rilascio: il rosso dal 1/9 **è un miglioramento, non un peggioramento**. Il commit
`7c9ae70` ("Il passo scritto per dire sempre la verità era l'unico che non poteva
parlare") ha reso onesto il lavoro. Prima usciva verde senza aver pubblicato né
verificato niente. Adesso dice ⚪ e fallisce. Il verde del 28/8 non vale come prova che
il sito fosse stato pubblicato da lì.

Va letto insieme a `vercel.json`, che ha ancora `"git": { "deploymentEnabled": { "main":
true } }`. Quindi Vercel pubblica in produzione da solo a ogni unione su `main`. Su
quella strada non c'è né prova di fumo né ritorno indietro. L'ordine giusto resta quello
scritto in testa a `deploy-dopo-ci.yml`: prima le tre chiavi, poi `"main": false`.

Sulla copia notturna, la diagnosi riga per riga: il passo installa
`postgresql-client-17` e ci riesce, poi `pg_dump --version` risponde `16.15`. L'immagine
del computer di turno porta già PostgreSQL 16, e il suo `pg_dump` viene prima nel
percorso di ricerca. Il rimedio è mettere davanti `/usr/lib/postgresql/17/bin`
(`echo "/usr/lib/postgresql/17/bin" >> "$GITHUB_PATH"`) prima del controllo di versione.
Il guardiano che ferma tutto **ha fatto il suo lavoro**: senza di lui la copia sarebbe
uscita sbagliata in silenzio.

Conseguenza da non perdere: anche la prova mensile di ripristino (`41 3 1 * *`) non è
mai girata. Il tempo di ripristino dichiarato nel runbook resta un numero mai
cronometrato.

### Le sette richieste di unione ferme su `ad-mycity`

Il rosso comune a tutte e sette è lo stesso guardiano: **«verdetti senza lettore»**
(`cervello/cancello-stop.mjs`, AR-154). Dice che il ramo ha portato file di lavoro senza
lasciare una riga di esito in nessun quaderno. Non è una prova del codice: è la regola
del loop chiuso.

| # | Titolo | Unibile | Rosso, oltre AR-154 | Verdetto |
|---|---|---|---|---|
| [#842](https://github.com/NicolaeRotaru/ad-mycity/pull/842) | WebSearch in ESENZIONI | sì (`unstable`) | AR-478 (7 punti difficili nel testo di consegna) + 2 prove allora rosse, **oggi verdi** | **serve ancora**: `WebSearch` non è in `ESENZIONI` su main |
| [#841](https://github.com/NicolaeRotaru/ad-mycity/pull/841) | sensori + testo supervisione | no (conflitto) | AR-478 (5 punti) + le stesse 2 prove | **metà serve**: le 5 frasi di `supervisione-negozi.mjs` non sono su main; i sensori sono vecchi |
| [#864](https://github.com/NicolaeRotaru/ad-mycity/pull/864) | sensori del 2/9 | no (conflitto) | «test del cervello» 5 rossi, **oggi verdi** | **da rinfrescare**: i suoi sensori sono più freschi di main (2/9 contro 28/8 e 14/8) |
| [#865](https://github.com/NicolaeRotaru/ad-mycity/pull/865) | ancora AR-850 28→27 | no (conflitto) | come sopra | **da chiudere**: su main l'ancora dice già 33 |
| [#860](https://github.com/NicolaeRotaru/ad-mycity/pull/860) | ancora AR-850 scolpita | no (conflitto) | solo AR-154 | **da chiudere**: stesso bersaglio, stesso numero superato |
| [#741](https://github.com/NicolaeRotaru/ad-mycity/pull/741) | sensori del 16/8 | no (conflitto) | solo AR-154 | **da chiudere**: più vecchio di quello che c'è su main |
| [#735](https://github.com/NicolaeRotaru/ad-mycity/pull/735) | 2 rossi cronici | no (conflitto) | «gate delle lezioni»: 2 gate che non possono scattare | **da chiudere**: le 2 prove sono verdi su main, e le 65 skill che descriveva non esistono più (ne restano 6) |

Le cinque prove che allora erano rosse, rilanciate qui su `origin/main` di oggi:

```
validazione-congelata.test.mjs      8 pass · 0 fail
pausa-senza-risveglio.test.mjs     12 pass · 0 fail
prova-che-non-puo-fallire.test.mjs 26 pass · 0 fail
mutazioni-orfane.test.mjs           7 pass · 0 fail
permessi-guardrail.bats             9 ok   · 0 fail
```

E le due che bloccavano #735: `mappa-in-bacheca` 19 pass, `guardiano-mai-messo-di-guardia`
verde. Su main `guardia-viva-check.mjs` esclude già `worktrees` (riga 68).

### Il difetto che resta vivo dietro #860 e #865

Tutti e due nascono dallo stesso punto: `cervello/mutanti.json` porta il numero delle
card archiviate **scritto a mano** dentro il campo `cerca`. Quel numero cambia a ogni
archiviazione, e la mutazione smette di trovare il suo bersaglio. È andato 28 → 27, e
oggi su main è 33. La voce accanto, quella su `housekeeping-azioni.mjs`, usa già un
segnaposto (`${allClosedBlocks.length}`) e non si rompe.

Chiudere le due richieste non chiude il difetto. La radice è AR-862 e va risolta col
segnaposto, non con un altro numero fresco.

### Cosa NON è rotto

- `battito-esterno.yml` su `ad-mycity`: 60 corse su 60 verdi. L'unico guardiano che vive
  fuori dalla macchina che controlla, e regge.
- `test-cervello.yml` e `cancello-lotto.yml` sul ramo principale: verdi.
- `ci.yml` sul sito: verde su `main`, ultima corsa 7/9 06:42.
- I rossi visti sui rami `claude/marketplace-open-issues-*` sono corse intermedie di
  lavori poi finiti in verde e uniti.
