---
tipo: quaderno
data: 2026-11-15 11:15
per: la prossima chat dell'AD, e Nicola se vuole guardare
da: AD chat 3, session_015BmpnUti7NiAJcN27m2Q67
prima_versione: AD chat 2, session_015BmpnVXjpgkhAJActQd8KN
---

# Il quaderno dell'AD: l'officina è su main e collaudata, adesso si scrivono le chiusure di K10

L'officina è su main, corretta e ricollaudata.
Una sessione corta sta scrivendo nel registro del sito le 7 chiusure di K10.

## In parole semplici
L'officina sono i 6 programmi che fanno rispettare le regole sui costi della riparazione. Il primo collaudo l'ha bocciata per un difetto bloccante. Una sessione corta l'ha corretto, e il ricollaudo dice che regge, con una riserva.

Un esempio: con la correzione, le 7 riparazioni promosse da K10 si chiudono, e le 7 riparazioni del 12/11 già chiuse restano chiuse. Il programma passa da 193 voci chiuse a 200, cioè 7 in più.

## Cosa cambia per te
Le 7 chiusure di K10 entrano nel registro con la prossima richiesta di unione. Dopo si può passare al pilota della cucitura, quando avrai incollato il freno sugli agenti.

## Cosa devi fare
Unire la richiesta del ricollaudo e chiudere quella vecchia del collaudo. Poi dire la percentuale del limite settimanale che vedi nell'app.

## Cosa non ho verificato
Le spese sono stime delle sessioni. Il dato vero si vede nell'app.

---

## Dettagli tecnici

### Dove siamo
- Piano firmato verso le 06:05: consegne/audit/2026-11-15-lezioni-onde/piano.md. Manca la decisione 1, la percentuale del limite: carta #243.
- Regole: skill riparazione, sezione «Le regole del 15/11»; MANUALE-AD, regole 25-27.
- Il limite si azzera giovedì 19/11 alle 10:00. Fino ad allora la spesa resta sotto circa 350 $.
- Spese note, circa 115 $ in tutto:
  - squadra delle lezioni circa 13 $;
  - K10 15,36 $;
  - officina fra 25 e 38 $;
  - taglio della #956 16,31 $;
  - collaudo circa 6 $, costruttrice circa 12 $, ricollaudo circa 5 $;
  - le chat dell'AD.

### Su main (in ordine)
- #956 (014bd32): glossario sì, sorvegliante no.
- #961 (0970e87): memoria di K10, con gli 8 nati in frammenti/K10-nuovi-difetti.json.
- #962 (85e4167): l'officina, unita con squash sulla testa c543644, con dentro la correzione 41e041c.
- #963: il quaderno, il referto del collaudo e la carta #254, già superata.
- #965 (823f579): minore 3. L'AD ha corretto il titolo della prova, che sforava il tetto dei puntatori scollegati.

### Aperte
- #966 UNITA (1ed6a5d): referto del ricollaudo, REGGE CON RISERVA, con la carta #255 (scelta a o b sulla regola dei 40).
- #970: le 7 chiusure di K10 e gli 8 nati (riparate 1390 → 1397, AR-1184/1185/1186). Alle 19:10 la sessione corta …X32Uaq unisce main e registra il difetto delle date rimesse a oggi.
- #964: referto del primo collaudo con la carta #254 vecchia. Da chiudere senza unirla, perché è doppia della #963.
- Riserva del ricollaudo: la regola dei 40 voci la tiene solo valida-collaudo, mentre applica e pronte chiamano decidi senza misura:true. La riga 466 della skill riparazione promette il contrario.

### Sessioni
- In corso: la sessione corta session_015BmpnX32UaqzsSQ48LGkcz, ramo claude/applica-k10, tetto 8 $.
  - Lancia applica --scrivi con K10 (collaudi/K10.json da claude/f1-k10, 30d749c): 7 chiusure e gli 8 nati.
  - Mette nel cantiere la riserva, il minore della prova di finita e il difetto del glossario di consegne/ad/2026-11-15-difetto-glossario-verde-muto.json.
- Chiuse, da non riaprire: officina …YEogew, taglio …VUQehK, collaudatore …V5woFb, costruttrice …Wza8rD, ricollaudo …WSz6di, regista O2 …VKqiFC, regista fase 1 …ZcszekRa, K10 …VoKwLX.
- Nel cantiere: AR-1181 (contatore del freno), AR-1182 (pronte con --git, il minore 2, aperto), AR-1183 (chiuso con la #965).

### Prossimi passi, in ordine
1. Quando la sessione corta consegna: controllare i numeri (+7 riparate, +8 aperte, nient'altro), poi dire a Nicola di unire.
2. AR-1178, cioè applica che si fida dell'esito rialzato dopo il collaudo: una costruttrice corta, poi il suo collaudo. Solo se il tetto lo permette.
3. L'onda 3 e il pilota sono della chat 4 dell'AD «Ondata 3», session_015BmpnV65jCuJATqykK8GtB, aperta da Nicola alle 11:13. Questa chat non apre niente per lei. Le si manda l'id della PR delle 7 chiusure di K10. Il pilota della cucitura, se lo prende lei, va su 25 voci: sopra le 10 chiuse si allarga, sotto le 6 si ferma. Poi la misura su 40 minori mai lavorati. Tutti e due solo dopo che Nicola ha incollato il freno, consegne/officina-minima/freno-agenti-da-incollare.md.
4. Carte per Nicola: la #243 chiede la percentuale del limite, la #250 rimanda alle decisioni aperte dell'onda 2.

### Regole per chi prende il posto
- Un ordine di fermarsi va con priorità «now». Poi si aspetta la conferma.
- Mai un dato falso per far passare un controllo.
- Si passa la mano a 250 mila token o a fine fase. Una chat nuova parte già da circa 96 mila token.
- I costi si leggono con get_session, nel campo usage.cost_usd. Arrivano solo a turno chiuso, e il contatore può restare fermo.
- Una sessione che lavora legge i messaggi solo a fine turno. Chiedi sempre una riga di conferma.
- Nicola può scrivere direttamente alle sessioni e unire prima del collaudo. Prima di dire «non unire», controlla main con git.
- Due richieste che aggiungono le stesse righe nello stesso punto vanno in conflitto. Provalo con `git merge-tree --write-tree`, prima di dire «uniscile tutte e due».
