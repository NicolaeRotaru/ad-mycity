---
data: 2026-11-01 13:35
sessione: S2 — ordine, resi e fattorino
pr: https://github.com/NicolaeRotaru/mycity/pull/277
---

# Sessione S2: ordine, resi e fattorino — referto

## In parole semplici
Ho fatto la prima delle mie due ondate (la numero 3 del piano). Su 9 difetti seri ne ho chiusi 7, in 3 pacchetti su 5. Due pacchetti non hanno retto al collaudo e sono rimasti fuori. La seconda ondata non è partita, perché il tetto settimanale dei gettoni è in avviso e la regola approvata dice di fermarsi.

## Cosa cambia per te
- Lo storico del fattorino mostra il suo compenso vero: 3,00 € anche quando il cliente non ha pagato la spedizione (prima diceva 0,00 €).
- Il GPS del fattorino si spegne davvero quando l'ordine è chiuso o il permesso è tolto. Se il segnale è solo debole, resta acceso e lo dice.
- Nella pagina dell'ordine il pulsante dice «Chiama il negozio», perché chiama il negozio. Il reso chiesto compare con il suo stato.
- L'amministratore, prima di approvare un fattorino, vede patente, polizza ed età. «Approva» resta spento se manca un documento o se è scaduto.

## Cosa devi fare
1. Decidere se il cliente può vedere il numero personale del fattorino. Io consiglio di no: meglio un numero ponte o una chat.
2. Decidere se un rinnovo di patente o polizza va ricontrollato dallo staff prima che valga. Io consiglio di sì, con una coda di revisione.
3. Decidere chi paga la polizza dei fattorini. Oggi la pagina d'aiuto promette che la paga MyCity. Serve prima della seconda ondata.
4. Dare il via alla seconda ondata quando il tetto dei gettoni lo permette.

## Cosa non ho verificato
- Non ho provato le pagine in un browser vero: le prove montano le pagine nell'ambiente di prova.
- Non ho registrato la copertura della radiografia: il comando scrive nel vault, che in questo lavoro è vietato. Sette file toccati restano senza copertura registrata.
- Le prove SQL non le ho rilanciate io. Questa richiesta non porta migrazioni: la 190 sta solo nel pacchetto che non regge.

---
**Dettagli tecnici**

| Pacchetto | Esito | Cosa |
|---|---|---|
| `app/rider/history/page.tsx` | chiuso | compenso con `compensoConsegnaEuro` e `rider_fee_cents` |
| `app/api/kyc/start-check/route.ts` | chiuso | scheda d'esame del fattorino + rotta `app/api/kyc/documenti-rider/[id]` (link di 120 s) |
| `app/rider/orders/[id]/page.tsx` | chiuso (4 difetti su 5) | GPS, pulsante, stato del reso; la frase del freno è fuori territorio |
| `app/rider/profile/page.tsx` | non regge | la migrazione 190 lascia spostare la scadenza senza documento nuovo; la bacheca dice «già preso» al posto di «documenti scaduti» |
| `app/admin/sos/page.tsx` | non regge | su `/rider` con una consegna attiva l'SOS scrive `order_id` null e la consolle dice «non era in consegna» |

- I due rami che non reggono sono salvati su `claude/cinque-s2-non-regge-app-rider-profile-page-tsx` e `claude/cinque-s2-non-regge-app-admin-sos-page-tsx`.
- Fuori territorio:
  - `lib/ordini/veloce-non-confermata.ts` e `lib/email/templates.ts`: la frase «puoi annullare senza costi».
  - `app/api/admin/users/[id]/moderate/route.ts`: manca il controllo dei documenti dal lato server.
  - `components/account/`: la voce «Resi» del menu.
  - La migrazione 191: la policy di `orders` lascia scrivere `rider_lat` su un ordine `CANCELED`.
- Verify: verde, 836 file di prova, 7146 prove. Run del workflow: `wf_c7f6522a-9dd`. Commit `f19f3a9`.
- Gettoni: 12 agenti; 934.418 senza le letture dalla cache, 20.084.664 contandole.
- Note per la macchina:
  - Il workflow non ha un freno in `.claude/settings.json`: lo aggancia Nicola.
  - `ondata-snella.js` riceve gli args grandi come stringa: l'ho aggirato con una copia dello script con gli args scritti dentro.
- Difetti nati (13) e vecchi visti (5): sono nel `.json` accanto a questo file.
