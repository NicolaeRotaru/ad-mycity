---
tipo: brief
data: 2026-11-16 10:45
per: la regista O4 dell'onda 4 (campagna 2026-11-12-sito-tutto)
da: AD chat 5, session_015BmpnZ11jw7Gf6mFdaUGo9
---

# Brief della regista dell'onda 4: farla andare come l'onda 1

## L'ordine di Nicola (16/11, verso le 10:30)
«Fai in modo che vada come l'ondata 1» e «fai partire l'ondata 4».

## Perché: le misure (`cervello/riparazione/misure.json`)
- Onda 1: 6,34 $ per voce chiusa. Riparatori a 2,22 $ per voce lavorata, da 25 voci, con 5-10 revisori qa interni, senza ultracode. Regia 58 $.
- Onda 2: 27 $ per voce chiusa. Ultracode acceso, 11-15 subagenti per riparatore, 12 registe per 407 $.
- Onda 3, primo pezzo: circa 167 $ per 7 voci chiuse, circa 24 $ l'una.
  - Riparatori sotto-finanziati: circa 1,1 $ per voce, con 11 e 21 voci non fatte per il tetto (R26, R25).
  - Collaudatori pesanti: 2-4 revisori per voce, da 2,1 a 2,6 $ per voce (K12, K13).
  - Il grave sui soldi ha mangiato tutto R25.
- Collaudo economico già misurato: K08 terzo, 0,32 $ per verdetto.

## Le regole dell'onda 4
1. Ultracode spento su tutte le figlie (scelta di Nicola dell'onda 3, «3a»).
2. Riparatori da 25 voci, tetto 55 $ l'uno, consegna al 70% (circa 40 $). Restano i revisori qa interni, dentro il freno: 6 per i minori, 8 per i gravi.
3. Prima il già pagato: l'elenco A di `pronte` (riparate mai giudicate). Va in collaudo, non in riparazione.
4. Collaudo breve, come K08 terzo:
   - il verdetto parte dalla prova (rossa senza la correzione, verde con), fatta coi comandi;
   - al massimo 2 revisori, e solo sulle voci che toccano soldi, dati o permessi;
   - attesa 1,2 $ per voce; oltre 1,5 $ per voce il collaudatore scrive alla regista prima di andare avanti.
5. Regia leggera. Si aspetta con `sorveglia.sh --attendi`, non con catene di send_later. Si passa la mano a 250 mila token. La regia ha un tetto di 15 $.
6. Quattro cose restano fuori dall'onda 4. R27 e R25-001 aspettano la carta 258 di Nicola. La migrazione 501 non si tocca. L'elenco D sono domande per Nicola. I gravi sui soldi entrano solo se hanno già una prova rossa scritta.
7. Divisione per file con `dividi`. La base è la testa dell'integrazione dell'onda 3 (`claude/sito-onda-3` sul sito, `cb8effaa` o successiva).

## Il tetto
**Parte 1, fino a giovedì 19/11 alle 10:00: 170 $.** È il resto dei 350 $ firmati da Nicola fino a giovedì. Divisione indicativa:
- collaudo dell'elenco A: circa 20 $;
- 2 riparatori da 25 voci: circa 110 $;
- il loro collaudo: circa 17 $;
- controllore: circa 10 $;
- regia: circa 15 $.

**Parte 2, dopo giovedì 10:00, nel limite nuovo:** il resto delle circa 192 voci pronte. Il preventivo si fa con le misure della parte 1 e con una lettura nuova della percentuale. Non parte senza il «via» di Nicola.

## I passi
1. Aggiungi a `misure.json` la riga dell'onda 3, coi numeri della fermata della regia O3 quattro (`REGIA-ONDA-3.md`, commit `7ea6b67`).
2. F0 coi programmi (skill `riparazione`): `pronte`, `dividi --file-chiavi`, `schede`, `copertura-prima`, `segnaposti`.
3. Puoi aprire **subito** il collaudo dell'elenco A: costa meno di 100 $.
4. Fermata 1 breve all'AD, nei quattro blocchi. Dentro ci sono il perimetro in numeri e le sessioni. C'è anche il preventivo in tre numeri: minimo, atteso e massimo. L'atteso è il caso base, coi minori chiusi al 28%. Il massimo è il caso migliore, come l'onda 1 al 44%.
5. I riparatori si aprono solo quando l'AD ti gira il «via» con la percentuale del limite letta da Nicola (regola ㉗).
6. In ogni messaggio: il costo della tua sessione, il costo del lavoro e la percentuale del limite. Il valore di un punto è incerto: circa 30 $ o circa 200 $.

## A chi scrivi
Le fermate e gli esiti vanno all'AD con send_message. Il suo id te lo dà il primo messaggio.
