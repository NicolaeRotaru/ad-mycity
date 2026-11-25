---
data: 2026-11-25 13:37
titolo: Termini, prossima versione — la lista delle correzioni
reparto: legale-privacy
stato: bozza, da far validare a un legale abilitato prima dell'uso reale
voci: 1
decisione: Nicola, 2026-11-25 13:30 — la frase va corretta, ma nella prossima versione, non adesso
---

# Termini: cosa correggere nella prossima versione

**Bozza, da far validare a un legale abilitato prima dell'uso reale.**

## In parole semplici

Questa è la lista delle correzioni da fare ai Termini la prossima volta che li cambiamo.
Per ora c'è una voce sola: la frase su cosa chiediamo a negozi e fattorini prima di approvarli.
La frase di oggi promette cose che il sito non fa.
Dice che al negozio chiediamo il documento d'identità, e il sito non lo chiede.
Dice che al fattorino chiediamo sempre la polizza, e a chi va in bici il sito non la chiede.
In breve: il testo è rimasto indietro rispetto al sito, e va rimesso in pari.

## Cosa cambia per te

Oggi niente: hai deciso tu di aspettare, il 25/11 alle 13:30.
Ogni cambio dei Termini alza il numero della versione.
Con la versione nuova, tutti gli iscritti devono riaccettare prima del prossimo ordine, clienti compresi.
Per questo la correzione aspetta qui, insieme alle prossime.

## Cosa devi fare

Oggi niente.
Il giorno che decidi di cambiare versione, i passi sono tre.
Primo: fai leggere la frase nuova a un legale abilitato.
Secondo: manda ai negozi un'email almeno 30 giorni prima, anche se secondo me è una correzione.
Terzo: lo sviluppatore incolla i due testi pronti che trova in fondo a questo file.

## Cosa non ho verificato

- Ho letto il codice del sito, ma non ho provato i moduli dal telefono come un negoziante.
- Il testo del Regolamento europeo sulle piattaforme non l'ho potuto riaprire: il sito ufficiale non era raggiungibile da qui.
- I 15 giorni minimi di preavviso li cito a memoria, uguali a quanto scritto dalla squadra il 7/11.
- Non so se i pagamenti Stripe ai fattorini sono già accesi in produzione.
- La classificazione «correzione» è un mio giudizio: la decide un legale, non io.

## Voce 1 — Cosa chiediamo a negozi e fattorini per approvarli

**Dove:** Termini, sezione «3. Registrazione e account», secondo paragrafo.

### La frase di oggi

> Verifica email obbligatoria. Per Venditori e Rider è inoltre richiesta la verifica KYC (documento d'identità, codice fiscale, P.IVA se applicabile, IBAN, assicurazione RC per i Rider).

### La frase proposta

> Verifica email obbligatoria. Per essere approvato, il Venditore indica la partita IVA e nome, cognome, codice fiscale, data di nascita e residenza del titolare o legale rappresentante. Per ricevere i pagamenti aggiunge poi IBAN, ragione sociale e sede legale. Per essere approvato, il Rider indica i suoi dati anagrafici e carica un documento d'identità e un selfie con il documento. Chi consegna in scooter o in auto carica anche patente e polizza di responsabilità civile in corso di validità.

**Perché scritta così.**
Dice «indica» e «carica», non «verifichiamo»: elenca cosa chiediamo, non promette controlli che non facciamo.
Toglie la sigla KYC, cioè «conosci il tuo cliente».
È la sigla dei controlli antiriciclaggio di banche e simili, che un marketplace non è tenuto a fare.
Usa le parole «Venditore» e «Rider» perché sono quelle definite al punto 1 dei Termini.
L'IBAN del fattorino resta fuori di proposito: non serve per essere approvato.
Il fattorino lo collega su Stripe dalla pagina dei guadagni, e MyCity non lo conserva.
Il controllo «in corso di validità» invece lo facciamo davvero: con patente o polizza scaduta il sito non approva.

### Correzione di errori materiali o modifica sostanziale?

**Il mio giudizio: correzione di errori materiali, quindi non sostanziale.**
Il motivo è uno: la frase nuova non chiede a nessuno niente di più di quello che il sito chiede già oggi.

- **Ai clienti:** non cambia niente, la frase non li riguarda.
- **Ai negozi:** il documento d'identità sparisce, ed è un vantaggio. Data di nascita e residenza compaiono nel testo, ma il sito le chiede già dal 25/11. La partita IVA era già obbligatoria: il punto 1 dei Termini dice che il Venditore è «titolare di partita IVA».
- **Ai fattorini in bici:** spariscono patente e polizza, ed è un vantaggio.
- **Ai fattorini in scooter o in auto:** compaiono patente e selfie, che il sito chiede già. La patente per guidare la impone comunque la legge.

**Il punto debole, detto chiaro.**
In senso stretto un «errore materiale» è una svista di scrittura.
Qui invece il testo era giusto quando è nato, e poi è rimasto indietro rispetto al sito.
Un legale potrebbe chiamarlo «aggiornamento», ma l'effetto pratico non cambia: nessun obbligo nuovo per nessuno.

**Perché ai negozi manderei comunque l'email 30 giorni prima.**
Il Regolamento europeo sulle piattaforme vale per i negozi, non per clienti e fattorini.
Per qualunque cambio dei Termini chiede un preavviso scritto ai negozi di almeno 15 giorni.
Non fa eccezioni per le correzioni, che io sappia.
In più i nostri Termini, alla sezione 15, legano «30 giorni» proprio a quel Regolamento.
Un negozio potrebbe leggerci 30 giorni per ogni cambio, non solo per i sostanziali.
Mandare l'email 30 giorni prima costa zero e chiude tutte e due le letture.
E se la stessa versione avrà anche modifiche sostanziali, i 30 giorni servono comunque per tutti.

### La riga per la pagina di riaccettazione

È la frase che vede chi deve riaccettare, sotto «cosa cambia».
Dice ai clienti, in mezza riga, che la voce non li riguarda.
Il testo esatto, da copiare, è sotto la riga dei dettagli tecnici.

### Privacy (GDPR)

**La frase nuova non crea nessun trattamento di dati nuovo: tutti i dati elencati li raccogliamo già oggi.**
Le basi giuridiche, cioè il motivo legale per cui possiamo trattare un dato, restano quelle dell'informativa.
Per documenti, selfie, patente e polizza valgono il contratto e l'interesse legittimo alla sicurezza della piattaforma.
Per partita IVA, ragione sociale, sede e IBAN del negozio valgono il contratto e l'obbligo di legge per la fattura.

Ho trovato due buchi nell'informativa privacy, a basso rischio.
1. Nell'elenco dei dati manca la **data di nascita**, che chiediamo al titolare del negozio e al fattorino.
2. Il **codice fiscale** compare solo fra i dati dei negozi, ma lo chiediamo anche ai fattorini.

La base giuridica della data di nascita è il contratto: serve a controllare i 18 anni.
Il rischio è basso: per i dati chiesti direttamente alla persona l'elenco completo non è obbligatorio.
Ma l'elenco che pubblichiamo è incompleto, e va sistemato nella stessa versione.
Così il cambio di versione è uno solo, e la riaccettazione pure.

---

**Dettagli tecnici**

### Il motivo, riga per riga

Codice del sito: repo `mycity`, letto in sola lettura il 2026-11-25 alle 13:35.

**1. La sigla KYC.** Il sito non fa controlli antiriciclaggio. Lo staff approva a mano. Il server rifiuta l'approvazione se mancano i dati richiesti.
- `lib/admin/regole-approvazione.ts`, funzione `motivoPerNonApprovare` alla riga 154.
- `app/privacy/page.tsx`, nota R21-009 alle righe 156-159: un marketplace non risulta fra i soggetti obbligati all'antiriciclaggio.

**2. Il documento chiesto al negozio.** Il negozio non carica nessun documento.
- `lib/admin/regole-approvazione.ts` righe 36-43: `DOCUMENTI_OBBLIGATORI.seller` è vuoto.
- Stesso file, commento sopra: «il modulo /sell non chiede di caricarne».

**3. Il documento chiesto al fattorino.** Qui la frase di oggi è giusta: fronte del documento e selfie valgono con ogni mezzo.
- `lib/admin/regole-approvazione.ts` righe 37-39.
- `app/rider/onboarding/page.tsx` righe 31-33.

**4. Il codice fiscale.** Al negozio si chiede quello del titolare, prima dell'approvazione. Al fattorino si chiede nei dati anagrafici.
- `components/seller/DatiDelTitolare.tsx` riga 30.
- `app/api/seller/titolare/route.ts` riga 32.
- `lib/admin/regole-approvazione.ts` righe 195-200.
- `app/rider/onboarding/page.tsx` riga 282.

**5. La partita IVA «se applicabile».** Per il negozio è obbligatoria e il server la controlla: servono 11 cifre su 11, con l'ultima di controllo giusta. Al fattorino non si chiede.
- `lib/admin/regole-approvazione.ts` righe 179-185.
- `components/SellerApplicationForm.tsx` righe 29 e 56.
- `app/terms/page.tsx` riga 80: il punto 1 dei Termini definisce il Venditore come titolare di partita IVA.

**6. L'IBAN.** Il negozio lo scrive nel Profilo dopo l'approvazione. Quello del fattorino va al fornitore dei pagamenti, come spiegato sopra. In nessuno dei due casi serve per essere approvati.
- `components/seller/DatiPerIBonifici.tsx` righe 25-32.
- `components/SellerApplicationForm.tsx` riga 308: «IBAN e dati per la fattura li aggiungi dal tuo pannello, a negozio approvato».
- `app/api/stripe/connect/rider-onboarding/route.ts` righe 13-16.
- `app/rider/earnings/page.tsx` righe 183-203.

**7. La polizza RC per i fattorini.** Si chiede con scooter e auto. In bici no. Se il mezzo non è dichiarato, si chiede tutto.
- `lib/admin/regole-approvazione.ts` riga 57: `RC_OBBLIGATORIA_PER_LA_BICI = false`.
- Stesso file, righe 64-70: la funzione `documentiObbligatoriDelFattorino`.

**8. Data di nascita e residenza del titolare, che oggi mancano.** Senza, i dati del titolare non si salvano. Senza data di nascita lo staff non approva.
- `app/api/seller/titolare/route.ts` righe 33-36.
- L'elenco `titolare` in `regole-approvazione.ts`, già citato al punto 4.

**9. Il selfie e la patente, che oggi mancano.** Il selfie lo carica ogni fattorino. La patente solo chi usa un mezzo a motore.
- `app/rider/onboarding/page.tsx` righe 33-34.
- `lib/admin/regole-approvazione.ts` righe 39-40 e 64-70.

**10. Le scadenze, che oggi mancano.** Il server legge la data di scadenza di patente e polizza. Se è passata, o se manca, blocca l'approvazione.
- `lib/admin/regole-approvazione.ts` riga 99: la funzione `scadenzeNonValide`.
- Stesso file, riga 168: il punto in cui viene chiamata.

### Il testo pronto per `app/terms/page.tsx`

Sostituisce il secondo paragrafo della sezione `id="registrazione"` (oggi righe 130-134).

```tsx
<p>
  <strong>Verifica email</strong> obbligatoria. Per essere approvato, il Venditore indica la
  partita IVA e nome, cognome, codice fiscale, data di nascita e residenza del titolare o legale
  rappresentante. Per ricevere i pagamenti aggiunge poi IBAN, ragione sociale e sede legale. Per
  essere approvato, il Rider indica i suoi dati anagrafici e carica un documento d&apos;identità e
  un selfie con il documento. Chi consegna in scooter o in auto carica anche patente e polizza di
  responsabilità civile in corso di validità.
</p>
```

### La riga per `COSA_CAMBIA_NEI_TERMINI` in `lib/legal/versione.ts`

Quando la versione sale, l'elenco si riscrive da capo: le 4 voci di `terms-3.0` escono, entrano quelle nuove.

```ts
  'per negozi e fattorini: quali dati e documenti chiediamo prima di approvare l\'account',
```

### Privacy: dove stanno i buchi

- `app/privacy/page.tsx` riga 86: «Dati anagrafici e di contatto» non elenca la data di nascita.
- `app/privacy/page.tsx` riga 88: il codice fiscale sta solo sotto «Dati fiscali (Venditori)».
- Basi giuridiche citate: riga 160 (verifica dell'identità: art. 6.1.b e 6.1.f GDPR), riga 150 (fatturazione: art. 6.1.c).
- Il selfie lo confronta lo staff a occhio, senza riconoscimento automatico. Se un giorno arrivasse un riconoscimento automatico, diventerebbe dato biometrico (art. 9 GDPR) e servirebbe un'analisi a parte.
- Art. 13 contro art. 14 GDPR: l'elenco delle categorie di dati è obbligatorio solo se i dati non arrivano dalla persona (art. 14.1.d). Da riconfermare con il legale.
- Se si correggono questi due buchi, sale anche la parte privacy della versione (oggi `privacy-2.0`): un solo cambio di `VERSIONE_TESTI_LEGALI`, una sola riaccettazione.

### Norme citate e quanto sono sicure

- Reg. UE 2019/1150, art. 3: preavviso su supporto durevole di almeno 15 giorni per i cambi dei termini verso i negozi. Eccezioni: obbligo di legge, pericolo imminente di frode, malware, spam o violazione di dati. Citato a memoria: EUR-Lex non raggiungibile dalla sessione del 25/11. Stesso riferimento in `consegne/accoglienza-negozi/2026-11-07-pane-quotidiano/02-obblighi.md` riga 62.
- Termini, sezione 15 (`app/terms/page.tsx` righe 422-443): 30 giorni per le modifiche sostanziali; righe 439-443 legano i 30 giorni al Reg. 2019/1150.
- Registro dei fatti, `legale.termini-riaccettazione` (Nicola, 31/10/2026): chi è iscritto riaccetta al primo accesso dopo il cambio, prima di ordinare.
