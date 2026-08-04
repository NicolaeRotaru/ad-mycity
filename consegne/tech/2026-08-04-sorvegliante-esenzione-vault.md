# Il controllo automatico blocca anche un aggiornamento onesto della memoria

**In parole semplici:** ogni volta che la macchina prova a salvare `cantiere-prove.json` (il referto di quali difetti aperti hanno ancora bisogno di una prova), il controllo automatico grida "hai tolto una difesa" — ma non è vero: quei 4 test riguardano difetti già chiusi il 3 agosto, e il referto giustamente non li elenca più. Il controllo non sa distinguere "ho cancellato un freno vero" da "il difetto è chiuso e il referto si è aggiornato".

**Cosa cambia per te:** niente di rotto nel sito o nei pagamenti. Ma ogni sessione che tocca questo file (e lo tocca quasi ogni giro, perché è un referto vivo) deve escluderlo a mano dal commit come ho fatto oggi, altrimenti il salvataggio si blocca. È già successo 148 volte in questa sola sessione — è rumore che nasconde i controlli veri.

**Cosa devi fare:** niente subito. È già in coda per un tecnico, non urgente.

---

## Perché succede (causa radice)

Il controllo (`cervello/sorvegliante.mjs`, check ⑥ "difesa-rimossa") accusa qualunque riga rimossa che chiami un file `cervello/test/*.test.mjs`. `cantiere-prove.json` è un referto **rigenerato automaticamente** da `cervello/cantiere-prove.mjs`, che per progetto elenca solo i test-guardiano dei difetti **ancora aperti** — quando un difetto chiude (qui AR-447, AR-448, AR-450, il 3/8), la sua riga sparisce dal referto per disegno, non per errore. I test esistono ancora, girano ancora (verificato: 131/131 passano), sono ancora citati nelle schede del cantiere e in `mutanti.json`.

Il meccanismo di esenzione della macchina (`sorvegliante: ok <classe> fino al <data> — <perché>`) funziona SOLO nei file che il sistema considera "codice" (`eCodice()`). `MyCity-Vault/` è escluso da `eCodice()` per una scelta voluta di un altro difetto (AR-554/AR-556) — quindi non esiste **nessun file toccato in un aggiornamento di memoria** dove questa dichiarazione possa vivere. È un buco strutturale: il controllo guarda dentro `MyCity-Vault/`, ma il permesso di rispondergli no.

## La cura proposta (per un tecnico)

Una delle due, da decidere con @tech:
1. **Insegnare al check ⑥** a non accusare `cantiere-prove.json` quando la riga tolta corrisponde a un `id` marcato `chiuso` in `cantiere-difetti.json` nello stesso giro (verifica incrociata, non solo testuale).
2. **Allargare la via di esenzione** perché una dichiarazione in un file di codice del commit (es. `cervello/cantiere-prove.mjs`, che genera il file incriminato) possa coprire violazioni trovate nel file che genera — il `copre()` già confronta solo la `classe`, non il percorso, quindi basterebbe permettere la lettura del marcatore anche quando il file-sorgente della violazione è sotto `MyCity-Vault/` mentre il file che dichiara l'esenzione è codice vero.

Non l'ho toccato io: è codice (`cervello/sorvegliante.mjs` o `cervello/cantiere-prove.mjs`), serve branch + PR + prova che il fix non spalanca la porta ad accuse vere.

## 🔧 Dettagli tecnici
- File coinvolto: `MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-prove.json` (righe ~1382, 1391, 1400, 1409 nel giro del 4/8).
- Check: `cervello/sorvegliante.mjs`, classe `difesa-rimossa` (commento ⑥, riga ~244).
- Precedente identico già registrato: `cantiere-difetti.json:11232` (nato come AR-544, rinumerato al merge del 4/8).
- Verificato che nessuno script esegue i test leggendo `cantiere-prove.json` come lista di comandi (è un referto, non un runner): `grep -rl cantiere-prove cervello/*.mjs cervello/*.sh .github/workflows/*.yml` → solo generatore e censimento, nessun esecutore.
- `git commit` di oggi (`1ecfdfc83`) ha escluso volutamente `cantiere-prove.json` per non forzare il cancello.
