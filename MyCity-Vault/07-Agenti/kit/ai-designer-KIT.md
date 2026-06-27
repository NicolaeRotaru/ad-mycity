---
tipo: kit-mestiere
ruolo: ai-designer
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-06-27 · carburante reale atteso (chiavi AI immagine + foto vere del prodotto/bottega + brand kit)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · CHECKLIST-BRAND.md · ONESTA-RULES.md · creativi/swipe/SWIPE-FILE.md
---

# 🧰 KIT MESTIERE — ai-designer (il "cervello allenato" del fuoriclasse dell'immagine AI)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un pro **sa e usa**
> (strati 3-6): il sapere, gli strumenti passo-passo, la galleria di esempi, e il carburante che serve.
> Leggilo come la tua testa da 15 anni di art direction food + maestria dei modelli generativi.
> Bersaglio: **L7-con-giudizio** (vedi [[RUBRICA-LIVELLI]]).
> Mestieri fratelli: il **designer** monta/stampa (gabbia, QR, PDF), il **content-social** scrive i testi.
> Tu fornisci la **materia visiva**: foto-prodotto, scene di bottega, sfondi, mockup. L'AI è il pennello, il **gusto è tuo**.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Anatomia di un buon prompt immagine — il prompt È un brief di art direction
Un prompt generico produce un'immagine generica. Un prompt da pro ha **6 leve**, sempre, in quest'ordine di forza:
1. **SOGGETTO** — cosa, concreto e specifico. Non "salumi" → "una coppa piacentina DOP affettata sottile, ventaglio su tagliere di legno scuro, due fette arricciate in primo piano". Il dettaglio scolpisce.
2. **COMPOSIZIONE / INQUADRATURA** — regola dei terzi, soggetto decentrato, spazio negativo (per il testo del designer), punto di vista (45° "appetite angle" per il food, top-down "flat-lay" per i set, macro per la texture). Dichiara sempre dove lasci il **vuoto per il copy**.
3. **LUCE** — la leva che fa l'emozione (vedi C). Direzione + qualità + ora: "luce naturale morbida da finestra laterale sinistra, golden hour, ombre lunghe e calde".
4. **OBIETTIVO / LENTE** — dà realismo fotografico: "85mm f/1.8, profondità di campo bassa, sfondo sfocato (bokeh)" = ritratto-prodotto; "35mm" = scena di ambiente; "macro 100mm" = dettaglio texture. La lente racconta una storia di distanza ed enfasi.
5. **STILE / MOOD / RIFERIMENTO** — "fotografia editoriale food, stile rivista gastronomica, calore artigianale, palette terra"; cita un riferimento di *genere* ("alla Cortilia/Kinfolk"), mai un fotografo vivente per nome (diritti, vedi G).
6. **PALETTE + NEGATIVI** — i token brand (terracotta/senape/oliva/panna) come dominante; e i **negativi**: "no testo, no logo, no mani deformi, no plastica lucida, no colori al neon, no giallo acceso, no aspetto stock-anonimo".
> **Regola d'oro:** ogni leva mancante è una decisione che prende il modello al posto tuo (= mediocrità). Riempile tutte e sei.

## B. Foto-prodotto food appetitosa — la scienza del "fa venire fame"
- **Freschezza visibile** = appetito: goccioline di condensa, vapore che sale (caldo), un taglio fresco che mostra l'interno, briciole/imperfezioni vere. La perfezione plastica spegne la fame; il "appena tagliato" la accende.
- **L'angolo dell'appetito:** 45° per i piatti con altezza, top-down per i flat-lay e i taglieri, macro per la texture (la grana del salame, la crosta del pane). Mai frontale piatto: appiattisce.
- **Luce laterale morbida** (non frontale): scolpisce volume e texture, fa brillare i grassi del salume, crea l'ombra che dà tridimensionalità. Frontale = "fototessera del cibo", morta.
- **Co-protagonisti che danno verità e scala:** tagliere di legno vissuto, coltello, un calice, le **mani del bottegaio** che affettano. La mano umana > il prodotto isolato: dice "vero, artigianale, di qui".
- **Sfondo de-focalizzato e caldo** (bokeh): toglie il rumore, isola il desiderio, suggerisce la bottega senza distrarre. Profondità di campo bassa = prodotto-eroe.
- **Colore che fa salivare:** dominanti calde (rosso/ambra/oro del food + terra del brand). Evita verdi-azzurri freddi sul cibo (sembra non fresco), evita il neon.

## C. La luce — viene PRIMA del soggetto
- **Morbida laterale / golden hour** → calore, verità, "casa". È lo standard MyCity ("Vicino Orgoglioso").
- **Dura/diretta** → drammatica, moderna; per food spesso troppo "pubblicità di catena" → usala con parsimonia.
- **Flat / uniforme** → la firma dell'immagine "fatta dall'AI": piatta, senza anima. **Da evitare a riflesso.**
- **Controluce/rim light** → contorna il soggetto, dà profondità (vapore, calice). Bellissima sul bicchiere/bottiglia.
- Regola pratica: se l'immagine sembra "di plastica", quasi sempre il problema è la **luce flat**, non il soggetto.

## D. Coerenza di brand con l'AI — perché un brand sembra "grande"
- **Una palette, sempre la stessa:** i token di `creativi/brand.mjs` (terracotta `#C0492C`, senape `#E8A33D`, oliva `#5A7C42`, bordeaux `#B82A28`, panna `#FBF7F0`). Spingili nel prompt come *dominanti d'ambiente* (legno scuro, fondo panna "carta da salumeria", accenti terra), non come patch piatte.
- **Vietati (CHECKLIST-BRAND):** giallo-Glovo, arancio-Amazon, blu-tech. Il neon e il "lucido-corporate" tradiscono il brand.
- **Un solo mood:** grezzo-autentico > patinato-anonimo. La scena imperfetta-vera batte la perfetta-finta. Questo è il **moat visivo** di MyCity: nessun gigante può sembrare "del posto".
- **Il logo NON si genera:** l'AI fa lo sfondo e il mood; il wordmark/icona ufficiali li mette il **designer** dagli asset veri (mai rigenerati). Lascia lo **spazio negativo** dove andranno logo/copy.
- **Set, non singola:** lavora a stile-sistema (stessa luce, stesso angolo, stessa palette su tutta una serie) → una libreria coerente e riproducibile (seed+prompt salvati). È L4: la coerenza che fa "grande".

## E. I limiti dell'AI immagine (conoscili, aggirali) — dove mente
- **Mani e dita:** il punto debole storico. Conta-dita SEMPRE (6 dita, dita fuse, pollici impossibili). Se la mano è co-protagonista, genera più varianti, scegli la pulita, o ritocca/inpaint.
- **Testo:** l'AI scrive lettere finte e scarabocchi. **Mai chiedere testo all'AI** (insegne, etichette, prezzi, logo): lascia lo spazio, lo aggiunge il designer con i font veri (Fraunces/Inter). Negativo: "no text".
- **Realismo che inventa il falso:** un prodotto *specifico* reale (l'etichetta vera di Garetti, il packaging vero) l'AI lo inventa diverso → **mente**. Per il prodotto specifico → foto vera ritoccata, non generazione. L'AI è per scene/sfondi/mood generici, non per spacciare un prodotto che non è quello.
- **Volti reali:** l'AI non può generare il volto vero di un negoziante. Per i "Volti" servono foto reali + consenso (🟡). L'AI può fare scene anonime (mani, sagome, ambiente) finché non si finge una persona vera.
- **Coerenza tra immagini:** senza seed/riferimento fisso, due generazioni "stesso prodotto" divergono. Per un set coerente → fissa seed, riusa il prompt, o usa image-to-image dalla foto vera.
- Altri artefatti da cacciare: riflessi/ombre fisicamente impossibili, oggetti che si fondono, texture che si ripete (tiling), occhi/denti deformi, profondità incoerente.

## F. Quando l'AI va DICHIARATA (ONESTA-RULES, regola 4)
- **Marca "visual AI"** ogni immagine generata che **potrebbe sembrare una foto reale** e indurre in errore (una scena di bottega, un prodotto, una persona). In città piccola la fiducia è tutto: una foto-finta scoperta brucia la reputazione.
- **Non serve dichiarare** uno sfondo/texture/pattern astratto evidentemente decorativo che nessuno scambia per realtà.
- **MAI** generare: il volto di una persona reale, un prodotto specifico spacciato per quello vero, un numero/etichetta/prezzo, una "prova sociale" visiva inventata (una bottega piena di clienti che non c'è). → ONESTA-RULES: zero scene false.

## G. Diritti (i paletti legali — nel dubbio, @legale-privacy)
- **Output AI:** usa modelli con licenza d'uso commerciale; tieni traccia del modello/versione. Salva sempre il prompt+seed (provenienza).
- **No persone reali identificabili** senza consenso (anche se "generate somiglianti" a una persona vera). No marchi/loghi di terzi visibili (insegne, packaging di brand altrui).
- **Riferimenti di stile:** cita il *genere* ("editoriale food", "still-life da rivista"), non un artista/fotografo vivente per nome (rischio imitazione di stile protetto).
- **Asset reali (foto del negozio):** restano del negozio → consenso d'uso (🟡). Il logo MyCity → solo asset ufficiali.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — La FORMULA DI PROMPT (template compilabile, le 6 leve + negativi)
```
[SOGGETTO specifico e concreto] ,
[COMPOSIZIONE: inquadratura/angolo + dove lasci lo spazio per il copy] ,
[LUCE: direzione + qualità + ora] ,
[LENTE: mm + apertura/profondità di campo] ,
[STILE/MOOD: genere editoriale + calore "Vicino Orgoglioso" + riferimento di genere] ,
[PALETTE: dominanti terra del brand — legno scuro, fondo panna, accenti terracotta/oliva] ,
[QUALITÀ: fotorealistico, alta risoluzione, texture vere] .
--- NEGATIVI: no text, no logo, no watermark, no mani deformi/6 dita, no plastica lucida,
no neon, no giallo acceso, no arancio Amazon, no blu tech, no aspetto stock-anonimo, no flat light.
[+ seed: NNNN per riproducibilità]
```
**Esempio MyCity (prodotto-eroe):** *"Coppa piacentina DOP affettata sottile a ventaglio su tagliere di legno di ulivo vissuto, due fette arricciate in primo piano, coltello artigianale di lato — flat-lay leggermente a 45°, ampio spazio negativo a destra per il copy — luce naturale morbida da finestra laterale, golden hour, ombre calde — 85mm f/2.0, sfondo de-focalizzato che suggerisce una bottega — fotografia editoriale food, calore artigianale alla Cortilia, fondo panna 'carta da salumeria', accenti terracotta e oliva — fotorealistico, texture della grana visibile. NEG: no text, no logo, no mani, no plastica, no neon, no flat light. seed:4417"*

## TOOL 2 — LIBRERIA di stili/luci per FOOD & BOTTEGA (preset pronti)
| Preset | Quando | Luce | Lente/angolo | Mood |
|---|---|---|---|---|
| **Prodotto-eroe (desiderio)** | scheda/post di vendita | morbida laterale, golden hour | 85mm f/2, 45° appetite | editoriale, bokeh caldo |
| **Flat-lay tagliere (set)** | carosello DOP, "la spesa" | morbida diffusa dall'alto | top-down, 50mm | curato, legno+panna |
| **Macro texture** | grana salame/crosta pane | radente laterale (rim) | macro 100mm | tattile, "lo senti" |
| **Scena di bottega (calore)** | storia Volti, ambiente | controluce morbido da vetrina | 35mm, mani in primo piano | vissuto, verità, leggera grana |
| **Mani del bottegaio** | "Il Turno", autenticità | naturale laterale | 50mm, dettaglio mani/banco | grezzo-vero, anti-stock |
| **Sfondo/texture brand** | fondo per il designer | uniforme soft | top-down | carta da salumeria, terra, vuoto per il copy |
| **Mockup (sacchetto/QR in cassa)** | materiali fisici | ambiente naturale | 35-50mm, prospettiva reale | bottega vera, no studio asettico |
> Regola anti-flat: nessun preset usa luce frontale piatta. Se l'output è "di plastica", cambia la luce prima di tutto.

## TOOL 3 — Il LOOP INTERNO (mai consegnare la prima generazione)
1. [ ] **Brief in 1 riga:** a cosa serve il visual + dove vive + materia prima reale che ho.
2. [ ] **3 DIREZIONI diverse** (3 art direction: luce/inquadratura/mood diversi — NON 3 seed della stessa idea).
3. [ ] **Genera un set** per direzione (3-4 varianti), non una sola immagine.
4. [ ] **Ghigliottina:** *«Sembra una foto vera di una bottega vera, o un'immagine generata da chiunque?»* → se la seconda, **kill**.
5. [ ] **Tieni 1 direzione**, scarta 2 (e annota perché → memoria).
6. [ ] **Raffina 2-3 round:** R1 luce/palette verso i token · R2 crop/composizione + spazio per il copy · R3 pulizia artefatti (mani/testo/riflessi).
7. [ ] **Cancelli** sul lavoro importante: @direttore-creativo (livello vs swipe) → @qa-designer (brand/onestà/segnaposti).
8. [ ] **Consegna:** file in `creativi/output/` + **prompt e seed allegati** (riproducibile) + quale direzione e perché.

## TOOL 4 — CHECKLIST di SELEZIONE / SCARTO (quale immagine tieni)
**SCARTA a vista (red flags):**
- mani/dita deformi · testo/lettere finte non rimosse · logo "rigenerato" dall'AI
- luce flat "da AI" · palette fuori brand (giallo/arancio/blu) · neon
- aspetto stock-anonimo ("lo poteva generare chiunque") · prodotto inventato spacciato per reale
- riflessi/ombre impossibili · texture che si ripete (tiling) · profondità incoerente
**TIENI (gold):**
- luce morbida che scolpisce + calore vero · palette terra del brand · spazio negativo pulito per il copy
- texture food appetitosa (freschezza visibile) · co-protagonista umano/oggetto vero · "sembra una foto vera di qui"
> Domanda-ghigliottina, sempre: **«Poteva farlo Amazon / un brand qualunque?»** → se sì, rifai.

## TOOL 5 — RITOCCO / UPSCALE / PULIZIA (post-generazione)
1. **Inpaint/correzione** delle mani e degli artefatti (rigenera solo la zona difettosa, non tutta l'immagine).
2. **Rimozione testo/scarabocchi** generati per errore (l'AI non scrive: pulisci e lascia lo spazio al designer).
3. **Color grade verso i token** brand (calda dominante terra, panna sui fondi) se l'output è andato fuori palette.
4. **Upscale** alla risoluzione di consegna: feed 1080×1080 · portrait 1080×1350 · story/reel-cover 1080×1920 (CHECKLIST-BRAND).
5. **Spazio negativo verificato:** c'è il vuoto dove il designer mette logo/headline/CTA + safe-area reel (testo nell'80% centrale).
6. **Provenienza:** salva prompt + seed + modello/versione accanto al file (riproducibilità + diritti).

## TOOL 6 — La DICHIARAZIONE "immagine AI" (come e quando marcare)
- **Quando** (ONESTA-RULES r.4): l'immagine generata potrebbe sembrare una foto reale (scena/prodotto/persona).
- **Come:** dicitura discreta ma chiara nel contesto di pubblicazione — caption: "Visual AI · scena illustrativa" oppure micro-credito sull'immagine. Concorda la forma standard col **content-social**/@legale-privacy.
- **Non serve:** pattern/texture/sfondo astratto decorativo non scambiabile per realtà.
- **Mai sostituibile da una dichiarazione:** volti reali, prodotto specifico, numeri/prezzi, prova sociale finta → quelli **non si generano**, punto.

## TOOL 7 — HANDOFF (rendi il file riusabile dalla squadra)
- Salva in `creativi/output/` con naming `AAAA-MM-GG_uso_formato_vNN.png` + un `.txt`/`.md` gemello con **prompt+seed+modello**.
- **PASSO-A @designer** (montaggio/gabbia/logo/QR/stampa) o **@content-social** (caption). Dichiara spazio negativo e safe-area lasciati.
- Formati standard (vedi Tool 5) + livelli/spazio per il logo → il designer non deve ritagliare a mano.

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, con il PERCHÉ)
> Modella, non copiare. Studia `creativi/swipe/SWIPE-FILE.md`. Ogni voce: COSA · PERCHÉ (principio) · MYCITY.

## PRODOTTO-EROE
- ✅ **GOLD — Cortilia, prodotto in uso, luce morbida, sfondo de-focalizzato.** *Perché:* la luce laterale scolpisce, il bokeh isola il desiderio, l'angolo a 45° è l'appetite angle → fame + utilità. *MyCity:* coppa DOP a ventaglio su legno, golden hour, spazio a destra per "Cosa ci fai con una coppa DOP vera?".
- ❌ **SPAZZATURA — foto-prodotto frontale, luce flat, sfondo bianco asettico.** *Perché:* piatta, senza volume, "fototessera del cibo" → nessuna fame, sa di stock. La luce frontale uccide la texture.

## SCENA DI BOTTEGA / VOLTI
- ✅ **GOLD — La Ruche, persona-in-scena calda, controluce dalla vetrina.** *Perché:* la verità della persona viene prima del prodotto; il controluce morbido dà profondità e calore "casa". *MyCity:* "Dietro la saracinesca, alle 6" — mani del bottegaio che affettano, leggera grana, anti-patinato (volto solo con consenso).
- ❌ **SPAZZATURA — scena AI iper-lucida, luce uniforme, salumiere "perfetto" plastico.** *Perché:* sa di "non vero", luce flat = firma-AI, qualsiasi brand poteva generarla → muore. E un volto inventato che finge un negoziante reale **mente** (ONESTA-RULES).

## DETTAGLIO / TEXTURE
- ✅ **GOLD — macro della grana del salame, luce radente.** *Perché:* il tattile vende ("lo senti"); la luce radente esalta la texture. *MyCity:* macro della coppa/del pane → carosello "i 3 DOP".

## SFONDO / SET PER IL DESIGNER
- ✅ **GOLD — fondo panna "carta da salumeria" con accenti terra, top-down, spazio vuoto.** *Perché:* coerenza di brand + vuoto pulito per headline/CTA → il designer monta senza lottare. *MyCity:* fondo per il post "Il Turno".
- ❌ **SPAZZATURA — sfondo neon/gradiente fuori palette, niente spazio per il copy.** *Perché:* fuori brand (giallo/blu vietati) e inutilizzabile → il designer lo butta.

## ❌ ERRORI TECNICI DA UCCIDERE A VISTA (col perché)
Mani a 6 dita (artefatto classico, conta sempre) · testo/etichette generati dall'AI (lettere finte → l'AI non scrive) · logo rigenerato (mai: usa l'ufficiale) · luce flat "da AI" (manca emozione) · prodotto specifico inventato (mente sul reale) · tiling della texture (si nota il "copia-incolla") · riflessi impossibili (rompe il realismo).

## 🏆 Pattern vincenti distillati
Luce morbida laterale > flat · volto/mani > prodotto isolato · calore grezzo > patinato · palette terra coerente · spazio negativo per il copy · prodotto specifico = foto vera, non AI · set coerente (seed+prompt) > singola · sempre prompt+seed allegato.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, dove si innesta)
> Senza questo, il kit è un fuoriclasse a mani vuote: produce ottime *strutture/mood* ma con segnaposto o
> scene generiche. Col carburante il tetto sale da 8 a 10. Ecco ESATTAMENTE cosa serve e dove entra:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Chiavi AI immagine attive** (Gemini/image e simili) | generare/upscale/inpaint davvero, non solo descrivere | tutto lo Strato 4; i crediti sono budget reale (🔴 spese) |
| **Foto vere del prodotto/bottega** (riferimento di luce, forma, colore) | image-to-image fedele + prodotto specifico VERO (non inventato) | Tool 1-2, Sapere B/E, Galleria |
| **Brand kit** (`creativi/brand.mjs`: palette/font/tagline) | dominanti di palette coerenti nel prompt | Sapere D, Tool 1 (palette), Tool 5 (grading) |
| **Logo ufficiale** (`design-system/assets/wordmark-*.svg`, mai rigenerato) | il designer lo monta nello spazio negativo | Sapere D/E, Tool 7 (handoff) |
| **Consensi firmati** (volto/persona/bottega reale) | sbloccano scene-ritratto reali (🟡) | Sapere E/F, ONESTA-RULES |
| **Dato KPI** (engagement/salvataggi/CTR del post/scheda che usa il visual) | misura: il visual è buono solo se muove un numero | loop chiuso → `memoria-squadra/ai-designer.md` |
| **Forma standard "visual AI"** (con content/@legale-privacy) | dichiarare l'AI in modo coerente | Tool 6 |

Finché manca, **NON inventare un prodotto/scena falsi e NON consegnare un compromesso:** usa segnaposto
chiari (`[FOTO VERA DEL PRODOTTO]`, `[VOLTO — consenso]`) e chiedi il carburante a Nicola/al negozio come
leva che alza il livello. È la regola del Vicino Orgoglioso onesto.

---
*Manutenzione: questo kit è vivo. Quando un visual va in pubblicazione e torna il dato reale, aggiorna la
Galleria (nuovo gold/spazzatura col perché) e la libreria di prompt/seed vincenti in `creativi/`. Salva sempre
prompt+seed (riproducibilità + provenienza). RIASSUMI/POTA mensile: resta denso e affilato.*
