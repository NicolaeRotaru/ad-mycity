---
data: 2026-11-21 16:40
tipo: passaggio di regia
da: «Settimana dei 700 · regia», session_015BmpnV6hh4YTsgDkt8stTW (412 mila token, oltre la soglia di 250 mila)
a: la regia seconda della settimana dei 700
---

# Settimana dei 700: il passaggio alla regia seconda

## In parole semplici
Il ricontrollo è finito: 117 difetti erano già spariti e sono chiusi nel registro.
Gli aperti scendono da 749 a 632: 559 minori, 68 gravi e 5 bloccanti.
Adesso si riparano le voci ancora vere, con il tetto di 1.200 $ firmato da Nicola.
Spesi finora circa 130 $: 115,59 $ del ricontrollo e circa 14 $ della regia.

## Cosa cambia per te
Niente sul sito: il ricontrollo ha solo letto. Le chiusure sono nel registro del ramo `claude/settimana-700-regia`.

## Cosa devi fare
1. Leggi la skill `riparazione`, `REGIA.md` e questo foglio.
2. Ricevi in chat dalla regia prima i dettagli delle voci riservate. Non vanno mai nel deposito.
3. Chiedi a Nicola la risposta sui dettagli di alcune falle rimasti nella storia dei rami pubblici (sotto). Finché non risponde, non cancellare né riscrivere rami.
4. Rifai `perimetro` e `dividi` su `main` del sito `1ad51b4c` col registro nuovo, a 16 voci per sessione, con i delicati in un'onda a parte (regola 4 del 21/11).
5. Fai il preventivo con `conti --preventivo` e controlla il costo per chiusa sulle righe di `misure.json` con la stessa configurazione. Sopra 12 $ a chiusa decide Nicola.
6. Passa la mano a 250 mila token, con un foglio come questo.

## Cosa non ho verificato
- Il difetto nuovo del rimborso non è ancora nel registro: va aggiunto come nato al primo `applica` della riparazione.
- Quanto vale un punto del limite settimanale: le misure non tornano.

---

## Dettagli tecnici

### Le scelte di Nicola (21/11 15:20 e 15:40)
- Tetto della settimana 1.200 $. Firme a (prove comuni: si aggiungono casi, mai si tolgono controlli) e b (nel commit solo il codice della propria voce).
- Sì al ricontrollo (fatto) e sì alla stima di 169 $ (spesi 104,72 $ più 10,87 $ del CF).

### Il ricontrollo
- Cartella `consegne/radiografia/2026-11-21-ricontrollo/`: 4 referti, `controllo-finale.json`, `applica --scrivi` fatto (117 chiusure, 0 regressioni).
- Costi: S01 30,31 $ · S01b 28,48 $ · S01c 29,12 $ · S01d 16,81 $ · CF 10,87 $. Circa 0,25 $ a voce ricontrollata.
- Il registro filtrato (senza le 214 voci con righe ferme) stava solo nello scratchpad.

### Da portare avanti
- **Riservatezza (per Nicola):** il CF ha trovato 12 segni nei referti, dettagli di voci pubbliche che possono essere falle. Li ho tolti dalle copie nella cartella. Restano nella storia del ramo `claude/settimana-700-regia` (commit `7353225`) e nei rami `claude/settimana-700-regia-s01`, `-s01b`, `-s01c`, `-s01d`. Indici in `controllo-finale.json`, campo `riservatezza`.
- **Difetto nuovo che tocca soldi:** nel modulo del rimborso del negozio «1.250,00» diventa 1,25 €, senza avviso (`components/seller/ReturnRequestCard.tsx:116` e `:147`).
- **Domande per Nicola dai referti:** la funzione `segna_bonifico_manuale` chiamata da `app/admin/payouts/page.tsx:123` non è creata da nessuna migrazione del sito (solo in produzione?); i modelli email nel formato token_hash; la variabile GitHub `E2E_DATI_DI_PROVA`; la decisione del 26/10 sulla consegna al fattorino. Le altre sono nei referti, campo delle domande.
- La PR ad-mycity#990 (in bozza) porta tutto questo e tre correzioni ai guardiani della macchina, provate e rilette da un agente separato.
