---
tipo: scout-negozi
data: 2026-07-06 12:40
fonte: AD digitale (reparto vendite) — Playbook Scout negozi
colore: 🟢 produrre la lista/pitch (prospecting neutro) · 🔴 contatto reale ai negozi (firma Nicola, dal 9/7)
---

# 🔎 Scout negozi — 3 botteghe-target per le categorie mancanti nel cluster

> **Cos'è:** la mossa "Scout" del reparto vendite. Guarda il **cluster-spesa del centro** che stiamo
> costruendo attorno al faro **Pane Quotidiano**, individua le **categorie fresche che mancano**, e propone
> **una bottega vera per categoria** con il **pitch di onboarding già pronto** da usare alla firma.

## Perché queste categorie (la diagnosi del cluster)
Fondata sui dati reali del marketplace (MCP Supabase, giro AD 6/7 11:11) e sulla shortlist onboarding:

- **Cluster reale oggi = 1 negozio:** Pane Quotidiano — *panetteria + alimentari/bio* (la spesa fresca).
- **La shortlist 27 food** (`consegne/vendite/2026-07-06-shortlist-onboarding-post-9-7.md`) è **piena di
  ristorazione delivery** (ristoranti, pizza, sushi, burger, bar, 3 supermercati). Sono utili, ma è **il
  terreno dove Glovo/JustEat già competono**.
- **Cosa NON c'è — né nel marketplace né nella shortlist:** le **botteghe della spesa fresca** che rendono
  MyCity *"fai la spesa dal centro"* invece di un clone del food-delivery. Sono il **moat locale**:
  l'intelligence ha già visto che a Piacenza Glovo copre ~3 supermercati e **zero botteghe artigianali**.

→ Le 3 categorie mancanti da presidiare per completare il carrello-spesa attorno a Pane Quotidiano:
**① Ortofrutta · ② Salumeria/DOP piacentini · ③ Formaggi & gastronomia.**
Con queste + PQ, un piacentino fa **una spesa completa** (pane, frutta/verdura, salumi, formaggi) da botteghe
vere del centro, in un carrello solo. È la cosa che nessun'altra app in città offre.

---

## 🎯 I 3 target (una bottega per categoria mancante)

### ① Ortofrutta — **Peretti Frutta e Verdura**
- **Dove:** Via Alberici Fratelli, centro storico di Piacenza.
- **Fondamento (scelta ragionata, fatti pubblici):** negozio storico di frutta e verdura in pieno centro,
  censito tra le attività di vicinato di *Vita in Centro a Piacenza*. Fonte pubblica, **non nel DB** → è un
  **prospect**, non un dato interno.
- **Perché lui:** il fresco quotidiano ad alta frequenza di riacquisto — è la categoria che fa **tornare il
  cliente ogni settimana** e si aggancia perfettamente al carrello di Pane Quotidiano (pane + frutta/verdura).

### ② Salumeria / Salumi DOP Piacentini — **Antica Salumeria Garetti**
- **Dove:** Piazza Duomo 44, centro storico.
- **Fondamento (scelta ragionata):** iscritta all'**Albo Botteghe Storiche del Comune di Piacenza** (>50 anni),
  vende i **3 DOP piacentini** (Coppa, Pancetta, Salame). Già registrata come `scelta_ragionata` nel
  registro-realtà (confidenza 0,78). **Prospect, non nel DB.**
- **Perché lei:** i 3 DOP sono **il prodotto-faro che differenzia MyCity dalla GDO** — introvabili in consegna
  a Piacenza. *(Nota: già presente in coda come azione #1/A2; qui la confermo come pilastro-categoria del cluster.)*

### ③ Formaggi & Gastronomia — **Caseificio Amendolara**
- **Dove:** Via Trento 7, Piacenza (a piedi dal Duomo, dentro il perimetro di consegna).
- **Fondamento (scelta ragionata, fatti pubblici):** gastronomia/caseificio con **origini dal 1939**, formaggi
  e stagionatura propria, **culatello di Zibello** e specialità gastronomiche pronte. Fonte pubblica web.
  **Prospect, non nel DB.**
- **Perché lui:** completa la spesa con **formaggi/latticini e gastronomia pronta** (scontrino medio alto,
  ottimo per il "cosa mangio stasera") — la terza gamba del carrello-spesa dopo pane e frutta/verdura.

> 🎨 **Cancello allocazione (AR-006):** i 3 sono `scelta_ragionata` (prospect non firmati, non nel DB) → qui
> **solo pitch-template neutri e riusabili**, nessun asset pesante intestato. Lo sforzo pesante resta sul
> negozio reale (Pane Quotidiano, coda #21). Il contatto reale è 🔴 e parte alla firma di Nicola, **dal 9/7**.

---

## 📞 Pitch di onboarding pronto (30 secondi, per categoria)

**Struttura comune (condizioni di lancio, valide per tutti e 3):**
commissione **12%**, **0€ costi fissi**, **payout a consegna confermata**, nessun vincolo, vetrina + catalogo
iniziale **done-for-you in ~20 minuti** (time-to-live <48h), primo **ordine di prova gratuito**.
Agganci da usare: **Bando ER digitalizzazione — 40% a fondo perduto, scade 21/7** · **Venerdì Piacentini
10 e 17 luglio** (centro pieno le sere, buon momento per il primo presidio).

**① Peretti (ortofrutta):**
> «Buongiorno, sono di **MyCity**, il servizio che porta a casa dei piacentini la spesa dai negozi del centro —
> come già facciamo con **Pane Quotidiano** in Via Calzolai. La vostra frutta e verdura fresca è esattamente
> quello che la gente vuole ricevere a casa ogni settimana, e in consegna a Piacenza non la fa nessuno. Zero
> costi fissi, pagate solo una piccola commissione quando vendete. Vi va se vi porto la vetrina online già
> pronta e facciamo un primo ordine di prova questa settimana?»

**② Garetti (salumeria/DOP):**
> «Buongiorno, sono di **MyCity**, portiamo a casa dei piacentini la spesa dalle botteghe del centro. I vostri
> salumi DOP — Coppa, Pancetta, Salame piacentino — sono il prodotto che a Piacenza nessuno consegna a domicilio:
> è il motivo per cui vi ho pensati per primi in questa categoria. Zero costi fissi, commissione solo sul
> venduto, vetrina pronta in 20 minuti. C'è anche un bando che copre il 40% della digitalizzazione, scade il
> 21/7. Vi va se passo a mostrarvi come funziona e facciamo un ordine di prova?»

**③ Amendolara (formaggi/gastronomia):**
> «Buongiorno, sono di **MyCity**, il servizio che consegna a casa dei piacentini la spesa dalle botteghe del
> centro. I vostri formaggi e la gastronomia pronta sono perfetti per chi la sera vuole qualcosa di buono senza
> uscire — e in consegna a Piacenza, dalle botteghe vere, non lo fa nessun altro. Zero costi fissi, commissione
> solo quando vendete, vetrina online pronta in 20 minuti e primo ordine di prova offerto. Vi va se ve la
> preparo e ne parliamo 5 minuti?»

---

## 🔗 Come si incastra col resto
- **Sequenza vendite** per ciascuno: intelligence (verifica contatto) → **vendite** (chiamata/pitch) →
  onboarding-negozi (vetrina <48h) → finanza (payout-test) → customer-success (primo ordine concierge).
- **Priorità dopo la shortlist:** questi 3 vengono **prima** delle categorie delivery-classico della shortlist
  (pizza/sushi/burger, dove c'è più concorrenza), perché costruiscono il **moat spesa-fresca**.
- **Prossimo affinamento:** al sì, recuperare telefono/indirizzo esatti (Google Maps / Pagine Gialle) e
  intestare vetrina + primo post solo **dopo la firma** del titolare (allora l'entità passa a `confermato`).

---
*Prodotto dall'AD (reparto vendite) nel giro del 2026-07-06 12:40. I 3 target sono `scelta_ragionata` su fatti
pubblici verificabili, non dati interni: il contatto reale è 🔴 alla firma di Nicola, dal 9/7. Coda canonica =
riga #25 in [[AZIONI-IN-ATTESA]].*

Fonti pubbliche consultate:
- Peretti Frutta e Verdura — [Vita in Centro a Piacenza](https://www.vitaincentroapiacenza.com/listing/peretti-frutta-e-verdura/)
- Antica Salumeria Garetti — Albo Botteghe Storiche del Comune di Piacenza (registro-realta.json)
- Caseificio Amendolara — [caseificioamendolara.it](https://www.caseificioamendolara.it/)
