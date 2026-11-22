---
data: 2026-11-22 17:50
tipo: passaggio di regia
da: «Settimana dei 700 · regia sesta», session_015BmpnZW4izcN94UePb2UMg (340 mila token di storia su 1 milione, 9,82 $)
a: la regia settima della settimana dei 700
---

# Settimana dei 700: il passaggio alla regia settima

## In parole semplici
Questo foglio serve alla regia che fa partire e guida il giro di correzione delle voci semplici del sito.
Il primo giro è chiuso: Nicola ha unito mycity#301 e 53 difetti sono chiusi nel registro.
Nicola ha detto «via la correzione» alle 17:48: il giro di correzione è firmato, con il tetto di 260 $.
Un esempio di voce del giro: R14-001, il tetto di tempo delle email della notte.

## Cosa cambia per te
Per Nicola: niente finché non unisce la prossima PR.
Per la regia settima: apri subito R13-R18, approvi i piani, sorvegli, poi collaudo, unione, controllore e PR.

## Cosa devi fare
1. Leggi la skill `riparazione` (regole del 21/11, F1, sorveglianza, F2, F3), `REGIA.md` e questo foglio. I dettagli riservati te li mando in chat: mai nel deposito.
2. Aggiungi il sito con `add_repo` (accesso push) e clonalo in `/home/user/mycity`. Rami col refspec esplicito.
3. Apri R13-R18 (F1 della skill): `source_url` https://github.com/NicolaeRotaru/mycity, `source_revision` b57195e2f913ee3056414bfcc3594de18265d4d5 (la testa unita in main con 3d95d6a), `outcome_branch` `claude/settimana-700-regia-mNN`, `model` claude-opus-5-5, `effort` xhigh, `permission_mode` auto, senza ultracode (tutte minori), tag `riparazione:settimana-700` e `onda-2-riparatori`, titolo «RNN». Il prompt porta per intero `cervello/riparazione/LEGGIMI-riparatore.md` e `normali/schede/RNN.md`, e finisce con la frase della skill. SHA_REGISTA = la punta di `claude/settimana-700-regia` in ad-mycity quando parti (dopo il commit di questo foglio). Scrivi gli id in `normali/sessioni.json` (onda 2).
4. Primo messaggio ai riparatori: niente id di altre voci nei commit; per un file altrui scrivere la modifica esatta; tetto di spesa 35 $ a testa; 6 subagenti.
5. Sorveglianza ogni 30 minuti con `send_later`: `MARKETPLACE_REPO=/home/user/mycity bash cervello/riparazione/sorveglia.sh consegne/riparazioni/2026-11-21-settimana-700/normali 2`.
6. Poi F2 (2 collaudatori: K05 su R13-R15, K06 su R16-R18), F3 sull'integrazione nuova da 3d95d6a, controllore C02, PR, fermata a Nicola.
7. Passa la mano a 250 mila token. ⚠️ La catena delle regie è a profondità 7 su 8: la tua figlia regia ottava non potrebbe aprire sessioni. Quando passi la mano, chiedi a Nicola di aprire lui la regia nuova (profondità 0), o falla aprire dalla chat dell'AD.

## Cosa non ho verificato
- La spesa misurata delle sessioni del primo giro: sono cifre dai loro messaggi, e mancano K02, K03, K04.
- Che il deposito del sito non abbia commit nuovi dopo 3d95d6a: guardalo prima di aprire.

---

## Dettagli tecnici

### Il preventivo firmato
79 voci, 6 sessioni, circa 200 $ (160-260), circa 24 chiuse attese, circa 8 $ a chiusa. Tetto 260 $ («via la correzione», Nicola, 22/11 17:48).

### Le sessioni dell'onda 2 (dal piano)
| Sessione | Tema | Voci | File | Migrazioni |
|---|---|---|---|---|
| R13 | ai-endpoints | 13 | 29 | 750-759 |
| R14 | api-backend | 13 | 18 | 760-769 |
| R15 | architettura | 16 | 12 | 770-779 |
| R16 | coerenza-brand | 13 | 29 | 780-789 |
| R17 | dati-analytics | 12 | 18 | 790-799 |
| R18 | deploy-sre | 12 | 18 | 800-809 |
11 voci all'onda dopo (incrocio di file). Fuori dal giro: le 7 cadute due volte (R09-008, R11-005, R11-007, R11-012, R10-010, R10-014, R12-006), le 12 scelte di Nicola, 2 non_codice, l'elenco D di pronte.

### Stato del primo giro
- mycity#301 unita (3d95d6a). 53 chiuse nel registro, 47 nati scritti, 3 riservati fuori. Aperti nel registro: 620 (547 minori, 68 gravi, 5 bloccanti).
- R01-R12, K01-K04 e C01 sono fermi: si possono archiviare.
- Il promemoria della PR #301 (trig_018bBXEEtgpSU2L4iei39t4L, 18:18) è inutile: la PR è unita. La cancellazione dei promemoria è negata dal permesso: lascialo scadere.

### Altro per Nicola (chiesto, nessuna risposta)
- «ok migrazioni» per 640, 660, 661, 662, 701, 702.
- Il via alla sessione riservata (tetto 25 $). Cancellare su GitHub i rami `-s01`, `-s01b`, `-s01c`, `-s01d`, `-cf`, e più avanti `-m10`.
- Le 7 voci cadute due volte e le domande di prodotto nei referti (elenco D in `normali/pronte/D-per-nicola.txt`).
- Testo di R08 per il GLOSSARIO-KPI (nel referto R08).
- Segnalato da K01 per la macchina: SendMessage non è sorvegliato da nessuna guardia (lavoro sulla macchina: firma di Nicola).
