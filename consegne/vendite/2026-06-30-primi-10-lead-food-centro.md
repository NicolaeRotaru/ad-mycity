# Primi 10 lead food — cluster centro (da contattare dopo la 1ª transazione)

> Preparato: **2026-06-30 22:17** · @vendite + @intelligence · 🟢 scouting · 🟡 contatto reale (firma Nicola)
> Fonte: Supabase `merchants_leads` (407 totali, `outreach_status=to_contact`) — query live REST 30/6 22:17.

## Criteri di selezione
1. Categoria **food** (panetteria, macelleria, gastronomia) — buchi di mercato prioritari.
2. **Vicinanza al centro** (lat/lng ~45.048–45.054, lng ~9.688–9.702) — stesso cluster del negozio-faro.
3. **Indirizzo compilato** (pitch più credibile).
4. Esclusi supermercati/GDO (Coop, Conad…) — non target fase 1.

## I 10 (ordine suggerito)

| # | Nome | Categoria | Indirizzo | Score DB | Perché ora |
|---|---|---|---|---|---|
| 1 | **Frolla Couture** | bakery | Via Felice Frasi 8f | 350 | Score più alto del DB; panetteria artigianale, posizione centrale |
| 2 | **Rasparini panificio** | bakery | Piazza Borgo 26 | 50 | Centro storico, piazza ad alto passaggio |
| 3 | **Struzzi** | bakery | Via Roma 95 | 50 | Via Roma = asse commerciale |
| 4 | **Panetteria Del Corso Piacenza** | bakery | Corso Vittorio Emanuele II 181 | 50 | Corso principale, visibilità |
| 5 | **Macelleria Callegari dal 1961** | butcher | Stradone Farnese | 50 | Storicità (>50 anni nel nome), DOP potenziale |
| 6 | **Anzico Forno** | bakery | Via Giuseppe Taverna 82 | 50 | Forno artigianale, zona Borgo |
| 7 | **L'Albero del Pane** | bakery | Via Dieci Giugno 80 | 50 | Panetteria di quartiere vicina al centro |
| 8 | **Macelleria** | butcher | Via G.B. Scalabrini 16a | 50 | Macelleria di prossimità |
| 9 | **Macelleria Polleria** | butcher | Viale Pubblico Passeggio 88 | 50 | Polleria = categoria mancante nel catalogo |
| 10 | **Macelleria Carne Bovina** | butcher | Via Campagna 54 | 50 | Completa il cluster macellerie |

## Come usarli
- **DOPO** la prima transazione end-to-end (Casa Linda o ordine zombie sbloccato): primo contatto con kit **Bando ER** (scade 21/7) già in coda AZIONI #12.
- Messaggio tipo: visita + one-pager bando + demo ordine reale ("guarda, funziona").
- 🟡 ogni contatto reale va firmato da Nicola prima dell'invio.

## Gap
- Telefoni/email non in DB per la maggior parte → servono da Google Maps / visita fisica.
- Score 350 su Frolla Couture vs 50 sugli altri: verificare perché (algoritmo OSM) prima del pitch.
