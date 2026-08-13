## Cosa fa

Chiude il vincolo HARD di apprendimento del giro 2026-08-12 («l'area correzione-nicola non è mai diventata un gate»): ora è un guardiano vero, misurato e agganciato al giro.

- **`cervello/correzione-nicola-gate.mjs` + test** — conta le lezioni con fonte/tag "correzione di Nicola" che NON hanno un `gate:` scrivibile. Prima misura reale su `apprendimento.json`: **310 lezioni taggate, 251 senza gate** (soglia sana: 20). Il numero entra in `giro.sh` come vincolo — se peggiora o resta sopra soglia, il giro lo vede.
- **`scadenzario-check.mjs`** — il registro delle scadenze ora è iniettabile (`SCADENZARIO_REGISTRO`), così i test non dipendono più da una scadenza di business reale che può chiudersi da un giorno all'altro (è successo con PI26, chiuso il 29/7 — i test ci puntavano ancora).
- **Due bug reali nei test dei sensori** (`cieco-dichiarato-verde.test.mjs`, `sensori-non-calpestati.test.mjs`): le chiavi Supabase venivano tolte con `delete env[k]`, ma `git-github.mjs` le ripopola dal `.env` del VPS al proprio import — il comando sotto test girava CON le chiavi mentre il test credeva di averle spente. Fix: stringa vuota (resta "presente" per `in`, ma falsy per ogni controllo reale).
- **`censimento-guardiani.mjs`/`censimento-macchina.mjs`** — riga descrittiva mancante per il nuovo guardiano e per ~60 skill arrivate con un aggiornamento plugin (il guardiano `mappa-macchina.mjs` le segnalava scoperte).

## Prova

`node --test cervello/test/*.test.mjs` → 1106 pass, 0 fail, 3 skip (incluso il test nuovo `correzione-nicola-gate.test.mjs`, 12 casi).

## Nota onesta

Il guardiano nuovo **misura** il debito, non lo **risolve**: 251 correzioni di Nicola restano senza un freno automatico. È voluto — molte sono lezioni di processo/giudizio (es. un rebase git che si sblocca ricreando il branch) che non si prestano a un gate automatico 1:1. La prossima mossa utile non è "gate-are tutte e 251", ma rivedere quali delle 251 sono davvero gate-abili e cristallizzare quelle 2-3 più mature — che è il prossimo passo del vincolo apprendimento.

🤖 Generato con [Claude Code](https://claude.com/claude-code)
