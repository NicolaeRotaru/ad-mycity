---
tipo: supervisione-negozi
data: 2026-09-09 10:28
---

# 🛡️ Supervisione negozi & prodotti — 2026-09-09 10:28

> La macchina ha vegliato ogni negozio e ogni prodotto, e ha trovato i dati mancanti.
> Sotto trovi le **proposte pronte**: il riempimento automatico che aspetta il tuo ok.
> Poi trovi ciò che **serve da te**: foto, prezzi e altri dati che solo tu puoi dare.
> Nessun dato è stato scritto sul sito: parte solo dopo la tua firma.

**Quadro:** 2 negozi, di cui 2 approvati · 9 prodotti · **4 campi** proposti in automatico · **8** che servono da te.

## ✅ Proposte pronte: il riempimento automatico che aspetta il tuo ok

### Metti «nuovo» come condizione ai 4 prodotti che non ce l'hanno
- **Valore DEDOTTO** (non fornito dal negozio): «nuovo». proposto "nuovo": è il valore prevalente reale (merce di negozio nuova).
- **Attenzione:** escludi prima gli articoli di seconda mano (metti "usato" a quelli): il default nuovo non vale per l'usato.
- **Esempi:** Pane casereccio (1kg), Focaccia all'olio (500g), Grissini artigianali (200g), Miele di acacia biologico (500g).
- **Reversibile:** ogni riga viene salvata in un backup VERSIONATO (mai sovrascritto) prima della modifica.
- **Comando pronto** (dopo il tuo ok su QUESTO gruppo, con `AZIONI_LIVE=1`):
```bash
# 4 righe · elenco ID: consegne/supervisione/ids/2026-09-09-products-condition-nuovo.json · batch annullabile: sup-2026-09-09-products-condition
for id in $(node -e "console.log(require('./consegne/supervisione/ids/2026-09-09-products-condition-nuovo.json').join('\n'))"); do \
  BATCH_ID=sup-2026-09-09-products-condition AZIONI_LIVE=1 node cervello/marketplace.mjs aggiorna products "$id" '{"condition":"nuovo"}'; \
done
# Annullare tutto il gruppo:  AZIONI_LIVE=1 node cervello/marketplace.mjs annulla-batch sup-2026-09-09-products-condition
```

## 🙋 Serve da te (materia prima reale — la macchina NON la inventa)

| Cosa manca | Quanti | Perché non lo riempio da solo |
|---|---|---|
| foto prodotto | 4 | serve materia prima reale |
| logo | 2 | serve materia prima reale |
| città | 2 | serve materia prima reale |

> Per foto/descrizioni posso preparare una **bozza con segnaposto** (poi la rifinisci) o passarle a **content-social/ai-copywriter** e **designer/ai-designer**. Dimmelo e le accodo.

## 🔒 Cosa NON tocco mai

Dati legali, fiscali (P.IVA, codice fiscale), IBAN/carta, documenti KYC, account Stripe, consensi
e stato di approvazione: sono sensibili e restano **sempre e solo** in mano tua. La macchina non li propone mai.
