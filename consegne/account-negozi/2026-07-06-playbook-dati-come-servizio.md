---
tipo: playbook
reparto: account-negozi (+ analista, data-engineer, growth-monetizzazione)
data: 2026-07-06 13:52
colore: 🟢 costruire il modello · 🔴 consegnare/vendere al negozio
faro: Pane Quotidiano (unico negozio reale · seller c0b240c0…)
fonte-dati: MCP Supabase 6/7 11:11 (7 numeri live) + snapshot REST in [[AZIONI-IN-ATTESA]] A3
---

# 📊 Dati-come-servizio — il report che solo MyCity può dare al negozio

## In una riga
MyCity vede cose che il negoziante **da solo non può sapere**: cosa vende di più *online*,
a che ora ordinano, chi è un cliente di ritorno. Questo playbook è lo **stampo** di un
mini-report mensile da **regalare** al negozio (leva di retention: lo tiene dentro perché
gli è utile) e, a scala, da **vendere** come servizio dati premium.

---

## ⚠️ Cancello di serietà — perché oggi è uno STAMPO, non un report pieno
Il report vive di **transazioni completate**. Oggi il dato reale è (fonte: MCP Supabase 6/7 11:11):

| Numero | Valore reale oggi | Conseguenza sul report |
|---|---|---|
| Negozi attivi | **1** (Pane Quotidiano) | il servizio ha 1 solo destinatario reale |
| Ordini **completati/pagati/consegnati** | **0** | «cosa vende di più» = non calcolabile ancora |
| Ordini creati | 1 (COD €19,05, 24/6) → **ANNULLATO** il 3/7 | non è una vendita: 0 ricavo, 0 consegna |
| Clienti totali | 23 (0 nuovi in 7g) | «clienti di ritorno» = **0 per definizione** (servono ≥2 ordini consegnati/persona) |

> **Onestà (regola d'oro):** NON invento best-seller, orari di punta o clienti fedeli dove non c'è
> transato. Sarebbe un «Garetti inventato». Quindi oggi consegno lo **stampo pronto** + il poco
> **dato reale** che esiste (sotto), e il report pieno si **auto-riempie** appena Pane Quotidiano
> chiude il primo ordine vero (aggancio azione #21).

---

## 1) Cosa contiene il report (le 3 domande + i dati "solo-MyCity")

Ogni sezione ha la **query esatta** che la calcola (SOLA LETTURA), così il report è
riproducibile a comando e per **ogni** negozio della rete.

### A. «Cosa vendi di più» (mix prodotti + ricavo)
- Top prodotti per **pezzi** e per **€** nel periodo; % sul totale; nuovi prodotti che tirano.
- *Solo-MyCity:* il negoziante in cassa non separa il venduto **online** dal banco — noi sì.
```sql
select p.name,
       sum(oi.quantity)                as pezzi,
       round(sum(oi.quantity*oi.unit_price),2) as ricavo_eur
from order_items oi
join products p on p.id = oi.product_id
join orders o   on o.id = oi.order_id
where o.store_id = :store
  and o.delivery_status = 'DELIVERED'          -- solo ordini davvero conclusi
  and o.created_at >= now() - interval '30 days'
group by p.name order by ricavo_eur desc;
```

### B. «Quando ordinano» (ritmo settimana × ora)
- Mappa **giorno-della-settimana × fascia oraria** degli ordini → dice quando aprire slot,
  quando spingere un post, quando tenere pronto il rider.
- *Solo-MyCity:* il picco della **domanda a domicilio** non coincide col picco in negozio.
```sql
select extract(dow  from o.created_at) as giorno,   -- 0=dom … 6=sab
       extract(hour from o.created_at) as ora,
       count(*) as ordini,
       round(avg(o.total),2) as scontrino_medio
from orders o
where o.store_id = :store
  and o.delivery_status = 'DELIVERED'
  and o.created_at >= now() - interval '90 days'
group by giorno, ora order by ordini desc;
```

### C. «Chi torna» (clienti di ritorno + valore)
- Nuovi vs. **di ritorno**, % riordino, giorni medi tra un ordine e l'altro, top 5 clienti per spesa
  (aggregati/anonimizzati: il negozio vede *quanti* e *quanto*, non i dati personali → GDPR).
- *Solo-MyCity:* il negozio senza scontrino nominale **non sa** chi è già passato. Noi sì.
```sql
select case when cnt = 1 then 'nuovo' else 'di ritorno' end as tipo,
       count(*) as clienti,
       round(sum(speso),2) as ricavo_eur
from (
  select o.buyer_id, count(*) cnt, sum(o.total) speso
  from orders o
  where o.store_id = :store and o.delivery_status = 'DELIVERED'
  group by o.buyer_id
) t group by tipo;
```

### D. Bonus «solo-MyCity» (differenzianti veri)
- **Carrelli abbandonati** sul negozio (domanda persa recuperabile) + valore.
- **Prodotti mai ordinati** (catalogo che non tira → cosa togliere/foto da rifare).
- **Zone/CAP** da cui arrivano gli ordini (dove volantinare / dove il rider rende).

---

## 2) Il poco DATO REALE che esiste già oggi su Pane Quotidiano
(niente inventato — tutto con fonte)

- **Catalogo attivo:** 5 prodotti `status=available` (fonte MCP 6/7 11:11).
- **Unica composizione-carrello reale osservata** (buyer *samir*, snapshot REST 1/7 12:00, stabile 2-4/7):
  1× Pesto Genovese Bio €5,00 · 1× Kefir di latte di capra bio €2,95 · 1× Berchtesgadener Land kefir bio 400g €2,05 → **€10,00**.
  → *segnale debole, non statistica:* la domanda vista finora è **bio/freschi** (pesto + kefir). 1 sola osservazione: NON è un «best-seller».
- **Base clienti:** 23 profili totali, ultimo nuovo 16/6, 0 nuovi negli ultimi 7g.
- **Clienti di ritorno:** **0** (nessun ordine consegnato → nessuno può ancora essere "di ritorno").

> Traduzione onesta per il fornaio: *«Oggi il tuo report direbbe: catalogo di 5 prodotti bio, primo
> interesse su pesto e kefir, ancora 0 vendite concluse. Dal primo ordine vero comincio a dirti cosa
> tira, a che ora e chi torna — dati che dal banco non puoi vedere.»*

---

## 3) Come diventa soldi (le 2 leve)
1. **Retention (gratis, ora):** il report mensile è un **motivo per restare** — il negozio riceve
   qualcosa che nessun'altra piattaforma locale gli dà. Aggancio all'anti-churn di PQ (azione #26).
2. **Monetizzazione (a scala):** a ≥5 negozi, il report base resta gratis e nasce un **tier premium**
   (benchmark anonimo vs. categoria, previsione domanda, alert riassortimento) → ricavo ricorrente
   B2B che non tocca la commissione. Owner: growth-monetizzazione. Gate: ≥5 negozi + transato reale.

---

## 4) Prossimo passo operativo
- **🟢 fatto ora:** stampo + query pronte (questo file) — riusabile per **ogni** negozio.
- **⏳ accodato (#35):** appena PQ chiude il primo ordine vero (#21), genero il **primo report reale**
  e lo consegno al fornaio come tocco di retention (🔴 = comunicazione a negozio reale → firma Nicola).
- **🙋 serve da Nicola:** solo il via a #21 (ordine-prova PQ). Il resto è automatico da qui.

## Colore
🟢 costruire lo stampo e le query (reversibile, sola lettura) · 🔴 consegnare il report al titolare /
attivare il tier a pagamento (comunicazione + soldi verso il mondo reale → firma).
