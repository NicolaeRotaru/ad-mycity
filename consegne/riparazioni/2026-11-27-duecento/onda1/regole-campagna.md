## Le regole di questa campagna (valgono SOPRA il foglio qui sopra e la scheda, dove li contraddicono)

- **Niente ultracode, anche con i gravi.** La campagna del 27/11 lavora senza ultracode (preventivo misurato sul 26/11). Non aspettare `is_ultracode_active`: comincia con `effort` xhigh. Vale anche per la tua 2.0.
- **Niente migrazioni nuove in quest'onda**, anche se la scheda ti dà una fascia. Se una voce chiede una migrazione, resta `parziale` con l'SQL esatto nella nota del referto: le migrazioni hanno un'onda a parte, alla fine.
- **La base** è l'integrazione della riparazione del 26/11 (`f1b35670`), con le sue onde 1-3 già unite. In fondo alla scheda ci sono le note del 26/11 voce per voce: una correzione già scritta (commit, diff, «manca solo…») si riprende da lì, non da zero. Comanda il codice della base.
- **Il limite di spesa** è scritto nell'ultima riga di questo messaggio. Leggi `usage.cost_usd` con `get_session` (senza id) prima di ogni lotto. Al 70% del limite non apri lotti nuovi: chiudi quello in corso e consegni.
- **Niente id di altre voci nei messaggi di commit** (`guardia-ramo` li ferma, e serve una firma di Nicola).
- **Mai** gli strumenti del database vero, della messa online o di Stripe, né tu né i tuoi subagenti: mettilo nel mandato di ogni subagente.
