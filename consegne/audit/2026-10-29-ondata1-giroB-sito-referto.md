---
tipo: referto
reparto: AD
data: 2026-10-29 15:38
colore: 🟡
titolo: L'ondata 1 del sito è completa — cassa, promesse e sì/no nella richiesta di unione #263
---

# L'ondata 1 del sito è completa — cassa, promesse e sì/no nella richiesta di unione #263

> **In due righe.** La cassa in contanti e le frasi pubbliche, i due pacchetti fermi da ieri, adesso reggono. Sono nella richiesta di unione #263 con i tre pacchetti di ieri, e il controllo completo del sito è verde: 6.144 prove su 6.144.

## In parole semplici

Ieri sera l'ondata 1 si era fermata a metà. Tre pacchetti reggevano. Due no: le promesse, per i «30-60 minuti», e la cassa in contanti, per un ordine che poteva andare perso. Tu hai scelto un giro in più su tutti e due.

Oggi il giro è andato così. La cassa ha retto al primo colpo. Le promesse si sono fermate di nuovo, sul conto alla rovescia della home. Ho scoperto che le cinque frasi buone erano già nel ramo di ieri, con una frase semplice per la home. Tu hai scelto di unire quelle («promesse A»). Il collaudo le ha tenute buone, e la radiografia ha trovato un solo difetto nato: il sì/no delle caratteristiche. L'ha riparato un mezzo giro, e ha retto.

In mezzo hai deciso il prezzo della consegna: 3 euro, 50 centesimi in più sotto i 10 euro, 50 centesimi in più per la veloce. Alle 16:13 l'hai cambiato: 3 euro, 4 euro per la veloce, e 4 euro sotto i 10 euro con la veloce compresa. Il prezzo è scritto in memoria. Nel codice arriva col suo pacchetto, dopo questa unione.

## Cosa cambia per te

- **La cassa in contanti non fa più ordini doppi nei casi riparati.** Esempio: Maria ordina il pane, il server risponde «non riusciamo a controllare il tuo ordine», e lei ritocca «Ordina». Prima nasceva un secondo ordine. Adesso il sito le dice di aspettare, e l'ordine resta uno. E la cassa non prende più per buono l'ordine di un altro carrello: era il caso dell'ordine perso di ieri.
- **Il sito dice il vero in sei punti.** Il pagamento è solo in contanti finché la carta è spenta. Il carrello dice il 10% che teniamo. Nessun telefono finto. «Vegano false» non c'è più. Il dialogo di conferma tiene il fuoco. La home non promette «oggi» la domenica.
- **Nel registro del sito ci sono 35 voci nuove**, dalla 1759 alla 1793, e una sale di gravità. I gravi nuovi sono 5. Uno solo era nato dal giro, il sì/no, ed è riparato. Gli altri 4 c'erano già sul sito di ieri:
  - Una risposta persa fa dire «fatto» col vecchio ordine.
  - Il database salva un ordine mentre la risposta dice errore.
  - La scheda prodotto conta fino alle 18 anche per un forno che chiude alle 13.
  - Il titolo della home dice «Paghi come vuoi».
  La voce 69 sale a grave: la FAQ promette il POS al fattorino, che non ce l'ha.

## Cosa devi fare

- **Guardare la richiesta di unione #263 del sito e, se va bene, unirla.** Non ha migrazioni. Dopo l'unione chiudo nel registro 14 difetti.
- **Unire la #898 della memoria**, che porta il prezzo della consegna, le carte #220 e #221 e questo referto.

## Cosa non ho verificato

- **Niente sul sito vero.** Le prove girano sul codice, col database e le letture simulati. In produzione la cassa resta ferma finché su Vercel manca la chiave di servizio del database.
- **La radiografia dei cinque file del sì/no** l'ho registrata sul riesame del mezzo giro, che li ha guardati con le stesse lenti dopo l'ultima modifica. Non è una radiografia separata.
- **Il prezzo della consegna** l'ho controllato sui conti del sito, non sul codice: nel codice non c'è ancora.

---

## I pacchetti

| Pacchetto | Esito | Difetti chiusi | Cosa resta |
|---|---|---|---|
| Cassa in contanti | regge al primo collaudo | 1209, 1208, 1755, 1756, 1757, 1758 | 23 (la fascia scelta: fuori territorio), 1742 (la rotta che cade dopo il primo ordine) |
| Promesse, ramo di ieri | regge al collaudo a due lenti | 255, 252, 120 con la 266, 1206, 249, 256 | le frasi dei 30-60 minuti: col pacchetto del prezzo |
| Sì/no delle caratteristiche (mezzo giro) | regge | 1778 | 5 minori nel registro |
| Promesse, conto alla rovescia di oggi | non entra | — | 8 gravi nati: la home si calcolava un calendario suo invece di chiederlo alla cassa |

## Il conto

| Lavoro | Agenti | Gettoni senza le riletture | Gettoni con le riletture |
|---|---|---|---|
| Giro B | 19 | 2.293.581 | 40.190.561 |
| Vaglio e contro-vaglio | 9 | 1.805.416 | 39.939.617 |
| Collaudo delle promesse | 2 | 493.489 | 15.629.319 |
| Perimetro delle promesse | 3 | 503.325 | 14.439.572 |
| Mezzo giro del sì/no | 4 | 332.398 | 4.897.522 |
| **Sito, totale** | **37** | **5.428.209** | **115.096.591** |
| Analisi del prezzo della consegna | 9 | 1.410.026 | 18.471.479 |

Un vaglio l'ho lanciato per sbaglio con una sola segnalazione invece di 29, e l'ho fermato subito: non ha lasciato misure.

---

## Dettagli tecnici

- Piani:
  - `consegne/audit/2026-10-29-ondata1-giroB-sito.json` (`--ondata 11`, base `fff2c3e`; 253 e 1516 rinviate al pacchetto del prezzo);
  - `consegne/audit/2026-10-29-ondata12-sisno-sito.json` (`--ondata 12`, base `6cdb4f1`).
- Run:
  - giro B `wf_8774d9cc-eb7`;
  - vaglio `wf_5fe12725-8cb`;
  - collaudo `wf_f24a412a-336`;
  - perimetro `wf_656030ba-22b`;
  - mezzo giro `wf_d0a5cee9-177`;
  - prezzo `wf_dc8a1e45-5a6`;
  - vaglio fermato `wf_c3ff549c-a47`.
- Ramo del sito `ccr-b2418a18-982q9d`, da `0df7945` a `2b1737b`:
  - cassa: `2de6025`, `d9de94b`, `eac65b0`, `bc79688`, con i file identici a `fe8aee8`;
  - promesse: `e414ab3`, `1eb05fc`, `6cdb4f1`;
  - sì/no: `2b1737b`.
- `npm run verify` sul ramo finale, installato come la CI (`npm ci --legacy-peer-deps`): 683 file, 6.144 prove. Prima: 679 e 6.099 (cassa), 682 e 6.117 (più le promesse).
- `node cervello/radiografia-in-corsa.mjs --repo ../mycity`: verde, 29 file su 6 dimensioni.
- Registro:
  - voci 1759-1793;
  - `meta` {findings 1794, bloccanti 35, gravi 529, minori 1230};
  - note su 1742, 23, 266, 50, 261, 247, 68 e 69 (sale a grave);
  - conto ⑨: 0 scritte male.
- Le voci del ramo fermo `37732cb` non entrano nel registro: descrivono codice che non arriva su main.
- Debito del motore, già scritto ieri: le scelte firmate non arrivano alle squadre da sole. Le ho scritte io nelle schede, come `scelta_di_nicola`, in 14 difetti su 14 del giro B e in quello del mezzo giro.
