---
titolo: JARVIS di MyCity — visione dell'assistente vivo + piano dell'Organo #1 (chat con voce live + telecamera)
data: 2026-07-16 22:36
autore: AD digitale
colore: 🟢
fonte: conversazione con Nicola (2026-07-16) + 3 sopralluoghi in lettura su pannello/, cervello/, mycity/
stato: BOZZA — in attesa di firma di Nicola prima di costruire
---

> Documento di visione e piano. È 🟢 (scritto in memoria, nessun codice né soldi toccati).
> Traguardo: trasformare l'AD di MyCity in un assistente stile **JARVIS** — vede, ascolta,
> parla, ricorda e agisce (con la firma di Nicola sulle mosse pesanti). Questo file è la
> **stella polare**: ci costruiamo sopra un organo alla volta.

# 🤖 JARVIS di MyCity — la visione

Nicola vuole un assistente come **JARVIS di Iron Man**, non come Siri:

- **Siri** = a turni, reattiva, isolata, non ricorda, non agisce.
- **JARVIS** = conversazione continua, **vede il contesto**, **ricorda tutto**, **prende iniziativa**, e **agisce** nel mondo.

Dove vive: **dentro il Pannello di Controllo**, uso **centrale** (Nicola / l'AD), **non ancora in mano ai
venditori**. Il traguardo finale di Nicola: *"dal Pannello gestisco tutto il marketplace — entro in un
negozio, lo modifico, con l'assistente (AD + senior + worker) sempre a portata di mano."*

## I 6 organi di JARVIS — e cosa abbiamo già oggi

| Organo | Cos'è | Stato oggi |
|---|---|---|
| 🧠 Cervello | ragiona, decide | ✅ **C'è** — Claude + i ~120 senior (`.claude/agents/`) |
| 💾 Memoria | ricorda tutto | ✅ **C'è** — il vault (`MyCity-Vault/`) |
| 🔔 Iniziativa | anticipa, avvisa | ✅ **Base c'è** — le sentinelle (`cervello/sentinelle.md`) |
| 👀 Occhi | vede il mondo / la telecamera | 🔨 **Da costruire** — è l'Organo #1 |
| 👂🗣️ Voce | ascolta e risponde parlando | 🟡 **Metà** — input dettatura (`pannello/src/lib/dettatura-vocale.ts`); voce viva in uscita = da collegare |
| ✋ Mani | agisce: scrive, modifica, manda | 🔒 **Spente apposta** — si accendono a firma di Nicola |

**Conclusione:** cervello, memoria e iniziativa ci sono già. A JARVIS mancano solo **i sensi in diretta
(occhi + voce)** e **le mani accese**. È da lì che partiamo.

---

# 🎙️ Come si manifesta: la chat con due marce

La casa di JARVIS è la **chat che Nicola già usa nel Pannello**. Avrà due marce, scelte con un pulsante:

- **🎤 Microfono spento (come oggi):** si scrive; lavora il worker + i 120 senior; compiti pesanti a
  turni (~pochi secondi di latenza). Ottima per il lavoro vero e profondo.
- **🎙️ Microfono acceso → modalità JARVIS live:** si **parla e lei risponde a voce in tempo reale**. Si
  accende la **telecamera**: vede in diretta (**video live**) ciò che le mostri e puoi **scattare foto**
  (che diventano le immagini dei prodotti).

Le due marce si parlano: ciò che si decide parlando in live può **far partire un lavoro vero** che i senior
eseguono con i cancelli di sicurezza. *Parli → lei prepara → Nicola firma le cose pesanti.*

## 📷 Lo scatto foto è una funzione SEMPRE disponibile (non chiusa dentro JARVIS)

Requisito di Nicola: scattare la foto deve funzionare in **tre modi**, indipendenti:
1. **JARVIS acceso + video live** — inquadri, lei vede in diretta, scatti (o scatta lei).
2. **JARVIS acceso, senza video live** — le parli e scatti una foto quando vuoi.
3. **Senza JARVIS e senza video live** — telecamera "semplice": apri, scatti, la foto va al prodotto.
   Niente voce, niente diretta.

Principio: **lo scatto foto → scheda prodotto è il cuore sempre-acceso**; la voce e il video live sono uno
**strato in più** che ci si appoggia sopra. Il modo 3 (foto semplice) **funziona già col cervello attuale,
senza chiavi nuove e senza costi a consumo** → è il primo pezzo consegnabile dell'Organo #1.

---

# 🏗️ L'architettura furba: telecomando + motore blindato

Scoperta chiave dei sopralluoghi: **la pipeline "foto → AI → prodotto in catalogo" ESISTE GIÀ**, ma vive nel
repo del marketplace (`mycity/`), non nel Pannello, ed è pensata per i venditori.

Cosa c'è già in `mycity/` (motore reale, human-in-the-loop, su Claude Sonnet 4.5):
- `app/api/vision/extract-products` e `.../extract-product` — foto → nome, descrizione, categoria, **prezzo
  suggerito**, tag; raggruppa fronte/retro; **ritorna bozze da confermare**.
- `app/api/ai/catalog-create` / `catalog-create-bulk` — inserisce il prodotto come **bozza (`draft`)**, non
  pubblico finché non si pubblica; vincolato a `seller_id` + RLS.
- Immagini: bucket Supabase pubblico `products`, URL salvato in `products.images` (jsonb).
- Extra già pronti: **nota vocale → prodotto**, **codice a barre (EAN) → prodotto**, caricamento massivo.

Perché "nel marketplace è veloce e sicuro, nel Pannello più difficile":
- Il **marketplace** è nato per **scrivere**: motore AI + archivio foto + **scrittura sicura** (bozza + RLS)
  già asfaltati.
- Il **Pannello** è nato per **guardare**: oggi è **sola lettura** di proposito (l'AD non tocca il DB del
  marketplace da sola). Farlo scrivere = collegargli il motore + **accendere le "mani"** (oggi spente) +
  costruire il pezzo telecamera-live (che non esiste da nessuna parte).

**La riconciliazione (non si sceglie, si combinano):**
> Il **Pannello fa la faccia** (telecamera, voce, assistente sempre lì) e **chiama il motore del marketplace
> via API** per la parte pericolosa (vedere il prodotto e scrivere in sicurezza).
> Pannello = **telecomando**; marketplace = **motore blindato**.

Questo dà a Nicola il cockpit dove vuole lui **e** riusa la sicurezza già collaudata, senza ricostruire il
pericoloso. È la fondazione del "gestisco tutto il marketplace dal Pannello".

---

# ⚠️ La verità tecnica (niente sorprese)

Sono **due canali diversi**, e conta per costo e costruzione:

1. **"Vede la foto e compila la scheda"** → funziona **già** col cervello attuale (Claude vision). Costo
   basso, dentro il budget-guard esistente (`pannello/src/lib/ai.ts`, tetto ~50€/mese).
2. **"Voce + video in diretta (JARVIS)"** → è un **canale live separato** che richiede un **modello "live"**
   (es. Gemini Live o Realtime API): **oggi NON è collegato**. Serve una **chiave nuova + un budget dedicato**
   — decisione di Nicola (🔴). Non è fantascienza, è un'integrazione + un costo a consumo.

Piano di conseguenza: costruiamo **l'interfaccia JARVIS completa** (pulsante microfono + telecamera già lì);
la parte **"vede + compila + scatti la foto" parte subito funzionante**; la **voce+video live si accende**
quando Nicola collega la chiave. Un solo oggetto, che si completa col carburante.

---

# 🚦 Governo e sicurezza (il pregio, non il freno)

Nel film JARVIS agisce libero. Qui l'AD gira **soldi, dati e negozi veri**. Quindi:

- **JARVIS con la firma di Nicola sulle mosse pesanti.** Le cose leggere (guardare, compilare bozze,
  ricordare) le fa da sola (🟢); le cose che toccano soldi/dati/irreversibili le porta **pronte da firmare**
  (🔴).
- **Le "mani" di scrittura restano dietro i cancelli esistenti** (`cervello/consenso-azione.mjs`,
  `mani-allowlist.json`, `AZIONI-IN-ATTESA.md`, kill-switch PAUSA): si accende **una tabella alla volta**,
  con backup per-riga e annullabile.
- **Prezzi e categorie:** l'AD li **propone con un perché**, ma il prezzo finale lo decide Nicola. Nessun
  numero sparato a caso.

---

# 🧩 Il piano per gradi — un organo alla volta

Ogni gradino è **già utile da solo** e regge il successivo.

### Organo #1 — Occhi + prima Voce: la "Vetrina live" nella chat *(primo da costruire)*
Nel Pannello: apri la chat → scegli un negozio → **telecamera accesa** → inquadri un prodotto → **scatti**
(o lo fa lei) → il motore del marketplace lo **vede e compila** (nome, descrizione, categoria, prezzo
suggerito, foto) → **bozza da confermare** → al tuo ok entra in catalogo come `draft`. Il pulsante microfono e
il video live sono già presenti nell'interfaccia (si attivano pieni con la chiave "live").
Valore: **il 90% del bisogno reale** (caricare prodotti parlando/mostrando invece di compilare form).

### Organo #2 — Voce viva
Microfono acceso → risposta a voce in tempo reale + video live continuo (modello "live" collegato).

### Organo #3 — Mani accese in sicurezza
Dal Pannello si modifica un negozio: prodotti, prezzi, foto, orari — sempre con backup, annullabile, a firma.

### Organo #4 — Presenza
L'assistente sempre lì, in ogni schermata del Pannello, che segue Nicola mentre lavora sul marketplace.

---

# 🛠️ Organo #1 — piano di costruzione (dettaglio)

**Dove:** nuovo componente nel Pannello (Next.js 15, App Router). Nuova voce in `VistaNav`
(`pannello/src/lib/nav.ts`) + area in `pannello/src/components/aree/` + voce menu e render in
`pannello/src/app/page.tsx`. Front-end telecamera in un componente `"use client"` con `getUserMedia`
(codice nuovo — oggi non esiste).

**Come scatta e vede:**
- Lo stream video sta nel browser; lo scatto prende un fotogramma e lo carica nell'archivio (riuso del pattern
  `pannello/src/app/api/allegato/route.ts` → Supabase Storage; per i prodotti, bucket `products`).
- La foto + eventuale domanda vanno al **motore vision del marketplace** (`mycity/app/api/vision/extract-product`)
  via una API-ponte del Pannello.

**Come scrive (in sicurezza, uso centrale):**
- Serve una via di scrittura **centrale/admin** (Nicola scrive in QUALSIASI negozio, non solo il proprio).
  Due opzioni da decidere: (a) route admin service-role nel marketplace, oppure (b) le "mani" del cervello
  (`cervello/marketplace.mjs inserisci products`) sbloccando la tabella `products` in `mani-allowlist.json`.
  In entrambi i casi: prodotto nasce **`draft`**, backup, annullabile, **a firma di Nicola**.

**Colori:**
- 🟢 aprire telecamera, scattare, far compilare la bozza dall'AI, mostrarla.
- 🔴 scrivere il prodotto nel database del negozio (firma di Nicola, via cancelli esistenti).

**Riuso (non si ricostruisce il pericoloso):** motore vision, archivio immagini, scrittura `draft`+RLS,
budget-guard AI — tutto già esistente in `mycity/` e `pannello/`.

---

# 🙋 Cosa serve da Nicola (decisioni)

1. **Firma su questo piano** (via libera all'Organo #1). 🔴
2. **Via di scrittura centrale:** ok ad accendere la scrittura dei prodotti in modo centrale (admin), con
   backup + annullabile + firma. Scegliere opzione (a) route admin marketplace o (b) mani del cervello. 🔴
3. **Modello "live" per la voce+video** (Organo #2): quale (Gemini Live / Realtime API), con quale **chiave**
   e quale **budget** mensile. Finché non c'è, l'Organo #1 gira lo stesso (scatto + compila + foto). 🔴

---

## Traccia
- Documento generato dalla conversazione del 2026-07-16 (visione JARVIS, chat con microfono live + foto +
  video live, uso centrale nel Pannello).
- Prossimo passo alla firma: costruire l'Organo #1 in un branch del Pannello (🟡, anteprima prima del live).
