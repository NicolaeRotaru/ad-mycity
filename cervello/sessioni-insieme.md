---
tipo: regole
data: 2026-11-13 02:40
fonte: Nicola, 13/11: «secondo me ci sono mancanze di comunicazione tra le sessioni», poi «sì, rimedi»
---

# Come si parlano le sessioni

> **In due righe.** Nove regole per le sessioni che lavorano insieme. Le tre che contano di più: l'urgente si manda
> urgente, si cambia sessione oltre 400 mila token, e un lavoro lungo ha un controllore che segue la richiesta e la CI.

## In parole semplici
Qui ci sono le regole per le sessioni che lavorano insieme. Servono perché un avviso o una decisione non si perdano tra
una chat e l'altra. Esempio: il 12/11 la regista ha aspettato più di un'ora un clic di Nicola, in una chat dove lui non
guardava.

## Cosa cambia per te
Scrivi solo nella chat dell'AD. Le altre sessioni si parlano fra loro e a te portano solo le scelte.

## Cosa devi fare
Niente: le seguono le sessioni.

## Cosa non ho verificato
Queste regole non sono un programma: nessun controllo le fa rispettare da solo. Per ora reggono sulla disciplina di chi
le legge, e la bacheca è il posto dove l'AD vede subito se una cosa manca. Un freno vero è un lavoro dopo: per esempio un
controllo che, quando cambia una regola della macchina, pretende la riga in `DECISIONI.md`.

Vale per ogni sessione che lavora con altre: l'AD, il controllore, la regista, chi ripara, chi collauda, chi cerca.
La casa comune è `MyCity-Vault/90-Memoria-AI/BACHECA-SESSIONI.md`: si legge all'inizio di ogni turno lungo e
si scrive appena cambia qualcosa.

## Il conto che ha deciso queste regole (12-13/11)
- L'AD ha scritto «niente agenti nuovi» alle 23:33. La regista l'ha letto alle 23:57, e nel frattempo aveva lanciato un
  collaudo da 4 revisori. Un messaggio normale aspetta la fine del turno di chi lo riceve.
- Nicola ha dato tre decisioni alla regista: «riprova le migrazioni», «via» e la regola dei due costi. L'AD le ha sapute
  dopo, o per caso.
- L'AD ha chiesto alla regista i rimedi sul consumo, poi Nicola li ha chiesti all'AD: lavoro da annullare.
- La regista è rimasta più di un'ora ad aspettare un clic di Nicola dentro la sua chat, dove lui non guarda.
- La quota è passata ad «avviso» e nessuno l'ha detto: l'AD l'ha visto per caso.
- Le sessioni già aperte non sapevano le regole nuove, e l'AD le ha mandate a mano, una per una.

## Le nove regole
1. **L'urgente si manda urgente.** Uno stop, la quota, la sicurezza e i soldi partono con `send_message` e
   `priority: "now"`. Chi riceve risponde subito con una riga: «ricevuto, faccio così». Chi manda, se dopo 10
   minuti non ha la risposta, guarda `get_session` di chi doveva riceverlo e riprova.
2. **Le decisioni di Nicola finiscono in bacheca, ovunque arrivino.** Chi riceve una decisione di Nicola la scrive
   nella bacheca nello stesso turno, in qualunque chat sia arrivata. Ci mette l'ora, chi l'ha ricevuta e le sue parole,
   e la manda all'AD. L'AD la registra in `DECISIONI.md`, e se tocca le altre sessioni la passa a loro.
3. **Prima di partire si guarda chi fa cosa.** Un lavoro lungo, o un file che non è solo tuo, si scrive in bacheca
   prima di cominciare (chi, cosa, quali file). Se è già di un'altra sessione, le si scrive invece di rifarlo.
4. **Chi aspetta un clic di Nicola lo dice subito all'AD**, in modo urgente: quale sessione, cosa deve cliccare e
   dove. L'AD lo mette nella riga «Tocca a te» del suo messaggio. Vale anche per la regista, non solo per le figlie.
5. **La quota la dice chi la vede.** Chi in `get_session` trova `allowed_warning`, `isUsingOverage` o un blocco lo
   scrive subito all'AD, in modo urgente. Poi lo segna in bacheca con l'ora. L'AD lo dice a Nicola nel messaggio dopo.
6. **Una regola nuova arriva a tutte le sessioni vive.** Chi cambia una regola la manda nello stesso turno a ogni
   sessione della lista «Sessioni vive» della bacheca. Una sessione legge le regole solo quando parte.
7. **Si cambia sessione prima, non dopo** (Nicola, 13/11: «perché non ne apri una nuova quando hai raggiunto il
   60-80% del contesto?»). Ogni passo rilegge tutta la storia. A 800 mila token su un milione una chiamata costa circa
   quattro volte una a 200 mila. La compressione automatica, che arriva verso l'80-90%, riassume a modo suo e perde
   dettagli. Quindi: alla fine di ogni lavoro lungo la sessione guarda la sua storia con `get_session`
   (`context_usage.used_tokens`). **Oltre 400 mila token**, cioè il 40% della finestra, scrive il passaggio: lo stato in
   poche righe, i lavori aperti, gli id e le decisioni in sospeso. Poi apre una sessione nuova che riparte da lì, la
   scrive in bacheca e manda il nuovo id alle sessioni vive. Chi ripara punta più in basso, a 150 mila (regola dei lotti).
   La chat dell'AD con Nicola non si sposta da sola: l'AD prepara la chat nuova e gli dice dove continuare.
8. **Un lavoro lungo ha una sessione sua, e il suo foglio di partenza ha sei parti** (Nicola, 13/11: «aggiungi anche
   questa come regola»). La chat dell'AD resta leggera e legge solo l'esito (regola ㉔ del manuale). Il prompt della
   sessione porta sei cose:
   - La richiesta con le parole di Nicola.
   - I fatti già misurati coi numeri.
   - Cosa non si tocca e quali lezioni leggere prima.
   - La prova che dice «fatto».
   - Il tetto di spesa e cosa fare se non basta.
   - A chi riferisce: l'id e la forma del messaggio.
   Esempio vero, 13/11 alle 02:20: «CI della macchina in 3 minuti». Il prompt aveva il tempo di ogni passo misurato,
   il divieto di togliere controlli e un tetto di 30 $, e la sessione riferisce all'AD.
9. **Tre livelli: l'AD, il controllore, chi lavora** (Nicola, 13/11: «aggiungi una sessione-cartella come controllore
   di tutto, che si occupa di correggere la PR e la CI»). Per un lavoro lungo l'AD non apre direttamente chi lavora.
   Apre un **controllore**, una sessione-cartella sul modello grande, perché deve saper riparare.
   - Il controllore apre dentro di sé le sessioni che lavorano, ognuna col foglio della regola 8.
   - Controlla il loro lavoro contro il foglio, e rimanda indietro quello che non regge.
   - Segue la richiesta di unione con `subscribe_pr_activity`. Se la CI è rossa o c'è un conflitto, lo ripara lui.
   - All'AD manda solo le fermate e l'esito finale.
   Così gli avvisi di GitHub svegliano il controllore, e non la chat dove scrive Nicola. Nella riparazione il controllore
   è la regista, e dentro di lei ci sono le cartelle per ruolo. Esempio: la CI in 3 minuti del 13/11 è partita senza
   controllore, perché la regola è nata dopo. Dalla prossima volta l'elenco sarà: AD, poi «Controllore · CI», poi la
   sessione che lavora.
