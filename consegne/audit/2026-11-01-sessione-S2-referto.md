---
data: 2026-11-01 15:05
sessione: S2 — ordine, resi e fattorino
pr: https://github.com/NicolaeRotaru/mycity/pull/277
---

# Sessione S2: ordine, resi e fattorino — referto

## In parole semplici
Ho fatto tutte e due le mie ondate, la 3 e la 4 del piano. Ho chiuso 10 difetti seri, in 6 pacchetti su 10. Tre pacchetti non hanno retto al collaudo e sono rimasti fuori, con il lavoro salvato in rami a parte. Il quarto (l'orario di consegna) non aveva niente da cambiare: era già chiuso prima di me. Il controllo completo è verde e le prove sul database di prova sono verdi.

## Cosa cambia per te
- **Storico del fattorino**: mostra il suo compenso vero. Una consegna con la spedizione gratis prima risultava 0,00 €, ora 3,00 €.
- **Posizione del fattorino**: non si scrive più su un ordine annullato. Il blocco c'è sia nella pagina sia nel database (migrazione 191).
- **Pulsante SOS**: apre il 112 per prima cosa. Prima aspettava GPS e rete, e con poco segnale il tastierino poteva non aprirsi mai.
- **Pagina d'aiuto dei fattorini**: dice i compensi e i tempi veri. Non ha più il numero d'emergenza finto né la promessa della polizza.
- **Pagina dell'ordine del cliente**: il pulsante dice «Chiama il negozio», perché chiama il negozio. Il reso chiesto si vede con il suo stato.
- **Pannello amministratore**: prima di approvare un fattorino si vedono documenti, età e scadenze.

## Cosa devi fare
1. Decidere se il cliente può vedere il numero personale del fattorino. Io consiglio di no: meglio un numero ponte.
2. Decidere chi paga la polizza dei fattorini.
3. Decidere se paghiamo il fattorino quando la consegna si annulla per colpa del cliente. Io consiglio di sì, ma solo se il supporto lo conferma.
4. Decidere se un rinnovo di patente o polizza va ricontrollato dallo staff prima che valga. Io consiglio di sì.

## Cosa non ho verificato
- Le pagine non le ho guardate a mano in un browser.
- Non ho registrato la copertura della radiografia: il comando scrive nel vault, che in questo lavoro è vietato.
- Tre pacchetti non reggono:
  - **Blocco del fattorino con documenti scaduti**: si poteva spostare la scadenza senza un documento nuovo.
  - **Consolle SOS**: direbbe «non era in consegna» a chi ha una consegna attiva.
  - **Resi**: il modulo contava 14 giorni di 24 ore, invece che fino a mezzanotte del quattordicesimo giorno a Roma. Va deciso insieme alla rotta, che non è mia.

---
**Dettagli tecnici**

| Ondata | Pacchetto | Esito |
|---|---|---|
| 3 | `app/rider/history/page.tsx` | chiuso |
| 3 | `app/api/kyc/start-check/route.ts` | chiuso |
| 3 | `app/rider/orders/[id]/page.tsx` | chiuso, 4 difetti su 5 (la frase del freno è fuori territorio) |
| 3 | `app/rider/profile/page.tsx` | non regge (ramo `claude/cinque-s2-non-regge-app-rider-profile-page-tsx`) |
| 3 | `app/admin/sos/page.tsx` | non regge (ramo `claude/cinque-s2-non-regge-app-admin-sos-page-tsx`) |
| 4 | `app/rider/onboarding/page.tsx` | chiusa la pagina d'aiuto; il quindicenne era già chiuso dalla 156 (manca la prova SQL); il blocco all'ingresso è in `middleware.ts`, fuori territorio |
| 4 | `components/rider/SOSButton.tsx` | chiuso il 112 per primo; l'avviso vero agli amministratori è fuori territorio |
| 4 | `migrations/191` | chiuso |
| 4 | `app/orders/[id]/return/page.tsx` | non regge (ramo `claude/cinque-s2-non-regge-resi`) |
| 4 | `app/seller/orders/[id]/page.tsx` | niente da fare: già chiuso dalla #274; la fascia oraria nell'avviso «Nuovo ordine!» è fuori territorio |

- Verify: verde, 839 file di prova, 7159 prove.
- Prove SQL sulla copia locale:
  - `apply.sh`: 169 migrazioni, nessuna fallita.
  - `run.sh`: verde.
  - `migrazione-su-database-pieno.sh`: verde.
  - `applica-migrazioni-mancanti.sh`, due volte: 0 migrazioni applicate.
- Richiesta di unione #277, testa `be5f65e`.
- Gettoni:
  - ondata 3: 934.418 senza le letture dalla cache, 20,1 milioni contandole (12 agenti);
  - ondata 4: 717.632 senza le letture dalla cache, 11,0 milioni contandole (11 agenti).
- Difetti nati, vecchi visti e fuori territorio: sono nel `.json` accanto a questo file.
- Note per la macchina:
  - Il workflow non ha un freno in `.claude/settings.json`.
  - `ondata-snella.js` riceve gli args grandi come stringa.
