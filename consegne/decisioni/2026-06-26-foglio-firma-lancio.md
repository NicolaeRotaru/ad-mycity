---
tipo: foglio-firma (decisioni 🔴 di lancio, consolidate)
data: 2026-06-26
fonte: AD digitale
collegato-a: [[AZIONI-IN-ATTESA]] righe 1-2 · DECISIONI.md · consegne/vendite/pitch-garetti.md (Parte C) · consegne/finanza/payout-faro.md
scopo: sbloccare in 2 minuti le 3 decisioni 🔴 che bloccano la prima consegna di sab 27/6
---

# ✍️ Foglio-firma — Lancio Garetti / prima consegna (sab 27/6)

> Nicola, queste 3 decisioni 🔴 sono ferme da 2 giorni e sono **l'unico collo di bottiglia**
> tra noi e la prima consegna di domani. Sono già state preparate complete dai senior: qui sono
> consolidate in **una pagina**. Ti basta scrivere **"ok riga 1 / 2 / 3"** (o "ok a tutte").
> Tutti i numeri vengono dalle fonti citate — **niente è inventato**.

## Le 3 firme (metti ✅ o scrivi "ok N")

### 1) 💶 Termini commerciali a Garetti — commissione **12%**
- **Cosa firmi:** commissione **12%** sul valore ordine · **0€ costi fissi** · **payout a consegna confermata** · **nessun vincolo / nessuna penale d'uscita**.
- **Perché 12%:** proposta di Finanza già nel registro (range vault 10-15%), vs ~25-35% di Glovo. Su 50€ → a Garetti restano **44€** (su Glovo ~33-37€).
- **Fonte:** `consegne/vendite/pitch-garetti.md` Parte C · `DECISIONI.md`.
- **Firma:** [ ] OK al 12% e ai termini  ·  [ ] Voglio cambiare → ___________

### 2) 💳 Modalità payout-test del primo ordine
- **Cosa scegli (una):**
  - [ ] **A — test reale 1€** su Stripe (poi storno: movimento reale = serve tuo ok allo storno).
  - [ ] **B — ambiente test Stripe** (nessun denaro reale, nessuno storno).
  - [ ] **C — variante COD** (contanti alla consegna): il go-live NON dipende da Stripe; IBAN/Stripe Connect si completa entro 48h. ← *ripiego se Garetti non ha l'IBAN domani*.
- **Fonte:** `consegne/finanza/payout-faro.md` (Parte A + variante COD).
- **Firma:** scelgo l'opzione ____  (default consigliato AD: **C COD-first**, è la più a prova di imprevisto per il primo sabato).

### 3) 🔑 Chiave Stripe — **LIVE o sandbox?** (la 🔴 più urgente)
- **Cosa confermi:** la chiave attiva nel sito è **LIVE** (incassa denaro vero) o **sandbox/test**?
- **Perché serve stasera:** se è sandbox, domani **non incassa davvero** → o la passiamo a LIVE oggi, o domani si va in **COD puro** (riga 2 opzione C) e Stripe lo si attiva dopo.
- **Firma:** [ ] È LIVE, confermo  ·  [ ] È sandbox → domani **COD**, Stripe LIVE da sistemare entro: _______

---

## ⚠️ Una conferma operativa che serve a prescindere dalle firme
**Garetti è andato LIVE il 25/6?** C'è un **ordine-test** arrivato al payout?
- [ ] **SÌ** → domani si consegna: la priorità è il meteo + la catena del freddo (vedi vigilia).
- [ ] **NO / non so** → è la **priorità n°1 di stamattina**: senza negozio LIVE non c'è prima consegna.

---

## 🧭 Raccomandazione secca dell'AD
Firma **1 (12%)** e **3 (chiave Stripe)** subito: sono sì/no a costo zero che tolgono ogni ambiguità.
Per la **2**, vai di **COD-first (opzione C)**: domani conta *consegnare e farsi pagare*, non la demo Stripe perfetta — Stripe Connect lo completiamo entro 48h. Così sabato parte **comunque**, anche se l'IBAN o la chiave LIVE non sono pronti in tempo.

> Dopo la tua firma: aggiorno [[DECISIONI]], segno FATTO in [[AZIONI-IN-ATTESA]] (righe 1-2) e
> i senior partono. *Le firme muovono soldi/condizioni reali: restano tue (🔴).*
