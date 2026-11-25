---
data: 2026-11-25 18:58
da: sessione «Analisi subito, scheda e pagella dopo l'abbonamento» (session_01R8112N9acTBU46fC5YpxTg)
per: una sessione nuova, aperta dall'AD (session_01R8112NUV9py61BAPkYSVQ6)
---
# Passaggio: preventivo corto, avviso del flusso 20, ripubblicazione e prova vera

## In parole semplici
Nicola, 25/11 18:55: «nel momento in cui io inserisco un nuovo cliente con n8n viene creata la sua demo su mycity con il preventivo fatto bene».
La regola «analisi subito, scheda e pagella dopo l'abbonamento» è già costruita e collaudata in tre richieste. Restano tre pezzi.
Per esempio: Nicola iscrive La Ragazzetta col modulo 12 alle 10:00. Verso le 10:10 deve trovare nel link un preventivo corto, cucito su di lei, con l'analisi del business e le fonti. Niente pagella.

## Cosa cambia per te
Questa sessione riparte da quelle tre richieste: non deve rifare né l'analisi né la scheda.

## Cosa devi fare
Prima accorcia le descrizioni dei servizi nel preventivo: è la regola delle 18:30, in una richiesta nuova sopra mycity#330.
Poi cambia il messaggio del flusso 20 e ripubblica il 16, il 18 e il 20, solo dopo che Nicola dice «ok, ripubblica».
Infine fai la prova vera con La Ragazzetta e manda l'esito all'AD, con uno screenshot.

## Cosa non ho verificato
Non ho mai eseguito i flussi su n8n vero: le prove sono tutte nel repository. Non so se la routine «Chiedi all'AD» trova davvero le fonti sul web.

---

## Dettagli tecnici

### Dove sta il lavoro fatto
- **mycity#330**, ramo `claude/analisi-subito-scheda-dopo`.
  - `lib/agenzia/scheda-dopo-abbonamento.ts` decide se la scheda è aperta e la apre al primo pagamento.
  - `lib/agenzia/abbonamento-attivo-n8n.ts` avvisa il flusso 18 al primo pagamento.
  - `components/seller/AnalisiAziendale.tsx` mostra l'analisi del business: intera nella pagina «Analisi», `corta` nel preventivo.
- **N8N#15**, ramo `claude/analisi-subito-scheda-dopo`.
  - Il 16 fa la ricerca, poi chiede l'analisi del business a «Chiedi all'AD», poi chiama il 19 e manda la scheda al sito.
  - Il 18 non chiama più il 19.
- **ad-mycity#1019**: la memoria.
- La sessione «Notifiche nella finestra» (`session_01R8112N3dBK2XKzBk69xUxj`, ramo `claude/tender-ride-rz13k2`) sposta `app/preventivo/[codice]/page.tsx` in `…/abbonamento/page.tsx` e fa la demo senza accesso. Coordinati con lei prima di toccare quelle pagine.

### 1 · Le descrizioni corte (regola delle 18:30)
Nicola: «dentro il preventivo la descrizione dei servizi deve essere corta e con lo stretto necessario che gli interessa».

**Dove sono i testi**
- `lib/agenzia/preventivo.ts`: `LISTINO` (titolo e descrizione) e `FASCE[f].servizi` (come ogni servizio è compreso in ogni fascia).
- `lib/agenzia/offerta-su-misura.ts`: le proposte con `cosa`, `perche` e `fonte`.
- `components/seller/OffertaSuMisura.tsx`: come le proposte si disegnano.

**Cosa si rompe se cambi `FASCE` o `LISTINO`**
- La prova del repository N8N «il listino copiato nel 19 è parola per parola quello del sito». Va riallineato `flussi/19-bozze-abbonamenti/codice/prepara-bozze.js` insieme alla sua prova.
- `lib/agenzia/prodotti-sdg.ts` e la prova `sdg-nel-marketplace.test.ts`. Le descrizioni dei prodotti SDG nel database le ha scritte la migrazione 711: se cambiano, serve una migrazione nuova, e quella la applica solo Nicola.

**La strada più leggera**
Lascia `FASCE` com'è, quella completa, che vive anche nel database e nel 19. Nel preventivo mostra una forma corta:
- una riga per servizio, solo la fascia guardata;
- le proposte dell'offerta su misura limitate a quelle col dato vero, una frase ciascuna.

L'analisi del business nel preventivo è già corta: tre frasi.

### 2 · Il messaggio del flusso 20 e la ripubblicazione
Il flusso 20 «Iscrivi il cliente in MyCity» vive solo su n8n (`s5vKU6Ml8PUjwn29`, oggi «20 · …»). Nel nodo «Componi l'avviso», ramo 200/201, la riga
`Per la scheda del locale scrivi all'AD: «scheda per ${esc(nome)}».`
va sostituita con questa, chiesta dall'AD:
`Analisi e bozze dei 3 abbonamenti arrivano tra pochi minuti: manda il link al titolare dopo quel messaggio, così il preventivo è già cucito.`
Puoi cambiarla con lo strumento MCP `update_workflow`, operazione `updateNodeParameters` su `jsCode`.

**Ripubblicazione, solo dopo l'«ok, ripubblica» di Nicola e dopo che N8N#15 è unita**
- **Il 16:**
  ```
  N8N_API_KEY=… node flussi/16-nuovo-cliente-da-mycity/genera.mjs --credenziale <id «MyCity - Segreto nuovo cliente»> --sito https://www.mycity-marketplace.com --credenziale-sito jq9chclz5OC9MOl6 --vero --manda
  ```
  - Il 19 e «Chiedi all'AD» li trova per nome.
  - Gli id delle credenziali li legge dal 16 vivo («26 · Nuovo cliente da MyCity»).
- **Il 18:** `N8N_API_KEY=… node flussi/18-analisi-attivita/costruisci.mjs --manda --marketplace <id> --segreto <id>`.
  - Il 97 e «Chiedi all'AD» li trova per nome.
  - Senza `N8N_API_KEY` c'è la strada MCP: `--sdk` e `create/update_workflow` (vedi `flussi/LEGGIMI.md`).
- **Sul sito, Nicola mette su Vercel** `N8N_PAGELLA_WEBHOOK_URL` = `https://n8n-shdy.sliplane.app/webhook/mycity-analisi-attivita`. `N8N_NUOVO_CLIENTE_*` ci sono già, l'ha controllato l'AD.

### 3 · La prova vera
- **Rilanciare La Ragazzetta** (`b8d328ab-1955-4820-9c64-c6626d449b4a`). La porta è il webhook del 16 (`/webhook/mycity-nuovo-cliente`, segreto `x-mycity-segreto`). Il corpo:
  ```
  { "tipo":"nuovo-cliente", "origine":"mycity", "provenienza":"modulo-12",
    "attivita": { "id":"b8d328ab-1955-4820-9c64-c6626d449b4a", "nome":"La Ragazzetta", "citta":"Piacenza" } }
  ```
  Il 16 scarta la stessa attività una seconda volta entro 7 giorni (`mycity_visti` nei dati statici). Se l'ha già vista, aspetta o svuota quella voce.
- **Ora del Gusto:** la stessa cosa.
- **Poi guardare con Playwright:**
  - `/preventivo/<codice>`, che dopo la sessione «Notifiche» diventa `/preventivo/<codice>/abbonamento`;
  - la pagina «Analisi» della demo.
- **Cosa deve esserci:** parte generale e parte su misura, l'analisi del business corta con le fonti, nessuna pagella, servizi in poche righe.
- Screenshot all'AD. Nessun messaggio al locale.

### Difetti noti lasciati aperti (minori, dal collaudo)
- L'avviso al 18 al primo pagamento non ha una chiave «una volta sola»: un ritentativo di Stripe può farlo partire due volte.
- La domanda all'AD per l'analisi del business parte anche col 16 in «prova». Consuma una corsa dal tetto di «Chiedi all'AD».
- I nomi di persona nell'analisi del business li ferma solo l'istruzione all'AD. Il filtro toglie prezzi, telefoni ed email.
- Un negozio già online prima della demo che paga si vede rifare la bozza del sito una volta.
