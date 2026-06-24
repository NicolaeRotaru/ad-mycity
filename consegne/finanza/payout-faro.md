---
tipo: checklist-payout-test + lista-dati-KYC
reparto: finanza
negozio-faro: Antica Salumeria Garetti — Piazza Duomo 44, Piacenza
categoria: salumeria / gastronomia DOP (3 DOP Piacentini)
data: 2026-06-24
go-live-target: 2026-06-25
stato: FINITO — pronto da usare al colloquio di domani
costruito-su: consegne/vendite/pitch-garetti.md (Parte C, termini) · consegne/legale/contratto-venditore-bozza.md (§5 payout) · MyCity-Vault/05-Soldi-Rischi/Finanza & Unit Economics.md · MyCity-Vault/05-Soldi-Rischi/Rischi & Compliance.md (N1, N2)
allineato-con: DECISIONI.md (commissione 12%, IN ATTESA DI FIRMA di Nicola)
---

> ⚠️ **Nota CFO (onestà):** muovere denaro reale (transfer/payout/refund) è 🔴 → si **propone, non si esegue** senza firma di Nicola.
> Il test qui sotto usa **importi minimi reali** (consigliato **1,00 €**) o l'ambiente di test del PSP. Conferma con Nicola PRIMA quale dei due (vedi "Cosa serve da Nicola").

# 💶 Payout-test 4 minuti + dati KYC — Antica Salumeria Garetti

> Obiettivo del momento "wow": **far vedere a Garetti i soldi che si muovono prima di salutarlo.**
> Lui non compra una piattaforma: compra la certezza che **incassa, e che incassa lui**.
> Due cose in questo file: **(A)** la checklist payout-test da 4 minuti da eseguire dal vivo · **(B)** i dati KYC da chiedergli.

---

## Il numero che gli mostro (lo dico mentre la cifra appare)

Termine firmato/proposto: **commissione 12%, payout a consegna confermata, zero costi fissi** (Parte C pitch + §3-5 contratto).

| Su un ordine da… | MyCity trattiene (12%) | **A Garetti restano** |
|---:|---:|---:|
| 10,00 € | 1,20 € | **8,80 €** |
| 50,00 € (AOV) | 6,00 € | **44,00 €** |
| 100,00 € | 12,00 € | **88,00 €** |

> 🎤 Frase: *"Vede questa cifra? Questo è suo. Io trattengo solo il dodici per cento, e solo perché l'ordine è andato a buon fine. Glielo faccio vedere muoversi adesso."*

---

## PARTE A — CHECKLIST PAYOUT-TEST (4 minuti, dal vivo)

> Si esegue **subito dopo il go-live** (minuto 17-20 dell'onboarding di @vendite), sul mio telefono/tablet.
> Logica tecnica (allineata a Rischi N1): l'incasso passa da **Stripe Connect (split payment)** — i fondi stanno nei conti segregati del PSP, **MyCity non possiede mai l'intero incasso**, trattiene solo la `application_fee` del 12%. Niente licenza PSD2.
> ⚠️ **Pre-requisito per il payout via bonifico:** serve l'**IBAN** di Garetti collegato a Stripe Connect (vedi Parte B). Se l'IBAN non c'è al momento, si fa la **variante COD** (in fondo) — il go-live NON si blocca (strategia Tech COD-first).

### ⏱️ Minuto 0-1 · Preparo il test (a video, lo commento)
- [ ] Apro la dashboard ordini MyCity sul mio telefono accanto a lui.
- [ ] Confermo che l'account venditore di Garetti è **collegato a Stripe Connect** (creato all'onboarding) e che l'**IBAN** risulta inserito.
- [ ] Dico cosa sto per fare: *"Faccio un ordine vero da 1 euro come se fossi un cliente, così vediamo tutto il giro: incasso, la mia fetta, e il suo accredito."*

### ⏱️ Minuto 1-2 · Ordine di prova (incasso)
- [ ] Dal **mio** telefono piazzo un **ordine reale da 1,00 €** (o 2,00 €) su un prodotto di Garetti — pago io con la mia carta.
- [ ] Mostro a Garetti la **notifica/telefonata di ordine** che arriva a LUI (è anche il test ordine di @vendite).
- [ ] A video: l'ordine risulta **pagato** (incasso 1,00 €).

### ⏱️ Minuto 2-3 · Consegna confermata → scatta il payout
- [ ] Faccio segnare a Garetti l'ordine come **"consegnato/confermato"** (gli mostro DOVE si clicca — è il gesto che farà ogni giorno).
- [ ] A consegna confermata mostro lo **split**: su 1,00 € → **0,12 € a MyCity** (12%), **0,88 € a Garetti**.
- [ ] Spiego: *"Da questo momento gli 0,88 € sono suoi. Su un ordine da 50 sarebbero 44. La commissione io la prendo solo ORA, perché ha venduto davvero."*

### ⏱️ Minuto 3-4 · "I soldi si muovono" (la prova che chiude)
- [ ] Mostro sulla dashboard il **payout in arrivo verso il suo IBAN** (stato "in transito/in arrivo": l'accredito Stripe è entro pochi giorni lavorativi — **questo lo dico chiaro, non fingo l'istantaneo**).
- [ ] Se il PSP lo permette in demo, mostro la riga "**transfer al venditore: 0,88 €**" già registrata a suo nome.
- [ ] Chiusura: *"Ha visto? Il giro è completo: cliente paga, lei consegna, lei incassa. Senza che lei tocchi niente di tecnico. Funziona così per ogni ordine, anche sabato col mercato."*
- [ ] 🔴 **Annoto l'ordine-test** (id + importo) per stornarlo/riconciliarlo dopo → riga in AZIONI-IN-ATTESA.md (è denaro reale: storno = firma Nicola).

> 🎯 **Esci solo dopo che Garetti ha VISTO la cifra a suo nome muoversi.** Quella vista vale più di ogni promessa a voce.

### 🔁 Variante COD (se l'IBAN non c'è ancora — payout-test "a secco")
Se Garetti non ha l'IBAN a portata di mano, non rinuncio al "wow": glielo faccio vedere **simulato sui numeri reali**.
- [ ] Faccio l'ordine di prova da 1,00 € in **COD (contanti alla consegna)**.
- [ ] A consegna confermata mostro a video il **conteggio**: incassa 1,00 € in contanti → di cui **0,88 € suoi**, **0,12 € commissione MyCity** (che gli verrà conteggiata, non sottratta dal contante).
- [ ] Gli mostro la tabella sopra (10/50/100 €) come anteprima: *"Appena mi dà l'IBAN, questo accredito le arriva in automatico in banca, non in contanti."*
- [ ] 🟡 **Accodo il completamento Stripe Connect (IBAN) come follow-up** entro 48h → è ciò che attiva i pagamenti online + payout automatico.

---

## PARTE B — DATI KYC DA CHIEDERE A GARETTI

> Perché glieli chiedo (lo dico in una frase, così non si insospettisce):
> *"Questi dati servono alla banca/pagamenti per poterle bonificare i soldi in regola — è la stessa verifica che fa la sua banca. La fa il fornitore di pagamenti, non io."*
> Architettura (Rischi N1-N2): il **KYC/AML è demandato al PSP marketplace (Stripe Connect)**, soggetto regolamentato. **MyCity NON costruisce un KYC fai-da-te** e non conserva più del necessario (minimizzazione, §7 contratto).

### 🔴 Minimo indispensabile per attivare il payout (Stripe Connect)
| # | Dato | A cosa serve | Note |
|---|---|---|---|
| 1 | **P.IVA / Codice Fiscale** dell'attività | Identificare l'attività al PSP + fatturazione provvigione (N5) | È già un campo dell'onboarding venditore |
| 2 | **IBAN** del conto dell'attività | **Destinazione del payout** (accredito del netto) | Senza questo → solo COD; è ciò che sblocca il payout automatico |
| 3 | **Documento d'identità** del titolare/legale rappr. (carta d'identità o passaporto, in corso di validità) | Verifica identità del beneficiario richiesta dal PSP (AML) | Lo carica/verifica **Stripe**, non lo conservo io |
| 4 | **Email** (che Garetti controlla davvero) | Account venditore + comunicazioni Stripe + ricevute | Gliela faccio digitare a lui all'onboarding |
| 5 | **Cellulare** | Notifiche ordine + eventuale verifica 2FA del PSP | È anche il canale ordini (telefono negozio se diverso: lo annoto) |

### 🟡 Utili / probabilmente richiesti dal PSP (chiedo se a portata di mano, non blocco il go-live)
- **Ragione sociale / insegna esatta** come da visura (Antica Salumeria Garetti) e **forma giuridica** (ditta individuale / SNC / SRL).
- **Indirizzo sede legale** (se diverso da Piazza Duomo 44) e **data di nascita** del titolare.
- **Codice ATECO** dell'attività (commercio dettaglio alimentari) — spesso lo precompila il PSP dalla P.IVA.

### 🟢 Regole di trattamento (peer review privacy → @legale)
- Raccolgo **solo** quanto serve al payout (minimizzazione, art. 5 GDPR / §7 contratto).
- Il **documento d'identità** lo carica/verifica direttamente il PSP: **non lo salvo nel vault, non lo fotografo per archiviarlo io.**
- Prima di raccogliere i dati va consegnata/allegata l'**informativa privacy** (in preparazione lato @legale).
- IBAN e dati di pagamento trattati sotto **DPA art. 28** col PSP (Stripe).

---

## ✅ Handoff

- **PASSO-A @vendite:** il payout-test si incastra nel **minuto 17-20** della tua checklist onboarding (dopo l'ordine di prova). Tu fai l'ordine, io commento i 4 minuti di "soldi che si muovono". Se Garetti ha l'IBAN → versione Stripe; se no → variante COD + follow-up IBAN.
- **PASSO-A @legale:** confermo che il KYC è **demandato al PSP** (coerente con la tua §5 e con Rischi N1-N2). Mi serve l'**informativa privacy** da allegare **prima** di raccogliere i 5 dati KYC, e una riga in contratto/checklist su "documento d'identità verificato dal PSP, non conservato da MyCity".
- **PASSO-A @tech / @builder-automazioni:** serve confermato e funzionante per domani: account venditore **collegato a Stripe Connect** con campo **IBAN**, `application_fee` impostata al **12%**, transfer al venditore **a consegna confermata**, e visibilità a dashboard dello stato payout. Se Stripe Connect non è ancora collegato → la **variante COD** copre il go-live, ma l'IBAN/Stripe va attivato entro 48h.
- **SERVE da @tech:** mi dici se per il test useremo **importo reale minimo (1 €)** o **ambiente test Stripe**? Cambia cosa mostro e se serve lo storno.

### ⏳ Azioni 🔴 accodate (firma / via di Nicola) → AZIONI-IN-ATTESA.md
1. **Scelta modalità test:** importo reale 1 € (denaro vero) **oppure** ambiente test Stripe — serve il via di Nicola prima del colloquio.
2. **Storno/riconciliazione dell'ordine-test** (1 €) dopo la demo — movimento di denaro reale = firma Nicola.
3. (Promemoria) **Firma dei termini 12% / payout a consegna** già in coda da @vendite: serve per poter dire il 12% come impegno.

### 🙋 Cosa serve da Nicola (in 1 riga)
- Scegliere **test reale 1 € vs test Stripe** + dare il **via allo storno** dell'ordine-test, e **firmare il 12%** (DECISIONI.md) così lo mostro come impegno, non come ipotesi.

---

> **Raccomandazione CFO (1, secca):** il "wow" del payout vale, ma il margine NON nasce dal singolo ordine — su 1 ordine/giro il CM è **−0,07 €** (Unit Economics). Il payout-test conquista Garetti; subito dopo il go-live la priorità finanziaria è la **densità (≥2 ordini/giro)**: spingere il **bundle "Tris DOP"** e accorpare le consegne del cluster Duomo per sabato 27/6. Senza batching mostriamo soldi che si muovono ma in perdita.

#finanza #faro #garetti #payout #kyc #stripe #cod #piacenza
