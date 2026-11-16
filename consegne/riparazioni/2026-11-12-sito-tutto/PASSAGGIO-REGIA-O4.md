# Passaggio della regia dell'onda 4

La prima regista deve passare la mano. Ha usato 282 mila token di contesto, oltre la soglia di 250 mila fissata per il cambio. Ha speso 13,95 $ dei 15 del suo tetto.

La nuova regista non è ancora aperta, perché l'apertura è stata fermata. Decide l'AD. Le regole restano le stesse. Per Nicola c'è un'eccezione da firmare, descritta più sotto.

Alla nuova regista restano tre cose: le consegne dei riparatori, il collaudo breve e la chiusura dell'onda. Il lavoro dei riparatori finora è stato guardato solo con la guardia e con i loro resoconti.

---

## Dettagli tecnici

Leggi prima: il brief dell'AD in `consegne/ad/2026-11-16-brief-regia-onda-4.md`, che sta sul ramo ccr-546d3724-qilkcw. Poi il diario `REGIA-ONDA-4.md` di questa cartella, con le 7 regole e il tetto di 170 $ per la parte 1 fino a giovedì 19/11 alle 10:00. La parte 2 non parte senza il «via» di Nicola.

### Chi lavora adesso

| Ruolo | Sessione | Ramo (repo mycity) | Stato alle 16:50 |
|---|---|---|---|
| R28 | session_015BmpnYgfBZJsuDMpB39sCj | claude/sito-onda-4-m28 | 30,67 $. Lotti 1-3 fatti. Revisore lotto 3 in corso (R28-015 deve rispettare tre condizioni: trasferimento idempotente, Stripe finto, prova rimessa; altrimenti avviso e parziale). Lotto 4 a non_fatto. Guardia verde col piano ripulito (fe2483e6). |
| R29 | session_015BmpnW1hb6vTP9viJSV6uD | claude/sito-onda-4-m29 | 20,8 $ dopo L1. Gira L2, poi L3 al posto di Q4; L4 a non_fatto. Guardia ROSSA, 8 problemi: istruzioni già date alle 16:47 (vedi sotto). |
| K14 | session_015BmpnVoKh8ukxjK38xGnnk | — | Finito: 3 reggono. |

Base del sito: d038f105999d3aec05dc70e3663869023c150e81. Usa sempre la sigla intera: con quella accorciata le sessioni non partono.

### Le istruzioni date a R29 alle 16:47

1. Le tre prove comuni (minori-s03-sorvegliante, minori-s10-catalogo-chat, l-allarme-che-non-parte-non-si-spaccia-per-spedito) tornano come alla base sul suo ramo. Le loro modifiche passano nel referto come serve_file_altrui. **Le applica la regista alla cucitura**, dopo che il collaudo ha verificato che non indeboliscono niente.
2. La guardia unitaria riparazione-r29-la-cassa-e2e-… non deve avere nessuno skip. Lo spec e2e tiene un solo salto condizionale a livello di file su E2E_DATI_DI_PROVA, voluto dalla voce: **è un'eccezione da far firmare dall'AD o da Nicola** prima di applica.
3. Messaggi di commit riscritti, senza citare voci di altre onde.

### Cosa resta da fare, in ordine

1. Alla consegna di ciascuno: `guardia-ramo origin/<ramo> R2x --cartella consegne/riparazioni/2026-11-12-sito-tutto --git /home/user/mycity` e `valida-referto`.
2. Collaudo breve, regola 4: verdetto dalla prova; al massimo 2 revisori e solo su soldi/dati/permessi; si aspetta 1,2 $ a voce, e sopra 1,5 $ a voce il collaudatore scrive prima alla regista. Il collaudatore va aperto con la base a sigla intera e controllato con get_session un minuto dopo.
3. Controllore, cucitura (con le tre prove comuni di R29), verify, applica (solo sulle chiavi ancora aperte: vedi `nuove-chiavi.mjs` in questa cartella; altrimenti chiudi-sito riscrive la data di tutte le chiusure), PR in bozza.
4. Riga dell'onda 4 in `consegne/audit/2026-11-15-lezioni-onde/misure.json`. **La lettura del 12% del limite non va scritta finché l'AD non la conferma.**
5. Ogni messaggio all'AD (session_015BmpnXzJ4RxUcjYFTgfqUG) porta tre cose: il costo della regia, il costo del lavoro e la percentuale del limite (oggi il server dice solo «allowed»).

### La spesa alle 16:50

Prima regista 13,95 $ · K14 2,06 $ · R28 30,67 $ · R29 circa 21 $ e in crescita. Totale circa 68 $ sui 170.

### I segreti di test che Nicola deve mettere nella CI (R29-001)

E2E_DATI_DI_PROVA=1 · STRIPE_TEST_SECRET_KEY (sk_test_) · E2E_STRIPE_CONTO_NEGOZIO (acct_ di prova).

### Gli avvisi della sorveglianza

L'avviso «ferma» arriva dopo circa 20 minuti senza salvataggi, anche mentre un lotto è in corso. Controlla con list_sessions prima di scrivere al riparatore. Gli avvisi gestiti si annotano in `rossi-noti.txt`.
