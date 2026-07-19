## Cosa
Su mobile in navbar si vedeva solo «My» — «City» era tagliato.

## Perché
Nella riga flex mobile il wordmark si restringeva (flex-shrink) per fare spazio a CAP e carrello.

## Fix
- Logo e carrello: `shrink-0` (non si comprimono mai)
- CAP al centro in colonna `flex-1` con `min-w-0`

## Come provare
1. Apri il sito su telefono (o DevTools mobile ~390px)
2. In alto a sinistra deve comparire **MyCity** per intero
3. CAP al centro, carrello a destra — nessuno copre l'altro
