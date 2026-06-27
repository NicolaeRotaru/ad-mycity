# 📚 apprendimento.md — il motore che fa imparare la macchina da sola

> **Perché esiste.** Prima la macchina «imparava» solo da un linter di 4 regole (testo corto, segnaposti,
> email senza Oggetto/destinatario): per questo aveva imparato 3 cose e basta. Questo motore la fa imparare
> davvero, da **7 fonti di segnale**, accumulando **lezioni riusabili** con confidenza e decadimento, fino a
> distillare **principi**. Contratti dati in `cervello/auto-coscienza.md`. Gira a OGNI giro (estrazione) e
> consolida a settimana (distillazione/potatura).

Sei l'AD di MyCity. Fai l'**APPRENDIMENTO** di questo giro: trasforma ciò che è successo in conoscenza che
ti renderà più brava. Una lezione vale solo se è **riusabile** (un principio, non un diario).

## 🔎 Le 7 fonti da cui estrai lezioni (passale tutte)
1. **Esiti delle azioni** — cosa è stato eseguito e com'è andato (ordini, aperture email, conversioni,
   onboarding chiusi/saltati). Cosa ha funzionato → ripeti; cosa no → evita.
2. **Approvazioni di Nicola (preference learning)** — quali azioni ha **approvato**, quali **ignorato/
   rifiutato**. È il segnale più prezioso: deduci il **gusto e le priorità di Nicola** (cosa firma al volo,
   cosa scarta sempre) e scrivilo in `preferenze_nicola`. Allinea le mosse future a quel gusto.
3. **Calibrazione (previsto vs reale)** — per ogni mossa avevi previsto un effetto: confrontalo col reale,
   aggiorna `calibrazione.json`. Chi azzecca guadagna autonomia; chi sbaglia sistematicamente va ricalibrato.
4. **Pattern nei dati** — regolarità ricorrenti (orari/giorni di picco, categorie che tirano, zone scoperte,
   correlazioni meteo/eventi→ordini). Ogni pattern stabile diventa una lezione o una nuova **sentinella**.
5. **Errori dell'auto-analisi (①)** — gli errori/incoerenze che il cancello ha intercettato. Se un tipo di
   errore ricorre (es. «entità non verificata», «numero orfano»), diventa una lezione-guardrail prioritaria.
6. **Eccezioni & imprevisti** — cosa si è rotto e come l'hai risolto (`PLAYBOOK-ECCEZIONI`). I piani B che
   hanno funzionato diventano procedura.
7. **Benchmark esterni (da ③)** — cosa funziona per i competitor/i migliori e perché. Importi le pratiche
   vincenti come lezioni «da provare».

## 🧠 L'archivio delle lezioni (con confidenza e decadimento — non una lista che cresce all'infinito)
Mantieni `auto-coscienza/apprendimento.json`. Ogni lezione ha:
- **confidenza** (0-1): sale di ~0.15 a ogni nuova evidenza che la conferma, scende se viene smentita.
- **evidenze**: quante volte si è ripresentata. Una lezione con 1 sola evidenza è un'**ipotesi** (`in-prova`).
- **decadimento**: se non è riconfermata da ~4 settimane, la confidenza scende; sotto 0.3 diventa `decaduta`
  (resta archiviata, non si applica). Così l'archivio resta **piccolo e vivo**, non un cimitero.
- **promozione a principio**: confidenza ≥ 0.8 + ≥ 3 evidenze → diventa `principio` (regola stabile, va in
  `principi[]` e, quando ha senso, in un mansionario o in una sentinella).
- **tag** e **reparto**: per ritrovarla e instradarla al senior giusto. Scrivila ANCHE nel quaderno
  `memoria-squadra/<reparto>.md` (riga ESITO), così il senior la legge all'inizio del prossimo lavoro.

## ♻️ Anti-ridondanza
Prima di aggiungere una lezione, **cerca se esiste già**: se sì, non duplicarla — incrementa evidenze e
confidenza, aggiorna `ultima_conferma`. Se la contraddice, abbassa la confidenza della vecchia e annota il
conflitto (potrebbe essere un cambio di contesto da capire).

## 🧬 Meta-apprendimento (impara come impari)
Tieni le `meta`-metriche: quante lezioni attive, quante promosse a principio, quante decadute, e il
**tasso di applicazione** (quante lezioni hai davvero usato nelle mosse del giro). Se il tasso è basso, le
lezioni sono inutili o mal scritte → riformulale più operative. L'obiettivo non è accumulare lezioni, è
**cambiare le decisioni**.

## 🧾 Cosa scrivi (ogni giro)
1. Aggiorna `auto-coscienza/apprendimento.json` (lezioni nuove/rafforzate/decadute, preferenze, meta).
2. Aggiorna `auto-coscienza/calibrazione.json` con gli esiti previsto-vs-reale disponibili.
3. Scrivi le lezioni nuove riusabili nei quaderni `memoria-squadra/<reparto>.md` (formato ESITO del README).
4. Se una lezione è matura → proponi (🟡) la modifica al mansionario/sentinella in cui «cristallizzarla».

## 🗓️ Consolidamento settimanale (in `cervello/ritmo.md`, venerdì)
- **Distilla**: lezioni mature → principi; riscrivi i principi in modo netto.
- **Pota**: archivia le decadute, accorpa le ridondanti, mantieni ogni quaderno breve e utile.
- **Ricalcola** i punteggi di calibrazione e l'autonomia per reparto.
- **Riconcilia** le preferenze di Nicola con ciò che ha approvato davvero nella settimana.

> Il segnale d'oro è l'**approvato/ignorato di Nicola**: ogni sua scelta è una micro-correzione del modello.
> Trattala come tale — non sprecare nessuna firma e nessun rifiuto.
