---
tipo: quaderno-di-bordo
data: 2026-11-15 05:52
per: la sessione costruttrice dell'«officina minima» (si apre solo col «via» di Nicola)
tetto_usd: 60 (costruttore 45 + collaudatore 15)
---

# L'officina minima: sei programmi prima di spendere sull'onda 3

## In parole semplici
Nell'onda 2 le regole sui costi c'erano, ma erano solo scritte, e sono state superate tutte.
Qui si costruiscono i programmi che le fanno rispettare da soli.
Esempio: il tetto di 12 agenti per sessione era scritto, eppure quattro sessioni su dodici ne hanno aperti 13-15.

## Cosa cambia per te
Dopo l'officina la regista non si sveglia più per niente. Una sessione non può superare il suo tetto di agenti. Il preventivo nasce dalle misure vere.

## Cosa devi fare
Dare il «via» e, a lavoro collaudato, incollare il freno sugli agenti nelle impostazioni (solo tu puoi).

## Cosa non ho verificato
Quanto costerà davvero: le modifiche al programma del 12/11 hanno avuto due collaudi, con 5 e 3 buchi trovati.

---

## Dettagli tecnici

**Prima di toccare codice:** `cervello/scorciatoie-note.md`; skill `cantiere` ③-④ (logica in funzione pura, prova che diventa rossa, mutazione in `cervello/mutanti.json`); skill `collaudo`. Il piano e le correzioni del critico: `piano.md` e `esito-squadra.json` (`giudizio.piano_finale.modifiche`, `critica`) in questa cartella. Tassi: `misure.json` (spostalo in `cervello/riparazione/misure.json`).

**Ramo:** nuovo, da `origin/main` aggiornato. ⚠️ La regista O2 settima lavora su `claude/magical-hamilton-xouwr8` (ad-mycity#954, da NON unire finché AR-969 e AR-962 non reggono): non toccare quei file (`cervello/sorvegliante.mjs`, glossario KPI).

**In ordine; al tetto si consegna quello che è finito e collaudato.**

1. **Freno sugli agenti** — `cervello/riparazione/freno-subagenti.mjs` (nuovo), hook PreToolUse con matcher `Agent|Task|Workflow`. Contatore per `session_id`; tetto dalla scheda (riparatore minori 6, riparatore gravi 8, collaudatore 4, controllore 4, regia 2). **`Workflow` bloccato del tutto per riparatori e collaudatori** (un lancio apre molti agenti: R16 e R22 ne hanno aperti 4-5). Senza `session_id` → blocca. Prove: 6 passano, il 7° esce 2; 1 Workflow da riparatore esce 2; id diverso riparte da zero. Il blocco da incollare in `.claude/settings.json` lo prepari in `consegne/`: lo incolla Nicola.
2. **Sorveglianza muta** — `sorveglia.sh --attendi` (ciclo `until` in sottofondo) + comando `stato` in `cervello/riparazione-sessioni.mjs` (≤ 40 righe). Esce solo se cambia l'impronta rispetto a `<C>/rossi-noti.txt`: referto `finita:true`, ramo nuovo, figlia in REQUIRES_ACTION, ferma da > 20 minuti, spesa > 70% del preventivo, `allowed_warning` o `isUsingOverage`. Battito a 2 ore. Prove su deposito finto: nessuna uscita in 3 intervalli senza cambiamenti; uscita 1 con un referto finito; nessuna con un rosso già noto; `stato` > 40 righe = rosso.
3. **`decidi()` e `valida-collaudo`** (righe ~1340 e ~1477-1524). (a) Minore a uscita 3 chiude se: deroga `rimessa_a_mano` firmata nel piano (per l'onda 1 c'è già: `piano.json` `eccezioni_firmate`), verdetto regge con giudizio pieno, `rimessa.a_mano` compilato. Gravi e bloccanti invariati. (b) Lotti ≤ 40 voci: niente campione, `valida-collaudo` rosso se resta un minore riparato senza giudizio pieno. (c) Esito nuovo `verificata_dopo_nicola` per le voci non di codice sistemate da Nicola: chiude solo con prova, rimessa e non-vacuità, collaudato da un'altra sessione. Prove: tre su (a) — la stessa voce come grave resta aperta —, una su (b), una su (c).
4. **`pronte` e `dividi`** — quattro file di chiavi A/B/C/D dai **percorsi** dei file e dagli esiti, non dalle parole. Prima fonde voce per voce i referti dei rami «secondo» (`-m15`…`-m24`) e i collaudi K05-K09 secondo, K08 terzo e quarto, scaricati con `git fetch` (copia `blob:none`). Conta per **voce unica** (43 righe = 31 voci). `dividi` raggruppa per componenti connesse sui file, prove comprese, con un padrone unico per prova comune; `copertura-prima` rosso se una voce tocca un file senza padrone. Rifiuta di rimandare una voce allo stesso padrone del file (R-D).
5. **`applica` e `conti`** — `applica` rosso se `sessioni.json` dice K finito e `collaudi/KNN.json` ha `finita:false`; `conti` rosso se una PR dell'onda è unita e il registro non è scritto (oggi la mycity#290); `conti --preventivo` scrive stima, tetto e massimo da `misure.json` (collaudo 15%, regia 10% dentro), rosso al 70% e al 100%. Prova: 259 voci con le misure dell'onda 2 danno almeno 1.600 $; rosso se torna 1,45 $ a voce.
6. **`valida-referto`** — rosso se mancano `conto.subagenti` o `costo_usd` (da get_session prima della consegna), se i subagenti superano il tetto della scheda, o se un grave è «riparato» senza prova che diventa rossa.

**Collaudo:** in una **sessione nuova** (non un agente dello stesso costruttore), mandato di distruggere, finestra da 200 mila token, 15 $. Le due lenti della skill `collaudo` solo sui pezzi 1, 3 e 5 (permessi e chiusure).

**Consegna:** `node cervello/cancello-lotto.mjs` verde (o uscita 2 con i ⚪ dichiarati), una PR su ad-mycity non unita, una riga in `DECISIONI.md`, ESITO con `chiusura-loop.mjs`. Nel referto: costo e numero di agenti (R-H).
