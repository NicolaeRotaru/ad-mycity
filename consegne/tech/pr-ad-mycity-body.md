## In parole semplici
Un controllo automatico (il "sorvegliante") segnalava da settimane lo stesso avviso: una prova che
doveva proteggere un fix vecchio (AR-046) non riusciva più a rompersi. L'ho trovato mentre preparavo
un post per Nicola: il controllo cercava, dentro un file di log che cresce ogni giorno, un numero
vecchio ("608") che nel frattempo è scorso fuori dalla finestra dei dati recenti. Cercava un numero
che non c'era più, quindi non poteva più dimostrare niente.

## Cosa cambia
Il controllo torna a funzionare: ora cerca un numero che nel file c'è davvero oggi, mantenendo la
stessa logica di prima (bloccare la stessa storpiatura, se tornasse). Non cambia il fix originale
(AR-046), non cambia il comportamento del marketplace, non cambia niente per gli utenti: è un
aggiustamento a un test interno.

## Cosa devi fare
Rivedi e mergia quando hai un minuto: è un file di sola configurazione dei test (`cervello/mutanti.json`),
zero rischio per il sito. Non è urgente, ma il sorvegliante lo segnalerà ad ogni giro finché non entra.

## Cosa non ho verificato
Non ho fatto girare l'intera suite `gate-veri.mjs` (serve tempo, non l'ho lanciata su questa PR
isolata) — ho verificato a mano che il valore nuovo ("663") compare una sola volta nel file bersaglio
e che la voce che lo contiene ha `chiusi_in_questa_passata: 5`, quindi sostituirlo con 3 rompe
l'invariante testato, con la stessa logica della mutazione originale (608→3).

---

## 🔧 Dettagli tecnici
- **File:** `cervello/mutanti.json`, voce `AR-046`.
- **Prima:** `"cerca": "\"difetti_chiusi\": 608"` — valore uscito dalla finestra di
  `MyCity-Vault/90-Memoria-AI/auto-coscienza/storico-salute.json` (serie temporale che avanza).
- **Dopo:** `"cerca": "\"difetti_chiusi\": 663,"` → `"sostituisci": "\"difetti_chiusi\": 3,"` — la voce
  bersaglio ha `"chiusi_in_questa_passata": 5` nella riga successiva, quindi la mutazione rompe
  l'invariante `x.difetti_chiusi >= x.chiusi_in_questa_passata` testato in
  `cervello/test/il-volano-i-sensori-e-la-stella.test.mjs` (righe 88-89).
- **Prova:** `node --test cervello/test/il-volano-i-sensori-e-la-stella.test.mjs` → 13/13 verdi sul
  file reale (non mutato). Verifica statica della mutazione: `grep -c '"difetti_chiusi": 663,'
  MyCity-Vault/90-Memoria-AI/auto-coscienza/storico-salute.json` → 1 (match unico, nessun rischio di
  colpire la voce sbagliata).
- **Nota:** non ho eseguito un ciclo mutate→test→restore dal vivo sul file reale, perché è lo stesso
  file su cui il worker automatico scrive di continuo (rischio di collisione concorrente, vedi
  `worker-concorrente-durante-sessione-interattiva` in memoria) — la verifica sopra è statica ma
  copre esattamente la logica che il test controlla.
