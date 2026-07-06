---
tipo: playbook-standard
titolo: "Bollino «Negozio Verificato MyCity» — lo standard di fiducia della città"
reparto: trust-safety (owner) · con legale-privacy (claim) + content-social (comunicazione)
data: 2026-07-06 15:10
stato: STANDARD DEFINITO (🟢) · assegnazione + annuncio ACCODATI (🔴, condizionati ai dati reali)
fonte_dati: registro-realta.json (2026-07-04) · STATO.md (2026-07-04) · Supabase marketplace (REST, sola lettura)
---

# 🛡️ Bollino «Negozio Verificato MyCity»

> Perché esiste. MyCity è Amazon (catalogo+fiducia) × eBay (venditori+reputazione) × Glovo (consegna locale).
> La **fiducia** è il nostro fossato contro Glovo: loro consegnano da 3 supermercati anonimi, noi mettiamo la
> faccia delle botteghe. Un cliente compra online da uno sconosciuto **solo se qualcuno garantisce**. Il bollino
> «Negozio Verificato» è quella garanzia: dice al cliente *«questo negozio è reale, paga sicuro, consegna davvero
> e rispetta le regole — ci mettiamo la faccia noi»*. È lo **standard di qualità cittadino** con cui entra ogni
> nuovo negozio dell'ondata dal 13/7.

---

## 1) I 5 criteri di fiducia (tutti VERIFICABILI nei dati — zero opinioni)
Un negozio è **Verificato** solo se soddisfa **TUTTI e 5** i pilastri. Ognuno ha una prova misurabile: niente
badge "a sensazione".

| # | Pilastro | Cosa garantisce al cliente | Prova (dove si verifica) |
|---|---|---|---|
| 1 | **Identità reale** | È un negozio vero di Piacenza, non un profilo fantasma | P.IVA + sede fisica a Piacenza · titolare identificato via **KYC Stripe Connect** completato (`profiles` + account Stripe) |
| 2 | **Bottega attiva e approvata** | La vetrina è vera e piena, non uno scaffale vuoto | `is_approved=true` · catalogo con **≥5 prodotti `available`**, prezzi e foto reali (no segnaposto) |
| 3 | **Pagamenti sicuri** | Paghi protetto e il negozio incassa tracciato | Stripe **`charges_enabled=true` + `stripe_payouts_enabled=true`** |
| 4 | **Consegna provata** | Non è teoria: ha già consegnato davvero | **≥1 ordine consegnato** con esito ok · **0 dispute aperte** · 0 chargeback persi |
| 5 | **Regole rispettate** | Gioca pulito: dati veri, cliente tutelato | Contratto venditore firmato · consenso GDPR · **nessuna segnalazione @trust-safety aperta** (foto/prezzi onesti, no frodi) |

**Owner del giudizio:** @trust-safety (verifica venditore). **Validità dei claim pubblici:** @legale-privacy
(un bollino "Verificato" è una dichiarazione con peso legale → deve essere veritiera e non ingannevole).

## 2) Mantenimento e revoca (il badge si può PERDERE — così vale qualcosa)
- **Si mantiene** finché: tasso dispute < 2% ordini · nessuna segnalazione confermata · catalogo aggiornato (no prodotti fantasma) · risposta ai clienti entro 24h.
- **Sospensione automatica** su: disputa/chargeback perso, segnalazione frode credibile, payout disattivato, catalogo svuotato.
- **Revoca** dopo istruttoria @trust-safety (con diritto di replica del negozio). Il badge sparisce dalla vetrina finché non si ripristinano i pilastri.
- **Audit periodico:** ricontrollo dei 5 pilastri a ogni giro di supervisione negozi + review trimestrale.
- **Regola d'oro (budget scarso):** in magra si taglia il *volume* dei controlli, **mai** i pilastri. Un badge dato a chi non lo merita brucia la fiducia di tutta la città → si spegne alla radice.

---

## 3) Chi è idoneo OGGI (verifica sui dati reali — 2026-07-06)
Fondazione onesta (auto-analisi): assegno il badge **solo a entità `confermate` nei dati**, mai a prospect.

| Negozio | Stato reale | P1 Identità | P2 Attivo | P3 Pagamenti | P4 Consegna | P5 Regole | Verdetto |
|---|---|---|---|---|---|---|---|
| **Pane Quotidiano** | `confermato` (unico negozio reale) | ✅ Via Calzolai 25, bio dal 1976, KYC Stripe | ✅ `is_approved`, 5 prodotti bio `available` | ❌ **payout OFF** (`payouts_enabled=false`) | ❌ **0 consegne** (#16 in consegna) | ✅ contratto 12% firmato 1/7 | 🟡 **CANDIDATO** — 3/5 pilastri, mancano P3+P4 |
| Casa Linda | **demo/seed** (UUID `1111…`) | — | — | — | — | — | ⛔ **Escluso** (non è un negozio reale) |
| Antica Salumeria Garetti | `scelta_ragionata` (prospect, 0 ordini, non nel DB) | ❌ non nel DB | ❌ | ❌ | ❌ | ❌ | ⛔ **Non idoneo** (nulla da verificare finché non entra) |
| Ex Scuderie (3 spazi food) | `scelta_ragionata` (non ancora aperti) | — | — | — | — | — | ⛔ Pipeline futura |

**Conclusione onesta:** oggi **0 negozi Verificati**, **1 candidato** (Pane Quotidiano). PQ diventa il **primo Negozio
Verificato di Piacenza nell'istante esatto in cui:** (a) si chiude la prima consegna #16 → soddisfa P4, e
(b) si attiva il payout Stripe → soddisfa P3. Combacia in pieno con la North Star di oggi (consegnare #16): la
prima transazione reale **è** ciò che sblocca il primo badge. Non c'è nulla da inventare — il badge aspetta un fatto.

> ⚠️ **Perché NON annuncio "lo standard della città" adesso:** dichiarare pubblicamente uno "standard verificato"
> con **0 negozi verificati** sarebbe puffery e sfonderebbe il gate ONESTÀ. Lo standard si **definisce ora** (pronto
> per l'ondata dal 13/7) e si **annuncia quando c'è ≥1 negozio che lo porta davvero.** Prima il fatto, poi la voce.

---

## 4) Comunicazione — «lo standard cittadino» (BOZZE neutre, pronte, non pubblicate)

### 4a) Assegnazione al negozio (messaggio al titolare — parte SOLO a badge maturato)
> Buongiorno! Da oggi Pane Quotidiano è il **primo «Negozio Verificato MyCity» di Piacenza** 🛡️
> Vuol dire che i clienti vedono un bollino sulla vostra vetrina che garantisce quello che siete già: negozio
> vero, pagamento sicuro, consegna che funziona. È la nostra faccia messa accanto alla vostra. Ve lo siete
> guadagnati con la prima consegna. Da qui in avanti lo teniamo insieme.

### 4b) Annuncio pubblico (feed IG @mycity.piacenza + gruppi FB locali — 🔴, solo con ≥1 verificato)
> **[HOOK]** A Piacenza è nato un bollino che prima non c'era: **Negozio Verificato**.
> **[CORPO]** Comprare online da una bottega del centro è bello solo se ti puoi fidare. Così abbiamo messo cinque
> regole chiare: il negozio è reale, il pagamento è sicuro, la consegna è provata, le regole sono rispettate.
> Chi le rispetta tutte prende il bollino 🛡️. Chi lo tradisce lo perde. Non è un adesivo che regaliamo: è una
> garanzia che ci mettiamo noi, faccia a faccia. Il primo a guadagnarselo è **[negozio]** — perché dietro c'è
> gente vera, non un magazzino fuori città.
> **[CTA]** 👉 Cerca il bollino 🛡️ quando fai la spesa su MyCity. È la spesa di cui ti puoi fidare.
> **[FIRMA]** La spesa che tiene viva la città. — MyCity Piacenza · VOLTI, NON ALGORITMI

### 4c) Testo sul sito (scheda negozio + tooltip, corsia CONFIG)
> **🛡️ Negozio Verificato MyCity** — Identità reale · Pagamenti sicuri · Consegna provata · Regole rispettate.
> *(tooltip)* «Abbiamo verificato che questo negozio è reale, che paghi protetto e che consegna davvero. Se
> qualcosa non va, il bollino si sospende.»

### 4d) Onboarding dal 13/7 — il badge come standard d'ingresso
Ogni negozio della nuova ondata riceve la **checklist dei 5 pilastri** come traguardo dei primi 30 giorni:
entri → attivi payout + pubblichi catalogo → chiudi la prima consegna → **prendi il bollino**. Diventa il rito di
qualità con cui la città capisce che MyCity non è un elenco a caso, ma negozi garantiti uno per uno.

---

## 5) Cosa serve da Nicola (per far diventare il badge REALE)
1. 🔴 **Firma sull'annuncio pubblico** — parte solo quando ≥1 negozio ha davvero il bollino (oggi: dopo #16 consegnato + payout PQ attivo).
2. 🔴 **Ok a mostrare il bollino sulla vetrina di PQ** appena matura (claim pubblico su un negozio reale → validazione @legale-privacy inclusa).
3. 🟡 **Corsia tecnica:** un flag `verified` sul profilo negozio (backend-dev) + il bollino a video (frontend-dev/CONFIG) — piccola cosa, in branch, da collegare quando decidi.
4. 🟢 Nessuna azione per definire lo standard: è già pronto qui, riusabile per tutta l'ondata post-9/7.

## 6) Colore delle mosse
- 🟢 **Definire lo standard + criteri + bozze** → fatto (questo documento).
- 🔴 **Assegnare il badge a PQ e mostrarlo a video** → firma Nicola, condizionato a P3+P4 reali.
- 🔴 **Annunciare "lo standard della città"** → firma Nicola, condizionato a ≥1 negozio verificato.

*Preparato dall'AD (lente @trust-safety owner · @legale-privacy sui claim · @content-social sulle bozze). Nessun negozio è stato dichiarato "verificato": oggi 0 verificati, 1 candidato (Pane Quotidiano), badge in attesa di un fatto reale.*
