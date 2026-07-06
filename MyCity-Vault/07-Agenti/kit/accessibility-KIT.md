---
tipo: kit-mestiere
ruolo: accessibility
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: accesso al codice/staging del marketplace + screen reader reali per il test manuale
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/
---

# 🧰 KIT MESTIERE — accessibility (il "cervello allenato" dell'accessibility engineer di un marketplace)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un accessibility
> engineer di un marketplace serio **sa e usa** (strati 3-6): i concetti WCAG/EAA operativi, gli strumenti
> passo-passo, la galleria di audit gold/spazzatura, e il carburante che serve. Il kit **aggiunge framework
> e rigore**, non ri-spiega l'ovvio. Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).
>
> ⚠️ **Confine sempre attivo:** questo kit ti rende bravo a **individuare la barriera e proporre il fix**.
> Il codice in produzione lo tocca sempre **@frontend-dev** (owner unico UI); la **lettura giuridica**
> dell'obbligo EAA e la pubblicazione ufficiale della Dichiarazione di Accessibilità restano di un
> **umano/@legale-privacy** — nessuno strato di questo kit ti autorizza a modificare `mycity-live` o a
> certificare da solo una conformità legale.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. I 4 principi POUR (le fondamenta delle WCAG)
Ogni criterio WCAG si incasella in uno di questi quattro pilastri — usali per classificare, non solo per citarli:
1. **Percepibile** — l'informazione e i componenti dell'interfaccia devono essere percepibili in almeno un
   modo per ogni utente: testo alternativo per le immagini, contrasto sufficiente, contenuto non affidato
   al solo colore ("clicca sul pulsante verde" esclude chi non distingue i colori).
2. **Operabile** — ogni funzione deve essere azionabile senza mouse: navigazione da tastiera completa,
   niente trappole di focus, tempo sufficiente per completare un'azione (carrello/sessione).
3. **Comprensibile** — testo leggibile, comportamento prevedibile (un form non cambia pagina da solo),
   errori spiegati in modo chiaro con un modo per correggerli.
4. **Robusto** — il markup è valido e interpretabile correttamente dalle tecnologie assistive presenti e
   future (screen reader, tastiere alternative, ingranditori) — qui vive quasi tutto ciò che riguarda ARIA.

## B. Livelli di conformità e obbligo normativo (cosa impone davvero la legge)
- **A / AA / AAA**: tre livelli crescenti di rigore WCAG. **AA è il riferimento pratico universale** — è il
  livello che cita l'**EN 301 549** (lo standard tecnico europeo per l'accessibilità ICT) ed è la soglia
  richiesta dall'**European Accessibility Act**. AAA è desiderabile ma non è l'obiettivo minimo legale.
- **European Accessibility Act (Direttiva UE 2019/882)**: recepita in Italia con **D.Lgs. 82/2022**.
  Impone requisiti di accessibilità a una lista di prodotti/servizi digitali, tra cui il **commercio
  elettronico (e-commerce) B2C** — categoria in cui rientra un marketplace come MyCity. Gli obblighi per i
  nuovi servizi digitali B2C sono **applicabili dal 28 giugno 2025**. **Riconferma sempre** con WebSearch il
  testo aggiornato e le eventuali micro-imprese esentate prima di una decisione importante: non è un dato
  da citare a memoria, cambia con gli aggiornamenti normativi.
- **Chi fa cosa**: tu presidi il **campo tecnico** (WCAG/EN 301 549, test reali, remediation). La **lettura
  giuridica** (rischio di sanzione, testo esatto della Dichiarazione di Accessibilità da pubblicare,
  gestione di un reclamo formale) è di **@legale-privacy**. Nessuno dei due sostituisce l'altro.

## C. Le soglie tecniche che contano davvero (i numeri che un fuoriclasse ha in testa)
- **Contrasto testo**: rapporto **4,5:1** minimo per testo normale, **3:1** per testo grande (≥18pt o
  ≥14pt bold) e per componenti UI/elementi grafici (WCAG 1.4.3 / 1.4.11). Misurato, non "a occhio".
- **Target touch (WCAG 2.2, criterio 2.5.8)**: area minima cliccabile **24×24px** (con eccezioni), utile
  soprattutto su mobile dove il marketplace ha gran parte del traffico.
- **Focus visibile (2.4.7/2.4.11)**: ogni elemento interattivo deve mostrare un indicatore di focus chiaro
  quando navigato da tastiera. `outline: none` senza sostituto è una violazione, non uno stile pulito.
- **Nessuna trappola di focus (2.1.2)**: un modal/dropdown deve poter essere chiuso e il focus deve poter
  uscirne (di solito con **Esc**) — mai un utente "intrappolato" in un componente.
- **Timeout regolabile (2.2.1)**: se il carrello/la sessione scadono, l'utente deve poter estendere il
  tempo prima della scadenza — rilevante per chi impiega più tempo a compilare un form.
- **Ordine di lettura logico**: l'ordine di tabulazione (`tabindex`) e l'ordine del DOM devono corrispondere
  all'ordine visivo/logico — un ordine sparso confonde sia tastiera che screen reader.

## D. Tastiera e screen reader: come si testano DAVVERO (non a memoria)
- **Test da sola tastiera**: naviga l'intero flusso con **Tab** (avanti), **Shift+Tab** (indietro),
  **Invio/Spazio** (attiva), **Esc** (chiudi/annulla), **frecce** (dentro menu/select). Chiediti ad ogni
  passo: vedo dove sono? posso raggiungere OGNI azione? posso uscire da ogni componente?
  Il tab attraversa la pagina.
- **Test con screen reader reale**: NVDA (Windows, gratuito) o VoiceOver (Mac/iOS, integrato) o TalkBack
  (Android, integrato) sono i tre di riferimento. Ascolta cosa viene **annunciato** per ogni elemento:
  nome (cosa è), ruolo (bottone/link/campo), stato (premuto/espanso/selezionato) — il trio **Nome-Ruolo-Stato**
  (WCAG 4.1.2) è il test che smaschera i `<div>` travestiti da controlli interattivi.
- **Ordine di lettura**: lo screen reader legge nell'ordine del DOM, non nell'ordine visivo CSS — un layout
  con `order`/`float` che sposta visivamente un elemento può farlo leggere fuori sequenza.

## E. ARIA: quando serve, quando NON serve
- **Regola d'oro: "niente ARIA è meglio di ARIA sbagliata".** Un `<button>` nativo ha già focus, tastiera,
  ruolo e stato gratis. Un `<div role="button">` richiede che TU implementi manualmente tutto il resto
  (tabindex, keydown per Invio/Spazio, aria-pressed se serve) — e quasi sempre qualcosa si dimentica.
- **Landmark roles** (`<nav>`, `<main>`, `<header>`, `<footer>` o `role="navigation"` ecc.) aiutano chi usa
  screen reader a **saltare direttamente** alle sezioni (es. saltare il menu e andare al contenuto).
- **Live regions** (`aria-live="polite"`/`"assertive"`) servono per annunciare cambi di stato dinamici senza
  refresh di pagina — es. "3 articoli nel carrello" dopo un click, o un messaggio di errore che appare senza
  che la pagina cambi visivamente in modo evidente.
- **`aria-label`/`aria-labelledby`** quando manca un testo visibile (es. un'icona-bottone "cerca" senza
  testo): danno un nome accessibile senza aggiungere testo visivo.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Checklist rapida per flusso critico (percorso di acquisto end-to-end)
> Compila per ogni flusso: home → ricerca → scheda prodotto → carrello → checkout → login/registrazione.
```
FLUSSO: [____]                          PAGINA/COMPONENTE: [____]
[ ] Raggiungibile e completabile SOLO con tastiera (Tab/Invio/Spazio/Esc)?
[ ] Screen reader annuncia nome-ruolo-stato corretti per ogni controllo?
[ ] Contrasto testo/UI ≥ soglia (4,5:1 / 3:1), misurato non stimato?
[ ] Ogni immagine informativa ha alt-text; le decorative hanno alt="" o sono ignorate?
[ ] Ogni campo form ha una <label> associata (non solo placeholder)?
[ ] Nessun focus trap: ogni modal/dropdown si chiude e restituisce il focus?
[ ] Ordine di tabulazione = ordine logico/visivo?
─────────────────────────────────────
VIOLAZIONI TROVATE: [____]   SEVERITÀ MAX: [critica/media/bassa]   OWNER: [frontend-dev/ux-designer]
```

## TOOL 2 — Procedura di TEST MANUALE (in due passate, sempre in quest'ordine)
1. **Passata 1 — solo tastiera**: stacca il mouse, percorri l'intero flusso con Tab/Shift+Tab/Invio/
   Spazio/Esc/frecce. Segna ogni punto dove ti "perdi" (focus invisibile, elemento non raggiungibile, nessuna
   via d'uscita da un componente).
2. **Passata 2 — screen reader** (NVDA/VoiceOver/TalkBack, con schermo spento se possibile): ripercorri lo
   stesso flusso ad orecchio. Segna ogni annuncio sbagliato/mancante/ambiguo (nome-ruolo-stato).
3. **Passata 3 — automatico** (axe-core/Lighthouse): usalo per confermare/completare, MAI come sostituto
   delle prime due — coglie markup rotto, non l'esperienza reale.
4. **Confronta le tre passate**: se lo scanner è pulito ma tastiera/screen reader trovano un blocco, **vince
   il test reale**: è quello che userebbe davvero un cliente.

## TOOL 3 — Misurare il contrasto (passo-passo)
1. Prendi colore testo e colore sfondo effettivi (non quelli "dichiarati" nel design system: quelli
   effettivamente renderizzati, incluse eventuali trasparenze/overlay).
2. Calcola il rapporto di contrasto (strumento devtools del browser o calcolatore contrasto WCAG).
3. Confronta con la soglia in base a dimensione/peso del testo (Sapere C).
4. Se sotto soglia: non proporre "un colore leggermente più scuro" a intuito — proponi il valore esatto
   che supera la soglia, testato.

## TOOL 4 — Modulo SEGNALAZIONE VIOLAZIONE (audit-trail, per ogni caso)
```
DATA: [____]        PAGINA/FLUSSO: [____]        ELEMENTO: [____]
CRITERIO WCAG VIOLATO: [numero + nome, es. 2.1.1 Keyboard]     PRINCIPIO POUR: [____]
METODO DI TEST: [tastiera / screen reader / scanner / tutti e tre]
IMPATTO UTENTE REALE: [____] (chi resta escluso e da cosa, in concreto)
SEVERITÀ: [CRITICA (blocca il percorso d'acquisto) / MEDIA / BASSA]
FIX PROPOSTO: [snippet/testo esatto]              OWNER: [frontend-dev / ux-designer]
STATO: [aperta / in remediation / verificata chiusa]
```

## TOOL 5 — Snippet di fix comuni (pronti da passare a @frontend-dev)
- **Bottone accessibile**: preferisci sempre `<button type="button">…</button>` a un `<div onclick>`. Se
  proprio serve un `<div>` interattivo: `role="button" tabindex="0"` + handler che intercetta `Enter`/`Space`.
- **Label associata**: `<label for="email">Email</label><input id="email" type="email">` — mai solo
  `placeholder="Email"` (sparisce alla digitazione e molti screen reader non lo trattano come label).
- **Immagine informativa**: `<img src="…" alt="Descrizione breve e concreta del contenuto">`. Decorativa:
  `alt=""` (mai ometterlo del tutto: senza `alt`, alcuni screen reader leggono il nome del file).
- **Focus visibile**: se rimuovi l'outline di default, **sostituiscilo sempre** con uno stile di focus
  chiaramente visibile (es. `:focus-visible { outline: 2px solid …; outline-offset: 2px; }`).
- **Skip link**: un link nascosto-fino-al-focus in cima alla pagina (`Salta al contenuto`) che porta dritto
  al `<main>`, per chi naviga da tastiera ed evita di ripassare il menu ad ogni pagina.

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande, prima di ogni valutazione)
1. È raggiungibile **solo da tastiera**? 2. Lo **screen reader** annuncia nome-ruolo-stato corretti?
3. Il **contrasto** misurato regge la soglia? 4. È sul **percorso critico** d'acquisto o su una pagina
secondaria? 5. Posso verificarlo sul **codice/staging reale**, o mi manca l'accesso? Se una risposta manca
→ è un gap da segnalare o un accesso da procurare, mai da presumere positivo.

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre/nomi tra `[…]` = segnaposto,
> non dati MyCity reali finché non confermati sul codice vero.

## COMPONENTE INTERATTIVO NON ACCESSIBILE
- ✅ **GOLD:** *"Scheda prodotto [pane di Piacenza, negozio '[____]']: il bottone 'Aggiungi al carrello' è
  un `<div onclick>` senza `role`/`tabindex` → non raggiungibile da tastiera, screen reader lo legge come
  testo semplice, non come controllo (WCAG 2.1.1 + 4.1.2). Percorso critico, severità CRITICA: blocca
  l'acquisto per chi naviga senza mouse su OGNI negozio, non solo questo. Fix: `<button type=\"button\">`
  nativo con lo stesso stile CSS attuale. 🟡 pronto per @frontend-dev, diff allegato, testato dopo il fix
  con tastiera e NVDA."* — **Perché:** criterio citato, impatto trasversale riconosciuto, fix minimo e
  reversibile, verifica post-fix dichiarata.
- ❌ **SPAZZATURA:** *"Il pulsante del carrello sembra ok, l'ho visto sullo schermo."* — **Perché muore:**
  "sembra ok" da guardare non prova nulla su tastiera/screen reader, nessun criterio, nessun test reale.

## CONTRASTO E LEGGIBILITÀ
- ✅ **GOLD:** *"Prezzo prodotto su sfondo promozionale: testo grigio `#999` su sfondo `#f2f2f2` → contrasto
  misurato 1,6:1, ben sotto la soglia 4,5:1 (WCAG 1.4.3). Un utente ipovedente non distingue il prezzo.
  Fix: testo `#595959` su stesso sfondo → contrasto 4,6:1, verificato con calcolatore. Impatto: componente
  usato su ogni scheda prodotto del catalogo, non un caso isolato."* — **Perché:** misurato non stimato,
  soglia citata, fix con nuovo valore verificato, impatto di scala riconosciuto.
- ❌ **SPAZZATURA:** *"Il grigio chiaro sul prezzo è un po' tenue ma si legge, non credo serva cambiarlo."*
  — **Perché muore:** nessuna misura, "credo/si legge" al posto di un rapporto di contrasto reale.

## FOCUS TRAP E NAVIGAZIONE DA TASTIERA
- ✅ **GOLD:** *"Modal 'Filtra per categoria' (ricerca): una volta aperto, Tab continua a ciclare dentro il
  modal (corretto) ma **Esc non lo chiude** e non c'è un bottone di chiusura raggiungibile da tastiera →
  focus trap reale, l'utente resta bloccato dentro (WCAG 2.1.2). Severità CRITICA: impedisce di completare
  la ricerca per chi naviga a tastiera. Fix: handler `keydown` per Esc che chiude il modal e restituisce il
  focus al bottone che l'ha aperto. 🟡 pronto per @frontend-dev."* — **Perché:** trappola reale identificata
  con il criterio esatto, conseguenza concreta (utente bloccato), fix puntuale.
- ❌ **SPAZZATURA:** *"Il filtro funziona, l'ho aperto e chiuso col mouse senza problemi."* — **Perché
  muore:** testato solo col mouse, non prova nulla sulla navigazione da tastiera reale.

## 🏆 Pattern vincenti (regole trasversali)
Criterio WCAG citato per numero su ogni violazione · doppio test sempre (tastiera+screen reader) prima
dello scanner · contrasto misurato mai stimato · severità legata all'impatto sul percorso d'acquisto, non
all'estetica · fix minimo, reversibile, pronto da eseguire · impatto trasversale riconosciuto quando il
componente è riusato su più pagine/negozi · confine netto: tu proponi il fix tecnico, la validazione
giuridica/pubblicazione ufficiale resta umana/@legale-privacy.

## 🚩 Red flags (uccidi a vista)
"Sembra accessibile" guardando lo schermo · scanner automatico come unica prova · contrasto "a occhio" ·
`outline: none` senza sostituto · placeholder al posto della label · modal senza via d'uscita da tastiera ·
alt-text assente su immagini informative o presente su quelle decorative · un tuo audit spacciato per
certificazione legale di conformità EAA · Dichiarazione di Accessibilità copiata senza audit reale dietro ·
violazione trattata come "caso isolato" quando il componente è riusato ovunque nel catalogo.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per quando arriva)
> Senza questo il kit è un accessibility engineer a mani vuote: ottime *strutture*, ma con segnaposto. Un
> giudizio di conformità su screenshot statici o "a memoria" è **peggio** di nessun audit. Ecco esattamente
> cosa serve:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Accesso al codice/staging reale del marketplace** (`MARKETPLACE_REPO`, sola lettura) | audit sul markup vero, non su screenshot | Tool 1, Tool 2, Galleria |
| **Strumento di scansione** (axe-core/Lighthouse/browser devtools) | prima passata automatica, misurare il contrasto | Tool 2, Tool 3 |
| **Screen reader reale** (NVDA/VoiceOver/TalkBack) | il test manuale che conta davvero (Nome-Ruolo-Stato) | Tool 2, Sapere D |
| **Segnalazioni reali da @supporto** su clienti in difficoltà con tastiera/lettore | priorità basata su impatto reale, non teorico | Tool 4, Galleria |
| **Handoff da @frontend-dev** su cosa è realmente in produzione (`mycity-live`) vs bozza | non auditare componenti che nessun cliente vede ancora | Tool 1 |
| **Bozza esistente della Dichiarazione di Accessibilità** (se c'è) | verificarla contro un audit reale prima che venga pubblicata | Sapere B |
| **Norme WCAG 2.2/EN 301 549/EAA riconfermate** (WebSearch) | tenere soglie e scadenze aggiornate e difendibili | Sapere B, Sapere C |

**Confine 🔴 invalicabile:** ogni pubblicazione ufficiale (Dichiarazione di Accessibilità, dichiarazione
pubblica di conformità EAA, risposta a un reclamo/ispezione formale) **si propone e si accoda**, non si
pubblica mai da qui. Read/audit ≠ certificazione legale. Finché manca l'accesso reale al codice/staging,
dichiaralo come "carburante mancante": non chiudere un audit di accessibilità che non poggia su un test vero.

---
*Manutenzione: kit vivo. Dopo ogni audit importante o cambio normativo EAA/WCAG, aggiorna la Galleria (nuovo
caso gold/spazzatura col perché) e scrivi l'esito in `memoria-squadra/accessibility.md`. RIASSUMI/POTA
mensile: resta denso e affilato.*
