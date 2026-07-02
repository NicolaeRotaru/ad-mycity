---
tipo: strategia
data: 2026-06-28 00:40
titolo: Auto-coscienza — la macchina si controlla, impara e si migliora da sola
---

# 🧠 Auto-coscienza di MyCity OS

> Risposta alle tre cose che mi hai chiesto: **(1) perché imparava poco, (2) un posto dove si auto-analizza
> con domande per te, (3) come si auto-migliora confrontandosi coi migliori e facendo collaborare i senior.**
> Le ho costruite come **un sistema unico** — un volano dove le tre funzioni si alimentano a vicenda.

## Il volano
```
🔬 Auto-analisi  →  trova errori, incoerenze, invenzioni
      ↑                         ↓
🚀 Auto-miglioramento  ←  📚 Apprendimento (le trasforma in lezioni)
   (benchmark + squadra)        ↓
      └──── alza l'asticella ───┘
```
Ogni giro: la macchina lavora → **si controlla** → **impara** → **si migliora**. Più gira, più diventa
accurata e brava. Non riparte mai da zero: ogni lezione resta e alza il livello base.

---

## 1) Perché imparava poco (e cosa ho sbloccato)
**La causa esatta:** l'unico apprendimento automatico era una funzione (`verificaQualita`) che controlla
**4 sole cose** (testo troppo corto, segnaposti `[..]`, email senza Oggetto, email senza destinatario).
Aveva «imparato» 3 cose perché *sono le uniche 3 che sapeva guardare*. L'apprendimento vero (i quaderni dei
senior) girava **solo il venerdì** e solo se lanciato a mano. **Il giro ogni 2 ore non imparava nulla.**

**Cosa ho costruito** (`cervello/apprendimento.md`): un motore che impara da **7 fonti** a ogni giro:
1. **Esiti** delle azioni (cosa ha funzionato/no) · 2. **Cosa approvi/ignori tu** (preference learning: il
segnale più prezioso) · 3. **Calibrazione** (previsto vs reale) · 4. **Pattern nei dati** (picchi, categorie,
zone) · 5. **Errori dell'auto-analisi** · 6. **Eccezioni** risolte · 7. **Benchmark** coi competitor.
Le lezioni hanno **confidenza** (salgono con le prove), **decadono** se non riconfermate, e le migliori
diventano **principi**. L'archivio resta piccolo e vivo, non un cimitero.

## 2) L'auto-analisi (il posto dove si controlla + ti fa le domande)
**Non esisteva.** Per questo è successo l'errore **Garetti**: nessuno verificava che un'entità su cui agisce
sia reale e confermata da te. Ho controllato: **Garetti compare in `DECISIONI.md` solo come esempio di
contenuto**, mai come negozio che hai scelto — eppure tutta la memoria (pitch, kit, commissione 12%,
payout-test) lo tratta come reale. Esattamente il tipo di errore piccolo che fa danni grossi.

**Cosa ho costruito** (`cervello/auto-analisi.md`): un **cancello di serietà** che gira a ogni giro, con
verifica **avversariale a 3 livelli** (la macchina prova a *smontare* il proprio lavoro, non a darsi ragione):
- **L1 deterministico:** ogni entità verificata contro il `registro-realta.json`; ogni numero deve avere una
  fonte; semaforo 🟢🟡🔴 rispettato; qualità.
- **L2 valutatore indipendente:** un agente col solo compito di **refutare** le azioni a rischio.
- **L3 panel a lenti multiple** (realtà / numeri / coerenza / finanza / legale / pre-mortem) sul critico.
Produce un **voto di fiducia** (0-100), gli **errori trovati** per gravità, le **domande per te**, e la
**salute della macchina** (Supabase/Stripe su o giù). **Il posto dove lo vedi:** Pannello → **Memoria →
🧠 Auto-coscienza**, e un **banner in cima alla Plancia** con voto, errori e domande.

> La prima auto-analisi è già lì, e la prima domanda per te è: **«Garetti è un negozio reale che hai scelto,
> o un esempio?»** Finché non rispondi, ho **declassato** tutte le azioni che lo riguardano.

## 3) L'auto-miglioramento (confronto coi migliori + squadra che collabora)
**Cosa ho costruito** (`cervello/auto-miglioramento.md`): il loop che volevi.
- **Benchmark → migliora → misura:** produce un lavoro → @intelligence scova **chi lo fa benissimo**
  (competitor + top del settore + swipe file) → misura il **divario** con un punteggio → lo chiude → dopo la
  pubblicazione **confronta le metriche reali** e ne ricava una lezione. All'inizio il divario è enorme: è lì
  il guadagno.
- **La squadra si migliora a vicenda:** ≥3 varianti da senior diversi → **torneo + critico** (uccide le
  deboli) → **peer-review incrociata** (numeri→finanza, claim→legale, conversione→cro…): ognuno lascia il
  lavoro migliore di come l'ha trovato. Tutto condiviso in **Sala Operativa** e nei quaderni.
- **Auto-riscrittura:** quando scopre un modo migliore di lavorare, **propone (🟡) di riscrivere il
  mansionario** del senior — così il miglioramento si cristallizza nel modo in cui pensa. Le firmi tu.

---

## Dove vive tutto
- **Cervello (prompt/regole):** `cervello/auto-coscienza.md` (maestro + contratti), `auto-analisi.md`,
  `apprendimento.md`, `auto-miglioramento.md`. Agganciati al **giro** (ogni 2h) e al **ritmo** (settimanale).
- **Memoria viva:** `MyCity-Vault/90-Memoria-AI/auto-coscienza/` (registro-realtà, auto-analisi,
  apprendimento, calibrazione, auto-miglioramento) + `AUTO-ANALISI.md`.
- **Pannello:** Memoria → 🧠 Auto-coscienza (3 schede) + banner in Plancia.
- **Regola vincolante:** aggiornato `CLAUDE.md` — il ciclo ora è *Osserva→Capisci→Decidi→Agisci→**Verifica→
  Impara→Migliora***, e «fatto bene» richiede che **ogni entità e ogni numero abbiano una fonte**.

## Cosa serve da te (carburante che alza il tetto)
1. **Rispondere alla domanda su Garetti** (sblocca o ferma quelle azioni).
2. Quando puoi: **chiavi social/competitor** + dati reali → l'auto-miglioramento passa da «fonti web» a
   «confronto sui nostri numeri veri», e il livello sale molto.
