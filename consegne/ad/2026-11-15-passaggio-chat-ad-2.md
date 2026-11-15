---
tipo: quaderno
data: 2026-11-15 08:55
per: la prossima chat dell'AD, e Nicola se vuole guardare
da: AD chat 2 (session_015BmpnVXjpgkhAJActQd8KN)
---

# Passaggio dell'AD (2): l'officina ha consegnato, adesso tocca al suo collaudo

L'officina ha finito i suoi programmi, e la sua richiesta di unione è pulita e verde.
Il prossimo passo è il collaudatore, in una sessione nuova.

## In parole semplici
L'officina ha costruito i 6 programmi che fanno rispettare le regole sui costi della riparazione. Ha fatto anche tutti e tre i ritocchi chiesti dopo. Ne resta fuori uno solo, più piccolo. Adesso serve chi prova a romperla.

Un esempio: l'ultimo collaudo del 15/11 ha promosso una per una tre riparazioni. Restavano aperte, perché un controllo a campione di ieri sulle stesse riparazioni era rosso. Col programma nuovo, il giudizio pieno di oggi conta e le tre riparazioni si chiudono.

## Cosa cambia per te
Se il collaudo regge, puoi unire l'officina e incollare il freno sugli agenti. Dopo, una sessione corta chiude 7 riparazioni che il collaudo ha già promosso.

## Cosa devi fare
Unire le due richieste di memoria, se ti vanno bene. Poi dire la percentuale del limite settimanale che vedi nell'app.

## Cosa non ho verificato
Le spese dell'officina e del taglio sono stime loro. Il codice dell'officina non l'ho riletto io: lo fa il collaudatore.

---

## Dettagli tecnici

### Dove siamo
- Piano firmato verso le 06:05: consegne/audit/2026-11-15-lezioni-onde/piano.md. Manca la decisione 1, la percentuale del limite: carta #243.
- Regole: skill riparazione, sezione «Le regole del 15/11»; MANUALE-AD, regole 25-27.
- Tetti dei subagenti: riparatore 6, oppure 8 con un grave, mai Workflow. Collaudatore 4.
- Il limite si azzera giovedì 19/11 alle 10:00. Fino ad allora la spesa resta sotto circa 350 $.
- Spese note: squadra delle lezioni circa 13 $. Collaudo K10 15,36 $. AD chat 2 circa 3 $ alle 07:53. Officina: sua stima fra 25 e 38 $ su 45. Taglio: non letto.
- Su main, 3e89ba4: unite la #958, la #959 e la #960.

### Richieste di unione
- #961: memoria di K10, carta #244, e gli 8 difetti nati in frammenti/K10-nuovi-difetti.json. Verde su 2c15c30.
- #962, ramo officina-minima, SHA 13d4ee748ab7c29968e62df0be04c850787ef0b2. È pulita e la CI è verde. Il cancello --veloce dice «SI PUÒ CONSEGNARE».
- La scheda della #962 è AR-1180, con 37 mutazioni prese. Verifica: `node --test cervello/test/officina-minima.test.mjs cervello/test/collaudi-guardati-insieme.test.mjs`.
- #956, il taglio: sorvegliante tolto e main unito. Alle 07:52 giravano il suo collaudo e il cancello.
- #963: questo quaderno.

### Cosa ha fatto l'officina dopo il primo rapporto
- Ha unito main e la #959 nel suo ramo.
- a) Giudizio pieno sull'unione dei collaudi. La prova usa K07 senza giudizio e K10 col pieno su R18-009, R18-018 e R18-020. Le tre voci chiudono come «collaudo pieno» di K10.
- b) Collaudo parziale: il campo è «parziale: true», scritto nel LEGGIMI-collaudo.
- c) La mutazione della deroga id_nel_commit, nella scheda AR-1172.
- Non fatto: AR-1178, cioè applica che si fida dell'esito rialzato dopo il collaudo.

### Da dare al collaudatore
- Dove l'officina si è scostata dal brief:
  - il padrone unico vale solo per le prove citate da almeno 2 voci;
  - il «secondo» si legge dalla punta in sessioni.json, senza fetch dei rami del sito;
  - le regole nuove di valida-referto valgono solo nel comando;
  - conti capisce l'unione da git o dal campo «unita». Con lo squash merge serve il campo.
- Le sue misure sulla campagna del 12/11:
  - classe B: 43 righe, cioè 35 chiavi uniche;
  - dopo pronte restano 27 voci;
  - applica esce 1 per K08;
  - preventivo per 259 voci: 2.016,23 $.
- Il freno sugli agenti non è provato su una sessione vera. Il blocco da incollare è in consegne/officina-minima/freno-agenti-da-incollare.md.

### Sessioni
- Officina, session_015BmpnYEogewAx6A1TGsRju: ha finito e non apre altro lavoro.
- Taglio della #956, session_015BmpnVUQehKpPytmYYeF8E, tetto 15 $.
- Ferme, da non riaprire:
  - regista O2 settima, session_015BmpnVKqiFCVbsAjWm364m;
  - regista della fase 1, session_015BmpnZcszekRaVbNjepdKd;
  - K10, session_015BmpnVoKwLXx38QpasjKQ7, ramo claude/f1-k10, commit 30d749c.

### Prossimi passi, in ordine
1. Il collaudatore dell'officina, in una sessione nuova, sullo SHA 13d4ee7. Mandato di distruggere. Due lenti sui pezzi 1, 3 e 5 e sui ritocchi a, b e c. Tetto 15 $, ultracode acceso, al massimo 4 subagenti.
2. Una costruttrice corta per AR-1178, poi il suo collaudo. Solo se il tetto lo permette.
3. Officina collaudata e unita: una sessione corta lancia applica --scrivi con K10. Le 7 chiusure: R07-010, R07-014, R07-017, R15-014, R18-009, R18-018, R18-020. Porta nel registro anche gli 8 nati di K10.
4. Pilota della cucitura su 25 voci. Sopra le 10 chiuse si allarga, sotto le 6 si ferma. Poi la misura su 40 minori mai lavorati. Tutti e due solo dopo l'officina e l'hook incollato da Nicola.
5. Carte per Nicola: la #243 chiede la percentuale del limite. La #250 rimanda alle decisioni aperte dell'onda 2.

### Regole per chi prende il posto
- Un ordine di fermarsi va con priorità «now». Poi si aspetta la conferma.
- Mai un dato falso per far passare un controllo.
- Si passa la mano a 250 mila token o a fine fase. Una chat nuova parte già da circa 96 mila token.
- I costi si leggono con get_session, nel campo usage.cost_usd. Arrivano solo a turno chiuso.
- Una sessione che lavora legge i messaggi solo a fine turno. Oggi due messaggi sono arrivati con 20 e 45 minuti di ritardo. Chiedi sempre una riga di conferma.
