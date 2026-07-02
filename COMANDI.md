# 🎛️ COMANDI — cosa puoi dirmi (e cosa faccio)

> Scrivimi uno di questi e parte il lavoro. Non devi ricordarli a memoria: **torna qui** quando vuoi.
> Non sono rigidi: scrivimi come ti viene, ti capisco lo stesso. Per rivedere la lista: **"che comandi ho?"**
> Legenda: 🟢 = ti do il risultato subito · 🟡/🔴 = preparo tutto e aspetto il tuo ok · ▶️ = eseguo un'azione approvata.

## 📅 Ogni giorno (ritmo)
- **"fai un giro"** → guardo i dati reali, controllo le sentinelle, ti do un briefing. 🟢
- **"piano del mattino"** → priorità del giorno + una mossa per reparto. 🟢
- **"report della sera"** → cosa è stato fatto + numeri + cosa c'è da firmare. 🟢
- **"review della settimana"** → pagella della squadra + cosa migliorare. 🟢

## 📊 Numeri & soldi
- **"come stiamo?"** → cruscotto: i numeri reali adesso. 🟢
- **"report KPI"** → l'analista ti fa il quadro della settimana. 🟢
- **"controlla i pagamenti"** → la finanza cerca anomalie e payout. 🟢
- **"proiezione"** → quanto costa e quanto rende. 🟢

## 🏪 Negozi
- **"porta [nome] LIVE"** → la squadra prepara tutto per metterlo online. 🟡
- **"trovami negozi"** → lista di botteghe da contattare + pitch pronto. 🟢
- **"negozio in calo"** → piano per recuperare un negozio che vende meno. 🟡

## 🚀 Crescita & contenuti
- **"contenuti pro: [quali]"** (alias: *"modalità mondiale"*, *"fammi i contenuti pro"*) → creo i contenuti che mi dici a **livello agenzia internazionale**, passando dalla pipeline **Modalità Mondiale**: ① **Brief** (`BRIEF-CREATIVO.md`) → ② aggancio alla **Piattaforma "Il Turno"** (`consegne/marketing/PIATTAFORMA-CREATIVA.md`) → ③ genero **più varianti** → ④ il **@direttore-creativo** le critica spietato e tiene la migliore (vs `creativi/swipe/SWIPE-FILE.md` + rubrica per categoria) → ⑤ **produco** la grafica/reel veri → ⑥ **@qa-designer** controlla brand + onestà + safe-area → ⑦ accodo le pubblicazioni. Tu scrivi il comando + **quali contenuti**. 🟢 *(creo)* / 🔴 *(pubblicare)*
- **"lancia una campagna [tema]"** → piano completo (post, grafiche, budget) da approvare. 🟡
- **"contenuti della settimana"** → calendario + post + reel pronti. 🟢
- **"fammi [post / volantino / QR] per [X]"** → il designer/AI te lo crea. 🟢
- **"recupera i carrelli" / "riattiva i clienti"** → la CRM prepara i messaggi. 🟡

## 🛒 Il sito (modifica parlando)
- **"collega il marketplace"** (alias: *"collega il sito"*, *"aggiorna il codice del sito"*) → scarico/aggiorno la copia locale del repo del marketplace (`NicolaeRotaru/mycity`) così posso analizzarlo (radiografia, audit, fix). `node cervello/collega-marketplace.mjs`. 🟢
- **"cambia il sito: [cosa]"** → config subito, oppure codice con anteprima + tuo ok. ⚡/🛠️
- **"audit del marketplace"** → check tecnico **rapido**: bug/rischi/frizioni principali. 🟢
- **"radiografia"** (alias: *"analizza tutto il sito"*, *"trova tutti i bug"*) → analisi **profonda e millimetrica** di TUTTO il marketplace (13 dimensioni: sicurezza, RLS, pagamenti, privacy, performance, accessibilità, QA, AI, deploy…), **ogni problema verificato**, report per gravità in `consegne/audit/`. 🟢 *(lunga e approfondita)*
- **"radiografia di te stesso"** (alias: *"analizzati da cima a fondo"*, *"fatti la radiografia"*) → la macchina analizza **SÉ STESSA** (la propria architettura: 42 agenti, prompt, processi, sensori, memoria, capacità) su **12 dimensioni**, con causa-radice, pre-mortem e **confronto coi migliori** del mondo; ogni difetto verificato. Aggiorna il **cantiere dei difetti** (li porta a zero), lo storico-salute, e ti scrive una **lettera** su come sta andando. Workflow `.claude/workflows/auto-radiografia.js`. 🟢 *(lunga; le correzioni a sé stessa restano 🟡 da firmare)*
- **"radiografia del pannello"** (alias: *"controlla il pannello"*, *"analizza la cabina"*, *"trova i bug del pannello"*) → radiografia del **Pannello di Controllo** (l'app Next.js in `pannello/`, la tua faccia): 8 dimensioni in sola lettura (navigazione/tasto-indietro, stato perso cambiando chat, liste stale, stati async, doppio-invio, errori runtime, mobile/a11y, performance), **ogni bug verificato** avversarialmente e col **fix pronto da firmare**. Workflow `.claude/workflows/audit-pannello.js`. 🟢 *(lunga; i fix restano 🟡 da firmare)*
- **"design: [richiesta]"** (alias: *"lavora sul design"*, *"ci sono errori grafici"*, *"cambia il layout/i colori"*) → la squadra design **analizza** i problemi grafici/UX (audit design) **oppure modifica** ciò che chiedi: colori/home/testi = subito (config), layout/componenti = anteprima + tuo ok (codice). 🟢/⚡/🛠️

## 🎨 Design & grafica (tutto ciò che si vede)
- **"radiografia del design"** (alias: *"audit completo del design"*, *"analizza tutto il design"*, *"controlla tutta la grafica del sito"*, *"trova tutte le cose brutte del sito"*) → la squadra design fa l'**analisi più profonda e completa** di TUTTO ciò che si vede nel marketplace: la squadra design (ux-designer + designer + ai-designer + frontend-dev + cro) controlla **ogni** punto qui sotto in sola lettura, **verifica** ogni problema trovato (niente falsi allarmi) e ti consegna il report ordinato per gravità in `consegne/design/`, con in evidenza i bloccanti. 🟢 *(lunga e approfondita)*

  <br>**I 24 punti che controllo** (così sai esattamente cosa guardo):
  - **Aspetto visivo** — 1) Colori (palette, contrasto) · 2) Font/Testo (tipografia, leggibilità) · 3) Spazi (spaziatura, "respiro") · 4) Allineamento · 5) Immagini e foto (qualità, deformazioni) · 6) Icone · 7) Coerenza visiva (design system).
  - **Disposizione** — 8) Layout/Impaginazione · 9) Gerarchia visiva (cosa salta all'occhio) · 10) Responsive (come si vede su telefono).
  - **Esperienza d'uso** — 11) Navigazione/Menu · 12) Pulsanti e CTA · 13) Frizioni (cosa rende difficile/fastidioso) · 14) Microcopy (i testi piccoli, gli errori) · 15) Stati (caricamento/vuoto/errore) · 16) Feedback (risposte del sistema).
  - **Punti che fanno soldi** — 17) Home/Vetrina · 18) Scheda prodotto · 19) Ricerca e filtri · 20) Carrello · 21) Checkout (pagamento) · 22) Pagina negozio.
  - **Qualità invisibile** — 23) Accessibilità (a11y) · 24) Velocità percepita (performance).

  > Dopo la radiografia, per **sistemare** una cosa specifica basta dirmi *"sistema [il punto]"* (es. *"sistema i colori della home"*): colori/testi/home = subito (config 🟢/⚡), layout/CSS/componenti = anteprima + tuo ok (codice 🛠️). Mai deploy senza la tua firma 🔴.

## 🧠 Auto-potenziamento (la macchina che si migliora e impara dai risultati)
- **"giro operativo"** (alias: *"gira il business"*, *"mosse di oggi"*) → lancio una **flotta di senior in parallelo** (workflow `.claude/workflows/giro-operativo.js`): ogni motore di soldi propone le mosse a più alto ritorno **sui dati reali**, le verifico in modo avversariale, e ti do una **coda ordinata** (cosa parte da solo 🟢 / cosa firmi 🟡🔴). 🟢
- **"prevedi [mossa]" / "registra previsione"** → registro un **effetto previsto** misurabile (metrica, valore atteso, entro quando) in `calibrazione.json`. `node cervello/calibrazione.mjs prevedi …`. 🟢
- **"esito [id] = [numero]"** → chiudo la previsione col **reale**: chi azzecca guadagna autonomia (anello chiuso previsto-vs-reale). `node cervello/calibrazione.mjs esito …`. 🟢
- **"come sto calibrando?"** → tabella per-reparto: azzeccate/previsioni, punteggio, autonomia. `node cervello/calibrazione.mjs report`. 🟢
- **"chiudi i difetti" / "auto-fix"** → verifico nel codice quali difetti del **cantiere** sono risolti e li chiudo (il volano che si ripara, non solo si diagnostica). `node cervello/auto-fix.mjs verifica --applica`. 🟢 *(modificare il codice per risolverne uno resta 🟡 da firmare)*
- **"quale AI per [compito]?"** → il **banco AI** sceglie il modello più economico capace (Claude solo per il ragionamento). `node cervello/banco-ai.mjs "<compito>"`. 🟢
- **"quanto consumo?"** (alias: *"quanti token oggi"*, *"costo AI"*) → il log del consumo: token e durata per ogni run (giro/ritmo/monitora), quanti giri il **delta-gate** ha risparmiato, e se ho superato la soglia giornaliera. `node cervello/costo-ai.mjs --json` · nel Pannello via `/api/costo`. 🟢
- **auto-guarigione della coda** → la macchina si accorge da sola delle **azioni approvate non eseguite** (es. worker giù) e te le rimette davanti con scritto *perché* sono fallite. Nel Pannello, sulle card in "Errore", compare **🔄 Riprova** (un clic = riapprova e rimette in coda; nessuna riesecuzione automatica). Gira ogni 3 min: `cervello/sentinella-lavori.mjs` (timer `mycity-sentinella`). 🟢

## 🔎 Mercato
- **"cosa fanno i concorrenti?"** → intelligence. 🟢
- **"che opportunità ci sono?"** → intelligence + growth (eventi, meteo, bandi). 🟢

## 👥 La squadra
- **"[reparto], fai [X]"** (es. *"legale, scrivimi il contratto"*) → delego a quel senior. 🟢/🟡
- **"riunione su [obiettivo]"** → faccio collaborare più reparti a catena. 🟢/🟡
- **"crea un nuovo esperto di [X]"** → aggiungo un nuovo senior alla squadra. 🟢
- **"migliora [reparto]"** → il prompt-engineer lo affina. 🟢

## ⚡ Decisioni & azioni
- **"cosa devo decidere?"** → ti mostro la coda delle cose da firmare ([[AZIONI-IN-ATTESA]]). 🟢
- **"ok [numero]" / "approva [azione]"** → eseguo l'azione approvata. ▶️
- **"collega [Telegram / Gemini / …]"** → ti guido a collegare una "mano". 🟢
- **"sblocca Garetti"** → la lista esatta dei passi per il primo negozio. 🟢

---
💡 Puoi sempre inventarne di nuovi: se mi dici *"d'ora in poi quando scrivo X fai Y"*, lo aggiungo a questa lista.
