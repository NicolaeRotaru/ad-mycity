# 🚲 18 — Operazioni & Logistica (vista COO)

> Filosofia: non sei food-delivery on-demand, sei **micro-logistica urbana con batching giornaliero**. Ogni decisione massimizza gli **ordini-per-giro**. Collega a [[05-Decisioni-Aperte]] · [[16-Finanza-e-Unit-Economics]] · [[Gestione Rider e Pool Fattorini]].

## Modello temporale (cut-off serale → consegna D+1)
- **Ore 21:00** cut-off ordini → 21:30 "order freeze": il sistema aggrega per bottega e invia le **liste-bottega**.
- **Giorno dopo:** ritiro botteghe nelle finestre carico/scarico ZTL (8-9 / 13-14), consolidamento, giri di consegna AM (9:30-12:30) e PM (14-18).
- Perché cut-off 21:00: le botteghe sapere stasera cosa preparare domani.

## Decisione chiave: la BOTTEGA divide per ordine, non il rider
Ogni prodotto esce dalla bottega già in un sacchetto **etichettato col codice-ordine** (#1042). Il consolidamento all'hub diventa semplice raggruppamento, non picking → scala oltre i 15-20 ordini/giorno.

## Mezzo di consegna: 🟢 cargo-bike elettrica (3-4 ruote, payload 100-200 kg)
- **Accesso ZTL 8-19** garantito ai mezzi elettrici → consegni tutto il giorno, non solo nelle finestre. Polizza contro la multa 83€.
- Pedonale OK, cluster 200-400m = distanze risibili. Costo ~€0,10/parcel vs €1,05 van.
- Backup: trolley isotermico a piedi (maltempo/guasto).
- 🔴 **Il modello "negozio consegna" è incompatibile** col carrello multi-bottega (5 negozi non consegnano alla stessa porta). → risolve [[05-Decisioni-Aperte|Decisione 1]].

## Batching: la densità è sopravvivenza
**Soglia minima: 10 ordini/giorno** nel cluster, sotto NON esci (accumuli al giorno dopo). Target a regime 18-25 ordini/giro.
- 🟢 **Slot pricing leggero** (alla Ocado): slot poco richiesti gratis, slot di punta con piccola fee → sposti la domanda dove hai capacità.

## Micro-hub (cross-docking, non magazzino)
10-15 m² ai margini ZTL, baricentrico sulle 3 vie. Cassette numerate per ordine. Nei primi giorni l'hub è il **cassone della cargo-bike** finché non superi ~12 ordini/giorno.

## Catena del freddo (🔴 rischio #1 legale/reputazionale)
3 zone (freddo 0-4°C / congelato / ambiente), **packaging passivo a PCM** (gel pack), separazione caldo/freddo, **checklist temperatura al ritiro**. Transito <2h grazie al batching rende il passivo sufficiente in v1. Vedi obblighi HACCP in [[15-Rischi-e-Compliance]].

## Capacità & scala
- Fondatore-rider: **~20-25 ordini/giorno** (collo di bottiglia = ritiro+consolidamento+CS, non la consegna).
- **Primo hire = "hub master"** (toglie il lavoro cognitivo), POI i rider.
- Scala = **replica cluster-per-cluster** (ogni cluster: micro-hub + 5-15 botteghe in 400m + cargo-bike + hub master). 100 negozi ≈ 7-10 cluster. Mai allungare i giri esistenti.

## KPI operativi (nord-stella: ordini/giro)
ordini/giro **≥4** (target 18-25) · costo/consegna **<€3,5** a regime · on-time **≥95%** · tempo consegna <90 min · fill rate ≥95% · excursion freddo ~0%.

## Rischi & mitigazioni
Bus factor fondatore-rider 🔴 → forma 1 rider backup entro 6-8 sett + 3PL jolly d'emergenza · picchi → cap ordini/slot + slot pricing · maltempo → trolley a piedi + slittamento (il modello settimanale lo tollera) · botteghe in ritardo → SLA + scoring bottega.

### Fonti
[Locus – last-mile/batching](https://locus.sh/blogs/last-mile-route-optimization/) · [EIT Urban Mobility – microhub](https://marketplace.eiturbanmobility.eu/insights/exploring-the-future-of-microhubs-in-last-mile-logistics) · [Cargo-bike €0,10/parcel](https://larryvsharry.com/blogs/business-stories/last-mile-delivery-study) · [Cold chain last-mile](https://tempack.com/news/cold-chain-last-mile-handover/)

#operazioni #logistica #coo #priorità/alta
