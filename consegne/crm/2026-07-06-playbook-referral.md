---
tipo: playbook-referral
reparto: crm-lifecycle
data: 2026-07-06 14:32
fonte: codice marketplace (migrations 015/029/089/092 + `app/sign-up/page.tsx` + `app/profile/referral/`) · baseline REST STATO 2026-07-04 11:30 (business invariato dal 24/6) · FLUSSI-LIFECYCLE §5
stato: DRY-RUN — playbook pronto, NESSUN INVIO, incentivo 🔴 in attesa firma
voce: Vicino Orgoglioso (FLUSSI-LIFECYCLE §6)
faro: Pane Quotidiano (unico negozio reale — AR-006)
---

# 🧡 Playbook Referral "Porta un amico" — give-get €5+€5

> **In una riga:** il loop referral **è già costruito nel sito**, anti-frode compreso. Non c'è da
> inventarlo — c'è da **accenderlo al momento giusto** (dopo la prima consegna reale) e con la tua firma
> sull'incentivo. Questo file prepara messaggi, regole e sequenza, pronti a partire.

---

## 1. Cosa esiste GIÀ nel codice (verificato, con fonte)

| Pezzo | Dove (fonte) | Cosa fa |
|---|---|---|
| Codice invito personale | `profiles.referral_code` (mig. 015, riga 104-113) — 8 caratteri, univoco, generato per **ogni** profilo | Ogni utente ha già il suo codice + link `…/sign-up?ref=CODICE` |
| Tabella referral | `public.referrals` (mig. 015) — `referrer_id`, `referred_id`, `reward_amount` **default €5**, `rewarded`, `status` | Traccia chi ha invitato chi e se il premio è stato pagato |
| **Get** (premio a chi invita) | trigger `reward_referrer_on_delivery()` (mig. **089**) | Quando il **primo ordine dell'invitato è CONSEGNATO**, accredita **€5 nel wallet** dell'invitante + notifica in-app. Idempotente (un premio per amico) |
| **Give** (sconto all'invitato) | `handle_new_profile_welcome_bonus()` (mig. **029**) | Ogni **nuovo iscritto** riceve 100 pt = **€5 di sconto** sul primo ordine ≥ €10 (si applica da solo al checkout) |
| Pagina "Invita amici" | `app/profile/referral/page.tsx` | Mostra codice, link, pulsanti condividi (WhatsApp/copia), contatore invitati/confermati/guadagnati |
| Leaderboard + badge | `app/profile/referral/leaderboard/page.tsx` + achievement `referrer_3` "Ambasciatore" (mig. 030) | Gamification: chi invita di più sale in classifica |
| Aggancio all'iscrizione | `app/sign-up/page.tsx:60-85` | Chi arriva con `?ref=CODICE` viene legato all'invitante in `referrals` |

> ✅ **Conseguenza pratica:** il loop give-get **5€+5€** è tecnicamente operativo. Serve solo la firma
> sull'incentivo, le "mani" per spedire gli inviti (Resend, oggi spenta) e — soprattutto — **un cliente
> che abbia già ricevuto un ordine** da mostrare come invitante.

---

## 2. L'economia onesta (nessun numero orfano)

Il messaggio pubblico è "**5€ a te, 5€ al tuo amico**". Ma sotto il cofano:

- I **5€ all'invitato** = il **welcome bonus standard** che riceve *chiunque* si iscriva (mig. 029). Non è
  un costo *aggiuntivo* del referral: quella persona li avrebbe avuti comunque iscrivendosi.
- I **5€ all'invitante** = l'unico costo **incrementale** del programma, e viene pagato **solo quando
  l'amico riceve davvero il suo primo ordine consegnato** (mig. 089).

➡️ **CAC reale di un referral ≈ €5 per cliente nuovo che ha completato un ordine vero.** Più economico e
più "caldo" di un click pagato: arriva con la raccomandazione di un vicino. **Da confrontare** con il
margine per ordine quando avremo dati veri (oggi 1 solo ordine, non ancora consegnato → nessun margine
misurato: fonte STATO 2026-07-04 11:30).

> ⚠️ Numeri di volume/conversione del referral: **non stimabili oggi** (0 ordini consegnati, 4 buyer reali,
> 0 nuovi negli ultimi 7g — STATO). Non invento tassi. Si misurano dopo il primo giro reale.

---

## 3. Anti-frode

### 3.1 Già in codice (verificato)
| Difesa | Fonte | Blocca |
|---|---|---|
| **No self-referral** | CHECK `referrer_id <> referred_id` + RLS (mig. **092**) | Auto-invitarsi per prendersi il premio da soli |
| **Premio solo su CONSEGNATO** | trigger su `delivery_status='DELIVERED'` (mig. 089) | L'abuso "crea ordine → prendi premio → annulla" |
| **Un premio per invitato** | `UNIQUE (referred_id)` + flag `rewarded` idempotente (mig. 015/089) | Doppi accrediti sullo stesso amico |
| **Guardia all'iscrizione** | `referrerId !== data.user.id` (`sign-up/page.tsx:82`) | Legarsi a sé stessi in fase di registrazione |
| **Welcome solo ≥ €10** | mig. 029 | Micro-ordini creati solo per bruciare il credito |

### 3.2 Da AGGIUNGERE prima di scalare (proposte 🟡 — @backend-dev + @trust-safety)
Reggono con volumi bassi; diventano necessarie quando gli inviti crescono:
1. **Tetto velocità:** > 5 invitati *confermati* per invitante in 7 giorni → flag a @trust-safety (rivedi a mano prima di pagare). Oggi a mano; a volume, regola in `referrals`.
2. **Stesso indirizzo/telefono** invitante↔invitato → flag (rete di account "amici" fittizi che si consegnano a vicenda).
3. **Soglia minima anche sul premio invitante:** oggi il premio scatta su *qualsiasi* primo ordine consegnato; aggiungere un minimo carrello (es. ≥ €10, come il welcome) per evitare l'ordine-civetta da €2.
4. **Clawback** se l'ordine dell'invitato viene rimborsato/contestato dopo il premio (oggi il premio resta): nota già presente in mig. 092 come "fuori ambito".

> Colore: le difese 1-4 sono modifiche di codice reversibili in branch → **🟡 firma**, non toccano soldi
> finché non pubblicate.

---

## 4. Quando si accende (sequenza reale — cancello di allocazione AR-006)

Il referral ha bisogno di **un invitante credibile**: qualcuno che ha già ricevuto un ordine e ne è
contento. Oggi (STATO 2026-07-04): **0 ordini consegnati**, North Star ancora 0.

**Sequenza corretta, agganciata alla coda esistente:**
1. **#16 consegnato** (ordine zombie €19,05, Pane Quotidiano) → samir diventa il **primo cliente reale con
   un ordine ricevuto**. → North Star 0→1.
2. **A13/A14 (#27)** feedback + recensione → confermiamo che è **contento** (trigger del referral: cliente
   soddisfatto, FLUSSI §5).
3. **#26** riaggancio carrello samir → 2° acquisto.
4. **SOLO ALLORA** → invito referral a samir (§5.1 sotto): è l'**unico** sender legittimo oggi.

> 🎯 **Faro = Pane Quotidiano.** I messaggi qui sotto parlano di Pane Quotidiano (unico negozio reale,
> contratto firmato 1/7), **non** di Garetti (prospect non firmato) né Casa Linda (demo). Se/quando entrano
> nuovi negozi, il testo si adatta cambiando il nome bottega.

**Gate di lancio (tutti veri prima di spedire un invito):**
- [ ] #16 consegnato (≥1 ordine reale ricevuto)
- [ ] Cliente confermato contento (A13 👍)
- [ ] "Mani" email accese (`RESEND_API_KEY` → @builder-automazioni) — oggi spente
- [ ] Firma di Nicola sull'incentivo €5+€5 (🔴, questo file)

---

## 5. I messaggi (pronti, voce Vicino Orgoglioso)

### 5.1 — Invito a CHI INVITA (l'invitante) · email/WhatsApp
**Oggetto:** Porta un vicino da Pane Quotidiano — 5€ a te, 5€ a lui 🧡
**Preheader:** Il tuo codice personale. Più vicini ordinano, più la bottega resta aperta.

> Ciao [Nome],
>
> ti è arrivato il pane e i prodotti di **Pane Quotidiano**? Fai una cosa bella: **dillo a un vicino.**
>
> Funziona semplice: quando una persona che inviti fa il suo primo ordine e lo riceve, **5€ vanno a lui
> e 5€ vanno a te** — accreditati in automatico.
>
> Ecco il tuo link personale da girare su WhatsApp o di persona:
> 👉 [LINK-INVITO — mycity…/sign-up?ref=TUO-CODICE]
>
> Ogni vicino che ordina è una bottega del centro che incassa. Non è solo uno sconto: è Piacenza che si
> tiene su a vicenda. 🧡
>
> Grazie,
> Nicola — MyCity

*Footer:* MyCity, Piacenza · [Disiscriviti]

---

### 5.2 — Messaggio che riceve L'INVITATO
**Oggetto:** [Nome] ti regala 5€ sulla spesa delle botteghe di Piacenza 🧡
**Preheader:** La tua bottega di fiducia, consegnata a casa. Inizi con 5€ di benvenuto.

> Ciao,
>
> **[Nome] ti ha invitato** su MyCity — e con il suo invito hai **5€ sul tuo primo ordine.**
>
> MyCity ti riporta a casa le vere botteghe del centro di Piacenza. Si parte da **Pane Quotidiano**: pane
> fresco e prodotti bio, ordinati dal telefono e portati a mano. Paghi anche alla consegna, se preferisci.
>
> 👉 [Usa i tuoi 5€ — iscriviti e ordina]
>
> Le botteghe del centro stanno sparendo. Con un ordine, le tieni aperte.
> Benvenuto tra i vicini,
> Nicola — MyCity

*Footer:* MyCity, Piacenza · Hai ricevuto questo invito da un amico · [Non voglio inviti]

---

### 5.3 — Micro-copy in-app / WhatsApp (condivisione veloce)
> Iscriviti a MyCity Piacenza, le botteghe del centro consegnate a casa. Usa il mio codice **[CODICE]**:
> abbiamo **entrambi 5€** di sconto. 👉 [LINK]

*(già presente in `app/profile/referral/page.tsx:55` — qui allineata al faro Pane Quotidiano)*

---

## 6. Consegna / colore
- 🟢 **Fatto ora:** questo playbook + messaggi + regole anti-frode verificate → in `consegne/crm/`.
- 🟡 **Proposte codice** (anti-frode §3.2) → branch, firma.
- 🔴 **Da firmare (incentivo € reale):** accendere il programma e spedire il primo invito → accodato in
  [[AZIONI-IN-ATTESA]] #36 + testo in [[AZIONI-PRONTE]] A15. Parte **solo** quando i gate §4 sono veri.

**Cosa serve da Nicola:** ① firma sull'incentivo €5+€5 · ② accendere Resend (mani email) · ③ ok a far
partire dopo che #16 è consegnato e samir è contento.
