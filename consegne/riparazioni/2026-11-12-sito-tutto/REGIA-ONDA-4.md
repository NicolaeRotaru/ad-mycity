---
tipo: quaderno-regia
onda: 4
data: 2026-11-16 10:55
---

# Onda 4: il quaderno della regista

## In parole semplici
Questo è il diario della regista dell'onda 4 del sito. Nicola ha chiesto che vada come l'onda 1: poche spese, molte voci chiuse. La preparazione è fatta. Due riparatori da 25 voci aspettano il suo via.

## Cosa cambia per te
Finché non dai il via si spende solo il collaudo di 3 voci, al massimo 5 $.

## Cosa devi fare
Dare il via ai due riparatori, con la percentuale del limite letta nell'app.

## Cosa non ho verificato
Le misure dell'onda 3 vengono dal quaderno della regia O3 quattro, non da get_session.

## Dettagli tecnici
Brief: `consegne/ad/2026-11-16-brief-regia-onda-4.md` (ramo `ccr-546d3724-qilkcw`). Ordine di Nicola, 16/11 verso le 10:30: «fai in modo che vada come l'ondata 1». Regista O4: `session_015BmpnVW3sawgGZzKKZHfbp`, ramo `claude/sito-onda-4`, tetto 15 $. AD: `session_015BmpnXzJ4RxUcjYFTgfqUG`.

## Diario

- **10:35** Mano presa. Base del sito: main `d038f105`, che contiene la #292 (onda 3) unita.
- **10:40** `pronte --git`: A 8 · B 42 · C 43 · D 88.
- **10:45** **Elenco A, 8 voci, ma solo 3 da collaudare.** R04-012 e R04-015 hanno tre «parziale» pieni (K02, K10, K11) con la prova rimessa a uscita 3: un quarto collaudo non cambia condizione (regola 8). R04-021, R07-021 e R07-022 hanno già il «regge» pieno di K11 contro i «parziale» di K02 e K10: le blocca la regola di `decidi` (vince il più severo), non il collaudo. Restano R16-014, -015, -016: «regge» di K08 senza giudizio pieno (campione), e col campo dei 40 serve il pieno. Collaudo: K14, tetto 5 $.
- **10:50** `B-onda4.txt` ha 37 chiavi. Sono le voci di B meno cinque. Le 4 di R27 restano fuori perché aspettano la carta 258. R17-002 resta fuori perché è un grave sui soldi: tocca i bonifici dei contanti.
- **10:52** `dividi --base d038f105 --file-chiavi B-onda4.txt --sessioni 2 --per-sessione 25`. R28 «microcopy» ha 25 voci, di cui 1 grave, e le migrazioni 520-529. R29 «qa-flussi» ha 25 voci, di cui 2 gravi, e le migrazioni 530-539. Delle 37 di B ne entrano 19: le altre 18 restano fra le 93 della parte 2. `schede`, `copertura-prima`, `segnaposti` verdi.
- **10:55** Riga dell'onda 3 in `misure.json`.
- **10:44** **K14 aperto** (`session_015BmpnVoKh8ukxjK38xGnnk`, ramo `claude/sito-onda-4-k14`, partenza `db72b993`), tetto 5 $, sulle 3 voci di R16.
- **10:50** **Fermata 1 mandata all'AD**: perimetro, preventivo (minimo 10-18 $, atteso circa 126 $ con 14-17 voci chiuse, massimo 170 $ con circa 24). Si aspetta il via di Nicola con la percentuale.
- **10:50** L'AD chiede `applica --scrivi` per l'onda 3 insieme a K14. Prova a vuoto, con R27 tolto per quel giro e poi rimesso: 204 voci si chiudono, 461 restano aperte. Nel registro adesso ce ne sono 200 riparate. Il registro si scrive quando consegna K14.
- **11:00** **K14 consegna** (`df1c908`, nessun subagente). R16-014, -015 e -016 reggono col giudizio pieno, prova rimessa a uscita 0. `guardia-ramo` (partenza `db72b993`) e `valida-collaudo` verdi. Collaudo copiato in `collaudi/K14.json`.
- **11:02** `applica --scrivi`, con R27 tolto per quel giro e poi rimesso: 207 voci si chiudono, 458 restano aperte. Scritti 23 frammenti e 20 difetti nati nel registro.
- **11:04** `chiudi-sito --applica` lanciato SOLO sulle 7 voci che nel registro erano ancora aperte (4 di R14, 3 di R26), con PR #292 e commit `d038f105`. Lanciato su tutti i frammenti avrebbe riscritto data e PR delle 200 voci già chiuse dalle onde 1 e 2. Le 3 voci di K14 nel registro erano già «riparato». Registro, per il perimetro: da 200 a 207 riparate, da 452 a 445 aperte.
- **12:12** Nicola dà il via a R28 e R29 (tramite l'AD, verso le 12:05). Ha letto il 12% del limite in app, ma la lettura non è sicura: non va in misure.json finché l'AD non la conferma.
- **12:13** **R28** (`session_015BmpnWap9HeyrxHcJSmb24`) e **R29** (`session_015BmpnYhfD4xKiWKSnKQky6`) aperti sul sito, partenza `d038f1059`, effort xhigh, ultracode spento. Tetto 55 $ l'uno, consegna a 40 $, al massimo 8 subagenti. Le regole e la scheda le leggono dal clone di ad-mycity a `982fd335`. Se il clone non riesce, glieli incollo io. Prima il piano, poi l'approvazione.
