---
tipo: kit-mestiere
ruolo: ux-designer
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-06-27 · carburante reale atteso (funnel Supabase + sessioni utente)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · mycity-live/design-system · 03-Clienti/Clienti, Personas & Crescita.md
---

# 🧰 KIT MESTIERE — ux-designer (il "cervello allenato" del fuoriclasse)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un pro **sa e usa**
> (strati 3-6): il sapere, gli strumenti passo-passo, la galleria di esempi, e il carburante che serve.
> Leggilo come la tua testa da 15 anni di mestiere su e-commerce e servizi per non-nativi-digitali.
> Bersaglio: **L7-con-giudizio** (vedi [[RUBRICA-LIVELLI]]) — non abbellisci la schermata, fai sparire lo step.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Jobs-To-Be-Done — parti dal compito, non dalla schermata
- **La gente non "vuole una pagina prodotto": vuole la spesa a casa stasera.** Il JTBD è il *progresso* che
  l'utente cerca ("non devo uscire col freddo", "do una mano alla bottega sotto casa", "regalo una spesa a
  mia madre"). L'UI è solo il mezzo. Se non sai qual è il progresso, non disegnare.
- **I 3 JTBD core di MyCity** (dal pubblico vero di Piacenza): ① *l'anziano/caregiver* → "ricevo la spesa
  dalle botteghe di fiducia senza muovermi, e mi fido"; ② *il cliente civico* → "ordino online MA tengo vivo
  il centro" (identità, non solo comodità); ③ *il negoziante* → "metto online la mia bottega senza essere un
  tecnico e senza perdere mezza giornata". Ogni flusso serve UNO di questi job; se ne serve due, ne serve zero.
- **Le 3 forze del JTBD (Christensen):** spinta del problema + attrazione della soluzione DEVONO battere
  *ansia del nuovo* + *abitudine al vecchio*. Sul nostro pubblico over-60 l'ansia è altissima ("e se sbaglio
  il pagamento?", "e se non arriva?"): il design vince **abbassando l'ansia** (rassicurazione, COD, "ti
  chiamiamo se serve"), non aggiungendo persuasione.
- **Il "lavoro emotivo e sociale" conta quanto quello funzionale:** l'anziano non vuole solo la merce, vuole
  *non sentirsi stupido* e *non disturbare il nipote*. Una schermata che lo fa sentire capace ha già vinto.

## B. Ogni step dimezza — la matematica del funnel
- **Legge del funnel moltiplicativo:** la conversione totale è il *prodotto* dei tassi di ogni passo. 5 passi
  al 80% l'uno = 0,8⁵ = **33%**. Togliere un passo non somma, *moltiplica*. La domanda non è mai "cosa
  aggiungo" ma **"cosa tolgo"**. Ogni campo, tap, schermata, scelta, conferma è una perdita composta.
- **Legge di Hick:** il tempo di decisione cresce col numero di opzioni. Meno scelte = decisione più veloce =
  meno abbandono. Un'unica azione primaria per schermata; il resto è secondario e visivamente sotto.
- **Costo di ogni campo form:** ogni campo obbligatorio in un checkout abbatte la conversione. Regola: un
  campo esiste solo se **è impossibile completare il job senza**. Nome+indirizzo+telefono+modo di pagamento è
  quasi tutto il necessario per MyCity. Email obbligatoria? Solo se serve davvero (per l'anziano è frizione).
- **Default > input:** ogni cosa che puoi *pre-compilare, ricordare o indovinare* è uno step tolto (indirizzo
  salvato, slot di consegna suggerito, metodo di pagamento ricordato, COD come default se è il più usato).
- **La regressione (back/correggi) è un costo nascosto:** se l'utente deve tornare indietro per correggere,
  hai perso. Validazione *inline e gentile*, non una schermata d'errore alla fine.

## C. Carico cognitivo — "Don't make me think"
- **3 tipi di carico** (Sweller): *intrinseco* (la difficoltà reale del compito — riducila spezzando), *estraneo*
  (causato da UI confusa — **eliminalo**, è colpa del design), *germano* (lo sforzo utile di capire). Quasi
  tutta la frizione di un e-commerce è carico *estraneo*: gergo, layout ambiguo, troppe scelte, stati poco chiari.
- **Riconoscere > ricordare:** non far ricordare nulla tra una schermata e l'altra. Mostra il riepilogo
  carrello al checkout, l'indirizzo già scelto, cosa sta comprando. La memoria di lavoro umana tiene ~4 cose.
- **Una sola azione primaria per schermata.** Se ci sono due bottoni "importanti" uguali, l'utente si ferma.
  Gerarchia visiva spietata: 1 azione primaria piena, le secondarie in outline/testo.
- **Progressive disclosure:** mostra solo ciò che serve *adesso*; nascondi l'avanzato dietro "altre opzioni".
  L'onboarding negoziante non chiede tutto subito: il minimo per andare live, il resto dopo.
- **Legge di Miller / chunking:** spezza i form lunghi in blocchi etichettati (Contatti · Consegna · Pagamento),
  con barra di avanzamento se sono >1 schermata. Il cervello gestisce 3 blocchi, non 12 campi sciolti.

## D. Dove cade la frizione (misurata, non indovinata)
- **Non si redesigna a sensazione: si guarda dove cade la gente.** Il punto di abbandono reale (funnel
  Supabase/PostHog: viste → add-to-cart → checkout iniziato → indirizzo → pagamento → ordine) ti dice DOVE
  disegnare. Un drop verticale tra due step = lì c'è la frizione. Disegna lì, non dove "ti sembra brutto".
- **I punti di frizione classici dell'e-commerce (in ordine di danno):** (1) *costi a sorpresa* (consegna che
  appare solo alla fine = causa nº1 di abbandono carrello al mondo); (2) *obbligo di registrazione* prima di
  comprare (→ guest checkout); (3) *form troppo lungo/ripetitivo*; (4) *poche opzioni di pagamento* (per
  Piacenza: **COD è oro**, l'anziano si fida del contante); (5) *fiducia assente* (nessun segnale "è sicuro,
  arriva, posso annullare"); (6) *errori che buttano via i dati inseriti*; (7) *attese senza feedback* (spinner muto).
- **Frizione ≠ sempre layout.** Spesso la fix più alta è *un copy*, *un default*, *un costo mostrato prima*, o
  *un bug*. Prima di rifare la pagina, chiediti: «la frizione vera è qui o altrove?». (Giudizio: vedi mansionario.)
- **Micro-frizioni che sommano:** tap target piccoli, testo grigio chiaro, label che spariscono, tastiera
  sbagliata (campo telefono che apre la tastiera alfabetica), zoom forzato, autofill che non funziona.

## E. Accessibilità — per l'over-60 è IL prodotto, non un extra
- **Il nostro utente medio ha 60-80 anni, vista che cala, dito incerto, fiducia bassa, telefono datato.** Non
  è un caso-limite: è il caso *principale*. Progetta per lui e funziona per tutti.
- **Regole non negoziabili:** tap target **≥44×44px** (meglio 48); contrasto testo **≥4.5:1** (WCAG AA),
  meglio 7:1 per i corpi; corpo testo **≥16px** (mai font sotto, mai grigio chiaro su bianco); label *sempre
  visibili* (mai solo placeholder che sparisce); tastiera giusta per tipo campo (numerica per telefono/CAP);
  niente azioni solo-hover (non esistono su mobile); errori in testo + colore (non solo colore — daltonici).
- **Linguaggio:** zero gergo, zero inglese inutile ("checkout" → "vai al pagamento" / "conferma ordine"),
  microcopy che parla come una persona gentile, non come un'azienda. Dialetto-tollerante nella ricerca.
- **Rassicurazione esplicita:** l'anziano ha paura di sbagliare. "Puoi pagare alla consegna", "Se qualcosa non
  va ti chiamiamo", "Nessun pagamento finché non confermi" — la fiducia è parte dell'accessibilità emotiva.
- **Tolleranza all'errore:** salva-bozza, conferma prima di azioni distruttive, "annulla" sempre possibile,
  campi che non si svuotano dopo un errore. L'utente non deve aver paura di toccare.

## F. Mobile-first vero — progetta per il caso peggiore
- **Mobile-first NON è "il desktop rimpicciolito":** è progettare per *pollice + schermo piccolo + rete che
  cade + una mano sola in piedi al freddo*. Il desktop è il caso facile, vienc dopo.
- **Zona del pollice:** le azioni primarie stanno **in basso**, raggiungibili col pollice (CTA fissa
  bottom su checkout). La roba in alto è difficile da toccare su telefoni grandi.
- **Performance percepita = UX:** su rete lenta, *feedback immediato* (skeleton, ottimismo UI, spinner con
  testo "sto confermando…") batte la velocità reale. Mai schermata bianca muta. Il peso della pagina è UX.
- **PWA:** funziona offline-tollerante, si installa, niente app-store-friction. Sfrutta il "aggiungi a Home".
- **Test sul dispositivo vero, non sul tuo monitor:** schermo da 5", luce del sole, dito non preciso, 3G.

## G. Le euristiche di usabilità (Nielsen — il tuo riflesso diagnostico, 10 punti)
1. **Visibilità dello stato del sistema** — l'utente sa sempre cosa sta succedendo (caricamento, conferma, "ordine ricevuto").
2. **Match col mondo reale** — parole e concetti dell'utente ("la tua spesa", "il fattorino"), non gergo di sistema.
3. **Controllo e libertà** — uscita di sicurezza, annulla, indietro senza perdere dati.
4. **Coerenza e standard** — stesso pattern per la stessa azione ovunque (un solo modo di aggiungere al carrello).
5. **Prevenzione dell'errore** — meglio impedire l'errore (validazione inline, default) che gestirlo dopo.
6. **Riconoscere > ricordare** — mostra le opzioni, non far ricordare; riepiloghi sempre visibili.
7. **Flessibilità ed efficienza** — scorciatoie per i ricorrenti (riordina-uguale, indirizzo salvato) senza confondere i nuovi.
8. **Estetica e design minimalista** — ogni elemento in più compete per l'attenzione; togli il rumore.
9. **Aiuto a riconoscere/recuperare dagli errori** — messaggi in lingua umana: cosa è successo + come si risolve.
10. **Aiuto e documentazione** — se serve un manuale per ordinare, il design ha fallito; ma il supporto (telefono) sia visibile.
> Usa queste 10 come **lista di passaggio dell'audit**: ogni schermata violata = un difetto con gravità.

## H. L'aggancio MyCity (dove il sapere diventa il NOSTRO)
Il metro non è "il flusso è bello": è **l'anziano di Piacenza completa l'ordine da solo, al primo tentativo,
col pollice tremante e una connessione lenta**. Ogni frizione è un cliente perso e una *colpa del design*,
mai dell'utente. Il sistema è: *abbassa l'ansia (COD, rassicurazione, telefono visibile) + togli ogni step
non vitale + un'azione per schermata + accessibilità over-60 come base*. Domanda-ghigliottina su ogni flusso:
**«L'anziano di Piacenza ci arriva da solo, al primo colpo?»** — se no, semplifica ancora.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Metodo USER FLOW + WIREFRAME (dal job al disegno)
1. **Scrivi il JTBD in 1 riga:** "Come [persona], voglio [progresso], così [beneficio]." (es. "Come anziano, voglio ricevere la spesa da Garetti senza uscire, così non disturbo mia figlia.")
2. **Mappa il flusso ATTUALE** step-by-step leggendo il codice vero (`mycity-live`): ogni schermata, ogni campo, ogni tap, ogni decisione. Numerali.
3. **Marca ogni frizione** sul flusso: ✋ step removibile · ⚠️ scelta inutile · 🐛 bug · 💬 copy da-azienda · 💸 costo a sorpresa · ♿ problema accessibilità.
4. **Conta gli step** e stima la perdita composta (Sapere B): "6 step → ~stima conversione".
5. **Disegna il wireframe** low/mid-fidelity (SVG/markdown/ASCII in `consegne/`): 1 azione primaria per schermata, default precompilati, stati di errore/vuoto/caricamento DISEGNATI (non solo l'happy path).
6. **Annota su ogni schermata:** azione primaria, cosa è precompilato, microcopy chiave, tap target, cosa succede se la rete cade.
> Un wireframe senza stati di errore/vuoto/caricamento è mezzo lavoro. Il caso-limite è il lavoro.

## TOOL 2 — Il LOOP INTERNO (NON consegni il primo wireframe)
1. [ ] **Flusso attuale mappato** + frizioni marcate (Tool 1) + il dato di dove cade (Tool 4 / carburante).
2. [ ] **Genera ≥2-3 flussi alternativi** — non 3 skin dello stesso: 3 *modi diversi di togliere lo step* (es. ① guest checkout · ② form unico one-page · ③ riordino-in-2-tap per i ricorrenti).
3. [ ] **Ghigliottina** su ciascuno: *«L'anziano ci arriva da solo, al primo colpo?»* → se no, **kill** o semplifica.
4. [ ] **Tieni quello che rimuove più frizione al minor costo di build** (frizione-tolta ÷ sforzo-frontend). Butta gli altri, annota *perché* (va in memoria).
5. [ ] **Assorbi** la forza migliore degli scartati nel vincente.
6. [ ] **Raffina in 3 round:** R1 togli step/campi → R2 default + microcopy umano → R3 stati errore/vuoto/caricamento + caso-limite (rete persa, campo vuoto, prodotto finito).
7. [ ] Solo ora **QA usabilità** (Tool 3) e consegna: dichiara quale flusso hai scelto, quale frizione *misurata* elimina, effetto atteso sul KPI.

## TOOL 3 — CHECKLIST ANTI-FRIZIONE per SCHERMATA (una ❌ = non è pronta)
- [ ] **Una sola azione primaria** chiara, in basso (zona pollice), tap ≥44px, gerarchia spietata.
- [ ] **Carico cognitivo minimo:** ≤ poche scelte, niente gergo, riepilogo visibile (riconoscere > ricordare).
- [ ] **Campi:** ognuno è indispensabile? precompilato dove possibile? label visibile? tastiera giusta? validazione inline gentile?
- [ ] **Costi/condizioni mostrati PRIMA**, mai a sorpresa alla fine (consegna, minimo d'ordine, slot).
- [ ] **Stati progettati:** vuoto (cosa fare ora) · caricamento (feedback con testo) · errore (lingua umana: cosa+come) · successo (conferma rassicurante).
- [ ] **Accessibilità over-60:** contrasto ≥4.5:1, testo ≥16px, niente solo-hover, errori non solo-colore.
- [ ] **Rassicurazione:** dove c'è ansia (pagamento), c'è una frase che la abbassa (COD, "ti chiamiamo", "nessun addebito ora").
- [ ] **Mobile vero:** funziona a 320px, su rete lenta, con una mano. CTA non coperta dalla tastiera.
- [ ] **Coerenza:** stesso pattern della stessa azione altrove nel sito (design system rispettata).

## TOOL 4 — AUDIT DI USABILITÀ (il metodo, gravità-ordinato)
1. **Scegli il flusso a impatto** (prima il flusso-soldi: checkout > carrello > scheda prodotto > onboarding negoziante).
2. **Percorrilo da utente reale** (persona scelta) sul codice/preview, schermata per schermata.
3. **Passa le 10 euristiche di Nielsen** (Sapere G) su ogni schermata + la checklist Tool 3.
4. **Classifica ogni difetto per gravità** (scala Nielsen 0-4): 0 non-problema · 1 cosmetico · 2 minore · 3 maggiore (blocca molti) · 4 catastrofico (blocca l'ordine/perde dati). Ordina per gravità × frequenza.
5. **Per ogni difetto:** schermata · cosa succede all'utente reale · euristica violata · gravità · fix proposta · effetto atteso · colore 🟢🟡🔴 · confidenza (visto nel dato vs supposto).
6. **Verifica avversariale:** prova a refutare ogni problema ("è davvero un problema o è il mio gusto? l'over-60 davvero ci cade?"). Tieni solo i veri.
7. **Consegna** in `consegne/design/` o `consegne/audit/`, bloccanti in cima. (Workflow profondo: `.claude/workflows/audit-design.js`.)

## TOOL 5 — TEST SUI 5 UTENTI (il metodo, low-cost, alto rendimento)
- **Perché 5:** ~5 utenti scoprono ~85% dei problemi di usabilità (Nielsen). Oltre, rendimento calante. Meglio 5 utenti × 3 round che 15 in un colpo.
- **Chi:** utenti *veri del target* (un anziano di Piacenza, un caregiver, un negoziante) — NON colleghi, NON nativi-digitali se il target non lo è.
- **Come (think-aloud):** dai un **compito reale** ("ordina una spesa da Garetti e fattela consegnare giovedì"), NON istruzioni passo-passo. Stai zitto. Annota *dove esita, dove sbaglia, dove si ferma, cosa dice ad alta voce*. La frustrazione è il dato.
- **Cosa misuri:** completa il task da solo? (sì/no) · tempo · numero di esitazioni/errori · dove si è bloccato · cosa diceva.
- **Regola d'oro:** se devi *aiutarlo*, hai trovato un difetto del design — non un utente lento. Scrivilo.
- **Output:** lista difetti per gravità + clip/note → alimenta Tool 4 e il loop Tool 2. (Se non hai utenti veri: è carburante da chiedere a Nicola, vedi Strato 6.)

## TOOL 6 — MAPPA DEL PERCORSO (checkout / onboarding) — journey + emozione
- **Disegna la journey end-to-end** a fasi, e per ogni fase 4 righe: *AZIONE* (cosa fa) · *PENSIERO* (cosa si chiede) · *EMOZIONE* (curva: 😟 ansia → 🙂 sollievo) · *FRIZIONE/OPPORTUNITÀ*.
- **CHECKOUT (4 momenti d'ansia da presidiare):** ① carrello → "quanto mi costa davvero TUTTO?" (mostra consegna+totale subito) · ② dati → "devo registrarmi?" (guest!) "è lungo?" (one-page, default) · ③ pagamento → "e se sbaglio? è sicuro?" (COD chiaro, rassicurazione, "nessun addebito finché non confermi") · ④ conferma → "è arrivato l'ordine? quando consegnano?" (conferma rassicurante + tempi + "ti chiamiamo se serve").
- **ONBOARDING NEGOZIANTE (la curva del "ce la faccio?"):** ① interesse → ② "quanto è difficile/lungo?" (promessa: ~20 min, done-for-you) → ③ raccolta dati (minimo per andare live, salva-bozza, progressive disclosure) → ④ vetrina creata (momento-aha: "vedo la MIA bottega online") → ⑤ primo payout di test ("funziona davvero, prendo i soldi"). Frizione tipica: abbandono al passo 3 se i campi sono troppi/non spiegati e non si salva la bozza.
- **Marca il punto di abbandono reale** (dal funnel) sulla mappa: lì disegni.

## TOOL 7 — REGISTRO PATTERN RIUSABILI (altitudine: sistema, non schermata)
Quando risolvi una frizione, chiediti se è un **pattern** che si ripete → documentalo nella design system invece di
risolverlo schermata per schermata: *form-field con label+validazione-inline gentile* · *CTA primaria bottom-fixed
mobile* · *stato-vuoto con azione* · *blocco-rassicurazione pagamento* · *riepilogo-ordine sticky* · *riordino-in-2-tap*.
Un pattern fissato bene si riusa ovunque e tiene la coerenza (un solo modo per la stessa azione). Single-source, versionato.

## TOOL 8 — FORMULA DI CONSEGNA + MISURA (loop chiuso)
**Ogni consegna dichiara:** problema (frizione + dato di abbandono reale) · flusso scelto (e i 2 scartati col perché) ·
artefatto vero (wireframe/diff, non descrizione) · **effetto atteso sul KPI** (completamento/conversione su, abbandono giù,
tempo-per-completare giù) · colore 🟢🟡🔴 · confidenza. **Misura dopo:** quando il dato torna, scrivi l'esito in
`memoria-squadra/ux-designer.md` (quali frizioni contavano davvero). Naming: `AAAA-MM-GG_flusso_schermata`. KPI → @analista, fix componente → @frontend-dev.

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, per flusso)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Studia anche la design system in
> `mycity-live/design-system` + i flussi reali nel codice + `03-Clienti/Clienti, Personas & Crescita.md`.

## CHECKOUT
- ✅ **One-page checkout con guest + default precompilati** (Amazon/Shopify dynamic checkout). *Perché:* ogni step tolto moltiplica la conversione; il guest rimuove la barriera nº2; i default rimuovono input. *MyCity:* indirizzo+contatti+pagamento in una schermata, COD come opzione chiara in alto, totale-con-consegna sempre visibile, CTA "Conferma ordine" fissa in basso, "nessun addebito finché non confermi". → l'over-60 finisce senza chiamare il nipote.
- ✅ **Costo di consegna mostrato sul carrello, non alla fine.** *Perché:* il costo a sorpresa è la causa nº1 di abbandono carrello al mondo. *MyCity:* totale completo prima del checkout, minimo d'ordine chiaro.
- ❌ **Registrazione obbligatoria prima di comprare + form in 4 schermate + consegna che appare solo all'ultimo.** *Perché:* somma le 3 cause top di abbandono. → carrello morto.
- ❌ **Errore alla fine che svuota i campi** ("CAP non valido" e ricominci da capo). *Perché:* regressione + perdita dati = abbandono e rabbia.

## CARRELLO / SCHEDA PRODOTTO
- ✅ **Carrello con riepilogo chiaro, modifica-quantità a tap grandi, "continua a comprare" + "vai al pagamento" gerarchizzati.** *Perché:* riconoscere>ricordare, una sola azione primaria. *MyCity:* foto+nome bottega per ogni riga (fiducia), totale-tutto-incluso.
- ❌ **Scheda prodotto senza prezzo chiaro / "aggiungi" piccolo e grigio / nessuna info su consegna.** *Perché:* tap target sotto-soglia + carico cognitivo + ansia non risolta.

## ONBOARDING NEGOZIANTE
- ✅ **Onboarding done-for-you, minimo-per-andare-live + salva-bozza + progressive disclosure + momento-aha "vedo la mia bottega".** *Perché:* abbassa l'ansia "non sono capace", spezza il carico, dà una vittoria presto. *MyCity:* ~20 min, time-to-live <48h, il resto si completa dopo.
- ❌ **Onboarding in 6 schermate, campi obbligatori non spiegati, nessun salvataggio-bozza.** *Perché:* il negoziante abbandona al passo 3, supporto intasato. (lo SPAZZATURA canonico del mansionario.)

## STATI (vuoto / errore / caricamento) — dove i dilettanti barano
- ✅ **Stato vuoto che guida:** carrello vuoto → "Scopri le botteghe del centro" con CTA, non una pagina morta. *Principio:* lo stato vuoto è un'opportunità, non un buco.
- ✅ **Errore in lingua umana:** "Non siamo riusciti a confermare il pagamento — riprova o paga alla consegna", con i dati ANCORA nel form. *Principio:* cosa+come, mai gergo, mai perdere i dati.
- ✅ **Caricamento con feedback:** skeleton + "Sto confermando il tuo ordine…", non spinner muto. *Principio:* la performance percepita è UX.
- ❌ **Spinner infinito muto / schermata bianca su rete lenta.** *Perché:* l'utente pensa sia rotto e chiude.

## 🏆 I pattern vincenti distillati (regole trasversali)
JTBD prima della schermata · ogni step tolto moltiplica · una sola azione primaria · default>input · costi mostrati prima ·
guest>registrazione · COD come fiducia · rassicurazione dove c'è ansia · stati errore/vuoto/caricamento disegnati ·
tap ≥44px + contrasto + testo grande · CTA in basso (pollice) · riconoscere>ricordare · pattern riusabile>fix-spot.

## 🚩 Red flags (uccidi a vista)
Redesign per gusto senza un abbandono misurato · aggiungere uno step invece di toglierlo · wireframe senza stati di
errore/vuoto/caricamento · microcopy "da-azienda"/gergo inglese · costo di consegna a sorpresa alla fine · registrazione
obbligatoria per comprare · tap piccoli/contrasto basso/testo grigio chiaro · solo-hover su mobile · dark-pattern per
spingere la conversione · progettare sul proprio monitor · reinventare il brand (→ @designer) · "l'utente è stupido".

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, dove si innesta)
> Senza il punto di frizione vero, il redesign è un'opinione. Il kit produce ottimi *flussi* e *strutture*, ma il
> tetto sale da 8 a 10 solo col dato reale di dove cade la gente. Ecco ESATTAMENTE cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Funnel di abbandono reale** (Supabase/PostHog: viste→carrello→checkout→indirizzo→pagamento→ordine) | sapere DOVE cade la gente, disegnare lì e non a sensazione | Sapere D, Tool 4, Tool 6, ghigliottina |
| **Registrazioni di sessione** (Hotjar/Clarity/PostHog replay) | vedere *come* falliscono: rage-tap, esitazioni, scroll a vuoto, dove tornano indietro | Tool 4 (audit), Tool 5 |
| **2-3 sessioni con utenti REALI di Piacenza** (anziano, caregiver, negoziante) | il test dei 5 utenti vero: dove esita, dove chiama il nipote | Tool 5, Galleria (nuovo gold/spazzatura) |
| **Il flusso vero nel codice** (`mycity-live`) | cosa fa DAVVERO oggi la schermata, ogni campo/step reale | Tool 1, Tool 4 |
| **KPI di conversione/completamento per step** (@analista) | misurare l'effetto del fix, chiudere il loop, imparare quali frizioni contavano | Tool 8, strato 7 |
| **Design system aggiornata** (token, componenti in `mycity-live/design-system`) | riusare pattern e tenere coerenza, non reinventare | Tool 7, checklist coerenza Tool 3 |

Finché manca, **NON redesignare a sensazione e NON consegnare un'opinione travestita da dato:** dichiara la confidenza
("questa frizione l'ho vista nel codice/dato: 90%; questa la suppongo: 50%, va testata") e chiedi il carburante a Nicola
come leva che alza il livello. Senza il punto di frizione vero, fermati e procuratelo: è il riflesso del fuoriclasse onesto.

---
*Manutenzione: questo kit è vivo. Ogni volta che un fix UX va live e torna il dato (conversione/abbandono), aggiorna la
Galleria (nuovo gold/spazzatura col perché) e la memoria `memoria-squadra/ux-designer.md` (loop chiuso: impari quali
frizioni contavano davvero). RIASSUMI/POTA mensile: resta denso e affilato.*
