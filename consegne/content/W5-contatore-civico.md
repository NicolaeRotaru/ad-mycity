# W5 — Il "Contatore Civico" (prova sociale numerica)

> **Modello:** Bookshop.org ("ogni acquisto sostiene una libreria locale"). **Batte Cicalia**, che fa contenuto "da scaffale" (569 post, 1,3K follower, nessuna causa): noi facciamo *significato* numerico, non catalogo.
> **Categoria:** prova-sociale. **Colore:** scrivere/renderizzare 🟢 · pubblicare + auto-pubblicare mensile 🔴.

## ⚠️ Onestà (verificato sul DB)
Oggi MyCity ha **0 ordini pagati** → il contatore reale vale **€0,00**. Perciò questo è un **template ripetibile mensile**: la grafica d'esempio mostra €1.240 **marcato "[ESEMPIO]"** in rosso. Nessun numero finto va mai spacciato per vero.

## 📐 Come si calcola il numero (definizione)
**€ restati a Piacenza** = somma dei **payout ai negozi** degli ordini pagati nel mese:
`SUM(seller_payout_cents)/100` sugli ordini con stato pagato/consegnato del mese.
È la metrica più onesta e coerente con la causa (i soldi che restano sul bancone), **non il GMV pieno**. → da validare con @analista sulla colonna esatta.
Varianti: cumulativo annuo · totale storico · "X famiglie servite" · "Y consegne in cargo-bike".

## 🖼️ Grafica
`creativi/output/social/W5-contatore-civico.png` (1080×1350) — numero gigante Fraunces oliva, badge ESEMPIO, CTA lista. Template: `cervello/content-factory/templates/contatore-civico.html` (segnaposto `{{importo}}` `{{mese}}` `{{badge_esempio}}`). Render: `cervello/content-factory/render-contatore.mjs`. Quando i dati saranno reali, `{{badge_esempio}}` va lasciato vuoto.

## ✍️ Copy

### Post / Caption (IG + FB)
> 💚 **Il contatore civico di [mese].**
> Questo mese, grazie a voi, **€[importo]** sono rimasti nelle botteghe del centro di Piacenza.
> Non in un magazzino fuori porta: sul bancone del fornaio, del salumiere, dell'ortolano del tuo quartiere.
> Ogni spesa su MyCity è un piccolo atto: tieni i soldi in città e una saracinesca aperta.
> Grazie di far parte di questa squadra. 👇 Il prossimo mese il numero lo facciamo crescere insieme.
> 👉 Non sei ancora dei nostri? Link in bio / nei commenti: entra in lista, le prime 50 famiglie hanno la prima consegna gratis.

### Primo commento (link)
> Entra tra le prime 50 famiglie del centro 👉 [LINK lista, UTM `utm_source=ig&utm_campaign=contatore-civico`]

### Hashtag (IG)
`#piacenza #piacenzacentro #compralocale #botteghestoriche #ilcentrochevogliamo #vivailcentro #economialocale #piacenzacittà`

## 🗓️ Cadenza & automazione
- **Mensile, il 1° del mese.** Format identico ogni volta → riconoscibilità (l'"appuntamento" alla Cortilia).
- **Auto-pubblicazione:** quando le mani sono collegate, l'autopilot (`cervello/autopilot.mjs`) legge il numero dal DB, riempie `{{importo}}`/`{{mese}}`, rigenera il PNG e lo accoda. Handoff a **builder-automazioni**.

## 📊 KPI
Condivisioni/salvataggi (prova sociale = molto condivisibile) · click→lista (UTM) · effetto retention (i clienti si sentono una squadra civica).

## 🙋 Serve da Nicola
1. Conferma che il numero = **payout ai negozi** (raccomandato) e non GMV.
2. Via libera 🔴 alla pubblicazione del primo (quando ci sarà un numero reale > 0).
3. OK a collegare l'autopilot per l'aggiornamento mensile automatico.
