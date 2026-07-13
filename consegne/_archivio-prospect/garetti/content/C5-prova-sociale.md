---
tipo: contenuto social — PROVA SOCIALE / TESTIMONIANZA (evoluta)
codice: C5
reparto: crm-lifecycle (con customer-success + designer)
categoria: la fiducia che converte — "i tuoi vicini si fidano"
voce: "il Vicino Orgoglioso" — qui sincero/caldo
formato: portrait 1080x1350 (IG/FB feed verticale)
data: 2026-06-25
stato: TEMPLATE PRONTO + 1 esempio MARCATO. Nessuna testimonianza reale (MyCity ha 0 clienti oggi).
costruito-su: consegne/crm/FLUSSI-LIFECYCLE.md · consegne/customer-success/primo-ordine-faro.md · consegne/content/CALENDARIO-4-SETTIMANE.md · consegne/marketing/PIANO-EDITORIALE.md
---

# C5 — Prova sociale / Testimonianza (la fiducia che converte)

## 📁 Path degli artefatti
- **PNG renderizzato (esempio marcato):** `/home/user/ad-mycity/creativi/output/social/C5-prova-sociale.png` (1080×1350, verificato `PNG image data, 1080 x 1350`)
- **Template HTML:** `/home/user/ad-mycity/cervello/content-factory/templates/prova-sociale-quote.html` — segnaposto `{{citazione}}` · `{{nome}}` · `{{zona}}` · `{{iniziale}}`
- **Script di render (autonomo, non tocca render.mjs):** `/tmp/claude-0/-home-user/ae2c3bda-79de-5e79-a6f7-638ba9c25bde/scratchpad/render-c5.mjs` (da spostare in `cervello/content-factory/` quando si stabilizza)

> 🔴 **ONESTÀ CRUCIALE.** Oggi MyCity ha **0 clienti reali**. La citazione nel PNG è un **ESEMPIO**,
> marcato a video con il badge rosso **"Esempio — testimonianza da sostituire"** e qui sotto con
> l'etichetta `[ESEMPIO — da sostituire con testimonianza reale dopo il primo sabato]`.
> **Non si pubblica con l'esempio dentro.** Si pubblica solo dopo aver raccolto e fatto firmare il
> consenso su una testimonianza **vera** (processo più sotto). Niente recensioni inventate: la prova
> sociale finta è il modo più veloce per bruciare la fiducia che vogliamo costruire.

---

## 1) Il template di citazione (la maschera)

La citazione è **l'eroe assoluto**: Fraunces grande, virgolettone oliva dietro, fondo panna, accento
oliva (fresco/positivo). Sotto, la firma minimale: **nome + quartiere** (anche solo "Giulia, Centro
storico"). Una fila di **5 stelle** (fiducia) e il nastrino **"✓ Ordine verificato su MyCity"**
(credibilità). Niente fronzoli.

**Come si compila** (4 campi):

| Campo | Cosa ci va | Regole |
|---|---|---|
| `{{citazione}}` | la frase del cliente, **parole sue** (max ~280 caratteri, 2-4 righe) | concreta, un dettaglio vero ("Marco in bici", "bigliettino a mano"), niente superlativi vuoti |
| `{{nome}}` | nome di battesimo (o "Giulia M.") | mai cognome intero senza consenso scritto |
| `{{zona}}` | quartiere/via di Piacenza | "Centro storico" · "Borgo Faxhall" · "Infrangibile" — fa scattare il "è uno della mia zona" |
| `{{iniziale}}` | la lettera nel pallino oliva | iniziale del nome |

**Regola d'oro della prova sociale**: meno aggettivi, più **fatti**. "Buonissimo, consiglio!" non
convince. "La coppa me l'ha portata Marco in bici e il salumiere mi ha scritto un bigliettino" **sì**,
perché è una scena che il vicino riconosce e non si può inventare a tavolino.

---

## 2) Tre angoli di testimonianza (esempi MARCATI — solo struttura, non sono reali)

> `[ESEMPIO — da sostituire con testimonianza reale dopo il primo sabato]` su tutti e tre.
> Servono a customer-success come **traccia per la telefonata**: che tipo di frase cercare.

### 🛒 Angolo A — il CLIENTE (comodità + scoperta + calore)
> «Pensavo fosse comodo e basta. Invece la coppa me l'ha portata Marco in bici, e il salumiere mi ha
> scritto un bigliettino a mano. È la mia bottega di sempre, solo che ora è a casa mia.»
> — **Giulia, Centro storico** *(questo è quello renderizzato nel PNG)*

Cosa converte: smonta l'obiezione "tanto è la solita app" e la ribalta in **relazione**.

### 🧡 Angolo B — il CAREGIVER (la spesa per qualcun altro — fortissimo a Piacenza)
> «Mia mamma ha 82 anni e non scende più in centro. Ora le ordino io la sua spesa dai negozi che
> conosce da una vita, e gliela portano su. Per lei è un pezzo di città che torna a casa.»
> — **Davide, Borgo Faxhall**

Cosa converte: tocca il segmento "figli che curano i genitori", altissimo valore emotivo e ricorrente.

### 🏪 Angolo C — il BOTTEGAIO (prova sociale dal lato venditore: "anche i negozi si fidano")
> «In 30 anni dietro al banco non avevo mai consegnato a domicilio. Con MyCity ho fatto il mio primo
> ordine online di sabato senza cambiare niente del mio lavoro. La gente di Piacenza mi trova anche
> quando non passa dal negozio.»
> — **Antica Salumeria Garetti, P.za Duomo** *(da raccogliere dal negozio-faro)*

Cosa converte: la fiducia **bilaterale** — il cliente si fida di più se vede che la bottega storica si
fida. È la versione "eBay reputazione venditore" della prova sociale.

> Per l'angolo C usare il **nome del negozio** al posto di nome+zona (template flessibile: `{{nome}}` =
> "Antica Salumeria Garetti", `{{zona}}` = "P.za Duomo 44", `{{iniziale}}` = "G").

---

## 3) Caption Instagram / Facebook (da pubblicare CON la testimonianza vera)

> ⚠️ Da usare **solo** quando la citazione nel visual è reale e con consenso firmato. Sostituire i
> `[…]` con i dati veri.

**Caption IG:**
```
"[frase reale del cliente]" — [Nome], [quartiere].

Non è una recensione comprata. È [Nome], che abita a due passi da te, che ha
riportato la sua bottega di sempre dentro casa. 🧡

A Piacenza il negozio non è solo dove compri: è chi ti conosce, chi ti mette il
bigliettino nel sacchetto, chi sa già cosa ti piace. MyCity lo porta a casa tua —
così le botteghe del centro restano vive.

👉 Anche tu vuoi provarci? Iscriviti alla lista: i primi 50 hanno la prima
consegna offerta da noi. Link in bio.

La spesa che tiene viva la città.
```
**Primo commento (da postare subito sotto):**
```
Vuoi raccontare la TUA, come [Nome]? Scrivici in DM: le storie vere dei vicini
sono la cosa di cui andiamo più orgogliosi. 📨
```
**Hashtag (10-12):** `#MyCityPiacenza #Piacenza #piacenzacentro #botteghepiacentine #spesaadomicilio #salumipiacentini #negozidivicinato #compralocale #[quartiere] #vivipiacenza #piacenzacittà`

---

## 4) Come e quando raccogliere le testimonianze VERE (processo customer-success + consenso 🟡)

Riusa la **telefonata di feedback post-consegna** già definita in
`consegne/customer-success/primo-ordine-faro.md` e in `consegne/crm/FLUSSI-LIFECYCLE.md` (flusso #3
"feedback + recensione"). La testimonianza nasce lì, non da un form freddo.

**La pipeline (5 passi):**
1. **Quando** — entro **24-48h** dalla prima consegna (il ricordo è caldo e positivo). Il primo bacino
   è il **primo sabato concierge (sab 27/6)**: quei 3-10 ordini sono la nostra prima miniera di storie.
2. **Chi** — customer-success chiama (non email): *"Ciao [Nome], sono di MyCity, volevo solo sapere
   com'è andata la prima consegna. Tutto a posto?"* — ascolta e **annota le parole esatte** che usa.
3. **La frase** — se dice qualcosa di bello e concreto, chiedere: *"Posso scriverla così com'è e
   metterla sui nostri social? Solo nome e quartiere, niente cognome né foto se non vuoi."*
4. **Il consenso (🟡 — obbligatorio prima di pubblicare):** raccogliere un **OK scritto** (messaggio
   WhatsApp/email con testo: *"Confermo che MyCity può usare questa mia frase + nome e quartiere sui
   propri canali. Posso revocare quando voglio scrivendo a ciao@…"*). Salvare lo screenshot del
   consenso. Senza questo, la testimonianza **non esce**. → coordinare con **@legale-privacy**
   (consenso immagine/citazione = base GDPR, vincolo già nel FLUSSI-LIFECYCLE).
5. **Il render** — passare citazione+nome+zona al designer (o eseguire lo script): si rigenera il PNG
   **senza il badge ESEMPIO** (rimuovere il blocco `.esempio` dal template) e si pubblica.

**Target operativo:** 1 testimonianza vera raccolta entro **lun 29/6** (dal sabato concierge) → primo
post di prova sociale reale **nella settimana S1** del calendario. Poi a regime: **almeno 1 nuova
storia ogni 2 settimane** (slot DOM "prova-sociale" del calendario editoriale).

---

## 5) Quando e dove pubblicare · cosa misurare

**Dove:** IG feed (portrait 1080×1350) + FB + ricondiviso nei gruppi locali ("Sei di Piacenza se…").
**Quando:** slot **DOMENICA** del calendario editoriale (`CALENDARIO-4-SETTIMANE.md`, pilastro
"prova-sociale") — la domenica è il giorno del "ordino per la settimana", la fiducia spinge la prima
prova. Mai pubblicare prima di avere la testimonianza reale.

**Cosa misuro (KPI di questo contenuto):**
| Metrica | Dove si legge | Perché conta per il CRM |
|---|---|---|
| **Salvataggi + condivisioni** | insight IG/FB | la prova sociale si **salva/gira**: è il segnale n.1 che converte |
| **Click al link in bio (lista d'attesa)** | UTM `utm_content=C5-prova-sociale` | trust → iscrizione → primo ordine |
| **Iscrizioni attribuite** | Google Form / lista | quante persone la testimonianza ha spinto dentro |
| **DM "voglio raccontare la mia"** | inbox | alimenta il **motore di nuove testimonianze** (loop) |
| **Tasso primo→secondo ordine sui referiti dal post** | Supabase coorti (quando ci saranno dati) | la fiducia tiene, non solo acquisisce |

---

## ✅ Auto-revisione qualità
- **È credibile?** Sì: la citazione-esempio è una **scena concreta** (Marco in bici, bigliettino a
  mano), non un superlativo vuoto. Stelle + "✓ Ordine verificato" danno credibilità senza gridare.
- **L'esempio è marcato come esempio?** Sì, doppiamente: badge rosso **"Esempio — testimonianza da
  sostituire"** sul PNG + etichetta `[ESEMPIO …]` in tutti gli angoli del documento. Impossibile
  scambiarlo per reale.
- **Il consenso è previsto?** Sì: passo 4 della pipeline, consenso scritto obbligatorio + screenshot +
  revoca, coordinato con @legale-privacy. Niente esce senza OK firmato.
- **Brand/DNA rispettato?** Sì: panna + oliva, Fraunces+Inter, tagline + @mycity.piacenza, formato
  portrait 1080×1350. La citazione è l'eroe.
- **Nota onestà numeri:** 0 clienti reali oggi → nessuna metrica reale, nessuna testimonianza reale.
  Tutto è template + esempio dichiarato.

---

## 🙋 Cosa serve da Nicola
1. **Via libera alla raccolta** (🟡): customer-success chiama i clienti del primo sabato concierge e
   chiede la frase + consenso. Conferma che possiamo farlo.
2. **Chi fa la telefonata** di feedback post-consegna (customer-success a mano, finché il volume è basso).
3. **Firma del consenso** prima del primo post reale (🟡 → coordinato con @legale-privacy). La
   pubblicazione del PNG con testimonianza vera resta 🔴 (ok Nicola + ok del cliente).
4. **Per l'angolo C (bottegaio):** ok di Garetti a usare nome negozio + frase sui nostri canali.
