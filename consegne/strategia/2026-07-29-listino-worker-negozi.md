---
titolo: Worker per i negozi — la seconda fonte di reddito di MyCity (3 abbonamenti)
data: 2026-07-29 00:35
autore: AD
colore: 🟢 (memoria — nessun prezzo pubblicato, nessun soldo toccato, niente costruito)
fonte: Nicola — chat claude.ai «Worker subscription plans for shops» (screenshot 2026-07-29 00:13) + conferma in chat Pannello 2026-07-29 00:30
stato: LINEA DI RICAVO #2 — definita, NON costruita. Si costruisce in sessioni dedicate future (Nicola).
---

# Worker per i negozi — la seconda fonte di reddito

> ⚠️ **Regola per ogni senior e per ogni giro:** questa linea è **definita ma non costruita**.
> Nicola (29/7 00:30): *«questa sarà un'altra fonte di reddito di MyCity, poi più avanti in altre
> sessioni mi occuperò di crearle»*. Quindi: **nessuna azione accodata, nessun pitch, nessun asset
> pesante, nessun contatto** su questa linea finché non è lui ad aprirla. Questo file serve perché
> quando quel momento arriva si parta da qui, non da zero.
>
> Perché il file esiste: il listino era nato in una chat **claude.ai**, superficie che il worker non
> legge. Nel vault e nelle 135 conversazioni del Pannello non c'era una riga. Ora vive qui + in
> `registro-fatti.json` (`pricing.worker-negozi`, `pilot.worker-negozi`, `worker-negozi.stato`).

## Cos'è, in una riga
Non è il marketplace: è **il Worker dato in mano al negozio** — un dipendente digitale in abbonamento.
Il marketplace incassa se la gente compra; questo incassa **il primo del mese comunque**.

## Le due linee di ricavo (da non mescolare mai)

| | ① Marketplace MyCity | ② Worker per i negozi |
|---|---|---|
| Cosa vende | vetrina + ordini + consegna | dipendente digitale in abbonamento |
| Prezzo | 10% sul venduto + **50 €/mese** (`pricing.abbonamento`) + 3 € fee consegna (codice marketplace) | **99 / 299 / 699-999 €/mese** (`pricing.worker-negozi`) + setup una tantum |
| Natura del ricavo | variabile, dipende dagli ordini | **ricorrente, indipendente dagli ordini** |
| Stato | vivo (1 negozio reale, 0 ordini pagati) | **non costruito** |

Copertura del burn fisso (~302 €/m, `finanza.costi_infrastruttura`): **1 Vetrina ≈ un terzo del burn ·
3 Autopilot lo coprono tutto e avanzano.** Derivato dai fatti a registro, non una previsione di vendita.

## La scala dei tre piani
**Vetrina ti fa trovare · Autopilot ti fa tornare i clienti · Direttore Digitale ti fa capire.**
Tre dolori diversi del negoziante, in ordine di quanto gli costano. Ogni piano contiene il precedente.

---

## ① Vetrina — 99 €/mese
### «il negozio esiste online senza che il titolare tocchi nulla»

**Il dolore.** Scheda Google mezza vuota, ultimo post di otto mesi fa, recensioni senza risposta di cui
una brutta. Non è pigrizia: apre alle 6:30 e chiude alle 19:30 — alle 20 non ha più testa per un post.

**Cosa fa**
- **Google Business curato** — orari giusti anche nei festivi, foto nuove, post settimanali sui prodotti
  di stagione, categorie e attributi compilati. È la superficie che decide se compare su «panetteria
  vicino a me»: vale più del sito.
- **Risposta alle recensioni** — entro poche ore, non due settimane. Le buone ringraziate con qualcosa di
  specifico, le brutte gestite con un tono che non peggiora. Le brutte *senza risposta* sono quelle che pesano.
- **Social autopilot** — contenuti generati e pubblicati da template: calendario già impostato, il pezzo
  cambia (prodotto, stagione, giornata), la gabbia grafica resta la sua. Non contenuto geniale —
  contenuto **costante**, che è quello che gli manca.

**Cosa vede lui.** Quasi niente, ed è il punto: apre Instagram e c'è un suo post che non ha scritto;
apre Google e la recensione di ieri ha già risposta. Zero riunioni, zero «mandami i testi entro venerdì».

**Cosa gira sotto (nostro).** Content Factory già esistente (`cervello/content-factory/`: template per
categoria + render) · `content-social` → `ai-copywriter` per il volume · `ai-designer` per le immagini ·
i due cancelli `direttore-creativo` (uccide il debole) e `qa-designer` (brand + onestà) · `seo` per Google/Maps.

**Cosa manca per consegnarlo.** Google Business Profile è 🟢 nelle mani (`cervello/azioni.md`) ma **non
collegato**: serve la scheda GBP + il passaggio via n8n. Social autopilot idem (permessi Meta). La
**produzione** del contenuto c'è già; è la **pubblicazione automatica** da accendere.

**Perché 99 € tiene.** ~3,30 € al giorno, meno di due caffè e una brioche: sotto la soglia in cui deve
pensarci. E non lo confronta con «un software» — lo confronta con l'agenzia che gli ha fatto il
preventivo e col nipote che gli fa i post quando ha tempo.

---

## ② Autopilot — 299 €/mese
### tutto Vetrina + il Worker inizia a **portare clienti dentro**

**Il salto.** Vetrina lavora sul farsi trovare. Autopilot lavora sui **clienti che ha già** — dove stanno
i soldi facili, perché farne tornare uno costa una frazione di trovarne uno nuovo.

**Cosa fa in più**
- **Assistente WhatsApp per i clienti finali** — risponde alle domande che oggi si mangiano il tempo
  dietro al banco: «siete aperti?», «avete la focaccia?», «fate torte su ordinazione?», «quanto costa?».
  Subito, anche di domenica, anche mentre sta servendo.
- **Richiami e loyalty automatici** — chi veniva ogni settimana e sparisce da tre riceve un messaggio;
  chi ha comprato una volta viene richiamato al momento giusto; ricorrenze e stagionalità diventano un
  messaggio invece di un'occasione persa. **Un cliente recuperato al mese copre già l'abbonamento.**
- **Report del Lunedì** — un messaggio coi numeri della settimana: quanti hanno scritto, quanti sono
  tornati, cosa ha girato. Da leggere in trenta secondi col caffè, non un cruscotto da guardare.

**Cosa vede lui.** Il telefono che risponde da solo e il messaggio del lunedì. È il primo piano in cui
*sente* il Worker lavorare.

**Cosa gira sotto (nostro).** `crm-lifecycle` (già owner di win-back, riordino, referral) · `supporto`
per le risposte · `customer-success` per il proattivo · le cadenze di `cervello/ritmo.md` per il Report
del Lunedì (la macchina i report periodici li fa già per noi: qui li fa per lui).

**Cosa manca per consegnarlo.** **WhatsApp Business Cloud API è il collo di bottiglia**: numero dedicato
+ verifica business su Meta (lenta) + costo per messaggio — va iniziata **settimane prima** di vendere,
non dopo. E una decisione di Nicola: l'assistente risponde da solo o passa la palla sui casi delicati?
Rispondere a un cliente di un negozio è scrivere nel mondo reale → oggi 🔴.

**Perché 299 € tiene.** Il confronto non è più l'agenzia, è **una persona part-time**: uno che stia al
telefono e mandi i richiami costa in un mese quello che questo costa in sei — e il Report del Lunedì un
part-time non glielo darebbe comunque.

---

## ③ Direttore Digitale — 699-999 €/mese
### tutto Autopilot + la testa che oggi non ha

**Il dolore.** Qui non compra esecuzione, compra **giudizio**. Sa quanto ha incassato, non se sta
guadagnando; scopre i bandi quando sono scaduti; decide a naso e ci ripensa a dicembre col commercialista.

**Cosa fa in più**
- **Cruscotto finanziario in sola lettura** — margini, andamento, cosa rende e cosa no. *Sola lettura* è
  una scelta, non un limite: il Worker guarda e dice, **non tocca i soldi**. Nessun accesso in scrittura
  ai conti, mai.
- **Watchdog bandi** — sorveglia bandi e contributi per cui il negozio è ammissibile e avvisa **prima**.
  Prova che funziona: la macchina ha già scovato e istruito **PI26** per noi, con scadenza e requisiti —
  stesso meccanismo, puntato sul suo negozio. Un fondo perduto preso ripaga l'abbonamento per anni.
- **Analisi strategica mensile** — una volta al mese qualcuno guarda il negozio dall'alto: cosa cambia in
  zona, dove perde margine, cosa conviene fare nei prossimi tre mesi. La cosa che una bottega non ha mai
  avuto e una catena ha sempre avuto. (Metodo OS-file della consulenza.)

**Cosa vede lui.** Un incontro al mese con un documento sul suo negozio coi suoi numeri, più gli avvisi
in mezzo quando succede qualcosa che vale soldi.

**Cosa gira sotto (nostro).** `finanza` + `fp-and-a` (numeri) · `finanza-agevolata` + `scadenzario` +
`relazioni-istituzionali` (bandi) · `intelligence` (contesto locale) · `corporate-strategy` (quadro) ·
l'AD che sintetizza. È il team che gira già per MyCity, puntato su di lui.

**Cosa manca per consegnarlo.** I **suoi dati**: senza un aggancio agli incassi (o un caricamento
periodico) il cruscotto è vuoto. E **la forbice 699-999 va chiusa: non è un prezzo, sono due** — serve il
criterio che fa scattare la fascia alta (fatturato? più sedi? incontro in presenza?), altrimenti in
trattativa si finisce sempre a 699.

---

## Il pilot founder — 149 €/mese bloccato
Tre negozi: **I Frutti della Terra · Enoteca La Canteina · Il Pollivendolo**.
Non è uno sconto: è **comprarsi i primi tre casi veri** da mostrare agli altri, con un prezzo che dopo
non tiene in ostaggio.

⚠️ **Fondamento (AR-006):** questi tre **non sono nel registro-realtà** della macchina (lì ci sono Pane
Quotidiano, Garetti, Frolla Couture). Prima di qualsiasi asset intestato a loro serve la conferma di
Nicola: negozi veri già contattati, o nomi nati in quella chat?

## Cosa manca prima di poter vendere (lista chiusa, da riprendere alla prossima sessione)
1. **I 3 pilot non sono fondati** — confermare che esistono e che sono stati contattati.
2. **Le mani sono spente** — GBP, social, WhatsApp: oggi `AZIONI_LIVE=0` e allowlist vuota
   (`cervello/mani-allowlist.json`). Vendere Vetrina significa accenderle, e ognuna resta 🔴.
3. **Verifica Meta per WhatsApp** — la più lenta: va iniziata settimane prima di vendere Autopilot.
4. **Setup una tantum senza importo** — senza quello il margine del primo mese non è calcolabile.
5. **Forbice 699-999 da chiudere in due prezzi** con un criterio scritto.
6. **Costo marginale per negozio non misurato** — le uniche voci note sono Gemini ~0,10 € a negozio
   (`cervello/azioni.md`) e WhatsApp per-messaggio (importo da definire). Da calcolare prima di promettere margini.

## Traccia in memoria
- `registro-fatti.json` → `pricing.worker-negozi` · `pilot.worker-negozi` · `worker-negozi.stato` ·
  `strategia.linee-ricavo` (2026-07-29).
- `BACHECA.md` → riga nel Registro dei fatti + avviso «linea di ricavo #2».
- `DECISIONI.md` → voce 2026-07-29 00:35.
