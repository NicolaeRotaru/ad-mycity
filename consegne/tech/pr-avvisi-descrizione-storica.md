## Cosa cambia
Le caselle degli avvisi nel Pannello ora mostrano informazioni specifiche anche per gli avvisi vecchi (dal 11 luglio al 17 luglio) che non avevano il nome del file.

**Prima (tutti gli avvisi attuali):**
> "Il giro non è stato pubblicato perché uno dei file di memoria conteneva un dato sbagliato o corrotto."

**Dopo (avvisi con "vault-sanità ... conflitti/0-byte/frontmatter"):**
> "Il giro non è stato pubblicato per questi problemi:
> Uno o più file della memoria avevano righe di conflitto git — il Pannello avrebbe mostrato dati mescolati e illeggibili."

**Per i prossimi avvisi (con giro.sh aggiornato):**
> "Il giro non è stato pubblicato per questi problemi:
> "STATO.md" aveva righe di conflitto git — il Pannello avrebbe mostrato dati mescolati e illeggibili."

## Come provare
1. Azioni > tab Avvisi
2. Gli avvisi con "vault sporco" ora mostrano cosa avrebbe rotto (conflitti/vuoto/frontmatter/JSON)
3. Gli avvisi con "coerenza-fatti" mostrano che un valore vecchio era rimasto in un altro file

## Branch
fix/avvisi-descrizione-storica → main
