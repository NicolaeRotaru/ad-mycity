---
tipo: playbook-referral-refresh
reparto: crm-lifecycle + trust-safety
data: 2026-07-20 11:36
fonte: marketplace/ (mig.015/029/089/092, sign-up, referral page) · STATO 20/7 11:00 · intelligence Glovo 20/7
stato: PRONTO — loop in codice, messaggi pronti, NESSUN INVIO (gate non passati)
voce: Vicino Orgoglioso · piattaforma «Il Turno»
faro: Pane Quotidiano (unico negozio confermato)
---

# Referral «Porta un amico» — refresh 20/7/2026

> **In una riga:** il give-get **5€+5€ è già nel sito** con anti-frode base. Oggi **non parte** perché
> North Star = 0 (nessun ordine consegnato). Quando il primo ordine PQ è consegnato e il cliente è contento,
> basta la tua firma 🔴 su A17 + un WhatsApp/email a samir.

---

## 1. Verifica codice (20/7 — non inventato)

| Pezzo | Dove | Stato |
|---|---|---|
| Codice invito | `profiles.referral_code` (mig.015) | ✅ ogni profilo |
| Tabella tracking | `public.referrals` — `reward_amount` default **€5** | ✅ |
| **Get** (premio invitante) | `reward_referrer_on_delivery()` (mig.089) — wallet + notifica solo su **DELIVERED** | ✅ |
| **Give** (sconto invitato) | `handle_new_profile_welcome_bonus()` (mig.029) — 100 pt = **€5** primo ordine ≥€10 | ✅ |
| No self-referral | CHECK + RLS (mig.092) + guardia `sign-up/page.tsx:82` | ✅ |
| Pagina invito | `/profile/referral` — codice, link, WhatsApp, stats, leaderboard | ✅ live |
| E2E test | `tests/e2e/02-signup-flow.spec.ts` — referral da URL | ✅ in suite |

**Conseguenza:** non serve costruire il loop — serve **accenderlo** al momento giusto.

---

## 2. Economia onesta (fonte: playbook 6/7 + codice)

| Voce | Valore | Nota |
|---|---|---|
| Messaggio pubblico | 5€ a te + 5€ al tuo amico | Give-get chiaro |
| Costo **incrementale** MyCity | **≈ €5** per nuovo cliente che **riceve** un ordine | I 5€ all'invitato = welcome standard (mig.029), non extra |
| CAC referral vs ads | Non confrontabile oggi (0 conversioni) | Dopo primo giro reale |
| Cap mensile proposto | **250€/mese** (≈25 conversioni a €5 give) | 🔴 firma Nicola — non attivo finché non firmi |

**vs Glovo Piacenza (20/7):** referral **16€** (4×4€) + sconti catena **-25% / -40%** su poke/pizza.
MyCity resta su **bottega locale** — premio più piccolo ma **onesto** e pagato solo a ordine consegnato,
senza bruciare margine negozio.

Fonte concorrente: `consegne/intelligence/2026-07-20-perlustrazione-settimana.md` · Glovo categoria cibo PI.

---

## 3. Anti-frode

### Già in produzione ✅

- No self-referral (DB + signup)
- Premio solo su ordine **CONSEGNATO** (no crea-annulla)
- Un premio per invitato (`UNIQUE referred_id`, flag `rewarded`)
- Welcome invitato solo su carrello **≥ €10**

### Da aggiungere prima di scalare (🟡 branch — non blocca il primo invito)

1. Tetto **5 invitati confermati / 7 giorni** per invitante → flag manuale
2. Stesso telefono/indirizzo invitante↔invitato → review (coinquilini reali esistono)
3. Soglia minima sul premio invitante (oggi scatta su qualsiasi primo ordine)
4. **Clawback** se ordine invitato rimborsato dopo premio (nota mig.092)

Owner proposte: @backend-dev + @trust-safety · @fraud-risk peer review.

---

## 4. Gate di accensione (tutti veri prima del primo invito)

| # | Condizione | Stato 20/7 11:00 |
|---|---|---|
| G1 | **≥1 ordine reale CONSEGNATO** (ordine-prova PQ, non #16 annullato) | ❌ 0 consegnati |
| G2 | Cliente **contento** (A13 feedback 👍) | ❌ dipende da G1 |
| G3 | **Firma Nicola** su incentivo €5+5€ + cap 250€/mese | ❌ 🔴 A17 |
| G4 | Canale invio: WhatsApp manuale **oppure** Resend acceso | ⚠️ Resend OFF — WhatsApp ok a mano |
| G5 | Faro testi = **Pane Quotidiano** (non Garetti/demo) | ✅ |

**Sequenza consigliata (dopo G1+G2):**
1. A13 feedback → A14 recensione (se 👍)
2. A26 recupero carrello samir (2° acquisto)
3. **Poi** A17 referral — stesso cliente, non fatigue: 1 messaggio «porta un vicino» a distanza ≥7g dal carrello

> ⚠️ **Nota storica:** Nicola rimandò il referral il 9/7 («dopo primo negozio»). Pane Quotidiano è **live dal 1/7** —
> il blocco reale oggi è **G1** (zero consegne), non l'assenza negozi.

---

## 5. Messaggi pronti (voce Vicino Orgoglioso)

### 5.1 — WhatsApp a samir (invitante) · 🔴

> Ciao [Nome], com'è andata la consegna da **Pane Quotidiano**? Se ti è piaciuto, una cosa semplice:
> **dillo a un vicino.**
>
> Quando qualcuno si iscrive col tuo link e riceve il primo ordine, **5€ vanno a lui e 5€ a te** —
> automatici nel wallet.
>
> Il tuo link (WhatsApp o di persona):
> 👉 https://mycity-marketplace.com/sign-up?ref=**[CODICE-SAMIR]**
>
> Ogni vicino che ordina è una bottega del centro che incassa. 🧡
> Nicola — MyCity

**Prima dell'invio:** recuperare `referral_code` di samir da `/admin/users` o DB `profiles`.

### 5.2 — Email invitante (se Resend acceso) · 🔴

**Oggetto:** Porta un vicino da Pane Quotidiano — 5€ a te, 5€ a lui 🧡

Corpo: identico a §5.1 + footer unsubscribe.

### 5.3 — Cosa vede l'invitato (automatico)

- Welcome **€5** al signup (mig.029) — messaggio landing/signup
- Copy condividi già in pagina `/profile/referral` (allineato Turno/Piacenza)

### 5.4 — Micro-copy WhatsApp condividi (in-app)

> Iscriviti a MyCity Piacenza — le botteghe del centro a casa tua. Codice **[CODICE]**: **entrambi 5€**
> sul primo ordine. 👉 [LINK]

---

## 6. Automazione futura (non blocca lancio)

- Workflow n8n **#9** «Referral traccia codice» — stub in `consegne/automazioni/n8n/workflows/09-02-acquisizione-04-referral-traccia-codice.json` (🟡: Telegram + Sheets dopo signup con ref)
- Evento analytics `referral_sent` già in `marketplace/lib/analytics/events.ts`

---

## 7. Cosa accodare / cosa serve da Nicola

| Cosa | Dove | Colore |
|---|---|---|
| Firma incentivo + cap mensile + primo invito | [[AZIONI-PRONTE]] **A17** · card **#referral-porta-un-amico** | 🔴 |
| Anti-frode scala (tetti, clawback) | Proposta branch futuro | 🟡 |
| Invio effettivo | **Dopo** G1+G2+firma — mai prima | 🔴 |

**3 mosse per Nicola oggi (ordine):**
1. 🔴 **PI26** ore 10:00 (priorità assoluta — già in coda)
2. 🟡 **Ordine test PQ** → sblocca G1
3. 🔴 **Firma A17** quando G1+G2 veri — il referral è pronto, non aspetta altro codice

---

## 8. Peer review richiesta (prima dello scale-up)

- @finanza — cap 250€/mese vs margine per ordine (quando avremo 1 ordine reale)
- @trust-safety — checklist §3.2
- @legale-privacy — footer marketing inviti email
