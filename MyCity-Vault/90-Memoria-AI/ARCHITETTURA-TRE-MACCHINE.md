---
titolo: Architettura a tre macchine — Centro, Piazza, Bottega
data: 2026-08-01 00:00
tipo: nota di architettura (visione + come si costruisce)
stato: proposta — nessuna riga di codice scritta, nessuna spesa impegnata
colore: 🟢 (documento di studio; ogni passo esecutivo resta 🟡/🔴 con firma di Nicola)
---

# 🏗️ Le tre macchine

> **Oggi:** una sola macchina (questo repo) è insieme AD, gestore del marketplace e
> operaio. Legge il marketplace in sola lettura, decide, prepara, e mette in coda a
> Nicola le azioni che toccano il mondo reale.
>
> **Domani (visione di Nicola, 1/8/2026):** tre macchine, una sopra l'altra, ognuna
> con un mestiere solo.

```
        NICOLA  (una sola coda di firme, una sola Cabina)
          ▲
          │ referti · richieste di firma 🔴
   ┌──────┴───────────────────────────────────────────────┐
   │  ①  CENTRO OPERATIVO   — l'AD dell'AZIENDA           │
   │     strategia · soldi · squadra · governo · memoria  │
   └──────┬──────────────────────────────┬────────────────┘
          │ mandato ▼   referto ▲        │ mandato ▼  referto ▲
   ┌──────┴───────────────────┐   ┌──────┴──────────────────────┐
   │  ②  PIAZZA               │   │  ③  BOTTEGA                 │
   │  gestisce IL MARKETPLACE │   │  il servizio ai NEGOZIANTI  │
   │  (una per città)         │   │  UNA macchina, N negozi     │
   └──────┬───────────────────┘   └──────┬──────────────────────┘
          │ mani in scrittura            │ mani per conto del negozio
          ▼                              ▼
   marketplace mycity              negozio 1 · negozio 2 · … · negozio N
```

Tre nomi per non confonderci mai più (il termine «worker» oggi significa già
un'altra cosa: il processo che gira sul VPS e svuota la coda `lavori`):

| | Nome | Mestiere | Chi è il suo «capo» | Chi firma i suoi 🔴 |
|---|---|---|---|---|
| ① | **CENTRO** | l'azienda MyCity | Nicola | Nicola |
| ② | **PIAZZA** | il marketplace di una città | il CENTRO | Nicola (via CENTRO) |
| ③ | **BOTTEGA** | il negozio del singolo commerciante | il CENTRO (che lo vende) | **il negoziante**, per casa sua |

---

## ① CENTRO OPERATIVO — cosa resta qui
È questo repo, alleggerito. Smette di essere l'operaio del marketplace e diventa il
posto dove si **decide, si firma e si ricorda**:

- strategia, priorità, dove giocare e dove no;
- i soldi dell'azienda (margini, cassa, budget, banche, bandi);
- la squadra dei 120 senior e il loro governo (mansionari, guardiani, apprendimento);
- **la memoria unica dei fatti** (`registro-fatti.json`) e la Cabina di Nicola;
- il **mandato** che dà alle altre due macchine, e il giudizio sui loro referti.

Cosa **non** fa più: aprire il codice del marketplace, guardare le tabelle riga per
riga, rispondere ai clienti di un negozio. Quelle diventano mani di ② e ③.

## ② PIAZZA — la macchina che gestisce il marketplace
Fa oggi il lavoro che oggi fa l'AD sul marketplace, ma **a tempo pieno e con le mani
vere**: catalogo, vetrine, prezzi entro un intervallo deciso, ordini e consegne, bug
del sito, deploy in anteprima, salute della piattaforma.

Due differenze grosse rispetto a oggi:
1. **Ha le chiavi in scrittura** sul marketplace (oggi l'AD è cieco in scrittura: può
   solo proporre). Le chiavi vivono lì e **solo** lì: il CENTRO non le possiede.
2. **È replicabile per città.** Piacenza è una PIAZZA. Parma sarà una seconda PIAZZA:
   stesso codice, dati e memoria propri, stesso mandato dal CENTRO.

## ③ BOTTEGA — il servizio venduto ai negozianti
Un «impiegato digitale» per ogni commerciante: risponde ai suoi clienti, tiene il suo
catalogo, scrive i suoi post, gli dice cosa sta finendo e quanto ha incassato oggi.
Il commerciante lo usa dal telefono (o da WhatsApp), non da un terminale.

**È UNA macchina sola per tutti i negozi.** Il punto della sezione seguente.

---

# 🔑 Come fa UN worker a servire TUTTI i negozi

## Perché NON uno per negozio
Una macchina per negozio sembra la strada semplice. È la trappola:
- **costo**: ogni copia è un processo acceso, un database, un backup, un log da guardare;
- **manutenzione**: una migliorìa va copiata 40 volte a mano, e alla quarantesima le
  copie non sono più uguali (è così che nascono i bug che nessuno riesce a riprodurre);
- **guasti**: 40 macchine = 40 cose che si rompono in 40 modi diversi;
- **prezzo di vendita**: se ogni cliente costa una macchina, il canone non regge.

## Come si fa invece: **una macchina, tanti inquilini** (multi-tenant)
La regola madre: **quello che è UGUALE per tutti è codice e si scrive una volta sola.
Quello che è DIVERSO per ognuno è un DATO, e sta in una riga con sopra il nome del
negozio.** Non si duplica mai la macchina per personalizzarla: si duplica una scheda.

**Uguale per tutti (una copia sola):**
- il cervello e i mansionari degli agenti;
- le procedure (rispondi al cliente, aggiorna il prezzo, prepara il post);
- i guardiani, i cancelli 🟢🟡🔴, il registro delle azioni.

**Diverso per ogni negozio (una scheda + uno spazio suo):**
- **profilo**: chi è, cosa vende, orari, tono di voce, cosa non deve mai dire;
- **memoria**: quello che ha imparato su *quel* negozio e sui *suoi* clienti;
- **chiavi**: i suoi account (social, gestionale, Stripe) in cassaforte cifrata;
- **regole di firma**: cosa quel commerciante ha autorizzato a fare da solo;
- **budget**: quanto può consumare al mese.

### I sei meccanismi che lo rendono possibile
1. **`negozio_id` su ogni riga, ovunque.** Nessuna tabella senza. Un lavoro nasce già
   marchiato col negozio a cui appartiene.
2. **Il muro nel database (RLS).** Non è il buon senso dell'AI a tenere separati i dati:
   è il database che *rifiuta* di restituire le righe di un altro negozio. Anche se
   l'AI sbagliasse la query, non le arriva niente. Questo è lo stesso meccanismo che il
   marketplace già usa perché un venditore veda solo i suoi ordini.
3. **La coda unica con le corsie.** C'è una sola coda di lavori, come oggi
   (`lavori` su Supabase). Ogni lavoro porta il suo `negozio_id`. Il worker prende i
   lavori **a turno tra i negozi**, non in ordine di arrivo: così un negozio che
   accoda 200 lavori non lascia gli altri 39 in attesa. Ogni negozio ha una quota
   (quanti lavori insieme, quanto può spendere al mese) e un interruttore proprio.
4. **Il contesto isolato per lavoro.** Quando parte un lavoro, la macchina carica
   **solo** la scheda e la memoria di quel negozio. Il testo del lavoro non contiene
   mai una riga di un altro negozio: non è una policy, è come si costruisce il lavoro.
5. **I segreti mai nel discorso.** Le chiavi del negoziante stanno in cassaforte,
   vengono montate per la durata del lavoro e non entrano mai nel testo che l'AI legge
   o scrive.
6. **Il guasto resta dentro una casa.** Timeout, tentativi finiti, lavoro scaduto,
   negozio che va in loop: si spegne quella corsia, gli altri 39 negozi non se ne
   accorgono. (È la cura che il worker di oggi ha già imparato a fare sui lavori
   orfani: si riusa, non si reinventa.)

### Cosa succede quando entra il negoziante numero 41
Non nasce una macchina. Nasce **una riga**: si compila la sua scheda (20 minuti di
intervista, che è già il mestiere del senior `onboarding-negozi`), si aprono il suo
spazio di memoria e la sua cassaforte, si sceglie cosa può fare da solo e cosa deve
firmare lui. Da quel momento la stessa macchina lo serve come serve gli altri quaranta.

### Il vantaggio che ripaga tutto
Una migliorìa si scrive **una volta** e la mattina dopo **tutti i negozi** ce l'hanno.
E ogni negozio insegna a tutti gli altri: le lezioni si estraggono come **regole
anonime** («le risposte sotto i 30 minuti raddoppiano il riordino»), mai come dati —
i dati di un negozio non escono dalla sua casa, nemmeno per imparare.

### I due rischi veri (e come si tengono)
- **Il testo dei clienti non è un ordine.** Un messaggio, una recensione o una scheda
  prodotto possono contenere frasi scritte apposta per farsi obbedire dall'AI. Regola:
  quel testo è **materiale**, mai un comando. Le istruzioni vengono solo dal mandato.
- **Il conto che esplode.** Un negozio che chiede troppo consuma soldi veri: tetto
  mensile per negozio, avviso a metà, stop automatico. È l'estensione del freno costi
  che il CENTRO ha già.

---

# 🔗 Come il CENTRO comanda la PIAZZA (e la BOTTEGA)

Non a chiacchiere. Il rapporto tra due macchine è fatto di **quattro cose sole**:

1. **Il mandato** (scende). Un documento breve e verificabile: obiettivi del periodo,
   KPI di cui rispondi, budget, cosa puoi fare da sola (🟢), cosa fai avvisando (🟡),
   cosa non tocchi mai (🔴). È il mansionario di un reparto, ma tra macchine.
2. **Il referto** (sale). A ogni giro la PIAZZA consegna uno stato **strutturato**:
   numeri con la fonte, cosa ha fatto, cosa si è rotto, cosa chiede. Il CENTRO **legge
   il referto, non il marketplace**: è questo che gli libera la testa.
3. **L'escalation** (sale e si ferma da Nicola). Un 🔴 nato in PIAZZA («cambiare la
   commissione», «mandare una mail ai clienti») non lo firma la PIAZZA e non lo firma
   il CENTRO: sale nell'**unica** coda di firme di Nicola, con scritto chi lo chiede,
   cosa cambia e cosa succede se va bene. Una Cabina sola, come oggi.
4. **L'interruttore** (scende, sempre). Il CENTRO può fermare la PIAZZA in qualsiasi
   momento. Non può però **entrarle in casa**: non scrive nella sua memoria e non ha
   le sue chiavi. Chi comanda non esegue, chi esegue non firma — è la separazione dei
   poteri, la stessa che il senior `internal-audit` chiede ai processi umani.

Con la BOTTEGA vale lo stesso schema, con una differenza sostanziale: **il capo
operativo di ogni istanza-negozio è il negoziante**, non Nicola. Il CENTRO governa il
*servizio* (prezzo, qualità, limiti, cosa è vietato ovunque); il negoziante governa
*casa sua* (cosa si può dire ai suoi clienti, che sconti, che prezzi). Nicola non deve
finire a firmare i post di 40 negozi: firmerebbe 400 card al giorno e il sistema
morirebbe lì.

---

# 🚧 I cinque confini che non si passano mai
1. Un negozio non vede **mai** i dati di un altro negozio. Nessuna eccezione, nessuna
   scorciatoia «tanto è per fare una statistica» (le statistiche si fanno aggregate).
2. Una macchina **non scrive** nella memoria di un'altra. Si parla per mandati e referti.
3. Le chiavi di scrittura sul marketplace stanno **solo** in PIAZZA. I soldi e le firme
   dell'azienda stanno **solo** nel CENTRO.
4. **Una sola coda di firme** per Nicola. Il negoziante firma solo il suo negozio.
5. Nessuna macchina **modifica se stessa** senza firma umana — vale già oggi, vale a
   maggior ragione quando le macchine sono tre.

---

# 🪜 Come ci si arriva (senza fermare l'azienda)

**Fase 0 — oggi.** Una macchina fa tutto, cieca in scrittura sul marketplace.
Un solo negozio reale (Pane Quotidiano), sito fermo in attesa della migrazione a Vercel.

**Fase 1 — separare le MANI dentro casa** (nessuna macchina nuova).
Tutte le scritture verso il marketplace passano da un modulo unico con permessi propri
e log proprio — il pezzo esiste già in embrione (`cervello/marketplace.mjs aggiorna` +
`supervisione-negozi.mjs`). Da qui in avanti «chi tocca il marketplace» è **un posto solo**.
*Valore immediato anche se ci si ferma qui: un solo punto da sorvegliare.*

**Fase 2 — staccare la PIAZZA.**
Repo suo, memoria sua, worker suo, mandato e referto verso il CENTRO. Il CENTRO smette
di leggere le tabelle del marketplace: legge il referto. *Si fa quando il marketplace è
di nuovo in piedi e ha abbastanza vita da giustificare una macchina a tempo pieno.*

**Fase 3 — BOTTEGA pilota, con UN negozio ma già multi-negozio.**
Il `negozio_id`, il muro nel database e le corsie si mettono **dal primo giorno**, anche
col cliente numero uno. Aggiungerli dopo, su dati già mescolati, è il lavoro più caro e
più pericoloso che esista.

**Fase 4 — il servizio a canone.** 5-10 negozi paganti, quote e firme del negoziante,
prezzo costruito sul costo AI misurato nel pilota. Poi la seconda città = una seconda
PIAZZA, stesso codice.

---

# 🙋 Le decisioni che restano a Nicola
1. **Quando.** Questa architettura è la forma giusta per MyCity a 40 negozi e 2 città.
   Con 1 negozio reale e il sito fermo, costruirla oggi sarebbe lavoro pesante su
   un'ipotesi. La proposta: **Fase 1 ora** (costa poco, serve comunque), Fase 2 dopo la
   migrazione a Vercel e i primi negozi che incassano, Fase 3 quando c'è un commerciante
   che chiede il servizio.
2. **Il prezzo della BOTTEGA** — si può decidere solo dopo aver misurato il costo AI di
   un negozio vero per un mese. Prima è un numero senza fonte.
3. **Cosa può fare la BOTTEGA da sola in casa di un negoziante** — è la scelta che
   determina se il servizio è utile o è un giocattolo da approvare tutto a mano.
