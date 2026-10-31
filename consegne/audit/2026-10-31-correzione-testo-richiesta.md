**In breve:** dell'ondata di correzione reggono sei pacchetti su otto: la cassa dei contanti, le fasce, il cliente assente, le scorte, i pulsanti AI e i documenti.
**Per te:** uniscila, poi premi il pulsante delle migrazioni: applica la 171 e la 183.

## In parole semplici

È l'ondata che hai scelto per i pacchetti che non reggevano. Sei su otto adesso reggono, e sono qui. Due restano fuori: i rimborsi e l'ingresso.

- **La cassa dei contanti:** se l'ordine si salva e poi la rete resta giù, al tocco dopo la cassa non dice più «fatto» per un ordine senza articoli.
- **Le fasce e le ferie:** un negozio che segna tutti i giorni chiusi non riceve ordini, e la scheda prodotto non promette la consegna.
- **Il cliente assente:** il fattorino lo segna dalla pagina della consegna. L'ordine si annulla col rimborso intero, la merce torna al negozio, e i Termini lo dicono così. Se il credito non torna, il cliente non legge «ti abbiamo rimborsato tutto».
- **Le scorte:** se il negoziante scrive per caso lo stesso numero a cui il magazzino è arrivato con una vendita, il sito lo avvisa invece di salvare in silenzio.
- **I pulsanti AI:** con l'AI spenta non compaiono più, nemmeno nell'assistenza.
- **I documenti a metà:** si cancellano dopo 30 giorni, come hai scelto, e il registro attività non copia più i nomi legali.

Un esempio. Martedì il fattorino suona da Maria, telefona e lei non risponde. Tocca «cliente assente»: l'ordine si annulla, Maria non paga niente e il pane torna da Pane Quotidiano.

## Cosa cambia per te

- **Ci sono due migrazioni nuove.** La 171 fa scadere i documenti. La 183 toglie i nomi legali dal registro attività.
- **I rimborsi restano come oggi.** La correzione apriva un caso nuovo coi carrelli di due negozi.
- **L'ingresso resta come oggi.** Il riparo vero passa da un'impostazione del pannello di Supabase: te l'ho scritto in chat.

## Cosa devi fare

- **Unire questa richiesta.**
- **Premere il pulsante delle migrazioni** per la 171 e la 183.

## Cosa non ho verificato

- **Le migrazioni le ho provate su un Postgres locale,** non sul database vero.
- **Alcune correzioni sono parziali, e stanno nel registro.** I negozi che hanno segnato le ferie prima di questo rilascio restano da sistemare. L'avviso «fuori zona» prima di «Ordina» manca ancora.

---

## Dettagli tecnici

- Pacchetti, sopra il ramo della richiesta delle ondate 3 e 4:
  - CA `fix/ondata-3-app-api-orders-cod-route-ts`;
  - CF `fix/ondata-3-components-checkout-deliveryslotpicker-t`, con in più `fe01273a`: l'interruttore del ritiro in `lib/ritiro-in-negozio.ts`, per un giro di import che fermava la costruzione su `/api/admin/branding`;
  - AN `fix/ondata-3-lib-ordini-annulla-ts`;
  - SKA `fix/ondata-4-lib-products-salvataggio-tracciato-ts`;
  - AIH `fix/ondata-4-components-seller-quickaitools-tsx`;
  - KY2 `fix/ondata-4-lib-privacy-potature-ritenzione-ts`.
- Fuori: PB (`lib/stripe/payout.ts`) e il pacchetto dell'ingresso, «non regge» dopo il giro di correzione.
- Collaudi: run `wf_38a26116-fd4` e `wf_868abf3a-e69`.
- `npm run verify`: verde, 792 file e 6.892 prove su 6.892.
- Prove nel browser in locale, sul sito costruito come nella CI: 70 passate, 6 saltate.
- Prove SQL su Postgres 16 locale: `apply.sh`, `run.sh` e `migrazione-su-database-pieno.sh` verdi; `applica-migrazioni-mancanti.sh` due volte, al secondo giro «applicate 0».
- Referto: `consegne/audit/2026-10-31-ondata-correzione-3-4.json` nel deposito della memoria.
