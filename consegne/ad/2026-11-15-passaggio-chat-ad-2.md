---
tipo: quaderno
data: 2026-11-15 07:58
da: AD chat 2 (session_015BmpnVXjpgkhAJActQd8KN), a 214 mila token sui 250 del passaggio
---

# Passaggio dell'AD (2): il piano del 15/11, mentre l'officina finisce

## Dove siamo
- Piano firmato da Nicola verso le 06:05: consegne/audit/2026-11-15-lezioni-onde/piano.md, 5 lezioni e 7 decisioni. Ne manca una sola, la 1: la percentuale vera del limite settimanale, carta #243.
- Regole: skill riparazione, sezione «Le regole del 15/11»; cervello/MANUALE-AD.md, regole 25-27. LEGGIMI-riparatore: tetto 6 subagenti, 8 con un grave, mai Workflow. LEGGIMI-collaudo: tetto 4.
- Il limite si azzera giovedì 19/11 alle 10:00. Tetto prudente circa 350 $ finché Nicola non dà la percentuale.
- Spese note di questa fase: squadra delle lezioni circa 13 $, collaudo K10 15,36 $, AD chat 2 circa 3 $ alle 07:53. L'officina stima circa 31 $, cioè il 70% di 45, non ancora letti. Il taglio della #956 non è ancora letto.
- Su main, 3e89ba4: unite la #958, la #959 (78 chiusure dell'onda 2 e la deroga per singolo commit) e la #960.

## Richieste di unione aperte
- #961, ramo ccr-35d5a384-heiqd7: memoria del collaudo K10, 8 difetti nati in consegne/riparazioni/2026-11-12-sito-tutto/frammenti/K10-nuovi-difetti.json, carta #244. Verde su 2c15c30, da unire da Nicola. Ero iscritta io: ora tocca a te.
- #962, ramo officina-minima: i 6 programmi, scheda AR-1180, verifica `node --test cervello/test/officina-minima.test.mjs` (40 casi, 31 mutazioni). Alle 07:52 l'officina ha unito la #959 e main, e il cancello --veloce è tornato verde: SHA 62d827ec445c59d6d79ef44ff7523c2f0ecbf8a4. La CI la segue lei.
- #956: il taglio. Sorvegliante tolto, main unito, prove verdi. Alle 07:52 giravano il suo collaudo e il secondo giro del cancello; dopo spinge.
- Questa richiesta: il quaderno e la riga automatica del sorvegliante.

## Sessioni vive (dalle 07:40 scrivono alla chat 2: dì loro il tuo indirizzo)
- Officina, session_015BmpnYEogewAx6A1TGsRju, tetto 45 $, stima sua 20-30 $, vicina al 70%. Già fatti: l'unione con main e con la #959, e c), la mutazione della deroga id_nel_commit, che sta nella scheda AR-1172. Alle 08:00 le ho detto di fare SOLO a), entro i 42 $, e di confermare con una riga («a) parto» o «a) non ci sta»):
  a. giudizio pieno sull'unione dei collaudi. K07 ha un campione rosso su R18, K10 ha il pieno su R18-009, R18-018 e R18-020: le tre voci devono chiudersi. Vince il giudizio peggiore; un giudizio non pieno non batte mai un pieno; gravi invariati. Con prova e mutazione.
- Da passare a una sessione costruttrice nuova, mai al collaudatore:
  b. valida-collaudo accetta un collaudo parziale. Il campo si sceglie e si scrive nel LEGGIMI-collaudo. Le voci non elencate restano «nessun collaudo», e un parziale non dichiara un campione accettato;
  AR-1178: applica che si fida dell'esito rialzato dopo il collaudo.
- I messaggi della chat 1 delle 07:20 l'officina li ha letti solo alle 07:39, tutti insieme: non erano persi, ma letti tardi.
- Taglio della #956, session_015BmpnVUQehKpPytmYYeF8E, tetto 15 $.
- Ferme, da non riaprire: regista O2 settima session_015BmpnVKqiFCVbsAjWm364m; regista della fase 1 session_015BmpnZcszekRaVbNjepdKd; K10 session_015BmpnVoKwLXx38QpasjKQ7, ramo claude/f1-k10, commit 30d749c.

## Da dare al collaudatore dell'officina
- Dove l'officina si è scostata dal brief:
  - il padrone unico vale solo per le prove citate da almeno 2 voci;
  - il «secondo» lo legge dalla punta in sessioni.json, senza fetch dei rami del sito;
  - le regole nuove di valida-referto valgono solo nel comando, non quando applica rilegge referti vecchi;
  - conti capisce l'unione da git o da un campo «unita»: con lo squash merge serve il campo.
- Le sue misure sulla campagna del 12/11: la classe B ha 43 righe, cioè 35 chiavi uniche; dopo pronte restano 27 voci; applica esce 1 per K08; preventivo per 259 voci 2.016,23 $.
- Il freno sugli agenti non è provato su una sessione vera. Il blocco da incollare è in consegne/officina-minima/freno-agenti-da-incollare.md: lo incolla Nicola dopo l'unione.
- Quello che l'officina non fa nei pezzi a-c va a una sessione costruttrice nuova, mai al collaudatore.

## Prossimi passi, in ordine
1. Quando l'officina dà lo SHA finale: collaudatore in una sessione nuova. Mandato di distruggere, due lenti sui pezzi 1, 3 e 5 e sui ritocchi a) e c), tetto 15 $, ultracode acceso, tetto 4 subagenti. Dentro ci vanno gli scostamenti qui sopra. In parallelo, se il tetto lo permette: una costruttrice corta per b) e AR-1178, collaudata dopo.
2. Officina collaudata e unita: una sessione corta lancia applica --scrivi con K10. Le 7 chiusure: R07-010, R07-014, R07-017, R15-014, R18-009, R18-018, R18-020. Porta nel registro anche gli 8 nati di K10-nuovi-difetti.json.
3. Pilota della cucitura su 25 voci: sopra le 10 chiuse si allarga, sotto le 6 si ferma. Misura su 40 minori mai lavorati. Tutti e due solo dopo l'officina e l'hook incollato da Nicola, e dentro il tetto.
4. Carte per Nicola: la #243 chiede la percentuale del limite; la #250 rimanda alle decisioni aperte dell'onda 2.

## Regole che valgono per te
- Un ordine di fermarsi va con priorità «now», e aspetti la conferma.
- Mai un dato falso per far passare un controllo.
- Passi la mano a 250 mila token o a fine fase. Una chat nuova parte già da circa 96 mila token, quindi il margine vero è circa 150 mila: niente letture larghe.
- I costi si leggono con get_session, campo usage.cost_usd, e arrivano solo a turno chiuso.
- Al primo turno scrivi all'officina e al taglio il tuo indirizzo. La chat 2 resta viva e ti gira quello che le arriva tardi.
- Un messaggio a una sessione che sta lavorando si legge solo a fine turno: chiedi sempre una riga di conferma.
