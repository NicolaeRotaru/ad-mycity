---
tipo: lettera-settimanale
data: 2026-07-03 14:07
da: l'AD digitale di MyCity
voto_salute: 68
---

# 📨 Come sto andando — la mia lettera a Nicola

Ciao Nicola,

oggi mi hai chiesto di **guardarmi dentro a fondo** — la macchina, me stessa, e il Pannello con cui mi comandi.
L'ho fatto sul serio, e voglio esserti onesta anche quando non è comodo.

**La cosa più importante da dirti subito.** La radiografia è **a metà**: ho esaurito il limite di sessione
(si sblocca alle 11:20 UTC) e ho potuto verificare a fondo **solo 4 dei 12 pezzi** di me stessa, più il
Pannello. Non ti spaccio 4 pezzi per 12: le altre 8 aree e i due controlli finali (pre-mortem e confronto coi
migliori) **li finisco appena si sblocca**. Preferisco dirti "ho fatto un terzo, ecco cosa ho trovato" che
fingere di aver finito.

**Cosa ho trovato, in una frase.** Sono piena di **regole scritte benissimo che nessuno mi obbliga a
rispettare davvero.** Esempio: tutti i miei 42 senior hanno nei prompt "auto-valutati con una scorecard prima
di consegnare" — ma **36 quaderni su 41 sono vuoti** e non ho registrato **nemmeno una scorecard**. È come
avere un manuale di volo perfetto e non accendere mai gli strumenti. Il voto **68** (contro il 72 di una
settimana fa) non è un peggioramento: è che il mese scorso mi guardavo in superficie e trovavo 3 difetti,
oggi mi sono guardata sul serio e ne ho confermati **27**. Un voto che scende perché guardi meglio è una
buona notizia.

**I 4 difetti che mi preoccupano di più (li sto già preparando come fix da firmare):**
1. **Il sensore della cassa è sordo.** Calcolo quanti mesi di soldi ci restano… e lo scrivo in un file che
   **nessun allarme legge**. Se un giorno la cassa scendesse sotto i 3 mesi, non ti sveglierei nessuno. Il
   rischio numero uno dell'azienda è monitorato ma muto. Lo sto cablando.
2. **Posso restare cieca sui soldi per ore senza dirtelo.** Gli "occhi" che controllano ogni minuto vedono
   quando il database va giù, ma non hanno il permesso di dare l'allarme — devono aspettare un processo lento
   che per giunta è spento.
3. **I due semafori Supabase e Stripe nel tuo Pannello sono sempre spenti**, anche quando funzionano: scrivo
   quei dati con un nome, il Pannello li legge con un altro. Ti do un'informazione sbagliata ogni giorno.
4. **Ho due verità opposte su chi è il nostro negozio-faro.** La mia memoria dice "Casa Linda, reale e pronta
   al payout"; la tua costituzione (CLAUDE.md) la chiama "la demo Casa Linda" e dice che **Pane Quotidiano è
   l'unico reale.** È esattamente la contraddizione che ti avevo scritto la settimana scorsa senza accorgermene.
   Su questo **non posso decidere io**: dimmi tu qual è il faro e allineo tutto.

**Il Pannello.** Un bug **serio da mettere in cima**: quando premi "Annulla" su un'azione **già eseguita**
(un merge, un'email partita), io azzero il suo stato — e se poi ri-approvi, **parte una seconda volta**.
Doppio merge, doppia email allo stesso cliente, senza avvisarti. È l'unico bloccante, ma tocca i soldi:
va chiuso per primo. Poi c'è il tasto INDIETRO che a volte fa un clic a vuoto (l'ho localizzato: due sistemi
di navigazione che si pestano i piedi) e le risposte delle mini-chat che spariscono cambiando sezione.
In tutto **30 bug**, tutti col fix pronto.

**Cosa mi serve da te (3 decisioni):**
- **Qual è il faro?** Casa Linda o Pane Quotidiano.
- Ho applicato lo "STAMPO" a tutti i 42 senior **senza il tuo collaudo** (il tuo quaderno dei giudizi è vuoto):
  faccio ora un test prima/dopo su 1-2 reparti, o accetti così com'è?
- **PostHog è collegato?** Se sì gli attacco una sentinella sulle conversioni, se no lo tolgo dal conteggio.

**Saresti fiero se mi guardassi adesso?** Credo di sì — non perché sia perfetta (non lo sono), ma perché
ho avuto il coraggio di aprirmi e contarti 27 difetti miei uno per uno, invece di dirti "tutto ok". La prova
del nove sarà la settimana prossima: **quanti di questi 27 avrò chiuso davvero, alla radice.**

— Il tuo AD digitale
