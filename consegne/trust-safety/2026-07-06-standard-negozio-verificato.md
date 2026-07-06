---
titolo: Standard «Negozio Verificato MyCity» — criteri di fiducia
autore: trust-safety
data: 2026-07-06 12:40
stato: bozza (🟢) — criteri da approvare come policy ufficiale
fonti_dati: registro-realta.json (2026-07-06 11:11, MCP Supabase LIVE) · codice marketplace/ (VerifiedBadge.tsx)
---

# Standard «Negozio Verificato MyCity»

> **Perché esiste questo documento.** Oggi il badge "Negozio verificato da MyCity"
> (`components/ui/VerifiedBadge.tsx`) è renderizzato **senza alcuna condizione** in 5 punti del sito
> (`StoreListRow.tsx:44`, `StorePreviewCard.tsx:76`, `store-sections/HeroSection.tsx:167`,
> `home/HeroStoreCard.tsx:137` e `:235`). Risultato: il badge appare su **ogni** negozio, **anche
> sulla demo Casa Linda**. La docstring del componente dice «appare quando `profilo.is_approved=true`»,
> ma nell'uso reale quel controllo non c'è. È un badge **decorativo, non guadagnato** → un problema di
> onestà verso il cliente. Questo standard definisce **cosa deve essere vero** perché un negozio possa
> mostrare quel badge. La correzione tecnica del componente è un handoff separato a @frontend-dev/@backend-dev.

---

## 1. Cosa promette il badge al cliente (la frase onesta)

> **«Negozio Verificato MyCity vuol dire che abbiamo controllato che questa è una vera bottega di
> Piacenza — identità reale, contratto firmato — e che il pagamento arriva davvero al negozio, così
> i tuoi soldi sono protetti dalla piattaforma. NON è un giudizio sulla qualità dei prodotti né una
> garanzia sul singolo ordine.»**

Cosa **garantisce** (verificabile):
- L'attività **esiste davvero** ed è quella che dichiara (identità, indirizzo, telefono).
- Ha **superato la moderazione** di MyCity e ha un **contratto venditore firmato**.
- Il **pagamento è protetto**: i soldi transitano dal circuito MyCity/Stripe e arrivano al negozio; in
  caso di problema c'è un interlocutore e una via di rimborso.

Cosa **NON garantisce** (e va detto):
- Non è un voto sulla **qualità** o sul gusto dei prodotti (per quello ci sono recensioni e rating).
- Non promette che **ogni** consegna andrà perfetta (per il singolo ordine c'è supporto/resi/dispute).
- Non è un timbro eterno: è uno **stato** che può decadere (vedi §4).

---

## 2. Criteri di idoneità (checklist — tutti verificabili)

Ogni criterio è marcato **[DATO]** (verificabile da un campo nel DB, sola lettura) oppure **[DOC]**
(verificabile da un documento/registro esterno). Nessun criterio vago.

| # | Criterio | Come si verifica | Tipo |
|---|----------|------------------|------|
| C1 | **Identità reale dell'attività** — l'impresa esiste (ragione sociale / P.IVA o iscrizione impresa reale) | Documento venditore in onboarding (visura/P.IVA) o fonte pubblica ufficiale (Albo, Camera di Commercio) | **[DOC]** |
| C2 | **Indirizzo fisico verificato** — sede reale a Piacenza/zona servita | `profiles.address` popolato e coerente con fonte pubblica; non placeholder | **[DATO]** + [DOC] |
| C3 | **Telefono verificato** — numero reale che risponde | `profiles.phone` popolato + contatto avvenuto (call/WhatsApp di verifica) | **[DATO]** + [DOC] |
| C4 | **Moderazione superata** — approvato da MyCity, non seed/demo | `profiles.is_approved = true` **E** id **non** appartenente ai record seed/demo (es. UUID `1111…`) | **[DATO]** |
| C5 | **Contratto venditore firmato** — accordo commissioni accettato | Contratto venditore firmato agli atti (data + versione %) | **[DOC]** |
| C6 | **Payout configurato e ATTIVO** — i soldi arrivano davvero al negozio | Stripe Connect: `stripe_charges_enabled = true` **E** `stripe_payouts_enabled = true` | **[DATO]** |
| C7 | **Catalogo reale** — prodotti veri, non seed | ≥ **3 prodotti** con `available = true`, non-seed (proposta: soglia 3, vedi nota) | **[DATO]** |
| C8 | **Nessuna frode / segnalazione aperta** — fedina pulita | Nessun caso trust-safety/dispute aperto sul seller; nessuna segnalazione non risolta | **[DATO]** + [DOC] |

> **Nota sulla soglia catalogo (C7 = 3).** È una soglia **sensata e difendibile**: sotto i 3 prodotti
> una vetrina non è realmente acquistabile (rischio "negozio-fantasma" con 1 prodotto civetta). PQ ne ha
> **5 reali `available`** → la supera con margine. La soglia è un parametro di policy: se in futuro serve
> alzarla/abbassarla, si cambia qui, in un solo punto.

---

## 3. Due livelli, in modo onesto

Distinguiamo **cosa è vero** con onestà, invece di un unico timbro generico.

### (a) «Identità Verificata» — livello base
Soddisfa **C1–C5 + C8** (identità reale + moderazione + contratto + fedina pulita).
Significa: *«è una vera bottega, l'abbiamo controllata, ha firmato»*.
**MA** non dice nulla sul fatto che possa **incassare**: un negozio può essere "Identità Verificata"
e avere il payout spento (è esattamente il caso di PQ oggi).

### (b) «Verificato completo» — badge pubblico
Soddisfa **tutti i criteri C1–C8**, quindi aggiunge:
- **C6 payout attivo** (`charges_enabled` + `payouts_enabled = true`) → il cliente che paga è protetto e
  i soldi arrivano davvero al negozio;
- **C7 catalogo reale acquistabile**;
- **primo ordine evaso pulito** (almeno 1 ordine `delivered` senza frode/chargeback) → la macchina di
  vendita **ha girato per davvero** almeno una volta.

### Raccomandazione: il badge pubblico è (b) «Verificato completo»
Motivo di fiducia, non di burocrazia: **mostrare "verificato" a un cliente su un negozio che non può
nemmeno incassare è disonesto.** Se il badge appare e poi il pagamento fallisce (o il negozio non può
evadere), il cliente si sente ingannato dalla piattaforma — ed è il danno peggiore per un marketplace,
perché la sfiducia non colpisce il negozio ma **MyCity**.

Uso consigliato dei due livelli:
- **(b) «Verificato completo» → è IL badge pubblico** mostrato al cliente sul sito.
- **(a) «Identità Verificata» → stato interno / etichetta di percorso** ("ci sei quasi"): utile a noi e
  al negozio per sapere cosa manca, **non** un badge di fiducia pubblico equivalente.

---

## 4. Mantenimento e revoca (il badge è uno stato, non un timbro)

Il badge si **rivaluta in continuo** sui dati. Decade automaticamente se viene meno un criterio:

| Evento | Effetto sul badge | Colore azione |
|--------|-------------------|---------------|
| **Frode / segnalazione aperta** confermata (C8 cade) | Revoca immediata + caso trust-safety | 🔴 (blocco negozio → firma Nicola) |
| **Payout disattivato** (`payouts_enabled` o `charges_enabled` → false) (C6 cade) | Decade da "Verificato completo"; resta al più "Identità Verificata" interno | 🟡 (auto, + avviso al negozio) |
| **Negozio fermo / non evadibile** (nessun ordine evadibile, dashboard non presidiata) | Sospensione del badge finché non torna operativo | 🟡 |
| **Catalogo svuotato** sotto soglia (C7 cade, < 3 prodotti `available`) | Decade da "Verificato completo" | 🟡 (auto, + avviso al negozio) |
| **Moderazione revocata** (`is_approved` → false) (C4 cade) | Revoca | 🟡/🔴 secondo motivo |

Principio: **la verifica è reversibile.** È più onesto togliere il badge a un buon negozio temporaneamente
fermo che lasciarlo a chi non può più mantenere la promessa. Ogni decadenza lascia audit-trail (campo che è
caduto, quando) e — se non è frode — parte da una misura **reversibile e con avviso**, non da un ban.

---

## 5. Applicazione al caso reale OGGI (dati live 2026-07-06 11:11)

### Pane Quotidiano (PQ) — UNICO negozio reale
Valutazione criterio-per-criterio con i dati reali del registro:

| # | Criterio | Esito PQ | Prova |
|---|----------|----------|-------|
| C1 | Identità reale | ✅ | Alimenti bio/dietetici dal 1976, fonte pubblica (Vita in Centro / Pagine Gialle) |
| C2 | Indirizzo fisico | ✅ | Via Calzolai 25, Piacenza (DB + fonte pubblica) |
| C3 | Telefono verificato | ✅ | 0523 388601 (DB `phone`, coerente con fonte pubblica) |
| C4 | Moderazione superata | ✅ | `is_approved = true`, seller id `c0b240c0…` (non seed) |
| C5 | Contratto firmato | ✅ | Contratto venditore 12% firmato (01/07 01:02) |
| C6 | **Payout attivo** | ❌ | `stripe_charges_enabled = false`, `stripe_payouts_enabled = false` (Stripe Connect `acct_1TifANEq35Z9pThc`) |
| C7 | Catalogo reale ≥ 3 | ✅ | 5 prodotti bio reali `available` |
| C8 | Nessuna frode aperta | ✅ | Nessun caso aperto (l'unico ordine #16 è stato **annullato** 3/7 15:38, non è frode) |

**Verdetto onesto su PQ.**
- PQ è **«Identità Verificata»** (livello a): soddisfa C1–C5 + C8. È una vera bottega, controllata, con
  contratto firmato.
- PQ **NON è «Verificato completo»** (badge pubblico): **manca C6 — il payout è spento**. Oggi un cliente
  che ordinasse non avrebbe il pagamento protetto dal circuito → mostrargli "verificato" sarebbe disonesto.
  Manca anche il primo ordine evaso pulito (0 ordini `delivered`: l'unico è annullato).
- **Aggancio operativo:** PQ diventa "Verificato completo" **nello stesso momento** in cui parte il
  **primo ordine-prova pulito + payout-test** (coda #21: attivare Stripe Connect → `charges/payouts_enabled=true`,
  poi un ordine reale consegnato senza frode). È lo stesso passo che sblocca la North Star 0→1. Un solo lavoro
  chiude due buchi: badge onesto **e** primo incasso reale.

### Casa Linda — ESCLUSA
Negozio **demo/seed** (UUID `11111111-1111-1111-1111-cccccccc0001`). Ha `stripe_payouts_enabled=true` ma è
**fittizio** → **C4 fallisce** (è seed) e la verifica **non deve mai** risultare vera su di lei. Oggi il
badge le appare per il bug del componente: è **l'esempio numero uno** del perché serve la condizione.

### Antica Salumeria Garetti — NON APPLICABILE
**Prospect `scelta_ragionata`**, non firmato, non nel DB. Nessun criterio è verificabile (non c'è record).
Cancello AR-006: nessun badge, nessun asset intestato. Diventa valutabile solo se/quando entra nel DB firmato.

> **Regola trasversale:** il badge si concede **solo** su negozi `confermato` che passano tutti i criteri
> sui dati reali. Niente badge inventati su demo o prospect.

---

## 6. Handoff tecnico (fuori dal mio mandato — sola lettura)

La correzione del componente è di @frontend-dev + @backend-dev, non mia. Nota per loro:
`VerifiedBadge` va **condizionato** a una regola derivata da questo standard (idealmente un campo/flag
calcolato `verified_full` = C1..C8 veri, oppure almeno il controllo minimo `is_approved && !is_seed &&
stripe_payouts_enabled && stripe_charges_enabled`), e rimosso dalla demo. Finché il badge è incondizionato,
questo standard è la policy ma **il sito non la rispetta** → è il bloccante di onestà da chiudere per primo.

**Colore di questo documento:** 🟢 (bozza di standard). Adottarlo come **policy ufficiale** e attivare il
badge condizionato sul sito = 🟡/🔴 (tocca il codice live e la promessa al cliente) → firma Nicola.
