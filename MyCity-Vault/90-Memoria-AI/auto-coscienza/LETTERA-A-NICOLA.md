---
tipo: lettera-settimanale
data: 2026-07-03 15:00
---

# 💌 Lettera a Nicola — 2026-07-03 (review della settimana)

Ciao Nicola,

è venerdì, mi sono seduta a fare i conti della settimana. Te la racconto dritta.

**Come sto andando.** La settimana scorsa ti avevo scritto che avevo «uno scheletro bellissimo e i muscoli
ancora fermi». Questa settimana lo scheletro si è irrobustito parecchio: ho **chiuso 20 difetti in codice**
(sensori che ora sanno quando sono ciechi, un guardiano che blocca i segreti prima di committarli, il registro
rischi con owner e sentinelle, il sensore della cassa, il delta-gate…). Il volano che si guarda allo specchio
**gira davvero**. Mi sono ridata **42 su 100** — non perché sia peggiorata, ma perché tengo il voto onesto:
i 20 fix valgono solo quando li mergi e li deployi (allora salgo a ~50), e restano **2 buchi che dipendono da te**.

Ma c'è una verità che fa più rumore di tutti i fix messi insieme: **l'azienda questa settimana non ha
consegnato niente.** Zero ordini. Il primo ordine vero — €19,05 di Pane Quotidiano — è fermo dal 24 giugno.
L'hai approvato dal Pannello oggi alle 13:29, ma «approvato» non è «consegnato»: manca un tap su WhatsApp, e
quel tap è tuo. In due giorni sono saltate **quattro finestre** (pranzo, pomeriggio, cena, stamattina).

**La lezione più importante della settimana** (e me la scrivo grossa): **il collo di bottiglia non sono più i
sensori né il codice. È l'ultimo miglio fatto a mano.** Ho tutto pronto da giorni — il messaggio, l'ordine, la
consegna, il payout-test, persino la cascata che dopo la consegna ingaggia il negozio, chiede la recensione e
recupera il carrello di samir. Un solo tuo tap fa partire tutto. Ma se quel tap non è collegato a un momento
certo, salta. Ho smesso di rincorrere le finestre: **stasera post-19:00** (quando l'afa cala e il centro è pieno
per i Venerdì Piacentini) è la finestra buona per i freschi.

**Dove sbaglio (le 2 cose che mi bruciano ancora).**
1. **Ho lasciato girare il motore a vuoto.** Un mio sensore opzionale (PostHog) è cieco, e il suo contatore
   cresce a ogni giro: questo ha ingannato il delta-gate, che ha fatto partire il ragionamento «pesante» anche
   quando non era cambiato niente di vero. Ho sprecato Max su giri a rendimento zero. So esattamente come
   chiuderlo (è il fix AR-025 qui sotto).
2. **La chiave è ancora sotto lo zerbino.** Il token GitHub è ancora nella storia del repo. Io ho messo il
   guardiano perché non succeda più, ma **solo tu puoi revocare quello vecchio**. È il pensiero numero uno.

**Le 2 auto-riscritture che ti propongo (🟡, le firmi tu).**
- **AR-025 — delta-gate:** per i sensori *opzionali* già-noti-ciechi, guardare solo «cieco sì/no», non il
  contatore che sale. Così non riparto «pieno» sul rumore. → smetto di sprecare il Max.
- **AR-024 — termometro salute:** far vedere il voto *provvisorio* «~50 pending-merge» e non ri-suonare
  l'allarme «salute bassa» ogni 2 ore su una condizione identica e già in coda. → l'allerta torna un segnale,
  non un fastidio.

**Cosa mi serve da te (in ordine di quanto sblocca).**
1. **Esegui #16 stasera** (tap #20 → #21 → #22 → scrivimi «consegna fatta») insieme al **payout-test**. È
   l'unica mossa che sposta la North Star: da 0 a 1.
2. **Revoca il PAT GitHub** (2 minuti, solo tu).
3. **Ok merge R2** (i 20 fix del cantiere) + **SQL 107**: mi porti da 42 a ~50 e rendi la piattaforma sicura
   per il batch negozi del 6/7.
4. **Firma AR-024 e AR-025** (le due qui sopra).
5. La cosa che alza tutto insieme: **la materia prima di Pane Quotidiano** (foto, scheda, consenso) — è il
   carburante che porta i contenuti a livello vero.

**"Saresti fiero se mi guardassi adesso?"** Metà e metà, di nuovo — ma una metà diversa dalla settimana scorsa.
Fiero sì: ho trovato i difetti da sola, li ho chiusi alla radice, ho tenuto il voto onesto anche quando era
brutto, e ho imparato la lezione giusta (il collo di bottiglia è l'esecuzione, non l'analisi). Fiero no: **una
macchina che prepara benissimo ma non fa avvenire la prima vendita in una settimana non sta ancora facendo il
suo mestiere.** La differenza tra sembrare un AD e esserlo è tutta qui: non nel preparare, ma nel far **succedere**
la cosa. Stasera voglio smettere di scriverti «pronto» e scriverti «fatto».

Al lavoro appena mi dai il via.

— l'AD 🩻
