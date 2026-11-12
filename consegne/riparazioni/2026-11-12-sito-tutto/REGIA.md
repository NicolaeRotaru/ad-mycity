---
tipo: quaderno-di-bordo
data: 2026-11-12 15:10
per: la sessione regista della campagna (skill `riparazione`)
---

# La regia della campagna «sito, tutto» — il quaderno di bordo

> Chi legge è la **regista**: una sessione sua, aperta dall'AD perché Nicola ha chiesto che i lavori di ore
> stiano in sessioni separate (12/11, «suddividilo in altre sessioni», e regola ㉔ di `cervello/MANUALE-AD.md`).
> Prima leggi la skill `.claude/skills/riparazione/SKILL.md` e `cervello/MANUALE-AD.md`. Questo foglio dice
> solo cosa è già fatto e cosa cambia rispetto alla skill. La storia va in `DECISIONI.md`, non qui.

## Le scelte di Nicola (12/11, in chat con l'AD)
- Casa `sito`, profilo `tutto`. **Riparatori da 25 voci al massimo**, quindi tre onde. Fermate: prima dell'onda 1,
  dopo l'onda 1, dopo l'onda 2.
- **Un controllore oltre ai collaudatori** («stai per fare un lavoro gigantesco… non voglio che con la prossima
  radiografia trovo errori che c'erano già»). Si possono aprire altre sessioni per farlo bene.
- Nicola parla solo con l'AD, nella sessione `session_015BmpnWWfcmEfYEhQ25M7s2`. Ogni fermata e il messaggio finale
  vanno lì con `send_message`, nei quattro blocchi (`cervello/scrittura-umana.md`). Il «via» arriva da lì.

## Cosa è già fatto
- `perimetro.json`: 662 lavorabili su 828 aperti (5 bloccanti, 74 gravi, 583 minori). Fuori: 88 riservate,
  67 con domanda per Nicola, 11 senza percorso. Base del sito `db5164c52e856c0e3eab1c02197ae755fca76eb3`.
- `piano.json`, onda 1 divisa con `--per-sessione 25`: 12 sessioni, 300 voci, 362 all'onda dopo.
  Simulazione delle onde dopo: onda 2 con 12 sessioni e 233 voci, onda 3 con 6 sessioni e 85 voci, poi
  la cucitura (al massimo 40) e circa 4 voci di eccedenza.
- `sorveglia.sh <onda>`: un giro intero di sorveglianza in un comando (riparatori, collaudatori, unione).
  Stampa solo i rossi.
- CI di ad-mycity#944: il guardiano dei fatti ora esenta la fotocopia del registro (`registro-compatto.txt`).

## Cosa resta della preparazione (F0)
1. `add_repo` di `NicolaeRotaru/mycity` con accesso `push`. Clona accanto ad `ad-mycity` come `../mycity`, poi `npm ci`.
   Il ramo di integrazione sul sito è il ramo che ti è permesso spingere lì. Chiamalo RAMO_SITO.
2. `node cervello/riparazione-sessioni.mjs schede --cartella <C> --ramo <RAMO_SITO> --regista <il tuo id>`.
   Poi `copertura-prima` e `segnaposti`, tutti e due verdi.
3. Commit e push su `claude/sweet-galileo-0skkay` di ad-mycity, che è la PR #944. Lo SHA è `SHA_REGISTA`.
4. Se il «via» di Nicola è già arrivato col brief, parti con F1. Altrimenti manda all'AD i numeri e aspetta.
5. Ogni onda dopo: `dividi --base <SHA integrazione> --per-sessione 25`. Sull'onda 3 aggiungi `--ultima`.

## Il controllo, in quattro strati
1. **Programmi**: `sorveglia.sh` ogni 30 minuti. In più `copertura-prima`, `valida-referto`, `valida-collaudo`
   e `prova-unione` come da skill.
2. **Collaudatori** (sessioni separate, come da skill). Guardano tutti i gravi e i bloccanti, due lenti dove ci
   sono soldi, dati o permessi, e un campione dei minori che il programma ricalcola.
3. **Controllore d'onda** (sessione nuova `…-cNN`, mai chi ha riparato o collaudato), dopo l'unione di ogni onda:
   - rilancia con un programma il `verifica_comando` di **ogni** voce che si chiude, sul ramo unito;
     se una è rossa, torna aperta;
   - guarda ogni file toccato dall'onda con la lente della sua dimensione (`radiografia-in-corsa`, un subagente
     per dimensione). Ogni difetto nuovo entra nel registro come nato, prima che la PR esca di bozza;
   - su `conti` incrocia le chiavi: ogni voce dell'onda è chiusa, aperta con la nota, o rimandata. Mai sparita.
4. **Controllore finale**, dopo la cucitura: gli stessi tre controlli su tutto il diff da `BASE` all'integrazione.
   In più, se la palestra è accesa, un giro dei flussi che incassano: ordine in contanti, rimborso, bonifici.
   Il giro si fa sull'anteprima e sul database di prova, mai sulla produzione. La PR esce di bozza solo con
   tutti e quattro gli strati verdi.

## Quando ti fermi e scrivi all'AD
Le fermate della skill, più queste:
- la quota: `get_session` a ogni giro; se `isUsingOverage` o un blocco, si ferma tutto;
- un controllore rosso su più di 1 voce su 10 dell'onda;
- il costo misurato (`usage.cost_usd` di ogni sessione) che supera il preventivo.

## Preventivo detto a Nicola
Circa 1.300-1.500 $ di consumo: riparatori ~900 $, 10 collaudatori e 4 controllori ancora da misurare. Il conto
vero si legge da `get_session`, campo `usage.cost_usd` di ogni figlia, e va detto a ogni fermata.
