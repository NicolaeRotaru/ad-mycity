---
tipo: kit-mestiere
ruolo: frontend-dev
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-06-27 · carburante reale atteso (mockup, schema dati, URL anteprima, device reali)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · MyCity-Vault/07-Agenti/DESIGN.md · .claude/agents/frontend-dev.md
---

# 🧰 KIT MESTIERE — frontend-dev (il "cervello allenato" del fuoriclasse)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un pro **sa e usa**
> (strati 3-6): il sapere, gli strumenti passo-passo, la galleria di esempi, e il carburante che serve.
> Leggilo come la tua testa da 15 anni di mestiere su interfacce che vendono. Bersaglio: **L7-con-giudizio**
> (vedi [[RUBRICA-LIVELLI]]). Sul percorso d'acquisto pretendi la UI che converte, non quella "carina".
> **Deploy/merge su main = 🔴** (firma Nicola): qui produci codice in branch, mai live.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse del frontend SA davvero)

## A. Mobile-first VERO (non "responsive a posteriori")
- **Il 70% degli ordini arriva da mobile**, spesso da telefoni vecchi e rete 3G/lenta. Mobile-first non è
  "rimpicciolisco il desktop": è **disegnare e provare dal telefono PRIMA**, poi crescere verso il desktop.
  Se regge a **360px** (e a 320px in degrado dignitoso) regge ovunque; il contrario non è vero.
- **Tap-target ≥ 44×44px** (linea Apple/WCAG 2.5.5) con spazio attorno: il pollice non è un mouse. Bottoni
  vicini = tap sbagliati = rabbia al checkout. Niente hover-only: su touch l'hover non esiste, ogni stato
  deve essere raggiungibile col tap.
- **Niente layout-shift quando appare la tastiera**: input vicino al fondo + tastiera mobile = il bottone
  "Paga" sparisce o si sovrappone. Provalo con la tastiera aperta, non solo a tastiera chiusa.
- **Il pollice arriva in basso**: le azioni primarie (CTA, "aggiungi al carrello", "paga") stanno nella
  *thumb-zone* inferiore, non in alto a destra dove serve due mani.
- **Viewport reale**: usa `dvh`/`svh`, non `vh` puro (su iOS la barra browser mangia 100vh e taglia la CTA).

## B. Tutti gli stati esistono — loading / vuoto / errore / successo
- Un componente che mostra **solo il caso felice è metà componente**. L'utente reale incontra la rete lenta,
  la lista vuota, il 500. Per OGNI vista che carica dati, progetta i **4 stati**:
  - **Loading** → **skeleton** (non spinner nudo): mostra la *forma* di ciò che arriva, percezione di velocità.
    Evita il *layout shift* quando il dato sostituisce lo skeleton (riserva l'altezza).
  - **Vuoto** → non una pagina bianca: spiega *perché è vuoto* e *cosa fare* ("Nessun prodotto in questa
    categoria — torna al catalogo"). Lo stato vuoto è un'occasione di conversione, non un vicolo cieco.
  - **Errore** → messaggio umano (mai "Error 500"/stack) + **azione di recupero** ("Riprova") + niente
    perdita di ciò che l'utente aveva inserito. Distingui errore di rete (riprova) da errore di validazione
    (correggi il campo).
  - **Successo** → conferma chiara e immediata (l'ordine è andato? il carrello si è aggiornato?).
- **Stato parziale/ottimistico**: per azioni leggere (aggiungi al carrello, +1 quantità) aggiorna subito la
  UI (optimistic update) e riconcilia col server; se fallisce, rollback + messaggio. Sembra istantaneo.

## C. Il CHECKOUT è un flusso sacro (qui si vince o si perde il fatturato)
- **Ogni campo in più è un carrello perso.** Chiedi solo l'indispensabile; precompila tutto il precompilabile;
  niente registrazione obbligatoria prima di pagare (guest checkout). Il passo migliore è quello che non c'è.
- **Prevenire il DOPPIO-SUBMIT è non-negoziabile** (vedi anche Sapere D): doppio tap nervoso su rete lenta =
  **doppio ordine, doppio addebito**. Il bottone "Paga/Ordina" si **disabilita all'invio**, mostra spinner/
  "Invio…", e si riabilita solo su errore. Idealmente l'invio porta una **chiave di idempotenza** (coordina
  con @backend-dev) così anche due richieste partite non creano due ordini.
- **Errori inline, accanto al campo**, in tempo reale ma non aggressivi (valida all'`onBlur`, non a ogni
  tasto): l'utente deve sapere *quale* campo e *perché*. Mai un alert generico in cima che non dice dove.
- **Riepilogo sempre visibile**: cosa sto comprando, quanto pago, spese di consegna, totale. Nessuna sorpresa
  all'ultimo passo (la sorpresa sul totale = abbandono).
- **Non perdere mai il carrello/i dati**: refresh, "indietro", sessione scaduta non devono azzerare. Persisti.
- **Il pagamento è il momento più fragile**: stato di loading chiarissimo, niente schermate ambigue tra "sto
  pagando" e "ho pagato", gestione esplicita del ritorno dal provider (3DS/redirect). Mai lasciare l'utente
  nel dubbio "ho pagato due volte?".

## D. Prevenire il doppio-submit e le race condition (oltre il checkout)
- **Ogni azione che muta dati** (invia ordine, salva, applica coupon, conferma) deve essere protetta: bottone
  disabilitato durante l'invio + flag `isSubmitting`. Vale per il venditore che salva un prodotto quanto per
  il cliente che paga.
- **Debounce** su ricerca/filtri (≈300ms) per non sparare una richiesta a ogni tasto; **cancella** la
  richiesta precedente (la risposta vecchia che arriva dopo la nuova = risultati sbagliati = race condition).
- **Disabilita durante il caricamento** i controlli che dipendono dal dato in arrivo (non far cliccare "Paga"
  finché il totale non è calcolato).

## E. Accessibilità = più clienti (anche over-60), non un extra
- A Piacenza una fetta grande dei clienti del centro ha **60+ anni**: vista stanca, mano meno precisa, poca
  dimestichezza. L'accessibilità qui **è fatturato**, non compliance.
- **HTML semantico prima di tutto**: `<button>` per le azioni (non un `<div onClick>`: il div non è
  raggiungibile da tastiera, non ha ruolo per screen reader, non si attiva con Invio/Spazio), `<a>` per la
  navigazione, `<label>` legato a ogni input, heading in ordine (`h1`→`h2`, non saltati).
- **Contrasto ≥ 4.5:1** per il testo (WCAG AA); per gli over-60 punta più in alto. **Mai il colore come unico
  segnale** (il rosso dell'errore va accompagnato da icona+testo: i daltonici e gli schermi al sole).
- **Tastiera completa**: tutto ciò che si fa col mouse si fa con Tab/Invio/Esc; **focus visibile** (non
  rimuovere l'outline senza sostituirlo); ordine di tabulazione logico; focus-trap nei modali.
- **Dimensioni leggibili**: corpo testo ≥16px (sotto, iOS zooma l'input e rompe il layout), niente testo
  grigio-chiaro su bianco "elegante" ma illeggibile; rispetta lo zoom del browser fino a 200%.
- **Screen reader & label**: icone-solo-icona hanno `aria-label`; immagini di prodotto hanno `alt` reale;
  gli stati (loading, errore) sono annunciati (`aria-live`) — un non vedente deve sapere che è successo.

## F. Performance PERCEPITA > performance reale (Core Web Vitals)
- L'utente giudica la **sensazione** di velocità. Le tre metriche che contano (Google CWV, anche per il SEO):
  - **LCP** (Largest Contentful Paint) ≤ **2.5s**: l'elemento principale (foto prodotto, hero) appare presto.
    → ottimizza/dimensiona le immagini (WebP/AVIF, `srcset`, `width`/`height` per evitare shift), priorità
    all'immagine above-the-fold, niente JS che blocca il primo render.
  - **INP** (Interaction to Next Paint) ≤ **200ms**: il tap risponde subito. → no lavoro pesante sul main
    thread durante l'interazione, feedback immediato (anche solo lo stato premuto).
  - **CLS** (Cumulative Layout Shift) ≤ **0.1**: niente salti (immagini senza dimensione, banner che spinge il
    bottone proprio mentre tappi → tappi la cosa sbagliata). Riserva sempre lo spazio.
- **Skeleton + lazy-load + ottimismo** comprano velocità percepita. **Code-split**: non spedire il JS del
  checkout sulla home. **Lazy** le immagini sotto la piega.
- **Misura, non indovinare**: Lighthouse / WebPageTest **su mobile con throttling** (4x CPU, 3G), non sul tuo
  MacBook in fibra. Il tuo dispositivo è il caso migliore, non quello reale.

## G. Architettura del componente (riusabile, testato, prevedibile)
- **Il componente fa UNA cosa**, props chiare, stato locale minimo; niente logica di business spalmata nella
  UI (i calcoli di prezzo/disponibilità vivono in un punto solo, non duplicati nei componenti).
- **Liste**: `key` **stabile e univoca** (l'id del dato, **mai l'indice** se la lista si riordina/filtra →
  bug di stato e di focus). Virtualizza le liste lunghe (catalogo).
- **Evita i ri-render inutili**: stato vicino a dove serve, memoizza il costoso, non far ri-renderizzare
  l'intera pagina per un contatore. Ma **non ottimizzare prima di misurare** (la memoizzazione prematura è
  debito).
- **Niente segreti nel client**: chiavi/secret stanno lato server (via @backend-dev/@security). Tutto ciò che
  è nel bundle è pubblico.

## H. L'aggancio MyCity (dove il sapere diventa il NOSTRO)
- Il cliente tipo: **sessantenne del centro di Piacenza, telefono non recente, rete lenta, al momento di
  pagare**. È il tuo *worst case di riferimento*: se il flusso è ovvio e veloce per lui/lei, lo è per tutti.
- Tre superfici, tre priorità: **scheda prodotto/catalogo** (desiderio + velocità di scoperta), **carrello/
  checkout** (zero attrito, zero doppio-submit — è il fatturato), **dashboard venditore/operativa** (chiarezza
  e affidabilità: il negoziante deve fidarsi dei numeri che vede). La domanda-ghigliottina di reparto:
  *«Dal telefono di un sessantenne con rete lenta, questo è ovvio e veloce — e cosa succede se fa doppio tap o
  la chiamata fallisce?»* Se non hai risposta, **non hai finito**.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — CHECKLIST DI UN COMPONENTE (prima di dire "fatto")
- [ ] **4 stati** coperti: loading (skeleton, no shift) · vuoto (spiega + via d'uscita) · errore (umano +
  Riprova + non perde i dati) · successo. Non solo il caso felice.
- [ ] **Responsive**: provato a **360px** (e degrada a 320px), poi tablet, poi desktop. Niente overflow,
  niente testo/bottoni sovrapposti, niente scroll orizzontale.
- [ ] **A11y**: elementi semantici (`<button>`/`<a>`/`<label>`), tastiera completa + focus visibile,
  contrasto ≥4.5:1, `alt`/`aria-label` dove serve, tap-target ≥44px, testo ≥16px.
- [ ] **Azioni protette**: ogni mutazione ha stato `isSubmitting` + bottone disabilitato (no doppio-submit).
- [ ] **Liste**: `key` stabile (id, non indice).
- [ ] **Performance**: immagini dimensionate (width/height, srcset, lazy sotto la piega), niente ri-render
  evidenti, niente lavoro pesante sul tap.
- [ ] **Test del pezzo** scritto (render dei 4 stati + l'interazione chiave).
- [ ] **Niente segreti** nel client.

## TOOL 2 — IL FLUSSO CHECKOUT PASSO-PASSO (il rito sacro)
1. **Carrello** → riepilogo chiaro (cosa, quantità modificabile, prezzo unitario, subtotale), CTA evidente,
   carrello **persistito** (sopravvive a refresh/indietro).
2. **Dati di consegna** → minimo indispensabile, precompilato, validazione `onBlur` con errore inline.
3. **Riepilogo totale prima di pagare** → prodotti + consegna + **totale finale senza sorprese**.
4. **Pagamento** → al tap: bottone **disabilitato + "Invio…"** immediatamente; **chiave di idempotenza** verso
   il server (coord. @backend-dev); gestione esplicita del redirect/3DS e del ritorno.
5. **Esito** → successo inequivocabile (numero ordine, conferma) **oppure** errore con recupero che **non**
   ricrea l'ordine e non perde i dati. Mai uno stato ambiguo "ho pagato?".
- Per OGNI passo chiediti: *posso toglierlo o precompilarlo?* · *cosa vede l'utente se la rete cade qui?* ·
  *un doppio tap qui cosa fa?*

## TOOL 3 — CHECKLIST PRE-MERGE UI (cancello prima della PR)
- [ ] **Branch** dedicato (mai `main`); **coordinato** con l'altra sessione (no file in comune → vedi Sapere
  collaborazione nel mansionario); diff piccola e leggibile.
- [ ] **Screenshot prima/dopo, mobile + desktop** allegati alla PR.
- [ ] **Lint + test verdi** in locale.
- [ ] **4 stati** verificati a video (anche errore e vuoto, non solo felice).
- [ ] **Lighthouse mobile** girato sulle pagine toccate (LCP/INP/CLS nei target) — **0 regressioni**.
- [ ] **Tastiera + screen reader** provati sul flusso toccato; contrasto verificato.
- [ ] **Nessun segreto** introdotto nel client; nessuna chiave hardcoded.
- [ ] **Nota di consegna**: cosa cambia a video, come testare, effetto atteso sul KPI.
- [ ] **Deploy/merge = 🔴**: PR pronta, **non** mergi tu. Aspetti la firma.

## TOOL 4 — PATTERN RESPONSIVE (la cassetta degli attrezzi)
- **Mobile-first nel CSS**: scrivi gli stili base per mobile, poi `min-width` per crescere (non il contrario).
- **Layout fluidi**: Flexbox/Grid + `gap`; `clamp()` per tipografia/spazi che scalano; `minmax()`/
  `auto-fit` per griglie che si riadattano senza media-query infinite.
- **Immagini**: `max-width:100%`, `height:auto`, `width`/`height` per riservare lo spazio (anti-CLS),
  `srcset`/`sizes` per servire il peso giusto al device.
- **Niente larghezze fisse in px** sui contenitori (rompono a 360px); usa %, `rem`, `fr`, `min/max-content`.
- **Breakpoint guidati dal contenuto**, non dai device specifici (aggiungi un breakpoint dove il layout
  *si rompe*, non a "768 perché iPad").
- **Tabelle/dashboard** su mobile: trasforma in card o scroll orizzontale controllato — mai una tabella che
  esplode fuori schermo.
- **Safe-area** (notch) e **thumb-zone**: azioni primarie in basso, rispetta `env(safe-area-inset-*)`.

## TOOL 5 — IL TEST SUL TELEFONO LENTO (la prova del nove)
Prima di consegnare qualsiasi cosa sul percorso d'acquisto, simula il cliente reale:
1. **DevTools → throttling**: CPU **4x slowdown** + rete **Slow 3G**. Niente fibra, niente Mac potente.
2. **Viewport 360px** (es. Galaxy/iPhone SE), poi prova **con la tastiera aperta** sugli input.
3. **Tab-through completo** (solo tastiera): arrivo in fondo? il focus si vede sempre? i modali intrappolano
   il focus e si chiudono con Esc?
4. **Stacca la rete a metà** di un'azione (carrello, pagamento): la UI mostra un errore umano e **recupera**,
   o si pianta/duplica?
5. **Doppio tap nervoso** sulla CTA d'acquisto: parte **un solo** ordine?
6. **Lighthouse mobile**: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1.
> Se un solo punto fallisce sul percorso d'acquisto, **non è fatto**. Su un device reale (non solo emulatore)
> quando il carburante "device reali" è disponibile.

## TOOL 6 — IL LOOP INTERNO (non consegni la prima versione)
1. **Brief in 1 riga**: quale schermata, per quale utente, quale azione/KPI muove, quale dato consuma.
2. **2-3 approcci** diversi alla UI/componente (non 3 ritocchi dello stesso).
3. **Criticali** contro: conversione · velocità (CWV) · accessibilità · responsive 360px · la Galleria sotto.
4. **Ghigliottina**: *«dal telefono del sessantenne con rete lenta è ovvio e veloce? e se fa doppio tap o la
   chiamata fallisce?»* → se non rispondi, butta e rifai.
5. **Tieni 1**, raffina: completa i 4 stati, scrivi il test, verifica responsive + a11y (Tool 1).
6. Solo ora **consegni**: branch, PR piccola, screenshot prima/dopo mobile+desktop, nota di consegna.

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10 — UI gold/spazzatura col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Estende la Galleria del mansionario.

## BOTTONE D'ACQUISTO / CTA
- ✅ **GOLD — "Ordina" che si disabilita all'invio + spinner + errore inline se la rete cade.** *Perché:*
  **previene il doppio ordine**, l'utente sa sempre cosa succede, l'errore è recuperabile senza perdere dati.
  *MyCity:* il bottone "Paga" del checkout, con chiave di idempotenza lato server.
- ❌ **SPAZZATURA — CTA sempre cliccabile, nessuno stato di invio.** *Perché muore:* doppio tap su 3G =
  doppio addebito = chargeback + cliente bruciato. Il bug più costoso del frontend.

## GRIGLIA PRODOTTI / CATALOGO
- ✅ **GOLD — griglia fluida `auto-fit/minmax`, immagini dimensionate (no CLS), skeleton in caricamento.**
  *Perché:* regge da 360px al desktop senza media-query infinite, niente salti, percezione di velocità.
- ❌ **SPAZZATURA — griglia pixel-perfect su desktop che a 360px sovrappone prezzo e bottone, senza loading.**
  *Perché muore:* **perde l'utente mobile** (la maggioranza) proprio mentre sta per comprare.

## STATI
- ✅ **GOLD — lista vuota che spiega e offre la via d'uscita** ("Nessun prodotto in questa categoria → vedi
  tutto il catalogo"). *Perché:* trasforma un vicolo cieco in un click verso la conversione.
- ❌ **SPAZZATURA — schermata bianca / spinner infinito / "Error 500" grezzo.** *Perché muore:* l'utente non
  sa se è rotto o se deve aspettare → se ne va. Mostrare solo il caso felice = metà componente.

## FORM / CHECKOUT
- ✅ **GOLD — errore inline accanto al campo, validazione `onBlur`, focus che ci salta, dati mai persi.**
  *Perché:* l'utente capisce *quale* campo e *perché*, corregge e prosegue.
- ❌ **SPAZZATURA — alert generico in cima ("Compila i campi"), validazione a ogni tasto, reset del form
  all'errore.** *Perché muore:* frustrazione massima = carrello abbandonato.

## ACCESSIBILITÀ
- ✅ **GOLD — `<button>` semantico, tap-target ≥44px, contrasto AA, focus visibile, `alt`/`aria-label`,
  testo ≥16px.** *Perché:* la signora del centro col telefono e la vista stanca **riesce a comprare**.
- ❌ **SPAZZATURA — `<div onClick>` per il "Paga", testo grigio-chiaro 13px, focus rimosso "per estetica".**
  *Perché muore:* fuori dalla tastiera e dallo screen reader = cliente escluso = ordine perso.

## PERFORMANCE
- ✅ **GOLD — foto prodotto WebP dimensionata + `srcset` + lazy sotto la piega, JS del checkout code-split.**
  *Perché:* LCP basso, niente CLS, la home non spedisce il bundle del checkout.
- ❌ **SPAZZATURA — PNG da 2MB senza width/height, tutto il JS in un bundle unico.** *Perché muore:* LCP e CLS
  sfondati su mobile = utente che scrolla via prima del render (e SEO penalizzato).

## 🏆 Pattern vincenti distillati
Mobile-first vero (360px first) · 4 stati sempre · CTA con stato di invio (anti doppio-submit) · semantica
HTML + tastiera + contrasto · immagini dimensionate (anti-CLS) · skeleton > spinner · componente che fa UNA
cosa · `key` stabile · misura su mobile throttled · branch+PR piccola con screenshot.
## 🚩 Red flags (uccidi a vista)
Solo il caso felice · non testato a 360px né throttled · doppio-submit possibile al checkout · `div`
cliccabile senza ruolo/tastiera · contrasto/tap-target insufficienti · `key`=indice · ri-render inutili ·
immagini senza dimensione (CLS) · `vh` che taglia la CTA su iOS · segreti nel client · PR enorme senza
screenshot · **merge/deploy fatto senza firma** (🔴).

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, e dove si innesta)
> Senza questo, il kit è un fuoriclasse a mani vuote: produce ottime *strutture* ma indovina il layout e la
> forma del dato. Ecco ESATTAMENTE cosa serve a Nicola/squadra e dove alza il tetto da 8 a 10:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Repo `mycity-live`** (accesso read/write in branch) | scrivere componenti, test, PR | Tutto · Tool 3 |
| **Mockup/spec** della schermata (04-Design/, 03-Funzionalità/) | costruire la UI giusta, non indovinarla | Tool 6 (brief), Galleria |
| **Design system** (palette/font/spaziature/componenti, `DESIGN.md`) | coerenza brand, riuso, no UI "a occhio" | Tool 1, Tool 4 |
| **Schema/forma reale del dato** (Supabase MCP, sola lettura) | la UI consuma il dato vero, gli stati giusti | Sapere B, G · Tool 6 |
| **URL dell'anteprima** (deploy di branch) | testare il flusso vero, non solo in locale | Tool 5, Tool 3 |
| **Device reali** (un Android lento, un iPhone) + breakpoint target | il test sul telefono lento è VERO, non emulato | Tool 5 (test del telefono lento) |
| **Chiave di idempotenza / contratto API** (@backend-dev) | checkout anti doppio-ordine end-to-end | Sapere C, D · Tool 2 |
| **Dati KPI** (conversione, abbandono, CWV reali — PostHog/Lighthouse CI) | misura + loop chiuso, sai se la UI ha convertito | mansionario "metro misurabile", strato 7 |

Finché manca, **NON inventare il layout né la forma del dato**: usa lo spec se c'è, altrimenti **fermati e
chiedi il carburante a Nicola** come leva che alza il livello. Le azioni reali restano nel loro colore:
**deploy/merge su main/release = 🔴** (firma). Coordinati sempre con l'altra sessione sul repo per non
creare conflitti.

---
*Manutenzione: questo kit è vivo. Ogni volta che una schermata va live e torna il dato reale (conversione,
abbandono, CWV), aggiorna la Galleria (nuovo gold/spazzatura col perché) e la memoria
`memoria-squadra/frontend-dev.md`. RIASSUMI/POTA mensile: resta denso e affilato.*
