---
tipo: referto
fonte: AD digitale
data: 2026-11-05 14:27
argomento: le sei pagine «Approfondisci» del Pannello
stato: salvato, da riprendere dopo il marketplace
---

# Le sei pagine «Approfondisci» del Pannello: i difetti salvati per dopo

> **In due righe.** Ho salvato nel registro della macchina i 123 difetti trovati il 5/11 nelle sei pagine «Approfondisci» del Pannello. Li riprendiamo dopo aver finito di risolvere il marketplace, partendo dalla causa più cara.

Questo referto serve a ritrovarli alla ripresa: dice cosa non va, perché conta e dove sta ogni scheda.

## In parole semplici

Il 5/11 ho fatto analizzare le sei pagine del gruppo «Approfondisci» del Pannello: Numeri, Analisi & report, Negozi & clienti, Operazioni, Mercato e Intelligence. Le segnalazioni erano 143 in tutto. I collaudatori ne hanno tenute 123 su 143, dopo aver tolto quelle smentite e i doppioni.
Di questi 123, uno solo è bloccante e 13 sono gravi; gli altri sono medi o minori.
Hai deciso di riprenderli dopo aver finito di risolvere il marketplace. Sono salvati nel registro dei difetti della macchina, ognuno con la sua scheda.

## Cosa cambia per te

- Le pagine restano come sono finché non riprendiamo questo lavoro. Fino ad allora non decidere su questi numeri: soldi ai negozi, clienti, carrelli, allarmi rossi, commissione.
- Un numero conta già dal lancio: quanto dare al negozio il lunedì. Finché non è sistemato, quel conto va fatto dal sito, non dal Pannello.
- Il voto «chiudo almeno quanto apro» di novembre scende: 126 difetti aperti contro 23 chiusi, cioè 0,18. Sotto 1 la macchina non apre ricerche nuove finché non chiude.

## Cosa devi fare

- Niente adesso. Quando il marketplace è finito, dimmi «riprendi i difetti del Pannello» e parto dalla prima causa.
- Quel giorno servono due tue scelte prima del codice: quali account sono di prova, e cosa vuoi vedere in cima alla pagina Numeri.

## Cosa non ho verificato

- Non ho visto le pagine accese coi dati veri: in quella sessione mancavano le chiavi del sito. I numeri sono ricostruiti applicando le formule del codice ai dati veri letti dal database.
- Non so se il Pannello è aperto a chi conosce l'indirizzo: Vercel chiede l'accesso sull'indirizzo standard, gli altri indirizzi non li ho provati.
- Le date e le righe di codice sono quelle del 5/11: alla ripresa ogni scheda va riletta sul codice di quel giorno.

---

## Le tredici cause, dalla più cara

**1. I soldi da dare al negozio risultano «già dati».** Lo stato «aspetto ancora i contanti dal fattorino» viene letto come «pagato». Dal primo ordine in contanti dopo il lancio, il bonifico del lunedì non va calcolato da questa scheda.

Quanti: 1 su 123 · 1 bloccante.

**2. Conti dei soldi fatti con numeri di riserva.** La commissione mostrata è il 12%, quella firmata il 10%. Consegna e fattorino contano zero, e la cassa dirà «sostenibile» al primo ordine pagato.

Quanti: 4 su 123 · 2 gravi · 2 medi.

**3. Le prove contano come clienti veri.** L'ordine di prova di giugno e gli account di prova creano clienti, carrelli, un «dormiente» e un negozio «fermo da 134 giorni».

Quanti: 5 su 123 · 1 grave · 3 medi · 1 minore.

**4. «Non lo so» diventa «zero».** Se il database non risponde, la maggior parte delle schede mostra zeri accesi e «aggiornato adesso».

Quanti: 12 su 123 · 1 grave · 7 medi · 4 minori.

**5. Numeri che non misurano quello che dice il loro nome.** «Problemi» conta tutti gli annullati di sempre e tiene acceso un allarme rosso; i carrelli hanno tre definizioni.

Quanti: 24 su 123 · 2 gravi · 13 medi · 9 minori.

**6. Pagine che non rispondono alle domande del lancio.** Nessuna dice se il 15/11 si apre, che la carta del negozio è spenta, o quanto dare al negozio lunedì.

Quanti: 13 su 123 · 3 gravi · 8 medi · 2 minori.

**7. Tasti che promettono un lavoro che nessuno farà.** Report, analisi e chat rispondono «lo farò al prossimo giro» mentre il server è spento dal 25/9.

Quanti: 5 su 123 · 3 gravi · 1 medio · 1 minore.

**8. Decisioni tue che le pagine non applicano.** I ristoranti scartati il 18/7 tornano in cima fra i negozi da contattare; la mappa indica ancora Garetti come negozio faro.

Quanti: 5 su 123 · 1 grave · 2 medi · 2 minori.

**9. Testi vecchi o vuoti che sembrano freschi.** Elenchi caricati a maggio con la data di oggi, «in arrivo» fermi da 132 giorni, scadenze scritte a mano.

Quanti: 20 su 123 · 11 medi · 9 minori.

**10. Dati personali letti o mostrati senza bisogno.** I dettagli restano solo nella chat del 5/11, perché il repository è pubblico.

Quanti: 5 su 123 · 3 medi · 2 minori.

**11. Nomi che confondono, doppioni e parole tecniche a schermo.** «Negozi & clienti» apre «Persone», «Mercato» apre «Mondo & rischi»; sigle e percorsi di file sullo schermo.

Quanti: 20 su 123 · 8 medi · 12 minori.

**12. Il Pannello rilegge tutto ogni minuto.** Anche col telefono in tasca, rilegge gli ordini più volte al minuto.

Quanti: 6 su 123 · 6 minori.

**13. La modalità di prova mescola numeri finti e veri.** Nella stessa schermata ci sono numeri inventati e numeri veri, senza dirlo.

Quanti: 3 su 123 · 1 medio · 2 minori.

---

## Dettagli tecnici

- Registro: `MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json`, schede da AR-1035 ad AR-1157, `area: pannello`, campo `malattia` per la causa, `ripresa` col rinvio, `owner` proposto, `verifica: {tipo: "umano"}` (nessun guardiano le chiude da solo).
- Analisi: due workflow, 13 agenti (7 analisti + 4 collaudatori sulle sei pagine, 1 analista + 1 collaudatore sulla #928), circa 3,05 milioni di token degli agenti. Codice letto su main 89ea6ff (con la #928). Dati: SQL in sola lettura sui progetti clmpyfvpvfjgeviworth e xjljcsorpbqwttrejqte.
- Doppioni tolti prima di salvare: NUM-01→ANA-01, NUM-03 e DAT-05→ANA-07, DAT-02→NUM-02, DAT-04, UTI-01 e MER-02→PER-03, PER-06→P928-03.
- Sicurezza: le cinque schede sui dati personali sono scritte senza dettagli sfruttabili; il dettaglio è solo nella chat del 5/11.
- Il bloccante si ripara in `pannello/src/lib/marketplace-db.ts` (riconciliazione dei payout): elenco chiuso degli stati del sito invece dei pezzi di parola.

### I soldi da dare al negozio risultano «già dati» · `pagamento-al-negozio-letto-a-pezzi-di-parola`

| scheda | gravità | pagina | difetto | a chi |
|---|---|---|---|---|
| AR-1035 | bloccante | Analisi & report | I soldi ancora da girare al negozio risultano «già pagati» | backend-dev |

### Conti dei soldi fatti con numeri di riserva · `valore-di-riserva-al-posto-del-registro-dei-fatti`

| scheda | gravità | pagina | difetto | a chi |
|---|---|---|---|---|
| AR-1038 | grave | Analisi & report | Al primo ordine pagato la cassa dirà «sostenibile, runway illimitato» senza conoscere né la cassa né le spese | backend-dev |
| AR-1040 | grave | Analisi & report | La commissione mostrata è il 12%, quella decisa è il 10%; consegna e fattorino contano zero | backend-dev |
| AR-1061 | medio | Analisi & report | Ti chiede di impostare valori che dal Pannello non puoi impostare | backend-dev |
| AR-1066 | medio | Analisi & report | Commissione al 12% invece del 10% deciso, calcolata anche sulla consegna: il guadagno per ordine risulta gonfiato del 76% | backend-dev |

### Le prove contano come clienti veri · `prove-e-staff-contati-come-clienti-veri`

| scheda | gravità | pagina | difetto | a chi |
|---|---|---|---|---|
| AR-1036 | grave | Numeri | Nei numeri finiscono l'ordine di prova annullato e i carrelli di chi lavora a MyCity | analista |
| AR-1068 | medio | Analisi & report | Pane Quotidiano risulta rosso «fermo da 134 giorni», contro l'attesa concordata fino al 30/11 | analista |
| AR-1069 | medio | Negozi & clienti | «Clienti totali 5» conta un account di prova e quello di Nicola; il solo «dormiente» è Nicola | analista |
| AR-1100 | medio | Trasversale | Ordini annullati e pagamenti falliti contano come attività: clienti «attivi» e negozio «fermo da 134 giorni» che non ha mai venduto | analista |
| AR-1124 | minore | Negozi & clienti · Rider & flotta | Il «1» accanto a Rider & flotta è un account di prova, ed è sospeso | analista |

### «Non lo so» diventa «zero» · `non-so-mostrato-come-zero`

| scheda | gravità | pagina | difetto | a chi |
|---|---|---|---|---|
| AR-1041 | grave | Analisi & report | Quando il database non risponde, nove schede su dieci mostrano zeri come se fossero veri | backend-dev |
| AR-1049 | medio | Numeri | Quando l'API non risponde, la pagina scrive «da collegare» e non «non riesco a leggere» | backend-dev |
| AR-1060 | medio | Analisi & report | Mentre carica, o se la rotta cade, la scheda dice «servono le chiavi del marketplace» | backend-dev |
| AR-1067 | medio | Analisi & report | Con zero clienti paganti la Cabina scrive 0%, 0 giorni e 0 €, e un margine di 0 € in verde | backend-dev |
| AR-1086 | medio | Mercato | Il file della radiografia sta per superare il tetto di lettura: Sicurezza e Legale diventeranno cieche | backend-dev |
| AR-1091 | medio | Intelligence | Se GitHub non risponde, l'allarme dice «ferma da null giorni» e le schede «mai generate» | backend-dev |
| AR-1093 | medio | Intelligence | Se la lettura degli ordini fallisce, gli allarmi la scambiano per zero ordini e zero negozi | backend-dev |
| AR-1095 | medio | Trasversale | La scritta «aggiornato adesso» resta fresca anche quando la lettura è fallita | backend-dev |
| AR-1112 | minore | Analisi & report | Il funnel dipende da uno strumento spento al lancio e scrive «0%» quando non c'è niente da dividere | backend-dev |
| AR-1114 | minore | Analisi & report | I report vecchi non si aprono, e se GitHub non risponde la pagina dice «nessun report ancora» | backend-dev |
| AR-1133 | minore | Mercato | Se la lettura delle recensioni fallisce, la casella scrive «0 recensioni» come se fosse vero | backend-dev |
| AR-1148 | minore | Intelligence | Se l'accodamento fallisce, l'errore dice sempre «Memoria non collegata», e niente ferma i doppioni | backend-dev |

### Numeri che non misurano quello che dice il loro nome · `numero-che-non-misura-quello-che-dice-il-nome`

| scheda | gravità | pagina | difetto | a chi |
|---|---|---|---|---|
| AR-1045 | grave | Operazioni | «Con problemi 1» è l'ordine di giugno già chiuso, e accende un allarme rosso permanente | analista |
| AR-1048 | grave | Trasversale | «Carrelli abbandonati» ha tre definizioni e due nomi, e conta anche il carrello che il cliente sta riempiendo adesso | analista |
| AR-1051 | medio | Numeri | Gli stessi carrelli si chiamano «attivi» in un riquadro e «abbandonati» in un altro, e un carrello in uso conta già come abbandonato | analista |
| AR-1052 | medio | Numeri | «Negozi in calo» conta in realtà i negozi fermi o mai partiti | analista |
| AR-1054 | medio | Numeri | «Salute adesso» mostra come attuali cose di mesi fa | analista |
| AR-1056 | medio | Numeri | I contatori delle tendine dicono «0/24» anche quando dentro ci sono numeri, e «adesso» su totali di 30 giorni | analista |
| AR-1057 | medio | Numeri | «Ordini», «Clienti attivi» e «Negozi attivi» contano cose diverse da quello che dice il nome | analista |
| AR-1059 | medio | Analisi & report | Il rapporto LTV:CAC confronta il venduto del negozio con la spesa di MyCity | analista |
| AR-1062 | medio | Analisi & report | I «giorni anomali» suoneranno ogni mattina e a ogni ordine dei primi giorni | analista |
| AR-1065 | medio | Analisi & report | Il catalogo non può mostrare le categorie scoperte che promette | analista |
| AR-1074 | medio | Operazioni | «Tempo medio» di consegna conterà anche le ore che il cliente sceglie di aspettare | analista |
| AR-1075 | medio | Operazioni | «Annullati oggi» guarda il giorno dell'ordine, non il giorno dell'annullamento | analista |
| AR-1083 | medio | Mercato | La rassegna stampa sembra sempre di oggi: data senza anno e ogni risultato etichettato «parla di MyCity» | analista |
| AR-1087 | medio | Mercato · Sicurezza & accessi | Il numero accanto a «Sicurezza & accessi» oggi è 140, non 105, e mette insieme cose urgenti e cose minori | analista |
| AR-1102 | medio | Trasversale | «Incasso (GMV)» e «Scontrino medio» comprendono i soldi della consegna | analista |
| AR-1108 | minore | Numeri | «Tempo medio consegna» misura anche l'attesa della fascia scelta dal cliente | analista |
| AR-1113 | minore | Analisi & report | Salute negozi: una freccia verde su un negozio senza ordini e un «+100%» inventato | analista |
| AR-1115 | minore | Analisi & report | Il trend può perdere un giorno nel mese dopo il cambio dell'ora, e la proiezione conta oggi a metà | analista |
| AR-1121 | minore | Negozi & clienti | «Attivi» e «dormienti» hanno soglie diverse da quelle del glossario, e contano anche gli ordini annullati | analista |
| AR-1125 | minore | Negozi & clienti · Lead & pipeline negozi | Il numero dice 382, la riga sotto dice 407, e dentro ci sono anche il negozio già sul sito e quello di prova | analista |
| AR-1130 | minore | Operazioni · Catalogo & prodotti | Catalogo e pagina Numeri contano i prodotti e gli esauriti in due modi diversi | analista |
| AR-1131 | minore | Mercato | Sicurezza e Legale dicono «dato del 01/11» ma contano già i difetti della radiografia di oggi | analista |
| AR-1142 | minore | Mercato · Sicurezza & accessi | La stessa falla può contare due volte: una come difetto del sito e una come avviso di Supabase | analista |
| AR-1144 | minore | Intelligence | La data della scheda si sbaglia se in cima compare una scadenza futura: un testo vecchio risulta «aggiornato oggi» | analista |

### Pagine che non rispondono alle domande del lancio · `pagina-che-non-risponde-alle-domande-del-lancio`

| scheda | gravità | pagina | difetto | a chi |
|---|---|---|---|---|
| AR-1037 | grave | Numeri | La pagina non risponde a «come va e cosa devo fare» a dieci giorni dall'apertura | product-manager |
| AR-1042 | grave | Analisi & report | La pagina non misura quello che decide se MyCity funziona | product-manager |
| AR-1043 | grave | Negozi & clienti | «Negozi attivi 1» in verde, ma Pane Quotidiano non può ancora incassare con la carta, a 10 giorni dal lancio | product-manager |
| AR-1050 | medio | Numeri | 103 caselle su 145 sono vuote per sempre, e 12 categorie su 22 non hanno nemmeno un dato | product-manager |
| AR-1072 | medio | Operazioni | «Ordini live» non è dal vivo e non dice cosa fare: mostra l'ordine di giugno, senza fascia, negozio né attesa | product-manager |
| AR-1076 | medio | Operazioni | «Calendario & eventi» mostra scadenze interne della macchina e non la data del lancio | product-manager |
| AR-1084 | medio | Mercato | «Roadmap & idee» non mostra né roadmap né idee: è l'elenco delle riparazioni del sito | product-manager |
| AR-1092 | medio | Intelligence | Prima del lancio la scheda Alert non può mai dire «tutto tranquillo»: «Nessun ordine oggi» ogni giorno | product-manager |
| AR-1094 | medio | Intelligence | La pagina non risponde a «cosa devo fare oggi» e guarda il delivery, non quello che conta adesso | product-manager |
| AR-1099 | medio | Trasversale | La carta «recupera i carrelli» porta la firma di Nicola del 24 settembre, ma il numero e i destinatari cambiano da soli, e il codice sconto proposto non esiste | product-manager |
| AR-1103 | medio | Trasversale | Nessuna delle sei pagine risponde alle tre domande di oggi: si apre il 15/11? arrivano ordini veri? quali negozi entrano? | product-manager |
| AR-1135 | minore | Mercato | La pagina «Mondo & rischi» non mostra i rischi veri del business né le occasioni in città | product-manager |
| AR-1146 | minore | Intelligence | La chat della scheda riceve solo le prime 800 lettere, cioè l'avviso vecchio e non l'analisi | product-manager |

### Tasti che promettono un lavoro che nessuno farà · `promessa-di-un-lavoro-col-server-spento`

| scheda | gravità | pagina | difetto | a chi |
|---|---|---|---|---|
| AR-1039 | grave | Analisi & report | «Genera report» promette un report che non arriverà | frontend-dev |
| AR-1046 | grave | Intelligence | Il tasto «Aggiorna analisi» promette un lavoro che nessuno fa da 41 giorni | frontend-dev |
| AR-1047 | grave | Intelligence | La chat «Parla con questa casella» non risponde mai e dice «arriva a breve» | frontend-dev |
| AR-1073 | medio | Operazioni | «Task & progetti» non mostra niente, mentre 21 lavori aspettano e nessuno ne esegue dal 25 settembre | frontend-dev |
| AR-1119 | minore | Negozi & clienti | «Squadra» elenca 21 senior su 120, un nome sbagliato, e invita a chiamarli mentre l'esecutore è spento | frontend-dev |

### Decisioni tue che le pagine non applicano · `decisione-di-nicola-non-applicata`

| scheda | gravità | pagina | difetto | a chi |
|---|---|---|---|---|
| AR-1044 | grave | Negozi & clienti · Lead & pipeline negozi | I negozi che la macchina ha scartato tornano in cima come «da contattare» | frontend-dev |
| AR-1089 | medio | Intelligence | Le analisi mostrate contraddicono decisioni che Nicola ha già preso | frontend-dev |
| AR-1090 | medio | Intelligence | La Mappa d'influenza è del 27 giugno, non lo dice e indica ancora Garetti come negozio faro | frontend-dev |
| AR-1127 | minore | Negozi & clienti · Contatti & relazioni | La rubrica conta anche la testata che il suo stesso documento dice di non usare, e i recapiti sembrano confermati | frontend-dev |
| AR-1143 | minore | Intelligence | Le soglie di freschezza (2 giorni) vanno contro la ricerca settimanale decisa da Nicola | frontend-dev |

### Testi vecchi o vuoti che sembrano freschi · `testo-vecchio-o-vuoto-che-sembra-fresco`

| scheda | gravità | pagina | difetto | a chi |
|---|---|---|---|---|
| AR-1053 | medio | Numeri | Sulla stessa pagina tre orologi, e nessuno dice di quando sono i numeri | frontend-dev |
| AR-1055 | medio | Numeri | Dati già letti dal server che la pagina butta via, mentre le righe corrispondenti dicono «da collegare» | frontend-dev |
| AR-1058 | medio | Analisi & report | L'ultimo report è di 100 giorni fa ma la pagina lo presenta come fresco | frontend-dev |
| AR-1070 | medio | Negozi & clienti · Lead & pipeline negozi | I 382 «lead» sono un elenco di OpenStreetMap caricato una volta il 24/5 e mai toccato, ma la casella dice «dato di oggi» | frontend-dev |
| AR-1077 | medio | Operazioni · Calendario & eventi | In cima al calendario, in rosso, un compito impossibile: mandare al fornaio un messaggio per un bando chiuso, da una card archiviata | frontend-dev |
| AR-1078 | medio | Operazioni · Campagne | La casella Campagne legge un registro che nessuno compila: resterà a 0 anche quando una campagna partirà | frontend-dev |
| AR-1079 | medio | Mercato | La casella «Codice del sito» resta sempre vuota e accanto al titolo scrive «0» | frontend-dev |
| AR-1081 | medio | Mercato | Il radar dei concorrenti ha 26 giorni ma è mostrato come «novità» e «live», mentre la scheda Intelligence lo dà per vecchio | frontend-dev |
| AR-1082 | medio | Mercato | «Scadenze aperte: nessuna nello scadenzario» è una frase scritta a mano, non un controllo | frontend-dev |
| AR-1096 | medio | Trasversale | Tre «in arrivo» fermi da 132 giorni, e due parlano di dati che il Pannello calcola già | frontend-dev |
| AR-1106 | medio | Trasversale | Su ogni pagina compaiono due date che si contraddicono: «dati del 10/10» e «aggiornato oggi» | frontend-dev |
| AR-1122 | minore | Negozi & clienti | Le promesse «in arrivo» non hanno data né responsabile, e una è già smentita da un'altra pagina | frontend-dev |
| AR-1128 | minore | Operazioni | Caselle che dicono «in arrivo» o «da collegare» per dati che il Pannello mostra già altrove | frontend-dev |
| AR-1129 | minore | Operazioni · Calendario & eventi | 14 righe su 17 del calendario sono eventi e meteo di ottobre, già passati, e nessuno li rifà | frontend-dev |
| AR-1132 | minore | Mercato | La casella Esperimenti dice «live · 0» su un registro nato vuoto oggi, che nessuno compila | frontend-dev |
| AR-1136 | minore | Mercato | Promesse «in arrivo» e «non ancora collegati» ferme da settimane, senza data né lavoro aperto | frontend-dev |
| AR-1139 | minore | Mercato | Sulla pagina Mercato manca l'ora di aggiornamento dei numeri | frontend-dev |
| AR-1141 | minore | Mercato · Sicurezza & accessi | Dal 13/11 il numero della sicurezza scende da 140 a 93 senza aver riparato niente | frontend-dev |
| AR-1153 | minore | Intelligence | L'allarme «nessuna scheda si aggiorna da 65 giorni» esagera: tre schede su cinque sono di 26 giorni fa | frontend-dev |
| AR-1155 | minore | Trasversale | La memoria si contraddice sul negozio di prova: cancellato per una riga, ancora da cancellare per un'altra | frontend-dev |

### Dati personali letti o mostrati senza bisogno · `dati-personali-letti-o-esposti-senza-bisogno`

| scheda | gravità | pagina | difetto | a chi |
|---|---|---|---|---|
| AR-1071 | medio | Negozi & clienti · Rider & flotta | Chiunque abbia l'indirizzo del Pannello legge nome, stato «sospeso» e presenza online dei rider | security |
| AR-1088 | medio | Mercato · Sicurezza & accessi | La casella promette «dettagli fuori dal deposito pubblico», ma per una falla grave i dettagli sono nel deposito pubblico | security |
| AR-1097 | medio | Trasversale | Gli elenchi leggono tutto dei clienti e dei negozi (IBAN, codice fiscale, documenti) per mostrare solo un nome | security |
| AR-1123 | minore | Negozi & clienti | Per scrivere un nome, il Pannello legge tutti i dati personali di clienti e negozi | security |
| AR-1137 | minore | Mercato | La casella Codice pubblicizza una porta che legge qualunque file del sito privato senza chiedere chi sei | security |

### Nomi che confondono, doppioni e parole tecniche a schermo · `nomi-doppioni-e-gergo-a-schermo`

| scheda | gravità | pagina | difetto | a chi |
|---|---|---|---|---|
| AR-1063 | medio | Analisi & report | Tre nomi per la stessa pagina e gli stessi numeri doppi in Numeri, con etichette diverse | ux-designer |
| AR-1064 | medio | Analisi & report | Pagina piena di sigle inglesi e nomi di colonne, e su telefono undici bottoni prima dei dati | ux-designer |
| AR-1080 | medio | Mercato | Da chiusa la pagina non dice né come va né cosa fare: i numeri accanto ai titoli sono «live», «parziale», «1/2» | ux-designer |
| AR-1085 | medio | Mercato | Nei testi delle caselle compaiono percorsi di file, numeri di scheda e sigle di falle | ux-designer |
| AR-1098 | medio | Trasversale | I bollini accanto ai titoli («4/4», «live», «parziale») non si capiscono e cambiano significato all'apertura | ux-designer |
| AR-1104 | medio | Trasversale | Tre voci della barra laterale aprono pagine con un altro nome, e «Mercato» contiene sicurezza, leggi e codice | ux-designer |
| AR-1105 | medio | Trasversale | Gli stessi dati stanno in due o tre pagine, e in ognuna con uno stato diverso | ux-designer |
| AR-1107 | medio | Trasversale | Sullo schermo ci sono sigle inglesi mai spiegate, nomi di variabili e percorsi di file | ux-designer |
| AR-1110 | minore | Numeri | Il formattatore dei numeri è copiato in due posti: la pagina usa quello senza protezioni e scrive i decimali all'inglese | ux-designer |
| AR-1117 | minore | Analisi & report | Gli importi escono con un decimale solo o col meno attaccato | ux-designer |
| AR-1118 | minore | Analisi & report | Al telefono la pagina «Analisi & report» scorre di lato e il tasto «Aggiorna» resta tagliato | ux-designer |
| AR-1120 | minore | Negozi & clienti | La barra dice «Negozi & clienti», la pagina si chiama «Persone» e mescola senior, giornalisti e lead | ux-designer |
| AR-1126 | minore | Negozi & clienti · Lead & pipeline negozi | Categorie in inglese tecnico, «fiducia 98%» e una classifica a caso fra i pari merito | ux-designer |
| AR-1138 | minore | Mercato | Quattro nomi per la stessa cosa, e la scheda Numeri dice che i concorrenti non sono misurati | ux-designer |
| AR-1145 | minore | Intelligence | La chat di un allarme si perde ogni giorno perché è legata al titolo, che cambia | ux-designer |
| AR-1147 | minore | Intelligence | Doppioni con Mercato e con la Home: due «Reputazione» diverse e gli stessi allarmi | ux-designer |
| AR-1149 | minore | Intelligence | Due tasti quasi uguali, «Aggiorna» e «Aggiorna analisi», fanno cose diverse; sulla mappa «Aggiorna» non fa niente | ux-designer |
| AR-1150 | minore | Intelligence | Sul telefono la mappa mostra solo etichette: il contenuto sta nei tooltip, che col dito non si aprono | ux-designer |
| AR-1151 | minore | Intelligence | Gergo da terminale nella pagina e nei testi | ux-designer |
| AR-1157 | minore | Trasversale · Calendario & eventi, Sicurezza & accessi, Campagne | Sigle e percorsi tecnici a schermo: «card #200», «scheda AR-962», «la CI torna rossa», «R265» | ux-designer |

### Il Pannello rilegge tutto ogni minuto · `ricarica-ogni-minuto-che-rilegge-tutto`

| scheda | gravità | pagina | difetto | a chi |
|---|---|---|---|---|
| AR-1109 | minore | Numeri | La pagina ricarica i numeri ogni minuto anche col telefono in tasca, e ogni volta rilegge gli ordini sette volte | frontend-dev |
| AR-1116 | minore | Analisi & report | Letture doppie e in fila, ripetute ogni minuto | frontend-dev |
| AR-1134 | minore | Mercato | Ogni casella aperta ricarica tutto ogni minuto, anche a schermo spento: 7 MB letti due volte, Google interrogato di continuo | frontend-dev |
| AR-1152 | minore | Intelligence | Ogni minuto la scheda Alert rilegge 6 file da GitHub in fila e scarica fino a 10.000 ordini | frontend-dev |
| AR-1154 | minore | Trasversale | Ogni minuto il Pannello rilegge 8 volte la tabella degli ordini fino a 10.000 righe (sospetto: il sito ne restituisce al massimo 1.000) | frontend-dev |
| AR-1156 | minore | Trasversale | Ogni minuto la Home rilegge più volte tutte le tabelle del sito | frontend-dev |

### La modalità di prova mescola numeri finti e veri · `demo-che-mescola-finto-e-vero`

| scheda | gravità | pagina | difetto | a chi |
|---|---|---|---|---|
| AR-1101 | medio | Trasversale | In modalità demo la stessa schermata mescola numeri finti e veri, e le sentinelle preparano azioni sui numeri finti | frontend-dev |
| AR-1111 | minore | Analisi & report | In modalità demo la pagina mescola numeri finti e veri senza dirlo | frontend-dev |
| AR-1140 | minore | Mercato | In modalità demo la Reputazione mostra 143 recensioni ma l'elenco sotto è quello vero, vuoto | frontend-dev |
