## Cosa cambia
- Ogni casella peer review ora mostra: voto (es. 6/10), punti di forza, da migliorare, raccomandazione
- Corretti i nomi dei campi: reviewer/reviewed ora riconosciuti accanto ai vecchi autore/revisori
- Retrocompatibile con strutture vecchie (autore/revisori ancora supportati)

## Perché
Il componente leggeva solo lavoro e autore ma il JSON usa reviewer, reviewed, voto, punti_forza, punti_deboli, raccomandazione. Il 90% del contenuto era invisibile.

## Come provare
1. Vai su Auto-Coscienza, tab Miglioramento, sezione "I senior si migliorano a vicenda"
2. Ogni peer review deve mostrare titolo con voto (es. 6/10), lista verde punti forza, lista rossa da migliorare, raccomandazione in fondo
