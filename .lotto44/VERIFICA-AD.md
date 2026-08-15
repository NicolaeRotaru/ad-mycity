# Corsia dell'AD — i difetti già riparati e mai chiusi

Non tutti i 184 difetti «aperti» sono difetti vivi. Il lotto 43 ha riparato, provato e mutato una
parte del cantiere, ma la timbratura gira **solo dopo il merge** (`auto-fix.mjs verifica --applica`)
e non è mai passata. Quello è **debito di chiusura**, non debito di riparazione — e vale la pena
distinguerli, perché un cantiere che conta il primo come il secondo dice a Nicola un numero più
brutto del vero.

## Cosa ho verificato, e come

Su un worktree fermo al commit di partenza (`4a4c6ff`, cioè `origin/main`), fuori dall'albero dove
le corsie stanno lavorando — così nessun rosso e nessun verde è di qualcun altro.

Due passi per ognuno, quelli del mansionario:
1. **La prova gira ed è verde.**
2. **La mutazione la fa diventare rossa** (`node cervello/non-vacuita.mjs --difetti …`): il pezzo di
   codice che rende vero il fix viene rimesso com'era col difetto, e il test deve accorgersene.

## Esito: 12 su 12

| difetto | cosa era rotto | la mutazione l'ha fatto diventare rosso |
|---|---|---|
| AR-458 | il freno mai costruito confuso con quello che aspetta un merge | ✅ |
| AR-651 | gli id delle lezioni coniati a mano, senza un punto di scrittura | ✅ (3 casi) |
| AR-666 | l'ora scritta a mano in dieci punti del cervello | ✅ (tutti e 10 i file, uno per uno) |
| AR-672 | il fuso di Roma cablato in due file del Pannello | ✅ |
| AR-677 | il perimetro dei moduli contato a metà | ✅ |
| AR-679 | il guardiano del registro puniva il deferral che risolve il doppione | ✅ |
| AR-680 | un guardiano che partiva da solo appena importato | ✅ |
| AR-681 | un registro illeggibile nascosto dietro un elenco vuoto | ✅ (2 casi) |
| AR-687 | il vincolo cronico del giro che si ripeteva uguale | ✅ (4 casi) |
| AR-689 | due script fuori dalla porta che mette il tetto alle letture di git | ✅ |
| AR-700 | il censimento fermo al primo livello di cartelle | ✅ (6 casi su 7) |
| AR-704 | la malattia «una parola con due padroni» senza un nome da cercare | ✅ |

Nessuno di questi l'ho toccato: il codice era già a posto. Si chiudono da soli al merge, con la loro
prova già sulla scheda.

## Cosa NON ho verificato — dichiarato, non taciuto

- Tre mutazioni portano un nome segnaposto invece della frase che dice cosa si rompe: AR-458,
  AR-680, AR-704 hanno tutte e tre «il cuore del fix». **Funzionano** (rendono rosso il test), ma chi
  le legge fra sei mesi non sa cosa stia guardando. È un difetto di scrittura del registro delle
  mutazioni, piccolo e vero: lo registro invece di lasciarlo lì.
- Restano fuori da questo conto i difetti la cui prova è **condivisa** con altri
  (`prova-che-non-puo-fallire.test.mjs` da sola è la prova di otto difetti). Un test dato a otto
  difetti che non li nomina tutti ne chiuderebbe sette mai toccati: quelli li verifica uno per uno
  la corsia che li ha in carico, non questa scorciatoia.
