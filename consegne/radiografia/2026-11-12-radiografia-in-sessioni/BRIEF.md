---
tipo: quaderno-di-bordo
data: 2026-11-12 23:45
per: la sessione che porta la radiografia del sito sullo schema della riparazione in sessioni
---

# La radiografia in sessioni — il quaderno di bordo

## In parole semplici
Nicola, 12/11 notte: «abbiamo migliorato notevolmente il risolutore, ora facciamo un bel lavoro anche sulla
radiografia… risolvi, migliora, rendila più efficiente». La radiografia trova i difetti del sito; il risolutore li
ripara. Il risolutore oggi ha regia a parte, controlli a strati e regole sul consumo. La radiografia no: quella in 12
sessioni del 6/11 è partita incollando quattro testi legati a quel giorno.

## Cosa cambia per te
Lavori sul ramo `claude/sweet-galileo-0skkay` di `ad-mycity`, la PR #944. Sullo stesso ramo lavora la regista del
risolutore: fai sempre `git pull` prima di spingere, e non toccare la skill `riparazione`, i suoi LEGGIMI e la
cartella `consegne/riparazioni/`.

## Cosa devi fare
1. **Misura prima** quanto è costata la radiografia del 6/11 e dove. Gli id delle sue sessioni sono in
   `consegne/audit/2026-11-06-radiografia-12-sessioni/sessioni.json`; leggi `get_session` (campo `usage.cost_usd`) e gli
   eventi `result`. Tieni questa misura sotto i 3 agenti leggeri.
2. **Costruisci** la radiografia in sessioni avviabile con una frase:
   - una skill `radiografia`;
   - un programma salvato in `cervello/`, generalizzando `consegne/audit/2026-11-06-radiografia-12-sessioni/controlli.mjs`;
   - i LEGGIMI di cercatori e verificatori;
   - il comando in `COMANDI.md` e in `cervello/MANUALE-AD.md`.
   Guarda come è fatta la riparazione: `.claude/skills/riparazione/SKILL.md`, `cervello/riparazione-sessioni.mjs`,
   `cervello/riparazione/`.
3. **Collaudo indipendente** (un agente `qa`, domande chiuse, mutazioni sulle prove), correggi, poi `cancello-stop` e
   radiografia in corsa. Rispetta l'asticella: ogni regola che deve reggere ha una prova che diventa rossa senza di lei.
4. **Non lanciare una radiografia vera**: costa. La prima corsa parte solo col «via» di Nicola, dopo un preventivo.
5. A fine lavoro manda all'AD (`session_015BmpnWWfcmEfYEhQ25M7s2`) un messaggio che apre con «Il punto adesso».

## Cosa non ho verificato
Non ho riletto la radiografia del 6/11: so solo dove stanno i suoi file e che il suo testo è legato a quel giorno.

---

## Dettagli tecnici — le lezioni del risolutore da portare dentro

- **La regia in una sessione sua**, con fermate, preventivo e le figlie aperte in «Ultra Code Extra»
  (`effort: "xhigh"`, ultracode acceso, controllo con `get_session`). Regole del 12/11 della skill `riparazione`.
- **Prima i programmi:** divisione, schede, controllo dei referti, doppioni contro il registro, conti. Agli agenti
  restano le domande di giudizio (regole ⑬-⑰ di `cervello/MANUALE-AD.md`).
- **Il consumo** (regole ⑱-㉔, e la misura del 12/11: il 61% del costo dell'onda 1 era rilettura di storie da
  440-775 mila token):
  - cercatori a lotti con subagenti nuovi;
  - storie sotto i 150-300 mila token;
  - un turno, un esito;
  - rapporti corti, con i log su file.
- **Il valore prima del volume** (regola ⑳): con più di 100 minori aperti nel registro non si cercano minori nuovi.
  Serve un profilo «lancio», che cerca solo bloccanti e gravi. Prima ancora, un giro dei flussi che incassano sulla
  palestra (copia del sito): il bloccante degli indirizzi l'ha trovato quel giro, non la lettura del codice.
- **La verifica proporzionata** (regola ⑲): un secondo agente solo per bloccanti, gravi e sicurezza, e parte dalla
  prova (regola ⑯). Un minore entra visto una volta, con `verificato: false`. I doppioni contro il registro li toglie
  un programma prima della verifica, e il controllo di un controllo non si fa.
- **I controlli a strati:** programmi, verificatori, e un controllore finale che rifà i conti e guarda che nessun
  difetto trovato sia sparito.
- **Le falle riservate** non vanno nel deposito pubblico: forma fissa del titolo, dettagli solo in chat, come in
  `regoleNuoviDifetti`.
- **I lucchetti:** nel sito `.claude/settings.json` vieta Supabase, Vercel e Stripe. In `ad-mycity` scrivi un
  `.claude/settings.local.json` con lo stesso divieto, nella tua copia e in quella di ogni figlia.
- **La scrittura:** messaggi a Nicola con «Il punto adesso» (Regola 3-ter di `cervello/scrittura-umana.md`).
