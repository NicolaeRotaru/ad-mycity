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

## Il rischio della firma: quanti difetti si richiuderebbero DA SOLI al merge

Dopo il merge gira `auto-fix.mjs verifica --applica`, che guarda la prova sulla scheda e NON la
volontà di chi ha lavorato il difetto. Un difetto aperto la cui prova a pattern risulta soddisfatta
si richiude da solo — e smentisce ciò su cui Nicola ha messo la firma. È già successo: il 29/7 il
conteggio disse «✅ Chiusi 20» ed era verde, ma uno dei venti non doveva esserci.

Quindi la domanda va **misurata**, non temuta. Misurata il 2026-08-14 alle 22:05, su tutti i
difetti aperti:

```
APERTI con prova a pattern: 38
  · prova GIÀ SODDISFATTA → si richiuderebbero da soli:  0
  · prova non soddisfatta (restano aperti):             38
  · cieche (file o pattern illeggibile):                 0
```

**Zero.** Nessuno dei trentotto si richiude da solo con il codice com'è adesso. Il rischio esiste
come classe — quelle trentotto prove restano deboli e andranno rifatte — ma stanotte non morde.

I due difetti che le corsie hanno dichiarato APERTI (AR-375 e AR-682) sono già a `tipo: umano`,
quindi fuori dal rischio per costruzione. Sul primo la scheda porta il racconto della volta in cui
la trappola scattò davvero: la sua vecchia prova cercava `esito_righe` in `malattie.json`, cioè
**il nome del tubo che il difetto stesso denuncia** — una stringa già presente il giorno in cui il
difetto è nato. Descriveva il bug, non il fix.

Il conto va rifatto **dopo la ricucitura e prima del merge**, perché la ricucitura cambia le prove:

```bash
node -e "…"   # lo script sta nel corpo della richiesta di unione del lotto 42
```

## Come si rilegge questa misura

Il worktree pulito è ancora montato:

```
/tmp/claude-0/-home-user-ad-mycity/e85ea349-533b-50ef-88a3-48320ec3c5d1/scratchpad/base-lotto42
```

Per rifare la misura di partenza su un singolo test:
`cd <worktree> && node cervello/test/<nome>.test.mjs`

Il referto intero sta in `scratchpad/baseline-prove.txt`.
