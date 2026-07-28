---
name: cantiere
description: >-
  Ripara i difetti del cantiere di auto-coscienza dell'AD MyCity
  (MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json) con lo standard di un lotto:
  si sceglie per MALATTIA non per conteggio, la logica va dove un test la può eseguire, ogni difetto
  ha una prova comportamentale che diventa rossa se QUEL difetto non è riparato, e si consegna solo
  col cancello verde. Usa questa skill ogni volta che Nicola dice — in qualunque forma — "risolvi i
  difetti", "sistema i difetti principali", "chiudi i difetti del cantiere", "fai un lotto",
  "prossimo lotto", "riduci i difetti aperti", "lavora sul cantiere", "risolvi i bloccanti",
  "chiudi AR-xxx", o chiede quanti difetti restano e come abbatterli. Vale anche quando la richiesta
  arriva senza la parola "cantiere" ma nomina uno o più codici AR-\d+.
---

# Un lotto di riparazione — il mansionario

> Nato da una frase di Nicola, 28/7: *«mi rendo conto che tu puoi risolvere e migliorare questi
> difetti in modo molto migliore e più efficiente, ma non so cosa dirti per fartelo fare.»*
>
> **Non deve saperlo.** Se la qualità dipende dal fatto che lui trovi la frase giusta, è fragile —
> ed è la stessa malattia che questo cantiere cura da ventotto lotti: una regola che funziona solo
> se qualcuno si ricorda di invocarla. Perciò lo standard non sta in un file da aprire: sta qui, e
> si carica da solo quando serve.

Il testo lungo, con i casi-studio, resta in `cervello/come-riparo.md`. Questo è l'operativo.

---

## La regola che sta sotto a tutto

**Un difetto non è chiuso quando quel punto guarisce: è chiuso quando la malattia smette di potersi
ripresentare.**

Tutto il resto discende da qui. Se stai per scrivere un fix che ripara un punto e lascia in piedi il
modo in cui quel punto si è rotto, fermati: stai facendo un lavoro che dovrà essere rifatto.

---

## ① Scegli per MALATTIA, non per conteggio

Dieci difetti scollegati sono dieci mini-lotti impilati: stesso lavoro, una PR illeggibile, e se uno
è sbagliato si blocca tutto. Dieci difetti con **una** malattia si riparano con **un** modulo
condiviso, e la PR si legge in cinque minuti.

```bash
# quanti aperti, per gravità e dimensione
node -e "const c=require('./MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json');
const a=c.difetti.filter(d=>d.stato==='aperto');
const g={};a.forEach(d=>g[d.dimensione]=(g[d.dimensione]||0)+1);
console.log(a.length,'aperti'); console.table(g);"

node cervello/spazzata-fratelli.mjs        # le malattie già censite e i loro tetti
node cervello/cantiere-prove.mjs           # quali difetti NON possono chiudersi da soli
```

Poi leggi i candidati per intero — `causa_radice` e `fix_proposto`, non solo il titolo — e raggruppa
per **come si è rotto**, non per dove. Il lotto è grande quanto la malattia, non quanto la voglia.
Se la malattia ne prende venti, il lotto ne prende venti.

> Misurato il 28/7: 35 difetti aperti su 160 avevano la stessa radice («un buco si traveste da buona
> notizia»). Due lotti l'hanno curata in undici punti.
> Misurato il 29/7: 14 difetti del Pannello avevano tre radici imparentate («si dichiara fatto ciò
> che non è confermato», «la guardia sta sul campanello invece che sull'atto», «un ripasso calpesta
> lo stato vivo»). Tre moduli, un lotto.

## ② La scheda del difetto è un indizio, non una specifica

Le schede le ha scritte una radiografia passata. Vanno lette **e poi verificate sul codice vero**.
Nella pratica sono quasi sempre imprecise, in entrambe le direzioni:

- **più larghe** — AR-171 diceva «cerca un nome che non esiste»; il guasto vero era un confronto
  esatto su un campo di testo libero, quindi 41 voci su 42 sbagliavano ramo.
- **più strette** — AR-196 descriveva un buco; ce n'erano tre nello stesso blocco.
- **soddisfatte a metà** — AR-178 chiedeva due guardiani e la sua prova era un OR: si è chiusa con
  uno solo riparato.

Se scheda e codice non concordano, **comanda il codice**, e la differenza si scrive nella nota del
difetto. Anche i numeri di riga nelle schede sono vecchi: cercali con `grep`, non fidarti.

## ③ La logica che decide deve stare dove un test la può ESEGUIRE

Non dentro un componente React, non dentro `route.ts` insieme a `next/server`, non dentro uno script
di shell. **Funzione pura, senza dipendenze, in un file suo**; il punto malato la chiama.

Altrimenti la prova finisce per controllare la **forma** del codice invece dell'**effetto** — ed è
esattamente così che questi difetti sono sopravvissuti: la loro prova era un pattern cercato in un
file.

Case in casa da imitare: `cervello/fonte-numero.mjs` · `cervello/gate-pubblicazione.sh` ·
`pannello/src/lib/esito-lettura.ts` · `pannello/src/lib/esito-scrittura.ts` ·
`pannello/src/lib/atto-unico.ts` · `pannello/src/lib/stato-vivo.ts`.

I test dei moduli del Pannello vivono in `cervello/test/*.test.mjs` e importano il `.ts` direttamente
(type-stripping di Node 22): `const { fn } = await import(join(REPO, "pannello/src/lib/x.ts"))`.

## ④ La prova è comportamentale, e non basta che sia verde

Nel cantiere: `"verifica": {"comando": "node cervello/test/<nome>.test.mjs"}` — **mai**
`{file, pattern, presente}`. Un pattern non frena, non legge, non decide.

Poi i tre livelli, in quest'ordine:

1. **Il test esegue** la logica sui dati veri, non su un finto comodo.
2. **La prova di non-vacuità** — rompi il fix apposta, riga per riga, e il test DEVE diventare rosso.
   Se resta verde, la prova non prova niente. *Questo passo ha trovato un difetto nel metro stesso
   quattro volte in due giorni.* Non è opzionale e non si salta perché «si vede che funziona».
3. **La spazzata dei fratelli** (`node cervello/spazzata-fratelli.mjs`) — la stessa malattia cercata
   dappertutto. Il tetto in `cervello/malattie.json` **scende quando curi e non si alza mai**. Se la
   malattia del tuo lotto non è ancora censita, **aggiungila**: è il pezzo che trasforma «ho
   riparato dieci punti» in «questa forma di difetto non si allarga più».

## ⑤ Dopo aver scritto il fix, rileggi le clausole invece di fidarti del verde

Metti il `fix_proposto` accanto al diff, **clausola per clausola**. Le clausole sono spesso tre o
quattro dentro un paragrafo unico, e quella che salta è quasi sempre **l'ultima** — perché arriva
quando il lavoro sembra già finito.

> 28/7, AR-172: avevo sistemato `prevedi` (il comando a mano) e non `autoprevedi` (il generatore
> automatico). La prova passava — perché la prova la conoscevo io e copriva quello che avevo fatto
> io. **Riparare la porta a mano e lasciare aperta quella automatica è il modo più sicuro di far
> tornare il difetto da solo.**

**La domanda obbligatoria a ogni canale nuovo che scrive nello stesso posto** (un ponte, un comando
di recupero, un importatore): *«quali cancelli del canale principale eredita?»* Quasi sempre la
risposta è «nessuno», perché i cancelli stanno dentro il comando invece che sul dato. La cura non è
aggiungere il cancello anche lì — è **spostarlo sul dato**, dove vale per chiunque scriva.

## ⑥ Il cancello di uscita — un comando, e o è verde o non si consegna

```bash
node cervello/cancello-lotto.mjs          # tutto: prove + guardiani + typecheck
node cervello/cancello-lotto.mjs --veloce # senza typecheck, mentre lavori
```

Exit `0` = si consegna · `1` = violazione, non si consegna · `2` = non ho potuto misurare (cieco,
**non** verde). Dentro ci sono, oltre ai guardiani già esistenti, i tre controlli che nascono dai
due errori più costosi del cantiere:

| controllo | cosa impedisce |
|---|---|
| `prova-con-or` | una prova `A|B` chiude il difetto con metà fix fatto (AR-178, chiusura falsa) |
| `prova-condivisa-cieca` | un test dato a N difetti che non li nomina tutti: ne chiude anche uno mai toccato (lotto 11, AR-254) |
| `prova-orfana` | un comando che punta a un file inesistente: «fix non fatto» indistinguibile da «puntatore rotto» (AR-117) |

Per i fix che si vedono a schermo, il cancello non basta: la prova è **osservazione a runtime** →
usa la skill `verify` (Pannello con Playwright, script con bats). Un `tsc` verde dimostra che sai
far girare la CI, non che il fix funziona.

## ⑦ Come si consegna

- Ogni auto-modifica è **🟡**: si prepara, si committa, **non si mergia**. Il merge è di Nicola.
- Per il Pannello, mergiare **è** pubblicare (il Deploy Hook parte su `main`): se la PR tocca
  `pannello/**`, va detto nel corpo.
- Nel cantiere si aggiorna il campo **`verifica`** (→ `comando`) e la **`nota_fix`**; lo `stato` NO:
  le chiusure le applica `node cervello/auto-fix.mjs verifica --applica` **dopo il merge** (AR-331),
  così due lotti aperti insieme non litigano sullo stesso file.
- Lascia l'ESITO nel quaderno del reparto: `node cervello/chiusura-loop.mjs registra …` (AR-009).
- Il conteggio di `auto-fix` **non è una verifica**: «Chiusi 5» è un numero. Le chiusure si rileggono
  una per una.

---

## Gli errori già pagati — non rifarli

| errore | come si presenta | l'antidoto |
|---|---|---|
| prova con un OR | `"pattern": "A|B"` | una prova per difetto, `--solo-prove` la pesca |
| prova condivisa cieca | stesso test su 5 difetti | il file deve nominare ogni id |
| l'ultima clausola saltata | il fix sembra finito | rilettura clausola per clausola (⑤) |
| porta a mano riparata, automatica no | «ma la prova passa» | cerca TUTTI i chiamanti, non quello che hai visto |
| guardia sul punto d'ingresso | il bug torna da un'altra strada | il freno va al **confine dell'atto** |
| numeri di riga della scheda | non corrispondono più | `grep`, mai fidarsi |
| `await` scambiato per conferma | «l'ho salvato» senza guardare l'esito | guarda il valore che torna |

## Cosa NON fare

- **Non** aprire un lotto senza aver misurato la malattia: un lotto per conteggio è dieci lotti.
- **Non** chiudere lo stato dei difetti nella PR (lo fa `auto-fix` dopo il merge).
- **Non** consegnare con un guardiano «cieco» spacciandolo per verde: exit 2 non è exit 0.
- **Non** inventare un'esenzione in `malattie.json` senza il perché scritto: un'esenzione senza
  motivo è un silenzio, ed è la cosa che stiamo curando.
- **Non** fermarti a chiedere conferma a metà lotto: 🟡 significa «fallo e avvisa», e la firma è sul
  merge, non su ogni passo.

## Il giro completo, in ordine

```
misura le malattie  →  scegli il gruppo  →  verifica sul codice vero  →  estrai la logica in un
modulo puro  →  applica nei punti  →  test per difetto  →  ROMPI il fix (non-vacuità)  →
spazzata + tetto  →  rileggi le clausole  →  cancello-lotto  →  aggiorna verifica/nota_fix +
DECISIONI + memoria  →  commit  →  ESITO nel quaderno
```
