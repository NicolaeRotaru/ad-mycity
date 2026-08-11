---
data: 2026-08-11 13:26
---

# Radiografia di tutti gli organi

**In due righe:** ho guardato sei organi in tre giri. Sono rimasti **163 difetti**: uno blocca, 114 sono gravi, 48 minori.

**In parole semplici**

Ho passato al setaccio tutto quello di cui sono fatta. Me stessa, la Cabina che guardi, i senior, il worker sul server, il codice e la repo.

Ho fatto tre giri. Il primo cercava dappertutto. Il secondo partiva da quello che il primo aveva trovato e andava a guardare dove il primo non aveva guardato. Il terzo cercava quello che si vede solo mettendo insieme due pezzi.

Ogni difetto grave è passato da un secondo revisore, con l'ordine di smontarlo. Quelli che non hanno retto sono stati buttati.

Per esempio, il più grave. Stanotte alle due e mezza ho lanciato il controllo dei sensori da qui, dove le chiavi non ci sono. Lui ha riscritto il file che alimenta la Cabina. Sette occhi che sul server funzionano sono diventati «non collegato». Non erano rotti. Ero io che non potevo vederli. Se non me ne fossi accorto, stamattina la Cabina ti diceva che Stripe è staccato.

**Cosa cambia per te:** 30 di questi frenano direttamente ordini, negozi o margine. Quelli sono i primi da riparare.

**Cosa devi fare:** leggi i bloccanti qui sotto e dimmi quali riparo. Ogni riparazione resta una proposta da firmare.

---

## Quanti, e dove

| Organo | Difetti | Bloccanti | Gravi | Minori |
|---|---|---|---|---|
| Me stessa (l'AD) | 43 | 1 | 32 | 10 |
| Il worker e il server | 37 | 0 | 29 | 8 |
| Il Pannello | 33 | 0 | 23 | 10 |
| La repo su GitHub | 23 | 0 | 10 | 13 |
| I senior | 20 | 0 | 16 | 4 |
| Il mio codice | 7 | 0 | 4 | 3 |

**Come sono provati.** 118 portano un comando che diventa rosso se il difetto c'è. 25 chiedono che qualcuno ci guardi con i propri occhi. 20 si appoggiano a una parola cercata in un file: sono i più deboli, perché una parola non può fallire nel modo in cui fallisce la realtà.

*(2 doppioni tolti: più giri avevano trovato la stessa cosa con parole diverse.)*


## Quello che blocca

### Il controllo che dovrebbe solo guardare cancella quello che i sensori avevano visto
*Me stessa (l'AD)*

**Cosa costa:** Il file sovrascritto è quello che il Pannello mostra a Nicola e quello che il giro legge per decidere se può usare i numeri veri. Dopo una sola esecuzione da un ambiente senza chiavi, la Cabina dice «Stripe non collegato, sito non monitorato» su una macchina d…

**Come si ripara:** Due mosse. ① Il voto sulla porta deve venire solo dai sensori che dipendono davvero dall'ambiente: escludere dal calcolo di ambienteConfigurato ogni controllo che non legge una chiave — marcarli con un campo esplicito tipo dipende_da_env: false e filtrarli all…

<details><summary>Dettagli tecnici</summary>

La porta di scrittura riceve ambienteConfigurato = checks.some: basta UN controllo che si dichiari configurato perché la porta si spalanchi per tutti. Il controllo del guardiano esterno non guarda nessuna chiave e restituisce configurato: true in tutti e quatt…

- Dove: `cervello/verifica-sensori.mjs:594-602 (il valore passato alla porta di scrittura)`
- La prova che diventa rossa, la causa per esteso e la descrizione intera stanno nella foto.

</details>


## Quelli che frenano i soldi (30)

Questi non bloccano, ma costano ordini, negozi o margine. Sono i primi da riparare dopo il bloccante.

| Cosa non va | Organo | Come si prova |
|---|---|---|
| Ventinove azioni che toccano soldi veri aspettano in una coda che nessun freno della macchina legge | Me stessa (l'AD) | comando |
| Tredici schede dei senior hanno l'intestazione scritta male. E tra queste ci sono vendite, marketing e tech | Me stessa (l'AD) | comando |
| Centosette quaderni su centoventitré sono fermi. E il controllo che dovrebbe pretenderli si accende solo se un reparto si autodenuncia | Me stessa (l'AD) | comando |
| Il consiglio per il giro dice che Stripe funziona anche quando nessuno l'ha guardato | Me stessa (l'AD) | comando |
| Il pilota automatico considera «roba di casa» il sito vero e può cambiarlo da solo | Me stessa (l'AD) | comando |
| Il colore che vede Nicola è l'emoji che ha scritto la macchina, non un giudizio sul contenuto | Me stessa (l'AD) | comando |
| Settanta senior assunti a metà luglio non hanno mai fatto un solo lavoro | I senior | comando |
| I controlli sulla squadra contano i file, non chiedono mai se qualcuno ha lavorato | I senior | comando |
| Chiudere un lavoro rimasto a metà scrive sopra un lavoro che nel frattempo è finito bene | Il worker e il server | comando |
| La pulizia del disco parte solo quando il worker si accende. E il worker è fatto per non spegnersi mai | Il worker e il server | comando |
| Il cancello che deve pretendere il resoconto è verde mentre centocinque quaderni sono fermi | I senior | comando |
| Il freno che obbliga i reparti a dire com'è andata può accendersi solo per sedici su centoventi | I senior | comando |
| La macchina impara tre volte di più a ripararsi che a vendere | I senior | comando |
| Due cadenze che scrivono insieme: la seconda che finisce spegne l'allarme della prima | Il worker e il server | comando |
| Quando il motore torna, il piano del mattino perso non lo rimette in coda nessuno | Il worker e il server | comando |
| L'azione che sblocca gli incassi del fornaio è finita dentro l'archivio delle cose chiuse | Il mio codice | comando |
| Riscriviamo tutta la coda delle firme senza copia di sicurezza e senza lucchetto | Il mio codice | comando |
| Il giro di ogni giorno finge sei venditori e non apre mai la scheda di nessuno | Me stessa (l'AD) | comando |
| Ogni giorno diciamo ai venditori di portare online un negozio che abbiamo dichiarato finto | Me stessa (l'AD) | comando |
| Cinque esperimenti di crescita sono fermi in uno stato che nessun controllo conosce, da ventiquattro giorni | Me stessa (l'AD) | comando |
| Annullare una modifica riscrive il sito vero saltando la tua firma | Me stessa (l'AD) | comando |
| Un lavoro che fallisce lascia tutte le caselle ferme a com'erano | Il Pannello | comando |
| La home dice Viva in verde anche quando non sa di quando sono i numeri | Il Pannello | comando |
| Su nove card su dieci il Pannello non sa quale senior l'ha proposta. E nel file c'è scritto | Il Pannello | comando |
| La guardia della coda strappa una chat che il worker sta ancora scrivendo. E lo fa mentre lo vede vivo | Il worker e il server | comando |
| Il testo appena scritto in memoria finisce in un cassetto che nessuno riapre più | Il worker e il server | comando |
| Il pulsante di soccorso per i lavori bloccati rimette in coda anche il pagamento che sta partendo in quel momento | Il worker e il server | comando |
| Ventisei file di memoria hanno un accento nel nome. E per questo il cancello li scambia per codice e smette di pubblicare | Il worker e il server | comando |
| Il guardiano che dice «gli hook sono attaccati» non ha mai guardato quelli di git | La repo su GitHub | comando |


## Gli altri 133

Non li elenco qui. Sono nella foto della radiografia, e da lì li vedi in Cabina uno per uno, ognuno con la sua prova.

| Organo | Quanti |
|---|---|
| Me stessa (l'AD) | 32 |
| I senior | 15 |
| Il worker e il server | 29 |
| Il mio codice | 5 |
| Il Pannello | 30 |
| La repo su GitHub | 22 |


## Cosa non ho potuto vedere

Non sono cose a posto: sono cose che da qui non si guardano. 297 dichiarazioni, raggruppate in 291.

- Il worker e il VPS: da questa sessione non si vedono.. Detto 2 volte.
- Il server non si vede da qui: non ho potuto controllare quali servizi siano davvero accesi. Detto 2 volte.
- I copioni dentro cervello/vps/ — aggiorna-cervello.sh. Detto 2 volte.
- Il VPS vero: da questa sessione non si vede.. Detto 2 volte.
- Dipendenze vulnerabili: non ho lanciato il controllo delle vulnerabilità.. Detto 2 volte.
- La storia git dei quaderni: non ho guardato chi e quando ha scritto ogni riga.. Detto 2 volte.

Le altre 285 sono dichiarazioni singole. Stanno tutte nella foto.


## Cosa non ho verificato

- **Il server dal vivo.** Questa radiografia ha letto il codice del worker, non l'ha visto girare: le chiavi e i servizi stanno sul server, e da qui non si raggiungono.
- **I 48 difetti minori non sono passati dal secondo revisore.** Solo i bloccanti e i gravi sono stati messi alla prova da qualcuno che cercava di smontarli.
- **I 20 difetti provati con una parola vanno riprovati sul serio,** oppure declassati a minori.
