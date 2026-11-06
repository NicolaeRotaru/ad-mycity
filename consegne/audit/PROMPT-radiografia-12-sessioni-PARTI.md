---
tipo: prompt
data: 2026-11-06 02:30
per: Nicola, da incollare in una sessione nuova, una parte alla volta
come si usa: apri una sessione nuova sul repo NicolaeRotaru/ad-mycity, nell'ambiente «mycity» (è quello che vede il sito vero). Incolla la parte 1. Le altre le incolli solo quando la sessione si è fermata e ti ha mostrato quello che chiede la parte prima.
---

# La radiografia in 12 sessioni: le parti da incollare

Il testo lungo con tutte le regole sta in `consegne/audit/PROMPT-radiografia-12-sessioni.md`, e la sessione lo legge da sola. Tu incolli solo queste quattro parti, una alla volta. Ognuna finisce con la sessione che si ferma e ti aspetta.

---

## Parte 1 — l'avvio e la preparazione

Prima di incollarla, scegli le cinque righe delle decisioni. In ogni riga la prima scelta è quella che ti consiglio.

```text
Sei l'AD digitale di MyCity. Questa sessione dirige la radiografia del marketplace in 12 sessioni, più la sintesi finale.

Le istruzioni complete sono nel file consegne/audit/PROMPT-radiografia-12-sessioni.md (versione 5). Prendilo dal ramo dove è nato, insieme al manuale aggiornato:
git fetch origin claude/youthful-hopper-q3oud0 && git checkout FETCH_HEAD -- consegne/audit/PROMPT-radiografia-12-sessioni.md cervello/MANUALE-AD.md
Il manuale di main non ha ancora le regole del lavoro veloce (da ⑬ a ⑰): il comando qui sopra porta la versione del ramo, ed è quella che leggi.
Leggi prima cervello/MANUALE-AD.md, poi quel file per intero, e seguilo. Nelle parti dopo rileggi solo i paragrafi che ciascuna nomina.

Le mie decisioni, che vincono su quelle scritte nel file:
- D0 · Quando: la prima ondata dal 12/11 alle 10:00, la seconda dopo l'apertura del 15/11. (Oppure: la prima ondata subito. Oppure: tutto dopo l'apertura.)
- D7 · I referti privati delle falle riservate: te li incollo qui sotto. (Oppure: non li ho più, e quelle falle restano non ricontrollate.)
- D8 · I lavori a orario: non li ho ancora accesi; la data te la dico io. (Oppure: li accendo il ….)
- D9 · I dettagli già pubblici di alcune falle: oscurali prima della radiografia, come lavoro a parte. (Oppure: dopo.)
- D10 · La palestra: preparami il piano con i costi alla fine della radiografia. (Oppure: non ora.)
Le altre decisioni, da D1 a D6, valgono come sono scritte nel file.

In questa parte fai solo la fase 0, cioè i paragrafi 1, 2 e 3 del file: lo stato di partenza, il codice, la cartella di lavoro, i controlli col loro collaudo, la PR in bozza, la rete. Non aprire nessuna sessione.
Poi fermati e mostrami: l'esito del collaudo dei controlli, i conti della mappa dei file, e le domande ancora aperte.

[Se nella D7 hai scelto la prima: incolla qui sotto i referti privati delle falle riservate.]
```

---

## Parte 2 — la prima ondata

Incollala quando la parte 1 è finita e il collaudo dei controlli è passato.

```text
Rileggi dal file il passo 3.0 e i paragrafi 4, 5 e 6.
Via la prima ondata. Segui i paragrafi 4, 5 e 6 del file per S01, S03, S06, S10 e S11.
Prima guarda il limite settimanale (passo 3.0). Poi apri le cinque sessioni in modalità piano, leggi i loro piani e dimmi quali approvare e cosa correggere.
Dopo la mia approvazione sorvegliale. A fine ondata fermati e mandami il riassunto del passo 6.4.
```

---

## Parte 3 — la seconda ondata e il controllo finale

Incollala dopo aver letto il riassunto della prima ondata.

```text
Rileggi dal file i paragrafi 4, 5, 6, 7, 8 e 9.
Via la seconda. Segui i paragrafi 4, 5 e 6 del file per S02, S04, S05, S07, S08, S09 e S12, con le stesse regole della prima ondata.
Quando tutte e 12 hanno finito, fai il controllo finale del paragrafo 7: la verifica indipendente, il referto, il registro, la batteria della palestra, una sola PR.
Fermati prima della verifica se il limite settimanale non è allowed, o se il conto della verifica supera 150 agenti.
Alla fine mandami l'ultimo messaggio del passo 7.8.
```

---

## Parte 4 — la palestra

Incollala solo dopo aver letto il piano della palestra con i costi, e solo se lo firmi.

```text
Rileggi dal file i paragrafi 1 e 10.
Firmo il piano della palestra con questi costi: [scrivi qui la cifra che hai letto nel piano].
Segui il paragrafo 10 del file: costruisci la palestra, controlla che non possa scrivere sul sito vero né mandare email a persone vere, fai girare la batteria, spegni il database di prova a fine giornata, e chiudi con un referto e una PR.
```
