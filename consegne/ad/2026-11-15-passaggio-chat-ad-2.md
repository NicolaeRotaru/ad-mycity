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
- Spese note: squadra delle lezioni circa 13 $. Collaudo K10 15,36 $. AD chat 2 circa 3 $ alle 07:53. Officina: sua stima fra 25 e 38 $ su 45. Taglio 16,31 $ su 15.

### Richieste di unione
- #961: memoria di K10, carta #244, e gli 8 difetti nati in frammenti/K10-nuovi-difetti.json. Verde su 2c15c30.
- #962, ramo officina-minima, testa 62247e4 (codice di 13d4ee7 + registro del sorvegliante, prove 125 su 125). È pulita e la CI è verde. Il cancello --veloce dice «SI PUÒ CONSEGNARE».
- La scheda della #962 è AR-1180, con 37 mutazioni prese. Verifica: `node --test cervello/test/officina-minima.test.mjs cervello/test/collaudi-guardati-insieme.test.mjs`.
- #956, il taglio: pronta da unire su 58c232b72.
- #963: questo quaderno, verde su 288ca52.

### Cosa ha fatto l'officina dopo il primo rapporto
- Ha unito main e la #959. Ritocchi: a) giudizio pieno sull'unione dei collaudi (K07 + K10 su R18-009, -018, -020); b) campo «parziale: true» nel LEGGIMI-collaudo; c) mutazione della deroga id_nel_commit in AR-1172.
- Non fatto: AR-1178, cioè applica che si fida dell'esito rialzato dopo il collaudo.

### Da dare al collaudatore
- Già dato nel brief del collaudatore: gli scostamenti dal brief, le misure del 12/11 da ricalcolare, il freno sugli agenti in consegne/officina-minima/freno-agenti-da-incollare.md.

### Sessioni (aggiornato dall'AD chat 3, session_015BmpnUti7NiAJcN27m2Q67, alle 08:55)
- Collaudatore dell'officina, session_015BmpnV5woFbf5fJbNUtveL, partito alle 08:52. Collauda la testa nuova della #962, 62247e4, che ha sopra 13d4ee7 solo il registro del sorvegliante. Tetto 15 $, 4 subagenti. Consegna in una PR il file consegne/officina-minima/collaudo-2026-11-15.md.
- Officina, session_015BmpnYEogewAx6A1TGsRju: ha confermato, è ferma.
- Taglio della #956, session_015BmpnVUQehKpPytmYYeF8E: ha chiuso. La #956 si può unire (58c232b72). Ha speso 16,31 $ su un tetto di 15. Il difetto minore che ha visto è in consegne/ad/2026-11-15-difetto-glossario-verde-muto.json, e aspetta un numero AR.
- Lezione: il contatore dei token di get_session può restare fermo. Non fidarti di un numero che non si muove.
- Ferme, da non riaprire:
  - regista O2 settima, session_015BmpnVKqiFCVbsAjWm364m;
  - regista della fase 1, session_015BmpnZcszekRaVbNjepdKd;
  - K10, session_015BmpnVoKwLXx38QpasjKQ7, ramo claude/f1-k10, commit 30d749c.

### Prossimi passi, in ordine
1. PARTITO alle 08:52 (session_015BmpnV5woFbf5fJbNUtveL, testa 62247e4): il collaudatore dell'officina. Mandato di distruggere. Due lenti sui pezzi 1, 3 e 5 e sui ritocchi a, b e c. Tetto 15 $, ultracode acceso, al massimo 4 subagenti.
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
