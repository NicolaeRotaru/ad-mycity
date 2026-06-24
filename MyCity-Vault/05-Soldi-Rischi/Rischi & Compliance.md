# ⚠️ Rischi & Compliance (cosa può affondare MyCity)

> Risk management e compliance Italia/UE, giugno 2026. 🟢 con fonte · 🟡 da validare con professionista · 🔴 criticità grave.
> Collega a: [[Decisioni Aperte]] · [[Pagamenti e Payout Venditori]] · [[Verifica e KYC Venditori]] · [[Gestione Rider e Pool Fattorini]]

> **Premessa onesta:** MyCity cumula 4 profili regolamentati — (1) incasso per conto terzi, (2) trasporto alimenti deperibili, (3) lavoro di consegna, (4) intermediazione fiscale. Sommati = il vero rischio. Ognuno è gestibile, ma **nessuno si può ignorare "tanto siamo piccoli"**: le sanzioni alimentari e sul pagamento per conto terzi scattano a prescindere dal fatturato.

## 🔴 Rischi NORMATIVI

### N1 — Incasso per conto terzi (servizi di pagamento) · ALTA 🟢
Se incassi dal cliente e poi giri il denaro ai negozi e ne hai **possesso/controllo**, rischi di dover essere Istituto di Pagamento (PSD2) → percorso costoso, esercizio abusivo se non autorizzato.
✅ **Mitigazione:** PSP con **split payment marketplace** (Stripe Connect, Mangopay, Fabrick, Adyen): i fondi restano in conti segregati del PSP, MyCity non li tocca mai → **niente licenza PSD2**. ⚠️ **Mai far atterrare l'intero incasso sul conto MyCity** per poi ribonificare a mano. La commissione si trattiene come `application_fee`. → risolve la [[Decisioni Aperte|Decisione 2 - pagamenti]].

### N2 — KYC/Antiriciclaggio sui negozi · MEDIA 🟢
Onboardando negozi che ricevono denaro scattano obblighi KYC/AML.
✅ **Mitigazione:** demandare il KYC al **PSP marketplace** (è il soggetto regolamentato, ha l'onboarding integrato). Non costruire un KYC fai-da-te.

### N3 — HACCP e catena del freddo nel trasporto · ALTA 🟢
Trasporto di carne/pesce/latticini soggetto a Reg. CE 852/853/2004 e D.Lgs. 193/2007. Servono: contenitori isotermici, catena del freddo (~0/+4°C; surgelati ≤−18°C), **attestato HACCP per chi consegna**.
✅ **Mitigazione:** borse isotermiche pro + gel; attestato HACCP per ogni rider; manuale HACCP con tempi max di consegna (finestre strette); registro pulizia; **notifica/SCIA alla ASL di Piacenza**. 🟡 Confermare con ASL idoneità contenitori e se serve registrazione come OSA.

### N4 — Inquadramento rider · ALTA 🟢
Area "calda" 2025-26: Circolare Min. Lavoro 18 apr 2025, INAIL circ. 40/2025, Direttiva UE 2024/2831 (presunzione di subordinazione, recepimento entro dic 2026). Il modello "rider etero-organizzato" ha portato a maxi-sanzioni per Glovo/Deliveroo.
✅ **Mitigazione:** (a) **assunzione subordinata** (anche intermittente/a chiamata) con INPS + **INAIL obbligatoria**; (b) co.co.co. con CCNL rider; (c) anche nella fase fondatore-rider, formalizzare INAIL + HACCP. **Evitare la P.IVA occasionale** come default. 🟡 Far validare il contratto da un consulente del lavoro.

### N5 — Fatturazione/IVA · MEDIA 🟢
Due flussi: (1) **vendita del cibo** → fattura/documento commerciale lo emette **il negozio** (venditore); (2) **commissione MyCity** → MyCity fattura la **provvigione di intermediazione**.
✅ **Mitigazione:** architettura contrattuale che renda MyCity **mandatario/intermediario, NON rivenditore** (non assume titolarità della merce). 🟡 Far disegnare il modello fiscale e i **contratti di mandato** da un commercialista.

### N6 — Vendita alcolici/vino · BASSA-MEDIA 🟢
Buona notizia: dal **1° gen 2026 abolita la licenza UTF** (D.Lgs. 43/2025); basta comunicazione SUAP nella SCIA del negozio.
✅ **Mitigazione:** poiché vende l'enoteca (già in regola), MyCity deve solo implementare **verifica età 18+** in checkout e alla consegna.

### N7 — Allergeni · BASSA 🟢
Reg. UE 1169/2011: ingredienti e allergeni consultabili **prima dell'acquisto**.
✅ **Mitigazione:** schede prodotto con allergeni; onere informativo trasferito ai negozi per contratto.

## 🟠 Rischi di BUSINESS

### B1 — Dipendenza dal fondatore-rider (bus factor) · ALTA 🔴
Se il fondatore è anche il rider, il business non scala e si ferma a un imprevisto.
✅ **Mitigazione:** trattare la fase fondatore-rider come **validazione temporanea**; procedurare le consegne; fissare una soglia ordini/giorno oltre cui si assume.

### B2 — Cold start marketplace a 3 lati · ALTA 🟢
Pochi negozi → poca scelta → pochi clienti → rider sottoutilizzati → churn.
✅ **Mitigazione:** lancio **iper-localizzato** (centro), 8-15 botteghe-ancora, "do things that don't scale" (fondatore consegna), domanda concentrata su fasce orarie. → vedi [[Clienti, Personas & Crescita]].

### B3 — Churn negozi / resistenza tech dei negozianti anziani · ALTA 🟢
✅ **Mitigazione:** onboarding "fatto-per-loro" (carichi tu catalogo e foto); ordini via **WhatsApp/SMS/stampante termica** non app complessa; referente umano in bottega; **zero costi fissi** per il negozio. KPI primario: **churn mensile dei merchant**.

### B4 — Margini strutturalmente bassi · ALTA 🟢
✅ **Mitigazione:** ricavo a più leve (commissione + fee consegna al cliente + ordine minimo + abbonamento); **scontrino alto** (spesa settimanale) + densità. Misurare il **margine di contribuzione per consegna**, non il GMV. → vedi [[Mercato, Numeri & Contesto|§4]].

### B5 — Stagionalità · MEDIA 🟡
Picchi (festività, inverno) vs cali (agosto, negozi chiusi).
✅ **Mitigazione:** cassa prudente; rider flessibili; campagne nei periodi forti.

### B6 — Concorrenza futura (Glovo o GDO copiano) · MEDIA-ALTA 🟢
✅ **Mitigazione:** il fossato **non è la tecnologia** ma le **relazioni locali** (botteghe storiche, marchio civico "la spesa di Piacenza", servizio umano). I big sono deboli sulla bottega artigianale. Non competere sul prezzo con chi ha più capitale.

### B7 — Qualità/freschezza e resi · MEDIA 🟡
Il cliente non sceglie la frutta/carne → reclami che ricadono su MyCity (è il volto).
✅ **Mitigazione:** policy resi/rimborsi chiara; standard qualità contrattualizzati; controllo del rider al ritiro. 🟡 Definire con avvocato la ripartizione di responsabilità MyCity↔negozio.

## ✅ Priorità d'azione
1. 🔴 **Pagamenti** (N1): scegliere PSP marketplace con split payment **prima di incassare un euro**.
2. 🔴 **Rider** (N4): contratto + INAIL + HACCP prima del primo rider esterno.
3. 🔴 **HACCP/freddo** (N3): contenitori, attestati, notifica ASL prima della prima consegna di deperibili.
4. 🔴 **Bus factor** (B1): pianificare la sostituibilità da subito.
5. 🟡 Validare con **commercialista** (N5/N6) e **consulente del lavoro/avvocato** (N4/B7) prima del lancio.

> **Onestà finale:** i punti 🟡 NON sono opzionali — servono firme di professionisti. Ma **il rischio maggiore non è normativo: è economico** (B1+B4: margini sottili + dipendenza dal fondatore). *La compliance si compra; un'unit-economics che non torna, no.*

### Fonti
[Stripe Connect – PSD2 FAQ](https://stripe.com/guides/frequently-asked-questions-about-stripe-connect-and-psd2) · [Fabrick – Split Payments](https://www.fabrick.com/it-it/insight/blog/financial-split-payments-marketplace/) · [Tuttohaccp – delivery](https://www.tuttohaccp.com/utilita/haccp-food-delivery-consegne-a-domicilio.html) · [Min. Lavoro circ. rider apr 2025](https://www.businessonline.it/news/rider-e-diritti-tutele-e-corretto-inquadramento-spiegati-e-chiariti-da-circolare-n-9-aprile-2025-ministero-lavoro_n77252.html) · [INAIL – rider circ. 40/2025](https://www.inail.it/portale/it/inail-comunica/news/notizia.2025.07.tutela-dei-rider-profili-assicurativi-inail.html) · [Studio Benedetti – marketplace e fiscalità 2026](https://www.studiobenedetti.eu/marketplace-e-commerce-e-fiscalita-2026-come-gestire-correttamente-vendite-incassi-e-iva/) · [Lapam – abolita licenza UTF alcolici 2026](https://www.lapam.eu/notizie/settori/pubblici-esercizi/abolita-la-licenza-fiscale-utif-per-la-somministrazione-o-vendita-al-dettaglio-di-alcolici/) · [EU-Startups – Glovo multata 329M€](https://www.eu-startups.com/2025/06/glovo-and-delivery-hero-fined-e329-million-for-market-manipulation-across-europe/)

#ricerca #rischi #compliance #legale #piacenza #priorità/alta
