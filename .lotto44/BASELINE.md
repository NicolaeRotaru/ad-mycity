# Base di misura del lotto 44 — commit di partenza `4a4c6ff` (= origin/main)

Misurato in un worktree separato **prima** che le corsie toccassero l'albero, così un rosso che
compare dopo si sa di chi è.

## Le prove dei difetti aperti, sul commit di partenza

60 difetti aperti su 184 hanno già una prova a comando. Quelle prove sono **36 comandi distinti**.
Lanciati tutti sul commit di partenza: **35 verdi, 1 rosso**.

- 🔴 `node cervello/test/c4-schermo-coda.test.mjs` → exit 1 (è la prova di **AR-613**, l'area della
  firma invisibile ai lettori di schermo). È rosso **prima** di questo lotto: non l'ha causato il
  lavoro di adesso.
- 🟢 gli altri 35.

**Cosa vuol dire.** Un difetto ancora `aperto` con la prova verde non è per forza un difetto vivo:
il lotto 43 ha riparato e provato, e la chiusura — che gira solo **dopo il merge**, con
`auto-fix.mjs verifica --applica` — non è mai passata. Quindi una parte del cantiere è **debito di
chiusura**, non debito di riparazione.

**Cosa NON vuol dire, e qui sta la trappola.** Verde ≠ chiudibile. Tre motivi, tutti già pagati:
1. **La prova condivisa cieca.** `prova-che-non-puo-fallire.test.mjs` è la prova di OTTO difetti
   (AR-565, AR-596, AR-676, AR-678, AR-683, AR-686, AR-693, AR-694). Un test dato a otto difetti che
   non li nomina tutti ne chiude sette mai toccati. Il cancello ha la regola `prova-condivisa-cieca`
   apposta.
2. **Il verde che non ha misurato.** Una prova può essere verde perché guarda dal canale comodo
   (AR-698) o perché il caso non può fallire (AR-694).
3. **La prova che si è smontata.** Il fix può essersi disfatto mentre la prova resta verde.

Perciò: nessuna chiusura in blocco. Ogni difetto lo verifica la sua corsia, uno per uno, sul codice
vero — che è la regola ② del mansionario.

## Altre misure di partenza

- `cervello/tetti-lotto.json`: `prova_con_or 9` · `mutazione_mancante 0` · `prova_debole 39` ·
  `prove_oneste 0` · `test_cervello 2` · `prove_bash_senza_esecutore 29` ·
  `prove_runtime_senza_mutazione 0`.
- Spazzata dei fratelli: nessuna malattia allargata. Le vive con più istanze:
  `programma-che-parte-importando` 64 · `data-senza-ora` 25 · `git-letto-senza-tetto` 18 ·
  `esito-di-un-guardiano-buttato` 9 · `una-parola-con-due-padroni` 5.
- Cantiere: 716 schede — 476 chiuse, 184 aperte, 56 da riverificare.
