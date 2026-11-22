---
data: 2026-11-22 18:05
tipo: passaggio di regia
da: «Settimana dei 700 · regia settima», session_015BmpnXrV1Q7uJoKhhGbeQG (307 mila token di storia, 6,17 $)
a: la regia ottava della settimana dei 700 (la apre Nicola: la catena è a profondità 7 su 8)
---

# Settimana dei 700: il passaggio alla regia ottava

## In parole semplici
Questo foglio serve alla regia che segue il giro di correzione fino alla richiesta di unione.
Le sei sessioni che riparano sono partite alle 17:50 e lavorano: i sei piani sono approvati.
Un esempio di voce del giro: R14-008, il lotto dell'AI che senza elenco di prodotti non deve scrivere niente.

## Cosa cambia per te
Per Nicola: aprire la regia nuova con la riga qui sotto, poi niente fino alla richiesta di unione.
Per la regia ottava: sorveglianza, poi collaudo, unione, controllore e PR, poi la fermata a Nicola.

## Cosa devi fare
1. Leggi la skill `riparazione` (regole del 21/11, F2, F3), `REGIA.md` e questo foglio. Non rileggere i PASSAGGI vecchi.
2. Scrivi subito alla regia settima (session_015BmpnXrV1Q7uJoKhhGbeQG) il tuo id: ti manda in chat i dettagli riservati e avvisa R13-R18 di scrivere a te.
3. Aggiungi il sito con `add_repo` (accesso push) e clonalo in `/home/user/mycity`.
4. Sorveglianza ogni 30 minuti con `send_later`: `MARKETPLACE_REPO=/home/user/mycity bash cervello/riparazione/sorveglia.sh consegne/riparazioni/2026-11-21-settimana-700/normali 2`, più `list_sessions` (children non funziona per te: usa gli id qui sotto con `get_session`).
5. La spesa delle figlie la leggi tu (`usage.cost_usd` di `get_session` col loro id): a loro non si vede. Avvisale verso i 25 $; tetto 35 $.
6. F2: K05 su R13-R15, K06 su R16-R18, con `source_revision` = la punta di `claude/settimana-700-regia` in ad-mycity quando li apri (deve contenere 06530adf: il piano di R14 corretto). Controllo dopo dei collaudatori: cerca anche gli strumenti a nome UUID (sotto).
7. F3 sull'integrazione nuova da 3d95d6a (ramo `claude/settimana-700-regia` del sito, oggi a b57195e), C02, PR, fermata a Nicola. Le migrazioni nuove (750 di R13, 760 o 801 se arrivano) vanno con «ok migrazioni».
8. Passa la mano a 250 mila token, controllando `get_session` senza id a ogni risveglio.

## Cosa non ho verificato
- Che i riparatori leggano bene le istruzioni dal ramo del sito: i sei piani dicono di sì, i referti non ci sono ancora.
- La spesa delle figlie: alle 18:02 nessuna la mostrava ancora.

---

## Dettagli tecnici

### La riga per aprire la regia ottava (la usa Nicola)
Sessione nuova su `NicolaeRotaru/ad-mycity`, ramo `claude/settimana-700-regia`, modalità Auto, prompt:
«Sei la regia ottava della settimana dei 700. Leggi .claude/skills/riparazione/SKILL.md e consegne/riparazioni/2026-11-21-settimana-700/PASSAGGIO-8.md, poi continua da lì.»

### Le sessioni dell'onda 2 (base b57195e, xhigh, auto, senza ultracode)
| Sessione | id | voci date | tolte ai delicati |
|---|---|---|---|
| R13 | session_015BmpnZDZHzqxGNYEkWMdLD | 13 | — |
| R14 | session_015BmpnZ2RL2k6K5RogzvTaa | 13 | 001, 006, 007, 010 |
| R15 | session_015BmpnXuN9HB3RuuzPNxppb | 16 | 004, 005, 006, 012 |
| R16 | session_015BmpnXTwS2umRhCqiuAV9n | 13 | — |
| R17 | session_015BmpnVRsMHDE17p6GNs9Jn | 12 | 001 |
| R18 | session_015BmpnZAUzqs2xWe9zbS3e5 | 12 | 007, 008, 009, 010 |
66 voci restano nel giro; le 13 tolte vanno nel referto come `non_fatto` («tolta dalla regia: delicata») e passano alla cartella `delicati/`.

### Cose da sapere
- Regole e schede arrivano ai riparatori dal ramo del sito `claude/settimana-700-regia-istruzioni` (@ 2a43b2a4, sola lettura): non va unito, si cancella a fine giro.
- Piano di R14 corretto a mano (06530adf): tre stringhe di file unite da virgola erano un errore di `dividi`. copilot/route.ts resta di R13; catalog-chat/route.ts non è di nessuno (lo tocca una prova di R13); `tests/unit/aiuti/schermo.ts` è di R14.
- Il divieto in `.claude/settings.json` del sito nomina mcp__Supabase/Vercel/Stripe, ma i server qui hanno nomi a id (mcp__3c86ea8d… Supabase, mcp__8b8d3eec… Vercel): il blocco non li prende. Da portare a Nicola con la correzione da firmare.
- Promemoria vivi: sorveglianza alle 18:33 (trig_01PAaEg62dSraG6yPYHLD37s, nella sessione della regia settima). Il promemoria della PR #301 (trig_018bBXEEtgpSU2L4iei39t4L) è inutile: lascialo scadere.
- Preventivo firmato: circa 200 $ (160-260), tetto 260 $ («via la correzione», Nicola 22/11 17:48).

### Ancora aperto per Nicola
«ok migrazioni» per 640, 660, 661, 662, 701, 702; via alla sessione riservata (tetto 25 $); cancellare su GitHub i rami `-s01`, `-s01b`, `-s01c`, `-s01d`, `-cf`, poi `-m10`; elenco D in `normali/pronte/D-per-nicola.txt`; testo di R08 per il GLOSSARIO-KPI; SendMessage non sorvegliato (segnalato da K01).
