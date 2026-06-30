# Pacchetto sblocco ordine zombie €19,05 — Pane Quotidiano

> Preparato: **2026-06-30 17:17** · @operations + @supporto · 🟢 artefatto pronto · 🔴 esecuzione (tocca cliente reale)

## Dati ordine (verificati live Supabase 30/6 17:17)

| Campo | Valore |
|---|---|
| ID ordine | `58094956-4b9b-49b4-9299-7a5c645d7cb3` |
| Negozio | Pane Quotidiano (`c0b240c0-2a86-4218-9d0f-5154f08ff929`) |
| Buyer | profilo `9262fa38-225c-4a25-bce6-a37503327bb4` |
| Totale | **€19,05** (COD) |
| Stato | `payment_status=PENDING` · `delivery_status=NEW` |
| Slot richiesto | Stasera · 18:00–20:00 (24/6) |
| Creato | 2026-06-24 08:28 UTC — **fermo da ~6,5 giorni** |
| Telefono | 348 642 1766 |
| Payout negozio | `AWAITING_REMITTANCE` (COD non incassato) |

## Opzione A — Accettare e completare (consigliata se il negozio può consegnare)

1. Nicola/Pane Quotidiano: accetta l'ordine in dashboard seller.
2. Organizza consegna (rider o ritiro concordato col buyer).
3. Alla consegna: incassa €19,05 COD → conferma in app.
4. @customer-success: telefonata feedback entro 24h (script in `consegne/customer-success/primo-ordine-faro.md`).

**Messaggio WhatsApp/SMS al buyer (bozza):**
> Ciao! Siamo MyCity — il tuo ordine da Pane Quotidiano del 24 giugno era rimasto in sospeso, ci scusiamo per il ritardo. Possiamo consegnartelo [DATA/ORA]? Rispondi sì e lo organizziamo subito. — Nicola, MyCity

## Opzione B — Annullare con nota (se non recuperabile)

1. Annulla ordine in admin con motivo: "Slot scaduto, negozio non ha accettato in tempo".
2. Invia nota al buyer:

**Email (bozza):**
- **Oggetto:** Il tuo ordine MyCity — aggiornamento
- **Destinatario:** buyer profilo `9262fa38` (telefono 348 642 1766)
- **Corpo:** Ciao, il tuo ordine da Pane Quotidiano (€19,05) non è stato confermato dal negozio entro lo slot richiesto del 24 giugno. Lo abbiamo annullato: nessun addebito. Ci dispiace per l'esperienza — quando saremo operativi al 100% ti avvisiamo. Per domande: [email MyCity]. — Team MyCity

## Perché è urgente

- Prima (e unica) transazione reale del marketplace: lasciarla in limbo **6+ giorni** rovina la fiducia del buyer e del negozio.
- Sentinella 🟡 "ordine in ritardo" scattata da 6 giorni.

## Cosa serve da Nicola

🔴 Scegli **A o B** e dai il via. L'AD prepara l'aggiornamento status; l'invio al cliente resta 🔴.
