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
