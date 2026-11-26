---
tipo: quaderno di bordo della regia
data: 2026-11-26 13:50
radiografia: consegne/radiografia/2026-11-26-ricontrollo
---

# Regia del ricontrollo del 26/11

## Le scelte di Nicola
- 2026-11-26 13:38, dalla sessione dell'AD: «Parti con la nuova strategia di radiografia». Non vuole che gli si
  chieda nessun consenso, salvo all'estremo: le scelte ordinarie le prende l'AD. Vale come «via» della fermata 1.
- Il freno dei conti (`tasso-chiusura.mjs --gate`, novembre 0,18) ferma le ricerche nuove: si fa solo il ricontrollo.
- Tetto di questa onda: il massimo del preventivo, 100 $. Oltre, ci si ferma e lo si dice a Nicola (regola 14).

## Le scelte dell'AD (al posto delle fermate)
- Profilo `ricontrollo`, ultracode «dove-serve»: S01 (29 voci gravi) con ultracode, S01b-S01d (minori) senza.
- La regia la fa la sessione dell'AD (session_015BmpnXAVwPhPT7aWRMXdMi): una sola onda, nessuna ricerca, sotto i
  100 $. Una sessione in meno che potrebbe fermarsi su un permesso mentre Nicola non guarda.
- Le figlie si aprono senza il parametro `effort` (con `create_session` pre-approvato verrebbe rifiutato).
  ⚠️ Scoperto alle 13:43: `create_session` rifiuta un prompt che comincia con «/», e `/effort …` mandato con
  `send_message` arriva come testo, non come comando (S01 l'ha detto). Quindi **nessuna figlia ha ultracode**:
  girano allo sforzo di partenza. Il preventivo (misurato con ultracode) resta un tetto. Debito per la skill: il
  passo «prompt = /effort ultracode» oggi non funziona più.
- Il freno sugli agenti in `ad-mycity` resta solo testo (lo incolla solo Nicola, card #262).

## I numeri della partenza
- Sito al commit ed12ed8ec8190e1132b690f6e034c30f0a5d55ba, copia con la storia intera (4.006 commit).
- Prepasso: 522 voci, 250 tenute aperte dal programma, 272 agli agenti. Minori aperti 526: minori nuovi non ammessi.
- Preventivo: 61,63 · 77,04 · 100,15 $; circa 2,5% della settimana; circa 69 chiusure, circa 1,12 $ l'una.
- Quota alle 13:39: `allowed`, `isUsingOverage` false.

## Lo stato
- [x] prepara, preventivo, schede, copertura-prima, segnaposti: verdi.
- [x] sessioni aperte alle 13:41-13:42 (`sessioni.json`) · [x] sorveglianza · [ ] referti · [ ] doppioni · [ ] CF · [ ] conti
- [ ] misura --scrivi · [ ] applica --scrivi · [ ] digest · [ ] memoria · [ ] PR fuori dalla bozza

## Il prossimo passo e i comandi
- `C=consegne/radiografia/2026-11-26-ricontrollo`
- Sorveglianza: `node cervello/radiografia-sessioni.mjs sorveglia --cartella $C --onda 1 --attendi` (sottofondo).
- Fine onda: `git checkout origin/ccr-aa566c13-nvkbaw-sNN -- $C/referti/SNN.json`, poi `doppioni --cartella $C`.
- Poi F2 della skill `radiografia-sessioni`.

## Da dire a Nicola alla fine
- 13:47 · Il controllo «suite del cervello — fetta 3» è rosso anche su main (`b783ce5`): `cervello/test/due-case.test.mjs`,
  2 asserzioni su 36. Verde il 25/11 su `0eb50c4` (#1011), rotto fra #1025 e #1027. Non viene da questa PR (commento
  sulla #1030). Ripararlo è una modifica alla macchina: serve la sua firma.
- 13:46 · S01d finita: 3 minori, 2 ancora veri, 1 chiuso; `get_session` non dà il costo in dollari (manca `cost_usd`).
- 13:56 · La sessione «Strategia risoluzione difetti» (session_015BmpnXuogkPZVts89PH67a, tetto 1.200 $) ripara 116 voci
  FUORI dalle nostre 272, stessa base. A fine ricontrollo le mando lo SHA con referti e `trovati.txt`; il registro lo
  scrivo io con `applica`, lei dopo. Fatto: risposto alle 13:56.
- 13:53 · S01b finita: 120 minori, 14 chiusi, 79 veri, 18 cambiati, 9 non verificabili, 3 falle (dettagli in chat
  S01b), 10,79 $. S01c a 105/120: 2 falle. Nota di S01c: `SendMessage` fra subagenti non ha guardia.
- 14:04 · S01 finita (29 gravi: 5 chiusi verificati, 8 cambiati, 12 veri, 4 non verificabili, 4 falle; circa 6,99 $).
  S01c «ferma»: scollegata dalle 13:51, aspettava L01 (7 gruppi su 8 fatti, esiti solo nel suo scratchpad, 12,05 $).
  Svegliata con send_message: prima salva il parziale, poi rifà L01.
- 15:03 · Onda finita. 4 referti verdi; doppioni, grezzo e conti verdi (0 difetti nuovi). Chiusi 45 su 272 (S01 5,
  S01b 14, S01c 25, S01d 1). Costo da get_session: S01 10,49 · S01b 13,44 · S01c 15,58 · S01d 2,01 = 41,52 $; regia
  8,34 $ alle 15:02. Falle fra le aperte: 9 (S01 4, S01b 3, S01c 2), dettagli solo nelle chat. Prossimo: il CF.
- 15:06 · CF aperto (session_015BmpnXSRA4TbSnbKgczsmo, ramo `-cf`): conti e copertura-dopo verdi, 5 chiusure gravi già
  verificate. L'invio dei dettagli delle falle fra sessioni è bloccato dal controllo dei permessi: il confronto parola
  per parola lo fanno S01, S01b, S01c sui file pubblici, e mandano solo i segni (dove, campo, tipo), mai i dettagli.
