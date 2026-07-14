---
tipo: supervisione-negozi
data: 2026-07-14 08:20
---

# 🛡️ Supervisione negozi & prodotti — 2026-07-14 08:20

> La macchina ha vegliato ogni negozio e ogni prodotto e ha trovato i dati mancanti. Qui sotto:
> le **proposte pronte** (riempimento automatico, in attesa del tuo ok) e ciò che **serve da te** (foto, prezzi, ecc.).
> Nessun dato è stato scritto sul sito: parte solo dopo la tua firma.

**Quadro:** 17 negozi (1 approvati) · 258 prodotti · **494 campi** riempibili in automatico (proposti) · **34** che servono da te.

## ✅ Proposte pronte (riempimento automatico — aspettano il tuo ok)

### Metti «nuovo» come condizione ai 252 prodotti che non ce l'hanno
- **Valore DEDOTTO** (non fornito dal negozio): «nuovo». proposto "nuovo": è il valore prevalente reale (merce di negozio nuova).
- **Attenzione:** escludi prima gli articoli di seconda mano (metti "usato" a quelli): il default nuovo non vale per l'usato.
- **Esempi:** Le 48 leggi del potere, Borsa a tracolla in pelle, Cintura nera in cuoio, Berretto invernale di lana, Cappotto invernale grigio, ….
- **Reversibile:** ogni riga viene salvata in un backup VERSIONATO (mai sovrascritto) prima della modifica.
- **Comando pronto** (dopo il tuo ok su QUESTO gruppo, con `AZIONI_LIVE=1`):
```bash
# 252 righe · elenco ID: consegne/supervisione/ids/2026-07-14-products-condition-nuovo.json · batch annullabile: sup-2026-07-14-products-condition
for id in $(node -e "console.log(require('./consegne/supervisione/ids/2026-07-14-products-condition-nuovo.json').join('\n'))"); do \
  BATCH_ID=sup-2026-07-14-products-condition AZIONI_LIVE=1 node cervello/marketplace.mjs aggiorna products "$id" '{"condition":"nuovo"}'; \
done
# Annullare tutto il gruppo:  AZIONI_LIVE=1 node cervello/marketplace.mjs annulla-batch sup-2026-07-14-products-condition
```

### Metti «pezzo» come unità di misura ai 242 prodotti che non ce l'hanno
- **Valore DEDOTTO** (non fornito dal negozio): «pezzo». proposto "pezzo": è l'unico valore di unità già usato sul sito (precedente reale).
- **Attenzione:** categoria "Frutta e Verdura" a peso: valuta se è meglio kg/etto prima di confermare · categoria "Salumeria" a peso: valuta se è meglio kg/etto prima di confermare · categoria "Latticini & Formaggi" a peso: valuta se è meglio kg/etto prima di confermare · categoria "Pasta fresca" a peso: valuta se è meglio kg/etto prima di confermare.
- **Esempi:** Borsa a tracolla in pelle, Cintura nera in cuoio, Berretto invernale di lana, Cappotto invernale grigio, Polo pique blu navy, ….
- **Reversibile:** ogni riga viene salvata in un backup VERSIONATO (mai sovrascritto) prima della modifica.
- **Comando pronto** (dopo il tuo ok su QUESTO gruppo, con `AZIONI_LIVE=1`):
```bash
# 242 righe · elenco ID: consegne/supervisione/ids/2026-07-14-products-unit-pezzo.json · batch annullabile: sup-2026-07-14-products-unit
for id in $(node -e "console.log(require('./consegne/supervisione/ids/2026-07-14-products-unit-pezzo.json').join('\n'))"); do \
  BATCH_ID=sup-2026-07-14-products-unit AZIONI_LIVE=1 node cervello/marketplace.mjs aggiorna products "$id" '{"unit":"pezzo"}'; \
done
# Annullare tutto il gruppo:  AZIONI_LIVE=1 node cervello/marketplace.mjs annulla-batch sup-2026-07-14-products-unit
```

## 🙋 Serve da te (materia prima reale — la macchina NON la inventa)

| Cosa manca | Quanti | Perché non lo riempio da solo |
|---|---|---|
| città | 17 | serve materia prima reale |
| descrizione vetrina | 15 | serve la voce/storia reale del negozio |
| logo | 1 | serve materia prima reale |
| foto prodotto | 1 | serve materia prima reale |

> Per foto/descrizioni posso preparare una **bozza con segnaposto** (poi la rifinisci) o passarle a **content-social/ai-copywriter** e **designer/ai-designer**. Dimmelo e le accodo.

## 🔒 Cosa NON tocco mai

Dati legali, fiscali (P.IVA, codice fiscale), IBAN/carta, documenti KYC, account Stripe, consensi
e stato di approvazione: sono sensibili e restano **sempre e solo** in mano tua. La macchina non li propone mai.
