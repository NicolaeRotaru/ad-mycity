## Scadenzario — countdown reale sulle scadenze esterne (AR-147)

**Il problema in una frase:** PI26 (10.000€ a fondo perduto, scade 30/7 ore 16:00) e le altre scadenze esterne (bandi, fiscali, contrattuali, assicurative) vivevano solo come promemoria scritti a mano nei Report/Briefing — nessun dato sorvegliato, nessun allarme automatico se qualcuno se ne dimenticava.

**Cosa cambia:**
- `cervello/scadenzario-check.mjs` (nuovo): legge `MyCity-Vault/05-Soldi-Rischi/scadenzario.json`, calcola i giorni residui per ogni scadenza "aperta" e accoda **una sola volta** (dedup su marcatore `<!-- scadenzario:<id> -->`, stessa lezione delle sentinelle duplicate del 23/7) una card 🔴 in `AZIONI-IN-ATTESA.md` quando la scadenza entra nella sua finestra di allarme (default 7 giorni) e non è ancora chiusa.
- `cervello/giro.sh`: wired come le altre sentinelle non bloccanti (`node ... || true`) subito dopo la sentinella budget — mai un cancello hard, solo un promemoria.
- `MyCity-Vault/05-Soldi-Rischi/scadenzario.json`: prima voce reale, PI26 (fonte: `consegne/relazioni-istituzionali/2026-07-18-bandi-cciaa-pi26-be26.md`).

**Se va bene:** al prossimo giro la card PI26 compare in AZIONI-IN-ATTESA (o compare già ora se qualcun altro l'ha già accodata a mano — il dedup non ne crea una seconda); il file diventa il posto unico dove aggiungere le prossime scadenze (fiscali/contrattuali/assicurative man mano che si scoprono).

**Non testato dal vivo:** l'esecuzione di script nuovi è bloccata dal sistema di permessi in questa sessione headless (stesso limite già incontrato stasera sui 2 fix precedenti). Verificato a occhio riga per riga, stesso schema già in produzione di `cervello/sentinella-budget.mjs` (letto per intero prima di scrivere il nuovo script).

**Rischio:** basso — file nuovo, non tocca percorsi esistenti; l'unica riga toccata in `giro.sh` è un'aggiunta non bloccante (`|| true`), stesso pattern delle 5 sentinelle già wired lì.
