---
tipo: report-giornaliero
data: 2026-07-27 21:15
fonte: AD digitale
---

# Report giornaliero — 27 luglio 2026

## La situazione in una riga

Business **fermo esattamente come da 7 giorni** — **0 ordini pagati**, stallo **33 giorni** dall'unico ordine di test del 24/6, coerente con la pausa negozi fino al 24/8-1/9. Giornata intensa ma **tutta interna**: sotto mandato esplicito di Nicola ("lotti D→C→B→A, poi cantiere continuo"), la squadra tech ha chiuso **11 difetti reali di macchina** in 5 lotti mergiati (PR #566, #570, #571, #572 + sblocco PR #556/#562), portando il cantiere a **167 aperti / 103 chiusi**. Scoperta seria della giornata: il riconciliatore automatico si era chiuso **91 difetti falsi da solo** (prove "vere alla nascita") — trovato, riaperto e ora bloccato da un guardiano nuovo. L'orologio più urgente resta **PI26: scade tra ~2,8 giorni (30/7 ore 16:00)**, ancora ferma in attesa di 3 risposte da Nicola.

---

## Numeri chiave (ore 21:08 — sensori REST verificati ora, `verifica-sensori.mjs`: tutti verdi tranne Telegram)

| KPI | Valore | Var. vs ieri |
|-----|--------|---------------------|
| **Ordini pagati (North Star)** | **0** | = |
| Ordini creati nel database | 1 (annullato, €19,05 COD, 24/6) — dato di test, escluso dai conteggi reali | = |
| Ordini consegnati | 0 | = |
| **Clienti iscritti** | **7** (4 buyer, 1 seller, 1 rider, 1 admin) — 0 nuovi oggi | = |
| Negozi live/approvati | **1** (Pane Quotidiano) | = |
| Prodotti pubblicati | **5** | = |
| Recensioni | 0 | = |
| Carrelli abbandonati | 3 | = |
| Incasso pagato | **0 €** | = |
| Payout versati ai negozi | **0 €** | = |
| Attività sul sito oggi | invariata (nessun evento nuovo tracciato) | = |
| Lead negozi in pipeline | **407** (baseline 7/7, non lavorati oggi) | = |
| Stallo North Star | **33 giorni** dall'ultimo ordine (24/6) | +1 |
| Notifiche in coda non inviate | **84** (mancano le chiavi Telegram) | = |
| Cantiere difetti macchina | **167 aperti / 103 chiusi** | -14 aperti, +14 chiusi vs ieri |

Nessun numero di *business* è cambiato: coerente con la decisione di Nicola del 23/7, l'inserimento negozi resta rinviato al 24/8-1/9. Tutto il movimento di oggi è sul lato macchina (cantiere difetti).

---

## Cosa è successo oggi

**Mattino/giorno — 4 lotti tech mergiati sotto mandato diretto di Nicola ("non fermarti a chiedermi conferma"), poi nasce il "cantiere continuo":**
- **18:25 — Lotto A (PR #566):** chiusi 6 difetti bloccanti — nessun error boundary React (un errore in una scheda del Pannello smontava tutto), un dato storto in memoria che produceva pagina bianca, 51 azioni tutte aperte insieme sul Pannello (ora accordion chiuso con tetto 10), e il Worker a schermo intero senza via d'uscita (X non renderizzata, niente tasto Esc). Con questo lotto i 4 lotti autorizzati da Nicola erano tutti consegnati.
- **19:00 — nasce il "cantiere continuo".** Nicola ha chiesto come chiudere il massimo dei difetti senza fermarsi ma con verifica vera. Misurato (non a sensazione): **164 prove su 181 (91%) erano deboli** ("il file contiene questo pattern") — lo stesso tipo di prova che alle 12:15 aveva prodotto **91 chiusure false in 60 secondi** (difetti dichiarati "risolti" da un fix che in realtà non li aveva mai toccati, perché la prova era già vera il giorno stesso della nascita del difetto). Decisione di Nicola: merge a lotti una volta al giorno (lui mergia, l'AD impila i rami senza fermarsi); scoperto anche che per il Pannello **mergiare = deployare** (ogni push su `main` che tocca `pannello/` fa scattare il deploy Vercel).
- **Lotto 1 (PR #567):** costruito il guardiano che impedisce la prossima volta le chiusure false — verifica alla nascita del difetto (non accetta prove già vere allora) e alla chiusura (non accetta un fix su un file mai cambiato). Trovato un secondo bug nel guardiano stesso durante la costruzione, corretto prima di consegnarlo.
- **19:10 — sbloccate 2 PR ferme su "conflitti":** non erano conflitti veri ma una riscrittura della storia di `main` (11:28) senza base comune coi rami vecchi. PR #556 (fix chat doppie) ricostruita e pulita; PR #562 chiusa perché main l'aveva già superata (lo scanner segreti gira già senza quel falso allarme).
- **20:30 — Lotto 3 (PR #570):** il cancello anti-memoria-bugiarda copriva solo 1 script su 5 che scrivono su `main`; ora tutti e 5. **Ha già lavorato dal primo minuto:** appena mergiato ha bloccato una pubblicazione perché aveva trovato una chiave finta di test scritta per errore dentro DECISIONI.md un'ora prima — ripulita in 2 minuti.
- **21:10 — Lotti 4 e 5 (PR #571, #572):** 5 difetti chiusi — scritture JSON non atomiche (un crash a metà scrittura lasciava registri troncati), una sentinella che rimetteva in coda un lavoro fallito all'infinito senza tetto, guardiani della macchina che non distinguevano "bocciato" da "non sono riuscito a controllare". In entrambi i lotti, il test di verifica ha trovato un difetto nel proprio metro di misura (non nel fix) prima di essere consegnato.

**Tutto il lavoro di oggi è rimasto su branch → PR → merge firmato da Nicola**, mai push diretto su `main` per il codice; la memoria (questo file compreso) resta su push diretto come da regola.

**Segnali della macchina — 2 avvisi in warning, non bloccanti:** `notifica-approvazioni` (84 notifiche non inviate, chiavi Telegram mancanti, invariato), `freschezza-segnali` (8 guardiani senza battito fresco: `sensori`, `allinea-scan-can`).

---

## Da firmare — in ordine di urgenza

### 🔴 Con orologio reale

1. **PI26 (bando CCIAA, fino a 10.000€ a fondo perduto)** — **scade 30/7 ore 16:00, restano ~2,8 giorni.** Servono ancora 3 tue risposte (P.IVA/forma giuridica sì-no, spese reali documentabili sì-no e quanto, firma digitale attiva sì-no). Card `#pi26-conferma-ammissibilita`, la cosa più urgente sul tavolo.

### 🟡 Da decidere/mergiare

2. **Vercel Authentication sul Pannello** (30 secondi tuoi) — chiude 2 difetti insieme (AR-226, AR-112): oggi confermato che chi ha solo il link può ancora entrare nel Pannello senza serratura.
3. **Conferma se il "piano squadra" (fratello + 2 amici non pagati, inserimento negozi da metà agosto) sostituisce la pausa fissata al 24/8-1/9** — chiesto più volte, ancora senza risposta. Card `#conferma-piano-squadra-ripresa-negozi`.
4. **Decidi cosa fare dei 167 difetti aperti nel cantiere** — a questo volume non è più una lista leggibile a colpo d'occhio; card `#radiografia-triage-cantiere` propone un criterio di priorità (impatto sulla crescita, non ordine di scoperta).
5. Il resto della coda (post social, referral, welcome email, whatsapp prospect) resta **in pausa** per la decisione del 23/7 — non la ripropongo finché non riparte quella finestra.

---

## Cosa ho imparato oggi (per non ripeterlo)

- Una prova di chiusura che è **vera il giorno stesso della nascita del difetto** non prova che un fix l'abbia risolto — può essere stata vera da sempre. Il guardiano ora ricostruisce lo stato del file *alla nascita* prima di accettare una chiusura.
- **Il fix applicato a una copia sola** si è ripetuto per la terza volta oggi su pattern diversi (memoria, strati UI, scritture JSON) — quando si trova un bug in "un" file che scrive/legge un certo tipo di dato, cercare SEMPRE le copie gemelle prima di dichiarare chiuso.
- Dopo una riscrittura della storia di `main`, i rami aperti prima mostrano "conflitti" che non sono conflitti di contenuto (nessuna base comune) — vanno ricostruiti sul nuovo `main`, non "risolti" a mano.

---

*Numeri confermati ora (21:08) via `cervello/verifica-sensori.mjs` (REST Supabase, fonte di verità) — coerenti con le 5 riverifiche di oggi (06:20/08:20/10:20/11:01/18:00/18:20/20:20), nessuna variazione. Mano email (Resend) non risulta collegata per invio autonomo — nessuna email è stata inviata a Nicola, il report resta solo su file.*
