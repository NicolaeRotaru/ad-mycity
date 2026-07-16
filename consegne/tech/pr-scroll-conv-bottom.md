## Problema
Aprendo una conversazione dal cassetto, la chat mostrava i messaggi dall'inizio (scroll in cima). Nicola doveva scrollare tutta la conversazione per arrivare al fondo.

## Fix
Aggiunto useEffect([convId]) con doppio requestAnimationFrame: ogni cambio di conversazione attiva porta la chat immediatamente al fondo.

## Come testare
1. Apri il cassetto Conversazioni
2. Clicca su una conversazione passata
3. La chat deve mostrare subito l'ultimo messaggio (fondo), non l'inizio
