---
data: 2026-10-17 18:18
tipo: lotto-riparazione-sito
richiesta: «Voglio che inizi a risolvere i primi problemi del markeplace» (16/10) · il 17/10 «Semplifica», poi «Finisci e chiudi»
codice: NicolaeRotaru/mycity, ramo ccr-60372c68-p3gpjz, richiesta di unione #258 · base 775b62a, poi main unito
memoria: richieste di unione ad-mycity #883 (unita) e #885
---

# La prima ondata del sito: 21 problemi seri riparati, e il rimborso dei contanti fatto a mano

**In due righe.** La richiesta #258 ripara il codice di 21 problemi seri del sito: 10 su 21 del tutto, 11 su 21 nella parte che tocca a me. Il rimborso di chi paga in contanti, che a ogni giro faceva nascere difetti nuovi, il 17/10 l'hai fatto semplificare: adesso il bonifico lo fai tu a mano, e il sito non tiene nessun IBAN.

## In parole semplici

Hai chiesto di cominciare dalla prima delle 12 ondate. La prima ondata metteva insieme i 5 gruppi di problemi più affollati: 32 problemi, tutti gravi o bloccanti.

- **11 su 32 li ho lasciati fuori.** Sono falle di sicurezza i cui dettagli stanno solo nel referto privato: il sito è un deposito pubblico, e ripararle lì avrebbe spiegato a tutti come sfruttarle.
- **1 su 32 è una tua decisione:** la consegna in 30-60 minuti promessa su ogni pagina, mentre in produzione non c'è un fattorino approvato.
- **20 su 32 li ho riparati, più uno anticipato dalla quarta ondata:** la scheda prodotto che la migrazione 161 avrebbe spento.

Un esempio concreto. Prima, se il fattorino confermava la consegna di un ordine in contanti prima dell'incasso, l'ordine restava sospeso e il fornaio non veniva mai pagato. Adesso la pagina del fattorino chiede l'incasso prima della consegna, e l'amministratore può registrare un incasso dichiarato dopo.

Riparare ha fatto nascere difetti nuovi. Per questo, dopo ogni giro, revisori diversi hanno riguardato ogni file toccato, e i difetti nati li ho fatti correggere. Sette riesami, sette giri di correzione. Quasi tutti i difetti nati stavano in un posto solo: il rimborso di chi ha pagato in contanti, con la lista dei bonifici e l'IBAN salvato. Il settimo riesame ne ha trovati ancora 15 lì dentro.

Il 17/10 hai scelto di semplificare, invece di fare un ottavo giro. Quando va rimborsato chi ha pagato in contanti, agli amministratori arriva un avviso con la cifra e l'ordine, e la stessa cosa arriva per email alla casella info. Tu chiedi l'IBAN al cliente per email e fai il bonifico. Il cliente riceve soldi, non credito MyCity. Tre squadre in fila hanno tolto le parti vecchie e riscritto i testi, ognuna ricollaudata da due collaudatori che non l'avevano scritta. Poi un collaudo finale su tutto: in corso, lo scrivo qui appena finisce.

## Cosa cambia per te

| Cosa | Prima | Adesso |
|---|---|---|
| Fattorino e contanti | chiudeva la consegna senza incasso, il negozio non veniva pagato | prima l'incasso, poi la consegna; senza foto sotto i 50 €, con una nota sopra |
| Reso o reclamo pagato in contanti | rimborsato d'ufficio in credito MyCity | un bonifico che fai tu: ti arriva l'avviso «💶 Bonifico di rimborso da fare», anche per email |
| IBAN del cliente | (non esisteva) | il sito non lo chiede e non lo tiene: il cliente lo scrive rispondendo alla tua email |
| Avvisi di Stripe | un errore del database diceva «tutto a posto» a Stripe | il sito risponde con un errore e Stripe riprova |
| Email di servizio | uscivano come pubblicità, con «annulla l'iscrizione» | conferme, rimborsi e avvisi escono puliti |
| Intelligenza artificiale | poteva scrivere allergeni indovinati sopra quelli veri | non tocca mai le nove dichiarazioni di un alimento |
| Scheda prodotto | si sarebbe spenta con la migrazione 161 | prende il negozio dalla vista pubblica, regge anche dopo la 161 |
| Accesso | «Reinvia» sempre spento | si può rimandare l'email di conferma |
| Rilascio | la regola «Main» su GitHub aspettava un controllo inesistente | il controllo «Main» c'è, ed è verde sulla #258 |

**Come si usa l'avviso del bonifico.** L'avviso dice la cifra, l'ordine come lo vede il cliente (per esempio #A1B2C3) e l'email del cliente. Prendi l'IBAN solo da una risposta che arriva da quell'email. Nel bonifico scrivi la causale che l'avviso ti dà, «Rimborso MyCity ordine #A1B2C3». L'avviso arriva a ogni amministratore: prima di pagare cerca quella causale nei movimenti del conto, e se c'è il bonifico è già fatto.

**Una scoperta che cambia l'ordine dei lavori.** Non solo la scheda prodotto: anche carrello, cassa, pagine degli ordini e del fattorino leggono il negozio dalla tabella dei profili. Dopo la 161 la cassa calcolerebbe la spedizione a tariffa fissa, e il fattorino perderebbe l'indirizzo dove ritirare. Finché non le riparo, la 161 resta ferma. È il prossimo lotto che ti propongo.

## Cosa devi fare

- **Prima di unire, controlla la casella info@mycity-marketplace.com.** Deve esistere e la devi leggere: lì arrivano la copia degli avvisi dei bonifici e le risposte dei clienti con l'IBAN.
- **Unire la #258.** Va subito in produzione: carta #206.
- **Subito dopo, la regola «Main» su GitHub:** è la carta #177. Poi i due passi su Supabase della carta #207. I passi esatti sono qui sotto, in «I passi dopo l'unione».
- **Dirmi se le tre regole che ho scelto per te vanno bene** (carta #208): contanti senza foto, il credito di un ordine pagato in parte col credito, quanto tenere l'avviso con l'email del cliente.
- **Far rileggere a un legale** i testi nuovi sul rimborso: l'email al cliente, l'informativa privacy, i Termini al punto 7, la FAQ.
- **Non applicare ancora la 161, né le migrazioni in blocco.**

## Cosa non ho verificato

- **Il sito vero e Stripe vero.** Tutte le prove girano su un database ricostruito dalle 157 migrazioni del codice e su finti Supabase e Stripe. La produzione è indietro di circa 48 migrazioni: il codice è scritto per reggere anche così, ma non l'ho visto girare lì.
- **Le email vere.** Né il cambio password da un altro telefono, né l'avviso del bonifico nella casella info: li ho provati con servizi finti.
- **Che la casella info esista.** Il sito ci scrive, ma non so se qualcuno la legge.
- **La regola «Main» accesa.** Il controllo c'è e passa; che blocchi davvero una richiesta rossa si vede solo quando la accendi.
- **Un riesame dopo la semplificazione.** Come hai scelto tu, non c'è stato un ottavo riesame. Dei 145 file toccati, 111 sono identici a come li ha visti l'ultimo riesame. Gli altri 34 sono cambiati dopo: li hanno guardati il collaudo di ogni squadra e il collaudo finale, non un revisore del mestiere.
- **I testi legali.** Li ho scritti io e li hanno controllati le prove, non un avvocato.

---

## Dettagli tecnici

### La prima ondata

Piano: `consegne/audit/2026-10-15-0651-pacchetti-sito-gravi-120difetti.json` (`node cervello/pacchetti-lotto.mjs --sito --gravi --scrivi`): 120 difetti, 57 pacchetti, 12 ondate. Ondata 1: `lib/stripe/payout.ts` (parte 1, 12) · senza file (11 falle private) · `deploy-dopo-ci.yml` (4) · migrazione 126 (3) · `app/sign-in/page.tsx` (2).

| Squadra | Difetti | Esito | Giri di collaudo | Bocciature |
|---|---|---|---:|---:|
| vetrina | R3 (anticipato), R55 | R3 riparato · R55 parziale (126 e dati d'impresa) | 2 | 1 |
| rimborsi | R71, R76, R82, R84, R25 | 4 riparati · R71: semplificato il 17/10, bonifico a mano | 4 + semplificazione | 4 |
| avvisi Stripe | R77, R81, R85 | R85 riparato · R77 parziale (seconda chiave) · R81 parziale | 3 | 3 |
| contanti ed email | R33, R24, R70 | R24 riparato · R33 parziale (163) · R70 parziale (Stryker) | 1 | 0 |
| rilascio | R57, R53, K45, K42 | parziali: regola «Main», Session pooler, segreti Vercel, riallineamento | 3 | 2 |
| AI | R36, R41 | riparati | 2 | 1 |
| accesso | R13, R43 | R43 riparato · R13 parziale (modelli email) · più 4 difetti del collaudo riparati | 2 | 1 |

Fuori: R1, R2, R7, R9, R10, R11, R12, R14, R15, R75, R83 (dettagli privati) · R66 (decisione).

### I difetti nati riparando, e come sono stati chiusi

| Giro | Difetti veri | Nati dal lotto | Correzione |
|---|---:|---:|---|
| riesame 1 (92 file) | 35 | 15 distinti (1 bloccante, 1 grave, 13 minori) | correzione 1: 6 squadre, promosse al primo collaudo |
| riesame 2 (58 file) | 33 | 18 (5 gravi, 13 minori) | correzione 2: 4 squadre, promosse al primo collaudo |
| note delle squadre | 38 | 17 (1 grave, 16 minori) | 5 già chiusi; il grave nella correzione 3; 11 nella correzione 4 |
| riesame 3 (37 file) | 23 | 16 (3 gravi, 13 minori) | correzione 3: 3 squadre, promosse al primo collaudo |
| riesame 4 | 38 | 21 (1 grave, 20 minori) | correzione 5: 4 squadre; quella dell'AI bocciata tre volte e rifatta da capo |
| riesame 5 | 25 | 20 (1 grave, 19 minori) | correzione 6 |
| riesame 6 (file dell'AI) | 11 | 6 minori | correzione 6: 5 squadre, una promossa al secondo collaudo |
| riesame 7 | 30 | 27 (2 gravi, 25 minori) | 12 nella correzione 7; i 15 dei bonifici tolti con la semplificazione |

Per i numeri: il 15/10 ti avevo scritto «20 nati» e poi «18 nati» per il primo riesame. Il conto giusto è 16 schede, cioè 15 difetti distinti: il bloccante l'avevano visto due revisori.

**La semplificazione del 17/10.** Specifica in 17 decisioni (D1-D17), tre squadre in fila sullo stesso ramo:
- **squadra 1, i soldi** (`refundOrder`, `decide`, `avanza`, `resolve`): un segno `bonifico:<centesimi>:<chiave>` sull'ordine, scritto insieme allo stato del pagamento; l'avviso agli amministratori una volta sola per chiave; il credito per ultimo; se un passo cade si torna indietro. Promossa al quinto collaudo;
- **squadra 2, le parti vecchie:** via la lista dei bonifici, l'IBAN salvato, la migrazione 162 e la cancellazione dell'account che aspettava (torna com'era a `775b62a`). Promossa al secondo collaudo;
- **squadra 3, i testi per il cliente:** pagina dell'ordine, modulo di reso, FAQ, Resi, Termini §7, informativa, impostazioni. Bocciata al terzo collaudo per un titolo che diceva «rimborsato» prima del bonifico: l'ho corretto io, con la prova portata dal collaudatore (`7d93d85`).

Unione nel ramo del sito: `2b50a31`. Collaudo finale, due collaudatori nuovi: lente A sui difetti vecchi R71, R84, R82, R76, R25 e sul doppio pagamento, lente B sul diff intero `65fa3f3..2b50a31`. Esito: in corso, lo scrivo qui appena finisce.

**Le scelte rimaste a te** (carta #208): D1, la parte di un ordine pagata col credito MyCity torna credito; D5, con l'account cancellato quel credito non torna a nessuno e l'avviso lo dice; D9, l'avviso con l'email resta finché non lo cancelli, senza una durata scritta. Altri due limiti dichiarati: se il sito cade a metà di un rimborso, la ripresa parte quando qualcuno rifà il passo dalla pagina; un database di prova che avesse già applicato la 162 va pulito a mano, solo lì.

**I difetti che c'erano già prima**, trovati dai riesami e dalle note: 77 schede nuove nel registro del sito, 21 gravi e 56 minori, dopo aver tolto i doppioni. Fra i gravi, tre pesano per il lancio: in produzione il bonifico al negozio fallisce perché il sito scrive una colonna che il database non ha ancora; il fattorino non riceve il compenso delle consegne pagate con carta; dopo un reclamo il negozio non viene più pagato per quell'ordine, anche quando ha ragione. Registro: `MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json`, 547 aperti dopo l'aggiunta (11 bloccanti, 130 gravi, 406 minori). Le schede della prima ondata si chiudono dopo l'unione, come vuole la regola del lotto.

### I passi dopo l'unione

**La casella dei contatti, prima di unire.** Controlla che `info@mycity-marketplace.com` riceva posta e che qualcuno la legga. Se il dominio dei contatti su Vercel (`NEXT_PUBLIC_CONTATTI_DOMINIO`) è un altro, la casella è `info@` di quel dominio.

**La regola «Main» su GitHub (carta #177).** GitHub → mycity → Settings → Rules → Rulesets → «Main». In «Target branches» premi «Add target» e scegli «Include default branch». Lascia «Require status checks to pass» con il controllo «Main». In «Enforcement status» scegli «Active» e salva. La lista di chi può scavalcarla oggi è vuota: con la CI rossa non potrai unire nemmeno tu. Se vuoi tenerti l'ultima parola (la strada B della #177), aggiungi te stesso in «Bypass list». Per controllare: `gh api repos/NicolaeRotaru/mycity/rulesets/16879481 | node scripts/controlla-regola-main.mjs` deve dire ✅. Poi apri una richiesta con una prova rossa e guarda che il pulsante per unire resti bloccato.

**I due modelli email su Supabase (carta #207).** Prima, in Authentication → URL Configuration, controlla che «Site URL» sia l'indirizzo vero del sito, con il «www». Poi Authentication → Emails → Templates:
- in «Reset Password» il collegamento diventa `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`;
- in «Confirm signup» diventa `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next={{ .RedirectTo }}`.

Poi la prova vera: chiedi la password dal computer e apri l'email dal telefono.

**Il file da lanciare nel database (carta #207).** Solo dopo che la #258 è online: apri nell'editor SQL di Supabase `migrations/163_la_consegna_in_contanti_si_chiude_dopo_l_incasso.sql` e lancialo. È una funzione sola, non dipende dalle 48 migrazioni che mancano, e si può lanciare due volte senza danni. Prima della pubblicazione no: la pagina vecchia del fattorino mostrerebbe «Verifica fallita». È l'unica migrazione nuova della #258.

### Il cancello

In corso sul commit `2b50a31`: prove del database, migrazioni e compilazione verdi; le prove automatiche girano ancora.

### Il metodo, e quanto è costato

Ogni squadra in una copia sua del repository (`git worktree`), con la scheda completa della radiografia dell'11/10. Collaudo: lente A «sa diventare rosso davvero?» (difetto ricreato nella variante scomoda, mutazione scelta dal collaudatore) e lente B «nasce rotto?» (diff intero, altri chiamanti, produzione senza migrazioni, suite intera). Riesami del perimetro con le lenti di `cervello/dimensioni-radiografia.json`, ogni difetto verificato da un secondo revisore che doveva smontarlo.

Più di 600 agenti in tre giorni. Solo dal quarto riesame in poi: 342 agenti e 64 milioni di token. Il costo l'ha fatto il giro che non convergeva: sette riesami, ognuno con 15-27 difetti nati, quasi tutti nei rimborsi dei contanti. La lezione è in DECISIONI del 17/10: quando due riesami di fila trovano difetti nati nello stesso posto, la domanda giusta è se semplificare, non un altro giro.
