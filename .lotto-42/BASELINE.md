# La misura di PARTENZA del lotto 42

Presa su un albero pulito al commit `d8c07fb` (un worktree separato), **prima** che qualunque corsia
scrivesse una riga. Serve a una cosa sola: quando una corsia mi dice «quel rosso era già lì», questa
pagina risponde in trenta secondi invece che a memoria.

## Il conto

```
❌ 2 su 277 non danno garanzie
⚪ 29 prove in bash NON eseguite: manca `bats` su questa macchina
```

## L'unico file di prova rosso alla partenza

`cervello/test/c2-schermo.test.mjs` — **0 casi passati su 6**. Tutti e sei falliscono per lo stesso
motivo, e il motivo lo dichiara il test stesso:

> il Pannello non risponde su http://127.0.0.1:3939: non posso guardare, quindi non posso dire che è
> a posto

**Questo non è un rosso: è un cieco.** Il test sa di non aver potuto guardare e lo scrive; è il
banco che lo conta come ❌. È la stessa malattia che la corsia B sta curando (il cieco venduto per
verde) vista dall'altra faccia — qui il cieco viene venduto per **rosso**, che è meno pericoloso ma
altrettanto falso.

I sei casi coprono: AR-417 (viewport-fit), AR-244 (tre casi sui link che atterrano sull'area
giusta), AR-248 (il cassetto chiuso), **AR-225** (su un telefono da 375 punti nessun numero resta
fuori dallo schermo).

### Cosa vuol dire per la corsia E

**AR-225 ha già la sua prova a runtime, e non serve scriverne una nuova.** Serve far rispondere il
Pannello su `127.0.0.1:3939` e guardare quel caso diventare verde. Se il Pannello non si riesce ad
avviare da qui, AR-225 resta APERTO e va dichiarato — non chiuso per giudizio.

## Le 29 prove in bash

Confermano AR-693 sul codice vero, prima di ogni nostra modifica: `bats` non c'è, quindi 29 prove
esistono e non le esegue nessuno. Il totale le conta come ⚪ e chiude con «2 su 277», che è il
numero da tenere: **se dopo il lotto ne risultano di più, la differenza è nostra.**

La corsia C sta lavorando proprio questo difetto, e sa che installando `bats` sullo stesso commit i
rossi veri diventano 11. Quei dieci non sono nostri: erano lì e nessuno poteva vederli.

## Come si rilegge questa misura

Il worktree pulito è ancora montato:

```
/tmp/claude-0/-home-user-ad-mycity/e85ea349-533b-50ef-88a3-48320ec3c5d1/scratchpad/base-lotto42
```

Per rifare la misura di partenza su un singolo test:
`cd <worktree> && node cervello/test/<nome>.test.mjs`

Il referto intero sta in `scratchpad/baseline-prove.txt`.
