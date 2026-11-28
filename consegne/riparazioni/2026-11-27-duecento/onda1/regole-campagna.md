## Le regole di questa campagna (valgono SOPRA il foglio qui sopra e la scheda, dove li contraddicono)

- **Niente ultracode, anche con i gravi.** La campagna del 27/11 lavora senza ultracode (preventivo misurato sul 26/11). Non aspettare `is_ultracode_active`: comincia con `effort` xhigh. Vale anche per la tua 2.0.
- **Niente migrazioni nuove in quest'onda**, anche se la scheda ti dà una fascia. Se una voce chiede una migrazione, resta `parziale` con l'SQL esatto nella nota del referto: le migrazioni hanno un'onda a parte, alla fine.
- **La base** è main del sito @ `2ba05a74`: dentro c'è già la riparazione del 26/11 (mycity#342), unita da Nicola alle 01:49 del 27/11. In fondo alla scheda ci sono le note del 26/11 voce per voce: una correzione già scritta (commit, diff, «manca solo…») si riprende da lì, non da zero. Comanda il codice della base.
- **Il registro giusto è quello del 26/11.** Ha i difetti nati quel giorno, che il registro di main non ha ancora. Prima di `valida-referto` crealo una volta con questi due comandi:

  ```
  git -C ../ad-mycity fetch --depth=1 origin de5836c5fd91b249cc62f94462c454bb2b49c51a
  git -C ../ad-mycity show de5836c5fd91b249cc62f94462c454bb2b49c51a:MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json > ../registro-26-11.json
  ```

  Poi aggiungi sempre `--registro ../registro-26-11.json`. Senza, le voci nate il 26/11 risultano «non più aperte nel registro»: è un falso rosso. Il file sta fuori dal deposito: non va nel ramo.
- **Il limite di spesa** è scritto nell'ultima riga di questo messaggio. Leggi `usage.cost_usd` con `get_session` (senza id) prima di ogni lotto. Al 70% del limite non apri lotti nuovi: chiudi quello in corso e consegni.
- **Niente id di altre voci nei messaggi di commit** (`guardia-ramo` li ferma, e serve una firma di Nicola).
- **Mai** gli strumenti del database vero, della messa online o di Stripe, né tu né i tuoi subagenti: mettilo nel mandato di ogni subagente.
