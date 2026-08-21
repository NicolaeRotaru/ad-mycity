## In parole semplici
La sentinella che avvisa "quaderni fermi" (i quaderni dei 120 senior senza una riga di esito da
una settimana) suggeriva di risolverla con `node cervello/letargo.mjs` — ma quel comando non c'entra
niente: gestisce il risparmio quota-AI/runway/cecità-sensori, non i quaderni dei senior. Chi avesse
provato a lanciarlo aspettandosi che "dichiarasse dormiente" un reparto avrebbe trovato un comando
che parla d'altro.

## Cosa cambia per te
Nessun comportamento della macchina cambia: solo il TESTO dell'avviso. Ora dice chiaramente che il
comando per dichiarare dormienti i ruoli mai attivati **non esiste ancora** — va costruito e firmato
da te, non è già lì sotto mentite spoglie.

## Cosa devi fare
Niente per forza. Se vuoi che la macchina smetta di segnalare come "malati" ogni sera i reparti mai
attivati (72 su 120, vedi card #quaderni_fermi in Sala), dimmelo e preparo la proposta vera — oggi
`cervello/chiusura-loop.mjs` non distingue "mai delegato" da "ha lavorato e si è fermato": li conta
insieme come "fermi".

## Cosa non ho verificato
Non ho controllato se ci sono ALTRI riferimenti a comandi inesistenti nelle altre card di
`cervello/sentinella-dati.mjs` (ne ho controllate solo due, quella toccata e quella gemella
AR-194 "senior_mai_usati" che invece è corretta — propone letargo come CONCETTO, non come comando).

## 🔧 Dettagli tecnici
- File: `cervello/sentinella-dati.mjs`, riga 634 (card `quaderni_fermi`, AR-595).
- Verifica: lettura completa di `cervello/letargo.mjs` + grep `senior|reparto` → zero funzioni legate
  ai quaderni dei senior; è puro asse quota-AI/runway/cecità-sensori (AR-589).
- Prova: `node --test cervello/test/c6-quaderni-fermi.test.mjs cervello/test/c6-senior-mai-usati.test.mjs`
  → 12/12 verdi (i test controllano solo che il testo contenga "dormienti" e il comando `registra`,
  non la stringa sbagliata — quindi il fix non li rompe).
- Nessuna migrazione, nessun comportamento runtime cambiato: solo il prompt mostrato in Sala/Pannello.
