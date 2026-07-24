## Cosa

Blocca il doppio invio ravvicinato nella barra di scrittura della chat (`BarraScritturaChat.tsx`), che duplicava le chat nuove.

## Perché

Nicola ha segnalato (24/7, screenshot alla mano) chat duplicate nella lista: stesso titolo, stesso minuto, una con 1 messaggio e una con 2. Verificato nel codice: il bottone "invia" non ha un blocco contro il doppio tap. `invia()` legge il testo dallo state `bozza`; `setBozza("")` è asincrono, quindi un secondo tap arrivato prima del ri-render leggeva ANCORA il testo vecchio e richiamava `onInvia(t)` una seconda volta con lo stesso messaggio — due chiamate a `mandaAlCervello` creano due conversazioni reali distinte sul server (una resta "fantasma" ferma al primo messaggio, l'altra riceve la risposta e cresce).

Non è lo stesso bug della PR #517 (23/7): quello copriva un id-segnaposto locale rimasto orfano dopo un poll; questo è un doppio-submit reale prima ancora che una conversazione esista.

## Come

Aggiunto un lock sincrono (`useRef`) in `invia()`: il primo tap parte normalmente e blocca ogni tap successivo per 800ms, poi si riapre. Essendo sincrono (non uno state), il secondo tap ravvicinato viene scartato PRIMA di chiamare `onInvia`, anche se arriva nello stesso istante del primo.

## Come provare

1. Sul Pannello (mobile o desktop), scrivere un messaggio in una chat nuova.
2. Fare doppio tap/click molto rapido sul bottone invia.
3. Atteso dopo il fix: un solo messaggio parte, una sola chat compare nella lista.
4. Verificato: `npx tsc --noEmit` pulito, nessun errore.

Non testato dal vivo nel browser (sessione headless, nessun accesso a un browser reale) — verifica visiva sul Pannello dopo il merge consigliata.
