---
data: 2026-11-01 14:20
sessione: S3 · legale, catalogo da file e home
pr: https://github.com/NicolaeRotaru/mycity/pull/276
---

# Sessione 3: l'ondata 5 è fatta, l'ondata 6 è ferma

## In parole semplici
Ho fatto la prima delle mie due ondate di riparazioni sul sito. Su 6 pacchetti di lavoro, 5 sono chiusi nel codice.
- **Chi c'è dietro il sito.** Le pagine dei Termini, del recesso e dei Contatti adesso nominano la persona che risponde, Nicolae Rotaru, non più solo il marchio MyCity.
- **Alimenti caricati da file.** Un alimento senza allergeni o ingredienti nasce come bozza, non in vendita.
- **Il controllo nel database.** La migrazione nuova 195 blocca anche nel database un alimento senza ingredienti, compreso quello esaurito che tornava in vendita da solo quando arrivava lo stock.
- **Lotto dalle foto.** Una lista ingredienti lunga non fa più cadere tutte le bozze insieme.
- **Riquadro «Venduto da».** Quando non trova i dati del negozio, adesso lo scrive nei registri.

L'ondata 6 non l'ho lanciata. Il tetto settimanale di uso era in «avviso», e la regola concordata dice di fermarsi lì.

## Cosa cambia per te
Le pagine legali dicono chi risponde, e un negozio di alimentari non può più vendere per sbaglio un prodotto senza la dichiarazione che la legge chiede. Il secondo punto vale **solo dopo** che la 195 sarà applicata in produzione.

## Cosa devi fare
1. **Dare i dati veri del titolare.** Servono indirizzo, telefono e, quando ci saranno, partita IVA e PEC, da mettere come variabili su Vercel. Non li ho inventati.
2. **Firmare la 126 e la 195 in produzione.** Prima conviene contare gli alimenti già in vendita senza ingredienti: la query è scritta in cima alla 195.
3. **Cambiare dal pannello il sottotitolo grande della home.** Oggi promette consegna «in 30-60 minuti» e «abbigliamento». Il testo proposto è già in LAVORO-APERTO.
4. **Decidere quando far ripartire l'ondata 6.** Contiene caricamento da file, categorie della home, privacy e esito delle segnalazioni.

## Cosa non ho verificato
- Le pagine non le ho aperte in un browser: le ho provate solo coi test automatici.
- La 195 l'ho provata su un database locale, mai su quello vero.
- Il titolo grande della home **non è riparato**. Il codice che lo mostra appartiene a un'altra sessione.
- Ho registrato la copertura della radiografia solo qui e non nel registro, perché il registro sta nella memoria e questa sessione non doveva scriverla.

---
**Dettagli tecnici**
- Ondata col motore snello, run `wf_318dd77b-a26`, 10 agenti. I due pacchetti senza giro di correzione (saltati per il tetto di 12 agenti) li ho corretti io:
  - **195:** trigger `zz_prodotti_alimentari_dichiarazioni` su ogni INSERT/UPDATE, dopo `trg_auto_republish`.
  - **Lotto dalle foto:** tolto il tetto di 8000 caratteri dallo schema.
- Prove:
  - `npm run verify`: verde, 7146 prove.
  - SQL locale: `apply.sh` 169 migrazioni e 0 fallite; `run.sh` tutto verde; database pieno regge; `applica-migrazioni-mancanti` ×2 (la prima applica 1, la seconda 0).
- Eccezione alla regola: `tests/sql/rls/12-…allergeni…` modificato in 2 righe, conseguenza diretta della 195.
- Gettoni del motore: 606.914 senza cache, 11,05 milioni con le letture dalla cache.
- Tutto il resto (nati, vecchi visti, fuori territorio, scelte) è nel `.json` accanto.
