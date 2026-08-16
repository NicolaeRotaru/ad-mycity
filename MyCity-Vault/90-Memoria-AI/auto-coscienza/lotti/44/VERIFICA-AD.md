# I difetti che erano già riparati e nessuno aveva timbrato

## In parole semplici

Dodici difetti risultavano aperti nel cantiere. Nel codice erano già a posto.

Non è un errore di conteggio: è che il timbro «chiuso» si mette solo **dopo** che tu unisci una
richiesta. Il giro precedente aveva riparato e provato tutto. Quel passaggio finale non è mai
avvenuto.

Quindi non erano dodici lavori da fare. Erano dodici lavori fatti e non registrati.

## Cosa cambia per te

Il numero che vedevi era più brutto della realtà, e la differenza conta.

Un difetto **da riparare** costa lavoro. Un difetto **da timbrare** costa un clic. Contarli insieme
fa sembrare il cantiere più grosso di quanto sia, e fa sembrare la macchina più ferma di quanto sia.

Esempio: AR-666 era «l'ora scritta a mano vive ancora in diciassette punti del cervello». Ho rotto
uno per uno tutti e dieci i file curati. Tutti e dieci sono diventati rossi. La riparazione c'era, e
funzionava.

## Cosa devi fare

Niente adesso. Questi dodici si chiudono da soli quando unisci la richiesta.

## Cosa non ho verificato

Tre mutazioni portano un nome segnaposto invece della frase che dice cosa si rompe. Sono AR-458,
AR-680 e AR-704: tutte e tre dicono «il cuore del fix». **Funzionano** — rendono rosso il loro test.
Ma chi le legge fra sei mesi non sa cosa sta guardando. L'ho registrato invece di lasciarlo lì.

Restano fuori da questo conto i difetti la cui prova è **condivisa** con altri. Un test dato a otto
difetti che non li nomina tutti ne chiuderebbe sette mai toccati. Quelli li ha verificati uno per uno
la corsia che li aveva in carico.

---

## Dettagli tecnici

**Come ho verificato.** Su un worktree fermo al commit di partenza `4a4c6ff` (cioè `origin/main`),
fuori dall'albero dove le corsie stavano lavorando. Così nessun verde e nessun rosso è di qualcun
altro.

Due passi per ognuno, quelli del mansionario:

1. la prova gira ed è verde;
2. la mutazione la fa diventare rossa (`node cervello/non-vacuita.mjs --difetti …`).

**Esito: 12 su 12.**

| difetto | cosa era rotto | la mutazione l'ha fatto diventare rosso |
|---|---|---|
| AR-458 | il freno mai costruito confuso con quello che aspetta un merge | ✅ |
| AR-651 | gli id delle lezioni coniati a mano, senza un punto di scrittura | ✅ (3 casi) |
| AR-666 | l'ora scritta a mano in dieci punti del cervello | ✅ (tutti e 10, uno per uno) |
| AR-672 | il fuso di Roma cablato in due file del Pannello | ✅ |
| AR-677 | il perimetro dei moduli contato a metà | ✅ |
| AR-679 | il guardiano del registro puniva il deferral che risolve il doppione | ✅ |
| AR-680 | un guardiano che partiva da solo appena importato | ✅ |
| AR-681 | un registro illeggibile nascosto dietro un elenco vuoto | ✅ (2 casi) |
| AR-687 | il vincolo cronico del giro che si ripeteva uguale | ✅ (4 casi) |
| AR-689 | due script fuori dalla porta che mette il tetto alle letture di git | ✅ |
| AR-700 | il censimento fermo al primo livello di cartelle | ✅ (6 casi su 7) |
| AR-704 | la malattia «una parola con due padroni» senza un nome da cercare | ✅ |

Nessuno di questi l'ho toccato: il codice era già a posto. Si chiudono al merge, con la loro prova
già sulla scheda.
