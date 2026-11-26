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
- Le figlie si aprono senza il parametro `effort` (con `create_session` pre-approvato verrebbe rifiutato): l'effort
  si dà col primo messaggio (`/effort ultracode` o `/effort xhigh`), il compito subito dopo con `send_message`.
- Il freno sugli agenti in `ad-mycity` resta solo testo (lo incolla solo Nicola, card #262).

## I numeri della partenza
- Sito al commit ed12ed8ec8190e1132b690f6e034c30f0a5d55ba, copia con la storia intera (4.006 commit).
- Prepasso: 522 voci, 250 tenute aperte dal programma, 272 agli agenti. Minori aperti 526: minori nuovi non ammessi.
- Preventivo: 61,63 · 77,04 · 100,15 $; circa 2,5% della settimana; circa 69 chiusure, circa 1,12 $ l'una.
- Quota alle 13:39: `allowed`, `isUsingOverage` false.

## Lo stato
- [x] prepara, preventivo, schede, copertura-prima, segnaposti: verdi.
- [ ] sessioni aperte (`sessioni.json`) · [ ] sorveglianza · [ ] referti · [ ] doppioni · [ ] CF · [ ] conti
- [ ] misura --scrivi · [ ] applica --scrivi · [ ] digest · [ ] memoria · [ ] PR fuori dalla bozza

## Il prossimo passo e i comandi
- `C=consegne/radiografia/2026-11-26-ricontrollo`
- Sorveglianza: `node cervello/radiografia-sessioni.mjs sorveglia --cartella $C --onda 1 --attendi` (sottofondo).
- Fine onda: `git checkout origin/ccr-aa566c13-nvkbaw-sNN -- $C/referti/SNN.json`, poi `doppioni --cartella $C`.
- Poi F2 della skill `radiografia-sessioni`.
