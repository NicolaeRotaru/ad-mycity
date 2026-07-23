## Cosa

Aggiunta a `pannello/vercel.json`: `"github": { "autoJobCancelation": false }` — impostazione UFFICIALE
di Vercel (non un trucco nostro) che dice a Vercel di costruire i push **in sequenza** invece di
cancellare il deploy in corso ogni volta che arriva un commit più nuovo sullo stesso branch.

## Perché

Il fix di stasera (`cervello/worker.sh`, la "pausa" dopo un merge) copre solo UN caso: il mio commit
di log scritto subito dopo un mio merge. Ma Nicola ha provato un "Redeploy" manuale su Vercel e si è
comunque interrotto — perché la causa vera è più a monte: **Vercel, di default, cancella qualsiasi
deploy in corso appena arriva un nuovo commit su quel branch**, prima ancora di sapere se quel commit
verrà davvero costruito o scartato dal filtro `ignoreCommand`. Con questa chat che scrive su `main`
quasi a ogni messaggio, QUALSIASI deploy (merge, manuale, automatico) rischia di essere interrotto da
un mio prossimo commit — non solo quelli subito dopo un merge.

Verificato sulla documentazione ufficiale Vercel (non un'ipotesi): la proprietà
`github.autoJobCancelation` esiste esattamente per questo — quando è `false`, Vercel accoda i build
invece di cancellarli. Fonte: https://vercel.com/docs/project-configuration/git-configuration
("github.autoJobCancelation ... When set to false, Vercel for GitHub will always build pushes in
sequence without cancelling a build for the most recent commit").

Questo fix è complementare a `ignoreCommand` già presente nello stesso file: `ignoreCommand` scarta
velocemente i commit che non toccano `pannello/` (quindi non intasa la coda con build inutili);
`autoJobCancelation: false` garantisce che i pochi commit che TOCCANO `pannello/` (i merge veri)
arrivino sempre in fondo, anche se un altro commit arriva mentre stanno ancora costruendo.

## Come provare

1. Verifica JSON: non sono riuscita a far girare `node -e` per validare la sintassi — bloccato dai
   permessi headless di questa sessione (stesso tipo di blocco già visto stasera su `bash -n`). Ho
   riletto il file a mano: la struttura ricalca esattamente l'esempio nella documentazione ufficiale
   citata sopra (stessa indentazione, stesse virgolette, stessa chiave `github.autoJobCancelation`).
2. Dopo il merge, il prossimo deploy reale da un cambio a `pannello/` dovrebbe comparire su Vercel
   come "Queued" invece di "Canceled" se arriva un commit mentre sta ancora costruendo, e finire in
   fondo (anche se con qualche minuto di ritardo) invece di sparire.

## Rischio

Basso — è una sola proprietà di configurazione documentata da Vercel stesso, pensata apposta per
questo scenario. L'unico costo è che, se arrivano molti commit ravvicinati, i build si accodano invece
di saltare direttamente all'ultimo: possono volerci più minuti perché un deploy compaia online, ma
prima o poi arriva — invece di non arrivare mai come succede oggi.
