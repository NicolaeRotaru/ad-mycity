# 🎯 07 — Strategia MyCity (documento maestro)

> Il documento-strategia vivo. Integra il `MyCity_Strategia.pdf` del fondatore con l'analisi del board dirigenti (file 16-25). Realtà sul campo → [[06-Contesto-Piacenza]].
> Aggiornare qui quando la strategia cambia.

## 💡 La strategia in una frase
**Non varietà, ma DENSITÀ.** Una famiglia del centro fa la **spesa settimanale completa** in un unico **carrello multi-negozio**, consegnato a casa. Si vince saturando **un cluster stretto**, non coprendo la città.

### Principi chiave (confermati dall'analisi)
- **Frequenza = fedeltà.** Chi ordina ogni settimana crea l'abitudine. → [[04-Metriche|North Star]] e [[23-Metriche-e-KPI]].
- **Cluster stretto.** Asse **Via Calzolai – Piazza Duomo – Via Chiapponi** (tutto in 200-400m, pedonale/ZTL).
- **Categorie giuste:** cibo fresco, gastronomia, pane, salumi, formaggi, ortofrutta, parafarmacia, fiori. Evitare elettronica/libri/abbigliamento (perdono contro Amazon).
- **Leva sociale.** I primi negozi convincono i vicini ("ce l'ho già qui accanto").

> ⚖️ **La verità che governa tutto** (su cui CFO, COO, CSO e Data convergono): *l'ordine singolo perde soldi; il margine nasce solo dal **batching** (più ordini nello stesso giro, nello stesso quartiere).* La densità non è marketing: è sopravvivenza economica. → [[16-Finanza-e-Unit-Economics]].

---

## 🔑 Il volano a 2 lati: OFFERTA **e** DOMANDA insieme
La vecchia strategia copriva solo i negozi. Un marketplace ha due lati: se firmi i negozi ma non porti clienti, dopo 3 settimane i negozi se ne vanno e la prova sociale **si ribalta**. Le due colonne vanno costruite **in parallelo**.

### 🏪 Lato OFFERTA — i negozi
**Sequenza corretta: prima il "carrello minimo vitale", non le 8 Priorità A.** Servono ~6 botteghe **contigue** che insieme permettano una spesa vera (vedi [[21-Vendite-Negozi-B2B]]):
1. Pane (Panificio Remondini/Rasparini/Groppi) — traino quotidiano
2. Ortofrutta (I Frutti della Terra *o* Solo Cose Belle) — già delivery-ready
3. Salumi/formaggi (Garetti / Amendolara / Spaccio Serafini)
4. Macelleria (Cattivelli&Passerini / Marco e Simona)
5. Gastronomia/pasta fresca (I Cucinieri) — ticket alto, "cena pronta"
6. Jolly (enoteca La Canteina *o* un secondo ortofrutta)
→ Firma per primo il **negozio-faro** (rispettato, chiacchierone) = testimonial. Pasticcerie/fiori/caffè **vengono dopo**, ad alzare lo scontrino. CRM completo: Excel "MyCity Negozi Target".

### 🧲 Lato DOMANDA — i clienti *(il pezzo che mancava)*
**Cliente da attaccare per primo:** la **mamma/coppia che lavora nel cluster** (frequenza settimanale + dolore ZTL + acquisibile a costo ~0). → [[24-Personas-e-JTBD]].
Canali a costo ~0 (budget piccolo, niente ads): i negozi stessi (QR in cassa + bigliettino nel sacchetto) · gruppi Facebook locali ("difendiamo le botteghe del centro") · volantinaggio solo nel cluster · presidio mercato mer/sab. → [[08-Domanda-Primi-Clienti]] e [[19-Marketing-e-Crescita]].
**Apri una waitlist pre-lancio** ("primi 50 = prima consegna gratis") *mentre* firmi i negozi.

---

## 🚲 Consegna & pagamenti *(decisione presa dall'analisi)*
- **Consegna:** rider proprio su **cargo-bike elettrica** (accesso ZTL 8-19), **batching giornaliero D+1** (cut-off ordini la sera → consegna l'indomani, più ordini in un giro). All'inizio il rider è il fondatore. ⚠️ Il modello "il negozio consegna" è **incompatibile** col carrello multi-negozio. → [[18-Operazioni-e-Logistica]].
- **Soglia minima: ≥10 ordini/giorno nel cluster, sotto non si esce** (si accumula al giorno dopo).
- **Pagamenti:** incassa MyCity con **Stripe Connect** (split payment), NON "contanti alla consegna" → serve per fiducia, resi, commissione e compliance. → [[20-Tecnologia-e-Stack]] e [[15-Rischi-e-Compliance]].
- **Commissione: 10-15% al negozio** (vs ~30% Glovo) + fee consegna cliente ~€2,50-5. È la leva di vendita. → [[05-Decisioni-Aperte|Decisione 3]].

---

## 📸 Onboarding prodotti (target 20-25 min/negozio)
Foto dei prodotti **hero** (20-30) → **AI estrae** nome/prezzo/descrizione/categoria → review rapida (~10 sec/prodotto, **prezzo sempre confermato a mano**) → **bulk publish**. Onboarding **fatto-per-loro** (le foto le fai tu). Ordini al negozio via **WhatsApp/stampante termica**. → [[17-Prodotto-e-UX]], [[20-Tecnologia-e-Stack]].

## 🗣️ Il pitch (3-5 min — script completo nel PDF cap. 5)
- **Timing:** mattina 9-10 o pomeriggio 15-16, lun-mar. NO ore di punta/sabato pom./domenica.
- **Gancio:** "Sto portando i negozi del centro online su MyCity, avete 2 minuti?" — offri info, non chiedere iscrizione. Poi **TACI**.
- **Proposta:** ricevono a casa · "voi non cambiate niente" · "costo ZERO iniziale, pagate solo quando vendete" (mai "è gratis") · clienti nuovi + i fedeli riordinano.
- **➕ Arma di chiusura nuova — il BANDO:** "C'è un bando regionale che ti rimborsa il **40%**, ma lo sportello chiude il **21 luglio 2026**." (autorità + urgenza). → [[12-Bandi-e-Finanziamenti]].
- **Adatta al tipo:** anziano → comunità + "faccio tutto io" (mai dire "app/piattaforma") · giovane → numeri della zona · scettico → lascia il link, prova sociale dei vicini.
- **Follow-up:** sera stessa WhatsApp col mockup → 3gg telefonata → 7gg vocale con leva cluster.
- **Metrica vera:** non i "sì", ma **quanti vanno LIVE** (>40%) e **fanno il primo ordine in 72h**. → [[21-Vendite-Negozi-B2B]].

---

## ✅ Prossimi passi (il piano completo, in ordine)
**Offerta:**
- [ ] Definire il **carrello minimo vitale** (6 botteghe contigue) e identificare il negozio-faro
- [ ] Fissare i termini: **commissione 10-15%**, zero costi iniziali, fee consegna €2,50-5
- [ ] Preparare il **mockup negozio** + scegliere chi scatta le foto + checklist onboarding
- [ ] **➕ Kit candidatura bando** per il commerciante (entro il 21 luglio 2026)
- [ ] Giro firme sui 6 del carrello minimo (+ farti presentare da "Vita in Centro")

**Domanda (in parallelo):**
- [ ] **➕ Aprire la waitlist pre-lancio** + raccogliere 150-250 iscritti (QR negozi, gruppi FB, volantini cluster)
- [ ] **➕ Pianificare il primo sabato "concierge"** coi primi 10 clienti vicinissimi

**Consegna & sito:**
- [ ] **➕ Decidere la consegna:** cargo-bike + batching D+1 + Stripe Connect
- [ ] Sistemare homepage: rimuovere demo "Salumeria del Borgo" + chiarire promessa consegna (consegna D+1, non same-day)

**Nome (aperto):**
- [ ] Decidere se tenere "MyCity" o passare a un nome piacentino → [[05-Decisioni-Aperte|Decisione 8]] · [[25-Brand-e-Posizionamento]]

---

## 🎯 Reality check sull'obiettivo
"100 negozi + 1000 clienti fedeli" è la **destinazione**, non il prossimo passo. Il break-even è a **~150-320 clienti** (non 1000); i 1000 sono il punto in cui MyCity genera cassa. La strada: **1 cluster saturo → caso studio → replica cluster-per-cluster → città-per-città** (Parma, Reggio Emilia, Modena, Ferrara). → [[22-Strategia-e-Fossato]] e [[16-Finanza-e-Unit-Economics]].

#strategia #piacenza #gtm #priorità/alta #moc
