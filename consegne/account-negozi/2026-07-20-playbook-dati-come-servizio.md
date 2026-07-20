---
tipo: playbook-dati-come-servizio
data: 2026-07-20 11:22
autore: AD digitale · @account-negozi + @analista
reparto: account-negozi
playbook: dati-come-servizio
fonte_dati: Supabase REST live (`verifica-sensori.mjs` exit 0, 20/7 11:21)
colore: 🟢 (stampo + mini-report onesto) · 🔴 (consegna al titolare = firma Nicola)
faro: Pane Quotidiano (`c0b240c0-2a86-4218-9d0f-5154f08ff929`)
---

# 📊 Dati-come-servizio — refresh 20/7/2026 11:22

## Verdetto in una riga

**Il report mensile per il fornaio è pronto come stampo + anteprima onesta pre-revenue** — oggi **0 ordini consegnati**, quindi niente best-seller né orari di punta calcolabili; c’è però **1 segnale reale debole** (carrello samir: pesto + kefir bio, €10) e **1 prodotto mai guardato** (pudding). **Consegna al titolare 🔴 resta gated su `#ordine-test-pq`** — prima non c’è transato da mostrare.

---

## Dati live (REST Supabase, 20/7 11:21)

| Metrica | Valore | Fonte |
|---|---|---|
| Negozi attivi approvati | **1** (Pane Quotidiano) | `profiles?approval_status=approved` |
| Prodotti PQ disponibili | **5** | `products?seller_id=…&status=available` |
| Ordini totali PQ | **1** | `orders?seller_id=…` |
| Ordini **DELIVERED** | **0** | `delivery_status=DELIVERED` |
| Unico ordine storico | €19,05 COD, 24/6 → **CANCELED** 3/7 | non è vendita |
| Buyer registrati (rete) | **4** | `profiles?role=buyer` |
| Profili totali | **23** | `profiles` |
| Carrelli abbandonati (tutti) | **4** | `abandoned_carts?recovered=false` |
| Carrelli PQ **buyer reale** | **1** (samir, €10) | unico `role=buyer` non-seed |

> Fonte: `node cervello/verifica-sensori.mjs` → supabase_rest=ok · query REST diretta 20/7 11:21.

---

## Mini-report Pane Quotidiano — edizione pre-revenue (onesto)

> **Periodo:** 15/6/2026 (go-live vetrina) → 20/7/2026  
> **Generato da:** MyCity — dati marketplace (sola lettura)  
> **Nota al titolare:** *Questo è l’anteprima del servizio. Le sezioni «venduto» e «orari» si riempiono automaticamente dal primo ordine consegnato.*

### 1. Cosa tira online (venduto)

| Prodotto | Pezzi | Ricavo € | Nota |
|---|---:|---:|---|
| — | — | — | **Nessun ordine consegnato** → non calcolabile |

**Segnale debole (domanda non conclusa, NON è best-seller):**

| Fonte | Composizione | Valore |
|---|---|---|
| 1 carrello buyer reale (samir, 16/6) | Pesto Genovese Bio + 2 kefir bio | **€10,00** |

→ Interpretazione cauta: interesse su **bio/freschi** (pesto + kefir). **1 sola osservazione** — non promettere volumi.

### 2. Quando ordinano (ritmo settimana × ora)

| Giorno × fascia | Ordini | Scontrino medio |
|---|---:|---:|
| — | **0** | — |

→ Si popola dal primo ordine **DELIVERED**.

### 3. Chi torna (clienti di ritorno)

| Tipo | Clienti | Ricavo € |
|---|---:|---:|
| Nuovi (1° ordine) | **0** consegnati | €0 |
| Di ritorno (≥2 ordini) | **0** | €0 |

→ Per definizione: servono ≥2 ordini consegnati per persona.

### 4. Bonus «solo MyCity» (già oggi)

**Domanda persa recuperabile (carrelli abbandonati su PQ):**

| Cliente | Totale | Fermo da | Prodotti PQ nel carrello |
|---|---:|---|---|
| samir (buyer reale) | €10,00 | ~34 gg (16/6) | Pesto + 2 kefir |
| *(altri 3 record = admin/demo/seller-test — esclusi)* | — | — | — |

**Valore domanda persa PQ (buyer reale):** **€10,00** (+ consegna).

**Prodotti nel catalogo mai messi in carrello** (su 5 attivi oggi):

- Pudding alla vaniglia bio (€2,05) — *possibile buco foto/descrizione o posizionamento*

**Prodotti con almeno 1 segnale di interesse** (carrelli, esclusi test):

- Pesto Genovese Bio — compare in **2** carrelli osservati
- Kefir di latte di capra biologico — **2** carrelli
- Berchtesgadener Land kefir bio 400g — **1** carrello (samir)
- Hummus di ceci senza aglio — **1** carrello (admin test, peso basso)

**Zone/CAP:** non calcolabile (0 consegne completate).

---

## Testo per il fornaio (da usare DOPO il primo ordine reale · 🔴)

> *Oggi NON inviare — gate `#ordine-test-pq`. Quando c’è almeno 1 ordine consegnato, adatta e manda.*

**Oggetto (email/WhatsApp):** Il tuo report MyCity — cosa vendi online a Piacenza

**Corpo (2 min di lettura):**

> Ciao [nome],
>
> ogni mese MyCity ti manda un riassunto che **dal banco non puoi vedere**: cosa hanno comprato online, a che ora ordinano a domicilio, chi torna.
>
> **Questo mese ([mese]):**
> - **Più richiesto:** [TOP PRODOTTO] — [N] pezzi, €[X]
> - **Fascia calda:** [GIORNO] verso le [ORA] (utile per tenere pronto il rider / postare sui social)
> - **Clienti di ritorno:** [N] su [TOT] ([%]%)
> - **Domanda non conclusa:** €[Y] in carrelli abbandonati — possiamo recuperarla con un promemoria (se vuoi)
>
> Il catalogo ha [5] prodotti attivi. [Se pudding ancora zero: «Il pudding non ha ancora attirato click — vale la pena una foto migliore?»]
>
> Prossimo report: [data +30g]. Se vuoi approfondire una categoria, dimmelo.
>
> Nicola — MyCity

---

## Query riusabili (schema live corretto)

> Lo stampo del 6/7 usava `store_id` / `total` — lo schema reale usa **`seller_id`** e **`total_price`**.

### A. Top prodotti (ordini consegnati)

```sql
select p.name,
       sum(oi.quantity) as pezzi,
       round(sum(oi.quantity * oi.unit_price), 2) as ricavo_eur
from order_items oi
join products p on p.id = oi.product_id
join orders o on o.id = oi.order_id
where o.seller_id = :seller_id
  and o.delivery_status = 'DELIVERED'
  and o.created_at >= now() - interval '30 days'
group by p.name
order by ricavo_eur desc;
```

### B. Quando ordinano

```sql
select extract(dow from o.created_at) as giorno,
       extract(hour from o.created_at) as ora,
       count(*) as ordini,
       round(avg(o.total_price), 2) as scontrino_medio
from orders o
where o.seller_id = :seller_id
  and o.delivery_status = 'DELIVERED'
  and o.created_at >= now() - interval '90 days'
group by giorno, ora
order by ordini desc;
```

### C. Clienti di ritorno (aggregati, GDPR-safe)

```sql
select case when cnt = 1 then 'nuovo' else 'di ritorno' end as tipo,
       count(*) as clienti,
       round(sum(speso), 2) as ricavo_eur
from (
  select o.user_id, count(*) cnt, sum(o.total_price) speso
  from orders o
  where o.seller_id = :seller_id
    and o.delivery_status = 'DELIVERED'
  group by o.user_id
) t
group by tipo;
```

### D. Carrelli abbandonati (domanda persa)

```sql
select ac.user_id, ac.cart_total, ac.last_activity, ac.cart_data
from abandoned_carts ac
where ac.recovered = false
  and exists (
    select 1 from jsonb_array_elements(ac.cart_data::jsonb) item
    where item->>'sellerId' = :seller_id
  );
```

---

## Prossimi passi

| # | Cosa | Colore | Quando |
|---|---|---|---|
| 1 | Stampo + mini-report pre-revenue | 🟢 | **fatto** (questo file) |
| 2 | Primo ordine reale PQ | 🟡/🔴 | `#ordine-test-pq` |
| 3 | Rigenera report con transato + consegna al fornaio | 🔴 | subito dopo ordine **DELIVERED** |
| 4 | Report mensile automatico | 🟡 | cron post-North-Star (builder-automazioni) |
| 5 | Tier premium a pagamento (benchmark categoria) | 🔴 | ≥5 negozi + transato (owner @growth-monetizzazione) |

**Coda:** [[AZIONI-IN-ATTESA]] **#50** · anteprima operativa **A34** in [[AZIONI-PRONTE]]

---

## Colore

🟢 costruire/aggiornare stampo e query (reversibile, sola lettura) · 🔴 consegnare il report al titolare o attivare tier a pagamento (comunicazione + valore percepito verso negozio reale → firma Nicola).
