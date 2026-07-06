---
titolo: "MyCity = la città online — la mappa completa degli strati e la sequenza per accenderli"
data: 2026-07-06 18:34
autore: corporate-strategy (senior AD MyCity)
tipo: strategia d'impresa (estensione del piano 3-strati)
stato: bozza per Nicola (🟢 documento reversibile)
riferimenti:
  - consegne/strategia/2026-07-06-piano-citta-online.md (il piano 3-strati, che questo ESTENDE, non sostituisce)
---

# MyCity = la città online — mappa multistrato

## Candore, in due righe
Il piano 3-strati (retail → servizi → C2C) è **giusto**, ma "città online" è più largo:
sotto sta un **motore trasversale** che va costruito una volta sola, e sopra ci sono strati
(ristorazione, eventi/prenotazioni, immobiliare, lavoro, civico, mobilità, turismo) che si accendono
solo se il precedente è **liquido**. **La sequenza È la strategia.** Aprire troppi strati mezzi vuoti
= liquidità dispersa = il modo classico in cui muoiono i marketplace.
Unico dato reale oggi: **1 negozio (Pane Quotidiano), 0 consegne.** Tutte le soglie qui sotto sono
**ipotesi di lavoro da tarare con te**, non numeri veri.

---

## 1. La mappa completa degli strati

**Strato 0 — Fondamenta trasversali (NON un verticale: si costruisce SOTTO tutto).**
Identità utente + fiducia/reputazione + pagamento (poi wallet locale) + consegna + dato di comportamento.
È l'infrastruttura riusata da ogni strato sopra. Il moat vero di MyCity vive qui, non nelle feature.

| # | Strato (verticale) | Cos'è | Moat / effetto-rete locale | Difficoltà (trust/reg./ops) | Eredita da | Monetizzazione |
|---|---|---|---|---|---|---|
| 0 | **Fondamenta** | Login, reputazione, pagamenti/wallet, consegna, dato | Altissimo — è il moat: densità + fiducia + wallet non si copiano con un assegno | Media (KYC, PSD2, sicurezza) | — | Indiretta (abilita tutto) + float wallet |
| 1 | **Retail esteso** | Botteghe non-food + food secco (casa, cura, sport, giochi, fiori) | Alto (cross-side negozi↔clienti + same-side negozi stessa via) | Bassa-media | 0 | Commissione + consegna + retail-media |
| 1b | **Ristorazione / food delivery** | Pranzo/cena a domicilio dai ristoranti locali | Alto ma **caro**: frequenza altissima MA ops h24 + margini sottili + Glovo/JustEat già lì | **Alta** (flotta, picchi, freschezza) | 0,1 | Commissione alta + fee consegna |
| 2 | **Servizi professionali + artigiani** | Avvocato, idraulico, estetista, muratore | Alto (fiducia + recensioni locali = decisivo) | Media (no logistica, ma qualità/dispute) | 0,1 | Lead-gen / commissione su preventivo / abbonamento pro |
| 3 | **Prenotazioni & appuntamenti** | Tavolo ristorante, parrucchiere, visita, campo | Medio-alto (abitudine ricorrente, poco presidiato local) | Bassa-media (no soldi movimentati, no consegna) | 0,1,2 | Fee per prenotazione / SaaS al negozio |
| 4 | **Eventi, cultura, tempo libero, biglietteria** | "Cosa fai stasera a Piacenza" + biglietti | Medio (aggregatore, non two-sided puro) | Bassa | 0,1 | Fee biglietto / sponsor / promo eventi |
| 5 | **Social locale / news di quartiere** | Bacheca, "cosa succede", passaparola, avvisi | **Altissimo** come rete MA il più difficile da monetizzare e moderare | **Alta** (moderazione, cold-start attenzione) | 0,1,4 | Indiretta (retention/traffico) + adv locale |
| 6 | **C2C / usato / bacheca** | Persona-a-persona: vendo l'usato, offro un passaggio | Altissimo (Vinted/Subito docet) MA trust tra sconosciuti | **Alta** (frode, moderazione, no-show, pagamenti P2P) | 0,2,5 | Fee transazione / spedizione / vetrina |
| 7 | **Lavoro locale** | Bacheca offro/cerco lavoro, gig locali | Medio (two-sided debole: match sporadici) | Media (privacy, no contratti-lavoro impropri) | 0,5,6 | Fee annuncio / featured / abbonamento aziende |
| 8 | **Immobiliare locale** | Affitti/vendite/stanze, agenzie e privati | Medio (transazione rara, ma alto valore) | Media (annunci fake, agenzie incumbent) | 0,5 | Fee annuncio / lead premium / partnership agenzie |
| 9 | **Mobilità** | Parcheggi, trasporto locale, sharing | Basso-medio per noi (infrastruttura fisica altrui) | **Alta** (dipende da terzi: Comune, gestori) | 0 | Fee/commissione — sottile; più leva-brand che ricavo |
| 10 | **Civico / pubblico** | Comune, servizi, associazioni, volontariato | **Strategico** (è "la città vera" → licenza a operare + fiducia) | Media (istituzionale, lento, non self-serve) | 0,relazioni-istituzionali | Quasi nulla diretta — è **moat reputazionale**, non ricavo |
| 11 | **Turismo / esperienze** | Cosa vedere/fare per chi viene a Piacenza | Basso (domanda esterna, non ricorrente) | Media | 0,1,4 | Commissione esperienze / partnership |

---

## 2. La sequenza raccomandata (il cuore)

**Regola d'oro: Strato 0 sotto tutto, poi UN verticale per volta, gate non date.**

**Sotto tutto → Strato 0 (Fondamenta).** Non si "accende" da solo: si costruisce *mentre* si fa il retail,
ma va progettato per essere **riusato**. Reputazione, wallet, consegna e dato costruiti col retail sono
esattamente ciò che ogni strato successivo eredita. Sbagliare qui (es. reputazione legata solo al negozio,
non alla persona) costringe a rifare tutto allo strato 2. **Progettare 0 = pensare per tutta la scala.**

**Sequenza dei verticali:**
1. **Retail esteso** (già in corso) — è la rampa: costruisce abitudine d'acquisto locale + consegna + reputazione.
2. **Ristorazione** — SOLO dopo densità retail. Va **prima dei servizi** *se* vuoi frequenza (si ordina cena
   più spesso di un idraulico) MA è caro in ops → possibile tenerla come **"quando la consegna gira davvero"**,
   non come secondo passo automatico. È l'unica scelta di sequenza davvero aperta: la decido con te.
3. **Servizi professionali + artigiani** — eredita la fiducia costruita: un preventivo lo chiedi a una app che *già usi*.
4. **Prenotazioni & appuntamenti** — a basso rischio (no soldi/consegna): ottimo per **estendere la frequenza**
   senza aggiungere complessità operativa. Può accendersi in parallelo ai servizi.
5. **Eventi / cultura** — leggero, aumenta apertura app quotidiana ("cosa faccio stasera") → nutre lo strato social.
6. **Social locale / news di quartiere** — solo su una città che **già vive** dentro MyCity. È il collante che
   fa aprire l'app anche senza voler comprare: massimizza retention, ma non ha senso a vuoto.
7. **C2C / usato** — penultimo: massimo effetto-rete, massimo rischio trust. Ha bisogno di identità+reputazione (0)
   e di massa attiva (5) già presenti.
8. **Lavoro, Immobiliare, Turismo** — strati "annuncio" a bassa frequenza: si aggiungono quando c'è già traffico
   da monetizzare, costano poco da accendere sopra la bacheca (5/6).
9. **Civico / pubblico** — trasversale e **continuo**, non un "passo": lo si coltiva dall'inizio con
   relazioni-istituzionali perché è la **licenza a operare** e il moat reputazionale, ma non lo si aspetta come gate.
10. **Mobilità** — ultimo/opzionale: dipende da infrastruttura di terzi, ricavo sottile. Più *integrazione* che strato proprio.

**Perché quest'ordine e non un altro:** ogni strato scelto deve (a) ereditare il massimo dal precedente e
(b) aggiungere il minimo di *nuova* complessità operativa/regolatoria. Retail→servizi→prenotazioni→eventi→social
è una scala di **complessità crescente e fiducia crescente**. C2C e lavoro/immobiliare stanno in fondo perché
introducono il rischio più duro (sconosciuto-a-sconosciuto) e vanno fatti solo su fiducia già accumulata.

---

## 3. I cancelli (gate) — soglie DA TARARE, non date

Ogni gate apre lo strato dopo solo se il precedente è **liquido** (offerta ↔ domanda che si incontrano davvero).
Le cifre sono **ipotesi di lavoro**, da fissare insieme guardando i dati reali quando arriveranno.

- **Gate 0→1 (fondamenta pronte):** login + pagamento + un flusso di consegna funzionanti end-to-end su ordini reali.
- **Gate 1 → 1b/2 (retail liquido):** *ipotesi* ~20-30 negozi attivi + ordini ricorrenti reali/settimana +
  una retention cliente che regge (clienti che tornano, non solo primo ordine). Soglia esatta = da tarare.
- **Gate → Ristorazione:** consegna che gira in modo affidabile nei picchi (la ristorazione rompe se la logistica non tiene).
- **Gate → Servizi/Prenotazioni:** base clienti attiva che apre l'app con abitudine + reputazione-persona funzionante.
- **Gate → Social/C2C:** utenti attivi quotidiani sufficienti a innescare passaparola + moderazione e KYC pronti.
- **Gate → strati-annuncio (lavoro/immobiliare/turismo):** traffico già monetizzabile su cui l'annuncio si appoggia.

**Principio anti-tentazione:** nessun gate si "salta" per fretta o FOMO. Un verticale aperto sotto-soglia
diluisce la liquidità di tutti.

---

## 4. Gli acceleratori di rete cross-strato (perché ogni strato costa meno del precedente)

Questo è ciò che rende la visione *componibile* e non un elenco di app separate:
- **Utenti** — chi già compra retail è già dentro: costo di acquisizione ~zero per lo strato dopo.
- **Wallet / pagamento** — un metodo già salvato e (poi) un saldo wallet abbattono la frizione di ogni nuova transazione; il float del wallet è anche leva economica.
- **Reputazione / identità** — la fiducia guadagnata su un acquisto vale sul servizio e sul C2C: **va legata alla persona/negozio, non al singolo strato** (decisione di design dello Strato 0).
- **Rider / consegna** — la rete di consegna del retail serve food, C2C con spedizione, ritiri.
- **Dato di comportamento** — chi compra cosa, quando, dove: alimenta ranking, personalizzazione, demand-forecast di ogni strato. È proprietario e non copiabile.
- **Relazioni istituzionali** — costruite per il civico/associazioni, aprono negozi, eventi, bandi trasversalmente.

Ogni acceleratore è un moat che **si compone da solo** se lo Strato 0 è progettato bene.

---

## 5. I rischi killer e come li disinneschi

1. **Dispersione della liquidità** (il #1). *Disinnesco:* gate non date, un verticale per volta, faro operativo unico. È già la regola d'oro — va difesa contro ogni tentazione.
2. **Trust/safety su C2C e social** (frode, no-show, contenuti abusivi, sconosciuto-a-sconosciuto). *Disinnesco:* questi strati stanno in FONDO alla sequenza, si aprono solo con identità+reputazione (0) mature; trust-safety, fraud-risk, kyc-aml, marketplace-policy già in organigramma.
3. **Regolatorio marketplace-facilitatore** — appena movimenti pagamenti tra terzi: KYC/AML sui venditori e sui privati C2C, **DAC7** (reporting venditori), **DSA** (obblighi di moderazione/notice-and-action da piattaforma), IVA facilitatore. *Disinnesco:* fiscalista-iva-ecommerce, dpo, public-policy, kyc-aml **coinvolti PRIMA** di accendere C2C/lavoro/immobiliare, non dopo.
4. **Gig-economy rider** (inquadramento, riqualificazione, ispezioni). *Disinnesco:* consulente-lavoro + avvocato-lavoro + rspp sulla flotta prima di scalare food/consegna; è già rischio noto nel vault.
5. **Moderazione a scala** (social/news). *Disinnesco:* non aprire il social finché non c'è massa E processo di moderazione; costo va messo nel business case dello strato, non scoperto dopo.
6. **Over-build dello Strato 0** (costruire wallet/infrastruttura troppo presto, bruciando tempo mentre manca il carburante vero). *Disinnesco:* Strato 0 cresce **guidato dal bisogno del retail**, non in anticipo teorico. Wallet vero solo quando c'è volume che lo giustifica.

---

## 6. Cosa cambia OGGI: **niente**

Questa mappa **non sposta il faro operativo**. Il collo di bottiglia resta l'esecuzione, non la strategia.
- Faro di oggi = **Strato 1, retail a densità**: i 6 negozi (visita di persona 13/7), primi ordini reali.
- Lo Strato 0 non è un cantiere separato da avviare ora: si costruisce *dentro* il retail (login, pagamento,
  consegna già in campo), con **una sola accortezza di design**: legare reputazione e identità alla persona/negozio
  così da riusarle domani. Non serve altro budget né altra attenzione ora.
- Tutti gli strati 1b→11 sono **mappa, non lavoro attivo**: servono a non prendere decisioni che chiudano porte
  (es. progettare male la reputazione), non a partire.

**In una riga:** la strategia è già scritta e regge; oggi non cambia una virgola dell'operatività —
cambia solo cosa NON facciamo per errore mentre costruiamo il retail.
