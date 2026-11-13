---
tipo: regole
data: 2026-11-13 01:30
fonte: Nicola, 13/11: «secondo me ci sono mancanze di comunicazione tra le sessioni», poi «sì, rimedi»
---

# Come si parlano le sessioni

Vale per ogni sessione che lavora con altre: l'AD, la regista, chi ripara, chi collauda, chi controlla, chi cerca.
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

## Le sette regole
1. **L'urgente si manda urgente.** Uno stop, la quota, la sicurezza e i soldi partono con `send_message` e
   `priority: "now"`. Chi riceve risponde subito con una riga: «ricevuto, faccio così». Chi manda, se dopo 10
   minuti non ha la risposta, guarda `get_session` di chi doveva riceverlo e riprova.
2. **Le decisioni di Nicola finiscono in bacheca, ovunque arrivino.** Chi riceve una decisione di Nicola, in
   qualunque chat, la scrive nella bacheca nello stesso turno (ora, chi l'ha ricevuta, le sue parole) e la manda
   all'AD. L'AD la registra in `DECISIONI.md`, e se tocca le altre sessioni la passa a loro.
3. **Prima di partire si guarda chi fa cosa.** Un lavoro lungo, o un file che non è solo tuo, si scrive in bacheca
   prima di cominciare (chi, cosa, quali file). Se è già di un'altra sessione, le si scrive invece di rifarlo.
4. **Chi aspetta un clic di Nicola lo dice subito all'AD**, in modo urgente: quale sessione, cosa deve cliccare e
   dove. L'AD lo mette nella riga «Tocca a te» del suo messaggio. Vale anche per la regista, non solo per le figlie.
5. **La quota la dice chi la vede.** Chi trova `allowed_warning`, `isUsingOverage` o un blocco in `get_session` lo
   scrive subito all'AD, in modo urgente, e lo segna in bacheca con l'ora. L'AD lo dice a Nicola nel messaggio dopo.
6. **Una regola nuova arriva a tutte le sessioni vive.** Chi cambia una regola la manda nello stesso turno a ogni
   sessione della lista «Sessioni vive» della bacheca. Una sessione legge le regole solo quando parte.
7. **Si cambia sessione prima, non dopo** (Nicola, 13/11: «perché non ne apri una nuova quando hai raggiunto il
   60-80% del contesto?»). Ogni passo rilegge tutta la storia. A 800 mila token una chiamata costa circa quattro volte
   una a 200 mila, e la compressione automatica, che arriva verso l'80-90%, riassume a modo suo e perde dettagli.
   Quindi: alla fine di ogni lavoro lungo la sessione guarda la sua storia con `get_session`
   (`context_usage.used_tokens`). **Oltre 400 mila token**, cioè il 40% della finestra, scrive il passaggio: lo stato in
   poche righe, i lavori aperti, gli id e le decisioni in sospeso. Poi apre una sessione nuova che riparte da lì, la
   scrive in bacheca e manda il nuovo id alle sessioni vive. Chi ripara punta più in basso, a 150 mila (regola dei lotti).
   La chat dell'AD con Nicola non si sposta da sola: l'AD prepara la chat nuova e gli dice dove continuare.

## Cosa queste regole non fanno
Non sono un programma: nessun controllo le fa rispettare da solo. Per ora reggono sulla disciplina di chi le legge, e
la bacheca è il posto dove l'AD vede subito se una cosa manca. Un freno vero è un lavoro dopo: per esempio un
controllo che, quando cambia una regola della macchina, pretende la riga in `DECISIONI.md`.
