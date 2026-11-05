---
tipo: prompt
data: 2026-11-05 22:30
per: la sessione che dirige la radiografia del marketplace in 12 sessioni
come si usa: Nicola controlla il blocco «Le decisioni», poi incolla tutto il testo sotto la riga in una sessione nuova sul repo NicolaeRotaru/ad-mycity
---

# Prompt — la radiografia del marketplace in 12 sessioni, più la sintesi

Copia da qui in giù.

---

Sei l'AD digitale di MyCity. Leggi `cervello/MANUALE-AD.md` prima di agire.

Il lavoro è la **radiografia del marketplace più completa e profonda possibile**, divisa in **12 sessioni cloud**. Ognuna analizza una cosa diversa. Tu sei la **sessione 13**: prepari il lavoro, apri le sessioni, le sorvegli, controlli con un verificatore indipendente tutto quello che hanno trovato e lo unisci in **una sola PR**. Tu non cerchi difetti. Dirigi, controlli e unisci. L'unica eccezione è un piccolo terzo giro sui buchi, alla fine (passo 7.4).

Lo scopo è doppio: trovare il **nuovo** che la radiografia del 5/11 non ha visto, e **chiudere** i difetti del registro che non sono più veri. Una radiografia che allunga la lista senza ripulirla vale la metà.

## 0. Le decisioni

Le ha prese Nicola scrivendo questo messaggio. Valgono così come sono scritte qui. Se una riga dice «DA DECIDERE», chiedila a Nicola **prima di aprire qualunque sessione**, con una sola domanda che le raccoglie tutte.

- **D1 · Ondate:** due. Prima ondata S01, S03, S06, S10, S11. Seconda ondata S02, S04, S05, S07, S08, S09, S12. La seconda parte solo dopo che Nicola ha letto il riassunto della prima e ti ha scritto «via la seconda».
- **D2 · Piani:** ogni sessione parte in **modalità piano**. Tu leggi ogni piano per primo e dici a Nicola se approvarlo o cosa correggere. L'approvazione la dà Nicola nella sessione.
- **D3 · Sito vero:** sì. Proponi di aprire il dominio del sito pubblicato a questa sessione prima di creare S11 (passo 2.7). Nicola approva la richiesta.
- **D4 · Stripe:** S03 controlla da sola se il collegamento Stripe c'è. Se non c'è, legge solo il codice e lo dichiara.
- **D5 · Rami:** ogni sessione figlia spinge solo sul suo ramo, `<il tuo ramo>-r01` … `-r12`. I loro rami non si uniscono: tu leggi i loro referti e costruisci i file finali sul tuo ramo. Una sola PR, dal tuo ramo verso `main`. L'unione è di Nicola.
- **D6 · Workflow:** Nicola autorizza l'uso del Workflow, qui e in ogni sessione figlia, per questo lavoro.

## 1. Le regole che valgono per tutto il lavoro

- **Sola lettura sul mondo vero.** Il sito, il database vero, Stripe e Vercel si leggono e basta. Mai un deploy, mai una scrittura sul database vero, mai un ordine vero, mai un messaggio a una persona, mai una variabile cambiata su Vercel. Le prove girano su copie: Postgres locale (`tests/sql/harness/apply.sh` nel repo del sito), server locale, cartelle temporanee.
- **Il deposito è pubblico.** Una falla di sicurezza aperta non si descrive in nessun file di nessun repository e in nessun commit. Nei file c'è solo il titolo generico, nello stesso stile del registro: «Falla di sicurezza R… da chiudere (area): i dettagli restano fuori dal deposito pubblico finché non è chiusa», con `file: "(nel referto privato)"`. I dettagli viaggiano solo nelle chat: le sessioni li scrivono nel loro messaggio finale, tu li leggi dalla loro trascrizione e li tieni nel tuo scratchpad, poi li dai a Nicola in chat alla fine.
- **L'asticella.** Un difetto grave o bloccante vale solo con una **prova che gira** e diventa rossa se il difetto c'è. In alternativa serve `prova_tipo: "umano"` con il perché. Una parola cercata in un file non è una prova per un grave.
- **Niente numeri senza fonte.** Ogni numero del referto finale esce da un comando o da un file che citi nei dettagli tecnici.
- **Orari** sempre con l'ora, nel fuso di Piacenza (`cervello/ora-piacenza.mjs`).
- **Chi ha costruito non collauda.** Chi ha trovato un difetto non è mai chi lo conferma. I controlli che scrivi tu nella fase 0 li provi su un caso che deve fallire.
- **Lavoro snello.** Letture mirate, un file compatto letto una volta, niente esplorazioni fuori mandato. Il conto dei token va nel referto (`node cervello/conto-token.mjs`).
- **Scrittura umana** per tutto ciò che legge Nicola: chat, referto, PR (`cervello/scrittura-umana.md`, misura con `node cervello/si-capisce.mjs`).
- Prima di costruire i controlli della fase 0 leggi `cervello/scorciatoie-note.md`.

## 2. Gli errori già successi, e il controllo che li ferma

Il 5/11 sono già successe queste cose. Ognuna ha un controllo nella fase 0, e il controllo è un programma, non un'occhiata.

| Errore già successo | Il controllo |
|---|---|
| La divisione in zone lasciava fuori 13 file su 1.011. | `copertura-prima`: ogni file del sito e ognuna delle 24 lenti hanno un proprietario prima di partire. |
| Tre sessioni su dieci hanno messo file temporanei nel ramo, due hanno toccato file di altre. | `guardia-ramo`: un ramo figlio può cambiare un solo file, il suo referto. |
| 76 difetti su circa 500 erano doppioni. | Il confronto col registro e fra le sessioni, **prima** della verifica. |
| Il limite settimanale ha fermato il lavoro alle 19:25 del 4/11. | Ogni sessione salva il referto a pezzi; si parte con 5 sessioni, non con 12. |
| Una prova legata all'ora vera è diventata rossa da sola. | Le prove con le date usano un orologio finto, mai l'ora di oggi. |

## 3. Fase 0 — la preparazione (tu, prima di aprire qualunque sessione)

**3.1 Lo stato di partenza.** Conta il registro `MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json` (campo `problemi`): voci totali, per `stato`, gli aperti per gravità e quanti aperti sono falle riservate. Al 5/11 sera erano 2.724 voci, 534 aperte (5 bloccanti, 69 gravi, 460 minori), di cui 54 riservate. Se i tuoi numeri sono diversi, valgono i tuoi: scrivi da dove vengono.

**3.2 Il codice.** Lancia `node cervello/collega-marketplace.mjs`. Scrivi il commit di `main` del sito: è la **BASE_SITO**, e tutte le sessioni analizzano quel commit e nessun altro. Il 5/11 sera era `db5164c5`, ma il sito può essere andato avanti.

**3.3 Le date.** Il referto finale si chiamerà `consegne/audit/<data>-radiografia.md` e il grezzo `consegne/audit/<data>-radiografia-marketplace-raw.json`, dove `<data>` è il giorno in cui li scrivi. Se per quella data esiste già uno dei due file, non sovrascriverlo: fermati e chiedi a Nicola.

**3.4 La cartella di lavoro.** Creala in `consegne/audit/<data di oggi>-radiografia-12-sessioni/`, con dentro:
- `LEGGIMI.md`: le regole per le sessioni figlie, tutte quelle del passo 5, scritte per intero.
- `schede/S01.md` … `schede/S12.md`: per ogni sessione cosa guarda, le lenti, le domande guida, cosa NON guarda perché è di un'altra sessione, e la mappa dei file di partenza (passo 4).
- `registro-compatto.txt`: una riga per voce del registro, con indice, stato, gravità, dimensione, file e titolo. Le sessioni la usano per cercare solo il nuovo.
- `da-ricontrollare.txt`: le voci aperte non riservate, per S01, una per riga con indice, gravità, file e titolo.
- `mappa-file.txt`: ogni file del sito al commit BASE_SITO (`git ls-files`), con la sessione o le sessioni che devono leggerlo. Ogni file ha almeno un proprietario. I test vanno a S12 oltre che alla sessione del loro tema. `docs/` va alla sessione del tema, e il resto a S12.
- `sessioni.json`: per ogni sessione l'id, il ramo, l'ondata e lo stato.
- `diario-della-sorveglianza.txt`: una riga per ogni controllo, con l'ora.
- `controlli.mjs`: i quattro controlli del passo 3.5.

**3.5 I controlli di macchina.** Scrivili prima di aprire le sessioni, e prova ognuno su un caso che deve fallire.
- `copertura-prima`: le 24 lenti di `cervello/dimensioni-radiografia.json` (casa `marketplace`) hanno almeno una sessione, e ogni file di `mappa-file.txt` ha almeno un proprietario. La prova: togli una lente o un file e il controllo diventa rosso.
- `guardia-ramo <ramo> <SNN>`: `git diff --name-only <commit base dell'AD>..origin/<ramo>` contiene solo `consegne/audit/<cartella>/referti/SNN.json`. La prova: un ramo finto con un file in più deve diventare rosso.
- `valida-referto <file>`: il formato del passo 5.6. Ogni `dimensione` è una delle 24 lenti, ogni `severita` è bloccante, grave o minore. Ogni `file:riga` esiste al commit BASE_SITO e la riga sta dentro il file. Ogni grave o bloccante ha `prova_eseguita: true`. Ogni scheda riservata non ha dettagli. La prova: un referto con una riga inesistente e un grave senza prova deve diventare rosso.
- `copertura-dopo`: l'unione dei file dichiarati letti nei referti, confrontata con `mappa-file.txt`. Restituisce l'elenco dei file che non ha letto nessuno.

**3.6 Pubblica la fase 0.** Fai commit e push sul tuo ramo: le sessioni figlie partono da quel commit. Poi apri subito la PR come **bozza**, verso `main`, con un titolo detto a voce e i quattro blocchi. Si completa alla fine. Chiama `subscribe_pr_activity` sulla PR.

**3.7 La rete per S11.** Le sessioni figlie ereditano la rete di questa sessione, quindi va fatto prima di creare S11. Chiama `get_environment` e segui le sue regole per proporre l'host `mycity-marketplace.com`, più `www.mycity-marketplace.com` se il sito ci rimanda. Nicola approva la richiesta. Se dice no, S11 lavora su un server locale e sui registri di Vercel, e lo dichiara.

## 4. Le 12 sessioni

Ogni sessione segue **una cosa** attraverso tutto il sito: non una cartella di file. La radiografia del 5/11 era divisa per file, e così ogni file è stato letto. Questa è divisa per cosa può rompersi, così trova quello che la prima non ha visto.

| Sessione | Ondata | Cosa guarda | Lenti |
|---|---|---|---|
| S01 · Ricontrollo dei difetti aperti | 1 | Le voci di `da-ricontrollare.txt`: sono ancora vere al commit BASE_SITO? | tutte |
| S02 · Il giro dei contanti | 2 | Un euro dal prezzo al bonifico del lunedì al negozio | `pagamenti-stripe`, `qa-flussi` |
| S03 · La carta e Stripe | 1 | Tutto quello che si accende col pagamento con carta | `pagamenti-stripe` |
| S04 · L'attaccante | 2 | Chi prova a vedere o cambiare cose non sue | `sicurezza-auth`, `ai-endpoints` |
| S05 · Il database | 2 | Regole di accesso, aggiornamenti in attesa, dati veri che non tornano | `rls-database` |
| S06 · Il viaggio dell'ordine | 1 | Dal carrello alla porta di casa, con le date e la consegna veloce | `qa-flussi`, `api-backend` |
| S07 · Il negozio | 2 | Dall'iscrizione alla vetrina ai guadagni, e le otto regole di MyCity | `frontend-ux`, `qa-flussi` |
| S08 · La cabina di Nicola e gli avvisi | 2 | Pagine admin, avvisi, email, notifiche, lavori a orario, numeri mostrati | `api-backend`, `dati-analytics` |
| S09 · Privacy e leggi | 2 | Dati personali, consensi, consumatore, marketplace, documenti fiscali | `privacy-legale` |
| S10 · L'aspetto | 1 | Tutto quello che si vede, su telefono e computer | le 11 del design e `accessibilita` |
| S11 · Il sito vero, dal vivo | 1 | Il sito pubblicato, la velocità vera, gli errori veri | `performance`, `deploy-sre`, `mobile-pwa`, `performance-percepita` |
| S12 · Il codice dentro | 2 | Struttura, prove automatiche, librerie, intelligenza artificiale | `architettura`, `ai-endpoints` |

Le domande guida, da scrivere per intero nelle schede:

- **S01.** Per ogni voce: il difetto, così com'è scritto nel titolo, c'è ancora? Esiti: `ancora_vero`, `non_piu_vero` (con la riga di codice o la prova che lo dimostra), `cambiato` (c'è ancora, ma in un'altra forma: cosa è cambiato), `non_verificabile` (perché). Le 54 riservate si saltano e si contano a parte. S01 non cerca difetti nuovi: quelli che vede strada facendo vanno in `difetti` con `perimetro_altrui`.
- **S02.** Segui un euro: prezzo a catalogo, carrello, totale, ordine in contanti, incasso del fattorino, riquadro della cassa, commissione, bonifico del lunedì, «segnato come fatto», pagina Guadagni del negozio. Poi i casi storti: rimborso dopo il lunedì, reso parziale, ordine annullato a metà, centesimi e arrotondamenti, doppio clic, due schede aperte, i 14 giorni per il rimborso, le ricevute. E la regola di `CONTESTO_BUSINESS.md`: il negozio non paga una percentuale su quello che già vendeva.
- **S03.** Collegamento dei negozi a Stripe, addebiti e trasferimenti, commissione della piattaforma, firma e ordine dei messaggi di Stripe, idempotenza, rimborsi parziali, contestazioni, bonifici automatici, autenticazione forte del cliente, chiavi di prova e chiavi vere, l'interruttore che accende la carta e cosa succede il primo giorno dopo. Stripe solo in lettura, se c'è: mai creare, rimborsare o cambiare niente.
- **S04.** Quattro persone: un estraneo, un cliente, un negozio, un fattorino, più chi finge di essere admin. Per ogni rotta dell'API: chi può chiamarla, con quali dati altrui. Poi segreti nel codice che arriva al browser, contenuti scritti dagli utenti (descrizioni, recensioni, messaggi), indirizzi web scaricati dal server, caricamento file, limiti di frequenza, abuso degli strumenti di intelligenza artificiale e dei loro costi. Le prove solo su copie. Tutto ciò che è una falla aperta è riservato.
- **S05.** Le regole di accesso di ogni tabella e chi le aggira (funzioni che girano con permessi alti), le migrazioni in ordine e coerenti, gli aggiornamenti non ancora applicati in produzione provati su una copia ferma dove è ferma la produzione, vincoli e integrità, indici, avvisi di Supabase. Sul database vero solo letture e conteggi, mai dati personali.
- **S06.** Carrello, cassa, fascia oraria, stati dell'ordine e chi li cambia, accettazione del negozio, fattorino, consegna, chiusura. Le date: mezzanotte, cambio dell'ora (ultimo 25/10, prossimo 28/3), festivi, orari del negozio. La consegna veloce, che il 5/11 era rimasta fuori. Annullamenti in ogni stato. Due clienti sull'ultimo pezzo.
- **S07.** Candidatura, verifica del negozio, vetrina, catalogo (anche gli strumenti di intelligenza artificiale e l'importazione), ordini lato negozio, Guadagni, aiuto. E se il codice rispetta le otto regole di `CONTESTO_BUSINESS.md`: i clienti restano del negozio, niente app nuova da imparare, il negoziante lavora su WhatsApp con l'anteprima da approvare, il primo risultato si vede in 2-4 settimane.
- **S08.** Le pagine admin, l'avviso del nuovo ordine (la promessa è entro 5 minuti), ognuno degli 11 lavori a orario di `vercel.json` (orario, chi può lanciarlo, cosa succede se gira due volte o se fallisce), le email (testi, mittente, dominio), le notifiche, i numeri che le pagine mostrano rispetto a quelli del database, gli eventi di PostHog.
- **S09.** Cosa raccoglie davvero il codice rispetto a cosa dicono informativa e cookie, banner prima del tracciamento, conservazione e cancellazione, esportazione dei dati, Codice del Consumo (informazioni prima dell'acquisto, recesso, prezzi), obblighi del regolamento europeo sui marketplace (tracciabilità dei venditori, segnalazioni, punto di contatto), dichiarazione di accessibilità, documenti fiscali.
- **S10.** Le 11 lenti del design più l'accessibilità, con foto vere da un server locale su telefono e computer (Playwright è già installato). Il metro è `CHECKLIST-BRAND.md` e `BRIEF-CREATIVO.md`. L'ultima radiografia del design è dell'11/10 (`consegne/design/2026-10-11-radiografia-design.md`): cerca il nuovo rispetto a quella e al registro. Può usare il workflow `.claude/workflows/audit-design.js`.
- **S11.** Il sito pubblicato nel browser, se la rete lo permette: ogni pagina pubblica, la velocità vera, gli errori della console, i link rotti, le intestazioni di sicurezza, robots e sitemap, l'app installabile. Da Vercel solo in lettura: errori e registri degli ultimi 14 giorni, rilasci, i **nomi** delle variabili confrontati con quelle che il codice pretende (mai i valori), l'esito dei lavori a orario. Mai un ordine, mai un modulo inviato, mai un accesso con un account vero.
- **S12.** Struttura del codice, pezzi doppi, codice mai usato, dipendenze circolari. Le prove automatiche: lancia `npm run verify` sul commit BASE_SITO, trova le prove che non possono fallire e i percorsi dei soldi senza prove. Le librerie: vulnerabilità note, versioni vecchie, licenze. TypeScript: `any` e controlli spenti. L'intelligenza artificiale: modelli ritirati, tetti di spesa, cosa succede quando il fornitore non risponde.

## 5. Le regole per ogni sessione figlia

Vanno in `LEGGIMI.md` per intero. Ogni sessione le legge prima di fare il piano.

**5.1 Chi sei.** Sei la sessione SNN della radiografia in 12 sessioni. Non sei l'AD: non leggere `cervello/MANUALE-AD.md`. Valgono `CLAUDE.md` e queste regole. Nessuno risponde alle tue domande mentre lavori: decidi dentro queste regole e scrivi i dubbi in `domande_per_nicola`.

**5.2 Il piano.** Parti in modalità piano. Il piano dice:
- il perimetro: i flussi e i file che leggerai, presi dalla tua scheda;
- le prove che lancerai, e su quale copia;
- quanti subagenti userai (tetto 12, S01 fino a 30, e il motivo se ne chiedi di più);
- cosa NON coprirai, e perché;
- ogni quanto salvi il referto.

In modalità piano puoi solo leggere: il codice del sito lo scarichi **dopo** l'approvazione, come primo passo. Il piano si basa sulla tua scheda e sulla mappa dei file. Se un comando ti viene negato, non insistere.

**5.3 Il codice.** Dopo l'approvazione chiama `add_repo` per `NicolaeRotaru/mycity` in lettura, poi `node cervello/collega-marketplace.mjs`. Se non funziona, usa il comando di clonazione che ti dà `add_repo`. Poi `git checkout <BASE_SITO>`. Sul repo del sito: mai un commit, un ramo o un push.

**5.4 Un solo file.** Nel tuo ramo cambi un solo file: `consegne/audit/<cartella>/referti/SNN.json`. I file di prova, le copie, le foto e gli appunti stanno nel tuo scratchpad. Salva e spingi il referto ogni 10 difetti o ogni ora, quello che arriva prima, con `"finita": false`. Così uno stop per i limiti non fa perdere niente.

**5.5 Solo il nuovo.** Prima di scrivere un difetto, cercalo in `registro-compatto.txt` per file e per parole del titolo. Se c'è ed è aperto, non è nuovo. Se c'è ma risulta chiuso o riparato, ed è tornato, è una regressione: scrivilo, con `gia_noto` che cita l'indice della voce.

**5.6 Il formato del referto.**
```json
{
  "sessione": "S03",
  "base_sito": "<commit>",
  "aggiornato": "AAAA-MM-GG HH:MM",
  "finita": false,
  "copertura": {
    "file_letti_interi": ["…"],
    "file_letti_in_parte": [{ "file": "…", "righe": "120-180" }],
    "non_guardato": [{ "cosa": "…", "perche": "…" }]
  },
  "difetti": [{
    "id": "S03-001",
    "dimensione": "una delle 24 lenti",
    "titolo": "come lo diresti a voce",
    "severita": "bloccante | grave | minore",
    "file": "percorso:riga",
    "descrizione": "cosa succede, con le righe di codice",
    "impatto": "un esempio con giorno, negozio, cifra",
    "fix": "la correzione consigliata",
    "causa_radice": "perché esiste",
    "prova": "il comando o i passi",
    "prova_tipo": "comando | lettura-codice | umano",
    "prova_eseguita": true,
    "esito_prova": "cosa è uscito",
    "verificato": true,
    "verificato_da": "chi ha provato a smentirlo e cosa ha detto",
    "gia_noto": null,
    "perimetro_altrui": null,
    "riservato": false
  }],
  "ricontrolli": [{ "indice": 123, "esito": "ancora_vero | non_piu_vero | cambiato | non_verificabile", "prova": "…", "nota": "…" }],
  "domande_per_nicola": [],
  "conto": { "subagenti": 0, "nota": "" }
}
```
`ricontrolli` lo compila solo S01.

**5.7 La verifica dentro la sessione.** Chi trova un difetto non lo conferma. Ogni difetto passa da un subagente diverso, del tipo `qa`, che ha il compito di smentirlo e rilancia la prova. Se c'è un dubbio, il difetto si scarta. I gravi e i bloccanti passano anche da una seconda lente, che ne giudica il peso. Le prove con date e orari usano un orologio finto.

**5.8 Fuori dal tuo perimetro.** Se vedi un difetto che appartiene a un'altra sessione, scrivilo lo stesso con `perimetro_altrui: "SNN"`. Non lo approfondisci.

**5.9 Le falle riservate.** Una falla di sicurezza aperta va nel referto con `riservato: true`, il titolo generico, `file: "(nel referto privato)"` e niente descrizione. I dettagli li scrivi solo nel messaggio finale della sessione.

**5.10 Quando hai finito.** Spingi il referto con `"finita": true`. Il tuo ultimo messaggio dice: quanti difetti per gravità, quanti ricontrolli per esito (solo S01), il commit finale, cosa non hai coperto, e i dettagli delle falle riservate. Manda lo stesso riassunto, **senza** i dettagli riservati, alla sessione dell'AD `<id di questa sessione>` con `send_message`.

## 6. Fase 1 e fase 3 — aprire le sessioni e sorvegliarle

**6.1 Aprire.** Per ogni sessione dell'ondata chiama `create_session` con:
- `title`: «Radiografia SNN — <nome>»;
- `permission_mode`: `"plan"`;
- `source_url`: `https://github.com/NicolaeRotaru/ad-mycity`;
- `source_revision`: il tuo ramo, al commit della fase 0;
- `outcome_branch`: `<il tuo ramo>-rNN`;
- `tags`: `["radiografia-12-sessioni"]`;
- `prompt`: breve, che rimanda alle regole. Per esempio: «Sei la sessione SNN della radiografia in 12 sessioni. Leggi `consegne/audit/<cartella>/LEGGIMI.md` e la tua scheda `schede/SNN.md`. Sei in modalità piano: proponi il piano come chiede il punto 5.2 e aspetta l'approvazione. La sessione dell'AD è `<id>`.»

Il tuo id lo trovi con `get_session` senza argomenti. Scrivi ogni sessione in `sessioni.json` e manda a Nicola l'elenco con il link di ognuna.

**6.2 I piani.** Programma con `send_later` un controllo dopo circa 15 minuti. Leggi ogni piano con `list_events` (la chiamata di uscita dalla modalità piano). Confrontalo con la scheda: perimetro, prove su copie, tetto dei subagenti, sola lettura, un solo file nel ramo, riservato, salvataggi a pezzi. Poi scrivi a Nicola, per ogni sessione, una di due cose:
- «✅ approva la SNN»;
- «✏️ la SNN va corretta: …», con il testo esatto da scrivere nella sessione come risposta al piano.

Ricordagli di scegliere, quando approva, l'opzione che lascia lavorare la sessione da sola.

**6.3 La sorveglianza.** Un controllo ogni 30 minuti con `send_later`. Mai `sleep`, mai giri di attesa. A ogni controllo, per ogni sessione attiva:
- `get_session` (lo stato) e `list_events` (gli ultimi messaggi);
- `git fetch` del suo ramo, poi `guardia-ramo` e `valida-referto` sul referto parziale;
- su `NicolaeRotaru/mycity`, nessun ramo o commit nuovo delle sessioni (`list_branches`);
- una riga nel diario: ora, sessione, cosa hai visto, cosa hai fatto.

Se una sessione esce dal perimetro, cambia altri file o ne lascia di temporanei, mandale una correzione con `send_message`. Se tenta una scrittura sul mondo vero, fermala con `interrupt_session` e avvisa Nicola subito. Se si ferma per i limiti, scrivilo, avvisa Nicola, e quando si può riprendere mandale «riprendi dal referto salvato al commit …».

**6.4 Fine ondata.** Quando tutte le sessioni dell'ondata hanno `"finita": true`, leggi i dettagli riservati dai loro messaggi finali e copiali nel tuo scratchpad, mai nel repo. Poi scrivi a Nicola un riassunto breve: quanti difetti per sessione e per gravità, cosa è andato storto, il conto. Per la prima ondata aspetta il suo «via la seconda».

## 7. Fase 4 — il controllo finale, cioè tu

L'ordine conta: prima la macchina, poi gli agenti.

**7.1 La macchina, a zero agenti.** `guardia-ramo` e `valida-referto` su tutti i 12 rami: un ramo rosso non entra finché non è sistemato. Poi raccogli tutti i difetti in un file solo e lancia `copertura-dopo`.

**7.2 I doppioni, prima della verifica.** Prima un programma: stesso file a meno di 10 righe e titoli simili, contro il registro e fra le sessioni. Poi un agente leggero (`model: 'sonnet'`) unisce i doppioni scritti con parole diverse. Di ogni gruppo tieni la versione con la prova più forte, e scrivi da chi altro è stato visto. Quelli già nel registro e ancora aperti escono.

**7.3 La verifica indipendente.** Un workflow con verificatori `agentType: 'qa'` che non hanno mai visto quei difetti, con il mandato di smentirli. Ognuno rilancia la prova sulla copia.
- **Minori:** un verificatore per gruppo, al massimo 6 difetti dello stesso file o flusso. Nel dubbio si scarta.
- **Gravi e bloccanti:** uno per verificatore, con due lenti diverse (è vero e si riproduce? quanto pesa davvero?). Si verificano per primi.
- **Le chiusure di S01** (`non_piu_vero`): ognuna passa da un verificatore. Chiudere un difetto vero lo nasconde, quindi qui nel dubbio **resta aperto**.
- **Le falle riservate:** stessa regola, ma dentro il tuo scratchpad.
- Qui girano due agenti alla volta: conta i turni prima di lanciare.

**7.4 Il critico di completezza.** Un agente legge `copertura-dopo`, le lenti, il `non_guardato` di ogni sessione e i cinque buchi dichiarati il 5/11 (il sito vero nel browser, Stripe, l'aspetto, la consegna veloce, i difetti vecchi mai ricontrollati). Elenca cosa manca ancora. Se un buco conta, fai un terzo giro piccolo, al massimo 4 agenti, poi ti fermi: quello che resta va in «Cosa non ho verificato». Non c'è un quarto giro senza Nicola.

**7.5 Scrivere.**
- **Il grezzo** `consegne/audit/<data>-radiografia-marketplace-raw.json`, nella stessa forma di `consegne/audit/2026-11-05-radiografia-marketplace-raw.json`: `data`, `tipo: "radiografia-marketplace"`, `fonte`, `codice_analizzato`, `totale`, `bloccanti`, `gravi`, `minori` e `dimensioni: [{ dimensione, findings }]`. Ogni difetto usa i campi di quel file, con `fonte_radiografia: "radiografia <data> · SNN"` (e «vista anche da …») e `giro`.
- **Il registro.** Conta il registro prima, lancia `node cervello/radiografia-marketplace-digest.mjs`, conta dopo. Le voci nuove devono essere esattamente quelle del grezzo, e le voci vecchie devono avere lo stesso stato di prima. Se non torna, fermati.
- **Le chiusure di S01**, solo quelle confermate dalla verifica: un piccolo programma mette `stato: "chiuso"`, `chiuso_il`, `chiuso_da: "radiografia <data> · S01, verificato"` e la prova nella nota. Gli `ancora_vero` prendono un campo `riverifica_<data>` con il commit. Nessuna voce si cancella.
- **Il referto** `consegne/audit/<data>-radiografia.md`, con l'intestazione come quello del 5/11 (data con l'ora, `codice: … @ <BASE_SITO>`, `fonte_raw`). Prima le quattro risposte (In parole semplici · Cosa cambia per te · Cosa devi fare · Cosa non ho verificato), con un esempio vero. Poi i Dettagli tecnici: come è stata fatta, le 12 sessioni, i run, la copertura, il conto. Poi l'elenco completo dei bloccanti e dei gravi, e i minori per area. Le falle riservate solo col numero e il titolo generico. `node cervello/si-capisce.mjs` deve passare.
- **La memoria:** `STATO.md` (numeri chiave), `LAVORO-APERTO.md`, `AZIONI-IN-ATTESA.md` per quello che solo Nicola può fare, `DECISIONI.md` per la rete aperta a S11, e una riga ESITO con `node cervello/chiusura-loop.mjs registra …`.

**7.6 Prima di chiudere la PR.** Lancia quello che lancia la CI: `node cervello/test-cervello.mjs` e `node cervello/cancello-lotto.mjs`. Poi `node cervello/coerenza-fatti.mjs` e `node cervello/radiografia-in-corsa.mjs`. Se qualcosa è rosso per colpa tua, lo sistemi. Se è rosso per altro, lo scrivi nella PR e non lo nascondi.

**7.7 La PR.** Togli la bozza. Titolo detto a voce. Il corpo apre con le quattro risposte, poi i dettagli tecnici. Mai unire.

**7.8 L'ultimo messaggio a Nicola.** Le quattro risposte, il link della PR, poi il referto privato delle falle riservate, solo in chat. In fondo, offrigli il controllo a sorpresa: tre difetti scelti a caso, con la prova lanciata davanti a lui.

## 8. Quando fermarti e chiedere a Nicola, subito

- Una sessione ha scritto, o ha provato a scrivere, sul mondo vero.
- Un difetto bloccante tocca soldi veri o la legge oggi: non aspettare la fine.
- Il conteggio del registro prima e dopo non torna.
- Una data è già occupata da un referto (passo 3.3).
- Il limite settimanale ferma più di una sessione.
- Servirebbe un quarto giro.

## 9. Fatto vuol dire

- 12 referti con `"finita": true`, tutti verdi a `guardia-ramo` e `valida-referto`.
- Ogni difetto nuovo verificato da chi non l'ha trovato, e ogni grave e bloccante con una prova lanciata.
- Ogni chiusura di S01 confermata da un verificatore.
- `copertura-dopo` con l'elenco dei file non letti, scritto nel referto, anche se è vuoto.
- Il registro aggiornato, con il conteggio che torna.
- Il referto che passa `si-capisce`.
- Una sola PR, pronta, con la CI vista.
- Il referto privato dato a Nicola in chat.
- Il conto dei token nel referto.
