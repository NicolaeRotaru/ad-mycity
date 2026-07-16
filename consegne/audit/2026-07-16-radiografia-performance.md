---
data: 2026-07-16 23:58
tipo: radiografia-performance (COMPLETA — tempo 2 della radiografia del 16/7, su comando di Nicola)
ambito: worker · AD · 120 senior · Pannello · cervello
metodo: workflow auto-radiografia (12 dimensioni, revisore + verificatore avversariale per ciascuna) con focus performance, interrotto 17:50 e ripreso in automatico 21:19 su richiesta di Nicola; misurazioni dirette sul codice e sui file-macchina; dedup contro i 111 difetti della radiografia strutturale delle 16:55
---

# ⚡ Radiografia delle PERFORMANCE — 2026-07-16

> **Come leggerla.** Stamattina alle 16:55 la radiografia strutturale ha confermato 111 difetti sulla macchina
> e 62 sul Pannello (voto 0/100, archivio `consegne/audit/2026-07-16-auto-radiografia.md`). Questo è il
> **tempo 2**: la stessa macchina guardata con la lente delle **performance** — quanto è veloce, quanto costa,
> dove si ingolfa. Ogni numero qui sotto ha la fonte accanto (file:riga o file-macchina). I difetti già
> confermati stamattina NON vengono ricontati: dove servono, sono citati col loro ID (AR-…).

## 📏 Le misurazioni (numeri con fonte, presi dal vivo)

### Worker (VPS — `cervello/worker.sh`, 1.423 righe)
| Cosa | Valore misurato | Fonte |
|---|---|---|
| Polling della coda | ogni 5s (chat con precedenza) | worker.sh:314,1028 |
| Battito verso il DB | throttled a 20s (~4× meno scritture a coda vuota) | worker.sh:984-997 |
| Timeout lavoro chat/analisi | 900s (15 min) | worker.sh:1240 |
| Timeout giro/ritmo | 2.700s (45 min) | worker.sh:1116,1138 |
| Controllo «messaggio sostituito» durante la generazione | 1 GET REST **ogni 0,5s** per tutta la durata della risposta (~120 GET/min per chat) | worker.sh:684-697 |
| Scrittura parziali streaming | PATCH solo se il testo cresce (skip-se-invariato) | worker.sh:698-706 |
| Contesto-macchina per OGNI turno chat/azione | include un `git fetch` con timeout 20s + 2 REST + grep sui file di memoria | worker.sh:589-658 (fetch: 603) |
| Costo per turno di chat «sostanzioso» (>160 caratteri) | **2 run AI** (risposta + metabolizzazione accodata) | worker.sh:1360-1376 |
| Router costo sui lavori non-chat | **solo-consiglio**: logga il modello economico ma esegue comunque sul premium | worker.sh:1292 |
| Igiene | sessioni chat >14gg e tmp >1gg spazzati all'avvio | worker.sh:960-967 |

### Cervello / giro (`cervello/giro.sh`, 755 righe)
| Cosa | Valore misurato | Fonte |
|---|---|---|
| Guardiani eseguiti in serie a ogni giro | ~40+ invocazioni `node` sequenziali prima del motore AI | giro.sh:153-378 |
| Durata giro reale (ultimo completo) | 1.320s (22 min) | costo-ai.json, voce 16/7 12:42 |
| Durata ritmo-mezzogiorno | 202s | costo-ai.json, voce 16/7 12:03 |
| Giro saltato dal delta-gate | 1-3s (il risparmio funziona) | costo-ai.json, voci 14:20 e 20:20 |
| Giornata peggiore recente | 6.111s di run AI (11/7) | costo-ai.json, storico_giorni |
| Prompt fissi caricati sui run premium | CLAUDE.md 60.149 B + giro.md 22.807 B + COMANDI.md 13.256 B + ritmo.md 7.096 B ≈ **103 KB** | `wc -c` sui 4 file, 16/7 |

### Il contatore dei costi è cieco (conferma dal vivo di AR-117)
- `costo-ai.json` oggi 16/7: **4 voci registrate** (12:03, 12:42, 2 skip) — ma tra le 17:30 e le 21:19 sono
  girati anche il ritmo-sera 18:05 (commit `92ac5ed`), decine di turni chat e 2 recuperi: **nessuno ha una
  voce di costo**. `token_totali: 0` in 10 giorni su 13 dello storico.
- Conseguenza: il gate del budget (AR-087/AR-117) confronta una soglia da 2.000.000 token con un contatore
  fermo a zero — il freno di spesa non può frenare.

### Pannello (Next.js — 178 file TS/TSX, 70 API route)
| Cosa | Valore misurato | Fonte |
|---|---|---|
| Home = un SOLO client component | `page.tsx` da **3.209 righe**, `"use client"` alla riga 1 | pannello/src/app/page.tsx |
| Componenti client totali | 59 file `"use client"` su 178 | grep 16/7 |
| Poller attivi con la tab aperta | **~19 `setInterval`**: 6s (ComandiVPS), 8s (page.tsx:2009, GovernoAD), 30s ×3, 60s ×6, 90s ×2, 120s… ≈ **37 richieste/min per tab** | grep setInterval 16/7 |
| Cache lato server verso GitHub | **assente**: ogni fetch è `cache: "no-store"` | lib/github.ts:47, lib/obsidian.ts:95,130,207-210,330 |
| Chiamata più pesante ripetuta | `git/trees/…?recursive=1` (albero INTERO del repo) senza cache | lib/obsidian.ts:210 |
| Rischio | rate-limit GitHub 5.000 req/h con token: una tab aperta tutto il giorno può bruciarne migliaia; quando il limite scatta il Pannello mostra dati vecchi senza dirlo | — |

### Coda, volano e senior (throughput del sistema-azienda)
- **Coda approvazioni**: 18 blocchi in `AZIONI-IN-ATTESA.md`; i più vecchi del **24-26/6** (3 settimane).
  Il collo di bottiglia non è la macchina: è il funnel firma→esecuzione (AR-110/AR-114 confermati).
- **Volano dei 120 senior**: 79 quaderni **vuoti**, 100 **fermi** su 120; calibrazione con autonomia «bassa»
  per tutti i reparti; @finanza 7 previsioni 0 misurate (chiusura-loop.json, calibrazione.json 16/7).
- **Cadenza**: 2 interruzioni recuperate oggi (ritmo 18:00 → recupero 18:05, giro 20:20 → skip delta-gate);
  il recupero funziona ma non lascia voce di costo né diagnosi.

## 🔬 Difetti PERFORMANCE confermati (verifica avversariale, dedup vs i 111 del mattino)


### coerenza-agenti — voto 68/100 (attenzione)

- **[grave]** Due senior su tre non possiedono nessun numero: l'OKR è fermo a 39 su 120 (e il guardiano è sempre rosso)
  - Dove: MyCity-Vault/05-Soldi-Rischi/OKR-Squadra.md (40 righe-dato: AD + 39 senior con KPI; frontmatter aggiornato: 2026-06-24). cervello/agent-registry-check.mjs riporta 81 agenti 'senza KPI' e process.exit(81>0?1:0) → exit 1 permanente.
  - Causa radice: 1) Perché 81 senza KPI? Perché l'OKR non è stato esteso all'espansione +78. 2) Perché non esteso? Perché OKR-Squadra si aggiorna A MANO (dichiarato in auto-radiografia.js:143: 'agent-registry-check segnala drift ma OKR va aggiornato a mano'). 3) Perché a mano? Perché non esiste un generatore che cre
  - Fix (🟡 da firmare): Backfillare OKR-Squadra con una riga-KPI di default per ognuno degli 81 senior scoperti (KPI + target fase-1 + budget, pro-forma 🔴), presi dalla Carta del Dipendente di ciascun mansionario; e far generare la riga di default dallo stampo alla creazione di ogni nuovo agente, così il gap non si riapre.
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[grave]** I nuovi specialisti rimandano ai capi, ma i capi non rimandano indietro: routing ambiguo su temi sensibili
  - Dove: .claude/agents/legale-privacy.md, security.md, operations.md, analista.md, data-engineer.md, product-manager.md, customer-success.md, supporto.md (description SENZA alcun deferral →) — mentre i loro specialisti li citano a monte (verificato: infosec-soc/accoun
  - Causa radice: 1) Perché il routing è ambiguo? Perché generalista e specialista rivendicano lo stesso tema e solo lo specialista dichiara il confine. 2) Perché solo lo specialista? Perché i deferral sono stati iniettati solo nei file NUOVI e nel roster di CLAUDE.md, non backfillati nei mansionari vecchi. 3) Perché
  - Fix (🟡 da firmare): Backfillare nei mansionari generalisti (legale-privacy, security, operations, analista, data-engineer, product-manager, customer-success, supporto) i deferral GIÙ verso lo specialista, sul modello '(→ X = **specialista**)' già usato altrove; e restringere la description del generalista dove lo speci
  - Impatto crescita: basso · 🆕 **AR-130**

- **[minore]** Ogni senior eredita l'intero toolset: il 'minimo privilegio' è dichiarato ma non esiste come confine tecnico
  - Dove: .claude/agents/*.md (tutti e 120: frontmatter con SOLO name+description; 0 con campo tools:, 0 con model:) — a fronte del claim in MyCity-Vault/07-Agenti/AGENTI.md:15-16 ('Ogni senior ha solo gli strumenti che gli servono (minimo privilegio)').
  - Causa radice: 1) Perché ogni agente ha pieni poteri-attrezzo? Perché nessun file dichiara tools:. 2) Perché nessuno lo dichiara? Perché lo 'stampo' che genera i 120 agenti scrive solo name+description. 3) Perché lo stampo non inietta i tool? Perché il 'minimo privilegio' è stato codificato come frase in AGENTI.md
  - Fix (🟡 da firmare): Aggiungere un campo tools: a ogni mansionario derivato dal colore max del reparto (sola-lettura → Read/Grep/Glob/WebSearch; bozze → + Write in consegne/; codice → + Edit/Bash git in branch), e creare un guardiano agent-tools-check.mjs che FALLISCE se un agente non ha tools: o se i tool eccedono il c
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[minore]** La macchina dice di avere 42 (o 40) agenti mentre sono 120 — anche nel workflow che si auto-analizza
  - Dove: .claude/workflows/auto-radiografia.js:58 ('coerenza dei 42 agenti'), COMANDI.md:38 ('42 agenti'), MyCity-Vault/07-Agenti/AGENTI.md:18 ('i 42 file in .claude/agents/'), cervello/sentinelle.md:93 ('ai 42 file reali'), cervello/guardiano-capacita.mjs:6 ('i 42 AGE
  - Causa radice: 1) Perché la macchina scrive 42? Perché il numero è prosa a mano in ogni file. 2) Perché a mano ovunque? Perché nessuna di queste stringhe deriva il conteggio da readdirSync('.claude/agents'). 3) Perché il guardiano non lo becca? Perché il suo conteggio-check usa il pattern (\d+) senior (trova '120 
  - Fix (🟡 da firmare): Sostituire ogni letterale '42/40 agenti/file/reparti/senior' col conteggio reale (o con un token che il giro rigenera da readdirSync('.claude/agents')), a partire da auto-radiografia.js:58 e sentinelle.md:93; ed estendere il conteggio-check di agent-registry-check ai pattern 'N file|agenti|reparti|s
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[minore]** Il guardiano del registro agenti gira a ogni giro, ma il giro ne butta via il verdetto
  - Dove: cervello/giro.sh:180 — node "$SCRIPT_DIR/agent-registry-check.mjs" 2>&1 | tail -4 || true (exit code scartato).
  - Causa radice: 1) Perché il drift del registro non ferma nulla? Perché giro.sh scarta il suo exit code. 2) Perché lo scarta? Perché usa l'idioma dominante '| tail -N || true', condiviso da 36 invocazioni. 3) Perché non è stato migrato come allocazione-check/chiusura-loop/registro-scelte (i 3 già a vincolo-hard)? P
  - Fix (🟡 da firmare): Dopo aver svuotato il gap-KPI (finding OKR), migrare giro.sh:180 al pattern AR-081 già usato per allocazione-check: catturare _reg_rc=$? e trasformare il drift residuo (orfani/conteggio/collisioni) in vincolo hard o in una riga-azione in coda, invece di '|| true'. Resta 🟡 da firmare (cambia il compo
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[minore]** Il controllo anti-doppioni trova sempre zero perché confronta solo parole identiche
  - Dove: cervello/agent-registry-check.mjs:136 — if (condivise.length >= 2) dentro analizzaCollisioniDescription (AR-027). Verificato: 0 collisioni e 0 deferral-mancanti stampati nell'esecuzione reale.
  - Causa radice: 1) Perché 0 collisioni? Perché confronta stringhe esatte. 2) Perché esatte? Perché la detection è lessicale, non semantica. 3) Perché lessicale? Perché è l'euristica più economica senza un modello. 4) Perché la soglia ≥2? Per evitare falsi positivi sui monosillabi, ma così perde gli overlap a 1 fras
  - Fix (🟡 da firmare): Rinforzare analizzaCollisioniDescription: abbassare la soglia a condivise.length >= 1 per le coppie owner-unico dichiarate, e affiancare al match verbatim una lista esplicita di coppie a rischio (generalista↔specialista) o un confronto per radici/sinonimi, così l'overlap riformulato non sfugga. Rest
  - Impatto crescita: basso · ↷ conferma della mappa del mattino


### vettori-installati — voto 55/100 (attenzione)

- **[grave]** Il guardiano che certifica «installato 120/120» controlla 6 marcatori superficiali e NON verifica 3 dei 4 vettori-chiave (loop interno, trappole, carburante)
  - Dove: cervello/stampo-check.mjs:38-56 (analizzaAgente)
  - Causa radice: Il guardiano controlla la PRESENZA di un sottoinsieme di marcatori, non la COMPLETEZZA dei 14 item della CHECKLIST DI ROLLOUT dello STAMPO. Causa di sistema: la definizione di 'senior completo' vive in un doc leggibile solo da umano (.md in prosa), e il guardiano ne implementa a mano un sottoinsieme
  - Fix (🟡 da firmare): Allineare stampo-check.mjs ai 14 item della CHECKLIST DI ROLLOUT: aggiungere check di presenza per loop interno, Trappole del mestiere, carburante, galleria (>=1 GOLD + 1 SPAZZATURA), 5 dimensioni e blocco vettori-multinazionale. Meglio: estrarre la checklist in un JSON condiviso letto sia dallo STA
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[grave]** Soglia KIT tarata al verde: 5200B, cioè 82 byte SOTTO il kit più piccolo — nessun kit può fallire il check 'non-stub'
  - Dove: cervello/stampo-check.mjs:23 (KIT_MIN_BYTES=5200) vs MyCity-Vault/07-Agenti/kit/mediatore-creditizio-KIT.md (5282B, il più piccolo)
  - Causa radice: 5200 è stata scelta per far passare i file già esistenti, non per misurare una profondità reale: metrica-proxy (byte) calibrata sul risultato desiderato (verde) invece che sullo standard (profondità content-social). La profondità vera (strati 3/4/5/6 sostanziali) è difficile a byte e si è ripiegato 
  - Fix (🟡 da firmare): Sostituire il floor a byte con un check strutturale: presenza sostanziale di STRATO 3/4/5/6 (sezioni A-E + TOOLKIT + GALLERIA con >=2 esempi + CARBURANTE) e/o soglia relativa (percentile vs mediana del parco), così i kit thin emergono come debito invece di passare. Resta 🟡.
  - Impatto crescita: medio · 🆕 **AR-129**

- **[minore]** 10 senior sono OGGETTIVAMENTE a metà (cluster banche&finanziamenti + avvocato-civile + business-plan + finanza-agevolata) — 8 con nota SCRITTA di auto-ammissione, ma il guardiano li dà per completi
  - Dove: MyCity-Vault/07-Agenti/kit/{consulente-bancario,credito-impresa,fondo-garanzia-pmi,fundraising-equity,investor-relations,mediatore-creditizio,rating-centrale-rischi,business-plan-bancabile}-KIT.md (nota in coda) + avvocato-civile-KIT.md (6706B) + finanza-agevo
  - Causa radice: Il rollout dello STAMPO è a ondate 'per impatto sui soldi': l'ultima ondata (banche/legale-professionale) è stata prodotta a kit-minimo + placeholder in attesa di carburante reale (fogli condizioni, bandi). Il debito non si chiude perché manca un cantiere tracciato che consumi le note di auto-ammiss
  - Fix (🟡 da firmare): Aprire un cantiere esplicito 'kit banche&finanziamenti + legale-civile a profondità piena' (owner @prompt-engineer), alimentato dal carburante reale mancante, con le note di auto-ammissione come lista da azzerare. Priorità coerente col ROI (dopo i motori di soldi). Resta 🟡.
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[grave]** Lo STRATO 7 (loop chiuso sui numeri) è di fatto APERTO: 91/124 quaderni memoria-squadra sono stub vuoti, e il guardiano controlla solo l'esistenza del quaderno, non che contenga esiti
  - Dove: memoria-squadra/*.md (91 file <=650B su 124) + cervello/stampo-check.mjs:53-54 (solo existsSync, nessun readFileSync)
  - Causa radice: Il loop è in parte aperto per causa dichiarata (dipende dalle 'mani'/dati reali non ancora collegati), MA resta INVISIBILE nel conteggio 'completi' perché stampo-check equipara quaderno-esistente a quaderno-vivo. Due guardiani danno verdetti opposti sullo stesso file perché stampo-check e chiusura-l
  - Fix (🟡 da firmare): In stampo-check.mjs leggere il contenuto del quaderno (>=1 riga ESITO nel formato canonico AAAA-MM-GG·...·#tag) e riusare l'esito di chiusura-loop.mjs --sonda invece di ignorarlo, così 'quaderno vuoto' diventa un difetto di stampo. Resta 🟡.
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[minore]** Doppia casa della memoria-squadra: copia orfana nel vault accanto a quella viva, con metabolizza che autorizza a scrivere nella zona sbagliata
  - Dove: MyCity-Vault/90-Memoria-AI/memoria-squadra/ (4 file stale, referenziata da NESSUNO script) vs ./memoria-squadra/ (viva) + cervello/metabolizza.md
  - Causa radice: La memoria-squadra è stata migrata dal vault alla root senza rimuovere la vecchia copia né stringere metabolizza.md sul path canonico: migrazione di percorso senza cleanup né aggiornamento dei mandati -> due sorgenti coesistono e una regola di scrittura ambigua le tiene entrambe raggiungibili.
  - Fix (🟡 da firmare): Eliminare/archiviare la copia orfana MyCity-Vault/90-Memoria-AI/memoria-squadra/ e in metabolizza.md puntare esplicitamente a ./memoria-squadra (path non ambiguo). Confermare a Nicola che root è la casa canonica prima di cancellare (tocca memoria). Resta 🟡.
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[minore]** Il guardiano dello stampo gira non-bloccante e senza cantiere: l'exit '1 = senior a metà' viene ingoiato in giro.sh
  - Dove: cervello/giro.sh:182 ('node stampo-check.mjs 2>&1 | tail -6 || true')
  - Causa radice: stampo-check è nato come riga informativa ('stampa un riassunto') wired con '|| true' per non rompere il giro, e non è stato integrato nel meccanismo cantiere-a-zero né nel pattern cattura-rc->vincolo-hard che allocazione-check e coerenza-fatti già usano per i difetti che devono gate-are.
  - Fix (🟡 da firmare): Instradare l'esito di stampo-check nello stesso pattern di allocazione-check/coerenza-fatti (cattura rc -> vincolo/cantiere tracciato): resta warn non-bloccante se si vuole, ma i 'senior a metà' vengono conteggiati e portati a zero per impatto, non nascosti dal '|| true'. Resta 🟡.
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[minore]** Drift di naming che nasconde i vettori alla verifica: 7 agenti banche etichettano 'Galleria.' invece di 'Galleria di riferimento' e 27 agenti non instradano il 'loop chiuso' nella sezione metro
  - Dove: .claude/agents/{consulente-bancario,credito-impresa,fondo-garanzia-pmi,fundraising-equity,investor-relations,mediatore-creditizio,rating-centrale-rischi}.md (heading '**Galleria.**') + 27 agenti senza la frase 'loop chiuso' nel metro
  - Causa radice: Non esiste un template canonico applicato meccanicamente: ogni ondata di rollout ha ricopiato lo stampo a mano con micro-varianti, e sopravvivono perché il guardiano non verifica le intestazioni canoniche. Manca un blocco-stampo canonico versionato che il guardiano confronti riga-per-riga -> drift l
  - Fix (🟡 da firmare): Normalizzare le intestazioni al blocco canonico dello STAMPO ('Galleria di riferimento', frase 'loop chiuso' nel metro) e far verificare al guardiano le intestazioni canoniche (si aggancia al fix del difetto 1). Resta 🟡.
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[minore]** Quaderno dell'AD duplicato per collisione di maiuscole: coesistono memoria-squadra/AD.md (stub 405B) e memoria-squadra/ad.md (vivo 22KB)
  - Dove: memoria-squadra/AD.md (405B) + memoria-squadra/ad.md (22085B)
  - Causa radice: Il seed di bootstrap ha creato 'AD.md' con casing diverso (maiuscolo) dall'uso reale a minuscolo 'ad.md', e nessun check normalizza il casing dei nomi quaderno: naming dei quaderni non normalizzato/validato contro una convenzione unica.
  - Fix (🟡 da firmare): Consolidare su un solo file (minuscolo 'ad.md') e rimuovere lo stub AD.md; opzionale un check di normalizzazione casing nel bootstrap. Resta 🟡 (tocca memoria: conferma a Nicola).
  - Impatto crescita: basso · ↷ conferma della mappa del mattino


### salute-sensori-dati — voto 64/100 (attenzione)

- **[grave]** La salute delle fonti web è ferma alle 14:20 e grida 'morto!' per comprapiacenza, un sito già tolto dal radar alle 17:03
  - Dove: cervello/fonti-salute.json (allerta comprapiacenza righe 8-14; record morto 137-148; quando 14:20) · cervello/radar-fonti.json (17 fonti, nessun comprapiacenza) · commit 49bab27 (rimozione dal radar alle 17:03) · cervello/sentinella-fonti.mjs (nessun stampSegn
  - Causa radice: 1) M8 accende un allarme su una fonte inesistente → 2) perché il radar è stato modificato (comprapiacenza rimossa alle 17:03) SENZA rigenerare/ripulire fonti-salute.json nello stesso cambio → 3) perché fonti-salute.json vive nel perimetro CODICE (cervello/) e non è trattato come stato di memoria da 
  - Fix (🟡 da firmare): 🟡 (a) In sentinella-fonti.mjs chiamare stampSegnale('fonti', ok/errore, sintesi) a fine run e inserire 'fonti' negli ATTESI di freschezza-segnali.mjs, così un giro senza scrittura fonti diventa un warning visibile. (b) In M8 (sentinella-dati.mjs) ignorare fonti-salute.json se 'quando' è più vecchio 
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[grave]** n8n risulta 'cieco da 15 giri' solo perché nel .env c'è un host finto, e l'allarme non si spegne mai alla radice
  - Dove: cervello/verifica-sensori.mjs:280-294 (checkN8n) · MyCity-Vault/90-Memoria-AI/auto-coscienza/sensori-cecita.json (n8n_health giri_ciechi=15, meta.max_giri_ciechi=15) · consegne/tech/2026-07-16-diagnosi-sensori-ciechi.md (host n8n = 'tuo-n8n' placeholder, N8N_W
  - Causa radice: 1) M2 sveglia Nicola 'sensore cieco da 15 giri' → 2) perché n8n_health è 'cieco' → 3) perché l'URL è il segnaposto 'tuo-n8n' che non risolve → 4) perché verifica-sensori tratta 'variabile presente' come 'configurato', senza distinguere un valore reale da un placeholder → 5) causa di sistema: manca l
  - Fix (🟡 da firmare): 🟡 In verifica-sensori.mjs rilevare i valori-segnaposto noti (host/chiavi che contengono 'tuo-', 'example', 'changeme', 'xxx', o host non risolvibile via DNS al primo giro) e classificarli 'non_configurato' invece di 'cieco', per n8n e per ogni sensore. Così il segnaposto smette di gonfiare max_giri_
  - Impatto crescita: medio · 🆕 **AR-135**

- **[grave]** La macchina dice a Nicola 'dati ciechi da 15 giri, non scrivere numeri' mentre gli ordini si leggono benissimo
  - Dove: cervello/verifica-sensori.mjs:442-458 (maxCecita su tutti i 'cieco') · cervello/sentinella-dati.mjs:225 (legge meta.max_giri_ciechi),290-298 (M2 titolo/prompt 'dati ciechi', firma senza dedupPersistente) · MyCity-Vault/90-Memoria-AI/auto-coscienza/sentinella-d
  - Causa radice: 1) M2 dichiara 'dati ciechi' quando non lo sono → 2) perché legge un unico scalare max_giri_ciechi → 3) calcolato su sensori di natura diversa mescolati (dati-verità + mani n8n + uptime) → 4) perché verifica-sensori non etichetta ogni sensore con una CLASSE → 5) causa di sistema: manca il modello 'l
  - Fix (🟡 da firmare): 🟡 Etichettare ogni sensore con una classe (dati-verità / mani / uptime) in verifica-sensori.mjs ed esporre un max_giri_ciechi_dati calcolato SOLO sulla classe dati-verità. M2 usa quel campo e cambia titolo/prompt di conseguenza; per mani/uptime cieche si accoda una card separata col testo giusto ('l
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[minore]** Ogni giro di monitoraggio interroghiamo siti che sappiamo già morti o bloccati, bruciando token per niente
  - Dove: cervello/monitora.md:6-12 (seleziona da radar-fonti.json, WebFetch/WebSearch su ogni fonte dovuta; nessun riferimento a fonti-salute),30-34 (fallback 403→WebSearch generico) · cervello/fonti-salute.json (comune-* a 403, affitti-idealista/comprapiacenza morte)
  - Causa radice: 1) monitora interroga fonti già marcate morte → 2) perché monitora.md non consulta fonti-salute.json → 3) perché l'unico consumatore cablato di fonti-salute è M8 (l'allerta), non il ciclo di lettura → 4) produttore (sentinella-fonti) e consumatore-spendaccione (monitora) progettati in momenti divers
  - Fix (🟡 da firmare): 🟡 Al passo 1 di monitora.md, escludere o retrocedere in coda-bassa le fonti con morta:true e usare direttamente WebSearch (non WebFetch) su quelle a 403 persistente, citando fonti-salute.json come guida — così il segnale della sentinella diventa un risparmio reale di token.
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[minore]** Sappiamo 'quanti giri' un sensore è cieco, ma non 'da quando': manca la data del primo buio
  - Dove: cervello/verifica-sensori.mjs:115-123 (ramo cieco senza data di primo fallimento) · MyCity-Vault/90-Memoria-AI/auto-coscienza/sensori-cecita.json (mcp_supabase cieco senza date; posthog_api nota_riconciliazione = contatore 27 congelato riconciliato a mano)
  - Causa radice: 1) Non sappiamo 'da quando' un sensore è cieco → 2) perché si salva solo un contatore di giri, non un istante → 3) perché il modello dati del sensore non ha un campo 'cieco_da' impostato al primo fallimento e azzerato al ritorno di 'ok' → 4) perché la cecità è stata pensata come 'quanti giri consecu
  - Fix (🟡 da firmare): 🟡 In aggiornaSensore: al primo passaggio a 'cieco' scrivere 'cieco_da' = nowPiacenza() (mantenerlo finché resta cieco, azzerarlo al ritorno 'ok'); esporre 'da_quando' accanto a giri_ciechi. Così card e Pannello mostrano l'ora reale del primo buio e il dato non dipende più dalla cadenza dei giri.
  - Impatto crescita: basso · ↷ conferma della mappa del mattino


### integrita-memoria — voto 65/100 (attenzione)

- **[grave]** Il registro-realtà contraddice il registro-fatti: i 6 ristoranti che Nicola ha ESCLUSO il 16/7 sono ancora 'scelte ragionate' nella Cabina
  - Dove: MyCity-Vault/90-Memoria-AI/auto-coscienza/registro-realta.json:116,132,148,164,180,197 (6 entità scelta_ragionata) vs MyCity-Vault/90-Memoria-AI/registro-fatti.json:164-178 (fatto onboarding.6-ristoranti-tattici ESCLUSI); render in pannello/src/components/Auto
  - Causa radice: La correzione 16/7 ha aggiornato registro-fatti ma NON registro-realta. coerenza-fatti caccia solo pattern registrati con --caccia e nessuno cacciava i nomi dei 6 ristoranti. Causa di sistema: esistono DUE proiezioni delle stesse entità (registro-realta asse ① e registro-fatti AR-102) senza legame d
  - Fix (🟡 da firmare): 🟡 (a) accodare la riscrittura di registro-realta: marcare i 6 ristoranti 'scartato' con fonte='correzione Nicola 16/7'; (b) nuova sentinella entità-esclusa: quando un fatto-business esclude un'entità, FALLISCE se l'entità omonima in registro-realta resta confermato/scelta_ragionata; (c) dichiarare p
  - Impatto crescita: alto · 🆕 **AR-125**

- **[grave]** Il gate dei contratti JSON è decorativo: valida-contratti.mjs rileva 9 violazioni ma il suo exit 1 viene ingoiato da '| tail -4 || true'
  - Dove: cervello/giro.sh:327 (`node "$SCRIPT_DIR/valida-contratti.mjs" 2>&1 | tail -4 || true`)
  - Causa radice: Il `|| true` è stato aggiunto come 'informativo, non gate' (commento giro.sh:320). Nessuno ha deciso quali violazioni di contratto sono bloccanti vs warning, e valida-contratti emette solo ok/ko binario senza classe di gravità. Causa di sistema: manca una policy di enforcement dei contratti (quali v
  - Fix (🟡 da firmare): 🟡 rendere HARD il sottoinsieme di regole 'campi letti dal Pannello che rompono il layout' (togliere `|| true` e non incanalare in tail per quelle), lasciando warning il resto; documentare in auto-coscienza.md la lista bloccante-vs-warning. Il gate deve girare lato scrittura, prima del commit della m
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[minore]** auto-analisi.json è fuori contratto su 3 campi; il Pannello sopravvive perché li gestisce difensivamente a runtime
  - Dove: MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-analisi.json:18-24 (domande stringhe), :7-15 (verifiche array), :36-47 (salute_macchina); rammendi in pannello/src/app/api/memoria/auto-coscienza/route.ts:26-88,172-173 e AutoCoscienza.tsx:143,441-443,613
  - Causa radice: Il motore del giro scrive i JSON a mano libera; non esiste una libreria unica di scrittura che validi contro lo schema prima di scrivere; il contratto vive come prosa, non come writer condiviso; e il validatore copre solo salute_macchina, non domande_per_nicola/verifiche/enum registro. Causa di sist
  - Fix (🟡 da firmare): 🟡 (a) un unico writer degli auto-coscienza/*.json che valida contro lo schema prima di scrivere; (b) estendere valida-contratti a domande_per_nicola/verifiche/salute_macchina e renderlo hard (vedi finding gate); (c) declassare i normalizzatori Pannello a fallback-only che LOGGANO quando scattano, co
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[minore]** Memoria dell'AD duplicata: coesistono AD.md (405B) e ad.md (22KB attivo) — split per case senza canonicalizzazione
  - Dove: memoria-squadra/AD.md (405B, 1 esito) e memoria-squadra/ad.md (22KB attivo); derivazione senza canonicalizzazione in cervello/chiusura-loop.mjs:61-63 e cervello/bootstrap-quaderni.mjs:20-22
  - Causa radice: Il nome-file deriva dal reparto as-is: quadernoPath usa la stringa senza lowercase, assumendo che i reparti arrivino già normalizzati, ma 'AD'/'@AD'/'ad' sono intercambiabili nel sistema. Causa di sistema: manca una funzione unica reparto→slug canonicalizzato e manca un guardiano che rilevi quaderni
  - Fix (🟡 da firmare): 🟡 (a) canonicalizzare reparto→slug (lowercase) in quadernoPath e bootstrap; (b) fondere il contenuto di AD.md dentro ad.md e cancellare lo stub; (c) guardiano che FALLISCE se due quaderni in memoria-squadra/ collidono per case.
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[minore]** GLOSSARIO-KPI è ancora 'seed DA CONFERMARE' dal 27/6 con 7 divergenze proposta↔codice mai riconciliate
  - Dove: MyCity-Vault/07-Agenti/GLOSSARIO-KPI.md:1-5 (stato seed) e :78-90 (tabella divergenze D1-D7)
  - Causa radice: Le 7 soglie richiedono una decisione di Nicola (🔴/umana) mai chiusa, e nessun momento forzato porta le D1-D7 come UNA scelta; nessuna scadenza/sentinella veglia lo stato 'seed'. Causa di sistema: un documento fondativo può restare 'seed' a oltranza senza forzare la riconciliazione né allineare codic
  - Fix (🟡 da firmare): 🟡 portare a Nicola le 7 decisioni D1-D7 come una singola card di riconciliazione; alla firma, allineare codice e glossario così un termine ha una sola formula ovunque; sentinella che accoda la riconciliazione se GLOSSARIO-KPI resta 'seed' oltre N giorni.
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[minore]** apprendimento.json cresce senza potatura: 253 lezioni, 0 mai decadute, 456KB; il ciclo di decadimento non gira e 3 lezioni sono senza stato
  - Dove: MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json (253 lezioni, 3 senza stato: L-2026-0707-01/02/03, 456KB); calcolo senza applicazione in cervello/tasso-lezioni.mjs:203,214
  - Causa radice: Esistono script che CALCOLANO il tasso, ma nessun motore APPLICA il decadimento (spostare a 'decaduta' le lezioni vecchie/non applicate/a bassa confidenza). Causa di sistema: il ciclo di vita delle lezioni è specificato nel contratto ma implementato a metà — si scrivono e si contano, non si potano n
  - Fix (🟡 da firmare): 🟡 motore di decadimento (settimanale) che marca 'decaduta' le lezioni sotto soglia di confidenza/applicazione/età e le esclude dal contesto del giro; estendere valida-contratti allo stato-lezione così le 3 senza stato falliscono il gate.
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[minore]** 80 quaderni su 124 in memoria-squadra sono stub vuoti dal checkout: la sonda li flagga ma non produce alcuna azione
  - Dove: memoria-squadra/*.md (80 stub <=470B su 124); sonda in cervello/chiusura-loop.mjs (--sonda, senza --accoda) invocata come informativa in cervello/giro.sh
  - Causa radice: bootstrap-quaderni crea un guscio per ogni agente indipendentemente dall'uso, e i 78 nuovi senior sono stati creati in massa senza un primo giro che li inneschi; la sonda diagnostica ma non ha soglia né azione (solo stampa, exit 0). Causa di sistema: la creazione di un senior non è legata al suo pri
  - Fix (🟡 da firmare): 🟡 (a) la sonda, oltre a stampare, accoda UNA proposta 'questi N quaderni sono fermi: ingaggia o archivia'; (b) spostare i senior mai usati in un ripostiglio finché non servono, così memoria-squadra riflette solo i reparti vivi.
  - Impatto crescita: basso · ↷ conferma della mappa del mattino


### chiusura-volano — voto 48/100 (attenzione)

- **[grave]** La metà «misura» del volano ④ non è mai partita: zero esperimenti, e il gate che dovrebbe forzarli è ingoiato da `| tail … || true`
  - Dove: cervello/giro.sh:290 · MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-miglioramento.json (esperimenti:[], meta_esperimenti tutto 0) · cervello/esperimenti-check.mjs:120-131
  - Causa radice: La riga è stata cablata col pattern «log informativo» (`| tail … || true`) invece del pattern «gate: _rc catturato → VINCOLO hard» che AR-081 ha imposto ad allocazione-check. Causa di sistema: manca un guardiano/convenzione che verifichi che i controlli del VOLANO siano cablati come gate (rc→vincolo
  - Fix (🟡 da firmare): In giro.sh sostituire la riga 290 col pattern-gate di allocazione: `_esp_out="$(node esperimenti-check.mjs 2>&1)"; _esp_rc=$?`; se rc≠0 costruire `ESPERIMENTI_VINCOLO="⛔ …apri ≥1 esperimento sull'ambito col divario benchmark più alto…"` e iniettarlo tra i VINCOLI (righe 401-446). Più forte ancora: a
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[minore]** 5 proposte di auto-riscrittura restano «proposta» per sempre anche se i loro difetti sono già chiusi (il sincronizzatore non le ritocca e non sa leggere i finding_id composti)
  - Dove: cervello/sincronizza-proposte.mjs:50 (guardia `if (!statoValido(prev))`) e :51 (`byId[p.finding_id]`) · auto-miglioramento.json (proposte_sync.aggiornate=0; 5 proposte stato=proposta con finding_id composti)
  - Causa radice: Duplice: (1) sincronizza-proposte è disegnato per riempire SOLO stati mancanti/invalidi (guardia `!statoValido`), quindi non transiziona mai una proposta valida quando il suo difetto si chiude — il loop ④→cantiere non si richiude; (2) lo schema (auto-coscienza.md) definisce `finding_id` come stringa
  - Fix (🟡 da firmare): In sincronizza-proposte.mjs: (a) rilassare la guardia così anche le proposte in stato «proposta» vengano rivalutate contro il cantiere; (b) `p.finding_id.split('/')` e marcare `implementata` se TUTTI i sotto-id sono `chiuso` (`firmata` se ≥1 `in-corso`). NOTA: il solo split senza (a) non basta — la 
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[grave]** Il decadimento e la promozione delle lezioni sono codice-fantasma: nessuno setta `stato:decaduta` né promuove le mature — 253 lezioni, 0 decadute, 44 mature mai promosse
  - Dove: cervello/apprendimento.md:42-45 (spec decadimento+promozione) vs NESSUN executor (grep assegnazione `stato=decaduta` sui .mjs/.claude → vuoto) · apprendimento.json (253 lezioni, decadute:0, 140 con evidenze=1, 44 mature non promosse, principi[]=3)
  - Causa radice: Il volano ha motorizzato la MISURA (tasso-lezioni.mjs) e la chiusura esperimenti (esperimenti-check.mjs) ma NON la manutenzione del ciclo di vita delle lezioni — lasciata come prosa nello spec e delegata al ciclo settimanale LLM, lo stesso anti-pattern «delegato all'LLM» che AR-051/AR-054 hanno già 
  - Fix (🟡 da firmare): Nuovo motore deterministico `cervello/manutenzione-lezioni.mjs` (ritmo settimanale, 🟡, gemello di `calibrazione.mjs scadute`): (a) abbassa confidenza alle lezioni non riconfermate da >28gg e marca `decaduta` sotto 0.3; (b) promuove a `principio` (e in principi[]) le 44 mature; (c) segnala i duplicat
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[grave]** `tasso_applicazione`=0.37 misura la MENZIONE, non l'applicazione: il segnale forte (`usi`) è morto (0/253), resta solo lo string-match dell'id in un blob che include l'artefatto di nascita della lezione
  - Dove: cervello/tasso-lezioni.mjs:129-146 (blob) e :175-187 (lezioneApplicata) · apprendimento.json (0/253 lezioni con `usi`) · comando `tasso-lezioni.mjs applica` mai invocato (grep in cervello/ e .claude/ → solo la sua doc, righe 19 e 152)
  - Causa radice: Si è costruito lo strumento forte (`applica`/`usi`) ma non lo si è cablato in NESSUN punto del ciclo dove una lezione viene davvero usata (sintesi AD, coda del giro): l'uso è delegato alla prosa dell'LLM e manca la forcing-function (gemella di chiusura-loop.mjs) che pretenda l'id-lezione nell'ATTO d
  - Fix (🟡 da firmare): Cablare `tasso-lezioni.mjs applica L-x "<ref-mossa>"` nel punto della coda/sintesi AD (giro-operativo/giro.sh) dove una mossa nasce da una lezione: (a) diventa la misura vera, (b) resta corroborazione. In più stringere (b) escludendo dal blob l'artefatto di nascita (il consegne/audit del giorno == l
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[minore]** La sonda mette in OR gli APERTI dentro `provaBusiness`: la prova di CHIUSURA del loop può reggere su previsioni/esperimenti solo APERTI, contro il suo stesso commento AR-063
  - Dove: cervello/sonda-volano.mjs:104-108 (provaBusiness) e :78,87 (commenti AR-013/AR-063)
  - Causa radice: La metrica di CHIUSURA e la metrica di ATTIVITÀ (ho aperto qualcosa) sono fuse nella stessa variabile `provaBusiness`, così l'invariante di chiusura può essere soddisfatta dall'atto di iniziare — non si è separato contrattualmente «prova di attività» da «prova di chiusura».
  - Fix (🟡 da firmare): In sonda-volano.mjs far dipendere `provaBusiness`/`loop_chiude` SOLO da chiusure reali (calibrazionePiena OR esperimentiMisurati OR difetto chiuso recente); spostare `previsioniAperteRecenti`/`esperimentiAperti` in un campo separato `prova_attivita` che NON entra in `loop_chiude`. Resta 🟡.
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[grave]** La calibrazione è alimentata da coppie atteso/reale non confrontabili (atteso 92-104 vs reale 0) e da retro-log (creato==chiuso): è «aggiornata» ma il predict→verifica quasi non gira
  - Dove: calibrazione.json (registro: 15/15 chiuse hanno creato==chiuso_il; 7 righe @finanza atteso 92-104 vs reale 0 tutte mancata; CAL-20260713182209-vendit scaduta reale=null) · cervello/calibrazione.mjs (cmdDaLoop righe 456-499, cmdScadute righe 338-351)
  - Causa radice: Il ponte chiusura-loop→`da-loop` accetta qualunque coppia numerica come «previsione» senza contratto sulla comparabilità grandezza/unità; e allo scadere `scadute` chiude muto senza forcing-function che pretenda il `reale`. Nessun contratto di comparabilità + nessuna richiesta d'esito prima della sca
  - Fix (🟡 da firmare): (a) In cmdDaLoop rifiutare/etichettare `non_confrontabile` le coppie con unità/tipo diverso (o reale=sensore-cieco), così non entrano nel punteggio; (b) in cmdScadute, oltre a `scaduta`, accodare 🟡 «misura l'esito reale di questa previsione» in AZIONI-IN-ATTESA. Resta 🟡.
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[minore]** Il «tick leggero» ribatte `apprendimento.json.aggiornato` ogni 10 minuti ricalcolando lo stesso tasso: il timestamp di freschezza del Pannello è un battito cron, non apprendimento reale
  - Dove: cervello/tick-auto-coscienza-leggero.mjs:73 (`runScript("tasso-lezioni.mjs")` senza --dry) → cervello/tasso-lezioni.mjs:233 (`appr.aggiornato = nowPiacenza()` nel ramo !DRY)
  - Causa radice: Il tick riusa il default in scrittura invece di `--dry`, e tasso-lezioni bumpa `aggiornato` come effetto collaterale del ricalcolo anche a contenuto invariato: si è confuso «ricalcolato» (già tracciato da `tasso_calcolato_il`) con «modificato» (`aggiornato`).
  - Fix (🟡 da firmare): Far ricalcolare il tick con `tasso-lezioni.mjs --dry` e usare `tasso_calcolato_il`/`tick_leggero_il` per il battito, lasciando `aggiornato` = ultima modifica REALE di contenuto (nuova lezione/promozione/decadimento). Resta 🟡.
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[minore]** Record-lezione malformati sballano i contatori meta del Pannello: 3 lezioni senza `stato`/`evidenze`, `principi[]`=3 disallineato da 4 lezioni `stato:principio`, ~135 ipotesi a evidenze=1 marcate `attiva`
  - Dove: apprendimento.json (L-2026-0707-01/02/03 senza stato/evidenze; principi[]=3 vs stato=principio=4 vs meta.promosse_a_principio=3; 140 lezioni evidenze=1 di cui 135 `attiva` e 5 `in-prova`)
  - Causa radice: Le lezioni sono scritte a mano dall'LLM nel JSON senza un validatore di contratto all'inserimento (obbligatorietà di stato/evidenze, enum, riconciliazione principi[]↔stato:principio). Manca il gemello di un `valida-contratti` per l'archivio lezioni, quindi i record entrano non normalizzati e restano
  - Fix (🟡 da firmare): Validatore-lezioni (può vivere nello stesso motore del difetto sul decadimento) che a ogni giro: assegna `in-prova` allo stato mancante, deriva `evidenze` mancante da `usi`/1, riconcilia `principi[]` con le lezioni `stato:principio` (e meta.promosse_a_principio), e declassa a `in-prova` le evidenze=
  - Impatto crescita: basso · ↷ conferma della mappa del mattino


### cadenza-esecuzione — voto 65/100 (attenzione)

- **[grave]** Il checkup del mattino vigila che il TIMER del giro sia acceso, non che il giro abbia prodotto output fresco: un giro che crasha lascia verifica-automazione verde
  - Dove: cervello/verifica-automazione.mjs:142-147 (check 'timer giro (battito 2h)') e :207-216 (solo i segnali che iniziano per 'errore' → ❌) · cervello/sonda-volano.mjs:113-115 (unica soglia sull'output: oreBrief<=6, ma warn a exit 0) · pannello/src/lib/battito.ts:87
  - Causa radice: Si monitora la LIVENESS dell'infrastruttura (l'unità systemd) invece del RISULTATO atteso (un briefing fresco entro N ore). La freschezza di cuore:ultimo_giro/ultimo-briefing non è mai stata trattata come un sensore-con-soglia-dura (a differenza degli occhi a 10 min); macchinaViva a 26h è tolleranza
  - Fix (🟡 da firmare): Aggiungere a verifica-automazione.mjs (o a una sentinella dedicata) un check che legge cuore:ultimo_giro e/o l'età di ultimo-briefing.json e va in ❌ oltre una soglia coerente con la veglia (es. > 3-4h nelle ore 06-22), distinguendo 'salto delta-gate corretto' (memoria-ad:ultimo_push fresco) da 'giro
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[minore]** Il meta-guardiano che dovrebbe scoprire i passi del giro morti in silenzio è cieco: interroga 'automazione.*' (punto) ma le chiavi sono 'automazione:' (due punti)
  - Dove: cervello/freschezza-segnali.mjs:35 (query `chiave=like.automazione.*`) vs :45 (strip `/^automazione:/`) · git-github.mjs:150-168 (stampSegnale scrive `automazione:${nome}`) · verifica-automazione.mjs:200 (query CORRETTA `like.automazione:*`) · wired giro.sh:31
  - Causa radice: I nuovi guardiani entrano nel giro senza un contratto verificato sulla chiave-segnale condivisa (punto vs due punti), e senza un mini-test d'integrazione che provi che un guardiano LEGGE davvero ciò che gli altri SCRIVONO su Supabase. Aggravante: l'esito è stato cablato come 'informativo, non gate' 
  - Fix (🟡 da firmare): Correggere freschezza-segnali.mjs:35 da `like.automazione.*` a `like.automazione:*` (due punti) e, nello stesso lavoro, far contare l'esito almeno come WARN visibile in Cabina invece di scartarlo con || true. Aggiungere un mini-test d'integrazione che scriva un segnale finto e verifichi che il meta-
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[minore]** Se il motore AI salta auto-analisi e apprendimento (passi 11-12), il giro esce 0 e lo skip resta solo in un echo su journald che nessuno legge
  - Dove: cervello/giro.sh:518-527 (guardia AR-014, GIRO_STEPS_OK=0) e :711-713 (segnale finale) · l'exit-code finale :741-755 NON considera GIRO_STEPS_OK
  - Causa radice: Gli avvisi di qualità del giro vivono solo nei log del processo, non nella memoria/segnali che Nicola vede. La guardia è stata pensata per 'non bloccare il push della memoria già scritta' (giusto) ma è finita a non-tracciare affatto → uno skip cronico dei passi di auto-coscienza è strutturalmente no
  - Fix (🟡 da firmare): Quando GIRO_STEPS_OK=0, oltre all'echo scrivere un segnale persistito (es. stampSegnale 'giro-passi' esito warn + N-skip-consecutivi) e/o aggiungere auto-analisi.json/apprendimento.json alla watch-list del meta-guardiano freschezza-segnali, così la Cabina mostra lo skip cronico. Facoltativo: dopo K 
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[grave]** ritmo.sh e monitora.sh pubblicano su main SENZA il cancello di coerenza/sanità/onestà che protegge giro.sh — la memoria che mente passa da un'altra porta
  - Dove: cervello/ritmo.sh:247-267 (add/commit/push, 0 gate coerenza/sanità/onestà) · cervello/monitora.sh:143-165 (push su main, 0 gate) · vs cervello/giro.sh:552-628 (gate AR-104/AR-021/AR-075: scan-segreti + onesta-check + coerenza-fatti + vault-sanita)
  - Causa radice: Il gate pre-push è stato scritto IN LINEA dentro giro.sh invece di essere estratto in una funzione/script condiviso. Le tre pipeline nascono come copia-incolla della logica git e poi divergono a ogni fix: non esiste un modulo unico 'pubblica-memoria-su-main' che TUTTI gli scrittori del ramo devono u
  - Fix (🟡 da firmare): Estrarre il cancello pre-push (scan-segreti + onesta-check + coerenza-fatti + vault-sanita, fail-closed) in un'unica funzione/script condiviso e farlo chiamare da giro.sh, ritmo.sh e monitora.sh prima di ogni push su main. Resta 🟡 da firmare.
  - Impatto crescita: medio · 🆕 **AR-127**

- **[minore]** autopilot.mjs è uno 'SCHEDULER' che nessuno schedula: dead-code che sembra vivo, con 6 voci-calendario scadute che nessuna sentinella nota
  - Dove: cervello/autopilot.mjs:1-24 (header 'SCHEDULER della Marketing Autopilot' + sub-comando `giro`) · cervello/calendario-editoriale.json (6 voci tutte 'programmato', date 24-30/6) · cervello/vps/ (nessun mycity-autopilot.timer/.service) · nessuna invocazione in g
  - Causa radice: Manca il principio 'ogni scheduler ha un trigger, oppure si ritira' e un guardiano sulle voci-calendario scadute in stato 'programmato'. autopilot.mjs è stato costruito come strumento standalone da lanciare a mano, ma la macchina gira headless sul VPS (la mano non c'è) e il giro AI ne ha assorbito l
  - Fix (🟡 da firmare): Decisione di Nicola: (a) CABLARE autopilot.mjs a una cadenza (con i 🔴 SEMPRE in AZIONI-IN-ATTESA, mai auto-pubblicati) e ripulire il calendario dai segnaposto demo, oppure (b) RITIRARLO (rimuovere autopilot.mjs + calendario-editoriale.json) se il giro AI lo ha superato. In entrambi i casi aggiungere
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[minore]** Nessun lucchetto 'un solo giro alla volta': il giro da timer e un giro dalla coda worker possono girare insieme sullo stesso repo
  - Dove: cervello/giro.sh (unico lock è `.git/mycity-sync.lock`, righe 76 e 629 — solo attorno a git; fase AI+scrittura 458-531 non protetta) · cervello/worker.sh:1114-1117 (export GIRO_FORCE=1; lancia `bash giro.sh` come figlio del worker) · cervello/vps/mycity-giro.s
  - Causa radice: Due schedulatori dello stesso lavoro (timer + coda worker) senza un lucchetto di esecuzione condiviso: il flock esistente serializza solo git, non la fase AI; il claim atomico della coda protegge solo da due worker sullo stesso item, non dal timer che è fuori dalla coda.
  - Fix (🟡 da firmare): Aggiungere un lock di esecuzione dedicato al giro (es. flock non-bloccante su `cervello/vps/.giro-esecuzione.lock` acquisito all'inizio di giro.sh e tenuto per tutta la fase AI+scrittura): se un giro è già in corso, il secondo esce subito con un messaggio invece di girare in parallelo. Resta 🟡 da fi
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[minore]** mycity-monitora.timer scatta in ora di sistema (UTC sul VPS), non in ora di Piacenza: manca 'Europe/Rome' in OnCalendar — il fix già applicato agli altri timer non è stato propagato
  - Dove: cervello/vps/mycity-monitora.timer:6 (`OnCalendar=*-*-* 06:30:00`, senza fuso) · confronto verificato: mycity-giro.timer ha `06..22/2:20:00 Europe/Rome`, mycity-ritmo-mattino.timer ha `06:00:00 Europe/Rome` e documenta esplicitamente il fix · mycity-monitora.s
  - Causa radice: Nessun controllo automatico che ogni cervello/vps/*.timer abbia il fuso esplicito in OnCalendar: i timer si correggono file per file, a mano, e una correzione nota resta non propagata a un'unità.
  - Fix (🟡 da firmare): Portare OnCalendar di mycity-monitora.timer a `*-*-* 06:30:00 Europe/Rome` e aggiungere un mini-check (nel giro o in verifica-automazione) che verifichi che ogni .timer abbia il fuso esplicito in OnCalendar. Resta 🟡 da firmare.
  - Impatto crescita: basso · ↷ conferma della mappa del mattino


### calibrazione-onesta — voto 44/100 (attenzione)

- **[grave]** L'autonomia si guadagna con l'auto-consuntivo: il ponte da-loop conia punti che contano nel punteggio partendo dall'atteso→reale dichiarato dallo stesso reparto, e il sensore 'n/d' scavalca il cancello anti-buio AR-061
  - Dove: cervello/calibrazione.mjs:456-499 (cmdDaLoop, fonte hardcoded riga 475), :82-94 (sensoreStatoPerFonte → 'n/d' per 'chiusura-loop ESITO'), :168-186 (ricalcolaReparti scarta solo sensore_stato==='cieco', riga 173), :280-299 (i gate AR-062/AR-061 esistono SOLO in
  - Causa radice: Perché la fonte non è validata in da-loop? Il ponte è nato per non perdere gli ESITI dei quaderni (AR-009). Perché gli ESITI valgono come previsioni? AR-009 forza a registrare atteso→reale dopo OGNI lavoro e il ponte li converte tutti. Perché nessuno distingue 'previsione sul mondo dichiarata prima'
  - Fix (🟡 da firmare): 🟡 (firma Nicola) Le voci da-loop ricevono un flag conta_autonomia:false (come 'banale'): restano informative nel registro ma NON entrano in ricalcolaReparti. Per contare nell'autonomia una previsione deve essere aperta con 'prevedi' PRIMA del lavoro e chiusa con 'esito' + fonte tra le fontiAmmesse d
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[grave]** Chi non misura non perde mai: le previsioni scadute spariscono dal punteggio e l'autonomia guadagnata non decade — over-confidence per omissione
  - Dove: cervello/calibrazione.mjs:338-351 (cmdScadute, riga 350 'le scadute NON contano'), :165-205 (ricalcolaReparti conta solo azzeccata/mancata, nessun filtro data né campo scadute) · MyCity-Vault/90-Memoria-AI/auto-coscienza/calibrazione.json:95-108 (@vendite CAL-
  - Causa radice: Perché le scadute non contano? Scelta prudente per non punire previsioni non misurabili. Perché non c'è nemmeno visibilità? per_reparto fu disegnato con 3 campi (previsioni/azzeccate/punteggio) e AR-053 ha aggiunto lo stato 'scaduta' senza toccare l'aggregato. Perché l'autonomia non decade? ricalcol
  - Fix (🟡 da firmare): 🟡 (firma Nicola) In ricalcolaReparti: contare le 'scadute' per reparto, mostrarle in per_reparto/report/Pannello, e far pesare il tasso di scadenza sull'autonomia (es. tetto 'media' se scadute/(chiuse+scadute) > 1/3). Aggiungere una finestra mobile (60-90 giorni) o un decadimento pesato per età, cos
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[grave]** La classifica di fiducia è corrotta dal rumore: la stessa sentinella registrata 7 volte affonda @finanza a 0/7, e per simmetria una condizione favorevole ripetuta potrebbe coniare 8 'azzeccate' fotocopia = autonomia alta senza 8 prove indipendenti
  - Dove: MyCity-Vault/90-Memoria-AI/auto-coscienza/calibrazione.json:125-208 e :278-330 (7 voci 'sentinella cassa_sconosciuta N giri' @finanza) e :46-52 (@finanza per_reparto 0/7) · cervello/calibrazione.mjs:449-454 (parseNumeroLoop estrae il 1° numero da testo libero)
  - Causa radice: Perché 7 doppioni? Il gate PZ-008 di giro.sh (chiusura-loop --gate) OBBLIGA una riga ESITO per ogni FATTO in Sala a ogni giro, e la sentinella scatta a ogni giro. Perché il ponte li accetta tutti? cmdDaLoop non ha dedup né rate-limit. Perché atteso/reale sono spazzatura? Il ponte estrae il 1° numero
  - Fix (🟡 da firmare): 🟡 (firma Nicola) In cmdDaLoop: dedup su (reparto + azione normalizzata) dentro una finestra (es. 7 giorni) — la ripetizione aggiorna la voce esistente invece di crearne una nuova; scartare (o marcare conta_autonomia:false) le coppie atteso/reale dove la metrica è un contatore di giri/occorrenze e no
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[grave]** Il segnale onesto (lower_bound di Wilson) è calcolato ma nascosto: al Pannello Nicola vede la barra verde del punteggio grezzo (1.0), non la confidenza reale (0.38) — over-confidence proprio nella riga che dovrebbe smontarla
  - Dove: cervello/calibrazione.mjs:189-202 (calcola e salva lower_bound) · cervello/auto-coscienza.md:150 (schema doc senza lower_bound/banale/sensore_stato) · pannello/src/components/AutoCoscienza.tsx:157 (type Calibrazione senza lower_bound), :729 (barra(r.punteggio)
  - Causa radice: Perché il Pannello non mostra lower_bound? Il type e la UI sono stati scritti prima di AR-065 e mai aggiornati. Perché nessuno se n'è accorto? Lo schema in auto-coscienza.md (la fonte per il Pannello) è rimasto indietro di generazioni di campi (manca lower_bound, banale, sensore_stato, fonte, causa)
  - Fix (🟡 da firmare): 🟡 (firma Nicola) Aggiornare lo schema in auto-coscienza.md:150 coi campi reali (lower_bound, banale, sensore_stato, causa...) e il type Calibrazione nel Pannello; disegnare la barra su lower_bound (o mostrare entrambi: punteggio grezzo + confidenza), così la barra verde piena scompare quando il camp
  - Impatto crescita: medio · 🆕 **AR-131**

- **[grave]** Il punteggio 1.0 di @customer-success (in testa alla classifica, barra verde piena a Nicola) è coniato da UNA previsione degenere 0==0 che le regole della macchina stessa vogliono esclusa
  - Dove: MyCity-Vault/90-Memoria-AI/auto-coscienza/calibrazione.json:6-12 (per_reparto customer-success) e :261-276 (voce CAL-20260714091311-custom, campo 'banale' ASSENTE) · cervello/calibrazione.mjs:119-125 (isPrevisioneBanale, riga 122: atteso===0 && reale===0 → ban
  - Causa radice: Perché il campo manca? La voce precede il fix AR-044 sul ponte. Perché non è stata sanata? cmdRipara fu scritto per AR-061 (sensore_stato) e nessuno estese il backfill quando AR-044 aggiunse un secondo campo che cambia il punteggio. Perché ricalcolaReparti si fida di un flag salvato invece di ricalc
  - Fix (🟡 da firmare): 🟡 (firma Nicola) Estendere cmdRipara a ricalcolare isPrevisioneBanale() su OGNI voce chiusa priva del campo banale (sanatoria retroattiva), ed estendere cmdValida a fallire (exit 1) se una voce chiusa non ha banale valorizzato. giro.sh già chiama ripara+valida a ogni giro, quindi la sanatoria divent
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[minore]** Il freno anti-buio (cappa l'autonomia a 'media' con ≥2/3 sensori ciechi) usa un rapporto rotto: conta i ciechi su 10 sensori ma divide per meta.sensori_totali=5, e la mappa fonte→sensore per PostHog punta a una chiave inesistente
  - Dove: cervello/calibrazione.mjs:71-79 (statoSensori: ciechi su Object.keys(sensori), tot=meta.sensori_totali), :84-88 (mappa PostHog:['posthog']), :200-201 (cappa autonomia se quotaCiechiAlta) · MyCity-Vault/90-Memoria-AI/auto-coscienza/sensori-cecita.json:79-88 (me
  - Causa radice: Perché numeratore e denominatore divergono? statoSensori legge tot da meta (un sottoinsieme 'sensori-dati') ma conta i ciechi su tutte le chiavi (inclusi canali non-dati e non_configurati). Perché la mappa PostHog è rotta? Un rename del sensore (posthog→posthog_api) non è stato propagato nella mappa
  - Fix (🟡 da firmare): 🟡 (firma Nicola) In statoSensori contare ciechi e totale sullo STESSO insieme (escludere stato==='non_configurato' e i canali non-dati, oppure leggere entrambi da meta aggiungendo meta.sensori_ciechi in verifica-sensori.mjs); correggere la mappa a ['posthog_api']; aggiungere in cmdValida un check ch
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[minore]** Manca il pezzo centrale della dimensione: nessun campo per dichiarare fiducia e punti ciechi al momento della previsione — l'over-confidence non è nemmeno misurabile
  - Dove: cervello/calibrazione.mjs:212-256 (cmdPrevedi, schema entry senza confidenza/punti-ciechi) e :236-250 (entry) · cervello/auto-coscienza.md:150 (schema calibrazione.json)
  - Causa radice: Perché non c'è il campo? Il motore U3 è nato minimale (atteso/reale/tolleranza). Perché nessuno l'ha aggiunto? Tutti i fix successivi (AR-040/044/053/061/062/065) hanno rattoppato la MISURA dell'esito, mai la DICHIARAZIONE della previsione. Causa di sistema: la macchina ha investito solo nell'accura
  - Fix (🟡 da firmare): 🟡 (firma Nicola) Nuovo pezzo: aggiungere a cmdPrevedi i campi --confidenza=(0..1) e --punti-ciechi="..." (almeno uno obbligatorio per le previsioni che contano nell'autonomia); in ricalcolaReparti calcolare un indice di over-confidence per reparto (confidenza media dichiarata − tasso azzeccate reale
  - Impatto crescita: basso · ↷ conferma della mappa del mattino


### copertura-cieca — voto 44/100 (attenzione)

- **[grave]** 81 senior su 120 non possiedono nessun KPI: il guardiano lo rileva ed esce 1, ma il giro lo silenzia con «|| true»
  - Dove: cervello/giro.sh:180 (node agent-registry-check.mjs … | tail -4 || true) · cervello/agent-registry-check.mjs:202 (derogheKpi = Set(["ad"])), :203 (senzaKpi), :300 (process.exit(driftTotale>0?1:0)) · MyCity-Vault/05-Soldi-Rischi/OKR-Squadra.md
  - Causa radice: ①81 senza KPI perché l'espansione dei 78 senior ha aggiunto i ruoli a CLAUDE.md ma nessuno ha aggiunto le righe a OKR-Squadra.md. ②OKR-Squadra si riscrive a mano in prosa, nessun processo lo genera dai file-agente. ③Il guardiano che rileva lo scarto (exit 1) è invocato con «|| true», non promosso a 
  - Fix (🟡 da firmare): 🟡 (a) In agent-registry-check.mjs allargare `derogheKpi` ai ruoli puramente advisory/professionali (firma umana 🔴) con motivazione, così lo scarto misura SOLO chi deve davvero un numero; (b) in giro.sh:180 catturare `rc=$?` e, come per AR-081, iniettare un VINCOLO hard al motore che gli chiede di ag
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[minore]** La radiografia di sé descrive una macchina da «42 agenti» mentre i file reali sono 120: numero congelato in spec, contratto e sentinella
  - Dove: .claude/workflows/auto-radiografia.js:58 («coerenza dei 42 agenti») · cervello/auto-radiografia.md:4,26 · cervello/auto-coscienza.md:10 e :113 (contratto «agenti_totali":42») · cervello/sentinelle.md:93 («riallinea … ai 42 file reali»)
  - Causa radice: ①«42» fu scritto quando gli agenti erano 42 e mai aggiornato all'espansione a 120. ②È duplicato come costante-testo in 6+ punti invece di derivarlo dalla fonte unica (il conteggio dei file). ③Nessun guardiano confronta i «N agenti» citati in doc/spec/contratto col conteggio reale (agent-registry con
  - Fix (🟡 da firmare): 🟡 Sostituire «42» con «120» (o meglio un riferimento dinamico «i file in .claude/agents/») in workflow/spec/contratto/sentinella, ed estendere agent-registry-check o coerenza-fatti a sorvegliare anche i conteggi-agente citati nei file-macchina (auto-radiografia.md, auto-coscienza.md, sentinelle.md),
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[grave]** Il registro rischi sorveglia «ALTA senza owner» ma NON «ALTA senza sentinella», e il guardiano è silenziato: il rischio rider (Direttiva UE 2024/2831) è ALTA e non ha nessun sensore
  - Dove: cervello/coerenza-rischi.mjs:51-61 (controlla solo altaSenzaOwner) · cervello/giro.sh:303 (coerenza-rischi … | tail -4 || true) · MyCity-Vault/05-Soldi-Rischi/REGISTRO-RISCHI.json (N4: gravità alta, stato aperto, sentinella:"")
  - Causa radice: ①N4-ALTA resta senza sensore non segnalato perché coerenza-rischi controlla solo l'owner. ②Nato per il caso «rischio orfano», mai esteso a «senza sentinella». ③Anche se lo rilevasse, in giro.sh:303 è silenziato con «|| true» — nessuna pressione a chiuderlo, a differenza del gemello promosso a VINCOL
  - Fix (🟡 da firmare): 🟡 (a) Estendere coerenza-rischi.mjs con un check `alta_senza_sentinella` (l'invariante è già dichiarato nel `_cosa_e` del registro); (b) allineare giro.sh:303 al gemello: catturare `rc=$?` e trasformarlo in VINCOLO hard; (c) per N4, decidere con Nicola una sentinella praticabile (es. alert su cambio
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[grave]** La dimensione «copertura-cieca» è solo-LLM: manca una mappa-copertura deterministica (dominio × sensore/sentinella/KPI/owner) che accumuli i buchi e li porti a zero
  - Dove: .claude/workflows/auto-radiografia.js:65 (dim copertura-cieca, nessuno script) e :140-142 (punti_ciechi: «Verifiche solo-LLM senza reviewer deterministico») · nessun file cervello/mappa-copertura.mjs (verificato assente)
  - Causa radice: ①copertura-cieca è fragile perché non ha un motore-script. ②È «meta» e sembrava non riducibile a regole. ③Nessuno ha modellato i domini di business come tabella con celle {sensore?, sentinella?, KPI/owner?, agente?}. ④Manca una fonte unica dei «domini che l'azienda deve presidiare» (esistono registr
  - Fix (🟡 da firmare): 🟡 Creare cervello/mappa-copertura.mjs: inventario deterministico dei domini-chiave (ordini, payout, dispute, recensioni, negozi, carrelli, cassa, costo-AI, scadenze fiscali/contrattuali/assicurative, rider-safety, breach GDPR, uptime sito/Pannello…) che per ognuno verifica presenza di sensore/sentin
  - Impatto crescita: medio · 🆕 **AR-132**

- **[grave]** Nessun sensore né sentinella per le contestazioni carta (dispute/chargeback) da Stripe: soldi con scadenza rigida che si perdono per decorrenza termini
  - Dove: cervello/sentinelle.md (0 righe dispute/chargeback — grep exit 1) · cervello/sentinella-dati.mjs (0 occorrenze dispute — grep exit 1) · .claude/agents/dispute.md (agente esistente ma senza sensore che lo attivi) · cervello/radar.md:140 (Stripe dispute solo com
  - Causa radice: ①Nessun sensore dispute perché le sentinelle sono nate su ordini/payout/recensioni/carrelli, non sugli eventi Stripe di contestazione. ②Stripe non è ancora collegato, quindi il sensore non è stato scritto. ③Non c'è un processo che, quando si aggiunge un agente per un evento 🔴 a scadenza (dispute), o
  - Fix (🟡 da firmare): 🟡 (a) Aggiungere subito una riga-sentinella «Contestazione carta / dispute Stripe aperta → 🔴 accoda: raccolta prove + risposta entro la scadenza» in sentinelle.md come checklist attiva da ora; (b) quando Stripe verrà collegato, implementare il sensore su eventi dispute in sentinella-dati.mjs (evento
  - Impatto crescita: medio · 🆕 **AR-128**

- **[minore]** Lo scadenzario (fiscale/contributivo/contrattuale/assicurativo) ha agente e KIT ma nessun calendario-dati vivo né sentinella: le scadenze si perdono in silenzio
  - Dove: .claude/agents/scadenzario.md (agente) · MyCity-Vault/07-Agenti/kit/scadenzario-KIT.md (kit) · nessun file *scadenz*.json nel vault (find → solo il KIT.md) · cervello/sentinelle.md (0 righe scadenza fiscale — grep exit 1) · cervello/sentinella-dati.mjs («scade
  - Causa radice: ①Nessuna sentinella scadenze perché non esiste il dato-calendario da cui leggere. ②Il dato non esiste perché lo scadenzario è stato creato come agente+prosa, senza materializzare una struttura-dati versionata delle date. ③L'espansione dei senior ha aggiunto ruoli-mansionario senza abbinare a ognuno 
  - Fix (🟡 da firmare): 🟡 Creare MyCity-Vault/…/scadenzario.json (data, cosa, categoria, owner, anticipo-avviso) e una sentinella «scadenza entro X giorni → accoda promemoria/escalation», alimentata dal giro; popolarlo con le scadenze note. Resta 🟡 per merito fiscale (commercialista) sulle singole date.
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[grave]** Il Pannello — la superficie con cui Nicola vede tutto e firma i 🔴 — è fuori dalle 12 dimensioni della radiografia di sé; il suo audit non è schedulato e la verifica-verità dei numeri mostrati è orfana
  - Dove: .claude/workflows/auto-radiografia.js:57-70 (le 12 DIMS non includono il Pannello) · .claude/workflows/audit-pannello.js (esiste ma nessun timer in cervello/vps/) · cervello/verify-marge.sh + cervello/verify-marge-pannello.mjs (orfani: zero runner li invoca)
  - Causa radice: ①Il Pannello è fuori dalla radiografia perché le 12 dimensioni sono modellate sul «cervello» (agenti/processi), non sulla «faccia». ②La faccia è percepita come app separata, benché nello stesso repo e superficie di ogni decisione. ③verify-marge è orfano perché scritto ma mai agganciato a un runner. 
  - Fix (🟡 da firmare): 🟡 (a) Aggiungere una 13ª dimensione «salute-pannello / superficie decisionale» ad auto-radiografia (numeri mostrati = verità, stati async, azioni 🔴 correttamente etichettate); (b) agganciare verify-marge.sh al preambolo del giro (come gli altri guardiani) così la verità dei margini mostrati è verifi
  - Impatto crescita: medio · 🆕 **AR-133**


### guardrail-semaforo — voto 39/100 (critico)

- **[bloccante]** L'autopilot in LIVE si fida del colore scritto a mano nel calendario: una email a un cliente marcata 'verde' parte da sola
  - Dove: cervello/autopilot.mjs:124 e 133-142 (gate solo su voce.colore, nessun import di consenso-azione) + publishers/email.mjs:22-29 (coloreMinimo definita ma mai chiamata; facebook/instagram/gbp/telegram senza coloreMinimo; index.mjs importa solo le pubblica())
  - Causa radice: Il freno AR-074 è nato come funzione dentro un publisher (email.mjs) e mai collegato allo scheduler; AR-072/073 hanno indurito solo il confronto sul colore auto-dichiarato, AR-074 doveva derivarlo dal canale ma è rimasto scollegato, senza un test end-to-end 'voce verde con destinatario reale ⇒ accod
  - Fix (🟡 da firmare): In autopilot.mjs, prima del gate, calcolare il colore EFFETTIVO = max(coloreMinimo(voce) del canale, voce.colore) e dotare tutti e 5 i publisher di coloreMinimo (facebook/instagram/gbp = ≥🟡 sempre; email verso ≠EMAIL_TEST_TO = 🔴). Far passare l'autopilot LIVE dallo stesso cancello consenso-azione (P
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[grave]** La 'firma di Nicola' che sblocca l'invio reale non la scrive mai chi approva: la scrive l'AI che esegue
  - Dove: cervello/consenso-azione.mjs:143-150 (approvata legge solo il markdown) ↔ pannello/src/app/api/approva/route.ts:34 (crea solo creaLavoro, nessun marcatore) ↔ prompt in mani.ts:77 / worker.sh:1091
  - Causa radice: La firma è un testo Markdown, ma l'evento di approvazione vive in Supabase (lavoro creato dal Pannello): due case della verità 'approvato' non sincronizzate. AR-103 ha aggiunto il gate sull'esecutore (consensoInvio verifica solo rest/v1/impostazioni per la pausa) senza collegare la SORGENTE di appro
  - Fix (🟡 da firmare): Legare consenso-azione all'evento reale: consenso-azione verifica l'approvazione contro la tabella Supabase (decisioni/lavori) legata all'AZIONE_ID — oppure il Pannello /api/approva stampa nel blocco un marcatore firmato {approvato:#CODE} e passa AZIONE_ID all'esecutore. Test end-to-end: 'azione app
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[minore]** Il diario dice che esiste un guardiano-semaforo che classifica il colore e blocca il rosso: nel repo non c'è, e nessun classificatore lo rimpiazza
  - Dove: MyCity-Vault/90-Memoria-AI/DECISIONI.md:310 (+ file mancante cervello/guardrail-semaforo.mjs; NICOLA_FIRMA assente da tutto il codice)
  - Causa radice: Un fix registrato 'fatto' è sparito senza traccia di rimozione; DECISIONI è append-only e nessuna decisione ne registra la supersessione; la macchina segna 'ESEGUITO in repo' sulla parola dell'LLM senza prova machine-checkable dell'artefatto. Causa di sistema: manca un cancello che verifichi 'ciò ch
  - Fix (🟡 da firmare): ① Appendere in DECISIONI una nota che guardrail-semaforo.mjs è stato superato da AR-103 (storia, non riscrittura). ② Costruire il pezzo mancante: un classificatore di colore da-contenuto (cervello/classifica-colore.mjs) che esegui-azione/autopilot consultano per derivare 🔴/🟡/🟢 e bloccare il rosso se
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[grave]** Lo STOP di budget è codice pronto ma senza sensore di spesa: quando gli ads bruciano soldi non scatterà
  - Dove: cervello/sentinella-budget.mjs:59,65,67 (+ MyCity-Vault/05-Soldi-Rischi/budget-reparti.json: tutti i 9 reparti budget/speso/kpi_reso = 0)
  - Causa radice: Lo STOP legge un file statico; il sensore di spesa (Stripe/ads→speso) non è mai stato costruito; AR-077 ha reso la capacità 'onesta' (dichiara 'sensore non attivo') ma onestà≠funzionante; la parte ROI (kpi_reso) è raccolta ma non cablata nella soglia. Causa di sistema: si costruisce il consumatore (
  - Fix (🟡 da firmare): Costruire cervello/sensore-spesa.mjs che popola 'speso' per reparto da Stripe/ads (sola lettura) e usare kpi_reso nella soglia (STOP anche per 'brucia senza rendere': speso alto + ROI basso, non solo tetto raggiunto). Fino ad allora, tenere l'etichetta onesta 'sensore non attivo' (già presente).
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[grave]** Le regole d'onestà si controllano solo sulla memoria interna e come avviso, non sui post e le email ai clienti
  - Dove: cervello/giro.sh:571-582 (onesta solo su memoria, WARN) — assente in cervello/esegui-azione.mjs e cervello/autopilot.mjs
  - Causa radice: onesta-check è stato agganciato al push-memoria (AR-075) e non al publish; il percorso mani (autopilot/esegui-azione) è nato prima e non è stato ricablato; il gate è pensato come check pre-commit della memoria, non come cancello del contenuto in uscita. Causa di sistema: i guardrail di verità sono a
  - Fix (🟡 da firmare): Rendere onesta-check un cancello BLOCCANTE nel percorso mani: autopilot.mjs lo esegue sul testo di ogni voce prima di pubblicare/accodare; esegui-azione.mjs lo esegue sul corpo di email/notifiche marketing verso clienti. ❌ → non parte.
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[minore]** In pausa l'autopilot pubblica lo stesso: il kill-switch non arriva alla corsia 'verde'
  - Dove: cervello/autopilot.mjs:133-142 (corsia verde, nessun controllo PAUSA; nessun import di consenso-azione)
  - Causa radice: autopilot è nato come scheduler separato con un proprio switch (AUTOPILOT_LIVE) prima del cancello unico consenso-azione (AR-103); il consolidamento dei gate ha toccato esegui-azione/marketplace ma non autopilot. Causa di sistema: due esecutori di mani con due catene di sicurezza diverse; un fix di 
  - Fix (🟡 da firmare): Far consultare a autopilot.mjs pausaAttiva() (importando consenso-azione.mjs) prima di ogni pubblicazione, anche sul verde; idealmente unificare l'autopilot sotto lo stesso cancello consenso-azione degli altri esecutori.
  - Impatto crescita: basso · ↷ conferma della mappa del mattino


### allineamento-northstar — voto 68/100 (attenzione)

- **[grave]** La sentinella 'Dispersione dalla North Star' è solo prosa: nessun codice la esegue, mentre la sua condizione è vera da ~22 giorni
  - Dove: cervello/sentinelle.md:94 (definizione) + righe 100-101 (disclaimer 'le altre restano checklist') · assente in cervello/sentinella-dati.mjs e sentinella-lavori.mjs (grep 'dispersione'/'north star' = vuoto in tutti gli .mjs/.sh)
  - Causa radice: 1) La coda cresce di lavoro-macchina mentre ordini=0. 2) Nessun freno rialloca l'effort. 3) La sentinella dispersione non fa STOP. 4) Non è codice, è una riga di checklist affidata all'LLM. 5) Il modello 'sentinelle' cabla poche deterministiche e lascia la dispersione-NorthStar nel gruppo 'checklist
  - Fix (🟡 da firmare): Nuovo guardiano cervello/dispersione-northstar-check.mjs (sola lettura): quando north-star-check è in stallo (pagati/consegnati=0) da ≥3 giri, misura il rapporto coda 'macchina vs business' e FALLISCE (rc≠0); giro.sh lo promuove a VINCOLO HARD 'STOP nuovi asset non-North-Star, taglia il volume non i
  - Impatto crescita: alto · ↷ conferma della mappa del mattino

- **[grave]** Il giro operativo (flotta senior) semina i money-engine con un negozio SCARTATO (Casa Linda) e un ordine MORTO (#16 zombie) come focus primario
  - Dove: .claude/workflows/giro-operativo.js:42 (vendite → 'Casa Linda payout-ready') e :46 (operations → 'sbloccare l'ordine zombie €19,05')
  - Causa radice: 1) Il workflow ripropone entità superate. 2) Le stringhe focus sono hardcoded nel .js. 3) Non aggiornate quando faro e stato-ordine sono cambiati (3/7). 4) La propagazione AR-102 (coerenza-fatti.mjs) non le vede. 5) VERIFICATO: coerenza-fatti.mjs:44 RADICI_SCANSIONE = ['MyCity-Vault','consegne','cre
  - Fix (🟡 da firmare): (a) Correggere i due focus in giro-operativo.js: 'Casa Linda payout-ready' → 'Pane Quotidiano (faro, payout da attivare)'; 'sbloccare l'ordine zombie €19,05' → 'far NASCERE ex-novo il 1° ordine reale su PQ'. (b) Estendere RADICI_SCANSIONE di coerenza-fatti.mjs a '.claude/workflows' (o aggiungere i w
  - Impatto crescita: alto · 🆕 **AR-126**

- **[minore]** La North Star non ha UNA definizione: 4 file la dicono diversa e il GLOSSARIO (fonte unica) non la contiene affatto
  - Dove: MyCity-Vault/07-Agenti/GLOSSARIO-KPI.md (voce North Star ASSENTE, grep confermato) · OKR-Squadra.md:15 ('ordini consegnati/sett') · cervello/north-star-check.mjs:49 ('ordini_pagati ← la vera stella polare') · .claude/workflows/giro-operativo.js:47 ('North Star
  - Causa radice: 1) Definizioni divergenti nei file. 2) Ognuno ha scritto la sua. 3) Il glossario non la contiene. 4) VERIFICATO: il glossario è rimasto 'seed v1 da confermare' (dal 27/6) mai consolidato. 5) Nessun owner ha chiuso il glossario e nessun guardiano verifica che i file CITINO la definizione canonica inv
  - Fix (🟡 da firmare): Nicola sceglie LA definizione (proposta AD: 'ordine pagato E consegnato / settimana', con margine come metrica-faro affiancata); si aggiunge la voce 'North Star / stella polare' al GLOSSARIO-KPI con la formula firmata; OKR, north-star-check e giro-operativo CITANO quella riga invece di ridefinire. 🟡
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[minore]** north-star-check dichiara il MARGINE 'senza fonte deterministica' mentre bilancio-vivo lo calcola in modo deterministico nello stesso giro
  - Dove: cervello/north-star-check.mjs:44 (margine = {valore:null, fonte:null}, 'manca una fonte deterministica → NON inventiamo') vs cervello/bilancio-vivo.mjs:46-52 (margine = commissione 12% documentata × ordini) · entrambi lanciati nello stesso giro (giro.sh:323 e 
  - Causa radice: 1) Due letture del margine. 2) Due script separati lo trattano in modo opposto. 3) north-star-check è nato senza consumare bilancio-vivo (o viceversa). 4) Non esiste un unico modulo 'unit economics' che entrambi importano. 5) Le metriche-faro sono calcolate in silos-script non condivisi. Causa di si
  - Fix (🟡 da firmare): north-star-check.mjs importa il margine da bilancio-vivo.mjs (o entrambi da un cervello/unit-economics.mjs comune) così la North Star mostra il margine realizzato con la sua fonte, coerente in tutta la macchina. 🟡 firma.
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[minore]** Gli OKR di reparto (unico aggancio silo→North Star) sono scaduti da ~3 settimane; la review del venerdì li misura contro target morti
  - Dove: MyCity-Vault/05-Soldi-Rischi/OKR-Squadra.md:4 (aggiornato: 2026-06-24), :13 ('Target fase 1, primi 14 gg'), :15 ('1° ordine reale entro sab 27/6'), :56 (regola ROI/STOP) + cervello/ritmo.md:89 (review = 'target (OKR-Squadra) vs reale')
  - Causa radice: 1) Target scaduti. 2) Nessuno li rinnova al cambio di fase. 3) Il rinnovo OKR non è una cadenza cablata (la review li LEGGE, non li RI-DATA). 4) Non c'è owner di aggiornamento né guardiano di freschezza sugli OKR. Causa di sistema: gli OKR sono un documento statico trattato come vivo, senza forcing-
  - Fix (🟡 da firmare): (a) La review del venerdì RI-DATA gli OKR alla fase corrente (nuovo target + data). (b) Sentinella 'OKR scaduti' (data-target < oggi) che accoda il refresh. (c) Includere i reparti-macchina (tech/frontend/prompt-engineer) con un KPI di ritorno, non solo cash-budget. 🟡 firma.
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[minore]** Il guardiano North Star esiste ma è inerte: gira informativo (|| true), lo stallo di 22 giorni non escala nulla
  - Dove: cervello/giro.sh:323 ('node north-star-check.mjs 2>&1 | tail -6 || true') + commento giro.sh:~320 ('NON sono gate (|| true) ... trasformarli in gate hard è un passo successivo (🟡)') · cervello/north-star-check.mjs:59,82 (exit 1 in stallo)
  - Causa radice: 1) Exit code ingoiato. 2) Lanciato come informativo. 3) 'gate hard = passo successivo' (giro.sh:~320) mai fatto. 4) La promozione informativo→gate non ha owner né scadenza. Causa di sistema: i guardiani nascono informativi e senza un cantiere che ne forzi la promozione restano decorativi indefinitam
  - Fix (🟡 da firmare): Collegare l'exit di north-star-check al nuovo sensore dispersione (Finding 1): stallo ≥N giri → almeno un AVVISO a Nicola (non uno STOP cieco; sotto budget scarso taglia il volume, non la verità). Togliere il '|| true' silenzioso a favore di un log-segnale tracciato. 🟡 firma.
  - Impatto crescita: medio · ↷ conferma della mappa del mattino


### efficienza-costo — voto 68/100 (attenzione)

- **[grave]** Nessun tetto di spesa funziona: il contatore token è strutturalmente a 0 e il guardiano si autocertifica «risolto» per presenza-di-codice
  - Dove: cervello/costo-ai.mjs:112 (le voci --stima NON alzano token_totali) · cervello/giro.sh:380 (GATE-BUDGET legge .oggi.token_totali) · cervello/letargo.mjs:45 (quota_ai_pct = token_totali/soglia) · cervello/metabolismo.mjs:52 (pct_soglia = token_totali/soglia) · 
  - Causa radice: ① Perché il freno non scatta? token_totali resta 0. ② Perché 0? Tutte le voci sono --stima e le stime non alzano token_totali (AR-043, costo-ai.mjs:104-115). ③ Perché nessuno cattura l'usage reale? Non viene letto dagli eventi result dello stream-json che la CLI già emette; ai_stima_token è solo una
  - Fix (🟡 da firmare): 🟡 (a) catturare l'usage reale dagli eventi result dello stream-json in UN punto solo (motore-ai.sh) e registrarlo senza --stima; (b) finché non c'è la misura reale, far leggere ai gate max(token_totali, token_stimati) o sessione_rolling (che già include le stime per onestà); (c) aggiungere un test b
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[minore]** Le cadenze del ritmo (mattino/sera/settimana) accendono il motore premium ogni giorno bypassando il delta-gate, anche a business fermo
  - Dove: cervello/ritmo.sh:131 (RITMO_FORCE || DELTA_GATE_FORCE || RITMO_TIPO=mattino || =sera || =settimana → salta il delta-gate) · commento ritmo.sh:126-130 (motivazione: freschezza del Pannello) · timer mycity-ritmo-mattino 06:00 / -sera 18:00 / -settimana Fri 15:0
  - Causa radice: ① Perché girano sempre? Bypassano il delta-gate. ② Perché lo bypassano? Un requisito di UI (data fresca nel Pannello) confliggeva col throttle. ③ Perché il conflitto? Il ritmo lega «scrivere il report» e «accendere il motore premium» nella stessa strada. ④ Perché non separate? Manca un percorso chea
  - Fix (🟡 da firmare): 🟡 Quando il delta-gate dice «invariato», scrivere un report minimale deterministico (data aggiornata + «nulla di nuovo dall'ultimo pieno») SENZA motore premium; accendere il premium solo se qualcosa è cambiato, con un pieno garantito 1×/settimana. Così Pannello fresco e costo ~0.
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[minore]** Ogni chat, anche banale, gira sul modello premium con 8000 thinking-token: nessun triage per i turni triviali
  - Dove: cervello/worker.sh:44-46 (dichiara: rimossa la corsia veloce chat_e_complesso + CHAT_MODELLO_VELOCE → «la chat gira sempre sul modello premium») · worker.sh:1258 (AI_THINKING=0 SOLO per compito_router=testi-volume; la chat è «ragionamento») · worker.sh:1264-12
  - Causa radice: ① Perché tutto premium? Tolta la corsia cheap. ② Perché tolta? Un incidente di qualità (risposte Sonnet «stupide»). ③ Perché la soluzione è stata «vietare il modello economico»? Si è trattato il problema come binario modello-buono/modello-cattivo. ④ Perché non per complessità? Manca un classificator
  - Fix (🟡 da firmare): 🟡 Pre-classificatore deterministico (lunghezza + keyword/saluti) che manda i turni triviali/di conferma a AI_THINKING=0 (o a un modello cheap), mantenendo premium + thinking sulle domande vere. NB: la verifica del difetto è stata portata a «umano» perché il regex originale (con «saluto») combaciava 
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[grave]** Il «banco AI» economico è decorativo: 100% premium per decisione, ma doc/memoria ordinano modelli economici inesistenti e l'accounting mostra un uso economico FALSO
  - Dove: cervello/banco-ai.mjs:26 (ROUTER_SOLO_CONSIGLIO=true) · cervello/motore-ai.sh:301 (AI_ECON_CMD="") · cervello/worker.sh:1260,1292 (route economico richiede AI_ECON_CMD non vuoto → mai; logga «ROUTER_SOLO_CONSIGLIO → esecuzione premium») · cervello/banco-ai.md:
  - Causa radice: ① Perché numeri falsi? uso conta il modello suggerito (fallback || l.modello), non l'eseguito. ② Perché la doc ordina l'impossibile? banco-ai.md non è stata riconciliata con la decisione #59. ③ Perché la decisione non ha ripulito il sottosistema? Il router è stato «neutralizzato» con un flag invece 
  - Fix (🟡 da firmare): 🟡 Scegliere e riconciliare: o si collega un motore economico reale (allora il router serve e AI_ECON_CMD si popola), o si dichiara il banco «sospeso» — banco-ai.md dice «tutto premium finché non colleghi le chiavi», uso conta solo modello_eseguito (togliere il fallback || l.modello a banco-ai.mjs:10
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[minore]** Il delta-gate (unico freno di costo VIVO) è bypassato su tutta la corsia-coda: il cron heartbeat e ogni «Aggiorna ora» forzano un giro premium pieno
  - Dove: pannello/src/app/api/heartbeat/route.ts:43-49 (accoda «giro» incondizionato per GET cron e POST bottone) · pannello/vercel.json:6 (cron 0 9 * * * → /api/heartbeat) · cervello/worker.sh:1114 (export GIRO_FORCE=1 per OGNI giro dalla coda) · cervello/giro.sh:359 
  - Causa radice: ① Perché il cron forza? Passa dalla stessa creaLavoro('giro') del pulsante. ② Perché il worker forza tutti i giri in coda? GIRO_FORCE=1 è applicato a tipo=giro senza condizioni. ③ Perché nessuna distinzione? Non esiste un flag «on-demand umano» separato dallo schedulato. ④ Perché non deduplica? crea
  - Fix (🟡 da firmare): 🟡 Forzare (GIRO_FORCE) SOLO i giri con flag esplicito di richiesta umana; il cron/heartbeat accoda giri gated (rispettano il delta-gate); dedup dei giro già in coda in creaLavoro per neutralizzare il click ripetuto.
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[minore]** Prompt di sistema enorme (CLAUDE.md ~60KB / ~15K token) caricato su OGNI invocazione, anche sui compiti di solo volume
  - Dove: CLAUDE.md (60.149 byte, auto-caricato da `claude -p` su chat/giro/ritmo/metabolizza/esegui-azione) · cervello/giro.md (22.807 byte, letto per intero a ogni giro pieno) · cervello/worker.sh:1086 («segui CLAUDE.md» su esegui-azione) · cervello/motore-ai.sh:269 (
  - Causa radice: ① Perché il costo fisso alto? CLAUDE.md è caricato ovunque. ② Perché è così grande? Contiene sia il core operativo sempre necessario sia il catalogo di dettaglio (roster+deferral) raramente necessario. ③ Perché tutto insieme? Un unico file monolitico fa da mansionario e da directory. ④ Perché non se
  - Fix (🟡 da firmare): 🟡 Split di CLAUDE.md: un core snello sempre caricato (identità, regola d'oro, ciclo, memoria) + il roster/deferral dettagliato caricato solo quando si instrada/delega (già disponibile in AGENTI.md/routing). I lavori di volume (metabolizza, diagnosi) ricevono un system prompt ridotto invece dell'inte
  - Impatto crescita: basso · ↷ conferma della mappa del mattino


### rischio-sicurezza-se — voto 39/100 (critico)

- **[bloccante]** La memoria è ferma ADESSO: un token GitHub reale nel report di auto-radiografia blocca ogni pubblicazione su main
  - Dove: consegne/audit/2026-07-16-auto-radiografia.md (token reale, 3×) · cervello/giro.sh:556 (scan tree-wide) e :626 (SEGRETO_TROVATO→GIRO_PUSH_OK=0) · cervello/scan-segreti.mjs:27,130 (regex PAT, exit 1) · MEM_DIRS giro.sh:72
  - Causa radice: Il perimetro-segreti è disegnato come muro binario (blocca/non blocca) senza un canale di REDAZIONE a monte per i testi che la macchina scrive di sé: lo scanner a valle non distingue 'segreto operativo' da 'segreto CITATO in un audit del leak' e blocca tutto. Documentare un leak diventa esso stesso 
  - Fix (🟡 da firmare): 🟡 da firmare: (a) redigere SUBITO le 3 occorrenze nel report (consegne/ non è append-only) → github_pat_11…[REDATTO]; (b) nuovo pezzo 'redattore-segreti' (riuso delle regex di scan-segreti.mjs) che il workflow giro/auto-radiografia passa su OGNI artefatto PRIMA di scriverlo, sostituendo i match con 
  - Impatto crescita: alto · 🆕 **AR-124**

- **[grave]** Permesso di SCRITTURA sul DB auto-approvato: mcp__Supabase__execute_sql in allow-list contro l'invariante SOLA LETTURA
  - Dove: .claude/settings.json:52 (allow mcp__Supabase__execute_sql) vs .mcp.json:5-6,17-18 (gli altri due server sono --read-only)
  - Causa radice: La allow-list concede capacità per NOME-tool senza legarla all'invariante read-only: si è allow-listato il tool generico (write-capable) invece di limitarsi ai server già pinnati --read-only, e non esiste un guardiano che fallisca se un tool write-capable è auto-approvato. L'invariante 'SOLA LETTURA
  - Fix (🟡 da firmare): 🟡 da firmare (settings.json è Edit/Write-denied → applica Nicola): rimuovere 'mcp__Supabase__execute_sql' (e ogni apply_migration/reset_branch) dall'allow-list; per letture ad-hoc usare i server già --read-only, o pinnare esplicitamente il server 'Supabase' a --read-only in .mcp.json. Aggiungere al 
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[grave]** Il gate di sintassi pre-commit copre solo .sh: un .mjs core rotto (git-github.mjs) può bloccare il giro senza rete
  - Dove: .githooks/pre-commit:24-47 (solo bash -n; nessun node --check) · cervello/git-github.mjs (SPOF: ~90 referenti .mjs) · gate hard fail-closed a cervello/giro.sh:597,605,612-616
  - Causa radice: I gate si aggiungono per-INCIDENTE invece che per-CLASSE-di-rischio: il gate di sintassi è stato aggiunto in reazione a UN incidente shell, non generalizzato. Manca il principio 'ogni artefatto eseguibile che entra nella storia passa un check di parsabilità nel suo linguaggio'. Il giro esegue gli .m
  - Fix (🟡 da firmare): 🟡 da firmare: estendere .githooks/pre-commit con un gate 'node --check' su ogni .mjs staged (come già fa 'bash -n' per gli .sh), fail-closed solo se node è presente (coerente con la nota 'un cancello che si spegne se manca uno strumento non è un cancello'). Opzionale: smoke-import dei moduli core ne
  - Impatto crescita: medio · 🆕 **AR-134**

- **[grave]** curl auto-approvato senza allowlist di host: canale di esfiltrazione aperto (la deny copre solo github)
  - Dove: .claude/settings.json:7 (allow Bash(curl:*)) vs .claude/settings.json:72 (deny solo *api.github.com*)
  - Causa radice: Si concede una capacità di rete generica (curl a ogni host) e la si difende per-ECCEZIONE (blocca UN host) invece di per-ALLOWLIST (permetti solo gli host dei sensori). Manca un wrapper/allowlist di host per l'uscita di rete, e la macchina processa input non fidati dove il prompt-injection batte le 
  - Fix (🟡 da firmare): 🟡 da firmare: sostituire 'Bash(curl:*)' con curl ristretto agli host dei sensori (Supabase marketplace/memoria, api.telegram, api.resend), oppure incanalare le letture REST in uno script wrapper con allowlist di host e negare curl generico. Estendere il guardiano-permessi per fallire se curl è allow
  - Impatto crescita: medio · ↷ conferma della mappa del mattino

- **[minore]** git-pr.mjs ripiega su 'git push --force' cieco quando --force-with-lease fallisce
  - Dove: cervello/git-pr.mjs:483 (fallback a ['push','--force',url,ref] dopo il fallimento di --force-with-lease a :476)
  - Causa radice: In caso di conflitto la policy è 'vinci comunque' invece di 'ri-fetch+rebase e riprova, o fermati e segnala': il meccanismo di sicurezza (lease) viene bypassato proprio nel momento in cui serve, per privilegiare la riuscita del push sulla sicurezza.
  - Fix (🟡 da firmare): 🟡 da firmare: togliere il fallback a --force nudo; su fallimento del lease fare ri-fetch del branch + rebase e riprovare --force-with-lease (max N tentativi), altrimenti fallire con errore esplicito 'il branch è avanzato, riconcilia'. Mai un force incondizionato.
  - Impatto crescita: basso · ↷ conferma della mappa del mattino

- **[minore]** Sotto il motore Cursor (opt-in) il perimetro .claude/settings.json è inerte e nessun guardiano lo segnala
  - Dove: cervello/motore-ai.sh:238-244 (Cursor --force --trust, settings.json ignorato) · motore-ai.sh:38-45 (Cursor opt-in, default auto→Claude) · motore-ai.sh:271 (allowlist Claude, in realtà sovrapposta a settings.json)
  - Causa radice: Esistono due superfici di permessi (settings.json per Claude · full-trust per Cursor) e un motore che salta il layer, senza un guardiano che verifichi l'invariante e renda esplicito che sotto Cursor la sicurezza è SOLO downstream. È un gap di governo/chiarezza, non un buco attivo: è auto-documentato
  - Fix (🟡 da firmare): 🟡 da firmare: (a) nuovo guardiano cervello/perimetro-permessi-check.mjs che a ogni giro verifichi l'invariante (nessun tool write-capable auto-approvato; allowlist :271 ⊆ settings.json) e renda l'invariante esplicita; (b) documentare in modo prominente (README/CLAUDE.md) che sotto Cursor il perimetr
  - Impatto crescita: basso · ↷ conferma della mappa del mattino


## 🔮 Pre-mortem performance

- **Scrittura errata sul DB del marketplace che brucia margine: un coupon 100%-off senza tetto d'uso, o un prezzo cambiato per sbaglio, finiti live e usati da clienti reali.** — probabilità media.
  - Come: La corsia CONFIG (cervello/marketplace.mjs: inserisci/aggiorna) può scrivere QUALSIASI tabella che passi la regex /^[a-z_]+$/, gated solo dall'allowlist a livello di TABELLA (mani-allowlist.json -> marketplace_tables). Appena Nicola sblocca 'coupons' per una promo o 'products' per l'autofill della supervisione (il percorso gia' documentato in super
  - Difesa da mettere PRIMA (🟡): 
- **Email/notifica giusta ma al destinatario o con il contenuto SBAGLIATO: un cliente reale riceve un messaggio pensato per un altro, o un'azione diversa da quella che Nicola credeva d** — probabilità media.
  - Come: L'approvazione non e' un gate strutturale: /api/approva (pannello) crea un LAVORO in linguaggio naturale ('È stata APPROVATA l'azione #N (titolo)... eseguila ORA') che il worker fa interpretare a Claude, il quale marca il file e lancia esegui-azione.mjs. L'azione e' identificata per #N POSIZIONALE (o per titolo) su AZIONI-IN-ATTESA.md, un file di 1
  - Difesa da mettere PRIMA (🟡): 
- **Un'azione 🔴 (email a clienti, merge, scrittura denaro) parte in LIVE come se fosse firmata, senza una firma reale di Nicola.** — probabilità media.
  - Come: Il cancello di firma e' piu' morbido di quanto sembra, per due difetti VERIFICATI oggi nel codice: (1) approvata() in consenso-azione.mjs e' CIECO ALLA NEGAZIONE — ho testato che sia 'NON ancora APPROVATA' sia '❌ RIFIUTATA / non APPROVATA' ritornano true, perche' \bAPPROVAT[AO]\b matcha la parola anche dentro una frase negata o un template; basta c
  - Difesa da mettere PRIMA (🟡): 
- **Prompt-injection da dati non fidati del marketplace: un venditore o una pagina web infila istruzioni in un campo libero e induce l'AD ad agire (sbloccarsi una mano, mandare messagg** — probabilità media.
  - Come: Ogni giro l'AD LEGGE testo non fidato e controllato da terzi: store_description, nomi prodotto, recensioni (supervisione-negozi.mjs, analista, giro), pagine web dell'intelligence (WebFetch), messaggi della chat. Nelle corsie di lavoro il motore gira con AI_ALLOW_ACTIONS=1, --permission-mode acceptEdits e Bash(curl:*) permesso in settings.json, con 
  - Difesa da mettere PRIMA (🟡): 
- **Un loop che manda la macchina al buio o, il giorno che una chiave a pagamento e' collegata, spende davvero: retry-storm che esaurisce la quota AI proprio quando serve, o cadenza ch** — probabilità media.
  - Come: Piu' motori girano in parallelo su timer systemd (mycity-giro ~2h, ritmo, monitora, worker che controlla la coda ogni 5s) e retry-policy.mjs insiste fino a 6 volte sugli errori di quota. costo-ai.mjs misura i token ma la soglia e' dichiarata 'indicativa', e il Letargo (letargo.mjs) esplicitamente 'NON spegne niente da sola': RACCOMANDA i livelli RI
  - Difesa da mettere PRIMA (🟡): 
- **Memoria incoerente mostrata a Nicola: il Pannello espone due valori diversi dello stesso fatto (negozio faro, data onboarding, soglia decisa) e Nicola decide su un dato vecchio.** — probabilità media.
  - Come: Il guardiano coerenza-fatti.mjs (fonte unica registro-fatti.json, 13 fatti) caccia una FRASE contestuale specifica del valore vecchio: una copia PARAFRASATA in modo diverso non contiene quella frase e sfugge -> il gate esce 0 mentre una copia stantia resta viva. Inoltre le radici di scansione sono MyCity-Vault/consegne/creativi/memoria-squadra: un 
  - Difesa da mettere PRIMA (🟡): 

## 🏆 Benchmark vs i migliori

- **Contenuti & social** (divario: medio)
  - I migliori: I migliori non 'postano prodotti': costruiscono format-rubrica ricorrenti con un VOLTO e una CAUSA, testano organico e spingono solo i vincenti. Cortilia fa la rubrica settimanale del produttore + video-ricetta dove il prodotto DOP e' il protagonista emotivo (~111K follower). Bookshop.org trasforma l'evento del nemico 
  - Obiettivo: Una rubrica fissa settimanale con volto reale ('Scoperto a Piacenza' col fornaio di Pane Quotidiano), pubblicata con cadenza costante e agganciata alla piattaforma 'Il Turno' / 'Piacenza non e' in ven · Primo passo: Girare/raccogliere la materia prima reale del primo episodio (foto/video del fornaio PQ alle 5 del mattino), produrre 3 varianti e passarle dal cancello @direttore-creativo (verde). La pubblicazione r
- **Prezzi & commissioni** (divario: alto)
  - I migliori: I migliori trattano il prezzo come leva scientifica, non numero fisso: prezzano per elasticita' e willingness-to-pay, muovono la fee di consegna con domanda/offerta/distanza/meteo, e ottimizzano la soglia 'spedizione gratis' con A/B test. Uber Eats/DoorDash aggiustano algoritmicamente la delivery fee su volume ordini v
  - Obiettivo: Decidere e FAR FIRMARE una commissione al negozio chiara (la tesi del vault e' 10-15%) + una soglia 'consegna gratis' sopra X euro, con lo strumento pronto per A/B testarla quando arriveranno gli ordi · Primo passo: Portare a Nicola una proposta da una pagina (rosso): commissione al negozio come numero singolo firmabile + soglia spedizione gratis, con dietro ogni cifra le unit-economics di @finanza. Senza questa 
- **Onboarding negozi** (divario: medio)
  - I migliori: I migliori fanno dell'attivazione una macchina a due binari — self-service + concierge — ossessionati dal time-to-first-value. Faire lavora ogni brand nei primi 30 giorni per metterlo davanti ai retailer giusti, con zero costi iniziali e resi gratis sul primo ordine, cosi' il rischio di partire e' nullo (flywheel: piu'
  - Obiettivo: Portare Pane Quotidiano al PRIMO INCASSO DI TEST (attivazione completa provata a N=1) e trasformare quel percorso nel playbook <48h ripetibile. La 'definizione di attivato' deve essere 'primo ordine p · Primo passo: Chiudere il loop con Pane Quotidiano — la telefonata al fornaio 0523 388601 e' in coda da giorni (rosso): confermare catalogo + payout e fare un primo ordine di test reale. Finche' PQ non incassa 1 eu
- **Funnel & CRO (conversione del sito)** (divario: alto)
  - I migliori: I migliori progettano il checkout sui dati Baymard, non a intuito: guest checkout, zero costi a sorpresa, campi form ridotti al minimo. Baymard misura 70,22% di carrelli abbandonati (mobile ~80%), che un checkout ben fatto rende fino a +35% di conversione, che il 39% abbandona per costi extra a sorpresa e che si puo' t
  - Obiettivo: Un checkout provato end-to-end su mobile (dove si gioca l'80%): guest checkout, prezzo tutto-incluso senza sorprese, campi al minimo — e un primo ordine reale che lo attraversi davvero. Oggi il funnel · Primo passo: Far girare @cro + @qa un pass Baymard sul checkout attuale mobile-first e listare i 3 tagli a piu' alto impatto (numero campi, costi a sorpresa, guest checkout) (verde). Le correzioni vanno in branch 
- **Email & CRM (ciclo di vita)** (divario: alto)
  - I migliori: I migliori fanno lavorare flussi automatici sul ciclo di vita — benvenuto, carrello abbandonato, win-back, post-acquisto, riordino — e misurano ogni euro per destinatario. Klaviyo: il flusso carrello abbandonato converte in media 3,33% (i migliori 7,69%) e una sequenza di 3 email rende 6,5x una email singola. Sono sold
  - Obiettivo: Collegare le 'mani' (email Resend) e accendere il primo flusso di ciclo di vita — benvenuto + carrello abbandonato a 3 tocchi — sui 23 clienti reali, con contenuto pronto e firmato. Il senior @crm-lif · Primo passo: @builder-automazioni collega Resend con la chiave di scrittura cosi' i flussi possano partire (giallo); @crm-lifecycle prepara il testo esatto delle 3 email carrello + benvenuto in consegne/ (verde); 
- **SEO locale** (divario: alto)
  - I migliori: Per il locale la battaglia si vince sul Google Business Profile, non sul sito: il GBP pesa ~32% del ranking locale (il fattore singolo piu' forte), su rilevanza x distanza x prominenza. Vincono profili completi, categoria specifica, orari corretti, 1 post/settimana e 2-3 recensioni autentiche al mese (la recency batte 
  - Obiettivo: Un GBP ottimizzato per Pane Quotidiano (e un template ripetibile per ogni futuro negozio) + un motore che porti 2-3 recensioni reali al mese, per farci trovare quando qualcuno cerca 'pane/spesa a domi · Primo passo: @seo prepara la scheda GBP completa di PQ (categoria specifica, orari, foto reali, descrizione) come bozza pronta (verde), tenendo NAP coerente su sito+social; la rivendicazione/pubblicazione del prof
- **PR & comunicazione** (divario: medio)
  - I migliori: I challenger battono gli incumbent con identita'-faro + una posizione netta contro la convenzione di categoria + intensita' emotiva che compensa il budget piccolo (Adam Morgan, 'Eating the Big Fish'). La leva regina e' la storia del founder/negoziante + il newsjacking (agganciare il pitch a cio' che e' gia' di tendenza
  - Obiettivo: Un kit stampa 'challenger locale' pronto — la storia di Nicola + il manifesto 'i soldi restano a Piacenza' + un aggancio newsjacking a un evento reale (es. Venerdi' Piacentini) — da mandare ai giornal · Primo passo: @pr-stampa scrive il comunicato-storia (founder + prima bottega che va online davvero) e lo tiene pronto in consegne/ (verde); l'invio ai giornalisti resta firma Nicola (rosso) e va agganciato a un fa
- **Consegne & dispatch** (divario: medio)
  - I migliori: A scala planetaria il dispatch e' ML: DoorDash (DeepRed) stima tempo-di-pronto, tempi di percorrenza e tasso di accettazione, poi ottimizza assegnazione e BATCHING (un rider prende piu' ordini vicini) ritardando strategicamente quando conviene. Il principio ruba-bile alla nostra scala non e' l'algoritmo, e' il batching
  - Obiettivo: Rendere possibile la PRIMA consegna reale (bici operativa) e un mini-playbook di giro manuale batchato per via ('raggruppa gli ordini della stessa zona, sequenza le fermate') — non un algoritmo. Oggi  · Primo passo: Sbloccare la bici e' la dipendenza fisica che tiene fermo tutto (da registro-fatti: bollette 21-27/7, riparazione ~28/7+) — decisione di Nicola (rosso/umano). Intanto @dispatch prepara il template del
- **Cura clienti & customer success** (divario: medio)
  - I migliori: I migliori fanno della cura clienti il motore di crescita, non un centro di costo: Zappos da' potere reale agli operatori (niente script, niente limite di tempo, 'fai la cosa giusta') e punta al WOW — risultato: 75% degli ordini da clienti di ritorno. Amazon lavora 'a ritroso dal cliente'. Alla nostra scala il WOW e' a
  - Obiettivo: Un 'primo ordine concierge' WOW per ognuno dei primi clienti (i 23) — seguito a mano, biglietto scritto, follow-up a 24h — cosi' i primi clienti diventano ambasciatori e portano il passaparola. La cur · Primo passo: @customer-success prepara il playbook concierge del primo ordine (messaggio di benvenuto, piccola sorpresa nel pacco, follow-up a 24h) pronto in consegne/ (verde); parte col primo ordine reale di PQ. 
- **Gestire l'azienda in autonomia con agenti AI (il meta-mestiere)** (divario: medio)
  - I migliori: Il meglio del mondo (Anthropic, Claude Research) usa un'architettura orchestratore-worker: un lead pianifica e apre 3-5 subagent in parallelo con confini di task chiari, poi sintetizza con un pass di verifica/citazione separato (+90,2% vs single-agent). E soprattutto e' OSSESSIONATO dagli eval: valutazione offline (reg
  - Obiettivo: Il vero 10x qui: far girare il volano. Un KPI misurabile per OGNI senior (oggi 81/120 sono a zero), almeno 1 esperimento chiuso a settimana (atteso->reale, oggi 0), e un voto-salute onesto — la macchi · Primo passo: Riparare alla radice il guardiano che falsifica l'auto-salute (allinea-scan-cantiere.mjs sovrascrive il voto dei 12 pilastri col voto-cantiere, mascherando 0/100 in 100) cosi' la misura torna onesta (

## ✅ Cosa NON è rotto (onestà bilanciata)
- Il **delta-gate** fa il suo mestiere: un giro senza novità costa 1-3 secondi invece di 22 minuti.
- Lo **streaming chat** scrive i parziali solo quando il testo cresce (niente PATCH a vuoto).
- Il **battito** è throttled (20s) e il watchdog systemd copre gli hang; i timeout su OGNI curl
  (10s/30s) hanno chiuso la famiglia di outage del 9/7.
- Il **claim atomico** + worker_owner evita il doppio lavoro tra le 2 lane; il recupero orfani rispetta la grazia.
- La **memoria di sessione** chat (--resume) evita di ripagare la riscoperta a ogni turno (resta il doppio
  contesto, già AR nel cantiere).
