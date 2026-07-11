---
tipo: template-email
playbook: recensioni
stato: pronto
canale: Resend
trigger: delivery_status = 'delivered'
creato: 2026-07-11 15:45
---

# Template email post-consegna — richiesta recensione

## Quando si invia
Automaticamente quando `orders.delivery_status` passa a `'delivered'`.
Attendi **15–30 minuti** dopo la consegna (il cliente sistema la spesa, poi legge il telefono).

## Dati variabili da iniettare
- `{{NOME_CLIENTE}}` — `profiles.full_name` (o "Ciao" se null)
- `{{NOME_NEGOZIO}}` — `profiles.store_name` (del seller)
- `{{SLUG_NEGOZIO}}` — `profiles.slug` (o `id` del seller come fallback)
- `{{LINK_RECENSIONE}}` — `https://mycity.it/negozio/{{SLUG_NEGOZIO}}#recensioni`

---

## Testo email

**From:** MyCity `<no-reply@mycity_marketplace.com>`  
**Oggetto:** Com'è andata la consegna da {{NOME_NEGOZIO}}? 🙏

---

Ciao {{NOME_CLIENTE}},

il tuo ordine da **{{NOME_NEGOZIO}}** è arrivato — speriamo tutto bene!

Se hai un minuto, lascia una recensione. Aiuta il negozio a farsi conoscere dai piacentini — e noi a sapere che tutto è filato liscio.

👉 [Lascia la tua recensione]({{LINK_RECENSIONE}})

Grazie per aver scelto MyCity.

— Il team di MyCity

---
*La spesa che tiene viva la città.*

---

## Note di tono
- **Non marketing**: è un ringraziamento, non una promo.
- **Locale**: "piacentini", "negozio" (non "store"), tono diretto.
- **Breve**: massimo 5 righe di corpo — chi ha appena ricevuto la spesa non legge un saggio.
- **Mai inviare**: se l'ordine è CANCELED, se il cliente è l'AD stesso/test, se l'email manca.

## Canale tecnico
Resend via `RESEND_API_KEY` (già configurato nel .env).
L'automazione va costruita in **n8n** o come **webhook Supabase** su cambio `delivery_status`.
Owner tecnico: **builder-automazioni** (vedi `cervello/azioni.md`).

## Metriche da tracciare (quando attivo)
- **Tasso apertura** (target > 50% — è transazionale, alta rilevanza)
- **Click su link recensione** (target > 20%)
- **Recensioni effettivamente lasciate** (target > 10% degli ordini consegnati)
