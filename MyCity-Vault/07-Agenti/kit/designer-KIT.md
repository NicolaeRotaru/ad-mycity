---
tipo: kit-mestiere
ruolo: designer
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-06-27 · carburante reale atteso (loghi ufficiali, foto vere, URL definitivi)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · CHECKLIST-BRAND.md · ONESTA-RULES.md · creativi/brand.mjs · creativi/swipe/SWIPE-FILE.md
---

# 🧰 KIT MESTIERE — designer (il "cervello allenato" del fuoriclasse del design)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un pro **sa e usa**
> (strati 3-6): il sapere del mestiere, gli strumenti passo-passo, la galleria di gold/spazzatura, il carburante.
> Leggilo come la tua testa da 15 anni di vetrine, QR e kit di brand. Bersaglio: **L7-con-giudizio** (vedi [[RUBRICA-LIVELLI]]).
> Il tuo metro NON è "carino per una bottega": è **un brand di quartiere che sembra grande** (Eataly a scaffale, Apple in vetrina, Monzo come coerenza).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse del design SA davvero)

## A. I principi non negoziabili (l'80% del "pro vs dilettante" è qui, non nell'idea)
- **Gerarchia visiva — "si legge prima di leggere".** L'occhio coglie UN messaggio in 1 secondo, *poi* i dettagli.
  Una sola cosa deve essere la più grande/forte. Scala tipografica chiara: **kicker** (piccolo, occhiello) →
  **headline** (la cosa) → **sub** (opzionale) → **CTA** → **footer**. Se ci sono 3 elementi "urlati", ne urla zero.
  Test: socchiudi gli occhi → deve restare leggibile solo il messaggio principale. Se no, manca gerarchia.
- **Gabbia & griglia — "la gabbia è sacra".** Margini coerenti (mai testo che tocca il bordo), tutto allineato a
  una griglia, spaziatura ritmica (multipli di una base, es. 8px). Il **whitespace non è vuoto**: è respiro che fa
  sembrare costoso. Allineamento > centratura casuale: un asse forte (sinistra o centro) tenuto per tutto il pezzo.
- **Contrasto = funzione, non gusto.** Il testo deve passare a **occhio stanco** e in **fotocopia b/n**. Regola
  pratica: contrasto testo/sfondo ≥ **4.5:1** (corpo), ≥ **3:1** (titoli grandi). Terracotta su panna ✅,
  senape su bianco ❌ (svanisce). Mai testo chiaro su foto chiara senza overlay/ombra.
- **Leggibilità a distanza — il supporto comanda.** La dimensione del testo dipende dalla **distanza di lettura**:
  A5 in cassa si legge a ~50cm, una vetrofania a 3 metri dal marciapiede, un post a 320px nel feed. Regola del
  pollice: **altezza lettera ≥ distanza_lettura / 200** (a 3m → carattere ≥ ~15mm). Se devi avvicinarti per leggere, è sbagliato.
- **Un materiale = un solo lavoro.** Il QR fa scansionare, la locandina fa fermare, la vetrofania fa entrare.
  Due lavori su un materiale = zero. Se non sai qual è l'unica azione, non impaginare ancora.
- **Spazio negativo e raggruppamento (Gestalt).** Elementi vicini = "vanno insieme"; lontani = separati. Raggruppa
  per significato (CTA col suo beneficio, prezzo col prodotto). La prossimità racconta la struttura senza linee.
- **Coppie di font, non zoo.** Max 2 famiglie (display + testo) + i pesi. 3+ font = dilettante. Il contrasto si
  fa con **peso e dimensione**, non aggiungendo caratteri.

## B. Il BRAND SYSTEM MyCity (il riflesso, non una scelta — token unico `creativi/brand.mjs`)
- **Palette ufficiale** (mai colori "a occhio", mai "quasi terracotta"):
  terracotta/cotto `#C0492C` (primary, fondi forti/headline su panna) · senape `#E8A33D` (accent: CTA, badge,
  parola-chiave) · oliva `#5A7C42` (fresco/numeri positivi) · bordeaux `#B82A28` (urgenza/sconti) ·
  inchiostro `#2C2A28` (testo) · panna `#FBF7F0` (sfondo editoriale, "carta da salumeria") · bianco `#FFFFFF`.
  ❌ **VIETATI a vista:** giallo-Glovo, arancio-Amazon, blu-tech. Sono il nemico cromatico: ci confondono col gigante.
- **Tipografia:** **Fraunces** (serif artigianale) = display/headline/numeri/wordmark · **Inter** (sans) =
  corpo/caption/CTA. Nei render: `@import` Google Fonts + fallback Georgia/Helvetica, attendi `document.fonts.ready`
  prima di renderizzare (altrimenti esce il fallback per errore).
- **Tono visivo:** calore artigianale + orgoglio civico. Bande terracotta su fondo panna; silhouette
  Palazzo Gotico/Cavalli come **timbro civico** (mai emoji come logo); volti reali; grafia a mano dove possibile.
- **Voce micro:** dà del tu, frasi brevi, **1 CTA sola**, ironia gentile mai sarcasmo. Dialetto solo come spezia,
  marcato `[DA VALIDARE]`.
- **Footer brand SEMPRE:** wordmark "MyCity" (Fraunces) + tagline *"La spesa che tiene viva la città."* + @handle —
  scritti **identici** ovunque (una sola verità: una tagline, un handle, un logo). Logo = **asset ufficiale**
  (`design-system/assets/wordmark-light.svg` / `wordmark-ondark.svg` / `logo-icon.svg`), mai rigenerato/stirato.
- **Formati canonici:** Feed 1080×1080 · Portrait 1080×1350 (preferito IG) · Story/Reel-cover 1080×1920.

## C. QR che FUNZIONANO (la metà dei QR in giro non scansiona — la nostra no)
- **Quiet zone obbligatoria:** margine bianco tutt'intorno ≥ **4 moduli** (≈ lo spessore di 4 "quadratini"). Senza
  margine il lettore non trova i bordi → non scansiona. Mai QR a filo del bordo o sopra una texture.
- **Contrasto alto, scuro su chiaro:** moduli scuri (inchiostro/terracotta scura) su sfondo chiaro. **Mai
  invertito** (chiaro su scuro): molti lettori falliscono. Se brandizzi col colore, tieni il contrasto ≥ 3:1 reale.
- **Dimensione minima:** lato ≈ **distanza_scansione / 10** (a 30cm in cassa → ≥ 3cm; vetrofania a 2m → ≥ 20cm).
  In dubbio, più grande. Un QR piccolo è un QR morto.
- **Correzione d'errore:** livello **M** (o **H** se ci metti il logo al centro — H tollera ~30% di occlusione).
  Logo centrale max ~20% dell'area, con quiet-zone interna attorno.
- **Niente sopra la curva/piega/lucido:** su sacchetti e superfici curve il QR si deforma → preferisci piano e opaco.
- **Destinazione esatta + test reale:** l'URL deve essere quello **definitivo e vivo** (pagina-negozio `/store/[id]`
  o link lista d'attesa). **Scansiona davvero il file finale** con 2 telefoni prima di consegnare. Usa un URL corto/UTM
  (`?utm_source=qr&utm_campaign=...`) per misurare le scansioni. Un QR verso l'URL sbagliato = danno reputazionale reale.

## D. MATERIALI FISICI (ognuno ha la sua legge — il supporto comanda)
- **Locandina cassa (A5/A4, ~50cm):** 1 messaggio + QR grande + 1 CTA. Verticale, gerarchia top→bottom
  (headline → beneficio → QR → footer). Pensata per essere **stampata da un negoziante over-50 senza sbatti**:
  A5 sta in cornicetta da banco. Deve reggere anche in **b/n** (molte stampanti di bottega sono mono).
- **Vetrofania (vetrina, 2-3m):** UN solo messaggio enorme, leggibile dal marciapiede. Testo grande, QR grande,
  pochissime parole. Considera che si legge **da fuori** (mirror se è adesivo interno sul vetro) e con riflessi:
  contrasto massimo. Formati tipici alti/verticali per la colonna vetrina.
- **Packaging / sacchetto / vetrofania su carta:** area di stampa limitata, spesso **1 colore** (costo). Progetta
  una versione **mono-terracotta** che funziona da sola. Logo + tagline + @handle + (eventuale QR piano). Su sacchetto
  conta la **ripetibilità** (pattern/timbro) più del dettaglio fine.
- **Volantino:** il rischio è il "pieno". Un volantino = una promessa + una prova + una CTA. Se ha 5 messaggi, è 5 volantini falliti.
- **Regola trasversale fisici:** standardizza i formati (A5/A4/adesivo) e **dai istruzioni di stampa** al negozio
  ("stampa A5, carta normale, niente bordi") → la rete espone a costo ~0 (capitale relazionale).

## E. STAMPA (dove il digitale incontra la carta — gli errori qui non si correggono dopo)
- **Colore: CMYK, non RGB.** Lo schermo è RGB (luce), la stampa è CMYK (inchiostro): i colori brillanti **smorzano**.
  Il file pronto-stampa va in **CMYK**; se non hai la prova colore, **dichiaralo** (metacognizione: "sulla resa CMYK
  tiro a indovinare senza prova"). Per il digitale (social/schermo) resta RGB.
- **Abbondanza (bleed) + margine di sicurezza:** se il colore arriva al bordo, estendilo di **3mm oltre il taglio**
  (bleed) e tieni **testo/elementi importanti ≥ 3-5mm dentro** il taglio (safe-area) → il taglio non mangia il testo.
- **Risoluzione: 300 DPI a dimensione reale** per la stampa (non 72dpi da schermo, che esce sgranato). Un'immagine
  va bene per stampa solo se ha pixel a sufficienza: A5 a 300dpi ≈ 1748×2480px. Logo sempre **vettoriale (SVG/PDF)**.
- **Crocini e formato:** esporta PDF pronto-stampa con crocini di taglio se la tipografia li chiede; verifica il
  formato finale (A5 = 148×210mm). **Ordinare/pagare la stampa = 🔴** (proponi quantità e costo, decide Nicola).
- **Safe-area digitale (reel/story):** testo nel **80% centrale**, niente testo sotto i ~250px in basso (lo coprono
  le UI di IG/TikTok). È il gemello-schermo del bleed: un'area che "si perde" e va tenuta libera.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Il riflesso diagnostico (3 domande PRIMA di aprire qualsiasi file)
1. **Unica azione:** cosa deve far fare questo materiale (scansionare / fermarsi / entrare / ordinare)?
2. **Dove vive e a che distanza si legge** (cassa 50cm / vetrina 3m / feed 320px / stampa)?
3. **Quale dato reale mi serve** (URL esatto e vivo del QR, nome negozio corretto, logo ufficiale, testo definitivo approvato)?
> Se manca il carburante reale (URL giusto, logo, testo finale) → **fermati e procuratelo** (Strato 6). Un QR verso
> l'URL sbagliato o un nome storpiato in vetrina è un danno reale, non un dettaglio.

## TOOL 2 — Il LOOP INTERNO (non consegni MAI la prima impaginazione)
1. [ ] **Brief in 1 riga:** unica azione + dove vive + dato reale (Tool 1).
2. [ ] **3 IMPAGINAZIONI diverse** — non 3 ritocchi: 3 *gerarchie* diverse (es. QR-dominante / headline-dominante / immagine-dominante).
3. [ ] **Ghigliottina** su ciascuna: *«Lo firmerebbe un brand nazionale? si legge a 1 metro? il QR scansiona davvero?»* → se no, **kill**.
4. [ ] **Tieni 1, uccidi 2** (e annota perché → memoria). Assorbi la forza migliore delle scartate.
5. [ ] **Raffina 2-3 round:** R1 allinea alla griglia/gabbia → R2 alza il contrasto + leggibilità a distanza → R3 taglia il superfluo + verifica safe-area/bleed.
6. [ ] **Test fisico:** socchiudi gli occhi (gerarchia regge?) · simula b/n (contrasto regge?) · **scansiona il QR vero**.
7. [ ] Solo ora i cancelli (Tool 6) e la consegna — dichiara quale impaginazione hai scelto e *perché* batteva le altre due.

## TOOL 3 — CHECKLIST DI BRAND (i mandatori — fonte CHECKLIST-BRAND.md)
- [ ] **Palette:** solo colori del token `creativi/brand.mjs`? (nessun giallo-Glovo / arancio-Amazon / blu-tech)
- [ ] **Font:** Fraunces (display) + Inter (testo), o fallback corretto, con `document.fonts.ready`?
- [ ] **Gerarchia:** 1 idea sola, ≤ ~30 parole sull'immagine, kicker→headline→(sub)→CTA→footer leggibile?
- [ ] **Gabbia:** margini coerenti, allineamento a griglia, niente testo a filo bordo, whitespace che respira?
- [ ] **Safe-area:** reel/story testo nell'80% centrale (niente sotto ~250px)?
- [ ] **Footer brand:** wordmark "MyCity" + tagline + @handle presenti e **identici** allo standard?
- [ ] **Logo:** asset ufficiale (non rigenerato/stirato)?
- [ ] **Stampa:** CMYK + bleed 3mm + 300dpi + safe-area di taglio (se va in tipografia)?
- [ ] **Segnaposti:** nessun `{{...}}` / `[...]` / Lorem rimasto visibile per errore?
> Una ❌ → **rigenera**, non consegnare.

## TOOL 4 — DAL BRIEF AL FILE PRONTO-STAMPA (il processo, passo-passo)
1. **Brief & dato reale** (Tool 1): raccogli URL definitivo, logo ufficiale, testo approvato, foto vera. Manca? → Strato 6, fermati.
2. **Imposta il documento:** formato giusto (A5 148×210mm / vetrofania / 1080×1350) · margini/griglia · CMYK se stampa, RGB se schermo · bleed 3mm se il colore va al bordo.
3. **Token, non valori a mano:** importa colori/font da `creativi/brand.mjs`. Mai HEX scritti a memoria.
4. **3 impaginazioni → loop interno** (Tool 2): tieni la migliore.
5. **Inserisci gli asset veri:** logo SVG ufficiale, foto a 300dpi reali, QR generato (Tool 5) con quiet-zone.
6. **Cancelli** (Tool 6): @direttore-creativo (livello) → @qa-designer (brand/safe-area/segnaposti/onestà).
7. **Esporta:** PNG/SVG per social · **PDF pronto-stampa** (CMYK, crocini se richiesti, font incorporati/convertiti in tracciati) per la tipografia.
8. **Test finale:** scansiona il QR · controlla a dimensione reale (stampa di prova A4 a casa) · simula b/n.
9. **Consegna in `creativi/output/`** + istruzioni di stampa per il negozio. La stampa pagata resta 🔴 (proponi quantità/costo).
> Strumenti che HAI: `creativi/genera-qr.mjs` (QR offline), `creativi/genera-locandina.mjs` (PDF brand),
> SVG brandizzati con i token, Content Factory `cervello/content-factory/` (render.mjs + template per categoria).

## TOOL 5 — CHECKLIST QR (una ❌ = QR morto)
- [ ] **URL definitivo e vivo** (testato in browser) — non un placeholder, non staging?
- [ ] **Quiet zone** ≥ 4 moduli di margine bianco tutt'intorno?
- [ ] **Contrasto** scuro-su-chiaro, **mai invertito**, ≥ 3:1 reale anche se brandizzato?
- [ ] **Dimensione** ≥ distanza_scansione/10 (cassa ≥ 3cm, vetrina ≥ 20cm)?
- [ ] **Correzione errore** M (o H se c'è il logo centrale, ≤ 20% area)?
- [ ] **Superficie** piana e opaca (no curva/lucido/piega)?
- [ ] **UTM** sul link per misurare le scansioni?
- [ ] **TEST REALE:** scansionato col file/stampa finale da **2 telefoni**, porta alla pagina giusta?
> Comando: `node creativi/genera-qr.mjs "<URL>" creativi/output/nome.png`

## TOOL 6 — I CANCELLI (sul lavoro importante, PRIMA di consegnare)
1. **@direttore-creativo (livello):** giudica le impaginazioni vs SWIPE-FILE + RUBRICA-QUALITA-PER-CATEGORIA.
   Domanda-ghigliottina: *«poteva farlo Amazon / un negozio qualunque?»* → se sì, rifai. Uccide il debole, tiene/raffina il migliore.
2. **@qa-designer (tecnico):** verifica CHECKLIST-BRAND (palette/font/gabbia/safe-area/footer) + ONESTA-RULES
   (zero numeri/testimonianze finti, segnaposti `[...]` evidenti, AI dichiarata, consensi per volto/nome/voce reali).
   Una ❌ → rigenera. Per claim legali/sanitari/bandi → @legale-privacy. Per foto AI → @ai-designer.

## TOOL 7 — TEMPLATE PER CATEGORIA (gabbie compilabili, riusabili)
- **LOCANDINA CASSA (A5 verticale, ~50cm):** `kicker` (orgoglio civico) · `headline` Fraunces grande (la promessa) ·
  `1 riga` beneficio (Inter) · **QR grande** centrato con quiet-zone · `footer` wordmark+tagline+@handle. CMYK + regge in b/n.
- **VETROFANIA (vetrina, 3m):** UN messaggio enorme + QR grande + zero fronzoli. Contrasto massimo, formato verticale colonna-vetrina.
  Se adesivo interno → controlla l'orientamento per chi legge da fuori.
- **SOCIAL POST/STORY (1080×1350 / 1080×1920):** copertina con UNA promessa, ≤30 parole, safe-area 80% centrale,
  foto/visual reale (o AI dichiarata), footer brand. KPI: salvataggi/scansioni, non like.
- **SACCHETTO/PACKAGING (mono-colore):** versione 1-colore terracotta, pattern/timbro civico + logo + @handle + (QR piano).
> Riusa i template della Content Factory (`cervello/content-factory/render.mjs` + `templates/`); non re-impaginare da zero ogni volta (efficienza).

## TOOL 8 — PLAYBOOK ripubblicazione NEGOZIO (la rete come megafono)
Per ogni materiale fisico/social, prepara la **versione facilissima da esporre dal negoziante**: file pronto al
formato standard + **istruzioni di stampa di una riga** ("stampa A5, carta normale") + (per social) la grafica già
pronta da ricondividere. Il negoziante **non crea, espone/ricondivide**. → attiva la sua fiducia (capitale relazionale)
a costo ~0. Le pubblicazioni/affissioni che toccano il mondo reale restano 🔴 (ok del negozio).

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10 — modella, non copiare)
> Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Estende `creativi/swipe/SWIPE-FILE.md` + CHECKLIST-BRAND.

## VETROFANIA
- ✅ **Un solo messaggio + QR grande + quiet-zone pulita.** *Perché:* una sola gerarchia → si legge dal marciapiede
  a 3m e scansiona al primo colpo. *MyCity:* "Trovi Garetti su MyCity 👉" + QR enorme + footer brand, mono-terracotta su panna.
- ❌ **Vetrofania "piena": 5 messaggi, 3 font, QR minuscolo senza margine.** *Perché muore:* l'occhio non sa dove andare,
  il QR non scansiona. La firmerebbe qualsiasi negozio → ghigliottina.

## LOCANDINA CASSA
- ✅ **A5 con headline Fraunces + 1 beneficio + QR grande, regge in b/n.** *Perché:* gerarchia top→bottom, stampabile
  dal negoziante senza sbatti, contrasto che passa anche in fotocopia. *MyCity:* "La spesa del centro, a casa tua."
- ❌ **A4 fitto di testo, QR sul bordo senza quiet-zone, senape su bianco.** *Perché muore:* testo che non si legge a 50cm,
  QR morto, contrasto svanito.

## QR
- ✅ **QR scuro-su-panna, quiet-zone 4 moduli, logo-icon centrale a correzione H, URL `/store/[id]` testato.** *Perché:* scansiona
  sempre, on-brand, misurabile (UTM). *MyCity:* in cassa ≥ 3cm, in vetrina ≥ 20cm.
- ❌ **QR chiaro su foto scura, a filo bordo, verso URL di staging.** *Perché muore:* niente contrasto, niente quiet-zone, link rotto = danno reputazionale.

## SOCIAL (statico)
- ✅ **Copertina con UNA promessa, volto reale, safe-area rispettata, footer brand.** *Perché:* 1 messaggio + volto > prodotto,
  si salva. *MyCity:* "Dietro la saracinesca, alle 6" — Garetti che apre.
- ❌ **Carosello-catalogo 8 prodotti, nessuna idea, font fuori sistema.** *Perché muore:* "da scaffale", lo firmerebbe Amazon, non si salva.

## PACKAGING / SACCHETTO
- ✅ **Mono-terracotta: timbro Palazzo Gotico + logo + @handle, pattern ripetuto.** *Perché:* funziona a 1 colore (costo basso),
  riconoscibile, ripetibile. *MyCity:* "carta da salumeria" come texture-firma.
- ❌ **Sacchetto a 4 colori con foto fotografica piccola e logo stirato.** *Perché muore:* costo alto, dettaglio illeggibile, logo deformato.

## 🏆 Pattern vincenti distillati (regole trasversali)
1 materiale = 1 lavoro · gerarchia visibile a occhi socchiusi · gabbia/griglia rispettata · contrasto che regge in b/n ·
QR con quiet-zone testato · token-colore/font sempre · logo ufficiale mai stirato · footer brand identico ovunque ·
leggibilità tarata sulla distanza · versione ripubblicabile dal negozio.
## 🚩 Red flags (uccidi a vista)
QR senza quiet-zone / verso URL sbagliato/staging · testo troppo piccolo per la distanza · 5 messaggi su un materiale ·
3+ font · colore "a occhio" invece del token · segnaposto `[...]`/Lorem rimasto · logo rigenerato/stirato · safe-area/bleed
ignorata (testo tagliato) · contrasto insufficiente in b/n · giallo-Glovo/arancio-Amazon/blu-tech · "da scaffale" (lo firmerebbe Amazon).

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, e dove si innesta)
> Senza questo, il kit è un fuoriclasse a mani vuote: produce ottime *gabbie* ma con segnaposto. Col carburante il tetto sale da 8 a 10.

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **URL/destinazione esatta del QR** (definitiva e viva) | il QR porta alla pagina giusta, non a staging/404 | Tool 1, Tool 5 (QR), Tool 4 |
| **Logo ufficiale** (`design-system/assets/*.svg`) | footer e materiali col logo vero, non rigenerato/stirato | Brand B, Tool 3 (checklist), Tool 7 |
| **Testo definitivo approvato** (headline/CTA/nome negozio corretto) | zero segnaposto, zero nomi storpiati in vetrina | Tool 1, Tool 4, ONESTA-RULES |
| **Foto/visual reali** dei negozi e bottegai (300dpi) | locandine/social veri, non foto-stock né placeholder | Tool 4, Tool 7 (social), Galleria |
| **Consensi firmati** (volto/nome/voce) | sbloccano i materiali-ritratto e la rete del negozio | Tool 6 (@qa-designer/ONESTA), Tool 8 |
| **Chiavi AI** (Gemini-image/Canva/ai-video) | foto-prodotto e visual pro generati, non segnaposto | Tool 7, Content Factory `ai/` |
| **Prova colore CMYK / specifiche tipografia** (formato, bleed, crocini) | il pronto-stampa esce col colore giusto, non a indovinare | Stampa E, Tool 4 (export) |
| **Dati reali** (scansioni QR via UTM, esposizioni, ordini dalla landing) | misura + loop chiuso → si impara dai numeri | Tool 5 (UTM), memoria-squadra/designer.md |

Finché manca, **NON inventare e NON consegnare un compromesso:** usa segnaposto chiari `[...]` e chiedi il carburante
a Nicola come leva che alza il livello (regola del Vicino Orgoglioso onesto). Un QR verso l'URL sbagliato o un nome storpiato
in vetrina è un danno reale, non un dettaglio.

---
*Manutenzione: questo kit è vivo. Ogni volta che un materiale esce e torna il dato reale (scansioni, esposizioni),
aggiorna la Galleria (nuovo gold/spazzatura col perché) e la memoria `memoria-squadra/designer.md`.
RIASSUMI/POTA mensile: resta denso e affilato.*
