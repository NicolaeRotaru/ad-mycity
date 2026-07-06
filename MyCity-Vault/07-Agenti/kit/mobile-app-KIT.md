---
tipo: kit-mestiere
ruolo: mobile-app
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · MyCity oggi è web/PWA (nessuna app nativa live) · carburante reale atteso: dati traffico mobile + decisione timing/budget
collegato: [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · [[VETTORI-MULTINAZIONALE]] · 04-Prodotto-Ops/Tecnologia & Stack.md
---

# 🧰 KIT MESTIERE — mobile-app (il "cervello allenato" del mobile lead di marketplace)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un mobile lead di
> marketplace **sa e usa** (strati 3-6): quando nativo batte web, le architetture, il ciclo di release degli
> store, push/geolocalizzazione, il toolkit passo-passo, la galleria gold/spazzatura e il carburante che
> serve. Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]). Punto di partenza onesto: **MyCity oggi non
> ha un'app nativa** — è web/PWA, fase early con pochi negozi reali. Il kit serve sia a costruire bene
> QUANDO sarà il momento, sia a dire con rigore QUANDO non lo è ancora.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Nativo vs Web/PWA — il criterio, non l'istinto
Un'app nativa si giustifica **solo** dove il web/PWA strutturalmente non arriva:
- **Push affidabile ad app chiusa** (il web ce l'ha solo in forma più debole, via Web Push, e non su tutti i browser/OS).
- **Geolocalizzazione in background** (es. tracking del rider mentre l'app non è in primo piano).
- **Accesso hardware profondo**: fotocamera nativa, biometria, NFC, sensori.
- **Performance/offline reale**: cache aggressiva, uso senza rete, animazioni a 60fps costanti.
- **Distribuzione "già installata"**: l'icona sulla home aumenta la frequenza di riapertura vs un bookmark.
Se il bisogno non tocca nessuno di questi punti, la PWA (installabile, con Web Push) copre il caso a una
frazione del costo. **Il costo dell'app nativa non è solo lo sviluppo**: sono due pipeline di review, due
fee di sviluppatore ricorrenti, doppia manutenzione ad ogni cambio di API, doppio QA per ogni release.
**Regola di soglia:** non aprire due store finché non c'è un numero reale (utenti mobile ricorrenti, sessioni
web da mobile, richieste esplicite) che dice che la domanda esiste e che il ritorno supera il costo doppio.

## B. Architetture mobile — i trade-off reali
- **Nativo puro** (Swift/SwiftUI su iOS, Kotlin/Compose su Android): massime performance e integrazione OS,
  ma **due codebase separate** da scrivere e mantenere, due team (o un team che raddoppia il lavoro).
- **Cross-platform** (React Native, Flutter): un solo codebase per l'80-90% della UI/logica, riuso di
  competenze se il team web conosce già React; performance quasi-native per la maggior parte dei casi d'uso
  di un marketplace (liste, form, checkout). Resta comunque **doppia pipeline di build/review/store**.
- **PWA potenziata** (non è "mobile-app" in senso stretto, ma è l'alternativa da considerare sempre prima):
  installabile da browser, Web Push dove supportato, cache offline di base. Zero store, zero fee, un solo
  codebase col sito. È il gradino prima di giustificare il salto a nativo/cross-platform.
- **Criterio di scelta:** se la domanda è confermata ma il team è piccolo → cross-platform. Se servono
  performance/integrazioni hardware spinte e c'è budget per due team → nativo puro. Se la domanda non è
  ancora confermata → PWA, e si rimanda la decisione con dati in più.

## C. Il ciclo di release degli store (non è il tuo calendario, è il loro)
1. **Build & versioning**: versionamento semantico, changelog per ogni build, build interne testate prima
   di qualsiasi invio a review.
2. **Beta chiusa**: TestFlight (iOS) / Internal o Closed Testing (Google Play) con un gruppo ristretto prima
   del pubblico.
3. **Review**: Apple tipicamente richiede da ore a pochi giorni (può rigettare per permessi non giustificati,
   contenuti, policy su pagamenti in-app/subscription); Google in genere più rapido ma con proprie policy
   (Data Safety form, permessi sensibili, contenuti). **Pianifica sempre un margine**, mai l'ultimo giorno
   prima di un lancio o un evento.
4. **Staged rollout**: rilascio a percentuale crescente (es. 5% → 20% → 50% → 100%) per limitare il
   blast-radius di un bug scoperto dopo il rilascio. È l'equivalente mobile del canary deploy.
5. **Monitoraggio post-rilascio**: crash-free rate, ANR (Android "app not responding"), tasso di
   disinstallazione nelle prime 24-48h — se peggiorano, **fermi il rollout o fai rollback** (versione
   precedente resta disponibile, o kill switch remoto su feature nuove).
6. **Rigetto in review** non è un incidente: è normale. Playbook: leggi il motivo esatto, correggi, reinvia.
   Un rigetto per un permesso non giustificato si evita **prima** dichiarando il "purpose string" corretto.

## D. Push notification — infrastruttura e disciplina
- Infrastruttura tipica: **APNs** (Apple Push Notification service) per iOS, **FCM** (Firebase Cloud
  Messaging) per Android — spesso dietro un livello di orchestrazione (es. OneSignal) per segmentazione.
- **Permission prompt con contesto**: mai chiedere il permesso notifiche all'apertura a freddo. Prima mostra
  il valore ("ricevi un avviso quando il tuo ordine è in consegna"), poi chiedi.
- **Segmentazione e frequency cap**: transazionali (ordine confermato/in consegna/consegnato) hanno priorità
  e frequenza alta accettabile; promozionali (sconti, nuovi negozi) vanno **centellinate e mirate**, mai
  quotidiane a tutti — è la causa numero uno di disinstallazione.
- **Deep link**: ogni notifica porta alla schermata giusta (l'ordine specifico, il negozio), mai alla home
  generica — altrimenti la notifica non converte, solo interrompe.

## E. Geolocalizzazione — permessi, batteria, privacy
- **"Quando in uso" vs "sempre"**: iOS distingue nettamente; il permesso "sempre" (background) richiede una
  **giustificazione forte** in review (es. tracking rider durante la consegna attiva) e un consenso esplicito
  lato utente — non va richiesto per casi che si risolvono col permesso "in uso".
- **Impatto batteria**: il tracking continuo in background consuma batteria in modo visibile: usa geofencing
  o intervalli adattivi (più frequente vicino a un evento, meno altrimenti), non polling costante.
- **Privacy (GDPR)**: minimizzazione (raccogli solo la posizione che serve, per il tempo che serve — es.
  cancellata a consegna conclusa), consenso esplicito e revocabile, dati mai condivisi con terzi senza base
  giuridica. Coordina sempre con @legale-privacy sul consenso e la retention.
- **Casi d'uso reali per MyCity**: tracking del rider durante la consegna (foreground/breve background),
  "negozi vicino a te" (solo foreground, on-demand). Nessun caso oggi richiede tracking permanente del cliente.

## F. Performance mobile — cosa si misura
- **Cold start time**: quanto impiega l'app ad aprirsi da chiusa (benchmark generico di settore: sotto i 2
  secondi percepiti come "veloce"; oltre i 4-5 secondi l'utente abbandona).
- **Crash-free sessions rate**: percentuale di sessioni senza crash (benchmark generico >99% per un'app
  matura; sotto il 98% è un campanello d'allarme che va oltre le nuove feature).
- **App size**: pesa sul tempo di download e sul tasso di abbandono dell'installazione, specie su reti lenti
  o dati limitati — rilevante per zone periferiche di Piacenza con copertura non ottimale.
- **Offline-first**: cache locale per liste già viste, messaggio chiaro di "sei offline" invece di schermate
  bianche — un rider o un cliente con campo debole non deve vedere l'app rompersi.
- **Memory/battery budget**: non solo "funziona", ma "non scalda il telefono e non lo scarica" — misurabile
  coi profiler nativi (Xcode Instruments, Android Studio Profiler).

## G. Store compliance & ASO (farsi trovare e farsi accettare)
- **Policy store**: pagamenti digitali dentro l'app spesso devono passare dal sistema di pagamento in-app
  dello store (commissione propria, diversa da Stripe) — un marketplace fisico/locale come MyCity di norma
  ne è escluso (beni/servizi fisici), ma va **verificato caso per caso** prima di sviluppare, non dopo.
- **Privacy label (Apple) / Data Safety form (Google)**: dichiarazione onesta di quali dati si raccolgono e
  perché — compilata a specchio di ciò che l'app fa davvero, mai "meno di quanto raccoglie" (rischio rigetto/ban).
- **ASO (App Store Optimization)**: titolo e keyword in **italiano/dialetto locale** ("Piacenza", "negozi
  vicino a te"), screenshot che mostrano il valore reale (non mockup generici), localizzazione completa —
  un'app di Piacenza con store listing in inglese perde già in partenza.
- **Rating/recensioni**: segnale pubblico di qualità che influenza il ranking nello store; rispondere alle
  recensioni negative con un piano concreto (non scuse) è parte del mestiere, non un extra di supporto.

## H. Le metriche che contano (mettile sempre in un report)
Crash-free rate · adoption rate (installazioni / utenti attivi web) · retention D1/D7/D30 · push opt-in % ·
cold start time · session length · tempo medio di review · % rollout completato senza rollback · store rating.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Business case NATIVO vs PWA (template compilabile)
> Riempi SOLO con dati reali (Supabase/PostHog). Se un numero manca → `[DA NICOLA/ANALISTA: dato reale]`, **non stimarlo a sensazione**.
```
BUSINESS CASE APP NATIVA — periodo/fonte: [Supabase/PostHog, AAAA-MM]
(A) % sessioni da mobile (web)                    [__]%
(B) utenti mobile ricorrenti (≥2 sessioni/mese)   [____]
(C) retention D7 attuale (web)                    [__]%
(D) costo stimato build cross-platform            € [____]  ← [DA NICOLA: preventivo reale]
(E) costo ricorrente (2 account sviluppatore/anno)€ [____]
(F) soglia minima utenti ricorrenti per ripagare  [____]    ← calcolo con @finanza
─────────────────────────────────────
RACCOMANDAZIONE: [ ] Non ora, rafforza PWA  [ ] Sì, cross-platform  [ ] Sì, nativo puro
PERCHÉ: <1-2 righe con i numeri sopra>
```

## TOOL 2 — Checklist PRE-SUBMISSION store (passa ogni voce prima di inviare a review)
- [ ] Icona, screenshot per ogni device/size richiesto, in **italiano**.
- [ ] Privacy policy pubblica raggiungibile da URL, coerente con la privacy label/Data Safety form compilata.
- [ ] Ogni permesso (posizione/notifiche/fotocamera) ha un **purpose string** chiaro e giustificato nel testo di review.
- [ ] Testato sull'OS minimo dichiarato supportato, non solo sull'ultimo.
- [ ] Staged rollout configurato (non 100% al primo colpo).
- [ ] Piano di rollback/kill-switch pronto per le feature nuove.
- [ ] Changelog/release notes scritti in italiano, chiari per un utente reale (non un commit log).

## TOOL 3 — Playbook NOTIFICHE PUSH
1. Classifica ogni notifica: **transazionale** (ordine, consegna) vs **promozionale** (sconti, novità).
2. Permission prompt SOLO dopo aver mostrato il valore (mai al primo avvio a freddo).
3. Frequency cap: promozionali max [N]/settimana (valore da concordare con @crm-lifecycle, coerente col
   canale email/push esistente — no doppio bombardamento sullo stesso utente).
4. Ogni push ha un deep link alla schermata specifica, mai alla home.
5. Rispetta l'opt-out **subito** (nessuna notifica a chi ha disattivato, nessun re-prompt aggressivo).

## TOOL 4 — Playbook GEOLOCALIZZAZIONE
1. Chiedi il permesso minimo necessario ("in uso" salvo caso reale di background tracking rider).
2. Mostra il contesto prima del prompt di sistema ("ti serve per mostrarti la consegna in tempo reale").
3. Minimizza: raccogli solo per la durata della consegna/della sessione, cancella dopo.
4. Verifica con @legale-privacy consenso, base giuridica e retention PRIMA di rilasciare la feature.
5. Testa il fallback: se l'utente nega il permesso, l'app deve degradare senza rompersi (mai schermata bloccata).

## TOOL 5 — Runbook INCIDENTE (crash-rate sale dopo una release)
1. **Ferma il rollout** alla percentuale attuale (non avanzare) appena il crash-free rate scende sotto soglia.
2. Isola la build/versione responsabile dai log crash (stack trace, device/OS coinvolti).
3. Se la feature è dietro un flag → **kill switch remoto**; altrimenti prepara una build di rollback.
4. Comunica lo stato (a Nicola/alla Sala Operativa): cosa è successo, quanti utenti coinvolti, tempo stimato al fix.
5. Post-mortem senza colpa: causa radice, fix sistemico (es. più test su quel device/OS), lezione in memoria.

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande prima di produrre qualunque piano)
1. **Nativo o web** risolve meglio questo bisogno? 2. C'è la **massa critica reale** che ripaga il costo doppio?
3. Che **permesso** sto chiedendo e con quale contesto/consenso? 4. Il piano regge i **tempi di review**?
5. Il dato che uso ha una **fonte** (Supabase/PostHog/store console), o è a sensazione?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Numeri tra `[…]` = segnaposto, non inventati.

## BUSINESS CASE NATIVO VS WEB
- ✅ **GOLD:** *"Oggi [92]% delle sessioni MyCity sono da mobile ma via browser; non abbiamo ancora un dato
  di retention app-vs-web perché l'app non esiste. Con [pochi] negozi reali in fase early, il costo di due
  store + manutenzione doppia non si ripaga ora. Rafforzo la PWA (installabile, push web) per misurare la
  domanda reale a costo quasi zero; riapro il business case a [3 mesi] se retention D30 mobile supera [__]%."*
  — **Perché funziona:** numero reale, ammette il dato mancante, propone un passo misurabile e reversibile,
  non spreca budget su un problema non ancora confermato.
- ❌ **SPAZZATURA:** *"Facciamo l'app, aumenta le vendite del 30% e ci mette al pari di Glovo."* — **Perché
  muore:** percentuale inventata senza baseline, ignora tempi di review e costo ricorrente, ignora che con
  pochi negozi reali il traffico non giustifica ancora due store.

## PUSH NOTIFICATION
- ✅ **GOLD:** push transazionale *"Il tuo ordine da [Pane Quotidiano] è in consegna, arriva tra 15 minuti"*
  con deep link diretto alla schermata ordine — **perché funziona:** rilevante, tempestiva, un solo tap
  all'informazione utile, costruisce fiducia nel canale.
- ❌ **SPAZZATURA:** push generica ogni giorno *"Sconti imperdibili oggi su MyCity!"* a tutta la base utenti
  — **perché muore:** irrilevante per chi non è interessato, nessuna segmentazione, alto tasso di
  disattivazione/disinstallazione entro la prima settimana.

## RILASCIO / STAGED ROLLOUT
- ✅ **GOLD:** rilascio al [10]% con monitoraggio del crash-free rate per 24h prima di salire al [50]%, con
  rollback pronto — **perché funziona:** limita il blast-radius, il bug si scopre su poche centinaia di
  utenti, non su tutti.
- ❌ **SPAZZATURA:** rilascio al 100% il venerdì sera senza monitoraggio — **perché muore:** se qualcosa si
  rompe, lo scoprono tutti gli utenti nel weekend e nessuno è pronto a intervenire.

## 🏆 Pattern vincenti (regole trasversali)
Nativo solo dove il web non arriva davvero · soglia d'investimento prima della moda · staged rollout sempre
· push segmentata e rilevante · permesso chiesto col contesto giusto · ASO e listing in italiano · ogni
numero con fonte e periodo.
## 🚩 Red flags (uccidi a vista)
"Facciamo l'app" senza numero di domanda reale · percentuale di crescita inventata · tutti i permessi
all'avvio · push quotidiana a tutta la base · rilascio 100% senza rollback · account sviluppatore aperto
senza piano · store listing in inglese per un pubblico di Piacenza · tracking posizione "sempre" senza
giustificazione reale.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per quando si parte)
> Senza questo il kit è un mobile lead a mani vuote: ottime *strutture*, ma con segnaposto. Un business case
> sui numeri a sensazione è **peggio** di nessun business case. Ecco ESATTAMENTE cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Dati traffico mobile reali** (Supabase/PostHog: sessioni per device, retention) | il numeratore del business case nativo-vs-PWA | Tool 1, Sapere A |
| **Decisione di Nicola su timing/budget** (quando aprire i 2 account sviluppatore) | sblocca l'unica fase 🔴 del mestiere | Regole, Tool 1 |
| **Device reali iOS + Android** per test | testare cold start/crash-free/offline su hardware vero, non solo emulatore | Sapere F, Tool 2 |
| **Preventivo reale di sviluppo** (interno o agenzia) | costo (D) del business case, non stimato a occhio | Tool 1 |
| **Credenziali store/push** (Apple Developer, Google Play Console, Firebase/APNs) — solo quando si parte | pubblicare in beta/produzione, mandare push reali | Sapere C, D |
| **Consulenza @legale-privacy** su geolocalizzazione/consenso | base giuridica e retention dati posizione | Tool 4, Sapere E |
| **Definizioni [[GLOSSARIO-KPI]]** (retention, adoption) | coerenza cross-funzionale con @analista | Tool 6 |

**Confine 🔴 invalicabile:** aprire/pagare un account sviluppatore, pubblicare qualunque build sugli store
(anche in beta con utenti reali), e raccogliere dati di posizione reali si **propongono e si accodano** in
[[AZIONI-IN-ATTESA]] — **mai si eseguono** senza firma di Nicola. Finché manca il dato reale di domanda
mobile, dillo come "carburante" e tieni il business case con segnaposto chiari: **non consigliare un
investimento a due cifre su un numero che non hai.**

---
*Manutenzione: kit vivo. Quando arriva il primo dato reale di traffico mobile o si decide il timing
dell'app, aggiorna il Tool 1 con i numeri veri, aggiungi la prima riconciliazione gold/spazzatura reale alla
Galleria, e scrivi l'esito in `memoria-squadra/mobile-app.md`. RIASSUMI/POTA mensile: resta denso e affilato.*
