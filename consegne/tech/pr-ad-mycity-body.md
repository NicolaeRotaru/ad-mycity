## Cosa
Rete di sincronizzazione in tempo reale per tutto il Pannello: quando firmi un'azione, chiudi un difetto in Radiografia, o finisce un lavoro dalla chat di una casella, **tutte** le caselle collegate si aggiornano subito (non dopo 30–60s).

## Perché
Oggi ogni area legge da sola con polling isolato. Nicola segnala che un fix in Radiografia macchina non sparisce subito da «Da approvare» e viceversa — mancava un bus condiviso tra le caselle.

## Come funziona
- Nuovo `panel-sync.ts`: evento `mycity:sync` con scope (`azioni`, `radiografia`, `memoria`, `lavori`, `all`)
- `emitSync()` quando: approvi/rifiuti un'azione, finisce un lavoro chat/casella, worker completa
- `usePanelSync()` su: Radiografia macchina, Auto-coscienza, Salute sito, Plancia, Azioni, card salute
- I link `{origine: difetto:…}` restano il filo nel vault; la rete propaga il refresh istantaneo

## Come provare
1. Apri Radiografia macchina e Azioni › Da approvare in due schede (o stessa scheda, aree diverse)
2. Firma un'azione collegata a un difetto (o chiudi un fix via chat casella)
3. Verifica che il difetto sparisce dal cantiere, l'azione sparisce da «Da approvare», e il badge sulla Plancia si aggiorna **senza refresh manuale** (entro 1–2 secondi)
