# Smoke test post-deploy #19 — ruoli acquisto

**Data:** 2026-07-02 08:40  
**Deploy:** PR #211 merged → `main` `f84fc70` · Render auto-deploy (~2–5 min)  
**Fonte:** Nicola approva **`ok merge fix ruoli-acquisto`** (Pannello)

## Checklist (@qa — eseguire appena Render verde)

### 1. Admin — zero acquisti
- [ ] Login account assistenza/admin
- [ ] Apri scheda prodotto → pulsante «Aggiungi» disabilitato o toast blocco
- [ ] Navbar: nessun carrello visibile
- [ ] (Opz.) DevTools POST `/api/stripe/checkout` o `/api/orders/cod` → **403**

### 2. Seller — solo opt-in marketplace
- [ ] Login seller → digita `/` o URL prodotto diretto → **redirect `/seller/dashboard`**
- [ ] Dashboard seller → clic «Vai al marketplace» → catalogo con banner «Modalità acquisto»
- [ ] Carrello visibile in modalità acquisto
- [ ] «Torna al negozio» → torna dashboard, cookie modalità cancellato
- [ ] Dopo uscita: `/` → di nuovo redirect dashboard

### 3. Buyer — invariato
- [ ] Login buyer (o guest) → catalogo, carrello, checkout OK
- [ ] Fee consegna €3 visibile (Sprint 1)

## Esito
| Test | Esito | Note |
|------|-------|------|
| Admin blocco | ⏳ | post-Render |
| Seller redirect | ⏳ | post-Render |
| Buyer OK | ⏳ | post-Render |

**Se tutto verde:** segnala @crm-lifecycle → recovery samir (unico carrello buyer reale).
