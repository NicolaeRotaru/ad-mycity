## Cosa cambia
- Le caselle degli avvisi mostrano una frase in italiano chiara invece del gergo di sistema
- Il testo tecnico raw passa in un accordion "Dettaglio tecnico" collassabile — invisibile di default
- 8 casi coperti: vault sporco, segreti trovati, dato senza fonte, Telegram non collegato, guardiani silenziosi, worker fermo, node mancante, fallback generico

Prima: si vedeva subito `vault-sanità rc=1 (conflitti/0-byte/frontmatter)`
Dopo: si vede "Il giro non è stato pubblicato perché uno dei file di memoria conteneva un dato sbagliato..."

## Come provare
1. Azioni → tab Avvisi
2. Verifica che la descrizione si legga come una frase normale
3. Clicca "Dettaglio tecnico" per vedere il testo raw
