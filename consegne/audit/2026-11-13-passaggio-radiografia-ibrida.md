---
tipo: passaggio
data: 2026-11-13 05:15
da: session_015BmpnZCaWUijDqfTAvJ4Dx («Radiografia del codice · seguito», 429 mila token, oltre la soglia della regola 7)
a: la sessione nuova che continua la chat con Nicola
---

# Il passaggio della radiografia ibrida

> **In due righe.** Nicola vuole i cinque voti del codice a 9, col metodo della radiografia. Prima la radiografia
> va resa ibrida e misurata: si aspetta il suo sì sull'ordine dei lavori.

## In parole semplici
Nicola vuole portare a 9 su 10 i cinque voti del codice del sito, e vuole farlo col metodo della radiografia. Prima la
radiografia va controllata e resa ibrida. Per esempio: oggi il suo programma non nomina mai la macchina, mentre quello
del risolutore la nomina 35 volte.

## Cosa cambia per te
Continui tu la chat con Nicola, da dove si è fermata alle 05:15 del 13/11.

## Cosa devi fare
Aspettare il suo sì sull'ordine dei lavori della sezione 3. Ogni sua decisione va in bacheca e all'AD.

## Cosa non ho verificato
Le schede delle sessioni (non generate), il programma riga per riga, e quanto costa il passo ⑤.

## 1. Le parole di Nicola (13/11, ora di Piacenza)
- 04:10: «come risolvere i problemi nel codice per rendere tutti i punti un voto 9 su 10».
- 04:30: «usi la strategia della radiografia». «controlla se gli sono state inserite le regole del risolutore».
  «inserire tutti i difetti dentro il reparto dei difetti».
- 04:42: «la tua proposta per il 9». Durante il lavoro guidano i criteri misurati da un programma. Alla fine i tre
  senior rifanno il giudizio una volta. Il voto lo firma Nicola.
- 04:52: «dimmi se così come viene fatta è corretta, ha il massimo delle performance». «verrà usata anche sulla
  macchina». «non sarebbe forse meglio aggiungerla già dentro la strategia di radiografia che già esiste?».
- 05:03: «rispondi alle 4 domande». «solo il sito (che verrà usata anche la macchina e altro)». «con le regole del
  risolutore fin dove si puo». «facciamo le cose che proponi tu, però la radiografia deve essere ibrida».
  «si deve vedere così come hai detto bene tu».

## 2. I fatti misurati (non rifarli)
- Il giudizio è in `consegne/audit/2026-11-13-giudizio-codice-sito.md`: media 5,4.
- Il manuale è `.claude/skills/radiografia-sessioni/SKILL.md`, 213 righe. Il suo debito sta alle righe 208-213.
- Il programma è `cervello/radiografia-sessioni.mjs`. Nomina la macchina 0 volte; `cervello/riparazione-sessioni.mjs` 35.
- Mancano dai file della radiografia: «bacheca», «priority», `subscribe_pr_activity`, «sessioni-insieme», e il cambio
  di sessione oltre 400 mila token. Nemmeno `.claude/skills/riparazione/SKILL.md` nomina `subscribe_pr_activity`.
- Le radiografie sono sei: il manuale in sessioni, `radiografia.js`, `auto-radiografia.js`, `radiografia-totale.js`,
  `audit-pannello.js` e `audit-design.js`.
- La corsa del 6/11 costò 327 $, e il 97% dei token era rilettura. Trovò 175 difetti nuovi e 0 bloccanti. La palestra
  del 7/11 trovò il bloccante degli indirizzi.
- Il ritmo di chiusura è 0,19, e i minori aperti erano 726 il 12/11. La quota è in avviso fino al 19/11 alle 10.

## 3. Cosa gli ho risposto alle 05:15
- **Le quattro domande.** Sui difetti veri e sui falsi non c'è una misura: la radiografia non è mai partita. Sul
  consumo, corregge il 6/11, ma non cambia sessione oltre soglia. Sulle regole è aggiornata solo in parte.
- **Ibrida si può, in due sensi.** Per bersaglio, con una parte comune e una per bersaglio, come il risolutore. Per
  metodo, cioè lettura del codice più prova del sito.
- **L'ordine dei lavori proposto, in sei passi.**
  - ① Le regole in un posto solo: i due manuali rimandano a `cervello/sessioni-insieme.md`.
  - ② Il bersaglio come scelta nel programma, con acceso solo il sito.
  - ③ Il profilo del 9.
  - ④ Il giro di prova come comando.
  - ⑤ La prova sulla copia vecchia: difetti noti trovati, falsi, token per difetto, ore.
  - ⑥ La radiografia vera.
- **La deroga.** Il passo ⑤ cerca difetti noti, quindi per me non la chiede. Il passo ⑥ invece sì, con una data.

## 4. Cosa aspetta Nicola
Il sì sull'ordine ①-⑥. La data e la deroga per ⑥. Quali minori entrano: la proposta è solo quelli per il 9. Le quattro
librerie prima di domenica 15/11: la proposta è sì. E l'unione della #947, che è verde e senza conflitti.

## 5. Cosa non si tocca
- Il codice del sito, senza la firma di Nicola. Con la firma va al senior `tech`, in un ramo di mycity.
- Il manuale della radiografia è della sessione `session_015BmpnVn722KGUHR5nRn23Z`: le modifiche si concordano con lei
  e con l'AD. Prima di costruire si leggono `cervello/scorciatoie-note.md` e la skill `collaudo`.
- Niente radiografia vera senza deroga e data. Niente agenti senza preventivo. La nota riservata sulle immagini non va
  mai in un file. `PASSAGGIO-AD.md` è dell'AD.
- I passi ①-④ cambiano la macchina, quindi vanno in una richiesta di unione da firmare. Se la #947 è unita si riparte
  da main con lo stesso ramo; se no, non si mischia.

## 6. Fatto, tetto, a chi riferire
- **Fatto.** Ogni passo ①-④ ha una prova rossa sul vecchio e verde sul nuovo. Restano verdi
  `node --test cervello/test/radiografia-sessioni.test.mjs` e `node cervello/cancello-lotto.mjs`. Il passo ⑤ scrive i
  suoi quattro numeri in un referto.
- **Tetto.** Questa chat è costata circa 12,83 $, e la madre circa 11 $. Per il lavoro nuovo: al massimo 12
  subagenti e 2 milioni di token, oltre si chiede prima.
- **Riferire.** Si parla con Nicola. Le sue decisioni vanno in `BACHECA-SESSIONI.md` e all'AD quinta chat,
  `session_015BmpnYWmNDPKAztZMPww6M`.
- **La #947.** Ci si iscrive con `subscribe_pr_activity`. Se la #950 dell'AD viene unita prima, ripari tu il conflitto.
