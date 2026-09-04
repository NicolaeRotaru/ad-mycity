---
tipo: procedura
reparto: devops-sre
data: 2026-09-04 10:20
colore: 🔴
stato: pronta — aspetta Nicola
card: "#192"
---

# Come rimetti in piedi il nome del sito su Vercel, passo per passo

> **In due righe.** Il nome `mycity-marketplace.com` porta ancora al vecchio server spento.
> Per farlo portare al sito vero bastano due righe da cambiare nel pannello dove l'hai
> comprato. Non serve nessun trasferimento.

Questo documento parla del **nome del sito**, non del sito. Sono due cose separate, ed è la
confusione fra le due che fa sembrare difficile il lavoro. Il sito è il negozio. Il nome è
il cartello stradale che dice dove sta il negozio.

**In parole semplici.** Il cartello oggi indica il vecchio server Render, che abbiamo spento
a fine luglio. Il negozio invece si è trasferito: sta su Vercel, ed è aperto. Non devi
spostare il negozio. Devi girare il cartello.

**Cosa cambia per te.** Chi digita l'indirizzo che sta sui QR e sui volantini arriva sul
marketplace. Oggi non ci arriva nessuno. L'ultima volta che quell'indirizzo ha risposto bene
è il 30 luglio, cioè 36 giorni fa. Finché resta così, ogni euro speso in comunicazione porta
le persone davanti a una porta chiusa.

**Cosa devi fare.** I sei passi qui sotto, in ordine. Ti servono due pannelli: quello di
Vercel e quello dove il nome è registrato. Sono circa dieci minuti di lavoro tuo. Poi c'è
l'attesa: di solito da pochi minuti a qualche ora, perché il cambio si veda in tutto il
mondo.

**Cosa non ho verificato.** Chi gestisce il nome. Ho letto «Netsons» nella tabella dei
fornitori del manuale del sito. Non l'ho visto dal pannello vero. Se apri e trovi un altro
gestore, i passi restano identici: cambia solo dove clicchi. Non ho potuto bussare al sito
da qui, perché la rete di questa sessione blocca le chiamate in uscita. La prova finale la
puoi fare solo tu. E non so cosa c'è scritto oggi nelle caselle delle variabili su Vercel:
quella parte va guardata mentre sei lì.

---

## Prima di tutto: quale dei tre "spostamenti" ti serve

«Spostare il dominio su Vercel» può voler dire tre cose diverse. Vale la pena saperlo. Due
delle tre non ti servono, e costano tempo.

| | Cosa fa | Quanto dura | Ti serve? |
|---|---|---|---|
| **1. Giri il cartello** | Il nome resta comprato dov'è, e inizia a portare su Vercel | 10 minuti + attesa | ✅ **Sì, è questo** |
| **2. Sposti la gestione tecnica** | Vercel diventa il pannello di tutti i record del nome, posta compresa | mezz'ora, e devi ricopiare ogni riga | Solo se vuoi un pannello solo |
| **3. Trasferisci la proprietà** | Il nome cambia casa: lo paghi a Vercel invece che al gestore di oggi | 5-7 giorni, serve il codice di trasferimento | ❌ No |

La strada 1 è la più veloce. È anche la più facile da annullare: rimetti il valore di prima
e sei tornato indietro. La strada 3 non c'entra col far funzionare il sito. È una pratica di
proprietà, non una configurazione.

**Ti serve la strada 1.** Il resto del documento è la strada 1.

---

## Passo 1 — Fotografa quello che c'è adesso

Entra nel pannello del gestore del nome, sezione DNS. **Copiati l'elenco dei record com'è
oggi.** Basta uno screenshot. Ti serve per due motivi: per tornare indietro, e per non
toccare per sbaglio le righe della posta.

⚠️ **Due tipi di riga non si toccano mai.** Le righe `MX`, e le righe `TXT` che parlano di
posta: quelle che contengono `v=spf1`, `DKIM`, `_dmarc`. Se le cancelli, il sito smette di
mandare email. Anche le conferme d'ordine. E il guaio non si vede subito: si vede quando un
cliente ti scrive che non ha ricevuto niente.

Le righe da cambiare sono **due sole**: quella del nome nudo e quella del `www`.

## Passo 2 — Aggiungi il nome su Vercel

Fallo prima di toccare il pannello del nome, non dopo.

Vercel → progetto **mycity** → **Settings**, cioè le impostazioni → **Domains** →
**Add Domain**.

Scrivi `mycity-marketplace.com` e conferma. Vercel ti propone anche il `www` e ti chiede
quale dei due è il principale. Scegli il nome nudo come principale, e lascia che il `www`
faccia da rimando. Così esiste un solo indirizzo buono. Google non vede due siti gemelli.

Adesso Vercel mostra il nome in giallo, con scritto «Invalid Configuration». Sotto ci sono
**i record esatti da mettere**. Quelli sono la verità. Gli indirizzi cambiano da account ad
account: copia i suoi, non valori presi altrove.

## Passo 3 — Cambia le due righe

Torna nel pannello del nome, sezione DNS. **Modifica** le righe che ci sono già. Non
aggiungerne di nuove accanto: resterebbero tutt'e due, e il sito risponderebbe a caso.

- riga **`@`**, tipo **A**: al posto di `216.24.57.1` metti l'indirizzo che ti ha dato
  Vercel;
- riga **`www`**, tipo **CNAME**: metti il valore che ti ha dato Vercel.

Se il pannello ti fa scegliere il TTL, mettilo a 300 secondi **prima** di salvare. Il TTL è
per quanto tempo il resto del mondo si ricorda la risposta vecchia. Basso vuol dire che un
ripensamento fa effetto in cinque minuti invece che in ore.

## Passo 4 — Aspetta il verde su Vercel

Ricarica la pagina Domains. Quando la configurazione è giusta il nome diventa verde, e
Vercel emette da solo il certificato di sicurezza: è quello che accende il lucchetto.

Se dopo un'ora è ancora giallo, il valore nuovo non è arrivato. Ricontrolla di aver
modificato la riga giusta, e di non averne creata una seconda.

## Passo 5 — Dì al sito come si chiama

Questo passo si dimentica sempre. Senza, il sito funziona ma si presenta male.

Vercel → progetto mycity → Settings → **Environment Variables**, cioè le variabili
d'ambiente → ambiente **Production**:

```
NEXT_PUBLIC_APP_URL = https://mycity-marketplace.com
```

Poi ripubblica: Deployments → l'ultima → Redeploy. Le variabili vengono lette quando il sito
viene costruito, non dopo.

Senza questa riga il sito scrive il proprio indirizzo sbagliato in tre posti che contano. Il
`canonical`, cioè l'indirizzo ufficiale che legge Google. L'anteprima dei link condivisi. E
il ritorno dal pagamento dopo Stripe. Ad agosto lì c'era scritto `http://localhost:3000`,
che è l'indirizzo di un computer che parla con se stesso. Nessun errore lo segnalava.

## Passo 6 — Guarda con i tuoi occhi

1. Finestra anonima → `https://mycity-marketplace.com`. Deve aprirsi il marketplace, col
   lucchetto accanto all'indirizzo.
2. `https://www.mycity-marketplace.com`. Deve saltare da solo sul nome senza `www`.
3. `https://mycity-marketplace.com/api/health`. È la pagina che dice come sta il sito. Se
   risponde «unhealthy» o «degradato», il nome è a posto ma manca qualche chiave. È un altro
   problema, non questo.

---

## Dopo: tre cose che il cambio di nome tocca di rimbalzo

Vivono in pannelli esterni, quindi da qui non le ho potute controllare. Vanno guardate tutte
e tre, perché un indirizzo nuovo le riguarda.

1. **Stripe.** L'indirizzo a cui Stripe manda l'avviso di pagamento riuscito. Se punta al
   vecchio nome, va rimesso sul nuovo.
2. **Supabase.** L'elenco degli indirizzi ammessi per il rientro dopo il login. Se il nome
   nuovo non è in elenco, chi accede viene sbattuto fuori.
3. **Google Search Console.** Chiedi la riscansione, così Google smette di avere in memoria
   un sito morto.

---

## Cosa ho verificato io oggi, e come

| Cosa | Come l'ho visto | Esito |
|---|---|---|
| Dove porta oggi il nome nudo | risoluzione dal container | `216.24.57.1`, cioè Render |
| Dove porta il `www` | risoluzione dal container | ancora Render |
| Domini sul progetto Vercel | chiavi di Vercel | due soli indirizzi tecnici, nessun nome vero |
| La protezione blocca il nome nuovo? | chiavi di Vercel | **No**: è accesa «tutto tranne i domini personalizzati» |
| Piano e regione | chiavi di Vercel | Pro, funzioni a Parigi |
| Chi gestisce il nome | manuale del sito | Netsons, **da confermare aprendo il pannello** |

La riga sulla protezione corregge una preoccupazione scritta nella card #192. Lì era segnato
che forse avresti trovato la schermata di accesso di Vercel al posto del sito. Con
l'impostazione che ho letto oggi non succede: la protezione salta apposta i nomi
personalizzati. Se comunque la vedessi, si toglie da Settings → Deployment Protection.

## Perché questo lavoro non è rischioso

Di solito spostare un dominio spaventa, perché si rompe una cosa che prima funzionava. Qui
no. Quell'indirizzo è già rotto: punta a un server spento. L'unico rischio vero è di mano —
toccare le righe della posta mentre cambi le altre due. Per quello c'è il passo 1.
