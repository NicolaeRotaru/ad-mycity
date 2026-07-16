## Problema
Aprendo il cassetto Conversazioni con la chat lunga e lo scroll in fondo, il cassetto appariva fuori dallo schermo — bisognava scrollare fino in cima per trovarlo.

## Causa
Il cassetto usava `absolute` (posizionato rispetto alla sezione chat, non allo schermo). Se la sezione inizia a y=0 ma sei scrollato a y=800, il cassetto finisce 800px più su del punto in cui sei.

## Fix
Cambiato da `absolute` a `fixed` con `top: var(--altezza-testata)` — la stessa variabile usata dalla sidebar.
Il cassetto (sfondo + pannello) appare sempre subito sotto la navbar, esattamente dove sei in quel momento.
Funziona su mobile e desktop.

## Come testare
1. Apri una chat lunga e scrolla fino in fondo
2. Premi il pulsante Conversazioni
3. Il cassetto deve apparire subito, senza bisogno di scrollare
4. Se sei in cima alla chat, il cassetto parte comunque da sotto la navbar (non la copre)
