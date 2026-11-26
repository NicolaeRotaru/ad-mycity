---
tipo: quaderno di bordo della regia
data: 2026-11-26 15:32
radiografia: consegne/radiografia/2026-11-26-ricontrollo
---

# Regia del ricontrollo del 26/11: finito, 45 difetti chiusi

**In due righe.** Il ricontrollo è chiuso e il registro è aggiornato. Le voci aperte del sito passano da 598 a 553.

## In parole semplici
Quattro sessioni hanno riletto 272 difetti aperti del sito, e la sessione dell'AD le ha dirette. Per esempio, l'avviso per un ordine non accettato ora parte dopo 5 minuti: quella voce si chiude. In tutto si chiudono 45 voci su 272, nessuna nuova.

## Cosa cambia per te
Il lavoro è finito e non resta niente in corso. È costato 64,73 $, contro 77,04 $ del preventivo.

## Cosa devi fare
Niente adesso. Le tue tre scelte stanno nella carta #266.

## Cosa non ho verificato
Nessuna sessione aveva lo sforzo massimo. Diciassette voci su 272 non si potevano verificare da qui, perché serve il sito vero.

---

## Dettagli tecnici

**Le scelte di Nicola.** 13:38: «Parti con la nuova strategia di radiografia», senza richieste di consenso salvo all'estremo. Vale come «via» della fermata 1.

**Le scelte dell'AD al posto delle fermate.**
- Profilo `ricontrollo`: `tasso-chiusura.mjs --gate` dice novembre 0,18, quindi niente ricerche nuove. Tetto 100 $.
- Regia nella sessione dell'AD (session_015BmpnXAVwPhPT7aWRMXdMi): un'onda sola, sotto i 100 $.
- Ultracode non acceso: `create_session` rifiuta un prompt che comincia con «/», e `/effort` via `send_message` arriva come testo. `piano.json` lo dice per S01 (`ultracode_previsto`).
- Riservatezza: l'invio dei dettagli fra sessioni a volte passa (S01, S01b) e a volte è bloccato (S01c). Ogni sessione ha confrontato i file pubblici con le proprie falle e ha mandato solo i segni.
- Tolte dai referti 13 righe di copertura (S01: 6 letti, 1 eseguito; S01b: 6 letti) che puntavano ai file delle falle. Restano nella storia del ramo.
- I titoli delle 9 falle non sono nascosti nel registro, e le 6 voci del CF nemmeno: scelta lasciata a Nicola (carta #266).

**I numeri.**
- Sito `ed12ed8ec8190e1132b690f6e034c30f0a5d55ba`, copia con la storia intera. Prepasso: 522 voci, 250 tenute, 272 agli agenti.
- Esiti: non_piu_vero 45 (5 gravi verificate) · ancora_vero 164 · cambiato 46 · non_verificabile 17 · falle fra le aperte 9.
- Costi (get_session): S01 10,49 · S01b 13,44 · S01c 15,58 · S01d 2,01 · CF 4,86 + 7,60 di riservatezza = 12,46 · regia 10,75. Totale 64,73 $.
- Registro: aperte 598 → 553 (gravi 67 → 62, minori 526 → 486, bloccanti 5).

**Lo stato.** Fatti e verdi: prepara, preventivo, schede, copertura-prima, segnaposti, 4 valida-referto, doppioni, grezzo, conti, copertura-dopo, CF, `misura --scrivi`, `applica --scrivi`, memoria, ESITO. Il digest non serve, perché il grezzo ha 0 difetti. Resta: la PR fuori dalla bozza.

**Fatti del giro.**
- 13:41-13:42 aperte S01 (`…VNGoriu5`), S01b (`…VxGxJTUc`), S01c (`…ZHa9mJ1d`), S01d (`…X4tM7Bfg`). Ramo di ognuna: `ccr-aa566c13-nvkbaw-sNN`.
- 13:51-14:58 S01c ferma su un gruppo che non tornava: svegliata, ha salvato il parziale e rifatto il gruppo.
- 15:03 CF aperto (`…XSRA4TbS`, ramo `-cf`), chiuso alle 15:10.
- La sessione «Strategia risoluzione difetti» (`…XuogkPZV`) ripara 116 voci fuori dalle nostre 272. Ha avuto lo SHA del registro aggiornato.
- Il controllo «suite del cervello — fetta 3» è rosso anche su main (`due-case.test.mjs`): commento sulla #1030.
- Nota di S01c: `SendMessage` fra subagenti non ha guardia (il freno lo incolla solo Nicola).
