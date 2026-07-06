---
tipo: organigramma
fonte: AD digitale
---

# 👥 AGENTI — L'organigramma digitale di MyCity

> I mansionari **operativi** vivono in `.claude/agents/` (li usa Claude Code per
> delegare). Questo file è la **mappa leggibile** per te: chi fa cosa, e con quali
> poteri. Modello mentale: **Amazon × eBay × Glovo** (vedi [[00-Index]]).

## Come funziona
L'**AD** (Claude Code, guidato da `CLAUDE.md`) riceve l'obiettivo, lo spezza e
**delega** ai senior giusti, poi sintetizza i risultati in una decisione per Nicola.
Ogni senior ha **solo gli strumenti che gli servono** (minimo privilegio) e rispetta
la regola d'oro 🟢🟡🔴.

<!-- AR-026: 120 senior (fonte di verità: i 42 file in .claude/agents/), inclusi i 2 gate creativi -->
## 🗂️ Organigramma per TEAM (120 senior + AD)

### 🆕 Espansione — 78 nuovi senior (Amazon × eBay × Glovo)

**💰 Motori di soldi & crescita (marketplace):**
- **retail-media** — Usa per il retail media network di MyCity — listing sponsorizzati, banner in home/categoria, aste sulle keyword interne, self-service per i venditori che vogliono comprare visibilità sul marketplace. (→ COMPRARE ads per MyCity su Meta/Google/TikTok = **ads-performance**; farsi trovare organicamente su Google/Maps = **seo**)
- **city-manager** — Usa per il conto economico di una città/zona — domanda vs offerta di negozi, densità e copertura, liquidità del marketplace a due lati, cold-start di una nuova zona, replica del modello Piacenza altrove. (→ acquisire singoli negozi = **vendite**; consegne/rider = **operations**/**rider-fleet**)
- **category-manager** — Usa per l'assortimento e il margine di UNA categoria di prodotto (gastronomia, fiori, casa, ecc. (→ retention dei negozi attivi = **account-negozi**; nuove verticali intere = **new-verticals**)
- **pricing-scientist** — Usa per il prezzo giusto — elasticità della domanda, willingness-to-pay, commissioni ai negozi, fee di consegna dinamica e soglie "spedizione gratis" ottimizzate con modelli, A/B test sui prezzi. (→ esperimenti di ricavo generali/upsell = **growth-monetizzazione**; margini/unit economics = **finanza**)
- **loyalty-membership** — Usa per il programma abbonamento/fidelizzazione ricorrente dei clienti — consegna inclusa, vantaggi membri, punti fedeltà, tasso di rinnovo, break-even del beneficio offerto. (→ email/carrelli/win-back = **crm-lifecycle**; leve di ricavo/pricing generali = **growth-monetizzazione**)
- **marketplace-payments** — Usa per il prodotto pagamenti del marketplace — metodi di pagamento e wallet, split payment tra MyCity e negozio, tempi/affidabilità dei payout ai negozi, authorization rate e costo di transazione, esperienza di checkout al momento di pagare. (→ riconciliazione incassi-payout/fatture = **contabilita**; sicurezza webhook/chiavi = **security**; chargeback = **dispute**)
- **seller-financing** — Usa per il credito dentro il marketplace — anticipi sul venduto (merchant cash advance) e micro-prestiti ai negozi, BNPL/rateizzazione lato cliente in checkout: rischio di credito, tasso di default, pricing del rischio, ROI del capitale prestato e come il finanziamento sblocca GMV e retention dei venditori. (→ finanza dell'azienda vs banche = **consulente-bancario**/**credito-impresa**; unit economics generali/cassa/riconciliazione = **finanza**; commissioni e fee di consegna = **pricing-scientist**; meccanica di checkout/metodi di pagamento/payout = **marketplace-payments**; contestazioni carta = **dispute**; frodi/verifica venditori sospetti = **trust-safety**)
- **new-verticals** — Usa per lanciare una NUOVA verticale o categoria di business da zero (grocery, farmacia, q-commerce, fiori) — business case 0-to-1, cold-start dell'offerta, primi negozi-ancora, modello operativo della verticale. (→ merchandising di una categoria esistente = **category-manager**; portare i negozi online = **onboarding-negozi**)
- **private-label** — Usa per l'assortimento a marchio proprio MyCity — bundle curati multi-negozio, servizi a marchio (gift card, abbonamenti, box stagionali), margine incrementale, rischio di cannibalizzazione dei venditori, posizionamento del private label.
- **procurement** — Usa per fornitori e acquisti — sourcing, gare/RFP tra fornitori di packaging, materiali, servizi e fornitori tech, condizioni contrattuali di acquisto, total cost of ownership, risparmi e diversificazione del parco fornitori. (→ contratti legali dei fornitori = **legale-contrattualista**; partner strategici tech = **partner-management**)
- **demand-forecasting** — Usa per la previsione della domanda del marketplace — quanto venderà ogni categoria/negozio/zona nei prossimi giorni, il rischio di rottura di stock o di spreco sul fresco, l'effetto di stagionalità e calendario sulla domanda. (→ eventi/meteo/trend esterni = **intelligence**; pipeline dati = **data-engineer**)
- **fp-and-a** — Usa per pianificazione finanziaria — budget, forecast, scostamenti actual vs plan, driver di business, modello economico a 12-36 mesi, sensitivity e allocazione del capitale tra iniziative. (→ margini/anomalie/riconciliazioni operative = **finanza**; raccolta capitali/banche = **cfo**)

**🛡️ Sicurezza, trust & rischio:**
- **fraud-risk** — Usa per il rischio frode transazionale del marketplace — scoring e prevenzione di carte rubate, resi/rimborsi falsi, account multipli e abuso di promo/coupon con regole di velocity e soglie precision/recall. (→ moderazione contenuti/venditori sospetti = **trust-safety**; chargeback/banca = **dispute**)
- **kyc-aml** — Usa per verifica identità dei venditori (KYC), antiriciclaggio (AML), titolarità effettiva, risk-based onboarding, screening liste (sanzioni/PEP) e segnalazioni di operazioni sospette. (→ sicurezza tecnica dati/RLS = **security**; frode transazionale = **fraud-risk**)
- **brand-protection** — Usa per la proprietà intellettuale sul marketplace — segnalazioni di contraffazione o uso non autorizzato di marchi dai titolari dei diritti, notice-and-takedown su listing abusivi, recidiva dei venditori, marchi/DOP-IGP citati senza titolo nelle schede prodotto. (→ registrazione/tutela legale del marchio MyCity = **avvocato-ip**; autenticità fisica del prodotto = **authentication-prodotti**)
- **authentication-prodotti** — Usa per l'autenticità e la qualità dichiarata dei prodotti (lusso, elettronica, food DOP/IGP, artigianale) — definisci il processo e i livelli di verifica, assegni o neghi il badge di autenticità, pesi il costo del controllo contro il premio di fiducia sul prezzo, tieni il tasso di contestazione per categoria/negozio. (→ IP/marchi = **brand-protection**/**avvocato-ip**; sicurezza alimentare = **food-safety**)
- **account-security** — Usa per la sicurezza degli account di clienti e negozi — furto di account (ATO/account takeover), robustezza di login e MFA, rilevamento accessi anomali, catene sospette (email/telefono/IBAN cambiati di fila), recupero di un account compromesso. (→ RLS/permessi/app-security = **security**; frode sui pagamenti = **fraud-risk**)
- **infosec-soc** — Usa per la difesa operativa della sicurezza — monitoraggio (SOC), risposta agli incidenti, gestione delle vulnerabilità, data breach e continuità operativa/disaster recovery. (→ RLS/webhook firmati/segreti nel codice = **security**; deploy/log di produzione = **devops-sre**)
- **dpo** — Usa per il governo formale della privacy — registro dei trattamenti, DPIA, diritti degli interessati (accesso/cancellazione/portabilità/opposizione), data breach notification, rapporti col Garante Privacy, accountability GDPR. (→ bozze contratti/consensi/TOS = **legale-privacy**; → falla tecnica/vulnerabilità/RLS/webhook = **security**)
- **enterprise-risk** — Usa per il rischio d'impresa nel suo complesso — mappa dei rischi (probabilità×impatto), coperture assicurative (RC, consegne, infortuni rider, cyber), gestione sinistri, piani di continuità operativa. (→ scelta broker/quotazioni = **broker-assicurativo**; sicurezza sul lavoro = **rspp**)
- **food-safety** — Usa per la sicurezza alimentare operativa dei negozi food — HACCP sul campo, catena del freddo, packaging conforme, tempi/temperature nelle consegne food, formazione dei negozianti. (→ note legali HACCP/contratti = **legale-privacy**; qualità consegna in generale = **operations**)
- **seller-standards** — Usa per gli standard di conformità dei venditori — health score del negozio (puntualità, difettosità, contestazioni), soglie, avvisi, sospensioni e percorso di rientro. (→ retention/crescita dei negozi = **account-negozi**; frode = **fraud-risk**/**trust-safety**)
- **internal-audit** — Usa per il controllo interno indipendente sui processi di MyCity — audit trail delle decisioni, segregazione dei compiti (chi propone/chi esegue/chi firma), test dei controlli chiave (payout, KYC negozi, guardiani automatici), conformità dei processi, raccomandazioni di rimedio con owner e scadenza. (→ revisione del bilancio = **revisore-conti**; anomalie di cassa = **finanza**)

**🎛️ Potere, controllo & governo:**
- **chief-of-staff** — Usa per governare l'esecuzione multi-reparto dell'AD — percorso critico delle iniziative multi-mese, dipendenze cross-reparto, cadenze (mattino/mezzogiorno/sera/settimana/mese) e follow-up di ogni decisione presa perché nessuna si areni in coda. (→ roadmap di prodotto/feature = **product-manager**; coordinamento consegne = **operations**)
- **corporate-strategy** — Usa per la strategia d'impresa nel suo complesso — dove giocare e dove no, il moat competitivo difendibile, le opportunità di partnership strategiche e (in prospettiva) M&A, gli scenari a 2-3 mosse, l'allocazione strategica di capitale e attenzione, gli effetti di rete. (→ intelligence competitiva/mercato = **intelligence**; leve di ricavo = **growth-monetizzazione**)
- **revops** — Usa per revenue operations — funnel end-to-end marketing→vendite→success, definizioni condivise dei KPI commerciali, tooling/CRM, forecast di pipeline, hand-off puliti tra reparti. (→ strategia di acquisizione = **marketing**; pipeline nuovi negozi = **vendite**)
- **sales-ops** — Usa per le operazioni di vendita — zone/territori di prospezione, quote e target, fasi del processo/pipeline, piano incentivi, igiene del CRM/pipeline, reportistica e forecast di vendita. (→ pitch e trattativa negozi = **vendite**; funnel cross-reparto = **revops**)
- **bi-lead** — Usa per i cruscotti di sistema e l'unica verità dei numeri — definizioni dei KPI, north-star e guardrail, dashboard ricorrenti, self-service analytics, coerenza cross-funzionale del dato. (→ analisi/query su richiesta = **analista**; pipeline/eventi/tracking = **data-engineer**)
- **marketplace-policy** — Usa per le regole del marketplace — cosa si può vendere (categorie ammesse/vietate/ristrette), codice di condotta di venditori e clienti, scala delle sanzioni e processo di appello. (→ enforcement frode/moderazione = **trust-safety**; standard venditori = **seller-standards**)
- **people-talent** — Usa per persone e cultura di MyCity — assunzioni (umane e nuovi agenti), organigramma, competenze mancanti (skill-gap), onboarding, cultura e performance del team. (→ ottimizzazione prompt/agenti AI = **prompt-engineer**; buste paga/contratti = **consulente-lavoro**)
- **public-policy** — Usa per affari regolatori e pubblici — rischio regolatorio del food-delivery e della gig-economy (inquadramento rider, gestione algoritmica, CCNL), obblighi DSA/e-commerce da marketplace online, monitoraggio delle norme in arrivo (nazionali/UE) e posizionamento pubblico su temi che toccano la licenza a operare. (→ enti locali/bandi/associazioni di Piacenza = **relazioni-istituzionali**; contenzioso = **avvocato-civile**)
- **partner-management** — Usa per i partner strategici — la relazione con i fornitori tech e i provider logistici da cui MyCity dipende strutturalmente (Stripe, Supabase, n8n, integrazioni core, corrieri/servizi di consegna), SLA e uptime reali, calendario rinnovi, escalation quando qualcosa si rompe, salute e valore della partnership nel tempo. (→ acquisti/sourcing e comparazione fornitori = **procurement**; validità/clausole del contratto = **legale-contrattualista**)
- **sustainability-esg** — Usa per sostenibilità ed ESG — consegne green (cargo-bike/emissioni), packaging, impronta carbonica, rendicontazione di sostenibilità, claim ambientali, bandi/certificazioni verdi come leva di brand. (→ flotta rider/cargo-bike operativa = **rider-fleet**; comunicazione = **pr-stampa**)

**🚀 Innovazione, prodotto & tech:**
- **search-reco-scientist** — Usa per il motore di ricerca e le raccomandazioni del marketplace — ranking di rilevanza, ordinamento dei risultati, "chi ha comprato X ha comprato anche Y" / prodotti simili, cold-start di negozi e prodotti nuovi, CTR vs conversione. (→ qualità della query/sinonimi/filtri = **search-relevance**; personalizzazione home/email = **personalization**)
- **ml-engineer** — Usa per portare i modelli di machine learning IN PRODUZIONE (MLOps) — pipeline di training, feature store, deploy, versioning, monitoraggio del drift e del degrado di un modello (churn, LTV, previsione domanda, scoring frode) già in campo. (→ pipeline dati/eventi = **data-engineer**; modello di ricerca/reco = **search-reco-scientist**)
- **personalization** — Usa per la personalizzazione del marketplace per singolo cliente — home, email, offerte, notifiche: segmentazione, next-best-action, contenuti dinamici, uplift incrementale, rischio filter-bubble. (→ ranking di ricerca/reco = **search-reco-scientist**; invii email/lifecycle = **crm-lifecycle**)
- **search-relevance** — Usa per la qualità della ricerca interna del marketplace — comprensione della query, sinonimi e varianti locali, tolleranza ai refusi (typo), qualità di filtri/faccette, tasso di zero-result e soddisfazione della ricerca. (→ ranking/reco ML = **search-reco-scientist**; UI dei filtri = **frontend-dev**)
- **mobile-app** — Usa per l'app nativa iOS/Android di MyCity — architettura mobile (nativo vs cross-platform), notifiche push, geolocalizzazione, performance (cold start, crash-free rate), ciclo di release sugli store, esperienza nativa vs web. (→ UI/UX web del marketplace = **frontend-dev**; API lato server = **backend-dev**)
- **platform-infra** — Usa per l'architettura di piattaforma e la scalabilità di MyCity — confini dei servizi, performance a volumi crescenti, costo del cloud, affidabilità architetturale, debito tecnico strutturale. (→ deploy/CI/Render/log = **devops-sre**; API applicative = **backend-dev**)
- **developer-platform** — Usa per le API pubbliche e l'ecosistema di integrazioni di MyCity — connettori a gestionali/POS dei negozi, webhook per i venditori, chiavi e developer portal, versionamento e documentazione delle API partner. (→ API interne ordini-pagamenti = **backend-dev**; automazioni n8n = **builder-automazioni**)
- **sdet** — Usa per l'automazione dei test del marketplace — suite end-to-end automatizzate, regressione continua, test di carico, coverage nei punti critici (checkout, payout). (→ QA manuale/esplorativo end-to-end = **qa**; deploy/CI = **devops-sre**)
- **analytics-engineering** — Usa per il data warehouse — trasformazioni dei dati grezzi in modelli puliti (stile dbt: staging/intermediate/mart), semantic layer e metriche certificate riusabili, test di qualità del dato a valle dei grezzi, lineage. (→ eventi/tracking/ingestion grezza = **data-engineer**; cruscotti/metriche di business = **bi-lead**)
- **computer-vision** — Usa per visione artificiale del marketplace — ricerca visuale (foto→prodotto), catalogazione automatica delle foto dei negozi, controllo qualità/moderazione delle immagini, arricchimento automatico delle schede prodotto a partire dalle foto. (→ generazione immagini/creativi = **ai-designer**; pipeline dati = **data-engineer**)
- **innovation-lab** — Usa per scommesse 0→1 su funzioni di rottura e nuove tecnologie (AI generativa, ordini vocali, AR) — prototipi veloci ed economici, esperimenti ad alto rischio/alto ritorno con ipotesi falsificabile e kill-criteria dichiarati prima, esplorazione di ciò che sul marketplace ancora non esiste. (→ priorità di prodotto/spec = **product-manager**; automazioni/strumenti = **builder-automazioni**)
- **accessibility** — Usa per l'accessibilità digitale del marketplace — conformità WCAG/EAA, screen reader, contrasto, navigazione da tastiera, audit e remediation a11y. (→ UI/componenti = **frontend-dev**; UX/flussi = **ux-designer**)

**🛵 Operations a scala:**
- **q-commerce-ops** — Usa per micro-fulfillment e dark store — picking, stoccaggio, layout del magazzino, tempi di preparazione ordine, inventario in tempo reale per la consegna rapida. (→ assegnazione giri/rider = **dispatch**; stato ordini = **operations**)
- **live-ops** — Usa per la sala controllo in tempo reale — monitoraggio h24 di ordini e consegne, incidenti live (negozio chiuso/non risponde, rider fermo, ritardo che sta esplodendo ORA), tempo di reazione ed escalation. (→ stato ordini/logistica generale = **operations**; assegnazione giri = **dispatch**)
- **courier-acquisition** — Usa per il lato rider — reclutamento fattorini, onboarding, retention, esperienza e soddisfazione, riduzione dell'abbandono, costo di acquisizione rider. (→ turni/copertura picchi/costo consegna = **rider-fleet**; assegnazione giri = **dispatch**)
- **capacity-planning** — Usa per pianificazione di rete e capacità della consegna — quanti rider servono per fascia oraria/zona su un orizzonte di settimane/mesi, previsione dei picchi (pranzo/cena/weekend/festività), copertura vs domanda attesa, scenari di crescita (nuovi negozi/zone/ordini), colli di bottiglia strutturali della rete. (→ turni operativi = **rider-fleet**; batching giri = **dispatch**; previsione domanda prodotto = **demand-forecasting**)
- **reverse-logistics** — Usa per resi e logistica inversa — politica dei resi per categoria, ritiro/rientro del prodotto, decisione rimborso/sostituzione/rifiuto, grading e ricondizionamento, tasso di reso e costo per reso, resi sospetti/wardrobing. (→ resi/rimborsi lato cliente reattivi = **supporto**; contestazioni carta = **dispute**)
- **localization** — Usa per localizzazione e i18n — traduzione e adattamento culturale dei contenuti in altre lingue, formati locali (data, valuta, indirizzo, telefono, unità di misura), preparazione tecnica e di contenuto all'espansione multi-città/lingua. (→ contenuti/copy originali = **content-social**; SEO locale = **seo**; business case di un'altra città = **city-manager**; nuova verticale/categoria = **new-verticals**)

**🧾 Fiscale-contabile (professionali, firma umana 🔴):**
- **commercialista** — Usa per la testa fiscale-contabile strategica di MyCity — bilancio d'esercizio, dichiarazioni dei redditi, scelta del regime fiscale, pianificazione fiscale lecita, adempimenti CCIAA e ravvedimenti operosi. (→ fatture/quadrature/IVA operativa = **contabilita**; revisione bilancio = **revisore-conti**)
- **consulente-lavoro** — Usa per il lavoro dipendente e i rider — buste paga, contributi INPS/INAIL, scelta del contratto (tempo indeterminato/determinato, apprendistato, co. (→ cause di lavoro/contenzioso = **avvocato-lavoro**; sicurezza sul lavoro = **rspp**)
- **revisore-conti** — Usa per la revisione indipendente dei conti di MyCity — certificazione del bilancio, procedure di revisione (analitiche/di conformità/sostanziali), materialità e rischio di revisione, evidenza sufficiente e appropriata, continuità aziendale, relazione di revisione. (→ controllo interno di processo = **internal-audit**; bilancio/dichiarazioni = **commercialista**)
- **fiscalista-iva-ecommerce** — Usa per l'IVA sulle vendite a distanza e da marketplace — OSS/IOSS, soglia UE 10. (→ IVA/adempimenti generali, fatture, chiusura mese = **contabilita**; bilancio, regime fiscale, dichiarazione dei redditi, CCIAA = **commercialista**)

**⚖️ Legale-notarile (professionali, firma umana 🔴):**
- **notaio** — Usa per atti societari — costituzione, statuto, cessioni di quote, procure, verbali assembleari, aumenti di capitale (i prerequisiti per aprire ai finanziamenti/investitori). (→ visure/PEC/libro soci/pratiche registro = **registro-imprese**; contenzioso = **avvocato-civile**)
- **avvocato-civile** — Usa per contenzioso civile e commerciale — recupero crediti, diffide, cause con fornitori/clienti/negozi, valutazione fondatezza e costi/benefici di un'azione legale, calcolo e sentinella della prescrizione. (→ bozze contratti standard/GDPR = **legale-privacy**; contratti negoziati = **legale-contrattualista**)
- **avvocato-lavoro** — Usa per il contenzioso di lavoro e il rischio di riqualificazione dei rider — cause di lavoro, ricorsi, ispezioni INL già avviate, giurisprudenza gig-economy, esposizione economica e strategia di difesa. (→ buste paga/inquadramento operativo = **consulente-lavoro**; sicurezza lavoro = **rspp**)
- **avvocato-ip** — Usa per la proprietà intellettuale del marchio MyCity — registrabilità e strategia di deposito, classi di Nizza, ricerche di anteriorità, opposizioni ricevute o da presentare, contraffazione lato legale (azioni contro terzi fuori piattaforma), licenze di marchio. (→ enforcement takedown sul marketplace = **brand-protection**)
- **legale-contrattualista** — Usa per i contratti negoziati veri — accordi con partner tech strategici (Stripe/Supabase/n8n/corrieri), fornitori, insegne/catene in franchising o co-branding, investitori (term sheet, patti parasociali): redlining, allocazione del rischio (cap di responsabilità, indennizzi, IP, esclusiva), leve negoziali, clausole di way-out. (→ bozze standard/consensi/TOS = **legale-privacy**; contenzioso = **avvocato-civile**)

**🗂️ Amministrazione & segreteria:**
- **segreteria-ea** — Usa per l'agenda e il filtro di Nicola — appuntamenti, promemoria, verbali di riunione, preparazione dei materiali prima di un incontro, gestione documenti in arrivo/uscita. (→ programmi/percorso critico iniziative = **chief-of-staff**; archivio/protocollo = **office-manager**)
- **office-manager** — Usa per l'amministrazione d'ufficio — protocollo (numerazione documenti in entrata/uscita), archivio documentale ritrovabile, PEC e corrispondenza formale, continuità dei fornitori d'ufficio (utenze, cancelleria, abbonamenti non-core), adempimenti amministrativi ricorrenti non fiscali/legali (rinnovi, comunicazioni di routine). (→ agenda/EA dell'AD = **segreteria-ea**; scadenze = **scadenzario**; gare/negoziazione fornitori = **procurement**; fatture/IVA/chiusura mese = **contabilita**; validità legale/firma del documento = **legale-privacy**/professionista abilitato)
- **scadenzario** — Usa per il calendario unico di TUTTE le scadenze di MyCity — fiscali, contributive, contrattuali, assicurative, bandi, rinnovi: avvisi anticipati ed escalation perché nessuna data si perda. (→ merito fiscale delle scadenze = **commercialista**; adempimenti amministrativi = **office-manager**)

**🦺 Adempimenti obbligatori (professionali, firma umana 🔴):**
- **rspp** — Usa per la sicurezza sul lavoro — DVR (documento di valutazione dei rischi), protocolli di prevenzione per i rider (DPI, manutenzione mezzi, soglie meteo, comportamento in strada), piano di formazione obbligatoria, gestione emergenze/primo soccorso/antincendio, riunione periodica sicurezza, registro infortuni e quasi-incidenti. (→ sorveglianza sanitaria e idoneità = **medico-competente**; polizze infortuni = **broker-assicurativo**)
- **medico-competente** — Usa per la sorveglianza sanitaria dei lavoratori e dei rider — protocollo sanitario, calendario visite (preventiva/periodica/al rientro/alla cessazione), gestione documentale delle cartelle sanitarie, giudizi di idoneità alla mansione. (→ valutazione rischi/DVR = **rspp**; privacy dati sanitari = **dpo**)
- **broker-assicurativo** — Usa per assicurazioni aziendali — analisi del fabbisogno assicurativo, ricerca e confronto polizze (RC professionale/prodotti, RC consegne, infortuni rider, cyber), gestione sinistri col cliente. (→ mappa dei rischi d'impresa = **enterprise-risk**)

**🏛️ Registro imprese & bandi:**
- **grant-writer** — Usa per bandi e finanziamenti a fondo perduto/agevolati — stesura della domanda, business plan di progetto, requisiti di ammissibilità, rendicontazione delle spese e tracciabilità. (→ trovare bandi/relazioni con gli enti = **relazioni-istituzionali**; contributi/finanza agevolata = **finanza-agevolata**)
- **registro-imprese** — Usa per gli adempimenti societari correnti — visure camerali, deposito atti al Registro Imprese, PEC, SPID/firma digitale, libro soci, variazioni camerali (sede, amministratori, oggetto sociale). (→ atti costitutivi/cessioni = **notaio**; scadenze = **scadenzario**)

**🏦 Banche, credito & finanziamenti:**
- **cfo** — Usa per la raccolta di capitali dell'azienda — quanto capitale serve, con quale strumento (equity, debito bancario, finanza agevolata/bandi) e a quali condizioni, la struttura del capitale, il runway, la diluizione vs il debito e il costo del capitale; orchestri gli specialisti finanziari sulla tesi di raccolta. (→ pianificazione/budget/forecast = **fp-and-a**; margini/anomalie = **finanza**; rapporti banca = **consulente-bancario**)
- **business-plan-bancabile** — Usa per il piano economico-finanziario che banche ed enti vogliono vedere — proiezioni a 3-5 anni, conto economico/stato patrimoniale/cash flow prospettici, break-even, sostenibilità del debito (DSCR), analisi di sensibilità. (→ pianificazione interna/budget = **fp-and-a**; scrittura/rendicontazione bandi = **grant-writer**; strategia di raccolta = **cfo**)
- **finanza-agevolata** — Usa per contributi a fondo perduto e finanziamenti agevolati/tasso zero — Invitalia (Smart&Start, Resto al Sud, ON Oltre Nuove Imprese), Nuova Sabatini, bandi regionali Emilia-Romagna, camerali, PNRR: individua la misura giusta, ammissibilità, cumulabilità, tempistiche e capienza dei fondi. (→ scrittura/rendicontazione della domanda = **grant-writer**; garanzia statale sul credito = **fondo-garanzia-pmi**; relazioni con gli enti = **relazioni-istituzionali**)
- **credito-impresa** — Usa per scegliere e istruire lo strumento di credito giusto per ogni fabbisogno — fidi di cassa, mutui, leasing, factoring, anticipo fatture: circolante vs investimento, costo effettivo del credito, impatto sulla cassa. (→ garanzia statale MCC = **fondo-garanzia-pmi**; rapporto/negoziazione con la banca = **consulente-bancario**; contributi pubblici = **finanza-agevolata**; raccolta equity = **fundraising-equity**)
- **fondo-garanzia-pmi** — Usa per la garanzia statale sul credito (Fondo di Garanzia PMI / Mediocredito Centrale) — la garanzia pubblica fino all'80% che sblocca il credito bancario senza garanzie personali pesanti: ammissibilità, importi e percentuali garantite, fascia di valutazione, iter di accesso abbinato al finanziamento. (→ scelta dello strumento di credito = **credito-impresa**; merito creditizio/rating = **rating-centrale-rischi**; rapporto con la banca = **consulente-bancario**)
- **rating-centrale-rischi** — Usa per preparare l'azienda a come la vede la banca PRIMA di chiedere credito — rating (Basilea/MCC), Centrale Rischi Banca d'Italia, indici di bilancio, andamentale, segnali di allerta, leve per migliorare il merito creditizio e ottenere condizioni migliori. (→ garanzia statale = **fondo-garanzia-pmi**; scelta strumento di credito = **credito-impresa**; rapporto/negoziazione banca = **consulente-bancario**)
- **consulente-bancario** — Usa per i rapporti con le banche dell'azienda — conti correnti, condizioni, negoziazione dei fidi, mettere più istituti in concorrenza, gestione della relazione bancaria (le finanze DELL'AZIENDA, non il credito ai negozi). (→ credito per i NEGOZI del marketplace = **seller-financing**; scelta dello strumento di credito = **credito-impresa**; merito/rating = **rating-centrale-rischi**; garanzia statale = **fondo-garanzia-pmi**)
- **mediatore-creditizio** — Usa per intermediare il credito tra l'azienda e più istituti — matching tra fabbisogno e offerte, mettere in concorrenza le banche su una pratica, ottimizzare le condizioni tramite un canale di intermediazione. (→ rapporto diretto con la banca = **consulente-bancario**; scelta dello strumento = **credito-impresa**; garanzia statale = **fondo-garanzia-pmi**)
- **fundraising-equity** — Usa per la raccolta di capitale di rischio (equity) — pitch deck, cap table, valutazione, term sheet, business angel/venture capital, equity crowdfunding, minibond: costruzione della storia investibile, strategia di round, milestone. (→ atti/cessioni quote = **notaio**; rapporti post-investimento = **investor-relations**; piano bancabile/proiezioni = **business-plan-bancabile**; struttura debito vs equity = **cfo**)
- **investor-relations** — Usa per i rapporti con gli investitori dopo la raccolta — reporting periodico, aggiornamenti, board update, gestione delle aspettative, preparazione dei round successivi, fiducia e trasparenza. (→ raccolta/pitch iniziale = **fundraising-equity**; numeri/forecast = **fp-and-a**; atti/verbali societari = **notaio**/**registro-imprese**)

- 🧠 **Direzione:** AD
- 🤖 **AI Lab:** prompt-engineer · ai-designer · ai-video · ai-copywriter
- 💻 **Engineering:** tech · frontend-dev · backend-dev · data-engineer · devops-sre · qa · security · builder-automazioni
- 📦 **Prodotto & Design:** product-manager · ux-designer · designer · direttore-creativo · qa-designer <!-- AR-026: aggiunti i 2 gate creativi -->
- 📣 **Marketing & Growth:** marketing · growth-monetizzazione · crm-lifecycle · content-social · seo · ads-performance · influencer-partnership · cro · pr-stampa · relazioni-istituzionali
- 🤝 **Vendite & Supply:** vendite · onboarding-negozi · account-negozi
- 🛵 **Operations:** operations · rider-fleet · dispatch
- 🎧 **Clienti & Fiducia:** supporto · customer-success · trust-safety · dispute
- 💶 **Finanza:** finanza · contabilita
- 🔎 **Intelligence & Dati:** intelligence · analista
- ⚖️ **Legale:** legale-privacy
> KPI per ruolo in [[OKR-Squadra]] · capacità e cultura in [[CULTURA-SQUADRA]] · le figure rare oltre questo set si attivano on-demand.

## Dettaglio nucleo per poteri (🟢🟡🔴)

### 🧠 Direzione
| Senior | Cosa produce | Poteri max |
|---|---|---|
| 🧠 **AD** | priorità, decisioni, coordinamento, crea nuovi agenti | propone 🔴, fa 🟢 |

### 💰 Motori di soldi & crescita (i più importanti)
| Senior | Cosa produce | Poteri max |
|---|---|---|
| 🤝 **vendite** | nuovi negozi, negozi in calo, pitch | bozze contatto 🟡, offerte 🔴 |
| 📣 **marketing** | acquisizione, SEO, campagne, retention | bozze 🟡, spesa ads 🔴 |
| 🚀 **growth-monetizzazione** | esperimenti ROI: pricing, upsell, fee, carrelli, win-back | proposte 🟢, esperimenti 🟡, prezzi/spesa 🔴 |
| 🔁 **crm-lifecycle** | recupero carrelli, win-back, email ciclo vita, referral | bozze 🟢, invii reali 🟡/🔴 |
| ✍️ **content-social** | calendario, post, reel, copy SEO | bozze 🟢, pubblicazione 🔴 |
| 🎨 **designer** | QR, locandine, vetrofanie, grafiche (via `creativi/`) | crea file 🟢, stampa/spesa 🔴 |
| 📰 **pr-stampa** | comunicati, giornalisti, kit stampa | bozze 🟢, invio media 🔴 |
| 🏛️ **relazioni-istituzionali** | Comune, Vita in Centro, CdC, bandi | dossier 🟢, contatti reali 🔴 |

### 🔭 Cacciatori di opportunità
| Senior | Cosa produce | Poteri max |
|---|---|---|
| 🔎 **intelligence** | concorrenti, trend, eventi, buchi di mercato | sola lettura + web 🟢 |
| 📊 **analista** | report sui numeri, cali, opportunità | sola lettura 🟢 |

### 🛠️ Costruttori di strumenti
| Senior | Cosa produce | Poteri max |
|---|---|---|
| 🧰 **builder-automazioni** | n8n, script, integrazioni/MCP, nuovi strumenti | locale 🟢, servizi reali 🟡, deploy 🔴 |
| 🛠️ **tech** | analisi + fix del sito (in branch) | fix in branch 🟡, deploy 🔴 |

### 🛡️ Fondamenta (abilitano, non frenano)
| Senior | Cosa produce | Poteri max |
|---|---|---|
| 💶 **finanza** | incassi, payout, anomalie, margini | sola lettura 🟢, denaro 🔴 |
| ⚖️ **legale-privacy** | contratti, GDPR, TOS, bandi, HACCP | bozze 🟢, validità finale umana 🔴 |
| 🔒 **security** | RLS, sicurezza pagamenti, dati clienti | audit 🟢, fix via tech 🟡 |
| ✅ **qa** | verifica end-to-end pre-live | report 🟢 (sola lettura) |
| 🛵 **operations** | ordini, rider, consegne | sola lettura + alert 🟢 |
| 🎧 **supporto** | reclami, dubbi clienti (reattivo) | bozze risposte 🟡 |
| 🤗 **customer-success** | primo ordine concierge, feedback (proattivo) | script 🟢, contatto cliente 🟡 |

> Oltre questo nucleo, l'AD può attivare **sciami on-demand** (sub-agenti usa-e-getta) per i picchi
> e creare nuovi senior quando scopre un buco (meta-capacità).

## 🤝 Come collaborano (squadra, non solisti)
I senior si aiutano a vicenda tramite un canale condiviso e protocolli chiari:
- **[[SALA-OPERATIVA]]** — il canale sempre aperto: richieste d'aiuto, handoff, "fatto", peer review.
- **[[CULTURA-SQUADRA]]** — i 7 principi della squadra + le **catene di collaborazione** (team play) per ogni obiettivo.
- L'**AD è il direttore d'orchestra**: compone le catene (in serie o in parallelo) e pretende la peer review sul lavoro critico.

## 🧬 Le 7 capacità (Sistema Operativo del Dipendente)
Ogni senior ha la "Carta del Dipendente" nel suo file `.claude/agents/`. La fanno funzionare:
- `memoria-squadra/` — il quaderno di ogni senior (impara e migliora)
- [[OKR-Squadra]] — chi possiede quale KPI/target/budget
- `cervello/sentinelle.md` — i trigger dell'iniziativa · `cervello/ritmo.md` — il battito (mattino/sera/settimana)
- [[PLAYBOOK-ECCEZIONI]] — cosa fare quando va storto · [[RUBRICA-QUALITA]] — come si misura "fatto bene"

## Le 3 "lenti" senior del panel (vedi [[00-Index]])
- **Lente Amazon** → catalogo, ricerca, recensioni, logistica, retention.
- **Lente eBay** → onboarding venditori, reputazione, listing, pagamenti, dispute.
- **Lente Glovo** → consegna locale, tracking, geolocalizzazione, operations.

Gli agenti operativi sopra applicano queste lenti al loro reparto.

## Collegato a
- Mansionari operativi: `.claude/agents/*.md`
- Manuale dell'AD: `CLAUDE.md` (radice)
- Memoria viva: [[STATO]] · [[DECISIONI]] · `90-Memoria-AI/Briefing/`
