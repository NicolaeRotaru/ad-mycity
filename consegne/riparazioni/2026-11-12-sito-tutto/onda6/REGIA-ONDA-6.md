---
data: 2026-11-17 16:30
tipo: quaderno della regista
---

# Onda 6: il quaderno della regista

## In parole semplici
L'onda 6 è il pilota della ricetta per riparare i difetti piccoli del sito sotto i 10 $ l'uno. Prima si collauda il lavoro già pagato dell'onda 5 (14 voci), poi due riparatori sistemano 12 difetti piccoli a testa, mai tentati prima.

## Cosa cambia per te
Niente finché la PR non è pronta: quello che spetta a Nicola sarà scritto lì.

## Cosa devi fare
Niente adesso.

## Cosa non ho verificato
Quante voci reggeranno: lo dicono il collaudo e il controllore.

---

## Dettagli tecnici

### Chi
- Regia O6 `session_015BmpnYVx17cqeZ9Rq9pCde`, ramo ad-mycity `ccr-99009024-qgfisx-o6`. Aperta dalla regista O5 `session_015BmpnYvNwUpgfdhaKx9PKT`, via alle 16:08. Tetto regia 8 $, mano a 250 mila token.
- I06 integratore `session_015BmpnWbWa99pjAPQ98v6sz`, ramo sito `ccr-99009024-qgfisx-o6`, partenza `c83c3e4e6decc5c167bd0cefceb269364f388cd0`, tetto 6 $.

### La cartella
Una sola cartella per tutta l'onda: `onda6/`. Il programma `dividi` della campagna non accetta i difetti nati nelle onde (184 minori), per questo `perimetro --profilo scelta` su 87 chiavi.
- Onda 1 di questa cartella = **R01, la cucitura dell'onda 5** (base `70064c9da552c034a463452b60935f7a57bb469a`): 13 voci vive delle patch su main più R33-022 (diff dal referto di R33, la applica I06). Il referto lo scrive I06 con esito vero; K01 lo collauda come quello di un riparatore. Fuori: R31-012 (tolta in fcf20b78), R31-014 (patch da non applicare), R32-014 (tocca la cancellazione dei dati personali e copre metà voce: va nella PR per Nicola).
- Onda 2 = **R02 e R03, i riparatori** (base `c83c3e4e`), 12 minori ciascuno, nessun file in comune, nessun grave, niente soldi, permessi, migrazioni o dati personali. 49 minori leggeri restano per le onde dopo.

### Il conto dei disponibili (17/11 16:00)
Minori aperti mai dati a un'onda: 374. Meno 143 riservate, domande e senza percorso: 231 (47 del perimetro del 12/11, 184 nati). Meno 140 sensibili, 16 senza file, 2 coi file spariti: **73**. Non 200: per arrivare a 200 servono i minori sensibili (ultracode e revisori) o le B e C.

### Il tetto: 90 $ in tutto
Minimo 61 $ · atteso 81 $ · massimo 90 $. Per sessione: I06 6 $ · K01 8 $ · R02 e R03 consegna 24 $, tetto 28 $ · K02 12 $ · C01 6 $ · regia 8 $.

### La soglia, scritta prima
Sui 24 nuovi: si allarga con almeno 8 che reggono e C01 senza rosse fra queste; stop a 5 o meno; 6-7 secondo pilota con una novità sola. Passo 0: almeno 8 su 14 → collaudo dopo la cucitura regola fissa.

### Stato
- 16:13 primo commit `2f40e105`: decisioni, bacheca, scheda R01. Aperta I06 (fase 1: PR aperte del sito, R33-022, referto R01, valida-referto).
- 16:30 cartella unica `onda6/`: perimetro 87, dividi onda 2 verde, schede R02 e R03, copertura-prima e segnaposti verdi. Si spinge dopo l'elenco delle PR aperte di I06.
