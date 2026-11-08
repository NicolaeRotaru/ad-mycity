---
data: 2026-11-08 08:35
tipo: referto
fonte: palestra (copia del sito per le prove), carta 232, lotti 1, 2 e 3
---

# La palestra, referto dei lotti 1, 2 e 3

## In parole semplici

La palestra è la copia del sito fatta solo per le prove, con dati finti. Lì gli specialisti usano il sito come clienti, negozi, fattorini e amministratori. Ogni difetto che trovano lo rifà da capo un verificatore diverso.

Un esempio vero dal secondo lotto, le prove da cliente. Un cliente nuovo riscatta un buono regalo valido da 10 € e legge «Non hai i permessi per questa azione». Il buono resta pieno e il credito resta a zero. È successo in due prove diverse, ogni volta uguale.

Dal terzo lotto, le prove da negozio: chi scrive il prezzo all'italiana, «1.250,00», mette in vendita il prodotto a 1,25 €, senza nessun avviso.

L'esempio del primo lotto resta il più urgente. Chi abita in Via Roma, Via Garibaldi o Via Cavour non riesce a ordinare: il sito mette l'indirizzo a 10 km dal centro e risponde «troppo lontano». È l'unico difetto che blocca il lancio del 15/11.

## Cosa cambia per te

- Il secondo lotto porta **44 difetti nuovi** nel registro: 4 gravi e 40 minori. Uno è una falla riservata, R314, con il solo titolo generico.
- **30 difetti già noti** ricevono la conferma della palestra. Quattro passano da minori a gravi: il reso rifiutato nell'ultimo giorno, il prezzo che cambia con la cassa aperta, le coordinate vecchie dell'indirizzo e le recensioni offensive che non si possono segnalare.
- Entra anche il difetto del **registro dei contanti**, grave. L'ha visto la prova di fumo, l'ha verificato la sessione di riparazione e la palestra lo ha rifatto davvero sul suo database.
- Il terzo lotto porta **20 difetti nuovi**: 1 grave e 19 minori. Due sono falle riservate, R315 e R316. **38 voci già note** ricevono la conferma: 26 abbinate direttamente e 12 per i comportamenti in più. Quattro date per riparate tornano aperte. Una passa da minore a grave: «1.500» che diventa 1,50 € nella modifica veloce.
- I difetti aperti passano da **726 a 795**: 6 bloccanti, 92 gravi e 697 minori.
- Il sito vero non è stato toccato, e dalla palestra non è partita nessuna email.

## Cosa devi fare

- Leggere in chat i dettagli delle falle riservate nuove, R314, R315 e R316. Le prime tre, R311, R312 e R313, le hai già avute.
- Decidere se accendere su Supabase la protezione contro le password già rubate. È un interruttore del sito vero, quindi 🔴.
- Unire questa richiesta quando l'hai guardata.

## Cosa non ho verificato

- Le prove fatte sono 370 su 533. È in corso il lotto 4, con 114 prove da amministratore e da fattorino. Ne restano 49: 16 sui lavori a orario, 28 con la carta e 5 che in palestra non si possono fare.
- La palestra è una copia: i difetti li ho rifatti solo lì. Il sito vero usa lo stesso codice.
- In 11 casi del lotto 2 e 17 del lotto 3 la palestra ha visto, accanto al difetto già noto, un comportamento in più. L'ho annotato nella conferma della voce, oppure sulla voce aperta che lo descrive già, non come voce a sé.

## Dettagli tecnici

### Cosa ha fatto la palestra

| Lavoro | Cosa | Esito |
|---|---|---|
| Prova di fumo | il giro del pane in contanti, 4 ruoli | riuscito; 1 bloccante, 1 grave, 1 minore verificati |
| Prova generale | copia di Pane Quotidiano e primo ordine, 2 volte | riuscita; 2 gravi |
| Lotto 1 | 114 prove da estraneo e sul database | 60 passano, 52 falliscono, 1 non eseguibile, 1 bloccata |
| Verifica del lotto 1 | 1 verificatore per i minori, 2 per i gravi | 51 confermati, 1 scartato |
| Lotto 2 | 134 prove da cliente | 52 passano, 80 falliscono, 1 non eseguibile, 1 bloccata |
| Verifica del lotto 2 | come sopra | 78 confermati, 2 scartati |
| Lotto 3 | 122 prove da negozio | 62 passano, 60 falliscono |
| Verifica del lotto 3 | come sopra | 57 confermati, 3 scartati |
| Costruzione | il database di prova ricostruito dalle migrazioni | 4 minori misurati |

### Dal confronto con il registro

- **Lotto 1:** 61 difetti confermati diventano 21 già nel registro, 13 doppioni fra loro e 28 nuovi. Il confronto l'hanno fatto 5 agenti, poi un revisore di sicurezza: 6 testi oscurati, 2 difetti trasformati in falle riservate.
- **Lotto 2:** 78 difetti confermati diventano 32 già nel registro, su 30 voci, 2 doppioni fra loro e 44 nuovi. Il confronto l'hanno fatto 8 agenti contro le 2.935 voci, con un revisore di sicurezza. Poi 9 agenti hanno ricontrollato tutto da capo, cercando apposta di smentire gli abbinamenti e di trovare doppioni sfuggiti. Risultato: 0 doppioni sfuggiti, 0 abbinamenti sbagliati, 11 abbinamenti «in parte» e 4 voci nuove a cui mancava il rimando a una voce vicina, ora scritto nella descrizione.
- **Lotto 3:** 57 difetti confermati diventano 30 già nel registro, su 26 voci, 7 doppioni fra loro e 20 nuovi. Il confronto l'hanno fatto 6 agenti, il ricontrollo avversario altri 7: 0 doppioni sfuggiti, 17 abbinamenti «in parte», 3 voci nuove ritoccate. Il revisore di sicurezza ha trasformato 2 difetti in falle riservate.
- Il revisore di sicurezza del lotto 2 ha oscurato due testi. Nel buono regalo ha tolto il nome della spia che spegne la guardia dei profili, mandato in chat all'altra sessione. In un messaggio sulle password ha tolto la frase che diceva acceso o spento un interruttore del sito vero.

### I difetti nuovi più importanti

- **Bloccante, lotto 1: la cassa rifiuta vie del centro come «troppo lontane».** `lib/geocodifica.ts` e `app/api/geocode/route.ts` cercano su Nominatim a testo libero, con `limit=1`, senza confine sul comune.
- **Grave, lotto 1: un negozio già approvato non può scrivere IBAN e dati della ditta.** Caso vero: Pane Quotidiano.
- **Grave, lotto 2: il buono regalo valido non si riscatta** (S06-P057, con S10-P033). La rpc `redeem_gift_card` risponde 42501 e il buono resta a 1.000 centesimi.
- **Grave, lotto 2: lo scarico dei dati si ferma a 1.000 righe per sezione e dice «completo»** (S06-P070). Il problema è `app/api/account/export/route.ts` contro il massimo di righe dell'API.
- **Grave, lotto 2: dopo «Invia» all'assistenza la chat non si apre** (S08-P044). In `components/SupportChatModal.tsx`, `useCloseOnBack` scatta prima di `router.push`.
- **Grave, lotto 2: toccare la scheda di un prodotto in home e in ricerca non apre niente** (S10-P001). Il file è `components/ProductCard.tsx`.
- **Grave, lotto 3: nel modulo del prodotto «1.250,00» diventa 1,25 €** (S10-P066). Il campo prezzo di `components/seller/ProductForm.tsx` è di tipo numerico; `leggiPrezzo` di `app/seller/products/import/csv.ts` sa già leggere il formato italiano.
- **Grave, prova di fumo: confermata una rimessa, la giornata del fattorino risulta versata anche per i contanti che incassa dopo.** `confirm_cod_remittance` (migrazione 127) scrive `remitted_at` senza condizioni, e `contantiAncoraDaVersare` in `lib/account/cancellazione.ts` se ne fida. Rifatto in Postgres l'8/11: due giri in palestra e uno con `tests/sql/harness/apply.sh`, rosso senza riparazione e verde con una riparazione candidata.

### Riaperti e gravità riviste

- Lotto 1: la **2077** riaperta e alzata da minore a grave, la **1518** riaperta e abbassata da grave a minore, la **377** alzata da minore a grave.
- Lotto 2, nessuna riapertura, perché tutte le 30 voci erano ancora aperte. Quattro passano da minore a grave, con la nota in `nota_severita_7_11`:
  - la **11**, il reso rifiutato nell'ultimo giorno;
  - la **15**, il prezzo che cambia con la cassa aperta;
  - la **9**, le coordinate vecchie dell'indirizzo;
  - la **171**, le recensioni che non si possono segnalare.
- La **114**, la password uguale a quella di prima, riceve la conferma da S06-P068.
- Lotto 3: tornano aperte quattro voci date per riparate. Le riparazioni non sono arrivate dappertutto:
  - l'interruttore dell'intelligenza artificiale non è letto da due rotte del catalogo, che scrivono prezzi anche a funzione spenta;
  - i tetti per voce mancano nella rotta che migliora la scheda;
  - il filtro della dettatura vale solo per la frase dettata;
  - il salvataggio di prodotto e varianti non è ancora in un passo solo.
- Lotto 3: passa da minore a grave «1.500 diventa 1,50 euro» nella modifica veloce.

### File e lavori

- **Registro:** `MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json` passa da 2.935 a 2.979 voci col lotto 2, a 2.980 col difetto dei contanti e a 3.000 col lotto 3.
- **Grezzo:** `consegne/audit/2026-11-06-radiografia-marketplace-raw.json` passa da 211 a 276 voci, giro 5.
- **Digest dei lotti 2 e 3,** rifatti su una copia del deposito:
  - 0 voci sparite;
  - le voci vecchie cambiano solo in `riverifica_7_11`, nei tre campi della gravità e, per le 4 riaperte, in quelli della riapertura;
  - il digest riordina le voci, quindi gli indici del confronto del lotto 3 sono stati tradotti per chiave;
  - `confronto_precedente` rimesso al 5/11.
- **Esiti per prova:** `esiti-lotto-1.json`, `esiti-lotto-2.json` ed `esiti-lotto-3.json` in questa cartella, senza i dettagli delle falle riservate.
- **Lavori:**
  - fumo e smistamento `wf_b3370f8b-0c3`;
  - lotto 1 `wf_4d902b34-f87`;
  - prova generale `wf_6022fe4c-b89`;
  - confronto del lotto 1 `wf_443039ef-5c5`;
  - lotto 2 `wf_f4377721-1cd`;
  - confronto del lotto 2 `wf_860245fe-793`;
  - ricontrollo del lotto 2 `wf_287a2540-933`;
  - lotto 3 `wf_7c0f812f-fe9`;
  - confronto del lotto 3 `wf_b03bb1bb-cad`;
  - ricontrollo del lotto 3 `wf_7eed37ec-d10`;
  - lotto 4 in corso, `wf_236a009c-b2d`.
