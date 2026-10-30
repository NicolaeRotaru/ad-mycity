---
data: 2026-10-30 21:40
tipo: costruzione
fonte: AD digitale
richiesta: «vai, costruisci il motore snello» (Nicola, 30/10/2026, sera)
---

# Il motore snello delle ondate è costruito

**In due righe.** Ci sono due pezzi nuovi. Il primo è uno strumento che toglie la correzione e controlla che la prova torni rossa, senza agenti. Il secondo è il giro d'ondata snello, con un collaudo solo per tutta l'ondata e al massimo 12 subagenti.

## In parole semplici

Prima un passo indietro. Un'ondata ripara fino a cinque gruppi di difetti del sito. Fino a oggi, per ogni gruppo, uno o due agenti controllavano a mano se la prova della squadra «morde». Mordere vuol dire che la prova diventa rossa quando il difetto c'è.

Adesso quella domanda la fa uno strumento. Toglie la correzione un file alla volta e rilancia la prova, che deve diventare rossa. Poi rimette tutto com'era, e la prova deve tornare verde. Esempio: se la somma del carrello è sbagliata e la squadra la corregge, lo strumento rimette la somma sbagliata e guarda la prova cadere.

Poi un solo collaudatore guarda tutta l'ondata, invece di uno o due per ogni gruppo. Diventano due solo se l'ondata tocca soldi, dati o permessi. Se un gruppo viene bocciato, c'è un giro di correzione, e poi ricontrolla solo la lente che l'ha bocciato. Se non basta, il giro si ferma e ti chiede.

## Cosa cambia per te

- **La prossima ondata parte col giro nuovo**, con al massimo 12 subagenti invece di 45. Esempio: cinque gruppi con dei soldi in mezzo fanno cinque squadre e due collaudatori, cioè sette subagenti, se nessun gruppo viene bocciato.
- **Il manuale che ogni agente rilegge a ogni passo è più corto**: da 35.812 a 30.218 byte. I comandi rapidi per esteso stanno nel menù dei comandi.
- **L'agente leggero per le squadre non c'è.** In 37 posti, tra strumenti e prove, la macchina conta i suoi agenti come «i 120 senior». Un tipo in più li farebbe sbagliare tutti, e sistemarli costava più di quanto risparmia.

## Cosa devi fare

- Unire la richiesta di stasera, se ti va bene: è la carta #223.
- Poi dirmi se parto con la prima ondata snella: la cassa che legge gli orari di Pane Quotidiano.

## Cosa non ho verificato

- **Il giro nuovo non ha mai girato su un'ondata vera.** L'ho provato su un motore finto, in 20 scenari su 20 verdi. Il costo vero lo misuro sulla prima ondata.
- **Lo strumento non l'ho provato con le prove vere del sito**, perché qui il sito non ha le sue librerie. L'ho provato su piccoli repo git, in 22 casi su 22 verdi.
- **Un nome nuovo usato in un modo che non riconosco** può ancora sfuggire. Per esempio una prova che controlla solo che esista `api.doppio`, dentro un oggetto che c'era già. Per questo il collaudatore rilancia la prova e cerca la variante: la macchina viene prima, non da sola.
- **Se lo strumento viene ucciso di colpo** (kill -9) a metà, un file resta com'era alla base. La correzione però non si perde, perché sta nel commit. La corsa dopo si ferma e dice il comando per rimetterlo.

## Il collaudo

Un agente che non ha costruito niente ha provato a rompere il lavoro, in tre giri.

- **Primo giro: 4 difetti gravi e 13 minori.** Il più importante: lo strumento dava per buona una prova che cadeva solo perché mancava un nome nuovo. Li ho corretti tutti, ognuno con una prova che lo rifà.
- **Secondo giro: i 4 gravi erano chiusi, ma ne erano nati 2 nuovi.** Stavano tutti e due nel salvataggio che doveva proteggere da un kill -9: in un caso scriveva una versione vecchia sopra lavoro più nuovo.
- **Terzo giro: un altro caso raro, sempre nel salvataggio.** Era il quarto difetto nato da quel pezzo. Allora l'ho tolto: lo strumento lavora solo su file già committati, e così dopo un'interruzione la correzione giusta è sempre nel commit.

Ogni protezione l'ho anche rotta di proposito, una alla volta. Ogni volta la sua prova è diventata rossa.

---

## Dettagli tecnici

- `cervello/prova-rimessa.mjs` e la sua prova `cervello/test/la-correzione-tolta-deve-far-cadere-la-prova.test.mjs` (22 casi). Uscite: 0 regge · 1 non regge · 2 non provato · 3 la macchina non decide · 4 non ripristinato. Legge git da `gitEsegui` (`cervello/git-github.mjs`), che ha l'opzione nuova `grezzo`: i byte esatti, senza trim. La prima versione aveva un suo `execFileSync("git")`, e il cancello del commit l'ha fermata (malattia `git-letto-senza-tetto`).
- `.claude/workflows/ondata-snella.js` e la sua prova `cervello/test/ondata-snella.test.mjs` (20 scenari). Tetto 12, posti del collaudo tenuti da parte, un giro di correzione, ricollaudo per lente, vecchi args rifiutati.
- Il tipo `squadra-sito` non nasce: `.claude/agents/` lo enumerano 19 strumenti e 18 prove (`grep -l` del 30/10).
- `CLAUDE.md`: comandi rapidi in elenco corto; il testo per esteso è in fondo a `COMANDI.md`; il comando «lancia l'ondata N del sito» porta a `ondata-snella`.
- Permessi: `consegne/sicurezza/2026-07-29-permessi-senza-jolly.md` rigenerata (`node cervello/permessi-elenco.mjs --consegna`) e la carta #42 con `prova-rimessa.mjs`.
- Collaudo: un agente `tech`, quattro giri; contatore del motore 153.461 + 214.859 + 242.828 token per i primi tre. Il salvataggio di <tmp>/prova-rimessa è tolto: blocco e log stanno in `git rev-parse --absolute-git-dir`, e un file non committato in `--file` esce 2.
